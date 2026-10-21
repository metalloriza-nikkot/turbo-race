// ===================== MENYER & PROFILER =====================
const $ = s => document.querySelector(s);
const PROF = { names: [], medals: {}, cups: {}, players: {}, opps: [] };
try { Object.assign(PROF, JSON.parse(localStorage.getItem('turbo_prof') || '{}')); } catch (e) { }
PROF.players = PROF.players || {}; PROF.opps = PROF.opps || []; PROF.cups = PROF.cups || {}; PROF.medals = PROF.medals || {};
function saveProf() { try { localStorage.setItem('turbo_prof', JSON.stringify(PROF)); } catch (e) { } }

const SEL = { driver: 0, track: 0, diff: 1, mode: 'race' };
let curScreen = null; const screenStack = [];
const RACE_COINS = [10, 8, 6, 4, 3], CUP_BONUS = [50, 30, 20];

function pkey() { return G.playerName || '_'; }
function playerData() {
  const k = pkey();
  if (!PROF.players[k]) PROF.players[k] = { fig: k === '_' ? Object.assign({}, DEFAULT_FIG) : randomFig(), coins: 0, owned: { paint: ['std'], sticker: ['none'], horn: ['tut'] }, equip: { paint: 'std', sticker: 'none', horn: 'tut' }, school: {}, license: null, ghost: null };
  const p = PROF.players[k]; p.owned = p.owned || { paint: ['std'], sticker: ['none'], horn: ['tut'] }; p.equip = p.equip || { paint: 'std', sticker: 'none', horn: 'tut' }; p.school = p.school || {}; p.coins = p.coins || 0;
  return p;
}
function playerRacer() { const pd = playerData(); return { car: SEL.driver, name: G.playerName || 'DU', fig: pd.fig, paint: pd.equip.paint, sticker: pd.equip.sticker, horn: pd.equip.horn }; }
function shuffle(a) { return a.slice().sort(() => Math.random() - 0.5); }
function pickOpps(myCar) {
  const chars = [...shuffle(PROF.opps), ...shuffle(PREMADE)].slice(0, 4);
  const used = new Set([myCar]);
  return chars.map(ch => { let car = DRIVERS.findIndex(d => d.id === ch.car); if (car < 0 || used.has(car)) car = shuffle(DRIVERS.map((_, i) => i).filter(i => !used.has(i)))[0]; used.add(car); return { car, name: ch.name, fig: ch.fig }; });
}
function addCoins(n) { if (n <= 0) return; const pd = playerData(); pd.coins += n; saveProf(); }

function showScreen(id, push = true) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $('#ui').classList.add('on');
  const s = $('#scr-' + id); s.classList.add('on'); logEv('meny', id);
  if (push && curScreen && curScreen !== id) screenStack.push(curScreen);
  curScreen = id;
  const first = s.querySelector('[data-default]') || s.querySelector('.nav');
  if (first) setTimeout(() => focusEl(first, true), 30);
  if (s.dataset.say) Voice.say(s.dataset.say);
  s.scrollTop = 0; fitScreen(); setTimeout(moreHint, 80);
}
function hideUI() { document.querySelectorAll('.screen').forEach(s => s.classList.remove('on')); $('#ui').classList.remove('on'); curScreen = null; moreHint(); }
function back() {
  if (curScreen === 'pause') { resume(); return; }
  if (curScreen === 'bname' && BUILDER) { Snd.play('back'); bNameBack(); return; }
  if (!screenStack.length) return; Snd.play('back'); const p = screenStack.pop(); refreshScreen(p); showScreen(p, false);
}
function refreshScreen(id) { if (id === 'hub') buildHub(); if (id === 'title') buildTitle(); if (id === 'school') buildSchool(); if (id === 'city') buildCityMenu(); if (id === 'garage') buildGarage(); if (id === 'opps') buildOpps(); if (id === 'shop') buildShop(); if (id === 'build') buildBuilderMenu(); }
// Rulla fram knappen om den ligger utanför den skrollbara skärmen (piltangenter/handkontroll)
function scrollToEl(el) { const scr = el.closest && el.closest('.screen'); if (!scr || scr.scrollHeight <= scr.clientHeight + 2) return; const r = el.getBoundingClientRect(), sr = scr.getBoundingClientRect(), pad = 70; if (r.top < sr.top + pad || r.bottom > sr.bottom - pad) scr.scrollBy({ top: r.top < sr.top + pad ? r.top - sr.top - pad - 20 : r.bottom - sr.bottom + pad + 20, behavior: 'smooth' }); }
// Skärmen får plats: krymper innehållet (zoom, ner till 68 %) om det inte ryms. Räcker inte det kan man skrolla,
// och knappraden (.actions) och TILLBAKA ligger kvar i bild.
function fitScreen() {
  const s = curScreen && $('#scr-' + curScreen); if (!s || !s.classList.contains('on')) return;
  const kids = [...s.children].filter(k => !k.classList.contains('backbtn'));
  kids.forEach(k => { k.style.zoom = ''; });
  const have = s.clientHeight, need = s.scrollHeight;
  if (need > have + 1) {
    let z = Math.max(0.68, have / need); kids.forEach(k => { k.style.zoom = z; });
    for (let i = 0; i < 4; i++) { const n2 = s.scrollHeight; if (n2 <= have + 1 || z <= 0.68) break; z = Math.max(0.68, z * (have / n2) - 0.01); kids.forEach(k => { k.style.zoom = z; }); }
    s.dataset.zoom = z.toFixed(2);
  } else delete s.dataset.zoom;
  moreHint();
}
let fitPending = false; function fitSoon() { if (fitPending) return; fitPending = true; requestAnimationFrame(() => { fitPending = false; fitScreen(); }); }
function moreHint() { const h = $('#more-hint'); if (!h) return; const scr = curScreen && $('#scr-' + curScreen); h.classList.toggle('on', !!(scr && scr.classList.contains('on') && scr.scrollHeight - scr.clientHeight - scr.scrollTop > 40)); h.classList.toggle('up', !!(scr && scr.querySelector('.actions'))); }
function focusEl(el, silent) { if (!el) return; el.focus({ preventScroll: true }); scrollToEl(el); setTimeout(moreHint, 400); if (!silent) Snd.play('move'); if (el.dataset.say) Voice.say(el.dataset.say); }

// spatial navigering med piltangenter
function navMove(dir) {
  const scr = $('#scr-' + curScreen); if (!scr) return;
  const els = [...scr.querySelectorAll('.nav'), ...document.querySelectorAll('#topbar .nav')].filter(e => e.offsetParent !== null);
  const cur = document.activeElement; if (!els.includes(cur)) { focusEl(els[0]); return; }
  const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
  let best = null, bs = 1e9;
  for (const e of els) {
    if (e === cur) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - cx, dy = y - cy;
    let main, side;
    if (dir === 'left') { main = -dx; side = Math.abs(dy); } else if (dir === 'right') { main = dx; side = Math.abs(dy); } else if (dir === 'up') { main = -dy; side = Math.abs(dx); } else { main = dy; side = Math.abs(dx); }
    if (main <= 5) continue; const sc = main + side * 2.2; if (sc < bs) { bs = sc; best = e; }
  }
  if (best) focusEl(best);
}
function mkBtn(cls, html, say, onClick) { const b = document.createElement('button'); b.className = 'nav ' + cls; b.innerHTML = html; b.dataset.say = say || ''; b.addEventListener('click', () => { Snd.init(); Snd.play('click'); onClick(b); }); b.addEventListener('mouseenter', () => { if (document.activeElement !== b) focusEl(b, true); }); return b; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
// levande ansikten (ritas om varje bildruta när de syns)
function faceCanvas(fig, size) { const c = document.createElement('canvas'); c.width = c.height = size * 2; c.className = 'facecv'; c.style.width = c.style.height = size + 'px'; c._fig = fig; return c; }
// bilarna i resultatlistan: snett framifrån, gungar sakta
function drawLiveCars(t) { document.querySelectorAll('.screen.on canvas.carcv').forEach(cv => { if (!cv._d) return; const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.translate(cv.width / 2 - 8, cv.height * 0.78); c.scale(1.4, 1.4); drawCarFront(c, cv._d, t + cv._k * 0.7, { speed: cv._k === 0 ? 1.1 : 0.7 }); }); }
function drawLiveFaces(t) { document.querySelectorAll('.screen.on canvas.facecv').forEach(cv => { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); drawFace(c, cv._fig, cv.width / 2, cv.height / 2, cv.width / 2 - 4, t); }); }

