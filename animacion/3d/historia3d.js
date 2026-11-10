// KARATE EMAKI · biblioteca 3D para las piezas de historia: casa-dōjō (pop, construcción por partes, contorno
// fantasma discontinuo, maqueta, rótulo con kanji), exteriores (atardecer, calle, noche), pinos con viento,
// mar de pinos, el maestro (siempre de espaldas / a contraluz, sin rasgos), alumnos, vigas, filas, carteles.
// Mismo universo que karateka3d.js (arcilla / vinilo, luz cálida). Determinista: todo depende de t / parámetros.
import * as THREE from './lib/three.module.min.js';
import { Karateka3D, CINTURONES, mezclar } from './karateka3d.js';
import { kanji as kanji2D, rng, hash, fbm, ROJO, TINTA, CENIZA, FUENTE_KANJI } from './historia2d.js';

export { THREE };
const D2R = Math.PI / 180;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const fuenteTitulo = () => (typeof window !== 'undefined' && window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, sans-serif');

export const COLORES = {
  maderaOscura: '#5E3D27', maderaMedia: '#8A6142', maderaClara: '#C9A06B', maderaNueva: '#D8B07A',
  yeso: '#EFE5D3', teja: '#5A5E68', tejaCanto: '#44474F', piedra: '#A39B8E', papel: '#F6EFDF',
  pino: '#3B5A36', corteza: '#5A3D2E', hierba: '#7F7B46', tierra: '#B79D79', rojo: ROJO, ceniza: CENIZA
};

// ======================================================================
// Texturas procedurales (deterministas)
// ======================================================================
const _tex = {};
function texVeta(vertical, semilla = 3) { // veta de madera en gris claro (se tiñe con el color del material)
  const key = 'veta' + vertical + semilla; if (_tex[key]) return _tex[key];
  const N = 256, c = lienzo(N, N), g = c.getContext('2d'), r = rng(semilla);
  g.fillStyle = '#E8E8E8'; g.fillRect(0, 0, N, N);
  for (let k = 0; k < 26; k++) {
    const p = r() * N, a = 0.05 + r() * 0.12, fr = 0.01 + r() * 0.03, ph = r() * 6;
    g.strokeStyle = `rgba(60,40,25,${a})`; g.lineWidth = 1 + r() * 2.5; g.beginPath();
    for (let s = 0; s <= N; s += 4) { const q = p + Math.sin(s * fr + ph) * 5; vertical ? g.lineTo(q, s) : g.lineTo(s, q); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; _tex[key] = t; return t;
}
function texTablas() { // tablas verticales (koshiita / fachadas)
  if (_tex.tablas) return _tex.tablas;
  const N = 256, c = lienzo(N, N), g = c.getContext('2d'), r = rng(21);
  for (let i = 0; i < 8; i++) { const v = 205 + r() * 40; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i * 32, 0, 32, N); g.fillStyle = 'rgba(30,20,10,0.45)'; g.fillRect(i * 32, 0, 3, N);
    g.strokeStyle = 'rgba(60,40,25,0.12)'; for (let k = 0; k < 3; k++) { g.beginPath(); const x = i * 32 + 6 + r() * 22; g.moveTo(x, 0); g.bezierCurveTo(x + 4, 80, x - 4, 170, x + 2, N); g.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; _tex.tablas = t; return t;
}
function texShoji(nx = 3, ny = 5) { // papel de shōji con retícula de madera clara
  const key = 'shoji' + nx + ny; if (_tex[key]) return _tex[key];
  const c = lienzo(256, 512), g = c.getContext('2d');
  g.fillStyle = '#F7F0E1'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#C69C6A'; for (let i = 1; i < nx; i++) g.fillRect(i * 256 / nx - 4, 0, 8, 512); for (let j = 1; j < ny; j++) g.fillRect(0, j * 512 / ny - 4, 256, 8);
  g.strokeStyle = '#B88C5C'; g.lineWidth = 20; g.strokeRect(0, 0, 256, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; _tex[key] = t; return t;
}
function texCelosia() { // celosía de listones verticales (koshi) sobre fondo oscuro
  if (_tex.celosia) return _tex.celosia;
  const c = lienzo(256, 256), g = c.getContext('2d');
  g.fillStyle = '#2A1E16'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#9A7048';
  for (let i = 0; i < 12; i++) g.fillRect(i * 256 / 12 + 3, 0, 12, 256);
  g.fillRect(0, 0, 256, 14); g.fillRect(0, 242, 256, 14); g.fillRect(0, 120, 256, 10);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; _tex.celosia = t; return t;
}

// ======================================================================
// Geometría
// ======================================================================
// Fusiona geometrías (position, normal y, si todas lo tienen, uv) en una sola
export function fusionar(geos) {
  const conUV = geos.every((g) => g.attributes.uv);
  const P = [], N = [], UV = [], I = []; let off = 0;
  for (let g of geos) {
    if (!g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); if (conUV) UV.push(g.attributes.uv.getX(i), g.attributes.uv.getY(i)); }
    if (g.index) for (let i = 0; i < g.index.count; i++) I.push(g.index.getX(i) + off); else for (let i = 0; i < p.count; i++) I.push(i + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  if (conUV) out.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  out.setIndex(I); return out;
}
// Caja con el origen en la base (crece hacia arriba al escalar en Y). UV escaladas para que la veta no se estire.
function caja(w, h, d, mat, x = 0, y = 0, z = 0, padre = null, uvEscala = 1) {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0);
  if (uvEscala) { const uv = g.attributes.uv, n = g.attributes.normal; for (let i = 0; i < uv.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)); const su = ax > 0.5 ? d : w, sv = ay > 0.5 ? d : h; uv.setXY(i, uv.getX(i) * su * uvEscala, uv.getY(i) * sv * uvEscala); } }
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (padre) padre.add(m); return m;
}
// Esfera grumosa (copas de pino, nubes): determinista por semilla
function grumo(semilla = 1, w = 18, h = 12) {
  const g = new THREE.SphereGeometry(1, w, h), p = g.attributes.position, v = V3(0, 0, 0), s = semilla * 1.37;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const th = Math.atan2(v.z, v.x), k = 1 + 0.13 * Math.sin(th * 3 + s) * Math.cos(v.y * 3 + s * 2) + 0.07 * Math.sin(th * 7 + v.y * 5 + s * 3);
    p.setXYZ(i, v.x * k, (v.y < 0 ? v.y * 0.55 : v.y) * k, v.z * k);
  }
  g.computeVertexNormals(); return g;
}
// Tubo afinado a lo largo de una curva (troncos, ramas)
function tuboAfinado(curva, r0, r1, segs = 16, rad = 8) {
  const g = new THREE.TubeGeometry(curva, segs, 1, rad, false), p = g.attributes.position, v = V3(0, 0, 0);
  for (let i = 0; i <= segs; i++) {
    const c = curva.getPointAt(i / segs), r = lerp(r0, r1, i / segs);
    for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, v.x, v.y, v.z); }
  }
  g.computeVertexNormals(); return g;
}
// Losa de tejado de una vertiente (hacia +Z), con tejas curvas (maru-gawara), curvatura (sori) y aleros respingones.
// Devuelve { arriba, abajo } (dos geometrías) y la función de la superficie sup(u, v).
function vertiente({ ancho, run, yCumbre, pend, sori = 0.12, respingo = 0.22, grosor = 0.14, nTejas = 28, filas = 10, nv = 20, conTejas = true }) {
  const nu = conTejas ? nTejas * 6 : 24;
  const sup = (u, v, tejas = true) => {
    const x = (u - 0.5) * ancho, z = v * run;
    let y = yCumbre - z * pend - sori * Math.sin(Math.PI * v) * 0.5 - sori * 0.4 * v * v + respingo * Math.pow(Math.abs(2 * u - 1), 6) * v * v;
    if (tejas && conTejas) { const f = (u * nTejas) % 1; y += 0.045 * Math.pow(Math.sin(Math.PI * f), 0.7); const fv = (v * filas) % 1; y += 0.022 * fv * fv; }
    return V3(x, y, z);
  };
  const capa = (dy, tejas, invertir) => {
    const pos = [], idx = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const q = sup(i / nu, j / nv, tejas); pos.push(q.x, q.y + dy, q.z); }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; if (invertir) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  // cantos: alero (v = 1) y los dos lados (u = 0, 1)
  const canto = () => {
    const pos = [], idx = []; let n = 0;
    const tira = (pts) => { for (let k = 0; k < pts.length - 1; k++) { const [a, b] = [pts[k], pts[k + 1]]; const a2 = a.clone(); a2.y -= grosor; const b2 = b.clone(); b2.y -= grosor; pos.push(...a.toArray(), ...b.toArray(), ...a2.toArray(), ...b2.toArray()); idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3, n, n + 1, n + 2, n + 1, n + 3, n + 2); n += 4; } };
    const M = 60; tira(Array.from({ length: M + 1 }, (_, i) => sup(i / M, 1, false).add(V3(0, 0.03, 0))));
    for (const u of [0, 1]) tira(Array.from({ length: nv + 1 }, (_, j) => sup(u, j / nv, false).add(V3(0, 0.03, 0))));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  return { arriba: capa(0, true, false), canto: canto(), abajo: capa(-grosor, false, true), sup };
}
// Líneas discontinuas como tubos (gruesas de verdad, a diferencia de las líneas de WebGL). polilineas: [[V3,…],…]
// Devuelve una geometría no indexada ordenada por recorrido: drawRange permite «dibujarla» de 0 a 1.
function discontinua(polilineas, { radio = 0.03, trazo = 0.24, hueco = 0.14, lados = 6 } = {}) {
  const pos = [], nor = [], tramos = [];
  const tubo = (a, b) => {
    const d = b.clone().sub(a), L = d.length(); if (L < 1e-4) return; d.normalize();
    const e1 = Math.abs(d.y) < 0.9 ? V3(0, 1, 0).cross(d).normalize() : V3(1, 0, 0).cross(d).normalize(), e2 = d.clone().cross(e1);
    for (let s = 0; s < lados; s++) {
      const a0 = (s / lados) * Math.PI * 2, a1 = ((s + 1) / lados) * Math.PI * 2;
      const n0 = e1.clone().multiplyScalar(Math.cos(a0)).addScaledVector(e2, Math.sin(a0)), n1 = e1.clone().multiplyScalar(Math.cos(a1)).addScaledVector(e2, Math.sin(a1));
      const p00 = a.clone().addScaledVector(n0, radio), p01 = a.clone().addScaledVector(n1, radio), p10 = b.clone().addScaledVector(n0, radio), p11 = b.clone().addScaledVector(n1, radio);
      for (const [p, n] of [[p00, n0], [p10, n0], [p01, n1], [p01, n1], [p10, n0], [p11, n1]]) { pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); }
    }
  };
  for (const pl of polilineas) {
    // remuestrea la polilínea por longitud de arco
    const L = []; let tot = 0; for (let i = 0; i < pl.length - 1; i++) { const l = pl[i].distanceTo(pl[i + 1]); L.push(l); tot += l; }
    const en = (s) => { let acc = 0; for (let i = 0; i < L.length; i++) { if (s <= acc + L[i] || i === L.length - 1) return pl[i].clone().lerp(pl[i + 1], clamp((s - acc) / L[i])); acc += L[i]; } return pl[pl.length - 1].clone(); };
    const paso = trazo + hueco, n = Math.max(1, Math.round(tot / paso)), esc = tot / (n * paso);
    for (let k = 0; k < n; k++) {
      const s0 = k * paso * esc, s1 = s0 + trazo * esc, sub = 3;
      for (let q = 0; q < sub; q++) tubo(en(s0 + (s1 - s0) * q / sub), en(s0 + (s1 - s0) * (q + 1) / sub));
      tramos.push(pos.length / 3);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.userData.tramos = tramos; return g;
}

// ======================================================================
// Texturas con kanji / texto (rótulos, papeles, carteles)
// ======================================================================
// Lienzo que se repinta solo cuando cambia el progreso. fondo: 'madera' | 'papel' | 'transparente'
export class TexturaKanji {
  constructor({ texto = '', vertical = false, fondo = 'madera', color = ROJO, ancho = 512, alto = 256, tam = null, margen = 0.12 } = {}) {
    this.c = lienzo(ancho, alto); this.g = this.c.getContext('2d');
    this.textura = new THREE.CanvasTexture(this.c); this.textura.colorSpace = THREE.SRGBColorSpace; this.textura.anisotropy = 4;
    Object.assign(this, { texto, vertical, fondo, color, tam, margen }); this._p = null; this.dibujar(1);
  }
  fijar(texto, o = {}) { Object.assign(this, { texto }, o); this._p = null; return this; }
  dibujar(prog = 1) {
    if (this._p === prog) return this; this._p = prog;
    const { c, g } = this, W = c.width, H = c.height;
    g.clearRect(0, 0, W, H);
    if (this.fondo === 'madera') fondoMadera(g, W, H); else if (this.fondo === 'papel') fondoPapel(g, W, H);
    const n = [...this.texto].length;
    if (n) {
      const disp = (this.vertical ? H : W) * (1 - 2 * this.margen), otro = (this.vertical ? W : H) * (1 - 2 * this.margen);
      const s = this.tam || Math.min(otro, disp / n / 1.02);
      kanji2D(g, this.texto, W / 2, H / 2, s, { prog, vertical: this.vertical, color: this.color, sangrado: this.fondo === 'madera' ? 1.5 : null });
    }
    this.textura.needsUpdate = true; return this;
  }
}
function fondoMadera(g, W, H) {
  const r = rng(77); g.fillStyle = '#CFA672'; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 40; k++) { const y = r() * H, a = 0.05 + r() * 0.1, fr = 0.004 + r() * 0.01, ph = r() * 6; g.strokeStyle = `rgba(110,70,35,${a})`; g.lineWidth = 1 + r() * 3; g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin(x * fr + ph) * H * 0.03); g.stroke(); }
  const b = Math.min(W, H) * 0.05; g.strokeStyle = 'rgba(70,42,22,0.55)'; g.lineWidth = b; g.strokeRect(b / 2, b / 2, W - b, H - b);
}
function fondoPapel(g, W, H) {
  g.fillStyle = '#F7F0E0'; g.fillRect(0, 0, W, H); const r = rng(5);
  for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(150,130,100,${0.03 + r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2); }
  const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(120,95,60,0.18)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function texturaTexto(texto, { ancho = 1024, alto = 256, fondo = 'madera', color = TINTA, peso = 900 } = {}) {
  const c = lienzo(ancho, alto), g = c.getContext('2d');
  if (fondo === 'madera') fondoMadera(g, ancho, alto); else if (fondo === 'papel') fondoPapel(g, ancho, alto);
  let s = alto * 0.62; g.font = `${peso} ${s}px ${fuenteTitulo()}`; const w = g.measureText(texto).width; if (w > ancho * 0.84) { s *= ancho * 0.84 / w; g.font = `${peso} ${s}px ${fuenteTitulo()}`; }
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, ancho / 2, alto / 2 + s * 0.05);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ======================================================================
// CASA-DŌJŌ
// ======================================================================
// o: { rotulo: '' | '松濤館', rotuloVertical: false, fantasma: '#C8102E' (color del contorno), grosorLinea: 0.035 (m, mundo),
//      maqueta: false (casa de 0,12 de escala sobre una tablilla), escala, sombras: true }
// Medidas (escala 1): 6,0 m de frente × 4,2 m de fondo, cumbrera a ≈4,1 m; la puerta da a +Z; origen en el suelo, centro.
export function crearCasa(o = {}) {
  o = Object.assign({ rotulo: '', rotuloVertical: false, fantasma: ROJO, grosorLinea: 0.035, maqueta: false, sombras: true }, o);
  const escala = o.escala || (o.maqueta ? 0.12 : 1);
  const raiz = new THREE.Group(); raiz.name = 'casa';
  const cuerpo = new THREE.Group(); raiz.add(cuerpo);       // lo sólido
  const W = 6.0, D = 4.2, y0 = 0.32, Hm = 2.5, topY = y0 + Hm, ov = 0.68, pend = 0.5, yPuerta = 1.72;
  const yCumbre = topY + 0.36 + (D / 2) * pend, run = D / 2 + ov, anchoT = W + 2 * 0.62;
  // materiales propios de cada casa (para teñir, transparentar o hacer arder sin afectar a otras)
  const M = {
    oscura: new THREE.MeshStandardMaterial({ color: COLORES.maderaOscura, map: texVeta(true, 4), roughness: 0.72, envMapIntensity: 0.6 }),
    oscuraH: new THREE.MeshStandardMaterial({ color: COLORES.maderaOscura, map: texVeta(false, 5), roughness: 0.72, envMapIntensity: 0.6 }),
    clara: new THREE.MeshStandardMaterial({ color: COLORES.maderaClara, map: texVeta(false, 6), roughness: 0.65, envMapIntensity: 0.6 }),
    yeso: new THREE.MeshStandardMaterial({ color: COLORES.yeso, roughness: 0.9, envMapIntensity: 0.5 }),
    tablas: new THREE.MeshStandardMaterial({ color: '#7A5236', map: texTablas(), roughness: 0.8, envMapIntensity: 0.5 }),
    teja: new THREE.MeshStandardMaterial({ color: COLORES.teja, roughness: 0.48, metalness: 0.05, envMapIntensity: 0.9, side: THREE.DoubleSide }),
    canto: new THREE.MeshStandardMaterial({ color: COLORES.tejaCanto, roughness: 0.6, envMapIntensity: 0.6, side: THREE.DoubleSide }),
    bajoTejado: new THREE.MeshStandardMaterial({ color: '#4E3424', map: texVeta(false, 9), roughness: 0.8, envMapIntensity: 0.4, side: THREE.DoubleSide }),
    piedra: new THREE.MeshStandardMaterial({ color: COLORES.piedra, roughness: 0.92, envMapIntensity: 0.4 }),
    shoji: new THREE.MeshStandardMaterial({ map: texShoji(3, 5), roughness: 0.85, envMapIntensity: 0.5, emissive: '#FFB25C', emissiveIntensity: 0 }),
    celosia: new THREE.MeshStandardMaterial({ map: texCelosia(), roughness: 0.8, envMapIntensity: 0.4 }),
    interior: new THREE.MeshBasicMaterial({ color: '#1E140E' })
  };
  for (const k of ['oscura', 'oscuraH', 'clara', 'tablas', 'bajoTejado']) M[k].map = M[k].map.clone(), M[k].map.needsUpdate = true;
  const piezas = []; // { obj, a, b, tipo: 'crecer'|'caer', y }
  const pieza = (obj, a, b, tipo = 'crecer') => { piezas.push({ obj, a, b, tipo, y: obj.position.y, s: obj.scale.clone() }); cuerpo.add(obj); return obj; };
  const grupoEn = (x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); return g; };

  // --- base de piedra y escalón ---
  pieza(caja(W + 0.5, y0, D + 0.5, M.piedra, 0, 0, 0), 0, 0.06);
  pieza(caja(1.9, 0.16, 0.42, M.piedra, 0, 0, D / 2 + 0.25 + 0.21), 0.02, 0.08);
  // --- postes (0,08 → 0,36) ---
  const postes = [[-3, 2.1], [3, 2.1], [-3, -2.1], [3, -2.1], [-0.95, 2.1], [0.95, 2.1], [-2, 2.1], [2, 2.1], [-1, -2.1], [1, -2.1], [-3, 0], [3, 0]];
  postes.forEach(([x, z], i) => pieza(caja(0.17, Hm + 0.02, 0.17, M.oscura, x, y0, z), 0.08 + i * 0.018, 0.16 + i * 0.018));
  // --- vigas (0,34 → 0,6): durmientes, dintel, soleras, pendolones, cumbrera, pares ---
  const vigas = [];
  const viga = (w, h, d, x, y, z, mat = M.oscuraH) => { const g = grupoEn(x, y, z); caja(w, h, d, mat, 0, 0, 0, g); vigas.push(g); return g; };
  viga(W + 0.5, 0.2, 0.22, 0, topY, D / 2); viga(W + 0.5, 0.2, 0.22, 0, topY, -D / 2);
  viga(0.22, 0.2, D + 0.4, -W / 2, topY - 0.001, 0); viga(0.22, 0.2, D + 0.4, W / 2, topY - 0.001, 0);
  viga(W + 0.1, 0.12, 0.2, 0, y0 + yPuerta, D / 2 + 0.01);                            // dintel (kamoi / nageshi)
  for (const x of [-W / 2, W / 2]) viga(0.14, yCumbre - topY - 0.36, 0.14, x, topY + 0.2, 0, M.oscura); // pendolones del hastial
  viga(anchoT - 0.2, 0.2, 0.2, 0, yCumbre - 0.42, 0);                            // cumbrera (munagi)
  for (const x of [-W / 2, -1.0, 1.0, W / 2]) for (const s of [1, -1]) {         // pares (rafters) inclinados
    const L = Math.hypot(run, run * pend) * 0.93, g = grupoEn(x, yCumbre - 0.36, 0);
    const m = caja(0.12, 0.14, L, M.oscuraH, 0, -0.07, 0, g); m.geometry.translate(0, 0, L / 2); g.rotation.set(Math.atan(pend), s > 0 ? 0 : Math.PI, 0, 'YXZ'); vigas.push(g);
  }
  vigas.forEach((g, i) => pieza(g, 0.34 + i * 0.012, 0.44 + i * 0.012, 'caer'));
  // --- paredes (0,56 → 0,72) ---
  const paredes = [];
  const panel = (x0, x1, z, lado, ventana) => { // panel de pared entre dos postes (fachadas delantera/trasera: lado = 'z'; laterales: 'x')
    const g = new THREE.Group(), w = Math.abs(x1 - x0) - 0.17, cx = (x0 + x1) / 2;
    caja(w, 0.85, 0.08, M.tablas, 0, y0, 0, g, 1.2);
    caja(w, Hm - 0.85, 0.06, M.yeso, 0, y0 + 0.85, 0, g, 0);
    caja(w, 0.05, 0.1, M.oscuraH, 0, y0 + 0.83, 0, g);
    if (ventana) { const v = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 0.6), M.celosia); v.position.set(0, y0 + 1.35, 0.045); g.add(v); caja(w * 0.7 + 0.1, 0.06, 0.1, M.oscuraH, 0, y0 + 1.02, 0.02, g); }
    if (lado === 'z') g.position.set(cx, 0, z); else { g.position.set(z, 0, cx); g.rotation.y = z > 0 ? Math.PI / 2 : -Math.PI / 2; }
    paredes.push(g);
  };
  panel(-3, -2, D / 2, 'z', false); panel(-2, -0.95, D / 2, 'z', true); panel(0.95, 2, D / 2, 'z', true); panel(2, 3, D / 2, 'z', false);
  { const g = panel(-3, 3, -D / 2, 'z', false); void g; }
  paredes[paredes.length - 1].rotation.y = Math.PI;
  panel(-2.1, 0, -W / 2, 'x', true); panel(0, 2.1, -W / 2, 'x', false); panel(-2.1, 0, W / 2, 'x', false); panel(0, 2.1, W / 2, 'x', true);
  // hastiales (triángulos de yeso con marco)
  for (const x of [-W / 2, W / 2]) {
    const sh = new THREE.Shape(); const hz = D / 2 + 0.05, hy = (D / 2 + 0.05) * pend;
    sh.moveTo(-hz, 0); sh.lineTo(hz, 0); sh.lineTo(0, hy + 0.05); sh.closePath();
    const tri = new THREE.Mesh(new THREE.ShapeGeometry(sh), M.yeso); tri.castShadow = tri.receiveShadow = true;
    const g = new THREE.Group(); g.add(tri); tri.position.y = topY + 0.18; tri.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; tri.position.x = x * 1.003; paredes.push(g);
  }
  paredes.forEach((g, i) => pieza(g, 0.56 + i * 0.012, 0.66 + i * 0.012, 'crecer'));
  // --- puerta corredera, rótulo, interior (0,7 → 0,78) ---
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), M.interior); interior.position.set(0, y0 + 0.9, D / 2 - 0.3);
  const puerta = new THREE.Group();
  const hojas = [-1, 1].map((s) => { const h = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.88, yPuerta - 0.06), M.shoji); p.position.y = (yPuerta - 0.04) / 2; h.add(p); caja(0.88, 0.06, 0.06, M.clara, 0, 0, 0, h); caja(0.88, 0.06, 0.06, M.clara, 0, yPuerta - 0.08, 0, h); caja(0.06, yPuerta - 0.02, 0.06, M.clara, -0.41, 0, 0, h); caja(0.06, yPuerta - 0.02, 0.06, M.clara, 0.41, 0, 0, h); h.position.set(s * 0.44, y0 + 0.02, D / 2 + 0.02 + (s > 0 ? 0.05 : 0)); puerta.add(h); return h; });
  caja(1.9, 0.04, 0.16, M.clara, 0, y0, D / 2 + 0.04, puerta);       // umbral (shikii)
  puerta.add(interior);
  pieza(puerta, 0.7, 0.78, 'crecer');
  const texR = new TexturaKanji(o.rotuloVertical ? { texto: o.rotulo, vertical: true, ancho: 256, alto: 768 } : { texto: o.rotulo, vertical: false, ancho: 768, alto: 256 });
  const rot = new THREE.Group();
  {
    const [rw, rh] = o.rotuloVertical ? [0.42, 1.26] : [1.5, 0.46];
    const mats = [M.clara, M.clara, M.clara, M.clara, new THREE.MeshStandardMaterial({ map: texR.textura, roughness: 0.7, envMapIntensity: 0.5 }), M.clara];
    const tabla = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, 0.05), mats); tabla.castShadow = tabla.receiveShadow = true; rot.add(tabla);
    if (o.rotuloVertical) rot.position.set(1.47, y0 + 1.15, D / 2 + 0.1); else rot.position.set(0, y0 + yPuerta + 0.33, D / 2 + 0.14);
    M.rotuloCara = mats[4];
  }
  pieza(rot, 0.74, 0.8, 'caer');
  // --- tejado (0,76 → 1) ---
  const ver = vertiente({ ancho: anchoT, run, yCumbre, pend });
  for (const s of [1, -1]) {
    const g = new THREE.Group();
    const a = new THREE.Mesh(ver.arriba, M.teja), b = new THREE.Mesh(ver.abajo, M.bajoTejado), c = new THREE.Mesh(ver.canto, M.canto);
    a.castShadow = true; a.receiveShadow = true; b.receiveShadow = true; g.add(a, b, c); if (s < 0) g.rotation.y = Math.PI; pieza(g, s > 0 ? 0.8 : 0.76, s > 0 ? 0.94 : 0.9, 'caer');
  }
  {
    const g = new THREE.Group();
    const cum = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, anchoT - 0.5, 6, 16), M.teja); cum.rotation.z = Math.PI / 2; cum.scale.set(1, 1, 1.15); cum.position.y = yCumbre + 0.09; cum.castShadow = true; g.add(cum);
    caja(anchoT - 0.35, 0.16, 0.34, M.teja, 0, yCumbre - 0.02, 0, g, 0);
    for (const s of [1, -1]) { const oni = caja(0.16, 0.42, 0.42, M.teja, s * (anchoT / 2 - 0.12), yCumbre - 0.06, 0, g, 0); oni.rotation.z = -s * 0.12; }
    pieza(g, 0.9, 1.0, 'caer');
  }
  // --- tablilla de maqueta ---
  if (o.maqueta) { const t = caja(W + 1.6, 0.2, D + 1.6, M.clara, 0, -0.2, 0); cuerpo.add(t); }

  // --- contorno fantasma (líneas discontinuas) ---
  const pl = [];
  const P = (x, y, z) => V3(x, y, z);
  const rect = (y, w, d) => [P(-w / 2, y, d / 2), P(w / 2, y, d / 2), P(w / 2, y, -d / 2), P(-w / 2, y, -d / 2), P(-w / 2, y, d / 2)];
  pl.push([P(-W / 2 - 0.25, y0, D / 2 + 0.25), P(W / 2 + 0.25, y0, D / 2 + 0.25)]);                // borde de la base (delante)
  for (const [x, z] of [[-3, 2.1], [3, 2.1], [3, -2.1], [-3, -2.1], [-0.95, 2.1], [0.95, 2.1]]) pl.push([P(x, y0, z), P(x, topY + 0.1, z)]);
  pl.push(rect(topY + 0.1, W, D));
  pl.push([P(-0.95, y0 + yPuerta, D / 2), P(0.95, y0 + yPuerta, D / 2)]);                                    // dintel
  { const [rw, rh] = o.rotuloVertical ? [0.42, 1.26] : [1.5, 0.46], c = rot.position; pl.push([P(c.x - rw / 2, c.y - rh / 2, c.z), P(c.x + rw / 2, c.y - rh / 2, c.z), P(c.x + rw / 2, c.y + rh / 2, c.z), P(c.x - rw / 2, c.y + rh / 2, c.z), P(c.x - rw / 2, c.y - rh / 2, c.z)]); }
  const S = (u, v, s) => { const q = ver.sup(u, v, false); q.y += 0.05; if (s < 0) { q.x = -q.x; q.z = -q.z; } return q; };
  for (const s of [1, -1]) {
    pl.push(Array.from({ length: 31 }, (_, i) => S(i / 30, 1, s)));                                // alero
    for (const u of [0, 1]) pl.push(Array.from({ length: 13 }, (_, j) => S(u, 1 - j / 12, s)));   // limatesas del hastial
  }
  pl.push([P(-anchoT / 2 + 0.12, yCumbre + 0.2, 0), P(anchoT / 2 - 0.12, yCumbre + 0.2, 0)]);       // cumbrera
  for (const x of [-W / 2, W / 2]) pl.push([P(x, topY + 0.1, D / 2), P(x, yCumbre - 0.05, 0), P(x, topY + 0.1, -D / 2)]); // hastiales
  const geoF = discontinua(pl, { radio: o.grosorLinea / escala * (o.maqueta ? 0.5 : 1), trazo: 0.26, hueco: 0.15 });
  const matF = new THREE.MeshBasicMaterial({ color: o.fantasma, transparent: true, opacity: 1, depthWrite: true, fog: false });
  const fantasma = new THREE.Mesh(geoF, matF); fantasma.visible = false; fantasma.renderOrder = 2; raiz.add(fantasma);

  raiz.scale.setScalar(escala);
  raiz.traverse((m) => { if (m.isMesh && m !== fantasma) { m.castShadow = o.sombras && m.castShadow; m.receiveShadow = true; } });
  const solidos = Object.values(M).filter((m) => m && m.isMaterial && m !== M.interior);
  const orig = new Map(solidos.map((m) => [m, { color: m.color.clone(), emissive: m.emissive ? m.emissive.clone() : null, ei: m.emissiveIntensity }]));
  let _pop = 1, _x = 0, _z = 0, _rumbo = 0;
  const casa = {
    raiz, cuerpo, fantasma, materiales: M, rotulo: texR, puertaHojas: hojas, medidas: { W, D, y0, topY, yCumbre, escala, puerta: V3(0, y0, D / 2), rotulo: rot.position.clone() },
    colocar(x = 0, z = 0, rumbo = 0) { _x = x; _z = z; _rumbo = rumbo; raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return casa; },
    // Aparición con rebote (0 → 1). Escala desde el suelo.
    pop(p) { _pop = p; const s = p <= 0 ? 0.0001 : p >= 1 ? 1 : easeBack(p); raiz.scale.set(escala * s, escala * (p <= 0 ? 0.0001 : s * (1 + 0.08 * Math.sin(p * Math.PI))), escala * s); raiz.visible = p > 0; return casa; },
    // Construcción por partes: base 0–0,08 · postes 0,08–0,36 · vigas 0,34–0,6 · paredes 0,56–0,8 · puerta y rótulo 0,7–0,8 · tejado 0,76–1
    construir(p) {
      for (const q of piezas) {
        const f = clamp((p - q.a) / (q.b - q.a)); q.obj.visible = f > 0;
        if (q.tipo === 'crecer') { q.obj.scale.set(q.s.x, q.s.y * Math.max(0.001, f >= 1 ? 1 : easeBack(f)), q.s.z); q.obj.position.y = q.y; }
        else { q.obj.position.y = q.y + (1 - easeOut(f)) * 1.1; q.obj.scale.copy(q.s); }
      }
      return casa;
    },
    // 'solido' | 'fantasma' | 'ambos'
    modo(m = 'solido') { cuerpo.visible = m !== 'fantasma'; fantasma.visible = m !== 'solido'; return casa; },
    // Contorno fantasma: { color, alfa, dibujar: 0..1 (trazo a trazo) }
    contorno({ color, alfa = 1, dibujar = 1 } = {}) {
      if (color) matF.color.set(color); matF.opacity = alfa; fantasma.visible = alfa > 0 && dibujar > 0;
      const tr = geoF.userData.tramos, k = Math.floor(clamp(dibujar) * tr.length); geoF.setDrawRange(0, dibujar >= 1 ? Infinity : (k ? tr[k - 1] : 0)); return casa;
    },
    // Transparencia de lo sólido (fundidos). 1 = opaco.
    opacidad(a) { for (const m of solidos) { m.transparent = a < 1; m.opacity = a; m.depthWrite = a > 0.5; } cuerpo.visible = a > 0; return casa; },
    // Fuego (0..1): la casa se tiñe de rojo y se oscurece hacia el carbón. Combínalo con historia2d.resplandor().
    arder(p) {
      for (const m of solidos) { const q = orig.get(m); m.color.copy(q.color).lerp(new THREE.Color('#2A1612'), 0.55 * p); if (m.emissive) { m.emissive.set(ROJO); m.emissiveIntensity = 0.75 * p * (m === M.shoji ? 1.5 : 1); } }
      return casa;
    },
    // Luz cálida tras el shōji (noche): 0..1
    luzInterior(f) { M.shoji.emissive.set('#FFB25C'); M.shoji.emissiveIntensity = 0.9 * f; return casa; },
    // Puerta corredera: 0 cerrada → 1 abierta (la hoja derecha corre por detrás de la izquierda)
    puerta(f) { hojas[1].position.x = 0.44 - 0.86 * clamp(f); return casa; },
    // Rótulo: texto y progreso de trazo (0..1). casa.escribirRotulo('松濤館', prog)
    escribirRotulo(texto, prog = 1) { if (texto !== texR.texto) texR.fijar(texto); texR.dibujar(prog); return casa; },
    // grupo del rótulo (para animarlo aparte: colgarlo, bajarlo…)
    rotuloObj: rot,
    restaurar() { for (const [m, q] of orig) { m.color.copy(q.color); if (m.emissive) { m.emissive.copy(q.emissive); m.emissiveIntensity = q.ei; } } return casa.opacidad(1); }
  };
  casa.construir(1); casa.modo('solido');
  return casa;
}
export const crearMaqueta = (o = {}) => crearCasa(Object.assign({ maqueta: true }, o));

