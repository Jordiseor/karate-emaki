// Pictograma 2D de látigo: mango (x0,y0) -> punta. Onda que viaja del mango a la punta. p: 0..1 progreso de la onda.
import { TINTA, ROJO } from './comun.js';
export function latigo(ctx, { x0, y0, x1, y1, p, amp = 90, alfa = 1, restalla = 0, grosor = 12 }) {
  const N = 60, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, fr = p * 1.25 - s;                 // frente de onda en s = p*1.25
    const env = Math.exp(-Math.pow((fr - 0.12) / 0.22, 2)) * (0.3 + 0.9 * s);
    const o = amp * env * Math.sin(fr * 14) ;
    pts.push([x0 + dx * s + nx * o, y0 + dy * s + ny * o, env]);
  }
  ctx.save(); ctx.globalAlpha = alfa; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = TINTA; ctx.lineWidth = grosor; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  // tramo de la ola en rojo (solo al viajar la onda)
  ctx.strokeStyle = ROJO; ctx.lineWidth = grosor + 2; ctx.beginPath(); let on = false;
  pts.forEach(([x, y, e]) => { if (e > 0.35) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; }); ctx.stroke();
  // mango
  ctx.strokeStyle = TINTA; ctx.lineWidth = grosor * 2.6; ctx.beginPath(); ctx.moveTo(x0 - dx / L * 90, y0 - dy / L * 90); ctx.lineTo(x0, y0); ctx.stroke();
  const [tx, ty] = pts[N];
  if (restalla > 0) { ctx.strokeStyle = ROJO; ctx.lineWidth = 10; ctx.globalAlpha = alfa * restalla;
    for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4, r1 = 30 + 40 * (1 - restalla), r2 = r1 + 40; ctx.beginPath(); ctx.moveTo(tx + Math.cos(an) * r1, ty + Math.sin(an) * r1); ctx.lineTo(tx + Math.cos(an) * r2, ty + Math.sin(an) * r2); ctx.stroke(); } }
  ctx.restore(); return { x: tx, y: ty };
}
export function mano(ctx, x, y, alfa = 1) { // mano en tinta que agarra el mango
  ctx.save(); ctx.globalAlpha = alfa; ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(x - 70, y - 50, 120, 100, 40); ctx.fill();
  ctx.fillRect(x - 260, y - 30, 200, 60); ctx.restore();
}
