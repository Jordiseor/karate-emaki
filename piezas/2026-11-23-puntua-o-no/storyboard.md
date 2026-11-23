# Storyboard: ¿Eres juez de kumite? ¿Puntúa o no? (interactivo + anuncio)
Duración total: anuncio 14 s · Pilar: Competición · Formato: 1080×1920 (anuncio) y página móvil 390×844 (interactivo) · Guionista, 2026-11-23
Entregable doble: (A) quiz interactivo para Interactivos; (B) reel de anuncio de 14 s para Animador/Editor.

## Condiciones de publicación (del dosier)
- **PENDIENTE DE COTEJO:** situaciones 5 y 7 (art. 8.11 a y 8.11 f, letras sin cotejar en el PDF WKF 2026). Mientras no se coteje, la etiqueta de artículo de esas dos dice solo «Art. 8.11», sin letra. Si no se pueden cotejar, se activan las sustitutas S1 y S2 (más abajo).
- Reglamento WKF 2026, **adultos**. Aviso fijo en pie: «Adultos, reglamento WKF 2026. Animación controlada, sin contacto real.»
- Situación 3: «5 cm» es máximo de adultos (cadete y sub-14: 10 cm; no se muestra).
- Situación 7: caso claro (rival tambaleándose). Sanción: solo «y puede haber sanción», sin cantidad (5 y 7).
- Situación 8: solo «en la garganta no hay punto»; nada de sanción ni de roce de guante.
- Situación 9: puñetazo, nunca patada al caído.
- No decir «zanshin» (no es término oficial): «conciencia del rival».
- Texto ≥ 18 px en móvil; botones ≥ 48 px. Rojo #C8102E solo para respuesta correcta, golpe, cifras y datos clave; nunca solo color (icono ✓ / ✗ + texto).

## Estilo
Papel #F4EFE6, tinta #1A1A1A, rojo #C8102E. Karateka 3D de `animacion/3d/` en tatami con dōjō cálido: aka (`CINTURON_AKA`) y ao (`CINTURON_AO`), sin casco, `kumite3d.js` (`crearPareja`, `crearAreaWKF`). Cada situación: imagen fija (WebP, 780×900 px, se muestra a 390×450, ≤ 150 KB) o clip opcional de 1,5–2 s en bucle (mudo, ≤ 400 KB; con `prefers-reduced-motion`, solo la fija). Golpes y patadas frenados a distancia; rastro rojo marca la técnica. Sin burlas a árbitros ni a ningún estilo.

---

# A. Interactivo (5 vistas, móvil primero a 390 px)

## Vista 1. Portada
- Imagen: aka y ao en kamae sobre el tatami, 3/4. Marcador 2D «0 – 0».
- Título (grande, tinta): **«¿Eres juez de kumite?»** con «juez» en rojo. Subtítulo: «10 situaciones. ¿Puntúa o no?»
- Botón «Empezar» (≥ 48 px, ancho completo). Pie pequeño: «Adultos, reglamento WKF 2026.»
- Entrada: el marcador aparece con una pulsación de 0,6 s; reduced-motion: imagen fija.

## Vista 2. Situación (se repite 10 veces)
Maquetación (390×844):
1. Arriba (56 px): «Situación n / 10» + barra de progreso fina.
2. Imagen de la situación (358×450); «Aka» en rojo y «Ao» en azul como rótulos de esquina.
3. Texto de la situación (18–20 px, ≤ 14 palabras).
4. Pregunta fija: **«¿Puntúa o no?»**
5. Dos botones apilados, 56 px: **«Sí, puntúa»** y **«No puntúa»**.
6. Si responde «Sí» en una situación con puntos (juego 1–5): paso «¿Cuántos?» con tres botones **1 · 2 · 3** (≥ 48 px). Acierto = decisión y cifra correctas.
- Teclado: Tab, Enter, foco visible; `aria-live` anuncia el resultado.

## Vista 3. Respuesta (en el mismo sitio, sustituye a los botones)
- Franja: **✓ Correcto** o **✗ No era así**, y el veredicto en grande: «1 punto (yūko)», «2 puntos (waza-ari)», «3 puntos (ippon)» o «0 puntos».
- La imagen añade el efecto: marcador sube / cruz roja que tacha / halo de zona.
- Explicación (1–2 frases) y chip con el artículo: «Art. 8.6».
- Botón «Siguiente ›» (en la última: «Ver mi resultado»).
- Rōmaji con traducción la primera vez (yūko = 1 punto, waza-ari = 2, ippon = 3, yame = «parar»).

