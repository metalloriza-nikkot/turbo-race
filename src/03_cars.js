// ===================== BILAR / FÖRARE =====================
const DRIVERS = [
  { id: 'blixt', name: 'BLIXT', say: 'Blixt. Den snabba sportbilen.', color: '#e8322a', dark: '#a31d17', type: 'sport' },
  { id: 'skuggan', name: 'SKUGGAN', say: 'Skuggan. Den hemliga nattbilen.', color: '#23262f', dark: '#101218', accent: '#35d0ff', type: 'shadow' },
  { id: 'dino', name: 'DINO', say: 'Dino. Dinosaurien i monstertrucken.', color: '#2e9e3f', dark: '#1d6b29', accent: '#8be36b', type: 'dino' },
  { id: 'robo', name: 'ROBO', say: 'Robo. Roboten i rymdglidaren.', color: '#c3cfdf', dark: '#8795a8', accent: '#27e6ff', type: 'robo' },
  { id: 'beast', name: 'TRAIL BEAST', say: 'Trail Beast. Pappas egen jeep!', color: '#f2701f', dark: '#b84a0e', accent: '#7cc242', type: 'jeep' },
  { id: 'flyg', name: 'FLYGAREN', say: 'Flygaren. Kör på marken men drömmer om himlen.', color: '#e53935', dark: '#b71c1c', accent: '#ffffff', type: 'plane' },
  { id: 'bat', name: 'BÅTEN', say: 'Båten. Fungerar bäst i vatten. Tyvärr finns det inget vatten.', color: '#1e88e5', dark: '#0d47a1', accent: '#8d6e63', type: 'boat' },
  { id: 'f1', name: 'FORMEL', say: 'Formel. Väldigt snabb och väldigt allvarlig.', color: '#00bfa5', dark: '#00796b', accent: '#ff6d00', type: 'f1' },
  { id: 'soffa', name: 'SOFFAN', say: 'Soffan. Ingen vet hur den startades. Ingen vågar stänga av den.', color: '#7e57c2', dark: '#4527a0', accent: '#ffca28', type: 'sofa' },
  { id: 'badkar', name: 'BADKARET', say: 'Badkaret. Rent, blött och förvånansvärt snabbt.', color: '#f5f5f5', dark: '#b0bec5', accent: '#4fc3f7', type: 'tub' },
  { id: 'korv', name: 'KORVEN', say: 'Korven. Med senap. Och ketchup. Och turbo.', color: '#e4a95b', dark: '#b87a33', accent: '#c0392b', type: 'hotdog' },
  { id: 'polis', name: 'POLISEN', say: 'Polisbilen.', color: '#f5f7fb', dark: '#b9c3d3', accent: '#1f5fd6', type: 'police' },
  // Familjens egna konstruktioner
  { id: 'rc', name: 'RC-RACERN', say: 'RC-racern. Liten bil, stor fart! Den pruttar eld.', color: '#e53935', dark: '#9a1b17', accent: '#1e88e5', accent2: '#fdd835', type: 'rc', trail: 'fire', by: 'LIAM' },
  { id: 'atervinn', name: 'ÅTERVINNAREN', say: 'Återvinnaren. Renare värld, en last i taget!', color: '#43a047', dark: '#2e7d32', accent: '#e53935', accent2: '#ffb300', type: 'recycle', trail: 'bio', by: 'PAPPA' },
];

function shade2(c) { return c.startsWith('#') ? shade(c, 1.18) : c; }
function wheel(ctx, x, y, w, h) { ctx.fillStyle = '#1a1a1a'; rr(ctx, x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.35); ctx.fill(); ctx.fillStyle = '#444'; ctx.fillRect(x - w / 2 + 2, y - 1, w - 4, 2); }

