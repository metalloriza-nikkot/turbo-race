// ===================== BANOR =====================
// Placering på banan anges med t (0..1 längs banan) och off (sidled, + = höger i färdriktningen)
const TRACK_DEFS = [
  {
    id: 'rum', name: 'VARDAGSRUMMET', say: 'Vardagsrummet', icon: '🛋️', hw: 165, music: 'rum',
    pts: [[1200, 450], [1800, 420], [2900, 520], [3500, 1000], [3400, 1700], [2800, 2000], [2200, 1750], [1600, 2000], [1000, 2450], [450, 2050], [380, 1200], [650, 550]],
    theme: { ground: 'wood', road: '#5f6673', b1: '#e53935', b2: '#ffffff', bw: 22, edge: '#ffffff', center: '#ffd54f', minimap: '#8d6e63' },
    hazards: [['saft', 0.20, -60, 70], ['saft', 0.47, 55, 75], ['saft', 0.78, -40, 65], ['saft', 0.64, 70, 55]],
    obstacles: [['lego', 0.13, 70, 20], ['lego', 0.135, 40, 20], ['lego', 0.33, -80, 20], ['lego', 0.345, -20, 20], ['block', 0.56, -60, 22], ['lego', 0.86, 60, 20], ['block', 0.71, -90, 22], ['lego', 0.72, -55, 20]],
    movers: [['vacuum', 0.40, 110, 0.7, 40], ['vacuum', 0.91, 110, 0.55, 40]],
    ramps: [[0.26, 'book']], boosts: [[0.07, 0], [0.52, -50], [0.95, 40]], items: [0.10, 0.37, 0.61, 0.83],
    decor: [['block', 26, 30], ['lego_pile', 20, 40], ['book_d', 14, 60], ['crayon', 26, 30], ['ball', 8, 45], ['sock', 8, 35], ['plant', 6, 70], ['car_toy', 8, 40], ['cat', 2, 80]],
    special: ['rug', 'sofa']
  },
  {
    id: 'strand', name: 'STRANDEN', say: 'Stranden', icon: '🏖️', hw: 150, music: 'strand',
    pts: [[1100, 420], [1600, 350], [2700, 550], [3600, 450], [4100, 950], [3700, 1450], [2850, 1350], [2250, 1650], [2350, 2150], [2900, 2350], [3800, 2450], [3750, 3050], [2500, 3150], [1300, 3000], [600, 2650], [900, 1800], [450, 1200], [600, 550]],
    theme: { ground: 'sand', road: '#c98d52', planks: '#9c6435', b1: '#ffffff', b2: '#1e88e5', bw: 20, edge: '#f6e1c3', center: null, minimap: '#e0b070' },
    hazards: [['sand', 0.15, -40, 80], ['sand', 0.30, 60, 75], ['sand', 0.52, 0, 70], ['sand', 0.70, -60, 80], ['sand', 0.88, 50, 70]],
    obstacles: [['castle', 0.24, -95, 26], ['castle', 0.62, 95, 26], ['bucket', 0.44, -60, 18], ['bucket', 0.93, 70, 18], ['bball', 0.34, 30, 20], ['bball', 0.77, -40, 20]],
    movers: [['crab', 0.11, 110, 1.1, 26], ['crab', 0.47, 110, 0.9, 26], ['crab', 0.83, 110, 1.2, 26]],
    ramps: [[0.195, 'wave'], [0.66, 'wave']], boosts: [[0.06, 0], [0.41, 40], [0.75, -40], [0.965, 0]], items: [0.09, 0.27, 0.48, 0.68, 0.86],
    decor: [['palm', 36, 70], ['parasol', 22, 60], ['towel', 18, 50], ['castle_d', 12, 45], ['bball', 14, 30], ['shell', 60, 12], ['star', 40, 14], ['bucket_d', 10, 22]],
    special: ['ocean']
  },
  {
    id: 'sno', name: 'SNÖSKOGEN', say: 'Snöskogen', icon: '🌲', hw: 145, music: 'sno',
    pts: [[1150, 420], [1750, 480], [2250, 750], [2700, 350], [3500, 450], [3850, 1050], [3300, 1550], [3750, 2150], [3350, 2900], [2450, 2850], [2200, 2150], [1650, 2200], [1350, 2750], [650, 2650], [380, 2000], [420, 1200], [650, 600]],
    theme: { ground: 'snow', road: '#6f8398', b1: '#ffffff', b2: '#e53935', bw: 26, edge: '#dbe8f5', center: '#ffffff', minimap: '#9fb8d0' },
    hazards: [['ice', 0.12, 0, 85], ['ice', 0.29, -50, 80], ['ice', 0.45, 40, 90], ['ice', 0.60, 0, 80], ['ice', 0.83, -40, 85], ['ice', 0.93, 60, 60]],
    obstacles: [['snowman', 0.17, 100, 26], ['snowman', 0.35, -100, 26], ['snowman', 0.70, -100, 26], ['snowman', 0.88, 100, 26], ['snowball', 0.26, -30, 20], ['snowball', 0.27, 20, 18], ['snowball', 0.52, 50, 20], ['snowball', 0.78, -20, 18]],
    movers: [['penguin', 0.22, 105, 1.0, 22], ['penguin', 0.65, 105, 1.2, 22]],
    ramps: [[0.40, 'kicker']], boosts: [[0.05, 0], [0.32, 30], [0.57, -30], [0.80, 0]], items: [0.08, 0.25, 0.49, 0.73, 0.90],
    tunnel: [0.535, 0.615],
    decor: [['pine', 170, 55], ['rock_s', 20, 45], ['snowman_d', 8, 35], ['cabin', 3, 110], ['sled', 5, 35]],
    special: ['lake']
  },
  {
    id: 'vulkan', name: 'VULKANEN', say: 'Vulkanen', icon: '🌋', hw: 150, music: 'vulkan',
    pts: [[1300, 520], [1800, 450], [2800, 650], [3600, 500], [4100, 1150], [3550, 1750], [4050, 2450], [3400, 3150], [2400, 2950], [1700, 3400], [850, 3100], [500, 2350], [1150, 1900], [1100, 1350], [500, 1050], [650, 550]],
    theme: { ground: 'rock', road: '#4a4450', b1: '#ff6d1f', b2: '#3a2520', bw: 22, edge: '#ffd23f', center: '#ff8a3d', minimap: '#6d4c41' },
    hazards: [['lava', 0.34, -85, 50], ['lava', 0.84, 85, 50]],
    obstacles: [['rock', 0.21, -100, 28], ['rock', 0.43, 100, 28], ['rock', 0.58, -100, 28], ['rock', 0.76, 100, 28], ['rock', 0.91, -100, 28], ['stone', 0.12, 20, 18], ['stone', 0.39, -40, 18], ['stone', 0.81, 30, 18]],
    movers: [['dino', 0.29, 90, 0.5, 46], ['dino', 0.62, 90, 0.5, 46]],
    ramps: [[0.245, 'rock'], [0.72, 'rock']], boosts: [[0.06, 0], [0.38, 0], [0.53, -40], [0.80, 40]], items: [0.10, 0.31, 0.46, 0.69, 0.88],
    decor: [['fern', 60, 45], ['cycad', 26, 55], ['bones', 12, 40], ['eggs', 10, 35], ['rock_d', 40, 40], ['lavapool', 12, 55], ['longneck', 4, 120]],
    special: ['volcano']
  },
  {
    id: 'rymd', name: 'RYMDEN', say: 'Rymden', icon: '🚀', hw: 150, music: 'rymd',
    pts: [[1200, 500], [2200, 400], [3000, 700], [3600, 450], [4200, 800], [4150, 1500], [3500, 2000], [3950, 2600], [3300, 3100], [2500, 2700], [2000, 3200], [1200, 3100], [650, 2550], [1350, 2000], [700, 1450], [500, 900]],
    theme: { ground: 'moon', road: '#232a4d', b1: '#7c4dff', b2: '#00e5ff', bw: 22, edge: '#00e5ff', center: '#e040fb', minimap: '#7c4dff' },
    hazards: [['slime', 0.14, -50, 70], ['slime', 0.31, 55, 75], ['slime', 0.50, 0, 70], ['slime', 0.68, -55, 75], ['slime', 0.86, 50, 70]],
    obstacles: [['asteroid', 0.19, 100, 28], ['asteroid', 0.37, -100, 28], ['asteroid', 0.56, 100, 28], ['asteroid', 0.74, -100, 28], ['asteroid', 0.91, 100, 28], ['meteor', 0.10, -30, 18], ['meteor', 0.34, 20, 18], ['meteor', 0.71, 40, 18]],
    movers: [['ufo', 0.25, 105, 0.9, 36], ['ufo', 0.62, 105, 1.2, 36]],
    ramps: [[0.44, 'neon'], [0.80, 'neon']], boosts: [[0.06, 0], [0.22, -40], [0.40, 40], [0.59, 0], [0.77, -40], [0.95, 40]], items: [0.09, 0.28, 0.47, 0.65, 0.84],
    decor: [['crater_d', 40, 60], ['rocket', 6, 70], ['dish', 8, 55], ['crystal', 26, 35], ['flag', 5, 30], ['alien', 10, 30]],
    special: ['base']
  },
  {
    id: 'stad', name: 'STADEN', say: 'Staden', icon: '🏙️', hw: 155, music: 'stad',
    pts: [[1000, 500], [2000, 500], [3000, 500], [3600, 700], [3700, 1300], [3100, 1600], [2500, 1500], [2200, 1900], [2600, 2400], [3600, 2500], [3700, 3100], [2800, 3300], [1600, 3300], [800, 3000], [600, 2200], [1100, 1700], [600, 1100]],
    theme: { ground: 'city', road: '#3d4048', b1: '#e0e0e0', b2: '#9e9e9e', bw: 20, edge: '#ffffff', center: '#fdd835', minimap: '#757575' },
    hazards: [['puddle', 0.13, -50, 75], ['puddle', 0.33, 50, 70], ['oil', 0.48, -80, 50], ['puddle', 0.63, 0, 75], ['oil', 0.82, 80, 50]],
    obstacles: [['cone', 0.17, 85, 18], ['cone', 0.175, 55, 18], ['cone', 0.40, -85, 18], ['cone', 0.405, -55, 18], ['cone', 0.57, 85, 18], ['cone', 0.72, -80, 18], ['cone', 0.725, -50, 18], ['cone', 0.90, 80, 18]],
    movers: [['duck', 0.27, 110, 0.6, 30], ['duck', 0.69, 110, 0.5, 30]],
    ramps: [[0.53, 'plank']], boosts: [[0.06, 0], [0.37, 0], [0.60, -40], [0.87, 40]], items: [0.10, 0.30, 0.45, 0.66, 0.85],
    decor: [['house', 34, 95], ['tree', 50, 45], ['car_toy', 16, 45], ['lamp', 20, 14]],
    special: ['park']
  }
];

