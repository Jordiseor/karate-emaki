// KARATE EMAKI · elementos de diagrama de FÍSICA (centro de masas, base de apoyo, ángulo de vuelco, empujes).
// Requiere marca.js, personaje/karateka.js y personaje/karateka-frontal.js. Namespace: EMAKI.fisica
//
// Modelo: adulto de 1,70 m. Escala del dibujo: PPM = px por metro con escala 1 (figura de ≈756 px -> 444,7 px/m).
// Pie = 0,26 m (15 % de la estatura). Convenio de ángulos: respecto a la vertical, + = hacia delante (hacia donde mira la figura).
//
// Resumen de la API (todas las funciones dibujan en ctx; ver animacion/README.md):
//   figura(ctx, pose|nombre, {x,suelo,escala,dir,cinturon,estilo,alpha,modelo})  -> geometría g
//   geometria(pose|nombre, opts)                  -> g sin dibujar:  g.base{x0,x1}, g.pivote, g.cdm, g.vuelco (°), g.pie (px), g.talon/g.punta...
//   poseAltura(f)                                  -> {pose, modelo} entre P2 (f=0) y P3 (f=1) con los PIES QUIETOS
//   centroMasas(ctx, p, {suelo, prog, ...})        punto rojo + vertical discontinua que cae a plomo
//   baseApoyo(ctx, {x0,x1,suelo, celdas, alerta...}) barra de base bajo los pies (en celdas de "pie")
//   arco(ctx, pivote, {desde,hasta,texto,prog...}) arco rojo de ángulo con su cifra
//   flecha(ctx, {x,y,ang,largo,vibra,prog...})     flecha roja de empuje (también flechitas)
//   inclinar(ctx, pivote, grados, dir, fn)         gira fn() como bloque rígido alrededor de la punta del pie
//   girarPunto(p, pivote, grados, dir)             posición de un punto tras esa rotación
//   giroCamara(ctx, p, fnPerfil, fnFrontal, {x})   giro de cámara de 90° (perfil <-> frontal)
//   cara(ctx, centro, r, {expresion})              cara mínima ('reto' | 'cejas' | 'neutra')
//   etiqueta(ctx, {texto,x,y,hacia,...})           rótulo corto con flechita al punto
//   nota(ctx, alpha)                               letra pequeña fija «Modelo simplificado…»
//   parpadeo(t, t0, hz)                            true/false deterministas para la alerta
(function () {
  const E = window.EMAKI, U = E.util, C = E.marca.color, K = E.karateka;
  const F = (E.fisica = {});
  const D2R = Math.PI / 180;

  // ---------- escala ----------
  const M = K.medidas;
  const alturaPx = 235 + 22 + M.cabezaR * 0.95 + M.cabezaR + 405 + (M.contorno + 10); // suelo -> lo alto de la cabeza con las piernas rectas (≈756)
  F.ESTATURA = 1.7; F.PIE_M = 0.26;
  F.PPM = alturaPx / F.ESTATURA;                  // px por metro a escala 1
  F.PIE = F.PIE_M * F.PPM;                        // 1 pie en px a escala 1 (≈115,6)
  const CAP = 13;                                 // el pie se dibuja con trazo de 26 px y puntas redondas: 13 px a cada lado

  // ---------- poses y modelo ----------
  const poseDe = (p) => (typeof p === 'string' ? K.poses[p] : p);
  const modeloDe = (p, o) => (o && o.modelo) || (typeof p === 'string' && window.EMAKI_POSES && window.EMAKI_POSES[p] && window.EMAKI_POSES[p].modelo) || { alturaCdM_m: 0.9, reparto: 0.5 };
  F.poseFrontal = (n) => ((window.EMAKI_POSES || {})[n] || {}).angulos;

  // Pone temporalmente el pie al tamaño del modelo (0,26 m entre extremos dibujados) y ejecuta fn.
  function conPie(fn) { const old = M.pie; M.pie = F.PIE - 2 * CAP; try { return fn(); } finally { M.pie = old; } }

  // Geometría en pantalla de una pose de perfil (misma transformación que K.dibujar).
  // Opción anclaPunta (x en pantalla): mueve la figura para que la PUNTA del pie delantero quede ahí, así los pies no se deslizan al cambiar de pose.
  F.geometria = function (pose, o = {}) {
    if (o.anclaPunta != null) { const g0 = F.geometria(pose, Object.assign({}, o, { anclaPunta: null })); return F.geometria(pose, Object.assign({}, o, { anclaPunta: null, x: (o.x == null ? 540 : o.x) + (o.anclaPunta - g0.pivote[0]) })); }
    const P = poseDe(pose), mod = modeloDe(pose, o), s = o.escala || 1, dir = o.dir || 1;
    const x0 = o.x == null ? 540 : o.x, suelo = o.suelo == null ? 1450 : o.suelo;
    return conPie(() => {
      const sk = K.esqueleto(P);
      const yMax = Math.max(sk.pC.tob[1], sk.pL.tob[1], sk.pC.punta[1], sk.pL.punta[1]) + M.contorno + 10;
      const T = (p) => [x0 + dir * p[0] * s, suelo + (p[1] - yMax + (sk.P.caderaY || 0)) * s];
      const pie = (pp) => ({ talon: pp.tob[0] * s - CAP * s, punta: pp.punta[0] * s + CAP * s, tobillo: pp.tob[0] * s }); // en "u" (px hacia delante desde x0)
      const a = pie(sk.pC), b = pie(sk.pL);
      const unico = Math.abs(a.tobillo - b.tobillo) < 2;
      const tras = a.tobillo <= b.tobillo ? a : b, del = a.tobillo <= b.tobillo ? b : a;
      const u0 = Math.min(a.talon, b.talon), u1 = Math.max(a.punta, b.punta);
      const px = (u) => x0 + dir * u;
      const piePx = F.PIE * s;
      const cr = tras.talon + piePx / 2, cf = del.talon + piePx / 2;       // centros de apoyo de cada pie
      const uCdm = unico ? (u0 + u1) / 2 : cr + (mod.reparto == null ? 0.6 : mod.reparto) * (cf - cr);
      const hCdm = mod.alturaCdM_m * F.PPM * s;
      const g = { x: x0, suelo, escala: s, dir, pie: piePx, ppm: F.PPM * s,
        base: { x0: Math.min(px(u0), px(u1)), x1: Math.max(px(u0), px(u1)) }, baseM: (u1 - u0) / (F.PPM * s),
        talonTrasero: [px(u0), suelo], punta: [px(u1), suelo], pivote: [px(u1), suelo],
        cdm: [px(uCdm), suelo - hCdm], alturaCdM: hCdm, dxVuelco: u1 - uCdm,
        cadera: T(sk.cad), cabeza: T(sk.cabeza), hombro: T(sk.hombro), alturaCadera_m: (suelo - T(sk.cad)[1]) / (F.PPM * s) };
      g.vuelco = Math.atan2(g.dxVuelco, hCdm) / D2R;            // ángulo de vuelco hacia delante (°) = arctan(distancia al borde / altura del CdM)
      return g;
    });
  };

  // Dibuja la figura de perfil con el pie del modelo y devuelve la geometría.
  F.figura = function (ctx, pose, o = {}) {
    const P = poseDe(pose), g = F.geometria(pose, o);
    conPie(() => K.dibujar(ctx, P, Object.assign({}, o, { x: g.x })));
    return g;
  };

  // Pose intermedia P2 -> P3 (f 0..1) con los pies QUIETOS (cinemática inversa): la cadera baja, la espinilla se inclina, la pierna trasera sigue recta.
  F.poseAltura = function (f, desde = 'zenkutsu-alto', hasta = 'zenkutsu-bajo') {
    const A = K.poses[desde], B = K.poses[hasta], t = M.muslo, st = M.tibia, L = t + st;
    const yS = (a, b) => t * Math.cos(a * D2R) + st * Math.cos(b * D2R);
    const D = (a, b) => t * Math.sin(a * D2R) + st * Math.sin(b * D2R) + L * Math.sin(Math.acos(U.clamp(yS(a, b) / L, -1, 1)));
    const bA = A.caderaCerca - A.rodillaCerca, bB = B.caderaCerca - B.rodillaCerca;
    const yT = U.lerp(yS(A.caderaCerca, bA), yS(B.caderaCerca, bB), f), Dt = D(A.caderaCerca, bA);
    const aDe = (b) => { let lo = 0, hi = 110; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (yS(m, b) > yT) lo = m; else hi = m; } return (lo + hi) / 2; };
    let lo = Math.min(bA, bB) - 15, hi = Math.max(bA, bB) + 15;   // D crece con b (hacia 0)
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (D(aDe(m), m) < Dt) lo = m; else hi = m; }
    const b = (lo + hi) / 2, a = aDe(b);
    const pose = K.mezclar(A, B, f); pose.caderaCerca = a; pose.rodillaCerca = a - b; pose.caderaLejos = 'auto';
    const mA = modeloDe(desde), mB = modeloDe(hasta);
    return { pose, modelo: Object.assign({}, mA, { alturaCdM_m: U.lerp(mA.alturaCdM_m, mB.alturaCdM_m, f) }) };
  };

  // ---------- giro rígido ----------
  F.inclinar = function (ctx, pivote, grados, dir, fn) {
    ctx.save(); ctx.translate(pivote[0], pivote[1]); ctx.rotate((dir || 1) * grados * D2R); ctx.translate(-pivote[0], -pivote[1]);
    try { fn(); } finally { ctx.restore(); }
  };
  F.girarPunto = function (p, pivote, grados, dir) {
    const a = (dir || 1) * grados * D2R, c = Math.cos(a), s = Math.sin(a), dx = p[0] - pivote[0], dy = p[1] - pivote[1];
    return [pivote[0] + dx * c - dy * s, pivote[1] + dx * s + dy * c];
  };

  // ---------- punto rojo (centro de masas) ----------
  // p = [x,y]. o: suelo (y donde acaba la vertical), prog (0..1 caída de la vertical, con rebote), punto (0..1 aparición), r (15 -> 30 px), alpha, vertical (false la oculta)
  F.centroMasas = function (ctx, p, o = {}) {
    const rojo = C.rojo, r = o.r || 15, pun = o.punto == null ? 1 : o.punto, a = o.alpha == null ? 1 : o.alpha;
    ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
    const prog = o.prog == null ? 1 : o.prog;
    if (o.vertical !== false && o.suelo != null && prog > 0) {
      const Ltot = o.suelo - p[1]; let f;
      if (o.rebote === false) f = prog; else if (prog < 0.8) f = Math.pow(prog / 0.8, 2); else f = 1 - 0.07 * Math.sin(Math.PI * (prog - 0.8) / 0.2) * (1 - (prog - 0.8) / 0.2);
      const yEnd = p[1] + Ltot * f;
      ctx.strokeStyle = rojo; ctx.lineWidth = o.grosor || 6; ctx.setLineDash([22, 14]); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], yEnd); ctx.stroke(); ctx.setLineDash([]);
      if (prog > 0.8) { ctx.fillStyle = rojo; ctx.beginPath(); ctx.arc(p[0], o.suelo, 9, 0, Math.PI * 2); ctx.fill(); } // marca de contacto
    }
    const rr = r * U.easeBack(U.clamp(pun)) ;
    if (pun > 0) { ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(0.1, rr), 0, Math.PI * 2); ctx.fillStyle = rojo; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
  };

  // ---------- base de apoyo ----------
  F.parpadeo = (t, t0, hz = 5) => t >= t0 && Math.floor((t - t0) * hz * 2) % 2 === 0;
  // o: x0,x1,suelo ; grosor (18) ; celdas (n marcas de pie: la barra se parte en n tramos) ; rojo (true) ; alerta:{t,t0,dur,hz} parpadea y se queda roja ; alpha ; prog (crecimiento desde x0)
  F.baseApoyo = function (ctx, o) {
    const gr = o.grosor || 18, y = o.suelo + 10, a = o.alpha == null ? 1 : o.alpha;
    let rojo = !!o.rojo;
    if (o.alerta) { const al = o.alerta, hz = al.hz || 5, d = al.dur == null ? 0.6 : al.dur; if (al.t >= al.t0) rojo = al.t < al.t0 + d ? F.parpadeo(al.t, al.t0, hz) : true; }
    const col = rojo ? C.rojo : C.tinta, prog = o.prog == null ? 1 : o.prog;
    const x0 = o.x0, x1 = o.x0 + (o.x1 - o.x0) * prog, w = x1 - x0;
    ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
    const rect = (xa, xb) => { const r = gr / 2; ctx.beginPath(); ctx.roundRect(xa, y, Math.max(1, xb - xa), gr, r); ctx.fill(); };
    if (o.celdas && w > 0) {
      const n = o.celdas, cw = w / n, hueco = 7;
      for (let i = 0; i < n; i++) rect(x0 + i * cw + (i ? hueco / 2 : 0), x0 + (i + 1) * cw - (i < n - 1 ? hueco / 2 : 0));
    } else rect(x0, x1);
    // topes verticales (extremos de la base): delimitan el rectángulo
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y - 26); ctx.lineTo(x0, y + gr + 8); ctx.moveTo(x1, y - 26); ctx.lineTo(x1, y + gr + 8); ctx.stroke();
    ctx.restore();
    return { x0, x1, y };
  };

  // ---------- arco de ángulo ----------
  // pivote = punta del pie delantero. o: desde, hasta (° respecto a la vertical, + = delante) ; radio (320) ; prog (0..1) ; texto ('≈26°') ; dir ; color ; alpha ;
  // ejes (true: dibuja los dos radios finos) ; size (cifra, 72) ; cifra (true) ; gris (true: versión "fantasma" gris para comparar)
  F.arco = function (ctx, pivote, o) {
    const dir = o.dir || 1, R = o.radio || 320, prog = o.prog == null ? 1 : o.prog, col = o.gris ? C.gris : (o.color || C.rojo), a = o.alpha == null ? 1 : o.alpha;
    const A0 = o.desde, A1 = o.desde + (o.hasta - o.desde) * prog, ang = (A) => -Math.PI / 2 + dir * A * D2R;
    ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.strokeStyle = col;
    if (o.ejes !== false) { ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
      [A0, A1].forEach((A) => { ctx.beginPath(); ctx.moveTo(pivote[0], pivote[1]); ctx.lineTo(pivote[0] + Math.cos(ang(A)) * (R + 50), pivote[1] + Math.sin(ang(A)) * (R + 50)); ctx.stroke(); });
      ctx.setLineDash([]); }
    if (Math.abs(A1 - A0) > 0.05) { ctx.lineWidth = o.grosor || 11; ctx.beginPath(); ctx.arc(pivote[0], pivote[1], R, ang(A0), ang(A1), (A1 - A0) * dir < 0); ctx.stroke(); }
    ctx.restore();
    if (o.texto && o.cifra !== false) {
      const am = (o.desde + o.hasta) / 2, rr = R + (o.separacion == null ? 85 : o.separacion);
      const cx = pivote[0] + Math.cos(ang(am)) * rr + (o.dx || 0), cy = pivote[1] + Math.sin(ang(am)) * rr + (o.dy || 0), sz = o.size || 72;
      E.texto(ctx, { lineas: o.texto, size: sz, x: cx, y: cy - sz * 0.45, color: col, rojo: col, alpha: a * U.clamp(prog * 3), align: o.align, sombra: C.papel });
    }
  };

  // ---------- flecha de empuje ----------
  // o: x,y = PUNTA de la flecha ; ang (° canvas: 0 = →, 90 = ↓, 180 = ←, −90 = ↑) ; largo (240) ; grosor (26) ; prog (crece desde la cola) ; vibra (px) + t ; alpha ; color
  F.flecha = function (ctx, o) {
    const ang = (o.ang || 0) * D2R, dx = Math.cos(ang), dy = Math.sin(ang), g = o.grosor || 26, prog = o.prog == null ? 1 : o.prog, col = o.color || C.rojo;
    const v = o.vibra ? Math.sin((o.t || 0) * 2 * Math.PI * 11) * o.vibra : 0, L = (o.largo || 240) * prog;
    if (L <= 1) return;
    const tx = o.x + dx * v, ty = o.y + dy * v, cab = Math.min(g * 2.4, L), bx = tx - dx * cab, by = ty - dy * cab, cx = tx - dx * L, cy = ty - dy * L;
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round';
    ctx.lineWidth = g; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx + dx * 4, by + dy * 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx - dy * g * 1.5, by + dx * g * 1.5); ctx.lineTo(bx + dy * g * 1.5, by - dx * g * 1.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  // ---------- rótulo con flechita ----------
  // o: texto, x,y (esquina sup. del texto, centrado en x) , hacia:[px,py] (punto al que señala), size (48), alpha
  F.etiqueta = function (ctx, o) {
    const a = o.alpha == null ? 1 : o.alpha, sz = o.size || 48;
    E.texto(ctx, { lineas: o.texto, size: sz, peso: 900, x: o.x, y: o.y, alpha: a, color: o.color });
    if (o.hacia) {
      ctx.save(); ctx.globalAlpha *= a; const bx = o.x + (o.desdeDx || 0), by = o.y + sz * 1.35;
      const ang = Math.atan2(o.hacia[1] - by, o.hacia[0] - bx), len = Math.hypot(o.hacia[0] - bx, o.hacia[1] - by) - (o.margen == null ? 26 : o.margen);
      F.flecha(ctx, { x: bx + Math.cos(ang) * len, y: by + Math.sin(ang) * len, ang: ang / D2R, largo: len, grosor: 7, color: o.colorFlecha || C.tinta, alpha: 1 });
      ctx.restore();
    }
  };

  // ---------- giro de cámara perfil <-> frontal ----------
  // p 0..1 (ya suavizado). fnPerfil() y fnFrontal() dibujan cada vista con su origen en x. Se comprime el ancho como una figura que gira (cos).
  F.giroCamara = function (ctx, p, fnPerfil, fnFrontal, o = {}) {
    const x = o.x == null ? 540 : o.x, mitad = p < 0.5, sx = Math.max(0.03, Math.abs(Math.cos(p * Math.PI)));
    ctx.save(); ctx.translate(x, 0); ctx.scale(sx, 1); ctx.translate(-x, 0); (mitad ? fnPerfil : fnFrontal)(); ctx.restore();
  };

  // ---------- cara mínima ----------
  // Para P1 "mirando a cámara" (reto) y la frontal final (cejas levantadas). c = centro de la cabeza, r = radio de la cabeza (40·escala).
  F.cara = function (ctx, c, r, o = {}) {
    const ex = o.expresion || 'neutra', k = r / 40, tinta = C.tinta, dx = (o.dx || 0) * k, dy = (o.dy || 0) * k;
    ctx.save(); ctx.translate(c[0] + dx, c[1] + dy); ctx.strokeStyle = tinta; ctx.fillStyle = tinta; ctx.lineCap = 'round'; ctx.lineWidth = 4 * k;
    const ojo = (x, ry) => { ctx.beginPath(); ctx.ellipse(x * k, -2 * k, 3.6 * k, ry * k, 0, 0, Math.PI * 2); ctx.fill(); };
    if (ex === 'reto') { ojo(-13, 4.6); ojo(13, 4.6);
      ctx.beginPath(); ctx.moveTo(-22 * k, -13 * k); ctx.lineTo(-6 * k, -9 * k); ctx.stroke();            // ceja izquierda baja (reto)
      ctx.beginPath(); ctx.moveTo(6 * k, -17 * k); ctx.lineTo(22 * k, -15 * k); ctx.stroke();             // ceja derecha algo alta
      ctx.beginPath(); ctx.moveTo(-9 * k, 14 * k); ctx.quadraticCurveTo(4 * k, 20 * k, 14 * k, 9 * k); ctx.stroke(); } // media sonrisa
    else if (ex === 'cejas') { ojo(-13, 5.4); ojo(13, 5.4);
      ctx.beginPath(); ctx.arc(-13 * k, -12 * k, 11 * k, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();    // cejas arqueadas y altas
      ctx.beginPath(); ctx.arc(13 * k, -12 * k, 11 * k, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 15 * k, 3.6 * k, 0, Math.PI * 2); ctx.stroke(); }                         // boca pequeña "o"
    else { ojo(-13, 4); ojo(13, 4); ctx.beginPath(); ctx.moveTo(-7 * k, 14 * k); ctx.lineTo(7 * k, 14 * k); ctx.stroke(); }
    ctx.restore();
  };

  // ---------- letra pequeña fija ----------
  F.nota = function (ctx, alpha = 1, y = 1500) {
    E.texto(ctx, { lineas: 'Modelo simplificado: cuerpo rígido, adulto de 1,70 m', size: 37, peso: 500, y, alpha: 0.7 * alpha, maxW: 940 });
  };
})();
