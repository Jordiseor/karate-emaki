// KARATE EMAKI · biblioteca 3D de kumite WKF (pieza 2026-11-16-kumite-puntos):
// pareja aka (cinturón rojo) / ao (cinturón azul), alineación del rival para patadas con control, tatami con área y jōgai.
// El rojo del cinturón aka es el de reglamento (permitido aquí); el rojo de marca #C8102E sigue siendo solo para golpes/datos.
import * as THREE from './lib/three.module.min.js';
import { Karateka3D, CINTURONES, mezclar, mezclarCadena } from './karateka3d.js';

export { THREE };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const D2R = Math.PI / 180;
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// Colores de cinturón (aka rojo algo más oscuro que el rojo de marca para que no se confunda con rastros y marcador)
export const CINTURON_AKA = '#B01620', CINTURON_AO = '#1F4C9A';

// crearPareja(esc, { distancia: 1.5, aka: {}, ao: {} }) → { aka, ao, colocar(distancia), alinear(tecnica, op) }
// aka en (0, -distancia/2) mirando a +Z (rumbo 0); ao en (0, +distancia/2) mirando hacia aka (rumbo 180). Ambos en kamae.
export function crearPareja(esc, o = {}) {
  o = Object.assign({ distancia: 1.5, aka: {}, ao: {} }, o);
  const aka = new Karateka3D(Object.assign({ cinturon: CINTURON_AKA, peinado: 'corto' }, o.aka));
  const ao = new Karateka3D(Object.assign({ cinturon: CINTURON_AO, peinado: 'flequillo', pelo: '#2A1E18' }, o.ao));
  esc.escena.add(aka.raiz); esc.escena.add(ao.raiz);
  const par = {
    aka, ao,
    // los pone enfrentados a `distancia` (m, entre pies base) centrados en el origen
    colocar(d = o.distancia, x = 0, z = 0, rumbo = 0) {
      const a = rumbo * D2R, f = V3(Math.sin(a), 0, Math.cos(a));
      aka.colocar(x - f.x * d / 2, z - f.z * d / 2, rumbo); ao.colocar(x + f.x * d / 2, z + f.z * d / 2, rumbo + 180); return par;
    },
    // punto medio entre los dos (para centrar la cámara): [x, z]
    centro() { return [(aka.base.x + ao.base.x) / 2, (aka.base.z + ao.base.z) / 2]; },
    // pone `ao` donde le toca a la técnica de `aka` (ya con su pose aplicada y ao con la suya): el pie/puño se detiene a `hueco` m de la superficie.
    // tecnica: 'mawashi-geri-jodan' (cabeza) | 'mawashi-geri-chudan' (costado) | 'mawashi-geri-espalda' (espalda) | 'mae-geri-chudan' (pecho) | 'gyaku-zuki-chudan' (pecho, puño)
    // Devuelve la distancia final (m); par.contacto = { zona, normal } (normal = coseno entre la dirección de contacto y la normal esperada: <0,5 = mal ángulo).
    alinear(tecnica, { hueco = 0.03, pose = null } = {}) { const d = alinearRival(aka, ao, tecnica, { hueco, pose }); par.contacto = alinearRival.ultimo; return d; }
  };
  return par.colocar(o.distancia);
}

// Zonas de impacto de `ao`: elipsoide-cilindro del tronco (radios 0,155 × 0,125, de y −0,05 a 0,38 en el marco del tronco) o esfera de la cabeza (r 0,19).
// `normal`: dirección local (marco del tronco) por la que se espera el contacto: costado izq. = +x, espalda = −z, pecho = +z.
const ZONAS = {
  'mawashi-geri-jodan': { forma: 'cabeza', normal: null, ini: [0.21, 0] },
  'mawashi-geri-chudan': { forma: 'tronco', normal: [1, 0, 0], ini: [0.2, 0] },
  'mawashi-geri-espalda': { forma: 'tronco', normal: [0, 0, -1], ini: [0.2, 0] },
  'mae-geri-chudan': { forma: 'tronco', normal: [0, 0, 1], ini: [0, 0.2] },
  'gyaku-zuki-chudan': { forma: 'tronco', normal: [0, 0, 1], ini: [0, 0.2], mano: true }
};
// distancia con signo (m) de un punto del mundo a la zona de ao (negativa = dentro) y dirección horizontal «de la zona hacia el punto»
function distZona(ao, zona, p) {
  if (zona.forma === 'cabeza') {
    const c = ao.punto('cabeza'), v = p.clone().sub(c); return { d: v.length() - 0.19, v, c };
  }
  const j = ao.j.tronco; j.updateWorldMatrix(true, false);
  const q = j.worldToLocal(p.clone());
  const qy = Math.min(0.38, Math.max(-0.05, q.y)), ex = q.x / 0.155, ez = q.z / 0.125, r = Math.hypot(ex, ez);
  const d = (r - 1) * 0.125 + (Math.abs(q.y - qy) > 0 ? Math.abs(q.y - qy) : 0);
  const c = V3(0, qy, 0).applyMatrix4(j.matrixWorld); return { d, v: p.clone().sub(c), c, q };
}

