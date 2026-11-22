// Апгрейд студии: Заставка «От игрушки до фуры», поддержка iOS/iPhone, музыка, GigaChat/Алиса и мультипоиск
(function () {
  // Делаем APP_STATE доступным для всех внешних модулей
  if (typeof APP_STATE !== 'undefined') window.APP_STATE = APP_STATE;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // 1. Внедряем современные стили (заставка, матовое стекло, защита iOS от авто-зума)
  function injectModernStyles() {
    const st = document.createElement('style');
    st.textContent = `
      @supports (-webkit-touch-callout: none) {
        input, select, textarea { font-size: 16px !important; }
      }
      #ot-splash {
        position: fixed; inset: 0; z-index: 9999; background: radial-gradient(circle at 50% 35%, #111c3a 0%, #06080f 75%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        overflow: hidden; transition: opacity 0.55s ease, visibility 0.55s ease;
      }
      #ot-splash.hide { opacity: 0; visibility: hidden; pointer-events: none; }
      .splash-road {
        position: absolute; bottom: -25%; left: -50%; right: -50%; height: 62%;
        background-image:
          linear-gradient(to right, rgba(56,189,248,0.22) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99,102,241,0.28) 1px, transparent 1px);
        background-size: 46px 46px;
        transform: perspective(260px) rotateX(64deg);
        animation: roadRun 1.1s linear infinite;
        opacity: 0.55;
      }
      @keyframes roadRun { from { background-position: 0 0; } to { background-position: 0 46px; } }
      .splash-center { position: relative; z-index: 2; text-align: center; padding: 20px; width: 90%; max-width: 340px; }
      .splash-morph {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 18px; border-radius: 20px; background: rgba(15,23,42,0.72);
        border: 1px solid rgba(56,189,248,0.35); box-shadow: 0 12px 40px rgba(37,99,235,0.28);
        margin-bottom: 18px; position: relative; overflow: hidden;
      }
      .splash-toy { font-size: 26px; animation: bounceToy 1.2s ease-in-out infinite; }
      .splash-truck { font-size: 38px; filter: drop-shadow(0 0 12px rgba(56,189,248,0.75)); animation: driveTruck 1.3s ease-in-out infinite; }
      .splash-arrow { font-size: 16px; color: #38bdf8; font-weight: 800; letter-spacing: 3px; opacity: 0.85; }
      @keyframes bounceToy { 0%,100%{transform:translateY(0) scale(0.92);} 50%{transform:translateY(-5px) scale(1.06);} }
      @keyframes driveTruck { 0%,100%{transform:translateX(0);} 50%{transform:translateX(4px);} }
      .splash-title {
        font-size: 24px; font-weight: 900; letter-spacing: 0.04em; margin: 0;
        background: linear-gradient(90deg, #60a5fa, #22d3ee, #a78bfa);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }
      .splash-sub { font-size: 12px; font-weight: 700; color: #94a3b8; letter-spacing: 0.14em; text-transform: uppercase; margin: 5px 0 16px; }
      .splash-bar { width: 100%; height: 6px; border-radius: 99px; background: rgba(30,41,59,0.9); overflow: hidden; }
      .splash-bar-in { height: 100%; width: 10%; border-radius: 99px; background: linear-gradient(90deg, #2563eb, #22d3ee, #8b5cf6); animation: loadBar 1.5s ease-out forwards; }
      @keyframes loadBar { to { width: 100%; } }
      .splash-skip { margin-top: 14px; font-size: 11px; color: #64748b; }
    `;
    document.head.appendChild(st);
  }

  // 2. Анимированный экран загрузки «От игрушки до фуры»
  function showSplashScreen() {
    if (document.getElementById('ot-splash')) return;
    const el = document.createElement('div');
    el.id = 'ot-splash';
    el.innerHTML = `
      <div class="splash-road"></div>
      <div class="splash-center">
        <div class="splash-morph">
          <span class="splash-toy">🧸</span>
          <span class="splash-arrow">━━▸</span>
          <span class="splash-truck">🚛</span>
        </div>
        <h1 class="splash-title">3D БАЛОВСТВО</h1>
        <p class="splash-sub">От игрушки до фуры</p>
        <div class="splash-bar"><div class="splash-bar-in"></div></div>
        <div class="splash-skip">Нажми, чтобы пропустить</div>
      </div>
    `;
    const dismiss = () => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 600);
    };
    el.addEventListener('click', dismiss);
    document.body.appendChild(el);
    setTimeout(dismiss, 1750);
  }

  // 3. Чёткая PNG-иконка для iPhone / iPad (Safari игнорирует SVG из manifest.json)
  function injectAppleTouchIcon() {
    try {
      const c = document.createElement('canvas'); c.width = 180; c.height = 180;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 180, 180);
      g.addColorStop(0, '#1d4ed8'); g.addColorStop(1, '#4f46e5');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 180, 180);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(22, 68, 82, 52);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(108, 82, 46, 38);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(128, 90, 20, 15);
      [46, 86, 136].forEach(x => {
        ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(x, 126, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(x, 126, 6, 0, Math.PI * 2); ctx.fill();
      });
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = c.toDataURL('image/png');
      document.head.appendChild(link);
    } catch (e) {}
  }

  // 4. Патчи совместимости с iPhone / iPad (полный экран, видео MP4, Apple GPU)
  function applyIOSPatches() {
    // Полный экран на iOS
    if (typeof window.toggleFullscreen === 'function') {
      const origFs = window.toggleFullscreen;
      window.toggleFullscreen = function () {
        if (isIOS || (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen)) {
          showToast('На iPhone нажми «Поделиться» ⬆️ внизу Safari → «На экран „Домой“» для полного экрана!', 'info');
          return;
        }
        origFs();
      };
    }

    // Запись видео (MP4 для iOS Safari, WebM для Android/ПК)
    if (typeof window.record3DVideo === 'function') {
      window.record3DVideo = function () {
        if (APP_STATE.isRecording) return;
        const canvas = document.getElementById('viewport-canvas');
        if (!canvas?.captureStream || typeof MediaRecorder === 'undefined') {
          showToast('Твой браузер не поддерживает запись 3D-видео.', 'warning');
          return;
        }
        const mimes = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
        const mime = mimes.find(m => MediaRecorder.isTypeSupported(m)) || '';
        const ext = mime.includes('mp4') ? 'mp4' : 'webm';
        try {
          const rec = new MediaRecorder(canvas.captureStream(30), mime ? { mimeType: mime } : undefined);
          const chunks = [];
          rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
          rec.onstop = () => {
            APP_STATE.isRecording = false;
            const lbl = document.getElementById('record-label');
            if (lbl) lbl.textContent = 'Видео 360°';
            downloadBlob(new Blob(chunks, { type: mime || 'video/webm' }), `${sanitizeFilename(APP_STATE.currentBlueprint?.objectName)}_360.${ext}`);
            showToast(`Видео 360° (.${ext.toUpperCase()}) сохранено!`, 'success');
          };
          APP_STATE.isRecording = true; APP_STATE.autoOrbit = true; updateAutoOrbitUI();
          const lbl = document.getElementById('record-label');
          if (lbl) lbl.textContent = 'Запись...';
          showToast('Запись 360° (5 сек)...', 'info');
          rec.start();
          setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, 5000);
        } catch (err) {
          APP_STATE.isRecording = false;
          showToast('Ошибка записи: ' + err.message, 'error');
        }
      };
    }

    // Высокий профиль GPU для Apple iPhone / iPad
    if (typeof window.detectGPUProfile === 'function') {
      const origDetect = window.detectGPUProfile;
      window.detectGPUProfile = function (gl) {
        origDetect(gl);
        if (isIOS && APP_STATE.gpuProfile) {
          APP_STATE.gpuProfile.tier = 'high';
          APP_STATE.gpuProfile.pixelRatio = Math.min(window.devicePixelRatio || 2, 2);
          APP_STATE.gpuProfile.shadowSize = 1024;
          APP_STATE.gpuProfile.voxelGrid = 50;
          const badge = document.getElementById('gpu-badge');
          if (badge) badge.textContent = 'Apple GPU (HIGH)';
        }
      };
    }
  }

  // 5. Кнопка фоновой музыки в шапке + громкость в Справке + GigaChat и Алиса в ИИ-Мосте
  function injectHeaderMusicAndBridgeLinks() {
    const actions = document.querySelector('.header-actions');
    if (actions && !document.getElementById('btn-music-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'btn-music-toggle';
      btn.className = 'icon-btn';
      btn.textContent = '🔇';
      btn.title = 'Включить спокойную музыку';
      btn.onclick = () => {
        if (!window.AMBIENT_AUDIO) return;
        const on = window.AMBIENT_AUDIO.toggle();
        showToast(on ? '🎵 Спокойная фоновая музыка включена' : '🔇 Фоновая музыка выключена', 'info');
      };
      actions.insertBefore(btn, actions.firstChild);
    }

    // Ползунок громкости музыки в окне справки
    const helpBox = document.querySelector('#help-modal .modal-box');
    if (helpBox && !document.getElementById('music-vol-slider')) {
      const volCard = document.createElement('div');
      volCard.className = 'card';
      volCard.innerHTML = `
        <div class="slider-head"><span>🎵 Громкость фоновой музыки</span><span id="val-music-vol">28%</span></div>
        <input id="music-vol-slider" type="range" min="5" max="80" step="5" value="28" />
      `;
      helpBox.insertBefore(volCard, helpBox.children[2] || null);
      const sl = volCard.querySelector('#music-vol-slider');
      if (window.AMBIENT_AUDIO) {
        const curPct = Math.round(window.AMBIENT_AUDIO.getVolume() * 100);
        sl.value = curPct;
        volCard.querySelector('#val-music-vol').textContent = curPct + '%';
      }
      sl.addEventListener('input', e => {
        const pct = parseInt(e.target.value, 10);
        volCard.querySelector('#val-music-vol').textContent = pct + '%';
        if (window.AMBIENT_AUDIO) window.AMBIENT_AUDIO.setVolume(pct / 100);
      });
    }

    // Добавляем GigaChat и Яндекс Алису в ИИ-Мост (не ломая существующие кнопки)
    const bridgeCard = document.querySelector('#bridge-modal .card.emerald');
    if (bridgeCard && !document.getElementById('btn-open-gigachat')) {
      const rowRu = document.createElement('div');
      rowRu.className = 'grid-2';
      rowRu.innerHTML = `
        <a id="btn-open-gigachat" class="btn sm" style="text-decoration:none;" href="https://giga.chat" target="_blank" rel="noopener">🟢 GigaChat (Сбер) ↗</a>
        <a id="btn-open-alice" class="btn sm" style="text-decoration:none;" href="https://alice.yandex.ru" target="_blank" rel="noopener">🟣 Яндекс Алиса ↗</a>
      `;
      bridgeCard.appendChild(rowRu);
    }
  }

  window.__UPGRADE_PART1 = { injectModernStyles, showSplashScreen, injectAppleTouchIcon, applyIOSPatches, injectHeaderMusicAndBridgeLinks };
})();
(function () {
  // 6. Прижимаем спойлер на крыше КАМАЗа вплотную к кабине (исправление со скриншота)
  if (typeof window.buildTruckBlueprint === 'function') {
    const origTruck = window.buildTruckBlueprint;
    window.buildTruckBlueprint = function (withTrailer, cabColor) {
      const bp = origTruck(withTrailer, cabColor);
      bp.parts.forEach(p => {
        if (p.name === 'Спойлер на крыше' && p.position) p.position.y = 2.27;
      });
      return bp;
    };
  }

  // 7. Встраиваем блок «Мультипоиск по всем 3D-базам (автоперевод RU→EN)» во вкладку Текст→3D
  function injectMultiSearchUI() {
    const tabText = document.getElementById('tab-text');
    const genBtn = document.getElementById('btn-generate-text');
    if (!tabText || !genBtn || document.getElementById('btn-multi-search')) return;

    const searchBtn = document.createElement('button');
    searchBtn.id = 'btn-multi-search';
    searchBtn.className = 'btn';
    searchBtn.style.cssText = 'width:100%;padding:11px;background:rgba(16,185,129,0.18);border-color:rgba(16,185,129,0.5);color:#a7f3d0;';
    searchBtn.innerHTML = '🌍 Найти готовые 3D в базах (Автоперевод RU→EN)';
    searchBtn.onclick = () => runMultiBaseSearch();

    const resBox = document.createElement('div');
    resBox.id = 'multi-search-box';
    resBox.className = 'card emerald hidden';
    resBox.innerHTML = `
      <div class="row-between">
        <b id="multi-search-status" style="font-size:11px;color:#6ee7b7;">Поиск по базам...</b>
        <button class="btn sm" onclick="document.getElementById('multi-search-box').classList.add('hidden')">✕</button>
      </div>
      <div id="multi-search-grid" class="grid-2"></div>
    `;

    genBtn.insertAdjacentElement('afterend', searchBtn);
    searchBtn.insertAdjacentElement('afterend', resBox);
  }

  async function runMultiBaseSearch(customText) {
    if (!window.SEARCH_HUB) {
      showToast('Файл search_hub.js не подключён.', 'warning');
      return 0;
    }
    const q = (customText || document.getElementById('text-prompt-input')?.value || '').trim();
    if (!q) { showToast('Напиши любое слово по-русски (например: марсоход, шлем, лошадь, попугай).', 'warning'); return 0; }

    const box = document.getElementById('multi-search-box');
    const status = document.getElementById('multi-search-status');
    const grid = document.getElementById('multi-search-grid');
    if (box) box.classList.remove('hidden');
    if (status) status.textContent = `🌍 Переводим «${q}» и ищем в GitHub / Khronos / NASA / Wikimedia...`;
    if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:12px;font-size:11px;color:var(--muted);">Загружаем каталоги 3D-моделей...</div>';

    const data = await window.SEARCH_HUB.searchAllDatabases(q);
    window.SEARCH_HUB.renderSearchResults(grid, status, data, q);
    return data.items.length;
  }

  // 8. Автосброс режима «Фото» на «PBR» + умный автопоиск в базах при генерации по тексту
  if (typeof window.generate3DFromText === 'function') {
    window.generate3DFromText = async function () {
      if (APP_STATE.isGenerating) return;
      const prompt = document.getElementById('text-prompt-input').value.trim();
      if (!prompt) { showToast('Напиши, что собрать, или выбери заготовку.', 'warning'); return; }

      // Сбрасываем наложенное старое фото, чтобы оно не прилипало к новой 3D-модели!
      if (APP_STATE.renderMode === 'photo' && typeof setRenderMode === 'function') {
        setRenderMode('pbr');
      }

      APP_STATE.isGenerating = true;
      try {
        // 1. Сначала пробуем локальный конструктор и базу models_db.json
        let bp = generateLocalParametricBlueprint(prompt, APP_STATE.artStyle);
        if (bp) {
          if (window.innerWidth < 960) setMobileTab('viewport');
          pushUndoState();
          build3DModelFromBlueprint(bp, false);
          saveCurrentToSessionLibrary('Текст→3D');
          showToast(`Модель «${bp.objectName}» готова!`, 'success');
          return;
        }

        // 2. Если нет локально — автоматически ищем в 3D-базах с автопереводом!
        const foundCount = await runMultiBaseSearch(prompt);
        if (foundCount > 0) {
          showToast(`Нашлось моделей в базах: ${foundCount}! Нажми на любую карточку ниже.`, 'success');
          return;
        }

        // 3. Если включён Онлайн-ИИ (Pollinations) — пробуем его
        if (APP_STATE.useOnlineAI && typeof tryOnlinePollinations3D === 'function') {
          if (window.innerWidth < 960) setMobileTab('viewport');
          setLoadingUI(true, 'Онлайн-ИИ (без ключа)', 'Пробуем собрать редкую модель...', 65);
          bp = await tryOnlinePollinations3D(prompt);
          setLoadingUI(false);
          if (bp) {
            pushUndoState();
            build3DModelFromBlueprint(bp, false);
            saveCurrentToSessionLibrary('Онлайн ИИ');
            showToast(`Модель «${bp.objectName}» собрана!`, 'success');
            return;
          }
        }

        // 4. Крайний вариант — открываем бесплатный ИИ-Мост
        showToast('В базах этого нет — открываю бесплатный ИИ-Мост!', 'warning');
        document.getElementById('bridge-prompt-topic').value = prompt;
        toggleBridgeModal(true);
      } catch (err) {
        showToast(err.message || 'Ошибка сборки', 'error');
      } finally {
        APP_STATE.isGenerating = false;
        setLoadingUI(false);
      }
    };
  }

  // Запуск всех улучшений
  function bootUpgrades() {
    if (window.__UPGRADE_PART1) {
      window.__UPGRADE_PART1.injectModernStyles();
      window.__UPGRADE_PART1.injectAppleTouchIcon();
      window.__UPGRADE_PART1.applyIOSPatches();
      window.__UPGRADE_PART1.showSplashScreen();
      window.__UPGRADE_PART1.injectHeaderMusicAndBridgeLinks();
    }
    injectMultiSearchUI();
  }

  bootUpgrades();
})();
