// KARATE EMAKI · karateka 3D (Three.js r160 local, solo geometría primitiva propia).
// Estilo «figura de arcilla / juguete de vinilo»: cabeza algo grande, ojos sencillos, manos en mitón,
// karategi blanco con pliegues modelados, cinturón de color con nudo y caídas.
//
// Unidades: metros. Ejes locales del personaje: +Z = hacia delante (adonde mira), +Y = arriba, +X = su IZQUIERDA.
// Todo es determinista: aplicarPose() y cara() solo dependen de lo que les pases.
//
// Convenio de ángulos (grados) de una pose — ver README.md para la tabla completa:
//   cadera / tronco / cabeza: {giro (+ = gira hacia su izquierda), inclina (+ = hacia delante), ladeo (+ = se ladea a su izquierda)}
//   brazoI/D: {adelante (flexión: 90 = brazo horizontal al frente, 180 = arriba), abre (abducción: 90 = en cruz), gira (+ = rotación externa)}
//   codoI/D: flexión (0 = recto)            munecaI/D: {flex, gira, desvio}      manoI/D: 0 = puño, 1 = abierta
//   piernaI/D: {adelante (flexión de cadera), abre (abducción), gira (+ = punta hacia fuera)}
//   rodillaI/D: flexión (0 = recta)         tobilloI/D: número (flexión dorsal +) o {flex, ladeo (+ = planta hacia fuera)}
import * as THREE from './lib/three.module.min.js';
export { THREE };

const D2R = Math.PI / 180;
const V2 = (r, y) => new THREE.Vector2(r, y);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));

// ---------- medidas del personaje (m) ----------
export const MEDIDAS = {
  tobillo: 0.075,      // altura del tobillo sobre el suelo
  espinilla: 0.41, muslo: 0.41,
  caderaX: 0.092,      // media distancia entre articulaciones de cadera
  pelvis: 0.06,        // la pelvis (origen de «cadera») está 6 cm por encima de las articulaciones de cadera
  caderaY: 0.075 + 0.41 + 0.41 + 0.06, // 0,955 m de pie
  troncoY: 0.05,       // origen del tronco (a la altura del cinturón) sobre la pelvis
  hombroX: 0.158, hombroY: 0.318,
  cuelloY: 0.392, cabezaSobreCuello: 0.04, cabezaCentro: 0.172, cabezaEscala: 1.22, // cabeza grande (estilo juguete)
  brazo: 0.27, antebrazo: 0.245,
  pie: 0.25            // largo del pie (talón 0,06 por detrás del tobillo, punta 0,19 por delante)
};
const M = MEDIDAS;

export const CINTURONES = {
  blanco: '#EFEBE2', amarillo: '#E2B714', naranja: '#E0761C', verde: '#2F8A3E', azul: '#1F4C9A',
  morado: '#5A2D82', marron: '#5A3820', negro: '#1C1A19', rojo: '#C8102E'
};

