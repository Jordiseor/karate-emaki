# Storyboard: De Okinawa a Tokio en 36 años (interactivo)
Formato: página web móvil primero (vertical 390×844 de referencia, también escritorio) · Pilar: Historia · Guionista, 2026-11-13
Entregable doble: (A) página interactiva para Interactivos; (B) reel de anuncio de 12 s para Animador/Editor.

## Estilo (resumen de marca.md)
- Fondo papel #F4EFE6, texto tinta #1A1A1A. Rojo #C8102E solo para datos clave: el año de cada hito, el «36» y la respuesta correcta del quiz.
- Ilustraciones como siluetas o figuras estilizadas planas, estilo rollo emaki. Nunca retratos de personas reales (ni Funakoshi, ni Hirohito, ni Kanō).
- Títulos en sans-serif gruesa; cuerpo legible, mínimo 18 px en móvil. Todo en español de España; rōmaji con traducción la primera vez.
- Sistema de certeza en cada tarjeta, con etiqueta de texto (no solo color, por accesibilidad): **Seguro** (relleno tinta), **Según fuentes** (solo borde tinta), **Leyenda** (rojo; ahora no hay ninguna tarjeta así).

## Estructura: 3 vistas (no hace falta repartir)
1. Portada con gancho.
2. Línea temporal (rollo horizontal, 12 tarjetas).
3. Cierre: mini-quiz de 3 preguntas + pregunta final para comentarios.

### Vista 1. Portada
- Gancho (texto grande): **«36 años. De un castillo en Okinawa a un dōjō en Tokio.»** El «36» en rojo.
- Subtítulo: «Desliza el rollo de 1921 a 1957.»
- Ilustración: silueta de karateka en pose de saludo (rei) delante de un rollo emaki a medio desenrollar; a la izquierda, tejado del castillo de Shuri; a la derecha, tejado de dōjō. Sin cara.
- Botón «Empezar» (≥48 px de alto). Aviso pequeño: «Cada hito indica su nivel de certeza.»
- Entrada: el rollo se desenrolla 1 s; con `prefers-reduced-motion`, aparece estático.

### Vista 2. Línea temporal
- Rollo horizontal, de derecha a izquierda (se avanza deslizando hacia la izquierda). Una tarjeta por pantalla, con `scroll-snap`.
- Cada tarjeta: año en rojo (grande), título, silueta, texto, etiqueta de certeza, fuente corta.
- Regla de línea de tiempo arriba: marcas de años proporcionales 1921–1957, con el hito actual resaltado en rojo. Tocar una marca salta a ese hito.
- Móvil: deslizar con el dedo (snap), tocar los bordes o las marcas. Indicador «n / 12».
- Teclado: flechas ←/→ (o Re Pág/Av Pág) cambian de hito; Inicio/Fin van al primero/último; Tab llega a las marcas y botones; Enter activa. Foco visible. Cada tarjeta con `aria-label` «año, título».
- Última tarjeta: botón «Ir al quiz».
- Al tocar la etiqueta de certeza se abre una línea explicativa: «Seguro = varias fuentes o fuente muy sólida. Según fuentes = una sola fuente abierta o fuentes que discrepan. Leyenda = se cuenta, sin fuente.»

### Vista 3. Cierre
- Quiz de 3 preguntas (una por pantalla, 3 opciones, respuesta inmediata con una línea de explicación; la correcta en rojo). Al final, puntuación «x/3» y «Volver al rollo».
- Pregunta final para comentarios (texto sobre silueta en saludo): **«¿Qué hito te ha sorprendido más? Cuéntalo en los comentarios.»**
- Pie: lista de fuentes (ver abajo) y nota: «Los hechos 1936, ocupación y JKA no dependen solo de Funakoshi.»

## Hitos (12)
Todos extraídos del dosier. Texto ≤35 palabras, título ≤6 palabras.

