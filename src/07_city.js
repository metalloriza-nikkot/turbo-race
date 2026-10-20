// ===================== TURBOSTADEN: värld, fysik och ritning =====================
// Rutnät med 5×5 kvarter. Vägar i x/y = i*CP (i = 0..5). En å ersätter den horisontella vägen j = 3; broar vid i = 0, 2, 4.
const CB = 900, CRW = 260, CSW = 55, CP = CB + CRW, CN = 5, CRIVER = 3, CBRIDGES = [0, 2, 4];
const CITY_CAP = 390;
const rc = i => i * CP;
const CITY_EDGE = { x0: -CRW / 2 - 420, y0: -CRW / 2 - 420, x1: rc(CN) + CRW / 2 + 420, y1: rc(CN) + CRW / 2 + 420 };
// Platser. kind: one|two|four|park|plaza. slot: vilken tomt i kvarteret. ent: N|S (ingång mot vilken väg)
const CITY_PLACES = [
  { id: 'parken', word: 'PARKEN', ico: '🌳', blk: [0, 0], kind: 'park', ent: 'S', easy: 1 },
  { id: 'skolan', word: 'SKOLAN', ico: '🏫', blk: [1, 0], kind: 'one', ent: 'S', col: '#ce93d8', h: 150, easy: 1 },
  { id: 'bageriet', word: 'BAGERIET', ico: '🥐', blk: [2, 0], kind: 'two', slot: 1, ent: 'S', col: '#f8bbd0', h: 110 },
  { id: 'roda', word: 'RÖDA HUSET', ico: '🏠', blk: [3, 0], kind: 'four', slot: 2, ent: 'S', col: '#e53935', h: 95, house: 1, easy: 1 },
  { id: 'kiosken', word: 'KIOSKEN', ico: '🍭', blk: [4, 0], kind: 'two', slot: 1, ent: 'S', col: '#b39ddb', h: 80, easy: 1 },
  { id: 'brand', word: 'BRANDSTATIONEN', ico: '🚒', blk: [0, 1], kind: 'one', ent: 'S', col: '#ef5350', h: 140 },
  { id: 'pizzerian', word: 'PIZZERIAN', ico: '🍕', blk: [1, 1], kind: 'two', slot: 0, ent: 'N', col: '#ffab40', h: 110 },
  { id: 'torget', word: 'TORGET', ico: '⛲', blk: [2, 1], kind: 'plaza', ent: 'S' },
  { id: 'polisen', word: 'POLISEN', ico: '🚓', blk: [3, 1], kind: 'one', ent: 'S', col: '#64b5f6', h: 150 },
  { id: 'gula', word: 'GULA HUSET', ico: '🏠', blk: [4, 1], kind: 'four', slot: 0, ent: 'N', col: '#fdd835', h: 95, house: 1, easy: 1 },
  { id: 'blaa', word: 'BLÅA HUSET', ico: '🏠', blk: [0, 2], kind: 'four', slot: 1, ent: 'N', col: '#1e88e5', h: 95, house: 1, easy: 1 },
  { id: 'sjukhuset', word: 'SJUKHUSET', ico: '🏥', blk: [1, 2], kind: 'one', ent: 'N', col: '#eceff1', h: 190 },
  { id: 'affaren', word: 'AFFÄREN', ico: '🛒', blk: [2, 2], kind: 'two', slot: 0, ent: 'N', col: '#aed581', h: 100 },
  { id: 'posten', word: 'POSTEN', ico: '✉️', blk: [3, 2], kind: 'two', slot: 0, ent: 'N', col: '#80cbc4', h: 100, easy: 1 },
  { id: 'grona', word: 'GRÖNA HUSET', ico: '🏠', blk: [4, 2], kind: 'four', slot: 0, ent: 'N', col: '#43a047', h: 95, house: 1, easy: 1 },
  { id: 'garaget', word: 'GARAGET', ico: '🚗', blk: [0, 3], kind: 'two', slot: 1, ent: 'S', col: '#90a4ae', h: 90, garage: 1 },
  { id: 'badhuset', word: 'BADHUSET', ico: '🏊', blk: [1, 3], kind: 'one', ent: 'S', col: '#80deea', h: 120 },
  { id: 'glassbaren', word: 'GLASSBAREN', ico: '🍦', blk: [2, 3], kind: 'two', slot: 1, ent: 'S', col: '#f48fb1', h: 90 },
  { id: 'zoo', word: 'ZOO', ico: '🦒', blk: [3, 3], kind: 'zoo', ent: 'S', easy: 1 },
  { id: 'hamnen', word: 'HAMNEN', ico: '⚓', blk: [4, 3], kind: 'one', ent: 'S', col: '#8d6e63', h: 100 },
  { id: 'biblioteket', word: 'BIBLIOTEKET', ico: '📚', blk: [1, 4], kind: 'two', slot: 0, ent: 'N', col: '#bcaaa4', h: 120 },
];
// kvarter utan platser = utfyllnad
const CITY_FILL = { '2,0': 'two', '3,0': 'four', '4,0': 'two', '1,1': 'two', '4,1': 'four', '0,2': 'four', '3,2': 'two', '4,2': 'four', '0,3': 'two', '2,3': 'two', '0,4': 'four', '1,4': 'two', '2,4': 'four', '3,4': 'two', '4,4': 'one' };
// Utfyllnadshus har neutrala färger (beige/grå/ljuslila) och bruna/grå tak – bara de färgade husen får färg på taket, så de syns uppifrån.
const HOUSE_COLS = ['#fce4ec', '#f3e5f5', '#efebe9', '#d7ccc8', '#eceff1', '#cfd8dc', '#ede7f6'];
const ROOF_COLS = ['#8d6e63', '#6d4c41', '#a1887f', '#9e9e9e', '#757575', '#5d4037'];

