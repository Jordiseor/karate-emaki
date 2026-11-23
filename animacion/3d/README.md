# Biblioteca 3D de KARATE EMAKI

Karateka 3D (estilo figura de arcilla / vinilo), dōjō, luces, poses y diagramas de física, con Three.js r160 **local**
(`lib/three.module.min.js`, sin red ni CDN). Todo es **determinista**: la imagen solo depende de `t`.
**No cambies el diseño** del personaje ni del dōjō (cara, pelo, gi, luz, suelo): Jorge lo ha aprobado.

Para hacer una escena **no hace falta leer el código**: copia `plantilla-escena.html` y sigue esta guía.

## Ficheros

| Fichero | Qué es |
| --- | --- |
| `karateka3d.js` | Personaje `Karateka3D`, poses (`cargarPoses`, `mezclar`, `espejo`) |
| `escenario.js` | `crearEscenario()`: renderer, cámara 9:16, luces, suelo, pared del dōjō; `util` (curvas de tiempo) |
| `diagrama3d.js` | `Diagrama3D`: CdM, vertical, base, arcos con cifra, flechas (rojo #C8102E) |
| `overlay2d.js` | `overlay`: títulos, tarjetas, cifras, letra pequeña (marca, ≥ 48 px, zona segura) |
| `poses/*.json` | Poses 3D (las genera `herramientas/disenar-poses.mjs`) |
| `plantilla-escena.html` | Escena mínima que funciona: cópiala |
| `herramientas/taller.sh` | Hoja de revisión de poses (10 vistas) |
| `prueba/` | `estilo.png`, `prueba.mp4` + `hoja.png` (yoi → zenkutsu con gedan-barai), `fisica.png` / `fisica.html` |
| `historia3d.js` | Piezas de historia: casa-dōjō, exteriores, pinos, calle, el maestro, alumnos, filas, vigas, carteles (ver «Historia») |
| `historia2d.js` | Capa 2D de historia: kanji a trazos, pergamino «Cuentan que…», resplandor de fuego, pavesas |
| `herramientas/disenar-poses-historia.mjs` | Genera las poses de alumnos y del maestro |
| `prueba/historia/` | Una escena + PNG por asset (`pruebas.sh` las renderiza); `base.js` = importaciones de las pruebas |
| `rollo2d.js` | Rollo de papel (emaki) 2D: ventana de viñetas, desplazamiento, enrollar/desenrollar, atado, apertura «sol» (ver «Presentación») |
| `logo3d.js` | Cara del logo en 3D con el encuadre de `foto-perfil.png`, disco rojo, caras de kiai y gallo (ver «Presentación») |
| `herramientas/disenar-poses-presentacion.mjs` | Genera `choku-zuki-kiai` y `gyaku-zuki-kiai` |
| `judo3d.js` | Pieza «cinturón de judo»: cinturón suelto, siluetas de judoka/Kanō/Kawaishi, sala del Kōdōkan con público, pancarta, sello 2D (ver «Judo y Kōdōkan») |
| `kumite3d.js` | Pieza «kumite WKF»: pareja aka/ao, alineación de patadas, área de combate (ver «Kumite») |
| `herramientas/disenar-poses-2026-11b.mjs` | Genera las poses de judo y de kumite de 2026-11-16b |
| `prueba/poses-2026-11-16b.png` | Hoja de revisión (10 vistas); capturas sueltas en `prueba/2026-11-16b/`; escena `prueba/poses-2026-11-16b.html` |
| `prueba/presentacion/` | Escenas de ejemplo + PNG de cada asset de la presentación |
| `ciencia3d.js` · `ciencia2d.js` | Pieza «tiempo de contacto»: almohadilla que se hunde, cojín airbag + maniquí + pared; cronómetro, contador de velocidad, gráfico fuerza-tiempo, columnas (ver «Tiempo de contacto») |
| `seiza3d.js` · `seiza2d.js` | Pieza «seiza»: levantarse, temblor, tambaleo, caras; cronómetro 1:00/10:00, gota de sudor, hormigueo (ver «Seiza») |
| `herramientas/disenar-poses-2026-11-18.mjs` | Genera `empuje-recto`, `encoge-hombros`, `seiza-alto`, `en-cuclillas-medio`, `manos-rodillas`, `levantarse-vacilando` |
| `prueba/poses-2026-11-18.png` | Hoja de revisión (10 vistas, escena `prueba/poses-2026-11-18.html`); capturas por objeto en `prueba/2026-11-18/`; escenas `prueba/ciencia.html`, `ciencia2d.html`, `seiza.html`, `caras-seiza.html` |

## Cómo renderizar

```bash
# vídeo (1080×1920, 30 fps, H.264). Usa window.DURACION o --dur
node animacion/render.mjs ruta/escena.html --out salida.mp4 --png centro.png
# un solo fotograma de prueba (míralo SIEMPRE antes del vídeo)
node animacion/render.mjs ruta/escena.html --t 2.5 --png prueba.png
# hoja de contactos de un vídeo (15 fotogramas)
ffmpeg -y -loglevel error -i salida.mp4 -vf "select='not(mod(n\,9))',scale=270:-1,tile=5x3:padding=4:color=white" -frames:v 1 hoja.png
```

En las piezas también vale `animacion/lib/montar.sh` (igual que en 2D). El renderizador usa WebGL por software
(SwiftShader); las escenas 2D salen exactamente igual que antes (comprobado píxel a píxel).

**Tiempo:** ≈ 1,5 s por fotograma con `escala: 0.5` (5 s de vídeo ≈ 3–4 min; arranque ≈ 6 s). Una captura suelta ≈ 8 s.
`escala: 1` (render interno a 1080×1920) es ≈ 3–4 veces más lento: solo para planos cerrados de la cara.

## Rutas desde una pieza

La plantilla está en `animacion/3d/`. Si la copias a `piezas/<id>/escenas/src/`:
- `<script src="../../../../animacion/marca.js"></script>`
- `import … from '../../../../animacion/3d/karateka3d.js'` (y lo mismo para `escenario.js`, `diagrama3d.js`, `overlay2d.js`).

Las escenas 3D son `<script type="module">`: deben definir `window.render = (t) => {…}` y `window.DURACION`.
El HTML necesita `<canvas id="c" width="1080" height="1920">`.

## Reglas de determinismo

- Nada de `Math.random()`, `Date`, `performance.now()`, `THREE.Clock`, `requestAnimationFrame` ni animaciones de Three.
- Todo lo que cambia se calcula en `render(t)` a partir de `t`. Crea objetos una sola vez fuera de `render`.
- Diagramas: llama a `d.limpiar()` al empezar cada `render(t)`.

## Escenario — `crearEscenario(o)`

`o`: `{ escala: 0.5, suelo: 'madera'|'tatami', fondo: 'dojo'|'degradado', exposicion: 1, sombras: true }`.
Devuelve `esc` con:

| Método | Uso |
| --- | --- |
| `esc.escena` | Escena de Three (añade `k.raiz`) |
| `esc.orbita({ centro:[x,y,z], distancia, azimut, elevacion, fov })` | Cámara en órbita. `azimut` 0 = desde +Z. Valores típicos: cuerpo entero `distancia 7, fov 26, elevacion 3`, `centro [x, 0.9–1.1, z]` |
| `esc.mirar(desde, hacia, fov)` | Cámara libre |
| `esc.sombraEn(x, z)` | Si el personaje se aleja > 1 m del origen, centra ahí la sombra |
| `esc.proyectar(Vector3)` | → `{x, y, delante}` en píxeles del vídeo (para poner texto 2D junto a algo 3D) |
| `esc.dibujar(ctx, { vineta, grano })` | Renderiza y compone en el lienzo 2D. Llamarlo una vez por fotograma |

`util` (= `U`): `prog(t,t0,t1)` 0→1, `lerp`, `clamp`, `easeInOut`, `easeOut`, `easeIn`, `easeBack`, `suave`,
`parpadeo(t, [instantes])` (1 = ojos cerrados).

### Vistas de cámara (personaje en el origen)

| Vista | Personaje `k.colocar(0,0,rumbo)` | Cámara |
| --- | --- | --- |
| Perfil (mira a la derecha) | rumbo 90 | `orbita({ centro:[0.1,0.95,0], distancia:7.2, azimut:0, elevacion:3, fov:26 })` |
| Perfil (mira a la izquierda) | rumbo −90 | igual |
| Frontal | rumbo 0 | igual (`azimut: 0`) |
| 3/4 | rumbo 35–60 | igual |
| Giro de cámara perfil → frente | rumbo 90 fijo | anima `azimut` de 0 a 90 |

## Personaje — `new Karateka3D(o)`

`o`: `{ cinturon: 'negro' | 'blanco' | 'amarillo' | 'naranja' | 'verde' | 'azul' | 'morado' | 'marron' | 'rojo' | '#hex' }`.
Mide ≈ 1,82 m (cabeza grande de juguete); pie 0,243 m. Ejes: +Z delante, +Y arriba, +X su izquierda.

| Método | Uso |
| --- | --- |
| `k.colocar(x, z, rumbo)` | Dónde está y hacia dónde mira (grados; 0 = hacia la cámara por defecto, 90 = derecha de pantalla) |
| `k.aplicarPose(pose, op)` | Pone la pose. `op`: `{ ancla:{pie:'I'|'D', x, z}` (ese tobillo no se mueve: úsalo al dar pasos), `inclinar: grados`, `cinta:{x,z}` (balanceo de las caídas del cinturón), `suelo:false` }. Por defecto apoya el pie más bajo en el suelo |
| `k.inclinar(grados, { lado, pivote })` | Inclina el cuerpo ENTERO rígido alrededor de la punta del pie delantero (`grados > 0` hacia delante; `< 0` hacia atrás, pivota en el talón trasero; `lado: 90` vuelco hacia su izquierda, `-90` derecha). Llamar después de `aplicarPose` (o usar `op.inclinar`) |
| `k.cara({ parpadeo, sonrisa, cejas, mirada:[x,y] })` | parpadeo 0–1, sonrisa 0–1 (> 0,55 boca abierta), cejas −1 (ceño) … 1 (alzadas). Extras: `grito` 0–1 (boca de kiai), `torcida` −1…1, `asimetria` (una ceja más alta), `guino` 0–1 (ojo derecho), `ojos` 0–1 (muy abiertos). Sin extras sale igual que siempre |
| `k.punto(nombre)` | Vector3 del mundo: `cabeza, pecho, cadera, nudo, manoI/D, codoI/D, hombroI/D, rodillaI/D, tobilloI/D, talonI/D, puntaI/D, cdm` |
| `k.centroMasas()` | CdM (fracciones de Dempster/Winter) |
| `k.pieDelantero()` | `'I'` o `'D'` |
| `k.medidas()` | `{ base, espinillaI, espinillaD, troncoVertical, alturaCadera }` para revisar técnica |
| `k.cinturon(color)`, `k.silueta('#1A1A1A')`, `k.verRostro(false)` | Cambiar cinturón; figura sin rasgos (personas reales/históricas: SIEMPRE silueta, nunca retrato) |

