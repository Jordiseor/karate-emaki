#!/usr/bin/env bash
# Sustituye <!--#cabecera--> por el contenido de cabecera.inc (si existe junto al HTML) y renderiza.
# Uso: animacion/lib/montar.sh <src/escena-NN.html> <salida-dir> [--congelar S]
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
node "$RAIZ/render.mjs" "$tmp" --out "$dst/$base.mp4" --png "$dst/$base.png" "$@"
rm -f "$tmp"
