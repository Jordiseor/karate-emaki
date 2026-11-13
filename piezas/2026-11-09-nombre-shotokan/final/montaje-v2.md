# Montaje v2

- Entrada: planos-v2/plano-01..11.mp4 concatenados con corte seco (26,2 s, 30 fps, 1080x1920). Salida reel-v2.mp4: H.264 veryfast CRF 20, AAC 160 kbps, 26,2 s.
- Plano 4 (5,4-7,8 s): placa papel #F4EFE6 con borde tinta superpuesta (x170-910, y1320-1610) que tapa la tarjeta original; texto «松濤 = olas de pino» a 84 px, kanji en rojo #C8102E, resto en tinta #1A1A1A. Plano 7 («Cuentan que…») y maestro de espaldas, intactos.
- Voz: NO usada. voz/*.wav y guion-voz.json son de la v1 (35 s, otro texto). Reel solo con música y efectos; locución a generar en final/locucion-v2.txt.
- Música: animacion/musica/pulso.wav (x0,5) + ambiente.wav (x0,22), obra propia con licencia anotada en fondo-nombre-shotokan.txt; golpe.wav a 7,8 s (館), golpe-cifra.wav a 9,8 s (1939), golpe-caida.wav a 15,4 s (1945). Fundido final 24,2-26,2 s. Normalizado con loudnorm: -16,3 LUFS integrado. Al añadir la voz, bajar la música unos 6 dB y re-normalizar.
- Sin subtítulos quemados (no hay locución todavía). Portada: fotograma del plano 1 con «SHOTOKAN / es una casa» (3 palabras) en placa papel, zona segura. Hoja de contactos: 1 fotograma por plano (el 11 a 25,5 s, ya con «¿Lo sabías?»).
- Pendiente: cuando exista la voz, montar reel con voz y subtítulos (dentro de la zona segura). El cuadro final no es idéntico al inicial en la tarjeta (a propósito).