function cityBlockRect(i, j) { return { x0: rc(i) + CRW / 2, y0: rc(j) + CRW / 2, x1: rc(i + 1) - CRW / 2, y1: rc(j + 1) - CRW / 2 }; }
function buildCity() {
  const C = { buildings: [], circles: [], water: [], bays: [], places: {}, trees: [], lamps: [], parked: [], peds: [], coins: [], deco: [] };
  const rnd = mulberry(4242);
  const placeAt = {};
  for (const p of CITY_PLACES) { const k = p.blk.join(','); (placeAt[k] = placeAt[k] || []).push(p); }
  for (let j = 0; j < CN; j++) for (let i = 0; i < CN; i++) {
    const R = cityBlockRect(i, j), I = { x0: R.x0 + CSW, y0: R.y0 + CSW, x1: R.x1 - CSW, y1: R.y1 - CSW };
    const ps = placeAt[i + ',' + j] || [];
    const kind = ps.length ? ps[0].kind : CITY_FILL[i + ',' + j] || 'two';
    const lots = [];
    if (kind === 'one') lots.push({ x0: I.x0 + 120, y0: I.y0 + 110, x1: I.x1 - 120, y1: I.y1 - 110, ent: 'S' });
    else if (kind === 'two') { const ym = (I.y0 + I.y1) / 2; lots.push({ x0: I.x0 + 110, y0: I.y0 + 60, x1: I.x1 - 110, y1: ym - 45, ent: 'N' }); lots.push({ x0: I.x0 + 110, y0: ym + 45, x1: I.x1 - 110, y1: I.y1 - 60, ent: 'S' }); }
    else if (kind === 'four') { const xm = (I.x0 + I.x1) / 2, ym = (I.y0 + I.y1) / 2; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const x0 = a ? xm + 45 : I.x0 + 45, x1 = a ? I.x1 - 45 : xm - 45, y0 = b ? ym + 70 : I.y0 + 55, y1 = b ? I.y1 - 55 : ym - 70; lots.push({ x0, y0, x1, y1, ent: b ? 'S' : 'N' }); } }
    C.blocks = C.blocks || []; C.blocks.push({ i, j, R, I, kind });
    // platser på tomterna
    ps.forEach(p => {
      let lot = kind === 'one' ? lots[0] : (kind === 'two' || kind === 'four') ? lots[p.slot] : null;
      if (lot) { lot.place = p; lot.ent = p.ent; }
      C.places[p.id] = p; p.rect = lot || { x0: I.x0, y0: I.y0, x1: I.x1, y1: I.y1 };
    });
    for (const lot of lots) {
      const p = lot.place, filler = !p;
      if (j === 2 && lot.ent === 'S') lot.ent = 'N'; // mot ån finns ingen väg
      if (j === CRIVER && lot.ent === 'N') lot.ent = 'S';
      const b = { x0: lot.x0, y0: lot.y0, x1: lot.x1, y1: lot.y1, h: p ? p.h : 70 + Math.floor(rnd() * 5) * 18, col: p ? p.col : HOUSE_COLS[Math.floor(rnd() * HOUSE_COLS.length)], roof: ROOF_COLS[Math.floor(rnd() * ROOF_COLS.length)], ent: lot.ent, place: p || null, villa: kind === 'four', chimney: rnd() < 0.5, flat: kind === 'one' };
      if (kind === 'four' && !p) b.h = 70 + Math.floor(rnd() * 3) * 10;
      if (p && p.house) { b.roof = p.col; b.colorRoof = true; }
      C.buildings.push(b);
    }
    // träd längs trottoaren (inte framför ingångar)
    for (const side of ['N', 'S']) for (let k = 0; k < 4; k++) {
      const x = R.x0 + 90 + k * (R.x1 - R.x0 - 180) / 3, y = side === 'N' ? R.y0 + 26 : R.y1 - 26;
      if (kind === 'park' || kind === 'plaza' || kind === 'zoo') continue;
      if (C.buildings.some(b => b.place && Math.abs((b.x0 + b.x1) / 2 - x) < 170 && b.ent === side && Math.abs((side === 'N' ? b.y0 : b.y1) - y) < 400)) continue;
      if (rnd() < 0.55) C.trees.push({ x, y, r: 34 + rnd() * 12 }); else if (rnd() < 0.5) C.lamps.push({ x, y });
    }
  }
  // parker, torg, zoo
  const park = C.places.parken.rect; C.hill = { x: (park.x0 + park.x1) / 2, y: (park.y0 + park.y1) / 2, r: 150 };
  for (let k = 0; k < 14; k++) { const a = k / 14 * TAU + rnd() * 0.3, d = 270 + rnd() * 90; C.trees.push({ x: C.hill.x + Math.cos(a) * d, y: C.hill.y + Math.sin(a) * d, r: 38 + rnd() * 16, park: 1 }); }
  const pl = C.places.torget.rect; C.fountain = { x: (pl.x0 + pl.x1) / 2, y: (pl.y0 + pl.y1) / 2, r: 110 }; C.circles.push({ x: C.fountain.x, y: C.fountain.y, r: 110 });
  const zr = C.places.zoo.rect; C.zoo = zr; C.buildings.push({ x0: zr.x0 + 30, y0: zr.y0 + 30, x1: zr.x1 - 30, y1: zr.y1 - 150, h: 26, col: '#a5d6a7', roof: '#8bc34a', ent: 'S', place: C.places.zoo, fence: 1 });
  for (const t of C.trees) C.circles.push({ x: t.x, y: t.y, r: t.park ? 18 : 16 });
  for (const l of C.lamps) C.circles.push({ x: l.x, y: l.y, r: 8 });
  // vatten (ån) minus broar
  const ry0 = rc(CRIVER) - CRW / 2 - 20, ry1 = rc(CRIVER) + CRW / 2 + 20;
  let xs = CITY_EDGE.x0; const bx = CBRIDGES.map(i => [rc(i) - CRW / 2, rc(i) + CRW / 2]).sort((a, b) => a[0] - b[0]);
  for (const [a, b] of bx) { if (a > xs) C.water.push({ x0: xs, y0: ry0, x1: a, y1: ry1 }); xs = b; }
  C.water.push({ x0: xs, y0: ry0, x1: CITY_EDGE.x1, y1: ry1 });
  // leveransrutor framför ingångarna
  for (const b of C.buildings) if (b.place && !b.fence) cityBay(C, b.place, (b.x0 + b.x1) / 2, b.ent, b);
  for (const id of ['parken', 'torget', 'zoo']) { const p = C.places[id], r = p.rect; cityBay(C, p, (r.x0 + r.x1) / 2, 'S', null); }
  // parkerade bilar längs vägarna (dekor + hinder)
  const cars = DRIVERS.map((d, k) => k);
  for (let k = 0; k < 14; k++) {
    const vert = rnd() < 0.5, i = Math.floor(rnd() * (CN + 1)), j = Math.floor(rnd() * CN);
    if (vert) { const x = rc(i) + (rnd() < 0.5 ? -1 : 1) * (CRW / 2 - 34), y = rc(j) + CRW / 2 + 180 + rnd() * (CB - 360); if (j === CRIVER - 1 && !CBRIDGES.includes(i) && y > rc(CRIVER) - CRW) continue; C.parked.push({ x, y, a: Math.PI / 2, d: DRIVERS[cars[k % cars.length]] }); }
    else { const jj = [0, 1, 2, 4, 5][Math.floor(rnd() * 5)], x = rc(i % CN) + CRW / 2 + 180 + rnd() * (CB - 360), y = rc(jj) + (rnd() < 0.5 ? -1 : 1) * (CRW / 2 - 34); if (C.bays.some(b => Math.abs(b.x - x) < 200 && Math.abs(b.y - y) < 120)) continue; C.parked.push({ x, y, a: 0, d: DRIVERS[cars[k % cars.length]] }); }
  }
  for (const p of C.parked) C.circles.push({ x: p.x, y: p.y, r: 24, car: p });
  // fotgängare som går runt kvarteren
  const pedBlocks = C.blocks.filter(b => b.kind !== 'park' && b.kind !== 'zoo');
  for (let k = 0; k < 18; k++) { const bl = pedBlocks[Math.floor(rnd() * pedBlocks.length)]; C.peds.push({ bl, s: rnd(), dir: rnd() < 0.5 ? 1 : -1, sp: 45 + rnd() * 30, fig: randomFigSeeded(rnd), jump: 0, off: 0 }); }
  // graf över korsningar
  cityGraph(C);
  return C;
}
function randomFigSeeded(rnd) { const f = {}; for (const k of FIG_KEYS) f[k] = Math.floor(rnd() * FIG_OPT[k].names.length); if (f.skin > 3 && rnd() < 0.7) f.skin = Math.floor(rnd() * 4); if (rnd() < 0.7) f.beard = 0; if (f.hair === 7 || f.hair === 8) f.hair = 0; return f; }
function cityBay(C, p, x, ent, b) {
  const jr = p.blk[1] + (ent === 'S' ? 1 : 0), y = rc(jr) + (ent === 'S' ? -1 : 1) * (CRW / 2 - 55);
  const bay = { x, y, w: 170, h: 96, place: p, jr, i0: p.blk[0], ent, b };
  C.bays.push(bay); if (!p.bay) p.bay = bay;
}
// ---------- vägnät ----------
function cityNodeOk(i, j) { return i >= 0 && j >= 0 && i <= CN && j <= CN && (j !== CRIVER || CBRIDGES.includes(i)); }
function cityGraph(C) {
  const idx = (i, j) => j * (CN + 1) + i, M = (CN + 1) * (CN + 1), INF = 1e9;
  const D = Array.from({ length: M }, () => new Float64Array(M).fill(INF)), NX = Array.from({ length: M }, () => new Int16Array(M).fill(-1));
  const adj = Array.from({ length: M }, () => []);
  const edge = (a, b) => { D[a][b] = D[b][a] = CP; NX[a][b] = b; NX[b][a] = a; adj[a].push(b); adj[b].push(a); };
  for (let j = 0; j <= CN; j++) for (let i = 0; i <= CN; i++) {
    if (!cityNodeOk(i, j)) continue; D[idx(i, j)][idx(i, j)] = 0; NX[idx(i, j)][idx(i, j)] = idx(i, j);
    if (i < CN && j !== CRIVER && cityNodeOk(i + 1, j)) edge(idx(i, j), idx(i + 1, j));
    if (j < CN && cityNodeOk(i, j + 1)) edge(idx(i, j), idx(i, j + 1));
  }
  for (let k = 0; k < M; k++) for (let a = 0; a < M; a++) { if (D[a][k] >= INF) continue; for (let b = 0; b < M; b++) { const v = D[a][k] + D[k][b]; if (v < D[a][b]) { D[a][b] = v; NX[a][b] = NX[a][k]; } } }
  C.D = D; C.NX = NX; C.idx = idx; C.adj = adj;
}
// vilka korsningar når man från en punkt? [[nodIndex, avstånd], ...]
function cityEnds(C, x, y) {
  const i = Math.round(x / CP), j = Math.round(y / CP), out = [];
  const onV = Math.abs(x - rc(i)) <= CRW / 2 + 30 && i >= 0 && i <= CN, onH = Math.abs(y - rc(j)) <= CRW / 2 + 30 && j >= 0 && j <= CN && j !== CRIVER;
  if (onV) { const j0 = clamp(Math.floor(y / CP), 0, CN - 1); for (const jj of [j0, j0 + 1]) if (cityNodeOk(i, jj)) out.push([C.idx(i, jj), Math.abs(y - rc(jj))]); }
  if (onH) { const i0 = clamp(Math.floor(x / CP), 0, CN - 1); for (const ii of [i0, i0 + 1]) if (cityNodeOk(ii, j)) out.push([C.idx(ii, j), Math.abs(x - rc(ii))]); }
  if (!out.length) { let best = null; for (let jj = 0; jj <= CN; jj++) for (let ii = 0; ii <= CN; ii++) if (cityNodeOk(ii, jj)) { const d = Math.hypot(x - rc(ii), y - rc(jj)); if (!best || d < best[1]) best = [C.idx(ii, jj), d]; } out.push(best); }
  return out;
}
function cityNodeXY(C, n) { const N1 = CN + 1; return [rc(n % N1), rc(Math.floor(n / N1))]; }
// väg till en godtycklig punkt på vägnätet (t.ex. ett fordon)
function cityPathXY(C, x, y, tx, ty) {
  const e1 = cityEnds(C, x, y), e2 = cityEnds(C, tx, ty);
  const sameV = Math.abs(x - tx) < CRW && Math.round(x / CP) === Math.round(tx / CP) && Math.floor(y / CP) === Math.floor(ty / CP) && Math.abs(x - rc(Math.round(x / CP))) < CRW / 2 + 30 && Math.abs(tx - rc(Math.round(tx / CP))) < CRW / 2 + 30;
  const sameH = Math.abs(y - ty) < CRW && Math.round(y / CP) === Math.round(ty / CP) && Math.floor(x / CP) === Math.floor(tx / CP) && Math.abs(y - rc(Math.round(y / CP))) < CRW / 2 + 30 && Math.abs(ty - rc(Math.round(ty / CP))) < CRW / 2 + 30;
  if (sameV || sameH) return { pts: [[x, y], [tx, ty]], len: Math.hypot(tx - x, ty - y) };
  let best = null; for (const [a, da] of e1) for (const [b, db] of e2) { const v = da + C.D[a][b] + db; if (!best || v < best.v) best = { v, a, b }; }
  if (!best || best.v > 1e8) return { pts: [[x, y], [tx, ty]], len: Math.hypot(tx - x, ty - y) };
  const pts = [[x, y]]; let n = best.a; pts.push(cityNodeXY(C, n)); let g = 0; while (n !== best.b && g++ < 50) { n = C.NX[n][best.b]; if (n < 0) break; pts.push(cityNodeXY(C, n)); }
  pts.push([tx, ty]); return { pts, len: best.v };
}
function cityPath(C, x, y, bay) {
  // samma vägstump? kör direkt
  const tEnds = [[C.idx(bay.i0, bay.jr), Math.abs(bay.x - rc(bay.i0))], [C.idx(bay.i0 + 1, bay.jr), Math.abs(rc(bay.i0 + 1) - bay.x)]];
  if (Math.abs(y - rc(bay.jr)) < CRW / 2 + 30 && x > rc(bay.i0) - 20 && x < rc(bay.i0 + 1) + 20) return { pts: [[x, y], [bay.x, bay.y]], len: Math.abs(x - bay.x) };
  let best = null;
  for (const [a, da] of cityEnds(C, x, y)) for (const [b, db] of tEnds) { const v = da + C.D[a][b] + db; if (!best || v < best.v) best = { v, a, b }; }
  if (!best || best.v > 1e8) return { pts: [[x, y], [bay.x, bay.y]], len: Math.hypot(bay.x - x, bay.y - y) };
  const pts = [[x, y]]; let n = best.a; pts.push(cityNodeXY(C, n)); let guard = 0; while (n !== best.b && guard++ < 50) { n = C.NX[n][best.b]; if (n < 0) break; pts.push(cityNodeXY(C, n)); }
  pts.push([bay.x, bay.y]); return { pts, len: best.v };
}
// ---------- ytor & kollisioner ----------
function cityOnRoad(x, y) {
  const i = Math.round(x / CP), j = Math.round(y / CP);
  const inX = x > -CRW / 2 && x < rc(CN) + CRW / 2, inY = y > -CRW / 2 && y < rc(CN) + CRW / 2;
  if (i >= 0 && i <= CN && Math.abs(x - rc(i)) <= CRW / 2 && inY) { const inRiver = Math.abs(y - rc(CRIVER)) < CRW / 2; if (!inRiver || CBRIDGES.includes(i)) return true; }
  if (j >= 0 && j <= CN && j !== CRIVER && Math.abs(y - rc(j)) <= CRW / 2 && inX) return true;
  return false;
}
function citySurface(C, x, y) {
  if (cityOnRoad(x, y)) return 1;
  const p = C.places.parken.rect, pl = C.places.torget.rect;
  if (x > p.x0 - CSW && x < p.x1 + CSW && y > p.y0 - CSW && y < p.y1 + CSW) return 0.75;
  if (x > pl.x0 - CSW && x < pl.x1 + CSW && y > pl.y0 - CSW && y < pl.y1 + CSW) return 0.85;
  return 0.55; // trottoar/gräs
}
function cityCollide(C, c) {
  const r = CAR_R - 2; let hit = false;
  const pushRect = (b) => {
    const nx = clamp(c.x, b.x0, b.x1), ny = clamp(c.y, b.y0, b.y1); let dx = c.x - nx, dy = c.y - ny, d = Math.hypot(dx, dy);
    if (d >= r) return;
    if (d < 0.01) { // inne i rektangeln: tryck ut kortaste vägen
      const l = c.x - b.x0, rr2 = b.x1 - c.x, t = c.y - b.y0, bt = b.y1 - c.y, m = Math.min(l, rr2, t, bt);
      if (m === l) { dx = -1; dy = 0; } else if (m === rr2) { dx = 1; dy = 0; } else if (m === t) { dx = 0; dy = -1; } else { dx = 0; dy = 1; } d = 0; c.x = m === l ? b.x0 - r : m === rr2 ? b.x1 + r : c.x; c.y = m === t ? b.y0 - r : m === bt ? b.y1 + r : c.y;
    } else { c.x = nx + dx / d * r; c.y = ny + dy / d * r; dx /= d; dy /= d; }
    const vn = c.vx * dx + c.vy * dy; if (vn < 0) { c.vx -= dx * vn * 1.5; c.vy -= dy * vn * 1.5; if (-vn > 120) hit = true; }
  };
  for (const b of C.buildings) if (c.x > b.x0 - 60 && c.x < b.x1 + 60 && c.y > b.y0 - 60 && c.y < b.y1 + 60) pushRect(b);
  for (const w of C.water) if (c.y > w.y0 - 60 && c.y < w.y1 + 60 && c.x > w.x0 - 60 && c.x < w.x1 + 60) pushRect(w);
  for (const o of C.circles) { const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy), m = r + o.r; if (d < m && d > 0.01) { c.x = o.x + dx / d * m; c.y = o.y + dy / d * m; const nx = dx / d, ny = dy / d, vn = c.vx * nx + c.vy * ny; if (vn < 0) { c.vx -= nx * vn * 1.5; c.vy -= ny * vn * 1.5; if (-vn > 120) hit = true; } } }
  const E = CITY_EDGE; if (c.x < E.x0 + r) { c.x = E.x0 + r; c.vx = Math.abs(c.vx) * 0.5; hit = true; } if (c.x > E.x1 - r) { c.x = E.x1 - r; c.vx = -Math.abs(c.vx) * 0.5; hit = true; } if (c.y < E.y0 + r) { c.y = E.y0 + r; c.vy = Math.abs(c.vy) * 0.5; hit = true; } if (c.y > E.y1 - r) { c.y = E.y1 - r; c.vy = -Math.abs(c.vy) * 0.5; hit = true; }
  return hit;
}
function cityStepCar(C, c, dt, frozen) {
  const up = keys.ArrowUp || keys.KeyW, dn = keys.ArrowDown || keys.KeyS, lf = keys.ArrowLeft || keys.KeyA, rt = keys.ArrowRight || keys.KeyD;
  let thr = frozen ? 0 : up ? 1 : dn ? -1 : 0, steer = frozen ? 0 : (rt ? 1 : 0) - (lf ? 1 : 0);
  const ca = Math.cos(c.a), sa = Math.sin(c.a); let fs = c.vx * ca + c.vy * sa, ls = -c.vx * sa + c.vy * ca;
  const surf = citySurface(C, c.x, c.y); c.surf = surf;
  let cap = CITY_CAP * surf, grip = c.air > 0 ? 0.3 : 11;
  if (c.boost > 0) cap *= 1.4;
  if (c.air > 0) { thr = 0; steer *= 0.2; }
  if (thr > 0) fs += thr * ACC * 0.85 * dt * (fs < 0 ? 2 : 1);
  else if (thr < 0) { if (fs > 0) fs -= 1300 * dt; else fs = Math.max(-170, fs - 480 * dt); }
  else fs -= fs * (frozen ? 5 : 1.4) * dt;
  if (fs > cap) fs -= (fs - cap) * Math.min(1, 4 * dt);
  ls *= Math.exp(-grip * dt);
  c.vx = ca * fs - sa * ls; c.vy = sa * fs + ca * ls; c.fs = fs;
  c.a += steer * TURN * 1.05 * clamp(Math.abs(fs) / 110, 0, 1) * Math.sign(fs || 1) * dt;
  c.x += c.vx * dt; c.y += c.vy * dt;
  // kullen i parken = hopp
  c.jumpCool = Math.max(0, (c.jumpCool || 0) - dt);
  if (C.hill && c.air <= 0 && c.jumpCool <= 0 && fs > 200 && Math.hypot(c.x - C.hill.x, c.y - C.hill.y) < 45) { c.airMax = 0.5 + fs / 1300; c.air = c.airMax; c.jumpCool = 1.2; Snd.play('jump'); }
  if (!frozen) carTrail(c, dt);
  const wasAir = c.air > 0; c.hopCool = Math.max(0, (c.hopCool || 0) - dt); c.air = Math.max(0, c.air - dt); if (wasAir && c.air <= 0) { puff(c.x, c.y, 8); Snd.play('land'); }
  c.boost = Math.max(0, c.boost - dt); c.wallCool = Math.max(0, (c.wallCool || 0) - dt);
  if (c.air <= 0 && cityCollide(C, c) && c.wallCool <= 0) { c.wallCool = 0.4; Snd.play('bonk'); G.cam.shake = 5; addText(c.x, c.y, 'BONK!', '#fff'); }
  return thr;
}

