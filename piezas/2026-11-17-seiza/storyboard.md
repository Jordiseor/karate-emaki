# Storyboard: Seiza, minuto 1 contra minuto 10
Duración total: 14,0 s · Pilar: Anécdotas y humor del dōjō · Formato: 1080×1920 · 3D · 7 planos · bucle suave

- Id: 2026-11-17-seiza · Guionista · 2026-11-18 · Parte de `encargo.md` y `dosier.md`. Publicación prevista: sáb 28 nov.
- Voz: sempai tranquilo, «todos hemos pasado por ahí». **26 palabras** de voz (3+3+4+4+2+7+3), unos 1,9 palabras/s. Arranca a 0,0 s.
- Texto en pantalla: una tarjeta a la vez, ≤6 palabras, ≥48 px, tinta #1A1A1A sobre papel. Rojo #C8102E solo para el dato clave (hormigueo) y el «minuto 10».
- Chiste: un mismo karateka, la misma postura, la misma cámara; solo cambia la cara y el reloj. Se ríe de la situación (el tiempo se estira), nunca del karate ni de nadie. Sin aviso médico en pantalla (el «si duele de verdad, para» va solo en el copy, si Marketing lo quiere).
- Voz para levantarse: por decisión de Jorge se usa «mokusō yame». Ojo con el dosier: confirma que «mokusō yame» es el fin de la meditación (se abren los ojos), no que sea la orden de levantarse. Por eso la tarjeta lo traduce como «fin de la meditación» y el karateka se levanta *después*, sin afirmar nada más. No sale «Naore» ni «Kiritsu».

## Gancho (0–2,0 s)
Fotograma 0, sin presentación: karateka en seiza, sonrisa grande, cronómetro «1:00». Voz y tarjeta a 0,0 s: «Seiza, minuto uno.» Corte seco a 2,0 s al minuto 10.

## Plano a plano

| # | Tiempo | Imagen (3D) | Cámara | Locución / sonido | Texto en pantalla |
| --- | --- | --- | --- | --- | --- |
| 1 | 0,0–2,0 s | Karateka (cinturón naranja) en seiza, espalda recta, manos en los muslos. Sonrisa 0,8, cejas altas, parpadeo tranquilo. Cronómetro 2D «1:00». | Frontal cuerpo entero, fija, `fov 26`. | Voz: «Seiza, minuto uno.» (0,0 s). Ambiente suave de dōjō. | «Seiza. Minuto 1.» (0,0 s) |
| 2 | 2,0–4,0 s | **Corte seco, mismo encuadre.** Mismo karateka, misma pose: ceño (cejas −1), ojos muy abiertos, sonrisa torcida, gota de sudor, temblor mínimo en hombros. Cronómetro «10:00» en rojo. | Idéntica al plano 1 (el corte es el chiste). | Voz: «Seiza, minuto diez.» (2,0 s). Un «ding» seco de reloj en el corte. | «Seiza. Minuto 10.» (rojo en «Minuto 10») |
| 3 | 4,0–6,0 s | Vuelve la calma: el karateka respira y sonríe sereno. Aparece el kanji 正座 pequeño a un lado. | Giro lento de cámara a 3/4 (azimut 0 → 35°) para ver las rodillas y los talones. | Voz: «Seiza significa sentarse correctamente.» (4,0 s) | «Seiza (正座): sentarse correctamente» |
| 4 | 6,0–8,0 s | Mismo karateka, ojos cerrados, pecho que sube y baja despacio dos veces. Silencio. 黙想 pequeño. | Primer plano de tronco y cara, empuje lento (zoom 1,0 → 1,12). | Voz: «Mokusō: meditar en silencio.» (6,0 s). Respiración grave de fondo. | «Mokusō: silencio y respiración» |
| 5 | 8,0–9,5 s | Abre los ojos de golpe (parpadeo 1 → 0, ojos muy abiertos), alivio, hombros que caen. | Corte a frontal de medio cuerpo, fija. | Voz algo más alta: «¡Mokusō yame!» (8,0 s). | «Mokusō yame: fin de la meditación» |
| 6 | 9,5–12,5 s | Intenta levantarse y las piernas «hormiguean»: tambaleo cómico, manos a las rodillas. Puntos rojos que parpadean sobre muslos y pantorrillas. Al cabo de 2 s se endereza, los puntos se apagan y el karateka sonríe de alivio. | Frontal cuerpo entero, se aleja un poco (distancia 7 → 8). | Voz: «Hormigueo: presión sobre un nervio. Se pasa.» (9,6 s). Zumbido eléctrico suave que se apaga. | «Hormigueo = presión sobre un nervio» (rojo, dato clave) |
| 7 | 12,5–14,0 s | De pie, el karateka mira a cámara y señala con la palma abierta hacia abajo; detrás, el hueco del seiza. En el último medio segundo vuelve a su sitio en seiza sonriendo (enlaza con el fotograma 0). | Frontal cuerpo entero, fija; llega exacta al plano 1. | Voz: «¿Cuánto aguantas tú?» (12,6 s). Corte limpio. | «¿Cuánto aguantas tú?» |

