// Ayudas COMUNES de la pieza kumite-puntos. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, espejo } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import { crearPareja, crearAreaWKF, CINTURON_AKA, CINTURON_AO } from '../../../../animacion/3d/kumite3d.js';
export { U, mezclar, espejo, overlay, Karateka3D, Diagrama3D };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A', AZUL = CINTURON_AO;

// Crea escenario (tatami, escala 0,5 SIEMPRE), pareja aka/ao a 2 m, área WKF y poses. Ambos en kamae.
export function iniciar({ distancia = 2 } = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, suelo: 'tatami' });
  esc.escena.fog.near = 16; esc.escena.fog.far = 60;   // sin esto la niebla del dōjō borra a la pareja a 10 m
  const P = cargarPoses();
  const par = crearPareja(esc, { distancia });
  const area = crearAreaWKF(esc);
  const { aka, ao } = par;
  aka.aplicarPose(P.kamae); ao.aplicarPose(P.kamae);
  const d = new Diagrama3D(esc, aka);
  return { ctx, esc, P, par, aka, ao, area, d, U };
}

// Cámaras. Pareja centrada en el origen, aka en z<0 (mira a +Z), ao en z>0. `centro` se ajusta a par.centro() con C.cam().
// azimut −60…−75: aka a la izquierda, ao a la derecha (la patada derecha de aka se ve de frente). Con distancia < 9 no cabe aka entero.
export const CAM = {
  tres4: { centro: [0, 1.3, 0], distancia: 10.5, azimut: -75, elevacion: 3, fov: 26 },   // plano 1 y plano 13 (bucle): IDÉNTICAS
  patada: { centro: [0, 1.1, 0], distancia: 10.5, azimut: -75, elevacion: 3, fov: 26 }, // patada circular de frente (planos 5, 10)
  perfil: { centro: [0, 1.0, 0], distancia: 10.5, azimut: 90, elevacion: 3, fov: 26 },  // perfil: gyaku-zuki, mae-geri (planos 3, 4, 7)
  espalda: { centro: [0, 1.0, 0], distancia: 10.5, azimut: 60, elevacion: 3, fov: 26 }, // plano 9
  cerrado: { centro: [0, 1.45, 0], distancia: 4.2, azimut: 0, elevacion: 2, fov: 26 },  // primer plano de ao (plano 2): ao frente = azimut 0 con ao.colocar(0,0,0)
  alto: { centro: [0, 0.4, 0], distancia: 14, azimut: 0, elevacion: 38, fov: 30 },      // vista alta del área (planos 6, 11, 12)
};
// Pone la cámara. `c` = una entrada de CAM (puede sobreescribirse: C.cam(esc, par, { ...C.CAM.tres4, distancia: 9 })). Centra x,z en la pareja y fija la sombra.
export function cam(esc, par, c = CAM.tres4) {
  const [cx, cz] = par.centro();
  esc.sombraEn(cx, cz);
  esc.orbita({ ...c, centro: [cx + c.centro[0], c.centro[1], cz + (c.centro[2] || 0)] });
}

// ---- Patada circular a jōdan (gancho). f 0..1: 0 kamae, 0,45 rodilla alzada (prep), 1 pie junto a la cabeza (jodan).
export function mawashi(P, f) {
  const a = U.clamp(f / 0.45), b = U.clamp((f - 0.45) / 0.55);
  return f < 0.45 ? mezclar(P.kamae, P['mawashi-geri-prep'], U.easeInOut(a)) : mezclar(P['mawashi-geri-prep'], P['mawashi-geri-jodan'], U.easeOut(b));
}
// Patada frontal a chūdan, f 0..1 (kamae → prep → mae-geri-chudan).
export function mae(P, f) {
  const a = U.clamp(f / 0.45), b = U.clamp((f - 0.45) / 0.55);
  return f < 0.45 ? mezclar(P.kamae, P['mae-geri-prep'], U.easeInOut(a)) : mezclar(P['mae-geri-prep'], P['mae-geri-chudan'], U.easeOut(b));
}

