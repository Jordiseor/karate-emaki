# Biblioteca de animación · KARATE EMAKI

Cada escena es un HTML con un `<canvas id="c">` y una función **determinista** `window.render(t)` (t en segundos).
Chrome sin cabeza (Playwright) la dibuja fotograma a fotograma y ffmpeg la une en un MP4 1080×1920, 30 fps, H.264 `-preset veryfast`, sin audio.

## Ficheros

| Fichero | Qué es |
| --- | --- |
| `marca.js` | Paleta (`EMAKI.marca.color`), tipografías, zona segura (250 px arriba, 350 abajo), utilidades (`util.prog`, easings, `rng`, ruido), `fondoPapel`, `texto` y `tarjeta` (texto con `[r]…[/r]` en rojo; encoge solo si no cabe, nunca baja de 48 px). `?zona` en la URL avisa de textos fuera de zona. |
| `sumie.js` | Sumi-e: `pincel` (trazo de pincel con grosor variable y pincel seco), `aguada`, `montes`, `kanji` (kanji a pincel que se pintan con `prog`, opción `halo`), `pino`, `puntosOla`, `casa` / `casaPuntos` / `casaUnidad` (contorno de casa japonesa, por pincel o discontinuo), `funakoshiSentado` y `funakoshiPie` (**silueta plana sin rostro**). |
| `personaje/karateka.js` | Karateka esquemático articulado: `dibujar(ctx, pose, {x, suelo, escala, dir, cinturon, estilo: 'gi'|'silueta'|'fantasma'})`, `mezclar(poseA, poseB, f)`, `esqueleto(pose)`. Devuelve puntos útiles (nudo del cinturón, manos, cabeza…). Convenio de ángulos explicado en la cabecera. |
| `poses/*.json` | Poses por ángulos de articulación: `kamae`, `zenkutsu-dachi`, `brazos-arriba` (+ `yoi` integrada) y las de física: `pies-juntos` (P1), `zenkutsu-alto` (P2), `zenkutsu-bajo` (P3), `zenkutsu-frontal` (P4, vista de frente). Se cargan solas al renderizar. Las de física llevan además `modelo` (altura del CdM, reparto, pies de base) y `revision_dosier`. |
| `personaje/karateka-frontal.js` | Karateka **de frente** (`EMAKI.karatekaFrontal.dibujar`), mismas proporciones que el de perfil. Pose: `EMAKI.fisica.poseFrontal('zenkutsu-frontal')`. Devuelve `cabeza`, `base {x0,x1}`, manos y pies. |
| `fisica.js` | Elementos de diagrama de física (ver sección más abajo). Carga después de `karateka.js` y `karateka-frontal.js`. |
| `render.mjs` | Renderizador común. |
| `lib/montar.sh` | Monta una escena con cabecera compartida (`<!--#cabecera-->` ← `cabecera.inc`) y saca `escena-NN.mp4` + `escena-NN.png` (fotograma central). `PRUEBA=1.5` → solo un fotograma de prueba. |
| `lib/hoja.sh` | Hoja de contactos (N fotogramas en fila con las líneas de zona segura) para revisar un clip. |
| `lib/prueba-poses.html` | Hoja con todas las poses de perfil, para revisarlas. |
| `lib/prueba-fisica.html` | Hoja con P1–P4 y todos los elementos de física (`--t 0..1` mueve la inclinación de las dos últimas celdas). |

## Uso

```bash
# vídeo + captura central
node animacion/render.mjs escena.html --dur 3 --out escena.mp4 --png escena.png [--congelar 0.5]
# un solo fotograma de prueba
node animacion/render.mjs escena.html --t 1.5 --png prueba.png
# escenas de una pieza (desde piezas/<id>/escenas)
../../../animacion/lib/montar.sh src/escena-01.html .
PRUEBA=2 ../../../animacion/lib/montar.sh src/escena-05.html /tmp
../../../animacion/lib/hoja.sh escena-01.mp4 hoja.png 6
```

Playwright se carga de `/opt/node22/lib/node_modules/playwright` y usa `/usr/bin/google-chrome` (no hace falta `NODE_PATH`).
Unos 5–10 fotogramas por segundo de render.

## Reglas al usarla

- Rojo `#C8102E` solo para kanji clave, años y fuego/golpes. Todo lo demás, tinta `#1A1A1A` sobre papel `#F4EFE6`.
- Nada de `Math.random()` ni de `Date`: usa `EMAKI.util.rng(semilla)` para que cada fotograma sea reproducible.
- Personas reales (Funakoshi) solo con `funakoshiSentado` / `funakoshiPie` o con el karateka en `estilo: 'silueta'`.
- Pose nueva → añade `poses/<nombre>.json` con `angulos` y una `descripcion` técnica, y revísala con `lib/prueba-poses.html`.
- Kanji: la fuente es Noto Serif CJK JP Black (no hay fuentes caligráficas); `kanji()` le añade sangrado y vetas.

