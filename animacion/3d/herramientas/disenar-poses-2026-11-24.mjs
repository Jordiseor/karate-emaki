#!/usr/bin/env node
// KARATE EMAKI · poses de kumite v2 (2026-11-24) → animacion/3d/poses/*.json
// Mismo método que disenar-poses.mjs: el brazo sale de objetivos (dirección del puñetazo, palma abajo), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses-2026-11-24.mjs [nombre…]
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

const YOI = limpiar(leer('yoi')), KAMAE = limpiar(leer('kamae'));
const YOIP = piernasDe(YOI);
const D2R = Math.PI / 180;
const G = {};

// ---------- cinturón de judo: manos en el nudo, manos que ofrecen, manos que reciben ----------
function manosAl(pose, { x, y, z, abierta, codoX, codoY, codoZ, normal, codo0 = 100 }) {
  const e = [], c = [];
  for (const [L, s] of [['I', 1], ['D', -1]]) {
    pose['mano' + L] = abierta ? 1 : 0; pose['muneca' + L] = {};
    e.push(llegar(pose, L, { mano: V(s * x, y, z), codoObj: V(s * codoX, codoY, codoZ), codo0 }));
    c.push(orientarPalma(pose, L, normal));
  }
  return { e: Math.max(...e), c: Math.min(...c) };
}
const base = (extra = {}) => ({ ...structuredClone(YOIP), tronco: {}, cabeza: {}, manoI: 0, manoD: 0, ...extra });
k.aplicarPose(base(), {});
const NUDO = k.punto('nudo').clone();

