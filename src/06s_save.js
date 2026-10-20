// ===================== SPARA / LADDA SPEL + PÅGÅENDE TURNERING =====================
// Allt sparas löpande i webbläsaren. "Spara spel" lägger dessutom allt i en fil man själv väljer var den hamnar
// (säkerhetskopia, flytt till en annan dator/iPad eller till den publicerade versionen). "Ladda spel" läser in en sådan fil.
const SAVE_FORMAT = 1;

// ---------- pågående turnering (sparas automatiskt i profilen) ----------
function cupSaveNow(nextIdx) {
  if (!CUP.active || !CUP.tracks) return;
  PROF.cupSave = PROF.cupSave || {};
  PROF.cupSave[pkey()] = { idx: nextIdx != null ? nextIdx : CUP.idx, diff: CUP.diff, me: CUP.me, opps: CUP.opps, pts: CUP.pts, last: CUP.last, tracks: CUP.tracks.map(t => t.id), at: Date.now() };
  saveProf(); logEv('turnering', 'sparad', { bana: (nextIdx != null ? nextIdx : CUP.idx) + 1, av: CUP.tracks.length });
}
function cupSaveClear() { if (PROF.cupSave && PROF.cupSave[pkey()]) { delete PROF.cupSave[pkey()]; saveProf(); } }
function cupSaved() { const s = PROF.cupSave && PROF.cupSave[pkey()]; return s && s.tracks && s.idx < s.tracks.length + 1 ? s : null; }
function cupResume() {
  const s = cupSaved(); if (!s) return startCup();
  const byId = id => id === FINAL_DEF.id ? FINAL_DEF : TRACK_DEFS.find(t => t.id === id);
  CUP.active = true; CUP.idx = s.idx; CUP.diff = s.diff; CUP.me = s.me; CUP.opps = s.opps; CUP.pts = s.pts; CUP.last = s.last;
  CUP.tracks = s.tracks.map(byId).filter(Boolean); SHOW.nick = {};
  CUP.racers = [{ key: 'me', name: CUP.me.name, fig: CUP.me.fig, d: styledCar(CUP.me.car, CUP.me.paint, CUP.me.sticker) }, ...CUP.opps.map(o => ({ key: o.name, name: o.name, fig: o.fig, d: DRIVERS[o.car] || DRIVERS[0] }))];
  SEL.mode = 'cup'; SEL.diff = CUP.diff; logEv('turnering', 'fortsätter', { bana: CUP.idx + 1 });
  if (CUP.idx >= CUP.tracks.length) return showCupFinal();
  runCupRace();
}
// Klick på TURNERING: finns en sparad turnering får man välja att fortsätta eller börja om
function cupEntry() {
  const s = cupSaved(); if (!s) { SEL.mode = 'cup'; return goDrivers(); }
  const myPts = s.pts.me || 0, best = Math.max(...Object.values(s.pts)), lead = myPts >= best && myPts > 0;
  const n = s.tracks.length, k = Math.min(s.idx + 1, n);
  $('#cr-info').innerHTML = `BANA <b>${k} AV ${n}</b> · DU HAR <b>${myPts} POÄNG</b>${lead ? ' · DU LEDER! 🥇' : ''}`;
  const d = DRIVERS[s.me.car]; $('#cr-car').textContent = d ? d.name : '';
  showScreen('cupresume');
  Voice.say(`Du har en turnering som inte är klar. Bana ${k} av ${n}. Vill du fortsätta?`, true);
}

