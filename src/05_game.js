// ===================== SPELMOTOR =====================
const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = Math.floor(innerWidth * DPR); H = Math.floor(innerHeight * DPR); canvas.width = W; canvas.height = H; canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; }
window.addEventListener('resize', resize); resize();

const keys = {};
const DIFFS = [
  { id: 'beginner', name: 'NYBÖRJARE', icon: '🐣', say: 'Nybörjare. Bilen styr själv!', aiSuper: null, ai: 0.74, items: 0.3, ahead: 250, behindBoost: 1.0, homePlayer: false },
  { id: 'easy', name: 'LÅNGSAM', icon: '🐢', say: 'Långsam', aiSuper: null, ai: 0.80, items: 0.35, ahead: 350, behindBoost: 1.04, homePlayer: false },
  { id: 'lagom', name: 'LAGOM', icon: '🦊', say: 'Lagom. Lite svårare än sköldpaddan, lite lättare än haren.', aiSuper: { rate: 2.2, dose: 40 }, ai: 0.855, items: 0.42, ahead: 500, behindBoost: 1.07, homePlayer: false },
  { id: 'mid', name: 'MELLAN', icon: '🐇', say: 'Mellan', aiSuper: { rate: 3.3, dose: 100 }, ai: 0.91, items: 0.5, ahead: 700, behindBoost: 1.10, homePlayer: false },
  { id: 'hard', name: 'SNABB', icon: '🚀', say: 'Snabb', aiSuper: { rate: 4.5, dose: 100 }, ai: 0.985, items: 0.8, ahead: 1500, behindBoost: 1.16, homePlayer: true },
];
const easyish = () => G.diff.id === 'easy' || G.diff.id === 'beginner';
const SLIP = { saft: 1, ice: 1, slime: 1, puddle: 1 }, SPINHAZ = { lava: 1, oil: 1 };
const PROP_KINDS = { lego: 1, block: 1, cone: 1, bucket: 1, bball: 1, snowball: 1, stone: 1, meteor: 1, trophy: 1 };
const SPIN_T = 0.6, SPIN_SAFE = 2.0;
const CAP = 460, ACC = 640, TURN = 3.3, CAR_R = 24;
const PLACE_TXT = ['1:a', '2:a', '3:e', '4:e', '5:e'];
const PLACE_SAY = ['första', 'andra', 'tredje', 'fjärde', 'femte'];

const G = window.__TR = { mode: 'none', T: null, cars: [], player: null, balls: [], blobs: [], parts: [], time: 0, cam: { x: 0, y: 0, shake: 0, vh: 1000, a: 0, rot: 0 }, banner: null, laps: 3, diff: DIFFS[0], paused: false, finishCount: 0, countdown: 0, raceT: 0, lastCount: 4, hoppT: 0, playerName: '' };
const BUILT = {};
function getTrack(def) { const k = def.id + (def.rev ? ':' + def.rev : ''); if (!BUILT[k]) BUILT[k] = buildTrack(def); return BUILT[k]; }

function makeCar(d, T, k, isPlayer) {
  const N = T.N; const idx = (N - 14 - k * 9) % N; const lat = (k % 2 ? 1 : -1) * T.hw * 0.42;
  const cl = T.cl;
  return { d, isPlayer, x: cl.px[idx] + cl.nx[idx] * lat, y: cl.py[idx] + cl.ny[idx] * lat, a: cl.ang[idx], vx: 0, vy: 0, fs: 0, idx, prog: idx - N, lat, pLane: lat,
    spin: 0, spinDir: 1, air: 0, airMax: 0.5, boost: 0, shield: 0, hitCool: 0, wallCool: 0, padCool: 0, item: null, roulette: 0, rouletteShow: 'turbo', itemDelay: 0, itemAge: 0,
    lane: lat, laneTarget: lat, laneTimer: 1 + Math.random() * 2, cap: CAP, finished: false, place: 0, surf: null, wrongT: 0, rubber: 1, skill: 0.97 + Math.random() * 0.06 };
}

// opts: { me: {car, name, fig, paint, sticker}, opps: [{car, name, fig}], diff, demo, T (egen bana), school }
function startRace(def, opts) {
  soundClear('nytt lopp'); if (!opts.demo) logEv('lopp', 'start ' + def.id, { skola: !!opts.school });
  const demo = !!opts.demo, diff = opts.diff || DIFFS.find(d => d.id === 'easy');
  const T = opts.T || getTrack(def); G.T = T; G.diff = diff; G.demo = demo; G.school = opts.school || null;
  for (const b of T.boxes) { b.alive = true; b.respawn = 0; }
  for (const p of T.props) { p.x = p.hx; p.y = p.hy; p.a = p.ha; p.idx = p.hi; p.vx = p.vy = p.va = 0; }
  G.skids = []; G.spinLog = {};
  G.laps = G.school ? 99 : (opts.laps || def.laps || 3); G.hudSpr = {}; G.cars = []; G.balls = []; G.blobs = []; G.parts = []; G.finishCount = 0; G.time = 0; G.raceT = 0; G.aiSuperSaid = -99; G.banner = null;
  const me = opts.me || { car: 0, name: '', fig: DEFAULT_FIG };
  let opps = opts.opps;
  if (!opps) { const free = DRIVERS.map((_, i) => i).filter(i => i !== me.car).sort(() => Math.random() - 0.5); const chars = PREMADE.slice().sort(() => Math.random() - 0.5); opps = free.slice(0, 4).map((car, k) => ({ car, name: chars[k].name, fig: chars[k].fig })); }
  G.player = null;
  if (G.school) {
    const c = makeCar(styledCar(me.car, me.paint, me.sticker), T, 0, true); c.who = { name: me.name, fig: me.fig }; c.horn = me.horn; G.cars.push(c); G.player = c;
  } else {
    const slots = [0, 1, 3, 4]; // spelaren startar som nr 3
    for (let k = 0; k < 5; k++) {
      let c;
      if (k === 2) { c = makeCar(styledCar(me.car, me.paint, me.sticker), T, k, !demo); c.who = { name: me.name, fig: me.fig }; c.horn = me.horn; G.player = c; }
      else { const o = opps[slots.indexOf(k)]; c = makeCar(DRIVERS[o.car], T, k, false); c.who = { name: o.name, fig: o.fig }; }
      G.cars.push(c);
    }
  }
  G.cam.x = G.player.x; G.cam.y = G.player.y; G.cam.vh = 1000; G.cam.a = G.player.a;
  G.countdown = demo ? 0 : 3.99; G.lastCount = 4;
  G.mode = demo ? 'demo' : 'countdown'; rocketReset(); G.victory = null;
  G.gift = null; if (!demo && !opts.school) { G.gift = makeGift(); G.mode = 'gift'; }
  G.letters = []; if (!demo && !opts.school) for (const f of [0.18, 0.43, 0.68, 0.9]) { const q = T.at(f, (Math.random() - 0.5) * T.hw * 0.9); G.letters.push({ x: q.x, y: q.y }); } G.paused = false; G.hintT = G.school ? 0 : 7;
  if (!demo) { Snd.music(def.music); }
}
function whoName(c) { return (c.who && c.who.name) || c.d.name; }

// ---------- Kontroller ----------
function playerControl(c, dt) {
  // Bilstyrning: upp = gas, ned = broms/back, vänster/höger = sväng (sett från bilen)
  const up = keys.ArrowUp || keys.KeyW, dn = keys.ArrowDown || keys.KeyS, lf = keys.ArrowLeft || keys.KeyA, rt = keys.ArrowRight || keys.KeyD;
  const throttle = up ? 1 : (dn ? -1 : 0);
  let steer = (rt ? 1 : 0) - (lf ? 1 : 0);
  // Styrhjälp när man inte svänger själv.
  // 🐢: hjälper till i kurvorna (men max halv ratt, styr inte runt hinder, vänder inte bilen).
  // 🐇: håller bara bilen stabil på raksträckor. 🚀: ingen hjälp.
  if (!steer && G.diff.id === 'beginner' && c.fs > 20 && c.spin <= 0) {
    // 🐣: full autopilot – följer vägen och styr runt hinder
    const cl = G.T.cl, N = G.T.N;
    const lane = avoidLane(c, clamp(c.lat, -G.T.hw * 0.6, G.T.hw * 0.6), false, true);
    const j = (c.idx + Math.round(15 + c.fs / 45)) % N;
    const df = angDiff(Math.atan2(cl.py[j] + cl.ny[j] * lane - c.y, cl.px[j] + cl.nx[j] * lane - c.x), c.a);
    steer = clamp(df * 2.5, -1, 1);
  } else if (!steer && c.fs > 60 && c.spin <= 0 && G.diff.id !== 'hard') {
    const cl = G.T.cl, N = G.T.N;
    if (G.diff.id === 'easy' || G.diff.id === 'lagom') {
      // 🦊 lagom: samma kurvhjälp som 🐢 men svagare (max knappt halv ratt, bara i måttliga kurvor)
      const lg = G.diff.id === 'lagom', lane = clamp(c.lat, -G.T.hw * 0.55, G.T.hw * 0.55);
      const j = (c.idx + Math.round(14 + c.fs / 45)) % N;
      const df = angDiff(Math.atan2(cl.py[j] + cl.ny[j] * lane - c.y, cl.px[j] + cl.nx[j] * lane - c.x), c.a);
      if (Math.abs(df) < (lg ? 0.9 : 1.2)) steer = clamp(df * (lg ? 1.8 : 2.4), lg ? -0.42 : -0.7, lg ? 0.42 : 0.7);
    } else {
      const straight = Math.abs(angDiff(cl.ang[(c.idx + 30) % N], cl.ang[c.idx])) < 0.15;
      const df = angDiff(cl.ang[c.idx], c.a);
      if (straight && Math.abs(df) < 0.35) steer = clamp(df * 2, -0.3, 0.3);
    }
  }
  return { throttle, steer };
}

function avoidLane(c, lane, hazards, movers) {
  const T = G.T, cl = T.cl, N = T.N;
  const miss = c.isPlayer ? 0 : ({ beginner: 0.5, easy: 0.45, lagom: 0.38, mid: 0.3, hard: 0.15 }[G.diff.id] || 0.3);
  let k = 0; const lap = Math.floor(c.prog / N);
  const check = (ox, oy, r, from, to) => {
    k++; if (miss && ((c.d.id.charCodeAt(0) * 31 + k * 17 + lap * 7 + c.d.id.length * 3) % 100) / 100 < miss) return;
    const oi = nearestLocal(cl, ox, oy, (c.idx + 25) % N, 30); const di = (oi - c.idx + N) % N; if (di < from || di > to) return;
    const olat = (ox - cl.px[oi]) * cl.nx[oi] + (oy - cl.py[oi]) * cl.ny[oi];
    if (Math.abs(olat - lane) < r + 42) { let nl = olat + (olat > lane ? -1 : 1) * (r + 55); if (Math.abs(nl) > T.hw * 0.75) nl = olat + (olat > lane ? 1 : -1) * (r + 55); lane = nl; }
  };
  const R2 = 500 * 500;
  for (const o of T.obstacles) if (dist2(o.x, o.y, c.x, c.y) < R2) check(o.x, o.y, o.r, 2, 40);
  if (movers) for (const o of T.movers) if (dist2(o.x, o.y, c.x, c.y) < R2) check(o.x, o.y, o.r, 2, 30);
  if (hazards) for (const o of T.hazards) if (SPINHAZ[o.kind] && dist2(o.x, o.y, c.x, c.y) < R2) check(o.x, o.y, o.r * 0.8, 6, 40);
  for (const b of G.blobs) if (dist2(b.x, b.y, c.x, c.y) < 400 * 400) check(b.x, b.y, b.r, 3, 30);
  return clamp(lane, -T.hw * 0.75, T.hw * 0.75);
}
function aiControl(c, dt) {
  const T = G.T, cl = T.cl, N = T.N;
  c.laneTimer -= dt; if (c.laneTimer <= 0) { c.laneTarget = (Math.random() * 2 - 1) * T.hw * 0.5; c.laneTimer = 2 + Math.random() * 3; }
  let lane = avoidLane(c, c.laneTarget, true, true);
  lane = clamp(lane, -T.hw * 0.72, T.hw * 0.72);
  c.lane += (lane - c.lane) * Math.min(1, dt * 3);
  const la = Math.round(14 + Math.abs(c.fs) / 40), j = (c.idx + la) % N;
  const tx = cl.px[j] + cl.nx[j] * c.lane, ty = cl.py[j] + cl.ny[j] * c.lane;
  const df = angDiff(Math.atan2(ty - c.y, tx - c.x), c.a);
  const curv = Math.abs(angDiff(cl.ang[(c.idx + 35) % N], cl.ang[c.idx]));
  let thr = 1; if (curv > 0.9 && c.fs > c.cap * 0.78) thr = 0.2;
  return { throttle: thr, steer: clamp(df * 3, -1, 1) };
}

