// KARATE EMAKI · escenario 3D: renderer, cámara vertical 9:16, luces cálidas, entorno, dōjō sencillo y composición 2D.
// Determinista: nada depende del reloj; la escena cambia solo con lo que hagas en render(t).
import * as THREE from './lib/three.module.min.js';

export const W = 1080, H = 1920;
export const COLOR = { papel: '#F4EFE6', tinta: '#1A1A1A', rojo: '#C8102E' };
const D2R = Math.PI / 180;

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- texturas procedurales (deterministas) ----------
// Suelo de madera clara: tablas de 15 cm, juntas escalonadas, veta suave. La textura cubre 3 m × 3 m.
function texturaMadera(o = {}) {
  const N = 1024, m = 3, px = N / m, c = lienzo(N, N), g = c.getContext('2d'), r = rng(o.semilla || 11);
  const base = o.color || [206, 164, 114];
  const ancho = 0.15 * px, filas = Math.round(N / ancho);
  for (let f = 0; f < filas; f++) {
    let x = -r() * 1.6 * px; const y = f * ancho;
    while (x < N) {
      const largo = (1.1 + r() * 1.2) * px, v = 0.9 + r() * 0.18, h = (r() - 0.5) * 10;
      const col = base.map((k, i) => Math.round(k * v + (i === 0 ? h : i === 2 ? -h : 0)));
      g.fillStyle = `rgb(${col})`; g.fillRect(x, y, largo, ancho);
      // veta: líneas finas onduladas
      g.save(); g.beginPath(); g.rect(x, y, largo, ancho); g.clip();
      const nv = 5 + Math.floor(r() * 5);
      for (let k = 0; k < nv; k++) {
        const yy = y + r() * ancho, a = 0.05 + r() * 0.09, fr = 0.004 + r() * 0.01, ph = r() * 6;
        g.strokeStyle = `rgba(120,78,40,${a})`; g.lineWidth = 0.8 + r() * 1.6; g.beginPath();
        for (let xx = x; xx <= x + largo; xx += 6) g.lineTo(xx, yy + Math.sin(xx * fr + ph) * ancho * 0.18 + Math.sin(xx * fr * 3.1 + ph) * 1.5);
        g.stroke();
      }
      // nudo ocasional
      if (r() < 0.12) { const kx = x + r() * largo, ky = y + ancho * (0.3 + r() * 0.4); const gr = g.createRadialGradient(kx, ky, 0, kx, ky, ancho * 0.25); gr.addColorStop(0, 'rgba(110,70,35,0.35)'); gr.addColorStop(1, 'rgba(110,70,35,0)'); g.fillStyle = gr; g.fillRect(kx - ancho, ky - ancho, ancho * 2, ancho * 2); }
      g.restore();
      // junta de testa
      g.fillStyle = 'rgba(90,58,30,0.55)'; g.fillRect(x + largo - 1, y, 2, ancho);
      x += largo;
    }
    g.fillStyle = 'rgba(90,58,30,0.6)'; g.fillRect(0, y, N, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// Tatami: esteras de 0,9 × 1,8 m con ribete oscuro (heri). La textura cubre 3,6 m × 3,6 m.
function texturaTatami() {
  const N = 1024, m = 3.6, px = N / m, c = lienzo(N, N), g = c.getContext('2d'), r = rng(5);
  g.fillStyle = '#CDBE8C'; g.fillRect(0, 0, N, N);
  const esteras = [[0, 0, 0.9, 1.8], [0.9, 0, 0.9, 1.8], [1.8, 0, 1.8, 0.9], [1.8, 0.9, 1.8, 0.9], [0, 1.8, 1.8, 0.9], [0, 2.7, 1.8, 0.9], [1.8, 1.8, 0.9, 1.8], [2.7, 1.8, 0.9, 1.8]];
  for (const [x, y, w, h] of esteras) {
    const v = 0.94 + r() * 0.1; g.fillStyle = `rgb(${[205, 190, 140].map((k) => Math.round(k * v))})`; g.fillRect(x * px, y * px, w * px, h * px);
    const hor = w > h; g.strokeStyle = 'rgba(120,105,60,0.25)'; g.lineWidth = 1;
    for (let k = 0; k < (hor ? h : w) * px; k += 3) { g.beginPath(); if (hor) { g.moveTo(x * px, y * px + k); g.lineTo((x + w) * px, y * px + k); } else { g.moveTo(x * px + k, y * px); g.lineTo(x * px + k, (y + h) * px); } g.stroke(); }
    g.fillStyle = '#3B342C'; const b = 0.035 * px;
    if (hor) { g.fillRect(x * px, y * px, w * px, b); g.fillRect(x * px, (y + h) * px - b, w * px, b); } else { g.fillRect(x * px, y * px, b, h * px); g.fillRect((x + w) * px - b, y * px, b, h * px); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// Pared del dōjō (12 × 6 m): zócalo de madera, postes, viga y paneles shōji iluminados. Ya viene desenfocada.
function texturaPared(desenfoque = 7) {
  const Wt = 2048, Ht = 1024, px = Wt / 12, c = lienzo(Wt, Ht), g = c.getContext('2d');
  const Y = (m) => Ht - m * px; // metros desde el suelo → píxel
  g.fillStyle = '#E2D2BA'; g.fillRect(0, 0, Wt, Ht);
  // shōji entre postes
  const paso = 1.8, poste = 0.14;
  for (let x0 = 0; x0 < 12; x0 += paso) {
    const a = (x0 + poste / 2) * px, b = (x0 + paso - poste / 2) * px;
    const gr = g.createLinearGradient(0, Y(2.05), 0, Y(0.45)); gr.addColorStop(0, '#F4EADA'); gr.addColorStop(1, '#ECDFCB');
    g.fillStyle = gr; g.fillRect(a, Y(2.05), b - a, Y(0.45) - Y(2.05));
    g.strokeStyle = 'rgba(168,128,88,0.55)'; g.lineWidth = 4;
    const nx = 4, ny = 6;
    for (let i = 1; i < nx; i++) { const x = a + (b - a) * i / nx; g.beginPath(); g.moveTo(x, Y(2.05)); g.lineTo(x, Y(0.45)); g.stroke(); }
    for (let i = 1; i < ny; i++) { const y = Y(2.05) + (Y(0.45) - Y(2.05)) * i / ny; g.beginPath(); g.moveTo(a, y); g.lineTo(b, y); g.stroke(); }
    // luz cálida que entra por el papel
    const gl = g.createRadialGradient((a + b) / 2, Y(1.5), 10, (a + b) / 2, Y(1.4), px * 1.3); gl.addColorStop(0, 'rgba(255,236,200,0.55)'); gl.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = gl; g.fillRect(a, Y(2.05), b - a, Y(0.45) - Y(2.05));
  }
  // postes, viga (nageshi), zócalo (koshiita)
  g.fillStyle = '#8A6142'; for (let x0 = 0; x0 <= 12; x0 += paso) g.fillRect((x0 - poste / 2) * px, 0, poste * px, Ht);
  g.fillStyle = '#946A48'; g.fillRect(0, Y(2.17), Wt, 0.12 * px);
  g.fillStyle = '#A67B54'; g.fillRect(0, Y(0.45), Wt, 0.45 * px);
  g.fillStyle = 'rgba(80,50,25,0.35)'; g.fillRect(0, Y(0.45), Wt, 4); g.fillRect(0, Y(0.05), Wt, 0.05 * px);
  // desenfoque (profundidad de campo simulada)
  const d = lienzo(Wt, Ht), gd = d.getContext('2d'); gd.filter = `blur(${desenfoque}px)`; gd.drawImage(c, 0, 0);
  const t = new THREE.CanvasTexture(d); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ---------- entorno (luz ambiente con reflejos suaves, sin texturas externas) ----------
function crearEntorno(renderer) {
  const s = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 48, 24), pos = geo.attributes.position, col = [];
  const cTop = new THREE.Color('#FFF6EA'), cHor = new THREE.Color('#EADCC6'), cBot = new THREE.Color('#9A7350'), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 10; if (y > 0) c.copy(cHor).lerp(cTop, Math.pow(y, 0.6)); else c.copy(cHor).lerp(cBot, Math.pow(-y, 0.5)); col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  s.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, pos, rgb) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); m.material.color.setRGB(...rgb); m.position.set(...pos); m.lookAt(0, 1, 0); s.add(m); };
  panel(5, 4, [-5, 6, 5], [3.2, 2.8, 2.3]);   // ventana / luz principal cálida
  panel(4, 3, [4, 5, -6], [2.2, 2.0, 1.7]);   // contraluz
  panel(3, 3, [7, 3, 3], [1.1, 1.05, 1.0]);   // relleno
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(s, 0.035).texture; pm.dispose();
  return env;
}

// ---------- el escenario ----------
// o: { escala: 0.5 (resolución interna respecto a 1080×1920), suelo: 'madera'|'tatami', fondo: 'dojo'|'degradado',
//      exposicion: 1, sombras: true, mapaSombra: 2048 }
export function crearEscenario(o = {}) {
  o = Object.assign({ escala: 0.5, suelo: 'madera', fondo: 'dojo', exposicion: 1.0, sombras: true, mapaSombra: 2048, desenfoque: 7 }, o);
  const w = Math.round(W * o.escala), h = Math.round(H * o.escala);
  const lienzoGL = lienzo(w, h);
  const renderer = new THREE.WebGLRenderer({ canvas: lienzoGL, antialias: true, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  renderer.shadowMap.enabled = o.sombras; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposicion;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const escena = new THREE.Scene();
  const colorNiebla = new THREE.Color('#DCCBB3');
  escena.background = colorNiebla.clone();
  escena.fog = new THREE.Fog(colorNiebla, 5.5, 15);
  escena.environment = crearEntorno(renderer);

  const camara = new THREE.PerspectiveCamera(28, 9 / 16, 0.1, 60);

  // luces: principal cálida (con sombra suave), relleno, contraluz y hemisférica
  const clave = new THREE.DirectionalLight('#FFD3A0', 3.2);
  clave.position.set(-3.4, 4.0, 1.9);
  clave.castShadow = o.sombras;
  clave.shadow.mapSize.set(o.mapaSombra, o.mapaSombra);
  Object.assign(clave.shadow.camera, { left: -1.8, right: 1.8, top: 2.2, bottom: -1.2, near: 0.5, far: 12 });
  clave.shadow.bias = -0.0004; clave.shadow.normalBias = 0.018; clave.shadow.radius = 4;
  const relleno = new THREE.DirectionalLight('#FFEFE0', 0.5); relleno.position.set(3.2, 1.6, 2.4);
  const contra = new THREE.DirectionalLight('#FFDCA8', 2.8); contra.position.set(1.8, 3.2, -3.8);
  const contra2 = new THREE.DirectionalLight('#FFE9CF', 1.0); contra2.position.set(-2.4, 2.4, -3.2);
  const hemi = new THREE.HemisphereLight('#FFF4E6', '#A9805A', 0.25);
  for (const l of [clave, relleno, contra, contra2]) { escena.add(l); escena.add(l.target); }
  escena.add(hemi);

  // suelo
  const texSuelo = o.suelo === 'tatami' ? texturaTatami() : texturaMadera();
  const rep = o.suelo === 'tatami' ? 3.6 : 3;
  texSuelo.repeat.set(24 / rep, 24 / rep);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ map: texSuelo, roughness: o.suelo === 'tatami' ? 0.85 : 0.5, envMapIntensity: 0.55 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; escena.add(suelo);
  // pared del fondo
  let pared = null;
  if (o.fondo === 'dojo') {
    pared = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshBasicMaterial({ map: texturaPared(o.desenfoque) }));
    pared.position.set(0, 3, -4.6); escena.add(pared);
    const lado = pared.clone(); lado.position.set(-6, 3, 1.4); lado.rotation.y = Math.PI / 2; escena.add(lado);
    const lado2 = pared.clone(); lado2.position.set(6, 3, 1.4); lado2.rotation.y = -Math.PI / 2; escena.add(lado2);
  }

  // ---------- cámara ----------
  const tmp = new THREE.Vector3();
  const esc = {
    THREE, renderer, escena, camara, suelo, pared, luces: { clave, relleno, contra, contra2, hemi }, lienzoGL, w, h,
    // cámara en órbita: centro [x,y,z] al que mira, distancia (m), azimut (° alrededor de Y; 0 = desde +Z), elevación (°), fov (° vertical)
    orbita({ centro = [0, 0.9, 0], distancia = 4.2, azimut = 0, elevacion = 6, fov = 28, alto = 0 } = {}) {
      const a = azimut * D2R, e = elevacion * D2R;
      camara.position.set(centro[0] + Math.sin(a) * Math.cos(e) * distancia, centro[1] + Math.sin(e) * distancia + alto, centro[2] + Math.cos(a) * Math.cos(e) * distancia);
      camara.fov = fov; camara.updateProjectionMatrix(); camara.lookAt(centro[0], centro[1] + alto, centro[2]); camara.updateMatrixWorld();
      return esc;
    },
    mirar(desde, hacia, fov = 28) { camara.position.set(...desde); camara.fov = fov; camara.updateProjectionMatrix(); camara.lookAt(...hacia); camara.updateMatrixWorld(); return esc; },
    // centra la caja de la sombra de la luz principal en (x, z) (si el personaje se aleja del origen)
    sombraEn(x = 0, z = 0) { clave.target.position.set(x, 0, z); clave.position.set(x - 3.4, 4.0, z + 1.9); clave.target.updateMatrixWorld(); return esc; },
    // Vector3 del mundo → píxeles del vídeo 1080×1920 {x, y, delante}
    proyectar(v) { tmp.copy(v).project(camara); return { x: (tmp.x + 1) / 2 * W, y: (1 - tmp.y) / 2 * H, delante: tmp.z < 1 }; },
    // Renderiza el 3D y lo compone en el contexto 2D del vídeo (1080×1920) con viñeta y grano suaves.
    dibujar(ctx, op = {}) {
      renderer.render(escena, camara);
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(lienzoGL, 0, 0, W, H); ctx.restore();
      if (op.vineta !== false) vineta(ctx, op.vineta);
      if (op.grano !== false) grano(ctx);
      return esc;
    }
  };
  esc.orbita();
  return esc;
}

let _vin = null, _gr = null;
function vineta(ctx, fuerza = 1) {
  if (!_vin) {
    _vin = lienzo(W, H); const g = _vin.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H * 0.52, H * 0.3, W / 2, H * 0.52, H * 0.78);
    gr.addColorStop(0, 'rgba(60,38,20,0)'); gr.addColorStop(1, 'rgba(60,38,20,0.42)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.globalAlpha = typeof fuerza === 'number' ? fuerza : 1; ctx.drawImage(_vin, 0, 0); ctx.restore();
}
function grano(ctx) {
  if (!_gr) {
    _gr = lienzo(540, 960); const g = _gr.getContext('2d'), im = g.createImageData(540, 960), r = rng(7);
    for (let i = 0; i < im.data.length; i += 4) { const v = r(); im.data[i] = im.data[i + 1] = im.data[i + 2] = v > 0.5 ? 255 : 30; im.data[i + 3] = Math.abs(v - 0.5) * 22; }
    g.putImageData(im, 0, 0);
  }
  ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(_gr, 0, 0, W, H); ctx.restore();
}

// ---------- utilidades de tiempo (iguales que EMAKI.util) ----------
export const util = {
  clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  prog: (t, t0, t1) => Math.max(0, Math.min(1, (t - t0) / (t1 - t0))),
  easeInOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  easeOut: (x) => 1 - Math.pow(1 - x, 3),
  easeIn: (x) => x * x * x,
  easeBack: (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
  suave: (x) => x * x * (3 - 2 * x),
  // parpadeo natural: 1 → ojos cerrados en los instantes dados (s), cada parpadeo dura ~0,16 s
  parpadeo: (t, instantes = [], dur = 0.16) => { let v = 0; for (const t0 of instantes) { const x = (t - t0) / dur; if (x > 0 && x < 1) v = Math.max(v, Math.sin(Math.PI * x)); } return v; }
};
