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
  let currentMode = 'pen'; // pen | marker | eraser | lasso | pan | laser | line | circle | axes | text
  const SHAPE_MODES = ['line', 'circle', 'axes'];
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
  // Stroke: { id, mode, color, width, alpha, points: [{x, y, p}], t (start ms), d (duration ms),
  //           shape?: 'line' | 'circle' | 'axes' (two points: start/centre/origin and end/edge/extent) }
  // Stamp:  { id, type: 'stamp', kind?: 'text' | 'image', x, y, w, h, ... }
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
  // 防误触: fingers / palm on a touch screen pan instead of drawing; only the pen writes
  let penOnly = false;
  try { penOnly = localStorage.getItem('eju_wb_pen_only') === '1'; } catch (_) {}

  // Laser pointer trails (mine and the partner's), not saved: memberId -> [{x, y, at}]
  const LASER_MS = 1400;
  const laserTrails = {};
  // "Look here" rings: [{x, y, at}]
  let flashes = [];
  let animFrame = null;
  // Replay of the board in drawing order (null when not replaying)
  let replay = null;
  const images = {}; // src -> HTMLImageElement

  // Auto-save timer
  let autoSaveTimeout = null;

  // Study-group layers (filled by sync.js): partner layers are read-only, drawn under mine
  let partnerLayers = []; // [{memberId, name, strokes: []}]
  let liveStrokes = {}; // memberId -> in-progress stroke being drawn right now
  let pointers = {}; // memberId -> {x, y, name, at}
  let showMine = true;
  let showPartners = true;
  // Callbacks set by sync.js: onLayerChanged(cardId, strokes), onLive(cardId, stroke|null),
  // onPointer(cardId, {x, y}|null), onView(cardId, {cx, cy, scale})
  const hooks = {};

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

    if (replay) stopReplay();

    // Space + drag, pan mode, middle mouse button, or a finger while 防误触 is on -> pan infinite canvas
    if (isSpacePressed || currentMode === 'pan' || e.button === 1 || (penOnly && e.pointerType === 'touch')) {
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

    if (effectiveMode === 'laser') {
      isDrawing = true;
      addLaserPoint('me', coords.x, coords.y);
      if (activeCardId) hooks.onLaser?.(activeCardId, {x: coords.x, y: coords.y});
      e.preventDefault();
      return;
    }

    if (effectiveMode === 'text') {
      e.preventDefault();
      // Let the pointer sequence finish before the prompt blocks the page
      setTimeout(() => addTextStamp(coords.x, coords.y), 0);
      return;
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

    const shape = SHAPE_MODES.includes(effectiveMode) ? effectiveMode : null;
    currentStroke = {
      id: 'str_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      mode: shape ? 'pen' : effectiveMode,
      color: currentColor,
      width: currentWidth,
      alpha: effectiveMode === 'marker' ? 0.35 : 1.0,
      t: Date.now(),
      points: shape
        ? [{ x: coords.x, y: coords.y, p: 0.5 }, { x: coords.x, y: coords.y, p: 0.5 }]
        : [{ x: coords.x, y: coords.y, p: coords.p }]
    };
    if (shape) currentStroke.shape = shape;

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

    if (!isDrawing && !isDraggingSelection) {
      if (activeCardId) hooks.onPointer?.(activeCardId, {x: coords.x, y: coords.y});
      return;
    }

    if (currentMode === 'laser' && isDrawing) {
      addLaserPoint('me', coords.x, coords.y);
      if (activeCardId) hooks.onLaser?.(activeCardId, {x: coords.x, y: coords.y});
      e.preventDefault();
      return;
    }

    if (currentStroke?.shape) {
      currentStroke.points[1] = snapShapeEnd(currentStroke, coords, e.shiftKey);
      if (activeCardId) hooks.onLive?.(activeCardId, currentStroke);
      redrawCanvas();
      e.preventDefault();
      return;
    }

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
        if (activeCardId) hooks.onLive?.(activeCardId, currentStroke);
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
      reportView();
      return;
    }

    if (currentMode === 'laser' && isDrawing) {
      isDrawing = false;
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
      } else if (currentStroke.points.length > 0 && !isTinyShape(currentStroke)) {
        if (preActionSnapshot) {
          pushRawUndoSnapshot(preActionSnapshot);
        }
        currentStroke.d = Date.now() - (currentStroke.t || Date.now());
        strokes.push(currentStroke);
        saveNow();
      }
      currentStroke = null;
      preActionSnapshot = null;
      didModifyInAction = false;
      if (activeCardId) hooks.onLive?.(activeCardId, null);
      redrawCanvas();
    }
  }

  function reportView() {
    if (!activeCardId || !canvas) return;
    hooks.onView?.(activeCardId, {
      cx: (canvas.width / 2 - panX) / scale,
      cy: (canvas.height / 2 - panY) / scale,
      scale
    });
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
      reportView();
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
    } else if (e.key === 'r' || e.key === 'R') {
      setMode('laser');
    } else if (e.key === 't' || e.key === 'T') {
      setMode('text');
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

    // Smooth: curve from the midpoint of the previous segment to the midpoint of this one
    const n = pts.length;
    const p1 = pts[n - 2];
    const p2 = pts[n - 1];
    const p0 = n > 2 ? pts[n - 3] : p1;
    ctx.lineWidth = stroke.width * (0.35 + 1.3 * (p1.p || 0.5));
    ctx.beginPath();
    ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
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

    if (replay) {
      renderReplayFrame();
      ctx.restore();
      return;
    }

    // Pasted images (original exam pages, photos) sit under all ink, whoever pasted them
    const isImage = str => str.kind === 'image';
    if (showPartners) for (const layer of partnerLayers) for (const str of layer.strokes) if (isImage(str)) renderSingleStroke(str, false, true);
    if (showMine) for (const str of strokes) if (isImage(str)) renderSingleStroke(str, selectedStrokes.includes(str));

    if (showPartners) {
      for (const layer of partnerLayers) {
        for (const str of layer.strokes) if (!isImage(str)) renderSingleStroke(str, false, true);
      }
      for (const live of Object.values(liveStrokes)) {
        if (live && live.mode !== 'eraser') renderSingleStroke(live, false, true);
      }
    }

    if (showMine) {
      for (const str of strokes) {
        if (!isImage(str)) renderSingleStroke(str, selectedStrokes.includes(str));
      }
    }

    if (currentStroke && currentStroke.mode !== 'eraser') {
      renderSingleStroke(currentStroke, false);
    }

    if (showPartners) renderPointers();
    renderLasers();
    renderFlashes();

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

  function renderSingleStroke(str, isSelected, isPartner = false) {
    if (str.type === 'stamp') {
      renderStampObject(str, isSelected);
      return;
    }

    const pts = str.points;
    if (!pts || !pts.length) return;

    if (str.shape) {
      renderShape(str, isSelected, isPartner);
      return;
    }

    // The partner's ink keeps its colour but sits on a soft mustard halo, so layers are told apart
    if (isPartner && str.mode !== 'marker') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(240, 184, 87, 0.45)';
      ctx.lineWidth = (str.width || 2) * 1.6 + 6;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (pts.length === 1) ctx.lineTo(pts[0].x + 0.5, pts[0].y);
      ctx.stroke();
      ctx.restore();
    }

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

    // Pen with pressure sensitivity, smoothed: quadratic curves through segment midpoints
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const w = str.width * (0.35 + 1.3 * (p2.p || 0.5));
      ctx.lineWidth = isSelected ? w + 1.5 : w;
      ctx.beginPath();
      ctx.moveTo(i > 0 ? (p0.x + p1.x) / 2 : p1.x, i > 0 ? (p0.y + p1.y) / 2 : p1.y);
      if (i === pts.length - 2) ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
      else ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Shapes: straight line, circle, coordinate axes (stored as two points) ───
  function snapShapeEnd(stroke, coords, free) {
    const a = stroke.points[0];
    let {x, y} = coords;
    if (stroke.shape === 'line' && !free) {
      // Snap to horizontal / vertical / 45° when close, so 補助線 come out straight
      const ang = Math.atan2(y - a.y, x - a.x);
      const snapped = Math.round(ang / (Math.PI / 4)) * (Math.PI / 4);
      if (Math.abs(ang - snapped) < 0.07) {
        const len = Math.hypot(x - a.x, y - a.y);
        x = a.x + len * Math.cos(snapped);
        y = a.y + len * Math.sin(snapped);
      }
    }
    return {x, y, p: 0.5};
  }

  function isTinyShape(str) {
    if (!str.shape) return false;
    const [a, b] = str.points;
    return Math.hypot(b.x - a.x, b.y - a.y) < 4;
  }

  function shapePaths(str) {
    const [a, b] = str.points;
    if (str.shape === 'line') return [[a, b]];
    if (str.shape === 'circle') {
      const r = Math.hypot(b.x - a.x, b.y - a.y);
      const pts = [];
      for (let i = 0; i <= 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        pts.push({x: a.x + r * Math.cos(t), y: a.y + r * Math.sin(t)});
      }
      return [pts];
    }
    // axes: origin a, half-extent |b - a| on each axis, arrowheads on +x and +y
    const ex = Math.max(20, Math.abs(b.x - a.x));
    const ey = Math.max(20, Math.abs(b.y - a.y));
    const h = 9;
    return [
      [{x: a.x - ex, y: a.y}, {x: a.x + ex, y: a.y}],
      [{x: a.x, y: a.y + ey}, {x: a.x, y: a.y - ey}],
      [{x: a.x + ex - h, y: a.y - h * 0.6}, {x: a.x + ex, y: a.y}, {x: a.x + ex - h, y: a.y + h * 0.6}],
      [{x: a.x - h * 0.6, y: a.y - ey + h}, {x: a.x, y: a.y - ey}, {x: a.x + h * 0.6, y: a.y - ey + h}]
    ];
  }

  function renderShape(str, isSelected, isPartner) {
    const paths = shapePaths(str);
    const w = str.width * 1.0;
    const tracePaths = () => {
      ctx.beginPath();
      for (const path of paths) {
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    };
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (isPartner) {
      ctx.strokeStyle = 'rgba(240, 184, 87, 0.45)';
      ctx.lineWidth = w * 1.6 + 6;
      tracePaths();
    }
    ctx.strokeStyle = isSelected ? '#D67052' : str.color;
    ctx.lineWidth = isSelected ? w + 1.5 : w;
    tracePaths();
    if (str.shape === 'axes') {
      const [a, b] = str.points;
      const ex = Math.max(20, Math.abs(b.x - a.x));
      const ey = Math.max(20, Math.abs(b.y - a.y));
      ctx.fillStyle = str.color;
      ctx.font = 'italic 15px "Times New Roman", serif';
      ctx.fillText('x', a.x + ex - 4, a.y + 18);
      ctx.fillText('y', a.x + 8, a.y - ey + 6);
      ctx.fillText('O', a.x - 15, a.y + 16);
    }
    ctx.restore();
  }

  function distToSegment(x, y, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / len2)) : 0;
    return Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
  }

  function strokeHit(str, x, y, r) {
    if (str.shape) {
      return shapePaths(str).some(path => path.some((pt, i) => i > 0 && distToSegment(x, y, path[i - 1], pt) <= r));
    }
    return (str.points || []).some(pt => Math.hypot(pt.x - x, pt.y - y) <= r);
  }

  // ─── Text and images on the board (stamps) ───
  function addTextStamp(x, y) {
    const text = window.prompt('写在白板上的文字（可以多行，用 / 分行）：', '');
    if (!text || !text.trim()) return;
    const lines = text.split('/').map(s => s.trim()).filter(Boolean);
    ctx.save();
    ctx.font = TEXT_FONT;
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 8;
    ctx.restore();
    pushUndoState();
    strokes.push({
      id: 'txt_' + Date.now(), type: 'stamp', kind: 'text', lines, color: currentColor,
      x, y: y - 18, w, h: lines.length * 26 + 8, t: Date.now()
    });
    redrawCanvas();
    saveNow();
  }

  // Put an image (e.g. the question's original page) on the board, at the top-left of the current view
  function addImageStamp(src, title) {
    loadImage(src, img => {
      const w = Math.min(640, img.naturalWidth || 640);
      const h = img.naturalWidth ? w * img.naturalHeight / img.naturalWidth : 400;
      pushUndoState();
      strokes.push({
        id: 'img_' + Date.now(), type: 'stamp', kind: 'image', src, title: title || '',
        x: -panX / scale + 20, y: -panY / scale + 20, w, h, t: Date.now()
      });
      redrawCanvas();
      saveNow();
    });
  }

  function loadImage(src, onReady) {
    let img = images[src];
    if (!img) {
      img = images[src] = new Image();
      img.onload = () => { redrawCanvas(); onReady?.(img); onReady = null; };
      img.src = src;
    } else if (img.complete && img.naturalWidth) {
      onReady?.(img);
    } else if (onReady) {
      img.addEventListener('load', () => onReady(img), {once: true});
    }
    return img;
  }

  const TEXT_FONT = '20px "PingFang SC", "Microsoft YaHei", "Hiragino Sans", sans-serif';

  // ─── Laser pointer & "look here" (drawn on top, fade out, never saved) ───
  function addLaserPoint(memberId, x, y) {
    const trail = (laserTrails[memberId] = laserTrails[memberId] || []);
    trail.push({x, y, at: Date.now()});
    if (trail.length > 300) trail.splice(0, trail.length - 300);
    startAnimating();
  }

  function flashAt(x, y) {
    flashes.push({x, y, at: Date.now()});
    startAnimating();
  }

  function startAnimating() {
    if (animFrame) return;
    const tick = () => {
      animFrame = null;
      const now = Date.now();
      for (const id of Object.keys(laserTrails)) {
        laserTrails[id] = laserTrails[id].filter(p => now - p.at < LASER_MS);
        if (!laserTrails[id].length) delete laserTrails[id];
      }
      flashes = flashes.filter(f => now - f.at < 1800);
      redrawCanvas();
      if (Object.keys(laserTrails).length || flashes.length || replay) animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
  }

  function renderLasers() {
    const now = Date.now();
    for (const trail of Object.values(laserTrails)) {
      for (let i = 1; i < trail.length; i++) {
        const age = (now - trail[i].at) / LASER_MS;
        if (age >= 1) continue;
        ctx.save();
        ctx.strokeStyle = `rgba(230, 40, 40, ${0.85 * (1 - age)})`;
        ctx.shadowColor = 'rgba(255, 60, 60, 0.9)';
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';
        ctx.lineWidth = 5 / scale;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
        ctx.restore();
      }
      const last = trail[trail.length - 1];
      if (last && now - last.at < LASER_MS) {
        ctx.save();
        ctx.fillStyle = 'rgba(230, 40, 40, 0.95)';
        ctx.shadowColor = 'rgba(255, 60, 60, 1)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 6 / scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function renderFlashes() {
    const now = Date.now();
    for (const f of flashes) {
      const k = (now - f.at) / 1800;
      for (const delay of [0, 0.3]) {
        const t = k - delay;
        if (t < 0 || t > 0.7) continue;
        ctx.save();
        ctx.strokeStyle = `rgba(214, 112, 82, ${1 - t / 0.7})`;
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (12 + 70 * t) / scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // ─── Replay: redraw every stroke (both layers) in the order it was written ───
  function boardTimeline() {
    const items = [];
    if (showPartners) for (const layer of partnerLayers) for (const s of layer.strokes) items.push({s, partner: true});
    if (showMine) for (const s of strokes) items.push({s, partner: false});
    // Images first (they sit under the ink), then strokes in writing order
    items.sort((a, b) => (b.s.kind === 'image') - (a.s.kind === 'image') || (a.s.t || 0) - (b.s.t || 0));
    // Compress pauses: each stroke takes its own drawing time (at most 2.5 s), with 0.25 s between strokes
    let clock = 0;
    for (const it of items) {
      it.start = clock;
      it.dur = it.s.type === 'stamp' || it.s.shape ? 250 : Math.min(2500, Math.max(150, it.s.d || 400));
      clock += it.dur + 250;
    }
    return {items, total: clock};
  }

  function startReplay(speed = 1) {
    const timeline = boardTimeline();
    if (!timeline.items.length) return false;
    replay = {...timeline, speed, startedAt: Date.now()};
    hooks.onReplay?.(true);
    startAnimating();
    return true;
  }

  function stopReplay() {
    if (!replay) return;
    replay = null;
    hooks.onReplay?.(false);
    redrawCanvas();
  }

  function renderReplayFrame() {
    const elapsed = (Date.now() - replay.startedAt) * replay.speed;
    for (const it of replay.items) {
      if (elapsed < it.start) break;
      const part = Math.min(1, (elapsed - it.start) / it.dur);
      if (part >= 1 || it.s.type === 'stamp' || it.s.shape) {
        renderSingleStroke(it.s, false, it.partner);
      } else {
        const n = Math.max(1, Math.ceil(it.s.points.length * part));
        renderSingleStroke({...it.s, points: it.s.points.slice(0, n)}, false, it.partner);
      }
    }
    if (elapsed > replay.total + 600) setTimeout(stopReplay, 0);
  }

  // ─── Export the whole board (both layers) as a PNG ───
  function contentBounds(list) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const add = (x, y) => { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); };
    for (const s of list) {
      if (s.type === 'stamp') { add(s.x, s.y); add(s.x + s.w, s.y + s.h); continue; }
      const paths = s.shape ? shapePaths(s) : [s.points || []];
      for (const path of paths) for (const p of path) add(p.x, p.y);
    }
    return minX === Infinity ? null : {minX: minX - 30, minY: minY - 30, maxX: maxX + 30, maxY: maxY + 30};
  }

  function exportImage() {
    const all = [...(showPartners ? partnerLayers.flatMap(l => l.strokes) : []), ...(showMine ? strokes : [])];
    const b = contentBounds(all);
    if (!b) return null;
    const k = Math.min(2, 4000 / Math.max(b.maxX - b.minX, b.maxY - b.minY));
    const out = document.createElement('canvas');
    out.width = Math.ceil((b.maxX - b.minX) * k);
    out.height = Math.ceil((b.maxY - b.minY) * k);
    // Render with the normal pipeline by swapping in the export canvas and view
    const saved = {canvas, ctx, panX, panY, scale, selectedStrokes, selectionBox};
    canvas = out;
    ctx = out.getContext('2d');
    scale = k;
    panX = -b.minX * k;
    panY = -b.minY * k;
    selectedStrokes = [];
    selectionBox = null;
    try {
      redrawCanvas();
      return out.toDataURL('image/png');
    } finally {
      ({canvas, ctx, panX, panY, scale, selectedStrokes, selectionBox} = saved);
      redrawCanvas();
    }
  }

  // Partner's pen position, so "look here" works over a video call
  function renderPointers() {
    const fresh = Date.now() - 4000;
    for (const p of Object.values(pointers)) {
      if (!p || p.at < fresh) continue;
      ctx.save();
      ctx.fillStyle = '#D67052';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 / scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = `${12 / scale}px "Noto Sans SC", sans-serif`;
      ctx.fillStyle = '#23304A';
      ctx.fillText(p.name || '', p.x + 9 / scale, p.y - 8 / scale);
      ctx.restore();
    }
  }

  function renderStampObject(stamp, isSelected) {
    if (stamp.kind === 'text') {
      ctx.save();
      ctx.fillStyle = isSelected ? '#D67052' : (stamp.color || '#23304A');
      ctx.font = TEXT_FONT;
      (stamp.lines || []).forEach((line, i) => ctx.fillText(line, stamp.x + 4, stamp.y + 22 + i * 26));
      ctx.restore();
      return;
    }
    if (stamp.kind === 'image') {
      const img = loadImage(stamp.src);
      ctx.save();
      if (img.complete && img.naturalWidth) ctx.drawImage(img, stamp.x, stamp.y, stamp.w, stamp.h);
      else {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(stamp.x, stamp.y, stamp.w, stamp.h);
      }
      ctx.strokeStyle = isSelected ? '#D67052' : 'rgba(35, 48, 74, 0.18)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(stamp.x, stamp.y, stamp.w, stamp.h);
      ctx.restore();
      return;
    }
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

      const hit = strokeHit(str, x, y, eraserRadius);
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
    partnerLayers = [];
    liveStrokes = {};
    pointers = {};
    if (replay) stopReplay();
    for (const k of Object.keys(laserTrails)) delete laserTrails[k];
    flashes = [];
    loadCardWhiteboard(cardId);
    hooks.onCardOpened?.(cardId);
  }

  // ─── Study-group API (used by sync.js) ───
  function setPartnerLayers(cardId, layers) {
    if (cardId !== activeCardId) return;
    partnerLayers = layers;
    redrawCanvas();
  }

  // My own layer changed on another of my devices
  function replaceOwnStrokes(cardId, ownStrokes) {
    if (cardId !== activeCardId) {
      try {
        const raw = localStorage.getItem('eju_wb_' + cardId);
        const data = raw ? JSON.parse(raw) : {};
        data.strokes = ownStrokes;
        data.savedAt = Date.now();
        localStorage.setItem('eju_wb_' + cardId, JSON.stringify(data));
      } catch (_) {}
      return true;
    }
    if (isDrawing || isDraggingSelection) return false; // mid-gesture: caller retries
    strokes = ownStrokes;
    selectedStrokes = [];
    selectionBox = null;
    try {
      const raw = localStorage.getItem('eju_wb_' + cardId);
      const data = raw ? JSON.parse(raw) : {};
      data.strokes = strokes;
      localStorage.setItem('eju_wb_' + cardId, JSON.stringify(data));
    } catch (_) {}
    redrawCanvas();
    return true;
  }

  function setLive(cardId, memberId, stroke) {
    if (cardId !== activeCardId) return;
    if (stroke) liveStrokes[memberId] = stroke;
    else delete liveStrokes[memberId];
    redrawCanvas();
  }

  function addRemoteLaser(cardId, memberId, point) {
    if (cardId !== activeCardId || !point) return;
    addLaserPoint(memberId, point.x, point.y);
  }

  // Partner asked me to look at a spot: centre the view there and pulse a ring
  function lookAt(cardId, view) {
    if (cardId !== activeCardId || !view) return;
    setView(view);
    flashAt(view.cx, view.cy);
  }

  // Where I'm looking now (centre of my view), for "请看这里"
  function currentView() {
    if (!canvas) return null;
    return {cx: (canvas.width / 2 - panX) / scale, cy: (canvas.height / 2 - panY) / scale, scale};
  }

  function setPenOnly(on) {
    penOnly = Boolean(on);
    try { localStorage.setItem('eju_wb_pen_only', penOnly ? '1' : '0'); } catch (_) {}
  }

  function setPointer(cardId, memberId, point) {
    if (cardId !== activeCardId) return;
    if (point) pointers[memberId] = {...point, at: Date.now()};
    else delete pointers[memberId];
    redrawCanvas();
  }

  // Follow mode: centre my view where the partner is looking
  function setView(view) {
    if (!canvas || !view) return;
    scale = Math.min(3.0, Math.max(0.4, view.scale || 1));
    panX = canvas.width / 2 - view.cx * scale;
    panY = canvas.height / 2 - view.cy * scale;
    redrawCanvas();
  }

  function setLayerVisibility(mine, partners) {
    showMine = mine;
    showPartners = partners;
    redrawCanvas();
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
    hooks.onLayerChanged?.(cardId, strokes);
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
    save: saveNow,
    hooks,
    activeCardId: () => activeCardId,
    ownStrokes: cardId => {
      if (cardId === activeCardId) return strokes;
      try {
        return JSON.parse(localStorage.getItem('eju_wb_' + cardId) || '{}').strokes || [];
      } catch (_) {
        return [];
      }
    },
    setPartnerLayers,
    replaceOwnStrokes,
    setLive,
    setPointer,
    setView,
    setLayerVisibility,
    addRemoteLaser,
    lookAt,
    currentView,
    flashAt,
    addImage: addImageStamp,
    setPenOnly,
    penOnly: () => penOnly,
    startReplay,
    stopReplay,
    isReplaying: () => Boolean(replay),
    exportImage
  };
})();