// ---------- Fysik ----------
function stepCar(c, ctl, dt) {
  if (c.isPlayer) superHold(c, dt); else aiSuper(c, dt);
  const T = G.T;
  let thr = ctl.throttle, steer = ctl.steer;
  if (G.mode === 'countdown') { thr = 0; steer = 0; }
  let ca = Math.cos(c.a), sa = Math.sin(c.a);
  let fs = c.vx * ca + c.vy * sa, ls = -c.vx * sa + c.vy * ca;
  let grip = 14, cap = c.cap, acc = ACC, turn = TURN;
  if (c.air <= 0) {
    if (SLIP[c.surf]) { grip = 1.3; acc *= 0.75; turn *= 0.85; }
    if (c.surf === 'sand') cap *= 0.55;
  }
  if (c.boost > 0) { cap *= (c.boostMul || 1.45); acc *= 2.2; }
  if (c.spin > 0) { thr = 0; steer = 0; c.a += c.spinDir * 13 * dt; fs *= Math.exp(-2.2 * dt); grip = 3; }
  if (c.air > 0) { grip = 0.2; steer *= 0.25; thr = 0; }
  // DRIFT (automatisk): gasa + sväng en kort stund i fart. Bilen glider ut i en bredare båge ju fortare det går.
  if (c.isPlayer && c.air <= 0 && c.spin <= 0 && G.mode !== 'countdown') {
    const sg = Math.abs(steer) > 0.6 ? Math.sign(steer) : 0;
    c.steerHeld = sg && sg === c.steerSg ? (c.steerHeld || 0) + dt : 0; c.steerSg = sg;
    // BROMSDRIFT: tryck pil ned kort mitt i en sväng i fart -> bilen kastar sig in i en sladd direkt
    const brakeEdge = thr < 0 && !c.brakeWas; c.brakeWas = thr < 0;
    if (brakeEdge && sg && fs > CAP * 0.5 && !(c.drift && c.bDrift > 0)) {
      if (!c.drift) { c.drift = true; c.driftT = 0.3; c.driftLvl = 0; c.driftPts = 0; }
      c.driftDir = sg; c.driftOff = 0; c.noGasT = 0; c.bDrift = 0.7; c.a += sg * 0.26; fs *= 0.95;
      addText(c.x, c.y - 20, 'BROMSDRIFT!', '#80d8ff'); Snd.play('skid2');
      if (G.school && G.school.onBDrift) G.school.onBDrift();
    }
    else if (!c.drift && c.steerHeld > 0.1 && thr > 0 && fs > CAP * 0.45) { c.drift = true; c.driftT = 0; c.driftLvl = 0; c.driftDir = sg; c.driftOff = 0; c.driftPts = 0; c.noGasT = 0; }
    else if (c.drift) {
      c.driftOff = (sg === c.driftDir) ? 0 : (c.driftOff || 0) + dt;
      c.noGasT = thr > 0 ? 0 : (c.noGasT || 0) + dt;
      if (c.driftOff > 0.35 || fs < CAP * 0.3 || c.noGasT > 0.45 || Math.abs(angDiff(c.a, T.cl.ang[c.idx])) > 1.4) endDrift(c);
    }
  } else if (c.drift) endDrift(c);
  c.bDrift = Math.max(0, (c.bDrift || 0) - dt);
  { const sp2 = clamp(Math.abs(fs) / (CAP * 1.2), 0, 1), tgt = c.drift ? c.driftDir * Math.min(0.5, 0.18 + c.driftT * 0.55 + (c.bDrift > 0 ? 0.12 : 0)) * (0.5 + 0.5 * sp2) : 0; c.visYaw = (c.visYaw || 0) + (tgt - (c.visYaw || 0)) * Math.min(1, dt * 7); }
  if (c.drift) {
    c.driftT += dt; const d = G.diff.id, sp = clamp(fs / (CAP * 1.35), 0, 1);
    if (d !== 'beginner') {
      // v3: mer glid och bredare båge. Bromsdrift ger extra sladd en kort stund.
      grip = Math.min(grip, lerp(d === 'easy' ? 6 : d === 'lagom' ? 5.2 : 4.4, d === 'easy' ? 3.0 : d === 'lagom' ? 2.4 : 1.9, sp)); turn *= lerp(1.22, 0.95, sp);
      if (c.bDrift > 0) grip *= 0.55;
      // anti-snurr: blir sladdvinkeln för stor tar däcken tag och bilen slutar vrida sig
      { const beta = Math.atan2(Math.abs(ls), Math.abs(fs) + 1); if (beta > 0.5) { grip = Math.max(grip, lerp(4, 12, clamp((beta - 0.5) / 0.35, 0, 1))); turn *= lerp(1, 0.45, clamp((beta - 0.5) / 0.35, 0, 1)); } }
      // hjälp på 🐢/🐇: glider bilen mot kanten så tar däcken tag igen
      if (d !== 'hard') { const cl = T.cl, ii = c.idx, vn = c.vx * cl.nx[ii] + c.vy * cl.ny[ii]; if (Math.abs(c.lat) > T.hw * 0.62 && Math.sign(vn) === Math.sign(c.lat) && Math.abs(vn) > 80) grip = Math.max(grip, d === 'easy' ? 8 : d === 'lagom' ? 7 : 6); }
    }
    const gain = dt * (16 + 34 * sp) * (Math.abs(steer) > 0.6 ? 1 : 0.5);
    c.driftPts += gain;
    if (!c.superOn) { const was = c.meter || 0; c.meter = Math.min(100, was + gain * 0.2); if (c.isPlayer) superMeterNews(c, was); }
    const lvl = c.driftT > 1.2 ? 2 : c.driftT > 0.6 ? 1 : 0;
    if (lvl > c.driftLvl) { c.driftLvl = lvl; Snd.play(lvl === 2 ? 'got' : 'tick'); }
  }
  if (c.drift && thr < 0) { fs -= 260 * dt; thr = 0; }
  else if (thr > 0) fs += thr * acc * dt * (fs < 0 ? 2 : 1);
  else if (thr < 0) { if (fs > 0) fs -= 1400 * dt; else fs = Math.max(-180, fs - 520 * dt); }
  else if (c.air <= 0) fs -= fs * 1.1 * dt;
  if (fs > cap) fs -= (fs - cap) * Math.min(1, 3.5 * dt);
  ls *= Math.exp(-grip * dt);
  c.vx = ca * fs - sa * ls; c.vy = sa * fs + ca * ls; c.fs = fs;
  const sf = clamp(Math.abs(fs) / 130, 0, 1);
  c.a += steer * turn * sf * Math.sign(fs || 1) * dt;
  c.x += c.vx * dt; c.y += c.vy * dt;
  // bana: närmaste punkt & väggar
  const cl = T.cl, N = T.N;
  const old = c.idx; c.idx = nearestLocal(cl, c.x, c.y, c.idx, 20);
  let dd = c.idx - old; if (dd > N / 2) dd -= N; if (dd < -N / 2) dd += N; c.prog += dd;
  const i = c.idx; c.lat = (c.x - cl.px[i]) * cl.nx[i] + (c.y - cl.py[i]) * cl.ny[i];
  const lim = T.hw - CAR_R + 4;
  if (Math.abs(c.lat) > lim) {
    const s = Math.sign(c.lat); const push = Math.abs(c.lat) - lim;
    c.x -= cl.nx[i] * s * push; c.y -= cl.ny[i] * s * push; c.lat = s * lim;
    const vn = c.vx * cl.nx[i] + c.vy * cl.ny[i];
    if (vn * s > 0) {
      c.vx -= cl.nx[i] * vn * 1.4; c.vy -= cl.ny[i] * vn * 1.4;
      if (Math.abs(vn) > 110 && c.wallCool <= 0) {
        c.vx *= 0.72; c.vy *= 0.72; c.wallCool = 0.35;
        // vrid mot färdriktningen så man inte fastnar
        if (!c.isPlayer || G.diff.id !== 'hard') { const fwd = Math.cos(angDiff(c.a, cl.ang[i])) > 0 ? cl.ang[i] : cl.ang[i] + Math.PI; c.a += angDiff(fwd, c.a) * (!c.isPlayer ? 0.35 : G.diff.id === 'beginner' ? 0.4 : G.diff.id === 'easy' ? 0.3 : 0.15); }
        sparks(c.x + cl.nx[i] * s * CAR_R, c.y + cl.ny[i] * s * CAR_R, '#ffeb3b', 8);
        if (c.isPlayer) { Snd.play('bonk'); G.cam.shake = 7; addText(c.x, c.y, 'BONK!', '#fff'); }
      }
    }
  }
  // hopp över ramper
  for (const r of T.ramps) {
    const a = (r.i - old + N) % N, b = (r.i - c.idx + N) % N;
    if (dd > 0 && a > 0 && a <= dd && c.fs > 160 && c.air <= 0) { c.airMax = 0.45 + c.fs / 1400; c.air = c.airMax; if (c.isPlayer) Snd.play('jump'); }
  }
  // tidigare timers
  carTrail(c, dt);
  const wasAir = c.air > 0; c.hopCool = Math.max(0, (c.hopCool || 0) - dt);
  c.air = Math.max(0, c.air - dt); if (wasAir && c.air <= 0) { puff(c.x, c.y, 8); if (c.isPlayer) Snd.play('land'); }
  c.spin = Math.max(0, c.spin - dt); c.boost = Math.max(0, c.boost - dt); c.superT = Math.max(0, (c.superT || 0) - dt); c.shield = Math.max(0, c.shield - dt);
  if (G.mode === 'race' && thr > 0 && c.spin <= 0 && Math.abs(c.fs) < 60) c.stuckT = (c.stuckT || 0) + dt; else c.stuckT = Math.max(0, (c.stuckT || 0) - dt * 2);
  if (c.stuckT > 1.2) { c.stuckT = 0; c.ghost = 1.5; c.pLane = 0; c.laneTarget = 0; c.a = cl.ang[c.idx]; }
  c.ghost = Math.max(0, (c.ghost || 0) - dt);
  c.ramCool = Math.max(0, (c.ramCool || 0) - dt); c.hitCool = Math.max(0, c.hitCool - dt); c.wallCool = Math.max(0, c.wallCool - dt); c.padCool = Math.max(0, c.padCool - dt);
}

// ---------- Raketstart: gasa precis när ljuset slår om till grönt ----------
const ROCKET_WIN = { beginner: 0.5, easy: 0.4, lagom: 0.35, mid: 0.3, hard: 0.22 };
const ROCKET_AI = { beginner: 0, easy: 0.15, lagom: 0.22, mid: 0.3, hard: 0.45 };
function rocketReset() { G.rs = { edge: null, up: false, done: false, result: null }; }
function rocketTick() {
  if (G.demo || !G.player) return; if (!G.rs) rocketReset(); const R = G.rs; if (R.done) return;
  if (G.mode !== 'countdown' && G.mode !== 'race') return;
  const up = !!(keys.ArrowUp || keys.KeyW), win = ROCKET_WIN[G.diff.id] || 0.3;
  const now = G.mode === 'countdown' ? -G.countdown : G.time - (G.greenAt || 0); // sekunder relativt grönt
  if (up && !R.up) R.edge = now; R.up = up;
  if (G.mode !== 'race') return;
  // precis blivit grönt: AI-bilar kan också pricka starten
  if (!R.aiDone) { R.aiDone = true; const pr = ROCKET_AI[G.diff.id] || 0; if (!G.school) for (const c of G.cars) if (!c.isPlayer && Math.random() < pr) { giveBoost(c, 0.9, 1.4); c.vx += Math.cos(c.a) * 100; c.vy += Math.sin(c.a) * 100; } }
  if (R.edge != null && R.up) {
    if (R.edge >= -win && R.edge <= win) return rocketGo(true);
    if (R.edge < -win) return rocketGo(false, 'early');
  }
  if (now > win) rocketGo(false, 'late');
}
function rocketGo(ok, why) {
  const R = G.rs, P = G.player; R.done = true; R.result = ok ? 'ok' : why;
  if (ok) {
    giveBoost(P, 0.9, 1.4); P.vx += Math.cos(P.a) * 140; P.vy += Math.sin(P.a) * 140; G.cam.shake = 8;
    Snd.play('boost'); banner('RAKETSTART!', '#ffd600', 1.3); Voice.say('Raketstart!', true);
    for (let k = 0; k < 18; k++) { const a = P.a + Math.PI + (Math.random() - 0.5) * 1.2; G.parts.push({ x: P.x, y: P.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: 0.5, max: 0.5, size: 9, color: k % 2 ? '#ff9100' : '#ffd600', type: 'dot' }); }
    if (typeof CUP !== 'undefined' && CUP.active && SETTINGS.show) G.radio = { lines: [['goran', pickFrom('rocket', ROCKET_LINES)]], t: 4.5, icon: '🎙️' };
  } else {
    if (why === 'early') puff(P.x, P.y, 6);
    if (G.school) addText(P.x, P.y - 20, why === 'early' ? 'LITE FÖR TIDIGT!' : 'LITE FÖR SENT!', '#fff');
  }
}

