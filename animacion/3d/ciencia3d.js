// KARATE EMAKI · objetos 3D de la pieza «tiempo de contacto» (física del golpe).
//   crearAlmohadilla()  almohadilla de golpeo sobre pie, con hundimiento 0..1, retroceso y balanceo
//   crearChoque()       pared + cojín tipo airbag (o sin cojín) + maniquí-silueta que se acerca y frena
// Mismo universo de juguete que karateka3d.js (materiales mate, formas redondeadas). Todo determinista: solo depende de lo que se pasa.
// Poses de la pieza: P['empuje-recto'], P['encoge-hombros'] (poses/*.json, herramientas/disenar-poses-2026-11-18.mjs).
import { THREE, Karateka3D } from './karateka3d.js';

const D2R = Math.PI / 180;
const mat = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough });
const sombrear = (g) => g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
function rectRedondeado(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h + 0); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
function acolchado(w, h, prof, r, bisel, material) { // caja con bordes redondeados y bisel: «almohadilla»
  const g = new THREE.ExtrudeGeometry(rectRedondeado(w - 2 * bisel, h - 2 * bisel, r), { depth: prof - 2 * bisel, bevelEnabled: true, bevelThickness: bisel, bevelSize: bisel, bevelSegments: 5, curveSegments: 10 });
  g.translate(0, 0, bisel); return new THREE.Mesh(g, material);
}

// ---------- almohadilla ----------
// o: { altura: 1.1 (centro de la cara, m), ancho: 0.36, alto: 0.52, prof: 0.16, color: '#3A3834', cara: '#E4D9C2' }
// Local: +Z = hacia quien golpea (rumbo 0 mira a +Z, igual que el karateka). Origen en el suelo, bajo la almohadilla.
export function crearAlmohadilla(o = {}) {
  const alt = o.altura ?? 1.1, W = o.ancho ?? 0.36, Hh = o.alto ?? 0.52, Pf = o.prof ?? 0.16;
  const raiz = new THREE.Group(), cuerpo = new THREE.Group(); raiz.add(cuerpo);
  // pie: disco lastrado, mástil y brazo de soporte
  const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.37, 0.07, 36), mat('#4A4640', 0.9)); pie.position.y = 0.035; raiz.add(pie);
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, alt, 18), mat('#6B655C', 0.6)); mastil.position.set(0, alt / 2, -0.1); raiz.add(mastil);
  const placa = new THREE.Mesh(new THREE.BoxGeometry(W * 0.5, Hh * 0.55, 0.03), mat('#6B655C', 0.6)); placa.position.set(0, alt, -0.065); raiz.add(placa);
  // acolchado: el origen del cuerpo está en la placa (z = -0.05); la cara mira a +Z
  cuerpo.position.set(0, alt, -0.05);
  const bodyMat = mat(o.color || '#3A3834', 0.85), caraMat = mat(o.cara || '#E4D9C2', 0.8);
  const body = acolchado(W, Hh, Pf, 0.07, 0.035, bodyMat); body.position.z = 0; cuerpo.add(body);
  const marco = acolchado(W * 0.7, Hh * 0.72, Pf * 1.06, 0.05, 0.03, caraMat); marco.position.z = -Pf * 0.03; cuerpo.add(marco);
  sombrear(raiz);
  const A = { raiz, ancho: W, alto: Hh, prof: Pf, altura: alt, _h: 0, _d: 0, _cab: 0, _rumbo: 0 };
  // hundimiento 0..1: la cara cede (hasta el 62 % del grosor) y el acolchado se ensancha un poco hacia los lados
  A.hundir = (p) => {
    p = Math.max(0, Math.min(1, p)); A._h = p;
    cuerpo.scale.set(1 + 0.16 * p, 1 + 0.1 * p, 1 - 0.62 * p); return A;
  };
  // retroceso (m, hacia atrás) de toda la almohadilla sobre su mástil; cabeceo en grados (la cara sube hacia arriba)
  A.mover = (d, cabeceo = 0) => { A._d = d; A._cab = cabeceo; cuerpo.position.z = -0.05 - d; cuerpo.rotation.x = -cabeceo * D2R; return A; };
  A.colocar = (x, z, rumbo = 0) => { A._rumbo = rumbo; raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; raiz.updateMatrixWorld(true); return A; };
  // centro de la cara de golpeo en el mundo (con hundimiento y retroceso aplicados)
  A.cara = () => { raiz.updateMatrixWorld(true); return new THREE.Vector3(0, alt, -0.05 - A._d + Pf * (1 - 0.62 * A._h) + 0.01).applyMatrix4(raiz.matrixWorld); };
  // Coloca la almohadilla para que su cara toque el punto `p` (Vector3, o un karateka y el nombre del punto: A.pegarA(k, 'manoD')).
  // Respeta el rumbo y la altura; llámalo DESPUÉS de hundir()/mover() y de aplicar la pose.
  A.pegarA = (p, nombre) => {
    const pt = nombre ? p.punto(nombre) : p, r = A._rumbo * D2R;
    const fz = -0.05 - A._d + Pf * (1 - 0.62 * A._h) + 0.01; // z local de la cara
    raiz.position.set(pt.x - Math.sin(r) * fz, 0, pt.z - Math.cos(r) * fz); raiz.updateMatrixWorld(true); return A;
  };
  A.alfa = (a) => { raiz.traverse((m) => { if (m.isMesh) { m.material.transparent = a < 1; m.material.opacity = a; } }); return A; };
  A.visible = (v) => { raiz.visible = v; return A; };
  return A;
}

