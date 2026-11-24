# Storyboard v2 · Cómo se puntúa el kumite (versión simple)

24 nov 2026 · Sensei. Jorge borró la v1 (publicada el 23 nov): la tarjeta «Espalda al rival: no puntúa» con aka pateando la espalda de ao daba a entender que una patada a la espalda no vale, y sí vale 2. Además, las patadas no le gustaron (cuerpos pegados, la pierna atravesaba) y todo iba atropellado. Pide algo más simple.

Reglas de esta versión: solo los 3 valores. Una idea por plano, planos de 3,5 s, voz pausada (≈1,8 palabras/s, velocidad 1,0, sin acelerar frases). Sin criterios, sin senshu, sin 5 cm, sin «espalda al rival». Datos: dosier, arts. 8.4 y 8.6 WKF 2026 y «Verificación 24 nov: zonas (espalda)».

Biblioteca: `kumite3d.js` «Kumite v2» (`crearTecnica(par, P, nombre)`, impacto en 0,7 s; cámara azimut −90, distancia 10,5, elevación 3, fov 26). AKA (cinturón rojo) SIEMPRE a la izquierda y AO (azul) a la derecha, también en el puñetazo. Cada técnica una sola vez, a velocidad real, con una pausa de 0,3 s en el impacto (sin cámara lenta). En el impacto aparece una cifra roja grande «+1 / +2 / +3» junto al punto tocado (anillo rojo fino sobre la zona, 0,6 s). Sin marcador acumulado.

| # | Tiempo | Imagen | Texto en pantalla | Locución |
| --- | --- | --- | --- | --- |
| 1 | 0,0–3,5 | Aka y ao en kamae, a distancia de kumite, quietos; respiran (vaivén leve). En t=0 ya está la tarjeta. | ¿Cuánto vale cada golpe? | «En kumite, ¿cuánto vale cada golpe?» |
| 2 | 3,5–7,0 | Aka: gyaku-zuki-chudan al pecho de ao (técnica empieza en 0,6 s del plano). «+1» rojo. Vuelta a kamae. | Puñetazo: 1 punto · (pequeño) yūko | «Un puñetazo: un punto. Yuko.» |
| 3 | 7,0–10,5 | Aka: mawashi-geri-chudan al costado de ao. «+2». | Patada al cuerpo: 2 · (pequeño) waza-ari | «Patada al cuerpo: dos puntos. Wasa ari.» |
| 4 | 10,5–14,0 | Ao está girado (`ao-de-espaldas`); aka: mawashi-geri-espalda. «+2». | Y a la espalda: 2 | «Y en la espalda, también dos.» |
| 5 | 14,0–17,5 | Aka: mawashi-geri-jodan a la cabeza de ao (sin tocar fuerte). «+3». | Patada a la cabeza: 3 · (pequeño) ippon | «Patada a la cabeza: tres puntos. Ippon.» |
| 6 | 17,5–21,5 | Los dos vuelven a yoi y hacen rei. Arriba, tres cifras rojas «1 · 2 · 3» y la pregunta. Letra pequeña: «Reglamento WKF 2026». Último fotograma cerca del plano 1 (bucle suave). | 1 · 2 · 3 / ¿Tu primer ippon? | «Uno, dos, tres. ¿Cuál fue tu primer ippon?» |

Textos ≥ 48 px (títulos ~84 px), dentro de la zona segura (250 px arriba, 350 abajo). Rojo #C8102E solo para cifras, anillo y «+N».

## Datos usados
- Tsuki/uchi a zona de puntuación = yūko 1; patada chūdan = waza-ari 2; patada jōdan = ippon 3 (art. 8.6, WKF 2026.01).
- Chūdan = cuerpo por encima de la pelvis hasta la clavícula (art. 8.4): incluye costado y espalda (lista expresa en WKF 2020, art. 6). Ninguna prohibición de patear la espalda (art. 9).
