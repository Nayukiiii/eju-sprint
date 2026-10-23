#!/usr/bin/env python3
"""EJU 冲刺工作台 · 学习小组同步服务（Python 标准库 + SQLite，无第三方依赖）

A small group shares one study progress and sees each other's whiteboard layers live.
Members are students (they study; progress belongs to them) or teachers (they explain and
see the students' progress, but never write progress of their own).

Data model: an event log per group. Every change the browser makes is an event
{kind, key, at, payload}:
  - "replaceable" kinds (progress, bookmark, task, stroke): the server keeps only
    the newest event per (kind, key); an older `at` never overwrites a newer one
  - "append" kinds (history, mock): kept once per key (idempotent re-sends)
Clients pull everything after their cursor (`seq`) and then hold a streaming
connection (Server-Sent Events) that pushes new events plus ephemeral "live"
messages (in-progress pen strokes, pointer position, which question is open).

Endpoints (JSON; auth with `Authorization: Bearer <member token>`):
  POST /api/v2/groups   {groupName, memberName, role?} -> create group, first member (role: student|teacher)
  POST /api/v2/join     {inviteCode, memberName}       -> join; the student or teacher invite code sets the role
  GET  /api/v2/me                                      -> me, group, members, invite codes
  POST /api/v2/role     {role}                         -> change my own role (someone who joined with the wrong link)
  GET  /api/v2/events?since=SEQ                        -> events after SEQ
  POST /api/v2/events   {events: [...]}                -> store + broadcast
  POST /api/v2/live     {payload}                      -> broadcast only, not stored
  GET  /api/v2/stream?since=SEQ                        -> SSE: backlog, then live push
  GET  /api/v2/health
  GET  /api/v2/ping-stream                             -> SSE test for check.html: a ping every 3 s for 60 s
  POST /api/v2/files    (raw image body)               -> store a homework photo, returns {url}
  GET  /api/v2/files/ID                                -> the photo (IDs are unguessable; <img> cannot send a token)
  GET  /api/v2/notifications?since=ID                  -> homework notices for a bot (header X-Bot-Token)

Homework is carried by the same event log: the teacher writes `assignment` and `grade`
events, the student writes `submission` events. New / submitted / graded homework also
becomes a short text notice that a chat bot (ATRI) can poll.

Configuration (environment variables):
  EJU_SYNC_DB          SQLite file            (default ./eju_sync.db)
  EJU_SYNC_HOST/PORT   listen address         (default 127.0.0.1:8787)
  EJU_SYNC_MAX_MEMBERS members per group      (default 4)
  EJU_STATIC_DIR       also serve the site from this directory (optional)
  EJU_SYNC_FILES       homework photo directory (default: `files` next to the database)
  EJU_BOT_TOKEN        token a bot sends as X-Bot-Token to read /notifications (unset = disabled)
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
FILES_DIR = os.environ.get('EJU_SYNC_FILES')  # resolved in make_server (defaults next to the DB)
BOT_TOKEN = os.environ.get('EJU_BOT_TOKEN', '')

MAX_BODY = 2 * 1024 * 1024
MAX_FILE = 6 * 1024 * 1024
IMAGE_TYPES = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp'}
MAX_EVENTS_PER_POST = 500
HEARTBEAT_SECONDS = 15
PING_STREAM = threading.BoundedSemaphore(10)  # check.html connection tests; no auth, so keep them few

REPLACEABLE_KINDS = {'progress', 'bookmark', 'task', 'stroke', 'langhelp', 'lesson', 'page',
                     'assignment', 'submission', 'grade'}
APPEND_KINDS = {'history', 'mock'}
KINDS = REPLACEABLE_KINDS | APPEND_KINDS
# A student's own study record; a teacher's browser must never overwrite it
STUDENT_ONLY_KINDS = {'progress', 'task', 'history', 'mock', 'langhelp', 'submission'}
TEACHER_ONLY_KINDS = {'assignment', 'grade'}
ROLES = ('student', 'teacher')

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
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  text TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  ctype TEXT NOT NULL,
  size INTEGER NOT NULL,
  at INTEGER NOT NULL
);
"""

