#!/usr/bin/env node
// KARATE EMAKI · poses de 2026-11-16b (cinturón de judo y kumite WKF) → animacion/3d/poses/*.json
// Mismo método que disenar-poses.mjs: el brazo sale de objetivos (dirección del puñetazo, palma abajo), no a ojo.
// Uso: node animacion/3d/herramientas/disenar-poses-2026-11b.mjs [nombre…]
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

// ---------- patadas ----------
// Optimiza el cuerpo para que el tobillo de la pierna que patea llegue a `obj` y el pie de apoyo quede plano.
function patada({ obj, giroApoyo = 100, ini, libres }) {
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
    const t = k.punto('tobilloD').distanceToSquared(obj) * 800;
    const plano = (k.punto('talonI').y - k.punto('puntaI').y) ** 2 * 300;
    const gi = Math.max(0, giroApoyo - Math.abs(rumboI())) ** 2 * 1e-3;
    const lim = v.reduce((s, x, i) => s + (libres.lim && libres.lim[i] ? Math.max(0, x - libres.lim[i][1]) ** 2 + Math.max(0, libres.lim[i][0] - x) ** 2 : 0), 0) * 0.02;
    const reg = (v[6] ** 2 * 1e-4) + ((v[7]) < 0 ? v[7] ** 2 : 0);
    return t + plano + gi + lim + reg;
  };
  const r = optimizar(coste, ini, 6);
  const p = mk(r.x); k.aplicarPose(p, {});
  return { p, e: +Math.sqrt(k.punto('tobilloD').distanceToSquared(obj)).toFixed(3), x: r.x, rumbo: +rumboI().toFixed(0), plano: +(k.punto('talonI').y - k.punto('puntaI').y).toFixed(3) };
}

// objetivos de las patadas (personaje en el origen mirando a +Z). Cabeza de ao en kamae ≈ 1,57 m.
const OBJ = { mawashi: V(-0.20, 1.46, 0.60), mae: V(-0.12, 1.00, 0.78) };
const LIM_MAW = [[-10, 80], [-60, 40], [0, 35], [-30, 10], [0, 105], [0, 90], [-30, 90], [0, 90], [-30, 8], [-20, 40], [0, 30], [-20, 40], [0, 40], [-30, 30], [-15, 15]];

