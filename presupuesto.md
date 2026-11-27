# Presupuesto (lo mantiene el Intendente)

| Encargo | Agente | Modelo | Límites |
| --- | --- | --- | --- |
| Reunión de ideas | ideas-* | sonnet | 8 búsquedas por agente |
| Elegir piezas | sensei | opus | Sin búsquedas |
| Dosier | investigador | sonnet | 12 búsquedas, 10 páginas; mirar antes fuentes.md |
| Storyboard | guionista | sonnet | Sin búsquedas |
| Base de animación nueva | animador (jefe) | opus | Solo la primera vez o con un estilo nuevo; no aplica si la base ya existe en `animacion/` |
| Escenas | animador (tramo) | sonnet | Fotograma de prueba antes del clip |
| Biblioteca 3D: personaje y rig | modelador-3d | opus | Solo si falta en `animacion/3d/` (mirar antes su README) |
| Poses, escenarios y objetos 3D sobre la base | modelador-3d | sonnet | Reutilizar `animacion/3d/`; fotograma de prueba; un encargo con lista cerrada de poses por tanda (no uno por pieza), unos 30 usos de herramientas; no rehacer poses que ya existan; fotograma de prueba por pose nueva antes de la hoja |
| Escenas 3D | animador (tramo) | sonnet | Render a escala 0,5 (~1,5 s/fotograma); fotograma de prueba antes del clip; como mucho un reencuadre por plano; se sube a opus solo si la hoja falla, con el motivo anotado en consumo.csv |
| Voz y mezcla | sonido | sonnet | Sin búsquedas; `herramientas/instalar-voz.sh` al empezar |
| Montaje (2D y 3D) | editor | sonnet | Sin búsquedas; el Sensei no monta, revisa |
| Retoques de montaje | editor | sonnet | Lista cerrada de cambios; una pasada; re-render solo de los planos tocados; tope 30 usos |
| Copys y calendario | marketing | haiku | 3 búsquedas de hashtags; copys agrupados por tanda |
| Informe de tendencias | tendencias | sonnet | 10 búsquedas, 8 páginas; un informe por semana |
| Encargo a ChatGPT | chatgpt (+ OpenAI) | haiku + gpt-5-mini | Encargo cerrado, ≤ 4.000 tokens de salida; apuntar tokens de OpenAI en consumo.csv |
| Bitácora, tablero, archivo | sensei / intendente | haiku | — |
| Revisión final | sensei | opus | Solo dosier + storyboard + capturas |

Cambios del 13 nov 2026 (cierre semana 46, propuesta del Intendente): opus solo para personaje y rig 3D; poses y decorados en sonnet; el montaje 3D vuelve al Editor (los dos montajes del Sensei costaron 330.000 tokens). Las tareas programadas del Sensei usan el modelo de la tarea; lo mecánico (buzón, calendario) se delega en haiku cuando sea largo.

Cambios del 20 nov 2026 (cierre semana 47, propuesta del Intendente; 4,38 M tokens, sonnet 91,5 %): poses 3D por tandas con lista cerrada (los dos encargos de poses costaron 320.000); un solo reencuadre por plano en escenas 3D; copys agrupados. El Sensei usa opus solo para elegir piezas y revisión final; buzón, calendario, Metricool y cierre se delegan en haiku cuando sean largos. Ningún cambio de modelo en la tabla.

Cambios del 27 nov 2026 (cierre semana 48, propuesta del Intendente; 3,48 M tokens, −23 %; opus 15,4 % por 7 producciones del Sensei): el Sensei delega buzón, Metricool, métricas y cierre en haiku de verdad (la regla del 20 nov no se cumplió: 535.000 tokens en opus); fila nueva de retoques de montaje con lista cerrada y tope de 30 usos; escalado a opus en escenas solo tras fallo de la hoja; poses 3D con fotograma de prueba por pose nueva. Ningún cambio de modelo en la tabla.