# Columns added after the first release; applied to existing databases on start
MIGRATIONS = [
    ('members', 'role', "ALTER TABLE members ADD COLUMN role TEXT NOT NULL DEFAULT 'student'"),
    ('groups', 'teacher_invite', 'ALTER TABLE groups ADD COLUMN teacher_invite TEXT'),
]


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
        self.migrate()
        self.lock = threading.Lock()

    def migrate(self):
        with self.db:
            for table, column, sql in MIGRATIONS:
                cols = [r['name'] for r in self.db.execute(f'PRAGMA table_info({table})')]
                if column not in cols:
                    self.db.execute(sql)
            for row in self.db.execute('SELECT id FROM groups WHERE teacher_invite IS NULL').fetchall():
                self.db.execute('UPDATE groups SET teacher_invite = ? WHERE id = ?', (secrets.token_urlsafe(9), row['id']))

    def create_group(self, group_name, member_name, role='student'):
        group_id = 'g_' + secrets.token_urlsafe(9)
        member_id = 'm_' + secrets.token_urlsafe(9)
        token = secrets.token_urlsafe(32)
        with self.lock, self.db:
            self.db.execute('INSERT INTO groups (id, name, invite_code, created_at, teacher_invite) VALUES (?, ?, ?, ?, ?)',
                            (group_id, group_name, secrets.token_urlsafe(9), now_ms(), secrets.token_urlsafe(9)))
            self.db.execute('INSERT INTO members (id, group_id, name, token_hash, created_at, role) VALUES (?, ?, ?, ?, ?, ?)',
                            (member_id, group_id, member_name, hash_token(token), now_ms(), role))
        return token

    def join_group(self, invite_code, member_name):
        token = secrets.token_urlsafe(32)
        with self.lock, self.db:
            group = self.db.execute('SELECT id, invite_code FROM groups WHERE invite_code = ? OR teacher_invite = ?',
                                    (invite_code, invite_code)).fetchone()
            if not group:
                raise ApiError(HTTPStatus.NOT_FOUND, '邀请码不存在')
            count = self.db.execute('SELECT COUNT(*) FROM members WHERE group_id = ?', (group['id'],)).fetchone()[0]
            if count >= MAX_MEMBERS:
                raise ApiError(HTTPStatus.CONFLICT, f'小组已满（最多 {MAX_MEMBERS} 人）')
            role = 'student' if group['invite_code'] == invite_code else 'teacher'
            self.db.execute('INSERT INTO members (id, group_id, name, token_hash, created_at, role) VALUES (?, ?, ?, ?, ?, ?)',
                            ('m_' + secrets.token_urlsafe(9), group['id'], member_name, hash_token(token), now_ms(), role))
        return token

    def member_for_token(self, token):
        with self.lock:
            row = self.db.execute(
                'SELECT m.id, m.name, m.role, m.group_id, g.name AS group_name, g.invite_code, g.teacher_invite '
                'FROM members m JOIN groups g ON g.id = m.group_id WHERE m.token_hash = ?',
                (hash_token(token),)).fetchone()
        return dict(row) if row else None

    def set_role(self, member_id, role):
        with self.lock, self.db:
            self.db.execute('UPDATE members SET role = ? WHERE id = ?', (role, member_id))

    def members(self, group_id):
        with self.lock:
            rows = self.db.execute('SELECT id, name, role FROM members WHERE group_id = ? ORDER BY created_at',
                                   (group_id,)).fetchall()
        return [dict(r) for r in rows]

    def events_since(self, group_id, since, limit=5000):
        with self.lock:
            rows = self.db.execute(
                'SELECT seq, kind, key, member_id, at, payload FROM events '
                'WHERE group_id = ? AND seq > ? ORDER BY seq LIMIT ?', (group_id, since, limit)).fetchall()
        return [row_to_event(r) for r in rows]

    def add_notice(self, group_id, text):
        with self.lock, self.db:
            self.db.execute('INSERT INTO notices (group_id, at, text) VALUES (?, ?, ?)', (group_id, now_ms(), text))

    def notices_since(self, since, limit=100):
        with self.lock:
            rows = self.db.execute(
                'SELECT n.id, n.at, n.text, g.name AS group_name FROM notices n JOIN groups g ON g.id = n.group_id '
                'WHERE n.id > ? ORDER BY n.id LIMIT ?', (since, limit)).fetchall()
        return [dict(r) for r in rows]

    def previous_payload(self, group_id, kind, key):
        with self.lock:
            row = self.db.execute('SELECT payload FROM events WHERE group_id = ? AND kind = ? AND key = ?',
                                  (group_id, kind, key)).fetchone()
        return json.loads(row['payload']) if row else None

    def add_file(self, file_id, member, ctype, size):
        with self.lock, self.db:
            self.db.execute('INSERT INTO files VALUES (?, ?, ?, ?, ?, ?)',
                            (file_id, member['group_id'], member['id'], ctype, size, now_ms()))

    def file_type(self, file_id):
        with self.lock:
            row = self.db.execute('SELECT ctype FROM files WHERE id = ?', (file_id,)).fetchone()
        return row['ctype'] if row else None

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
    if kind in STUDENT_ONLY_KINDS and member['role'] == 'teacher':
        raise ApiError(HTTPStatus.FORBIDDEN, '讲课的一方不能修改学习进度')
    if kind in TEACHER_ONLY_KINDS and member['role'] != 'teacher':
        raise ApiError(HTTPStatus.FORBIDDEN, '只有讲课的一方能布置和批改作业')
    return {'kind': kind, 'key': key, 'at': at, 'payload': ev.get('payload')}


