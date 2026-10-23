#!/usr/bin/env python3
"""EJU 冲刺工作台 · 学习小组同步服务（Python 标准库 + SQLite，无第三方依赖）

A small group (e.g. two people studying together) shares one study progress and
sees each other's whiteboard layers live.

Data model: an event log per group. Every change the browser makes is an event
{kind, key, at, payload}:
  - "replaceable" kinds (progress, bookmark, task, stroke): the server keeps only
    the newest event per (kind, key); an older `at` never overwrites a newer one
  - "append" kinds (history, mock): kept once per key (idempotent re-sends)
Clients pull everything after their cursor (`seq`) and then hold a streaming
connection (Server-Sent Events) that pushes new events plus ephemeral "live"
messages (in-progress pen strokes, pointer position, which question is open).

Endpoints (JSON; auth with `Authorization: Bearer <member token>`):
  POST /api/v2/groups   {groupName, memberName}        -> create group, first member
  POST /api/v2/join     {inviteCode, memberName}       -> join an existing group
  GET  /api/v2/me                                      -> me, group, members, invite code
  GET  /api/v2/events?since=SEQ                        -> events after SEQ
  POST /api/v2/events   {events: [...]}                -> store + broadcast
  POST /api/v2/live     {payload}                      -> broadcast only, not stored
  GET  /api/v2/stream?since=SEQ                        -> SSE: backlog, then live push
  GET  /api/v2/health
  GET  /api/v2/ping-stream                             -> SSE test for check.html: a ping every 3 s for 60 s

Configuration (environment variables):
  EJU_SYNC_DB          SQLite file            (default ./eju_sync.db)
  EJU_SYNC_HOST/PORT   listen address         (default 127.0.0.1:8787)
  EJU_SYNC_MAX_MEMBERS members per group      (default 4)
  EJU_STATIC_DIR       also serve the site from this directory (optional)
"""
import hashlib
import json
import mimetypes
import os
import queue
import secrets
import sqlite3
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

DB_PATH = os.environ.get('EJU_SYNC_DB', 'eju_sync.db')
HOST = os.environ.get('EJU_SYNC_HOST', '127.0.0.1')
PORT = int(os.environ.get('EJU_SYNC_PORT', '8787'))
MAX_MEMBERS = int(os.environ.get('EJU_SYNC_MAX_MEMBERS', '4'))
STATIC_DIR = os.environ.get('EJU_STATIC_DIR')

MAX_BODY = 2 * 1024 * 1024
MAX_EVENTS_PER_POST = 500
HEARTBEAT_SECONDS = 15
PING_STREAM = threading.BoundedSemaphore(10)  # check.html connection tests; no auth, so keep them few

REPLACEABLE_KINDS = {'progress', 'bookmark', 'task', 'stroke'}
APPEND_KINDS = {'history', 'mock'}
KINDS = REPLACEABLE_KINDS | APPEND_KINDS

SCHEMA = """
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  key TEXT NOT NULL,
  member_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  payload TEXT NOT NULL,
  UNIQUE (group_id, kind, key)
);
CREATE INDEX IF NOT EXISTS events_group_seq ON events (group_id, seq);
"""


class ApiError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


def now_ms():
    return int(time.time() * 1000)


