# Plan de animación 3D · tiempo-contacto (34 s, 14 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hecho `src/comun.js` y el **plano 1** (referencia de estilo: `src/plano-01.html`, `plano-01.mp4`, `plano-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`.
Tiempo real del plano 1 (pantalla partida, 2 renders por fotograma): 69 s para 2,0 s ≈ 1,15 s/fotograma ≈ **35 s de render por segundo de clip**. Planos con un solo karateka o solo 2D irán bastante más rápido (≈ 0,5 s/fotograma, ver README).

## Reglas comunes
- Copia `src/plano-01.html` (rutas `../../../../animacion/...`; `import * as C from './comun.js'`). Un fichero por plano: `src/plano-NN.html`. No hay ficheros compartidos que editar: lo que te falte, defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-17-tiempo-contacto/escenas3d/`:
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png     # prueba: t = 0, mitad y final; MÍRALA antes
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png      # clip + captura central
  ```
  Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Duración = `window.DURACION` (tabla). Escala 0,5 fijada por `C.iniciar()` (no uses `escala: 1`).
- Determinismo: nada de `Math.random`/`Date`; todo en función de `t`.
- `C` exporta también `K` (= `ciencia2d.js`: cronometro, contadorVelocidad, ejes, curva, morfosis, columnas, regla), `H2` (kanji), `crearAlmohadilla`, `crearChoque`, `Karateka3D`, `Diagrama3D`, `U`, `mezclar`, `overlay`, colores `C.ROJO/TINTA/PAPEL/GRIS/AZUL`. Úsalos sin importar nada más.
- Escena de dos karatekas: `const S = C.iniciar()` → `{ ctx, esc, P, lados:[izq, der], izq, der, U }`. Cada lado `L = { k, pad, x, cara, padX, padY, padZ }`: karateka cinturón negro en `x = ∓3` m, rumbo 90 (mira a la derecha de pantalla), con su almohadilla en el punto de llegada de la mano. **izq = golpe (kime)** con `gyaku-zuki-kiai`; **der = empuje** con `empuje-recto`. Ambos parten de `zenkutsu-dachi` (mismas piernas: los pies no deslizan): `C.poseGancho(P, i, f)` = `mezclar(zenkutsu-dachi, pose del lado i, f)`.
- Pantalla partida: `C.mitades(S, { antes: (L, i) => {…pose, pad…}, despues: (ctx, L, i) => {…rastro, flecha 2D con esc.proyectar…} })`. Renderiza cada mitad con `ctx.clip` (540 px) y su cámara `C.CAM.lado` (perfil a 12,5 m, centrada en su mitad), y dibuja la línea divisoria. Para un primer plano cambia la cámara: `cam: { ...C.CAM.lado, distancia: 5, centro: [0.55, 1.0, 0] }` (con distancia menor cabe menos: la mitad mide 540 px; comprueba que la almohadilla no se corta). Plano 3: «cierra con corte seco» = deja de llamar a `mitades`.
- Un solo karateka/objeto (planos 4–6, 9, 12, 14): usa `S.esc` con `esc.orbita(...)` normal y esconde lo que no uses (`S.der.k.raiz.visible = false`, `.pad.visible(false)`). Cámaras de la biblioteca: perfil `orbita({ centro:[0.1,0.95,0], distancia:7.2, azimut:0, elevacion:3, fov:26 })` con `k.colocar(0,0,90)`; frontal `k.colocar(0,0,0)`. Colocar el karateka en el origen: `k.colocar(0,0,90)` y `esc.sombraEn(0,0)`.
- Planos 6 (cojín) y 7–11 (papel): `crearChoque` con `crearEscenario({ fondo: 'degradado' })` propio si hace falta (README «Cojín airbag»); en 7–11 fondo `EMAKI.fondoPapel(ctx)` + `esc` solo si hay 3D. No mezcles dos `crearEscenario` en un plano si puedes evitarlo (coste).
- Texto (≥ 48 px, 250 px libres arriba y 350 abajo): `C.tarjeta(ctx, t, [líneas], { t0: 0.1, y: 300 })` (≤ 6 palabras; rojo con `[r]…[/r]` solo en golpe, flechas y datos clave). Letra pequeña: `C.letraPequena(ctx, '…')`, **una a la vez**. Planos 7–12: `C.etiquetaModelo(ctx)` (MODELO SIMPLIFICADO, arriba a la derecha, y 262 → no tapa la tarjeta si esta va en y ≥ 360; si choca, sube la tarjeta a 380) y `C.letraModelo(ctx)` o la letra pequeña obligatoria del plano 11.
- Datos: solo los del storyboard/dosier. «unos 8» siempre «≈ 8». «16–19 ms» siempre «según estudios». Sin «el doble» como resultado salvo «Modelo: mitad de tiempo, doble fuerza» (plano 10). Sin cifras en 1–3, 5, 6, 8.
- Seguridad: el reel no invita a golpear a nadie; los golpes van a almohadillas.

