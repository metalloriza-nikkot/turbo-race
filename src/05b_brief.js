// ===================== UPPDRAGSSKYLT innan start =====================
// Visar tydligt VAD man ska göra. Valfri knapp startar (efter en kort stund så man inte råkar hoppa förbi).
const BRIEF = {
  gas: ['GASA FRAMÅT', 'STANNA I DEN GRÖNA RUTAN'], slalom: ['KÖR MELLAN KONERNA', 'GENOM ALLA 7 PORTAR'], backa: ['BACKA IN I GARAGET', 'OCH STANNA DÄR'],
  ljus: ['STANNA VID RÖTT', 'KÖR VID GRÖNT'], mynt: ['TA ALLA MYNT', 'INNAN TIDEN TAR SLUT'], plattor: ['KÖR ÖVER ALLA', 'GULA PLATTOR'],
  raket: ['VÄNTA PÅ GRÖNT LJUS', 'GASA NÄR DET BLIR GRÖNT'], bro: ['KÖR ÖVER BRON', 'NUDDA INTE KONERNA'], hopp: ['TRYCK PÅ TURBO', 'HOPPA ÖVER VATTNET'],
  skjut: ['SKJUT SÖNDER', 'ALLA BALLONGER'], lava: ['KÖR RUNT', 'DEN HETA LAVAN'], is: ['KÖR GENOM PORTARNA', 'PÅ DEN HALA ISEN'],
  drift: ['SVÄNG OCH GASA', 'SLADDA I KURVORNA'], bromsdrift: ['SVÄNG OCH TRYCK ▼', 'MITT I KURVAN'], jakt: ['KÖR IKAPP TJUVEN', 'OCH KNUFFA TILL HEN'], spoke: ['KÖR FORTARE', 'ÄN SPÖKET'],
};
const KEYCAP = { up: '▲', down: '▼', left: '◀', right: '▶', space: 'MELLANSLAG', shift: 'SHIFT' };
// b: { icon, title, col, rows: [[text, size, color]], keys: [...], stars, readHint, t }
function drawBriefCard(b) {
  const u = H / 1000, t = b.t || 0, a = Math.min(1, t * 4);
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, stroke = 0) => { ctx.font = font(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); };
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(10,5,30,0.62)'; ctx.fillRect(0, 0, W, H);
  const w = Math.min(W * 0.84, 1250 * u), h = 860 * u, x = W / 2 - w / 2, pop = 1 + Math.max(0, 0.15 - t * 0.6), y = H / 2 - h / 2;
  ctx.translate(W / 2, H / 2); ctx.scale(pop, pop); ctx.translate(-W / 2, -H / 2);
  ctx.fillStyle = '#fffdf5'; rr(ctx, x, y, w, h, 40 * u); ctx.fill(); ctx.strokeStyle = b.col || '#ffab40'; ctx.lineWidth = 12 * u; ctx.stroke();
  ctx.fillStyle = b.col || '#ffab40'; rr(ctx, x, y, w, 130 * u, 40 * u); ctx.fill(); ctx.fillRect(x, y + 90 * u, w, 40 * u);
  txt((b.icon ? b.icon + '  ' : '') + b.title, W / 2, y + 68 * u, b.title.length > 18 ? 54 : 66, '#fff', 8);
  let yy = y + 215 * u;
  for (const r of b.rows) { if (r.draw) { r.draw(W / 2, yy, u, t); yy += (r.h || 110) * u; continue; } txt(r[0], W / 2, yy, r[1] || 72, r[2] || '#1a1033'); yy += ((r[1] || 72) + 38) * u; }
  if (b.stars) txt(b.stars, W / 2, y + h - 245 * u, 34, '#8d6e63');
  // tangenter
  if (b.keys && b.keys.length) {
    const ks = b.keys.map(k => KEYCAP[k] || k), widths = ks.map(k => (k.length > 2 ? k.length * 26 + 50 : 76) * u), gap = 16 * u, tot = widths.reduce((s, w2) => s + w2, 0) + gap * (ks.length - 1);
    let kx = W / 2 - tot / 2; const ky = y + h - 150 * u;
    ks.forEach((k, i) => { ctx.fillStyle = '#fff'; rr(ctx, kx, ky, widths[i], 70 * u, 12 * u); ctx.fill(); ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 4 * u; ctx.stroke(); ctx.fillStyle = '#b0bec5'; ctx.fillRect(kx + 4 * u, ky + 60 * u, widths[i] - 8 * u, 8 * u); txt(k, kx + widths[i] / 2, ky + 32 * u, k.length > 2 ? 30 : 38, '#263238'); kx += widths[i] + gap; });
  }
  if (b.readHint) txt('🔊 MELLANSLAG = LÄS UPP', W / 2, y + h - 195 * u, 30, '#1565c0');
  ctx.globalAlpha = a * (t > 0.8 ? 0.65 + Math.sin(t * 5) * 0.35 : 0.3);
  txt(b.go || 'TRYCK PÅ EN KNAPP FÖR ATT BÖRJA!', W / 2, y + h - 45 * u, 40, '#2e7d32');
  ctx.restore();
}
function drawSchoolBrief() {
  const S = G.school, ch = S.ch, br = BRIEF[ch.id] || [ch.name, ''];
  drawBriefCard({ icon: ch.icon, title: ch.name, col: '#1e88e5', rows: [[br[0], 76], [br[1], 60, '#37474f'], { h: 150, draw: (x, y, u, t) => { ctx.font = `${130 * u | 0}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch.icon, x, y + 40 * u + Math.sin(t * 4) * 8 * u); } }], keys: ch.keys, t: G.brief.t });
}
function briefStart() {
  if (!G.brief || G.brief.t < 0.8) return false;
  G.brief = null; Snd.play('click'); G.mode = 'countdown'; return true;
}

// ord med ikon (emoji) eller färgruta framför
function briefWord(pre, word, size, col) {
  return { h: size + 50, draw: (x, y, u) => {
    ctx.font = `bold ${size * u | 0}px "Arial Rounded MT Bold", Arial`; const tw = ctx.measureText(word).width, iw = pre ? size * 1.25 * u : 0, x0 = x - (tw + iw) / 2;
    if (pre && pre[0] === '#') { ctx.fillStyle = pre; rr(ctx, x0, y - size * 0.45 * u, size * 0.9 * u, size * 0.9 * u, 10 * u); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3 * u; ctx.stroke(); }
    else if (pre) { ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(pre, x0, y + 4 * u); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = col || '#1a1033'; ctx.fillText(word, x0 + iw, y + 4 * u);
  } };
}

// ===================== PRESENT FÖRE LOPPET: läs orden och välj =====================
const GIFTS = [['TURBO', '⚡', 'turbo'], ['SKÖLD', '🛡️', 'shield'], ['MYNT', '🪙', 'coins'], ['BOLL', '🔴', 'ball']];
function makeGift() {
  const lower = readData().lvl >= 3 && Math.random() < 0.35;
  return { t: 0, opts: shuffle(GIFTS).slice(0, 3), sel: 1, picked: null, lower, pt: 0 };
}
function giftKey(e) {
  const g = G.gift; if (!g || e.repeat) return; if (g.picked != null) return;
  if (e.code === 'ArrowLeft') { g.sel = (g.sel + 2) % 3; Snd.play('move'); }
  else if (e.code === 'ArrowRight') { g.sel = (g.sel + 1) % 3; Snd.play('move'); }
  else if (e.code === 'Space') { const w = g.opts[g.sel][0]; soundOut(g.lower ? w.toLowerCase() : w); }
  else if (e.code === 'Enter' && g.t > 0.6) { g.picked = g.sel; g.pt = 0; Snd.play('got'); Voice.say(g.opts[g.sel][0].toLowerCase() + '!', true); }
  else if (e.code === 'Escape') pause();
}
function giftUpdate(dt) {
  const g = G.gift; if (!g) { G.mode = 'countdown'; return; } g.t += dt;
  if (g.t > 1.2 && !g.said) { g.said = true; Voice.say('Välj en present! Läs orden. Mellanslag läser upp.', true); }
  if (g.picked != null) { g.pt += dt; if (g.pt > 1.1) { const k = g.opts[g.picked][2], P = G.player; if (k === 'coins') addCoins(5); else { P.item = k; P.roulette = 0; } g.done = true; G.mode = 'countdown'; G.countdown = 3.99; G.lastCount = 4; soundClear('present vald'); } }
}
function drawGift() {
  const g = G.gift, u = H / 1000, t = g.t;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, t * 4);
  ctx.fillStyle = 'rgba(10,5,30,0.6)'; ctx.fillRect(0, 0, W, H);
  const txt = (s, x, y, size, col, stroke = 0) => { ctx.font = `bold ${size * u | 0}px "Arial Rounded MT Bold", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = stroke * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); };
  txt('🎁 VÄLJ EN PRESENT!', W / 2, H * 0.2, 80, '#ffd600', 12);
  const bw = 330 * u, bh = 300 * u, gap = 50 * u;
  g.opts.forEach((o, k) => {
    const x = W / 2 + (k - 1) * (bw + gap), y = H * 0.48, sel = k === g.sel, open = g.picked === k, lift = sel && g.picked == null ? -12 * u + Math.sin(t * 6) * 5 * u : 0;
    if (g.picked != null && !open) ctx.globalAlpha = 0.35;
    ctx.fillStyle = open ? '#fff8e1' : ['#e53935', '#43a047', '#1e88e5'][k]; rr(ctx, x - bw / 2, y - bh / 2 + lift, bw, bh, 26 * u); ctx.fill();
    ctx.strokeStyle = sel ? '#ffd600' : 'rgba(0,0,0,0.3)'; ctx.lineWidth = (sel ? 12 : 4) * u; ctx.stroke();
    if (open) txt(o[1], x, y - 30 * u, 120, '#000'); else { ctx.fillStyle = '#ffd600'; ctx.fillRect(x - 14 * u, y - bh / 2 + lift, 28 * u, bh); ctx.fillRect(x - bw / 2, y - 30 * u + lift, bw, 28 * u); }
    ctx.fillStyle = '#fff'; rr(ctx, x - bw * 0.42, y + bh / 2 - 95 * u + lift, bw * 0.84, 80 * u, 16 * u); ctx.fill();
    txt(g.lower ? o[0].toLowerCase() : o[0], x, y + bh / 2 - 55 * u + lift, 60, '#1a1033');
    ctx.globalAlpha = Math.min(1, t * 4);
  });
  ctx.globalAlpha = 0.6 + Math.sin(t * 5) * 0.4; txt('◀ ▶ VÄLJ · ENTER = ÖPPNA · MELLANSLAG = LÄS UPP', W / 2, H * 0.8, 32, '#fff', 6);
  ctx.restore(); drawSoundStrip();
}
