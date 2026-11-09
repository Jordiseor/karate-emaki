// KARATE EMAKI · karateka esquemático de FRENTE (complemento de karateka.js, que es de perfil).
// Requiere marca.js, karateka.js y fisica.js (para la escala metros -> px). Uso:
//   const Kf = EMAKI.karatekaFrontal;
//   const g = Kf.dibujar(ctx, EMAKI.fisica.poseFrontal('zenkutsu-frontal'), { x: 540, suelo: 1450, escala: 0.8, cinturon: '#1A1A1A' });
//   g.cabeza, g.cadera, g.pieIzq, g.pieDer ([x,y] de cada pie en pantalla), g.base {x0,x1} (bordes exteriores de los pies), g.alto
// "Izq/Der" son los del KARATEKA: su izquierda sale a la DERECHA de la pantalla (mira a cámara).
// Pose frontal (poses/zenkutsu-frontal.json -> angulos): alturaCadera_m, separacionPies_m, anchoPelvis_m, anchoHombros_m,
//   brazoIzq / brazoDer = { hombro: ° respecto a la vertical, + = hacia fuera; codo: ° de flexión hacia el cuerpo (+ = antebrazo sube hacia dentro);
//   escorzo: 0..1 longitud aparente del brazo (el brazo que va hacia atrás se ve más corto) }.
// Proporciones idénticas a las del perfil (mismos segmentos), así que el karateka mide lo mismo al girar la cámara.
(function () {
  const E = window.EMAKI, C = E.marca.color, K = E.karateka, D2R = Math.PI / 180;
  const Kf = (E.karatekaFrontal = {});
  Kf.pies = { ancho: 0.10, largo: 0.12 }; // el pie visto de frente: ancho y "largo" aparente (m)

  Kf.dibujar = function (ctx, pose, o = {}) {
    const M = K.medidas, F = E.fisica, ppm = F.PPM, s = o.escala || 1, u = ppm * s; // px por metro en pantalla
    const x0 = o.x == null ? 540 : o.x, suelo = o.suelo == null ? 1450 : o.suelo;
    const estilo = o.estilo || 'gi', tinta = o.color || C.tinta, cint = o.cinturon || C.tinta;
    const ow = M.contorno * s * (o.grosorContorno || 1);
    const P = Object.assign({ alturaCadera_m: 0.82, separacionPies_m: 0.41, anchoPelvis_m: 0.30, anchoHombros_m: 0.41,
      brazoIzq: { hombro: 12, codo: 4, escorzo: 1 }, brazoDer: { hombro: 18, codo: 100, escorzo: 0.55 }, tambaleo: 0 }, pose);
    // coordenadas: X derecha de pantalla, Y hacia abajo; (0,0) = centro del suelo
    const hipY = -P.alturaCadera_m * u, pelv = P.anchoPelvis_m * u / 2, pies = P.separacionPies_m * u / 2;
    const sh = P.anchoHombros_m * u / 2, torso = M.torso * s;
    const T = (p) => [x0 + p[0], suelo + p[1]];
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (estilo === 'fantasma') ctx.setLineDash([16 * s, 12 * s]);
    const line = (a, b) => { const A = T(a), B = T(b); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); };
    const miembro = (segs, rel, puno, lejos) => {
      const pasadas = estilo === 'gi' ? [[tinta, ow * 2], [rel, 0]] : estilo === 'silueta' ? [[tinta, 0]] : [[tinta, ow * 2]];
      pasadas.forEach(([col, extra]) => {
        ctx.strokeStyle = col;
        for (const [a, b, w] of segs) { ctx.lineWidth = w * s + extra; line(a, b); }
        if (puno) { const Q = T(puno); ctx.beginPath(); ctx.arc(Q[0], Q[1], M.puno * s + extra / 2, 0, Math.PI * 2);
          if (estilo === 'fantasma') { ctx.lineWidth = ow; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); } }
      });
    };
    const giCol = C.gi;
    // piernas: la del karateka-izquierdo (derecha de pantalla) es la delantera: rodilla doblada sobre el pie
    const alturaMuslo = Math.cos(43.5 * D2R) * M.muslo * s;           // proyección vertical del muslo delantero (igual que P2)
    const hipL = [-pelv, hipY], hipR = [pelv, hipY];
    const tamb = P.tambaleo || 0;                                      // px de desplazamiento lateral del cuerpo (tambaleo)
    const ankL = [-pies, -(M.contorno + 10) * s], ankR = [pies, -(M.contorno + 10) * s];
    const kneeR = [pies, ankR[1] - M.tibia * s];
    const hacia = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    void alturaMuslo;
    const pie = (a, rel) => { // pie visto de frente: óvalo achatado
      const w = Kf.pies.ancho * u, h = Kf.pies.largo * u * 0.55, c = T([a[0], a[1] + 4 * s]);
      ctx.beginPath(); ctx.ellipse(c[0], c[1], w / 2 + ow, h / 2 + ow * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = estilo === 'silueta' ? tinta : (estilo === 'gi' ? rel : 'rgba(0,0,0,0)'); ctx.strokeStyle = tinta; ctx.lineWidth = ow;
      if (estilo !== 'fantasma' || true) { if (estilo !== 'fantasma') ctx.fill(); ctx.stroke(); }
    };
    // desplazamiento del cuerpo por el tambaleo (solo de la cadera hacia arriba)
    const sw = (p, k) => [p[0] + tamb * k, p[1]];
    // trasera (izquierda de pantalla): recta
    miembro([[sw(hipL, 1), ankL, M.anchoMuslo]], estilo === 'silueta' ? tinta : giCol);
    pie(ankL, giCol);
    // delantera (derecha de pantalla): muslo + espinilla vertical
    miembro([[sw(hipR, 1), kneeR, M.anchoMuslo], [kneeR, ankR, M.anchoTibia]], estilo === 'silueta' ? tinta : giCol);
    pie(ankR, giCol);
    // tronco: trapecio
    const hombY = hipY - torso, shL = [-sh + tamb, hombY], shR = [sh + tamb, hombY];
    const pL = [-pelv - 14 + tamb, hipY + 10], pR = [pelv + 14 + tamb, hipY + 10];
    ctx.beginPath(); [shL, shR, pR, pL].map(T).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    if (estilo === 'silueta') { ctx.fillStyle = tinta; ctx.fill(); }
    else { ctx.lineWidth = ow * 2; ctx.strokeStyle = tinta; ctx.stroke(); if (estilo === 'gi') { ctx.fillStyle = giCol; ctx.fill(); }
      // solapas cruzadas en V
      ctx.lineWidth = ow * 0.8; line([-sh * 0.5 + tamb, hombY + 6], [tamb + 4, hipY - 10]); line([sh * 0.5 + tamb, hombY + 6], [tamb - 4, hipY - 10]); }
    // cinturón: banda + nudo + dos puntas
    ctx.setLineDash(estilo === 'fantasma' ? [16 * s, 12 * s] : []);
    ctx.strokeStyle = estilo === 'silueta' ? tinta : cint; ctx.lineWidth = 20 * s; ctx.lineCap = 'butt';
    line([-pelv - 14 + tamb, hipY - 2], [pelv + 14 + tamb, hipY - 2]); ctx.lineCap = 'round';
    ctx.lineWidth = 14 * s; line([tamb, hipY], [tamb - 12, hipY + 62]); line([tamb, hipY], [tamb + 14, hipY + 56]);
    { const n = T([tamb, hipY - 2]); ctx.beginPath(); ctx.arc(n[0], n[1], 13 * s, 0, Math.PI * 2); ctx.fillStyle = estilo === 'silueta' ? tinta : cint; ctx.fill(); }
    if (estilo === 'fantasma') ctx.setLineDash([16 * s, 12 * s]);
    // cuello y cabeza
    const neck = [tamb, hombY - M.cuello * s], head = [tamb, hombY - (M.cuello + M.cabezaR * 0.95) * s - M.cabezaR * 0 ];
    const headC = [tamb, hombY - (M.cuello + M.cabezaR * 0.95) * s];
    void neck; void head;
    miembro([[[tamb, hombY], [tamb, hombY - M.cuello * s], 30]], giCol);
    { const c = T(headC); ctx.beginPath(); ctx.arc(c[0], c[1], M.cabezaR * s, 0, Math.PI * 2);
      if (estilo === 'gi') { ctx.fillStyle = giCol; ctx.fill(); } else if (estilo === 'silueta') { ctx.fillStyle = tinta; ctx.fill(); }
      if (estilo !== 'silueta') { ctx.strokeStyle = tinta; ctx.lineWidth = ow; ctx.stroke(); } }
    // brazos: hombro en el extremo del trapecio. lado = +1 (izq. del karateka = derecha de pantalla) | −1
    const brazo = (lado, B) => {
      const sx = lado * sh + tamb, sy = hombY + 8 * s, e = B.escorzo == null ? 1 : B.escorzo;
      const a1 = B.hombro * D2R * lado;                                  // + = hacia fuera
      const codo = [sx + Math.sin(a1) * M.brazo * s * e, sy + Math.cos(a1) * M.brazo * s * (0.55 + 0.45 * e)];
      const a2 = a1 - (B.codo || 0) * D2R * lado;                              // el antebrazo gira hacia dentro/arriba
      const mano = [codo[0] + Math.sin(a2) * M.antebrazo * s, codo[1] + Math.cos(a2) * M.antebrazo * s];
      miembro([[[sx, sy], codo, M.anchoBrazo], [codo, mano, M.anchoAntebrazo]], giCol, mano);
      return mano;
    };
    const manoDer = brazo(-1, P.brazoDer), manoIzq = brazo(1, P.brazoIzq);
    ctx.restore();
    const alto = (-(headC[1] - M.cabezaR * s)) + 0; // distancia del suelo a lo alto de la cabeza (px)
    const anchoPie = Kf.pies.ancho * u;
    return { cabeza: T(headC), cadera: T([tamb, hipY]), pieIzq: T(ankR), pieDer: T(ankL), manoIzq: T(manoIzq), manoDer: T(manoDer),
      base: { x0: x0 - pies - anchoPie / 2, x1: x0 + pies + anchoPie / 2 }, suelo, alto, cabezaR: M.cabezaR * s };
  };

  // Registra la pose frontal que carga render.mjs desde poses/*.json
  Kf.pose = (nombre) => { const p = (window.EMAKI_POSES || {})[nombre]; return p ? p.angulos : null; };
})();