## Bucle
El último fotograma (14,0 s) repite la imagen del fotograma 0 (seiza, sonrisa, «1:00»): al repetirse parece que empieza otra clase. Sin cola de música.

## Cierre y llamada a comentar
Remate: el hormigueo es presión sobre un nervio y se pasa (plano 6). Cierre: «¿Cuánto aguantas tú?» (plano 7). La invitación a comentar completa («¿Cuántos minutos aguantas tú en seiza?») va en el copy.

## Necesidades 3D (lo que falta en `animacion/3d/`)
Mirado: `animacion/3d/README.md` (tabla de poses y de cara). No he listado `poses/`.
1. **Pose `seiza` del karateka**: el encargo dice que existe en `poses/`, pero el README **no la lista** (solo `maestro-seiza-pincel`, que es del maestro). Comprobar que está y que sirve para `Karateka3D` normal con cinturón naranja. Si no, pedirla al Modelador 3D.
2. **Transición de levantarse** (faltan): `seiza-alto` (de rodillas, tronco erguido, talones libres), `en-cuclillas-medio` y `levantarse-vacilando` (piernas algo flexionadas y manos a las rodillas). Con `mezclar` seiza → neutra puede valer como plan B, pero las piernas se atravesarían.
3. **Pose de manos a las rodillas** (cuerpo ligeramente inclinado) para el tambaleo del plano 6.
4. **Caras** ya posibles con `k.cara`: sonrisa 0,8; sufrimiento (cejas −1, `ojos` 1, `torcida` 0,6); ojos cerrados (`parpadeo` 1 sostenido); alivio. Comprobar que `ojos`/`torcida` combinan bien. No hace falta cara nueva.
5. **Temblor y tambaleo** por código determinista (función de `t`), sin pose nueva.
6. **Overlays 2D**: cronómetro «1:00» / «10:00», gota de sudor, puntos rojos de hormigueo sobre las piernas (anclar con `k.punto('rodillaI/D')`, `'tobilloI/D'`), kanji 正座 y 黙想 pequeños (comprobar en `H2.kanji`).
7. **Escenario**: dōjō cálido existente; suelo `tatami` o madera, el mismo en todos los planos. Sin escenario nuevo.
8. **Cámaras**: frontal fija, 3/4 con giro lento y empuje a tronco, todo con la misma escena (sin cambiar de escenario, para ahorrar render).

## Necesidades de sonido
- Voz de sempai: 26 palabras. Pronunciar «seiza» (sei-za), «mokusō» (mo-ku-so larga) y «mokusō yame» (ya-me).
- SFX: «ding» de reloj en el corte (plano 2), respiración grave (plano 4), zumbido eléctrico suave que se apaga (plano 6). Sin risas grabadas. Música muy suave o ninguna.

## Datos usados (todos deben estar en el dosier)

| Dato en el reel | Dónde está en `dosier.md` |
| --- | --- |
| Seiza (正座) = sentarse correctamente | «Datos verificados» (gojuryu.net; media) |
| Mokusō (黙想) = meditación en silencio, con la respiración | «Datos verificados» (gojuryu.net, Columbia JKA; media) |
| «Mokusō yame» = fin de la meditación, se abren los ojos | «Datos verificados» (gojuryu.net, Columbia, UNC; media) |
| Hormigueo = presión sostenida sobre un nervio; desaparece al aliviarla | «Datos verificados» (NINDS vía BrainFacts; alta) |
| El tiempo se hace largo en seiza | Situación universal del humor, sin cifra: las tarjetas «minuto 1 / minuto 10» son la gracia, no un dato |

Respetado: no se dice que mokusō «vacíe la mente»; no se nombra la orden de levantarse (dosier, «Lo que NO se puede afirmar»); no hay consejos médicos ni afirmaciones sobre las rodillas; no se dice que el seiza sea obligatorio ni igual en todos los dōjō.

## Pendiente para el Sensei
- Confirmar con Jorge que le vale que «mokusō yame» se use como momento de alivio previo a levantarse, tal como queda (el dosier no lo da como orden de levantarse).
- Comprobar si existe `poses/seiza.json` para el karateka (el README no la lista).
- Ningún dato nuevo necesario.
