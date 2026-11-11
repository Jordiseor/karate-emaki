// KARATE EMAKI · rollo de papel (emaki) en 2D para la pieza de presentación.
// Papel #F4EFE6 entre dos rodillos de madera; ventana de 960×1200 px (x 60–1020, y 300–1500) donde se ve el 3D
// de cada viñeta; desplazamiento lateral entre viñetas; estado cerrado y atado; apertura «como un sol».
// Todo determinista (solo depende de lo que le pases). No necesita THREE: dibuja sobre cualquier contexto 2D.
//
//   const rollo = crearRollo();
//   rollo.dibujar(ctx, { abierto: 1, avance: rollo.avance(t, [2.0]), vinetas: [ (c) => escA.dibujar(c), (c) => escB.dibujar(c) ] });
//
// Una viñeta puede ser: función (c, info) que pinta a pantalla completa (1080×1920) en un lienzo auxiliar (se usa
// solo el trozo de la ventana), un canvas/imagen 1080×1920, null (papel en blanco) o { marco: 0..1 } (marco vacío
// que se dibuja a tinta y «parpadea»). Solo se llama a las funciones de las viñetas que se ven en ese fotograma.

export const VENTANA = { x: 60, y: 300, w: 960, h: 1200 };
export const PAPEL = '#F4EFE6', TINTA = '#1A1A1A', CORDON = '#4A3B6B';
const W = 1080, H = 1920;
const HUECO = 90;                 // papel entre una viñeta y la siguiente (px)
const PASO = VENTANA.w + HUECO;   // desplazamiento de una viñeta a la siguiente
const MARGEN = 38;                // papel por encima y por debajo de la ventana
const PY0 = VENTANA.y - MARGEN, PY1 = VENTANA.y + VENTANA.h + MARGEN; // bordes del papel (262–1538)
const XI = 34, XD = 1046;         // ejes de los rodillos con el rollo abierto
const DUR_PASO = 0.25;
const X_CERRADO = XI + 8, ANCHO_CERRADO = 112; // rollo cerrado: tapa la varilla (que queda enrollada dentro)

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const hash = (i, s = 0) => { let h = Math.imul((i | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((s | 0) + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2d); h ^= h >>> 15; return (h >>> 0) / 4294967296; };
const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const fuenteTitulo = () => (window.EMAKI && window.EMAKI.marca ? window.EMAKI.marca.fuente.titulo : 'Inter, "Noto Sans CJK JP", sans-serif');

// ---------- texturas (una vez) ----------
let _fibra = null;
function fibra() { // fibras de papel washi: trazos cortos claros y oscuros, muy suaves (mosaico 512×512)
  if (_fibra) return _fibra;
  const N = 512; _fibra = lienzo(N, N); const g = _fibra.getContext('2d');
  for (let i = 0; i < 1400; i++) {
    const x = hash(i, 1) * N, y = hash(i, 2) * N, a = (hash(i, 3) - 0.5) * 1.2, l = 6 + hash(i, 4) * 26, osc = hash(i, 5) < 0.55;
    g.strokeStyle = osc ? `rgba(120,96,64,${0.035 + hash(i, 6) * 0.05})` : `rgba(255,255,250,${0.12 + hash(i, 6) * 0.15})`;
    g.lineWidth = 0.6 + hash(i, 7) * 1.2;
    for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + Math.cos(a) * l * 0.5, y + dy + Math.sin(a) * l * 0.5 + 2, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke(); }
  }
  return _fibra;
}
// papel en un rectángulo, con la fibra desplazada `ox` (el papel se mueve con el avance)
function papel(ctx, x, y, w, h, ox = 0) {
  if (w <= 0) return;
  ctx.fillStyle = PAPEL; ctx.fillRect(x, y, w, h);
  const f = fibra(), pat = ctx.createPattern(f, 'repeat');
  pat.setTransform(new DOMMatrix().translateSelf(-ox, 0));
  ctx.save(); ctx.fillStyle = pat; ctx.fillRect(x, y, w, h); ctx.restore();
}
// cilindro vertical (rodillo o papel enrollado) con sombreado de luz cálida desde la izquierda
function cilindro(ctx, cx, ancho, y0, y1, tonos, giro = 0, rayas = 0) {
  const x0 = cx - ancho / 2, g = ctx.createLinearGradient(x0, 0, x0 + ancho, 0);
  g.addColorStop(0, tonos[0]); g.addColorStop(0.28, tonos[1]); g.addColorStop(0.55, tonos[2]); g.addColorStop(1, tonos[3]);
  ctx.fillStyle = g; ctx.fillRect(x0, y0, ancho, y1 - y0);
  if (rayas) { // vueltas del papel: líneas verticales que corren al girar
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, ancho, y1 - y0); ctx.clip();
    for (let i = 0; i < rayas; i++) {
      const fase = ((i / rayas + giro) % 1 + 1) % 1, xx = x0 + ancho * (0.5 - 0.5 * Math.cos(fase * Math.PI));
      ctx.strokeStyle = `rgba(110,84,50,${0.08 + 0.1 * Math.sin(fase * Math.PI)})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y1); ctx.stroke();
    }
    ctx.restore();
  }
}
const MADERA = ['#5E3F26', '#B5875A', '#94683F', '#4A3020'];
const PAPEL_ROLLO = ['#CDBFA8', '#FBF7EF', '#E9E0D0', '#B9AA92'];
// pomo de madera (jiku) en el extremo de un rodillo
function pomo(ctx, cx, y, r, arriba) {
  const h = r * 1.15, y0 = arriba ? y - h : y, g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  MADERA.forEach((c, i) => g.addColorStop([0, 0.3, 0.6, 1][i], c));
  ctx.fillStyle = g; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cx - r, y0, 2 * r, h, r * 0.45); else ctx.rect(cx - r, y0, 2 * r, h);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,230,190,0.25)'; ctx.fillRect(cx - r * 0.45, y0 + h * 0.15, r * 0.25, h * 0.7);
}
// rodillo fino (el extremo fijo del rollo, varilla de madera)
function varilla(ctx, cx) {
  cilindro(ctx, cx, 30, PY0 - 6, PY1 + 6, MADERA);
  pomo(ctx, cx, PY0 - 6, 19, true); pomo(ctx, cx, PY1 + 6, 19, false);
}
// rollo grueso (papel enrollado sobre su eje)
function rolloGrueso(ctx, cx, ancho, giro) {
  cilindro(ctx, cx, ancho, PY0 - 4, PY1 + 4, PAPEL_ROLLO, giro, 7);
  ctx.fillStyle = 'rgba(80,60,35,0.35)'; ctx.fillRect(cx - ancho / 2, PY0 - 4, ancho, 3); ctx.fillRect(cx - ancho / 2, PY1 + 1, ancho, 3);
  pomo(ctx, cx, PY0 - 4, 21, true); pomo(ctx, cx, PY1 + 4, 21, false);
}
function sombra(ctx, x0, x1) {
  if (x1 - x0 < 1) return;
  ctx.save(); ctx.shadowColor = 'rgba(60,38,20,0.32)'; ctx.shadowBlur = 38; ctx.shadowOffsetY = 18;
  ctx.fillStyle = PAPEL; ctx.fillRect(x0, PY0, x1 - x0, PY1 - PY0); ctx.restore();
}

// marco vacío a tinta (plano 3): el borde se traza (0–0,6) y el interior «parpadea» con una aguada (0,6–1)
function marcoVacio(ctx, x, y, w, h, p, semilla = 0) {
  if (p <= 0) return;
  const m = 46, X0 = x + m, Y0 = y + m, X1 = x + w - m, Y1 = y + h - m;
  const fl = clamp((p - 0.6) / 0.4);
  if (fl > 0) { // aguada: dos destellos y queda suave
    const a = 0.16 * Math.max(Math.sin(fl * Math.PI * 3) ** 2 * (1 - fl), 0) + 0.07 * fl;
    ctx.fillStyle = `rgba(26,26,26,${a})`; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  }
  const pts = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1], [X0, Y0]], seg = [];
  let tot = 0; for (let i = 0; i < 4; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); tot += l; }
  let resto = easeInOut(clamp(p / 0.6)) * tot;
  ctx.save(); ctx.strokeStyle = TINTA; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 4 && resto > 0; i++) {
    const f = Math.min(1, resto / seg[i]); resto -= seg[i];
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(2, Math.round(seg[i] / 24 * f));
    for (let k = 0; k < n; k++) { // pincel: grosor que varía a lo largo del trazo
      const u0 = (k / n) * f, u1 = ((k + 1) / n) * f;
      ctx.lineWidth = 7 + 5 * hash(k + i * 97, semilla) * Math.sin(Math.PI * (u0 + 0.05));
      ctx.beginPath(); ctx.moveTo(lerp(ax, bx, u0), lerp(ay, by, u0)); ctx.lineTo(lerp(ax, bx, u1), lerp(ay, by, u1)); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- el rollo ----------
export function crearRollo(o = {}) {
  o = Object.assign({ hueco: HUECO }, o);
  const paso = VENTANA.w + o.hueco;
  const aux = [lienzo(W, H), lienzo(W, H)];
  const auxCtx = aux.map((c) => c.getContext('2d'));

  // pinta la viñeta i con su borde izquierdo en la x de pantalla `xv`, recortada a [clip0, clip1]
  function vineta(ctx, fuente, i, xv, clip0, clip1, ranura, info) {
    const a = Math.max(xv, clip0), b = Math.min(xv + VENTANA.w, clip1);
    if (b - a < 0.5) return;
    if (fuente && typeof fuente === 'object' && 'marco' in fuente && !(fuente instanceof HTMLCanvasElement)) {
      ctx.save(); ctx.beginPath(); ctx.rect(a, VENTANA.y, b - a, VENTANA.h); ctx.clip();
      marcoVacio(ctx, xv, VENTANA.y, VENTANA.w, VENTANA.h, fuente.marco, i + 1); ctx.restore(); return;
    }
    let img = null;
    if (typeof fuente === 'function') { const c = auxCtx[ranura]; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = PAPEL; c.fillRect(0, 0, W, H); fuente(c, Object.assign({ indice: i }, info)); img = aux[ranura]; }
    else if (fuente) img = fuente;
    if (!img) return;
    const sx = VENTANA.x + (a - xv);
    ctx.drawImage(img, sx, VENTANA.y, b - a, VENTANA.h, a, VENTANA.y, b - a, VENTANA.h);
    // filete de tinta alrededor de la viñeta
    ctx.save(); ctx.beginPath(); ctx.rect(clip0, 0, clip1 - clip0, H); ctx.clip();
    ctx.strokeStyle = 'rgba(26,26,26,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(xv + 1.5, VENTANA.y + 1.5, VENTANA.w - 3, VENTANA.h - 3); ctx.restore();
  }

  const R = {
    VENTANA, PASO: paso, DUR_PASO,
    // Avance continuo para `dibujar({avance})`: cada instante de `cortes` empieza un desplazamiento de 0,25 s a la viñeta siguiente.
    avance(t, cortes = [], dur = DUR_PASO) { let a = 0; for (const c of cortes) a += easeInOut(clamp((t - c) / dur)); return a; },
    // o: { abierto: 0..1 (0 cerrado, 1 abierto del todo), avance: 0 = viñeta 0 en la ventana (1 = la 1, 1.5 = a medio pasar),
    //      vinetas: [...], atado: 0..1 (cordón; solo se ve cerrado), escala: 1, x: 0, y: 0 (desplazamiento del rollo entero, px),
    //      centrar: 0..1 (1 = cerrado en el centro de la pantalla y se abre hacia los lados; 0 = cerrado a la izquierda y se
    //      abre hacia la derecha), sombra: true, info: {} (se pasa a las funciones de viñeta) }
    dibujar(ctx, op = {}) {
      op = Object.assign({ abierto: 1, avance: 0, vinetas: [], atado: 0, escala: 1, x: 0, y: 0, sombra: true }, op);
      const ab = clamp(op.abierto);
      ctx.save();
      // transformación del rollo entero alrededor del centro de la ventana
      const cx = VENTANA.x + VENTANA.w / 2, cy = VENTANA.y + VENTANA.h / 2;
      const dxc = (op.centrar || 0) * (1 - ab) * (cx - X_CERRADO); // centrar: el rollo cerrado queda en el centro de la pantalla
      ctx.translate(cx + op.x + dxc, cy + op.y); ctx.scale(op.escala, op.escala); ctx.translate(-cx, -cy);
      // el rollo grueso viaja de izquierda (cerrado) a derecha (abierto); la varilla fina se queda a la izquierda
      const anchoRollo = lerp(ANCHO_CERRADO, 64, ab), xRollo = lerp(X_CERRADO, XD, ab);
      const xPapel1 = xRollo - anchoRollo / 2 + 2;
      if (op.sombra) sombra(ctx, XI, xRollo + anchoRollo / 2);
      papel(ctx, XI, PY0, Math.max(0, xPapel1 - XI), PY1 - PY0, op.avance * paso);
      // filetes del borde del papel
      ctx.fillStyle = 'rgba(150,120,80,0.35)'; ctx.fillRect(XI, PY0, Math.max(0, xPapel1 - XI), 2); ctx.fillRect(XI, PY1 - 2, Math.max(0, xPapel1 - XI), 2);
      // viñetas visibles
      const i0 = Math.floor(op.avance), fr = op.avance - i0;
      let ranura = 0;
      for (let i = Math.max(0, i0 - 1); i <= i0 + 1; i++) {
        const xv = VENTANA.x + (i - op.avance) * paso;
        if (xv + VENTANA.w <= VENTANA.x - 30 || xv >= VENTANA.x + VENTANA.w + 30) continue;
        const f = op.vinetas[i];
        if (f === undefined) continue;
        vineta(ctx, f, i, xv, XI + 16, xPapel1, ranura++ % 2, Object.assign({ avance: op.avance, fraccion: fr }, op.info));
      }
      varilla(ctx, XI);
      rolloGrueso(ctx, xRollo, anchoRollo, op.avance * paso / (Math.PI * anchoRollo) + ab * 3.1);
      if (ab < 0.02 && op.atado > 0) cordon(ctx, xRollo, op.atado);
      ctx.restore();
      return R;
    },
    // Rollo cerrado y atado, centrado en (x, y) de pantalla. atado 0..1 (vueltas del cordón y lazo). escala opcional.
    cerrado(ctx, { x = 540, y = 900, atado = 1, escala = 1, sombra = true } = {}) {
      ctx.save(); ctx.translate(x, y); ctx.scale(escala, escala); ctx.translate(-X_CERRADO, -(VENTANA.y + VENTANA.h / 2));
      R.dibujar(ctx, { abierto: 0, atado, sombra });
      ctx.restore(); return R;
    },
    // Plano 9: el rollo cerrado (en el centro) se abre «como un sol». p 0..1. `fuente` = lo que hay detrás (función
    // (c) => pinta a pantalla completa, o canvas). 0–0,15 se suelta el cordón; 0,12–1 las dos mitades se apartan y un
    // círculo crece desde el centro (cx, cy) dejando ver la fuente. Con p = 1 solo queda la fuente (fotograma limpio).
    sol(ctx, p, fuente, { cx = 540, cy = 900, fondo = PAPEL } = {}) {
      p = clamp(p);
      if (p >= 1) { pintarFuente(ctx, fuente); return R; }
      ctx.fillStyle = fondo; ctx.fillRect(0, 0, W, H); papel(ctx, 0, 0, W, H, 0);
      const q = clamp((p - 0.12) / 0.88), r = easeInOut(q) * 1250;
      if (r > 0.5) {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); pintarFuente(ctx, fuente); ctx.restore();
        // halo cálido en el borde del sol
        const g = ctx.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.06 + 6);
        g.addColorStop(0, 'rgba(255,240,215,0)'); g.addColorStop(0.45, `rgba(255,236,205,${0.55 * (1 - q)})`); g.addColorStop(1, 'rgba(255,240,215,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 1.06 + 6, 0, Math.PI * 2); ctx.fill();
      }
      // las dos mitades del rollo se apartan (más deprisa que el círculo)
      const sep = r + 10 + 40 * (1 - q); // las mitades van por delante del borde del sol
      const xc = cx;
      ctx.save(); ctx.translate(0, cy - (VENTANA.y + VENTANA.h / 2));
      if (q <= 0) { R.cerrado(ctx, { x: xc, y: VENTANA.y + VENTANA.h / 2, atado: 1 - clamp(p / 0.15) }); }
      else {
        rolloGrueso(ctx, xc - sep, 58, sep / 90);
        rolloGrueso(ctx, xc + sep, 58, -sep / 90);
      }
      ctx.restore();
      return R;
    },
    // Etiqueta de pilar (planos 4–7): pestaña de papel con una palabra en tinta en la esquina superior izquierda de la ventana.
    // prog 0..1 (entrada), alfa 0..1. Tamaño ≥ 48 px.
    etiqueta(ctx, texto, { prog = 1, alfa = 1, size = 60, lado = 'izq' } = {}) {
      const p = easeOut(clamp(prog)); if (p <= 0 || alfa <= 0) return R;
      size = Math.max(48, size);
      ctx.save(); ctx.font = `900 ${size}px ${fuenteTitulo()}`;
      const w = ctx.measureText(texto).width + size * 0.9, h = size * 1.45;
      const x = lado === 'izq' ? VENTANA.x + 24 : VENTANA.x + VENTANA.w - 24 - w, y = VENTANA.y + 24 - (1 - p) * 30;
      ctx.globalAlpha = alfa * p;
      ctx.shadowColor = 'rgba(60,38,20,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
      ctx.fillStyle = PAPEL; ctx.fillRect(x, y, w, h); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(26,26,26,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      ctx.fillStyle = TINTA; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(texto, x + w / 2, y + h / 2 + size * 0.04);
      ctx.restore(); return R;
    },
    marcoVacio
  };
  function pintarFuente(ctx, f) { if (typeof f === 'function') f(ctx); else if (f) ctx.drawImage(f, 0, 0, W, H); }
  return R;
}

// cordón (murasaki) con dos vueltas y lazo colgando, sobre el rollo cerrado de eje x = cx
function cordon(ctx, cx, p) {
  const yc = VENTANA.y + VENTANA.h / 2, ancho = ANCHO_CERRADO + 6;
  ctx.save(); ctx.lineCap = 'round';
  const vueltas = [yc - 16, yc + 16];
  vueltas.forEach((y, i) => {
    const f = clamp(p * 2.2 - i * 0.6); if (f <= 0) return;
    ctx.strokeStyle = CORDON; ctx.lineWidth = 11; ctx.beginPath();
    ctx.moveTo(cx - ancho / 2, y - 4); ctx.quadraticCurveTo(cx, y + 6, cx - ancho / 2 + ancho * f, y - 4 + 8 * f * (1 - f)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - ancho / 2 + 6, y - 7); ctx.lineTo(cx - ancho / 2 + ancho * f - 6, y - 5); ctx.stroke();
  });
  const fl = clamp((p - 0.6) / 0.4);
  if (fl > 0) { // lazo y cabos colgando
    ctx.strokeStyle = CORDON; ctx.lineWidth = 10; ctx.globalAlpha = fl;
    ctx.beginPath(); ctx.ellipse(cx - 22, yc, 22, 14, -0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + 22, yc, 22, 14, 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, yc + 6); ctx.quadraticCurveTo(cx - 14, yc + 60, cx - 8, yc + 60 + 70 * fl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, yc + 6); ctx.quadraticCurveTo(cx + 18, yc + 55, cx + 16, yc + 50 + 60 * fl); ctx.stroke();
    ctx.fillStyle = CORDON; ctx.beginPath(); ctx.arc(cx, yc + 2, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
