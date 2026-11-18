// Ayudas COMUNES de la pieza tiempo-contacto. Los animadores de tramo NO lo editan (si falta algo, lo dibujan en su plano y lo apuntan en plan.md).
// Uso:  <script src="../../../../animacion/marca.js"></script> + <script type="module"> import * as C from './comun.js'; … </script>
import { crearEscenario, util as U } from '../../../../animacion/3d/escenario.js';
import { Karateka3D, cargarPoses, mezclar, espejo } from '../../../../animacion/3d/karateka3d.js';
import { Diagrama3D } from '../../../../animacion/3d/diagrama3d.js';
import { overlay } from '../../../../animacion/3d/overlay2d.js';
import { crearAlmohadilla, crearChoque } from '../../../../animacion/3d/ciencia3d.js';
import * as K from '../../../../animacion/3d/ciencia2d.js';   // cronometro, contadorVelocidad, ejes, curva, morfosis, columnas, regla
import * as H2 from '../../../../animacion/3d/historia2d.js'; // kanji (plano 13)
export { U, mezclar, espejo, overlay, Karateka3D, Diagrama3D, crearAlmohadilla, crearChoque, K, H2 };

export const ROJO = '#C8102E', TINTA = '#1A1A1A', PAPEL = '#F4EFE6', GRIS = '#8A847A', AZUL = '#2F3E5C';

// Escenario (dōjō, escala 0,5 SIEMPRE) con DOS karatekas idénticos (cinturón negro) a ±3 m en X, rumbo 90 (miran a la derecha de pantalla),
// cada uno con su almohadilla delante (colocada donde llega su mano con la pose final). Lados: S.lados = [izq, der].
// izq = golpe (kime): gyaku-zuki-kiai. der = empuje: empuje-recto. Ambos parten de zenkutsu-dachi (mismas piernas: los pies no deslizan).
export function iniciar() {
  const ctx = document.getElementById('c').getContext('2d');
  const esc = crearEscenario({ escala: 0.5 });
  esc.escena.fog.near = 20; esc.escena.fog.far = 70;
  const P = cargarPoses();
  const mk = (x, final, cara) => {
    const k = new Karateka3D({ cinturon: 'negro' }); esc.escena.add(k.raiz); k.colocar(x, 0, 90);
    const pad = crearAlmohadilla({ altura: 1.1 }); esc.escena.add(pad.raiz);
    k.aplicarPose(final); pad.colocar(0, 0, -90).hundir(0).pegarA(k, 'manoD');
    return { k, pad, x, final, cara, padX: pad.raiz.position.x, padY: pad.raiz.position.y, padZ: pad.raiz.position.z };
  };
  const izq = mk(-3, P['gyaku-zuki-kiai'], { grito: 0.5, cejas: -0.6 });
  const der = mk(3, P['empuje-recto'], { sonrisa: 0.1, cejas: -0.2 });
  return { ctx, esc, P, lados: [izq, der], izq, der, U };
}

// Cámara de una mitad (perfil, personaje + almohadilla en media pantalla 540×1920). Distancia 12,5 m: caben −0,5…+1,0 m en cada mitad.
// `centro[0]` = punto del personaje que queda en el centro de SU mitad (0,25 = entre la espalda y la almohadilla).
export const CAM = { lado: { centro: [0.25, 1.1, 0], distancia: 12.5, azimut: 0, elevacion: 3, fov: 26 } };
export function camLado(esc, L, c = CAM.lado, i = L.x < 0 ? 0 : 1) {
  esc.sombraEn(L.x, 0);
  const px = 1920 / (2 * c.distancia * Math.tan(c.fov * Math.PI / 360)), dx = (i === 0 ? 1 : -1) * 270 / px;   // centra en su mitad (270 / 810 px)
  esc.orbita({ ...c, centro: [L.x + c.centro[0] + dx, c.centro[1], c.centro[2] || 0] });
}

// Pantalla partida: para cada mitad (0 izq, 1 der) llama antes(L, i) [pose, almohadilla…], pone su cámara, renderiza SOLO esa mitad
// (ctx.clip a 540 px) y llama despues(ctx, L, i) [rastros, flechas 2D con esc.proyectar]. Luego dibuja la línea divisoria.
// 2 renders por fotograma: ≈ el doble de coste. `partir: 0.5` mueve la línea; `linea` false la quita.
export function mitades(S, { antes, despues, cam = CAM.lado, linea = true, x = 540 } = {}) {
  const { ctx, esc, lados } = S;
  lados.forEach((L, i) => {
    antes && antes(L, i);
    camLado(esc, L, cam, i);
    ctx.save(); ctx.beginPath(); ctx.rect(i === 0 ? 0 : x, 0, i === 0 ? x : 1080 - x, 1920); ctx.clip();
    esc.dibujar(ctx, {});
    despues && despues(ctx, L, i);
    ctx.restore();
  });
  if (linea) { ctx.save(); ctx.fillStyle = PAPEL; ctx.fillRect(x - 6, 0, 12, 1920); ctx.fillStyle = TINTA; ctx.fillRect(x - 2, 0, 4, 1920); ctx.restore(); }
}

