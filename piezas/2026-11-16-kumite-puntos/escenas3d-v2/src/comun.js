// Ayudas de la v2 simple (kumite-puntos). Sin marcador. Un plano = una técnica de crearTecnica (impacto en 0,6 + 0,7 = 1,3 s del plano).
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import { crearPareja, crearAreaWKF, crearTecnica } from '../../../../animacion/3d/kumite3d.js';
export { U, mezclar, overlay, crearTecnica };
export const ROJO = '#C8102E', T0 = 0.6;   // la técnica empieza a 0,6 s del plano
export function iniciar() {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, suelo: 'tatami' });
  esc.escena.fog.near = 16; esc.escena.fog.far = 60;
  const P = cargarPoses(), par = crearPareja(esc, { distancia: 1.6 }); crearAreaWKF(esc);
  par.colocar(1.6);
  par.aka.cara({ cejas: -0.5, parpadeo: 0 }); par.ao.cara({ ojos: 0.6, cejas: 0.5, parpadeo: 0 });
  return { ctx, esc, P, par, aka: par.aka, ao: par.ao };
}
// Cámara fija: la recomendada de la técnica (azimut −90: aka a la izquierda, ao a la derecha), o la de kamae.
export function cam(S, c) {
  const [cx, cz] = S.par.centro(); S.esc.sombraEn(cx, cz);
  S.esc.orbita({ ...c, centro: [cx + c.centro[0], c.centro[1], cz] });
}
export const CAM_BASE = { azimut: -90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.05, 0] };
// Anillo rojo fino + cifra «+N» junto al punto tocado. t = segundos del plano. Anillo 0,6 s; cifra desde el impacto hasta el final.
export function impacto(S, t, n, candidatos, ref, { ti = 1.3, fin = 3.2 } = {}) {
  const { ctx, esc, ao, aka } = S, k = t - ti; if (k < 0) return;
  const r = aka.punto(ref); let best = null, bd = 1e9;
  for (const c of candidatos) { const p = ao.punto(c), d = Math.hypot(p.x - r.x, p.y - r.y, p.z - r.z); if (d < bd) { bd = d; best = p; } }
  const q = esc.proyectar(best), a = U.clamp(k / 0.6);
  ctx.save();
  if (k < 0.6) { ctx.strokeStyle = ROJO; ctx.globalAlpha = 1 - a * a; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(q.x, q.y, 55 + 80 * U.easeOut(a), 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.strokeStyle = ROJO; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(q.x, q.y, 48, 0, 7); ctx.globalAlpha = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.3); ctx.stroke();
  ctx.restore();
  const al = U.clamp(k / 0.12) * (1 - U.clamp((t - fin) / 0.3)), s = 0.8 + 0.2 * U.easeOut(U.clamp(k / 0.25));
  const x = Math.max(260, Math.min(820, q.x)), y = 575;
  overlay.cifra(ctx, x, y, '+' + n, { size: 190 * s, alpha: al });
}
export function tarjeta(ctx, t, lineas, peq, o = {}) {
  overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 280 }, o));
  if (peq) overlay.tarjeta(ctx, t, { lineas: peq, t0: 0.35, size: 60, y: 280 + lineas.length * 100 + 10, peso: 700 });
}
