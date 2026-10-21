// ===================== BANBYGGAREN =====================
// Man "kör fram" vägen ruta för ruta med piltangenterna (eller drar med fingret). Backar man suddas vägen.
// När bilen är tillbaka vid flaggan är slingan klar. ENTER innan dess: bilen hittar själv hem.
// Sedan stämplar man ut saker (hopp, turbo, lådor, hinder, halka, bus) och skriver ett namn på banan.
var BUILDER = null;
var BT_SLIP = { rum: ['🧃', 'SAFT', 'Saft'], strand: ['⏳', 'SAND', 'Sand'], sno: ['🧊', 'IS', 'Is'], vulkan: ['🔥', 'LAVA', 'Lava'], rymd: ['🟢', 'SLEM', 'Slem'], stad: ['💧', 'PÖL', 'Pöl'] };
var BT_OBST = { rum: ['KLOSS', 'Kloss'], strand: ['SLOTT', 'Slott'], sno: ['GUBBE', 'Snögubbe'], vulkan: ['STEN', 'Sten'], rymd: ['STEN', 'Sten'], stad: ['KON', 'Kon'] };
var BT_BUS = { rum: ['ROBOT', 'Robot'], strand: ['KRABBA', 'Krabba'], sno: ['FÅGEL', 'Pingvin'], vulkan: ['DINO', 'Dino'], rymd: ['UFO', 'Ufo'], stad: ['ANKA', 'Anka'] };
var BT_NAMES = { rum: ['SOFF-RALLY', 'LEGO-LOPPET', 'TOFFEL-TURBO'], strand: ['SAND-RACET', 'KRABB-KURVAN', 'GLASS-GASET'], sno: ['IS-BANAN', 'SNÖ-SLINGAN', 'VANT-RACET'], vulkan: ['LAVA-LOPPET', 'DINO-DUNDER', 'HET-BANAN'], rymd: ['MÅN-BANAN', 'UFO-RACET', 'STJÄRN-SLINGAN'], stad: ['STADS-SLINGAN', 'ANK-RACET', 'KORV-KURVAN'] };
var BT_FUN = ['SNURR-BANAN', 'TURBO-TOK', 'BUS-BANAN', 'ZICK-ZACK', 'SUPER-SLINGAN', 'KORV-BANAN', 'PRUTT-RACET', 'VILD-VÄGEN'];

// ---------- menyer ----------
function openBuilderMenu() { buildBuilderMenu(); showScreen('build'); }
function buildBuilderMenu() {
  const g = $('#build-grid'); g.innerHTML = ''; const list = myTracks();
  const nb = mkBtn('card hub go', '<div class="bigico">➕</div><div class="lbl">NY BANA</div>', 'Ny bana', () => {
    if (myTracks().length >= BT.MAX) { Snd.play('buzz'); Voice.say(`Du har ${BT.MAX} banor. Sudda en bana först.`, true); return; }
    buildThemeScreen(); showScreen('btheme');
  });
  nb.dataset.default = '1'; g.appendChild(nb);
  list.forEach((ct, i) => {
    const def = customDef(ct);
    const b = mkBtn('card wide own', `<canvas width="320" height="220"></canvas><div class="lbl"><span class="ico">${def.icon}</span> ${esc(def.name)}</div>`, def.say, () => openBt(i));
    g.appendChild(b); setTimeout(() => { try { drawTrackPreview(b.querySelector('canvas'), def); } catch (e) { } }, 40 + i * 60);
  });
  $('#build-hint').textContent = list.length ? '' : 'BYGG DIN FÖRSTA BANA!';
}
function buildThemeScreen() {
  const g = $('#btheme-grid'); g.innerHTML = '';
  TRACK_DEFS.forEach((t, i) => { const b = mkBtn('card hub', `<div class="bigico">${t.icon}</div><div class="lbl">${t.name}</div>`, t.say, () => startBuilder({ theme: t.id })); if (!i) b.dataset.default = '1'; g.appendChild(b); });
}
let BT_SEL = 0, BT_DELARM = 0;
function openBt(i) {
  const ct = myTracks()[i]; if (!ct) return; BT_SEL = i; BT_DELARM = 0;
  const def = customDef(ct); $('#bt-name').textContent = def.icon + ' ' + def.name; $('#bt-del').textContent = '🗑️ SUDDA';
  $('#bt-info').textContent = `${ct.cells.length} RUTOR · ${def.laps} VARV`;
  $('#scr-bt').dataset.say = `${def.say}. Vill du köra eller ändra?`;
  showScreen('bt'); setTimeout(() => { try { drawTrackPreview($('#bt-cv'), def); } catch (e) { } }, 30);
}
function btDelete() {
  const ct = myTracks()[BT_SEL]; if (!ct) return;
  if (performance.now() - BT_DELARM > 4000) { BT_DELARM = performance.now(); $('#bt-del').textContent = '❓ SÄKER? TRYCK IGEN'; Voice.say('Är du säker? Tryck igen för att sudda banan.', true); return; }
  myTracks().splice(BT_SEL, 1); saveProf(); logEv('bana', 'suddad', ct.name); Snd.play('back'); Voice.say('Banan är suddad.', true);
  screenStack.length = 0; screenStack.push('title', 'hub'); curScreen = null; buildBuilderMenu(); showScreen('build', false);
}