def homework_notice(member, ev, previous):
    """A one-line notice for a homework change worth telling someone about, else None."""
    p = ev['payload'] if isinstance(ev['payload'], dict) else {}
    prev = previous if isinstance(previous, dict) else {}
    title = str(p.get('title') or prev.get('title') or '作业')[:40]
    name = member['name']
    if ev['kind'] == 'assignment' and not previous and not p.get('deleted'):
        due = f"，截止 {p['dueText']}" if p.get('dueText') else ''
        return f"{name} 布置了新作业「{title}」（{len(p.get('items') or [])} 题{due}）"
    if ev['kind'] == 'submission' and p.get('submittedAt') and p.get('submittedAt') != prev.get('submittedAt'):
        again = '订正后重新' if p.get('round', 1) > 1 else ''
        return f"{name} {again}提交了作业「{title}」"
    if ev['kind'] == 'grade' and p.get('returnedAt') and p.get('returnedAt') != prev.get('returnedAt'):
        score = f"：{p['summary']}" if p.get('summary') else ''
        return f"{name} 批改完了作业「{title}」{score}"
    return None


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
        if self.close_connection:
            self.send_header('Connection', 'close')
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
        return {'member': {'id': member['id'], 'name': member['name'], 'role': member['role']},
                'group': {'id': member['group_id'], 'name': member['group_name'], 'inviteCode': member['invite_code'],
                          'teacherInviteCode': member['teacher_invite']},
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
            if method == 'GET' and route[1].startswith('/files/'):
                return self.serve_file(route[1][len('/files/'):])
            if route == ('GET', '/notifications'):
                if not BOT_TOKEN or not secrets.compare_digest(self.headers.get('X-Bot-Token', ''), BOT_TOKEN):
                    raise ApiError(HTTPStatus.UNAUTHORIZED, 'bad bot token')
                since = int(parse_qs(url.query).get('since', ['0'])[0] or 0)
                return self.send_json(HTTPStatus.OK, {'notices': STORE.notices_since(since)})
            if route == ('POST', '/groups'):
                body = self.read_json()
                role = body.get('role') or 'student'
                if role not in ROLES:
                    raise ApiError(HTTPStatus.BAD_REQUEST, 'role must be student or teacher')
                token = STORE.create_group(clean_name(body.get('groupName'), '小组名'),
                                           clean_name(body.get('memberName'), '昵称'), role)
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
            if route == ('POST', '/role'):
                role = self.read_json().get('role')
                if role not in ROLES:
                    raise ApiError(HTTPStatus.BAD_REQUEST, 'role must be student or teacher')
                STORE.set_role(member['id'], role)
                HUB.publish(member['group_id'], {'type': 'members', 'members': STORE.members(member['group_id'])})
                return self.send_json(HTTPStatus.OK, self.me_payload({**member, 'role': role}))
            if route == ('GET', '/events'):
                since = int(parse_qs(url.query).get('since', ['0'])[0] or 0)
                events = STORE.events_since(member['group_id'], since)
                return self.send_json(HTTPStatus.OK, {'events': events, 'maxSeq': STORE.max_seq(member['group_id'])})
            if route == ('POST', '/events'):
                body = self.read_json()
                events = body.get('events')
                if not isinstance(events, list) or len(events) > MAX_EVENTS_PER_POST:
                    raise ApiError(HTTPStatus.BAD_REQUEST, f'events must be a list of at most {MAX_EVENTS_PER_POST}')
                valid = [validate_event(e, member) for e in events]
                notices = []
                for ev in valid:
                    if ev['kind'] in ('assignment', 'submission', 'grade'):
                        prev = STORE.previous_payload(member['group_id'], ev['kind'], ev['key'])
                        text = homework_notice(member, ev, prev)
                        if text:
                            notices.append(text)
                stored = STORE.add_events(member, valid)
                if stored:
                    for text in notices:
                        STORE.add_notice(member['group_id'], text)
                    HUB.publish(member['group_id'], {'type': 'events', 'events': stored})
                return self.send_json(HTTPStatus.OK, {'stored': len(stored), 'maxSeq': STORE.max_seq(member['group_id'])})
            if route == ('POST', '/live'):
                body = self.read_json()
                HUB.publish(member['group_id'], {'type': 'live', 'member': member['id'],
                                                 'device': str(body.get('device') or '')[:40],
                                                 'payload': body.get('payload')})
                return self.send_json(HTTPStatus.OK, {'ok': True})
            if route == ('POST', '/files'):
                return self.upload_file(member)
            if route == ('GET', '/stream'):
                since = int(parse_qs(url.query).get('since', ['0'])[0] or 0)
                return self.stream(member, since)
            raise ApiError(HTTPStatus.NOT_FOUND, 'not found')
        except ApiError as err:
            if method == 'POST':
                self.close_connection = True  # the body may be unread; don't parse it as the next request
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

    # ─── homework photos ───
    def upload_file(self, member):
        ctype = (self.headers.get('Content-Type') or '').split(';')[0].strip().lower()
        length = int(self.headers.get('Content-Length') or 0)
        if not 0 < length <= MAX_FILE:
            self.close_connection = True  # the unread body would be parsed as the next request
            raise ApiError(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, f'图片太大（最大 {MAX_FILE // 1024 // 1024} MB）')
        data = self.rfile.read(length)
        if ctype not in IMAGE_TYPES:
            raise ApiError(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, '只能上传 JPG / PNG / WebP 图片')
        file_id = secrets.token_urlsafe(18) + IMAGE_TYPES[ctype]
        Path(FILES_DIR).mkdir(parents=True, exist_ok=True)
        (Path(FILES_DIR) / file_id).write_bytes(data)
        STORE.add_file(file_id, member, ctype, len(data))
        return self.send_json(HTTPStatus.OK, {'url': f'/api/v2/files/{file_id}', 'size': len(data)})

    def serve_file(self, file_id):
        ctype = STORE.file_type(file_id) if '/' not in file_id and '..' not in file_id else None
        path = Path(FILES_DIR) / file_id
        if not ctype or not path.is_file():
            raise ApiError(HTTPStatus.NOT_FOUND, 'not found')
        body = path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'private, max-age=31536000, immutable')
        self.end_headers()
        self.wfile.write(body)

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


def make_server(host=HOST, port=PORT, db_path=DB_PATH, files_dir=None):
    global STORE, FILES_DIR
    STORE = Store(db_path)
    FILES_DIR = files_dir or os.environ.get('EJU_SYNC_FILES') or str(Path(db_path).resolve().parent / 'files')
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
