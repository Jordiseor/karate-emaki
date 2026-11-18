// KARATE EMAKI · overlays 2D de la pieza «seiza»: cronómetro 1:00 / 10:00, gota de sudor, puntos rojos de hormigueo.
// Se dibujan sobre el lienzo DESPUÉS de esc.dibujar(ctx). Necesita marca.js cargado antes. Deterministas (solo dependen de t).
// Rojo #C8102E solo para el «minuto 10» y el hormigueo (dato clave), como pide el storyboard.
import { cronometro, COL } from './ciencia2d.js';
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const fr = (x) => x - Math.floor(x);

// Cronómetro de seiza. o: { minutos: 1 | 10 (o valor en segundos), x: 540, y: 1430, size: 96, rojo: false (10:00 en rojo), alfa, t }
// minutos 1 → «1:00»; minutos 10 → «10:00». Es un reloj parado en esa cifra (el chiste es el corte, no la cuenta).
export function cronometroSeiza(ctx, o = {}) {
  const seg = o.valor ?? (o.minutos ?? 1) * 60;
  cronometro(ctx, { x: o.x ?? 540, y: o.y ?? 1430, size: o.size ?? 96, valor: seg, tipo: 'mmss', rojo: o.rojo ?? seg >= 600, alfa: o.alfa ?? 1, t: o.t ?? 0, parado: o.parado ?? false });
}

// Gota de sudor en un píxel (x, y = donde nace). o: { size: 80, ciclo: 1.3, t0: 0, alfa: 1, caida: 150 }
// Cada ciclo: brota (0–0,25), resbala hacia abajo (0,25–0,85) y se funde. Dos gotas desfasadas si `doble: true`.
export function gotaSudor(ctx, x, y, t, o = {}) {
  const una = (dt) => {
    const c = o.ciclo ?? 1.3, u = fr((t - (o.t0 ?? 0) + dt) / c); if (t - (o.t0 ?? 0) + dt < 0) return;
    const s = (o.size ?? 80) * cl(u / 0.25) * (1 - 0.15 * cl((u - 0.25) / 0.6)), yy = y + (o.caida ?? 150) * cl((u - 0.25) / 0.6) ** 1.6, a = (o.alfa ?? 1) * (1 - cl((u - 0.8) / 0.2));
    if (s < 1 || a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, yy);
    ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.bezierCurveTo(s * 0.18, -s * 0.5, s * 0.5, -s * 0.12, s * 0.5, s * 0.2);
    ctx.bezierCurveTo(s * 0.5, s * 0.62, s * 0.26, s * 0.78, 0, s * 0.78); ctx.bezierCurveTo(-s * 0.26, s * 0.78, -s * 0.5, s * 0.62, -s * 0.5, s * 0.2);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.12, -s * 0.18, -s * 0.5, 0, -s * 0.9); ctx.closePath();
    const g = ctx.createLinearGradient(0, -s * 0.9, 0, s * 0.8); g.addColorStop(0, '#D9ECF5'); g.addColorStop(1, '#8FBFD6');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = Math.max(3, s * 0.07); ctx.strokeStyle = COL.tinta; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-s * 0.18, s * 0.12, s * 0.07, s * 0.16, 0.3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
    ctx.restore();
  };
  una(0); if (o.doble) una(o.ciclo ? o.ciclo * 0.5 : 0.65);
}

// Puntos rojos de hormigueo sobre muslos y pantorrillas del karateka (anclados con k.punto). Parpadean a ritmos distintos.
// o: { intensidad: 1 (0 = nada, se apagan uno a uno al bajar), radio: 17, n: 5 por tramo, jitter: 8 px }
// Uso: seiza2d.hormigueo(ctx, esc, k, t, { intensidad: 1 - U.prog(t, 11, 12.5) })
export function hormigueo(ctx, esc, k, t, o = {}) {
  const I = cl(o.intensidad ?? 1); if (I <= 0) return;
  const rad = o.radio ?? 17, n = o.n ?? 5, rumbo = (k.base ? k.base.rumbo : 0) * Math.PI / 180;
  const lat = k.punto('cadera').clone().set(Math.cos(rumbo), 0, -Math.sin(rumbo)); // eje izquierda del personaje en el mundo
  const cad = k.punto('cadera');
  const tramos = [];
  for (const [L, s] of [['I', 1], ['D', -1]]) {
    const cadJ = cad.clone().addScaledVector(lat, s * 0.092), rod = k.punto('rodilla' + L), tob = k.punto('tobillo' + L);
    tramos.push([cadJ, rod, 0.12, 0.88, L + 'm'], [rod, tob, 0.15, 0.85, L + 'p']);
  }
  ctx.save();
  let idx = 0;
  for (const [a, b, u0, u1, tag] of tramos) for (let i = 0; i < n; i++, idx++) {
    const u = u0 + (u1 - u0) * (n === 1 ? 0.5 : i / (n - 1)), lado = Math.sin(idx * 2.399) * 0.045; // dispersión lateral fija
    const p = a.clone().lerp(b, u).addScaledVector(lat, lado + (tag[1] === 'p' ? 0 : 0));
    const q = esc.proyectar(p); if (!q.delante) continue;
    const fase = (idx * 0.37) % 1, f = 2.2 + (idx % 4) * 0.55;
    // cada punto se apaga en su momento al bajar la intensidad (orden fijo, no aleatorio)
    const vive = cl((I - ((idx * 0.618) % 1) * 0.6) / 0.4);
    const par = Math.max(0, Math.sin(2 * Math.PI * (f * t + fase))), al = vive * (0.15 + 0.85 * par ** 2);
    if (al < 0.03) continue;
    const jx = Math.sin(2 * Math.PI * (3.1 * t + idx)) * (o.jitter ?? 8) * 0.5, jy = Math.cos(2 * Math.PI * (2.7 * t + idx * 0.7)) * (o.jitter ?? 8) * 0.5;
    const r = rad * (0.75 + 0.35 * par) * (0.8 + 0.2 * vive);
    ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(q.x + jx, q.y + jy, r * 1.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(244,239,230,0.9)'; ctx.fill();
    ctx.beginPath(); ctx.arc(q.x + jx, q.y + jy, r, 0, Math.PI * 2); ctx.fillStyle = COL.rojo; ctx.fill();
  }
  ctx.restore();
}
export default { cronometroSeiza, gotaSudor, hormigueo };
