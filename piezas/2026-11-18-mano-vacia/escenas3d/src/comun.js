// Ayudas COMUNES de la pieza mano-vacia. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, espejo } from '../../../../animacion/3d/karateka3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';    // kanji a trazos, pergamino, velo…
import * as H3 from '../../../../animacion/3d/historia3d.js';    // crearCartel, crearFila, ambiente…
import * as R2 from '../../../../animacion/3d/rollo2d.js';       // crearRollo (opcional)
import * as MV from '../../../../animacion/3d/manovacia.js';     // tintaKanji, reloj, selloInterrogante, pantallaPartida, libro, siluetas, mesa, Naha
export { U, mezclar, espejo, overlay, Karateka3D, cargarPoses, crearEscenario, H2, H3, R2, MV };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';

// Escenario 3D (escala 0,5 SIEMPRE). Fondo 'degradado' (dōjō claro). Para planos solo 2D no lo llames (ahorra render).
export function iniciar3D({ fondo = 'degradado', far = 90 } = {}) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, fondo });
  esc.escena.fog.near = 20; esc.escena.fog.far = far;
  return { ctx, esc, P: cargarPoses(), U };
}
export function iniciar2D() { return { ctx: document.getElementById('c').getContext('2d'), U }; }

// Fondo papel #F4EFE6 con fibra (marca.js)
export function papel(ctx) { window.EMAKI.fondoPapel(ctx); }

// Siluetas: las del Modelador salen marrón oscuro por la luz. Truco: quitar luz a la figura no es posible desde aquí;
// si se ve marrón, dibujar un velo TINTA muy ligero NO sirve (tiñe el fondo). Se acepta marrón oscuro; ver plan.md.

// Texto (≥ 48 px, 250 px libres arriba y 350 abajo): tarjeta arriba (y = 300 por defecto; el texto no pasa de y ≈ 1570).
// Máx. 5 palabras. Rojo con [r]…[/r] solo para kanji clave, fechas y avisos «según…».
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o)); }
// Letra pequeña inferior (48 px, zona segura). Una sola a la vez.
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
// Letra pequeña roja de aviso «según…» (48 px, y 1500, centrada, rojo, con halo de papel)
export function aviso(ctx, t, txt, { t0 = 0, t1 = 99, y = 1480, size = 48 } = {}) {
  const a = U.clamp(U.prog(t, t0, t0 + 0.2)) * (1 - U.clamp(U.prog(t, t1 - 0.2, t1)));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `800 ${size}px "Montserrat","Arial Black",system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = PAPEL; ctx.strokeText(txt, 540, y); ctx.fillStyle = ROJO; ctx.fillText(txt, 540, y); ctx.restore();
}
// Fecha grande en rojo (cartel con halo de papel). p 0..1 aparece con rebote.
export function fecha(ctx, txt, p, { x = 540, y = 1380, size = 120 } = {}) {
  if (p <= 0) return; const s = 0.6 + 0.4 * U.easeBack(U.clamp(p));
  ctx.save(); ctx.globalAlpha = U.clamp(p * 3); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `900 ${size}px "Montserrat","Arial Black",system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = PAPEL; ctx.strokeText(txt, 0, 0); ctx.fillStyle = ROJO; ctx.fillText(txt, 0, 0); ctx.restore();
}

// Pincel que cruza (plano 1 y reutilizable): borra lo dibujado en `capa` (canvas) con una pasada en zigzag y deja una pincelada tinta que se desvanece.
export function pasadaPincel(ctx, p, { x0 = 90, x1 = 990, y0 = 640, y1 = 1180, ancho = 300 } = {}) {
  if (p <= 0) return; const n = 24, pts = [];
  for (let i = 0; i <= n * p; i++) { const q = i / n; pts.push([x0 + (x1 - x0) * q, y0 + (y1 - y0) * q + Math.sin(q * 9) * 28]); }
  const q = Math.min(1, p); pts.push([x0 + (x1 - x0) * q, y0 + (y1 - y0) * q + Math.sin(q * 9) * 28]);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineWidth = ancho; ctx.stroke(); ctx.restore();
  return pts[pts.length - 1];
}
