# Storyboard: El kiai gallo
Duración total: 9,0 s · Pilar: Anécdotas y humor del dōjō · Formato: 1080×1920 · 3D · 6 planos · bucle perfecto

- Id: 2026-11-12-kiai-gallo · Guionista · 2026-11-13 · Parte de `encargo.md` y `dosier.md`.
- Voz: sempai cercano (la de la presentación), ≈2,6 palabras/s. **9 palabras** de voz en total (3 + 5 + 1). Arranca a 0,0 s.
- Texto en pantalla: una tarjeta a la vez, ≤5 palabras, nunca idéntica a la voz. Rojo #C8102E solo para el kiai y el dato clave (hara).
- **Chiste distinto al de la presentación.** Allí el gallo era un guiño suelto y el resto miraba de reojo. Aquí el gallo es el clímax de una **ronda** de cuatro kiais limpios, y la reacción es la contraria a la burla: los cinco, también el del gallo, se llevan la mano al vientre a la vez, como comprobando el hara. Nadie mira a nadie, nadie es el torpe; la situación (el gallo traicionero) es lo gracioso, y el remate educa.
- Reutiliza: karateka, fila de 5 (`crearFila`), poses `yoi` y de golpe, `cara` (kiai / gallo / sorpresa) de la presentación, dōjō cálido. Comprobar en `animacion/3d/` qué hay exactamente (no lo he podido listar).

## Gancho (0–1,6 s)
Fotograma 0: fila de 5 karatekas en yoi, serios, mirando al frente, sin texto. A 0,1 s entra la tarjeta y la voz: «¡Ronda de kiai!». Nada de presentación.

## Plano a plano

| # | Tiempo | Imagen | Cámara | Locución / sonido | Texto en pantalla |
| --- | --- | --- | --- | --- | --- |
| 1 | 0–1,6 s | Fila de 5 karatekas en yoi, cinturones de colores distintos, mismo gesto serio. Respiran a la vez (hombros suben y bajan una vez). | Frontal medio de la fila, fijo, `fov 26`. | Voz: «¡Ronda de kiai!» (0,0 s). Ambiente suave de dōjō. | «RONDA DE KIAI» (0,1 s) |
| 2 | 1,6–3,6 s | Cascada de izquierda a derecha, uno cada 0,5 s: cada karateka da un golpe al frente (puño) con boca abierta, y vuelve a yoi. Los cuatro primeros, limpios; la bocanada de cada uno dibuja un destello rojo corto. | Mismo plano; sin corte. | SFX Sonido: 4 kiais limpios, graves, a 1,7 / 2,2 / 2,7 / 3,2 s. Sin voz. | «¡KIAI!» (pulsa en cada golpe, rojo) |
| 3 | 3,6–4,8 s | El quinto da el golpe: empuje rápido a su cara. Cejas arriba, boca a medio abrir, el bocadillo del kiai se quiebra en zigzag hacia arriba y se escapa hacia el techo. Cara de sorpresa, no de culpa. | Empuje a su cara (`fov 26` → plano cercano) en 0,4 s, corte en seco al gallo. | SFX Sonido: **gallo** (kiai que arranca grave y se escapa agudo, ≈0,7 s) a 3,8 s. Sin voz. | «¡Ki-ai-iii…!» (la última sílaba tiembla) |
| 4 | 4,8–6,0 s | Silencio de un latido. Plano de la fila: los cuatro primeros giran la cabeza hacia él con cara amable y, los cinco a la vez, se llevan la mano abierta al bajo vientre, como quien comprueba algo. El quinto también, y se le escapa media sonrisa. | Vuelve al frontal de la fila, fijo. | Sin voz. SFX: un «ñic» suave de gallinero muy bajo (opcional) y silencio de dōjō. | «Nos pasa a todos» |
| 5 | 6,0–8,2 s | Primer plano de las cinco manos abiertas sobre el abdomen y un punto rojo que se enciende en el bajo vientre del quinto. Desde ese punto sale una onda roja hacia arriba hasta la boca. Kanji 気合 pequeño, de adorno, a un lado. | Picado suave y empuje lento al abdomen (zoom 1,0 → 1,15). | Voz: «El kiai sale del hara.» (6,1 s). Respiración profunda de fondo. | 6,0 s: «hara = bajo vientre» (rojo en «hara») → 7,2 s: «Así se enseña» · 気合 «ki = energía» pequeño |
| 6 | 8,2–9,0 s | Los cinco bajan las manos y se enderezan a yoi, serios, mirando al frente: **mismo encuadre y pose que el fotograma 0**. Sin texto en los últimos 0,2 s. | Retrocede al frontal medio de la fila (`fov 26`), llega exacto al fotograma 0. | Voz baja: «¿Otra?» (8,3 s). Corte limpio al silencio. | «¿Otra?» (se apaga a 8,8 s) |

