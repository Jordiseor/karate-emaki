# Storyboard v2: Seiza, minuto 1 contra minuto 5
Duración total: 14,5 s · Pilar: Anécdotas y humor del dōjō · Formato: 1080×1920 · 3D · 6 planos · bucle suave

- Id: 2026-11-17-seiza · Guionista · 2026-11-27 · Versión 2 por correcciones de Jorge. Sustituye a `storyboard.md` (que no se toca). Publicación prevista: sáb 28 nov.
- Correcciones de Jorge aplicadas: (1) fuera el hormigueo, no se entendía; (2) un seiza nunca pasa de 5 minutos, así que el chiste pasa de «minuto 10» a «minuto 5»; (3) el cierre es la pregunta «¿Te gusta hacer seiza al acabar la clase para volver a la calma?».
- Voz: sempai tranquilo, «todos hemos pasado por ahí». **29 palabras** (3+3+4+4+2+13), unos 2 palabras/s. Arranca a 0,0 s.
- Texto en pantalla: una tarjeta a la vez, ≤7 palabras, ≥48 px, tinta #1A1A1A sobre papel. Rojo #C8102E solo en el «minuto 5» y su cronómetro.
- Chiste: mismo karateka, misma postura, misma cámara; solo cambia la cara y el reloj. «Minuto 1 / minuto 5» es la gracia (el tiempo se estira), **no un dato ni una duración habitual**: no se afirma cuánto dura un seiza en ningún dōjō.
- Sin aviso médico en pantalla (el «si duele de verdad, para» va solo en el copy).
- «Mokusō yame» sigue como fin de la meditación (se abren los ojos), sin afirmar que sea la orden de levantarse. No sale «Naore» ni «Kiritsu». Ya no hay levantarse en el reel.

## Gancho (0–2,0 s)
Igual que en v1: fotograma 0, karateka en seiza, sonrisa grande, cronómetro «1:00». Voz y tarjeta a 0,0 s: «Seiza, minuto uno.» Corte seco a 2,0 s al minuto 5.

## Plano a plano

| # | Tiempo | Imagen (3D) | Cámara | Locución / sonido | Texto en pantalla |
| --- | --- | --- | --- | --- | --- |
| 1 | 0,0–2,0 s | Karateka (cinturón naranja) en seiza, espalda recta, manos en los muslos. Sonrisa 0,8, cejas altas, parpadeo tranquilo. Cronómetro 2D «1:00». | Frontal cuerpo entero, fija, `fov 26`. | Voz: «Seiza, minuto uno.» (0,0 s). Ambiente suave de dōjō. | «Seiza. Minuto 1.» |
| 2 | 2,0–4,0 s | **Corte seco, mismo encuadre.** Misma pose: ceño (cejas −1), ojos muy abiertos, sonrisa torcida, gota de sudor, temblor mínimo en hombros. Cronómetro «5:00» en rojo. | Idéntica al plano 1 (el corte es el chiste). | Voz: «Seiza, minuto cinco.» (2,0 s). «Ding» seco de reloj en el corte. | «Seiza. Minuto 5.» (rojo en «Minuto 5») |
| 3 | 4,0–6,0 s | Vuelve la calma: respira y sonríe sereno. Kanji 正座 pequeño a un lado. | Giro lento a 3/4 (azimut 0 → 35°). | Voz: «Seiza significa sentarse correctamente.» (4,0 s) | «Seiza (正座): sentarse correctamente» |
| 4 | 6,0–8,0 s | Ojos cerrados, pecho que sube y baja despacio dos veces. Silencio. 黙想 pequeño. | Primer plano tronco y cara, empuje lento (zoom 1,0 → 1,12). | Voz: «Mokusō: meditar en silencio.» (6,0 s). Respiración grave. | «Mokusō: silencio y respiración» |
| 5 | 8,0–9,5 s | Abre los ojos de golpe (parpadeo 1 → 0), alivio, hombros que caen. | Corte a frontal de medio cuerpo, fija. | Voz más alta: «¡Mokusō yame!» (8,0 s). | «Mokusō yame: fin de la meditación» |
| 6 | 9,5–14,5 s | **Nuevo.** Karateka en seiza, mismo encuadre que el plano 1, sonrisa serena, hombros sueltos; mira a cámara y ladea un poco la cabeza al preguntar. En el último medio segundo reaparece el cronómetro «1:00» y la cara del fotograma 0 (enlace con el bucle). | Frontal cuerpo entero, fija, `fov 26`; exacta al plano 1. | Voz: «¿Te gusta hacer seiza al acabar la clase para volver a la calma?» (9,7 s). Corte limpio, sin cola. | Dos tarjetas seguidas: «¿Te gusta hacer seiza al acabar?» (9,7 s) y «¿Para volver a la calma?» (12,0 s) |

