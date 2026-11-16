// KARATE EMAKI · biblioteca 3D de la pieza «cinturón de judo» (2026-11-16):
// cinturón suelto que se pasa de mano a mano, siluetas de judoka (blanco/negro, Kanō, Kawaishi), sala del Kōdōkan
// con público sentado, pancarta y sello rojo con kanji (2D). Todo determinista. Personas reales: SIEMPRE siluetas.
import * as THREE from './lib/three.module.min.js';
import { Karateka3D, CINTURONES } from './karateka3d.js';
import { crearAlumno } from './historia3d.js';
import { rng, kanji, ROJO, TINTA, FUENTE_KANJI } from './historia2d.js';

export { THREE };
const D2R = Math.PI / 180;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const suave = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// ======================================================================
// Cinturón suelto (cinta plana con caídas)
// ======================================================================
// crearCinturonSuelto({ color: 'negro', largo: 1.9, ancho: 0.05 })
//   .entre(A, B, { holgura })  → sujeto por dos puntos (Vector3, p. ej. k.punto('manoI') y k.punto('manoD')); las puntas cuelgan
//   .pasar(dador, receptor, p, { arco: 0.1 }) → p 0..1: viaja de las manos de `dador` a las de `receptor` (Karateka3D ya con su pose)
//   .tirante(A, B) → tensado entre dos puntos (si están más lejos que el largo, se queda recto)
//   .halo(p) → resplandor suave de leyenda (0..1), borde irregular; `.raiz` se añade a esc.escena
export function crearCinturonSuelto(o = {}) {
  o = Object.assign({ color: 'negro', largo: 1.9, ancho: 0.05, grosor: 0.014, n: 36 }, o);
  const N = o.n, raiz = new THREE.Group();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 4 * 3), 3));
  const idx = [];
  for (let i = 0; i < N; i++) for (let c = 0; c < 4; c++) { const a = i * 4 + c, b = i * 4 + (c + 1) % 4, a2 = a + 4, b2 = b + 4; idx.push(a, b, b2, a, b2, a2); }
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({ color: CINTURONES[o.color] || o.color, roughness: 0.78, side: THREE.DoubleSide, envMapIntensity: 0.5, emissive: o.color === 'negro' ? '#3C3836' : '#000000' }); // el negro lleva un reflejo suave para leerse sobre siluetas oscuras
  const malla = new THREE.Mesh(geo, mat); malla.castShadow = true; malla.receiveShadow = true; malla.frustumCulled = false; raiz.add(malla);
  const pts = [], T = V3(0, 0, 0), W = V3(0, 0, 1), Nn = V3(0, 0, 0);
  function trazar(P) {
    const curva = new THREE.CatmullRomCurve3(P, false, 'catmullrom', 0.5);
    const q = curva.getPoints(N), pos = geo.attributes.position;
    for (let i = 0; i <= N; i++) {
      const a = q[Math.max(0, i - 1)], b = q[Math.min(N, i + 1)];
      T.subVectors(b, a).normalize();
      W.set(0, 0, 1); W.addScaledVector(T, -W.dot(T)); if (W.lengthSq() < 1e-4) W.set(1, 0, 0); W.normalize();
      Nn.crossVectors(T, W).normalize();
      const hw = o.ancho / 2, ht = o.grosor / 2;
      const ring = [[hw, ht], [-hw, ht], [-hw, -ht], [hw, -ht]];
      for (let c = 0; c < 4; c++) pos.setXYZ(i * 4 + c, q[i].x + W.x * ring[c][0] + Nn.x * ring[c][1], q[i].y + W.y * ring[c][0] + Nn.y * ring[c][1], q[i].z + W.z * ring[c][0] + Nn.z * ring[c][1]);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    raiz.userData.centro = q[Math.floor(N / 2)].clone();
  }
  // halo de leyenda
  const ch = lienzo(256, 256), g = ch.getContext('2d'), r = rng(11);
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 120); gr.addColorStop(0, 'rgba(255,214,120,1)'); gr.addColorStop(0.45, 'rgba(255,190,90,0.45)'); gr.addColorStop(1, 'rgba(255,170,70,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.globalCompositeOperation = 'destination-out'; // borde irregular: mordiscos suaves
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = 70 + r() * 55, rad = 14 + r() * 22; const gg = g.createRadialGradient(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, 0, 128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rad); gg.addColorStop(0, 'rgba(0,0,0,0.75)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(0, 0, 256, 256); }
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(ch), transparent: true, depthWrite: false, depthTest: false, opacity: 0, blending: THREE.AdditiveBlending }));
  sprite.renderOrder = 10; sprite.visible = false; raiz.add(sprite);
  const cinta = {
    raiz, malla, mat,
    color(c) { mat.color.set(CINTURONES[c] || c); mat.emissive.set(c === 'negro' ? '#3C3836' : '#000000'); return cinta; },
    entre(A, B, { holgura = 1 } = {}) {
      const d = B.clone().sub(A), s = d.length(), dh = s > 1e-4 ? d.clone().multiplyScalar(1 / s) : V3(1, 0, 0);
      const lt = Math.max(0.12, (o.largo - s) / 2) * holgura, sag = Math.max(0, 0.03 - s * 0.02);
      const m = A.clone().lerp(B, 0.5); m.y -= sag;
      const cola = (P, sg) => { // sg = -1 hacia fuera por el lado de P respecto del centro
        const f = dh.clone().multiplyScalar(sg);
        return [P.clone().addScaledVector(f, 0.02).add(V3(0, -lt, 0).multiplyScalar(1)), P.clone().addScaledVector(f, 0.035).add(V3(0, -lt * 0.7, 0)), P.clone().addScaledVector(f, 0.05).add(V3(0, -lt * 0.35, 0)), P.clone().addScaledVector(f, 0.035).add(V3(0, -0.04, 0)), P.clone()];
      };
      const cA = cola(A, -1), cB = cola(B, 1);
      trazar([...cA, m, ...cB.reverse()]);
      return cinta;
    },
    tirante(A, B) { const s = A.distanceTo(B); const m = A.clone().lerp(B, 0.5); const d = B.clone().sub(A).normalize(); const h = o.largo / 2; return cinta._recta(m, d, Math.min(h, Math.max(0.2, h))); },
    _recta(m, d, h) { trazar([m.clone().addScaledVector(d, -h), m.clone().addScaledVector(d, -h / 3), m.clone().addScaledVector(d, h / 3), m.clone().addScaledVector(d, h)]); return cinta; },
    // viaja de las manos del dador a las del receptor; el arco sube un poco a mitad de camino
    pasar(dador, receptor, p, { arco = 0.1 } = {}) {
      const q = suave(p), mid = (k, L) => k.punto('mano' + L);
      const A = mid(dador, 'I').lerp(mid(receptor, 'D'), q), B = mid(dador, 'D').lerp(mid(receptor, 'I'), q);
      const h = Math.sin(Math.PI * clamp(p)) * arco; A.y += h; B.y += h;
      // el cinturón cruza entre la mano I del dador y la D del receptor: ambas quedan en el mismo lado en pantalla
      cinta.entre(A, B); return cinta;
    },
    halo(p, escala = 1.4) {
      const k = clamp(p); sprite.visible = k > 0.001; sprite.material.opacity = 0.55 * suave(k);
      const c = raiz.userData.centro || V3(0, 1, 0); sprite.position.copy(c); raiz.worldToLocal(sprite.position); sprite.scale.setScalar(escala * (0.8 + 0.3 * suave(k)));
      return cinta;
    },
    ocultar() { raiz.visible = false; return cinta; }, mostrar() { raiz.visible = true; return cinta; }
  };
  cinta.entre(V3(-0.2, 1, 0), V3(0.2, 1, 0));
  return cinta;
}

