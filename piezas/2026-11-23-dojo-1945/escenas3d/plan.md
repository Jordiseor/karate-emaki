# Plan de animación 3D · dōjō 1945 (34,3 s, 12 planos, 1080×1920, 30 fps, sin audio)

Jefe de animación: hechos `src/comun.js` y el **plano 1** (`src/plano-01.html`, `plano-01.mp4`, `plano-01.png`, `hoja-01.png`). Los animadores de tramo no tocan `animacion/`, `comun.js` ni `plano-01.*`. Plano 1: 96 fotogramas en 97 s (≈ 1 s/fotograma con arranque; atardecer + colina + casa).

## Reglas comunes
- Copia `src/plano-01.html` → `src/plano-NN.html` (rutas `../../../../animacion/...`, `import * as C from './comun.js'`). Escribe solo `src/plano-NN.html`, `plano-NN.mp4`, `plano-NN.png`. Lo que falte, defínelo en tu plano y apúntalo en «Pendiente».
- Desde `piezas/2026-11-23-dojo-1945/escenas3d/`:
  ```bash
  node ../../../animacion/render.mjs src/plano-NN.html --t 0 --png /ruta/scratchpad/pNN-0.png     # prueba: t = 0, mitad y final; MÍRALA antes
  node ../../../animacion/render.mjs src/plano-NN.html --out plano-NN.mp4 --png plano-NN.png      # clip + captura central
  ```
  Duración = `window.DURACION` (tabla, exacta). Escala 0,5 fijada por `C.iniciar()`. Determinista: todo en función de `t`.
- `C.iniciar(modo, opciones)`: `modo` = `'atardecer'` (crea colina), `'calle'`, `'noche'`. Opciones: `{ calle: true, casa: false | { rotulo: '' }, colina: false | {…}, poses: true }`. Devuelve `{ ctx, esc, casa, colina, calle, P, U, H2, H3, MV }`. Casa con 松濤館 por defecto (`casa.escribirRotulo('松濤館', 1)` para tenerlo escrito en t = 0).
- Cámaras: `C.camEmpuje(esc, p, { d0, d1 })` (colina, la del plano 1: d 30 → 22, azimut 14), `C.camCalle(esc, { desde, hacia })`, `C.CAM.casaFrente` (noche), `C.CAM.colina`. Frontal a la casa y cerca de ella: distancia 21–30 con `fov` 30–34 (a 22 el tejado se sale de cuadro).
- Texto: `C.tarjeta(ctx, t, ['…'], { t0, t1, y: 300 })` (≥ 48 px, ≤ 5 palabras, `[r]…[/r]` solo en 松濤館/松濤, años y fuego), `C.tarjetaCambio` (tinta → rojo), `C.letraPequena(ctx, '…')` (una a la vez, 48 px, borde inferior seguro). Dos tarjetas seguidas: usa `t0/t1` para que no se solapen.
- Fuego: `C.fuego(ctx, t, p)` = resplandor + pavesas; `C.ceniza(ctx, t)` = ceniza que cae; `C.velo(ctx, color, a)` + `C.pico(t, tc, w)` para cortes entre ambientes (`ambiente()` cambia de golpe: corte seco o velo breve).
- Orden por fotograma: modificar casa/personajes → cámara → `esc.dibujar(ctx)` → capa 2D (`H2.kanji`, `C.fuego`, velo) → tarjeta/letra pequeña al final.
- Funakoshi y cualquier persona real: SOLO silueta (`crearMaestro({ silueta: '#1A1A1A' })` o `MV.crearFunakoshi()`), de espaldas, sin primer plano. Karateka de gi = personaje de la cuenta (no persona real).
- Sin aviones, explosiones, llamas, cifras de víctimas ni escenas de personas en peligro. Rojo solo en 松濤館/松濤, años y fuego.
- Si un plano se ve demasiado oscuro o el rótulo no se lee, ajusta cámara dentro del plano; no toques `comun.js`.

## Comprobación noche + calle + arder (hecha)
`C.iniciar('noche', { calle: true })` + `casa.modo('solido').arder(f).luzInterior(1 - f)` + `C.fuego(...)` convive sin errores: se ve la calle oscura con las casas vecinas teñidas de rojo, la casa ardiendo y el resplandor con pavesas. Con `fuego` p ≥ 0,8 el rojo tapa casi todo (útil para el cambio a `fantasma` del plano 8); para el plano 7 mantén p ≤ 0,5.