## Vista 4. Resultado final
- «x / 10» grande en rojo. Título según aciertos: 0–3 «Espectador de grada» · 4–6 «Juez en prácticas» · 7–9 «Juez de kumite» · 10 «Juez de kumite sin dudas». (Títulos de juego, no cargos oficiales.)
- Imagen: aka y ao en saludo (rei).
- Lista corta de las falladas (tocar una reabre su explicación).
- Botones: **«Compartir»**, «Repetir» y «Volver al inicio».

## Vista 5. Compartir y cierre
- **Compartir:** Web Share API; si no existe, copia el enlace con aviso «Copiado». Texto: «He sacado x/10 como juez de kumite. ¿Puntúa o no? ¿Aciertas más que yo? [enlace]». Tarjeta opcional con «x/10» y el título.
- Pregunta para comentarios sobre el karateka en rei: **«¿Qué situación te ha costado más? Cuéntalo en los comentarios.»**
- Pie: «Fuente: WKF Kumite Competition Rules 2026.01. Los árbitros deciden en el tatami.»

---

## Las 10 situaciones
Orden de juego, de fácil a difícil: escalera de puntos (1–3), trampas (6, 9) y anulaciones (4, 5, 7, 8, 10). «n.º» = número de la tabla del dosier. Texto ≤ 14 palabras.

| Juego | n.º | Escena (3D, fija o clip) | Texto de la situación | Respuesta | Explicación y artículo |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | Aka en zenkutsu con gyaku-zuki al abdomen de ao (kamae). Puño frenado, rastro rojo. | «Aka mete un gyaku-zuki limpio al abdomen.» | Sí · **1** | «Un puñetazo a zona válida vale 1 punto: yūko.» · Art. 8.6 |
| 2 | 2 | Ao con mawashi-geri al abdomen de aka, frenado. | «Ao clava un mawashi-geri al abdomen, controlado.» | Sí · **2** | «Toda patada al cuerpo (chūdan) vale 2 puntos: waza-ari.» · Art. 8.6 |
| 3 | 3 | Aka con mawashi-geri jōdan, pie parado junto a la cabeza de ao. Regla roja «5 cm». | «Aka patea a la cabeza y se detiene a 5 cm.» | Sí · **3** | «Una patada a la cabeza vale 3 puntos: ippon. En adultos se admite hasta 5 cm o un roce ligero.» · Arts. 8.6 y 8.8 |
| 4 | 6 | Ao entra con puño; detrás, cronómetro 2D en «0:00». | «Ao entra con un puñetazo válido justo al sonar el final.» | Sí · **1** | «Una técnica válida lanzada al agotarse el tiempo cuenta.» · Art. 8.10 |
| 5 | 9 | Ao de espaldas sobre el tatami tras el barrido; aka de pie remata con puño controlado. | «Aka barre a ao, que cae de espaldas, y remata con un puñetazo controlado.» | Sí · **3** | «Una técnica legal contra un rival con otra parte del cuerpo que no sean los pies en el suelo vale 3 puntos.» · Art. 8.6 |
| 6 | 4 | Ao conecta el puño a aka y gira de golpe dándole la espalda. (**Gancho del anuncio.**) | «Ao conecta un puñetazo perfecto y se da la vuelta.» | No · **0** | «Dar la espalda tras la técnica la anula: falta conciencia del rival.» · Art. 8.11 e |
| 7 | 5 | **PENDIENTE DE COTEJO.** Aka golpea limpio; rótulo 2D «YAME»; ao con las manos bajadas. | «Aka golpea limpio justo después del «yame» (parar).» | No · **0** | «Lo hecho tras yame no cuenta, y puede haber sanción.» · Art. 8.11 (sin letra hasta cotejar) |
| 8 | 7 | **PENDIENTE DE COTEJO.** Aka puño a la cabeza; ao se tambalea hacia atrás. | «Aka golpea a la cabeza y ao se tambalea por el contacto.» | No · **0** | «En la cabeza el contacto debe ser ligero (≤ 2 cm con la mano, o roce). Un contacto excesivo anula y puede sancionarse.» · Arts. 8.8 y 8.11 (sin letra hasta cotejar) |
| 9 | 8 | Ao lanza un puño al rostro de aka; el rastro rojo acaba en la garganta (halo rojo en el cuello). | «Ao lanza un puñetazo a la cara y toca la garganta.» | No · **0** | «En la garganta no se admite ningún contacto, ni el roce.» · Art. 8.8 |
| 10 | 10 | Ao toca con el puño la unión brazo-hombro de aka; halo tenue en el hombro. | «Ao toca con el puño la unión del brazo y el hombro de aka.» | No · **0** | «La unión brazo-hombro no es zona válida: el chūdan llega hasta la clavícula incluida.» · Art. 8.4 |

