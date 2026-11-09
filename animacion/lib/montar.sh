#!/usr/bin/env bash
# Sustituye <!--#cabecera--> por el contenido de cabecera.inc (si existe junto al HTML) y renderiza.
# Uso: animacion/lib/montar.sh <src/escena-NN.html> <salida-dir> [--congelar S]
#      PRUEBA=1.5 animacion/lib/montar.sh ...   → solo fotograma de prueba (<salida>/<base>.prueba.png)
set -euo pipefail
src="$1"; dst="$2"; shift 2
dir=$(dirname "$src"); base=$(basename "$src" .html)
tmp="$dir/.$base.build.html"
if [ -f "$dir/cabecera.inc" ]; then
  python3 - "$src" "$dir/cabecera.inc" "$tmp" <<'PY'
import sys; s=open(sys.argv[1]).read(); h=open(sys.argv[2]).read(); open(sys.argv[3],'w').write(s.replace('<!--#cabecera-->',h))
PY
else cp "$src" "$tmp"; fi
RAIZ=$(cd "$(dirname "$0")/.." && pwd)
if [ -n "${PRUEBA:-}" ]; then  # PRUEBA=1.5 → solo un fotograma de prueba en ese instante
  node "$RAIZ/render.mjs" "$tmp" --t "$PRUEBA" --png "$dst/$base.prueba.png"
else
  node "$RAIZ/render.mjs" "$tmp" --out "$dst/$base.mp4" --png "$dst/$base.png" "$@"
fi
rm -f "$tmp"
