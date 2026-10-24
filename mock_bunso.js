// 文综模考：支持【历年真题整回模考】与【自编仿真卷】。
// 历年真题：按卷面原题号顺序出卷、支持阅读材料与原卷图表展开、80分钟倒计时。
// 交卷后生成综合与分科正确率可视化图表（SVG 环形仪表盘 + 分科柱状图）。
// 进行中的考试存在 localStorage（eju-mockb-run），刷新后按开考时间继续。
(function () {
  'use strict';

  const RUN_KEY = 'eju-mockb-run';
  const $ = sel => document.querySelector(sel);
  const app = () => window.EJU_APP;
  const esc = s => String(s || '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  
  // 自编仿真卷题库池（排除真题与变形题）
  const simPool = () => (window.EJU_BANK || []).filter(c => c.type === 'mcq' && !/^(real|var)-/.test(c.id) && !/^数|公式/.test(c.deck));
  
  // 真题题库池
  const realPool = () => (window.EJU_BANK || []).filter(c => c.type === 'mcq' && c.id.startsWith('real-b-'));
  
  const cardById = id => (window.EJU_BANK || []).find(c => c.id === id);

  let run = null;
  let report = null;
  let timer = null;
  let cnShown = {}; // cardId -> true once 看懂 was pressed
  let activeTab = 'real'; // 'real' | 'sim'

  const langMode = () => app()?.getLangMode?.() || 'jp';
  const loadRun = () => { try { run = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); } catch (_) { run = null; } };
  const saveRun = () => { try { run ? localStorage.setItem(RUN_KEY, JSON.stringify(run)) : localStorage.removeItem(RUN_KEY); } catch (_) {} };
  const fmt = ms => `${Math.floor(ms / 60000)}分${String(Math.round(ms / 1000) % 60).padStart(2, '0')}秒`;

  // 获取所有可用的真题回次列表
  function getRealSittings() {
    const cards = realPool();
    const map = new Map();
    for (const c of cards) {
      const sitting = c.sitting || '2023_1';
      if (!map.has(sitting)) {
        map.set(sitting, {
          sitting,
          label: c.sittingLabel || sitting.replace('_', '年第') + '回',
          cards: []
        });
      }
      map.get(sitting).cards.push(c);
    }
    // 按题号 no 排序
    for (const item of map.values()) {
      item.cards.sort((a, b) => (a.no || 0) - (b.no || 0));
    }
    return Array.from(map.values()).sort((a, b) => b.sitting.localeCompare(a.sitting));
  }

  // 仿真卷抽题
  function pickSim(n, scope) {
    const prog = app().getState().progress || {};
    let deleted = {};
    try { deleted = Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('eju-ai-decisions-v1') || '{}')).filter(([, d]) => d.action === 'delete')); } catch (_) {}
    let all = simPool().filter(c => !deleted[c.id]);
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
    const past = (app().getState().mocks || []).filter(m => m.kind === 'bunso').slice().reverse().slice(0, 8);
    const sittings = getRealSittings();

    $('#mockbRoot').innerHTML = `
      <article class="card">
        <div class="section-head"><div>
          <h2 class="section-title">EJU 文综（総合科目）模考</h2>
          <p class="section-sub">支持官方正解核验的历年真题整回模考，以及按学科比例抽题的仿真快练。考试中不显示对错，交卷后出具图表化分析报告。</p>
        </div></div>

        ${run ? `
          <div class="mock-resume" style="margin-bottom:16px;padding:12px 14px;background:var(--hairline);border-radius:8px;display:flex;align-items:center;justify-content:space-between;">
            <div><b>有一场考试进行中：</b><span>${esc(run.title || '文综模考')}</span>（已答 ${Object.keys(run.picks || {}).length}/${run.ids.length} 题）</div>
            <button class="btn btn-primary btn-sm" id="mockbResume" type="button">继续考试</button>
          </div>` : ''}

        <!-- 模式切换选项卡 -->
        <div class="mockb-tabs" style="display:flex;gap:8px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px;">
          <button type="button" class="btn ${activeTab === 'real' ? 'btn-primary' : ''}" id="tabRealBtn">真题整回模考（官方核验）</button>
          <button type="button" class="btn ${activeTab === 'sim' ? 'btn-primary' : ''}" id="tabSimBtn">自编仿真卷（随机抽题）</button>
        </div>

        <!-- 真题模考面板 -->
        <div id="panelReal" ${activeTab !== 'real' ? 'style="display:none;"' : ''}>
          ${sittings.length > 0 ? `
            <div class="mock-opts" style="display:grid;gap:12px;margin-bottom:16px;">
              <label>选择真题回次：
                <select id="mockbSitting" class="select-compact" style="font-weight:bold;">
                  ${sittings.map(s => `<option value="${esc(s.sitting)}">${esc(s.label)}（共 ${s.cards.length} 题 · 官方正解）</option>`).join('')}
                </select>
              </label>
              <label>考试时长：
                <select id="mockbRealDur" class="select-compact">
                  <option value="80">标准考试时长（80 分钟）</option>
                  <option value="60">高强度冲刺（60 分钟）</option>
                  <option value="0">不限时作答</option>
                </select>
              </label>
            </div>
            <p class="stat-hint" style="margin-bottom:16px;">
              💡 题目与选项原样逐字转写自官方原卷扫描件，答案 100% 对照官方正解表；遇地图、图表题自动调出原卷高清单张原图。
            </p>
            <button class="btn btn-primary" id="mockbRealStart" type="button">开始真题模考</button>
          ` : `
            <p class="stat-hint">暂无已导入的真题。</p>
          `}
        </div>

        <!-- 仿真卷面板 -->
        <div id="panelSim" ${activeTab !== 'sim' ? 'style="display:none;"' : ''}>
          <div class="mock-opts" style="display:grid;gap:12px;margin-bottom:16px;">
            <label>题量：
              <select id="mockbN" class="select-compact">
                <option value="38">38 题（全卷）</option>
                <option value="20">20 题</option>
                <option value="10">10 题（快速自测）</option>
              </select>
            </label>
            <label>时长：
              <select id="mockbDur" class="select-compact">
                <option value="auto">按题量折算（38 题 = 80 分钟）</option>
                <option value="0">不限时</option>
              </select>
            </label>
            <label>范围：
              <select id="mockbScope" class="select-compact">
                <option value="all">全部自编题随机</option>
                <option value="new">优先没做过的题</option>
              </select>
            </label>
          </div>
          <button class="btn btn-primary" id="mockbStart" type="button">开始仿真卷</button>
        </div>
      </article>

      <article class="card">
        <h3 class="section-title">文综模考历史记录</h3>
        <div class="mock-list">
          ${past.map(m => `
            <div class="mock-row" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--hairline);">
              <div>
                <span class="tag ${m.real ? 'tag-source-verified' : ''}" style="margin-right:6px;font-size:11px;">${m.real ? '真题' : '仿真'}</span>
                <b>${esc(m.note || m.subject)}</b> · 正确 <b>${m.correct}/${m.total}</b> 题（${m.score}%）
              </div>
              <span class="stat-hint">${m.date || ''}${m.by ? ' · ' + esc(m.by) : ''}</span>
              ${window.EJU_SYNC?.isTeacher?.() && m.wrongIds?.length ? `<button class="btn btn-xs" data-assign="${esc(m.wrongIds.join(','))}" type="button">错题布置为作业</button>` : ''}
            </div>
          `).join('') || '<p class="stat-hint">还没有模考记录。</p>'}
        </div>
      </article>`;

    $('#mockbResume')?.addEventListener('click', () => { startTimer(); renderExam(); });
    
    $('#tabRealBtn')?.addEventListener('click', () => {
      activeTab = 'real';
      $('#panelReal').style.display = 'block';
      $('#panelSim').style.display = 'none';
      $('#tabRealBtn').classList.add('btn-primary');
      $('#tabSimBtn').classList.remove('btn-primary');
    });

    $('#tabSimBtn')?.addEventListener('click', () => {
      activeTab = 'sim';
      $('#panelReal').style.display = 'none';
      $('#panelSim').style.display = 'block';
      $('#tabSimBtn').classList.add('btn-primary');
      $('#tabRealBtn').classList.remove('btn-primary');
    });

    // 启动真题模考
    $('#mockbRealStart')?.addEventListener('click', () => {
      if (run && !confirm('已有进行中的模考，开始新的会放弃它。继续吗？')) return;
      const sittingKey = $('#mockbSitting')?.value;
      const sittings = getRealSittings();
      const s = sittings.find(x => x.sitting === sittingKey) || sittings[0];
      if (!s || !s.cards.length) return;
      
      const durMin = Number($('#mockbRealDur').value);
      const ids = s.cards.map(c => c.id);
      run = {
        real: true,
        sitting: s.sitting,
        title: `${s.label} 文综真题`,
        ids,
        startedAt: Date.now(),
        durationMs: durMin > 0 ? durMin * 60000 : 0,
        picks: {},
        flags: {},
        spent: {},
        help: {},
        cur: 0,
        curSince: Date.now()
      };
      cnShown = {};
      saveRun();
      startTimer();
      renderExam();
    });

    // 启动仿真卷
    $('#mockbStart')?.addEventListener('click', () => {
      if (run && !confirm('已有进行中的模考，开始新的会放弃它。继续吗？')) return;
      const n = Number($('#mockbN').value);
      const ids = pickSim(n, $('#mockbScope').value);
      if (!ids.length) return;
      const minutes = $('#mockbDur').value === '0' ? 0 : Math.round((ids.length * 80) / 38);
      run = {
        real: false,
        title: `文综仿真卷（${ids.length}题）`,
        ids,
        startedAt: Date.now(),
        durationMs: minutes * 60000,
        picks: {},
        flags: {},
        spent: {},
        help: {},
        cur: 0,
        curSince: Date.now()
      };
      cnShown = {};
      saveRun();
      startTimer();
      renderExam();
    });

    document.querySelectorAll('[data-assign]').forEach(b => b.addEventListener('click', () => window.EJU_HW?.quickAssign(b.dataset.assign.split(','), '文综错题订正')));
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

  // 获取该题关联的前言/大题阅读材料（包括 SAME_AS_PREV 向上回溯）
  function getCardPassage(curIdx) {
    const curCard = cardById(run.ids[curIdx]);
    if (!curCard || !curCard.passage) return '';
    if (curCard.passage !== 'SAME_AS_PREV') return curCard.passage;
    for (let j = curIdx - 1; j >= 0; j--) {
      const prev = cardById(run.ids[j]);
      if (prev && prev.passage && prev.passage !== 'SAME_AS_PREV') {
        return prev.passage;
      }
    }
    return '';
  }

  function renderExam() {
    const id = run.ids[run.cur];
    const card = cardById(id);
    const mode = langMode();
    const showCn = mode === 'cn' || (mode === 'bi') || cnShown[id] || run.help[id];
    const qMain = mode === 'cn' && card.q_cn ? card.q_cn : card.q;
    const passage = getCardPassage(run.cur);

    $('#mockbRoot').innerHTML = `
      <article class="card mock-exam">
        <div class="mock-bar">
          <div>
            <b>${esc(run.title || (run.real ? '文综真题' : '文综仿真卷'))}</b> · 第 ${run.cur + 1} / ${run.ids.length} 题 · 
            <span class="tag tag-accent" style="margin-left:4px;">${esc(card.deck)}</span>
            ${card.topic ? `<span class="stat-hint" style="margin-left:6px;">${esc(card.topic)}</span>` : ''}
          </div>
          <div class="mock-clock" id="mockbClock"></div>
        </div>

        <div class="mock-nav">
          ${run.ids.map((q, i) => `<button type="button" class="mock-chip${i === run.cur ? ' is-cur' : ''}${run.picks[q] !== undefined ? ' is-done' : ''}${run.flags[q] ? ' is-flag' : ''}" data-go="${i}">${i + 1}</button>`).join('')}
        </div>

        <!-- 阅读材料 / 大题题干 -->
        ${passage ? `
          <div class="mockb-passage" style="margin:12px 0;padding:12px 14px;background:var(--hairline);border-left:3px solid var(--accent);border-radius:4px;font-size:14px;line-height:1.6;white-space:pre-wrap;">
            <div style="font-weight:bold;margin-bottom:6px;color:var(--ink);font-size:12px;opacity:0.8;">【阅读材料 / 题组背景】</div>
            ${window.EJU_READ.passageHtml(card, passage)}
          </div>
          ${showCn && card.passage_cn ? window.EJU_READ.cnFoldHtml('材料译文', card.passage_cn, mode === 'cn') : ''}` : ''}

        <!-- 题干与题目附图 -->
        <div class="mock-q" id="mockbQ" style="font-size:16px;line-height:1.7;margin:14px 0 10px;">${esc(qMain)}</div>
        
        ${card.hasFigure && card.paperImg ? `
          <div class="mockb-fig-box" style="margin:12px 0 16px;text-align:center;">
            <a href="${esc(card.paperImg)}" target="_blank" title="点击查看高清大图" style="display:inline-block;max-width:100%;">
              <img src="${esc(card.paperImg)}" alt="题目原卷图表" style="max-width:100%;max-height:400px;border:1px solid var(--border);border-radius:6px;box-shadow:var(--shadow);" />
            </a>
            <div class="stat-hint" style="margin-top:4px;">🔍 点击图片可在新窗口查看原尺寸高清原卷</div>
          </div>` : ''}

        ${mode !== 'cn' && showCn && card.q_cn && card.q_cn !== card.q ? `<div class="stat-hint" style="margin-bottom:12px;">${card.cnAI ? '<span class="expl-ai-tag">AI 译</span>' : ''}${esc(card.q_cn)}</div>` : ''}

        <!-- 选项列表 -->
        <div class="mockb-choices">
          ${card.choices.map((c, i) => {
            const cn = mode === 'cn' ? card.choices[i] : (showCn && card.choices_cn && card.choices_cn[i] !== c ? card.choices_cn[i] : '');
            const main = mode === 'cn' && card.choices_cn ? card.choices_cn[i] : c;
            return `
              <button type="button" class="mockb-choice${run.picks[id] === i ? ' is-picked' : ''}" data-pick="${i}">
                <b>${i + 1}</b>
                <span>${esc(main)}${cn && mode !== 'cn' ? `<small>${esc(cn)}</small>` : ''}</span>
              </button>`;
          }).join('')}
        </div>

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
    if (!card) return;
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
    
    const rec = {
      mid: 'b' + Date.now().toString(36),
      kind: 'bunso',
      subject: r.real ? '総合科目（真题）' : '総合科目（仿真）',
      real: Boolean(r.real),
      score: Math.round((correct / rows.length) * 100),
      correct,
      total: rows.length,
      byDeck,
      wrongIds,
      spentMs: Date.now() - r.startedAt,
      note: `${r.title || '文综模考'}（共 ${rows.length} 题）${auto ? ' - 时间到交卷' : ''}`,
      date: app().today(),
      by: window.EJU_SYNC?.myName?.() || undefined
    };

    state.mocks.push(rec);
    for (const x of rows) app().recordCardGrade(x.card, x.ok ? 'good' : 'again');
    app().saveState();
    report = {rec, rows, auto};
    run = null;
    saveRun();
    renderReport();
  }

  // 渲染交卷报告（含 SVG 圆环图表与分科正确率横向柱状图）
  function renderReport() {
    const {rec, rows, auto} = report;
    const slow = rows.slice().sort((a, b) => b.spentMs - a.spentMs).slice(0, 3);
    const helps = rows.reduce((n, x) => n + x.help, 0);
    const mark = (x, i) => (x.card.choices[i] || '');
    
    // SVG Donut calculation
    const radius = 38;
    const circ = 2 * Math.PI * radius; // ~238.76
    const offset = circ - (circ * rec.score) / 100;
    const scoreColor = rec.score >= 80 ? '#2e7d32' : (rec.score >= 60 ? '#d97706' : '#d67052');

    $('#mockbRoot').innerHTML = `
      <article class="card mock-report">
        <h2 class="section-title">${esc(rec.note)}</h2>
        ${auto ? '<p class="stat-hint" style="color:#d67052;">⚠️ 时间已到，系统自动交卷。</p>' : ''}
        
        <!-- 正确率图表卡片 -->
        <div class="mock-acc-card" style="display:flex;align-items:center;gap:24px;background:var(--hairline);padding:20px;border-radius:12px;margin:16px 0;flex-wrap:wrap;">
          <!-- SVG 环形正确率仪表盘 -->
          <div style="display:flex;align-items:center;gap:16px;">
            <svg viewBox="0 0 100 100" width="110" height="110" style="transform:rotate(-90deg);flex-shrink:0;">
              <circle cx="50" cy="50" r="${radius}" fill="none" stroke="var(--border)" stroke-width="9" />
              <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${scoreColor}" stroke-width="9"
                stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
                stroke-linecap="round" style="transition:stroke-dashoffset 0.8s ease;" />
              <g style="transform:rotate(90deg);transform-origin:center;">
                <text x="50" y="47" text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="bold" fill="var(--ink)">${rec.score}%</text>
                <text x="50" y="67" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="var(--ink)" opacity="0.6">正确率</text>
              </g>
            </svg>
            <div>
              <div style="font-size:20px;font-weight:bold;margin-bottom:4px;">
                答对 <b>${rec.correct}</b> / ${rec.total} 题
              </div>
              <div class="stat-hint">
                用时 <b>${fmt(rec.spentMs)}</b> · ${rec.real ? '✅ 官方正解核验卷' : '自编仿真练习卷'}
              </div>
              ${helps ? `<div class="stat-hint" style="margin-top:2px;">点击了 ${helps} 次「看不懂」</div>` : ''}
            </div>
          </div>

          <!-- 分科正确率横向对比柱状图 -->
          <div style="flex:1;min-width:240px;display:grid;gap:8px;border-left:1px solid var(--border);padding-left:16px;">
            <div style="font-size:12px;font-weight:bold;color:var(--ink);opacity:0.8;margin-bottom:2px;">分科正确率分布：</div>
            ${Object.entries(rec.byDeck).map(([k, v]) => {
              const pct = v[1] ? Math.round((v[0] / v[1]) * 100) : 0;
              const barColor = pct >= 80 ? '#2e7d32' : (pct >= 60 ? '#d97706' : '#d67052');
              return `
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
                  <span style="width:48px;font-weight:bold;text-align:right;">${esc(k)}</span>
                  <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;"></div>
                  </div>
                  <span style="width:70px;text-align:right;font-size:12px;"><b>${v[0]}/${v[1]}</b> (${pct}%)</span>
                </div>`;
            }).join('')}
          </div>
        </div>

        <p class="stat-hint">最慢的 3 题：${slow.map(x => `${esc(x.card.deck)}「${esc(x.card.topic || x.card.source)}」${fmt(x.spentMs)}`).join('；')}</p>
        
        <!-- 错题逐题订正列表 -->
        <h3 style="margin-top:24px;margin-bottom:12px;font-size:16px;">答错题目订正（已自动同步到错题本）</h3>
        <div class="mock-rows">${rows.filter(x => !x.ok).map(x => `
          <div class="mock-rrow is-bad" style="margin-bottom:14px;padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--surface);">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <b>${esc(x.card.deck)} · ${esc(x.card.topic || x.card.source)}</b>
              <span class="tag tag-source-unverified">解答番号 ${x.card.no || ''}</span>
            </div>
            <div style="margin-bottom:8px;font-size:15px;line-height:1.6;">${esc(x.card.q)}</div>
            ${x.card.hasFigure && x.card.paperImg ? `
              <div style="margin:8px 0;"><img src="${esc(x.card.paperImg)}" alt="原卷图" style="max-width:280px;border-radius:4px;border:1px solid var(--border);" /></div>` : ''}
            <div class="mock-wrongs" style="margin-bottom:6px;">
              你的选择：<b style="color:#d67052;">${x.pick === undefined ? '未作答' : `(${x.pick + 1}) ${esc(mark(x, x.pick))}`}</b> 
              &nbsp;→&nbsp; 
              官方正解：<b style="color:#2e7d32;">(${x.card.a + 1}) ${esc(mark(x, x.card.a))}</b>
            </div>
            ${x.card.expl ? `<div class="stat-hint" style="line-height:1.5;background:var(--hairline);padding:8px;border-radius:4px;">💡 解析：${esc(x.card.expl)}</div>${x.card.expl_cn ? window.EJU_READ.cnFoldHtml('解析译文', x.card.expl_cn, false) : ''}` : ''}
          </div>`).join('') || '<p style="color:#2e7d32;font-weight:bold;padding:12px 0;">🎉 太棒了，整卷全对！</p>'}</div>

        <div class="mock-foot" style="margin-top:20px;">
          <button class="btn btn-primary" id="mockbAgain" type="button">回到模考首页</button>
        </div>
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