// ---------- Startskärm: välj spelare ----------
function buildTitle() {
  $('#ver').textContent = TR_VERSION;
  const row = $('#name-row'); row.innerHTML = '';
  for (const n of PROF.names) {
    const pd = PROF.players[n]; const cups = PROF.cups[n] || 0;
    const b = mkBtn('big name', `<span class="nm">${esc(n)}</span>${cups ? ` <span class="cups">🏆${cups > 1 ? '×' + cups : ''}</span>` : ''}`, 'Hej ' + n.toLowerCase() + '!', () => { G.playerName = n; goHub(); });
    b.prepend(faceCanvas(pd ? pd.fig : DEFAULT_FIG, 56)); row.appendChild(b);
  }
  const play = mkBtn('big go', '<span class="ico">▶</span>SPELA', 'Spela', () => { G.playerName = ''; goHub(); });
  if (!PROF.names.length) play.dataset.default = '1'; else row.firstChild.dataset.default = '1';
  row.appendChild(play);
  row.appendChild(mkBtn('small', '📂 LADDA SPEL', 'Ladda spel från en fil', () => loadGamePick()));
  row.appendChild(mkBtn('small', '＋ NY SPELARE', 'Ny spelare. Skriv ditt namn', () => { showScreen('name'); $('#name-in').value = ''; setTimeout(() => $('#name-in').focus(), 60); }));
}
function buildNameScreen() {
  const list = $('#name-list'); list.innerHTML = '';
  for (const n of PROF.names) list.appendChild(mkBtn('small del', '✖ ' + esc(n), 'Ta bort ' + n.toLowerCase(), () => { PROF.names = PROF.names.filter(x => x !== n); saveProf(); buildNameScreen(); buildTitle(); }));
}
function saveName() {
  const v = $('#name-in').value.trim().toUpperCase().slice(0, 12); if (!v) return;
  const isNew = !PROF.names.includes(v);
  if (isNew) PROF.names.unshift(v); PROF.names = PROF.names.slice(0, 8);
  G.playerName = v; playerData(); saveProf(); buildTitle(); buildNameScreen(); $('#name-in').blur();
  Voice.say('Hej ' + v.toLowerCase() + '! Bygg din förare!', true);
  screenStack.length = 0; screenStack.push('title'); curScreen = null; buildHub(); screenStack.push('hub');
  openFigEditor('player');
}

// ---------- Huvudmeny ----------
function buildHub() {
  const pd = playerData();
  const hd = $('#hub-head'); hd.innerHTML = ''; hd.appendChild(faceCanvas(pd.fig, 120));
  const info = document.createElement('div'); info.className = 'hubinfo'; info.innerHTML = `<div class="hubname">${esc(G.playerName || 'SPELARE')}</div><div class="coins">🪙 ${pd.coins}</div>`; hd.appendChild(info);
  const g = $('#hub-grid'); g.innerHTML = '';
  const add = (ico, lbl, say, fn, cls = '') => { const b = mkBtn('card hub ' + cls, `<div class="bigico">${ico}</div><div class="lbl">${lbl}</div>`, say, fn); g.appendChild(b); return b; };
  add('🏁', 'RACE', 'Race', () => { SEL.mode = 'race'; SEL.fixedTrack = null; goDrivers(); }, 'go').dataset.default = '1';
  add('🏆', 'TURNERING', 'Turnering! Kör alla banor och vinn pokalen!', () => cupEntry(), 'gold');
  if (cupSaved()) g.lastChild.insertAdjacentHTML('beforeend', '<div class="badge">PÅGÅR</div>');
  add('🏙️', 'STADEN', 'Turbostaden! Kör runt i staden och gör uppdrag.', () => { buildCityMenu(); showScreen('city'); }, 'gold');
  add('🚦', 'SKOLAN', 'Körskolan', () => { buildSchool(); showScreen('school'); });
  add('🛠️', 'BYGG BANA', 'Bygg en egen bana!', () => openBuilderMenu());
  add('🚗', 'GARAGET', 'Mitt garage. Figur, butik och motståndare.', () => { buildGarage(); showScreen('garage'); });
  add('💾', 'SPARA SPEL', 'Spara spel', () => saveGame(), 'mini');
  add('📂', 'LADDA SPEL', 'Ladda spel', () => loadGamePick(), 'mini');
  add('🔒', 'VUXEN', 'För föräldrar', () => openParent(), 'mini');
}
function buildGarage() {
  const pd = playerData(), g = $('#garage-grid'); g.innerHTML = '';
  const add = (ico, lbl, say, fn) => { const b = mkBtn('card hub', `<div class="bigico">${ico}</div><div class="lbl">${lbl}</div>`, say, fn); g.appendChild(b); return b; };
  add('👤', 'MIN FIGUR', 'Min figur', () => openFigEditor('player')).dataset.default = '1';
  add('🛒', 'BUTIK', 'Butiken', () => { SEL.shopTab = SEL.shopTab || 'paint'; buildShop(); showScreen('shop'); });
  add('👥', 'MOTSTÅNDARE', 'Motståndare', () => { buildOpps(); showScreen('opps'); });
  if (pd.license) add('🪪', 'KÖRKORT', 'Mitt körkort', () => showLicense());
}
function goHub() { buildHub(); screenStack.length = 0; screenStack.push('title'); curScreen = null; showScreen('hub'); }

// ---------- Figurbyggare ----------
const FE = { mode: 'player', fig: null, name: '', car: 0, idx: -1 };
function openFigEditor(mode, idx = -1) {
  FE.mode = mode; FE.idx = idx;
  if (mode === 'player') { FE.fig = Object.assign({}, DEFAULT_FIG, playerData().fig); }
  else if (idx >= 0) { const o = PROF.opps[idx]; FE.fig = Object.assign({}, o.fig); FE.name = o.name; FE.car = Math.max(0, DRIVERS.findIndex(d => d.id === o.car)); }
  else { FE.fig = randomFig(); FE.name = ''; FE.car = Math.floor(Math.random() * DRIVERS.length); }
  buildFigEditor(); showScreen('fig');
  if (mode === 'opp' && idx < 0) setTimeout(() => $('#opp-name').focus(), 80);
}
function buildFigEditor() {
  $('#fig-title').textContent = FE.mode === 'player' ? 'MIN FIGUR' : (FE.idx >= 0 ? 'ÄNDRA MOTSTÅNDARE' : 'NY MOTSTÅNDARE');
  $('#opp-name-row').style.display = FE.mode === 'opp' ? '' : 'none'; $('#opp-name').value = FE.name || '';
  const rows = $('#fig-rows'); rows.innerHTML = '';
  const mkRow = (label, say, get, n, set, nameOf) => {
    const r = document.createElement('div'); r.className = 'figrow';
    const lab = document.createElement('div'); lab.className = 'figlbl';
    const upd = () => { lab.innerHTML = `<small>${label}</small>${nameOf(get())}`; };
    const change = d => { set((get() + d + n) % n); upd(); Voice.say(nameOf(get()).replace(/<[^>]+>/g, '')); };
    r.appendChild(mkBtn('arrow', '◀', say, () => change(-1))); r.appendChild(lab); r.appendChild(mkBtn('arrow', '▶', say, () => change(1)));
    upd(); rows.appendChild(r);
  };
  for (const k of FIG_KEYS) { const o = FIG_OPT[k]; mkRow(o.label, o.say, () => FE.fig[k] || 0, o.names.length, v => { FE.fig[k] = v; }, v => o.names[v]); }
  if (FE.mode === 'opp') mkRow('BIL', 'Bil', () => FE.car, DRIVERS.length, v => { FE.car = v; }, v => DRIVERS[v].name);
  $('#fig-del').style.display = FE.mode === 'opp' && FE.idx >= 0 ? '' : 'none';
  const fb = rows.querySelector('.figrow .nav:last-child'); if (fb) fb.dataset.default = '1';
}
function figDone() {
  if (FE.mode === 'player') { playerData().fig = FE.fig; saveProf(); Voice.say('Snygg förare!', true); buildTitle(); back(); return; }
  const name = ($('#opp-name').value || '').trim().toUpperCase().slice(0, 12); if (!name) { Snd.play('buzz'); Voice.say('Skriv ett namn först!', true); $('#opp-name').focus(); return; }
  const o = { name, fig: FE.fig, car: DRIVERS[FE.car].id };
  if (FE.idx >= 0) PROF.opps[FE.idx] = o; else PROF.opps.push(o);
  saveProf(); Voice.say(name.toLowerCase() + ' är med i racet!', true); buildOpps(); back();
}
function drawFigPreview(t) {
  const cv = $('#fig-canvas'); const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.save(); c.translate(cv.width / 2, cv.height * 0.42); drawFigure(c, FE.fig, cv.width * 0.24, t); c.restore();
  if (FE.mode === 'opp') { c.save(); c.translate(cv.width / 2, cv.height * 0.9); c.scale(1.3, 1.3); drawCar(c, DRIVERS[FE.car], t); c.restore(); }
}

