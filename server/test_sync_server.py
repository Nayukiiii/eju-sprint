"""Tests for eju_sync_server.py — run: python3 -m unittest server/test_sync_server.py"""
import http.client
import json
import os
import sys
import tempfile
import threading
import unittest

os.environ['EJU_SYNC_QUIET'] = '1'
sys.path.insert(0, os.path.dirname(__file__))
import eju_sync_server as srv  # noqa: E402


class SyncServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.server = srv.make_server('127.0.0.1', 0, os.path.join(cls.tmp.name, 't.db'))
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.tmp.cleanup()

    def call(self, method, path, body=None, token=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        conn.request(method, path, json.dumps(body) if body is not None else None, headers)
        res = conn.getresponse()
        data = json.loads(res.read() or b'{}')
        conn.close()
        return res.status, data

    def make_pair(self):
        status, a = self.call('POST', '/api/v2/groups', {'groupName': '冲刺小队', 'memberName': 'A'})
        self.assertEqual(status, 200)
        status, b = self.call('POST', '/api/v2/join', {'inviteCode': a['group']['inviteCode'], 'memberName': 'B'})
        self.assertEqual(status, 200)
        return a, b

    def test_create_join_and_me(self):
        a, b = self.make_pair()
        self.assertEqual(a['group']['id'], b['group']['id'])
        status, me = self.call('GET', '/api/v2/me', token=b['token'])
        self.assertEqual(status, 200)
        self.assertEqual([m['name'] for m in me['members']], ['A', 'B'])

    def test_auth_required(self):
        status, _ = self.call('GET', '/api/v2/me')
        self.assertEqual(status, 401)
        status, _ = self.call('GET', '/api/v2/me', token='nope')
        self.assertEqual(status, 401)

    def test_bad_invite_and_member_limit(self):
        status, _ = self.call('POST', '/api/v2/join', {'inviteCode': 'x', 'memberName': 'C'})
        self.assertEqual(status, 404)
        a, _ = self.make_pair()
        for name in ('C', 'D'):
            self.assertEqual(self.call('POST', '/api/v2/join', {'inviteCode': a['group']['inviteCode'], 'memberName': name})[0], 200)
        self.assertEqual(self.call('POST', '/api/v2/join', {'inviteCode': a['group']['inviteCode'], 'memberName': 'E'})[0], 409)

    def test_shared_progress_last_write_wins_by_time(self):
        a, b = self.make_pair()
        ev = lambda at, box: {'kind': 'progress', 'key': 'trt-001', 'at': at, 'payload': {'box': box}}
        self.call('POST', '/api/v2/events', {'events': [ev(2000, 3)]}, a['token'])
        # An older change arriving later (e.g. from an offline phone) must not win
        self.call('POST', '/api/v2/events', {'events': [ev(1000, 1)]}, b['token'])
        _, res = self.call('GET', '/api/v2/events?since=0', token=b['token'])
        progress = [e for e in res['events'] if e['kind'] == 'progress']
        self.assertEqual(len(progress), 1)
        self.assertEqual(progress[0]['payload'], {'box': 3})
        # A newer one replaces it and gets a new seq (so cursors pick it up)
        old_seq = progress[0]['seq']
        self.call('POST', '/api/v2/events', {'events': [ev(3000, 4)]}, b['token'])
        _, res = self.call('GET', f'/api/v2/events?since={old_seq}', token=a['token'])
        self.assertEqual([e['payload'] for e in res['events']], [{'box': 4}])

    def test_history_is_append_only_and_idempotent(self):
        a, _ = self.make_pair()
        h = {'kind': 'history', 'key': 'h1', 'at': 1, 'payload': {'id': 'trt-001'}}
        self.call('POST', '/api/v2/events', {'events': [h, h]}, a['token'])
        status, res = self.call('POST', '/api/v2/events', {'events': [dict(h, at=5)]}, a['token'])
        self.assertEqual(res['stored'], 0)
        _, res = self.call('GET', '/api/v2/events?since=0', token=a['token'])
        self.assertEqual(len([e for e in res['events'] if e['kind'] == 'history']), 1)

    def test_whiteboard_layer_belongs_to_author(self):
        a, b = self.make_pair()
        a_id = a['member']['id']
        own = {'kind': 'stroke', 'key': f'real-2025-4|{a_id}|s1', 'at': 1, 'payload': {'stroke': {'id': 's1'}}}
        self.assertEqual(self.call('POST', '/api/v2/events', {'events': [own]}, a['token'])[0], 200)
        # B may not write into A's layer
        self.assertEqual(self.call('POST', '/api/v2/events', {'events': [own]}, b['token'])[0], 403)

    def test_rejects_unknown_kind(self):
        a, _ = self.make_pair()
        status, _ = self.call('POST', '/api/v2/events', {'events': [{'kind': 'x', 'key': 'k', 'at': 1}]}, a['token'])
        self.assertEqual(status, 400)

    def test_stream_backlog_then_live_push(self):
        a, b = self.make_pair()
        self.call('POST', '/api/v2/events', {'events': [{'kind': 'bookmark', 'key': 'trt-002', 'at': 1, 'payload': {'on': True}}]}, a['token'])
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        conn.request('GET', '/api/v2/stream?since=0', headers={'Authorization': f"Bearer {b['token']}"})
        res = conn.getresponse()
        self.assertEqual(res.status, 200)
        self.assertIn('text/event-stream', res.getheader('Content-Type'))

        def next_message():
            while True:
                line = res.fp.readline().decode('utf-8')
                if line.startswith('data: '):
                    return json.loads(line[6:])

        first = next_message()
        self.assertEqual(first['type'], 'events')
        self.assertEqual(first['events'][0]['key'], 'trt-002')
        self.assertEqual(next_message()['type'], 'ready')
        # Live: a stored event and an ephemeral message both arrive immediately
        self.call('POST', '/api/v2/events', {'events': [{'kind': 'task', 'key': '2026-10-22|readKp', 'at': 2, 'payload': {'value': True}}]}, a['token'])
        self.assertEqual(next_message()['events'][0]['kind'], 'task')
        self.call('POST', '/api/v2/live', {'device': 'd1', 'payload': {'t': 'pointer', 'x': 1}}, a['token'])
        live = next_message()
        self.assertEqual((live['type'], live['member'], live['payload']['t']), ('live', a['member']['id'], 'pointer'))
        conn.close()


if __name__ == '__main__':
    unittest.main()
