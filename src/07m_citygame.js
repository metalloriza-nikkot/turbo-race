// ===================== TURBOSTADEN: spel, uppdrag och läsning =====================
let CITYW = null;
const FOODS = WORD_EMO; // alla ord i läsmotorn har en bild
const TYPE_FOODS = ['OST', 'ÄGG', 'LÖK', 'FISK', 'KORV', 'MAJS'];
// Läsnivåer: 1 = ord + bild, 2 = bara ord, 3 = två ord, 4 = kort mening, 5 = skriv själv
const PIZZA_STORY = [
  { level: 1, dest: 'gula', foods: ['OST'] },
  { level: 2, dest: 'skolan', foods: ['FISK'] },
  { level: 3, dest: 'zoo', foods: ['KORV', 'OST'] },
  { level: 4, dest: 'badhuset', foods: ['MAJS'] },
  { level: 5, dest: 'roda', foods: ['ÄGG'] },
];
const CITY_DECOS = [
  { id: 'blommor', name: 'BLOMMOR PÅ TORGET' }, { id: 'staty', name: 'EN STATY I PARKEN' }, { id: 'ballonger', name: 'BALLONGER VID SKOLAN' },
  { id: 'flaggor', name: 'FLAGGOR I HAMNEN' }, { id: 'regnbage', name: 'EN REGNBÅGE ÖVER ÅN' }, { id: 'glassbil', name: 'EN GLASSBIL' }, { id: 'fyrverkeri', name: 'FYRVERKERI' },
];
function cityData() { const pd = playerData(); pd.city = pd.city || { pizza: [0, 0, 0, 0, 0], deliveries: 0, deco: 0 }; const c = pd.city; c.amb = c.amb || [0, 0, 0, 0, 0]; c.pol = c.pol || [0, 0, 0, 0, 0]; return c; }
// Ambulans: hämta ett skadat djur och kör varsamt till sjukhuset. Stjärnor = hur mjukt man kör.
const PATIENTS = [['🐱', 'KATTEN', 'katten'], ['🐶', 'HUNDEN', 'hunden'], ['🐰', 'KANINEN', 'kaninen'], ['🦆', 'ANKAN', 'ankan'], ['🐢', 'SKÖLDPADDAN', 'sköldpaddan'], ['🐷', 'GRISEN', 'grisen']];
const AMB_STORY = [{ level: 1, dest: 'parken', pat: 0 }, { level: 2, dest: 'skolan', pat: 1 }, { level: 3, dest: 'kiosken', pat: 2 }, { level: 4, dest: 'torget', pat: 3 }, { level: 5, dest: 'hamnen', pat: 4 }];
// Polis: läs vilket fordon tjuven kör och fånga rätt.
const POL_STORY = [{ level: 1, col: 'BLÅ', kind: 'BUSS' }, { level: 2, col: 'RÖD', kind: 'BIL' }, { level: 3, col: 'GUL', kind: 'LASTBIL' }, { level: 4, col: 'GRÖN', kind: 'BIL' }, { level: 5, col: 'LILA', kind: 'BUSS' }];
const AMB_DEF = { id: 'amb', name: 'AMBULANSEN', color: '#fafafa', dark: '#cfd8dc', accent: '#e53935', type: 'amb' };
const THIEF_FIG = { skin: 1, hair: 6, hairCol: 4, eyes: 3, beard: 2, mouth: 1, suit: 6 };