// ======================================================================
// Siluetas de judoka
// ======================================================================
// crearJudoka({ cinturon: 'blanco' | 'negro', color: '#3E3A36', detalle: null | 'kano' | 'kawaishi' })
// Silueta sin rostro con el cinturón VISIBLE (blanco o negro puro). Pose: neutra, yoi, rei, pies-juntos (con `detalle: 'kano'` solo piernas juntas).
// `detalle` es la única seña de las figuras históricas (nada de rasgos): 'kano' = hakama (falda recta oscura),
// 'kawaishi' = boina plana. Kanō SIEMPRE con color '#1A1A1A' (storyboard).
export function crearJudoka(o = {}) {
  o = Object.assign({ cinturon: 'blanco', color: '#3E3A36', detalle: null, peinado: 'corto' }, o);
  const k = new Karateka3D({ cinturon: o.cinturon, peinado: o.peinado, sombras: o.sombras });
  const cintMat = new THREE.MeshStandardMaterial({ color: o.cinturon === 'negro' ? '#0A0A0A' : (CINTURONES[o.cinturon] || o.cinturon), roughness: 0.8, side: THREE.DoubleSide });
  const prev = k.mat.cint;
  k.silueta(o.color);
  for (const [m, mat] of k._matOrig) if (mat === prev) m.material = cintMat;
  const matSil = new THREE.MeshStandardMaterial({ color: o.color, roughness: 0.9, side: THREE.DoubleSide });
  if (o.detalle === 'kano') {
    const g = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 24, 1, true); g.scale(1, 1, 0.8);
    const f = new THREE.Mesh(g, matSil); f.position.set(0, -0.37, 0.0); f.castShadow = true; k.j.cadera.add(f);
    const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.07, 24), matSil); cb.scale.set(1, 1, 0.8); cb.position.set(0, 0.03, 0); k.j.cadera.add(cb);
    k.hakama = f;
  } else if (o.detalle === 'kawaishi') {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), matSil); b.scale.set(0.21, 0.06, 0.21); b.position.set(0.015, 0.31, 0.0); b.rotation.z = -0.12; b.castShadow = true;
    k.j.cabeza.add(b); k.boina = b;
  }
  return k;
}

