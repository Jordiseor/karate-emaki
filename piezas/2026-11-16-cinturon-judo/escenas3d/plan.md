# Plan de animación 3D · cinturón judo (30 s, 11 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia de estilo: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`. Biblioteca usada: `animacion/3d/judo3d.js` (README «Judo y Kōdōkan»), poses `atar-cinturon`, `pasar-objeto`, `recibir`, `seiza` ya existen.

## Reglas comunes
- Copia `src/plano-01.html` como base (rutas `../../../../animacion/...`; `import * as C from './comun.js'`). Un fichero por plano: `src/plano-NN.html`. **No hay ficheros compartidos que editar**: si te falta una ayuda, defínela dentro de tu plano y apúntala en «Pendiente para el jefe».
- Salida, desde `piezas/2026-11-16-cinturon-judo/escenas3d/` (escala 0,5 la fija `C.iniciar()`):
  ```bash
  # 1) fotograma de prueba (míralo ANTES): t = inicio, mitad y final
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png
  # 2) clip + captura central
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png
  ```
  Cada animador escribe **solo** sus `src/plano-NN.html` y `plano-NN.*`. Duración = `window.DURACION`. Plano 1 (3 s): 64 s de render; sala llena ≈ 2,5–3 s/fotograma.
- Texto: `C.tarjeta(ctx, t, [líneas], { t0: 0.1, y: 300 })` (arriba; si tapa la cabeza, baja la cámara/encuadre: el texto nunca sobre la cara). Ya visible en t=0 solo en el plano 1; en el resto entra con `t0: 0.1`. ≥ 48 px (la tarjeta usa 84), ≤ 5 palabras, zona segura 250 arriba / 350 abajo. Rojo `#C8102E` SOLO: «judo» (plano 1), «LEYENDA» (8), flechas, sello, fechas clave. Letra pequeña: `C.letraPequena`.
- Cámaras en `C.CAM` (`nudo`, `medio`, `frontal`, `general`, `fila4`, `sala`) y `C.mezclarCam(a, b, p)` para movimientos. Karateka del plano: `k` de `C.iniciar()` (cinturón negro), rumbo 0 = a cámara. Escenario: `C.iniciar({ suelo: 'tatami' })` para sala (5, 6); `{ fondo: 'degradado' }` si el plano va sobre papel.
- Personas reales (Kanō, Funakoshi, Kawaishi, público): SIEMPRE `crearJudoka({ color: '#1A1A1A' ... })`/silueta, sin rostro. Kanō = `detalle: 'kano'` (hakama); Kawaishi = `detalle: 'kawaishi'` (boina). Cinturones en planos 4: solo `blanco` y `negro`.
- Leyenda (plano 8) = `H2.pergamino` con «Cuentan que…» + tarjeta «LEYENDA». Sellos 2D: `C.sello(ctx, '沖縄'|'初段', x, y, size, p)` tras `esc.dibujar`. Rollo (plano 2): `crearRollo()` de `rollo2d.js` (import propio en tu plano, ver README «Rollo»).
- Cinturón por tramos: `C.cinturonPorTramos(k, t, [[0,'amarillo'],[0.5,'naranja'],…])` (cortes secos).
- Datos: solo los del storyboard/dosier. No decir: «en Okinawa no había grados», «el primer cinturón negro», número de alumnos, regalo como hecho cierto.
- Determinismo: sin `Math.random`/`Date`; todo en función de `t`.
- Revisa cada plano: fotograma 0, mitad y final; pies apoyados; texto en zona segura y no sobre la cara.

## Duraciones (suman 30,0 s; las del storyboard)
| Plano | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s | 3,0 | 2,5 | 3,0 | 2,5 | 3,0 | 2,5 | 3,0 | 3,5 | 2,5 | 2,5 | 2,0 |

## Reparto
| Tramo | Planos | Segundos |
| --- | --- | --- |
| Jefe (hecho) | 1 | 0,0–3,0 |
| **A** (Okinawa, Kanō, judokas, Kōdōkan) | 2, 3, 4, 5, 6 | 3,0–16,5 (13,5 s) |
| **B** (dan, leyenda, colores, bucle) | 7, 8, 9, 10, 11 | 16,5–30,0 (13,5 s) |