// Rastro rojo (cola que se estrecha) de un punto del karateka. Misma cola/grosor en ambos lados. Llamar DENTRO de `despues` de mitades.
export function rastro(ctx, esc, k, poseEn, t, { punto = 'manoD', cola = 0.45, n = 16, alfa = 1, grosor = 16 } = {}) {
  const desde = Math.max(-9, t - cola), pts = [];
  for (let i = 0; i <= n; i++) { k.aplicarPose(poseEn(desde + (t - desde) * i / n)); pts.push(esc.proyectar(k.punto(punto))); }
  k.aplicarPose(poseEn(t));
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = ROJO;
  for (let i = 1; i < pts.length; i++) { const q = i / pts.length; ctx.globalAlpha = alfa * q * 0.92; ctx.lineWidth = 4 + grosor * q; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.restore();
}

// ---- GANCHO (plano 1 y fotograma final del 14, el bucle). Misma curva de tiempo en los dos lados: el puño viene lanzado en t = 0 (f = 0,45)
// y llega a su almohadilla en t = 1,6 s. `t` → fotograma. Dibuja las dos mitades + rastro; el texto lo pone el plano.
export const gancho = {
  f: (t) => { const p = U.prog(t, 0, 1.6); return 0.45 + 0.55 * (0.5 * p + 0.5 * U.easeOut(p)); },
  hund: (t) => 0.1 * Math.sin(Math.PI * U.clamp(U.prog(t, 1.6, 2.0))),   // leve contacto al llegar (el plano 2 es el que muestra la diferencia)
};
export function poseGancho(P, i, f) { return mezclar(P['zenkutsu-dachi'], i === 0 ? P['gyaku-zuki-kiai'] : P['empuje-recto'], f); }
export function dibujarGancho(S, t, { alfaRastro = 1 } = {}) {
  const { P, esc } = S, f = gancho.f, h = gancho.hund(t);
  mitades(S, {
    antes: (L, i) => {
      L.k.aplicarPose(poseGancho(P, i, f(t))); L.k.cara(L.cara);
      L.pad.colocar(0, 0, -90).hundir(h);
      if (h > 0) L.pad.pegarA(L.k, 'manoD'); else L.pad.raiz.position.set(L.padX, L.padY, L.padZ);
    },
    despues: (ctx, L, i) => rastro(ctx, esc, L.k, (ti) => poseGancho(P, i, f(ti)), t, { alfa: alfaRastro * (1 - U.prog(t, 1.7, 2.0)) }),
  });
}

// ---- Texto
// Tarjeta arriba (y = 300; 250 px libres). t0 < 0 = ya visible. Rojo solo con [r]…[/r] (golpe, flechas, datos clave).
export function tarjeta(ctx, t, lineas, o = {}) { overlay.tarjeta(ctx, t, Object.assign({ lineas, t0: 0.1, size: 84, y: 300 }, o)); }
// Letra pequeña inferior (48 px, dentro de la zona segura). Una sola a la vez.
export function letraPequena(ctx, txt) { overlay.letraPequena(ctx, txt); }
// Planos 7–12: «Modelo simplificado» (todo lo que no es dato medido). Letra pequeña inferior + etiqueta fija arriba a la derecha.
export function letraModelo(ctx, txt = 'Modelo simplificado') { overlay.letraPequena(ctx, txt); }
export function etiquetaModelo(ctx, { alfa = 1, y = 262 } = {}) {
  const t = 'MODELO SIMPLIFICADO'; ctx.save(); ctx.globalAlpha = alfa; ctx.font = '800 48px "Montserrat","Arial Black",system-ui,sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
  const w = ctx.measureText(t).width + 44, x = 1080 - 48;
  ctx.fillStyle = TINTA; ctx.beginPath(); ctx.roundRect(x - w, y, w, 72, 16); ctx.fill();
  ctx.fillStyle = PAPEL; ctx.fillText(t, x - 22, y + 38); ctx.restore();
}
