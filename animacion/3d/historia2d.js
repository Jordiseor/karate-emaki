// KARATE EMAKI · capa 2D para las piezas de historia en 3D: kanji «a trazos», pergamino «Cuentan que…»,
// resplandor de fuego desde los bordes y pavesas. Todo determinista (solo depende de t / prog).
// Funciona sobre cualquier contexto 2D: el lienzo del vídeo (overlay) o el lienzo de una textura 3D.
// No necesita THREE. Si marca.js está cargado usa sus fuentes y colores.

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', CENIZA = '#8A847A';
export const FUENTE_KANJI = '"Noto Serif CJK JP", "IPAGothic", serif';
const fuenteTitulo = () => (typeof window !== 'undefined' && window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, "Noto Sans CJK JP", sans-serif');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const hash = (i, s = 0) => { let h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((s | 0) + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2d); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
// ruido de valor 2D suave (determinista)
function ruido(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash(a * 374761 + b * 668265, 17);
  return (h(xi, yi) * (1 - sx) + h(xi + 1, yi) * sx) * (1 - sy) + (h(xi, yi + 1) * (1 - sx) + h(xi + 1, yi + 1) * sx) * sy;
}
export const fbm = (x, y) => ruido(x, y) * 0.55 + ruido(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + ruido(x * 4.3 + 9.1, y * 4.3 + 7.7) * 0.15;
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

// ---------------- kanji a trazos ----------------
// Orden de trazado aproximado por zonas (izquierda → derecha, arriba → abajo) y, dentro de cada zona, barridos
// horizontales de pincel de arriba abajo: se ve «escrito», no un fundido. Zonas por carácter (fracciones del glifo).
const ZONAS = {
  '松': [[0, 0, 0.42, 1], [0.38, 0, 1, 1]],          // 木 | 公
  '濤': [[0, 0, 0.3, 1], [0.27, 0, 1, 1]],           // 氵 | 壽
  '館': [[0, 0, 0.42, 1], [0.38, 0, 1, 1]],          // 食 | 官
  '空': [[0, 0, 1, 0.55], [0, 0.5, 1, 1]],           // 穴 / 工
  '手': [[0, 0, 1, 1]], '道': [[0.3, 0, 1, 1], [0, 0, 0.35, 1]], '場': [[0, 0, 0.35, 1], [0.32, 0, 1, 1]]
};
const cacheGlifo = new Map();
function glifo(ch, size, color, sangrado) {
  const key = ch + '|' + size + '|' + color + '|' + sangrado;
  let g = cacheGlifo.get(key);
  if (g) return g;
  g = lienzo(size * 1.3, size * 1.3); const x = g.getContext('2d');
  x.font = `900 ${size}px ${FUENTE_KANJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color;
  x.shadowColor = color; x.shadowBlur = sangrado == null ? size * 0.012 : sangrado;
  x.fillText(ch, g.width / 2, g.height / 2 + size * 0.04);
  // textura de pincel seco: vetas claras deterministas
  x.globalCompositeOperation = 'destination-out'; const r = rng(ch.charCodeAt(0) * 7 + 3);
  for (let k = 0; k < 110; k++) { x.globalAlpha = 0.06 + r() * 0.12; x.fillRect(r() * g.width, r() * g.height, 2 + r() * size * 0.14, 1 + r() * 2); }
  cacheGlifo.set(key, g); return g;
}
let _masc = null;
function trazar(ctx, ch, cx, cy, size, p, o) {
  const g = glifo(ch, size, o.color, o.sangrado);
  const x0 = cx - g.width / 2, y0 = cy - g.height / 2;
  if (p >= 1) { ctx.drawImage(g, x0, y0); return; }
  if (p <= 0) return;
  const m = _masc && _masc.width >= g.width ? _masc : (_masc = lienzo(g.width, g.height));
  const mx = m.getContext('2d'); mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, m.width, m.height);
  // pincel: barridos por zonas
  const pad = (g.width - size) / 2, zonas = ZONAS[ch] || [[0, 0, 1, 1]], filas = o.filas || 6;
  const barridos = [];
  for (const [a, b, c, d] of zonas) {
    const n = Math.max(2, Math.round(filas * (d - b))), h = (d - b) * size / n;
    for (let i = 0; i < n; i++) barridos.push({ xa: pad + a * size, xb: pad + c * size, y: pad + b * size + (i + 0.5) * h, h: h * 1.5 });
  }
  const total = barridos.reduce((s, q) => s + (q.xb - q.xa), 0);
  let resto = easeInOut(p) * total * 1.04;
  mx.fillStyle = '#000'; mx.strokeStyle = '#000'; mx.lineCap = 'round';
  for (const q of barridos) {
    if (resto <= 0) break;
    const L = q.xb - q.xa, f = Math.min(1, resto / L); resto -= L;
    mx.lineWidth = q.h; mx.beginPath(); mx.moveTo(q.xa, q.y); mx.lineTo(q.xa + L * f, q.y); mx.stroke();
  }
  mx.globalCompositeOperation = 'source-in'; mx.drawImage(g, 0, 0);
  ctx.drawImage(m, 0, 0, g.width, g.height, x0, y0, g.width, g.height);
}
// Kanji grandes a trazos. prog 0..1 recorre todos los caracteres en orden.
// o: { prog: 1, vertical: false, color: ROJO, separacion: size*1.02, alpha: 1, halo: false|0..1 (halo de papel), sangrado, filas: 6 }
export function kanji(ctx, texto, x, y, size, o = {}) {
  const chars = [...texto], n = chars.length, prog = o.prog == null ? 1 : o.prog, paso = o.separacion || size * 1.02;
  o = Object.assign({ color: ROJO }, o);
  ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
  chars.forEach((ch, i) => {
    const pi = clamp(prog * n - i); if (pi <= 0) return;
    const cx = o.vertical ? x : x + (i - (n - 1) / 2) * paso, cy = o.vertical ? y + (i - (n - 1) / 2) * paso : y;
    if (o.halo) { const h = glifoHalo(ch, size); ctx.save(); ctx.globalAlpha *= clamp(pi * 1.5) * (o.halo === true ? 0.9 : o.halo); ctx.drawImage(h, cx - h.width / 2, cy - h.height / 2); ctx.restore(); }
    trazar(ctx, ch, cx, cy, size, pi, o);
  });
  ctx.restore();
}
function glifoHalo(ch, size) {
  const key = 'halo|' + ch + '|' + size; let h = cacheGlifo.get(key); if (h) return h;
  h = lienzo(size * 1.3, size * 1.3); const x = h.getContext('2d');
  x.font = `900 ${size}px ${FUENTE_KANJI}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = PAPEL; x.strokeStyle = PAPEL;
  x.lineWidth = size * 0.07; x.lineJoin = 'round'; x.shadowColor = PAPEL; x.shadowBlur = size * 0.08;
  for (let k = 0; k < 3; k++) { x.strokeText(ch, h.width / 2, h.height / 2 + size * 0.04); x.fillText(ch, h.width / 2, h.height / 2 + size * 0.04); }
  cacheGlifo.set(key, h); return h;
}
// Kanji que entra de golpe (escena 4: 館 con un golpe): escala con rebote + temblor corto. p 0..1 (≈0,35 s)
export function kanjiGolpe(ctx, texto, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const s = 1.6 - 0.6 * easeBack(clamp(p * 1.4)), sacude = (1 - clamp(p * 2)) * size * 0.03 * Math.sin(p * 60);
  ctx.save(); ctx.translate(x + sacude, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 4);
  kanji(ctx, texto, 0, 0, size, Object.assign({}, o, { prog: 1 })); ctx.restore();
}

// ---------------- pergamino «Cuentan que…» ----------------
// Marco de pergamino horizontal (papel con dos varillas de madera) que se desenrolla. Texto en tinta, ≥ 48 px.
// o: { texto: 'Cuentan que…', t0: 0, t1: 0.5 (desenrollado), y: 290 (borde superior, dentro de la zona segura), size: 64, x: 540, alpha }
export function pergamino(ctx, t, o = {}) {
  o = Object.assign({ texto: 'Cuentan que…', t0: 0, t1: 0.5, y: 290, size: 64, x: 540 }, o);
  const size = Math.max(48, o.size), p = o.t1 > o.t0 ? clamp((t - o.t0) / (o.t1 - o.t0)) : 1;
  if (p <= 0) return;
  const e = easeInOut(p);
  ctx.save(); ctx.font = `italic 800 ${size}px ${fuenteTitulo()}`;
  const tw = ctx.measureText(o.texto).width, ancho = tw + size * 1.6, alto = size * 1.75;
  const w = Math.max(size * 0.5, ancho * e), x0 = o.x - w / 2, y0 = Math.max(250, o.y);
  ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha) * clamp(p * 5);
  // sombra suave
  ctx.fillStyle = 'rgba(40,25,10,0.22)'; ctx.filter = 'blur(10px)'; ctx.fillRect(x0 + 6, y0 + 12, w, alto); ctx.filter = 'none';
  // papel con borde de aguada
  const g = ctx.createLinearGradient(0, y0, 0, y0 + alto); g.addColorStop(0, '#F7F1E4'); g.addColorStop(1, '#EDE3CF');
  ctx.fillStyle = g; ctx.fillRect(x0, y0, w, alto);
  ctx.strokeStyle = 'rgba(138,132,122,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(x0 + 10, y0 + 10, w - 20, alto - 20);
  // texto (recortado a lo desenrollado)
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 8, y0, w - 16, alto); ctx.clip();
  ctx.fillStyle = TINTA; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.texto, o.x, y0 + alto / 2 + size * 0.04); ctx.restore();
  // varillas
  for (const xv of [x0, x0 + w]) {
    const gv = ctx.createLinearGradient(xv - 14, 0, xv + 14, 0); gv.addColorStop(0, '#4A2E1C'); gv.addColorStop(0.45, '#8A5A38'); gv.addColorStop(1, '#3A2416');
    ctx.fillStyle = gv; ctx.beginPath(); ctx.roundRect(xv - 14, y0 - 18, 28, alto + 36, 12); ctx.fill();
    ctx.fillStyle = '#2A1A10'; for (const yy of [y0 - 22, y0 + alto + 14]) { ctx.beginPath(); ctx.roundRect(xv - 18, yy, 36, 10, 5); ctx.fill(); }
  }
  ctx.restore();
  return { x: x0, y: y0, w, h: alto };
}

