# Dosier: Zenkutsu-dachi: por qué la posición larga no te tira

> Base suficiente, con un ajuste: la física (centro de masas dentro de la base) está bien y los ángulos del agente de ideas salen casi iguales con medidas verificadas, **pero solo en la dirección delante-atrás**. Hacia los lados el margen de zenkutsu es mucho menor (≈15–18°). El guion debe decir «hacia delante» o «en la dirección de la posición», no «aguanto más» sin más. Ninguna fuente Shotokan da la longitud en centímetros ni la altura de cadera: las medidas son reglas de dōjō, y así deben presentarse.

## Respuesta corta

Te mantienes en pie mientras la vertical de tu centro de masas (el punto rojo) caiga dentro de la base que forman tus pies. Con los pies juntos esa base es poco más que un pie, y basta inclinarse unos 8° para caer; en zenkutsu-dachi (posición adelantada) la base delante-atrás pasa de un metro y el margen hacia delante sube a unos 26°. Si además bajas la cadera, el punto rojo baja y el margen crece hasta unos 30°: por eso la posición es larga y baja.

## Datos verificados

| Dato | Fuente | Fiabilidad |
| --- | --- | --- |
| Zenkutsu (Shotokan): pierna trasera recta, rodilla delantera doblada sobre el pie, cadera baja, espalda vertical; reparto de peso delante:detrás **6:4** | Nakayama, *Best Karate* vol. 1, p. 30 (ed. 1977), citado textualmente en el compendio de Kidokwan [1]; el reparto 60/40 de Nakayama (1981) lo cita también Loczi [2] | Alta (dos citas independientes del mismo autor; no he podido abrir el libro original) |
| Longitud ≈ **2 anchos de hombros**, ancho ≈ **1 ancho de hombros** (regla habitual de enseñanza) | Loczi [2] (la recoge como descripción de los libros de karate); The Martial Way [4]; Keeling, JKASV [6] | Media (regla de dōjō, no cifra JKA oficial) |
| Variante: ancho ≈ 1 ancho de cadera, largo ≈ 2 anchos de cadera | André Bertel (alumno de Asai, JKA) [5] | Media-baja (blog de instructor) |
| Medido en karatekas: distancia entre talones **89 cm de media** (13 deportistas, DE 10,6; rango 75–100 cm); un campeón de 1,78 m, 103 cm | Gaafar 2015, *J. Applied Sports Science* [8] | Media (muestra pequeña; el artículo tiene una errata interna en otra medida) |
| En la práctica la gente pone **menos** peso delante y posición **más corta** que los libros: 53,8 % / 46,2 % medido | Loczi, «Biomechanics of the Oi-Tsuki in Zenkutsu-Dachi» [2] (4 cinturones negros/marrones) | Media |
| Otros repartos que circulan: 66 %, 70/30, 75–80 %, 80 % delante | [4], [8] (cita a Farouk), [6], [7] | Baja: contradicen a Nakayama; para Shotokan manda el 6:4 |
| Ancho biacromial medio adulto: 41,1 cm hombres, 36,7 cm mujeres (EE. UU., 1988–94) | CDC/NCHS, Vital Health Stat 11(249), tablas 54–55, vía Healthline [10]; abrí el informe [11] pero no pude leer esas tablas | Media-alta |
| Longitud del pie ≈ **15 % de la estatura** (15,3 % hombres, 14,9 % mujeres) | Giles y Vallandigham 1991, *J. Forensic Sci.* 36(4) (resumen secundario) [12] | Media |
| Centro de masas de pie ≈ **55 % de la estatura** (a la altura de S2) | OUHSC, apuntes de biomecánica [13]; medido 54,3 % mujeres y 56,0 % hombres [14]; estudio de 1974 que lo valida como «aproximación muy grosera» [15] | Media-alta como valor redondo |
| Límites de estabilidad reales en bipedestación normal: ≈8° delante, 4,5° atrás | Tsang y Hui-Chan, citados por Interacoustics [16] | Media (sirve de contraste con el 8° del modelo) |

