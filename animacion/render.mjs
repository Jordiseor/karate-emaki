#!/usr/bin/env node
// KARATE EMAKI · renderizador común.
// Abre un HTML que define window.render(t) (t en segundos, determinista) en Chrome sin cabeza,
// captura cada fotograma y lo pasa a ffmpeg → MP4 1080×1920 H.264 (veryfast, yuv420p, sin audio).
//
// Uso:
//   node animacion/render.mjs <escena.html> --dur 5 [--fps 30] [--out clip.mp4] [--png centro.png]
//        [--t 2.5 --png captura.png]   (solo una captura en el instante t, sin vídeo)
//        [--congelar 0.5]              (repite el último fotograma N segundos dentro de la duración)
// El HTML puede fijar window.DURACION en lugar de --dur.
// Si la página tiene <canvas id="c">, se captura con canvas.toDataURL (rápido); si no, con captura de pantalla (SVG/DOM).
// Las poses de animacion/poses/*.json se inyectan como window.EMAKI_POSES antes de cargar la página.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = fs.existsSync('/usr/local/bin/ffmpeg') ? '/usr/local/bin/ffmpeg' : 'ffmpeg';
const CHROME = process.env.CHROME || (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const html = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
if (!html) { console.error('Falta el HTML. Uso: node render.mjs escena.html --dur 5 --out clip.mp4'); process.exit(1); }
const fps = Number(opt('fps', 30));
const out = opt('out', null), png = opt('png', null), tSolo = opt('t', null), congelar = Number(opt('congelar', 0));

const poses = {};
const dirPoses = path.join(AQUI, 'poses');
if (fs.existsSync(dirPoses)) for (const f of fs.readdirSync(dirPoses)) if (f.endsWith('.json')) poses[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dirPoses, f), 'utf8'));

const browser = await pw.chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[página]', m.text()); });
page.on('pageerror', (e) => { console.error('[error JS]', e.message); process.exitCode = 2; });
await page.addInitScript((p) => { window.EMAKI_POSES = p; }, poses);
await page.goto(pathToFileURL(path.resolve(html)).href);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => { if (window.preparar) await window.preparar(); });
const dur = Number(opt('dur', 0)) || (await page.evaluate(() => window.DURACION || 0));
if (!dur && tSolo == null) { console.error('Indica --dur o window.DURACION'); process.exit(1); }
const hayCanvas = await page.evaluate(() => !!document.getElementById('c'));

async function fotograma(t) {
  await page.evaluate((t) => window.render(t), t);
  if (hayCanvas) {
    const d = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
    return Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
  }
  return page.screenshot({ type: 'png' });
}

if (tSolo != null) {
  fs.writeFileSync(png || 'captura.png', await fotograma(Number(tSolo)));
  console.log('captura', png, 't =', tSolo);
} else {
  const n = Math.round(dur * fps), nCong = Math.round(congelar * fps), mitad = Math.floor(n / 2);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-an', '-movflags', '+faststart', out || 'clip.mp4'],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const fin = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));
  let ultimo = null; const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = i >= n - nCong && ultimo ? ultimo : await fotograma(i / fps);
    if (i === mitad && png) fs.writeFileSync(png, buf);
    ultimo = buf;
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await fin;
  console.log(`${out}: ${n} fotogramas (${dur}s a ${fps} fps) en ${((Date.now() - t0) / 1000).toFixed(1)} s` + (png ? `, centro → ${png}` : ''));
}
await browser.close();
