// Base común de la pieza kiai-gallo (planos 1-6). Los tramos A y B importan de aquí y NO la modifican (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Tiempo GLOBAL de la pieza (s): cada plano usa tiempo local t = T - INICIO[plano].
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { crearFila } from '../../../../animacion/3d/historia3d.js';
import { CARAS, mezclarCara } from '../../../../animacion/3d/logo3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
export { U, overlay, CARAS, mezclarCara, mezclar, cargarPoses };
export const ctx = document.getElementById('c').getContext('2d');

export const INICIO = [0, 0, 1.6, 3.6, 4.8, 6.0, 8.2], FIN = 9.0; // INICIO[n] = comienzo del plano n (1..6)
export const DURACION = [0, 1.6, 2.0, 1.2, 1.2, 2.2, 0.8];       // duración del plano n
export const T_GOLPE = [1.7, 2.2, 2.7, 3.2, 3.7];                // golpe de cada karateka (0 = izquierda de pantalla), global
export const T_GALLO = 3.8;                                       // el gallo se quiebra (global)
export const T_MANOS = 5.1;                                       // las cinco manos al vientre empiezan (global), llegan a 5,4
export const CINTURONES = ['blanco', 'amarillo', 'verde', 'azul', 'marron'];
export const ROJO = '#C8102E';

// Cámara frontal de la fila de 5 (la de yoi). Mismo encuadre en 1 y 6.
export const CAM_FILA = { centro: [0, 1, 0], distancia: 14.2, azimut: 0, elevacion: 4, fov: 26 };

export function crearToma() {
  const esc = crearEscenario({ escala: 0.5 });
  esc.escena.fog.near = 16; esc.escena.fog.far = 60;
  const P = cargarPoses();
  const fila = crearFila(esc, { n: 5, columnas: 5, separacion: [0.65, 1.1], origen: [0, 0] });
  fila.miembros.forEach((k, i) => k.cinturon(CINTURONES[i]));
  const M = fila.miembros;

  // Respiración (idéntica en todos): 0 en T=0 y en T=9. Sube/baja una vez en el plano 1 (0,3–1,5 s) y de nuevo suave al final del 6.
  const resp = (T) => Math.sin(Math.PI * U.prog(T, 0.3, 1.5)) ** 2;
  const toma = {
    esc, fila, P, M, resp,
    // pose estándar de cada karateka en el instante global T. Los tramos la usan como base y sobrescriben lo suyo.
    //  golpe(i,T) 0..1 (choku-zuki-kiai, entra en 0,12 s y vuelve en 0,25 s); manos(T) 0..1 (mano-hara); giro(T) 0..1 (cabeza hacia el quinto)
    golpe(i, T) { const a = T_GOLPE[i]; return U.easeOut(U.prog(T, a, a + 0.12)) * (1 - U.easeInOut(U.prog(T, a + 0.3, a + 0.55))); },
    manos(T) { return U.easeInOut(U.prog(T, T_MANOS, T_MANOS + 0.3)) * (1 - U.easeInOut(U.prog(T, 8.2, 8.6))); },
    giro(T) { return U.easeInOut(U.prog(T, 4.9, 5.1)) * (1 - U.easeInOut(U.prog(T, 7.9, 8.2))); },
    poseDe(i, T) {
      const gz = toma.golpe(i, T);
      let p = mezclar(P.yoi, P['choku-zuki-kiai'], gz);
      p = mezclar(p, P['mano-hara'], toma.manos(T));
      if (i < 4) p = { ...p, cabeza: { ...(p.cabeza || {}), giro: 35 * toma.giro(T) } }; // el karateka 0..3 mira hacia el quinto (derecha de pantalla = giro negativo si hiciera falta: comprobar)
      return p;
    },
    caraDe(i, T) {
      const a = T_GOLPE[i], g = U.prog(T, a, a + 0.06) * (1 - U.prog(T, a + 0.3, a + 0.5));
      if (i < 4) return mezclarCara({ sonrisa: 0.1 }, CARAS.kiai, g);
      const k5 = mezclarCara({ sonrisa: 0.1 }, CARAS.kiai, g);
      const gallo = U.prog(T, T_GALLO - 0.1, T_GALLO + 0.1) * (1 - U.prog(T, 4.9, 5.15));
      return { ...mezclarCara(k5, CARAS.gallo, gallo), ...(T > 5.2 ? { sonrisa: 0.5 * U.prog(T, 5.2, 5.5) * (1 - U.prog(T, 8.0, 8.4)) } : {}) };
    },
    // Pone la fila entera en el instante global T (respiración incluida).
    fijar(T) {
      M.forEach((k, i) => { k.aplicarPose(toma.poseDe(i, T)); k.cara(toma.caraDe(i, T)); k.raiz.scale.y = 1 + 0.01 * resp(T); });
    },
    camFila() { esc.orbita(CAM_FILA); },
  };
  return toma;
}