// Turbo-typer: platta 0.8 s ×1.35, frågetecken 1.6 s ×1.45, superturbo 1.0 s ×1.7
function giveBoost(c, t, mul) { if (c.boost <= 0 || mul >= (c.boostMul || 0)) c.boostMul = mul; c.boost = Math.max(c.boost, t); }
// HOPP: dubbeltryck på Skift. Bilen hoppar över bilar framför (i luften krockar man inte med bilar på marken och missar hinder).
function tryHop(c) {
  if (!c || c.air > 0 || c.spin > 0 || (c.hopCool || 0) > 0) return false;
  const sp = Math.hypot(c.vx, c.vy); if (sp < 140) { c.vx += Math.cos(c.a) * (140 - sp); c.vy += Math.sin(c.a) * (140 - sp); }
  c.airMax = 0.62; c.air = c.airMax; c.hopCool = 1.4; Snd.play('jump'); puff(c.x, c.y, 6); if (c.isPlayer) addText(c.x, c.y - 34, 'HOPP!', '#fff'); logEv('hopp', G.mode);
  return true;
}
// SUPERTURBO v2: håll in Skift. Turbon startar efter 0,15 s (så att två snabba tryck = hopp, inte turbo),
// pågår så länge man håller och tömmer mätaren (full mätare ≈ 2,2 s). Man kan dosera: släpp och spara resten.
// Ingen extra knuff vid start – annars skulle snabba småtryck löna sig mer än att hålla in.
const SUPER_MIN = 20, SUPER_DRAIN = 45, SUPER_HOLD = 0.15;
function superMeterNews(c, was) {
  if (was < SUPER_MIN && c.meter >= SUPER_MIN && !c.superSaid) { c.superSaid = true; Snd.play('star'); addText(c.x, c.y, 'SUPERTURBO! HÅLL SKIFT', '#ff9100'); Voice.say('Superturbo! Håll in shift!'); }
  if (was < 100 && c.meter >= 100) { Snd.play('star'); addText(c.x, c.y - 26, 'FULL TANK!', '#ffd600'); }
}
function superHold(c, dt) {
  const held = !!(keys.ShiftLeft || keys.ShiftRight) && !G.paused && G.mode === 'race';
  const heldFor = held ? (performance.now() - (G.shiftDownAt || 0)) / 1000 : 0;
  const want = (held && heldFor >= SUPER_HOLD) || c.superAuto;
  if (c.superOn && (!want || c.meter <= 0 || c.spin > 0)) { c.superOn = false; c.superAuto = false; c.superSnd = 0; }
  else if (!c.superOn && want && c.meter >= SUPER_MIN && c.spin <= 0) {
    c.superOn = true; c.superSnd = 0; G.cam.shake = 6; Snd.play('boost'); addText(c.x, c.y, 'SUPERTURBO!', '#ff9100'); logEv('superturbo', 'start', Math.round(c.meter));
    for (let k = 0; k < 18; k++) { const a = Math.random() * TAU; G.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: 0.45, max: 0.45, size: 7, color: k % 2 ? '#40c4ff' : '#ffffff', type: 'dot' }); }
  }
  if (c.superOn) {
    c.meter = Math.max(0, c.meter - SUPER_DRAIN * dt); giveBoost(c, 0.12, 1.7); c.superT = 0.12;
    c.superSnd = (c.superSnd || 0) - dt; if (c.superSnd <= 0) { c.superSnd = 0.55; Snd.play('swoosh'); }
    if (c.meter <= 0) { c.superOn = false; c.superAuto = false; addText(c.x, c.y - 20, 'TOM!', '#b3e5fc'); }
  }
  c.meterReady = c.meter >= SUPER_MIN;
}
// MOTSTÅNDARNAS SUPERTURBO: mätaren fylls med tiden (de driftar inte som spelaren). Hur mycket beror på nivån:
// 🐣🐢 ingen, 🦊 små doser, 🐇🚀 hela mätaren. Används på raksträckor, oftare om bilen ligger efter spelaren.
const AI_SUPER_LINES = [n => `${n} tänder superturbon!`, n => `Där drar ${n} iväg på superturbo!`, n => `${n} trycker på den stora röda knappen!`, n => `Superturbo för ${n}! Håll i hattarna!`, n => `${n} har sparat turbo – och använder den NU!`, n => `Wiiiish! Det var ${n} på superturbo!`];
function aiSuper(c, dt) {
  const cfg = G.diff && G.diff.aiSuper; if (!cfg || G.demo || G.school || !G.T) return;
  if (G.mode !== 'race' || c.finished) { c.superOn = false; return; }
  if (c.superOn) {
    c.meter = Math.max(0, c.meter - SUPER_DRAIN * dt); c.superLeft -= SUPER_DRAIN * dt; giveBoost(c, 0.12, 1.6); c.superT = 0.12;
    if (c.meter <= 0 || c.superLeft <= 0 || c.spin > 0) c.superOn = false;
    return;
  }
  c.meter = Math.min(100, (c.meter || 0) + cfg.rate * dt * (0.85 + ((c.d.id.length * 7) % 5) * 0.08));
  c.aiSuperCool = Math.max(0, (c.aiSuperCool || 0) - dt);
  if (c.meter < cfg.dose || c.aiSuperCool > 0 || c.spin > 0 || c.air > 0 || G.raceT < 6) return;
  const cl = G.T.cl, N = G.T.N, a0 = cl.ang[c.idx], straight = Math.abs(angDiff(cl.ang[(c.idx + 18) % N], a0)) < 0.12 && Math.abs(angDiff(cl.ang[(c.idx + 40) % N], a0)) < 0.2;
  if (!straight) return;
  const P = G.player, behind = P && P.prog > c.prog;
  if (!behind && Math.random() > 0.35) { c.aiSuperCool = 1.5; return; } // ligger före: väntar oftare
  c.superOn = true; c.superLeft = cfg.dose; c.aiSuperCool = 4; logEv('superturbo', 'motståndare', c.who && c.who.name);
  const near = P && Math.hypot(P.x - c.x, P.y - c.y) < 1100;
  addText(c.x, c.y - 30, 'SUPERTURBO!', '#40c4ff'); if (near) Snd.play('boost');
  for (let k = 0; k < 14; k++) { const a = Math.random() * TAU; G.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, life: 0.4, max: 0.4, size: 6, color: k % 2 ? '#40c4ff' : '#ffffff', type: 'dot' }); }
  if (typeof CUP !== 'undefined' && CUP.active && SETTINGS.show && !G.radio && c.who && G.raceT - (G.aiSuperSaid || -99) > 14) G.aiSuperSaid = G.raceT, G.radio = { lines: [['goran', pickFrom('aisuper', AI_SUPER_LINES)(c.who.name)]], t: 3.5, icon: '🎙️' };
}
// används av testerna: kör en hel dos automatiskt
function useSuper(c) {
  if ((c.meter || 0) < SUPER_MIN || c.spin > 0) return;
  c.superAuto = true; superHold(c, 0); if (c.isPlayer) Voice.say('Superturbo!');
}
function endDrift(c) {
  if (c.isPlayer && c.driftPts > 3) addText(c.x, c.y - 30, '+' + Math.round(c.driftPts) + ' DRIFT', '#e1f5fe');
  if (G.school && c.isPlayer && (c.driftPts || 0) > 0 && G.school.onDrift) G.school.onDrift(c.driftLvl, c.driftPts);
  c.drift = false; c.driftT = 0; c.driftLvl = 0;
}
function tireFx(c, dt) {
  if (G.demo && !near(c) && !G.demo) return;
  const ls = Math.abs(-c.vx * Math.sin(c.a) + c.vy * Math.cos(c.a));
  const sliding = c.air <= 0 && (c.drift || (ls > 140 && Math.abs(c.fs) > 150));
  const ca = Math.cos(c.a), sa = Math.sin(c.a);
  const wl = [c.x - ca * 20 + sa * 15, c.y - sa * 20 - ca * 15], wr = [c.x - ca * 20 - sa * 15, c.y - sa * 20 + ca * 15];
  if (sliding) {
    if (c.lastW) { G.skids.push({ a: c.lastW[0], b: wl, life: 6 }, { a: c.lastW[1], b: wr, life: 6 }); if (G.skids.length > 700) G.skids.splice(0, G.skids.length - 700); }
    c.lastW = [wl, wr];
    if (Math.random() < dt * 25) G.parts.push({ x: (Math.random() < 0.5 ? wl : wr)[0], y: (Math.random() < 0.5 ? wl : wr)[1], vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, life: 0.7, max: 0.7, size: 12, color: 'rgba(230,230,230,0.7)', type: 'puff' });
    if (c.drift && c.driftLvl > 0 && Math.random() < dt * 40) { const w = Math.random() < 0.5 ? wl : wr; const a = Math.random() * TAU; G.parts.push({ x: w[0], y: w[1], vx: Math.cos(a) * 120 - ca * 80, vy: Math.sin(a) * 120 - sa * 80, life: 0.3, max: 0.3, size: 5, color: c.driftLvl === 2 ? '#ff9100' : '#40c4ff', type: 'dot' }); }
  } else c.lastW = null;
  if (c.isPlayer) Snd.skid(sliding && !G.demo, c.driftLvl || 0);
}
function spinOut(c, dur, why) {
  if (c.hitCool > 0 || c.finished && !c.isPlayer && false) return false;
  if (c.shield > 0) { c.shield = 0; c.hitCool = 0.6; if (near(c)) Snd.play('pop'); ring(c.x, c.y, '#4fc3f7'); return false; }
  if (c.spin > 0) return false;
  dur = Math.min(dur, SPIN_T); if (c.isPlayer) { G.spinLog = G.spinLog || {}; G.spinLog[why] = (G.spinLog[why] || 0) + 1; } c.spin = dur; c.spinDir = Math.random() < 0.5 ? -1 : 1; c.hitCool = dur + SPIN_SAFE; c.boost = 0; if (c.drift) { c.drift = false; c.driftLvl = 0; }
  stars(c.x, c.y);
  if (!c.isPlayer) showStewardSpin(c);
  if (c.isPlayer) { Snd.play('spin'); G.cam.shake = 10; if (G.time - G.hoppT > 7) { G.hoppT = G.time; Voice.say(['Hoppsan!', 'Oj oj oj!', 'Snurr!'][Math.floor(Math.random() * 3)]); } }
  return true;
}
function near(c) { return !G.demo && G.player && dist2(c.x, c.y, G.player.x, G.player.y) < 900 * 900; }

function effects(c, dt) {
  const T = G.T;
  c.surf = null;
  if (c.air > 0) return;
  for (const h of T.hazards) {
    if (dist2(c.x, c.y, h.x, h.y) < h.r * h.r * 0.85) {
      c.surf = h.kind;
      if (SPINHAZ[h.kind]) { if (spinOut(c, SPIN_T, 'haz')) { if (h.kind === 'lava') fire(c.x, c.y); else puff(c.x, c.y, 6); if (c.isPlayer) Snd.play('splash'); } }
      else if (SLIP[h.kind]) { if (Math.random() < dt * 8) G.parts.push({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 8, color: { ice: '#e1f5fe', saft: '#f48fb1', slime: '#b2ff59', puddle: '#81d4fa' }[h.kind], type: 'dot' }); }
      else if (h.kind === 'sand' && Math.abs(c.fs) > 100 && Math.random() < dt * 20) G.parts.push({ x: c.x - Math.cos(c.a) * 30, y: c.y - Math.sin(c.a) * 30, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, life: 0.6, max: 0.6, size: 10, color: '#e0b877', type: 'dot' });
    }
  }
  for (const b of T.boosts) {
    const dx = c.x - b.x, dy = c.y - b.y; const along = dx * Math.cos(b.a) + dy * Math.sin(b.a), side = -dx * Math.sin(b.a) + dy * Math.cos(b.a);
    if (Math.abs(along) < 55 && Math.abs(side) < 45 && c.padCool <= 0) { giveBoost(c, 0.8, 1.35); c.padCool = 0.5; if (c.isPlayer) Snd.play('boost'); }
  }
  if (!c.ghost) { for (const o of T.obstacles) collideCircle(c, o, false); for (const o of T.movers) collideCircle(c, o, true); }
  for (const p of T.props) {
    const R = p.r + CAR_R - 4, d2 = dist2(c.x, c.y, p.x, p.y); if (d2 > R * R || d2 < 1) continue;
    const d = Math.sqrt(d2), nx = (p.x - c.x) / d, ny = (p.y - c.y) / d;
    p.x = c.x + nx * R; p.y = c.y + ny * R;
    const vrel = (c.vx - p.vx) * nx + (c.vy - p.vy) * ny;
    if (vrel > 0) {
      p.vx += nx * vrel * 1.5 + (Math.random() - 0.5) * 60; p.vy += ny * vrel * 1.5 + (Math.random() - 0.5) * 60; p.va += (Math.random() - 0.5) * 14;
      const slow = 1 - 0.2 * Math.min(1, vrel / 300); c.vx *= slow; c.vy *= slow;
      if (c.isPlayer) p.hit = true;
      if (p.cool <= 0 && vrel > 80) { p.cool = 0.3; puff(p.x, p.y, 3); if (c.isPlayer) Snd.play('knock'); }
    }
  }
  // lådor
  for (const b of T.boxes) {
    if (b.alive && dist2(c.x, c.y, b.x, b.y) < 42 * 42) {
      b.alive = false; b.respawn = 3; ring(b.x, b.y, '#fff');
      if (!c.item && c.roulette <= 0) { c.roulette = c.isPlayer ? 1.2 : 0.8; if (c.isPlayer) Snd.play('pickup'); }
    }
  }
  for (const bl of G.blobs) {
    if (!bl.dead && bl.t > 0.3 && dist2(c.x, c.y, bl.x, bl.y) < (bl.r + CAR_R - 6) ** 2) { bl.dead = true; spinOut(c, SPIN_T, 'blob'); fire(bl.x, bl.y); if (near(c)) Snd.play('splash'); }
  }
}
function collideCircle(c, o, mover) {
  const R = o.r + CAR_R - 4; const d2 = dist2(c.x, c.y, o.x, o.y);
  if (d2 > R * R || d2 < 1) return;
  const d = Math.sqrt(d2), nx = (c.x - o.x) / d, ny = (c.y - o.y) / d;
  c.x = o.x + nx * R; c.y = o.y + ny * R;
  const vn = c.vx * nx + c.vy * ny;
  if (vn < 0) { c.vx -= nx * vn * 1.5; c.vy -= ny * vn * 1.5; c.vx *= 0.6; c.vy *= 0.6; }
  if (mover) spinOut(c, SPIN_T, 'mover');
  else if (c.wallCool <= 0 && Math.abs(vn) > 60) { c.wallCool = 0.4; puff(o.x, o.y, 6); if (c.isPlayer) { Snd.play('bonk'); G.cam.shake = 6; addText(c.x, c.y, 'BONK!', '#fff'); } }
}

