// ===================== TURBOSTADEN: trafik (ljus, gående, bilar) =====================
// Trafiknivå byggs upp stegvis: 0 = tom stad, 1 = trafikljus, 2 = + gående på övergångsställen, 3 = + andra bilar.
const LIGHT_NODES = [[1, 1], [3, 1], [2, 2], [4, 2], [1, 4], [3, 4], [2, 5], [4, 5]];
const TCOLS = { 'RÖD': '#e53935', 'BLÅ': '#1e88e5', 'GUL': '#fdd835', 'GRÖN': '#43a047', 'VIT': '#fafafa', 'LILA': '#8e24aa' };
const TKINDS = { BIL: { len: 70, w: 34, ico: '🚗' }, BUSS: { len: 150, w: 44, ico: '🚌' }, LASTBIL: { len: 130, w: 44, ico: '🚚' } };
const LANE = 62;
function cityTrafficLevel() { const cd = cityData(); const s = cd.pizza.filter(x => x).length + (cd.amb || []).filter(x => x).length + (cd.pol || []).filter(x => x).length; return s < 2 ? 0 : s < 3 ? 1 : s < 5 ? 2 : 3; }
function cityTrafficInit(S) {
  const C = S.C; S.tl = cityTrafficLevel(); S.veh = []; S.cross = []; S.crossT = 2;
  S.lights = S.tl >= 1 ? LIGHT_NODES.filter(([i, j]) => cityNodeOk(i, j)).map(([i, j], k) => ({ i, j, n: C.idx(i, j), x: rc(i), y: rc(j), off: k * 3.1, stopDone: -1 })) : [];
  if (S.tl >= 3) for (let k = 0; k < 9; k++) cityAddVehicle(S, { kind: k % 4 === 0 ? 'BUSS' : k % 5 === 1 ? 'LASTBIL' : 'BIL', col: Object.keys(TCOLS)[k % 6] });
  const cd = cityData(); cd.tlSeen = cd.tlSeen || 0;
  if (S.tl > cd.tlSeen) { cd.tlSeen = S.tl; saveProf(); const msg = ['', 'NYTT: TRAFIKLJUS!', 'NYTT: GÅENDE!', 'NYTT: TRAFIK!'][S.tl], say = ['', 'Nu finns det trafikljus i staden. Stanna vid rött ljus!', 'Nu går det folk över övergångsställena. Stanna och låt dem gå!', 'Nu kör det andra bilar i staden. Kör försiktigt!'][S.tl]; setTimeout(() => { banner(msg, '#76ff03', 2.4); Voice.say(say, true); }, 2600); }
}
function lightState(L, ax, t) { const c = (t + L.off) % 14; if (ax === 'v') return c < 5.5 ? 'g' : c < 7 ? 'y' : 'r'; return c < 7 ? 'r' : c < 12.5 ? 'g' : c < 14 ? 'y' : 'r'; }
function cityLightAt(S, n) { return S.lights.find(L => L.n === n); }
function cityAddVehicle(S, o) {
  const C = S.C, M = (CN + 1) * (CN + 1);
  let from, to, guard = 0;
  do { from = Math.floor(Math.random() * M); } while ((!C.adj[from] || !C.adj[from].length || (o.near && Math.hypot(cityNodeXY(C, from)[0] - o.near[0], cityNodeXY(C, from)[1] - o.near[1]) > (o.nearR || 900)) || (o.far && Math.hypot(cityNodeXY(C, from)[0] - o.far[0], cityNodeXY(C, from)[1] - o.far[1]) < 900)) && guard++ < 400);
  to = C.adj[from][Math.floor(Math.random() * C.adj[from].length)];
  const K = TKINDS[o.kind] || TKINDS.BIL;
  const v = { from, to, s: CRW / 2 + 40 + Math.random() * (CP - CRW - 200), v: 0, max: o.max || 200 + Math.random() * 40, kind: o.kind, col: o.col, len: K.len, w: K.w, honk: 0, suspect: o.suspect, target: o.target, flee: o.flee };
  cityVehPos(C, v, true); S.veh.push(v); return v;
}
function cityVehDir(C, v) { const [ax, ay] = cityNodeXY(C, v.from), [bx, by] = cityNodeXY(C, v.to); const L = Math.hypot(bx - ax, by - ay) || 1; return { ax, ay, dx: (bx - ax) / L, dy: (by - ay) / L, L, axis: Math.abs(bx - ax) > Math.abs(by - ay) ? 'h' : 'v' }; }
function cityVehPos(C, v, snap) { const d = cityVehDir(C, v); v.lx = d.ax + d.dx * v.s - d.dy * LANE; v.ly = d.ay + d.dy * v.s + d.dx * LANE; v.la = Math.atan2(d.dy, d.dx); if (snap) { v.x = v.lx; v.y = v.ly; v.a = v.la; } return d; }
function cityTrafficUpdate(S, dt) {
  const C = S.C, car = S.car, t = S.t;
  // gående på övergångsställen
  if (S.tl >= 2) {
    S.crossT -= dt;
    if (S.crossT <= 0 && S.cross.length < 4) {
      S.crossT = 3 + Math.random() * 3;
      const cands = []; for (let j = 0; j <= CN; j++) for (let i = 0; i <= CN; i++) if (cityNodeOk(i, j) && (i + j) % 2 === 0) for (const sd of [-1, 1]) { const y = rc(j) + sd * (CRW / 2 + 42); if (j === CRIVER && !CBRIDGES.includes(i)) continue; if (y < -CRW / 2 || y > rc(CN) + CRW / 2) continue; if (Math.abs(y - rc(CRIVER)) < CRW / 2 + 30) continue; const d = Math.hypot(rc(i) - car.x, y - car.y); if (d > 350 && d < 1500) cands.push([i, y]); }
      if (cands.length) { const [i, y] = cands[Math.floor(Math.random() * cands.length)], dir = Math.random() < 0.5 ? 1 : -1; S.cross.push({ rx: rc(i), x: rc(i) - dir * 175, y, dir, fig: randomFigSeeded(mulberry(Math.floor(Math.random() * 1e6))), jump: 0, done: false, heroed: false }); }
    }
    for (const p of S.cross) {
      p.jump = Math.max(0, p.jump - dt); const stop = S.veh.length === 0 ? false : false; if (!stop) p.x += p.dir * 58 * dt;
      p.onRoad = Math.abs(p.x - p.rx) < CRW / 2 + 6;
      if (Math.abs(p.x - p.rx) > 190) p.done = true;
      const d = Math.hypot(car.x - p.x, car.y - p.y);
      if (p.onRoad && d < 70 && Math.abs(car.fs) > 70 && p.jump <= 0) { p.jump = 0.7; Snd.play('boing'); if (S.m) S.m.scare = (S.m.scare || 0) + 1; addText(p.x, p.y - 40, 'OJ! AKTA!', '#fff'); }
      // stannade spelaren för den gående?
      if (p.onRoad && !p.heroed && Math.abs(car.fs) < 15 && Math.abs(car.x - p.rx) < CRW / 2 + 20 && Math.abs(car.y - p.y) < 260 && Math.abs(car.y - p.y) > 50) { p.heroed = true; Snd.play('ding'); addText(car.x, car.y - 40, 'BRA! DU LÄT HEN GÅ', '#76ff03'); if (S.m) S.m.hero = (S.m.hero || 0) + 1; if (!S.saidCross) { S.saidCross = 1; Voice.say('Bra! Du stannade för den som går.', true); } }
    }
    S.cross = S.cross.filter(p => !p.done);
  }
  // trafikljus: stannade spelaren vid rött? körde spelaren mot rött?
  for (const L of S.lights) {
    const inBox = Math.abs(car.x - L.x) < CRW / 2 && Math.abs(car.y - L.y) < CRW / 2;
    if (inBox && !L.inBox) { const ax = Math.abs(car.vx) > Math.abs(car.vy) ? 'h' : 'v', st = lightState(L, ax, t); if (st === 'r' && Math.hypot(car.vx, car.vy) > 70) { addText(car.x, car.y - 40, 'RÖTT LJUS!', '#ff5252'); Snd.play('knock'); if (S.m) S.m.red = (S.m.red || 0) + 1; if (!S.saidRed) { S.saidRed = 1; Voice.say('Oj, det var rött. Nästa gång stannar vi vid linjen!', true); } } }
    L.inBox = inBox;
    // närmar sig ljuset och står still vid rött
    const dx = car.x - L.x, dy = car.y - L.y, ax = Math.abs(dx) < CRW / 2 ? 'v' : Math.abs(dy) < CRW / 2 ? 'h' : null;
    if (ax && Math.abs(car.fs) < 15) { const dist = ax === 'v' ? Math.abs(dy) : Math.abs(dx); if (dist > CRW / 2 && dist < CRW / 2 + 260 && lightState(L, ax, t) === 'r' && L.stopDone !== Math.floor((t + L.off) / 14)) { L.stopDone = Math.floor((t + L.off) / 14); Snd.play('ding'); addText(car.x, car.y - 40, 'BRA! DU STANNADE', '#76ff03'); if (S.m) S.m.hero = (S.m.hero || 0) + 1; if (!S.saidStop) { S.saidStop = 1; Voice.say('Bra! Du stannade vid rött ljus.', true); } } }
  }
  // fordon
  for (const v of S.veh) {
    let d = cityVehDir(C, v); let target = v.max;
    const stopAt = (sStop) => { const gap = sStop - v.s; if (gap < 0) return; target = Math.min(target, Math.max(0, gap * 1.6 - 10)); };
    // trafikljus i slutet av sträckan
    const L = cityLightAt(S, v.to); if (L) { const st = lightState(L, d.axis, t); const line = d.L - CRW / 2 - 30; if (st !== 'g' && !(st === 'y' && line - v.s < 30) && v.s < line + 5) stopAt(line); }
    // gående på övergångsställe (bara lodräta vägar)
    if (d.axis === 'v') for (const p of S.cross) { if (!p.onRoad || Math.abs(p.rx - d.ax) > 5) continue; const sP = (p.y - d.ay) * d.dy; if (sP > v.s) stopAt(sP - v.len / 2 - 45); }
    // fordon framför
    for (const w of S.veh) if (w !== v && w.from === v.from && w.to === v.to && w.s > v.s) stopAt(w.s - (w.len + v.len) / 2 - 30);
    // spelaren framför
    { const rx = car.x - (d.ax - d.dy * LANE), ry = car.y - (d.ay + d.dx * LANE), along = rx * d.dx + ry * d.dy, lat = -rx * d.dy + ry * d.dx; if (along > v.s && along - v.s < v.len / 2 + 110 && Math.abs(lat) < 60) { stopAt(along - v.len / 2 - 40); v.honk -= dt; if (v.honk <= 0 && Math.hypot(car.x - v.x, car.y - v.y) < 500) { v.honk = 4; Snd.horn('tut'); } } }
    if (v.caught) target = 0;
    v.v += (target - v.v) * Math.min(1, dt * (target < v.v ? 5 : 1.5)); v.s += v.v * dt;
    if (v.s >= d.L) {
      const opts = C.adj[v.to].filter(n => n !== v.from), all = opts.length ? opts : C.adj[v.to];
      let nx = all[Math.floor(Math.random() * all.length)];
      if (v.flee) { let best = -1; for (const n of all) { const [x, y] = cityNodeXY(C, n), dd = Math.hypot(x - car.x, y - car.y) + Math.random() * 300; if (dd > best) { best = dd; nx = n; } } }
      v.s -= d.L; v.from = v.to; v.to = nx; d = cityVehDir(C, v);
    }
    cityVehPos(C, v, false);
    v.x += (v.lx - v.x) * Math.min(1, dt * 6); v.y += (v.ly - v.y) * Math.min(1, dt * 6); v.a += angDiff(v.la, v.a) * Math.min(1, dt * 7);
    // krock med spelaren (fordonet är tungt – spelaren studsar). Hoppar man krockar man inte.
    if (car.air > 0) continue;
    const ca = Math.cos(v.a), sa = Math.sin(v.a), n = v.len > 100 ? 3 : 1;
    for (let k = 0; k < n; k++) {
      const off = n === 1 ? 0 : (k - 1) * (v.len / 3), cx = v.x + ca * off, cy = v.y + sa * off, r = v.w / 2 + 6, m = r + CAR_R - 2;
      const dx = car.x - cx, dy = car.y - cy, dd = Math.hypot(dx, dy);
      if (dd < m && dd > 0.01) { car.x = cx + dx / dd * m; car.y = cy + dy / dd * m; const nx2 = dx / dd, ny2 = dy / dd, vn = car.vx * nx2 + car.vy * ny2; if (vn < 0) { car.vx -= nx2 * vn * 1.6; car.vy -= ny2 * vn * 1.6; if (-vn > 90) cityVehicleBump(S, v); } else if (v.suspect) cityVehicleBump(S, v); }
    }
  }
}
function cityVehicleBump(S, v) {
  if ((v.bumpT || 0) > S.t) return; v.bumpT = S.t + 1.5;
  if (v.suspect && S.m && S.m.type === 'pol' && S.phase === 'drive') { if (v.target) return cityCatch(v); Snd.play('buzz'); const txt = `${v.col} ${v.kind}`; addText(v.x, v.y - 50, 'FEL: ' + txt, '#fff'); Voice.say(`Nej, det där är en ${v.col.toLowerCase()} ${v.kind.toLowerCase()}.`, true); return; }
  Snd.play('bonk'); Snd.horn('tut'); G.cam.shake = 6; if (S.m && S.m.type === 'amb') S.m.comfort = Math.max(0, S.m.comfort - 0.15);
}
// ---------- ritning ----------
function drawTrafficVehicle(ctx, v, t) {
  const col = TCOLS[v.col] || '#90a4ae', L = v.len, w = v.w;
  ctx.save(); ctx.translate(v.x + 4, v.y + 6); ctx.rotate(v.a); ctx.fillStyle = 'rgba(0,0,0,0.22)'; rr(ctx, -L / 2, -w / 2, L, w, 10); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.a);
  ctx.fillStyle = '#212121'; for (const x of [L / 2 - 18, -L / 2 + 18]) for (const y of [-w / 2 - 2, w / 2 - 4]) ctx.fillRect(x - 9, y, 18, 6);
  if (v.kind === 'BUSS') { ctx.fillStyle = col; rr(ctx, -L / 2, -w / 2, L, w, 10); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#b3e5fc'; for (let k = 0; k < 6; k++) { ctx.fillRect(-L / 2 + 12 + k * 21, -w / 2 + 2, 15, 6); ctx.fillRect(-L / 2 + 12 + k * 21, w / 2 - 8, 15, 6); } ctx.fillStyle = '#263238'; ctx.fillRect(L / 2 - 12, -w / 2 + 5, 8, w - 10); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-L / 2 + 10, -4, L - 30, 8); }
  else if (v.kind === 'LASTBIL') { ctx.fillStyle = shade(col, 1.0); rr(ctx, L / 2 - 36, -w / 2 + 2, 36, w - 4, 8); ctx.fill(); ctx.fillStyle = '#263238'; ctx.fillRect(L / 2 - 12, -w / 2 + 7, 7, w - 14); ctx.fillStyle = shade(col, 0.8); rr(ctx, -L / 2, -w / 2, L - 40, w, 5); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-L / 2 + 6, -3, L - 52, 6); }
  else { ctx.fillStyle = col; rr(ctx, -L / 2, -w / 2, L, w, 11); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#263238'; rr(ctx, 6, -w / 2 + 5, 11, w - 10, 3); ctx.fill(); rr(ctx, -24, -w / 2 + 6, 8, w - 12, 3); ctx.fill(); ctx.fillStyle = shade(col, 1.15); rr(ctx, -15, -w / 2 + 5, 20, w - 10, 4); ctx.fill(); }
  ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(L / 2 - 2, -w / 2 + 6, 3.5, 0, TAU); ctx.arc(L / 2 - 2, w / 2 - 6, 3.5, 0, TAU); ctx.fill();
  if (v.v < 20) { ctx.fillStyle = '#ff1744'; ctx.fillRect(-L / 2 - 2, -w / 2 + 3, 3, 7); ctx.fillRect(-L / 2 - 2, w / 2 - 10, 3, 7); }
  ctx.restore();
}
function drawTrafficLights(ctx, S, t, rot, inV) {
  for (const L of S.lights) {
    if (!inV(L.x, L.y, 400)) continue;
    // stopplinjer
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(L.x - CRW / 2, L.y - CRW / 2 - 16, CRW / 2, 10); ctx.fillRect(L.x, L.y + CRW / 2 + 6, CRW / 2, 10);
    ctx.fillRect(L.x + CRW / 2 + 6, L.y - CRW / 2, 10, CRW / 2); ctx.fillRect(L.x - CRW / 2 - 16, L.y, 10, CRW / 2);
    // stolpar i hörnen, lampan visar färgen för den som kommer mot korsningen från det hållet
    const posts = [[-1, -1, 'v'], [1, 1, 'v'], [1, -1, 'h'], [-1, 1, 'h']];
    for (const [sx, sy, ax] of posts) {
      const x = L.x + sx * (CRW / 2 + 24), y = L.y + sy * (CRW / 2 + 24), st = lightState(L, ax, t);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(x + 6, y + 8, 12, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(-rot);
      ctx.fillStyle = '#37474f'; ctx.fillRect(-4, -60, 8, 60);
      ctx.fillStyle = '#212121'; rr(ctx, -16, -118, 32, 64, 8); ctx.fill();
      const lamp = (yy, on, c) => { ctx.fillStyle = on ? c : '#3a3a3a'; if (on) { ctx.shadowColor = c; ctx.shadowBlur = 14; } ctx.beginPath(); ctx.arc(0, yy, 9, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; };
      lamp(-104, st === 'r', '#ff1744'); lamp(-86, st === 'y', '#ffd600'); lamp(-68, st === 'g', '#76ff03');
      ctx.restore();
    }
  }
}
function drawCrossers(ctx, S, t, rot) {
  for (const p of S.cross) { const R = 12; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-rot); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 6, 0, 0, TAU); ctx.fill(); ctx.translate(0, -R * 3.4 - (p.jump > 0 ? Math.sin(p.jump / 0.7 * Math.PI) * 34 : 0)); if (p.dir < 0) ctx.scale(-1, 1); drawRig(ctx, p.fig, R, t, p.jump > 0 ? 'cheer' : 'walk', { legs: true }); ctx.restore(); }
}