// ---------- bygg-läget ----------
function startBuilder(o) {
  const editing = o.edit != null ? myTracks()[o.edit] : null;
  const theme = editing ? editing.theme : o.theme, base = TRACK_DEFS.find(t => t.id === theme) || TRACK_DEFS[0];
  hideUI(); Voice.stop(); Snd.engine(false, 0); CUP.active = false;
  G.T = null; G.cars = []; G.player = null; G.parts = []; G.balls = []; G.blobs = []; G.banner = null; G.paused = false; G.demo = false; G.school = null;
  const me = playerRacer();
  const B = BUILDER = {
    theme: base.id, base, kit: BT_KIT[base.id], editIdx: editing ? o.edit : -1, id: editing ? editing.id : null, name: editing ? editing.name : '',
    cells: editing ? editing.cells.map(c => c.slice()) : [[3, 5]], closed: !!editing, stamps: editing ? Object.assign({}, editing.stamps) : {},
    phase: 'road', t: 0, car: styledCar(me.car, me.paint, me.sticker), dir: [1, 0], ca: 0, cx: 0, cy: 0, cur: 0, sel: 0,
    msg: null, auto: null, autoT: 0, toStamp: 0, escAt: -9, conf: [], T: null, pos: {}, pat: null, drag: null,
  };
  const h = B.cells[B.cells.length - 1], C = BT.CELL; B.cx = (h[0] + 0.5) * C; B.cy = (h[1] + 0.5) * C;
  G.mode = 'build'; Snd.music(base.music); logEv('bana', editing ? 'ändrar ' + editing.name : 'ny bana ' + base.id);
  if (editing) { bToStamp(true); setTimeout(() => Voice.say('Ändra din bana! Välj VÄG om du vill bygga om vägen.', true), 200); }
  else setTimeout(() => Voice.say('Kör ut vägen med pilarna! Backa för att sudda. Kör tillbaka till flaggan när du är klar.', true), 200);
}
function bPalette() {
  const B = BUILDER, th = B.theme, k = B.kit, sl = BT_SLIP[th], ob = BT_OBST[th], bu = BT_BUS[th];
  return [
    { k: 'ramp', ico: '🦘', lbl: 'HOPP', say: 'Hopp' }, { k: 'boost', ico: '⚡', lbl: 'TURBO', say: 'Turbo' }, { k: 'box', ico: '❓', lbl: 'LÅDA', say: 'Låda' },
    { k: 'obst', ico: k.obstIco, lbl: ob[0], say: ob[1] }, { k: 'slip', ico: sl[0], lbl: sl[1], say: sl[2] }, { k: 'bus', ico: k.busIco, lbl: bu[0], say: bu[1] },
    { k: 'erase', ico: '🧽', lbl: 'SUDDA', say: 'Sudda' }, { k: 'road', ico: '🛣️', lbl: 'VÄG', say: 'Bygg om vägen' }, { k: 'done', ico: '✔️', lbl: 'KLAR', say: 'Klar' },
  ];
}
function bMsg(text, say, bad) { const B = BUILDER; B.msg = { text, t: 0, bad: !!bad }; if (say) Voice.say(say, true); }
function bBump(text, say) { Snd.play('bonk'); bMsg(text, say, true); }
function bHead() { const c = BUILDER.cells; return c[c.length - 1]; }
function bHas(x, y) { return BUILDER.cells.some(c => c[0] === x && c[1] === y); }
function bStep(dx, dy) {
  const B = BUILDER; if (!B || B.phase !== 'road' || B.auto) return;
  const cells = B.cells, start = cells[0], head = bHead();
  if (B.closed) {
    if (start[0] + dx === head[0] && start[1] + dy === head[1]) { B.closed = false; B.dir = [dx, dy]; Snd.play('back'); bMsg('VÄGEN ÄR ÖPPEN'); }
    else bBump('TRYCK ENTER!', 'Vägen är klar. Tryck enter!');
    return;
  }
  const nx = head[0] + dx, ny = head[1] + dy, prev = cells[cells.length - 2];
  if (prev && prev[0] === nx && prev[1] === ny) { cells.pop(); delete B.stamps[cellKey(head)]; B.dir = [-dx, -dy]; Snd.play('back'); return; }
  if (nx < 0 || ny < 0 || nx >= BT.GW || ny >= BT.GH) { bBump('STOPP! KANTEN!'); return; }
  if (nx === start[0] && ny === start[1]) {
    if (cells.length >= BT.MIN) { B.closed = true; B.dir = [dx, dy]; bClosed(); }
    else bBump('FÖR KORT!', 'Banan är för kort. Kör lite till!');
    return;
  }
  if (bHas(nx, ny)) { bBump('HÄR ÄR EN VÄG!', 'Där finns redan en väg.'); return; }
  cells.push([nx, ny]); B.dir = [dx, dy]; Snd.play('tick');
  if (cells.length % 10 === 0) bMsg(cells.length + ' RUTOR!', String(cells.length));
}
// bilen hittar själv hem till flaggan (kortaste vägen genom tomma rutor)
function bAutoClose() {
  const B = BUILDER, cells = B.cells, start = cells[0], head = bHead();
  if (cells.length < 2) { bBump('KÖR FÖRST!', 'Kör ut vägen med pilarna först!'); return; }
  const key = (x, y) => x + ',' + y, seen = { [key(head[0], head[1])]: null }, q = [head]; let found = null;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length && !found) {
    const [x, y] = q.shift();
    for (const [dx, dy] of D) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= BT.GW || ny >= BT.GH) continue;
      if (nx === start[0] && ny === start[1]) { if (!(x === cells[1][0] && y === cells[1][1])) { found = [x, y]; break; } continue; }
      const k = key(nx, ny); if (k in seen || bHas(nx, ny)) continue; seen[k] = [x, y]; q.push([nx, ny]);
    }
  }
  if (!found) { bBump('INGEN VÄG HEM!', 'Jag hittar ingen väg hem. Backa lite!'); return; }
  const path = []; for (let p = found; p && !(p[0] === head[0] && p[1] === head[1]); p = seen[key(p[0], p[1])]) path.unshift(p);
  if (cells.length + path.length < BT.MIN) { bBump('FÖR KORT!', 'Banan blir för kort. Kör lite till!'); return; }
  B.auto = path.concat([start]); B.autoT = 0; Voice.say('Bilen kör hem själv!', true);
}
function bClosed() {
  const B = BUILDER; Snd.play('fanfare');
  for (let k = 0; k < 60; k++) B.conf.push({ x: Math.random(), y: -0.05 - Math.random() * 0.3, vy: 0.25 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.1, c: ['#ffd600', '#ff4081', '#40c4ff', '#76ff03', '#ff9100'][k % 5], r: Math.random() * 6, life: 3 });
  bMsg('VÄGEN ÄR KLAR!', `Vägen är klar! Den är ${B.cells.length} rutor lång.`); B.toStamp = 1.6;
}
function bToStamp(quiet) {
  const B = BUILDER; B.phase = 'stamp'; B.toStamp = 0; B.pos = {};
  B.def = customDef({ id: 'bygg', name: B.name || 'MIN BANA', theme: B.theme, cells: B.cells, stamps: {}, at: 'tmp' + Date.now(), tmp: true });
  B.T = buildTrack(B.def); B.T.decor = B.T.decor.filter((o, k) => k % 4 === 0); B.cur = 0; const c = B.cells[0]; B.cx = (c[0] + 0.5) * BT.CELL; B.cy = (c[1] + 0.5) * BT.CELL;
  if (!quiet) setTimeout(() => Voice.say('Sätt ut saker på banan! Mellanslag byter sak. Enter sätter ut.', true), 1200);
}
function bStampMove(dx, dy) {
  const B = BUILDER, c = B.cells[B.cur], k = B.cells.findIndex(e => e[0] === c[0] + dx && e[1] === c[1] + dy);
  if (k < 0) { Snd.play('bonk'); return; } B.cur = k; B.dir = [dx, dy]; Snd.play('tick');
}
function bSelect(i) { const B = BUILDER, P = bPalette(); B.sel = (i + P.length) % P.length; Snd.play('move'); Voice.say(P[B.sel].say, true); }
function bUse() {
  const B = BUILDER, it = bPalette()[B.sel];
  if (it.k === 'road') { B.phase = 'road'; B.T = null; const h = bHead(); B.cx = (h[0] + 0.5) * BT.CELL; B.cy = (h[1] + 0.5) * BT.CELL; Snd.play('click'); Voice.say('Bygg om vägen! Backa från flaggan för att öppna slingan.', true); return; }
  if (it.k === 'done') { bName(); return; }
  const key = cellKey(B.cells[B.cur]);
  if (it.k === 'erase') { if (B.stamps[key]) { delete B.stamps[key]; Snd.play('pop'); } else Snd.play('bonk'); return; }
  if (BT_NOSTART[it.k] && bStartCells().includes(key)) { bBump('INTE VID START!', 'Inte vid starten. Där står bilarna!'); return; }
  B.stamps[key] = it.k; Snd.play(it.k === 'boost' ? 'boost' : it.k === 'ramp' ? 'jump' : 'drop');
  const C = BT.CELL, c = B.cells[B.cur]; for (let n = 0; n < 12; n++) { const a = Math.random() * TAU; G.parts.push({ x: (c[0] + 0.5) * C, y: (c[1] + 0.5) * C, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, life: 0.5, max: 0.5, size: 40, color: ['#ffd600', '#fff', '#40c4ff'][n % 3], type: 'dot' }); }
}
// rutorna närmast startlinjen (samma som customDef räknar med)
function bStartCells() { const B = BUILDER, n = B.cells.length, m = btStartSeg(B.cells); return [cellKey(B.cells[m]), cellKey(B.cells[(m + 1) % n])]; }
function bName() {
  const B = BUILDER; B.phase = 'name'; Snd.play('click');
  const inp = $('#bname-in'); inp.value = B.name || '';
  showScreen('bname', false); setTimeout(() => inp.focus(), 60);
}
function bNameTip() { const B = BUILDER; if (!B) return; const pool = BT_NAMES[B.theme].concat(BT_FUN); const v = pool[Math.floor(Math.random() * pool.length)]; $('#bname-in').value = v; Snd.play('boing'); Voice.say(v.toLowerCase().replace(/-/g, ' '), true); }
function bNameBack() { const B = BUILDER; if (!B) { back(); return; } hideUI(); B.phase = 'stamp'; }
function bSave() {
  const B = BUILDER; if (!B) return;
  let name = $('#bname-in').value.trim().toUpperCase().replace(/\s+/g, ' ').slice(0, 14);
  if (!name) { Snd.play('buzz'); Voice.say('Skriv ett namn. Eller tryck på tips!', true); $('#bname-in').focus(); return; }
  const keys = new Set(B.cells.map(cellKey)), stamps = {}; for (const [k, v] of Object.entries(B.stamps)) if (keys.has(k)) stamps[k] = v;
  const ct = { id: B.id || 'my_' + Date.now().toString(36), name, theme: B.theme, cells: B.cells.map(c => c.slice()), stamps, by: G.playerName || '', at: Date.now() };
  const list = myTracks(); let idx = B.editIdx;
  if (idx >= 0 && list[idx] && list[idx].id === ct.id) list[idx] = ct; else { list.push(ct); idx = list.length - 1; }
  saveProf(); logEv('bana', 'sparad', { namn: name, rutor: ct.cells.length, saker: Object.keys(stamps).length });
  $('#bname-in').blur(); BUILDER = null; G.mode = 'none'; Snd.play('fanfare'); Voice.say(`Banan ${name.toLowerCase()} är klar!`, true);
  startDemo(); Snd.music('menu'); screenStack.length = 0; screenStack.push('title', 'hub', 'build'); curScreen = null; buildBuilderMenu(); openBt(idx);
}
function builderExit() {
  BUILDER = null; G.mode = 'none'; Voice.stop(); logEv('bana', 'avbröt bygget');
  startDemo(); Snd.music('menu'); screenStack.length = 0; screenStack.push('title', 'hub'); curScreen = null; buildBuilderMenu(); showScreen('build', false);
}
function builderEsc() {
  const B = BUILDER;
  if (B.phase === 'stamp') { B.sel = bPalette().findIndex(p => p.k === 'road'); bUse(); return; }
  if (B.cells.length > 1 && B.t - B.escAt > 2.5) { B.escAt = B.t; bMsg('ESC IGEN = SLUTA', 'Tryck escape igen för att sluta. Banan sparas inte.'); return; }
  builderExit();
}
function buildKey(e) {
  const B = BUILDER; if (!B) return;
  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (e.code === 'Escape') { if (!e.repeat) builderEsc(); return; }
  if (B.phase === 'road') {
    if (dirs[e.code]) { bStep(...dirs[e.code]); return; }
    if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) { e.preventDefault(); if (B.closed) bToStamp(); else if (!B.auto) bAutoClose(); }
    return;
  }
  if (B.phase === 'stamp') {
    if (dirs[e.code]) { bStampMove(...dirs[e.code]); return; }
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'Tab') { e.preventDefault(); bSelect(B.sel + (e.shiftKey ? -1 : 1)); return; }
    if (e.code === 'Enter') { e.preventDefault(); bUse(); return; }
    const d = /^(Digit|Numpad)([1-9])$/.exec(e.code); if (d) { bSelect(+d[2] - 1); }
  }
}
function builderUpdate(dt) {
  const B = BUILDER; if (!B) return; B.t += dt; G.time += dt;
  if (B.msg) { B.msg.t += dt; if (B.msg.t > 1.8) B.msg = null; }
  if (B.auto) { B.autoT += dt; if (B.autoT > 0.13) { B.autoT = 0; const c = B.auto.shift(), h = bHead(); B.dir = [c[0] - h[0], c[1] - h[1]]; if (B.auto.length) { B.cells.push(c); Snd.play('tick'); } else { B.auto = null; B.closed = true; bClosed(); } } }
  if (B.toStamp > 0) { B.toStamp -= dt; if (B.toStamp <= 0 && B.phase === 'road') bToStamp(); }
  const C = BT.CELL; let tc;
  if (B.phase === 'road') tc = B.closed ? B.cells[0] : bHead(); else tc = B.cells[B.cur];
  const tx = (tc[0] + 0.5) * C, ty = (tc[1] + 0.5) * C, f = Math.min(1, dt * 16); B.cx += (tx - B.cx) * f; B.cy += (ty - B.cy) * f;
  B.ca += angDiff(Math.atan2(B.dir[1], B.dir[0]), B.ca) * Math.min(1, dt * 14);
  for (const p of B.conf) { p.y += p.vy * dt; p.x += p.vx * dt; p.life -= dt; } B.conf = B.conf.filter(p => p.life > 0);
  updateParts(dt);
}

