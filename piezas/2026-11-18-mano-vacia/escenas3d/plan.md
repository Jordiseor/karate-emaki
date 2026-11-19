# Plan de animación 3D · mano-vacia (34,0 s, 11 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`.
Tiempo real del plano 1 (solo 2D, 84 fotogramas): **10 s de render** (≈ 3,5 s por segundo de clip). Los planos con 3D irán a ≈ 1,5 s/fotograma (≈ 45 s por segundo de clip; mesa de nueve y Naha algo más, ver README «Tiempos»).

## Reglas comunes
- Copia `src/plano-01.html` (rutas `../../../../animacion/...`; `import * as C from './comun.js'`). Un fichero por plano: `src/plano-NN.html`. Lo que te falte, defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-18-mano-vacia/escenas3d/`:
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png    # prueba: t = 0, mitad y final; MÍRALA antes del clip
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png     # clip + captura central
  ```
  Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Duración = `window.DURACION`. Escala 0,5 fijada por `C.iniciar3D()`.
- Determinismo: nada de `Math.random`/`Date`; todo en función de `t`.
- `comun.js` exporta: `U`, `mezclar`, `overlay`, `Karateka3D`, `cargarPoses`, `crearEscenario`, `H2` (kanji), `H3` (historia3d: carteles, filas), `R2` (rollo2d), `MV` (manovacia.js), colores `ROJO/TINTA/PAPEL/GRIS`, y utilidades:
  - `iniciar3D({ fondo:'degradado', far:90 })` → `{ ctx, esc, P, U }` · `iniciar2D()` → `{ ctx, U }` (planos solo 2D: no crees escenario, es 10 veces más rápido).
  - `papel(ctx)` fondo papel #F4EFE6 (llámalo primero; en 3D con fondo `degradado` el 3D lo cubre: usa `papel` solo en planos 2D o detrás de un viñeteado propio).
  - `tarjeta(ctx, t, [líneas], { t0, y })` ≥ 84 px, máx. 5 palabras, rojo con `[r]…[/r]`; `y` entre 300 y 380 (el texto nunca por debajo de y ≈ 1570).
  - `letraPequena(ctx, txt)` (48 px, una a la vez) · `aviso(ctx, t, 'Según él y un historiador', { t0, t1 })` (rojo, 48 px, y 1480) · `fecha(ctx, '1905', p, { x, y, size })` (rojo con halo, rebote) · `pasadaPincel(ctx, p, {…})` (ver plano 1).
- Zona segura: 250 px libres arriba, 350 abajo (nada importante en y > 1570). Contenido principal entre y 400 y 1500.
- Personas reales (Funakoshi, Hanashiro, asistentes de 1936): SOLO silueta sin rostro (`MV.crearFunakoshi()`, `MV.crearHanashiro()`, `MV.crearMesaNueve`). Sin nombres propios sobre las siluetas de la mesa.
- Datos: solo los del dosier/storyboard. Dicho como en el storyboard: «en Naha 1936 se debatió, sin decisión formal»; «varios», nunca «la mayoría»; nada de «durante siglos», 1929, 1924, motivo político. Rojo solo para kanji clave, fechas y «según…».
- Siluetas: salen marrón oscuro por la luz. Aceptable; si el animador puede, `k.silueta('#0E0E0E')` y bajar la luz del escenario (`esc.escena` luces) un 20 % solo en ese plano, sin tocar `animacion/`. Apúntalo en «Pendiente» si funciona.
- Libro sostenido: `MV.crearLibro(...).entre(manoI, manoD)` con pose `recibir` tapa las manos. Probar (1) otra distancia de cámara (3–4 m, elevación 10°) y `sube` mayor en `entre`, (2) libro **sobre una mesa** o en el suelo delante de la silueta, abriendo/escribiendo la cubierta de cara a cámara, (3) en último caso el libro grande 2D como cartel junto a la silueta. Comprueba siempre que se leen la cubierta y las manos.
- Edificio «Naha»: esquemático; mejor como cartel (rótulo grande) o con ≤ 1,2 s en pantalla y cámara cerrada en rótulo + ventana que se abre.
- Mesa de nueve: se lee desde elevación 30° (`orbita({ centro:[0,0.7,0], distancia:11, elevacion:30, fov:30 })`, `esc.escena.fog.far = 90`).
- Seguridad/imagen: nada de rostros, nada de personas reales con rasgos.