const POSES = {
  'atar-cinturon': () => {
    const p = base({ tronco: { inclina: 3 }, cabeza: { inclina: 10 } });
    const r = manosAl(p, { x: 0.2, y: NUDO.y - 0.03, z: NUDO.z + 0.1, abierta: false, codoX: 0.36, codoY: NUDO.y + 0.06, codoZ: NUDO.z - 0.12, normal: V(0, 1, 0) });
    return { p, ...r, desc: 'Atarse el cinturón (planos 1 y 11): piernas de yoi, las dos manos cerradas a los lados del nudo, algo por debajo y 0,2 m a cada lado, tirando de los extremos hacia fuera; codos abiertos. Con k.cinturon(color) y k.aplicarPose(p, { cinta: { x: 0.2, z: 0 } }) las caídas se balancean. Animar el tirón: mezclar(yoi, atar-cinturon, f) o mover las manos con { ...pose, brazoI/D } si hace falta más recorrido.' };
  },
  'pasar-objeto': () => {
    const p = base({ tronco: { inclina: 10 }, cabeza: { inclina: 6 } });
    const r = manosAl(p, { x: 0.12, y: NUDO.y + 0.2, z: 0.46, abierta: true, codoX: 0.2, codoY: NUDO.y + 0.12, codoZ: 0.12, normal: V(0, 1, 0), codo0: 40 });
    return { p, ...r, desc: 'Ofrecer un objeto con las dos manos (plano 8, silueta de Kanō): yoi, leve inclinación de 10°, brazos extendidos al frente a la altura del ombligo, palmas arriba, manos separadas 0,24 m. Usar con crearCinturonSuelto().entre(manoI, manoD) y recibir en el otro personaje (rumbo 180).' };
  },
  'recibir': () => {
    const p = base({ tronco: { inclina: 14 }, cabeza: { inclina: 8 } });
    const r = manosAl(p, { x: 0.09, y: NUDO.y + 0.12, z: 0.34, abierta: true, codoX: 0.17, codoY: NUDO.y + 0.05, codoZ: 0.06, normal: V(0, 1, 0), codo0: 70 });
    return { p, ...r, desc: 'Recibir con las dos manos (plano 8, silueta de Funakoshi): yoi, inclinación de 14° (respeto), manos abiertas con las palmas arriba, juntas (0,18 m), codos pegados al cuerpo. Al otro lado del objeto: pasar-objeto a 0,85 m, de frente (rumbo 180).' };
  },
  'mawashi-geri-jodan': () => {
    const ini = [40, 20, 15, -8, 70, 50, 20, 20, 20, 5, 5, 40, 14, 0, 0];
    const r = patada({ obj: OBJ.mawashi, giroApoyo: 100, ini, libres: { lim: LIM_MAW } });
    G.maw = r;
    return { p: r.p, e: r.e, c: r.plano, desc: 'Mawashi-geri jōdan (patada circular a la cabeza) con la pierna derecha desde kamae hidari: el tobillo derecho queda en (-0,20; 1,46; 0,60) respecto al pie de apoyo, a la altura de la cabeza de ao en kamae, y se detiene (control). Pie de apoyo girado ≈ ' + r.rumbo + '°, cuerpo inclinado hacia el lado contrario. Poses de un instante: usar mezclar(kamae, mawashi-geri-prep, f) → mezclar(prep, mawashi-geri-jodan, f). Alinear al rival con alinearRival() de kumite3d.js.' };
  },
  'mae-geri-chudan': () => {
    const ini = [10, 0, 5, -4, 80, 5, 0, 20, -10, 5, 5, 10, 14, 0, 0];
    const r = patada({ obj: OBJ.mae, giroApoyo: 0, ini, libres: { lim: LIM_MAW.map((q, i) => (i === 1 || i === 2 ? [-20, 20] : i === 3 ? [-8, 6] : i === 4 ? [0, 80] : q)) } });
    G.mae = r;
    return { p: r.p, e: r.e, c: r.plano, desc: 'Mae-geri chūdan (patada frontal al tronco) con la pierna derecha desde kamae hidari: tobillo derecho en (-0,12; 1,00; 0,78) respecto al pie de apoyo, a la altura del tronco de ao. Se detiene sin impacto. Preparación: mae-geri-prep (rodilla arriba).' };
  }
};
// preparaciones (rodilla elevada) y poses de ao / de espalda: se derivan de las anteriores
const DERIVADAS = {
  'mawashi-geri-prep': () => {
    const q = leer('mawashi-geri-jodan'); const p = limpiar(q);
    p.piernaD = { adelante: 55, abre: 55, gira: 25 }; p.rodillaD = 105; p.tobilloD = { flex: 15, ladeo: 0 };
    p.cadera = { giro: p.cadera.giro * 0.7 }; p.tronco = { giro: p.tronco.giro * 0.6, ladeo: p.tronco.ladeo * 0.5, inclina: p.tronco.inclina * 0.5 };
    return { p, desc: 'Preparación del mawashi-geri: la rodilla derecha sube de lado (muslo 55° al frente y 55° abierto, rodilla a 105°), antes de extender la pierna. Mezclar con mawashi-geri-jodan para la patada.' };
  },
  'mae-geri-prep': () => {
    const q = leer('mae-geri-chudan'); const p = limpiar(q);
    p.piernaD = { adelante: 85, abre: 4, gira: 0 }; p.rodillaD = 100; p.tobilloD = { flex: -8, ladeo: 0 };
    return { p, desc: 'Preparación del mae-geri: la rodilla derecha sube al frente (muslo a 85°, rodilla a 100°, espinilla colgando), pie de apoyo y cuerpo como en mae-geri-chudan. Mezclar con mae-geri-chudan para extender.' };
  },
  'kumite-esquiva': () => {
    const p = limpiar(leer('kamae'));
    p.tronco = { giro: -5, inclina: -12 }; p.cabeza = { giro: 38, inclina: 6 };
    p.rodillaI = 30; p.rodillaD = 34; p.cadera = { giro: -35, ladeo: 0 };
    return { p, desc: 'Ao recibe / esquiva (planos 1, 4, 5, 10): kamae con el tronco inclinado 12° hacia atrás, rodillas algo más flexionadas y las dos manos de guardia delante de la cara. Sin casco. Ponerlo con rumbo 180 frente a aka (alinearRival).' };
  },
  'seiza': () => {
    const m = limpiar(leer('maestro-seiza-pincel'));
    const p = { piernaI: m.piernaI, piernaD: m.piernaD, rodillaI: m.rodillaI, rodillaD: m.rodillaD, tobilloI: m.tobilloI, tobilloD: m.tobilloD, cadera: {}, tronco: { inclina: 2 }, cabeza: {},
      brazoI: { adelante: 28, abre: 10, gira: 0 }, brazoD: { adelante: 28, abre: 10, gira: 0 }, codoI: 55, codoD: 55, manoI: 0, manoD: 0, munecaI: {}, munecaD: {} };
    return { p, aplicar: { suelo: false, altura: -0.62 }, desc: 'Seiza (sentado sobre los talones) con las manos cerradas sobre los muslos, para el público sentado (siluetas, sala del Kōdōkan). Aplicar SIEMPRE con k.aplicarPose(P.seiza, { suelo: false, altura: -0.62 }) (o crearSala().publico, que lo hace). Con gi blanco las piernas se cruzan visualmente: usar con k.silueta().' };
  },
  'espalda-tras-patada': () => {
    const p = limpiar(leer('yoi'));
    p.cadera = { giro: 80 }; p.tronco = { giro: 80, inclina: 2 }; p.cabeza = { giro: -150, inclina: 4 };
    p.brazoI = { adelante: 20, abre: 22, gira: 0 }; p.brazoD = { adelante: 20, abre: 22, gira: 0 }; p.codoI = 45; p.codoD = 45; p.manoI = 0; p.manoD = 0;
    return { p, desc: 'Dar la espalda tras la técnica (plano 9, no puntúa): tras la patada, el cuerpo gira unos 160° (cadera 80° + tronco 80°, hacia su izquierda) y queda con la espalda casi hacia ao; la cabeza mira de reojo por encima del hombro (-150°), manos bajadas. Animar mezclar(mae-geri-chudan / mawashi, espalda-tras-patada, f); para rematar el giro entero sube k.colocar(x, z, rumbo + 30).' };
  }
};
const pedidas = process.argv.slice(2);
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