// ======================================================================
// AMBIENTES: atardecer, calle (tarde templada), noche, dōjō (original)
// ======================================================================
const AMB = {
  atardecer: { cenit: '#C98E86', horizonte: '#FBD3A0', sol: [-0.45, 0.2, -0.87], solColor: '#FFE9BE', halo: 1, niebla: ['#F0C394', 18, 95], suelo: '#7E7744',
    clave: ['#FFB574', 3.4], relleno: ['#FFC8B4', 1.0, [2.5, 2.0, 4]], contra: ['#FFD9A6', 0.7, [4, 3, 2]], contra2: ['#FFE9CF', 0], hemi: ['#FFD2AA', '#6A5838', 0.65], exposicion: 1.0, estrellas: 0 },
  calle: { cenit: '#6F9BB8', horizonte: '#E8D3AE', sol: [-0.5, 0.62, 0.6], solColor: '#FFF6E0', halo: 0.25, niebla: ['#E9DFCB', 22, 110], suelo: '#B39B78',
    clave: ['#FFE0B4', 3.0], relleno: ['#E6EEF4', 0.7, [3, 2, 3]], contra: ['#FFE6C2', 1.4, [2, 3.5, -4]], contra2: ['#FFF2E0', 0], hemi: ['#DCE6EC', '#8C7356', 0.55], exposicion: 1.0, estrellas: 0 },
  noche: { cenit: '#060A16', horizonte: '#1C2640', sol: [0.35, 0.55, -0.76], solColor: '#DCE6FF', halo: 0.12, niebla: ['#141B2E', 16, 80], suelo: '#23262E',
    clave: ['#8EA6D8', 1.0], relleno: ['#4C5C88', 0.45, [3, 2, 4]], contra: ['#A9BCE6', 0.9, [3, 3, -4]], contra2: ['#FFFFFF', 0], hemi: ['#2C3A60', '#0C0E14', 0.6], exposicion: 1.05, estrellas: 1 }
};
// ambiente(esc, 'atardecer' | 'calle' | 'noche' | 'dojo', { suelo: true, sombra: 9 (semiancho m de la caja de sombras) })
// Quita el suelo de madera y la pared del dōjō, pone cielo, niebla, luces y suelo exterior. 'dojo' lo deja todo como estaba.
export function ambiente(esc, modo = 'atardecer', o = {}) {
  o = Object.assign({ suelo: true, sombra: 9 }, o);
  const L = esc.luces;
  if (!esc._amb) {
    const g = { orig: {
      background: esc.escena.background, fog: esc.escena.fog, env: esc.escena.environment, exp: esc.renderer.toneMappingExposure, far: esc.camara.far,
      luces: Object.fromEntries(Object.entries(L).map(([k, l]) => [k, { color: l.color.clone(), i: l.intensity, pos: l.position.clone(), ground: l.groundColor ? l.groundColor.clone() : null }])),
      cam: ['left', 'right', 'top', 'bottom', 'near', 'far'].map((k) => L.clave.shadow.camera[k])
    } };
    const geo = new THREE.SphereGeometry(400, 64, 32); geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    g.cielo = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); g.cielo.renderOrder = -10; esc.escena.add(g.cielo);
    const sp = [], r = rng(99); for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, e = 0.08 + Math.pow(r(), 0.7) * 1.4; sp.push(Math.cos(a) * Math.cos(e) * 380, Math.sin(e) * 380, Math.sin(a) * Math.cos(e) * 380); }
    const gs = new THREE.BufferGeometry(); gs.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    g.estrellas = new THREE.Points(gs, new THREE.PointsMaterial({ color: '#E8EEFF', size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8, depthWrite: false })); esc.escena.add(g.estrellas);
    g.luna = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: '#F2F0E6', fog: false })); esc.escena.add(g.luna);
    g.suelo = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: '#7E7744', roughness: 0.95, envMapIntensity: 0.3 }));
    g.suelo.rotation.x = -Math.PI / 2; g.suelo.position.y = -0.005; g.suelo.receiveShadow = true; esc.escena.add(g.suelo);
    // entorno nocturno (reflejos fríos y tenues)
    const s = new THREE.Scene(); const sg = new THREE.SphereGeometry(10, 32, 16), col = [], c = new THREE.Color();
    for (let i = 0; i < sg.attributes.position.count; i++) { const y = sg.attributes.position.getY(i) / 10; c.set(y > 0 ? '#1A2440' : '#08090D').lerp(new THREE.Color('#2A385C'), y > 0 ? 1 - y : 0); col.push(c.r * 0.5, c.g * 0.5, c.b * 0.5); }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); s.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const pm = new THREE.PMREMGenerator(esc.renderer); g.envNoche = pm.fromScene(s, 0.04).texture; pm.dispose();
    esc._amb = g;
  }
  const g = esc._amb;
  const exterior = modo !== 'dojo';
  g.cielo.visible = g.suelo.visible = exterior; g.estrellas.visible = g.luna.visible = false;
  if (esc.suelo) esc.suelo.visible = !exterior;
  esc.escena.traverse((m) => { if (m.isMesh && esc.pared && m.material === esc.pared.material) m.visible = !exterior; });
  const sc = L.clave.shadow.camera;
  if (!exterior) {
    const q = g.orig; esc.escena.background = q.background; esc.escena.fog = q.fog; esc.escena.environment = q.env; esc.renderer.toneMappingExposure = q.exp;
    for (const k in q.luces) { const l = L[k], v = q.luces[k]; l.color.copy(v.color); l.intensity = v.i; l.position.copy(v.pos); if (v.ground) l.groundColor.copy(v.ground); }
    ['left', 'right', 'top', 'bottom', 'near', 'far'].forEach((k, i) => (sc[k] = q.cam[i])); sc.updateProjectionMatrix();
    esc.camara.far = q.far; esc.camara.updateProjectionMatrix(); return { modo, ...g };
  }
  const A = AMB[modo] || AMB.atardecer;
  // cielo: degradado + sol (o luna) con halo
  const sol = V3(...A.sol).normalize(), cz = new THREE.Color(A.cenit), ch = new THREE.Color(A.horizonte), cs = new THREE.Color(A.solColor), c = new THREE.Color(), p = g.cielo.geometry.attributes.position, col = g.cielo.geometry.attributes.color, v = V3(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    c.copy(ch).lerp(cz, Math.pow(clamp(v.y), 0.55)); if (v.y < 0) c.copy(ch).multiplyScalar(0.85);
    const d = Math.max(0, v.dot(sol)); c.lerp(cs, clamp(A.halo * (Math.pow(d, 6) * 0.65 + Math.pow(d, 40) * 0.6)));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
  esc.escena.background = ch.clone(); esc.escena.fog = new THREE.Fog(A.niebla[0], A.niebla[1], A.niebla[2]);
  esc.escena.environment = modo === 'noche' ? g.envNoche : g.orig.env; esc.renderer.toneMappingExposure = A.exposicion;
  g.estrellas.visible = A.estrellas > 0; g.luna.visible = modo === 'noche';
  g.luna.position.copy(sol).multiplyScalar(370); g.luna.lookAt(0, 0, 0);
  g.suelo.material.color.set(A.suelo); g.suelo.visible = o.suelo !== false;
  const pon = (l, [color, i, pos]) => { l.color.set(color); l.intensity = i; if (pos) l.position.set(...pos); };
  pon(L.clave, A.clave); L.clave.position.copy(sol).multiplyScalar(30).add(L.clave.target.position);
  pon(L.relleno, A.relleno); pon(L.contra, A.contra); pon(L.contra2, A.contra2);
  L.hemi.color.set(A.hemi[0]); L.hemi.groundColor.set(A.hemi[1]); L.hemi.intensity = A.hemi[2];
  Object.assign(sc, { left: -o.sombra, right: o.sombra, top: o.sombra, bottom: -o.sombra, near: 1, far: 70 }); sc.updateProjectionMatrix();
  L.clave.shadow.normalBias = 0.03;
  esc.camara.far = 800; esc.camara.updateProjectionMatrix();
  return { modo, ...g };
}
// Centra la caja de sombras de la luz principal (exteriores) en (x, z)
export function sombraExterior(esc, x = 0, z = 0) { const L = esc.luces.clave, d = L.position.clone().sub(L.target.position); L.target.position.set(x, 0, z); L.target.updateMatrixWorld(); L.position.copy(L.target.position).add(d); }