## Reparto (segundos = `window.DURACION`)
| Tramo | Planos | Duración | Render estimado |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 (2,0) | 2,0 | 1,2 min |
| **A** | 2 (2,0), 3 (2,0), 4 (3,0), 5 (2,5), 6 (2,5) | 12,0 | 2 y 3 partida ≈ 35 s/s → 2,3 min; 4–6 ≈ 15 s/s → 3 min; total ≈ 6 min |
| **B** | 7 (2,5), 8 (3,0), 9 (3,0), 10 (2,5) | 11,0 | 7, 8, 10 son 2D (rápidos, < 1 min); 9 ≈ 2 min |
| **C** | 11 (2,5), 12 (2,5), 13 (2,0), 14 (2,0) | 9,0 | 11 2D; 12 ≈ 1 min; 13 partida ≈ 1,2 min; 14 ≈ 1,2 min |

Total 34,0 s (2,0 + 2,0 + 2,0 + 3,0 + 2,5 + 2,5 + 2,5 + 3,0 + 3,0 + 2,5 + 2,5 + 2,5 + 2,0 + 2,0).

### Tramo A (planos 2–6)
**Plano 02** · 2,0 · primer plano de las dos almohadillas, pantalla partida con cámara cerrada (`cam: {...CAM.lado, distancia: 4.5, centro:[0.55,1.0,0]}`). Izq: el puño llega en seco (`gyaku-zuki-kiai`), `pad.hundir(p)` sube a ≈ 0,2 en 0,05 s y se queda (destello rojo 2D corto). Der: `empuje-recto`, hundimiento a 0,8 en ≈ 0,6 s. En cada fotograma: pose, `pad.hundir(p)`, `pad.pegarA(L.k, 'manoD')`. Reloj pequeño por mitad (`C.K.cronometro` o regla `C.K.regla`): el izquierdo se detiene antes. Sin cifras. Tarjeta: «Distinto tiempo».
**Plano 03** · 2,0 · vuelta a plano medio (`C.mitades` por defecto); las almohadillas salen despedidas (`pad.mover(d, cabeceo)`): la izquierda un poco más rápido/lejos. Flechas rojas 2D (con `esc.proyectar`): una corta y gruesa (izq), otra larga y fina (der); sin números. Tarjeta: «Distinta fuerza». Corte seco al final (el plano 4 es de un solo karateka).
**Plano 04** · 3,0 · un karateka de perfil, plano medio (`k.colocar(0,0,90)`, `P['gyaku-zuki-kiai']` desde `zenkutsu-dachi`, cámara lenta ≈ 1,6 s), flecha roja (`Diagrama3D.flecha` o 2D) que sigue al puño, `C.K.contadorVelocidad(ctx, { texto: '≈ 8', unidad: 'm/s', valor: … })` que sube. Tarjeta: «Puño: unos [r]8 m/s[/r]» → escribe «≈ 8». Letra pequeña: «Hofmann et al., ISBS 2008 · 3 karatekas». Sin almohadilla.
**Plano 05** · 2,5 · cámara frontal (`k.colocar(0,0,0)`, rumbo 0 hacia la cámara; ojo: `gyaku-zuki-kiai` de frente: el puño crece hacia el espectador; usa `distancia ≈ 6–7`). Flecha de velocidad roja y `C.K.regla` vacía que se llena (sin cifras). Tarjeta: «No basta la velocidad».
**Plano 06** · 2,5 · escena aparte (`crearEscenario({ fondo: 'degradado' })`, `crearChoque(esc, P, { cojin: true })`): mitad A cojín que se hunde y maniquí que frena suave; mitad B (repetición rápida, `cojinVisible(false)`) choque seco contra la pared. Pantalla partida si cabe, o dos tiempos seguidos. Flechas rojas de distinta longitud. Tarjeta: «Más tiempo, menos fuerza». Letra pequeña: «OpenStax, Física Universitaria 1, §9.2». Sin 948 N / 11 853 N.

