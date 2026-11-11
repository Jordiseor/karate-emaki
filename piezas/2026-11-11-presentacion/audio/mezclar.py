#!/usr/bin/env python3
"""Mezcla guía: voz (plano-NN.wav) + efectos + música -> audio/mezcla-guia.wav (20,2 s, -16 LUFS, pico <= -1 dBFS)."""
import os, json, re, subprocess as sp, numpy as np
from scipy.io import wavfile
from scipy import signal
SR = 48000; TOT = 20.2; N = int(TOT * SR)
A = os.path.dirname(os.path.abspath(__file__)); V = A + '/../voz'
def rd(f):
    sr, x = wavfile.read(f); x = x.astype(np.float64) / 32768
    assert sr == SR; return x if x.ndim == 1 else x.mean(1)
def put(buf, x, t0, g_db=0.0):
    i = int(round(t0 * SR)); x = x[:max(0, len(buf) - i)]; buf[i:i + len(x)] += x * 10 ** (g_db / 20)
g = json.load(open(V + '/guion-voz.json'))
voz = np.zeros(N)
for e in g['escenas']:
    put(voz, rd(f"{V}/plano-{e['n']:02d}.wav"), e['inicio_voz'])
sfx = np.zeros(N)
EF = json.load(open(A + '/efectos.json'))
for e in EF:
    put(sfx, rd(f"{A}/{e['fichero']}.wav"), e['t'], e['db'])
mus = rd(A + '/musica.wav')[:N]
# ducking: envolvente de voz+sfx fuertes (suavizada) baja la música 12 dB; entre frases sube 3 dB
env = np.abs(voz) + 0.6 * np.abs(sfx)
env = signal.sosfiltfilt(signal.butter(2, 8, 'low', fs=SR, output='sos'), env)
act = np.clip(env / (0.35 * env.max()), 0, 1)
att = np.exp(-1 / (0.025 * SR)); rel = np.exp(-1 / (0.30 * SR)); s = np.zeros(N); c = 0
for i in range(N):
    c = att * c + (1 - att) * act[i] if act[i] > c else rel * c + (1 - rel) * act[i]
    s[i] = c
duck_db = 3 - 15 * s            # +3 dB libre, -12 dB con voz
mus_d = mus * 10 ** (duck_db / 20)
# nivel de la música: ~14 dB por debajo de la voz mientras habla
mask = (np.abs(voz) > 0.01); mask = np.convolve(mask, np.ones(2000), 'same') > 0
rv = np.sqrt((voz[mask] ** 2).mean()); rm = np.sqrt((mus_d[mask] ** 2).mean())
gm = rv / rm * 10 ** (-14 / 20); mus_d *= gm
mix = voz + sfx + mus_d
def lufs(f):
    r = sp.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    r = r[r.rfind('Summary'):]; return float(re.search(r'I:\s+(-?[\d.]+) LUFS', r).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', r).group(1))
tmp = A + '/_tmp.wav'; out = A + '/mezcla-guia.wav'
wavfile.write(tmp, SR, (np.clip(mix / np.abs(mix).max() * 0.5, -1, 1) * 32767).astype(np.int16))
i, _ = lufs(tmp)
sp.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', f'volume={-16 - i:.2f}dB,alimiter=limit=0.84:level=disabled,volume=0dB', '-c:a', 'pcm_s16le', '-ar', '48000', '-t', str(TOT), out], check=True)
os.remove(tmp)
print('mezcla-guia', lufs(out), 'voz-vs-musica dB (en voz):', round(20 * np.log10(rv / np.sqrt((mus_d[mask] ** 2).mean())), 1))