// ======================================================================
// PINOS
// ======================================================================
// Pino japonés estilizado (tronco en S + ramas con copas en capas tipo nube). o: { altura: 4, semilla: 1, inclina: 12 (°), ramas: 5, color, corteza }
// pino.viento(t, { fuerza: 1, direccion: 0 (° en el plano XZ; 0 = sopla hacia +X) }) mece ramas y copa de forma determinista.
const _matPino = new Map();
export function crearPino(o = {}) {
  o = Object.assign({ altura: 4, semilla: 1, inclina: 12, ramas: 5, color: COLORES.pino, corteza: COLORES.corteza, sombras: true }, o);
  const r = rng(o.semilla * 31 + 7), H = o.altura;
  const key = o.color + o.corteza;
  if (!_matPino.has(key)) _matPino.set(key, { hoja: new THREE.MeshStandardMaterial({ color: o.color, roughness: 0.88, envMapIntensity: 0.5 }), tronco: new THREE.MeshStandardMaterial({ color: o.corteza, map: texVeta(true, 12), roughness: 0.92, envMapIntensity: 0.4 }) });
  const mt = _matPino.get(key);
  const raiz = new THREE.Group(), cuerpo = new THREE.Group(); raiz.add(cuerpo);
  const az = r() * Math.PI * 2, inc = o.inclina * D2R, dir = V3(Math.cos(az), 0, Math.sin(az));
  const pts = []; for (let i = 0; i <= 6; i++) { const s = i / 6; pts.push(V3(0, 0, 0).addScaledVector(dir, Math.sin(s * 2.2) * H * Math.tan(inc) * 0.6 + (r() - 0.5) * 0.08 * H * s).add(V3(0, H * s, 0))); }
  const curva = new THREE.CatmullRomCurve3(pts);
  const tronco = new THREE.Mesh(tuboAfinado(curva, H * 0.045, H * 0.014, 20, 9), mt.tronco); cuerpo.add(tronco);
  const ramas = [];
  const copa = (w, sem) => { const gs = []; const rr = rng(sem); for (let k = 0; k < 4; k++) { const g = grumo(sem + k, 22, 14); const s = w * (0.55 + rr() * 0.25); g.scale(s, s * 0.42, s * (0.75 + rr() * 0.3)); g.translate((rr() - 0.5) * w * 0.7, (rr() - 0.3) * w * 0.12, (rr() - 0.5) * w * 0.55); gs.push(g); } return fusionar(gs); };
  for (let i = 0; i < o.ramas; i++) {
    const s = 0.4 + 0.5 * (i / Math.max(1, o.ramas - 1)) + (r() - 0.5) * 0.06, base = curva.getPointAt(s);
    const a = az + Math.PI + i * 2.4 + (r() - 0.5) * 0.6, d = V3(Math.cos(a), 0, Math.sin(a)), L = H * (0.42 - 0.24 * s) * (0.85 + r() * 0.3);
    const g = new THREE.Group(); g.position.copy(base); cuerpo.add(g);
    const c2 = new THREE.CatmullRomCurve3([V3(0, 0, 0), d.clone().multiplyScalar(L * 0.45).add(V3(0, L * 0.18, 0)), d.clone().multiplyScalar(L).add(V3(0, L * 0.12, 0))]);
    g.add(new THREE.Mesh(tuboAfinado(c2, H * 0.016, H * 0.006, 10, 6), mt.tronco));
    const cp = new THREE.Mesh(copa(L * 0.95, o.semilla * 100 + i), mt.hoja); cp.position.copy(d.clone().multiplyScalar(L * 0.9).add(V3(0, L * 0.2, 0))); g.add(cp);
    ramas.push({ g, fase: r() * 6.28, L, d });
  }
  const top = new THREE.Mesh(copa(H * 0.3, o.semilla * 100 + 50), mt.hoja); top.position.copy(pts[6]).add(V3(0, H * 0.02, 0)); cuerpo.add(top);
  raiz.traverse((m) => { if (m.isMesh) { m.castShadow = o.sombras; m.receiveShadow = true; } });
  const pino = {
    raiz, ramas,
    colocar(x, z, y = 0) { raiz.position.set(x, y, z); return pino; },
    viento(t, { fuerza = 1, direccion = 0 } = {}) {
      const dw = V3(Math.cos(direccion * D2R), 0, Math.sin(direccion * D2R)), eje = V3(0, 1, 0).cross(dw).normalize();
      const fase = (raiz.position.x * dw.x + raiz.position.z * dw.z) * 0.35;   // ráfaga que avanza por el bosque
      const racha = 0.6 + 0.4 * Math.sin(t * 0.9 - fase);
      cuerpo.quaternion.setFromAxisAngle(eje, -fuerza * racha * (0.025 + 0.012 * Math.sin(t * 2.1 - fase)));
      for (const q of ramas) {
        const a = fuerza * racha * (0.05 + 0.04 * Math.sin(t * 2.6 + q.fase - fase)) * (0.6 + q.L / H);
        q.g.quaternion.setFromAxisAngle(eje, -a).multiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), fuerza * 0.04 * Math.sin(t * 1.7 + q.fase)));
      }
      return pino;
    }
  };
  return pino;
}

