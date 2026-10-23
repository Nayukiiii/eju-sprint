// 学习小组同步：学习进度 + 白板各自一层、实时可见 + 讲课模式（讲课的一方带着对方翻题、展开步骤）
// Talks to server/eju_sync_server.py under /api/v2. Works offline: local edits queue in an
// outbox and upload when the connection is back.
(function () {
  'use strict';

  const API = '/api/v2';
  const KEYS = {
    token: 'eju-group-token',
    me: 'eju-group-me',
    cursor: 'eju-group-cursor',
    outbox: 'eju-group-outbox',
    snapshot: 'eju-group-snapshot',
    follow: 'eju-group-follow',
    lessonFollow: 'eju-lesson-follow',
    lesson: 'eju-lesson-state',
  };
  const PARTNER_LAYER_PREFIX = 'eju_wbp_';
  const DEVICE = Math.random().toString(36).slice(2, 10);

  // ─── storage helpers (never throw) ───
  const load = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (_) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const drop = k => { try { localStorage.removeItem(k); } catch (_) {} };

  let token = load(KEYS.token, null);
  let me = load(KEYS.me, null); // {member, group, members}
  let cursor = load(KEYS.cursor, 0);
  let outbox = load(KEYS.outbox, []);
  // What is known to be on the server already; local state that differs from it is a local edit
  let snapshot = normalizeSnapshot(load(KEYS.snapshot, null));
  let follow = load(KEYS.follow, false);

  let connected = false;
  let streamAbort = null;
  let retryDelay = 1000;
  let flushing = false;
  let uploadFailing = false;
  const partnerPresence = {}; // memberId -> {cardId, at}

  // Lesson mode: the teacher's tutor state is pushed to everyone; students follow unless paused
  let lessonOn = false; // I am teaching right now
  // Last lesson state received from someone else: {on, cardId, boardId, reveal, member, at}. Kept across reloads:
  // the stream only replays events after my cursor, so a lesson started before a reload would be missed
  let lesson = load(KEYS.lesson, null);
  let lessonFollow = load(KEYS.lessonFollow, true);

  function normalizeSnapshot(s) {
    return {progress: {}, bookmarks: {}, tasks: {}, history: {}, mocks: {}, strokes: {}, langhelp: {}, pages: {},
      assignment: {}, submission: {}, grade: {}, ...(s || {})};
  }

  function persist() {
    save(KEYS.cursor, cursor);
    save(KEYS.outbox, outbox);
    save(KEYS.snapshot, snapshot);
  }

  function hashOf(value) {
    const text = JSON.stringify(value);
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return `${text.length}:${h.toString(16)}`;
  }

  const myId = () => me?.member?.id;
  const isTeacher = () => me?.member?.role === 'teacher';
  const ROLE_LABEL = {student: '学习', teacher: '讲课'};
  const memberName = id => me?.members?.find(m => m.id === id)?.name || '同伴';
  const newId = () => `${myId() || 'local'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // ─── HTTP ───
  async function api(path, {method = 'GET', body, keepalive = false} = {}) {
    const headers = {'Content-Type': 'application/json'};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(API + path, {method, headers, body: body ? JSON.stringify(body) : undefined, keepalive});
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // ─── Local edits → events ───
  function queue(events) {
    if (!events.length) return;
    outbox.push(...events);
    persist();
    flush();
  }

  function collectStateChanges() {
    if (!token || !window.EJU_APP) return;
    const state = window.EJU_APP.getState();
    const now = Date.now();
    const events = [];
    let tagged = false;

    for (const [id, p] of Object.entries(state.boardPages || {})) {
      const h = hashOf(p);
      if (snapshot.pages[id] !== h) {
        snapshot.pages[id] = h;
        events.push({kind: 'page', key: id, at: now, payload: p});
      }
    }
    const bmKeys = new Set([...Object.keys(state.bookmarks || {}), ...Object.keys(snapshot.bookmarks)]);
    for (const id of bmKeys) {
      const on = Boolean(state.bookmarks?.[id]);
      if (Boolean(snapshot.bookmarks[id]) !== on) {
        snapshot.bookmarks[id] = on;
        events.push({kind: 'bookmark', key: id, at: now, payload: {on}});
      }
    }
    // Homework: the teacher writes assignments and grades, the student writes submissions
    const hwKinds = isTeacher() ? [['assignment', 'assignments'], ['grade', 'grades']] : [['submission', 'submissions']];
    for (const [kind, field] of hwKinds) {
      for (const [id, v] of Object.entries(state.hw?.[field] || {})) {
        const h = hashOf(v);
        if (snapshot[kind][id] !== h) {
          snapshot[kind][id] = h;
          events.push({kind, key: id, at: now, payload: v});
        }
      }
    }

    // The study record belongs to the student; the teacher's browser only shows it
    if (isTeacher()) {
      queue(events);
      return;
    }

    for (const [id, v] of Object.entries(state.langHelp || {})) {
      const h = hashOf(v);
      if (snapshot.langhelp[id] !== h) {
        snapshot.langhelp[id] = h;
        events.push({kind: 'langhelp', key: id, at: now, payload: v});
      }
    }
    for (const [id, v] of Object.entries(state.progress || {})) {
      const h = hashOf(v);
      if (snapshot.progress[id] !== h) {
        snapshot.progress[id] = h;
        events.push({kind: 'progress', key: id, at: now, payload: v});
      }
    }
    for (const [date, day] of Object.entries(state.tasks || {})) {
      for (const [k, value] of Object.entries(day || {})) {
        const key = `${date}|${k}`;
        if (snapshot.tasks[key] !== value) {
          snapshot.tasks[key] = value;
          events.push({kind: 'task', key, at: now, payload: {date, k, value}});
        }
      }
    }
    for (const h of state.history || []) {
      if (!h.eid) { h.eid = newId(); h.by = h.by || me?.member?.name; tagged = true; }
      if (!snapshot.history[h.eid]) {
        snapshot.history[h.eid] = 1;
        events.push({kind: 'history', key: h.eid, at: now, payload: h});
      }
    }
    for (const m of state.mocks || []) {
      if (!m.mid) { m.mid = newId(); tagged = true; }
      if (!snapshot.mocks[m.mid]) {
        snapshot.mocks[m.mid] = 1;
        events.push({kind: 'mock', key: m.mid, at: now, payload: m});
      }
    }
    if (tagged) window.EJU_APP.applyRemote(() => {});
    queue(events);
  }

  function collectStrokeChanges(cardId, strokes) {
    if (!token) return;
    const known = snapshot.strokes[cardId] || {};
    const current = {};
    const events = [];
    const now = Date.now();
    for (const st of strokes) {
      if (!st || !st.id) continue;
      const h = hashOf(st);
      current[st.id] = h;
      if (known[st.id] !== h) {
        events.push({kind: 'stroke', key: `${cardId}|${myId()}|${st.id}`, at: now, payload: {cardId, stroke: st}});
      }
    }
    for (const id of Object.keys(known)) {
      if (!current[id]) {
        events.push({kind: 'stroke', key: `${cardId}|${myId()}|${id}`, at: now, payload: {cardId, strokeId: id, deleted: true}});
      }
    }
    snapshot.strokes[cardId] = current;
    queue(events);
  }

  async function flush() {
    if (flushing || !token || !outbox.length) return;
    flushing = true;
    try {
      while (outbox.length) {
        const batch = outbox.slice(0, 200);
        await api('/events', {method: 'POST', body: {events: batch}});
        outbox = outbox.slice(batch.length);
        persist();
      }
      uploadFailing = false;
      setStatus();
    } catch (err) {
      if (err.status === 401) return signedOut();
      uploadFailing = true;
      setStatus();
      setTimeout(flush, 5000); // offline: retry later; the outbox is persisted
    } finally {
      flushing = false;
    }
  }

  // ─── Remote events → local state ───
  function partnerLayerStore(cardId) {
    return load(PARTNER_LAYER_PREFIX + cardId, {});
  }

  function pushPartnerLayers(cardId) {
    const wb = window.EJU_WHITEBOARD;
    if (!wb || wb.activeCardId() !== cardId) return;
    const store = partnerLayerStore(cardId);
    const layers = Object.entries(store).map(([memberId, byId]) => ({
      memberId, name: memberName(memberId), strokes: Object.values(byId),
    }));
    wb.setPartnerLayers(cardId, layers);
  }

  function applyEvents(events) {
    if (!events.length) return;
    const wb = window.EJU_WHITEBOARD;
    const touchedCards = new Set();
    const deferred = [];
    let pagesChanged = false;
    let lessonEvent = null;
    const hwNews = [];

    const apply = state => {
      for (const ev of events) {
        const p = ev.payload || {};
        if (ev.kind === 'progress') {
          state.progress[ev.key] = p;
          snapshot.progress[ev.key] = hashOf(p);
        } else if (ev.kind === 'bookmark') {
          if (p.on) state.bookmarks[ev.key] = true;
          else delete state.bookmarks[ev.key];
          snapshot.bookmarks[ev.key] = Boolean(p.on);
        } else if (ev.kind === 'task') {
          state.tasks[p.date] = state.tasks[p.date] || {};
          state.tasks[p.date][p.k] = p.value;
          snapshot.tasks[ev.key] = p.value;
        } else if (ev.kind === 'history') {
          if (!state.history.some(h => h.eid === ev.key)) state.history.push(p);
          snapshot.history[ev.key] = 1;
        } else if (ev.kind === 'langhelp') {
          state.langHelp = state.langHelp || {};
          state.langHelp[ev.key] = p;
          snapshot.langhelp[ev.key] = hashOf(p);
        } else if (ev.kind === 'page') {
          state.boardPages = state.boardPages || {};
          state.boardPages[ev.key] = p;
          snapshot.pages[ev.key] = hashOf(p);
          pagesChanged = true;
        } else if (ev.kind === 'assignment' || ev.kind === 'submission' || ev.kind === 'grade') {
          const field = {assignment: 'assignments', submission: 'submissions', grade: 'grades'}[ev.kind];
          state.hw = state.hw || {};
          state.hw[field] = state.hw[field] || {};
          const prev = state.hw[field][ev.key];
          state.hw[field][ev.key] = p;
          snapshot[ev.kind][ev.key] = hashOf(p);
          if (ev.member !== myId()) hwNews.push(homeworkNews(ev.kind, p, prev, ev.member));
        } else if (ev.kind === 'lesson') {
          if (ev.member !== myId()) lessonEvent = {...p, member: ev.member};
        } else if (ev.kind === 'mock') {
          state.mocks = state.mocks || [];
          if (!state.mocks.some(m => m.mid === ev.key)) state.mocks.push(p);
          snapshot.mocks[ev.key] = 1;
        } else if (ev.kind === 'stroke') {
          const [cardId, memberId, strokeId] = ev.key.split('|');
          if (memberId === myId()) {
            // My own layer: from another of my devices (echoes of this device match the snapshot)
            const known = (snapshot.strokes[cardId] = snapshot.strokes[cardId] || {});
            const h = p.deleted ? null : hashOf(p.stroke);
            if ((known[strokeId] || null) === h) continue;
            const own = (wb?.ownStrokes(cardId) || []).filter(s => s.id !== strokeId);
            if (!p.deleted) own.push(p.stroke);
            if (wb && !wb.replaceOwnStrokes(cardId, own)) {
              // Mid-gesture on this card: retry shortly, and leave the snapshot alone until applied
              deferred.push(ev);
              continue;
            }
            if (h) known[strokeId] = h;
            else delete known[strokeId];
          } else {
            const store = partnerLayerStore(cardId);
            store[memberId] = store[memberId] || {};
            if (p.deleted) delete store[memberId][strokeId];
            else store[memberId][strokeId] = p.stroke;
            save(PARTNER_LAYER_PREFIX + cardId, store);
            touchedCards.add(cardId);
            if (!p.deleted) wb?.setLive(cardId, memberId, null);
          }
        }
      }
    };

    window.EJU_APP.applyRemote(apply);
    cursor = Math.max(cursor, ...events.map(e => e.seq || 0));
    persist();
    touchedCards.forEach(pushPartnerLayers);
    if (pagesChanged) window.EJU_APP.refreshBoardPages?.();
    const news = hwNews.filter(Boolean);
    if (hwNews.length) window.EJU_HW?.onRemote();
    // Only announce changes that arrive live, not the backlog replayed on first connect
    if (news.length && connected) notify(news[news.length - 1]);
    if (lessonEvent) onLessonState(lessonEvent);
    if (deferred.length) setTimeout(() => applyEvents(deferred), 400);
  }

  function homeworkNews(kind, p, prev, member) {
    const who = memberName(member);
    const title = p?.title || '作业';
    if (kind === 'assignment' && !prev && !p?.deleted) return `${who} 布置了新作业「${title}」`;
    if (kind === 'submission' && p?.submittedAt && p.submittedAt !== prev?.submittedAt) return `${who} 交了作业「${title}」`;
    if (kind === 'grade' && p?.returnedAt && p.returnedAt !== prev?.returnedAt) return `${who} 批改完了「${title}」${p.summary ? `：${p.summary}` : ''}`;
    return null;
  }

  // ─── Lesson mode ───
  const LESSON_STALE_MS = 3 * 3600 * 1000; // a lesson nobody ended is treated as over after 3 hours

  function lessonPayload() {
    const st = window.EJU_APP?.getTutorState();
    if (!st) return null;
    return {on: lessonOn, ...st, boardTitle: st.boardId ? window.EJU_APP.boardTitle(st.boardId) : null, at: Date.now()};
  }

  // Teacher side: push what is open now (live for speed, stored so a late joiner catches up)
  const storeLesson = throttle(p => queue([{kind: 'lesson', key: 'state', at: Date.now(), payload: p}]), 1000);
  function broadcastLesson(force) {
    if (!token || (!lessonOn && !force)) return;
    const p = lessonPayload() || {on: false, at: Date.now()};
    if (!lessonOn) p.on = false;
    sendLive({t: 'lesson', ...p});
    storeLesson(p);
  }

  function setLessonOn(on) {
    lessonOn = on;
    if (on && window.EJU_APP?.currentRoute() !== 'math') {
      const st = window.EJU_APP?.getTutorState();
      if (!st) document.querySelector('[data-route="math"]')?.click();
    }
    broadcastLesson(true);
    renderLessonBar();
  }

  // Student side
  function onLessonState(p) {
    if (!p || p.member === myId()) return;
    if (p.on && Date.now() - (p.at || 0) > LESSON_STALE_MS) p = {...p, on: false};
    const started = p.on && !lesson?.on;
    lesson = p;
    save(KEYS.lesson, p);
    if (p.on && lessonFollow && !isTeacher()) window.EJU_APP?.applyTutorState(p);
    if (started && !isTeacher()) notify(`${memberName(p.member)} 开始讲课了`);
    renderLessonBar();
  }

  function following() {
    return follow || Boolean(lesson?.on && lessonFollow && !isTeacher());
  }

  function renderLessonBar() {
    const bar = $('#lessonBar');
    if (!bar) return;
    bar.hidden = !token;
    if (!token) return;
    const toggle = $('#lessonToggleBtn');
    const followBtn = $('#lessonFollowBtn');
    const text = $('#lessonText');
    if (isTeacher()) {
      const students = (me?.members || []).filter(m => m.role !== 'teacher' && m.id !== myId());
      const fresh = Date.now() - 45000;
      const online = students.filter(m => partnerPresence[m.id]?.at > fresh).map(m => m.name);
      bar.classList.toggle('is-live', lessonOn);
      text.textContent = lessonOn
        ? `正在讲课：对方的讲题台跟着你翻题、展开步骤、换白板页${online.length ? `（${online.join('、')} 在线）` : '（对方暂时不在线，上线后会自动跟上）'}`
        : `准备好了就点「开始讲课」${online.length ? `，${online.join('、')} 在线` : ''}`;
      toggle.hidden = false;
      toggle.textContent = lessonOn ? '结束讲课' : '开始讲课';
      followBtn.hidden = true;
    } else {
      const live = Boolean(lesson?.on);
      bar.classList.toggle('is-live', live);
      bar.hidden = !live;
      toggle.hidden = true;
      followBtn.hidden = !live;
      followBtn.textContent = lessonFollow ? '暂停跟随' : '继续跟随';
      text.textContent = live
        ? `${memberName(lesson.member)} 正在讲课${lessonFollow ? ' · 跟随中' : ' · 已暂停跟随，你可以自己翻'}`
        : '';
    }
  }

  // A small, non-blocking notice (also a system notification when the page is in the background)
  function notify(text) {
    let el = document.getElementById('syncToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'syncToast';
      el.className = 'sync-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('is-shown');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => el.classList.remove('is-shown'), 4000);
    try {
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification('EJU 冲刺', {body: text});
    } catch (_) {}
  }

  // Whiteboard notes made on this device before joining (or while offline) go up on connect
  function collectAllLocalBoards() {
    let keys = [];
    try {
      keys = Object.keys(localStorage).filter(k => k.startsWith('eju_wb_'));
    } catch (_) {}
    for (const k of keys) {
      const cardId = k.slice('eju_wb_'.length);
      collectStrokeChanges(cardId, window.EJU_WHITEBOARD?.ownStrokes(cardId) || []);
    }
  }

  // ─── Live (not stored): strokes being drawn, pointer, open question, view ───
  const liveBuffers = {}; // memberId -> stroke being received
  const endTimers = {};

  function onLive(msg) {
    if (msg.device === DEVICE || !msg.payload) return;
    const p = msg.payload;
    const wb = window.EJU_WHITEBOARD;
    partnerPresence[msg.member] = {cardId: p.cardId || partnerPresence[msg.member]?.cardId, at: Date.now()};
    if (msg.member !== myId()) renderPresence();

    if (p.t === 'stroke') {
      let live = liveBuffers[msg.member];
      if (!live || live.id !== p.id) {
        live = liveBuffers[msg.member] = {id: p.id, mode: p.mode, color: p.color, width: p.width, alpha: p.alpha, points: []};
        if (p.shape) live.shape = p.shape;
      }
      live.points.length = Math.min(live.points.length, p.from);
      live.points.push(...p.points);
      clearTimeout(endTimers[msg.member]);
      wb?.setLive(p.cardId, msg.member, live);
    } else if (p.t === 'stroke-end') {
      // The stored stroke normally arrives right after; drop the preview if it doesn't
      endTimers[msg.member] = setTimeout(() => wb?.setLive(p.cardId, msg.member, null), 1500);
    } else if (p.t === 'pointer') {
      wb?.setPointer(p.cardId, msg.member, p.x == null ? null : {x: p.x, y: p.y, name: memberName(msg.member)});
    } else if (p.t === 'laser') {
      for (const pt of p.points || []) wb?.addRemoteLaser(p.cardId, msg.member, pt);
    } else if (p.t === 'lesson') {
      onLessonState({...p, member: msg.member});
    } else if (p.t === 'look') {
      // "请看这里": go to the same question / page, then centre on the spot
      if (msg.member === myId()) return;
      if (p.tutor && window.EJU_APP) window.EJU_APP.applyTutorState({...p.tutor, reveal: null});
      setTimeout(() => wb?.lookAt(wb.activeCardId(), p.view), 80);
      notify(`${memberName(msg.member)}：请看这里`);
    } else if (p.t === 'card') {
      if (following() && msg.member !== myId() && p.cardId && !lesson?.on
          && !p.cardId.startsWith('page-') && window.EJU_APP?.currentTutorCardId() !== p.cardId) {
        window.EJU_APP.openTutorCard(p.cardId);
      }
    } else if (p.t === 'view') {
      if (following() && msg.member !== myId() && wb?.activeCardId() === p.cardId) wb.setView(p);
    }
  }

  function sendLive(payload) {
    if (!token || !connected) return;
    api('/live', {method: 'POST', body: {device: DEVICE, payload}, keepalive: true}).catch(() => {});
  }

  function throttle(fn, ms) {
    let last = 0;
    let timer = null;
    let pending = null;
    return (...args) => {
      pending = args;
      const wait = last + ms - Date.now();
      if (wait <= 0) {
        last = Date.now();
        fn(...pending);
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          last = Date.now();
          fn(...pending);
        }, wait);
      }
    };
  }

  let liveSent = {id: null, count: 0};
  const sendStrokeProgress = throttle((cardId, stroke) => {
    if (liveSent.id !== stroke.id) liveSent = {id: stroke.id, count: 0};
    // A shape keeps two points that move, so it is always resent whole
    const from = stroke.shape ? 0 : liveSent.count;
    const points = stroke.points.slice(from);
    if (!points.length) return;
    liveSent.count = stroke.points.length;
    sendLive({t: 'stroke', cardId, id: stroke.id, mode: stroke.mode, color: stroke.color, width: stroke.width, alpha: stroke.alpha, shape: stroke.shape, from, points});
  }, 40);
  // Laser points are batched: the partner draws the same fading trail
  let laserBatch = [];
  const sendLaser = throttle(cardId => {
    if (!laserBatch.length) return;
    sendLive({t: 'laser', cardId, points: laserBatch});
    laserBatch = [];
  }, 40);
  const sendPointer = throttle((cardId, pt) => sendLive({t: 'pointer', cardId, x: pt.x, y: pt.y}), 80);
  const sendView = throttle((cardId, v) => sendLive({t: 'view', cardId, ...v}), 150);

  function hookWhiteboard() {
    const wb = window.EJU_WHITEBOARD;
    if (!wb?.hooks) return;
    wb.hooks.onLayerChanged = (cardId, strokes) => token && collectStrokeChanges(cardId, strokes);
    wb.hooks.onLive = (cardId, stroke) => {
      if (!token) return;
      if (stroke) {
        if (stroke.mode !== 'eraser') sendStrokeProgress(cardId, stroke);
      } else if (liveSent.id) {
        sendLive({t: 'stroke-end', cardId, id: liveSent.id});
        liveSent = {id: null, count: 0};
      }
    };
    wb.hooks.onPointer = (cardId, pt) => token && sendPointer(cardId, pt);
    wb.hooks.onView = (cardId, v) => token && sendView(cardId, v);
    wb.hooks.onLaser = (cardId, pt) => {
      if (!token) return;
      laserBatch.push({x: Math.round(pt.x * 10) / 10, y: Math.round(pt.y * 10) / 10});
      sendLaser(cardId);
    };
    wb.hooks.onCardOpened = cardId => {
      if (!token) return;
      pushPartnerLayers(cardId);
      sendLive({t: 'card', cardId});
      renderPresence();
    };
  }

  // ─── Stream ───
  async function connect() {
    if (!token) return;
    streamAbort?.abort();
    const controller = new AbortController();
    streamAbort = controller;
    try {
      const res = await fetch(`${API}/stream?since=${cursor}`, {
        headers: {Authorization: `Bearer ${token}`},
        signal: controller.signal,
        cache: 'no-store',
      });
      if (res.status === 401) return signedOut();
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const {value, done} = await reader.read();
        if (done) break;
        buf += decoder.decode(value, {stream: true});
        let idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split('\n').find(l => l.startsWith('data: '));
          if (line) handleMessage(JSON.parse(line.slice(6)));
        }
      }
      throw new Error('stream closed');
    } catch (err) {
      if (controller.signal.aborted) return;
      connected = false;
      setStatus();
      setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 15000);
    }
  }

  function handleMessage(msg) {
    if (msg.type === 'events') applyEvents(msg.events);
    else if (msg.type === 'live') onLive(msg);
    else if (msg.type === 'members') updateMembers(msg.members);
    else if (msg.type === 'ready') {
      connected = true;
      retryDelay = 1000;
      updateMembers(msg.members);
      collectStateChanges();
      collectAllLocalBoards();
      flush();
      const wb = window.EJU_WHITEBOARD;
      const cardId = wb?.activeCardId();
      if (cardId) {
        pushPartnerLayers(cardId);
        sendLive({t: 'card', cardId});
      }
      if (lessonOn) broadcastLesson();
      // Rejoin a lesson that was going on before this page loaded
      if (lesson?.on && !lesson.rejoined) {
        lesson.rejoined = true;
        onLessonState({...lesson});
      }
      renderLessonBar();
      setStatus();
    }
  }

  function updateMembers(members) {
    if (!me || !members) return;
    me.members = members;
    const mine = members.find(m => m.id === myId());
    if (mine?.role && me.member.role !== mine.role) {
      me.member.role = mine.role;
      if (mine.role === 'teacher') clearLocalStudy();
      else lessonOn = false;
      window.EJU_APP?.applyRemote(() => {});
    }
    save(KEYS.me, me);
    renderGroupPane();
    renderPresence();
    renderLessonBar();
  }

  // ─── Sign in / out ───
  async function start() {
    hookWhiteboard();
    renderGroupPane();
    if (!token) return setStatus();
    try {
      me = await api('/me');
      save(KEYS.me, me);
    } catch (err) {
      if (err.status === 401) return signedOut();
      // Offline: keep going with the cached identity; the stream will retry
    }
    renderGroupPane();
    connect();
    setStatus();
  }

  // The teacher's browser shows the student's record, so its own local study record is dropped
  function clearLocalStudy() {
    window.EJU_APP?.applyRemote(state => {
      state.progress = {};
      state.history = [];
      state.mocks = [];
      state.tasks = {};
      state.langHelp = {};
    });
  }

  function adopt(result) {
    token = result.token;
    me = {member: result.member, group: result.group, members: result.members};
    if (isTeacher()) clearLocalStudy();
    cursor = 0;
    outbox = [];
    snapshot = normalizeSnapshot(null); // first sync uploads this device's existing progress
    save(KEYS.token, token);
    save(KEYS.me, me);
    persist();
    start();
  }

  function signedOut() {
    streamAbort?.abort();
    token = null;
    me = null;
    connected = false;
    for (const k of [KEYS.token, KEYS.me, KEYS.cursor, KEYS.outbox, KEYS.snapshot, KEYS.lesson]) drop(k);
    lesson = null;
    lessonOn = false;
    cursor = 0;
    outbox = [];
    snapshot = normalizeSnapshot(null);
    renderGroupPane();
    renderPresence();
    setStatus('已退出小组：进度只保存在本机浏览器。');
  }

  // ─── UI ───
  const $ = sel => document.querySelector(sel);

  function setStatus(text) {
    const el = $('#syncStatusText');
    const btn = $('#syncBtn');
    if (btn) {
      const online = connected && !uploadFailing;
      btn.textContent = !token ? '云同步'
        : uploadFailing ? `小组 · ${outbox.length} 条待上传`
        : online ? '小组 · 已连接' : '小组 · 连接中';
      btn.classList.toggle('is-connected', Boolean(token && online));
    }
    if (!el) return;
    if (text) { el.textContent = text; return; }
    if (!token) el.textContent = '未加入小组：进度只保存在本机浏览器。';
    else if (!connected || uploadFailing) el.textContent = `网络不通，修改已保存在本机，恢复后自动上传（${outbox.length} 条）。`;
    else el.textContent = outbox.length ? `已连接，正在上传 ${outbox.length} 条修改…` : '已连接，实时同步中。';
  }

  function inviteLink() {
    return `${location.origin}${location.pathname}#join=${encodeURIComponent(me?.group?.inviteCode || '')}`;
  }

  function deviceLink() {
    return `${location.origin}${location.pathname}#device=${encodeURIComponent(token || '')}`;
  }

  function renderGroupPane() {
    const setup = $('#groupSetupPane');
    const info = $('#groupInfoPane');
    if (!setup || !info) return;
    setup.hidden = Boolean(token);
    info.hidden = !token;
    if (!token || !me) return;
    $('#groupNameText').textContent = me.group?.name || '';
    $('#groupMeText').textContent = me.member?.name || '';
    $('#groupRoleText').textContent = `${ROLE_LABEL[me.member?.role] || '学习'}的一方`;
    $('#groupMembersList').innerHTML = (me.members || [])
      .map(m => `<li>${escapeHtml(m.name)} · ${ROLE_LABEL[m.role] || '学习'}${m.id === myId() ? '（我）' : ''}</li>`).join('');
    $('#groupInviteLink').value = inviteLink();
    const tLink = $('#groupTeacherInviteLink');
    if (tLink) tLink.value = me.group?.teacherInviteCode
      ? `${location.origin}${location.pathname}#join=${encodeURIComponent(me.group.teacherInviteCode)}` : '';
    $('#groupDeviceLink').value = deviceLink();
  }

  function renderPresence() {
    const bar = $('#groupBoardBar');
    if (!bar) return;
    bar.hidden = !token;
    if (!token) return;
    const others = (me?.members || []).filter(m => m.id !== myId());
    const fresh = Date.now() - 45000;
    $('#groupPresence').innerHTML = others.length
      ? others.map(m => {
          const p = partnerPresence[m.id];
          const online = p && p.at > fresh;
          const where = online && p.cardId ? `正在看「${escapeHtml(cardLabel(p.cardId))}」` : online ? '在线' : '离线';
          return `<span class="presence ${online ? 'is-online' : ''}">${escapeHtml(m.name)} · ${where}</span>`;
        }).join('')
      : '<span class="presence">还没有同伴加入，去「小组」里复制邀请链接</span>';
    const followBox = $('#groupFollowToggle');
    if (followBox) followBox.checked = follow;
  }

  function cardLabel(cardId) {
    const page = window.EJU_APP?.boardTitle(cardId);
    if (page) return page;
    const card = (window.EJU_BANK || []).find(c => c.id === cardId);
    return card ? card.topic : cardId;
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bindUi() {
    $('#syncBtn')?.addEventListener('click', () => {
      renderGroupPane();
      setStatus();
      $('#syncModal').hidden = false;
    });
    $('#closeSyncModalBtn')?.addEventListener('click', () => { $('#syncModal').hidden = true; });

    $('#groupCreateBtn')?.addEventListener('click', async () => {
      try {
        adopt(await api('/groups', {method: 'POST', body: {groupName: $('#groupNameInput').value, memberName: $('#groupMemberName').value,
          role: $('#groupRoleSelect')?.value || 'student'}}));
        setStatus(isTeacher() ? '小组已创建。把「邀请学习的一方」链接发给对方。' : '小组已创建。把「邀请讲课的一方」链接发给对方。');
      } catch (err) {
        setStatus(`创建失败：${err.message}`);
      }
    });
    $('#groupJoinBtn')?.addEventListener('click', async () => {
      const raw = $('#groupInviteInput').value.trim();
      const code = decodeURIComponent((raw.match(/join=([^&\s]+)/) || [null, raw])[1]);
      try {
        adopt(await api('/join', {method: 'POST', body: {inviteCode: code, memberName: $('#groupMemberName').value}}));
        setStatus('已加入小组，正在合并进度…');
      } catch (err) {
        setStatus(`加入失败：${err.message}`);
      }
    });
    const copy = async (input, label) => {
      try {
        await navigator.clipboard.writeText(input.value);
        setStatus(`${label}已复制。`);
      } catch (_) {
        input.select();
        setStatus('请手动复制（已选中）。');
      }
    };
    $('#groupCopyInviteBtn')?.addEventListener('click', () => copy($('#groupInviteLink'), '邀请链接'));
    $('#groupCopyTeacherInviteBtn')?.addEventListener('click', () => copy($('#groupTeacherInviteLink'), '讲课邀请链接'));
    $('#groupSwitchRoleBtn')?.addEventListener('click', async () => {
      const next = isTeacher() ? 'student' : 'teacher';
      const warn = next === 'teacher'
        ? '切换成「讲课的一方」？这台设备上的刷题记录会改为显示对方的进度。'
        : '切换成「学习的一方」？之后你的刷题会记入学习进度。';
      if (!confirm(warn)) return;
      try {
        const res = await api('/role', {method: 'POST', body: {role: next}});
        me = {...me, ...res};
        save(KEYS.me, me);
        if (next === 'teacher') clearLocalStudy();
        else lessonOn = false;
        renderGroupPane();
        renderLessonBar();
        setStatus(`已切换为${ROLE_LABEL[next]}的一方。`);
      } catch (err) {
        setStatus(`切换失败：${err.message}`);
      }
    });
    $('#lessonToggleBtn')?.addEventListener('click', () => {
      if (!lessonOn && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
      setLessonOn(!lessonOn);
    });
    $('#lessonFollowBtn')?.addEventListener('click', () => {
      lessonFollow = !lessonFollow;
      save(KEYS.lessonFollow, lessonFollow);
      if (lessonFollow && lesson?.on) window.EJU_APP?.applyTutorState(lesson);
      renderLessonBar();
    });
    $('#wbLookHereBtn')?.addEventListener('click', () => {
      const wb = window.EJU_WHITEBOARD;
      const view = wb?.currentView();
      if (!view) return;
      sendLive({t: 'look', tutor: window.EJU_APP?.getTutorState(), view});
      wb.flashAt(view.cx, view.cy);
    });
    window.addEventListener('eju-tutor-changed', () => broadcastLesson());
    $('#groupCopyDeviceBtn')?.addEventListener('click', () => copy($('#groupDeviceLink'), '设备链接'));
    $('#groupLeaveBtn')?.addEventListener('click', () => {
      if (confirm('在这台设备上退出小组？本机已有的进度会保留，之后不再同步。')) signedOut();
    });

    $('#groupFollowToggle')?.addEventListener('change', e => {
      follow = e.target.checked;
      save(KEYS.follow, follow);
    });
    for (const btn of document.querySelectorAll('[data-layer-view]')) {
      btn.addEventListener('click', () => {
        const v = btn.dataset.layerView;
        document.querySelectorAll('[data-layer-view]').forEach(b => b.classList.toggle('is-active', b === btn));
        window.EJU_WHITEBOARD?.setLayerVisibility(v !== 'partner', v !== 'mine');
      });
    }

    // State edits from app.js
    window.addEventListener('eju-state-saved', () => collectStateChanges());
    window.addEventListener('online', () => { flush(); if (!connected) connect(); });
    // Presence heartbeat while the page is open
    setInterval(() => {
      if (!token || document.hidden) return;
      const cardId = window.EJU_WHITEBOARD?.activeCardId();
      if (window.EJU_APP?.currentRoute() === 'math' && cardId) sendLive({t: 'card', cardId});
      if (lessonOn) broadcastLesson();
      renderPresence();
      renderLessonBar();
    }, 20000);
  }

  // Links: #join=<invite> prefills the join form; #device=<token> signs this device in as me
  function handleHash() {
    const hash = location.hash.slice(1);
    const params = new URLSearchParams(hash);
    if (params.get('device')) {
      token = params.get('device');
      save(KEYS.token, token);
      cursor = 0;
      outbox = [];
      snapshot = normalizeSnapshot(null);
      persist();
    }
    if (params.get('join') && !token) {
      $('#groupInviteInput').value = params.get('join');
      $('#syncModal').hidden = false;
    }
    if (params.get('device') || params.get('join')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  window.EJU_SYNC = {myName: () => me?.member?.name || null, isTeacher, role: () => me?.member?.role || null};

  function init() {
    bindUi();
    handleHash();
    start();
    // An invite link opened in a tab that already shows the site only changes the hash
    window.addEventListener('hashchange', () => {
      const hadToken = token;
      handleHash();
      if (token && token !== hadToken) start();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
