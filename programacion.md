# Tareas programadas

Cada tarea arranca una sesión nueva sin memoria. Por eso todas empiezan igual: traer el repositorio, leer `CLAUDE.md` y actuar como el Sensei. La oficina es https://claude.ai/artifact/Suoti4gdUKvBW1F9vyaW1s y se actualiza con la herramienta de datos del artefacto (colecciones `equipo`, `piezas`, `buzon` y el documento `bitacora/registro`).

| Tarea | Cuándo (hora de Madrid) | Qué hace |
| --- | --- | --- |
| Reunión de ideas | Lunes 8:45 | Lee el buzón, lanza los 3 agentes de ideas a la vez y elige las piezas de la semana según `marca.md` |
| Producción | Lunes a viernes 10:15 | Avanza cada pieza un estado, repartiendo el trabajo largo entre varios agentes |
| Cierre de semana | Viernes 17:45 | Resumen para Jorge, el Intendente archiva y escribe el informe de consumo |
| Informe de métricas | Día 1 de cada mes 9:10 | Marketing analiza `metricas.csv` y deja recomendaciones para la reunión de ideas |

## Inicio común de todas las tareas

1. Clona el repositorio del estudio y entra en él.
2. Lee `CLAUDE.md`, `marca.md`, `.claude/agents/sensei.md` y `presupuesto.md`.
3. Lee el buzón de la oficina: mensajes con `estado: pendiente`. Atiende los que puedas en esta tarea y contesta en su campo `respuesta`, poniendo `estado: respondido`.
4. Mira en la oficina las piezas en `aprobacion` con `decision` puesta por Jorge: si `aprobada`, pásala a `programada` y lanza a Marketing; si `cambios`, devuélvela al estado que pida su comentario.

## Cierre común

1. Pon a cada agente en la oficina como `trabajando` mientras trabaja y como `en espera` al terminar, con su última tarea.
2. Añade a `bitacora.md` y a `bitacora/registro` lo que ha pasado (en la oficina, solo las últimas 20 entradas).
3. Apunta cada encargo en `consumo.csv`.
4. Commit y push al repositorio. Nunca publiques en redes ni respondas comentarios.
