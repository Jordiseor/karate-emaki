# Plan de animación 3D · notas del móvil (18 s, 9 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hechos `src/notas2d.js`, `src/comun.js` y el **plano 1** (referencia: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`, `hoja-01.png`). Plano 1: 78 fotogramas en 48 s (≈ 0,6 s/fotograma; ≈ 18 s de render por segundo de clip). Los animadores de tramo no tocan `animacion/`, `comun.js`, `notas2d.js` ni `plano-01.*`.

## Reglas comunes
- Copia `src/plano-01.html` → `src/plano-NN.html` (rutas `../../../../animacion/...`, `import * as C from './comun.js'`; `const { U, N } = C`). Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Lo que falte (poses, props, caras), defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-23-notas-movil/escenas3d/`:
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png      # prueba t = 0, mitad y final; MÍRALA antes
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png       # clip + captura central
  ```
  `window.DURACION = C.DUR[NN-1]` (tabla, exacta). Escala 0,5 fijada por `C.iniciar()`. Determinista: todo en función de `t`.
- `const S = C.iniciar({ rumbo, extras: [{ cinturon: 'negro' }] })` → `{ ctx, esc, P, k (blanco), otros[], U }`. El protagonista es SIEMPRE el mismo karateka de cinturón **blanco**; la niebla ya está ajustada (sin esto el dōjō se borra a distancia).
- Orden en cada fotograma: `k.colocar(...)` ANTES de `k.aplicarPose(...)` → `k.cara(...)` → `C.cam(esc, 'frontal'|'media'|'cara', {…})` o `esc.orbita` → `esc.sombraEn(0,0)` → `esc.dibujar(ctx, { vineta: true })` → capa 2D.
- Cámaras en `C.CAM`: `frontal` (karateka pequeño abajo, marco de móvil arriba: planos 1, 8, 9), `media` (cuerpo entero normal), `cara` (primer plano, planos 6: `distancia 3.2 → 2.8`). Cabeza ≈ y 900 y pies ≈ y 1590 en `frontal`.
- Capa 2D (de `notas2d.js`, importada como `N`): `N.marco(ctx, { caja, escala, pliegue 0..1, giro, dx, dy, alfa })` → `hoja`; `N.escribir(ctx, hoja, texto, { y, size 72+, p 0..1, cursor, t, x, color })` (letra a letra con cursor); `N.escribirLineas`; `N.visto(ctx, hoja, p)` (rojo, cae y se traza); `N.bocadillo(ctx, '¡Osu!', { x, y, p 0..1, size, cola: 'izq'|'der'|'abajo', quiebre 0..1, escala, giro })` (pop con rebote; `quiebre` rompe «¡Ki-ai-…!» en una rayita). Plegado de la lista = `pliegue` de `N.marco` (la hoja se aplasta sobre el marco) con el texto dibujado antes dentro de la misma transformación o, más simple, con `alfa` bajando; si hace falta, anótalo.
- `C.etiqueta(ctx, t, { pre:'Sensei (', jp:'先生', post:'): el nacido antes', t0, y: 1500 })`: etiqueta pequeña (≥ 48 px), rojo solo el término japonés. Zona segura: no pasar de y ≈ 1570 abajo ni subir de 250 arriba.
- Texto en la nota: ≥ 72 px, tinta sobre papel; ≤ 7 palabras. Rojo SOLO en términos japoneses de las etiquetas, «10:00», ondita del plano 6 y visto final. Sin muesca, iconos, barra de estado ni logo de ninguna app.
- Kanji (comprobado en `scratchpad/kanji.png`): 先生, 先輩 y 気合 se ven bien con la fuente Noto Sans CJK JP en etiqueta (`C.etiqueta`) y con `H2.kanji` (先生 a trazos, serif). 気 sale en la forma japonesa. Sin kanji de rei ni dōjō.
- Voz: sempai amable; arranca a 0,0 s. Sin audio en estos clips. Personas reales: ninguna.

