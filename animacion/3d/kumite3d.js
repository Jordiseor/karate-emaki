// KARATE EMAKI · biblioteca 3D de kumite WKF (pieza 2026-11-16-kumite-puntos):
// pareja aka (cinturón rojo) / ao (cinturón azul), alineación del rival para patadas con control, tatami con área y jōgai.
// El rojo del cinturón aka es el de reglamento (permitido aquí); el rojo de marca #C8102E sigue siendo solo para golpes/datos.
import * as THREE from './lib/three.module.min.js';
import { Karateka3D, CINTURONES } from './karateka3d.js';

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
    // pone `ao` donde le toca a la patada de `aka` (ya con su pose aplicada): el pie se detiene a `hueco` m de la zona
    // tecnica: 'mawashi-geri-jodan' (cabeza) | 'mae-geri-chudan' (pecho). La pose de ao debe estar ya aplicada (kumite-esquiva / kamae).
    alinear(tecnica, { hueco = 0.05, pose = null } = {}) { return alinearRival(aka, ao, tecnica, { hueco, pose }); }
  };
  return par.colocar(o.distancia);
}

// Mueve `ao` (rígido, en el suelo) para que la patada de `aka` termine a `hueco` m de su cabeza (jōdan) o pecho (chūdan).
// Devuelve la distancia final entre el tobillo de aka y la zona. Llámalo después de aplicarPose a los dos y antes de dibujar.
export function alinearRival(aka, ao, tecnica, { hueco = 0.05, pose = null } = {}) {
  const jodan = /jodan/.test(tecnica);
  const F = aka.punto('tobilloD'), ref = () => (jodan ? ao.punto('cabeza') : ao.punto('pecho'));
  // aka: marco local (x lateral, z hacia delante)
  const a = aka.base.rumbo * D2R, fw = V3(Math.sin(a), 0, Math.cos(a)), lat = V3(Math.cos(a), 0, -Math.sin(a));
  // desplazamiento deseado de la zona respecto del tobillo: jōdan → al lado (+x local) ≈ radio de cabeza + pie; chūdan → delante
  const off = jodan ? { x: 0.15 + hueco, z: 0.02 } : { x: 0.0, z: 0.14 + hueco + 0.0 };
  const obj = F.clone().addScaledVector(lat, off.x).addScaledVector(fw, off.z);
  const R = ref();
  const b = ao.base; ao.colocar(b.x + (obj.x - R.x), b.z + (obj.z - R.z), b.rumbo);
  if (pose) ao.aplicarPose(pose); else if (ao.pose) ao.aplicarPose(ao.pose);
  return +ref().distanceTo(obj).toFixed(3);
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
