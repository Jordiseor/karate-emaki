# Plan de animación 3D · hikite (27 s, 11 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia de estilo: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`). Los animadores de tramo no tocan `animacion/` ni `comun.js` ni `plano-01.*`.

## Reglas comunes
- Copia `src/plano-01.html` como base (mismas rutas: `../../../../animacion/...`; `import * as C from './comun.js'`). Un fichero por plano: `src/plano-NN.html`. **No hay ficheros compartidos que editar**: si te falta una ayuda, defínela dentro de tu plano y apúntala abajo en «Pendiente para el jefe».
- Salida, desde `piezas/2026-11-12-hikite/escenas3d/`, escala 0,5 (la fija `C.iniciar()`):
  ```bash
  # 1) fotograma de prueba (míralo ANTES): t = inicio, mitad y final
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png
  # 2) clip + captura central
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png
  ```
  Nombres: `plano-NN.mp4` y `plano-NN.png` (NN con dos cifras) en `escenas3d/`. Cada animador escribe **solo** sus `plano-NN.*` y `src/plano-NN.html`. Duración = `window.DURACION` (ver tabla). ≈ 50 s de render por plano de 2,5 s.
- Texto: usa `C.tarjeta(ctx, t, [líneas], { t0, y })` (por defecto arriba, y=300; si tapa la cabeza, `y: 270` y baja la cámara como en el plano 1). Fotograma 0 con la tarjeta ya visible solo en el plano 1; en el resto entra con `t0: 0.1`. Rojo `[r]…[/r]` NO en texto salvo el kanji; el rojo es solo rastro/flecha del hikite, el golpe y 引き手. Zona segura 250 arriba / 350 abajo.
- Cámara: `esc.orbita({...C.CAM.perfil|frontal|general|tres4})`. Perfil del lado del hikite: `k.colocar(0,0,-90)` (mira a la izquierda de pantalla, se ve su lado izquierdo). 3/4 de arranque: `C.RUMBO_34` (-40) con `C.CAM.tres4`.
- Poses: `P['zenkutsu-dachi']`, `P['gyaku-zuki-kiai']` (hikite completo en cadera), `P['hikite-medio']` (error), `P['agarre-brazo']`→`P['tiron-cadera']`, `P['rival-brazo-extendido']`, `P.neutra`. `C.golpe(P, f)` = zenkutsu → gyaku-zuki-kiai (f 0..1, piernas quietas). Rastro rojo: `C.rastro(ctx, esc, k, poseEn, t, { punto:'manoI', cola, alfa })` se llama **después** de `esc.dibujar`. Flechas: `d.flecha({desde:[x,y,z], hacia:[x,y,z], crecer})`, arco `d.arco`. Kanji: `C.H2.kanji(ctx,'引き手',x,y,size,{prog, halo:0.7})`.
- Sin cifras, ángulos ni %. Rival siempre `silueta('#1A1A1A')`, sin cara. Sin retratos.
- Determinismo: sin `Math.random`/`Date`. Todo en función de `t`.
- Revisa cada plano: fotograma 0/mitad/final, pies apoyados, texto en zona segura, hoja de contactos opcional.

## Reparto
| Tramo | Planos | Segundos del reel |
| --- | --- | --- |
| Jefe (hecho) | 1 | 0,0–2,5 |
| **A** | 2, 3, 4 | 2,5–10,0 |
| **B** | 5, 6, 7 | 10,0–17,0 |
| **C** | 8, 9, 10, 11 | 17,0–27,0 |

Todos los planos duran 2,5 s (75 fotogramas) salvo el 6 (2,0 s, 60 fotogramas). Locución solo informativa (no se pone en pantalla).

### Tramo A
**Plano 02** · DURACION 2.5 · perfil `rumbo -90`, `CAM.perfil`. Gesto del plano 1 en bucle lento (`C.golpe`, f de 0.3 a 1; puede repetirse ida-vuelta suave). Flecha roja (`d.flecha`, siguiendo `k.punto('manoI')`) hasta la cadera. A 0.8 s aparece 引き手 en rojo a trazos (`H2.kanji`, tamaño ~190, junto al brazo, sobre la zona libre del dōjō, fuera de las 250/350 px; `halo: 0.7`). Tarjeta: `['Hikite:', '«mano que tira»']` (t0 0.1). Locución: «Se llama hikite: la mano que tira.»
**Plano 03** · 2.5 · pantalla partida vertical: línea divisoria 2D en x=540 (tinta, 6 px), dos karatekas idénticos de perfil con la misma cámara abierta (`general`, distancia ≥ 8; cada uno en `x = ±1.1`; si no caben, dos pasadas de `esc.dibujar` con `ctx.clip()` a cada mitad). Izquierda: `P['hikite-medio']` fijo con leve vaivén, cruz roja (dos trazos 2D) junto al puño izquierdo y rastro gris (`#8A847A`) que se queda a medio camino. Derecha: gesto `C.golpe` completo, el puño llega a la cadera. Tarjeta: `['Error frecuente:', 'a medio camino']`. Locución: «Se ve mucho: la mano se queda a medio camino.» Sin consecuencias medidas. Si el partido no queda bien, avisa al jefe y propón secuencia (error → corte → bueno).
**Plano 04** · 2.5 · perfil, plano completo del lado correcto; cámara se acerca (distancia 7.2→5.0, centro hacia la cadera) mientras el hikite llega a la cadera con codo atrás (`C.golpe` f→1). En el instante de llegada (≈ 1.5 s) pausa de 0.25 s (pose congelada, pequeño rebote de cámara 0.04 de distancia) y destello rojo breve en la mano (rastro, sin texto «clac»). Tarjeta: `['Que recorra', 'todo el trayecto']`. Locución: «Que recorra todo el trayecto.» No decir «posición correcta».