// ---------- Power-ups ----------
function pickItem(place) {
  const tbl = [
    { turbo: 15, shield: 25, blob: 35, ball: 25 },
    { turbo: 25, shield: 20, blob: 25, ball: 30 },
    { turbo: 30, shield: 20, blob: 15, ball: 35 },
    { turbo: 40, shield: 15, blob: 10, ball: 35 },
    { turbo: 50, shield: 10, blob: 5, ball: 35 }][clamp(place, 0, 4)];
  let r = Math.random() * 100; for (const k in tbl) { r -= tbl[k]; if (r <= 0) return k; } return 'turbo';
}
function useItem(c) {
  const it = c.item; if (!it) return; c.item = null; c.itemAge = 0;
  const ca = Math.cos(c.a), sa = Math.sin(c.a);
  if (it === 'turbo') { giveBoost(c, 1.6, 1.45); c.vx += ca * 200; c.vy += sa * 200; if (near(c)) Snd.play('boost'); }
  else if (it === 'shield') { c.shield = 9; if (near(c)) Snd.play('shield'); }
  else if (it === 'blob') { G.blobs.push({ x: c.x - ca * 52, y: c.y - sa * 52, r: 21, t: 0, life: 15 }); if (near(c)) Snd.play('drop'); }
  else if (it === 'ball') { const sp = 950 + Math.max(0, c.fs) * 0.4; G.balls.push({ x: c.x + ca * 40, y: c.y + sa * 40, vx: ca * sp, vy: sa * sp, r: 15, life: 3, owner: c, age: 0, idx: c.idx, rot: 0 }); if (near(c)) Snd.play('shoot'); }
}
function aiItems(c, dt, place) {
  if (!c.item) return; c.itemAge += dt; c.itemDelay -= dt; if (c.itemDelay > 0) return;
  const T = G.T, cl = T.cl, N = T.N;
  if (Math.random() > G.diff.items) { c.itemDelay = 1.5; return; }
  let use = false;
  if (c.item === 'turbo') use = Math.abs(angDiff(cl.ang[(c.idx + 40) % N], cl.ang[c.idx])) < 0.4;
  else if (c.item === 'shield') use = true;
  else if (c.item === 'blob') {
    const P = G.player, pBehind = P && !G.demo && P.prog < c.prog && c.prog - P.prog < 90;
    use = (G.diff.id === 'hard' || !pBehind) && (G.cars.some(o => o !== c && !o.isPlayer && o.prog < c.prog && c.prog - o.prog < 40) || c.itemAge > 7);
  }
  else if (c.item === 'ball') {
    const P = G.player, pAhead = P && !G.demo && P.prog > c.prog && P.prog - c.prog < 80;
    use = G.cars.some(o => o !== c && (G.diff.homePlayer || !o.isPlayer) && o.prog > c.prog && o.prog - c.prog < 60 && Math.abs(angDiff(Math.atan2(o.y - c.y, o.x - c.x), c.a)) < 0.35) || (c.itemAge > 9 && (G.diff.homePlayer || !pAhead));
  }
  if (use) useItem(c); else c.itemDelay = 0.4;
}

function updateBalls(dt) {
  const T = G.T, cl = T.cl;
  for (const b of G.balls) {
    b.age += dt; b.life -= dt; b.rot += dt * 12;
    // målsökning (mild)
    let tgt = null, best = 700 * 700; const sp = Math.hypot(b.vx, b.vy), ang = Math.atan2(b.vy, b.vx);
    for (const c of G.cars) {
      if (c === b.owner && b.age < 1.2) continue;
      if (c.isPlayer && !b.owner.isPlayer && !G.diff.homePlayer) continue;
      const d2 = dist2(c.x, c.y, b.x, b.y); if (d2 < best && Math.abs(angDiff(Math.atan2(c.y - b.y, c.x - b.x), ang)) < 0.9) { best = d2; tgt = c; }
    }
    if (tgt) { const want = Math.atan2(tgt.y - b.y, tgt.x - b.x); const na = ang + clamp(angDiff(want, ang), -2.2 * dt, 2.2 * dt); b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.idx = nearestLocal(cl, b.x, b.y, b.idx, 12); const i = b.idx;
    const lat = (b.x - cl.px[i]) * cl.nx[i] + (b.y - cl.py[i]) * cl.ny[i]; const lim = T.hw - b.r;
    if (Math.abs(lat) > lim) { const s = Math.sign(lat); b.x -= cl.nx[i] * s * (Math.abs(lat) - lim); b.y -= cl.ny[i] * s * (Math.abs(lat) - lim); const vn = b.vx * cl.nx[i] + b.vy * cl.ny[i]; if (vn * s > 0) { b.vx -= 2 * vn * cl.nx[i]; b.vy -= 2 * vn * cl.ny[i]; if (near(b.owner) || true) { if (!G.demo && dist2(b.x, b.y, G.cam.x, G.cam.y) < 800 * 800) Snd.play('boing'); } } }
    for (const o of T.obstacles) { const d2 = dist2(b.x, b.y, o.x, o.y), R = o.r + b.r; if (d2 < R * R) { const d = Math.sqrt(d2) || 1, nx = (b.x - o.x) / d, ny = (b.y - o.y) / d; b.x = o.x + nx * R; b.y = o.y + ny * R; const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; } } }
    for (const c of G.cars) {
      if (c === b.owner) continue; if (c.air > 0) continue;
      if (dist2(c.x, c.y, b.x, b.y) < (b.r + CAR_R) ** 2) { b.life = 0; if (spinOut(c, SPIN_T, 'ball')) { c.vx *= 0.65; c.vy *= 0.65; } ring(b.x, b.y, '#ffeb3b'); if (near(c)) Snd.play('pop'); }
    }
    for (const bl of G.blobs) if (!bl.dead && dist2(bl.x, bl.y, b.x, b.y) < (bl.r + b.r) ** 2) { bl.dead = true; b.life = 0; fire(bl.x, bl.y); }
    if (b.life <= 0 && !b.poofed) { b.poofed = true; puff(b.x, b.y, 6); }
  }
  G.balls = G.balls.filter(b => b.life > 0);
  for (const bl of G.blobs) { bl.t += dt; bl.life -= dt; if (bl.life <= 0) bl.dead = true; }
  G.blobs = G.blobs.filter(b => !b.dead);
}

// ---------- Partiklar ----------
function sparks(x, y, col, n) { for (let k = 0; k < n; k++) { const a = Math.random() * TAU, s = 100 + Math.random() * 250; G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35, max: 0.35, size: 5, color: col, type: 'dot' }); } }
function puff(x, y, n) { for (let k = 0; k < n; k++) { const a = Math.random() * TAU, s = 30 + Math.random() * 80; G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, max: 0.6, size: 16, color: 'rgba(255,255,255,0.8)', type: 'puff' }); } }
function stars(x, y) { for (let k = 0; k < 5; k++) G.parts.push({ x, y, vx: 0, vy: 0, life: 1.1, max: 1.1, size: 12, color: '#ffeb3b', type: 'star', ph: k / 5 * TAU }); }
function ring(x, y, col) { G.parts.push({ x, y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 50, color: col, type: 'ring' }); }
function fire(x, y) { for (let k = 0; k < 14; k++) { const a = Math.random() * TAU, s = 50 + Math.random() * 150; G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.7, max: 0.7, size: 12, color: ['#ff5722', '#ffc107', '#ff9800'][k % 3], type: 'dot' }); } }
function addText(x, y, text, color) { G.parts.push({ x, y, vx: 0, vy: -60, life: 0.8, max: 0.8, size: 30, color, type: 'text', text }); }
function confetti() { const p = G.player; for (let k = 0; k < 120; k++) { const a = Math.random() * TAU, s = 150 + Math.random() * 500; G.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 2 + Math.random(), max: 3, size: 10, color: `hsl(${Math.random() * 360},90%,60%)`, type: 'conf', rot: Math.random() * 6 }); } }

// Bilar med eget spår: RC-racern pruttar eld, Återvinnaren blåser gröna bio-avgaser med löv
function carTrail(c, dt) {
  const tr = c.d && c.d.trail; if (!tr || G.parts.length > 520) return;
  const sp = Math.hypot(c.vx, c.vy); c.trailT = (c.trailT || 0) - dt; if (c.trailT > 0) return;
  const ca = Math.cos(c.a), sa = Math.sin(c.a), back = (bx, by) => [c.x + ca * bx - sa * by, c.y + sa * bx + ca * by];
  if (tr === 'fire') {
    c.trailT = c.boost > 0 ? 0.025 : sp > 40 ? 0.05 : 0.14;
    const [x, y] = back(-42, (Math.random() - 0.5) * 16), s = 40 + Math.random() * 60;
    G.parts.push({ x, y, vx: -ca * s + c.vx * 0.2 + (Math.random() - 0.5) * 30, vy: -sa * s + c.vy * 0.2 + (Math.random() - 0.5) * 30, life: 0.45, max: 0.45, size: c.boost > 0 ? 13 : 9, type: 'flame' });
    // då och då en ordentlig eldprutt
    c.fartT = (c.fartT == null ? 3 + Math.random() * 4 : c.fartT) - 0.05;
    if (c.fartT <= 0 && sp > 60) { c.fartT = 6 + Math.random() * 6; for (let k = 0; k < 12; k++) { const a = c.a + Math.PI + (Math.random() - 0.5) * 1.1, v = 90 + Math.random() * 170; const [fx, fy] = back(-44, (Math.random() - 0.5) * 12); G.parts.push({ x: fx, y: fy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6, max: 0.6, size: 15 + Math.random() * 8, type: 'flame' }); }
      if (c.isPlayer) { addText(c.x - ca * 60, c.y - sa * 60, 'PRUTT! 🔥', '#ffab40'); if (SETTINGS.sfx) Snd.horn('prutt'); } }
  } else if (tr === 'bio') {
    c.trailT = c.boost > 0 ? 0.05 : sp > 40 ? 0.09 : 0.22;
    const [x, y] = back(14, -15), s = 20 + Math.random() * 30, a = c.a + Math.PI + (Math.random() - 0.5) * 0.8;
    G.parts.push({ x, y, vx: Math.cos(a) * s + c.vx * 0.15, vy: Math.sin(a) * s + c.vy * 0.15, life: 1.1, max: 1.1, size: 7 + Math.random() * 5, color: ['#9ccc65', '#aed581', '#66bb6a'][Math.floor(Math.random() * 3)], type: 'puff' });
    if (Math.random() < 0.18) G.parts.push({ x, y, vx: Math.cos(a) * (s + 30), vy: Math.sin(a) * (s + 30), life: 1.4, max: 1.4, size: 7, color: Math.random() < 0.5 ? '#66bb6a' : '#9ccc65', type: 'leaf', rot: Math.random() * TAU });
  }
}
function updateParts(dt) {
  for (const p of G.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.type !== 'text') { p.vx *= Math.exp(-3 * dt); p.vy *= Math.exp(-3 * dt); } if (p.type === 'conf') p.rot += dt * 8; if (p.type === 'leaf') p.rot += dt * 5; }
  G.parts = G.parts.filter(p => p.life > 0);
  if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
}