// ---------- utilidades de geometría ----------
function suavizar(pts, n) {
  const c = new THREE.SplineCurve(pts.map((p) => V2(p[0], p[1])));
  return c.getPoints(n).map((p) => V2(Math.max(0, p.x), p.y));
}
function rDePerfil(prof, y) { // radio del perfil a la altura y (perfil ordenado de abajo arriba)
  if (y <= prof[0].y) return prof[0].x;
  for (let i = 1; i < prof.length; i++) if (prof[i].y >= y) {
    const a = prof[i - 1], b = prof[i], f = (y - a.y) / Math.max(1e-9, b.y - a.y); return a.x + (b.x - a.x) * f;
  }
  return prof[prof.length - 1].x;
}
function arreglarCostura(g, segs, np) {
  const nr = g.attributes.normal, pos = g.attributes.position, a = V3(0, 0, 0), b = V3(0, 0, 0);
  for (let j = 0; j < np; j++) {
    const i0 = j, i1 = segs * np + j;
    a.fromBufferAttribute(nr, i0); b.fromBufferAttribute(nr, i1); a.add(b).normalize();
    nr.setXYZ(i0, a.x, a.y, a.z); nr.setXYZ(i1, a.x, a.y, a.z);
  }
  for (const j of [0, np - 1]) {
    if (Math.hypot(pos.getX(j), pos.getZ(j)) > 1e-6) continue;
    const s = j === 0 ? -1 : 1; for (let i = 0; i <= segs; i++) nr.setXYZ(i * np + j, 0, s, 0);
  }
  nr.needsUpdate = true;
}
// Sólido de revolución con perfil [[r,y],...] (de abajo arriba) y deformaciones:
//   dr(phi,y,r) desplazamiento radial (pliegues), sz(y,phi)/sx escala de profundidad/anchura, color(phi,y) → THREE.Color
// phi = 0 delante (+Z), phi = +90° a su izquierda (+X).
function torno(pts, o = {}) {
  const n = o.n || 40, segs = o.segs || 40;
  const prof = o.sinSuavizar ? pts.map((p) => V2(p[0], p[1])) : suavizar(pts, n);
  const g = new THREE.LatheGeometry(prof, segs);
  const pos = g.attributes.position, v = V3(0, 0, 0);
  const col = o.color ? new Float32Array(pos.count * 3) : null;
  const pf = (phi, y, r, extra = 0) => {
    let r2 = r > 1e-6 ? r + (o.dr ? o.dr(phi, y, r) : 0) + extra : 0;
    const sz = o.sz ? o.sz(y, phi) : 1, sx = o.sx ? o.sx(y, phi) : 1;
    return V3(Math.sin(phi) * r2 * sx, y, Math.cos(phi) * r2 * sz);
  };
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z), phi = Math.atan2(v.x, v.z);
    const p = pf(phi, v.y, r);
    pos.setXYZ(i, p.x, p.y, p.z);
    if (col) { const c = o.color(phi, v.y); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  }
  if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  arreglarCostura(g, segs, prof.length);
  // punto de la superficie (para colocar detalles encima)
  g.userData.sup = (phi, y, extra = 0) => pf(phi, y, rDePerfil(prof, y), extra);
  g.userData.normal = (phi, y) => { const a = g.userData.sup(phi, y), b = g.userData.sup(phi, y, 0.01); return b.sub(a).normalize(); };
  return g;
}
// Esfera deformada con una función (x,y,z) de la esfera unidad → Vector3
function deformarEsfera(fn, w = 40, h = 28) {
  const g = new THREE.SphereGeometry(1, w, h), pos = g.attributes.position, v = V3(0, 0, 0);
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const p = fn(v.x, v.y, v.z); pos.setXYZ(i, p.x, p.y, p.z); }
  g.computeVertexNormals();
  // costura de la esfera
  const nr = g.attributes.normal, a = V3(0, 0, 0), b = V3(0, 0, 0);
  for (let j = 0; j <= h; j++) { const i0 = j * (w + 1), i1 = j * (w + 1) + w; a.fromBufferAttribute(nr, i0); b.fromBufferAttribute(nr, i1); a.add(b).normalize(); nr.setXYZ(i0, a.x, a.y, a.z); nr.setXYZ(i1, a.x, a.y, a.z); }
  for (const j of [0, h]) { a.set(0, 0, 0); for (let i = 0; i <= w; i++) a.add(b.fromBufferAttribute(nr, j * (w + 1) + i)); a.normalize(); for (let i = 0; i <= w; i++) nr.setXYZ(j * (w + 1) + i, a.x, a.y, a.z); }
  return g;
}
// Cinta (cinturón, caídas): barre un rectángulo ancho×grueso por los puntos; 'fuera' orienta la cara ancha.
function cinta(puntos, ancho, grueso, fuera, n = 24) {
  const curva = new THREE.CatmullRomCurve3(puntos);
  const sec = [];
  for (let i = 0; i <= n; i++) {
    const p = curva.getPointAt(i / n), T = curva.getTangentAt(i / n);
    const S = V3(0, 0, 0).crossVectors(T, fuera).normalize(), N = V3(0, 0, 0).crossVectors(S, T).normalize();
    // estrecha un poco el extremo final (la punta del cinturón)
    sec.push({ p, S, N, T });
  }
  const pos = [], nor = [];
  const tri = (a, b, c, nn) => {
    const e = V3(0, 0, 0).subVectors(b, a).cross(V3(0, 0, 0).subVectors(c, a));
    if (e.dot(nn) < 0) [b, c] = [c, b];
    for (const q of [a, b, c]) { pos.push(q.x, q.y, q.z); nor.push(nn.x, nn.y, nn.z); }
  };
  const esquina = (s, a, b) => s.p.clone().addScaledVector(s.N, a * grueso / 2).addScaledVector(s.S, b * ancho / 2);
  const caras = [[[1, 1], [1, -1], 'N', 1], [[-1, 1], [-1, -1], 'N', -1], [[1, 1], [-1, 1], 'S', 1], [[1, -1], [-1, -1], 'S', -1]];
  for (const [c1, c2, eje, sg] of caras) for (let i = 0; i < n; i++) {
    const A = sec[i], B = sec[i + 1];
    const a1 = esquina(A, ...c1), a2 = esquina(A, ...c2), b1 = esquina(B, ...c1), b2 = esquina(B, ...c2);
    const nn = A[eje].clone().multiplyScalar(sg);
    tri(a1, a2, b1, nn); tri(a2, b2, b1, nn);
  }
  const fin = sec[n], tn = fin.T.clone();
  const f = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map((c) => esquina(fin, ...c));
  tri(f[0], f[1], f[2], tn); tri(f[0], f[2], f[3], tn);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
// Disco de sombra de contacto (alfa radial en los vértices, sin texturas)
function discoSombra() {
  const g = new THREE.CircleGeometry(1, 40, 0, Math.PI * 2);
  // subdividir en anillos para el degradado
  const anillos = 10, seg = 40, pos = [], col = [], idx = [];
  for (let a = 0; a <= anillos; a++) for (let s = 0; s <= seg; s++) {
    const r = a / anillos, th = (s / seg) * Math.PI * 2;
    pos.push(Math.cos(th) * r, 0, Math.sin(th) * r);
    const al = Math.exp(-r * r * 3.2) * (1 - r * r);
    col.push(1, 1, 1, al);
  }
  for (let a = 0; a < anillos; a++) for (let s = 0; s < seg; s++) {
    const i = a * (seg + 1) + s, j = i + seg + 1; idx.push(i, i + 1, j, i + 1, j + 1, j);
  }
  g.dispose();
  const d = new THREE.BufferGeometry();
  d.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  d.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  d.setIndex(idx);
  return d;
}

// ---------- materiales ----------
function materiales(o) {
  const gi = new THREE.MeshPhysicalMaterial({ color: o.gi, roughness: 0.82, sheen: 0.7, sheenRoughness: 0.55, sheenColor: new THREE.Color('#FFF6EA'), envMapIntensity: 0.85 });
  const giV = gi.clone(); giV.color.set('#FFFFFF'); giV.vertexColors = true;
  const giDoble = gi.clone(); giDoble.side = THREE.DoubleSide;
  const piel = new THREE.MeshPhysicalMaterial({ color: o.piel, roughness: 0.5, sheen: 0.35, sheenRoughness: 0.45, sheenColor: new THREE.Color('#FFC9A8'), clearcoat: 0.12, clearcoatRoughness: 0.5, envMapIntensity: 0.9 });
  const mejilla = piel.clone(); mejilla.color.set(o.mejilla);
  const pelo = new THREE.MeshPhysicalMaterial({ color: o.pelo, roughness: 0.62, sheen: 0.4, sheenRoughness: 0.5, sheenColor: new THREE.Color('#7A5A48'), clearcoat: 0.08, clearcoatRoughness: 0.6, envMapIntensity: 0.9, side: THREE.DoubleSide });
  const ojo = new THREE.MeshPhysicalMaterial({ color: '#1B1513', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });
  const brillo = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  const ceja = new THREE.MeshStandardMaterial({ color: o.pelo, roughness: 0.6 });
  const boca = new THREE.MeshStandardMaterial({ color: '#6E2B25', roughness: 0.5 });
  const cint = new THREE.MeshPhysicalMaterial({ color: o.colorCinturon, roughness: 0.62, sheen: 0.5, sheenRoughness: 0.5, sheenColor: new THREE.Color('#FFFFFF'), envMapIntensity: 0.9, side: THREE.DoubleSide });
  const sombra = new THREE.MeshBasicMaterial({ color: '#2B1A0E', transparent: true, depthWrite: false, vertexColors: true, opacity: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
  return { gi, giV, giDoble, piel, mejilla, pelo, ojo, brillo, ceja, boca, cint, sombra };
}

// ---------- peinados alternativos (alumnos, el maestro) ----------
// 'corto', 'rapado', 'flequillo', 'melena', 'mono' (corto + moño).
// El peinado por defecto ('normal') NO pasa por aquí: se construye igual que el diseño aprobado.
export const PEINADOS = ['normal', 'corto', 'rapado', 'flequillo', 'melena', 'mono'];
function peloAlternativo(tipo, sup) {
  const yTop = 0.171;
  const cfg = {
    corto: { linea: (p, c) => 0.045 + (c > 0 ? 0.062 : 0.125) * c - sstep(0.45, 0.85, c) * (0.01 + 0.012 * Math.pow(0.5 + 0.5 * Math.cos(p * 9), 2)) - gauss(Math.abs(p), 1.3, 0.12) * 0.03,
      grosor: (p, y) => 0.012 + 0.002 * Math.sin(p * 9 + y * 40) + 0.007 * sstep(0.06, 0.17, y) },
    rapado: { linea: (p, c) => 0.055 + (c > 0 ? 0.05 : 0.115) * c - gauss(Math.abs(p), 1.3, 0.12) * 0.02, grosor: () => 0.0055 },
    flequillo: { linea: (p, c) => (c > 0.55 ? 0.072 : 0.02 + (c > 0 ? 0.08 : 0.12) * c) - gauss(Math.abs(p), 1.3, 0.12) * 0.03,
      grosor: (p, y) => 0.02 + 0.012 * sstep(0.06, 0.17, y) + 0.002 * Math.sin(p * 24) },
    melena: { linea: (p, c) => (c > 0.6 ? 0.07 + 0.012 * Math.cos(p * 14) : -0.085 + 0.02 * c),
      grosor: (p, y) => 0.022 + 0.01 * sstep(0.0, -0.08, y) + 0.01 * sstep(0.06, 0.17, y) + 0.002 * Math.sin(p * 11 + y * 30) },
  };
  const C = cfg[tipo === 'mono' ? 'corto' : tipo] || cfg.corto;
  const pA = -Math.PI, pB = Math.PI;
  const NU = 96, NV = 26, pos = [], idx = [];
  for (let i = 0; i <= NU; i++) {
    const phi = pA + (i / NU) * (pB - pA), c = Math.cos(phi), y0 = C.linea(phi, c);
    for (let k = 0; k <= NV; k++) {
      let p;
      if (k < 4) { const f = Math.sin((k / 4) * Math.PI / 2); p = sup(phi, y0, C.grosor(phi, y0) * f + 0.001); p.y -= 0.004 * Math.sin(f * Math.PI); }
      else {
        const v = (k - 4) / (NV - 4), y = y0 + (yTop - y0) * (1 - Math.pow(1 - v, 1.4));
        p = v >= 1 ? V3(0, yTop + C.grosor(0, yTop), 0) : sup(phi, y, C.grosor(phi, y));
      }
      pos.push(p.x, p.y, p.z);
    }
  }
  for (let i = 0; i < NU; i++) for (let k = 0; k < NV; k++) { const a = i * (NV + 1) + k, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  {
    const nr = g.attributes.normal, a = V3(0, 0, 0), b = V3(0, 0, 0);
    for (let k = 0; k <= NV; k++) { const i0 = k, i1 = NU * (NV + 1) + k; a.fromBufferAttribute(nr, i0); b.fromBufferAttribute(nr, i1); a.add(b).normalize(); nr.setXYZ(i0, a.x, a.y, a.z); nr.setXYZ(i1, a.x, a.y, a.z); }
    for (let i = 0; i <= NU; i++) nr.setXYZ(i * (NV + 1) + NV, 0, 1, 0);
  }
  return g;
}

function grupo(padre, x = 0, y = 0, z = 0, nombre = '') { const g = new THREE.Group(); g.position.set(x, y, z); g.name = nombre; padre.add(g); return g; }

// ---------- el personaje ----------
export class Karateka3D {
  // o: { cinturon: 'negro'|'#hex', piel, pelo, gi, sombras: true, rostro: true }
  constructor(o = {}) {
    this.o = Object.assign({ cinturon: 'negro', piel: '#EDB48C', mejilla: '#F09A84', pelo: '#2A1E18', gi: '#F7F4EE', sombras: true, rostro: true }, o);
    this.o.colorCinturon = CINTURONES[this.o.cinturon] || this.o.cinturon;
    this.mat = materiales(this.o);
    this.raiz = new THREE.Group(); this.raiz.name = 'karateka3d';
    this.base = { x: 0, z: 0, rumbo: 0 };
    this.j = {}; this.partes = {};
    this._construir();
    this.raiz.traverse((m) => { if (m.isMesh && m.material !== this.mat.sombra && m.material !== this.mat.brillo) { m.castShadow = this.o.sombras; m.receiveShadow = this.o.sombras; } });
    this.aplicarPose(POSE_NEUTRA);
    this.cara({});
  }

  // ---------------- construcción ----------------
  _construir() {
    const j = this.j, mt = this.mat, P = this.partes;
    const malla = (g, m, padre, nombre) => { const x = new THREE.Mesh(g, m); x.name = nombre || ''; padre.add(x); return x; };

    j.cadera = grupo(this.raiz, 0, M.caderaY, 0, 'cadera');
    j.tronco = grupo(j.cadera, 0, M.troncoY, 0, 'tronco');
    j.cuello = grupo(j.tronco, 0, M.cuelloY, 0, 'cuello');
    j.cabeza = grupo(j.cuello, 0, M.cabezaSobreCuello, 0, 'cabeza');
    for (const [L, s] of [['I', 1], ['D', -1]]) {
      j['hombro' + L] = grupo(j.tronco, s * M.hombroX, M.hombroY, 0, 'hombro' + L);
      j['codo' + L] = grupo(j['hombro' + L], 0, -M.brazo, 0, 'codo' + L);
      j['muneca' + L] = grupo(j['codo' + L], 0, -M.antebrazo, 0, 'muneca' + L);
      j['pierna' + L] = grupo(j.cadera, s * M.caderaX, -M.pelvis, 0, 'pierna' + L);
      j['rodilla' + L] = grupo(j['pierna' + L], 0, -M.muslo, 0, 'rodilla' + L);
      j['tobillo' + L] = grupo(j['rodilla' + L], 0, -M.espinilla, 0, 'tobillo' + L);
    }

    // ===== pelvis: faldón de la chaqueta, pantalón, cinturón =====
    const BELT = 0.05; // altura del cinturón en el marco de la cadera
    const szPelvis = () => 0.86;
    const falda = torno([[0.184, -0.18], [0.182, -0.14], [0.175, -0.07], [0.166, 0.0], [0.158, 0.05], [0.150, 0.095]], {
      segs: 56, n: 30, sz: szPelvis,
      dr: (phi, y) => 0.0045 * Math.sin(phi * 7 + 0.8) * sstep(-0.02, -0.2, y) + 0.003 * Math.sin(phi * 13) * gauss(y, 0.0, 0.035)
        - 0.004 * gauss(y, -0.2, 0.012) * 0 // (dobladillo aparte)
    });
    P.falda = malla(falda, mt.giDoble, j.cadera, 'falda');
    P.dobladillo = malla(new THREE.TorusGeometry(0.185, 0.0065, 8, 64), mt.gi, j.cadera, 'dobladillo');
    P.dobladillo.rotation.x = Math.PI / 2; P.dobladillo.position.y = -0.178; P.dobladillo.scale.set(1, 0.86, 1);
    // borde cruzado del faldón (panel izquierdo sobre el derecho), del nudo al dobladillo
    {
      const g = falda.userData.sup, pts = [[-0.66, 0.03], [-0.7, -0.05], [-0.74, -0.12], [-0.77, -0.175]].map(([p, y]) => g(p, y, 0.004));
      P.bordeFalda = malla(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0075, 6), mt.gi, j.cadera, 'bordeFalda');
    }
    P.pantalonCadera = malla(deformarEsfera((x, y, z) => V3(x * 0.158, y * 0.12 - 0.075, z * 0.128)), mt.gi, j.cadera, 'pantalonCadera');
    // cinturón: banda de sección rectangular redondeada
    {
      const r0 = 0.162, r1 = 0.179, y0 = BELT - 0.025, y1 = BELT + 0.025, k = 0.004;
      const prof = [[r0 + k, y0], [r1 - k, y0], [r1, y0 + k], [r1, y1 - k], [r1 - k, y1], [r0 + k, y1], [r0, y1 - k], [r0, y0 + k], [r0 + k, y0]];
      const banda = torno(prof, { sinSuavizar: true, segs: 64, sz: szPelvis, dr: (phi, y) => 0.0015 * Math.sin(phi * 5) });
      P.cinturon = malla(banda, mt.cint, j.cadera, 'cinturon');
      const zF = r1 * 0.86;
      // nudo
      P.nudo = malla(deformarEsfera((x, y, z) => V3(x * 0.042 * (1 - 0.15 * y * y), y * 0.03, z * 0.02 * (1 + 0.3 * (1 - Math.abs(x))))), mt.cint, j.cadera, 'nudo');
      P.nudo.position.set(0.004, BELT + 0.002, zF + 0.012);
      // vuelta que cruza por encima del nudo (el «lazo»)
      P.lazo = malla(cinta([V3(-0.05, BELT + 0.016, zF - 0.002), V3(-0.01, BELT + 0.02, zF + 0.026), V3(0.03, BELT - 0.018, zF + 0.026), V3(0.055, BELT - 0.03, zF + 0.0)], 0.034, 0.008, V3(0, 0, 1), 16), mt.cint, j.cadera, 'lazo');
      // caídas (en un grupo que cuelga del nudo y se mantiene vertical)
      j.colas = grupo(j.cadera, 0.004, BELT - 0.012, zF + 0.016, 'colas');
      const colaI = [V3(0.008, 0, 0), V3(0.03, -0.06, 0.008), V3(0.05, -0.15, 0.006), V3(0.062, -0.235, -0.002)];
      const colaD = [V3(-0.004, 0, 0), V3(-0.016, -0.06, 0.012), V3(-0.026, -0.14, 0.012), V3(-0.03, -0.215, 0.004)];
      P.colaI = malla(cinta(colaI, 0.04, 0.008, V3(0, 0, 1)), mt.cint, j.colas, 'colaI');
      P.colaD = malla(cinta(colaD, 0.04, 0.008, V3(0, 0, 1)), mt.cint, j.colas, 'colaD');
    }

    // ===== tronco: chaqueta con solapas cruzadas y escote de piel =====
    {
      const ap = { phi: -0.035, y: 0.262 };                 // vértice del escote
      const phiL = (y) => ap.phi + (y - ap.y) * (0.5 / 0.13); // borde de la solapa izquierda (la de encima)
      const phiR = (y) => ap.phi - (y - ap.y) * (0.46 / 0.13);
      const cPiel = new THREE.Color(this.o.piel), cGi = new THREE.Color(this.o.gi);
      const enV = (phi, y) => y > ap.y && phi < phiL(y) - 0.01 && phi > phiR(y) + 0.01 && Math.abs(phi) < 1.2;
      const sz = (y) => 0.9 - 0.15 * sstep(0.0, 0.2, y);
      const perfilT = [[0.0, -0.075], [0.118, -0.07], [0.146, -0.04], [0.15, 0.0], [0.154, 0.055], [0.16, 0.125], [0.166, 0.195], [0.167, 0.25], [0.158, 0.3], [0.138, 0.338], [0.105, 0.37], [0.066, 0.388], [0.0, 0.396]];
      const solapa = (phi, y) => { // banda elevada del cuello del gi
        if (y < ap.y - 0.3) return 0;
        const dL = phi - phiL(y), dR = phiR(y) - phi;
        let b = 0;
        if (y > ap.y - 0.27) b = Math.max(b, sstep(0.0, 0.015, dL) * (1 - sstep(0.17, 0.22, dL)) * sstep(ap.y - 0.27, ap.y - 0.18, y));
        if (y > ap.y) b = Math.max(b, sstep(0.0, 0.015, dR) * (1 - sstep(0.15, 0.2, dR)));
        return b;
      };
      const torso = torno(perfilT, {
        segs: 72, n: 56, sz,
        dr: (phi, y) => {
          if (enV(phi, y)) return -0.004;
          let d = 0.006 * solapa(phi, y);
          // tela recogida sobre el cinturón
          d += 0.0045 * Math.sin(phi * 11 + 0.6 * Math.sin(phi * 3)) * gauss(y, 0.035, 0.04);
          // pliegues diagonales hacia las axilas
          const lado = Math.abs(Math.sin(phi));
          d += 0.003 * Math.sin(y * 48 - Math.abs(phi) * 5) * sstep(0.5, 0.95, lado) * sstep(0.06, 0.12, y) * (1 - sstep(0.24, 0.3, y));
          return d;
        },
        color: (phi, y) => (enV(phi, y) ? cPiel : cGi)
      });
      P.torso = malla(torso, mt.giV, j.tronco, 'torso');
      // ribete de la solapa (tubo) a lo largo del escote y el cruce
      const sup = torso.userData.sup;
      const camino = [];
      for (let y = ap.y + 0.004; y <= 0.375; y += 0.015) camino.push([phiR(y) + 0.005, y]);
      camino.reverse();
      const nuca = [[-0.85, 0.382], [-1.6, 0.372], [-2.4, 0.366], [-Math.PI, 0.366]];
      const pts = [];
      for (const [p, y] of camino) pts.push(sup(p, y, 0.006));
      for (const [p, y] of nuca) pts.push(sup(p, y, 0.008));
      for (const [p, y] of [...nuca].reverse()) pts.push(sup(-p, y, 0.008));
      for (let y = 0.375; y >= ap.y - 0.27; y -= 0.015) {
        const p = y > ap.y ? phiL(y) - 0.005 : ap.phi - (ap.y - y) * 2.6;
        pts.push(sup(p, y, y > ap.y ? 0.006 : 0.007));
      }
      P.solapa = malla(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0095, 8), mt.gi, j.tronco, 'solapa');
    }

    // ===== cuello y cabeza =====
    P.cuello = malla(new THREE.CapsuleGeometry(0.054, 0.06, 6, 20), mt.piel, j.cuello, 'cuello'); P.cuello.position.y = 0.035;
    {
      const C = M.cabezaCentro;
      const cab = torno([[0, -0.152], [0.07, -0.146], [0.122, -0.116], [0.152, -0.06], [0.165, 0.0], [0.162, 0.06], [0.145, 0.112], [0.104, 0.152], [0.05, 0.168], [0, 0.171]], { segs: 56, n: 40, sz: () => 0.94 });
      const hg = grupo(j.cabeza, 0, C, 0, 'cabezaMalla'); hg.scale.setScalar(M.cabezaEscala); this.j.cabezaMalla = hg;
      P.cabeza = malla(cab, mt.piel, hg, 'cabeza');
      const sup = (phi, y, e = 0) => cab.userData.sup(phi, y, e);
      const nor = (phi, y) => cab.userData.normal(phi, y);
      const colocar = (obj, phi, y, e = 0, giro = 0) => {
        obj.position.copy(sup(phi, y, e));
        obj.quaternion.setFromUnitVectors(V3(0, 0, 1), nor(phi, y));
        if (giro) obj.rotateZ(giro);
        hg.add(obj); return obj;
      };
      // ojos (óvalos negros brillantes con dos brillos) — se pueden cerrar (parpadeo)
      const geoOjo = new THREE.SphereGeometry(1, 24, 16);
      const geoBr = new THREE.SphereGeometry(1, 10, 8);
      this.ojos = [];
      for (const s of [1, -1]) {
        const g = new THREE.Group();
        colocar(g, s * 0.37, -0.012, -0.004);
        const o = new THREE.Mesh(geoOjo, mt.ojo); o.scale.set(0.0215, 0.03, 0.012); g.add(o);
        const b1 = new THREE.Mesh(geoBr, mt.brillo); b1.scale.setScalar(0.0068); b1.position.set(-0.0065, 0.011, 0.0095); g.add(b1);
        const b2 = new THREE.Mesh(geoBr, mt.brillo); b2.scale.setScalar(0.0032); b2.position.set(0.006, -0.009, 0.0105); g.add(b2);
        this.ojos.push({ g, o, b1, b2, s });
      }
      // cejas
      const geoCeja = new THREE.CapsuleGeometry(0.0062, 0.03, 4, 8);
      this.cejas = [];
      for (const s of [1, -1]) {
        const g = new THREE.Group(); colocar(g, s * 0.37, 0.058, 0.0);
        const c = new THREE.Mesh(geoCeja, mt.ceja); c.rotation.z = Math.PI / 2; c.scale.set(1, 1, 0.6); g.add(c);
        this.cejas.push({ g, c, s, base: g.position.clone() });
      }
      // nariz, mejillas, orejas
      P.nariz = colocar(new THREE.Mesh(new THREE.SphereGeometry(0.0165, 16, 12), mt.piel), 0, -0.04, -0.003);
      P.nariz.scale.set(1.1, 0.85, 0.75);
      for (const s of [1, -1]) {
        const m = colocar(new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 12), mt.mejilla), s * 0.68, -0.052, -0.006);
        m.scale.set(1.15, 0.72, 0.3);
        const or = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mt.piel);
        or.scale.set(0.02, 0.04, 0.032); or.position.copy(sup(s * Math.PI / 2, -0.02, -0.004)); or.position.z -= 0.008; hg.add(or);
      }
      // boca: sonrisa (arco de toro) — sonrisa abierta opcional
      this.boca = new THREE.Group(); colocar(this.boca, 0, -0.082, -0.002);
      this.bocaArco = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0052, 8, 28, Math.PI * 0.62), mt.boca);
      this.bocaArco.rotation.z = Math.PI + (Math.PI - Math.PI * 0.62) / 2 + Math.PI * 0 ; // arco hacia abajo (sonrisa)
      this.bocaArco.rotation.z = -Math.PI / 2 - Math.PI * 0.31;
      this.bocaArco.position.y = 0.02;
      this.boca.add(this.bocaArco);
      this.bocaAbierta = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mt.boca);
      this.bocaAbierta.scale.set(0.024, 0.02, 0.006); this.bocaAbierta.position.set(0, 0.004, 0.0); this.boca.add(this.bocaAbierta);
      // pelo: superficie pegada al perfil de la cabeza (grosor de arcilla), con flequillo en picos y canto redondeado
      const peinado = this.o.peinado || 'normal';
      if (peinado !== 'normal') { P.pelo = malla(peloAlternativo(peinado, sup), mt.pelo, hg, 'pelo'); if (peinado === 'mono') { P.mono = malla(new THREE.SphereGeometry(0.058, 20, 14), mt.pelo, hg, 'mono'); P.mono.position.copy(sup(Math.PI, 0.125, 0.045)); P.mono.scale.set(1, 0.9, 0.85); } }
      else {
        const linea = (phi) => { // altura de la raíz del pelo según el ángulo
          const c = Math.cos(phi), frente = sstep(0.45, 0.85, c);
          const picos = Math.pow(0.5 + 0.5 * Math.cos((phi + 0.12) * 10.5), 1.6);
          const patilla = gauss(Math.abs(phi), 1.3, 0.12) * 0.04;
          return 0.03 + (c > 0 ? 0.07 : 0.13) * c - frente * (0.012 + 0.03 * picos) - patilla;
        };
        const grosor = (phi, y) => 0.019 + 0.003 * Math.sin(phi * 7 + y * 30) + 0.014 * sstep(0.06, 0.17, y) * (0.7 + 0.3 * Math.cos(phi + 0.6))
          - 0.006 * Math.pow(Math.abs(Math.sin(phi * 8 + y * 22)), 8) * sstep(0.0, 0.06, y) * (1 - sstep(0.11, 0.155, y)); // surcos de mechón
        const NU = 96, NV = 30, pos = [], idx = [];
        const yTop = 0.171;
        for (let i = 0; i <= NU; i++) {
          const phi = -Math.PI + (i / NU) * Math.PI * 2, y0 = linea(phi);
          for (let k = 0; k <= NV; k++) {
            let p;
            if (k < 4) { // canto: del cuero cabelludo al grosor completo
              const f = Math.sin((k / 4) * Math.PI / 2);
              p = sup(phi, y0 + 0.004 * (1 - f) * 0, grosor(phi, y0) * f + 0.001);
              p.y -= 0.004 * Math.sin(f * Math.PI);
            } else {
              const v = (k - 4) / (NV - 4), y = y0 + (yTop - y0) * (1 - Math.pow(1 - v, 1.4));
              p = v >= 1 ? V3(0, yTop + 0.02, 0) : sup(phi, y, grosor(phi, y));
              if (v >= 1) p.y = yTop + grosor(0, yTop);
            }
            pos.push(p.x, p.y, p.z);
          }
        }
        for (let i = 0; i < NU; i++) for (let k = 0; k < NV; k++) { const a = i * (NV + 1) + k, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        // costura (phi = ±π) y polo
        const nr = g.attributes.normal, a = V3(0, 0, 0), b = V3(0, 0, 0);
        for (let k = 0; k <= NV; k++) { const i0 = k, i1 = NU * (NV + 1) + k; a.fromBufferAttribute(nr, i0); b.fromBufferAttribute(nr, i1); a.add(b).normalize(); nr.setXYZ(i0, a.x, a.y, a.z); nr.setXYZ(i1, a.x, a.y, a.z); }
        for (let i = 0; i <= NU; i++) nr.setXYZ(i * (NV + 1) + NV, 0, 1, 0);
        P.pelo = malla(g, mt.pelo, hg, 'pelo');
      }
      // remolino de arriba (solo con el peinado por defecto)
      if (peinado === 'normal') {
        const rem = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0.004, 0.025, 0.006), V3(0.018, 0.042, 0.022), V3(0.038, 0.042, 0.036)]), 16, 0.0085, 8);
        P.remolino = malla(rem, mt.pelo, hg, 'remolino'); P.remolino.position.set(-0.03, 0.192, -0.02);
      }
      this.rostro = [...this.ojos.map((e) => e.g), ...this.cejas.map((e) => e.g), P.nariz, this.boca];
    }

    // ===== brazos =====
    for (const [L, s] of [['I', 1], ['D', -1]]) {
      const h = j['hombro' + L], c = j['codo' + L], m = j['muneca' + L];
      malla(new THREE.SphereGeometry(0.06, 24, 16), mt.gi, h, 'hombro');
      const manga = torno([[0, -0.285], [0.05, -0.28], [0.057, -0.26], [0.059, -0.15], [0.061, -0.05], [0.057, 0.0], [0.04, 0.04], [0, 0.048]], {
        segs: 28, n: 36, dr: (phi, y) => 0.0055 * Math.sin(y * 85 + 2.2 * Math.cos(phi)) * gauss(y, -0.225, 0.045) + 0.003 * Math.sin(phi * 3 + y * 20)
      });
      malla(manga, mt.gi, h, 'manga');
      malla(new THREE.SphereGeometry(0.054, 20, 14), mt.gi, c, 'codo');
      const mangaB = torno([[0.062, -0.158], [0.06, -0.14], [0.055, -0.09], [0.053, -0.03], [0.044, 0.03], [0, 0.045]], {
        segs: 28, n: 28, dr: (phi, y) => 0.004 * Math.sin(y * 70 + 1.5 * Math.sin(phi)) * gauss(y, -0.05, 0.05)
      });
      malla(mangaB, mt.giDoble, c, 'mangaB');
      const puno = malla(new THREE.TorusGeometry(0.059, 0.005, 6, 28), mt.gi, c, 'puno'); puno.rotation.x = Math.PI / 2; puno.position.y = -0.155;
      const ante = malla(new THREE.CapsuleGeometry(0.031, 0.15, 4, 14), mt.piel, c, 'antebrazo'); ante.position.y = -0.165;
      // manos: puño (mitón cerrado) y mano abierta
      const pun = new THREE.Group(); pun.name = 'puno'; m.add(pun);
      const bola = new THREE.Mesh(deformarEsfera((x, y, z) => V3(x * 0.054 * (1 + 0.1 * (y < 0 ? -y : 0)), y * 0.06, z * 0.058 * (1 - 0.12 * y))), mt.piel);
      bola.position.y = -0.058; pun.add(bola);
      const pulgar = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.036, 4, 10), mt.piel);
      pulgar.rotation.z = Math.PI / 2 + s * 0.25; pulgar.position.set(-s * 0.006, -0.048, 0.05); pun.add(pulgar);
      for (let k = 0; k < 3; k++) { // insinuación de dedos
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 8), mt.piel);
        d.position.set(-s * 0.034, -0.036 - k * 0.025, 0.014); d.scale.set(0.6, 1.1, 1.4); pun.add(d);
      }
      const abi = new THREE.Group(); abi.name = 'abierta'; m.add(abi);
      const palma = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.06, 6, 14), mt.piel);
      palma.scale.set(0.6, 1, 1); palma.position.y = -0.078; abi.add(palma);
      const pul2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.035, 4, 10), mt.piel);
      pul2.position.set(-s * 0.004, -0.04, 0.036); pul2.rotation.x = 0.7; abi.add(pul2);
      this.partes['puno' + L] = pun; this.partes['abierta' + L] = abi;
    }

    // ===== piernas =====
    for (const [L, s] of [['I', 1], ['D', -1]]) {
      const pi = j['pierna' + L], ro = j['rodilla' + L], to = j['tobillo' + L];
      const muslo = torno([[0, -0.43], [0.068, -0.425], [0.08, -0.39], [0.087, -0.25], [0.093, -0.1], [0.095, 0.0], [0.07, 0.06], [0, 0.07]], {
        segs: 32, n: 36, dr: (phi, y) => 0.004 * Math.sin(y * 40 + phi * 2 * s) * sstep(-0.05, -0.3, y) + 0.005 * Math.sin(y * 90) * gauss(y, -0.37, 0.03) * sstep(0.5, -0.8, Math.cos(phi))
      });
      malla(muslo, mt.gi, pi, 'muslo');
      malla(new THREE.SphereGeometry(0.079, 22, 16), mt.gi, ro, 'rodilla');
      const pern = torno([[0.088, -0.335], [0.087, -0.31], [0.082, -0.2], [0.078, -0.08], [0.076, 0.0], [0.06, 0.05], [0, 0.06]], {
        segs: 36, n: 32, dr: (phi, y) => 0.0055 * Math.sin(phi * 7 + 0.7) * sstep(-0.15, -0.32, y) + 0.003 * Math.sin(y * 60 + phi * 3) * gauss(y, -0.12, 0.08)
      });
      malla(pern, mt.giDoble, ro, 'espinilla');
      const bajo = malla(new THREE.TorusGeometry(0.088, 0.006, 6, 36), mt.gi, ro, 'bajo'); bajo.rotation.x = Math.PI / 2; bajo.position.y = -0.333;
      const tob = malla(new THREE.CapsuleGeometry(0.034, 0.08, 4, 14), mt.piel, to, 'tobilloPiel'); tob.position.y = 0.05;
      // pie descalzo (esfera deformada: planta casi plana, empeine que baja hacia los dedos)
      const pie = deformarEsfera((x, y, z) => {
        const zz = 0.065 + z * 0.125;                    // de -0,06 (talón) a 0,19 (punta)
        const u = (zz + 0.06) / 0.25;                     // 0 talón → 1 punta
        const ancho = 0.034 + 0.016 * sstep(0.0, 0.62, u) - 0.008 * sstep(0.8, 1.0, u);
        const alto = 0.085 - 0.05 * sstep(0.25, 0.85, u);
        const yy = y > 0 ? -M.tobillo + 0.012 + y * (alto - 0.012) : -M.tobillo + 0.012 + y * 0.012;
        const xx = x * ancho + s * 0.006 * sstep(0.5, 1, u); // dedo gordo hacia dentro... (ligero)
        return V3(xx, yy, zz);
      }, 36, 24);
      malla(pie, mt.piel, to, 'pie');
      // dedos: tres bultitos
      for (let k = 0; k < 3; k++) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(0.014 - k * 0.002, 12, 8), mt.piel);
        d.position.set(s * (-0.016 + k * 0.017), -M.tobillo + 0.02, 0.172 - k * 0.006); d.scale.set(1, 0.8, 1.1); to.add(d);
      }
    }

    // ===== sombras de contacto (discos en el suelo) =====
    const geoS = discoSombra();
    this.sombras = { I: new THREE.Mesh(geoS, this.mat.sombra), D: new THREE.Mesh(geoS, this.mat.sombra), cuerpo: new THREE.Mesh(geoS, this.mat.sombra.clone()) };
    for (const k in this.sombras) { this.sombras[k].renderOrder = 1; this.raiz.add(this.sombras[k]); }
  }

  // ---------------- colocación ----------------
  // Sitúa al personaje en el suelo (x, z en metros) mirando hacia 'rumbo' (grados; 0 = hacia +Z del mundo, 90 = hacia +X).
  colocar(x = 0, z = 0, rumbo = 0) { this.base = { x, z, rumbo }; return this; }

  // ---------------- pose ----------------
  // op: { suelo: true (apoya el pie más bajo en y=0), ancla: {pie:'I'|'D', x, z} (deja ese tobillo en ese punto del mundo),
  //       cinta: {x, z} balanceo de las caídas del cinturón (grados), altura: m extra de la cadera,
  //       inclinar: grados (cuerpo rígido alrededor de la punta del pie delantero; ver inclinar()), ladoInclinar, pivote }
  aplicarPose(p, op = {}) {
    const j = this.j, r = (v) => (v || 0) * D2R;
    this.pose = p;
    const ypr = (g, o) => g.rotation.set(r(o && o.inclina), r(o && o.giro), -r(o && o.ladeo), 'YXZ');
    this.raiz.position.set(this.base.x, 0, this.base.z);
    this.raiz.rotation.set(0, this.base.rumbo * D2R, 0);
    j.cadera.position.set(0, M.caderaY + (op.altura || 0), 0);
    ypr(j.cadera, p.cadera); ypr(j.tronco, p.tronco);
    const cb = p.cabeza || {};
    const media = { giro: (cb.giro || 0) / 2, inclina: (cb.inclina || 0) / 2, ladeo: (cb.ladeo || 0) / 2 };
    ypr(j.cuello, media); ypr(j.cabeza, media);
    for (const [L, s] of [['I', 1], ['D', -1]]) {
      const b = p['brazo' + L] || {};
      j['hombro' + L].rotation.set(-r(b.adelante), s * r(b.gira), s * r(b.abre), 'XZY');
      j['codo' + L].rotation.set(-r(p['codo' + L]), 0, 0);
      const mu = p['muneca' + L] || {};
      j['muneca' + L].rotation.set(-r(mu.flex), s * r(mu.gira), s * r(mu.desvio), 'YXZ');
      const abierta = (p['mano' + L] || 0) >= 0.5;
      this.partes['puno' + L].visible = !abierta; this.partes['abierta' + L].visible = abierta;
      const q = p['pierna' + L] || {};
      j['pierna' + L].rotation.set(-r(q.adelante), s * r(q.gira), s * r(q.abre), 'XZY');
      j['rodilla' + L].rotation.set(r(p['rodilla' + L]), 0, 0);
      const tb = typeof p['tobillo' + L] === 'number' ? { flex: p['tobillo' + L] } : (p['tobillo' + L] || {});
      j['tobillo' + L].rotation.set(-r(tb.flex), 0, s * r(tb.ladeo), 'XZY');
    }
    this.raiz.updateMatrixWorld(true);
    if (op.suelo !== false) {
      let min = Infinity;
      for (const L of ['I', 'D']) for (const q of PUNTOS_PLANTA) { const w = q.clone().applyMatrix4(j['tobillo' + L].matrixWorld); if (w.y < min) min = w.y; }
      j.cadera.position.y -= min;
      this.raiz.updateMatrixWorld(true);
    }
    if (op.ancla) {
      const w = V3(0, 0, 0).applyMatrix4(j['tobillo' + op.ancla.pie].matrixWorld);
      this.raiz.position.x += op.ancla.x - w.x; this.raiz.position.z += op.ancla.z - w.z;
      this.raiz.updateMatrixWorld(true);
    }
    this._cinta = op.cinta;
    this._colas(op.cinta);
    this._sombras();
    this._pivote = null;
    this._apoyo = this.apoyo(); // huella en el suelo antes de inclinar (la usa diagrama3d.js para la base)
    if (op.inclinar) this.inclinar(op.inclinar, { lado: op.ladoInclinar, pivote: op.pivote });
    return this;
  }
  // las caídas del cinturón cuelgan en vertical (compensan la inclinación de la cadera) + balanceo opcional
  _colas(c) {
    const g = this.j.colas, qp = V3(0, 0, 0);
    const qw = new THREE.Quaternion(); this.j.cadera.getWorldQuaternion(qw);
    const fw = V3(0, 0, 1).applyQuaternion(qw); fw.y = 0; if (fw.lengthSq() < 1e-6) fw.set(0, 0, 1); fw.normalize();
    const qy = new THREE.Quaternion().setFromUnitVectors(V3(0, 0, 1), fw);
    const sw = new THREE.Quaternion().setFromEuler(new THREE.Euler(((c && c.x) || 0) * D2R, 0, ((c && c.z) || 0) * D2R));
    g.quaternion.copy(qw.invert().multiply(qy).multiply(sw));
    void qp; g.updateMatrixWorld(true);
  }
  // Sombras de contacto: se calculan en coordenadas del MUNDO (siempre planas sobre el suelo, aunque el cuerpo esté inclinado)
  // y se convierten al marco de la raíz.
  _sombras() {
    const S = this.sombras, inv = new THREE.Matrix4().copy(this.raiz.matrixWorld).invert();
    const pon = (m, x, z, ang, sx, sz, y = 0.002) => {
      m.matrixAutoUpdate = false;
      const w = new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), ang), V3(sx, 1, sz));
      m.matrix.multiplyMatrices(inv, w); m.matrixWorldNeedsUpdate = true;
    };
    const centros = {};
    for (const L of ['I', 'D']) {
      const t = this.j['tobillo' + L];
      const talon = PUNTOS_PLANTA[0].clone().applyMatrix4(t.matrixWorld), punta = PUNTOS_PLANTA[1].clone().applyMatrix4(t.matrixWorld);
      const c = talon.clone().add(punta).multiplyScalar(0.5); centros[L] = c;
      const h = Math.max(0, Math.min(talon.y, punta.y));
      const ang = Math.atan2(punta.x - talon.x, punta.z - talon.z);
      const k = 1 + h * 2.5, m = S[L];
      pon(m, c.x, c.z, ang, 0.085 * k, 0.19 * k);
      m.material.opacity = 0.75 * Math.max(0, 1 - h / 0.3);
      m.visible = h < 0.3;
    }
    // sombra difusa del cuerpo bajo la cadera
    const cad = V3(0, 0, 0).applyMatrix4(this.j.cadera.matrixWorld), pI = centros.I, pD = centros.D;
    const sep = Math.hypot(pI.x - pD.x, pI.z - pD.z);
    pon(S.cuerpo, (cad.x * 2 + pI.x + pD.x) / 4, (cad.z * 2 + pI.z + pD.z) / 4, Math.atan2(pI.x - pD.x, pI.z - pD.z), 0.3, 0.3 + sep * 0.55, 0.0015);
    S.cuerpo.material.opacity = 0.38;
    this.raiz.updateMatrixWorld(true);
  }

  // Puntos de las plantas (mundo) que tocan el suelo (y < 2 cm): talón, punta y bordes del antepié de cada pie
  apoyo(tol = 0.02) {
    const loc = [V3(0, -M.tobillo, -0.058), V3(0, -M.tobillo, 0.185), V3(0.045, -M.tobillo, 0.09), V3(-0.045, -M.tobillo, 0.09)];
    const pts = [];
    for (const L of ['I', 'D']) for (const q of loc) { const w = q.clone().applyMatrix4(this.j['tobillo' + L].matrixWorld); if (w.y < tol) pts.push(w); }
    return pts.length ? pts : ['I', 'D'].map((L) => this.punto('tobillo' + L));
  }
  // Pie que va delante (el que tiene la punta más adelantada en la dirección del rumbo): 'I' o 'D'
  pieDelantero() {
    const fw = V3(Math.sin(this.base.rumbo * D2R), 0, Math.cos(this.base.rumbo * D2R));
    return this.punto('puntaI').dot(fw) >= this.punto('puntaD').dot(fw) ? 'I' : 'D';
  }
  // Inclina el cuerpo ENTERO como un sólido rígido alrededor de un eje horizontal que pasa por la punta del pie delantero
  // (o del pie / punto que digas). grados > 0 = hacia delante (hacia donde mira), < 0 = hacia atrás.
  // lado: 0 = vuelco delante-atrás; 90 = vuelco hacia su izquierda (pivota en el borde exterior… usa pivote para elegirlo).
  // Se llama DESPUÉS de aplicarPose (o con aplicarPose(p, {inclinar: g})). Devuelve el pivote (Vector3).
  inclinar(grados = 0, o = {}) {
    const lado = (o.lado || 0) * D2R, rumbo = this.base.rumbo * D2R + lado;
    const fw = V3(Math.sin(rumbo), 0, Math.cos(rumbo));
    let piv = o.pivote;
    if (!piv) {
      if (o.lado) { // vuelco lateral: el punto de los pies más alejado en esa dirección
        const pts = ['I', 'D'].flatMap((L) => ['talon', 'punta'].map((q) => this.punto(q + L)));
        piv = pts.reduce((a, b) => (b.dot(fw) > a.dot(fw) ? b : a));
      } else {
        // vuelco delante/detrás: punta del pie delantero (grados > 0) o talón del trasero (grados < 0)
        const L = this.pieDelantero(), Lt = L === 'I' ? 'D' : 'I';
        piv = grados >= 0 ? this.punto('punta' + L) : this.punto('talon' + Lt);
      }
    }
    piv = piv.clone(); piv.y = 0;
    this._pivote = piv;
    if (!grados) return piv;
    const eje = V3(0, 1, 0).cross(fw).normalize();
    const q = new THREE.Quaternion().setFromAxisAngle(eje, grados * D2R);
    this.raiz.position.sub(piv).applyQuaternion(q).add(piv);
    this.raiz.quaternion.premultiply(q);
    this.raiz.updateMatrixWorld(true);
    this._colas(this._cinta); // las caídas del cinturón siguen colgando en vertical
    this._sombras();
    return piv;
  }

  // ---------------- cara ----------------
  // {parpadeo: 0 abiertos → 1 cerrados, sonrisa: 0 suave → 1 abierta, cejas: -1 (ceño) .. 0 .. 1 (alzadas), mirada: [x, y] (-1..1)}
  cara(c = {}) {
    const cierre = Math.max(0, Math.min(1, c.parpadeo || 0)), mir = c.mirada || [0, 0];
    for (const e of this.ojos) {
      e.o.scale.y = 0.03 * (1 - 0.88 * cierre); e.o.position.y = -0.006 * cierre;
      e.o.position.x = mir[0] * 0.004 * e.s * 0 + mir[0] * 0.004; e.o.position.y += mir[1] * 0.004;
      e.b1.visible = e.b2.visible = cierre < 0.5;
      e.b1.position.set(-0.0065 + mir[0] * 0.004, 0.011 + mir[1] * 0.004, 0.0095);
    }
    const cj = c.cejas || 0;
    for (const e of this.cejas) {
      e.g.position.copy(e.base); e.g.translateY(0.008 * cj - 0.004 * cierre);
      e.c.rotation.z = Math.PI / 2 + e.s * (0.12 * cj - 0.05);
    }
    const so = Math.max(0, Math.min(1, c.sonrisa || 0));
    this.bocaArco.scale.set(1 + 0.25 * so, 1 + 0.15 * so, 1);
    this.bocaArco.visible = so < 0.55;
    this.bocaAbierta.visible = so >= 0.55;
    this.bocaAbierta.scale.set(0.022 + 0.008 * so, 0.017 + 0.006 * so, 0.006);
    return this;
  }

  // ---------------- utilidades ----------------
  cinturon(color) { this.mat.cint.color.set(CINTURONES[color] || color); return this; }
  // estilo silueta (personas reales / históricas): todo de un color, sin rostro
  silueta(color = '#1A1A1A') {
    if (!this._matOrig) { this._matOrig = new Map(); this.raiz.traverse((m) => { if (m.isMesh && !Object.values(this.sombras).includes(m)) this._matOrig.set(m, m.material); }); }
    const ms = new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide });
    for (const [m] of this._matOrig) m.material = ms;
    for (const r of this.rostro) r.visible = false;
    return this;
  }
  verRostro(v) { for (const r of this.rostro) r.visible = v; return this; }
  // Punto del mundo (THREE.Vector3): 'cabeza','pecho','cadera','nudo','manoI','manoD','codoI','hombroI','rodillaI','tobilloI','talonI','puntaI' (… y D), 'cdm'
  punto(nombre) {
    const j = this.j, w = (g, x = 0, y = 0, z = 0) => V3(x, y, z).applyMatrix4(g.matrixWorld);
    const L = nombre.slice(-1);
    switch (nombre.replace(/[ID]$/, '')) {
      case 'cabeza': return w(j.cabeza, 0, M.cabezaCentro, 0);
      case 'pecho': return w(j.tronco, 0, 0.26, 0.12);
      case 'cadera': return w(j.cadera);
      case 'nudo': return w(j.cadera, 0, 0.05, 0.17);
      case 'mano': return w(j['muneca' + L], 0, -0.05, 0);
      case 'codo': return w(j['codo' + L]);
      case 'hombro': return w(j['hombro' + L]);
      case 'rodilla': return w(j['rodilla' + L]);
      case 'tobillo': return w(j['tobillo' + L]);
      case 'talon': return PUNTOS_PLANTA[0].clone().applyMatrix4(j['tobillo' + L].matrixWorld);
      case 'punta': return PUNTOS_PLANTA[1].clone().applyMatrix4(j['tobillo' + L].matrixWorld);
      case 'cdm': return this.centroMasas();
    }
    throw new Error('punto desconocido: ' + nombre);
  }
  // centro de masas aproximado (fracciones de masa de Dempster/Winter)
  centroMasas() {
    const j = this.j, w = (g, x = 0, y = 0, z = 0) => V3(x, y, z).applyMatrix4(g.matrixWorld);
    const seg = [[0.081, w(j.cabeza, 0, M.cabezaCentro, 0)], [0.355, w(j.tronco, 0, 0.2, 0)], [0.142, w(j.cadera, 0, -0.03, 0)]];
    for (const L of ['I', 'D']) seg.push([0.028, w(j['hombro' + L], 0, -M.brazo * 0.44, 0)], [0.016, w(j['codo' + L], 0, -M.antebrazo * 0.43, 0)], [0.006, w(j['muneca' + L], 0, -0.05, 0)],
      [0.1, w(j['pierna' + L], 0, -M.muslo * 0.43, 0)], [0.0465, w(j['rodilla' + L], 0, -M.espinilla * 0.43, 0)], [0.0145, w(j['tobillo' + L], 0, -0.04, 0.05)]);
    const c = V3(0, 0, 0); let mt = 0; for (const [m, p] of seg) { c.addScaledVector(p, m); mt += m; } return c.multiplyScalar(1 / mt);
  }
  // medidas de la postura actual (para revisar técnica): base (m, talón trasero → punta delantera en la dirección de avance),
  // inclinación de la espinilla de cada pierna respecto a la vertical (°), flexión de rodillas, inclinación del tronco
  medidas() {
    const fw = V3(Math.sin(this.base.rumbo * D2R), 0, Math.cos(this.base.rumbo * D2R));
    const proy = (v) => v.dot(fw);
    const pts = ['I', 'D'].flatMap((L) => [this.punto('talon' + L), this.punto('punta' + L)]).map(proy);
    const esp = (L) => { const a = this.punto('rodilla' + L), b = this.punto('tobillo' + L); return Math.atan2(Math.hypot(a.x - b.x, a.z - b.z), a.y - b.y) / D2R; };
    const tr = V3(0, 1, 0).applyQuaternion(this.j.tronco.getWorldQuaternion(new THREE.Quaternion()));
    return { base: Math.max(...pts) - Math.min(...pts), espinillaI: esp('I'), espinillaD: esp('D'), troncoVertical: Math.acos(Math.min(1, tr.y)) / D2R, alturaCadera: this.punto('cadera').y };
  }
}