// Colina con pinos al atardecer. o: { pinos: 9, semilla: 2, meseta: 3.2 (radio llano alrededor del origen), sinPinosEn: [[x,z,r],…] }
// Devuelve { raiz, pinos: [crearPino…], viento(t, op) }. El origen queda llano a y = 0 (ahí van el maestro y la mesita).
export function crearColina(o = {}) {
  o = Object.assign({ pinos: 9, semilla: 2, meseta: 3.2, sinPinosEn: [[0, 4, 4]], color: COLORES.hierba }, o);
  const raiz = new THREE.Group();
  const N = 90, T = 70, g = new THREE.PlaneGeometry(T, T, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = [], c0 = new THREE.Color(o.color), c1 = new THREE.Color('#5E6233'), c2 = new THREE.Color('#9C9358'), c = new THREE.Color();
  const altura = (x, z) => { const d = Math.hypot(x, z * 0.9); return -Math.pow(Math.max(0, d - o.meseta), 1.25) * 0.28 + (fbm(x * 0.12 + 3, z * 0.12) - 0.5) * 0.5 * sstep(o.meseta, o.meseta + 3, d); };
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, altura(x, z)); const n = fbm(x * 0.3, z * 0.3); c.copy(c0).lerp(n > 0.5 ? c2 : c1, Math.abs(n - 0.5) * 1.4); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const suelo = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, envMapIntensity: 0.3 })); suelo.receiveShadow = true; raiz.add(suelo);
  // lomas lejanas (perspectiva aérea con la niebla)
  for (let k = 0; k < 3; k++) {
    const gl = new THREE.PlaneGeometry(400, 30, 120, 1), q = gl.attributes.position;
    for (let i = 0; i < q.count; i++) if (q.getY(i) > 0) q.setY(i, 6 + k * 3 + fbm(q.getX(i) * 0.02 + k * 7, k) * (14 + k * 6) - 15); else q.setY(i, -15);
    gl.computeVertexNormals();
    const m = new THREE.Mesh(gl, new THREE.MeshStandardMaterial({ color: ['#6F6A4E', '#7C6F62', '#8A7A70'][k], roughness: 1, envMapIntensity: 0.2 })); m.position.set(0, -6, -45 - k * 30); raiz.add(m);
  }
  const r = rng(o.semilla * 13 + 1), pinos = [];
  let intentos = 0;
  while (pinos.length < o.pinos && intentos++ < 400) {
    const a = r() * Math.PI * 2, d = o.meseta * 0.8 + r() * 9, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (o.sinPinosEn.some(([cx, cz, rr]) => Math.hypot(x - cx, z - cz) < rr)) continue;
    if (pinos.some((q) => Math.hypot(q.raiz.position.x - x, q.raiz.position.z - z) < 2.2)) continue;
    const pn = crearPino({ altura: 3.2 + r() * 2.6, semilla: o.semilla * 50 + pinos.length, inclina: 6 + r() * 16 }); pn.colocar(x, z, altura(x, z) - 0.05); raiz.add(pn.raiz); pinos.push(pn);
  }
  return { raiz, pinos, suelo, altura, viento(t, op) { for (const q of pinos) q.viento(t, op); } };
}

