# Plan 3D v2 · seiza (14,5 s, 6 planos, bucle)
Scripts: `src/plano-02.html` y `src/plano-06.html` (usan `../escenas3d/src/comun.js`). Render a escala 0,5, 1080x1920, 30 fps.

| Plano | Inicio (s) | Duración (s) | Estado |
| --- | --- | --- | --- |
| 01 | 0,0 | 2,0 | conservado (copia de v1) |
| 02 | 2,0 | 2,0 | rehecho: «Seiza. Minuto 5» (rojo) y cronómetro 5:00 |
| 03 | 4,0 | 2,0 | conservado |
| 04 | 6,0 | 2,0 | conservado |
| 05 | 8,0 | 1,5 | conservado |
| 06 | 9,5 | 5,0 | rehecho (nuevo): seiza serena, ladea la cabeza, tarjetas «¿Te gusta hacer seiza al acabar?» (9,7 s) y «¿Para volver a la calma?» (12,0 s); desde 13,9 s vuelve «Seiza. Minuto 1» + 1:00 |

Bucle: diferencia media fotograma 0 vs último de plano-06 = 1,2/255.
Aviso: la tarjeta 1 del plano 6 se ve más pequeña que las demás (ancho completo), >=48 px.
