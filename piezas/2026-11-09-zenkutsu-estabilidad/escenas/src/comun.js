// Constantes y ayudas COMUNES de las 8 escenas de zenkutsu-estabilidad. Se cargan desde cabecera.inc.
// Si un tramo necesita cambiar algo de aquí, que lo diga en plan.md (no lo cambie a solas: lo usan los dos tramos).
(function () {
  const E = window.EMAKI, Fi = E.fisica, K = E.karateka;
  const P = (window.PIEZA = {});
  P.ESCALA = 1.0;          // la figura mide ≈756 px; base de 4 pies = 462 px
  P.SUELO = 1330;          // y del suelo (la barra de base queda en 1340–1358; texto fijo en 1500)
  P.PUNTA_X = 690;         // x de la punta del pie delantero en las vistas de perfil (los pies NO se mueven entre P2 y P3)
  P.CENTRO_X = 540;        // x del centro de la vista frontal
  P.TEXTO_Y = 270;         // y superior de la tarjeta principal (zona segura: ≥250)
  P.NOTA_Y = 1500;         // letra pequeña fija (escenas 2–8)
  P.EMPUJE = 0.0;          // reservado
  // Opciones de dibujo comunes para la figura de perfil. Pasa extras (alpha, estilo...) en 'extra'.
  P.opc = (extra) => Object.assign({ suelo: P.SUELO, escala: P.ESCALA, cinturon: E.marca.color.tinta, anclaPunta: P.PUNTA_X }, extra || {});
  P.opcFrontal = (extra) => Object.assign({ x: P.CENTRO_X, suelo: P.SUELO, escala: P.ESCALA, cinturon: E.marca.color.tinta }, extra || {});
  // Altura del CdM y ángulo de vuelco ya calculados para cada pose (para rotular): 'pies-juntos' ≈8°, 'zenkutsu-alto' ≈26°, 'zenkutsu-bajo' ≈30°
  P.vuelco = (nombre) => Fi.geometria(nombre, P.opc()).vuelco;
  // Empuje rígido: gira el bloque (figura) θ grados sobre la punta del pie; devuelve la posición del punto rojo girado.
  P.inclinada = (ctx, pose, theta, extra) => {
    const o = P.opc(extra), g = Fi.geometria(pose, o);
    Fi.inclinar(ctx, g.pivote, theta, 1, () => Fi.figura(ctx, pose, o));
    return { g, cdm: Fi.girarPunto(g.cdm, g.pivote, theta, 1) };
  };
})();
