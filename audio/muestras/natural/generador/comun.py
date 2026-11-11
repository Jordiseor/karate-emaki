import subprocess as sp, re, numpy as np, wave, os, sys
from scipy.io import wavfile
# (texto, pausa tras el trozo en s): coma 0,15; punto 0,3-0,4; interrogación 0,35
SEG = [("Pasa,",.15),("que empezamos.",.35),
("Un emaki es un rollo japonés ilustrado que cuenta una historia,",.15),("escena a escena.",.35),
("De dónde viene todo.",.35),("La técnica,",.15),("paso a paso.",.35),
("Y la física:",.15),("¿cuánto aguantas?",.35),("Y el dóyo.",.3),("Con sus gallos.",.35),
("Karate contado escena a escena.",.4),("¿Te quedas?",0)]
OUT="/home/claude/karate-emaki/audio/muestras/natural"
def ensamblar(trozos, sr, nombre):
    """trozos: lista de arrays float; pausas de SEG. Guarda 48 kHz -16 LUFS."""
    partes=[]
    for (t,p),a in zip(SEG,trozos):
        partes.append(a.astype(np.float32)); partes.append(np.zeros(int(p*sr),np.float32))
    x=np.concatenate(partes); tmp=f"/tmp/claude-0/s/{nombre}-raw.wav"
    wavfile.write(tmp,sr,x)
    f=f"{OUT}/{nombre}.wav"
    r=sp.run(["ffmpeg","-y","-i",tmp,"-af","aresample=48000,ebur128","-f","null","-"],capture_output=True,text=True).stderr
    I=float(re.findall(r"I:\s+(-?[\d.]+) LUFS",r)[-1])
    g=-16-I
    for _ in range(4):
        sp.run(["ffmpeg","-y","-loglevel","error","-i",tmp,"-af",f"aresample=48000,volume={g}dB,alimiter=limit=0.85:level=disabled","-ar","48000","-ac","1","-c:a","pcm_s16le",f],check=True)
        r=sp.run(["ffmpeg","-i",f,"-af","ebur128","-f","null","-"],capture_output=True,text=True).stderr
        I2=float(re.findall(r"I:\s+(-?[\d.]+) LUFS",r)[-1])
        if abs(I2+16)<0.15: break
        g+=-16-I2
    r=sp.run(["ffmpeg","-i",f,"-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
    print(nombre, "I", re.findall(r"I:\s+(-?[\d.]+) LUFS",r)[-1], "pico", re.findall(r"Peak:\s+(-?[\d.]+) dBFS",r)[-1], "dur", round(len(x)/sr,2))