// Un intercambio: aka hace `tecnica` ('mawashi' | 'mae') con f(t) y ao reacciona con kumite-esquiva (ra 0..1).
// Antes del primer fotograma llama una vez a `fijar` (calcula dónde queda ao con la patada completa; no deslizan los pies).
// Uso:  const X = C.intercambio(S, 'mawashi');  en render: X.poner(f, reaccion);  (f de la patada, reaccion 0..1)
export function intercambio(S, tecnica = 'mawashi') {
  const { P, par, aka, ao } = S;
  const pose = tecnica === 'mawashi' ? mawashi : mae, clave = tecnica === 'mawashi' ? 'mawashi-geri-jodan' : 'mae-geri-chudan';
  const b0 = { x: aka.base.x, z: aka.base.z, r: aka.base.rumbo }, c0 = { x: ao.base.x, z: ao.base.z, r: ao.base.rumbo };
  aka.colocar(b0.x, b0.z, b0.r); aka.aplicarPose(pose(P, 1)); ao.colocar(c0.x, c0.z, c0.r); ao.aplicarPose(P['kumite-esquiva']);
  par.alinear(clave);
  const fin = { x: ao.base.x, z: ao.base.z, r: ao.base.rumbo };
  const pieI = aka.punto('tobilloI'); // apoyo: tobillo izquierdo de aka fijo
  aka.aplicarPose(P.kamae); const ancla = { pie: 'I', x: aka.punto('tobilloI').x, z: aka.punto('tobilloI').z };
  return {
    // f = avance de la patada; rea = reacción de ao (0 kamae, 1 esquiva); pieza = pose de aka (por defecto la patada)
    poner(f, rea = 0, pieza = null) {
      aka.colocar(b0.x, b0.z, b0.r); aka.aplicarPose(pieza || pose(P, f), { ancla });
      ao.colocar(fin.x, fin.z, fin.r); ao.aplicarPose(mezclar(P.kamae, P['kumite-esquiva'], U.easeOut(U.clamp(rea))));
    }, fin, b0,
  };
}

