// Ayudas COMUNES de la pieza hikite. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Uso en un plano:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, espejo } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';
export { U, mezclar, espejo, overlay, H2, Karateka3D };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';

// Crea escenario, karateka, poses y diagrama. Escala 0,5 SIEMPRE.
export function iniciar() {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5 });
  const k = new Karateka3D({ cinturon: 'negro' });
  esc.escena.add(k.raiz);
  const P = cargarPoses();
  const d = new Diagrama3D(esc, k);
  return { ctx, esc, k, P, d, U };
}

// Cámaras (centro, distancia, azimut, elevación, fov). Karateka en el origen.
// RUMBO_34: el karateka mira hacia la izquierda de pantalla y hacia cámara: se ve su lado IZQUIERDO (el del hikite).
export const RUMBO_34 = -40;
export const CAM = {
  // plano 1 y plano 11 (bucle): IDÉNTICAS
  tres4: { centro: [0, 1.32, 0], distancia: 4.6, azimut: 0, elevacion: 4, fov: 26 },
  perfil: { centro: [0, 1.0, 0], distancia: 6.4, azimut: 0, elevacion: 3, fov: 26 },   // rumbo -90 = mira a la izquierda, se ve el lado izquierdo
  frontal: { centro: [0, 1.05, 0], distancia: 5.4, azimut: 0, elevacion: 3, fov: 26 }, // rumbo 0
  general: { centro: [0, 0.95, 0], distancia: 7.2, azimut: 0, elevacion: 3, fov: 26 },
};

// Gyaku-zuki de gancho: f 0..1 entre zenkutsu-dachi (puño izq. extendido abajo, hikite derecho) y gyaku-zuki-kiai
// (puño derecho fuera, hikite izquierdo en la cadera). Devuelve la pose mezclada. Piernas idénticas: no deslizan.
export function golpe(P, f) {
  return mezclar(P['zenkutsu-dachi'], P['gyaku-zuki-kiai'], { piernas: 1, brazos: f, tronco: U.clamp(f * 1.1), cabeza: f });
}

// Rastro rojo (cola que se estrecha) de un punto del cuerpo durante los últimos `cola` s.
// poseEn(ti) debe devolver la pose (ya con aplicarPose hecho dentro si hace falta); aquí se llama k.aplicarPose(poseEn(ti)) para muestrear.
// IMPORTANTE: tras llamarla, vuelve a hacer k.aplicarPose(pose de t) (la función ya lo hace con `restaurar`).
export function rastro(ctx, esc, k, poseEn, t, { punto = 'manoI', cola = 0.5, n = 16, alfa = 1, grosor = 26, t0 = -9, op = {} } = {}) {
  const desde = Math.max(t0, t - cola), pts = [];
  for (let i = 0; i <= n; i++) { const ti = desde + (t - desde) * i / n; k.aplicarPose(poseEn(ti), op); pts.push(esc.proyectar(k.punto(punto))); }
  k.aplicarPose(poseEn(t), op);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = ROJO;
  for (let i = 1; i < pts.length; i++) { const q = i / pts.length; ctx.globalAlpha = alfa * q * 0.92; ctx.lineWidth = 4 + grosor * q; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.restore();
}

// Tarjeta de texto fija abajo/arriba con la marca (zona segura incluida). lineas: array; sin rojo salvo [r]…[/r] justificado.
// Arriba por defecto (y=290, dentro de 250 px libres). En t<0 ya visible (t0 negativo = sin entrada).
export function tarjeta(ctx, t, lineas, o = {}) {
  overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o));
}
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
