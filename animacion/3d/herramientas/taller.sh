#!/usr/bin/env bash
# Hoja de revisión del personaje: renderiza las vistas de taller.html y las junta en una cuadrícula.
# Uso: animacion/3d/herramientas/taller.sh salida.png ["0 1 2 3"]  (por defecto todas las vistas)
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"; out="$1"; vistas="${2:-0 1 2 3 4 5 6 7 8 9}"
tmp="$(mktemp -d)"; FF=/usr/local/bin/ffmpeg; [ -x "$FF" ] || FF=ffmpeg
i=0; for v in $vistas; do node "$AQUI/../../render.mjs" "$AQUI/taller.html" --t "$v" --png "$tmp/$(printf %02d $i).png" >/dev/null 2>&1; i=$((i+1)); done
n=$i; cols=$(( n < 5 ? n : 5 )); rows=$(( (n + cols - 1) / cols ))
$FF -y -loglevel error -framerate 1 -i "$tmp/%02d.png" -vf "scale=360:-1,tile=${cols}x${rows}:padding=4:color=white" -frames:v 1 "$out"
rm -rf "$tmp"; echo "$out"