function startCity(mode) {
  hideUI(); Voice.stop(); soundClear('ny stad'); logEv('stad', 'start ' + mode); CUP.active = false;
  const C = CITYW || (CITYW = buildCity());
  const me = playerRacer(), d = mode === 'amb' ? AMB_DEF : mode === 'pol' ? DRIVERS.find(x => x.id === 'polis') : styledCar(me.car, me.paint, me.sticker);
  const sb = C.places[{ pizza: 'pizzerian', amb: 'sjukhuset', pol: 'polisen' }[mode] || 'garaget'].bay;
  const car = { d, isPlayer: true, x: sb.x - 60, y: sb.y, a: 0, vx: 0, vy: 0, fs: 0, air: 0, airMax: 0.5, boost: 0, shield: 0, hitCool: 0, wallCool: 0, ghost: 0, spin: 0, visYaw: 0, who: { name: me.name, fig: me.fig }, horn: mode === 'pol' || mode === 'amb' ? 'polis' : me.horn, siren: mode === 'pol' };
  G.city = { C, car, mode, t: 0, phase: 'drive', path: null, pathT: 0, coins: 0, bayCool: { [sb.place.id]: 6 }, sign: null };
  G.T = null; G.school = null; G.demo = false; G.cars = [car]; G.player = car; G.parts = []; G.balls = []; G.blobs = []; G.banner = null; G.paused = false;
  G.cam.x = car.x; G.cam.y = car.y; G.cam.a = car.a; G.cam.vh = 1150; G.cam.shake = 0;
  G.mode = 'city'; Snd.music('stad'); cityTrafficInit(G.city);
  // veckans bokstav: gyllene bokstäver på vägarna
  G.city.letters = []; for (let k = 0; k < 6; k++) { const i = Math.floor(Math.random() * (CN + 1)), j = [0, 1, 2, 4, 5][Math.floor(Math.random() * 5)]; const x = Math.random() < 0.5 ? rc(i) : rc(Math.min(i, CN - 1)) + CRW / 2 + 150 + Math.random() * (CB - 300), y = x === rc(i) ? rc(Math.min(j, CN - 1)) + CRW / 2 + 150 + Math.random() * (CB - 300) : rc(j); if (cityOnRoad(x, y)) G.city.letters.push({ x, y }); }
  if (mode === 'free') { cityFreeCoins(C); G.city.phase = 'brief'; G.city.brief = { t: 0 }; setTimeout(() => Voice.say('Fri körning! Kör runt i staden och samla mynt. Stanna i en ruta så läser jag skylten. Tryck på en knapp för att köra!', true), 300); }
  else cityNewMission();
}
function cityFreeCoins(C) {
  const rnd = mulberry(Math.floor(Math.random() * 99999)); C.coins = [];
  for (let k = 0; k < 40; k++) { const vert = rnd() < 0.5, i = Math.floor(rnd() * (CN + 1)), j = Math.floor(rnd() * CN); let x, y; if (vert) { x = rc(i) + (rnd() - 0.5) * 120; y = rc(j) + CRW / 2 + 60 + rnd() * (CB - 120); if (!cityOnRoad(x, y)) continue; } else { const jj = [0, 1, 2, 4, 5][Math.floor(rnd() * 5)]; x = rc(Math.min(i, CN - 1)) + CRW / 2 + 60 + rnd() * (CB - 120); y = rc(jj) + (rnd() - 0.5) * 120; } C.coins.push({ x, y, got: false }); }
}
// ---------- uppdrag ----------
function cityNewMission() {
  const S = G.city, C = S.C, cd = cityData();
  if (S.mode === 'amb') return ambNew(S, C, cd);
  if (S.mode === 'pol') return polNew(S, C, cd);
  const story = cd.pizza.findIndex(s => !s);
  let m;
  if (story >= 0) { const st = PIZZA_STORY[story]; m = { story, level: st.level, place: C.places[st.dest] }; }
  else {
    const level = 2 + Math.floor(Math.random() * 4);
    const pool = Object.values(C.places).filter(p => !['pizzerian', 'garaget'].includes(p.id) && (level > 2 || p.easy));
    m = { story: -1, level, place: pool[Math.floor(Math.random() * pool.length)] };
  }
  if (S.hard) { m.level = 3 + Math.floor(Math.random() * 3); m.story = -1; m.hard = true; }
  // orden kommer från läsmotorn (anpassas efter barnets nivå)
  const rd = readData(), bo = m.hard ? 1 : 0;
  if (m.level === 5) { if (rd.custom.length && Math.random() < 0.5) { m.foods = [rd.custom[Math.floor(Math.random() * rd.custom.length)]]; m.dictate = !WORD_EMO[m.foods[0]]; } else m.foods = [Words.pick({ maxLevel: 2, maxLen: 5 })]; }
  else if (m.level === 3) { const a = Words.pick({ boost: bo }); m.foods = [a, Words.pick({ exclude: [a], boost: bo })]; }
  else if ((m.level === 2 || m.level === 4) && rd.lvl + bo >= 5 && Math.random() < 0.6) { const q = Words.riddle(); m.riddle = q; m.foods = [q.ans]; }
  else { m.foods = [Words.pick({ boost: bo })]; m.lower = m.foods[0].length <= 4 && Words.useLower(); }
  m.hunt = m.level >= 2; m.helped = false; S.hard = false;
  const car = S.car, p0 = cityPath(C, car.x, car.y, m.place.bay);
  m.type = 'pizza'; m.allow = p0.len / 300 * 2 + 16; m.t = 0; m.heat = 1; m.gps = m.level < 4; m.cust = randomFigSeeded(mulberry(m.place.id.length * 977 + m.foods[0].length * 13));
  S.m = m; S.phase = 'brief'; S.brief = { t: 0 }; S.path = null; S.raw = null; S.huntEnd = null; cityIgnoreHere(S); S.idleT = 0; S.readOnce = false; cityFaceRoute(S, m.place.bay.x, m.place.bay.y);
  Snd.play('ding');
  setTimeout(() => Voice.say(m.level === 5 ? 'Ny beställning! Den här gången ska du skriva ordet själv när du kommer fram. Tryck på en pil när du vill köra!' : 'Ny beställning! Läs lappen. Tryck på mellanslag om du vill att jag läser. Tryck på en pil när du vill köra!', true), 500);
}
function ambNew(S, C, cd) {
  const story = cd.amb.findIndex(s => !s); let m;
  if (story >= 0) { const st = AMB_STORY[story]; m = { story, level: st.level, place: C.places[st.dest], pat: PATIENTS[st.pat] }; }
  else { const level = 2 + Math.floor(Math.random() * 4), pool = Object.values(C.places).filter(p => !['sjukhuset', 'garaget'].includes(p.id) && (level > 2 || p.easy)); m = { story: -1, level, place: pool[Math.floor(Math.random() * pool.length)], pat: PATIENTS[Math.floor(Math.random() * PATIENTS.length)] }; }
  if (S.hard) { m.level = 5; m.story = -1; m.hard = true; S.hard = false; }
  m.hunt = m.level >= 2;
  Object.assign(m, { type: 'amb', stage: 'pickup', comfort: 1, t: 0, gps: m.level < 3, gpsAt: [0, 0, 0, 8, 12, 15][m.level], cust: randomFigSeeded(mulberry(m.place.id.length * 31)) });
  S.m = m; S.phase = 'brief'; S.brief = { t: 0 }; S.path = null; S.raw = null; S.huntEnd = null; cityIgnoreHere(S); S.idleT = 0; S.readOnce = false; S.car.siren = false; cityFaceRoute(S, m.place.bay.x, m.place.bay.y);
  Snd.horn('polis');
  setTimeout(() => Voice.say('Larm! Ett djur behöver hjälp. Läs lappen. Tryck på en pil när du vill köra!', true), 500);
}
function polNew(S, C, cd) {
  const story = cd.pol.findIndex(s => !s); let st;
  if (story >= 0) st = POL_STORY[story]; else { const cols = Object.keys(TCOLS).filter(c => c !== 'VIT'), kinds = Object.keys(TKINDS); st = { level: 2 + Math.floor(Math.random() * 4), col: cols[Math.floor(Math.random() * cols.length)], kind: kinds[Math.floor(Math.random() * kinds.length)] }; }
  let hardPol = false; if (S.hard) { st = Object.assign({}, st, { level: 5 }); hardPol = true; S.hard = false; }
  S.veh = S.veh.filter(v => !v.suspect);
  const car = S.car, tgt = cityAddVehicle(S, { kind: st.kind, col: st.col, suspect: true, target: true, flee: true, max: 165 + st.level * 8, far: [car.x, car.y] });
  const cols = Object.keys(TCOLS).filter(c => c !== st.col && c !== 'VIT'), kinds = Object.keys(TKINDS).filter(k => k !== st.kind), pick = a => a[Math.floor(Math.random() * a.length)];
  const decoys = st.level === 1 ? [[pick(cols), pick(kinds)], [pick(cols), pick(kinds)], [pick(cols), pick(kinds)]] : [[pick(cols), st.kind], [st.col, pick(kinds)], [pick(cols), st.level >= 3 ? st.kind : pick(kinds)]];
  for (const [col, kind] of decoys) cityAddVehicle(S, { kind, col, suspect: true, max: 170 + Math.random() * 30, near: [tgt.x, tgt.y], nearR: 1300 });
  const m = { type: 'pol', story: hardPol ? -1 : story, hard: hardPol, level: st.level, col: st.col, kind: st.kind, target: tgt, t: 0, gps: st.level < 5, gpsAt: st.level === 5 ? 10 : 0 };
  m.allow = Math.hypot(tgt.x - car.x, tgt.y - car.y) / 150 + 60;
  S.m = m; S.phase = 'brief'; S.brief = { t: 0 }; S.path = null; S.raw = null; S.huntEnd = null; cityIgnoreHere(S); S.idleT = 0; S.readOnce = false; S.car.siren = true; cityFaceRoute(S, tgt.x, tgt.y);
  Snd.horn('polis');
  setTimeout(() => Voice.say('Larm! En tjuv kör runt i staden. Läs lappen. Tryck på en pil när du vill köra!', true), 500);
}
// vänd bilen åt rätt håll längs vägen när ett nytt uppdrag börjar (bilen står still)
function cityFaceRoute(S, tx, ty) {
  const car = S.car; if (Math.hypot(car.vx, car.vy) > 40) return;
  const p = cityPathXY(S.C, car.x, car.y, tx, ty), n = p.pts[1]; if (!n) return;
  const onH = Math.abs(car.y - rc(Math.round(car.y / CP))) < CRW / 2 + 30, onV = Math.abs(car.x - rc(Math.round(car.x / CP))) < CRW / 2 + 30;
  if (onH && Math.abs(n[0] - car.x) > 30) car.a = n[0] > car.x ? 0 : Math.PI; else if (onV && Math.abs(n[1] - car.y) > 30) car.a = n[1] > car.y ? Math.PI / 2 : -Math.PI / 2;
  car.vx = car.vy = 0; car.fs = 0; G.cam.a = car.a;
}
// Står bilen redan i en ruta när ett nytt uppdrag börjar (t.ex. där förra pizzan lämnades)? Då ska den rutans skylt inte poppa upp – den såg annars ut som den nya adressen.
function cityIgnoreHere(S) { soundClear('nytt uppdrag'); if (S.m) logEv('uppdrag', S.m.type + ' nivå ' + S.m.level, { till: S.m.place && S.m.place.id, ord: S.m.foods, hard: !!S.m.hard }); const c = S.car; S.ignoreBay = S.C.bays.find(b => Math.abs(c.x - b.x) < b.w / 2 + 40 && Math.abs(c.y - b.y) < b.h / 2 + 50) || null; }
function polText(m) { return m.level >= 4 ? `TJUVEN KÖR EN ${m.col} ${m.kind}` : `${m.col} ${m.kind}`; }
function dispWord(m, w) { return m.lower ? w.toLowerCase() : w; }
function cityOrderText(m) { return m.riddle ? m.riddle.text : m.level === 3 ? m.foods.join(' OCH ') : dispWord(m, m.foods[0]); }
function cityReadAloud() {
  const S = G.city, m = S.m;
  if (!m) { const b = S.lastBay; if (b) Voice.say(b.place.garage ? cityGarageName() : b.place.word, true); return; }
  if (m.type === 'pol') { Voice.say(`Fånga ${polText(m).toLowerCase().replace('tjuven kör en ', 'tjuven i en ')}!`, true); m.gps = true; S.readOnce = true; return; }
  if (m.type === 'amb') { Voice.say(m.stage === 'pickup' ? `Hämta ${m.pat[2]} vid ${m.place.word.toLowerCase()}.` : 'Kör till sjukhuset. Försiktigt!', true); m.gps = true; S.readOnce = true; return; }
  const dest = m.place.word.toLowerCase(); m.helped = true;
  if (m.level === 5) Voice.say(`Kör till ${dest}. När du kommer fram ska du skriva ordet på tangentbordet.`, true);
  else if (m.riddle || m.level === 3) Voice.say(`Kör till ${dest}. ${m.riddle ? 'Kunden vill ha: ' + m.riddle.text.toLowerCase() : 'Pizza med ' + cityOrderText(m).toLowerCase()}.`, true);
  else soundOut(dispWord(m, m.foods[0]), `Kör till ${dest}. Pizza med:`);
  if (m.level < 4) m.gps = true; S.readOnce = true;
}
// ---------- uppdatering ----------
function cityUpdate(dt) {
  const S = G.city; if (!S) return; const C = S.C, car = S.car; G.time += dt; S.t += dt;
  const frozen = S.phase !== 'drive';
  const wc0 = car.wallCool, air0 = car.air;
  const thr = cityStepCar(C, car, dt, frozen);
  if (S.m && S.m.type === 'amb' && S.m.stage === 'hospital') { if (car.wallCool > wc0 + 0.2) { S.m.comfort = Math.max(0, S.m.comfort - 0.2); addText(car.x, car.y - 50, 'AJ!', '#ff8a80'); } if (air0 > 0 && car.air <= 0) { S.m.comfort = Math.max(0, S.m.comfort - 0.15); addText(car.x, car.y - 50, 'AJ!', '#ff8a80'); } }
  cityTrafficUpdate(S, dt);
  // kamera
  const cam = G.cam; cam.x += (car.x - cam.x) * Math.min(1, dt * 8); cam.y += (car.y - cam.y) * Math.min(1, dt * 8);
  if (SETTINGS.cam !== 'fixed') { if (Math.abs(car.fs) > 25 && car.fs > 0) cam.a += angDiff(car.a, cam.a) * Math.min(1, dt * 3); } else cam.a = -Math.PI / 2;
  cam.shake = Math.max(0, cam.shake - dt * 30);
  Snd.engine(!frozen, clamp(Math.abs(car.fs) / (CITY_CAP * 1.3), 0, 1));
  updateParts(dt); if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  // fotgängare
  for (const pd of C.peds) {
    const R = pd.bl.R, L = 2 * (R.x1 - R.x0 + R.y1 - R.y0 - 224); pd.s += pd.dir * pd.sp * dt / L; pd.jump = Math.max(0, pd.jump - dt);
    const [x, y] = cityPedPos(pd); pd.x = x; pd.y = y;
    if (pd.jump <= 0 && Math.hypot(car.x - x, car.y - y) < 85 && Math.abs(car.fs) > 60) { pd.jump = 0.6; Snd.play('boing'); }
  }
  // mynt (fri körning)
  if (C.coins) for (const k of C.coins) if (!k.got && Math.hypot(k.x - car.x, k.y - car.y) < 50) { k.got = true; S.coins++; addCoins(1); Snd.play('coin'); addText(k.x, k.y, '+1', '#ffd600'); }
  if (S.letters) for (const L of S.letters) if (!L.got && Math.hypot(L.x - car.x, L.y - car.y) < 60) { L.got = true; collectLetter(L.x, L.y); }
  // leveransrutor
  let inBay = null; for (const b of C.bays) if (Math.abs(car.x - b.x) < b.w / 2 && Math.abs(car.y - b.y) < b.h / 2 + 10) inBay = b;
  if (S.ignoreBay && inBay !== S.ignoreBay) S.ignoreBay = null;
  if (inBay && Math.abs(car.fs) < 60 && !frozen) { S.bayT = (S.bayT || 0) + dt; } else S.bayT = 0;
  if (inBay && S.bayT > 0.35 && !frozen) {
    const m = S.m;
    if (m && m.type === 'pizza' && inBay.place === m.place) cityStartDeliver('pizza');
    else if (m && m.type === 'amb' && m.stage === 'pickup' && inBay.place === m.place) cityStartDeliver('pickup');
    else if (m && m.type === 'amb' && m.stage === 'hospital' && inBay.place === C.places.sjukhuset) cityStartDeliver('dropoff');
    else if (inBay !== S.ignoreBay && (S.bayCool[inBay.place.id] || 0) < S.t) {
      const wrong = !!(m && m.type !== 'pol'); S.bayCool[inBay.place.id] = S.t + 4; S.lastBay = inBay; S.sign = { place: inBay.place, t: wrong ? 3.4 : 3, wrong };
      Voice.say((inBay.place.garage ? cityGarageName() : inBay.place.word) + (wrong ? '. Inte här. Leta vidare!' : ''), true); Snd.play(wrong ? 'tick' : 'ding');
    }
  }
  if (S.sign) { S.sign.t -= dt; if (S.sign.t <= 0) S.sign = null; }
  // uppdrag
  const m = S.m;
  if (m && S.phase === 'drive') {
    m.t += dt;
    if (m.hunt && (m.type === 'pizza' || (m.type === 'amb' && m.stage === 'pickup'))) { const b = m.place.bay, near = Math.hypot(car.x - b.x, car.y - b.y) < 900; m.nearT = near ? (m.nearT || 0) + dt : m.nearT || 0; if (near && !m.saidHunt) { m.saidHunt = 1; Voice.say('Nu är du nära! Läs skyltarna och hitta rätt hus.', true); } if (m.nearT > 22 || m.t > (m.allow || 90) * 0.7) { m.hunt = false; S.pathT = 0; Voice.say('Titta, jag visar vägen!', true); } }
    if (m.type === 'pizza') { m.heat = clamp(1 - m.t / m.allow, 0, 1); if (m.level >= 4 && !m.gps && m.t > 12) m.gps = true; }
    else if (m.type === 'pol') { m.heat = clamp(1 - m.t / m.allow, 0, 1); if (!m.gps && m.t > m.gpsAt) m.gps = true; }
    else { m.heat = m.comfort; if (!m.gps && m.stage === 'pickup' && m.gpsAt && m.t > m.gpsAt) m.gps = true; }
    S.idleT = Math.abs(car.fs) < 20 ? S.idleT + dt : 0;
    if (S.idleT > 12 && !S.readOnce) { S.readOnce = true; Voice.say('Behöver du hjälp? Tryck på mellanslag så läser jag lappen.', true); }
    S.pathT -= dt; if (S.pathT <= 0) { S.pathT = 0.35; const old = S.raw; let raw = m.type === 'pol' ? cityPathXY(C, car.x, car.y, m.target.x, m.target.y) : cityPath(C, car.x, car.y, m.type === 'amb' && m.stage === 'hospital' ? C.places.sjukhuset.bay : m.place.bay);
      raw.tgt = raw.pts[raw.pts.length - 1] + '';
      // hysteres: byt inte väg fram och tillbaka när två vägar är lika långa (jämför alltid HELA vägen, aldrig den avkortade)
      if (old && old.tgt === raw.tgt && old.pts.length > 2 && raw.pts.length > 2 && (old.pts[1][0] !== raw.pts[1][0] || old.pts[1][1] !== raw.pts[1][1]) && Math.hypot(old.pts[1][0] - car.x, old.pts[1][1] - car.y) > 60) {
        const kept = { pts: [[car.x, car.y], ...old.pts.slice(1)], tgt: old.tgt }; let L = 0; for (let q = 1; q < kept.pts.length; q++) L += Math.hypot(kept.pts[q][0] - kept.pts[q - 1][0], kept.pts[q][1] - kept.pts[q - 1][1]);
        let L2 = 0; for (let q = 1; q < raw.pts.length; q++) L2 += Math.hypot(raw.pts[q][0] - raw.pts[q - 1][0], raw.pts[q][1] - raw.pts[q - 1][1]);
        if (L2 > L - 150) raw = kept;
      }
      S.raw = raw; S.path = raw;
      // SKYLTJAKTEN: kartan visar vägen till sista korsningen före målet – sista biten hittar man genom att läsa skyltarna
      if (m.hunt && (m.type === 'pizza' || (m.type === 'amb' && m.stage === 'pickup'))) { const pts = raw.pts.length > 2 ? raw.pts.slice(0, -1) : [raw.pts[0]]; S.path = { pts, tgt: raw.tgt, hunted: true, end: raw.pts.length > 2 ? raw.pts[raw.pts.length - 2] : null }; S.huntEnd = S.path.end || S.huntEnd; }
    }
  }
  if (S.phase === 'deliver') cityDeliverUpdate(dt);
  if (S.phase === 'result') S.res.t += dt;
  if (S.phase === 'brief' && S.brief) S.brief.t += dt;
}
// ---------- leverans ----------
function cityStartDeliver(kind) {
  const S = G.city, m = S.m; S.phase = 'deliver'; soundClear('leverans'); logEv('uppdrag', 'leverans ' + kind, m.place && m.place.id); Snd.play('ding'); Snd.engine(false, 0);
  const D = S.D = { kind, t: 0, stage: 'door', sel: 1, typed: '', err: 0, shake: 0, happyT: 0, msg: null };
  if (kind === 'pickup') { Voice.say(`Hej ${m.pat[2]}! Hoppa in, vi kör till sjukhuset.`, true); return; }
  if (kind === 'dropoff') { Voice.say('Framme vid sjukhuset!', true); return; }
  if (m.level < 5) {
    const right = m.foods.slice(), d = Words.distract(right, 4);
    const opts = m.level === 3 ? [right, [right[0], d[0]], [d[1], right[1]]] : [right, [d[0]], [d[1]]];
    D.opts = shuffle(opts); D.right = D.opts.findIndex(o => o === right);
  }
  Voice.say('Knack knack!', true);
}
function cityCatch(v) {
  const S = G.city; v.caught = true; S.phase = 'deliver'; Snd.horn('polis'); Snd.engine(false, 0);
  S.D = { kind: 'catch', t: 0, stage: 'door', veh: v, happyT: 0 }; S.car.vx *= 0.2; S.car.vy *= 0.2;
  Voice.say('Fast! Bra jobbat!', true);
}
function cityDeliverUpdate(dt) {
  const S = G.city, D = S.D, m = S.m; D.t += dt; D.shake = Math.max(0, (D.shake || 0) - dt);
  if (D.msg) { D.msg.t -= dt; if (D.msg.t <= 0) D.msg = null; }
  if (D.kind === 'pickup') { if (D.t > 3.2) { m.stage = 'hospital'; m.gps = true; S.car.siren = true; S.phase = 'drive'; cityFaceRoute(S, S.C.places.sjukhuset.bay.x, S.C.places.sjukhuset.bay.y); S.path = null; S.raw = null; S.pathT = 0; S.bayCool[m.place.id] = S.t + 5; Voice.say('Kör till sjukhuset. Kör mjukt så patienten mår bra!', true); } return; }
  if (D.kind === 'dropoff') { if (D.t > 3.4) cityFinishMission(); return; }
  if (D.kind === 'catch') { if (D.t > 3.6) cityFinishMission(); return; }
  if (D.stage === 'door' && D.t > 1.4) {
    if (m.level === 5) { D.stage = 'typeIntro'; D.ti = 0; Snd.play('fanfar'); Voice.say(`Nu ska du skriva! Kunden vill ha ${m.foods[0].toLowerCase()}. Skriv ordet med tangentbordet.`, true); }
    else { D.stage = 'choose'; Voice.say('Hej! Vilken pizza är min?', true); }
  }
  if (D.stage === 'typeIntro') { D.ti += dt; if (D.ti > 3.2) { D.stage = 'type'; D.typeT = 0; } }
  if (D.stage === 'type') { D.typeT = (D.typeT || 0) + dt; if (D.typeT > 9 && !D.typed.length && !D.nudged) { D.nudged = true; Voice.say(`Ordet är ${m.foods[0].toLowerCase()}. Vilken bokstav börjar det på?`, true); } }
  if (D.stage === 'happy') { D.happyT += dt; if (D.happyT > 2.6) cityFinishMission(); }
}
function cityDeliverKey(e) {
  const S = G.city, D = S.D, m = S.m;
  if (D.stage === 'choose') {
    if (e.code === 'ArrowLeft') { D.sel = (D.sel + 2) % 3; Snd.play('move'); }
    else if (e.code === 'ArrowRight') { D.sel = (D.sel + 1) % 3; Snd.play('move'); }
    else if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) {
      if (D.sel === D.right) { Words.record(m.foods, D.err === 0, m.helped); cityHappy(); }
      else { D.err++; D.shake = 0.5; Snd.play('buzz'); D.msg = { text: 'NEJ TACK!', t: 1.4 }; if (D.err >= 2) Voice.say(`Jag vill ha ${cityOrderText(m).toLowerCase()}!`, true); else Voice.say('Nej tack! Titta igen.', true); }
    }
  } else if (D.stage === 'type' || D.stage === 'typeIntro') {
    if (e.code === 'Space' && !e.repeat) { Voice.say(m.foods[0].toLowerCase(), true); m.helped = true; return; }
    if (D.stage === 'typeIntro') { if (!/^Key|^Bracket|^Semicolon|^Quote/.test(e.code)) return; D.stage = 'type'; D.typeT = 0; }
    const word = m.foods[0], need = word[D.typed.length], k = (e.key || '').toUpperCase();
    if (k.length === 1 && /[A-ZÅÄÖ]/.test(k) && !e.repeat) {
      if (k === need) { D.typed += k; Snd.play('coin'); Voice.say(k.toLowerCase(), true); if (D.typed === word) { const rd = readData(); rd.typed.tries++; if (D.err === 0) rd.typed.ok++; Words.record([word], D.err === 0, m.helped); setTimeout(() => Voice.say(word.toLowerCase() + '!', true), 400); cityHappy(); } }
      else { D.err++; D.shake = 0.4; Snd.play('buzz'); if (D.err >= 2) { D.hint = true; Voice.say(`Nästa bokstav är ${need.toLowerCase()}`, true); } }
    }
  }
}
function cityHappy() { const S = G.city, D = S.D; D.stage = 'happy'; D.happyT = 0; Snd.play('fanfar'); Voice.say(['Tack så mycket!', 'Mums! Tack!', 'Precis vad jag ville ha!'][Math.floor(Math.random() * 3)], true); }
function cityFinishMission() {
  const S = G.city, m = S.m, cd = cityData(); logEv('uppdrag', 'klart', { typ: m.type, t: Math.round(m.t || 0) });
  const q = m.type === 'amb' ? m.comfort : m.heat, stars = q > (m.type === 'amb' ? 0.65 : 0.5) ? 3 : q > (m.type === 'amb' ? 0.3 : 0.15) ? 2 : 1;
  const hero = S.tl >= 1 && !m.red && !m.scare && (m.hero || 0) > 0;
  const coins = (5 + stars * 5) * (m.hard ? 3 : 1) + (hero ? 5 : 0);
  addCoins(coins); cd.deliveries++;
  if (m.story >= 0) { const arr = cd[m.type === 'pizza' ? 'pizza' : m.type]; arr[m.story] = Math.max(arr[m.story] || 0, stars); }
  if (m.type === 'pol') S.veh = S.veh.filter(v => !v.suspect);
  S.car.siren = m.type === 'pol';
  let deco = null; if (cd.deco < CITY_DECOS.length && (m.story >= 0 || cd.deliveries % 2 === 0)) { deco = CITY_DECOS[cd.deco]; cd.deco++; }
  saveProf();
  S.phase = 'result'; S.res = { t: 0, stars, coins, deco, hero, title: { pizza: 'LEVERERAT! 🍕', amb: 'PATIENTEN ÄR FRAMME! 🏥', pol: 'TJUVEN ÄR FAST! 🚓' }[m.type] };
  Snd.play('star'); setTimeout(() => Voice.say(`${{ pizza: 'Levererat!', amb: 'Bra kört, ambulansförare!', pol: 'Tjuven är fast!' }[m.type]} ${stars} stjärnor!` + (hero ? ' Du är en trafikhjälte!' : '') + (deco ? ` Nytt i staden: ${deco.name.toLowerCase()}!` : ''), true), 400);
}
function cityKey(e) {
  const S = G.city;
  if (e.code === 'Escape' && !e.repeat) { if (S.phase !== 'deliver') cityExit(); return; }
  if (S.phase === 'brief') { if (e.repeat) return; if (e.code === 'Space') { cityReadAloud(); return; } if (e.code === 'KeyH') { Snd.horn(S.car.horn || 'tut'); return; } if (S.brief && S.brief.t > 0.8) { S.phase = 'drive'; S.brief = null; Snd.play('click'); Voice.stop(); } return; }
  if (S.phase === 'drive') { if (e.code === 'Space' && !e.repeat) cityReadAloud(); if (e.code === 'KeyH' && !e.repeat) Snd.horn(S.car.horn || 'tut'); return; }
  if (S.phase === 'deliver') return cityDeliverKey(e);
  if (S.phase === 'result' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) { S.res.sel = S.res.sel ? 0 : 1; Snd.play('move'); Voice.say(S.res.sel ? (S.mode === 'pol' ? 'Jättesvårt! Längre mening att läsa och radarn kommer senare. Tre gånger så många mynt!' : S.mode === 'amb' ? 'Jättesvårt! Längre mening att läsa och kartan kommer senare. Tre gånger så många mynt!' : 'Jättesvårt! Svårare ord och gåtor, och du får leta själv. Tre gånger så många mynt!') : 'Nästa uppdrag. Vanlig nivå.', true); return; }
  if (S.phase === 'result' && (e.code === 'Enter' || e.code === 'Space') && !e.repeat && S.res.t > 0.8) { S.hard = !!S.res.sel; const car = S.car; car.vx = car.vy = 0; car.fs = 0; S.D = null; cityNewMission(); }
}
function cityExit() {
  Snd.engine(false, 0); Voice.stop(); soundClear('lämnar staden'); logEv('stad', 'avslutad'); G.city = null; G.mode = 'none';
  startDemo(); Snd.music('menu'); screenStack.length = 0; screenStack.push('title'); screenStack.push('hub'); curScreen = null; buildCityMenu(); showScreen('city', false);
}