// ---------- Motståndare ----------
function buildOpps() {
  const g = $('#opps-grid'); g.innerHTML = '';
  const ttl = t => { const d = document.createElement('div'); d.className = 'optitle'; d.textContent = t; g.appendChild(d); };
  ttl('DINA MOTSTÅNDARE');
  PROF.opps.forEach((o, i) => { const b = mkBtn('card opp mine', `<div class="lbl">${esc(o.name)}</div><div class="sub">ÄNDRA ✏️</div>`, o.name.toLowerCase(), () => openFigEditor('opp', i)); b.prepend(faceCanvas(o.fig, 110)); g.appendChild(b); });
  const add = mkBtn('card opp add', '<div class="bigico">＋</div><div class="lbl">NY</div><div class="sub">T.EX. FARFAR!</div>', 'Ny motståndare', () => openFigEditor('opp', -1)); add.dataset.default = '1'; g.appendChild(add);
  ttl('FÄRDIGA FÖRARE');
  PREMADE.forEach(o => { const b = mkBtn('card opp pre', `<div class="lbl">${esc(o.name)}</div>`, o.name.toLowerCase(), () => { Snd.play('boing'); }); b.prepend(faceCanvas(o.fig, 110)); g.appendChild(b); });
}

// ---------- Butik ----------
function buildShop() {
  const pd = playerData(); const tab = SEL.shopTab || 'paint';
  $('#shop-coins').textContent = '🪙 ' + pd.coins;
  document.querySelectorAll('#shop-tabs .nav').forEach(b => b.classList.toggle('sel', b.dataset.tab === tab));
  const g = $('#shop-grid'); g.innerHTML = '';
  for (const it of SHOP[tab]) {
    const owned = pd.owned[tab].includes(it.id), eq = pd.equip[tab] === it.id;
    let sw = '';
    if (tab === 'paint') sw = `<div class="swatch" style="background:${it.col === 'rainbow' ? 'linear-gradient(90deg,red,orange,yellow,lime,cyan,blue,violet)' : it.col || DRIVERS[SEL.driver].color}"></div>`;
    else if (tab === 'horn') sw = `<div class="swatch ico">📯</div>`;
    else sw = `<canvas class="stk" width="80" height="80" data-stk="${it.id}"></canvas>`;
    const state = eq ? '<div class="price eq">✔ PÅ</div>' : owned ? '<div class="price own">ANVÄND</div>' : `<div class="price">🪙 ${it.price}</div>`;
    const b = mkBtn('card shopitem' + (eq ? ' eq' : ''), `${sw}<div class="lbl">${it.name}</div>${state}`, it.name.toLowerCase() + (owned ? '' : ', kostar ' + it.price + ' mynt'), () => shopClick(tab, it));
    if (eq) b.dataset.default = '1';
    g.appendChild(b);
  }
  g.querySelectorAll('canvas.stk').forEach(cv => { const c = cv.getContext('2d'); c.translate(40, 40); c.scale(3.2, 3.2); c.translate(-15, 0); if (cv.dataset.stk === 'flames') c.translate(0, 0); drawSticker(c, cv.dataset.stk, 0); if (cv.dataset.stk === 'none') { c.strokeStyle = '#999'; c.lineWidth = 1.5; c.beginPath(); c.arc(15, 0, 8, 0, TAU); c.moveTo(9, -6); c.lineTo(21, 6); c.stroke(); } });
}
function shopClick(tab, it) {
  const pd = playerData();
  if (tab === 'horn') Snd.horn(it.id);
  if (!pd.owned[tab].includes(it.id)) {
    const c = pd.coins, p = it.price, lv = mathData().lvl, back = () => { buildShop(); screenStack.length = 0; screenStack.push('title', 'hub', 'garage'); curScreen = null; showScreen('shop', false); const f = [...document.querySelectorAll('#shop-grid .nav')].find(b => b.textContent.includes(it.name)); if (f) f.focus(); };
    const canAsk = (lv >= 5 && c <= 500) || (lv >= 3 && c <= 100) || (lv >= 2 && c <= 20);
    if (c < p) {
      if (canAsk) return mathQuiz({ title: '🛒 BUTIKEN', story: `DU HAR ${c} 🪙. ${it.name} KOSTAR ${p} 🪙. HUR MÅNGA FLER BEHÖVER DU?`, sayFirst: `Du har ${c} mynt. Det kostar ${p}. Hur många fler behöver du?`, q: { q: `${p} − ${c}`, ans: p - c, say: `${p} minus ${c}`, op: '−', a: p, b: c, key: `${p}-${c}` }, reward: 0, onDone: back });
      Snd.play('buzz'); Voice.say(`Du behöver ${p - c} mynt till. Kör race eller körskolan!`, true); return;
    }
    const buy = () => { pd.coins -= p; pd.owned[tab].push(it.id); pd.equip[tab] = it.id; saveProf(); Snd.play('buy'); };
    if (canAsk) return mathQuiz({ title: '🛒 BUTIKEN', story: `DU HAR ${c} 🪙. ${it.name} KOSTAR ${p} 🪙. HUR MÅNGA HAR DU KVAR?`, sayFirst: `Du har ${c} mynt. Det kostar ${p}. Hur många har du kvar?`, q: { q: `${c} − ${p}`, ans: c - p, say: `${c} minus ${p}`, op: '−', a: c, b: p, key: `${c}-${p}` }, reward: 2, onDone: () => { buy(); Voice.say('Köpt!', true); back(); } });
    pd.coins -= p; pd.owned[tab].push(it.id); Snd.play('buy'); Voice.say('Köpt!', true);
  }
  pd.equip[tab] = it.id; saveProf(); buildShop();
  const f = [...document.querySelectorAll('#shop-grid .nav')].find(b => b.textContent.includes(it.name)); if (f) f.focus();
}
function drawShopPreview(t) {
  const cv = $('#shop-car'); const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  const pd = playerData(); const d = styledCar(SEL.driver, pd.equip.paint, pd.equip.sticker);
  // dekaler syns bäst ovanifrån, lack och resten snett framifrån
  if (SEL.shopTab === 'sticker') { c.save(); c.translate(cv.width / 2, cv.height / 2); c.rotate(-Math.PI / 2 + Math.sin(t) * 0.2); c.scale(3, 3); drawCar(c, d, t); c.restore(); return; }
  c.save(); c.translate(cv.width / 2 - 4, cv.height * 0.7); c.scale(2.75, 2.75); drawCarFront(c, d, t, { speed: 0.8 }); c.restore();
  c.save(); c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(44, 44, 36, 0, TAU); c.fill(); c.translate(44, 44); c.rotate(-Math.PI / 2); c.scale(0.8, 0.8); drawCar(c, d, t); c.restore();
}

// ---------- Förare/bil ----------
const previewCanvases = [];
function buildDrivers() {
  const g = $('#driver-grid'); g.innerHTML = '';
  DRIVERS.forEach((d, i) => {
    const b = mkBtn('card', `<canvas width="240" height="200"></canvas><div class="lbl">${d.name}</div>${d.by ? `<div class="by">DESIGN: ${d.by}</div>` : ''}`, d.say + (d.by ? ` Designad av ${d.by.toLowerCase()}.` : ''), () => { SEL.driver = i; if (SEL.mode === 'cup') { SEL.track = -1; goDiff(); } else if (SEL.fixedTrack) { const k = allTracks().findIndex(t => t.id === SEL.fixedTrack); SEL.fixedTrack = null; if (k >= 0) { SEL.track = k; goDiff(); } else goTracks(); } else goTracks(); });
    b.style.setProperty('--c', d.type === 'police' ? '#1f5fd6' : d.color === '#23262f' ? '#35d0ff' : d.color); if (d.type === 'jeep') b.querySelector('.lbl').style.fontSize = '24px';
    g.appendChild(b); previewCanvases.push({ el: b.querySelector('canvas'), kind: 'car', i, btn: b });
  });
}
function goDrivers() { [...document.querySelectorAll('#driver-grid .card')].forEach((b, i) => { if (i === SEL.driver) b.dataset.default = '1'; else delete b.dataset.default; }); showScreen('driver'); }

