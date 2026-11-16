# Storyboard: Embusen, el dibujo oculto de Heian Shodan (interactivo)
Formato: página web móvil primero (390×844 de referencia, también escritorio) · Pilar: Técnica · Guionista, 2026-11-16
Entregable doble: (A) página interactiva para Interactivos; (B) reel de anuncio de 14 s (1080×1920) para Animador/Editor.

## Condiciones de publicación (del dosier)
- La secuencia se presenta como **«la versión habitual en Shotokan»**, nunca como «la oficial JKA» ni «el dibujo exacto».
- Movimientos **18–21: «a confirmar»**. No mostrar grados, rumbo ni pie delantero en esos pasos. Antes de publicar, Jorge debe contrastarlos con Best Karate vol. 5 o con su sensei.
- Sin historia de Itosu/Funakoshi ni fechas (no hay fuente alta). Sin comparación con Pinan de otros estilos, salvo la frase neutra «según la escuela, hay variantes».
- Los rumbos de 1–17 están calculados sumando los giros de las fuentes (esfera de reloj de Fisher). Se avisa en pantalla.

## Estilo (resumen de marca.md)
- Fondo papel #F4EFE6, texto tinta #1A1A1A, rojo #C8102E solo para huellas, flechas y datos clave (nº de paso, kiai).
- Karateka 3D de arcilla/vinilo de `animacion/3d/`. En la vista cenital se ve desde arriba (cabeza grande, cinturón de color, hombros y pies reconocibles) sobre suelo de madera del dōjō con luz suave. Sin retratos de personas reales.
- Títulos en sans-serif gruesa; cuerpo mínimo 18 px en móvil. Botones ≥48 px de alto.
- Etiquetas de certeza (texto, no solo color): **Según fuentes** (borde tinta) en 1–17; **A confirmar** (borde rojo discontinuo) en 18–21. No hay ninguna etiqueta «Seguro»: ninguna fuente es federación.
- Al tocar la etiqueta: «Según fuentes = varias páginas de práctica coinciden; ninguna es federación. A confirmar = las fuentes discrepan; lo estamos contrastando.»

## Estructura: 4 vistas
1. Portada.
2. Embusen paso a paso (vista cenital, botones anterior/siguiente).
3. Dibujo final del recorrido.
4. Quiz de 3 preguntas + pregunta final.

### Vista 1. Portada
- Gancho (texto grande): **«Heian Shodan dibuja algo en el suelo.»** «dibuja» en rojo.
- Subtítulo: «Míralo desde arriba, movimiento a movimiento.»
- Ilustración: suelo de dōjō visto desde arriba, vacío, con una cruz de ejes tenue y un karateka 3D en el centro en hachiji-dachi (posición natural abierta). Una huella roja aparece bajo cada pie y se apaga.
- Botón «Empezar» (≥48 px). Aviso pequeño: «Versión habitual en Shotokan. Dibujo esquemático.»
- Entrada: las huellas aparecen 1 s; con `prefers-reduced-motion`, imagen estática.

### Vista 2. Embusen paso a paso
Maquetación (móvil): arriba, título «Embusen» + indicador «n / 21» y 6 marcas de tramo; centro (60 % de pantalla), suelo en vista cenital con el karateka y las huellas rojas acumuladas; abajo, tarjeta de texto del paso; pie, botones **‹ Anterior** y **Siguiente ›** (≥48 px).

Comportamiento:
- Paso 0 (inicio): karateka en hachiji-dachi mirando al norte (12). Texto: «Empezamos en hachiji-dachi (posición natural abierta). Mira al norte: esa es la parte alta de la pantalla.»
- Cada «Siguiente» anima 1 s al karateka a la nueva posición, deja una huella roja y dibuja una flecha roja con su dirección. Los pasos anteriores quedan como huellas rojas atenuadas. «Anterior» rebobina.
- Los giros se animan como giro sobre el sitio (arco rojo pequeño) y luego el paso.
- Kiai (9 y 17): destello rojo alrededor de la cabeza y rótulo «KIAI». Primera vez: «kiai (grito de concentración de energía)».
- Pasos 18–21: la flecha de dirección no se dibuja; en su lugar, un signo «?» rojo y el karateka en la posición del paso 17 con las manos cambiando. Las huellas, si se muestran, son discontinuas y sin rumbo concreto. Etiqueta «A confirmar».
- Atajos de tramo: tocar una de las 6 marcas salta al primer paso del tramo. Tramos: 1–2, 3–5, 6–9, 10–13, 14–17, 18–21 (este último marcado «a confirmar»).
- Teclado: ← / → cambian de paso; Inicio/Fin al primero/último; Tab llega a botones y marcas; Enter activa; foco visible. Cada tarjeta con `aria-label` «paso n, técnica».
- Último paso: botón «Ver el dibujo».
- Aviso fijo en pie (pequeño): «Rumbos calculados sumando los giros que dan las fuentes. Dibujo esquemático: las distancias no son reales.»

