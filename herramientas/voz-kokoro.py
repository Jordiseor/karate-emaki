#!/usr/bin/env python3
"""Locución con Kokoro v1.0 (Apache 2.0) vía sherpa-onnx, en la nube y sin GPU, + mezcla sobre final/reel-v2.mp4.

Voz elegida por Jorge el 16 nov 2026: em_santa (sid 53), hombre, español.
Instalación (releases de GitHub, ~380 MB), en KOKORO_DIR (por defecto /tmp/kokoro):
  sherpa-onnx-v1.12.15-linux-x64-shared.tar.bz2  (github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.15/)
  kokoro-multi-lang-v1_0.tar.bz2                 (github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/)
Uso: python3 herramientas/voz-kokoro.py <pieza> [--sid 53] [--velocidad 1.0 | 1.3,1.3,1.2,...] [--sin-mezcla]
--velocidad admite un valor por frase separado por comas. Zenkutsu v2: ver piezas/<id>/voz/LEEME-kokoro.txt.
Frases: las de herramientas/voz-chatterbox.py (grafía adaptada); inicios: final/locucion-v2.txt.
Salida: piezas/<id>/voz/v2-fNN.wav y final/reel-v2-voz.mp4 (cadena y ducking de herramientas/voz.py)."""
import argparse, importlib.util, os, re, subprocess as sp, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def _mod(nombre, fichero):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(RAIZ, 'herramientas', fichero))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
voz = _mod('voz', 'voz.py')
PIEZAS = _mod('voz_chatterbox', 'voz-chatterbox.py').PIEZAS


def kokoro(d, sid, vel, texto, out):
    k, b = f'{d}/kokoro-multi-lang-v1_0', f'{d}/sherpa-onnx-v1.12.15-linux-x64-shared'
    env = dict(os.environ, LD_LIBRARY_PATH=f'{b}/lib')
    voz.run([f'{b}/bin/sherpa-onnx-offline-tts', f'--kokoro-model={k}/model.onnx', f'--kokoro-voices={k}/voices.bin',
             f'--kokoro-tokens={k}/tokens.txt', f'--kokoro-data-dir={k}/espeak-ng-data', '--kokoro-lang=es',
             f'--kokoro-length-scale={1 / vel:.3f}', '--num-threads=2', f'--sid={sid}', f'--output-filename={out}', texto], env=env)


def frase_wav(d, sid, vel, texto, out, tmp):
    """Kokoro -> recorte de silencios -> cadena cálida -> -16 LUFS -> limitador (igual que voz.py)."""
    raw, pre = f'{tmp}/raw.wav', f'{tmp}/pre.wav'
    kokoro(d, sid, vel, texto, raw)
    rec = ('silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03,areverse,'
           'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse')
    voz.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', rec + ',' + voz.CADENA, '-ar', '48000', pre])
    i, _ = voz.lufs(pre)
    voz.run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af',
             f'volume={voz.LUFS_OBJ - i:.2f}dB,alimiter=limit={voz.PICO_MAX}:level=disabled,afade=t=in:d=0.01,'
             f'afade=t=out:st={max(voz.dur(pre) - 0.06, 0):.3f}:d=0.05', '-ar', '48000', '-c:a', 'pcm_s16le', out])


def inicios(pieza):
    ts = []
    for l in open(f'{RAIZ}/piezas/{pieza}/final/locucion-v2.txt', encoding='utf-8'):
        m = re.match(r'\s*([\d.,]+)\s*\|\s*(.+)', l)
        if m and '(silencio)' not in m.group(2):
            ts.append(float(m.group(1).replace(',', '.')))
    return ts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pieza', choices=sorted(PIEZAS))
    ap.add_argument('--sid', type=int, default=53)
    ap.add_argument('--velocidad', default='1.0', help='un valor o uno por frase separados por comas')
    ap.add_argument('--dir', default=os.environ.get('KOKORO_DIR', '/tmp/kokoro'))
    ap.add_argument('--fondo-db', type=float, default=-7, help='ganancia del fondo de reel-v2 (ya trae música a ≈-15 LUFS)')
    ap.add_argument('--sin-mezcla', action='store_true')
    a = ap.parse_args()
    voz.FONDO_DB = a.fondo_db
    p, frases, ini = a.pieza, PIEZAS[a.pieza], inicios(a.pieza)
    if len(ini) != len(frases):
        sys.exit(f'{len(frases)} frases y {len(ini)} inicios en locucion-v2.txt: no cuadran')
    base = f'{RAIZ}/piezas/{p}/final/reel-v2.mp4'
    total = voz.dur(base)
    os.makedirs(f'{RAIZ}/piezas/{p}/voz', exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        vels = [float(v) for v in a.velocidad.split(',')]
        vels += [vels[-1]] * (len(frases) - len(vels))
        wavs = []
        for (fid, texto, _), vel in zip(frases, vels):
            w = f'{RAIZ}/piezas/{p}/voz/v2-{fid}.wav'
            frase_wav(a.dir, a.sid, vel, texto, w, tmp)
            wavs.append(w)
        plan, fin = voz.planificar(wavs, ini, total)
        for (fid, texto, _), (s, e, des) in zip(frases, plan):
            print(f'  {fid} {s:5.2f}-{e:5.2f} s  desfase {des:+.2f}{"  <-- REVISAR" if des > voz.DESFASE_MAX else ""}  «{texto}»')
        print(f'  la voz acaba en {fin:.2f} s; el reel dura {total:.2f} s')
        if fin > total:
            print('  AVISO: la voz se pasa del final del reel: sube --velocidad')
        if not a.sin_mezcla:
            voz.mezclar(base, wavs, plan, total, tmp, f'{RAIZ}/piezas/{p}/final/reel-v2-voz.mp4')


if __name__ == '__main__':
    main()