// ---------- Uppdatering ----------
function placeOf(c) { return G.order ? G.order.indexOf(c) : 0; }
function update(dt) {
  if (G.mode === 'city') { cityUpdate(dt); return; }
  if (G.mode === 'build') { builderUpdate(dt); return; }
  const T = G.T; if (!T) return;
  G.time += dt;
  if (G.mode === 'show') { showUpdate(dt); return; }
  if (G.mode === 'brief') { if (G.brief) G.brief.t += dt; return; }
  if (G.mode === 'gift') { giftUpdate(dt); return; }
  showRaceTick(dt);
  if (G.mode === 'countdown') {
    G.countdown -= dt; const n = Math.ceil(G.countdown);
    if (n !== G.lastCount) { G.lastCount = n; if (n > 3) { } else if (n > 0) { Snd.play('beep', false); Voice.say(['', 'Ett', 'Två', 'Tre'][n], true); } else { Snd.play('beep', true); Voice.say('Kör!', true); G.mode = 'race'; G.greenAt = G.time; banner('KÖR!', '#76ff03', 1); } }
  }
  if (G.mode === 'race' || G.mode === 'finish') G.raceT += dt;
  if (G.letters && G.mode === 'race') for (const L of G.letters) if (!L.got && Math.hypot(L.x - G.player.x, L.y - G.player.y) < 60) { L.got = true; collectLetter(L.x, L.y); }
  rocketTick();
  // rörliga hinder
  for (const m of T.movers) {
    const off = m.amp * Math.sin(G.time * m.speed + m.ph); const vel = Math.cos(G.time * m.speed + m.ph);
    const cl = T.cl; m.x = cl.px[m.i] + cl.nx[m.i] * off; m.y = cl.py[m.i] + cl.ny[m.i] * off; m.a = Math.atan2(cl.ny[m.i], cl.nx[m.i]) + (vel < 0 ? Math.PI : 0);
  }
  for (const p of T.props) {
    p.cool = Math.max(0, p.cool - dt);
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 2) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; const f = Math.exp(-2.4 * dt); p.vx *= f; p.vy *= f; p.va *= f;
    }
    const cl = T.cl; p.idx = nearestLocal(cl, p.x, p.y, p.idx, 12); const i = p.idx;
    const lat = (p.x - cl.px[i]) * cl.nx[i] + (p.y - cl.py[i]) * cl.ny[i], lim = T.hw - p.r;
    if (Math.abs(lat) > lim) { const sg = Math.sign(lat); p.x -= cl.nx[i] * sg * (Math.abs(lat) - lim); p.y -= cl.ny[i] * sg * (Math.abs(lat) - lim); const vn = p.vx * cl.nx[i] + p.vy * cl.ny[i]; if (vn * sg > 0) { p.vx -= 1.6 * vn * cl.nx[i]; p.vy -= 1.6 * vn * cl.ny[i]; } }
    else if (!p.fixed && sp < 20 && Math.abs(lat) < T.hw * 0.5) { const sg = lat >= 0 ? 1 : -1; p.x += cl.nx[i] * sg * 25 * dt; p.y += cl.ny[i] * sg * 25 * dt; }
  }
  for (const b of T.boxes) if (!b.alive) { b.respawn -= dt; if (b.respawn <= 0) b.alive = true; }
  // ordning
  G.order = [...G.cars].sort((a, b) => (a.finished && b.finished) ? a.place - b.place : a.finished ? -1 : b.finished ? 1 : b.prog - a.prog);
  const P = G.player;
  for (const c of G.cars) {
    const place = G.order.indexOf(c);
    // rubberband för datorbilar
    if (!c.isPlayer) {
      let f = 1; const ref = G.demo ? null : P;
      if (ref && !c.noRubber) { const ahead = (c.prog - ref.prog) * 10; if (ahead > G.diff.ahead) f = 0.84; else if (ahead < -700) f = G.diff.behindBoost; }
      c.rubber += (f - c.rubber) * Math.min(1, dt * 0.8);
      c.cap = CAP * (G.demo ? 0.9 : G.diff.ai) * c.skill * c.rubber;
    } else c.cap = CAP;
    const ctl = (c.isPlayer && !c.finished) ? playerControl(c, dt) : aiControl(c, dt);
    stepCar(c, ctl, dt);
    effects(c, dt);
    tireFx(c, dt);
    if (c.roulette > 0) { c.roulette -= dt; if (c.isPlayer && Math.floor(c.roulette * 12) !== Math.floor((c.roulette + dt) * 12)) { Snd.play('tick'); c.rouletteShow = ['turbo', 'shield', 'blob', 'ball'][Math.floor(Math.random() * 4)]; } if (c.roulette <= 0) { c.item = pickItem(place); c.itemDelay = 0.8 + Math.random() * 2; c.itemAge = 0; if (c.isPlayer) { Snd.play('got'); Voice.say(ITEM_SAY[c.item]); } } }
    if (!c.isPlayer || c.finished) aiItems(c, dt, place);
    if (c.boost > 0 && Math.random() < dt * 30) G.parts.push({ x: c.x - Math.cos(c.a) * 34, y: c.y - Math.sin(c.a) * 34, vx: -Math.cos(c.a) * 80 + (Math.random() - 0.5) * 40, vy: -Math.sin(c.a) * 80 + (Math.random() - 0.5) * 40, life: 0.35, max: 0.35, size: 12, color: Math.random() < 0.5 ? '#ff9800' : '#ffeb3b', type: 'dot' });
    // varv & mål
    if (!c.finished && c.prog >= G.laps * T.N) {
      c.finished = true; c.place = ++G.finishCount;
      if (c.isPlayer) playerFinished();
    }
    if (c.isPlayer && !c.finished && !G.school) {
      const lap = Math.floor(c.prog / T.N) + 1; if (c.lastLap && lap > c.lastLap && lap <= G.laps) { Snd.play('lap'); if (lap === G.laps) { banner('SISTA VARVET!', '#ffeb3b', 2); Voice.say('Sista varvet!'); } else { banner('VARV ' + lap, '#fff', 1.5); Voice.say('Varv ' + lap); } }
      c.lastLap = Math.max(c.lastLap || 1, lap);
      // fel håll
      const fwd = Math.cos(angDiff(Math.atan2(c.vy, c.vx), T.cl.ang[c.idx]));
      if (fwd < -0.5 && Math.hypot(c.vx, c.vy) > 60) c.wrongT += dt; else c.wrongT = Math.max(0, c.wrongT - dt * 2);
    }
  }
  // bil mot bil
  for (let i = 0; i < G.cars.length; i++) for (let j = i + 1; j < G.cars.length; j++) {
    const a = G.cars[i], b = G.cars[j]; if ((a.air > 0) !== (b.air > 0) || a.ghost > 0 || b.ghost > 0) continue;
    const d2 = dist2(a.x, a.y, b.x, b.y), R = CAR_R * 2 - 4; if (d2 > R * R || d2 < 1) continue;
    const d = Math.sqrt(d2), nx = (b.x - a.x) / d, ny = (b.y - a.y) / d, ov = (R - d) / 2;
    a.x -= nx * ov; a.y -= ny * ov; b.x += nx * ov; b.y += ny * ov;
    const va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny;
    if (va - vb > 0) { const imp = (va - vb) * 0.8; a.vx -= nx * imp; a.vy -= ny * imp; b.vx += nx * imp; b.vy += ny * imp; if ((a.isPlayer || b.isPlayer) && imp > 80) Snd.play('bonk'); }
    // Sköld = kraftig knuff (ingen snurr)
    const ram = (s1, s2, dx, dy) => { if (s1.shield > 0 && s2.shield <= 0 && (s2.ramCool || 0) <= 0) { s2.ramCool = 0.6; s2.vx = s2.vx * 0.7 + dx * 420; s2.vy = s2.vy * 0.7 + dy * 420; addText(s2.x, s2.y, 'BOING!', '#4fc3f7'); ring(s2.x, s2.y, '#4fc3f7'); if (s1.isPlayer || s2.isPlayer) { Snd.play('boing'); G.cam.shake = 6; } } };
    ram(a, b, nx, ny); ram(b, a, -nx, -ny);
  }
  updateBalls(dt);
  updateParts(dt);
  if (G.school && G.mode === 'race') schoolUpdate(dt);
  // kamera
  const cam = G.cam, tgt = G.demo ? G.order[0] : P;
  const follow = !G.demo && SETTINGS.cam !== 'fixed';
  const la = follow ? 0 : 0.35;
  const tx = tgt.x + tgt.vx * la, ty = tgt.y + tgt.vy * la, k = follow ? 12 : 4;
  cam.x += (tx - cam.x) * Math.min(1, dt * k); cam.y += (ty - cam.y) * Math.min(1, dt * k);
  if (follow) { if (tgt.spin <= 0) cam.a += angDiff(tgt.a, cam.a) * Math.min(1, dt * 3.5); } else cam.a = -Math.PI / 2;
  const spd = Math.hypot(tgt.vx, tgt.vy) / CAP; cam.vh += ((G.demo ? 1300 : (follow ? 1050 : 980) + spd * 140) - cam.vh) * Math.min(1, dt * 1.5);
  cam.shake = Math.max(0, cam.shake - dt * 30);
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  if (G.hintT > 0 && G.mode === 'race') G.hintT -= dt;
  if (!G.demo) Snd.engine(G.mode === 'race' || G.mode === 'countdown', clamp(Math.abs(P.fs) / (CAP * 1.4), 0, 1));
  if (G.mode === 'finish') { victoryUpdate(dt); G.finishT -= dt; if (G.finishT <= 0) { G.mode = 'done'; Snd.engine(false, 0); raceMathBonus(showResults); } }
  // demo: starta om när ledaren gått 3 varv
  if (G.demo && G.order[0].prog > T.N * 3) startDemo();
}
window.__TRf = { update: (dt) => update(dt), keys, useItem, useSuper };
function banner(text, color, t) { G.banner = { text, color, t, max: t }; }
function playerFinished() {
  const p = G.player; Snd.skid(false, 0); G.mode = 'finish'; G.finishT = 5; p.finalPlace = p.place;
  if (!G.school && !G.demo) { victoryStart(); G.finishT = 6.6; }
  banner('MÅL!', '#ffeb3b', 3); confetti(); Snd.play('fanfare');
  const nm = G.playerName ? ', ' + G.playerName.toLowerCase() : '';
  setTimeout(() => Voice.say(p.place <= 3 ? `Du kom på ${PLACE_SAY[p.place - 1]} plats! Bra jobbat${nm}!` : `Du kom i mål! Bra kört${nm}!`, true), 900);
}

