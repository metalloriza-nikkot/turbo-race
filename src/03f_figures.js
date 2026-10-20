// ===================== FIGURER (förare) =====================
const FIG_OPT = {
  skin: { label: 'HUD', say: 'Hud', names: ['LJUS', 'MELLAN', 'BRUN', 'MÖRK', 'GRÖN', 'BLÅ', 'ROBOT'], cols: ['#ffdbb4', '#f1c27d', '#c68642', '#8d5524', '#7ed957', '#6ec6ff', '#b0bec5'] },
  hair: { label: 'HÅR', say: 'Hår', names: ['KORT', 'LÅNGT', 'LOCKIGT', 'TOFSAR', 'TUPP', 'SKALLIG', 'KEPS', 'KRONA', 'ANTENNER', 'HJÄLM'] },
  hairCol: { label: 'FÄRG', say: 'Hårfärg', names: ['BRUN', 'LJUSBRUN', 'BLOND', 'RÖD', 'SVART', 'GRÅ', 'ROSA', 'BLÅ', 'GRÖN'], cols: ['#4e342e', '#a0683a', '#f4d03f', '#d84315', '#212121', '#cfd8dc', '#ff4fa3', '#2196f3', '#64dd17'] },
  eyes: { label: 'ÖGON', say: 'Ögon', names: ['VANLIGA', 'STORA', 'GLASÖGON', 'SOLGLASÖGON', 'ARGA'] },
  beard: { label: 'SKÄGG', say: 'Skägg', names: ['INGET', 'MUSTASCH', 'SKÄGG', 'HELSKÄGG'] },
  mouth: { label: 'MUN', say: 'Mun', names: ['LEENDE', 'FLIN', 'TUNGA', 'OJ!'] },
  suit: { label: 'DRÄKT', say: 'Dräkt', names: ['RÖD', 'BLÅ', 'GRÖN', 'GUL', 'LILA', 'ORANGE', 'SVART', 'ROSA', 'SILVER'], cols: ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#263238', '#ec407a', '#b0bec5'] },
};
const FIG_KEYS = ['skin', 'hair', 'hairCol', 'eyes', 'beard', 'mouth', 'suit'];
const DEFAULT_FIG = { skin: 0, hair: 0, hairCol: 0, eyes: 0, beard: 0, mouth: 0, suit: 1 };
function randomFig() { const f = {}; for (const k of FIG_KEYS) f[k] = Math.floor(Math.random() * FIG_OPT[k].names.length); if (Math.random() < 0.7) f.beard = 0; return f; }

// Färdiga motståndare
const PREMADE = [
  { name: 'SARA SNABB', car: 'blixt', fig: { skin: 0, hair: 1, hairCol: 3, eyes: 1, beard: 0, mouth: 1, suit: 7 } },
  { name: 'KAPTEN KRUT', car: 'polis', fig: { skin: 1, hair: 6, hairCol: 0, eyes: 0, beard: 1, mouth: 0, suit: 1 } },
  { name: 'DINO-DENNIS', car: 'dino', fig: { skin: 4, hair: 4, hairCol: 5, eyes: 1, beard: 0, mouth: 2, suit: 2 } },
  { name: 'ROBO-RONNY', car: 'robo', fig: { skin: 6, hair: 8, hairCol: 7, eyes: 3, beard: 0, mouth: 3, suit: 8 } },
  { name: 'NATT-NIKITA', car: 'skuggan', fig: { skin: 2, hair: 3, hairCol: 4, eyes: 3, beard: 0, mouth: 0, suit: 6 } },
  { name: 'BERG-BERIT', car: 'beast', fig: { skin: 0, hair: 2, hairCol: 5, eyes: 2, beard: 0, mouth: 1, suit: 5 } },
  { name: 'PILOT-PIA', car: 'flyg', fig: { skin: 1, hair: 9, hairCol: 3, eyes: 3, beard: 0, mouth: 1, suit: 0 } },
  { name: 'SJÖ-SIXTEN', car: 'bat', fig: { skin: 0, hair: 6, hairCol: 5, eyes: 0, beard: 3, mouth: 0, suit: 1 } },
  { name: 'VARV-VIKTOR', car: 'f1', fig: { skin: 2, hair: 9, hairCol: 4, eyes: 4, beard: 0, mouth: 0, suit: 2 } },
  { name: 'SOFF-SIGGE', car: 'soffa', fig: { skin: 0, hair: 5, hairCol: 1, eyes: 0, beard: 2, mouth: 1, suit: 4 } },
  { name: 'BUBBEL-BIRGITTA', car: 'badkar', fig: { skin: 1, hair: 2, hairCol: 6, eyes: 2, beard: 0, mouth: 2, suit: 7 } },
  { name: 'KORV-KALLE', car: 'korv', fig: { skin: 0, hair: 4, hairCol: 3, eyes: 1, beard: 1, mouth: 1, suit: 3 } },
];

function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = clamp(Math.round(r * f), 0, 255); g = clamp(Math.round(g * f), 0, 255); b = clamp(Math.round(b * f), 0, 255); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }

