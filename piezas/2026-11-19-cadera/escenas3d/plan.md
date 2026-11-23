# Plan de animación 3D · cadera (30 s, 12 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia de estilo y encuadre: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`, `hoja.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`. Plano 1: 75 fotogramas en 41 s (≈ 0,55 s/fotograma ≈ 16 s de render por segundo de clip, un karateka + flecha + fantasma).

## Reglas comunes
- Copia `src/plano-01.html` → `src/plano-NN.html` (rutas `../../../../animacion/...`, `import * as C from './comun.js'`). Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Lo que falte, defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-19-cadera/escenas3d/`:
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png      # prueba: t = 0, mitad y final; MÍRALA antes
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png       # clip + captura central
  ```
  Duración = `window.DURACION` (tabla, exacta). Escala 0,5 fijada por `C.iniciar()` (no `escala: 1`). Un solo reencuadre por plano.
- `const S = C.iniciar()` → `{ ctx, esc, P, k, d (Diagrama3D), cad (crearCadena), fan (crearFantasma), U }`. Karateka cinturón negro en el origen, rumbo 90 (perfil, mira a la derecha). `C.iniciar({ rumbo: 0 })` para frontal. Escena determinista: todo en función de `t`.
- **Orden en cada fotograma: `k.colocar(...)` ANTES de `k.aplicarPose(...)`**, luego `d.limpiar()`, piezas, `C.camPerfil(esc)` (o `esc.orbita`), `esc.sombraEn(0,0)`, `esc.dibujar(ctx)`, `d.dibujar2D(ctx)`, y el texto 2D al final. Si no usas `cad`/`fan` en el plano, ya están ocultos.
- Cámara de perfil = `C.camPerfil(esc)` (`centro [0.1,0.95,0], distancia 7.2, azimut 0, elevación 3, fov 26`). Planos 1 y 12 usan EXACTAMENTE esa; 3–5 y 11 también (3–5 y 7 en cámara lenta); 6 la cierra a `distancia ≈ 4.5`; 2 y 10 la rodean/frontal con `azimut`.
- Eslabones: `C.poseCadena(P, f)` = `mezclarCadena(hanmi, kiai, C.eslabones(f))` (cadera 0–0,4 · tronco 0,15–0,55 · hombro 0,3–0,7 · codo/mano 0,45–0,85 del f global). Picos de las marcas: `[0.2, 0.4, 0.6, 0.8]` (pelvis, tronco, hombro, codo/puño) → orden fiel, separación esquemática. `cad.actualizar([e0..e4], { estela: { pose: (tt) => C.poseCadena(P, tt), t: f, dur: 0.3 } })`; `e` = `1 - min(1, |f - pico| / 0,12)` para que cada marcador se encienda en su pico. El marcador del puño (e4) se enciende en f ≈ 0,8 (en el codo, plano 7).
- Gráfica de picos: `C.K.ejes(ctx, caja, { etiquetaX: 'tiempo', etiquetaY: 'velocidad' })` y `C.CD.picos(ctx, caja, { prog, t, activo, … })`, caja `{ x: 150, y: 1180, w: 780, h: 460 }` (debajo del cuerpo, dentro de la zona segura; abajo quedan ≥ 350 px libres: y+h ≤ 1570).
- Texto (≥ 48 px; 250 px libres arriba, 350 abajo): `C.tarjeta(ctx, t, [líneas], { t0: 0.1, y: 300 })` (≤ 7 palabras; rojo con `[r]…[/r]` solo en golpe, flechas, marcador «en su pico», datos clave). Letra pequeña: `C.letraPequena(ctx, '…')`, una a la vez. Planos 3–7: `C.etiquetaEsquema(ctx)` («ESQUEMA, NO ESCALA», arriba a la derecha, y 262): con ella la tarjeta va en `y: 380`.
- Datos: solo los del storyboard. Sin «la mitad», sin porcentajes, sin tiempos entre picos, sin «empuja». El cuarto pico es el codo (el puño se ve en el cuerpo).
- Seguridad: solo se muestra el giro en el aire; ningún golpe a nadie.
- Posible limitación: crearCadena y fantasma se pintan por encima del cuerpo (sin oclusión).

