// KARATE EMAKI · capa 2D de ciencia (pieza «tiempo de contacto»): cronómetro, contador de velocidad, gráfico fuerza-tiempo y columnas.
// Todo se dibuja sobre el lienzo 2D (después de esc.dibujar). Necesita marca.js cargado antes. Determinista: solo depende de los argumentos.
// Reglas de marca: tinta #1A1A1A, papel #F4EFE6; el ROJO #C8102E solo para curvas / cifras clave. Texto ≥ 48 px, zona segura (250 arriba / 350 abajo).
export const COL = { tinta: '#1A1A1A', papel: '#F4EFE6', rojo: '#C8102E', gris: '#8A847A', azul: '#2F3E5C' };
const FUENTE = () => (window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, sans-serif');
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const MONO = '"DejaVu Sans Mono", "Liberation Mono", "Courier New", monospace';

function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function guardar(ctx, alfa, fn) { ctx.save(); ctx.globalAlpha *= alfa; fn(); ctx.restore(); }

// Formatos de cronómetro: 'mmss' (60 → «1:00», 600 → «10:00»), 'ms' (16.4 → «16 ms»), 's' (2.5 → «2,5 s»)
export function formato(valor, tipo = 'ms') {
  if (tipo === 'mmss') { const s = Math.max(0, Math.round(valor)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  if (tipo === 's') return valor.toFixed(1).replace('.', ',') + ' s';
  return Math.round(valor) + ' ms';
}

// ---------- cronómetro ----------
// o: { x, y (centro), valor, tipo: 'ms'|'mmss'|'s', texto (sustituye al formato: p. ej. '16–19 ms'), size: 84, alfa: 1,
//      rojo: false (cifra roja: dato clave), parado: false (el punto de «en marcha» deja de parpadear), t (para el parpadeo), etiqueta }
// Caja de tinta con cifras de papel (o rojas); un aro de reloj a la izquierda con una aguja que gira con `valor` si tipo 'ms'/'s'.
export function cronometro(ctx, o) {
  const s = Math.max(48, o.size || 84), txt = o.texto || formato(o.valor ?? 0, o.tipo || 'ms');
  guardar(ctx, o.alfa ?? 1, () => {
    ctx.font = `700 ${s}px ${MONO}`; const tw = ctx.measureText(txt).width;
    const pad = s * 0.32, aro = s * 0.62, w = tw + pad * 2 + aro * 2 + s * 0.2, h = s * 1.5, x0 = o.x - w / 2, y0 = o.y - h / 2;
    ctx.shadowColor = 'rgba(26,26,26,0.28)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    rrect(ctx, x0, y0, w, h, s * 0.28); ctx.fillStyle = COL.tinta; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 4; ctx.strokeStyle = COL.gris; ctx.stroke();
    // esfera
    const cx = x0 + pad + aro, cy = o.y;
    ctx.beginPath(); ctx.arc(cx, cy, aro * 0.82, 0, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = COL.papel; ctx.stroke();
    ctx.fillStyle = COL.papel; ctx.fillRect(cx - 5, cy - aro * 1.05, 10, aro * 0.2); // pulsador
    const vuelta = o.tipo === 'mmss' ? (o.valor || 0) / 60 : (o.valor || 0) / (o.tipo === 's' ? 60 : 1000) * 4; // el ms gira rápido y se detiene
    const ang = -Math.PI / 2 + vuelta * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * aro * 0.66, cy + Math.sin(ang) * aro * 0.66); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.strokeStyle = o.rojo ? COL.rojo : COL.papel; ctx.stroke();
    if (!o.parado && Math.floor((o.t || 0) * 2) % 2 === 0) { ctx.beginPath(); ctx.arc(x0 + w - pad * 0.8, y0 + pad * 0.8, s * 0.07, 0, Math.PI * 2); ctx.fillStyle = COL.papel; ctx.fill(); }
    ctx.font = `700 ${s}px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = o.rojo ? '#FF3B57' : COL.papel; // rojo de marca aclarado un punto para leerse sobre tinta
    if (o.rojo) ctx.fillStyle = COL.rojo === '#C8102E' ? '#E0263F' : COL.rojo;
    ctx.fillText(txt, cx + aro * 1.05, o.y + s * 0.04);
    if (o.etiqueta) { ctx.font = `600 48px ${FUENTE()}`; ctx.textAlign = 'center'; ctx.fillStyle = COL.tinta; ctx.fillText(o.etiqueta, o.x, y0 + h + 44); }
  });
}

// ---------- contador de velocidad ----------
// o: { x, y (centro), valor (0..max), max: 10, texto: '≈ 8' (cifra grande; si no, valor redondeado), unidad: 'm/s', size: 150, alfa, rojo: true, dial: true }
// Dial de medio arco con aguja y arco relleno hasta `valor`; la cifra en rojo (dato clave).
export function contadorVelocidad(ctx, o) {
  const s = o.size || 150, max = o.max || 10, v = cl((o.valor ?? 0) / max), R = s * 1.5;
  guardar(ctx, o.alfa ?? 1, () => {
    ctx.save(); ctx.translate(o.x, o.y);
    // fondo de papel redondeado
    ctx.shadowColor = 'rgba(26,26,26,0.22)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rrect(ctx, -R * 1.12, -R * 1.02, R * 2.24, R * 1.98, 46); ctx.fillStyle = 'rgba(244,239,230,0.96)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineCap = 'round'; ctx.lineWidth = 34;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.82, Math.PI, 0); ctx.strokeStyle = '#D8D0C0'; ctx.stroke(); // pista
    if (v > 0.001) { ctx.beginPath(); ctx.arc(0, 0, R * 0.82, Math.PI, Math.PI + Math.PI * v); ctx.strokeStyle = COL.tinta; ctx.stroke(); }
    for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI, c = Math.cos(a), sn = Math.sin(a); ctx.beginPath(); ctx.moveTo(c * R * 1.0, sn * R * 1.0); ctx.lineTo(c * R * 1.07, sn * R * 1.07); ctx.lineWidth = i % 5 ? 4 : 8; ctx.strokeStyle = COL.gris; ctx.stroke(); }
    const a = Math.PI + Math.PI * v; // aguja
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72); ctx.lineWidth = 10; ctx.strokeStyle = COL.rojo; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = COL.tinta; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `900 ${s}px ${FUENTE()}`; ctx.fillStyle = o.rojo === false ? COL.tinta : COL.rojo; ctx.fillText(o.texto ?? String(Math.round(o.valor ?? 0)), 0, R * 0.64);
    ctx.font = `700 56px ${FUENTE()}`; ctx.fillStyle = COL.tinta; ctx.fillText(o.unidad || 'm/s', 0, R * 0.64 + 66);
    ctx.restore();
  });
}

// ---------- gráfico fuerza-tiempo ----------
// Pulso de fuerza: media sinusoidal elevada (campana asimétrica suave). Área normalizada → el impulso es la integral.
const FORMA = (u) => Math.sin(Math.PI * cl(u)) ** 1.5;
const AREA = (() => { let a = 0; const n = 400; for (let i = 0; i < n; i++) a += FORMA((i + 0.5) / n); return a / n; })();
// caja: { x, y, w, h } del área de trazado (el eje horizontal es y + h).
export function ejes(ctx, caja, o = {}) {
  const p = ease(o.prog ?? 1);
  guardar(ctx, o.alfa ?? 1, () => {
    ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = COL.tinta;
    ctx.beginPath(); ctx.moveTo(caja.x, caja.y - 20); ctx.lineTo(caja.x, caja.y + caja.h * p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(caja.x, caja.y + caja.h); ctx.lineTo(caja.x + (caja.w + 20) * p, caja.y + caja.h); ctx.stroke();
    if (p > 0.9) {
      ctx.beginPath(); ctx.moveTo(caja.x - 14, caja.y + 6); ctx.lineTo(caja.x, caja.y - 24); ctx.lineTo(caja.x + 14, caja.y + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(caja.x + caja.w - 6, caja.y + caja.h - 14); ctx.lineTo(caja.x + caja.w + 24, caja.y + caja.h); ctx.lineTo(caja.x + caja.w - 6, caja.y + caja.h + 14); ctx.stroke();
    }
    ctx.fillStyle = COL.tinta; ctx.font = `700 52px ${FUENTE()}`; ctx.textBaseline = 'alphabetic';
    if (o.etiquetaX !== null) { ctx.textAlign = 'right'; ctx.fillText(o.etiquetaX ?? 'tiempo', caja.x + caja.w, caja.y + caja.h + 66); }
    if (o.etiquetaY !== null) { ctx.save(); ctx.translate(caja.x - 26, caja.y + caja.h); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'left'; ctx.fillText(o.etiquetaY ?? 'fuerza', 0, 0); ctx.restore(); }
  });
}
// Curva de un golpe: dura `duracion` (fracción 0..1 del ancho de la caja) y tiene el área `impulso` (en unidades de caja: altura·ancho = impulso·AREA⁻¹).
// o: { duracion: 0.7, impulso: 0.35 (fracción del área de la caja que ocupa el pulso, mismo valor ⇒ mismo área), color, relleno: 0.28,
//      prog: 1 (se traza de izquierda a derecha), alfa, grosor: 10, inicio: 0.04 (donde empieza, fracción), picoMax: 1 }
// Si el pico saldría fuera de la caja se recorta a picoMax·h. Devuelve { pico (0..1 fracción de h), x1 }.
export function curva(ctx, caja, o = {}) {
  const d = cl(o.duracion ?? 0.7, 0.03, 1), imp = o.impulso ?? 0.3, ini = o.inicio ?? 0.04, p = cl(o.prog ?? 1);
  const pico = Math.min(o.picoMax ?? 1, imp / (d * AREA)), color = o.color || COL.azul;
  const pts = []; const N = 90;
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push([caja.x + (ini + u * d) * caja.w, caja.y + caja.h - FORMA(u) * pico * caja.h, u]); }
  guardar(ctx, o.alfa ?? 1, () => {
    const uMax = p, base = caja.y + caja.h;
    if ((o.relleno ?? 0.28) > 0) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], base);
      for (const q of pts) if (q[2] <= uMax) ctx.lineTo(q[0], q[1]);
      const last = pts.filter((q) => q[2] <= uMax).pop(); ctx.lineTo(last[0], base); ctx.closePath();
      ctx.globalAlpha *= o.relleno ?? 0.28; ctx.fillStyle = color; ctx.fill();
    }
    ctx.globalAlpha = (ctx.globalAlpha === 0 ? 0 : 1) * (o.alfa ?? 1);
    ctx.beginPath(); let first = true;
    for (const q of pts) if (q[2] <= uMax) { if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]); }
    ctx.lineWidth = o.grosor ?? 10; ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.stroke();
  });
  return { pico, x1: caja.x + (ini + d) * caja.w, x0: caja.x + ini * caja.w, ymax: caja.y + caja.h - pico * caja.h };
}
// Atajo: dos curvas del mismo impulso que se transforman: f 0 → ancha y baja (azul tinta) · f 1 → estrecha y alta (rojo); el área no cambia.
export function morfosis(ctx, caja, f, o = {}) {
  const e = ease(f), d = (o.anchoA ?? 0.8) + ((o.anchoB ?? 0.3) - (o.anchoA ?? 0.8)) * e;
  const mez = (a, b, t) => { const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = h(a), B = h(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  return curva(ctx, caja, { ...o, duracion: d, color: mez(COL.azul, COL.rojo, e) });
}

// ---------- columnas / barras ----------
// o: { caja: {x,y,w,h}, barras: [{ valor, max (común si no), color, etiqueta, texto (cifra), prog }], horizontal: false, grosor: 0.6 (fracción del hueco), alfa }
// Columnas con altura proporcional al valor (o barras horizontales para tiempos). `texto` va sobre la columna (o a su derecha), en la tinta o rojo.
export function columnas(ctx, o) {
  const c = o.caja, n = o.barras.length, max = o.max ?? Math.max(...o.barras.map((b) => b.valor)), gr = o.grosor ?? 0.6;
  guardar(ctx, o.alfa ?? 1, () => {
    ctx.textBaseline = 'alphabetic';
    o.barras.forEach((b, i) => {
      const p = ease(b.prog ?? 1), f = cl(b.valor / max) * p;
      ctx.fillStyle = b.color || COL.tinta; ctx.strokeStyle = COL.tinta;
      if (!o.horizontal) {
        const hueco = c.w / n, w = hueco * gr, x = c.x + hueco * i + (hueco - w) / 2, h = c.h * f;
        rrect(ctx, x, c.y + c.h - h, w, Math.max(h, 1), Math.min(22, w / 4)); ctx.fill();
        ctx.textAlign = 'center';
        if (b.texto && p > 0.85) { ctx.font = `900 ${b.tam || 84}px ${FUENTE()}`; ctx.fillStyle = b.colorTexto || b.color || COL.tinta; ctx.fillText(b.texto, x + w / 2, c.y + c.h - h - 24); }
        if (b.etiqueta) { ctx.font = `700 52px ${FUENTE()}`; ctx.fillStyle = COL.tinta; ctx.fillText(b.etiqueta, x + w / 2, c.y + c.h + 62); }
      } else {
        const hueco = c.h / n, h = hueco * gr, y = c.y + hueco * i + (hueco - h) / 2, w = c.w * f;
        rrect(ctx, c.x, y, Math.max(w, 1), h, Math.min(22, h / 4)); ctx.fill();
        ctx.textAlign = 'left';
        if (b.texto && p > 0.85) { ctx.font = `900 ${b.tam || 72}px ${FUENTE()}`; ctx.fillStyle = b.colorTexto || b.color || COL.tinta; ctx.fillText(b.texto, c.x + w + 24, y + h / 2 + 24); }
        if (b.etiqueta) { ctx.font = `700 52px ${FUENTE()}`; ctx.fillStyle = COL.tinta; ctx.textAlign = 'right'; ctx.fillText(b.etiqueta, c.x - 18, y + h / 2 + 18); }
      }
    });
    ctx.strokeStyle = COL.tinta; ctx.lineWidth = 6; ctx.beginPath();
    if (o.horizontal) { ctx.moveTo(c.x, c.y - 10); ctx.lineTo(c.x, c.y + c.h + 10); } else { ctx.moveTo(c.x - 10, c.y + c.h); ctx.lineTo(c.x + c.w + 10, c.y + c.h); }
    ctx.stroke();
  });
}

// ---------- reloj de dos mitades (planos 1–3 en pantalla partida) ----------
// o: { x, y, valor (0..1 progreso del tiempo de contacto), parado: bool } mini reloj de arena sin cifras: barra que se llena.
export function regla(ctx, o) {
  const w = o.w || 420, h = 34, x0 = o.x - w / 2, p = cl(o.valor ?? 0);
  guardar(ctx, o.alfa ?? 1, () => {
    rrect(ctx, x0, o.y - h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(244,239,230,0.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = COL.tinta; ctx.stroke();
    if (p > 0) { rrect(ctx, x0, o.y - h / 2, Math.max(h, w * p), h, h / 2); ctx.fillStyle = o.color || COL.tinta; ctx.fill(); }
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x0 + (w * i) / 5, o.y + h / 2); ctx.lineTo(x0 + (w * i) / 5, o.y + h / 2 + 14); ctx.lineWidth = 4; ctx.strokeStyle = COL.tinta; ctx.stroke(); }
  });
}
export default { COL, formato, cronometro, contadorVelocidad, ejes, curva, morfosis, columnas, regla };
