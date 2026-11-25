# Plan de animación 3D · El error del ascensor (33,4 s, 12 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hechos `src/comun.js` y el **plano 1** (`src/plano-01.html`, `plano-01.mp4`, `plano-01.png`, `hoja-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`. Plano 1: 90 fotogramas en 93 s (≈ 1 s/fotograma, dos pasadas 3D por fotograma por la pantalla partida).

## Reglas comunes
- Copia `src/plano-01.html` → `src/plano-NN.html` (rutas `../../../../animacion/...`, `import * as C from './comun.js'`). Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Lo que falte, defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-23-ascensor/escenas3d/` (OJO: la ruta es `../../../animacion/`):
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png     # prueba: t = 0, mitad y final; MÍRALA antes
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png      # clip + captura central
  ```
  Duración = `window.DURACION` (tabla, exacta). Escala 0,5 fijada por `C.iniciar()`. Determinista: todo en función de `t`. Como mucho un reencuadre por plano.
- Personajes: A = cinturón verde (recta), B = cinturón naranja (ascensor), perfil mirando a +x. Escenario tatami + dōjō de la biblioteca (`suelo: 'tatami'`). Rojo solo en rastro de la cabeza, flechas y datos clave; gris `#8A847A` para la flecha que baja.
- `const { ctx, esc, P, A, B, dA, dB, U } = C.iniciar()`: A y B ya creados con sus `Diagrama3D` (`dA`, `dB`).
- **Movimiento (comun.js)**: `C.poner(k, 'A'|'B', P, tau)` coloca al personaje en el instante `tau` del ciclo (paso de `T_PASO` = 1,1 s, avance `VEL` = 0,9 m/s desde x = 0). `C.cabeza(k, q, P, tau)` devuelve el punto de la cabeza (para `d.rastro`); `C.caderaPt(...)` el de la cadera. Cada vez que consultes puntos de otro `tau`, vuelve a llamar a `C.poner(k, q, P, tau_actual)` al final.
- **Hallazgo importante**: `mezclar(oi-zuki-migi, paso-nivel)` NO mantiene la cadera a 0,81 m (sube hasta ≈ 0,9), así que `poner` fija la cadera por desplazamiento vertical del cuerpo: **A = 0,81 siempre; B = 0,81 + `AMP` (0,11 m) × fase** (vaivén exagerado a propósito: la cifra de 5 cm es el supuesto del modelo y no se rotula en pantalla). No cambies `H_CAD`/`AMP`. Para el plano 8 (B sube/baja cámara lenta) usa `tau` más lento: `tau = t * 0.3 + fase`.
- **Pantalla partida (planos 1, 2, 5)**: `C.dibujarBanda(ctx, esc, 'A'|'B', xCamara, { zoom, ocultar: [otro] })` recorta el 3D a la banda A (y 250–925) o B (925–1570) a 300 px/m; `C.separador(ctx)`. Para el rastro de cada banda: `dA.limpiar(); dB.limpiar();` y, por banda, `d.rastro((s) => C.cabeza(k, q, P, s + PRE), { t, ventana: 2, color: C.ROJO, muestras: 44, grosor: 0.016 })` antes de dibujarla (ver plano 1). Un solo personaje a pantalla completa: `esc.orbita({ centro: [x, 0.95, 0], distancia: 8, azimut: 0, elevacion: 3, fov: 22 })` + `esc.dibujar(ctx, {})` (sin bandas).
- Texto: `C.tarjeta(ctx, t, ['…'], { t0, t1, y })` (por defecto y 262, 76 px; ≥ 48 px, ≤ 5 palabras), `C.letraPequena(ctx, '…')` (una a la vez, 48 px, borde inferior seguro), `C.etiqueta(ctx, 'Recta', x, y)` (56 px). Para fondo papel (planos 4a, 6, 7, 8 si no hay 3D): `EMAKI.fondoPapel(ctx)`. `overlay.cifra`, `overlay.ascensor`, `overlay.movilTripode`, `Diagrama3D.flecha/linea/etiqueta`, `P['encoge-hombros']` vía `C.overlay`/`C.Diagrama3D`/`P`.
- Línea de referencia: `d.linea(a, b, { discontinua: true, color: C.GRIS })`; punto de cadera: `k.punto('cadera')` + `d.cdm({ punto, vertical: false })` o esfera propia.
- Cámara: la del plano 1 se cierra al final (zoom 1 → 1,06 a 1,4–2,6 s). El plano 11 debe terminar con el encuadre del plano 1 en t = 0 (misma `dibujarBanda`, zoom 1, mismo `PRE` = 0,55 s de fase, mismo texto fuera).
- Sin cifras de energía perdida; «34 J» solo como «trabajo para subir». Sin personas reales (todo es la silueta/personaje de la cuenta).