## Bucle
El último fotograma (9,0 s) es idéntico al fotograma 0: fila de 5 en yoi, mismos cinturones, misma respiración, sin texto ni voz. La pregunta «¿Otra?» de voz y texto enlaza con «¡Ronda de kiai!» del inicio: al repetirse, parece la siguiente ronda. El audio cierra con silencio de 0,15 s y el primer plano arranca con la voz a 0,0 s, sin cola de música.

## Cierre y llamada a comentar
El remate es el plano 5 («El kiai sale del hara», con «hara = bajo vientre» y «Así se enseña») y el 6 devuelve al bucle con «¿Otra?». La llamada a comentar va en el copy, no en pantalla.

## Necesidades 3D
1. **Fila de 5 karatekas** con cinturones de colores distintos, pose `yoi` idéntica en fotograma 0 y 9. Existe (`crearFila`); comprobar que admite 5 con cinturones variados.
2. **Pose de golpe al frente** (gyaku-zuki u oi-zuki) con boca abierta, que se pueda escalonar por karateka (retardo 0,5 s). En la presentación faltaba; plan B: `zenkutsu-dachi` con boca abierta, o puño al frente desde yoi.
3. **Caras**: kiai limpio, «gallo» (cejas altas, boca a medio abrir asimétrica, sorpresa sin culpa), sonrisa tímida. Existen en la presentación; reutilizar.
4. **Giro de cabeza** de los cuatro hacia el quinto y **mano al bajo vientre** (pose de brazo nueva, probablemente falta).
5. **Overlays 2D**: bocadillo «KIAI» que se quiebra en zigzag, destello rojo, punto rojo en el abdomen con onda hasta la boca, kanji 気合 pequeño (comprobar en `H2.kanji`).
6. Plano cercano del abdomen y de la cara con la misma cámara de la fila (sin cambiar de escena, para ahorrar render).

## Necesidades de sonido
- **Kiai limpio** ×4, graves y cortos (≈0,3 s), con ligera variación entre ellos.
- **Kiai gallo**: arranca grave como los otros y se escapa agudo (≈0,7 s). Sintetizado; que sea cómico sin ser burla (nada de risas grabadas).
- Voz de sempai (sharvard hombre): «¡Ronda de kiai!» · «El kiai sale del hara.» · «¿Otra?» (9 palabras de voz; «Nos pasa a todos» va solo en pantalla). Pronunciar «hara» con a corta.
- Respiración grave en el plano 5 y silencio de dōjō en el 4. Sin música o música muy suave, sin cola, para que el bucle no se note.

## Para el copy (Marketing)
- Pregunta de comentarios: «¿A quién le ha salido un gallo en pleno kiai?» (sin burla; todos los nuestros han pasado por ahí).
- Primer comentario con el matiz: «Se enseña a lanzar el kiai desde el hara (bajo vientre), no solo desde la garganta. Fisiológicamente la voz siempre pasa por la laringe: es una imagen de enseñanza.» No atribuir la frase a Funakoshi, Nakayama ni la JKA.
- «Gallo» es el nombre del chiste de la cuenta, no un término del karate.
- Hashtags sugeridos: #karate #shotokan #kiai #humordojo #karateemaki.

## Datos usados (todos deben estar en el dosier)

| Dato en el reel | Dónde está |
| --- | --- |
| El kiai se enseña como un sonido que arranca del hara (bajo vientre), no solo de la garganta | `dosier.md`, «Respuesta corta» y «Frase de remate» (Shuriway, Aikido Journal; fiabilidad media) |
| hara = bajo vientre; ki = energía | `dosier.md`, «Datos verificados» y «Ángulo recomendado» |
| A todos se nos escapa el gallo cuando gritamos nervioso | `dosier.md`, «Nota de tono» (situación universal, sin dato) |
| Gallo = voz que se escapa aguda | `dosier.md`, «"Gallo"» (acepción DLE **sin verificar**: pendiente que Sensei o Jorge comprueben dle.rae.es/gallo) |

Matiz respetado: la pieza dice «sale del hara» y «así se enseña» (imagen de enseñanza), nunca «la garganta no se usa».

## Pendiente para el Sensei
- Comprobar la acepción de «gallo» en dle.rae.es/gallo (el dosier no pudo abrirla).
- Ningún dato nuevo necesario.
