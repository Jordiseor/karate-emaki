# Consumo semana 46 (9–13 nov 2026)

Fuente: consumo.csv (52 encargos, 1.288 usos de herramientas, 561,6 min). Cálculo con script; sin cambios en consumo.csv.

## Totales

- **Tokens de la semana: 4.295.896**
- Por modelo: sonnet 1.967.654 (45,8 %, 32 encargos) · opus 1.818.940 (42,3 %, 15) · fable 390.000 (9,1 %, 3) · haiku 119.302 (2,8 %, 2)
- Por día: 9 nov 1.596.835 · 10 nov 1.416.967 · 11 nov 887.935 · 12 nov 214.100 · 13 nov 180.059

## Tokens por pieza

| Pieza | Tokens | % | Estado |
| --- | --- | --- | --- |
| nombre-shotokan | 1.252.872 | 29,2 | montaje v2, espera voz |
| zenkutsu-estabilidad | 1.218.964 | 28,4 | montaje v2, espera voz |
| presentacion | 619.973 | 14,4 | única terminada (9 encargos) |
| hikite | 84.603 | 2,0 | storyboard |
| linea-temporal | 80.274 | 1,9 | storyboard |
| kiai-gallo | 43.447 | 1,0 | storyboard |
| otros (ideas, voces, perfil, Sensei sin pieza, base 3D) | 995.763 | 23,2 | — |

## Los 3 encargos más caros

1. **modelador-3d · base 3D (dos encargos)** · opus · 340.000 · 110 usos · 35 min. Cambiar: personaje y rig con opus; poses y escenarios con sonnet; revisar `animacion/3d/` antes de construir.
2. **modelador-3d · nombre-shotokan (assets historia 3D)** · opus · 242.064 · 55 usos · 31,8 min. Cambiar: reutilizar la base del punto 1; assets nuevos con sonnet.
3. **modelador-3d · presentación (rollo, logo 3D, kiai)** · opus · 198.622 · 88 usos · 24 min. Cambiar: rollo 2D y kiai con sonnet; logo 3D sobre la base existente.

Cuarto: animador · nombre-shotokan (opus, 196.023). La v2 con sonnet costó 52.021 por 11 planos.

## Propuestas para presupuesto.md (las aplica el Sensei o el Intendente tras aprobación)

| Fila actual o nueva | Cambio propuesto |
| --- | --- |
| Biblioteca 3D (personaje, poses, escenario) · modelador-3d · opus | Dividir: **personaje y rig** → opus, solo si falta; `animacion/3d/` se revisa antes |
| (nueva) Poses, escenarios y assets · modelador-3d · sonnet · Opus no; el kit de perfil costó 67.580 con sonnet | Añadir fila |
| (nueva) Montaje de reel 3D · editor · sonnet · El Sensei no monta; sus dos montajes 3D (fable) sumaron 330.000 | Añadir fila |
| (nueva) Buzón, calendario y programación en Metricool · sensei · haiku · Escalar a opus solo si hay una decisión | Añadir fila (ahora 60.000 en opus) |
| Base de animación nueva · animador (jefe) · opus | Añadir: «no aplica si la base ya existe en `animacion/`» |

## Notas para el Sensei (sin cambio de tabla)

- La tabla no se cumplió en la semana del 9 nov: ideas en opus (265.000 en 3 encargos, tabla: sonnet), storyboards de nombre-shotokan y zenkutsu en opus (88.841 y 91.356, tabla: sonnet) y dosieres de zenkutsu y nombre-shotokan en opus (128.359 y 108.905, tabla: sonnet). Aplicar la tabla antes que cambiarla.
- **fable** aparece en 3 encargos del Sensei (390.000, 9,1 %) y no está en presupuesto.md. Confirmar si es el modelo real usado o un error de registro. No decido yo.
- consumo.csv: 3 nombres de pieza llevan comas («presentacion (rollo, logo 3D, kiai)», «presentacion (voz, sfx, musica)», «nombre-shotokan 3D: adaptación, revisión y montaje») y rompen el CSV. Entrecomillar esos campos. Además, «zenkutsu 3D» no lleva el slug de la pieza y se cuenta mal si no se normaliza.

## Aplicado por el Sensei (13 nov)

- presupuesto.md: filas 1, 2, 3 y 5 aplicadas. La 4 (buzón y Metricool en haiku) queda como nota: el modelo de las tareas programadas lo fija la tarea, no el Sensei.
- consumo.csv: los 3 campos con comas, entrecomillados.
