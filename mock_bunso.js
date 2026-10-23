// 文综仿真卷：从题库按学科比例抽选择题、倒计时、考试中不显示对错，交卷后出分科目报告。
// 题库里没有文综真题，所以这里一律标明「仿真卷，非真题」，也不换算 EJU 分数。
// 进行中的考试存在 localStorage（eju-mockb-run），刷新后按开考时间继续。
(function () {
  'use strict';

  const RUN_KEY = 'eju-mockb-run';
  const $ = sel => document.querySelector(sel);
  const app = () => window.EJU_APP;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const pool = () => (window.EJU_BANK || []).filter(c => c.type === 'mcq' && !/^(real|var)-/.test(c.id) && !/^数|公式/.test(c.deck));
  const cardById = id => (window.EJU_BANK || []).find(c => c.id === id);

  let run = null;
  let report = null;
  let timer = null;
  let cnShown = {}; // cardId -> true once 看不懂 was pressed (日文优先模式)

  const langMode = () => app().getLangMode();
  const loadRun = () => { try { run = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); } catch (_) { run = null; } };
  const saveRun = () => { try { run ? localStorage.setItem(RUN_KEY, JSON.stringify(run)) : localStorage.removeItem(RUN_KEY); } catch (_) {} };
  const fmt = ms => `${Math.floor(ms / 60000)}分${String(Math.round(ms / 1000) % 60).padStart(2, '0')}秒`;

  // Stratified random pick: each deck contributes in proportion to its size in the bank
  function pick(n, scope) {
    const prog = app().getState().progress || {};
    let all = pool();
    if (scope === 'new') all = all.slice().sort((a, b) => (prog[a.id] ? 1 : 0) - (prog[b.id] ? 1 : 0) || Math.random() - 0.5);
    else all = all.slice().sort(() => Math.random() - 0.5);
    const decks = {};
    for (const c of all) (decks[c.deck] = decks[c.deck] || []).push(c);
    n = Math.min(n, all.length);
    const names = Object.keys(decks);
    const quota = {};
    let used = 0;
    for (const d of names) { quota[d] = Math.floor((decks[d].length / all.length) * n); used += quota[d]; }
    const order = names.slice().sort((a, b) => decks[b].length - decks[a].length);
    for (let i = 0; used < n; i = (i + 1) % order.length) if (quota[order[i]] < decks[order[i]].length) { quota[order[i]] += 1; used += 1; }
    const out = [];
    for (const d of names) out.push(...decks[d].slice(0, quota[d]));
    return out.sort(() => Math.random() - 0.5).map(c => c.id);
  }

  function renderLobby() {
    stopTimer();
    const past = (app().getState().mocks || []).filter(m => m.kind === 'bunso').slice().reverse().slice(0, 6);
    $('#mockbRoot').innerHTML = `
      <article class="card">
        <div class="section-head"><div>
          <h2 class="section-title">文综仿真卷</h2>
          <p class="section-sub">仿真卷，非真题：题目来自本站自编题库，按学科比例抽题。考试中不显示对错，交卷后看报告。</p>
        </div></div>
        ${run ? `<div class="mock-resume"><b>有一场仿真卷进行中</b><button class="btn btn-primary btn-sm" id="mockbResume" type="button">继续考试</button></div>` : ''}
        <div class="mock-opts">
          <label>题量 <select id="mockbN" class="select-compact"><option value="38">38 题</option><option value="20">20 题</option><option value="10">10 题（快测）</option></select></label>
          <label>时长 <select id="mockbDur" class="select-compact"><option value="auto">按题量折算（38 题 = 80 分钟）</option><option value="0">不限时</option></select></label>
          <label>范围 <select id="mockbScope" class="select-compact"><option value="all">全部随机</option><option value="new">优先没做过的</option></select></label>
        </div>
        <button class="btn btn-primary" id="mockbStart" type="button">开始仿真卷</button>
      </article>
      <article class="card"><h3 class="section-title">仿真卷记录</h3>
        <div class="mock-list">${past.map(m => `<div class="mock-row"><span><b>${esc(m.note)}</b> · 正确 ${m.correct}/${m.total}（${m.score}%）</span><span class="stat-hint">${m.date}${m.by ? ' · ' + esc(m.by) : ''}</span>${window.EJU_SYNC?.isTeacher?.() && m.wrongIds?.length ? `<button class="btn btn-xs" data-assign="${esc(m.wrongIds.join(','))}" type="button">错题布置为作业</button>` : ''}</div>`).join('') || '<p class="stat-hint">还没有记录。</p>'}</div>
      </article>`;
    $('#mockbResume')?.addEventListener('click', () => { startTimer(); renderExam(); });
    $('#mockbStart').addEventListener('click', () => {
      if (run && !confirm('已有进行中的仿真卷，开始新的会放弃它。继续吗？')) return;
      const n = Number($('#mockbN').value);
      const ids = pick(n, $('#mockbScope').value);
      if (!ids.length) return;
      const minutes = $('#mockbDur').value === '0' ? 0 : Math.round((ids.length * 80) / 38);
      run = {ids, startedAt: Date.now(), durationMs: minutes * 60000, picks: {}, flags: {}, spent: {}, help: {}, cur: 0, curSince: Date.now()};
      cnShown = {};
      saveRun();
      startTimer();
      renderExam();
    });
    document.querySelectorAll('[data-assign]').forEach(b => b.addEventListener('click', () => window.EJU_HW?.quickAssign(b.dataset.assign.split(','), '仿真卷错题订正')));
  }

  const remainingMs = () => (run.durationMs ? run.startedAt + run.durationMs - Date.now() : Infinity);
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!run) return stopTimer();
      if (remainingMs() <= 0) return submit(true);
      paintTimer();
    }, 1000);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }
  function paintTimer() {
    const el = $('#mockbClock');
    if (!el || !run) return;
    const s = run.durationMs ? Math.max(0, Math.ceil(remainingMs() / 1000)) : Math.floor((Date.now() - run.startedAt) / 1000);
    el.textContent = `${run.durationMs ? '' : '已用 '}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    el.classList.toggle('is-low', Boolean(run.durationMs) && s < 600);
  }
  function bookTime() {
    const id = run.ids[run.cur];
    run.spent[id] = (run.spent[id] || 0) + (Date.now() - run.curSince);
    run.curSince = Date.now();
  }
  function go(i) {
    if (i < 0 || i >= run.ids.length) return;
    bookTime();
    run.cur = i;
    saveRun();
    renderExam();
  }

  function renderExam() {
    const id = run.ids[run.cur];
    const card = cardById(id);
    const mode = langMode();
    const showCn = mode === 'cn' || (mode === 'bi') || cnShown[id] || run.help[id];
    const qMain = mode === 'cn' && card.q_cn ? card.q_cn : card.q;
    $('#mockbRoot').innerHTML = `
      <article class="card mock-exam">
        <div class="mock-bar"><div><b>文综仿真卷</b>（非真题）· 第 ${run.cur + 1} / ${run.ids.length} 题 · ${esc(card.deck)}</div><div class="mock-clock" id="mockbClock"></div></div>
        <div class="mock-nav">${run.ids.map((q, i) => `<button type="button" class="mock-chip${i === run.cur ? ' is-cur' : ''}${run.picks[q] !== undefined ? ' is-done' : ''}${run.flags[q] ? ' is-flag' : ''}" data-go="${i}">${i + 1}</button>`).join('')}</div>
        <div class="mock-q" id="mockbQ">${esc(qMain)}</div>
        ${mode !== 'cn' && showCn && card.q_cn && card.q_cn !== card.q ? `<div class="stat-hint">${esc(card.q_cn)}</div>` : ''}
        <div class="mockb-choices">${card.choices.map((c, i) => {
          const cn = mode === 'cn' ? card.choices[i] : (showCn && card.choices_cn && card.choices_cn[i] !== c ? card.choices_cn[i] : '');
          const main = mode === 'cn' && card.choices_cn ? card.choices_cn[i] : c;
          return `<button type="button" class="mockb-choice${run.picks[id] === i ? ' is-picked' : ''}" data-pick="${i}"><b>${i + 1}</b><span>${esc(main)}${cn && mode !== 'cn' ? `<small>${esc(cn)}</small>` : ''}</span></button>`;
        }).join('')}</div>
        <div class="mock-actions">
          ${mode === 'jp' && !showCn ? '<button class="btn btn-sm" id="mockbHelp" type="button">看不懂（显示中文）</button>' : ''}
          <button class="btn btn-sm${run.flags[id] ? ' btn-primary' : ''}" id="mockbFlag" type="button">${run.flags[id] ? '已标记待检查' : '标记待检查'}</button>
        </div>
        <div class="mock-foot">
          <button class="btn" id="mockbPrev" type="button" ${run.cur === 0 ? 'disabled' : ''}>上一题</button>
          <button class="btn" id="mockbNext" type="button" ${run.cur === run.ids.length - 1 ? 'disabled' : ''}>下一题</button>
          <button class="btn btn-primary" id="mockbSubmit" type="button">交卷</button>
        </div>
      </article>`;
    paintTimer();
    const root = $('#mockbRoot');
    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.go))));
    root.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => pickChoice(Number(b.dataset.pick))));
    $('#mockbPrev').addEventListener('click', () => go(run.cur - 1));
    $('#mockbNext').addEventListener('click', () => go(run.cur + 1));
    $('#mockbFlag').addEventListener('click', () => { run.flags[id] = !run.flags[id]; saveRun(); renderExam(); });
    $('#mockbHelp')?.addEventListener('click', () => {
      run.help[id] = (run.help[id] || 0) + 1;
      cnShown[id] = true;
      app().recordLangHelp(card);
      saveRun();
      renderExam();
    });
    $('#mockbSubmit').addEventListener('click', () => {
      const left = run.ids.filter(q => run.picks[q] === undefined).length;
      if (confirm(left ? `还有 ${left} 题没选，确定交卷吗？` : '确定交卷吗？')) submit(false);
    });
  }

  function pickChoice(i) {
    const id = run.ids[run.cur];
    run.picks[id] = run.picks[id] === i ? undefined : i;
    if (run.picks[id] === undefined) delete run.picks[id];
    saveRun();
    renderExam();
  }

  document.addEventListener('keydown', e => {
    if (!run || report || app()?.currentRoute() !== 'mockb') return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const card = cardById(run.ids[run.cur]);
    if (/^[1-4]$/.test(e.key) && Number(e.key) <= card.choices.length) pickChoice(Number(e.key) - 1);
    else if (e.key === 'ArrowRight') go(run.cur + 1);
    else if (e.key === 'ArrowLeft') go(run.cur - 1);
  });

  function submit(auto) {
    if (!run) return;
    bookTime();
    stopTimer();
    const r = run;
    const rows = r.ids.map(id => {
      const c = cardById(id);
      return {id, card: c, pick: r.picks[id], ok: r.picks[id] === c.a, spentMs: r.spent[id] || 0, help: r.help[id] || 0};
    });
    const correct = rows.filter(x => x.ok).length;
    const byDeck = {};
    for (const x of rows) {
      const d = byDeck[x.card.deck] = byDeck[x.card.deck] || [0, 0];
      d[1] += 1;
      if (x.ok) d[0] += 1;
    }
    const wrongIds = rows.filter(x => !x.ok).map(x => x.id);
    const state = app().getState();
    state.mocks = state.mocks || [];
    const rec = {mid: 'b' + Date.now().toString(36), kind: 'bunso', subject: '総合科目（仿真）', real: false,
      score: Math.round((correct / rows.length) * 100), correct, total: rows.length, byDeck, wrongIds,
      spentMs: Date.now() - r.startedAt, note: `文综仿真卷 ${rows.length} 题${auto ? '（时间到自动交卷）' : ''}`,
      date: app().today(), by: window.EJU_SYNC?.myName?.() || undefined};
    state.mocks.push(rec);
    for (const x of rows) app().recordCardGrade(x.card, x.ok ? 'good' : 'again');
    app().saveState();
    report = {rec, rows, auto};
    run = null;
    saveRun();
    renderReport();
  }

  function renderReport() {
    const {rec, rows, auto} = report;
    const slow = rows.slice().sort((a, b) => b.spentMs - a.spentMs).slice(0, 3);
    const helps = rows.reduce((n, x) => n + x.help, 0);
    const mark = (x, i) => (x.card.choices[i] || '');
    $('#mockbRoot').innerHTML = `
      <article class="card mock-report">
        <h2 class="section-title">${esc(rec.note)}（非真题）</h2>
        ${auto ? '<p class="stat-hint">时间到，已自动交卷。</p>' : ''}
        <div class="mock-score"><b>${rec.correct}</b> / ${rec.total} 题 · ${rec.score}% · 用时 ${fmt(rec.spentMs)}</div>
        <p class="stat-hint">仿真卷的题目是自编的，难度和 EJU 不同，所以只看正确率，不换算 EJU 分数。错题已进错题本。${helps ? `点了 ${helps} 次「看不懂」。` : ''}</p>
        <div class="mock-secs">${Object.entries(rec.byDeck).map(([k, v]) => `<div><span>${esc(k)}</span><b>${v[0]}/${v[1]}</b></div>`).join('')}</div>
        <p class="stat-hint">最慢的 3 题：${slow.map(x => `${esc(x.card.deck)}「${esc(x.card.topic)}」${fmt(x.spentMs)}`).join('；')}</p>
        <div class="mock-rows">${rows.filter(x => !x.ok).map(x => `
          <div class="mock-rrow is-bad">
            <div><b>${esc(x.card.deck)}</b> · ${esc(x.card.topic)}</div>
            <div>${esc(x.card.q)}</div>
            <div class="mock-wrongs">你的选择 <b>${x.pick === undefined ? '空' : `(${x.pick + 1}) ${esc(mark(x, x.pick))}`}</b> → 正解 <b>(${x.card.a + 1}) ${esc(mark(x, x.card.a))}</b></div>
            <div class="stat-hint">${esc(x.card.expl || '')}${x.card.trap ? `　易错：${esc(x.card.trap)}` : ''}</div>
          </div>`).join('') || '<p>全对！</p>'}</div>
        <div class="mock-foot"><button class="btn btn-primary" id="mockbAgain" type="button">回到仿真卷首页</button></div>
      </article>`;
    $('#mockbAgain').addEventListener('click', () => { report = null; renderLobby(); });
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
  window.EJU_MOCKB = {render};
})();
