#!/usr/bin/env bash
# Renderiza las pruebas de historia3d: ./pruebas.sh "casa:0 noche:2 ..."  (nombre:t)
AQUI="$(cd "$(dirname "$0")" && pwd)"; R="$AQUI/../../../render.mjs"
for it in ${1:-"casa:0 construccion:1 fantasma:2.5 pinos:1 mar:2 calle:0 noche:2 maestro-seiza:2.2 maestro-pie:2.5 alumnos-viga:0 fila:1 peinados:0 rotulo:1.2"}; do
  n="${it%%:*}"; t="${it##*:}"; s=$(date +%s.%N)
  node "$R" "$AQUI/$n.html" --t "$t" --png "$AQUI/$n.png" 2>&1 | grep -v -E "GPU stall|^captura" 
  echo "$n t=$t $(echo "$(date +%s.%N) - $s" | bc | cut -c1-5) s"
done
