# Plan de animación 3D · tigre (30 s, 10 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia de estilo: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`.
Tiempo real del plano 1 (2D puro): 9,6 s para 3,2 s de clip (96 fotogramas) incluido el arranque ≈ 6 s → ≈ **0,04 s/fotograma de dibujo, ≈ 3 s de render por segundo de clip**. Los planos 2 y 10 llevan 3D (silueta / karateka): ≈ 0,5–1,5 s/fotograma (README: 0,5 un solo personaje a escala 0,5; Kosugi + Funakoshi algo más).

## Reglas comunes
- Copia `src/plano-01.html` (rutas `../../../../animacion/...`; `import * as C from './comun.js'`). Un fichero por plano: `src/plano-NN.html`. Lo que te falte, defínelo en tu plano y apúntalo en «Pendiente». Plano 2D puro: NO llames a `C.iniciar3d()` (coste).
- Desde `piezas/2026-11-18-tigre/escenas3d/`:
  ```bash
  S=/ruta/scratchpad/<tu-subcarpeta>; mkdir -p $S     # el scratchpad se comparte: usa subcarpeta propia, no p1-0.png
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png $S/NN-0.png      # prueba: t = 0, mitad y final; MÍRALA (Read) antes del clip
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png   # clip + captura central; Read de la captura
  ```
  Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Duración = `window.DURACION` (tabla). Escala 0,5 solo afecta al 3D.
- Determinismo: nada de `Math.random`/`Date`; todo en función de `t`.
- `C` exporta: `T` (= `tigre2d.js`: `tigre`, `pincelada`, `cubierta`, `kanji`, `rotulo`, `sello`, `pergamino`, `ojo`, `TIGRE_DIM`), `H2` (historia2d), `crearRollo`/`VENTANA` (rollo2d), `crearMaestro`/`anadirMaestro`, `crearFunakoshi`, `Karateka3D`, `cargarPoses`, `mezclar`, `crearEscenario`, `U`, `overlay`; colores `C.ROJO/TINTA/PAPEL/GRIS`.
- Ayudas de `C`: `C.papel(ctx)` (fondo), `C.tarjeta(ctx, t, ['línea1','línea2'], { t0: 0.1, y: 300 })` (84 px, ≤ 5 palabras; `[r]…[/r]` rojo), `C.etiqueta(ctx, t, 'DATO' | 'SE DICE' | 'LEYENDA', { t0, y: 470 })` (pastilla 48 px; DATO tinta, las otras rojas), `C.letraPequena`, `C.tigre(ctx, pose, p, x, y, escala)`, `C.bucle(ctx, p)` (pincelada del bucle), `C.iniciar3d()` → `{ esc, P, U }`.
- Colores: papel `#F4EFE6`, tinta `#1A1A1A`. **Rojo solo** para SE DICE / LEYENDA, flechas y el año 1922 (los kanji, el tigre y las pinceladas, en tinta).
- Zona segura: 250 px libres arriba y 350 abajo (tarjeta en y = 300, etiqueta ≈ 470–520; contenido principal entre y ≈ 650 y 1500). Texto ≥ 48 px.
- Tigre (medidas a escala 1: acecho 880×520, sentado 960×660, frente 800×830; (x, y) = pies). Plano 1: escala 1,05 para acecho a todo ancho; 'frente' a escala 0,9–1,0; 'sentado' pequeño (≈ 0,5–0,6) o sustitúyelo por 'acecho'/'frente' si se lee mejor. Nunca círculo ni enroscado, nunca como el emblema ni copia del dibujo de Kosugi.
- Kosugi y Funakoshi **siempre silueta sin rasgos** (`crearMaestro({ silueta: '#1A1A1A' })` con `maestro-seiza-pincel`; Funakoshi con `crearFunakoshi()`, ya en silueta `#1A1A1A`). Sin fechas de vida en pantalla.
- **Bucle 10 → 1:** `C.bucle(ctx, p)` se dibuja en el mismo sitio en ambos. El plano 10 debe terminar en `p = C.BUCLE.p0` (0,9) y el plano 1 empieza en ese mismo `p` y lo completa. En t = 3,99 s del plano 10: pincelada ya en pantalla, fondo papel, sin tigre ni tarjeta.
- Datos: solo los del storyboard/dosier. Plano 8: la lectura 虎の巻 *tora no maki* = «libro de secretos / manual», lit. «rollo del tigre», **confirmada en diccionario (JMdict vía nihongomaster) = DATO**. El juego de palabras con el tigre del Shotokan sigue siendo **SE DICE** (planos 6 y 7; no «Kosugi lo dijo»). «Cuentan que el tigre nunca duerme» = LEYENDA (plano 9). No uses monte Torao, emblema ni cifras.

