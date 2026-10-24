// 真题阶梯学习：答错后「先修路径 → 补先修 → 回到这道题」+ 主页「今日阶梯」
// 数据在 ladder_data.js（window.EJU_LADDER），先修卡在 ladder_cards.js；没有数据时整个功能不出现。
// 答题记录沿用 app.js 的 recordCardGrade / state.progress，不另起一套。
(() => {
  'use strict';
  const D = window.EJU_LADDER;
  const A = window.EJU_APP;
  if (!D || !D.concepts || !D.real || !A) return;

  const $ = sel => document.querySelector(sel);
  const cardById = new Map(A.cards.map(c => [c.id, c]));
  const SUBJECTS = ['全部', '政治', '経済', '地理', '歴史', '社会'];
  // 11/8 考试前的冲刺日程：当天主科目（其余日子取「全部」）
  const DAY_SUBJECT = {
    '10-25': '経済', '10-26': '政治', '10-27': '地理', '10-28': '歴史', '10-29': '経済',
    '10-30': '政治', '10-31': '地理', '11-02': '歴史', '11-03': '社会'
  };
  const LS_KEY = 'eju-ladder-v1';

  const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (_) { return {}; }
  };
  const saveLocal = data => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) {}
  };
  let local = loadLocal();
  local.skip = local.skip || {};

  // ── 掌握判定 ──
  // 先修卡：做过且最近一次评分是「掌握」（box ≥ 1，box 的计法沿用 recordCardGrade）。
  // 不要求 box ≥ 2：一轮先修只会把每张卡推进一级，要求 2 级就永远解锁不了。
  const cardDone = card => {
    const p = A.getProgress(card);
    return (p.box || 0) >= 1 && (p.lastGrade === 'good' || p.lastGrade === 'easy');
  };
  const conceptCards = cid => (D.concepts[cid]?.cardIds || []).map(id => cardById.get(id)).filter(Boolean);
  const conceptMastered = cid => {
    const cs = conceptCards(cid);
    return cs.length > 0 && cs.every(cardDone);
  };
  const conceptsOf = id => (D.real[id]?.concepts || []).filter(c => D.concepts[c]);
  const realCards = () => Object.keys(D.real).map(id => cardById.get(id)).filter(Boolean);

  // done = 这道真题已做对；locked = 还有先修没掌握且用户没选「我已会」；其余 open
  function statusOf(card) {
    if (cardDone(card)) return 'done';
    if (local.skip[card.id]) return 'open';
    return conceptsOf(card.id).every(conceptMastered) ? 'open' : 'locked';
  }

  // ── 小轮（先修 → 回原题） ──
  // mini = {targetId, queueRef, parent: {ids, index, label} | null, concepts, conceptOf, gateDone}
  let mini = null;
  const miniActive = () => Boolean(mini && mini.queueRef === A.getSession().queue);

  function startMini(target, parent) {
    const all = conceptsOf(target.id);
    const pending = all.filter(c => !conceptMastered(c));
    const use = pending.length ? pending : all;
    const list = [];
    const conceptOf = new Map();
    for (const cid of use) {
      for (const card of conceptCards(cid)) {
        if (conceptOf.has(card.id)) continue;
        conceptOf.set(card.id, cid);
        list.push(card);
      }
    }
    list.push(target);
    mini = {targetId: target.id, queueRef: list, parent, concepts: use, conceptOf, gateDone: false};
    A.setSession(list, '先修小轮');
  }

  function restoreParent(parent) {
    const list = parent.ids.map(id => cardById.get(id)).filter(Boolean);
    if (parent.index >= list.length) {
      const st = A.getState();
      st.activeSession = null;
      A.switchRoute('today');
      return;
    }
    A.setSession(list, parent.label, parent.index);
  }

  // 从作答页（刚答错/不确定）进入：先把原题记为答错，再开小轮；回来后从原来那一轮的下一题继续
  function startFromFeedback(card) {
    const s = A.getSession();
    const label = A.getState().activeSession?.label || '';
    A.recordCardGrade(card, 'again');
    startMini(card, {ids: s.queue.map(c => c.id), index: s.index + 1, label});
  }

  // ── 作答页：先修路径 ──
  function conceptLine(cid, state) {
    const c = D.concepts[cid];
    const mark = state === 'done' ? '✓ ' : state === 'now' ? '● ' : '';
    return `<span class="lad-chip lad-chip-${state}">${mark}${esc(c.titleCn)}</span>`;
  }

  function renderFeedbackBox(card, isCorrect, isUnsure) {
    $('#ladderBox')?.remove();
    if (isCorrect !== false && !isUnsure) return;
    const cids = conceptsOf(card.id);
    if (!cids.length) return;
    const fb = $('#studyFeedback');
    if (!fb) return;
    const retry = miniActive() && mini.targetId === card.id;
    const path = cids.map(cid => conceptLine(cid, conceptMastered(cid) ? 'done' : 'todo')).join('<span class="lad-arrow">→</span>');
    const descs = cids.map(cid => `<li><b>${esc(D.concepts[cid].titleJp)}</b>　${esc(D.concepts[cid].desc)}</li>`).join('');
    const box = document.createElement('div');
    box.id = 'ladderBox';
    box.className = 'lad-box';
    box.innerHTML = `
      <div class="lad-box-title">先修路径</div>
      <div class="lad-path">${path}</div>
      <ul class="lad-desc">${descs}</ul>
      ${retry
        ? '<div class="lad-note">先修已经补过一轮了。这次先看解析，下次复习时再碰到它。</div>'
        : '<button class="btn btn-primary lad-go" type="button">去补先修，然后回到这题</button>'}
    `;
    fb.appendChild(box);
    box.querySelector('.lad-go')?.addEventListener('click', () => startFromFeedback(card));
  }

  // ── 小轮中的提示条与「回到这道题」闸门 ──
  function clearStudyExtras() {
    $('#ladderBanner')?.remove();
    $('#ladderGate')?.remove();
    const sc = document.querySelector('#view-study .study-card');
    if (sc) sc.style.display = '';
  }

  function miniStates(currentCid) {
    const idx = mini.concepts.indexOf(currentCid);
    return mini.concepts.map((cid, i) => conceptLine(cid, currentCid === null || i < idx ? 'done' : i === idx ? 'now' : 'todo'));
  }

  function showBanner(card) {
    const view = $('#view-study');
    const sc = view?.querySelector('.study-card');
    if (!sc) return;
    const cid = mini.conceptOf.get(card.id) || null;
    const el = document.createElement('div');
    el.id = 'ladderBanner';
    el.className = 'lad-banner';
    const path = miniStates(cid).join('<span class="lad-arrow">→</span>');
    const tail = cid === null
      ? '<span class="lad-chip lad-chip-now">● 回到原题</span>'
      : '<span class="lad-chip lad-chip-todo">回到原题</span>';
    el.innerHTML = `<span class="lad-banner-label">先修小轮</span>${path}<span class="lad-arrow">→</span>${tail}`;
    sc.parentNode.insertBefore(el, sc);
  }

  function showGate() {
    const view = $('#view-study');
    const sc = view?.querySelector('.study-card');
    if (!sc) return;
    const el = document.createElement('article');
    el.id = 'ladderGate';
    el.className = 'card lad-gate';
    el.innerHTML = `
      <div class="lad-gate-title">先修完成</div>
      <div class="lad-path">${miniStates(null).join('<span class="lad-arrow">→</span>')}</div>
      <p class="lad-gate-text">现在回到刚才那道题。题目会重新出现，不显示答案，再答一次。</p>
      <button class="btn btn-primary lad-go" id="ladderGateBtn" type="button">回到这道题</button>`;
    sc.style.display = 'none';
    sc.parentNode.insertBefore(el, sc);
    $('#ladderGateBtn').addEventListener('click', () => {
      mini.gateDone = true;
      clearStudyExtras();
      showBanner(cardById.get(mini.targetId));
    });
  }

  // 闸门显示时，键盘不要落到被隐藏的原题上（数字键会直接作答）
  document.addEventListener('keydown', e => {
    if (!$('#ladderGate')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      $('#ladderGateBtn')?.click();
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // ── 主页「今日阶梯」 ──
  function todayKey() {
    const forced = new URLSearchParams(location.search).get('ladderDate');
    if (forced && /^\d\d-\d\d$/.test(forced)) return forced;
    return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Tokyo'}).format(new Date()).slice(5);
  }
  const daySubject = () => DAY_SUBJECT[todayKey()] || '全部';
  const currentSubject = () => (local.subjectDay === todayKey() && SUBJECTS.includes(local.subject)) ? local.subject : daySubject();
  let openQid = null;

  const sittingShort = card => ({'2023_1': '23-1', '2023_2': '23-2', '2024': '24', '2025': '25'}[card.sitting] || card.sitting);
  const qLabel = card => `${sittingShort(card)}·${String(card.no).padStart(2, '0')}`;
  const STATUS_ICON = {locked: '🔒', open: '▶', done: '✔'};
  const STATUS_TEXT = {locked: '未解锁', open: '可做', done: '已做对'};

  function ensureHome() {
    let el = $('#ladderHome');
    if (el) return el;
    const anchor = $('#heroFocusCard');
    if (!anchor) return null;
    el = document.createElement('article');
    el.id = 'ladderHome';
    el.className = 'card lad-home';
    anchor.insertAdjacentElement('afterend', el);
    return el;
  }

  function renderHome() {
    const el = ensureHome();
    if (!el) return;
    const subject = currentSubject();
    const list = realCards().filter(c => subject === '全部' || c.deck === subject);
    if (!list.length) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const stat = new Map(list.map(c => [c.id, statusOf(c)]));
    const unlocked = list.filter(c => stat.get(c.id) !== 'locked').length;
    const doneN = list.filter(c => stat.get(c.id) === 'done').length;

    // 按第一个概念分组（概念顺序＝先易后难的大致顺序）
    const groups = new Map();
    for (const c of list) {
      const cid = conceptsOf(c.id)[0];
      if (!groups.has(cid)) groups.set(cid, []);
      groups.get(cid).push(c);
    }
    const groupHtml = [...groups.entries()].map(([cid, items]) => {
      const info = D.concepts[cid];
      const cs = conceptCards(cid);
      const got = cs.filter(cardDone).length;
      const tag = got === cs.length ? '<span class="lad-g-ok">先修✓</span>' : `<span class="lad-g-todo">先修 ${got}/${cs.length}</span>`;
      const chips = items.map(c => {
        const st = stat.get(c.id);
        return `<button class="lad-q lad-q-${st}${openQid === c.id ? ' is-open' : ''}" type="button" data-qid="${c.id}" title="${esc(c.topic)}">${qLabel(c)} <span aria-hidden="true">${STATUS_ICON[st]}</span><span class="lad-sr">${STATUS_TEXT[st]}</span></button>`;
      }).join('');
      return `<div class="lad-group"><div class="lad-group-head"><b>${esc(info.titleCn)}</b> <small>${esc(info.titleJp)}</small> ${tag}</div><div class="lad-qs">${chips}</div></div>`;
    }).join('');

    el.innerHTML = `
      <div class="lad-home-head">
        <h2 class="section-title">今日阶梯 <small>${subject === '全部' ? '全部科目' : esc(subject)}</small></h2>
        <span class="lad-prog">已解锁 <b>${unlocked}</b> / ${list.length}　已做对 ${doneN}</span>
      </div>
      <div class="lad-bar"><span style="width:${Math.round(unlocked / list.length * 100)}%"></span></div>
      <div class="lad-subjects" role="group" aria-label="科目">
        ${SUBJECTS.map(s => `<button class="lad-subj${s === subject ? ' is-active' : ''}" type="button" data-subj="${s}">${s}${s === daySubject() ? '·今日' : ''}</button>`).join('')}
      </div>
      <div class="lad-hint">先修概念掌握了，真题才解锁。不想补的题可以点开选「我已会，直接做」。</div>
      <details class="lad-list"${subject === '全部' ? '' : ' open'}>
        <summary>题目清单（${list.length} 题，按概念分组）</summary>
        ${groupHtml}
      </details>
      <div class="lad-detail" id="ladderDetail"></div>`;
    el.querySelectorAll('.lad-subj').forEach(btn => btn.addEventListener('click', () => {
      local.subject = btn.dataset.subj;
      local.subjectDay = todayKey();
      saveLocal(local);
      openQid = null;
      renderHome();
    }));
    el.querySelectorAll('.lad-q').forEach(btn => btn.addEventListener('click', () => {
      openQid = openQid === btn.dataset.qid ? null : btn.dataset.qid;
      renderHome();
      if (openQid) $('#ladderDetail')?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }));
    renderDetail();
  }

  function renderDetail() {
    const box = $('#ladderDetail');
    if (!box) return;
    const card = openQid && cardById.get(openQid);
    if (!card) {
      box.hidden = true;
      return;
    }
    const st = statusOf(card);
    const cids = conceptsOf(card.id);
    const path = cids.map(cid => conceptLine(cid, conceptMastered(cid) ? 'done' : 'todo')).join('<span class="lad-arrow">→</span>');
    const todo = cids.filter(c => !conceptMastered(c)).map(c => D.concepts[c].titleCn);
    let body;
    if (st === 'locked') {
      body = `<p class="lad-detail-text">先补先修：${esc(todo.join('、'))}</p>
        <div class="lad-actions"><button class="btn btn-primary" data-act="prereq" type="button">去补先修，然后回到这题</button>
        <button class="btn" data-act="skip" type="button">我已会，直接做</button></div>`;
    } else {
      body = `<div class="lad-actions"><button class="btn btn-primary" data-act="play" type="button">${st === 'done' ? '再做一次' : '做这道题'}</button></div>`;
    }
    box.hidden = false;
    box.innerHTML = `<div class="lad-detail-head"><b>${esc(card.sittingLabel || '')} 第${card.no}题</b> <span class="lad-st lad-st-${st}">${STATUS_TEXT[st]}</span></div>
      <div class="lad-detail-topic">${esc(card.topic)}</div><div class="lad-path">${path}</div>${body}`;
    box.querySelector('[data-act="prereq"]')?.addEventListener('click', () => startMini(card, null));
    box.querySelector('[data-act="skip"]')?.addEventListener('click', () => {
      local.skip[card.id] = true;
      saveLocal(local);
      A.setSession([card], '阶梯', 0);
    });
    box.querySelector('[data-act="play"]')?.addEventListener('click', () => A.setSession([card], '阶梯', 0));
  }

  // ── 样式（独立注入，避免和别的会话改 styles.css 冲突） ──
  const style = document.createElement('style');
  style.textContent = `
    .lad-home { margin-top: 12px; }
    .lad-home[hidden] { display: none; }
    .lad-home-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .lad-home-head .section-title { margin: 0; }
    .lad-home-head small { font-size: 12px; font-weight: 400; color: var(--text-muted); margin-left: 4px; }
    .lad-prog { font-size: 13px; color: var(--text-muted); }
    .lad-prog b { color: var(--primary); font-size: 16px; }
    .lad-bar { height: 6px; border-radius: 3px; background: var(--surface-subtle); margin: 8px 0 10px; overflow: hidden; }
    .lad-bar span { display: block; height: 100%; background: var(--primary); }
    .lad-subjects { display: flex; flex-wrap: wrap; gap: 6px; }
    .lad-subj { font: inherit; font-size: 13px; padding: 6px 10px; min-height: 34px; border-radius: 16px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; }
    .lad-subj.is-active { background: var(--navy); border-color: var(--navy); color: var(--surface); }
    .lad-hint { font-size: 12px; color: var(--text-muted); margin: 8px 0; }
    .lad-list summary { cursor: pointer; font-size: 13px; color: var(--navy); padding: 6px 0; }
    .lad-group { margin: 8px 0 12px; }
    .lad-group-head { font-size: 13px; margin-bottom: 4px; }
    .lad-group-head small { color: var(--text-muted); }
    .lad-g-ok { color: var(--ok); font-size: 12px; margin-left: 4px; }
    .lad-g-todo { color: var(--warn); font-size: 12px; margin-left: 4px; }
    .lad-qs { display: flex; flex-wrap: wrap; gap: 6px; }
    .lad-q { font: inherit; font-size: 13px; min-height: 40px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; }
    .lad-q-locked { color: var(--text-muted); background: var(--surface-subtle); }
    .lad-q-open { border-color: var(--primary); }
    .lad-q-done { border-color: var(--ok); background: var(--ok-soft); }
    .lad-q.is-open { outline: 2px solid var(--navy); outline-offset: 1px; }
    .lad-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .lad-detail { margin-top: 10px; padding: 10px 12px; border-radius: var(--radius); background: var(--surface-subtle); }
    .lad-detail[hidden] { display: none; }
    .lad-detail-topic { font-size: 13px; color: var(--text-muted); margin: 2px 0 6px; }
    .lad-detail-text { margin: 6px 0; font-size: 14px; }
    .lad-st { font-size: 12px; padding: 1px 8px; border-radius: 10px; margin-left: 6px; }
    .lad-st-locked { background: var(--warn-soft); color: var(--warn); }
    .lad-st-open { background: var(--primary-soft); color: var(--primary); }
    .lad-st-done { background: var(--ok-soft); color: var(--ok); }
    .lad-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .lad-actions .btn { min-height: 40px; }
    .lad-path { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 6px 0; }
    .lad-arrow { color: var(--text-muted); font-size: 13px; }
    .lad-chip { font-size: 13px; padding: 3px 9px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); }
    .lad-chip-done { background: var(--ok-soft); border-color: var(--ok); color: var(--ok); }
    .lad-chip-now { background: var(--primary-soft); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    .lad-box { margin-top: 12px; padding: 12px; border-radius: var(--radius); border: 1px solid var(--mustard); background: var(--mustard-soft); }
    .lad-box-title { font-weight: 600; font-size: 14px; }
    .lad-desc { margin: 4px 0 8px; padding-left: 18px; font-size: 13px; color: var(--text-muted); }
    .lad-note { font-size: 13px; color: var(--text-muted); }
    .lad-go { width: 100%; min-height: 44px; }
    .lad-banner { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 0 0 10px; padding: 8px 10px; border-radius: var(--radius); background: var(--mustard-soft); }
    .lad-banner-label { font-size: 12px; font-weight: 600; margin-right: 4px; }
    .lad-gate { text-align: center; padding: 24px 16px; }
    .lad-gate .lad-path { justify-content: center; }
    .lad-gate-title { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
    .lad-gate-text { color: var(--text-muted); font-size: 14px; }
  `;
  document.head.appendChild(style);

  window.EJU_LADDER_HOOK = {
    today: renderHome,
    feedback: renderFeedbackBox,
    rendered(card) {
      clearStudyExtras();
      if (!mini) return;
      if (!miniActive()) {
        mini = null;
        return;
      }
      if (card.id === mini.targetId && !mini.gateDone) showGate();
      else showBanner(card);
    },
    sessionEnd() {
      if (!mini) return false;
      const m = mini;
      const ok = m.queueRef === A.getSession().queue;
      mini = null;
      if (!ok || !m.parent) return false;
      restoreParent(m.parent);
      return true;
    }
  };

  // 供自测使用
  window.EJU_LADDER_API = {statusOf, conceptMastered, cardDone, renderHome};

  window.addEventListener('eju-state-saved', () => {
    if ($('#view-today')?.classList.contains('is-active')) renderHome();
  });
  renderHome();
})();
