// Utilidades del reel de embusen (2D cenital). Posiciones esquemáticas = las del interactivo (sumando giros, cada paso = 1 unidad).
export const ctx = document.getElementById('c').getContext('2d');
export const U = window.EMAKI.util;
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', MADERA = '#D9C39B';
export const fuente = (s, peso = 900) => `${peso} ${s}px Inter, "Noto Sans CJK JP", sans-serif`;

// Pasos 1-17 (dosier): giro en grados (- = izquierda), mov 1/0, lado L/R
const G = [[-90,1,'L'],[0,1,'R'],[180,1,'R'],[0,0,'R'],[0,1,'L'],[-90,1,'L'],[0,1,'R'],[0,1,'L'],[0,1,'R'],
  [-270,1,'L'],[0,1,'R'],[180,1,'R'],[0,1,'L'],[-90,1,'L'],[0,1,'R'],[0,1,'L'],[0,1,'R']];
export const NOMBRES = ['Hachiji-dachi','Gedan-barai','Oi-zuki','Gedan-barai','Kentsui','Oi-zuki','Gedan-barai','Age-uke','Age-uke','Age-uke','Gedan-barai','Oi-zuki','Gedan-barai','Oi-zuki','Gedan-barai','Oi-zuki','Oi-zuki','Oi-zuki'];
// Coordenadas p:[x,y] de cada paso 1-17 copiadas del interactivo (x este, y norte; x*1,25 = ancho de travesaño, y = pasos del eje). 18-21 no se dibujan.
const PXY = [[0,0],[-1,0],[0,0],[0,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,3],[1,3],[0,3],[-1,3],[0,3],[0,2],[0,1],[0,0]];
export function ruta(u, ox, oy) {
  const off = u * 0.145, P = [{ x: ox, y: oy, a: 0, bx: ox, by: oy, lado: '', u }]; let a = 0;
  G.forEach(([g, m, l], i) => { a += g; const r = a * Math.PI / 180, x = ox + PXY[i][0] * 1.25 * u, y = oy - PXY[i][1] * u;
    P.push({ x: x + off * Math.cos(r), y: y + off * Math.sin(r), a, bx: x, by: y, lado: l, mov: m, u }); });
  return P;
}
export const MAPA = ruta(200, 540, 1300);

export function suelo(c) {
  c.fillStyle = MADERA; c.fillRect(0, 0, 1080, 1920);
  const r = U.rng(7);
  for (let i = 0; i < 12; i++) { const x = i * 90; c.fillStyle = i % 2 ? 'rgba(120,90,50,0.05)' : 'rgba(255,255,255,0.05)'; c.fillRect(x, 0, 90, 1920);
    c.fillStyle = 'rgba(90,65,35,0.35)'; c.fillRect(x, 0, 3, 1920);
    for (let k = 0; k < 7; k++) { const y = r() * 1900; c.fillStyle = 'rgba(90,65,35,0.18)'; c.fillRect(x + 8 + r() * 60, y, 2, 40 + r() * 120); }
    for (let k = 0; k < 4; k++) { const y = (r() * 1900) | 0; c.fillStyle = 'rgba(90,65,35,0.3)'; c.fillRect(x, y, 90, 3); } }
  const g = c.createRadialGradient(540, 960, 400, 540, 960, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,25,10,0.28)');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
}
export function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
export function texto(c, s, x, y, size, { color = TINTA, alfa = 1, align = 'center', halo = 0 } = {}) {
  c.save(); c.globalAlpha = alfa; c.font = fuente(size); c.textAlign = align; c.textBaseline = 'middle';
  if (halo) { c.lineJoin = 'round'; c.lineWidth = halo; c.strokeStyle = PAPEL; c.strokeText(s, x, y); }
  c.fillStyle = color; c.fillText(s, x, y); c.restore();
}
// Tarjeta de papel con texto (≥48 px, encoge a lo ancho si no cabe)
export function tarjeta(c, s, y, size = 72, alfa = 1, desliz = 0) {
  c.save(); c.globalAlpha = alfa; c.font = fuente(size);
  let w = c.measureText(s).width + 90; if (w > 960) { size = Math.max(48, size * 940 / w); c.font = fuente(size); w = Math.min(960, c.measureText(s).width + 90); }
  const h = size + 64, yy = y + desliz;
  c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, 540 - w / 2 + 6, yy - h / 2 + 10, w, h, 22); c.fill();
  c.fillStyle = PAPEL; rr(c, 540 - w / 2, yy - h / 2, w, h, 22); c.fill(); c.lineWidth = 5; c.strokeStyle = TINTA; c.stroke();
  c.fillStyle = TINTA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 540, yy + 2); c.restore();
}
export const aparece = (t, t0, d = 0.25) => ({ alfa: U.clamp(U.prog(t, t0, t0 + d)), desliz: (1 - U.easeInOut(U.prog(t, t0, t0 + d))) * 30 });