## Reparto (segundos = `window.DURACION`)
| Tramo | Planos | Duración | Render estimado |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 (2,8) | 2,8 | 10 s |
| **A** | 2 (3,2), 3 (3,5), 4 (2,8), 5 (3,5), 7 (2,5) | 15,5 | 2 y 5 con 3D ≈ 2,5 min c/u; 3, 4, 7 son 2D (< 1 min) → ≈ 6 min |
| **B** | 8 (3,0), 9 (3,5) | 6,5 | Naha + mesa de nueve (siluetas y sombras) ≈ 2,5 + 5 → ≈ 8 min |
| **C** | 6 (3,5), 10 (3,5), 11 (2,2) | 9,2 | 3D con 1–2 siluetas/karateka ≈ 2,6 + 2,6 + 1,7 → ≈ 7 min |

Total 34,0 s (2,8 + 3,2 + 3,5 + 2,8 + 3,5 + 3,5 + 2,5 + 3,0 + 3,5 + 3,5 + 2,2). Los planos de 3,5 s llevan un cambio visual interno a mitad (≈ 1,7 s).

## Fichas

**Plano 01** (hecho) · 2,8 · 空手 tinta → pincel lo borra → 唐手 rojo. Tarjeta «No siempre «mano vacía»». Solo 2D.

### Tramo A
**Plano 02** · 3,2 · 3D `iniciar3D()`. Silueta de Funakoshi con un libro (cubierta 唐手 en rojo, `MV.crearLibro({ texto:'唐手' }).escribir(1)`). Cambio a mitad: sube el libro/se acerca la cámara a la cubierta (≈ 1,6 s). Cartel `fecha(ctx,'1922',p)` en rojo a partir de 0,8 s. Tarjeta «1922: 唐手, mano china» (rojo solo en 1922 y 唐手). Sin título del libro ni 1924. Libro sobre mesa o en las manos con otra distancia (ver reglas). Funciones: `MV.crearFunakoshi`, `MV.crearLibro`, `C.fecha`, `C.tarjeta`.
**Plano 03** · 3,5 · 2D (`iniciar2D`, papel). `H2.kanji(ctx,'唐',x,y,≈560,{prog})` en rojo, escrito a trazos 0–1,6 s (si no hay zonas aceptables, pedir al Modelador; en README consta que ya las tiene). Aparece «China» (≥ 84 px) bajo él. A los 1,7 s: «kara» en rōmaji como onda (círculos concéntricos finos, tinta, expansivos) sobre el kanji, y «kara» se queda como texto fijo (también lo usa el plano 4). No poner «Tang». Tarjeta «唐 = China». Funciones: `H2.kanji`, `C.tarjeta`.
**Plano 04 (PLANO ESTRELLA)** · 2,8 · 2D, papel. `MV.tintaKanji(ctx, 540, 860, 640, prog)` con `prog = U.prog(t, 0.2, 2.1)` (0–0,1 唐 se ve; 0,1–0,45 mancha; 0,4–1 se escribe 空). Antes y después, mantén el kanji quieto al menos 0,3 s al principio y 0,5 s al final (respiración). «kara» fijo debajo, idéntico en tamaño/posición al del plano 3 (corte continuo). Tarjeta «空 = vacío» aparece cuando se cierra el último trazo (t ≈ 2,1) con `t0: 2.1`. Añade goteo/sombras suaves de papel mojado si sobra tiempo; no cargues de elementos. Cuidar: el kanji cabe en 1080 sin cortarse, y la mancha tiene que verse mojada, no un borrón gris sucio. Funciones: `MV.tintaKanji`, `C.tarjeta`.
**Plano 05** · 3,5 · 3D. Silueta de Hanashiro (`MV.crearHanashiro()`, distinta de Funakoshi: más baja, ancha, casquete) con un manual cerrado (cubierta 空手, `tapa` papel). Cambio a mitad (1,7 s): fecha «1905» en rojo + `C.aviso(ctx,t,'Según él y un historiador',{t0:1.7})`. Tarjeta «1905: Hanashiro». Nunca «el primero» ni «inventó». Libro a la vista (ver reglas del libro). Funciones: `MV.crearHanashiro`, `MV.crearLibro({texto:'空手'})`, `C.fecha`, `C.aviso`.
**Plano 07** · 2,5 · 2D. `MV.pantallaPartida(ctx, t, { p: U.prog(t,0,0.6), rotuloA:'Tokio', rotuloB:'Okinawa' })` (arriba 空手 firme, abajo interrogaciones rojas vía `MV.interrogaciones`; si quieres, siluetas hablando abajo no hacen falta). Tarjeta «Tokio: 空手. Okinawa: ¿?» si cabe a 84 px en y ≥ 300; si choca con el rótulo, tarjeta de dos líneas a 72 px nunca menos de 48. Sin fechas. Funciones: `MV.pantallaPartida`, `MV.interrogaciones`.

