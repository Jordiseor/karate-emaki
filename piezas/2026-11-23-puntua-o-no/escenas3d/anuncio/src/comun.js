// Ayudas del anuncio «¿Puntúa o no?» (14 s). Un plano = un HTML. Escala 0,5.
import { crearEscenario, util as U } from '../../../../../animacion/3d/escenario.js';
import { cargarPoses, mezclar } from '../../../../../animacion/3d/karateka3d.js';
import { overlay } from '../../../../../animacion/3d/overlay2d.js';
import { crearPareja, crearAreaWKF, crearTecnica } from '../../../../../animacion/3d/kumite3d.js';
export { U, mezclar, overlay, crearTecnica };
export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', AZUL = '#1F4C9A';
export function iniciar(dist = 1.6) {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5, suelo: 'tatami' });
  esc.escena.fog.near = 16; esc.escena.fog.far = 60;
  const P = cargarPoses(), par = crearPareja(esc, { distancia: dist }); crearAreaWKF(esc); par.colocar(dist);
  par.aka.cara({ cejas: -0.5, parpadeo: 0 }); par.ao.cara({ ojos: 0.6, cejas: 0.5, parpadeo: 0 });
  return { ctx, esc, P, par, aka: par.aka, ao: par.ao };
}
export function cam(S, c) {
  const [cx, cz] = S.par.centro(); S.esc.sombraEn(cx, cz);
  S.esc.orbita({ ...c, centro: [cx + c.centro[0], c.centro[1], cz] });
}
// Aviso fijo en pie (48 px, zona segura)
export const aviso = (ctx) => overlay.letraPequena(ctx, ['Adultos, reglamento WKF 2026.', 'Animación controlada, sin contacto real.'], {});
// Marcador 2D: caja ao (azul) con cifra. valor numérico; tacha = 0..1 (cruz roja). Zona segura: y >= 250.
export function marcador(ctx, v, { tacha = 0, y = 400, pop = 0 } = {}) {
  const x = 540, w = 260, h = 200, s = 1 + 0.15 * pop;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 10, w, h, 24); ctx.fill();
  ctx.fillStyle = PAPEL; ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 24); ctx.fill(); ctx.stroke();
  ctx.fillStyle = AZUL; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, 52);
  ctx.fillStyle = PAPEL; ctx.font = '900 48px Inter, "Noto Sans CJK JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AO', 0, -h / 2 + 33);
  ctx.fillStyle = TINTA; ctx.font = '900 130px Inter, "Noto Sans CJK JP", sans-serif'; ctx.fillText(String(v), 0, 40);
  if (tacha > 0) { ctx.strokeStyle = ROJO; ctx.lineWidth = 16; ctx.lineCap = 'round'; const k = U.clamp(tacha * 2), k2 = U.clamp(tacha * 2 - 1);
    ctx.beginPath(); ctx.moveTo(-90, -70); ctx.lineTo(-90 + 180 * k, -70 + 180 * k); ctx.stroke();
    if (k2 > 0) { ctx.beginPath(); ctx.moveTo(90, -70); ctx.lineTo(90 - 180 * k2, -70 + 180 * k2); ctx.stroke(); } }
  ctx.restore();
}
// Rastro rojo del puño: muestrea la trayectoria proyectada. poner(tau) repone la pose; punto = Karateka3D que golpea.
export function rastro(S, k, t, { desde, hasta, alfa = 1, poner }) {
  const { ctx, esc } = S, pts = [];
  for (let i = 0; i <= 10; i++) { const tau = desde + (hasta - desde) * i / 10; poner(tau); const q = esc.proyectar(k.punto('manoD')); pts.push(q); }
  poner(t);
  ctx.save(); ctx.globalAlpha = alfa; ctx.strokeStyle = ROJO; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 1; i < pts.length; i++) { ctx.lineWidth = 6 + 22 * i / pts.length; ctx.globalAlpha = alfa * (i / pts.length); ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.restore();
}
export const tarjeta = (ctx, t, lineas, o = {}) => overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.05, size: 84, y: 280 }, o));
