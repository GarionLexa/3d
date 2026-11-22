// Мягкий генеративный эмбиент (тёплое электропианино + пэд + эхо)
// 100% офлайн, без авторских прав, без писклявого MIDI
(function () {
  const STORAGE_KEY = 'balovstvo_music_cfg_v1';
  let ctx = null;
  let masterGain = null;
  let delayNode = null;
  let isPlaying = false;
  let stepTimer = null;
  let stepIndex = 0;
  let volume = 0.28;

  // Спокойная последовательность аккордов (Fmaj9 -> Em7 -> Dm9 -> Cmaj9)
  const CHORDS = [
    { pad: [174.61, 220.00, 261.63, 329.63], arp: [349.23, 440.00, 523.25, 659.25, 587.33] },
    { pad: [164.81, 196.00, 246.94, 293.66], arp: [329.63, 392.00, 493.88, 587.33, 493.88] },
    { pad: [146.83, 220.00, 261.63, 329.63], arp: [293.66, 349.23, 440.00, 523.25, 659.25] },
    { pad: [130.81, 196.00, 246.94, 329.63], arp: [261.63, 329.63, 392.00, 493.88, 523.25] }
  ];

  function loadCfg() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (typeof saved.volume === 'number') volume = Math.max(0.05, Math.min(0.8, saved.volume));
    } catch (e) {}
  }

  function saveCfg() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume })); } catch (e) {}
  }

  function initAudio() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();

    masterGain = ctx.createGain();
    masterGain.gain.value = volume;

    // Мягкий стерео-эффект пространства (эхо через фильтр тёплых частот)
    delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = 0.42;

    const fbFilter = ctx.createBiquadFilter();
    fbFilter.type = 'lowpass';
    fbFilter.frequency.value = 950;

    const fbGain = ctx.createGain();
    fbGain.gain.value = 0.32;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.36;

    delayNode.connect(fbFilter);
    fbFilter.connect(fbGain);
    fbGain.connect(delayNode);
    fbFilter.connect(wetGain);
    wetGain.connect(masterGain);

    masterGain.connect(ctx.destination);
  }

  // Тёплая нота «пим» (мягкое фетровое электропианино / калимба)
  function playSoftKey(freq, dur = 2.6, gainPeak = 0.14) {
    if (!ctx || !isPlaying) return;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + dur);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gainPeak, now + 0.035);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    const overGain = ctx.createGain();
    overGain.gain.value = 0.12;

    osc1.connect(filter);
    osc2.connect(overGain);
    overGain.connect(filter);
    filter.connect(env);
    env.connect(masterGain);
    env.connect(delayNode);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }

  // Мягкий фоновый аккорд-подложка (тёплый пэд)
  function playWarmPad(freqs, dur = 6.2) {
    if (!ctx || !isPlaying) return;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.045, now + 1.8);
    env.gain.setValueAtTime(0.042, now + dur - 2.0);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    filter.connect(env);
    env.connect(masterGain);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime(idx % 2 === 0 ? -4 : 4, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + dur + 0.1);
    });
  }

  function tickMusic() {
    if (!isPlaying) return;
    const chordIdx = Math.floor(stepIndex / 8) % CHORDS.length;
    const chord = CHORDS[chordIdx];
    const beatInBar = stepIndex % 8;

    // В начале каждого такта — мягкий аккорд-подложка
    if (beatInBar === 0) {
      playWarmPad(chord.pad, 6.4);
    }

    // Ненавязчивые нотки «пим-пим» с паузами для воздуха
    if (beatInBar === 0 || beatInBar === 2 || beatInBar === 3 || beatInBar === 5 || beatInBar === 7) {
      if (Math.random() > 0.16) {
        const note = chord.arp[(stepIndex + Math.floor(Math.random() * 2)) % chord.arp.length];
        const octave = (beatInBar === 5 && Math.random() > 0.55) ? 2 : 1;
        const vel = 0.085 + Math.random() * 0.045;
        playSoftKey(note * octave, 2.4 + Math.random() * 0.9, vel);
      }
    }

    stepIndex++;
    stepTimer = setTimeout(tickMusic, 760);
  }

  function start() {
    initAudio();
    if (!ctx) return false;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (isPlaying) return true;
    isPlaying = true;
    tickMusic();
    updateUI();
    return true;
  }

  function stop() {
    isPlaying = false;
    if (stepTimer) { clearTimeout(stepTimer); stepTimer = null; }
    updateUI();
  }

  function toggle() {
    if (isPlaying) stop(); else start();
    return isPlaying;
  }

  function setVolume(v) {
    volume = Math.max(0.04, Math.min(0.85, Number(v) || 0.28));
    if (masterGain && ctx) masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.08);
    saveCfg();
  }

  function updateUI() {
    const btn = document.getElementById('btn-music-toggle');
    if (btn) {
      btn.classList.toggle('accent', isPlaying);
      btn.textContent = isPlaying ? '🎵' : '🔇';
      btn.title = isPlaying ? 'Выключить фоновую музыку' : 'Включить спокойную музыку';
    }
  }

  loadCfg();
  window.AMBIENT_AUDIO = { start, stop, toggle, setVolume, getVolume: () => volume, isPlaying: () => isPlaying };
})();