// Finalbana – bara i turneringen
const FINAL_DEF = {
  id: 'final', name: 'IFSB:S HELIGA ARENA', say: 'Den stora finalen', icon: '🏟️', hw: 165, music: 'final',
  pts: [[800, 600], [2400, 480], [3800, 600], [4300, 1200], [3900, 1800], [3000, 1750], [2550, 2250], [3150, 2800], [4200, 2950], [4100, 3550], [2600, 3650], [1200, 3550], [500, 2950], [950, 2250], [400, 1550], [500, 950]],
  theme: { ground: 'marble', road: '#3b1f4a', b1: '#ffd54f', b2: '#b71c1c', bw: 24, edge: '#ffd54f', center: '#ffffff', minimap: '#8e24aa' },
  hazards: [['saft', 0.18, -55, 70], ['saft', 0.47, 60, 70], ['oil', 0.72, -80, 50]],
  obstacles: [['trophy', 0.12, 40, 18], ['trophy', 0.125, 70, 18], ['trophy', 0.40, -60, 18], ['trophy', 0.62, 20, 18], ['trophy', 0.88, -40, 18]],
  movers: [['ordf', 0.30, 110, 0.5, 30], ['ordf', 0.80, 110, 0.45, 30]],
  ramps: [[0.55, 'neon']], boosts: [[0.05, 0], [0.24, -40], [0.42, 40], [0.66, 0], [0.92, -30]], items: [0.09, 0.27, 0.45, 0.64, 0.84],
  decor: [['stand', 26, 130], ['statue', 6, 60], ['spot', 16, 30], ['flagpole', 18, 22]],
  special: ['stage']
};
function buildTrack(def) {
  const SC = def.sc || (def.id === 'rum' ? 1.9 : 1.55);
  const cl = buildCenterline(def.pts.map(([x, y]) => [x * SC, y * SC]), 10);
  const T = { def, cl, N: cl.N, hw: def.hw, theme: def.theme };
  // Hinder i tre klasser: PRYLAR (flyttbara, bromsar lite), UNDERLAG (halt/segt), SNURR-FAROR (tydligt markerade, få).
  // Prylar och underlag kopieras till andra halvan av den längre banan – men aldrig nära snurr-faror, stora hinder, rampar eller djur.
  const idxOf = t => Math.round(((t % 1) + 1) % 1 * cl.N);
  const busy = [...def.hazards.filter(h => SPINHAZ[h[0]]), ...def.obstacles.filter(o => !PROP_KINDS[o[0]]), ...def.movers, ...def.ramps.map(r => [r[1], r[0]])].map(e => idxOf(e[1]));
  const free = t => busy.every(b => { const d = Math.abs(idxOf(t) - b); return Math.min(d, cl.N - d) > 35; });
  const dup = (list, shift) => def.exact ? list : list.concat(list.map(e => { const c = e.slice(); c[1] = (c[1] + shift) % 1; c[2] = -c[2]; return c; }).filter(c => c[1] > 0.04 && c[1] < 0.95 && free(c[1])));
  const hazards = [...def.hazards.filter(h => SPINHAZ[h[0]]), ...dup(def.hazards.filter(h => !SPINHAZ[h[0]]), 0.37)];
  const obstacles = def.obstacles.filter(o => !PROP_KINDS[o[0]]);
  const props = dup(def.obstacles.filter(o => PROP_KINDS[o[0]]), 0.37);
  const movers = def.movers;
  const itemsT = def.exact ? def.items : def.items.concat(def.items.map((t, k) => (t + def.items[(k + 1) % def.items.length] + (k === def.items.length - 1 ? 1 : 0)) / 2 % 1));
  const at = (t, off) => { const i = ((Math.round(t * cl.N) % cl.N) + cl.N) % cl.N; return { i, x: cl.px[i] + cl.nx[i] * off, y: cl.py[i] + cl.ny[i] * off, a: cl.ang[i] }; };
  T.at = at;
  // bounding box
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (let i = 0; i < cl.N; i++) { minX = Math.min(minX, cl.px[i]); maxX = Math.max(maxX, cl.px[i]); minY = Math.min(minY, cl.py[i]); maxY = Math.max(maxY, cl.py[i]); }
  T.bb = { minX, minY, maxX, maxY };
  // path
  const p = new Path2D(); p.moveTo(cl.px[0], cl.py[0]);
  for (let i = 1; i < cl.N; i++) p.lineTo(cl.px[i], cl.py[i]);
  p.closePath(); T.path = p;
  const edgePath = (off) => { const e = new Path2D(); for (let i = 0; i <= cl.N; i++) { const k = i % cl.N; const x = cl.px[k] + cl.nx[k] * off, y = cl.py[k] + cl.ny[k] * off; i ? e.lineTo(x, y) : e.moveTo(x, y); } return e; };
  T.edgeL = edgePath(-(def.hw - 12)); T.edgeR = edgePath(def.hw - 12);
  // objekt på banan
  T.hazards = hazards.map(([kind, t, off, r]) => { const q = at(t, off); return { kind, x: q.x, y: q.y, r, a: q.a, seed: Math.random() * 10 }; });
  T.obstacles = obstacles.map(([kind, t, off, r]) => { const q = at(t, off); return { kind, x: q.x, y: q.y, r, a: q.a + (Math.random() - 0.5) }; });
  T.props = props.map(([kind, t, off, r]) => { const q = at(t, off); return { kind, x: q.x, y: q.y, r, a: q.a + (Math.random() - 0.5), vx: 0, vy: 0, va: 0, idx: q.i, hx: q.x, hy: q.y, ha: q.a, hi: q.i, cool: 0 }; });
  T.movers = movers.map(([kind, t, amp, speed, r], k) => { const q = at(t, 0); return { kind, i: q.i, amp: Math.min(amp, def.hw - 30), speed, r, x: q.x, y: q.y, ph: k * 1.7, dir: 1, a: 0 }; });
  T.ramps = def.ramps.map(([t, kind]) => { const q = at(t, 0); return { kind, i: q.i, x: q.x, y: q.y, a: q.a }; });
  T.boosts = def.boosts.map(([t, off]) => { const q = at(t, off); return { x: q.x, y: q.y, a: q.a, i: q.i }; });
  T.boxes = [];
  for (const t of itemsT) { for (const f of [-0.6, -0.2, 0.2, 0.6]) { const q = at(t, f * def.hw); T.boxes.push({ x: q.x, y: q.y, alive: true, respawn: 0, ph: Math.random() * 6 }); } }
  T.tunnel = def.tunnel ? { i0: Math.round(def.tunnel[0] * cl.N), i1: Math.round(def.tunnel[1] * cl.N) } : null;
  // infield center (punkt längst från banan inuti)
  let best = -1, cx = 0, cy = 0;
  for (let x = minX; x < maxX; x += 100) for (let y = minY; y < maxY; y += 100) {
    if (!pointInPoly(x, y, cl.px, cl.py)) continue; const d = distToTrack(cl, x, y); if (d > best) { best = d; cx = x; cy = y; }
  }
  T.infield = { x: cx, y: cy, r: best - def.hw - 50 };
  buildDecor(T);
  T.groundPat = null;
  return T;
}

