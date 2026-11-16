# Plan de animación 3D · kiai-gallo (9,0 s, 6 planos, bucle)

Jefe de animación · 2026-11-16 · Reparte: **tramo A = planos 2–3**, **tramo B = planos 4–6**. Plano 1 hecho (referencia).

## Reglas comunes
- Todo en `escenas3d/src/`. **No modificar `comun.js` ni `plano-01.html`** ni `animacion/`. Cada animador crea `plano-NN.html` copiando `plano-01.html` (importa `./comun.js`, rutas `../../../../animacion/...`).
- `comun.js` exporta: `crearToma()` (`esc`, `fila`, `P`, `M`; `toma.fijar(T)` pone la fila entera en el instante GLOBAL T con golpes, giro, manos, caras y respiración; `toma.poseDe(i,T)`, `toma.caraDe(i,T)`, `camFila()`), `INICIO`, `DURACION`, `T_GOLPE`, `T_GALLO`, `T_MANOS`, `CAM_FILA`, `bocadillo`, `bocadilloRoto`, `destello`, `tarjeta`, `ROJO`.
- **Tiempo**: cada plano usa t local y `T = INICIO[n] + t` (INICIO = 0, 1,6, 3,6, 4,8, 6,0, 8,2). `window.DURACION = DURACION[n]`. Los instantes de abajo van en tiempo global T salvo que se diga «local».
- Karatekas 0..4 de izquierda a derecha de pantalla; el **quinto (i=4, cinturón marrón) es el del gallo**. Cinturones: blanco, amarillo, verde, azul, marrón.
- Cámara de fila: `CAM_FILA` = centro [0,1,0], distancia **14,2**, elevación 4, fov 26; separación 0,65; fog 16/60. (Aviso: con 12,5 y 0,7, como decía el README, los de los extremos salen cortados por la mitad.) En ese encuadre las cabezas están en x ≈ 155 / 350 / 540 / 730 / 920 px y y ≈ 790 px; la boca ≈ y 810; el vientre (cinturón) ≈ y 970.
- Tarjetas: `tarjeta(ctx, t, 'TEXTO [r]rojo[/r]', t0, t1)` (t local), 96 px, abajo (zona segura). Una a la vez, ≤5 palabras. Rojo solo kiai y hara.
- Orden de dibujo: `fondoPapel` → `toma.esc.dibujar(ctx)` → overlays 2D (destello, bocadillo) → tarjeta.
- **Render** (desde `escenas3d/`, escala 0,5 ya fijada en `crearToma`):
  1. prueba: `node ../../../animacion/render.mjs src/plano-NN.html --t <local> --png /tmp/.../prueba.png` y MIRARLA.
  2. clip: `node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png` (el png sale del fotograma central). ≈1,2 s por fotograma (plano 1: 58 s para 1,6 s).
  3. Nombres exactos: `plano-02.mp4/png` … `plano-06.mp4/png`.
- Si falta algo reutilizable, dibújalo en tu plano y anótalo abajo en «Faltas detectadas».

## Hecho: plano 1 (0–1,6 s)
Fila en yoi, cámara fija, respira una vez (escala Y 1 %, 0,3–1,5 s), tarjeta «RONDA DE [r]KIAI[/r]» a 0,1 s. Fotograma 0 sin texto. **Cierre del bucle**: `toma.fijar(9.0)` da la misma fila que `fijar(0)` (respiración 0, manos 0, giro 0, sonrisa 0) → comprobado: PSNR 79 dB entre el fotograma 0 y T=9,0 (diferencia de ruido de render). El plano 6 debe terminar en esa misma pose y encuadre, sin texto.

## Tramo A: planos 2 y 3

### Plano 2 · 1,6–3,6 s (2,0 s) · `plano-02.html`
- Cámara `camFila()` fija. Pose/cara ya resueltas por `toma.fijar(T)`: golpes (choku-zuki-kiai, vuelven a yoi) a T = 1,7 / 2,2 / 2,7 / 3,2 para i = 0..3 (= t local 0,1 / 0,6 / 1,1 / 1,6). El quinto **no** golpea aquí (golpea a 3,7, ya en el plano 3).
- Por cada golpe: `destello(ctx, xCabeza[i], 810, prog(t, a, a+0.25))` en rojo, y la tarjeta `¡[r]KIAI[/r]!` pulsa (aparece en cada golpe; escala 1 → 1,15 → 1 en 0,2 s; usa `tarjeta` con `t0` por golpe o `overlay.texto` con `size` animado; una sola a la vez, se renueva en cada golpe y se apaga a 3,5).
- Opcional: bocadillo pequeño `¡KIAI!` (`bocadillo`, size 90, `rojo:true`) sobre la cabeza que golpea, 0,3 s. Si satura, solo destello + tarjeta.
- Texto exacto: `¡KIAI!` (KIAI en rojo).

