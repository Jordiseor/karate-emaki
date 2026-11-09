# Estudio de Karate — instrucciones comunes a todos los agentes

Este repositorio es la "oficina" de un equipo de agentes que lleva **KARATE EMAKI**, una cuenta de reels animados e interactivos sobre karate (base Shotokan). El dueño es Jorge (karateka, estudiante de Física). Jorge no graba nada: todo el contenido es animado.

Antes de hacer cualquier cosa, lee `marca.md` (la biblia de marca). Manda sobre cualquier otra idea que tengas.

## El equipo

| Agente | Fichero | Trabajo |
| --- | --- | --- |
| Sensei | `.claude/agents/sensei.md` | Orquesta, elige ideas, mueve el tablero, pide aprobación a Jorge |
| Ideas: Historia | `.claude/agents/ideas-historia.md` | Historia del Shotokan y del karate, curiosidades |
| Ideas: Técnica | `.claude/agents/ideas-tecnica.md` | Técnica, competición, errores comunes, física del golpe |
| Ideas: Humor | `.claude/agents/ideas-humor.md` | Anécdotas del dōjō, humor y formatos en tendencia |
| Investigador | `.claude/agents/investigador.md` | Verifica datos, cita fuentes, escribe el dosier |
| Guionista | `.claude/agents/guionista.md` | Guion, storyboard, locución y textos en pantalla |
| Animador | `.claude/agents/animador.md` | Anima las escenas del reel |
| Interactivos | `.claude/agents/interactivos.md` | Páginas web interactivas |
| Editor | `.claude/agents/editor.md` | Monta escenas, voz, música, subtítulos, portada |
| Marketing | `.claude/agents/marketing.md` | Copys, hashtags, calendario, métricas |
| Intendente | `.claude/agents/intendente.md` | Ahorro de tokens: modelo por tarea, límites, consumo |

## Dónde vive cada cosa

```
marca.md                 biblia de marca (solo Jorge y el Sensei la cambian)
ideas.md                 banco de ideas: propuestas, elegidas, descartadas
fuentes.md               fuentes verificadas y su fiabilidad
tablero.md               copia local del tablero (la oficina web es la versión viva)
piezas/<id>/             todo lo de una pieza: dosier.md, guion.md, storyboard.md, escenas/, final/
animacion/               biblioteca: personaje, poses, estilos reutilizables
metricas.csv             datos de rendimiento por pieza
presupuesto.md           modelo y límites por tipo de encargo (Intendente)
consumo.csv              tokens y tiempo de cada encargo terminado
programacion.md          tareas programadas: cuándo se ejecutan y qué hacen
archivo/                 ideas y bitácora antiguas
```

Identificador de pieza: `AAAA-MM-DD-slug` (fecha en que el Sensei la elige).

## Estados de una pieza (en este orden)

`idea` → `elegida` → `investigacion` → `storyboard` → `animacion` → `montaje` → `revision` → `aprobacion` (Jorge) → `programada` → `publicada`

Una pieza solo avanza cuando el entregable de su estado existe en `piezas/<id>/`. Si Jorge rechaza, vuelve al estado que indique su comentario.

## Reglas para todos

1. Nadie publica, responde en redes ni gasta dinero. Eso lo hace Jorge.
2. Nada de datos sin fuente: si el Investigador no lo ha verificado, no sale en pantalla.
3. Cada agente escribe solo en los ficheros que le asigna el Sensei. La bitácora, el banco de fuentes y el tablero los escribe solo el Sensei, porque varios agentes trabajan a la vez.
4. Si algo no se puede hacer, se dice en la bitácora y se avisa al Sensei; no se inventa.
5. Todo en español de España. Términos japoneses en rōmaji con traducción la primera vez.

6. Ahorra: lee solo la sección que necesitas, no pegues ficheros enteros en tus respuestas y respeta los límites de `presupuesto.md`.