function buildDecor(T) {
  const def = T.def, cl = T.cl, rnd = mulberry(def.id.length * 999 + 7);
  const list = []; const bb = T.bb, M = 700;
  const special = [];
  const ok = (x, y, r) => {
    if (distToTrack(cl, x, y) < T.hw + def.theme.bw + r + 25) return false;
    for (const s of special) if (s.blocks && dist2(x, y, s.x, s.y) < (s.br + r) * (s.br + r)) return false;
    for (const o of list) if (dist2(x, y, o.x, o.y) < (o.r + r) * (o.r + r) * 0.8) return false;
    return true;
  };
  for (const sp of def.special) {
    if (sp !== 'sofa' && sp !== 'ocean' && !(T.infield.r > 320)) continue; // egna banor kan ha liten innerplan
    if (sp === 'rug') special.push({ kind: 'rug', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 800), blocks: true, br: Math.min(T.infield.r, 800) });
    if (sp === 'lake') special.push({ kind: 'lake', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 750), blocks: true, br: Math.min(T.infield.r, 750) });
    if (sp === 'volcano') special.push({ kind: 'volcano', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 850), blocks: true, br: Math.min(T.infield.r, 850) });
    if (sp === 'stage') special.push({ kind: 'stage', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 700), blocks: true, br: Math.min(T.infield.r, 700) });
    if (sp === 'base') special.push({ kind: 'base', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 650), blocks: true, br: Math.min(T.infield.r, 650) });
    if (sp === 'park') special.push({ kind: 'park', x: T.infield.x, y: T.infield.y, r: Math.min(T.infield.r, 700), blocks: true, br: Math.min(T.infield.r, 700) });
    if (sp === 'sofa') special.push({ kind: 'sofa', x: (bb.minX + bb.maxX) / 2, y: bb.minY - T.hw - 330, r: 700, blocks: true, br: 480 });
    if (sp === 'ocean') special.push({ kind: 'ocean', x: 0, y: bb.maxY + T.hw + 170, r: 1e9, blocks: false });
  }
  T.special = special;
  const oceanY = special.find(s => s.kind === 'ocean') ? bb.maxY + T.hw + 120 : 1e9;
  for (let [kind, count, r0] of def.decor) {
    let placed = 0, tries = 0;
    count = Math.round(count * 2.6);
    while (placed < count && tries < count * 40) {
      tries++;
      const r = r0 * (0.75 + rnd() * 0.5);
      const x = bb.minX - M + rnd() * (bb.maxX - bb.minX + 2 * M), y = bb.minY - M + rnd() * (bb.maxY - bb.minY + 2 * M);
      if (y + r > oceanY) continue;
      if (!ok(x, y, r)) continue;
      list.push({ kind, x, y, r, rot: rnd() * TAU, s: rnd(), c: Math.floor(rnd() * 6) });
      placed++;
    }
  }
  T.decor = list;
}

// ---------- Marktexturer ----------
function makeGroundPattern(ctx, T) {
  const kind = T.theme.ground; const S = 512;
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  const R = mulberry(42);
  if (kind === 'wood') {
    const cols = ['#c99a66', '#c2915c', '#d0a36f', '#bb8a57', '#c69762'];
    for (let row = 0; row < 8; row++) {
      let x = -R() * 300; const y = row * 64;
      while (x < S) { const w = 260 + R() * 200; g.fillStyle = cols[Math.floor(R() * cols.length)]; g.fillRect(x, y, w, 64);
        g.strokeStyle = 'rgba(90,55,25,0.18)'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); const yy = y + 8 + R() * 48; g.moveTo(x, yy); g.bezierCurveTo(x + w * 0.3, yy + (R() - 0.5) * 10, x + w * 0.6, yy + (R() - 0.5) * 10, x + w, yy); g.stroke(); }
        g.fillStyle = 'rgba(70,40,15,0.45)'; g.fillRect(x, y, 3, 64); x += w; }
      g.fillStyle = 'rgba(70,40,15,0.5)'; g.fillRect(0, y, S, 3);
    }
  } else if (kind === 'sand') {
    g.fillStyle = '#f4d9a0'; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 2600; k++) { g.fillStyle = R() < 0.5 ? 'rgba(190,140,70,0.35)' : 'rgba(255,248,220,0.6)'; g.fillRect(R() * S, R() * S, 2 + R() * 3, 2 + R() * 3); }
    g.strokeStyle = 'rgba(200,150,80,0.25)'; g.lineWidth = 4; for (let k = 0; k < 10; k++) { g.beginPath(); const y = R() * S; g.moveTo(0, y); for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x / 40 + k) * 8); g.stroke(); }
  } else if (kind === 'snow') {
    g.fillStyle = '#f2f7fd'; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(180,205,230,0.12)'; g.beginPath(); g.ellipse(R() * S, R() * S, 40 + R() * 70, 20 + R() * 25, R() * 3, 0, TAU); g.fill(); }
    for (let k = 0; k < 500; k++) { g.fillStyle = R() < 0.5 ? 'rgba(160,190,220,0.5)' : '#ffffff'; g.fillRect(R() * S, R() * S, 2, 2); }
  } else if (kind === 'marble') {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#e8e2d6' : '#cfc6b8'; g.fillRect(x * 64, y * 64, 64, 64); }
    g.strokeStyle = 'rgba(120,110,100,0.25)'; g.lineWidth = 2; for (let k = 0; k < 20; k++) { g.beginPath(); let x = R() * S, y = R() * S; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
  } else if (kind === 'grass') {
    g.fillStyle = '#7cb342'; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; g.fillRect(0, k * 64, S, 64); }
    for (let k = 0; k < 900; k++) { g.fillStyle = R() < 0.5 ? 'rgba(51,105,30,0.35)' : 'rgba(197,225,165,0.35)'; g.fillRect(R() * S, R() * S, 2, 4); }
  } else if (kind === 'moon') {
    g.fillStyle = '#8a8fa3'; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 700; k++) { g.fillStyle = R() < 0.5 ? 'rgba(60,62,80,0.3)' : 'rgba(200,205,225,0.35)'; g.beginPath(); g.arc(R() * S, R() * S, 1 + R() * 3, 0, TAU); g.fill(); }
    for (let k = 0; k < 14; k++) { const x = R() * S, y = R() * S, r = 8 + R() * 30; g.fillStyle = 'rgba(70,72,95,0.35)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = 'rgba(210,215,235,0.45)'; g.lineWidth = 3; g.beginPath(); g.arc(x - 1, y - 1, r, Math.PI * 0.9, Math.PI * 1.9); g.stroke(); }
  } else if (kind === 'city') {
    g.fillStyle = '#c9cdd2'; g.fillRect(0, 0, S, S);
    g.strokeStyle = 'rgba(120,125,135,0.5)'; g.lineWidth = 2; for (let k = 0; k <= S; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, S); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(S, k); g.stroke(); }
    for (let k = 0; k < 300; k++) { g.fillStyle = R() < 0.5 ? 'rgba(90,95,105,0.15)' : 'rgba(255,255,255,0.3)'; g.fillRect(R() * S, R() * S, 3, 3); }
  } else if (kind === 'rock') {
    g.fillStyle = '#3b2e2c'; g.fillRect(0, 0, S, S);
    for (let k = 0; k < 900; k++) { g.fillStyle = R() < 0.5 ? 'rgba(20,12,10,0.4)' : 'rgba(120,90,80,0.25)'; g.beginPath(); g.arc(R() * S, R() * S, 2 + R() * 7, 0, TAU); g.fill(); }
    for (let k = 0; k < 14; k++) {
      let x = R() * S, y = R() * S; g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 6; s++) { x += (R() - 0.5) * 90; y += (R() - 0.5) * 90; g.lineTo(x, y); }
      g.strokeStyle = 'rgba(15,8,6,0.8)'; g.lineWidth = 5; g.stroke(); g.strokeStyle = k % 3 === 0 ? 'rgba(255,110,30,0.55)' : 'rgba(255,110,30,0.15)'; g.lineWidth = 2; g.stroke();
    }
  }
  return ctx.createPattern(c, 'repeat');
}

