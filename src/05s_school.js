// ===================== KÖRSKOLAN =====================
const SCHOOL_TRACKS = {
  plan: { id: 'plan', name: 'ÖVNINGSPLATSEN', hw: 180, music: 'menu', pts: [[600, 450], [3000, 450], [3650, 900], [3000, 1350], [600, 1350], [-50, 900]],
    theme: { ground: 'grass', road: '#50555f', b1: '#ffffff', b2: '#e53935', bw: 18, edge: '#ffffff', center: '#ffffff', minimap: '#6d7380' },
    hazards: [], obstacles: [], movers: [], ramps: [], boosts: [], items: [], decor: [['tree', 40, 50], ['lamp', 12, 14], ['cone_d', 14, 16]], special: [] },
  kurva: { id: 'kurva', name: 'KURVBANAN', hw: 190, music: 'menu', pts: [[800, 500], [2200, 450], [3000, 900], [2600, 1550], [3200, 2150], [2500, 2750], [1300, 2700], [600, 2100], [900, 1400], [450, 900]],
    theme: { ground: 'grass', road: '#50555f', b1: '#ffffff', b2: '#1e88e5', bw: 18, edge: '#ffffff', center: '#ffd600', minimap: '#6d7380' },
    hazards: [], obstacles: [], movers: [], ramps: [], boosts: [], items: [], decor: [['tree', 60, 50], ['lamp', 14, 14]], special: [] },
};