## Reparto (segundos = `window.DURACION`)
| Tramo | Planos | Duración | Render estimado |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 (3,2) | 3,2 | 10 s |
| **A** | 2 (3,0), 3 (3,0), 4 (3,0), 5 (2,0), 6 (3,0) | 14,0 | 2 ≈ 1,5 min (dos siluetas 3D); 3–6 2D ≈ 3 s/s → 40 s; total ≈ 2,5 min |
| **B** | 7 (3,0), 8 (2,8), 9 (3,0), 10 (4,0) | 12,8 | 7–9 2D ≈ 30 s; 10 con karateka 3D ≈ 1 min; total ≈ 1,5–2 min |

Suma de los 10 planos: 3,2 + 3 + 3 + 3 + 2 + 3 + 3 + 2,8 + 3 + 4 = 30,0 s (el 8 dura 2,8 s: 20,2–23,0 en el storyboard; si la voz se alarga, ajusta con el Sensei, no aquí).

### Tramo A (planos 2–6)
**Plano 02** · `DURACION = 3.0` · 3D + papel. Se aparta la pincelada (`T.pincelada('barrido', …)` que sale por un lado) y entra la silueta de Kosugi en seiza con pincel (`crearMaestro({ silueta: '#1A1A1A' })`, `maestro-seiza-pincel`, `{ escribir: t }`) y a su lado Funakoshi de pie (`crearFunakoshi()`, `anadirMaestro` no hace falta), mano en el hombro (si la pose no existe, brazo relajado, sin inventar). Ambos sin rasgos. Papel de fondo: pinta `C.papel(ctx)` y encima el 3D con fondo transparente (si tu versión no lo admite, 3D sobre fondo plano `#F4EFE6` en `crearEscenario`). Tarjeta «Kosugi Hōan, pintor» (2 líneas) + `C.etiqueta DATO`. Sin fechas.
**Plano 03** · `3.0` · 2D (rollo opcional). Cubierta en blanco `T.cubierta(ctx, { aparece, pincel })` en el centro (≈ y 1000); el pincel abstracto la decora (`pincel` 0→1 en 0,8–2,0). Tarjeta «Cubierta de su libro» y año `[r]1922[/r]` aparece (2.0 s) como segunda tarjeta o cifra roja (`overlay.cifra`, ≥ 48 px) sin tapar la cubierta. Sin tigre ni título. Etiqueta DATO.
**Plano 04** · `3.0` · 2D. Plano 1 a la inversa: cubierta (`T.cubierta`, escala natural, al fondo a la izquierda) y el tigre 'acecho' (`C.tigre`, `espejo: true` o no) que se asoma por detrás: dibújalo antes y tapa su parte inferior con la cubierta (dibuja la cubierta después). Silueta del pintor pequeña (2D simple o `crearMaestro` si hay hueco; prefiere un trazo con `T.trazo` de silueta de pie si el 3D sube el coste) y flecha roja (de la silueta al tigre, con `T.trazo({ color: C.ROJO })` y punta). Tarjeta «Y diseñó el tigre». DATO. No digas qué libro ni año.
**Plano 05** · `2.0` · 2D. Fondo liso; el tigre se detiene y mira a cámara (`'frente'` a escala ≈ 0,95, centrado, pies en y ≈ 1450); `T.pincelada('interrogacion', p, …)` a su derecha, tinta. Tarjeta «¿Por qué un tigre?». Sin etiqueta (pregunta); no uses rojo.
**Plano 06** · `3.0` · 2D. `crearRollo()` que se desenrolla (`abierto` 0→1, `rollo.dibujar`), sello rojo `T.sello(ctx, p, x, y, 190, { texto: 'SE DICE' })` (≥ 48 px) que cae a 1,0 s; el tigre original junto al rollo (usa `'acecho'` pequeño, ≈ 0,5, o `'frente'` ≈ 0,5 en lugar de `'sentado'` si se lee mejor). Tarjeta «Se dice: juego de palabras» (SE DICE en rojo vía `[r]`) + `C.etiqueta SE DICE`; solo uno de los dos rojos fuertes si se recarga. No «Kosugi lo dijo».