## Reparto (segundos = `window.DURACION`)
| Tramo | Planos | Duración | Render estimado |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 (2,5) | 2,5 | 0,7 min |
| **A** | 2 (2,5), 3 (2,5), 4 (2,0), 5 (2,0) | 9,0 | cada plano ≈ 0,6 s/fotograma → ≈ 3 min en total |
| **B** | 6 (2,0), 7 (2,5), 8 (2,5), 9 (3,0) | 10,0 | 6 y 7 ≈ 16 s/s; 8 y 9 casi 2D: ≈ 3 min |
| **C** | 10 (3,0), 11 (2,5), 12 (3,0) | 8,5 | ≈ 3 min (12 repite el encuadre del 1) |

Total 30,0 s (2,5 + 2,5 + 2,5 + 2,0 + 2,0 + 2,0 + 2,5 + 2,5 + 3,0 + 3,0 + 2,5 + 3,0). Los tramos son de 3–4 planos (A y C llevan los que dependen de la hoja de pose; el tramo B lleva el 8 y el 9, que casi no tienen 3D).

### Tramo A (planos 2–5)
**Plano 02** · 2,5 · `iniciar()`; cámara 3/4 que rodea: `esc.orbita({ ...C.CAM.perfil, azimut: 40 * U.easeInOut(U.prog(t,0,2.5)) })` (rumbo 90, `k.colocar(0,0,90)`). Pose: continúa el plano 1: `mezclarCadena(hanmi, kiai, { cadera: 0.46 → 0.9 (la cadera termina de girar), tronco: C.gancho(2.5).tronco → 0.25, hombro/codo/mano: 0 })`; **el brazo NO se extiende**. Barra de cadera `d.linea(k.punto('caderaI'), k.punto('caderaD'), { color: C.ROJO, grosor: 0.03 })` opcional (el rojo se usa solo en flechas: preferible tinta). Un «?» de tinta (overlay.texto/ctx) sobre el brazo con `esc.proyectar(k.punto('codoD'))`. Tarjeta: «¿Quién arranca el golpe?». Empieza en la pose final del plano 1 (`C.poseGancho(P, 2.5)`).
**Plano 03** · 2,5 · vuelta a perfil, cámara lenta (≈ 15 %): f de `C.poseCadena` va 0 → 0,12 (ver «Línea de tiempo común»). Cinco marcadores (`cad.mostrar()`, todos apagados `e = 0`) y, abajo, `C.K.ejes` vacío entrando (`alfa`). Tarjeta «Medido en 10 karatekas» (y 380). `C.etiquetaEsquema`. Letra pequeña: «Kim, Kim, Kim 2020 · 10 atletas · puñetazo directo (choku-tsuki)».
**Plano 04** · 2,0 · misma cámara; f 0,12 → 0,32: el marcador 0 (cadera) llega al pico en f = 0,2 y se pone rojo, nace el pico 1 en la gráfica (`CD.picos(… activo: 0 …)`). Tarjeta «Primero la cadera». Etiqueta esquema.
**Plano 05** · 2,0 · f 0,32 → 0,5; pico del tronco en f = 0,4 (marcador 1 rojo, el 0 vuelve a tinta), segundo pico en la gráfica. Tarjeta «Luego el tronco». Etiqueta esquema. Sin cortar la cámara lenta.

### Tramo B (planos 6–9)
**Plano 06** · 2,0 · cámara cerrada: `C.camPerfil(esc, { distancia: 4.5, centro: [0.1, 1.3, 0] })`; f 0,5 → 0,68; pico del hombro en f = 0,6 (marcador 2 rojo); tercer pico. Tarjeta «Después el hombro». Etiqueta esquema.
**Plano 07** · 2,5 · f 0,68 → 1: el codo (f = 0,8, marcador 3 rojo, cuarto pico) y el puño llega a `gyaku-zuki-kiai` (f = 1) con rastro rojo corto del puño (n puntos de `k.punto('manoD')` con `poseCadena(tt)`, como `C.rastro` de tiempo-contacto: defínelo en el plano). Gráfica con los cuatro picos (`activo: 'todas'`). Tarjeta «El puño, el último». Dejar respirar 0,5 s al final (f = 1 fijo). Etiqueta esquema.
**Plano 08** · 2,5 · fondo papel (`EMAKI.fondoPapel(ctx)`, sin 3D o con k a un lado): `C.K.columnas` cuatro columnas que crecen de izquierda a derecha («cadera, hombro, codo, muñeca»), la última en rojo, textos «≈ 2,4 · ≈ 4,3 · ≈ 7 · ≈ 7,3 m/s»; sin tiempos. Tarjeta «Cada eslabón, más rápido». Letra pequeña: «Según un estudio de gyaku-zuki · Suwarganda et al., ISBS · velocidad lineal de marcadores».
**Plano 09** · 3,0 · `C.iniciar({ rumbo: 0 })` frontal (`distancia 7, fov 26, centro [0,0.95,0]`): `mezclar(P.neutra, P['encoge-hombros'], U.easeBack(f))`, cara `{ cejas: 0.5, sonrisa: 0.15, torcida: 0.4 }`; tres «%» de tinta con «?» sobre ella (2D). Tarjeta «Porcentajes: sin medir». Letra pequeña: «No se ha encontrado ningún estudio de karate que lo cuantifique». Sin cifras.

