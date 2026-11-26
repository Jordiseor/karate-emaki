# Montaje · dōjō 1945

- Entrada: escenas3d/plano-01..12.mp4 con corte seco (34,3 s, 30 fps, 1080x1920; 3,2/2,3/3,2/2,3/2,3/2,3/3,2/3,2/2,3/3,2/3,6/3,2 s). Bucle 12 -> 1 directo, sin tocar escenas3d/. H.264 veryfast (crf 18), AAC 192 kbps 48 kHz. Vídeo y audio 34,300 s (ffprobe).
- Fondo propio sintetizado (final/fondo-dojo-1945.wav): pad lento en Re m / Si b / Fa / La m, sin percusión, y campana grave suave en 0,1/8,7/15,6/24,3/31,1 s; fundido de salida 2 s. reel-sin-voz: -15,2 LUFS. Licencia: obra propia del estudio, sin muestras de terceros.
- Voz: Kokoro em_santa (sid 53), herramientas/voz-kokoro.py ejecutado desde una copia en el scratchpad (wav fuera del repo). Texto = storyboard íntegro sin datos nuevos. Velocidades: 1,25 p1-2; 1,35 p3; 1,5 p7; 1,2 resto. Fondo -7 dB con ducking (fondo -9,4 dB bajo la voz; voz 17,7 dB sobre él). reel.mp4: -16,1 LUFS, pico real -1,3 dBFS.
- Pronunciación (grafía solo para la voz, ver locucion.txt): «dojo», «Shotokan», «Shoto», «Zoshigaya» sin macrones; años en letra («mil novecientos cuarenta y cinco»). Revisar de oído Zoshigaya y Toshima.
- Desfases: voz +0,06 s en todos los planos salvo p1 +0,12 y p3 +0,36 (la frase es larga). Fin de voz 33,07 s; ninguna frase invade el plano siguiente (p3 acaba 8,65 s, p7 18,63 s).
- Sin subtítulos añadidos: las tarjetas ya van en pantalla. Revisados fotogramas 0,1 / 26,8 / 34,2 s y hoja.png (9 fotogramas).
- Portada: fotograma del plano 1 (1,2 s) con placa papel «DOJO DE SEIS AÑOS» (4 palabras, 100 px, filete rojo) y «KARATE EMAKI» (48 px).
- Licencia voz: Kokoro-82M v1.0 (Apache 2.0) + sherpa-onnx 1.12.15 (Apache 2.0), bajados de releases de GitHub a scratchpad.
- Plano 10 rehecho (26-11): cartel SHOTOKAN entero. Vídeo re-montado desde escenas3d/plano-01..12; audio de reel.mp4 y reel-sin-voz.mp4 copiado sin tocar de los anteriores (wav de voz ya no disponibles). 34,300 s, reel.mp4 -16,1 LUFS; hoja.png rehecha. Sin defectos pendientes.
