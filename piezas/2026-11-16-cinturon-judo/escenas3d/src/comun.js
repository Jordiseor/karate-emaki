// Ayudas COMUNES de la pieza cinturon-judo. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, espejo } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';
import { crearCinturonSuelto, crearJudoka, crearSala, crearPancarta, sello } from '../../../../animacion/3d/judo3d.js';
export { U, mezclar, espejo, overlay, H2, Karateka3D, crearCinturonSuelto, crearJudoka, crearSala, crearPancarta, sello };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';

// Escenario (escala 0,5 SIEMPRE), karateka de la pieza (cinturón negro), poses y diagrama.
// o.suelo: 'madera' (por defecto) | 'tatami' (obligatorio en la sala del Kodokan, planos 5-6); o.fondo: 'dojo' | 'degradado'.
export function iniciar(o = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, ...o });
  const k = new Karateka3D({ cinturon: 'negro' });
  esc.escena.add(k.raiz);
  const P = cargarPoses();
  const d = new Diagrama3D(esc, k);
  return { ctx, esc, k, P, d, U };
}

// Cámaras (centro, distancia, azimut, elevación, fov). Karateka en el origen, rumbo 0 (mira a cámara).
export const CAM = {
  nudo: { centro: [0, 0.98, 0], distancia: 1.7, azimut: 0, elevacion: 2, fov: 26 },   // plano 1 t=0: solo cinturón y manos
  medio: { centro: [0, 1.2, 0], distancia: 6.6, azimut: 0, elevacion: 3, fov: 26 },  // plano medio frontal (fin del 1; = plano 11)
  frontal: { centro: [0, 1.05, 0], distancia: 5.4, azimut: 0, elevacion: 3, fov: 26 },
  general: { centro: [0, 0.95, 0], distancia: 7.2, azimut: 0, elevacion: 3, fov: 26 },
  fila4: { centro: [0, 1.0, 0], distancia: 14, azimut: 0, elevacion: 3, fov: 26 },     // 4 siluetas en fila, separación 1,0
  sala: { centro: [0, 1.0, -2], distancia: 20, azimut: 0, elevacion: 12, fov: 30 },
};

// Interpola dos cámaras (p 0..1, ya con easing aplicado por quien llama).
export function mezclarCam(a, b, p) {
  const L = (x, y) => x + (y - x) * p;
  return { centro: a.centro.map((v, i) => L(v, b.centro[i])), distancia: L(a.distancia, b.distancia), azimut: L(a.azimut, b.azimut), elevacion: L(a.elevacion, b.elevacion), fov: L(a.fov, b.fov) };
}

// Tarjeta de texto (zona segura incluida). lineas: array; [r]…[/r] = rojo SOLO en dato clave. Arriba por defecto (y=300).
export function tarjeta(ctx, t, lineas, o = {}) {
  overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o));
}
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }

// Cambia el color del cinturón del karateka en cadena: tramos = [[t0,'amarillo'],[t1,'naranja'],…] (el último con t0<=t gana).
export function cinturonPorTramos(k, t, tramos, base = 'negro') {
  let c = base; for (const [t0, col] of tramos) if (t >= t0) c = col; k.cinturon(c); return c;
}