### Tramo C (planos 10–12)
**Plano 10** · 3,0 · cámara frontal (`C.iniciar({ rumbo: 0 })`, `azimut: 0`): hanmi → shōmen: `mezclarCadena(hanmi, kiai, { cadera: s, tronco: s, hombro: s, codo: s, mano: s })` con un MISMO `s` (puño y cadera a la vez, sin adelantarse). Rótulos breves ≥ 48 px: «hanmi: de medio lado» y luego «shōmen: de frente». Tarjeta «Ni antes ni después». Letra pequeña: «Tsutomu Ohshima (SKA), práctica de 2007 · transcripción libre». Visto de frente el puño crece hacia el espectador: `distancia ≈ 6–7`; no afirmes que contradiga la secuencia.
**Plano 11** · 2,5 · perfil (`k.colocar(0,0,90)`, `C.camPerfil`), `P['gyaku-zuki-kiai']` o `poseCadena(P, 1)`. Flecha roja quebrada por `k.punto('cadera') → pecho → hombroD → codoD → manoD` (`d.linea` de grosor 0,03 tramo a tramo con `crecer`, y `d.flecha` al final que se estira). Tarjeta «La cadera abre la cadena». Sin «empuja», «fuente principal» ni «la mitad».
**Plano 12** · 3,0 · **bucle con el plano 1**: `C.iniciar()`, `C.camPerfil(esc)` igual, tarjeta grande «¿Mueves la cadera… o solo el brazo?» (`y: 300`, `size: 84`, 2–3 líneas; el plano 1 tiene la suya en el mismo sitio). Karateka en guardia, cadera lista: parte de `P['gyaku-zuki-hanmi']` (f = 0 en 0–1,2 s con respiración leve) y entre 1,2 y 3,0 lleva `mezclarCadena(hanmi, kiai, C.gancho(0))` → en **t = 3,0** el último fotograma es EL de t = 0 del plano 1: pose `C.poseGancho(P, 0)`, `fan.poner(FANTASMA, 1)` (copiar de plano-01: `FANTASMA = k.punto('manoD')` con la hanmi), flecha roja, misma cámara y luz (sin texto en ese fotograma si el plano 1 no lo tiene: el plano 1 SÍ tiene tarjeta «El puño es lo último en moverse»; para el bucle limpio, funde la tarjeta del 12 a 0 en los últimos 0,4 s y haz entrar la del 1 con `t0: -1`, ya visible). El corte 12 → 1 lo hace el Editor.

## Línea de tiempo común de la cadena (planos 3–7, cámara lenta)
f(t) continuo para que los cortes casen: plano 3 f 0 → 0,12 · plano 4 0,12 → 0,32 · plano 5 0,32 → 0,50 · plano 6 0,50 → 0,68 · plano 7 0,68 → 1 (con 0,5 s final quieto). Cada plano lo calcula con velocidad constante `f = f0 + (f1 - f0) * U.prog(t, 0, DUR)` para que el corte no tenga tirón.

## Cierre (jefe/editor)
Concatenar `plano-01…12.mp4`; total 30,0 s. Corte 12 → 1 directo (bucle).

## Pendiente
- (los animadores añaden aquí lo que dibujen: rastro del puño, «?» y «%», rótulos hanmi/shōmen…)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 0,5 y 1,25 revisados, clip 2,5 s / 75 fotogramas, hoja en `hoja.png`. Cadera `G0 = 0,16 → G1 = 0,46`, tronco algo retrasado, brazo sin extender, fantasma gris en el puño inicial y flecha roja delante de la cadera. Mejorable: la flecha sale desde fuera del cuerpo (z + 0,3) para no taparse; el fantasma y la mano se solapan en t = 0.
