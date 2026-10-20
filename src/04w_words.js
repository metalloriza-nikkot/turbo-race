// ===================== LÄSMOTORN: ordbank, anpassning, ljudning =====================
// Nivåer: 1 ljudenliga korta ord · 2 längre ord · 3 dubbelteckning/ng/sj · 4 sammansatta ord · 5 gåtor (förståelse)
// Gemener (små bokstäver) blandas in med korta ord från nivå 3. Veckans bokstav prioriteras.
const WORD_LEVELS = {
  1: [['SOL', '☀️'], ['BIL', '🚗'], ['IS', '🧊'], ['KO', '🐄'], ['MUS', '🐭'], ['OST', '🧀'], ['LÖK', '🧅'], ['BÅT', '⛵'], ['SÄL', '🦭'], ['ÄGG', '🥚'], ['ORM', '🐍'], ['APA', '🐒'], ['TÅG', '🚂'], ['ELD', '🔥'], ['LUS', '🐜']],
  2: [['FISK', '🐟'], ['KORV', '🌭'], ['MAJS', '🌽'], ['HUND', '🐶'], ['MÅNE', '🌙'], ['LAMPA', '💡'], ['LEJON', '🦁'], ['BANAN', '🍌'], ['TOMAT', '🍅'], ['SVAMP', '🍄'], ['HÄST', '🐴'], ['GRIS', '🐷'], ['GODIS', '🍬'], ['PIZZA', '🍕'], ['LÖV', '🍂'], ['LAKRITS', '🍫'], ['GLAS', '🥛'], ['ÄPPLE', '🍎']],
  3: [['KATT', '🐱'], ['BOLL', '⚽'], ['GLASS', '🍦'], ['BUSS', '🚌'], ['TUPP', '🐓'], ['LAMM', '🐑'], ['RING', '💍'], ['SÄNG', '🛏️'], ['KLOCKA', '⏰'], ['STJÄRNA', '⭐'], ['KYCKLING', '🐔'], ['SKOLA', '🏫'], ['SNIGEL', '🐌'], ['FLAGGA', '🚩'], ['SPINDEL', '🕷️'], ['BALLONG', '🎈']],
  4: [['SOLROS', '🌻'], ['BRANDBIL', '🚒'], ['SNÖGUBBE', '⛄'], ['REGNBÅGE', '🌈'], ['JORDGUBBE', '🍓'], ['NYCKELPIGA', '🐞'], ['PANNKAKA', '🥞'], ['POLISBIL', '🚓'], ['FOTBOLL', '⚽'], ['LASTBIL', '🚚'], ['ISBJÖRN', '🐻‍❄️'], ['LEKSAK', '🧸']],
};
// Gåtor: läs och förstå, välj rätt bild
const RIDDLES = [
  ['NÅGOT GULT OCH SURT', 'CITRON', '🍋'], ['DEN SÄGER MU', 'KO', '🐄'], ['DEN LYSER PÅ NATTEN', 'MÅNE', '🌙'], ['DEN ÄR KALL OCH SÖT', 'GLASS', '🍦'],
  ['DEN HAR ÅTTA BEN', 'SPINDEL', '🕷️'], ['DEN ÄR LÅNG OCH GUL', 'BANAN', '🍌'], ['DEN SÄGER VOFF', 'HUND', '🐶'], ['DEN ÄR VARM OCH GUL PÅ HIMLEN', 'SOL', '☀️'],
  ['DEN KAN SIMMA OCH HAR FENOR', 'FISK', '🐟'], ['DEN ÄR RÖD OCH VÄXER PÅ TRÄD', 'ÄPPLE', '🍎'], ['DEN KÖR PÅ RÄLS', 'TÅG', '🚂'], ['DEN ÄR KUNG I DJUNGELN', 'LEJON', '🦁'],
  ['DEN ÄR VIT OCH HAR EN MOROT TILL NÄSA', 'SNÖGUBBE', '⛄'], ['DEN VÄCKER DIG PÅ MORGONEN', 'TUPP', '🐓'],
];
const WORD_EMO = {}; for (const l in WORD_LEVELS) for (const [w, e] of WORD_LEVELS[l]) WORD_EMO[w] = e; for (const [, w, e] of RIDDLES) WORD_EMO[w] = WORD_EMO[w] || e;
Object.assign(WORD_EMO, { OST: '🧀', FISK: '🐟', KORV: '🌭', MAJS: '🌽', 'ÄGG': '🥚', 'LÖK': '🧅', SVAMP: '🍄', TOMAT: '🍅', BANAN: '🍌', CITRON: '🍋' });
const WORD_LEVEL = {}; for (const l in WORD_LEVELS) for (const [w] of WORD_LEVELS[l]) WORD_LEVEL[w] = +l;
// Ljud för ljudning (så som barn lär sig i skolan: bokstavens ljud, inte namnet)
const LETTER_SOUND = { A: 'a', B: 'bö', C: 'sss', D: 'dö', E: 'e', F: 'fff', G: 'gö', H: 'hö', I: 'i', J: 'jjj', K: 'kö', L: 'lll', M: 'mmm', N: 'nnn', O: 'o', P: 'pö', Q: 'kö', R: 'rrr', S: 'sss', T: 'tö', U: 'u', V: 'vvv', W: 'vvv', X: 'ks', Y: 'y', Z: 'sss', 'Å': 'å', 'Ä': 'ä', 'Ö': 'ö' };

