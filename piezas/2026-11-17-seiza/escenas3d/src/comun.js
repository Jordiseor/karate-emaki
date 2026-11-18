// Base común de la pieza seiza (7 planos, 14,0 s, bucle). Tiempo GLOBAL T; cada plano usa t local = T - INICIO[plano].
// Un solo karateka (cinturón naranja), un solo escenario. `toma.fijar(T)` pone pose y cara en el instante global T.
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { CARAS_SEIZA as CA, mezclarCara, ponerPose, temblar, levantarse } from '../../../../animacion/3d/seiza3d.js';
import { cronometroSeiza, gotaSudor, hormigueo } from '../../../../animacion/3d/seiza2d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
export { U, CA, mezclarCara, cronometroSeiza, gotaSudor, hormigueo, H2, overlay };
export const ctx = document.getElementById('c').getContext('2d');

export const INICIO = [0, 0, 2.0, 4.0, 6.0, 8.0, 9.5, 12.5], FIN = 14.0;
export const DURACION = [0, 2.0, 2.0, 2.0, 2.0, 1.5, 3.0, 1.5];
export const T_LEVANTA = [9.6, 11.6];   // levantarse(f 0→1)
export const T_VUELVE = [13.4, 14.0];   // vuelve a seiza (f 1→0)
export const ROJO = '#C8102E', TINTA = '#1A1A1A';
// Cámara frontal de cuerpo entero (planos 1, 2 y 7: idéntica)
export const CAM_FRONTAL = { centro: [0, 0.62, 0], distancia: 7, azimut: 0, elevacion: 3, fov: 26 };
export const Y_TITULO = 330; // texto arriba, dentro de zona segura (≥ 250 px)

const SENAL = { // de pie, señala hacia abajo con la palma abierta (brazo derecho del karateka = izquierda de pantalla)
  brazoD: { adelante: 55, abre: 8 }, codoD: 10, manoD: 1, munecaD: { flex: -80 },
};

export function crearToma() {
  const esc = crearEscenario({ escala: 0.5 });
  const P = cargarPoses();
  const k = new Karateka3D({ cinturon: 'naranja' }); esc.escena.add(k.raiz); k.colocar(0, 0, 0);
  const senal = mezclar(P.neutra, { ...P.neutra, ...SENAL }, 1);
  const toma = {
    esc, k, P,
    // respiración: factor de escala vertical (0 en T=0 y T=14)
    resp(T) { return 0.012 * Math.sin(Math.PI * U.prog(T, 0.3, 1.7)) ** 2; },
    // Intensidad del hormigueo (0..1)
    hormi(T) { return U.prog(T, 9.7, 9.9) * (1 - U.prog(T, 11.0, 11.7)); },
    fLevanta(T) { return T < 13 ? U.prog(T, T_LEVANTA[0], T_LEVANTA[1]) : 1 - U.easeInOut(U.prog(T, T_VUELVE[0], T_VUELVE[1])); },
    fijar(T) {
      let cara, esc1 = 0;
      if (T < 2) { // 1: calma
        ponerPose(k, P.seiza); cara = { ...CA.tranquilo, parpadeo: U.parpadeo(T, [1.0]) };
      } else if (T < 4) { // 2: minuto 10, temblor
        ponerPose(k, temblar(P.seiza, T, 1)); cara = CA.aguantando;
      } else if (T < 6) { // 3: respira sereno
        const r = U.prog(T, 4.0, 4.3);
        ponerPose(k, P.seiza); cara = { ...mezclarCara(CA.aguantando, CA.sereno, r), parpadeo: U.parpadeo(T, [5.2]) };
        esc1 = 0.012 * Math.sin(Math.PI * U.prog(T, 4.2, 5.8)) ** 2;
      } else if (T < 8) { // 4: ojos cerrados, dos respiraciones
        ponerPose(k, P.seiza); cara = mezclarCara(CA.sereno, CA.cerrados, U.prog(T, 6.0, 6.2));
        esc1 = 0.02 * Math.sin(2 * Math.PI * (T - 6.2) / 0.9 * 0.5) ** 2 * U.prog(T, 6.1, 6.3) * (1 - U.prog(T, 7.8, 8.0));
      } else if (T < 9.5) { // 5: abre ojos, alivio, hombros que caen
        const a = U.prog(T, 8.0, 8.05), b = U.prog(T, 8.5, 9.0);
        const caer = U.easeOut(U.prog(T, 8.15, 8.6));
        const p = { ...P.seiza, tronco: { ...(P.seiza.tronco || {}), inclina: 4 * caer }, cabeza: { ...(P.seiza.cabeza || {}), inclina: 5 * caer } };
        ponerPose(k, p); cara = mezclarCara(mezclarCara(CA.cerrados, CA.sorpresa, a), CA.alivio, b);
      } else if (T < 12.5) { // 6: levantarse con hormigueo
        const f = toma.fLevanta(T);
        levantarse(k, P, f, { t: T });
        cara = mezclarCara(CA.alivio, CA.hormigueo, U.prog(T, 9.5, 9.75));
        cara = mezclarCara(cara, CA.alivio, U.prog(f, 0.78, 0.92));
      } else { // 7: de pie, señala, vuelve a seiza
        const f = toma.fLevanta(T);
        if (T < T_VUELVE[0]) { const m = U.easeInOut(U.prog(T, 12.6, 12.95)) * (1 - U.easeInOut(U.prog(T, 13.1, 13.4))); k.aplicarPose(mezclar(P.neutra, senal, m), { suelo: true }); }
        else levantarse(k, P, f, { t: T, tambaleo: 0 });
        cara = mezclarCara(CA.alivio, CA.tranquilo, U.prog(T, 13.4, 14.0));
      }
      k.cara(cara);
      k.raiz.scale.y = 1 + toma.resp(T) * (T < 2 ? 1 : 0) + esc1;
    },
  };
  return toma;
}
// Texto arriba con la marca: una tarjeta a la vez. [r]…[/r] rojo.
export const titulo = (c, t, lineas, t0, t1, o = {}) => overlay.titulo(c, t, { lineas, t0, t1, size: 84, y: Y_TITULO, ...o });
