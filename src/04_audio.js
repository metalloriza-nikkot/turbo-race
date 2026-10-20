// ===================== LJUD, MUSIK & RÖST =====================
// SUNO-MUSIK: klistra in en data-URL (data:audio/mpeg;base64,...) eller lämna tom för inbyggd 8-bitarsmusik.
const SUNO = { menu: '', rum: '', strand: '', sno: '', vulkan: '', rymd: '', stad: '', final: '' };

const SETTINGS = { sfx: true, music: true, voice: true, cam: 'follow', show: true, voiceStyle: /Windows/i.test(navigator.userAgent) ? 'pladder' : 'sv' };
try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem('turbo_settings') || '{}')); } catch (e) { }
function saveSettings() { try { localStorage.setItem('turbo_settings', JSON.stringify(SETTINGS)); } catch (e) { } }

const Snd = (() => {
  let ac = null, master, sfxG, musG, noiseBuf, eng = null;
  function init() {
    if (ac) { if (ac.state !== 'running') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfxG = ac.createGain(); sfxG.gain.value = SETTINGS.sfx ? 0.5 : 0; sfxG.connect(master);
    musG = ac.createGain(); musG.gain.value = SETTINGS.music ? 0.22 : 0; musG.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function tone(o) {
    if (!ac) return; const t0 = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator(), g = ac.createGain(); osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.f, t0); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.t || 0.1));
    const v = o.v == null ? 0.3 : o.v; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + (o.a || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.t || 0.1));
    osc.connect(g); g.connect(o.dest || sfxG); osc.start(t0); osc.stop(t0 + (o.t || 0.1) + 0.05);
  }
  function noise(o) {
    if (!ac) return; const t0 = ac.currentTime + (o.delay || 0);
    const src = ac.createBufferSource(); src.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.f || 1500, t0); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.t);
    const g = ac.createGain(); const v = o.v == null ? 0.3 : o.v; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.t || 0.2));
    src.connect(f); f.connect(g); g.connect(o.dest || sfxG); src.start(t0, Math.random() * 0.5); src.stop(t0 + (o.t || 0.2) + 0.05);
  }
  const fx = {
    click() { tone({ f: 660, f2: 990, t: 0.07, v: 0.2 }); },
    move() { tone({ f: 520, t: 0.05, v: 0.12, type: 'triangle' }); },
    back() { tone({ f: 500, f2: 300, t: 0.1, v: 0.2 }); },
    knock() { tone({ f: 420, f2: 200, t: 0.08, v: 0.22, type: 'triangle' }); },
    bonk() { tone({ f: 180, f2: 70, t: 0.18, v: 0.45, type: 'triangle' }); noise({ t: 0.08, f: 800, v: 0.25 }); },
    boing() { tone({ f: 220, f2: 520, t: 0.25, v: 0.3, type: 'sine' }); },
    pickup() { [0, 1, 2].forEach(k => tone({ f: [880, 1175, 1568][k], t: 0.1, v: 0.18, delay: k * 0.06 })); },
    tick() { tone({ f: 1300, t: 0.03, v: 0.08 }); },
    got() { tone({ f: 988, t: 0.08, v: 0.2 }); tone({ f: 1318, t: 0.15, v: 0.2, delay: 0.08 }); },
    boost() { noise({ t: 0.6, f: 400, f2: 3000, ft: 'bandpass', v: 0.5 }); tone({ f: 200, f2: 800, t: 0.5, v: 0.15, type: 'sawtooth' }); },
    shoot() { tone({ f: 900, f2: 300, t: 0.15, v: 0.25 }); },
    drop() { tone({ f: 300, f2: 120, t: 0.15, v: 0.3, type: 'triangle' }); noise({ t: 0.1, f: 600, v: 0.2 }); },
    shield() { tone({ f: 400, f2: 1200, t: 0.35, v: 0.2, type: 'sine' }); tone({ f: 600, f2: 1800, t: 0.35, v: 0.12, type: 'sine', delay: 0.05 }); },
    pop() { noise({ t: 0.15, f: 3000, ft: 'highpass', v: 0.4 }); tone({ f: 1200, f2: 400, t: 0.1, v: 0.2 }); },
    spin() { for (let k = 0; k < 6; k++) tone({ f: 800 - k * 90, t: 0.08, v: 0.15, delay: k * 0.07, type: 'triangle' }); },
    splash() { noise({ t: 0.35, f: 1200, f2: 300, v: 0.35 }); },
    jump() { tone({ f: 300, f2: 900, t: 0.3, v: 0.2, type: 'square' }); },
    land() { noise({ t: 0.12, f: 500, v: 0.35 }); },
    beep(hi) { tone({ f: hi ? 1046 : 523, t: hi ? 0.6 : 0.25, v: 0.3 }); },
    lap() { [523, 659, 784, 1046].forEach((f, k) => tone({ f, t: 0.12, v: 0.2, delay: k * 0.08 })); },
    fanfare() { const n = [523, 523, 523, 659, 784, 659, 784, 1046]; const d = [0, 0.12, 0.24, 0.36, 0.6, 0.84, 0.96, 1.08]; n.forEach((f, k) => { tone({ f, t: k === 7 ? 0.8 : 0.14, v: 0.25, delay: d[k] }); tone({ f: f / 2, t: k === 7 ? 0.8 : 0.14, v: 0.15, delay: d[k], type: 'triangle' }); }); },
  };
  const horns = {
    tut() { tone({ f: 440, t: 0.18, v: 0.3 }); tone({ f: 554, t: 0.18, v: 0.2 }); tone({ f: 440, t: 0.25, v: 0.3, delay: 0.22 }); tone({ f: 554, t: 0.25, v: 0.2, delay: 0.22 }); },
    ko() { tone({ f: 220, f2: 150, t: 0.9, v: 0.35, type: 'sawtooth', a: 0.15 }); tone({ f: 330, f2: 220, t: 0.9, v: 0.1, type: 'square', a: 0.15 }); },
    tag() { for (let k = 0; k < 2; k++) { tone({ f: 587, t: 0.35, v: 0.2, type: 'sawtooth', delay: k * 0.45 }); tone({ f: 740, t: 0.35, v: 0.15, type: 'sawtooth', delay: k * 0.45 }); tone({ f: 880, t: 0.35, v: 0.12, type: 'sawtooth', delay: k * 0.45 }); } },
    dino() { tone({ f: 180, f2: 60, t: 1.0, v: 0.4, type: 'sawtooth', a: 0.05 }); noise({ t: 0.9, f: 700, f2: 200, v: 0.35 }); tone({ f: 95, f2: 50, t: 1.0, v: 0.3, type: 'square' }); },
    fanfar() { [523, 659, 784, 1046, 784, 1046].forEach((f, k) => tone({ f, t: k === 5 ? 0.4 : 0.12, v: 0.22, delay: k * 0.11 })); },
    polis() { for (let k = 0; k < 4; k++) tone({ f: k % 2 ? 659 : 880, t: 0.22, v: 0.2, type: 'square', delay: k * 0.24 }); },
    prutt() { const t0 = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; fl.type = 'lowpass'; fl.frequency.value = 400; o.frequency.setValueAtTime(110, t0); for (let k = 0; k < 12; k++) o.frequency.setValueAtTime(90 + Math.random() * 60, t0 + k * 0.05); o.frequency.exponentialRampToValueAtTime(55, t0 + 0.7); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75); o.connect(fl); fl.connect(g); g.connect(sfxG); o.start(t0); o.stop(t0 + 0.8); },
  };
  const jingles = {
    rum() { for (let k = 0; k < 3; k++) tone({ f: 1760, t: 0.18, v: 0.2, type: 'sine', delay: k * 0.5 }); },
    strand() { tone({ f: 900, f2: 1600, t: 0.25, v: 0.2, type: 'sawtooth' }); tone({ f: 1600, f2: 700, t: 0.35, v: 0.2, type: 'sawtooth', delay: 0.28 }); tone({ f: 900, f2: 1500, t: 0.25, v: 0.2, type: 'sawtooth', delay: 0.8 }); },
    sno() { [392, 440, 392, 330].forEach((f, k) => tone({ f, t: 0.35, v: 0.2, type: 'triangle', delay: k * 0.38 })); },
    vulkan() { for (let k = 0; k < 6; k++) tone({ f: 120 + Math.random() * 80, f2: 60, t: 0.15, v: 0.3, type: 'sine', delay: k * 0.22 }); },
    rymd() { tone({ f: 600, f2: 900, t: 0.6, v: 0.18, type: 'sine' }); tone({ f: 900, f2: 450, t: 0.8, v: 0.18, type: 'sine', delay: 0.6 }); },
    stad() { for (let k = 0; k < 8; k++) tone({ f: k % 2 ? 700 : 950, t: 0.14, v: 0.15, type: 'square', delay: k * 0.15 }); },
    final() { [392, 523, 659, 784, 659, 784, 1046].forEach((f, k) => tone({ f, t: k === 6 ? 0.8 : 0.2, v: 0.2, type: 'sawtooth', delay: k * 0.22 })); },
  };
  // PLADDER: egen minion-röst (stavelser genom formantfilter) – fungerar lika på alla datorer
  let babbleNodes = [], voiceG = null;
  function babble(role, text, onSyl) {
    if (!ac) return 0; if (!voiceG) { voiceG = ac.createGain(); voiceG.gain.value = 0.42; voiceG.connect(master); }
    const base = { goran: 360, britt: 560, ronny: 640, prof: 250, driver: 590, stall: 440 }[role] || 480;
    const VF = { a: [800, 1250], e: [480, 1950], i: [310, 2300], o: [460, 820], u: [340, 900], y: [300, 1900], 'å': [460, 860], 'ä': [660, 1720], 'ö': [460, 1500] };
    const clean = String(text).replace(/[™*]/g, '').toLowerCase(); const t0 = ac.currentTime + 0.05; let t = t0; const syl = [];
    let i = 0;
    while (i < clean.length) {
      const ch = clean[i];
      if (ch === ' ') { t += 0.05; i++; continue; }
      if ('.,!?–:;'.includes(ch)) { t += 0.15; i++; continue; }
      if (!/[a-zåäö0-9]/.test(ch)) { i++; continue; }
      let j = i, v = 'a'; while (j < clean.length && /[a-zåäö0-9]/.test(clean[j])) { if (VF[clean[j]]) { v = clean[j]; j++; break; } j++; }
      const dur = 0.05 + (j - i) * 0.011, f = base * (0.86 + Math.random() * 0.34);
      const o = ac.createOscillator(), g = ac.createGain(), b1 = ac.createBiquadFilter(), b2 = ac.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (1.05 + Math.random() * 0.15), t + dur);
      b1.type = 'bandpass'; b1.frequency.value = VF[v][0] * 1.6; b1.Q.value = 4; b2.type = 'bandpass'; b2.frequency.value = VF[v][1] * 1.45; b2.Q.value = 5;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g); g.connect(voiceG); o.start(t); o.stop(t + dur + 0.02); babbleNodes.push(o);
      syl.push(t - t0); t += dur + 0.02; i = j;
    }
    if (onSyl) for (const s of syl) setTimeout(onSyl, s * 1000 + 50);
    if (babbleNodes.length > 400) babbleNodes = babbleNodes.slice(-200);
    return t - t0;
  }
  function stopBabble() { for (const o of babbleNodes) { try { o.stop(); } catch (e) { } } babbleNodes = []; }
  function jingle(id) { if (!ac || !SETTINGS.sfx) return; try { (jingles[id] || jingles.final)(); } catch (e) { } }
  function horn(id) { if (!ac || !SETTINGS.sfx) return; try { (horns[id] || horns.tut)(); } catch (e) { } }
  fx.swoosh = () => { noise({ t: 0.35, f: 600, f2: 4000, ft: 'bandpass', v: 0.25 }); };
  fx.skid2 = () => { noise({ t: 0.4, f: 2600, f2: 900, ft: 'bandpass', v: 0.35 }); tone({ f: 720, f2: 480, t: 0.3, v: 0.07, type: 'sawtooth' }); };
  fx.coin = () => { tone({ f: 988, t: 0.07, v: 0.18 }); tone({ f: 1319, t: 0.2, v: 0.18, delay: 0.07 }); };
  fx.ding = () => { tone({ f: 1175, t: 0.25, v: 0.22, type: 'triangle' }); tone({ f: 1760, t: 0.3, v: 0.12, type: 'sine', delay: 0.05 }); };
  fx.buzz = () => { tone({ f: 150, t: 0.3, v: 0.25, type: 'square' }); };
  fx.star = () => { [784, 988, 1175, 1568].forEach((f, k) => tone({ f, t: 0.15, v: 0.2, delay: k * 0.07 })); };
  fx.buy = () => { [1046, 1318, 1568, 2093].forEach((f, k) => tone({ f, t: 0.1, v: 0.18, delay: k * 0.05, type: 'triangle' })); };
  function play(name, ...a) { if (!ac || !SETTINGS.sfx) return; try { fx[name](...a); } catch (e) { } }
  // Motorljud
  function engine(on, speed01) {
    if (!ac) return; if (!on) skid(false, 0);
    if (!eng) {
      const o1 = ac.createOscillator(); o1.type = 'sawtooth'; const o2 = ac.createOscillator(); o2.type = 'square';
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600; const g = ac.createGain(); g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxG); o1.start(); o2.start(); eng = { o1, o2, f, g };
    }
    const t = ac.currentTime; const fr = 55 + speed01 * 110;
    eng.o1.frequency.setTargetAtTime(fr, t, 0.05); eng.o2.frequency.setTargetAtTime(fr * 0.502, t, 0.05); eng.f.frequency.setTargetAtTime(400 + speed01 * 900, t, 0.05);
    eng.g.gain.setTargetAtTime(on && SETTINGS.sfx ? 0.05 + speed01 * 0.05 : 0, t, 0.08);
  }
  let sk = null;
  function skid(on, lvl) {
    if (!ac) return;
    if (!sk) { const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3; const g = ac.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(sfxG); src.start(); sk = { f, g }; }
    const t = ac.currentTime; sk.g.gain.setTargetAtTime(on && SETTINGS.sfx ? 0.12 : 0, t, 0.05); sk.f.frequency.setTargetAtTime(1000 + (lvl || 0) * 400, t, 0.1);
  }
  function setVolumes() { if (!ac) return; sfxG.gain.setTargetAtTime(SETTINGS.sfx ? 0.5 : 0, ac.currentTime, 0.02); musG.gain.setTargetAtTime(SETTINGS.music ? 0.22 : 0, ac.currentTime, 0.02); if (sunoEl) sunoEl.volume = SETTINGS.music ? 0.6 : 0; }

  // ---------- Musik (inbyggd chiptune-sequencer) ----------
  const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
  const SONGS = {
    menu: { bpm: 112, root: 60, scale: MAJ, prog: [0, 4, 5, 3], seed: 11, lead: 'square', arp: true },
    rum: { bpm: 144, root: 65, scale: MAJ, prog: [0, 5, 3, 4], seed: 5, lead: 'square', arp: false },
    strand: { bpm: 128, root: 67, scale: MAJ, prog: [0, 3, 4, 0, 5, 3, 4, 4], seed: 23, lead: 'triangle', arp: true, swing: true },
    sno: { bpm: 136, root: 62, scale: MIN, prog: [0, 5, 2, 6], seed: 8, lead: 'sine', arp: true, bells: true },
    final: { bpm: 118, root: 62, scale: MAJ, prog: [0, 3, 4, 0, 5, 3, 4, 4], seed: 77, lead: 'square', arp: true, heavy: true },
    rymd: { bpm: 132, root: 62, scale: MIN, prog: [0, 3, 5, 4], seed: 31, lead: 'sawtooth', arp: true, bells: true },
    stad: { bpm: 140, root: 60, scale: MAJ, prog: [0, 5, 3, 4], seed: 41, lead: 'square', arp: true },
    vulkan: { bpm: 156, root: 64, scale: MIN, prog: [0, 5, 6, 4], seed: 17, lead: 'sawtooth', arp: false, heavy: true },
  };
  const RHY = ['x.x.x.x.x...x.x.', 'x...x.x.x.x.x...', 'x.xxx...x.x.x...', 'x..x..x.x.x.x...', 'x.x.x.x.xxx.x...', 'x...x...x.x.x.x.', 'x.......x.......'];
  function genMelody(s) {
    const R = mulberry(s.seed); const bars = [];
    const mk = (pat, deg0, chord) => { const notes = []; let deg = deg0; for (let i = 0; i < 16; i++) { if (pat[i] === 'x') { const strong = i % 4 === 0; if (strong) { const ct = [chord, chord + 2, chord + 4, chord + 7]; let bestD = ct[0], bd = 99; for (const c of ct) for (const o of [0, 7]) { const dd = Math.abs(c + o - deg); if (dd < bd && R() < 0.85) { bd = dd; bestD = c + o; } } deg = bestD; } else { deg += [-2, -1, -1, 1, 1, 2][Math.floor(R() * 6)]; } deg = clamp(deg, 5, 16); notes.push([i, deg]); } } return notes; };
    const pA = RHY[Math.floor(R() * 5)], pB = RHY[Math.floor(R() * 6)], pC = RHY[Math.floor(R() * 6)];
    const L = s.prog.length; const total = Math.max(8, L);
    for (let b = 0; b < total; b++) { const ch = s.prog[b % L]; const pat = b === total - 1 ? RHY[6] : (b % 4 === 1 ? pB : b % 4 === 3 ? pC : pA); bars.push(mk(pat, 9 + ch % 3, ch + 7)); }
    return bars;
  }
  let seq = null, seqTimer = null, sunoEl = null;
  function nf(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function music(name) {
    stopMusic(); if (!name) return;
    if (SUNO[name]) { try { sunoEl = new Audio(SUNO[name]); sunoEl.loop = true; sunoEl.volume = SETTINGS.music ? 0.6 : 0; sunoEl.play().catch(() => { }); return; } catch (e) { } }
    if (!ac) return;
    const s = SONGS[name]; if (!s) return; if (!s.mel) s.mel = genMelody(s);
    const stepT = 60 / s.bpm / 4; seq = { s, step: 0, next: ac.currentTime + 0.1, stepT };
    seqTimer = setInterval(schedule, 25);
  }
  function stopMusic() { if (seqTimer) clearInterval(seqTimer); seqTimer = null; seq = null; if (sunoEl) { sunoEl.pause(); sunoEl = null; } }
  function deg2n(s, deg) { const o = Math.floor(deg / 7), k = ((deg % 7) + 7) % 7; return s.root + s.scale[k] + 12 * o; }
  function schedule() {
    if (!seq || !ac) return; const s = seq.s;
    while (seq.next < ac.currentTime + 0.15) {
      const t = seq.next, stepT = seq.stepT, st = seq.step, bar = Math.floor(st / 16) % s.mel.length, i = st % 16, ch = s.prog[bar % s.prog.length];
      const d = musG;
      const T = (f, type, dur, v) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(d); o.start(t); o.stop(t + dur + 0.02); };
      const N = (dur, v, f, ft) => { const src = ac.createBufferSource(); src.buffer = noiseBuf; const fl = ac.createBiquadFilter(); fl.type = ft; fl.frequency.value = f; const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); src.connect(fl); fl.connect(g); g.connect(d); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02); };
      // trummor
      const kick = s.heavy ? (i % 4 === 0 || i === 10) : (i === 0 || i === 8 || (i === 10 && bar % 2));
      if (kick) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(d); o.start(t); o.stop(t + 0.2); }
      if (i === 4 || i === 12) N(0.12, 0.45, 1800, 'bandpass');
      if (i % 2 === 0) N(0.03, 0.15, 7000, 'highpass');
      // bas
      const bassPat = s.heavy ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 3, 6, 8, 11, 14];
      if (bassPat.includes(i)) { const n = deg2n(s, ch) - 24 + ((i === 6 || i === 14) && !s.heavy ? 12 : 0); T(nf(n), 'triangle', stepT * 1.8, 0.5); if (s.heavy) T(nf(n), 'square', stepT * 1.2, 0.08); }
      // arpeggio
      if (s.arp && i % 2 === 1) { const a = [0, 2, 4, 7][(i >> 1) % 4]; T(nf(deg2n(s, ch + a) + 12), s.bells ? 'sine' : 'square', stepT * (s.bells ? 3 : 1), s.bells ? 0.07 : 0.035); }
      // melodi
      const mb = s.mel[bar]; const nt = mb.find(x => x[0] === i);
      if (nt) { let len = 1; for (let j = i + 1; j < 16 && !mb.find(x => x[0] === j); j++) len++; const n = deg2n(s, nt[1]); T(nf(n), s.lead, stepT * Math.min(len, 4) * 0.95, s.lead === 'sawtooth' ? 0.08 : s.lead === 'square' ? 0.1 : 0.2); }
      seq.step++; seq.next += seq.stepT * (s.swing ? (st % 2 ? 0.85 : 1.15) : 1);
    }
  }
  return { init, play, engine, skid, horn, jingle, music, stopMusic, setVolumes, babble, stopBabble, get ready() { return !!ac; } };
})();