// ---------- Rendering ----------
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (G.mode === 'show') { drawShow(); return; }
  if (G.mode === 'city' && G.city) { drawCity(); return; }
  if (G.mode === 'build' && BUILDER) { drawBuilder(); return; }
  const T = G.T; if (!T) { ctx.fillStyle = '#1a237e'; ctx.fillRect(0, 0, W, H); return; }
  const cam = G.cam, zoom = H / cam.vh;
  const sx = (Math.random() - 0.5) * cam.shake * DPR, sy = (Math.random() - 0.5) * cam.shake * DPR;
  const follow = !G.demo && SETTINGS.cam !== 'fixed';
  cam.rot = follow ? -Math.PI / 2 - cam.a : 0;
  let view;
  if (follow) {
    ctx.setTransform(1, 0, 0, 1, W / 2 + sx, H * 0.66 + sy); ctx.rotate(cam.rot); ctx.scale(zoom, zoom); ctx.translate(-cam.x, -cam.y);
    const R = Math.hypot(W / 2, H * 0.66) / zoom + 80; view = { x0: cam.x - R, y0: cam.y - R, x1: cam.x + R, y1: cam.y + R };
  } else {
    ctx.setTransform(zoom, 0, 0, zoom, W / 2 - cam.x * zoom + sx, H / 2 - cam.y * zoom + sy);
    const hw2 = W / 2 / zoom + 80, hh2 = H / 2 / zoom + 80;
    view = { x0: cam.x - hw2, y0: cam.y - hh2, x1: cam.x + hw2, y1: cam.y + hh2 };
  }
  const inV = (x, y, r) => x + r > view.x0 && x - r < view.x1 && y + r > view.y0 && y - r < view.y1;
  const t = G.time;
  drawTrackBase(ctx, T, view, t);
  if (G.skids && G.skids.length) { ctx.lineCap = 'round'; ctx.lineWidth = 7; for (const k of G.skids) { if (!inV(k.b[0], k.b[1], 20)) continue; ctx.strokeStyle = `rgba(20,20,25,${Math.min(0.28, k.life * 0.05)})`; ctx.beginPath(); ctx.moveTo(k.a[0], k.a[1]); ctx.lineTo(k.b[0], k.b[1]); ctx.stroke(); } }
  for (const h of T.hazards) if (inV(h.x, h.y, h.r)) { drawHazard(ctx, h, t); if (SPINHAZ[h.kind]) drawWarn(ctx, h.x, h.y, h.r * 1.15, t); }
  for (const b of T.boosts) if (inV(b.x, b.y, 80)) drawPad(ctx, b, t);
  for (const r of T.ramps) if (inV(r.x, r.y, T.hw)) drawRamp(ctx, r, T.hw, t);
  for (const b of T.boxes) if (b.alive && inV(b.x, b.y, 40)) drawItemBox(ctx, b.x, b.y, t, b.ph);
  if (G.letters) for (const L of G.letters) if (!L.got && inV(L.x, L.y, 50)) drawGoldLetter(ctx, L.x, L.y, t, G.cam.rot || 0);
  for (const b of G.blobs) if (inV(b.x, b.y, 40)) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(b.x + 4, b.y + 6, b.r, b.r * 0.8, 0, 0, TAU); ctx.fill(); drawBlob(ctx, b.x, b.y, b.r * Math.min(1, b.t * 4), t); drawWarn(ctx, b.x, b.y, b.r * 1.3, t); }
  if (G.school) schoolDraw(ctx, t, inV);
  for (const o of T.obstacles) if (inV(o.x, o.y, 60)) drawObstacle(ctx, o, t);
  for (const p of T.props) if (inV(p.x, p.y, 40)) drawObstacle(ctx, p, t);
  for (const m of T.movers) if (inV(m.x, m.y, 80)) { drawWarn(ctx, m.x, m.y, m.r * 1.35, t); drawMover(ctx, m, t); }
  // spelarmarkering
  const P = G.player;
  if (!G.demo) { ctx.strokeStyle = `rgba(255,235,59,${0.5 + Math.sin(t * 6) * 0.3})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(P.x, P.y, 42, 0, TAU); ctx.stroke(); }
  const cars = [...G.cars].sort((a, b) => (a.air > 0) - (b.air > 0));
  for (const c of cars) if (inV(c.x, c.y, 60)) drawCarWorld(c, t);
  for (const b of G.balls) if (inV(b.x, b.y, 30)) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(b.x + 5, b.y + 8, b.r, 0, TAU); ctx.fill(); drawBall(ctx, b.x, b.y, b.r, b.rot); }
  drawParts(ctx);
  if (T.tunnel) drawTunnel(ctx, T, t);
  if (!G.demo && !follow) { // pil ovanför spelaren
    const bob = Math.sin(t * 5) * 5; ctx.fillStyle = '#ffeb3b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(P.x, P.y - 52 + bob); ctx.lineTo(P.x - 13, P.y - 72 + bob); ctx.lineTo(P.x + 13, P.y - 72 + bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!G.demo && G.mode !== 'done' && G.mode !== 'gift') { if (G.school) drawSchoolHUD(); else drawHUD(); } else if (G.mode === 'done') { ctx.fillStyle = 'rgba(10,15,60,0.3)'; ctx.fillRect(0, 0, W, H); } else { ctx.fillStyle = 'rgba(10,15,60,0.35)'; ctx.fillRect(0, 0, W, H); }
  if (G.mode === 'finish' && G.victory) drawVictory();
  if (G.mode === 'brief' && G.school && G.brief) drawSchoolBrief();
  if (G.mode === 'gift' && G.gift) drawGift();
}

// små bilder i HUD:en (ansikten och bilar i ställningslistan) ritas en gång per lopp i stället för varje bildruta
function hudSprite(key, w, h, draw) { const S = G.hudSpr || (G.hudSpr = {}); if (!S[key]) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d')); S[key] = cv; } return S[key]; }
function drawCarWorld(c, t) {
  const air = c.air > 0 ? Math.sin(Math.PI * (1 - c.air / c.airMax)) : 0;
  const sc = 1 + air * 0.35;
  ctx.save(); ctx.translate(c.x + 5 + air * 22, c.y + 8 + air * 30); ctx.rotate(c.a + (c.visYaw || 0)); ctx.fillStyle = `rgba(0,0,0,${0.3 - air * 0.12})`; rr(ctx, -34, -19, 68, 38, 14); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a + (c.visYaw || 0)); ctx.scale(sc, sc); if (c.ghost > 0) ctx.globalAlpha = 0.55 + Math.sin(t * 20) * 0.2;
  if (c.boost > 0) { const sup = c.superT > 0; for (let k = 0; k < 3; k++) { ctx.fillStyle = sup ? ['#2979ff', '#40c4ff', '#ffffff'][k] : ['#ff5722', '#ff9800', '#ffeb3b'][k]; const L = (sup ? 55 : 30) - k * 8 + Math.random() * 12; ctx.beginPath(); ctx.moveTo(-30, -9 + k * 3); ctx.lineTo(-30 - L, 0); ctx.lineTo(-30, 9 - k * 3); ctx.fill(); } }
  drawCar(ctx, c.d, t, { boost: c.boost > 0, siren: c.siren });
  ctx.restore(); ctx.globalAlpha = 1;
  if (c.shield > 0) { const a = c.shield < 2 ? (Math.floor(t * 10) % 2 ? 0.2 : 0.55) : 0.45; ctx.fillStyle = `rgba(79,195,247,${a * 0.5})`; ctx.strokeStyle = `rgba(225,245,254,${a + 0.2})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(c.x, c.y, 44 * sc, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(c.x, c.y, 36 * sc, t * 3, t * 3 + 1); ctx.stroke(); }
  if (c.spin > 0) { for (let k = 0; k < 3; k++) { const a = t * 6 + k / 3 * TAU; drawStar(ctx, c.x + Math.cos(a) * 30, c.y - 30 + Math.sin(a) * 10, 9, '#ffeb3b'); } }
}
function drawStar(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, rr2 = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.stroke(); }

