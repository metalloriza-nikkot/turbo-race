// ===================== BILARNA SNETT FRAMIFRÅN (ritade för hand, en per bil) =====================
// En liten 3D-ritsats: x = framåt, y = åt höger (synliga sidan), z = uppåt. Projektion snett framifrån/ovanifrån.
// Varje bil byggs av lådor, skrov, hjul och detaljer i ritordning bakifrån och fram. Effekter som om bilen kör:
// snurrande hjul, studs, fartlinjer, damm och bilens egna avgaser (eld, bio-rök, turbolågor).
const FV = { ax: -0.9, ay: 0.33, bx: 0.66, by: 0.27, hz: 1 };
function fvP(x, y, z) { return [x * FV.ax + y * FV.bx, x * FV.ay + y * FV.by - z * FV.hz]; }
function fvHex(c) { // färg till hex (regnbågslack ger hsl)
  if (!c || c[0] === '#') return c || '#999999';
  const m = /hsl\((\d+\.?\d*),\s*(\d+)%,\s*(\d+)%\)/.exec(c); if (!m) return '#999999';
  const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100, q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return '#' + [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}
function fvKit(ctx) {
  const OUT = 'rgba(0,0,0,0.5)';
  const path = pts => { ctx.beginPath(); pts.forEach((p, i) => { const [X, Y] = fvP(p[0], p[1], p[2]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
  const K = {
    c: ctx,
    poly(pts, fill, stroke = OUT, lw = 1.1) { path(pts); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } },
    // skrov: botten-rektangel b=[x0,x1,y0,y1] på z0, topp-rektangel t på z1. Ritar högersida, front och tak.
    hull(b, t, z0, z1, col, o = {}) {
      col = fvHex(col); const sideC = o.side || shade(col, 0.74), frontC = o.front || shade(col, 0.9), topC = o.top || shade(col, 1.08);
      K.poly([[b[0], b[3], z0], [b[1], b[3], z0], [t[1], t[3], z1], [t[0], t[3], z1]], sideC);
      K.poly([[b[1], b[2], z0], [b[1], b[3], z0], [t[1], t[3], z1], [t[1], t[2], z1]], frontC);
      if (!o.noTop) K.poly([[t[0], t[2], z1], [t[1], t[2], z1], [t[1], t[3], z1], [t[0], t[3], z1]], topC);
    },
    box(x0, x1, y0, y1, z0, z1, col, o) { K.hull([x0, x1, y0, y1], [x0, x1, y0, y1], z0, z1, col, o); },
    // ellips i ett plan: 'x' (fronten), 'y' (sidan), 'z' (taket)
    disk(plane, cx, cy, cz, r, fill, stroke = OUT, r2) {
      ctx.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, c = Math.cos(a) * r, s = Math.sin(a) * (r2 || r); const p = plane === 'x' ? fvP(cx, cy + c, cz + s) : plane === 'y' ? fvP(cx + c, cy, cz + s) : fvP(cx + c, cy + s, cz); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    },
    line(a, b, col, lw = 1.5) { const p = fvP(...a), q = fvP(...b); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); },
    // hjul: axel längs y. side = +1 höger (ytterkanten syns), -1 vänster (bara lite syns under bilen)
    wheel(x, y, r, w, spin, rim = '#cfd8dc', o = {}) {
      const tire = o.tire || '#1b1b1f', yo = y + w / 2, yi = y - w / 2;
      for (let k = 0; k <= 4; k++) K.disk('y', x, yi + (w * k) / 4, r, r, k < 4 ? '#0e0e12' : tire, k < 4 ? null : OUT);
      if (o.knobs) for (let k = 0; k < 10; k++) { const a = spin + k / 10 * TAU, p = fvP(x + Math.cos(a) * r * 1.02, yo, r + Math.sin(a) * r * 1.02); ctx.fillStyle = '#2b2b30'; ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.11, 0, TAU); ctx.fill(); }
      K.disk('y', x, yo + 0.2, r * 0.6, rim);
      ctx.strokeStyle = shade(fvHex(rim), 0.6); ctx.lineWidth = Math.max(1, r * 0.12);
      for (let k = 0; k < (o.spokes || 5); k++) { const a = spin + k / (o.spokes || 5) * TAU; K.line([x, yo + 0.3, r], [x + Math.cos(a) * r * 0.55, yo + 0.3, r + Math.sin(a) * r * 0.55], ctx.strokeStyle, Math.max(1, r * 0.12)); }
      K.disk('y', x, yo + 0.4, r * 0.18, '#37474f', null);
    },
    glow(x, y, z, r, col, a = 0.6) { const [X, Y] = fvP(x, y, z); const g = ctx.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; },
    eye(x, y, z, r, look = 0.3, blink = false) { // tecknat öga på fronten
      K.disk('x', x, y, z, r, '#fff', '#222', blink ? r * 0.15 : r * 1.15); if (blink) return;
      K.disk('x', x + 0.1, y + r * look, z - r * 0.1, r * 0.55, '#2e7d32', null); K.disk('x', x + 0.2, y + r * look, z - r * 0.1, r * 0.3, '#111', null); K.disk('x', x + 0.3, y + r * look - r * 0.2, z + r * 0.25, r * 0.15, '#fff', null);
    },
    text(s, x, y, z, size, col) { const [X, Y] = fvP(x, y, z); ctx.save(); ctx.translate(X, Y); ctx.transform(FV.bx / 0.7, FV.by / 0.7, 0, 1, 0, 0); ctx.font = `bold ${size}px Arial`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); },
  };
  return K;
}
// ---------- tillståndslösa effekter (fungerar för hur många bilar som helst) ----------
function fvBack(len) { const L = Math.hypot(FV.ax, FV.ay); return [-FV.ax / L * len, -FV.ay / L * len]; }
function fvSpeedLines(ctx, t, n = 7, sp = 1) {
  ctx.save(); ctx.lineCap = 'round';
  for (let k = 0; k < n; k++) { const ph = (((t * 1.6 * sp + k * 0.618) % 1) + 1) % 1, off = ((k * 37) % 11 - 5) * 6; const [bx, by] = fvBack(1); const sx = 20 + ph * 90, x = bx * sx - by * off, y = by * sx + bx * off - 14; ctx.globalAlpha = 0.55 * (1 - ph); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + bx * 26, y + by * 26); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
}
function fvPuffs(ctx, t, ox, oy, o) { // rök/damm/eld som driver bakåt från punkten (ox,oy) i skärmkoordinater
  const n = o.n || 6, [bx, by] = fvBack(1);
  for (let k = 0; k < n; k++) {
    const ph = (((t * (o.rate || 1.4) + k / n) % 1) + 1) % 1, d = ph * (o.len || 40), wob = Math.sin(k * 3.1 + t * 2) * (o.spread || 5) * ph;
    const x = ox + bx * d - by * wob, y = oy + by * d + bx * wob - ph * (o.rise || 6), r = (o.r0 || 3) + ph * (o.r1 || 7);
    ctx.globalAlpha = (o.a || 0.6) * (1 - ph);
    if (o.fire) ctx.fillStyle = ph < 0.25 ? '#fff59d' : ph < 0.5 ? '#ffb300' : ph < 0.75 ? '#ff5722' : '#5d4037';
    else ctx.fillStyle = Array.isArray(o.col) ? o.col[k % o.col.length] : o.col || '#cfd8dc';
    if (o.leaf && k % 3 === 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 4 + k); ctx.fillStyle = '#66bb6a'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.45, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
// ---------- bilarna ----------
// Varje funktion ritar bilen kring marken (0,0,0). w = hjulvinkel, b = studs (kaross-höjd), d = bilens färger, K = ritsats, t = tid
const FRONT_CARS = {
  sport(K, d, w, b, t) { // BLIXT: låg sportbil med runda lampor
    K.wheel(-20, -16, 8, 6, w); K.wheel(20, -15, 7.5, 6, w);
    K.hull([-33, 33, -17, 17], [-32, 32, -16, 16], 4 + b, 12 + b, d.color);
    K.hull([-26, 30, -15, 15], [-20, 22, -13, 13], 12 + b, 15 + b, d.color);
    K.hull([-18, 10, -12, 12], [-12, 2, -10, 10], 15 + b, 23 + b, d.color, { front: '#1f3550', side: '#2a4566', top: shade(fvHex(d.color), 1.1) });
    K.poly([[2, -10, 23 + b], [10, -12, 15 + b], [10, 12, 15 + b], [2, 10, 23 + b]], '#8fd3ff');
    K.poly([[-29, -14, 14.5 + b], [-27, -14, 14.5 + b], [-27, 14, 14.5 + b], [-29, 14, 14.5 + b]], '#111');
    for (const s of [-1, 1]) K.disk('x', 33.2, s * 10, 8 + b, 3.2, '#fffbe0', '#9e9e9e');
    K.poly([[33.2, -5, 5 + b], [33.2, 5, 5 + b], [33.2, 5, 7.5 + b], [33.2, -5, 7.5 + b]], '#222', null);
    K.wheel(-20, 16, 8, 6, w); K.wheel(20, 15, 7.5, 6, w);
  },
  shadow(K, d, w, b, t) { // SKUGGAN: svart smyg-kil med blå ljuslinjer
    K.wheel(-18, -15, 7, 6, w, '#263238'); K.wheel(18, -13, 6, 5, w, '#263238');
    K.hull([-34, 30, -18, 18], [-30, 34, -6, 6], 4 + b, 14 + b, d.color);
    K.hull([-20, 6, -8, 8], [-14, 0, -5, 5], 14 + b, 20 + b, '#0b0d12', { top: '#1c2a3a' });
    const g = 0.6 + Math.sin(t * 6) * 0.4; K.line([30, 8, 6 + b], [-30, 18, 6 + b], d.accent || '#35d0ff', 2.2); K.line([34, 2, 13.5 + b], [-28, 6, 14 + b], d.accent || '#35d0ff', 1.6);
    K.glow(31, 4, 9 + b, 12, d.accent || '#35d0ff', 0.35 * g);
    for (const s of [-1, 1]) K.poly([[30, s * 3, 9 + b], [34, s * 2, 12 + b], [34, s * 1, 12 + b], [30, s * 1, 9 + b]], d.accent || '#35d0ff', null);
    K.poly([[-34, 16, 15 + b], [-26, 16, 15 + b], [-28, 16, 26 + b], [-34, 16, 26 + b]], '#111');
    K.wheel(-18, 15, 7, 6, w, '#263238'); K.wheel(18, 13, 6, 5, w, '#263238');
  },
  dino(K, d, w, b, t) { // DINO: monstertruck med dinosaurie i hytten
    K.wheel(-20, -17, 12, 9, w, '#8be36b', { knobs: true }); K.wheel(20, -17, 12, 9, w, '#8be36b', { knobs: true });
    K.box(-28, 28, -14, 14, 14 + b, 22 + b, d.dark);
    K.hull([-28, 28, -15, 15], [-26, 24, -14, 14], 22 + b, 26 + b, d.color);
    // svans bakåt
    K.hull([-40, -26, -3, 3], [-40, -26, -1, 1], 22 + b, 26 + b, d.color);
    // dinosauriehuvud
    const nod = Math.sin(t * 5) * 1.2;
    K.box(-6, 8, -6, 6, 26 + b, 36 + b, d.color);
    K.hull([2, 18, -7, 7], [4, 19, -6, 6], 34 + b + nod, 43 + b + nod, d.accent || '#8be36b');
    K.poly([[18, -5, 36 + b + nod], [19.1, -5, 38 + b + nod], [19.1, 5, 38 + b + nod], [18, 5, 36 + b + nod]], '#fff', null);
    K.eye(16.5, -3.5, 44 + b + nod, 2.6, 0.2); K.eye(16.5, 3.5, 44 + b + nod, 2.6, 0.2);
    for (let k = 0; k < 4; k++) K.poly([[-4 + k * 5, 0, 36 + b], [-1 + k * 5, 0, 40 + b], [2 + k * 5, 0, 36 + b]], '#ff9800');
    for (const s of [-1, 1]) K.disk('x', 28.2, s * 9, 18 + b, 2.6, '#fff59d');
    K.wheel(-20, 17, 12, 9, w, '#8be36b', { knobs: true }); K.wheel(20, 17, 12, 9, w, '#8be36b', { knobs: true });
  },
  robo(K, d, w, b, t) { // ROBO: svävande rymdglidare (inga hjul)
    const h = 6 + Math.sin(t * 4) * 1.5;
    K.glow(0, 0, 1, 34, d.accent || '#27e6ff', 0.45);
    K.hull([-30, 6, -20, 20], [-26, 6, -16, 16], h + b, h + 5 + b, d.color);
    K.hull([6, 34, -12, 12], [6, 36, -1, 1], h + b, h + 5 + b, d.color);
    K.hull([-14, 4, -7, 7], [-10, 1, -6, 6], h + 5 + b, h + 8 + b, d.dark);
    K.disk('z', -5, 0, h + 12 + b, 7, '#455a64'); K.box(-9, -1, -5, 5, h + 8 + b, h + 14 + b, '#b0bec5');
    K.poly([[-1, -4, h + 10 + b], [-1, 4, h + 10 + b], [-1, 4, h + 13 + b], [-1, -4, h + 13 + b]], d.accent || '#27e6ff', null);
    K.line([-5, 0, h + 14 + b], [-5, 0, h + 20 + b], '#78909c', 1.4); K.disk('x', -5, 0, h + 21 + b, 1.6, Math.floor(t * 4) % 2 ? '#ff5252' : '#ffeb3b', null);
    for (const s of [-1, 1]) K.glow(-30, s * 12, h + 2 + b, 9, d.accent || '#27e6ff', 0.8);
  },
  jeep(K, d, w, b, t) { // TRAIL BEAST: pappas jeep med störtbåge och ljusramp
    K.wheel(-20, -17, 11, 8, w, '#9e9e9e', { knobs: true }); K.wheel(20, -17, 11, 8, w, '#9e9e9e', { knobs: true });
    K.box(-30, 30, -15, 15, 9 + b, 22 + b, d.color);
    K.box(-34, -30, -6, 6, 13 + b, 25 + b, '#212121'); K.disk('x', -34, 0, 19 + b, 0.1, null, null);
    K.hull([30, 34, -14, 14], [30, 33, -13, 13], 8 + b, 18 + b, '#37474f');
    for (let k = -2; k <= 2; k++) K.poly([[34.1, k * 4 - 1, 10 + b], [34.1, k * 4 + 1, 10 + b], [34.1, k * 4 + 1, 16 + b], [34.1, k * 4 - 1, 16 + b]], '#111', null);
    K.poly([[22, -13, 22 + b], [26, -13, 32 + b], [26, 13, 32 + b], [22, 13, 22 + b]], '#8fd3ff');
    for (const s of [-1, 1]) { K.line([-24, s * 13, 22 + b], [-20, s * 13, 34 + b], '#212121', 2.4); K.line([22, s * 13, 22 + b], [18, s * 13, 34 + b], '#212121', 2.4); K.line([-20, s * 13, 34 + b], [18, s * 13, 34 + b], '#212121', 2.4); }
    K.line([18, -13, 34 + b], [18, 13, 34 + b], '#212121', 2.4);
    for (let k = -2; k <= 2; k++) K.disk('x', 18.5, k * 5, 35.5 + b, 1.8, '#fff59d');
    for (const s of [-1, 1]) K.disk('x', 34.2, s * 11, 15 + b, 2.8, '#fffbe0', '#9e9e9e');
    K.box(-10, 10, 14.6, 15.2, 11 + b, 16 + b, d.accent || '#7cc242', { front: d.accent || '#7cc242' });
    K.wheel(-20, 17, 11, 8, w, '#9e9e9e', { knobs: true }); K.wheel(20, 17, 11, 8, w, '#9e9e9e', { knobs: true });
  },
  plane(K, d, w, b, t) { // FLYGAREN: flygplan på hjul med snurrande propeller
    K.wheel(-16, -12, 6, 4, w); K.wheel(18, -8, 6, 4, w);
    K.box(-6, 8, -36, -9, 15 + b, 17 + b, d.color);
    K.hull([-30, 26, -8, 8], [-26, 24, -7, 7], 8 + b, 22 + b, d.color);
    K.hull([24, 32, -7, 7], [24, 31, -4, 4], 9 + b, 20 + b, d.color);
    K.poly([[-30, -1, 22 + b], [-22, -1, 22 + b], [-28, -1, 34 + b], [-32, -1, 34 + b]], d.dark);
    K.box(-34, -26, -12, 12, 20 + b, 22 + b, d.color);
    K.hull([-4, 14, -5, 5], [0, 8, -4, 4], 22 + b, 27 + b, '#8fd3ff', { side: '#5aa9d6', front: '#b3e5fc' });
    K.box(-6, 8, 9, 36, 15 + b, 17 + b, d.color);
    K.box(-4, 6, 20, 30, 17.1 + b, 17.2 + b, d.accent || '#fff', { noTop: false });
    // propeller
    K.disk('x', 32.2, 0, 14.5 + b, 2.2, '#ffd600');
    K.c.save(); K.c.globalAlpha = 0.45; K.disk('x', 32.6, 0, 14.5 + b, 10, '#eceff1', null); K.c.restore();
    const pa = t * 30; K.line([32.8, Math.cos(pa) * 10, 14.5 + b + Math.sin(pa) * 10], [32.8, -Math.cos(pa) * 10, 14.5 + b - Math.sin(pa) * 10], '#455a64', 2.5);
    K.wheel(-16, 12, 6, 4, w); K.wheel(18, 8, 6, 4, w);
  },
  boat(K, d, w, b, t) { // BÅTEN: båtskrov med trädäck på hjul
    K.wheel(-18, -13, 7, 5, w); K.wheel(18, -11, 7, 5, w);
    K.hull([-32, 26, -14, 14], [-34, 30, -17, 17], 6 + b, 18 + b, d.color, { top: d.accent || '#8d6e63' });
    K.hull([26, 36, -10, 10], [30, 42, -1, 1], 6 + b, 18 + b, d.color, { top: d.accent || '#8d6e63' });
    for (let k = 0; k < 6; k++) K.line([-30 + k * 10, -16, 18.1 + b], [-30 + k * 10, 16, 18.1 + b], 'rgba(0,0,0,0.25)', 1);
    K.box(-18, -2, -9, 9, 18 + b, 28 + b, '#fafafa');
    K.poly([[-2, -7, 22 + b], [-2, 7, 22 + b], [-2, 7, 26 + b], [-2, -7, 26 + b]], '#8fd3ff');
    K.disk('y', 10, 17.2, 13 + b, 4, '#ff7043'); K.disk('y', 10, 17.4, 13 + b, 2, d.color, null);
    K.line([-26, 0, 18 + b], [-26, 0, 38 + b], '#6d4c41', 2); K.poly([[-26, 0, 38 + b], [-26, 0, 32 + b], [-18, 0, 35 + b]], '#ffd600');
    K.wheel(-18, 13, 7, 5, w); K.wheel(18, 11, 7, 5, w);
  },
  f1(K, d, w, b, t) { // FORMEL: formelbil med vingar
    K.wheel(-20, -18, 9, 9, w, d.accent || '#ff6d00'); K.wheel(22, -17, 8, 8, w, d.accent || '#ff6d00');
    K.box(-38, -30, -16, 16, 22 + b, 25 + b, d.accent || '#ff6d00'); for (const s of [-1, 1]) K.box(-36, -32, s * 12 - 1, s * 12 + 1, 10 + b, 22 + b, '#263238');
    K.hull([-30, 10, -9, 9], [-28, 6, -7, 7], 5 + b, 15 + b, d.color);
    K.hull([10, 36, -5, 5], [10, 38, -2, 2], 5 + b, 11 + b, d.color);
    K.box(32, 40, -17, 17, 3 + b, 5 + b, d.dark);
    K.disk('z', -4, 0, 16 + b, 5, '#111'); K.disk('z', -3, 0, 19 + b, 4.4, '#ffd600'); K.disk('x', 1.2, 0, 19 + b, 3.2, '#212121', null, 1.6);
    K.text('7', -16, 9.2, 10 + b, 7, '#fff');
    K.wheel(-20, 18, 9, 9, w, d.accent || '#ff6d00'); K.wheel(22, 17, 8, 8, w, d.accent || '#ff6d00');
  },
  sofa(K, d, w, b, t) { // SOFFAN: en soffa med hjul och kudde
    K.wheel(-18, -18, 5, 4, w); K.wheel(18, -18, 5, 4, w);
    K.box(-30, 30, -20, 20, 7 + b, 14 + b, d.dark);
    K.box(-30, -18, -20, 20, 14 + b, 32 + b, d.dark);
    K.box(-18, 30, -20, -13, 14 + b, 22 + b, d.color); K.box(-18, 28, -12, 0, 14 + b, 18 + b, shade2(d.color)); K.box(-18, 28, 0.5, 12.5, 14 + b, 18 + b, shade2(d.color));
    K.box(-18, 30, 13, 20, 14 + b, 22 + b, d.color);
    K.box(-16, -8, -6, 4, 18 + b, 26 + b, d.accent || '#ffca28');
    K.box(10, 20, -3, 5, 18 + b, 19.5 + b, '#263238'); K.disk('z', 18, 1, 19.6 + b, 0.9, '#ff1744', null);
    K.wheel(-18, 18, 5, 4, w); K.wheel(18, 18, 5, 4, w);
  },
  tub(K, d, w, b, t) { // BADKARET: badkar med gyllene tassar, bubblor och en anka
    for (const [x, y] of [[-20, -16], [20, -16]]) K.disk('y', x, y, 4, 4.5, '#ffc400');
    K.hull([-30, 30, -15, 15], [-34, 34, -18, 18], 5 + b, 20 + b, d.color, { noTop: true });
    K.poly([[-34, -18, 20 + b], [34, -18, 20 + b], [34, 18, 20 + b], [-34, 18, 20 + b]], '#eceff1');
    K.poly([[-31, -15, 19 + b], [31, -15, 19 + b], [31, 15, 19 + b], [-31, 15, 19 + b]], d.accent || '#4fc3f7', null);
    for (let k = 0; k < 7; k++) K.disk('z', -24 + k * 8, Math.sin(t * 3 + k) * 6, 19.5 + b, 2 + (k % 3), 'rgba(255,255,255,0.9)', null);
    const dx = Math.sin(t * 2) * 6; K.disk('z', dx - 6, 2, 21 + b, 4.5, '#ffeb3b', null); K.box(dx - 3, dx + 1, 0, 4, 21 + b, 26 + b, '#ffeb3b', { side: '#fdd835', front: '#ffee58' }); K.poly([[dx + 1, 1.5, 24 + b], [dx + 4, 2, 23.5 + b], [dx + 1, 2.5, 23 + b]], '#ff9800');
    K.box(26, 30, -3, 3, 20 + b, 30 + b, '#b0bec5'); K.box(30, 36, -1.5, 1.5, 27 + b, 30 + b, '#90a4ae');
    for (const [x, y] of [[-20, 16], [20, 16]]) K.disk('y', x, y, 4, 4.5, '#ffc400');
  },
  hotdog(K, d, w, b, t) { // KORVEN: korv i bröd med senap
    K.wheel(-18, -14, 7, 5, w); K.wheel(18, -14, 7, 5, w);
    K.hull([-30, 30, -15, 15], [-32, 32, -16, 16], 6 + b, 16 + b, d.color, { top: d.dark });
    K.hull([-36, 36, -7, 7], [-34, 34, -5, 5], 13 + b, 22 + b, d.accent || '#c0392b'); K.disk('x', 36, 0, 17.5 + b, 6, shade(fvHex(d.accent || '#c0392b'), 0.9), undefined, 4.5);
    K.c.strokeStyle = '#ffd600'; K.c.lineWidth = 2.6; K.c.beginPath(); for (let k = 0; k <= 12; k++) { const p = fvP(-26 + k * 4.6, k % 2 ? -3 : 3, 22.2 + b); k ? K.c.lineTo(p[0], p[1]) : K.c.moveTo(p[0], p[1]); } K.c.stroke();
    K.hull([-30, 30, 14, 15], [-31, 31, 15, 16], 6 + b, 18 + b, d.color);
    K.wheel(-18, 14, 7, 5, w); K.wheel(18, 14, 7, 5, w);
  },
  police(K, d, w, b, t) { // POLISEN: polisbil med blinkande ljusramp
    K.wheel(-20, -15, 8, 6, w); K.wheel(20, -15, 8, 6, w);
    K.hull([-33, 33, -16, 16], [-32, 32, -15, 15], 5 + b, 15 + b, d.color);
    K.box(-24, 24, 15.1, 15.6, 7 + b, 12 + b, d.accent || '#1f5fd6', { front: d.accent || '#1f5fd6' });
    for (let k = 0; k < 6; k++) K.box(-22 + k * 8, -18 + k * 8, 15.7, 16, 7 + b, 9.5 + b, '#ffd600', { front: '#ffd600' });
    K.hull([-20, 14, -14, 14], [-14, 6, -12, 12], 15 + b, 24 + b, '#e8ecf3', { front: '#233a55', side: '#2f4b6b' });
    const on = Math.floor(t * 6) % 2; K.box(-8, -2, -8, 0, 24 + b, 27 + b, on ? '#2979ff' : '#0d2c6b'); K.box(-8, -2, 0, 8, 24 + b, 27 + b, on ? '#0d2c6b' : '#2979ff');
    K.glow(-5, on ? -4 : 4, 27 + b, 16, '#2979ff', 0.6);
    for (const s of [-1, 1]) K.disk('x', 33.2, s * 10, 10 + b, 2.8, '#fffbe0', '#9e9e9e');
    K.wheel(-20, 15, 8, 6, w); K.wheel(20, 15, 8, 6, w);
  },
  rc(K, d, w, b, t) { // RC-RACERN (design: Liam)
    const y2 = d.accent2 || '#fdd835';
    K.wheel(-21, -19, 11, 10, w, y2, { knobs: true, spokes: 6 }); K.wheel(21, -18, 10, 9, w, y2, { knobs: true, spokes: 6 });
    K.box(-36, -14, -12, 12, 9 + b, 22 + b, '#26262b');
    for (const s of [-8, 0, 8]) { K.box(-42, -36, s - 3, s + 3, 13 + b, 18 + b, '#3d3d44'); }
    K.hull([-16, 18, -15, 15], [-14, 14, -13, 13], 8 + b, 22 + b, d.color);
    for (let k = 0; k < 3; k++) K.line([-6 + k * 4, 15.2, 18 + b], [-2 + k * 4, 15.2, 14 + b], '#111', 1.6);
    K.hull([16, 32, -13, 13], [14, 26, -10, 10], 8 + b, 22 + b, d.accent || '#1e88e5', { front: shade(fvHex(d.accent || '#1e88e5'), 0.95) });
    K.hull([30, 38, -11, 11], [26, 32, -9, 9], 8 + b, 14 + b, d.accent || '#1e88e5');
    K.line([24, -10, 22 + b], [24, 10, 22 + b], '#111', 3);
    for (const s of [-1, 1]) K.poly([[30, s * 11, 12 + b], [40, s * 18, 10 + b], [40, s * 18, 15 + b], [32, s * 11, 16 + b]], y2);
    K.poly([[38.2, -7, 10 + b], [38.2, -2, 10 + b], [38.2, -2, 12 + b], [38.2, -7, 12 + b]], '#e1f5fe', null);
    K.poly([[38.2, 2, 10 + b], [38.2, 7, 10 + b], [38.2, 7, 12 + b], [38.2, 2, 12 + b]], '#e1f5fe', null);
    K.glow(38, 0, 11 + b, 10, '#e1f5fe', 0.5);
    K.wheel(-21, 19, 11, 10, w, y2, { knobs: true, spokes: 6 }); K.wheel(21, 18, 10, 9, w, y2, { knobs: true, spokes: 6 });
  },
  recycle(K, d, w, b, t) { // ÅTERVINNAREN (design: pappa) – med ansikte på fronten
    K.wheel(-26, -17, 8, 6, w, '#b0bec5'); K.wheel(-12, -17, 8, 6, w, '#b0bec5'); K.wheel(24, -17, 8, 6, w, '#b0bec5');
    K.box(-42, -34, -16, 16, 8 + b, 32 + b, d.dark);
    K.box(-34, 12, -16, 16, 8 + b, 34 + b, d.color);
    for (let k = 0; k < 5; k++) K.line([-30 + k * 9, 16.1, 31 + b], [-30 + k * 9, 16.1, 28 + b], 'rgba(0,0,0,0.25)', 1.2);
    // återvinningssymbol på sidan
    { const cx = -11, cz = 20 + b, r = 7; K.c.strokeStyle = '#fff'; K.c.lineWidth = 2.4; K.c.fillStyle = '#fff';
      for (let k = 0; k < 3; k++) { const a0 = k * TAU / 3 + t * 0.6, a1 = a0 + 1.4; K.c.beginPath(); for (let q = 0; q <= 8; q++) { const a = a0 + (a1 - a0) * q / 8, p = fvP(cx + Math.cos(a) * r, 16.3, cz + Math.sin(a) * r); q ? K.c.lineTo(p[0], p[1]) : K.c.moveTo(p[0], p[1]); } K.c.stroke();
        const tip = fvP(cx + Math.cos(a1 + 0.4) * r, 16.3, cz + Math.sin(a1 + 0.4) * r), o1 = fvP(cx + Math.cos(a1) * (r + 3), 16.3, cz + Math.sin(a1) * (r + 3)), o2 = fvP(cx + Math.cos(a1) * (r - 3), 16.3, cz + Math.sin(a1) * (r - 3)); K.c.beginPath(); K.c.moveTo(tip[0], tip[1]); K.c.lineTo(o1[0], o1[1]); K.c.lineTo(o2[0], o2[1]); K.c.closePath(); K.c.fill(); } }
    K.box(13, 15, -12, -9, 30 + b, 44 + b, '#b0bec5');
    // röd hytt
    K.box(12, 36, -16, 16, 8 + b, 30 + b, d.accent || '#e53935');
    K.poly([[36.1, -13, 20 + b], [36.1, 13, 20 + b], [36.1, 13, 28 + b], [36.1, -13, 28 + b]], '#1c3550');
    const blink = (t % 3.7) < 0.14;
    K.eye(36.3, -6, 24 + b, 3.6, 0.25, blink); K.eye(36.3, 6, 24 + b, 3.6, 0.25, blink);
    // leende i grillen
    K.c.strokeStyle = '#3e0d0d'; K.c.lineWidth = 2; K.c.beginPath(); for (let k = 0; k <= 10; k++) { const a = Math.PI * (0.15 + 0.7 * k / 10), p = fvP(36.2, Math.cos(a) * -9, 15 + b - Math.sin(a) * 4); k ? K.c.lineTo(p[0], p[1]) : K.c.moveTo(p[0], p[1]); } K.c.stroke();
    for (const s of [-1, 1]) K.disk('x', 36.2, s * 13, 12 + b, 2.2, '#fffbe0');
    const on = Math.floor(t * 4) % 2; for (const s of [-1, 1]) { const lit = on ^ (s > 0); K.box(26, 30, s * 11 - 2, s * 11 + 2, 30 + b, 33 + b, lit ? '#ffd54f' : d.accent2 || '#ffb300'); if (lit) K.glow(28, s * 11, 33 + b, 12, '#ffb300', 0.7); }
    K.wheel(-26, 17, 8, 6, w, '#b0bec5'); K.wheel(-12, 17, 8, 6, w, '#b0bec5'); K.wheel(24, 17, 8, 6, w, '#b0bec5');
  },
  amb(K, d, w, b, t) { K.wheel(-20, -16, 8, 6, w); K.wheel(22, -16, 8, 6, w); K.box(-36, 36, -16, 16, 6 + b, 30 + b, '#fafafa'); K.box(-14, 10, 16.1, 16.4, 14 + b, 24 + b, '#e53935'); K.box(-6, 2, 16.5, 16.6, 10 + b, 28 + b, '#e53935'); K.poly([[36.1, -12, 20 + b], [36.1, 12, 20 + b], [36.1, 12, 27 + b], [36.1, -12, 27 + b]], '#233a55'); K.wheel(-20, 16, 8, 6, w); K.wheel(22, 16, 8, 6, w); },
};
// Rita en bil snett framifrån. (0,0) = marken mitt under bilen. Bilen är ca 100 enheter bred. o: { speed (0–1.5), boost, still }
function drawCarFront(ctx, d, time, o = {}) {
  if (d.rainbow) { const h = (time * 90) % 360; d = Object.assign({}, d, { color: fvHex(`hsl(${h},85%,55%)`), dark: fvHex(`hsl(${(h + 40) % 360},80%,40%)`) }); }
  const fn = FRONT_CARS[d.type]; if (!fn) { ctx.save(); ctx.scale(0.7, 0.7); drawCarShowroom(ctx, d, time, { yaw: 2.6 }); ctx.restore(); return; }
  const sp = o.still ? 0 : (o.speed == null ? 1 : o.speed), t = time;
  const w = -t * 9 * sp, b = sp ? Math.abs(Math.sin(t * 11 + (d.id || '').length)) * 1.3 * sp : 0;
  const K = fvKit(ctx);
  // skugga
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(0, 6, 52, 17, -0.2, 0, TAU); ctx.fill(); ctx.restore();
  if (sp) {
    fvSpeedLines(ctx, t, 7, sp);
    // damm från bakhjulen
    const dust = d.type === 'robo' ? null : ['#d7ccc8', '#bcaaa4', '#efebe9'];
    if (dust) { const p1 = fvP(-22, 18, 0), p2 = fvP(-22, -16, 0); fvPuffs(ctx, t, p1[0], p1[1], { n: 6, col: dust, len: 46, r0: 3, r1: 9, a: 0.55, rate: 1.6 * sp }); fvPuffs(ctx, t + 0.37, p2[0], p2[1], { n: 4, col: dust, len: 36, r0: 2, r1: 7, a: 0.4, rate: 1.6 * sp }); }
    // bilens egna avgaser
    const ex = d.type === 'rc' ? fvP(-42, 0, 15) : d.type === 'recycle' ? fvP(14, -10.5, 45) : d.type === 'robo' ? fvP(-30, 0, 9) : fvP(-34, 8, 9);
    if (d.trail === 'fire') { for (const s of [-8, 0, 8]) { const q = fvP(-43, s, 15.5); fvPuffs(ctx, t + s, q[0], q[1], { n: 7, fire: true, len: o.boost ? 60 : 40, r0: 3, r1: o.boost ? 9 : 6, a: 0.95, rate: 2.4, spread: 3, rise: 2 }); } }
    else if (d.trail === 'bio') fvPuffs(ctx, t, ex[0], ex[1], { n: 8, col: ['#9ccc65', '#aed581', '#66bb6a'], len: 50, r0: 3, r1: 9, a: 0.75, rate: 0.9, spread: 8, rise: 16, leaf: true });
    else if (d.type === 'robo') fvPuffs(ctx, t, ex[0], ex[1], { n: 6, col: [d.accent || '#27e6ff', '#e0f7fa'], len: 40, r0: 2, r1: 5, a: 0.7, rate: 2.2, spread: 2, rise: 0 });
    else if (d.type !== 'tub') fvPuffs(ctx, t, ex[0], ex[1], { n: 5, col: '#cfd8dc', len: 30, r0: 1.5, r1: 4.5, a: 0.35, rate: 1.3, rise: 5 });
    if (o.boost && d.trail !== 'fire') { const q = fvP(-36, 0, 12); fvPuffs(ctx, t, q[0], q[1], { n: 8, fire: true, len: 55, r0: 3, r1: 8, a: 0.9, rate: 2.6, spread: 4, rise: 1 }); }
  }
  ctx.lineJoin = 'round'; fn(K, d, w, b, t);
}