// ======================================================================
// Sala del Kōdōkan (estilizada, sin logos ni escudos): paredes de yeso claro con postes y vigas de madera,
// ventanales de shōji, suelo de tatami (usa crearEscenario({ suelo: 'tatami', fondo: 'degradado' })) y público sentado en U.
// ======================================================================
function texShoji(nx = 4, ny = 3) {
  const c = lienzo(256, 192), g = c.getContext('2d');
  g.fillStyle = '#F7F0E1'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#B88C5C';
  for (let i = 0; i <= nx; i++) g.fillRect(i * 256 / nx - 3, 0, 6, 192); for (let j = 0; j <= ny; j++) g.fillRect(0, j * 192 / ny - 3, 256, 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const matMad = (c = '#8A6142') => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, envMapIntensity: 0.4 });

// crearSala(esc, { ancho: 16, fondo: 22, publico: { lados: 2, frente: 1, filasLado: 3, porFila: 6, porFilaFrente: 7 } | null })
// → { raiz, publico: { miembros, pose(P, { t, modo }) }, pancarta(texto) }
export function crearSala(esc, o = {}) {
  o = Object.assign({ ancho: 16, fondo: 22, alto: 6, publico: {}, color: '#2B2723' }, o);
  const raiz = new THREE.Group();
  const yeso = new THREE.MeshStandardMaterial({ color: '#EDE2CF', roughness: 0.95 }), mad = matMad('#7A5638'), madClara = matMad('#B58A5A'), shoji = new THREE.MeshStandardMaterial({ map: texShoji(), roughness: 0.9, emissive: '#3A2E1E', emissiveIntensity: 0.35 });
  const hx = o.ancho / 2, zf = -o.fondo + 6; // pared del fondo
  const caja = (w, h, d, m, x, y, z, rot = 0) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(x, y, z); q.rotation.y = rot; q.castShadow = false; q.receiveShadow = true; raiz.add(q); return q; };
  // pared del fondo y laterales (cada una con zócalo de madera, ventanales de shōji y postes cada 3 m)
  const pared = (x, z, rot, largo) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; raiz.add(g);
    const add = (w, h, d, m, px, py, pz) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(px, py, pz); q.receiveShadow = true; g.add(q); };
    add(largo, o.alto, 0.2, yeso, 0, o.alto / 2, 0);
    add(largo, 0.9, 0.24, madClara, 0, 0.45, 0.02);                      // zócalo
    add(largo, 0.16, 0.26, mad, 0, 2.2, 0.03); add(largo, 0.2, 0.28, mad, 0, o.alto - 0.1, 0.03); // vigas
    const n = Math.floor(largo / 3);
    for (let i = 0; i <= n; i++) add(0.2, o.alto, 0.28, mad, -largo / 2 + i * largo / n, o.alto / 2, 0.04); // postes
    for (let i = 0; i < n; i++) { const cx = -largo / 2 + (i + 0.5) * largo / n; add(largo / n - 0.5, 1.7, 0.05, shoji, cx, 3.35, 0.12); } // ventanales
    return g;
  };
  pared(0, zf, 0, o.ancho + 0.6);
  pared(-hx, zf + o.fondo / 2 - 3, Math.PI / 2, o.fondo + 6); pared(hx, zf + o.fondo / 2 - 3, -Math.PI / 2, o.fondo + 6);
  esc.escena.add(raiz);
  esc.escena.fog.near = 14; esc.escena.fog.far = 60;
  // las paredes del dōjō cálido de crearEscenario se ocultan mientras la sala esté visible (sala.mostrar() / sala.ocultar())
  const paredesDojo = esc.escena.children.filter((m) => m.isMesh && m.geometry.type === 'PlaneGeometry' && m.geometry.parameters.width === 12 && m.geometry.parameters.height === 6);
  const sala = { raiz, publico: null, paredesDojo,
    mostrar() { raiz.visible = true; paredesDojo.forEach((m) => (m.visible = false)); if (sala.publico) sala.publico.miembros.forEach((q) => (q.raiz.visible = true)); return sala; },
    ocultar() { raiz.visible = false; paredesDojo.forEach((m) => (m.visible = true)); if (sala.publico) sala.publico.miembros.forEach((q) => (q.raiz.visible = false)); return sala; } };
  paredesDojo.forEach((m) => (m.visible = false));

  // público sentado en U: dos lados mirando al centro y un fondo que mira a cámara. Siluetas con `crearAlumno` + seiza.
  if (o.publico) {
    const pb = Object.assign({ filasLado: 3, porFila: 6, porFilaFrente: 7, filasFrente: 2, sepFila: 1.05, sepLado: 0.85, xLado: 3.2, zFondo: -3.6, centroZ: -1.2, simplificarDesde: 1 }, o.publico);
    const miembros = [];
    const nuevo = (i, x, z, rumbo, fila) => {
      const k = crearAlumno(i + 3, { cinturon: i % 5 === 0 ? 'negro' : 'blanco' });
      k.silueta(o.color); k.colocar(x, z, rumbo); esc.escena.add(k.raiz);
      k.raiz.traverse((m) => { if (m.isMesh) m.castShadow = false; });
      if (fila >= pb.simplificarDesde) for (const e of k.ojos) { e.b1.visible = false; e.b2.visible = false; }
      k.fila = fila; miembros.push(k); return k;
    };
    let n = 0;
    for (const lado of [-1, 1]) for (let f = 0; f < pb.filasLado; f++) for (let c = 0; c < pb.porFila; c++)
      nuevo(n++, lado * (pb.xLado + f * pb.sepFila), pb.centroZ + (c - (pb.porFila - 1) / 2) * pb.sepLado, lado > 0 ? -90 : 90, f);
    for (let f = 0; f < pb.filasFrente; f++) for (let c = 0; c < pb.porFilaFrente; c++)
      nuevo(n++, (c - (pb.porFilaFrente - 1) / 2) * pb.sepLado, pb.zFondo - f * pb.sepFila, 0, f);
    sala.publico = {
      miembros,
      // modo: 'quieto' | 'asentir' (cabezas que cabecean) | 'mirar' (se vuelven unos a otros). t en segundos.
      pose(P, { t = 0, modo = 'quieto', ritmo = 1.4 } = {}) {
        miembros.forEach((k, i) => {
          const fase = i * 0.7, a = modo === 'asentir' ? Math.max(0, Math.sin((t * ritmo + fase * 0.3) * Math.PI)) * 14 : 0;
          const giro = modo === 'mirar' ? Math.sin(clamp(t * 0.6 * ritmo) * Math.PI) * (i % 2 ? 38 : -38) : 0;
          k.aplicarPose({ ...P.seiza, cabeza: { inclina: a, giro } }, { suelo: false, altura: -0.62 });
        });
        return sala.publico;
      }
    };
  }
  return sala;
}

