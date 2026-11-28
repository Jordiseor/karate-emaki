// Ayudas COMUNES de la pieza cadera. Los animadores de tramo NO lo editan (lo que falte, se define en el plano y se apunta en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, mezclarCadena, espejo } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as CD from '../../../../animacion/3d/cadera3d.js';
import * as K from '../../../../animacion/3d/ciencia2d.js';   // ejes, columnas…
export { U, mezclar, mezclarCadena, espejo, overlay, Karateka3D, Diagrama3D, CD, K };
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A', AZUL = '#2F3E5C';

// Escenario dōjō (escala 0,5 SIEMPRE) con UN karateka cinturón negro en el origen. `rumbo` 90 = perfil mirando a la derecha.
export function iniciar({ rumbo = 90 } = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5 });
  const P = cargarPoses();
  const k = new Karateka3D({ cinturon: 'negro' }); esc.escena.add(k.raiz); k.colocar(0, 0, rumbo);
  const d = new Diagrama3D(esc, k), cad = CD.crearCadena(esc, k), fan = CD.crearFantasma(esc);
  cad.ocultar(); fan.poner(k.punto('cabeza'), 0);
  return { ctx, esc, P, k, d, cad, fan, U };
}

// Cámara de perfil de la guía (planos 1, 12 y, con otro azimut/distancia, el resto). ENCUADRE DEL BUCLE 1 ↔ 12: no cambiarlo.
export const CAM = { perfil: { centro: [0.1, 0.95, 0], distancia: 7.2, azimut: 0, elevacion: 3, fov: 26 } };
export const camPerfil = (esc, o = {}) => esc.orbita({ ...CAM.perfil, ...o });

// Tiempos de eslabón: f global 0..1 → { cadera, tronco, hombro, codo, mano } (cadera primero, puño último; el de la hoja de prueba).
export function eslabones(f) {
  const s = (a, b) => U.clamp((f - a) / (b - a));
  return { cadera: s(0, 0.4), tronco: s(0.15, 0.55), hombro: s(0.3, 0.7), codo: s(0.45, 0.85), mano: s(0.45, 0.85) };
}
export const poseCadena = (P, f) => mezclarCadena(P['gyaku-zuki-hanmi'], P['gyaku-zuki-kiai'], eslabones(f));

// GANCHO / BUCLE: el karateka en el plano 1 (t = 0 … 2,5) y el último fotograma del plano 12. Solo gira cadera (y algo el tronco); el brazo NO se extiende.
// En t = 0 la cadera ya va girando (g0 = 0,16). `gancho(t)` → opciones de mezclarCadena.
export const G0 = 0.16, G1 = 0.46;
export function gancho(t) {
  const g = G0 + (G1 - G0) * U.easeInOut(U.prog(t, 0, 2.5));
  return { cadera: g, tronco: Math.max(0, g - 0.12) * 0.7 };
}
export const poseGancho = (P, t) => mezclarCadena(P['gyaku-zuki-hanmi'], P['gyaku-zuki-kiai'], gancho(t));

// ---- Texto
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o)); }
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
// «ESQUEMA, NO ESCALA»: planos 3–7, esquina superior derecha, 48 px (debajo de los 250 px libres de la interfaz). Si choca con la tarjeta, la tarjeta baja a y ≥ 380.
export function etiquetaEsquema(ctx, { alfa = 1, y = 262 } = {}) {
  const t = 'ESQUEMA, NO ESCALA'; ctx.save(); ctx.globalAlpha = alfa; ctx.font = '800 48px "Montserrat","Arial Black",system-ui,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
  const w = ctx.measureText(t).width + 44, x = 1080 - 48;
  ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(x - w, y, w, 72, 16); ctx.fill();
  ctx.fillStyle = PAPEL; ctx.fillText(t, x - 22, y + 38); ctx.restore();
}