Orientación: 12 = norte (arriba), 9 = oeste (izquierda), 3 = este (derecha), 6 = sur (abajo).

Glosario de primera aparición (rōmaji con traducción): hidari (izquierda), migi (derecha), gedan-barai (barrido bajo), chūdan (nivel medio), jōdan (nivel alto), oi-zuki (puñetazo avanzando), age-uke (bloqueo ascendente), kentsui (golpe de martillo con el puño), shuto-uke (bloqueo con el canto de la mano), zenkutsu-dachi (posición adelantada), kokutsu-dachi (posición retrasada), kiai, hachiji-dachi, embusen (el recorrido de la kata sobre el suelo).

#### Texto de cada paso
Formato: n · Técnica (rōmaji) · Posición · Giro/dirección · Rumbo al que mira · Texto (≤25 palabras) · Etiqueta. «Lado» = pie y mano adelantados, según tabla del dosier.

| Nº | Técnica (rōmaji) | Posición | Giro / dirección | Rumbo | Texto en la tarjeta | Etiqueta |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hidari gedan-barai (izquierda, barrido bajo) | Hidari zenkutsu-dachi (posición adelantada, pie izquierdo) | Gira 90° a la izquierda | 9 oeste | «Primer giro: 90° a la izquierda y barrido bajo. La kata empieza hacia el oeste.» | Según fuentes |
| 2 | Migi chūdan oi-zuki (derecha, puñetazo medio avanzando) | Migi zenkutsu-dachi | Avanza | 9 oeste | «Un paso adelante con puñetazo al medio. Primer tramo corto.» | Según fuentes |
| 3 | Migi gedan-barai | Migi zenkutsu-dachi | Gira 180° | 3 este | «Media vuelta con barrido bajo. Ahora mira justo al lado contrario.» | Según fuentes |
| 4 | Migi kentsui (golpe de martillo con el puño) | Migi zenkutsu-dachi, sin paso | Misma dirección | 3 este | «Sin mover los pies: golpe de martillo. Una fuente pone aquí otra posición; dato a comprobar.» | Según fuentes |
| 5 | Hidari chūdan oi-zuki | Hidari zenkutsu-dachi | Avanza | 3 este | «Paso adelante y puñetazo medio con el otro lado.» | Según fuentes |
| 6 | Hidari gedan-barai | Hidari zenkutsu-dachi | Gira 90° a la izquierda | 12 norte | «Giro de 90° a la izquierda: se abre el eje largo del dibujo, hacia el norte.» | Según fuentes |
| 7 | Migi jōdan age-uke (derecha, bloqueo ascendente alto) | Migi zenkutsu-dachi | Avanza | 12 norte | «Avanza con bloqueo ascendente a la cara.» | Según fuentes |
| 8 | Hidari jōdan age-uke | Hidari zenkutsu-dachi | Avanza | 12 norte | «Otro paso, otro bloqueo ascendente con el lado contrario.» | Según fuentes |
| 9 | Migi jōdan age-uke | Migi zenkutsu-dachi | Avanza | 12 norte | «Tercer bloqueo ascendente y primer kiai (grito de concentración de energía).» | Según fuentes · KIAI |
| 10 | Hidari gedan-barai | Hidari zenkutsu-dachi | Gira 270° a la izquierda | 3 este | «Giro grande: 270° a la izquierda. Del norte al este con un barrido bajo.» | Según fuentes |
| 11 | Migi chūdan oi-zuki | Migi zenkutsu-dachi | Avanza | 3 este | «Avanza con puñetazo medio.» | Según fuentes |
| 12 | Migi gedan-barai | Migi zenkutsu-dachi | Gira 180° | 9 oeste | «Media vuelta con barrido bajo: se vuelve por donde se vino.» | Según fuentes |
| 13 | Hidari chūdan oi-zuki | Hidari zenkutsu-dachi | Avanza | 9 oeste | «Avanza con puñetazo medio hacia el oeste.» | Según fuentes |
| 14 | Hidari gedan-barai | Hidari zenkutsu-dachi | Gira 90° a la izquierda | 6 sur | «Giro de 90° a la izquierda: ahora la kata baja hacia el sur.» | Según fuentes |
| 15 | Migi chūdan oi-zuki | Migi zenkutsu-dachi | Avanza | 6 sur | «Primero de tres puñetazos seguidos avanzando.» | Según fuentes |
| 16 | Hidari chūdan oi-zuki | Hidari zenkutsu-dachi | Avanza | 6 sur | «Segundo puñetazo, con el lado contrario.» | Según fuentes |
| 17 | Migi chūdan oi-zuki | Migi zenkutsu-dachi | Avanza | 6 sur | «Tercer puñetazo y segundo kiai. Fin del tramo hacia el sur.» | Según fuentes · KIAI |
| 18 | Hidari chūdan shuto-uke (izquierda, bloqueo medio con el canto de la mano) | Kokutsu-dachi (posición retrasada) | A confirmar | — | «Empieza el cierre: cuatro shuto-uke en kokutsu-dachi. Giro y pie delantero, a confirmar.» | A confirmar |
| 19 | Migi chūdan shuto-uke | Kokutsu-dachi | A confirmar | — | «Segundo shuto-uke, ahora con la mano derecha. Dirección a confirmar.» | A confirmar |
| 20 | Migi chūdan shuto-uke | Kokutsu-dachi | A confirmar | — | «Tercer shuto-uke, de nuevo con la derecha según las fuentes. Dirección a confirmar.» | A confirmar |
| 21 | Hidari chūdan shuto-uke | Kokutsu-dachi | A confirmar | — | «Último shuto-uke, con la izquierda. Luego se vuelve a hachiji-dachi. Dirección a confirmar.» | A confirmar |

