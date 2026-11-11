import sys,time,subprocess as sp,numpy as np
sys.path.insert(0,"/tmp/claude-0/s"); from comun import *
T="/tmp/tts"
for nombre,modelo,spk in [("piper-sharvard-m","es_ES-sharvard-medium",0),("piper-davefx","es_ES-davefx-medium",None)]:
    tr=[];t0=time.time()
    for i,(t,p) in enumerate(SEG):
        o=f"/tmp/claude-0/s/p{i}.wav"
        cmd=[f"{T}/piper/piper","--model",f"{T}/voces/{modelo}.onnx","--length_scale","1.0","--noise_scale","0.6","--noise_w","0.8","--sentence_silence","0","--output_file",o]
        if spk is not None: cmd+=["--speaker",str(spk)]
        sp.run(cmd,input=t.encode(),check=True,capture_output=True)
        sr,a=wavfile.read(o); a=a.astype(np.float32)/32768
        # recorta silencios de extremos
        idx=np.where(np.abs(a)>0.01)[0]; a=a[max(idx[0]-200,0):idx[-1]+200]
        tr.append(a)
    print("s/frase",(time.time()-t0)/len(SEG), "frases",len(SEG))
    ensamblar(tr,sr,"muestra-"+nombre.replace("piper-","piper-"))
