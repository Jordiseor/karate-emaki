# Montaje · El error del ascensor

- Entrada: escenas3d/plano-01..11 (12 clips con 04a/04b), corte seco, 30 fps, 1080x1920, 33,400 s (ffprobe). Bucle 11 -> 1 directo. H.264 veryfast crf 18, AAC 192 kbps 48 kHz. Sin tocar escenas3d/.
- Fondo propio sintetizado (final/fondo-ascensor.wav, script en scratchpad): pad en Sol m / Mi b / Si b / Fa y nota grave al inicio de cada acorde, sin percusión, fundido de salida 2 s. reel-sin-voz: -15,1 LUFS. Licencia: obra propia, sin muestras de terceros.
- Voz: Kokoro em_santa (sid 53) con herramientas/voz-kokoro.py (funciones importadas desde un driver del scratchpad; wav fuera del repo). Texto = storyboard íntegro, «34 julios» como modelo simplificado. Velocidades: 1,1 p1; 1,15 p5; 1,2 p6; 1,0 resto. Fondo -7 dB con ducking (-9,7 dB; voz 14,9 dB sobre él). reel.mp4: -16,1 LUFS, pico real -1,3 dBFS.
- Desfases: voz +0,06 s (p1 +0,12). Fin de voz 32,30 s; ninguna frase invade el plano siguiente (más ajustada: p5 acaba 11,44 de 11,80; p6 13,68 de 13,80).
- Sin subtítulos añadidos: las tarjetas ya van en pantalla. Revisados fotogramas 0,1 / 16 / 33,3 s y hoja.png (12 fotogramas); el último encuadra igual que el primero.
- Portada: fotograma del plano 1 (1,2 s) con placa «EL ERROR DEL ASCENSOR» (4 palabras) y «KARATE EMAKI» (48 px).
- Revisar de oído: «kihon», «Shotokan», «julios», «Míralo».
- Licencia voz: Kokoro-82M v1.0 + sherpa-onnx 1.12.15 (Apache 2.0), descargados a scratchpad.

## v2 (28 nov)
- Vídeo: escenas3d-v2/plano-01..11 (12 clips con 04a/04b), corte seco, 33,4 s, 1080x1920, 30 fps, H.264 veryfast crf 18, yuv420p. Planos 10 y 11 rehechos. Sin subtítulos añadidos.
- Voz: voz-v2/frase-01..12.wav en los inicios de locucion-v2.txt. Música: la misma de v1 (final/fondo-ascensor.wav, obra propia, sin derechos), -7 dB con ducking. Mezcla -16 LUFS aprox., pico real <= -1 dBFS, AAC 192 kbps 48 kHz.
- Portada: portada.png de v1 reutilizada como portada-v2.png (plano 1 conservado). hoja-v2.png: 8 fotogramas. Revisar de oído «kihon», «julios».
