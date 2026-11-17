// Utilidades del anuncio (solo 2D: siluetas de tinta sobre papel + rollo2d de la biblioteca)
export { crearRollo, VENTANA } from '../../../../animacion/3d/rollo2d.js';
export const ctx = document.getElementById('c').getContext('2d');
export const U = window.EMAKI.util;
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A', AGUADA = '#D9D2C5';
export const SANS = '900 {S}px Inter, "Noto Sans CJK JP", sans-serif';
export const fuente = (s, peso = 900) => `${peso} ${s}px Inter, "Noto Sans CJK JP", sans-serif`;

export function texto(c, s, x, y, size, { color = TINTA, align = 'center', alfa = 1, peso = 900, halo = 0 } = {}) {
  c.save(); c.globalAlpha = alfa; c.font = fuente(size, peso); c.textAlign = align; c.textBaseline = 'middle';
  if (halo) { c.lineJoin = 'round'; c.lineWidth = halo; c.strokeStyle = PAPEL; c.strokeText(s, x, y); }
  c.fillStyle = color; c.fillText(s, x, y); c.restore();
}
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
export { rr };

// Silueta sin rostro (tinta). pose: 'kihon' (zuki, fase 0..1), 'rei' (saludo, f 0..1), 'pie'.
export function silueta(c, x, base, h, { pose = 'pie', fase = 0, f = 0, color = TINTA, dir = 1 } = {}) {
  const w = h * 0.075;
  c.save(); c.translate(x, base); c.scale(dir, 1); c.strokeStyle = color; c.fillStyle = color; c.lineCap = 'round'; c.lineJoin = 'round';
  const L = (pts, lw) => { c.lineWidth = lw; c.beginPath(); c.moveTo(pts[0][0] * h, pts[0][1] * h); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] * h, pts[i][1] * h); c.stroke(); };
  let cadera = [0, -0.5], hombro = [0, -0.82], cab = [0, -0.93];
  if (pose === 'kihon') { // zenkutsu: piernas abiertas, golpe alterno
    cadera = [0, -0.43]; hombro = [0.02, -0.74]; cab = [0.04, -0.85];
    L([[0.0, -0.43], [0.26, -0.40], [0.30, 0]], w * 1.25);
    L([[0.0, -0.43], [-0.22, -0.30], [-0.30, 0]], w * 1.25);
    const g = Math.sin(fase * Math.PI * 2) > 0 ? 1 : -1; const e = Math.abs(Math.sin(fase * Math.PI * 2));
    L([[hombro[0], hombro[1] + 0.02], [0.12 + 0.28 * e * (g > 0 ? 1 : 0.2), -0.70], [0.14 + 0.45 * e * (g > 0 ? 1 : 0.2), -0.70]], w * 0.9);
    L([[hombro[0], hombro[1] + 0.02], [0.0, -0.62], [0.08 + 0.1 * (1 - e), -0.66]], w * 0.9);
  } else if (pose === 'rei') {
    const a = f * 0.35; // inclinación del tronco
    cadera = [0, -0.5]; hombro = [Math.sin(a) * 0.32, -0.5 - Math.cos(a) * 0.32]; cab = [hombro[0] + Math.sin(a) * 0.12, hombro[1] - Math.cos(a) * 0.12];
    L([[-0.05, -0.5], [-0.06, 0]], w * 1.25); L([[0.05, -0.5], [0.06, 0]], w * 1.25);
    L([[hombro[0], hombro[1] + 0.02], [hombro[0] + 0.01, hombro[1] + 0.20], [hombro[0] + 0.04, -0.46]], w * 0.9);
  } else {
    L([[-0.07, -0.5], [-0.09, 0]], w * 1.25); L([[0.07, -0.5], [0.09, 0]], w * 1.25);
    L([[0, -0.78], [-0.02, -0.6], [-0.05, -0.48]], w * 0.9);
  }
  // tronco con cinturón y cabeza (sin rostro)
  L([cadera, hombro], w * 2.1);
  c.beginPath(); c.arc(cab[0] * h, cab[1] * h, h * 0.062, 0, 7); c.fill();
  c.restore();
}

// Fondo de papel (misma función que las demás piezas)
export const fondo = () => window.EMAKI.fondoPapel(ctx);