// Huellas (dos pies, rojo) del paso n
export function huellas(c, P, n, { alfa = 1, k = 1, sello = 1 } = {}) {
  const p = P[n], u = p.u, s = u / 62 * k;
  c.save(); c.translate(p.x, p.y); c.rotate(p.a * Math.PI / 180); c.scale(sello, sello); c.globalAlpha = alfa;
  const f = n === 0 ? [[-11, 2], [11, 2]] : (p.lado === 'L' ? [[-9, -10], [9, 13]] : [[9, -10], [-9, 13]]);
  f.forEach(([x, y]) => { c.beginPath(); c.ellipse(x * s, y * s, 15 * k * (u / 170), 33 * k * (u / 170), 0, 0, 7);
    c.fillStyle = n === 0 ? 'rgba(26,26,26,0.55)' : ROJO; c.fill(); c.lineWidth = 3; c.strokeStyle = PAPEL; c.stroke(); });
  c.restore();
}
// Trazo continuo rojo de P[0] a P[hasta] (hasta fraccionario)
export function trazo(c, P, hasta, { w = 16, alfa = 1 } = {}) {
  if (hasta <= 0) return; c.save(); c.globalAlpha = alfa; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = ROJO; c.lineWidth = w;
  c.beginPath(); c.moveTo(P[0].x, P[0].y); const n = Math.floor(hasta);
  for (let i = 1; i <= n; i++) c.lineTo(P[i].x, P[i].y);
  if (n < 17 && hasta > n) { const f = hasta - n; c.lineTo(P[n].x + (P[n + 1].x - P[n].x) * f, P[n].y + (P[n + 1].y - P[n].y) * f); }
  c.stroke(); c.restore();
}
export function posAnim(P, hasta) { const n = Math.min(17, Math.floor(hasta)), f = n >= 17 ? 0 : hasta - n; const a = P[n], b = P[Math.min(17, n + 1)];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, a: a.a + (b.a - a.a) * f }; }
// Karateka visto desde arriba (silueta de tinta sin rostro): hombros, cabeza, brazos. rei 0..1 = saludo (cabeza adelante, hombros se estrechan)
export function karatekaArriba(c, x, y, ang, esc = 1, { rei = 0, golpe = 0, alfa = 1 } = {}) {
  c.save(); c.globalAlpha = alfa; c.translate(x, y); c.rotate(ang * Math.PI / 180); c.scale(esc, esc);
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(8, 10, 62, 32, 0, 0, 7); c.fill();
  c.strokeStyle = TINTA; c.fillStyle = TINTA; c.lineCap = 'round';
  c.lineWidth = 22; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-48, -34 - 40 * golpe * 0); c.moveTo(40, 0); c.lineTo(46 + 0, -60 - 70 * golpe); c.stroke(); // brazos
  c.beginPath(); c.ellipse(0, 0 - 10 * rei, 56 - 8 * rei, 26, 0, 0, 7); c.fill(); // hombros/torso
  c.fillStyle = PAPEL; c.fillRect(-56, 6, 112, 7); c.fillStyle = TINTA; // cinturón (franja)
  c.beginPath(); c.arc(0, -4 - 50 * rei, 21, 0, 7); c.fill(); // cabeza
  c.restore();
}
export function kiai(c, x, y, p, { lado = 1 } = {}) {
  if (p <= 0 || p >= 1) return; const e = U.easeOut ? U.easeOut(p) : 1 - (1 - p) * (1 - p); c.save(); c.translate(x, y); c.globalAlpha = 1 - p * p;
  c.strokeStyle = ROJO; c.lineWidth = 14 * (1 - p) + 3; c.beginPath(); c.arc(0, 0, 40 + 170 * e, 0, 7); c.stroke();
  c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * (70 + 120 * e), Math.sin(a) * (70 + 120 * e)); c.lineTo(Math.cos(a) * (110 + 190 * e), Math.sin(a) * (110 + 190 * e)); c.stroke(); }
  c.restore();
}
export function marcaKiai(c, P, n, alfa = 1, dx = 0, dy = -85) { const p = P[n]; c.save(); c.globalAlpha = alfa; c.strokeStyle = ROJO; c.lineWidth = 8; c.beginPath(); c.arc(p.x, p.y, 62, 0, 7); c.stroke(); c.restore();
  texto(c, 'kiai', p.x + dx, p.y + dy, 52, { color: ROJO, alfa, halo: 12 }); }
export function interrogante(c, P, alfa = 1) { const p = P[17]; c.save(); c.globalAlpha = alfa; c.strokeStyle = TINTA; c.lineWidth = 8; c.setLineDash([4, 18]); c.lineCap = 'round'; c.beginPath(); c.arc(p.x, p.y, 120, 0, 7); c.stroke(); c.restore();
  texto(c, '?', p.x + 130, p.y + 105, 110, { color: TINTA, alfa, halo: 14 }); }
export function rotulo(c, s, y, alfa = 1) { // rótulo pequeño sobre madera (≥48)
  c.save(); c.globalAlpha = alfa; c.font = fuente(52); const w = c.measureText(s).width + 56; c.fillStyle = 'rgba(244,239,230,0.92)'; rr(c, 540 - w / 2, y - 48, w, 96, 20); c.fill();
  c.fillStyle = TINTA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 540, y + 2); c.restore(); }