// ---------- Banor ----------
function buildTracks() {
  const g = $('#track-grid'); g.innerHTML = '';
  for (let k = previewCanvases.length - 1; k >= 0; k--) if (previewCanvases[k].kind === 'track') previewCanvases.splice(k, 1);
  allTracks().forEach((t, i) => {
    const b = mkBtn('card wide' + (t.own ? ' own' : ''), `<canvas width="320" height="220"></canvas><div class="lbl"><span class="ico">${t.icon}</span> ${esc(t.name)}</div><div class="medal"></div>${t.own ? '<div class="badge">MIN BANA</div>' : ''}`, t.say + (t.own ? '. Din egen bana!' : ''), () => { SEL.track = i; goDiff(); });
    b.dataset.idx = i; g.appendChild(b); previewCanvases.push({ el: b.querySelector('canvas'), kind: 'track', def: t, btn: b, drawn: false });
  });
}
function goTracks() {
  buildTracks(); const med = (PROF.medals[pkey()] || {}), all = allTracks();
  if (SEL.track >= all.length) SEL.track = 0;
  [...document.querySelectorAll('#track-grid .card')].forEach(b => { const i = +b.dataset.idx; const p = all[i] && med[all[i].id]; b.querySelector('.medal').textContent = p ? ['🥇', '🥈', '🥉', '⭐', '⭐'][p - 1] : ''; if (i === SEL.track) b.dataset.default = '1'; else delete b.dataset.default; });
  showScreen('track');
}
function drawTrackPreview(cv, def) {
  const T = getTrack(def); const c = cv.getContext('2d'); const w = cv.width, h = cv.height;
  const bg = { wood: '#c99a66', sand: '#f4d9a0', snow: '#eef6ff', rock: '#3b2e2c', moon: '#8a8fa3', city: '#c9cdd2', grass: '#7cb342', marble: '#e8e2d6' }[def.theme.ground];
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  const bb = T.bb, pad = 30, sc = Math.min((w - pad * 2) / (bb.maxX - bb.minX), (h - pad * 2) / (bb.maxY - bb.minY));
  c.save(); c.translate(w / 2 - (bb.minX + bb.maxX) / 2 * sc, h / 2 - (bb.minY + bb.maxY) / 2 * sc); c.scale(sc, sc);
  if (def.special.includes('ocean')) { c.fillStyle = '#29b6f6'; c.fillRect(bb.minX - 2000, bb.maxY + T.hw + 150, 8000, 2000); }
  for (const s of T.special) { if (s.kind === 'lake') { c.fillStyle = '#8ec5ea'; c.beginPath(); c.ellipse(s.x, s.y, s.r, s.r * 0.75, 0.2, 0, TAU); c.fill(); } if (s.kind === 'volcano') { c.fillStyle = '#5d4037'; c.beginPath(); c.arc(s.x, s.y, s.r * 0.8, 0, TAU); c.fill(); c.fillStyle = '#ff9800'; c.beginPath(); c.arc(s.x, s.y, s.r * 0.3, 0, TAU); c.fill(); } if (s.kind === 'base') { c.fillStyle = '#4fc3f7'; c.beginPath(); c.arc(s.x, s.y, s.r * 0.5, 0, TAU); c.fill(); } if (s.kind === 'park') { c.fillStyle = '#7cb342'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); } if (s.kind === 'rug') { c.fillStyle = '#3f51b5'; c.beginPath(); c.ellipse(s.x, s.y, s.r, s.r * 0.8, 0, 0, TAU); c.fill(); } }
  const bid = def.base || def.id;
  if (bid === 'sno') for (const o of T.decor) if (o.kind === 'pine') { c.fillStyle = '#2e7d32'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, TAU); c.fill(); }
  if (bid === 'stad') for (const o of T.decor) if (o.kind === 'house') { c.fillStyle = '#b0493b'; c.fillRect(o.x - o.r * 0.7, o.y - o.r * 0.5, o.r * 1.4, o.r); }
  if (bid === 'strand') for (const o of T.decor) if (o.kind === 'palm') { c.fillStyle = '#43a047'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, TAU); c.fill(); }
  c.lineJoin = 'round'; c.strokeStyle = def.theme.b1; c.lineWidth = T.hw * 2 + 90; c.stroke(T.path); c.strokeStyle = def.theme.road; c.lineWidth = T.hw * 2; c.stroke(T.path);
  c.restore();
}

// ---------- Svårighet + antal varv ----------
const LAP_CHOICES = [1, 2, 3, 4, 5, 10];
function goDiff() { buildLaps(); showScreen('diff'); }
function buildLaps() {
  const row = $('#lap-row'); row.innerHTML = '';
  const def = SEL.mode !== 'cup' && allTracks()[SEL.track];
  row.style.display = def ? '' : 'none'; if (!def) return;
  const std = def.laps || 3; if (SEL.lapsFor !== def.id) { SEL.laps = std; SEL.lapsFor = def.id; }
  const lbl = document.createElement('div'); lbl.className = 'laplbl'; lbl.textContent = '🔁 VARV:'; row.appendChild(lbl);
  for (const n of LAP_CHOICES) {
    const b = mkBtn('lapbtn' + (n === SEL.laps ? ' on' : ''), String(n), n === 1 ? 'Ett varv' : `${n} varv`, () => { SEL.laps = n; row.querySelectorAll('.lapbtn').forEach(x => x.classList.toggle('on', x.textContent === String(n))); });
    row.appendChild(b);
  }
}
function buildDiff() {
  const g = $('#diff-grid'); g.innerHTML = '';
  DIFFS.forEach((d, i) => { const b = mkBtn('card diff', `<div class="bigico">${d.icon}</div><div class="lbl">${d.name}</div>`, d.say, () => { SEL.diff = i; beginRace(); }); if (i === SEL.diff) b.dataset.default = '1'; g.appendChild(b); });
}
function beginRace() {
  if (SEL.mode === 'cup') { if (!CUP.active) return startCup(); return runCupRace(); }
  CUP.active = false; hideUI(); Voice.stop();
  const def = allTracks()[SEL.track] || TRACK_DEFS[0];
  startRace(def, { me: playerRacer(), opps: pickOpps(SEL.driver), diff: DIFFS[SEL.diff], laps: SEL.lapsFor === def.id ? SEL.laps : 0 });
  setTimeout(() => Voice.say(def.say + '! Gör dig redo!', true), 150);
}