// ---------- spara till fil ----------
function saveData() {
  let showMem = null; try { showMem = JSON.parse(localStorage.getItem('turbo_show_mem') || 'null'); } catch (e) { }
  if (CUP.active) cupSaveNow();
  return { app: 'TURBO-RACE', format: SAVE_FORMAT, version: typeof TR_VERSION !== 'undefined' ? TR_VERSION : '', savedAt: new Date().toISOString(), player: G.playerName || '', prof: JSON.parse(JSON.stringify(PROF)), showMem };
}
function saveFileName() {
  const d = new Date(), p = n => String(n).padStart(2, '0'), who = (G.playerName || 'spel').replace(/[^A-ZÅÄÖa-zåäö0-9]/g, '');
  return `TURBO-RACE-${who}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
}
async function saveGame() {
  const data = saveData(), txt = JSON.stringify(data, null, 1), name = saveFileName();
  let ok = false, picked = false;
  // Chrome/Edge på dator: man väljer själv mapp och namn
  if (window.showSaveFilePicker) {
    try { const h = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'TURBO-RACE sparfil', accept: { 'application/json': ['.json'] } }] }); const w = await h.createWritable(); await w.write(txt); await w.close(); ok = true; picked = true; }
    catch (e) { if (e && e.name === 'AbortError') { logToast('Inget sparades.'); return false; } }
  }
  // annars (Safari, iPad, Firefox): vanlig nedladdning
  if (!ok) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); ok = true; } catch (e) { } }
  logEv('spara', ok ? 'sparat till fil' : 'misslyckades', name);
  if (ok) { Snd.play('star'); Voice.say('Spelet är sparat!', true); logToast(picked ? '💾 SPARAT! ✔' : `💾 SPARAT! Filen ${name} finns i Hämtade filer.`); }
  else logToast('Det gick inte att spara. Försök igen.');
  return ok;
}

// ---------- ladda från fil ----------
let LOADING = null;
function loadGamePick() { const inp = $('#load-file'); inp.value = ''; inp.click(); }
function loadGameFile(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    let data = null; try { data = JSON.parse(r.result); } catch (e) { }
    if (!data || data.app !== 'TURBO-RACE' || !data.prof || typeof data.prof.players !== 'object') { Snd.play('buzz'); logToast('Det där är ingen TURBO-RACE-sparfil.'); Voice.say('Det där är ingen sparfil.', true); logEv('ladda', 'fel filtyp', file.name); return; }
    LOADING = data; showLoadConfirm(data, file.name);
  };
  r.readAsText(file);
}
function showLoadConfirm(data, fname) {
  const P = data.prof, who = data.player && P.players[data.player] ? data.player : (P.names && P.names[0]) || '', pd = P.players[who || '_'] || {};
  const when = data.savedAt ? new Date(data.savedAt).toLocaleString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '?';
  const cups = (P.cups && P.cups[who]) || 0, cs = P.cupSave && P.cupSave[who || '_'];
  const rows = [
    `<div class="ld-name">${esc(who || 'SPELARE')}</div>`,
    `<div>🪙 ${pd.coins || 0} MYNT${cups ? ` · 🏆 ${cups}` : ''}${pd.license ? ' · 🪪 KÖRKORT' : ''}</div>`,
    cs ? `<div>🏁 TURNERING PÅGÅR: BANA ${Math.min(cs.idx + 1, cs.tracks.length)} AV ${cs.tracks.length}</div>` : '',
    (P.names || []).length > 1 ? `<div class="ld-small">SPELARE I FILEN: ${(P.names || []).map(esc).join(', ')}</div>` : '',
    `<div class="ld-small">SPARAD ${esc(when)} · ${esc(fname || '')}</div>`,
  ];
  $('#ld-info').innerHTML = rows.join('');
  showScreen('load'); Voice.say(`Vill du ladda ${who ? who.toLowerCase() + 's' : 'det här'} spel?`, true);
}
function loadGameApply() {
  const data = LOADING; if (!data) return; LOADING = null;
  try { localStorage.setItem('turbo_prof_backup', JSON.stringify({ at: Date.now(), prof: PROF })); } catch (e) { }
  for (const k of Object.keys(PROF)) delete PROF[k];
  Object.assign(PROF, { names: [], medals: {}, cups: {}, players: {}, opps: [] }, data.prof);
  saveProf();
  if (data.showMem) try { localStorage.setItem('turbo_show_mem', JSON.stringify(data.showMem)); SHOW.mem = null; } catch (e) { }
  const who = data.player && PROF.names.includes(data.player) ? data.player : (PROF.names[0] || '');
  G.playerName = who; CUP.active = false; logEv('ladda', 'inläst', { spelare: who, sparad: data.savedAt });
  Snd.play('fanfar'); Voice.say(who ? `Välkommen tillbaka, ${who.toLowerCase()}!` : 'Spelet är laddat!', true);
  logToast('📂 SPELET ÄR LADDAT! ✔');
  buildTitle(); buildNameScreen(); goHub();
  if (cupSaved()) setTimeout(() => { if (curScreen === 'hub') cupEntry(); }, 900);
}
// ångra senaste laddning (från föräldravyn)
function loadUndoAvailable() { try { return !!localStorage.getItem('turbo_prof_backup'); } catch (e) { return false; } }
function loadUndo() {
  let b = null; try { b = JSON.parse(localStorage.getItem('turbo_prof_backup') || 'null'); } catch (e) { }
  if (!b || !b.prof) return false;
  for (const k of Object.keys(PROF)) delete PROF[k]; Object.assign(PROF, b.prof); saveProf();
  try { localStorage.removeItem('turbo_prof_backup'); } catch (e) { }
  logEv('ladda', 'ångrad'); logToast('↩ Tillbaka till hur det var före laddningen.'); return true;
}
function initSaveLoad() {
  $('#load-file').addEventListener('change', e => loadGameFile(e.target.files && e.target.files[0]));
  $('#ld-ok').addEventListener('click', loadGameApply);
  $('#ld-cancel').addEventListener('click', () => { LOADING = null; back(); });
  $('#cr-go').addEventListener('click', () => cupResume());
  $('#cr-new').addEventListener('click', () => { cupSaveClear(); SEL.mode = 'cup'; CUP.active = false; screenStack.length = 0; screenStack.push('title', 'hub'); curScreen = null; goDrivers(); });
  $('#p-save').addEventListener('click', () => saveGame());
}