Nota de contenido: el patrón de manos izquierda-derecha-derecha-izquierda de los pasos 18–21 coincide en The Martial Way y Bertel, pero rompe la alternancia. En pantalla se dice «según las fuentes», sin comentarios. Pie delantero y grados de 18–21: no se muestran.

Paso final (tras el 21): «La kata termina como empezó: en hachiji-dachi.» (Etiqueta: Según fuentes.) Botón «Ver el dibujo».

### Vista 3. Dibujo final del recorrido
- Se retira el karateka y quedan las huellas: las del paso 1 al 17 se unen en un trazo rojo continuo que se dibuja en 4 s, de principio a fin (con `prefers-reduced-motion`, ya dibujado). Los pasos 18–21 aparecen como un tramo punteado gris con «?» y la etiqueta «A confirmar».
- Título: **«Parecido a una «I».»** Subtítulo: «Avanza, da media vuelta y vuelve, sin salir de una cruz de ejes.»
- Tres datos en tarjetas pequeñas, con etiqueta «Según fuentes»:
  1. «21 movimientos. Empieza y acaba en hachiji-dachi.»
  2. «Dos kiai: movimientos 9 y 17.» (Nota pequeña: «Una página cita solo uno.»)
  3. «Los giros de los pasos 1–17 caen en gedan-barai: 6 en total (1, 3, 6, 10, 12, 14).»
- Aviso destacado: «La forma «I» es aproximada: una sola fuente la describe y ninguna da diagrama. Hay variantes según la escuela.»
- Botones: «Repetir el recorrido» (vuelve al paso 1) y «Ir al quiz».

### Vista 4. Quiz y cierre
Quiz de 3 preguntas (una por pantalla, 3 opciones, respuesta inmediata con explicación; la correcta en rojo). Al final, puntuación «x/3» y «Volver al embusen».

| # | Pregunta | Opciones | Correcta | Explicación (≤25 palabras) |
| --- | --- | --- | --- | --- |
| 1 | ¿Cuántos movimientos tiene Heian Shodan? | a) 15 · b) 21 · c) 27 | b | Cuatro páginas de práctica coinciden: 21 movimientos, de hachiji-dachi a hachiji-dachi. |
| 2 | ¿En qué movimientos se da el kiai? | a) 1 y 21 · b) 9 y 17 · c) Solo en el último | b | Según las fuentes, en el tercer age-uke (9) y en el tercer oi-zuki (17). |
| 3 | ¿Con qué técnica caen los giros de los movimientos 1 a 17? | a) Gedan-barai · b) Age-uke · c) Shuto-uke | a | Cada giro de 1 a 17 cae en un gedan-barai: el barrido bajo. |

Pregunta 3: no extender la afirmación a los giros de 18–21.

Pregunta final para comentarios (texto sobre el karateka 3D en saludo): **«¿Qué dibujo te enseñó tu sensei? Cuéntalo en los comentarios.»**
(Alternativa si el Sensei prefiere: «¿Con cuál de tus katas harías este mismo mapa?»)

Pie: lista de fuentes y aviso: «Secuencia según páginas de práctica; pendiente de contrastar con Best Karate vol. 5 (Nakayama). Variantes según la escuela.»

Fuentes en el pie (las del dosier): The Martial Way (AU), «Heian Sho-dan» · André Bertel, «平安初段» (2022) · karateyon, «heian shodan» · Fisher, «Shotokan Heian Shodan» · Stanford Karate (katas) · Kodansha USA, Best Karate vol. 5 (solo como referencia de consulta).

---

