#!/usr/bin/env node
// KARATE EMAKI · poses de 2026-11-18 (tiempo de contacto + seiza) → animacion/3d/poses/*.json
//   empuje-recto, encoge-hombros            (tiempo-contacto)
//   seiza-alto, en-cuclillas-medio, levantarse-vacilando, manos-rodillas   (seiza)
// Mismo método que disenar-poses-2026-11b.mjs: brazos por IK, pies planos por búsqueda, altura de la cadera por apoyo.
// Uso: node animacion/3d/herramientas/disenar-poses-2026-11-18.mjs [nombre…]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Karateka3D, THREE } from '../karateka3d.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(AQUI, '..', 'poses');
const k = new Karateka3D({ sombras: false });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const leer = (n) => JSON.parse(fs.readFileSync(path.join(DIR, n + '.json'), 'utf8'));
const limpiar = (p) => { const o = structuredClone(p); delete o.nombre; delete o.descripcion; delete o.medidas; delete o.aplicar; return o; };
const r1 = (x) => Math.round(x * 10) / 10;
const redondear = (p) => JSON.parse(JSON.stringify(p, (key, v) => (typeof v === 'number' ? r1(v) : v)));
const W = (g, x = 0, y = 0, z = 0) => V(x, y, z).applyMatrix4(g.matrixWorld);
const D2R = Math.PI / 180;

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
// Brazo con IK: la muñeca va a `mano` (mundo) y el codo hacia `codoObj` (opcional)
function llegar(pose, L, { mano, codoObj = null, codo0 = 90, pesoCodo = 0.15, op = {}, ini = [30, 20, 0] }) {
  const coste = (v) => {
    const p = structuredClone(pose); p['brazo' + L] = { adelante: v[0], abre: v[1], gira: v[2] }; p['codo' + L] = Math.max(0, Math.min(150, v[3]));
    k.aplicarPose(p, op);
    let c = W(k.j['muneca' + L], 0, -0.05, 0).distanceToSquared(mano) * 400 + v[2] * v[2] * 1e-5;
    if (codoObj) c += k.punto('codo' + L).distanceToSquared(codoObj) * 400 * pesoCodo;
    return c;
  };
  const r = optimizar(coste, [...ini, codo0]);
  pose['brazo' + L] = { adelante: r.x[0], abre: r.x[1], gira: r.x[2] }; pose['codo' + L] = Math.max(0, Math.min(150, r.x[3]));
  k.aplicarPose(pose, op);
  return +Math.sqrt(W(k.j['muneca' + L], 0, -0.05, 0).distanceToSquared(mano)).toFixed(3);
}
// pie plano: busca tobillo.flex que deja talón y punta a la misma altura
function piePlano(pose, L) {
  let mejor = null;
  for (let f = -60; f <= 60; f += 0.5) {
    pose['tobillo' + L] = { flex: f, ladeo: 0 }; k.aplicarPose(pose, {});
    const e = Math.abs(k.punto('talon' + L).y - k.punto('punta' + L).y);
    if (!mejor || e < mejor.e) mejor = { f, e };
  }
  pose['tobillo' + L] = { flex: mejor.f, ladeo: 0 };
}
// altura de la cadera para sentarse/arrodillarse: la rodilla a 0,15 m (misma regla que P.seiza con altura -0,62)
function alturaRodilla(p) { k.aplicarPose(p, { suelo: false, altura: 0 }); return +(0.15 - (k.punto('rodillaI').y + k.punto('rodillaD').y) / 2).toFixed(3); }

const G = {};
const SEIZA = leer('seiza'), GYAKU = limpiar(leer('gyaku-zuki-kiai'));
const BRAZOS_REL = { brazoI: { adelante: 6, abre: 8, gira: 0 }, brazoD: { adelante: 6, abre: 8, gira: 0 }, codoI: 12, codoD: 12, manoI: 1, manoD: 1, munecaI: {}, munecaD: {} };