// ---------- Turnering ----------
const CUP = { active: false };
const CUP_PTS = [10, 8, 6, 4, 2];
function startCup() {
  CUP.active = true; CUP.idx = 0; CUP.diff = SEL.diff; CUP.me = playerRacer(); CUP.opps = pickOpps(SEL.driver);
  CUP.racers = [{ key: 'me', name: CUP.me.name, fig: CUP.me.fig, d: styledCar(CUP.me.car, CUP.me.paint, CUP.me.sticker) }, ...CUP.opps.map(o => ({ key: o.name, name: o.name, fig: o.fig, d: DRIVERS[o.car] }))];
  CUP.pts = {}; CUP.last = {}; for (const r of CUP.racers) { CUP.pts[r.key] = 0; CUP.last[r.key] = 0; }
  CUP.tracks = [...TRACK_DEFS, ...myTrackDefs().slice(-2), FINAL_DEF]; SHOW.nick = {}; // egna banor: de två senaste är med
  runCupRace();
}
function cupIsFinal() { return CUP.tracks && CUP.tracks[CUP.idx] === FINAL_DEF; }
function runCupRace() {
  const def = CUP.tracks[CUP.idx]; hideUI(); Voice.stop(); cupSaveNow();
  startRace(def, { me: CUP.me, opps: CUP.opps, diff: DIFFS[CUP.diff] });
  const sayIntro = () => Voice.say(def === FINAL_DEF ? 'Finalen! Dubbla poäng!' : `Bana ${CUP.idx + 1} av ${CUP.tracks.length}. ${def.say}!`, true);
  if (SETTINGS.show) {
    Snd.stopMusic();
    showStart(buildPreRace(def, CUP.idx, CUP.tracks.length, CUP.racers), () => { G.mode = G.gift && G.gift.picked == null ? 'gift' : 'countdown'; if (G.gift) G.gift.t = 0; G.countdown = 3.99; G.lastCount = 4; Snd.music(def.music); });
  } else setTimeout(sayIntro, 150);
}
function carKey(c) { return c.isPlayer ? 'me' : c.who.name; }
function cupStandings() { return CUP.racers.slice().sort((a, b) => CUP.pts[b.key] - CUP.pts[a.key] || (CUP.last[a.key] - CUP.last[b.key])); }
function cupNext() {
  CUP.idx++;
  if (CUP.idx < CUP.tracks.length) return runCupRace();
  if (SETTINGS.show) { hideUI(); Voice.stop(); Snd.stopMusic(); const st = cupStandings(); showStart(buildPress(st), () => { G.mode = 'done'; showCupFinal(); }); }
  else showCupFinal();
}
function showCupFinal() {
  const st = cupStandings(); CUP.final = st; CUP.active = false; cupSaveClear();
  const myPlace = st.findIndex(r => r.key === 'me') + 1; const nm = G.playerName || '';
  const bonus = CUP_BONUS[myPlace - 1] || 0; addCoins(bonus);
  if (myPlace === 1) { PROF.cups[pkey()] = (PROF.cups[pkey()] || 0) + 1; saveProf(); buildTitle(); }
  $('#cup-title').textContent = myPlace === 1 ? `MÄSTARE${nm ? ': ' + nm : '!'}` : `MÄSTARE: ${st[0].name}`;
  $('#cup-sub').textContent = (myPlace === 1 ? `${CUP.pts.me} POÄNG – DU VANN POKALEN!` : `DU KOM ${PLACE_TXT[myPlace - 1]} MED ${CUP.pts.me} POÄNG!`) + (bonus ? `  +${bonus} 🪙` : '');
  CUP.conf = [];
  Snd.engine(false, 0); Snd.play('fanfare'); screenStack.length = 0; screenStack.push('hub'); curScreen = null; showScreen('cup', false);
  setTimeout(() => Voice.say(myPlace === 1 ? `Grattis${nm ? ' ' + nm.toLowerCase() : ''}! Du är mästare och vinner pokalen!` : `Du kom på ${PLACE_SAY[myPlace - 1]} plats i turneringen! Bra kämpat!`, true), 600);
}
function drawTrophy(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.rotate(t * 0.4); for (let k = 0; k < 12; k++) { c.rotate(TAU / 12); c.fillStyle = 'rgba(255,235,59,0.18)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -170); c.lineTo(18, -170); c.fill(); } c.restore();
  const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#b8860b'); g.addColorStop(0.35, '#ffe066'); g.addColorStop(0.55, '#fff6c2'); g.addColorStop(1, '#c9971c');
  c.fillStyle = g; c.strokeStyle = '#7a5200'; c.lineWidth = 4;
  c.lineWidth = 12; c.strokeStyle = '#d4a017'; c.beginPath(); c.arc(-62, -45, 26, Math.PI * 0.5, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(62, -45, 26, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
  c.lineWidth = 4; c.strokeStyle = '#7a5200';
  c.beginPath(); c.moveTo(-70, -95); c.lineTo(70, -95); c.quadraticCurveTo(70, 5, 0, 20); c.quadraticCurveTo(-70, 5, -70, -95); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff3b0'; c.beginPath(); c.ellipse(0, -95, 70, 12, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = g; c.fillRect(-12, 18, 24, 34); c.strokeRect(-12, 18, 24, 34);
  c.beginPath(); c.moveTo(-45, 52); c.lineTo(45, 52); c.lineTo(55, 80); c.lineTo(-55, 80); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#5d4037'; c.fillRect(-60, 80, 120, 26); c.fillStyle = '#ffd54f'; c.font = 'bold 18px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TURBO-CUP', 0, 94);
  c.fillStyle = '#e53935'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 11 : 26; c.lineTo(Math.cos(a) * r, -48 + Math.sin(a) * r); } c.closePath(); c.fill();
  const sx = ((t * 0.6) % 2) * 200 - 100; c.save(); c.beginPath(); c.moveTo(-70, -95); c.lineTo(70, -95); c.quadraticCurveTo(70, 5, 0, 20); c.quadraticCurveTo(-70, 5, -70, -95); c.clip(); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(sx - 10, -110); c.lineTo(sx + 12, -110); c.lineTo(sx - 18, 30); c.lineTo(sx - 40, 30); c.fill(); c.restore();
  c.restore();
}
function drawPodium(t) {
  const cv = $('#podium'); const c = cv.getContext('2d'); const w = cv.width, h = cv.height; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  const st = CUP.final; if (!st) return;
  const steps = [{ i: 1, x: w / 2 - 250, hgt: 150, col: '#cfd8dc' }, { i: 0, x: w / 2, hgt: 210, col: '#ffd54f' }, { i: 2, x: w / 2 + 250, hgt: 110, col: '#ffab76' }];
  const base = h - 20;
  for (const s of steps) {
    const r = st[s.i]; if (!r) continue;
    c.fillStyle = s.col; rr(c, s.x - 110, base - s.hgt, 220, s.hgt, 12); c.fill(); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(s.x - 110, base - s.hgt + s.hgt * 0.7, 220, s.hgt * 0.3);
    c.fillStyle = '#1a1033'; c.font = 'bold 70px "Arial Rounded MT Bold", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(s.i + 1), s.x, base - s.hgt / 2 - 10);
    c.font = 'bold 24px "Arial Rounded MT Bold", Arial'; c.fillText(CUP.pts[r.key] + ' P', s.x, base - s.hgt / 2 + 40);
    const bob = Math.sin(t * 4 + s.i) * (s.i === 0 ? 8 : 3);
    const isMe = r.key === 'me';
    c.save(); c.translate(s.x + 50, base - s.hgt - 6); c.scale(1.08, 1.08); drawCarFront(c, r.d, t + s.i, { boost: s.i === 0, speed: s.i === 0 ? 1 : 0.6 }); c.restore();
    // figurer i helfigur: 1:an jublar, 2:an klappar artigt (surt om det är en motståndare), 3:an är glad bara att vara med. Spelaren är alltid glad.
    const R = 27, pose = s.i === 0 ? 'cheer' : s.i === 1 ? (isMe ? 'wave' : 'politeClap') : (isMe ? 'cheer' : 'clap');
    c.save(); c.translate(s.x - 38, base - s.hgt - R * 3.45); drawRig(c, r.fig, R, t + s.i, pose, { legs: true, steam: s.i === 1 && !isMe && (t % 5) > 2.5 }); c.restore();
    c.font = 'bold 26px "Arial Rounded MT Bold", Arial'; c.lineWidth = 6; c.strokeStyle = '#1a1033'; c.strokeText(r.name, s.x, base - s.hgt - 162); c.fillStyle = isMe ? "#ffd600" : "#fff"; c.fillText(r.name, s.x, base - s.hgt - 162);
  }
  drawTrophy(c, w / 2, 92, 0.6, t);
  if (SETTINGS.show) { // saftdusch över vinnaren
    CUP.saft = CUP.saft || [];
    const top = base - 210 - 70;
    [[-1, '#ff4081'], [1, '#ff9100']].forEach(([sd, col]) => {
      const bx = w / 2 + sd * 150, by = top + 40, ang = sd * -0.6 + Math.sin(t * 3 + sd) * 0.1;
      c.save(); c.translate(bx, by); c.rotate(ang); c.fillStyle = col; rr(c, -16, -10, 32, 60, 8); c.fill(); c.fillRect(-7, -30, 14, 22); c.fillStyle = '#fff'; c.fillRect(-16, 10, 32, 14); c.fillStyle = col; c.font = 'bold 10px Arial'; c.textAlign = 'center'; c.fillText('SAFT', 0, 18); c.restore();
      if (CUP.saft.length < 70 && Math.random() < 0.6) CUP.saft.push({ x: bx + Math.sin(ang) * 30, y: by - Math.cos(ang) * 30, vx: -sd * (60 + Math.random() * 70), vy: -300 - Math.random() * 100, col, life: 1.4 });
    });
    for (const p of CUP.saft) { p.vy += 380 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.life -= 1 / 60; c.globalAlpha = Math.max(0, Math.min(1, p.life)); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, 3.5, 0, TAU); c.fill(); }
    c.globalAlpha = 1; CUP.saft = CUP.saft.filter(p => p.life > 0 && p.y < h);
    const r0 = st[0]; c.font = 'bold 26px "Arial Rounded MT Bold", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 6; c.strokeStyle = '#1a1033'; c.strokeText(r0.name, w / 2, base - 372); c.fillStyle = r0.key === "me" ? "#ffd600" : "#fff"; c.fillText(r0.name, w / 2, base - 372);
  }
  if (CUP.conf.length < 90) CUP.conf.push({ x: Math.random() * w, y: -10, vy: 60 + Math.random() * 90, r: Math.random() * 6, col: `hsl(${Math.random() * 360},90%,60%)` });
  for (const p of CUP.conf) { p.y += p.vy / 60; p.r += 0.1; if (p.y > h) { p.y = -10; p.x = Math.random() * w; } c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-6, -3, 12, 6); c.restore(); }
}

// ---------- Paus ----------
function pause() { if (G.mode !== 'race' && G.mode !== 'countdown') return; G.paused = true; Snd.engine(false, 0); screenStack.length = 0; showScreen('pause', false); }
function resume() { G.paused = false; hideUI(); }
function restartCurrent() { hideUI(); if (G.school) startSchool(G.school.ci); else beginRace(); }