// ---------- kumite v2: mawashi-geri chudan/jodan rehechos, ao de espaldas ----------
const DRAD = 180 / Math.PI;
function patada({ obj, ini, lim, rodilla = [20, 60], rodillaFuera = 0.12, giroApoyo = 90 }) {
  const brazos = ['brazoI', 'brazoD', 'codoI', 'codoD', 'manoI', 'manoD', 'munecaI', 'munecaD'].reduce((o, n) => ((o[n] = structuredClone(KAMAE[n])), o), {});
  const mk = (v) => ({
    ...brazos,
    cadera: { giro: v[0] }, tronco: { giro: v[1], ladeo: v[2], inclina: v[3] }, cabeza: { giro: -(v[0] + v[1]), inclina: 6 },
    piernaD: { adelante: v[4], abre: v[5], gira: v[6] }, rodillaD: v[7], tobilloD: { flex: v[8], ladeo: 0 },
    piernaI: { adelante: v[9], abre: v[10], gira: v[11] }, rodillaI: v[12], tobilloI: { flex: v[13], ladeo: v[14] }
  });
  const rumboI = () => { const a = k.punto('talonI'), b = k.punto('puntaI'); return Math.atan2(b.x - a.x, b.z - a.z) / D2R; };
  const coste = (v) => {
    const p = mk(v); k.aplicarPose(p, {});
    const A = k.punto('tobilloD'), Kn = k.punto('rodillaD');
    const t = A.distanceToSquared(obj) * 800;
    const plano = (k.punto('talonI').y - k.punto('puntaI').y) ** 2 * 300;
    const gi = Math.max(0, giroApoyo - Math.abs(rumboI())) ** 2 * 1e-3;
    const l = v.reduce((s, x, i) => s + (lim[i] ? Math.max(0, x - lim[i][1]) ** 2 + Math.max(0, lim[i][0] - x) ** 2 : 0), 0) * 0.02;
    const rd = Math.max(0, rodilla[0] - v[7]) ** 2 + Math.max(0, v[7] - rodilla[1]) ** 2;
    // lectura de gancho: la rodilla queda por fuera (x menor) del tobillo
    const fuera = Math.max(0, (Kn.x - A.x) + rodillaFuera) ** 2 * 600;
    const reg = v[6] ** 2 * 1e-4;
    return t + plano + gi + l + rd * 0.02 + fuera + reg;
  };
  const r = optimizar(coste, ini, 7);
  const p = mk(r.x); k.aplicarPose(p, {});
  const A = k.punto('tobilloD'), Kn = k.punto('rodillaD');
  return { p, e: +A.distanceTo(obj).toFixed(3), x: r.x, rumbo: +rumboI().toFixed(0), plano: +(k.punto('talonI').y - k.punto('puntaI').y).toFixed(3), rodilla: +r.x[7].toFixed(0), rodillaX: +(Kn.x - A.x).toFixed(2), cab: k.punto('cabeza').toArray().map((x) => +x.toFixed(2)) };
}
const LIM = [[-10, 80], [-60, 60], [0, 45], [-30, 10], [0, 110], [0, 90], [-30, 90], [0, 90], [-30, 8], [-20, 40], [0, 30], [-20, 40], [0, 40], [-30, 30], [-15, 15]];
const OBJ = { chudan: V(-0.22, 1.02, 0.66), jodan: V(-0.22, 1.50, 0.80) };
const INI = [40, 20, 15, -8, 80, 50, 20, 40, 20, 5, 5, 40, 14, 0, 0];
const POSES = {
  'mawashi-geri-chudan': () => {
    const r = patada({ obj: OBJ.chudan, ini: INI, lim: LIM, rodilla: [25, 60], rodillaFuera: 0.12 }); console.log('chudan', JSON.stringify({ ...r, p: undefined }));
    return { p: r.p, e: r.e, c: r.plano, desc: 'Mawashi-geri chūdan (patada circular al costado/abdomen) con la pierna derecha desde kamae hidari: cadera y pie de apoyo giran, el muslo sale de lado con la rodilla por fuera y la espinilla barre de derecha a izquierda; el tobillo derecho queda en (-0,22; 1,02; 0,66) respecto al pie de apoyo, a la altura del cinturón de ao (empeine ≈ 0,1 m más allá). Preparación: mawashi-geri-prep. Alinear al rival con par.alinear(\'mawashi-geri-chudan\') o (\'mawashi-geri-espalda\').' };
  },
  'mawashi-geri-jodan': () => {
    let r = null; for (const ini of [INI, [20, 30, 30, 0, 100, 40, 40, 30, 20, 5, 5, 40, 14, 0, 0], [10, 45, 25, 9, 127, 30, 93, 28, -27, 0, 1, 42, 0, -25, -1]]) { const q = patada({ obj: OBJ.jodan, ini, lim: LIM, rodilla: [12, 50], rodillaFuera: 0.08 }); if (!r || q.e + q.plano * 0.3 < r.e + r.plano * 0.3) r = q; } console.log('jodan', JSON.stringify({ ...r, p: undefined }));
    return { p: r.p, e: r.e, c: r.plano, desc: 'Mawashi-geri jōdan (v2, 2026-11-24): rodilla por fuera y arriba, espinilla horizontal y empeine a la altura de la cabeza de ao: tobillo derecho en (-0,22; 1,50; 0,68) respecto al pie de apoyo. Se detiene a ≈ 2–5 cm (control). Preparación: mawashi-geri-prep. Alinear con par.alinear(\'mawashi-geri-jodan\').' };
  }
};
const DERIVADAS = {
  'mawashi-geri-prep': () => {
    const p = limpiar(leer('mawashi-geri-chudan'));
    p.piernaD = { adelante: 78, abre: 52, gira: 20 }; p.rodillaD = 112; p.tobilloD = { flex: 20, ladeo: 0 };
    p.cadera = { giro: p.cadera.giro * 0.75 }; p.tronco = { giro: p.tronco.giro * 0.6, ladeo: p.tronco.ladeo * 0.5, inclina: p.tronco.inclina * 0.5 };
    p.cabeza = { giro: -(p.cadera.giro + p.tronco.giro), inclina: 4 };
    return { p, desc: 'Preparación del mawashi-geri (v2): rodilla derecha arriba y de lado a la altura de la cadera (muslo 78° al frente y 52° abierto, rodilla a 112°), espinilla colgando y pie recogido; cadera ya girada ≈ 75 %. Mezclar con mawashi-geri-chudan o mawashi-geri-jodan.' };
  },
  'ao-guardia-alta': () => {
    const p = limpiar(leer('kumite-esquiva'));
    p.brazoI = { adelante: 12, abre: 40, gira: 20 }; p.codoI = 140; p.brazoD = { adelante: 8, abre: 4, gira: -60 }; p.codoD = 140;
    return { p, desc: 'Ao recibe un golpe al cuerpo (gyaku-zuki chūdan, mae-geri): como kumite-esquiva pero con las dos manos pegadas a la cara (codos doblados 140°) para dejar el pecho y el vientre libres; el puño o el pie de aka no atraviesan la guardia. Rumbo 180.' };
  },
  'ao-de-espaldas': () => {
    const p = limpiar(leer('kamae'));
    p.tronco = { giro: 22, inclina: 4 }; p.cabeza = { giro: 70, inclina: 4 }; p.rodillaI = 24; p.rodillaD = 28;
    return { p, desc: 'Ao de medio lado / de espaldas: kamae con las rodillas algo flexionadas, el tronco girado 22° y la cabeza mirando de reojo al rival por encima del hombro izquierdo (70°). Ponerlo con ao.colocar(x, z, rumbo) y rumbo ≈ 45 (mira a la izquierda de aka y le enseña la espalda; 0 = de espaldas puro). par.alinear(\'mawashi-geri-espalda\') lo coloca solo.' };
  }
};
const pedidas = process.argv.slice(2);
if (pedidas.includes('--solo-derivadas')) pedidas.length = 0;
const emitir = (n, r) => {
  const pose = Object.assign({ nombre: n, descripcion: r.desc }, redondear(r.p), r.aplicar ? { aplicar: r.aplicar } : {});
  k.aplicarPose(pose, r.aplicar || {});
  pose.medidas = { puno_D: k.punto('manoD').toArray().map((x) => +x.toFixed(3)), puno_I: k.punto('manoI').toArray().map((x) => +x.toFixed(3)), tobillo_D: k.punto('tobilloD').toArray().map((x) => +x.toFixed(3)), altura_cadera_m: +k.medidas().alturaCadera.toFixed(3) };
  fs.writeFileSync(path.join(DIR, n + '.json'), JSON.stringify(pose, null, 1) + '\n');
  console.log(n, 'error (m):', r.e, 'extra:', r.c, JSON.stringify(pose.medidas));
};
for (const n of Object.keys(POSES).filter((n) => !pedidas.length || pedidas.includes(n))) emitir(n, POSES[n]());
for (const n of Object.keys(DERIVADAS).filter((n) => !pedidas.length || pedidas.includes(n))) emitir(n, { ...DERIVADAS[n](), e: 0, c: 0 });
if (G.maw) console.log('mawashi x', G.maw.x.map((x) => +x.toFixed(1)).join(' '), 'rumbo apoyo', G.maw.rumbo);
if (G.mae) console.log('mae x', G.mae.x.map((x) => +x.toFixed(1)).join(' '), 'rumbo apoyo', G.mae.rumbo);
