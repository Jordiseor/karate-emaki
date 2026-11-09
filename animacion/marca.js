// KARATE EMAKI · marca: paleta, tipografías, zona segura y utilidades comunes.
// Uso: <script src=".../animacion/marca.js"></script>  →  window.EMAKI.marca, EMAKI.util, EMAKI.texto
(function () {
  const E = (window.EMAKI = window.EMAKI || {});

  E.marca = {
    W: 1080, H: 1920, fps: 30,
    color: {
      papel: '#F4EFE6',   // fondo
      tinta: '#1A1A1A',   // líneas, texto, siluetas
      rojo: '#C8102E',    // SOLO kanji clave, años y fuego/golpes
      gris: '#8A847A',    // ceniza, lavados de tinta claros
      aguada: '#D9D2C5',  // aguada muy clara (sumi-e de fondo)
      noche: '#24211E',   // cielo oscuro
      gi: '#FFFFFF',      // karategi
      giSombra: '#E4DED2' // extremidades del lado lejano
    },
    fuente: {
      titulo: 'Inter, "Noto Sans CJK JP", sans-serif',     // sans gruesa (900)
      kanjiPincel: '"Noto Serif CJK JP", "IPAGothic", serif', // kanji grandes de pincel (900)
      kanjiTexto: '"Noto Sans CJK JP", "IPAGothic", sans-serif'
    },
    // Zona segura de redes: 250 px libres arriba y 350 abajo; margen lateral 70.
    zona: { arriba: 250, abajo: 1920 - 350, izq: 70, der: 1080 - 70 },
    textoMin: 48
  };

  // ---------- utilidades ----------
  const U = (E.util = {});
  U.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.prog = (t, t0, t1) => U.clamp((t - t0) / (t1 - t0));          // 0..1 entre t0 y t1
  U.easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  U.easeOut = (x) => 1 - Math.pow(1 - x, 3);
  U.easeIn = (x) => x * x * x;
  U.easeBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  // generador aleatorio determinista (mulberry32)
  U.rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // ruido de valor 2D suave y determinista
  U.ruido2 = (function () {
    const r = U.rng(1234), P = new Float32Array(256 * 256);
    for (let i = 0; i < P.length; i++) P[i] = r();
    const g = (x, y) => P[(y & 255) * 256 + (x & 255)];
    const s = (t) => t * t * (3 - 2 * t);
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = s(x - xi), yf = s(y - yi);
      const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
      return U.lerp(U.lerp(a, b, xf), U.lerp(c, d, xf), yf); };
  })();
  U.fbm = (x, y) => 0.5 * U.ruido2(x, y) + 0.3 * U.ruido2(x * 2.1, y * 2.1) + 0.2 * U.ruido2(x * 4.3, y * 4.3);

  // ---------- lienzo ----------
  E.lienzo = function (id = 'c') {
    const c = document.getElementById(id);
    c.width = E.marca.W; c.height = E.marca.H;
    return c.getContext('2d');
  };
  let grano = null;
  // Fondo papel con grano sutil (el grano es fijo: no "hierve" entre fotogramas).
  E.fondoPapel = function (ctx, color = E.marca.color.papel) {
    ctx.fillStyle = color; ctx.fillRect(0, 0, E.marca.W, E.marca.H);
    if (!grano) {
      grano = document.createElement('canvas'); grano.width = 540; grano.height = 960;
      const g = grano.getContext('2d'), im = g.createImageData(540, 960), r = U.rng(7);
      for (let i = 0; i < im.data.length; i += 4) {
        const fib = U.fbm((i / 4 % 540) / 9, Math.floor(i / 4 / 540) / 60);
        const v = r() * 0.6 + fib * 0.4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 60; im.data[i + 3] = v * 22;
      }
      g.putImageData(im, 0, 0);
    }
    ctx.save(); ctx.globalAlpha = 0.5; ctx.drawImage(grano, 0, 0, E.marca.W, E.marca.H); ctx.restore();
  };

  // ---------- texto en pantalla ----------
  // Marcado: [r]...[/r] = rojo de marca. Una línea = string. Encoge si no cabe en el ancho seguro.
  function segmentos(linea) {
    const out = []; const re = /\[r\](.*?)\[\/r\]/g; let k = 0, m;
    while ((m = re.exec(linea))) { if (m.index > k) out.push({ s: linea.slice(k, m.index), rojo: false }); out.push({ s: m[1], rojo: true }); k = re.lastIndex; }
    if (k < linea.length) out.push({ s: linea.slice(k), rojo: false });
    return out;
  }
  E.texto = function (ctx, o) {
    const M = E.marca, Z = M.zona;
    const lineas = Array.isArray(o.lineas) ? o.lineas : [o.lineas];
    const peso = o.peso || 900, alto = o.interlinea || 1.18, maxW = o.maxW || Z.der - Z.izq;
    const color = o.color || M.color.tinta, rojo = o.rojo || M.color.rojo;
    const sizes = lineas.map((l, i) => (Array.isArray(o.size) ? o.size[i] : o.size) || 84);
    // ajustar tamaños para que quepan
    const medidas = lineas.map((l, i) => {
      let s = sizes[i];
      for (;;) { ctx.font = `${peso} ${s}px ${M.fuente.titulo}`; const w = ctx.measureText(l.replace(/\[\/?r\]/g, '')).width;
        if (w <= maxW || s <= M.textoMin) return { s, w }; s -= 2; }
    });
    let y = o.y; const a = o.alpha == null ? 1 : o.alpha;
    ctx.save(); ctx.globalAlpha *= a; ctx.textBaseline = 'alphabetic';
    if (o.sombra) { ctx.shadowColor = o.sombra; ctx.shadowBlur = 18; }
    lineas.forEach((l, i) => {
      const { s, w } = medidas[i]; ctx.font = `${peso} ${s}px ${M.fuente.titulo}`;
      y += s * (i === 0 ? 0.82 : alto);
      let x = o.align === 'left' ? o.x : (o.x == null ? M.W / 2 : o.x) - w / 2;
      for (const sg of segmentos(l)) { ctx.fillStyle = sg.rojo ? rojo : color; ctx.fillText(sg.s, x, y); x += ctx.measureText(sg.s).width; }
      if (E.debugZona && (y - s * 0.82 < Z.arriba || y + s * 0.25 > Z.abajo)) console.warn('Texto fuera de zona segura:', l);
    });
    ctx.restore();
    return y; // línea base de la última línea
  };
  // Tarjeta de texto animada: entra (fade + subida) en t0, sale en t1 (si se da).
  E.tarjeta = function (ctx, t, o) {
    const U2 = U, dur = o.entrada || 0.25;
    const pin = U2.easeOut(U2.prog(t, o.t0, o.t0 + dur));
    const pout = o.t1 == null ? 0 : U2.prog(t, o.t1 - (o.salida || 0.2), o.t1);
    const a = pin * (1 - pout); if (a <= 0) return;
    E.texto(ctx, Object.assign({}, o, { alpha: a, y: o.y + (1 - pin) * 30 - pout * 20 }));
  };

  // Guía visual de la zona segura (solo para depurar: ?zona en la URL)
  E.dibujarZona = function (ctx) {
    const Z = E.marca.zona; ctx.save(); ctx.fillStyle = 'rgba(255,0,0,0.12)';
    ctx.fillRect(0, 0, E.marca.W, Z.arriba); ctx.fillRect(0, Z.abajo, E.marca.W, E.marca.H - Z.abajo); ctx.restore();
  };
  if (location.search.includes('zona')) E.debugZona = true;
})();