// puntos de la planta (marco del tobillo): talón, punta, borde interior/exterior del metatarso
const PUNTOS_PLANTA = [V3(0, -M.tobillo, -0.058), V3(0, -M.tobillo, 0.185), V3(0.035, -M.tobillo, 0.11), V3(-0.035, -M.tobillo, 0.11)];

export const POSE_NEUTRA = { nombre: 'neutra', brazoI: { abre: 6 }, brazoD: { abre: 6 }, codoI: 8, codoD: 8, manoI: 1, manoD: 1 };

// ---------- poses ----------
const esObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const GRUPOS = {
  piernas: ['cadera', 'piernaI', 'piernaD', 'rodillaI', 'rodillaD', 'tobilloI', 'tobilloD'],
  brazos: ['brazoI', 'brazoD', 'codoI', 'codoD', 'munecaI', 'munecaD', 'manoI', 'manoD'],
  tronco: ['tronco'], cabeza: ['cabeza']
};
// Mezcla dos poses (f = 0 → a, 1 → b). f puede ser un número o {piernas, brazos, tronco, cabeza} para mover cada parte a su ritmo.
export function mezclar(a, b, f) {
  const fde = (k) => { if (typeof f === 'number') return f; for (const g in GRUPOS) if (GRUPOS[g].includes(k)) return f[g] ?? 0; return f.resto ?? 0; };
  const mix = (x, y, t) => {
    if (typeof x === 'number' || typeof y === 'number') {
      const nx = typeof x === 'number' ? x : (esObj(x) ? null : 0), ny = typeof y === 'number' ? y : (esObj(y) ? null : 0);
      if (nx !== null && ny !== null) return nx + (ny - nx) * t;
      // número contra objeto (p. ej. tobillo: 5 frente a {flex, ladeo})
      return mix(esObj(x) ? x : { flex: x || 0 }, esObj(y) ? y : { flex: y || 0 }, t);
    }
    if (esObj(x) || esObj(y)) { const o = {}; for (const k of new Set([...Object.keys(x || {}), ...Object.keys(y || {})])) o[k] = mix((x || {})[k] ?? 0, (y || {})[k] ?? 0, t); return o; }
    return t < 0.5 ? x : y;
  };
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (['nombre', 'descripcion', 'tecnica', 'medidas'].includes(k)) continue;
    out[k] = mix(a[k] ?? (esObj(b[k]) ? {} : 0), b[k] ?? (esObj(a[k]) ? {} : 0), fde(k));
  }
  return out;
}
// Copia de una pose en espejo (izquierda ↔ derecha): para pasar de hidari a migi.
export function espejo(p) {
  const o = {};
  for (const k in p) {
    const k2 = k.endsWith('I') ? k.slice(0, -1) + 'D' : k.endsWith('D') ? k.slice(0, -1) + 'I' : k;
    o[k2] = esObj(p[k]) ? { ...p[k] } : p[k];
  }
  for (const k of ['cadera', 'tronco', 'cabeza']) if (o[k]) o[k] = { ...o[k], giro: -(o[k].giro || 0), ladeo: -(o[k].ladeo || 0) };
  return o;
}
// Carga las poses 3D. render.mjs las inyecta en window.EMAKI_POSES3D; si no (navegador normal), las pide por XHR.
export function cargarPoses(nombres = ['yoi', 'kamae', 'zenkutsu-dachi', 'zenkutsu-bajo', 'pies-juntos', 'gedan-barai-prep', 'zenkutsu-bajo-misma-base', 'rei', 'cargar-viga', 'brazos-arriba', 'maestro-seiza-pincel', 'maestro-pie-escribiendo', 'maestro-manos-atras']) {
  const P = Object.assign({}, (typeof window !== 'undefined' && window.EMAKI_POSES3D) || {});
  for (const n of nombres) if (!P[n] && typeof XMLHttpRequest !== 'undefined') {
    try { const x = new XMLHttpRequest(); x.open('GET', new URL('./poses/' + n + '.json', import.meta.url).href, false); x.send(); if (x.status === 200 || x.status === 0) P[n] = JSON.parse(x.responseText); } catch (e) { console.warn('pose 3D no encontrada', n); }
  }
  P.neutra = P.neutra || POSE_NEUTRA;
  return P;
}
