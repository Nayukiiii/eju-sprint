// 真题可读性：把材料里的 ⟦N:原文⟧ 下划线标记渲染成 <u class="ul">原文</u><sup>N</sup>。
// 先整体 HTML 转义，再替换标记，所以材料里的任何 < > & 都不会变成标签。
(function () {
  const ESC = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ESC[c]);

  function underlineHtml(escaped) {
    return escaped.replace(/⟦(\d):([^⟧]*)⟧/g, '<u class="ul">$2</u><sup class="ul-n">$1</sup>');
  }

  // 题干里写了「下線部N」，但材料里没有对应的 ⟦N:…⟧ 标记（原卷下划线位置待补）
  function underlineMissing(card, passage) {
    const p = passage == null ? card.passage : passage;
    if (!card || !p) return false;
    const nums = String(card.q || '').match(/下線部[１-４1-4]/g);
    if (!nums) return false;
    const fw = {'１': 1, '２': 2, '３': 3, '４': 4};
    return nums.some(s => {
      const ch = s.slice(-1);
      const n = fw[ch] || Number(ch);
      return !p.includes('⟦' + n + ':');
    });
  }

  const MISSING_NOTE = '（本题下划线位置待补，题干里的下線部N 请对照原卷）';

  function passageHtml(card, passage) {
    const p = passage == null ? card.passage : passage;
    const note = underlineMissing(card, p) ? `<div class="ul-missing">${MISSING_NOTE}</div>` : '';
    return note + underlineHtml(esc(p));
  }

  window.EJU_READ = {esc, underlineHtml, underlineMissing, passageHtml};
})();
