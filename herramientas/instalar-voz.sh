#!/usr/bin/env bash
# Instala el motor Piper y las voces es_ES (davefx, sharvard) en un directorio.
# Uso: herramientas/instalar-voz.sh [directorio]     (por defecto /tmp/tts)
# Idempotente: si ya está todo, no descarga nada. Solo necesita acceso a releases de GitHub.
set -euo pipefail
D="${1:-${TTS_DIR:-/tmp/tts}}"
PIPER_URL="https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz"
SHERPA="https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models"
mkdir -p "$D/voces"
TMP="$(mktemp -d "$D/.tmp.XXXXXX")"; trap 'rm -rf "$TMP"' EXIT

# 1) Motor
if [ ! -x "$D/piper/piper" ]; then
  echo "Descargando motor Piper..."
  curl -fsSL --retry 3 -o "$TMP/piper.tgz" "$PIPER_URL"
  tar xzf "$TMP/piper.tgz" -C "$D"          # crea $D/piper/
fi

# 2) Voces (el nombre sherpa lleva prefijo vits-piper-)
for V in davefx sharvard; do
  M="es_ES-$V-medium"
  if [ ! -s "$D/voces/$M.onnx" ] || [ ! -s "$D/voces/$M.onnx.json" ]; then
    echo "Descargando voz $M..."
    curl -fsSL --retry 3 -o "$TMP/$V.tar.bz2" "$SHERPA/vits-piper-$M.tar.bz2"
    mkdir "$TMP/$V" && tar xjf "$TMP/$V.tar.bz2" -C "$TMP/$V"
    ONNX="$(find "$TMP/$V" -name '*.onnx' | head -1)"; JSON="$(find "$TMP/$V" -name '*.onnx.json' | head -1)"
    [ -n "$ONNX" ] && [ -n "$JSON" ] || { echo "Falta .onnx o .onnx.json en $V" >&2; exit 1; }
    cp "$ONNX" "$D/voces/$M.onnx"; cp "$JSON" "$D/voces/$M.onnx.json"
  fi
  # 3) Parche IR: el binario solo carga IR <= 8 (segundo byte 0x09 -> 0x08)
  python3 - "$D/voces/$M.onnx" <<'PY'
import sys
p=sys.argv[1]
with open(p,'r+b') as f:
    h=f.read(2)
    if len(h)==2 and h[1]==9:
        f.seek(1); f.write(b'\x08'); print("  parche IR aplicado:",p)
PY
done

# 4) Prueba
echo "Hola." | "$D/piper/piper" --model "$D/voces/es_ES-davefx-medium.onnx" --output_file "$TMP/t.wav" >/dev/null 2>&1 \
  && echo "Piper listo en $D" || { echo "Piper no arranca" >&2; exit 1; }
