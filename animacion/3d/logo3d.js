// KARATE EMAKI · la cara del logo en 3D (planos 1 y 9 de la presentación).
// Reproduce el encuadre de animacion/perfil/foto-perfil.png (src/cuerpo.html + foto.py): karateka en yoi, rumbo 12°,
// cara { sonrisa 0,85, cejas 0,35 }, cámara orbita({ centro [0,1.25,0], distancia 3.3, elevacion 2, fov 26 }), disco
// rojo #C8102E de radio 450 px sobre papel #F4EFE6. El cuadrado del logo (1080×1080) se coloca en el vídeo con su
// disco centrado en (540, LOGO.cy).
//
//   const logo = crearLogo(esc, k);         // esc con escala 1 para el cierre de cara
//   logo.personaje(P);                      // pose, rumbo y cara del logo
//   logo.actualizar(f);                     // f = 0: encuadre exacto del logo · f = 1: dōjō, cuerpo entero frontal
//   logo.dibujar(ctx, f);                   // = esc.dibujar sin viñeta ni grano en f = 0 (igual que el logo)
import * as THREE from './lib/three.module.min.js';

export const LOGO = {
  cy: 960,                 // centro del disco en el vídeo (px). En el PNG del perfil está en (540, 540) del cuadrado
  r: 450,                  // radio del disco (px)
  rumbo: 12, pose: 'yoi',
  cara: { sonrisa: 0.85, cejas: 0.35, parpadeo: 0 },
  camara: { centro: [0, 1.25, 0], distancia: 3.3, azimut: 0, elevacion: 2, fov: 26 },
  cuerpoEntero: { centro: [0, 0.95, 0], distancia: 7, azimut: 0, elevacion: 3, fov: 26 },
  filaDisco: 560,          // fila del centro del disco en el render original de cuerpo.html (y0 = 20 del recorte + 540)
  papel: '#F4EFE6', rojo: '#C8102E'
};
const H = 1920, W = 1080, D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Pone la cámara en el encuadre del logo (desplazamiento vertical exacto en píxeles con setViewOffset).
export function encuadreLogo(esc, o = {}) {
  const cy = o.cy ?? LOGO.cy;
  esc.orbita(LOGO.camara);
  const d = cy - LOGO.filaDisco;
  esc.camara.setViewOffset(W, H, 0, -d, W, H); esc.camara.updateProjectionMatrix();
  return esc;
}
// Quita el desplazamiento (llámalo si reutilizas la cámara con orbita() en otra escena de la misma página)
export function liberarCamara(esc) { esc.camara.clearViewOffset(); esc.camara.updateProjectionMatrix(); return esc; }

