// Tramo B (planos 4, 5, 6): código común. Viñetas Historia / Técnica / Ciencia dentro de la ventana del rollo.
// Convención de rollo (debe coincidir con el final del plano 3 y el principio del 7):
//   rollo abierto del todo, centrar:1, escala 1, x:0, y:0. Índices de viñeta: 3 = último marco de A (lleno), 4 = Historia,
//   5 = Técnica, 6 = Ciencia, (7 = Dōjō, tramo C). Plano 4 avanza 3→4 en 7,4 s, plano 5: 4→5, plano 6: 5→6 (0,25 s al empezar).
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import { crearCasa, ambiente } from '../../../../animacion/3d/historia3d.js';
import { crearRollo } from '../../../../animacion/3d/rollo2d.js';

export const DUR = 2.1;                       // los tres planos duran 2,1 s
const ROJO = '#C8102E';
const ctx = document.getElementById('c').getContext('2d');
const esc = crearEscenario({ escala: 0.5 });
const P = cargarPoses();
const k = new Karateka3D({ cinturon: 'negro' }); esc.escena.add(k.raiz);
const d = new Diagrama3D(esc, k);
const casa = crearCasa({ rotulo: '' }); esc.escena.add(casa.raiz);
const rollo = crearRollo();

k.colocar(-0.05, 0, 90).aplicarPose(P['zenkutsu-dachi']);
d.ajustarVuelco(26);                           // CdM del modelo = dosier (≈26°), pose sin inclinar

function modoHistoria() { ambiente(esc, 'atardecer'); k.raiz.visible = false; d.g.visible = false; casa.raiz.visible = true; }
function modoTecnica() { ambiente(esc, 'dojo'); k.raiz.visible = true; d.g.visible = true; casa.raiz.visible = false; }

// ---- Plano 4: Historia ----
export function historia(c, tl) {
  tl = U.clamp(tl, 0, DUR);
  modoHistoria();
  casa.pop(1).construir(U.easeOut(U.prog(tl, 0.15, 1.65)));
  const rebote = Math.sin(U.prog(tl, 1.65, 2.1) * Math.PI) * Math.exp(-2 * U.prog(tl, 1.65, 2.1)); // remate
  casa.raiz.scale.setScalar(1 + 0.05 * rebote);
  esc.orbita({ centro: [0, 1.6, 0], distancia: 41, azimut: U.lerp(-32, 38, U.easeInOut(U.prog(tl, 0, DUR))), elevacion: 8, fov: 30 });
  esc.dibujar(c);
}

// ---- Plano 5: Técnica (punto rojo + vertical + empuje a la cadera) ----
export function tecnica(c, tl) {
  tl = U.clamp(tl, 0, DUR);
  modoTecnica();
  k.aplicarPose(P['zenkutsu-dachi']); k.cara({ parpadeo: U.parpadeo(tl, [0.3]), cejas: -0.3, sonrisa: 0.15 });
  const e = U.easeOut(U.prog(tl, 0.3, 1.3));
  esc.orbita({ centro: [U.lerp(0.12, 0.05, e), U.lerp(0.95, 0.9, e), 0], distancia: U.lerp(7.2, 6.6, e), azimut: 0, elevacion: 3, fov: 26 });
  d.limpiar();
  const pop = U.prog(tl, 0.55, 0.75);          // el punto aparece de golpe, con rebote
  if (pop > 0) {
    const caida = U.easeIn(U.prog(tl, 0.8, 1.3)); // la vertical cae sobre los pies
    const cc = d.cdm({ radio: 0.045 * (0.2 + 0.8 * U.easeBack(pop)), vertical: caida >= 1 });
    if (caida > 0 && caida < 1) { const suelo = cc.clone(); suelo.y = 0.004; d.linea(cc, cc.clone().lerp(suelo, caida), { discontinua: true, color: ROJO }); }
  }
  esc.dibujar(c); d.dibujar2D(c);
}

// ---- Plano 6: Ciencia (inclinación rígida, arco hasta 26°) ----
export function ciencia(c, tl) {
  tl = U.clamp(tl, 0, DUR);
  modoTecnica();
  const inc = 26 * U.easeInOut(U.prog(tl, 0.35, 1.45));
  const temblor = U.prog(tl, 1.5, 1.6) * Math.sin(tl * 55) * 0.35;    // aguanta con esfuerzo
  k.aplicarPose(P['zenkutsu-dachi'], { inclinar: inc + temblor });
  const es = U.prog(inc, 4, 26);
  k.cara({ parpadeo: 0, cejas: -0.2 - 0.7 * es, sonrisa: 0, ojos: 0.2 * es, grito: 0.25 * es });
  esc.orbita({ centro: [0.3, 0.9, 0], distancia: 8.3, azimut: 0, elevacion: 3, fov: 26 });
  d.limpiar();
  const cc = d.cdm();
  if (inc > 0.5) d.arco({ centro: d.pivote(), desde: 0, angulo: inc, radio: 0.5, texto: '', relleno: 0.2 });
  esc.dibujar(c); d.dibujar2D(c);
  const f = U.prog(tl, 0.8, 1.0);
  if (f > 0) overlay.cifra(c, 320, 470, '≈26°', { size: 150 + 50 * (1 - U.easeBack(f) + 0) * 0 + 18 * Math.sin(f * Math.PI) });
}

// ---- montaje por plano ----
const marcoLleno = { marco: 1 };
export function montar(plano) {
  window.DURACION = DUR;
  const cfg = {
    4: { base: 3, etiqueta: 'Historia', v: (tl) => { const a = []; a[3] = marcoLleno; a[4] = (c) => historia(c, tl); return a; } },
    5: { base: 4, etiqueta: 'Técnica',  v: (tl) => { const a = []; a[4] = (c) => historia(c, DUR); a[5] = (c) => tecnica(c, tl); return a; } },
    6: { base: 5, etiqueta: 'Ciencia',  v: (tl) => { const a = []; a[5] = (c) => tecnica(c, DUR); a[6] = (c) => ciencia(c, tl); return a; } }
  }[plano];
  window.render = (t) => {
    window.EMAKI.fondoPapel(ctx);
    rollo.dibujar(ctx, { abierto: 1, centrar: 1, avance: cfg.base + rollo.avance(t, [0]), vinetas: cfg.v(t) });
    rollo.etiqueta(ctx, cfg.etiqueta, { prog: U.prog(t, 0.05, 0.3), alfa: 1 - U.prog(t, 0.65, 0.8) });
  };
}
