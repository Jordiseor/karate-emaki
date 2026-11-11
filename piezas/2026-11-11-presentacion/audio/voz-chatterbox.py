#!/usr/bin/env python3
"""Recorta las tomas de voz-chatterbox/ -> voz/chatterbox/fNN.wav + guion-voz.json."""
import os, json, numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly
P = os.path.dirname(os.path.abspath(__file__)) + '/..'
SEL = {1:(2,1.19,.10,'Pasa, que empezamos.',1),2:(2,4.14,2.10,'Un emaki es un rollo japonés ilustrado que cuenta una historia, escena a escena.',2),
 3:(2,1.00,7.50,'De dónde viene todo.',4),4:(2,1.67,9.60,'La técnica, paso a paso.',5),5:(1,1.70,11.70,'Y la física: ¿cuánto aguantas?',6),
 6:(1,.63,13.78,'Y el doyo.',7),7:(2,.90,14.85,'Con sus gallos.',7),8:(2,2.13,15.95,'Karate, contado escena a escena.',8),9:(2,.47,18.25,'¿Te quedas?',9)}
def env(x, sr, ms=10):
    w = int(ms/1000*sr); return 20*np.log10(np.sqrt(np.convolve(x**2, np.ones(w)/w, 'same')) + 1e-9)
out = []; rep = []
for n, (k, cut, ini, txt, plano) in SEL.items():
    sr, x = wavfile.read(f'{P}/voz-chatterbox/f{n:02d}-t{k}.wav'); x = x.astype(np.float64)/(32768 if x.dtype == np.int16 else 1)
    if x.ndim > 1: x = x.mean(1)
    e = env(x, sr); c = cut
    def ok(t):  # silencio: 60 ms centrados <= -45 dB
        a, b = int((t-.03)*sr), int((t+.03)*sr); return a >= 0 and b <= len(x) and e[a:b].max() <= -45
    if not ok(c):
        cand = [c+d/1000 for d in range(0, 151, 5)] + [c-d/1000 for d in range(5, 151, 5)]
        cand = sorted((t for t in cand if ok(t)), key=lambda t: abs(t-c))
        c = cand[0] if cand else c
    on = np.argmax(e > -40)/sr
    t0 = max(0, on-.02) if on > .05 else 0.0
    y = x[int(t0*sr):int(c*sr)]
    a = int(.005*sr); y[:a] *= np.linspace(0, 1, a); b = int(.030*sr); y[-b:] *= np.linspace(1, 0, b)
    y = resample_poly(y, 2, 1) if sr == 24000 else y
    assert sr == 24000
    act = y[np.abs(y) > .01]; y = y*10**(-20/20)/np.sqrt((act**2).mean()); y *= min(1, .85/np.abs(y).max())
    wavfile.write(f'{P}/voz/chatterbox/f{n:02d}.wav', 48000, (y*32767).astype(np.int16))
    d = len(y)/48000; out.append({'n': n, 'plano': plano, 'texto': txt, 'toma': k, 'inicio_voz': ini, 'duracion': round(d, 3), 'fin_voz': round(ini+d, 3), 'corte_pedido': cut, 'corte_real': round(c, 3), 'inicio_recorte': round(t0, 3)})
json.dump({'duracion': 20.2, 'frases': out}, open(f'{P}/voz/chatterbox/guion-voz.json', 'w'), ensure_ascii=False, indent=1)
for o in out: print(o)
