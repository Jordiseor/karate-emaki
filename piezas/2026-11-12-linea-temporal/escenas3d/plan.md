# Plan del reel de anuncio (12 s) — escenas3d

Estilo: siluetas de tinta sin rostro sobre papel #F4EFE6, capa 2D + `rollo2d.js`. Rojo solo en «36» y años. Render escala 0,5, determinista. Fuentes en `src/` (`comun.js` = siluetas, viñetas, texto).

| Plano | s | Contenido | Texto | Locución informativa |
| --- | --- | --- | --- | --- |
| 01 | 3,0 | «36» rojo golpea (0,12 s), «años.», rollo pequeño se abre debajo | 36 años. | «Treinta y seis años.» (golpe de sonido a 0,12 s) |
| 02 | 2,5 | Castillo con siluetas en kihon, cartel 1921 | 1921 · Castillo de Shuri | «De un castillo en Okinawa...» |
| 03 | 2,5 | El rollo avanza (0,1 s) a Tokio con dōjō y linterna; año 1939 | 1939 · Dōjō Shōtōkan, Tokio | «...a un dōjō en Tokio.» |
| 04 | 2,5 | Móvil dibujado, mano de silueta desliza la línea; etiquetas Seguro / Según fuentes | Desliza. Cada hito, con su fuente. | «Recórrelo con el dedo, hito a hito, con su nivel de certeza.» |
| 05 | 1,5 | Silueta en rei junto al rollo atado; botón | Enlace en el perfil (+ «36 años en un rollo») | «Está en el enlace del perfil.» |

Total 12,0 s. Sin audio en los clips. Fechas usadas (dosier): 1921 (hito 1), 1939 (hito 10); en el móvil, marcas 1921/1922/1939/1945/1957 (hitos 1, 2, 10, 11, 15).

## Notas para el jefe de animación / Editor
- Plano 3 empieza en el castillo (1921) y desliza: unir con el final del plano 2 sin salto.
- Dibujado en los planos (no está en la biblioteca): siluetas 2D sin rostro (`silueta`), viñetas Shuri y Tokio con linterna, móvil con línea temporal y mano. Candidatos a `animacion/`.
- Mockup del móvil: «1945 Según fuentes» es ilustrativo (el día es de fiabilidad baja; el año alta); cambiar a «Seguro» si se prefiere coherencia con el interactivo.
- Plano 05 añade «36 años en un rollo» arriba (fuera del storyboard); quitar si sobra.
- El «rei» (silueta) se ve algo rígido; sin enlace URL inventado.