## Duraciones exactas (`C.DUR`; suman 18,0 s)
| Plano | Inicio | Duración | Cámara / imagen |
| --- | --- | --- | --- |
| 1 | 0,0 | 2,6 | `frontal`; marco con título, «1.» con cursor (HECHO) |
| 2 | 2,6 | 1,8 | `media`, yoi + 4 bocadillos «¡Osu!» (cada 0,35 s, crecientes) |
| 3 | 4,4 | 1,8 | de espaldas (rumbo 180), pies-juntos → rei; «?» sobre la pared |
| 4 | 6,2 | 1,8 | cámara baja, negro al fondo (z −1,8) + blanco encoge-hombros |
| 5 | 8,0 | 1,8 | perfil, verde delante en choku-zuki-kiai y blanco detrás con 0,3 s de retraso |
| 6 | 9,8 | 1,8 | primer plano de la cara, kiai que se quiebra, ondita roja, mano-hara |
| 7 | 11,6 | 1,8 | seiza + `temblar`, cronómetro «10:00» rojo, gota, «¡Ayuda!» |
| 8 | 13,4 | 1,6 | `frontal`: yoi, nota «8.» y visto rojo, la lista se pliega |
| 9 | 15,0 | 3,0 | marco grande con nota nueva y cursor; pulgar arriba; el último fotograma repite el encuadre del 1 |

Suma: 2,6 + 1,8×6 + 1,6 + 3,0 = 18,0 s. Palabras por plano: 7, 3, 3, 4, 3, 3, 3, 3, 4 = 33 (1,8 palabras/s).

## Reparto (2 tramos de 4 planos; el plano 1 ya está hecho)
| Tramo | Planos | Duración | Render estimado |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 | 2,6 | 0,8 min |
| **A** | 2, 3, 4, 5 | 7,2 | un karateka (2) o dos (4, 5): ≈ 0,6–1,2 s/fotograma → ≈ 4 min |
| **B** | 6, 7, 8, 9 | 7,0 | 6 con cierre de cara (`escala 0,5`, ≈ 0,6 s/fot.); 7 seiza; 8 y 9 casi 2D: ≈ 3 min |

### Tramo A
**Plano 02** · 1,8 · Nota «Decir «osu» a todo.» (tarjeta sobre el marco arriba, ya escrita al entrar: `N.escribir` con `p` 0→1 en 0,3 s) y etiqueta «Osu: origen discutido» (`C.etiqueta` sin kanji, `pre:'Osu: '`, sin `jp`; rojo no: solo tinta). `k` en `yoi`, sonrisa grande (`sonrisa 0.9`), gira la cabeza a cada bocadillo (`cabeza.giro` ±25). Cuatro `N.bocadillo` «¡Osu!» en posiciones alrededor (izq/der alternando), `p = U.prog(t, 0.2 + i*0.35, +0.25)`, `size` 84 → 120 → 150 → 180 (cada vez más grande; el 4.º ≤ 960 px de ancho). Cámara `media`.
**Plano 03** · 1,8 · Tarjeta «Saludar. ¿A quién?». `k.colocar(0, 0, 180)` (de espaldas), `mezclar(P['pies-juntos'], P.rei, U.easeInOut(U.prog(t,0.1,0.6)))`, vuelve a `pies-juntos` y gira la cabeza a un lado, al otro y al frente (`cabeza.giro` ±40) 0,9–1,6 s; el «?» pequeño de tinta (overlay.texto, ≥ 72 px) sobre la pared con `esc.proyectar`. Cámara 3/4 trasera `esc.orbita({ ...C.CAM.media, azimut: 25 })`. Sin kanji, sin afirmar a quién se saluda.
**Plano 04** · 1,8 · `extras: [{ cinturon: 'negro' }]` en z −1,8, yoi, serio, quieto (`k.cara({ sonrisa: 0 })`). Blanco delante: `P['encoge-hombros']` + pulgar por encima del hombro (si no hay pose, `{...pose, brazoD: …}` y anótalo), asiente (`cabeza.inclina` oscilante). Tarjeta «Sensei: ese de ahí.» + `C.etiqueta({ pre:'Sensei (', jp:'先生', post:'): el nacido antes' })`. Cámara baja `elevacion 0`, fov 26, `distancia 8`. El de fondo no hace nada.
**Plano 05** · 1,8 · Perfil (`rumbo 90`, `C.cam(esc,'media',{azimut:0})`). Verde (`extras: [{cinturon:'verde'}]`) delante y blanco detrás (≈ 1,1 m), ambos `mezclar(P.yoi, P['choku-zuki-kiai'], f)`; el blanco con `t - 0.3` (retraso 0,3 s), serio. Ciclo yoi → golpe → yoi dos veces como mucho; `CARAS.kiai` solo el verde y con boca moderada, sin sonido de golpe fuerte. Tarjeta «Sempai: el veterano. Imitarle.» (≤ 7 palabras) + etiqueta `pre:'Sempai (', jp:'先輩', post:'): más experiencia'`. Si se quita este plano, ver «Recomendación».

