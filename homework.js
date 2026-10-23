// 作业：讲课的一方布置（题库真题或自己出的题）→ 学习的一方作答、写过程（白板或拍照）→ 提交 → 批改退回 → 订正
// Data lives in the app state (state.hw) and travels through sync.js as events:
//   assignment (teacher)  {title, note, dueAt, dueText, items: [{id, cardId} | {id, text, images}], createdAt, by, deleted}
//   submission (student)  {title, round, submittedAt, items: {[itemId]: {answer, photos, spentMs}}, history: [...]}
//   grade      (teacher)  {title, round, returnedAt, items: {[itemId]: {verdict: ok|half|wrong, comment}}, summary}
(function () {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const app = () => window.EJU_APP;
  const isTeacher = () => Boolean(window.EJU_SYNC?.isTeacher?.());
  const inGroup = () => Boolean(window.EJU_SYNC?.role?.());
  const bank = () => window.EJU_BANK || [];
  const cardById = id => bank().find(c => c.id === id);
  const VERDICT = {ok: '对', half: '半对', wrong: '错'};

  let openId = null; // assignment shown in detail
  let editor = null; // teacher's draft of a new assignment
  let itemOpenedAt = {}; // itemId -> ms when the student started on it (for 用时)

  function hw() {
    const state = app().getState();
    state.hw = state.hw || {};
    for (const k of ['assignments', 'submissions', 'grades']) state.hw[k] = state.hw[k] || {};
    return state.hw;
  }

  function save() {
    app().saveState();
    renderBadge();
  }

  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDue(ms) {
    const d = new Date(ms);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const newId = p => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  function assignments() {
    return Object.entries(hw().assignments)
      .filter(([, a]) => a && !a.deleted)
      .map(([id, a]) => ({id, ...a}))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // open → submitted → returned (graded); after a return, wrong items can be corrected in a new round
  function status(id) {
    const sub = hw().submissions[id];
    const grade = hw().grades[id];
    if (grade?.returnedAt && sub?.submittedAt && grade.round === (sub.round || 1)) return 'returned';
    if (sub?.submittedAt) return 'submitted';
    if (sub && (sub.round || 1) > 1) return 'correcting';
    return 'open';
  }

  const STATUS_LABEL = {
    open: ['待完成', '待对方完成'],
    correcting: ['订正中', '对方订正中'],
    submitted: ['已提交 · 等批改', '待批改'],
    returned: ['已批改', '已批改'],
  };
  const statusText = id => STATUS_LABEL[status(id)][isTeacher() ? 1 : 0];

  // ─── auto-check for questions from the bank ───
  function autoCheck(card, answer) {
    if (!card || answer == null || answer === '') return null;
    if (card.type === 'mcq') return Number(answer) === card.a;
    if (card.type === 'mark') {
      const want = (card.blanks || []).map(b => String(b.ans)).join('');
      return String(answer).replace(/\s/g, '') === want;
    }
    return null;
  }

  function answerText(card, answer) {
    if (answer == null || answer === '') return '（没填）';
    if (card?.type === 'mcq') return `(${Number(answer) + 1}) ${card.choices[Number(answer)] || ''}`;
    if (card?.type === 'mark') {
      let i = 0;
      return (card.blanks || []).map(b => {
        const part = String(answer).slice(i, i + (b.len || String(b.ans).length));
        i += b.len || String(b.ans).length;
        return `${b.label}=${part || '?'}`;
      }).join('  ');
    }
    return String(answer);
  }

  // ─── photos: shrink on the device, then upload (keeps phone data and the server small) ───
  async function compressImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = url;
      });
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', 0.82));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function uploadPhoto(file) {
    const blob = await compressImage(file);
    const token = JSON.parse(localStorage.getItem('eju-group-token') || 'null');
    const res = await fetch('/api/v2/files', {method: 'POST', headers: {'Content-Type': 'image/jpeg', Authorization: `Bearer ${token}`}, body: blob});
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.url;
  }

  // ─── the work board of one item (a whiteboard page both people write on) ───
  function boardIdFor(aid, itemId) {
    return `page-hw-${aid}-${itemId}`;
  }

  function openWorkBoard(a, item, idx) {
    const boardId = boardIdFor(a.id, item.id);
    const state = app().getState();
    state.boardPages = state.boardPages || {};
    if (!state.boardPages[boardId]) {
      state.boardPages[boardId] = {title: `作业「${a.title}」第 ${idx + 1} 题`, at: Date.now()};
      app().saveState();
    }
    const card = cardById(item.cardId);
    const mathCard = card && /数/.test(card.deck) ? card.id : null;
    app().openBoard(boardId, mathCard);
    // The teacher marks up the student's photos: put them on the board once, under the red pen
    if (isTeacher()) {
      const photos = hw().submissions[a.id]?.items?.[item.id]?.photos || [];
      const wb = window.EJU_WHITEBOARD;
      const placed = new Set((wb?.ownStrokes(boardId) || []).filter(s => s.kind === 'image').map(s => s.src));
      setTimeout(() => photos.filter(p => !placed.has(p)).forEach(p => wb?.addImage(p, '作业照片')), 120);
    }
  }

  // ═══ rendering ═══
  function render() {
    const root = $('#hwRoot');
    if (!root) return;
    renderBadge();
    if (!inGroup()) {
      root.innerHTML = `<article class="card hw-empty"><h2 class="section-title">作业</h2>
        <p>先在右上角「云同步」里加入小组：讲课的一方布置作业，学习的一方在这里写、提交，批改后会退回来。</p></article>`;
      return;
    }
    if (editor) return renderEditor(root);
    const a = openId && hw().assignments[openId];
    if (a && !a.deleted) return renderDetail(root, {id: openId, ...a});
    openId = null;
    renderList(root);
  }

  function renderList(root) {
    const list = assignments();
    const teacher = isTeacher();
    const groups = teacher
      ? [['待批改', list.filter(a => status(a.id) === 'submitted')],
         ['进行中', list.filter(a => ['open', 'correcting'].includes(status(a.id)))],
         ['已批改', list.filter(a => status(a.id) === 'returned')]]
      : [['要做的', list.filter(a => ['open', 'correcting'].includes(status(a.id)))],
         ['等批改', list.filter(a => status(a.id) === 'submitted')],
         ['已批改', list.filter(a => status(a.id) === 'returned')]];
    root.innerHTML = `
      <article class="card">
        <div class="hw-head">
          <h2 class="section-title">作业</h2>
          ${teacher ? '<button class="btn btn-primary" id="hwNewBtn" type="button">布置作业</button>' : ''}
        </div>
        ${list.length ? '' : `<p class="hw-muted">${teacher ? '还没有布置过作业。' : '还没有作业，等对方布置。'}</p>`}
        ${groups.filter(([, l]) => l.length).map(([title, l]) => `
          <h3 class="hw-group-title">${title}（${l.length}）</h3>
          <ul class="hw-list">${l.map(a => listItem(a)).join('')}</ul>`).join('')}
      </article>`;
    $('#hwNewBtn')?.addEventListener('click', () => {
      editor = {title: '', note: '', due: '', items: []};
      render();
    });
    root.querySelectorAll('[data-hw-open]').forEach(el => el.addEventListener('click', () => {
      openId = el.dataset.hwOpen;
      render();
      window.scrollTo({top: 0});
    }));
  }

  function listItem(a) {
    const grade = hw().grades[a.id];
    const st = status(a.id);
    const overdue = a.dueAt && Date.now() > a.dueAt && ['open', 'correcting'].includes(st);
    return `<li class="hw-item" data-hw-open="${esc(a.id)}">
      <div class="hw-item-main">
        <span class="hw-item-title">${esc(a.title)}</span>
        <span class="hw-muted">${a.items.length} 题${a.dueText ? ` · 截止 ${esc(a.dueText)}` : ''}${st === 'returned' && grade?.summary ? ` · ${esc(grade.summary)}` : ''}</span>
      </div>
      <span class="hw-status hw-status-${st}${overdue ? ' is-overdue' : ''}">${overdue ? '已过截止' : statusText(a.id)}</span>
    </li>`;
  }

  // ─── detail: the student works / the teacher grades ───
  function renderDetail(root, a) {
    const teacher = isTeacher();
    const st = status(a.id);
    const sub = hw().submissions[a.id] || {};
    const grade = hw().grades[a.id] || {};
    // Verdicts reach the student only once returned; the teacher sees her own draft while grading
    const graded = st === 'returned';
    // Student edits while open/correcting; in a correction round only the items not marked 对
    const prevGrade = sub.round > 1 ? (sub.history || []).slice(-1)[0]?.grade : null;
    const editable = idx => !teacher && ['open', 'correcting'].includes(st)
      && (!prevGrade || prevGrade.items?.[a.items[idx].id]?.verdict !== 'ok');

    root.innerHTML = `
      <article class="card">
        <div class="hw-head">
          <button class="btn btn-sm" id="hwBackBtn" type="button">← 作业列表</button>
          <span class="hw-status hw-status-${st}">${statusText(a.id)}${sub.round > 1 ? ` · 第 ${sub.round} 次` : ''}</span>
        </div>
        <h2 class="section-title hw-title">${esc(a.title)}</h2>
        <p class="hw-muted">${a.items.length} 题${a.dueText ? ` · 截止 ${esc(a.dueText)}` : ''}${a.by ? ` · ${esc(a.by)} 布置` : ''}</p>
        ${a.note ? `<p class="hw-note">${esc(a.note)}</p>` : ''}
        ${graded && grade.summary ? `<p class="hw-summary">批改结果：${esc(grade.summary)}${grade.comment ? `　${esc(grade.comment)}` : ''}</p>` : ''}
      </article>
      ${a.items.map((item, idx) => itemCard(a, item, idx, {teacher, sub, grade, graded, editable: editable(idx), st})).join('')}
      <article class="card hw-actions">${detailActions(a, st, teacher, sub, grade)}</article>`;

    bindDetail(root, a, st, teacher);
    app().renderMath(root);
  }

  function itemCard(a, item, idx, {teacher, sub, grade, graded, editable, st}) {
    const card = cardById(item.cardId);
    const mine = sub.items?.[item.id] || {};
    const g = grade.items?.[item.id] || {};
    const auto = card ? autoCheck(card, mine.answer) : null;
    const showResult = teacher ? Boolean(sub.submittedAt || graded) : graded;
    const verdict = graded ? g.verdict : null;
    let question;
    if (card) {
      question = `<div class="hw-q">${esc(card.q)}</div>${card.q_cn ? `<div class="hw-q-cn">${esc(card.q_cn)}</div>` : ''}`;
    } else {
      question = `<div class="hw-q">${esc(item.text || '')}</div>${(item.images || []).map(u => `<img class="hw-q-img" src="${esc(u)}" alt="题目图片">`).join('')}`;
    }

    let answerUi = '';
    if (editable) {
      if (card?.type === 'mcq') {
        answerUi = `<div class="hw-choices">${card.choices.map((ch, i) => `
          <button type="button" class="hw-choice${Number(mine.answer) === i && mine.answer !== '' && mine.answer != null ? ' is-picked' : ''}" data-hw-pick="${item.id}" data-i="${i}">
            <b>${i + 1}</b> ${esc(ch)}${card.choices_cn?.[i] && card.choices_cn[i] !== ch ? `<small>${esc(card.choices_cn[i])}</small>` : ''}</button>`).join('')}</div>`;
      } else if (card?.type === 'mark') {
        const total = (card.blanks || []).reduce((n, b) => n + (b.len || String(b.ans).length), 0);
        answerUi = `<label class="hw-field"><span>按顺序填数字（${(card.blanks || []).map(b => b.label).join(' ')}，共 ${total} 位）</span>
          <input type="text" inputmode="numeric" data-hw-answer="${item.id}" maxlength="${total + 4}" value="${esc(mine.answer || '')}" placeholder="例如 ${'0'.repeat(Math.min(total, 6))}"></label>`;
      } else {
        answerUi = `<label class="hw-field"><span>答案</span><textarea data-hw-answer="${item.id}" rows="2" placeholder="写最后的答案；过程可以写在白板上或拍照">${esc(mine.answer || '')}</textarea></label>`;
      }
    } else if (mine.answer != null && mine.answer !== '' || teacher) {
      answerUi = `<p class="hw-answer">作答：${esc(answerText(card, mine.answer))}${showResult && auto != null ? ` <span class="hw-auto ${auto ? 'is-ok' : 'is-bad'}">${auto ? '✓ 和正确答案一致' : `✗ 正确：${esc(answerText(card, card.type === 'mcq' ? card.a : (card.blanks || []).map(b => b.ans).join('')))}`}</span>` : ''}</p>`;
    }

    const photos = (mine.photos || []).map((u, pi) => `<span class="hw-photo"><img src="${esc(u)}" alt="作业照片" data-hw-zoom="${esc(u)}">${editable ? `<button type="button" class="hw-photo-del" data-hw-del="${item.id}" data-pi="${pi}" title="删除">×</button>` : ''}</span>`).join('');

    const gradeUi = teacher && (st === 'submitted' || st === 'returned')
      ? `<div class="hw-grade" data-item="${item.id}">
          ${['ok', 'half', 'wrong'].map(v => `<button type="button" class="hw-verdict hw-v-${v}${g.verdict === v ? ' is-on' : ''}" data-hw-verdict="${v}" ${st === 'returned' ? 'disabled' : ''}>${VERDICT[v]}</button>`).join('')}
          <input type="text" class="hw-comment" data-hw-comment="${item.id}" value="${esc(g.comment || '')}" placeholder="评语（可不写）" ${st === 'returned' ? 'disabled' : ''}>
        </div>`
      : verdict ? `<p class="hw-verdict-line hw-v-${verdict}">${VERDICT[verdict]}${g.comment ? `：${esc(g.comment)}` : ''}</p>` : '';

    return `<article class="card hw-item-card${verdict ? ` is-${verdict}` : ''}">
      <div class="hw-item-no">第 ${idx + 1} 题${card ? ` · ${esc(card.deck)} · ${esc(card.topic)}` : ' · 自出题'}</div>
      ${question}
      ${answerUi}
      ${photos ? `<div class="hw-photos">${photos}</div>` : ''}
      <div class="hw-item-tools">
        <button type="button" class="btn btn-sm" data-hw-board="${item.id}">${teacher ? '在白板上批注' : editable ? '写过程（白板）' : '看白板 / 批注'}</button>
        ${editable ? `<label class="btn btn-sm hw-upload">拍照上传<input type="file" accept="image/*" capture="environment" data-hw-photo="${item.id}" hidden></label>` : ''}
      </div>
      ${gradeUi}
    </article>`;
  }

  function detailActions(a, st, teacher, sub, grade) {
    if (teacher) {
      if (st === 'submitted') return `<input type="text" id="hwOverallComment" class="hw-comment" placeholder="总评（可不写）" value="${esc(grade.comment || '')}">
        <button class="btn btn-primary" id="hwReturnBtn" type="button">批改完成，退回给对方</button>
        <p class="hw-muted">没选「对 / 半对 / 错」的题，会按自动判分（题库题）记；自出题请逐题选。</p>
        <button class="text-btn" id="hwDeleteBtn" type="button">删除这份作业</button>`;
      return `<p class="hw-muted">${st === 'returned' ? '已退回。对方订正后会再次出现在「待批改」。' : '对方还没提交。'}</p>
        <button class="text-btn" id="hwDeleteBtn" type="button">删除这份作业</button>`;
    }
    if (['open', 'correcting'].includes(st)) {
      return `<button class="btn btn-primary" id="hwSubmitBtn" type="button">提交作业</button>
        <p class="hw-muted">答案会自动保存，可以先关掉之后再写。提交后就不能改了。</p>`;
    }
    if (st === 'returned') {
      const wrong = Object.values(grade.items || {}).some(g => g.verdict !== 'ok');
      return wrong
        ? `<button class="btn btn-primary" id="hwCorrectBtn" type="button">订正错题，再交一次</button>
           <p class="hw-muted">错题已经放进错题本，附上了对方的评语。</p>`
        : '<p class="hw-muted">全对，辛苦了。</p>';
    }
    return `<p class="hw-muted">已提交${sub.submittedAt ? `（${new Date(sub.submittedAt).toLocaleString()}）` : ''}，等对方批改。</p>`;
  }

  function bindDetail(root, a, st, teacher) {
    $('#hwBackBtn').addEventListener('click', () => { openId = null; render(); });
    const draft = () => {
      const subs = hw().submissions;
      const sub = (subs[a.id] = subs[a.id] || {title: a.title, round: 1, submittedAt: null, items: {}});
      sub.title = a.title;
      return sub;
    };
    const touch = itemId => {
      const it = (draft().items[itemId] = draft().items[itemId] || {});
      if (!itemOpenedAt[itemId]) itemOpenedAt[itemId] = Date.now();
      it.spentMs = (it.spentMs || 0) + Math.min(10 * 60000, Date.now() - itemOpenedAt[itemId]);
      itemOpenedAt[itemId] = Date.now();
      return it;
    };

    root.querySelectorAll('[data-hw-pick]').forEach(btn => btn.addEventListener('click', () => {
      touch(btn.dataset.hwPick).answer = Number(btn.dataset.i);
      save();
      render();
    }));
    root.querySelectorAll('[data-hw-answer]').forEach(inp => inp.addEventListener('change', () => {
      touch(inp.dataset.hwAnswer).answer = inp.value.trim();
      save();
    }));
    root.querySelectorAll('[data-hw-photo]').forEach(inp => inp.addEventListener('change', async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const label = inp.parentElement;
      label.classList.add('is-busy');
      label.firstChild.textContent = '上传中…';
      try {
        const url = await uploadPhoto(file);
        const it = touch(inp.dataset.hwPhoto);
        it.photos = [...(it.photos || []), url];
        save();
        render();
      } catch (err) {
        alert(`上传失败：${err.message}`);
        render();
      }
    }));
    root.querySelectorAll('[data-hw-del]').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('删除这张照片？')) return;
      const it = touch(btn.dataset.hwDel);
      it.photos.splice(Number(btn.dataset.pi), 1);
      save();
      render();
    }));
    root.querySelectorAll('[data-hw-zoom]').forEach(img => img.addEventListener('click', () => window.open(img.dataset.hwZoom, '_blank')));
    root.querySelectorAll('[data-hw-board]').forEach(btn => btn.addEventListener('click', () => {
      const idx = a.items.findIndex(it => it.id === btn.dataset.hwBoard);
      openWorkBoard(a, a.items[idx], idx);
    }));

    // teacher grading (kept as a draft grade until returned)
    const gradeDraft = () => {
      const grades = hw().grades;
      const sub = hw().submissions[a.id] || {};
      const g = (grades[a.id] = grades[a.id] || {title: a.title, round: sub.round || 1, returnedAt: null, items: {}});
      if (g.round !== (sub.round || 1)) Object.assign(g, {round: sub.round || 1, returnedAt: null, items: {}, summary: ''});
      return g;
    };
    root.querySelectorAll('[data-hw-verdict]').forEach(btn => btn.addEventListener('click', () => {
      const itemId = btn.closest('.hw-grade').dataset.item;
      const g = gradeDraft();
      g.items[itemId] = {...(g.items[itemId] || {}), verdict: btn.dataset.hwVerdict};
      save();
      render();
    }));
    root.querySelectorAll('[data-hw-comment]').forEach(inp => inp.addEventListener('change', () => {
      const g = gradeDraft();
      g.items[inp.dataset.hwComment] = {...(g.items[inp.dataset.hwComment] || {}), comment: inp.value.trim()};
      save();
    }));

    $('#hwSubmitBtn')?.addEventListener('click', () => {
      const sub = draft();
      const empty = a.items.filter(it => {
        const m = sub.items[it.id];
        return !m || ((m.answer == null || m.answer === '') && !(m.photos || []).length);
      }).length;
      if (!confirm(empty ? `还有 ${empty} 题没写，确定提交？` : '确定提交？提交后就不能改了。')) return;
      sub.submittedAt = Date.now();
      save();
      render();
    });

    $('#hwReturnBtn')?.addEventListener('click', () => {
      const g = gradeDraft();
      const sub = hw().submissions[a.id] || {};
      const missing = [];
      a.items.forEach((item, idx) => {
        if (g.items[item.id]?.verdict) return;
        const auto = autoCheck(cardById(item.cardId), sub.items?.[item.id]?.answer);
        if (auto == null) missing.push(idx + 1);
        else g.items[item.id] = {...(g.items[item.id] || {}), verdict: auto ? 'ok' : 'wrong'};
      });
      if (missing.length) {
        alert(`第 ${missing.join('、')} 题还没判「对 / 半对 / 错」。`);
        save();
        return render();
      }
      const ok = a.items.filter(it => g.items[it.id].verdict === 'ok').length;
      const half = a.items.filter(it => g.items[it.id].verdict === 'half').length;
      g.summary = `${ok}/${a.items.length} 对${half ? `，${half} 题半对` : ''}`;
      g.comment = $('#hwOverallComment')?.value.trim() || '';
      g.returnedAt = Date.now();
      save();
      render();
    });

    $('#hwCorrectBtn')?.addEventListener('click', () => {
      const sub = hw().submissions[a.id];
      const g = hw().grades[a.id];
      sub.history = [...(sub.history || []), {round: sub.round || 1, submittedAt: sub.submittedAt, items: sub.items, grade: g}];
      sub.round = (sub.round || 1) + 1;
      sub.submittedAt = null;
      // Keep the answers that were right; the wrong ones are cleared for a fresh try
      const items = {};
      for (const it of a.items) {
        if (g.items?.[it.id]?.verdict === 'ok') items[it.id] = sub.items[it.id];
      }
      sub.items = items;
      save();
      render();
    });

    $('#hwDeleteBtn')?.addEventListener('click', () => {
      if (!confirm(`删除作业「${a.title}」？对方那边也会消失。`)) return;
      hw().assignments[a.id] = {...hw().assignments[a.id], deleted: true};
      openId = null;
      save();
      render();
    });
  }

  // ─── teacher: new assignment editor ───
  function renderEditor(root) {
    const all = bank();
    const state = app().getState();
    const decks = [...new Set(all.map(c => c.deck))];
    const f = editor.filter || {deck: decks.find(d => /数/.test(d)) || decks[0], q: '', wrongOnly: false};
    editor.filter = f;
    const wrongIds = new Set(Object.entries(state.progress || {}).filter(([, p]) => p?.inWrongBook).map(([id]) => id));
    const chosen = new Set(editor.items.filter(it => it.cardId).map(it => it.cardId));
    const pool = all.filter(c => (f.wrongOnly ? wrongIds.has(c.id) : c.deck === f.deck)
      && (!f.q || `${c.topic} ${c.q} ${c.q_cn || ''}`.includes(f.q))).slice(0, 60);

    root.innerHTML = `
      <article class="card">
        <div class="hw-head">
          <button class="btn btn-sm" id="hwEditCancel" type="button">← 取消</button>
          <h2 class="section-title">布置作业</h2>
        </div>
        <label class="hw-field"><span>标题</span><input type="text" id="hwTitle" maxlength="40" value="${esc(editor.title)}" placeholder="例如：二次函数 基础 5 题"></label>
        <div class="hw-row">
          <label class="hw-field"><span>截止时间（可不填）</span><input type="datetime-local" id="hwDue" value="${esc(editor.due)}"></label>
        </div>
        <label class="hw-field"><span>备注（可不填）</span><input type="text" id="hwNote" maxlength="120" value="${esc(editor.note)}" placeholder="例如：过程写清楚，拍照上传"></label>

        <h3 class="hw-group-title">已选 ${editor.items.length} 题</h3>
        <ol class="hw-picked">${editor.items.map((it, i) => {
          const c = cardById(it.cardId);
          return `<li><span>${c ? `${esc(c.deck)} · ${esc(c.topic)}` : `自出题：${esc((it.text || '').slice(0, 30))}${it.images?.length ? `（${it.images.length} 张图）` : ''}`}</span>
            <button type="button" class="text-btn" data-hw-unpick="${i}">移除</button></li>`;
        }).join('')}</ol>

        <h3 class="hw-group-title">从题库挑真题</h3>
        <div class="hw-row">
          <select id="hwDeck" class="select-xs">${decks.map(d => `<option ${d === f.deck ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
          <input type="text" id="hwSearch" value="${esc(f.q)}" placeholder="搜考点或题面">
          <label class="wb-check"><input type="checkbox" id="hwWrongOnly" ${f.wrongOnly ? 'checked' : ''}> 只看对方错题（${wrongIds.size}）</label>
        </div>
        <ul class="hw-pool">${pool.map(c => `
          <li><label><input type="checkbox" data-hw-card="${esc(c.id)}" ${chosen.has(c.id) ? 'checked' : ''}>
            <span><b>${esc(c.topic)}</b> ${esc(String(c.q).replace(/\$[^$]*\$/g, '…').slice(0, 50))}</span></label></li>`).join('') || '<li class="hw-muted">没有符合的题</li>'}</ul>

        <h3 class="hw-group-title">自己出一道题</h3>
        <textarea id="hwCustomText" rows="3" placeholder="题目文字（也可以只传图片）"></textarea>
        <div class="hw-row">
          <label class="btn btn-sm hw-upload">加图片<input type="file" accept="image/*" id="hwCustomImg" hidden></label>
          <span class="hw-muted" id="hwCustomImgs">${(editor.customImages || []).length ? `已加 ${editor.customImages.length} 张图` : ''}</span>
          <button class="btn btn-sm" id="hwAddCustom" type="button">加入这道题</button>
        </div>
      </article>
      <article class="card hw-actions">
        <button class="btn btn-primary" id="hwPublish" type="button">布置给对方（${editor.items.length} 题）</button>
      </article>`;

    const keepFields = () => {
      editor.title = $('#hwTitle').value;
      editor.due = $('#hwDue').value;
      editor.note = $('#hwNote').value;
    };
    $('#hwEditCancel').addEventListener('click', () => { editor = null; render(); });
    $('#hwDeck').addEventListener('change', e => { keepFields(); f.deck = e.target.value; f.wrongOnly = false; render(); });
    $('#hwSearch').addEventListener('change', e => { keepFields(); f.q = e.target.value.trim(); render(); });
    $('#hwWrongOnly').addEventListener('change', e => { keepFields(); f.wrongOnly = e.target.checked; render(); });
    root.querySelectorAll('[data-hw-card]').forEach(box => box.addEventListener('change', () => {
      keepFields();
      const id = box.dataset.hwCard;
      if (box.checked) editor.items.push({id: newId('i'), cardId: id});
      else editor.items = editor.items.filter(it => it.cardId !== id);
      render();
    }));
    root.querySelectorAll('[data-hw-unpick]').forEach(btn => btn.addEventListener('click', () => {
      keepFields();
      editor.items.splice(Number(btn.dataset.hwUnpick), 1);
      render();
    }));
    $('#hwCustomImg').addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      keepFields();
      const text = $('#hwCustomText').value;
      $('#hwCustomImgs').textContent = '上传中…';
      try {
        editor.customImages = [...(editor.customImages || []), await uploadPhoto(file)];
      } catch (err) {
        alert(`上传失败：${err.message}`);
      }
      editor.customText = text;
      render();
      $('#hwCustomText').value = editor.customText || '';
    });
    $('#hwAddCustom').addEventListener('click', () => {
      keepFields();
      const text = $('#hwCustomText').value.trim();
      const images = editor.customImages || [];
      if (!text && !images.length) return alert('写题目文字或加一张图片');
      editor.items.push({id: newId('i'), text, images});
      editor.customImages = [];
      editor.customText = '';
      render();
    });
    $('#hwPublish').addEventListener('click', () => {
      keepFields();
      if (!editor.items.length) return alert('还没选题');
      const dueAt = editor.due ? new Date(editor.due).getTime() : null;
      const id = newId('hw');
      hw().assignments[id] = {
        title: editor.title.trim() || `作业 ${new Date().toLocaleDateString()}`,
        note: editor.note.trim(),
        dueAt,
        dueText: dueAt ? formatDue(dueAt) : '',
        items: editor.items,
        createdAt: Date.now(),
        by: window.EJU_SYNC?.myName?.() || '',
      };
      editor = null;
      openId = id;
      save();
      render();
    });
  }

  // ─── badge on the nav tab: things waiting on me ───
  function renderBadge() {
    const badge = $('#navHwBadge');
    if (!badge || !window.EJU_APP) return;
    const list = assignments();
    const n = isTeacher()
      ? list.filter(a => status(a.id) === 'submitted').length
      : list.filter(a => ['open', 'correcting'].includes(status(a.id))).length;
    badge.textContent = String(n);
    badge.hidden = !n;
  }

  // ─── when a graded homework comes back: wrong / half items go into the wrong book with the comment ───
  function applyReturnedGrades() {
    if (isTeacher() || !window.EJU_APP) return;
    const h = hw();
    const state = app().getState();
    state.hwApplied = state.hwApplied || {};
    let changed = false;
    for (const a of assignments()) {
      const g = h.grades[a.id];
      const sub = h.submissions[a.id];
      if (!g?.returnedAt || !sub || g.round !== (sub.round || 1)) continue;
      const key = `${a.id}#${g.round}`;
      if (state.hwApplied[key]) continue;
      state.hwApplied[key] = Date.now();
      changed = true;
      for (const item of a.items) {
        const v = g.items?.[item.id];
        const card = cardById(item.cardId);
        if (!card || !v || v.verdict === 'ok') continue;
        app().addToWrongBook(card, {comment: v.comment || '', title: a.title, verdict: v.verdict, aid: a.id, itemId: item.id});
      }
    }
    if (changed) app().saveState();
  }

  // Called by sync.js after remote homework events arrive
  function onRemote(kinds) {
    applyReturnedGrades();
    renderBadge();
    if (app()?.currentRoute() === 'homework' && !editor) render();
    return kinds;
  }

  window.EJU_HW = {render, renderBadge, onRemote, boardIdFor};

  function init() {
    renderBadge();
    window.addEventListener('eju-state-saved', renderBadge);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