// Mueve `ao` (rígido, en el suelo) para que la técnica de `aka` termine a `hueco` m de su cuerpo. Llámalo después de aplicarPose a los dos y antes de dibujar.
export function alinearRival(aka, ao, tecnica, { hueco = 0.03, pose = null } = {}) {
  const Z = ZONAS[tecnica]; if (!Z) throw new Error('técnica sin zona: ' + tecnica);
  const a = aka.base.rumbo * D2R, fw = V3(Math.sin(a), 0, Math.cos(a)), lat = V3(Math.cos(a), 0, -Math.sin(a));
  const muestras = () => (Z.mano ? [[aka.punto('manoD'), 0.05]] : [[aka.punto('tobilloD'), 0.05], [aka.punto('puntaD'), 0.04], [aka.punto('talonD'), 0.045],
    [aka.punto('tobilloD').lerp(aka.punto('puntaD'), 0.5), 0.045]]);
  const puesta = (dx, dz) => { const b = ao.base; ao.colocar(b.x + dx, b.z + dz, b.rumbo); if (pose) ao.aplicarPose(pose); else if (ao.pose) ao.aplicarPose(ao.pose); };
  // 1. punto de partida: centro de la zona al lado/delante de la muestra principal
  const F = muestras()[0][0], R = Z.forma === 'cabeza' ? ao.punto('cabeza') : ao.punto('cadera');
  const obj = F.clone().addScaledVector(lat, Z.ini[0]).addScaledVector(fw, Z.ini[1]);
  puesta(obj.x - R.x, obj.z - R.z);
  // 2. refinamiento: desplaza a ao en horizontal hasta que la muestra más cercana quede a `hueco`
  let mejor = null;
  for (let it = 0; it < 60; it++) {
    mejor = null;
    for (const [p, g] of muestras()) { const r = distZona(ao, Z, p); r.d -= g; if (!mejor || r.d < mejor.d) mejor = r; }
    const e = mejor.d - hueco; if (Math.abs(e) < 0.0005) break;
    const h = V3(mejor.v.x, 0, mejor.v.z); if (h.lengthSq() < 1e-8) break; h.normalize();
    puesta(h.x * e * 0.8, h.z * e * 0.8);
  }
  let normal = 1;
  if (Z.normal && mejor.q) { const n = V3(...Z.normal), v = mejor.q.clone(); v.y = 0; normal = v.lengthSq() ? v.normalize().dot(n) : 0; }
  alinearRival.ultimo = { zona: tecnica, normal: +normal.toFixed(2) };
  return +mejor.d.toFixed(3);
}