// ---------------- resplandor de fuego (desde los bordes) ----------------
// Mancha roja sobria que crece desde los bordes del encuadre y cubre el centro con p = 1. Sin llamas realistas.
// o: { color: ROJO, oscuro: '#5E0716', alfa: 0.92, centro: [540, 1000] (lo último que se cubre), borde: true (filo luminoso) }
let _fuego = null;
export function resplandor(ctx, p, t = 0, o = {}) {
  if (p <= 0) return;
  o = Object.assign({ color: ROJO, oscuro: '#5E0716', alfa: 0.92, centro: [540, 1000], borde: true }, o);
  const w = 108, h = 192, W = 1080, H = 1920;
  if (!_fuego) { _fuego = { c: lienzo(w, h) }; _fuego.x = _fuego.c.getContext('2d'); _fuego.im = _fuego.x.createImageData(w, h); }
  const d = _fuego.im.data, cR = hex(o.color), cO = hex(o.oscuro), cB = [255, 120, 70];
  const cx = o.centro[0] / W * 2 - 1, cy = o.centro[1] / H * 2 - 1;
  const umbral = Math.sqrt(Math.max(0, 1 - p)) * 1.04 - 0.22 * p;   // área cubierta ≈ p
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let u = (i + 0.5) / w * 2 - 1, v = (j + 0.5) / h * 2 - 1;
    u = (u - cx) / (1 + Math.sign(u - cx) * cx); v = (v - cy) / (1 + Math.sign(v - cy) * cy);
    const s = Math.pow(Math.pow(Math.abs(u), 4) + Math.pow(Math.abs(v), 4), 0.25);   // 0 centro … 1 borde
    const n = fbm(i * 0.07 + t * 0.35, j * 0.07 - t * 0.6) - 0.5;
    const q = s + n * 0.32 - umbral;                       // > 0 cubierto
    const a = sstep(-0.03, 0.05, q);
    const prof = sstep(0, 0.45, q);                        // hacia el borde, más oscuro
    const filo = o.borde ? Math.exp(-((q - 0.03) ** 2) / 0.0012) * 0.55 : 0;
    const k = (j * w + i) * 4;
    for (let c = 0; c < 3; c++) d[k + c] = Math.round((cR[c] * (1 - prof) + cO[c] * prof) * (1 - filo) + cB[c] * filo);
    d[k + 3] = Math.round(255 * a * o.alfa);
  }
  _fuego.x.putImageData(_fuego.im, 0, 0);
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.filter = 'blur(6px)';
  ctx.drawImage(_fuego.c, -20, -20, W + 40, H + 40); ctx.restore();
}
function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }

