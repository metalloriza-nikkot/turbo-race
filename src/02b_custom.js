// ===================== EGNA BANOR (data) =====================
// En egen bana sparas i profilen som rutor på ett rutnät: PROF.mytracks[spelare] = [{ id, name, theme, cells: [[x,y]...], stamps: { 'x,y': sak }, at }]
// Rutorna bildar en sluten slinga (sista rutan ligger bredvid den första). customDef() gör om den till samma format som TRACK_DEFS.
// OBS: init() i 06_ui.js körs innan filerna efter 06 har körts – därför ligger datan här (före 06) och använder var.
var BT = { CELL: 800, GW: 12, GH: 8, MAX: 8, MIN: 8, HW: 150 };
// sakerna man kan stämpla ut, per miljö
var BT_KIT = {
  rum: { ramp: 'book', obst: [['block', 0, 22]], slip: ['saft', 72], bus: ['vacuum', 0.6, 40], obstIco: '🧱', busIco: '🤖' },
  strand: { ramp: 'wave', obst: [['castle', 0, 26]], slip: ['sand', 75], bus: ['crab', 1.0, 26], obstIco: '🏰', busIco: '🦀' },
  sno: { ramp: 'kicker', obst: [['snowman', 0, 26]], slip: ['ice', 85], bus: ['penguin', 1.1, 22], obstIco: '⛄', busIco: '🐧' },
  vulkan: { ramp: 'rock', obst: [['rock', 0, 28]], slip: ['lava', 50], bus: ['dino', 0.5, 46], obstIco: '🪨', busIco: '🦖' },
  rymd: { ramp: 'neon', obst: [['asteroid', 0, 28]], slip: ['slime', 75], bus: ['ufo', 1.0, 36], obstIco: '☄️', busIco: '🛸' },
  stad: { ramp: 'plank', obst: [['cone', -15, 18], ['cone', 15, 18]], slip: ['puddle', 75], bus: ['duck', 0.55, 30], obstIco: '🚧', busIco: '🦆' },
};
// saker som inte får stå precis vid starten (bilarna står där)
var BT_NOSTART = { ramp: 1, obst: 1, slip: 1, bus: 1 };
var BT_GP_TAGS = ['Banan är så ny att färgen är blöt.', 'Byggd med piltangenterna. Och mycket kärlek.', 'Ingen har kört här förut. Inte ens Göran.', 'Arkitekten sitter i publiken. Vinka!', 'Ritningen var på en servett. Den åts upp.'];

function myTracks(who) { if (!PROF.mytracks) PROF.mytracks = {}; const k = who || pkey(); if (!PROF.mytracks[k]) PROF.mytracks[k] = []; return PROF.mytracks[k]; }
function cellKey(c) { return c[0] + ',' + c[1]; }
// startlinjen läggs mitt på den längsta raksträckan
function btStartSeg(cells) {
  const n = cells.length, dir = k => { const a = cells[k], b = cells[(k + 1) % n]; return (b[0] - a[0]) * 3 + (b[1] - a[1]); };
  let best = 0, bestS = 0;
  for (let s = 0; s < n; s++) {
    if (dir(s) === dir((s - 1 + n) % n)) continue;
    let L = 1; while (L < n && dir((s + L) % n) === dir(s)) L++;
    if (L > best) { best = L; bestS = s; }
  }
  return (bestS + Math.min(best - 1, Math.floor(best * 0.6))) % n;
}
const _BTDEF = {};
function customDef(ct) {
  const ck = ct.id + ':' + (ct.at || 0); if (_BTDEF[ck]) return _BTDEF[ck];
  const base = TRACK_DEFS.find(t => t.id === ct.theme) || TRACK_DEFS[0], kit = BT_KIT[base.id] || BT_KIT.rum, C = BT.CELL;
  const n = ct.cells.length, m = btStartSeg(ct.cells);
  const cells = ct.cells.map((_, i) => ct.cells[(m + i) % n]);
  const cen = c => [c[0] * C + C / 2, c[1] * C + C / 2];
  // punkterna ligger mitt på kanten mellan två rutor – då blir kurvorna mjuka
  // raka rutor får även en punkt i mitten (jämnare avstånd mellan punkterna = inga gupp i kurvorna)
  const pts = [];
  cells.forEach((c, i) => {
    const a = cen(c), nx = cells[(i + 1) % n], b = cen(nx), nn = cells[(i + 2) % n];
    pts.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    if (nn[0] - nx[0] === nx[0] - c[0] && nn[1] - nx[1] === nx[1] - c[1]) pts.push(b);
  });
  const cl = buildCenterline(pts, 10), N = cl.N;
  const def = {
    id: ct.id, rev: ct.at || 0, own: true, name: ct.name || 'MIN BANA', say: (ct.name || 'min bana').toLowerCase(), icon: base.icon, hw: BT.HW, music: base.music, sc: 1, exact: true,
    pts, theme: base.theme, hazards: [], obstacles: [], movers: [], ramps: [], boosts: [], items: [], decor: base.decor, special: base.special.slice(), base: base.id,
  };
  const startCells = { [cellKey(cells[0])]: 1, [cellKey(cells[1])]: 1 };
  for (const [key, what] of Object.entries(ct.stamps || {})) {
    if (startCells[key] && BT_NOSTART[what]) continue;
    const [x, y] = key.split(',').map(Number); if (!ct.cells.some(c => c[0] === x && c[1] === y)) continue;
    const [cx, cy] = cen([x, y]), t = nearestGlobal(cl, cx, cy) / N, side = (x + y) % 2 ? 1 : -1;
    if (what === 'ramp') def.ramps.push([t, kit.ramp]);
    else if (what === 'boost') def.boosts.push([t, 0]);
    else if (what === 'box') def.items.push(t);
    else if (what === 'obst') for (const [kind, off, r] of kit.obst) def.obstacles.push([kind, t, side * 60 + off, r]);
    else if (what === 'slip') def.hazards.push([kit.slip[0], t, 0, kit.slip[1]]);
    else if (what === 'bus') def.movers.push([kit.bus[0], t, 110, kit.bus[1], kit.bus[2]]);
  }
  // varvlängd: ett lopp ska ta ungefär lika lång tid som på de vanliga banorna
  const len = N * cl.step; def.laps = Math.max(1, Math.min(5, Math.round(50000 / len))); // egna banor har tvärare kurvor än de vanliga, därför lite kortare
  const who = ct.by ? ct.by.charAt(0) + ct.by.slice(1).toLowerCase() : '';
  const g = (typeof GP !== 'undefined' && GP[base.id]) || {};
  def.gp = Object.assign({}, g, { title: `GRAND PRIX: ${def.name}`, tag: who ? `En helt ny bana, byggd av ${who}.` : 'En helt ny bana.', tags: BT_GP_TAGS });
  if (!ct.tmp) _BTDEF[ck] = def;
  return def;
}
function myTrackDefs(who) { return myTracks(who).map(customDef); }
function allTracks() { return TRACK_DEFS.concat(myTrackDefs()); }
function trackById(id) { return id === FINAL_DEF.id ? FINAL_DEF : allTracks().find(t => t.id === id) || null; }