### Plano 3 · 3,6–4,8 s (1,2 s) · `plano-03.html`
- El quinto (i=4, `toma.M[4]`) golpea a T=3,7 (local 0,1) y se quiebra a T_GALLO = 3,8 (local 0,2; cara pasa de `CARAS.kiai` a `CARAS.gallo` en 3,7–3,9). Los otros 4 quietos en yoi (no mires: `fijar` ya los deja así).
- Cámara: 0–0,4 s local empuje de `CAM_FILA` a plano cercano de su cara: `cab = M[4].punto('cabeza')`, `esc.orbita({centro:[L(0,cab.x,f), L(1,cab.y+0.02,f), L(0,cab.z,f)], distancia: L(14.2, 3.8, f), elevacion: L(4,3,f), fov: 26})`, `f = easeInOut(prog(t,0,0.4))`. Escala `0.5` basta (si la cara se ve pastosa, `escala: 1` solo en este plano, ≈2,4 s/fotograma; avisar).
- Overlay: bocadillo `¡Ki-ai-iii…!` junto a la cabeza (`esc.proyectar(cab)`, w ≈ 820, size 100, `temblor` creciente 0,5 → 3 hasta T_GALLO); a local 0,22 se quiebra con `bocadilloRoto` (q 0→1 en 0,5 s, las mitades suben hacia el techo). Sin zona segura rota: bocadillo entre y 300 y 1500.
- Cara: sorpresa sin culpa (cejas altas se esconden bajo el flequillo: apoyarse en boca torcida y ojos muy abiertos de `CARAS.gallo`).
- Texto exacto: `¡Ki-ai-iii…!` (la última sílaba tiembla) — es el propio bocadillo; si además se quiere tarjeta, no repetirlo: sin tarjeta.
- Al final (local 1,2) la cámara sigue cerrada; el plano 4 corta en seco al frontal.

## Tramo B: planos 4, 5 y 6

### Plano 4 · 4,8–6,0 s (1,2 s) · `plano-04.html`
- Cámara `camFila()` fija. `toma.fijar(T)` ya hace: giro de cabeza de los 4 primeros (`cabeza.giro 35`, T 4,9–5,1) y las cinco manos al vientre (`mano-hara`, T 5,1–5,4), sonrisa tímida del quinto (5,2–5,5). **Comprobar el signo del giro**: los de la izquierda deben mirar hacia la derecha de pantalla (si miran al otro lado, usar `-35` en `poseDe`: avisar al jefe, que lo corrige en `comun.js` antes de integrar; el tramo B puede sobreescribir en su plano mientras tanto con `{...p, cabeza:{giro:-35*...}}`).
- «Silencio de un latido»: quietos de 4,8 a 4,9 s.
- Texto: `Nos pasa a todos` (tarjeta, t0 local 0,5; permanece hasta el fin del plano).

### Plano 5 · 6,0–8,2 s (2,2 s) · `plano-05.html`
- Los cinco con `mano-hara` (T>5,4: `fijar` ya lo mantiene hasta 8,2). Cámara: picado suave y empuje lento al abdomen: sugerencia: de `CAM_FILA` (dist 14,2, elev 4) a distancia ≈ 6, elev 12, centro apuntando al vientre del quinto (`M[4].punto('cadera')`) con zoom ≈ 1,0 → 1,15 en 2,2 s (`easeInOut`). Si las 5 manos no caben, centrar en i=2..4. Plano cercano ⇒ posible `escala: 1` solo si hace falta.
- Overlay 2D: punto rojo en el vientre del quinto a local 0,3 (`esc.proyectar(M[4].punto('cadera'))`, rebote), onda roja (anillos/curva) que sube desde el punto hasta la boca (`esc.proyectar(M[4].punto('cabeza'))`) entre local 0,6 y 1,6. Kanji `気合` pequeño a un lado: `H2.kanji(ctx,'気合', x, y, ~150, {prog, color:'#1A1A1A'})` (import `animacion/3d/historia2d.js`) con rótulo `ki = energía`.
- Textos exactos: local 0–1,2 → `[r]hara[/r] = bajo vientre`; local 1,2–2,2 → `Así se enseña`; kanji `気合` con `ki = energía` (pequeño, tinta, zona segura) toda la duración.

### Plano 6 · 8,2–9,0 s (0,8 s) · `plano-06.html`
- Las manos bajan (T 8,2–8,6), la cabeza vuelve (T 7,9–8,2), la sonrisa se apaga (8,0–8,4): todo ya en `fijar`. Cámara: retrocede de la de plano 5 a `CAM_FILA`, llegando **exacta** a local 0,45 (`easeInOut`); desde ahí fija. Último fotograma = fotograma 0 de `plano-01` (comprobar con `ffmpeg -lavfi psnr` entre `plano-01.png` t=0 y el último fotograma de plano-06 renderizado con `--t 0.79`).
- Texto exacto: `¿Otra?` (t0 local 0,1; se apaga a local 0,6 = 8,8 s; ningún texto en los últimos 0,2 s).

## Contacto entre tramos
- Plano 3 acaba cerrado en la cara del quinto; plano 4 empieza en `CAM_FILA`. Plano 5 acaba en el abdomen; plano 6 empieza ahí.
- Ambos tramos leen `comun.js`; si uno necesita un cambio ahí, lo escribe en «Faltas detectadas» y el jefe lo integra (no editarlo en paralelo).

## Faltas detectadas
(los animadores de tramo apuntan aquí)
