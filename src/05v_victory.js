// ===================== SEGERSCEN efter målgång =====================
// Vinnaren dansar på en scen. Är spelaren inte etta står hen bredvid och jublar (alltid glad).
function victoryStart() {
  const P = G.player, win = G.cars.find(c => c.finished && c.place === 1) || P;
  const nm = (win.who && win.who.name) || 'X';
  G.victory = { t: -1.4, win, dance: DANCES[(nm.length * 7 + G.T.def.id.length + (G.cupIdx || 0)) % DANCES.length], place: P.place, conf: [], played: false };
}
function victoryUpdate(dt) {
  const V = G.victory; if (!V) return; V.t += dt;
  if (V.t > 0 && !V.played) { V.played = true; Snd.play('fanfar'); }
  if (V.t > 0) { for (let k = 0; k < 3; k++) if (V.conf.length < 160) V.conf.push({ x: Math.random() * W, y: -20, vy: (120 + Math.random() * 160) * H / 1000, vx: (Math.random() - 0.5) * 60, r: Math.random() * 6, col: `hsl(${Math.random() * 360},90%,60%)` }); for (const p of V.conf) { p.y += p.vy * dt; p.x += p.vx * dt; p.r += dt * 6; } V.conf = V.conf.filter(p => p.y < H + 20); }
}
function drawVictory() {
  const V = G.victory; if (!V || V.t <= 0) return;
  const u = H / 1000, t = V.t, T = G.time, a = Math.min(1, t * 3);
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, stroke = 8) => { ctx.font = font(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; if (stroke) { ctx.lineWidth = stroke * u; ctx.strokeStyle = '#120a2a'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); };
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,4,30,0.84)'; ctx.fillRect(0, 0, W, H);
  // strålkastare
  for (const s of [-1, 1]) { const sw = Math.sin(T * 1.3 + s) * 0.12; ctx.save(); ctx.translate(W / 2 + s * W * 0.42, -20 * u); ctx.rotate(s * (0.55 + sw)); const g = ctx.createLinearGradient(0, 0, 0, H * 1.1); g.addColorStop(0, 'rgba(255,245,180,0.35)'); g.addColorStop(1, 'rgba(255,245,180,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-30 * u, 0); ctx.lineTo(30 * u, 0); ctx.lineTo(260 * u, H * 1.1); ctx.lineTo(-260 * u, H * 1.1); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // scen
  const sy = H * 0.7; ctx.fillStyle = '#4a148c'; ctx.beginPath(); ctx.ellipse(W / 2, sy, W * 0.32, 70 * u, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#7b1fa2'; ctx.beginPath(); ctx.ellipse(W / 2, sy - 12 * u, W * 0.3, 58 * u, 0, 0, TAU); ctx.fill();
  for (let k = 0; k < 18; k++) { const an = k / 18 * TAU; ctx.fillStyle = Math.floor(T * 4 + k) % 2 ? '#ffd600' : '#ff4081'; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(an) * W * 0.3, sy - 12 * u + Math.sin(an) * 58 * u, 6 * u, 0, TAU); ctx.fill(); }
  const win = V.win, me = win === G.player, R = 88 * u;
  // vinnarens bil
  // vinnarens bil snett framifrån på ett vridbord
  showroomPlate(W / 2 + 340 * u, sy - 30 * u, 150 * u, T);
  ctx.save(); ctx.translate(W / 2 + 330 * u, sy - 20 * u); ctx.scale(2.3 * u, 2.3 * u); drawCarFront(ctx, win.d, T, { boost: true, speed: 1.2 }); ctx.restore();
  ctx.save(); ctx.translate(W / 2, sy - 12 * u - 3.4 * R); drawRig(ctx, win.who.fig, R, T, V.dance[0], { legs: true }); ctx.restore();
  if (me) txt(G.playerName ? `${G.playerName} VANN!` : 'DU VANN!', W / 2, H * 0.14, 110, '#ffd600', 14);
  else {
    txt('VINNARE: ' + win.who.name, W / 2, H * 0.14, 80, '#fff', 12);
    // spelaren jublar bredvid – alltid glad
    const hx = W / 2 - 360 * u, R2 = 62 * u;
    // spelarens egen bil bredvid, också snett framifrån
    ctx.save(); ctx.translate(hx + 90 * u, sy + 46 * u); ctx.scale(-1.4 * u, 1.4 * u); drawCarFront(ctx, G.player.d, T + 1, { speed: 0.8 }); ctx.restore();
    ctx.save(); ctx.translate(hx, sy - 20 * u - 3.4 * R2); drawRig(ctx, G.player.who.fig, R2, T + 0.5, 'cheer', { legs: true }); ctx.restore();
    txt(`${G.playerName ? G.playerName + ' KOM' : 'DU KOM'} ${PLACE_TXT[V.place - 1].toUpperCase()}!`, hx, sy - 20 * u - 3.4 * R2 - 110 * u, 36, '#ffd600', 7);
    txt('BRA KÖRT!', hx - 120 * u, sy + 40 * u, 34, '#76ff03', 7);
  }
  for (const p of V.conf) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.col; ctx.fillRect(-7 * u, -3 * u, 14 * u, 7 * u); ctx.restore(); }
  ctx.globalAlpha = a * 0.75; ctx.font = `italic 600 ${22 * u | 0}px Arial`; ctx.fillStyle = '#e1bee7'; ctx.textAlign = 'center'; ctx.fillText(`Vinnardans: ${V.dance[1]} (godkänd av IFSB)`, W / 2, H * 0.84);
  ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = `bold ${20 * u | 0}px Arial`; ctx.fillText('ENTER = VIDARE', W - 24 * u, H - 24 * u);
  ctx.restore();
}
