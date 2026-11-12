# Notas de los planos v2

Todos los planos son re-render de un tramo de la v1: en las 9 escenas el texto va quemado, así que no valía recortar con ffmpeg. Cada `src/plano-NN.html` es copia del src v1 con tiempo desplazado (t + inicio) y el overlay cambiado. Duraciones exactas: 1,6 · 1,6 · 2,2 · 2,4 · 2,0 · 2,8 · 2,8 · 2,4 · 2,6 · 2,4 · 3,4 = 26,2 s.

- 01, 02: escena-01 (0–1,6 y 1,9–3,5 s), tarjeta única «¿Estilo? ¿O casa?» visible desde el fotograma 0 en ambos.
- 03: escena-02 0–2,2 s; el kanji 松濤 a trazos (rojo) se acelera para completarse dentro del plano; sin tarjeta aparte (el kanji es el texto).
- 04: escena-03 0–2,4 s, tarjeta «松濤 = olas de pino».
- 05: escena-04 0–2 s, tarjeta «館 = casa» (el golpe del kanji 館 ya está en la escena).
- 06: escena-05 0–2,8 s, «1939» rojo. 07: escena-06 0–2,8 s; el pergamino «Cuentan que…» de la v1 queda fijo todo el plano (sin tarjeta añadida); el rótulo 松濤館 se escribe en 0,5–2,4 s para acabar dentro del plano.
- 08: escena-07 0–2,4 s, «1945» rojo. 09: escena-08 0–2,6 s, «Solo «karate»», sin carteles aún. 10: escena-08 2,1–4,5 s sin tarjeta; los 5 carteles SHOTOKAN brotan uno tras otro (retemporizados a 2,2 + 0,4·i s; la v1 los sacaba antes).
- 11: escena-09 0–1,6 s sin tarjeta + 1,8 s de karateka en kamae (escena-01 con t=0, mismo encuadre que el plano 1) con «¿Lo sabías?». Unidos con ffmpeg.

Pendiente / límites: el karateka del plano 1 y del cierre mira a cámara con sonrisa (como pide el storyboard; el maestro sí va de espaldas). El cuadro final no es idéntico al 1 en la tarjeta (distinta a propósito). No hay "respiro" en el kamae final: es fijo; si se quiere, añadir un micromovimiento. 1945 conserva el estilo v1 (resplandor rojo; contorno de la casa apenas visible). Los kanji 空手 y 松濤館 del plano 9 y 11 vienen de la v1 y no están como dato en el dosier.