// Varje utmaning: setup(S,T), update(S,dt,c,T) -> resultat {stars,msg} eller null, draw(ctx,S,T,t,inV), hud(S) -> {goal, big}
const CHALLENGES = [
  {
    id: 'gas', icon: '🟢', name: 'GASA & BROMSA', track: 'plan', start: 10,
    say: 'Håll pil upp för att gasa. Släpp och tryck pil ner för att bromsa. Stanna i den gröna rutan!',
    keys: ['up', 'down'],
    setup(S, T) { S.box = T.at(0, 0); S.box = boxAt(T, 10 + 115); S.inT = 0; },
    update(S, dt, c, T) {
      const q = local(T, S.box, c); const inside = Math.abs(q.along) < 55 && Math.abs(q.lat) < T.hw;
      if (S.time > 16 && !S.tip) { S.tip = 1; Voice.say('Tips! Har du kört förbi? Tryck pil ner för att backa!'); }
      if (inside && Math.abs(c.fs) < 25) { S.inT += dt; if (S.inT > 0.6) return { stars: S.time < 7 ? 3 : S.time < 11 ? 2 : 1, msg: `DU STANNADE PÅ ${fmt(S.time)} SEKUNDER!` }; } else S.inT = 0;
      return null;
    },
    draw(ctx, S, T, t) { drawBox(ctx, S.box, T, 110, '#76ff03', 'STOPP', t, S.inT > 0); },
    hud(S) { return { goal: 'STANNA I RUTAN' }; },
  },
  {
    id: 'slalom', icon: '🔀', name: 'SLALOM', track: 'plan', start: 10,
    say: 'Styr med pil vänster och pil höger. Kör mellan konerna i varje port!',
    keys: ['up', 'left', 'right'],
    setup(S, T) {
      S.gates = []; for (let k = 0; k < 7; k++) { const gi = 45 + k * 42, gl = (k % 2 ? 1 : -1) * 70; S.gates.push({ i: gi, lat: gl, state: 0 }); const a = T.at(gi / T.N, gl - 75), b = T.at(gi / T.N, gl + 75); addProp(T, 'cone', a, 16); addProp(T, 'cone', b, 16); }
      S.end = 45 + 7 * 42 + 20; S.ok = 0;
    },
    update(S, dt, c, T) {
      for (const g of S.gates) if (!g.state && passed(c, g.i, T)) { if (Math.abs(c.lat - g.lat) < 70) { g.state = 1; S.ok++; Snd.play('ding'); addText(c.x, c.y, 'BRA!', '#76ff03'); } else { g.state = 2; Snd.play('buzz'); addText(c.x, c.y, 'MISS', '#ff5252'); } }
      if (passed(c, S.end, T) || S.gates.every(g => g.state)) { if (S.gates.every(g => g.state)) return { stars: S.ok === 7 ? 3 : S.ok >= 5 ? 2 : 1, msg: `${S.ok} AV 7 PORTAR!` }; }
      return null;
    },
    draw(ctx, S, T, t) { for (const g of S.gates) { const q = T.at(g.i / T.N, g.lat); ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.fillStyle = g.state === 1 ? 'rgba(118,255,3,0.45)' : g.state === 2 ? 'rgba(255,82,82,0.4)' : `rgba(255,214,0,${0.3 + Math.sin(t * 5) * 0.15})`; ctx.fillRect(-12, -70, 24, 140); ctx.restore(); } },
    hud(S) { return { goal: `PORTAR ${S.ok}/7` }; },
  },
  {
    id: 'backa', icon: '🅿️', name: 'BACKA IN I GARAGET', track: 'plan', start: 70,
    say: 'Garaget är bakom dig! Tryck pil ner för att backa in i garaget och stanna där.',
    keys: ['down', 'left', 'right'],
    setup(S, T) { S.box = boxAt(T, 26); S.inT = 0; },
    update(S, dt, c, T) {
      const q = local(T, S.box, c); const inside = Math.abs(q.along) < 45 && Math.abs(q.lat) < 55 && Math.cos(angDiff(c.a, S.box.a)) > 0.6;
      if (S.time > 14 && !S.tip) { S.tip = 1; Voice.say('Tips! Bilen ska peka framåt. Backa rakt bakåt med pil ner!'); }
      if (inside && Math.abs(c.fs) < 25) { S.inT += dt; if (S.inT > 0.6) return { stars: S.time < 8 ? 3 : S.time < 14 ? 2 : 1, msg: `PARKERAD PÅ ${fmt(S.time)} SEKUNDER!` }; } else S.inT = 0;
      return null;
    },
    draw(ctx, S, T, t) { drawGarage(ctx, S.box, S.inT > 0, t); },
    hud(S) { return { goal: 'BACKA IN' }; },
  },
  {
    id: 'ljus', icon: '🚦', name: 'RÖTT LJUS', track: 'plan', start: 10,
    say: 'Titta på trafikljusen! Stanna vid rött ljus och kör när det blir grönt.',
    keys: ['up', 'down'],
    setup(S, T) { S.lights = [95, 195, 295].map(i => ({ i, state: 'green', timer: 0, done: false, ok: false })); S.miss = 0; S.end = 330; },
    update(S, dt, c, T) {
      for (const L of S.lights) {
        if (L.state === 'green' && !L.triggered && c.idx > L.i - 38 && c.idx < L.i) { L.triggered = true; L.state = 'red'; L.timer = 2.2; Snd.play('beep', false); Voice.say('Rött ljus! Stanna!'); }
        if (L.state === 'red') { if (Math.abs(c.fs) < 20) L.timer -= dt; if (L.timer <= 0) { L.state = 'green'; Snd.play('beep', true); Voice.say('Grönt! Kör!'); } }
        if (!L.done && passed(c, L.i, T)) { L.done = true; if (L.state === 'red') { S.miss++; Snd.play('buzz'); addText(c.x, c.y, 'RÖTT!', '#ff5252'); } else if (L.triggered) { L.ok = true; Snd.play('ding'); addText(c.x, c.y, 'BRA!', '#76ff03'); } }
      }
      if (passed(c, S.end, T)) return { stars: S.miss === 0 ? 3 : S.miss === 1 ? 2 : 1, msg: S.miss === 0 ? 'DU STANNADE VID ALLA RÖDA LJUS!' : `${S.miss} RÖTT LJUS MISSAT` };
      return null;
    },
    draw(ctx, S, T, t) {
      for (const L of S.lights) {
        const q = T.at(L.i / T.N, 0); ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a);
        ctx.fillStyle = L.state === 'red' ? 'rgba(255,23,68,0.35)' : 'rgba(255,255,255,0.8)'; ctx.fillRect(-8, -T.hw + 6, 16, T.hw * 2 - 12);
        ctx.fillStyle = '#263238'; rr(ctx, -30, -T.hw - 80, 60, 70, 12); ctx.fill();
        ctx.fillStyle = L.state === 'red' ? '#ff1744' : '#4a1010'; ctx.beginPath(); ctx.arc(-13, -T.hw - 45, 13, 0, TAU); ctx.fill();
        ctx.fillStyle = L.state === 'green' ? '#76ff03' : '#1b3a10'; ctx.beginPath(); ctx.arc(13, -T.hw - 45, 13, 0, TAU); ctx.fill();
        if (L.state === 'red') { ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 25; ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(-13, -T.hw - 45, 13, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; }
        ctx.restore();
      }
    },
    hud(S) { const L = S.lights.find(l => l.state === 'red'); return { goal: L ? '🔴 STANNA!' : `🟢 KÖR! · MISSAR ${S.miss}` }; },
  },
  {
    id: 'mynt', icon: '🪙', name: 'MYNTJAKT', track: 'plan', start: 10,
    say: 'Plocka alla mynt innan tiden tar slut!',
    keys: ['up', 'left', 'right'],
    setup(S, T) { S.coins = []; for (let k = 0; k < 25; k++) { const i = 40 + k * 20; const lat = Math.sin(k * 0.9) * 120; const q = T.at(i / T.N, lat); S.coins.push({ x: q.x, y: q.y, got: false }); } S.n = 0; S.limit = 45; },
    update(S, dt, c, T) {
      for (const m of S.coins) if (!m.got && dist2(m.x, m.y, c.x, c.y) < 48 * 48) { m.got = true; S.n++; Snd.play('coin'); addText(m.x, m.y, '+1', '#ffd600'); }
      if (S.n === S.coins.length) return { stars: 3, msg: `ALLA ${S.n} MYNT!`, coins: S.n };
      if (S.time >= S.limit) return { stars: S.n >= 18 ? 2 : S.n >= 10 ? 1 : 0, msg: `${S.n} AV ${S.coins.length} MYNT`, coins: S.n };
      return null;
    },
    draw(ctx, S, T, t, inV) { for (const m of S.coins) if (!m.got && inV(m.x, m.y, 30)) drawCoin(ctx, m.x, m.y, 20, t); },
    hud(S) { return { goal: `🪙 ${S.n}/${S.coins.length}`, timer: Math.max(0, S.limit - S.time) }; },
  },
  {
    id: 'plattor', icon: '⚡', name: 'TURBOPLATTOR', track: 'plan', start: 10,
    say: 'Kör över alla gula turboplattor! Styr till vänster och höger.',
    keys: ['up', 'left', 'right'],
    setup(S, T) { S.pads = []; for (let k = 0; k < 8; k++) { const i = 55 + k * 30, lat = [0, -95, 95, -40, 90, -95, 30, -60][k]; const q = T.at(i / T.N, lat); const p = { x: q.x, y: q.y, a: q.a, i: q.i, hit: false }; S.pads.push(p); T.boosts.push(p); } S.n = 0; S.end = 55 + 8 * 30 + 25; },
    update(S, dt, c, T) {
      for (const p of S.pads) if (!p.hit) { const dx = c.x - p.x, dy = c.y - p.y, al = dx * Math.cos(p.a) + dy * Math.sin(p.a), sd = -dx * Math.sin(p.a) + dy * Math.cos(p.a); if (Math.abs(al) < 60 && Math.abs(sd) < 50) { p.hit = true; S.n++; Snd.play('ding'); addText(p.x, p.y, S.n + '/8', '#ffd600'); } }
      if (passed(c, S.end, T)) return { stars: S.n === 8 ? 3 : S.n >= 6 ? 2 : S.n >= 3 ? 1 : 0, msg: `${S.n} AV 8 PLATTOR!` };
      return null;
    },
    draw(ctx, S, T, t) { for (const p of S.pads) if (p.hit) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.strokeStyle = '#76ff03'; ctx.lineWidth = 6; rr(ctx, -60, -46, 120, 92, 16); ctx.stroke(); ctx.restore(); } },
    hud(S) { return { goal: `⚡ ${S.n}/8 PLATTOR` }; },
  },
  {
    id: 'raket', icon: '🚀', name: 'RAKETSTART', track: 'plan', start: 10,
    say: 'Vänta på grönt ljus! Tryck på pil upp precis när lamporna blir gröna, så får du en raketstart. Du får tre försök!',
    keys: ['up'],
    setup(S, T) { S.tries = 0; S.ok = 0; S.wait = 0; },
    update(S, dt, c, T) {
      const R = G.rs; if (!R || !R.done) return null;
      if (!S.counted) { S.counted = true; S.tries++; if (R.result === 'ok') { S.ok++; Snd.play('ding'); } S.wait = 0; }
      S.wait += dt;
      if (S.wait > 1.8) {
        if (S.tries >= 3) return { stars: S.ok, msg: S.ok === 3 ? 'TRE RAKETSTARTER!' : `${S.ok} AV 3 RAKETSTARTER` };
        placeCar(c, T, 10, 0); c.vx = c.vy = 0; c.fs = 0; c.boost = 0; c.prog = 0; G.mode = 'countdown'; G.countdown = 3.99; G.lastCount = 99; rocketReset(); S.counted = false;
        Voice.say(['Igen! Vänta på grönt!', 'Sista försöket!'][S.tries - 1] || '', true);
      }
      return null;
    },
    draw() { },
    hud(S) { return { goal: `🚀 RAKETSTARTER ${S.ok} · FÖRSÖK ${Math.min(3, S.tries + (S.counted ? 0 : 1))}/3` }; },
  },
  {
    id: 'bro', icon: '🌉', name: 'SMALA BRON', track: 'plan', start: 10,
    say: 'Kör försiktigt över den smala bron utan att nudda konerna!',
    keys: ['up', 'left', 'right'],
    setup(S, T) { S.i0 = 70; S.i1 = 250; S.cen = i => 65 * Math.sin((i - S.i0) / 32); for (let i = S.i0; i <= S.i1; i += 11) { for (const s of [-1, 1]) addProp(T, 'cone', T.at(i / T.N, S.cen(i) + s * 82), 15); } S.end = S.i1 + 20; },
    update(S, dt, c, T) { S.hits = T.props.filter(p => p.hit).length; if (passed(c, S.end, T)) return { stars: S.hits === 0 ? 3 : S.hits <= 3 ? 2 : 1, msg: S.hits === 0 ? 'INGEN KON NUDDAD!' : `${S.hits} KONER NUDDADE` }; return null; },
    draw(ctx, S, T, t) {
      const cl = T.cl; ctx.save(); ctx.lineCap = 'butt';
      ctx.fillStyle = '#29b6f6'; for (let i = S.i0; i < S.i1; i += 2) { const q = T.at(i / T.N, 0); ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.fillRect(-11, -T.hw, 22, T.hw * 2); ctx.restore(); }
      for (let i = S.i0; i < S.i1; i += 2) { const q = T.at(i / T.N, S.cen(i)); ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.fillStyle = (i % 6 < 3) ? '#a1887f' : '#8d6e63'; ctx.fillRect(-11, -88, 22, 176); ctx.restore(); }
      ctx.restore();
    },
    hud(S) { return { goal: `🌉 NUDDADE KONER: ${S.hits || 0}` }; },
  },
  {
    id: 'hopp', icon: '🦘', name: 'TURBOHOPP', track: 'plan', start: 30,
    say: 'Hoppa över vattnet! Tryck på mellanslag för turbo precis innan rampen!',
    keys: ['up', 'space'],
    setup(S, T) { const r = T.at(150 / T.N, 0); T.ramps.push({ kind: 'plank', i: r.i, x: r.x, y: r.y, a: r.a }); S.g0 = 157; S.g1 = 157 + 62; S.tries = 1; S.player.item = 'turbo'; },
    update(S, dt, c, T) {
      const rel = c.idx; if (!c.item && c.boost <= 0 && rel < 140 && rel > 20) c.item = 'turbo';
      if (rel > S.g0 && rel < S.g1 && c.air <= 0) { Snd.play('splash'); for (let k = 0; k < 16; k++) { const a = Math.random() * TAU; G.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 0.6, max: 0.6, size: 10, color: '#4fc3f7', type: 'dot' }); } S.tries++; placeCar(c, T, 30, 0); c.item = 'turbo'; Voice.say(['Plask! Försök igen!', 'Blött! Använd turbon!', 'Nästan! En gång till!'][S.tries % 3]); }
      if (rel > S.g1 + 5 && rel < S.g1 + 60) return { stars: S.tries === 1 ? 3 : S.tries <= 3 ? 2 : 1, msg: S.tries === 1 ? 'PÅ FÖRSTA FÖRSÖKET!' : `KLARAT PÅ ${S.tries} FÖRSÖK!` };
      return null;
    },
    draw(ctx, S, T, t) {
      const cl = T.cl; ctx.save(); const p = new Path2D(); for (let i = S.g0; i <= S.g1; i++) { i === S.g0 ? p.moveTo(cl.px[i], cl.py[i]) : p.lineTo(cl.px[i], cl.py[i]); }
      ctx.lineCap = 'butt'; ctx.strokeStyle = '#1565c0'; ctx.lineWidth = T.hw * 2 + 40; ctx.stroke(p); ctx.strokeStyle = '#29b6f6'; ctx.lineWidth = T.hw * 2; ctx.stroke(p);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.setLineDash([30, 40]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = T.hw * 1.4; ctx.globalAlpha = 0.25; ctx.stroke(p); ctx.globalAlpha = 1; ctx.setLineDash([]); ctx.restore();
    },
    hud(S) { return { goal: `FÖRSÖK ${S.tries}` }; },
  },
  {
    id: 'skjut', icon: '🎈', name: 'SKJUT BALLONGERNA', track: 'plan', start: 10,
    say: 'Tryck på mellanslag för att skjuta. Träffa alla ballonger!',
    keys: ['up', 'left', 'right', 'space'],
    setup(S, T) { S.bal = []; for (let k = 0; k < 6; k++) { const i = 90 + k * 48, lat = [-90, 60, 0, -60, 100, -20][k]; S.bal.push({ i, lat, ph: k * 1.3, alive: true, col: TOY_COLS[k % 6] }); } S.shots = 0; S.popped = 0; S.player.item = 'ball'; S.limit = 60; },
    update(S, dt, c, T) {
      if (!c.item) { S.shots++; c.item = 'ball'; c.itemDelayP = 0.45; }
      for (const b of S.bal) { if (!b.alive) continue; const q = T.at(b.i / T.N, b.lat + Math.sin(G.time * 1.5 + b.ph) * 40); b.x = q.x; b.y = q.y;
        for (const ball of G.balls) if (ball.life > 0 && dist2(ball.x, ball.y, b.x, b.y) < 42 * 42) { b.alive = false; ball.life = 0; S.popped++; Snd.play('pop'); for (let k = 0; k < 20; k++) { const a = Math.random() * TAU; G.parts.push({ x: b.x, y: b.y, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, life: 0.8, max: 0.8, size: 8, color: `hsl(${Math.random() * 360},90%,60%)`, type: 'conf', rot: 0 }); } addText(b.x, b.y, 'POFF!', '#fff'); } }
      if (S.popped === S.bal.length) return { stars: S.shots <= 8 ? 3 : S.shots <= 13 ? 2 : 1, msg: `ALLA BALLONGER MED ${S.shots} SKOTT!` };
      if (S.time >= S.limit) return { stars: S.popped >= 4 ? 1 : 0, msg: `${S.popped} AV 6 BALLONGER` };
      return null;
    },
    draw(ctx, S, T, t) { for (const b of S.bal) if (b.alive && b.x != null) drawBalloon(ctx, b.x, b.y, b.col, t + b.ph); },
    hud(S) { return { goal: `🎈 ${S.popped}/6 · SKOTT ${S.shots}`, timer: Math.max(0, S.limit - S.time) }; },
  },
  {
    id: 'lava', icon: '🌋', name: 'UNDVIK LAVAN', track: 'plan', start: 10,
    say: 'Se upp för lavan med den röda ringen! Styr runt den så att du inte snurrar.',
    keys: ['up', 'left', 'right'],
    setup(S, T) { const rows = [[70, [-110, -10]], [115, [10, 110]], [160, [-110, 110]], [205, [-60, 60]], [250, [-110, 0]], [295, [0, 110]]]; for (const [i, lats] of rows) for (const l of lats) { const q = T.at(i / T.N, l); T.hazards.push({ kind: 'lava', x: q.x, y: q.y, r: 50, a: q.a, seed: Math.random() * 10 }); } S.end = 325; G.spinLog = {}; },
    update(S, dt, c, T) { S.spins = (G.spinLog && G.spinLog.haz) || 0; if (passed(c, S.end, T)) return { stars: S.spins === 0 ? 3 : S.spins === 1 ? 2 : 1, msg: S.spins === 0 ? 'INGEN SNURR!' : `${S.spins} SNURR` }; return null; },
    draw() { },
    hud(S) { return { goal: `🌋 SNURR: ${S.spins || 0}` }; },
  },
  {
    id: 'is', icon: '🧊', name: 'ISSLALOM', track: 'plan', start: 10,
    say: 'Isen är hal! Styr mjukt och kör genom portarna.',
    keys: ['up', 'left', 'right'],
    setup(S, T) {
      for (let i = 40; i < 300; i += 14) { const q = T.at(i / T.N, (i % 28 ? 40 : -40)); T.hazards.push({ kind: 'ice', x: q.x, y: q.y, r: 150, a: q.a, seed: i }); }
      S.gates = []; for (let k = 0; k < 5; k++) { const gi = 60 + k * 50, gl = (k % 2 ? 1 : -1) * 60; S.gates.push({ i: gi, lat: gl, state: 0 }); addProp(T, 'cone', T.at(gi / T.N, gl - 80), 16); addProp(T, 'cone', T.at(gi / T.N, gl + 80), 16); }
      S.end = 60 + 5 * 50 + 10; S.ok = 0;
    },
    update(S, dt, c, T) {
      for (const g of S.gates) if (!g.state && passed(c, g.i, T)) { if (Math.abs(c.lat - g.lat) < 80) { g.state = 1; S.ok++; Snd.play('ding'); addText(c.x, c.y, 'BRA!', '#76ff03'); } else { g.state = 2; Snd.play('buzz'); addText(c.x, c.y, 'MISS', '#ff5252'); } }
      if (S.gates.every(g => g.state)) return { stars: S.ok === 5 ? 3 : S.ok >= 3 ? 2 : 1, msg: `${S.ok} AV 5 PORTAR PÅ ISEN!` };
      return null;
    },
    draw(ctx, S, T, t) { for (const g of S.gates) { const q = T.at(g.i / T.N, g.lat); ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); ctx.fillStyle = g.state === 1 ? 'rgba(118,255,3,0.45)' : g.state === 2 ? 'rgba(255,82,82,0.4)' : `rgba(255,214,0,${0.35 + Math.sin(t * 5) * 0.15})`; ctx.fillRect(-12, -80, 24, 160); ctx.restore(); } },
    hud(S) { return { goal: `🧊 PORTAR ${S.ok}/5` }; },
  },
  {
    id: 'drift', icon: '💨', name: 'DRIFTSKOLAN', track: 'kurva', start: 5,
    say: 'Gasa och håll inne pil vänster eller höger i kurvorna så sladdar bilen. Ju längre drift, desto fler poäng! Fyll mätaren för superturbo!',
    keys: ['up', 'left', 'right'],
    setup(S, T) { S.pts = 0; S.onDrift = (lvl, pts) => { S.pts += Math.round(pts); if (pts > 20) Snd.play('ding'); }; },
    update(S, dt, c, T) { if (c.prog >= T.N - 5) return { stars: S.pts >= 220 ? 3 : S.pts >= 130 ? 2 : S.pts >= 50 ? 1 : 0, msg: `${S.pts} DRIFTPOÄNG!` }; return null; },
    draw() { },
    hud(S) { const live = G.player.drift ? Math.round(G.player.driftPts) : 0; return { goal: `💨 ${S.pts + live} POÄNG (MÅL 220)`, meter: true }; },
  },
  {
    id: 'bromsdrift', icon: '🛑', name: 'BROMSDRIFT', track: 'kurva', start: 5,
    say: 'Kör fort in i kurvan. Håll inne pil vänster eller höger och tryck snabbt på pil ner. Då kastar sig bilen in i en sladd! Gör fem bromsdriftar.',
    keys: ['up', 'down', 'left', 'right'],
    setup(S, T) { S.n = 0; S.onBDrift = () => { S.n++; Snd.play('ding'); }; },
    update(S, dt, c, T) { if (c.prog >= T.N - 5) return { stars: S.n >= 5 ? 3 : S.n >= 3 ? 2 : S.n >= 1 ? 1 : 0, msg: `${S.n} BROMSDRIFTAR!` }; return null; },
    draw() { },
    hud(S) { return { goal: `🛑 BROMSDRIFTAR ${S.n} (MÅL 5)`, meter: true }; },
  },
  {
    id: 'jakt', icon: '🚓', name: 'FÅNGA TJUVEN', track: 'kurva', start: 5,
    say: 'En tjuv har stulit en bil! Kör ikapp och knuffa till tjuvbilen!',
    keys: ['up', 'left', 'right'],
    setup(S, T) {
      const r = makeCar(DRIVERS.find(d => d.id === 'skuggan'), T, 0, false); placeCar(r, T, 95, 0); r.prog = 90; r.noRubber = true; r.who = { name: 'TJUVEN', fig: { skin: 1, hair: 6, hairCol: 4, eyes: 3, beard: 2, mouth: 1, suit: 6 } }; r.skill = 1.05;
      G.cars.push(r); S.thief = r; S.limit = 45;
    },
    update(S, dt, c, T) {
      const r = S.thief; if (dist2(c.x, c.y, r.x, r.y) < 62 * 62) { Snd.play('fanfare'); addText(r.x, r.y, 'FÅNGAD!', '#ffd600'); r.spin = 1.5; return { stars: S.time < 20 ? 3 : S.time < 30 ? 2 : 1, msg: `TJUVEN FÅNGAD PÅ ${fmt(S.time)} SEKUNDER!` }; }
      if (S.time >= S.limit) return { stars: 0, msg: 'TJUVEN KOM UNDAN!' };
      return null;
    },
    draw(ctx, S, T, t) { const r = S.thief; ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(-G.cam.rot); ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'; ctx.fillText('💰', 0, -44 + Math.sin(t * 6) * 4); ctx.restore(); },
    hud(S) { const d = Math.max(0, Math.round(Math.hypot(S.thief.x - G.player.x, S.thief.y - G.player.y) / 10)); return { goal: `🚓 AVSTÅND ${d} M`, timer: Math.max(0, S.limit - S.time) }; },
  },
  {
    id: 'spoke', icon: '👻', name: 'KÖR MOT SPÖKET', track: 'kurva', start: 5,
    say: 'Kör ett varv så snabbt du kan! Spöket är ditt bästa varv. Kan du slå det?',
    keys: ['up', 'left', 'right'],
    setup(S, T) { const pd = playerData(); S.ghost = pd.ghost || null; S.rec = []; S.recT = 0; S.par = T.N * 10 / 500; },
    update(S, dt, c, T) {
      S.recT += dt; if (S.recT >= 0.05) { S.recT = 0; S.rec.push([Math.round(c.x), Math.round(c.y), +c.a.toFixed(2)]); }
      if (c.prog >= T.N - 5) {
        const tm = S.time; const pd = playerData(); const beat = !S.ghost || tm < S.ghost.t;
        if (beat) { pd.ghost = { t: tm, pts: S.rec }; saveProf(); }
        return { stars: tm <= S.par ? 3 : tm <= S.par * 1.25 ? 2 : 1, msg: (S.ghost ? (beat ? 'DU SLOG SPÖKET! ' : 'SPÖKET VANN DENNA GÅNG. ') : '') + `TID: ${fmt(tm)} S` };
      }
      return null;
    },
    draw(ctx, S, T, t) {
      if (!S.ghost) return; const k = S.time / 0.05, i = Math.floor(k), f = k - i, p = S.ghost.pts; if (i + 1 >= p.length) return;
      const x = lerp(p[i][0], p[i + 1][0], f), y = lerp(p[i][1], p[i + 1][1], f), a = p[i][2] + angDiff(p[i + 1][2], p[i][2]) * f;
      ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(x, y); ctx.rotate(a); drawCar(ctx, G.player.d, t); ctx.restore();
      ctx.save(); ctx.translate(x, y); ctx.rotate(-G.cam.rot); ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center'; ctx.globalAlpha = 0.8; ctx.fillText('👻', 0, -40); ctx.restore();
    },
    hud(S) { return { goal: S.ghost ? `👻 SPÖKET: ${fmt(S.ghost.t)} S` : 'SÄTT ETT REKORD!', timer: S.time, up: true }; },
  },
];

