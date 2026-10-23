// ═══════════════════════════════════════════════════════════════════
// EJU 数学コース1 · 六大单元智能计算工具箱 (全演算过程 · 默认精确分数/根号 · KaTeX 渲染)
// ═══════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  let initialized = false;
  let activeDrawerTool = 'board'; // 'board' means drawer collapsed (whiteboard full height)
  let recommendedTool = 'quad';

  // ─── Math Helpers: Exact Fractions & Radicals ───
  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function toFractionStr(val, maxDenom = 1000) {
    if (!Number.isFinite(val)) return '0';
    if (Math.abs(val - Math.round(val)) < 1e-7) return String(Math.round(val));
    const sign = val < 0 ? '-' : '';
    const x = Math.abs(val);
    let bestNum = Math.round(x);
    let bestDen = 1;
    let bestErr = Math.abs(x - bestNum);

    for (let d = 2; d <= maxDenom; d++) {
      const n = Math.round(x * d);
      const err = Math.abs(x - n / d);
      if (err < bestErr && err < 1e-5) {
        bestNum = n;
        bestDen = d;
        bestErr = err;
        break;
      }
    }
    const g = gcd(bestNum, bestDen);
    const n = bestNum / g;
    const d = bestDen / g;
    if (d === 1) return `${sign}${n}`;
    return `${sign}\\frac{${n}}{${d}}`;
  }

  function simplifySqrt(n) {
    n = Math.round(Math.abs(n));
    if (n === 0) return { out: 0, in: 1, latex: '0' };
    let outside = 1;
    let inside = n;
    for (let i = 2; i * i <= inside; i++) {
      while (inside % (i * i) === 0) {
        outside *= i;
        inside /= (i * i);
      }
    }
    const latex = inside === 1
      ? `${outside}`
      : outside === 1
      ? `\\sqrt{${inside}}`
      : `${outside}\\sqrt{${inside}}`;
    return { out: outside, in: inside, latex };
  }

  function renderMathIn(el) {
    if (!el) return;
    if (typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (_) {}
    }
  }

  function bindPasteBtn(container, defaultTitle) {
    if (!container) return;
    container.querySelectorAll('.tool-paste-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const latex = btn.dataset.paste || container.innerText;
        if (window.EJU_WHITEBOARD && typeof window.EJU_WHITEBOARD.pasteText === 'function') {
          window.EJU_WHITEBOARD.pasteText(`【${defaultTitle}】`, latex);
        }
      });
    });
  }

  // ─── 1. 数与式 (Numbers & Expressions) ───
  function initExprTool() {
    // A. 二次根式化简 & 分母有理化
    const radInput = document.getElementById('exprRadicalInput');
    const ratC = document.getElementById('exprRatC');
    const ratA = document.getElementById('exprRatA');
    const ratB = document.getElementById('exprRatB');
    const radBtn = document.getElementById('exprRadicalBtn');
    const radOut = document.getElementById('exprRadicalOut');

    const runRadical = () => {
      if (!radInput || !radOut) return;
      const val = parseInt(radInput.value, 10) || 72;
      if (val <= 0) {
        radOut.innerHTML = '<span class="text-warn">请输入大于 0 的整数，如 72</span>';
        return;
      }
      const s = simplifySqrt(val);
      let resLatex = '';
      if (s.in === 1) {
        resLatex = `\\sqrt{${val}} = ${s.out}`;
      } else if (s.out === 1) {
        resLatex = `\\sqrt{${val}} = \\sqrt{${val}} \\text{ (已是最简根式)}`;
      } else {
        resLatex = `\\sqrt{${val}} = \\sqrt{${s.out * s.out} \\times ${s.in}} = \\mathbf{${s.out}\\sqrt{${s.in}}}`;
      }

      // Rationalizing denominator: c / (sqrt(a) + sqrt(b))
      let ratLatex = '';
      if (ratC && ratA && ratB) {
        const c = parseInt(ratC.value, 10) || 2;
        const a = parseInt(ratA.value, 10) || 5;
        const b = parseInt(ratB.value, 10) || 3;
        const diff = a - b;
        if (diff !== 0 && a > 0 && b > 0) {
          const g = gcd(c, diff);
          const numFactor = c / g;
          const denFactor = diff / g;
          const signStr = denFactor < 0 ? '-' : '';
          const absDen = Math.abs(denFactor);
          const coeff = numFactor === 1 ? '' : String(numFactor);
          const finalExpr = absDen === 1
            ? `${signStr}${coeff}(\\sqrt{${a}} - \\sqrt{${b}})`
            : `${signStr}\\frac{${coeff}(\\sqrt{${a}} - \\sqrt{${b}})}{${absDen}}`;
          ratLatex = `\\\\ &\\text{【分母有理化】 } \\frac{${c}}{\\sqrt{${a}} + \\sqrt{${b}}} = \\frac{${c}(\\sqrt{${a}} - \\sqrt{${b}})}{(\\sqrt{${a}})^2 - (\\sqrt{${b}})^2} = \\frac{${c}(\\sqrt{${a}} - \\sqrt{${b}})}{${diff}} = \\mathbf{${finalExpr}}`;
        }
      }

      const fullLatex = `\\begin{aligned} &\\text{【根式化简】 } ${resLatex} ${ratLatex} \\end{aligned}`;
      radOut.innerHTML = `
        <div class="tool-step-row">$$${fullLatex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${fullLatex}">贴到白板</button>
      `;
      renderMathIn(radOut);
      bindPasteBtn(radOut, '根式化简与有理化');
    };

    if (radBtn) radBtn.addEventListener('click', runRadical);

    // B. 展开与因式分解 (十字相乘法 たすき掛け)
    const factorA = document.getElementById('exprFactorA');
    const factorB = document.getElementById('exprFactorB');
    const factorC = document.getElementById('exprFactorC');
    const factorBtn = document.getElementById('exprFactorBtn');
    const factorOut = document.getElementById('exprFactorOut');

    const runFactor = () => {
      if (!factorA || !factorB || !factorC || !factorOut) return;
      const a = parseInt(factorA.value, 10) || 1;
      const b = parseInt(factorB.value, 10) || 0;
      const c = parseInt(factorC.value, 10) || 0;

      let found = null;
      for (let p = 1; p <= Math.abs(a); p++) {
        if (a % p !== 0) continue;
        const r = a / p;
        const cLim = Math.max(1, Math.abs(c));
        for (let q = -cLim; q <= cLim; q++) {
          if (c === 0) {
            if (q * r === b) { found = { p, q, r, s: 0 }; break; }
            continue;
          }
          if (q === 0 || c % q !== 0) continue;
          const s = c / q;
          if (p * s + q * r === b) {
            found = { p, q, r, s };
            break;
          }
        }
        if (found) break;
      }

      const exprText = `${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
      if (found) {
        const { p, q, r, s } = found;
        const part1 = `${p === 1 ? '' : p === -1 ? '-' : p}x ${q >= 0 ? '+ ' + q : '- ' + Math.abs(q)}`;
        const part2 = `${r === 1 ? '' : r === -1 ? '-' : r}x ${s >= 0 ? '+ ' + s : '- ' + Math.abs(s)}`;
        const latex = `\\begin{aligned} &${exprText} = \\mathbf{(${part1})(${part2})} \\\\ &\\text{【たすき掛け验算】 } (${p})\\times(${s}) + (${q})\\times(${r}) = ${p * s} + (${q * r}) = ${b} \\end{aligned}`;
        factorOut.innerHTML = `
          <div class="tool-step-row">$$${latex}$$</div>
          <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
        `;
      } else {
        const D = b * b - 4 * a * c;
        const sD = simplifySqrt(Math.abs(D));
        const latex = D >= 0
          ? `${exprText} = 0 \\implies D = ${b}^2 - 4(${a})(${c}) = ${D},\\quad x = \\frac{${-b} \\pm ${sD.latex}}{${2 * a}}`
          : `${exprText} \\text{ 判别式 } D = ${D} < 0 \\text{（实数范围内不可分解）}`;
        factorOut.innerHTML = `
          <div class="tool-step-row">$$${latex}$$</div>
          <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
        `;
      }
      renderMathIn(factorOut);
      bindPasteBtn(factorOut, '因式分解');
    };

    if (factorBtn) factorBtn.addEventListener('click', runFactor);

    // C. 绝对值不等式与数轴图示
    const absA = document.getElementById('exprAbsCenter');
    const absD = document.getElementById('exprAbsDist');
    const absType = document.getElementById('exprAbsType');
    const absBtn = document.getElementById('exprAbsBtn');
    const absOut = document.getElementById('exprAbsOut');
    const absCanvas = document.getElementById('exprAbsCanvas');

    const runAbs = () => {
      if (!absA || !absD || !absOut || !absCanvas) return;
      const p = parseFloat(absA.value) || 0;
      const d = Math.max(0.5, parseFloat(absD.value) || 1);
      const type = absType ? absType.value : 'le';

      const minX = toFractionStr(p - d);
      const maxX = toFractionStr(p + d);
      const pStr = toFractionStr(p);
      const dStr = toFractionStr(d);

      const stepText = type === 'le'
        ? `|x - (${pStr})| \\le ${dStr} \\iff -${dStr} \\le x - (${pStr}) \\le ${dStr} \\iff \\mathbf{${minX} \\le x \\le ${maxX}}`
        : `|x - (${pStr})| \\ge ${dStr} \\iff x - (${pStr}) \\le -${dStr} \\text{ 或 } x - (${pStr}) \\ge ${dStr} \\iff \\mathbf{x \\le ${minX} \\text{ 或 } x \\ge ${maxX}}`;

      absOut.innerHTML = `
        <div class="tool-step-row">$$${stepText}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${stepText}">贴到白板</button>
      `;
      renderMathIn(absOut);
      bindPasteBtn(absOut, '绝对值不等式');
      drawNumberLine(absCanvas, p, d, type);
    };

    if (absBtn) absBtn.addEventListener('click', runAbs);

    runRadical();
    runFactor();
    runAbs();
  }

  function drawNumberLine(canvas, center, dist, type) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#F8F6F1';
    ctx.fillRect(0, 0, w, h);

    const pad = 44;
    const lineY = h / 2 + 8;
    const leftVal = center - dist - 2;
    const rightVal = center + dist + 2;
    const toScreenX = v => pad + ((v - leftVal) / (rightVal - leftVal)) * (w - 2 * pad);

    ctx.strokeStyle = '#7A756B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad - 15, lineY);
    ctx.lineTo(w - pad + 15, lineY);
    ctx.stroke();

    ctx.fillStyle = '#7A756B';
    ctx.beginPath();
    ctx.moveTo(w - pad + 15, lineY);
    ctx.lineTo(w - pad + 5, lineY - 5);
    ctx.lineTo(w - pad + 5, lineY + 5);
    ctx.fill();

    const minX = center - dist;
    const maxX = center + dist;
    [leftVal, minX, center, maxX, rightVal].forEach(v => {
      const sx = toScreenX(v);
      ctx.beginPath();
      ctx.moveTo(sx, lineY - 6);
      ctx.lineTo(sx, lineY + 6);
      ctx.stroke();

      ctx.fillStyle = '#23304A';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(Math.round(v * 100) / 100), sx, lineY + 22);
    });

    const sxMin = toScreenX(minX);
    const sxMax = toScreenX(maxX);
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 3.5;
    ctx.fillStyle = 'rgba(214, 112, 82, 0.16)';

    if (type === 'le') {
      ctx.fillRect(sxMin, lineY - 18, sxMax - sxMin, 18);
      ctx.beginPath();
      ctx.moveTo(sxMin, lineY);
      ctx.lineTo(sxMin, lineY - 18);
      ctx.lineTo(sxMax, lineY - 18);
      ctx.lineTo(sxMax, lineY);
      ctx.stroke();
    } else {
      ctx.fillRect(pad - 10, lineY - 18, sxMin - (pad - 10), 18);
      ctx.fillRect(sxMax, lineY - 18, (w - pad + 10) - sxMax, 18);
      ctx.beginPath();
      ctx.moveTo(pad - 10, lineY - 18);
      ctx.lineTo(sxMin, lineY - 18);
      ctx.lineTo(sxMin, lineY);
      ctx.moveTo(w - pad + 10, lineY - 18);
      ctx.lineTo(sxMax, lineY - 18);
      ctx.lineTo(sxMax, lineY);
      ctx.stroke();
    }

    ctx.fillStyle = '#D67052';
    [sxMin, sxMax].forEach(sx => {
      ctx.beginPath();
      ctx.arc(sx, lineY, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ─── 2. 二次函数 (Quadratic Functions: a,b,c -> 配方过程·顶点·判别式D·区间最值) ───
  function initQuadTool() {
    const sliderA = document.getElementById('quadSliderA');
    const sliderP = document.getElementById('quadSliderP');
    const sliderQ = document.getElementById('quadSliderQ');
    const stdA = document.getElementById('quadStdA');
    const stdB = document.getElementById('quadStdB');
    const stdC = document.getElementById('quadStdC');
    const stdBtn = document.getElementById('quadStdCalcBtn');
    const inputM = document.getElementById('quadInputM');
    const inputN = document.getElementById('quadInputN');
    const banner = document.getElementById('quadFormulaBanner');
    const canvas = document.getElementById('quadCanvas');

    if (!sliderA || !sliderP || !sliderQ || !banner || !canvas) return;

    function updateQuad(fromStandard = false) {
      let a, p, q, b, c;
      if (fromStandard && stdA && stdB && stdC) {
        a = parseFloat(stdA.value);
        if (!a || Math.abs(a) < 1e-6) a = 1;
        b = parseFloat(stdB.value) || 0;
        c = parseFloat(stdC.value) || 0;
        p = -b / (2 * a);
        q = c - (b * b) / (4 * a);
        sliderA.value = String(Math.max(-2.5, Math.min(2.5, a)));
        sliderP.value = String(Math.max(-4, Math.min(6, p)));
        sliderQ.value = String(Math.max(-5, Math.min(5, q)));
      } else {
        a = parseFloat(sliderA.value);
        if (!a || Math.abs(a) < 1e-6) a = 0.5;
        p = parseFloat(sliderP.value) || 0;
        q = parseFloat(sliderQ.value) || 0;
        b = -2 * a * p;
        c = a * p * p + q;
        if (stdA) stdA.value = String(Math.round(a * 100) / 100);
        if (stdB) stdB.value = String(Math.round(b * 100) / 100);
        if (stdC) stdC.value = String(Math.round(c * 100) / 100);
      }

      let m = parseFloat(inputM ? inputM.value : 0);
      let n = parseFloat(inputN ? inputN.value : 3);
      if (isNaN(m)) m = 0;
      if (isNaN(n)) n = 3;
      if (m > n) [m, n] = [n, m];

      document.getElementById('quadValA').textContent = toFractionStr(a);
      document.getElementById('quadValP').textContent = toFractionStr(p);
      document.getElementById('quadValQ').textContent = toFractionStr(q);
      if (document.getElementById('quadValRange')) {
        document.getElementById('quadValRange').textContent = `[${m}, ${n}]`;
      }

      const aFrac = toFractionStr(a);
      const bFrac = toFractionStr(b);
      const cFrac = toFractionStr(c);
      const pFrac = toFractionStr(p);
      const qFrac = toFractionStr(q);

      // Discriminant D = b^2 - 4ac
      const D = b * b - 4 * a * c;
      const dFrac = toFractionStr(D);
      let rootsDesc = '';
      if (Math.abs(D) < 1e-6) {
        rootsDesc = `D = 0 \\text{（与 } x \\text{ 轴相切，1 个公共点 } x = ${pFrac}\\text{）}`;
      } else if (D > 0) {
        const x1 = (-b - Math.sqrt(D)) / (2 * a);
        const x2 = (-b + Math.sqrt(D)) / (2 * a);
        rootsDesc = `D = ${dFrac} > 0 \\text{（与 } x \\text{ 轴有 2 个交点：} x_1 = ${toFractionStr(x1)},\\; x_2 = ${toFractionStr(x2)}\\text{）}`;
      } else {
        rootsDesc = `D = ${dFrac} < 0 \\text{（与 } x \\text{ 轴无交点，0 个公共点）}`;
      }

      // Min/Max on [m, n]
      const fm = a * Math.pow(m - p, 2) + q;
      const fn = a * Math.pow(n - p, 2) + q;
      let minVal, maxVal, minXStr, maxXStr;

      if (a > 0) {
        if (p < m) {
          minVal = fm; minXStr = `x=${m}`;
          maxVal = fn; maxXStr = `x=${n}`;
        } else if (p > n) {
          minVal = fn; minXStr = `x=${n}`;
          maxVal = fm; maxXStr = `x=${m}`;
        } else {
          minVal = q; minXStr = `\\text{顶点 } x=${pFrac}`;
          if (fm > fn) { maxVal = fm; maxXStr = `x=${m}`; }
          else if (fn > fm) { maxVal = fn; maxXStr = `x=${n}`; }
          else { maxVal = fm; maxXStr = `x=${m},${n}`; }
        }
      } else {
        if (p < m) {
          maxVal = fm; maxXStr = `x=${m}`;
          minVal = fn; minXStr = `x=${n}`;
        } else if (p > n) {
          maxVal = fn; maxXStr = `x=${n}`;
          minVal = fm; minXStr = `x=${m}`;
        } else {
          maxVal = q; maxXStr = `\\text{顶点 } x=${pFrac}`;
          if (fm < fn) { minVal = fm; minXStr = `x=${m}`; }
          else if (fn < fm) { minVal = fn; minXStr = `x=${n}`; }
          else { minVal = fm; minXStr = `x=${m},${n}`; }
        }
      }

      const signP = p >= 0 ? `- ${pFrac}` : `+ ${toFractionStr(Math.abs(p))}`;
      const signQ = q >= 0 ? `+ ${qFrac}` : `- ${toFractionStr(Math.abs(q))}`;
      const signB = b >= 0 ? `+ ${bFrac}x` : `- ${toFractionStr(Math.abs(b))}x`;
      const signC = c >= 0 ? `+ ${cFrac}` : `- ${toFractionStr(Math.abs(c))}`;

      const latex = `
        \\begin{aligned}
        &\\text{【配方过程】 } y = ${aFrac}x^2 ${signB} ${signC} = \\mathbf{${aFrac}\\left(x ${signP}\\right)^2 ${signQ}} \\\\
        &\\text{【顶点与轴】 对称轴 } x = ${pFrac},\\quad \\text{顶点坐标 } \\left(${pFrac},\\; ${qFrac}\\right) \\\\
        &\\text{【判别式 } D\\text{】 } D = b^2 - 4ac = ${rootsDesc} \\\\
        &\\text{【区间 } [${m}, ${n}] \\text{ 最值】 最大值 } = \\mathbf{${toFractionStr(maxVal)}} \\text{ (于 } ${maxXStr}\\text{)},\\quad \\text{最小值 } = \\mathbf{${toFractionStr(minVal)}} \\text{ (于 } ${minXStr}\\text{)}
        \\end{aligned}
      `;

      banner.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(banner);
      bindPasteBtn(banner, '二次函数配方与最值');

      drawParabola(canvas, a, p, q, m, n);
    }

    [sliderA, sliderP, sliderQ, inputM, inputN].forEach(el => {
      if (el) el.addEventListener('input', () => updateQuad(false));
    });
    if (stdBtn) {
      stdBtn.addEventListener('click', () => updateQuad(true));
    }

    document.querySelectorAll('[data-quad-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.quadPreset;
        if (mode === 'left') { sliderA.value = '1'; sliderP.value = '-1'; sliderQ.value = '1'; }
        else if (mode === 'mid') { sliderA.value = '1'; sliderP.value = '1.5'; sliderQ.value = '-2'; }
        else if (mode === 'right') { sliderA.value = '1'; sliderP.value = '4.5'; sliderQ.value = '1'; }
        else if (mode === 'down') { sliderA.value = '-1'; sliderP.value = '1.5'; sliderQ.value = '3'; }
        updateQuad(false);
      });
    });

    updateQuad(false);
  }

  function drawParabola(canvas, a, p, q, m, n) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#F8F6F1';
    ctx.fillRect(0, 0, w, h);

    const ox = w / 2 - 20;
    const oy = h / 2 + 30;
    const unit = 26;

    ctx.strokeStyle = '#ebe6dc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ox % unit; x <= w; x += unit) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = oy % unit; y <= h; y += unit) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    ctx.strokeStyle = '#A39E93';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(w, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, h);
    ctx.stroke();

    // Domain [m, n] band
    const sxM = ox + m * unit;
    const sxN = ox + n * unit;
    ctx.fillStyle = 'rgba(214, 112, 82, 0.1)';
    ctx.fillRect(Math.min(sxM, sxN), 0, Math.abs(sxN - sxM), h);

    // Axis of symmetry x = p
    const sxP = ox + p * unit;
    ctx.strokeStyle = '#2F4A7A';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(sxP, 0);
    ctx.lineTo(sxP, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Full parabola
    ctx.strokeStyle = '#A39E93';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= w; px += 2) {
      const xVal = (px - ox) / unit;
      const yVal = a * Math.pow(xVal - p, 2) + q;
      const py = oy - yVal * unit;
      if (py >= -30 && py <= h + 30) {
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Highlighted interval [m, n] on parabola
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    started = false;
    for (let xv = Math.min(m, n); xv <= Math.max(m, n) + 0.001; xv += 0.04) {
      const xc = Math.min( xv, Math.max(m, n) );
      const yv = a * Math.pow(xc - p, 2) + q;
      const px = ox + xc * unit;
      const py = oy - yv * unit;
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Vertex dot & label
    const vx = ox + p * unit;
    const vy = oy - q * unit;
    ctx.fillStyle = '#2F4A7A';
    ctx.beginPath();
    ctx.arc(vx, vy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`顶点 (${p}, ${q})`, vx + 8, vy + 14);
  }

  // ─── 3. 图形与计量 (Geometry & Trigonometry: Exact Surds + Step-by-Step + Triangle Plot) ───
  function initTrigTool() {
    const inputB = document.getElementById('trigB');
    const inputC = document.getElementById('trigC');
    const inputA = document.getElementById('trigAngleA');
    const btn = document.getElementById('trigCalcBtn');
    const out = document.getElementById('trigOutput');
    const canvas = document.getElementById('trigCanvas');

    if (!btn || !inputB || !inputC || !inputA || !out) return;

    const SPECIAL_TRIG = {
      30: { sinLatex: '\\frac{1}{2}', cosLatex: '\\frac{\\sqrt{3}}{2}', sinSqNum: 1, sinSqDen: 4 },
      45: { sinLatex: '\\frac{\\sqrt{2}}{2}', cosLatex: '\\frac{\\sqrt{2}}{2}', sinSqNum: 2, sinSqDen: 4 },
      60: { sinLatex: '\\frac{\\sqrt{3}}{2}', cosLatex: '\\frac{1}{2}', sinSqNum: 3, sinSqDen: 4 },
      90: { sinLatex: '1', cosLatex: '0', sinSqNum: 1, sinSqDen: 1 },
      120: { sinLatex: '\\frac{\\sqrt{3}}{2}', cosLatex: '-\\frac{1}{2}', sinSqNum: 3, sinSqDen: 4 },
      135: { sinLatex: '\\frac{\\sqrt{2}}{2}', cosLatex: '-\\frac{\\sqrt{2}}{2}', sinSqNum: 2, sinSqDen: 4 },
      150: { sinLatex: '\\frac{1}{2}', cosLatex: '-\\frac{\\sqrt{3}}{2}', sinSqNum: 1, sinSqDen: 4 }
    };

    const runTrig = () => {
      const b = parseFloat(inputB.value) || 5;
      const c = parseFloat(inputC.value) || 8;
      const degA = parseFloat(inputA.value) || 60;
      const radA = (degA * Math.PI) / 180;

      const cosA = Math.cos(radA);
      const sinA = Math.sin(radA);
      const a2 = b * b + c * c - 2 * b * c * cosA;
      const a = Math.sqrt(Math.max(0.0001, a2));
      const S = 0.5 * b * c * sinA;
      const R = a / (2 * sinA);
      const r = (2 * S) / (a + b + c);

      const sp = SPECIAL_TRIG[degA];
      const cosDisplay = sp ? sp.cosLatex : cosA.toFixed(4);
      const sinDisplay = sp ? sp.sinLatex : sinA.toFixed(4);

      // Exact radical representation when a^2 is integer
      let aExactLatex = `\\approx ${a.toFixed(3)}`;
      if (Math.abs(a2 - Math.round(a2)) < 1e-5) {
        const sA = simplifySqrt(Math.round(a2));
        aExactLatex = `= \\mathbf{${sA.latex}}` + (sA.in === 1 ? '' : ` \\approx ${a.toFixed(3)}`);
      }

      // Exact area when degA is 30, 45, 60, 90, 120, 135, 150
      let sExactLatex = `\\approx ${S.toFixed(3)}`;
      if (degA === 60 || degA === 120) {
        const coeffFrac = toFractionStr((b * c) / 4);
        sExactLatex = `= \\mathbf{${coeffFrac === '1' ? '' : coeffFrac}\\sqrt{3}} \\approx ${S.toFixed(3)}`;
      } else if (degA === 45 || degA === 135) {
        const coeffFrac = toFractionStr((b * c) / 4);
        sExactLatex = `= \\mathbf{${coeffFrac === '1' ? '' : coeffFrac}\\sqrt{2}} \\approx ${S.toFixed(3)}`;
      } else if (degA === 30 || degA === 150) {
        sExactLatex = `= \\mathbf{${toFractionStr((b * c) / 4)}}`;
      } else if (degA === 90) {
        sExactLatex = `= \\mathbf{${toFractionStr((b * c) / 2)}}`;
      }

      const latex = `
        \\begin{aligned}
        &\\text{1. 【余弦定理求对边 } a\\text{】 } a^2 = b^2 + c^2 - 2bc\\cos A = ${b}^2 + ${c}^2 - 2(${b})(${c})\\left(${cosDisplay}\\right) = ${toFractionStr(a2)} \\implies a ${aExactLatex} \\\\
        &\\text{2. 【面积公式求 } S\\text{】 } S = \\frac{1}{2}bc\\sin A = \\frac{1}{2}(${b})(${c})\\left(${sinDisplay}\\right) ${sExactLatex} \\\\
        &\\text{3. 【正弦定理外接圆半径 } R\\text{】 } 2R = \\frac{a}{\\sin A} \\implies R = \\frac{${a.toFixed(3)}}{2\\times ${sinDisplay}} \\approx \\mathbf{${R.toFixed(3)}} \\\\
        &\\text{4. 【内切圆半径 } r\\text{】 } S = \\frac{1}{2}r(a+b+c) \\implies r = \\frac{2S}{a+b+c} \\approx \\mathbf{${r.toFixed(3)}}
        \\end{aligned}
      `;

      out.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(out);
      bindPasteBtn(out, '正弦/余弦定理与外接圆内切圆');

      if (canvas) drawTriangle(canvas, a, b, c, degA);
    };

    btn.addEventListener('click', runTrig);
    runTrig();
  }

  function drawTriangle(canvas, a, b, c, degA) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#F8F6F1';
    ctx.fillRect(0, 0, w, h);

    const pad = 42;
    const radA = (degA * Math.PI) / 180;
    const rawBx = c;
    const rawCx = b * Math.cos(radA);
    const rawCy = b * Math.sin(radA);

    const minX = Math.min(0, rawBx, rawCx);
    const maxX = Math.max(0, rawBx, rawCx);
    const maxY = Math.max(0.5, rawCy);

    const scale = Math.min((w - 2 * pad) / Math.max(1, maxX - minX), (h - 2 * pad) / maxY);
    const offsetX = pad - minX * scale + ((w - 2 * pad) - (maxX - minX) * scale) / 2;
    const offsetY = h - pad;

    const ax = offsetX;
    const ay = offsetY;
    const bx = offsetX + rawBx * scale;
    const by = offsetY;
    const cx = offsetX + rawCx * scale;
    const cy = offsetY - rawCy * scale;

    // Angle arc at A
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ax, ay, 24, -radA, 0);
    ctx.stroke();
    ctx.fillStyle = '#D67052';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${degA}°`, ax + 28, ay - 6);

    // Triangle ABC
    ctx.strokeStyle = '#23304A';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(214, 112, 82, 0.09)';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vertices labels
    ctx.fillStyle = '#23304A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('A', ax - 16, ay + 6);
    ctx.fillText('B', bx + 8, by + 6);
    ctx.fillText('C', cx - 6, cy - 10);

    // Side labels
    ctx.fillStyle = '#5C574E';
    ctx.font = '12.5px sans-serif';
    ctx.fillText(`c = ${c}`, (ax + bx) / 2 - 14, ay + 18);
    ctx.fillText(`b = ${b}`, (ax + cx) / 2 - 36, (ay + cy) / 2);
    ctx.fillText(`a ≈ ${a.toFixed(2)}`, (bx + cx) / 2 + 10, (by + cy) / 2);
  }

  // ─── 4. 場合の数・確率 (Combinatorics, Dice 36-Grid, Tree Diagram & Conditional Prob) ───
  function initProbTool() {
    const inputN = document.getElementById('probInputN');
    const inputR = document.getElementById('probInputR');
    const btn = document.getElementById('probCalcBtn');
    const out = document.getElementById('probOutput');

    const runProbPC = () => {
      if (!inputN || !inputR || !out) return;
      const n = parseInt(inputN.value, 10) || 7;
      const r = parseInt(inputR.value, 10) || 3;
      if (r < 0 || r > n) {
        out.innerHTML = '<span class="text-warn">需满足 $0 \\le r \\le n$</span>';
        renderMathIn(out);
        return;
      }

      let pVal = 1;
      const pFactors = [];
      for (let i = 0; i < r; i++) {
        pVal *= (n - i);
        pFactors.push(String(n - i));
      }

      let rFact = 1;
      const rFactors = [];
      for (let i = 1; i <= r; i++) {
        rFact *= i;
        rFactors.push(String(i));
      }
      const cVal = pVal / rFact;

      const pStr = pFactors.length ? pFactors.join(' \\times ') : '1';
      const rStr = rFactors.length ? rFactors.join(' \\times ') : '1';

      const latex = `
        \\begin{aligned}
        &\\text{【排列数】 } {}_{${n}}\\mathrm{P}_{${r}} = ${pStr} = \\mathbf{${pVal}} \\\\
        &\\text{【组合数】 } {}_{${n}}\\mathrm{C}_{${r}} = \\frac{{}_{${n}}\\mathrm{P}_{${r}}}{${r}!} = \\frac{${pStr}}{${rStr}} = \\mathbf{${cVal}} \\\\
        &\\text{【余事象（至少1个）公式】 } P(\\text{少なくとも1つ}) = 1 - P(\\text{すべて起きない}) \\\\
        &\\text{【条件概率公式】 } P_A(B) = \\frac{P(A \\cap B)}{P(A)} = \\frac{n(A \\cap B)}{n(A)}
        \\end{aligned}
      `;

      out.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(out);
      bindPasteBtn(out, '排列组合与概率公式');
    };

    if (btn) btn.addEventListener('click', runProbPC);
    runProbPC();

    // Double Dice Matrix
    const grid = document.getElementById('diceGrid');
    const resultBadge = document.getElementById('diceProbResult');
    if (grid && resultBadge) {
      grid.innerHTML = '';
      for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
          const cell = document.createElement('div');
          cell.className = 'dice-cell';
          cell.dataset.d1 = String(i);
          cell.dataset.d2 = String(j);
          cell.textContent = `(${i},${j})`;
          cell.addEventListener('click', () => {
            cell.classList.toggle('is-selected');
            updateDiceStats();
          });
          grid.appendChild(cell);
        }
      }

      function updateDiceStats() {
        const selCount = grid.querySelectorAll('.dice-cell.is-selected').length;
        const compCount = 36 - selCount;
        const g = gcd(selCount, 36);
        const num = selCount / g;
        const den = 36 / g;
        const fracStr = selCount === 0 ? '0' : den === 1 ? String(num) : `\\frac{${num}}{${den}}`;
        const cg = gcd(compCount, 36);
        const cFrac = compCount === 0 ? '0' : (36 / cg === 1 ? String(compCount / cg) : `\\frac{${compCount / cg}}{${36 / cg}}`);
        resultBadge.innerHTML = `已选 $n(A)=${selCount}/36 \\implies P(A) = \\mathbf{${fracStr}}$ ｜ 余事象 $P(\\bar{A}) = 1 - P(A) = \\mathbf{${cFrac}}$`;
        renderMathIn(resultBadge);
      }

      document.querySelectorAll('[data-dice-preset]').forEach(pBtn => {
        pBtn.addEventListener('click', () => {
          const mode = pBtn.dataset.dicePreset;
          grid.querySelectorAll('.dice-cell').forEach(c => {
            const d1 = parseInt(c.dataset.d1, 10);
            const d2 = parseInt(c.dataset.d2, 10);
            let hit = false;
            if (mode === 'sum7') hit = (d1 + d2 === 7);
            else if (mode === 'sumGe10') hit = (d1 + d2 >= 10);
            else if (mode === 'diffLe1') hit = (Math.abs(d1 - d2) <= 1);
            else if (mode === 'prodEven') hit = ((d1 * d2) % 2 === 0);
            else if (mode === 'doubles') hit = (d1 === d2);
            else if (mode === 'clear') hit = false;
            c.classList.toggle('is-selected', hit);
          });
          updateDiceStats();
        });
      });

      // Default select sum7 on load so it shows a nice example
      const sum7Btn = document.querySelector('[data-dice-preset="sum7"]');
      if (sum7Btn) sum7Btn.click();
    }
  }

  // ─── 5. 整数の性質 (GCD Euclidean, Prime Factors, ax+by=c, Base-n Conversion) ───
  function initIntegersTool() {
    // A. GCD Euclidean algorithm & ax + by = c
    const inputA = document.getElementById('intInputA');
    const inputB = document.getElementById('intInputB');
    const inputC = document.getElementById('intInputC');
    const btn = document.getElementById('intGcdBtn');
    const out = document.getElementById('intGcdOut');

    const runGcdAndDio = () => {
      if (!inputA || !inputB || !out) return;
      const origA = parseInt(inputA.value, 10) || 168;
      const origB = parseInt(inputB.value, 10) || 45;
      const targetC = inputC ? (parseInt(inputC.value, 10) || 3) : gcd(origA, origB);

      let a = Math.abs(origA);
      let b = Math.abs(origB);
      const steps = [];
      while (b !== 0) {
        const q = Math.floor(a / b);
        const r = a % b;
        steps.push(`${a} = ${b} \\times ${q} + ${r}`);
        a = b;
        b = r;
      }
      const gcdVal = a || 1;
      const lcmVal = Math.abs(origA * origB) / gcdVal;

      // Extended Euclidean for ax + by = gcd(a, b)
      function extGcd(x, y) {
        if (y === 0) return { g: x, u: 1, v: 0 };
        const res = extGcd(y, x % y);
        return {
          g: res.g,
          u: res.v,
          v: res.u - Math.floor(x / y) * res.v
        };
      }
      const eg = extGcd(Math.abs(origA), Math.abs(origB));
      let dioLatex = '';
      if (targetC % gcdVal !== 0) {
        dioLatex = `&\\text{【不定方程】 } ${origA}x + ${origB}y = ${targetC} \\text{ 无整数解（因 } ${gcdVal} \\nmid ${targetC}\\text{）}`;
      } else {
        const mult = targetC / gcdVal;
        const x0 = (origA < 0 ? -1 : 1) * eg.u * mult;
        const y0 = (origB < 0 ? -1 : 1) * eg.v * mult;
        const stepX = origB / gcdVal;
        const stepY = origA / gcdVal;
        dioLatex = `&\\text{【不定方程 } ${origA}x + ${origB}y = ${targetC}\\text{】 特解 } (x_0, y_0) = (${x0},\\; ${y0}),\\quad \\text{通解 } \\mathbf{x = ${x0} + ${stepX}k,\\; y = ${y0} - ${stepY}k}\\; (k \\in \\mathbb{Z})`;
      }

      const stepsLatex = steps.map(s => `&${s} \\\\`).join('\n');
      const latex = `
        \\begin{aligned}
        &\\text{【ユークリッド互除法（辗转相除步骤）】} \\\\
        ${stepsLatex}
        &\\implies \\gcd(${origA}, ${origB}) = \\mathbf{${gcdVal}},\\quad \\mathrm{lcm}(${origA}, ${origB}) = \\mathbf{${lcmVal}} \\\\
        ${dioLatex}
        \\end{aligned}
      `;

      out.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(out);
      bindPasteBtn(out, '辗转相除与一次不定方程');
    };

    if (btn) btn.addEventListener('click', runGcdAndDio);
    runGcdAndDio();

    // B. Prime Factorization & Base-n Conversion
    const primeInput = document.getElementById('intPrimeInput');
    const baseSelect = document.getElementById('intBaseSelect');
    const primeBtn = document.getElementById('intPrimeBtn');
    const primeOut = document.getElementById('intPrimeOut');

    const runPrimeAndBase = () => {
      if (!primeInput || !primeOut) return;
      let n = Math.max(2, Math.abs(parseInt(primeInput.value, 10)) || 360);
      const origN = n;
      const base = baseSelect ? (parseInt(baseSelect.value, 10) || 2) : 2;

      const factors = {};
      let d = 2;
      while (d * d <= n) {
        while (n % d === 0) {
          factors[d] = (factors[d] || 0) + 1;
          n /= d;
        }
        d++;
      }
      if (n > 1) factors[n] = (factors[n] || 0) + 1;

      const parts = Object.entries(factors).map(([p, e]) => e > 1 ? `${p}^{${e}}` : `${p}`);
      const factorStr = parts.join(' \\times ');
      const numDivisors = Object.values(factors).reduce((acc, e) => acc * (e + 1), 1);
      const sumDivisors = Object.entries(factors).reduce((acc, [p, e]) => {
        const pNum = Number(p);
        let s = 0;
        for (let k = 0; k <= e; k++) s += Math.pow(pNum, k);
        return acc * s;
      }, 1);

      const baseStr = origN.toString(base).toUpperCase();

      const latex = `
        \\begin{aligned}
        &\\text{【质因数分解】 } ${origN} = \\mathbf{${factorStr}} \\\\
        &\\text{【正约数】 个数 } = ${Object.values(factors).map(e => `(${e}+1)`).join('')} = \\mathbf{${numDivisors} \\text{ 个}},\\quad \\text{正约数总和 } = \\mathbf{${sumDivisors}} \\\\
        &\\text{【进制转换】 } ${origN}_{(10)} = \\mathbf{${baseStr}_{(${base})}}
        \\end{aligned}
      `;
      primeOut.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(primeOut);
      bindPasteBtn(primeOut, '质因数分解与n进制转换');
    };

    if (primeBtn) primeBtn.addEventListener('click', runPrimeAndBase);
    if (baseSelect) baseSelect.addEventListener('change', runPrimeAndBase);
    runPrimeAndBase();
  }

  // ─── 6. データの分析 (Data Analysis: Quartiles, Boxplot, Scatter & Correlation r) ───
  function initStatsTool() {
    const input = document.getElementById('statsDataInput');
    const inputY = document.getElementById('statsDataInputY');
    const btn = document.getElementById('statsCalcBtn');
    const out = document.getElementById('statsOutput');
    const canvas = document.getElementById('statsBoxplotCanvas');

    if (!btn || !input || !out) return;

    const runStats = () => {
      const raw = input.value.split(/[,，\s]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
      if (raw.length < 3) {
        out.innerHTML = '<span class="text-warn">请输入至少 3 个数值</span>';
        return;
      }
      const data = [...raw].sort((a, b) => a - b);
      const N = data.length;
      const sum = data.reduce((a, b) => a + b, 0);
      const mean = sum / N;

      function getMedian(arr) {
        const m = arr.length;
        if (m % 2 === 1) return arr[Math.floor(m / 2)];
        return (arr[m / 2 - 1] + arr[m / 2]) / 2;
      }

      const median = getMedian(data);
      const halfLen = Math.floor(N / 2);
      const lowerHalf = data.slice(0, halfLen);
      const upperHalf = N % 2 === 1 ? data.slice(halfLen + 1) : data.slice(halfLen);
      const Q1 = getMedian(lowerHalf);
      const Q3 = getMedian(upperHalf);
      const IQR = Q3 - Q1;

      const variance = data.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / N;
      const stdDev = Math.sqrt(variance);

      // Correlation coefficient r if Y data provided
      let corrLatex = '';
      if (inputY && inputY.value.trim()) {
        const rawY = inputY.value.split(/[,，\s]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
        if (rawY.length === raw.length && rawY.length >= 2) {
          const meanX = raw.reduce((a, b) => a + b, 0) / N;
          const meanY = rawY.reduce((a, b) => a + b, 0) / N;
          let cov = 0, vx = 0, vy = 0;
          for (let i = 0; i < N; i++) {
            cov += (raw[i] - meanX) * (rawY[i] - meanY);
            vx += Math.pow(raw[i] - meanX, 2);
            vy += Math.pow(rawY[i] - meanY, 2);
          }
          cov /= N;
          const sx = Math.sqrt(vx / N);
          const sy = Math.sqrt(vy / N);
          const r = (sx * sy > 0) ? cov / (sx * sy) : 0;
          corrLatex = `\\\\ &\\text{【双变量相关】 协方差 } s_{xy} = ${cov.toFixed(2)},\\quad \\text{相关系数 } r = \\frac{s_{xy}}{s_x s_y} = \\mathbf{${r.toFixed(3)}}`;
        }
      }

      const latex = `
        \\begin{aligned}
        &\\text{【基本统计】 数据量 } N = ${N},\\quad \\text{平均数 } \\bar{x} = ${toFractionStr(mean)} \\approx ${mean.toFixed(2)},\\quad \\text{中位数 } Q_2 = \\mathbf{${median}} \\\\
        &\\text{【四分位数】 } Q_1 = \\mathbf{${Q1}},\\quad Q_3 = \\mathbf{${Q3}},\\quad \\text{四分位距 } \\mathrm{IQR} = Q_3 - Q_1 = \\mathbf{${IQR}},\\quad \\text{四分位偏差 } = ${IQR / 2} \\\\
        &\\text{【离散程度】 方差 } s^2 = \\frac{1}{N}\\sum(x_i - \\bar{x})^2 = \\mathbf{${variance.toFixed(2)}},\\quad \\text{标准差 } s = \\mathbf{${stdDev.toFixed(2)}}
        ${corrLatex}
        \\end{aligned}
      `;

      out.innerHTML = `
        <div class="tool-step-row">$$${latex}$$</div>
        <button class="btn btn-xs tool-paste-btn" type="button" data-paste="${latex}">贴到白板</button>
      `;
      renderMathIn(out);
      bindPasteBtn(out, '数据分析五数概括与相关性');

      if (canvas) drawBoxplot(canvas, data[0], Q1, median, Q3, data[N - 1]);
    };

    btn.addEventListener('click', runStats);
    runStats();
  }

  function drawBoxplot(canvas, min, Q1, med, Q3, max) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#F8F6F1';
    ctx.fillRect(0, 0, w, h);

    const pad = 44;
    const range = (max - min) || 1;
    const toX = v => pad + ((v - min) / range) * (w - 2 * pad);

    const y = h / 2 - 4;
    const boxH = 42;

    ctx.strokeStyle = '#23304A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(min), y);
    ctx.lineTo(toX(Q1), y);
    ctx.moveTo(toX(Q3), y);
    ctx.lineTo(toX(max), y);
    ctx.moveTo(toX(min), y - 12);
    ctx.lineTo(toX(min), y + 12);
    ctx.moveTo(toX(max), y - 12);
    ctx.lineTo(toX(max), y + 12);
    ctx.stroke();

    ctx.fillStyle = 'rgba(214, 112, 82, 0.14)';
    ctx.fillRect(toX(Q1), y - boxH / 2, toX(Q3) - toX(Q1), boxH);
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 2;
    ctx.strokeRect(toX(Q1), y - boxH / 2, toX(Q3) - toX(Q1), boxH);

    ctx.strokeStyle = '#2F4A7A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(toX(med), y - boxH / 2);
    ctx.lineTo(toX(med), y + boxH / 2);
    ctx.stroke();

    ctx.fillStyle = '#23304A';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Min: ${min}`, toX(min), y + 34);
    ctx.fillText(`Q1: ${Q1}`, toX(Q1), y - 27);
    ctx.fillText(`Med: ${med}`, toX(med), y + 34);
    ctx.fillText(`Q3: ${Q3}`, toX(Q3), y - 27);
    ctx.fillText(`Max: ${max}`, toX(max), y + 34);
  }

  // ─── Unit Tool Drawer & Auto-Recommendation Logic ───
  const TOOL_LABELS = {
    board: '手写演算白板',
    quad: '二次函数',
    expr: '数与式',
    trig: '图形与计量',
    prob: '排列组合·概率',
    integers: '整数性质',
    stats: '数据分析',
    geogebra: 'GeoGebra'
  };

  function openToolDrawer(toolName) {
    activeDrawerTool = toolName;
    const drawer = document.getElementById('tutorCalcDrawer');

    document.querySelectorAll('#toolTabsGroup .tool-tab').forEach(t => {
      t.classList.toggle('is-active', t.dataset.tool === toolName);
    });

    // Note: #toolPane-board is ALWAYS kept visible! Only calculator panes inside #tutorCalcDrawer are toggled.
    document.querySelectorAll('.calc-pane').forEach(p => {
      p.hidden = (p.id !== `toolPane-${toolName}`);
    });

    if (drawer) {
      drawer.hidden = (toolName === 'board');
    }

    if (toolName === 'geogebra') {
      const f = document.getElementById('geogebraFrame');
      if (f && f.getAttribute('src') === 'about:blank') {
        f.setAttribute('src', f.dataset.src);
      }
    }

    const viewMath = document.getElementById('view-math');
    if (viewMath) renderMathIn(viewMath);
    setTimeout(() => window.EJU_WHITEBOARD?.resize(), 40);
  }

  function autoSelectToolForCard(card) {
    if (!card) return;
    const t = `${card.topic || ''} ${card.q || ''}`;
    let targetTool = 'quad';

    if (/2次|二次|放物線|頂点|軸|最大値|最小値/.test(t)) {
      targetTool = 'quad';
    } else if (/数と式|絶対値|因数分解|根号|展開|分数|有理化|集合|命題/.test(t)) {
      targetTool = 'expr';
    } else if (/図形|三角比|正弦|余弦|外接円|内接円|面積|円|角/.test(t)) {
      targetTool = 'trig';
    } else if (/場合|確率|サイコロ|コイン|順列|組合せ|硬貨|袋/.test(t)) {
      targetTool = 'prob';
    } else if (/整数|約数|倍数|ユークリッド|互いに素|不定方程式|進法/.test(t)) {
      targetTool = 'integers';
    } else if (/データ|分散|標準偏差|四分位|箱ひげ|相関/.test(t)) {
      targetTool = 'stats';
    }

    recommendedTool = targetTool;

    // Update tab labels so the recommended tool for this card is clearly badged with ★推荐
    document.querySelectorAll('#toolTabsGroup .tool-tab').forEach(btn => {
      const key = btn.dataset.tool;
      const base = TOOL_LABELS[key] || btn.textContent;
      if (key === recommendedTool) {
        btn.innerHTML = `${base} <span class="rec-star">★本题推荐</span>`;
        btn.classList.add('is-recommended');
      } else {
        btn.textContent = base;
        btn.classList.remove('is-recommended');
      }
    });

    // If user currently has a calculator drawer open, automatically switch it to match the current question's unit
    // so a quadratic question NEVER shows a dice grid or unrelated calculator!
    if (activeDrawerTool !== 'board' && activeDrawerTool !== 'geogebra') {
      openToolDrawer(recommendedTool);
    }
  }

  function initAllTools() {
    if (initialized) return;
    initialized = true;

    initExprTool();
    initQuadTool();
    initTrigTool();
    initProbTool();
    initIntegersTool();
    initStatsTool();

    // Bind tool tab clicks
    document.querySelectorAll('#toolTabsGroup .tool-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tool = tab.dataset.tool;
        // Clicking the already-open calculator tab collapses it back to pure whiteboard
        if (tool !== 'board' && activeDrawerTool === tool) {
          openToolDrawer('board');
        } else {
          openToolDrawer(tool);
        }
      });
    });

    const closeDrawerBtn = document.getElementById('closeCalcDrawerBtn');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => openToolDrawer('board'));
    }

    const viewMath = document.getElementById('view-math');
    if (viewMath) renderMathIn(viewMath);
  }

  window.EJU_MATH_TOOLS = {
    init: initAllTools,
    autoSelect: autoSelectToolForCard,
    openTool: openToolDrawer
  };
})();