// Mar de pinos visto desde arriba: copas instanciadas que ondulan como olas.
// o: { ancho: 60, fondo: 60, paso: 1.9, semilla: 4 }. mar.actualizar(t, { amplitud: 0.6, longitud: 9, velocidad: 1, direccion: 20, olas: 0 })
// olas 0 = verde de pino; 1 = las crestas se aclaran y el verde vira a mar (tinta azul verdosa) → morfismo pino ↔ ola.
export function crearMarDePinos(o = {}) {
  o = Object.assign({ ancho: 60, fondo: 80, paso: 1.9, semilla: 4, centro: [0, -10] }, o);
  const r = rng(o.semilla), items = [];
  for (let x = -o.ancho / 2; x <= o.ancho / 2; x += o.paso) for (let z = -o.fondo / 2; z <= o.fondo / 2; z += o.paso * 0.87) {
    const fila = Math.round(z / (o.paso * 0.87));
    items.push({ x: o.centro[0] + x + (fila % 2) * o.paso / 2 + (r() - 0.5) * o.paso * 0.5, z: o.centro[1] + z + (r() - 0.5) * o.paso * 0.4, s: o.paso * (0.62 + r() * 0.3), rot: r() * 6.28, tono: r() });
  }
  const geo = grumo(o.semilla, 16, 10); geo.scale(1, 0.55, 1);
  const mat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.85, envMapIntensity: 0.45 });
  const inst = new THREE.InstancedMesh(geo, mat, items.length); inst.castShadow = false; inst.receiveShadow = true;
  const raiz = new THREE.Group(); raiz.add(inst);
  const base = new THREE.Mesh(new THREE.PlaneGeometry(o.ancho + 20, o.fondo + 20), new THREE.MeshStandardMaterial({ color: '#1F2E1D', roughness: 1 })); base.rotation.x = -Math.PI / 2; base.position.set(o.centro[0], -0.35, o.centro[1]); raiz.add(base);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = V3(1, 1, 1), pz = V3(0, 0, 0), c = new THREE.Color();
  const verde = [new THREE.Color('#2E4A2C'), new THREE.Color('#47693E')], mar = [new THREE.Color('#244E5A'), new THREE.Color('#3E7480')], espuma = new THREE.Color('#E9EEE6');
  const mart = {
    raiz, inst, n: items.length,
    actualizar(t, { amplitud = 0.6, longitud = 9, velocidad = 1, direccion = 20, olas = 0 } = {}) {
      const k = (Math.PI * 2) / longitud, w = k * 2.2 * velocidad, dx = Math.cos(direccion * D2R), dz = Math.sin(direccion * D2R);
      items.forEach((it, i) => {
        const fase = k * (it.x * dx + it.z * dz) - w * t, fase2 = k * 0.6 * (it.x * dz - it.z * dx) * 0.5 + k * 1.7 * (it.x * dx + it.z * dz) - w * 1.3 * t;
        const h = amplitud * (Math.sin(fase) + 0.3 * Math.sin(fase2)), dh = amplitud * k * Math.cos(fase);
        e.set(-dz * Math.atan(dh) * 0.8, it.rot, dx * Math.atan(dh) * 0.8 * -1); q.setFromEuler(e);
        const cr = clamp((h / amplitud + 0.2) / 1.3);
        s.set(it.s * (1 + 0.12 * cr), it.s * (1 + 0.25 * cr * olas), it.s * (1 + 0.12 * cr)); pz.set(it.x, h, it.z);
        m4.compose(pz, q, s); inst.setMatrixAt(i, m4);
        c.copy(verde[0]).lerp(verde[1], it.tono * 0.6 + cr * 0.5);
        if (olas > 0) { const cm = mar[0].clone().lerp(mar[1], cr); c.lerp(cm, olas); c.lerp(espuma, olas * sstep(0.72, 1, cr) * 0.85); }
        inst.setColorAt(i, c);
      });
      inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      base.material.color.set('#1F2E1D').lerp(new THREE.Color('#1D3A44'), olas);
      return mart;
    }
  };
  mart.actualizar(0); return mart;
}