// ---------- Rita banan ----------
function drawTrackBase(ctx, T, view, time) {
  const th = T.theme, hw = T.hw;
  if (!T.groundPat) T.groundPat = makeGroundPattern(ctx, T);
  ctx.fillStyle = T.groundPat; ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
  for (const s of T.special) if (s.kind !== 'sofa') drawSpecial(ctx, s, time, view);
  for (const o of T.decor) {
    if (o.x + o.r * 1.6 < view.x0 || o.x - o.r * 1.6 > view.x1 || o.y + o.r * 1.6 < view.y0 || o.y - o.r * 1.6 > view.y1) continue;
    drawDecor(ctx, o, time);
  }
  for (const s of T.special) if (s.kind === 'sofa') drawSpecial(ctx, s, time, view);
  ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
  // skugga
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = hw * 2 + th.bw * 2 + 16;
  ctx.save(); ctx.translate(6, 10); ctx.stroke(T.path); ctx.restore();
  // kant
  if (th.ground === 'snow') { ctx.strokeStyle = '#b8cce0'; ctx.lineWidth = hw * 2 + th.bw * 2 + 22; ctx.stroke(T.path); }
  ctx.strokeStyle = th.b1; ctx.lineWidth = hw * 2 + th.bw * 2; ctx.stroke(T.path);
  if (th.ground === 'snow') { ctx.setLineDash([6, 90]); ctx.strokeStyle = th.b2; ctx.lineWidth = hw * 2 + th.bw * 2 - 4; ctx.stroke(T.path); ctx.setLineDash([]); }
  else if (th.ground === 'rock') { ctx.strokeStyle = th.b2; ctx.lineWidth = hw * 2 + th.bw * 2 - 14; ctx.stroke(T.path); ctx.setLineDash([22, 30]); ctx.strokeStyle = 'rgba(255,120,40,0.55)'; ctx.lineWidth = hw * 2 + th.bw * 2 - 8; ctx.stroke(T.path); ctx.setLineDash([]); }
  else { ctx.setLineDash([46, 46]); ctx.strokeStyle = th.b2; ctx.stroke(T.path); ctx.setLineDash([]); }
  // väg
  ctx.strokeStyle = th.road; ctx.lineWidth = hw * 2; ctx.stroke(T.path);
  if (th.planks) { ctx.setLineDash([3, 24]); ctx.strokeStyle = th.planks; ctx.lineWidth = hw * 2; ctx.stroke(T.path); ctx.setLineDash([]); }
  // kantlinjer
  ctx.strokeStyle = th.edge; ctx.lineWidth = 6; ctx.stroke(T.edgeL); ctx.stroke(T.edgeR);
  if (th.center) { ctx.setLineDash([36, 44]); ctx.strokeStyle = th.center; ctx.globalAlpha = 0.7; ctx.lineWidth = 6; ctx.stroke(T.path); ctx.globalAlpha = 1; ctx.setLineDash([]); }
  // start/mål
  const cl = T.cl; ctx.save(); ctx.translate(cl.px[0], cl.py[0]); ctx.rotate(cl.ang[0]);
  const sq = 20; for (let r = 0; r < 2; r++) for (let k = -Math.round(hw / sq); k < Math.round(hw / sq); k++) { ctx.fillStyle = (k + r) % 2 ? '#111' : '#fff'; ctx.fillRect(-sq + r * sq, k * sq, sq, sq); }
  ctx.restore();
}