No he encontrado en la web de la JKA ni en fuentes de federación una cifra oficial de longitud, ancho ni altura de cadera. Los libros de Nakayama en archive.org no fueron accesibles desde aquí.

## Cálculo (python3, sin paquetes)

Modelo: persona de 1,70 m → pie 0,26 m, centro de masas (CdM) de pie 0,94 m. Ángulo de vuelco = arctan(distancia horizontal del CdM al borde de la base / altura del CdM).

**Comprobación de las cifras del agente de ideas** (CdM centrado): base 0,30 m, h 0,90 → 9,5°; base 0,90, h 0,90 → 26,6°; base 0,90, h 0,75 → 31,0°. La aritmética es correcta, pero «base 0,90 m» confunde distancia entre talones con base (hay que sumar un pie) y el CdM no está centrado (60/40).

**Con medidas verificadas:**

| Caso | Base delante-atrás | Altura CdM | Hacia delante | Hacia atrás | Lateral |
| --- | --- | --- | --- | --- | --- |
| Pies juntos | 0,26 m (un pie) | 0,90–0,94 m | ≈ 8° | ≈ 8° | ≈ 8° |
| Zenkutsu «alto» (talones a 0,77 m = 2 hombros, 60/40) | 1,02 m | 0,90 m | **≈ 26°** | ≈ 33° | ≈ 15° |
| Mismo zenkutsu, cadera baja | 1,02 m | 0,75 m | **≈ 30°** | ≈ 38° | ≈ 18° |
| Zenkutsu medido (talones 0,89 m, 60/40) | 1,16 m | 0,90 / 0,75 m | 28° / 33° | 37° / 42° | 15° / 18° |

Fuerza horizontal para volcar empujando a la altura del CdM (F/peso = d/h): pies juntos ≈ 0,14 del peso; zenkutsu ≈ 0,5–0,6 del peso, hacia delante. Útil como dato extra: «hace falta unas cuatro veces más empuje».

Cifras finales recomendadas para pantalla (redondeadas, dirección delante-atrás): **≈ 8° pies juntos → ≈ 26° zenkutsu → ≈ 30° bajando la cadera.** Son las del agente de ideas con un grado menos cada una.

## Hipótesis del modelo (decirlas o ponerlas en letra pequeña)

- Estático y 2D (plano sagital, delante-atrás): cuerpo rígido que se inclina como un bloque sobre el borde de la base. Una persona no cae así: dobla tobillos, cadera, da un paso.
- Sin fricción que limite (los pies no resbalan) ni empuje dinámico (golpe, impulso); en un empuje real cuentan la velocidad y la fricción.
- Medidas de un adulto de 1,70 m; CdM al 55 % de la estatura; base = de talón trasero a punta delantera; apoyo de cada pie modelado en su centro para repartir el 60/40.
- «Bajar la cadera» se modela como bajar el CdM de 0,90 a 0,75 m sin cambiar la base (en la realidad alargar y bajar van juntos).

## Lo que NO se puede afirmar

- Que zenkutsu sea más estable «en todas direcciones»: lateralmente el margen es de ≈15–18°, la mitad que delante-atrás. Un empujón de lado es su punto débil.
- Que el margen sea igual delante y detrás: con 60/40 el lado débil es **hacia delante** (≈26°), hacia atrás aguanta más (≈33°).
- Que los ángulos sean los reales de una persona: los límites medidos en bipedestación normal son ≈8° delante y solo 4,5° atrás [16], porque tobillos y músculos no son un bloque rígido.
- Medidas «oficiales JKA» en centímetros o una altura de cadera concreta: no hay. Solo la regla de dos hombros y el 6:4 de Nakayama.
- Que «bajar la cadera» sea siempre mejor: más bajo es más estable estáticamente, pero no hay fuente aquí sobre movilidad o velocidad; Loczi sugiere que hay una longitud óptima y que demasiado larga puede ser más lenta [2].
- Que sea la razón histórica de la forma de la posición (no hay fuente que lo diga; es una explicación física, no la intención de Funakoshi ni de Nakayama).

## Ángulo recomendado

