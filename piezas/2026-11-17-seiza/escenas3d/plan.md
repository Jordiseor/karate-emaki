# Plan 3D · seiza (14,0 s, 7 planos, bucle)
Una sola persona de animación. Karateka naranja, escenario dōjō/madera, `comun.js` (tiempo global T; `toma.fijar(T)` = pose + cara).
Planos (inicio, s): 1 (0) seiza 1:00 · 2 (2) minuto 10, gota, temblor · 3 (4) 3/4 azimut 0→35°, 正座 · 4 (6) mokusō, zoom 1→1,12, 黙想 · 5 (8) abre ojos, alivio · 6 (9,5) levantarse + hormigueo, cámara 7→8 · 7 (12,5) señala y vuelve a seiza (13,4–14,0).
Cámara de 1, 2 y 7 idéntica (`CAM_FRONTAL`). Textos arriba (y 330) salvo 6 y 7 (y 1450, abajo, porque de pie la cabeza llega al título). Rojo: «Minuto 10», «Hormigueo», puntos.
Bucle: último fotograma de plano-07 vs primero de plano-01: PSNR 44 dB.
## Faltas / avisos
- El gesto de señalar con la palma hacia abajo se lee poco (brazo casi pegado al cuerpo): mejorable con pose nueva del Modelador.
- Cada plano de arranque en seco: render ≈ 0,5 s/fotograma.