### Tramo B
**Plano 08** · 3,0 · 3D. Edificio `MV.crearEdificioNaha({ rotulo:'Naha' })`, cámara cerrada en rótulo; a los 0–1,2 s se ve el edificio, a ≈ 1,2 s la `ventana(f)` se abre y corte/fundido a la mesa de nueve (`MV.crearMesaNueve`, elevación 30°, periódico visible en el centro) hasta el final. Cartel `fecha(ctx,'25 oct 1936',p)` (rojo). Tarjeta «Naha, 1936: nueve maestros». Nueve siluetas sin rasgos, no poner a Funakoshi. No dibujes Naha como edificio realista: es cartel. Funciones: `MV.crearEdificioNaha`, `MV.crearMesaNueve`, `C.fecha`.
**Plano 09** · 3,5 · 3D mesa (la misma construcción que 8). `mesa.pose(P,{ t, alzan:[0,2,3,6], f })` con `f` creciente (manos arriba), `H2.kanji(ctx,'空',…)` en rojo sobre ellas a trazos (≈ 0,3–1,6 s); a mitad (1,7 s): `mesa.mirarse(P,t)`, `MV.selloInterrogante` rojo sobre la mesa y `MV.reloj(ctx,t,x,y,size)` que gira. Tarjeta «Varios dicen 空. Sin decisión.»; sin «la mayoría». Opcional: letra pequeña «No decidimos en esta reunión» solo si hay cita verificada en dosier (comprobar antes). Funciones: `MV.crearMesaNueve`, `.pose`, `.mirarse`, `MV.reloj`, `MV.selloInterrogante`, `H2.kanji`.

### Tramo C
**Plano 06** · 3,5 · 3D. Funakoshi en silueta en un despacho de Tokio (mesa baja + libro grande; basta una pared y suelo del dōjō) y `crearLibro({texto:'空手'}).abrir(f)` que se despliega delante (`abrir(0→1)` entre 0,2–1,6 s; libro sobre la mesa, cubierta a cámara). Cambio a mitad: `fecha(ctx,'1935',p)` y tarjeta «manual» (primera mención de *Kyōhan*). Tarjeta «1935: Kyōhan, 空手». Sin 1929, sin motivo político. Funciones: `MV.crearFunakoshi`, `MV.crearLibro`, `C.fecha`.
**Plano 10** · 3,5 · 3D. Silueta de Funakoshi en `yoi`, manos abiertas (frontal o 3/4, `esc.orbita` con `distancia ≈ 6`); a ≈ 1,7 s: `H2.kanji(ctx,'空',…)` a trazos y resplandor suave (`H2.resplandor` bajo, o halo) y las manos se abren más (mezcla `yoi` → pose abierta; si no hay, `brazos-arriba` a 0,2). Tarjeta «Sin armas. Sin vanidad.» Nada de mushin ni Sutra. Funciones: `MV.crearFunakoshi`, `H2.kanji`, `H2.resplandor`, `P.yoi`.
**Plano 11** · 2,2 · 3D. Karateka a cámara (`new Karateka3D({cinturon:'negro'})`, brazos cruzados si hay pose, `k.cara({ sonrisa: 0.6, cejas: 0.3 })`), detrás carteles `H3.crearCartel`/2D de 唐手 y 空手 flotando. Último fotograma: 空手 en rojo grande (para bucle con el plano 1, que empieza con 空手 en tinta: coincidir en posición y = 860, size 470 si es posible). Tarjeta «¿Lo sabías?». Funciones: `Karateka3D`, `k.cara`, `H2.kanji`, `C.tarjeta`.

## Cierre (jefe/editor)
Concatenar `plano-01…11.mp4`; total 34,0 s. Cortes al compás de la voz. Plano 4 respira, no recortar.

## Pendiente (para el jefe / Modelador 3D)
- Resuelto en `comun.js`: `iniciar3D/2D`, `papel`, `tarjeta`, `letraPequena`, `aviso`, `fecha`, `pasadaPincel`.
- Siluetas marrón oscuro por la luz (aviso del Modelador): pendiente de decidir con prueba en plano 2.
- Libro con pose `recibir` tapa las manos: los planos 2, 5, 6 usan mesa o distancia distinta; el primero que lo resuelva lo apunta aquí.
- (los animadores añaden aquí lo que dibujen)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 0,8, 1,0, 1,8 y 1,9 revisados; clip 2,8 s / 84 fotogramas (10 s de render). El pincel es una pasada ondulada gruesa; al final queda 唐手 limpio (primera versión dejaba restos de 空: corregido con ancho 680 de borrado).