function drawSpecial(ctx, s, time, view) {
  const { x, y, r } = s;
  if (s.kind === 'rug') {
    const cols = ['#3f51b5', '#ffca28', '#e53935', '#26a69a', '#fff3e0'];
    for (let k = 0; k < 5; k++) { ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.ellipse(x, y, r * (1 - k * 0.17), r * 0.8 * (1 - k * 0.17), 0, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = '#fff3e0'; ctx.lineWidth = 6; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.ellipse(x, y, r + 8, r * 0.8 + 8, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = 'bold 90px "Arial Rounded MT Bold", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e53935'; ctx.fillText('★', x, y);
  } else if (s.kind === 'sofa') {
    const w = 1100, h = 330;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, x - w / 2 + 14, y - h / 2 + 18, w, h, 50); ctx.fill();
    ctx.fillStyle = '#5c6bc0'; rr(ctx, x - w / 2, y - h / 2, w, h, 50); ctx.fill();
    ctx.fillStyle = '#3949ab'; rr(ctx, x - w / 2, y - h / 2, w, 110, 50); ctx.fill();
    ctx.fillStyle = '#3949ab'; rr(ctx, x - w / 2, y - h / 2, 110, h, 50); ctx.fill(); rr(ctx, x + w / 2 - 110, y - h / 2, 110, h, 50); ctx.fill();
    ctx.fillStyle = '#7986cb'; for (let k = 0; k < 3; k++) { rr(ctx, x - w / 2 + 125 + k * 290, y - h / 2 + 125, 270, 180, 30); ctx.fill(); }
    ctx.fillStyle = '#ffb74d'; ctx.save(); ctx.translate(x - 260, y - 60); ctx.rotate(0.3); rr(ctx, -70, -50, 140, 100, 30); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#ef5350'; ctx.save(); ctx.translate(x + 270, y - 50); ctx.rotate(-0.25); rr(ctx, -70, -50, 140, 100, 30); ctx.fill(); ctx.restore();
  } else if (s.kind === 'ocean') {
    const top = y; if (view.y1 < top - 80) return;
    ctx.fillStyle = '#e7c98e'; ctx.beginPath(); ctx.moveTo(view.x0, view.y1 + 10);
    for (let xx = view.x0 - 40; xx <= view.x1 + 40; xx += 40) ctx.lineTo(xx, top - 60 + Math.sin(xx / 170) * 18);
    ctx.lineTo(view.x1 + 40, view.y1 + 10); ctx.fill();
    const layers = [['#4fc3f7', 0], ['#29b6f6', 70], ['#0288d1', 220], ['#01579b', 520]];
    for (const [c, dy] of layers) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(view.x0 - 40, view.y1 + 10);
      for (let xx = view.x0 - 40; xx <= view.x1 + 40; xx += 30) ctx.lineTo(xx, top + dy + Math.sin(xx / 120 + time * 1.5 + dy) * 14 + Math.sin(time * 0.8) * 10);
      ctx.lineTo(view.x1 + 40, view.y1 + 10); ctx.fill();
      if (dy === 0) { ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 8; ctx.stroke(); }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5;
    for (let k = 0; k < 30; k++) { const wx = Math.floor(view.x0 / 400) * 400 + (k % 10) * 400 + ((k * 137) % 200), wy = top + 150 + Math.floor(k / 10) * 180; if (wy > view.y1 + 20) continue; ctx.beginPath(); ctx.arc(wx + Math.sin(time + k) * 20, wy, 30, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    // båt
    const bx = ((time * 40) % 5000) - 200 + (view.x0 > 0 ? 0 : 0), by = top + 380;
    if (bx > view.x0 - 200 && bx < view.x1 + 200 && by < view.y1 + 100) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(bx, by, 90, 34, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.ellipse(bx, by, 90, 34, 0, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = '#e53935'; ctx.stroke();
      ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.moveTo(bx - 10, by - 4); ctx.lineTo(bx + 60, by); ctx.lineTo(bx - 10, by + 4); ctx.fill();
    }
  } else if (s.kind === 'lake') {
    ctx.fillStyle = '#d6e7f5'; ctx.beginPath(); ctx.ellipse(x, y, r + 30, r * 0.75 + 30, 0.2, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 10, x, y, r); g.addColorStop(0, '#e3f4ff'); g.addColorStop(1, '#8ec5ea');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.75, 0.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 5;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(x + Math.cos(k * 2) * r * 0.4, y + Math.sin(k * 2) * r * 0.3, 80, 30, k, 0.3, 2.5); ctx.stroke(); }
    // skridskoåkare (liten pingvin)
    const ax = x + Math.cos(time * 0.6) * r * 0.55, ay = y + Math.sin(time * 0.6) * r * 0.4;
    drawPenguin(ctx, ax, ay, 24, time * 0.6 + Math.PI / 2, time);
  } else if (s.kind === 'base') {
    ctx.fillStyle = '#5c6078'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 6; ctx.setLineDash([30, 20]); ctx.beginPath(); ctx.arc(x, y, r - 10, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    const domes = [[0, 0, 0.35], [-0.5, -0.3, 0.2], [0.5, -0.25, 0.22], [0.1, 0.55, 0.2], [-0.45, 0.4, 0.15]];
    ctx.strokeStyle = '#9fa8da'; ctx.lineWidth = 18; for (const [dx, dy] of domes.slice(1)) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * r, y + dy * r); ctx.stroke(); }
    for (const [dx, dy, dr] of domes) { const cx = x + dx * r, cy = y + dy * r, R2 = dr * r; const g = ctx.createRadialGradient(cx - R2 * 0.3, cy - R2 * 0.3, 5, cx, cy, R2); g.addColorStop(0, '#e1f5fe'); g.addColorStop(1, '#4fc3f7'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R2, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + k * R2 * 0.35, cy - R2 * 0.9); ctx.lineTo(cx + k * R2 * 0.35, cy + R2 * 0.9); ctx.stroke(); } }
    ctx.fillStyle = `rgba(255,${Math.floor(t2(time))},64,0.9)`; ctx.beginPath(); ctx.arc(x + r * 0.5, y - r * 0.25, 10, 0, TAU); ctx.fill();
  } else if (s.kind === 'park') {
    ctx.fillStyle = '#7cb342'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#558b2f'; ctx.lineWidth = 14; ctx.stroke();
    ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
    ctx.fillStyle = '#e8d8b0'; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#90a4ae'; ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, TAU); ctx.fill(); ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, TAU); ctx.fill();
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + time; const d = r * 0.06 + ((time * 40 + k * 10) % (r * 0.1)); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 5, 0, TAU); ctx.fill(); }
    for (const [dx, dy] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6], [-0.35, -0.75], [0.75, 0.3]]) { if (dx * dx + dy * dy > 0.75) continue; drawTree(ctx, x + dx * r, y + dy * r, r * 0.12); }
  } else if (s.kind === 'stage') {
    ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 16; ctx.stroke();
    for (let k = 0; k < 3; k++) { const w = [220, 160, 130][k], h = [120, 170, 90][k], px = x + [-220, 0, 220][k] * (r / 700), py = y + 60; ctx.fillStyle = ['#cfd8dc', '#ffd54f', '#ffab76'][k]; ctx.fillRect(px - w / 2, py - h, w, h); ctx.fillStyle = '#1a1033'; ctx.font = 'bold 70px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(['2', '1', '3'][k], px, py - h / 2); }
    ctx.font = 'bold 60px Arial'; ctx.fillStyle = '#ffd54f'; ctx.fillText('IFSB', x, y + r * 0.6);
    for (let k = 0; k < 6; k++) { const ph = (time * 0.5 + k / 6) % 1, a = k * 1.1; const fx = x + Math.cos(a) * r * 0.5, fy = y + Math.sin(a) * r * 0.5; if (ph < 0.5) continue; const R2 = (ph - 0.5) * 2 * 160; for (let j = 0; j < 10; j++) { const b = j / 10 * TAU; ctx.fillStyle = `hsla(${k * 60},90%,60%,${1 - (ph - 0.5) * 2})`; ctx.beginPath(); ctx.arc(fx + Math.cos(b) * R2, fy + Math.sin(b) * R2, 8, 0, TAU); ctx.fill(); } }
  } else if (s.kind === 'volcano') {
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, '#6d4c41'); g.addColorStop(0.7, '#4e342e'); g.addColorStop(1, 'rgba(40,25,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(30,15,10,0.5)'; ctx.lineWidth = 10;
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3); ctx.lineTo(x + Math.cos(a + 0.1) * r * 0.75, y + Math.sin(a + 0.1) * r * 0.75); ctx.stroke(); }
    // lavaströmmar
    const glow = 0.75 + Math.sin(time * 3) * 0.25;
    for (let k = 0; k < 4; k++) {
      const a = k * 1.6 + 0.4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2);
      for (let s2 = 1; s2 <= 8; s2++) { const rr2 = r * (0.2 + s2 * 0.09); ctx.lineTo(x + Math.cos(a + Math.sin(s2 * 1.3 + k) * 0.12) * rr2, y + Math.sin(a + Math.sin(s2 * 1.3 + k) * 0.12) * rr2); }
      ctx.strokeStyle = `rgba(255,${100 + 60 * glow | 0},20,0.9)`; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 7; ctx.stroke();
    }
    const cg = ctx.createRadialGradient(x, y, 5, x, y, r * 0.28); cg.addColorStop(0, '#fff59d'); cg.addColorStop(0.4, '#ff9800'); cg.addColorStop(1, '#bf360c');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, y, r * 0.26 * (0.95 + glow * 0.05), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 16; ctx.stroke();
    // rök
    for (let k = 0; k < 7; k++) {
      const ph = (time * 0.25 + k / 7) % 1; const sx = x + Math.sin(k * 3 + time * 0.3) * 40 + ph * 160, sy = y - ph * r * 0.9;
      ctx.fillStyle = `rgba(90,80,80,${0.45 * (1 - ph)})`; ctx.beginPath(); ctx.arc(sx, sy, 50 + ph * 120, 0, TAU); ctx.fill();
    }
  }
}

