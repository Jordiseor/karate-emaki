#!/usr/bin/env python3
"""Efectos y música propios de la presentación (numpy/scipy, sin muestras externas). Semilla fija.
Salida: audio/sfx-*.wav, audio/musica.wav (20,2 s, bucle), todo 48 kHz mono 16 bit."""
import os, numpy as np
from scipy.io import wavfile
from scipy import signal
SR = 48000
D = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(1111)
T = lambda s: np.arange(int(s * SR)) / SR

def save(name, x, peak=0.8):
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(f'{D}/{name}.wav', SR, (x * 32767).astype(np.int16))

def bp(x, lo, hi, o=2):
    return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)
def env(n, a, d):  # ataque/decaimiento exponencial
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)

def sweep_noise(dur, f0, f1, q=0.9, seed=0):
    """Ruido filtrado con frecuencia central que va de f0 a f1 (bloques cortos)."""
    r = np.random.default_rng(seed); n = int(dur * SR); w = r.standard_normal(n); out = np.zeros(n); B = 480
    for i in range(0, n, B):
        f = f0 * (f1 / f0) ** (i / n); lo, hi = f / (1 + q), min(f * (1 + q), SR / 2 * 0.95)
        out[i:i + B] = bp(w, lo, hi, 1)[i:i + B]
    return out

def paper(dur=1.5, reverse=False):
    n = int(dur * SR); t = np.arange(n) / SR
    base = sweep_noise(dur, 1800, 4500, 1.0, 1) * 0.6
    # crujidos: impulsos aleatorios filtrados, cada vez más densos hacia el final
    cr = np.zeros(n)
    for _ in range(int(dur * 70)):
        p = int((rng.random() ** 0.7) * (n - 600)); L = rng.integers(60, 400)
        cr[p:p + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * rng.uniform(0.3, 1)
    cr = hp(cr, 1500)
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 7 * t + 1))          # rodar a tirones
    x = (base * am + cr * 0.9) * np.minimum(t / 0.05, 1) * np.minimum((dur - t) / 0.12, 1)
    # golpecito de madera al final (rodillo llega a su sitio)
    th = int(0.09 * SR); tt = np.arange(th) / SR
    tap = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.02) + 0.4 * np.sin(2 * np.pi * 410 * tt) * np.exp(-tt / 0.012)
    x = np.concatenate([x, np.zeros(th)]); x[n - int(0.04 * SR):n - int(0.04 * SR) + th] += tap * 0.9 * np.abs(x).max()
    return x[::-1] if reverse else x

def slide(dur=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sweep_noise(dur, 900, 3200, 1.2, 5)
    return x * np.sin(np.pi * t / dur) ** 2

def voz_formantes(f0c, dur, formA, formB=None, soplo=0.25, jit=0.01, seed=0):
    """Fuente glotal (diente de sierra con jitter) + ruido, filtrada por formantes que pueden deslizar de formA a formB."""
    r = np.random.default_rng(seed); n = int(dur * SR)
    f0 = np.broadcast_to(f0c, n) if np.ndim(f0c) == 0 else np.interp(np.arange(n), np.linspace(0, n, len(f0c)), f0c)
    f0 = f0 * (1 + jit * lp(r.standard_normal(n), 30, 1) * 8)
    ph = np.cumsum(f0) / SR; src = signal.sawtooth(2 * np.pi * ph) * 0.8 + soplo * r.standard_normal(n)
    formB = formB or formA; out = np.zeros(n); B = 960
    for i in range(0, n, B):
        a = i / n; y = np.zeros(min(B, n - i))
        seg = src[max(0, i - 2000):i + B]
        for (fa, fb, bw, g) in zip(formA, formB, (90, 110, 160), (1.0, 0.7, 0.35)):
            fc = fa + (fb - fa) * a
            z = bp(seg, max(fc - bw, 50), min(fc + bw, 20000), 2)[-(len(y) + 0):] if len(seg) >= len(y) else 0
            y = y + g * z[-len(y):]
        out[i:i + len(y)] = y
    return out

A = (800, 1250, 2600); E = (500, 1900, 2600); I = (300, 2300, 3000); O = (500, 900, 2500)

def kiai_uno(dur, f0, seed, gallo=False):
    n = int(dur * SR)
    if gallo:  # voz que se quiebra: sube, salta una octava+ y se desfonda en falsete
        t = np.arange(n) / n
        cur = 260 + 180 * t
        cur = np.where(t > 0.38, cur * 2.6 * (1 + 0.04 * np.sin(2 * np.pi * 38 * t)), cur)      # el "gallo"
        cur = np.where(t > 0.80, cur * (1 - 0.35 * (t - 0.8) / 0.2), cur)
        x = voz_formantes(cur, dur, A, I, soplo=0.35, jit=0.03, seed=seed)
        e = np.minimum(np.arange(n) / SR / 0.012, 1) * (1 - t ** 3)
    else:       # "¡KI-AI!": consonante seca + a abierta -> i
        t = np.arange(n) / n
        cur = f0 * (1.25 - 0.35 * t)
        x = voz_formantes(cur, dur, A, E, soplo=0.3, jit=0.015, seed=seed)
        x[:int(0.03 * SR)] += hp(rng.standard_normal(int(0.03 * SR)), 2500) * 1.2   # explosiva "k"
        e = np.minimum(np.arange(n) / SR / 0.008, 1) * np.exp(-np.arange(n) / SR / (dur * 0.45))
    x = np.tanh(2.2 * x * e / (np.abs(x).max() + 1e-9))     # saturación: grito, no pitido
    return x

def kiai_colectivo():
    dur = 0.45; out = np.zeros(int((dur + 0.15) * SR))
    for k in range(6):
        v = kiai_uno(dur, rng.uniform(120, 210), 40 + k); off = int(rng.uniform(0, 0.05) * SR)
        out[off:off + len(v)] += v * rng.uniform(0.6, 1)
    return lp(out, 3800, 3)

def kiai_gallo(): return lp(kiai_uno(0.5, 0, 77, gallo=True), 8000, 2)

def cierra_rollo(): return paper(1.3, reverse=True)

def acento_logo():
    t = T(1.1)
    f = 62 + 40 * np.exp(-t / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    camp = sum(g * np.sin(2 * np.pi * fr * t) * np.exp(-t / d) for fr, g, d in ((880, .25, .5), (1318.5, .12, .4), (1760, .06, .3)))
    cl = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.01) * 0.2
    return (boom + camp + cl) * np.minimum(t / 0.004, 1)

# ---------------- música ----------------
TOT = 20.2; BPM = 190.0; BEAT = 60 / BPM          # 16 compases de 4/4 = 20,2 s exactos
N = int(round(TOT * SR)); TAIL = int(1.5 * SR)

def taiko(kind):
    t = T(0.6)
    if kind == 'don':
        f = 70 + 70 * np.exp(-t / 0.04); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2)
        x += 0.25 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.03)
    else:  # ka: aro
        x = 0.5 * bp(rng.standard_normal(len(t)), 1200, 3500, 1) * np.exp(-t / 0.045) + 0.35 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.05)
    return x

