# Biblioteca de animación · KARATE EMAKI

Cada escena es un HTML con un `<canvas id="c">` y una función **determinista** `window.render(t)` (t en segundos).
Chrome sin cabeza (Playwright) la dibuja fotograma a fotograma y ffmpeg la une en un MP4 1080×1920, 30 fps, H.264 `-preset veryfast`, sin audio.

## Ficheros

| Fichero | Qué es |
| --- | --- |
| `marca.js` | Paleta (`EMAKI.marca.color`), tipografías, zona segura (250 px arriba, 350 abajo), utilidades (`util.prog`, easings, `rng`, ruido), `fondoPapel`, `texto` y `tarjeta` (texto con `[r]…[/r]` en rojo; encoge solo si no cabe, nunca baja de 48 px). `?zona` en la URL avisa de textos fuera de zona. |
| `sumie.js` | Sumi-e: `pincel` (trazo de pincel con grosor variable y pincel seco), `aguada`, `montes`, `kanji` (kanji a pincel que se pintan con `prog`, opción `halo`), `pino`, `puntosOla`, `casa` / `casaPuntos` / `casaUnidad` (contorno de casa japonesa, por pincel o discontinuo), `funakoshiSentado` y `funakoshiPie` (**silueta plana sin rostro**). |
| `personaje/karateka.js` | Karateka esquemático articulado: `dibujar(ctx, pose, {x, suelo, escala, dir, cinturon, estilo: 'gi'|'silueta'|'fantasma'})`, `mezclar(poseA, poseB, f)`, `esqueleto(pose)`. Devuelve puntos útiles (nudo del cinturón, manos, cabeza…). Convenio de ángulos explicado en la cabecera. |
| `poses/*.json` | Poses por ángulos de articulación: `kamae`, `zenkutsu-dachi`, `brazos-arriba` (+ `yoi` integrada). Se cargan solas al renderizar. |
| `render.mjs` | Renderizador común. |
| `lib/montar.sh` | Monta una escena con cabecera compartida (`<!--#cabecera-->` ← `cabecera.inc`) y saca `escena-NN.mp4` + `escena-NN.png` (fotograma central). `PRUEBA=1.5` → solo un fotograma de prueba. |
| `lib/hoja.sh` | Hoja de contactos (N fotogramas en fila con las líneas de zona segura) para revisar un clip. |
| `lib/prueba-poses.html` | Hoja con todas las poses, para revisarlas. |

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