| # | Año | Título | Texto | Certeza | Fuente corta | Silueta sugerida |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1921 | Exhibición en el castillo de Shuri | Funakoshi dirige una exhibición de karate de alumnos de instituto en el castillo de Shuri. Hirohito, entonces príncipe heredero, pasaba por Okinawa rumbo a Europa. | Según fuentes | Shōtōkai | Tejado de castillo, filas de alumnos en kihon, figura pequeña con corona de lejos |
| 2 | 1922 | El karate llega a Tokio | Funakoshi viaja a Tokio y presenta el karate en la primera exposición de budō y educación física del Ministerio de Educación, con rollos de kata ilustrados. | Seguro (año; sin día) | Shōtōkai, JKA, Funakoshi 1957 | Silueta con rollo bajo el brazo, skyline de Tokio |
| 3 | 1922 | ¿Kata en el Kōdōkan? | Según la JKA, tras la exposición Funakoshi hizo una demostración de kata en el Kōdōkan, invitado por Jigorō Kanō. Shōtōkai y el propio Funakoshi (1957) no lo recogen. | Según fuentes | JKA (sin fecha) | Dos siluetas con judogi y karategi frente a frente, saludo |
| 4 | 1922 | Primer libro: *Ryūkyū Kenpō: Karate* | Funakoshi publica su primer libro, ilustrado con dibujos. Su título aparece en Funakoshi (1957) y en la JKA: *Ryūkyū Kenpō* (el «puño de Ryūkyū») y *Karate*. | Seguro | Funakoshi 1957, JKA | Libro abierto con dibujos de posiciones |
| 5 | 1923 | Arde el Museo de Educación | El terremoto de Kantō destruye el Museo de Educación de Tokio. Pudo ser sede de la exposición de 1922, pero eso es solo una hipótesis de un autor. | Según fuentes | ryukyu-bugei (Nakamura et al. 2008) | Edificio en llamas estilizado en tinta y rojo |
| 6 | 1936 | Naha discute el nombre, no decide | 25 de octubre: maestros de Okinawa se reúnen en Naha y hablan de escribir karate con «vacío» en vez de «China». No deciden nada. Funakoshi no figura entre los asistentes. | Según fuentes | Toyama 1960 (traducción) | Mesa con siluetas sentadas en círculo, un asiento vacío |
| 7 | 1936 | Su asociación se llama Shōtōkai | En Tokio, la asociación de Funakoshi pasa a llamarse Dai Nippon Karate-dō Shōtōkai. | Seguro | Shōtōkai | Cartel con caligrafía (sin leer) |
| 8 | 1939 | Se inaugura el dōjō Shōtōkan | El 29 de enero se inaugura en Zōshigaya, Tokio, el dōjō Shōtōkan. | Seguro | Shōtōkai | Fachada de dōjō con linterna |
| 9 | 1945 | Arde el dōjō; muere Yoshitaka | El dōjō Shōtōkan arde en los bombardeos de Tokio. Ese mismo año, más tarde, muere Yoshitaka, hijo de Gichin, de tuberculosis. No murió en el incendio. | Seguro (incendio) · Según fuentes (Yoshitaka) | Shōtōkai, JKA; Yoshitaka: una fuente secundaria | Dōjō en llamas y silueta pequeña aparte, sin relación visual de causa |
| 10 | 1945–1952 | Ocupación: clubes sin reconocimiento oficial | Con la prohibición del budō aplicada también al karate, queda fuera de escuelas y universidades. Sobrevive en clubes universitarios sin reconocimiento oficial. | Según fuentes | Svinth, 2002 | Silueta entrando por una puerta lateral de universidad |
| 11 | 1948–1949 | Finales de los 40: nace la JKA | Se funda la Japan Karate Association, con Funakoshi como Maestro Supremo. Dos páginas de la propia JKA dan fechas distintas: noviembre de 1948 y 1949. | Según fuentes | JKA (dos páginas) | Emblema genérico de asociación (no el logo real) |
| 12 | 1957 | Muere Gichin Funakoshi, 88 años | El 26 de abril de 1957 muere Gichin Funakoshi, a los 88 años. El karate ya se había extendido por Japón gracias a la JKA. | Seguro | JKA, historia | Silueta en saludo, pétalos de cerezo; el rollo se cierra |

Notas por hito para Interactivos:
- Tarjeta 2: no mostrar día. En pantalla, solo «1922».
- Tarjeta 3 y 5: mostrar la etiqueta «Según fuentes» con borde destacado; el texto ya incluye la reserva.
- Tarjeta 9: dos etiquetas en la misma tarjeta (una por dato). No dibujar al hijo dentro del incendio.
- Tarjeta 10: no escribir «el karate se enseñaba en las universidades». El matiz es «clubes sin reconocimiento».
- Tarjeta 11: no mostrar fecha de reconocimiento ministerial (1957/1958 sin resolver).

## Hitos quitados o matizados (para el Sensei)
- **Quitada:** las planchas del primer libro destruidas en 1923 (no hay fuente). Solo queda en el quiz como aclaración. Si se quisiera como tarjeta, iría con etiqueta roja «Leyenda sin fuente».
- **Quitada:** la premisa «el karate siguió en las universidades mientras judo y kendō estaban restringidos». Sustituida por la tarjeta 10.
- **Quitada:** la anécdota del cinturón negro regalado por Kanō (leyenda no verificada).
- **Matizados:** muerte de Yoshitaka (tarjeta 9), JKA 1948/1949 (11), Kōdōkan (3), exposición de 1922 sin día (2), Hirohito como dato de una sola fuente (1), reunión de Naha sin decisión (6).
- **Opcionales no incluidos** (están en el dosier, bien respaldados): 1924, primeras certificaciones de dan; 1925, *Rentan Goshin Karate-jutsu* con fotos. Se pueden añadir como tarjetas 5 y 6 si el Sensei quiere 14.
- No incluidos: día del incendio del dōjō, día de la exposición, nombre del edificio de la exposición, reconocimiento ministerial de la JKA.

