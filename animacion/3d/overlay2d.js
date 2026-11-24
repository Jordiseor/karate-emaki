// KARATE EMAKI · capa 2D de texto sobre las escenas 3D (títulos, tarjetas, cifras, letra pequeña).
// Usa la tipografía y colores de animacion/marca.js (cárgalo antes con <script src="../marca.js">).
// Reglas de marca que aplica solo: tamaño mínimo 48 px, zona segura 250 px arriba / 350 px abajo, márgenes 70 px.
// [r]texto[/r] dentro de una línea = rojo de marca.
const E = () => {
  if (!window.EMAKI || !window.EMAKI.texto) throw new Error('overlay2d: falta <script src=".../animacion/marca.js"> antes del módulo');
  return window.EMAKI;
};
const PAPEL = 'rgba(244,239,230,0.95)';
export const ZONA = { arriba: 250, abajo: 1920 - 350, izq: 70, der: 1080 - 70, ancho: 1080, alto: 1920 };
const tamMin = (s) => Math.max(48, s || 0);
const altoBloque = (n, s, inter = 1.18) => s * 0.82 + (n - 1) * s * inter + s * 0.22;

// Coloca un bloque de texto respetando la zona segura. o.y = borde superior deseado; o.abajo = true → se apoya en el borde inferior seguro.
function colocar(o) {
  const lineas = Array.isArray(o.lineas) ? o.lineas : [o.lineas], s = tamMin(o.size);
  const alto = altoBloque(lineas.length, s, o.interlinea);
  let y = o.abajo ? ZONA.abajo - alto - (o.margen ?? 10) : (o.y ?? ZONA.arriba + 40);
  y = Math.max(ZONA.arriba, Math.min(ZONA.abajo - alto, y));
  return Object.assign({}, o, { lineas, size: s, y, sombra: o.sombra === false ? null : (o.sombra || PAPEL) });
}

export const overlay = {
  ZONA,
  // Texto fijo. o: { lineas: 'texto' | ['línea 1', 'línea 2'], size: 84, y, abajo, color, peso: 900, x, align, alpha, sombra }
  texto(ctx, o) { return E().texto(ctx, colocar(o)); },
  // Título arriba (entra con fundido + subida). o: { lineas, t0, t1, size: 96, y }
  titulo(ctx, t, o) { return E().tarjeta(ctx, t, colocar(Object.assign({ size: 96 }, o))); },
  // Tarjeta animada en cualquier altura. o: { lineas, t0, t1, size: 84, y | abajo }
  tarjeta(ctx, t, o) { return E().tarjeta(ctx, t, colocar(Object.assign({ size: 84 }, o))); },
  // Cifra grande en rojo (p. ej. '26°') centrada en (x, y) de la pantalla. o: { size: 120, alpha, color }
  cifra(ctx, x, y, texto, o = {}) {
    const s = tamMin(o.size || 120);
    const yy = Math.max(ZONA.arriba, Math.min(ZONA.abajo - s, y - s * 0.42));
    return E().texto(ctx, { lineas: texto, size: s, x, y: yy, color: o.color || E().marca.color.rojo, alpha: o.alpha ?? 1, sombra: o.sombra || PAPEL });
  },
  // Letra pequeña (aviso, «Modelo simplificado…»): 48 px, peso 500, gris tinta, apoyada en el borde inferior seguro.
  letraPequena(ctx, texto, o = {}) {
    return E().texto(ctx, colocar(Object.assign({ lineas: texto, size: 48, peso: 500, color: '#3A3631', abajo: true }, o)));
  },
  // Guía de zona segura (solo para revisar): franjas rojas translúcidas.
  zona(ctx) { E().dibujarZona(ctx); }
};