## Duraciones (segundos = `window.DURACION`, suman 34,3)
| Plano | Inicio | Dur. | Tramo |
| --- | --- | --- | --- |
| 1 | 0,0 | 3,2 | Jefe (hecho) |
| 2 | 3,2 | 2,3 | A |
| 3 | 5,5 | 3,2 | A |
| 4 | 8,7 | 2,3 | A |
| 5 | 11,0 | 2,3 | A |
| 6 | 13,3 | 2,3 | B |
| 7 | 15,6 | 3,2 | B |
| 8 | 18,8 | 3,2 | B |
| 9 | 22,0 | 2,3 | B |
| 10 | 24,3 | 3,2 | C |
| 11 | 27,5 | 3,6 | C |
| 12 | 31,1 | 3,2 | C |

## Reparto
| Tramo | Planos | Duración | Render estimado (s/fotograma de README, 30 fps) |
| --- | --- | --- | --- |
| Jefe (hecho) | 1 | 3,2 | 1,6 min |
| **A** | 2, 3, 4, 5 | 10,1 | ≈ 10 min (noche+fuego 1,4; calle+casa 2,3; mar de pinos 2,3) |
| **B** | 6, 7, 8, 9 | 11,0 | ≈ 8 min (colina+maestro 1,6; noche+calle+fuego ≈ 1,5) |
| **C** | 10, 11, 12 | 10,0 | ≈ 14 min (fila de 12 ≈ 3,3; karateka + casa fantasma ≈ 2,5) |

## Fichas

### Tramo A (planos 2–5)
**Plano 02** · 2,3 · `iniciar('noche')` (casa con rótulo, sin colina: `colina: false`); corte seco desde el 1 (empieza en noche, `C.pico` de velo opcional de 0,1 s). `casa.modo('solido').arder(U.prog(t,0.3,2.3)).luzInterior(1 - p)`; `C.CAM.casaFrente`. `C.fuego(ctx, t, 0 → 0,6)`. Tarjeta «Abril de [r]1945[/r]» (t0 0,1). Letra pequeña: ninguna. Datos: abril de 1945 (dosier fila 2). Sin día.
**Plano 03** · 3,2 · `iniciar('calle', { calle: true })`; `C.camCalle`, leve avance. `casa.escribirRotulo('松濤館', U.prog(t,0.2,1.4))`, `casa.puerta(U.prog(t,1.2,2.2))`, `casa.luzInterior(…)`; tres alumnos pequeños (`H3.crearAlumno(i)` + pose `rei` o `pies-juntos`, `P` con `poses: true`) saludándose ante ella. Tarjeta 1 (0–1,6): «[r]29 ene 1939[/r]»; tarjeta 2 (1,6–3,2): «Zōshigaya, Tokio» (≤ 3 palabras). Letra pequeña: ninguna. Datos: 29 ene 1939, Zōshigaya, Toshima-ku (fila 1).
**Plano 04** · 2,3 · cámara se acerca al rótulo (`esc.orbita` con `centro` ≈ `casa.medidas.rotulo`, distancia 21 → 9); `H2.kanji(ctx,'松濤館',…)` grande a trazos en rojo y `H2.kanjiGolpe(ctx,'館',…)` a mitad (t ≈ 1,2). Tarjeta «松濤館 = casa de Shōtō» (o dos líneas: «松濤館» / «casa de Shōtō»). Datos: 館 = casa; Shōtō = seudónimo (fila 4).
**Plano 05** · 2,3 · `H3.crearMarDePinos` desde arriba (`esc.mirar([0,16,22],[0,0,-4],40)`, sube la `y`); `mar.actualizar(t, { olas: U.prog(t,0.3,1.8) })`; `H2.kanji(ctx,'松濤',…)` a trazos en rojo. Tarjeta «松濤 = olas de pino». Darle aire (el plano más bonito).

