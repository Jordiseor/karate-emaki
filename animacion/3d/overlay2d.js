// KARATE EMAKI · capa 2D de texto sobre las escenas 3D (títulos, tarjetas, cifras, letra pequeña).
// Usa la tipografía y colores de animacion/marca.js (cárgalo antes con <script src="../marca.js">).
// Reglas de marca que aplica solo: tamaño mínimo 48 px, zona segura 250 px arriba / 350 px abajo, márgenes 70 px.
// [r]texto[/r] dentro de una línea = rojo de marca.
const E = () => {
  if (!window.EMAKI || !window.EMAKI.texto) throw new Error('overlay2d: falta <script src=".../animacion/marca.js"> antes del módulo');
  return window.EMAKI;
};
const PAPEL = 'rgba(244,239,230,0.95)';
export const ZONA = { arriba: 250, abajo: 1920 - 350, izq: 70, der: 1080 - 70, ancho: 1080, alto: 1920 };
const tamMin = (s) => Math.max(48, s || 0);
const altoBloque = (n, s, inter = 1.18) => s * 0.82 + (n - 1) * s * inter + s * 0.22;

// Coloca un bloque de texto respetando la zona segura. o.y = borde superior deseado; o.abajo = true → se apoya en el borde inferior seguro.
function colocar(o) {
  const lineas = Array.isArray(o.lineas) ? o.lineas : [o.lineas], s = tamMin(o.size);
  const alto = altoBloque(lineas.length, s, o.interlinea);
  let y = o.abajo ? ZONA.abajo - alto - (o.margen ?? 10) : (o.y ?? ZONA.arriba + 40);
  y = Math.max(ZONA.arriba, Math.min(ZONA.abajo - alto, y));
  return Object.assign({}, o, { lineas, size: s, y, sombra: o.sombra === false ? null : (o.sombra || PAPEL) });
}

export const overlay = {
  ZONA,
  // Texto fijo. o: { lineas: 'texto' | ['línea 1', 'línea 2'], size: 84, y, abajo, color, peso: 900, x, align, alpha, sombra }
  texto(ctx, o) { return E().texto(ctx, colocar(o)); },
  // Título arriba (entra con fundido + subida). o: { lineas, t0, t1, size: 96, y }
  titulo(ctx, t, o) { return E().tarjeta(ctx, t, colocar(Object.assign({ size: 96 }, o))); },
  // Tarjeta animada en cualquier altura. o: { lineas, t0, t1, size: 84, y | abajo }
  tarjeta(ctx, t, o) { return E().tarjeta(ctx, t, colocar(Object.assign({ size: 84 }, o))); },
  // Cifra grande en rojo (p. ej. '26°') centrada en (x, y) de la pantalla. o: { size: 120, alpha, color }
  cifra(ctx, x, y, texto, o = {}) {
    const s = tamMin(o.size || 120);
    const yy = Math.max(ZONA.arriba, Math.min(ZONA.abajo - s, y - s * 0.42));
    return E().texto(ctx, { lineas: texto, size: s, x, y: yy, color: o.color || E().marca.color.rojo, alpha: o.alpha ?? 1, sombra: o.sombra || PAPEL });
  },
  // Letra pequeña (aviso, «Modelo simplificado…»): 48 px, peso 500, gris tinta, apoyada en el borde inferior seguro.
  letraPequena(ctx, texto, o = {}) {
    return E().texto(ctx, colocar(Object.assign({ lineas: texto, size: 48, peso: 500, color: '#3A3631', abajo: true }, o)));
  },
  // Guía de zona segura (solo para revisar): franjas rojas translúcidas.
  zona(ctx) { E().dibujarZona(ctx); }
};
export default overlay;
