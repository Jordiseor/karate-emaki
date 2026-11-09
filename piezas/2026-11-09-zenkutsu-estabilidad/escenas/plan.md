# Plan de animación · zenkutsu-estabilidad (jefe de animación, 2026-11-09)

Fuente: `../storyboard.md` (8 escenas, 30 s) y `../dosier.md`. Biblioteca: `animacion/` (leer `animacion/README.md`, sección «Física»). No modificar `animacion/`: lo que falte, se dibuja dentro de la escena y se apunta al final de este fichero («Pendiente para la biblioteca»).

## Estilo común

- 1080×1920, 30 fps. Fondo papel con `E.fondoPapel(ctx)`; tinta `#1A1A1A`; **rojo `#C8102E` solo** en punto rojo, su vertical, arco de ángulo, flechas de empuje, base en alerta y cifras. Karategi blanco, cinturón negro, figura sin rostro salvo escena 1 (`cara 'reto'`) y escena 8 (`cara 'cejas'`).
- Perfil: la figura mira a la derecha; delante = derecha. Todas las constantes (escala 1,0; suelo y=1330; punta del pie delantero x=690 = todas las vistas de perfil comparten pies; frontal centrada en x=540; texto y=270; nota y=1500) están en `src/comun.js` (`PIEZA.*`). **No las cambies en tu escena**: son la continuidad entre tramos. Si hace falta cambiar algo, apúntalo abajo.
- Texto: `E.tarjeta` / `E.texto` (≥48 px; tarjeta principal ≥64 px, arriba desde y=270; hay 250 px libres arriba y 350 abajo). Solo las cifras **≈8°, ≈26°, ≈30°**. Las palabras exactas están en la columna «Texto en pantalla» del storyboard.
- Letra pequeña `Fi.nota(ctx, alpha, PIEZA.NOTA_Y)` en las escenas 2–8 (en la 2 con fundido de entrada; no en la 1).
- Honestidad: nunca «en todas direcciones», nada de cifra lateral en pantalla, nada de cm. En la 7 no hay cifra.
- Cada escena: `window.DURACION` = su duración del storyboard (3, 4, 3, 4, 4, 4, 4, 4 s). `t` es tiempo **local** de la escena. Los cortes entre escenas son secos (el editor monta); empieza y acaba cada escena con una pose estable (ver «Empalmes»).
- Fotograma de prueba antes del clip: `PRUEBA=<t> ../../../animacion/lib/montar.sh src/escena-NN.html <dir>`; clip y captura central: `../../../animacion/lib/montar.sh src/escena-NN.html .` (desde `escenas/`). Revisa la captura con Read y repasa un par de instantes con `lib/hoja.sh`.

## Módulos y poses por escena

