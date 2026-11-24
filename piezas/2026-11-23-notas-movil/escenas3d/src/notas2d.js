// KARATE EMAKI · capa 2D «notas» de la pieza notas-movil. DISEÑO PROPIO: marco oscuro genérico (sin muesca, iconos, barra de estado
// ni marca), hoja de cuaderno con renglones y margen. Todo determinista: solo depende de los parámetros (t, p).
// Requiere <script src=".../animacion/marca.js"> antes del módulo.
const TINTA = '#1A1A1A', PAPEL = '#F4EFE6', ROJO = '#C8102E', GRIS = '#8A847A', MARCO_C = '#24211E', HOJA = '#FBF7EE', RENGLON = '#D9D2C5';
const FUENTE = 'Inter, "Noto Sans CJK JP", sans-serif';
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const prog = (t, a, b) => cl((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeIn = (x) => x * x * x;
const easeBack = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

// Caja del marco por defecto (tercio superior; empieza por debajo de los 250 px de interfaz)
export const MARCO = { x: 90, y: 270, w: 900, h: 570 };
export const RENGLON_H = 110;   // alto de cada renglón (texto ≥ 72 px)

// Marco + hoja. o: { caja, alfa, escala, pliegue 0..1 (la lista se pliega sobre el marco), giro (rad), dx, dy }
// Devuelve la caja interior de la hoja { x, y, w, h, margenX } para colocar renglones.
export function marco(ctx, o = {}) {
  const c = o.caja || MARCO, esc = o.escala ?? 1, plie = o.pliegue ?? 0, alfa = o.alfa ?? 1;
  const cx = c.x + c.w / 2 + (o.dx || 0), cy = c.y + c.h / 2 + (o.dy || 0);
  ctx.save(); ctx.globalAlpha = alfa;
  ctx.translate(cx, cy); ctx.rotate(o.giro || 0);
  // plegado: la hoja se aplasta en vertical hacia su centro y el marco la sigue (sobre sí mismo)
  const sy = 1 - 0.9 * easeIn(plie), sx = 1 - 0.35 * easeIn(plie);
  ctx.scale(esc * sx, esc * sy);
  const w = c.w, h = c.h, x = -w / 2, y = -h / 2;
  ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
  ctx.fillStyle = MARCO_C; ctx.beginPath(); ctx.roundRect(x, y, w, h, 64); ctx.fill();
  ctx.shadowColor = 'transparent';
  const m = 26, hx = x + m, hy = y + m, hw = w - 2 * m, hh = h - 2 * m;
  ctx.fillStyle = HOJA; ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 40); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 40); ctx.clip();
  ctx.strokeStyle = RENGLON; ctx.lineWidth = 3;
  for (let ry = hy + 150; ry < hy + hh; ry += RENGLON_H) { ctx.beginPath(); ctx.moveTo(hx, ry); ctx.lineTo(hx + hw, ry); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(200,16,46,0.28)'; ctx.lineWidth = 3;               // margen rojo suave, como un cuaderno
  ctx.beginPath(); ctx.moveTo(hx + 96, hy); ctx.lineTo(hx + 96, hy + hh); ctx.stroke();
  ctx.restore();
  ctx.restore();
  return { x: c.x + m + (o.dx || 0), y: c.y + m + (o.dy || 0), w: c.w - 2 * m, h: c.h - 2 * m, margenX: 96 + 24, cx, cy };
}

// Texto escrito letra a letra con cursor. hoja = devuelto por marco(). o: { y (renglón base en px de la hoja), size 72, p 0..1, color, cursor 0..1 (alfa), t (parpadeo), x, peso, alfa }
export function escribir(ctx, hoja, texto, o = {}) {
  const size = o.size || 72, p = cl(o.p ?? 1), n = Math.round(texto.length * p), parcial = texto.slice(0, n);
  const x = hoja.x + (o.x ?? hoja.margenX), y = hoja.y + (o.y ?? 150);
  ctx.save(); ctx.globalAlpha = o.alfa ?? 1; ctx.font = `800 ${size}px ${FUENTE}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = o.color || TINTA; ctx.fillText(parcial, x, y);
  const cur = o.cursor ?? 0;
  if (cur > 0) {
    const on = Math.floor((o.t ?? 0) * 2.4) % 2 === 0 || (p < 1 && p > 0);
    if (on) { const wx = x + ctx.measureText(parcial).width + 8; ctx.fillStyle = TINTA; ctx.globalAlpha = (o.alfa ?? 1) * cur; ctx.fillRect(wx, y - size * 0.82, 7, size * 0.95); }
  }
  ctx.restore();
}
// Varias líneas de título. lineas: array; p reparte el avance entre todas las letras.
export function escribirLineas(ctx, hoja, lineas, o = {}) {
  const total = lineas.join('').length; let gastado = 0;
  const paso = o.paso || 100, y0 = o.y ?? 140;
  lineas.forEach((l, i) => {
    const pi = cl((cl(o.p ?? 1) * total - gastado) / l.length); gastado += l.length;
    const ultima = pi < 1 || i === lineas.length - 1;
    escribir(ctx, hoja, l, { ...o, y: y0 + i * paso, p: pi, cursor: (o.cursor ?? 0) * (pi > 0 && ultima && (pi < 1 || i === lineas.length - 1) ? 1 : 0) * (cl(o.p ?? 1) < 1 || o.cursorFinal ? 1 : 0) });
  });
}

// Visto rojo grande que cae sobre la hoja. p 0 → 1 (cae con rebote y se traza). o: { caja (hoja), grosor }
export function visto(ctx, hoja, p, o = {}) {
  if (p <= 0) return;
  const s = o.size || 360, cx = hoja.x + hoja.w * 0.5 + (o.dx || 0), cy = hoja.y + hoja.h * 0.5 + (o.dy || 0);
  const caida = easeBack(prog(p, 0, 0.5)), traz = prog(p, 0, 0.45);
  const pts = [[-0.5, 0.0], [-0.18, 0.4], [0.55, -0.5]];
  ctx.save(); ctx.translate(cx, cy - (1 - caida) * 260); ctx.rotate(-0.08);
  ctx.globalAlpha = cl(p * 6); ctx.strokeStyle = ROJO; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = o.grosor || 58;
  const L1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), L2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]), tot = L1 + L2;
  const d = traz * tot; ctx.beginPath(); ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
  if (d <= L1) { const f = d / L1; ctx.lineTo((pts[0][0] + (pts[1][0] - pts[0][0]) * f) * s, (pts[0][1] + (pts[1][1] - pts[0][1]) * f) * s); }
  else { ctx.lineTo(pts[1][0] * s, pts[1][1] * s); const f = (d - L1) / L2; ctx.lineTo((pts[1][0] + (pts[2][0] - pts[1][0]) * f) * s, (pts[1][1] + (pts[2][1] - pts[1][1]) * f) * s); }
  ctx.stroke(); ctx.restore();
}

// Bocadillo de cómic con pop y rebote. o: { x, y (centro), p 0..1 (entrada), size 84, cola: 'izq'|'der'|'abajo', color, quiebre 0..1 (el texto se rompe en una rayita), alfa, giro }
export function bocadillo(ctx, texto, o = {}) {
  const p = cl(o.p ?? 1); if (p <= 0) return;
  const size = Math.max(72, o.size || 84), esc = easeBack(p) * (o.escala ?? 1), q = cl(o.quiebre ?? 0);
  ctx.save(); ctx.globalAlpha = (o.alfa ?? 1) * cl(p * 5); ctx.translate(o.x ?? 540, o.y ?? 700); ctx.rotate(o.giro || 0); ctx.scale(esc, esc);
  ctx.font = `900 ${size}px ${FUENTE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let mostrado = texto;
  if (q > 0) { const k = Math.max(1, Math.round(texto.length * (1 - 0.35 * q))); mostrado = texto.slice(0, k); }
  const tw = ctx.measureText(texto).width, w = tw + 90, h = size * 1.7, x = -w / 2, y = -h / 2;
  const dir = o.cola === 'izq' ? -1 : o.cola === 'abajo' ? 0 : 1;
  ctx.fillStyle = PAPEL; ctx.strokeStyle = TINTA; ctx.lineWidth = 9; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill(); ctx.stroke();
  // cola
  ctx.beginPath();
  if (dir === 0) { ctx.moveTo(-34, h / 2 - 6); ctx.lineTo(0, h / 2 + 62); ctx.lineTo(34, h / 2 - 6); }
  else { ctx.moveTo(dir * (w / 2 - 110), h / 2 - 6); ctx.lineTo(dir * (w / 2 - 40), h / 2 + 64); ctx.lineTo(dir * (w / 2 - 190), h / 2 - 6); }
  ctx.fillStyle = PAPEL; ctx.fill(); ctx.stroke();
  ctx.fillStyle = PAPEL; ctx.fillRect(dir === 0 ? -30 : dir * (w / 2 - 186) - (dir > 0 ? 0 : 0), h / 2 - 12, 1, 1);
  ctx.fillStyle = TINTA; ctx.textAlign = q > 0 ? 'left' : 'center';
  if (q > 0) { const wm = ctx.measureText(mostrado).width; ctx.fillText(mostrado, -tw / 2, 4); ctx.lineWidth = 12; ctx.strokeStyle = TINTA; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-tw / 2 + wm + 14, 10); ctx.lineTo(-tw / 2 + wm + 14 + 60 * q, 10); ctx.stroke(); }
  else ctx.fillText(mostrado, 0, 4);
  ctx.restore();
}
export const COLOR = { TINTA, PAPEL, ROJO, GRIS };