## Poses — `const P = cargarPoses()`

| Pose | Descripción |
| --- | --- |
| `P.yoi` | Hachiji-dachi, puños delante de los muslos |
| `P['pies-juntos']` | Heisoku-dachi, manos abiertas a los lados |
| `P['zenkutsu-dachi']` | Hidari zenkutsu (pie **izquierdo** delante) con gedan-barai + hikite. Espinilla delantera vertical, muslo 50°, pierna trasera recta con talón apoyado y punta a 30°, tronco vertical, caderas al frente, tobillos a 0,23 m en lateral, base 1,01 m (≈ 4 pies), cadera 0,81 m |
| `P['zenkutsu-bajo']` | Igual con muslo a 70°: cadera 0,69 m; con la pierna trasera recta la base crece a 1,23 m |
| `P.kamae` | Guardia de kumite (hidari) |
| `P['gedan-barai-prep']` | Preparación del gedan-barai (puño izquierdo junto a la oreja derecha); piernas de yoi |
| `P.neutra` | De pie, brazos relajados |
| `P['zenkutsu-bajo-misma-base']` | Zenkutsu bajo con la base del zenkutsu normal (≈1 m): baja doblando más la rodilla delantera (ángulos del Sensei) |
| `P.rei` | Saludo de pie: pies juntos, tronco 30°, manos en los muslos. Animar: `mezclar(P['pies-juntos'], P.rei, f)` |
| `P['cargar-viga']` | Viga sobre el hombro derecho, dos manos (con `crearViga().alHombro(k)`) |
| `P['brazos-arriba']` | Manos abiertas arriba (≈1,84 m) para colgar/levantar un rótulo |
| `P['maestro-seiza-pincel']`, `P['maestro-pie-escribiendo']`, `P['maestro-manos-atras']` | Solo con `crearMaestro()` (la de seiza necesita su altura; `maestro.pose()` lo hace) |
| `P['choku-zuki-kiai']` | Kiai con puñetazo recto desde yoi: **mismas piernas que `yoi`** (no deslizan al mezclar), puño derecho al frente chūdan, palma abajo, hikite izquierdo. `mezclar(P.yoi, P['choku-zuki-kiai'], f)` |
| `P['gyaku-zuki-hanmi']` | Hanmi: mismas piernas que `gyaku-zuki-kiai`, cadera 45° y tronco +5° de giro (hombro derecho atrás), puño derecho en hikite, brazo izquierdo delante. Lleva `piernasFijas` (las piernas no siguen el giro de la cadera) |
| `P['gyaku-zuki-kiai']` | Gyaku-zuki (puño derecho) en hidari zenkutsu-dachi, mismas piernas que `zenkutsu-dachi` |

- `mezclar(a, b, f)`: interpola dos poses. `f` número o `{ piernas, brazos, tronco, cabeza }` (cada parte a su ritmo).
- `espejo(p)`: cambia izquierda ↔ derecha (migi zenkutsu = `espejo(P['zenkutsu-dachi'])`).
- Al dar un paso, fija el pie que no se mueve: `k.aplicarPose(p, { ancla: { pie: 'D', x, z } })` (toma `x, z` de `k.punto('tobilloD')` en la pose inicial). Ver `prueba/prueba.html` (paso + arco del pie + rastro rojo del golpe).
- Pose nueva o retoque: edita `herramientas/disenar-poses.mjs` (las poses salen de restricciones: pies planos, espinilla vertical…), `node animacion/3d/herramientas/disenar-poses.mjs [nombre]`, y revisa con `herramientas/taller.sh salida.png`. Los animadores de tramo **no** editan poses: se piden al Modelador 3D.

Campos de una pose (grados): `cadera/tronco/cabeza {giro, inclina, ladeo}`, `brazoI/D {adelante, abre, gira}`, `codoI/D`,
`munecaI/D {flex, gira, desvio}`, `manoI/D` (0 puño, 1 abierta), `piernaI/D {adelante, abre, gira}`, `rodillaI/D`, `tobilloI/D {flex, ladeo}`.

## Diagramas de física — `const d = new Diagrama3D(esc, k)`

Cada fotograma: pose → `d.limpiar()` → piezas → `esc.dibujar(ctx)` → `d.dibujar2D(ctx)` (cifras). Todas las piezas aceptan `alfa` (0–1, para fundidos) y `color`.

| Método | Qué dibuja |
| --- | --- |
| `d.cdm({ alfa, radio:0.045, vertical:true })` | Esfera roja (con aro blanco) en el CdM, siempre visible aunque esté dentro del cuerpo, + vertical discontinua hasta el suelo con marca. Devuelve el CdM |
| `d.base({ eje:'frente'|'lado', alerta:0–1, crecer:0–1, alfa })` | Barra en el suelo de talón trasero a punta delantera (`'lado'`: de borde exterior a borde exterior). `alerta` pasa de tinta a rojo. Se mide con la pose **sin inclinar**: no se mueve al inclinar el cuerpo. Devuelve `{desde, hasta, largo}` |
| `d.arco({ centro, desde:0, angulo \| hasta, radio:0.35, texto:'26°', relleno:0.16, plano:'frente'|'lado', distTexto, desplazaTexto:[px,px], tamTexto:72, lados })` | Arco de ángulo en el plano vertical de avance. Ángulos desde la vertical, positivos hacia delante. `hasta: punto` = hasta la línea centro → punto. `color: '#8A847A'` para un arco «fantasma» de comparación. Devuelve el ángulo dibujado |
| `d.flecha({ desde:[x,y,z], hacia:[x,y,z], crecer:0–1, grosor:0.025 })` | Flecha de empuje roja |
| `d.linea(a, b, { discontinua, grosor })` | Línea suelta |
| `d.etiqueta(punto3D, 'texto', { tam, desplaza })` | Texto 2D anclado a un punto 3D |
| `d.pivote()` | Punto del suelo sobre el que se inclina (punta del pie delantero) |
| `d.anguloVuelco('delante'|'atras'|'lado')` | Ángulo (°) que aguanta el cuerpo rígido antes de que el CdM salga de la base |
| `d.ajustarVuelco(26)` | Desplaza el CdM (en el marco del cuerpo) para que el vuelco hacia delante de la pose actual sea 26° |

**Cifras y modelo.** Con el CdM calculado del personaje, el vuelco hacia delante sale: pies juntos ≈ 10,6°, zenkutsu ≈ 30°,
zenkutsu bajo ≈ 37° (el personaje es de juguete: cabeza grande, 1,82 m). Las cifras de pantalla deben ser las del dosier
(≈8°, ≈26°, ≈30°, reparto 60/40). Para que el dibujo cuadre con la cifra, llama a `d.ajustarVuelco(cifra)` con la pose
**sin inclinar** justo después de aplicarla (una vez por pose; `d.ajustarVuelco(null)` lo quita). Así, al inclinar `cifra` grados,
la vertical del CdM cae justo en la punta. Ejemplo completo: `prueba/fisica.html`.

```js
k.colocar(0, 0, 90).aplicarPose(P['zenkutsu-dachi']);
d.ajustarVuelco(26);
window.render = (t) => {
  const inc = 26 * U.easeInOut(U.prog(t, 1, 2.6));
  k.aplicarPose(P['zenkutsu-dachi'], { inclinar: inc });
  d.limpiar();
  d.base({ alerta: U.prog(inc, 20, 26) });
  const c = d.cdm();
  d.arco({ centro: d.pivote(), hasta: c, radio: 0.42, texto: '26°', distTexto: 1, desplazaTexto: [150, -35], tamTexto: 80 });
  d.flecha({ desde: [-1.15, 1.25, 0], hacia: [-0.45, 1.25, 0] });
  esc.dibujar(ctx); d.dibujar2D(ctx);
};
```

## Texto 2D — `overlay` (de `overlay2d.js`)

Necesita `marca.js` cargado antes. Tamaño mínimo 48 px; recoloca el texto para que no invada 250 px arriba / 350 px abajo.
`[r]…[/r]` = rojo de marca.