Reparto: 5 «sí» (juego 1–5) y 5 «no» (6–10). Las dos pendientes quedan en las posiciones 7 y 8.

### Sustitutas si 5 o 7 no se confirman (del dosier, fiabilidad Alta)
| Sustituta | Sustituye a | Escena | Texto | Respuesta | Explicación y artículo |
| --- | --- | --- | --- | --- | --- |
| **S1** | 5 o 7 | Aka con puño a la cara de ao, frenado a ≈ 2 cm; regla «2 cm». | «Aka lanza un puñetazo a la cara y para a 2 cm.» | Sí · **1** | «En la cabeza se admite hasta 2 cm con la mano, o un roce ligero. Puñetazo a zona válida: 1 punto.» · Arts. 8.6 y 8.8 |
| **S2** | 5 o 7 | Marcador 1–1, dos puños a la vez; reloj parado; bandera senshu tachada. Botones «Aka · Ao · Nadie». | «Aka y ao puntúan a la vez, antes de la señal. ¿Quién tiene senshu (primera ventaja)?» | **Nadie** | «Si los dos puntúan antes de la señal, el senshu no es para nadie.» · Art. 12.2.2 |
- Si caen las dos, S1 y S2 entran en su lugar: el reparto pasa a 6 «sí» y 4 «no» (S2 es una pregunta distinta; el Sensei decide si lo acepta o prefiere sustituir solo una).
- S1 es la más barata (mismo rig que el juego 9). S2 es solo 2D sobre poses que ya existen.

---

# B. Reel de anuncio (14 s, 1080×1920)
Objetivo: que se abra el interactivo. Una idea: «tú eres el juez». Subtítulos siempre; locución sintética cálida, español de España, voz de sempai. Cambio de plano cada 2–3 s. Texto ≤ 7 palabras, ≥ 48 px. Solo situaciones **no pendientes** (4, 3, 8, 10).

## Gancho
Segundo 0 sin título: el puñetazo de ao ya toca (controlado) y aka lo encaja. Pregunta en tarjeta: «¿Punto?». Al segundo 3 ya se ha visto el giro de espaldas.

## Escenas
| # | Tiempo | Lo que se ve (animación 3D) | Texto en pantalla | Locución | Nota para el animador |
| --- | --- | --- | --- | --- | --- |
| 1 (gancho) | 0–3 s | Cámara 3/4 en el tatami. Fotograma 0: puño de ao en pleno contacto controlado con aka. Rastro rojo. Marcador 2D sube a «1». | «¿Punto?» | «Puñetazo perfecto. ¿Punto?» | Fotograma 0 = golpe en marcha. Situación 4 del dosier. |
| 2 | 3–6 s | Ao gira y queda de espaldas a aka. El marcador baja a «0» y una cruz roja lo tacha. | «Espalda al rival: cero» | «Pues no. Dar la espalda lo anula.» | Pose de espalda tras puño (ver «Faltan»). |
| 3 | 6–9 s | Tres imágenes fijas en tarjetas de papel «¿Puntúa o no?»: patada a la cabeza a 5 cm, puño a la garganta, puño a la unión brazo-hombro. 1 s cada una, corte seco. | «10 situaciones. Tú eres el juez.» | «Diez situaciones de kumite. Tú eres el juez.» | Situaciones 3, 8 y 10 del dosier. Sin respuestas en pantalla. |
| 4 | 9–12 s | Móvil dibujado a cuadro; un dedo toca «No puntúa»; sale ✗ y «Art. 8.11». | «Sí o no. ¿Cuántas aciertas?» | «Sí o no. ¿Cuántas aciertas?» | Maqueta con la vista 3 real. Solo «8.11 e», que es la verificada; no mostrar la letra pendiente. |
| 5 (cierre) | 12–14 s | Aka y ao se saludan (rei); botón de papel dibujado. | «Enlace en el perfil» | «Lo tienes en el enlace del perfil.» | Sin pedir comentarios; la pregunta va al final del interactivo. |