def hash_token(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def clean_name(value, field, max_len=24):
    name = str(value or '').strip()
    if not name:
        raise ApiError(HTTPStatus.BAD_REQUEST, f'{field} 不能为空')
    return name[:max_len]


class Store:
    """SQLite access behind one lock; fine for a handful of members."""

    def __init__(self, path):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.executescript(SCHEMA)
        self.lock = threading.Lock()

    def create_group(self, group_name, member_name):
        group_id = 'g_' + secrets.token_urlsafe(9)
        member_id = 'm_' + secrets.token_urlsafe(9)
        invite = secrets.token_urlsafe(9)
        token = secrets.token_urlsafe(32)
        with self.lock, self.db:
            self.db.execute('INSERT INTO groups VALUES (?, ?, ?, ?)', (group_id, group_name, invite, now_ms()))
            self.db.execute('INSERT INTO members VALUES (?, ?, ?, ?, ?)',
                            (member_id, group_id, member_name, hash_token(token), now_ms()))
        return token

    def join_group(self, invite_code, member_name):
        token = secrets.token_urlsafe(32)
        with self.lock, self.db:
            group = self.db.execute('SELECT id FROM groups WHERE invite_code = ?', (invite_code,)).fetchone()
            if not group:
                raise ApiError(HTTPStatus.NOT_FOUND, '邀请码不存在')
            count = self.db.execute('SELECT COUNT(*) FROM members WHERE group_id = ?', (group['id'],)).fetchone()[0]
            if count >= MAX_MEMBERS:
                raise ApiError(HTTPStatus.CONFLICT, f'小组已满（最多 {MAX_MEMBERS} 人）')
            self.db.execute('INSERT INTO members VALUES (?, ?, ?, ?, ?)',
                            ('m_' + secrets.token_urlsafe(9), group['id'], member_name, hash_token(token), now_ms()))
        return token

    def member_for_token(self, token):
        with self.lock:
            row = self.db.execute(
                'SELECT m.id, m.name, m.group_id, g.name AS group_name, g.invite_code '
                'FROM members m JOIN groups g ON g.id = m.group_id WHERE m.token_hash = ?',
                (hash_token(token),)).fetchone()
        return dict(row) if row else None

    def members(self, group_id):
        with self.lock:
            rows = self.db.execute('SELECT id, name FROM members WHERE group_id = ? ORDER BY created_at',
                                   (group_id,)).fetchall()
        return [dict(r) for r in rows]

    def events_since(self, group_id, since, limit=5000):
        with self.lock:
            rows = self.db.execute(
                'SELECT seq, kind, key, member_id, at, payload FROM events '
                'WHERE group_id = ? AND seq > ? ORDER BY seq LIMIT ?', (group_id, since, limit)).fetchall()
        return [row_to_event(r) for r in rows]

    def max_seq(self, group_id):
        with self.lock:
            return self.db.execute('SELECT COALESCE(MAX(seq), 0) FROM events WHERE group_id = ?',
                                   (group_id,)).fetchone()[0]

    def add_events(self, member, events):
        """Store events; returns the ones actually written (to broadcast)."""
        stored = []
        with self.lock, self.db:
            for ev in events:
                kind, key, at, payload = ev['kind'], ev['key'], ev['at'], ev['payload']
                existing = self.db.execute('SELECT seq, at FROM events WHERE group_id = ? AND kind = ? AND key = ?',
                                           (member['group_id'], kind, key)).fetchone()
                if existing:
                    if kind in APPEND_KINDS or existing['at'] > at:
                        continue
                    self.db.execute('DELETE FROM events WHERE seq = ?', (existing['seq'],))
                cur = self.db.execute(
                    'INSERT INTO events (group_id, kind, key, member_id, at, payload) VALUES (?, ?, ?, ?, ?, ?)',
                    (member['group_id'], kind, key, member['id'], at, json.dumps(payload, ensure_ascii=False)))
                stored.append({'seq': cur.lastrowid, 'kind': kind, 'key': key,
                               'member': member['id'], 'at': at, 'payload': payload})
        return stored


def row_to_event(r):
    return {'seq': r['seq'], 'kind': r['kind'], 'key': r['key'], 'member': r['member_id'],
            'at': r['at'], 'payload': json.loads(r['payload'])}


def validate_event(ev, member):
    if not isinstance(ev, dict):
        raise ApiError(HTTPStatus.BAD_REQUEST, 'event must be an object')
    kind, key = ev.get('kind'), ev.get('key')
    if kind not in KINDS:
        raise ApiError(HTTPStatus.BAD_REQUEST, f'unknown kind: {kind}')
    if not isinstance(key, str) or not key or len(key) > 200:
        raise ApiError(HTTPStatus.BAD_REQUEST, 'bad key')
    at = ev.get('at')
    if not isinstance(at, int):
        raise ApiError(HTTPStatus.BAD_REQUEST, 'bad at')
    # Whiteboard layers are personal: only the author may write strokes under their member id
    if kind == 'stroke' and key.split('|')[1:2] != [member['id']]:
        raise ApiError(HTTPStatus.FORBIDDEN, 'can only write your own whiteboard layer')
    return {'kind': kind, 'key': key, 'at': at, 'payload': ev.get('payload')}


class Hub:
    """Fan-out of events to the open streams of each group."""

    def __init__(self):
        self.lock = threading.Lock()
        self.subs = {}

    def subscribe(self, group_id):
        q = queue.Queue(maxsize=2000)
        with self.lock:
            self.subs.setdefault(group_id, set()).add(q)
        return q

    def unsubscribe(self, group_id, q):
        with self.lock:
            self.subs.get(group_id, set()).discard(q)

    def publish(self, group_id, message):
        with self.lock:
            targets = list(self.subs.get(group_id, ()))
        for q in targets:
            try:
                q.put_nowait(message)
            except queue.Full:
                pass  # a stalled client reconnects and catches up from its cursor


STORE = None
HUB = Hub()


class Handler(BaseHTTPRequestHandler):
    server_version = 'EJUSync/1.0'
    protocol_version = 'HTTP/1.1'

    def log_message(self, fmt, *args):
        # Keep tokens and bodies out of the logs; method + path is enough
        if os.environ.get('EJU_SYNC_QUIET') != '1':
            super().log_message('%s', f'{self.command} {urlparse(self.path).path} -> {args[1] if len(args) > 1 else ""}')

    # ─── helpers ───
    def send_json(self, status, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get('Content-Length') or 0)
        if length > MAX_BODY:
            raise ApiError(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, 'body too large')
        raw = self.rfile.read(length) if length else b''
        try:
            return json.loads(raw or b'{}')
        except json.JSONDecodeError:
            raise ApiError(HTTPStatus.BAD_REQUEST, 'invalid JSON')

    def auth(self):
        header = self.headers.get('Authorization', '')
        token = header[7:].strip() if header.startswith('Bearer ') else ''
        member = STORE.member_for_token(token) if token else None
        if not member:
            raise ApiError(HTTPStatus.UNAUTHORIZED, '登录已失效，请重新加入小组')
        return member

    def me_payload(self, member):
        return {'member': {'id': member['id'], 'name': member['name']},
                'group': {'id': member['group_id'], 'name': member['group_name'], 'inviteCode': member['invite_code']},
                'members': STORE.members(member['group_id'])}

    # ─── routing ───
    def do_GET(self):
        self.dispatch('GET')

    def do_POST(self):
        self.dispatch('POST')

    def dispatch(self, method):
        url = urlparse(self.path)
        if not url.path.startswith('/api/v2/'):
            if method == 'GET' and STATIC_DIR:
                return self.serve_static(url.path)
            return self.send_json(HTTPStatus.NOT_FOUND, {'error': 'not found'})
        route = (method, url.path[len('/api/v2'):])
        try:
            if route == ('GET', '/health'):
                return self.send_json(HTTPStatus.OK, {'ok': True})
            if route == ('GET', '/ping-stream'):
                return self.ping_stream()
            if route == ('POST', '/groups'):
                body = self.read_json()
                token = STORE.create_group(clean_name(body.get('groupName'), '小组名'),
                                           clean_name(body.get('memberName'), '昵称'))
                return self.send_json(HTTPStatus.OK, {'token': token, **self.me_payload(STORE.member_for_token(token))})
            if route == ('POST', '/join'):
                body = self.read_json()
                token = STORE.join_group(str(body.get('inviteCode') or '').strip(), clean_name(body.get('memberName'), '昵称'))
                member = STORE.member_for_token(token)
                HUB.publish(member['group_id'], {'type': 'members', 'members': STORE.members(member['group_id'])})
                return self.send_json(HTTPStatus.OK, {'token': token, **self.me_payload(member)})

            member = self.auth()
            if route == ('GET', '/me'):
                return self.send_json(HTTPStatus.OK, self.me_payload(member))
            if route == ('GET', '/events'):
                since = int(parse_qs(url.query).get('since', ['0'])[0] or 0)
                events = STORE.events_since(member['group_id'], since)
                return self.send_json(HTTPStatus.OK, {'events': events, 'maxSeq': STORE.max_seq(member['group_id'])})
            if route == ('POST', '/events'):
                body = self.read_json()
                events = body.get('events')
                if not isinstance(events, list) or len(events) > MAX_EVENTS_PER_POST:
                    raise ApiError(HTTPStatus.BAD_REQUEST, f'events must be a list of at most {MAX_EVENTS_PER_POST}')
                stored = STORE.add_events(member, [validate_event(e, member) for e in events])
                if stored:
                    HUB.publish(member['group_id'], {'type': 'events', 'events': stored})
                return self.send_json(HTTPStatus.OK, {'stored': len(stored), 'maxSeq': STORE.max_seq(member['group_id'])})
            if route == ('POST', '/live'):
                body = self.read_json()
                HUB.publish(member['group_id'], {'type': 'live', 'member': member['id'],
                                                 'device': str(body.get('device') or '')[:40],
                                                 'payload': body.get('payload')})
                return self.send_json(HTTPStatus.OK, {'ok': True})
            if route == ('GET', '/stream'):
                since = int(parse_qs(url.query).get('since', ['0'])[0] or 0)
                return self.stream(member, since)
            raise ApiError(HTTPStatus.NOT_FOUND, 'not found')
        except ApiError as err:
            self.send_json(err.status, {'error': err.message})
        except (BrokenPipeError, ConnectionResetError):
            pass

    # ─── Server-Sent Events ───
    def stream(self, member, since):
        q = HUB.subscribe(member['group_id'])
        try:
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Accel-Buffering', 'no')  # nginx: do not buffer this response
            self.send_header('Connection', 'close')
            self.end_headers()
            self.close_connection = True
            # Backlog first (subscribed before reading, so nothing falls in the gap)
            while True:
                backlog = STORE.events_since(member['group_id'], since, limit=1000)
                if not backlog:
                    break
                self.send_sse({'type': 'events', 'events': backlog})
                since = backlog[-1]['seq']
            self.send_sse({'type': 'ready', 'maxSeq': since, 'members': STORE.members(member['group_id'])})
            while True:
                try:
                    msg = q.get(timeout=HEARTBEAT_SECONDS)
                except queue.Empty:
                    self.wfile.write(b': ping\n\n')
                    self.wfile.flush()
                    continue
                self.send_sse(msg)
        except (BrokenPipeError, ConnectionResetError, TimeoutError, OSError):
            pass
        finally:
            HUB.unsubscribe(member['group_id'], q)

    def ping_stream(self):
        if not PING_STREAM.acquire(blocking=False):
            raise ApiError(HTTPStatus.TOO_MANY_REQUESTS, '测试连接太多，稍后再试')
        try:
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Accel-Buffering', 'no')
            self.send_header('Connection', 'close')
            self.end_headers()
            self.close_connection = True
            for i in range(21):
                self.send_sse({'type': 'ping', 'n': i, 'at': now_ms()})
                if i < 20:
                    time.sleep(3)
        except (BrokenPipeError, ConnectionResetError, TimeoutError, OSError):
            pass
        finally:
            PING_STREAM.release()

    def send_sse(self, obj):
        data = json.dumps(obj, ensure_ascii=False)
        self.wfile.write(f'data: {data}\n\n'.encode('utf-8'))
        self.wfile.flush()

    # ─── optional static site (local testing / single-process deploy) ───
    def serve_static(self, path):
        root = Path(STATIC_DIR).resolve()
        target = (root / path.lstrip('/')).resolve()
        if target.is_dir():
            target = target / 'index.html'
        if root not in target.parents and target != root or not target.is_file():
            return self.send_json(HTTPStatus.NOT_FOUND, {'error': 'not found'})
        body = target.read_bytes()
        ctype = mimetypes.guess_type(target.name)[0] or 'application/octet-stream'
        if target.suffix in ('.js', '.mjs'):
            ctype = 'text/javascript'
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', ctype + ('; charset=utf-8' if ctype.startswith('text/') else ''))
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def make_server(host=HOST, port=PORT, db_path=DB_PATH):
    global STORE
    STORE = Store(db_path)
    server = ThreadingHTTPServer((host, port), Handler)
    server.daemon_threads = True
    return server


def main():
    server = make_server()
    print(f'EJU sync server on http://{HOST}:{PORT}  db={DB_PATH}' + (f'  static={STATIC_DIR}' if STATIC_DIR else ''))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