// ---------------- pavesas ----------------
// Chispas que suben (o ceniza que cae con color CENIZA y sube:false). o: { n: 40, intensidad: 1, color: '#FF7A3A', sube: true, tam: 1, zona: [0,0,1080,1920] }
const _chispa = new Map();
export function pavesas(ctx, t, o = {}) {
  o = Object.assign({ n: 40, intensidad: 1, color: '#FF7A3A', sube: true, tam: 1, zona: [0, 0, 1080, 1920], semilla: 3 }, o);
  if (o.intensidad <= 0) return;
  let spr = _chispa.get(o.color);
  if (!spr) { spr = lienzo(32, 32); const x = spr.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#FFF3D8'); g.addColorStop(0.25, o.color); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); _chispa.set(o.color, spr); }
  const [zx, zy, zw, zh] = o.zona;
  ctx.save(); ctx.globalCompositeOperation = o.sube ? 'lighter' : 'source-over';
  for (let i = 0; i < o.n; i++) {
    const a = hash(i, o.semilla), b = hash(i, o.semilla + 1), c = hash(i, o.semilla + 2);
    const vel = (0.08 + 0.14 * b) * zh, ciclo = zh * 1.15, rec = (t * vel + c * ciclo) % ciclo;
    const y = o.sube ? zy + zh * 1.05 - rec : zy - zh * 0.05 + rec;
    const x = zx + a * zw + Math.sin(t * (0.8 + b) + i) * 30 + Math.sin(t * 2.3 + i * 1.7) * 8;
    const vida = rec / ciclo, alfa = sstep(0, 0.1, vida) * (1 - sstep(0.6, 1, vida)) * (0.55 + 0.45 * Math.sin(t * 9 + i * 3)) * o.intensidad;
    const s = (6 + 10 * c) * o.tam;
    ctx.globalAlpha = clamp(alfa); ctx.drawImage(spr, x - s, y - s, s * 2, s * 2);
  }
  ctx.restore();
}

// Velo de color sobre todo el encuadre (p. ej. oscurecer para la noche o volver al papel). o: { color, alfa }
export function velo(ctx, color, alfa) { if (alfa <= 0) return; ctx.save(); ctx.globalAlpha = clamp(alfa); ctx.fillStyle = color; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }

export const historia2d = { kanji, kanjiGolpe, pergamino, resplandor, pavesas, velo, ROJO, TINTA, PAPEL, CENIZA, FUENTE_KANJI };
export default historia2d;