## Física: `fisica.js` (`EMAKI.fisica`)

Modelo: adulto de 1,70 m. `PPM` = px por metro a escala 1 (≈444,7); `PIE` = 1 pie = 0,26 m (≈115,6 px a escala 1). Ángulos respecto a la vertical, **+ = hacia delante**.
Carga: `marca.js`, `sumie.js`, `personaje/karateka.js`, `fisica.js`, `personaje/karateka-frontal.js` (ese orden; lo hace la `cabecera.inc` de la pieza).

| Función | Qué hace |
| --- | --- |
| `figura(ctx, pose\|nombre, {x, suelo, escala, dir, cinturon, estilo, alpha, anclaPunta, modelo})` | Dibuja el karateka de perfil **con el pie del modelo** (0,26 m) y devuelve la geometría. Usa esta en vez de `karateka.dibujar` en las escenas de física. `anclaPunta: x` coloca la figura para que la punta del pie delantero caiga en x (los pies no se deslizan al cambiar de pose). |
| `geometria(pose\|nombre, opts)` | Lo mismo sin dibujar: `base {x0,x1}`, `baseM` (m), `pivote` (punta del pie delantero, en el suelo), `cdm [x,y]` (punto rojo según el modelo de la pose), `vuelco` (° = arctan(distancia del CdM al borde / altura del CdM): **8,2 / 26,2 / 30,5**), `alturaCadera_m`, `cadera`, `cabeza`, `pie` (px). |
| `poseAltura(f)` | Pose entre P2 (`f=0`) y P3 (`f=1`) **con los pies quietos** (cinemática inversa: baja la cadera, la espinilla se inclina, la trasera sigue recta). Devuelve `{pose, modelo}`; pásalo a `figura(ctx, m.pose, {…, modelo: m.modelo})`. |
| `centroMasas(ctx, [x,y], {suelo, prog, punto, vertical, rebote, r, alpha})` | Punto rojo (30 px, borde de tinta) + vertical roja discontinua. `punto` 0..1 aparece con rebote elástico; `prog` 0..1 hace caer la vertical «a plomo» con pequeño rebote. |
| `baseApoyo(ctx, {x0, x1, suelo, celdas, grosor, rojo, alerta:{t,t0,dur,hz}, prog, alpha})` | Barra de base bajo los pies con topes. `celdas: n` la parte en n marcas de «pie»; `alerta` la hace parpadear en rojo desde `t0` y se queda roja; `prog` la estira desde `x0`. `parpadeo(t, t0, hz)` es la señal booleana. |
| `arco(ctx, pivote, {desde, hasta, texto, prog, radio, size, gris, ejes, dx, dy})` | Arco rojo de ángulo y su cifra. El arco es el **barrido** del eje (toe→CdM) desde su posición inicial `desde = -vuelco` hasta `hasta = -vuelco + θ`; al llegar a θ = vuelco el eje queda vertical sobre la punta. `gris: true` = arco «fantasma» de comparación (8° en la 5, 26° en la 6). |
| `flecha(ctx, {x, y (punta), ang (0=→), largo, grosor, prog, vibra, t})` | Flecha roja de empuje; con `vibra` tiembla sin empujar. Con `grosor` 10–12 y `largo` ≈80 sirve de flechita («el punto baja»). |
| `inclinar(ctx, pivote, grados, dir, fn)` / `girarPunto(p, pivote, grados, dir)` | Giro del **cuerpo rígido** alrededor de la punta del pie: lo dibujado dentro de `fn` gira; la base y la vertical del punto rojo van fuera (son del mundo). `girarPunto` da dónde queda el punto rojo. |
| `giroCamara(ctx, p, fnPerfil, fnFrontal, {x})` | Giro de cámara de 90° (perfil → frontal) comprimiendo el ancho con cos; cambia de vista a mitad de giro. Es un truco 2D, no una rotación real. |
| `cara(ctx, centro, r, {expresion: 'reto'\|'cejas'\|'neutra', dx, dy})` | Cara mínima sobre la cabeza (por defecto el karateka no tiene rostro). |
| `etiqueta(ctx, {texto, x, y, hacia, size})` | Rótulo (≥48 px) con flechita de tinta al punto. |
| `nota(ctx, alpha, y)` | Letra pequeña fija «Modelo simplificado: cuerpo rígido, adulto de 1,70 m» (37 px, tinta al 70 %, ancho dentro de márgenes). |

Rojo solo para: punto rojo, su vertical, base en alerta, arco, flecha de empuje y cifras. Verificado en `lib/prueba-fisica.html`.
Poses de física revisadas contra el dosier: ver `revision_dosier` en cada JSON (hay dos desviaciones respecto al storyboard, explicadas allí).