// ======================================================================
// CALLE (Tokio años 30, sin rótulos ni detalles reconocibles)
// ======================================================================
const _fachadas = new Map();
function texFachada(semilla, ancho, alto, pisos) {
  const key = semilla + '|' + pisos; if (_fachadas.has(key)) return _fachadas.get(key);
  const r = rng(semilla * 17 + 3), px = 64, c = lienzo(Math.round(ancho * px), Math.round(alto * px)), g = c.getContext('2d');
  const Y = (m) => c.height - m * px, X = (m) => m * px;
  const yeso = ['#EDE3D0', '#E6DAC4', '#F1E9D8'][Math.floor(r() * 3)], madera = ['#5E3D27', '#6E4A31', '#4E3322'][Math.floor(r() * 3)];
  g.fillStyle = yeso; g.fillRect(0, 0, c.width, c.height);
  // planta baja: tablas oscuras, celosía y puerta corredera
  g.fillStyle = madera; g.fillRect(0, Y(2.3), c.width, X(2.3));
  g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < c.width; x += 14) g.fillRect(x, Y(2.3), 2, X(2.3));
  const pw = 1.5, px0 = r() < 0.5 ? 0.4 : ancho - pw - 0.4;
  g.fillStyle = '#F2EAD8'; g.fillRect(X(px0), Y(1.9), X(pw), X(1.9)); g.strokeStyle = '#A57A50'; g.lineWidth = 3;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(X(px0 + pw * i / 4), Y(1.9)); g.lineTo(X(px0 + pw * i / 4), Y(0)); g.stroke(); }
  for (let j = 1; j < 6; j++) { g.beginPath(); g.moveTo(X(px0), Y(1.9 * j / 6)); g.lineTo(X(px0 + pw), Y(1.9 * j / 6)); g.stroke(); }
  const vx = px0 < 1 ? pw + 0.9 : 0.5, vw = ancho - pw - 1.5;
  if (vw > 0.6) { g.fillStyle = '#2A1E16'; g.fillRect(X(vx), Y(1.8), X(vw), X(1.0)); g.fillStyle = '#9A7048'; for (let x = X(vx); x < X(vx + vw); x += 11) g.fillRect(x, Y(1.8), 6, X(1.0)); }
  if (pisos > 1) { // primer piso: ventanas de shōji con barandilla
    const yb = 2.9; g.fillStyle = madera; g.fillRect(0, Y(yb + 0.1), c.width, 6); g.fillRect(0, Y(alto), c.width, 8);
    const n = Math.max(1, Math.floor(ancho / 1.8));
    for (let i = 0; i < n; i++) { const x = 0.35 + i * (ancho - 0.7) / n, w = (ancho - 0.7) / n - 0.3; g.fillStyle = '#F2EAD8'; g.fillRect(X(x), Y(yb + 1.3), X(w), X(1.0)); g.strokeStyle = '#A57A50'; g.lineWidth = 3; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(X(x + w * k / 3), Y(yb + 1.3)); g.lineTo(X(x + w * k / 3), Y(yb + 0.3)); g.stroke(); } g.fillStyle = madera; g.fillRect(X(x - 0.05), Y(yb + 0.55), X(w + 0.1), 8); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; _fachadas.set(key, t); return t;
}
// Casita de la calle. o: { ancho: 4.5, fondo: 5, pisos: 1|2, semilla }
export function crearCasita(o = {}) {
  o = Object.assign({ ancho: 4.5, fondo: 5, pisos: 1, semilla: 1 }, o);
  const r = rng(o.semilla * 7 + 1), alto = o.pisos > 1 ? 4.6 : 2.7, raiz = new THREE.Group();
  const fach = texFachada(o.semilla, o.ancho, alto, o.pisos);
  const mFach = new THREE.MeshStandardMaterial({ map: fach, roughness: 0.85, envMapIntensity: 0.5 }), mPared = new THREE.MeshStandardMaterial({ color: '#E3D8C3', roughness: 0.9, envMapIntensity: 0.5 });
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(o.ancho, alto, o.fondo), [mPared, mPared, mPared, mPared, mFach, mPared]); cuerpo.position.y = alto / 2; cuerpo.castShadow = cuerpo.receiveShadow = true; raiz.add(cuerpo);
  const mTeja = new THREE.MeshStandardMaterial({ color: ['#585C66', '#4F535C', '#61646B'][Math.floor(r() * 3)], roughness: 0.5, envMapIntensity: 0.8, side: THREE.DoubleSide }), mBajo = new THREE.MeshStandardMaterial({ color: '#4E3424', roughness: 0.85, side: THREE.DoubleSide });
  const pend = 0.48, run = o.fondo / 2 + 0.55, yC = alto + 0.1 + (o.fondo / 2) * pend + 0.05;
  const ver = vertiente({ ancho: o.ancho + 0.8, run, yCumbre: yC, pend, sori: 0.06, respingo: 0.08, nTejas: Math.round(o.ancho * 4), filas: 7, nv: 10, grosor: 0.1 });
  for (const s of [1, -1]) { const g = new THREE.Group(); const a = new THREE.Mesh(ver.arriba, mTeja), b = new THREE.Mesh(ver.abajo, mBajo), c = new THREE.Mesh(ver.canto, mTeja); a.castShadow = true; a.receiveShadow = b.receiveShadow = true; g.add(a, b, c); if (s < 0) g.rotation.y = Math.PI; raiz.add(g); }
  const cum = new THREE.Mesh(new THREE.BoxGeometry(o.ancho + 0.6, 0.16, 0.26), mTeja); cum.position.y = yC + 0.06; cum.castShadow = true; raiz.add(cum);
  for (const x of [-o.ancho / 2, o.ancho / 2]) { const sh = new THREE.Shape(); sh.moveTo(-o.fondo / 2, 0); sh.lineTo(o.fondo / 2, 0); sh.lineTo(0, (o.fondo / 2) * pend + 0.1); sh.closePath(); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mPared); m.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2; m.position.set(x, alto, 0); raiz.add(m); }
  if (o.pisos > 1) { // tejadillo (hisashi) sobre la planta baja
    const vh = vertiente({ ancho: o.ancho + 0.3, run: 0.9, yCumbre: 2.95, pend: 0.45, sori: 0.02, respingo: 0.02, nTejas: Math.round(o.ancho * 4), filas: 3, nv: 5, grosor: 0.08 });
    const g = new THREE.Group(); const a = new THREE.Mesh(vh.arriba, mTeja), b = new THREE.Mesh(vh.abajo, mBajo), c = new THREE.Mesh(vh.canto, mTeja); a.castShadow = true; g.add(a, b, c); g.position.z = o.fondo / 2 - 0.02; raiz.add(g);
  }
  return { raiz, colocar(x, z, rumbo = 0) { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return this; } };
}
// Calle: fila de casitas a ambos lados de un hueco central (para la casa-dōjō), calzada de tierra delante (+Z).
// o: { hueco: 8.4, porLado: 3, semilla: 5, enfrente: false (fila de enfrente, mirando a −Z), fondo: true (tejados de detrás) }
export function crearCalle(o = {}) {
  o = Object.assign({ hueco: 8.4, porLado: 3, semilla: 5, enfrente: false, fondo: true, linea: 2.1 }, o);
  const raiz = new THREE.Group(), r = rng(o.semilla), casas = [];
  for (const lado of [-1, 1]) {
    let x = lado * o.hueco / 2;
    for (let i = 0; i < o.porLado; i++) {
      const ancho = 3.6 + r() * 2.4, fondo = 4.5 + r() * 1.5, pisos = r() < 0.45 ? 2 : 1;
      const c = crearCasita({ ancho, fondo, pisos, semilla: o.semilla * 10 + i * 2 + (lado > 0 ? 1 : 0) });
      x += lado * (ancho / 2 + 0.25); c.colocar(x, o.linea - fondo / 2 + (r() - 0.5) * 0.3); x += lado * ancho / 2; raiz.add(c.raiz); casas.push(c);
    }
  }
  if (o.fondo) for (let i = 0; i < 7; i++) { const c = crearCasita({ ancho: 5 + r() * 2, fondo: 5, pisos: r() < 0.6 ? 2 : 1, semilla: o.semilla * 30 + i }); c.colocar(-16 + i * 5.6 + (r() - 0.5), -6.5 - r() * 2); raiz.add(c.raiz); casas.push(c); }
  if (o.enfrente) for (let i = 0; i < 5; i++) { const c = crearCasita({ ancho: 4 + r() * 2, fondo: 5, pisos: r() < 0.5 ? 2 : 1, semilla: o.semilla * 50 + i }); c.colocar(-11 + i * 5.4, 13, 180); raiz.add(c.raiz); casas.push(c); }
  // calzada de tierra con borde de piedra
  const calz = new THREE.Mesh(new THREE.PlaneGeometry(120, 7.5), new THREE.MeshStandardMaterial({ color: '#C2A982', roughness: 0.97, envMapIntensity: 0.3 }));
  calz.rotation.x = -Math.PI / 2; calz.position.set(0, 0.004, o.linea + 0.6 + 3.75); calz.receiveShadow = true; raiz.add(calz);
  const bord = new THREE.Mesh(new THREE.BoxGeometry(120, 0.06, 0.18), new THREE.MeshStandardMaterial({ color: '#8E877B', roughness: 0.9 })); bord.position.set(0, 0.03, o.linea + 0.55); bord.receiveShadow = true; raiz.add(bord);
  return { raiz, casas };
}

