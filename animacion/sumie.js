// KARATE EMAKI · sumi-e simplificado: pincelada, kanji a pincel, pinos, olas, casa japonesa,
// siluetas de tinta (Funakoshi solo como silueta plana sin rostro). Requiere marca.js.
(function () {
  const E = window.EMAKI, U = E.util, C = E.marca.color;
  const S = (E.sumie = {});

  // ---------- geometría ----------
  // Catmull-Rom → polilínea densa (paso ~px)
  S.suavizar = function (pts, paso = 4) {
    if (pts.length < 3) return pts.slice();
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / paso));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  };
  S.longitudes = function (pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };
  // recorta una polilínea a la fracción f de su longitud
  S.recortar = function (pts, f) {
    if (f >= 1) return pts; if (f <= 0) return [pts[0]];
    const L = S.longitudes(pts), obj = L[L.length - 1] * f, out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (L[i] >= obj) { const k = (obj - L[i - 1]) / (L[i] - L[i - 1] || 1); out.push([U.lerp(pts[i - 1][0], pts[i][0], k), U.lerp(pts[i - 1][1], pts[i][1], k)]); break; }
      out.push(pts[i]);
    }
    return out;
  };
  // línea simple (tinta) por fracción, con opción discontinua
  S.linea = function (ctx, pts, o = {}) {
    const q = S.recortar(pts, o.prog == null ? 1 : o.prog); if (q.length < 2) return;
    ctx.save(); ctx.strokeStyle = o.color || C.tinta; ctx.lineWidth = o.ancho || 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (const p of q) ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore();
  };

  // ---------- pincelada ----------
  // Trazo de pincel con grosor variable (entrada, cuerpo, cola afilada) y "kasure" (pincel seco).
  S.pincel = function (ctx, ptsCtrl, o = {}) {
    const w = o.ancho || 20, prog = o.prog == null ? 1 : o.prog; if (prog <= 0) return;
    const full = S.suavizar(ptsCtrl, 3), L = S.longitudes(full), Lt = L[L.length - 1] || 1;
    const lim = Lt * prog, r = U.rng(o.semilla || 1), fase = r() * 100;
    const tin = o.entrada == null ? 0.12 : o.entrada, tout = o.cola == null ? 0.35 : o.cola;
    const izq = [], der = [];
    for (let i = 0; i < full.length && L[i] <= lim + 0.01; i++) {
      const s = L[i] / Lt, a = full[Math.max(0, i - 1)], b = full[Math.min(full.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      let p = 1; if (s < tin) p = 0.35 + 0.65 * U.easeOut(s / tin); if (s > 1 - tout) p *= Math.pow((1 - s) / tout, 0.7);
      p *= o.presion ? o.presion(s) : 1;
      p *= 0.88 + 0.24 * U.ruido2(fase + L[i] / 40, 3.3);
      const hw = Math.max(0.6, (w / 2) * p);
      izq.push([full[i][0] + nx * hw, full[i][1] + ny * hw]); der.push([full[i][0] - nx * hw, full[i][1] - ny * hw, hw]);
    }
    if (izq.length < 2) return;
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.fillStyle = o.color || C.tinta;
    if (o.sangrado) { ctx.shadowColor = o.color || C.tinta; ctx.shadowBlur = o.sangrado; }
    ctx.beginPath(); ctx.moveTo(izq[0][0], izq[0][1]); for (const p of izq) ctx.lineTo(p[0], p[1]);
    for (let i = der.length - 1; i >= 0; i--) ctx.lineTo(der[i][0], der[i][1]); ctx.closePath(); ctx.fill();
    // cabeza redonda del pincel mientras se traza
    const ult = full[Math.min(izq.length - 1, full.length - 1)], hwU = der[der.length - 1][2];
    if (prog < 1) { ctx.beginPath(); ctx.arc(ult[0], ult[1], hwU, 0, Math.PI * 2); ctx.fill(); }
    ctx.shadowBlur = 0;
    // kasure: vetas de papel dentro del trazo, más hacia el final
    const seco = o.seco == null ? 0.35 : o.seco;
    if (seco > 0 && w > 8) {
      ctx.strokeStyle = o.papel || C.papel; ctx.lineCap = 'round';
      const nV = Math.round(3 + w / 10);
      for (let v = 0; v < nV; v++) {
        const off = (r() * 2 - 1) * 0.8, desde = 0.35 + r() * 0.4;
        ctx.lineWidth = 0.8 + r() * w * 0.06; ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * seco * (0.4 + r() * 0.6);
        ctx.beginPath(); let abierto = false;
        for (let i = 0; i < izq.length; i++) {
          const s = L[i] / Lt; const on = s > desde && U.ruido2(v * 7.1 + L[i] / 25, fase) > 0.45;
          const x = U.lerp(der[i][0], izq[i][0], 0.5 + off / 2), y = U.lerp(der[i][1], izq[i][1], 0.5 + off / 2);
          if (on) { if (!abierto) { ctx.moveTo(x, y); abierto = true; } else ctx.lineTo(x, y); } else abierto = false;
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // ---------- aguada (mancha de tinta diluida) ----------
  S.aguada = function (ctx, x, y, rx, ry, o = {}) {
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 0.25 : o.alpha;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 1); g.addColorStop(0, o.color || C.tinta); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.translate(x, y); ctx.scale(rx, ry); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  // montañas lejanas de aguada
  S.montes = function (ctx, yBase, o = {}) {
    const r = U.rng(o.semilla || 3), W = E.marca.W;
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 0.18 : o.alpha; ctx.fillStyle = o.color || C.tinta;
    ctx.beginPath(); ctx.moveTo(0, yBase);
    for (let x = 0; x <= W; x += 10) ctx.lineTo(x, yBase - (o.alto || 160) * U.fbm(x / 260 + (o.semilla || 3), 0.5) * 1.6);
    ctx.lineTo(W, yBase + 400); ctx.lineTo(0, yBase + 400); ctx.closePath();
    const g = ctx.createLinearGradient(0, yBase - 250, 0, yBase + 120); g.addColorStop(0, o.color || C.tinta); g.addColorStop(1, 'rgba(26,26,26,0)');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
  };

  // ---------- kanji a pincel ----------
  // Texto CJK que se "pinta" carácter a carácter (barrido de arriba abajo con borde blando).
  const cacheK = {};
  S.kanji = function (ctx, txt, x, y, size, o = {}) {
    const prog = o.prog == null ? 1 : o.prog, vertical = o.vertical, n = [...txt].length;
    const chars = [...txt], color = o.color || C.rojo, font = `900 ${size}px ${E.marca.fuente.kanjiPincel}`;
    const paso = o.separacion || size * 1.02;
    chars.forEach((ch, i) => {
      const pi = U.clamp(prog * n - i); if (pi <= 0) return;
      const cx = vertical ? x : x + (i - (n - 1) / 2) * paso, cy = vertical ? y + (i - (n - 1) / 2) * paso : y;
      const key = ch + size + color + (o.sangrado || 0);
      let g = cacheK[key];
      if (!g) { // glifo con un poco de sangrado de tinta y textura
        g = document.createElement('canvas'); g.width = g.height = Math.ceil(size * 1.4); const gx = g.getContext('2d');
        gx.font = font; gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.fillStyle = color;
        gx.shadowColor = color; gx.shadowBlur = o.sangrado == null ? size * 0.012 : o.sangrado;
        gx.fillText(ch, g.width / 2, g.height / 2 + size * 0.04);
        // textura: pequeñas vetas claras
        gx.globalCompositeOperation = 'destination-out'; const r = U.rng(ch.charCodeAt(0));
        for (let k = 0; k < 90; k++) { gx.globalAlpha = 0.08 + r() * 0.12; gx.fillRect(r() * g.width, r() * g.height, 1 + r() * size * 0.12, 1 + r() * 2); }
        cacheK[key] = g;
      }
      ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
      if (o.halo) { // halo de papel para que el kanji se lea sobre el dibujo
        const hk = 'h' + ch + size; let h = cacheK[hk];
        if (!h) { h = document.createElement('canvas'); h.width = h.height = Math.ceil(size * 1.4); const hx = h.getContext('2d');
          hx.font = font; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillStyle = E.marca.color.papel; hx.strokeStyle = E.marca.color.papel;
          hx.lineWidth = size * 0.07; hx.lineJoin = 'round'; hx.shadowColor = E.marca.color.papel; hx.shadowBlur = size * 0.08;
          for (let k = 0; k < 3; k++) { hx.strokeText(ch, h.width / 2, h.height / 2 + size * 0.04); hx.fillText(ch, h.width / 2, h.height / 2 + size * 0.04); }
          cacheK[hk] = h; }
        ctx.save(); ctx.globalAlpha *= U.clamp(pi * 1.5) * (o.halo === true ? 0.9 : o.halo); ctx.drawImage(h, cx - h.width / 2, cy - h.height / 2); ctx.restore();
      }
      if (pi >= 1) { ctx.drawImage(g, cx - g.width / 2, cy - g.height / 2); ctx.restore(); return; }
      // máscara de barrido diagonal (arriba-izquierda → abajo-derecha) con borde blando
      const m = S._tmp || (S._tmp = document.createElement('canvas')); m.width = g.width; m.height = g.height;
      const mx = m.getContext('2d'); mx.clearRect(0, 0, m.width, m.height); mx.drawImage(g, 0, 0);
      const ang = 1.2, dx = Math.cos(ang), dy = Math.sin(ang), ext = m.width * 1.2;
      const c0 = [m.width / 2 - dx * ext / 2, m.height / 2 - dy * ext / 2], c1 = [m.width / 2 + dx * ext / 2, m.height / 2 + dy * ext / 2];
      const gr = mx.createLinearGradient(c0[0], c0[1], c1[0], c1[1]), e = U.easeInOut(pi), b = 0.08;
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(U.clamp(e * (1 + b) - b), 'rgba(0,0,0,1)');
      gr.addColorStop(U.clamp(e * (1 + b)), 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      mx.globalCompositeOperation = 'destination-in'; mx.fillStyle = gr; mx.fillRect(0, 0, m.width, m.height);
      ctx.drawImage(m, cx - g.width / 2, cy - g.height / 2); ctx.restore();
    });
  };

  // ---------- pino sumi-e ----------
  // x,y = pie del tronco; alto en px; t = tiempo (para el balanceo). Devuelve centros de copas.
  S.pino = function (ctx, x, y, alto, o = {}) {
    const r = U.rng(o.semilla || 11), t = o.t || 0, sway = o.balanceo == null ? 1 : o.balanceo, lado = o.inclina || (r() < 0.5 ? -1 : 1);
    const a = o.alpha == null ? 1 : o.alpha, prog = o.prog == null ? 1 : o.prog;
    // tronco: curva en S
    const tr = [];
    for (let k = 0; k <= 6; k++) { const s = k / 6; tr.push([x + lado * alto * 0.18 * Math.sin(s * 2.4) + (r() - 0.5) * 14 + Math.sin(t * 1.3) * sway * 6 * s * s, y - alto * s]); }
    S.pincel(ctx, tr, { ancho: alto * 0.055, cola: 0.25, entrada: 0.02, semilla: (o.semilla || 11) + 1, alpha: a, prog: U.clamp(prog * 2), seco: 0.5 });
    const copas = [];
    const nRamas = o.ramas || 5;
    for (let k = 0; k < nRamas; k++) {
      const s = 0.42 + (k / (nRamas - 1)) * 0.56, i = Math.min(5, Math.floor(s * 6)), f = s * 6 - i;
      const bx = U.lerp(tr[i][0], tr[i + 1] ? tr[i + 1][0] : tr[i][0], f), by = y - alto * s;
      const dir = k % 2 === 0 ? 1 : -1, largo = alto * (0.42 - s * 0.25) * (0.8 + r() * 0.4);
      const fase = r() * 6, osc = Math.sin(t * 1.6 + fase) * sway;
      const ex = bx + dir * largo, ey = by - largo * 0.12 + osc * 8;
      S.pincel(ctx, [[bx, by], [U.lerp(bx, ex, 0.5), by - largo * 0.1 + osc * 3], [ex, ey]], { ancho: alto * 0.022, semilla: 30 + k, alpha: a, prog: U.clamp(prog * 2 - 0.6 - k * 0.05), seco: 0.3 });
      copas.push({ x: ex - dir * largo * 0.15, y: ey - 6, w: largo * 1.25, h: alto * 0.09, osc, dir });
    }
    copas.push({ x: tr[6][0], y: tr[6][1] - 4, w: alto * 0.3, h: alto * 0.09, osc: Math.sin(t * 1.4) * sway, dir: 1 });
    const pc = U.clamp(prog * 2 - 1);
    copas.forEach((c, k) => S.copa(ctx, c.x + c.osc * 10, c.y, c.w, c.h, { semilla: 100 + k + (o.semilla || 0), alpha: a * U.clamp(pc * 1.5 - k * 0.08), t }));
    return copas;
  };
  // copa de pino: nube plana + abanicos de agujas
  S.copa = function (ctx, x, y, w, h, o = {}) {
    if ((o.alpha || 0) <= 0 && o.alpha != null) return;
    const r = U.rng(o.semilla || 5), a = o.alpha == null ? 1 : o.alpha;
    S.aguada(ctx, x, y, w * 0.55, h * 0.8, { alpha: 0.22 * a });
    ctx.save(); ctx.strokeStyle = o.color || C.tinta; ctx.lineCap = 'round';
    const nAb = Math.max(3, Math.round(w / 40));
    for (let k = 0; k < nAb; k++) {
      const cx = x + (k / (nAb - 1) - 0.5) * w * 0.85, cy = y + (r() - 0.5) * h * 0.4, rad = h * (0.9 + r() * 0.5);
      for (let j = 0; j < 9; j++) {
        const ang = -Math.PI * (0.12 + 0.76 * j / 8) + (r() - 0.5) * 0.15;
        ctx.globalAlpha = a * (0.55 + r() * 0.4); ctx.lineWidth = 2 + r() * 2.5;
        ctx.beginPath(); ctx.moveTo(cx, cy + h * 0.25); ctx.lineTo(cx + Math.cos(ang) * rad * 1.3, cy + h * 0.25 + Math.sin(ang) * rad); ctx.stroke();
      }
    }
    ctx.restore();
  };

  // ---------- ola a pincel (cresta con rizo) ----------
  S.puntosOla = function (x, y, ancho, alto, rizo = 1) {
    const p = [];
    for (let k = 0; k <= 10; k++) { const s = k / 10; p.push([x + ancho * s, y - alto * Math.sin(Math.PI * Math.pow(s, 0.8))]); }
    // rizo al final (cae hacia delante)
    const fx = x + ancho, fy = y; const cx = x + ancho * 0.72, cy = y - alto * 0.95;
    const res = p.filter((q, i) => i <= 7);
    for (let k = 0; k <= 6; k++) { const ang = -Math.PI / 2 + (k / 6) * Math.PI * 1.3 * rizo; res.push([cx + Math.cos(ang) * alto * 0.35 + alto * 0.1, cy + alto * 0.35 + Math.sin(ang) * alto * 0.35]); }
    return res;
  };

  // ---------- casa japonesa (contorno) ----------
  // Unidades: ancho 1 = ancho del alero. Origen = centro de la base. Polilíneas en orden de dibujo.
  S.casaUnidad = [
    [[-0.5, 0], [0.5, 0]],                                   // base
    [[-0.40, 0], [-0.40, -0.40]], [[0.40, 0], [0.40, -0.40]], // pilares
    [[-0.13, 0], [-0.13, -0.25], [0.13, -0.25], [0.13, 0]],   // puerta
    [[-0.40, -0.40], [0.40, -0.40]],                          // dintel bajo alero
    [[-0.56, -0.47], [-0.5, -0.44], [0.5, -0.44], [0.56, -0.47]], // alero (puntas hacia arriba)
    [[-0.5, -0.44], [-0.36, -0.58], [-0.22, -0.72]],         // faldón izquierdo
    [[0.5, -0.44], [0.36, -0.58], [0.22, -0.72]],            // faldón derecho
    [[-0.27, -0.75], [-0.22, -0.72], [0.22, -0.72], [0.27, -0.75]], // cumbrera
  ];
  S.casaPuntos = function (cx, cy, ancho) { return S.casaUnidad.map((pl) => pl.map((p) => [cx + p[0] * ancho, cy + p[1] * ancho])); };
  // posición del rótulo sobre la puerta (en unidades): centro y tamaño
  S.casaRotulo = { x: 0, y: -0.325, w: 0.34, h: 0.1 };
  S.casa = function (ctx, cx, cy, ancho, o = {}) {
    const segs = S.casaPuntos(cx, cy, ancho), prog = o.prog == null ? 1 : o.prog;
    const lens = segs.map((s) => S.longitudes(s).pop()), tot = lens.reduce((a, b) => a + b, 0);
    let acc = 0;
    segs.forEach((s, i) => {
      const f = U.clamp((prog * tot - acc) / lens[i]); acc += lens[i]; if (f <= 0) return;
      if (o.pincel) S.pincel(ctx, S.recortar(s, f).length > 1 ? s : s, { prog: f, ancho: o.ancho || 10, semilla: 200 + i, color: o.color, alpha: o.alpha, cola: 0.15, entrada: 0.05, seco: o.seco == null ? 0.3 : o.seco });
      else S.linea(ctx, s, { prog: f, ancho: o.ancho || 6, color: o.color, alpha: o.alpha, dash: o.dash });
    });
  };

  // ---------- siluetas de tinta ----------
  // Funakoshi sentado en seiza escribiendo en una mesa baja. Silueta plana, sin rostro.
  // x,y = punto del suelo bajo las rodillas; mira a la derecha (dir=-1 para espejo). escribir: 0..1 fase del pincel.
  S.funakoshiSentado = function (ctx, x, y, s, o = {}) {
    const dir = o.dir || 1, ph = o.escribir || 0; ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.fillStyle = o.color || C.tinta; ctx.strokeStyle = o.color || C.tinta; ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    // mesa baja y papel
    ctx.fillRect(105, -78, 230, 12); ctx.fillRect(118, -66, 10, 66); ctx.fillRect(312, -66, 10, 66);
    ctx.fillStyle = o.papel || '#FBF8F1'; ctx.fillRect(150, -84, 150, 6); ctx.fillStyle = o.color || C.tinta;
    // cuerpo (kimono en seiza)
    ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(95, 0); ctx.quadraticCurveTo(110, -10, 98, -40); ctx.lineTo(30, -58);
    ctx.quadraticCurveTo(30, -150, 22, -215); ctx.quadraticCurveTo(0, -238, -30, -228); ctx.quadraticCurveTo(-58, -170, -66, -60);
    ctx.quadraticCurveTo(-70, -15, -52, 0); ctx.closePath(); ctx.fill();
    // cabeza y cuello
    ctx.beginPath(); ctx.ellipse(-2, -262, 31, 35, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-14, -240, 24, 22);
    // brazo de escribir (manga ancha) con pequeño movimiento
    const hx = 165 + Math.sin(ph * Math.PI * 2) * 22, hy = -112 + Math.cos(ph * Math.PI * 4) * 5;
    ctx.beginPath(); ctx.moveTo(-5, -215); ctx.quadraticCurveTo(40, -175, 70, -140); ctx.lineTo(hx - 8, hy - 6); ctx.lineTo(hx, hy + 8);
    ctx.lineTo(70, -112); ctx.quadraticCurveTo(45, -95, 25, -120); ctx.quadraticCurveTo(10, -150, -5, -170); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill();
    // pincel
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx - 2, hy - 30); ctx.lineTo(hx + 4, hy + 26); ctx.stroke();
    ctx.restore();
    return { punta: [x + dir * s * (hx + 4), y + s * (hy + 26)] };
  };
  // Funakoshi de pie (kimono y hakama), con un pincel grande. brazo: 0..1 sube el brazo; pincel: [dx,dy] objetivo opcional.
  S.funakoshiPie = function (ctx, x, y, s, o = {}) {
    const dir = o.dir || 1, br = o.brazo == null ? 0.5 : o.brazo; ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.fillStyle = o.color || C.tinta; ctx.strokeStyle = o.color || C.tinta; ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    // hakama
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-8, 0); ctx.lineTo(-2, -20); ctx.lineTo(6, 0); ctx.lineTo(72, 0);
    ctx.lineTo(42, -250); ctx.lineTo(-40, -250); ctx.closePath(); ctx.fill();
    // torso kimono
    ctx.beginPath(); ctx.moveTo(-44, -240); ctx.lineTo(44, -240); ctx.quadraticCurveTo(48, -360, 30, -415); ctx.quadraticCurveTo(0, -432, -32, -418);
    ctx.quadraticCurveTo(-55, -360, -44, -240); ctx.closePath(); ctx.fill();
    // brazo trasero con manga
    ctx.beginPath(); ctx.moveTo(-28, -405); ctx.quadraticCurveTo(-56, -320, -48, -250); ctx.lineTo(-20, -250); ctx.quadraticCurveTo(-18, -320, -10, -380); ctx.fill();
    // cabeza
    ctx.beginPath(); ctx.ellipse(2, -462, 33, 38, 0.05, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-12, -440, 24, 28);
    // brazo de escribir
    const ang = U.lerp(0.9, -0.2, br), ex = 20 + Math.cos(ang) * 95, ey = -400 + Math.sin(ang) * 95;
    const hx = ex + 85 + (o.mano ? o.mano[0] : 0), hy = ey - 10 + (o.mano ? o.mano[1] : 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(15, -398); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 20, ey - 10); ctx.quadraticCurveTo(ex - 10, ey + 60, ex + 30, ey + 40); ctx.lineTo(ex + 20, ey); ctx.fill(); // manga
    ctx.beginPath(); ctx.arc(hx, hy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(hx - 6, hy - 40); ctx.lineTo(hx + 8, hy + 45); ctx.stroke();
    ctx.restore();
    return { punta: [x + dir * s * (hx + 8), y + s * (hy + 45)] };
  };
})();
