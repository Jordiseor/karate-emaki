#!/usr/bin/env node
// KARATE EMAKI · poses de 2026-11-16 (hikite y kiai-gallo) → animacion/3d/poses/*.json
// Mismo método que disenar-poses.mjs: el brazo sale de objetivos (dirección del puñetazo, palma abajo), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses-2026-11.mjs [nombre…]
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


// Brazo con IK: la muñeca va a `mano` y el codo (opcional) hacia `codoObj` (mundo). Optimiza brazo{adelante,abre,gira} y codo.
function llegar(pose, L, { mano, codoObj = null, codo0 = 90, pesoCodo = 0.15 }) {
  const coste = (v) => {
    const p = structuredClone(pose); p['brazo' + L] = { adelante: v[0], abre: v[1], gira: v[2] }; p['codo' + L] = Math.max(0, Math.min(150, v[3]));
    k.aplicarPose(p, {});
    let c = W(k.j['muneca' + L], 0, -0.05, 0).distanceToSquared(mano) * 400 + v[2] * v[2] * 1e-5;
    if (codoObj) c += k.punto('codo' + L).distanceToSquared(codoObj) * 400 * pesoCodo;
    return c;
  };
  const r = optimizar(coste, [30, 20, 0, codo0]);
  pose['brazo' + L] = { adelante: r.x[0], abre: r.x[1], gira: r.x[2] }; pose['codo' + L] = Math.max(0, Math.min(150, r.x[3]));
  k.aplicarPose(pose, {});
  return +Math.sqrt(W(k.j['muneca' + L], 0, -0.05, 0).distanceToSquared(mano)).toFixed(3);
}
const ZKP = piernasDe(ZK), YOIP = piernasDe(YOI);
const hikiteD = { brazoD: ZK.brazoD, codoD: ZK.codoD, munecaD: ZK.munecaD };
// base: piernas de zenkutsu, puño derecho (gyaku-zuki) = el de gyaku-zuki-kiai
const GZK = limpiar(leer('gyaku-zuki-kiai'));
const brazoDGZ = { brazoD: GZK.brazoD, codoD: GZK.codoD, munecaD: GZK.munecaD };
const baseZK = (extra) => ({ ...structuredClone(ZKP), tronco: {}, cabeza: { inclina: -4 }, manoI: 0, manoD: 0, ...structuredClone(extra) });
let G = {};
function hombros(p) { k.aplicarPose(p, {}); return { I: k.punto('hombroI').clone(), D: k.punto('hombroD').clone() }; }

const POSES = {
  'hikite-medio': () => {
    const p = baseZK(brazoDGZ); p.munecaI = {};
    const h = hombros(p);
    // el «error»: puño izquierdo a medio camino, a la altura del pecho, delante del costado y con el codo abierto hacia fuera
    const e = llegar(p, 'I', { mano: V(h.I.x - 0.02, h.I.y - 0.2, h.I.z + 0.22), codoObj: V(h.I.x + 0.3, h.I.y - 0.22, h.I.z - 0.12), codo0: 100 });
    const c = orientarPalma(p, 'I', V(0, 1, 0));
    return { p, e, c, desc: 'Error frecuente del hikite: gyaku-zuki con el puño derecho al frente (igual que gyaku-zuki-kiai, mismas piernas de hidari zenkutsu) y el puño izquierdo detenido a medio camino, a la altura del pecho, con el codo abierto hacia fuera. La versión completa (puño en la cadera, codo atrás) es gyaku-zuki-kiai.' };
  },
  'agarre-brazo': () => {
    const p = baseZK({ ...hikiteD }); p.munecaI = {};
    const h = hombros(p);
    p.manoI = 1;
    // mano izquierda abierta al frente, a la altura de la muñeca del rival (brazo extendido), sin tirar
    const e = llegar(p, 'I', { mano: V(h.I.x - 0.03, h.I.y - 0.12, h.I.z + 0.62), codo0: 20 });
    const c = orientarPalma(p, 'I', V(1, 0, 0));
    G.agarre = k.punto('manoI').toArray();
    return { p, e, c, desc: 'Bunkai del hikite, plano 8: mismas piernas de hidari zenkutsu; mano izquierda ABIERTA al frente (altura de hombro menos 0,12 m, brazo casi estirado, palma hacia dentro) lista para agarrar la muñeca de la silueta del rival; mano derecha en el hikite. Siguiente: tiron-cadera con mezclar(P["agarre-brazo"], P["tiron-cadera"], f).' };
  },
  'tiron-cadera': () => {
    const p = baseZK({ ...hikiteD, ...structuredClone(hikiteI) }); p.munecaI = structuredClone(ZK.munecaD);
    return { p, e: 0, c: 1, desc: 'Bunkai del hikite, plano 9: las mismas piernas de hidari zenkutsu; la mano izquierda, ahora CERRADA, ha tirado hasta la cadera (hikite izquierdo, palma arriba, codo atrás). La derecha, en su hikite. Viene de agarre-brazo con mezclar(); el rival se inclina con k.inclinar.' };
  },
  'rival-brazo-extendido': () => {
    // rival frente al karateka (rumbo 180): su brazo derecho se extiende hacia el karateka; piernas de yoi abiertas; usar con silueta
    const p = { ...structuredClone(YOIP), tronco: {}, cabeza: {}, manoI: 0.3, manoD: 0.6, munecaI: {}, munecaD: {} };
    const h = hombros(p);
    const e = llegar(p, 'D', { mano: V(h.D.x, h.D.y - 0.26, h.D.z + 0.62), codo0: 15 });
    p.brazoI = { adelante: 10, abre: 12, gira: 0 }; p.codoI = 20;
    G.rival = k.punto('manoD').toArray();
    return { p, e, c: 1, desc: 'Rival para el bunkai del hikite (usar SIEMPRE con k.silueta("#1A1A1A")): piernas de yoi, brazo derecho extendido al frente a la altura del pecho (muñeca ≈0,62 m delante del hombro), izquierdo caído. Colócalo de cara al karateka: rival.colocar(x, z, 180) de modo que su manoD coincida con la manoI de agarre-brazo (ver colocarRival en el README). Desequilibrio: rival.inclinar(6..10).' };
  },
  'mano-hara': () => {
    const p = { ...structuredClone(YOIP), tronco: {}, cabeza: {}, manoI: 1, manoD: 1 };
    k.aplicarPose(p, {});
    const cad = k.punto('cadera'), nudo = k.punto('nudo');
    // hara: bajo vientre, un palmo por debajo del ombligo (≈ nivel del cinturón − 0,07), pegado al abdomen
    const y = nudo.y - 0.1, z = nudo.z + 0.1;
    const e1 = llegar(p, 'D', { mano: V(-0.03, y, z + 0.03), codoObj: V(-0.2, y + 0.13, z - 0.1), codo0: 100 });
    const e2 = llegar(p, 'I', { mano: V(0.04, y, z + 0.03), codoObj: V(0.2, y + 0.13, z - 0.1), codo0: 100 });
    const c1 = orientarPalma(p, 'D', V(0, 0.3, -1)), c2 = orientarPalma(p, 'I', V(0, 0.3, -1));
    return { p, e: Math.max(e1, e2), c: Math.min(c1, c2), desc: 'Comprobar el hara: piernas de yoi, las dos manos abiertas sobre el bajo vientre (un palmo bajo el ombligo, la izquierda sobre la derecha), codos algo abiertos, tronco vertical. Para el giro de cabeza no hay pose aparte: { ...P["mano-hara"], cabeza: { giro: 35 } }.' };
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

console.log('agarre manoI', G.agarre, 'rival manoD', G.rival);