## Mini-quiz (3 preguntas)
| # | Pregunta | Opciones | Correcta | Explicación (≤25 palabras) |
| --- | --- | --- | --- | --- |
| 1 | ¿Cómo murió Yoshitaka Funakoshi? | a) En el bombardeo del dōjō · b) De tuberculosis, después del incendio · c) En el terremoto de 1923 | b | Según fuentes, murió de tuberculosis en 1945, después del incendio del dōjō. No murió en el bombardeo. |
| 2 | ¿Qué decidieron los maestros en la reunión de Naha de 1936? | a) Llamarlo karate-dō · b) Escribirlo con «vacío» · c) No decidieron nada | c | Hablaron de escribir karate con «vacío» en vez de «China», pero no tomaron una decisión formal. |
| 3 | ¿Qué pasó con el karate en las universidades durante la ocupación? | a) Se enseñaba con normalidad · b) Quedó fuera de escuelas y universidades, con clubes sin reconocimiento · c) Se hizo obligatorio | b | Sin reconocimiento oficial, sobrevivió en clubes universitarios. |

Nota: la pregunta 3 es la que más cambia respecto a la idea original; el texto de la explicación no puede decir que «se enseñaba» oficialmente.

## Fuentes en el pie de página (las del dosier, abiertas el 2026-11-12)
Shōtōkai (historia) · JKA (Maestro Supremo; historia) · Funakoshi 1957, trad. Tankosich · ryukyu-bugei · Toyama 1960, reunión de Naha · Svinth 2002 · Wikipedia EN y Shōtōkai (Yoshitaka). Aviso: «Fechas con reservas indicadas en cada tarjeta».

---

# B. Reel de anuncio (12 s, 1080×1920)
Objetivo: que se abra el interactivo. Una sola idea: «36 años en un rollo». Subtítulos siempre; locución sintética cálida, español de España. Estilo: siluetas sobre papel #F4EFE6, rojo solo en el «36» y el año. Texto máx. 7 palabras por tarjeta; mín. 48 px.

| Plano | Tiempo | Lo que se ve | Texto en pantalla | Locución | Nota |
| --- | --- | --- | --- | --- | --- |
| 1 (gancho) | 0–3 s | Fondo papel. Un «36» enorme en rojo golpea la pantalla; debajo, el rollo emaki empieza a desenrollarse hacia la izquierda. | «36 años.» | «Treinta y seis años.» | Golpe de sonido al aparecer. Dato, no presentación. |
| 2 | 3–5,5 s | Tejado de castillo con filas de siluetas haciendo kihon; cartel rojo «1921». | «1921: castillo de Shuri» | «De un castillo en Okinawa...» | El rollo avanza. |
| 3 | 5,5–8 s | El rollo pasa por el skyline de Tokio y un dōjō con linterna; el año cambia a «1939». | «1939: dōjō Shōtōkan en Tokio» | «...a un dōjō en Tokio.» | Transición por el avance del rollo. |
| 4 | 8–10,5 s | Un dedo (silueta de mano) desliza el rollo en un móvil dibujado; aparecen marcas de años y etiquetas «Seguro» / «Según fuentes». | «Desliza. Cada hito, con su fuente.» | «Recórrelo con el dedo, hito a hito, con su nivel de certeza.» | El móvil muestra la línea temporal real (maqueta). |
| 5 (cierre) | 10,5–12 s | Silueta en saludo (rei) junto al rollo cerrado; botón dibujado «Enlace en el perfil». | «Enlace en el perfil» | «Está en el enlace del perfil.» | Sin pedir comentarios; la pregunta va al final del interactivo. |

## Datos usados (todos están en el dosier)
36 años (1921–1957, punto 12) · 6 mar 1921 Shuri y Hirohito (hito 1; solo se muestra «1921») · 1922 Tokio, exposición, rollos de kata, libro (hitos 2 y 4) · Kōdōkan según JKA (hito 3) · terremoto y museo 1923 (hito 6) · reunión de Naha 25 oct 1936 sin decisión (hito 8) · Shōtōkai 1936 (hito 9) · 29 ene 1939 (hito 10) · 1945 incendio y Yoshitaka (hitos 11 y 12) · ocupación y clubes (hito 13) · JKA 1948/1949 (hito 14) · 26 abr 1957, 88 años (hito 15).
