// ===================== GEOMETRI & HJÄLPFUNKTIONER =====================
var TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Centripetal Catmull-Rom
function crPoint(p0, p1, p2, p3, t) {
  const al = 0.5;
  const d = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), al) || 1e-4;
  const t0 = 0, t1 = t0 + d(p0, p1), t2 = t1 + d(p1, p2), t3 = t2 + d(p2, p3);
  const tt = t1 + (t2 - t1) * t;
  const L = (pa, pb, ta, tb) => [((tb - tt) * pa[0] + (tt - ta) * pb[0]) / (tb - ta), ((tb - tt) * pa[1] + (tt - ta) * pb[1]) / (tb - ta)];
  const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
  const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
  return L(B1, B2, t1, t2);
}

function buildCenterline(pts, step) {
  const n = pts.length, dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < 60; k++) dense.push(crPoint(p0, p1, p2, p3, k / 60));
  }
  // resample med jämnt avstånd
  const out = [];
  let acc = 0; out.push(dense[0]);
  let prev = dense[0];
  for (let i = 1; i <= dense.length; i++) {
    const cur = dense[i % dense.length];
    let seg = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    while (acc + seg >= step) {
      const t = (step - acc) / seg;
      const np = [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
      out.push(np); prev = np; seg = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]); acc = 0;
    }
    acc += seg; prev = cur;
  }
  if (Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < step * 0.5) out.pop();
  const N = out.length;
  const px = new Float32Array(N), py = new Float32Array(N), tx = new Float32Array(N), ty = new Float32Array(N), nx = new Float32Array(N), ny = new Float32Array(N), ang = new Float32Array(N);
  for (let i = 0; i < N; i++) { px[i] = out[i][0]; py[i] = out[i][1]; }
  for (let i = 0; i < N; i++) {
    const a = (i - 2 + N) % N, b = (i + 2) % N;
    let dx = px[b] - px[a], dy = py[b] - py[a]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    tx[i] = dx; ty[i] = dy; nx[i] = -dy; ny[i] = dx; ang[i] = Math.atan2(dy, dx);
  }
  return { N, px, py, tx, ty, nx, ny, ang, step };
}

function pointInPoly(x, y, px, py) {
  let inside = false; const N = px.length;
  for (let i = 0, j = N - 1; i < N; j = i++) {
    if (((py[i] > y) !== (py[j] > y)) && (x < (px[j] - px[i]) * (y - py[i]) / (py[j] - py[i]) + px[i])) inside = !inside;
  }
  return inside;
}
function nearestGlobal(cl, x, y) {
  let best = 1e18, bi = 0;
  for (let i = 0; i < cl.N; i += 2) { const d = dist2(x, y, cl.px[i], cl.py[i]); if (d < best) { best = d; bi = i; } }
  for (let i = bi - 3; i <= bi + 3; i++) { const k = (i + cl.N) % cl.N; const d = dist2(x, y, cl.px[k], cl.py[k]); if (d < best) { best = d; bi = k; } }
  return bi;
}
function nearestLocal(cl, x, y, idx, win) {
  let best = 1e18, bi = idx;
  for (let i = idx - win; i <= idx + win; i++) { const k = (i + cl.N) % cl.N; const d = dist2(x, y, cl.px[k], cl.py[k]); if (d < best) { best = d; bi = k; } }
  return bi;
}
function distToTrack(cl, x, y) {
  let best = 1e18;
  for (let i = 0; i < cl.N; i += 2) { const d = dist2(x, y, cl.px[i], cl.py[i]); if (d < best) best = d; }
  return Math.sqrt(best);
}
