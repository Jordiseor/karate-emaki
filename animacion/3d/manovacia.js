// KARATE EMAKI · biblioteca de la pieza «Mano vacía» (2026-11-18-mano-vacia): 唐手 → 空手.
// Determinista (sin Math.random ni Date). Personas reales: SIEMPRE siluetas, sin rostro.
// Reutiliza: historia2d (kanji a trazos, ROJO/TINTA/PAPEL, fbm, hash), judo3d (crearJudoka para la silueta con hakama),
// karateka3d (Karateka3D, poses seiza / brazos-arriba, mezclar).
//
// ── 2D (sobre cualquier ctx 1080×1920) ─────────────────────────────────────────────────────────────
//  tintaKanji(ctx, x, y, size, prog, { de:'唐', a:'空', colorDe:ROJO, colorA:ROJO, mancha:TINTA })
//     PLANO ESTRELLA. prog 0–0,1 唐 entero · 0,1–0,45 se emborrona (tinta mojada, goteos) · 0,4–1 el pincel escribe 空 a trazos
//     sobre la mancha (que queda tenue). Con prog=1 solo queda 空 (la tarjeta «空 = vacío» entra con prog ≥ 0,98).
//  reloj(ctx, t, x, y, size, { p:1, color:ROJO })      sello-reloj rojo con «?» al centro; las agujas giran sin parar con t (plano 9)
//  selloInterrogante(ctx, x, y, size, p, { rotar })    sello rojo «?» que se estampa con rebote
//  interrogaciones(ctx, t, rect:[x,y,w,h], { n:7, size:110, color:ROJO })  ¿? rojos que flotan (Okinawa)
//  pantallaPartida(ctx, t, { p, arriba:(c,r)=>…, abajo:(c,r)=>…, rotuloA:'Tokio', rotuloB:'Okinawa', kanjiA:'空手', y:960 })
//     Pantalla partida 2D (NO sale de rollo2d ni de overlay: rollo solo apila viñetas, overlay solo da texto). p 0→1 abre la
//     división desde el centro; cada mitad recibe un callback para pintar tu 3D (clip ya aplicado, r = [x,y,w,h]).
//     Arriba: kanjiA firme en tinta; abajo: interrogaciones rojas. Devuelve { arriba:[...], abajo:[...] } con los rects.
// ── 3D (se añaden con esc.escena.add(obj.raiz); todos tienen .colocar(x,z,rumbo)) ─────────────────
//  crearLibro({ texto:'唐手', color:ROJO, tapa:'#E9DFC9', prog:1 })  libro cerrado/abierto
//     .abrir(f) 0 cerrado → 1 abierto · .escribir(prog) kanji de la cubierta a trazos · .colocar(x,z,rumbo)
//     .entre(A, B, { rumbo:0, sube:0.02 })  lo sostiene entre dos puntos (k.punto('manoI'), k.punto('manoD')), cubierta mirando a `rumbo`
//     (0 = hacia +Z, cámara). Pose que funciona con silueta: P.recibir. .poner(x,y,z,rumbo) lo deja suelto.
//  crearFunakoshi() / crearHanashiro()   siluetas Karateka3D. Funakoshi: alto, hakama, #1A1A1A. Hanashiro: más bajo y ancho,
//     gi sin hakama, #3A3340, con casquete. Se usan como cualquier Karateka3D: k.colocar(x,z,rumbo).aplicarPose(P.yoi); esc.escena.add(k.raiz)
//  crearMesaNueve(esc, { periodico:true })  mesa larga baja, 9 siluetas en seiza (5 al fondo, 4 delante de espaldas) + periódico plegado
//     .pose(P, { t, alzan:[i…], f:0..1 })  seiza con respiración; los índices de `alzan` levantan la mano (f = cuánto)
//     .mirarse(P, t) algunos giran la cabeza · .miembros (Karateka3D[9]) · .periodico (Group)
//  crearEdificioNaha({ rotulo:'Naha' })   fachada con rótulo, tejado bajo y ventana. .ventana(f) 0 cerrada → 1 abierta (se corren los postigos)
import * as THREE from './lib/three.module.min.js';
import { Karateka3D, mezclar } from './karateka3d.js';
import { crearJudoka } from './judo3d.js';
import { kanji, ROJO, TINTA, PAPEL, hash, fbm } from './historia2d.js';