### Tramo B (planos 7–10)
**Plano 07** · 2,5 · papel (`EMAKI.fondoPapel` o dōjō desenfocado): se escribe «F = Δp / Δt» en rojo con `H2.kanji`-like o trazo propio; dos etiquetas: «fuerza media», «tiempo de contacto». `C.etiquetaModelo`. Tarjeta: «F = Δp / Δt». Si no puedes trazar la fórmula con barrido, aparece con `U.easeOut` por partes.
**Plano 08** · 3,0 · `C.K.ejes` + `C.K.morfosis(ctx, caja, f, { impulso })` en `{ x:190, y:560, w:760, h:640 }`; deja respirar 1 s al final. Etiquetas de ejes «tiempo», «fuerza», sin cifras. Tarjeta: «Menos tiempo, más fuerza media».
**Plano 09** · 3,0 · primer plano lateral (un karateka + almohadilla, `empuje`/`gyaku` en cámara muy lenta) con `C.K.cronometro(ctx, { tipo: 'ms', texto: '16–19 ms', parado, … })` que corre poco y se detiene; parpadeo con `k.cara({ parpadeo: U.parpadeo(t, [1.5]) })`. Letra pequeña: «Mašić 1987, cita a Yoshihuku 1984 (segunda mano)». Voz: «según estudios».
**Plano 10** · 2,5 · `C.K.columnas({ horizontal: true, barras: [{ valor: 32, texto: '32 ms' … }, { valor: 16, texto: '16 ms' … }] })` (deja ≈ 250 px a la derecha del texto); flechas que crecen. `C.etiquetaModelo`. Tarjeta: «Mitad de tiempo, doble fuerza».

### Tramo C (planos 11–14)
**Plano 11** · 2,5 · `C.K.columnas` verticales 1750 N (rojo) y 875 N; etiqueta «mismo impulso». Letra pequeña obligatoria: «Modelo simplificado · impulso de ejemplo 28 N·s (Mašić 1987: 21,9–40,7) · no medido en karatekas» (si no cabe en 48 px, dos líneas con `\n` en `overlay.texto` abajo, o parte en dos tiempos: una a la vez). Tarjeta: «1750 N frente a 875 N».
**Plano 12** · 2,5 · karateka frontal (`k.colocar(0,0,0)`), `mezclar(P.neutra, P['encoge-hombros'], U.easeBack(f))`, cara `{ cejas: 0.5, sonrisa: 0.15, torcida: 0.4 }`, dos flechas pequeñas con «?» sobre los puños. Letra pequeña: «No se ha encontrado ningún estudio que compare kime y empujón». `C.etiquetaModelo`. Tarjeta: «Modelo: aún sin medir».
**Plano 13** · 2,0 · pantalla partida (`C.mitades`) como el plano 3 con las dos piezas reconocibles: `H2.kanji(ctx, '決め', x, y, size, { prog })` en rojo sobre la mitad del golpe (izq) y la mitad del empuje en gris (`C.GRIS`, p. ej. `ctx.globalAlpha`/velo gris sobre la mitad derecha). Tarjeta: «Kime: el golpe que se queda». No afirmes que el kime «sea» el modelo.
**Plano 14** · 2,0 · **bucle con el plano 1**. Tarjeta grande «¿Empujas o golpeas?» (`C.tarjeta`). El **último fotograma** (t = 2,0) debe ser idéntico al de t = 0 del plano 1: pantalla partida con `C.dibujarGancho(S, 0)` (mismas poses, cámara, luz; sin texto «Misma velocidad»). Receta: `if (t < 1.6) { …puños listos… } else { crossfade a C.dibujarGancho(S, 0) }` o directamente anima de `zenkutsu-dachi` (puño listo) hacia `C.poseGancho(P, i, 0.45)` con `C.mitades`; asegúrate de que `window.DURACION = 2.0` y de que en t = 2,0 `f = 0,45` (`C.gancho.f(0)`), sin rastro (el plano 1 lo dibuja en t = 0 con cola vacía). El corte entre el 14 y el 1 lo hace el editor.

## Cierre (jefe/editor)
Concatenar `plano-01…14.mp4`; total 34,0 s. Cortes al compás de la voz; el 3 y el 13 cortan la pantalla partida en seco.

## Pendiente (para el jefe / Modelador 3D)
- Resuelto en `comun.js`: pantalla partida (`mitades`), rastro, gancho (`dibujarGancho`, `poseGancho`, `gancho`), `etiquetaModelo`, `letraModelo`.
- Pantalla partida 2 renders/fotograma (≈ 1,15 s/fotograma): no usarla en planos que no la necesiten.
- (los animadores añaden aquí lo que dibujen)

## Estado
- plano-01: hecho (jefe). Fotogramas de prueba t = 0, 0,8 y 1,0 revisados; clip 2,0 s / 60 fotogramas. Mejorable: las dos manos acaban a ≈ 7 cm de diferencia de altura entre golpe y empuje (la pose es así); el rastro rojo es corto (la mano recorre ≈ 0,3 m en 1,6 s). Los pies no deslizan (misma base).