// ---------- ritning ----------
function bLayout() {
  const u = Math.min(H / 1000, W / 1500), top = 110 * u, bot = (BUILDER.phase === 'road' ? 100 : 215) * u, pad = 30 * u;
  const cs = Math.min((W - 2 * pad) / BT.GW, (H - top - bot - pad) / BT.GH);
  const gw = cs * BT.GW, gh = cs * BT.GH, ox = (W - gw) / 2, oy = top + (H - top - bot - gh) / 2;
  return { u, top, bot, cs, gw, gh, ox, oy, s: cs / BT.CELL };
}
function drawBuilder() {
  const B = BUILDER; if (!B) return; const L = bLayout(), u = L.u, C = BT.CELL, t = B.t, th = B.base.theme;
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col = '#fff', align = 'center') => { ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 7 * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#1a1033'; ctx.fillRect(0, 0, W, H);
  // rutnätet i världskoordinater
  ctx.save(); ctx.beginPath(); rr(ctx, L.ox, L.oy, L.gw, L.gh, 18 * u); ctx.clip();
  ctx.setTransform(L.s, 0, 0, L.s, L.ox, L.oy);
  const view = { x0: -C, y0: -C, x1: (BT.GW + 1) * C, y1: (BT.GH + 1) * C };
  if (B.phase !== 'road' && B.T) drawTrackBase(ctx, B.T, view, t);
  else { if (!B.pat) B.pat = makeGroundPattern(ctx, { theme: th }); ctx.fillStyle = B.pat; ctx.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0); }
  ctx.beginPath(); for (let x = 0; x <= BT.GW; x++) { ctx.moveTo(x * C, 0); ctx.lineTo(x * C, BT.GH * C); } for (let y = 0; y <= BT.GH; y++) { ctx.moveTo(0, y * C); ctx.lineTo(BT.GW * C, y * C); }
  ctx.strokeStyle = 'rgba(20,20,60,0.22)'; ctx.lineWidth = 3 / L.s; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2 / L.s; ctx.stroke();
  const cen = c => [(c[0] + 0.5) * C, (c[1] + 0.5) * C];
  if (B.phase === 'road') {
    // vägen som den körts fram
    const pts = B.cells.map(cen); if (B.closed) pts.push(pts[0]);
    const path = new Path2D(); pts.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1])); if (pts.length === 1) path.lineTo(pts[0][0] + 0.1, pts[0][1]);
    const hw = BT.HW; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = hw * 2 + th.bw * 2 + 16; ctx.save(); ctx.translate(8, 12); ctx.stroke(path); ctx.restore();
    ctx.strokeStyle = th.b1; ctx.lineWidth = hw * 2 + th.bw * 2; ctx.stroke(path);
    ctx.setLineDash([46, 46]); ctx.strokeStyle = th.b2; ctx.stroke(path); ctx.setLineDash([]);
    ctx.strokeStyle = th.road; ctx.lineWidth = hw * 2; ctx.stroke(path);
    if (th.center) { ctx.setLineDash([36, 44]); ctx.strokeStyle = th.center; ctx.lineWidth = 8; ctx.stroke(path); ctx.setLineDash([]); }
    // startflagga
    const [sx, sy] = cen(B.cells[0]); ctx.save(); ctx.translate(sx, sy); const sq = 40; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { ctx.fillStyle = (k + r) % 2 ? '#111' : '#fff'; ctx.fillRect(-2 * sq + k * sq, -2 * sq + r * sq, sq, sq); } ctx.restore();
    const canClose = !B.closed && B.cells.length >= BT.MIN && Math.abs(bHead()[0] - B.cells[0][0]) + Math.abs(bHead()[1] - B.cells[0][1]) === 1;
    if (canClose) { ctx.strokeStyle = `rgba(255,214,0,${0.5 + Math.sin(t * 8) * 0.5})`; ctx.lineWidth = 30; ctx.strokeRect(sx - C * 0.42, sy - C * 0.42, C * 0.84, C * 0.84); }
    // sluten slinga: en blinkande pil visar hur man backar för att öppna den igen
    if (B.closed && !B.auto && B.cells.length > 1) {
      const h = bHead(), [ax, ay] = cen(h), dx = h[0] - B.cells[0][0], dy = h[1] - B.cells[0][1];
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha = 0.25 + (Math.sin(t * 5) + 1) * 0.2; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(-60, -95); ctx.lineTo(-60, 95); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // pilar där man kan köra
    if (!B.closed && !B.auto) {
      const h = bHead(), prev = B.cells[B.cells.length - 2];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = h[0] + dx, ny = h[1] + dy; if (nx < 0 || ny < 0 || nx >= BT.GW || ny >= BT.GH || bHas(nx, ny) || (prev && prev[0] === nx && prev[1] === ny)) continue;
        const [ax, ay] = cen([nx, ny]); ctx.save(); ctx.translate(ax - dx * C * 0.12 * (1 - (t * 2 % 1)), ay - dy * C * 0.12 * (1 - (t * 2 % 1))); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(130, 0); ctx.lineTo(-70, -110); ctx.lineTo(-70, 110); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
  } else {
    // sakerna på banan, lite förstorade så de syns
    const T = B.T, sk = bStartCells();
    for (const [key, what] of Object.entries(B.stamps)) {
      if (!B.pos[key]) { const [x, y] = key.split(',').map(Number); B.pos[key] = { i: nearestGlobal(T.cl, (x + 0.5) * C, (y + 0.5) * C), side: (x + y) % 2 ? 1 : -1 }; }
      const P = B.pos[key], tt = P.i / T.N, at = (off) => T.at(tt, off), K = B.kit, Z = 3;
      const q0 = at(0); ctx.save(); ctx.translate(q0.x, q0.y); ctx.scale(Z, Z); ctx.translate(-q0.x, -q0.y);
      if (what === 'ramp') drawRamp(ctx, Object.assign({ kind: K.ramp }, at(0)), T.hw / Z, t);
      else if (what === 'boost') drawPad(ctx, at(0), t);
      else if (what === 'box') for (const f of [-0.25, 0.25]) { const q = at(f * T.hw / Z * 1.4); drawItemBox(ctx, q.x, q.y, t, f * 3); }
      else if (what === 'obst') for (const [kind, off, r] of K.obst) { const q = at((P.side * 30 + off) / Z * 1.0); drawObstacle(ctx, { kind, x: q.x, y: q.y, r, a: q.a }, t); }
      else if (what === 'slip') { const q = at(0); drawHazard(ctx, { kind: K.slip[0], x: q.x, y: q.y, r: K.slip[1] * 0.8, a: q.a, seed: 1 }, t); }
      else if (what === 'bus') { const q = at(Math.sin(t * 2 + P.i) * 40); drawMover(ctx, { kind: K.bus[0], x: q.x, y: q.y, r: K.bus[2], a: q.a + Math.PI / 2, ph: P.i, rot: t }, t); }
      ctx.restore();
      // märke med samma bild som knappen, så man ser vad som står där
      const it = bPalette().find(p => p.k === what), [bx, by] = cen(key.split(',').map(Number));
      ctx.save(); ctx.translate(bx + C * 0.3, by - C * 0.3); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, C * 0.16, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 14; ctx.stroke();
      ctx.font = `${C * 0.2 | 0}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it ? it.ico : '?', 0, 8); ctx.restore();
    }
    // markering av rutan där bilen står
    const [mx, my] = cen(B.cells[B.cur]); ctx.strokeStyle = `rgba(255,214,0,${0.65 + Math.sin(t * 7) * 0.35})`; ctx.lineWidth = 26; rr(ctx, mx - C * 0.46, my - C * 0.46, C * 0.92, C * 0.92, 90); ctx.stroke();
    if (sk.includes(cellKey(B.cells[B.cur]))) { ctx.globalAlpha = 0.9; ctx.font = 'bold 150px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🏁', mx, my - C * 0.32); ctx.globalAlpha = 1; }
  }
  // partiklar (stänk när man stämplar)
  for (const p of G.parts) { const f = Math.max(0, p.life / p.max); ctx.globalAlpha = f; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * f, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  // bilen
  ctx.save(); ctx.translate(B.cx, B.cy); ctx.rotate(B.ca); const bob = B.phase === 'road' ? Math.sin(t * 18) * 6 : 0; ctx.translate(0, bob); ctx.scale(7.5, 7.5); drawCar(ctx, B.car, t); ctx.restore();
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // rubrik
  const head = B.phase !== 'road' ? 'SÄTT UT SAKER!' : B.closed ? 'VÄGEN ÄR KLAR!' : 'KÖR UT VÄGEN!';
  txt(head, W / 2, 52 * u, 54, '#ffd600');
  txt(`🛣️ ${B.cells.length}`, W - 40 * u, 52 * u, 40, '#fff', 'right');
  // knappar för pekskärm
  B.btns = [];
  const btn = (id, x, y, w, h, label, col) => { ctx.fillStyle = col || 'rgba(255,255,255,0.14)'; rr(ctx, x, y, w, h, 16 * u); ctx.fill(); txt(label, x + w / 2, y + h / 2 + 2 * u, 28); B.btns.push({ id, x, y, w, h }); };
  btn('esc', 24 * u, 22 * u, 120 * u, 62 * u, '◀');
  if (B.phase === 'road') {
    btn('enter', W - 260 * u, H - 80 * u, 236 * u, 62 * u, B.closed ? '▶ VIDARE' : '✔ KLAR', '#43a047');
    const hint = B.closed ? 'ENTER = VIDARE · BACKA = ÖPPNA' : B.cells.length < 2 ? 'KÖR MED PILARNA ⬅️⬆️➡️⬇️' : 'BACKA = SUDDA · ENTER = KLAR';
    txt(hint, W / 2 - 120 * u, H - 48 * u, 30, '#fff');
  } else if (B.phase === 'stamp' || B.phase === 'name') {
    const P = bPalette(), n = P.length, bw = Math.min(150 * u, (W - 60 * u) / n - 10 * u), bh = 120 * u, x0 = (W - n * (bw + 10 * u) + 10 * u) / 2, y0 = H - bh - 36 * u;
    P.forEach((it, i) => {
      const x = x0 + i * (bw + 10 * u), on = i === B.sel, lift = on ? -10 * u : 0;
      ctx.fillStyle = on ? '#ffd600' : it.k === 'done' ? '#43a047' : it.k === 'road' || it.k === 'erase' ? '#455a64' : '#3949ab'; rr(ctx, x, y0 + lift, bw, bh, 18 * u); ctx.fill();
      if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5 * u; ctx.stroke(); }
      ctx.font = font(50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it.ico, x + bw / 2, y0 + lift + 46 * u);
      ctx.font = font(it.lbl.length > 5 ? 22 : 26); ctx.fillStyle = on ? '#1a1033' : '#fff'; ctx.fillText(it.lbl, x + bw / 2, y0 + lift + 98 * u);
      ctx.font = font(18); ctx.fillStyle = on ? '#1a1033' : 'rgba(255,255,255,0.6)'; ctx.textAlign = 'left'; ctx.fillText(String(i + 1), x + 8 * u, y0 + lift + 16 * u);
      B.btns.push({ id: 'pal' + i, x, y: y0 + lift, w: bw, h: bh });
    });
    txt('MELLANSLAG = BYT · ENTER = SÄTT', W / 2, y0 - 30 * u, 24, 'rgba(255,255,255,0.85)');
  }
  // meddelande
  if (B.msg) { const a = Math.min(1, (1.8 - B.msg.t) * 3), sc = 1 + Math.max(0, 0.25 - B.msg.t) * 1.5; ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, L.oy + L.gh * 0.42); ctx.scale(sc, sc); ctx.font = font(64); const w = ctx.measureText(B.msg.text).width + 80 * u; ctx.fillStyle = B.msg.bad ? '#e53935' : '#43a047'; rr(ctx, -w / 2, -56 * u, w, 112 * u, 30 * u); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6 * u; ctx.stroke(); txt(B.msg.text, 0, 4 * u, 64); ctx.restore(); }
  for (const p of B.conf) { ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x * W, p.y * H); ctx.rotate(p.r + B.t * 5); ctx.fillRect(-7 * u, -4 * u, 14 * u, 8 * u); ctx.restore(); }
}

// ---------- pekskärm / mus ----------
function bPointer(e, kind) {
  const B = BUILDER; if (!B || G.mode !== 'build' || curScreen) return;
  const px = e.clientX * DPR, py = e.clientY * DPR;
  if (kind === 'down') {
    for (const b of B.btns || []) if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
      Snd.init();
      if (b.id === 'esc') builderEsc(); else if (b.id === 'enter') { if (B.closed) bToStamp(); else if (!B.auto) bAutoClose(); }
      else if (b.id.startsWith('pal')) { const i = +b.id.slice(3); if (B.sel === i || ['road', 'done'].includes(bPalette()[i].k)) { B.sel = i; bUse(); } else bSelect(i); }
      return;
    }
  }
  const L = bLayout(), gx = Math.floor((px - L.ox) / L.cs), gy = Math.floor((py - L.oy) / L.cs);
  if (gx < 0 || gy < 0 || gx >= BT.GW || gy >= BT.GH) { if (kind === 'up') B.drag = null; return; }
  if (kind === 'up') { B.drag = null; return; }
  if (B.phase === 'road') {
    if (kind === 'down') B.drag = true; if (!B.drag) return;
    const h = B.closed ? B.cells[0] : bHead(), dx = gx - h[0], dy = gy - h[1];
    if (Math.abs(dx) + Math.abs(dy) === 1) bStep(dx, dy);
  } else if (B.phase === 'stamp' && kind === 'down') {
    const k = B.cells.findIndex(c => c[0] === gx && c[1] === gy); if (k < 0) return;
    B.cur = k; const it = bPalette()[B.sel]; if (it.k !== 'road' && it.k !== 'done') bUse(); else Snd.play('tick');
  }
}
canvas.addEventListener('pointerdown', e => bPointer(e, 'down'));
canvas.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') bPointer(e, 'move'); });
window.addEventListener('pointerup', e => bPointer(e, 'up'));
function initBuilder() {
  $('#bt-go').addEventListener('click', () => { const ct = myTracks()[BT_SEL]; if (!ct) return; SEL.mode = 'race'; SEL.fixedTrack = ct.id; goDrivers(); });
  $('#bt-edit').addEventListener('click', () => startBuilder({ edit: BT_SEL }));
  $('#bt-del').addEventListener('click', btDelete);
  $('#bname-ok').addEventListener('click', bSave);
  $('#bname-tip').addEventListener('click', bNameTip);
  // skrivträning: rösten säger bokstaven man just skrev
  $('#bname-in').addEventListener('input', e => { const v = e.target.value; if (e.inputType === 'insertText' && v) { const ch = v.slice(-1); if (/[A-ZÅÄÖa-zåäö]/.test(ch)) Voice.say(ch.toLowerCase(), true); } });
}