// ---------- Hjälpfunktioner ----------
function fmt(t) { return t.toFixed(1).replace('.', ','); }
function boxAt(T, i) { i = ((i % T.N) + T.N) % T.N; return { i, x: T.cl.px[i], y: T.cl.py[i], a: T.cl.ang[i] }; }
function local(T, b, c) { const dx = c.x - b.x, dy = c.y - b.y; return { along: dx * Math.cos(b.a) + dy * Math.sin(b.a), lat: -dx * Math.sin(b.a) + dy * Math.cos(b.a) }; }
function passed(c, gi, T) { const d = c.idx - gi; return d >= 0 && d < 40 && (c.prevIdxS == null || c.prevIdxS < gi); }
function addProp(T, kind, q, r) { T.props.push({ kind, x: q.x, y: q.y, r, a: q.a, vx: 0, vy: 0, va: 0, idx: q.i, hx: q.x, hy: q.y, ha: q.a, hi: q.i, cool: 0, fixed: true }); }
function placeCar(c, T, i, lat) { const cl = T.cl; i = ((i % T.N) + T.N) % T.N; c.x = cl.px[i] + cl.nx[i] * lat; c.y = cl.py[i] + cl.ny[i] * lat; c.a = cl.ang[i]; c.vx = c.vy = c.fs = 0; c.prog += i - c.idx; c.idx = i; c.lat = lat; c.air = 0; c.spin = 0; c.boost = 0; c.drift = false; c.prevIdxS = i; }
function drawBox(ctx, b, T, len, col, label, t, active) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); const w = T.hw - 6;
  ctx.fillStyle = active ? 'rgba(118,255,3,0.55)' : `rgba(118,255,3,${0.25 + Math.sin(t * 4) * 0.1})`; ctx.fillRect(-len / 2, -w, len, w * 2);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.setLineDash([24, 14]); ctx.strokeRect(-len / 2, -w, len, w * 2); ctx.setLineDash([]);
  ctx.rotate(Math.PI / 2); ctx.fillStyle = '#fff'; ctx.font = 'bold 44px "Arial Rounded MT Bold", Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 0);
  ctx.restore();
}
function drawGarage(ctx, b, active, t) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
  ctx.fillStyle = active ? 'rgba(118,255,3,0.5)' : 'rgba(255,255,255,0.18)'; ctx.fillRect(-60, -70, 120, 140);
  ctx.fillStyle = '#8d6e63'; ctx.fillRect(-80, -82, 160, 14); ctx.fillRect(-80, 68, 160, 14); ctx.fillRect(-80, -82, 14, 164);
  ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.moveTo(-86, -88); ctx.lineTo(-40, -110); ctx.lineTo(0, -88); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = t * 20; ctx.strokeRect(-60, -70, 120, 140); ctx.setLineDash([]);
  ctx.rotate(Math.PI / 2); ctx.fillStyle = '#fff'; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P', 0, 0);
  ctx.restore();
}
function drawCoin(ctx, x, y, r, t) { const s = Math.abs(Math.cos(t * 3 + x * 0.01)); ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(4, 6, r * s + 2, r, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffc400'; ctx.beginPath(); ctx.ellipse(0, 0, r * s + 1, r, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 3; ctx.stroke(); if (s > 0.4) { ctx.fillStyle = '#fff59d'; ctx.font = `bold ${r}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.scale(s, 1); ctx.fillText('★', 0, 1); ctx.restore(); } ctx.restore(); }
function drawBalloon(ctx, x, y, col, t) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(18, 26, 26, 22, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 30); ctx.quadraticCurveTo(8 + Math.sin(t * 3) * 6, 45, 0, 60); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 30, 34, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-10, -12, 8, 12, -0.4, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-5, 33); ctx.lineTo(5, 33); ctx.lineTo(0, 40); ctx.fill(); ctx.restore(); }