def pluck(f, dur=0.45, br=0.55):
    """Karplus-Strong con ataque 'bachi' (golpe de púa + rasgueo de la piel)."""
    n = int(dur * SR); p = int(SR / f); buf = (rng.standard_normal(p) * 2 - 1)
    y = np.zeros(n)
    for i in range(n):
        y[i] = buf[i % p]
        buf[i % p] = 0.4985 * (y[i] + buf[(i + 1) % p])
    return y * np.exp(-np.arange(n) / SR / (dur * 0.6))

def musica():
    out = np.zeros(N + TAIL); eb = BEAT / 2
    def put(x, t0, g=1.0):
        i = int(round(t0 * SR)); out[i:i + len(x)] += x[:len(out) - i] * g
    don, ka = taiko('don'), taiko('ka')
    # escala miyako-bushi sobre re (D Eb G A Bb); motivo propio de 2 compases que gira, tema en octava aguda
    nota = lambda g, o: 293.66 * 2 ** (([0, 1, 5, 7, 8][g % 5] + 12 * (g // 5 + o)) / 12)
    motivo_a = [(0, 0), (2, 0), (3, 0), (2, 0), (4, 0), (3, 0), (2, 0), (None, 0)]
    motivo_b = [(0, 1), (4, 0), (3, 0), (2, 0), (3, 0), (2, 0), (0, 0), (None, 0)]
    motivo_c = [(2, 1), (3, 1), (2, 1), (0, 1), (4, 0), (3, 0), (2, 0), (0, 0)]
    motivos = [motivo_a, motivo_a, motivo_b, motivo_a, motivo_a, motivo_a, motivo_b, motivo_c]  # 8 pares de compases
    cache = {}
    for c in range(16):
        t0 = c * 4 * BEAT
        # taiko: don en 1 y en "y" del 3, ka en 2 y 4; relleno en el último compás de cada 4
        put(don, t0, 1.0); put(ka, t0 + BEAT, 0.5); put(don, t0 + 2.5 * BEAT, 0.8); put(ka, t0 + 3 * BEAT, 0.5)
        if c % 4 == 3:
            for k in range(4): put(ka, t0 + 3 * BEAT + k * BEAT / 4, 0.35 + 0.1 * k)
        if c % 2 == 0:  # 16 compases -> 8 pares
            m = motivos[c // 2]
            for j, (g, o) in enumerate(m):
                if g is None: continue
                f = nota(g, o + 1)
                if f not in cache: cache[f] = pluck(f)
                put(cache[f], t0 + j * BEAT / 2, 0.5)
        # hi-hat tipo "chappa": corchea suave en contratiempos
        for j in range(4):
            put(hp(rng.standard_normal(int(0.05 * SR)), 5000) * np.exp(-T(0.05) / 0.012), t0 + j * BEAT + eb, 0.07)
    # bucle: la cola se suma al principio
    loop = out[:N].copy(); loop[:TAIL] += out[N:N + TAIL]
    return loop

if __name__ == '__main__':
    save('sfx-papel-desenrolla', paper(1.5))
    save('sfx-vineta-desliza', slide())
    save('sfx-kiai-colectivo', kiai_colectivo())
    save('sfx-kiai-gallo', kiai_gallo())
    save('sfx-rollo-cierra', cierra_rollo())
    save('sfx-logo-acento', acento_logo())
    m = musica(); save('musica', m, 0.7)
    print('ok')