// ======================================================================
// Técnica completa en 1,2 s (v2, 2026-11-24): prep 0,4 · golpe 0,3 · pausa 0,3 · vuelta a kamae 0,2.
// const X = crearTecnica(par, P, 'mawashi-geri-chudan');  →  en render:  X.poner(t)  (t en s desde el inicio de la técnica, 0…X.dur)
// El impacto cae en t = X.impacto (0,7 s). Los dos empiezan en kamae; aka entra `avance` m durante la prep y ao no se mueve.
// Cámara recomendada en X.camara (pasa a esc.orbita con centro sumado a par.centro()).
// ======================================================================
export const TIEMPOS = { prep: 0.4, golpe: 0.3, pausa: 0.3, vuelta: 0.2, impacto: 0.7, total: 1.2 };
export const TECNICAS = {
  'mawashi-geri-chudan': { prep: 'mawashi-geri-prep', golpe: 'mawashi-geri-chudan', zona: 'mawashi-geri-chudan', ao: 'kamae', rumboAo: 180, camara: { azimut: -90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.05, 0] } },
  'mawashi-geri-espalda': { prep: 'mawashi-geri-prep', golpe: 'mawashi-geri-chudan', zona: 'mawashi-geri-espalda', ao: 'ao-de-espaldas', rumboAo: 65, camara: { azimut: -90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.05, 0] } },
  'mawashi-geri-jodan': { prep: 'mawashi-geri-prep', golpe: 'mawashi-geri-jodan', zona: 'mawashi-geri-jodan', ao: 'kamae', rumboAo: 180, camara: { azimut: -90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.15, 0] } },
  'mae-geri-chudan': { prep: 'mae-geri-prep', golpe: 'mae-geri-chudan', zona: 'mae-geri-chudan', ao: 'ao-guardia-alta', rumboAo: 180, camara: { azimut: -90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.05, 0] } },
  'gyaku-zuki-chudan': { prep: 'gyaku-zuki-hanmi', golpe: 'gyaku-zuki-kiai', zona: 'gyaku-zuki-chudan', ao: 'ao-guardia-alta', rumboAo: 180, cadena: true, camara: { azimut: 90, distancia: 10.5, elevacion: 3, fov: 26, centro: [0, 1.05, 0] } }
};
export function crearTecnica(par, P, nombre, o = {}) {
  const T = TECNICAS[nombre]; if (!T) throw new Error('técnica desconocida: ' + nombre);
  const { aka, ao } = par, avance = o.avance ?? 0.4, cl = (x) => Math.min(1, Math.max(0, x));
  const eio = (x) => { x = cl(x); return x * x * (3 - 2 * x); }, eo = (x) => 1 - (1 - cl(x)) ** 3;
  const b0 = { x: aka.base.x, z: aka.base.z, r: aka.base.rumbo };
  const fw = V3(Math.sin(b0.r * D2R), 0, Math.cos(b0.r * D2R));
  aka.colocar(b0.x, b0.z, b0.r); aka.aplicarPose(P.kamae);
  const t0 = aka.punto('tobilloI'), ancla0 = { pie: 'I', x: t0.x, z: t0.z };
  // posición final de ao: con la pose de golpe y el pie de apoyo anclado
  aka.aplicarPose(P[T.golpe], { ancla: ancla0 });
  ao.colocar(ao.base.x, ao.base.z, o.rumboAo ?? T.rumboAo); ao.aplicarPose(P[T.ao]);
  par.alinear(T.zona, { hueco: o.hueco ?? 0.03 });
  const contacto = par.contacto, fin = { x: ao.base.x, z: ao.base.z, r: ao.base.rumbo };
  const golpe = (f) => (T.cadena
    ? mezclarCadena(P[T.prep], P[T.golpe], { piernas: eo(f), cadera: eo(f * 1.4), tronco: eo(f * 1.3 - 0.1), hombro: eo(f * 1.4 - 0.2), codo: eo(f * 1.5 - 0.3), mano: eo(f * 2 - 1) })
    : mezclar(P[T.prep], P[T.golpe], eo(f)));
  return {
    dur: TIEMPOS.total, impacto: TIEMPOS.impacto, camara: T.camara, contacto, fin,
    pose(t) {
      if (t < TIEMPOS.prep) return mezclar(P.kamae, P[T.prep], eio(t / TIEMPOS.prep));
      if (t < TIEMPOS.prep + TIEMPOS.golpe) return golpe((t - TIEMPOS.prep) / TIEMPOS.golpe);
      if (t < TIEMPOS.prep + TIEMPOS.golpe + TIEMPOS.pausa) return P[T.golpe];
      return mezclar(P[T.golpe], P.kamae, eio((t - 1.0) / TIEMPOS.vuelta));
    },
    poner(t) {
      const e = 1 - eio(t / 0.6);                    // 1 al inicio → 0 a los 0,6 s (aka entra casi hasta el golpe)
      aka.colocar(b0.x, b0.z, b0.r);
      aka.aplicarPose(this.pose(t), { ancla: { pie: 'I', x: ancla0.x - fw.x * avance * e, z: ancla0.z - fw.z * avance * e } });
      ao.colocar(fin.x, fin.z, fin.r); ao.aplicarPose(P[T.ao]);
      return this;
    }
  };
}

// ======================================================================
// Tatami con área de combate (8 × 8 m) y zona de seguridad (jōgai = fuera del área), líneas y marcas de salida.
// Pinta una lámina sobre el tatami del escenario (crearEscenario({ suelo: 'tatami' })).
// crearAreaWKF(esc, { lado: 8, seguridad: 2 }) → { raiz, ocultar() }
// Las medidas de dibujo siguen el área de competición; no se muestran cifras en pantalla.
// ======================================================================
export function crearAreaWKF(esc, o = {}) {
  o = Object.assign({ lado: 8, seguridad: 2, centro: [0, 0] }, o);
  const S = 1024, c = lienzo(S, S), g = c.getContext('2d'), tot = o.lado + 2 * o.seguridad, m = S / tot;
  g.clearRect(0, 0, S, S);
  g.fillStyle = 'rgba(60,40,20,0.18)'; g.fillRect(0, 0, S, S);                 // zona de seguridad algo más oscura
  g.clearRect(o.seguridad * m, o.seguridad * m, o.lado * m, o.lado * m);       // el área queda con el tatami limpio
  g.strokeStyle = '#F4EFE6'; g.lineWidth = 0.1 * m; g.strokeRect(o.seguridad * m, o.seguridad * m, o.lado * m, o.lado * m); // línea del área (jōgai al cruzarla)
  // marcas de inicio: dos barras cortas a 2 m una de la otra (rojo aka / azul ao), decorativas
  const cx = S / 2, cy = S / 2, ln = 0.5 * m;
  g.fillStyle = CINTURON_AKA; g.fillRect(cx - ln / 2, cy - 1.0 * m - 0.04 * m, ln, 0.08 * m);
  g.fillStyle = CINTURON_AO; g.fillRect(cx - ln / 2, cy + 1.0 * m - 0.04 * m, ln, 0.08 * m);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const plano = new THREE.Mesh(new THREE.PlaneGeometry(tot, tot), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, depthWrite: false }));
  plano.rotation.x = -Math.PI / 2; plano.position.set(o.centro[0], 0.006, o.centro[1]); plano.receiveShadow = true; plano.renderOrder = 1;
  const raiz = new THREE.Group(); raiz.add(plano); esc.escena.add(raiz);
  return { raiz, plano, ocultar() { raiz.visible = false; }, mostrar() { raiz.visible = true; } };
}
