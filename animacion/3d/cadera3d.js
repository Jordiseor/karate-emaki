// KARATE EMAKI · cadena cinética (pieza «la cadera no es un adorno»): marcadores de la cadena, marca fantasma y gráfica de picos escalonados.
// Reutiliza karateka3d.js (pose 'gyaku-zuki-hanmi', mezclarCadena, k.punto('caderaI'/'caderaD')). Determinista: nada de reloj ni azar.
//   import * as CD from '.../cadera3d.js'
//   const cadena = CD.crearCadena(esc, k);            // 5 esferas: cadera, pecho, hombroD, codoD, manoD
//   cadena.actualizar([0,0,0,0,0], { estela: { pose: (tt) => pose, t, dur: 0.3 } });   // estados 0 = apagado (tinta) … 1 = pico (rojo)
//   const fan = CD.crearFantasma(esc);  fan.poner(k.punto('manoD'), 1);   // marca gris discontinua quieta
//   CD.picos(ctx, caja, { prog, t, instantes, activo })   // 2D: cuatro curvas con el pico desplazado
import * as THREE from './lib/three.module.min.js';
import { COL } from './ciencia2d.js';

const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const PUNTOS_CADENA = ['cadera', 'pecho', 'hombroD', 'codoD', 'manoD'];
const mat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
const col = (f) => new THREE.Color(COL.tinta).lerp(new THREE.Color(COL.rojo), cl(f));

// Cinco esferas que siguen k.punto(...). Llamar a actualizar() DESPUÉS de k.aplicarPose y antes de esc.dibujar.
// estados[i] 0..1 (0 apagado tinta, 1 en su pico rojo y algo mayor). o: { radio: 0.055, puntos }
// estela: { pose: (tt) => pose en el instante tt, t (instante actual), dur: 0.3 s, n: 6 } → n copias que se desvanecen detrás (re-aplica la pose y la restaura).
export function crearCadena(esc, k, o = {}) {
  const puntos = o.puntos || PUNTOS_CADENA, radio = o.radio ?? 0.055, g = new THREE.Group(); g.name = 'cadena'; esc.escena.add(g);
  const geo = new THREE.SphereGeometry(1, 20, 14);
  const bolas = puntos.map(() => { const m = new THREE.Mesh(geo, mat(COL.tinta)); m.renderOrder = 30; g.add(m); return m; });
  const rastro = puntos.map(() => Array.from({ length: 10 }, () => { const m = new THREE.Mesh(geo, mat(COL.rojo, 0)); m.renderOrder = 29; g.add(m); return m; }));
  return {
    raiz: g, puntos,
    actualizar(estados = [], op = {}) {
      const e = op.estela, pos = puntos.map((p) => k.punto(p).clone());
      let hist = null;
      if (e && e.pose) {
        const n = Math.min(10, e.n ?? 6), dur = e.dur ?? 0.3; hist = [];
        for (let s = 1; s <= n; s++) { k.aplicarPose(e.pose(e.t - dur * s / n), e.op || {}); hist.push(puntos.map((p) => k.punto(p).clone())); }
        k.aplicarPose(e.pose(e.t), e.op || {});
      }
      puntos.forEach((p, i) => {
        const f = cl(estados[i] ?? 0), m = bolas[i];
        m.position.copy(pos[i]); m.scale.setScalar(radio * (1 + 0.45 * f)); m.material.color.copy(col(f)); m.visible = op.visible !== false;
        rastro[i].forEach((r, s) => {
          const h = hist && hist[s]; r.visible = !!h && f > 0.02 && m.visible;
          if (h) { r.position.copy(h[i]); r.scale.setScalar(radio * (1 - 0.5 * (s + 1) / hist.length)); r.material.opacity = 0.55 * f * (1 - (s + 1) / (hist.length + 1)); }
        });
      });
    },
    ocultar() { g.visible = false; }, mostrar() { g.visible = true; }
  };
}