// Porträtt framifrån. R = huvudets radie. Centrerat på huvudet.
function drawFigure(c, fig, R, t = 0) {
  fig = Object.assign({}, DEFAULT_FIG, fig || {});
  const skin = FIG_OPT.skin.cols[fig.skin] || '#ffdbb4', robot = fig.skin === 6, alien = fig.skin === 4 || fig.skin === 5;
  const hc = FIG_OPT.hairCol.cols[fig.hairCol] || '#4e342e', suit = FIG_OPT.suit.cols[fig.suit] || '#1e88e5';
  const blink = (t % 3.2) > 3.05;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const ol = 'rgba(0,0,0,0.55)', lw = R * 0.06;
  // kropp / dräkt
  c.fillStyle = suit; c.beginPath(); c.moveTo(-R * 1.25, R * 2.2); c.quadraticCurveTo(-R * 1.25, R * 0.95, 0, R * 0.95); c.quadraticCurveTo(R * 1.25, R * 0.95, R * 1.25, R * 2.2); c.closePath(); c.fill(); c.strokeStyle = ol; c.lineWidth = lw; c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-R * 0.35, R * 0.98); c.lineTo(0, R * 1.35); c.lineTo(R * 0.35, R * 0.98); c.closePath(); c.fill();
  c.fillStyle = shade(suit, 0.75); c.beginPath(); c.arc(-R * 0.7, R * 1.65, R * 0.18, 0, TAU); c.fill();
  c.fillStyle = '#fff'; c.font = `bold ${R * 0.22 | 0}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', -R * 0.7, R * 1.66);
  // långt hår / tofsar bakom
  if (fig.hair === 1) { c.fillStyle = hc; c.beginPath(); c.ellipse(0, R * 0.25, R * 1.12, R * 1.15, 0, 0, TAU); c.fill(); }
  if (fig.hair === 3) { c.fillStyle = hc; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 1.12, R * 0.05, R * 0.38, 0, TAU); c.fill(); c.stroke(); } }
  // öron
  if (!robot) { c.fillStyle = skin; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * R * 0.97, R * 0.08, R * 0.18, R * 0.25, 0, 0, TAU); c.fill(); c.strokeStyle = ol; c.lineWidth = lw; c.stroke(); } }
  else { c.fillStyle = '#78909c'; for (const s of [-1, 1]) { rr(c, s * R * 1.08 - R * 0.13, -R * 0.2, R * 0.26, R * 0.45, R * 0.08); c.fill(); } }
  // huvud
  c.fillStyle = skin; c.beginPath(); if (robot) rr(c, -R * 0.95, -R * 0.95, R * 1.9, R * 1.85, R * 0.4); else c.arc(0, 0, R, 0, TAU); c.fill(); c.strokeStyle = ol; c.lineWidth = lw; c.stroke();
  if (robot) { c.fillStyle = '#90a4ae'; for (const [x, y] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.7], [0.75, 0.7]]) { c.beginPath(); c.arc(x * R, y * R, R * 0.06, 0, TAU); c.fill(); } }
  // kinder
  if (!robot) { c.fillStyle = 'rgba(255,110,110,0.35)'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.55, R * 0.3, R * 0.15, 0, TAU); c.fill(); } }
  // hår ovanpå
  c.fillStyle = hc; c.strokeStyle = ol; c.lineWidth = lw;
  switch (fig.hair) {
    case 0: case 7: c.beginPath(); c.arc(0, -R * 0.05, R * 1.02, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(R * 0.4, -R * 0.55, -R * 0.2, -R * 0.45); c.quadraticCurveTo(-R * 0.7, -R * 0.4, -R * 0.99, -R * 0.2); c.closePath(); c.fill(); c.stroke(); break;
    case 1: c.beginPath(); c.arc(0, -R * 0.02, R * 1.03, Math.PI * 1.0, Math.PI * 2.0); c.quadraticCurveTo(R * 0.3, -R * 0.5, 0, -R * 0.55); c.quadraticCurveTo(-R * 0.3, -R * 0.5, -R * 1.03, 0); c.closePath(); c.fill(); break;
    case 2: for (let k = 0; k < 9; k++) { const a = Math.PI * (1.0 + k / 8); c.beginPath(); c.arc(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.85 - R * 0.05, R * 0.3, 0, TAU); c.fill(); } break;
    case 3: c.beginPath(); c.arc(0, -R * 0.05, R * 1.0, Math.PI * 1.08, Math.PI * 1.92); c.quadraticCurveTo(0, -R * 0.35, -R * 0.97, -R * 0.35); c.closePath(); c.fill(); c.fillStyle = '#e91e63'; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * 0.88, -R * 0.1, R * 0.1, 0, TAU); c.fill(); } break;
    case 4: c.beginPath(); c.moveTo(-R * 0.35, -R * 0.8); for (let k = 0; k <= 5; k++) { const x = -R * 0.35 + k * R * 0.14; c.lineTo(x, -R * (1.45 + (k % 2) * 0.12)); c.lineTo(x + R * 0.07, -R * 0.85); } c.closePath(); c.fill(); c.stroke(); break;
    case 5: c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-R * 0.35, -R * 0.62, R * 0.22, R * 0.1, -0.5, 0, TAU); c.fill(); break;
    case 6: { const cap = suit; c.fillStyle = hc; c.beginPath(); c.arc(0, -R * 0.05, R * 1.0, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill(); c.fillStyle = cap; c.beginPath(); c.arc(0, -R * 0.2, R * 0.98, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.ellipse(R * 0.35, -R * 0.22, R * 0.85, R * 0.16, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -R * 0.6, R * 0.14, 0, TAU); c.fill(); break; }
    case 8: c.strokeStyle = robot ? '#607d8b' : hc; c.lineWidth = R * 0.08; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.35, -R * 0.85); c.quadraticCurveTo(s * R * 0.55, -R * 1.3, s * R * 0.5 + Math.sin(t * 4) * R * 0.05, -R * 1.5); c.stroke(); c.fillStyle = Math.floor(t * 2) % 2 && robot ? '#ff1744' : hc; c.beginPath(); c.arc(s * R * 0.5 + Math.sin(t * 4) * R * 0.05, -R * 1.52, R * 0.15, 0, TAU); c.fill(); } break;
    case 9: { c.fillStyle = suit; c.beginPath(); c.arc(0, -R * 0.05, R * 1.12, Math.PI * 0.92, Math.PI * 2.08); c.closePath(); c.fill(); c.strokeStyle = ol; c.stroke(); c.fillStyle = '#fff'; c.fillRect(-R * 0.08, -R * 1.15, R * 0.16, R * 0.7); break; }
  }
  if (fig.hair === 7) { c.fillStyle = '#ffc400'; c.strokeStyle = '#b8860b'; c.beginPath(); c.moveTo(-R * 0.55, -R * 0.8); c.lineTo(-R * 0.6, -R * 1.35); c.lineTo(-R * 0.3, -R * 1.05); c.lineTo(0, -R * 1.45); c.lineTo(R * 0.3, -R * 1.05); c.lineTo(R * 0.6, -R * 1.35); c.lineTo(R * 0.55, -R * 0.8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#e53935'; c.beginPath(); c.arc(0, -R * 1.0, R * 0.09, 0, TAU); c.fill(); }
  // ögon
  const ey = -R * 0.08, ex = R * 0.36;
  if (fig.eyes === 3) { c.fillStyle = '#111'; for (const s of [-1, 1]) { rr(c, s * ex - R * 0.3, ey - R * 0.16, R * 0.6, R * 0.34, R * 0.12); c.fill(); } c.fillRect(-R * 0.1, ey - R * 0.08, R * 0.2, R * 0.06); c.fillStyle = 'rgba(255,255,255,0.5)'; for (const s of [-1, 1]) c.fillRect(s * ex - R * 0.18, ey - R * 0.1, R * 0.12, R * 0.05); }
  else {
    const big = fig.eyes === 1, er = big ? R * 0.22 : R * 0.15;
    for (const s of [-1, 1]) {
      if (blink) { c.strokeStyle = '#222'; c.lineWidth = R * 0.06; c.beginPath(); c.moveTo(s * ex - er, ey); c.lineTo(s * ex + er, ey); c.stroke(); continue; }
      c.fillStyle = robot ? '#00e5ff' : '#fff'; c.beginPath(); c.ellipse(s * ex, ey, er, er * 1.15, 0, 0, TAU); c.fill(); c.strokeStyle = ol; c.lineWidth = lw * 0.7; c.stroke();
      if (!robot) { c.fillStyle = '#222'; c.beginPath(); c.arc(s * ex + R * 0.03, ey + R * 0.02, er * 0.55, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(s * ex + R * 0.07, ey - R * 0.04, er * 0.2, 0, TAU); c.fill(); }
    }
    if (fig.eyes === 2) { c.strokeStyle = '#263238'; c.lineWidth = R * 0.07; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * ex, ey, R * 0.25, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-ex + R * 0.25, ey); c.lineTo(ex - R * 0.25, ey); c.stroke(); }
    if (fig.eyes === 4) { c.strokeStyle = shade(hc, 0.7); c.lineWidth = R * 0.1; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * ex - s * R * 0.2, ey - R * 0.32); c.lineTo(s * ex + s * R * 0.2, ey - R * 0.22); c.stroke(); } }
  }
  // skägg
  c.fillStyle = hc;
  if (fig.beard === 3) { c.beginPath(); c.moveTo(-R * 0.95, R * 0.05); c.quadraticCurveTo(-R * 0.9, R * 1.15, 0, R * 1.15); c.quadraticCurveTo(R * 0.9, R * 1.15, R * 0.95, R * 0.05); c.quadraticCurveTo(R * 0.5, R * 0.35, 0, R * 0.3); c.quadraticCurveTo(-R * 0.5, R * 0.35, -R * 0.95, R * 0.05); c.fill(); }
  if (fig.beard === 2) { c.beginPath(); c.moveTo(-R * 0.35, R * 0.6); c.quadraticCurveTo(0, R * 1.25, R * 0.35, R * 0.6); c.quadraticCurveTo(0, R * 0.8, -R * 0.35, R * 0.6); c.fill(); }
  // mun
  const my = R * 0.5;
  c.strokeStyle = '#3e2723'; c.lineWidth = R * 0.07;
  if (robot) { c.fillStyle = '#37474f'; rr(c, -R * 0.35, my - R * 0.1, R * 0.7, R * 0.22, R * 0.05); c.fill(); c.strokeStyle = '#90a4ae'; c.lineWidth = R * 0.03; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(-R * 0.35 + k * R * 0.14, my - R * 0.1); c.lineTo(-R * 0.35 + k * R * 0.14, my + R * 0.12); c.stroke(); } }
  else if (fig.mouth === 0) { c.beginPath(); c.arc(0, my - R * 0.15, R * 0.28, 0.35, Math.PI - 0.35); c.stroke(); }
  else if (fig.mouth === 1) { c.fillStyle = '#5d1a1a'; c.beginPath(); c.moveTo(-R * 0.32, my - R * 0.05); c.quadraticCurveTo(0, my + R * 0.4, R * 0.32, my - R * 0.05); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.fillRect(-R * 0.22, my - R * 0.04, R * 0.44, R * 0.09); }
  else if (fig.mouth === 2) { c.beginPath(); c.arc(0, my - R * 0.15, R * 0.28, 0.35, Math.PI - 0.35); c.stroke(); c.fillStyle = '#ff5c8a'; c.beginPath(); c.ellipse(R * 0.08, my + R * 0.14, R * 0.12, R * 0.15, 0, 0, TAU); c.fill(); }
  else { c.fillStyle = '#5d1a1a'; c.beginPath(); c.ellipse(0, my + R * 0.03, R * 0.12, R * 0.16, 0, 0, TAU); c.fill(); }
  if (fig.beard === 1) { c.fillStyle = hc; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, my - R * 0.2); c.quadraticCurveTo(s * R * 0.3, my - R * 0.3, s * R * 0.5, my - R * 0.02); c.quadraticCurveTo(s * R * 0.25, my - R * 0.1, 0, my - R * 0.08); c.fill(); } }
  if (alien && fig.hair !== 8) { c.fillStyle = '#fff'; }
  c.restore();
}
// Pratande figur: överdelen av huvudet fälls upp som en lucka (klipp-animation). open 0..1
function drawFigureTalk(c, fig, R, t, open) {
  if (!open || open < 0.03) { drawFigure(c, fig, R, t); return; }
  const sy = R * 0.42, gap = open * R * 0.7, ang = -open * 0.3, px = R * 0.95;
  c.save(); c.beginPath(); c.rect(-R * 3, sy, R * 6, R * 4); c.clip(); drawFigure(c, fig, R, t); c.restore();
  // munhåla
  c.save(); c.beginPath(); c.rect(-R * 3, sy - gap - R * 0.3, R * 6, gap + R * 0.3); c.clip();
  c.fillStyle = '#3b0d12'; c.beginPath(); c.ellipse(0, sy, R * 0.88, gap * 1.1 + R * 0.1, 0, Math.PI, TAU); c.fill();
  c.fillStyle = '#e57373'; c.beginPath(); c.ellipse(-R * 0.15, sy, R * 0.42, gap * 0.4, 0, Math.PI, TAU); c.fill();
  c.fillStyle = '#fff'; c.fillRect(-R * 0.45, sy - R * 0.1, R * 0.9, R * 0.1);
  c.restore();
  // överdelen, vippad uppåt kring ena sidan
  c.save(); c.translate(px, sy); c.rotate(ang); c.translate(-px, -sy); c.translate(0, -gap * 0.75);
  c.beginPath(); c.rect(-R * 3, -R * 4, R * 6, R * 4 + sy); c.clip(); drawFigure(c, fig, R, t); c.restore();
}
// litet huvud i en cirkel (för listor/HUD)
function drawFace(c, fig, x, y, R, t) { c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.fillStyle = '#e8eaf6'; c.fill(); c.clip(); c.translate(x, y + R * 0.18); drawFigure(c, fig, R * 0.62, t); c.restore(); c.strokeStyle = '#fff'; c.lineWidth = Math.max(2, R * 0.1); c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke(); }

// ---------- Butik ----------
const SHOP = {
  paint: [
    { id: 'std', name: 'ORIGINAL', price: 0 }, { id: 'rosa', name: 'ROSA', col: '#ff4fa3', price: 20 }, { id: 'guld', name: 'GULD', col: '#ffc400', price: 40 },
    { id: 'lime', name: 'LIME', col: '#76ff03', price: 20 }, { id: 'lila', name: 'LILA', col: '#8e24aa', price: 20 }, { id: 'himmel', name: 'HIMMELSBLÅ', col: '#29b6f6', price: 20 },
    { id: 'svart', name: 'SVART', col: '#263238', price: 25 }, { id: 'vit', name: 'VIT', col: '#f5f5f5', price: 20 }, { id: 'regn', name: 'REGNBÅGE', col: 'rainbow', price: 80 },
  ],
  sticker: [
    { id: 'none', name: 'INGEN', price: 0 }, { id: 'star', name: 'STJÄRNA', price: 15 }, { id: 'bolt', name: 'BLIXT', price: 15 }, { id: 'flames', name: 'FLAMMOR', price: 30 },
    { id: 'heart', name: 'HJÄRTA', price: 15 }, { id: 'one', name: 'ETTA', price: 20 }, { id: 'smile', name: 'SMILEY', price: 15 }, { id: 'paw', name: 'DINOFOT', price: 20 },
  ],
  horn: [
    { id: 'tut', name: 'TUT-TUT', price: 0 }, { id: 'ko', name: 'KO', price: 15 }, { id: 'tag', name: 'TÅG', price: 20 }, { id: 'dino', name: 'DINOVRÅL', price: 25 },
    { id: 'fanfar', name: 'FANFAR', price: 30 }, { id: 'polis', name: 'SIREN', price: 20 }, { id: 'prutt', name: 'PRUTT', price: 25 },
  ],
};
function styledCar(carIdx, paint, sticker) {
  const base = DRIVERS[carIdx]; const d = Object.assign({}, base);
  const p = SHOP.paint.find(x => x.id === paint);
  if (p && p.col) { if (p.col === 'rainbow') d.rainbow = true; else { d.color = p.col; d.dark = shade(p.col, 0.68); } }
  if (sticker && sticker !== 'none') d.sticker = sticker;
  return d;
}
function drawSticker(c, id, t) {
  c.save(); c.translate(15, 0);
  switch (id) {
    case 'star': c.fillStyle = '#ffeb3b'; c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 3 : 7; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); break;
    case 'bolt': c.fillStyle = '#ffeb3b'; c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -7); c.lineTo(3, -2); c.lineTo(-1, 0); c.lineTo(7, 7); c.lineTo(-3, 2); c.lineTo(1, 0); c.closePath(); c.fill(); c.stroke(); break;
    case 'flames': c.translate(-15, 0); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { c.fillStyle = ['#ff5722', '#ff9800', '#ffeb3b'][k]; c.beginPath(); c.moveTo(24 - k * 3, s * (12 - k * 2)); c.quadraticCurveTo(10, s * (15 - k), -6 - k * 4, s * (9 + Math.sin(t * 10 + k) * 1.5)); c.quadraticCurveTo(8, s * (8 - k), 24 - k * 3, s * (12 - k * 2)); c.fill(); } break;
    case 'heart': c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(4, 0); c.bezierCurveTo(8, -4, 2, -9, -1, -4); c.bezierCurveTo(-4, -9, -10, -4, -6, 0); c.lineTo(-1, 5); c.closePath(); c.rotate(0); c.fill(); break;
    case 'one': c.fillStyle = '#fff'; c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill(); c.stroke(); c.rotate(Math.PI / 2); c.fillStyle = '#e53935'; c.font = 'bold 11px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('1', 0, 1); break;
    case 'smile': c.fillStyle = '#ffeb3b'; c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#333'; c.beginPath(); c.arc(2, -2.5, 1.2, 0, TAU); c.arc(2, 2.5, 1.2, 0, TAU); c.fill(); c.beginPath(); c.arc(-1, 0, 4, Math.PI * 0.6, Math.PI * 1.4); c.stroke(); break;
    case 'paw': c.fillStyle = '#2e7d32'; c.beginPath(); c.ellipse(-2, 0, 4, 5, 0, 0, TAU); c.fill(); for (const [x, y] of [[4, -5], [6, 0], [4, 5]]) { c.beginPath(); c.moveTo(x - 2, y * 0.8); c.lineTo(x + 4, y * 1.1); c.lineTo(x - 1, y * 0.8 + 2); c.fill(); } break;
  }
  c.restore();
}

function drawCar(ctx, d, time, o = {}) {
  if (d.rainbow) { const h = (time * 90) % 360; d = Object.assign({}, d, { color: `hsl(${h},85%,55%)`, dark: `hsl(${(h + 40) % 360},80%,40%)` }); }
  drawCarBase(ctx, d, time, o);
  if (d.sticker) drawSticker(ctx, d.sticker, time);
}

// ===================== FIGURRIGG: armar, ben och poser (klipp-docks-stil) =====================
// Koordinater i R-enheter, huvudets mitt = (0,0). Axlar (±1.0, 1.3), höfter (±0.45, 2.15).
// En pose returnerar mål för händer/fötter (enkel IK), samt hopp (y), lutning (rot) och spegling (sx).
const ARM_L1 = 0.78, ARM_L2 = 0.72, LEG_L1 = 0.62, LEG_L2 = 0.62;
const POSES = {
  idle: t => ({ L: [-1.25, 2.6 + Math.sin(t * 2) * 0.04], R: [1.25, 2.6 + Math.sin(t * 2 + 1) * 0.04] }),
  gesture: t => ({ L: [-1.25, 2.6], R: [1.35 + Math.sin(t * 5) * 0.2, 0.9 + Math.sin(t * 7.3) * 0.3] }),
  wave: t => ({ L: [-1.25, 2.6], R: [1.75 + Math.sin(t * 10) * 0.25, -0.1] }),
  clap: t => { const o = 0.5 + 0.5 * Math.sin(t * 10); return { L: [-(0.08 + 0.35 * o), 1.75], R: [0.08 + 0.35 * o, 1.75] }; },
  politeClap: t => { const o = Math.max(0, Math.sin(t * 4)); return { L: [-(0.1 + 0.3 * o), 1.8], R: [0.1 + 0.3 * o, 1.8] }; },
  cheer: t => ({ L: [-1.5, -0.6 + Math.sin(t * 8) * 0.12], R: [1.5, -0.6 + Math.sin(t * 8 + 1) * 0.12], y: -Math.abs(Math.sin(t * 6)) * 0.45 }),
  heart: t => ({ L: [-1.25, 2.6], R: [-0.3, 1.55] }),
  sulk: t => ({ L: [0.35, 1.8], R: [-0.4, 1.7], rot: Math.sin(t * 1.5) * 0.03 }),
  point: t => ({ L: [-1.25, 2.6], R: [2.4, 0.9 + Math.sin(t * 2) * 0.1] }),
  hold: t => ({ L: [-0.5, 2.05 - Math.abs(Math.sin(t * 3)) * 0.1], R: [0.5, 2.05 - Math.abs(Math.sin(t * 3)) * 0.1] }),
  mic: t => ({ L: [-1.25, 2.6], R: [1.55, 1.1] }),
  carry: t => ({ L: [-0.75, -0.9], R: [0.75, -0.9], y: -Math.abs(Math.sin(t * 9)) * 0.12 }),
  walk: t => { const p = Math.sin(t * 9); return { L: [-1.15 + 0.35 * p, 2.5], R: [1.15 + 0.35 * p, 2.5], lf: [-0.45 + 0.3 * p, 3.35], rf: [0.45 + 0.3 * p, 3.35], y: -Math.abs(Math.cos(t * 9)) * 0.15 }; },
  // danser
  korv: t => { const s = Math.sin(t * 8); return { L: [-1.45, -0.3 + 0.35 * s], R: [1.45, -0.3 - 0.35 * s], rot: s * 0.22, lf: [-0.6, 3.35 - Math.max(0, s) * 0.3], rf: [0.6, 3.35 - Math.max(0, -s) * 0.3] }; },
  robot: t => { const k = Math.floor(t * 4) % 4; const A = [[[-1.9, 1.3], [1.0, 0.2]], [[-1.0, 0.2], [1.9, 1.3]], [[-1.9, 1.3], [1.9, 1.3]], [[-1.0, 0.2], [1.0, 0.2]]][k]; return { L: A[0], R: A[1], rot: [0.06, -0.06, 0, 0][k], lf: [-0.5, 3.35], rf: [0.5, 3.35] }; },
  snurr: t => ({ L: [-1.5, -0.5], R: [1.5, -0.5], sx: Math.cos(t * 7), y: -Math.abs(Math.sin(t * 3.5)) * 0.25 }),
  hopp: t => { const h = Math.abs(Math.sin(t * 5)); return { L: [-1.6, -0.4 - h * 0.3], R: [1.6, -0.4 - h * 0.3], y: -h * 0.9, lf: [-0.6, 3.2 - h * 0.2], rf: [0.6, 3.2 - h * 0.2] }; },
  disco: t => { const up = Math.floor(t * 2.5) % 2; return { L: [-1.2, 2.5], R: up ? [1.9, -1.1] : [-0.5, 2.6], rot: up ? -0.12 : 0.12, lf: [-0.55, 3.35], rf: [0.6, 3.3] }; },
};
const DANCES = [['korv', 'KORVDANSEN'], ['robot', 'ROBOTEN'], ['snurr', 'SNURRE-SNURR'], ['hopp', 'KÄNGURUN'], ['disco', 'DISCOPEKAREN']];
function ik(sx, sy, tx, ty, l1, l2, outSign) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const max = (l1 + l2) * 0.999;
  if (d > max) { tx = sx + dx / d * max; ty = sy + dy / d * max; dx = tx - sx; dy = ty - sy; d = max; }
  d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  const th = Math.atan2(dy, dx), a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const e1 = [sx + Math.cos(th + a) * l1, sy + Math.sin(th + a) * l1], e2 = [sx + Math.cos(th - a) * l1, sy + Math.sin(th - a) * l1];
  const el = (e1[0] - e2[0]) * outSign > 0 ? e1 : e2;
  return [el, [tx, ty]];
}
function limb(c, p0, p1, p2, w, col, ol) {
  c.strokeStyle = ol; c.lineWidth = w + 2.4 * (w / 14); c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
}
// opts: { talk (0..1), legs (bool), prop(c, R, hands), steam (bool) }
function drawRig(c, fig, R, t, pose, opts = {}) {
  fig = Object.assign({}, DEFAULT_FIG, fig || {});
  const P = (POSES[pose] || POSES.idle)(t);
  const skin = FIG_OPT.skin.cols[fig.skin] || '#ffdbb4', suit = FIG_OPT.suit.cols[fig.suit] || '#1e88e5', ol = 'rgba(0,0,0,0.55)';
  const hand = fig.skin === 6 ? '#90a4ae' : skin;
  c.save(); c.translate(0, (P.y || 0) * R); if (P.rot) c.rotate(P.rot); if (P.sx != null) c.scale(Math.abs(P.sx) < 0.08 ? 0.08 * Math.sign(P.sx || 1) : P.sx, 1);
  if (opts.legs) {
    const pants = shade(suit, 0.55);
    for (const s of [-1, 1]) {
      const f = (s < 0 ? P.lf : P.rf) || [s * 0.5, 3.35];
      const [kn, ft] = ik(s * 0.45 * R, 2.1 * R, f[0] * R, f[1] * R, LEG_L1 * R, LEG_L2 * R, s);
      limb(c, [s * 0.45 * R, 2.1 * R], kn, ft, R * 0.36, pants, ol);
      c.fillStyle = '#263238'; c.beginPath(); c.ellipse(ft[0] + s * R * 0.12, ft[1] + R * 0.08, R * 0.3, R * 0.15, 0, 0, TAU); c.fill();
    }
  }
  drawFigureTalk(c, fig, R, t, opts.talk || 0);
  const hands = [];
  for (const s of [-1, 1]) {
    const tg = s < 0 ? P.L : P.R; const sh = [s * 1.0 * R, 1.3 * R];
    const [el, hd] = ik(sh[0], sh[1], tg[0] * R, tg[1] * R, ARM_L1 * R, ARM_L2 * R, s);
    limb(c, sh, el, hd, R * 0.32, suit, ol);
    c.fillStyle = hand; c.strokeStyle = ol; c.lineWidth = R * 0.05; c.beginPath(); c.arc(hd[0], hd[1], R * 0.2, 0, TAU); c.fill(); c.stroke();
    hands.push(hd);
  }
  if (opts.prop) opts.prop(c, R, hands);
  if (opts.steam) { c.fillStyle = 'rgba(236,239,241,0.85)'; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const ph = (t * 1.3 + k / 3) % 1; c.globalAlpha = 1 - ph; c.beginPath(); c.arc(s * R * (1.1 + ph * 0.4), -R * (0.1 + ph * 1.2), R * (0.12 + ph * 0.2), 0, TAU); c.fill(); } c.globalAlpha = 1; }
  c.restore();
}