const POSES = {
  // ---------- tiempo de contacto ----------
  'empuje-recto': () => {
    const p = structuredClone(GYAKU);
    p.tronco = { inclina: 12 }; p.cabeza = { inclina: -8 };
    p.manoD = 1; p.manoI = 1; // empuja con la palma, sin puño: sin kime
    p.munecaD = {}; p.munecaI = { gira: 0 };
    const e = llegar(p, 'D', { mano: V(-0.045, 1.08, 0.66), codoObj: V(-0.15, 1.02, 0.34), codo0: 20, pesoCodo: 0.1, ini: [75, -5, 0] });
    const c = orientarPalma(p, 'D', V(0, 0, 1));
    // la izquierda queda abierta y suelta junto a la cadera (no hace hikite de golpe)
    p.brazoI = { adelante: -20, abre: 14, gira: 0 }; p.codoI = 80; p.munecaI = { flex: 0, gira: 0 };
    return { p, e, c, desc: 'Empuje recto, SIN kime (tiempo de contacto, planos 1-3 y 13): mismas piernas que gyaku-zuki-kiai (se mezclan sin deslizar los pies), tronco inclinado 12° hacia delante y brazo derecho extendido con la palma abierta mirando al frente a la altura del pecho (≈ 1,08 m); el brazo izquierdo queda suelto junto a la cadera, sin hikite. Cara sin grito: k.cara({ sonrisa: 0.1 }). mezclar(P[\'gyaku-zuki-kiai\'], P[\'empuje-recto\'], f) para pasar de golpe a empuje.' };
  },
  'encoge-hombros': () => {
    const p = limpiar(leer('yoi'));
    p.tronco = { inclina: -2 }; p.cabeza = { ladeo: 14, inclina: 4 };
    p.manoI = 1; p.manoD = 1; p.munecaI = {}; p.munecaD = {};
    // codos pegados al cuerpo, antebrazos hacia fuera y palmas arriba (gesto «¿yo qué sé?»)
    const e1 = llegar(p, 'I', { mano: V(0.43, 1.0, 0.22), codoObj: V(0.2, 0.98, 0.0), codo0: 90, ini: [20, 20, 0] });
    const e2 = llegar(p, 'D', { mano: V(-0.43, 1.0, 0.22), codoObj: V(-0.2, 0.98, 0.0), codo0: 90, ini: [20, 20, 0] });
    const c = Math.min(orientarPalma(p, 'I', V(0, 1, 0)), orientarPalma(p, 'D', V(0, 1, 0)));
    return { p, e: Math.max(e1, e2), c, desc: 'Encoger de hombros (plano 12, duda honesta): yoi con la cabeza ladeada 14°, codos pegados, antebrazos abiertos hacia los lados y las palmas arriba a ≈ 1,0 m de altura. Los hombros del rig no suben: el gesto se lee por los brazos y la cabeza. Cara: k.cara({ cejas: 0.5, sonrisa: 0.15, torcida: 0.4 }). Entrada: mezclar(P.neutra, P[\'encoge-hombros\'], f) (f con U.easeBack da un pequeño rebote).' };
  },
  // ---------- seiza ----------
  'seiza-alto': () => {
    const p = limpiar(SEIZA);
    p.piernaI = { adelante: 0, abre: 3, gira: 0 }; p.piernaD = { adelante: 0, abre: 3, gira: 0 };
    p.rodillaI = 90; p.rodillaD = 90;
    p.tronco = { inclina: 0 }; p.cabeza = {};
    p.brazoI = { adelante: 12, abre: 6, gira: 0 }; p.brazoD = { adelante: 12, abre: 6, gira: 0 }; p.codoI = 30; p.codoD = 30;
    const altura = alturaRodilla(p);
    return { p, aplicar: { suelo: false, altura }, desc: 'Seiza alto (de rodillas, tronco erguido): muslos verticales, glúteos levantados (cadera a ≈ 0,62 m), espinillas y empeines en el suelo, talones libres. Es el primer movimiento de levantarse desde P.seiza. Aplicar con k.aplicarPose(p, { suelo: false, altura: ' + altura + ' }) (o con levantarse() de seiza3d.js, que lo hace).' };
  },
  'en-cuclillas-medio': () => {
    // de rodillas a punto de poner los pies: cadera en medio de la subida, rodillas muy dobladas, pies planos, tronco inclinado
    const p = limpiar(SEIZA);
    p.piernaI = { adelante: 80, abre: 6, gira: 0 }; p.piernaD = { adelante: 80, abre: 6, gira: 0 };
    p.rodillaI = 120; p.rodillaD = 120;
    p.tronco = { inclina: 30 }; p.cabeza = { inclina: -18 };
    piePlano(p, 'I'); piePlano(p, 'D');
    p.brazoI = { adelante: 40, abre: 8, gira: 0 }; p.brazoD = { adelante: 40, abre: 8, gira: 0 }; p.codoI = 35; p.codoD = 35;
    k.aplicarPose(p, { suelo: true });
    return { p, desc: 'En cuclillas a medias (transición de levantarse): pies planos, muslos a 80°, rodillas a 120°, tronco inclinado 30°, brazos al frente para el equilibrio. Aplicar con suelo (por defecto). Secuencia: seiza → seiza-alto → en-cuclillas-medio → levantarse-vacilando (usa levantarse() de seiza3d.js).' };
  },
  'manos-rodillas': () => {
    const p = { ...structuredClone(BRAZOS_REL), cadera: {}, tronco: { inclina: 30 }, cabeza: { inclina: -24 } };
    for (const L of ['I', 'D']) { p['pierna' + L] = { adelante: 38, abre: 5, gira: 0 }; p['rodilla' + L] = 60; piePlano(p, L); p['mano' + L] = 1; }
    k.aplicarPose(p, {});
    const e = [];
    for (const [L, s] of [['I', 1], ['D', -1]]) {
      const rod = k.punto('rodilla' + L);
      e.push(llegar(p, L, { mano: V(rod.x, rod.y + 0.1, rod.z + 0.02), codoObj: V(s * 0.3, rod.y + 0.3, rod.z - 0.2), codo0: 35, op: {}, ini: [60, 10, 0] }));
    }
    return { p, e: Math.max(...e), c: 0, desc: 'Manos a las rodillas: de pie, rodillas flexionadas (muslo 38°, rodilla 60°), pies planos a la anchura de los hombros, tronco inclinado 30° y las dos manos abiertas apoyadas en las rodillas (descansar, tomar aire, o apoyarse con las piernas dormidas). Cabeza algo levantada.' };
  },
  'levantarse-vacilando': () => {
    // piernas dormidas: rodillas hacia dentro, una más doblada que la otra, una mano a la rodilla y la otra extendida para el equilibrio
    const p = { ...structuredClone(BRAZOS_REL), cadera: { giro: -6 }, tronco: { inclina: 26, ladeo: 8, giro: 6 }, cabeza: { inclina: -14, ladeo: -10 } };
    p.piernaI = { adelante: 48, abre: -5, gira: -6 }; p.rodillaI = 82;
    // la derecha se dobla más: se busca la rodilla que deja las dos caderas a la misma altura (los dos pies en el suelo)
    const alto = (A, R) => Math.cos(A * D2R) + Math.cos((A - R) * D2R);
    const objetivo = alto(48, 82), A2 = 60; let R2 = 100, mej = 9;
    for (let R = 60; R <= 140; R += 0.25) { const e = Math.abs(alto(A2, R) - objetivo); if (e < mej) { mej = e; R2 = R; } }
    p.piernaD = { adelante: A2, abre: 2, gira: 6 }; p.rodillaD = R2;
    piePlano(p, 'I'); piePlano(p, 'D');
    p.manoI = 1; p.manoD = 1;
    p.tobilloI.ladeo = 6; p.tobilloD.ladeo = -4;
    k.aplicarPose(p, {});
    const rod = k.punto('rodillaI');
    const e = llegar(p, 'I', { mano: V(rod.x, rod.y + 0.1, rod.z + 0.02), codoObj: V(0.32, rod.y + 0.3, rod.z - 0.2), codo0: 35, ini: [60, 10, 0] });
    p.brazoD = { adelante: 22, abre: 78, gira: 0 }; p.codoD = 28; p.munecaD = { flex: 0, gira: 0 };
    return { p, e, c: +mej.toFixed(3), desc: 'Levantarse con las piernas dormidas (seiza, plano 6): a medio incorporar, rodillas hacia dentro y distinta flexión (muslos 48° y 60°), pies planos, tronco inclinado 26° y ladeado 8°, mano izquierda a la rodilla y brazo derecho abierto para no caerse, cabeza ladeada. Tambaleo = código determinista sobre `ladeo` del tronco y `giro` de la cadera (ver levantarse() y tambalear() de seiza3d.js); termina en manos-rodillas → neutra.' };
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