// Pancarta colgada (3D, tela con dos varas): vacía por defecto («sala llena» se pone en 2D con overlay o con texto).
export function crearPancarta(o = {}) {
  o = Object.assign({ texto: '', ancho: 2.2, alto: 0.7, y: 3.4 }, o);
  const raiz = new THREE.Group(), c = lienzo(1024, Math.round(1024 * o.alto / o.ancho)), g = c.getContext('2d');
  g.fillStyle = '#F4EFE6'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#1A1A1A'; g.lineWidth = 8; g.strokeRect(14, 14, c.width - 28, c.height - 28);
  if (o.texto) { g.fillStyle = '#1A1A1A'; g.font = `900 ${Math.round(c.height * 0.5)}px Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.texto, c.width / 2, c.height / 2 + 6); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(o.ancho, o.alto), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })); tela.position.y = o.y; raiz.add(tela);
  for (const dy of [o.alto / 2 + 0.02, -o.alto / 2 - 0.02]) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, o.ancho + 0.2, 10), matMad('#6E4A31')); v.rotation.z = Math.PI / 2; v.position.y = o.y + dy; raiz.add(v); }
  const p = { raiz, colocar(x, z, rumbo = 0) { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return p; }, pop(q) { raiz.visible = q > 0; raiz.scale.setScalar(Math.max(0.0001, suave(q))); return p; } };
  return p;
}

// ======================================================================
// Sello rojo con kanji (2D): 沖縄 «Okinawa», 初段 «shodan» (primer dan)… `p` 0→1 lo estampa con rebote
// sello(ctx, '初段', x, y, size, p, { rotar: -0.08 })
// ======================================================================
export function sello(ctx, texto, x, y, size, p = 1, o = {}) {
  if (p <= 0) return;
  const q = clamp(p), s = q < 1 ? 1 + 0.35 * Math.pow(1 - q, 2) * Math.cos(q * 9) : 1, a = Math.min(1, q * 5);
  const rot = o.rotar ?? -0.07, color = o.color || ROJO, pad = size * 0.16, lado = size + pad * 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(-lado / 2, -lado / 2, lado, lado, lado * 0.08); ctx.fill();
  ctx.strokeStyle = '#F4EFE6'; ctx.lineWidth = Math.max(3, size * 0.035); ctx.beginPath(); ctx.roundRect(-lado / 2 + pad * 0.35, -lado / 2 + pad * 0.35, lado - pad * 0.7, lado - pad * 0.7, lado * 0.05); ctx.stroke();
  const chars = [...texto], vertical = chars.length === 2 ? o.vertical !== false : false;
  ctx.fillStyle = '#F4EFE6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (chars.length === 2) {
    ctx.font = `900 ${size * 0.5}px ${FUENTE_KANJI}`;
    if (vertical) { ctx.fillText(chars[0], 0, -size * 0.27); ctx.fillText(chars[1], 0, size * 0.27); } else { ctx.fillText(chars[0], -size * 0.27, 0); ctx.fillText(chars[1], size * 0.27, 0); }
  } else { ctx.font = `900 ${size * 0.7}px ${FUENTE_KANJI}`; ctx.fillText(texto, 0, 0); }
  ctx.restore();
}
