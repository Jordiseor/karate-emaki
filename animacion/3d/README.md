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
| `prueba/presentacion/` | Escenas de ejemplo + PNG de cada asset de la presentación |

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
