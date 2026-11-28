# Montaje · Seiza, minuto 1 contra minuto 10

- Entrada: escenas3d/plano-01..07.mp4 concatenados con corte seco (14,0 s, 30 fps, 1080x1920, H.264 veryfast). Textos ya quemados en los planos; no se añaden subtítulos (coinciden con las tarjetas). Bucle: último fotograma = fotograma 0 (PSNR 44 dB según plan.md).
- Sonido (sintético con numpy, sin derechos, sin música): tic-tac suave 0,5-3,5 s, ding de reloj a 2,0 s, dos respiraciones graves 6,1-8,0 s, exhalación a 8,1 s, zumbido eléctrico que se apaga 9,7-12,4 s, pop de levantarse a 12,5 s, ambiente casi inaudible. Fundido de 0,15 s en ambos extremos: sin salto al repetir. Script no guardado en la pieza. reel-sin-voz.mp4: -20,1 LUFS.
- Voz Kokoro em_santa (sid 53) con grafías «Séisa», «Mokusó», «yamé»; velocidades por frase 1,0/1,0/1,4/1,15/1,0/1,2/1,2 (máx. 1,4). Entradas en 0,12 / 2,06 / 4,06 / 6,06 / 8,06 / 9,66 / 12,66 s; acaba a 13,84 s. reel.mp4: -16,1 LUFS, pico real -1,4 dBFS, 14,0 s. Textos en final/locucion.txt.
- Portada: fotograma de 2,2 s (minuto 10, gota) con placa papel «SEIZA: / MINUTO 10» (3 palabras, 10 en rojo). hoja.png: fotogramas 3 / 75 / 150 / 230 / 300 / 419.
- Pendiente: oído de Jorge sobre las grafías (no se pueden escuchar aquí); el gesto de señalar del plano 7 se lee poco (aviso de plan.md).

## v2 (28 nov)

- Vídeo: escenas3d-v2/plano-01..06.mp4 con corte seco (14,5 s, 1080x1920, 30 fps, H.264 veryfast CRF 18, yuv420p, faststart). Textos ya quemados; sin subtítulos añadidos. Bucle: ver plan.md (1,2/255).
- Sonido (sintético con numpy, sin derechos, sin música; script en el scratchpad, no guardado): tic-tac 0,5-5,5 s, ding a 2,0 s, dos respiraciones graves 6,1-8,05 s, exhalación a 8,1 s, pop a 9,5 s, ruido ambiente muy bajo, tic-tac que vuelve a 13,9 s; fundido 0,15 s. Voz Kokoro em_santa: voz-v2/frase-01..06.wav en 0,12/2,06/4,06/6,06/8,06/9,70 s (locucion-v2.txt); fondo con ducking (~-7 dB bajo la voz).
- reel-v2.mp4: H.264 + AAC 48 kHz, 14,5 s, -16,0 LUFS, pico real -1,5 dBFS. Revisar de oído las grafías «Séisa», «Mokusó», «yamé».
- Portada: portada-v2.png, fotograma de 3,1 s (minuto 5, gota) con placa papel «SEIZA: / MINUTO 5» (3 palabras, 5 en rojo). hoja-v2.png: 6 fotogramas (1 por plano).