### Tramo B
**Plano 06** · 1,8 · Primer plano de la cara (`C.cam(esc,'cara',{ distancia: 3.2 - 0.4*U.prog(t,0,1.8) })`, empuje 1,0 → 1,15 de escala). Toma aire (0–0,5 s, `ojos`), `CARAS.kiai` 0,5–1,3, bocadillo `N.bocadillo('¡Ki-ai-…!', { quiebre: U.prog(t,1.0,1.4) })`; ondita roja (2D, círculos que suben desde y ≈ 1500 hacia arriba) y `P['mano-hara']` (a partir del busto no se ven las manos: encuadra `centro y 1.4` para que alcance el vientre, o muestra solo la ondita). Tarjeta «Kiai: abdomen, no garganta.» + etiqueta `pre:'Kiai (', jp:'気合', post:'): ki = energía'`. Rojo solo en ondita y 気合. Si el cierre exige `escala: 1`, avisar antes (4 veces más lento).
**Plano 07** · 1,8 · Frontal fija, `distancia 7` (`C.CAM.media`), `C.ponerPose(k, C.temblar(P.seiza, t, 1))` (`ponerPose` es imprescindible: `aplicarPose` a secas flota), cara `CARAS_SEIZA.aguantando`; `cronometroSeiza(ctx, { minutos: 10, rojo: true })` y `gotaSudor(ctx, 700, 560, t)` de `seiza2d.js`. Una mano de tinta 2D escribe «¡Ayuda!» en la nota (`N.escribir`, cursor, tinta; el marco puede asomar arriba pequeño). Tarjeta «De rodillas, minuto 10. Ayuda.» Reutiliza el plano 2 de `2026-11-17-seiza` como guía. Sin cifra ni consejo médico.
**Plano 08** · 1,6 · `frontal`: yoi, sonrisa tranquila (`CARAS_SEIZA.tranquilo`), marco con la lista (líneas 1–7 en gris, «8.» se escribe 0–0,4 s: «Próxima clase: osu.»), `N.visto(ctx, hoja, U.prog(t, 0.5, 1.0))` y la lista se pliega 1,0–1,6 con `pliegue`. Es el único «osu» repetido: sin etiqueta. Tarjeta = la propia nota «Próxima clase: osu.» (72 px, ≤ 4 palabras).
**Plano 09** · 3,0 · Cierre y bucle. El fotograma final repite el de t = 0 del plano 1: mismo `N.marco`, misma cámara `frontal` y misma pose si la pose final lo permite (karateka en la pose del plano 1 con el pulgar hacia arriba, ver abajo). Tarjeta «¿Cuál fue tu primera nota?» (84 px, 3 líneas) visible desde 0,0 s y legible 2 s (mínimo 15,2–18 s); nota nueva en blanco con cursor parpadeando. Karateka a un lado sonriendo con el pulgar arriba (`{ ...P.neutra, brazoD: {adelante: 90…}, manoD: … }`, anótalo en Pendiente). Para el bucle limpio con el plano 1: fundir la nota nueva a vacío 2,4–3,0 s y que el título del plano 1 entre ya visible (el Editor decide el corte).

## Recomendación sobre el plano 5 (sempai)
**Mantenerlo.** Las 33 palabras caben: cada plano da 1,6–1,8 s y la locución dura unos 1,8 palabras/s (tabla de arriba); ningún plano pasa de 4 palabras salvo el 1 (7 palabras en 2,6 s, el más cargado pero con 2,6 s). El 5 es el único donde el blanco imita a un personaje y el gag del «novato que copia» es el que sostiene el resto. Solo si Sonido mide que la voz sintética sobrepasa 18,5 s: quitar el 5 y dar +0,9 s al 4 (1,8 → 2,7) y +0,9 s al 6 (1,8 → 2,7); entonces pierde la etiqueta de sempai y el reel queda con 3 términos japoneses.

## Cierre (jefe/editor)
Concatenar `plano-01…09.mp4`; total 18,0 s (540 fotogramas). El corte 9 → 1 del bucle es directo.

## Pendiente
- (los animadores añaden aquí lo que dibujen: pulgar arriba, pulgar por encima del hombro, ondita roja…)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 1,3 y 2,6 revisados, clip 2,6 s / 78 fotogramas, hoja en `hoja-01.png`. Mejorable: la pose «móvil» (manos abiertas al frente) no lleva móvil en las manos y la cabeza gacha se nota poco a esta distancia; no se ha añadido prop 3D para no complicar.
