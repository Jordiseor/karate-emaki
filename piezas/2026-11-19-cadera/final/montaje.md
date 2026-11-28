# Montaje · cadera

- Entrada: escenas3d/plano-01..12.mp4 con corte seco (30,0 s, 30 fps, 1080x1920; 2,5/2,5/2,5/2,0/2,0/2,0/2,5/2,5/3,0/3,0/2,5/3,0 s, como el storyboard). reel.mp4 y reel-sin-voz.mp4: H.264 veryfast, AAC 192 kbps 48 kHz. Vídeo 30,000 s; audio 29,952 s (ffprobe; 48 ms de diferencia por el relleno del códec AAC, el contenedor dura 30,000 s). Sin tocar escenas3d/ ni animacion/.
- Fondo (obra propia, ver licencia): pulso-vivo x0,5 + ambiente x0,2 (30 s) + golpe.wav a 0,15 s (arranque), golpe-caida.wav a 15,0 s (llegada del puño, plano 7) y golpe-cifra.wav a 16,2 s (columnas, plano 8); +6,7 dB, limitador 0,8, fundido 28,5-30 s. Fichero: final/fondo-cadera.wav. reel-sin-voz: -16,7 LUFS.
- Voz: Kokoro em_santa (sid 53), mismo flujo que tigre (herramientas/voz-kokoro.py: cadena y ducking de voz.py), ejecutada desde un guion en el scratchpad para no escribir fuera de final/. Texto = storyboard íntegro, sin datos añadidos ni recortes. Velocidad x1,0 salvo planos 8 y 9 a x1,1 (para que el 8 acabe antes del plano 9). Fondo -7 dB, ducking (fondo -9,1 dB bajo la voz; voz 14,7 dB sobre el fondo). reel.mp4: -16,2 LUFS, pico real -1,3 dBFS.
- Desfases voz/plano (inicio de la voz respecto al inicio del plano): p1 +0,12 s; resto +0,06 s salvo p9 +0,09 s. Fin de cada frase: 2,10 / 4,69 / 7,25 / 8,84 / 10,80 / 12,80 / 15,20 / 18,47 / 20,82 / 24,12 / 26,19 / 28,99 s. Ninguna invade el plano siguiente (la del 8 acaba 0,03 s antes del 9). La voz acaba en 28,99 s. Revisar de oído «Shotokan» y «pelvis».
- Locución: «pelvis» en planos 4 (voz) frente a «Primero la cadera» (tarjeta), como en el storyboard.
- Sin subtítulos quemados: cada plano ya lleva tarjeta (>=48 px, leídas en la hoja y en 3 fotogramas: 0 s, 15 s, 29,9 s). El último fotograma enlaza con el primero (bucle; mismo encuadre y pose).
- Portada: fotograma del plano 1 (1,2 s) con placa papel «LA CADERA NO ES ADORNO» (5 palabras, tinta #1A1A1A sobre #F4EFE6, rojo solo en el filete, 100 px) tapando la tarjeta del plano, y «KARATE EMAKI» (48 px) abajo. hoja.png: 8 fotogramas.
- Observaciones sobre las escenas (no tocadas): plano 3, la letra pequeña roza la etiqueta «tiempo» del eje; plano 7, las etiquetas de la gráfica (tronco/hombro) se solapan algo con la curva. Menores.
- Licencia del fondo: obra propia del estudio, capas sintetizadas de animacion/musica/ (pulso-vivo, ambiente, golpe, golpe-cifra, golpe-caida); sin muestras de terceros. Voz: Kokoro-82M v1.0 (Apache 2.0) + sherpa-onnx 1.12.15 (Apache 2.0).

## v2 (28 nov)
- Vídeo: escenas3d-v2/plano-01..12.mp4, corte seco, 30,0 s, 1080x1920, 30 fps, H.264 veryfast crf 18, yuv420p. Sin subtítulos añadidos (tarjetas en escena).
- Voz: voz-v2/frase-01..12.wav colocadas en los inicios de locucion-v2.txt (adelay). Música: la misma de v1 (final/fondo-cadera.wav, obra propia, sin derechos), fondo -7 dB con ducking (sidechain). Mezcla -16 LUFS aprox., pico real <= -1 dBFS, AAC 192 kbps 48 kHz. Valores exactos en ffprobe/ebur128 al montar.
- Portada: portada.png de v1 reutilizada como portada-v2.png (plano 1 conservado). hoja-v2.png: 8 fotogramas. Revisar de oído «pelvis» y el x1,35 del plano 10.
