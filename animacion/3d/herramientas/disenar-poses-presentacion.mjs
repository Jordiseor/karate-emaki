#!/usr/bin/env node
// KARATE EMAKI · poses de la pieza de presentación (kiai en fila) → animacion/3d/poses/*.json
// Mismo método que disenar-poses.mjs: el brazo sale de objetivos (dirección del puñetazo, palma abajo), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses-presentacion.mjs [nombre…]
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
const W = (g, x = 0, y = 0, z = 0) => V(x, y, z).applyMatrix4(g.matrixWorld);

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

// Puñetazo: brazo casi recto (codo `codo`) con el puño en el punto `mano` (mundo; personaje en el origen mirando a +Z).
function punetazo(pose, L, { mano, codo = 4 }) {
  pose['codo' + L] = codo;
  const coste = (v) => {
    const p = structuredClone(pose); p['brazo' + L] = { adelante: v[0], abre: v[1], gira: v[2] };
    k.aplicarPose(p, {});
    return W(k.j['muneca' + L], 0, -0.05, 0).distanceToSquared(mano) * 400 + v[2] * v[2] * 1e-5;
  };
  const r = optimizar(coste, [80, -10, 0]);
  pose['brazo' + L] = { adelante: r.x[0], abre: r.x[1], gira: r.x[2] };
  return +Math.sqrt(r.f / 400).toFixed(3);
}
// gira la muñeca para que la palma del puño mire hacia `normal` (en el marco de la muñeca la palma mira a -s·X)
function orientarPalma(pose, L, normal) {
  const s = L === 'I' ? 1 : -1; let mejor = null;
  for (let g = -180; g <= 180; g += 2) {
    const p = structuredClone(pose); p['muneca' + L] = { ...(p['muneca' + L] || {}), gira: g };
    k.aplicarPose(p, {});
    const q = k.j['muneca' + L].getWorldQuaternion(new THREE.Quaternion()), c = V(-s, 0, 0).applyQuaternion(q).dot(normal);
    if (!mejor || c > mejor.c) mejor = { g, c };
  }
  pose['muneca' + L] = { ...(pose['muneca' + L] || {}), gira: mejor.g };
  return +mejor.c.toFixed(2);
}
const piernasDe = (p) => Object.fromEntries(Object.entries(p).filter(([q]) => /^(pierna|rodilla|tobillo|cadera)/.test(q)));
const YOI = limpiar(leer('yoi')), ZK = limpiar(leer('zenkutsu-dachi'));
// hikite izquierdo = el hikite derecho del zenkutsu-dachi en espejo (el rig es simétrico: mismos valores)
const hikiteI = { brazoI: ZK.brazoD, codoI: ZK.codoD, munecaI: ZK.munecaD };

function zuki(piernas, { tronco = {}, cabeza = {} }) {
  const p = { ...structuredClone(piernas), tronco, cabeza, manoI: 0, manoD: 0, ...structuredClone(hikiteI), munecaD: {} };
  k.aplicarPose(p, {});
  const hombro = k.punto('hombroD');
  // chūdan: puño delante del centro del cuerpo, un poco por debajo del hombro, brazo casi estirado
  const e = punetazo(p, 'D', { mano: V(-0.02, hombro.y - 0.1, hombro.z + 0.6) });
  const c = orientarPalma(p, 'D', V(0, -1, 0));
  return { p, e, c };
}

const POSES = {
  'choku-zuki-kiai': () => {
    const r = zuki(piernasDe(YOI), { cabeza: { inclina: -4 } });
    return { ...r, desc: 'Kiai con choku-zuki (puñetazo recto) desde yoi: piernas de yoi (hachiji-dachi, sin mover los pies), puño derecho al frente a la altura del plexo (chūdan) con el brazo casi estirado y la palma abajo, hikite izquierdo en la cadera con la palma arriba, barbilla un poco arriba. Para la fila del plano 7: mezclar(P.yoi, P["choku-zuki-kiai"], f) + cara({ grito }).' };
  },
  'gyaku-zuki-kiai': () => {
    const r = zuki(piernasDe(ZK), { cabeza: { inclina: -4 } });
    return { ...r, desc: 'Gyaku-zuki con kiai en hidari zenkutsu-dachi (piernas iguales que zenkutsu-dachi): puño derecho (el contrario a la pierna delantera) al frente, chūdan, palma abajo; hikite izquierdo en la cadera, palma arriba; caderas y tronco al frente.' };
  }
};

const pedidas = process.argv.slice(2);
for (const n of Object.keys(POSES).filter((n) => !pedidas.length || pedidas.includes(n))) {
  const r = POSES[n]();
  const pose = Object.assign({ nombre: n, descripcion: r.desc }, redondear(r.p));
  k.aplicarPose(pose, {});
  pose.medidas = { puno_D: k.punto('manoD').toArray().map((x) => +x.toFixed(3)), puno_I: k.punto('manoI').toArray().map((x) => +x.toFixed(3)), altura_cadera_m: +k.medidas().alturaCadera.toFixed(3) };
  fs.writeFileSync(path.join(DIR, n + '.json'), JSON.stringify(pose, null, 1) + '\n');
  console.log(n, 'error del puño (m):', r.e, 'palma abajo (cos):', r.c, JSON.stringify(pose.medidas));
}