// ---------- Resultat (race) ----------
function resRow(list, k, c, extra = '') {
  const div = document.createElement('div'); div.className = 'res-row' + (c.isPlayer || c.key === 'me' ? ' me' : '');
  div.innerHTML = `<b>${k + 1}</b><canvas class="carcv" width="220" height="120"></canvas><span class="nm">${esc(c.who ? whoName(c) : c.name)}</span>${extra}`;
  div.insertBefore(faceCanvas(c.who ? c.who.fig : c.fig, 46), div.querySelector('canvas'));
  list.appendChild(div); const cv = div.querySelector('canvas.carcv'); cv._d = c.d; cv._k = k;
}
function showResults() {
  const P = G.player; const order = G.order; const place = P.place || (order.indexOf(P) + 1);
  const key = pkey(); PROF.medals[key] = PROF.medals[key] || {}; const prev = PROF.medals[key][G.T.def.id];
  if (!prev || place < prev) PROF.medals[key][G.T.def.id] = place;
  const coins = RACE_COINS[place - 1] || 0; addCoins(coins); saveProf();
  const nm = G.playerName ? ', ' + esc(G.playerName) : '';
  $('#res-title').innerHTML = place <= 3 ? `BRA JOBBAT${nm}!` : `BRA KÖRT${nm}!`;
  $('#res-medal').textContent = ['🥇', '🥈', '🥉', '⭐', '⭐'][place - 1];
  $('#res-sub').textContent = (place <= 3 ? `DU KOM ${PLACE_TXT[place - 1]}!` : 'DU KOM I MÅL!') + `  +${coins} 🪙`;
  const list = $('#res-list'); list.innerHTML = '';
  const cup = CUP.active; $('#res-comment').innerHTML = ''; $('#res-sub').classList.remove('dbl');
  document.querySelectorAll('.nocup').forEach(e => e.style.display = cup ? 'none' : '');
  $('#r-next').style.display = cup ? '' : 'none';
  if (cup) {
    const gain = {};
    const fin = cupIsFinal(), mul = fin ? 2 : 1;
    order.forEach((c, k) => { const ky = carKey(c); gain[ky] = CUP_PTS[k] * mul; CUP.pts[ky] += CUP_PTS[k] * mul; CUP.last[ky] = k; });
    cupSaveNow(CUP.idx + 1); // loppet är klart – nästa gång börjar man på nästa bana
    const lastRace = CUP.idx >= CUP.tracks.length - 1;
    $('#res-title').textContent = fin ? 'FINALEN KLAR!' : `BANA ${CUP.idx + 1} AV ${CUP.tracks.length} KLAR!`;
    $('#res-sub').textContent = `DU KOM ${PLACE_TXT[place - 1]} – +${CUP_PTS[place - 1] * mul} POÄNG  +${coins} 🪙`;
    $('#res-sub').classList.toggle('dbl', fin);
    if (SETTINGS.show) {
      const lines = resultComment(place, fin); const box = $('#res-comment');
      box.innerHTML = lines.map(([w, t]) => `<b>🎙️ ${esc(showWho(w).name)}:</b> ${esc(t)}`).join('<br>');
      let k = 0; const nextL = () => { if (k < lines.length && curScreen === 'result') { const [w, t] = lines[k++]; Voice.sayAs(showRole(w), t, () => setTimeout(nextL, 250)); } };
      setTimeout(nextL, 700);
    }
    $('#r-next').innerHTML = lastRace ? '🏆 VEM VANN?' : '▶ NÄSTA BANA'; $('#r-next').dataset.say = lastRace ? 'Vem vann?' : 'Nästa bana';
    const hdr = document.createElement('div'); hdr.className = 'res-row hdr'; hdr.innerHTML = '<b></b><span style="width:140px"></span><span class="nm">STÄLLNING</span><span class="gain">NU</span><span class="tot">TOTALT</span>'; list.appendChild(hdr);
    cupStandings().forEach((r, k) => resRow(list, k, r, `<span class="gain">+${gain[r.key]}</span><span class="tot">${CUP.pts[r.key]}</span>`));
  } else order.forEach((c, k) => resRow(list, k, c));
  Snd.engine(false, 0); screenStack.length = 0; screenStack.push('hub'); curScreen = null; showScreen('result', false);
}

// ---------- Körskolan ----------
function schoolStars() { return playerData().school; }
function buildSchool() {
  const st = schoolStars(); const g = $('#school-grid'); g.innerHTML = '';
  let total = 0;
  CHALLENGES.forEach((ch, i) => {
    const s = st[ch.id] || 0; total += s; const locked = i > 0 && !s && !(st[CHALLENGES[i - 1].id] > 0);
    const stars = '★'.repeat(s) + '☆'.repeat(3 - s);
    const b = mkBtn('card chal' + (locked ? ' locked' : ''), `<div class="num">${i + 1}</div><div class="bigico">${locked ? '🔒' : ch.icon}</div><div class="lbl">${ch.name}</div><div class="stars">${stars}</div>`, locked ? 'Låst. Klara förra utmaningen först!' : ch.name.toLowerCase(), () => { if (locked) { Snd.play('buzz'); return; } hideUI(); startSchool(i); });
    if (!locked && (s < 3 || i === 0) && !g.querySelector('[data-default]')) { if (s < 3) b.dataset.default = '1'; }
    g.appendChild(b);
  });
  const pd = playerData();
  $('#school-sub').textContent = `★ ${total} / ${CHALLENGES.length * 3}` + (pd.license ? '  ·  🪪 KÖRKORT KLART!' : '  ·  KLARA ALLA FÖR ATT FÅ KÖRKORT!');
}
function showSchoolResult(r) {
  const S = G.school, ch = S.ch, pd = playerData(); const prev = pd.school[ch.id] || 0;
  const newStars = Math.max(0, r.stars - prev); if (r.stars > prev) pd.school[ch.id] = r.stars;
  const coins = newStars * 5 + (r.coins || 0); if (coins) pd.coins += coins;
  let newLicense = false;
  if (!pd.license && CHALLENGES.every(c => (pd.school[c.id] || 0) > 0)) { pd.license = new Date().toISOString().slice(0, 10); newLicense = true; }
  saveProf();
  $('#sres-stars').innerHTML = [0, 1, 2].map(k => `<span class="${k < r.stars ? 'on' : ''}" style="animation-delay:${k * 0.25}s">★</span>`).join('');
  $('#sres-title').textContent = r.stars === 3 ? 'SUPERBRA!' : r.stars === 2 ? 'BRA JOBBAT!' : r.stars === 1 ? 'KLARAT!' : 'FÖRSÖK IGEN!';
  $('#sres-msg').textContent = r.msg + (coins ? `  +${coins} 🪙` : '');
  const nextIdx = S.ci + 1, canNext = r.stars > 0 && nextIdx < CHALLENGES.length;
  $('#s-next').style.display = canNext && !newLicense ? '' : 'none';
  $('#s-lic').style.display = newLicense ? '' : 'none';
  if (r.stars > 0) Snd.play('star'); else Snd.play('buzz');
  Voice.say(r.stars === 0 ? 'Nästan! Försök igen!' : newLicense ? 'Grattis! Du har klarat hela körskolan och fått körkort!' : `${r.stars} stjärn${r.stars === 1 ? 'a' : 'or'}! ${r.stars === 3 ? 'Superbra!' : 'Bra jobbat!'}`, true);
  $('#s-again').dataset.default = r.stars === 0 || !canNext ? '1' : ''; if (!$('#s-again').dataset.default) delete $('#s-again').dataset.default;
  if (newLicense) $('#s-lic').dataset.default = '1'; else delete $('#s-lic').dataset.default;
  if (canNext && !newLicense && r.stars > 0) $('#s-next').dataset.default = '1'; else delete $('#s-next').dataset.default;
  screenStack.length = 0; screenStack.push('hub', 'school'); curScreen = null; showScreen('sres', false);
}
function showLicense() {
  const pd = playerData();
  $('#lic-name').textContent = G.playerName || 'FÖRARE';
  const total = CHALLENGES.reduce((a, c) => a + (pd.school[c.id] || 0), 0);
  $('#lic-stars').textContent = `★ ${total} AV ${CHALLENGES.length * 3} STJÄRNOR`;
  $('#lic-date').textContent = 'UTFÄRDAT ' + (pd.license || new Date().toISOString().slice(0, 10));
  const box = $('#lic-face'); box.innerHTML = ''; const cv = faceCanvas(pd.fig, 170); cv.classList.add('licface'); box.appendChild(cv);
  showScreen('license');
}

// ---------- Demo i bakgrunden ----------
let demoIdx = 0;
function startDemo() { demoIdx = (demoIdx + 1) % TRACK_DEFS.length; startRace(TRACK_DEFS[demoIdx], { me: { car: 0, name: '', fig: DEFAULT_FIG }, diff: DIFFS.find(d => d.id === 'mid'), demo: true }); }
function toMenu() { CUP.active = false; Snd.engine(false, 0); startDemo(); Snd.music('menu'); screenStack.length = 0; buildTitle(); screenStack.push('title'); curScreen = null; buildHub(); showScreen('hub', false); }

