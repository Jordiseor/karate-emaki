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
| Poses, escenarios y objetos 3D sobre la base | modelador-3d | sonnet | Reutilizar `animacion/3d/`; fotograma de prueba |
| Escenas 3D | animador (tramo) | sonnet | Render a escala 0,5 (~1,5 s/fotograma); fotograma de prueba antes del clip |
| Voz y mezcla | sonido | sonnet | Sin búsquedas; `herramientas/instalar-voz.sh` al empezar |
| Montaje (2D y 3D) | editor | sonnet | Sin búsquedas; el Sensei no monta, revisa |
| Copys y calendario | marketing | haiku | 3 búsquedas de hashtags |
| Bitácora, tablero, archivo | sensei / intendente | haiku | — |
| Revisión final | sensei | opus | Solo dosier + storyboard + capturas |

Cambios del 13 nov 2026 (cierre semana 46, propuesta del Intendente): opus solo para personaje y rig 3D; poses y decorados en sonnet; el montaje 3D vuelve al Editor (los dos montajes del Sensei costaron 330.000 tokens). Las tareas programadas del Sensei usan el modelo de la tarea; lo mecánico (buzón, calendario) se delega en haiku cuando sea largo.
