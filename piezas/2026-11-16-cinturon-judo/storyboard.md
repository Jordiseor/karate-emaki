# Storyboard: El cinturón negro del karate nació en el judo
Duración total: 30 s · Pilar: Curiosidades · Formato: 1080×1920 (3D, `animacion/3d/`)
11 planos de 2,5–3 s · Locución ≈ 84 palabras (≈ 2,8 palabras/s, voz de sempai) · Dōjō cálido, tono papel #F4EFE6, tinta #1A1A1A. Rojo #C8102E solo para el rótulo «LEYENDA», flechas y fechas clave. Texto en pantalla ≥ 48 px, máx. 5 palabras por tarjeta.

## Gancho
Plano 1, segundo 0: sin título ni logo. Primer plano del nudo del cinturón negro; dos manos lo aprietan en t=0 y la cámara retrocede a plano medio. Tarjeta y voz dicen lo mismo, afirmando solo lo verificado (el sistema de grados, no el objeto). Se usa el ajuste del dosier («El cinturón negro del karate nació en el judo»), no el gancho original del encargo.

## Escenas
| # | Tiempo | Lo que se ve (animación 3D) | Texto en pantalla | Locución | Nota para el animador |
| --- | --- | --- | --- | --- | --- |
| 1 | 0,0–3,0 | Karateka con cinturón negro, plano muy cerrado del nudo; las manos tiran de los extremos (ya en t=0). Cámara retrocede a plano medio frontal y el karateka mira a cámara, cejas alzadas. | Nació en el judo | «El cinturón negro del karate… nació en el judo.» | Fotograma 0 = manos ya apretando. Rojo solo en «judo». Pose `atar-cinturon` (pendiente). |
| 2 | 3,0–5,5 | Corte a mapa de rollo (emaki) en tono papel: un sello rojo con 沖縄 «Okinawa» queda a un lado y una flecha apunta fuera hacia un dōjō de judo. Sin mapa realista, solo rótulos. | No vino de Okinawa | «No vino de Okinawa. Vino del judo.» | Usar `rollo2d` para la transición. Sin afirmar «en Okinawa no había grados» (el dosier lo deja sin verificar): solo se dice de dónde vino el sistema. |
| 3 | 5,5–8,5 | Silueta tinta de Kanō (figura estilizada, sin rasgos) en un dōjō de judo, de pie junto a un pergamino que se despliega con «1883». Aparecen dos tiras: «kyū» y «dan». | 1883: Kanō crea los grados | «En 1883, Jigorō Kanō creó los grados del judo: kyū y dan.» | Kanō SIEMPRE `silueta('#1A1A1A')`. Primera vez que salen kyū/dan: la voz los nombra y la tarjeta dice «grados». No decir «el cinturón negro nació en 1883». Pergamino con `historia2d`. |
| 4 | 8,5–11,0 | Fila de dos siluetas de judokas: una con cinturón blanco, otra negro. El resto del plano vacío. Al final la blanca hace rei. | Antes: blanco y negro | «Al principio, en Japón, casi todo era blanco o negro.» | Cinturones solo `blanco` y `negro` (dato: en Japón solo había esos dos). Pose `rei` con `mezclar(P['pies-juntos'], P.rei, f)`. |
| 5 | 11,0–14,0 | Gran sala del Kōdōkan: filas de siluetas sentadas, llena. En el centro, silueta de Funakoshi en postura de kata. Cartel «1922». | 1922: Funakoshi en el Kōdōkan | «En 1922, Funakoshi enseñó karate en el Kōdōkan, invitado por Kanō.» | Funakoshi y público en silueta, nunca retrato. Pose `gyaku-zuki-kiai` en silueta. Sala llena = `filas`. «Kōdōkan» aparece en tarjeta y voz; en la voz se dice «la escuela de judo de Kanō» solo si el Sonido pide aclarar. |
| 6 | 14,0–16,5 | Plano corto de las siluetas del público que se vuelven unas a otras y asienten; cámara sube a una pancarta vacía con «sala llena». | Sala llena | «Sala llena. Y una idea nueva.» | «Idea nueva» es transición, no dato. Tarjeta de 2 palabras. Sin cifras de asistentes. |
| 7 | 16,5–19,5 | Karateka con cinturón negro en `yoi` ante un pergamino que se desenrolla con «Abril 1924» y un sello rojo «初段» sobre un certificado. Flecha roja del certificado al karateka. | Abril 1924: primeros dan | «Y en abril de 1924, Funakoshi emitió los primeros certificados dan del karate.» | No poner número de alumnos (el «siete» no está verificado) ni «el primer cinturón negro». Se dice «certificados dan». `H2.pergamino`. |
| 8 | 19,5–23,0 | Pergamino «Cuentan que…» en rojo sobre el rollo. Dentro, siluetas de Kanō y Funakoshi; la de Kanō le pasa un cinturón negro. El cinturón brilla con un halo suave de leyenda (desvanecido, borde irregular). | LEYENDA | «Cuentan que Kanō le regaló un cinturón negro. Pero es solo una leyenda.» | «LEYENDA» en rojo, tarjeta propia de 1 palabra (≥ 48 px). Marcar «según un historiador» en letra pequeña. No afirmar el regalo, ni «del almacén», ni «el primero del karate». |
| 9 | 23,0–25,5 | Karateka de plano medio frontal: su cinturón cambia por tramos a amarillo, naranja y verde con cortes secos a cada medio segundo. Bandera ni mapa: solo rótulo «Inglaterra». | Los colores llegaron después | «Los colores llegaron más tarde. Primero, Inglaterra, en 1926.» | `k.cinturon(color)` en cadena. Dato: Koizumi/Budokwai, 1926 (sin decir «inventó» más allá de lo que da el dosier). |
| 10 | 25,5–28,0 | Mismo plano; el cinturón sigue a azul, marrón y vuelve al negro. Aparece rótulo «Francia 1935» y una silueta de Kawaishi que asiente sin tocar el cinturón. | Francia, 1935: Kawaishi | «Y Kawaishi los llevó a Francia en 1935.» | A Kawaishi solo se le atribuye llevarlos, no inventarlos. Silueta siempre. |
| 11 | 28,0–30,0 | Karateka a cámara, brazos cruzados, cinturón negro; guiña. Corte al plano 1 (bucle): vuelve a atarse el cinturón. | ¿De qué color es el tuyo? | «¿Y el tuyo? ¿De qué color es?» | Último fotograma enlaza con el plano 1 (mismo encuadre cerrado del nudo). `k.cara({guino})`. Tarjeta de 5 palabras. |