### Tramo B (planos 6–9)
**Plano 06** · 2,3 · `iniciar('atardecer', { casa: false, poses: true })` + `H3.crearMaestro({ silueta: '#1A1A1A' })` + `anadirMaestro`, `m.colocar(0,0,180).pose(P,'maestro-seiza-pincel',{escribir:t})`, `H3.crearMesita({ texto: '松濤' })` colocada 0,55 m delante, `.escribir(prog)`. Cámara `orbita({ centro:[0,0.75,-0.3], distancia:3.6, azimut:12, elevacion:14, fov:34 })` abriendo ligeramente. Tarjeta «Seudónimo de Funakoshi». Siempre de espaldas, sin rasgos.
**Plano 07** · 3,2 · `iniciar('noche', { calle: true })`; cámara baja y a mitad (≈ 1,6 s) sube (`C.camCalle` con `desde[1]` 3,6 → 9). `C.fuego` con p 0 → 0,5 (resplandor al horizonte: `centro: [540, 700]`), `C.ceniza`. Casa sin arder (luz apagada). Tarjeta «Tokio, [r]1945[/r]». Datos: bombardeos aéreos sobre Tokio (contexto fila 6, solo voz). Sin aviones ni cifras; «Toshima» solo en voz.
**Plano 08** · 3,2 · `iniciar('noche', { calle: true })` + `C.CAM.casaFrente`. 0–1 s luz apagándose; 1–2 s `casa.arder(p)` + `C.fuego` p → 0,9; a ≈ 2 s, bajo el rojo, `casa.modo('fantasma').contorno({ color: C.GRIS })`; el rojo se retira. Tarjeta «Día exacto: sin confirmar» a mitad (t0 1,6) como letra pequeña (`C.letraPequena`, una sola). NO poner 13 ni 29 de abril.
**Plano 09** · 2,3 · `iniciar('atardecer', { casa: { rotulo: '' } , poses: true })`; casa en `modo('fantasma').contorno({ color: C.GRIS })`, 松濤館 flotando en gris (`H2.kanji(…, { color: C.GRIS })`); silueta de Funakoshi de espaldas y quieta (`MV.crearFunakoshi()` o `crearMaestro({silueta})` con `maestro-manos-atras`). Tarjeta «Nunca nombró su estilo». Dato: fila 4.

### Tramo C (planos 10–12)
**Plano 10** · 3,2 · `iniciar('atardecer', { casa: false, poses: true })` + `crearCasa()` en `fantasma` gris a 9,5 m detrás; `H3.crearFila(esc, { n: 12, columnas: 4, origen: [0,-1.6], iguales: true })` saludo en ola (ver `prueba/historia/fila.html`); a mitad `H3.crearCartel({ texto: 'SHOTOKAN', tipo: 'madera' }).pop(p)` junto a la fila. Tarjeta «Lo llamaron como la casa». ≈ 3,3 s/fotograma: baja `n` o `columnas: 3` si hace falta.
**Plano 11** · 3,6 · karateka de gi con cinturón negro (`new Karateka3D({ cinturon: 'negro' })`, `rumbo 0`), plano medio frontal, `k.cara({ sonrisa: 0.6 })`; detrás, contorno gris de la casa. A mitad (≈ 1,8 s) 松濤館 en rojo y tarjeta final «Seis años: [r]1939[/r]–[r]1945[/r]» (t0 1,8). Datos: aritmética 1939 → 1945 (fila 8).
**Plano 12** · 3,2 · karateka mira a cámara, `k.cara({ cejas: 0.5, sonrisa: 0.5 })`; la cámara retrocede hasta el encuadre del plano 1 (`C.camEmpuje(esc, 0, …)`) con la casa sólida y 松濤館 rojo, colina, atardecer. **Último fotograma = fotograma 0 del plano 1** (misma cámara d0 = 30, mismo `iniciar('atardecer')`; el karateka sale de cuadro o se funde a 0 en los últimos 0,4 s). Tarjeta «¿Sabías que era una casa?»; en el último 0,4 s funde a «Seis años» tinta (misma `y: 300`) para el bucle. El corte 12 → 1 lo hace el Editor.

## Cierre (jefe/editor)
Concatenar `plano-01…12.mp4`; total 34,3 s. Corte 12 → 1 directo (bucle).

## Pendiente
- (los animadores añaden aquí lo que dibujen o falte en `animacion/`)

## Estado
- plano-01: hecho (jefe). Fotogramas t = 0, 1,6 y 3,2 revisados; clip 3,2 s / 96 fotogramas; hoja en `hoja-01.png`. Tarjeta tinta → rojo a 1,6 s, rótulo escrito en t = 0, empuje 30 → 22. Mejorable: el contraluz es suave (sol bajo de la biblioteca), no silueta total.
- Comprobación noche + calle + arder: OK (ver arriba).