// ======================================================================
// PROPS: mesita, papel, pincel, papel colgado, viga, cartel
// ======================================================================
const matMadera = (color, vertical = false) => new THREE.MeshStandardMaterial({ color, map: texVeta(vertical, 30), roughness: 0.7, envMapIntensity: 0.6 });
// Mesita baja de escritura con papel y piedra de tinta. o: { texto: '松濤', vertical: true, ancho: 0.8, fondo: 0.45, alto: 0.33 }
// mesita.escribir(prog) pinta el texto a trazos en el papel. El papel queda centrado en la mesita.
export function crearMesita(o = {}) {
  o = Object.assign({ texto: '', vertical: true, ancho: 0.8, fondo: 0.45, alto: 0.33 }, o);
  const raiz = new THREE.Group(), m = matMadera('#4A2E1E'), mc = matMadera('#7A5236');
  caja(o.ancho, 0.04, o.fondo, m, 0, o.alto - 0.04, 0, raiz);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) caja(0.05, o.alto - 0.04, 0.05, mc, sx * (o.ancho / 2 - 0.06), 0, sz * (o.fondo / 2 - 0.06), raiz);
  const tex = new TexturaKanji({ texto: o.texto, vertical: o.vertical, fondo: 'papel', ancho: o.vertical ? 256 : 384, alto: o.vertical ? 384 : 256, color: TINTA });
  const pw = o.vertical ? 0.26 : 0.36, ph = o.vertical ? 0.36 : 0.26;
  const papel = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshStandardMaterial({ map: tex.textura, roughness: 0.9, envMapIntensity: 0.5 }));
  papel.rotation.x = -Math.PI / 2; papel.position.set(0.04, o.alto + 0.002, 0); papel.receiveShadow = true; raiz.add(papel);
  const suz = caja(0.1, 0.03, 0.17, new THREE.MeshStandardMaterial({ color: '#202022', roughness: 0.35 }), -o.ancho / 2 + 0.12, o.alto, 0, raiz);
  void suz;
  raiz.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
  return { raiz, papel, textura: tex, colocar(x, z, rumbo = 0) { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return this; }, escribir(prog, color) { if (color) tex.color = color, tex._p = null; tex.dibujar(prog); return this; } };
}
// Pincel (mango de bambú + punta de pelo). pincel.seguir(k, 'D', direccion) lo pone en el puño con la punta hacia 'direccion' (mundo).
export function crearPincel(o = {}) {
  const raiz = new THREE.Group(), L = o.largo || 0.26;
  const mango = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, L, 10), new THREE.MeshStandardMaterial({ color: '#C8A46A', roughness: 0.5 })); mango.position.y = L / 2; raiz.add(mango);
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.06, 12), new THREE.MeshStandardMaterial({ color: '#1A1614', roughness: 0.6 })); punta.rotation.x = Math.PI; punta.position.y = -0.03; raiz.add(punta);
  const virola = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.02, 10), new THREE.MeshStandardMaterial({ color: '#2A2420', roughness: 0.5 })); virola.position.y = 0.0; raiz.add(virola);
  raiz.traverse((q) => { if (q.isMesh) q.castShadow = true; });
  const up = V3(0, 1, 0);
  return {
    raiz,
    // dir: Vector3 del mundo hacia donde apunta la punta (por defecto abajo y algo hacia delante del personaje)
    seguir(k, lado = 'D', dir = null) {
      const m = k.punto('mano' + lado), fw = V3(Math.sin(k.base.rumbo * D2R), 0, Math.cos(k.base.rumbo * D2R));
      const d = (dir ? dir.clone() : V3(0, -1, 0).addScaledVector(fw, 0.25)).normalize();
      raiz.quaternion.setFromUnitVectors(up, d.clone().negate());
      raiz.position.copy(m).addScaledVector(d, 0.1); return this;
    }
  };
}
// Papel colgado (kakejiku) para escribir de pie. o: { texto: '空手', ancho: 0.62, alto: 1.15, centro: 1.4 (altura), soporte: true, color: TINTA }
export function crearPapelColgado(o = {}) {
  o = Object.assign({ texto: '空手', ancho: 0.62, alto: 1.15, centro: 1.4, soporte: true, color: TINTA, vertical: true }, o);
  const raiz = new THREE.Group();
  const tex = new TexturaKanji({ texto: o.texto, vertical: o.vertical, fondo: 'papel', color: o.color, ancho: 256, alto: Math.round(256 * o.alto / o.ancho), margen: 0.14 });
  const papel = new THREE.Mesh(new THREE.PlaneGeometry(o.ancho, o.alto), new THREE.MeshStandardMaterial({ map: tex.textura, roughness: 0.9, envMapIntensity: 0.5, side: THREE.DoubleSide }));
  papel.position.y = o.centro; papel.castShadow = papel.receiveShadow = true; raiz.add(papel);
  const mv = new THREE.MeshStandardMaterial({ color: '#3A2416', roughness: 0.5 });
  for (const s of [1, -1]) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, o.ancho + 0.1, 12), mv); v.rotation.z = Math.PI / 2; v.position.set(0, o.centro + s * (o.alto / 2 + 0.01), 0.01); v.castShadow = true; raiz.add(v); }
  if (o.soporte) {
    const m = matMadera('#6E4A31', true), top = o.centro + o.alto / 2 + 0.22;
    for (const s of [1, -1]) caja(0.06, top, 0.06, m, s * (o.ancho / 2 + 0.16), 0, -0.02, raiz);
    caja(o.ancho + 0.46, 0.06, 0.07, matMadera('#6E4A31'), 0, top - 0.06, -0.02, raiz);
    for (const s of [1, -1]) { const p = caja(0.06, 0.04, 0.4, m, s * (o.ancho / 2 + 0.16), 0, -0.02, raiz); void p; }
    const cuerda = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 6), mv); cuerda.position.set(0, top - 0.15, 0.0); raiz.add(cuerda);
  }
  return { raiz, papel, textura: tex, colocar(x, z, rumbo = 0) { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return this; }, escribir(prog) { tex.dibujar(prog); return this; } };
}
// Viga de madera nueva. o: { largo: 3, grosor: 0.14, color }. viga.entre(a, b) (Vector3 del mundo) · viga.alHombro(k, adelante = 0.35)
export function crearViga(o = {}) {
  o = Object.assign({ largo: 3, grosor: 0.14, color: COLORES.maderaNueva }, o);
  const raiz = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(o.grosor, o.grosor, o.largo), matMadera(o.color));
  m.castShadow = m.receiveShadow = true; raiz.add(m);
  const z = V3(0, 0, 1);
  const viga = {
    raiz, largo: o.largo,
    // centra la viga entre a y b y la orienta de a hacia b (no cambia el largo: úsalo para dos portadores)
    entre(a, b) { raiz.position.copy(a).add(b).multiplyScalar(0.5); raiz.quaternion.setFromUnitVectors(z, b.clone().sub(a).normalize()); return viga; },
    // apoyada en el hombro derecho de k (pose 'cargar-viga'), hacia delante del personaje
    alHombro(k, adelante = 0.35, lado = 'D') {
      const h = k.punto('hombro' + lado), fw = V3(Math.sin(k.base.rumbo * D2R), 0, Math.cos(k.base.rumbo * D2R));
      const p = h.clone().add(V3(0, 0.14, 0)).addScaledVector(fw, adelante); raiz.position.copy(p); raiz.quaternion.setFromUnitVectors(z, fw); return viga;
    },
    // punto de apoyo del hombro de k (para viga.entre con dos portadores)
    apoyo(k, lado = 'D') { return k.punto('hombro' + lado).add(V3(0, 0.14, 0)); }
  };
  return viga;
}
// Cartel «SHOTOKAN» que brota. o: { texto: 'SHOTOKAN', tipo: 'madera' | 'papel' | 'flecha', ancho: 1.1, alto: 1.3 (altura del cartel), poste: true }
// cartel.pop(p) brota del suelo con rebote · cartel.apuntar(x, z) gira la flecha hacia ese punto (tipo 'flecha')
export function crearCartel(o = {}) {
  o = Object.assign({ texto: 'SHOTOKAN', tipo: 'madera', ancho: 1.1, alto: 1.3, poste: true, semilla: 1 }, o);
  const raiz = new THREE.Group(), cuerpo = new THREE.Group(); raiz.add(cuerpo);
  const h = o.ancho * 0.26, tex = texturaTexto(o.texto, { fondo: o.tipo === 'papel' ? 'papel' : 'madera', ancho: 1024, alto: Math.round(1024 * h / o.ancho) });
  const mc = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, envMapIntensity: 0.5 }), mm = matMadera(o.tipo === 'papel' ? '#E9DFC9' : '#B98D5C');
  const tabla = new THREE.Mesh(new THREE.BoxGeometry(o.ancho, h, 0.05), [mm, mm, mm, mm, mc, mc]); tabla.position.y = o.alto; cuerpo.add(tabla);
  if (o.tipo === 'flecha') { const sh = new THREE.Shape(); sh.moveTo(0, -h / 2); sh.lineTo(h * 0.55, 0); sh.lineTo(0, h / 2); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }); g.translate(o.ancho / 2 - 0.001, 0, -0.025); const pt = new THREE.Mesh(g, mm); pt.position.y = o.alto; cuerpo.add(pt); }
  if (o.poste) caja(0.07, o.alto - h / 2 + 0.02, 0.07, matMadera('#6E4A31', true), o.tipo === 'flecha' ? -o.ancho * 0.25 : 0, 0, -0.06, cuerpo);
  cuerpo.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
  const cartel = {
    raiz,
    colocar(x, z, rumbo = 0) { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return cartel; },
    pop(p) { const s = p <= 0 ? 0.0001 : p >= 1 ? 1 : easeBack(p); cuerpo.scale.set(s, p <= 0 ? 0.0001 : Math.min(1.15, s * (1 + 0.15 * Math.sin(p * Math.PI))), s); cuerpo.rotation.z = (1 - clamp(p)) * 0.25 * Math.sin(p * 14 + o.semilla); raiz.visible = p > 0; return cartel; },
    // gira el cartel para que la punta de la flecha (su +X local) señale (x, z); la cara del texto queda hacia +Z local
    apuntar(x, z) { const dx = x - raiz.position.x, dz = z - raiz.position.z; raiz.rotation.y = Math.atan2(-dz, dx); return cartel; }
  };
  return cartel;
}

