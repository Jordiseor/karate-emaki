# KARATE EMAKI - locución natural con Chatterbox (gratis, licencia MIT), en tu PC.
# Uso: clic derecho > "Ejecutar con PowerShell", o en PowerShell desde esta carpeta:
#   powershell -ExecutionPolicy Bypass -File .\voz-chatterbox.ps1
# La primera vez instala Python 3.11 (si falta), Chatterbox y el modelo (~3-4 GB en total). Tarda un rato.
# Al final deja un .zip en Videos\KarateEmaki\ para subirlo al chat.

$ErrorActionPreference = "Stop"
$pieza = "2026-11-11-presentacion"
$aqui  = Split-Path -Parent $MyInvocation.MyCommand.Path
$base  = Join-Path $env:USERPROFILE "KarateEmaki"
$venv  = Join-Path $base "chatterbox-venv"

# 1. Python 3.11 (Chatterbox no funciona con versiones más nuevas)
$py = $null
try { & py -3.11 --version *> $null; if ($LASTEXITCODE -eq 0) { $py = "py -3.11" } } catch {}
if (-not $py) {
  Write-Host "Falta Python 3.11. Lo instalo con winget..." -ForegroundColor Yellow
  winget install -e --id Python.Python.3.11 --source winget --accept-source-agreements --accept-package-agreements
  Write-Host "Cierra esta ventana y vuelve a ejecutar el script." -ForegroundColor Cyan
  Read-Host "Pulsa Enter para salir"; exit 0
}

# 2. Entorno propio para no tocar nada más del PC
if (-not (Test-Path "$venv\Scripts\python.exe")) {
  New-Item -ItemType Directory -Force -Path $base | Out-Null
  Write-Host "Creando entorno en $venv ..." -ForegroundColor Cyan
  Invoke-Expression "$py -m venv `"$venv`""
  & "$venv\Scripts\python.exe" -m pip install --upgrade pip
  Write-Host "Instalando Chatterbox (varios minutos)..." -ForegroundColor Cyan
  & "$venv\Scripts\python.exe" -m pip install chatterbox-tts
}

# 3. Generar (2 tomas por frase; cambia --expresividad 0.3-0.8 o --cfg 0.3-0.6 si quieres otro tono)
Write-Host "Generando la locución de $pieza ..." -ForegroundColor Cyan
& "$venv\Scripts\python.exe" (Join-Path $aqui "voz-chatterbox.py") --pieza $pieza --tomas 2

Write-Host ""
Write-Host "Escucha la muestra y sube el .zip de Videos\KarateEmaki al chat." -ForegroundColor Green
Read-Host "Pulsa Enter para salir"
