// Вкладка «Рисунок → 3D»: рисуешь пальцем -> авто-таймер -> 3D + подбор похожих моделей из баз
(function () {
  const SKETCH = {
    strokes: [],
    drawing: false,
    mode: 'smart',       // 'smart' | 'extrude' | 'lathe'
    autoTimer: true,
    timerId: null,
    tickId: null,
    countdownMs: 2400,
    timeLeftMs: 0,
    canvas: null,
    ctx: null
  };

  function injectSketchTabUI() {
    const tabsGrid = document.querySelector('.studio-tabs-grid');
    const panelBody = document.querySelector('.panel-body');
    if (!tabsGrid || !panelBody || document.getElementById('tab-sketch')) return;

    // Расширяем верхнюю сетку вкладок до 5 кнопок
    tabsGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    const sketchBtn = document.createElement('button');
    sketchBtn.className = 'tab-btn';
    sketchBtn.dataset.tab = 'sketch';
    sketchBtn.innerHTML = '<span>✏️</span><span>Рисунок</span>';
    sketchBtn.onclick = () => setStudioTab('sketch');
    tabsGrid.insertBefore(sketchBtn, tabsGrid.children[2] || null);

    // Содержимое вкладки «Рисунок»
    const tabDiv = document.createElement('div');
    tabDiv.id = 'tab-sketch';
    tabDiv.className = 'hidden';
    tabDiv.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    tabDiv.innerHTML = `
      <div class="section-head">
        <h2 class="section-title">Нарисуй пальцем → 3D</h2>
        <span id="sketch-shape-badge" class="pill green">Жду рисунок</span>
      </div>

      <div class="card indigo" style="align-items:center;gap:8px;">
        <canvas id="sketch-canvas" width="280" height="280" style="width:100%;max-width:290px;aspect-ratio:1/1;border-radius:14px;background:#080d1a;border:2px dashed rgba(99,102,241,0.55);touch-action:none;cursor:crosshair;display:block;"></canvas>
        <div style="width:100%;display:flex;flex-direction:column;gap:4px;">
          <div class="row-between" style="font-size:11px;color:#cbd5e1;">
            <span id="sketch-timer-label">Нарисуй круг, куб, треугольник, кружку или любую фигуру</span>
          </div>
          <div class="progress-track" style="width:100%;margin-top:2px;height:5px;">
            <div id="sketch-timer-bar" class="progress-fill" style="width:0%;transition:width 0.1s linear;"></div>
          </div>
        </div>
        <div class="grid-3" style="width:100%;">
          <button class="btn sm" onclick="SKETCH_3D.undoStroke()">↶ Штрих</button>
          <button class="btn sm rose-soft" onclick="SKETCH_3D.clearCanvas()">🗑️ Очистить</button>
          <button class="btn sm active-green" onclick="SKETCH_3D.processNow()">🚀 В 3D</button>
        </div>
      </div>

      <div class="card">
        <div class="seg-group" style="grid-template-columns:repeat(3,1fr);">
          <button class="seg-btn active" data-skmode="smart" onclick="SKETCH_3D.setMode('smart')">🔮 Умный</button>
          <button class="seg-btn" data-skmode="extrude" onclick="SKETCH_3D.setMode('extrude')">📦 Выдавить</button>
          <button class="seg-btn" data-skmode="lathe" onclick="SKETCH_3D.setMode('lathe')">🏺 Крутить</button>
        </div>
        <label class="checkbox-row">
          <input id="chk-sketch-autotimer" type="checkbox" checked />
          <span><b>Авто-сборка через 2.4 сек</b> после паузы (с поиском похожих)</span>
        </label>
      </div>

      <div id="sketch-matches-box" class="card emerald hidden">
        <div class="row-between">
          <b id="sketch-matches-title" style="font-size:11px;color:#6ee7b7;">Похожие 3D-модели из баз</b>
        </div>
        <div id="sketch-matches-grid" class="grid-2"></div>
      </div>
    `;
    panelBody.appendChild(tabDiv);

    // Подключаем 5-ю вкладку к переключению setStudioTab
    if (typeof window.setStudioTab === 'function') {
      const origSetTab = window.setStudioTab;
      window.setStudioTab = function (tab) {
        origSetTab(tab);
        document.getElementById('tab-sketch')?.classList.toggle('hidden', tab !== 'sketch');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      };
    }

    initSketchCanvasEvents();
  }

  function initSketchCanvasEvents() {
    SKETCH.canvas = document.getElementById('sketch-canvas');
    if (!SKETCH.canvas) return;
    SKETCH.ctx = SKETCH.canvas.getContext('2d');
    redrawCanvas();

    const getPt = (clientX, clientY) => {
      const r = SKETCH.canvas.getBoundingClientRect();
      return {
        x: ((clientX - r.left) / r.width) * SKETCH.canvas.width,
        y: ((clientY - r.top) / r.height) * SKETCH.canvas.height
      };
    };

    const startDraw = (cx, cy) => {
      cancelAutoTimer();
      SKETCH.drawing = true;
      SKETCH.strokes.push([getPt(cx, cy)]);
      redrawCanvas();
    };

    const moveDraw = (cx, cy) => {
      if (!SKETCH.drawing || !SKETCH.strokes.length) return;
      const cur = SKETCH.strokes[SKETCH.strokes.length - 1];
      const pt = getPt(cx, cy);
      const last = cur[cur.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 3) {
        cur.push(pt);
        redrawCanvas();
      }
    };

    const endDraw = () => {
      if (!SKETCH.drawing) return;
      SKETCH.drawing = false;
      if (SKETCH.autoTimer && SKETCH.strokes.length > 0) startAutoTimer();
    };

    SKETCH.canvas.addEventListener('mousedown', e => startDraw(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => moveDraw(e.clientX, e.clientY));
    window.addEventListener('mouseup', endDraw);

    SKETCH.canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      startDraw(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    SKETCH.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      moveDraw(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    SKETCH.canvas.addEventListener('touchend', endDraw);

    document.getElementById('chk-sketch-autotimer')?.addEventListener('change', e => {
      SKETCH.autoTimer = e.target.checked;
      if (!SKETCH.autoTimer) cancelAutoTimer();
    });
  }

  function redrawCanvas() {
    const ctx = SKETCH.ctx, c = SKETCH.canvas;
    if (!ctx || !c) return;
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, c.width, c.height);

    // Лёгкая направляющая сетка
    ctx.strokeStyle = 'rgba(148,163,184,0.08)';
    ctx.lineWidth = 1;
    for (let i = 35; i < c.width; i += 35) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, c.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(c.width, i); ctx.stroke();
    }

    // Отрисовка штрихов с неоновым свечением
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 8;

    SKETCH.strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  }

  function cancelAutoTimer() {
    if (SKETCH.timerId) { clearTimeout(SKETCH.timerId); SKETCH.timerId = null; }
    if (SKETCH.tickId) { clearInterval(SKETCH.tickId); SKETCH.tickId = null; }
    const bar = document.getElementById('sketch-timer-bar');
    if (bar) bar.style.width = '0%';
  }

  function startAutoTimer() {
    cancelAutoTimer();
    SKETCH.timeLeftMs = SKETCH.countdownMs;
    const lbl = document.getElementById('sketch-timer-label');
    const bar = document.getElementById('sketch-timer-bar');
    const started = Date.now();

    SKETCH.tickId = setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(100, (elapsed / SKETCH.countdownMs) * 100);
      const sec = Math.max(0, (SKETCH.countdownMs - elapsed) / 1000).toFixed(1);
      if (bar) bar.style.width = pct + '%';
      if (lbl) lbl.textContent = `⏳ Собираем 3D и ищем похожие через ${sec} сек... (можно дорисовывать)`;
    }, 80);

    SKETCH.timerId = setTimeout(() => {
      cancelAutoTimer();
      processNow();
    }, SKETCH.countdownMs);
  }
    // Упрощение линии (алгоритм Дугласа-Пекера) для подсчёта углов фигуры
  function simplifyPoints(pts, eps) {
    if (pts.length <= 2) return pts;
    let maxD = 0, idx = 0;
    const a = pts[0], b = pts[pts.length - 1];
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs(dy * pts[i].x - dx * pts[i].y + b.x * a.y - b.y * a.x) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > eps) {
      const left = simplifyPoints(pts.slice(0, idx + 1), eps);
      const right = simplifyPoints(pts.slice(idx), eps);
      return left.slice(0, -1).concat(right);
    }
    return [a, b];
  }

  // Распознаёт, что нарисовал пользователь (круг, куб, треугольник, кружка, звезда, своё)
  function analyzeSketch(strokes) {
    const valid = strokes.filter(s => s.length >= 4);
    if (!valid.length) return null;

    let minX = 9999, minY = 9999, maxX = 0, maxY = 0;
    const allPts = [];
    valid.forEach(s => s.forEach(p => {
      allPts.push(p);
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }));

    const w = Math.max(10, maxX - minX), h = Math.max(10, maxY - minY);
    const diag = Math.hypot(w, h), aspect = w / h;
    const main = valid.reduce((best, s) => s.length > best.length ? s : best, valid[0]);

    // Если 2+ штриха и сбоку дорисован контур-ручка -> Кружка!
    if (valid.length >= 2 && aspect >= 0.7 && aspect <= 1.65) {
      const sorted = [...valid].sort((a, b) => b.length - a.length);
      const s2 = sorted[1];
      const s2MidX = s2.reduce((acc, p) => acc + p.x, 0) / s2.length;
      const bodyMidX = sorted[0].reduce((acc, p) => acc + p.x, 0) / sorted[0].length;
      if (Math.abs(s2MidX - bodyMidX) > w * 0.22) {
        return { kind: 'mug', label: 'Кружка ☕', searchWord: 'кружка', main, box: { minX, maxX, minY, maxY, w, h } };
      }
    }

    const start = main[0], end = main[main.length - 1];
    const closeRatio = Math.hypot(start.x - end.x, start.y - end.y) / diag;

    // Проверка на округлость (дисперсия расстояний от центра масс)
    const cx = main.reduce((a, p) => a + p.x, 0) / main.length;
    const cy = main.reduce((a, p) => a + p.y, 0) / main.length;
    const radii = main.map(p => Math.hypot(p.x - cx, p.y - cy));
    const avgR = radii.reduce((a, r) => a + r, 0) / radii.length || 1;
    const variance = radii.reduce((a, r) => a + Math.pow((r - avgR) / avgR, 2), 0) / radii.length;
    const stdDev = Math.sqrt(variance);

    const simp = simplifyPoints(main, Math.max(10, diag * 0.085));
    const corners = Math.max(1, simp.length - (closeRatio < 0.35 ? 1 : 0));

    if (closeRatio < 0.42 && stdDev < 0.19 && aspect > 0.68 && aspect < 1.45) {
      return { kind: 'circle', label: 'Круг / Шар ⚪', searchWord: 'шар', main, box: { minX, maxX, minY, maxY, w, h } };
    }
    if (closeRatio < 0.45 && corners === 3) {
      return { kind: 'triangle', label: 'Треугольник / Конус 🔺', searchWord: 'пирамида', main, box: { minX, maxX, minY, maxY, w, h } };
    }
    if (closeRatio < 0.45 && corners === 4) {
      return { kind: 'square', label: aspect > 1.5 ? 'Тягач / Блок 🚛' : 'Квадрат / Куб 🧊', searchWord: aspect > 1.5 ? 'грузовик' : 'куб', main, box: { minX, maxX, minY, maxY, w, h } };
    }
    if (closeRatio < 0.5 && corners >= 8 && stdDev > 0.22) {
      return { kind: 'star', label: 'Звезда / Кристалл ⭐', searchWord: 'звезда', main, box: { minX, maxX, minY, maxY, w, h } };
    }
    return { kind: 'freeform', label: 'Своя форма ✨', searchWord: aspect > 1.35 ? 'машина' : 'ваза', main, box: { minX, maxX, minY, maxY, w, h } };
  }

  // Превращает нарисованный контур или распознанную фигуру в 3D чертёж
  function buildBlueprintFromSketch(info) {
    const mode = SKETCH.mode;
    const { minX, maxX, minY, maxY, w, h } = info.box;
    const cx = (minX + maxX) * 0.5, cy = (minY + maxY) * 0.5;
    const scale = 2.0 / Math.max(w, h);

    if (mode === 'lathe') {
      const pts = simplifyPoints(info.main, 6);
      const profile = pts.map(p => ({
        r: Math.max(0.05, Math.abs(p.x - cx) * scale),
        y: Math.max(0, (maxY - p.y) * scale)
      })).sort((a, b) => a.y - b.y);
      if (profile.length < 3) profile.push({ r: 0.5, y: 0 }, { r: 0.6, y: 1.5 }, { r: 0.4, y: 2.0 });
      return {
        objectName: '3D-Вращение по рисунку', category: 'Рисунок → 3D',
        analysisNotes: 'Твой нарисованный контур прокручен на 360° вокруг оси.',
        animationStyle: 'turntable', recommendedLighting: 'studio',
        parts: [{ name: 'Тело вращения', type: 'lathe', position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, profile, color:'#38bdf8', materialTexture:'smooth', roughness:0.22, metalness:0.18, animationRole:'static' }]
      };
    }

    if (mode === 'smart') {
      if (info.kind === 'circle') {
        return {
          objectName: '3D-Шар (из рисунка)', category: 'Рисунок → 3D',
          analysisNotes: 'Распознан круг! Создан гладкий 3D-шар, а ниже подобраны похожие круглые модели из баз.',
          animationStyle: 'float', recommendedLighting: 'studio',
          parts: [{ name: 'Сфера', type: 'sphere', position:{x:0,y:1.0,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, radius:0.95, color:'#38bdf8', materialTexture:'smooth', roughness:0.18, metalness:0.35, animationRole:'rotate_y' }]
        };
      }
      if (info.kind === 'square') {
        const bw = Math.max(0.8, w * scale), bh = Math.max(0.8, h * scale);
        return {
          objectName: '3D-Куб / Блок (из рисунка)', category: 'Рисунок → 3D',
          analysisNotes: 'Распознан прямоугольник! Создан скруглённый 3D-блок с карбоновой фактурой.',
          animationStyle: 'showcase', recommendedLighting: 'studio',
          parts: [{ name: 'Скруглённый блок', type: 'roundedBox', position:{x:0,y:bh*0.5,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1}, width:bw, height:bh, depth:Math.min(bw, bh), bevel:0.12, color:'#6366f1', materialTexture:'carbon', roughness:0.28, metalness:0.45, animationRole:'static' }]
        };
      }
      if (info.kind === 'triangle') {
        return {
          objectName: '3D-Пирамида (из рисунка)', category: 'Рисунок → 3D',
          analysisNotes: 'Распознан треугольник! Собрана 3D-пирамида.',
          animationStyle: 'showcase', recommendedLighting: 'sunset',
          parts: [{ name: 'Пирамида', type: 'prism', sides: 4, position:{x:0,y:0.9,z:0}, rotation:{x:0,y:45,z:0}, scale:{x:1,y:1,z:1}, radiusTop:0.02, radiusBottom:1.05, height:1.8, color:'#f59e0b', materialTexture:'marble', roughness:0.32, metalness:0.25, animationRole:'static' }]
        };
      }
      if (info.kind === 'star') {
        return {
          objectName: '3D-Кристалл (из рисунка)', category: 'Рисунок → 3D',
          analysisNotes: 'Распознана звёздчатая фигура! Собран светящийся 3D-кристалл.',
          animationStyle: 'float', recommendedLighting: 'neon',
          parts: [{ name: 'Кристалл', type: 'crystal', position:{x:0,y:1.1,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1.3,z:1}, radius:0.9, color:'#a855f7', materialTexture:'smooth', roughness:0.12, metalness:0.65, emissive:'#7c3aed', emissiveIntensity:0.9, animationRole:'rotate_y' }]
        };
      }
      if (info.kind === 'mug' && typeof generateLocalParametricBlueprint === 'function') {
        return generateLocalParametricBlueprint('Керамическая оранжевая кружка полая внутри с ручкой', 'realistic');
      }
    }

    // Режим «Выдавить» или свободная фигура: превращаем ровно нарисованный контур в объёмный 3D-объект
    const simp = simplifyPoints(info.main, 5);
    const points = simp.slice(0, 48).map(p => ({
      x: Number(((p.x - cx) * scale).toFixed(3)),
      y: Number(((cy - p.y) * scale).toFixed(3))
    }));
    if (points.length < 3) points.push({ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0, y: 0.6 });

    return {
      objectName: `3D по рисунку (${info.label})`, category: 'Рисунок → 3D',
      analysisNotes: 'Твой рисунок выдавлен в чистый объёмный 3D-объект со скруглённой фаской.',
      animationStyle: 'showcase', recommendedLighting: 'studio',
      parts: [{
        name: 'Выдавленный контур', type: 'extrude', position:{x:0,y:1.0,z:0}, rotation:{x:0,y:0,z:0}, scale:{x:1,y:1,z:1},
        points, depth: 0.55, bevel: 0.08, color: '#22d3ee', materialTexture: 'smooth', roughness: 0.25, metalness: 0.35, animationRole: 'static'
      }]
    };
  }

  async function processNow() {
    cancelAutoTimer();
    const info = analyzeSketch(SKETCH.strokes);
    if (!info) { showToast('Сначала нарисуй фигуру пальцем на поле.', 'warning'); return; }

    const badge = document.getElementById('sketch-shape-badge');
    const lbl = document.getElementById('sketch-timer-label');
    if (badge) badge.textContent = info.label;
    if (lbl) lbl.textContent = `✅ Готово: ${info.label}. Ищу похожие модели в 3D-базах...`;

    if (typeof setRenderMode === 'function' && window.APP_STATE?.renderMode === 'photo') {
      setRenderMode('pbr');
    }

    const bp = buildBlueprintFromSketch(info);
    pushUndoState();
    build3DModelFromBlueprint(bp, false);
    saveCurrentToSessionLibrary('Рисунок');
    showToast(`Собрано: ${info.label}!`, 'success');

    // Параллельно подбираем похожие готовые модели из всех баз
    if (window.SEARCH_HUB) {
      const box = document.getElementById('sketch-matches-box');
      const grid = document.getElementById('sketch-matches-grid');
      const title = document.getElementById('sketch-matches-title');
      if (box) box.classList.remove('hidden');
      if (grid) grid.innerHTML = '<div style="grid-column:1/-1;font-size:11px;color:var(--muted);padding:8px;text-align:center;">Ищем похожие 3D-модели в базах...</div>';
      const res = await window.SEARCH_HUB.searchAllDatabases(info.searchWord);
      window.SEARCH_HUB.renderSearchResults(grid, title, res, info.searchWord);
    }
  }

  function clearCanvas() {
    cancelAutoTimer();
    SKETCH.strokes = [];
    redrawCanvas();
    const badge = document.getElementById('sketch-shape-badge');
    const lbl = document.getElementById('sketch-timer-label');
    if (badge) badge.textContent = 'Жду рисунок';
    if (lbl) lbl.textContent = 'Нарисуй круг, куб, треугольник, кружку или любую фигуру';
  }

  function undoStroke() {
    cancelAutoTimer();
    SKETCH.strokes.pop();
    redrawCanvas();
  }

  function setMode(m) {
    SKETCH.mode = m;
    document.querySelectorAll('[data-skmode]').forEach(b => b.classList.toggle('active', b.dataset.skmode === m));
  }

  window.SKETCH_3D = { processNow, clearCanvas, undoStroke, setMode, init: injectSketchTabUI };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectSketchTabUI);
  else injectSketchTabUI();
})();
                                                                                       
