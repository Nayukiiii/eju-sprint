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

  // ── 位置词（geo_hints.js）：虚线下划线 + 点击/悬停气泡 ─────────────────────────
  const HINTS = window.EJU_GEO_HINTS || {};
  const KEYS = Object.keys(HINTS).sort((a, b) => b.length - a.length);
  const GEO_RE = KEYS.length ? new RegExp(KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : null;
  const SKIP_RE = /インド・ヨーロッパ|インド・イラン|タイ・カダイ|四国連合|太平洋戦争/g; // 不是地名用法
  const KATA = /[ァ-ヴー]/;
  const onlyKata = s => /^[ァ-ヴー・]+$/.test(s);

  // seg 是已转义、不含标签的文本；每个词在一个元素里只标第一次出现，避免满屏虚线
  function geoText(seg, seen) {
    if (!GEO_RE) return seg;
    const skips = Array.from(seg.matchAll(SKIP_RE), m => [m.index, m.index + m[0].length]);
    let out = '';
    let last = 0;
    for (const m of seg.matchAll(GEO_RE)) {
      const k = m[0];
      const i = m.index;
      const j = i + k.length;
      if (seen.has(k)) continue;
      if (skips.some(([a, b]) => i < b && j > a)) continue;
      // 片假名词不能是更长片假名词的一部分（タイ 与 タイプ、インド 与 インドシナ）
      if (onlyKata(k) && (KATA.test(seg[i - 1] || '') || KATA.test(seg[j] || ''))) continue;
      seen.add(k);
      out += seg.slice(last, i) + `<span class="geo" data-geo="${k}" tabindex="0">${k}</span>`;
      last = j;
    }
    return out + seg.slice(last);
  }

  // html 必须是已转义的（可含 <u>/<sup> 标签）；只改标签之间的文本，不会破坏已有标记
  function geoHtml(html) {
    if (!GEO_RE) return html;
    const seen = new Set();
    return html.split(/(<[^>]*>)/).map((part, i) => (i % 2 ? part : geoText(part, seen))).join('');
  }

  // 题干 / 选项 / 材料的统一入口：转义 → 下划线标记 → 位置词
  function richHtml(text) {
    return geoHtml(underlineHtml(esc(text)));
  }

  // 本题（题干 + 材料 + 选项）涉及的位置词，按出现顺序去重
  function geoTerms(card) {
    const texts = [card.q, card.passage, ...(Array.isArray(card.choices) ? card.choices : [])];
    const found = [];
    texts.forEach(tx => {
      if (!tx) return;
      for (const m of richHtml(tx).matchAll(/data-geo="([^"]+)"/g)) {
        if (!found.includes(m[1])) found.push(m[1]);
      }
    });
    return found.map(k => ({word: k, hint: HINTS[k]}));
  }

  function passageHtml(card, passage) {
    const p = passage == null ? card.passage : passage;
    const note = underlineMissing(card, p) ? `<div class="ul-missing">${MISSING_NOTE}</div>` : '';
    return note + richHtml(p);
  }

  // 折叠的 AI 中文译文块（label 例：材料译文）；文本全部转义，换行由 CSS 保留
  function cnFoldHtml(label, text, open) {
    if (!text) return '';
    return `<details class="cn-fold"${open ? ' open' : ''}><summary>${esc(label)} <span class="expl-ai-tag">AI 译</span></summary><div class="cn-fold-body">${esc(text)}</div></details>`;
  }

  // 气泡：全页唯一一个，点别处/再点同一个词/滚动时消失
  let pop = null;
  let popFor = null;
  function hidePop() {
    if (pop) pop.hidden = true;
    popFor = null;
  }
  function showPop(el) {
    const hint = HINTS[el.dataset.geo];
    if (!hint) return;
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'geo-pop';
      pop.setAttribute('role', 'tooltip');
      document.body.appendChild(pop);
    }
    pop.textContent = '';
    const b = document.createElement('b');
    b.textContent = el.dataset.geo;
    pop.append(b, `：${hint}`);
    pop.hidden = false;
    popFor = el;
    const r = el.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    const top = r.bottom + h + 12 < window.innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  // 捕获阶段：选项按钮里的位置词只弹气泡，不触发作答
  document.addEventListener('click', e => {
    const g = e.target.closest && e.target.closest('.geo');
    if (g) {
      e.preventDefault();
      e.stopPropagation();
      if (popFor === g) hidePop(); else showPop(g);
    } else if (!(e.target.closest && e.target.closest('.geo-pop'))) {
      hidePop();
    }
  }, true);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hidePop();
    else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('geo')) {
      e.preventDefault();
      showPop(e.target);
    }
  });
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mouseover', e => {
      const g = e.target.closest && e.target.closest('.geo');
      if (g && popFor !== g) showPop(g);
    });
    document.addEventListener('mouseout', e => {
      const g = e.target.closest && e.target.closest('.geo');
      if (g && popFor === g && !(e.relatedTarget && g.contains(e.relatedTarget))) hidePop();
    });
  }
  window.addEventListener('scroll', hidePop, true);
  window.addEventListener('resize', hidePop);

  window.EJU_READ = {esc, underlineHtml, underlineMissing, passageHtml, cnFoldHtml, richHtml, geoTerms, hidePop};
})();