## Bucle
El último fotograma (14,5 s) repite el fotograma 0 (seiza, sonrisa, «1:00»): al repetirse parece que empieza otra clase.

## Cierre y llamada a comentar
Cierre: la pregunta del plano 6, tal cual la pide Jorge. Sin remate previo: el reel pasa del «ya se acaba» (plano 5) directamente a la pregunta. La invitación a comentar vuelve a salir en el copy.

## Nota para el animador: qué se conserva y qué se rehace
- **Se conservan tal cual (render ya hecho):** planos 1, 3, 4 y 5. No cambian ni imagen ni cámara; solo cambia la pista de voz si el Editor regraba.
- **Se rehace solo la capa 2D del plano 2:** el cronómetro pasa de «10:00» a «5:00» (rojo) y la tarjeta de «Minuto 10» a «Minuto 5». El karateka renderizado (cara de sufrimiento, sudor, temblor) se reutiliza sin tocar. El «ding» se conserva. Si el cronómetro estaba pegado al render, re-renderizar solo ese plano (2 s).
- **Se rehace el plano 6 (nuevo):** pose seiza y cámara del plano 1, cara de sonrisa serena (ya posible con `k.cara`). Se puede reutilizar el clip del plano 1 con la cabeza ladeada; no hace falta pose nueva.
- **Se descartan:** el plano 6 de v1 (hormigueo, tambaleo, puntos rojos, zumbido eléctrico) y el plano 7 de v1 (de pie señalando el hueco). Con ello ya no hacen falta `seiza-alto`, `en-cuclillas-medio`, `levantarse-vacilando` ni la pose de manos a las rodillas.
- Duración: 14,5 s (v1: 14,0 s). El plano 6 se alarga porque la pregunta es más larga.

## Necesidades de sonido
- Voz de sempai: 29 palabras. Regrabar todo el audio (cambia el plano 2 y el 6; las demás frases se reutilizan si el Editor corta la pista). Pronunciar «seiza» (sei-za), «mokusō» (mo-ku-so larga), «mokusō yame» (ya-me).
- SFX: «ding» (plano 2) y respiración grave (plano 4), ya hechos. Se elimina el zumbido eléctrico. Sin risas grabadas.

## Datos usados (todos deben estar en el dosier)

| Dato en el reel | Dónde está en `dosier.md` |
| --- | --- |
| Seiza (正座) = sentarse correctamente | «Datos verificados» (gojuryu.net; media) |
| Mokusō (黙想) = meditación en silencio, con la respiración | «Datos verificados» (gojuryu.net, Columbia JKA; media) |
| «Mokusō yame» = fin de la meditación, se abren los ojos | «Datos verificados» (gojuryu.net, Columbia, UNC; media) |
| Seiza y mokusō al abrir y cerrar la clase (la pregunta final se apoya en que se hace al acabar) | «Datos verificados» (UNC, Columbia, JKA 2022) |
| «Minuto 1 / minuto 5» | Gag, no dato: no se afirma ninguna duración |

Eliminado respecto a v1: el dato del hormigueo (NINDS). El reel ya no depende de esa fuente.
Respetado: no se dice que mokusō «vacíe la mente» ni que dé calma como efecto probado (la «calma» solo aparece dentro de la pregunta a la audiencia, no como afirmación); no se nombra la orden de levantarse; sin consejos médicos.

## Pendiente para el Sensei
- Ningún dato nuevo necesario.
- Comprobar `poses/seiza.json` del karateka (el README no la lista), igual que en v1; si los planos 1, 3, 4 y 5 ya están renderizados, ya está resuelto.
