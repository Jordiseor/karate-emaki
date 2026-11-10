#!/usr/bin/env python3
"""Genera la locución con Piper (voz es-carlfm, dominio público) y la mezcla en el reel.
Uso: python3 herramientas/generar-voz.py <dir-piper> <modelo.onnx>
Cada frase empieza en su escena o, si la anterior no ha acabado, justo después (máx. desfase informado)."""
import subprocess as sp, sys, os, shutil
P, M = sys.argv[1], sys.argv[2]
PIEZAS = {
 '2026-11-09-nombre-shotokan': ([0,3,8,11,13,17,20,23,27], [
  'Shotokan no es el nombre de un estilo. Es una casa.',
  'Shoto, olas de pino, era el seudónimo con que Guichin Funakoshi firmaba sus poemas.',
  'El viento en los pinos, que suena a mar.',
  'Y kan significa casa.',
  'En mil novecientos treinta y nueve, Funakoshi y sus alumnos abren un doyo en Tokio.',
  'Cuentan que sus alumnos colgaron el cartel: la casa de Shoto.',
  'En el cuarenta y cinco, ardió en los bombardeos.',
  'Funakoshi nunca bautizó su karate. El mundo lo llamó como aquel doyo.',
  'Dices Shotokan y nombras una casa que ya no existe.']),
 '2026-11-09-zenkutsu-estabilidad': ([0,3,7,10,14,18,22,26], [
  'Empújame hacia delante. ¿En qué posición aguanto más?',
  'El punto rojo es tu centro de masas. Si su vertical cae entre tus pies, sigues de pie.',
  'Pies juntos: ocho grados... y fuera.',
  'En senkutsu dachi, la posición adelantada, la base pasa de un metro.',
  'Hacia delante, ahora aguantas hasta unos veintiséis grados.',
  'Y si bajas la cadera, el punto rojo baja y llegas a unos treinta.',
  'Pero gira la cámara. De lado, la base es estrecha y aguantas bastante menos.',
  '¿Por dónde me empujarías tú?']),
}
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
for pid,(starts,frases) in PIEZAS.items():
    d=f'piezas/{pid}'; os.makedirs(f'{d}/voz',exist_ok=True)
    for ls in (1.0,0.96,0.92,0.88,0.85):
        t=0; plan=[]
        for i,fr in enumerate(frases):
            w=f'{d}/voz/escena-{i+1:02d}.wav'; raw='/tmp/raw.wav'
            sp.run([f'{P}/piper','--model',M,'--length_scale',str(ls),'--sentence_silence','0.12','--output_file',raw],input=fr.encode(),check=True,capture_output=True)
            sp.run(['ffmpeg','-y','-v','error','-i',raw,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse','-ar','48000',w],check=True)
            s=max(starts[i]+0.1,t+0.12); t=s+dur(w); plan.append((s,w,s-starts[i]))
        if t<=29.9 and max(p[2] for p in plan)<=0.7: break
    print(pid,'ritmo',ls,'fin',round(t,2),'desfase máx',round(max(p[2] for p in plan),2))
    for s,w,off in plan: print(f'  {os.path.basename(w)} entra {s:.2f}s (+{off:.2f})')
    base=f'{d}/final/reel-sin-voz.mp4'
    if not os.path.exists(base): shutil.copy(f'{d}/final/reel.mp4',base)
    cmd=['ffmpeg','-y','-v','error','-i',base]; filt=''
    for i,(s,w,_) in enumerate(plan):
        cmd+=['-i',w]; filt+=f'[{i+1}:a]adelay={int(s*1000)}:all=1[v{i}];'
    filt+=''.join(f'[v{i}]' for i in range(len(plan)))+f'amix=inputs={len(plan)}:normalize=0,volume=2.0[voz];[0:a]volume=0.4[bg];[bg][voz]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]'
    sp.run(cmd+['-filter_complex',filt,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t','30',f'{d}/final/reel.mp4'],check=True)
