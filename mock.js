// 刷真题：按一整回真题模拟 EJU 数学コース1 —— 80 分钟计时、マーク式答题卡、考试中不显示对错、交卷后出报告
// 进行中的考试存在 localStorage（eju-mock-run），刷新后按开考时间继续倒计时。
(function () {
  'use strict';

  const RUN_KEY = 'eju-mock-run';
  const $ = sel => document.querySelector(sel);
  const app = () => window.EJU_APP;
  const bank = () => window.EJU_BANK || [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const KEYS = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let run = null; // the exam in progress
  let report = null; // result being shown
  let timer = null;
  let active = null; // {cardId, key, idx}: the answer cell receiving input
  let paperOpen = false;

  // ─── sittings (one past paper = one exam) ───
  function sittings() {
    const map = new Map();
    for (const c of bank()) {
      const m = /^(\d{4})第(\d)回\s*(.*)$/.exec(c.source || '');
      if (!m || !c.id.startsWith('real-') || c.type !== 'mark') continue;
      const id = `${m[1]}-${m[2]}`;
      if (!map.has(id)) map.set(id, {id, label: `${m[1]}年第${m[2]}回`, cards: []});
      map.get(id).cards.push(c);
    }
    return [...map.values()].filter(s => s.cards.length >= 6).sort((a, b) => b.id.localeCompare(a.id));
  }
  const cardById = id => bank().find(c => c.id === id);
  const sectionOf = c => ((/^\d{4}第\d回\s*(\S+)/.exec(c.source) || [])[1] || '').replace(/[（(].*$/, '');
  const blankCount = cards => cards.reduce((n, c) => n + (c.blanks || []).length, 0);

  function loadRun() {
    try { run = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); } catch (_) { run = null; }
  }
  function saveRun() {
    try {
      if (run) localStorage.setItem(RUN_KEY, JSON.stringify(run));
      else localStorage.removeItem(RUN_KEY);
    } catch (_) {}
  }

  // ─── lobby ───
  function renderLobby() {
    stopTimer();
    const root = $('#mockRoot');
    const list = sittings();
    const past = (app().getState().mocks || []).filter(m => m.real).slice().reverse().slice(0, 6);
    root.innerHTML = `
      <article class="card">
        <div class="section-head"><div>
          <h2 class="section-title">数学真题模考</h2>
          <p class="section-sub">整回真题、按原卷顺序、倒计时自动交卷。考试中不显示对错，交卷后再看报告和解析。</p>
        </div></div>
        ${run ? `<div class="mock-resume"><b>有一场考试进行中</b>（${esc(run.label)}）<button class="btn btn-primary btn-sm" id="mockResumeBtn" type="button">继续考试</button></div>` : ''}
        <div class="mock-opts">
          <label>时长
            <select id="mockDuration" class="select-compact">
              <option value="80">80 分钟（正式）</option>
              <option value="40">40 分钟（半场冲刺）</option>
              <option value="0">不限时（练习）</option>
            </select>
          </label>
        </div>
        <div class="mock-sittings">
          ${list.map(s => `<button class="mock-sitting" data-sit="${s.id}" type="button">
            <b>${s.label}</b><span>${s.cards.length} 道 · ${blankCount(s.cards)} 空</span></button>`).join('')}
        </div>
        <p class="stat-hint">文综的仿真卷模考是单独的页面，还没做（任务书见 docs/mock_bunso_prompt.md）。</p>
      </article>
      <article class="card">
        <h3 class="section-title">模考记录</h3>
        <div id="mockRecent" class="mock-list">${past.map(recentRow).join('') || '<p class="stat-hint">还没有模考记录。</p>'}</div>
      </article>`;
    $('#mockResumeBtn')?.addEventListener('click', () => { startTimer(); renderExam(); });
    root.querySelectorAll('.mock-sitting').forEach(b => b.addEventListener('click', () => {
      if (run && !confirm('已有进行中的考试，开始新的会放弃它。继续吗？')) return;
      startExam(b.dataset.sit, Number($('#mockDuration').value));
    }));
    root.querySelectorAll('[data-mock-assign]').forEach(b => b.addEventListener('click', () => {
      window.EJU_HW?.quickAssign(b.dataset.mockAssign.split(','), '模考错题订正');
    }));
  }

  function recentRow(m) {
    const rate = m.total ? Math.round((m.correct / m.total) * 100) : 0;
    const assign = window.EJU_SYNC?.isTeacher?.() && m.wrongIds?.length
      ? `<button class="btn btn-xs" data-mock-assign="${esc(m.wrongIds.join(','))}" type="button">错题布置为作业</button>` : '';
    return `<div class="mock-row"><span><b>${esc(m.note || '真题模考')}</b> · 正确 ${m.correct}/${m.total} 空（${rate}%）</span>
      <span class="stat-hint">${m.date}${m.by ? ' · ' + esc(m.by) : ''}</span>${assign}</div>`;
  }

  // ─── exam ───
  function startExam(sitId, minutes) {
    const s = sittings().find(x => x.id === sitId);
    if (!s) return;
    run = {sitting: s.id, label: s.label, ids: s.cards.map(c => c.id), startedAt: Date.now(),
      durationMs: minutes * 60000, answers: {}, flags: {}, spent: {}, cur: 0, curSince: Date.now()};
    saveRun();
    active = null;
    paperOpen = false;
    startTimer();
    renderExam();
  }

  function remainingMs() {
    return run.durationMs ? run.startedAt + run.durationMs - Date.now() : Infinity;
  }
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!run) return stopTimer();
      const left = remainingMs();
      if (left <= 0) { submit(true); return; }
      paintTimer();
    }, 1000);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }
  function paintTimer() {
    const el = $('#mockClock');
    if (!el || !run) return;
    if (!run.durationMs) {
      const s = Math.floor((Date.now() - run.startedAt) / 1000);
      el.textContent = `已用 ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      return;
    }
    const s = Math.max(0, Math.ceil(remainingMs() / 1000));
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    el.classList.toggle('is-low', s < 600);
  }

  function bookTime() {
    if (!run) return;
    const id = run.ids[run.cur];
    run.spent[id] = (run.spent[id] || 0) + (Date.now() - run.curSince);
    run.curSince = Date.now();
  }
  function go(i) {
    if (i < 0 || i >= run.ids.length) return;
    bookTime();
    run.cur = i;
    active = null;
    paperOpen = false;
    saveRun();
    renderExam();
  }

  const cellsOf = (id, b) => {
    const a = (run.answers[id] || {})[b.key] || [];
    return Array.from({length: b.len}, (_, i) => a[i] || '');
  };
  const answeredCount = id => {
    const c = cardById(id);
    return (c.blanks || []).filter(b => cellsOf(id, b).some(Boolean)).length;
  };

  function renderExam() {
    const root = $('#mockRoot');
    const id = run.ids[run.cur];
    const card = cardById(id);
    if (!active) active = {cardId: id, key: card.blanks[0].key, idx: 0};
    root.innerHTML = `
      <article class="card mock-exam">
        <div class="mock-bar">
          <div><b>${esc(run.label)}</b> · 第 ${run.cur + 1} / ${run.ids.length} 题 · ${esc(sectionOf(card))}</div>
          <div class="mock-clock" id="mockClock"></div>
        </div>
        <div class="mock-nav">${run.ids.map((qid, i) => {
          const n = answeredCount(qid), total = cardById(qid).blanks.length;
          return `<button type="button" class="mock-chip${i === run.cur ? ' is-cur' : ''}${n === total ? ' is-done' : n ? ' is-part' : ''}${run.flags[qid] ? ' is-flag' : ''}" data-go="${i}">${i + 1}</button>`;
        }).join('')}</div>
        <div class="mock-q" id="mockQ"></div>
        <div class="mock-actions">
          ${card.paperImg ? '<button class="btn btn-sm" id="mockPaperBtn" type="button">看原卷图</button>' : ''}
          <button class="btn btn-sm${run.flags[id] ? ' btn-primary' : ''}" id="mockFlagBtn" type="button">${run.flags[id] ? '已标记待检查' : '标记待检查'}</button>
        </div>
        <img id="mockPaperImg" class="mock-paper" alt="原卷" ${paperOpen ? `src="${esc(card.paperImg || '')}"` : 'hidden'}>
        <div class="mock-sheet" id="mockSheet">${card.blanks.map(b => `
          <div class="mock-blank"><span class="mock-blank-label">${esc(b.label)}</span>
            ${cellsOf(id, b).map((v, i) => `<button type="button" class="mock-cell${active.key === b.key && active.idx === i ? ' is-active' : ''}" data-key="${b.key}" data-idx="${i}">${v || ''}</button>`).join('')}
          </div>`).join('')}</div>
        <div class="mock-pad" id="mockPad">${KEYS.map(k => `<button type="button" class="mock-key" data-k="${k}">${k === '-' ? '−' : k}</button>`).join('')}<button type="button" class="mock-key mock-key-wide" data-k="del">清除</button></div>
        <div class="mock-foot">
          <button class="btn" id="mockPrev" type="button" ${run.cur === 0 ? 'disabled' : ''}>上一题</button>
          <button class="btn" id="mockNext" type="button" ${run.cur === run.ids.length - 1 ? 'disabled' : ''}>下一题</button>
          <button class="btn btn-primary" id="mockSubmit" type="button">交卷</button>
        </div>
      </article>`;
    const q = $('#mockQ');
    q.textContent = card.q;
    app().renderMath(q);
    paintTimer();
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.go))));
    root.querySelectorAll('.mock-cell').forEach(b => b.addEventListener('click', () => {
      active = {cardId: id, key: b.dataset.key, idx: Number(b.dataset.idx)};
      renderSheetOnly();
    }));
    root.querySelectorAll('.mock-key').forEach(b => b.addEventListener('click', () => input(b.dataset.k)));
    $('#mockPrev').addEventListener('click', () => go(run.cur - 1));
    $('#mockNext').addEventListener('click', () => go(run.cur + 1));
    $('#mockSubmit').addEventListener('click', () => {
      const left = run.ids.reduce((n, qid) => n + cardById(qid).blanks.filter(b => !cellsOf(qid, b).some(Boolean)).length, 0);
      if (confirm(left ? `还有 ${left} 个空没填，确定交卷吗？` : '确定交卷吗？')) submit(false);
    });
    $('#mockFlagBtn').addEventListener('click', () => {
      run.flags[id] = !run.flags[id];
      saveRun();
      renderExam();
    });
    $('#mockPaperBtn')?.addEventListener('click', () => {
      paperOpen = !paperOpen;
      const img = $('#mockPaperImg');
      if (paperOpen) { img.src = card.paperImg; img.hidden = false; } else img.hidden = true;
    });
  }

  function renderSheetOnly() {
    const sc = window.scrollY;
    renderExam();
    window.scrollTo(0, sc);
  }

  function input(k) {
    if (!run || !active) return;
    const id = active.cardId;
    const card = cardById(id);
    const b = card.blanks.find(x => x.key === active.key);
    const cells = cellsOf(id, b);
    if (k === 'del') {
      cells[active.idx] = '';
    } else {
      cells[active.idx] = k;
      if (active.idx < b.len - 1) active.idx += 1;
      else {
        const bi = card.blanks.indexOf(b);
        if (bi < card.blanks.length - 1) active = {cardId: id, key: card.blanks[bi + 1].key, idx: 0};
      }
    }
    run.answers[id] = run.answers[id] || {};
    run.answers[id][b.key] = cells;
    saveRun();
    renderSheetOnly();
  }

  document.addEventListener('keydown', e => {
    if (!run || app()?.currentRoute() !== 'mock' || report) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (/^[0-9]$/.test(e.key) || e.key === '-') input(e.key);
    else if (e.key === 'Backspace') input('del');
  });

  // ─── grading & report ───
  function submit(auto) {
    if (!run) return;
    bookTime();
    stopTimer();
    const r = run;
    const rows = r.ids.map(id => {
      const card = cardById(id);
      const detail = card.blanks.map(b => {
        const mine = cellsOf2(r, id, b).join('');
        return {label: b.label, mine, ans: String(b.ans), ok: mine === String(b.ans).trim()};
      });
      return {id, source: card.source, section: sectionOf(card), detail, ok: detail.every(d => d.ok),
        got: detail.filter(d => d.ok).length, spentMs: r.spent[id] || 0};
    });
    const correct = rows.reduce((n, x) => n + x.got, 0);
    const total = rows.reduce((n, x) => n + x.detail.length, 0);
    const wrongIds = rows.filter(x => !x.ok).map(x => x.id);
    const state = app().getState();
    state.mocks = state.mocks || [];
    const me = window.EJU_SYNC?.myName?.();
    const rec = {mid: `m${Date.now().toString(36)}`, subject: '数学コース1', real: true, sitting: r.sitting,
      score: Math.round((correct / total) * 100), correct, total, wrongIds,
      spentMs: Date.now() - r.startedAt, note: `${r.label} 真题模考${auto ? '（时间到自动交卷）' : ''}`,
      date: app().today(), by: me || undefined};
    state.mocks.push(rec);
    for (const x of rows) app().recordCardGrade(cardById(x.id), x.ok ? 'good' : 'again');
    app().saveState();
    report = {rec, rows, auto};
    run = null;
    saveRun();
    renderReport();
  }
  function cellsOf2(r, id, b) {
    const a = (r.answers[id] || {})[b.key] || [];
    return Array.from({length: b.len}, (_, i) => a[i] || '');
  }

  const fmt = ms => `${Math.floor(ms / 60000)}分${String(Math.round(ms / 1000) % 60).padStart(2, '0')}秒`;

  function renderReport() {
    const {rec, rows, auto} = report;
    const secs = {};
    for (const x of rows) {
      const s = secs[x.section] = secs[x.section] || {got: 0, total: 0};
      s.got += x.got;
      s.total += x.detail.length;
    }
    $('#mockRoot').innerHTML = `
      <article class="card mock-report">
        <h2 class="section-title">${esc(rec.note)}</h2>
        ${auto ? '<p class="stat-hint">时间到，已自动交卷。</p>' : ''}
        <div class="mock-score"><b>${rec.correct}</b> / ${rec.total} 空 · ${rec.score}% · 用时 ${fmt(rec.spentMs)}</div>
        <p class="stat-hint">这里只统计正确空数，不换算 200 分制（EJU 的换算分取决于当回难度）。错题已进错题本。</p>
        <div class="mock-secs">${Object.entries(secs).map(([k, v]) => `<div><span>${esc(k)}</span><b>${v.got}/${v.total}</b></div>`).join('')}</div>
        <div class="mock-rows">${rows.map(x => `
          <div class="mock-rrow ${x.ok ? 'is-ok' : 'is-bad'}">
            <div><b>${esc(x.source.replace(/^\d{4}第\d回\s*/, ''))}</b> · ${x.got}/${x.detail.length} 空 · ${fmt(x.spentMs)}</div>
            ${x.ok ? '' : `<div class="mock-wrongs">${x.detail.filter(d => !d.ok).map(d => `${esc(d.label)} 你的答案 <b>${esc(d.mine || '空')}</b> → 正解 <b>${esc(d.ans)}</b>`).join('　')}</div>`}
            <button class="btn btn-xs" data-explain="${esc(x.id)}" type="button">看解析</button>
          </div>`).join('')}</div>
        <div class="mock-foot"><button class="btn btn-primary" id="mockAgain" type="button">回到模考首页</button></div>
      </article>`;
    document.querySelectorAll('[data-explain]').forEach(b => b.addEventListener('click', () => {
      app().switchRoute('math');
      app().openTutorCard(b.dataset.explain);
    }));
    $('#mockAgain').addEventListener('click', () => { report = null; renderLobby(); });
    window.scrollTo(0, 0);
  }

  function render() {
    if (!run) loadRun();
    if (report) return renderReport();
    if (run && remainingMs() <= 0) return submit(true);
    if (run && timer) return renderExam();
    renderLobby();
  }

  loadRun();
  window.EJU_MOCK = {render};
})();
