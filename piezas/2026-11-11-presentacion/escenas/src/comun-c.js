// Tramo C (planos 7 y 8): toma del kiai compartida. tt = tiempo local del plano 7 (en el plano 8 sigue desde 2,1).
// Línea de tiempo (tt, plano 7 empieza en 13,7 s): 0,8 kiai colectivo · 1,3–1,8 empuje al último · 1,7 su puño
// · 2,02 (= 15,72 s) el bocadillo se quiebra · 2,1 fin del plano 7.
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { crearFila } from '../../../../animacion/3d/historia3d.js';
import { CARAS, mezclarCara } from '../../../../animacion/3d/logo3d.js';
export { U };
export const T_KIAI = 0.8, T_GALLO = 2.02, DUR7 = 2.1;
const GALLO = 2;

export function crearToma() {
  const esc = crearEscenario({ escala: 0.5 });
  const P = cargarPoses();
  const fila = crearFila(esc, { n: 6, columnas: 3, separacion: [0.82, 1.1], origen: [0, 0] });
  fila.pose(P, P.yoi);
  const cab = fila.miembros[GALLO].punto('cabeza').clone();
  const colectivo = (tt, i) => {
    const d = i * 0.012;
    return U.easeOut(U.prog(tt, T_KIAI + d, T_KIAI + 0.12 + d)) * (1 - U.easeInOut(U.prog(tt, 1.25, 1.5)));
  };
  const toma = {
    esc, fila, cab,
    escena(c, tt) {
      const golpeG = U.easeOut(U.prog(tt, 1.7, 1.85));
      const reojo = U.prog(tt, 1.45, 1.65);
      fila.pose(P, (i) => {
        const p = mezclar(P.yoi, P['choku-zuki-kiai'], i === GALLO ? golpeG : colectivo(tt, i));
        return i === GALLO ? p : { ...p, cabeza: { ...(p.cabeza || {}), giro: -22 * reojo } };
      });
      fila.miembros.forEach((k, i) => {
        if (i === GALLO) {
          if (tt < 1.7) k.cara({ sonrisa: 0.1, mirada: [-0.3, 0.2] });
          else k.cara(mezclarCara(mezclarCara({ sonrisa: 0.1 }, CARAS.kiai, U.prog(tt, 1.7, 1.85)), CARAS.gallo, U.prog(tt, 1.85, 2.05)));
        } else {
          const kiai = U.prog(tt, T_KIAI, T_KIAI + 0.1) * (1 - U.prog(tt, 1.2, 1.4));
          k.cara(mezclarCara(mezclarCara({ sonrisa: 0.1 }, CARAS.kiai, kiai), { ...CARAS.deReojo, mirada: [-1, 0] }, reojo));
        }
      });
      const f = U.easeInOut(U.prog(tt, 1.3, 1.8));
      const L = U.lerp;
      esc.orbita({ centro: [L(0, cab.x, f), L(1.05, cab.y + 0.02, f), L(-0.5, cab.z, f)], distancia: L(8.8, 4.3, f), azimut: 0, elevacion: L(5, 3, f), fov: 26 });
      esc.dibujar(c);
    },
    cabeza(tt) { return esc.proyectar(cab); }
  };
  return toma;
}

// ---- bocadillos (2D, ink sobre papel claro; sin rojo) ----
const FUENTE = () => window.EMAKI.marca.fuente.titulo;
function trazoBurst(c, cx, cy, rx, ry, puntas, fase) {
  c.beginPath();
  for (let i = 0; i < puntas * 2; i++) {
    const a = (i / (puntas * 2)) * Math.PI * 2 + fase;
    const r = (i % 2 ? 0.8 : 1) * (1 + 0.05 * Math.sin(i * 2.3));
    const x = cx + rx * r * Math.cos(a), y = cy + ry * r * Math.sin(a);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
}
export function bocadillo(c, x, y, w, h, texto, { size = 110, temblor = 0, tt = 0, puntas = 11 } = {}) {
  c.save();
  c.translate(x + temblor * 6 * Math.sin(tt * 90), y + temblor * 5 * Math.sin(tt * 77 + 1));
  c.rotate(temblor * 0.03 * Math.sin(tt * 61));
  trazoBurst(c, 0, 0, w / 2, h / 2, puntas, 0.2);
  c.fillStyle = '#FFFDF8'; c.fill();
  c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#1A1A1A'; c.stroke();
  c.fillStyle = '#1A1A1A'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `900 ${size}px ${FUENTE()}`;
  c.fillText(texto, 0, 6);
  c.restore();
}
// Bocadillo que se quiebra por un zigzag vertical: dos mitades que se separan y caen. q = 0 entero, 1 ya caídas.
export function bocadilloRoto(c, x, y, w, h, texto, q, opt = {}) {
  const ZZ = [-1, -0.5, -1.1, -0.45, -1.05, -0.4, -1]; // placeholder para claridad (no usado)
  const pts = [];
  const N = 8, alto = h * 1.4;
  for (let i = 0; i <= N; i++) pts.push([(i % 2 ? 22 : -22), -alto / 2 + (alto * i) / N]);
  const e = U.easeOut(q);
  for (const lado of [-1, 1]) {
    c.save();
    c.translate(x + lado * e * 120, y + e * e * 420 * 0.9 + e * 40);
    c.rotate(lado * e * 0.55);
    c.globalAlpha = 1 - U.prog(q, 0.55, 1);
    c.beginPath();
    c.moveTo(lado * 1000, -alto / 2);
    for (const [px, py] of pts) c.lineTo(px, py);
    c.lineTo(lado * 1000, alto / 2);
    c.closePath(); c.clip();
    bocadillo(c, 0, 0, w, h, texto, opt);
    c.restore();
  }
}
