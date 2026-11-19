// KARATE EMAKI · capa 2D de la pieza 2026-11-18-tigre: tigre ORIGINAL a pincel, pinceladas animadas, cubierta de libro en blanco,
// kanji 虎 / 巻, rótulo «tora no maki», sello rojo SE DICE y pergamino «Cuentan que…» con halo y ojo.
// Todo determinista (solo depende de t / prog), sobre cualquier contexto 2D de 1080×1920. Sin Math.random ni Date.
// El tigre está dibujado desde cero: de perfil, de frente o sentado; sin círculo, sin enroscarse, NO es el emblema del Shotokan/JKA.
//
// API (import * as T from '.../animacion/3d/tigre2d.js'; p = progreso 0..1):
//   T.tigre(ctx, pose, p, x, y, escala, o)  pose: 'acecho' | 'sentado' | 'frente'. (x, y) = centro de los pies (suelo).
//        o: { color: TINTA, espejo: false (mira a la derecha), alfa: 1, rayas: true }.  Devuelve { x, y } = punta del pincel
//        en pantalla (para posar un pincel / chispa); null si p = 0. Tamaño a escala 1: T.TIGRE_DIM[pose] = { w, h }.
//        Anclas útiles (coords locales, escala 1): T.TIGRE_DIM[pose].ojo = [x, y] (ojo del tigre), .cabeza = [x, y].
//   T.trazo(ctx, pts, p, { w: 14, color, seco: true, perfil: 'pincel' | 'raya' | 'liso' })  Un trazo de pincel por una curva (Catmull-Rom).
//   T.pincelada(ctx, tipo, p, x, y, escala, { color, rot })  tipo: 'barrido' | 'interrogacion' | 'bucle'. Centro en (x, y), ~860 px de ancho a escala 1.
//        'interrogacion' = signo «?» a pincel con su punto (plano 5). 'bucle' = trazo con lazo: el plano 10 (p 0→1) acaba y el plano 1
//        empieza con el MISMO trazo (misma curva): úsalo en ambos para el bucle. Devuelve la punta { x, y }.
//   T.cubierta(ctx, { x: 540, y: 960, w: 560, h: 740, aparece: 1, pincel: 0, rot: 0 })  Cubierta de libro en tela, SIN título ni dibujo;
//        `aparece` 0→1 (cae y se asienta) y `pincel` 0→1 (pincelada abstracta encima, sin parecer rayas de tigre).
//   T.kanji(ctx, '虎', x, y, size, { prog, color: TINTA })  Envoltorio de H2.kanji (historia2d.js, sin tocarlo): 虎, 巻 y '虎巻' salen bien
//        (verificado en la hoja de prueba). Por defecto tinta (no rojo) y 8 filas de barrido.
//   T.rotulo(ctx, 'tora no maki', x, y, size, p, { color })  Rótulo en cursiva que se escribe de izquierda a derecha con barrido seco.
//        size ≥ 48 (se fuerza). Centrado en x.
//   T.sello(ctx, p, x, y, size, { texto: 'SE DICE', rotar: -0.07 })  Sello rojo cuadrado (size ≥ 180 para texto ≥ 48 px) con texto papel, entra con rebote (p 0→1). Vale también 'LEYENDA'.
//   T.pergamino(ctx, t, { texto: 'Cuentan que…', t0, t1, y: 290, size: 64, halo: 0.6, x: 540 })  Pergamino ROJO de borde irregular que se desenrolla
//        (t0→t1) con halo suave. Devuelve { x, y, w, h }. Texto papel, ≥ 48 px.
//   T.ojo(ctx, p, x, y, size, { t, color })  Ojo de tigre abierto («nunca duerme»): p dibuja el contorno, el iris respira con t. size = ancho.
//   T.PERGAMINO_H2 = H2.pergamino  (el pergamino claro original, por si lo prefieres).
// Silueta de Kosugi con pincel: NO hace falta nada nuevo: crearMaestro({ silueta: '#1A1A1A' }) + pose 'maestro-seiza-pincel' (ver README «El maestro»).

import * as H2 from './historia2d.js';
import { rng, hash, ROJO, TINTA, PAPEL } from './historia2d.js';

