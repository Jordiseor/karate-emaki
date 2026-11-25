# Prepara la sesión de ChatGPT (Codex) para las tareas de la nube. Se ejecuta UNA vez en el PC de Jorge
# (y otra vez si un día Codex dice que la sesión ha caducado).
#   1. Instala Codex:      npm i -g @openai/codex
#   2. Inicia sesión:      codex login      (elige «Sign in with ChatGPT» y entra con tu cuenta)
#   3. Ejecuta esto:       powershell -ExecutionPolicy Bypass -File herramientas\codex-sesion.ps1
#   4. Pega lo copiado como variable CODEX_AUTH_B64 en el entorno de la nube de las tareas.
# Es como una contraseña: no la pegues en el chat, ni en la oficina, ni en el repositorio.
$auth = Join-Path $env:USERPROFILE ".codex\auth.json"
if (-not (Test-Path $auth)) { Write-Error "No existe $auth. Haz antes: codex login"; exit 1 }
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($auth))
Set-Clipboard -Value $b64
Write-Host "Copiado al portapapeles ($($b64.Length) caracteres). Pégalo como CODEX_AUTH_B64 en el entorno de la nube."
