#!/usr/bin/env python3
"""Locución sintética (Piper) + posproceso cálido + mezcla con ducking sobre final/reel-sin-voz.mp4.

Uso:
  python3 herramientas/voz.py <pieza> [--voz davefx|sharvard-m|sharvard-f] [--ritmo auto|1.0]
  python3 herramientas/voz.py --muestras            # 3 MP3 de prueba en audio/muestras/
Opciones: --tts DIR (por defecto /tmp/tts; se instala con herramientas/instalar-voz.sh),
          --noise-scale 0.6  --noise-w 0.8  --sin-mezcla (solo wavs por escena e informe)
<pieza> es el id completo o el slug (p. ej. zenkutsu-estabilidad).
Lee piezas/<id>/voz/guion-voz.json: {"duracion":30,"escenas":[{"n":1,"inicio":0,"texto":"..."}]}.
"ritmo" es el length_scale de Piper (1.0 = normal; <1 más rápido). Con "auto" se prueba de más lento a más rápido
hasta que todo encaje (desfase <= 0,5 s). Tope de velocidad: 0,87 (= 1,15x)."""
import argparse, glob, json, os, re, subprocess as sp, sys, tempfile
import numpy as np
from scipy.io import wavfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOCES = {'davefx': ('es_ES-davefx-medium', None),
         'sharvard-m': ('es_ES-sharvard-medium', 0),
         'sharvard-f': ('es_ES-sharvard-medium', 1)}
VOZ_DEFECTO = 'sharvard-m'
LUFS_OBJ = -16.0          # reel completo y cada escena de voz
PICO_MAX = 0.85           # -1,4 dBFS de margen antes de AAC (objetivo final <= -1 dB)
LS_AUTO = (1.06, 1.02, 0.98, 0.94, 0.90, 0.87, 0.87, 0.87)   # repetir 0,87: Piper es estocástico
LS_MIN = 0.87
DESFASE_MAX = 0.5
ENTRADA = 0.06            # la voz entra 0,06 s después del inicio de su escena
HUECO = 0.12              # pausa mínima entre frases
# Cadena de posproceso (tras remuestrear a 48 kHz)
CADENA = ('aresample=48000,highpass=f=70,'
          'equalizer=f=220:t=q:w=1.0:g=2,'            # calidez: graves-medios +2 dB
          'equalizer=f=7000:t=q:w=1.2:g=-2,'          # sibilancia: -2 dB en 6-8 kHz
          'deesser=i=0.3:m=0.5:f=0.5,'                # de-esser suave
          'acompressor=threshold=-22dB:ratio=2:attack=8:release=120:makeup=1.5')
# Ducking: el fondo sube 3 dB entre frases y la voz lo baja con sidechaincompress
FONDO_DB = 3
DUCK = 'threshold=0.015:ratio=1.7:attack=25:release=350:makeup=1'


def run(cmd, **kw):
    return sp.run(cmd, check=True, capture_output=True, **kw)


def dur(f):
    return float(sp.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))