// ---------- pared + cojín tipo airbag + maniquí ----------
// crearChoque(esc, P, { cojin: true, xPared: 2.2, ancho: 3.4 }) añade todo a esc.escena.
// El maniquí viene por −X hacia la pared (rumbo 90: mira a la derecha de la pantalla con la cámara en azimut 0).
// Mitad A: cojín (cojin: true) · Mitad B: pared desnuda (cojin: false o ch.cojinVisible(false)).
export function crearChoque(esc, P, o = {}) {
  const X = o.xPared ?? 2.2, Wp = o.ancho ?? 3.6, Hp = 2.7, PROF = o.prof ?? 0.55;
  if (esc.escena.fog) { esc.escena.fog.near = Math.max(esc.escena.fog.near, 24); esc.escena.fog.far = Math.max(esc.escena.fog.far, 80); } // sin niebla en la pared
  const raiz = new THREE.Group(); esc.escena.add(raiz);
  // pared (cara frontal en x = X) y zócalo
  const pared = new THREE.Group(); pared.position.x = X; raiz.add(pared);
  const muro = new THREE.Mesh(new THREE.BoxGeometry(0.3, Hp, Wp), mat(o.pared || '#C9BFAB', 0.95)); muro.position.set(0.15, Hp / 2, 0); pared.add(muro);
  const zocalo = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, Wp + 0.02), mat('#5A5249', 0.9)); zocalo.position.set(0.15, 0.08, 0); pared.add(zocalo);
  // cojín: almohada hinchada con costuras. Grupo cuyo origen es la pared y el frente es −X (local +Z → −X)
  const cojin = new THREE.Group(); cojin.position.x = X; cojin.rotation.y = -Math.PI / 2; raiz.add(cojin);
  const cuerpo = new THREE.Group(); cojin.add(cuerpo);
  const HZ = PROF * 0.84, ZC = PROF - HZ; // semiprofundidad y centro de la bolsa: el frente queda en z = PROF y la mitad trasera se esconde en la pared
  const bolsa = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 28), mat(o.colorCojin || '#EFEBE2', 0.7));
  bolsa.scale.set(0.8, 0.78, HZ); bolsa.position.set(0, 1.2, ZC); cuerpo.add(bolsa);
  // costuras: dos aros sobre la cara delantera (siguen la curva del elipsoide) para que se lea «cojín»
  for (const q of [0.55, 0.22]) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 72), mat('#8A847A', 0.9));
    t.scale.set(0.8 * q, 0.78 * q, 1); t.position.set(0, 1.2, ZC + HZ * Math.sqrt(1 - q * q) + 0.004); cuerpo.add(t);
  }
  sombrear(raiz);
  const maniqui = new Karateka3D({ cinturon: 'negro' }); maniqui.silueta('#1A1A1A'); esc.escena.add(maniqui.raiz);
  const CH = { raiz, pared, cojin: { grupo: cojin, hundimiento: 0 }, maniqui, xPared: X, prof: PROF, conCojin: o.cojin !== false };
  CH.cojinVisible = (v) => { cojin.visible = v; CH.conCojin = v; return CH; };
  CH.cojinVisible(CH.conCojin);
  // x de la cara delantera del cojín (o de la pared si no hay) con hundimiento h 0..1
  CH.caraX = (h = 0) => (CH.conCojin ? X - PROF * (1 - 0.55 * h) : X);
  CH.hundir = (h) => { h = Math.max(0, Math.min(1, h)); CH.cojin.hundimiento = h; cuerpo.scale.set(1 + 0.12 * h, 1 + 0.1 * h, 1 - 0.55 * h); return CH; };
  // Maniquí a `distancia` m del contacto (0 = el pecho toca la cara del cojín/pared); hund = hundimiento del cojín.
  // inclina: grados hacia delante. Con distancia > 0 llega con la pose neutra algo inclinada; no cambia la pose del maniquí si pasas `pose`.
  CH.poner = ({ distancia = 0, hund = 0, inclina = 8, pose = P.neutra } = {}) => {
    CH.hundir(hund);
    maniqui.colocar(0, 0, 90).aplicarPose(pose, { inclinar: inclina });
    const dx = maniqui.punto('pecho').x;
    maniqui.colocar(CH.caraX(hund) - distancia - dx, 0, 90).aplicarPose(pose, { inclinar: inclina });
    return CH;
  };
  CH.ocultarManiqui = (v = false) => { maniqui.raiz.visible = v; return CH; };
  return CH;
}