// ---------- pictogramas 2D (tinta sobre papel; rojo SOLO en las flechas) ----------
const _TINTA = '#1A1A1A', _GRIS = '#8A847A', _ROJO = '#C8102E';
const _flecha = (c, x, y, dir, L, w, color) => { // flecha vertical dir = −1 (arriba) | 1 (abajo)
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + dir * L); c.stroke();
  const p = y + dir * L; c.beginPath(); c.moveTo(x, p + dir * w * 1.2); c.lineTo(x - w * 2, p - dir * w * 0.8); c.lineTo(x + w * 2, p - dir * w * 0.8); c.closePath(); c.fill();
};
// Ascensor: cabina de frente con puertas y dos flechas rojas (↑ y ↓) a su lado. (x, y) = centro de la cabina.
// o: { size: 360 (alto de la cabina), alfa: 1, puertas: 0..1 (abiertas), flechas: 0..1 (aparición), mover: −1…1 (flechas hacia un lado: 0 = ↑↓ fijas) }
overlay.ascensor = (ctx, x, y, o = {}) => {
  const h = o.size ?? 360, w = h * 0.62, lw = Math.max(5, h * 0.025), ab = o.puertas ?? 0, fl = o.flechas ?? 1;
  ctx.save(); ctx.globalAlpha = o.alfa ?? 1; ctx.translate(x, y);
  ctx.fillStyle = '#F4EFE6'; ctx.strokeStyle = _TINTA; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();
  const pw = w / 2 - lw, hueco = pw * ab; // puertas correderas
  ctx.fillStyle = '#E3DACB';
  for (const s of [-1, 1]) { const x0 = s < 0 ? -w / 2 + lw / 2 - hueco : lw / 2 + hueco; ctx.beginPath(); ctx.rect(Math.max(-w / 2 + lw / 2, Math.min(w / 2 - lw / 2 - pw, x0)), -h / 2 + h * 0.14, pw, h * 0.84 - lw / 2); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + h * 0.14); ctx.lineTo(w / 2, -h / 2 + h * 0.14); ctx.stroke(); // dintel
  ctx.fillStyle = _TINTA; ctx.beginPath(); ctx.moveTo(0, -h / 2 + h * 0.035); ctx.lineTo(-h * 0.035, -h / 2 + h * 0.105); ctx.lineTo(h * 0.035, -h / 2 + h * 0.105); ctx.closePath(); ctx.fill(); // indicador de piso
  if (fl > 0) { ctx.globalAlpha *= fl; const fx = w / 2 + h * 0.2 + (o.mover || 0) * 0, L = h * 0.2, aw = lw * 1.3;
    _flecha(ctx, fx, -h * 0.04, -1, L, aw, _ROJO); _flecha(ctx, fx, h * 0.04, 1, L, aw, _ROJO); }
  ctx.restore();
};
// Móvil en trípode grabando, visto de lado (mira hacia la derecha). (x, y) = punto del suelo bajo el trípode. size = alto total (≈ 1 m de trípode).
// o: { size: 420, alfa: 1, cono: 0..1 (campo de visión en trazos grises, mira a +x) }
overlay.movilTripode = (ctx, x, y, o = {}) => {
  const h = o.size ?? 420, lw = Math.max(5, h * 0.022), cono = o.cono ?? 1;
  ctx.save(); ctx.globalAlpha = o.alfa ?? 1; ctx.translate(x, y); ctx.strokeStyle = _TINTA; ctx.fillStyle = '#F4EFE6'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const hub = [0, -h * 0.62];
  for (const [dx, dy] of [[-h * 0.2, 0], [h * 0.17, 0], [h * 0.02, h * 0.03]]) { ctx.beginPath(); ctx.moveTo(hub[0], hub[1]); ctx.lineTo(dx, dy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(hub[0], hub[1]); ctx.lineTo(hub[0], hub[1] - h * 0.1); ctx.stroke();           // columna
  const px = hub[0] - h * 0.025, py = hub[1] - h * 0.1 - h * 0.3;                                              // móvil: placa fina de lado
  ctx.beginPath(); ctx.roundRect(px, py, h * 0.05, h * 0.3, h * 0.015); ctx.fill(); ctx.stroke();
  ctx.fillStyle = _TINTA; ctx.beginPath(); ctx.arc(px + h * 0.05 + lw * 0.4, py + h * 0.05, lw * 0.9, 0, 6.2832); ctx.fill(); // objetivo
  if (cono > 0) { ctx.globalAlpha *= cono; ctx.strokeStyle = _GRIS; ctx.setLineDash([lw * 1.6, lw * 1.6]); const ox = px + h * 0.1, oy = py + h * 0.05, L = h * 0.7;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + L, oy - L * 0.36); ctx.moveTo(ox, oy); ctx.lineTo(ox + L, oy + L * 0.36); ctx.stroke(); }
  ctx.restore();
};
export default overlay;
