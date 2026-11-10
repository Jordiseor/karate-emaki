// KARATE EMAKI · diagramas 3D de física sobre el karateka (rojo de marca #C8102E).
// Centro de masas (esfera roja + vertical discontinua hasta el suelo), barra de la base de apoyo, arcos de ángulo
// con cifra, flechas de empuje. Todo determinista: cada fotograma llamas a limpiar() y vuelves a pedir lo que quieras ver.
//
//   const d = new Diagrama3D(esc, k);
//   window.render = (t) => {
//     k.aplicarPose(P['zenkutsu-dachi'], { inclinar: 10 });
//     d.limpiar();
//     d.cdm();                                   // punto rojo + vertical
//     d.base({ alerta: 0 });                     // barra en el suelo (talón trasero → punta delantera)
//     d.arco({ centro: d.pivote(), hasta: d.centroMasas(), texto: '26°' });
//     d.flecha({ desde: [-0.9, 1.2, 0], hacia: [-0.25, 1.2, 0] });
//     esc.dibujar(ctx);
//     d.dibujar2D(ctx);                          // cifras de los arcos (texto de marca, ≥ 48 px)
//   };
import * as THREE from './lib/three.module.min.js';

const D2R = Math.PI / 180;
export const ROJO = '#C8102E', TINTA = '#1A1A1A', GRIS = '#8A847A';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const aV = (p) => (p && p.isVector3 ? p.clone() : Array.isArray(p) ? V3(p[0], p[1], p[2]) : V3(0, 0, 0));
const mezclarColor = (a, b, f) => new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, f)));

// Puntos de la planta en el marco del tobillo (igual que karateka3d.js): talón, punta, borde izq./der. del antepié
const PLANTA = { talon: V3(0, -0.075, -0.058), punta: V3(0, -0.075, 0.185), izq: V3(0.045, -0.075, 0.09), der: V3(-0.045, -0.075, 0.09) };

export class Diagrama3D {
  // o: { encima: true (se dibuja por encima del cuerpo; el CdM está DENTRO del tronco), escala: 1 (grosores) }
  constructor(esc, k, o = {}) {
    this.esc = esc; this.k = k; this.o = Object.assign({ encima: true, escala: 1 }, o);
    this.g = new THREE.Group(); this.g.name = 'diagrama3d'; esc.escena.add(this.g);
    this.pool = {}; this.uso = {}; this.textos = [];
    this.ajuste = { delante: 0, arriba: 0 }; // desplazamiento del CdM en el marco del cuerpo (m); ver ajustarVuelco()
  }
  // CdM del personaje + ajuste (el ajuste gira con el cuerpo si se inclina).
  centroMasas() {
    const c = this.k.centroMasas(), a = this.ajuste;
    if (!a.delante && !a.arriba) return c;
    return c.add(V3(0, a.arriba, a.delante).applyQuaternion(this.k.raiz.quaternion));
  }
  // Desplaza el CdM hacia delante/atrás para que el ángulo de vuelco hacia delante de la pose ACTUAL (sin inclinar) sea 'grados'.
  // Sirve para cuadrar el dibujo con la cifra verificada del dosier (p. ej. 26° con reparto de peso 60/40). Devuelve el desplazamiento (m).
  // ajustarVuelco(null) quita el ajuste.
  ajustarVuelco(grados) {
    this.ajuste = { delante: 0, arriba: 0 };
    if (grados == null) return 0;
    const k = this.k, c = k.centroMasas(), b = this.medirBase('frente');
    const rumbo = k.base.rumbo * D2R, fw = V3(Math.sin(rumbo), 0, Math.cos(rumbo));
    const dist = Math.tan(grados * D2R) * c.y;
    this.ajuste.delante = (b.hasta.dot(fw) - c.dot(fw)) - dist;
    return this.ajuste.delante;
  }

  // ---------- gestión de piezas reutilizables ----------
  _mat(color, encima = this.o.encima) {
    return new THREE.MeshBasicMaterial({ color, transparent: true, depthTest: !encima, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide });
  }
  _pieza(tipo, crear) {
    const lista = (this.pool[tipo] = this.pool[tipo] || []), i = (this.uso[tipo] = (this.uso[tipo] || 0));
    this.uso[tipo]++;
    if (!lista[i]) { const m = crear(); m.renderOrder = 20; this.g.add(m); lista[i] = m; }
    const m = lista[i]; m.visible = true; return m;
  }
  // Oculta todo lo del fotograma anterior. Llamar al principio de cada render(t).
  limpiar() {
    for (const t in this.pool) for (const m of this.pool[t]) m.visible = false;
    this.uso = {}; this.textos = []; return this;
  }