### Tramo A
**Plano 02 · 2,5 s** · Papel/emaki: `crearRollo()`, `rollo.dibujar(ctx, { abierto, centrar: 1 … })` con una viñeta función que pinta: a la izquierda `C.sello` rojo 沖縄 (sin mapa realista), a la derecha un dibujo simple de dōjō de judo (casa-dōjō de `historia3d.js` o rótulo «柔道» a trazos con `H2.kanji`, tinta) y una flecha roja 2D de izquierda a derecha que crece (fuera de Okinawa hacia el judo). Sin afirmar nada sobre grados en Okinawa. Sin 3D si no hace falta (fondo papel; si usas 3D, `fondo: 'degradado'`). Tarjeta `['No vino', 'de Okinawa']`. Locución: «No vino de Okinawa. Vino del judo.»
**Plano 03 · 3,0 s** · Dōjō, cámara `frontal` con leve empuje. `crearJudoka({ color:'#1A1A1A', detalle:'kano', cinturon:'negro' })` de pie (`P.neutra`) a la izquierda (x≈-0.9); a su derecha `H2.pergamino(ctx, t, { texto: '1883', t0: 0.3, t1: 1.0, y: 560 })` (o pergamino propio 2D desplegándose). A 1,4 s y 1,9 s aparecen dos tiras 2D con «kyū» y «dan» (≥ 48 px, tinta; dato clave 1883 puede ir en rojo). Tarjeta `['1883: Kanō', 'crea los grados']` (cuidado: ≤ 5 palabras, no sobre la cabeza). No decir que el cinturón negro nació en 1883.
**Plano 04 · 2,5 s** · `C.CAM.fila4` (centro algo desplazado). Dos judokas: `crearJudoka({ cinturon:'blanco' })` en x=-0.6 y `crearJudoka({ cinturon:'negro' })` en x=0.6, color por defecto (marrón ceniza, para que el negro se lea); el resto del plano vacío. `P.neutra` los primeros 1,3 s; luego la blanca hace rei: `C.mezclar(P['pies-juntos'], P.rei, f)`. Tarjeta `['Antes: blanco', 'y negro']`. Locución: «Al principio, en Japón, casi todo era blanco o negro.» Solo esos dos colores.
**Plano 05 · 3,0 s** · Sala del Kōdōkan llena: `C.iniciar({ suelo: 'tatami' })`, `sala = crearSala(esc, { publico: {} })`; `sala.publico.pose(P, { t, modo: 'quieto' })` cada fotograma. Funakoshi: `crearJudoka({ cinturon:'negro', color:'#1A1A1A' })` en (0, 0.2) con `P['gyaku-zuki-kiai']` (kata, sin cara), cámara `C.CAM.sala` con empuje lento (distancia 20 → 17). Cartel «1922» con `H2`/texto 2D rojo grande (fecha clave) a media altura. Tarjeta `['1922: Funakoshi', 'en el Kōdōkan']`. Sin retratos, sin logos. Es el plano más pesado (≈ 8 s por fotograma en total; si tarda demasiado baja a `filasLado: 2`, avisa).
**Plano 06 · 2,5 s** · Misma sala (copia tu setup del 05; mismos parámetros para que corte limpio). `sala.publico.pose(P, { t, modo: 'mirar' })` los primeros 1,5 s y `'asentir'` después; cámara sube/entra desde `C.CAM.sala` (elevación 12 → 16) hacia el fondo; `crearPancarta({ texto: '', ancho: 2.2, alto: 0.7, y: 3.4 })` con `.pop(p)` que entra a 1,0 s y rótulo 2D «sala llena» sobre ella (≥ 48 px) o solo en tarjeta. Tarjeta `['Sala llena']`. Sin cifras de asistentes.

