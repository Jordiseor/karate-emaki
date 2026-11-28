import * as C from '../../escenas3d/src/comun.js';
import { FOTO } from './foto.js';
export * from '../../escenas3d/src/comun.js';
export const img = new Image(); export const listo = new Promise((r) => { img.onload = r; img.src = FOTO; });
// Foto circular (885 px = ×2,5 del original). d <= 885 -> nunca más de ×2,5. Sin redibujar.
export function foto(ctx, cx, cy, d, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(26,26,26,.28)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.drawImage(img, cx - d / 2, cy - d / 2, d, d); ctx.restore();
}
// Recorte de ojos: misma imagen, región 190 px de la versión x2,5 (=76 px originales) mostrada a d px (<= x2,5 sobre el original si d<=475)
export function ojos(ctx, cx, cy, d, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.clip();
  ctx.drawImage(img, 230, 90, 190, 190, cx - d / 2, cy - d / 2, d, d); ctx.restore();
  ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 8; ctx.strokeStyle = C.TINTA; ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.stroke(); ctx.restore();
}
export function flecha(ctx, x0, y0, x1, y1, p) {
  if (p <= 0) return; const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, an = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = C.ROJO; ctx.fillStyle = C.ROJO; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - 30 * Math.cos(an), y - 30 * Math.sin(an)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 56 * Math.cos(an - .45), y - 56 * Math.sin(an - .45)); ctx.lineTo(x - 56 * Math.cos(an + .45), y - 56 * Math.sin(an + .45)); ctx.fill(); ctx.restore();
}
// Tarjeta que cambia: lista de [desde, líneas]
export function tarjetas(ctx, t, lista, y = 300) {
  let k = -1; lista.forEach((e, i) => { if (t >= e[0]) k = i; }); if (k < 0) return;
  C.tarjeta(ctx, t - lista[k][0], lista[k][1], { t0: 0.05, y });
}
export function fig3d(opc) { // karateka/siluetas sobre papel con multiply
  const { esc } = opc; const off = document.createElement('canvas'); off.width = 1080; off.height = 1920; const o = off.getContext('2d');
  return (ctx, a = 1) => { o.clearRect(0, 0, 1080, 1920); esc.dibujar(o, { vineta: false, grano: false }); ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(off, 0, 0); ctx.restore(); };
}