## Cierre y llamada a comentar
Reel: «Enlace en el perfil», sin pedir comentarios. Pregunta para comentarios en la vista 5 del interactivo: «¿Qué situación te ha costado más?». Idea de primer comentario para Marketing: «¿Cuántas has acertado? Sin trampas.»

## Datos usados (todos deben estar en el dosier)
- Yūko 1, waza-ari 2, ippon 3 e ippon con rival caído (art. 8.6) · zonas: chūdan hasta la clavícula incluida, unión brazo-hombro fuera (art. 8.4) · jōdan adultos: 5 cm patada, 2 cm mano, roce permitido, nada en la garganta (art. 8.8) · técnica válida al agotarse el tiempo (art. 8.10) · invalidez tras yame, con espalda al rival, por contacto excesivo (art. 8.11; letras a y f por cotejar, e verificada) · ambos puntúan antes de la señal: sin senshu (art. 12.2.2, solo S2) · «y puede haber sanción» sin cantidad (WKF Kumite Questions, media).
- Las 10 situaciones y sus respuestas, de la tabla del dosier. S1 y S2 derivadas de 8.6, 8.8 y 12.2.2 del dosier.
- **No usados** (dosier, «Lo que NO se puede afirmar»): cadete y sub-14, simultáneas, wakarete, combinaciones, roce en la garganta, cantidad de sanciones.
- Títulos de resultado y texto de compartir: invención de juego, no datos.

## Faltan en animacion/3d/ (lista cerrada)
Comprobado en `animacion/3d/README.md` y en los JSON de `poses/` que abrí (mawashi-geri-jodan, gyaku-zuki-kiai, kumite-esquiva, mae-geri-chudan, espalda-tras-patada). No pude listar el directorio `poses/`: lo que no aparece en el README lo doy por inexistente.
Sí hay: `kamae`, `gyaku-zuki-kiai`, `mawashi-geri-jodan` (+prep), `mae-geri-chudan` (+prep), `kumite-esquiva`, `espalda-tras-patada`, `rei`, `neutra`, `crearPareja`, `crearAreaWKF`, `Diagrama3D.flecha`, `overlay`, `tambalear`, `k.inclinar`.
1. `mawashi-geri-chudan` (+ prep): patada circular al abdomen (juego 2). Alternativa: `mae-geri-chudan` con el texto «patada al abdomen», con permiso del Sensei.
2. `gyaku-zuki-jodan`: puño derecho a la cara desde kamae, frenado (juego 8 y 9, y S1). El de la garganta se resuelve apuntando con `alinear`.
3. `par.alinear` ampliado con `'gyaku-zuki-chudan'`, `'gyaku-zuki-jodan'`, `'garganta'` y `'union-brazo-hombro'` (hoy solo valen las dos patadas), con ao como atacante (rumbo 180) para los juegos 4, 6, 9 y 10.
4. `espalda-tras-puño`: giro de espaldas desde `gyaku-zuki-kiai` (hoy `espalda-tras-patada` parte de las piernas de la patada). Juego 6 y plano 2 del anuncio.
5. `barrido` (ashi-barai), `caido-de-espaldas` (ao tendido en el tatami, `suelo: false` con altura) y `puño-remate-bajo` (aka de pie, puño controlado a un caído): juego 5.
6. Encuadre 4:5 de la pareja para web (780×900): la plantilla es 1080×1920; hace falta una plantilla o preset de cámara (`orbita`, `distancia ≈ 10,5`, `azimut ±75…90`).
7. Overlays 2D (no son poses; los hace Animador o Interactivos con `overlay2d.js`): marcador con cruz, regla «5 cm / 2 cm», cronómetro 0:00, rótulo «YAME», halos de cuello y hombro, bandera senshu tachada (S2).
No hace falta: figura de árbitro (el «YAME» va en rótulo), tambaleo de ao (`tambalear` + `k.inclinar`), protecciones ni casco.

## Para el Sensei
- Antes de publicar: cotejar 8.11 a y 8.11 f en el PDF 2026, o activar S1/S2.
- Decidir si se acepta `mae-geri-chudan` en lugar del mawashi al abdomen y el reparto 6/4 si caen las dos pendientes.
