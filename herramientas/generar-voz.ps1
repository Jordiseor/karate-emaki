# KARATE EMAKI - genera las locuciones con la voz de Windows (sin instalar nada)
# Uso: clic derecho > "Ejecutar con PowerShell", o en PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\generar-voz.ps1
# Crea un WAV por escena en  Videos\KarateEmaki\<pieza>\  y un .zip por pieza para subirlo al chat.

Add-Type -AssemblyName System.Speech
$voz = New-Object System.Speech.Synthesis.SpeechSynthesizer
$es = $voz.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'es-*' }
if (-not $es) {
  Write-Host "No hay ninguna voz en espanol instalada." -ForegroundColor Red
  Write-Host "Configuracion > Hora e idioma > Voz > Agregar voces > Espanol (Espana). Luego vuelve a ejecutar."
  Read-Host "Pulsa Enter para salir"; exit 1
}
$preferida = $es | Where-Object { $_.VoiceInfo.Culture.Name -eq 'es-ES' } | Select-Object -First 1
if (-not $preferida) { $preferida = $es | Select-Object -First 1 }
$voz.SelectVoice($preferida.VoiceInfo.Name)
$voz.Rate = 1      # -10 lento ... 10 rapido
$voz.Volume = 100
Write-Host "Voz: $($preferida.VoiceInfo.Name) ($($preferida.VoiceInfo.Culture.Name))" -ForegroundColor Cyan

# Grafia adaptada para que la voz lo pronuncie bien (Shoto, doyo, sen-kutsu)
$piezas = [ordered]@{
  '2026-11-09-nombre-shotokan' = @(
    'Shotokan no es el nombre de un estilo. Es una casa.',
    'Shoto, olas de pino, era el seudónimo con que Gichin Funakoshi firmaba sus poemas.',
    'El viento en los pinos, que suena a mar.',
    'Y kan significa casa.',
    'En mil novecientos treinta y nueve, Funakoshi y sus alumnos abren un doyo en Tokio.',
    'Cuentan que sus alumnos colgaron el cartel: la casa de Shoto.',
    'En mil novecientos cuarenta y cinco, ardió en los bombardeos de Tokio.',
    'Funakoshi nunca bautizó su karate. Pero el mundo lo llamó como aquel doyo.',
    'Cada vez que dices Shotokan, nombras una casa que ya no existe.'
  )
  '2026-11-09-zenkutsu-estabilidad' = @(
    'Empújame hacia delante. ¿En qué posición aguanto más?',
    'Este punto rojo es tu centro de masas. Mientras su vertical caiga dentro de tus pies, sigues de pie.',
    'Con los pies juntos, la base es un pie. Te inclinas ocho grados... y fuera.',
    'En senkutsu dachi, la posición adelantada, la base pasa de un metro.',
    'Hacia delante, ahora aguantas hasta unos veintiséis grados.',
    'Y si bajas la cadera, el punto rojo baja y llegas a unos treinta. Por eso es larga y baja.',
    'Pero gira la cámara. De lado, la base es estrecha y aguantas bastante menos.',
    '¿Por dónde me empujarías tú?'
  )
}

$base = Join-Path ([Environment]::GetFolderPath('MyVideos')) 'KarateEmaki'
$formato = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($pieza in $piezas.Keys) {
  $dir = Join-Path $base $pieza
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $i = 1
  foreach ($frase in $piezas[$pieza]) {
    $wav = Join-Path $dir ('escena-{0:D2}.wav' -f $i)
    $voz.SetOutputToWaveFile($wav, $formato)
    $voz.Speak($frase)
    $voz.SetOutputToNull()
    Write-Host ("  {0}  escena {1:D2}" -f $pieza, $i)
    $i++
  }
  $zip = Join-Path $base "$pieza-voz.zip"
  Compress-Archive -Path (Join-Path $dir '*.wav') -DestinationPath $zip -Force
}
$voz.Dispose()
Write-Host ""
Write-Host "Listo. Sube estos dos ficheros al chat de Claude:" -ForegroundColor Green
Get-ChildItem $base -Filter *-voz.zip | ForEach-Object { Write-Host "  $($_.FullName)" }
explorer $base
Read-Host "Pulsa Enter para salir"