function t2(time) { return 120 + Math.floor((Math.sin(time * 4) + 1) * 60); }
function drawTree(ctx, x, y, r) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#388e3c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#4caf50'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.45, 0, TAU); ctx.fill(); } ctx.fillStyle = '#66bb6a'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, TAU); ctx.fill(); }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
const TOY_COLS = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00', '#8e24aa'];

function drawDecor(ctx, o, time) {
  const { x, y, r, rot } = o; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  switch (o.kind) {
    case 'block': { const s = r * 1.3; ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ctx, -s / 2 + 5, -s / 2 + 7, s, s, 8); ctx.fill(); ctx.fillStyle = TOY_COLS[o.c]; rr(ctx, -s / 2, -s / 2, s, s, 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(ctx, -s / 3, -s / 3, s / 1.5, s / 1.5, 6); ctx.fill(); ctx.fillStyle = TOY_COLS[(o.c + 2) % 6]; ctx.font = `bold ${s * 0.5 | 0}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ABCLMT'[o.c], 0, 2); break; }
    case 'lego_pile': for (let k = 0; k < 5; k++) { ctx.save(); ctx.translate(Math.cos(k * 2.3) * r * 0.5, Math.sin(k * 2.3) * r * 0.5); ctx.rotate(k); drawLego(ctx, TOY_COLS[(o.c + k) % 6], 1); ctx.restore(); } break;
    case 'book_d': { const w = r * 1.6, h = r * 1.15; ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h); ctx.fillStyle = TOY_COLS[o.c]; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#fff8e1'; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12); ctx.fillStyle = TOY_COLS[(o.c + 3) % 6]; ctx.fillRect(-w / 2 + 14, -h / 2 + 16, w - 28, 10); ctx.fillRect(-w / 2 + 14, -h / 2 + 36, w * 0.5, 8); ctx.beginPath(); ctx.arc(w * 0.18, h * 0.12, h * 0.18, 0, TAU); ctx.fill(); break; }
    case 'crayon': { const l = r * 2.2; ctx.fillStyle = TOY_COLS[o.c]; rr(ctx, -l / 2, -7, l, 14, 6); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-l / 4, -7, l / 3, 14); ctx.fillStyle = TOY_COLS[o.c]; ctx.beginPath(); ctx.moveTo(l / 2, -7); ctx.lineTo(l / 2 + 16, 0); ctx.lineTo(l / 2, 7); ctx.fill(); break; }
    case 'ball': { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(8, 10, r, 0, TAU); ctx.fill(); ctx.fillStyle = TOY_COLS[o.c]; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r, 0.3, 1.3); ctx.lineTo(0, 0); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, r, 2.4, 3.4); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, TAU); ctx.fill(); break; }
    case 'sock': { ctx.fillStyle = TOY_COLS[o.c]; rr(ctx, -r, -r * 0.3, r * 1.4, r * 0.6, r * 0.3); ctx.fill(); ctx.beginPath(); ctx.ellipse(r * 0.4, r * 0.2, r * 0.45, r * 0.35, 0.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-r, -r * 0.3, r * 0.3, r * 0.6); break; }
    case 'plant': { ctx.fillStyle = '#8d4a2b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#5d2f1a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, TAU); ctx.fill(); for (let k = 0; k < 7; k++) { ctx.save(); ctx.rotate(k / 7 * TAU); ctx.fillStyle = k % 2 ? '#43a047' : '#66bb6a'; ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.6, r * 0.2, 0, 0, TAU); ctx.fill(); ctx.restore(); } break; }
    case 'car_toy': { ctx.scale(r / 40, r / 40); ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, -26, -12, 56, 30, 8); ctx.fill(); ctx.fillStyle = '#222'; ctx.fillRect(-20, -17, 12, 34); ctx.fillRect(10, -17, 12, 34); ctx.fillStyle = TOY_COLS[o.c]; rr(ctx, -28, -14, 56, 28, 8); ctx.fill(); ctx.fillStyle = '#90caf9'; rr(ctx, -6, -10, 14, 20, 4); ctx.fill(); break; }
    case 'cat': { ctx.scale(r / 80, r / 80); ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.ellipse(0, 0, 70, 50, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(55, -25, 30, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(40, -45); ctx.lineTo(45, -70); ctx.lineTo(62, -50); ctx.fill(); ctx.beginPath(); ctx.moveTo(62, -45); ctx.lineTo(80, -62); ctx.lineTo(82, -38); ctx.fill(); ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-65, 10); ctx.quadraticCurveTo(-100, 60, -40, 60); ctx.stroke(); ctx.strokeStyle = '#e65100'; ctx.lineWidth = 7; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 22 - 8, -45); ctx.lineTo(k * 22 + 4, -20); ctx.stroke(); } ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(47, -28, 5, 0, Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(64, -30, 5, 0, Math.PI); ctx.stroke(); const z = (time % 2) / 2; ctx.fillStyle = `rgba(255,255,255,${1 - z})`; ctx.font = 'bold 30px Arial'; ctx.fillText('z', 80 + z * 30, -70 - z * 40); break; }
    case 'palm': { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(20, 25, r, 0, TAU); ctx.fill(); for (let k = 0; k < 7; k++) { ctx.save(); ctx.rotate(k / 7 * TAU + Math.sin(time + o.s * 9) * 0.04); ctx.fillStyle = k % 2 ? '#2e7d32' : '#43a047'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.5, -r * 0.35, r * 1.1, 0); ctx.quadraticCurveTo(r * 0.5, r * 0.3, 0, 0); ctx.fill(); ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore(); } ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, TAU); ctx.fill(); ctx.fillStyle = '#6d4c41'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 2) * r * 0.16, Math.sin(k * 2) * r * 0.16, r * 0.08, 0, TAU); ctx.fill(); } break; }
    case 'parasol': { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(14, 18, r, 0, TAU); ctx.fill(); for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#fff' : TOY_COLS[o.c]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, k / 8 * TAU, (k + 1) / 8 * TAU); ctx.fill(); } ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); break; }
    case 'towel': { const w = r * 1.8, h = r * 0.9; ctx.fillStyle = TOY_COLS[o.c]; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#fff'; for (let k = 0; k < 4; k++) ctx.fillRect(-w / 2 + k * w / 4 + w / 16, -h / 2, w / 8, h); break; }
    case 'castle_d': drawCastle(ctx, r); break;
    case 'bball': { ctx.rotate(time * 0.5); for (let k = 0; k < 6; k++) { ctx.fillStyle = TOY_COLS[k]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, k / 6 * TAU, (k + 1) / 6 * TAU); ctx.fill(); } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, TAU); ctx.fill(); break; }
    case 'shell': { ctx.fillStyle = ['#ffccbc', '#fff3e0', '#f8bbd0'][o.c % 3]; ctx.beginPath(); ctx.moveTo(0, r); for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); } ctx.fill(); ctx.strokeStyle = 'rgba(150,90,70,0.5)'; ctx.lineWidth = 2; for (let k = 1; k < 8; k += 2) { const a = Math.PI + k / 8 * Math.PI; ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); ctx.stroke(); } break; }
    case 'star': { ctx.fillStyle = ['#ff7043', '#ffca28', '#f06292'][o.c % 3]; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, rr2 = k % 2 ? r * 0.4 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); break; }
    case 'bucket_d': drawBucket(ctx, r, TOY_COLS[o.c]); break;
    case 'pine': drawPine(ctx, r, o.s); break;
    case 'rock_s': { ctx.fillStyle = '#78909c'; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.75, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.15, r * 0.75, r * 0.5, 0, 0, TAU); ctx.fill(); break; }
    case 'snowman_d': drawSnowman(ctx, r, time); break;
    case 'cabin': { ctx.rotate(-rot + (o.c % 2) * 0.1); const w = r * 1.6, h = r * 1.2; ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); ctx.fillStyle = '#8d4a2b'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-w / 2 - 10, -h / 2 - 8); ctx.lineTo(w / 2 + 10, -h / 2 - 8); ctx.lineTo(w / 2 + 10, 0); ctx.lineTo(-w / 2 - 10, 0); ctx.fill(); ctx.fillStyle = '#e3eef8'; ctx.beginPath(); ctx.moveTo(-w / 2 - 10, 0); ctx.lineTo(w / 2 + 10, 0); ctx.lineTo(w / 2 + 10, h / 2 + 8); ctx.lineTo(-w / 2 - 10, h / 2 + 8); ctx.fill(); ctx.fillStyle = '#6d4c41'; ctx.fillRect(w * 0.2, -h * 0.35, 22, 22); for (let k = 0; k < 4; k++) { const ph = (time * 0.4 + k / 4) % 1; ctx.fillStyle = `rgba(200,200,210,${0.6 * (1 - ph)})`; ctx.beginPath(); ctx.arc(w * 0.2 + 11 + ph * 60, -h * 0.35 - ph * 80, 10 + ph * 24, 0, TAU); ctx.fill(); } break; }
    case 'sled': { ctx.fillStyle = '#c62828'; rr(ctx, -r, -r * 0.4, r * 2, r * 0.8, 10); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-r, -r * 0.5); ctx.lineTo(r * 1.1, -r * 0.5); ctx.moveTo(-r, r * 0.5); ctx.lineTo(r * 1.1, r * 0.5); ctx.stroke(); break; }
    case 'fern': { for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k / 6 * TAU); ctx.strokeStyle = k % 2 ? '#558b2f' : '#7cb342'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.5, r * 0.2, r, 0); ctx.stroke(); for (let s = 1; s < 5; s++) { ctx.beginPath(); ctx.moveTo(r * s / 5, r * 0.08); ctx.lineTo(r * s / 5 + 8, r * 0.25); ctx.moveTo(r * s / 5, r * 0.02); ctx.lineTo(r * s / 5 + 8, -r * 0.15); ctx.stroke(); } ctx.restore(); } break; }
    case 'cycad': { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(14, 18, r, 0, TAU); ctx.fill(); for (let k = 0; k < 9; k++) { ctx.save(); ctx.rotate(k / 9 * TAU); ctx.fillStyle = k % 2 ? '#33691e' : '#558b2f'; ctx.beginPath(); ctx.ellipse(r * 0.5, 0, r * 0.55, r * 0.14, 0, 0, TAU); ctx.fill(); ctx.restore(); } ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.arc(0, 0, r * 0.15, 0, TAU); ctx.fill(); break; }
    case 'bones': { ctx.fillStyle = '#efebe9'; for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(k * 1.1); ctx.translate(k * 10 - 10, k * 8); ctx.fillRect(-r * 0.6, -5, r * 1.2, 10); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * r * 0.6, -6, 8, 0, TAU); ctx.arc(sx * r * 0.6, 6, 8, 0, TAU); ctx.fill(); } ctx.restore(); } break; }
    case 'eggs': { ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, TAU); ctx.fill(); const cols = ['#f1f8e9', '#fff9c4', '#e1f5fe']; for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35, r * 0.3, r * 0.4, a, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(100,150,80,0.6)'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.35 + 4, Math.sin(a) * r * 0.35 - 3, 3, 0, TAU); ctx.fill(); } break; }
    case 'rock_d': { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(8, 10, r * 0.8, 0, TAU); ctx.fill(); ctx.fillStyle = '#5d4037'; ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr2 = r * (0.7 + ((k * 37 + o.c * 11) % 10) / 30); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.35, 0, TAU); ctx.fill(); break; }
    case 'lavapool': { const g = 0.7 + Math.sin(time * 2 + o.s * 10) * 0.3; ctx.fillStyle = '#2b1a14'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r * 0.85, 0, 0, TAU); ctx.fill(); ctx.fillStyle = `rgb(255,${90 + 60 * g | 0},20)`; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(Math.sin(time * 1.3 + o.s * 5) * r * 0.4, Math.cos(time + o.s) * r * 0.2, r * 0.18 * g, 0, TAU); ctx.fill(); break; }
    case 'longneck': drawLongneck(ctx, r, time, o.s); break;
    case 'crater_d': { ctx.fillStyle = 'rgba(60,62,85,0.45)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(215,220,240,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-2, -2, r, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke(); ctx.strokeStyle = 'rgba(40,40,60,0.4)'; ctx.beginPath(); ctx.arc(2, 2, r, -0.1, Math.PI * 0.8); ctx.stroke(); break; }
    case 'rocket': { ctx.rotate(-rot); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(10, 14, r * 0.5, 0, TAU); ctx.fill(); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); ctx.lineTo(Math.cos(a + 0.5) * r * 0.3, Math.sin(a + 0.5) * r * 0.3); ctx.fill(); } ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, TAU); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.arc(r * 0.2, 0, r * 0.08, 0, TAU); ctx.fill(); break; }
    case 'dish': { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(8, 10, r * 0.8, 0, TAU); ctx.fill(); ctx.fillStyle = '#eceff1'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 3; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(0, 0, r * 0.8 * k / 3.3, 0, TAU); ctx.stroke(); } ctx.strokeStyle = '#78909c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.9, 0); ctx.stroke(); ctx.fillStyle = Math.floor(time * 2 + o.s * 5) % 2 ? '#ff1744' : '#b71c1c'; ctx.beginPath(); ctx.arc(r * 0.9, 0, 6, 0, TAU); ctx.fill(); break; }
    case 'crystal': { const cols = ['#e040fb', '#00e5ff', '#76ff03', '#ffea00', '#ff4081', '#7c4dff']; for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(k * 1.6); ctx.fillStyle = cols[(o.c + k) % 6]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.25, -r * 0.2); ctx.lineTo(r * (0.8 + k * 0.1), 0); ctx.lineTo(r * 0.25, r * 0.2); ctx.fill(); ctx.restore(); } ctx.globalAlpha = 1; break; }
    case 'flag': { ctx.rotate(-rot); ctx.fillStyle = '#9e9e9e'; ctx.fillRect(-2, -r, 4, r * 1.4); ctx.fillStyle = '#1e88e5'; ctx.fillRect(2, -r, r * 1.1, r * 0.7); ctx.fillStyle = '#fdd835'; ctx.fillRect(2 + r * 0.3, -r, r * 0.15, r * 0.7); ctx.fillRect(2, -r + r * 0.28, r * 1.1, r * 0.14); break; }
    case 'alien': { ctx.rotate(-rot); const b = Math.sin(time * 5 + o.s * 9) * 3; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(5, 8, r * 0.7, r * 0.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#76ff03'; ctx.beginPath(); ctx.arc(0, b, r * 0.6, 0, TAU); ctx.fill(); ctx.strokeStyle = '#76ff03'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-r * 0.3, b - r * 0.5); ctx.lineTo(-r * 0.5, b - r * 1.0); ctx.moveTo(r * 0.3, b - r * 0.5); ctx.lineTo(r * 0.5, b - r * 1.0); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, b - r * 0.1, r * 0.28, 0, TAU); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, b - r * 0.1, r * 0.14, 0, TAU); ctx.fill(); break; }
    case 'house': { ctx.rotate(-rot + (o.c % 2) * Math.PI / 2); const w = r * 1.5, h = r * 1.1; const roofs = ['#c62828', '#6d4c41', '#37474f', '#1565c0', '#2e7d32', '#ef6c00']; ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); ctx.fillStyle = roofs[o.c]; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-w / 2, 0, w, h / 2); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.stroke(); ctx.fillStyle = '#5d4037'; ctx.fillRect(w * 0.2, -h * 0.35, 16, 16); if (o.s > 0.5) { ctx.fillStyle = '#90a4ae'; ctx.fillRect(-w * 0.35, h * 0.1, 22, 22); } break; }
    case 'tree': drawTree(ctx, 0, 0, r); break;
    case 'stand': { const w = r * 2.2, h = r * 1.1; ctx.fillStyle = '#546e7a'; ctx.fillRect(-w / 2, -h / 2, w, h); for (let row = 0; row < 4; row++) for (let k = 0; k < 11; k++) { const hx = -w / 2 + 12 + k * (w - 24) / 10, hy = -h / 2 + 14 + row * (h - 28) / 3 + Math.sin(time * 8 + k + row * 2 + o.s * 9) * 3; ctx.fillStyle = TOY_COLS[(k + row + o.c) % 6]; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffdbb4'; ctx.beginPath(); ctx.arc(hx, hy - 6, 5, 0, TAU); ctx.fill(); } break; }
    case 'statue': { ctx.rotate(-rot); ctx.fillStyle = '#8d6e63'; ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4); ctx.save(); ctx.translate(0, -r * 0.1); ctx.scale(0.9, 0.9); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.35, 0, TAU); ctx.fill(); ctx.fillRect(-r * 0.4, 0, r * 0.8, r * 0.5); ctx.fillStyle = '#b8860b'; ctx.fillRect(-r * 0.45, -r * 0.02, r * 0.9, r * 0.06); ctx.restore(); break; }
    case 'spot': { const a = Math.sin(time * 0.8 + o.s * 10) * 0.6; ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, r * 8, 0); g.addColorStop(0, 'rgba(255,255,200,0.35)'); g.addColorStop(1, 'rgba(255,255,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 8, -r * 1.5); ctx.lineTo(r * 8, r * 1.5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, TAU); ctx.fill(); break; }
    case 'flagpole': { ctx.rotate(-rot); ctx.fillStyle = '#9e9e9e'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); const w = Math.sin(time * 5 + o.s * 9) * 5; ctx.fillStyle = TOY_COLS[o.c]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r, w - 6, r * 2, w - 2); ctx.lineTo(r * 2, w + r); ctx.quadraticCurveTo(r, w + r - 4, 0, r); ctx.closePath(); ctx.fill(); break; }
    case 'cone_d': { ctx.fillStyle = '#ff6d00'; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.fillStyle = '#ff9100'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, TAU); ctx.stroke(); break; }
    case 'lamp': { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(4, 5, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#455a64'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.fill(); break; }
  }
  ctx.restore();
}

function drawLego(ctx, col, sc) { ctx.scale(sc, sc); ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, -20, -12, 44, 28, 4); ctx.fill(); ctx.fillStyle = col; rr(ctx, -22, -14, 44, 28, 4); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(-15 + i * 10, -6 + j * 12, 4, 0, TAU); ctx.fill(); } ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(-15 + i * 10, -6 + j * 12, 4, 0, TAU); ctx.stroke(); } }
function drawCastle(ctx, r) { ctx.fillStyle = 'rgba(120,80,30,0.3)'; ctx.beginPath(); ctx.arc(6, 8, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8c070'; ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6); ctx.fillStyle = '#d4a954'; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { ctx.beginPath(); ctx.arc(sx * r * 0.8, sy * r * 0.8, r * 0.38, 0, TAU); ctx.fill(); } ctx.fillStyle = '#f2d38a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, TAU); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * 0.5, -r * 0.2); ctx.lineTo(0, -r * 0.35); ctx.fill(); }
function drawBucket(ctx, r, col) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(5, 7, r, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.75, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, -0.5, 1.5); ctx.stroke(); }
function drawPine(ctx, r, s) { ctx.fillStyle = 'rgba(40,60,90,0.18)'; ctx.beginPath(); ctx.arc(r * 0.3, r * 0.4, r, 0, TAU); ctx.fill(); const layers = [[1, '#1b5e20'], [0.72, '#2e7d32'], [0.45, '#388e3c']]; for (const [f, c] of layers) { ctx.fillStyle = c; ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + s, rr2 = r * f * (k % 2 ? 0.72 : 1); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + s * 3; ctx.beginPath(); ctx.arc(Math.cos(a) * r * f * 0.6, Math.sin(a) * r * f * 0.6, r * f * 0.14, 0, TAU); ctx.fill(); } } ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, TAU); ctx.fill(); }
function drawSnowman(ctx, r, time) { ctx.fillStyle = 'rgba(60,90,130,0.25)'; ctx.beginPath(); ctx.arc(6, 8, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#cfdff0'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#fafdff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d32f2f'; ctx.fillRect(-r * 0.62, -r * 0.1, r * 1.24, r * 0.2); ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#424242'; ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(r * 0.3, -4); ctx.lineTo(r * 0.85, 0); ctx.lineTo(r * 0.3, 4); ctx.fill(); ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(-r * 0.3, -r * 1.5); ctx.moveTo(0, r); ctx.lineTo(-r * 0.3, r * 1.5); ctx.stroke(); }
function drawLongneck(ctx, r, time, s) {
  const sw = Math.sin(time * 0.8 + s * 10) * 0.15;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(15, 20, r * 0.7, r * 0.45, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7e57c2';
  ctx.strokeStyle = '#7e57c2'; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.22; ctx.beginPath(); ctx.moveTo(-r * 0.5, 0); ctx.quadraticCurveTo(-r * 1.0, r * 0.3 * Math.sin(time + s), -r * 1.3, r * 0.2); ctx.stroke();
  ctx.lineWidth = r * 0.18; ctx.beginPath(); ctx.moveTo(r * 0.4, 0); ctx.quadraticCurveTo(r * 0.9, -r * 0.2 + sw * r, r * 1.2, sw * r * 2); ctx.stroke();
  for (const [lx, ly] of [[0.3, -0.45], [0.3, 0.45], [-0.35, -0.45], [-0.35, 0.45]]) { ctx.beginPath(); ctx.arc(lx * r, ly * r, r * 0.12, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.62, r * 0.42, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#9575cd'; ctx.beginPath(); ctx.ellipse(-r * 0.05, -r * 0.08, r * 0.4, r * 0.22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7e57c2'; ctx.beginPath(); ctx.ellipse(r * 1.28, sw * r * 2, r * 0.17, r * 0.12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 1.32, sw * r * 2 - r * 0.07, 5, 0, TAU); ctx.arc(r * 1.32, sw * r * 2 + r * 0.07, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 1.34, sw * r * 2 - r * 0.07, 2.5, 0, TAU); ctx.arc(r * 1.34, sw * r * 2 + r * 0.07, 2.5, 0, TAU); ctx.fill();
}
function drawPenguin(ctx, x, y, r, a, time) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(60,90,130,0.25)'; ctx.beginPath(); ctx.ellipse(4, 6, r * 1.1, r * 0.8, 0, 0, TAU); ctx.fill();
  const fl = Math.sin(time * 12) * 0.4;
  ctx.fillStyle = '#263238'; ctx.save(); ctx.rotate(fl); ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 0.8, r * 0.5, r * 0.18, -0.4, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.rotate(-fl); ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.8, r * 0.5, r * 0.18, 0.4, 0, TAU); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.75, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * 0.1, 0, r * 0.7, r * 0.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(r * 0.65, 0, r * 0.45, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(r * 1.0, -r * 0.12); ctx.lineTo(r * 1.35, 0); ctx.lineTo(r * 1.0, r * 0.12); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.8, -r * 0.2, r * 0.12, 0, TAU); ctx.arc(r * 0.8, r * 0.2, r * 0.12, 0, TAU); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(r * 0.85, -r * 0.2, r * 0.06, 0, TAU); ctx.arc(r * 0.85, r * 0.2, r * 0.06, 0, TAU); ctx.fill();
  ctx.restore();
}
