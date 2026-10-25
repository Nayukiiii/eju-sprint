(() => {
  'use strict';

  const EXAM_AT = new Date('2026-11-08T00:00:00+09:00');
  const STORAGE_KEY = 'eju-sprint-state-v1';
  const THEME_KEY = 'eju-theme-mode';
  const INTERVALS = [0, 1, 2, 4, 7, 12];
  const DAILY_TARGET = 40;

  const BUNSO_DECKS = ['政治', '条約', '地理', '経済', '歴史', '社会', '時事', '旧地名'];
  const MATH_DECKS = ['数Ⅰ·A', '公式'];
  const DECK_JP_SUB = {
    '全部文综': '総合科目 全分野',
    '全部': '総合科目 + 数学コース1',
    '数Ⅰ·A': '数学コース1',
    '政治': '政治・統治・憲法',
    '条約': '近代条約・国際関係',
    '地理': '世界地理・日本地理',
    '経済': '市場・財政・金融',
    '歴史': '近現代史・冷戦',
    '社会': '現代社会・労働・環境',
    '時事': '国際時事・統計',
    '旧地名': '歴史地名・都市変遷',
    '变形特训': '過去問改題演習'
  };


  // Built-in core cards + external banks (Stage 2: 100% 四选一マーク式 + 中日双语 + 逐项解析)
  const cards = [
    ...(window.EJU_BANK || []),
  ];

  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const localDateKey = (date = new Date()) =>
    new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);
  const addDays = days => Date.now() + days * 86400000;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && parsed.version === 1) {
        parsed.bookmarks = parsed.bookmarks || {};
        return parsed;
      }
    } catch (_) {}
    return {version: 1, progress: {}, history: [], tasks: {}, mocks: [], bookmarks: {}, activeSession: null};
  }

  let state = loadState();
  let periodMode = 'bunso'; // 'bunso' | 'math'
  let currentRoute = 'today';
  let selectedDeck = '全部文综';
  let currentKnowledgeCat = 'all';
  let wrongFilter = 'all';
  let auditTableFilter = 'all';
  let auditSbsFilter = 'sample20';

  // Active study session state
  let queue = [];
  let sessionIndex = 0;
  let activeCard = null;
  let answered = false;
  // 自动判定掌握程度用：这张卡出现的时间、答题前有没有用提示/速查表、期间有没有切走页面
  let cardShownAt = 0;
  let hintUsed = false;
  let leftPageDuringCard = false;

  // Math Tutoring Station state
  let tutorSource = 'cards'; // 'cards' | 'papers'
  let tutorCardsList = [];
  let tutorCardIdx = 0;
  let currentPaperIdx = 0;
  let currentPaperPageIdx = 0;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('eju-state-saved'));
  }

  function renderMathIn(el) {
    if (!el || typeof window.renderMathInElement !== 'function') return;
    try {
      window.renderMathInElement(el, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      });
    } catch (_) {}
  }

  // Tutor mark boxes stay empty until the answer step is opened
  function setTutorBlanksRevealed(show) {
    $$('#tutorChoicesBox .tutor-mark-slot-cell').forEach(cell => {
      cell.textContent = show ? cell.dataset.ans : '';
    });
  }

  function getProgress(cardOrId) {
    const id = typeof cardOrId === 'string' ? cardOrId : cardOrId.id;
    return state.progress[id] || {box: 0, due: 0, reps: 0, lapses: 0, wrongStreak: 0, inWrongBook: false, lastGrade: null};
  }

  function isMathCard(card) {
    return MATH_DECKS.includes(card.deck);
  }

  function isVariantCard(card) {
    return card.id.startsWith('var-') || card.id.startsWith('real-') || card.id.includes('-ext-') || Boolean(card.variant);
  }

  // Stage 1 Rule: Questions without official source are marked '未核实' and DO NOT count toward mastery rate
  function isUnverified(card) {
    return !card.source || card.source === '未核实';
  }

  function isCountedForMastery(card) {
    return !isUnverified(card);
  }

  const isPracticed = card => Boolean(state.progress[card.id]);
  const isLearned = card => (getProgress(card).box || 0) >= 2;

  function isMastered(card) {
    if (!isCountedForMastery(card)) return false;
    return getProgress(card).box >= 2;
  }

  function getSourceBadgeHtml(card) {
    if (isUnverified(card)) {
      return `<span class="tag tag-source-unverified" title="无官方正解表出处，不计入掌握率">未核实</span>`;
    }
    if (card.auditStatus === 'discrepancy') {
      return `<span class="tag tag-source-warn" title="题面/正解表/题库三者存在不一致，待裁定">待裁定 · ${card.source}</span>`;
    }
    return `<span class="tag tag-source-ok">出处：${card.source}</span>`;
  }

  function applySourceTagAndBanner(card, tagEl, bannerEl) {
    if (tagEl) {
      if (isUnverified(card)) {
        tagEl.className = 'tag tag-source-unverified';
        tagEl.textContent = '未核实';
      } else if (card.auditStatus === 'discrepancy') {
        tagEl.className = 'tag tag-source-warn';
        tagEl.textContent = `待裁定 · ${card.source}`;
      } else {
        tagEl.className = 'tag tag-source-ok';
        tagEl.textContent = `出处：${card.source}`;
      }
    }
    if (bannerEl) {
      if (card.auditStatus === 'discrepancy' && card.auditNote) {
        bannerEl.hidden = false;
        bannerEl.className = 'study-audit-banner is-discrepancy';
        bannerEl.textContent = `【阶段1核验提醒 · 待裁定】${card.auditNote}`;
      } else if (isUnverified(card)) {
        // The 未核实 tag already says it; only speak up when the AI check doubts this question
        const ai = window.EJU_AI_VERIFY?.verdictFor(card.id);
        const doubt = ai && (ai.verdict === 'disagree' || ai.verdict === 'doubt');
        bannerEl.hidden = !doubt;
        bannerEl.className = 'study-audit-banner is-unverified';
        bannerEl.textContent = doubt ? `AI 核验${ai.label}${ai.summary ? `：${ai.summary}` : ''}` : '';
      } else {
        bannerEl.hidden = true;
        bannerEl.textContent = '';
      }
    }
  }

  function isDue(card) {
    const p = getProgress(card);
    return p.reps > 0 && p.due <= Date.now();
  }

  function isWrong(card) {
    const p = getProgress(card);
    if (p.inWrongBook !== undefined) return Boolean(p.inWrongBook);
    return p.lapses > 0 && p.box < 2;
  }

  function isBookmarked(card) {
    return Boolean(state.bookmarks && state.bookmarks[card.id]);
  }

  // Concise 1-line hint generator (zero emojis, zero fluff)
  function getCardHint(card) {
    if (card.hint) return card.hint;
    const t = `${card.topic} ${card.q}`;
    if (isMathCard(card)) {
      if (/頂点|軸|平方完成|最大|最小|平行移動/.test(t)) {
        return '核心公式：先配方为 $y = a(x-p)^2 + q$，对称轴 $x = -\\frac{b}{2a}$，比较对称轴与区间 $[m,n]$ 的位置。';
      }
      if (/不等式|重解|実数解|接する|共有点/.test(t)) {
        return '核心公式：判别式 $D = b^2 - 4ac$（相切/重解 $D=0$，两交点 $D>0$，无交点 $D<0$）。';
      }
      if (/余弦|正弦|三角形|sin|cos|外接円|内接円|面積/.test(t)) {
        return '核心公式：三边与夹角用余弦定理 $a^2=b^2+c^2-2bc\\cos A$；外接圆 $R$ 用正弦定理 $\\frac{a}{\\sin A}=2R$；内切圆 $r$ 用面积 $S=\\frac{1}{2}r(a+b+c)$。';
      }
      if (/確率|場合の数|コイン|サイコロ|カード|玉|期待値/.test(t)) {
        return '破题方向：情况较少直接列举；看到「少なくとも」用 $1 - P(\\text{全反面})$；期望值用 $\\sum x_i P(X=x_i)$。';
      }
      return '破题方向：写出题干核心名词对应的基本公式，代入已知条件化简。';
    }
    if (card.deck === '条約') return '破题方向：锁定「战争年份 + 签约对手国 + 割让地/开港地」三要素，注意区分南京/北京、下关/朴次茅斯。';
    if (card.deck === '政治') return '破题方向：看清主语是国会（众议院/参议院）、内阁还是裁判所；警惕将“国会议员”偷换为“众议院议员”。';
    if (card.deck === '経済') return '破题方向：区分日本银行（买卖国债/政策利率）与政府财政（税收/公共投资）；円安利好出口但推高进口物价。';
    if (card.deck === '地理') return '破题方向：气候先看最冷月气温判 A/C/D（1月高温必在南半球且无D气候）；统计看前两名国家组合。';
    return '破题方向：先确认题干问「正しい」还是「誤っている」，用排除法剔除张冠李戴项。';
  }

  // Condense explanation for focused study view so it never exceeds 3-4 clean lines
  function getConciseExpl(card) {
    const raw = String(card.expl || '').trim();
    if (!raw) return '记住该考点的核心对应关系即可。';
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 4) return lines.join('\n');
    return lines.slice(0, 4).join('\n');
  }

  // Normalize deck name to knowledge category
  function normalizeDeckToCat(deck) {
    if (!deck) return '';
    if (/政治|社会/.test(deck)) return 'pol';
    if (/歴史|历史|条約|条约|国際|国际|外交/.test(deck)) return 'trt';
    if (/経|经/.test(deck)) return 'eco';
    if (/地理|地/.test(deck)) return 'geo';
    if (/数/.test(deck)) return 'math';
    return '';
  }

  // 3秒定位核心考点速查卡片（直连真题、高频考点穿透）
  function findMatchedKp(card) {
    if (!card) return null;
    const kpList = window.EJU_KNOWLEDGE || [];
    if (!kpList.length) return null;

    // 1. Direct explicit link
    if (card.kpLink) {
      const direct = kpList.find(k => k.id === card.kpLink);
      if (direct) return direct;
    }

    const cardCat = normalizeDeckToCat(card.deck);
    const sameCatKps = cardCat ? kpList.filter(k => k.cat === cardCat) : [];
    const searchPool = sameCatKps.length ? sameCatKps : kpList;
    const textToMatch = `${card.topic || ''} ${card.q || ''} ${card.expl || ''}`;

    // 2. Try topicFilter in same category
    for (const kp of searchPool) {
      if (kp.topicFilter) {
        try {
          const re = new RegExp(kp.topicFilter, 'i');
          if (re.test(textToMatch)) return kp;
        } catch (e) {}
      }
    }

    // 3. Try topicFilter across all KPs
    for (const kp of kpList) {
      if (kp.topicFilter) {
        try {
          const re = new RegExp(kp.topicFilter, 'i');
          if (re.test(textToMatch)) return kp;
        } catch (e) {}
      }
    }

    // 4. Fallback to same category's first KP or first overall
    return searchPool[0] || kpList[0];
  }

  // ─── Formula typesetting: turn the formula runs of a mixed CJK/ASCII line into KaTeX ───
  const MATH_OPS = /[=+\-−×÷≦≧≤≥<>^√/²³°⇒]/;
  const MATH_RUN = /[A-Za-z0-9 +\-−×÷=≦≧≤≥<>()\[\]{}^_\\/.,'²³√π°⇒|]+/g;
  const MATH_JOIN = /\$([^$]*)\$(\s*)([぀-ヿ一-鿿]{1,10})(\s*)\$(\)[^$]*)\$/;

  function unicodeMathToLatex(run) {
    return run
      .replace(/−/g, '-')
      .replace(/×/g, '\\times ')
      .replace(/÷/g, '\\div ')
      .replace(/[≦≤]/g, '\\le ')
      .replace(/[≧≥]/g, '\\ge ')
      .replace(/⇒/g, '\\Rightarrow ')
      .replace(/²/g, '^2').replace(/³/g, '^3')
      .replace(/°/g, '^\\circ ')
      .replace(/√\s*(\[[A-Z]+\]|\d+|[a-zA-Z])/g, '\\sqrt{$1}')
      .replace(/√/g, '\\surd ')
      .replace(/(?<![\w.\\{}])(\d+)\/(\d+)(?![\w.])/g, '\\tfrac{$1}{$2}')
      .replace(/\[([A-Z]+)\]/g, '\\boxed{\\text{$1}}')
      .replace(/π/g, '\\pi ')
      .replace(/(?<![\\A-Za-z])(sin|cos|tan|log)(?![a-z])/g, '\\$1 ');
  }

  function mathifyLine(line) {
    // Existing $ islands are already LaTeX; drop the delimiters so they join the surrounding run
    const wrapped = String(line).replace(/\$/g, '').replace(MATH_RUN, run => {
      const lead = run.match(/^[\s.,]*/)[0];
      const trail = run.match(/[\s.,]*$/)[0];
      const core = run.slice(lead.length, run.length - trail.length);
      if (/^[a-z]$/.test(core)) return `${lead}$${core}$${trail}`;
      if (!core || !MATH_OPS.test(core) || !/[A-Za-z0-9]/.test(core) || /^[A-Za-z]+$/.test(core)) return run;
      return `${lead}$${unicodeMathToLatex(core)}$${trail}`;
    });
    // A short CJK word inside an open parenthesis, e.g. "−(x前面的数) ÷ …", stays inside the formula
    const openParens = t => (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
    let out = wrapped;
    let prev;
    do {
      prev = out;
      out = out.replace(MATH_JOIN, (m, a, s1, word, s2, b) => (openParens(a) > 0 ? `$${a}\\text{${word}}${b}$` : m));
    } while (out !== prev);
    return out;
  }

  // Short math notes (hint, trap): keep line breaks, typeset formulas
  function formatMathInlineHtml(text) {
    return String(text || '').trim().split('\n')
      .map(l => `<div class="ms-line">${escapeHtml(mathifyLine(l.trim()))}</div>`).join('');
  }

  // Split a line on `sep` only outside $...$ math segments
  function splitOutsideMath(line, sep) {
    const parts = [];
    let cur = '';
    let inMath = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '$') inMath = !inMath;
      if (!inMath && line.startsWith(sep, i)) {
        parts.push(cur);
        cur = '';
        i += sep.length - 1;
        continue;
      }
      cur += line[i];
    }
    parts.push(cur);
    return parts;
  }

  // Lay out a math derivation step by step: 【步骤】 headings stand out, and
  // chained "⇒" / "=" calculations are broken onto their own lines.
  function formatMathStepsHtml(text) {
    const out = [];
    const push = (cls, content) => out.push(`<div class="${cls}">${escapeHtml(cls === 'ms-head' ? content : mathifyLine(content))}</div>`);
    for (const rawLine of String(text || '').trim().split('\n')) {
      const line = rawLine.trim();
      if (!line) {
        out.push('<div class="ms-gap"></div>');
        continue;
      }
      if (/^【[^】]*】$/.test(line)) {
        push('ms-head', line);
        continue;
      }
      const baseCls = /^\s{2,}/.test(rawLine) ? 'ms-line ms-indent' : 'ms-line';
      splitOutsideMath(line, '⇒').forEach((piece, pi) => {
        const seg = piece.trim();
        if (!seg) return;
        // Long "a = b = c = d" chains: put each "= ..." on its own line
        const eqParts = splitOutsideMath(seg, ' = ');
        const lines = eqParts.length >= 4
          ? [eqParts[0] + ' = ' + eqParts[1], ...eqParts.slice(2).map(p => '= ' + p.trim())]
          : [seg];
        lines.forEach((l, li) => {
          const prefix = pi > 0 && li === 0 ? '⇒ ' : '';
          const cls = pi > 0 || li > 0 ? `${baseCls} ms-cont` : baseCls;
          push(cls, prefix + l.trim());
        });
      });
    }
    return out.join('');
  }

  // ─── Countdown & Top Stats ───
  function getTodayStats() {
    const today = localDateKey();
    const todayLogs = state.history.filter(h => h.date === today);
    let bunsoCount = 0;
    let mathCount = 0;
    let wrongCleared = 0;
    let correctCount = 0;
    for (const h of todayLogs) {
      const c = cards.find(x => x.id === h.id);
      if (!c) continue;
      if (isMathCard(c)) mathCount++;
      else bunsoCount++;
      if (h.clearedWrong) wrongCleared++;
      if (h.grade === 'good') correctCount++;
    }
    const accuracy = todayLogs.length ? Math.round((correctCount / todayLogs.length) * 100) : 0;
    return {
      total: todayLogs.length,
      correctCount,
      accuracy,
      bunsoCount,
      mathCount,
      wrongCleared
    };
  }

  function getStreakDays() {
    const dates = new Set(state.history.map(h => h.date));
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const key = localDateKey(new Date(Date.now() - i * 86400000));
      if (dates.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }

  function langHelpCards() {
    return Object.entries(state.langHelp || {})
      .map(([id, v]) => ({card: cards.find(c => c.id === id), ...v}))
      .filter(x => x.card)
      .sort((a, b) => b.at - a.at);
  }

  function renderLangHelp() {
    const box = $('#langHelpCard');
    if (!box) return;
    const list = langHelpCards();
    box.hidden = !list.length;
    if (!list.length) return;
    const teacher = window.EJU_SYNC?.isTeacher?.();
    $('#langHelpTitle').textContent = teacher ? `对方日语没看懂的题（${list.length}）` : `日语没看懂的题（${list.length}）`;
    $('#langHelpPracticeBtn').hidden = Boolean(teacher);
    $('#langHelpList').innerHTML = list.slice(0, 8).map(x => `
      <li data-card-id="${escapeHtml(x.card.id)}">
        <span class="lang-help-q">${escapeHtml(String(x.card.q).replace(/\$[^$]*\$/g, '…').slice(0, 42))}</span>
        <span class="lang-help-meta">${escapeHtml(x.card.deck)}${x.n > 1 ? ` · ${x.n} 次` : ''}</span>
      </li>`).join('');
  }

  function renderTopBarAndDashboard() {
    renderLangHelp();
    const diffDays = Math.max(0, Math.ceil((EXAM_AT.getTime() - Date.now()) / 86400000));
    $('#countdownBadge').textContent = `距 11/08 考试剩 ${diffDays} 天`;
    if ($('#heroCountdownVal')) $('#heroCountdownVal').textContent = `${diffDays} 天`;

    const todayStats = getTodayStats();
    const dueCount = cards.filter(isDue).length;
    const wrongCount = cards.filter(isWrong).length;
    const verifiedPool = cards.filter(isCountedForMastery);
    const unverifiedCount = cards.length - verifiedPool.length;
    const masteredCount = verifiedPool.filter(isMastered).length;
    const masteryPct = verifiedPool.length ? Math.round((masteredCount / verifiedPool.length) * 100) : 0;
    const tutorBookmarkCount = cards.filter(c => isMathCard(c) && (isBookmarked(c) || isWrong(c))).length;

    $('#statTodayCount').textContent = todayStats.total >= DAILY_TARGET ? `已完成 ✓ (${todayStats.total}/${DAILY_TARGET})` : `${todayStats.total} / ${DAILY_TARGET}`;
    $('#statStreak').textContent = `连续 ${getStreakDays()} 天`;
    $('#statTodayBar').style.width = `${Math.min(100, Math.round((todayStats.total / DAILY_TARGET) * 100))}%`;

    $('#statDueCount').textContent = String(dueCount);
    $('#statWrongCount').textContent = String(wrongCount);
    if ($('#heroWrongVal')) $('#heroWrongVal').textContent = String(wrongCount);
    $('#statMasteryPct').textContent = `${masteryPct}%`;
    $('#statMasterySub').textContent = `已核实 ${masteredCount}/${verifiedPool.length} (未核实${unverifiedCount}不计)`;
    $('#statMasteryBar').style.width = `${masteryPct}%`;

    if ($('#statAccuracyPct')) {
      const hasLogs = todayStats.total > 0;
      $('#statAccuracyPct').textContent = hasLogs ? `${todayStats.accuracy}%` : '--%';
      $('#statAccuracySub').textContent = `对 ${todayStats.correctCount} / ${todayStats.total} 题`;
      $('#statAccuracyBar').style.width = hasLogs ? `${todayStats.accuracy}%` : '0%';
    }

    $('#navWrongBadge').textContent = String(wrongCount);
    const planDone = cards.filter(isPracticed).length;
    $('#navPlanBadge').textContent = `${Math.round((planDone / cards.length) * 100)}%`;
    const audit = window.EJU_STAGE1_AUDIT?.summary;
    if (audit && $('#navAuditBadge')) $('#navAuditBadge').textContent = `${audit.verifiedConsistentCount}/${audit.mathTotal} 已核`;
    $('#tutorQueueBadge').textContent = String(tutorBookmarkCount);

    const hasResumable = state.activeSession && Array.isArray(state.activeSession.ids) && state.activeSession.index < state.activeSession.ids.length;
    $('#resumeSessionBtn').hidden = !hasResumable;
  }

  // ─── Deck Mastery Progress Grid ───
  function getDeckListForMode() {
    if (periodMode === 'bunso') {
      return [
        {id: '全部文综', label: '全部文综', filter: c => BUNSO_DECKS.includes(c.deck)},
        ...BUNSO_DECKS.map(d => ({id: d, label: d, filter: c => c.deck === d})),
        {id: '变形特训', label: '变形题特训', filter: c => !isMathCard(c) && isVariantCard(c)}
      ];
    }
    return [
      {id: '全部', label: '全科总览', filter: () => true},
      {id: '数Ⅰ·A', label: '数学コース1 (已核实)', filter: c => c.deck === '数Ⅰ·A'},
      ...BUNSO_DECKS.map(d => ({id: d, label: d, filter: c => c.deck === d})),
      {id: '变形特训', label: '真题改编变形题', filter: isVariantCard}
    ];
  }

  function renderDeckProgressGrid() {
    const deckDefs = getDeckListForMode();
    if (!deckDefs.some(d => d.id === selectedDeck)) {
      selectedDeck = deckDefs[0].id;
    }

    $('#consoleTitle').textContent = periodMode === 'bunso' ? '文综分科刷题与掌握进度' : '全科刷题与掌握进度';
    $('#consoleSub').textContent = `当前：${selectedDeck}（未核实题不计入掌握率）`;

    const container = $('#deckFilterBar');
    container.innerHTML = '';

    for (const def of deckDefs) {
      const pool = cards.filter(def.filter);
      const total = pool.length;
      if (total === 0) continue;
      const verifiedPool = pool.filter(isCountedForMastery);
      const unverifiedInPool = total - verifiedPool.length;
      const mastered = verifiedPool.filter(isMastered).length;
      const wrong = pool.filter(isWrong).length;
      const hasVerified = verifiedPool.length > 0;
      // The bar shows how much of this subject has been practised, so it moves for 未核实 subjects too
      const done = pool.filter(isPracticed).length;
      const pct = Math.round((done / total) * 100);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `deck-chip${selectedDeck === def.id ? ' is-active' : ''}`;
      btn.innerHTML = `
        <div class="deck-chip-top">
          <span>${def.label} <small class="jp-sub">${DECK_JP_SUB[def.id] || ''}</small></span>
          <span class="deck-chip-pct">${done}/${total}</span>
        </div>
        <div class="mini-bar mini-bar-ok"><span style="width:${pct}%"></span></div>
        <div class="deck-chip-sub">${
          hasVerified
            ? `已核实掌握 ${mastered}/${verifiedPool.length}${unverifiedInPool ? ` · 未核实 ${unverifiedInPool}` : ''}${wrong ? ` · 错题 ${wrong}` : ''}`
            : `做过 ${done} · 掌握 ${pool.filter(isLearned).length}${wrong ? ` · 错题 ${wrong}` : ''}`
        }</div>
      `;
      btn.addEventListener('click', () => {
        selectedDeck = def.id;
        renderDeckProgressGrid();
      });
      container.appendChild(btn);
    }
  }

  // ─── Collapsible Quick-Reference Tables (核心考点速查表) ───
  function renderKnowledgeAccordion() {
    const list = window.EJU_KNOWLEDGE || [];
    const query = ($('#globalSearchInput')?.value || '').trim().toLowerCase();
    const clearBtn = $('#clearSearchBtn');
    if (clearBtn) clearBtn.hidden = !query;

    // Filter knowledge items
    const filteredKp = list.filter(item => {
      if (currentKnowledgeCat === 'all' && periodMode === 'bunso' && !query && item.cat === 'math') {
        return false; // In daytime Bunso mode, hide math sheets unless user clicks '数学公式' or searches
      }
      if (currentKnowledgeCat !== 'all' && item.cat !== currentKnowledgeCat) return false;
      if (!query) return true;
      const hay = `${item.title} ${item.summary} ${item.html}`.toLowerCase();
      return hay.includes(query);
    });

    const container = $('#knowledgeList');
    container.innerHTML = '';

    for (const item of filteredKp) {
      const reg = item.topicFilter ? new RegExp(item.topicFilter) : null;
      const relatedCards = cards.filter(c => {
        const cat = normalizeDeckToCat(c.deck);
        const catMatch = (cat && cat === item.cat) || (c.deck === item.deck);
        if (!catMatch) return false;
        return !reg || reg.test(`${c.topic || ''} ${c.q || ''} ${c.expl || ''}`);
      });
      const mastered = relatedCards.filter(isMastered).length;

      const details = document.createElement('details');
      details.className = 'kp-details';
      if (query) details.open = true;

      details.innerHTML = `
        <summary class="kp-summary">
          <div class="kp-summary-left">
            <span class="tag">${item.badge}</span>
            <span class="kp-title">${item.title}</span>
            <span class="kp-desc">${item.summary}</span>
          </div>
          <button class="btn btn-xs kp-practice-btn" type="button">刷本节 (${mastered}/${relatedCards.length})</button>
        </summary>
        <div class="kp-body">${item.html}</div>
      `;

      details.querySelector('.kp-practice-btn').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const pool = relatedCards.length ? relatedCards : cards.filter(c => c.deck === item.deck);
        startCustomPoolSession(pool, item.title);
      });

      details.addEventListener('toggle', () => {
        if (details.open) {
          renderMathIn(details);
          // Mark today's "温习速查表" task as done!
          const today = localDateKey();
          state.tasks[today] = state.tasks[today] || {};
          state.tasks[today].readKp = true;
          saveState();
        }
      });

      container.appendChild(details);
      if (details.open) renderMathIn(details);
    }

    // Search matching cards preview
    const searchBox = $('#searchCardsResult');
    if (!query) {
      searchBox.hidden = true;
      searchBox.innerHTML = '';
      return;
    }

    const matchedCards = cards.filter(c =>
      `${c.deck} ${c.topic} ${c.q} ${c.expl || ''} ${c.back || ''}`.toLowerCase().includes(query)
    );
    searchBox.hidden = false;
    if (!matchedCards.length) {
      searchBox.innerHTML = `<div class="stat-hint">未找到包含“${query}”的题目</div>`;
      return;
    }

    searchBox.innerHTML = `
      <div class="section-head" style="margin-bottom:8px">
        <strong>题库匹配到 ${matchedCards.length} 道题</strong>
        <button class="btn btn-xs btn-primary" id="practiceSearchMatchesBtn" type="button">连刷这 ${matchedCards.length} 题</button>
      </div>
      <div id="searchRowsWrap"></div>
    `;
    $('#practiceSearchMatchesBtn').addEventListener('click', () => {
      startCustomPoolSession(matchedCards, `搜索：${query}`);
    });
    const wrap = $('#searchRowsWrap');
    for (const c of matchedCards.slice(0, 6)) {
      const row = document.createElement('div');
      row.className = 'search-card-row';
      row.innerHTML = `
        <span><span class="tag">${c.deck}</span> ${getSourceBadgeHtml(c)} ${c.q.slice(0, 65)}</span>
        <button class="btn btn-xs" type="button">单练</button>
      `;
      row.querySelector('button').addEventListener('click', () => startCustomPoolSession([c], c.topic));
      wrap.appendChild(row);
    }
  }

  // ─── Study Session Builder & Focused Card View ───
  function getFilteredPoolBySelectedDeck() {
    const defs = getDeckListForMode();
    const found = defs.find(d => d.id === selectedDeck) || defs[0];
    return cards.filter(found.filter);
  }

  // Official (real) questions vs self-written ones. The self-written cards were drilled first, so they sit in the
  // wrong book / due list for days and a plain priority sort never reaches the real questions. For the everyday
  // entry points (今日任务, 智能刷题, a subject…) reserve a share of the round for real questions, ramping up toward the exam.
  const isRealCard = c => c.auditStatus === 'verified' || String(c.id).startsWith('real-');
  function realShareToday() {
    const d = localDateKey();
    return d <= '2026-10-28' ? 0.3 : d <= '2026-11-03' ? 0.5 : 0.7;
  }

  function prioritizeCards(pool, limit = 20, opts = {}) {
    // Shuffle first: the sort is stable, so cards of equal priority come out mixed across subjects
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const ranked = shuffled
      .sort((a, b) => {
        const score = c => {
          const p = getProgress(c);
          if (isWrong(c)) return 0;
          if (isDue(c)) return 1;
          const isReal = c.auditStatus === 'verified' || c.id.startsWith('real-');
          const realBonus = isReal ? 0 : 5;
          if (p.reps === 0) return 2 + realBonus;
          if (p.box < 2) return 3;
          return 4 + p.box;
        };
        return score(a) - score(b);
      });
    if (!opts.mixReal) return ranked.slice(0, limit);
    const real = ranked.filter(isRealCard);
    const rest = ranked.filter(c => !isRealCard(c));
    if (!real.length || !rest.length) return ranked.slice(0, limit);
    let nReal = Math.min(real.length, Math.round(limit * realShareToday()));
    let nRest = Math.min(rest.length, limit - nReal);
    nReal = Math.min(real.length, limit - nRest); // not enough self-written cards: top up with real ones
    const total = nReal + nRest;
    // Spread the real questions evenly, never first: start with a warm-up, then the harder ones
    const realAt = new Set(Array.from({length: nReal}, (_, k) => Math.floor(((k + 1) * total) / (nReal + 1))));
    const picked = [];
    let ri = 0, si = 0;
    for (let i = 0; i < total; i++) picked.push(realAt.has(i) ? real[ri++] : rest[si++]);
    return picked;
  }

  function startCustomPoolSession(pool, label, limit = 20, opts = {}) {
    const picked = prioritizeCards(pool, limit, opts);
    if (!picked.length) return;
    queue = picked;
    sessionIndex = 0;
    state.activeSession = {ids: queue.map(c => c.id), index: 0, label};
    saveState();
    switchRoute('study');
    renderStudyCard();
  }

  // Stage 2: Marksheet state & Bilingual state
  // Language modes: bi = Japanese + Chinese below; jp = Japanese first, Chinese only after 「看不懂」 or answering;
  // cn = Chinese as the main text (for the person explaining)
  const LANG_LABEL = {bi: '双语', jp: '日文优先', cn: '中文'};
  let langMode = localStorage.getItem('eju_lang_mode') || (localStorage.getItem('eju_lang_cn') === 'false' ? 'jp' : 'bi');
  if (!LANG_LABEL[langMode]) langMode = 'bi';
  const revealedCn = new Set(); // cards whose Chinese was opened in 日文优先 mode this session
  const cnVisible = card => langMode !== 'jp' || revealedCn.has(card.id);

  function cycleLangMode() {
    langMode = {bi: 'jp', jp: 'cn', cn: 'bi'}[langMode];
    try { localStorage.setItem('eju_lang_mode', langMode); } catch {}
  }

  function setLangButton(btn) {
    if (!btn) return;
    btn.textContent = `语言：${LANG_LABEL[langMode]}`;
    btn.className = `btn btn-sm btn-lang${langMode === 'jp' ? ' is-jp' : ''}`;
  }

  // Remember which questions needed the Chinese, so the explainer can see where the Japanese got in the way
  function recordLangHelp(card) {
    if (!state.langHelp) state.langHelp = {};
    const prev = state.langHelp[card.id] || {n: 0};
    state.langHelp[card.id] = {n: prev.n + 1, at: Date.now()};
    saveState();
  }

  // Fill the question / choices text for the current language mode without re-rendering (keeps an answered state)
  function applyStudyLang(card, {questionEl, subEl, revealBtn, choicesBox}) {
    const show = cnVisible(card);
    const main = langMode === 'cn' && card.q_cn ? card.q_cn : (card.q || card.q_cn);
    const other = langMode === 'cn' ? card.q : card.q_cn;
    if (isMathCard(card)) questionEl.textContent = main;
    else questionEl.innerHTML = window.EJU_READ.richHtml(main);
    if (show && other && other !== main) {
      subEl.hidden = false;
      subEl.textContent = `${langMode === 'cn' ? '日文原文' : '中文译文'}：${other}`;
      if (card.cnAI && langMode !== 'cn') {
        const tag = document.createElement('span');
        tag.className = 'expl-ai-tag';
        tag.textContent = 'AI 译';
        subEl.prepend(tag);
      }
    } else {
      subEl.hidden = true;
    }
    if (revealBtn) revealBtn.hidden = show || !card.q_cn;
    choicesBox?.querySelectorAll('.choice-btn').forEach(btn => {
      const cn = btn.querySelector('.choice-cn');
      if (cn) cn.hidden = !show;
    });
    renderMathIn(questionEl.parentElement);
  }

  // 材料的 AI 中文译文：折叠，随语言模式显隐（日文优先模式要先点「看不懂」）
  function applyStudyPassageCn(card) {
    const box = $('#studyPassageCn');
    if (!box) return;
    const show = Boolean(card.passage && card.passage_cn) && cnVisible(card);
    box.hidden = !show;
    box.innerHTML = show ? window.EJU_READ.cnFoldHtml('材料译文', card.passage_cn, langMode === 'cn') : '';
  }

  function revealStudyChinese(record) {
    if (!activeCard || cnVisible(activeCard)) return;
    revealedCn.add(activeCard.id);
    if (record) recordLangHelp(activeCard);
    applyStudyLang(activeCard, studyLangEls());
    applyStudyPassageCn(activeCard);
  }

  const studyLangEls = () => ({questionEl: $('#studyQuestion'), subEl: $('#studyQuestionSub'),
    revealBtn: $('#studyCnRevealBtn'), choicesBox: $('#studyChoices')});
  let markCells = [];
  let activeCellIdx = 0;
  let markValues = [];

  function renderStudyCard() {
    activeCard = queue[sessionIndex];
    if (!activeCard) {
      state.activeSession = null;
      saveState();
      switchRoute('today');
      return;
    }
    answered = false;
    cardShownAt = Date.now();
    hintUsed = false;
    leftPageDuringCard = document.hidden;

    const total = queue.length;
    $('#studyProgressText').textContent = `${sessionIndex + 1} / ${total}`;
    $('#studyProgressFill').style.width = `${Math.round(((sessionIndex + 1) / total) * 100)}%`;
    $('#studyDeckTag').textContent = activeCard.deck;
    $('#studyTopicTag').textContent = activeCard.topic;
    applySourceTagAndBanner(activeCard, $('#studySourceTag'), $('#studyAuditBanner'));

    setLangButton($('#studyLangToggleBtn'));

    // Reset helper boxes
    $('#studyHintBox').hidden = true;
    $('#studyHintBox').textContent = getCardHint(activeCard);

    // 位置速查：本题题干/材料/选项里出现的国家、地区、城市等
    window.EJU_READ.hidePop();
    const geoBtn = $('#studyGeoBtn');
    const geoBox = $('#studyGeoBox');
    const geoTerms = isMathCard(activeCard) ? [] : window.EJU_READ.geoTerms(activeCard);
    geoBox.hidden = true;
    geoBox.textContent = '';
    geoBtn.hidden = geoTerms.length === 0;
    geoTerms.forEach(({word, hint}) => {
      const row = document.createElement('div');
      const b = document.createElement('b');
      b.textContent = word;
      row.append(b, `：${hint}`);
      geoBox.appendChild(row);
    });

    const passageBox = $('#studyPassageBox');
    if (passageBox) {
      if (activeCard.passage) {
        passageBox.innerHTML = window.EJU_READ.passageHtml(activeCard);
        passageBox.hidden = false;
      } else {
        passageBox.hidden = true;
      }
    }

    const paperBtn = $('#studyPaperBtn');
    const paperBox = $('#studyPaperBox');
    paperBox.hidden = true;
    paperBox.classList.remove('is-zoom');
    if (activeCard.paperImg) {
      paperBtn.hidden = false;
      $('#studyPaperImg').src = activeCard.paperImg;
      paperBox.hidden = false; // 带图的题默认直接显示原卷页图，「原卷」按钮可收起
    } else {
      paperBtn.hidden = true;
    }

    const mathBmBtn = $('#studyBookmarkMathBtn');
    if (isMathCard(activeCard)) {
      mathBmBtn.hidden = false;
      mathBmBtn.textContent = isBookmarked(activeCard) ? '已留着讲' : '留着讲';
    } else {
      mathBmBtn.hidden = true;
    }

    $('#studyFeedback').hidden = true;
    $('#studyRateBar').hidden = true;

    const choicesBox = $('#studyChoices');
    const flipBar = $('#studyFlipBar');
    const markPanel = $('#studyMarkPanel');
    choicesBox.innerHTML = '';

    if (activeCard.type === 'mark') {
      // EJU Math authentic Marksheet fill-in [A][B][CD]
      choicesBox.hidden = true;
      flipBar.hidden = true;
      markPanel.hidden = false;
      renderStudyMarkSlots(activeCard);
    } else if (activeCard.type === 'mcq') {
      // Bunso 4-choice MCQ (保留四选一マーク式)
      choicesBox.hidden = false;
      flipBar.hidden = true;
      markPanel.hidden = true;
      const cnList = Array.isArray(activeCard.choices_cn) ? activeCard.choices_cn : [];
      activeCard.choices.forEach((choiceText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        const cnText = chineseAddition(choiceText, cnList[idx]);
        const main = langMode === 'cn' && cnText ? cnText : choiceText;
        const sub = langMode === 'cn' ? (cnText ? choiceText : '') : cnText;
        const cn = sub ? `<span class="choice-cn">${sub}</span>` : '';
        btn.innerHTML = `<span class="choice-key">${idx + 1}</span><span class="choice-body"><span class="choice-jp">${isMathCard(activeCard) ? main : window.EJU_READ.richHtml(main)}</span>${cn}</span>`;
        btn.addEventListener('click', () => handleAnswerMcq(idx, btn));
        choicesBox.appendChild(btn);
      });
    } else {
      choicesBox.hidden = true;
      flipBar.hidden = false;
      markPanel.hidden = true;
    }

    applyStudyLang(activeCard, studyLangEls());
    applyStudyPassageCn(activeCard);
    renderMathIn($('#view-study'));
    window.EJU_LADDER_HOOK?.rendered?.(activeCard);
  }

  function renderStudyMarkSlots(card) {
    const container = $('#studyMarkSlots');
    container.innerHTML = '';
    markCells = [];
    markValues = [];
    activeCellIdx = 0;
    const emptyTip = $('#studyMarkEmptyTip');
    if (emptyTip) emptyTip.hidden = true;

    const blanks = Array.isArray(card.blanks) && card.blanks.length ? card.blanks : [{key: 'A', label: '[A]', ans: '0', len: 1}];
    let cellGlobalIdx = 0;

    blanks.forEach(b => {
      const len = b.len || (b.ans ? String(b.ans).length : 1);
      const box = document.createElement('div');
      box.className = 'mark-slot-box';
      box.id = `markSlotBox_${b.key}`;
      box.innerHTML = `
        <div class="mark-slot-label">${b.label}</div>
        <div class="mark-slot-inputs"></div>
        <div class="mark-slot-ans-hint" id="markSlotHint_${b.key}" hidden></div>
      `;
      const inputsWrap = box.querySelector('.mark-slot-inputs');
      for (let ci = 0; ci < len; ci++) {
        const cIdx = cellGlobalIdx++;
        const cell = document.createElement('div');
        cell.className = `mark-cell-input${cIdx === 0 ? ' is-focused' : ''}`;
        cell.id = `markCell_${cIdx}`;
        cell.textContent = '';
        cell.addEventListener('click', () => {
          if (answered) return;
          setActiveMarkCell(cIdx);
        });
        inputsWrap.appendChild(cell);
        markCells.push({blankKey: b.key, blankAns: String(b.ans), cellIdx: ci, globalIdx: cIdx, totalLen: len});
        markValues.push('');
      }
      container.appendChild(box);
    });
  }

  function setActiveMarkCell(idx) {
    if (idx < 0 || idx >= markCells.length) return;
    activeCellIdx = idx;
    markCells.forEach((c, i) => {
      const el = document.getElementById(`markCell_${i}`);
      if (el) el.classList.toggle('is-focused', i === activeCellIdx);
    });
  }

  function inputMarkChar(char) {
    if (answered || !activeCard || activeCard.type !== 'mark') return;
    if (char === 'del') {
      if (markValues[activeCellIdx]) {
        markValues[activeCellIdx] = '';
        const el = document.getElementById(`markCell_${activeCellIdx}`);
        if (el) el.textContent = '';
      } else if (activeCellIdx > 0) {
        setActiveMarkCell(activeCellIdx - 1);
        markValues[activeCellIdx] = '';
        const el = document.getElementById(`markCell_${activeCellIdx}`);
        if (el) el.textContent = '';
      }
      return;
    }
    if (!/^[0-9\-]$/.test(char)) return;
    markValues[activeCellIdx] = char;
    const emptyTip = $('#studyMarkEmptyTip');
    if (emptyTip) emptyTip.hidden = true;
    const el = document.getElementById(`markCell_${activeCellIdx}`);
    if (el) el.textContent = char;
    if (activeCellIdx < markCells.length - 1) {
      setActiveMarkCell(activeCellIdx + 1);
    }
  }

  function handleMarkSubmit() {
    if (answered || !activeCard || activeCard.type !== 'mark') return;
    // An empty sheet is not an attempt: ask for input instead of logging a wrong answer
    if (!markValues.some(v => v !== undefined && v !== '')) {
      const tip = $('#studyMarkEmptyTip');
      if (tip) tip.hidden = false;
      return;
    }
    answered = true;
    revealStudyChinese(false);
    let allCorrect = true;
    const blanks = activeCard.blanks || [];

    blanks.forEach(b => {
      const cellsForBlank = markCells.filter(c => c.blankKey === b.key);
      const userVal = cellsForBlank.map(c => markValues[c.globalIdx] || '').join('').trim();
      const expected = String(b.ans).trim();
      const isBlankCorrect = userVal === expected;
      if (!isBlankCorrect) allCorrect = false;

      const box = document.getElementById(`markSlotBox_${b.key}`);
      const hint = document.getElementById(`markSlotHint_${b.key}`);
      if (box) {
        box.classList.remove('is-active');
        box.classList.add(isBlankCorrect ? 'is-correct-blank' : 'is-wrong-blank');
      }
      if (hint) {
        hint.hidden = false;
        hint.textContent = isBlankCorrect ? '✓ 正确' : `✗ 正解：${expected}`;
      }
    });

    const ansSummary = activeCard.ansSummary || blanks.map(b => `${b.label}=${b.ans}`).join(', ');
    showStudyFeedback(allCorrect, ansSummary);
  }

  function revealMarkAnswers() {
    const blanks = activeCard.blanks || [];
    blanks.forEach(b => {
      const box = document.getElementById(`markSlotBox_${b.key}`);
      const hint = document.getElementById(`markSlotHint_${b.key}`);
      if (box) box.classList.add('is-wrong-blank');
      if (hint) {
        hint.hidden = false;
        hint.textContent = `正解：${b.ans}`;
      }
    });
  }

  function handleAnswerMcq(choiceIdx, clickedBtn) {
    if (answered) return;
    answered = true;
    revealStudyChinese(false);
    const isCorrect = choiceIdx === activeCard.a;

    $$('#studyChoices .choice-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === activeCard.a) btn.classList.add('is-correct');
      else if (btn === clickedBtn) btn.classList.add('is-wrong');
    });

    showStudyFeedback(isCorrect, mcqAnswerText(activeCard));
  }

  // Chinese under a Japanese option, only when it adds something: drop "下田・箱館（下田·箱馆）"-style echoes
  function chineseAddition(ja, cn) {
    if (!cn || cn === ja) return '';
    const norm = t => String(t).replace(/[·・\s]/g, '').replace(/[「」（）()]/g, '');
    let extra = cn;
    if (cn.startsWith(ja)) extra = cn.slice(ja.length).replace(/^（|）$/g, '');
    // Hide only an exact echo (e.g. 台湾（台湾）); anything with different characters is a real translation
    return norm(extra) === norm(ja) ? '' : extra;
  }

  function mcqAnswerText(card) {
    return `(${card.a + 1}) ${card.choices[card.a]}`;
  }

  function handleAnswerUnsure() {
    if (answered || !activeCard) return;
    answered = true;
    revealStudyChinese(false);
    if (activeCard.type === 'mcq') {
      $$('#studyChoices .choice-btn').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === activeCard.a) btn.classList.add('is-correct');
      });
    } else if (activeCard.type === 'mark') {
      revealMarkAnswers();
    }
    const ansText = activeCard.type === 'mcq'
      ? mcqAnswerText(activeCard)
      : (activeCard.ansSummary || activeCard.back);
    showStudyFeedback(false, ansText, true); // isUnsure = true
  }

  function handleRevealFlip() {
    if (answered) return;
    answered = true;
    revealStudyChinese(false);
    $('#studyFlipBar').hidden = true;
    showStudyFeedback(null, activeCard.back);
  }

  function showStudyFeedback(isCorrect, answerText, isUnsure = false) {
    const fb = $('#studyFeedback');
    const statusEl = $('#feedbackStatus');
    const ansEl = $('#feedbackAnswer');
    const explEl = $('#feedbackExpl');
    const trapEl = $('#feedbackTrap');
    const optExplBox = $('#feedbackOptExpl');
    const kpDock = $('#feedbackKpDock');
    const kpBtn = $('#studyKpLinkBtn');

    fb.hidden = false;
    if (isUnsure) {
      statusEl.className = 'feedback-status is-bad';
      statusEl.textContent = `标记为不确定（已按答错计入错题本）· 正确答案：${answerText}`;
      ansEl.hidden = true;
    } else if (isCorrect === true) {
      statusEl.className = 'feedback-status is-ok';
      statusEl.textContent = '回答正确';
      ansEl.hidden = true;
    } else if (isCorrect === false) {
      statusEl.className = 'feedback-status is-bad';
      statusEl.textContent = `答错（已进错题本）· 正确答案：${answerText}`;
      ansEl.hidden = true;
    } else {
      statusEl.className = 'feedback-status';
      statusEl.textContent = '参考答案';
      ansEl.hidden = false;
      ansEl.textContent = answerText;
    }

    // 4-Option breakdown: why correct is right, why the 3 incorrect options are wrong
    if (activeCard.optExpl && Array.isArray(activeCard.optExpl) && activeCard.optExpl.length === 4) {
      optExplBox.hidden = false;
      optExplBox.innerHTML = `
        <div class="opt-expl-heading">逐项解析</div>
        <div class="opt-expl-list">
          ${activeCard.optExpl.map((txt, idx) => `
            <div class="opt-expl-item ${idx === activeCard.a ? 'is-correct-opt' : 'is-wrong-opt'}">
              <span class="opt-expl-num">(${idx + 1})</span>
              <span class="opt-expl-text">${String(txt).replace(/^选项\(\d\)\s*/, '')}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      optExplBox.hidden = true;
      optExplBox.innerHTML = '';
    }

    if (isMathCard(activeCard)) {
      // Math derivations must be shown in full, one step per line
      explEl.innerHTML = formatMathStepsHtml(activeCard.expl || '按基本公式代入即可。');
    } else {
      explEl.textContent = getConciseExpl(activeCard);
      if (activeCard.explAI) {
        const tag = document.createElement('span');
        tag.className = 'expl-ai-tag';
        tag.textContent = 'AI 解析';
        explEl.prepend(tag);
      }
    }
    const explCnBox = $('#feedbackExplCn');
    if (explCnBox) {
      const showCn = Boolean(activeCard.expl_cn) && cnVisible(activeCard);
      explCnBox.hidden = !showCn;
      explCnBox.innerHTML = showCn ? window.EJU_READ.cnFoldHtml('解析译文', activeCard.expl_cn, true) : '';
    }
    if (activeCard.trap) {
      trapEl.hidden = false;
      if (isMathCard(activeCard)) trapEl.innerHTML = `<div class="ms-head">防坑提醒</div>${formatMathInlineHtml(activeCard.trap)}`;
      else trapEl.textContent = `防坑提醒：${activeCard.trap}`;
    } else {
      trapEl.hidden = true;
    }

    // Direct link to core knowledge point quick-reference sheet
    const kpList = window.EJU_KNOWLEDGE || [];
    const matchedKp = findMatchedKp(activeCard);
    if (matchedKp) {
      kpDock.hidden = false;
      const shortTitle = (matchedKp.title || '').split('：')[0] || '速查表';
      kpBtn.textContent = `考点速查：${shortTitle}`;
      kpBtn.onclick = () => {
        $('#refModalTitle').textContent = matchedKp.title;
        $('#refModalBody').innerHTML = matchedKp.html;
        $('#refModal').hidden = false;
        renderMathIn($('#refModalBody'));
      };
    } else {
      kpDock.hidden = true;
    }

    $('#studyRateBar').hidden = false;
    window.EJU_LADDER_HOOK?.feedback?.(activeCard, isCorrect, isUnsure);
    activeCard._lastGradeCorrect = isCorrect && !isUnsure;
    applyAutoGrade(isCorrect, isUnsure);
    renderMathIn(fb);
  }

  // Stage 2 Wrong Book Dual-Clear Rule:
  // "原题答对 1 次，加同考点变形题答对 1 次才移出" (clearedOriginal && clearedVariant)
  function recordCardGrade(card, grade, isUnsure = false) {
    const prev = getProgress(card);
    const wasWrong = isWrong(card);
    let box = prev.box || 0;
    let lapses = prev.lapses || 0;
    let inWrongBook = prev.inWrongBook !== undefined ? prev.inWrongBook : wasWrong;
    let clearedOriginal = Boolean(prev.clearedOriginal);
    let clearedVariant = Boolean(prev.clearedVariant);

    const ok = (grade === 'good' || grade === 'easy') && !isUnsure;
    // 模糊（hard）：答对了但没把握（用了提示 / 用时偏长 / 自己点的）。不算答错：不进错题本、不记失误，
    // 只把掌握档位降一档（最低 1），让它明天就再出现。以前这一档会被当成答错处理，下面那个 hard 分支永远走不到。
    const soft = grade === 'hard' && !isUnsure;
    if (soft) {
      box = Math.max(1, box - 1);
    } else if (!ok) {
      box = 0;
      lapses += 1;
      inWrongBook = true;
      clearedOriginal = false;
      clearedVariant = false;
    } else {
      box = Math.min(INTERVALS.length - 1, box + 1);
      if (inWrongBook) {
        clearedOriginal = true;
        if (clearedOriginal && clearedVariant) {
          inWrongBook = false; // 原题 1 次 ＋ 同考点 1 次，正式销号移出错题本！
          box = Math.max(2, box);
        }
      }
    }

    // When answered correctly, check if this card satisfies `clearedVariant` for any other card in wrong book with same topic!
    if (ok) {
      for (const otherId in state.progress) {
        if (otherId === card.id) continue;
        const otherProg = state.progress[otherId];
        if (otherProg && otherProg.inWrongBook) {
          const otherCard = cards.find(x => x.id === otherId);
          if (otherCard && otherCard.topic === card.topic && otherCard.deck === card.deck) {
            otherProg.clearedVariant = true;
            if (otherProg.clearedOriginal && otherProg.clearedVariant) {
              otherProg.inWrongBook = false; // 另一道同考点错题也达成双重攻克！
              otherProg.box = Math.max(2, otherProg.box || 0);
            }
          }
        }
      }
    }

    const clearedWrong = wasWrong && !inWrongBook;
    state.progress[card.id] = {
      box,
      due: addDays(INTERVALS[box]),
      reps: (prev.reps || 0) + 1,
      lapses,
      inWrongBook,
      clearedOriginal,
      clearedVariant,
      lastGrade: grade,
      updatedAt: Date.now()
    };

    state.history.push({
      id: card.id,
      date: localDateKey(),
      grade,
      correct: ok,
      clearedWrong,
      at: Date.now()
    });
    if (state.history.length > 4000) state.history = state.history.slice(-4000);
    saveState();
    scheduleAtriReport();
  }

  // ─── 自动判定掌握程度（选择题 / 填空题有对错；翻卡题没有对错，仍然手动三选一）───
  // 答错或标「不确定」→ 没掌握；答对 → 看有没有用提示/速查表、用时是否明显偏长：没问题记「掌握」，否则记「模糊」。
  // 用时上限随题目长短变化（读材料要时间）：(40 秒 + 每个字 0.15 秒，最多 180 秒) 的 2 倍，最多 300 秒；中途切走过页面则不按用时降级。
  function autoGradeFor(card, isCorrect, isUnsure) {
    if (isCorrect === null || isCorrect === undefined) return null;
    if (isUnsure || isCorrect === false) {
      return {grade: 'again', note: isUnsure ? '标了「不确定」，已进错题本' : '答错了，已进错题本'};
    }
    const chars = String(card.q || '').length + String(card.passage || '').length
      + (Array.isArray(card.choices) ? card.choices.join('').length : 0);
    // 用时只在「慢到离谱」时才降级（正常读日语材料本来就慢）：参考时间的 2 倍，最多 300 秒。
    // 「模糊」要少用（Anki 的建议：大多数时候按「良好」，「困难」少用），主要靠「用了提示/速查表」来判。
    const limit = Math.min(300, 2 * Math.min(180, 40 + chars * 0.15));
    const secs = Math.max(0, Math.round((Date.now() - cardShownAt) / 1000));
    if (hintUsed) return {grade: 'hard', note: `答对了，但用了提示/速查表（${secs} 秒）`};
    if (!leftPageDuringCard && secs > limit) return {grade: 'hard', note: `答对了，但用时太长（${secs} 秒，这道题参考 ${Math.round(limit)} 秒内）`};
    return {grade: 'good', note: `答对了，${secs} 秒，没用提示`};
  }

  const GRADE_LABEL = {again: '没掌握', hard: '模糊', good: '掌握'};

  function applyAutoGrade(isCorrect, isUnsure) {
    const auto = autoGradeFor(activeCard, isCorrect, isUnsure);
    activeCard._auto = auto;
    const box = $('#autoRate');
    const manual = $('#rateButtonsGroup');
    if (!box || !manual) return;
    if (!auto) {
      box.hidden = true;
      manual.style.display = '';
      return;
    }
    box.hidden = false;
    manual.style.display = 'none';
    $('#autoNote').innerHTML = `自动记为：<b>${GRADE_LABEL[auto.grade]}</b>（${auto.note}）`;
    const others = auto.grade === 'again' ? [] : ['good', 'hard', 'again'].filter(g => g !== auto.grade);
    $('#autoOverride').hidden = !others.length;
    $('#autoOverrideBtns').innerHTML = others.map(g => `<button type="button" data-override="${g}">改记为${GRADE_LABEL[g]}</button>`).join('');
    $$('#autoOverrideBtns [data-override]').forEach(btn => {
      btn.addEventListener('click', () => advanceStudyCard(btn.dataset.override));
    });
  }

  const autoOrGood = () => (activeCard && activeCard._auto && activeCard._auto.grade) || 'good';

  function advanceStudyCard(rateGrade) {
    if (!activeCard) return;
    let finalGrade = rateGrade;
    if (activeCard._lastGradeCorrect === false && rateGrade !== 'again') {
      finalGrade = 'again'; // 答错的题（含标了「不确定」）一律进错题本，不能被改成掌握/模糊
    }
    recordCardGrade(activeCard, finalGrade);

    sessionIndex += 1;
    if (state.activeSession) {
      state.activeSession.index = sessionIndex;
    }
    if (sessionIndex >= queue.length) {
      if (window.EJU_LADDER_HOOK?.sessionEnd?.()) return;
      state.activeSession = null;
      saveState();
      switchRoute('today');
      return;
    }
    saveState();
    renderStudyCard();
  }

  // ─── Wrong Answer Book (#view-wrong) ───
  function renderWrongBook() {
    let list = [];
    if (wrongFilter === 'bookmark') {
      list = cards.filter(c => isMathCard(c) && (isBookmarked(c) || isWrong(c)));
    } else {
      list = cards.filter(c => {
        if (!isWrong(c)) return false;
        if (wrongFilter === 'bunso') return !isMathCard(c);
        if (wrongFilter === 'math') return isMathCard(c);
        return true;
      });
    }

    const container = $('#wrongBookList');
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = `<div class="stat-hint" style="padding:18px 4px">当前分类下没有待消错题。做错或不确定的题目会自动收录到这里，需原题答对 1 次 ＋ 同考点变形题答对 1 次才移出。</div>`;
      return;
    }

    for (const c of list) {
      const p = getProgress(c);
      const ansText = c.type === 'mark'
        ? (c.ansSummary || (c.blanks || []).map(b => `${b.label}=${b.ans}`).join(', '))
        : c.type === 'mcq'
        ? (langMode === 'cn' && c.choices_cn ? c.choices_cn[c.a] : c.choices[c.a])
        : c.back;
      const qText = langMode === 'cn' && c.q_cn ? c.q_cn : c.q;
      const item = document.createElement('div');
      item.className = 'wrong-item';
      item.innerHTML = `
        <div class="wrong-item-main">
          <div class="wrong-item-meta">
            <span class="tag">${c.deck} · ${c.topic}</span>
            ${getSourceBadgeHtml(c)}
            <div class="wrong-dual-tags">
              <span class="wrong-tag-chip ${p.clearedOriginal ? 'is-cleared' : 'is-pending'}">
                原题 ${p.clearedOriginal ? '✓' : '0/1'}
              </span>
              <span class="wrong-tag-chip ${p.clearedVariant ? 'is-cleared' : 'is-pending'}">
                变式 ${p.clearedVariant ? '✓' : '0/1'}
              </span>
            </div>
          </div>
          <div class="wrong-item-q">${qText}</div>
          ${state.hwNotes?.[c.id] ? `<p class="wrong-hw-note">作业「${escapeHtml(state.hwNotes[c.id].title)}」批改：${escapeHtml(state.hwNotes[c.id].comment || (state.hwNotes[c.id].verdict === 'half' ? '半对' : '错'))}</p>` : ''}
          <div class="wrong-item-ans">正确答案：${ansText}</div>
        </div>
        <div class="wrong-item-actions">
          <button class="btn btn-sm btn-primary" data-act="practice" type="button">重练</button>
          <button class="btn btn-sm" data-act="variant" type="button">同考点</button>
          ${isMathCard(c) ? `<button class="btn btn-sm" data-act="tutor" type="button">讲题</button>` : ''}
          <button class="btn btn-sm" data-act="clear" type="button">移出</button>
        </div>
      `;

      item.querySelector('[data-act="practice"]').addEventListener('click', () => {
        startCustomPoolSession([c], `错题重练：${c.topic}`, 1);
      });
      item.querySelector('[data-act="variant"]').addEventListener('click', () => {
        let variants = cards.filter(x => x.id !== c.id && x.deck === c.deck && x.topic === c.topic);
        if (!variants.length) {
          variants = cards.filter(x => x.id !== c.id && x.deck === c.deck);
        }
        startCustomPoolSession(variants, `同考点特训：${c.topic}`, 5);
      });
      const tutorBtn = item.querySelector('[data-act="tutor"]');
      if (tutorBtn) {
        tutorBtn.addEventListener('click', () => {
          state.bookmarks[c.id] = true;
          saveState();
          openMathTutorWithCard(c.id);
        });
      }
      item.querySelector('[data-act="clear"]').addEventListener('click', () => {
        const cur = getProgress(c);
        state.progress[c.id] = {...cur, box: Math.max(2, cur.box || 0), inWrongBook: false, clearedOriginal: true, clearedVariant: true};
        if (state.bookmarks) delete state.bookmarks[c.id];
        saveState();
        renderTopBarAndDashboard();
        renderWrongBook();
      });

      container.appendChild(item);
    }
    renderMathIn(container);
  }

  // ─── 17-Day Sprint Plan (#view-plan) 100% Live Linked ───
  function renderLinkedPlan() {
    const today = localDateKey();
    const todayStats = getTodayStats();
    const dayTasks = state.tasks[today] || {};

    $('#planTodayDateLabel').textContent = `今日（${today}）实时学习联动 —— 刷题后下方进度条自动增长并完成打卡`;

    const taskDefs = [
      {
        key: 'bunso30',
        title: '日间文综刷满 30 题',
        current: todayStats.bunsoCount,
        target: 30,
        autoDone: todayStats.bunsoCount >= 30,
        btnText: '去刷文综',
        onAction: () => {
          setPeriodMode('bunso');
          startCustomPoolSession(cards.filter(c => BUNSO_DECKS.includes(c.deck)), '今日文综冲刺', 30, {mixReal: true});
        }
      },
      {
        key: 'wrong5',
        title: '错题本攻克 / 复习 5 题',
        current: todayStats.wrongCleared + cards.filter(c => getProgress(c).updatedAt > Date.now() - 43200000 && getProgress(c).lapses > 0).length,
        target: 5,
        autoDone: todayStats.wrongCleared >= 3,
        btnText: '去消错题',
        onAction: () => {
          const wrongPool = cards.filter(isWrong);
          if (wrongPool.length) startCustomPoolSession(wrongPool, '错题攻坚', 15);
          else switchRoute('wrong');
        }
      },
      {
        key: 'math5',
        title: '晚间数学伴学讲练 5 题',
        current: todayStats.mathCount,
        target: 5,
        autoDone: todayStats.mathCount >= 5,
        btnText: '去数学讲题台',
        onAction: () => {
          setPeriodMode('math');
          switchRoute('math');
        }
      },
      {
        key: 'readKp',
        title: '核心速查表温习 1 节',
        current: dayTasks.readKp ? 1 : 0,
        target: 1,
        autoDone: Boolean(dayTasks.readKp),
        btnText: '去看速查表',
        onAction: () => switchRoute('today')
      }
    ];

    const tasksGrid = $('#linkedTasksGrid');
    tasksGrid.innerHTML = '';
    let doneCount = 0;

    for (const t of taskDefs) {
      const isDone = Boolean(dayTasks[t.key] || t.autoDone);
      if (isDone) doneCount++;
      const pct = Math.min(100, Math.round((t.current / t.target) * 100));

      const box = document.createElement('div');
      box.className = `linked-task-card${isDone ? ' is-done' : ''}`;
      box.innerHTML = `
        <div class="linked-task-top">
          <label class="linked-task-label">
            <input type="checkbox" ${isDone ? 'checked' : ''}>
            <span>${t.title}</span>
          </label>
          <button class="btn btn-xs" type="button">${t.btnText}</button>
        </div>
        <div class="mini-bar mini-bar-ok"><span style="width:${isDone ? 100 : pct}%"></span></div>
        <div class="linked-task-foot">
          <span>实时进度：${Math.min(t.current, t.target)} / ${t.target}</span>
          <span>${isDone ? '今日已达成' : '待完成'}</span>
        </div>
      `;

      box.querySelector('input').addEventListener('change', e => {
        state.tasks[today] = state.tasks[today] || {};
        state.tasks[today][t.key] = e.target.checked;
        saveState();
        renderLinkedPlan();
      });
      box.querySelector('button').addEventListener('click', t.onAction);
      tasksGrid.appendChild(box);
    }

    $('#planTodaySummaryTag').textContent = `今日已完成 ${doneCount} / ${taskDefs.length} 项`;

    // 4-Stage Roadmap linked to actual deck mastery
    const stageDefs = [
      {
        start: '2026-10-22',
        end: '2026-10-25',
        title: '第 1 阶段（10/22 - 10/25）：日本政治·条约通刷 & 数学二次函数保底',
        desc: '下午拿稳文综分值最高的【日本政治 + 条约】；晚上女朋友讲透【数与式 + 二次函数配方与最值】（占数学卷面40%）。',
        modules: [
          {label: '日本政治', filter: c => c.deck === '政治'},
          {label: '条约对比', filter: c => c.deck === '条約'},
          {label: '数学·二次函数与数式', filter: c => isMathCard(c) && (c.mtype ? ['quad', 'expr', 'ineq'].includes(c.mtype) : /2次|数と式|因数|命題/.test(`${c.topic} ${c.q}`))}
        ]
      },
      {
        start: '2026-10-26',
        end: '2026-10-30',
        title: '第 2 阶段（10/26 - 10/30）：地理统计·宏观经济 & 数学三角几何·概率整数',
        desc: '下午攻克【柯本气候/农矿统计 + 日银财政汇率】；晚上用讲题台攻克【余弦/正弦/内切圆 + 双骰子概率与整数】。',
        modules: [
          {label: '地理与统计', filter: c => c.deck === '地理'},
          {label: '宏观经济', filter: c => c.deck === '経済'},
          {label: '数学·三角几何与概率整数', filter: c => isMathCard(c) && (c.mtype ? ['geo', 'prob', 'int'].includes(c.mtype) : /図形|三角|余弦|正弦|確率|場合|整数/.test(`${c.topic} ${c.q}`))}
        ]
      },
      {
        start: '2026-10-31',
        end: '2026-11-04',
        title: '第 3 阶段（10/31 - 11/04）：变形题专项特训 & 近 5 年数学真题原卷演练',
        desc: '集中清理所有【变形特训题】与【历史·现代社会】；晚上在讲题台直接用 2021-2025 真题原卷练每道大题前(1)问。',
        modules: [
          {label: '变形题与真题特训', filter: isVariantCard},
          {label: '近现代历史', filter: c => c.deck === '歴史'},
          {label: '现代社会', filter: c => c.deck === '社会'}
        ]
      },
      {
        start: '2026-11-05',
        end: '2026-11-07',
        title: '第 4 阶段（11/05 - 11/07）：错题本清零 + 时事与旧地名收官',
        desc: '考前3天不碰偏题难题，把错题本连对2次全部销号，通读速查表中的时事与旧地名，稳住心态上考场。',
        modules: [
          {label: '时事热点', filter: c => c.deck === '時事'},
          {label: '旧地名与首都', filter: c => c.deck === '旧地名'},
          {label: '数学真题总复盘', filter: c => /数/.test(c.deck)}
        ]
      }
    ];

    const phasesContainer = $('#phasesLinkedList');
    phasesContainer.innerHTML = '';

    for (const st of stageDefs) {
      const isCurrent = today >= st.start && today <= st.end;
      // Plan progress counts every question (verified or not): "done" = answered at least once,
      // "learned" = answered right on two different days (box ≥ 2). 掌握率 elsewhere still counts only verified ones.
      const allStageCards = cards.filter(c => st.modules.some(m => m.filter(c)));
      const stageDone = allStageCards.filter(isPracticed).length;
      const stageLearned = allStageCards.filter(isLearned).length;
      const stagePct = allStageCards.length ? Math.round((stageDone / allStageCards.length) * 100) : 0;

      const cardEl = document.createElement('div');
      cardEl.className = `phase-card${isCurrent ? ' is-current' : ''}`;
      cardEl.innerHTML = `
        <div class="phase-head">
          <span class="phase-title">${st.title}</span>
          <span class="tag${isCurrent ? '' : ' tag-subtle'}">${isCurrent ? '当前阶段' : `${st.start} ~ ${st.end}`} · 做过 ${stagePct}%（${stageDone}/${allStageCards.length}）· 掌握 ${stageLearned}</span>
        </div>
        <p class="phase-desc">${st.desc}</p>
        <div class="phase-modules-grid"></div>
      `;

      const grid = cardEl.querySelector('.phase-modules-grid');
      for (const mod of st.modules) {
        const pool = cards.filter(mod.filter);
        const done = pool.filter(isPracticed).length;
        const learned = pool.filter(isLearned).length;
        const unmastered = pool.filter(c => !isLearned(c));
        const pct = pool.length ? Math.round((done / pool.length) * 100) : 0;
        const unverified = pool.some(isUnverified);

        const modBox = document.createElement('div');
        modBox.className = 'phase-mod-box';
        modBox.innerHTML = `
          <div class="phase-mod-top">
            <span>${mod.label}</span>
            <span>${pct}%</span>
          </div>
          <div class="mini-bar mini-bar-ok"><span style="width:${pct}%"></span></div>
          <div class="phase-mod-foot">
            <span>做过 ${done}/${pool.length} · 掌握 ${learned}${unverified ? ' · 未核实' : ''}</span>
            ${pool.length ? `<button class="text-btn" type="button">${unmastered.length ? `去练习 (${unmastered.length})` : '复习本组'}</button>` : ''}
          </div>
        `;
        modBox.querySelector('button')?.addEventListener('click', () => {
          startCustomPoolSession(unmastered.length ? unmastered : pool, mod.label, 20, {mixReal: true});
        });
        grid.appendChild(modBox);
      }
      phasesContainer.appendChild(cardEl);
    }

    renderHistoryChart();
    renderAccuracyChart();
    renderMocksList();
  }

  function renderHistoryChart() {
    const chart = $('#historyChart');
    if (!chart) return;
    chart.innerHTML = '';
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = localDateKey(d);
      const cnt = state.history.filter(h => h.date === key).length;
      counts.push({label: key.slice(5), cnt});
    }
    const maxCnt = Math.max(DAILY_TARGET, ...counts.map(c => c.cnt));
    // A dashed tick at the daily goal in every track, so each day reads against the target
    const targetPct = Math.round((DAILY_TARGET / maxCnt) * 100);
    counts.forEach((item, i) => {
      const hPct = Math.round((item.cnt / maxCnt) * 100);
      const col = document.createElement('div');
      col.className = i === counts.length - 1 ? 'chart-col is-today' : 'chart-col';
      col.innerHTML = `
        <span class="chart-val">${item.cnt}</span>
        <div class="chart-bar-wrap"><i class="chart-target-tick" style="bottom:${targetPct}%"></i><div class="chart-bar-fill" style="height:${hPct}%"></div></div>
        <span class="chart-day">${i === counts.length - 1 ? '今天' : item.label}</span>
      `;
      chart.appendChild(col);
    });
  }

  // Daily accuracy curve: same buckets and ownership rule as buildAtriReport (again = wrong, hard = fuzzy, else right)
  function renderAccuracyChart() {
    const box = $('#accuracyChart');
    if (!box) return;
    const SVGNS = 'http://www.w3.org/2000/svg';
    const myName = window.EJU_SYNC?.myName?.();
    const byDay = {};
    for (const h of state.history) {
      if (h.by && h.by !== myName) continue;
      const key = tokyoDateKey(h.at || Date.parse(h.date));
      const d = byDay[key] || (byDay[key] = {n: 0, ok: 0, soft: 0});
      d.n++;
      if (h.grade === 'again') continue;
      d.soft++;
      if (h.grade !== 'hard') d.ok++;
    }
    const days = [];
    for (let i = 14; i >= 0; i--) {
      const key = localDateKey(new Date(Date.now() - i * 86400000));
      if (key < '2026-10-20') continue;
      const d = byDay[key];
      days.push({key, n: d ? d.n : 0, ok: d ? d.ok / d.n : null, soft: d ? d.soft / d.n : null});
    }
    const W = 420, H = 222, L = 34, R = 12, T = 22, B = 56;
    const x = i => L + (days.length > 1 ? (W - L - R) * i / (days.length - 1) : (W - L - R) / 2);
    const y = v => T + (H - T - B) * (1 - v);
    const el = (tag, attrs, text) => {
      const e = document.createElementNS(SVGNS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (text != null) e.textContent = text;
      return e;
    };
    const svg = el('svg', {viewBox: `0 0 ${W} ${H}`, class: 'accuracy-svg', role: 'img', 'aria-label': '每日正确率折线图'});
    [0, 0.5, 1].forEach(v => {
      svg.appendChild(el('line', {x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'acc-grid'}));
      svg.appendChild(el('text', {x: L - 6, y: y(v) + 3, class: 'acc-axis', 'text-anchor': 'end'}, Math.round(v * 100) + '%'));
    });
    const line = (field, cls) => {
      let path = '';
      days.forEach((d, i) => {
        if (d[field] == null) return;
        path += (i > 0 && days[i - 1][field] != null ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d[field]).toFixed(1);
      });
      if (path) svg.appendChild(el('path', {d: path, class: cls}));
    };
    line('soft', 'acc-line-loose');
    line('ok', 'acc-line');
    days.forEach((d, i) => {
      const isToday = i === days.length - 1;
      if (d.ok != null) {
        const dot = el('circle', {cx: x(i), cy: y(d.ok), r: isToday ? 5 : 3, class: isToday ? 'acc-dot is-today' : 'acc-dot'});
        dot.appendChild(el('title', {}, `${d.key.slice(5)}：${Math.round(d.ok * 100)}%（${d.n} 题）`));
        svg.appendChild(dot);
        if (isToday) {
          // Keep the label off the line: below the dot when the line comes down from above, else above
          const prev = days.slice(0, i).reverse().find(p => p.ok != null);
          const below = prev && prev.ok > d.ok;
          svg.appendChild(el('text', {x: x(i), y: y(d.ok) + (below ? 17 : -9), class: 'acc-today-val', 'text-anchor': 'end'}, Math.round(d.ok * 100) + '%'));
        }
      }
      const showDate = isToday || (days.length - 1 - i) % 2 === 0 && days.length - 1 - i >= 2;
      if (showDate) svg.appendChild(el('text', {x: x(i), y: H - 26, class: isToday ? 'acc-axis is-today' : 'acc-axis', 'text-anchor': 'middle'}, isToday ? '今天' : d.key.slice(5)));
      svg.appendChild(el('text', {x: x(i), y: H - 9, class: isToday ? 'acc-count is-today' : 'acc-count', 'text-anchor': 'middle'}, d.n || ''));
    });
    box.replaceChildren(svg);
  }

  function renderMocksList() {
    const box = $('#mockList');
    if (!box) return;
    const all = state.mocks || [];
    const kindOf = m => (m.kind === 'bunso' ? (m.real ? 'bunso_real' : 'bunso') : (m.real ? 'math' : 'manual'));
    const pct = m => (m.total ? Math.round((m.correct / m.total) * 100) : Math.round((m.score / 200) * 100));
    const groups = [
      ['bunso_real', '文综真题模考', m => `正确 ${m.correct}/${m.total} 题（${m.score}%）`],
      ['math', '数学真题模考', m => `正确 ${m.correct}/${m.total} 空（${pct(m)}%）`],
      ['bunso', '文综仿真卷（非真题）', m => `正确 ${m.correct}/${m.total} 题（${m.score}%）`],
      ['manual', '手动记录的成绩', m => `${m.subject} · ${m.score} 分`]
    ];
    box.innerHTML = '';
    for (const [kind, title, fmt] of groups) {
      const list = all.filter(m => kindOf(m) === kind);
      if (!list.length && kind === 'manual') continue;
      const sec = document.createElement('div');
      sec.className = 'mock-group';
      const pts = list.slice(-12).map(pct);
      let spark = '';
      if (pts.length >= 2) {
        const W = 160, H = 36;
        const xy = pts.map((v, i) => `${Math.round((i / (pts.length - 1)) * (W - 8)) + 4},${Math.round(H - 4 - (v / 100) * (H - 8))}`);
        spark = `<svg class="mock-spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="正确率趋势"><polyline fill="none" stroke="#d67052" stroke-width="2" points="${xy.join(' ')}"/>${xy.map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="2.5" fill="#d67052"/>`).join('')}</svg>`;
      }
      sec.innerHTML = `<div class="mock-group-head"><b>${title}</b>${spark}</div>`;
      for (const m of list.slice().reverse().slice(0, 6)) {
        const row = document.createElement('div');
        row.className = 'mock-row';
        row.innerHTML = `<span>${fmt(m)}</span><span class="stat-hint">${m.note || ''} (${m.date})</span>`;
        sec.appendChild(row);
      }
      if (!list.length) sec.insertAdjacentHTML('beforeend', '<p class="stat-hint">还没有记录。</p>');
      box.appendChild(sec);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 晚间 · 数学讲题台 (Math Tutoring Station: Cards + Past Papers + Whiteboard + Grapher)
  // ═════════════════════════════════════════════════════════════════════════
  function getTutorFilteredCards() {
    const mode = $('#tutorFilterSelect')?.value || 'real';
    const mathPool = cards.filter(isMathCard);
    if (mode === 'bookmark') {
      const bm = mathPool.filter(c => isBookmarked(c) || isWrong(c));
      return bm.length ? bm : mathPool.filter(c => c.id.startsWith('real-'));
    }
    if (mode === 'real') return mathPool.filter(c => c.id.startsWith('real-'));
    if (mode === 'quad') return mathPool.filter(c => /2次|数と式|因数|命題/.test(`${c.topic} ${c.q}`));
    if (mode === 'trig') return mathPool.filter(c => /図形|三角|余弦|正弦|円/.test(`${c.topic} ${c.q}`));
    if (mode === 'prob') return mathPool.filter(c => /確率|場合|整数|互除/.test(`${c.topic} ${c.q}`));
    if (mode === 'var') return mathPool.filter(c => c.id.startsWith('var-'));
    return mathPool;
  }

  function formatMathCardLabel(c, idx) {
    const m = (c.source || '').match(/(\d{4})[^\d]*?(?:問|第)(\d+)\s*(\([^\)]+\))?/);
    let prefix = '';
    if (m) {
      prefix = `${m[1]} · 第${m[2]}問${m[3] || ''}`;
    } else {
      const yMatch = (c.id || '').match(/(\d{4})/);
      prefix = yMatch ? `${yMatch[1]}真题` : `数学题 ${idx + 1}`;
    }
    return `${prefix} · ${c.topic || ''}`;
  }

  // Math tutor filter: by question type, and "core only" = the score-friendly questions
  let tutorType = '';
  let tutorCoreOnly = false;
  function mathTutorPool() {
    return cards.filter(c => isMathCard(c) && (!tutorType || c.mtype === tutorType) && (!tutorCoreOnly || c.level === 'core'));
  }

  function renderTutorTypeBar() {
    const bar = $('#tutorTypeBar');
    const types = window.EJU_MATH_TYPES || {};
    if (!bar) return;
    const count = t => cards.filter(c => isMathCard(c) && c.mtype === t && (!tutorCoreOnly || c.level === 'core')).length;
    bar.innerHTML = [`<button type="button" class="cat-tab${tutorType ? '' : ' is-active'}" data-mtype="">全部</button>`,
      ...Object.entries(types).map(([k, t]) => `<button type="button" class="cat-tab${tutorType === k ? ' is-active' : ''}" data-mtype="${k}">${t.short} ${count(k)}</button>`),
      `<label class="wb-check"><input type="checkbox" id="tutorCoreOnly" ${tutorCoreOnly ? 'checked' : ''}> 只看必拿分</label>`].join('');
    const info = $('#tutorTypeInfo');
    const t = types[tutorType];
    if (!info) return;
    info.hidden = !t;
    if (t) {
      const teacher = window.EJU_SYNC?.isTeacher?.();
      info.innerHTML = `<h4>${t.label}：解题套路</h4><ol>${t.method.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ol>
        <h4>常见错误</h4><ul>${t.mistakes.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
        <p class="tutor-type-teach"><b>讲课提示：</b>${escapeHtml(t.teach)}</p>
        ${teacher ? '<button type="button" class="btn btn-sm btn-primary" id="tutorAssignTypeBtn">把这类必拿分题布置给对方（3 道）</button>' : ''}`;
    }
  }

  function setTutorFilter(type, coreOnly) {
    tutorType = type;
    tutorCoreOnly = coreOnly;
    tutorCardIdx = 0;
    initTutorUnifiedNav();
    renderTutorTypeBar();
    renderTutorCard();
    notifyTutorChanged();
  }

  function initTutorUnifiedNav() {
    tutorCardsList = mathTutorPool();
    const sel = $('#tutorUnifiedSelect');
    if (!sel) return;
    sel.innerHTML = '';
    tutorCardsList.forEach((c, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = formatMathCardLabel(c, idx);
      sel.appendChild(opt);
    });
  }

  // What is open on the tutor card. Shared with the partner during a lesson (sync.js), so it is plain data.
  // expl = number of explanation steps shown (0 = closed)
  let tutorReveal = {hint: false, expl: 0, ans: false};
  let tutorBoardId = null; // null = this question's own board, else a blank page id
  let applyingRemoteTutor = false;

  function notifyTutorChanged() {
    if (!applyingRemoteTutor) window.dispatchEvent(new CustomEvent('eju-tutor-changed'));
  }

  // Split the explanation into steps: a new step starts at each 【…】 heading or after a blank line
  function chunkExplSteps(box) {
    const chunks = [];
    let cur = null;
    for (const el of [...box.children]) {
      if (el.classList.contains('ms-gap')) {
        // A blank line ends the current step (unless it only holds its heading so far)
        if (cur && [...cur.children].some(c => !c.classList.contains('ms-head'))) cur = null;
        continue;
      }
      if (!cur || el.classList.contains('ms-head')) {
        cur = document.createElement('div');
        cur.className = 'ms-step';
        chunks.push(cur);
      }
      cur.appendChild(el);
    }
    box.innerHTML = '';
    chunks.forEach(c => box.appendChild(c));
    return chunks.length;
  }

  function applyTutorReveal() {
    const hintBox = $('#tutorStepHint');
    const explBox = $('#tutorStepExpl');
    const ansBox = $('#tutorStepAns');
    const steps = [...explBox.querySelectorAll('.ms-step')];
    const shown = Math.min(tutorReveal.expl, steps.length);
    hintBox.hidden = !tutorReveal.hint;
    explBox.hidden = shown === 0;
    ansBox.hidden = !tutorReveal.ans;
    steps.forEach((el, i) => { el.hidden = i >= shown; });
    $$('.step-reveal-btn').forEach(b => {
      const k = b.dataset.step;
      b.classList.toggle('is-open', k === 'expl' ? shown > 0 : Boolean(tutorReveal[k]));
    });
    const nextBtn = $('#tutorNextStepBtn');
    if (nextBtn) {
      nextBtn.textContent = shown >= steps.length ? `步骤已全部展开（${steps.length}）` : `下一步 ${shown + 1}/${steps.length}`;
      nextBtn.disabled = shown >= steps.length;
    }
    setTutorBlanksRevealed(tutorReveal.ans);
    renderMathIn($('#view-math'));
  }

  // ─── Whiteboard pages: each question has its own board; blank pages are extra boards ───
  function boardPages() {
    return Object.entries(state.boardPages || {})
      .filter(([, p]) => p && !p.deleted)
      .sort((a, b) => a[1].at - b[1].at)
      .map(([id, p]) => ({id, ...p}));
  }

  function renderBoardPageSelect() {
    const sel = $('#wbPageSelect');
    if (!sel) return;
    const pages = boardPages();
    sel.innerHTML = '<option value="">本题白板</option>'
      + pages.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.title)}</option>`).join('')
      + '<option value="__new">＋ 新建空白页</option>';
    sel.value = tutorBoardId && pages.some(p => p.id === tutorBoardId) ? tutorBoardId : '';
  }

  function openBoardPage(id) {
    const card = tutorCardsList[tutorCardIdx];
    tutorBoardId = id || null;
    window.EJU_WHITEBOARD?.setCardId(tutorBoardId || card?.id);
    renderBoardPageSelect();
  }

  function newBoardPage() {
    const id = `page-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    state.boardPages = state.boardPages || {};
    state.boardPages[id] = {title: `空白页 ${boardPages().length + 1}`, at: Date.now()};
    saveState();
    openBoardPage(id);
  }

  function renderTutorCard() {
    if (!tutorCardsList.length) tutorCardsList = mathTutorPool();
    if (tutorCardIdx >= tutorCardsList.length) tutorCardIdx = 0;
    if (tutorCardIdx < 0) tutorCardIdx = tutorCardsList.length - 1;

    const card = tutorCardsList[tutorCardIdx];
    if (!card) return;

    // Update single unified navigation
    const sel = $('#tutorUnifiedSelect');
    if (sel && sel.options.length) sel.value = String(tutorCardIdx);

    const m = (card.source || '').match(/(\d{4})[^\d]*?(?:問|第)(\d+)\s*(\([^\)]+\))?/);
    const navYearQ = m ? `${m[1]} · 第${m[2]}問${m[3] || ''}` : '真题';
    const indicator = $('#tutorUnifiedIndicator');
    if (indicator) indicator.textContent = `${navYearQ} · ${tutorCardIdx + 1}/${tutorCardsList.length}`;

    $('#tutorCardTopic').textContent = card.topic;
    applySourceTagAndBanner(card, $('#tutorCardSource'), $('#tutorAuditBanner'));

    const mastered = isMastered(card);
    const wrong = isWrong(card);
    const statusEl = $('#tutorCardStatus');
    statusEl.textContent = mastered ? '已掌握' : wrong ? '错题待攻克' : '未掌握';
    statusEl.className = `tag ${mastered ? '' : 'tag-subtle'}`;

    const bmBtn = $('#tutorBookmarkBtn');
    bmBtn.textContent = isBookmarked(card) ? '已在待讲 ✓' : '加入待讲';

    applyStudyLang(card, {questionEl: $('#tutorQuestionText'), subEl: $('#tutorQuestionSub'), revealBtn: $('#tutorCnRevealBtn')});
    setLangButton($('#tutorLangToggleBtn'));

    // Choices / Mark blanks box
    const choicesBox = $('#tutorChoicesBox');
    choicesBox.innerHTML = '';
    if (card.type === 'mark' && Array.isArray(card.blanks)) {
      const blanksWrap = document.createElement('div');
      blanksWrap.className = 'tutor-mark-blanks-preview';
      blanksWrap.innerHTML = `
        <div class="mark-tip-bar" style="margin-bottom:8px">答题栏（点「答案」显示正解）</div>
        <div class="mark-slots-wrap" style="margin-bottom:8px">
          ${card.blanks.map(b => `
            <div class="mark-slot-box" style="padding:6px 10px">
              <div class="mark-slot-label">${b.label}</div>
              <div class="mark-slot-inputs">
                ${Array.from({length: b.len || (b.ans ? String(b.ans).length : 1)}).map((_, i) => `<span class="mark-cell-input tutor-mark-slot-cell" data-ans="${(b.ans && String(b.ans)[i]) || '?'}" style="width:32px;height:36px;font-size:16px"></span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      choicesBox.appendChild(blanksWrap);
    } else if (card.type === 'mcq' && Array.isArray(card.choices)) {
      card.choices.forEach((ch, idx) => {
        const div = document.createElement('div');
        div.className = 'tutor-choice-item';
        div.textContent = `(${idx + 1}) ${ch}`;
        div.addEventListener('click', () => {
          div.classList.toggle('is-correct', idx === card.a);
        });
        choicesBox.appendChild(div);
      });
    }

    // Original paper scan & official answer key
    const paperInline = $('#tutorPaperInline');
    const scanWrap = $('#tutorScanWrap');
    scanWrap.hidden = true;
    if (card.paperImg) {
      paperInline.hidden = false;
      $('#tutorShowAnsKeyBtn').hidden = !card.ansImg;
    } else {
      paperInline.hidden = true;
    }

    // Step-by-step boxes
    const hintBox = $('#tutorStepHint');
    const explBox = $('#tutorStepExpl');
    const ansBox = $('#tutorStepAns');

    hintBox.innerHTML = `<div class="ms-head">破题公式</div>${formatMathInlineHtml(getCardHint(card))}`;
    explBox.innerHTML = formatMathStepsHtml(card.expl || '按基本公式代入即可。');
    chunkExplSteps(explBox);
    const ansStr = card.type === 'mark'
      ? `マーク式正解：${card.ansSummary || (card.blanks || []).map(b => `${b.label}=${b.ans}`).join(', ')}`
      : card.type === 'mcq'
      ? `选项 (${card.a + 1})：${card.choices[card.a]}`
      : card.back;
    ansBox.innerHTML = `<div class="ms-head">最终答案</div><div class="ms-line">${escapeHtml(ansStr)}</div>`
      + (card.trap ? `<div class="ms-gap"></div><div class="ms-head">易错提醒</div>${formatMathInlineHtml(card.trap)}` : '');

    renderMathIn($('#view-math'));

    // Automatically select the math tool matching this question's unit
    window.EJU_MATH_TOOLS?.autoSelect(card);

    tutorReveal = {hint: false, expl: 0, ans: false};
    applyTutorReveal();

    // Automatically load/restore handwritten whiteboard notes for this specific card
    tutorBoardId = null;
    window.EJU_WHITEBOARD?.setCardId(card.id);
    renderBoardPageSelect();
    $('#wbPastePaperBtn') && ($('#wbPastePaperBtn').hidden = !card.paperImg);
    notifyTutorChanged();
  }

  function openMathTutorWithCard(cardId) {
    setPeriodMode('math');
    switchRoute('math');
    tutorCardsList = mathTutorPool();
    if (!tutorCardsList.some(c => c.id === cardId)) { tutorType = ''; tutorCoreOnly = false; tutorCardsList = mathTutorPool(); renderTutorTypeBar(); initTutorUnifiedNav(); }
    const idx = tutorCardsList.findIndex(c => c.id === cardId);
    if (idx >= 0) tutorCardIdx = idx;
    renderTutorCard();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 阶段 1：答案和题目的正确性核验报告 (#view-audit)
  // ═════════════════════════════════════════════════════════════════════════
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderStage1AuditView() {
    const audit = window.EJU_STAGE1_AUDIT;
    if (!audit) return;

    const s = audit.summary;
    const strip = $('#auditSummaryStrip');
    if (strip) {
      strip.innerHTML = `
        <div class="stat-item">
          <div class="stat-label">题库当前总题数</div>
          <div class="stat-val-row"><strong class="stat-val">${cards.length}</strong><span class="stat-sub">数学 ${s.mathTotal} + 文综 ${s.unverifiedBunsoCount}</span></div>
          <div class="stat-hint">已彻底删除自编题 ${s.deletedSelfInvented} 道</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已核实一致（计入掌握率）</div>
          <div class="stat-val-row"><strong class="stat-val stat-val-ok">${s.verifiedConsistentCount}</strong><span class="stat-sub">真题 ${s.mathRealCount} + 改编 ${s.mathAdaptedCount}</span></div>
          <div class="stat-hint">原卷正解表逐空核对 + tools/verify_math.py 重算</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">不一致 · 待裁定</div>
          <div class="stat-val-row"><strong class="stat-val stat-val-danger">${s.discrepancyCount}</strong><span class="stat-sub">已全部按原卷修正</span></div>
          <div class="stat-hint">数学题已按原卷重新转写</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">未核实（不计入掌握率）</div>
          <div class="stat-val-row"><strong class="stat-val">${s.unverifiedBunsoCount}</strong><span class="stat-sub">文综総合科目</span></div>
          <div class="stat-hint">无官方真题PDF对照，标“未核实”</div>
        </div>
      `;
    }

    renderAuditComparisonTable();
    renderAuditSideBySide();
    renderAuditUnverifiedAndDeleted();
  }

  function renderAuditComparisonTable() {
    const audit = window.EJU_STAGE1_AUDIT;
    const tbody = $('#auditTableBody');
    if (!audit || !tbody) return;

    const rows = audit.mathAuditTable.filter(r => {
      if (auditTableFilter === 'discrepancy') return r.status === '不一致';
      if (auditTableFilter === 'verified') return r.status === '一致';
      return true;
    });

    tbody.innerHTML = rows.map(r => {
      const isBad = r.status === '不一致';
      const srcText = r.source || r.exam_ref || '';
      const keyText = r.key_ans || r.official_key || '';
      const sympyText = r.sympy_ans || r.sympy_calc || '';
      return `
        <tr class="${isBad ? 'audit-row-bad' : 'audit-row-ok'}">
          <td>
            <div class="audit-id-cell"><code>${escapeHtml(r.id)}</code></div>
            <button class="text-btn audit-jump-btn" data-jump-card="${escapeHtml(r.id)}" type="button">去讲题台查看 &rarr;</button>
          </td>
          <td><span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${escapeHtml(srcText)}</span></td>
          <td>${escapeHtml(r.bank_ans)}</td>
          <td>${escapeHtml(keyText)}</td>
          <td>${escapeHtml(sympyText)}</td>
          <td>
            <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${isBad ? '不一致 · 待裁定' : '一致 ✓'}</span>
          </td>
          <td class="audit-note-cell">${escapeHtml(r.note)}</td>
        </tr>
      `;
    }).join('');

    $$('#auditTableBody [data-jump-card]').forEach(btn => {
      btn.addEventListener('click', () => openMathTutorWithCard(btn.dataset.jumpCard));
    });
  }

  function renderAuditSideBySide() {
    const audit = window.EJU_STAGE1_AUDIT;
    const container = $('#auditSbsList');
    if (!audit || !container) return;

    const map = new Map(audit.mathAuditTable.map(r => [r.id, r]));
    let targetIds = audit.sample20Ids || [];
    if (auditSbsFilter === 'discrepancy') {
      targetIds = audit.mathAuditTable.filter(r => r.status === '不一致').map(r => r.id);
    }

    container.innerHTML = targetIds.map((id, idx) => {
      const r = map.get(id);
      if (!r) return '';
      const isBad = r.status === '不一致';
      const srcText = r.source || r.exam_ref || '';
      const keyText = r.key_ans || r.official_key || '';
      const sympyText = r.sympy_ans || r.sympy_calc || '';
      const choicesHtml = (r.choices || []).map((ch, cIdx) => `
        <div class="sbs-choice ${cIdx === r.a ? 'is-bank-ans' : ''}">
          <span class="sbs-choice-num">(${cIdx + 1})</span>
          <span>${escapeHtml(ch)}</span>
          ${cIdx === r.a ? '<span class="tag tag-subtle" style="margin-left:auto">当前题库设定答案</span>' : ''}
        </div>
      `).join('');

      return `
        <div class="sbs-card ${isBad ? 'is-discrepancy' : ''}">
          <div class="sbs-card-head">
            <div>
              <strong>#${idx + 1} · <code>${escapeHtml(r.id)}</code> · ${escapeHtml(r.topic)}</strong>
              <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}" style="margin-left:8px">${escapeHtml(srcText)}</span>
            </div>
            <span class="tag ${isBad ? 'tag-source-warn' : 'tag-source-ok'}">${isBad ? '题面/正解表/题库 不一致（待您裁定）' : '原卷与网页题面 核对一致 ✓'}</span>
          </div>

          <div class="sbs-grid">
            <!-- 左栏：原卷截图 + 官方正解表切换 -->
            <div class="sbs-col sbs-col-scan">
              <div class="sbs-col-bar">
                <span>原卷扫描图 (<code>${escapeHtml(r.paperImg)}</code>)</span>
                ${r.ansImg ? `<button class="btn btn-xs sbs-toggle-ans-btn" data-qimg="${escapeHtml(r.paperImg)}" data-aimg="${escapeHtml(r.ansImg)}" type="button">切换查看官方正解表</button>` : ''}
              </div>
              <div class="sbs-img-box">
                <img src="${escapeHtml(r.paperImg)}" alt="${escapeHtml(r.id)} 原卷截图" loading="lazy">
              </div>
            </div>

            <!-- 右栏：网页当前题面 + 选项 + SymPy & 正解表比对结论 -->
            <div class="sbs-col sbs-col-web">
              <div class="sbs-col-bar">
                <span>网页当前题面 &amp; 选项（未擅自修改）</span>
                <button class="text-btn" data-sbs-jump="${escapeHtml(r.id)}" type="button">在讲题台打开</button>
              </div>
              <div class="sbs-web-body">
                <div class="sbs-q-text">${escapeHtml(r.q)}</div>
                <div class="sbs-choices-wrap">${choicesHtml}</div>
                <div class="sbs-audit-box ${isBad ? 'is-bad' : 'is-ok'}">
                  <div><b>官方正解表：</b>${escapeHtml(keyText)}</div>
                  <div><b>SymPy 独立验算：</b>${escapeHtml(sympyText)}</div>
                  <div><b>核对结论：</b>${escapeHtml(r.note)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    $$('#auditSbsList .sbs-toggle-ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const img = btn.closest('.sbs-col-scan')?.querySelector('img');
        if (!img) return;
        const showingAns = btn.dataset.showingAns === '1';
        if (showingAns) {
          img.src = btn.dataset.qimg;
          btn.dataset.showingAns = '0';
          btn.textContent = '切换查看官方正解表';
        } else {
          img.src = btn.dataset.aimg;
          btn.dataset.showingAns = '1';
          btn.textContent = '切回原卷题目页';
        }
      });
    });

    $$('#auditSbsList [data-sbs-jump]').forEach(btn => {
      btn.addEventListener('click', () => openMathTutorWithCard(btn.dataset.sbsJump));
    });
  }

  function renderAuditUnverifiedAndDeleted() {
    const audit = window.EJU_STAGE1_AUDIT;
    const container = $('#auditUnverifiedContent');
    if (!audit || !container) return;

    const unverifiedCards = cards.filter(isUnverified);
    const byDeck = {};
    for (const c of unverifiedCards) {
      byDeck[c.deck] = byDeck[c.deck] || [];
      byDeck[c.deck].push(c);
    }

    const deletedHtml = (audit.summary.deletedBreakdown || []).map(d => `
      <div class="audit-stat-row">
        <span><code>${escapeHtml(d.file)}</code> — ${escapeHtml(d.desc)}</span>
        <span class="tag tag-source-warn">已删除 ${d.count} 题</span>
      </div>
    `).join('');

    const deckGroupsHtml = Object.entries(byDeck).map(([deck, list]) => `
      <details class="kp-details">
        <summary class="kp-summary">
          <div class="kp-summary-left">
            <span class="tag">${escapeHtml(deck)}</span>
            <span class="kp-title">未核实题目共 ${list.length} 道</span>
            <span class="kp-desc">均已标记 source: "未核实"，界面显示标签且不计入掌握率</span>
          </div>
        </summary>
        <div class="kp-body">
          <div class="unverified-mini-list">
            ${list.map(c => `<div class="unverified-mini-row"><code>${escapeHtml(c.id)}</code> <span class="tag tag-source-unverified">未核实</span> <span>${escapeHtml(c.q)}</span></div>`).join('')}
          </div>
        </div>
      </details>
    `).join('');

    container.innerHTML = `
      <div class="audit-panel-block">
        <h3 class="section-title">一、已彻底删除的自编题与自编选项清单（共 ${audit.summary.deletedSelfInvented} 题）</h3>
        <p class="section-sub">严格按阶段 1 第 5 条要求，删除所有自编数学题、自编公式卡与自编文综扩展题（2025–2026 时事题已经网络报道核对后恢复，标“未核实”）；保留的 6 道数学变形题均已标明“改编自 20XX第X回 問X”。</p>
        <div class="audit-deleted-box">${deletedHtml}</div>
      </div>

      <div class="audit-panel-block" style="margin-top:18px">
        <h3 class="section-title">二、未核实题目清单（共 ${unverifiedCards.length} 题 · 全部为文综総合科目）</h3>
        <p class="section-sub">说明：<code>eju真题.zip</code> 压缩包内 83 个文件全部为 2002–2025 数学コース1 真题与正解表，不含文综（総合科目）官方原卷与正解表。因此现有 ${unverifiedCards.length} 道文综题全部标记为 <code>source: "未核实"</code>，在界面显式标注“未核实 · 不计入掌握率”。</p>
        <div class="knowledge-accordion">${deckGroupsHtml}</div>
      </div>
    `;
  }

  // ─── Route & Period Mode Switching ───
  function setPeriodMode(mode) {
    periodMode = mode;
    $('#modeBunsoBtn')?.classList.toggle('is-active', mode === 'bunso');
    $('#modeMathBtn')?.classList.toggle('is-active', mode === 'math');
    renderDeckProgressGrid();
    renderKnowledgeAccordion();
  }

  function switchRoute(route) {
    currentRoute = route;
    $$('.nav-tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.route === route));
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${route}`));

    renderTopBarAndDashboard();
    if (route === 'today') {
      renderDeckProgressGrid();
      renderKnowledgeAccordion();
      window.EJU_LADDER_HOOK?.today?.();
    } else if (route === 'math') {
      setPeriodMode('math');
      renderTutorCard();
      setTimeout(() => {
        window.EJU_WHITEBOARD?.resize();
        renderMathIn($('#view-math'));
      }, 40);
    } else if (route === 'wrong') {
      renderWrongBook();
    } else if (route === 'plan') {
      renderLinkedPlan();
    } else if (route === 'homework') {
      window.EJU_HW?.render();
    } else if (route === 'mock') {
      window.EJU_MOCK?.render();
    } else if (route === 'mockb') {
      window.EJU_MOCKB?.render();
    } else if (route === 'audit') {
      renderStage1AuditView();
      renderMathIn($('#view-audit'));
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  // ─── ATRI 督促上报：把今天的刷题数报给 eju-watch 的 /api/report（ATRI 只读这里） ───
  // Contract of the eju-watch service: POST JSON with the 同步码 in `token`; 403 on a wrong code.
  // Dates are Tokyo dates because ATRI checks days[<Tokyo today>].done against 40.
  const ATRI_TOKEN_KEY = 'eju-sync-token';
  const ATRI_STATUS_KEY = 'eju-atri-status';
  const tokyoDateKey = ms => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Tokyo'}).format(new Date(ms));
  let atriTimer = null;

  function getAtriToken() {
    try { return localStorage.getItem(ATRI_TOKEN_KEY) || ''; } catch (_) { return ''; }
  }

  // Questions ATRI can send over QQ and grade: plain 4-choice text MCQs with no figure/passage/paper image, no math decks
  const QUIZ_BLOCKED_Q = /下線部|次の図|次の表|次のグラフ|次の地図|地図中|図中|表中|グラフ中|上の|下の図|右の|左の|写真|資料/;
  function isQuizable(card) {
    if (!card || card.type !== 'mcq' || !Array.isArray(card.choices) || card.choices.length !== 4) return false;
    if (card.deck === '数Ⅰ·A' || card.deck === '公式') return false;
    if (card.hasFigure || card.paperImg || (card.passage && String(card.passage).trim())) return false;
    if (card.choices.some(c => /^\s*[①-⑳]\s*$/.test(String(c)))) return false;
    return !QUIZ_BLOCKED_Q.test(card.q || '');
  }

  function buildAtriReport() {
    const today = tokyoDateKey(Date.now());
    const myName = window.EJU_SYNC?.myName?.();
    // Only my own answers count: in a study group the shared history also holds the partner's
    const mine = state.history.filter(h => (!h.by || h.by === myName) && tokyoDateKey(h.at || Date.parse(h.date)) === today);
    const wrongByDeck = {};
    let correct = 0;
    let fuzzy = 0;
    let wrong = 0;
    for (const h of mine) {
      if (h.grade === 'again') {
        wrong++;
        const deck = cards.find(c => c.id === h.id)?.deck;
        if (deck) wrongByDeck[deck] = (wrongByDeck[deck] || 0) + 1;
      } else if (h.grade === 'hard') {
        fuzzy++;
      } else {
        correct++;
      }
    }
    // Newest strict misses first, one entry per card, for ATRI's bedtime / morning recall quiz
    const wrongItems = [];
    const seen = new Set();
    for (const h of [...mine].sort((x, y) => (y.at || 0) - (x.at || 0))) {
      if (wrongItems.length >= 6) break;
      if (h.grade !== 'again' || seen.has(h.id)) continue;
      seen.add(h.id);
      const card = cards.find(c => c.id === h.id);
      if (!isQuizable(card)) continue;
      wrongItems.push({id: card.id, deck: card.deck, q: String(card.q).replace(/\s+/g, ' ').trim().slice(0, 90)});
    }
    const weakDeck = Object.entries(wrongByDeck).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    return {
      date: today,
      target: DAILY_TARGET,
      done: mine.length,
      correct,
      fuzzy,
      wrong,
      due: cards.filter(isDue).length,
      fresh: cards.filter(c => !getProgress(c).reps).length,
      solid: cards.filter(c => (getProgress(c).box || 0) >= 3).length,
      total: cards.length,
      weakDeck: weakDeck.slice(0, 20),
      wrongItems,
    };
  }

  function setAtriStatus(text) {
    try { localStorage.setItem(ATRI_STATUS_KEY, text); } catch (_) {}
    const el = $('#atriStatusText');
    if (el) el.textContent = text;
  }

  async function sendAtriReport({keepalive = false} = {}) {
    clearTimeout(atriTimer);
    const token = getAtriToken();
    if (!token) return;
    const report = buildAtriReport();
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, ...report}),
        keepalive,
      });
      const time = new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
      if (res.ok) setAtriStatus(`ATRI 已收到：今天 ${report.done} / ${report.target}（${time}）`);
      else if (res.status === 403) setAtriStatus('ATRI 同步码不对，请重新填写。');
      else setAtriStatus(`上报失败（HTTP ${res.status}），下次答题时再试。`);
    } catch (_) {
      setAtriStatus('网络不通，下次答题时再上报。');
    }
  }

  // Same rhythm as the old frontend: 2.5 s after the last answer, coalescing a burst of answers
  function scheduleAtriReport() {
    clearTimeout(atriTimer);
    atriTimer = setTimeout(() => sendAtriReport(), 2500);
  }

  // Old links like https://eju.utautai.org/#sync=<同步码> still set the code
  function adoptAtriTokenFromHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const code = params.get('sync');
    if (!code) return;
    try { localStorage.setItem(ATRI_TOKEN_KEY, code); } catch (_) {}
    params.delete('sync');
    const rest = params.toString();
    history.replaceState(null, '', location.pathname + location.search + (rest ? `#${rest}` : ''));
  }

  // ─── Bridge for sync.js (study-group sync): read state, apply remote changes, refresh views ───
  window.EJU_APP = {
    getState: () => state,
    saveState,
    recordCardGrade,
    recordLangHelp,
    getLangMode: () => langMode,
    switchRoute,
    renderMath: renderMathIn,
    today: () => localDateKey(),
    // Apply a remote change without re-announcing it as a local edit
    applyRemote(mutate) {
      mutate(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      renderTopBarAndDashboard();
      if (currentRoute === 'today') renderDeckProgressGrid();
      else if (currentRoute === 'wrong') renderWrongBook();
      else if (currentRoute === 'plan') renderLinkedPlan();
    },
    currentRoute: () => currentRoute,
    currentTutorCardId: () => (currentRoute === 'math' ? tutorCardsList[tutorCardIdx]?.id || null : null),
    openTutorCard: id => openMathTutorWithCard(id),
    // Lesson mode (sync.js): what the explainer has open, and applying it on the listener's side
    getTutorState() {
      const card = tutorCardsList[tutorCardIdx];
      if (currentRoute !== 'math' || !card) return null;
      return {cardId: card.id, boardId: tutorBoardId, reveal: {...tutorReveal}};
    },
    applyTutorState(st) {
      if (!st?.cardId) return;
      applyingRemoteTutor = true;
      try {
        if (currentRoute !== 'math' || tutorCardsList[tutorCardIdx]?.id !== st.cardId) openMathTutorWithCard(st.cardId);
        if (st.reveal) {
          tutorReveal = {hint: Boolean(st.reveal.hint), expl: Number(st.reveal.expl) || 0, ans: Boolean(st.reveal.ans)};
          applyTutorReveal();
        }
        if ((st.boardId || null) !== tutorBoardId) {
          if (st.boardId && !state.boardPages?.[st.boardId]) {
            state.boardPages = state.boardPages || {};
            state.boardPages[st.boardId] = {title: st.boardTitle || '空白页', at: Date.now()};
          }
          openBoardPage(st.boardId);
        }
      } finally {
        applyingRemoteTutor = false;
      }
    },
    boardTitle: id => state.boardPages?.[id]?.title || null,
    saveState,
    renderMath: renderMathIn,
    // Homework: open an item's work board (with its math question on the left when there is one)
    openBoard(boardId, cardId) {
      if (cardId) openMathTutorWithCard(cardId);
      else if (currentRoute !== 'math') switchRoute('math');
      openBoardPage(boardId);
      notifyTutorChanged();
    },
    addToWrongBook(card, note) {
      recordCardGrade(card, 'again');
      state.hwNotes = state.hwNotes || {};
      state.hwNotes[card.id] = {...note, at: Date.now()};
    },
    refreshBoardPages: renderBoardPageSelect,
  };

  // ─── Event Listeners & Initialization ───
  function bindEvents() {
    // Period switcher
    $('#modeBunsoBtn').addEventListener('click', () => {
      setPeriodMode('bunso');
      switchRoute('today');
    });
    $('#modeMathBtn').addEventListener('click', () => {
      setPeriodMode('math');
      switchRoute('math');
    });

    // Main nav tabs
    $$('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => switchRoute(tab.dataset.route));
    });

    // Top dashboard clickable boxes
    $('#statDueBox').addEventListener('click', () => {
      const duePool = cards.filter(isDue);
      if (duePool.length) startCustomPoolSession(duePool, '到期复习', 25);
      else startCustomPoolSession(getFilteredPoolBySelectedDeck(), '智能刷题', 20, {mixReal: true});
    });
    $('#statWrongBox').addEventListener('click', () => switchRoute('wrong'));
    $('#statMasteryBox').addEventListener('click', () => switchRoute('plan'));

    // Practice console buttons
    // Hero: continue an unfinished round, otherwise today's mix (due → wrong → unmastered) from all subjects
    $('#heroStartTaskBtn').addEventListener('click', () => {
      if (!$('#resumeSessionBtn').hidden) $('#resumeSessionBtn').click();
      else startCustomPoolSession(getFilteredPoolBySelectedDeck(), '今日任务', 20, {mixReal: true});
    });
    $('#heroWrongBox').addEventListener('click', () => switchRoute('wrong'));

    $('#startSmartBtn').addEventListener('click', () => {
      startCustomPoolSession(getFilteredPoolBySelectedDeck(), selectedDeck, 20, {mixReal: true});
    });
    $('#startUnmasteredBtn').addEventListener('click', () => {
      const pool = getFilteredPoolBySelectedDeck().filter(c => !isMastered(c));
      startCustomPoolSession(pool.length ? pool : getFilteredPoolBySelectedDeck(), `${selectedDeck}·未掌握`, 20, {mixReal: true});
    });
    $('#startVariantBtn').addEventListener('click', () => {
      const pool = getFilteredPoolBySelectedDeck().filter(isVariantCard);
      startCustomPoolSession(pool.length ? pool : cards.filter(isVariantCard), '变形题特训', 20);
    });
    $('#resumeSessionBtn').addEventListener('click', () => {
      if (!state.activeSession) return;
      const map = new Map(cards.map(c => [c.id, c]));
      queue = state.activeSession.ids.map(id => map.get(id)).filter(Boolean);
      sessionIndex = state.activeSession.index || 0;
      if (queue.length) {
        switchRoute('study');
        renderStudyCard();
      }
    });

    // Search & Knowledge category tabs
    $('#globalSearchInput').addEventListener('input', renderKnowledgeAccordion);
    $('#clearSearchBtn').addEventListener('click', () => {
      $('#globalSearchInput').value = '';
      renderKnowledgeAccordion();
    });
    $$('#knowledgeCatTabs .cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentKnowledgeCat = btn.dataset.cat;
        $$('#knowledgeCatTabs .cat-tab').forEach(b => b.classList.toggle('is-active', b === btn));
        renderKnowledgeAccordion();
      });
    });

    // Study view controls
    $('#exitStudyBtn').addEventListener('click', () => switchRoute('today'));
    $('#studyGeoBtn').addEventListener('click', () => {
      const box = $('#studyGeoBox');
      box.hidden = !box.hidden;
    });
    $('#studyHintBtn').addEventListener('click', () => {
      if (!answered) hintUsed = true;
      const box = $('#studyHintBox');
      box.hidden = !box.hidden;
      renderMathIn(box);
    });
    $('#studyPaperImg').addEventListener('click', () => $('#studyPaperBox').classList.toggle('is-zoom'));
    $('#studyPaperBtn').addEventListener('click', () => {
      const box = $('#studyPaperBox');
      box.hidden = !box.hidden;
    });
    $('#studyBookmarkMathBtn').addEventListener('click', () => {
      if (!activeCard) return;
      state.bookmarks[activeCard.id] = !state.bookmarks[activeCard.id];
      saveState();
      $('#studyBookmarkMathBtn').textContent = isBookmarked(activeCard) ? '已留着讲' : '留着讲';
      renderTopBarAndDashboard();
    });
    $('#studyRefBtn').addEventListener('click', () => {
      if (!activeCard) return;
      if (!answered) hintUsed = true;
      const kpList = window.EJU_KNOWLEDGE || [];
      const match = findMatchedKp(activeCard);
      if (!match) return;
      $('#refModalTitle').textContent = match.title;
      $('#refModalBody').innerHTML = match.html;
      $('#refModal').hidden = false;
      renderMathIn($('#refModalBody'));
    });
    $('#closeRefModalBtn').addEventListener('click', () => { $('#refModal').hidden = true; });
    $('#studyRevealFlipBtn').addEventListener('click', handleRevealFlip);
    $('#studyLangToggleBtn')?.addEventListener('click', () => {
      cycleLangMode();
      setLangButton($('#studyLangToggleBtn'));
      if (!activeCard) return;
      // Re-rendering resets an answered card, so only redraw the text once the answer is in
      if (answered) applyStudyLang(activeCard, studyLangEls());
      else renderStudyCard();
    });
    $('#studyCnRevealBtn')?.addEventListener('click', () => revealStudyChinese(true));
    $('#tutorCnRevealBtn')?.addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      revealedCn.add(card.id);
      recordLangHelp(card);
      applyStudyLang(card, {questionEl: $('#tutorQuestionText'), subEl: $('#tutorQuestionSub'), revealBtn: $('#tutorCnRevealBtn')});
    });
    $('#studyUnsureBtn')?.addEventListener('click', handleAnswerUnsure);

    // Math Marksheet controls
    $('#studyMarkClearBtn')?.addEventListener('click', () => {
      if (answered) return;
      markValues = new Array(markCells.length).fill('');
      markCells.forEach((_, i) => {
        const el = document.getElementById(`markCell_${i}`);
        if (el) el.textContent = '';
      });
      setActiveMarkCell(0);
    });
    $('#studyMarkSubmitBtn')?.addEventListener('click', handleMarkSubmit);
    $$('#studyMarkKeypad [data-key]').forEach(btn => {
      btn.addEventListener('click', () => inputMarkChar(btn.dataset.key));
    });
    $$('#studyMarkKeypad [data-act="del"]').forEach(btn => {
      btn.addEventListener('click', () => inputMarkChar('del'));
    });

    $$('#rateButtonsGroup [data-rate]').forEach(btn => {
      btn.addEventListener('click', () => advanceStudyCard(btn.dataset.rate));
    });
    $('#autoNextBtn')?.addEventListener('click', () => advanceStudyCard(autoOrGood()));
    document.addEventListener('visibilitychange', () => { if (document.hidden) leftPageDuringCard = true; });
    $('#studyNextVariantBtn').addEventListener('click', () => {
      if (!activeCard) return;
      const sameTopic = cards.filter(c => c.id !== activeCard.id && (c.topic === activeCard.topic || c.deck === activeCard.deck));
      const nextVar = prioritizeCards(sameTopic, 1)[0];
      if (nextVar) {
        queue.splice(sessionIndex + 1, 0, nextVar);
      }
      advanceStudyCard(autoOrGood());
    });

    // Keyboard shortcuts in Study View
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $('#refModal').hidden = true;
        $('#syncModal').hidden = true;
      }
      if (currentRoute !== 'study' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (!answered) {
        if (activeCard?.type === 'mark') {
          if (/^[0-9\-]$/.test(e.key)) {
            e.preventDefault();
            inputMarkChar(e.key);
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            inputMarkChar('del');
          } else if (e.key === 'Enter') {
            e.preventDefault();
            handleMarkSubmit();
          }
        } else if (activeCard?.type === 'mcq' && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          const btns = $$('#studyChoices .choice-btn');
          if (btns[idx]) {
            e.preventDefault();
            handleAnswerMcq(idx, btns[idx]);
          }
        } else if (activeCard?.type === 'flip' && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          handleRevealFlip();
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter' || e.key === '3') {
          e.preventDefault();
          advanceStudyCard(e.key === '3' ? 'good' : autoOrGood());
        } else if (e.key === '1') {
          e.preventDefault();
          advanceStudyCard('again');
        } else if (e.key === '2') {
          e.preventDefault();
          advanceStudyCard('hard');
        }
      }
    });

    // Stage 3 Math Tutoring Station controls (Unified Nav & Whiteboard Bridge)
    initTutorUnifiedNav();

    renderTutorTypeBar();
    $('#tutorTypeBar')?.addEventListener('click', e => {
      const b = e.target.closest('[data-mtype]');
      if (b) setTutorFilter(b.dataset.mtype, tutorCoreOnly);
    });
    $('#tutorTypeBar')?.addEventListener('change', e => {
      if (e.target.id === 'tutorCoreOnly') setTutorFilter(tutorType, e.target.checked);
    });
    $('#tutorTypeInfo')?.addEventListener('click', e => {
      if (!e.target.closest('#tutorAssignTypeBtn')) return;
      const ids = cards.filter(c => c.mtype === tutorType && c.level === 'core').slice(0, 3).map(c => c.id);
      if (!ids.length) return;
      window.EJU_HW?.quickAssign(ids, `${window.EJU_MATH_TYPES[tutorType].label} 必拿分 ${ids.length} 题`);
    });
    $('#tutorUnifiedSelect')?.addEventListener('change', e => {
      tutorCardIdx = Number(e.target.value) || 0;
      renderTutorCard();
    });
    $('#tutorPrevBtn')?.addEventListener('click', () => {
      tutorCardIdx -= 1;
      renderTutorCard();
    });
    $('#tutorNextBtn')?.addEventListener('click', () => {
      tutorCardIdx += 1;
      renderTutorCard();
    });

    // Bilingual toggle in tutor view
    $('#tutorLangToggleBtn')?.addEventListener('click', () => {
      cycleLangMode();
      renderTutorCard();
    });

    // Paste question to whiteboard
    $('#tutorPasteQuestionBtn')?.addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      const qText = langMode === 'cn' && card.q_cn ? card.q_cn : card.q;
      if (window.EJU_WHITEBOARD) {
        // Switch to Whiteboard tab
        const boardTab = document.querySelector('.tool-tab[data-tool="board"]');
        if (boardTab) boardTab.click();
        window.EJU_WHITEBOARD.pasteText('【题面】', qText);
      }
    });

    // Whiteboard Toolbar controls
    $$('[data-wb-mode]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setMode(b.dataset.wbMode));
    });
    $$('[data-wb-width]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setWidth(Number(b.dataset.wbWidth)));
    });
    $$('[data-wb-color]').forEach(b => {
      b.addEventListener('click', () => window.EJU_WHITEBOARD?.setColor(b.dataset.wbColor));
    });
    $('#wbBgSelect')?.addEventListener('change', e => {
      window.EJU_WHITEBOARD?.setBg(e.target.value);
    });
    $('#wbUndoBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.undo());
    $('#wbRedoBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.redo());
    $('#wbClearBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.clear());
    $('#wbFullscreenBtn')?.addEventListener('click', () => window.EJU_WHITEBOARD?.toggleFullscreen());

        $('#tutorBookmarkBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      state.bookmarks[card.id] = !state.bookmarks[card.id];
      saveState();
      renderTopBarAndDashboard();
      renderTutorCard();
    });
    $('#tutorShowScanBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card || !card.paperImg) return;
      const wrap = $('#tutorScanWrap');
      $('#tutorScanImg').src = card.paperImg;
      wrap.hidden = !wrap.hidden;
    });
    $('#tutorShowAnsKeyBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card || !card.ansImg) return;
      const wrap = $('#tutorScanWrap');
      $('#tutorScanImg').src = card.ansImg;
      wrap.hidden = false;
    });
    

    // Step-by-step reveal buttons in Math Tutoring Station
    const explStepCount = () => $$('#tutorStepExpl .ms-step').length;
    $$('.step-reveal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.dataset.step;
        if (step === 'expl') tutorReveal.expl = tutorReveal.expl > 0 ? 0 : explStepCount();
        else tutorReveal[step] = !tutorReveal[step];
        applyTutorReveal();
        notifyTutorChanged();
      });
    });
    $('#tutorNextStepBtn')?.addEventListener('click', () => {
      tutorReveal.expl = Math.min(explStepCount(), tutorReveal.expl + 1);
      applyTutorReveal();
      notifyTutorChanged();
    });
    $('#tutorRevealAllBtn').addEventListener('click', () => {
      tutorReveal = {hint: true, expl: explStepCount(), ans: true};
      applyTutorReveal();
      notifyTutorChanged();
    });

    // Whiteboard pages & tools
    $('#langHelpPracticeBtn')?.addEventListener('click', () => {
      startCustomPoolSession(langHelpCards().map(x => x.card), '日语没看懂的题', 20);
    });
    $('#langHelpList')?.addEventListener('click', e => {
      const id = e.target.closest('[data-card-id]')?.dataset.cardId;
      const card = cards.find(c => c.id === id);
      if (!card) return;
      if (isMathCard(card)) openMathTutorWithCard(id);
      else if (!window.EJU_SYNC?.isTeacher?.()) startCustomPoolSession([card], '日语没看懂的题', 1);
    });
    $('#wbPageSelect')?.addEventListener('change', e => {
      if (e.target.value === '__new') newBoardPage();
      else openBoardPage(e.target.value);
      notifyTutorChanged();
    });
    $('#wbPastePaperBtn')?.addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (card?.paperImg) window.EJU_WHITEBOARD?.addImage(card.paperImg, card.topic);
    });
    $('#wbReplayBtn')?.addEventListener('click', () => {
      const wb = window.EJU_WHITEBOARD;
      if (!wb) return;
      if (wb.isReplaying()) wb.stopReplay();
      else if (!wb.startReplay(1)) alert('这一页还没有笔记');
    });
    $('#wbExportBtn')?.addEventListener('click', () => {
      const url = window.EJU_WHITEBOARD?.exportImage();
      if (!url) return alert('这一页还没有笔记');
      const card = tutorCardsList[tutorCardIdx];
      const a = document.createElement('a');
      a.href = url;
      a.download = `白板-${(tutorBoardId && state.boardPages?.[tutorBoardId]?.title) || card?.topic || 'page'}-${localDateKey()}.png`;
      a.click();
    });
    const penOnlyBox = $('#wbPenOnlyToggle');
    if (penOnlyBox) {
      penOnlyBox.checked = Boolean(window.EJU_WHITEBOARD?.penOnly());
      penOnlyBox.addEventListener('change', () => window.EJU_WHITEBOARD?.setPenOnly(penOnlyBox.checked));
    }
    if (window.EJU_WHITEBOARD?.hooks) {
      window.EJU_WHITEBOARD.hooks.onReplay = on => {
        const b = $('#wbReplayBtn');
        if (b) { b.textContent = on ? '停止回放' : '回放'; b.classList.toggle('is-replaying', on); }
      };
    }

    // Tutor verdict buttons (linked to progress & 17-day plan)
    $('#tutorMarkHardBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      state.bookmarks[card.id] = true;
      recordCardGrade(card, 'again');
      renderTopBarAndDashboard();
      tutorCardIdx += 1;
      renderTutorCard();
    });
    $('#tutorMarkMasteredBtn').addEventListener('click', () => {
      const card = tutorCardsList[tutorCardIdx];
      if (!card) return;
      delete state.bookmarks[card.id];
      recordCardGrade(card, 'good');
      // Ensure box >= 2 so it counts as mastered immediately
      state.progress[card.id].box = Math.max(2, state.progress[card.id].box || 2);
      state.progress[card.id].inWrongBook = false;
      saveState();
      renderTopBarAndDashboard();
      tutorCardIdx += 1;
      renderTutorCard();
    });

    // Wrong book controls
    $$('#wrongFilterTabs .cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        wrongFilter = btn.dataset.wrongFilter;
        $$('#wrongFilterTabs .cat-tab').forEach(b => b.classList.toggle('is-active', b === btn));
        renderWrongBook();
      });
    });
    $('#wrongPracticeAllBtn').addEventListener('click', () => {
      const pool = cards.filter(isWrong);
      if (pool.length) startCustomPoolSession(pool, '全部错题重练', 25);
    });
    $('#wrongPracticeBunsoBtn').addEventListener('click', () => {
      const pool = cards.filter(c => !isMathCard(c) && isWrong(c));
      if (pool.length) startCustomPoolSession(pool, '文综错题重练', 25);
    });
    $('#wrongPracticeMathBtn').addEventListener('click', () => {
      setPeriodMode('math');
      tutorType = ''; tutorCoreOnly = false;
      tutorCardsList = mathTutorPool();
      const firstWrongIdx = tutorCardsList.findIndex(c => isWrong(c) || isBookmarked(c));
      if (firstWrongIdx >= 0) tutorCardIdx = firstWrongIdx;
      switchRoute('math');
    });

    // Plan mock form & backup
    $('#mockForm').addEventListener('submit', e => {
      e.preventDefault();
      const subject = $('#mockSubject').value;
      const score = Number($('#mockScore').value);
      const note = $('#mockNote').value.trim();
      state.mocks = state.mocks || [];
      state.mocks.push({subject, score, note, date: localDateKey()});
      saveState();
      $('#mockScore').value = '';
      $('#mockNote').value = '';
      renderMocksList();
    });
    $('#exportDataBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `eju-backup-${localDateKey()}.json`;
      a.click();
    });
    $('#importDataInput').addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (parsed && parsed.progress) {
            state = {...state, ...parsed};
            saveState();
            renderTopBarAndDashboard();
            renderLinkedPlan();
          }
        } catch (_) {}
      };
      reader.readAsText(file);
    });

    // Theme & Sync modal
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      $('#themeBtn').textContent = '日间';
    }
    $('#themeBtn').addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem(THEME_KEY, 'light');
        $('#themeBtn').textContent = '夜间';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(THEME_KEY, 'dark');
        $('#themeBtn').textContent = '日间';
      }
    });

    // Stage 1 Audit tabs & filters
    $$('#auditMainTabs [data-audit-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.auditTab;
        $$('#auditMainTabs [data-audit-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
        ['table', 'sbs', 'unverified'].forEach(k => {
          const pane = $(`#auditPane-${k}`);
          if (pane) pane.hidden = k !== target;
        });
      });
    });

    $$('[data-audit-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        auditTableFilter = btn.dataset.auditFilter;
        $$('[data-audit-filter]').forEach(b => b.classList.toggle('btn-primary', b === btn));
        renderAuditComparisonTable();
      });
    });

    $$('[data-sbs-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        auditSbsFilter = btn.dataset.sbsFilter;
        $$('[data-sbs-filter]').forEach(b => b.classList.toggle('btn-primary', b === btn));
        renderAuditSideBySide();
      });
    });
  }

  function bindAtriReporting() {
    adoptAtriTokenFromHash();
    const input = $('#atriTokenInput');
    const status = $('#atriStatusText');
    try { if (status) status.textContent = localStorage.getItem(ATRI_STATUS_KEY) || ''; } catch (_) {}
    if (input) input.placeholder = getAtriToken() ? '已设置（重新填写可更换）' : '填写 ATRI 同步码';
    $('#atriSaveBtn')?.addEventListener('click', () => {
      const code = input.value.trim();
      if (!code) return;
      try { localStorage.setItem(ATRI_TOKEN_KEY, code); } catch (_) {}
      input.value = '';
      input.placeholder = '已设置（重新填写可更换）';
      sendAtriReport();
    });
    document.addEventListener('visibilitychange', () => {
      sendAtriReport({keepalive: document.visibilityState === 'hidden'});
    });
    sendAtriReport();
  }

  function init() {
    bindEvents();
    window.EJU_WHITEBOARD?.init();
    window.EJU_MATH_TOOLS?.init();
    renderTopBarAndDashboard();
    renderDeckProgressGrid();
    renderKnowledgeAccordion();
    renderStage1AuditView();
    renderTutorCard();
    renderMathIn(document.body);

    try {
      const params = new URLSearchParams(window.location.search);
      const qView = params.get('view');
      const qTab = params.get('tab');
      if (qView && $(`#view-${qView}`)) {
        switchRoute(qView);
      }
      if (qTab) {
        const tabBtn = $(`#auditMainTabs [data-audit-tab="${qTab}"]`);
        if (tabBtn) tabBtn.click();
      }
    } catch (_) {}

    window.addEventListener('load', () => {
      renderMathIn(document.body);
      window.EJU_WHITEBOARD?.resize();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    });
  }

  // 阶梯学习（ladder.js）使用的最小接口
  window.EJU_APP = {
    cards,
    getState: () => state,
    getProgress,
    recordCardGrade,
    saveState,
    switchRoute,
    getSession: () => ({queue, index: sessionIndex, card: activeCard}),
    setSession(list, label, index = 0) {
      queue = list;
      sessionIndex = index;
      state.activeSession = {ids: list.map(c => c.id), index, label};
      saveState();
      switchRoute('study');
      renderStudyCard();
    }
  };

  init();
  bindAtriReporting();
})();
