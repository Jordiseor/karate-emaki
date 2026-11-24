// Ayudas COMUNES de la pieza notas-movil. Los animadores de tramo NO lo editan (lo que falte, se define en el plano y se apunta en plan.md).
// Uso: <script src="../../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { CARAS_SEIZA, ponerPose, temblar } from '../../../../animacion/3d/seiza3d.js';
import { mezclarCara, CARAS } from '../../../../animacion/3d/logo3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as N from './notas2d.js';
export { U, mezclar, mezclarCara, CARAS, CARAS_SEIZA, ponerPose, temblar, overlay, Karateka3D, N };
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6';

// Duraciones EXACTAS (s). Suman 18,0. Inicio de cada plano = suma de las anteriores.
export const DUR = [2.6, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.6, 3.0];
export const INICIO = DUR.map((_, i) => DUR.slice(0, i).reduce((a, b) => a + b, 0));

// Escenario (escala 0,5 SIEMPRE) con el karateka protagonista (cinturón BLANCO, siempre el mismo). Extras: iniciar({ extras:[{cinturon:'negro'}] }) → ks[1…].
export function iniciar({ rumbo = 0, extras = [] } = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5 });
  const P = cargarPoses();
  const k = new Karateka3D({ cinturon: 'blanco' }); esc.escena.add(k.raiz); k.colocar(0, 0, rumbo);
  if (esc.escena.fog) { esc.escena.fog.near = 16; esc.escena.fog.far = 60; }   // sin esto la niebla del dōjō borra planos lejanos
  const otros = extras.map((e) => { const o = new Karateka3D(e); esc.escena.add(o.raiz); return o; });
  return { ctx, esc, P, k, otros, U };
}

// Cámaras. El karateka queda en el tercio inferior (cabeza ≈ y 900, pies ≈ y 1580) para dejar el tercio superior al marco de móvil.
export const CAM = {
  frontal: { centro: [0, 1.7, 0], distancia: 11, azimut: 0, elevacion: 0, fov: 26 },    // plano 1 (cuerpo entero abajo)
  media: { centro: [0, 1.15, 0], distancia: 7, azimut: 0, elevacion: 2, fov: 26 },       // cuerpo entero normal (planos 7…)
  cara: { centro: [0, 1.6, 0], distancia: 3.2, azimut: 0, elevacion: 0, fov: 26 }        // primer plano (plano 6: empuje 1,0 → 1,15)
};
export const cam = (esc, nombre, o = {}) => esc.orbita({ ...CAM[nombre], ...o });

// Pose «móvil en las manos» (derivada de neutra): antebrazos al frente, cabeza gacha.
export function poseMovil(P, f = 1) {
  const n = P.neutra;
  return { ...n,
    brazoI: { ...n.brazoI, adelante: 35 * f }, brazoD: { ...n.brazoD, adelante: 35 * f },
    codoI: 80 * f, codoD: 80 * f, manoI: 1, manoD: 1,
    cabeza: { ...(n.cabeza || {}), inclina: 22 * f } };
}

// Etiqueta pequeña de término japonés (≥ 48 px). Ej.: etiqueta(ctx, t, { pre:'Sensei (', jp:'先生', post:'): el nacido antes', t0: 0.2 }). Rojo solo el término japonés.
export function etiqueta(ctx, t, { pre = '', jp = '', post = '', t0 = 0, y = 1500, size = 50 } = {}) {
  const a = U.prog(t, t0, t0 + 0.2); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `800 ${size}px Inter, "Noto Sans CJK JP", sans-serif`; ctx.textBaseline = 'middle';
  const w1 = ctx.measureText(pre).width, w2 = ctx.measureText(jp).width, w3 = ctx.measureText(post).width, W = w1 + w2 + w3 + 56;
  const x0 = 540 - W / 2, yy = y + (1 - U.easeOut(a)) * 24;
  ctx.fillStyle = 'rgba(244,239,230,0.96)'; ctx.strokeStyle = TINTA; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x0, yy - 50, W, 100, 24); ctx.fill(); ctx.stroke();
  let x = x0 + 28; ctx.textAlign = 'left';
  ctx.fillStyle = TINTA; ctx.fillText(pre, x, yy + 2); x += w1;
  ctx.fillStyle = ROJO; ctx.fillText(jp, x, yy + 2); x += w2;
  ctx.fillStyle = TINTA; ctx.fillText(post, x, yy + 2); ctx.restore();
}
