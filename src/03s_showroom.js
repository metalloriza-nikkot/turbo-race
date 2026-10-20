// ===================== BILAR I 3/4-VY ("utställningsvy") =====================
// Bilen ritas ovanifrån till en egen bild som sedan staplas i tunna lager ("sprite stacking").
// Det ger en leksaksbil med höjd som kan visas snett framifrån och vridas – utan att varje bil behöver ritas om.
const SHOWROOM = { cv: null, dk: null, dk2: null, body: null };
function showroomBuf() {
  if (!SHOWROOM.cv) { const mk = () => { const c = document.createElement('canvas'); c.width = 220; c.height = 140; return c; }; SHOWROOM.cv = mk(); SHOWROOM.dk = mk(); SHOWROOM.dk2 = mk(); SHOWROOM.body = mk(); }
  return SHOWROOM;
}
// o: { yaw (rad, 0 = fronten åt höger), tilt (0.35–0.7, hur snett uppifrån), h (antal lager), boost }
// Ritas centrerad kring (0,0) i anroparens koordinater; bilens längd blir ca 140 enheter (skala med ctx.scale).
function drawCarShowroom(ctx, d, time, o = {}) {
  const B = showroomBuf(), W2 = 220, H2 = 140;
  const yaw = o.yaw != null ? o.yaw : 0.75, tilt = o.tilt || 0.5, layers = o.h || 14, step = (o.step || 1.55);
  // 1) bilen ovanifrån, i dubbel storlek
  const c = B.cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W2, H2);
  c.save(); c.translate(W2 / 2, H2 / 2); c.scale(2, 2); drawCar(c, d, time, { boost: !!o.boost }); c.restore();
  // samma bil utan lågor/effekter – används för sidolagren så att eld inte blir "klossar"
  const cb = B.body.getContext('2d'); cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W2, H2); cb.save(); cb.translate(W2 / 2, H2 / 2); cb.scale(2, 2); drawCar(cb, d, time, { noFx: true }); cb.restore();
  // 2) mörka kopior för sidorna (nederst mörkast)
  for (const [cv, a] of [[B.dk, 0.42], [B.dk2, 0.6]]) { const k = cv.getContext('2d'); k.globalCompositeOperation = 'source-over'; k.clearRect(0, 0, W2, H2); k.drawImage(B.body, 0, 0); k.globalCompositeOperation = 'source-atop'; k.fillStyle = `rgba(10,6,25,${a})`; k.fillRect(0, 0, W2, H2); k.globalCompositeOperation = 'source-over'; }
  // 3) skugga på marken
  ctx.save(); ctx.scale(1, tilt); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(6, 10 / tilt, 92, 56, yaw, 0, TAU); ctx.fill(); ctx.restore();
  // 4) staplade lager: underst mörkt, överst den riktiga bilden
  for (let k = 0; k < layers; k++) {
    const img = k === layers - 1 ? B.cv : k < layers * 0.45 ? B.dk2 : B.dk;
    ctx.save(); ctx.translate(0, -k * step); ctx.scale(1, tilt); ctx.rotate(yaw); ctx.drawImage(img, -W2 / 2, -H2 / 2); ctx.restore();
  }
}
// Vridbord: snett framifrån, gungar långsamt fram och tillbaka (front mot betraktaren).
// side = 1: fronten pekar ned åt höger, side = -1: ned åt vänster.
function showroomYaw(time, side = 1, sway = 0.35) { const base = side > 0 ? 0.8 : Math.PI - 0.8; return base + Math.sin(time * 0.7) * sway; }
// Vridbordsplatta (ellips med blinkande lampor) under en bil i utställningsvy
function showroomPlate(x, y, r, time) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.32);
  ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(0, 18, r, 0, TAU); ctx.fill();
  ctx.fillStyle = '#455a64'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + time * 0.6; ctx.fillStyle = Math.floor(time * 3 + k) % 2 ? '#ffd600' : '#ff4081'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, r * 0.045, 0, TAU); ctx.fill(); }
  ctx.restore();
}
