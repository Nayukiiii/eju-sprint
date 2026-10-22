// 学习小组同步：共同进度 + 白板各自一层、实时可见 + 跟随讲题
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

  function normalizeSnapshot(s) {
    return {progress: {}, bookmarks: {}, tasks: {}, history: {}, mocks: {}, strokes: {}, ...(s || {})};
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

    for (const [id, v] of Object.entries(state.progress || {})) {
      const h = hashOf(v);
      if (snapshot.progress[id] !== h) {
        snapshot.progress[id] = h;
        events.push({kind: 'progress', key: id, at: now, payload: v});
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
    if (deferred.length) setTimeout(() => applyEvents(deferred), 400);
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
    } else if (p.t === 'card') {
      if (follow && msg.member !== myId() && p.cardId && window.EJU_APP?.currentTutorCardId() !== p.cardId) {
        window.EJU_APP.openTutorCard(p.cardId);
      }
    } else if (p.t === 'view') {
      if (follow && msg.member !== myId() && wb?.activeCardId() === p.cardId) wb.setView(p);
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
    const from = liveSent.count;
    const points = stroke.points.slice(from);
    if (!points.length) return;
    liveSent.count = stroke.points.length;
    sendLive({t: 'stroke', cardId, id: stroke.id, mode: stroke.mode, color: stroke.color, width: stroke.width, alpha: stroke.alpha, from, points});
  }, 50);
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
      setStatus();
    }
  }

  function updateMembers(members) {
    if (!me || !members) return;
    me.members = members;
    save(KEYS.me, me);
    renderGroupPane();
    renderPresence();
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

  function adopt(result) {
    token = result.token;
    me = {member: result.member, group: result.group, members: result.members};
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
    for (const k of [KEYS.token, KEYS.me, KEYS.cursor, KEYS.outbox, KEYS.snapshot]) drop(k);
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
    $('#groupMembersList').innerHTML = (me.members || [])
      .map(m => `<li>${escapeHtml(m.name)}${m.id === myId() ? '（我）' : ''}</li>`).join('');
    $('#groupInviteLink').value = inviteLink();
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
        adopt(await api('/groups', {method: 'POST', body: {groupName: $('#groupNameInput').value, memberName: $('#groupMemberName').value}}));
        setStatus('小组已创建。把「邀请对方加入」的链接发给她。');
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
      renderPresence();
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

  function init() {
    bindUi();
    handleHash();
    start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