export function crearLogo(esc, k, o = {}) {
  o = Object.assign({ cy: LOGO.cy, profDisco: 0.55, final: LOGO.cuerpoEntero }, o);
  const cam = esc.camara;
  const matDisco = new THREE.MeshBasicMaterial({ color: LOGO.rojo, toneMapped: false, fog: false, transparent: true, depthWrite: false });
  const matPapel = new THREE.MeshBasicMaterial({ color: LOGO.papel, toneMapped: false, fog: false, transparent: true, depthWrite: false });
  const disco = new THREE.Mesh(new THREE.CircleGeometry(1, 160), matDisco);
  const fondo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matPapel);
  disco.renderOrder = -9; fondo.renderOrder = -10;
  esc.escena.add(fondo); esc.escena.add(disco);

  // Coloca disco y papel en planos paralelos a la imagen detrás del personaje, en el encuadre exacto del logo.
  encuadreLogo(esc, { cy: o.cy });
  liberarCamara(esc); // el cálculo se hace sin desplazamiento (en filas del render original)
  cam.updateMatrixWorld();
  const Dd = LOGO.camara.distancia + o.profDisco, tg = Math.tan(LOGO.camara.fov / 2 * D2R);
  const ndcY = 1 - 2 * LOGO.filaDisco / H;
  const pDisco = new THREE.Vector3(0, ndcY * Dd * tg, -Dd).applyMatrix4(cam.matrixWorld);
  const rDisco = LOGO.r / (H / 2) * Dd * tg;
  const pPapel = new THREE.Vector3(0, ndcY * Dd * tg, -(Dd + 0.05)).applyMatrix4(cam.matrixWorld);
  const q = cam.quaternion.clone();
  const inicio = { pos: pDisco.clone(), r: rDisco };
  const destino = { pos: new THREE.Vector3(0, 2.6, -4.4), r: 0.55 }; // el sol se va al fondo, sobre la pared
  fondo.position.copy(pPapel); fondo.quaternion.copy(q); fondo.scale.set(9, 9, 1);
  disco.quaternion.copy(q);

  const L = {
    disco, fondo, LOGO,
    // Personaje en el estado exacto del logo (pose yoi, rumbo 12, cara del logo). `cara` extra se mezcla encima.
    personaje(P, cara = {}) { k.colocar(0, 0, LOGO.rumbo).aplicarPose(P[LOGO.pose]); k.cara(Object.assign({}, LOGO.cara, cara)); return L; },
    // Cámara: f = 0 encuadre del logo → f = 1 cuerpo entero frontal (o.final). Curva suave incluida.
    camara(f) {
      const e = easeInOut(clamp(f)), a = LOGO.camara, b = o.final;
      esc.orbita({ centro: a.centro.map((v, i) => lerp(v, b.centro[i], e)), distancia: lerp(a.distancia, b.distancia, e), azimut: lerp(a.azimut, b.azimut, e), elevacion: lerp(a.elevacion, b.elevacion, e), fov: lerp(a.fov, b.fov, e) });
      const d = (o.cy - LOGO.filaDisco) * (1 - e);
      if (Math.abs(d) > 1e-6) cam.setViewOffset(W, H, 0, -d, W, H); else cam.clearViewOffset();
      cam.updateProjectionMatrix();
      return L;
    },
    // Disco y papel: f = 0 logo (papel opaco, disco en su sitio) → el papel se funde en 0–0,4 (aparece el dōjō) y el
    // disco se va al fondo encogiéndose como un sol y se apaga en 0,55–1.
    fondoLogo(f) {
      f = clamp(f);
      const m = easeInOut(clamp(f / 0.85));
      disco.position.lerpVectors(inicio.pos, destino.pos, m);
      const r = lerp(inicio.r, destino.r, m); disco.scale.set(r, r, 1);
      matDisco.opacity = 1 - clamp((f - 0.55) / 0.45); disco.visible = matDisco.opacity > 0.001;
      matPapel.opacity = 1 - easeInOut(clamp(f / 0.4)); fondo.visible = matPapel.opacity > 0.001;
      return L;
    },
    actualizar(f, fCam = f) { L.fondoLogo(f); L.camara(fCam); return L; },
    // Render: en f = 0 sin viñeta ni grano (igual que el PNG del perfil); la viñeta entra con f.
    dibujar(ctx, f = 0) { esc.dibujar(ctx, { vineta: clamp(f), grano: f > 0.05 }); return L; },
    // Quita disco y papel de la escena (si la misma escena sigue con otra cosa)
    ocultar() { disco.visible = fondo.visible = false; return L; }
  };
  L.actualizar(0);
  return L;
}

// Caras listas para el plano 7 (kiai) y el gallo. Úsalas con k.cara(CARAS.kiai) o mezclando con mezclarCara.
export const CARAS = {
  logo: LOGO.cara,
  kiai: { grito: 1, cejas: -0.7 },
  gallo: { grito: 0.6, cejas: 0.45, asimetria: 0.45, torcida: 1, ojos: 1, mirada: [0.5, 1] },
  deReojo: { cejas: -0.3, mirada: [1, 0], sonrisa: 0.2 }
};
// Interpola dos caras (números y mirada). f 0..1.
export function mezclarCara(a, b, f) {
  const o = {}, ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of ks) {
    if (key === 'mirada') { const x = a.mirada || [0, 0], y = b.mirada || [0, 0]; o.mirada = [lerp(x[0], y[0], f), lerp(x[1], y[1], f)]; }
    else o[key] = lerp(a[key] || 0, b[key] || 0, f);
  }
  return o;
}