export { THREE };
const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const SANS = () => (window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, "Noto Sans CJK JP", sans-serif');

// ============================ 2D ============================
export function tintaKanji(ctx, x, y, size, prog, o = {}) {
  o = Object.assign({ de: '唐', a: '空', colorDe: ROJO, colorA: ROJO, mancha: TINTA }, o);
  const q = sstep(0.1, 0.45, prog), esc = sstep(0.4, 1, prog), mx = sstep(0.38, 0.5, prog);
  ctx.save();
  // mancha de tinta mojada: manchones con borde irregular + goteos
  if (q > 0) {
    const alfa = 0.6 * (1 - 0.7 * esc);
    ctx.save(); ctx.filter = `blur(${Math.round(size * 0.03)}px)`; ctx.fillStyle = o.mancha;
    for (let i = 0; i < 16; i++) {
      const ang = hash(i, 1) * 6.283, d = Math.sqrt(hash(i, 2)) * size * 0.4 * q, r = (0.1 + hash(i, 3) * 0.2) * size * q;
      ctx.globalAlpha = alfa * (0.55 + 0.45 * hash(i, 4));
      ctx.beginPath();
      const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d * 0.9;
      for (let k = 0; k <= 20; k++) { const a = k / 20 * 6.283, rr = r * (0.7 + 0.6 * fbm(i * 3.1 + Math.cos(a) * 1.3, Math.sin(a) * 1.3 + i)); k ? ctx.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr) : ctx.moveTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); }
      ctx.fill();
    }
    for (let i = 0; i < 5; i++) {   // goteos
      const gx = x + (hash(i, 7) - 0.5) * size * 0.8, largo = size * (0.15 + 0.3 * hash(i, 8)) * sstep(0.1 + i * 0.03, 0.55, prog);
      ctx.globalAlpha = alfa; ctx.fillRect(gx - size * 0.012, y + size * 0.15, size * 0.024, largo);
      ctx.beginPath(); ctx.arc(gx, y + size * 0.15 + largo, size * 0.022, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  // 唐 se disuelve
  if (mx < 1) {
    ctx.save(); ctx.filter = q > 0 ? `blur(${(q * size * 0.05).toFixed(1)}px)` : 'none';
    kanji(ctx, o.de, x, y, size, { prog: 1, color: o.colorDe, alpha: 1 - mx });
    ctx.restore();
  }
  if (esc > 0) kanji(ctx, o.a, x, y, size, { prog: esc, color: o.colorA });
  ctx.restore();
}

export function selloInterrogante(ctx, x, y, size, p = 1, o = {}) {
  if (p <= 0) return;
  const q = clamp(p), s = q < 1 ? 1 + 0.35 * Math.pow(1 - q, 2) * Math.cos(q * 9) : 1, color = o.color || ROJO;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rotar ?? -0.1); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, q * 5);
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(-size / 2, -size / 2, size, size, size * 0.1); ctx.fill();
  ctx.strokeStyle = PAPEL; ctx.lineWidth = Math.max(3, size * 0.035); ctx.beginPath(); ctx.roundRect(-size * 0.42, -size * 0.42, size * 0.84, size * 0.84, size * 0.06); ctx.stroke();
  ctx.fillStyle = PAPEL; ctx.font = `900 ${size * 0.72}px ${SANS()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, size * 0.04);
  ctx.restore();
}

export function reloj(ctx, t, x, y, size, o = {}) {
  const p = o.p == null ? 1 : o.p, color = o.color || ROJO, R = size / 2;
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= clamp(p * 4); const e = 0.85 + 0.15 * sstep(0, 1, p); ctx.scale(e, e);
  ctx.fillStyle = PAPEL; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.06; ctx.stroke();
  ctx.lineWidth = size * 0.02; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.beginPath(); ctx.moveTo(Math.sin(a) * R * 0.8, -Math.cos(a) * R * 0.8); ctx.lineTo(Math.sin(a) * R * 0.9, -Math.cos(a) * R * 0.9); ctx.stroke(); }
  ctx.fillStyle = color; ctx.font = `900 ${size * 0.42}px ${SANS()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha *= 0.28; ctx.fillText('?', 0, size * 0.03); ctx.globalAlpha = 1;
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.05;
  const am = t * 6.283 / 2.5, ah = am / 12;   // un minuto cada 2,5 s: «gira sin parar»
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(am) * R * 0.72, -Math.cos(am) * R * 0.72); ctx.stroke();
  ctx.lineWidth = size * 0.07; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ah) * R * 0.45, -Math.cos(ah) * R * 0.45); ctx.stroke();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, size * 0.05, 0, 6.283); ctx.fill();
  ctx.restore();
}