// ---------- Inställningar ----------
function syncTopbar() {
  $('#b-sfx').classList.toggle('off', !SETTINGS.sfx); $('#b-music').classList.toggle('off', !SETTINGS.music); $('#b-voice').classList.toggle('off', !SETTINGS.voice);
  $('#b-show').classList.toggle('off', !SETTINGS.show); $('#b-show').innerHTML = SETTINGS.show && SETTINGS.voiceStyle === 'pladder' ? '🎙️🐤' : '🎙️'; $('#b-show').dataset.say = !SETTINGS.show ? 'TV-showen av' : SETTINGS.voiceStyle === 'pladder' ? 'TV-show med pladderröster' : 'TV-show med svenska röster';
  $('#b-steer').innerHTML = '📷 ' + (SETTINGS.cam === 'fixed' ? 'FAST' : 'FÖLJ BIL');
  $('#b-steer').dataset.say = SETTINGS.cam === 'fixed' ? 'Fast kamera' : 'Kameran följer bilen';
}
function initTopbar() {
  const tog = (id, key) => $(id).addEventListener('click', () => { Snd.init(); SETTINGS[key] = !SETTINGS[key]; saveSettings(); Snd.setVolumes(); syncTopbar(); Snd.play('click'); if (key === 'voice' && SETTINGS.voice) Voice.say('Rösten är på', true); });
  tog('#b-sfx', 'sfx'); tog('#b-music', 'music'); tog('#b-voice', 'voice');
  // 🎙️: TV-show med svenska röster -> TV-show med pladder (minionröster) -> ingen TV-show
  $('#b-show').addEventListener('click', () => { Snd.init(); if (!SETTINGS.show) { SETTINGS.show = true; SETTINGS.voiceStyle = 'sv'; } else if (SETTINGS.voiceStyle !== 'pladder') SETTINGS.voiceStyle = 'pladder'; else SETTINGS.show = false; saveSettings(); syncTopbar(); Snd.play('click'); if (SETTINGS.show) Voice.sayAs('britt', SETTINGS.voiceStyle === 'pladder' ? 'Hej hej! Pladder pladder!' : 'Hej! Nu pratar vi svenska.'); else Voice.say('TV-showen är av', true); });
  $('#b-steer').addEventListener('click', () => { SETTINGS.cam = SETTINGS.cam === 'fixed' ? 'follow' : 'fixed'; saveSettings(); syncTopbar(); Snd.play('click'); Voice.say($('#b-steer').dataset.say, true); });
  $('#b-full').addEventListener('click', toggleFull);
  document.querySelectorAll('#topbar .nav').forEach(b => b.addEventListener('mouseenter', () => focusEl(b, true)));
  syncTopbar();
}
function back2School() { toMenu(); buildSchool(); showScreen('school'); }
// Helskärm: Esc ska öppna spelets meny, inte lämna helskärm. Chrome/Edge: tangentbordslås på Esc (håll inne Esc för att lämna helskärm).
// Webbläsare utan lås (Safari/Firefox): när Esc lämnar helskärm räknas det som ett Esc-tryck i spelet, så att ett tryck räcker.
function toggleFull() { const d = document; try { if (!(d.fullscreenElement || d.webkitFullscreenElement)) { const e = d.documentElement; const pr = (e.requestFullscreen || e.webkitRequestFullscreen).call(e); if (pr && pr.then) pr.then(lockEsc).catch(() => { }); else lockEsc(); } else { G.fsManual = true; try { navigator.keyboard && navigator.keyboard.unlock && navigator.keyboard.unlock(); } catch (er) { } (d.exitFullscreen || d.webkitExitFullscreen).call(d); } } catch (e) { } }
function lockEsc() { try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).then(() => { G.escLocked = true; }).catch(() => { G.escLocked = false; }); } catch (e) { } }
function initFullscreenEsc() {
  window.addEventListener('keydown', e => { if (e.code === 'Escape' && e.isTrusted) G.lastEscAt = performance.now(); }, true);
  const onChange = () => {
    const d = document, full = !!(d.fullscreenElement || d.webkitFullscreenElement);
    if (full) { G.fsManual = false; return; }
    G.escLocked = false;
    if (G.fsManual) { G.fsManual = false; return; }
    // lämnade helskärm utan knappen = Esc. Om sidan redan fick Esc-trycket gör vi inget mer.
    if (performance.now() - (G.lastEscAt || -1e9) < 400) return;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));
  };
  document.addEventListener('fullscreenchange', onChange); document.addEventListener('webkitfullscreenchange', onChange);
}

// ---------- Tangentbord ----------
window.addEventListener('keydown', e => {
  if (!e.repeat) logKey((e.ctrlKey ? 'Ctrl+' : '') + (e.metaKey ? 'Cmd+' : '') + (e.shiftKey && e.code.length > 5 && !/^Shift/.test(e.code) ? 'Shift+' : '') + e.code);
  if (e.code === 'KeyL' && e.shiftKey && (e.ctrlKey || e.metaKey) && !e.repeat) { e.preventDefault(); logExport(); return; }
  // dubbeltryck på Skift = hopp (i lopp och i staden, inte i körskolan)
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) G.shiftDownAt = performance.now();
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) { const now = performance.now(), dbl = now - (G.lastShiftAt || -1e9) < 380; G.lastShiftAt = dbl ? -1e9 : now; if (dbl) { if (G.mode === 'race' && !G.paused && !G.school) tryHop(G.player); else if (G.mode === 'city' && G.city && G.city.phase === 'drive') tryHop(G.city.car); } }
  Snd.init();
  if (!G.musicStarted && Snd.ready) { G.musicStarted = true; if (G.demo) Snd.music('menu'); }
  const ae = document.activeElement, inInput = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  if (inInput) {
    if (e.code === 'Enter') { e.preventDefault(); if (ae.id === 'name-in') saveName(); else if (ae.id === 'bname-in') bSave(); else if (ae.id === 'pin-in') checkPin(); else if (ae.closest && ae.closest('#par-body')) ae.blur(); else { ae.blur(); focusEl($('#fig-rows .nav')); } }
    else if (e.code === 'Escape') { ae.blur(); back(); }
    else if (ae.id === 'opp-name' && (e.code === 'ArrowDown')) { ae.blur(); focusEl($('#fig-rows .nav')); }
    return;
  }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (G.mode === 'build' && !curScreen) { buildKey(e); return; }
  if (G.mode === 'city' && G.city && !curScreen) { if (e.code === 'Space' || e.code === 'Enter') e.preventDefault(); cityKey(e); return; }
  if (e.code === 'KeyF' && !e.repeat) toggleFull();
  if (curScreen === 'quiz' && quizKey(e)) { e.preventDefault(); return; }
  if (G.mode === 'gift' && !curScreen) { e.preventDefault(); giftKey(e); return; }
    if (G.mode === 'brief' && !curScreen) { if (!e.repeat) { if (e.code === 'Escape') { G.brief = null; back2School(); } else briefStart(); } return; }
  if (G.mode === 'show' && !curScreen) {
    if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) { e.preventDefault(); showSkip(); }
    else if (e.code === 'Escape' && !e.repeat) showSkipAll();
    return;
  }
  const racing = (G.mode === 'race' || G.mode === 'countdown' || G.mode === 'finish') && !G.demo;
  if (racing && !G.paused) {
    if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && G.mode === 'race' && G.player.item) useItem(G.player);
    if (e.code === 'Enter' && !e.repeat && G.mode === 'finish' && G.victory && G.victory.t > 0.4) G.finishT = Math.min(G.finishT, 0.01);
    if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) pause();
    if (e.code === 'KeyH' && !e.repeat) Snd.horn(G.player.horn || 'tut');
    return;
  }
  if (!curScreen) return;
  if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) return;
  if (e.code === 'ArrowLeft') navMove('left'); else if (e.code === 'ArrowRight') navMove('right'); else if (e.code === 'ArrowUp') navMove('up'); else if (e.code === 'ArrowDown') navMove('down');
  else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); const a = document.activeElement; if (a && a.classList.contains('nav')) a.click(); }
  else if (e.code === 'Escape' || e.code === 'Backspace') back();
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
window.addEventListener('keyup', e => { keys[e.code] = false; if ((e.code === 'Space' || e.code === 'Enter') && !(document.activeElement && document.activeElement.tagName === 'INPUT')) e.preventDefault(); });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G.mode === 'race' || G.mode === 'countdown') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (G.mode === 'race' || G.mode === 'countdown')) pause(); });
window.addEventListener('pointerdown', () => { Snd.init(); if (!G.musicStarted && Snd.ready) { G.musicStarted = true; if (G.demo) Snd.music('menu'); } });