// ---------- ritning ----------
function drawCity() {
  const S = G.city, C = S.C, car = S.car, cam = G.cam, t = G.time, u = H / 1000;
  const zoom = H / cam.vh, follow = SETTINGS.cam !== 'fixed';
  const sx = (Math.random() - 0.5) * cam.shake * DPR, sy = (Math.random() - 0.5) * cam.shake * DPR;
  const rot = cam.rot = follow ? -Math.PI / 2 - cam.a : 0;
  let pc;
  if (follow) { ctx.setTransform(1, 0, 0, 1, W / 2 + sx, H * 0.64 + sy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cam.x, -cam.y); const dy = -0.14 * H / zoom; pc = [cam.x + (-dy * Math.sin(-rot)), cam.y + dy * Math.cos(-rot)]; }
  else { ctx.setTransform(zoom, 0, 0, zoom, W / 2 - cam.x * zoom + sx, H / 2 - cam.y * zoom + sy); pc = [cam.x, cam.y]; }
  const Rv = Math.hypot(W, H) * 0.6 / zoom + 200, view = { x0: pc[0] - Rv, y0: pc[1] - Rv, x1: pc[0] + Rv, y1: pc[1] + Rv };
  const inV = (x, y, r) => x + r > view.x0 && x - r < view.x1 && y + r > view.y0 && y - r < view.y1;
  drawCityGround(C, ctx, view, t);
  const m = S.m, target = !m || m.type === 'pol' ? null : m.type === 'amb' && m.stage === 'hospital' ? C.places.sjukhuset.bay : m.place.bay;
  for (const b of C.bays) if (inV(b.x, b.y, 120)) drawBay(ctx, b, t, b === target && !(m && m.hunt && (m.type === 'pizza' || m.stage === 'pickup')));
  // GPS-linje
  if (m && S.phase === 'drive' && m.gps && S.path && (m.type !== 'pol' || m.level <= 3)) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,214,0,0.35)'; ctx.lineWidth = 46; ctx.beginPath(); S.path.pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 16; ctx.setLineDash([40, 36]); ctx.lineDashOffset = -t * 120; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
  // skyltjakt: markera var kartan slutar – härifrån letar man själv
  if (m && S.phase === 'drive' && m.gps && S.path && S.path.hunted && S.path.end && inV(S.path.end[0], S.path.end[1], 200)) { const [ex, ey] = S.path.end, pr = 1 + Math.sin(t * 4) * 0.08; ctx.strokeStyle = 'rgba(255,214,0,0.9)'; ctx.lineWidth = 12; ctx.setLineDash([30, 22]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.arc(ex, ey, 150 * pr, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.save(); ctx.translate(ex, ey); ctx.rotate(-G.cam.rot); ctx.font = '90px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🔍', 0, 0); ctx.restore(); }
  // mynt
  if (C.coins) for (const k of C.coins) if (!k.got && inV(k.x, k.y, 30)) drawCoin(ctx, k.x, k.y, 22, t);
  if (S.letters) for (const L of S.letters) if (!L.got && inV(L.x, L.y, 60)) drawGoldLetter(ctx, L.x, L.y, t, rot);
  // fontän
  if (inV(C.fountain.x, C.fountain.y, 200)) { const f = C.fountain; ctx.fillStyle = '#90a4ae'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill(); ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r - 16, 0, TAU); ctx.fill(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t, r2 = 30 + ((t * 60 + k * 9) % 60); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r2, f.y + Math.sin(a) * r2, 6, 0, TAU); ctx.fill(); } }
  cityDrawDecos(ctx, C, t, rot, inV);
  drawTrafficLights(ctx, S, t, rot, inV);
  for (const v of S.veh) if (inV(v.x, v.y, 120)) drawTrafficVehicle(ctx, v, t);
  // bilar
  for (const p of C.parked) if (inV(p.x, p.y, 60)) { ctx.save(); ctx.translate(p.x + 4, p.y + 6); ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, -34, -19, 68, 38, 14); ctx.fill(); ctx.restore(); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); drawCar(ctx, p.d, 0); ctx.restore(); }
  if (m && m.type === 'pizza' && S.phase === 'drive') { ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.a); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 3; rr(ctx, -16, -14, 30, 28, 4); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = `rgba(255,235,59,${0.5 + Math.sin(t * 6) * 0.3})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(car.x, car.y, 42, 0, TAU); ctx.stroke();
  drawCarWorld(car, t);
  if (m && m.type === 'pizza' && S.phase === 'drive') { ctx.save(); ctx.translate(car.x, car.y); ctx.rotate(car.a); ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.rotate(Math.PI / 2); ctx.fillText('🍕', 0, 0); ctx.restore(); }
  // fotgängare
  for (const pd of C.peds) if (pd.x != null && inV(pd.x, pd.y, 60)) drawPed(ctx, C, pd, t, rot);
  drawCrossers(ctx, S, t, rot);
  // zoo-djur
  if (C.zoo && inV((C.zoo.x0 + C.zoo.x1) / 2, (C.zoo.y0 + C.zoo.y1) / 2, 600)) { const z = C.zoo; ['🦒', '🐘', '🦓', '🐒', '🦁'].forEach((a, k) => { const x = z.x0 + 120 + k * 140 + Math.sin(t * 0.5 + k) * 30, y = z.y0 + 160 + (k % 2) * 180; ctx.save(); ctx.translate(x, y); ctx.rotate(-rot); ctx.font = '90px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a, 0, Math.sin(t * 3 + k) * 6); ctx.restore(); }); }
  // hus (längst bort först) + trädkronor + lyktstolpar
  const bs = C.buildings.filter(b => b.x1 > view.x0 && b.x0 < view.x1 && b.y1 > view.y0 && b.y0 < view.y1).sort((a, b) => Math.hypot((b.x0 + b.x1) / 2 - pc[0], (b.y0 + b.y1) / 2 - pc[1]) - Math.hypot((a.x0 + a.x1) / 2 - pc[0], (a.y0 + a.y1) / 2 - pc[1]));
  for (const b of bs) drawBuilding(ctx, b, pc, t, rot, car);
  for (const tr of C.trees) if (inV(tr.x, tr.y, 60)) drawTree(ctx, tr, t);
  for (const l of C.lamps) if (inV(l.x, l.y, 30)) { ctx.fillStyle = '#455a64'; ctx.beginPath(); ctx.arc(l.x, l.y, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(l.x, l.y, 5, 0, TAU); ctx.fill(); }
  // målmarkör
  if (target && S.phase === 'drive' && !(m.hunt && (m.type === 'pizza' || m.stage === 'pickup'))) { const b = target; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(-rot); const bob = Math.sin(t * 5) * 12; ctx.fillStyle = '#76ff03'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -60 + bob); ctx.lineTo(-30, -110 + bob); ctx.lineTo(30, -110 + bob); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  if (m && m.type === 'pol' && S.phase === 'drive' && m.gps && m.level <= 2) { const v = m.target; ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(-rot); const bob = Math.sin(t * 5) * 10; ctx.fillStyle = '#ff5252'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -50 + bob); ctx.lineTo(-24, -92 + bob); ctx.lineTo(24, -92 + bob); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  drawParts(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawCityHUD(S, u, t);
}
function cityDrawDecos(ctx, C, t, rot, inV) {
  const n = cityData().deco, has = id => CITY_DECOS.findIndex(d => d.id === id) < n;
  const up = (x, y, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-rot); fn(); ctx.restore(); };
  if (has('blommor')) { const f = C.fountain; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; const x = f.x + Math.cos(a) * 170, y = f.y + Math.sin(a) * 170; ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); for (let q = 0; q < 5; q++) { ctx.fillStyle = ['#e91e63', '#ffeb3b', '#ab47bc', '#ff7043', '#fff'][q]; ctx.beginPath(); ctx.arc(x + Math.cos(q * 1.3) * 12, y + Math.sin(q * 1.3) * 12, 8, 0, TAU); ctx.fill(); } } }
  if (has('staty')) { const p = C.places.parken.rect, x = p.x0 + 110, y = p.y0 + 110; if (inV(x, y, 200)) { ctx.fillStyle = '#9e9e9e'; ctx.fillRect(x - 50, y - 50, 100, 100); up(x, y, () => { ctx.translate(0, -100); const f = Object.assign({}, G.player.who.fig, { suit: 3, hairCol: 2 }); drawRig(ctx, f, 22, 0, 'cheer', { legs: true }); }); } }
  if (has('ballonger')) { const b = C.places.skolan.bay; if (inV(b.x, b.y, 300)) up(b.x, b.y - 90, () => { for (let k = 0; k < 6; k++) { const x = -110 + k * 44, y = -120 + Math.sin(t * 2 + k) * 10; ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(0, 40); ctx.stroke(); ctx.fillStyle = TOY_COLS[k % TOY_COLS.length]; ctx.beginPath(); ctx.ellipse(x, y, 22, 28, 0, 0, TAU); ctx.fill(); } }); }
  if (has('flaggor')) { const r = C.places.hamnen.rect; for (let k = 0; k < 5; k++) { const x = r.x0 + 60 + k * 170, y = rc(CRIVER) + CRW / 2 + 40; if (!inV(x, y, 100)) continue; up(x, y, () => { ctx.fillStyle = '#795548'; ctx.fillRect(-4, -110, 8, 110); ctx.fillStyle = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#ab47bc'][k]; ctx.beginPath(); ctx.moveTo(4, -110); ctx.lineTo(70 + Math.sin(t * 5 + k) * 8, -92); ctx.lineTo(4, -74); ctx.fill(); }); } }
  if (has('regnbage')) { const x = rc(2), y = rc(CRIVER); if (inV(x, y, 700)) { const cols = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa']; ctx.lineWidth = 30; cols.forEach((c, k) => { ctx.strokeStyle = c; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(x, y + 200, 560 - k * 30, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }); ctx.globalAlpha = 1; } }
  if (has('glassbil')) { const b = C.places.glassbaren.bay; const x = b.x + 260, y = b.y; if (inV(x, y, 100)) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#f8bbd0'; rr(ctx, -60, -32, 120, 64, 14); ctx.fill(); ctx.strokeStyle = '#ad1457'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); up(x, y, () => { ctx.font = '50px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🍦', 0, 0); }); } }
  if (has('fyrverkeri') && (t % 6) < 1.2) { const k = Math.floor(t / 6), x = G.cam.x + Math.sin(k * 7) * 300, y = G.cam.y + Math.cos(k * 5) * 300, r = (t % 6) * 200; for (let q = 0; q < 16; q++) { const a = q / 16 * TAU; ctx.fillStyle = `hsl(${(k * 60 + q * 20) % 360},90%,60%)`; ctx.globalAlpha = 1 - (t % 6) / 1.2; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 10, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}
function drawCityHUD(S, u, t) {
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, align = 'center', stroke = 7) => { ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; if (stroke) { ctx.lineWidth = stroke * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const m = S.m, car = S.car, C = S.C;
  // minikarta
  { const mw = 250 * u, x0 = W - mw - 24 * u, y0 = H - mw - 24 * u, E = CITY_EDGE, sc = mw / (E.x1 - E.x0), X = x => x0 + (x - E.x0) * sc, Y = y => y0 + (y - E.y0) * sc;
    ctx.fillStyle = 'rgba(20,10,50,0.6)'; rr(ctx, x0 - 8 * u, y0 - 8 * u, mw + 16 * u, mw + 16 * u, 16 * u); ctx.fill();
    ctx.fillStyle = '#9ccc65'; ctx.fillRect(X(E.x0), Y(E.y0), mw, mw);
    ctx.fillStyle = '#4fa3d9'; ctx.fillRect(X(E.x0), Y(rc(CRIVER) - CRW / 2), mw, CRW * sc);
    ctx.fillStyle = '#eceff1'; for (let i = 0; i <= CN; i++) ctx.fillRect(X(rc(i) - CRW / 2), Y(-CRW / 2), CRW * sc, (rc(CN) + CRW) * sc); for (let j = 0; j <= CN; j++) if (j !== CRIVER) ctx.fillRect(X(-CRW / 2), Y(rc(j) - CRW / 2), (rc(CN) + CRW) * sc, CRW * sc);
    ctx.fillStyle = '#4fa3d9'; for (let i = 0; i <= CN; i++) if (!CBRIDGES.includes(i)) ctx.fillRect(X(rc(i) - CRW / 2), Y(rc(CRIVER) - CRW / 2), CRW * sc, CRW * sc);
    if (m && m.type === 'pol') { if (m.gps) { const v = m.target; ctx.fillStyle = '#ff5252'; ctx.beginPath(); ctx.arc(X(v.x), Y(v.y), (7 + Math.sin(t * 6) * 2) * u, 0, TAU); ctx.fill(); } }
    else if (m && m.hunt && (m.type === 'pizza' || m.stage === 'pickup')) { const b = m.place.bay, e = S.huntEnd || [b.x + 137, b.y - 211]; ctx.fillStyle = 'rgba(255,214,0,0.35)'; ctx.beginPath(); ctx.arc(X(e[0]), Y(e[1]), 900 * sc, 0, TAU); ctx.fill(); ctx.font = font(18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🔍', X(e[0]), Y(e[1])); }
    else if (m) { const b = (m.type === 'amb' && m.stage === 'hospital' ? C.places.sjukhuset : m.place).bay; ctx.fillStyle = '#76ff03'; ctx.beginPath(); ctx.arc(X(b.x), Y(b.y), (7 + Math.sin(t * 6) * 2) * u, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 2 * u; ctx.stroke(); }
    ctx.save(); ctx.translate(X(car.x), Y(car.y)); ctx.rotate(car.a); ctx.fillStyle = '#ffd600'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(9 * u, 0); ctx.lineTo(-6 * u, -6 * u); ctx.lineTo(-6 * u, 6 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // uppdragskort
  if (m && m.type !== 'pizza' && S.phase === 'drive') drawCityCard2(S, m, u, t, font, txt);
  if (m && m.type === 'pizza' && S.phase === 'drive') {
    const x0 = 22 * u, y0 = 22 * u, w = 560 * u, h = 250 * u;
    ctx.fillStyle = 'rgba(255,253,245,0.96)'; rr(ctx, x0, y0, w, h, 22 * u); ctx.fill(); ctx.strokeStyle = '#ffab40'; ctx.lineWidth = 6 * u; ctx.stroke();
    ctx.font = `600 ${17 * u | 0}px Arial`; ctx.fillStyle = '#8d6e63'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`🍕 Pizzabud · nivå ${m.level}: ${['', 'ord och bild', 'bara ord', 'två ord', 'kort mening', 'skriv själv'][m.level]}`, x0 + 20 * u, y0 + 24 * u);
    const p = m.place, dword = p.garage ? cityGarageName() : p.word;
    if (m.level === 4) txt('KÖR TILL ' + dword, x0 + 20 * u, y0 + 78 * u, dword.length > 11 ? 36 : 44, '#1a1033', 'left', 0);
    else { if (p.house) { ctx.fillStyle = p.col; ctx.fillRect(x0 + 22 * u, y0 + 58 * u, 44 * u, 40 * u); } else { ctx.font = font(44); ctx.textAlign = 'left'; ctx.fillText(p.ico, x0 + 18 * u, y0 + 80 * u); } txt(dword, x0 + 80 * u, y0 + 78 * u, dword.length > 11 ? 40 : 50, '#1a1033', 'left', 0); }
    // beställning
    ctx.fillStyle = '#fff3e0'; rr(ctx, x0 + 16 * u, y0 + 112 * u, w - 32 * u, 72 * u, 14 * u); ctx.fill();
    if (m.level === 5) txt('✏️ DU SKRIVER ORDET!', x0 + 30 * u, y0 + 150 * u, 40, '#bf360c', 'left', 0);
    else { const s = (m.level === 1 ? FOODS[m.foods[0]] + ' ' : '🍕 ') + cityOrderText(m); txt(s, x0 + 30 * u, y0 + 150 * u, s.length > 22 ? 26 : s.length > 14 ? 34 : 46, '#bf360c', 'left', 0); }
    // värmemätare
    const hw = w - 150 * u; ctx.fillStyle = '#eceff1'; rr(ctx, x0 + 60 * u, y0 + 200 * u, hw, 26 * u, 13 * u); ctx.fill();
    ctx.fillStyle = m.heat > 0.5 ? '#ff7043' : m.heat > 0.15 ? '#ffca28' : '#90caf9'; rr(ctx, x0 + 60 * u, y0 + 200 * u, Math.max(26 * u, hw * m.heat), 26 * u, 13 * u); ctx.fill();
    ctx.font = font(30); ctx.textAlign = 'left'; ctx.fillText(m.heat > 0.15 ? '🔥' : '🧊', x0 + 18 * u, y0 + 214 * u); ctx.fillText('⭐'.repeat(m.heat > 0.5 ? 3 : m.heat > 0.15 ? 2 : 1), x0 + 70 * u + hw, y0 + 214 * u);
    // tips
    ctx.globalAlpha = 0.75 + Math.sin(t * 4) * 0.25; txt('MELLANSLAG = LÄS UPP 🔊', x0 + 20 * u, y0 + h + 34 * u, 26, '#fff', 'left', 6); ctx.globalAlpha = 1;
    if (!m.gps) txt('LÄS SKYLTARNA! KARTAN KOMMER SNART', x0 + 20 * u, y0 + h + 72 * u, 22, '#ffd600', 'left', 5);
    else if (m.hunt && m.nearT > 0) { ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.4; txt('📖 LÄS SKYLTARNA – VILKET HUS?', x0 + 20 * u, y0 + h + 72 * u, 26, '#ffd600', 'left', 6); ctx.globalAlpha = 1; }
  }
  if (!m && S.phase === 'drive') { txt('FRI KÖRNING', 24 * u, 50 * u, 44, '#fff', 'left'); txt('🪙 ' + S.coins, 24 * u, 110 * u, 40, '#ffd600', 'left'); txt('STANNA I EN RUTA = LÄS SKYLTEN', 24 * u, 160 * u, 22, '#fff', 'left', 5); }
  // skylt när man stannat i en ruta
  if (S.sign && S.phase === 'drive') { const p = S.sign.place, word = p.garage ? cityGarageName() : p.word, a = Math.min(1, S.sign.t * 3); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,0.96)'; ctx.font = font(80); const tw = ctx.measureText(word).width + 140 * u; rr(ctx, W / 2 - tw / 2, H * 0.3 - 70 * u, tw, 140 * u, 24 * u); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 6 * u; ctx.stroke(); txt((p.house ? '🏠 ' : p.ico + ' ') + word, W / 2, H * 0.3, 80, '#1a1033', 'center', 0); if (S.sign.wrong) { ctx.fillStyle = '#ff7043'; const w2 = 460 * u; rr(ctx, W / 2 - w2 / 2, H * 0.3 + 60 * u, w2, 60 * u, 16 * u); ctx.fill(); txt('INTE HÄR – LETA VIDARE 🔍', W / 2, H * 0.3 + 91 * u, 30, '#fff', 'center', 0); } ctx.globalAlpha = 1; }
  // pil mot nästa punkt på vägen
  if (m && m.type === 'pol' && S.phase === 'drive' && m.gps) { const v = m.target; let tp = [v.x, v.y]; if (S.path) for (const pt of S.path.pts.slice(1)) { if (Math.hypot(pt[0] - car.x, pt[1] - car.y) > 180) { tp = pt; break; } } const a = Math.atan2(tp[1] - car.y, tp[0] - car.x) + G.cam.rot; ctx.save(); ctx.translate(W / 2, 70 * u); ctx.rotate(a); ctx.fillStyle = '#ff5252'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(46 * u, 0); ctx.lineTo(-10 * u, -30 * u); ctx.lineTo(-10 * u, -12 * u); ctx.lineTo(-36 * u, -12 * u); ctx.lineTo(-36 * u, 12 * u); ctx.lineTo(-10 * u, 12 * u); ctx.lineTo(-10 * u, 30 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); txt('RADAR', W / 2, 118 * u, 18, '#fff', 'center', 4); }
  if (m && m.type !== 'pol' && m.gps && S.phase === 'drive' && S.path && S.path.pts.length > 1) {
    let tx = S.path.pts[S.path.pts.length - 1]; for (const pt of S.path.pts.slice(1)) { if (Math.hypot(pt[0] - car.x, pt[1] - car.y) > 180) { tx = pt; break; } }
    const a = Math.atan2(tx[1] - car.y, tx[0] - car.x) + G.cam.rot; ctx.save(); ctx.translate(W / 2, 70 * u); ctx.rotate(a); ctx.fillStyle = '#76ff03'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(46 * u, 0); ctx.lineTo(-10 * u, -30 * u); ctx.lineTo(-10 * u, -12 * u); ctx.lineTo(-36 * u, -12 * u); ctx.lineTo(-36 * u, 12 * u); ctx.lineTo(-10 * u, 12 * u); ctx.lineTo(-10 * u, 30 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  if (G.banner) { const b = G.banner; txt(b.text, W / 2, H * 0.4, 90, b.color, 'center', 12); }
  if (S.phase === 'drive') { ctx.globalAlpha = 0.7; txt('ESC = MENY', W - 24 * u, 30 * u, 20, '#fff', 'right', 4); ctx.globalAlpha = 1; }
  if (S.phase === 'brief' && S.brief) drawCityBrief(S);
  if (S.phase === 'deliver') drawDeliver(S, u, t, font, txt);
  if (S.phase === 'result') drawCityResult(S, u, t, txt);
  drawSoundStrip();
}
function drawDeliver(S, u, t, font, txt) {
  const D = S.D, m = S.m; if (D.kind !== 'pizza') return drawScene2(S, u, t, font, txt);
  const b = m.place.bay.b;
  ctx.fillStyle = 'rgba(10,5,30,0.55)'; ctx.fillRect(0, 0, W, H);
  // fasad
  const fx = W * 0.2, fw = W * 0.6, fy = H * 0.08, fh = H * 0.5, col = b ? b.col : '#ffe0b2';
  ctx.fillStyle = col; rr(ctx, fx, fy, fw, fh, 20 * u); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 6 * u; ctx.stroke();
  for (const sx of [-1, 1]) { ctx.fillStyle = '#b3e5fc'; rr(ctx, W / 2 + sx * fw * 0.3 - 70 * u, fy + fh * 0.2, 140 * u, 110 * u, 10 * u); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 8 * u; ctx.stroke(); }
  const dw = 170 * u, dh = fh * 0.62, dx = W / 2 - dw / 2, dy = fy + fh - dh;
  ctx.fillStyle = '#3e2723'; ctx.fillRect(dx, dy, dw, dh);
  const open = clamp(D.t / 0.7, 0, 1); ctx.fillStyle = '#6d4c41'; ctx.fillRect(dx, dy, dw * (1 - open * 0.85), dh);
  ctx.fillStyle = '#fff'; ctx.font = font(30); ctx.textAlign = 'center'; ctx.fillText((m.place.house ? '🏠 ' : m.place.ico + ' ') + (m.place.garage ? cityGarageName() : m.place.word), W / 2, fy + 40 * u);
  // kunden
  const walk = clamp((D.t - 0.5) / 0.8, 0, 1), R = 60 * u, cx = W / 2, cy = dy + dh - R * 3.4 + walk * 90 * u;
  const pose = D.stage === 'happy' ? DANCES[(m.place.id.length) % DANCES.length][0] : D.shake > 0 ? 'sulk' : walk < 1 ? 'walk' : 'wave';
  ctx.save(); ctx.translate(cx + (D.shake > 0 ? Math.sin(D.shake * 40) * 10 * u : 0), cy); ctx.globalAlpha = walk > 0 ? 1 : 0; drawRig(ctx, m.cust, R, t, pose, { legs: true }); ctx.restore(); ctx.globalAlpha = 1;
  // pratbubbla
  if (D.stage !== 'door') {
    const bx = cx + 150 * u, by = fy + 60 * u, bw = 420 * u, bh = 150 * u;
    ctx.fillStyle = '#fff'; rr(ctx, bx, by, bw, bh, 26 * u); ctx.fill(); ctx.beginPath(); ctx.moveTo(bx + 30 * u, by + bh); ctx.lineTo(bx - 20 * u, by + bh + 50 * u); ctx.lineTo(bx + 90 * u, by + bh); ctx.fill();
    let s;
    if (D.stage === 'happy') s = 'TACK! 😋';
    else if (D.msg) s = D.msg.text;
    else if (m.level === 5) s = m.dictate || !FOODS[m.foods[0]] ? 'SKRIV ORDET 🔊' : 'JAG VILL HA ' + FOODS[m.foods[0]];
    else s = (m.level === 1 ? FOODS[m.foods[0]] + ' ' : '') + cityOrderText(m);
    txt(s, bx + bw / 2, by + bh / 2, s.length > 22 ? 24 : s.length > 12 ? 38 : 54, '#1a1033', 'center', 0);
  }
  // pizzakartonger eller bokstäver
  if (D.stage === 'choose' || (D.stage === 'happy' && D.opts)) {
    const bw = 230 * u, gap = 60 * u, y = H * 0.66;
    D.opts.forEach((o, k) => {
      const x = W / 2 + (k - 1) * (bw + gap), sel = k === D.sel, lift = sel ? -14 * u + Math.sin(t * 6) * 4 * u : 0, done = D.stage === 'happy' && k === D.right;
      if (D.stage === 'happy' && !done) ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#e0c9a6'; rr(ctx, x - bw / 2, y + lift, bw, bw * 0.8, 14 * u); ctx.fill(); ctx.strokeStyle = sel ? '#ffd600' : '#8d6e63'; ctx.lineWidth = (sel ? 10 : 5) * u; ctx.stroke();
      ctx.fillStyle = '#c62828'; ctx.font = font(22); ctx.textAlign = 'center'; ctx.fillText('PIZZA', x, y + lift + 28 * u);
      ctx.font = font(o.length > 1 ? 70 : 96); ctx.fillText(o.map(f => FOODS[f] || '❓').join(''), x, y + lift + bw * 0.48);
      ctx.globalAlpha = 1;
    });
    if (D.stage === 'choose') txt('◀ ▶ VÄLJ · ENTER = GE PIZZAN', W / 2, H * 0.93, 30, '#fff', 'center', 6);
  }
  if (D.stage === 'type' || (D.stage === 'happy' && m.level === 5)) {
    const word = m.foods[0], n = word.length, sw = 120 * u, y = H * 0.68;
    for (let k = 0; k < n; k++) { const x = W / 2 + (k - (n - 1) / 2) * (sw + 20 * u) + (k === D.typed.length && D.shake > 0 ? Math.sin(D.shake * 50) * 8 * u : 0); ctx.fillStyle = k < D.typed.length ? '#c8e6c9' : '#fff'; rr(ctx, x - sw / 2, y, sw, sw * 1.15, 16 * u); ctx.fill(); ctx.strokeStyle = k === D.typed.length ? '#ffd600' : '#90a4ae'; ctx.lineWidth = 7 * u; ctx.stroke();
      if (k < D.typed.length) txt(word[k], x, y + sw * 0.6, 90, '#1b5e20', 'center', 0); else if (D.hint && k === D.typed.length) { ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.2; txt(word[k], x, y + sw * 0.6, 90, '#90a4ae', 'center', 0); ctx.globalAlpha = 1; } }
    if (D.stage === 'type') { txt('⌨️ SKRIV ORDET PÅ TANGENTBORDET!', W / 2, H * 0.905, 32, '#fff', 'center', 6); ctx.globalAlpha = 0.85; txt('MELLANSLAG = HÖR ORDET 🔊', W / 2, H * 0.96, 22, '#ffd600', 'center', 5); ctx.globalAlpha = 1; }
  }
  if (D.stage === 'typeIntro') drawTypeIntro(D, u, t, font, txt);
}
// Tydlig övergång från "läsa och välja" till "skriva själv": stor skylt + ett tangentbord där tangenter trycks ned
function drawTypeIntro(D, u, t, font, txt) {
  const a = Math.min(1, D.ti * 4), sc = 0.85 + 0.15 * Math.min(1, D.ti * 5);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(10,5,30,0.6)'; ctx.fillRect(0, 0, W, H);
  ctx.translate(W / 2, H * 0.5); ctx.scale(sc, sc);
  const cw = 900 * u, ch = 560 * u; ctx.fillStyle = '#fffdf5'; rr(ctx, -cw / 2, -ch / 2, cw, ch, 30 * u); ctx.fill(); ctx.strokeStyle = '#ff9100'; ctx.lineWidth = 12 * u; ctx.stroke();
  ctx.fillStyle = '#ff9100'; rr(ctx, -cw / 2, -ch / 2, cw, 120 * u, 30 * u); ctx.fill(); ctx.fillRect(-cw / 2, -ch / 2 + 80 * u, cw, 40 * u);
  txt('✏️ NU SKA DU SKRIVA!', 0, -ch / 2 + 62 * u, 64, '#fff', 'center', 8);
  txt('KUNDEN SÄGER ORDET – DU SKRIVER DET', 0, -ch / 2 + 165 * u, 30, '#6d4c41', 'center', 0);
  const rows = ['QWERTYUIOPÅ', 'ASDFGHJKLÖÄ', 'ZXCVBNM'], k = 62 * u, hot = Math.floor(t * 3);
  rows.forEach((r, ri) => { const x0 = -(r.length * k) / 2 + ri * 14 * u, y = -30 * u + ri * (k + 8 * u); [...r].forEach((c, ci) => { const on = (ci * 7 + ri * 5 + hot) % 9 === 0, x = x0 + ci * k, dn = on ? 5 * u : 0; ctx.fillStyle = '#90a4ae'; rr(ctx, x + 3 * u, y + 6 * u, k - 8 * u, k - 8 * u, 10 * u); ctx.fill(); ctx.fillStyle = on ? '#ffd600' : '#fff'; rr(ctx, x + 3 * u, y + dn, k - 8 * u, k - 8 * u, 10 * u); ctx.fill(); ctx.strokeStyle = '#78909c'; ctx.lineWidth = 2 * u; ctx.stroke(); txt(c, x + k / 2 - 1 * u, y + dn + k / 2 - 4 * u, 28, '#1a1033', 'center', 0); }); });
  ctx.globalAlpha = a * (0.7 + Math.sin(t * 5) * 0.3); txt('TRYCK PÅ EN BOKSTAV FÖR ATT BÖRJA', 0, ch / 2 - 40 * u, 26, '#2e7d32', 'center', 0);
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawCityResult(S, u, t, txt) {
  const R = S.res; ctx.fillStyle = 'rgba(10,5,30,0.7)'; ctx.fillRect(0, 0, W, H);
  const w = 760 * u, h = 480 * u, x = W / 2 - w / 2, y = H / 2 - h / 2;
  ctx.fillStyle = '#fffdf5'; rr(ctx, x, y, w, h, 30 * u); ctx.fill(); ctx.strokeStyle = '#ffab40'; ctx.lineWidth = 8 * u; ctx.stroke();
  txt(R.title || 'LEVERERAT! 🍕', W / 2, y + 70 * u, R.title && R.title.length > 16 ? 48 : 64, '#e65100', 'center', 0);
  for (let k = 0; k < 3; k++) { const on = k < R.stars, s = on ? 1 + Math.max(0, 0.4 - (R.t - k * 0.25)) : 1; ctx.save(); ctx.translate(W / 2 + (k - 1) * 120 * u, y + 180 * u); ctx.scale(s, s); ctx.globalAlpha = on && R.t > k * 0.25 ? 1 : 0.25; ctx.font = `${90 * u | 0}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⭐', 0, 0); ctx.restore(); ctx.globalAlpha = 1; }
  txt(`+${R.coins} 🪙`, W / 2, y + 285 * u, 50, '#f9a825', 'center', 0);
  if (R.hero) txt('🚦 TRAFIKHJÄLTE! +5 🪙', W / 2, y + 335 * u, 32, '#1565c0', 'center', 0);
  if (R.deco) txt('NYTT I STADEN: ' + R.deco.name + '!', W / 2, y + (R.hero ? 385 : 355) * u, 30, '#2e7d32', 'center', 0);
  const sel = R.sel || 0; const hardSub = S.mode === 'pol' ? 'LÄNGRE MENING · RADAR SENARE' : S.mode === 'amb' ? 'LÄNGRE MENING · KARTA SENARE' : 'SVÅRARE ORD & GÅTOR';
  [['▶ NÄSTA UPPDRAG', '#76ff03', 'VANLIG NIVÅ · 10–20 🪙'], ['🔥 JÄTTESVÅRT', '#ff7043', hardSub + ' · ×3 🪙']].forEach(([s, c, sub], k) => { const bx = W / 2 + (k ? 20 : -380) * u, by = y + h + 20 * u, bw = 360 * u; ctx.fillStyle = k === sel ? c : 'rgba(255,255,255,0.85)'; rr(ctx, bx, by, bw, 96 * u, 18 * u); ctx.fill(); if (k === sel) { ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 8 * u; ctx.stroke(); } txt(s, bx + bw / 2, by + 34 * u, 30, '#1a1033', 'center', 0); txt(sub, bx + bw / 2, by + 72 * u, sub.length > 30 ? 16 : 19, '#37474f', 'center', 0); });
  ctx.globalAlpha = 0.7 + Math.sin(t * 4) * 0.3; txt('◀ ▶ VÄLJ · ENTER = KÖR · ESC = MENY', W / 2, y + h - 40 * u, 24, '#1a1033', 'center', 0); ctx.globalAlpha = 1;
}
// ---------- meny ----------
function buildCityMenu() {
  const g = $('#city-grid'); g.innerHTML = ''; const cd = cityData();
  const add = (ico, lbl, sub, say, fn, cls = '') => { const b = mkBtn('card hub ' + cls, `<div class="bigico">${ico}</div><div class="lbl">${lbl}</div><div class="stars">${sub}</div>`, say, fn); g.appendChild(b); return b; };
  add('🚗', 'FRI KÖRNING', 'KÖR RUNT', 'Fri körning', () => startCity('free'));
  const done = cd.pizza.filter(s => s > 0).length;
  add('🍕', 'PIZZABUD', cd.pizza.map(s => s ? '★' : '☆').join(''), done < 5 ? `Pizzabud. Uppdrag ${done + 1}` : 'Pizzabud', () => startCity('pizza'), 'go').dataset.default = '1';
  add('🚑', 'AMBULANS', cd.amb.map(s => s ? '★' : '☆').join(''), 'Ambulans. Kör försiktigt!', () => startCity('amb'));
  add('🚓', 'POLIS', cd.pol.map(s => s ? '★' : '☆').join(''), 'Polis. Fånga tjuven!', () => startCity('pol'));
  $('#city-sub').textContent = `LEVERANSER: ${cd.deliveries} · SAKER I STADEN: ${cd.deco}/${CITY_DECOS.length}`;
}
// ---------- ambulans & polis: kort och scener ----------
function drawCityCard2(S, m, u, t, font, txt) {
  const x0 = 22 * u, y0 = 22 * u, w = 600 * u, h = 250 * u, col = m.type === 'amb' ? '#ef5350' : '#1e88e5';
  ctx.fillStyle = 'rgba(255,253,245,0.96)'; rr(ctx, x0, y0, w, h, 22 * u); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 6 * u; ctx.stroke();
  ctx.font = `600 ${17 * u | 0}px Arial`; ctx.fillStyle = '#607d8b'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const lvlTxt = ['', 'ord och bild', 'bara ord', 'bara ord', 'kort mening', 'kort mening'][m.level];
  ctx.fillText(`${m.type === 'amb' ? '🚑 Ambulans' : '🚓 Polis'} · nivå ${m.level}: ${lvlTxt}`, x0 + 20 * u, y0 + 24 * u);
  const big = (s, y, max = 50) => txt(s, x0 + 24 * u, y, s.length > 18 ? Math.min(max, 34) : s.length > 11 ? Math.min(max, 42) : max, '#1a1033', 'left', 0);
  if (m.type === 'amb') {
    if (m.stage === 'pickup') {
      const p = m.place, wd = p.word;
      ctx.font = font(52); ctx.textAlign = 'left'; ctx.fillText(m.level <= 2 ? m.pat[0] : '🤕', x0 + 20 * u, y0 + 90 * u);
      const s = m.level === 1 ? (p.house ? '🏠 ' : p.ico + ' ') + wd : m.level <= 3 ? wd : m.level === 4 ? 'KÖR TILL ' + wd : `${m.pat[1]} ÄR VID ${wd}`;
      txt(s, x0 + 100 * u, y0 + 90 * u, s.length > 20 ? 30 : s.length > 12 ? 38 : 48, '#1a1033', 'left', 0);
    } else { ctx.font = font(52); ctx.textAlign = 'left'; ctx.fillText(m.pat[0] + '🩹', x0 + 20 * u, y0 + 90 * u); txt('🏥 SJUKHUSET', x0 + 150 * u, y0 + 90 * u, 46, '#c62828', 'left', 0); }
    // komfort
    txt('PATIENTEN MÅR:', x0 + 24 * u, y0 + 160 * u, 22, '#607d8b', 'left', 0);
    const hearts = m.stage === 'hospital' ? (m.comfort > 0.65 ? 3 : m.comfort > 0.3 ? 2 : 1) : 3;
    ctx.font = font(40); ctx.textAlign = 'left'; ctx.fillText('❤️'.repeat(hearts) + '🤍'.repeat(3 - hearts), x0 + 230 * u, y0 + 160 * u);
    txt(m.stage === 'hospital' ? 'KÖR MJUKT – INGA KROCKAR!' : 'HÄMTA PATIENTEN', x0 + 24 * u, y0 + 215 * u, 26, col, 'left', 0);
  } else {
    const s = polText(m);
    if (m.level === 1) { ctx.fillStyle = TCOLS[m.col]; rr(ctx, x0 + 22 * u, y0 + 62 * u, 56 * u, 56 * u, 12 * u); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3 * u; ctx.stroke(); ctx.font = font(40); ctx.textAlign = 'center'; ctx.fillText(TKINDS[m.kind].ico, x0 + 50 * u, y0 + 92 * u); txt(s, x0 + 96 * u, y0 + 90 * u, 50, '#1a1033', 'left', 0); }
    else big(s, y0 + 90 * u);
    txt('FÅNGA RÄTT FORDON – KNUFFA TILL DET!', x0 + 24 * u, y0 + 150 * u, 22, col, 'left', 0);
    const hw = w - 150 * u; ctx.fillStyle = '#eceff1'; rr(ctx, x0 + 60 * u, y0 + 190 * u, hw, 26 * u, 13 * u); ctx.fill();
    ctx.fillStyle = m.heat > 0.5 ? '#42a5f5' : m.heat > 0.15 ? '#ffca28' : '#b0bec5'; rr(ctx, x0 + 60 * u, y0 + 190 * u, Math.max(26 * u, hw * m.heat), 26 * u, 13 * u); ctx.fill();
    ctx.font = font(30); ctx.textAlign = 'left'; ctx.fillText('⏱', x0 + 18 * u, y0 + 204 * u); ctx.fillText('⭐'.repeat(m.heat > 0.5 ? 3 : m.heat > 0.15 ? 2 : 1), x0 + 70 * u + hw, y0 + 204 * u);
  }
  ctx.globalAlpha = 0.75 + Math.sin(t * 4) * 0.25; txt('MELLANSLAG = LÄS UPP 🔊 · H = SIREN', x0 + 20 * u, y0 + h + 34 * u, 24, '#fff', 'left', 6); ctx.globalAlpha = 1;
  if (!m.gps) txt(m.type === 'pol' ? 'LETA EFTER FORDONET! RADARN KOMMER SNART' : 'LÄS SKYLTARNA! KARTAN KOMMER SNART', x0 + 20 * u, y0 + h + 72 * u, 22, '#ffd600', 'left', 5);
}
function drawScene2(S, u, t, font, txt) {
  const D = S.D, m = S.m;
  ctx.fillStyle = 'rgba(10,5,30,0.55)'; ctx.fillRect(0, 0, W, H);
  const fx = W * 0.14, fw = W * 0.72, fy = H * 0.08, fh = H * 0.58;
  const bubble = (s, x, y) => { const bw = Math.max(260 * u, s.length * 30 * u), bh = 120 * u; ctx.fillStyle = '#fff'; rr(ctx, x, y, bw, bh, 24 * u); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 30 * u, y + bh); ctx.lineTo(x - 10 * u, y + bh + 40 * u); ctx.lineTo(x + 80 * u, y + bh); ctx.fill(); txt(s, x + bw / 2, y + bh / 2, 44, '#1a1033', 'center', 0); };
  const emo = (s, x, y, size, rot = 0) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `${size * u | 0}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 0, 0); ctx.restore(); };
  const ground = H * 0.66;
  if (D.kind === 'catch') {
    ctx.fillStyle = '#90a4ae'; rr(ctx, fx, fy, fw, fh, 20 * u); ctx.fill(); ctx.fillStyle = '#607d8b'; ctx.fillRect(fx, ground - 30 * u, fw, fh - (ground - 30 * u - fy));
    const v = Object.assign({}, D.veh, { x: 0, y: 0, a: 0, v: 0 });
    ctx.save(); ctx.translate(W * 0.64, ground - 70 * u); ctx.scale(3 * u, 3 * u); drawTrafficVehicle(ctx, v, t); ctx.restore();
    const out = clamp((D.t - 0.4) / 0.8, 0, 1), R = 55 * u;
    ctx.save(); ctx.translate(W * 0.64 - out * 260 * u, ground - R * 3.4 - 10 * u); ctx.globalAlpha = out > 0 ? 1 : 0; drawRig(ctx, THIEF_FIG, R, t, D.t < 1.2 ? 'walk' : D.t < 2.6 ? 'sulk' : 'wave', { legs: true }); ctx.restore(); ctx.globalAlpha = 1;
    const pf = Object.assign({}, S.car.who.fig, { hair: 6, suit: 1 });
    ctx.save(); ctx.translate(W * 0.24, ground - R * 3.4 - 10 * u); drawRig(ctx, pf, R, t, D.t < 2.6 ? 'point' : 'cheer', { legs: true }); ctx.restore();
    if (D.t > 1.2) bubble(D.t < 2.6 ? 'OJ! FÖRLÅT! 😅' : 'JAG LOVAR ATT SLUTA!', W * 0.42, fy + 30 * u);
    txt('TJUVEN ÄR FAST!', W / 2, H * 0.78, 60, '#ffd600', 'center', 10);
    return;
  }
  if (D.kind === 'pickup') {
    const p = m.place, b = p.bay.b, col = b ? b.col : '#a5d6a7';
    ctx.fillStyle = col; rr(ctx, fx, fy, fw, fh, 20 * u); ctx.fill(); txt((p.house ? '🏠 ' : p.ico + ' ') + p.word, W / 2, fy + 40 * u, 32, '#1a1033', 'center', 0);
    ctx.save(); ctx.translate(W * 0.72, ground - 20 * u); ctx.scale(3.2 * u, 3.2 * u); drawCar(ctx, AMB_DEF, t, { siren: true }); ctx.restore();
    const k = clamp((D.t - 2.2) / 1.0, 0, 1), px = lerp(W * 0.32, W * 0.62, k), hop = Math.abs(Math.sin(t * 8)) * 14 * u;
    if (k < 1) { emo(m.pat[0], px, ground - 80 * u - hop, 150); emo('🩹', px + 40 * u, ground - 40 * u - hop, 60, 0.4); }
    if (D.t > 0.8) bubble(D.t < 2.2 ? 'AJ AJ! 🤕' : 'TACK!', W * 0.36, fy + 60 * u);
    txt('PATIENTEN HOPPAR IN!', W / 2, H * 0.8, 50, '#fff', 'center', 8);
    return;
  }
  if (D.kind === 'dropoff') {
    ctx.fillStyle = '#eceff1'; rr(ctx, fx, fy, fw, fh, 20 * u); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.fillRect(W / 2 - 20 * u, fy + 40 * u, 40 * u, 120 * u); ctx.fillRect(W / 2 - 60 * u, fy + 80 * u, 120 * u, 40 * u);
    txt('🏥 SJUKHUSET', W / 2, fy + 200 * u, 36, '#c62828', 'center', 0);
    const doc = { skin: 0, hair: 5, hairCol: 5, eyes: 2, beard: 1, mouth: 1, suit: 8 }, R = 55 * u;
    ctx.save(); ctx.translate(W * 0.3, ground - R * 3.4); drawRig(ctx, doc, R, t, D.t < 2 ? 'wave' : 'clap', { legs: true }); ctx.restore();
    const cured = D.t > 1.8, hop = Math.abs(Math.sin(t * (cured ? 10 : 6))) * (cured ? 40 : 10) * u;
    emo(m.pat[0], W * 0.58, ground - 80 * u - hop, 150);
    if (!cured) emo('🩹', W * 0.58 + 40 * u, ground - 40 * u - hop, 60, 0.4); else for (let q = 0; q < 5; q++) { const ph = (t * 0.8 + q / 5) % 1; ctx.globalAlpha = 1 - ph; emo('❤️', W * 0.58 + Math.sin(q * 2 + t) * 80 * u, ground - 150 * u - ph * 200 * u, 40); ctx.globalAlpha = 1; }
    if (D.t > 0.6) bubble(cured ? 'JAG ÄR FRISK! 😄' : 'TACK DOKTORN!', W * 0.62, fy + 60 * u);
    txt(cured ? 'PATIENTEN ÄR FRISK!' : 'FRAMME!', W / 2, H * 0.8, 50, '#fff', 'center', 8);
  }
}

function drawCityBrief(S) {
  const m = S.m, t = S.brief.t, keys = ['up', 'down', 'left', 'right'];
  if (!m) return drawBriefCard({ icon: '🚗', title: 'FRI KÖRNING', col: '#43a047', rows: [['KÖR RUNT I STADEN', 64], ['SAMLA MYNT 🪙', 64], ['STANNA I EN RUTA', 44, '#37474f'], ['SÅ LÄSER JAG SKYLTEN', 44, '#37474f']], keys, t });
  const lab = s => [s, 34, '#8d6e63'], pw = p => p.garage ? cityGarageName() : p.word, pre = p => p.house ? p.col : p.ico;
  if (m.type === 'pizza') {
    const rows = [];
    if (m.level === 4) rows.push(briefWord('', 'KÖR TILL ' + pw(m.place), 60));
    else { rows.push(lab('KÖR TILL')); rows.push(briefWord(pre(m.place), pw(m.place), 70)); }
    rows.push(lab('PIZZA MED'));
    if (m.level === 5) { rows.pop(); rows.push(lab('NÄR DU KOMMER FRAM')); rows.push(briefWord('', '✏️ SKRIVER DU ORDET!', 60, '#bf360c')); }
    else { const ot = cityOrderText(m); rows.push(briefWord(m.level === 1 ? FOODS[m.foods[0]] : '', ot, ot.length > 20 ? 44 : ot.length > 12 ? 56 : 70, '#bf360c')); }
    return drawBriefCard({ icon: m.hard ? '🔥' : '🍕', title: m.hard ? 'JÄTTESVÅRT! ×3 🪙' : m.level === 5 ? 'NY BESTÄLLNING – DU SKRIVER!' : 'NY BESTÄLLNING!', col: '#ff9100', rows, keys, stars: '🔥 VARM PIZZA = ⭐⭐⭐', readHint: true, t, go: 'TRYCK PÅ EN PIL FÖR ATT KÖRA!' });
  }
  if (m.type === 'amb') {
    const p = m.place, rows = [];
    if (m.level <= 3) { rows.push(lab('HÄMTA')); rows.push(briefWord('', m.level <= 2 ? m.pat[0] + ' 🤕' : '🤕', 70)); rows.push(lab('VID')); rows.push(briefWord(m.level === 1 ? pre(p) : '', pw(p), 70)); }
    else { rows.push(lab('HÄMTA DJURET')); rows.push(briefWord('', m.level === 4 ? 'KÖR TILL ' + pw(p) : `${m.pat[1]} ÄR VID ${pw(p)}`, 56)); }
    return drawBriefCard({ icon: m.hard ? '🔥' : '🚑', title: m.hard ? 'JÄTTESVÅRT! ×3 🪙' : 'LARM!', col: '#e53935', rows, keys, stars: '❤️ KÖR MJUKT, INGA KROCKAR = ⭐⭐⭐', readHint: true, t, go: 'TRYCK PÅ EN PIL FÖR ATT KÖRA!' });
  }
  const rows = [lab('FÅNGA TJUVEN')];
  if (m.level === 1) rows.push(briefWord(TCOLS[m.col], TKINDS[m.kind].ico + ' ' + m.col + ' ' + m.kind, 72)); else rows.push(briefWord('', polText(m), m.level >= 4 ? 52 : 72));
  rows.push(lab('KNUFFA TILL RÄTT FORDON'));
  return drawBriefCard({ icon: m.hard ? '🔥' : '🚓', title: m.hard ? 'JÄTTESVÅRT! ×3 🪙' : 'LARM!', col: '#1e88e5', rows, keys, stars: '⏱ SNABBT = ⭐⭐⭐', readHint: true, t, go: 'TRYCK PÅ EN PIL FÖR ATT KÖRA!' });
}
