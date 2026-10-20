// ===================== FÖRÄLDRAVY (PIN-skyddad) =====================
const LVL_NAMES = ['', 'Korta ljudenliga ord (SOL, BIL)', 'Längre ord (LEJON, LAMPA)', 'Dubbelteckning, ng, sj (KATT, SÄNG, STJÄRNA) + små bokstäver', 'Sammansatta ord (BRANDBIL, SNÖGUBBE)', 'Läsförståelse: gåtor och meningar'];
function openParent() {
  $('#pin-in').value = ''; $('#pin-msg').textContent = PROF.pin ? 'Skriv PIN-koden (4 siffror)' : 'Välj en PIN-kod för föräldravyn (4 siffror)';
  showScreen('pin'); setTimeout(() => $('#pin-in').focus(), 50);
}
function checkPin() {
  const v = $('#pin-in').value.trim();
  if (!/^\d{4}$/.test(v)) { $('#pin-msg').textContent = 'PIN-koden ska vara 4 siffror.'; Snd.play('buzz'); return; }
  if (!PROF.pin) { PROF.pin = v; saveProf(); }
  else if (PROF.pin !== v) { $('#pin-msg').textContent = 'Fel kod. Försök igen.'; $('#pin-in').value = ''; Snd.play('buzz'); return; }
  $('#pin-in').blur(); buildParent(); screenStack.pop(); showScreen('parent', false); screenStack.push('hub');
}
function trackTime(dt) {
  if (G.demo || G.paused) return; const pd = playerData(); pd.stats = pd.stats || { race: 0, city: 0, school: 0 };
  const k = G.mode === 'city' ? 'city' : G.school ? 'school' : ['race', 'countdown', 'finish', 'show'].includes(G.mode) ? 'race' : null;
  if (!k) return; pd.stats[k] += dt; G.saveT = (G.saveT || 0) + dt; if (G.saveT > 30) { G.saveT = 0; saveProf(); }
}
function buildParent() {
  const md = mathData(), mfacts = Object.values(md.facts).filter(f => f.bad > 0).sort((a, b) => (b.bad - b.ok) - (a.bad - a.ok)).slice(0, 10);
  const pd = playerData(), r = readData(), st = pd.stats || { race: 0, city: 0, school: 0 }, cd = pd.city || {};
  const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '–', min = s => Math.round(s / 60) + ' min';
  const words = Object.entries(r.words);
  const hard = words.filter(([, s]) => s.bad > 0).sort((a, b) => (b[1].bad - b[1].ok) - (a[1].bad - a[1].ok)).slice(0, 12);
  const sure = words.filter(([, s]) => s.ok >= 2 && s.bad === 0).sort((a, b) => b[1].ok - a[1].ok).slice(0, 16);
  const schoolStars = CHALLENGES.reduce((a, c) => a + (pd.school[c.id] || 0), 0);
  const golds = Object.values(PROF.medals[pkey()] || {}).filter(p => p === 1).length;
  const hist = r.history.slice(-6).map(([d, l]) => `${new Date(d).toLocaleDateString('sv-SE')}: nivå ${l}`).join(' · ') || 'Inga ändringar än';
  $('#par-body').innerHTML = `
    <div class="pgrid">
      <div class="pbox"><h3>📖 Läsning</h3>
        <div class="big">Nivå ${Math.round(r.lvl)} av 5</div><div class="muted">${LVL_NAMES[Math.round(r.lvl)]}</div>
        <table><tr><td>Läsuppgifter</td><td>${r.tasks}</td></tr><tr><td>Rätt på första försöket</td><td>${pct(r.firstOk, r.tasks)}</td></tr>
        <tr><td>Bad om uppläsning</td><td>${pct(r.helps, r.tasks)}</td></tr><tr><td>Skrivuppgifter utan fel</td><td>${r.typed.ok} av ${r.typed.tries}</td></tr>
        <tr><td>Gyllene bokstäver (${r.letter.toUpperCase()})</td><td>${r.letters}</td></tr></table>
        <div class="muted">Nivåändringar: ${hist}</div></div>
      <div class="pbox"><h3>🔢 Matte</h3>
        <div class="big">Nivå ${Math.round(md.lvl)} av 6</div><div class="muted">${MATH_NAMES[Math.round(md.lvl)]}</div>
        <table><tr><td>Mattefrågor</td><td>${md.tasks}</td></tr><tr><td>Rätt på första försöket</td><td>${pct(md.firstOk, md.tasks)}</td></tr><tr><td>Använde hjälp</td><td>${pct(md.helps, md.tasks)}</td></tr><tr><td>Valde JÄTTESVÅR</td><td>${md.hard} gånger</td></tr></table>
        <div class="chips">${mfacts.map(f => `<span class="chip bad">${f.q}</span>`).join('') || '<span class="muted">Inga svåra uppgifter än</span>'}</div>
        <div class="noprint">Mattenivå: ${[1, 2, 3, 4, 5, 6].map(l => `<button class="pbtn${Math.round(md.lvl) === l ? ' on' : ''}" data-mlvl="${l}">${l}</button>`).join('')}</div></div>
      <div class="pbox"><h3>🎮 Spel</h3><table>
        <tr><td>Tid: race & turnering</td><td>${min(st.race)}</td></tr><tr><td>Tid: Turbostaden</td><td>${min(st.city)}</td></tr><tr><td>Tid: körskolan</td><td>${min(st.school)}</td></tr>
        <tr><td>Stjärnor i körskolan</td><td>${schoolStars} av ${CHALLENGES.length * 3}</td></tr><tr><td>Leveranser i staden</td><td>${cd.deliveries || 0}</td></tr><tr><td>Guldmedaljer</td><td>${golds}</td></tr><tr><td>Mynt</td><td>${pd.coins}</td></tr></table></div>
      <div class="pbox"><h3>🔴 Ord att öva på</h3><div class="chips">${hard.map(([w, s]) => `<span class="chip bad">${w} <small>${s.ok}/${s.ok + s.bad}</small></span>`).join('') || '<span class="muted">Inga svåra ord än</span>'}</div>
        <h3>🟢 Säkra ord</h3><div class="chips">${sure.map(([w]) => `<span class="chip ok">${w}</span>`).join('') || '<span class="muted">Samlas in när han spelar</span>'}</div></div>
      <div class="pbox noprint"><h3>⚙️ Inställningar</h3>
        <label>Veckans bokstav <input id="par-letter" maxlength="1" value="${r.letter.toUpperCase()}"></label>
        <label>Egna ord (för skrivuppdrag, t.ex. veckans ord från skolan)<textarea id="par-custom" rows="2">${r.custom.join(', ')}</textarea></label>
        <div>Läsnivå: ${[1, 2, 3, 4, 5].map(l => `<button class="pbtn${Math.round(r.lvl) === l ? ' on' : ''}" data-lvl="${l}">${l}</button>`).join('')} <span class="muted">(anpassas automatiskt när han spelar)</span></div>
        <div class="prow"><button class="pbtn go" id="par-save">💾 Spara</button><button class="pbtn" id="par-print">🖨️ Skriv ut sammanfattning</button><button class="pbtn" id="par-pin">🔑 Byt PIN</button><button class="pbtn go" id="par-savegame">💾 Spara spel till fil</button><button class="pbtn" id="par-loadgame">📂 Ladda spel från fil</button>${loadUndoAvailable() ? '<button class="pbtn" id="par-undo">↩ Ångra senaste laddning</button>' : ''}<button class="pbtn" id="par-log" title="Ctrl+Skift+L fungerar också, var som helst i spelet">📋 Felsökningslogg</button><button class="pbtn warn" id="par-reset">↺ Nollställ läsdata</button></div>
        <div id="par-msg" class="muted"></div></div>
    </div>`;
  const msg = s => { $('#par-msg').textContent = s; };
  document.querySelectorAll('#par-body [data-lvl]').forEach(b => b.addEventListener('click', () => { r.lvl = +b.dataset.lvl; r.streak = 0; r.miss = 0; r.history.push([Date.now(), r.lvl]); saveProf(); buildParent(); msg('Läsnivån är ändrad.'); }));
  document.querySelectorAll('#par-body [data-mlvl]').forEach(b => b.addEventListener('click', () => { md.lvl = +b.dataset.mlvl; md.streak = 0; md.miss = 0; md.history.push([Date.now(), md.lvl]); saveProf(); buildParent(); msg('Mattenivån är ändrad.'); }));
  $('#par-save').addEventListener('click', () => {
    const L = ($('#par-letter').value || 'L').toUpperCase(); if (/^[A-ZÅÄÖ]$/.test(L)) r.letter = L;
    r.custom = $('#par-custom').value.toUpperCase().split(/[\s,;]+/).map(w => w.replace(/[^A-ZÅÄÖ]/g, '')).filter(w => w.length >= 2 && w.length <= 8).slice(0, 30);
    saveProf(); buildParent(); msg('Sparat!'); Snd.play('ding');
  });
  $('#par-print').addEventListener('click', () => window.print());
  $('#par-log').addEventListener('click', () => logExport());
  $('#par-savegame').addEventListener('click', () => saveGame());
  $('#par-loadgame').addEventListener('click', () => loadGamePick());
  if ($('#par-undo')) $('#par-undo').addEventListener('click', () => { if (loadUndo()) { G.playerName = PROF.names.includes(G.playerName) ? G.playerName : (PROF.names[0] || ''); buildTitle(); buildParent(); } });
  $('#par-pin').addEventListener('click', () => { PROF.pin = null; saveProf(); openParent(); });
  $('#par-reset').addEventListener('click', () => { if (!$('#par-reset').dataset.sure) { $('#par-reset').dataset.sure = 1; $('#par-reset').textContent = 'Klicka igen för att nollställa'; return; } pd.read = null; saveProf(); buildParent(); msg('Läsdata nollställd.'); });
}
