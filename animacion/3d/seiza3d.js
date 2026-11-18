// KARATE EMAKI · ayudas 3D de la pieza «seiza» (humor del dōjō): poses con su altura, levantarse con las piernas dormidas,
// temblor, tambaleo y caras. Los overlays 2D (cronómetro 1:00 / 10:00, gota de sudor, puntos de hormigueo) están en seiza2d.js.
// Poses (poses/*.json, herramientas/disenar-poses-2026-11-18.mjs): seiza, seiza-alto, en-cuclillas-medio, levantarse-vacilando, manos-rodillas.
import { mezclar, MEDIDAS } from './karateka3d.js';
import { util as U } from './escenario.js';

// Caras para el karateka (k.cara). Todas combinan bien con ojos / torcida / cejas (comprobado en prueba/caras-seiza.png).
export const CARAS_SEIZA = {
  tranquilo: { sonrisa: 0.8, cejas: 0.4 },                              // plano 1: sonrisa grande, cejas altas
  aguantando: { cejas: -1, ojos: 1, torcida: 0.6, sonrisa: 0.1 },       // plano 2: ceño, ojos muy abiertos, sonrisa torcida
  sereno: { sonrisa: 0.35, cejas: 0.15 },                               // plano 3: respira y sonríe sereno
  cerrados: { parpadeo: 1, sonrisa: 0.2, cejas: 0 },                    // plano 4: mokusō, ojos cerrados (parpadeo 1 sostenido)
  sorpresa: { parpadeo: 0, ojos: 1, cejas: 0.7, sonrisa: 0.1 },         // plano 5: abre los ojos de golpe
  alivio: { sonrisa: 0.9, cejas: 0.5, parpadeo: 0.25 },                 // planos 5 y 6: alivio
  hormigueo: { cejas: -0.8, ojos: 0.8, torcida: 0.7, sonrisa: 0.25 }    // plano 6: piernas dormidas
};
export { mezclarCara } from './logo3d.js';

const aSinAplicar = (p) => { const o = { ...p }; delete o.aplicar; return o; };
// Aplica una pose respetando su campo `aplicar` (altura de la cadera). k.aplicarPose(P.seiza) a secas flota: usa esto.
// extra: opciones de aplicarPose (ancla, inclinar…). Devuelve k.
export function ponerPose(k, pose, extra = {}) {
  const ap = pose.aplicar || {};
  return k.aplicarPose(pose, { ...ap, ...extra });
}
const _alt = new Map();
function alturaApoyada(k, pose, clave) { // altura de la cadera (relativa a la de pie) con los pies en el suelo
  if (!_alt.has(clave)) { k.aplicarPose(pose, { suelo: true }); _alt.set(clave, k.j.cadera.position.y - MEDIDAS.caderaY); }
  return _alt.get(clave);
}

// Temblor fino (plano 2: hombros y tronco, determinista). amp 0..1; ≈ 1 mm de vibración visible a 14 Hz.
export function temblar(p, t, amp = 1) {
  const s = Math.sin(2 * Math.PI * 13 * t), c = Math.sin(2 * Math.PI * 9.3 * t + 1.1);
  const o = structuredClone(p), sum = (a, d) => ({ ...(a || {}), ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, ((a || {})[k] || 0) + v])) });
  o.tronco = sum(o.tronco, { ladeo: 0.5 * amp * s, inclina: 0.35 * amp * c });
  o.brazoI = sum(o.brazoI, { adelante: 1.3 * amp * c, abre: 0.8 * amp * s });
  o.brazoD = sum(o.brazoD, { adelante: -1.3 * amp * s, abre: 0.8 * amp * c });
  o.cabeza = sum(o.cabeza, { ladeo: 0.6 * amp * c });
  return o;
}
// Tambaleo de piernas dormidas (plano 6): balanceo lento del tronco, caderas y brazo de equilibrio. amp 0..1 (1 ≈ ±7° de ladeo).
export function tambalear(p, t, amp = 1) {
  const a = Math.sin(2 * Math.PI * 1.1 * t), b = Math.sin(2 * Math.PI * 1.7 * t + 0.8), c = Math.sin(2 * Math.PI * 2.6 * t + 2.0);
  const o = structuredClone(p), sum = (x, d) => ({ ...(x || {}), ...Object.fromEntries(Object.entries(d).map(([k, v]) => [k, ((x || {})[k] || 0) + v])) });
  o.tronco = sum(o.tronco, { ladeo: 7 * amp * a, giro: 4 * amp * b, inclina: 2.5 * amp * c });
  o.cadera = sum(o.cadera, { giro: 5 * amp * b, ladeo: 2 * amp * a });
  o.cabeza = sum(o.cabeza, { ladeo: -5 * amp * a });
  o.brazoD = sum(o.brazoD, { abre: 10 * amp * a, adelante: 5 * amp * c });
  o.rodillaI = (o.rodillaI || 0) + 4 * amp * b; o.rodillaD = (o.rodillaD || 0) - 4 * amp * a;
  return o;
}

// Secuencia de levantarse: seiza → seiza-alto → en-cuclillas-medio → levantarse-vacilando → manos-rodillas → neutra.
export const TRAMOS = [['seiza', 0], ['seiza-alto', 0.16], ['en-cuclillas-medio', 0.36], ['levantarse-vacilando', 0.58], ['manos-rodillas', 0.78], ['neutra', 1]];
// Pone al karateka en el punto f (0..1) de la secuencia. o: { t (para el tambaleo), tambaleo: 1 (amplitud 0..1; solo entre f 0,4 y 0,92), tramos }
// Los pies resbalan un poco entre seiza-alto y las cuclillas (no hay IK): mantén la cámara frontal y a ≥ 7 m, o corta por un fundido.
// Devuelve la pose aplicada (por si quieres añadirle algo).
export function levantarse(k, P, f, o = {}) {
  const T = o.tramos || TRAMOS; f = U.clamp(f);
  let i = 0; while (i < T.length - 2 && f > T[i + 1][1]) i++;
  const [na, fa] = T[i], [nb, fb] = T[i + 1], u = U.easeInOut(U.clamp((f - fa) / (fb - fa)));
  const A = P[na], B = P[nb];
  let pose = mezclar(aSinAplicar(A), aSinAplicar(B), u);
  // tambaleo: sube al entrar en vacilando y se apaga hacia el final
  const amp = (o.tambaleo ?? 1) * U.prog(f, 0.4, 0.5) * (1 - U.prog(f, 0.84, 0.95));
  if (amp > 0 && o.t !== undefined) pose = tambalear(pose, o.t, amp);
  const idxApoyo = T.findIndex(([n]) => n === 'en-cuclillas-medio'); // desde aquí los pies pisan: suelo automático
  const hA = A.aplicar ? A.aplicar.altura : null;
  if (i + 1 <= idxApoyo) { // seiza → alto → cuclillas: la altura va de la de una a la de la otra
    const h0 = hA, h1 = B.aplicar ? B.aplicar.altura : alturaApoyada(k, B, nb);
    k.aplicarPose(pose, { suelo: false, altura: h0 + (h1 - h0) * u });
  } else k.aplicarPose(pose, { suelo: true });
  return pose;
}