# B. Reel de anuncio (14 s, 1080×1920)
Objetivo: que se abra el interactivo. Una sola idea: «la kata dibuja algo en el suelo». Subtítulos siempre; locución sintética cálida, español de España. Estilo: vista cenital 3D sobre suelo de madera con papel #F4EFE6 en las tarjetas; rojo solo en huellas, flechas y kiai. Texto máx. 7 palabras por tarjeta; mín. 48 px.

## Gancho
Una pregunta con imagen: suelo vacío visto desde arriba y una voz que dice que la kata dibuja algo. A los 3 s ya se ha visto el primer paso con huella roja.

## Escenas
| # | Tiempo | Lo que se ve (animación) | Texto en pantalla | Locución | Nota para el animador |
| --- | --- | --- | --- | --- | --- |
| 1 (gancho) | 0–3 s | Suelo de dōjō visto desde arriba, vacío. El karateka 3D entra en hachiji-dachi al centro. Hace el primer giro y deja la primera huella roja. | «¿Qué dibuja esta kata?» | «¿Sabías que Heian Shodan dibuja algo en el suelo?» | Cámara cenital fija. Golpe de sonido suave en la huella. |
| 2 | 3–6 s | Cámara a cuadro fijo; el karateka recorre los pasos 1–9 en time-lapse rápido. Cada paso suma una huella roja; en el 9, destello rojo «kiai». | «21 movimientos» | «Veintiún movimientos. Y el recorrido tiene su propio nombre: embusen.» | Acelerar sin perder legibilidad. Rótulo «embusen» aparece pequeño abajo. |
| 3 | 6–9 s | Sigue con 10–17; las huellas forman un trazo rojo continuo. Segundo destello de kiai en el 17. | «Dos kiai» | «Visto desde arriba, el trazo se parece a una i.» | El trazo termina en el 17; el final queda punteado con «?» (no mostrar 18–21). Rótulo pequeño: «Parecido a una «I»». |
| 4 | 9–12 s | Un móvil dibujado a cuadro; el dedo toca «Siguiente»; el karateka del móvil avanza una huella a la vez. Botones ‹ › visibles. | «Paso a paso, tú mandas.» | «En el interactivo lo ves paso a paso, con cada técnica y su nombre.» | La maqueta usa la vista 2 real. |
| 5 (cierre) | 12–14 s | Karateka 3D en saludo (rei) junto al trazo rojo; botón dibujado «Enlace en el perfil». | «Enlace en el perfil» | «Está en el enlace del perfil.» | Sin pedir comentarios; la pregunta va al final del interactivo. |

Nota para el Editor: si no se resuelve lo de 18–21 antes de publicar, no mostrar el recorrido completo en el reel; el plano 3 ya lo evita con el tramo punteado.

## Cierre y llamada a comentar
Cierre del reel: llamada a abrir el enlace del perfil (sin pedir comentarios). La pregunta para comentarios está dentro del interactivo («¿Qué dibujo te enseñó tu sensei?»). Si el Sensei quiere comentarios en el reel, plano 5 podría decir «¿Con qué kata lo harías tú?»; decisión del Sensei.

## Datos usados (todos deben estar en el dosier)
Heian Shodan = 21 movimientos; empieza y termina en hachiji-dachi (tabla de datos verificados y 2.ª ronda) · kiai en los movimientos 9 y 17 (media; una página dice solo uno) · embusen «aproximadamente en I» (media-baja, una fuente, sin diagrama) · movimiento a movimiento 1–17: técnica, posición y giros (tabla del dosier, línea JKA/«versión habitual») · rumbos de 1–17: derivados por suma de giros (Fisher; el dosier avisa de que son deducidos) · recuento de gedan-barai (6), oi-zuki (7), age-uke (3), kentsui (1), shuto-uke (4) · 18–21: cuatro shuto-uke chūdan en kokutsu-dachi, sin kiai, patrón de manos izquierda-derecha-derecha-izquierda (The Martial Way, Bertel) · discrepancia del movimiento 4 (zenkutsu frente a renoji-dachi) · aviso de variantes de escuela y de que el dibujo es esquemático · Best Karate vol. 5 como referencia de consulta (Kodansha, ficha de editorial).
No usados a propósito: historia de Itosu/Funakoshi, fechas, Pinan, bunkai, significado literal «mente tranquila».

## Para el Sensei
- Glosas de traducción (barrido bajo, bloqueo ascendente, canto de la mano, posición retrasada, etc.) son vocabulario básico de karate, no datos de fuente; el dosier solo traduce hachiji-dachi. Convendría que Jorge las revise.
- Distancias entre pasos y trazado exacto de la «I»: no están en ninguna fuente. Interactivos las dibuja esquemáticas y el aviso del pie lo dice. La forma final depende del diagrama de Jorge/Best Karate 5.
- Contradicción del dosier: «cada giro cae en un gedan-barai» vale solo para 1–17; el mov. 18 gira en shuto-uke (según una fuente).
- Bloqueo para publicar: contraste de 18–21 por Jorge.
