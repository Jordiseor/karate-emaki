// Ayudas COMUNES de la pieza 2026-11-18-tigre. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import * as T from '../../../../animacion/3d/tigre2d.js';          // tigre, pincelada, cubierta, kanji, rotulo, sello, pergamino, ojo
import * as H2 from '../../../../animacion/3d/historia2d.js';       // kanji, pergamino claro
import { crearRollo, VENTANA } from '../../../../animacion/3d/rollo2d.js';
import { crearMaestro, anadirMaestro } from '../../../../animacion/3d/historia3d.js';
import { crearFunakoshi } from '../../../../animacion/3d/manovacia.js';
export { U, mezclar, Karateka3D, cargarPoses, overlay, T, H2, crearRollo, VENTANA, crearMaestro, anadirMaestro, crearFunakoshi, crearEscenario };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A';
export const ctx2d = () => document.getElementById('c').getContext('2d');

// Escenario 3D (solo planos 2 y 10; escala 0,5 SIEMPRE). Fondo transparente → úsalo sobre papel con `esc.dibujar(ctx, { fondo: false })` si tu versión lo admite;
// si no, pinta primero el 3D y el papel como en historia. Los planos 2D puros NO deben llamar a esto (coste).
export function iniciar3d() { const esc = crearEscenario({ escala: 0.5 }); return { esc, P: cargarPoses(), U }; }

// Papel de fondo (fibra de marca).
export function papel(ctx) { window.EMAKI.fondoPapel(ctx); }

// ---- Texto
// Tarjeta arriba (y = 300; 250 px libres). t0 < 0 = ya visible. Rojo solo con [r]…[/r] (rótulo SE DICE/LEYENDA, flechas, el año 1922).
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o)); }
// Etiqueta DATO / SE DICE / LEYENDA (≥ 48 px, pastilla). Debajo de la tarjeta (y = 470 por defecto). DATO = tinta; SE DICE y LEYENDA = rojo.
export function etiqueta(ctx, t, tipo = 'DATO', o = {}) {
  const { t0 = 0.3, y = 470, x = 540 } = o, p = U.easeOut(U.prog(t, t0, t0 + 0.25)); if (p <= 0) return;
  const col = tipo === 'DATO' ? TINTA : ROJO;
  ctx.save(); ctx.globalAlpha = p; ctx.font = '800 48px "Montserrat","Arial Black",system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(tipo).width + 56, yy = y + (1 - p) * 16;
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, yy, w, 72, 14); ctx.fill();
  ctx.fillStyle = PAPEL; ctx.fillText(tipo, x, yy + 38); ctx.restore();
}
// Letra pequeña inferior (48 px, zona segura). Una a la vez.
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }

// ---- BUCLE plano 10 → plano 1. La pincelada 'bucle' (T.pincelada) se dibuja en el MISMO sitio y escala en ambos planos:
// plano 10 termina con p = BUCLE.p0 (trazo a medias, aún en movimiento); plano 1 empieza con p = BUCLE.p0 y lo completa.
export const BUCLE = { x: 540, y: 1000, escala: 1.0, p0: 0.9 };
export function bucle(ctx, p) { return T.pincelada(ctx, 'bucle', p, BUCLE.x, BUCLE.y, BUCLE.escala); }

// Tigre original (suelo en y; ver T.TIGRE_DIM). Atajo con centro de pantalla por defecto.
export function tigre(ctx, pose, p, x = 540, y = 1180, escala = 1.9, o = {}) { return T.tigre(ctx, pose, p, x, y, escala, o); }
