# Audio de KARATE EMAKI

## Voces (Piper, sin red salvo releases de GitHub)
Instalación: `herramientas/instalar-voz.sh [dir]` (por defecto `/tmp/tts`; idempotente; aplica el parche IR a los modelos). Uso: `python3 herramientas/voz.py <pieza> --voz <voz> [--ritmo auto|1.0]`; muestras: `python3 herramientas/voz.py --muestras`.

| Voz | Modelo | Licencia | Atribución |
| --- | --- | --- | --- |
| `davefx` (hombre) | es_ES-davefx-medium | CC0 | no necesaria |
| `sharvard-m` (hombre, hablante 0) | es_ES-sharvard-medium | CC BY 3.0 | **obligatoria** |
| `sharvard-f` (mujer, hablante 1) | es_ES-sharvard-medium | CC BY 3.0 | **obligatoria** |

Atribución a incluir (descripción/créditos de cada pieza con voz sharvard): «Voz sintética: Piper TTS, modelo es_ES-sharvard (basado en el corpus Harvard Sentences en español), CC BY 3.0». Comprobar el texto exacto de crédito con la ficha del modelo antes de publicar. Motor Piper: MIT.

Voz por defecto: `sharvard-m` (sharvard hombre), **elegida por Jorge el 10 nov 2026** tras escuchar las tres muestras de `audio/muestras/`. Toda pieza con esta voz lleva el crédito de arriba en la descripción.

## Medidas de las muestras (no puedo escuchar: son proxies, decide el oído de Jorge)
| Voz | Centroide | Graves 100-300 Hz vs 2-5 kHz | Sibilancia 6-9 kHz | Suelo de ruido |
| --- | --- | --- | --- | --- |
| davefx | 882 Hz | +2,5 dB | -20,8 dB | -66,8 dBFS |
| sharvard-m | 567 Hz | +13,8 dB | -19,2 dB | -58,7 dBFS |
| sharvard-f | 659 Hz | +16,3 dB | -16,4 dB | -56,3 dBFS |

Lectura: sharvard-m es la más "cálida" por espectro (más graves, centroide más bajo) con sibilancia moderada; davefx es la más limpia pero más fina y neutra; sharvard-f es la más sibilante. Riesgo de sharvard: exceso de graves ("boomy"); si Jorge lo nota, bajar el realce de 220 Hz en `CADENA`. Piper es estocástico: cada ejecución varía unos centésimos de segundo.
Parámetros Piper usados: length_scale 0,87-1,0 (ritmo `auto`: de 1,06 a 0,87, tope 1,15x), noise_scale 0,6, noise_w 0,8, sentence_silence 0,2. Estas voces hablan más despacio que carlfm: hace falta recortar más texto.

## Cadena de posproceso (cada escena)
Recorte de silencios -> 48 kHz -> paso alto 70 Hz -> +2 dB a 220 Hz (Q 1) -> -2 dB a 7 kHz (Q 1,2) -> de-esser suave (i 0,3) -> compresor 2:1 (umbral -22 dB, ataque 8 ms, suelta 120 ms) -> ganancia a -16 LUFS -> limitador a -1,4 dBFS -> fundidos de 10/50 ms.

## Mezcla y niveles objetivo
- Voz: -16 LUFS por escena. Reel completo: -16 LUFS integrados, pico real <= -1 dBFS (medido con ebur128; AAC 192 kbps 48 kHz).
- Fondo (`reel-sin-voz.mp4`): +3 dB entre frases; sidechaincompress (umbral 0,015, ratio 1,7, ataque 25 ms, suelta 350 ms) -> voz unos 14-15 dB por encima del fondo mientras habla (objetivo 12-15 dB). El ducking también atenúa los golpes del fondo si coinciden con la voz.
- Encaje: la voz entra 0,06 s tras el inicio de escena y el desfase máximo es 0,5 s; el script informa de cada escena.
- Música y efectos: solo `animacion/musica/` o sintetizados.

## Kokoro (16 nov 2026)
Chatterbox no se puede bajar en la nube (Hugging Face bloqueado), así que se usa **Kokoro-82M v1.0** (Apache 2.0) con sherpa-onnx 1.12.15 (Apache 2.0). Los dos se bajan de las releases de GitHub de k2-fsa/sherpa-onnx. Jorge eligió la voz **em_santa** (sid 53) tras escuchar 3 muestras.
Uso: `KOKORO_DIR=<dir> python3 herramientas/voz-kokoro.py <pieza> [--velocidad 1.0 | v1,v2,...] [--fondo-db -7]`. Toma las frases de `voz-chatterbox.py` y los inicios de `final/locucion-v2.txt`, aplica la misma cadena y el mismo ducking que `voz.py` y saca `final/reel-v2-voz.mp4`. El fondo de reel-v2 ya trae la música a ≈−15 LUFS, por eso se baja a −7 dB.
Kokoro habla más despacio que el guion (≈3 palabras/s): zenkutsu necesita `--velocidad 1.3,1.25,1.2,1.1` y aun así f02 y f03 entran 0,7 y 0,6 s tarde.