function readData() {
  const pd = playerData(); pd.read = pd.read || {};
  const r = pd.read; r.lvl = r.lvl || 2; r.streak = r.streak || 0; r.miss = r.miss || 0; r.words = r.words || {}; r.tasks = r.tasks || 0; r.firstOk = r.firstOk || 0; r.helps = r.helps || 0;
  r.letter = r.letter || 'L'; r.custom = r.custom || []; r.letters = r.letters || 0; r.history = r.history || []; r.typed = r.typed || { ok: 0, tries: 0 };
  return r;
}
const Words = {
  recent: [],
  // välj ord: mest från nuvarande nivå, ibland en nivå under. Svåra ord och veckans bokstav oftare.
  pick(opt = {}) {
    const r = readData(); let lvl = Math.min(4, Math.round(r.lvl) + (opt.boost || 0));
    if (opt.maxLevel) lvl = Math.min(lvl, opt.maxLevel);
    if (Math.random() < 0.2 && lvl > 1) lvl--;
    let pool = WORD_LEVELS[lvl].map(x => x[0]).filter(w => !this.recent.includes(w) && !(opt.exclude || []).includes(w) && (!opt.maxLen || w.length <= opt.maxLen));
    if (!pool.length) pool = WORD_LEVELS[lvl].map(x => x[0]);
    const wt = w => { const s = r.words[w] || { ok: 0, bad: 0 }; let v = (s.bad + 1) / (s.ok + 1); if (r.letter && w.includes(r.letter.toUpperCase())) v *= 3; return v; };
    let tot = pool.reduce((s, w) => s + wt(w), 0), x = Math.random() * tot, w = pool[0];
    for (const p of pool) { x -= wt(p); if (x <= 0) { w = p; break; } }
    this.recent.push(w); if (this.recent.length > 6) this.recent.shift();
    return w;
  },
  // distraktorer: liknande ord (samma första bokstav när barnet läser bra)
  distract(right, n) {
    const r = readData(), lvl = Math.min(4, Math.round(r.lvl)), all = Object.keys(WORD_EMO).filter(w => !right.includes(w) && WORD_EMO[w] !== WORD_EMO[right[0]]);
    const near = all.filter(w => lvl >= 2 && w[0] === right[0][0]), same = all.filter(w => Math.abs((WORD_LEVEL[w] || 2) - lvl) <= 1);
    const out = []; for (const src of [shuffle(near), shuffle(same), shuffle(all)]) for (const w of src) { if (out.length >= n) break; if (!out.includes(w)) out.push(w); }
    return out;
  },
  riddle() { const r = readData(); const i = Math.floor(Math.random() * RIDDLES.length); return { text: RIDDLES[i][0], ans: RIDDLES[i][1] }; },
  useLower() { const r = readData(); return r.lvl >= 3 && Math.random() < 0.25; },
  // registrera resultat och anpassa nivån (trappa: 3 rätt i rad = upp, 2 fel i rad = ner)
  record(words, ok, helped) {
    const r = readData(); r.tasks++; if (helped) r.helps++;
    for (const w of words) { const s = r.words[w] = r.words[w] || { ok: 0, bad: 0 }; if (ok) s.ok++; else s.bad++; s.last = Date.now(); }
    if (ok && !helped) { r.firstOk++; r.streak++; r.miss = 0; if (r.streak >= 3 && r.lvl < 5) { r.lvl++; r.streak = 0; r.history.push([Date.now(), r.lvl]); } }
    else if (!ok) { r.miss++; r.streak = 0; if (r.miss >= 2 && r.lvl > 1) { r.lvl--; r.miss = 0; r.history.push([Date.now(), r.lvl]); } }
    else r.streak = Math.max(0, r.streak - 1);
    saveProf();
  },
};
// ---------- ljudning: "L – E – J – O – N … LEJON" med en remsa där aktuell bokstav lyser ----------
const SOUND = { word: null, i: -1, t: 0, id: 0, until: 0 };
function soundClear(why) { if (SOUND.show) logEv('ljud', 'remsan stängd' + (why ? ' (' + why + ')' : ''), SOUND.word); SOUND.show = false; SOUND.word = null; SOUND.i = -1; SOUND.id++; }
function soundOut(word, before, after) {
  const letters = [...word.replace(/[^A-ZÅÄÖa-zåäö]/g, '')];
  const id = ++SOUND.id; SOUND.word = word; SOUND.i = -1; SOUND.t = 0; SOUND.show = true;
  const parts = []; if (before) parts.push([before, -1]);
  letters.forEach((ch, k) => parts.push([LETTER_SOUND[ch.toUpperCase()] || ch.toLowerCase(), k]));
  parts.push([word.toLowerCase() + '!', 99]); if (after) parts.push([after, 99]);
  // säkerhetsnät: remsan försvinner alltid efter en rimlig tid, även om rösten hänger sig
  SOUND.until = performance.now() + 4000 + parts.reduce((a, p) => a + 1800 + p[0].length * 140, 0);
  logEv('ljud', 'ljudar', word);
  Voice.seq(parts.map(p => p[0]), k => { if (SOUND.id === id) SOUND.i = parts[k][1]; },
    () => setTimeout(() => { if (SOUND.id === id) soundClear('klar'); }, 900),
    () => { if (SOUND.id === id) soundClear('avbruten av annan röst'); });
}
function drawSoundStrip() {
  if (!SOUND.show || !SOUND.word) return;
  if (performance.now() > SOUND.until) { soundClear('maxtid'); return; }
  const u = H / 1000, w = SOUND.word, n = w.length, sw = 92 * u, gap = 12 * u, tot = n * sw + (n - 1) * gap, x0 = W / 2 - tot / 2, y = H * 0.74;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(10,5,30,0.7)'; rr(ctx, x0 - 24 * u, y - 24 * u, tot + 48 * u, sw + 48 * u, 24 * u); ctx.fill();
  for (let k = 0; k < n; k++) {
    const on = SOUND.i === k || SOUND.i === 99, x = x0 + k * (sw + gap), lift = SOUND.i === k ? -10 * u : 0;
    ctx.fillStyle = on ? '#ffd600' : '#fff'; rr(ctx, x, y + lift, sw, sw, 14 * u); ctx.fill();
    ctx.fillStyle = '#1a1033'; ctx.font = `bold ${64 * u | 0}px "Arial Rounded MT Bold", Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(w[k], x + sw / 2, y + sw / 2 + lift + 3 * u);
  }
  ctx.restore();
}
// ---------- veckans bokstav: gyllene bokstäver att samla ----------
function letterExample(L) { L = L.toUpperCase(); for (const l of [1, 2, 3, 4]) for (const [w] of WORD_LEVELS[l]) if (w[0] === L) return w; return null; }
function collectLetter(x, y) {
  const r = readData(); r.letters++; addCoins(2); Snd.play('star'); addText(x, y - 30, r.letter.toUpperCase() + '! +2 🪙', '#ffd600');
  const L = r.letter.toUpperCase(), ex = letterExample(L); Voice.say(`${LETTER_SOUND[L] || L}! ${L.toLowerCase()} som i ${ex ? ex.toLowerCase() : ''}!`, true);
}
function drawGoldLetter(ctx, x, y, t, rot) {
  const r = readData(), L = r.letter.toUpperCase();
  ctx.save(); ctx.translate(x, y); ctx.rotate(-rot); const s = 1 + Math.sin(t * 5) * 0.08; ctx.scale(s, s);
  ctx.shadowColor = '#ffd600'; ctx.shadowBlur = 25; ctx.fillStyle = '#ffca28'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fff59d'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#6d4c00'; ctx.font = 'bold 44px "Arial Rounded MT Bold", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(L + L.toLowerCase(), 0, 3);
  ctx.restore();
}