// Ritar bilen med fronten åt +x. Längd ca 64.
function drawCarBase(ctx, d, time, o = {}) {
  ctx.lineJoin = 'round';
  const outline = 'rgba(0,0,0,0.45)';
  switch (d.type) {
    case 'sport': {
      wheel(ctx, 19, -16, 15, 8); wheel(ctx, 19, 16, 15, 8); wheel(ctx, -19, -17, 16, 9); wheel(ctx, -19, 17, 16, 9);
      ctx.fillStyle = d.color; ctx.strokeStyle = outline; ctx.lineWidth = 2;
      // kaross: rundad med breda bakskärmar
      ctx.beginPath();
      ctx.moveTo(33, 0);
      ctx.bezierCurveTo(33, -10, 30, -15, 22, -16); ctx.bezierCurveTo(14, -17, 8, -13, 0, -13);
      ctx.bezierCurveTo(-10, -13, -14, -18, -22, -18); ctx.bezierCurveTo(-30, -18, -33, -12, -33, 0);
      ctx.bezierCurveTo(-33, 12, -30, 18, -22, 18); ctx.bezierCurveTo(-14, 18, -10, 13, 0, 13);
      ctx.bezierCurveTo(8, 13, 14, 17, 22, 16); ctx.bezierCurveTo(30, 15, 33, 10, 33, 0);
      ctx.fill(); ctx.stroke();
      // huv-ljus
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(20, -4, 9, 5, 0, 0, TAU); ctx.fill();
      // runda strålkastare
      for (const s of [-1, 1]) { ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(26, s * 10, 4.6, 0, TAU); ctx.fill(); ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5; ctx.stroke(); }
      // vindruta, tak, bakruta (fastback)
      ctx.fillStyle = '#233a55'; ctx.beginPath(); ctx.moveTo(10, -11); ctx.quadraticCurveTo(13, 0, 10, 11); ctx.lineTo(2, 10); ctx.lineTo(2, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = d.dark; rr(ctx, -12, -10, 14, 20, 5); ctx.fill();
      ctx.fillStyle = '#233a55'; ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-22, -6); ctx.lineTo(-22, 6); ctx.lineTo(-12, 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(160,200,255,0.5)'; ctx.fillRect(4, -8, 2, 6);
      // motorlucka galler
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-25 - k * 1.8, -4); ctx.lineTo(-25 - k * 1.8, 4); ctx.stroke(); }
      ctx.fillStyle = '#ff1744'; rr(ctx, -34, -12, 3, 24, 1.5); ctx.fill();
      break;
    }
    case 'shadow': {
      wheel(ctx, 16, -14, 14, 8); wheel(ctx, 16, 14, 14, 8); wheel(ctx, -18, -16, 16, 9); wheel(ctx, -18, 16, 16, 9);
      // jetlåga
      const fl = 8 + Math.sin(time * 40) * 3 + (o.boost ? 14 : 0);
      ctx.fillStyle = 'rgba(53,208,255,0.8)'; ctx.beginPath(); ctx.moveTo(-32, -5); ctx.lineTo(-32 - fl, 0); ctx.lineTo(-32, 5); ctx.fill();
      ctx.fillStyle = d.color; ctx.strokeStyle = '#4a5160'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(38, 0); ctx.lineTo(22, -9); ctx.lineTo(0, -12); ctx.lineTo(-14, -14); ctx.lineTo(-26, -27); ctx.lineTo(-36, -25); ctx.lineTo(-30, -12); ctx.lineTo(-34, -6);
      ctx.lineTo(-34, 6); ctx.lineTo(-30, 12); ctx.lineTo(-36, 25); ctx.lineTo(-26, 27); ctx.lineTo(-14, 14); ctx.lineTo(0, 12); ctx.lineTo(22, 9); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // blå lysränder
      ctx.strokeStyle = d.accent; ctx.lineWidth = 2.5; ctx.shadowColor = d.accent; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(30, -3); ctx.lineTo(6, -9); ctx.lineTo(-14, -11); ctx.moveTo(30, 3); ctx.lineTo(6, 9); ctx.lineTo(-14, 11); ctx.moveTo(-18, -16); ctx.lineTo(-29, -24); ctx.moveTo(-18, 16); ctx.lineTo(-29, 24); ctx.stroke();
      ctx.shadowBlur = 0;
      // cockpit
      ctx.fillStyle = '#0b1a2a'; ctx.beginPath(); ctx.ellipse(-2, 0, 13, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(53,208,255,0.45)'; ctx.beginPath(); ctx.ellipse(1, -2, 7, 2.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.arc(33, -2.5, 1.8, 0, TAU); ctx.arc(33, 2.5, 1.8, 0, TAU); ctx.fill();
      break;
    }
    case 'dino': {
      // stora hjul
      for (const [x, y] of [[20, -21], [20, 21], [-19, -21], [-19, 21]]) { ctx.fillStyle = '#111'; rr(ctx, x - 12, y - 7, 24, 14, 5); ctx.fill(); ctx.fillStyle = '#333'; for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * 4.5 - 1, y - 7, 2, 14); ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.arc(x, y + (y > 0 ? -3 : 3), 2.5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = d.color; ctx.strokeStyle = outline; ctx.lineWidth = 2; rr(ctx, -28, -16, 56, 32, 9); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd600'; ctx.fillRect(-28, -3, 56, 6);
      ctx.fillStyle = d.dark; rr(ctx, 12, -12, 14, 24, 5); ctx.fill();
      // svans
      ctx.strokeStyle = d.accent; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-32, Math.sin(time * 6) * 6, -40, 8 + Math.sin(time * 6) * 5); ctx.stroke();
      // kropp
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.ellipse(-4, 0, 12, 10, 0, 0, TAU); ctx.fill();
      // taggar
      ctx.fillStyle = '#ff7043'; for (let k = 0; k < 4; k++) { const x = -14 + k * 5; ctx.beginPath(); ctx.moveTo(x - 2, 0); ctx.lineTo(x + 1, -4.5); ctx.lineTo(x + 4, 0); ctx.lineTo(x + 1, 4.5); ctx.fill(); }
      // armar
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.arc(5, -8, 3, 0, TAU); ctx.arc(5, 8, 3, 0, TAU); ctx.fill();
      // huvud
      ctx.beginPath(); ctx.ellipse(10, 0, 11, 8.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = outline; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(11, -4.5, 3.4, 0, TAU); ctx.arc(11, 4.5, 3.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(12.5, -4.5, 1.8, 0, TAU); ctx.arc(12.5, 4.5, 1.8, 0, TAU); ctx.fill();
      ctx.fillStyle = d.dark; ctx.beginPath(); ctx.arc(19, -2, 1.2, 0, TAU); ctx.arc(19, 2, 1.2, 0, TAU); ctx.fill();
      break;
    }
    case 'robo': {
      // svävarglöd
      const pul = 0.5 + Math.sin(time * 8) * 0.2;
      const g = ctx.createRadialGradient(0, 0, 5, 0, 0, 40); g.addColorStop(0, `rgba(39,230,255,${pul})`); g.addColorStop(1, 'rgba(39,230,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fill();
      ctx.fillStyle = d.color; ctx.strokeStyle = '#5e6b7d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(4, -12); ctx.lineTo(-26, -27); ctx.lineTo(-20, -8); ctx.lineTo(-28, 0); ctx.lineTo(-20, 8); ctx.lineTo(-26, 27); ctx.lineTo(4, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = d.accent; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(30, -1); ctx.lineTo(0, -10); ctx.lineTo(-22, -22); ctx.moveTo(30, 1); ctx.lineTo(0, 10); ctx.lineTo(-22, 22); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.arc(-24, -6, 3.5 + pul * 2, 0, TAU); ctx.arc(-24, 6, 3.5 + pul * 2, 0, TAU); ctx.fill();
      // robothuvud
      ctx.fillStyle = '#8d9bb0'; ctx.beginPath(); ctx.arc(-2, 0, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4b5667'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#0d2a3a'; rr(ctx, 1, -7, 6, 14, 3); ctx.fill();
      ctx.fillStyle = d.accent; ctx.fillRect(3, -5 + ((time * 10) % 10), 2, 2);
      ctx.strokeStyle = '#4b5667'; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-14, -9); ctx.stroke();
      ctx.fillStyle = Math.floor(time * 3) % 2 ? '#ff1744' : '#ff8a80'; ctx.beginPath(); ctx.arc(-14, -9, 2.5, 0, TAU); ctx.fill();
      break;
    }
    case 'jeep': {
      // Trail Beast – Niklas egen konceptjeep (ovanifrån)
      // rökpuffar från avgasrören
      for (let k = 0; k < 4; k++) { const ph = ((time * 1.6 + k / 4) % 1); for (const s of [-1, 1]) { ctx.fillStyle = `rgba(70,70,75,${0.45 * (1 - ph)})`; ctx.beginPath(); ctx.arc(4 - ph * 34, s * (21 + ph * 6), 3 + ph * 7, 0, TAU); ctx.fill(); } }
      // stora terrängdäck
      for (const [x, y] of [[22, -22], [22, 22], [-21, -22], [-21, 22]]) { ctx.fillStyle = '#161616'; rr(ctx, x - 13, y - 7.5, 26, 15, 5); ctx.fill(); ctx.fillStyle = '#3a3a3a'; for (let k = -2; k <= 2; k++) { ctx.fillRect(x + k * 5 - 1.5, y - 7.5, 3, 4); ctx.fillRect(x + k * 5 - 1.5 + 2, y + 3.5, 3, 4); } }
      // reservhjul bak
      ctx.fillStyle = '#161616'; ctx.beginPath(); ctx.arc(-38, 0, 11, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(-38, 0, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(-38, 0, 2.5, 0, TAU); ctx.fill();
      // kaross (orange hytt, grön/gul huv)
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.fillStyle = d.color; rr(ctx, -33, -18, 66, 36, 8); ctx.fill();
      ctx.fillStyle = d.accent; rr(ctx, 6, -18, 27, 36, 8); ctx.fill();
      ctx.fillStyle = '#e6d02a'; rr(ctx, 24, -17, 9, 34, 5); ctx.fill();
      // kamouflage-fläckar
      ctx.fillStyle = d.accent; for (const [x, y, r] of [[-26, -12, 5], [-14, 13, 6], [-30, 9, 4]]) { ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, 0.4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = d.color; for (const [x, y, r] of [[14, -11, 4], [18, 10, 3.5]]) { ctx.beginPath(); ctx.ellipse(x, y, r * 1.4, r, -0.3, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(90,60,30,0.35)'; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.arc(-28 + k * 7.5, ((k * 13) % 30) - 15, 1.6, 0, TAU); ctx.fill(); }
      rr(ctx, -33, -18, 66, 36, 8); ctx.stroke();
      // huvspringor
      ctx.fillStyle = '#1d1d1d'; for (let k = 0; k < 3; k++) ctx.fillRect(12 + k * 3.5, -6, 1.8, 12);
      // stötfångare, vinsch & röd schackel
      ctx.fillStyle = '#1d1d1d'; rr(ctx, 32, -17, 5, 34, 2); ctx.fill();
      ctx.fillStyle = '#9ea4ab'; rr(ctx, 33, -6, 5, 12, 2); ctx.fill();
      ctx.strokeStyle = '#e02525'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(40, 0, 3, 0, TAU); ctx.stroke();
      // runda strålkastare
      for (const s of [-1, 1]) { ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(30, s * 12, 3.6, 0, TAU); ctx.fill(); ctx.strokeStyle = '#333'; ctx.lineWidth = 1.2; ctx.stroke(); }
      // öppen hytt med säten
      ctx.fillStyle = '#2b2b2e'; rr(ctx, -24, -13, 28, 26, 4); ctx.fill();
      ctx.fillStyle = '#4a4a50'; rr(ctx, -9, -11, 8, 9, 2); ctx.fill(); rr(ctx, -9, 2, 8, 9, 2); ctx.fill(); rr(ctx, -21, -10, 8, 20, 2); ctx.fill();
      ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(1, -6.5, 3, 0, TAU); ctx.stroke();
      // störtbåge
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2.6; ctx.strokeRect(-25, -14, 30, 28); ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(-12, 14); ctx.stroke();
      // ljusramp på taket
      ctx.fillStyle = '#1d1d1d'; rr(ctx, 3, -16, 5, 32, 2); ctx.fill();
      ctx.fillStyle = '#ffe36b'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(5.5, -12 + k * 6, 1.7, 0, TAU); ctx.fill(); }
      // två avgasrör vid sidorna
      for (const s of [-1, 1]) {
        ctx.fillStyle = '#b8bec6'; rr(ctx, 4, s * 20 - 2.5, 16, 5, 2.5); ctx.fill();
        ctx.fillStyle = 'rgba(40,40,40,0.5)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(7 + k * 3.5, s * 20, 0.8, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#d7dce2'; ctx.beginPath(); ctx.arc(4, s * 20, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(4, s * 20, 1.8, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#ff1744'; ctx.fillRect(-34, -14, 2.5, 5); ctx.fillRect(-34, 9, 2.5, 5);
      break;
    }
    case 'plane': {
      wheel(ctx, 6, -9, 8, 5); wheel(ctx, 6, 9, 8, 5); wheel(ctx, -24, 0, 7, 4);
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      // vingar
      ctx.fillStyle = d.dark; ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(4, -34); ctx.lineTo(-6, -34); ctx.lineTo(-4, -6); ctx.closePath(); ctx.moveTo(10, 6); ctx.lineTo(4, 34); ctx.lineTo(-6, 34); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillRect(-2, -32, 5, 8); ctx.fillRect(-2, 24, 5, 8);
      // stjärtvingar
      ctx.fillStyle = d.dark; ctx.beginPath(); ctx.moveTo(-24, -3); ctx.lineTo(-32, -15); ctx.lineTo(-36, -15); ctx.lineTo(-33, 0); ctx.lineTo(-36, 15); ctx.lineTo(-32, 15); ctx.lineTo(-24, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      // kropp
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.ellipse(-2, 0, 32, 9, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.fillRect(-20, -2, 40, 4);
      ctx.fillStyle = '#90caf9'; ctx.beginPath(); ctx.ellipse(8, 0, 8, 5.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
      // propeller
      ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(31, 0, 3, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(32, 0); ctx.rotate(time * 40); ctx.fillStyle = 'rgba(60,60,60,0.55)'; ctx.fillRect(-1.5, -14, 3, 28); ctx.restore();
      ctx.strokeStyle = 'rgba(80,80,80,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(32, 0, 14, 0, TAU); ctx.stroke();
      break;
    }
    case 'boat': {
      wheel(ctx, 18, -17, 12, 7); wheel(ctx, 18, 17, 12, 7); wheel(ctx, -16, -18, 12, 7); wheel(ctx, -16, 18, 12, 7);
      // kölvatten
      for (let k = 0; k < 3; k++) { const ph = (time * 2 + k / 3) % 1; ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - ph)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-34 - ph * 20, 0, 6 + ph * 14, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); }
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.moveTo(38, 0); ctx.quadraticCurveTo(22, -17, 0, -17); ctx.lineTo(-30, -15); ctx.lineTo(-30, 15); ctx.lineTo(0, 17); ctx.quadraticCurveTo(22, 17, 38, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.moveTo(32, 0); ctx.quadraticCurveTo(18, -12, 0, -12); ctx.lineTo(-26, -11); ctx.lineTo(-26, 11); ctx.lineTo(0, 12); ctx.quadraticCurveTo(18, 12, 32, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,30,10,0.4)'; ctx.lineWidth = 1; for (let k = -8; k <= 8; k += 4) { ctx.beginPath(); ctx.moveTo(-26, k); ctx.lineTo(24 - Math.abs(k) * 0.8, k); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.fillRect(-4, -10, 3, 20);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-10, 0, 4, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#ff5722'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(14, 7, 4, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#546e7a'; rr(ctx, -38, -6, 10, 12, 2); ctx.fill(); ctx.fillStyle = '#263238'; ctx.fillRect(-41, -2, 4, 4);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(20, -3); ctx.lineTo(28, 0); ctx.lineTo(20, 3); ctx.fill();
      break;
    }
    case 'f1': {
      // framvinge och bakvinge
      ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
      ctx.fillStyle = d.dark; rr(ctx, 30, -20, 6, 40, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; rr(ctx, -36, -18, 7, 36, 2); ctx.fill(); ctx.stroke();
      // öppna hjul
      for (const [x, y] of [[22, -17], [22, 17], [-20, -18], [-20, 18]]) { ctx.fillStyle = '#111'; rr(ctx, x - 8, y - 6, 16, 12, 3); ctx.fill(); ctx.fillStyle = d.accent; ctx.fillRect(x - 1, y - 6, 2, 12); }
      ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, -6); ctx.lineTo(22, -12); ctx.moveTo(14, 6); ctx.lineTo(22, 12); ctx.moveTo(-14, -8); ctx.lineTo(-20, -12); ctx.moveTo(-14, 8); ctx.lineTo(-20, 12); ctx.stroke();
      // kropp
      ctx.fillStyle = d.color; ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(18, -5); ctx.lineTo(0, -8); ctx.lineTo(-10, -12); ctx.lineTo(-28, -10); ctx.lineTo(-30, 0); ctx.lineTo(-28, 10); ctx.lineTo(-10, 12); ctx.lineTo(0, 8); ctx.lineTo(18, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(18, -2.5); ctx.lineTo(18, 2.5); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(-4, 0, 7, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.arc(-3, 0, 3.8, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-3, 0, 7, -1.2, 1.2); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.translate(-18, 0); ctx.rotate(Math.PI / 2); ctx.fillText('7', 0, 0); ctx.restore();
      break;
    }
    case 'sofa': {
      wheel(ctx, 16, -19, 10, 6); wheel(ctx, 16, 19, 10, 6); wheel(ctx, -16, -19, 10, 6); wheel(ctx, -16, 19, 10, 6);
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.fillStyle = d.dark; rr(ctx, -30, -20, 60, 40, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.dark; rr(ctx, -30, -20, 14, 40, 6); ctx.fill();
      ctx.fillStyle = d.color; rr(ctx, -28, -20, 58, 9, 5); ctx.fill(); rr(ctx, -28, 11, 58, 9, 5); ctx.fill();
      ctx.fillStyle = shade2(d.color); rr(ctx, -15, -11, 22, 22, 4); ctx.fill(); rr(ctx, 8, -11, 20, 22, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(7.5, -10); ctx.lineTo(7.5, 10); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.save(); ctx.translate(-4, -2); ctx.rotate(0.3); rr(ctx, -6, -5, 12, 10, 3); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#263238'; rr(ctx, 14, 2, 9, 4, 1.5); ctx.fill(); ctx.fillStyle = '#ff1744'; ctx.fillRect(21, 3, 1.5, 1.5);
      ctx.fillStyle = '#9e9e9e'; ctx.fillRect(-36, 12, 8, 4); for (let k = 0; k < 2; k++) { const ph = (time * 3 + k / 2) % 1; ctx.fillStyle = `rgba(150,150,150,${0.5 * (1 - ph)})`; ctx.beginPath(); ctx.arc(-38 - ph * 14, 14, 3 + ph * 5, 0, TAU); ctx.fill(); }
      break;
    }
    case 'tub': {
      for (const [x, y] of [[18, -17], [18, 17], [-18, -17], [-18, 17]]) { ctx.fillStyle = '#ffc400'; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.ellipse(0, 0, 33, 17, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.ellipse(-1, 0, 27, 12, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(-18 + k * 7, Math.sin(time * 3 + k) * 5, 2.5 + (k % 3), 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(-6 + Math.sin(time * 2) * 4, 2 + Math.cos(time * 2) * 3); ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(5, 0, 3.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(7.5, -1); ctx.lineTo(10.5, 0); ctx.lineTo(7.5, 1); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#b0bec5'; rr(ctx, 26, -4, 8, 8, 2); ctx.fill(); ctx.fillStyle = '#90a4ae'; ctx.fillRect(30, -8, 3, 16);
      ctx.fillStyle = '#e91e63'; ctx.save(); ctx.translate(-30, -9); ctx.rotate(-0.4); ctx.fillRect(-3, -3, 8, 6); ctx.restore();
      break;
    }
    case 'hotdog': {
      wheel(ctx, 17, -15, 12, 7); wheel(ctx, 17, 15, 12, 7); wheel(ctx, -17, -15, 12, 7); wheel(ctx, -17, 15, 12, 7);
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.ellipse(0, 0, 32, 15, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.dark; ctx.beginPath(); ctx.ellipse(0, 0, 28, 10, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = d.accent; ctx.beginPath(); ctx.ellipse(0, 0, 38, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-4, -2.5, 26, 1.8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffd600'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 12; k++) { const x = -26 + k * 4.4; ctx.lineTo(x, (k % 2 ? -3 : 3)); } ctx.stroke();
      ctx.strokeStyle = '#e53935'; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = 0; k <= 10; k++) { const x = -22 + k * 4.4; ctx.lineTo(x, (k % 2 ? 2.5 : -2.5)); } ctx.stroke();
      break;
    }
    case 'amb': { // ambulans (bara i Turbostaden)
      wheel(ctx, 20, -17, 15, 8); wheel(ctx, 20, 17, 15, 8); wheel(ctx, -22, -17, 15, 8); wheel(ctx, -22, 17, 15, 8);
      ctx.fillStyle = '#fafafa'; ctx.strokeStyle = outline; ctx.lineWidth = 2; rr(ctx, -36, -17, 72, 34, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e53935'; ctx.fillRect(-34, -3, 60, 6);
      ctx.fillStyle = '#233a55'; rr(ctx, 16, -13, 10, 26, 3); ctx.fill();
      ctx.fillStyle = '#e53935'; ctx.fillRect(-18, -4, 20, 8); ctx.fillRect(-12, -10, 8, 20);
      const on2 = Math.floor(time * 6) % 2; ctx.shadowColor = '#2979ff'; ctx.shadowBlur = o.siren ? 16 : 0;
      ctx.fillStyle = o.siren && on2 ? '#2979ff' : '#0d2c6b'; rr(ctx, 6, -15, 7, 10, 2); ctx.fill(); ctx.fillStyle = o.siren && !on2 ? '#2979ff' : '#0d2c6b'; rr(ctx, 6, 5, 7, 10, 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(33, -10, 3.2, 0, TAU); ctx.arc(33, 10, 3.2, 0, TAU); ctx.fill();
      break;
    }
    case 'rc': { // RC-RACERN – ritad av Liam: blå nos, röd kaross, svart motorblock med tre avgasrör, gula fenor, grova däck
      const knob = (x, y, w, h) => { ctx.fillStyle = '#151515'; rr(ctx, x - w / 2, y - h / 2, w, h, 4); ctx.fill(); ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.4; for (let k = 1; k < 5; k++) { const xx = x - w / 2 + k * w / 5; ctx.beginPath(); ctx.moveTo(xx, y - h / 2 + 1); ctx.lineTo(xx, y + h / 2 - 1); ctx.stroke(); } ctx.fillStyle = d.accent2 || '#fdd835'; ctx.fillRect(x - 3, y - (y > 0 ? -h / 2 + 2.5 : h / 2 - 0.5), 6, 2); };
      knob(21, -19, 17, 10); knob(21, 19, 17, 10); knob(-20, -21, 20, 12); knob(-20, 21, 20, 12);
      // avgaslågor (alltid lite, mer vid turbo)
      const big = o.boost ? 1.8 : 1;
      if (!o.noFx) for (const y of [-8, 0, 8]) { const L = (8 + Math.random() * 7) * big; ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.moveTo(-40, y - 3); ctx.quadraticCurveTo(-40 - L, y, -40, y + 3); ctx.fill(); ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.moveTo(-40, y - 1.6); ctx.quadraticCurveTo(-40 - L * 0.55, y, -40, y + 1.6); ctx.fill(); }
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      // motorblock + rör
      ctx.fillStyle = '#26262b'; rr(ctx, -35, -14, 24, 28, 5); ctx.fill(); ctx.stroke();
      for (const y of [-8, 0, 8]) { ctx.fillStyle = '#3d3d44'; rr(ctx, -41, y - 3.6, 9, 7.2, 2); ctx.fill(); ctx.fillStyle = '#ff7043'; ctx.beginPath(); ctx.arc(-41, y, 2.4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#4a4a52'; for (const y of [-11, 11]) ctx.fillRect(-31, y - 1, 16, 2);
      // röd kaross
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.moveTo(-14, -15); ctx.lineTo(10, -14); ctx.lineTo(17, -11); ctx.lineTo(17, 11); ctx.lineTo(10, 14); ctx.lineTo(-14, 15); ctx.lineTo(-17, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(12, -7); ctx.moveTo(-10, 8); ctx.lineTo(12, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; rr(ctx, -8, -5, 18, 4, 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; for (const y of [-12, 12]) for (let k = 0; k < 3; k++) ctx.fillRect(-2 + k * 4, y - 1, 2.2, 2);
      // blå nos/cockpit med svart rand
      ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.fillStyle = d.accent; ctx.beginPath(); ctx.moveTo(14, -12); ctx.quadraticCurveTo(36, -12, 37, 0); ctx.quadraticCurveTo(36, 12, 14, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.arc(14, 0, 14, -1.1, 1.1); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(25, -4, 6, 3, -0.3, 0, TAU); ctx.fill();
      // gula fenor + LED-ljus
      ctx.fillStyle = d.accent2 || '#fdd835'; ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(30, s * 9); ctx.lineTo(39, s * 17); ctx.lineTo(33, s * 18); ctx.lineTo(26, s * 12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = '#e1f5fe'; ctx.fillRect(34, -6, 2.5, 4); ctx.fillRect(34, 2, 2.5, 4);
      break;
    }
    case 'recycle': { // ÅTERVINNAREN – sopbil med röd hytt, grönt flak och ögon i vindrutan
      wheel(ctx, 24, -18, 13, 6); wheel(ctx, 24, 18, 13, 6); wheel(ctx, -14, -18, 13, 6); wheel(ctx, -14, 18, 13, 6); wheel(ctx, -27, -18, 13, 6); wheel(ctx, -27, 18, 13, 6);
      ctx.strokeStyle = outline; ctx.lineWidth = 2;
      // bakre lastlucka med hydraulik
      ctx.fillStyle = d.dark; rr(ctx, -40, -17, 9, 34, 3); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-38, -12); ctx.lineTo(-30, -8); ctx.moveTo(-38, 12); ctx.lineTo(-30, 8); ctx.stroke();
      ctx.fillStyle = '#ff5252'; ctx.fillRect(-41, -15, 2, 4); ctx.fillRect(-41, 11, 2, 4);
      // grönt flak med räfflor
      ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.fillStyle = d.color; rr(ctx, -33, -16, 47, 32, 4); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.2; for (let k = 0; k < 6; k++) { const x = -29 + k * 8; ctx.beginPath(); ctx.moveTo(x, -15); ctx.lineTo(x, -11); ctx.moveTo(x, 11); ctx.lineTo(x, 15); ctx.stroke(); }
      // återvinningssymbol: tre böjda pilar i en ring
      ctx.save(); ctx.translate(-10, 0); ctx.rotate(-time * 0.5); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const a0 = k * TAU / 3 + 0.25, a1 = a0 + 1.45, r = 8; ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); ctx.stroke();
        const tx = Math.cos(a1 + 0.42) * r, ty = Math.sin(a1 + 0.42) * r, bx = Math.cos(a1), by = Math.sin(a1); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx * (r + 3.4), by * (r + 3.4)); ctx.lineTo(bx * (r - 3.4), by * (r - 3.4)); ctx.closePath(); ctx.fill(); }
      ctx.lineCap = 'butt'; ctx.restore();
      // avgasrör (bio)
      ctx.fillStyle = '#b0bec5'; ctx.beginPath(); ctx.arc(14, -15, 3.2, 0, TAU); ctx.fill(); ctx.strokeStyle = '#78909c'; ctx.lineWidth = 1; ctx.stroke();
      // röd hytt
      ctx.strokeStyle = outline; ctx.lineWidth = 2; ctx.fillStyle = d.accent; rr(ctx, 15, -16, 23, 32, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = shade(d.accent, 1.15); rr(ctx, 17, -12, 8, 24, 3); ctx.fill();
      // vindruta med stora ögon
      ctx.fillStyle = '#1c3550'; rr(ctx, 27, -13, 9, 26, 3); ctx.fill();
      const blink = (time % 4.2) < 0.13;
      for (const s of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(31.5, s * 6.2, 3.6, blink ? 0.8 : 4.6, 0, 0, TAU); ctx.fill(); if (!blink) { ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(33, s * 6.2, 2.1, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(33.6, s * 6.2, 1.1, 0, TAU); ctx.fill(); } }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(36, 0, 3.5, -1.2, 1.2); ctx.stroke();
      // blinkande orange varningsljus
      const on = Math.floor(time * 4) % 2; for (const s of [-1, 1]) { ctx.shadowColor = '#ffb300'; ctx.shadowBlur = (on ^ (s > 0)) ? 12 : 0; ctx.fillStyle = (on ^ (s > 0)) ? '#ffd54f' : (d.accent2 || '#ffb300'); ctx.beginPath(); ctx.arc(20, s * 11, 3, 0, TAU); ctx.fill(); } ctx.shadowBlur = 0;
      ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(38, -12, 2.4, 0, TAU); ctx.arc(38, 12, 2.4, 0, TAU); ctx.fill();
      break;
    }
    case 'police': {
      wheel(ctx, 18, -16, 15, 8); wheel(ctx, 18, 16, 15, 8); wheel(ctx, -18, -16, 15, 8); wheel(ctx, -18, 16, 15, 8);
      ctx.fillStyle = d.color; ctx.strokeStyle = outline; ctx.lineWidth = 2; rr(ctx, -32, -15, 64, 30, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = d.accent; ctx.fillRect(-26, -15, 52, 5); ctx.fillRect(-26, 10, 52, 5);
      ctx.fillStyle = '#ffd600'; for (let k = 0; k < 6; k++) { ctx.fillRect(-24 + k * 9, -15, 4.5, 5); ctx.fillRect(-24 + k * 9 + 4.5, 10, 4.5, 5); }
      ctx.fillStyle = '#233a55'; rr(ctx, 6, -11, 9, 22, 3); ctx.fill(); rr(ctx, -22, -10, 7, 20, 3); ctx.fill();
      ctx.fillStyle = '#e8ecf3'; rr(ctx, -15, -11, 21, 22, 4); ctx.fill();
      const on = Math.floor(time * 6) % 2;
      ctx.fillStyle = '#263238'; rr(ctx, -7, -12, 7, 24, 2); ctx.fill();
      ctx.shadowColor = '#2979ff'; ctx.shadowBlur = 14;
      ctx.fillStyle = on ? '#2979ff' : '#0d2c6b'; rr(ctx, -6.5, -11, 6, 10, 2); ctx.fill();
      ctx.fillStyle = on ? '#0d2c6b' : '#2979ff'; rr(ctx, -6.5, 1, 6, 10, 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(29, -9, 3.2, 0, TAU); ctx.arc(29, 9, 3.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff1744'; ctx.fillRect(-33, -12, 2.5, 6); ctx.fillRect(-33, 6, 2.5, 6);
      break;
    }
  }
}

// Power-up-ikoner (ritas centrerade, storlek ~ s)
const ITEM_NAMES = { turbo: 'TURBO', shield: 'SKÖLD', blob: 'KLUMP', ball: 'BOLL' };
const ITEM_SAY = { turbo: 'Turbo!', shield: 'Sköld!', blob: 'Lavaklump!', ball: 'Studsboll!' };
function drawItemIcon(ctx, type, s, time) {
  ctx.save(); ctx.scale(s / 100, s / 100);
  if (type === 'turbo') {
    ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.moveTo(-40, -22); ctx.lineTo(10, -22); ctx.lineTo(10, -38); ctx.lineTo(45, 0); ctx.lineTo(10, 38); ctx.lineTo(10, 22); ctx.lineTo(-40, 22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd600'; ctx.beginPath(); ctx.moveTo(-30, -11); ctx.lineTo(14, -11); ctx.lineTo(14, -20); ctx.lineTo(32, 0); ctx.lineTo(14, 20); ctx.lineTo(14, 11); ctx.lineTo(-30, 11); ctx.closePath(); ctx.fill();
  } else if (type === 'shield') {
    ctx.fillStyle = '#29b6f6'; ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(36, -28); ctx.quadraticCurveTo(36, 22, 0, 44); ctx.quadraticCurveTo(-36, 22, -36, -28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU - Math.PI / 2, r = k % 2 ? 8 : 18; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
  } else if (type === 'blob') {
    drawBlob(ctx, 0, 0, 40, time || 0);
  } else if (type === 'ball') {
    drawBall(ctx, 0, 0, 38, (time || 0) * 3);
  }
  ctx.restore();
}
function drawBlob(ctx, x, y, r, time) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r * 1.1);
  g.addColorStop(0, '#fff176'); g.addColorStop(0.35, '#ff9800'); g.addColorStop(1, '#bf360c');
  ctx.fillStyle = g; ctx.beginPath();
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, rr2 = r * (1 + Math.sin(k * 2.7 + time * 4) * 0.12); ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.15, r * 0.2, 0, TAU); ctx.arc(x + r * 0.3, y - r * 0.15, r * 0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x - r * 0.27, y - r * 0.1, r * 0.1, 0, TAU); ctx.arc(x + r * 0.33, y - r * 0.1, r * 0.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4e1a00'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 0.25, 0.2, Math.PI - 0.2); ctx.stroke();
}
function drawBall(ctx, x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const cols = ['#e53935', '#fdd835', '#1e88e5', '#43a047'];
  for (let k = 0; k < 4; k++) { ctx.fillStyle = cols[k]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, k / 4 * TAU, (k + 1) / 4 * TAU); ctx.fill(); }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
}
function drawItemBox(ctx, x, y, time, ph) {
  ctx.save(); ctx.translate(x, y + Math.sin(time * 3 + ph) * 3); ctx.rotate(Math.sin(time * 1.5 + ph) * 0.3);
  const s = 34;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(ctx, -s / 2 + 4, -s / 2 + 8, s, s, 8); ctx.fill();
  const h = (time * 90 + ph * 60) % 360;
  ctx.fillStyle = `hsla(${h},90%,60%,0.9)`; rr(ctx, -s / 2, -s / 2, s, s, 8); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 26px "Arial Rounded MT Bold", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2);
  ctx.restore();
}