// ---------- Start / uppdatering ----------
function startSchool(ci) {
  const ch = CHALLENGES[ci]; const def = SCHOOL_TRACKS[ch.track];
  const T = buildTrack(def); T.props = []; T.ramps = [];
  const me = playerRacer();
  startRace(def, { me, diff: DIFFS.find(d => d.id === 'easy'), T, school: { ci } });
  const S = G.school; S.ch = ch; S.time = 0; S.done = false; S.player = G.player;
  placeCar(G.player, T, ch.start, 0); G.player.prog = 0; G.cam.x = G.player.x; G.cam.y = G.player.y; G.cam.a = G.player.a;
  ch.setup(S, T);
  G.mode = 'brief'; G.brief = { t: 0 };
  if (ch.id === 'backa') { /* bilen står framför garaget */ }
  Snd.music('menu');
  setTimeout(() => Voice.say(ch.say, true), 200);
}
function schoolUpdate(dt) {
  const S = G.school, c = G.player, T = G.T; if (S.done) return;
  S.time += dt;
  if (c.itemDelayP > 0) { c.itemDelayP -= dt; }
  const r = S.ch.update(S, dt, c, T);
  c.prevIdxS = c.idx;
  if (r) { S.done = true; G.mode = 'done'; Snd.engine(false, 0); setTimeout(() => showSchoolResult(r), 400); }
}
function schoolDraw(ctx, t, inV) { const S = G.school; if (S && S.ch) S.ch.draw(ctx, S, G.T, t, inV); }
function drawSchoolHUD() {
  const S = G.school; if (!S || !S.ch) return; const u = H / 1000;
  const font = s => `bold ${s * u | 0}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
  const txt = (s, x, y, size, col, align = 'center') => { ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 8 * u; ctx.strokeStyle = '#1a1033'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); };
  const h = S.ch.hud(S);
  ctx.fillStyle = 'rgba(20,10,50,0.6)'; rr(ctx, 20 * u, 20 * u, 560 * u, 130 * u, 24 * u); ctx.fill();
  txt(S.ch.icon + ' ' + S.ch.name, 40 * u, 60 * u, 36, '#ffd600', 'left');
  txt(h.goal, 40 * u, 112 * u, 40, '#fff', 'left');
  if (h.meter) drawDriftMeter(20 * u, 160 * u, 400 * u, u);
  const tm = h.timer != null ? h.timer : S.time;
  ctx.fillStyle = 'rgba(20,10,50,0.6)'; rr(ctx, W - 260 * u, 20 * u, 240 * u, 90 * u, 24 * u); ctx.fill();
  txt('⏱ ' + fmt(tm), W - 140 * u, 66 * u, 46, h.timer != null && !h.up && tm < 10 ? '#ff5252' : '#fff');
  // tangentbild
  const P = G.player; const x0 = 40 * u, y0 = H - 190 * u;
  const key = (x, y, w, lbl, on) => { ctx.fillStyle = on ? '#ffd600' : '#fff'; rr(ctx, x, y, w, 56 * u, 10 * u); ctx.fill(); ctx.fillStyle = '#b0bec5'; ctx.fillRect(x, y + 48 * u, w, 8 * u); ctx.fillStyle = '#263238'; ctx.font = font(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, x + w / 2, y + 26 * u); };
  const ks = S.ch.keys, dim = k => ks.includes(k);
  ctx.fillStyle = 'rgba(20,10,50,0.55)'; rr(ctx, x0 - 16 * u, y0 - 20 * u, (ks.includes('space') ? 560 : 230) * u, 160 * u, 24 * u); ctx.fill();
  ctx.globalAlpha = dim('up') ? 1 : 0.3; key(x0 + 64 * u, y0, 56 * u, '▲', keys.ArrowUp);
  ctx.globalAlpha = dim('left') ? 1 : 0.3; key(x0, y0 + 64 * u, 56 * u, '◀', keys.ArrowLeft);
  ctx.globalAlpha = dim('down') ? 1 : 0.3; key(x0 + 64 * u, y0 + 64 * u, 56 * u, '▼', keys.ArrowDown);
  ctx.globalAlpha = dim('right') ? 1 : 0.3; key(x0 + 128 * u, y0 + 64 * u, 56 * u, '▶', keys.ArrowRight);
  ctx.globalAlpha = 1;
  if (ks.includes('space')) { key(x0 + 230 * u, y0 + 64 * u, 290 * u, 'MELLANSLAG', keys.Space); if (P.item) { ctx.save(); ctx.translate(x0 + 375 * u, y0 + 22 * u); drawItemIcon(ctx, P.item, 60 * u, G.time); ctx.restore(); } }
  // nedräkning
  drawStartLights(u, (s, x, y, size, col, align = 'center') => txt(s, x, y, size, col, align));
  if (G.banner) { txt(G.banner.text, W / 2, H * 0.38, 110, G.banner.color); }
}

window.__TRs = { startSchool: (i) => startSchool(i), placeCar: (c, i, l) => placeCar(c, G.T, i, l), CHALLENGES };
