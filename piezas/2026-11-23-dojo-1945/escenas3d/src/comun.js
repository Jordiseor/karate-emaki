// Ayudas COMUNES de la pieza dojo-1945. Los animadores de tramo NO lo editan (lo que falte, se define en el plano y se apunta en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import * as H3 from '../../../../animacion/3d/historia3d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';
import * as MV from '../../../../animacion/3d/manovacia.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
export { U, H3, H2, MV, overlay, Karateka3D, cargarPoses, mezclar };
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';

// Escenario exterior (escala 0,5 SIEMPRE). modo: 'atardecer' | 'calle' | 'noche'. Con colina el suelo lo trae ella.
// Devuelve { ctx, esc, P, U, H2, H3 } y, según opciones, `casa`, `colina`, `calle`.
//   o.casa: false | { rotulo: '松濤館' | '' , ...opciones de crearCasa }   (por defecto casa con rótulo)
//   o.colina: { pinos, ... } | false ; o.calle: true|{...} (excluye colina)
export function iniciar(modo = 'atardecer', o = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, fondo: 'degradado' });
  const S = { ctx, esc, U, H2, H3, MV };
  const colina = o.colina ?? (modo === 'atardecer');
  H3.ambiente(esc, modo, { suelo: !colina });
  if (colina) { S.colina = H3.crearColina(colina === true ? {} : colina); esc.escena.add(S.colina.raiz); }
  if (o.calle) { S.calle = H3.crearCalle(o.calle === true ? {} : o.calle); esc.escena.add(S.calle.raiz); }
  if (o.casa !== false) { S.casa = H3.crearCasa(Object.assign({ rotulo: '松濤館' }, o.casa || {})); esc.escena.add(S.casa.raiz); }
  if (o.poses) S.P = cargarPoses();
  return S;
}

// ---- Cámaras probadas
export const CAM = {
  colina: { centro: [0, 2.4, -3], distancia: 22, azimut: 10, elevacion: 7, fov: 34 },
  casaFrente: { centro: [0, 2.0, 0], distancia: 21, azimut: 15, elevacion: 7, fov: 30 },   // la de noche.html
  calle: { desde: [7, 3.6, 24], hacia: [-1.5, 2.4, 0], fov: 40 },
};
// Empuje lento hacia la casa: p 0..1 → distancia 22 → 17 y centro sube hacia el rótulo.
export function camEmpuje(esc, p, { d0 = 30, d1 = 22, azimut = 14 } = {}) {
  const e = U.easeInOut(U.clamp(p));
  esc.orbita({ centro: [0, 2.2 + 0.4 * e, 0], distancia: d0 + (d1 - d0) * e, azimut, elevacion: 7, fov: 34 });
}
export const camCalle = (esc, o = {}) => { const c = { ...CAM.calle, ...o }; esc.mirar(c.desde, c.hacia, c.fov); };

// ---- Texto (≥ 48 px, 250 px arriba / 350 abajo libres; las funciones de overlay ya lo respetan)
// Tarjeta: líneas (≤ 5 palabras en total). Rojo con [r]…[/r] solo en años, 松濤館/松濤 y fuego.
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas: [].concat(lineas), t0: 0.1, size: 84, y: 300 }, o)); }
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
// «Seis años» tinta → rojo en `tCambio` (plano 1; reutilizable en 11). Sin salto de posición: mismas líneas.
export function tarjetaCambio(ctx, t, tCambio, lineaTinta, lineaRoja, o = {}) { tarjeta(ctx, t, t < tCambio ? lineaTinta : lineaRoja, o); }

// ---- Fuego (planos 2, 7, 8): resplandor + pavesas
export function fuego(ctx, t, p, { centro = [540, 1000], n = 50, intensidad } = {}) {
  H2.resplandor(ctx, p, t, { centro }); H2.pavesas(ctx, t, { n, intensidad: intensidad ?? Math.min(1, p * 1.4) });
}
export function ceniza(ctx, t, { n = 40, intensidad = 0.8 } = {}) { H2.pavesas(ctx, t, { n, intensidad, sube: false, color: H2.CENIZA }); }

// Fundido a color (cortes entre ambientes: `ambiente()` cambia de golpe). a 0..1
export const velo = (ctx, color, a) => { if (a > 0.001) H2.velo(ctx, color, a); };
// Triángulo 0→1→0 centrado en tc con semiancho w (para velos de corte)
export const pico = (t, tc, w) => U.clamp(1 - Math.abs(t - tc) / w);