### Tramo B
**Plano 05** · 2.5 · frontal `rumbo 0`, `CAM.frontal`, `P['gyaku-zuki-kiai']` con puño derecho que sale y hikite izquierdo que vuelve (`C.golpe`). Dos `d.flecha` rojas simultáneas, **misma longitud** y mismo `crecer` (adelante en el puño que golpea, atrás en el hikite). Gi tensado: pequeña inclinación de tronco hacia la cadera (no tocar poses; basta `mezclar` con `tronco`). Tarjeta: `['Uno sale,', 'otro vuelve']`. Locución: «Razón uno: un brazo sale, el otro vuelve.»
**Plano 06** · **2.0** · cámara 3/4 alta o cenital suave (`elevacion` 40–60, `distancia` 6). La cadera gira y los hombros siguen (`mezclar(a, b, {piernas, tronco, brazos})`, cada parte a su ritmo). Arco fino rojo sobre el tronco (`d.arco` sin `texto`, o curva 2D), sin cifra. Tarjeta: `['Coordina cadera', 'y tronco']`. Locución: «Y coordina cadera y tronco.»
**Plano 07** · 2.5 · corte a «pergamino»: `H2.pergamino(ctx, t, { texto: 'Bunkai', t0: 0, t1: 0.5, y: 290 })` (etiqueta, estilo `Cuentan que…`). Karateka de 3/4 en `zenkutsu-dachi` (guardia) y, frente a él a distancia de brazo, rival `silueta('#1A1A1A')` con `P['rival-brazo-extendido']` (colocación: `animacion/3d/prueba/poses-2026-11-16.html`, caso `agarre`). Entrada de la silueta con fundido o desliz corto. Tarjeta: `['Razón dos:', 'el bunkai']`. Locución: «Razón dos: el bunkai, la aplicación del kata.» (el pergamino y la tarjeta no deben solaparse: pergamino arriba y=290, tarjeta debajo o sustituye al pergamino tras 1.0 s).

### Tramo C
**Plano 08** · 2.5 · perfil `rumbo -90` (ver el rival al otro lado: ajusta como en `poses-2026-11-16.html` con `rumbo`), `CAM.perfil` centro hacia el rival `[0.6, 0.95, 0.6]`. `mezclar(P['zenkutsu-dachi'], P['agarre-brazo'], f)`: la mano izquierda abierta llega a la muñeca de la silueta; sin tirar. Calcula la posición del rival para que `r.punto('manoD')` coincida con `k.punto('manoI')` (código de la hoja de poses). Tarjeta: `['Según Funakoshi', '(traducción)']`. Letra pequeña: `C.letraPequena(ctx, 'Rentan Goshin Karate-Jutsu, 1925 (traducción al inglés)')`. Locución: «Según una traducción de Funakoshi…» Ningún retrato.
**Plano 09** · 2.5 · misma cámara y colocación del 08. `mezclar(P['agarre-brazo'], P['tiron-cadera'], f)` (cierra el puño y recoge a la cadera, 0.3–1.6 s); el rival se inclina hacia delante con `r.aplicarPose(..., { inclinar: 6–10 })` en rampa (leve, sin caída). Flecha roja de la mano a la cadera (`d.flecha`) o rastro (`C.rastro`) en el tirón. Tarjeta: `['Agarrar', 'y tirar']`. Locución: «…es agarrar y tirar del rival.» Mantén el rival sobre el suelo (`suelo: true`) y la mano rival unida a la del karateka durante el tirón (recalcula posición cada fotograma).
**Plano 10** · 2.5 · frontal, `P.neutra`, plano medio (`CAM.frontal`). Cabeza ladeada (`{...P.neutra, cabeza:{ladeo:12}}`), `k.cara({ cejas: 0.5, ... })` (duda). Dos flechas rojas pequeñas con «?» flotando sobre el puño y el hikite (`overlay`/`ctx` 2D, «?» rojo de ≥ 48 px, sobre cada puño con `esc.proyectar(k.punto('manoD'/'manoI'))`; si `neutra` los deja pegados al cuerpo, sitúalos al lado). Sin cifras ni gráficos. Tarjeta: `['¿Cuánta fuerza', 'añade?']`. Locución: «¿Cuánta fuerza añade? Los científicos aún lo discuten.»
**Plano 11** · 2.5 · **bucle con el plano 1**: `k.colocar(0,0,C.RUMBO_34)`, **`esc.orbita({ ...C.CAM.tres4 })` sin deriva en t=2.5** (el plano 1 empieza en esa cámara exacta y la deriva sale de `distancia - 0.25*…`: en el 11 haz que acabe en `distancia: C.CAM.tres4.distancia` en el último fotograma) y pose `C.golpe(P, 0.63)` (el fotograma 0 del plano 1) con micro-respiración; la mano izquierda parte de la cadera igual que en el 1, pero SIN rastro y con parpadeo `U.parpadeo`. Comprueba el último fotograma `--t 2.466` contra `plano-01.png` (`--t 0`). Tarjeta: `['¿Equilibrio', 'o agarre?']`, y en la última décima la tarjeta se va (en el plano 1 hay otra). Locución: «¿Te lo enseñaron como equilibrio o como agarre?»

## Cierre (jefe/editor)
Montaje: concatenar `plano-01…11.mp4` en orden (lista con `file 'plano-NN.mp4'`). Total 27 s (10 planos de 2,5 s + el 6 de 2,0 s → 27,0 s; el editor ajusta con la voz).

## Pendiente para el jefe (los animadores apuntan aquí lo que dibujen fuera de la biblioteca)
- (vacío)

## Estado
- plano-01: hecho (jefe), fotograma 0 revisado (rastro visible, tarjeta dentro de zona segura).
