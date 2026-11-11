# Storyboard: Presentación de KARATE EMAKI
Duración total: 20,2 s · Pilar: presentación de la cuenta (los 4 pilares en viñetas) · Formato: 1080×1920 · 9 planos (cambio cada 2,0–2,6 s)

- Id: 2026-11-11-presentacion · Guionista · 2026-11-11 · Parte de `encargo.md` (propuesta aceptada por Jorge).
- Voz: sharvard hombre, tono de sempai cercano, ≈2,6 palabras/s. **42 palabras** en total (límite 50). La voz de cada plano arranca a ≈0,1 s del corte.
- Texto en pantalla: una tarjeta a la vez, ≤5 palabras, nunca la frase de la voz. Rojo #C8102E solo para la cifra, el punto rojo y el disco del logo.
- Texto de pilar: en los planos 4–7 una etiqueta de **una palabra** (Historia, Técnica, Ciencia, Dōjō) en la esquina superior del marco del rollo, 0–0,8 s del plano. En el 6 la sustituye la cifra.
- **Decisión de formato.** Viñetas dentro de un rollo horizontal de papel (#F4EFE6, rodillos de madera en los extremos). Se ve una ventana de ≈960×1200 px (y 300–1500, dentro de la zona segura); entre viñetas el rollo se desplaza a la izquierda en 0,25 s (el borde de la viñeta anterior sale y entra la siguiente). Es lo más rápido de leer porque el marco no cambia, solo cambia lo de dentro, y refuerza la palabra «emaki».
- Definición de emaki verificada en `dosier.md` (Britannica, Kotobank): «un rollo japonés ilustrado que cuenta una historia, escena a escena». Locución de los planos 2–3 ajustada (añade «ilustrado»: 43 palabras).
- Bucle: el último plano y el primero comparten encuadre de la cara (ver planos 1 y 9).

## Gancho (0–2 s)
Plano 1. En el fotograma 0 ya hay una **cara a cámara** (la del logo, sonriente, sobre el disco rojo). A 0,3 s el disco se encoge hacia atrás como un sol, la cámara retrocede y aparece el dōjō con el karateka ya de cuerpo entero haciendo rei. Voz desde 0,0 s: «Pasa, que empezamos.». Sin dōjō vacío, sin presentación.

## Plano a plano

| # | Tiempo | Imagen | Cámara | Locución | Texto en pantalla | Assets (existe / falta) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0–2,0 s | Fotograma 0: cara del karateka sonriente centrada sobre disco rojo (mismo encuadre que el logo). A 0,3 s el disco se encoge y se va al fondo; el dōjō aparece y el karateka, de cuerpo entero y mirando a cámara, hace rei de 0,8 s y se endereza sonriendo. | Cierre de cara (escala 1) → retroceso rápido a cuerpo entero frontal (`distancia 7, fov 26`) en 0,6 s. | «Pasa, que empezamos.» | «KARATE EMAKI» | Karateka, pose `rei` y `pies-juntos`, dōjō, `cara({sonrisa})`: existe. Disco rojo: 2D en overlay (existe `foto-perfil.png` como guía). |
| 2 | 2,0–4,6 s | Del suelo sale un rollo de papel que se desenrolla hacia la derecha delante del karateka y llena el encuadre. Aparece la ventana vacía del rollo. | Plano fijo, ligero empuje (zoom 1,0 → 1,15) mientras se desenrolla. | «Un emaki es un rollo japonés ilustrado» | «絵巻 EMAKI» (kanji a trazos y debajo la palabra) | Rollo de papel: **falta**. Kanji 絵巻 con `H2.kanji`: existe (comprobar que 絵巻 sale bien con la fuente). |
| 3 | 4,6–7,4 s | El karateka, pequeño sobre el borde del rollo, señala con la mano abierta mientras la ventana pasa por cuatro marcos vacíos que se rellenan de uno en uno (parpadeo de tinta). | Plano 3/4 bajo, panorámica lateral lenta siguiendo la mano. | «que cuenta una historia, escena a escena.» | (sin texto) | Karateka y pose `neutra`: existen. Marcos vacíos: parte del rollo (**falta**). |
| 4 | 7,4–9,5 s | **Historia.** En la ventana, la casa-dōjō se levanta de golpe (base, postes, vigas, tejado) en 1,5 s, sin rótulo, al atardecer. Remata con un pequeño rebote. | Plano general ligero con picado, 1/4 de órbita (`distancia 21, elevacion 8, fov 30`). | «De dónde viene todo.» | «Historia» | `crearCasa` (`construir`/`pop`), `ambiente('atardecer')`: existe. |
| 5 | 9,5–11,6 s | **Técnica.** Zenkutsu-dachi de perfil. El punto rojo aparece de golpe en la cadera y su vertical cae sobre los pies. | Perfil (rumbo 90, `distancia 7,2, fov 26`), empuje rápido hacia la cadera. | «La técnica, paso a paso.» | «Técnica» | Pose `zenkutsu-dachi`, `Diagrama3D.cdm()`: existe. |
| 6 | 11,6–13,7 s | **Ciencia.** Misma pose; el cuerpo se inclina rígido hacia delante y el arco rojo crece hasta la punta del pie. La etiqueta «Ciencia» da paso a la cifra roja «≈26°». La figura aguanta con cara de esfuerzo. | Perfil, sin movimiento (la inclinación es la acción). | «Y la física: ¿cuánto aguantas?» | «Ciencia» (0–0,8 s) → «≈26°» (rojo, grande) | `d.ajustarVuelco(26)`, `d.arco({texto:'26°'})`, inclinar: existe. Poner «≈» delante con `overlay.cifra`. |
| 7 | 13,7–15,8 s | **Dōjō.** Fila de 6 karatekas en yoi. Todos sueltan un kiai con el puño al frente y la boca abierta; el último da un kiai que sale gallo: la cara se tuerce, las cejas suben y el bocadillo «KIAI» se quiebra en zigzag al final. El resto lo mira de reojo. | Plano frontal medio de la fila, sin mover. Corte en seco al kiai a 14,5 s. | «Y el dōjō. Con sus gallos.» | «¡KIAI!» → «¡Ki-ai-iii…!» (la segunda tiembla) | `crearFila`, `cara`: existe. Pose de golpe (gyaku-zuki o oi-zuki): **falta** (plan B: `zenkutsu-dachi` con boca abierta). SFX del kiai y del gallo: **falta** (Sonido). |
| 8 | 15,8–18,0 s | El rollo se enrolla rápido de derecha a izquierda cerrándose sobre la ventana; el último plano (los karatekas) se va con él. Queda un rollo cerrado, atado, sobre fondo de papel. | Plano fijo, ligero empuje a ojo de rollo. | «Karate contado escena a escena.» | «KARATE EMAKI» | Rollo cerrado: **falta** (misma pieza que el plano 2 en reverso). |
| 9 | 18,0–20,2 s | El rollo cerrado se abre en el centro como un sol y deja la cara del logo sobre el disco rojo (`foto-perfil.png`), que guiña con parpadeo. Es el mismo encuadre que el fotograma 0 del plano 1: el bucle no se nota. Últimos 0,4 s: el disco se queda quieto. | Fijo en cara, igual al plano 1 (fotograma 0). | «¿Te quedas?» | «Síguenos» | `foto-perfil.png`: existe. Parpadeo y guiño: `cara({parpadeo})` (existe). |

## Cierre y llamada a comentar
El rollo se cierra (plano 8) y la cara del logo asoma sobre el disco rojo (plano 9): «¿Te quedas?» con la tarjeta «Síguenos». La llamada a comentar va en el copy de Marketing («¿Qué quieres que contemos primero?»), no en pantalla, para no sumar texto. El plano 9 acaba en el mismo encuadre que el fotograma 0 del plano 1, así la pregunta «¿Te quedas?» vuelve a la bienvenida «Pasa, que empezamos.».

## Locución completa
> Pasa, que empezamos. Un emaki es un rollo japonés ilustrado que cuenta una historia, escena a escena. De dónde viene todo. La técnica, paso a paso. Y la física: ¿cuánto aguantas? Y el dōjō. Con sus gallos. Karate contado escena a escena. ¿Te quedas?

**Recuento: 42 palabras** (3 + 6 + 7 + 4 + 5 + 5 + 5 + 5 + 2). Texto exacto por plano y pronunciaciones en `locucion.txt`.

## Datos usados (todos deben estar en el dosier)

| Dato en el reel | Dónde está |
| --- | --- |
| Emaki = rollo japonés ilustrado que cuenta una historia, escena a escena | `dosier.md` de esta pieza (Britannica, Kotobank) |
| Zenkutsu: el cuerpo aguanta ≈26° de inclinación hacia delante (modelo simplificado) | Dosier `2026-11-09-zenkutsu-estabilidad` («Cifras finales recomendadas»). La nota de «modelo simplificado, adulto de 1,70 m» va al copy / primer comentario |
| Historia, técnica, ciencia, dōjō como los temas de la cuenta | `marca.md`, «Pilares de contenido» (sin datos concretos) |
| Plano 4 (casa-dōjō) y plano 7 (kiai que sale gallo) | Solo situaciones ilustrativas, sin año, nombre ni cifra |

## Assets que faltan (para el Modelador 3D)
1. **Rollo de papel** (`crearRollo`): rodillos de madera, papel #F4EFE6, `desenrollar(p)`, `enrollar(p)`, ventana de ≈960×1200 px con el 3D dentro y el desplazamiento lateral entre viñetas (0,25 s). Hace falta en los planos 2, 3, 8 y como marco de 4–7. Puede ser overlay 2D si es más rápido (no necesita 3D).
2. **Pose de golpe en fila** para el kiai (`gyaku-zuki` o `oi-zuki` desde yoi o zenkutsu), con boca abierta. Plan B si no llega: `zenkutsu-dachi` con la boca abierta.
3. **Cara de «gallo»** (opcional): cejas altas + boca a medio abrir asimétrica. Se puede conseguir con `cara({sonrisa:0.7, cejas:1})`; si no queda bien, pedir una expresión nueva.
4. **Comprobar kanji 絵巻** en `H2.kanji` (falta confirmar que la fuente lo traza bien).
5. **Disco rojo + cara del logo en 3D** (cierre de cara a cámara escala 1) con el mismo encuadre que `foto-perfil.png`, para el plano 1 y el 9. Si no, usar el PNG en el plano 9 y una cara 3D idéntica en el 1.
6. **SFX** (para Sonido, no 3D): kiai, kiai quebrado, golpe de papel al desenrollar y cerrar el rollo, música propia.

## Plan de animación en tres tramos paralelos
Prerrequisito común: el rollo (asset 1) y las constantes de encuadre de la cara (centro y tamaño del plano 1/9), que fija el Modelador antes de empezar.

| Tramo | Planos | Tiempo | Qué hace | Coste de render (≈) |
| --- | --- | --- | --- | --- |
| A | 1, 2, 3 | 0–7,4 s | Cara→cuerpo entero + rei, desenrollar el rollo, marcos vacíos. El plano 1 en `escala: 1` solo el primer segundo | ≈ 220 fotogramas × 2 s |
| B | 4, 5, 6 | 7,4–13,7 s | Casa-dōjō, zenkutsu con punto rojo, arco ≈26° (los tres dentro de la ventana del rollo) | ≈ 190 fotogramas × 2 s |
| C | 7, 8, 9 | 13,7–20,2 s | Fila de karatekas con kiai-gallo, rollo que se cierra, logo y bucle | ≈ 195 fotogramas × 3 s (la fila pesa; usar `columnas: 3` si hace falta) |

Los tres tramos entregan MP4 con el desplazamiento lateral de 0,25 s en cada extremo cortado en el mismo punto; el Editor une, pone voz, música y subtítulos. El tramo C debe acabar en el encuadre exacto del fotograma 0 del tramo A.