## Duraciones (suman 33,4)
| Plano | Inicio | Dur. | Tramo |
| --- | --- | --- | --- |
| 1 | 0,0 | 3,0 | Jefe (hecho) |
| 2 | 3,0 | 2,5 | A |
| 3 | 5,5 | 2,5 | A |
| 4a | 8,0 | 1,5 | A |
| 4b | 9,5 | 2,3 | A |
| 5 | 11,8 | 2,0 | B |
| 6 | 13,8 | 3,2 | B |
| 7 | 17,0 | 3,2 | B |
| 8 | 20,2 | 3,2 | B |
| 9 | 23,4 | 3,2 | C |
| 10 | 26,6 | 3,2 | C |
| 11 | 29,8 | 3,6 | C |

El storyboard dice «12 planos» pero lista 12 filas con 4a/4b (1, 2, 3, 4a, 4b, 5…11): son 12 clips; se numeran `plano-04a` y `plano-04b` (ficheros `plano-04a.*`, `plano-04b.*`), el resto `plano-NN`.

## Reparto
| Tramo | Planos | Duración | Render estimado (≈ 1 s/fotograma, 30 fps; banda partida ≈ 2 s) |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 | 3,0 | 1,6 min |
| **A** | 2, 3, 4a, 4b | 8,8 | ≈ 7 min |
| **B** | 5, 6, 7, 8 | 11,4 | ≈ 9 min |
| **C** | 9, 10, 11 | 10,0 | ≈ 8 min (plano 11 partido o con A + móvil) |

## Fichas

### Tramo A
**Plano 02** · 2,5 · Misma pantalla partida y fase que plano 1 pero continuando (`PRE` = 3,55 s: la fase sigue desde el plano 1). Las líneas rojas dejan de crecer y se ven enteras: cámara quieta, avance parado en t≥0,8 (`tau` congelado a 0,8 s) y rastro `ventana: 3,5` con `punta: false`. Línea discontinua gris a la altura inicial de la cabeza de cada uno (`d.linea` desde x-2 a x+2, `discontinua`). Etiquetas `C.etiqueta(ctx, 'Recta', …)` en banda A y `'Ola'` en banda B (aparecen a 0,6 s, `alpha` con `U.prog`). Tarjeta «Recta · Ola». Datos: ninguno. Ojo: congelar el personaje con la pose pico de B (u = 0,5) para que la ola quede clara.
**Plano 03** · 2,5 · Solo B, a pantalla completa de perfil, cámara lenta (`tau = 0.3 t + 0.55`), un lado del cuadro. `overlay.ascensor(ctx, 860, 700, { size: 360, flechas: 1 })` más pequeño, cuya cabina sube/baja con la cabeza de B (`dy` en píxeles = `(altura cabeza − media) × 300`, exagerado ×2). Tarjeta «El error del ascensor» (2 líneas, entrada de golpe, `t0: 0.05`). Sin cifras.
**Plano 04a** · 1,5 · Fondo papel (`EMAKI.fondoPapel`). Página de manual dibujada en 2D (rectángulo con líneas de esquema grises, sello «JKA» en rojo) que se desliza desde la derecha y se pone en primer plano (`U.easeInOut`). Tarjeta «Manual técnico JKA». Letra pequeña: «JKA Technical Division, Technical Manual for the Instructor, 2008» (48 px, quizás 2 líneas). Sin retratos.
**Plano 04b** · 2,3 · Solo A, perfil, 4 pasos. Punto rojo en cadera (`C.caderaPt`) y línea horizontal discontinua que lo sigue (cadera constante 0,81). Tarjeta «La cadera no cambia de nivel» (2 líneas). Letra pequeña: «Oi-zuki: “the hips level should not change while moving”». Solo la cadera lleva el punto. Dato: manual JKA 2008.

