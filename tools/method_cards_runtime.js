
// ── 运行时：给数学题挂解法卡、给公式闪卡挂完整流程 ────────────────────────────────
(function () {
  const OPEN_KEY = 'eju-mcard-open';
  const METHODS = window.EJU_METHOD_CARDS || [];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const byId = id => METHODS.find(m => m.id === id);

  // 真题优先按 ex 清单对应；没列进清单的题再按 topic 正则匹配。最多 2 张。
  function matchFor(card) {
    if (!card) return [];
    const listed = METHODS.filter(m => m.ex.includes(card.id));
    const byTopic = METHODS.filter(m => !m.ex.includes(card.id) && new RegExp(m.topics).test(card.topic || ''));
    return [...listed, ...byTopic].slice(0, 2);
  }

  function isOpen() {
    try { return localStorage.getItem(OPEN_KEY) !== '0'; } catch (_) { return true; }
  }

  function bodyHtml(m, card, withExample) {
    const steps = m.steps.map(s => `<li>${esc(s)}</li>`).join('');
    const fs = m.formulas.map(f => `<span class="mc-f">${esc(f)}</span>`).join('');
    const traps = m.traps.map(t => `<li>${esc(t)}</li>`).join('');
    // 这道题本身就是卡里的例题时，题面上方不放答案（做完在解析里再看）
    const showEx = m.example && (withExample || !card || m.example.id !== card.id);
    return `<p class="mc-use">${esc(m.use)}</p>
      <ol class="mc-steps">${steps}</ol>
      <div class="mc-formulas">${fs}</div>
      <ul class="mc-traps">${traps}</ul>
      ${showEx ? `<p class="mc-ex">${esc(m.example.text)}</p>` : ''}`;
  }

  // 题面上方的解法卡（折叠状态记在 localStorage，默认展开）
  function htmlFor(card) {
    const ms = matchFor(card);
    if (!ms.length) return '';
    // 只有第一张按记住的状态展开，第二张默认折叠（两张都展开会把题面挤到一屏以下）
    return ms.map((m, i) => `<details class="mcard"${i === 0 ? ' data-primary="1"' : ''}${i === 0 && isOpen() ? ' open' : ''}>
      <summary><span class="mc-tag">解法卡</span>${esc(m.ch)} · ${esc(m.title)}</summary>
      ${bodyHtml(m, card, false)}
    </details>`).join('');
  }

  // 公式闪卡答完后显示完整流程
  function flowHtml(card) {
    const m = byId(card && card.mid);
    if (!m) return '';
    return `<details class="mc-flow"><summary>看完整解法卡：${esc(m.ch)} · ${esc(m.title)}</summary>${bodyHtml(m, card, true)}</details>`;
  }

  document.addEventListener('toggle', e => {
    const d = e.target;
    if (!d || !d.classList || !d.classList.contains('mcard') || !d.dataset.primary) return;
    try { localStorage.setItem(OPEN_KEY, d.open ? '1' : '0'); } catch (_) {}
  }, true);

  window.EJU_METHODS = {all: METHODS, byId, matchFor, htmlFor, flowHtml};
})();
