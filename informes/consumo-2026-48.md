# Consumo semana 48 (23–27 nov 2026)

Fuente: consumo.csv (59 encargos, 1.144 usos de herramientas, 490,9 min). Cálculo con script (`python3`), sin cambios en consumo.csv.

## Totales

- **Tokens de la semana: 3.479.198**
- Por modelo: sonnet 2.662.318 (76,5 %, 46 encargos) · opus 535.000 (15,4 %, 7, todos del Sensei) · sonnet→opus 173.711 (5,0 %, 3, tramos de cadera del Animador) · haiku 108.169 (3,1 %, 3). Sin fable.
- Por día: 23 nov 1.151.815 · 24 nov 1.029.773 · 25 nov 791.628 · 26 nov 352.364 · 27 nov 153.618.
- Sin pieza (sin slug): 1.009.020 (29,0 %): reuniones de ideas, producción del Sensei, tendencias, copys y poses compartidas.

## Comparación con la semana 47

- Semana 47 recalculada desde consumo.csv: 4.511.306 tokens (74 encargos, 1.531 usos). El informe de la semana 47 decía 4.381.577 porque no contaba dos filas que se apuntaron después (intendente 69.729 y sensei 60.000, cierre del 20 nov).
- Variación: **−1.032.108 tokens (−22,9 %)** sobre la misma base. Frente a la cifra publicada en el informe 47, −902.379 (−20,6 %).
- Por modelo, semana 47: sonnet 88,9 %, opus 6,2 %, haiku 4,9 %. La semana 48 sube opus a 15,4 %: el Sensei tuvo 7 encargos de producción en opus.

## Tokens por pieza

Reparto por slug de la columna pieza; los encargos con dos piezas se reparten a partes iguales.

| Pieza | Tokens | % | Estado al cierre |
| --- | --- | --- | --- |
| 2026-11-23-ascensor | 494.922 | 14,2 | en aprobación (27 nov) |
| 2026-11-23-puntua-o-no | 438.907 | 12,6 | en aprobación (27 nov) |
| 2026-11-23-dojo-1945 | 423.631 | 12,2 | parada en storyboard («No me gusta»; sin decidir) |
| 2026-11-23-notas-movil | 397.666 | 11,4 | aprobada 27 nov; programada sáb 12 dic |
| 2026-11-19-cadera | 364.996 | 10,5 | aprobada 25 nov; programada sáb 5 dic |
| 2026-11-16-kumite-puntos | 163.804 | 4,7 | v2 publicada 24 nov (v1 borrada) |
| 2026-11-27-podio-olimpico | 58.964 | 1,7 | investigación |
| 2026-11-18-tigre y 2026-11-18-mano-vacia | 63.644 cada una | 1,8 cada una | retoques del 23 nov; aprobadas 25 nov |

Las cinco piezas del 23 nov y la cadera suman 2.120.122 tokens (60,9 %). Estados de la semana: 2 aprobadas (cadera, notas del móvil); 2 publicadas (kumite v2 el 24 y tiempo de contacto el 25, este último borrado el 26 por Jorge).

## Los 3 encargos más caros

1. **modelador-3d · tanda poses ascensor + puntúa o no** · sonnet · 131.556 · 30 usos · 7,6 min (24 nov). Cambiar: las poses que ya estén en `animacion/3d/` no se rehacen; un fotograma de prueba por pose nueva antes de la hoja completa; y una sola hoja de revisión en lugar de varias (hay hojas `*-2026-11-24.png` sueltas).
2. **editor · 2026-11-18-tigre + 2026-11-18-mano-vacia (retoques)** · sonnet · 127.288 · 60 usos · 12,4 min (23 nov). Cambiar: los retoques son una lista cerrada (ya está en la bitácora del 23 nov: cartela del plano 7, placa de 56 px, separación de siluetas en 2 y 10, música rehecha). Hacerlos en una sola pasada, re-renderizar solo los planos tocados y no reprocesar el audio ya aprobado. Con el tope de 30 usos de la tabla de poses, habría sido la mitad de usos.
3. **modelador-3d · kumite v2 (patadas)** · sonnet · 104.313 · 30 usos · 7,5 min (24 nov). Cambiar: el coste viene de rehacer la v1 que Jorge borró (23 nov). Antes de rehacer una patada, el Sensei valida la pose en un fotograma de prueba; así no se hace una tanda entera que luego se descarta.

Coste extra a vigilar: los tres tramos de cadera del Animador se escalaron de sonnet a opus (173.711 tokens, 3 encargos). Están fuera de la regla «se sube solo si la entrega vuelve con fallos» salvo que el fallo quede anotado. Cambiar: anotar el motivo del escalado y probar primero un reencuadre en sonnet.

## Comprobación de la tabla

Esta semana se cumplió `presupuesto.md` en sonnet para ideas, dosieres, storyboards, animación, modelador y montaje; marketing y tendencias en haiku y sonnet respectivamente. Lo que se salió de la tabla es opus del Sensei para trabajo de producción diaria (535.000) y los escalados sonnet→opus de la cadera (173.711). Juntos son el 20,4 % del total.

## Propuestas para presupuesto.md (no editado; las aplica el Sensei)

| Fila | Cambio propuesto |
| --- | --- |
| Elegir piezas · sensei · opus | Dividir. Opus solo para elegir piezas y revisión final. Buzón, Metricool, métricas, hojas de rutina y cierre pasan a haiku (esta semana, 535.000 en opus; semana 47, 280.000). La propuesta del 20 nov sigue sin aplicar. |
| Escenas (animador, tramo) · sonnet | Añadir: el escalado a opus solo tras un fallo de la hoja, con el motivo anotado en consumo.csv (cadera: 173.711 en 3 encargos). Primero reencuadre en sonnet. |
| Montaje (editor) · sonnet | Añadir: retoques con lista cerrada de cambios, tope de 30 usos y re-render solo de los planos tocados (tigre y mano vacía: 127.288 y 60 usos). |
| Poses 3D · modelador-3d · sonnet | Sin cambio de modelo. Ya tiene tope de 30 usos; añadir fotograma de prueba por pose nueva antes de la hoja (tanda ascensor + puntúa o no: 131.556; kumite v2: 104.313). |

No hace falta cambiar ningún modelo de la tabla.

## Notas para el Sensei

- consumo.csv: 187 filas válidas, ninguna malformada. Las filas de la semana 47 del 20 nov (intendente y sensei del cierre) se apuntaron después del informe 47; si se corrige el informe, la cifra válida es 4.511.306.
- Falta apuntar el cierre de esta semana (intendente, 27 nov) cuando termine.
- El coste sin pieza (29 %) crece porque las poses compartidas y las reuniones no llevan slug. Si se apuntan con el slug de la pieza, el reparto por pieza sale exacto.