| Función | Uso |
| --- | --- |
| `overlay.titulo(ctx, t, { lineas, t0, t1, size:96, y })` | Título arriba con entrada (fundido + subida). `t0 < 0` para que esté ya visible en t = 0 |
| `overlay.tarjeta(ctx, t, { lineas, t0, t1, size:84, y \| abajo:true })` | Tarjeta animada |
| `overlay.texto(ctx, { lineas, size, y \| abajo, color })` | Texto fijo |
| `overlay.cifra(ctx, x, y, '26°', { size:120 })` | Cifra roja grande centrada en un píxel |
| `overlay.letraPequena(ctx, 'Modelo simplificado: …')` | 48 px, peso 500, apoyada en el borde inferior seguro |
| `overlay.zona(ctx)` | Franjas de zona segura (solo para revisar) |

## Revisión obligatoria antes de entregar

1. Fotograma de prueba (`--t`) y míralo. 2. Vídeo + hoja de contactos y mírala. 3. Comprueba: pies apoyados (sin flotar ni
atravesar el suelo), textos dentro de la zona segura, cifras iguales a las del dosier.

## Límites conocidos

- Render lento por ser WebGL por software: ≈ 1,5 s/fotograma (planificar ≈ 45 s de render por segundo de vídeo).
- `mezclar` interpola ángulos: entre dos poses los pies pueden deslizar o levantarse un poco. Usa `ancla` para el pie de apoyo y revisa la hoja; no hay IK de pies en tiempo real.
- Sin colisiones: un brazo puede atravesar el gi en poses extremas (las de la biblioteca están revisadas).
- La palma del hikite queda ≈ 30° de «totalmente arriba» (límite del rig de la muñeca); el gedan-barai llega a ≈ 0,24 m sobre la rodilla (el brazo no da para más con el tronco vertical).
- El personaje no es un adulto de 1,70 m: los ángulos calculados no coinciden con el dosier sin `ajustarVuelco`.
- Inclinar es un giro rígido (modelo del dosier): el personaje no reacciona ni da pasos; si «cae», anímalo con poses.
- El texto 3D no existe: las cifras se dibujan en 2D (`dibujar2D` / `overlay`), siempre por encima del 3D.

## Historia — `historia3d.js` + `historia2d.js`

Para piezas de historia (p. ej. `2026-11-09-nombre-shotokan`). Mismo universo de juguete y misma luz. Pruebas de cada asset en
`prueba/historia/*.png` (las escenas `*.html` de al lado son ejemplos completos que funcionan: cópialos).
Importa desde una pieza con `'../../../../animacion/3d/historia3d.js'` (y `historia2d.js`).

**Reglas.** El maestro: siempre de espaldas, de lejos o a contraluz; nunca primer plano de la cara (no tiene rasgos: `verRostro(false)`).
Rojo #C8102E solo en 松濤館 / 松濤 / 館, años y fuego. Fuego sobrio: resplandor + pavesas, sin llamas, aviones ni explosiones.

### Ambiente exterior — `ambiente(esc, modo, { suelo: true, sombra: 9 })`

`modo`: `'atardecer'` (cielo cálido, sol bajo detrás: contraluz), `'calle'` (tarde templada), `'noche'` (cielo oscuro, luna, estrellas,
luz fría tenue), `'dojo'` (lo devuelve todo como estaba). Quita suelo de madera y pared, pone cielo, niebla larga y suelo exterior.
Con `crearColina` usa `{ suelo: false }` (la colina trae su suelo). Crea el escenario con `crearEscenario({ escala: 0.5, fondo: 'degradado' })`.
`sombraExterior(esc, x, z)` centra la caja de sombras (±9 m) si la acción se aleja del origen.

### Casa-dōjō — `crearCasa(o)`

`o`: `{ rotulo: '' | '松濤館', rotuloVertical: false, fantasma: '#C8102E', grosorLinea: 0.035, maqueta: false, escala: 1 }`.
6 m de frente × 4,2 de fondo, cumbrera ≈ 4,3 m, puerta hacia +Z, origen en el suelo. `casa.medidas` da `puerta`, `rotulo`, `W`, `D`…

| Método | Uso |
| --- | --- |
| `casa.colocar(x, z, rumbo)` | Sitúa la casa |
| `casa.pop(p)` | Aparece con rebote (0 → 1, ≈ 0,4 s) |
| `casa.construir(p)` | Por partes: base 0–0,08 · postes 0,08–0,36 · vigas 0,34–0,6 (caen) · paredes 0,56–0,8 · puerta/rótulo 0,7–0,8 · tejado 0,76–1 |
| `casa.modo('solido' \| 'fantasma' \| 'ambos')` | Sólida, solo contorno discontinuo, o las dos |
| `casa.contorno({ color, alfa, dibujar })` | Contorno: `dibujar` 0→1 lo traza tramo a tramo; `color: '#8A847A'` = gris ceniza |
| `casa.escribirRotulo('松濤館', prog)` | Escribe el rótulo a trazos (vacío: `''`). `casa.rotuloObj` = grupo del rótulo para animarlo (colgarlo) |
| `casa.puerta(f)` | Puerta corredera 0 cerrada → 1 abierta |
| `casa.arder(p)` · `casa.luzInterior(f)` · `casa.opacidad(a)` · `casa.restaurar()` | Fuego (rojo + carbón), luz cálida tras el shōji, fundido, deshacer |
| `crearMaqueta(o)` | Casa a escala 0,12 sobre una tablilla (≈ 0,9 m de ancho): para tenerla en el suelo o junto al karateka |

```js
const casa = crearCasa({ rotulo: '' }); esc.escena.add(casa.raiz);
window.render = (t) => {
  casa.construir(U.prog(t, 0, 3.5));                       // escena 5: se levanta
  casa.escribirRotulo('松濤館', U.prog(t, 1, 3));         // escena 6: el rótulo se escribe
  // escena 7: casa.arder(f); luego casa.modo('fantasma').contorno({ color: '#8A847A' })
  esc.orbita({ centro: [0, 2, 0], distancia: 21, azimut: 25, elevacion: 8, fov: 30 }); esc.dibujar(ctx);
};
```

### Exteriores

| Función | Qué es |
| --- | --- |
| `crearColina({ pinos: 9, semilla, meseta: 3.2, sinPinosEn: [[x, z, r]] })` | Colina llana en el origen (ahí van maestro y mesita), pinos alrededor, lomas lejanas. `col.viento(t, { fuerza: 1, direccion: 0 })` |
| `crearPino({ altura: 4, semilla, inclina: 12, ramas: 5 })` | Pino japonés suelto (tronco en S, copas en capas). `.colocar(x, z, y)`, `.viento(t, op)` (ráfaga que avanza por el bosque) |
| `crearMarDePinos({ ancho: 60, fondo: 80, paso: 1.9, centro: [0, -10] })` | Manto de copas visto desde arriba. `mar.actualizar(t, { amplitud: 0.6, longitud: 9, velocidad: 1, direccion: 20, olas: 0..1 })`; `olas` → el verde vira a mar y las crestas a espuma (morfismo pino ↔ ola) |
| `crearCalle({ hueco: 8.4, porLado: 3, semilla, enfrente: false, fondo: true })` | Casas bajas a los lados de la casa-dōjō (hueco central), calzada de tierra delante (+Z). Sin rótulos |
| `crearCasita({ ancho, fondo, pisos: 1 \| 2, semilla })` | Una casa de la calle suelta |

Cámaras probadas: colina `orbita({ centro: [0, 2.4, -3], distancia: 22, azimut: 10, elevacion: 7, fov: 34 })`; mar desde arriba
`mirar([0, 16, 22], [0, 0, -4], 40)` (sube la cámara animando la `y`); calle `mirar([7, 3.6, 24], [-1.5, 2.4, 0], 40)`.

### El maestro — `crearMaestro(o)` + `anadirMaestro(esc, m)`

`o`: `{ kimono: '#2F3242', hakama: '#4B4852', pelo: '#A9A39B', peinado: 'corto', silueta: false | '#1A1A1A' }` (silueta = contraluz total).
Kimono y hakama oscuros, pelo canoso corto, **sin rostro**. Hakama de pie o extendido en seiza (cambia solo según la pose).

```js
const m = anadirMaestro(esc, crearMaestro());
const mesa = crearMesita({ texto: '松濤' }); esc.escena.add(mesa.raiz);  // papel con kanji en tinta
window.render = (t) => {
  m.colocar(0, 0, 180).pose(P, 'maestro-seiza-pincel', { escribir: t });  // rumbo 180: de espaldas a la cámara
  mesa.colocar(0, -0.55, 180).escribir(U.prog(t, 0.5, 3));               // mesita 0,55 m delante de él
  esc.orbita({ centro: [0, 0.75, -0.3], distancia: 3.6, azimut: 12, elevacion: 14, fov: 34 }); esc.dibujar(ctx);
  H2.kanji(ctx, '松濤', 540, 560, 300, { prog: U.prog(t, 0.5, 3) });     // 松濤 grande en rojo (overlay)
};
```

- De pie escribiendo: `crearPapelColgado({ texto: '空手' })` colocado 0,62 m delante (`m.colocar(0, 0.3, 180)` + `papel.colocar(0, -0.32)`),
  pose `'maestro-pie-escribiendo'` con `{ escribir: t }`, `papel.escribir(prog)`. Cámara 3/4 trasera (`azimut 25–30`) para ver el brazo.
- `'maestro-manos-atras'`: de pie quieto. `escribir: t` añade el vaivén del pincel; el pincel aparece solo en las poses de escribir.
- Piezas sueltas: `crearMesita`, `crearPincel` (`.seguir(k, 'D', dir)`), `crearPapelColgado`.