// ---------- Huvudloop ----------
// Om datorn inte hinner rita 60 bilder per sekund ritar spelet med lägre upplösning (skärmen fylls ändå, bilden blir lite mjukare).
function autoScale(fms) {
  const w = PERF.win; w.push(fms); if (w.length < 150) return;
  const avg = w.reduce((a, b) => a + b, 0) / w.length; w.length = 0;
  if (avg > 22 && PERF.scale > 0.6) { PERF.scale = PERF.scale > 0.9 ? 0.8 : 0.65; logEv('grafik', 'lägre upplösning ' + PERF.scale, { snittMs: +avg.toFixed(1) }); resize(); G.hudSpr = {}; for (const k in BUILT) if (BUILT[k]) BUILT[k].mini = null; }
}
let lastT = performance.now();
let lastMode = null, loopErrs = 0;
function loop(now) {
  // Ett fel i en enskild bildruta får aldrig frysa spelet: felet loggas och nästa bildruta ritas ändå.
  try {
    if (G.mode !== lastMode) { logEv('läge', (lastMode || '–') + ' → ' + G.mode); lastMode = G.mode; }
    const fms = now - lastT, dt = Math.min(0.05, fms / 1000); lastT = now; const t = now / 1000;
    const live = (G.mode === 'race' || G.mode === 'countdown' || G.mode === 'city') && !G.paused && !G.demo && !document.hidden;
    PERF.live = live; const heap = performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0;
    if (live && fms < 3000) {
      PERF.frames++; PERF.sum += fms;
      if (fms > 70) { PERF.hitch++; if (PERF.logged++ < 60) logEv('ryck', Math.round(fms) + ' ms', { js: +PERF.lastJs.toFixed(1), läge: G.mode, partiklar: G.parts.length, röst: !!(window.speechSynthesis && speechSynthesis.speaking), minneMB: +heap.toFixed(1), städat: heap && PERF.heap - heap > 0.5 ? +(PERF.heap - heap).toFixed(1) : 0 }); }
      else autoScale(fms);
    }
    PERF.heap = heap;
    const js0 = performance.now();
    if ((G.T || G.mode === 'city' || G.mode === 'build') && !G.paused && G.mode !== 'done') { trackTime(dt); const n = 3; for (let k = 0; k < n; k++) update(dt / n); }
    render();
    PERF.lastJs = performance.now() - js0; if (live) PERF.js += PERF.lastJs;
    if (curScreen === 'driver') for (const p of previewCanvases) if (p.kind === 'car') { const c = p.el.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, p.el.width, p.el.height); const f = document.activeElement === p.btn; const pd = playerData(); const d = styledCar(p.i, pd.equip.paint, pd.equip.sticker); c.save(); c.translate(128, 150); c.scale(1.75, 1.75); drawCarFront(c, d, t + p.i * 0.37, { speed: f ? 1.2 : 0, still: !f, boost: f }); c.restore(); /* liten bild ovanifrån i hörnet: så ser bilen ut på banan */ c.save(); c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(34, 34, 28, 0, TAU); c.fill(); c.translate(34, 34); c.rotate(-Math.PI / 2); c.scale(0.62, 0.62); drawCar(c, d, t); c.restore(); }
    if (curScreen === 'track') for (const p of previewCanvases) if (p.kind === 'track' && !p.drawn) { drawTrackPreview(p.el, p.def); p.drawn = true; }
    if (curScreen === 'title') drawTitleCars(t);
    if (curScreen === 'cup') drawPodium(t);
    if (curScreen === 'fig') drawFigPreview(t);
    if (curScreen === 'shop') drawShopPreview(t);
    if (curScreen) { drawLiveFaces(t); if (curScreen === 'result' || curScreen === 'cup') drawLiveCars(t); }
  } catch (err) {
    loopErrs++; TRLOG.errs++; if (loopErrs <= 20 || loopErrs % 100 === 0) logEv('FEL', 'i spel-loopen: ' + (err && err.message), { stack: err && err.stack ? String(err.stack).slice(0, 600) : '', antal: loopErrs });
    if (loopErrs === 1) console.error(err);
    try { for (let i = 0; i < 12; i++) ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; } catch (e2) { }
  }
  requestAnimationFrame(loop);
}
function drawTitleCars(t) {
  const cv = $('#title-cars'); const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 6; i++) { const d = DRIVERS[(i + Math.floor(t / 3) * 6) % DRIVERS.length]; c.save(); c.translate(75 + i * 146, 70 + Math.sin(t * 4 + i) * 6); c.scale(1.65, 1.65); drawCar(c, d, t, { boost: true }); c.restore(); }
}

// ---------- Start ----------
function init() {
  initSaveLoad(); initBuilder();
  document.querySelectorAll('.screen').forEach(sc => sc.addEventListener('scroll', moreHint, { passive: true })); window.addEventListener('resize', fitSoon);
  try { new MutationObserver(fitSoon).observe($('#ui'), { childList: true, subtree: true, characterData: true }); } catch (e) { }
  $('#more-hint').addEventListener('click', () => { const sc = curScreen && $('#scr-' + curScreen); if (sc) sc.scrollBy({ top: sc.clientHeight * 0.7, behavior: 'smooth' }); });
  initFullscreenEsc();
  buildTitle(); buildNameScreen(); buildDrivers(); buildTracks(); buildDiff(); initTopbar();
  $('#name-ok').addEventListener('click', saveName);
  $('#p-resume').addEventListener('click', resume);
  $('#p-restart').addEventListener('click', restartCurrent);
  $('#p-menu').addEventListener('click', toMenu);
  $('#r-again').addEventListener('click', beginRace);
  $('#r-next').addEventListener('click', cupNext);
  $('#pin-ok').addEventListener('click', checkPin);
  $('#quiz-help').addEventListener('click', quizHelp);
  $('#quiz-skip').addEventListener('click', () => { if (!QUIZ) return; const cb = QUIZ.onDone; QUIZ = null; cb && cb(false); });
  $('#c-again').addEventListener('click', () => { SEL.mode = 'cup'; CUP.active = false; startCup(); });
  $('#c-menu').addEventListener('click', toMenu);
  $('#r-track').addEventListener('click', () => { toMenu(); screenStack.push('hub', 'driver'); curScreen = null; SEL.mode = 'race'; goTracks(); });
  $('#r-menu').addEventListener('click', toMenu);
  $('#fig-rand').addEventListener('click', () => { Snd.play('boing'); FE.fig = randomFig(); if (FE.mode === 'opp') FE.car = Math.floor(Math.random() * DRIVERS.length); buildFigEditor(); focusEl($('#fig-rand'), true); });
  $('#fig-ok').addEventListener('click', figDone);
  $('#fig-del').addEventListener('click', () => { if (FE.idx >= 0) { PROF.opps.splice(FE.idx, 1); saveProf(); Snd.play('back'); buildOpps(); back(); } });
  document.querySelectorAll('#shop-tabs .nav').forEach(b => b.addEventListener('click', () => { SEL.shopTab = b.dataset.tab; Snd.play('click'); buildShop(); b.focus(); }));
  $('#s-again').addEventListener('click', () => { hideUI(); startSchool(G.school.ci); });
  $('#s-next').addEventListener('click', () => { hideUI(); startSchool(G.school.ci + 1); });
  $('#s-menu').addEventListener('click', () => { const ci = G.school ? G.school.ci : 0; toMenu(); buildSchool(); showScreen('school'); });
  $('#s-lic').addEventListener('click', () => { toMenu(); showLicense(); });
  $('#lic-print').addEventListener('click', () => { try { window.print(); } catch (e) { } });
  document.querySelectorAll('.backbtn').forEach(b => b.addEventListener('click', () => { Snd.play('click'); back(); }));
  document.querySelectorAll('.screen .nav').forEach(b => b.addEventListener('mouseenter', () => focusEl(b, true)));
  startDemo();
  showScreen('title', false);
  requestAnimationFrame(loop);
}
init();
window.__TRx = { cup: () => CUP, getTrack, builder: { start: o => startBuilder(o), step: (x, y) => bStep(x, y), key: c => buildKey({ code: c, repeat: false, preventDefault() { }, shiftKey: false }), state: () => BUILDER, customDef, myTracks, allTracks, openMenu: () => openBuilderMenu(), openBt: i => openBt(i), themes: () => { buildThemeScreen(); showScreen('btheme'); }, save: () => bSave() }, SETTINGS, saveGame, loadGameFile, cupSaved, drawCarFront, drawCarShowroom, drawCar, carTrail, SOUNDDBG: () => ({ show: SOUND.show, word: SOUND.word }), ui: { showScreen, hideUI, buildOpps, buildShop, buildGarage, buildHub, openFigEditor, buildDrivers, goDrivers, goTracks, buildSchool, buildCityMenu, showLicense, openParent, showSchoolResult, showResults, showCupFinal, pause, SEL, PROF: () => PROF, mathQuiz, raceMathBonus }, startCity, cityKey, cityPath, buildPreRace, buildPress, resultComment, drawFigureTalk, drawRig, POSES, showStart, PROFS, ADS, STEWARDS, GP, CUTS, interviewLines, STUDIO, ANTHEM_REACT, CAST, DRIVERS, TRACK_DEFS, FINAL_DEF, startRace, pickOpps, DEFAULT_FIG, DIFFS, render, SHOW };
