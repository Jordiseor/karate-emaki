// Ayudas COMUNES de la pieza ascensor. Los animadores de tramo NO lo editan (lo que falte, se define en el plano y se apunta en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
export { U, overlay, Karateka3D, cargarPoses, mezclar, Diagrama3D };
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';

// ---- Escena: A (recta, cinturón verde) y B (ascensor, cinturón naranja), perfil mirando a la DERECHA (+x), mismo sitio, cada banda oculta al otro
export const T_PASO = 1.1;          // s por paso (oi-zuki-migi → paso → oi-zuki-migi)
export const X0 = { A: 0, B: 0 };   // ambos en el mismo sitio: cada banda oculta al otro (`dibujarBanda`)
export const VEL = 0.9;             // m/s de avance

export function iniciar(o = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, suelo: 'tatami' });
  esc.escena.fog.near = 30; esc.escena.fog.far = 90;
  const P = cargarPoses();
  const A = new Karateka3D({ cinturon: 'verde' }), B = new Karateka3D({ cinturon: 'naranja' });
  esc.escena.add(A.raiz); esc.escena.add(B.raiz);
  const dA = new Diagrama3D(esc, A), dB = new Diagrama3D(esc, B);
  return { ctx, esc, P, A, B, dA, dB, U };
}

// Pose cíclica en el instante τ (s). alto = false → paso-nivel (A); true → paso-alto (B). Devuelve la pose mezclada.
export function poseCiclo(P, tau, alto) {
  const u = ((tau / T_PASO) % 1 + 1) % 1, f = 0.5 - 0.5 * Math.cos(2 * Math.PI * u);
  return mezclar(P['oi-zuki-migi'], P[alto ? 'paso-alto' : 'paso-nivel'], f);
}
// Fase suave 0→1→0 del paso en τ
export const faseBaile = (tau) => { const u = ((tau / T_PASO) % 1 + 1) % 1; return 0.5 - 0.5 * Math.cos(2 * Math.PI * u); };
// OJO (hallazgo del jefe): mezclar(oi-zuki-migi, paso-nivel) NO mantiene la cadera a 0,81 (sube hasta ~0,9 por la mezcla de ángulos).
// Por eso `poner` fija la altura de la cadera por desplazamiento vertical del cuerpo: A = 0,81 siempre; B = 0,81 + AMP·fase (vaivén exagerado).
export const H_CAD = 0.81, AMP = 0.11;

// Coloca al karateka `k` ('A' | 'B') en el instante τ. Devuelve k.
export function poner(k, quien, P, tau, opt = {}) {
  const alto = quien === 'B';
  k.colocar(X0.A + VEL * tau + (opt.dx || 0), 0, 90);
  k.aplicarPose(poseCiclo(P, tau, alto));
  k.raiz.updateMatrixWorld(true);
  const objetivo = H_CAD + (alto ? AMP * faseBaile(tau) : 0);
  k.raiz.position.y += objetivo - k.punto('cadera').y; k.raiz.updateMatrixWorld(true);
  return k;
}
export const cabeza = (k, quien, P, tau) => { poner(k, quien, P, tau); return k.punto('cabeza'); };
export const caderaPt = (k, quien, P, tau) => { poner(k, quien, P, tau); return k.punto('cadera'); };

// ---- Pantalla partida (planos 1, 2, 5): banda A arriba (y 250–925), banda B abajo (925–1570). 300 px por metro.
export const BANDA = { A: { y0: 250, y1: 925, pie: 910 }, B: { y0: 925, y1: 1570, pie: 1560 } };
// Dibuja el 3D recortado a una banda con la cámara de perfil siguiendo a `x` (m). zoom 1 = 300 px/m.
export function dibujarBanda(ctx, esc, quien, x, { zoom = 1, ySuelo, elev = 0, ocultar = [] } = {}) {
  const b = BANDA[quien], cam = esc.camara, W = 1080, H = 1920;
  const d = 16.5 / zoom;
  esc.orbita({ centro: [x, 0.95, 0], distancia: d, azimut: 0, elevacion: elev, fov: 22 });
  const piePx = ySuelo ?? b.pie, base = H / 2 + 0.95 * (H / (2 * d * Math.tan(11 * Math.PI / 180)));  // píxel del suelo sin desplazar
  const dy = base - piePx, k = esc.w / W;
  cam.setViewOffset(esc.w, esc.h, 0, Math.round(dy * k), esc.w, esc.h); cam.updateProjectionMatrix();
  ocultar.forEach((k) => (k.raiz.visible = false));
  ctx.save(); ctx.beginPath(); ctx.rect(0, b.y0, W, b.y1 - b.y0); ctx.clip();
  esc.sombraEn(x, 0); esc.dibujar(ctx, {}); ctx.restore();
  ocultar.forEach((k) => (k.raiz.visible = true));
  cam.clearViewOffset(); cam.updateProjectionMatrix();
}
// Línea fina de separación entre bandas (tinta)
export function separador(ctx) { ctx.save(); ctx.fillStyle = TINTA; ctx.fillRect(0, BANDA.A.y1 - 3, 1080, 6); ctx.restore(); }

// ---- Texto (≥ 48 px; 250 px libres arriba y 350 abajo; las funciones de overlay ya lo respetan)
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas: [].concat(lineas), t0: 0.1, size: 76, y: 262 }, o)); }
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
// Etiqueta fija sobre una banda (≥ 48 px)
export function etiqueta(ctx, txt, x, y, { color = TINTA, size = 56, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `800 ${size}px sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.lineWidth = 10; ctx.strokeStyle = PAPEL; ctx.strokeText(txt, x, y); ctx.fillStyle = color; ctx.fillText(txt, x, y); ctx.restore();
}
export const pico = (t, tc, w) => U.clamp(1 - Math.abs(t - tc) / w);