// Marca fantasma: esfera gris translúcida + aro discontinuo (quieta donde se la ponga). fan.poner(vector3, alfa 0..1, { radio })
export function crearFantasma(esc, o = {}) {
  const g = new THREE.Group(); g.name = 'fantasma'; esc.escena.add(g);
  const bola = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat(COL.gris, 0.35)); bola.renderOrder = 28;
  const pts = Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.cos(i / 64 * 6.2832), Math.sin(i / 64 * 6.2832), 0));
  const aro = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: COL.gris, dashSize: 0.22, gapSize: 0.16, depthTest: false, transparent: true, fog: false }));
  aro.computeLineDistances(); aro.renderOrder = 28; g.add(bola, aro); g.visible = false;
  return {
    raiz: g,
    // el aro mira a la cámara
    poner(p, alfa = 1, op = {}) {
      g.visible = alfa > 0.01; g.position.copy(p); g.scale.setScalar(op.radio ?? o.radio ?? 0.09);
      bola.material.opacity = 0.35 * alfa; aro.material.opacity = alfa; aro.quaternion.copy(esc.camara.quaternion);
    }
  };
}

// ---------- 2D: gráfica de picos escalonados (velocidad frente a tiempo) ----------
// caja {x,y,w,h}. Cuatro curvas (cadera, tronco, hombro, codo/mano) en forma de campana con el pico desplazado a la derecha.
// o: { prog: 1 (se traza), t: 0..1 (cursor vertical, opcional), activo: i (curva resaltada en rojo; -1 ninguna; 'todas'), picos: [0.2,0.4,0.6,0.8] (posición x 0..1),
//      alturas: [0.55,0.7,0.85,1], ancho: 0.11, etiquetas: ['cadera','tronco','hombro','puño'], alfa, grosor: 9, marcas: true (punto en cada pico) }
// Las curvas ya pasadas del pico se pintan en tinta; la activa (o la del pico en t) en rojo. Devuelve las x de los picos.
export function picos(ctx, caja, o = {}) {
  const P = o.picos || [0.2, 0.4, 0.6, 0.8], A = o.alturas || [0.55, 0.7, 0.85, 1], w = o.ancho ?? 0.11, p = cl(o.prog ?? 1), n = P.length;
  const et = o.etiquetas || ['cadera', 'tronco', 'hombro', 'puño'];
  const grises = [COL.gris, '#6B665E', COL.azul, COL.tinta];
  const y0 = caja.y + caja.h, xs = [];
  ctx.save(); ctx.globalAlpha *= o.alfa ?? 1; ctx.lineJoin = ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const rojo = o.activo === 'todas' || o.activo === i || (o.activo === undefined && o.t != null && Math.abs(o.t - P[i]) < w * 0.9);
    const c = rojo ? COL.rojo : grises[i % 4];
    ctx.beginPath(); let ini = true;
    for (let s = 0; s <= 80; s++) {
      const u = s / 80; if (u > p) break;
      const y = A[i] * Math.exp(-0.5 * ((u - P[i]) / w) ** 2);
      const X = caja.x + u * caja.w, Y = y0 - y * caja.h * 0.92;
      if (ini) { ctx.moveTo(X, Y); ini = false; } else ctx.lineTo(X, Y);
    }
    ctx.lineWidth = o.grosor ?? 9; ctx.strokeStyle = c; ctx.stroke();
    xs.push(caja.x + P[i] * caja.w);
    if (o.marcas !== false && p >= P[i]) { ctx.beginPath(); ctx.arc(caja.x + P[i] * caja.w, y0 - A[i] * caja.h * 0.92, rojo ? 15 : 10, 0, 6.2832); ctx.fillStyle = c; ctx.fill(); }
  }
  if (o.t != null) { ctx.setLineDash([14, 12]); ctx.lineWidth = 4; ctx.strokeStyle = COL.gris; const X = caja.x + cl(o.t) * caja.w; ctx.beginPath(); ctx.moveTo(X, caja.y); ctx.lineTo(X, y0); ctx.stroke(); ctx.setLineDash([]); }
  if (o.etiquetas !== false) {
    ctx.font = `700 48px ${window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, sans-serif'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = COL.tinta;
    for (let i = 0; i < n; i++) if (p >= P[i]) ctx.fillText(et[i] || '', caja.x + P[i] * caja.w, y0 - A[i] * caja.h * 0.92 - 28);
  }
  ctx.restore();
  return xs;
}