### Alumnos, vigas y filas

- `new Karateka3D({ peinado, pelo, piel, mejilla, cinturon })`: `peinado` ∈ `'normal'` (el aprobado, por defecto), `'corto'`, `'rapado'`,
  `'flequillo'`, `'melena'`, `'mono'` (moño). Sin `peinado` el personaje sale exactamente igual que antes (comprobado píxel a píxel).
- `crearAlumno(i, { peinado, pelo, piel: 0..4 | '#hex', cinturon })`: variación determinista por índice (pelo, piel, cinturón). Paletas: `PIELES`, `PELOS`.
- `crearViga({ largo: 3 })`: `.alHombro(k)` (un portador, pose `cargar-viga`) o `.entre(v.apoyo(k1), v.apoyo(k2))` (dos portadores en fila, mismo rumbo).
- `crearFila(esc, { n: 12, columnas: 4, separacion: [1.15, 1.35], origen: [0, -2], rumbo: 0, iguales: false, sombrasHasta: 1, simplificarDesde: 2 })`
  → `fila.pose(P, pose | (i, k) => pose, { cara })`. `iguales: true` = todos como el karateka de la escena 1. Solo la 1.ª fila proyecta sombra.
  En el dōjō la niebla borra las filas de atrás: `esc.escena.fog.near = 12; esc.escena.fog.far = 45`.

```js
const fila = crearFila(esc, { n: 12, columnas: 4, origen: [0, -1.6], iguales: true });
const casa = crearCasa(); casa.modo('fantasma').colocar(0, -9.5); esc.escena.add(casa.raiz);
// en render: saludo en ola
fila.pose(P, (i) => mezclar(P['pies-juntos'], P.rei, U.clamp(U.prog(t, 0.5 + i * 0.05, 1.3 + i * 0.05))));
```

### Carteles — `crearCartel({ texto: 'SHOTOKAN', tipo: 'madera' | 'papel' | 'flecha', ancho: 1.1, alto: 1.3 })`

`.colocar(x, z, rumbo)`, `.pop(p)` (brota del suelo con rebote), `.apuntar(x, z)` (la flecha señala ese punto: úsalo hacia el maestro;
él no los toca). Texto en la sans de marca, en tinta.

### Capa 2D — `import * as H2 from '.../historia2d.js'`

| Función | Uso |
| --- | --- |
| `H2.kanji(ctx, '松濤館', x, y, size, { prog, vertical, color, halo })` | Kanji a trazos (zonas izquierda → derecha, barridos de pincel). Rojo por defecto. `halo: 0.7` para leerse sobre líneas. Fuente Noto Serif CJK JP: 濤 sale bien (no 涛) |
| `H2.kanjiGolpe(ctx, '館', x, y, size, p)` | Entrada de golpe con rebote (escena 4) |
| `H2.pergamino(ctx, t, { texto: 'Cuentan que…', t0, t1, y: 290, size: 64 })` | Etiqueta de pergamino que se desenrolla; dentro de la zona segura |
| `H2.resplandor(ctx, p, t, { centro: [540, 1000] })` | Mancha roja desde los bordes; área cubierta ≈ p; p = 1 lo cubre todo. Para retirarse, baja p |
| `H2.pavesas(ctx, t, { n: 40, intensidad, sube: true, color })` | Chispas que suben (`color: H2.CENIZA, sube: false` = ceniza que cae) |
| `H2.velo(ctx, color, alfa)` | Velo de color a pantalla completa |

Las texturas 3D con kanji (`TexturaKanji`) usan el mismo trazado: `casa.escribirRotulo`, `mesa.escribir`, `papel.escribir`.

### Tiempos (escala 0,5, 2 núcleos, SwiftShader)

| Escena de prueba | s/fotograma |
| --- | --- |
| Noche + casa ardiendo + resplandor + pavesas (`noche.html`) | 1,4 |
| Maestro en seiza en la colina con 9 pinos (`maestro-seiza.html`) | 1,6 |
| Calle + casa a medio construir + 4 alumnos + maestro (`alumnos-viga.html`) | 2,3 |
| Mar de pinos (≈1 300 copas instanciadas) (`mar.html`) | 2,3 |
| Fila de 12 + karateka + casa fantasma + 松濤館 (`fila.html`) | 3,3 |

Arranque ≈ 5–7 s. Captura suelta ≈ 6–9 s. Planifica la escena 9 a ≈ 100 s de render por segundo de vídeo; si sobra, baja `n` o usa `columnas: 3`.

### Límites (historia)

- Kanji «a trazos» es un barrido por zonas, no el orden real de trazos de cada carácter (no hay datos de trazos sin red).
- El maestro de pie no tiene piernas visibles (hakama recta); no camina bien: muévelo poco y lento. En seiza no se levanta (corte).
- La pose de seiza solo sirve con `crearMaestro` (el karateka de gi no tiene hakama que tape las piernas dobladas).
- Las vigas no se pegan a las manos: recolócalas en cada fotograma (`alHombro` / `entre`). Dos portadores deben mirar al mismo rumbo.
- `casa.opacidad(<1)` puede mostrar caras internas al fundir (transparencia sin ordenar). Para «quemarse y quedar en ceniza» usa
  `arder` + resplandor a pantalla llena y cambia a `modo('fantasma')` mientras el rojo lo cubre todo.
- Las líneas del contorno se cruzan en las esquinas del tejado (es un esquema de alambre, no un dibujo plano).
- `ambiente('noche')` cambia el mapa de entorno de golpe: no hay fundido continuo atardecer → noche (corta, o funde con `H2.velo`).

## Presentación — `rollo2d.js` + `logo3d.js` (pieza `2026-11-11-presentacion`)

Ejemplos completos que funcionan en `prueba/presentacion/` (cópialos): `logo.html` (plano 1), `rollo.html` (planos 2–3, 4–7 y 8),
`kiai.html` (plano 7), `sol.html` (plano 9), `kanji.html` (絵巻), `caras.html` (caras nuevas). PNG de cada uno al lado;
`logo-hoja.png`, `rollo-hoja.png` y `sol-hoja.png` son hojas de contactos.
Desde `piezas/2026-11-11-presentacion/escenas/src/`:

```js
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar } from '../../../../animacion/3d/karateka3d.js';
import { crearRollo, VENTANA } from '../../../../animacion/3d/rollo2d.js';
import { crearLogo, LOGO, CARAS, mezclarCara } from '../../../../animacion/3d/logo3d.js';
import * as H2 from '../../../../animacion/3d/historia2d.js';           // H2.kanji(ctx, '絵巻', …)
import { crearFila } from '../../../../animacion/3d/historia3d.js';      // plano 7
```
(y `<script src="../../../../animacion/marca.js"></script>` antes del módulo).

### Rollo — `const rollo = crearRollo()`

Overlay 2D: papel #F4EFE6 con fibra, varilla de madera a la izquierda y rollo grueso a la derecha, sombra suave. La **ventana**
de cada viñeta es `VENTANA = { x: 60, y: 300, w: 960, h: 1200 }` (centro (540, 900)): encuadra tu 3D para que lo importante
caiga ahí. Entre viñeta y viñeta hay 90 px de papel.

| Método | Uso |
| --- | --- |
| `rollo.dibujar(ctx, { abierto, avance, vinetas, centrar, escala, x, y, info })` | `abierto` 0 cerrado → 1 abierto (desenrollar = `p`, enrollar = `1 − p`). `avance`: 0 = viñeta 0 en la ventana, 1 = la 1, 1,5 = a medio pasar. `centrar: 1` = cerrado en el centro de la pantalla y se abre hacia los lados (0 = cerrado a la izquierda, se abre hacia la derecha). `escala`, `x`, `y` mueven el rollo entero (p. ej. «sale del suelo») |
| `rollo.avance(t, [t1, t2, …])` | Avance continuo: en cada instante de la lista empieza un desplazamiento de **0,25 s** a la viñeta siguiente |
| `rollo.cerrado(ctx, { x: 540, y: 900, atado: 0..1, escala })` | Rollo cerrado; `atado` anima el cordón (dos vueltas y lazo). Igual que `dibujar({ abierto: 0, centrar: 1 })` |
| `rollo.sol(ctx, p, fuente, { cy })` | Plano 9: el rollo cerrado se desata (p 0–0,15), se abre en el centro y un círculo crece «como un sol» dejando ver `fuente`; con p = 1 solo queda la fuente |
| `rollo.etiqueta(ctx, 'Historia', { prog, alfa, size: 60, lado: 'izq' })` | Pestaña de pilar en la esquina superior de la ventana (planos 4–7) |

Cada entrada de `vinetas` puede ser: **función** `(c, info) => …` que pinta a pantalla completa (1080×1920) en un lienzo auxiliar
(el rollo solo usa el trozo de la ventana y solo la llama si esa viñeta se ve; en el desplazamiento se llaman dos), un **canvas**
1080×1920, `null` (papel en blanco) o `{ marco: 0..1 }` (marco vacío que se traza a pincel y parpadea con una aguada: plano 3).

