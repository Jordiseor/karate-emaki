#!/usr/bin/env bash
# Pregunta a ChatGPT a través de Codex CLI, con la suscripción de ChatGPT de Jorge (sin API de pago).
# Uso: herramientas/codex.sh <encargo.md> <respuesta.md>
#
# Necesita (lo prepara Jorge, ver programacion.md «ChatGPT con Codex»):
#   - CODEX_AUTH_B64: el fichero ~/.codex/auth.json de su PC en base64 (variable del entorno de la nube, nunca en el repo).
#   - Red permitida: registry.npmjs.org, chatgpt.com, auth.openai.com, api.openai.com.
set -euo pipefail
ENC="${1:?encargo}"; SAL="${2:?salida}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v codex >/dev/null 2>&1; then
  npm i -g @openai/codex --silent --https-proxy="${HTTPS_PROXY:-}" || { echo "ERROR: no se pudo instalar Codex (¿registry.npmjs.org bloqueado?)"; exit 2; }
fi

if [ ! -s "$HOME/.codex/auth.json" ]; then
  [ -n "${CODEX_AUTH_B64:-}" ] || { echo "ERROR: falta CODEX_AUTH_B64 (sesión de ChatGPT de Jorge)"; exit 3; }
  mkdir -p "$HOME/.codex"; umask 077
  printf '%s' "$CODEX_AUTH_B64" | base64 -d > "$HOME/.codex/auth.json"
fi

SISTEMA="Trabajas como colaborador creativo del estudio KARATE EMAKI (reels animados 3D de karate, base Shotokan, en español de España). Claude dirige el estudio; tú eres un trabajador más. Solo respondes con texto: no edites ficheros ni ejecutes comandos. No inventes datos: si una fecha, cifra o cita no viene en el encargo, márcala como [SIN VERIFICAR]. Nada de burlas a otros estilos."

TMP="$(mktemp -d)"
( cd "$TMP" && codex exec --skip-git-repo-check --sandbox read-only \
    --output-last-message "$TMP/respuesta.md" "$SISTEMA

$(cat "$ENC")" > "$TMP/log.txt" 2>&1 ) || { echo "ERROR: Codex falló (si dice login/401, Jorge tiene que renovar CODEX_AUTH_B64):"; tail -15 "$TMP/log.txt"; exit 4; }

{ echo "<!-- ChatGPT vía Codex (suscripción de Jorge) · $(date -I) -->"; cat "$TMP/respuesta.md"; } > "$SAL"
rm -rf "$TMP"
echo "OK → $SAL"