### Tramo B
**Plano 05** · 2,0 · Pantalla partida (reusa `dibujarBanda`): A con punto de cadera (tinta) y rastro de cabeza (rojo), las dos líneas planas y paralelas; a 1,0 s corte lateral a B (banda B): cadera y cabeza ondulan igual (dos rastros, tinta y rojo). Tarjeta «Cadera nivelada, cabeza quieta». Aclarar que la cabeza es el indicador. No poner «la JKA dice que la cabeza no suba».
**Plano 06** · 3,2 · Fondo papel y B de perfil a un lado (pantalla completa, a un lado del cuadro). Regla vertical de 5 cm dibujada con `d.linea` junto a la cabeza (rojo, marca discontinua arriba) y rótulo «70 kg» sobre el torso (2D). A 1,6 s cambio de tarjeta: «Modelo simplificado» (borde rojo) → «Supuestos: 70 kg y 5 cm». Letra pequeña: «Cuenta propia, no es un dato medido». Nota: B visualmente sube 11 cm; la regla de 5 cm es esquemática, no a escala (rotular «esquema»).
**Plano 07** · 3,2 · B sube en cámara lenta. `overlay.cifra(ctx, 540, 900, n + ' J', { size: 200 })` cuenta 0→34 con `U.easeOut(U.prog(t,0.3,2.6))`. Letra pequeña fórmula: «m·g·h = 70 · 9,81 · 0,05 ≈ 34 J · modelo simplificado». Rótulo «trabajo para subir». Tarjeta «70 kg × 5 cm ≈ 34 J». NO «energía perdida».
**Plano 08** · 3,2 · B baja. `Diagrama3D.flecha` roja ↑ al subir y gris (`#8A847A`) ↓ al bajar; la cifra baja de 34 a ≈ 20 sin llegar a cero y se rotula «parte» (sin porcentaje). Tarjeta «Parte vuelve al bajar». Honestidad: la energía potencial no desaparece.

### Tramo C
**Plano 09** · 3,2 · Perfil de B con paso y puño al frente. Flecha vertical (tinta/rojo corta) que crece y flecha horizontal «hacia delante» en gris que no crece. Tarjeta «No empuja hacia delante». Sin cifras. Afirmación cualitativa.
**Plano 10** · 3,2 · Frontal, cámara `azimut` 90 (o karateka con `rumbo` 0). `P['encoge-hombros']`, cara `{ cejas: 0.5, sonrisa: 0.15, torcida: 0.4 }`, puño ante él, «?» rojo (2D) sobre el puño. Tarjeta «Efecto en el puño: sin medir». Letra pequeña «No se ha encontrado ningún estudio que lo cuantifique». Sin comparar con velocidad ni energía del puño.
**Plano 11** · 3,6 · A en oi-zuki, junto a `overlay.movilTripode(ctx, x, y, { size: 420, cono })` que lo graba; la línea de su cabeza, recta. **Último fotograma = fotograma 0 del plano 1** (misma pantalla partida y cámara; en los últimos 0,4 s la banda B se funde a la pose de plano 1 y la tarjeta cambia a «Tu cabeza sube y baja» — o corta, a decidir por el Editor). Tarjeta «¿Sube tu cabeza?», cerrar a 3,6 s. Solo caminar en oi-zuki despacio.

## Cierre (jefe/editor)
Concatenar `plano-01, 02, 03, 04a, 04b, 05…11` (12 clips); total 33,4 s. Corte 11 → 1 directo (bucle).

## Pendiente
- `paso-nivel` mezclado con `oi-zuki-migi` NO deja la cadera a 0,81 m (sube ≈ 9 cm por la mezcla); se corrige en `comun.js` (desplazamiento vertical). Para la biblioteca: revisar `paso-nivel` o ofrecer una función `nivelar(k, h)`.
- El avance es un deslizamiento (los pies no se anclan al suelo; sin `ancla` por paso). Aceptable a cámara que sigue; si se ve en un plano a pantalla completa, bajar `VEL`.
- (los animadores añaden aquí lo que dibujen o falte en `animacion/`)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 1,5 y 2,4 revisados; clip 3,0 s / 90 fotogramas; hoja en `hoja-01.png`. Pantalla partida (A arriba recta, B abajo ola), rastros rojos desde t = 0, tarjeta «Tu cabeza sube y baja» fija, cámara se cierra un 6 % de 1,4 a 2,6 s. Mejorable: pose del medio paso parece una sentadilla con los pies juntos (viene de `paso-nivel`).
- planos 2–11: pendientes.

## Revisión del Sensei (25 nov, hoja de contactos de los 12 planos)
- Tramos A (2, 3, 4a, 4b), B (5–8) y C (9–11): hechos el 25 nov. Total ≈ 33,4 s.
- **Bloquea montaje — plano 7:** la cifra «30 J» (y el descenso 34 → 20 J) no está en el dosier: no hay dato de cuánto se recupera al bajar. Quitar la cifra; dejar solo «Parte vuelve al bajar» + «Modelo simplificado».
- **Plano 6:** la captura central marca «31 J» con el título «≈ 34 J»: que el contador termine en 34 y se quede quieto al menos 1,5 s.
- Menores: 4b letra pequeña sobre las piernas y ritmo acelerado; 2 ola sutil (33 px); 5 papel vacío hasta 1,0 s; 10 sin puño (encoge-hombros); 11 fundido de 0,5 s turbio (el Editor puede cortarlo).
- Biblioteca: mezclar(oi-zuki-migi, paso-nivel) sube la cadera a ≈ 0,9 m y los pies se deslizan (para el Modelador 3D, próxima tanda).
