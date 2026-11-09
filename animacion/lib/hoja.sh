#!/usr/bin/env bash
# Hoja de contactos de un clip: N fotogramas repartidos, en mosaico, para revisarlo de un vistazo.
# Uso: animacion/lib/hoja.sh clip.mp4 salida.png [N=6]
set -euo pipefail
clip="$1"; out="$2"; n="${3:-6}"
FF=/usr/local/bin/ffmpeg; [ -x "$FF" ] || FF=ffmpeg
dur=$( ($FF -i "$clip" 2>&1 || true) | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
fps=$(python3 -c "print($n/$dur)")
$FF -y -loglevel error -i "$clip" -vf "fps=$fps,scale=360:-1,drawbox=y=83:w=iw:h=1:color=red@0.6,drawbox=y=523:w=iw:h=1:color=red@0.6,tile=${n}x1:padding=6:color=white" -frames:v 1 "$out"