export { ROJO, TINTA, PAPEL };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const fuenteTitulo = () => (typeof window !== 'undefined' && window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, "Noto Sans CJK JP", sans-serif');
const fuentePincel = () => (typeof window !== 'undefined' && window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.kanjiPincel : '"Noto Serif CJK JP", serif');
export const PERGAMINO_H2 = H2.pergamino;

// ---------------- curvas ----------------
const _cache = new WeakMap();
function curva(pts) {
  let c = _cache.get(pts); if (c) return c;
  const P = [pts[0], ...pts, pts[pts.length - 1]], out = [];
  for (let i = 0; i < P.length - 3; i++) {
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    const n = Math.max(4, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 4));
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
                0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
    }
  }
  out.push(pts[pts.length - 1]);
  const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  c = { p: out, cum, L: cum[cum.length - 1] }; _cache.set(pts, c); return c;
}
function muestra(pts, u) { // punto de la curva a fracción u de su longitud
  const c = curva(pts), s = clamp(u) * c.L; let i = 1; while (i < c.cum.length - 1 && c.cum[i] < s) i++;
  const a = c.p[i - 1], b = c.p[i], f = (s - c.cum[i - 1]) / Math.max(1e-6, c.cum[i] - c.cum[i - 1]);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

// ---------------- trazo de pincel ----------------
// Grosor variable (ataque, cuerpo, punta que afina) y pincel seco al final (huecos deterministas).
export function trazo(ctx, pts, p, o = {}) {
  if (p <= 0 || pts.length < 2) return null;
  const c = curva(pts), n = c.p.length, w = o.w || 14, perfil = o.perfil || 'pincel', seco = o.seco !== false, sem = Math.round(pts[0][0] * 7 + pts[0][1] * 13);
  const fin = Math.min(n - 1, Math.max(1, Math.round(clamp(p) * (n - 1))));
  ctx.save(); ctx.strokeStyle = o.color || TINTA; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 1; i <= fin; i++) {
    const u = c.cum[i] / c.L;
    let k = 1;
    if (perfil === 'pincel') k = 0.45 + 0.55 * sstep(0, 0.14, u) - 0.7 * sstep(0.72, 1, u) * (0.6 + 0.4 * sstep(0.72, 1, u));
    else if (perfil === 'raya') k = 1 - 0.82 * Math.pow(u, 0.8);
    if (seco && perfil === 'pincel' && u > 0.82 && hash(i, sem) < (u - 0.82) * 3.2) continue;
    ctx.lineWidth = Math.max(1.2, w * k * (0.94 + 0.12 * hash(i, sem + 5)));
    ctx.beginPath(); ctx.moveTo(c.p[i - 1][0], c.p[i - 1][1]); ctx.lineTo(c.p[i][0], c.p[i][1]); ctx.stroke();
  }
  ctx.restore();
  return { x: c.p[fin][0], y: c.p[fin][1] };
}
function relleno(ctx, pts, a, color, cerrar = true) {
  if (a <= 0) return;
  const c = curva(cerrar ? [...pts, pts[0], pts[1]] : pts).p;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (let i = 1; i < c.length; i++) ctx.lineTo(c[i][0], c[i][1]); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
const disco = (cx, cy, r, n = 8) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
const espejo = (pts, cx) => pts.map(([x, y]) => [2 * cx - x, y]);

// transforma un conjunto de trazos: cada punto (x, y) -> fn(x, y); fw multiplica el grosor de las rayas
const tf = (trs, fn, fw = 1) => trs.map((s) => Object.assign({}, s, { pts: s.pts.map(([x, y]) => fn(x, y)), w: s.w && s.t === 'raya' ? s.w * fw : s.w }));

// rayas entre dos curvas: de A hacia B (fracción de la distancia), curvadas y de longitud variable
function rayas(A, B, n, o) {
  const r = rng(o.seed || 1), out = [];
  for (let i = 0; i < n; i++) {
    const u = o.u0 + (o.u1 - o.u0) * (i + 0.5) / n + (r() - 0.5) * 0.012, a = muestra(A, u), b = muestra(B, clamp(u + (o.desp || 0) + (r() - 0.5) * 0.04));
    const f = o.f0 + (o.f1 - o.f0) * r(), q = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1, bomb = (o.curva || 8) * (r() - 0.3);
    out.push({ t: 'raya', w: o.w * (0.75 + 0.5 * r()), pts: [a, [(a[0] + q[0]) / 2 + nx / nl * bomb, (a[1] + q[1]) / 2 + ny / nl * bomb], q] });
  }
  return out;
}

// ---------------- poses del tigre ----------------
// Trazos en coordenadas locales (el tigre mira a la IZQUIERDA; espejo:true lo gira). t: 'l' línea, 'raya', 'r' relleno, 'f' fino.
const L = (pts, w = 12) => ({ t: 'l', w, pts }), F = (pts, w = 5) => ({ t: 'f', w, pts, perfil: 'liso' }), R = (pts) => ({ t: 'r', pts });
const POSES = {};

POSES.acecho = (() => {
  const lomo = [[268, 262], [330, 222], [430, 198], [560, 208], [690, 222], [790, 205], [850, 225]];
  const vientre = [[300, 345], [400, 362], [520, 360], [640, 350], [740, 332], [815, 300]];
  const cola = [[850, 225], [925, 245], [978, 215], [998, 160], [988, 105]];
  const cuerpo = [
    L(lomo, 24), L(vientre, 18), L(cola, 30),
    L([[790, 215], [842, 270], [848, 340], [805, 400], [792, 455], [796, 490]], 18), L([[796, 490], [750, 497]], 15), L([[815, 300], [802, 380], [772, 430], [768, 490]], 15), L([[768, 490], [722, 496]], 14),
    L([[330, 330], [305, 400], [262, 442], [238, 488]], 16), L([[238, 488], [196, 494]], 14), L([[378, 352], [388, 420], [422, 456], [440, 490]], 17), L([[440, 490], [484, 494]], 15),
    ...rayas(lomo, vientre, 10, { u0: 0.1, u1: 0.96, f0: 0.5, f1: 0.85, w: 18, seed: 4, desp: 0.02, curva: 14 }),
    ...[0.25, 0.5, 0.75, 0.9].map((u, i) => ({ t: 'raya', w: 17 - i, pts: [muestra(cola, u - 0.04).map((v, j) => v + (j ? -18 : 0)), muestra(cola, u), muestra(cola, u).map((v, j) => v + (j ? 18 : 0))] })),
    { t: 'raya', w: 16, pts: [[800, 300], [820, 335], [812, 372]] }, { t: 'raya', w: 15, pts: [[830, 380], [810, 405], [800, 430]] }, { t: 'raya', w: 15, pts: [[325, 345], [305, 380], [312, 420]] }
  ];
  const cabeza = [
    L([[268, 262], [225, 275], [180, 305], [140, 350], [112, 392], [110, 420]], 20), L([[110, 420], [135, 438], [180, 440], [230, 425], [285, 395], [310, 350]], 18),
    R([[272, 262], [282, 226], [312, 232], [320, 264]]),
    { t: 'raya', w: 13, pts: [[236, 292], [250, 322], [262, 352]] }, { t: 'raya', w: 13, pts: [[205, 305], [218, 335], [232, 365]] }, { t: 'raya', w: 11, pts: [[160, 318], [168, 300], [182, 290]] },
    F([[130, 428], [74, 438]]), F([[138, 436], [84, 462]]), F([[126, 418], [70, 412]]),
    R(disco(118, 402, 12)),
    L([[150, 316], [172, 326], [204, 338]], 16), R([[172, 338], [190, 331], [202, 340], [186, 348]])
  ];
  const A = (x, y) => [268 + (x - 268) * 1.3, 262 + (y - 262) * 1.3], B = (x, y) => [268 + (x - 268) * 0.78, y];
  const tr = [...tf(cabeza.slice(0, 2), A), ...tf(cuerpo.slice(0, 2), B, 1.3), ...tf(cabeza.slice(2), A, 1.15), ...tf(cuerpo.slice(2), B, 1.3)];
  return { w: 880, h: 520, trazos: tr, ojo: A(188, 340), cabeza: A(180, 360) };
})();

POSES.sentado = (() => {
  const espalda = [[345, 110], [380, 200], [410, 320], [430, 450], [470, 540], [560, 600], [640, 622]];
  const pecho = [[290, 215], [300, 290], [330, 380], [390, 480], [450, 590]];
  const cola = [[640, 622], [730, 640], [820, 635], [890, 600], [915, 545]];
  const cabeza = [
    L([[300, 90], [255, 90], [215, 110], [185, 150], [170, 185], [172, 205]], 20), L([[172, 205], [190, 228], [235, 236], [290, 220], [328, 190]], 18),
    R([[310, 92], [325, 52], [362, 68], [362, 112]]),
    { t: 'raya', w: 12, pts: [[250, 112], [262, 140], [256, 168]] }, { t: 'raya', w: 12, pts: [[220, 128], [232, 156], [228, 182]] }, { t: 'raya', w: 11, pts: [[285, 140], [292, 166], [286, 192]] },
    F([[178, 214], [128, 224]]), F([[184, 220], [136, 244]]), F([[176, 205], [122, 198]]),
    R(disco(174, 196, 11)),
    L([[205, 140], [226, 150], [255, 160]], 16), R([[222, 152], [240, 147], [252, 158], [236, 165]])
  ];
  const cuerpo = [
    L(espalda, 24), L(pecho, 16), L(cola, 28),
    L([[262, 300], [252, 450], [247, 626], [205, 640]], 17), L([[330, 360], [332, 520], [334, 626], [378, 640]], 17), L([[205, 640], [250, 642]], 14),
    L([[430, 440], [520, 420], [610, 450], [660, 520], [650, 600], [600, 634], [470, 638]], 19), L([[470, 638], [425, 640]], 14),
    ...rayas(espalda, pecho, 9, { u0: 0.12, u1: 0.8, f0: 0.35, f1: 0.55, w: 19, seed: 9, desp: 0.08, curva: 10 }),
    { t: 'raya', w: 18, pts: [[520, 422], [545, 470], [530, 520]] }, { t: 'raya', w: 18, pts: [[585, 440], [610, 490], [596, 545]] }, { t: 'raya', w: 17, pts: [[640, 500], [624, 548], [632, 590]] },
    ...[0.2, 0.42, 0.62, 0.82].map((u, i) => { const m = muestra(cola, u); return { t: 'raya', w: 18 - i, pts: [[m[0] - 4, m[1] - 20], [m[0], m[1] - 6], [m[0] + 2, m[1] + 12]] }; }),
    { t: 'raya', w: 13, pts: [[262, 330], [284, 346], [300, 340]] }, { t: 'raya', w: 13, pts: [[256, 420], [282, 432], [300, 424]] }
  ];
  const A = (x, y) => [330 + (x - 330) * 1.3, 190 + (y - 190) * 1.3 + 40];
  const tr = [...tf(cabeza.slice(0, 2), A), ...cuerpo.slice(0, 3), ...tf(cabeza.slice(2), A, 1.1), ...cuerpo.slice(3)];
  return { w: 960, h: 660, trazos: tr, ojo: A(236, 157), cabeza: A(240, 160) };
})();

POSES.frente = (() => {
  const cx = 400, lado = [[400, 115], [330, 120], [262, 160], [225, 220], [205, 290], [215, 350], [250, 405], [310, 450], [360, 470], [400, 476]];
  const orej = [[268, 152], [250, 100], [210, 95], [185, 132], [190, 188]];
  const tr = [
    L(lado, 18), L(espejo(lado, cx), 18), L(orej, 15), L(espejo(orej, cx), 15),
    R([[258, 150], [246, 118], [220, 116], [208, 140], [212, 170]]), R(espejo([[258, 150], [246, 118], [220, 116], [208, 140], [212, 170]], cx)),
    // cuerpo: hombros, pecho y dos patas
    L([[258, 430], [212, 500], [186, 600], [180, 730], [190, 800]], 16), L(espejo([[258, 430], [212, 500], [186, 600], [180, 730], [190, 800]], cx), 16),
    L([[330, 520], [322, 640], [318, 770], [292, 804]], 14), L(espejo([[330, 520], [322, 640], [318, 770], [292, 804]], cx), 14),
    L([[190, 800], [250, 810], [292, 804]], 13), L(espejo([[190, 800], [250, 810], [292, 804]], cx), 13), L([[292, 804], [330, 808]], 12), L([[470, 804], [508, 808]], 12),
    { t: 'raya', w: 15, pts: [[400, 118], [400, 150], [400, 188]] }, { t: 'raya', w: 14, pts: [[362, 124], [368, 156], [374, 190]] }, { t: 'raya', w: 14, pts: [[438, 124], [432, 156], [426, 190]] },
    ...[[208, 292, 262, 308], [218, 346, 272, 350], [250, 402, 296, 392]].flatMap(([a, b, c, d]) => [{ t: 'raya', w: 14, pts: [[a, b], [(a + c) / 2, (b + d) / 2 + 4], [c, d]] }, { t: 'raya', w: 14, pts: [[800 - a, b], [800 - (a + c) / 2, (b + d) / 2 + 4], [800 - c, d]] }]),
    ...[560, 620, 680, 740].flatMap((y, i) => [{ t: 'raya', w: 15 - i, pts: [[184 + i * 3, y], [214, y + 8], [244, y + 4]] }, { t: 'raya', w: 15 - i, pts: [[616 - i * 3, y], [586, y + 8], [556, y + 4]] }]),
    L([[290, 252], [330, 262], [362, 284]], 17), L(espejo([[290, 252], [330, 262], [362, 284]], cx), 17),
    R(disco(336, 300, 11)), R(disco(464, 300, 11)),
    R([[374, 352], [426, 352], [400, 388]]), L([[400, 388], [400, 414]], 9), L([[400, 414], [372, 436], [334, 428]], 9), L([[400, 414], [428, 436], [466, 428]], 9),
    F([[330, 400], [250, 392]]), F([[334, 414], [254, 424]]), F(espejo([[330, 400], [250, 392]], cx)), F(espejo([[334, 414], [254, 424]], cx)),
  ];
  return { w: 800, h: 830, trazos: tr, ojo: [336, 300], cabeza: [400, 300] };
})();

// calendario de trazos de cada pose (peso ∝ longitud; rayas rápidas; rellenos casi instantáneos)
for (const k of Object.keys(POSES)) {
  const P = POSES[k]; let acum = 0;
  for (const s of P.trazos) { const len = s.t === 'r' ? 0 : curva(s.pts).L; s.peso = s.t === 'r' ? 22 : s.t === 'raya' ? 26 + len * 0.5 : s.t === 'f' ? 14 + len * 0.4 : 30 + len; s.a = acum; acum += s.peso; }
  for (const s of P.trazos) { s.a /= acum; s.b = s.a + s.peso / acum; }
  P.sinRayas = null;
}
export const TIGRE_DIM = Object.fromEntries(Object.entries(POSES).map(([k, v]) => [k, { w: v.w, h: v.h, ojo: v.ojo, cabeza: v.cabeza }]));

export function tigre(ctx, pose, p, x, y, escala = 1, o = {}) {
  const P = POSES[pose]; if (!P) throw new Error('tigre2d: pose desconocida ' + pose);
  if (p <= 0) return null;
  const color = o.color || TINTA, dir = o.espejo ? -1 : 1; let punta = null, ult = null;
  ctx.save(); ctx.globalAlpha *= o.alfa == null ? 1 : o.alfa;
  ctx.translate(x, y); ctx.scale(escala * dir, escala); ctx.translate(-P.w / 2, -P.h);
  for (const s of P.trazos) {
    if (o.rayas === false && s.t === 'raya') continue;
    const q = clamp((p - s.a) / (s.b - s.a)); if (q <= 0) continue;
    if (s.t === 'r') relleno(ctx, s.pts, q * 1.6, color);
    else { const r = trazo(ctx, s.pts, q, { w: s.w, color, perfil: s.perfil || (s.t === 'raya' ? 'raya' : 'pincel') }); if (q < 1) ult = r; else ult = ult || r; }
  }
  if (ult && p < 1) punta = { x: x + (ult.x - P.w / 2) * escala * dir, y: y + (ult.y - P.h) * escala };
  ctx.restore();
  return punta || (p >= 1 ? { x: x + (P.cabeza[0] - P.w / 2) * escala * dir, y: y + (P.cabeza[1] - P.h) * escala } : null);
}

// ---------------- pinceladas animadas ----------------
const PINCELADAS = {
  barrido: { w: 74, pts: [[-430, 50], [-270, -34], [-70, 18], [130, -44], [330, 4], [430, 34]] },
  bucle: { w: 52, pts: [[-430, 70], [-250, -4], [-80, 44], [60, 62], [160, 0], [126, -96], [30, -74], [38, 12], [160, 62], [300, 22], [430, -18]] },
  interrogacion: { w: 44, pts: [[-100, -140], [-78, -215], [0, -245], [80, -212], [96, -140], [64, -70], [14, -28], [2, 40]] }
};
export function pincelada(ctx, tipo, p, x, y, escala = 1, o = {}) {
  const d = PINCELADAS[tipo]; if (!d) throw new Error('tigre2d: pincelada desconocida ' + tipo);
  if (p <= 0) return null;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(escala, escala);
  const color = o.color || TINTA;
  const q = tipo === 'interrogacion' ? clamp(p / 0.8) : p;
  let r = trazo(ctx, d.pts, q, { w: d.w, color });
  if (tipo === 'interrogacion') { const a = sstep(0.84, 1, p); if (a > 0) { relleno(ctx, disco(0, 120, 30 * (0.5 + 0.5 * a), 10), a * 2, color); r = { x: 0, y: 120 }; } }
  if (r) { const m = ctx.getTransform(); r = { x: m.a * r.x + m.c * r.y + m.e, y: m.b * r.x + m.d * r.y + m.f }; }
  ctx.restore();
  return r;
}

// ---------------- cubierta de libro en blanco ----------------
export function cubierta(ctx, o = {}) {
  o = Object.assign({ x: 540, y: 960, w: 560, h: 740, aparece: 1, pincel: 0, rot: 0 }, o);
  const a = clamp(o.aparece); if (a <= 0) return;
  const caida = (1 - easeOutBack(a)) * -120;
  ctx.save(); ctx.translate(o.x, o.y + caida); ctx.rotate(o.rot * a); ctx.globalAlpha *= clamp(a * 3);
  const w = o.w, h = o.h, x0 = -w / 2, y0 = -h / 2;
  ctx.fillStyle = 'rgba(40,25,10,0.22)'; ctx.filter = 'blur(14px)'; ctx.fillRect(x0 + 14, y0 + 22, w, h); ctx.filter = 'none';
  ctx.fillStyle = '#E8DFCC'; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 8); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(138,132,122,0.20)'; ctx.lineWidth = 1.4; // trama de tela
  for (let i = 0; i < h; i += 6) { ctx.beginPath(); ctx.moveTo(x0, y0 + i); ctx.lineTo(x0 + w, y0 + i); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(138,132,122,0.14)'; for (let i = 0; i < w; i += 7) { ctx.beginPath(); ctx.moveTo(x0 + i, y0); ctx.lineTo(x0 + i, y0 + h); ctx.stroke(); }
  const gl = ctx.createLinearGradient(x0, 0, x0 + w * 0.12, 0); gl.addColorStop(0, 'rgba(90,84,74,0.42)'); gl.addColorStop(1, 'rgba(90,84,74,0)'); ctx.fillStyle = gl; ctx.fillRect(x0, y0, w * 0.12, h); // lomo
  ctx.restore();
  ctx.strokeStyle = 'rgba(138,132,122,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([14, 9]); ctx.strokeRect(x0 + 22, y0 + 22, w - 44, h - 44); ctx.setLineDash([]); // costura
  ctx.strokeStyle = 'rgba(26,26,26,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 8); ctx.stroke();
  if (o.pincel > 0) { // pincelada abstracta: un barrido ancho en diagonal y tres gotas; nada de rayas
    const p = o.pincel, r = rng(31);
    trazo(ctx, [[x0 + w * 0.18, y0 + h * 0.74], [x0 + w * 0.34, y0 + h * 0.46], [x0 + w * 0.58, y0 + h * 0.55], [x0 + w * 0.84, y0 + h * 0.24]], clamp(p / 0.85), { w: 36, color: TINTA });
    for (let i = 0; i < 3; i++) relleno(ctx, disco(x0 + w * (0.25 + 0.2 * i) + r() * 20, y0 + h * (0.22 + 0.08 * i), 7 + r() * 8, 8), (p - 0.85 - i * 0.04) * 8, TINTA);
  }
  ctx.restore();
}
function easeOutBack(x) { const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }

// ---------------- kanji y rótulo ----------------
// 虎 (虍 arriba, 几 abajo) y 巻 se barren en filas de arriba abajo; H2.kanji ya los traza bien (ver hoja de prueba).
export function kanji(ctx, texto, x, y, size, o = {}) { H2.kanji(ctx, texto, x, y, size, Object.assign({ color: TINTA, filas: 8 }, o)); }

export function rotulo(ctx, texto, x, y, size, p, o = {}) {
  if (p <= 0) return;
  size = Math.max(48, size);
  ctx.save(); ctx.font = `italic 900 ${size}px ${fuentePincel()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(texto).width, x0 = x - w / 2, q = easeInOut(clamp(p)), borde = x0 + (w + size * 0.4) * q;
  ctx.beginPath(); ctx.moveTo(x0 - size, y - size);
  for (let i = 0; i <= 8; i++) ctx.lineTo(borde + (hash(i, 3) - 0.5) * size * 0.35 * (q < 1 ? 1 : 0), y - size + i * size * 0.25); // borde de pincel seco
  ctx.lineTo(x0 - size, y + size); ctx.closePath(); ctx.clip();
  ctx.fillStyle = o.color || TINTA; ctx.shadowColor = o.color || TINTA; ctx.shadowBlur = size * 0.015; ctx.fillText(texto, x, y);
  ctx.restore();
}

// ---------------- sello rojo ----------------
export function sello(ctx, p, x, y, size, o = {}) {
  if (p <= 0) return;
  const q = clamp(p), s = q < 1 ? 1 + 0.35 * Math.pow(1 - q, 2) * Math.cos(q * 9) : 1, texto = o.texto || 'SE DICE', color = o.color || ROJO;
  const pad = size * 0.14, lado = size + pad * 2, lineas = texto.split(' ');
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rotar == null ? -0.07 : o.rotar); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, q * 5);
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = i / 24 * 4; /* contorno ligeramente irregular */ }
  ctx.roundRect(-lado / 2, -lado / 2, lado, lado, lado * 0.07); ctx.fill();
  ctx.strokeStyle = PAPEL; ctx.lineWidth = Math.max(3, size * 0.03); ctx.beginPath(); ctx.roundRect(-lado / 2 + pad * 0.4, -lado / 2 + pad * 0.4, lado - pad * 0.8, lado - pad * 0.8, lado * 0.04); ctx.stroke();
  ctx.fillStyle = PAPEL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = Math.max(48, Math.min(size * 0.36, 90 * size / 300)); ctx.font = `900 ${fs}px ${fuenteTitulo()}`;
  const mw = Math.max(...lineas.map((l) => ctx.measureText(l).width)); if (mw > size * 0.9) { fs *= size * 0.9 / mw; ctx.font = `900 ${fs}px ${fuenteTitulo()}`; }
  lineas.forEach((l, i) => ctx.fillText(l, 0, (i - (lineas.length - 1) / 2) * fs * 1.12 + fs * 0.04));
  // desgaste de tinta determinista
  ctx.globalCompositeOperation = 'destination-out'; const r = rng(77); for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.12 + r() * 0.2; ctx.fillRect((r() - 0.5) * lado, (r() - 0.5) * lado, 2 + r() * 14, 1 + r() * 2); }
  ctx.restore();
}

// ---------------- pergamino rojo con halo y ojo ----------------
export function pergamino(ctx, t, o = {}) {
  o = Object.assign({ texto: 'Cuentan que…', t0: 0, t1: 0.5, y: 290, size: 64, x: 540, halo: 0.6 }, o);
  const size = Math.max(48, o.size), p = o.t1 > o.t0 ? clamp((t - o.t0) / (o.t1 - o.t0)) : 1; if (p <= 0) return null;
  const e = easeInOut(p);
  ctx.save(); ctx.font = `italic 800 ${size}px ${fuenteTitulo()}`;
  const tw = ctx.measureText(o.texto).width, ancho = tw + size * 1.8, alto = size * 1.8, w = Math.max(size * 0.5, ancho * e), x0 = o.x - w / 2, y0 = Math.max(250, o.y);
  if (o.halo > 0) { // halo suave que respira
    const R = Math.max(ancho, alto) * 0.9 * (1 + 0.04 * Math.sin(t * 2.4)), g = ctx.createRadialGradient(o.x, y0 + alto / 2, alto * 0.3, o.x, y0 + alto / 2, R);
    g.addColorStop(0, 'rgba(200,16,46,' + 0.38 * o.halo * clamp(p * 3) + ')'); g.addColorStop(1, 'rgba(200,16,46,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0 - R, 1080, alto + 2 * R);
  }
  ctx.globalAlpha *= clamp(p * 5);
  ctx.fillStyle = 'rgba(40,25,10,0.25)'; ctx.filter = 'blur(10px)'; ctx.fillRect(x0 + 6, y0 + 12, w, alto); ctx.filter = 'none';
  const borde = (xa, xb, ya, yb, n, s) => { for (let i = 1; i <= n; i++) { const f = i / n; ctx.lineTo(xa + (xb - xa) * f + (hash(i, s) - 0.5) * 7, ya + (yb - ya) * f + (hash(i, s + 9) - 0.5) * 7); } };
  ctx.fillStyle = ROJO; ctx.beginPath(); ctx.moveTo(x0, y0);
  borde(x0, x0 + w, y0, y0, 22, 1); borde(x0 + w, x0 + w, y0, y0 + alto, 8, 2); borde(x0 + w, x0, y0 + alto, y0 + alto, 22, 3); borde(x0, x0, y0 + alto, y0, 8, 4);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(244,239,230,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(x0 + 14, y0 + 14, w - 28, alto - 28);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 + 10, y0, w - 20, alto); ctx.clip();
  ctx.fillStyle = PAPEL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.texto, o.x, y0 + alto / 2 + size * 0.04); ctx.restore();
  for (const xv of [x0, x0 + w]) {
    const gv = ctx.createLinearGradient(xv - 14, 0, xv + 14, 0); gv.addColorStop(0, '#4A2E1C'); gv.addColorStop(0.45, '#8A5A38'); gv.addColorStop(1, '#3A2416');
    ctx.fillStyle = gv; ctx.beginPath(); ctx.roundRect(xv - 14, y0 - 18, 28, alto + 36, 12); ctx.fill();
  }
  ctx.restore();
  return { x: x0, y: y0, w, h: alto };
}

export function ojo(ctx, p, x, y, size, o = {}) {
  if (p <= 0) return;
  const t = o.t || 0, color = o.color || TINTA, w = size, h = size * 0.5, q = clamp(p);
  const arriba = [[-w / 2, 0], [-w * 0.25, -h * 0.55], [w * 0.1, -h * 0.6], [w / 2, 0.02 * h]], abajo = [[w / 2, 0.02 * h], [w * 0.2, h * 0.5], [-w * 0.2, h * 0.45], [-w / 2, 0]];
  ctx.save(); ctx.translate(x, y);
  const a = sstep(0.35, 0.75, q);
  if (a > 0) { // fondo del ojo, iris y pupila
    ctx.globalAlpha *= a; const c = curva([...arriba, ...abajo.slice(1)]).p;
    ctx.save(); ctx.beginPath(); c.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fillStyle = '#EDE3CF'; ctx.fill(); ctx.clip();
    const r = h * (0.46 + 0.015 * Math.sin(t * 2)), cx = -w * 0.02;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, 0, r, 0, 6.2832); ctx.fill();
    ctx.fillStyle = PAPEL; ctx.beginPath(); ctx.ellipse(cx, 0, r * 0.14, r * 0.74 * (0.97 + 0.03 * Math.sin(t * 2)), 0, 0, 6.2832); ctx.fill(); // pupila en rendija
    ctx.fillStyle = PAPEL; ctx.beginPath(); ctx.arc(cx - r * 0.35, -r * 0.35, r * 0.13, 0, 6.2832); ctx.fill();
    ctx.restore();
  }
  trazo(ctx, arriba, clamp(q / 0.5), { w: size * 0.07, color }); trazo(ctx, abajo, clamp((q - 0.2) / 0.4), { w: size * 0.05, color });
  trazo(ctx, [[-w * 0.3, -h * 0.9], [0, -h * 1.05], [w * 0.42, -h * 0.75]], clamp((q - 0.5) / 0.4), { w: size * 0.08, color }); // ceja
  ctx.restore();
}

export const tigre2d = { tigre, trazo, pincelada, cubierta, kanji, rotulo, sello, pergamino, ojo, TIGRE_DIM, ROJO, TINTA, PAPEL };
export default tigre2d;
