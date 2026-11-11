# Muestras de voz más natural (11 nov 2026)

Texto idéntico en todas: la locución completa de la presentación (43 palabras; «dōjō» escrito «dóyo»). Se genera trozo a trozo (frase y coma) y se pegan con silencios: **0,15 s en comas y dos puntos, 0,3–0,4 s entre frases**. Velocidad 1,0x en todas (nada acelerado). WAV mono 48 kHz, −16 LUFS integrados, pico real ≤ −1,3 dBFS, sin la cadena de posproceso de `herramientas/voz.py`. Cada `.mp4` es `reel.mp4` + esa voz, **sin música** (el vídeo repite el último fotograma 2 s por si la voz pasa de 20,2 s). Son para escuchar, no para publicar.

**Nadie ha podido escuchar nada aquí.** La columna de opinión es técnica y a ciegas: decide el oído de Jorge.

| Motor | Voz | Licencia (código / pesos) | Duración | CPU s/frase | Acento | Opinión técnica (sin oír) |
| --- | --- | --- | --- | --- | --- | --- |
| Kokoro-82M (ONNX, vía onnxruntime) | `em_alex` (hombre) | Apache 2.0 / Apache 2.0: https://huggingface.co/hexgrad/Kokoro-82M (ficha del modelo); conversión ONNX: https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models (`kokoro-multi-lang-v1_0/LICENSE`, Apache 2.0) | 20,50 s (**+0,30 s sobre 20,2**) | 1,46 | Entrenada con español latino/neutro; con mi fonetización de castellano (θ, ll, ceceo no) debería acercarse a España, sin garantía | La candidata más prometedora: modelo neural más reciente que Piper, entonación y pausas internas más variadas. Riesgo: acento y errores de mi fonetización casera |
| Kokoro-82M | `em_santa` (hombre) | igual | 20,37 s (**+0,17 s**) | 1,28 | igual | Igual que em_alex; timbre distinto de alex, comparar a oído |
| Kokoro-82M | `ef_dora` (mujer) | igual | 20,05 s (cabe) | 1,37 | igual | Solo por si Jorge quiere probar voz femenina (no es «sempai» según la idea inicial) |
| Piper 2023.11.14-2 | `sharvard-m` (la actual) | Motor MIT: https://github.com/rhasspy/piper/blob/master/LICENSE.md ; voz CC BY 3.0 (atribución obligatoria, ver `audio/README.md`): https://creativecommons.org/licenses/by/3.0/ | 17,86 s | 0,76 | España | Referencia. Sin acelerar y con pausas reales debería sonar menos "carrera", pero sigue siendo VITS pequeño: prosodia plana |
| Piper | `davefx` | Motor MIT (igual); voz CC0: https://creativecommons.org/publicdomain/zero/1.0/ | 16,14 s | 0,71 | España | Referencia más limpia y fina; misma limitación de prosodia |

Licencias no verificadas en línea desde aquí (Hugging Face y PyPI están bloqueados en este entorno): las de Kokoro y Piper vienen de los ficheros LICENSE descargados (Kokoro, comprobado: Apache 2.0) y de `audio/README.md` (Piper). Comprobar en las URLs antes de publicar.

## Encaje en 20,2 s
Con 0,15/0,3–0,4 s de pausas, **Kokoro em_alex dura 20,50 s y em_santa 20,37 s** (ef_dora 20,05 s y Piper caben). Propuesta si Jorge elige Kokoro (sobran 0,2–0,3 s): unir «Y el dóyo.» y «Con sus gallos.» en «Y el dóyo, con sus gallos.» (ahorra ≈0,15 s de pausa y una entrada) y/o quitar «Pasa,» de la primera frase (−0,5 s). No lo he cambiado.

## No probado
- **Chatterbox Multilingual (MIT)**: **no instalado**. Necesita PyTorch desde PyPI, el código desde GitHub y los pesos desde Hugging Face; PyPI y Hugging Face devuelven 403 (política del proxy) y el repositorio de GitHub también. No es un problema de tiempo ni disco. Ojo si se prueba en otra máquina: Chatterbox incrusta una marca de agua (Perth) en el audio; no es incompatible con la licencia, pero conviene saberlo. Licencia a verificar: https://github.com/resemble-ai/chatterbox/blob/master/LICENSE
- Kokoro oficial por Python (`pip install kokoro`) tampoco, por lo mismo. Se probó otra vía: modelo ONNX de las releases de GitHub.

## Cómo está hecho (importante)
Kokoro necesita pasar el texto a fonemas (normalmente con espeak-ng). No había espeak-ng ni acceso a PyPI, y el sistema impidió ejecutar el binario `sherpa-onnx` descargado, así que **escribí un convertidor español→IPA propio** (castellano: θ, ʎ, acentuación por reglas, alófonos b/d/g, diptongos) y ejecuto el modelo con `onnxruntime`. Fallos de pronunciación puntuales son culpa mía, no de la voz; con espeak-ng (fonemas es) la voz podría mejorar. Fonemas usados: ver salida de `generador/kokoro_run.py`.

## Regenerar
`mkdir -p /tmp/claude-0/s /tmp/claude-0/k && cp generador/*.py /tmp/claude-0/s/` ; descargar `kokoro-multi-lang-v1_0.tar.bz2` de https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/ y descomprimirlo en `/tmp/claude-0/k/`; `herramientas/instalar-voz.sh` (Piper en `/tmp/tts`); `python3 -I /tmp/claude-0/s/piper_run.py && python3 -I /tmp/claude-0/s/kokoro_run.py`. Requiere `onnxruntime`, `numpy`, `scipy`, `ffmpeg`. (Los `.py` están en `generador/`.)
