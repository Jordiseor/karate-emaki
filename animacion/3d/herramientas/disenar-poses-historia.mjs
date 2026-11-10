#!/usr/bin/env node
// KARATE EMAKI · poses 3D de las piezas de historia (alumnos y el maestro) → animacion/3d/poses/*.json
// Mismo método que disenar-poses.mjs: los brazos salen de objetivos (dónde va la mano), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses-historia.mjs [nombre…]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Karateka3D, THREE } from '../karateka3d.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(AQUI, '..', 'poses');
const k = new Karateka3D({ sombras: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const leer = (n) => JSON.parse(fs.readFileSync(path.join(DIR, n + '.json'), 'utf8'));
const limpiar = (p) => { const o = structuredClone(p); delete o.nombre; delete o.descripcion; delete o.medidas; return o; };
const r1 = (x) => Math.round(x * 10) / 10;
const redondear = (p) => JSON.parse(JSON.stringify(p, (key, v) => (typeof v === 'number' ? r1(v) : v)));

function nelderMead(f, x0, paso = 8, iter = 3000) {
  const n = x0.length; let S = [x0.slice()];
  for (let i = 0; i < n; i++) { const x = x0.slice(); x[i] += paso; S.push(x); }
  let F = S.map(f);
  for (let it = 0; it < iter; it++) {
    const ord = F.map((v, i) => i).sort((a, b) => F[a] - F[b]); S = ord.map((i) => S[i]); F = ord.map((i) => F[i]);
    if (F[n] - F[0] < 1e-12) break;
    const c = Array(n).fill(0); for (let i = 0; i < n; i++) for (let d = 0; d < n; d++) c[d] += S[i][d] / n;
    const mv = (a, t) => c.map((v, d) => v + t * (a[d] - v));
    const xr = mv(S[n], -1), fr = f(xr);
    if (fr < F[0]) { const xe = mv(S[n], -2), fe = f(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
    else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
    else { const xc = mv(S[n], 0.5), fc = f(xc); if (fc < F[n]) { S[n] = xc; F[n] = fc; } else { for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, d) => S[0][d] + 0.5 * (v - S[0][d])); F[i] = f(S[i]); } } }
  }
  const ib = F.indexOf(Math.min(...F)); return { x: S[ib], f: F[ib] };
}
const optimizar = (f, x0, vueltas = 5) => { let r = { x: x0, f: f(x0) }; for (let v = 0; v < vueltas; v++) { const p = nelderMead(f, r.x, 10 / (v + 1)); if (p.f <= r.f) r = p; } return r; };
const W = (g, x = 0, y = 0, z = 0) => V(x, y, z).applyMatrix4(g.matrixWorld);
// op: opciones de aplicarPose (p. ej. { suelo:false, altura }) ; mano: Vector3 objetivo (mundo, personaje en el origen mirando a +Z)
function brazo(pose, L, { mano, codoDir, pesoCodo = 2, x0 = [30, 10, 0, 60], op = {} }) {
  const coste = (v) => {
    const p = structuredClone(pose); p['brazo' + L] = { adelante: v[0], abre: v[1], gira: v[2] }; p['codo' + L] = v[3];
    k.aplicarPose(p, op);
    const m = W(k.j['muneca' + L], 0, -0.05, 0); let c = m.distanceToSquared(mano) * 400;
    if (codoDir) { const s = W(k.j['hombro' + L]), d = W(k.j['codo' + L]).sub(s).normalize(); c += d.distanceToSquared(codoDir) * pesoCodo; }
    c += (v[3] < 0 ? v[3] * v[3] : 0) * 0.01 + (v[3] > 150 ? (v[3] - 150) ** 2 : 0) * 0.01 + (Math.abs(v[2]) > 90 ? (Math.abs(v[2]) - 90) ** 2 * 0.01 : 0);
    return c;
  };
  const r = optimizar(coste, x0);
  pose['brazo' + L] = { adelante: r.x[0], abre: r.x[1], gira: r.x[2] }; pose['codo' + L] = r.x[3];
  k.aplicarPose(pose, op);
  return +Math.sqrt(r.f / 400).toFixed(3);
}

const PIES = limpiar(leer('pies-juntos')), YOI = limpiar(leer('yoi')), ZK = limpiar(leer('zenkutsu-dachi'));
const piernasDe = (p) => Object.fromEntries(Object.entries(p).filter(([q]) => /^(pierna|rodilla|tobillo|cadera)/.test(q)));
// seiza: muslos horizontales hacia delante, rodillas dobladas del todo, empeines en el suelo (aplicar con suelo:false, altura: SEIZA_ALTURA)
const SEIZA = { piernaI: { adelante: 72, abre: 8, gira: 0 }, piernaD: { adelante: 72, abre: 8, gira: 0 }, rodillaI: 162, rodillaD: 162, tobilloI: { flex: -90 }, tobilloD: { flex: -90 } };
const SEIZA_ALTURA = -0.62;

const POSES = {
  'zenkutsu-bajo-misma-base': () => {
    const p = structuredClone(ZK);
    p.piernaI = { ...p.piernaI, adelante: 62.57 }; p.rodillaI = 86.74; p.tobilloI = { ...p.tobilloI, flex: 20.41 };
    p.piernaD = { ...p.piernaD, adelante: -45.44 }; p.rodillaD = 0.05; p.tobilloD = { ...p.tobilloD, flex: 36.05 };
    return { p, desc: 'Zenkutsu-dachi bajo con la MISMA base que zenkutsu-dachi (≈1 m): la cadera baja doblando más la rodilla delantera (espinilla adelantada) en vez de alargar la postura. Ángulos dados por el Sensei; resto como zenkutsu-dachi.' };
  },
  rei: () => {
    const p = { ...structuredClone(PIES), tronco: { inclina: 30 }, cabeza: { inclina: 8 }, manoI: 1, manoD: 1, munecaI: { flex: -5 }, munecaD: { flex: -5 } };
    const e = [brazo(p, 'I', { mano: V(0.12, 0.76, 0.24), codoDir: V(0.1, -0.8, 0.5).normalize(), x0: [20, 5, 0, 15] }), brazo(p, 'D', { mano: V(-0.12, 0.76, 0.24), codoDir: V(-0.1, -0.8, 0.5).normalize(), x0: [20, 5, 0, 15] })];
    return { p, e, desc: 'Rei (saludo de pie): pies juntos, tronco inclinado 30° hacia delante, manos abiertas resbalando por la parte delantera de los muslos. Para animar el saludo: mezclar(P["pies-juntos"], P.rei, f).' };
  },
  'cargar-viga': () => {
    const p = { ...piernasDe(YOI), tronco: { inclina: 2, ladeo: 4 }, cabeza: { ladeo: 9, giro: 4 }, manoI: 0, manoD: 0, munecaI: { gira: -20 }, munecaD: { gira: 20 } };
    const e = [brazo(p, 'D', { mano: V(-0.17, 1.47, 0.2), codoDir: V(-0.35, -0.4, 0.85).normalize(), x0: [80, 20, 0, 110] }),
      brazo(p, 'I', { mano: V(-0.15, 1.44, 0.42), codoDir: V(0.15, -0.55, 0.8).normalize(), x0: [80, -10, 0, 70] })];
    return { p, e, desc: 'Cargar una viga sobre el hombro DERECHO con las dos manos: la viga va hacia delante (eje +Z del personaje) a ≈1,52 m de altura y x ≈ −0,17. Con historia3d: viga.alHombro(k).' };
  },
  'brazos-arriba': () => {
    const p = { ...piernasDe(YOI), cabeza: { inclina: -14 }, manoI: 1, manoD: 1, munecaI: { flex: 10 }, munecaD: { flex: 10 } };
    const e = [brazo(p, 'I', { mano: V(0.22, 1.84, 0.14), codoDir: V(0.4, 0.85, 0.2).normalize(), x0: [150, 20, 0, 20] }), brazo(p, 'D', { mano: V(-0.22, 1.84, 0.14), codoDir: V(-0.4, 0.85, 0.2).normalize(), x0: [150, 20, 0, 20] })];
    return { p, e, desc: 'Brazos arriba para colgar o levantar un rótulo: manos abiertas a ≈1,84 m (brazos casi estirados), a 0,44 m entre sí; mirada arriba.' };
  },
  'maestro-seiza-pincel': () => {
    const op = { suelo: false, altura: SEIZA_ALTURA };
    const p = { ...SEIZA, cadera: {}, tronco: { inclina: 10 }, cabeza: { inclina: 16 }, manoI: 1, manoD: 0, munecaD: { flex: 15, gira: 10 }, munecaI: { flex: 25 } };
    const e = [brazo(p, 'D', { mano: V(-0.08, 0.43, 0.5), codoDir: V(-0.45, -0.7, 0.4).normalize(), x0: [40, 20, 0, 80], op }),
      brazo(p, 'I', { mano: V(0.2, 0.37, 0.46), codoDir: V(0.4, -0.75, 0.4).normalize(), x0: [40, 15, 0, 50], op })];
    return { p, e, op, desc: 'El maestro en seiza ante la mesita baja (tablero a 0,33 m, centro a 0,55 m delante): mano derecha con el pincel sobre el papel, mano izquierda abierta sujetando el papel. Aplicar con { suelo:false, altura: -0.62 } (lo hace crearMaestro).' };
  },
  'maestro-pie-escribiendo': () => {
    const p = { ...piernasDe(PIES), tronco: { inclina: 3 }, cabeza: { inclina: 4 }, manoI: 0, manoD: 0, munecaD: { flex: 10 } };
    const e = [brazo(p, 'D', { mano: V(-0.08, 1.42, 0.5), codoDir: V(-0.55, -0.5, 0.65).normalize(), x0: [80, 25, 0, 50] }),
      brazo(p, 'I', { mano: V(0.03, 1.0, -0.2), codoDir: V(0.7, -0.4, -0.5).normalize(), x0: [-30, 20, 0, 90] })];
    return { p, e, desc: 'El maestro de pie escribiendo en un papel colgado (a ≈0,6 m delante, centro a ≈1,4 m): pincel en la mano derecha, mano izquierda a la espalda.' };
  },
  'maestro-manos-atras': () => {
    const p = { ...piernasDe(PIES), tronco: { inclina: 2 }, cabeza: { inclina: 3 }, manoI: 1, manoD: 0 };
    const e = [brazo(p, 'D', { mano: V(-0.02, 0.98, -0.21), codoDir: V(-0.7, -0.4, -0.5).normalize(), x0: [-30, 20, 0, 90] }),
      brazo(p, 'I', { mano: V(0.03, 0.99, -0.22), codoDir: V(0.7, -0.4, -0.5).normalize(), x0: [-30, 20, 0, 90] })];
    return { p, e, desc: 'El maestro de pie, quieto, con las manos juntas a la espalda (mano derecha en puño dentro de la izquierda).' };
  }
};

const pedidas = process.argv.slice(2);
for (const n of Object.keys(POSES).filter((n) => !pedidas.length || pedidas.includes(n))) {
  const r = POSES[n]();
  const pose = Object.assign({ nombre: n, descripcion: r.desc }, redondear(r.p));
  if (r.op) pose.aplicar = r.op;
  fs.writeFileSync(path.join(DIR, n + '.json'), JSON.stringify(pose, null, 1) + '\n');
  console.log(n, 'error de manos (m):', JSON.stringify(r.e || []));
}