// ---------- ritning ----------
function drawCityGround(C, ctx, view, t) {
  const E = CITY_EDGE;
  ctx.fillStyle = '#7cb342'; ctx.fillRect(E.x0 - 2000, E.y0 - 2000, E.x1 - E.x0 + 4000, E.y1 - E.y0 + 4000);
  // staket runt stan
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 14; ctx.setLineDash([40, 20]); ctx.strokeRect(E.x0, E.y0, E.x1 - E.x0, E.y1 - E.y0); ctx.setLineDash([]);
  const vis = r => r.x1 > view.x0 && r.x0 < view.x1 && r.y1 > view.y0 && r.y0 < view.y1;
  for (const bl of C.blocks) {
    const R = bl.R; if (!vis(R)) continue;
    ctx.fillStyle = '#cfd8dc'; ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); // trottoar
    ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 6; ctx.strokeRect(R.x0 + 3, R.y0 + 3, R.x1 - R.x0 - 6, R.y1 - R.y0 - 6); // kantsten
    const I = bl.I;
    if (bl.kind === 'park') { ctx.fillStyle = '#8bc34a'; ctx.fillRect(I.x0, I.y0, I.x1 - I.x0, I.y1 - I.y0); ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 50; ctx.beginPath(); ctx.arc(C.hill.x, C.hill.y, 260, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(C.hill.x, I.y1); ctx.lineTo(C.hill.x, C.hill.y + 260); ctx.stroke();
      for (let k = 4; k >= 1; k--) { ctx.fillStyle = shade('#7cb342', 1 + (4 - k) * 0.06); ctx.beginPath(); ctx.arc(C.hill.x, C.hill.y, C.hill.r * k / 4 + 20, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(C.hill.x, C.hill.y, 16, 0, TAU); ctx.fill(); }
    else if (bl.kind === 'plaza') { ctx.fillStyle = '#e0d6c8'; ctx.fillRect(I.x0, I.y0, I.x1 - I.x0, I.y1 - I.y0); ctx.strokeStyle = 'rgba(141,110,99,0.25)'; ctx.lineWidth = 3; for (let x = I.x0; x < I.x1; x += 60) { ctx.beginPath(); ctx.moveTo(x, I.y0); ctx.lineTo(x, I.y1); ctx.stroke(); } for (let y = I.y0; y < I.y1; y += 60) { ctx.beginPath(); ctx.moveTo(I.x0, y); ctx.lineTo(I.x1, y); ctx.stroke(); } }
    else if (bl.kind === 'zoo') { ctx.fillStyle = '#c5e1a5'; ctx.fillRect(I.x0, I.y0, I.x1 - I.x0, I.y1 - I.y0); }
    else { ctx.fillStyle = bl.kind === 'four' ? '#9ccc65' : bl.kind === 'one' ? '#aed581' : '#c5e1a5'; ctx.fillRect(I.x0, I.y0, I.x1 - I.x0, I.y1 - I.y0); }
  }
  // gångar fram till ingångarna
  for (const b of C.buildings) if (!b.fence && vis({ x0: b.x0 - 100, y0: b.y0 - 200, x1: b.x1 + 100, y1: b.y1 + 200 })) { const cx = (b.x0 + b.x1) / 2, yA = b.ent === 'N' ? b.y0 : b.y1, bl = cityBlockRect(Math.floor(cx / CP), Math.floor(((b.y0 + b.y1) / 2) / CP)), yB = b.ent === 'N' ? bl.y0 : bl.y1; ctx.fillStyle = '#d7ccc8'; ctx.fillRect(cx - 28, Math.min(yA, yB), 56, Math.abs(yB - yA)); }
  // vägar
  ctx.fillStyle = '#5f6368';
  for (let i = 0; i <= CN; i++) { const x = rc(i) - CRW / 2; ctx.fillRect(x, -CRW / 2, CRW, rc(CN) + CRW); }
  for (let j = 0; j <= CN; j++) { if (j === CRIVER) continue; ctx.fillRect(-CRW / 2, rc(j) - CRW / 2, rc(CN) + CRW, CRW); }
  // mittlinjer
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 6; ctx.setLineDash([46, 40]);
  for (let i = 0; i <= CN; i++) for (let j = 0; j < CN; j++) { if ((j === CRIVER - 1 || j === CRIVER) && !CBRIDGES.includes(i)) { } const y0 = rc(j) + CRW / 2, y1 = rc(j + 1) - CRW / 2; ctx.beginPath(); ctx.moveTo(rc(i), y0); ctx.lineTo(rc(i), y1); ctx.stroke(); }
  for (let j = 0; j <= CN; j++) { if (j === CRIVER) continue; for (let i = 0; i < CN; i++) { ctx.beginPath(); ctx.moveTo(rc(i) + CRW / 2, rc(j)); ctx.lineTo(rc(i + 1) - CRW / 2, rc(j)); ctx.stroke(); } }
  ctx.setLineDash([]);
  // övergångsställen vid korsningar
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let j = 0; j <= CN; j++) for (let i = 0; i <= CN; i++) { if (!cityNodeOk(i, j) || (i + j) % 2) continue; const x = rc(i), y = rc(j); if (!vis({ x0: x - 300, y0: y - 300, x1: x + 300, y1: y + 300 })) continue; for (let k = -3; k <= 3; k++) { ctx.fillRect(x + k * 34 - 10, y + CRW / 2 + 12, 20, 60); ctx.fillRect(x + k * 34 - 10, y - CRW / 2 - 72, 20, 60); } }
  // ån
  const ry0 = rc(CRIVER) - CRW / 2 - 20, ry1 = rc(CRIVER) + CRW / 2 + 20;
  ctx.fillStyle = '#4fa3d9'; ctx.fillRect(E.x0, ry0, E.x1 - E.x0, ry1 - ry0);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let x = Math.max(E.x0, view.x0 - 100); x < Math.min(E.x1, view.x1 + 100); x += 40) { const y = ry0 + 50 + k * 60 + Math.sin(x * 0.01 + t * 2 + k) * 10; x === Math.max(E.x0, view.x0 - 100) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.fillStyle = '#795548'; ctx.fillRect(E.x0, ry0 - 12, E.x1 - E.x0, 12); ctx.fillRect(E.x0, ry1, E.x1 - E.x0, 12); // kajkant
  for (const i of CBRIDGES) { const x = rc(i) - CRW / 2; ctx.fillStyle = '#6d6f73'; ctx.fillRect(x, ry0 - 12, CRW, ry1 - ry0 + 24); ctx.fillStyle = '#a1887f'; ctx.fillRect(x - 16, ry0 - 20, 16, ry1 - ry0 + 40); ctx.fillRect(x + CRW, ry0 - 20, 16, ry1 - ry0 + 40); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.setLineDash([46, 40]); ctx.beginPath(); ctx.moveTo(rc(i), ry0); ctx.lineTo(rc(i), ry1); ctx.stroke(); ctx.setLineDash([]); }
  // båtar i ån
  for (let k = 0; k < 3; k++) { const x = ((t * 40 + k * 2100) % (E.x1 - E.x0)) + E.x0, y = rc(CRIVER) + (k - 1) * 70; if (CBRIDGES.some(i => Math.abs(x - rc(i)) < CRW)) continue; ctx.save(); ctx.translate(x, y); ctx.fillStyle = ['#fff', '#ffcc80', '#ef9a9a'][k]; ctx.beginPath(); ctx.ellipse(0, 0, 60, 22, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#8d6e63'; ctx.fillRect(-15, -8, 30, 16); ctx.restore(); }
  // zoo: djur
  if (C.zoo && vis(C.zoo)) { const z = C.zoo; ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 8; ctx.strokeRect(z.x0 + 20, z.y0 + 20, z.x1 - z.x0 - 40, z.y1 - z.y0 - 140); }
}
function drawBay(ctx, bay, t, active) {
  ctx.save(); ctx.translate(bay.x, bay.y);
  const a = active ? 0.55 + Math.sin(t * 6) * 0.3 : 0.9;
  ctx.fillStyle = active ? `rgba(118,255,3,${a * 0.5})` : 'rgba(33,150,243,0.25)'; ctx.fillRect(-bay.w / 2, -bay.h / 2, bay.w, bay.h);
  ctx.strokeStyle = active ? '#76ff03' : '#fff'; ctx.lineWidth = active ? 8 : 5; ctx.strokeRect(-bay.w / 2, -bay.h / 2, bay.w, bay.h);
  ctx.restore();
}
function drawTree(ctx, tr, t) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(tr.x + 10, tr.y + 12, tr.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#43a047'; ctx.beginPath(); ctx.arc(tr.x - tr.r * 0.25, tr.y - tr.r * 0.25, tr.r * 0.62, 0, TAU); ctx.fill(); }
// Upphöjda hus: taket förskjuts bort från kamerans mittpunkt, så väggarna syns oavsett hur kameran vrider sig.
function drawBuilding(ctx, b, cam, t, rot, player) {
  const H0 = 1500, k = H0 / (H0 - b.h);
  const base = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
  const roof = base.map(([x, y]) => [cam[0] + (x - cam[0]) * k, cam[1] + (y - cam[1]) * k]);
  const norms = [[0, -1], [1, 0], [0, 1], [-1, 0]], sides = ['N', 'E', 'S', 'W'];
  const wall = shade(b.col, 0.78), wall2 = shade(b.col, 0.66);
  for (let e = 0; e < 4; e++) {
    const a = base[e], bb = base[(e + 1) % 4], ra = roof[e], rb = roof[(e + 1) % 4];
    const mx = (a[0] + bb[0]) / 2, my = (a[1] + bb[1]) / 2; if (norms[e][0] * (cam[0] - mx) + norms[e][1] * (cam[1] - my) <= 0) continue;
    ctx.fillStyle = e % 2 ? wall2 : wall; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bb[0], bb[1]); ctx.lineTo(rb[0], rb[1]); ctx.lineTo(ra[0], ra[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.stroke();
    if (b.fence) continue;
    // fönster: punkt på väggen = lerp(bas, tak)
    const P = (u, v) => [lerp(lerp(a[0], bb[0], u), lerp(ra[0], rb[0], u), v), lerp(lerp(a[1], bb[1], u), lerp(ra[1], rb[1], u), v)];
    const len = Math.hypot(bb[0] - a[0], bb[1] - a[1]), cols = Math.max(2, Math.floor(len / 110)), rows = Math.max(1, Math.floor(b.h / 55));
    for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
      const u0 = (cI + 0.3) / cols, u1 = (cI + 0.7) / cols, v0 = (r + 0.35) / rows, v1 = (r + 0.8) / rows;
      if (sides[e] === b.ent && r === 0 && Math.abs((u0 + u1) / 2 - 0.5) < 0.18) continue;
      const q = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]; ctx.fillStyle = (cI * 7 + r * 3 + (b.x0 | 0)) % 5 === 0 ? '#fff59d' : '#b3e5fc';
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let n = 1; n < 4; n++) ctx.lineTo(q[n][0], q[n][1]); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (sides[e] === b.ent) { // dörr
      const dh = Math.min(0.75, 70 / b.h), q = [P(0.44, 0), P(0.56, 0), P(0.56, dh), P(0.44, dh)];
      ctx.fillStyle = b.place ? '#5d4037' : '#795548'; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let n = 1; n < 4; n++) ctx.lineTo(q[n][0], q[n][1]); ctx.closePath(); ctx.fill();
      const kn = P(0.535, dh * 0.5); ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.arc(kn[0], kn[1], 5, 0, TAU); ctx.fill();
    }
  }
  // tak
  const rcx = (roof[0][0] + roof[2][0]) / 2, rcy = (roof[0][1] + roof[2][1]) / 2, rw = Math.abs(roof[1][0] - roof[0][0]), rh = Math.abs(roof[2][1] - roof[1][1]);
  const poly = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let n = 1; n < pts.length; n++) ctx.lineTo(pts[n][0], pts[n][1]); ctx.closePath(); ctx.fill(); };
  if (!b.fence) {
    if (b.flat || b.place && !b.villa && b.h >= 140) { // platt tak med kant och ventilationsboxar
      poly(roof, '#b0bec5'); const inset = (a, f) => [lerp(a[0], rcx, f), lerp(a[1], rcy, f)];
      poly(roof.map(q => inset(q, 0.08)), '#cfd8dc');
      ctx.fillStyle = '#90a4ae'; for (let q = 0; q < 3; q++) ctx.fillRect(rcx - rw * 0.35 + q * rw * 0.12, rcy + rh * 0.22, rw * 0.08, rh * 0.1);
    } else { // sadeltak: nock längs långsidan, nocken högre än takfoten
      const k2 = H0 / (H0 - b.h - Math.min(70, Math.min(b.x1 - b.x0, b.y1 - b.y0) * 0.25)), P2 = ([x, y]) => [cam[0] + (x - cam[0]) * k2, cam[1] + (y - cam[1]) * k2];
      const along = (b.x1 - b.x0) >= (b.y1 - b.y0), my = (b.y0 + b.y1) / 2, mx = (b.x0 + b.x1) / 2;
      const r1 = along ? P2([b.x0, my]) : P2([mx, b.y0]), r2 = along ? P2([b.x1, my]) : P2([mx, b.y1]);
      if (along) { poly([roof[0], roof[1], r2, r1], shade(b.roof, 1.12)); poly([r1, r2, roof[2], roof[3]], shade(b.roof, 0.86)); }
      else { poly([roof[0], r1, r2, roof[3]], shade(b.roof, 1.12)); poly([r1, roof[1], roof[2], r2], shade(b.roof, 0.86)); }
      ctx.strokeStyle = b.colorRoof ? '#fff' : 'rgba(0,0,0,0.35)'; ctx.lineWidth = b.colorRoof ? 7 : 4; ctx.beginPath(); ctx.moveTo(r1[0], r1[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let q = 1; q < 6; q++) { const f = q / 6; const a1 = along ? [lerp(roof[0][0], roof[1][0], f), lerp(roof[0][1], roof[1][1], f)] : [lerp(roof[0][0], roof[3][0], f), lerp(roof[0][1], roof[3][1], f)], a2 = along ? [lerp(r1[0], r2[0], f), lerp(r1[1], r2[1], f)] : [lerp(r1[0], r2[0], f), lerp(r1[1], r2[1], f)], a3 = along ? [lerp(roof[3][0], roof[2][0], f), lerp(roof[3][1], roof[2][1], f)] : [lerp(roof[1][0], roof[2][0], f), lerp(roof[1][1], roof[2][1], f)]; ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(a3[0], a3[1]); ctx.stroke(); }
      if (b.chimney && !b.place) { const c0 = P2([mx + (b.x1 - b.x0) * 0.2, my - (b.y1 - b.y0) * 0.12]); ctx.fillStyle = '#6d4c41'; ctx.fillRect(c0[0] - 14, c0[1] - 14, 28, 28); }
    }
    ctx.strokeStyle = b.colorRoof ? '#fff' : 'rgba(0,0,0,0.3)'; ctx.lineWidth = b.colorRoof ? 10 : 4; ctx.beginPath(); ctx.moveTo(roof[0][0], roof[0][1]); for (let n = 1; n < 4; n++) ctx.lineTo(roof[n][0], roof[n][1]); ctx.closePath(); ctx.stroke();
    if (b.colorRoof) { ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3; ctx.stroke(); }
  }
  // skylt på taket – alltid rättvänd på skärmen
  if (b.place) {
    const p = b.place; const word = p.garage ? cityGarageName() : p.word;
    ctx.save(); ctx.translate(rcx, rcy); ctx.rotate(-rot);
    const fs = Math.min(64, (Math.min(rw, rh) * 1.3) / Math.max(4, word.length) * 1.3, rw * 0.9 / (word.length * 0.62 + 1.6));
    ctx.font = `bold ${fs | 0}px "Arial Rounded MT Bold", Arial`; const tw = ctx.measureText(word).width + fs * 1.6;
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; rr(ctx, -tw / 2 - 12, -fs * 0.8, tw + 24, fs * 1.6, 14); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 5; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a1033';
    if (p.house) { ctx.fillStyle = p.col; ctx.beginPath(); ctx.moveTo(-tw / 2 + fs * 0.1, 0); ctx.lineTo(-tw / 2 + fs * 0.6, -fs * 0.5); ctx.lineTo(-tw / 2 + fs * 1.1, 0); ctx.lineTo(-tw / 2 + fs * 1.1, fs * 0.45); ctx.lineTo(-tw / 2 + fs * 0.1, fs * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else ctx.fillText(p.ico, -tw / 2 + fs * 0.05, 2);
    ctx.fillStyle = '#1a1033'; ctx.fillText(word, -tw / 2 + fs * 1.35, 2);
    ctx.restore();
  }
}
function cityGarageName() { const n = G.playerName; if (!n) return 'GARAGET'; return n + (/[SXZ]$/.test(n) ? '' : 'S') + ' GARAGE'; }
function drawPed(ctx, C, pd, t, rot) {
  const R = 11; ctx.save(); ctx.translate(pd.x, pd.y); ctx.rotate(-rot);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 6, 0, 0, TAU); ctx.fill();
  ctx.translate(0, -R * 3.4 - (pd.jump > 0 ? Math.sin(pd.jump / 0.6 * Math.PI) * 30 : 0)); if (pd.dir < 0) ctx.scale(-1, 1);
  drawRig(ctx, pd.fig, R, t + pd.s * 10, pd.jump > 0 ? 'cheer' : 'walk', { legs: true }); ctx.restore();
}
function cityPedPos(pd) {
  const R = pd.bl.R, w = R.x1 - R.x0 - 56, h = R.y1 - R.y0 - 56, L = 2 * (w + h); let s = ((pd.s % 1) + 1) % 1 * L;
  const x0 = R.x0 + 28, y0 = R.y0 + 28;
  if (s < w) return [x0 + s, y0]; s -= w; if (s < h) return [x0 + w, y0 + s]; s -= h; if (s < w) return [x0 + w - s, y0 + h]; s -= w; return [x0, y0 + h - s];
}