### Tramo B (planos 7–10)
**Plano 07** · `3.0` · 2D. En el rollo (`crearRollo`, abierto) se escribe `T.rotulo(ctx, 'tora no maki', 540, 900, 96, p)` a pincel (0,2–1,4 s) y a 1,5 s una cartela (pastilla papel con borde tinta o `H2.pergamino` claro; o simple rectángulo con `C.tarjeta`) con «libro maestro». Tarjeta: «tora no maki: libro maestro» (el diccionario da «libro de secretos / manual»; en voz se dice «libro maestro»; no pongas «libro maestro» como traducción literal). Etiqueta **SE DICE** (el juego de palabras) — o DATO para el significado idiomático si lo prefiere el Sensei.
**Plano 08** · `2.8` · 2D. `T.kanji(ctx, '虎', x, y, 340, { prog })` y luego `'巻'` (0,1–1,0 s y 0,9–1,7 s) uno tras otro; sus lecturas pequeñas bajo cada uno («tora», «maki», ≥ 48 px). A 1,7 s el tigre 'acecho' (pequeño, ≈ 0,45) salta (parábola 2D) al rollo y lo recorre (`crearRollo`) hasta el final. Tarjeta «Escrito: [r]…[/r]» → en tinta: «Escrito: "rollo del tigre"» (≤ 5 palabras). Etiqueta **DATO** (confirmado JMdict).
**Plano 09** · `3.0` · 2D. `T.pergamino(ctx, t, { texto: 'Cuentan que…', t0: 0.1, t1: 0.7, y: 300 })` y en el centro el tigre 'frente' (≈ 0,8) con `T.ojo(ctx, p, x, y, 360, { t })` en primer plano (el halo ya tiñe el ancho: no añadas más rojo). Tarjeta propia «LEYENDA» (1 palabra, rojo, ≥ 48 px; 120 px mejor) a ≈ 1,2 s + `C.etiqueta LEYENDA` solo si no duplica; sin explicar significados. Tigre no durmiendo: ojo abierto.
**Plano 10** · `4.0` · 3D + 2D. Plano medio: karateka (`C.iniciar3d()`, `Karateka3D({ cinturon: 'negro' })`, `P.yoi`, `k.cara({ cejas: 1 })`, mira a cámara, rumbo 0) a la derecha y el tigre `'frente'` (≈ 0,6) a la izquierda como compañero (o 'acecho'; evita 'sentado'). Fondo papel. Tarjeta «¿Qué ves tú en el tigre?» (3 líneas ≤ 84 px). Último segundo (3,0–4,0): todo se funde a papel y `C.bucle(ctx, p)` se dibuja de `p = 0` a `C.BUCLE.p0` (0,9): última imagen = inicio del plano 1. Comprueba el fotograma 3,99 y compáralo con `plano-01.png --t 0`.

## Pendiente (para el jefe / Modelador 3D)
- Resuelto: `comun.js` (tarjeta, etiqueta, bucle, papel), plano 1.
- Los planos 2 y 10 mezclan 3D y papel 2D: el orden de pintado es papel 2D → `esc.dibujar` con fondo transparente → texto. Si `esc.dibujar` no admite fondo transparente, el animador lo apunta aquí y pide solución al Sensei (alternativa: renderizar el 3D sobre fondo papel plano, que es igual de claro).
- (los animadores añaden aquí lo que dibujen)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 0,7, 0,9, 1,8 y la captura central revisados; clip 3,2 s / 96 fotogramas, 9,6 s de render. Tigre 'acecho' a escala 1,05, pincelada `bucle` en y = 1000 (se funde 0,3–0,85 s).