// ---------- Röst (text till tal) ----------
const Voice = (() => {
  let v = null, lastSaid = '', lastT = 0;
  function pick() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices().filter(x => /^sv/i.test(x.lang));
    v = vs.find(x => x.localService && /alva|klara|oskar/i.test(x.name)) || vs.find(x => x.localService) || vs[0] || null;
  }
  if (window.speechSynthesis) { pick(); speechSynthesis.onvoiceschanged = pick; }
  let seqTok = 0;
  function say(text, force) {
    seqTok++;
    if (!SETTINGS.voice || !window.speechSynthesis || !text) return;
    if (!v) pick(); if (!v) return;
    const now = performance.now(); if (!force && text === lastSaid && now - lastT < 1500) return;
    lastSaid = text; lastT = now;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'sv-SE'; u.voice = v; u.rate = 1.0; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) { }
  }
  // Röst per rollfigur (kommentatorer m.fl.). onend anropas när repliken är klar (eller direkt om rösten är av).
  // [röst-index, tonhöjd (max 2), tempo]. Minion-läge: högt och snabbspolat, men med inbördes skillnader så man hör vem som pratar.
  const ROLE = { goran: [0, 1.7, 1.45], britt: [1, 2.0, 1.35], ronny: [0, 1.95, 1.65], prof: [1, 1.45, 1.2], driver: [0, 2.0, 1.55], stall: [1, 1.8, 1.5] };
  function sayAs(role, text, onend, onword) {
    if (SETTINGS.voiceStyle === 'pladder' && SETTINGS.voice) { const d = Snd.babble(role, text, onword); if (d > 0) { if (onend) setTimeout(onend, d * 1000 + 120); return; } }
    if (!SETTINGS.voice || !window.speechSynthesis) { if (onend) setTimeout(onend, 900 + text.length * 55); return; }
    const vs = speechSynthesis.getVoices().filter(x => /^sv/i.test(x.lang)); if (!vs.length) { if (onend) setTimeout(onend, 900 + text.length * 55); return; }
    const r = ROLE[role] || ROLE.goran; const voice = vs[r[0] % vs.length];
    try { const u = new SpeechSynthesisUtterance(text.replace(/[™*]/g, '')); u.lang = 'sv-SE'; u.voice = voice; u.pitch = r[1]; u.rate = r[2]; let done = false; const fin = () => { if (!done) { done = true; if (onend) onend(); } }; u.onend = fin; u.onerror = fin; if (onword) u.onboundary = e => { if (!e.name || e.name === 'word') onword(); }; setTimeout(fin, 2500 + text.length * 90); speechSynthesis.speak(u); } catch (e) { if (onend) setTimeout(onend, 1000); }
  }
  // uppläsning i steg (ljudning): en del i taget, onPart(i) när en del börjar
  // onCancel anropas om ljudningen avbryts av något annat som pratar (annars kunde remsan bli kvar för alltid)
  function seq(parts, onPart, onDone, onCancel) {
    try { speechSynthesis.cancel(); } catch (e) { } const tok = ++seqTok; let k = 0;
    const next = () => {
      if (tok !== seqTok) { if (onCancel) { const c = onCancel; onCancel = null; c(); } return; } if (k >= parts.length) { if (onDone) onDone(); return; }
      const i = k++, txt = parts[i]; if (onPart) onPart(i);
      if (!SETTINGS.voice || !window.speechSynthesis || (!v && (pick(), !v))) { setTimeout(next, 450 + txt.length * 70); return; }
      try { const u = new SpeechSynthesisUtterance(txt); u.lang = 'sv-SE'; u.voice = v; u.rate = 0.85; u.pitch = 1.1; let done = false; const fin = () => { if (done) return; done = true; setTimeout(next, 200); }; u.onend = fin; u.onerror = fin; setTimeout(fin, 1600 + txt.length * 130); speechSynthesis.speak(u); } catch (e) { setTimeout(next, 600); }
    };
    next();
  }
  return { say, sayAs, seq, stop() { seqTok++; try { speechSynthesis.cancel(); } catch (e) { } Snd.stopBabble(); } };
})();
