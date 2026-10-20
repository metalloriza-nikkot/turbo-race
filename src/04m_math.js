// ===================== MATTEMOTORN: anpassad nivå, frågor med mynt =====================
// 1: plus inom 10 · 2: plus/minus inom 20 · 3: tiotalsövergång (8+7, 14−6) · 4: tiotal inom 100 (40+30, 57−20)
// 5: tvåsiffrigt inom 100 (46+27, 83−38) · 6: gånger som grupper (3×5), dubbelt/hälften
function mathData() {
  const pd = playerData(); pd.math = pd.math || {};
  const m = pd.math; m.lvl = m.lvl || 2; m.streak = m.streak || 0; m.miss = m.miss || 0; m.tasks = m.tasks || 0; m.firstOk = m.firstOk || 0; m.helps = m.helps || 0; m.history = m.history || []; m.facts = m.facts || {}; m.hard = m.hard || 0;
  return m;
}
const MATH_NAMES = ['', 'Plus inom 10', 'Plus och minus inom 20', 'Tiotalsövergång (8+7, 14−6)', 'Tiotal inom 100 (40+30, 57−20)', 'Tvåsiffrigt inom 100 (46+27)', 'Gånger som grupper (3×5)'];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const MathQ = {
  gen(lvl) {
    lvl = clamp(Math.round(lvl), 1, 6); let a, b, op = '+', ans;
    switch (lvl) {
      case 1: a = ri(1, 6); b = ri(1, 10 - a); break;
      case 2: if (Math.random() < 0.5) { a = ri(10, 15); b = ri(1, 20 - a); } else { op = '−'; a = ri(11, 19); b = ri(1, a - 10); } break;
      case 3: if (Math.random() < 0.55) { a = ri(5, 9); b = ri(11 - a, 9); } else { op = '−'; a = ri(11, 17); b = ri(a - 9, 9); } break;
      case 4: { const r = Math.random(); if (r < 0.35) { a = ri(1, 6) * 10; b = ri(1, 9 - a / 10) * 10; } else if (r < 0.7) { a = ri(21, 79); b = ri(1, Math.floor((99 - a) / 10)) * 10; } else { op = '−'; a = ri(35, 98); b = ri(1, Math.floor(a / 10) - 1) * 10; } break; }
      case 5: if (Math.random() < 0.55) { a = ri(15, 68); b = ri(12, 99 - a); } else { op = '−'; a = ri(40, 98); b = ri(12, a - 10); } break;
      case 6: { const r = Math.random(); if (r < 0.6) { op = '×'; a = ri(2, 5); b = [2, 3, 4, 5, 10][ri(0, 4)]; } else if (r < 0.8) { op = 'dubbelt'; a = ri(6, 45); b = 0; } else { op = 'hälften'; a = ri(3, 25) * 2; b = 0; } break; }
    }
    ans = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : op === 'dubbelt' ? a * 2 : a / 2;
    const q = op === 'dubbelt' ? `DUBBELT SÅ MÅNGA SOM ${a}` : op === 'hälften' ? `HÄLFTEN AV ${a}` : `${a} ${op} ${b}`;
    const say = op === 'dubbelt' ? `Dubbelt så många som ${a}?` : op === 'hälften' ? `Hälften av ${a}?` : `${a} ${op === '+' ? 'plus' : op === '−' ? 'minus' : 'gånger'} ${b}?`;
    return { a, b, op, ans, q, say, lvl, key: `${a}${op}${b}` };
  },
  opts(ans, n = 4) {
    const c = new Set([ans]); const cand = [ans + 1, ans - 1, ans + 10, ans - 10, ans + 2, ans - 2, ans + 11, ans - 9].filter(x => x >= 0);
    for (const x of shuffle(cand)) { if (c.size >= n) break; c.add(x); }
    while (c.size < n) c.add(ans + c.size + 3);
    return shuffle([...c]);
  },
  record(q, ok, helped) {
    const m = mathData(); m.tasks++; if (helped) m.helps++;
    const f = m.facts[q.key] = m.facts[q.key] || { ok: 0, bad: 0, q: q.q }; if (ok) f.ok++; else f.bad++;
    if (ok && !helped) { m.firstOk++; m.streak++; m.miss = 0; if (m.streak >= 3 && m.lvl < 6) { m.lvl++; m.streak = 0; m.history.push([Date.now(), m.lvl]); } }
    else if (!ok) { m.miss++; m.streak = 0; if (m.miss >= 2 && m.lvl > 1) { m.lvl--; m.miss = 0; m.history.push([Date.now(), m.lvl]); } }
    saveProf();
  },
};
// ---------- frågeskärmen (DOM) ----------
// o: { title, story, q (MathQ-objekt eller {q, ans, say}), opts, reward, onDone(ok), yesno }
let QUIZ = null;
function mathQuiz(o) {
  QUIZ = Object.assign({ tries: 0, helped: false, typed: '' }, o);
  const q = o.q; $('#quiz-title').textContent = o.title || 'RÄKNA!'; $('#quiz-story').textContent = o.story || '';
  $('#quiz-q').textContent = q.q + (o.yesno ? '' : ' = ?'); $('#quiz-typed').textContent = ''; $('#quiz-msg').textContent = ''; $('#quiz-vis').innerHTML = '';
  const g = $('#quiz-opts'); g.innerHTML = '';
  const opts = o.yesno ? ['JA', 'NEJ'] : (o.opts || MathQ.opts(q.ans));
  opts.forEach((v, k) => { const b = mkBtn('card quizopt', `<div class="lbl">${v}</div>`, String(v), () => quizAnswer(v)); if (k === 0) b.dataset.default = '1'; g.appendChild(b); });
  $('#quiz-help').style.display = q.op ? '' : 'none'; $('#quiz-skip').style.display = o.noSkip ? 'none' : '';
  hideUI(); screenStack.length = 0; curScreen = null; showScreen('quiz', false);
  setTimeout(() => Voice.say((o.sayFirst ? o.sayFirst + ' ' : '') + (q.say || q.q), true), 350);
}
function quizAnswer(v) {
  const Q = QUIZ; if (!Q || Q.done) return; const q = Q.q, ok = String(v) === String(Q.yesno ? (q.ans ? 'JA' : 'NEJ') : q.ans);
  Q.tries++;
  if (ok) {
    Q.done = true; if (q.op || Q.track) MathQ.record(q, Q.tries === 1, Q.helped);
    Snd.play('star'); $('#quiz-msg').innerHTML = `<span class="ok">RÄTT! ${Q.reward ? '+' + Q.reward + ' 🪙' : ''}</span>`; Voice.say(['Rätt!', 'Snyggt räknat!', 'Precis!'][Math.floor(Math.random() * 3)], true);
    if (Q.reward) addCoins(Q.reward);
    setTimeout(() => { const cb = Q.onDone; QUIZ = null; cb && cb(true); }, 1300);
  } else {
    Snd.play('buzz');
    if (Q.tries >= 2 && !Q.yesno) { Q.done = true; if (q.op || Q.track) MathQ.record(q, false, Q.helped); $('#quiz-msg').innerHTML = `Svaret är <b>${q.ans}</b>. Nästa gång!`; Voice.say(`Svaret är ${q.ans}. Nästa gång!`, true); setTimeout(() => { const cb = Q.onDone; QUIZ = null; cb && cb(false); }, 2300); }
    else if (Q.yesno) { Q.done = true; $('#quiz-msg').innerHTML = `Svaret är <b>${q.ans ? 'JA' : 'NEJ'}</b>.`; setTimeout(() => { const cb = Q.onDone; QUIZ = null; cb && cb(false); }, 2000); }
    else { $('#quiz-msg').textContent = 'Nästan! Prova igen.'; Voice.say('Nästan! Prova igen.', true); }
  }
}
function quizHelp() {
  const Q = QUIZ; if (!Q) return; const q = Q.q; Q.helped = true;
  // visa talen som tiotalsstavar och ental (prickar)
  const draw = n => { const t = Math.floor(n / 10), e = n % 10; return '<span class="ten"></span>'.repeat(t) + '<span class="one"></span>'.repeat(e); };
  let h = '';
  if (q.op === '+' || q.op === '−') h = `<div class="grp">${draw(q.a)}</div><div class="opv">${q.op}</div><div class="grp">${draw(q.b)}</div>`;
  else if (q.op === '×') h = Array.from({ length: q.a }, () => `<div class="grp">${'<span class="one"></span>'.repeat(q.b)}</div>`).join('<div class="opv">+</div>');
  else if (q.op === 'dubbelt') h = `<div class="grp">${draw(q.a)}</div><div class="opv">+</div><div class="grp">${draw(q.a)}</div>`;
  else if (q.op === 'hälften') h = `<div class="grp">${draw(q.a)}</div><div class="opv">÷ 2</div>`;
  $('#quiz-vis').innerHTML = h; Voice.say(q.say, true);
}
function quizKey(e) {
  const Q = QUIZ; if (!Q || Q.done) return false;
  if (/^Digit\d$|^Numpad\d$/.test(e.code) && !Q.yesno) { Q.typed = (Q.typed + e.code.slice(-1)).slice(-3); $('#quiz-typed').textContent = 'DU SKRIVER: ' + Q.typed; Snd.play('tick'); return true; }
  if (e.code === 'Backspace' && Q.typed) { Q.typed = Q.typed.slice(0, -1); $('#quiz-typed').textContent = Q.typed ? 'DU SKRIVER: ' + Q.typed : ''; return true; }
  if ((e.code === 'Enter' || e.code === 'NumpadEnter') && Q.typed) { const v = +Q.typed; Q.typed = ''; $('#quiz-typed').textContent = ''; quizAnswer(v); return true; }
  return false;
}
// ---------- bonusfrågan efter ett lopp: VANLIG eller JÄTTESVÅR ----------
function raceMathBonus(next) {
  const m = mathData();
  $('#bonus-title').textContent = 'BONUSMYNT!';
  const g = $('#bonus-opts'); g.innerHTML = '';
  const pick = hard => { const q = MathQ.gen(m.lvl + (hard ? 1 : 0)); if (hard) m.hard++; mathQuiz({ title: hard ? '🔥 JÄTTESVÅR' : '🙂 BONUSFRÅGA', story: 'Räkna rätt så får du bonusmynt!', q, reward: hard ? 8 : 3, onDone: () => next() }); };
  const a = mkBtn('card bonusopt go', `<div class="bigico">🙂</div><div class="lbl">VANLIG</div><div class="stars">+3 🪙</div>`, 'Vanlig fråga. Tre mynt.', () => pick(false)); a.dataset.default = '1'; g.appendChild(a);
  g.appendChild(mkBtn('card bonusopt gold', `<div class="bigico">🔥</div><div class="lbl">JÄTTESVÅR</div><div class="stars">+8 🪙</div>`, 'Jättesvår fråga. Åtta mynt!', () => pick(true)));
  g.appendChild(mkBtn('card bonusopt', `<div class="bigico">⏭️</div><div class="lbl">HOPPA ÖVER</div>`, 'Hoppa över', () => next()));
  hideUI(); screenStack.length = 0; curScreen = null; showScreen('bonus', false);
  setTimeout(() => Voice.say('Bonusmynt! Vill du ha en vanlig fråga eller en jättesvår?', true), 300);
}