export function interrogaciones(ctx, t, rect, o = {}) {
  o = Object.assign({ n: 7, size: 110, color: ROJO }, o); const [rx, ry, rw, rh] = rect;
  ctx.save(); ctx.fillStyle = o.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < o.n; i++) {
    const s = o.size * (0.7 + 0.6 * hash(i, 5)), cx = rx + rw * (0.1 + 0.8 * hash(i, 1)) + Math.sin(t * 1.1 + i * 2) * 14;
    const cy = ry + rh * (0.15 + 0.7 * ((hash(i, 2) + t * 0.05 * (0.5 + hash(i, 3))) % 1)), a = Math.sin(((cy - ry) / rh) * Math.PI);
    ctx.globalAlpha = clamp(a * 1.6) * 0.9; ctx.font = `900 ${s}px ${SANS()}`;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((hash(i, 4) - 0.5) * 0.5 + Math.sin(t * 1.5 + i) * 0.08); ctx.fillText('?', 0, 0); ctx.restore();
  }
  ctx.restore();
}

export function pantallaPartida(ctx, t, o = {}) {
  o = Object.assign({ p: 1, y: 960, rotuloA: 'Tokio', rotuloB: 'Okinawa', kanjiA: '空手', arriba: null, abajo: null }, o);
  const e = sstep(0, 1, o.p), W = 1080, H = 1920, y = o.y, mitad = (1 - e) * 0;   // p abre desde el centro
  const rA = [0, y - (y) * e, W, y * e], rB = [0, y, W, (H - y) * e];
  const mitadDe = (r, fn, fondo, dir) => {
    if (r[3] < 2) return;
    ctx.save(); ctx.beginPath(); ctx.rect(...r); ctx.clip(); ctx.fillStyle = fondo; ctx.fillRect(...r); if (fn) fn(ctx, r); ctx.restore();
  };
  mitadDe(rA, o.arriba, PAPEL); mitadDe(rB, o.abajo, '#E9E1D2');
  // contenido por defecto
  if (e > 0.6) {
    const k = sstep(0.6, 1, e);
    ctx.save(); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.rect(...rA); ctx.clip();
    kanji(ctx, o.kanjiA, 540, y - 400, 320, { color: TINTA, prog: 1 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.rect(...rB); ctx.clip();
    interrogaciones(ctx, t, [60, y + 40, 960, 760], { n: 7 });
    ctx.restore();
    // rótulos
    ctx.save(); ctx.globalAlpha = k; ctx.font = `900 84px ${SANS()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = PAPEL; ctx.fillStyle = TINTA;
    ctx.strokeText(o.rotuloA, 540, y - 90); ctx.fillText(o.rotuloA, 540, y - 90);
    ctx.strokeText(o.rotuloB, 540, y + 90); ctx.fillText(o.rotuloB, 540, y + 90);
    ctx.restore();
  }
  // trazo de pincel en la división
  ctx.save(); ctx.fillStyle = TINTA; const L = W * e;
  ctx.beginPath(); ctx.moveTo(540 - L / 2, y - 7);
  for (let i = 0; i <= 24; i++) ctx.lineTo(540 - L / 2 + L * i / 24, y - 6 - 5 * fbm(i * 0.5, 3));
  for (let i = 24; i >= 0; i--) ctx.lineTo(540 - L / 2 + L * i / 24, y + 6 + 5 * fbm(i * 0.5, 9));
  ctx.closePath(); ctx.fill(); ctx.restore();
  return { arriba: rA, abajo: rB };
}

// ============================ 3D ============================
const mat = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, side: THREE.DoubleSide });
const caja = (w, h, d, m, x = 0, y = 0, z = 0, cast = true) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(x, y, z); q.castShadow = cast; q.receiveShadow = true; return q; };
const base = (obj, raiz) => { obj.colocar = (x = 0, z = 0, rumbo = 0) => { raiz.position.set(x, raiz.position.y, z); raiz.rotation.y = rumbo * D2R; return obj; }; return obj; };

export function crearLibro(o = {}) {
  o = Object.assign({ texto: '唐手', color: ROJO, tapa: '#E9DFC9', prog: 1, ancho: 0.3, alto: 0.42, grueso: 0.035 }, o);
  const W = o.ancho, Hh = o.alto, G = o.grueso, raiz = new THREE.Group(), tapaGrp = new THREE.Group();
  // textura de la cubierta (kanji vertical a trazos) y de las páginas
  const cv = lienzo(384, 540), cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const pg = lienzo(384, 540), px = pg.getContext('2d'), texP = new THREE.CanvasTexture(pg); texP.colorSpace = THREE.SRGBColorSpace;
  px.fillStyle = '#F7F1E4'; px.fillRect(0, 0, 384, 540); px.fillStyle = '#B9B2A6';
  for (let c = 0; c < 4; c++) for (let r = 0; r < 18; r++) { const l = 30 + hash(c * 31 + r, 9) * 20; px.fillRect(300 - c * 85, 50 + r * 25, 14, l * 0.6 + 4); }
  texP.needsUpdate = true;
  const pintar = (prog) => {
    cx.fillStyle = o.tapa; cx.fillRect(0, 0, 384, 540);
    cx.strokeStyle = TINTA; cx.lineWidth = 8; cx.strokeRect(22, 22, 340, 496);
    cx.fillStyle = '#F4EFE6'; cx.fillRect(96, 70, 192, 400);
    kanji(cx, o.texto, 192, 270, 150, { color: o.color, vertical: true, prog, separacion: 160 });
    tex.needsUpdate = true;
  };
  pintar(o.prog);
  const mTapa = [mat('#6B5640'), mat('#6B5640'), mat('#6B5640'), mat('#6B5640'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: '#CFC6B2', roughness: 0.9 })];
  const placa = caja(W, Hh, 0.008, mTapa, W / 2, 0, 0); tapaGrp.add(placa);
  tapaGrp.position.set(-W / 2, 0, G / 2);          // bisagra en el lomo (borde izquierdo), cara frontal
  const bloque = caja(W - 0.01, Hh - 0.01, G - 0.01, [mat('#EDE5D2'), mat('#EDE5D2'), mat('#EDE5D2'), mat('#EDE5D2'), new THREE.MeshStandardMaterial({ map: texP }), mat('#6B5640')], 0, 0, 0);
  const trasera = caja(W, Hh, 0.008, mat('#6B5640'), 0, 0, -G / 2);
  raiz.add(bloque, trasera, tapaGrp);
  const L = { raiz, tex, pintar };
  L.abrir = (f) => { f = clamp(f); tapaGrp.rotation.y = -f * 170 * D2R; bloque.scale.x = 1; return L; };
  L.escribir = (p) => { pintar(p); return L; };
  L.entre = (A, B, op = {}) => { const m = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5); raiz.position.set(m.x, m.y + (op.sube ?? 0.02), m.z); raiz.rotation.set(0, (op.rumbo ?? 0) * D2R, 0); return L; };
  L.poner = (x, y, z, rumbo = 0) => { raiz.position.set(x, y, z); raiz.rotation.set(0, rumbo * D2R, 0); return L; };
  L.colocar = (x = 0, z = 0, rumbo = 0) => { raiz.position.x = x; raiz.position.z = z; raiz.rotation.y = rumbo * D2R; return L; };
  return L;
}

export function crearFunakoshi() { const k = crearJudoka({ cinturon: 'negro', color: '#1A1A1A', detalle: 'kano' }); k.raiz.scale.set(1, 1.04, 1); return k; }
export function crearHanashiro() {
  const k = new Karateka3D({ cinturon: 'negro', peinado: 'rapado' }); k.silueta('#3A3340');
  const m = mat('#3A3340'), g = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), m);
  g.scale.set(0.17, 0.085, 0.17); g.position.set(0, 0.27, 0.0); g.castShadow = true; k.j.cabeza.add(g);   // casquete
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.16, 20, 1, true), m); h.position.set(0, -0.1, 0); h.scale.set(1.15, 1, 0.9); k.j.cadera.add(h);  // chaqueta larga
  k.raiz.scale.set(1.12, 0.9, 1.12); return k;
}

export function crearMesaNueve(esc, o = {}) {
  o = Object.assign({ periodico: true, largo: 6.6, ancho: 1.1, alto: 0.5 }, o);
  const raiz = new THREE.Group(), madera = mat('#8A6142', 0.7);
  raiz.add(caja(o.largo, 0.07, o.ancho, madera, 0, o.alto, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) raiz.add(caja(0.1, o.alto, 0.1, mat('#5C4030'), sx * (o.largo / 2 - 0.2), o.alto / 2, sz * (o.ancho / 2 - 0.12)));
  esc.escena.add(raiz);
  const colores = ['#1A1A1A', '#26242B', '#1F2229', '#2B2622', '#1E1E1E'], miembros = [];
  const pos = [];
  for (let i = 0; i < 5; i++) pos.push([(i - 2) * 1.3, -0.95, 0]);          // fondo, mira a cámara
  for (let i = 0; i < 4; i++) pos.push([(i - 1.5) * 1.5, 0.95, 180]);       // delante, de espaldas
  pos.forEach(([x, z, r], i) => {
    const k = new Karateka3D({ cinturon: i % 3 ? 'negro' : 'blanco', peinado: ['corto', 'rapado', 'normal'][i % 3], sombras: i < 5 });
    k.silueta(colores[i % colores.length]); k.colocar(x, z, r); k.raiz.scale.set(1, 0.94 + 0.06 * hash(i, 4), 1); esc.escena.add(k.raiz); miembros.push(k);
  });
  // periódico plegado en el centro
  const per = new THREE.Group(), cp = lienzo(384, 256), x = cp.getContext('2d');
  x.fillStyle = '#EDE6D6'; x.fillRect(0, 0, 384, 256); x.fillStyle = TINTA; x.fillRect(24, 22, 336, 40);
  for (let c = 0; c < 3; c++) for (let r = 0; r < 9; r++) { x.fillStyle = '#6E685E'; x.fillRect(24 + c * 114, 86 + r * 18, 100 * (0.6 + 0.4 * hash(c * 9 + r, 3)), 7); }
  x.fillStyle = '#B9B2A6'; x.fillRect(190, 0, 4, 256);
  const tp = new THREE.CanvasTexture(cp); tp.colorSpace = THREE.SRGBColorSpace;
  const hoja = caja(0.62, 0.012, 0.44, [mat('#EDE6D6'), mat('#EDE6D6'), new THREE.MeshStandardMaterial({ map: tp, roughness: 0.9 }), mat('#EDE6D6'), mat('#EDE6D6'), mat('#EDE6D6')], 0, 0, 0);
  per.add(hoja); per.position.set(0, o.alto + 0.045, 0.02); per.rotation.y = 0.1; per.visible = o.periodico; raiz.add(per);
  const M = { raiz, miembros, periodico: per };
  const BAJA = -0.62;
  M.pose = (P, { t = 0, alzan = [], f = 0 } = {}) => {
    miembros.forEach((k, i) => {
      const resp = Math.sin(t * 1.6 + i * 0.9) * 1.2, alza = alzan.includes(i) ? clamp(f) : 0;
      const b = P['brazos-arriba'], arriba = { ...P.seiza, brazoD: b.brazoD, codoD: b.codoD, manoD: b.manoD, munecaD: b.munecaD };
      const p = alza > 0 ? mezclar(P.seiza, arriba, alza) : P.seiza;
      k.aplicarPose({ ...p, cabeza: { inclina: resp, giro: 0 } }, { suelo: false, altura: BAJA });
    });
    return M;
  };
  M.mirarse = (P, t) => { miembros.forEach((k, i) => { const g = Math.sin(clamp(t * 0.5) * Math.PI) * (i % 2 ? 30 : -30); k.aplicarPose({ ...P.seiza, cabeza: { inclina: 0, giro: g } }, { suelo: false, altura: BAJA }); }); return M; };
  M.colocar = (x = 0, z = 0, rumbo = 0) => { raiz.position.set(x, 0, z); raiz.rotation.y = rumbo * D2R; return M; };
  return M;
}

export function crearEdificioNaha(o = {}) {
  o = Object.assign({ rotulo: 'Naha', ancho: 5, fondo: 3.4, alto: 3.4 }, o);
  const raiz = new THREE.Group(), yeso = mat('#E6DCC6', 0.95), mad = mat('#6B5038', 0.7), teja = mat('#7A5A44', 0.8);
  raiz.add(caja(o.ancho, o.alto, o.fondo, yeso, 0, o.alto / 2, 0));
  raiz.add(caja(o.ancho + 0.2, 0.18, o.fondo + 0.2, mad, 0, o.alto + 0.09, 0));
  const tej = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1), teja); tej.rotation.y = Math.PI / 4; tej.scale.set(o.ancho * 0.78, 1.1, o.fondo * 0.78); tej.position.y = o.alto + 0.18 + 0.55; tej.castShadow = true; raiz.add(tej);
  // rótulo (papel con letras en tinta)
  const cr = lienzo(512, 160), x = cr.getContext('2d'); x.fillStyle = '#F4EFE6'; x.fillRect(0, 0, 512, 160); x.strokeStyle = '#5C4030'; x.lineWidth = 10; x.strokeRect(5, 5, 502, 150);
  x.fillStyle = TINTA; x.font = `900 108px ${SANS()}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.rotulo, 256, 88);
  const tr = new THREE.CanvasTexture(cr); tr.colorSpace = THREE.SRGBColorSpace;
  const car = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.75), new THREE.MeshStandardMaterial({ map: tr, roughness: 0.8 })); car.position.set(0, o.alto - 0.55, o.fondo / 2 + 0.03); raiz.add(car);
  // ventana con dos postigos
  const vz = o.fondo / 2 + 0.02, vy = 1.65;
  raiz.add(caja(2.0, 1.3, 0.02, mat('#2A2420'), 0, vy, vz));
  const marco = (w, h, y) => caja(w, h, 0.07, mad, 0, y, vz + 0.02);
  raiz.add(marco(2.2, 0.1, vy + 0.7), marco(2.2, 0.1, vy - 0.7));
  const mp = mat('#C9A878', 0.8), pl = caja(1.0, 1.28, 0.05, mp, -0.5, vy, vz + 0.04), pr = caja(1.0, 1.28, 0.05, mp, 0.5, vy, vz + 0.05);
  raiz.add(pl, pr);
  const E = { raiz };
  E.ventana = (f) => { f = sstep(0, 1, f); pl.position.x = -0.5 - 0.95 * f; pr.position.x = 0.5 + 0.95 * f; return E; };
  E.ventana(0);
  return base(E, raiz);
}