  // ---------- primitivas ----------
  // cilindro de a a b (radio r)
  _barra(tipo, a, b, r, color, alfa, encima) {
    const m = this._pieza(tipo, () => new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1), this._mat(color, encima)));
    const d = b.clone().sub(a), L = d.length();
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(V3(0, 1, 0), L > 1e-9 ? d.clone().normalize() : V3(0, 1, 0));
    m.scale.set(r, Math.max(L, 1e-4), r);
    m.material.color.set(color); m.material.opacity = alfa; m.material.depthTest = !encima;
    return m;
  }
  _esfera(tipo, c, r, color, alfa, encima) {
    const m = this._pieza(tipo, () => new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), this._mat(color, encima)));
    m.position.copy(c); m.scale.setScalar(r); m.material.color.set(color); m.material.opacity = alfa; m.material.depthTest = !encima;
    return m;
  }
  // Línea discontinua de a a b: trazos de largo 'trazo' y hueco 'hueco' (m)
  linea(a, b, o = {}) {
    a = aV(a); b = aV(b);
    const r = (o.grosor || 0.011) * this.o.escala, color = o.color || ROJO, alfa = o.alfa ?? 1, enc = o.encima ?? this.o.encima;
    if (!o.discontinua) { this._barra('lin', a, b, r, color, alfa, enc); return this; }
    const d = b.clone().sub(a), L = d.length(), tr = o.trazo || 0.06, hu = o.hueco || 0.04; d.normalize();
    for (let s = 0; s < L; s += tr + hu) this._barra('lin', a.clone().addScaledVector(d, s), a.clone().addScaledVector(d, Math.min(L, s + tr)), r, color, alfa, enc);
    return this;
  }

  // ---------- centro de masas ----------
  // Esfera roja en el CdM del personaje y vertical discontinua hasta el suelo (con una marca en el suelo).
  // o: { alfa: 1, radio: 0.045, vertical: true, color, punto: Vector3 (otro punto en vez del CdM calculado) }
  cdm(o = {}) {
    const c = o.punto ? aV(o.punto) : this.centroMasas(), alfa = o.alfa ?? 1, color = o.color || ROJO, enc = o.encima ?? true;
    if (alfa <= 0) return c;
    this._esfera('cdm', c, (o.radio || 0.045) * this.o.escala, color, alfa, enc);
    // aro blanco fino para que destaque sobre el gi
    this._esfera('cdmAro', c, (o.radio || 0.045) * 1.28 * this.o.escala, '#FFFFFF', alfa * 0.9, enc).renderOrder = 19;
    if (o.vertical !== false) {
      const suelo = V3(c.x, 0.004, c.z);
      this.linea(c, suelo, { discontinua: true, color, alfa, encima: enc, grosor: o.grosor });
      // marca en el suelo: disco plano
      const m = this._pieza('marcaSuelo', () => new THREE.Mesh(new THREE.CircleGeometry(1, 32), this._mat(color, enc)));
      m.position.set(c.x, 0.006, c.z); m.rotation.set(-Math.PI / 2, 0, 0); m.scale.setScalar(0.028 * this.o.escala);
      m.material.color.set(color); m.material.opacity = alfa; m.material.depthTest = !enc;
    }
    return c;
  }

  // ---------- base de apoyo ----------
  // Extremos de la base medidos en el suelo con la pose SIN inclinar (aunque luego el cuerpo se incline, la base no se mueve).
  // eje: 'frente' (delante-atrás: talón trasero → punta delantera) o 'lado' (borde exterior de un pie → del otro).
  medirBase(eje = 'frente') {
    const k = this.k, ap = k._apoyo || k.apoyo();
    const rumbo = k.base.rumbo * D2R, fw = V3(Math.sin(rumbo), 0, Math.cos(rumbo)), izq = V3(Math.cos(rumbo), 0, -Math.sin(rumbo));
    const dirE = eje === 'lado' ? izq : fw, otra = eje === 'lado' ? fw : izq;
    let min = null, max = null;
    for (const p of ap) { const s = p.dot(dirE); if (!min || s < min.s) min = { s, p }; if (!max || s > max.s) max = { s, p }; }
    const centroOtra = ap.reduce((s, p) => s + p.dot(otra), 0) / ap.length;
    const pt = (s) => dirE.clone().multiplyScalar(s).addScaledVector(otra, centroOtra).setY(0);
    return { desde: pt(min.s), hasta: pt(max.s), largo: max.s - min.s, eje };
  }
  // Barra en el suelo entre talón trasero y punta delantera (o en lateral). o: { eje, alerta: 0..1 (tinta → rojo),
  //   color, alfa, grosor (m, ancho de la barra), desde/hasta (Vector3 para fijarla a mano), crecer: 0..1 (animación de aparición) }
  base(o = {}) {
    const b = o.desde ? { desde: aV(o.desde), hasta: aV(o.hasta) } : this.medirBase(o.eje);
    const alfa = o.alfa ?? 1; if (alfa <= 0) return b;
    const color = o.color || mezclarColor(TINTA, ROJO, o.alerta || 0).getStyle(), enc = o.encima ?? false;
    const cr = o.crecer ?? 1, mid = b.desde.clone().add(b.hasta).multiplyScalar(0.5);
    const a = mid.clone().lerp(b.desde, cr), z = mid.clone().lerp(b.hasta, cr);
    const y = 0.012, gr = (o.grosor || 0.022) * this.o.escala;
    a.y = z.y = y;
    // banda plana (caja) + topes verticales en los extremos
    const m = this._pieza('base', () => new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this._mat(color, enc)));
    const d = z.clone().sub(a), L = d.length();
    m.position.copy(a).addScaledVector(d, 0.5); m.rotation.set(0, Math.atan2(d.x, d.z), 0); m.scale.set(gr * 2.2, gr * 0.9, Math.max(L, 1e-4));
    m.material.color.set(color); m.material.opacity = alfa; m.material.depthTest = !enc;
    for (const p of [a, z]) this._barra('baseTope', V3(p.x, 0, p.z), V3(p.x, 0.09 * this.o.escala, p.z), gr * 0.55, color, alfa * cr, enc);
    return b;
  }

  // ---------- arco de ángulo ----------
  // Arco en el plano vertical que contiene la dirección de avance del personaje (o el plano que digas).
  // Ángulos en grados medidos DESDE LA VERTICAL; positivos hacia delante (hacia donde mira el personaje).
  // o: { centro: Vector3|[x,y,z] (vértice), desde: 0, angulo: 26  ó  hasta: Vector3 (punto: el arco va de 'desde' a ese punto),
  //      radio: 0.35, texto: '26°' (cifra; '' = sin cifra), lados: true (dibuja los dos radios), relleno: 0.15 (alfa del sector),
  //      color, alfa, plano: 'frente'|'lado' (lado = plano vertical lateral, positivos hacia su izquierda), tamTexto: 72 }
  // Devuelve el ángulo (°) dibujado.
  arco(o = {}) {
    const k = this.k, c = aV(o.centro || this.pivote()), alfa = o.alfa ?? 1, color = o.color || ROJO, enc = o.encima ?? true;
    const rumbo = k.base.rumbo * D2R + (o.plano === 'lado' ? Math.PI / 2 : 0);
    const fw = o.direccion ? aV(o.direccion).setY(0).normalize() : V3(Math.sin(rumbo), 0, Math.cos(rumbo)), up = V3(0, 1, 0);
    const a0 = (o.desde || 0) * D2R;
    let a1;
    if (o.hasta) { const d = aV(o.hasta).sub(c); a1 = Math.atan2(d.dot(fw), d.y); } else a1 = (o.angulo ?? 0) * D2R;
    if (alfa <= 0) return a1 / D2R;
    const R = (o.radio || 0.35) * this.o.escala, dir = (a) => up.clone().multiplyScalar(Math.cos(a)).addScaledVector(fw, Math.sin(a));
    const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / (2 * D2R)));
    const pts = []; for (let i = 0; i <= n; i++) pts.push(c.clone().addScaledVector(dir(a0 + (a1 - a0) * i / n), R));
    const gr = (o.grosor || 0.012) * this.o.escala;
    for (let i = 0; i < n; i++) this._barra('arco', pts[i], pts[i + 1], gr, color, alfa, enc);
    for (const p of pts) this._esfera('arcoNudo', p, gr, color, alfa, enc); // juntas redondas
    if (o.lados !== false) {
      const Lr = R * (o.largoLados || 1.35);
      this.linea(c, c.clone().addScaledVector(dir(a0), Lr), { color, alfa: alfa * 0.9, encima: enc, grosor: gr * 0.7 / this.o.escala, discontinua: true, trazo: 0.04, hueco: 0.03 });
      this.linea(c, c.clone().addScaledVector(dir(a1), Lr), { color, alfa, encima: enc, grosor: gr * 0.8 / this.o.escala });
    }
    if ((o.relleno ?? 0.16) > 0 && Math.abs(a1 - a0) > 1e-4) {
      const m = this._pieza('sector', () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 3 * 90), 3)); return new THREE.Mesh(g, this._mat(color, enc)); });
      const pos = m.geometry.attributes.position, ns = Math.min(90, n); let j = 0;
      for (let i = 0; i < 90; i++) {
        const ii = Math.min(i, ns - 1), p0 = c.clone().addScaledVector(dir(a0 + (a1 - a0) * ii / ns), R), p1 = c.clone().addScaledVector(dir(a0 + (a1 - a0) * (ii + 1) / ns), R);
        const valido = i < ns;
        for (const p of [c, valido ? p0 : c, valido ? p1 : c]) { pos.setXYZ(j++, p.x, p.y, p.z); }
      }
      pos.needsUpdate = true; m.geometry.computeBoundingSphere();
      m.material.color.set(color); m.material.opacity = alfa * (o.relleno ?? 0.16); m.material.depthTest = !enc; m.renderOrder = 18;
    }
    if (o.texto) {
      const am = (a0 + a1) / 2, pt = c.clone().addScaledVector(dir(am), R * (o.distTexto || 1.75));
      this.textos.push({ p: pt, texto: o.texto, alfa, color, tam: o.tamTexto || 72, desplaza: o.desplazaTexto || [0, 0] });
    }
    return a1 / D2R;
  }

  // ---------- flecha de empuje ----------
  // o: { desde, hacia (Vector3|[x,y,z]), grosor: 0.025, punta: 0.12 (largo de la punta), color, alfa, crecer: 0..1 }
  flecha(o = {}) {
    const a = aV(o.desde), b0 = aV(o.hacia), cr = o.crecer ?? 1, alfa = o.alfa ?? 1, color = o.color || ROJO, enc = o.encima ?? true;
    if (alfa <= 0 || cr <= 0) return this;
    const b = a.clone().lerp(b0, cr), d = b.clone().sub(a), L = d.length(); if (L < 1e-6) return this;
    d.normalize();
    const gr = (o.grosor || 0.025) * this.o.escala, lp = Math.min(L * 0.6, (o.punta || 0.13) * this.o.escala);
    const finCuerpo = b.clone().addScaledVector(d, -lp * 0.9);
    this._barra('flecha', a, finCuerpo, gr, color, alfa, enc);
    const m = this._pieza('flechaPunta', () => new THREE.Mesh(new THREE.ConeGeometry(1, 1, 24, 1), this._mat(color, enc)));
    m.position.copy(b).addScaledVector(d, -lp / 2); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d); m.scale.set(gr * 2.6, lp, gr * 2.6);
    m.material.color.set(color); m.material.opacity = alfa; m.material.depthTest = !enc;
    this._esfera('flechaCola', a, gr, color, alfa, enc);
    return this;
  }

  // ---------- utilidades ----------
  // Pivote del último inclinar() (o la punta del pie delantero si no se ha inclinado), en el suelo.
  pivote() { const k = this.k; if (k._pivote) return k._pivote.clone(); const p = k.punto('punta' + k.pieDelantero()); p.y = 0; return p; }
  // Ángulo de vuelco hacia delante (°): cuánto hay que inclinar el cuerpo rígido sobre la punta delantera
  // para que el CdM quede justo encima de ella = atan(distancia horizontal CdM → punta / altura del CdM). Pose sin inclinar.
  anguloVuelco(hacia = 'delante') {
    const k = this.k, c = this.centroMasas(), b = this.medirBase(hacia === 'lado' ? 'lado' : 'frente');
    const rumbo = k.base.rumbo * D2R + (hacia === 'lado' ? Math.PI / 2 : 0), fw = V3(Math.sin(rumbo), 0, Math.cos(rumbo));
    const borde = hacia === 'atras' ? b.desde : b.hasta;
    const dist = hacia === 'atras' ? c.dot(fw) - borde.dot(fw) : borde.dot(fw) - c.dot(fw);
    return Math.atan2(dist, c.y) / D2R;
  }
  // Cifras de los arcos (y cualquier etiqueta 3D) en el lienzo 2D, con la tipografía de marca. Llamar DESPUÉS de esc.dibujar(ctx).
  // etiqueta(p, texto, o) añade una etiqueta suelta anclada a un punto 3D: o { tam: 56, color, alfa, desplaza: [dx, dy] px }
  etiqueta(p, texto, o = {}) { this.textos.push({ p: aV(p), texto, alfa: o.alfa ?? 1, color: o.color || ROJO, tam: o.tam || 56, desplaza: o.desplaza || [0, 0] }); return this; }
  dibujar2D(ctx) {
    const E = window.EMAKI;
    for (const t of this.textos) {
      const s = this.esc.proyectar(t.p); if (!s.delante) continue;
      const tam = Math.max(48, t.tam), y = s.y + t.desplaza[1] - tam * 0.42;
      if (E && E.texto) E.texto(ctx, { lineas: t.texto, size: tam, x: s.x + t.desplaza[0], y, color: t.color, alpha: t.alfa, sombra: 'rgba(244,239,230,0.95)', maxW: 900 });
      else { ctx.save(); ctx.globalAlpha = t.alfa; ctx.fillStyle = t.color; ctx.font = `900 ${tam}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(t.texto, s.x + t.desplaza[0], s.y + t.desplaza[1] + tam * 0.35); ctx.restore(); }
    }
    return this;
  }
}