## Cierre y llamada a comentar
Pregunta abierta y fácil de responder: «¿De qué color es el tuyo?». Invita a comentar el cinturón actual y, de paso, a recordar que el sistema de grados no era de Okinawa. El bucle devuelve al gancho. Tono con respeto al judo y al Kōdōkan: se presenta como préstamo, no como copia.

## Datos usados (todos deben estar en el dosier)
- Kanō introdujo el sistema kyū/dan en el judo en 1883 (IJF/Wikipedia «Rank in Judo»); no se afirma que el cinturón negro naciera ese año.
- En Japón solo había cinturón blanco y negro antes de los colores (IJF; Nippon.com).
- Tras su exhibición de 1922, Funakoshi fue invitado por Kanō al Kōdōkan a mostrar kata, con sala llena (JKA).
- Funakoshi emitió el primer certificado de rango dan del karate en abril de 1924 (JKA, Supreme Master).
- Los colores de cinturón: Inglaterra, mediados de los 20, Koizumi/Budokwai, 1926 (IJF); Kawaishi los llevó a Francia en 1935 (IJF, Nippon.com).
- Leyenda: Kanō regaló un cinturón a Funakoshi (solo Quast, blog; fuente única), rotulada como leyenda.
- No se usa: número de alumnos de 1924, Funakoshi 5.º/10.º dan, significados místicos del cinturón, colores que usó Funakoshi, «en Okinawa no había grados».

## Qué hace falta
Existen (`animacion/3d/poses/`, README): `yoi`, `pies-juntos`, `rei`, `neutra`, `gyaku-zuki-kiai`, `brazos-arriba`, `Karateka3D.silueta()`, `cinturon()`, `cara`, `mezclar`/`espejo`, `Diagrama3D.flecha`, `overlay`; de historia: `filas`, casa-dōjō, pergamino «Cuentan que…» y kanji a trazos (`historia3d.js`/`historia2d.js`); rollo de papel (`rollo2d.js`). No he abierto cada JSON de `poses/`: la lista sale del README.
A pedir al Modelador 3D:
1. **`atar-cinturon`**: dos manos tirando de los extremos del nudo, cuerpo en `yoi` (plano 1 y 11).
2. **Objeto «cinturón suelto»** (tira de tela negra con caídas) que se pueda pasar de mano a mano (plano 8).
3. **`pasar-objeto` y `recibir`**: pose con brazos extendidos ofreciendo (silueta de Kanō) y pose con ambas manos abiertas recibiendo (silueta de Funakoshi) (plano 8).
4. **Decorado «sala del Kōdōkan»**: tatami, paredes claras y filas de siluetas sentadas (si `filas` no basta, variante de público sentado) y silueta en postura de kata (plano 5).
5. **Silueta de judoka** (judogi) con cinturón blanco o negro y pose `neutra`; silueta «Kanō» y «Kawaishi» solo con un detalle (nada de rostro) (planos 3, 4, 10).
6. **Cartel/pancarta** vacío y **sello rojo** con kanji (沖縄, 初段) (planos 2, 6, 7): puede salir de `historia2d` si ya soporta texto libre; si no, pedirlo.
7. Verificar que `k.cinturon(color)` admite cambios por tramos a mitad de escena (no hace falta pose nueva).
