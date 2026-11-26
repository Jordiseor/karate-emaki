# Notas del interactivo (2026-11-23-puntua-o-no)
- `index.html` autocontenido (CSS, JS y copia embebida de `situaciones.json`; sin CDN ni red ni almacenamiento). 5 vistas: portada, situación x10 (con paso «¿Cuántos?» 1-2-3 si el "Sí" es correcto), respuesta (✓/✗ + veredicto + explicación + chip de artículo, en el mismo sitio), resultado (x/10, título, fallos reabribles) y compartir/cierre (Web Share o copiar con «Copiado»). Aviso fijo en el pie, texto >= 18 px (salvo el aviso, 14 px), botones >= 48 px, `prefers-reduced-motion` (sin animaciones ni clip).
- Imágenes: `img/sit-NN.webp`, `s1.webp`, `s2.webp` (780x900), más `img/portada.webp` y `img/rei.webp` (vistas 1 y 4; hechas por el Animador el 26 nov). Si no cargan se ve un marcador de papel con el número. Clip opcional: rellenar `"clip":"img/sit-NN.mp4"` en el JSON (y en la copia embebida).
- Pruebas (Playwright, Chromium, 390x844 y 1280x800): 0 errores de consola (ignorando imágenes aún ausentes), sin scroll horizontal, recorrido completo, y con S1/S2 activas. Capturas en `capturas/`.

## Activar S1 / S2
Las pendientes de cotejo son los juegos 7 y 8 (n.º 5 y 7 del dosier, «Art. 8.11» sin letra, chip con borde discontinuo). Si no se coteja: poner `"activa": false` en `07` y/o `08` y `"activa": true` en `S1` (orden 7) y/o `S2` (orden 8). Hay que cambiarlo en `situaciones.json` Y en la copia embebida (`<script id="datos">` de index.html). Si entra solo una, desactivar solo una pendiente: el quiz usa las situaciones activas, ordenadas por `orden`, y el contador se adapta (N/10 o N/9...). Con ambas, S2 trae botones Aka/Ao/Nadie (reparto 6 sí / 4 no, decisión del Sensei).
- Tras cotejar 8.11 a y f: cambiar `articulo` de 07 y 08 a «Art. 8.11 a» y «Arts. 8.8 y 8.11 f», quitar `"pendiente":true`.

## Pendientes
- Imágenes finales (sit, s1, s2, portada, rei). Revisar que encajan con el rótulo Aka/Ao de las esquinas.
- Efecto de la respuesta: insignia «+n» / «✗ 0» sobre la imagen (no hay halo/cruz animados 3D).
- Texto de la situación 1 añade «(puñetazo de la mano contraria)» y 2 «(patada circular)» como glosa: no está en el storyboard; quitar si el dosier no la respalda.
- Texto 8: «2 cm» (el storyboard decía «≤ 2 cm»).