### Tramo B
**Plano 07 · 3,0 s** · Karateka `k` en `P.yoi`, cinturón negro, cámara `C.CAM.frontal` ajustada para dejar sitio. Pergamino: `H2.pergamino(ctx, t, { texto: 'Abril 1924', t0: 0.1, t1: 0.8, y: 290 })` y debajo (tarjeta, `y` ≥ 420 o sustituye al pergamino tras 1,2 s) `['Primeros dan']`. Certificado 2D (papel crema con borde de tinta, a la altura del pecho, lado derecho) con `C.sello(ctx, '初段', …)` estampado a 1,0 s; flecha roja 2D del certificado al karateka (crece 1,2–1,8 s). Sin número de alumnos. Locución: «…certificados dan del karate.»
**Plano 08 · 3,5 s** · LEYENDA. Fondo `rollo` o `fondo: 'degradado'` en tono papel. Pergamino «Cuentan que…» (`H2.pergamino`, texto en rojo, `y: 290`). Debajo, dentro de la zona central, escena 3D: Kanō `crearJudoka({ detalle:'kano', color:'#1A1A1A' })` en (0,-0.43) rumbo 0 con `P['pasar-objeto']` y Funakoshi `crearJudoka({ color:'#1A1A1A' })` en (0,0.43) rumbo 180 con `P.recibir` (cámara de `prueba/poses-2026-11-16b.html`: centro [0,1.1,0.4], distancia 6, elevación 4, azimut 70). `cinta = crearCinturonSuelto({ color:'negro' })`: `cinta.pasar(a, b, U.prog(t, 0.8, 2.4))` y `cinta.halo(U.prog(t, 2.4, 3.2))`. Tarjeta propia `['[r]LEYENDA[/r]']` (≥ 48 px, 1 palabra) entrando a 1,8 s, y letra pequeña `C.letraPequena(ctx, 'Según un historiador')`. No afirmar el regalo.
**Plano 09 · 2,5 s** · `k` frontal, plano medio (`C.CAM.medio` con cinturón visible; si hace falta `C.CAM.frontal`). Cinturón por tramos: `C.cinturonPorTramos(k, t, [[0,'amarillo'],[0.5,'naranja'],[1.0,'verde']])` con cortes secos cada 0,5 s (un pequeño rebote de escala/cámara en cada corte, 0,04). Rótulo «Inglaterra» (texto 2D, tarjeta, sin bandera ni mapa) y «1926» en rojo como fecha. Tarjeta `['Los colores llegaron', 'después']` + segunda línea de rótulo `Inglaterra · 1926` debajo de la cabeza o en la tarjeta (≤ 5 palabras por tarjeta: dos tarjetas sucesivas, cambiando a 1,3 s).
**Plano 10 · 2,5 s** · Misma cámara que el 09 (corte limpio). `k.cinturon` por tramos `[[0,'azul'],[0.5,'marron'],[1.0,'negro']]`. A 0,6 s entra desde la derecha una silueta `crearJudoka({ detalle:'kawaishi', color:'#1A1A1A', cinturon:'negro' })` (x ≈ 1.3, rumbo -30), que asiente con la cabeza (`aplicarPose` con `cabeza` inclinada) sin tocar el cinturón. Tarjeta `['Francia, 1935:', 'Kawaishi']`; «1935» en rojo. Kawaishi solo «los llevó», no «los inventó».
**Plano 11 · 2,0 s** · **Bucle con el plano 1.** `k` a cámara, `P['atar-cinturon']`→ los 0,0–1,0 s: yoi con brazos cruzados (si no hay pose «brazos cruzados» usa `P.yoi` y un guiño: `k.cara({ guino: … })`, ver `Karateka3D.cara`); a 1,0 s guiña; de 1,0 a 2,0 s la cámara se acerca de `C.CAM.medio` a `C.CAM.nudo` (`C.mezclarCam`) y el último fotograma (`--t 1.966`) debe parecerse al `--t 0` del plano 1 (manos a ambos lados del nudo con `P['atar-cinturon']` mezclado a partir de 1,2 s). Tarjeta `['¿De qué color', 'es el tuyo?']` (5 palabras) que sale en la última décima. Locución: «¿Y el tuyo? ¿De qué color es?»

## Cierre (jefe/editor)
Montaje: concatenar `plano-01…11.mp4` (lista `file 'plano-NN.mp4'`). Total 30,0 s. El editor ajusta con la voz.

## Pendiente (biblioteca animacion/3d/: NO añadir; resolver dentro del plano y apuntar)
- Pose «brazos cruzados» (plano 11): no existe; usar `P.yoi` o dibujarla dentro del plano (ángulos propios en `aplicarPose`) y avisar.
- Certificado/diploma con sello y tiras «kyū/dan» (planos 3, 7): son 2D, se dibujan dentro del plano (canvas). Si ≥ 2 animadores lo repiten, el jefe lo incorpora a `comun.js`.
- Mapa/rótulo de «Inglaterra» y «Francia»: solo texto, sin bandera.
- (Animadores: añadid aquí lo que dibujéis fuera de biblioteca.)

## Estado
- plano-01: hecho (jefe), 3,0 s. Fotogramas 0 y final revisados (manos tirando del nudo; cámara retrocede; tarjeta fuera de la cara, dentro de zona segura). Pendiente de cierre: el plano 11 enlaza con su fotograma 0.
- (Tramo B) Planos 9 y 10: cámara `C.CAM.medio` con centro x=0,3 (karateka a la izquierda) para que Kawaishi quepa a la derecha; con el centro en 0 una silueta a x≈1,3 queda fuera de encuadre.
- (Tramo B) Plano 8: el texto del pergamino sale en rojo envolviendo `ctx.fillText` durante la llamada a `H2.pergamino` (no admite color). Sería útil un `o.color` en `historia2d.pergamino`.
- (Tramo B) Plano 11: sin pose de brazos cruzados (se usa `P.yoi`); tarjeta abajo (y 1330) porque con el zoom la cabeza cruzaría un texto arriba. Certificado 2D del plano 7 dibujado dentro del plano.
- (Tramo A) Planos 2-6 dibujan dentro de su html, sin biblioteca: casa-dojo 2D a tinta y flecha roja (plano 2), tiras «kyū/dan» (plano 3), cartel 2D «1922» (plano 5). Plano 4: `esc.escena.fog.near=16, far=60` para que los judokas no se laven a distancia 11. Planos 3-6 ocultan el karateka por defecto (`k.raiz.visible = false`). Plano 6: rótulo solo en tarjeta «Sala llena» (pancarta 3D vacía).
