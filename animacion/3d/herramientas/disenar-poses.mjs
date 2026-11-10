#!/usr/bin/env node
// KARATE EMAKI · diseña las poses 3D por objetivos técnicos y escribe animacion/3d/poses/*.json.
// Usa el mismo rig que el render (karateka3d.js) y un Nelder-Mead sencillo: los ángulos salen de restricciones
// (pies planos en el suelo, base, espinilla vertical, pierna recta, puños en su sitio…), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses.mjs [nombre…]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Karateka3D, THREE, MEDIDAS } from '../karateka3d.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(AQUI, '..', 'poses');
const D2R = Math.PI / 180;
const k = new Karateka3D({ sombras: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const r1 = (x) => Math.round(x * 10) / 10;

function nelderMead(f, x0, paso = 8, iter = 4000) {
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
function optimizar(f, x0, vueltas = 6) { let r = { x: x0, f: f(x0) }; for (let v = 0; v < vueltas; v++) { const p = nelderMead(f, r.x, 10 / (v + 1)); if (p.f <= r.f) r = p; } return r; }

// --- lectura del rig ---
const W = (g, x = 0, y = 0, z = 0) => V(x, y, z).applyMatrix4(g.matrixWorld);
const ejePie = (L) => { const t = k.j['tobillo' + L], q = t.getWorldQuaternion(new THREE.Quaternion()); return { arriba: V(0, 1, 0).applyQuaternion(q), delante: V(0, 0, 1).applyQuaternion(q) }; };
const d2 = (a, b) => a.distanceToSquared(b);
const dir = (g) => V(Math.sin(g * D2R), 0, Math.cos(g * D2R));

// piernas: vars por lado [adelante, abre, gira, rodilla?, flex, ladeo]
function piernas(pose, v, rodillas) {
  let i = 0; const p = structuredClone(pose);
  for (const L of ['I', 'D']) {
    p['pierna' + L] = { adelante: v[i++], abre: v[i++], gira: v[i++] };
    p['rodilla' + L] = rodillas[L] == null ? v[i++] : rodillas[L];
    p['tobillo' + L] = { flex: v[i++], ladeo: v[i++] };
  }
  return { p, h: v[i] };
}
function resolverPiernas(pose, obj) {
  // obj: { rodillas: {I: n|null, D: n|null}, dx, dz, yaw: {I, D}, espinillaVertical: 'I'|null, xMedio: 0, zCadera: null }
  const nv = 1 + ['I', 'D'].reduce((s, L) => s + (obj.rodillas[L] == null ? 6 : 5), 0);
  const coste = (v) => {
    const { p, h } = piernas(pose, v, obj.rodillas);
    k.aplicarPose(p, { suelo: false, altura: h / 100 });
    const aI = W(k.j.tobilloI), aD = W(k.j.tobilloD);
    let c = 0;
    c += ((aI.y - MEDIDAS.tobillo) ** 2 + (aD.y - MEDIDAS.tobillo) ** 2) * 400;
    c += ((aI.x - aD.x - obj.dx) ** 2 + (aI.z - aD.z - obj.dz) ** 2) * 400;
    c += ((aI.x + aD.x) / 2 - (obj.xMedio || 0)) ** 2 * 100;
    if (obj.zCadera != null) c += (((aI.z + aD.z) / 2) - obj.zCadera) ** 2 * 200;
    for (const L of ['I', 'D']) {
      const e = ejePie(L);
      c += (1 - e.arriba.y) * 40;
      c += d2(e.delante, dir(obj.yaw[L])) * 20;
    }
    if (obj.espinillaVertical) { const L = obj.espinillaVertical, kn = W(k.j['rodilla' + L]), an = W(k.j['tobillo' + L]); c += ((kn.x - an.x) ** 2 + (kn.z - an.z) ** 2) * 400; }
    // pequeña regularización: ángulos moderados
    c += v.slice(0, -1).reduce((s, x) => s + x * x, 0) * 1e-7;
    return c;
  };
  const x0 = Array(nv).fill(0); x0[nv - 1] = obj.h0 || 0;
  const r = optimizar(coste, x0, 10);
  const { p, h } = piernas(pose, r.x, obj.rodillas);
  return { p, h, coste: r.f };
}
// brazo: vars [adelante, abre, gira, codo?]
function resolverBrazo(pose, L, obj) {
  const coste = (v) => {
    const p = structuredClone(pose);
    p['brazo' + L] = { adelante: v[0], abre: v[1], gira: v[2] };
    if (obj.codo == null) p['codo' + L] = v[3];
    k.aplicarPose(p, { suelo: false, altura: obj.h / 100 });
    const m = W(k.j['muneca' + L], 0, -0.05, 0), c0 = W(k.j['codo' + L]);
    let c = d2(m, obj.mano) * 400;
    if (obj.codoDir) { const s = W(k.j['hombro' + L]); const d = c0.clone().sub(s).normalize(); c += d2(d, obj.codoDir) * (obj.pesoCodo || 3); }
    if (obj.codo == null) c += (v[3] < 0 ? v[3] * v[3] : 0) * 0.01 + (v[3] > 150 ? (v[3] - 150) ** 2 : 0) * 0.01;
    return c;
  };
  const x0 = obj.x0 || [20, 10, 0, obj.codo == null ? 30 : undefined].filter((x) => x !== undefined);
  const r = optimizar(coste, x0, 8);
  pose['brazo' + L] = { adelante: r.x[0], abre: r.x[1], gira: r.x[2] };
  if (obj.codo == null) pose['codo' + L] = r.x[3];
  return r.f;
}
function redondear(p) {
  const o = {};
  for (const key in p) { const v = p[key]; o[key] = typeof v === 'number' ? r1(v) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, typeof b === 'number' ? r1(b) : b])) : v; }
  return o;
}
function informe(nombre, p, h) {
  k.aplicarPose(p, { suelo: true });
  const m = k.medidas();
  const mano = (L) => k.punto('mano' + L), kn = (L) => k.punto('rodilla' + L);
  return { base_m: +m.base.toFixed(3), espinillaI_grados: +m.espinillaI.toFixed(1), espinillaD_grados: +m.espinillaD.toFixed(1), tronco_vertical_grados: +m.troncoVertical.toFixed(1), altura_cadera_m: +m.alturaCadera.toFixed(3),
    puno_I: mano('I').toArray().map((x) => +x.toFixed(3)), puno_D: mano('D').toArray().map((x) => +x.toFixed(3)), rodilla_I: kn('I').toArray().map((x) => +x.toFixed(3)) };
}

