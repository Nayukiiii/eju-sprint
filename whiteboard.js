// ═══════════════════════════════════════════════════════════════════
// EJU 数学讲题台 · 交互式手写白板 (友基 Ugee M708 压感与数位板深度优化引擎)
// ═══════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  let initialized = false;
  let canvas, ctx;
  let wrapEl;
  let activeCardId = null;

  // Drawing state
  let currentMode = 'pen'; // 'pen' | 'marker' | 'eraser' | 'lasso'
  let currentColor = '#23304A'; // '#23304A' (黑) | '#D67052' (赤陶) | '#2F4A7A' (蓝)
  let currentWidth = 2; // 2 (细) | 4 (中) | 8 (粗)
  let currentBg = 'grid'; // 'blank' | 'lined' | 'grid' | 'axes'
  let isDrawing = false;
  let isPanning = false;
  let isSpacePressed = false;

  // Canvas transform (infinite canvas pan & zoom)
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let startPanX = 0;
  let startPanY = 0;

  // Strokes data model: Array of strokes
  // Stroke: { id, mode, color, width, alpha, points: [{x, y, p}], type: 'path' | 'stamp' }
  let strokes = [];
  let undoStack = [];
  let redoStack = [];
  let currentStroke = null;

  // Snapshots for atomic undo on continuous actions (eraser drag / lasso move)
  let preActionSnapshot = null;
  let didModifyInAction = false;

  // Lasso selection
  let lassoPoints = [];
  let selectedStrokes = [];
  let isDraggingSelection = false;
  let selectionBox = null;
  let dragStartPos = { x: 0, y: 0 };

  // Ugee M708 Barrel Button / Stylus Detection
  let barrelButtonEraserEnabled = true;

  // Auto-save timer
  let autoSaveTimeout = null;

  function initWhiteboard() {
    canvas = document.getElementById('wbCanvas');
    wrapEl = document.getElementById('wbCanvasWrap');
    if (!canvas || !wrapEl) return;
    ctx = canvas.getContext('2d');

    if (initialized) {
      resizeCanvas();
      redrawCanvas();
      return;
    }
    initialized = true;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Attach Pointer Events with passive: false to capture Ugee M708 stylus pressure (8192 levels)
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Wheel zoom & pan
    wrapEl.addEventListener('wheel', onWheel, { passive: false });

    // Global keyboard shortcuts for Whiteboard
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    redrawCanvas();
  }

  function resizeCanvas() {
    if (!canvas || !wrapEl) return;
    const rect = wrapEl.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) return; // Hidden view; wait until visible
    const w = Math.floor(rect.width);
    const h = Math.max(500, Math.floor(rect.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      redrawCanvas();
    }
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const screenX = (e.clientX - rect.left) * scaleX;
    const screenY = (e.clientY - rect.top) * scaleY;
    // Map screen coordinates through inverse pan and zoom
    const x = (screenX - panX) / scale;
    const y = (screenY - panY) / scale;
    // Normalized pressure: Ugee M708 reports 0.0 - 1.0 (8192 levels)
    let p = typeof e.pressure === 'number' && e.pressure > 0 ? e.pressure : 0.5;
    if (e.pointerType === 'mouse') p = 0.5;
    return { x, y, p, screenX, screenY };
  }

  function onPointerDown(e) {
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const coords = getCanvasCoords(e);

    // Space + drag, pan mode, or middle mouse button -> pan infinite canvas
    if (isSpacePressed || currentMode === 'pan' || e.button === 1) {
      isPanning = true;
      startPanX = coords.screenX - panX;
      startPanY = coords.screenY - panY;
      wrapEl.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    // Check Ugee M708 stylus side button / barrel button or pen tail eraser
    // e.buttons === 2 (barrel right click) or e.buttons === 32 (pen tail eraser)
    let effectiveMode = currentMode;
    if (barrelButtonEraserEnabled && (e.buttons === 2 || e.buttons === 32 || e.button === 2 || e.button === 5)) {
      effectiveMode = 'eraser';
    }

    if (effectiveMode === 'lasso') {
      if (selectedStrokes.length && selectionBox && isPointInBox(coords.x, coords.y, selectionBox)) {
        isDraggingSelection = true;
        preActionSnapshot = JSON.stringify(strokes);
        didModifyInAction = false;
        dragStartPos = { x: coords.x, y: coords.y };
      } else {
        selectedStrokes = [];
        selectionBox = null;
        lassoPoints = [{ x: coords.x, y: coords.y }];
        isDrawing = true;
      }
      redrawCanvas();
      e.preventDefault();
      return;
    }

    isDrawing = true;
    preActionSnapshot = JSON.stringify(strokes);
    didModifyInAction = false;

    currentStroke = {
      id: 'str_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      mode: effectiveMode,
      color: currentColor,
      width: currentWidth,
      alpha: effectiveMode === 'marker' ? 0.35 : 1.0,
      points: [{ x: coords.x, y: coords.y, p: coords.p }]
    };

    if (effectiveMode === 'eraser') {
      eraseAt(coords.x, coords.y);
    } else {
      redrawCanvas();
    }

    e.preventDefault();
  }

  function onPointerMove(e) {
    const coords = getCanvasCoords(e);

    if (isPanning) {
      panX = coords.screenX - startPanX;
      panY = coords.screenY - startPanY;
      redrawCanvas();
      e.preventDefault();
      return;
    }

    if (!isDrawing && !isDraggingSelection) return;

    if (isDraggingSelection) {
      const dx = coords.x - dragStartPos.x;
      const dy = coords.y - dragStartPos.y;
      if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
        didModifyInAction = true;
      }
      dragStartPos = { x: coords.x, y: coords.y };
      for (const str of selectedStrokes) {
        if (str.points) {
          for (const pt of str.points) {
            pt.x += dx;
            pt.y += dy;
          }
        }
        if (str.type === 'stamp') {
          str.x += dx;
          str.y += dy;
        }
      }
      if (selectionBox) {
        selectionBox.minX += dx;
        selectionBox.maxX += dx;
        selectionBox.minY += dy;
        selectionBox.maxY += dy;
      }
      redrawCanvas();
      e.preventDefault();
      return;
    }

    if (currentMode === 'lasso') {
      lassoPoints.push({ x: coords.x, y: coords.y });
      redrawCanvas();
      e.preventDefault();
      return;
    }

    if (currentStroke) {
      if (barrelButtonEraserEnabled && (e.buttons === 2 || e.buttons === 32)) {
        currentStroke.mode = 'eraser';
      }

      if (currentStroke.mode === 'eraser') {
        eraseAt(coords.x, coords.y);
      } else {
        currentStroke.points.push({ x: coords.x, y: coords.y, p: coords.p });
        if (currentStroke.mode === 'marker') {
          // Redraw whole canvas so marker has uniform alpha without overlapping dot buildup
          redrawCanvas();
        } else {
          drawIncrementalSegment(currentStroke);
        }
      }
    }

    e.preventDefault();
  }

  function onPointerUp(e) {
    if (canvas && e && e.pointerId !== undefined) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (isPanning) {
      isPanning = false;
      if (wrapEl) wrapEl.style.cursor = isSpacePressed ? 'grab' : 'default';
      saveNow();
      return;
    }

    if (isDraggingSelection) {
      isDraggingSelection = false;
      if (didModifyInAction && preActionSnapshot) {
        pushRawUndoSnapshot(preActionSnapshot);
        saveNow();
      }
      preActionSnapshot = null;
      didModifyInAction = false;
      return;
    }

    if (currentMode === 'lasso' && isDrawing) {
      isDrawing = false;
      finishLassoSelection();
      redrawCanvas();
      return;
    }

    if (isDrawing && currentStroke) {
      isDrawing = false;
      if (currentStroke.mode === 'eraser') {
        if (didModifyInAction && preActionSnapshot) {
          pushRawUndoSnapshot(preActionSnapshot);
          saveNow();
        }
      } else if (currentStroke.points.length > 0) {
        if (preActionSnapshot) {
          pushRawUndoSnapshot(preActionSnapshot);
        }
        strokes.push(currentStroke);
        saveNow();
      }
      currentStroke = null;
      preActionSnapshot = null;
      didModifyInAction = false;
      redrawCanvas();
    }
  }

  function onWheel(e) {
    if (e.ctrlKey || isSpacePressed) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.min(3.0, Math.max(0.4, scale * zoomFactor));

      panX = mouseX - (mouseX - panX) * (newScale / scale);
      panY = mouseY - (mouseY - panY) * (newScale / scale);
      scale = newScale;
      redrawCanvas();
      triggerAutoSave();
    }
  }

  function onKeyDown(e) {
    const viewMath = document.getElementById('view-math');
    if (!viewMath || !viewMath.classList.contains('is-active')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (e.key === ' ' && !isSpacePressed) {
      e.preventDefault();
      isSpacePressed = true;
      if (wrapEl) wrapEl.style.cursor = 'grab';
    } else if (e.key === 'p' || e.key === 'P') {
      setMode('pen');
    } else if (e.key === 'm' || e.key === 'M') {
      setMode('marker');
    } else if (e.key === 'e' || e.key === 'E') {
      setMode('eraser');
    } else if (e.key === 'l' || e.key === 'L') {
      setMode('lasso');
    } else if (e.key === '[') {
      const widths = [2, 4, 8];
      const idx = widths.indexOf(currentWidth);
      setWidth(widths[Math.max(0, (idx === -1 ? 1 : idx) - 1)]);
    } else if (e.key === ']') {
      const widths = [2, 4, 8];
      const idx = widths.indexOf(currentWidth);
      setWidth(widths[Math.min(widths.length - 1, (idx === -1 ? 1 : idx) + 1)]);
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redo();
    }
  }

  function onKeyUp(e) {
    if (e.key === ' ') {
      isSpacePressed = false;
      if (wrapEl) wrapEl.style.cursor = 'crosshair';
    }
  }

  // Draw incremental segment smoothly for low-latency stylus stroke
  function drawIncrementalSegment(stroke) {
    const pts = stroke.points;
    if (pts.length < 2) return;
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = stroke.alpha || 1.0;

    const p0 = pts[pts.length - 2];
    const p1 = pts[pts.length - 1];

    // Ugee M708 pressure modulation
    const width = stroke.width * (0.35 + 1.3 * (p1.p || 0.5));
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    ctx.restore();
  }

  // Redraw all elements: background, grid/axes, strokes, lasso, stamps
  function redrawCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    renderBackground(currentBg);

    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    for (const str of strokes) {
      renderSingleStroke(str, selectedStrokes.includes(str));
    }

    if (currentStroke && currentStroke.mode !== 'eraser') {
      renderSingleStroke(currentStroke, false);
    }

    if (currentMode === 'lasso' && lassoPoints.length > 1) {
      renderLassoPolygon();
    }
    if (selectionBox) {
      renderSelectionBoundingBox();
    }

    ctx.restore();
  }

  function renderBackground(bgType) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#262624' : '#F8F6F1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (bgType === 'blank') return;

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    const left = -panX / scale;
    const top = -panY / scale;
    const right = left + canvas.width / scale;
    const bottom = top + canvas.height / scale;

    const gridColor = isDark ? '#363632' : '#ebe6dc';
    const lineColor = isDark ? '#3a3a36' : '#e4dfd3';
    const axisColor = isDark ? '#78756e' : '#A39E93';

    if (bgType === 'lined') {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      const step = 30;
      const startY = Math.floor(top / step) * step;
      ctx.beginPath();
      for (let y = startY; y <= bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.stroke();
    } else if (bgType === 'grid') {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.8;
      const step = 26;
      const startX = Math.floor(left / step) * step;
      const startY = Math.floor(top / step) * step;
      ctx.beginPath();
      for (let x = startX; x <= right; x += step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = startY; y <= bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.stroke();
    } else if (bgType === 'axes') {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.8;
      const step = 28;
      const startX = Math.floor(left / step) * step;
      const startY = Math.floor(top / step) * step;
      ctx.beginPath();
      for (let x = startX; x <= right; x += step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = startY; y <= bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.stroke();

      // Center axes at canvas midpoint (or world (canvas.width/2, canvas.height/2))
      const originX = Math.round((canvas.width / 2) / step) * step;
      const originY = Math.round((canvas.height / 2) / step) * step;

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(left, originY);
      ctx.lineTo(right, originY);
      ctx.moveTo(originX, top);
      ctx.lineTo(originX, bottom);
      ctx.stroke();

      ctx.fillStyle = axisColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('O', originX + 5, originY + 15);
      ctx.fillText('x', right - 18, originY - 6);
      ctx.fillText('y', originX + 8, top + 18);
    }
    ctx.restore();
  }

  function renderSingleStroke(str, isSelected) {
    if (str.type === 'stamp') {
      renderStampObject(str, isSelected);
      return;
    }

    const pts = str.points;
    if (!pts || !pts.length) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isSelected ? '#D67052' : str.color;

    // Highlighter / Marker mode: draw as a single continuous path with uniform translucency
    if (str.mode === 'marker') {
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = Math.max(14, (str.width || 4) * 3.6);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x + 0.5, pts[0].y);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.globalAlpha = str.alpha || 1.0;

    if (pts.length === 1) {
      const p = pts[0];
      const radius = (str.width * (0.35 + 1.3 * (p.p || 0.5))) / 2;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Pen with pressure sensitivity
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const w = str.width * (0.35 + 1.3 * (p1.p || 0.5));
      ctx.lineWidth = isSelected ? w + 1.5 : w;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderStampObject(stamp, isSelected) {
    ctx.save();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? '#30302d' : '#ffffff';
    ctx.strokeStyle = isSelected ? '#D67052' : (isDark ? '#4a4a45' : '#dcd6c8');
    ctx.lineWidth = isSelected ? 2 : 1.5;
    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(stamp.x, stamp.y, stamp.w, stamp.h, 8);
    } else {
      ctx.rect(stamp.x, stamp.y, stamp.w, stamp.h);
    }
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#D67052';
    ctx.font = 'bold 12.5px "Noto Sans SC", sans-serif';
    ctx.fillText(stamp.title || '【贴图】', stamp.x + 12, stamp.y + 22);

    ctx.fillStyle = isDark ? '#ece9e0' : '#23304A';
    ctx.font = '13.5px "Noto Sans SC", "Noto Sans JP", sans-serif';
    const lines = stamp.lines || [];
    lines.forEach((line, i) => {
      ctx.fillText(line, stamp.x + 12, stamp.y + 44 + i * 21);
    });

    ctx.restore();
  }

  function eraseAt(x, y) {
    const eraserRadius = Math.max(20, currentWidth * 4.5);
    let modified = false;

    const remaining = [];
    for (const str of strokes) {
      if (str.type === 'stamp') {
        const hit = x >= str.x && x <= str.x + str.w && y >= str.y && y <= str.y + str.h;
        if (hit) modified = true;
        else remaining.push(str);
        continue;
      }

      let hit = false;
      for (const pt of (str.points || [])) {
        if (Math.hypot(pt.x - x, pt.y - y) <= eraserRadius) {
          hit = true;
          break;
        }
      }
      if (hit) modified = true;
      else remaining.push(str);
    }

    if (modified) {
      didModifyInAction = true;
      strokes = remaining;
      redrawCanvas();
    }
  }

  function finishLassoSelection() {
    if (lassoPoints.length < 3) {
      lassoPoints = [];
      return;
    }
    selectedStrokes = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const str of strokes) {
      let isInside = false;
      if (str.type === 'stamp') {
        isInside = isPointInPolygon(str.x + str.w / 2, str.y + str.h / 2, lassoPoints);
      } else if (str.points) {
        let insideCount = 0;
        for (const pt of str.points) {
          if (isPointInPolygon(pt.x, pt.y, lassoPoints)) insideCount++;
        }
        if (insideCount > 0 && insideCount >= Math.min(2, str.points.length / 3)) {
          isInside = true;
        }
      }

      if (isInside) {
        selectedStrokes.push(str);
        if (str.type === 'stamp') {
          minX = Math.min(minX, str.x);
          minY = Math.min(minY, str.y);
          maxX = Math.max(maxX, str.x + str.w);
          maxY = Math.max(maxY, str.y + str.h);
        } else if (str.points) {
          for (const pt of str.points) {
            minX = Math.min(minX, pt.x);
            minY = Math.min(minY, pt.y);
            maxX = Math.max(maxX, pt.x);
            maxY = Math.max(maxY, pt.y);
          }
        }
      }
    }

    lassoPoints = [];
    if (selectedStrokes.length) {
      selectionBox = { minX: minX - 8, minY: minY - 8, maxX: maxX + 8, maxY: maxY + 8 };
    } else {
      selectionBox = null;
    }
  }

  function isPointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function isPointInBox(x, y, box) {
    return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
  }

  function renderLassoPolygon() {
    ctx.save();
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
      ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function renderSelectionBoundingBox() {
    ctx.save();
    ctx.strokeStyle = '#D67052';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      selectionBox.minX,
      selectionBox.minY,
      selectionBox.maxX - selectionBox.minX,
      selectionBox.maxY - selectionBox.minY
    );
    ctx.restore();
  }

  // ─── Undo & Redo (Snapshots recorded BEFORE mutation) ───
  function pushRawUndoSnapshot(jsonStr) {
    undoStack.push(jsonStr);
    if (undoStack.length > 40) undoStack.shift();
    redoStack = [];
  }

  function pushUndoState() {
    pushRawUndoSnapshot(JSON.stringify(strokes));
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(strokes));
    const prev = undoStack.pop();
    try {
      strokes = JSON.parse(prev);
    } catch (_) {}
    selectedStrokes = [];
    selectionBox = null;
    redrawCanvas();
    saveNow();
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(strokes));
    const next = redoStack.pop();
    try {
      strokes = JSON.parse(next);
    } catch (_) {}
    selectedStrokes = [];
    selectionBox = null;
    redrawCanvas();
    saveNow();
  }

  function clearCanvas() {
    if (strokes.length > 0) {
      pushUndoState();
    }
    strokes = [];
    currentStroke = null;
    isDrawing = false;
    selectedStrokes = [];
    selectionBox = null;
    redrawCanvas();
    saveNow();
  }

  // Convert LaTeX notation into clean readable Unicode math for Canvas text stamps
  function cleanLatexToReadable(str) {
    return String(str || '')
      .replace(/\\begin\{aligned\}|\\end\{aligned\}/g, '')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\mathrm\{([^}]*)\}/g, '$1')
      .replace(/\\mathbf\{([^}]*)\}/g, '$1')
      .replace(/\\d?frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\triangle/g, '△')
      .replace(/\\angle/g, '∠')
      .replace(/\\times|\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\implies|\\Rightarrow/g, '⇒')
      .replace(/\\iff|\\Leftrightarrow/g, '⇔')
      .replace(/\\le|\\leq/g, '≤')
      .replace(/\\ge|\\geq/g, '≥')
      .replace(/\\neq|\\ne/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\circ/g, '°')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sin/g, 'sin ')
      .replace(/\\cos/g, 'cos ')
      .replace(/\\tan/g, 'tan ')
      .replace(/\\gcd/g, 'gcd')
      .replace(/\\cdots/g, '…')
      .replace(/\\bar\{x\}/g, 'x̄')
      .replace(/\\quad|\\,|\\;/g, ' ')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^\{([^}]*)\}/g, '^($1)')
      .replace(/_\{([^}]*)\}/g, '_$1')
      .replace(/\\\\/g, '\n')
      .replace(/[&$]/g, '')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  // ─── Paste to Whiteboard (一键贴到白板) ───
  function pasteTextToBoard(title, text) {
    const cleaned = cleanLatexToReadable(text);
    const lines = [];
    const maxChars = 38;
    const rawLines = cleaned.split('\n').map(s => s.trim()).filter(Boolean);
    for (const raw of rawLines) {
      let cur = raw;
      while (cur.length > maxChars) {
        lines.push(cur.slice(0, maxChars));
        cur = cur.slice(maxChars);
      }
      if (cur) lines.push(cur);
    }

    const boxW = 390;
    const boxH = Math.max(72, 38 + lines.length * 21);

    // Offset slightly if multiple stamps exist
    const existingStamps = strokes.filter(s => s.type === 'stamp').length;
    const posX = -panX / scale + 20 + (existingStamps % 4) * 16;
    const posY = -panY / scale + 20 + (existingStamps % 4) * 16;

    const stamp = {
      id: 'stamp_' + Date.now(),
      type: 'stamp',
      title,
      lines,
      x: posX,
      y: posY,
      w: boxW,
      h: boxH
    };

    pushUndoState();
    strokes.push(stamp);
    redrawCanvas();
    saveNow();
  }

  // ─── Per-Card Auto-Save & Restore ───
  function setCardId(cardId) {
    if (activeCardId && activeCardId !== cardId) {
      saveCardWhiteboard(activeCardId);
    }
    activeCardId = cardId;
    loadCardWhiteboard(cardId);
  }

  function saveCardWhiteboard(cardId) {
    if (!cardId) return;
    try {
      const data = {
        strokes,
        bg: currentBg,
        panX,
        panY,
        scale,
        savedAt: Date.now()
      };
      localStorage.setItem('eju_wb_' + cardId, JSON.stringify(data));
    } catch (_) {}
  }

  function saveNow() {
    clearTimeout(autoSaveTimeout);
    if (activeCardId) saveCardWhiteboard(activeCardId);
  }

  function loadCardWhiteboard(cardId) {
    if (!cardId) return;
    strokes = [];
    undoStack = [];
    redoStack = [];
    currentStroke = null;
    isDrawing = false;
    selectedStrokes = [];
    selectionBox = null;
    scale = 1.0;
    panX = 0;
    panY = 0;

    try {
      const raw = localStorage.getItem('eju_wb_' + cardId);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.strokes)) {
          strokes = data.strokes;
          if (data.bg) {
            currentBg = data.bg;
            const sel = document.getElementById('wbBgSelect');
            if (sel) sel.value = currentBg;
          }
          if (typeof data.scale === 'number') scale = data.scale;
          if (typeof data.panX === 'number') panX = data.panX;
          if (typeof data.panY === 'number') panY = data.panY;
        }
      }
    } catch (_) {}

    resizeCanvas();
    redrawCanvas();
  }

  function triggerAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      if (activeCardId) saveCardWhiteboard(activeCardId);
    }, 400);
  }

  // ─── Fullscreen Whiteboard Toggle ───
  function toggleFullscreen() {
    const pane = document.getElementById('toolPane-board');
    if (!pane) return;
    pane.classList.toggle('is-fullscreen');
    const isFull = pane.classList.contains('is-fullscreen');
    const btn = document.getElementById('wbFullscreenBtn');
    if (btn) btn.textContent = isFull ? '退出全屏' : '全屏白板';
    setTimeout(resizeCanvas, 60);
  }

  // ─── Tool State Setters ───
  function setMode(mode) {
    currentMode = mode;
    selectedStrokes = [];
    selectionBox = null;
    // When switching to highlighter (marker), if color is dark black, switch to warm terracotta orange so highlighter is vibrant
    if (mode === 'marker' && currentColor === '#23304A') {
      setColor('#D67052');
    }
    document.querySelectorAll('[data-wb-mode]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.wbMode === mode);
    });
    redrawCanvas();
  }

  function setColor(color) {
    currentColor = color;
    document.querySelectorAll('[data-wb-color]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.wbColor === color);
    });
  }

  function setWidth(w) {
    currentWidth = w;
    document.querySelectorAll('[data-wb-width]').forEach(b => {
      b.classList.toggle('is-active', Number(b.dataset.wbWidth) === w);
    });
  }

  function setBg(bg) {
    currentBg = bg;
    const sel = document.getElementById('wbBgSelect');
    if (sel) sel.value = bg;
    redrawCanvas();
    saveNow();
  }

  function resetZoom() {
    scale = 1.0;
    panX = 0;
    panY = 0;
    redrawCanvas();
    saveNow();
  }

  window.EJU_WHITEBOARD = {
    init: initWhiteboard,
    resize: resizeCanvas,
    redraw: redrawCanvas,
    setCardId,
    setMode,
    setColor,
    setWidth,
    setBg,
    undo,
    redo,
    clear: clearCanvas,
    resetZoom,
    toggleFullscreen,
    pasteText: pasteTextToBoard,
    save: saveNow
  };
})();