function drawParts(ctx) {
  for (const p of G.parts) {
    const f = p.life / p.max;
    if (p.type === 'dot') { ctx.globalAlpha = f; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + f * 0.5), 0, TAU); ctx.fill(); }
    else if (p.type === 'flame') { const e = 1 - f; ctx.globalAlpha = Math.min(1, f * 1.6); ctx.fillStyle = e < 0.25 ? '#fff59d' : e < 0.5 ? '#ffb300' : e < 0.75 ? '#ff5722' : 'rgba(90,60,50,0.6)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.6 + e * 0.8), 0, TAU); ctx.fill(); }
    else if (p.type === 'leaf') { ctx.globalAlpha = Math.min(1, f * 2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#33691e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.lineTo(p.size, 0); ctx.stroke(); ctx.restore(); }
    else if (p.type === 'puff') { ctx.globalAlpha = f * 0.7; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.6 - f), 0, TAU); ctx.fill(); }
    else if (p.type === 'ring') { ctx.globalAlpha = f; ctx.strokeStyle = p.color; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.5 - f), 0, TAU); ctx.stroke(); }
    else if (p.type === 'star') { ctx.globalAlpha = Math.min(1, f * 2); const a = p.ph + (1 - f) * 5, r = 20 + (1 - f) * 40; drawStar(ctx, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r - (1 - f) * 30, p.size, p.color); }
    else if (p.type === 'text') { ctx.globalAlpha = Math.min(1, f * 2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-G.cam.rot); ctx.font = `bold ${p.size}px "Arial Rounded MT Bold", Arial, sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.strokeText(p.text, 0, 0); ctx.fillStyle = p.color; ctx.fillText(p.text, 0, 0); ctx.restore(); }
    else if (p.type === 'conf') { ctx.globalAlpha = Math.min(1, f); ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}

function drawHazard(ctx, h, t) {
  const { x, y, r } = h;
  ctx.save(); ctx.translate(x, y); ctx.rotate(h.a);
  if (h.kind === 'saft') {
    ctx.fillStyle = 'rgba(233,30,99,0.75)'; blobShape(ctx, r, h.seed); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.3, r * 0.12, -0.4, 0, TAU); ctx.fill();
    // omvält glas
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.save(); ctx.translate(r * 0.8, r * 0.1); ctx.rotate(0.6); rr(ctx, -16, -12, 32, 24, 6); ctx.fill(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  } else if (h.kind === 'ice') {
    ctx.fillStyle = 'rgba(179,229,252,0.85)'; blobShape(ctx, r, h.seed); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-r * 0.5 + k * 20, -r * 0.3 + k * 10); ctx.lineTo(-r * 0.1 + k * 20, -r * 0.45 + k * 10); ctx.stroke(); }
    const s = (Math.sin(t * 3 + h.seed) + 1) / 2; drawStar(ctx, r * 0.3, -r * 0.2, 6 + s * 5, '#fff');
  } else if (h.kind === 'sand') {
    ctx.fillStyle = 'rgba(240,210,150,0.95)'; blobShape(ctx, r, h.seed); ctx.fill();
    ctx.fillStyle = 'rgba(190,140,70,0.5)'; for (let k = 0; k < 18; k++) { const a = k * 2.4, d = (k % 5) / 5 * r * 0.8; ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 4, 4); }
    ctx.strokeStyle = 'rgba(190,140,70,0.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, r * 0.2, r * 0.5, 3.6, 5.8); ctx.stroke();
  } else if (h.kind === 'slime') {
    ctx.fillStyle = 'rgba(118,255,3,0.8)'; blobShape(ctx, r, h.seed); ctx.fill(); ctx.strokeStyle = '#33691e'; ctx.lineWidth = 4; ctx.stroke();
    for (let k = 0; k < 3; k++) { const ph = (t * 0.7 + k / 3 + h.seed) % 1; ctx.fillStyle = `rgba(220,255,160,${1 - ph})`; ctx.beginPath(); ctx.arc(Math.cos(k * 2.2) * r * 0.4, Math.sin(k * 2.2) * r * 0.3, 5 + ph * 10, 0, TAU); ctx.fill(); }
  } else if (h.kind === 'puddle') {
    ctx.fillStyle = 'rgba(66,165,245,0.75)'; blobShape(ctx, r, h.seed); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; const ph = (t * 0.8 + h.seed) % 1; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.3 + ph * r * 0.5, (r * 0.3 + ph * r * 0.5) * 0.7, 0, 0, TAU); ctx.globalAlpha = 1 - ph; ctx.stroke(); ctx.globalAlpha = 1;
  } else if (h.kind === 'oil') {
    ctx.fillStyle = '#16161c'; blobShape(ctx, r, h.seed); ctx.fill();
    const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, 'rgba(255,0,200,0.35)'); g.addColorStop(0.5, 'rgba(0,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,0,0.3)'); ctx.fillStyle = g; blobShape(ctx, r * 0.7, h.seed + 1); ctx.fill();
  } else if (h.kind === 'lava') {
    const g = 0.7 + Math.sin(t * 3 + h.seed) * 0.3;
    ctx.fillStyle = '#2b1810'; blobShape(ctx, r * 1.1, h.seed); ctx.fill();
    ctx.fillStyle = `rgb(255,${80 + 70 * g | 0},20)`; blobShape(ctx, r * 0.92, h.seed); ctx.fill();
    ctx.fillStyle = '#ffeb3b'; for (let k = 0; k < 3; k++) { const ph = (t * 0.8 + k / 3 + h.seed) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(Math.cos(k * 2.1) * r * 0.4, Math.sin(k * 2.1) * r * 0.3, 4 + ph * 12, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  }
  ctx.restore();
}
function drawWarn(ctx, x, y, r, t) {
  const p = (Math.sin(t * 7) + 1) / 2;
  ctx.save(); ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = `rgba(255,23,68,${0.55 + p * 0.45})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r + p * 6, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.translate(x, y); ctx.rotate(-G.cam.rot); ctx.translate(0, -r - 26);
  ctx.fillStyle = '#ffd600'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(17, 13); ctx.lineTo(-17, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a1033'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 3);
  ctx.restore();
}
function blobShape(ctx, r, seed) { ctx.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * TAU, rr2 = r * (0.85 + 0.15 * Math.sin(k * 2.3 + seed * 3)); k ? ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.85) : ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.85); } ctx.closePath(); }
function drawPad(ctx, b, t) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
  ctx.fillStyle = '#1b1b2f'; rr(ctx, -55, -42, 110, 84, 14); ctx.fill(); ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 4; ctx.stroke();
  for (let k = 0; k < 3; k++) { const ph = ((t * 2.5 - k * 0.33) % 1 + 1) % 1; ctx.strokeStyle = `rgba(255,${150 + 100 * ph | 0},0,${0.4 + 0.6 * ph})`; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); const x = -30 + k * 26; ctx.moveTo(x - 10, -24); ctx.lineTo(x + 8, 0); ctx.lineTo(x - 10, 24); ctx.stroke(); }
  ctx.restore();
}
function drawRamp(ctx, r, hw, t) {
  ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.a); const w = hw - 8;
  if (r.kind === 'book') { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-26, -w + 8, 60, w * 2); ctx.fillStyle = '#1565c0'; ctx.fillRect(-34, -w, 60, w * 2); ctx.fillStyle = '#fff8e1'; ctx.fillRect(-30, -w + 6, 52, w * 2 - 12); ctx.fillStyle = '#1565c0'; ctx.fillRect(-34, -4, 60, 8); ctx.fillStyle = '#e53935'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.rotate(Math.PI / 2); ctx.fillText('SAGOR', -w / 2, 0); ctx.fillText('SAGOR', w / 2, 0); ctx.restore(); }
  else if (r.kind === 'wave') { for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#e1f5fe' : '#29b6f6'; ctx.fillRect(-30 + k * 12, -w, 12, w * 2); } ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); for (let yy = -w; yy <= w; yy += 10) ctx.lineTo(32 + Math.sin(yy / 12 + t * 4) * 5, yy); ctx.stroke(); }
  else if (r.kind === 'neon') { ctx.fillStyle = '#1a1040'; rr(ctx, -35, -w, 65, w * 2, 10); ctx.fill(); ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 16; ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 5; ctx.stroke(); ctx.shadowBlur = 0; for (let k = 0; k < 3; k++) { ctx.strokeStyle = `rgba(224,64,251,${0.4 + 0.6 * (((t * 2 + k / 3) % 1))})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-25 + k * 18, -w + 10); ctx.lineTo(-25 + k * 18, w - 10); ctx.stroke(); } }
  else if (r.kind === 'kicker') { const g = ctx.createLinearGradient(-35, 0, 30, 0); g.addColorStop(0, '#b0c8e0'); g.addColorStop(1, '#ffffff'); ctx.fillStyle = g; rr(ctx, -35, -w, 65, w * 2, 12); ctx.fill(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3; ctx.stroke(); }
  else { ctx.fillStyle = '#6d4c41'; ctx.fillRect(-35, -w, 65, w * 2); for (let k = -w; k < w; k += 30) { ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.moveTo(-35, k); ctx.lineTo(-35, k + 15); ctx.lineTo(30, k + 30); ctx.lineTo(30, k + 15); ctx.fill(); } }
  // pilar
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (const yy of [-w * 0.5, 0, w * 0.5]) { ctx.beginPath(); ctx.moveTo(18, yy); ctx.lineTo(0, yy - 12); ctx.lineTo(0, yy + 12); ctx.fill(); }
  ctx.restore();
}
function drawObstacle(ctx, o, t) {
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a);
  switch (o.kind) {
    case 'lego': drawLego(ctx, TOY_COLS[(Math.abs(o.x | 0) % 6)], 1.15); break;
    case 'block': { const s = 46; ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, -s / 2 + 5, -s / 2 + 7, s, s, 8); ctx.fill(); ctx.fillStyle = '#fb8c00'; rr(ctx, -s / 2, -s / 2, s, s, 8); ctx.fill(); ctx.fillStyle = '#fff'; rr(ctx, -15, -15, 30, 30, 5); ctx.fill(); ctx.fillStyle = '#1e88e5'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('L', 0, 2); break; }
    case 'castle': drawCastle(ctx, o.r); break;
    case 'bucket': drawBucket(ctx, o.r, '#e53935'); break;
    case 'snowman': ctx.rotate(-o.a - Math.PI / 2 + 0.3); drawSnowman(ctx, o.r, t); break;
    case 'trophy': { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(4, 6, o.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffc400'; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(-o.r * 0.3, -o.r * 0.3, o.r * 0.3, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffc400'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -o.r, o.r * 0.4, Math.PI, 0); ctx.arc(0, o.r, o.r * 0.4, 0, Math.PI); ctx.stroke(); break; }
    case 'bball': { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(5, 7, o.r, 0, TAU); ctx.fill(); for (let k = 0; k < 6; k++) { ctx.fillStyle = TOY_COLS[k]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, o.r, k / 6 * TAU, (k + 1) / 6 * TAU); ctx.fill(); } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.28, 0, TAU); ctx.fill(); break; }
    case 'snowball': { ctx.fillStyle = 'rgba(60,90,130,0.25)'; ctx.beginPath(); ctx.arc(4, 6, o.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#cfdff0'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#e3eef8'; ctx.beginPath(); ctx.arc(o.r * 0.25, o.r * 0.25, o.r * 0.45, 0, TAU); ctx.fill(); break; }
    case 'stone': case 'meteor': { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(4, 6, o.r, 0, TAU); ctx.fill(); ctx.fillStyle = o.kind === 'stone' ? '#8d6e63' : '#b0b3c6'; ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr2 = o.r * (0.8 + (k % 3) * 0.1); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.fillStyle = o.kind === 'stone' ? '#a1887f' : '#d1d4e6'; ctx.beginPath(); ctx.arc(-o.r * 0.25, -o.r * 0.25, o.r * 0.35, 0, TAU); ctx.fill(); break; }
    case 'asteroid': { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(6, 8, o.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#8d8fa0'; ctx.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, rr2 = o.r * (0.85 + (k % 3) * 0.08); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.fillStyle = '#6a6c7c'; for (const [x, y, r2] of [[-0.3, -0.2, 0.25], [0.3, 0.25, 0.18], [0.1, -0.45, 0.12]]) { ctx.beginPath(); ctx.arc(x * o.r, y * o.r, r2 * o.r, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#b388ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, o.r + 4, t * 2, t * 2 + 1.2); ctx.stroke(); break; }
    case 'cone': { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-o.r + 5, -o.r + 7, o.r * 2, o.r * 2); ctx.fillStyle = '#ff6d00'; ctx.fillRect(-o.r, -o.r, o.r * 2, o.r * 2); ctx.fillStyle = '#ff9100'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.5, 0, TAU); ctx.stroke(); ctx.fillStyle = '#e65100'; ctx.beginPath(); ctx.arc(0, 0, o.r * 0.22, 0, TAU); ctx.fill(); break; }
    case 'rock': { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(6, 8, o.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#4e342e'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, rr2 = o.r * (0.85 + (k % 3) * 0.08); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.strokeStyle = '#ff6d00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-o.r * 0.5, -o.r * 0.2); ctx.lineTo(0, 0); ctx.lineTo(o.r * 0.3, o.r * 0.4); ctx.stroke(); ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.arc(-o.r * 0.25, -o.r * 0.3, o.r * 0.3, 0, TAU); ctx.fill(); break; }
  }
  ctx.restore();
}
function drawMover(ctx, m, t) {
  if (m.kind === 'penguin') { drawPenguin(ctx, m.x, m.y, m.r, m.a, t); return; }
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.a);
  const r = m.r;
  if (m.kind === 'vacuum') {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(6, 8, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#546e7a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(0, 0, r, -0.9, 0.9); ctx.arc(0, 0, r * 0.82, 0.9, -0.9, true); ctx.fill();
    ctx.fillStyle = Math.floor(t * 3) % 2 ? '#76ff03' : '#33691e'; ctx.beginPath(); ctx.arc(r * 0.3, 0, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3; ctx.save(); ctx.translate(r * 0.55, -r * 0.75); ctx.rotate(t * 15); for (let k = 0; k < 3; k++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 0); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.2, 7, 0, TAU); ctx.arc(-r * 0.15, r * 0.2, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.2, 3.5, 0, TAU); ctx.arc(-r * 0.1, r * 0.2, 3.5, 0, TAU); ctx.fill();
  } else if (m.kind === 'crab') {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(4, 6, r, r * 0.7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { const w = Math.sin(t * 16 + k) * 5; ctx.beginPath(); ctx.moveTo(-8 + k * 8, s * r * 0.5); ctx.lineTo(-12 + k * 8 + w, s * r * 1.1); ctx.stroke(); }
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r * 0.6, 0, 0, TAU); ctx.fill();
    for (const s of [-1, 1]) { ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(r * 0.95, s * r * 0.55, r * 0.35, 0, TAU); ctx.fill(); ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.moveTo(r * 0.95, s * r * 0.55); ctx.lineTo(r * 1.35, s * r * (0.55 + 0.1 * Math.sin(t * 10))); ctx.lineTo(r * 1.3, s * r * 0.3); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.2, 5, 0, TAU); ctx.arc(r * 0.45, r * 0.2, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.2, 2.5, 0, TAU); ctx.arc(r * 0.5, r * 0.2, 2.5, 0, TAU); ctx.fill();
  } else if (m.kind === 'ufo') {
    ctx.rotate(-m.a + t * 0.8);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(12, 16, r, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.3); g.addColorStop(0, 'rgba(118,255,3,0.35)'); g.addColorStop(1, 'rgba(118,255,3,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#9fa8da'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5c6bc0'; ctx.lineWidth = 3; ctx.stroke();
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.fillStyle = (Math.floor(t * 6) + k) % 2 ? '#ffeb3b' : '#ff4081'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, 4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(178,235,242,0.9)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#76ff03'; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-4, -2, 3, 0, TAU); ctx.arc(4, -2, 3, 0, TAU); ctx.fill();
  } else if (m.kind === 'ordf') {
    ctx.rotate(-m.a - G.cam.rot);
    ctx.save(); ctx.translate(0, 0); drawFigure(ctx, { skin: 0, hair: 5, hairCol: 5, eyes: 2, beard: 1, mouth: 1, suit: 6 }, r * 0.55, t); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#333'; ctx.lineWidth = 2; rr(ctx, r * 0.6, -r * 1.9, r * 3.4, r * 0.9, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#333'; ctx.font = `bold ${r * 0.42 | 0}px Arial`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(['...och därför...', '...1823...', '...paragraf 7b...', '...avslutningsvis...'][Math.floor(t / 2 + m.ph) % 4], r * 0.75, -r * 1.45);
  } else if (m.kind === 'duck') {
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(4, 6, r, r * 0.7, 0, 0, TAU); ctx.fill();
    const w = Math.sin(t * 14) * 0.15;
    const duck = (x, y, s, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(w); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.7, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(s * 0.8, 0, s * 0.45, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(s * 1.15, -s * 0.15); ctx.lineTo(s * 1.55, 0); ctx.lineTo(s * 1.15, s * 0.15); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s * 0.95, -s * 0.2, s * 0.08, 0, TAU); ctx.arc(s * 0.95, s * 0.2, s * 0.08, 0, TAU); ctx.fill(); ctx.restore(); };
    duck(0, 0, r * 0.6, '#f5f5f5'); ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(r * 0.48, 0, r * 0.27, 0, TAU); ctx.fill();
    duck(-r * 1.0, -r * 0.3, r * 0.3, '#ffee58'); duck(-r * 1.5, r * 0.25, r * 0.3, '#ffee58'); duck(-r * 2.0, -r * 0.2, r * 0.3, '#ffee58');
  } else if (m.kind === 'dino') {
    const step = Math.sin(t * 6);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(10, 14, r * 1.1, r * 0.7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#e65100'; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.35; ctx.beginPath(); ctx.moveTo(-r * 0.5, 0); ctx.quadraticCurveTo(-r * 1.1, step * r * 0.2, -r * 1.5, step * r * 0.35); ctx.stroke();
    ctx.fillStyle = '#ef6c00'; for (const [lx, ly, ph] of [[0.4, -0.6, 0], [0.4, 0.6, Math.PI], [-0.4, -0.6, Math.PI], [-0.4, 0.6, 0]]) { ctx.beginPath(); ctx.ellipse(lx * r + Math.sin(t * 6 + ph) * r * 0.15, ly * r, r * 0.22, r * 0.16, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fb8c00'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r * 0.55, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffb74d'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(-r * 0.4 + k * r * 0.22, 0, r * 0.08, 0, TAU); ctx.fill(); }
    // krage & huvud (triceratops)
    ctx.fillStyle = '#8e24aa'; ctx.beginPath(); ctx.arc(r * 0.75, 0, r * 0.48, Math.PI / 2, Math.PI * 1.5, false); ctx.fill();
    ctx.fillStyle = '#ffd54f'; for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + k / 4 * Math.PI; ctx.beginPath(); ctx.arc(r * 0.75 + Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * 0.07, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fb8c00'; ctx.beginPath(); ctx.ellipse(r * 1.0, 0, r * 0.38, r * 0.3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fffde7'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(r * 1.05, s * r * 0.15); ctx.lineTo(r * 1.5, s * r * 0.22); ctx.lineTo(r * 1.1, s * r * 0.05); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(r * 1.3, -4); ctx.lineTo(r * 1.55, 0); ctx.lineTo(r * 1.3, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 1.05, -r * 0.18, 5, 0, TAU); ctx.arc(r * 1.05, r * 0.18, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 1.08, -r * 0.18, 2.5, 0, TAU); ctx.arc(r * 1.08, r * 0.18, 2.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function drawTunnel(ctx, T, t) {
  const cl = T.cl, { i0, i1 } = T.tunnel, w = T.hw * 2 + T.theme.bw * 2 + 30;
  const seg = new Path2D(); for (let i = i0; i <= i1; i++) { const k = i % T.N; i === i0 ? seg.moveTo(cl.px[k], cl.py[k]) : seg.lineTo(cl.px[k], cl.py[k]); }
  ctx.lineCap = 'butt'; ctx.strokeStyle = 'rgba(20,30,50,0.45)'; ctx.lineWidth = w; ctx.stroke(seg);
  // takbjälkar
  for (let i = i0 + 8; i < i1 - 4; i += 14) { const k = i % T.N; ctx.save(); ctx.translate(cl.px[k], cl.py[k]); ctx.rotate(cl.ang[k]); ctx.fillStyle = 'rgba(120,130,145,0.55)'; ctx.fillRect(-6, -w / 2, 12, w); ctx.fillStyle = `rgba(255,236,150,${0.6 + Math.sin(t * 4 + i) * 0.2})`; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.restore(); }
  // valv i ändarna
  for (const i of [i0, i1]) { const k = i % T.N; ctx.save(); ctx.translate(cl.px[k], cl.py[k]); ctx.rotate(cl.ang[k]); ctx.fillStyle = '#78909c'; ctx.fillRect(-18, -w / 2 - 20, 36, w + 40); ctx.fillStyle = '#fff'; ctx.fillRect(-18, -w / 2 - 20, 36, 14); ctx.fillRect(-18, w / 2 + 6, 36, 14); ctx.fillStyle = '#546e7a'; for (let y = -w / 2; y < w / 2; y += 28) ctx.fillRect(-18, y, 36, 3); ctx.restore(); }
}

// ---------- HUD ----------
function drawDriftMeter(x, y, w, u) {
  // Superturbo-mätaren: 10 rutor + siffra. Fylls genom drift, töms medan man håller Skift.
  const P = G.player; if (!P) return; const m = clamp((P.meter || 0) / 100, 0, 1), on = !!P.superOn, ok = (P.meter || 0) >= SUPER_MIN;
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  ctx.fillStyle = on ? 'rgba(13,71,161,0.85)' : 'rgba(20,10,50,0.6)'; rr(ctx, x, y, w, 52 * u, 16 * u); ctx.fill();
  ctx.font = font(26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(on ? '🚀' : '💨', x + 10 * u, y + 27 * u);
  const bx = x + 50 * u, bw = w - 104 * u, by = y + 12 * u, bh = 28 * u, n = 10, gap = 4 * u, sw = (bw - gap * (n - 1)) / n;
  const full = m * n;
  for (let k = 0; k < n; k++) {
    const f = clamp(full - k, 0, 1), sx = bx + k * (sw + gap);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(ctx, sx, by, sw, bh, 6 * u); ctx.fill();
    if (f > 0) { ctx.fillStyle = on ? (Math.floor(G.time * 14 + k) % 2 ? '#40c4ff' : '#e1f5fe') : k < 2 ? '#40c4ff' : k < 6 ? '#ffd600' : '#ff6d00'; rr(ctx, sx, by + bh * (1 - f), sw, bh * f, 6 * u); ctx.fill(); }
  }
  // siffran: hur många rutor kvar
  ctx.fillStyle = '#ffd600'; ctx.font = font(30); ctx.textAlign = 'center'; ctx.fillText(String(Math.ceil(full - 0.001)), x + w - 28 * u, y + 27 * u);
  if (on) { ctx.globalAlpha = 0.7 + Math.sin(G.time * 16) * 0.3; ctx.fillStyle = '#fff'; ctx.font = font(18); ctx.fillText('SUPERTURBO!', bx + bw / 2, y + 66 * u); ctx.globalAlpha = 1; }
  else if (ok) { ctx.globalAlpha = 0.65 + Math.sin(G.time * 8) * 0.35; ctx.fillStyle = '#ffd600'; ctx.font = font(18); ctx.fillText('HÅLL SKIFT = SUPERTURBO', bx + bw / 2, y + 66 * u); ctx.globalAlpha = 1; }
  else if (P.drift) { ctx.fillStyle = '#fff'; ctx.font = font(17); ctx.fillText('DRIFT +' + Math.round(P.driftPts || 0), bx + bw / 2, y + 66 * u); }
}
function drawStartLights(u, txt) {
  if (G.mode === 'countdown') {
    const n = Math.ceil(G.countdown); const f = G.countdown - Math.floor(G.countdown);
    const lw = 420 * u, lx = W / 2 - lw / 2, ly = H * 0.2; ctx.fillStyle = '#212121'; rr(ctx, lx, ly, lw, 150 * u, 40 * u); ctx.fill();
    for (let k = 0; k < 3; k++) { const on = 3 - k >= n; ctx.fillStyle = on ? '#ff1744' : '#4a1010'; ctx.beginPath(); ctx.arc(lx + lw / 6 + k * lw / 3, ly + 75 * u, 50 * u, 0, TAU); ctx.fill(); }
    if (n <= 3) txt(String(n), W / 2, H * 0.46, 170 * (0.8 + f * 0.4), '#fff', 'center', 14);
    txt('GASA PÅ GRÖNT = RAKETSTART!', W / 2, H * 0.575, 30, '#ffd600', 'center', 6);
  } else if (G.mode === 'race' && G.time - (G.greenAt || -9) < 0.6) {
    const lw = 420 * u, lx = W / 2 - lw / 2, ly = H * 0.2; ctx.globalAlpha = 1 - (G.time - G.greenAt) / 0.6; ctx.fillStyle = '#212121'; rr(ctx, lx, ly, lw, 150 * u, 40 * u); ctx.fill();
    for (let k = 0; k < 3; k++) { ctx.fillStyle = '#76ff03'; ctx.beginPath(); ctx.arc(lx + lw / 6 + k * lw / 3, ly + 75 * u, 50 * u, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  }
}
function drawHUD() {
  const u = H / 1000, P = G.player, T = G.T;
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, align = 'center', stroke = 8) => { ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = stroke * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const place = G.order.indexOf(P);
  // placering
  const pc = ['#ffd600', '#e0e0e0', '#ff9e5e', '#ffffff', '#ffffff'][place];
  ctx.fillStyle = 'rgba(20,10,50,0.55)'; rr(ctx, 20 * u, 20 * u, 230 * u, 190 * u, 26 * u); ctx.fill();
  txt(PLACE_TXT[place], 135 * u, 95 * u, 110, pc);
  const lap = clamp(Math.floor(P.prog / T.N) + 1, 1, G.laps);
  txt(`VARV ${lap}/${G.laps}`, 135 * u, 178 * u, 40, '#fff', 'center', 6);
  // item
  const bx = W / 2, by = 90 * u, bs = 130 * u;
  ctx.fillStyle = 'rgba(20,10,50,0.6)'; rr(ctx, bx - bs / 2, by - bs / 2 - 10 * u, bs, bs, 24 * u); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * u; ctx.stroke();
  const it = P.item || (P.roulette > 0 ? P.rouletteShow : null);
  if (it) { ctx.save(); ctx.translate(bx, by - 10 * u); drawItemIcon(ctx, it, 100 * u, G.time); ctx.restore(); }
  if (P.item) {
    const pul = 1 + Math.sin(G.time * 8) * 0.06; ctx.save(); ctx.translate(bx, by + bs / 2 + 30 * u); ctx.scale(pul, pul);
    ctx.fillStyle = '#fff'; rr(ctx, -150 * u, -24 * u, 300 * u, 48 * u, 12 * u); ctx.fill(); ctx.fillStyle = '#b0bec5'; ctx.fillRect(-150 * u, 18 * u, 300 * u, 6 * u);
    ctx.font = font(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#263238'; ctx.fillText('MELLANSLAG', 0, 0); ctx.restore();
  }
  drawDriftMeter(20 * u, 222 * u, 330 * u, u);
  // ställning
  for (let k = 0; k < G.order.length; k++) {
    const c = G.order[k]; const x = W - 190 * u, y = 50 * u + k * 70 * u;
    ctx.fillStyle = c.isPlayer ? 'rgba(255,214,0,0.85)' : 'rgba(20,10,50,0.55)'; rr(ctx, x - 20 * u, y - 30 * u, 190 * u, 60 * u, 16 * u); ctx.fill();
    txt(String(k + 1), x + 8 * u, y + 2 * u, 34, c.isPlayer ? '#1a1033' : '#fff', 'center', c.isPlayer ? 0 : 5);
    if (c.who) { const R = 25 * u, n = Math.ceil(R * 2 + 6), fc = hudSprite('f' + k + c.who.name + n, n, n, g => drawFace(g, c.who.fig, n / 2, n / 2, R, 0)); ctx.drawImage(fc, x + 58 * u - n / 2, y - n / 2); }
    if (c.superOn && !c.isPlayer) { // motståndare på superturbo: blå glöd + lågor i listan
      ctx.save(); ctx.strokeStyle = '#40c4ff'; ctx.lineWidth = (3 + Math.sin(G.time * 20) * 1.5) * u; ctx.shadowColor = '#40c4ff'; ctx.shadowBlur = 14 * u; rr(ctx, x - 20 * u, y - 30 * u, 190 * u, 60 * u, 16 * u); ctx.stroke(); ctx.restore();
      for (let f = 0; f < 3; f++) { const fl = (14 + Math.random() * 12) * u; ctx.fillStyle = ['#2979ff', '#40c4ff', '#e1f5fe'][f]; ctx.beginPath(); ctx.moveTo(x + 92 * u, y - (6 - f * 2) * u); ctx.lineTo(x + 92 * u - fl * (1 - f * 0.25), y); ctx.lineTo(x + 92 * u, y + (6 - f * 2) * u); ctx.fill(); }
    }
    if (c.d.rainbow) { ctx.save(); ctx.translate(x + 122 * u, y); ctx.scale(0.72 * u, 0.72 * u); drawCar(ctx, c.d, G.time); ctx.restore(); }
    else { const s = 0.72 * u, cw = Math.ceil(140 * s), ch = Math.ceil(90 * s), cc = hudSprite('c' + c.d.id + (c.d.color || '') + (c.d.sticker || '') + cw, cw, ch, g => { g.translate(cw / 2, ch / 2); g.scale(s, s); drawCar(g, c.d, 0); }); ctx.drawImage(cc, x + 122 * u - cw / 2, y - ch / 2); }
  }
  // minikarta
  const ms = 280 * u, mx = W - ms - 24 * u, my = H - ms - 24 * u; const bb = T.bb; const sc = (ms - 40 * u) / Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY);
  ctx.fillStyle = 'rgba(20,10,50,0.55)'; rr(ctx, mx, my, ms, ms, 24 * u); ctx.fill();
  // banan på minikartan ritas en gång till en egen bild
  if (!T.mini || T.mini.ms !== Math.ceil(ms)) {
    const cv = document.createElement('canvas'), n = Math.ceil(ms); cv.width = cv.height = n; const g = cv.getContext('2d');
    g.translate(ms / 2 - (bb.minX + bb.maxX) / 2 * sc, ms / 2 - (bb.minY + bb.maxY) / 2 * sc); g.scale(sc, sc); g.lineJoin = 'round';
    g.strokeStyle = '#fff'; g.lineWidth = T.hw * 1.2; g.stroke(T.path); g.strokeStyle = T.theme.minimap; g.lineWidth = T.hw * 0.7; g.stroke(T.path);
    T.mini = { cv, ms: n };
  }
  ctx.drawImage(T.mini.cv, mx, my);
  ctx.save(); ctx.translate(mx + ms / 2 - (bb.minX + bb.maxX) / 2 * sc, my + ms / 2 - (bb.minY + bb.maxY) / 2 * sc); ctx.scale(sc, sc);
  ctx.fillStyle = '#ff1744'; for (const h of T.hazards) if (SPINHAZ[h.kind]) { ctx.beginPath(); ctx.arc(h.x, h.y, 9 * u / sc, 0, TAU); ctx.fill(); } for (const m of T.movers) { const q = T.cl; ctx.beginPath(); ctx.arc(q.px[m.i], q.py[m.i], 9 * u / sc, 0, TAU); ctx.fill(); }
  for (const c of G.cars) { if (c.isPlayer) continue; ctx.fillStyle = c.d.color; ctx.strokeStyle = '#000'; ctx.lineWidth = 12 / sc * u; ctx.beginPath(); ctx.arc(c.x, c.y, 11 * u / sc, 0, TAU); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#ffd600'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4 * u / sc; ctx.beginPath(); ctx.arc(P.x, P.y, (16 + Math.sin(G.time * 8) * 3) * u / sc, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
  // nedräkning
  drawStartLights(u, txt);
  // banner
  if (G.banner) { const b = G.banner, a = 1 - b.t / b.max; const s = a < 0.15 ? a / 0.15 * 1.2 : 1 + Math.sin(G.time * 10) * 0.03; ctx.save(); ctx.translate(W / 2, H * 0.38); ctx.scale(s, s); txt(b.text, 0, 0, 130, b.color, 'center', 16); ctx.restore(); }
  // fel håll
  if (P.wrongT > 1.2 && G.mode === 'race') {
    txt('FEL HÅLL!', W / 2, H * 0.6, 80, '#ff5252', 'center', 12);
    const a = T.cl.ang[P.idx] + G.cam.rot; ctx.save(); ctx.translate(W / 2, H * 0.6 + 120 * u); ctx.rotate(a); ctx.fillStyle = '#ffeb3b'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6 * u; ctx.beginPath(); ctx.moveTo(70 * u, 0); ctx.lineTo(0, -50 * u); ctx.lineTo(0, -22 * u); ctx.lineTo(-70 * u, -22 * u); ctx.lineTo(-70 * u, 22 * u); ctx.lineTo(0, 22 * u); ctx.lineTo(0, 50 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  // tips vid start
  if ((G.mode === 'countdown' || (G.mode === 'race' && G.hintT > 0))) {
    const x0 = 40 * u, y0 = H - 190 * u; ctx.fillStyle = 'rgba(20,10,50,0.6)'; rr(ctx, x0 - 16 * u, y0 - 20 * u, 560 * u, 170 * u, 24 * u); ctx.fill();
    const key = (x, y, w, lbl) => { ctx.fillStyle = '#fff'; rr(ctx, x, y, w, 56 * u, 10 * u); ctx.fill(); ctx.fillStyle = '#b0bec5'; ctx.fillRect(x, y + 48 * u, w, 8 * u); ctx.fillStyle = '#263238'; ctx.font = font(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, x + w / 2, y + 26 * u); };
    key(x0 + 64 * u, y0, 56 * u, '▲'); key(x0, y0 + 64 * u, 56 * u, '◀'); key(x0 + 64 * u, y0 + 64 * u, 56 * u, '▼'); key(x0 + 128 * u, y0 + 64 * u, 56 * u, '▶');
    txt('▲ GAS  ▼ BACK', x0 + 92 * u, y0 + 140 * u, 24, '#fff', 'center', 5);
    key(x0 + 230 * u, y0 + 64 * u, 290 * u, 'MELLANSLAG'); txt('SKJUT / TURBO', x0 + 375 * u, y0 + 30 * u, 32, '#ffeb3b', 'center', 6);
    if (!G.school) txt('HÅLL SKIFT = SUPERTURBO · 2 TRYCK = HOPP', x0 + 375 * u, y0 + 140 * u, 17, '#76ff03', 'center', 5);
  }
  drawRadio(u);
}