```js
const esc = crearEscenario({ escala: 0.5 }), P = cargarPoses();
const k = new Karateka3D({ cinturon: 'negro' }); esc.escena.add(k.raiz);
const rollo = crearRollo();
const tecnica = (c) => { k.colocar(0, 0, 90).aplicarPose(P['zenkutsu-dachi']); esc.orbita({ centro: [0.1, 0.95, 0], distancia: 7.2, elevacion: 3, fov: 26 }); esc.dibujar(c); };
window.render = (t) => {
  window.EMAKI.fondoPapel(ctx);                                    // lo que se ve fuera del rollo
  rollo.dibujar(ctx, { abierto: 1, avance: rollo.avance(t, [2.0]), vinetas: [historia, tecnica] }); // historia: otra función igual
  rollo.etiqueta(ctx, 'Técnica', { prog: U.prog(t, 2.25, 2.5), alfa: 1 - U.prog(t, 2.9, 3.05) });
};
```

- Dos viñetas con la misma escena 3D: cambia pose y cámara dentro de cada función (como arriba); el rollo las llama en orden.
  Si una viñeta usa `crearLogo` o `setViewOffset`, deja la cámara limpia para las demás (`liberarCamara(esc)`).
- Corte entre tramos: haced el corte en mitad del desplazamiento (p. ej. avance = n + 0,5) para que el Editor una sin salto.

### Cara del logo — `const logo = crearLogo(esc, k, { cy: 960 })`

