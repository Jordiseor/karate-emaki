# Consumo semana 47 (16–20 nov 2026)

Fuente: consumo.csv (72 encargos, 1.494 usos de herramientas, 448,5 min). Cálculo con script; sin cambios en consumo.csv.

## Totales

- **Tokens de la semana: 4.381.577**
- Por modelo: sonnet 4.009.495 (91,5 %, 66 encargos) · opus 220.000 (5,0 %, 3, todos del Sensei) · haiku 152.082 (3,5 %, 3). Sin fable.
- Por día: 16 nov 1.382.039 · 17 nov 686.360 · 18 nov 1.264.344 · 19 nov 734.258 · 20 nov 314.576

## Tokens por pieza

Agrupado por el identificador de pieza (fecha-slug) que aparece en la columna pieza; suma todos sus encargos.

| Pieza | Tokens | % |
| --- | --- | --- |
| 2026-11-18-mano-vacia | 517.060 | 11,8 |
| 2026-11-17-tiempo-contacto | 491.223 | 11,2 |
| 2026-11-18-tigre | 487.299 | 11,1 |
| 2026-11-16-kumite-puntos | 408.549 | 9,3 |
| 2026-11-16-cinturon-judo | 356.242 | 8,1 |
| 2026-11-16-embusen | 345.192 | 7,9 |
| 2026-11-12-hikite | 325.767 | 7,4 |
| 2026-11-12-kiai-gallo | 166.672 | 3,8 |
| 2026-11-17-seiza | 163.002 | 3,7 |
| 2026-11-12-linea-temporal | 139.428 | 3,2 |
| 2026-11-19-cadera | 109.799 | 2,5 |
| otros (sin pieza: reuniones, Sensei, copys, poses compartidas, base 3D) | 871.344 | 19,9 |

Las poses de tiempo de contacto y seiza (172.884) y de judo y kumite (147.300) van en «otros» porque su encargo no lleva slug de pieza.

## Los 3 encargos más caros

1. **modelador-3d · poses y objetos tiempo de contacto + seiza** · sonnet · 172.884 · 40 usos · 11,4 min (18 nov). Cambiar: un único encargo semanal de poses con lista cerrada antes de empezar; mirar primero `animacion/3d/` y reutilizar lo que exista; fotograma de prueba de una sola pose.
2. **modelador-3d · poses judo y kumite** · sonnet · 147.300 · 38 usos · 11,7 min (16 nov). Cambiar: las poses ya dibujadas (hoja `animacion/3d/prueba/poses-2026-11-16b.png`) no se rehacen; partir el encargo en lo que falta de verdad (mawashi-geri-jodan, mae-geri-chudan, pareja aka/ao) y reutilizar lo demás.
3. **animador · 2026-11-17-tiempo-contacto (tramo A)** · sonnet · 111.368 · 42 usos · 6,4 min (18 nov). Cambiar: 42 usos en 6,4 min indican renders de prueba repetidos; un fotograma de prueba por escena antes del clip y un solo reencuadre por plano; revisar en hoja de contactos y no plano a plano.

## Comprobación de la tabla

Esta semana se cumplió `presupuesto.md`: ideas, dosieres, storyboards, animación, modelador y montaje en sonnet; opus solo en el Sensei; marketing en haiku. El coste viene del volumen de usos (sobre todo poses y renders), no del modelo.

## Propuestas para presupuesto.md (no editado; las aplica el Sensei)

| Fila | Cambio propuesto |
| --- | --- |
| Elegir piezas · sensei · opus | Separar: buzón, programación en Metricool y cierre pasan a haiku (Sensei: 220.000 en opus, 5 %; el cierre y la programación no necesitan opus). Opus solo para elegir piezas y revisión final. |
| Poses, escenarios y objetos 3D · modelador-3d · sonnet | Un encargo semanal con lista cerrada de poses; mirar `animacion/3d/` antes; tope orientativo de 30 usos por encargo. |
| Escenas 3D · animador (tramo) · sonnet | Un fotograma de prueba por escena antes del clip; un solo reencuadre por plano; revisión por hoja de contactos. |
| Copys y calendario · marketing · haiku | Sin cambio de modelo. Agrupar copys por semana en un solo encargo (esta semana, 2 encargos y 110.000 tokens). |

No hace falta cambiar ningún modelo de la tabla.

## Notas para el Sensei

- consumo.csv: dos filas tienen comas sin entrecomillar en la columna pieza (16 nov, «reunion de ideas (buzon, eleccion, oficina)» y «produccion (oficina, revision hojas, cierre)»). Entrecomillar esos campos, como se hizo en la semana 46.
- Las poses compartidas (tiempo de contacto y seiza, judo y kumite) no llevan slug de pieza; si se registran con el slug, el reparto por pieza sale exacto.