Gancho «Empújame. ¿En qué posición aguanto más?» con la figura de pie y pies juntos: dibujar el punto rojo, su sombra vertical y la base (un pie de largo); se inclina y cae a ~8°. Corte a zenkutsu de perfil: la base se estira a un metro, la figura se inclina hacia delante y aguanta hasta ~26°; luego baja la cadera, el punto rojo baja y llega a ~30°. Cierre honesto y con gancho para comentarios: girar la cámara a vista frontal y mostrar que de lado la base es estrecha (~15°): «¿Por dónde me empujarías tú?». Letra pequeña en pantalla: «Modelo simplificado: cuerpo rígido, adulto de 1,70 m». Usar el 60/40 de Nakayama para colocar el punto rojo algo adelantado. Reparto texto/voz (marca: «los textos resumen; la voz cuenta»): en pantalla solo «8°», «26°», «30°» y la letra pequeña; la locución explica centro de masas, base y por qué baja el punto. Como la cuenta habla de karate en general, puede añadirse una línea de contexto: posiciones adelantadas parecidas existen en otras escuelas (Kidokwan [1] recoge las de Taekwon-Do, Tang Soo Do y Kenpo, más cortas o con otro reparto), sin presentarlas como «peores»; la física vale para todas.

## Fuentes (abiertas)

1. Kidokwan, «Forward stance» (compendio con citas de Nakayama, *Best Karate* vol. 1, p. 30; Choi; Hwang Kee; Parker): https://www.kidokwan.org/wp-content/uploads/2022/09/forward-stance.pdf
2. J. Loczi, «Biomechanics of the Oi-Tsuki in Zenkutsu-Dachi», Cal Poly (ISBS, post-1984): https://ojs.ub.uni-konstanz.de/cpa/article/view/1457/1341
3. Wikipedia, «Front stance» (sin cifras; solo contexto): https://en.wikipedia.org/wiki/Front_stance
4. The Martial Way, «Zenkutsu-dachi (Front stance)»: https://themartialway.com.au/?p=7099
5. A. Bertel, «The three important variations of the Shotokan front stance» (2014): https://andrebertel.blogspot.com/2014/02/the-three-important-variations-of.html
6. J. Keeling, JKASV (2000): https://jkasvtest.blogspot.com/2000/08/
7. i-budo, «Front Stance»: https://i-budo.com/techniques/basics/stances/front-stance/
8. A. M. S. Gaafar, «Standard Rate for Some Basic Stances in Karate», J. Applied Sports Science 5(2), 2015: https://journals.ekb.eg/article_84476_148b0604e311ae46c918c6e3c39433db.pdf
9. Hilo Martial Arts Planet (solo pista, no fuente): https://www.martialartsplanet.com/threads/jka-zenkutsu-dachi-how-to-measure-length.124438/
10. Healthline, «Average shoulder width» (cita CDC sr11_249): https://www.healthline.com/health/average-shoulder-width
11. CDC/NCHS, *Anthropometric Reference Data… 1988–1994*, Vital Health Stat 11(249), 2009: https://www.cdc.gov/nchs/data/series/sr_11/sr11_249.pdf
12. Giles y Vallandigham 1991 (resumen en PDF): https://www.originalwisdom.com/wp-content/uploads/bsk-pdf-manager/2020/12/Giles-and-Vallandigham_-1991_Height-Estimation-from-Foot-and-Shoeprint-Length.pdf
13. OUHSC, «Body segments and masses» (CdM al 55 % de la estatura): https://ouhsc.edu/bserdac/dthompso/web/namics/mass.htm
14. The Physics Factbook, «Center of Mass of a Human» (2006): https://hypertextbook.com/facts/2006/centerofmass.shtml
15. *Ergonomics* (1974), validación del 55 %: https://informahealthcare.com/doi/abs/10.1080/00140137408931400
16. Interacoustics Academy, «Limits of stability» (cita Tsang y Hui-Chan 2003/2004): https://www.interacoustics.com/academy/balance-testing-training/vestibular-rehabilitation/limits-of-stability

Pendiente para `fuentes.md` (no escrito por trabajo en paralelo): todas las anteriores; [1], [2], [8], [11], [13] son las que merece la pena guardar.