// ---- Marcador 2D (rojo = marcador, dato clave). a, o: puntos de aka y ao (enteros). Caja papel con borde tinta.
// y = arriba de la caja (por defecto 1330: acaba en 1530 < 1570). `pulso` 0..1: la cifra de aka rebota y se ilumina (al subir).
// `tachado` 0..1: cruz roja sobre aka (plano 9). `interrogante` 0..1: «?» sobre la cifra de aka (plano 2).
export function marcador(ctx, a, o, { y = 1330, alfa = 1, pulso = 0, tachado = 0, interrogante = 0, tam = 130 } = {}) {
  if (alfa <= 0) return;
  const W = 300, H = 200, xs = [90, 1080 - 90 - W];
  ctx.save(); ctx.globalAlpha = alfa; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [['AKA', a, CINTURON_AKA, xs[0]], ['AO', o, CINTURON_AO, xs[1]]].forEach(([n, v, col, x], i) => {
    ctx.fillStyle = 'rgba(244,239,230,0.94)'; ctx.strokeStyle = TINTA; ctx.lineWidth = 6;
    rr(ctx, x, y, W, H, 26); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; rr(ctx, x, y, W, 12, 6); ctx.fill();
    ctx.font = '800 48px "Montserrat","Arial Black",system-ui,sans-serif'; ctx.fillStyle = TINTA; ctx.fillText(n, x + W / 2, y + 48);
    const esc = i === 0 ? 1 + 0.2 * Math.sin(Math.PI * U.clamp(pulso)) : 1;
    ctx.save(); ctx.translate(x + W / 2, y + 133); ctx.scale(esc, esc);
    ctx.font = `900 ${tam}px "Montserrat","Arial Black",system-ui,sans-serif`; ctx.fillStyle = v > 0 || (i === 0 && pulso > 0) ? ROJO : TINTA; ctx.fillText(String(v), 0, 0); ctx.restore();
  });
  if (interrogante > 0) { ctx.globalAlpha = alfa * interrogante; ctx.font = '900 150px system-ui,sans-serif'; ctx.fillStyle = ROJO; ctx.fillText('?', xs[0] + W / 2, y - 60); }
  if (tachado > 0) { ctx.globalAlpha = alfa; ctx.strokeStyle = ROJO; ctx.lineWidth = 22; ctx.lineCap = 'round'; const x = xs[0], p1 = U.clamp(tachado * 2), p2 = U.clamp(tachado * 2 - 1);
    ctx.beginPath(); ctx.moveTo(x + 40, y + 30); ctx.lineTo(x + 40 + (W - 80) * p1, y + 30 + (H - 60) * p1); ctx.stroke();
    if (p2 > 0) { ctx.beginPath(); ctx.moveTo(x + W - 40, y + 30); ctx.lineTo(x + W - 40 - (W - 80) * p2, y + 30 + (H - 60) * p2); ctx.stroke(); } }
  ctx.restore();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// ---- Regla de seis casillas (planos 6–9): n = casillas con visto (0..6, admite decimales: la última se dibuja a medias), `aparece` 0..1.
// Casillas 150×150 en dos filas de 3, centrada a y (por defecto 1000, zona libre). La cruz roja del criterio 6 la pone el plano 9 (`cruz` 0..1 en la sexta).
export function regla(ctx, n, { y = 1000, aparece = 1, cruz = 0 } = {}) {
  if (aparece <= 0) return;
  const L = 170, g = 30, x0 = (1080 - (3 * L + 2 * g)) / 2;
  ctx.save(); ctx.globalAlpha = aparece; ctx.translate(0, (1 - U.easeOut(aparece)) * 40);
  for (let i = 0; i < 6; i++) {
    const x = x0 + (i % 3) * (L + g), yy = y + Math.floor(i / 3) * (L + g), p = U.clamp(n - i);
    ctx.fillStyle = 'rgba(244,239,230,0.94)'; ctx.strokeStyle = TINTA; ctx.lineWidth = 6; rr(ctx, x, yy, L, L, 22); ctx.fill(); ctx.stroke();
    if (p > 0) { ctx.strokeStyle = ROJO; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const q = U.easeOut(p);
      ctx.beginPath(); ctx.moveTo(x + 38, yy + 90); const m = U.clamp(q * 2); ctx.lineTo(x + 38 + 40 * m, yy + 90 + 40 * m);
      if (q > 0.5) { const r = (q - 0.5) * 2; ctx.lineTo(x + 78 + 60 * r, yy + 130 - 90 * r); } ctx.stroke(); }
    if (i === 5 && cruz > 0) { ctx.strokeStyle = ROJO; ctx.lineWidth = 22; ctx.lineCap = 'round'; const c = U.clamp(cruz);
      ctx.beginPath(); ctx.moveTo(x + 36, yy + 36); ctx.lineTo(x + 36 + 98 * U.clamp(c * 2), yy + 36 + 98 * U.clamp(c * 2)); ctx.stroke();
      if (c > 0.5) { const r = (c - 0.5) * 2; ctx.beginPath(); ctx.moveTo(x + 134, yy + 36); ctx.lineTo(x + 134 - 98 * r, yy + 36 + 98 * r); ctx.stroke(); } }
  }
  ctx.restore();
}

// Halo tenue sobre una zona de ao (chūdan/jōdan): elipse 2D en el punto proyectado. `punto` = 'pecho' | 'cabeza'. Rojo solo si `rojo`.
export function halo(ctx, esc, k, punto, alfa = 1, { rojo = false, r = 150 } = {}) {
  if (alfa <= 0) return;
  const p = esc.proyectar(k.punto(punto)); const col = rojo ? '200,16,46' : '26,26,26';
  const g = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, r);
  g.addColorStop(0, `rgba(${col},${0.0})`); g.addColorStop(0.72, `rgba(${col},${0.28 * alfa})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = `rgba(${col},${0.85 * alfa})`; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.78, 0, 7); ctx.stroke(); ctx.restore();
}

// Rastro rojo (cola que se estrecha) de un punto de un Karateka3D. poseEn(ti) = pose del karateka en ti (con la misma `op` que usarás);
// se muestrea con k.aplicarPose y se restaura al final. Llamar DESPUÉS de esc.dibujar. En intercambios usa `X.poner` dentro de `alMuestrear`.
export function rastro(ctx, esc, k, poseEn, t, { punto = 'tobilloD', cola = 0.5, n = 16, alfa = 1, grosor = 26, t0 = -9, op = {}, alMuestrear = null } = {}) {
  const desde = Math.max(t0, t - cola), pts = [];
  for (let i = 0; i <= n; i++) { const ti = desde + (t - desde) * i / n; if (alMuestrear) alMuestrear(ti); else k.aplicarPose(poseEn(ti), op); pts.push(esc.proyectar(k.punto(punto))); }
  if (alMuestrear) alMuestrear(t); else k.aplicarPose(poseEn(t), op);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = ROJO;
  for (let i = 1; i < pts.length; i++) { const q = i / pts.length; ctx.globalAlpha = alfa * q * 0.92; ctx.lineWidth = 4 + grosor * q; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.restore();
}

// Texto: tarjeta arriba (y=300; 250 libres). t0 < 0 = ya visible. Rojo solo con [r]…[/r] (dato clave: cifras 1/2/3 y 5 cm).
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o)); }
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