def lufs(f, af=''):
    """Loudness integrada (LUFS) y true peak (dBFS) de un fichero."""
    r = sp.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', (af + ',' if af else '') + 'ebur128=peak=true', '-f', 'null', '-'],
               capture_output=True, text=True).stderr
    r = r[r.rfind('Summary'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', r).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r).group(1))


def piper(tts, voz, texto, ls, ns, nw, out):
    modelo, spk = VOCES[voz]
    cmd = [f'{tts}/piper/piper', '--model', f'{tts}/voces/{modelo}.onnx', '--length_scale', str(ls),
           '--noise_scale', str(ns), '--noise_w', str(nw), '--sentence_silence', '0.2', '--output_file', out]
    if spk is not None:
        cmd += ['--speaker', str(spk)]
    run(cmd, input=texto.encode())


def escena_wav(tts, voz, texto, ls, ns, nw, out, tmp):
    """Piper -> recorte de silencios -> posproceso cálido -> ganancia a -16 LUFS -> limitador."""
    raw = f'{tmp}/raw.wav'
    piper(tts, voz, texto, ls, ns, nw, raw)
    rec = ('silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03,areverse,'
           'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.05,areverse')
    pre = f'{tmp}/pre.wav'
    run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', rec + ',' + CADENA, '-ar', '48000', pre])
    i, _ = lufs(pre)
    g = LUFS_OBJ - i
    run(['ffmpeg', '-y', '-v', 'error', '-i', pre, '-af', f'volume={g:.2f}dB,alimiter=limit={PICO_MAX}:level=disabled,afade=t=in:d=0.01,afade=t=out:st={max(dur(pre)-0.06,0):.3f}:d=0.05',
         '-ar', '48000', '-c:a', 'pcm_s16le', out])


def metricas(f):
    """Medidas objetivas (no sustituyen a escuchar): centroide, sibilancia, calidez, ruido de fondo."""
    sr, x = wavfile.read(f)
    x = x.astype(np.float64) / (32768 if x.dtype == np.int16 else 1)
    if x.ndim > 1:
        x = x.mean(1)
    n = 2048
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::n // 2] * np.hanning(n)
    P = (np.abs(np.fft.rfft(fr, axis=1)) ** 2)
    fq = np.fft.rfftfreq(n, 1 / sr)
    e = P.sum(1)
    act = e > np.percentile(e, 30)                      # tramas con voz
    Pm = P[act].mean(0)
    banda = lambda a, b: Pm[(fq >= a) & (fq < b)].sum()
    cent = (fq * Pm).sum() / Pm.sum()
    # ruido: 5 % de tramas de 20 ms más bajas (RMS dBFS)
    h = int(sr * 0.02)
    rms = np.sqrt((x[:len(x) // h * h].reshape(-1, h) ** 2).mean(1)) + 1e-9
    return {'centroide_Hz': int(round(cent)), 'sibilancia_6-9k_dB': float(round(10 * np.log10(banda(6000, 9000) / Pm.sum()), 1)),
            'calidez_100-300_vs_2-5k_dB': float(round(10 * np.log10(banda(100, 300) / banda(2000, 5000)), 1)),
            'ruido_suelo_dBFS': float(round(20 * np.log10(np.percentile(rms, 5)), 1))}


def resolver(p):
    if os.path.isdir(f'{RAIZ}/piezas/{p}'):
        return p
    c = sorted(glob.glob(f'{RAIZ}/piezas/*-{p}'))
    if not c:
        sys.exit(f'No encuentro la pieza {p}')
    return os.path.basename(c[0])


def planificar(wavs, inicios, total):
    t, plan = 0.0, []
    for ini, w in zip(inicios, wavs):
        s = max(ini + ENTRADA, t + HUECO)
        t = s + dur(w)
        plan.append((s, t, s - ini))
    return plan, t


def muestras(a):
    frase = ('Empújame hacia delante. ¿En qué posición aguanto más? Este punto rojo es tu centro de masas: '
             'si su vertical cae entre tus pies, sigues de pie. En senkutsu dachi, la base pasa de un metro.')
    os.makedirs(f'{RAIZ}/audio/muestras', exist_ok=True)
    nombres = {'davefx': 'muestra-davefx', 'sharvard-m': 'muestra-sharvard-hombre', 'sharvard-f': 'muestra-sharvard-mujer'}
    with tempfile.TemporaryDirectory() as tmp:
        for v, nom in nombres.items():
            w = f'{tmp}/{nom}.wav'
            escena_wav(a.tts, v, frase, a.ls0, a.noise_scale, a.noise_w, w, tmp)
            m = metricas(w); l, tp = lufs(w)
            out = f'{RAIZ}/audio/muestras/{nom}.mp3'
            run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '192k', out])
            print(nom, f'{dur(w):.1f}s', f'{l:.1f} LUFS', f'pico {tp:.1f} dBFS', m)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pieza', nargs='?')
    ap.add_argument('--voz', default=VOZ_DEFECTO, choices=VOCES)
    ap.add_argument('--ritmo', default='auto')
    ap.add_argument('--noise-scale', type=float, default=0.6)
    ap.add_argument('--noise-w', type=float, default=0.8)
    ap.add_argument('--tts', default=os.environ.get('TTS_DIR', '/tmp/tts'))
    ap.add_argument('--muestras', action='store_true')
    ap.add_argument('--sin-mezcla', action='store_true')
    a = ap.parse_args()
    if not os.path.exists(f'{a.tts}/piper/piper'):
        sys.exit(f'Falta Piper en {a.tts}: ejecuta herramientas/instalar-voz.sh {a.tts}')
    a.ls0 = 1.0 if a.ritmo == 'auto' else float(a.ritmo)
    if a.muestras:
        return muestras(a)
    if not a.pieza:
        ap.error('indica la pieza o --muestras')
    pid = resolver(a.pieza)
    d = f'{RAIZ}/piezas/{pid}'
    g = json.load(open(f'{d}/voz/guion-voz.json'))
    esc, total = g['escenas'], g.get('duracion', 30)
    inicios, textos = [e['inicio'] for e in esc], [e['texto'] for e in esc]
    if a.ritmo != 'auto' and float(a.ritmo) < LS_MIN:
        sys.exit(f'Ritmo {a.ritmo} supera el tope 1,15x (length_scale mínimo {LS_MIN})')
    cands = LS_AUTO if a.ritmo == 'auto' else (float(a.ritmo),)
    os.makedirs(f'{d}/voz', exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for ls in cands:
            wavs = []
            for i, t in enumerate(textos):
                w = f'{d}/voz/escena-{i + 1:02d}.wav'
                escena_wav(a.tts, a.voz, t, ls, a.noise_scale, a.noise_w, w, tmp)
                wavs.append(w)
            plan, fin = planificar(wavs, inicios, total)
            if max(round(p[2], 2) for p in plan) <= DESFASE_MAX and fin <= total - 0.1:
                break
        ok = max(round(p[2], 2) for p in plan) <= DESFASE_MAX and fin <= total - 0.1
        print(f'{pid} voz={a.voz} length_scale={ls} (x{1 / ls:.2f}) noise_scale={a.noise_scale} noise_w={a.noise_w} fin={fin:.2f}s',
              'ENCAJA' if ok else 'NO ENCAJA: recortar texto')
        for i, (s, e, off) in enumerate(plan):
            ml = lufs(wavs[i])
            print(f'  escena-{i + 1:02d}: {s:5.2f}-{e:5.2f}s  desfase +{off:.2f}s  {ml[0]:.1f} LUFS  pico {ml[1]:.1f} dBFS'
                  + ('  <-- supera 0,5 s' if round(off, 2) > DESFASE_MAX else ''))
        full = ' '.join(wavs)
        m = metricas(wavs[1]) if len(wavs) > 1 else {}
        print('  métricas voz (escena 2):', m)
        if a.sin_mezcla:
            return
        base = f'{d}/final/reel-sin-voz.mp4'
        if not os.path.exists(base):
            sys.exit('Falta final/reel-sin-voz.mp4 (copia del montaje sin voz)')
        mezclar(base, wavs, plan, total, tmp, f'{d}/final/reel.mp4')


def mezclar(base, wavs, plan, total, tmp, salida):
    cmd = ['ffmpeg', '-y', '-v', 'error', '-i', base]
    f = ''
    for i, (w, p) in enumerate(zip(wavs, plan)):
        cmd += ['-i', w]
        f += f'[{i + 1}:a]adelay={int(p[0] * 1000)}:all=1[v{i}];'
    f += ''.join(f'[v{i}]' for i in range(len(wavs))) + f'amix=inputs={len(wavs)}:normalize=0,apad=whole_dur={total}[voz];'
    f += f'[voz]asplit=3[vs][vm][vo];[0:a]aresample=48000,volume={FONDO_DB}dB,asplit=2[bg][bgr];'
    f += f'[bg][vs]sidechaincompress={DUCK}[duck];[duck]asplit=2[duck1][duck2];[duck2][vm]amix=inputs=2:normalize=0:duration=first[mix]'
    sp.run(cmd + ['-filter_complex', f, '-map', '[mix]', '-t', str(total), '-c:a', 'pcm_f32le', f'{tmp}/mix.wav',
                  '-map', '[duck1]', '-t', str(total), '-c:a', 'pcm_f32le', f'{tmp}/duck.wav',
                  '-map', '[bgr]', '-t', str(total), '-c:a', 'pcm_f32le', f'{tmp}/bg.wav',
                  '-map', '[vo]', '-t', str(total), '-c:a', 'pcm_f32le', f'{tmp}/voz.wav'], check=True)
    # profundidad del ducking y separación voz-fondo medidas solo en los tramos con voz
    sr, vz = wavfile.read(f'{tmp}/voz.wav'); _, dk = wavfile.read(f'{tmp}/duck.wav'); _, bg = wavfile.read(f'{tmp}/bg.wav')
    mk = np.zeros(len(vz) + sr, bool)
    for s, e, _ in plan:
        mk[int(s * sr):int(e * sr)] = True
    def rms(x):
        x = x.astype(float); x = (x ** 2).mean(1) if x.ndim > 1 else x ** 2
        m = mk[:len(x)]
        return 10 * np.log10(x[m].mean() + 1e-12)
    print(f'  ducking: fondo bajado {rms(bg) - rms(dk):.1f} dB en tramos con voz; voz por encima del fondo: {rms(vz) - rms(dk):.1f} dB')
    # ganancia común para dejar el reel completo en -16 LUFS integrados
    i, tp = lufs(f'{tmp}/mix.wav')
    gan = LUFS_OBJ - i
    run(['ffmpeg', '-y', '-v', 'error', '-i', base, '-i', f'{tmp}/mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
         '-af', f'volume={gan:.2f}dB,alimiter=limit={PICO_MAX}:level=disabled', '-c:a', 'aac', '-b:a', '192k', '-t', str(total), salida])
    i2, tp2 = lufs(salida)
    print(f'  reel final: {i2:.1f} LUFS integrados, pico real {tp2:.1f} dBFS (antes de ganancia {i:.1f} LUFS, ganancia {gan:+.1f} dB)')


if __name__ == '__main__':
    main()