// ======================================================================
// EL MAESTRO — siempre de espaldas, de lejos o a contraluz; sin rasgos de la persona real
// ======================================================================
// o: { kimono: '#2F3242', hakama: '#4B4852', pelo: '#A9A39B', peinado: 'corto' (cualquiera de PEINADOS), piel, silueta: false | '#1A1A1A', sombras }
// maestro.pose(P, 'maestro-seiza-pincel' | 'maestro-pie-escribiendo' | 'maestro-manos-atras' | objeto, { escribir: t, pincel: true })
export function crearMaestro(o = {}) {
  o = Object.assign({ kimono: '#2F3242', hakama: '#4B4852', pelo: '#A9A39B', peinado: 'corto', piel: '#E2AC86', silueta: false, sombras: true }, o);
  const k = new Karateka3D({ gi: o.kimono, pelo: o.pelo, peinado: o.peinado, piel: o.piel, mejilla: o.piel, cinturon: o.hakama, sombras: o.sombras });
  k.verRostro(false);  // sin rasgos: nunca retrato
  for (const m of [k.mat.gi, k.mat.giV, k.mat.giDoble]) { m.sheen = 0.25; m.sheenColor.set('#8C8CA0'); m.roughness = 0.88; }
  for (const n of ['colaI', 'colaD', 'nudo', 'lazo']) if (k.partes[n]) k.partes[n].visible = false;
  const mH = new THREE.MeshPhysicalMaterial({ color: o.hakama, roughness: 0.85, sheen: 0.3, sheenColor: new THREE.Color('#9A96A6'), envMapIntensity: 0.7, side: THREE.DoubleSide });
  // hakama de pie: falda-pantalón ancha con pliegues (cuelga de la cadera)
  const perfil = [[0.205, -0.93], [0.2, -0.7], [0.19, -0.4], [0.178, -0.15], [0.17, 0.02], [0.168, 0.09]];
  const lat = new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), 56), p = lat.attributes.position, v = V3(0, 0, 0);
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const phi = Math.atan2(v.x, v.z), r = Math.hypot(v.x, v.z), y = v.y, pl = 0.012 * Math.sin(phi * 14) * sstep(0.0, -0.5, y), ens = 1 + 0.32 * sstep(-0.1, -0.85, y) * Math.pow(Math.abs(Math.sin(phi)), 1.2); const r2 = (r + pl) * ens; p.setXYZ(i, Math.sin(phi) * r2, y, Math.cos(phi) * r2 * 0.86); }
  lat.computeVertexNormals();
  const hakPie = new THREE.Mesh(lat, mH); k.j.cadera.add(hakPie);
  // hakama en seiza: manto que cubre las piernas dobladas
  // falda acampanada: de la cintura (y = 0,04) al suelo (y = -SEIZA_CADERA), alargada hacia delante sobre las rodillas
  const NI = 14, NJ = 48, ps = [], ix = [];
  for (let i = 0; i <= NI; i++) {
    const t = i / NI, y = lerp(0.05, -SEIZA_CADERA + 0.01, t), a = lerp(0.168, 0.33, Math.pow(t, 0.6)), zf = lerp(0.13, 0.66, Math.pow(t, 0.55)), zb = lerp(-0.13, -0.27, t);
    const c = (zf + zb) / 2, b = (zf - zb) / 2;
    for (let j = 0; j <= NJ; j++) { const ph = (j / NJ) * Math.PI * 2, pl = 0.012 * Math.sin(ph * 13) * sstep(0.1, 0.6, t); ps.push(Math.sin(ph) * (a + pl), y + (i === NI ? 0 : 0.012 * Math.cos(ph * 2) * t), c + Math.cos(ph) * (b + pl)); }
  }
  for (let i = 0; i < NI; i++) for (let j = 0; j < NJ; j++) { const a = i * (NJ + 1) + j, b = a + NJ + 1; ix.push(a, b, a + 1, b, b + 1, a + 1); }
  const gS = new THREE.BufferGeometry(); gS.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); gS.setIndex(ix); gS.computeVertexNormals();
  const hakSeiza = new THREE.Mesh(gS, mH); k.j.cadera.add(hakSeiza);
  for (const m of [hakPie, hakSeiza]) { m.castShadow = o.sombras; m.receiveShadow = true; }
  const pincel = crearPincel();
  const maestro = {
    k, raiz: k.raiz, pincel, hakama: { pie: hakPie, seiza: hakSeiza },
    colocar(x, z, rumbo = 0) { k.colocar(x, z, rumbo); return maestro; },
    // pose: nombre de P o un objeto pose. op: { escribir: t (s) → movimiento suave del pincel, pincel: true, dirPincel: Vector3 }
    pose(P, pose, op = {}) {
      const nombre = typeof pose === 'string' ? pose : pose.nombre || '';
      let pp = typeof pose === 'string' ? P[pose] : pose;
      if (!pp) throw new Error('pose del maestro no encontrada: ' + pose);
      if (op.escribir != null) { // trazo del pincel: pequeños giros deterministas del brazo derecho
        const t = op.escribir, w = Math.sin(t * 5.1) * 4 + Math.sin(t * 2.3) * 3, h = Math.sin(t * 3.7 + 1) * 3;
        pp = mezclar(pp, pp, 0); pp.brazoD = { ...(pp.brazoD || {}), adelante: (pp.brazoD?.adelante || 0) + h, abre: (pp.brazoD?.abre || 0) + w }; pp.codoD = (pp.codoD || 0) + Math.sin(t * 4.4) * 4;
      }
      const seiza = !!(pp.aplicar || (P[nombre] && P[nombre].aplicar)) || nombre.includes('seiza');
      const ap = pp.aplicar || (P[nombre] && P[nombre].aplicar) || {};
      k.aplicarPose(pp, seiza ? { suelo: false, altura: ap.altura ?? SEIZA_ALTURA } : {});
      hakPie.visible = !seiza; hakSeiza.visible = seiza;
      const conPincel = op.pincel !== false && (nombre.includes('pincel') || nombre.includes('escrib') || op.pincel === true);
      pincel.raiz.visible = conPincel;
      if (conPincel) { const fw = V3(Math.sin(k.base.rumbo * D2R), 0, Math.cos(k.base.rumbo * D2R)); pincel.seguir(k, 'D', op.dirPincel || (seiza ? V3(0, -1, 0).addScaledVector(fw, 0.3) : fw.clone().add(V3(0, -0.15, 0)))); }
      return maestro;
    },
    // contraluz total: figura de un solo color (sin rostro ni rasgos)
    silueta(color = '#1A1A1A') { k.silueta(color); mH.color.set(color); return maestro; }
  };
  if (o.silueta) maestro.silueta(o.silueta);
  return maestro;
}
export const SEIZA_ALTURA = -0.62, SEIZA_CADERA = 0.955 + SEIZA_ALTURA; // altura de la pelvis en seiza: 0,335 m
// Añade a la escena el maestro y su pincel. (El pincel no cuelga del rig: se recoloca en cada maestro.pose().)
export function anadirMaestro(esc, maestro) { esc.escena.add(maestro.raiz); esc.escena.add(maestro.pincel.raiz); return maestro; }

// ======================================================================
// ALUMNOS y FILAS
// ======================================================================
export const PIELES = [['#EDB48C', '#F09A84'], ['#D99C70', '#E0876E'], ['#C08458', '#C8745E'], ['#F3C7A3', '#F2A28E'], ['#9E6A48', '#A85E4C']];
export const PELOS = ['#2A1E18', '#16110E', '#4A3226', '#6B4A32', '#3A2A20'];
const PEIN = ['normal', 'corto', 'flequillo', 'melena', 'mono', 'rapado'];
const CINTS = ['blanco', 'amarillo', 'naranja', 'verde', 'azul', 'marron', 'negro'];
// Alumno con variación determinista (i = índice). o: { peinado, pelo, piel: 0..4 | '#hex', cinturon, sombras }
export function crearAlumno(i = 0, o = {}) {
  const h = (s) => hash(i, s);
  const pi = typeof o.piel === 'number' ? PIELES[o.piel % PIELES.length] : o.piel ? [o.piel, o.mejilla || o.piel] : PIELES[Math.floor(h(1) * PIELES.length)];
  return new Karateka3D({
    peinado: o.peinado || PEIN[Math.floor(h(2) * PEIN.length)], pelo: o.pelo || PELOS[Math.floor(h(3) * PELOS.length)],
    piel: pi[0], mejilla: pi[1], cinturon: o.cinturon || CINTS[Math.floor(h(4) * CINTS.length)], sombras: o.sombras !== false
  });
}
// Fila / formación de N karatekas. o: { n: 12, columnas: 4, separacion: [1.15, 1.35] (x, z), origen: [0, -2] (centro de la primera fila),
//   rumbo: 0, iguales: false (true = todos como el karateka de la biblioteca), cinturon, sombrasHasta: 1 (filas que proyectan sombra),
//   simplificarDesde: 2 (desde esa fila: sin sombras proyectadas ni detalles pequeños) }
// fila.pose(P, pose | (i, k) => pose, { cara }) aplica la pose a todos (con desfase si pasas una función).
export function crearFila(esc, o = {}) {
  o = Object.assign({ n: 12, columnas: 4, separacion: [1.15, 1.35], origen: [0, -2], rumbo: 0, iguales: false, sombrasHasta: 1, simplificarDesde: 2 }, o);
  const miembros = [];
  for (let i = 0; i < o.n; i++) {
    const fila = Math.floor(i / o.columnas), col = i % o.columnas, nCol = Math.min(o.columnas, o.n - fila * o.columnas);
    const k = o.iguales ? new Karateka3D({ cinturon: o.cinturon || 'negro' }) : crearAlumno(i + 7, { cinturon: o.cinturon });
    const a = o.rumbo * D2R, lx = (col - (nCol - 1) / 2) * o.separacion[0] + (fila % 2 ? o.separacion[0] * 0.0 : 0), lz = -fila * o.separacion[1];
    const x = o.origen[0] + lx * Math.cos(a) + lz * Math.sin(a), z = o.origen[1] - lx * Math.sin(a) + lz * Math.cos(a);
    k.colocar(x, z, o.rumbo);
    k.raiz.traverse((m) => { if (m.isMesh) m.castShadow = m.castShadow && fila < o.sombrasHasta; });
    if (fila >= o.simplificarDesde) for (const e of k.ojos) { e.b1.visible = false; e.b2.visible = false; }
    k.fila = fila; esc.escena.add(k.raiz); miembros.push(k);
  }
  return {
    miembros,
    pose(P, pose, op = {}) {
      miembros.forEach((k, i) => { const p = typeof pose === 'function' ? pose(i, k) : typeof pose === 'string' ? P[pose] : pose; k.aplicarPose(p, op); if (op.cara) k.cara(typeof op.cara === 'function' ? op.cara(i, k) : op.cara); });
      return this;
    }
  };
}

export const CINTURONES_HISTORIA = CINTURONES;
export { FUENTE_KANJI };