| Escena | Poses | Elementos de `fisica.js` | Notas |
| --- | --- | --- | --- |
| 1 · 0–3 s | `pies-juntos` | `figura`, `cara('reto')`, `flecha` con `vibra` | Flecha entra por detrás a la altura de la cadera (`g.cadera`) y vibra sin empujar. Sin punto rojo. Sin nota. |
| 2 · 3–7 s | `pies-juntos` | `centroMasas` (`punto`, luego `prog` con rebote), `baseApoyo` (`prog`), `etiqueta('centro de masas')`, `nota` | Zoom suave: aplica `ctx.scale` alrededor del cuerpo en todo el dibujo (zoom 1→1,25). Base = 1 pie. |
| 3 · 7–10 s | `pies-juntos` | `inclinar` + `girarPunto`, `arco`, `baseApoyo` con `alerta`, `centroMasas`, `flecha` | Inclinación hasta `vuelco` (8,2°); congelar arco+cifra 0,5 s; la base parpadea; paso torpe: dibújalo en la propia escena (mezcla `pies-juntos` → `kamae`/`zenkutsu-dachi` con `K.mezclar` y un pie que se adelanta); sin caída violenta. |
| 4 · 10–14 s | `pies-juntos` → `zenkutsu-alto` | `baseApoyo` (estira de 1 a 4 pies con `x0`/`x1`; al acabar `celdas: 4`), `centroMasas`, `nota` | Salto ágil: `K.mezclar` en 0,25 s con `anclaPunta` fijo (si quieres que parezca un salto, sube la figura 40 px y vuelve). Rótulo «Zenkutsu-dachi» grande y «(posición adelantada)» debajo. Punto rojo adelantado sin rótulo (lo da `geometria`). |
| 5 · 14–18 s | `zenkutsu-alto` | `inclinar`, `arco` (+ arco gris ≈8° de la escena 3), `baseApoyo`, `centroMasas`, `flecha`, `nota` | **Es la plantilla** (`src/_plantilla-escena.html`). La vertical se detiene en la punta a 26,2°; temblor pequeño al final (suma ±0,4° con seno rápido) y vuelve. |
| 6 · 18–22 s | `zenkutsu-alto` → `zenkutsu-bajo` | `poseAltura(f)` con `anclaPunta`, `centroMasas` (usa `m.modelo` en `geometria`), `flecha` pequeña hacia abajo, `arco` (+ gris 26°), `inclinar`, `nota` | Los pies NO se mueven (`poseAltura` lo garantiza). Baja la cadera (f 0→1 en 1 s), luego empuje hasta 30,5°. |
| 7 · 22–26 s | `zenkutsu-alto` → `zenkutsu-frontal` | `giroCamara`, `baseApoyo` (de 4 pies a ancho de hombros), `flecha` lateral, `nota` | Giro de 1,5 s con ease; la base se encoge visualmente a lo largo del giro. Tambaleo lateral: `Kf.dibujar` con `tambaleo` (px) en la pose frontal. Sin cifra. |
| 8 · 26–30 s | `zenkutsu-frontal` | `Kf.dibujar`, `cara('cejas')`, 3 × `flecha` (delante, detrás, costado), `nota` | En frontal «delante» y «detrás» van hacia/desde la cámara: dibújalas como flechas diagonales desde abajo/arriba; vale cualquier solución clara con 3 flechas apuntando al centro. Congelar ≥1 s con `--congelar 1`. |

## Reparto en 2 tramos (a la vez)

Carga estimada: A = 3+4+3+4 = 14 s, B = 4+4+4+4 = 16 s, pero la 3 y la 4 tienen más dibujo propio (paso torpe y salto) y la 7 es la más difícil de B (giro). Queda equilibrado:

- **Tramo A · escenas 1–4** (pies juntos y paso a zenkutsu). Incluye el único dibujo nuevo fuera de biblioteca (paso torpe). Entrega `escena-01..04.mp4/.png`.
- **Tramo B · escenas 5–8** (aguante en zenkutsu y giro de cámara). Empieza por 5 (plantilla), luego 6, 8 y por último 7. Entrega `escena-05..08.mp4/.png`.

Empalmes (no dependen entre tramos): A termina en 4 con `zenkutsu-alto` en reposo, punto adelantado, base de 4 celdas; B empieza en 5 exactamente en esa composición (misma `PIEZA.opc()`). La 6 termina en `zenkutsu-bajo` en reposo y la 7 vuelve a `zenkutsu-alto`.

## Cómo empezar una escena

1. `cp src/_plantilla-escena.html src/escena-NN.html`, cambia `<title>`, `DURACION` y el contenido de `render(t)`.
2. `PRUEBA=1.5 ../../../animacion/lib/montar.sh src/escena-NN.html /tmp` y mira el PNG.
3. Clip: `../../../animacion/lib/montar.sh src/escena-NN.html .` (añade `--congelar 1` en la 8 y `--congelar 0.5` en la 3 si congelas el final). Hoja de contactos: `../../../animacion/lib/hoja.sh escena-NN.mp4 hoja-NN.png 6`.
4. Hoja de referencia con las 4 poses y todos los elementos: `hoja-poses-fisica.png` (esta carpeta).

## Notas técnicas que importan

- El punto rojo sale de `geometria()` (modelo del dosier: 0,90 m en P1/P2, 0,75 m en P3, 60/40), **no de la cadera dibujada**: el arco da 8,2° / 26,2° / 30,5° y coincide con las cifras en pantalla. No lo muevas a ojo.
- La inclinación gira el cuerpo entero (también la pierna trasera, que se levanta): es el modelo de cuerpo rígido que pide el storyboard.
- Los pies de P2/P3 miden 0,26 m (más largos que el pie por defecto de `karateka.js`); usa siempre `Fi.figura`, no `K.dibujar`, para que base y pie coincidan.
- `E.texto` no deja bajar de 48 px (salvo la nota, 37 px, que ya está calibrada).

## Pendiente para la biblioteca (lo rellenan los tramos)

- (vacío)
