#!/usr/bin/env node
// KARATE EMAKI · poses 2026-11-24b (ascensor, puntúa-o-no) → animacion/3d/poses/*.json
// Uso: node animacion/3d/herramientas/disenar-poses-2026-11-24b.mjs [nombre…]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Karateka3D, THREE, espejo } from '../karateka3d.js';

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

const KAMAE = limpiar(leer('kamae')), GZK = limpiar(leer('gyaku-zuki-kiai')), ZEN = limpiar(leer('zenkutsu-dachi')), ZB = limpiar(leer('zenkutsu-bajo')), ESP = limpiar(leer('espalda-tras-patada'));
const D2R = 1 / 57.29578;
const G = {};
const brazosDe = (p) => Object.fromEntries(Object.entries(p).filter(([q]) => /^(brazo|codo|muneca|mano)/.test(q)));
const emitir = (n, r) => {
  const pose = Object.assign({ nombre: n, descripcion: r.desc }, redondear(r.p), r.aplicar ? { aplicar: r.aplicar } : {});
  k.aplicarPose(pose, r.aplicar || {});
  pose.medidas = { puno_D: k.punto('manoD').toArray().map((x) => +x.toFixed(3)), tobillo_I: k.punto('tobilloI').toArray().map((x) => +x.toFixed(3)), tobillo_D: k.punto('tobilloD').toArray().map((x) => +x.toFixed(3)), altura_cadera_m: +k.medidas().alturaCadera.toFixed(3) };
  fs.writeFileSync(path.join(DIR, n + '.json'), JSON.stringify(pose, null, 1) + '\n');
  console.log(n, 'err', r.e, JSON.stringify(pose.medidas));
};
// ---- piernas del paso de enlace (los dos pies planos, tobillos a ±0,115 m, trabajando por optimización) ----
function paso(h, brazos) {
  const mk = (v) => ({ ...brazos, cadera: {}, tronco: {}, cabeza: {}, piernaI: { adelante: v[0], abre: v[6], gira: 0 }, rodillaI: v[1], tobilloI: { flex: v[2], ladeo: 0 }, piernaD: { adelante: v[3], abre: v[6], gira: 0 }, rodillaD: v[4], tobilloD: { flex: v[5], ladeo: 0 } });
  const coste = (v) => {
    const p = mk(v); k.aplicarPose(p, {});
    const aI = k.punto('tobilloI'), aD = k.punto('tobilloD'), hip = k.punto('cadera');
    let c = (hip.y - h) ** 2 * 4000 + (aI.x - 0.115) ** 2 * 800 + (aD.x + 0.115) ** 2 * 800 + (aI.z - 0.05) ** 2 * 800 + (aD.z + 0.07) ** 2 * 800 + (aI.y - aD.y) ** 2 * 2000;
    for (const L of ['I', 'D']) c += (k.punto('talon' + L).y - k.punto('punta' + L).y) ** 2 * 500;
    c += [1, 4].reduce((s, i) => s + Math.max(0, 3 - v[i]) ** 2 + Math.max(0, v[i] - 120) ** 2, 0) * 0.01;
    return c;
  };
  const r = optimizar(coste, [30, 60, 0, 30, 60, 0, 6], 8); const p = mk(r.x); k.aplicarPose(p, {});
  return { p, e: +(Math.sqrt(r.f)).toFixed(3) };
}
// ---- patada baja / barrido (misma maquinaria que mawashi): tobillo D al objetivo ----
function barrer(obj) {
  const b = brazosDe(KAMAE);
  const mk = (v) => ({ ...b, cadera: { giro: v[0] }, tronco: { giro: v[1], ladeo: v[2], inclina: v[3] }, cabeza: { giro: -(v[0] + v[1]) + 38, inclina: 4 }, piernaD: { adelante: v[4], abre: v[5], gira: v[6] }, rodillaD: v[7], tobilloD: { flex: v[8], ladeo: 0 }, piernaI: { adelante: v[9], abre: v[10], gira: v[11] }, rodillaI: v[12], tobilloI: { flex: v[13], ladeo: v[14] } });
  const coste = (v) => {
    const p = mk(v); k.aplicarPose(p, {}); const A = k.punto('tobilloD'), AI = k.punto('tobilloI');
    return A.distanceToSquared(obj) * 800 + ((AI.x - 0.12) ** 2 + (AI.z + 0.1) ** 2) * 600 + (k.medidas().alturaCadera - 0.78) ** 2 * 600 + (k.punto('talonI').y - k.punto('puntaI').y) ** 2 * 300 + Math.max(0, 20 - v[12]) ** 2 * 0.02 + Math.max(0, v[7] - 25) ** 2 * 0.05 + v[6] ** 2 * 1e-4 + Math.max(0, Math.abs(v[0]) - 35) ** 2 * 0.3 + v[1] ** 2 * 0.05 + Math.max(0, Math.abs(v[2]) - 6) ** 2 * 0.5 + v[2] ** 2 * 0.02 + Math.max(0, Math.abs(v[3]) - 5) ** 2 * 0.5 + v[3] ** 2 * 0.02 + Math.max(0, v[8] - 25) ** 2 * 0.05;
  };
  const r = optimizar(coste, [20, 0, 0, 0, 40, 40, 30, 8, 20, 5, 5, 40, 40, 0, 0], 7); const p = mk(r.x); k.aplicarPose(p, {});
  return { p, e: +k.punto('tobilloD').distanceTo(obj).toFixed(3) };
}
// ---- brazo derecho de remate hacia abajo con el tronco inclinado ----
function remate(mano) {
  let mejor = null;
  for (const inc of [60, 70, 80, 90]) {
    const p = { ...structuredClone(ZB), ...brazosDe(GZK), tronco: { inclina: inc }, cabeza: { inclina: -inc * 0.8 } };
    k.aplicarPose(p, {}); const e = llegar(p, 'D', { mano, codo0: 20, pesoCodo: 0 });
    if (!mejor || e < mejor.e) mejor = { p: structuredClone(p), e, inc };
  }
  const q = orientarPalma(mejor.p, 'D', V(0, 0, -1)); console.log('remate inc', mejor.inc, 'palma', q);
  return mejor;
}
const hasta = (o) => o;
const POSES = {
  'oi-zuki-migi': () => {
    const E = espejo(ZEN), p = { ...piernasDe(E), tronco: {}, cadera: {}, cabeza: { inclina: -4 }, ...brazosDe(GZK) };
    return { p, e: 0, desc: 'Oi-zuki a la derecha en migi zenkutsu-dachi (pie derecho delante): piernas = espejo exacto de zenkutsu-dachi, puño DERECHO al frente chūdan (palma abajo; mismo brazo que gyaku-zuki-kiai) y hikite izquierdo en la cadera, tronco vertical. Base 1,01 m, cadera 0,81 m. Rumbo y pies como zenkutsu: para el paso desde la otra pierna usa el pie izquierdo como ancla (pie trasero).' };
  },
  'paso-nivel': () => {
    const r = paso(0.809, brazosDe(GZK)); return { ...r, desc: 'Paso de enlace a nivel (ascensor, versión correcta): los dos pies planos a 0,23 m en lateral, el pie trasero (derecho, 7 cm por detrás del izquierdo) pasando junto al delantero, rodillas dobladas, tronco vertical, cadera a 0,81 m (= zenkutsu-dachi). Brazos como oi-zuki-migi (puño derecho al frente, hikite izquierdo) para mezclar sin saltos: mezclar(P[\'oi-zuki-migi\'], P[\'paso-nivel\'], f).' };
  },
  'paso-alto': () => {
    const r = paso(0.905, brazosDe(GZK)); return { ...r, desc: 'Paso de enlace con subida (el «ascensor» exagerado): misma postura que paso-nivel con las piernas más estiradas; cadera a 0,90 m, ≈ 9 cm más alta que zenkutsu-dachi. Misma planta de pies y mismos brazos: mezclar(P[\'paso-nivel\'], P[\'paso-alto\'], f) solo sube la cadera.' };
  },
  'gyaku-zuki-jodan': () => {
    const p = structuredClone(GZK); p.cabeza = { inclina: -2 };
    const e = llegar(p, 'D', { mano: V(-0.033, 1.5, 0.56), codoObj: null, codo0: 10 });
    return { p, e, desc: 'Gyaku-zuki jōdan frenado: mismas piernas que gyaku-zuki-kiai (hidari zenkutsu), puño derecho al frente a la altura de la cara (y 1,50 m, 0,56 m delante del pie de apoyo), hikite izquierdo. Prep: gyaku-zuki-hanmi. Alinear con par.alinear(\'gyaku-zuki-jodan\') (o \'garganta\').' };
  },
  'espalda-tras-puno': () => {
    const p = { ...piernasDe(GZK), ...brazosDe(ESP), cadera: ESP.cadera, tronco: ESP.tronco, cabeza: ESP.cabeza };
    return { p, e: 0, desc: 'Giro de espaldas tras un puñetazo: parte de gyaku-zuki-kiai (piernas de zenkutsu), cadera 80° + tronco 80° (espalda al rival), cabeza mirando por encima del hombro, brazos recogidos (como espalda-tras-patada). mezclar(P[\'gyaku-zuki-kiai\'], P[\'espalda-tras-puno\'], f) con ao colocado a rumbo 180 + giro; sin piernasFijas: las piernas giran con la cadera.' };
  },
  barrido: () => {
    const r = barrer(V(-0.05, 0.11, 0.62)); return { ...r, desc: 'Barrido (ashi-barai): apoyo en pierna izquierda flexionada, pierna derecha casi extendida barriendo a ras del tatami (tobillo derecho en (-0,05; 0,11; 0,62) respecto al pie de apoyo), tronco algo ladeado, brazos de kamae. Ver README (kumite).' };
  },
  'puno-remate-bajo': () => {
    const r = remate(V(-0.1, 0.33, 0.62)); return { p: r.p, e: r.e, desc: 'Puño de remate hacia un rival caído: zenkutsu bajo, tronco inclinado hacia delante, puño derecho controlado hacia abajo (mano en (-0,10; 0,33; 0,62) respecto al pie de apoyo), hikite izquierdo. Alinear con par.alinear(\'puno-remate-bajo\', { aplicar }) sobre ao caído.' };
  },
  'caido-de-espaldas': () => {
    const p = { ...structuredClone(KAMAE), cadera: {}, tronco: { inclina: 0 }, cabeza: { inclina: 22 }, piernaI: { adelante: 20, abre: 10, gira: 10 }, rodillaI: 30, tobilloI: { flex: -15, ladeo: 0 }, piernaD: { adelante: 14, abre: 12, gira: 10 }, rodillaD: 18, tobilloD: { flex: -10, ladeo: 0 }, brazoI: { adelante: -10, abre: 25, gira: 0 }, codoI: 15, brazoD: { adelante: -5, abre: 30, gira: 0 }, codoD: 10, manoI: 1, manoD: 0, munecaI: {}, munecaD: {} };
    return { p, e: 0, aplicar: { inclinar: -90, suelo: false }, desc: 'Ao tendido de espaldas en el tatami: de pie con las piernas algo sueltas y brazos abiertos, la cabeza levantada. NO se usa sola: kumite3d.tumbar(ao, P, { f }) la tumba (f 0 → 1 = caída de 0° a 90° hacia atrás, apoyando la espalda en el suelo). La cabeza cae hacia atrás del rumbo.' };
  }
};
const pedidas = process.argv.slice(2);
for (const n of Object.keys(POSES).filter((n) => !pedidas.length || pedidas.includes(n))) emitir(n, POSES[n]());
