// Мультипоиск по бесплатным 3D-базам (GitHub, Khronos, NASA, Wikimedia STL) + автоперевод RU -> EN
(function () {
  const RU_EN_DICT = {
    'камаз': 'truck', 'тягач': 'truck', 'грузовик': 'truck', 'фура': 'truck', 'прицеп': 'trailer',
    'машина': 'car', 'авто': 'car', 'спорткар': 'car', 'гиперкар': 'car', 'тачка': 'car',
    'внедорожник': 'suv', 'джип': 'jeep', 'автобус': 'bus', 'поезд': 'train', 'танк': 'tank',
    'мотоцикл': 'motorcycle', 'байк': 'bike', 'велосипед': 'bicycle', 'самокат': 'scooter',
    'самолёт': 'airplane', 'самолет': 'airplane', 'истребитель': 'fighter', 'вертолёт': 'helicopter',
    'вертолет': 'helicopter', 'дрон': 'drone', 'квадрокоптер': 'drone', 'ракета': 'rocket',
    'спутник': 'satellite', 'марсоход': 'rover', 'луноход': 'rover', 'космос': 'space',
    'астронавт': 'astronaut', 'космонавт': 'astronaut', 'скафандр': 'spacesuit', 'станция': 'station',
    'планета': 'planet', 'луна': 'moon', 'марс': 'mars', 'земля': 'earth', 'астероид': 'asteroid',
    'корабль': 'ship', 'лодка': 'boat', 'яхта': 'boat', 'субмарина': 'submarine',
    'кружка': 'mug', 'чашка': 'cup', 'стакан': 'cup', 'бокал': 'glass', 'ваза': 'vase',
    'бутылка': 'bottle', 'чайник': 'teapot', 'кофемашина': 'coffee', 'тарелка': 'plate',
    'блюдце': 'saucer', 'ложка': 'spoon', 'вилка': 'fork', 'нож': 'knife', 'авокадо': 'avocado',
    'яблоко': 'apple', 'банан': 'banana', 'пицца': 'pizza', 'торт': 'cake', 'сыр': 'cheese',
    'шлем': 'helmet', 'маска': 'mask', 'очки': 'glasses', 'часы': 'watch', 'кольцо': 'ring',
    'ботинок': 'shoe', 'кроссовок': 'shoe', 'обувь': 'shoe', 'шляпа': 'hat', 'корона': 'crown',
    'меч': 'sword', 'катана': 'sword', 'щит': 'shield', 'топор': 'axe', 'лук': 'bow',
    'пистолет': 'gun', 'пушка': 'cannon', 'ключ': 'key', 'молоток': 'hammer', 'шестерня': 'gear',
    'шестерёнка': 'gear', 'болт': 'bolt', 'гайка': 'nut', 'винт': 'screw', 'двигатель': 'engine',
    'мотор': 'engine', 'колесо': 'wheel', 'руль': 'wheel', 'фонарь': 'lantern', 'лампа': 'lamp',
    'светильник': 'lamp', 'камера': 'camera', 'фотоаппарат': 'camera', 'телефон': 'phone',
    'смартфон': 'phone', 'ноутбук': 'laptop', 'компьютер': 'computer', 'монитор': 'monitor',
    'наушники': 'headphones', 'колонка': 'boombox', 'магнитофон': 'boombox', 'гитара': 'guitar',
    'пианино': 'piano', 'барабан': 'drum', 'микрофон': 'microphone', 'телевизор': 'tv',
    'робот': 'robot', 'солдат': 'soldier', 'человек': 'human', 'голова': 'head', 'череп': 'skull',
    'рука': 'hand', 'сердце': 'heart', 'звезда': 'star', 'кристалл': 'crystal', 'алмаз': 'diamond',
    'дом': 'house', 'здание': 'building', 'замок': 'castle', 'башня': 'tower', 'мост': 'bridge',
    'стол': 'table', 'стул': 'chair', 'кресло': 'chair', 'диван': 'sofa', 'кровать': 'bed',
    'шкаф': 'cabinet', 'дверь': 'door', 'окно': 'window', 'лестница': 'stairs',
    'дерево': 'tree', 'цветок': 'flower', 'кактус': 'cactus', 'гриб': 'mushroom', 'гора': 'mountain',
    'кот': 'cat', 'кошка': 'cat', 'собака': 'dog', 'лошадь': 'horse', 'конь': 'horse',
    'утка': 'duck', 'птица': 'bird', 'попугай': 'parrot', 'фламинго': 'flamingo', 'аист': 'stork',
    'рыба': 'fish', 'акула': 'shark', 'кит': 'whale', 'дракон': 'dragon', 'динозавр': 'dinosaur',
    'медведь': 'bear', 'волк': 'wolf', 'лиса': 'fox', 'лев': 'lion', 'слон': 'elephant',
    'обезьяна': 'monkey', 'паук': 'spider', 'бабочка': 'butterfly', 'жук': 'bug', 'комар': 'mosquito',
    'круг': 'sphere', 'шар': 'sphere', 'мяч': 'ball', 'куб': 'cube', 'квадрат': 'box',
    'треугольник': 'pyramid', 'пирамида': 'pyramid', 'конус': 'cone', 'цилиндр': 'cylinder',
    'игрушка': 'toy', 'шахматы': 'chess', 'кость': 'dice', 'сундук': 'chest', 'бочка': 'barrel'
  };

  // Встроенный каталог проверенных прямых .GLB моделей из официального репозитория Three.js (GitHub)
  const THREE_CURATED_GLB = [
    { name: 'Феррари (Спорткар)', en: 'ferrari car supercar sport', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/ferrari.glb', source: 'GitHub 3D' },
    { name: 'Робот-помощник', en: 'robot expressive bot character', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/RobotExpressive/RobotExpressive.glb', source: 'GitHub 3D' },
    { name: 'Попугай 3D', en: 'parrot bird animal fly', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Parrot.glb', source: 'GitHub 3D' },
    { name: 'Фламинго 3D', en: 'flamingo bird pink animal', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Flamingo.glb', source: 'GitHub 3D' },
    { name: 'Аист 3D', en: 'stork bird white animal', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Stork.glb', source: 'GitHub 3D' },
    { name: 'Лошадь 3D', en: 'horse animal gallop', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Horse.glb', source: 'GitHub 3D' },
    { name: 'Солдат 3D', en: 'soldier human character', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Soldier.glb', source: 'GitHub 3D' },
    { name: 'Ионный двигатель (Космос)', en: 'engine space sci-fi thruster turbine', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/PrimaryIonDrive.glb', source: 'GitHub 3D' },
    { name: 'Скульптура головы', en: 'head face bust human', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb', source: 'GitHub 3D' },
    { name: 'Цветок 3D', en: 'flower plant nature', url: 'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/models/gltf/Flower/Flower.glb', source: 'GitHub 3D' }
  ];

  let khronosCache = null;
  let nasaCache = null;

  async function fetchWithTimeout(url, ms = 7500) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      return r;
    } catch (e) {
      clearTimeout(t);
      throw e;
    }
  }

  // Перевод запроса с русского на английский (Словарь -> MyMemory API)
  async function translateToEnglish(rawText) {
    const clean = (rawText || '').trim().toLowerCase();
    if (!clean) return '';
    if (!/[а-яё]/i.test(clean)) return clean;

    // 1. Быстрый офлайн-словарь по словам
    const words = clean.replace(/[^а-яёa-z0-9\s-]/gi, ' ').split(/\s+/).filter(Boolean);
    const dictHits = [];
    words.forEach(w => {
      if (RU_EN_DICT[w]) dictHits.push(RU_EN_DICT[w]);
      else {
        for (const [ru, en] of Object.entries(RU_EN_DICT)) {
          if (w.length >= 4 && (w.startsWith(ru.slice(0, 4)) || ru.startsWith(w))) {
            dictHits.push(en);
            break;
          }
        }
      }
    });
    if (dictHits.length > 0) return [...new Set(dictHits)].join(' ');

    // 2. Бесплатный онлайн-переводчик MyMemory (без ключа, CORS открыт)
    try {
      const resp = await fetchWithTimeout(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=ru|en`, 4000);
      if (resp.ok) {
        const data = await resp.json();
        const tr = (data?.responseData?.translatedText || '').trim().toLowerCase();
        if (tr && !tr.includes('mymemory warning')) return tr.replace(/[^a-z0-9\s-]/gi, ' ').trim();
      }
    } catch (e) {}

    return clean;
  }
    // База 1: Khronos glTF Sample Assets (официальный GitHub каталог PBR .GLB)
  async function loadKhronosIndex() {
    if (khronosCache) return khronosCache;
    try {
      const saved = JSON.parse(localStorage.getItem('khronos_idx_v1') || 'null');
      if (saved && Date.now() - saved.ts < 86400000 * 3) { khronosCache = saved.list; return khronosCache; }
    } catch (e) {}
    try {
      const r = await fetchWithTimeout('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/model-index.json', 7000);
      if (!r.ok) return [];
      const arr = await r.json();
      const list = [];
      arr.forEach(m => {
        const glbName = m?.variants?.['glTF-Binary'];
        if (!glbName) return;
        const base = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/${encodeURIComponent(m.name)}`;
        list.push({
          name: m.label || m.name,
          en: `${m.name} ${m.label || ''} ${(m.tags || []).join(' ')}`.toLowerCase(),
          url: `${base}/glTF-Binary/${encodeURIComponent(glbName)}`,
          thumb: m.screenshot ? `${base}/${m.screenshot}` : '',
          format: 'glb',
          source: 'Khronos PBR'
        });
      });
      khronosCache = list;
      try { localStorage.setItem('khronos_idx_v1', JSON.stringify({ ts: Date.now(), list })); } catch (e) {}
      return list;
    } catch (e) { return []; }
  }

  // База 2: NASA 3D Resources (350+ бесплатных .GLB на GitHub)
  async function loadNasaIndex() {
    if (nasaCache) return nasaCache;
    try {
      const saved = JSON.parse(localStorage.getItem('nasa_idx_v1') || 'null');
      if (saved && Date.now() - saved.ts < 86400000 * 5) { nasaCache = saved.list; return nasaCache; }
    } catch (e) {}
    try {
      const r = await fetchWithTimeout('https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1', 7500);
      if (!r.ok) return [];
      const data = await r.json();
      const list = (data.tree || [])
        .filter(f => f.type === 'blob' && /\.glb$/i.test(f.path) && (!f.size || f.size < 16 * 1024 * 1024))
        .map(f => {
          const fname = f.path.split('/').pop().replace(/\.glb$/i, '').replace(/[_-]+/g, ' ');
          const encPath = f.path.split('/').map(encodeURIComponent).join('/');
          return {
            name: fname,
            en: `${fname} ${f.path} space nasa`.toLowerCase(),
            url: `https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/${encPath}`,
            thumb: '',
            format: 'glb',
            source: 'NASA 3D'
          };
        });
      nasaCache = list;
      try { localStorage.setItem('nasa_idx_v1', JSON.stringify({ ts: Date.now(), list })); } catch (e) {}
      return list;
    } catch (e) { return []; }
  }

  // База 3: Wikimedia Commons (тысячи бесплатных .STL файлов с превью!)
  async function searchWikimediaSTL(enQuery) {
    if (!enQuery) return [];
    try {
      const q = `${enQuery} .stl`;
      const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=10&prop=imageinfo&iiprop=url|size&iiurlwidth=220&format=json&origin=*`;
      const r = await fetchWithTimeout(api, 6500);
      if (!r.ok) return [];
      const data = await r.json();
      const pages = Object.values(data?.query?.pages || {});
      return pages
        .filter(p => {
          const info = p?.imageinfo?.[0];
          return info && /\.stl$/i.test(info.url || '') && (info.size || 0) < 14 * 1024 * 1024;
        })
        .map(p => {
          const info = p.imageinfo[0];
          const cleanName = (p.title || '').replace(/^File:/i, '').replace(/\.stl$/i, '').replace(/[_-]+/g, ' ');
          return {
            name: cleanName.slice(0, 36),
            en: cleanName.toLowerCase(),
            url: info.url,
            thumb: info.thumburl || '',
            format: 'stl',
            source: 'Wikimedia STL'
          };
        });
    } catch (e) { return []; }
  }

  function matchScore(haystack, tokens) {
    let score = 0;
    const h = (haystack || '').toLowerCase();
    tokens.forEach(tok => {
      if (tok.length < 2) return;
      if (h.includes(tok)) score += 3;
      else if (tok.length >= 4 && h.includes(tok.slice(0, 4))) score += 1;
    });
    return score;
  }

  // Главный мультипоиск по всем базам сразу
  async function searchAllDatabases(queryText) {
    const raw = (queryText || '').trim();
    if (!raw) return { translated: '', items: [] };

    const enQuery = await translateToEnglish(raw);
    const tokens = [...new Set(`${raw.toLowerCase()} ${enQuery}`.split(/\s+/).filter(w => w.length >= 2))];
    const results = [];

    // 1. Локальный конструктор (мгновенно)
    if (typeof generateLocalParametricBlueprint === 'function') {
      const localBp = generateLocalParametricBlueprint(raw, window.APP_STATE?.artStyle || 'realistic');
      if (localBp) {
        results.push({
          id: 'loc_' + Date.now(),
          name: localBp.objectName,
          source: 'Своя база (Офлайн)',
          format: 'blueprint',
          blueprint: localBp,
          thumb: '',
          score: 100
        });
      }
    }

    // 2. Поиск по встроенному каталогу GitHub Three.js GLB
    THREE_CURATED_GLB.forEach((m, i) => {
      const sc = matchScore(`${m.name} ${m.en}`, tokens);
      if (sc > 0) results.push({ ...m, id: 't3_' + i, format: 'glb', score: sc + 10 });
    });

    // 3. Параллельный поиск по Khronos, NASA и Wikimedia STL
    const [khrRes, nasaRes, wikiRes] = await Promise.allSettled([
      loadKhronosIndex(),
      loadNasaIndex(),
      searchWikimediaSTL(enQuery)
    ]);

    if (khrRes.status === 'fulfilled') {
      khrRes.value.forEach((m, i) => {
        const sc = matchScore(m.en, tokens);
        if (sc > 0) results.push({ ...m, id: 'khr_' + i, score: sc + 8 });
      });
    }
    if (nasaRes.status === 'fulfilled') {
      nasaRes.value.forEach((m, i) => {
        const sc = matchScore(m.en, tokens);
        if (sc > 0) results.push({ ...m, id: 'nasa_' + i, score: sc + 6 });
      });
    }
    if (wikiRes.status === 'fulfilled') {
      wikiRes.value.forEach((m, i) => {
        results.push({ ...m, id: 'wiki_' + i, score: 5 });
      });
    }

    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    return { translated: enQuery, items: results.slice(0, 18) };
  }
    // Загрузка выбранной модели (.GLB / .STL / Blueprint) прямо на сцену
  async function loadSearchItem(item) {
    if (!item) return;
    if (typeof setRenderMode === 'function' && window.APP_STATE?.renderMode === 'photo') {
      setRenderMode('pbr');
    }

    if (item.format === 'blueprint' && item.blueprint) {
      pushUndoState();
      build3DModelFromBlueprint(item.blueprint, false);
      saveCurrentToSessionLibrary('База');
      if (window.innerWidth < 960) setMobileTab('viewport');
      showToast(`Загружено: ${item.name}`, 'success');
      return;
    }

    if (window.innerWidth < 960) setMobileTab('viewport');
    setLoadingUI(true, `Загрузка из ${item.source}`, `Скачиваем 3D-файл «${item.name}»...`, 42);

    try {
      const resp = await fetchWithTimeout(item.url, 22000);
      if (!resp.ok) throw new Error(`Сервер вернул код ${resp.status}`);
      const buf = await resp.arrayBuffer();
      setLoadingUI(true, 'Сборка 3D-сцены', 'Обрабатываем геометрию и материалы...', 78);

      if (item.format === 'stl') {
        const positions = parseSTLBuffer(buf);
        if (!positions || positions.length < 9) throw new Error('Пустой STL файл');
        const geoId = 'ext_stl_' + Date.now();
        SCANNED_MESH_STORE[geoId] = { positions, normals: null, colors: null, indices: null };
        const bp = {
          objectName: item.name,
          category: item.source,
          analysisNotes: `Загружено напрямую из ${item.source}. Можно красить, вращать и сохранять в .GLB/.STL.`,
          animationStyle: 'turntable',
          recommendedLighting: 'studio',
          parts: [{
            name: item.name, type: 'scannedMesh', scannedGeoId: geoId,
            position: { x: 0, y: 0, z: 0 }, rotation: { x: -90, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 },
            color: '#cbd5e1', materialTexture: 'smooth', roughness: 0.34, metalness: 0.35, animationRole: 'static'
          }]
        };
        pushUndoState();
        build3DModelFromBlueprint(bp, false);
        saveCurrentToSessionLibrary('STL База');
        showToast(`Открыта 3D-модель «${item.name}»!`, 'success');
      } else if (item.format === 'glb') {
        if (!THREE.GLTFLoader) throw new Error('Не загружен GLTFLoader.js');
        await new Promise((resolve, reject) => {
          new THREE.GLTFLoader().parse(buf, '', (gltf) => {
            gltf.scene.updateMatrixWorld(true);
            const parts = [];
            let idx = 0;
            gltf.scene.traverse(obj => {
              if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
              const geo = obj.geometry.clone();
              geo.applyMatrix4(obj.matrixWorld);
              const pos = new Float32Array(geo.attributes.position.array);
              const norm = geo.attributes.normal ? new Float32Array(geo.attributes.normal.array) : null;
              const col = geo.attributes.color ? new Float32Array(geo.attributes.color.array) : null;
              const ind = geo.index ? new Uint32Array(geo.index.array) : null;
              const geoId = `ext_glb_${Date.now()}_${idx++}`;
              SCANNED_MESH_STORE[geoId] = { positions: pos, normals: norm, colors: col, indices: ind };
              const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
              const hex = mat?.color ? '#' + mat.color.getHexString() : '#cbd5e1';
              parts.push({
                name: obj.name || `Деталь ${idx}`, type: 'scannedMesh', scannedGeoId: geoId,
                position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 },
                color: hex, materialTexture: 'smooth',
                roughness: typeof mat?.roughness === 'number' ? mat.roughness : 0.38,
                metalness: typeof mat?.metalness === 'number' ? mat.metalness : 0.25,
                opacity: typeof mat?.opacity === 'number' ? mat.opacity : 1.0,
                animationRole: 'static'
              });
              geo.dispose();
            });
            if (!parts.length) return reject(new Error('В .GLB нет геометрии'));
            const bp = {
              objectName: item.name,
              category: item.source,
              analysisNotes: `Загружено напрямую из ${item.source} (${parts.length} дет.).`,
              animationStyle: 'turntable',
              recommendedLighting: 'studio',
              parts
            };
            pushUndoState();
            build3DModelFromBlueprint(bp, false);
            saveCurrentToSessionLibrary(item.source.split(' ')[0]);
            showToast(`Загружена модель «${item.name}»!`, 'success');
            resolve();
          }, () => reject(new Error('Ошибка разбора .GLB')));
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Не удалось загрузить модель: ' + (err.message || 'нет связи'), 'error');
    } finally {
      setLoadingUI(false);
    }
  }

  // Отрисовка найденных карточек в указанный контейнер
  function renderSearchResults(containerEl, statusEl, data, rawQuery) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    if (statusEl) {
      statusEl.textContent = data.translated && data.translated !== rawQuery.toLowerCase()
        ? `🌍 Запрос: «${rawQuery}» → «${data.translated}» • Найдено: ${data.items.length}`
        : `🔍 Найдено в базах: ${data.items.length}`;
    }

    if (!data.items.length) {
      containerEl.innerHTML = `<div style="grid-column:1/-1;padding:10px;text-align:center;font-size:11px;color:var(--muted);">В открытых базах по «${rawQuery}» ничего не нашлось. Попробуй другое слово или ИИ-Мост 🤖.</div>`;
      return;
    }

    data.items.forEach(item => {
      const card = document.createElement('button');
      card.className = 'lib-card';
      card.style.textAlign = 'left';
      card.onclick = () => loadSearchItem(item);
      const previewHtml = item.thumb
        ? `<img src="${item.thumb}" alt="" loading="lazy" onerror="this.style.display='none'" />`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(135deg,#0f172a,#1e1b4b);">${item.format === 'stl' ? '🖨️' : item.source.includes('NASA') ? '🚀' : '🧊'}</div>`;
      card.innerHTML = `
        <div class="lib-thumb">
          ${previewHtml}
          <span class="lib-tag">${item.source}</span>
        </div>
        <div class="lib-info">
          <p class="lib-name">${item.name}</p>
          <p class="lib-sub">Формат: .${(item.format || '3d').toUpperCase()}</p>
        </div>`;
      containerEl.appendChild(card);
    });
  }

  window.SEARCH_HUB = {
    translateToEnglish,
    searchAllDatabases,
    loadSearchItem,
    renderSearchResults
  };
})();
            
