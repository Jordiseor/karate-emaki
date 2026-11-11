# Audio: Presentación de KARATE EMAKI (20,2 s)

Nadie ha escuchado nada de esto: solo se han medido niveles, duraciones y espectros. Jorge debe escucharlo antes de dar el visto bueno.

## Voz (`voz/plano-NN.wav`, `voz/guion-voz.json`)
Piper `es_ES-sharvard-medium` hablante 0 (hombre), cadena de `audio/README.md` (-16 LUFS por plano, pico -1,4 dBFS). Cada wav va sin silencio previo: entra a `inicio_voz` (corte + 0,06 s). El json trae texto, inicio, inicio_voz, duracion, fin_voz y fin_plano. Grafía: «e-ma-ki», «do-yo».

| Plano | Entra | Termina | Fin de plano | length_scale (velocidad) |
| --- | --- | --- | --- | --- |
| 1 | 0,06 | 1,38 | 2,0 | 0,92 (1,09x) |
| 2 | 2,06 | 4,51 | 4,6 | 0,87 (1,15x, tope) |
| 3 | 4,66 | 6,97 | 7,4 | 0,90 (1,11x) |
| 4 | 7,46 | 8,61 | 9,5 | 0,92 |
| 5 | 9,56 | 11,20 | 11,6 | 0,92 |
| 6 | 11,66 | 13,58 | 13,7 | 0,92 |
| 7 | 13,76 | 15,75 | 15,8 | 0,90 |
| 8 | 15,86 | 17,64 | 18,0 | 0,92 |
| 9 | 18,06 | 18,67 | 20,2 | 0,95 |

Todos caben en su plano. El plano 2 (7 palabras en 2,6 s) solo cabía en el tope de 1,15x; a ritmo natural acababa en 4,72 s. No se ha recortado ninguna palabra. El plano 9 acaba en 18,67 s y deja 1,5 s de música y logo.
Plano 7: el wav lleva «Y el do-yo.» (13,76-14,47), 0,40 s de hueco y «Con sus gallos.» (14,87-15,75). Así el kiai colectivo cae en el hueco, sin voz encima, como pide `locucion.txt`.

## Efectos (sintetizados con `sintetizar.py`: ruido filtrado, síntesis de formantes, saturación; sin muestras)
Tiempos en `efectos.json` (los usa `mezclar.py`).

| Efecto | Fichero | Entra (s) | Dur. | Qué es |
| --- | --- | --- | --- | --- |
| Papel que se desenrolla | sfx-papel-desenrolla | 2,05 | 1,59 | ruido de banda que sube, crujidos de papel y golpe de madera a ≈3,5 s |
| Deslizamiento de viñeta | sfx-vineta-desliza | 7,40 / 9,50 / 11,60 / 13,70 | 0,25 | soplo de ruido que sube, suave (-14 dB) |
| Kiai colectivo | sfx-kiai-colectivo | 14,50 | 0,60 | 6 voces sintéticas (fuente glotal con jitter, formantes de «a»→«e», explosiva «k», saturación) |
| Kiai gallo | sfx-kiai-gallo | 15,72 | 0,50 | una voz que sube, salta ≈2,6x de tono hacia la mitad con temblor y se desploma |
| Rollo que se cierra | sfx-rollo-cierra | 15,85 | 1,39 | el papel al revés y golpe de madera a ≈17,1 s |
| Acento del logo | sfx-logo-acento | 18,00 | 1,10 | bombo grave 60-100 Hz, campana suave 880/1318/1760 Hz y clic |

- El gallo (15,72) solapa 0,03 s con el final de la voz y su cola cruza el corte al plano 8 (hasta ≈16,2 s). Si la imagen rompe el bocadillo «KIAI» antes, mover `t` en `efectos.json` y volver a ejecutar `mezclar.py`. Con la voz continua no cabían voz, kiai colectivo y gallo sin pisarse.
- Duda: las voces sintetizadas pueden sonar a sintetizador o a coro de dibujos. Tengo medido el espectro (energía en 500-4000 Hz, sin tono puro), no el timbre.

## Música (`musica.wav`)
20,2 s exactos = 16 compases de 4/4 a 190 bpm. Taiko sintético (don/ka) en 1, «y» del 3, y relleno de semicorcheas cada 4 compases. Shamisen sintético (Karplus-Strong) con un motivo propio de 2 compases en escala miyako-bushi sobre re (re, mi♭, sol, la, si♭) en octava aguda, y un chasquido suave en contratiempos. No copia ninguna melodía conocida. Bucle: la cola de 1,5 s se suma al principio, así que el final enlaza (primera y última muestra en torno a 0). Sin escuchar: verificar que el motivo no resulte cansino ni suene a «chiptune».

## Mezcla guía (`mezcla-guia.wav`, `mezclar.py`)
Mono 48 kHz 16 bit, 20,2 s. Música con ducking (-12 dB bajo voz, +3 dB libre; ataque 25 ms, suelta 300 ms), 14,0 dB por debajo de la voz mientras habla. Medido con ffmpeg: **-16,2 LUFS integrados, pico real -1,2 dBFS** (volumedetect: máximo -1,5 dB, medio -15,9 dB). Es mono: el Editor puede duplicarla a estéreo. Si rehace la mezcla, tiene los wav sueltos y `efectos.json`.

## Licencias
- Efectos, música y scripts: propios, creados para esta pieza, sin derechos de terceros.
- Voz: Piper TTS, modelo es_ES-sharvard (CC BY 3.0). El crédito NO va en los textos de las publicaciones: está en `CREDITOS.md`. Motor Piper: MIT.
