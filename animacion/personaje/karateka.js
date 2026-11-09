// KARATE EMAKI · karateka esquemático 2D articulado (vista de perfil, mira a la derecha por defecto).
// Requiere animacion/marca.js. Uso:
//   const k = EMAKI.karateka;  const pose = k.mezclar(k.poses.kamae, k.poses.yoi, 0.3);
//   const j = k.dibujar(ctx, pose, { x: 540, suelo: 1450, escala: 0.8, cinturon: '#1A1A1A' });
//   j.nudo → [x,y] del nudo del cinturón; j.cabeza, j.manoCerca, j.manoLejos, j.pieCerca, j.pieLejos...
//
// CONVENIO DE ÁNGULOS (grados). "Delante" = hacia donde mira el karateka.
//   torso          inclinación del tronco respecto a la vertical (+ = hacia delante)
//   cuello         inclinación de la cabeza respecto al tronco
//   hombroX        ángulo del brazo respecto al eje del tronco hacia abajo (0 = colgando, 90 = horizontal delante, 180 = arriba)
//   codoX          flexión del codo (+ = el antebrazo gira hacia delante/arriba)
//   caderaX        ángulo del muslo respecto a la vertical hacia abajo (+ = delante, − = detrás)
//   rodillaX       flexión de la rodilla (+ = la tibia gira hacia atrás, como una rodilla real)
//   pieX           ángulo del pie respecto a la horizontal (0 = plano, + = punta arriba)
//   X ∈ {Cerca, Lejos}: "Cerca" es el lado que ve el espectador (el izquierdo del karateka cuando mira a la derecha).
//   caderaY        (opcional) bajada extra de la cadera en px de esqueleto; normalmente lo resuelve "apoyo".
// apoyo: 'ambos' (por defecto) apoya el pie más bajo en el suelo; la pierna lejana se estira o se resuelve
//        si su caderaLejos vale "auto" (pierna trasera recta que llega al suelo).
(function () {
  const E = window.EMAKI, U = E.util, C = E.marca.color;
  const K = (E.karateka = {});
  const D2R = Math.PI / 180;

  // Proporciones del esqueleto (px a escala 1; altura de pie ≈ 760 px)
  K.medidas = { cabezaR: 40, cuello: 22, torso: 235, hombroAncho: 0, brazo: 132, antebrazo: 120, puno: 19,
    muslo: 205, tibia: 200, pie: 72, anchoBrazo: 46, anchoAntebrazo: 40, anchoMuslo: 62, anchoTibia: 54, anchoTorso: 112, contorno: 6 };

  // dirección (unitaria) de un ángulo medido desde "abajo", + = delante (x+ si mira a la derecha)
  const dirAbajo = (a) => [Math.sin(a * D2R), Math.cos(a * D2R)];
  const dirArriba = (a) => [Math.sin(a * D2R), -Math.cos(a * D2R)];
  const mas = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];

  // Calcula las articulaciones en coordenadas de esqueleto (cadera en 0,0, y hacia abajo, mira a +x)
  K.esqueleto = function (pose) {
    const M = K.medidas, P = Object.assign({}, K.poses.yoi, pose);
    const cad = [0, 0], tor = P.torso;
    const hombro = mas(cad, dirArriba(tor), M.torso);
    const cuelloF = mas(hombro, dirArriba(tor + P.cuello), M.cuello);
    const cabeza = mas(cuelloF, dirArriba(tor + P.cuello), M.cabezaR * 0.95);
    const brazo = (lado) => {
      const aH = tor + P['hombro' + lado], codo = mas(hombro, dirAbajo(aH), M.brazo);
      const mano = mas(codo, dirAbajo(aH + P['codo' + lado]), M.antebrazo);
      return { codo, mano };
    };
    const pierna = (lado, angCad) => {
      const rod = mas(cad, dirAbajo(angCad), M.muslo);
      const tob = mas(rod, dirAbajo(angCad - P['rodilla' + lado]), M.tibia);
      const pa = P['pie' + lado] || 0, punta = [tob[0] + Math.cos(pa * D2R) * M.pie, tob[1] - Math.sin(pa * D2R) * M.pie];
      return { rod, tob, punta, ang: angCad };
    };
    const pC = pierna('Cerca', P.caderaCerca);
    let angL = P.caderaLejos;
    if (angL === 'auto') { // pierna trasera recta que apoya en el mismo suelo que la delantera
      const yS = Math.max(pC.tob[1], pC.punta[1]); const Lr = M.muslo + M.tibia;
      angL = -Math.acos(U.clamp(yS / Lr, -1, 1)) / D2R;
    }
    const pL = pierna('Lejos', angL);
    return { cad, hombro, cuelloF, cabeza, bC: brazo('Cerca'), bL: brazo('Lejos'), pC, pL, P };
  };

  // Mezcla lineal de dos poses (ángulos) con factor f
  K.mezclar = function (a, b, f) {
    const out = {}; const A = Object.assign({}, K.poses.yoi, a), B = Object.assign({}, K.poses.yoi, b);
    for (const k in A) {
      if (typeof A[k] === 'number' && typeof B[k] === 'number') out[k] = U.lerp(A[k], B[k], f);
      else out[k] = f < 0.5 ? A[k] : B[k];
    }
    return out;
  };

  // Dibuja el karateka. Opciones: x, suelo, escala, dir (1 derecha, −1 izquierda), cinturon, alpha,
  // estilo: 'gi' (por defecto: karategi blanco con contorno) | 'silueta' (tinta plana) | 'fantasma' (solo contorno discontinuo)
  K.dibujar = function (ctx, pose, o = {}) {
    const M = K.medidas, s = o.escala || 1, dir = o.dir || 1, sk = K.esqueleto(pose);
    const suelo = o.suelo == null ? 1450 : o.suelo, x0 = o.x == null ? 540 : o.x;
    const yMax = Math.max(sk.pC.tob[1], sk.pL.tob[1], sk.pC.punta[1], sk.pL.punta[1]) + M.contorno + 10;
    const T = (p) => [x0 + dir * p[0] * s, suelo + (p[1] - yMax + (sk.P.caderaY || 0)) * s];
    const estilo = o.estilo || 'gi', tinta = o.color || C.tinta, cint = o.cinturon || C.tinta;
    const ow = M.contorno * s * (o.grosorContorno || 1);
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (estilo === 'fantasma') ctx.setLineDash([16 * s, 12 * s]);

    const line = (A, B) => { ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); };
    const circ = (p, r, fill, stroke) => { const P = T(p); ctx.beginPath(); ctx.arc(P[0], P[1], r * s, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = ow; ctx.stroke(); } };
    const piel = estilo === 'silueta' ? tinta : (o.piel || C.gi), fondoLejos = estilo === 'silueta' ? tinta : C.giSombra;
    // Un miembro = lista de segmentos [a, b, ancho] (+ puño opcional). Primero todos los contornos, luego todos los rellenos:
    // así las articulaciones quedan limpias, sin costuras.
    const miembro = (segs, rel, puno) => {
      const pasadas = estilo === 'gi' ? [[tinta, ow * 2], [rel, 0]] : estilo === 'silueta' ? [[tinta, 0]] : [[tinta, ow * 2]];
      pasadas.forEach(([col, extra], k) => {
        ctx.strokeStyle = col;
        for (const [a, b, w] of segs) { ctx.lineWidth = w * s + extra; line(T(a), T(b)); }
        if (puno) { const P = T(puno); ctx.beginPath(); ctx.arc(P[0], P[1], M.puno * s + extra / 2, 0, Math.PI * 2);
          if (estilo === 'fantasma') { ctx.lineWidth = ow; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } }
      });
    };
    const pierna = (pp, rel) => miembro([[sk.cad, pp.rod, M.anchoMuslo], [pp.rod, pp.tob, M.anchoTibia], [pp.tob, pp.punta, 26]], rel);
    const brazo = (bb, rel) => miembro([[sk.hombro, bb.codo, M.anchoBrazo], [bb.codo, bb.mano, M.anchoAntebrazo]], rel, bb.mano);
    const seg = (a, b, w, rel) => miembro([[a, b, w]], rel);

    // 1) lado lejano
    brazo(sk.bL, fondoLejos); pierna(sk.pL, fondoLejos);
    // 2) tronco (chaqueta) como trapecio redondeado
    const tor = () => {
      const a = dirArriba(sk.P.torso), n = [a[1] * -1, a[0]], wh = M.anchoTorso / 2, wb = M.anchoTorso / 2 + 4;
      const H = sk.hombro, Cd = mas(sk.cad, a, -10);
      const pts = [[H[0] + n[0] * wh, H[1] + n[1] * wh], [H[0] - n[0] * wh, H[1] - n[1] * wh], [Cd[0] - n[0] * wb, Cd[1] - n[1] * wb], [Cd[0] + n[0] * wb, Cd[1] + n[1] * wb]].map(T);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath();
      if (estilo === 'silueta') { ctx.fillStyle = tinta; ctx.fill(); }
      else { ctx.lineWidth = ow * 2; ctx.strokeStyle = tinta; ctx.stroke(); if (estilo === 'gi') { ctx.fillStyle = C.gi; ctx.fill(); }
        // solapa del karategi (línea en V)
        const v0 = T(mas(H, n, wh * 0.55)), v1 = T(mas(mas(sk.cad, a, 70), n, -wh * 0.25)); ctx.lineWidth = ow * 0.8; line(v0, v1); }
    };
    // 3) pierna cercana, tronco, cinturón, cabeza, brazo cercano
    pierna(sk.pC, C.gi); tor();
    // cinturón: banda en la cadera + nudo y dos puntas
    const a = dirArriba(sk.P.torso), n = [-a[1], a[0]], wb = M.anchoTorso / 2 + 8, cb = mas(sk.cad, a, 6);
    const b0 = T(mas(cb, n, wb)), b1 = T(mas(cb, n, -wb));
    ctx.setLineDash(estilo === 'fantasma' ? [16 * s, 12 * s] : []);
    ctx.strokeStyle = estilo === 'silueta' ? tinta : cint; ctx.lineWidth = 20 * s; ctx.lineCap = 'butt'; line(b0, b1); ctx.lineCap = 'round';
    const nudoE = mas(cb, n, wb * 0.65 * 1), nudo = T(nudoE);
    const tail = (dx, l) => { const p = T([nudoE[0] + dx, nudoE[1] + l]); ctx.lineWidth = 14 * s; line(nudo, p); };
    if (estilo !== 'fantasma' || true) { tail(8, 70); tail(22, 62); circ(nudoE, 12, estilo === 'silueta' ? tinta : cint); }
    if (estilo === 'fantasma') ctx.setLineDash([16 * s, 12 * s]);
    // cuello y cabeza (sin rostro)
    seg(sk.hombro, sk.cuelloF, 30, piel);
    circ(sk.cabeza, M.cabezaR, estilo === 'gi' ? piel : estilo === 'silueta' ? tinta : null, estilo === 'silueta' ? null : tinta);
    brazo(sk.bC, C.gi);
    ctx.restore();
    return { nudo, cabeza: T(sk.cabeza), manoCerca: T(sk.bC.mano), manoLejos: T(sk.bL.mano), pieCerca: T(sk.pC.punta), pieLejos: T(sk.pL.punta),
      cadera: T(sk.cad), hombro: T(sk.hombro), alto: (yMax - (sk.cabeza[1] - M.cabezaR)) * s };
  };

  // Poses de la biblioteca (se completan con animacion/poses/*.json; estas son las de base)
  K.poses = {
    // musubi-dachi / yoi: de pie, brazos abajo delante del cinturón
    yoi: { torso: 0, cuello: 0, hombroCerca: 14, codoCerca: 10, hombroLejos: 10, codoLejos: 12,
      caderaCerca: 4, rodillaCerca: 0, pieCerca: 0, caderaLejos: -4, rodillaLejos: 0, pieLejos: 0 },
  };
  // Carga síncrona opcional de poses JSON ya incrustadas: EMAKI.karateka.registrar(nombre, objeto)
  K.registrar = (nombre, p) => { K.poses[nombre] = Object.assign({}, K.poses.yoi, p.angulos || p); };
})();
// Registrar las poses JSON inyectadas por render.mjs (window.EMAKI_POSES)
(function () { const P = window.EMAKI_POSES || {}; for (const n in P) window.EMAKI.karateka.registrar(n, P[n]); })();