// ---- bocadillos y destellos 2D ----
const FUENTE = () => window.EMAKI.marca.fuente.titulo;
function burst(c, cx, cy, rx, ry, puntas, fase) {
  c.beginPath();
  for (let i = 0; i < puntas * 2; i++) {
    const a = (i / (puntas * 2)) * Math.PI * 2 + fase, r = (i % 2 ? 0.8 : 1) * (1 + 0.05 * Math.sin(i * 2.3));
    const x = cx + rx * r * Math.cos(a), y = cy + ry * r * Math.sin(a); i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
}
// Bocadillo de kiai. rojo:true = relleno crema con texto rojo.
export function bocadillo(c, x, y, w, h, texto, { size = 110, temblor = 0, tt = 0, puntas = 11, rojo = false } = {}) {
  c.save();
  c.translate(x + temblor * 6 * Math.sin(tt * 90), y + temblor * 5 * Math.sin(tt * 77 + 1)); c.rotate(temblor * 0.03 * Math.sin(tt * 61));
  burst(c, 0, 0, w / 2, h / 2, puntas, 0.2); c.fillStyle = '#FFFDF8'; c.fill();
  c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#1A1A1A'; c.stroke();
  c.fillStyle = rojo ? ROJO : '#1A1A1A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${size}px ${FUENTE()}`; c.fillText(texto, 0, 6);
  c.restore();
}
// Se quiebra en zigzag en dos mitades que se separan y se escapan (q 0 entero → 1 fuera). arriba:true = hacia el techo.
export function bocadilloRoto(c, x, y, w, h, texto, q, opt = {}) {
  const N = 8, alto = h * 1.4, pts = []; for (let i = 0; i <= N; i++) pts.push([(i % 2 ? 22 : -22), -alto / 2 + (alto * i) / N]);
  const e = U.easeOut(q);
  for (const lado of [-1, 1]) {
    c.save(); c.translate(x + lado * e * 120, y - e * 380); c.rotate(lado * e * 0.4); c.globalAlpha = 1 - U.prog(q, 0.55, 1);
    c.beginPath(); c.moveTo(lado * 1000, -alto / 2); for (const [px, py] of pts) c.lineTo(px, py); c.lineTo(lado * 1000, alto / 2); c.closePath(); c.clip();
    bocadillo(c, 0, 0, w, h, texto, opt); c.restore();
  }
}
// Destello rojo corto de la bocanada: a = 0..1 (se llama con prog del destello), (x,y) píxeles del vídeo.
export function destello(c, x, y, a, { r = 150 } = {}) {
  if (a <= 0 || a >= 1) return;
  c.save(); c.translate(x, y); c.globalAlpha = 1 - a; c.strokeStyle = ROJO; c.lineWidth = 12; c.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const an = -Math.PI * 0.5 + (i - 3) * 0.32, r0 = r * (0.35 + 0.5 * a), r1 = r * (0.75 + 0.6 * a); c.beginPath(); c.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); c.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); c.stroke(); }
  c.restore();
}
// Tarjeta de texto con el overlay de marca (una a la vez; ≤5 palabras; [r]…[/r] = rojo)
export const tarjeta = (c, t, lineas, t0, t1, o = {}) => overlay.tarjeta(c, t, { lineas, t0, t1, size: 96, abajo: true, ...o });