const POSES = {};

// ---------- yoi (hachiji-dachi, puños delante de los muslos) ----------
POSES.yoi = () => {
  const base = { cadera: {}, tronco: {}, cabeza: {}, manoI: 0, manoD: 0, munecaI: { gira: -20 }, munecaD: { gira: -20 } };
  const L = resolverPiernas(base, { rodillas: { I: 5, D: 5 }, dx: 0.34, dz: 0, yaw: { I: 28, D: -28 }, zCadera: 0.0 });
  const p = L.p;
  resolverBrazo(p, 'I', { h: L.h, mano: V(0.125, 0.79, 0.165), codo: 28, codoDir: V(0.45, -0.85, -0.25).normalize(), pesoCodo: 1 });
  resolverBrazo(p, 'D', { h: L.h, mano: V(-0.125, 0.79, 0.165), codo: 28, codoDir: V(-0.45, -0.85, -0.25).normalize(), pesoCodo: 1 });
  return { p, h: L.h, desc: 'Yoi (preparado) en hachiji-dachi: pies a la anchura de los hombros con las puntas un poco hacia fuera (≈28°), rodillas relajadas, puños cerrados delante de los muslos a un puño de distancia, codos ligeramente abiertos, mirada al frente.' };
};
// ---------- pies juntos (heisoku-dachi, brazos relajados) ----------
POSES['pies-juntos'] = () => {
  const base = { cadera: {}, tronco: {}, cabeza: {}, manoI: 1, manoD: 1, brazoI: { adelante: 2, abre: 7, gira: 0 }, brazoD: { adelante: 2, abre: 7, gira: 0 }, codoI: 10, codoD: 10 };
  const L = resolverPiernas(base, { rodillas: { I: 0, D: 0 }, dx: 0.1, dz: 0, yaw: { I: 2, D: -2 }, zCadera: 0.0 });
  return { p: L.p, h: L.h, desc: 'Pies juntos (heisoku-dachi): pies paralelos tocándose, piernas rectas, brazos relajados a los lados con las manos abiertas. Base mínima (P1 de los reels de física).' };
};
// ---------- zenkutsu-dachi con gedan-barai (hidari: pie izquierdo delante) ----------
POSES['zenkutsu-dachi'] = () => {
  const base = { cadera: { giro: -42 }, tronco: { giro: -3 }, cabeza: { giro: 43, inclina: 2 }, manoI: 0, manoD: 0, munecaI: { gira: -60, flex: 0 }, munecaD: { gira: 90 } };
  // base 1 m (talón trasero → punta delantera): el tobillo delantero va ≈0,76 m por delante del trasero
  let best = null;
  for (const dz of [0.74, 0.76, 0.78, 0.8]) {
    const L = resolverPiernas(base, { rodillas: { I: null, D: 0 }, dx: 0.22, dz, yaw: { I: 0, D: -32 }, espinillaVertical: 'I', h0: -15 });
    const m = (k.aplicarPose(L.p, { suelo: true }), k.medidas());
    const err = Math.abs(m.base - 1.0) + L.coste;
    if (!best || err < best.err) best = { L, err, m };
  }
  const { L } = best, p = L.p;
  k.aplicarPose(p, { suelo: false, altura: L.h / 100 });
  const rod = W(k.j.rodillaI);
  // gedan-barai: puño ≈ 2 puños por encima de la rodilla delantera, un poco por fuera; brazo casi recto
  resolverBrazo(p, 'I', { h: L.h, mano: V(rod.x + 0.07, rod.y + 0.2, rod.z - 0.02), codo: 12, codoDir: V(0.55, -0.6, 0.55).normalize(), pesoCodo: 0.5, x0: [40, 25, 0] });
  // hikite: puño en la cadera derecha, palma arriba, codo hacia atrás
  const cad = k.j.cadera; cad.updateMatrixWorld(true);
  const hik = V(-0.165, 0.065, 0.0).applyMatrix4(cad.matrixWorld);
  const atras = V(0, 0, -1).applyQuaternion(cad.getWorldQuaternion(new THREE.Quaternion())); atras.y = -0.25; atras.normalize();
  resolverBrazo(p, 'D', { h: L.h, mano: hik, codoDir: atras, pesoCodo: 3, x0: [-30, 10, 0, 100] });
  return { p, h: L.h, desc: 'Hidari zenkutsu-dachi con gedan-barai (pie izquierdo delante). Base ≈1 m (≈4 pies) de talón trasero a punta delantera y anchura de caderas; espinilla delantera vertical (rodilla sobre el tobillo, apuntando como el pie); pierna trasera recta con el pie a ≈30° y el talón en el suelo; tronco vertical; caderas en hanmi (≈45°). Brazo izquierdo casi extendido, puño a dos puños por encima de la rodilla delantera y algo por fuera; puño derecho en hikite en la cadera, palma arriba, codo atrás.' };
};
// ---------- kamae (kumite, hidari) ----------
POSES.kamae = () => {
  const base = { cadera: { giro: -35 }, tronco: { giro: -5, inclina: 3 }, cabeza: { giro: 38, inclina: -2 }, manoI: 0, manoD: 0, munecaI: { gira: -70 }, munecaD: { gira: -80 } };
  const L = resolverPiernas(base, { rodillas: { I: 24, D: 20 }, dx: 0.2, dz: 0.5, yaw: { I: 4, D: -45 }, h0: -6 });
  const p = L.p;
  k.aplicarPose(p, { suelo: false, altura: L.h / 100 });
  const cad = W(k.j.cadera), fw = V(0, 0, 1);
  resolverBrazo(p, 'I', { h: L.h, mano: V(cad.x + 0.07, 1.33, cad.z + 0.44), codoDir: V(0.15, -0.85, 0.5).normalize(), pesoCodo: 2, x0: [70, 10, 0, 80] });
  resolverBrazo(p, 'D', { h: L.h, mano: V(cad.x - 0.0, 1.16, cad.z + 0.24), codoDir: V(-0.2, -0.95, 0.1).normalize(), pesoCodo: 2, x0: [40, 5, 0, 110] });
  void fw;
  return { p, h: L.h, desc: 'Kamae de kumite (hidari): pie izquierdo delante, guardia corta y ágil (≈0,5 m entre tobillos), rodillas flexionadas, pie trasero a ≈45°; caderas medio de lado; puño izquierdo adelantado a la altura de la barbilla con el codo abajo, puño derecho delante del plexo solar.' };
};
// ---------- preparación del gedan-barai (solo brazos; piernas como yoi) ----------
POSES['gedan-barai-prep'] = (yoi) => {
  const p = structuredClone(yoi.p);
  p.cadera = { giro: -10 }; p.tronco = { giro: 8 }; p.cabeza = { giro: 2 };
  p.munecaI = { gira: 80 }; p.munecaD = { gira: -60 };
  resolverBrazo(p, 'I', { h: yoi.h, mano: V(-0.12, 1.55, 0.09), codoDir: V(0.4, -0.5, 0.75).normalize(), pesoCodo: 1, x0: [80, -20, 0, 140] });
  resolverBrazo(p, 'D', { h: yoi.h, mano: V(0.12, 0.88, 0.42), codo: 12, x0: [40, -20, 0] });
  return { p, h: yoi.h, desc: 'Preparación del gedan-barai izquierdo: puño izquierdo junto a la oreja derecha (palma hacia la oreja), brazo derecho extendido hacia abajo y al frente cruzando el cuerpo. Se usa como paso intermedio entre yoi y zenkutsu-dachi con gedan-barai.' };
};

const pedidas = process.argv.slice(2);
const orden = ['yoi', 'pies-juntos', 'zenkutsu-dachi', 'kamae', 'gedan-barai-prep'].filter((n) => !pedidas.length || pedidas.includes(n));
fs.mkdirSync(DIR, { recursive: true });
let yoi = null;
for (const n of orden) {
  if (n === 'gedan-barai-prep' && !yoi) yoi = POSES.yoi();
  const t0 = Date.now();
  const r = n === 'gedan-barai-prep' ? POSES[n](yoi) : POSES[n]();
  if (n === 'yoi') yoi = r;
  const pose = Object.assign({ nombre: n, descripcion: r.desc }, redondear(r.p));
  pose.medidas = informe(n, pose, r.h);
  fs.writeFileSync(path.join(DIR, n + '.json'), JSON.stringify(pose, null, 1) + '\n');
  console.log(n, ((Date.now() - t0) / 1000).toFixed(1) + ' s', JSON.stringify(pose.medidas));
}