// Viñetas del rollo (pintan a pantalla completa; el rollo recorta VENTANA)
export function vinetaShuri(c, t = 0) {
  c.fillStyle = '#EDE5D6'; c.fillRect(0, 300, 1080, 1200);
  // cielo de aguada
  const g = c.createLinearGradient(0, 300, 0, 900); g.addColorStop(0, '#E4DCCB'); g.addColorStop(1, '#EDE5D6'); c.fillStyle = g; c.fillRect(0, 300, 1080, 600);
  // tejado de castillo (estilo ryukyu: aleros curvos)
  c.fillStyle = TINTA;
  c.beginPath(); c.moveTo(120, 760); c.quadraticCurveTo(300, 770, 400, 640); c.lineTo(680, 640); c.quadraticCurveTo(780, 770, 960, 760);
  c.quadraticCurveTo(800, 800, 700, 790); c.lineTo(380, 790); c.quadraticCurveTo(280, 800, 120, 760); c.fill();
  c.fillRect(440, 560, 200, 82); c.beginPath(); c.moveTo(390, 565); c.quadraticCurveTo(480, 560, 540, 470); c.quadraticCurveTo(600, 560, 690, 565); c.quadraticCurveTo(600, 580, 540, 580); c.quadraticCurveTo(480, 580, 390, 565); c.fill();
  c.fillRect(200, 790, 680, 20); for (let i = 0; i < 6; i++) c.fillRect(230 + i * 125, 810, 26, 150);
  c.fillStyle = '#6B5E4A'; c.fillRect(120, 960, 840, 14);   // patio
  // dos filas de siluetas haciendo kihon
  for (let fila = 0; fila < 2; fila++) for (let i = 0; i < 4; i++)
    silueta(c, 230 + i * 210 + fila * 100, 1110 + fila * 150, 250 - fila * 15, { pose: 'kihon', fase: t * 1.3 + i * 0.0 + fila * 0.5, color: fila ? '#4A443C' : TINTA });
}
export function vinetaTokio(c, t = 0) {
  c.fillStyle = '#EDE5D6'; c.fillRect(0, 300, 1080, 1200);
  const g = c.createLinearGradient(0, 300, 0, 900); g.addColorStop(0, '#E0D8C7'); g.addColorStop(1, '#EDE5D6'); c.fillStyle = g; c.fillRect(0, 300, 1080, 600);
  // skyline lejano (aguada) y cercano
  const rng = window.EMAKI.util.rng(7); c.fillStyle = '#B9B1A2';
  for (let x = 40; x < 1040; x += 70) { const hh = 160 + rng() * 260; c.fillRect(x, 960 - hh, 62, hh); }
  c.fillStyle = '#7F776A';
  for (let x = 20; x < 1040; x += 95) { const hh = 90 + rng() * 170; c.fillRect(x, 960 - hh, 88, hh); }
  // dōjō con tejado y linterna
  c.fillStyle = TINTA;
  c.beginPath(); c.moveTo(210, 800); c.quadraticCurveTo(420, 810, 500, 680); c.lineTo(580, 680); c.quadraticCurveTo(660, 810, 870, 800); c.lineTo(840, 830); c.lineTo(240, 830); c.closePath(); c.fill();
  c.fillRect(280, 830, 520, 130); c.fillStyle = '#EDE5D6'; c.fillRect(330, 860, 100, 100); c.fillRect(490, 860, 100, 100); c.fillRect(650, 860, 100, 100);
  c.fillStyle = '#6B5E4A'; c.fillRect(120, 960, 840, 14);
  // linterna (cálida, no roja)
  const bal = Math.sin(t * 3) * 0.04; c.save(); c.translate(900, 800); c.rotate(bal); c.strokeStyle = TINTA; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke();
  c.fillStyle = '#E0A94A'; rr(c, -34, 40, 68, 100, 30); c.fill(); c.fillStyle = TINTA; c.fillRect(-26, 34, 52, 10); c.fillRect(-26, 136, 52, 10); c.restore();
  const hg = c.createRadialGradient(900, 880, 10, 900, 880, 200); hg.addColorStop(0, 'rgba(224,169,74,0.35)'); hg.addColorStop(1, 'rgba(224,169,74,0)'); c.fillStyle = hg; c.fillRect(700, 680, 400, 400);
  // alumnos en fila delante del dōjō
  for (let i = 0; i < 4; i++) silueta(c, 250 + i * 200, 1330, 320, { pose: 'pie' });
}
