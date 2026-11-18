# Plan del reel de anuncio (14 s) — 2D cenital

Decisión: 2D vista cenital (más claro que 3D para ver el trazo). Suelo de madera dibujado, tarjetas de papel #F4EFE6, karateka de tinta sin rostro visto desde arriba. Rojo #C8102E solo en huellas, trazo, kiai e interrogante. Texto ≥48 px, dentro de la zona segura. Render determinista, sin audio. Fuentes en `src/` (`comun.js`: ruta, huellas, trazo, karateka cenital, tarjeta).

| Plano | s | Contenido | Texto | Locución |
| --- | --- | --- | --- | --- |
| 01 | 3,0 | Suelo vacío; entra el karateka (hachiji-dachi), gira 90° a la izquierda y sella la 1.ª huella roja (t=2,1 s: golpe de sonido) | ¿Qué dibuja esta kata? | «¿Sabías que Heian Shodan dibuja algo en el suelo?» |
| 02 | 3,0 | Pasos 1–9 en time-lapse (0,25 s/paso); destello rojo y «kiai» en el 9 (t=2,2 s) | 21 movimientos · rótulo «embusen» | «Veintiún movimientos… embusen.» |
| 03 | 3,0 | Pasos 10–17; las huellas se unen en trazo rojo continuo; kiai en el 17 (t≈2,0 s); final con círculo punteado y «?» | Dos kiai · rótulo «Parecido a una «I»» | «Visto desde arriba, el trazo se parece a una i.» |
| 04 | 3,0 | Móvil dibujado (vista de pasos): dedo toca «Siguiente» a 0,9 y 1,8 s; el karateka pasa del paso 1 al 3; botones ‹ › | Paso a paso, tú mandas. | «En el interactivo lo ves paso a paso…» |
| 05 | 2,0 | Trazo completo 1–17 con «?»; karateka en rei (cabeza adelante, vista cenital) en el punto de partida; botón | Enlace en el perfil | «Está en el enlace del perfil.» |

Total 14,0 s. Datos del dosier: 21 movimientos, kiai en 9 y 17, giros y técnicas 1–17 (mismos que el interactivo, `PASOS`). No se dibuja nada de 18–21 (ni giros ni pies).

## Avisos para el Sensei / Editor
- Forma: sigue las coordenadas `p:[x,y]` del interactivo (copiadas en `PXY` de `src/comun.js`): eje central de 3 pasos, travesaño ±1,25 abajo (1–6) y arriba (10–14), vuelta por el centro (15–17); ahora se lee como «I». Es una simplificación esquemática (distancias no están en ninguna fuente), pendiente del diagrama real (Best Karate 5 / sensei); si cambia el interactivo, actualizar `PXY`. El paso 1 gira sin desplazarse.
- El storyboard pedía karateka 3D; aquí es 2D de tinta (cenital). El «rei» visto desde arriba es poco legible.
- Plano 04 solo llega al paso 3 (el 4 es «sin paso»).
- Sin nada nuevo que subir a `animacion/`; candidatos: `karatekaArriba`, `suelo` de madera, `huellas`.