Reproduce `animacion/perfil/foto-perfil.png` **píxel a píxel** (comprobado: diferencia media < 0,1/255) con `crearEscenario({ escala: 1 })`:
karateka en yoi, rumbo 12°, cara `LOGO.cara`, cámara `LOGO.camara` desplazada con `setViewOffset` para que el centro del disco
quede en `(540, LOGO.cy)` (por defecto 960; el cuadrado del logo ocupa y 420–1500). El disco rojo (#C8102E, radio 450 px) y el
papel son mallas 3D sin tono (color exacto) detrás del personaje.

| Método | Uso |
| --- | --- |
| `logo.personaje(P, caraExtra)` | Pone la pose, rumbo y cara del logo (p. ej. `{ guino: 1 }`) |
| `logo.actualizar(f, fCam = f)` | f = 0 encuadre exacto del logo · f = 1 dōjō y cuerpo entero frontal (`distancia 7, fov 26, centro [0, 0.95, 0]`). El papel se funde en 0–0,4 y el disco se va al fondo como un sol y se apaga en 0,55–1 |
| `logo.camara(f)` / `logo.fondoLogo(f)` | Las dos mitades de `actualizar` por separado |
| `logo.dibujar(ctx, f)` | `esc.dibujar` sin viñeta ni grano en f = 0 (como el PNG); la viñeta entra con f |
| `encuadreLogo(esc, { cy })`, `liberarCamara(esc)`, `LOGO` | Encuadre suelto y constantes (`cy`, `r`, `rumbo`, `cara`, `camara`, `cuerpoEntero`) |

**Bucle (planos 1 y 9):** el fotograma 0 del plano 1 y el último del 9 deben ser `logo.personaje(P); logo.actualizar(0); logo.dibujar(ctx, 0)`
con la misma `escala: 1` y la misma `cy`: salen idénticos. Plano 1: anima `f` de 0 a 1 entre 0,3 y 0,9 s y mezcla yoi → pies-juntos → rei
(ver `logo.html`). Plano 9: `rollo.sol(ctx, p, (c) => logo.dibujar(c, 0))` y guiño con `logo.personaje(P, { guino: U.parpadeo(t, [1.45], 0.35) })`.

### Caras y kiai (plano 7)

`CARAS.kiai` (`{ grito: 1, cejas: -0.7 }`), `CARAS.gallo` (boca torcida a medio abrir, ojos muy abiertos, cejas desiguales),
`CARAS.deReojo`, `CARAS.logo`; `mezclarCara(a, b, f)` las interpola. Pose: `mezclar(P.yoi, P['choku-zuki-kiai'], f)` (el golpe entra
en ≈0,12 s con `U.easeOut`). Para mirar de reojo de verdad gira también la cabeza: `{ ...pose, cabeza: { giro: 20 } }` (la `mirada` mueve poco las pupilas).
Fila del ejemplo: `crearFila(esc, { n: 6, columnas: 3, separacion: [0.82, 1.1], origen: [0, 0] })`, cámara `orbita({ centro: [0, 1.05, -0.5], distancia: 8.8, elevacion: 5, fov: 26 })`.

### Kanji 絵巻

`H2.kanji(ctx, '絵巻', 540, y, 330, { prog, color: '#1A1A1A' })`: la fuente lo traza bien (絵 japonés, con 会). Zonas propias:
絵 = 糸 | 会, 巻 = arriba / abajo. 松濤館 no cambia (comprobado píxel a píxel). En tinta, no en rojo (el rojo es para 松濤館, cifras y el disco).

### Tiempos (2 núcleos, SwiftShader)

| Escena | s/fotograma |
| --- | --- |
| `rollo.html` (escala 0,5; una o dos viñetas 3D por fotograma) | 0,6 |
| `sol.html` / `logo.html` (escala 1, cierre de cara; medido en `sol`) | 2,4 |
| `kiai.html` (6 alumnos, escala 0,5) | 3,2 |

### Límites (presentación)

- El rollo es 2D: no proyecta sombra en el dōjō ni el karateka puede «pisarlo» en 3D. Para el plano 3 (karateka pequeño en el borde del rollo)
  renderiza el karateka en una viñeta o dibuja el rollo encima de la escena 3D y el karateka en otra capa.
- En plano general de la fila la cara de gallo se lee poco (cabezas de ≈130 px): acerca la cámara o corta a un plano más cerrado del que grita.
- Las cejas por encima de `cejas ≈ 0,6` se esconden bajo el flequillo: el «gallo» se apoya en la boca torcida y los ojos muy abiertos.
- `crearLogo` añade dos mallas a la escena: si la escena sigue con otra cosa, `logo.ocultar()`. El encuadre exacto solo es exacto con `escala: 1`.
- Fuera del rollo no se dibuja nada: pinta tú el fondo (papel, dōjō…) antes de `rollo.dibujar`.

### Poses 2026-11-16 (hikite y kiai-gallo) — `herramientas/disenar-poses-2026-11.mjs`

| Pose | Uso |
| --- | --- |
| `P['hikite-medio']` | Error: gyaku-zuki + puño izquierdo a medio camino (pecho, codo abierto). Piernas = `zenkutsu-dachi`. La versión completa (hikite en cadera) es `P['gyaku-zuki-kiai']` |
| `P['agarre-brazo']` → `P['tiron-cadera']` | Mano izquierda abierta al frente → cerrada en la cadera: `mezclar(a, b, f)` |
| `P['rival-brazo-extendido']` | Rival (siempre `silueta('#1A1A1A')`), brazo derecho extendido. `rival.colocar(X, Z, 180)` de modo que `rival.punto('manoD')` ≈ `k.punto('manoI')` con `agarre-brazo` (restar el uno al otro); desequilibrio con `op.inclinar` 6–10. Ejemplo en `prueba/poses-2026-11-16.html` |
| `P['mano-hara']` | Yoi con las dos manos abiertas sobre el bajo vientre. Giro de cabeza hacia un lado: `{ ...pose, cabeza: { giro: 35 } }` (no hace falta pose aparte) |

Golpe con boca abierta: `choku-zuki-kiai` (desde yoi, para la fila) o `gyaku-zuki-kiai` + `k.cara(CARAS.kiai)`; caras `kiai`, `gallo`, `deReojo` (sonrisa tímida: `{ sonrisa: 0.5 }`).
Fila de 5 con cinturones distintos: `crearFila(esc, { n: 5, columnas: 5, separacion: [0.7, 1.1] })` y `fila.miembros[i].cinturon('verde')`; cámara `orbita({ centro:[0,1,0], distancia: 12.5, elevacion: 4, fov: 26 })` y `esc.escena.fog.near = 16; fog.far = 60` (si no, la niebla los borra). Con `distancia 8.8` solo caben 3.
Hoja de prueba: `HTML=$PWD/prueba/poses-2026-11-16.html bash herramientas/taller.sh salida.png "0 1 … 10"`.

## Judo y Kōdōkan — `judo3d.js` (pieza `2026-11-16-cinturon-judo`)

`import { crearCinturonSuelto, crearJudoka, crearSala, crearPancarta, sello } from '.../judo3d.js'`. Escena de ejemplo: `prueba/poses-2026-11-16b.html`.

### Poses nuevas (`P[...]`, `herramientas/disenar-poses-2026-11b.mjs`)

| Pose | Uso |
| --- | --- |
| `P['atar-cinturon']` | Yoi con las dos manos cerradas a los lados del nudo (0,2 m), tirando de los extremos (planos 1 y 11). `k.aplicarPose(p, { cinta: { x: 0.2, z: 0 } })` balancea las caídas |
| `P['pasar-objeto']` | Brazos extendidos al frente, palmas arriba, manos a 0,24 m, inclinación 10° (silueta de Kanō) |
| `P.recibir` | Dos manos abiertas juntas, palmas arriba, inclinación 14° (silueta de Funakoshi). Colocación: dador en `(0, -0.43, rumbo 0)`, receptor en `(0, 0.43, rumbo 180)` (0,86 m entre ellos) |
| `P.seiza` | Sentado sobre los talones, manos en los muslos. Aplicar con `{ suelo: false, altura: -0.62 }` (la sala lo hace sola) |

Entrada y salida de un gesto: `mezclar(P.yoi, P.recibir, f)`.

### Cinturón suelto — `crearCinturonSuelto({ color: 'negro', largo: 1.9 })`

Cinta plana (se reconstruye cada vez que la llamas, sin estado) con las puntas colgando. `esc.escena.add(c.raiz)`.

| Método | Uso |
| --- | --- |
| `c.entre(A, B)` | Sujeto por dos puntos (`k.punto('manoI')`, `k.punto('manoD')`); las puntas caen |
| `c.pasar(dador, receptor, p, { arco: 0.1 })` | `p` 0→1: va de las manos del dador a las del receptor (ambos ya con su pose aplicada ese fotograma) |
| `c.tirante(A, B)` | Recto, centrado entre A y B |
| `c.halo(p, escala)` | Resplandor cálido de leyenda (0..1, aditivo, borde irregular). No es rojo: el rojo del plano 8 es la tarjeta «LEYENDA» |
| `c.color('amarillo')`, `c.ocultar()`, `c.mostrar()` | |

```js
const a = crearJudoka({ cinturon: 'negro', color: '#1A1A1A', detalle: 'kano' }), b = crearJudoka({ cinturon: 'negro', color: '#1A1A1A' });
a.colocar(0, -0.43, 0); b.colocar(0, 0.43, 180); a.aplicarPose(P['pasar-objeto']); b.aplicarPose(P.recibir);
cinta.pasar(a, b, U.prog(t, 1, 2.5)); cinta.halo(U.prog(t, 2.5, 3.2));
```

### Siluetas — `crearJudoka({ cinturon: 'blanco' | 'negro', color: '#3E3A36', detalle: null | 'kano' | 'kawaishi', peinado })`

Karateka3D en silueta sin rostro **con el cinturón visible** (el blanco, blanco; el negro, negro puro; `silueta()` a secas lo pierde).
Poses: `neutra`, `yoi`, `rei`, `pies-juntos`, `gyaku-zuki-kiai` (Funakoshi en kata). Para el plano 4 usa el `color` por defecto (marrón ceniza)
para que el cinturón negro se lea; Kanō SIEMPRE `color: '#1A1A1A'`.
`detalle` es la única seña de las figuras históricas, sin rasgos de la persona: `'kano'` = hakama (falda recta oscura; solo piernas rectas: neutra, yoi, rei),
`'kawaishi'` = boina plana (seña visual de «Francia»; el animador decide si la usa). Ancho de 4 siluetas en fila: cámara `distancia 14`, separación 1,0 m.

### Sala del Kōdōkan — `crearSala(esc, { publico: {} })`

Estilizada, **sin logos ni escudos**: paredes de yeso claro, postes y vigas de madera, ventanales de shōji; tatami del escenario
(`crearEscenario({ suelo: 'tatami' })`). Oculta las paredes del dōjō cálido; `sala.mostrar()` / `sala.ocultar()` las alterna.
Hueco útil: ancho 16 m, fondo hasta z = −16.

- `publico: { filasLado: 3, porFila: 6, filasFrente: 2, porFilaFrente: 7 }` → siluetas sentadas (seiza) en U: dos lados mirando al centro y un fondo que mira a cámara
  (50 por defecto; `publico: null` = sala vacía). `sala.publico.miembros` son Karateka3D.
- `sala.publico.pose(P, { t, modo: 'quieto' | 'asentir' | 'mirar', ritmo })`: cabecean (plano 6) o se vuelven unos a otros. Llamarlo cada fotograma.
- Funakoshi: `crearJudoka({ cinturon: 'negro', color: '#1A1A1A' })` en el centro (z ≈ 0), `P['gyaku-zuki-kiai']`. Cámara de la prueba: `orbita({ centro:[0,1,-2], distancia: 20, elevacion: 12, fov: 30 })`.
- `crearPancarta({ texto: '', ancho: 2.2, alto: 0.7, y: 3.4 })` (`.colocar(x, z, rumbo)`, `.pop(p)`): tela de papel con dos varas, vacía por defecto (ponle `texto`
  o rotúlala en 2D). Cartel de madera con texto: `crearCartel` (historia3d). Mapa/emaki: `rollo2d`.

### Sello rojo (2D) — `sello(ctx, '初段', x, y, size, p, { rotar, color })`

Estampa con rebote (`p` 0→1). `'沖縄'` y `'初段'` salen a dos caracteres apilados; un solo carácter sale grande. Rojo de marca. Dibujar después de `esc.dibujar`.

## Kumite — `kumite3d.js` (pieza `2026-11-16-kumite-puntos`)

`import { crearPareja, alinearRival, crearAreaWKF, CINTURON_AKA, CINTURON_AO } from '.../kumite3d.js'`

### Poses nuevas

| Pose | Uso |
| --- | --- |
| `P['mawashi-geri-jodan']` | Patada circular a la cabeza con la pierna **derecha** desde `kamae` (hidari): tobillo en (−0,20; 1,43; 0,63) respecto al pie de apoyo, a la altura de la cabeza de ao. Poses de un instante: `mezclar(P.kamae, P['mawashi-geri-prep'], f)` → `mezclar(prep, jodan, f)`. Para espejo (pierna izquierda) `espejo(P[...])` |
| `P['mawashi-geri-prep']` | Rodilla derecha subida de lado |
| `P['mae-geri-chudan']` | Patada frontal al tronco, tobillo derecho en (−0,12; 0,98; 0,81). Preparación: `P['mae-geri-prep']` |
| `P['kumite-esquiva']` | Ao recibe: kamae con el tronco 12° atrás y rodillas flexionadas, guardia alta |
| `P['espalda-tras-patada']` | Giro de ≈160° (cadera 80° + tronco 80°) con la cabeza mirando de reojo: la espalda queda hacia ao (plano 9). `mezclar(P['mae-geri-chudan'], P['espalda-tras-patada'], f)` |

Sin casco, sin contacto: las patadas se paran a ≈ 5 cm (`hueco`). Si el pie de apoyo desliza al mezclar, `k.aplicarPose(p, { ancla: { pie: 'I', x, z } })`.

### Pareja — `const par = crearPareja(esc, { distancia: 2 })`

`par.aka` (cinturón `CINTURON_AKA` #B01620, un rojo algo más oscuro que el de marca #C8102E para no confundirse con rastros y marcador;
si prefieres el de marca, `par.aka.cinturon('rojo')`) y `par.ao` (`CINTURON_AO` #1F4C9A, flequillo). Los dos son Karateka3D con gi blanco, sin casco.

| Método | Uso |
| --- | --- |
| `par.colocar(d, x, z, rumbo)` | Enfrentados a `d` m, centrados en (x, z). Aka mira a +Z con rumbo 0 y ao a −Z |
| `par.alinear('mawashi-geri-jodan' \| 'mae-geri-chudan', { hueco: 0.05 })` | Tras `aplicarPose` a los dos: mueve a ao para que el pie de aka acabe a `hueco` m de su cabeza (jōdan) o pecho (chūdan). Llamarlo cada fotograma que aka esté en la pose |
| `par.centro()` | `[x, z]` del punto medio, para centrar la cámara |

Cámara de 2 personas en 9:16: `esc.orbita({ centro:[cx, 1.1, cz], distancia: 10.5, azimut: ±75…90, elevacion: 3, fov: 26 })`; con `distancia 7,5` no cabe aka entero.
La patada derecha se ve de frente desde `azimut −75` (aka a la izquierda, ao a la derecha); desde `+90` el pie queda tapado por la cabeza de ao.
`esc.sombraEn(cx, cz)` si se alejan del origen. Dos Karateka3D con sombra: ≈ 2 s/fotograma a escala 0,5.

### Área de combate — `crearAreaWKF(esc, { lado: 8, seguridad: 2 })`

Lámina sobre el tatami: línea blanca del área (8 × 8 m), zona de seguridad (jōgai) algo más oscura fuera, y dos marcas de salida (roja y azul) a 2 m. Decorativa: no pongas cifras de medidas en pantalla.
`.ocultar()` / `.mostrar()`. Marcador, regla de seis casillas, cronómetro 3:00 y bandera senshu son 2D (`overlay2d.js`), los hace el animador. Las protecciones (guantes, espinilleras) no están hechas: los cinturones bastan.

### Tiempos y límites (judo y kumite)

- Captura suelta ≈ 3,5 s (arranque incluido); sala con 50 siluetas ≈ 5,3 s. Fotograma de vídeo: ≈ 1,5 s (pareja), ≈ 2,5–3 s (sala llena); en `escala: 0.5`.
- El hakama de Kanō y la boina de Kawaishi son rígidos: solo con las piernas rectas.
- Las manos agarran el cinturón «de mentira»: la cinta se pone entre `punto('manoI')` y `punto('manoD')`; con las manos muy separadas se queda recta. No hay anudado ni nudo que se deshaga: `atar-cinturon` es un gesto con las caídas del propio karateka.
- La patada circular se resuelve por optimización (error de ≈ 4 cm sobre el objetivo); el empeine apunta de lado y no se ve bien desde azimut +90.
- La sala llena es de siluetas todas iguales de color (con variación de peinado y cinturón negro/blanco); sin sombras proyectadas, salvo la del personaje central.

## Tiempo de contacto — `ciencia3d.js` + `ciencia2d.js` (pieza `2026-11-17-tiempo-contacto`)

Desde la pieza: `import { crearAlmohadilla, crearChoque } from '../../../../animacion/3d/ciencia3d.js'` y `import * as C from '.../ciencia2d.js'`
(con `marca.js` antes). Escenas de ejemplo copiables: `prueba/ciencia.html` (3D, una vista por `t` entero) y `prueba/ciencia2d.html` (2D sobre papel).

### Poses nuevas (`P[...]`)

| Pose | Uso |
| --- | --- |
| `P['empuje-recto']` | Empuje SIN kime: **mismas piernas que `gyaku-zuki-kiai`** (mezclar sin deslizar pies), tronco 12° adelante, brazo derecho extendido con la **palma abierta** al frente a ≈ 1,08 m (mano en (−0,055; 1,08; 0,61) respecto al origen), izquierda suelta junto a la cadera. `mezclar(P['gyaku-zuki-kiai'], P['empuje-recto'], f)`. Cara sin grito: `k.cara({ sonrisa: 0.1 })` |
| `P['encoge-hombros']` | Plano 12: yoi, cabeza ladeada 14°, codos pegados y antebrazos abiertos con las palmas arriba. Los hombros del rig no suben: se lee por brazos y cabeza. Cara: `{ cejas: 0.5, sonrisa: 0.15, torcida: 0.4 }`. `mezclar(P.neutra, P['encoge-hombros'], U.easeBack(f))` |

### Almohadilla — `const a = crearAlmohadilla({ altura: 1.1 })` (`esc.escena.add(a.raiz)`)

Almohadilla acolchada (cara crema, cuerpo oscuro) sobre mástil con base. Su frente mira a +Z local (rumbo 0); para recibir a un karateka con rumbo 90 ponla con `colocar(x, z, −90)`.

| Método | Uso |
| --- | --- |
| `a.hundir(p)` | **Hundimiento 0..1**: la cara cede hasta el 62 % del grosor y el acolchado se ensancha un poco |
| `a.mover(d, cabeceo)` | Retroceso de la almohadilla `d` m sobre el mástil y cabeceo en grados (plano 3: «sale despedida») |
| `a.colocar(x, z, rumbo)` | Sitúa el pie y orienta la cara |
| `a.pegarA(k, 'manoD')` (o un `Vector3`) | Mueve la almohadilla para que su cara (ya hundida) toque ese punto. Llamar tras `hundir`/`mover` y tras aplicar la pose |
| `a.cara()` · `a.alfa(0..1)` · `a.visible(bool)` | Centro de la cara en el mundo, fundido, ocultar |

Secuencia del plano 2 (izquierda: puño que se frena; derecha: empuje que sigue): en cada fotograma `k.aplicarPose(...)`, `a.hundir(p)`, `a.pegarA(k, 'manoD')`; el hundimiento sube rápido (p ≈ 0,2 en 0,05 s) o despacio (p → 0,8 en 0,6 s) según la mitad. Con el puño de `gyaku-zuki-kiai` la mano queda en z ≈ 0,54 y con `empuje-recto` en z ≈ 0,61: la almohadilla se recoloca sola con `pegarA`.
Cámara de perfil: `orbita({ centro: [0.5, 1.0, 0], distancia: 6, elevacion: 3, fov: 26 })`; solo la almohadilla: `distancia 3.2`, `centro [0, 0.9, 0]`.

### Cojín airbag + maniquí + pared — `const ch = crearChoque(esc, P, { cojin: true, xPared: 2.2 })`

Pared lisa (x = 2,2 m, cara hacia −X), cojín blanco hinchado con dos costuras y un maniquí en silueta de tinta (`Karateka3D` con `silueta('#1A1A1A')`) que llega por −X mirando a +X.
Sube la niebla por ti (`fog.near ≥ 24`). Para «ambiente neutro» usa `crearEscenario({ fondo: 'degradado' })`.

| Método | Uso |
| --- | --- |
| `ch.poner({ distancia: 0.5, hund: 0, inclina: 8, pose: P.neutra })` | Maniquí a `distancia` m del contacto (0 = el pecho toca la cara del cojín o de la pared) con el cojín hundido `hund` 0..1. Llamar cada fotograma. Mitad A: `distancia` baja a 0 mientras `hund` sube despacio; mitad B: `cojinVisible(false)` y `distancia` → 0 en seco |
| `ch.hundir(h)` | Solo el cojín |
| `ch.cojinVisible(bool)` | Quita / pone el cojín (pared desnuda) |
| `ch.maniqui` · `ch.pared` · `ch.raiz` · `ch.caraX(h)` | Karateka3D del maniquí, grupo de la pared, x de la cara del cojín |
| `ch.ocultarManiqui(bool)` | |

Flechas de fuerza de distinta longitud: `Diagrama3D.flecha({ desde: [x, 1.2, 0], hacia: [...] })` (ver «Diagramas»). Cámara: `orbita({ centro: [1.1, 1.1, 0], distancia: 8.5, elevacion: 3, fov: 36 })` (3/4: `azimut: −35`).

### Capa 2D — `import * as C from '.../ciencia2d.js'` (colores `C.COL`: tinta, papel, rojo, gris, azul tinta `#2F3E5C`)

Rojo solo para curvas / cifras clave. Texto ≥ 48 px. Dibujar tras `esc.dibujar(ctx)` (o sobre `EMAKI.fondoPapel(ctx)` en los planos 7–11).

| Función | Uso |
| --- | --- |
| `C.cronometro(ctx, { x, y, valor, tipo: 'ms'\|'mmss'\|'s', texto, size: 84, rojo, parado, t, alfa, etiqueta })` | Cronómetro digital (caja de tinta, esfera con aguja, cifras de papel o rojas). `texto: '16–19 ms'` fija la cifra (plano 9); `valor` animado con `tipo: 'ms'` para «correr muy poco y detenerse»; `parado: true` apaga el punto parpadeante. `C.formato(valor, tipo)` da el texto |
| `C.contadorVelocidad(ctx, { x, y, valor, max: 10, texto: '≈ 8', unidad: 'm/s', size: 150, rojo: true })` | Dial de medio arco con aguja que sube con `valor`; la cifra en rojo. `texto` fija la cifra (siempre «≈ 8», no «8») |
| `C.ejes(ctx, caja, { prog, etiquetaX: 'tiempo', etiquetaY: 'fuerza' })` | Ejes con flechas que se trazan (`prog` 0→1). `caja = { x, y, w, h }` (ej. `{ x: 190, y: 560, w: 760, h: 640 }`) |
| `C.curva(ctx, caja, { duracion: 0.8, impulso: 0.3, color, relleno: 0.28, prog, alfa })` | Pulso de fuerza. `duracion` = fracción del ancho; `impulso` = área (mismo `impulso` ⇒ **mismo área**: la curva estrecha sale más alta). `prog` la traza de izquierda a derecha. Devuelve `{ pico, x0, x1, ymax }` para colocar etiquetas |
| `C.morfosis(ctx, caja, f, { impulso, anchoA: 0.8, anchoB: 0.3 })` | Plano 8: una sola curva que pasa de ancha-azul (f 0) a estrecha-roja (f 1) sin perder área |
| `C.columnas(ctx, { caja, barras: [{ valor, texto, etiqueta, color, prog }], max, horizontal: false })` | Columnas de altura proporcional (planos 10–11: 875 N / 1750 N) o barras horizontales de tiempo (`horizontal: true`; el texto va a la derecha de la barra: deja ≈ 250 px) |
| `C.regla(ctx, { x, y, valor: 0..1, w: 420 })` | Regla de tiempo vacía que se llena (planos 2 y 5) |

Las cifras de pantalla son del dosier: nada se calcula aquí, tú pones el texto.

## Seiza — `seiza3d.js` + `seiza2d.js` (pieza `2026-11-17-seiza`)

`import { CARAS_SEIZA, ponerPose, levantarse, temblar, tambalear } from '.../seiza3d.js'` y `import { cronometroSeiza, gotaSudor, hormigueo } from '.../seiza2d.js'`. Ejemplo completo: `prueba/seiza.html` (planos 1, 2 y 6). Karateka con `cinturon: 'naranja'`.

### Poses

| Pose | Uso |
| --- | --- |
| `P.seiza` | **Ya existía** (`poses/seiza.json`, la del público del Kōdōkan) y **sirve para el karateka de gi** con cinturón naranja (revisado de frente y 3/4: las piernas no se cruzan feas). Hay que aplicarla con su altura: `ponerPose(k, P.seiza)` (= `k.aplicarPose(P.seiza, { suelo: false, altura: -0.62 })`); a secas flota |
| `P['seiza-alto']` | De rodillas, tronco erguido, glúteos levantados (cadera 0,62 m), talones libres. `ponerPose` (altura −0,335) |
| `P['en-cuclillas-medio']` | Transición: pies planos, muslos 80°, rodillas 120°, tronco inclinado 30° (cadera 0,52 m). Con suelo normal |
| `P['levantarse-vacilando']` | Piernas dormidas: rodillas hacia dentro y distinto doblez, tronco 26° y ladeado, mano izquierda a la rodilla y brazo derecho abierto para el equilibrio. Con suelo normal |
| `P['manos-rodillas']` | De pie, rodillas flexionadas, tronco 30°, las dos manos abiertas sobre las rodillas |

Las poses de rodillas llevan en su JSON `aplicar: { suelo: false, altura }`: usa siempre `ponerPose(k, pose, extra)`, que respeta ese campo (para las de pie vale `k.aplicarPose`).

### Levantarse — `levantarse(k, P, f, { t, tambaleo: 1 })`

`f` 0→1 recorre `TRAMOS`: seiza → seiza-alto (0,16) → en-cuclillas-medio (0,36) → levantarse-vacilando (0,58) → manos-rodillas (0,78) → neutra (1). Gestiona la altura de la cadera y el suelo. `t` activa el tambaleo (balanceo determinista de tronco, caderas y brazo; sube en f 0,4–0,5 y se apaga hacia 0,9). Ejemplo plano 6: `levantarse(k, P, U.prog(t, 9.5, 11.5), { t })` y `k.cara(mezclarCara(CARAS_SEIZA.hormigueo, CARAS_SEIZA.alivio, …))`.
Suelta: `tambalear(pose, t, amp)` (±7° de ladeo a amp 1) y `temblar(pose, t, amp)` (vibración de hombros del plano 2: `ponerPose(k, temblar(P.seiza, t, 1))`). Devuelven una pose nueva.

### Caras — `k.cara(CARAS_SEIZA.xxx)`

`tranquilo` (sonrisa 0,8 + cejas altas), `aguantando` (cejas −1, ojos 1, torcida 0,6), `sereno`, `cerrados` (parpadeo 1), `sorpresa`, `alivio`, `hormigueo`; `mezclarCara(a, b, f)` para transitar. Revisadas en `prueba/caras-seiza.png`: `ojos`, `torcida` y `parpadeo` combinan bien. **Límite:** el ceño (`cejas: −1`) apenas se ve porque las cejas quedan bajo el flequillo del peinado aprobado; el «aguantando» se lee por ojos muy abiertos + boca torcida + gota + temblor.

### Overlays 2D (`seiza2d.js`, tras `esc.dibujar(ctx)`)

| Función | Uso |
| --- | --- |
| `cronometroSeiza(ctx, { minutos: 1\|10, x: 540, y: 1430, size: 96, rojo, alfa, t })` | Cronómetro «1:00» / «10:00» (el 10:00 sale en rojo, como el «Minuto 10» del storyboard). Reloj parado en la cifra; con `valor` en segundos cuenta |
| `gotaSudor(ctx, x, y, t, { size: 80, ciclo: 1.3, doble: true, t0 })` | Gota que brota, resbala y se funde (ciclo continuo). Para la sien en seiza frontal (cámara `distancia 7`): ≈ (700, 560) |
| `hormigueo(ctx, esc, k, t, { intensidad })` | 5 puntos rojos por muslo y por pantorrilla anclados al cuerpo (`k.punto`), parpadeando a ritmos distintos; `intensidad` 1→0 los apaga uno a uno (`1 - U.prog(...)`). Llamar tras `esc.dibujar` con el karateka ya posado |

Kanji 正座 y 黙想: `H2.kanji(ctx, '正座', x, y, 120, { prog, color: '#1A1A1A' })` de `historia2d.js` (la fuente trae ambos; sin probar el trazo de cada uno, ver límites).

### Tiempos y límites (ciencia y seiza)

- Karateka + objeto, `escala: 0.5`: ≈ 0,5 s/fotograma (vídeo de 1 s de `seiza.html` en 14 s con arranque); captura suelta ≈ 3–6 s. Dos karatekas + almohadillas (pantalla partida): ≈ 1,5–2 s/fotograma.
- Pantalla partida: no hay un helper; dos escenas 3D o una sola con dos `Karateka3D` a ±0,9 m (rumbo 90) y dos almohadillas; el corte vertical se hace con `ctx.clip` en 2D.
- `levantarse`: los pies resbalan un poco entre seiza-alto y las cuclillas (sin IK); cámara frontal y a ≥ 7 m, o corta con un fundido. En `seiza-alto` los pies sobresalen detrás (talones libres).
- Almohadilla y cojín son formas simples (elipsoide y caja con bisel): no hay colisión ni física, todo lo mueve el animador con `hundir` / `mover` / `poner`. El hundimiento se ve de perfil, no de frente.
- Sombras: la almohadilla y la pared proyectan sombra del dōjō; el maniquí lleva las de contacto del karateka.
- El ceño no se lee con el flequillo normal (ver «Caras»). 正座 / 黙想 con `H2.kanji` no se han renderizado en esta entrega.

## Tigre — `tigre2d.js` (pieza `2026-11-18-tigre`)
`import * as T from '.../animacion/3d/tigre2d.js'`; todo con `p` 0..1 sobre el ctx 2D. Hoja: `prueba/tigre-2026-11-19.png`.
- `T.tigre(ctx, 'acecho'|'sentado'|'frente', p, x, y, escala, {espejo, color})`: tigre original a pincel (x, y = pies). Devuelve la punta del pincel. Dimensiones en `TIGRE_DIM[pose]`.
- `T.pincelada(ctx, 'barrido'|'interrogacion'|'bucle', p, x, y, escala)`: el 'bucle' sirve para el plano 10 y el plano 1 (mismo trazo). `T.trazo(ctx, pts, p, {w, color})`.
- `T.cubierta(ctx, {x, y, w, h, aparece, pincel})`: tela en blanco con pincelada abstracta.
- `T.kanji(ctx, '虎巻', x, y, size, {prog})` (tinta) y `T.rotulo(ctx, 'tora no maki', x, y, 64, p)`.
- `T.sello(ctx, p, x, y, 190, {texto:'SE DICE'})` (size ≥ 180 para 48 px) y `T.pergamino(ctx, t, {texto:'Cuentan que…', t0, t1})` (rojo, halo: ojo, tiñe todo el ancho) + `T.ojo(ctx, p, x, y, size, {t})`.
- Kosugi: `crearMaestro({silueta:'#1A1A1A'})` + pose `maestro-seiza-pincel` (captura `prueba/2026-11-19/tigre-kosugi.png`).
Límite: la pose 'sentado' es la más tosca (úsala pequeña). No es el emblema: sin círculo ni enroscado.

## Mano vacía — `manovacia.js` (pieza `2026-11-18-mano-vacia`)
Import: `import * as MV from '.../animacion/3d/manovacia.js'`. Prueba en `prueba/2026-11-19/manovacia.html` (hoja: `prueba/manovacia-2026-11-19.png`).
- 2D: `MV.tintaKanji(ctx, x, y, size, prog)` plano estrella 唐→空 (0–0,1 唐 · 0,1–0,45 mancha de tinta · 0,4–1 se escribe 空). `H2.kanji(ctx,'唐',…)` ya tiene zonas.
- `MV.reloj(ctx, t, x, y, size)` sello-reloj rojo «?» que gira · `MV.selloInterrogante(ctx, x, y, size, p)` · `MV.interrogaciones(ctx, t, rect)`.
- `MV.pantallaPartida(ctx, t, { p, arriba, abajo, rotuloA:'Tokio', rotuloB:'Okinawa' })`.
- 3D: `MV.crearLibro({ texto:'唐手' })` `.abrir(f)` `.escribir(p)` `.entre(k.punto('manoI'), k.punto('manoD'), { rumbo })` (pose `recibir`; tapa las manos: probar otra distancia).
- `MV.crearFunakoshi()` (hakama, alto) y `MV.crearHanashiro()` (más bajo, ancho, casquete): siluetas sin rostro.
- `MV.crearMesaNueve(esc)` 9 siluetas en seiza + periódico: `.pose(P, { t, alzan:[0,2], f })`, `.mirarse(P, t)`. `MV.crearEdificioNaha({ rotulo:'Naha' })` `.ventana(f)` (esquemático).
- Cámara de la mesa: `orbita({ centro:[0,0.7,0], distancia:11, elevacion:30 })`; con escala 0,5 `esc.escena.fog.far = 90`. Las siluetas salen marrón oscuro por la luz.

## Cadena cinética — `cadera3d.js` + `mezclarCadena` (pieza `2026-11-19-cadera`)
Prueba: `prueba/cadera-2026-11-23.html` (hoja `prueba/cadera-2026-11-23.png`). `import * as CD from '.../cadera3d.js'`.
- Pose `P['gyaku-zuki-hanmi']` → `P['gyaku-zuki-kiai']`. `mezclarCadena(a, b, { cadera, tronco, hombro, codo, mano, piernas, cabeza })` (karateka3d.js): cada eslabón con su f 0–1 (hombro → brazoI/D, codo → codoI/D, mano → muñeca y puño; sin indicar = 0). Pone `piernasFijas`: los pies no se mueven aunque la cadera gire. Ejemplo de escalonado en la hoja: `cadera s(0,.4) · tronco s(.15,.55) · hombro s(.3,.7) · codo/mano s(.45,.85)`.
- `k.punto('caderaI' | 'caderaD')`: articulación de cada cadera; `d.linea(k.punto('caderaI'), k.punto('caderaD'), { grosor: 0.03 })` (grosor en metros) dibuja la barra de la cadera. Llamar a `k.colocar` ANTES de `k.aplicarPose`.
- `const cad = CD.crearCadena(esc, k)`: 5 esferas (cadera, pecho, hombroD, codoD, manoD). Tras `aplicarPose`: `cad.actualizar([e0..e4], { estela: { pose: (tt) => pose, t, dur: 0.3, n: 6 } })`; `e` 0 = apagada (tinta), 1 = en su pico (rojo y mayor). `cad.ocultar()/mostrar()`.
- `const fan = CD.crearFantasma(esc)`: `fan.poner(vector3, alfa, { radio })` esfera gris + aro discontinuo quieto (el puño que se queda atrás: `fan.poner(k.punto('manoD'), 1)` con la pose inicial y no volver a llamarlo con otro punto).
- 2D `CD.picos(ctx, caja, { prog, t, activo: i|'todas', picos, alturas, etiquetas })`: cuatro campanas con pico escalonado (cadera, tronco, hombro, puño); la del cursor `t` sale en rojo. Dibuja antes `C.ejes(ctx, caja, { etiquetaY: 'velocidad' })`. Esquema, no datos: rotular «ESQUEMA, NO ESCALA» con `overlay`.
- Límites: `crearCadena` y `fan` se dibujan por encima del cuerpo (sin oclusión). La estela re-aplica la pose n veces (coste menor). Tras `actualizar` con estela la pose queda en `e.pose(e.t)` (con `e.op` si usabas ancla).
