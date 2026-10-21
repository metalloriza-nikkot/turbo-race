// ===================== FELSÖKNINGSLOGG =====================
// Ringbuffert med händelser + fel. Sparas löpande i localStorage, så loggen från förra sessionen finns kvar
// även om webbläsaren fick stängas. Exporteras med Ctrl+Skift+L eller från föräldravyn.
const TR_VERSION = 'v16.10';
// prestanda: hur jämnt spelet går (ryck = en bildruta som tog över 70 ms)
const PERF = { frames: 0, sum: 0, js: 0, hitch: 0, logged: 0, lastJs: 0, live: false, loaf: 0, heap: 0, scale: 1, win: [], gpu: null };
// vilket grafikkort webbläsaren använder ("SwiftShader"/"Basic Render" = ingen grafikacceleration)
function gpuInfo() {
  if (PERF.gpu) return PERF.gpu;
  try { const c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl'); if (!gl) return (PERF.gpu = 'ingen webgl'); const ext = gl.getExtension('WEBGL_debug_renderer_info'); PERF.gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); } catch (e) { PERF.gpu = 'okänt'; }
  return PERF.gpu;
}
// Långa bildrutor enligt webbläsaren själv (Chrome): visar om tiden gick åt till skript, till ritning/layout, eller om huvudtråden var ledig (då väntade den på grafikkortet/systemet)
try {
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {
      if (!PERF.live || e.duration < 70 || PERF.loaf++ > 60) continue;
      const scr = (e.scripts || []).reduce((a, s) => a + s.duration, 0), rend = e.renderStart ? e.startTime + e.duration - e.renderStart : 0;
      const top = (e.scripts || []).slice().sort((a, b) => b.duration - a.duration)[0];
      logEv('lång bildruta', Math.round(e.duration) + ' ms', { skript: Math.round(scr), ritning: Math.round(rend), blockerar: Math.round(e.blockingDuration || 0), värst: top ? `${top.invokerType || ''} ${top.invoker || ''} ${Math.round(top.duration)}ms` : '' });
    }
  }).observe({ type: 'long-animation-frame', buffered: false });
} catch (e) { }
const TRLOG = { buf: [], keys: [], max: 500, start: new Date().toISOString(), prev: null, dirty: false, errs: 0 };
try { const old = JSON.parse(localStorage.getItem('turbo_log') || 'null'); if (old && old.buf && old.buf.length) TRLOG.prev = old; } catch (e) { }
function logClock(ms) { const d = new Date(), p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` + (ms ? '.' + p(d.getMilliseconds(), 3) : ''); }
function logEv(kind, msg, data) {
  try {
    let d = '';
    if (data !== undefined) { try { d = typeof data === 'string' ? data : JSON.stringify(data); } catch (e) { d = String(data); } if (d.length > 300) d = d.slice(0, 300) + '…'; }
    TRLOG.buf.push([logClock(true), kind, msg, d]);
    if (TRLOG.buf.length > TRLOG.max) TRLOG.buf.splice(0, TRLOG.buf.length - TRLOG.max);
    TRLOG.dirty = true;
  } catch (e) { }
}
function logKey(code) { TRLOG.keys.push(logClock(false) + ' ' + code); if (TRLOG.keys.length > 60) TRLOG.keys.shift(); }
function logSave() { if (!TRLOG.dirty) return; TRLOG.dirty = false; try { localStorage.setItem('turbo_log', JSON.stringify({ start: TRLOG.start, ver: TR_VERSION, buf: TRLOG.buf.slice(-300), keys: TRLOG.keys, snap: logSnapshot() })); } catch (e) { } }
setInterval(logSave, 4000);
window.addEventListener('pagehide', () => { TRLOG.dirty = true; logSave(); });
window.addEventListener('error', e => { TRLOG.errs++; logEv('FEL', e.message || 'okänt fel', { fil: (e.filename || '').split('/').pop(), rad: e.lineno, kol: e.colno, stack: e.error && e.error.stack ? String(e.error.stack).slice(0, 600) : '' }); logSave(); });
window.addEventListener('unhandledrejection', e => { TRLOG.errs++; logEv('FEL', 'promise: ' + (e.reason && e.reason.message || e.reason)); });
// ögonblicksbild av spelets tillstånd – det viktigaste när något "hänger"
function logSnapshot() {
  const o = { tid: new Date().toLocaleString('sv-SE'), version: TR_VERSION };
  try {
    o.läge = G.mode; o.pausad = !!G.paused; o.skärm = typeof curScreen !== 'undefined' ? curScreen : null; o.bana = G.T && G.T.def ? G.T.def.id : null;
    o.skola = G.school && G.school.ch ? G.school.ch.id : null; o.demo = !!G.demo; o.turnering = typeof CUP !== 'undefined' && CUP.active ? CUP.idx : null;
    if (G.city) { const S = G.city, m = S.m; o.stad = { läge: S.mode, fas: S.phase, uppdrag: m ? { typ: m.type, nivå: m.level, till: m.place && m.place.id, ord: m.foods, etapp: m.stage, hard: !!m.hard, jakt: !!m.hunt, gps: !!m.gps, tid: Math.round(m.t || 0) } : null, leverans: S.D ? { typ: S.D.kind, steg: S.D.stage, skrivet: S.D.typed, fel: S.D.err } : null, skylt: S.sign && S.sign.place ? S.sign.place.id : null, bil: [Math.round(S.car.x), Math.round(S.car.y)] }; }
    if (typeof SOUND !== 'undefined') o.ljudremsa = { syns: !!SOUND.show, ord: SOUND.word, steg: SOUND.i };
    if (typeof QUIZ !== 'undefined' && QUIZ) o.fråga = { q: QUIZ.q && QUIZ.q.q, försök: QUIZ.tries };
    if (typeof SHOW !== 'undefined') o.tvshow = SHOW.active ? { scen: SHOW.i, av: SHOW.scenes.length } : false;
    if (G.gift) o.present = { vald: G.gift.picked, klar: !!G.gift.done };
    o.inställningar = typeof SETTINGS !== 'undefined' ? SETTINGS : null;
    o.prestanda = PERF.frames ? { grafik: gpuInfo(), skala: PERF.scale, bilder: PERF.frames, snittMs: +(PERF.sum / PERF.frames).toFixed(1), snittJsMs: +(PERF.js / PERF.frames).toFixed(1), ryck: PERF.hitch, upplösning: (typeof W !== 'undefined' ? W + '×' + H : '') + ' dpr ' + (typeof DPR !== 'undefined' ? DPR : '') } : null;
    o.helskärm = !!(document.fullscreenElement || document.webkitFullscreenElement);
    o.fönster = innerWidth + '×' + innerHeight; o.webbläsare = navigator.userAgent;
    try { const pd = playerData(); o.spelare = { läsnivå: pd.read && pd.read.lvl, mattenivå: pd.math && pd.math.lvl, mynt: pd.coins }; } catch (e) { }
  } catch (e) { o.snapshotFel = String(e); }
  return o;
}
function logText() {
  const L = [];
  L.push(`TURBO-RACE ${TR_VERSION} – felsökningslogg`, `Exporterad: ${new Date().toLocaleString('sv-SE')}`, `Sessionen startade: ${new Date(TRLOG.start).toLocaleString('sv-SE')} · fel i sessionen: ${TRLOG.errs}`, '');
  L.push('== TILLSTÅND JUST NU ==', JSON.stringify(logSnapshot(), null, 2), '');
  L.push('== HÄNDELSER (nyast sist) ==');
  for (const [t, k, m, d] of TRLOG.buf) L.push(`${t}  [${k}] ${m}${d ? '  ' + d : ''}`);
  L.push('', '== SENASTE TANGENTER ==', TRLOG.keys.join(' | ') || '(inga)');
  if (TRLOG.prev) {
    const P = TRLOG.prev; L.push('', `== FÖRRA SESSIONEN (startade ${new Date(P.start).toLocaleString('sv-SE')}, ${P.ver || ''}) ==`);
    if (P.snap) L.push('Sista tillstånd:', JSON.stringify(P.snap, null, 2));
    for (const [t, k, m, d] of P.buf || []) L.push(`${t}  [${k}] ${m}${d ? '  ' + d : ''}`);
    if (P.keys) L.push('Tangenter: ' + P.keys.join(' | '));
  }
  return L.join('\n');
}
function logExport() {
  logEv('logg', 'exporterad');
  const txt = logText(), d = new Date(), pad = n => String(n).padStart(2, '0');
  const name = `turbo-logg-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.txt`;
  let saved = false;
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); saved = true; } catch (e) { }
  try { navigator.clipboard && navigator.clipboard.writeText(txt).catch(() => { }); } catch (e) { }
  logToast(saved ? `📋 Loggen sparad: ${name} (finns i Hämtade filer och är kopierad)` : '📋 Loggen är kopierad – klistra in den i chatten');
  return txt;
}
function logToast(msg) {
  let el = document.getElementById('log-toast');
  if (!el) { el = document.createElement('div'); el.id = 'log-toast'; el.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:50;background:#1a1033;color:#fff;border:3px solid #ffd600;border-radius:14px;padding:10px 18px;font:bold 18px Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);max-width:90vw;text-align:center'; document.body.appendChild(el); }
  el.textContent = msg; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 4500);
}
