import sys,re,time,unicodedata,numpy as np
sys.path.insert(0,"/tmp/claude-0/s"); from comun import *
import onnxruntime as ort
D="/tmp/claude-0/k/kokoro-multi-lang-v1_0/"
tok={}
for l in open(D+"tokens.txt",encoding="utf8").read().split("\n"):
    if l.strip()=="" : continue
    p=l.rsplit(" ",1); tok[p[0] if len(p)==2 else l]=int(p[-1])
tok[" "]=16
V=np.fromfile(D+"voices.bin",dtype=np.float32).reshape(54,510,256)
S=ort.InferenceSession(D+"model.onnx",providers=["CPUExecutionProvider"])
FUNC={"que","un","es","de","la","y","el","con","sus","te","a","en","del","los","las","su","se","lo","al","por","para","mi","tu","si","o","u"}
VOW="aeiouáéíóú"
def silabas_acento(w):
    # núcleos: lista de (inicio,fin) de grupos vocálicos con hiatos
    nuc=[];i=0
    while i<len(w):
        if w[i] in VOW and not (w[i]=="u" and i>0 and w[i-1] in "qg" and i+1<len(w) and w[i+1] in "eií"):
            j=i+1
            while j<len(w) and w[j] in VOW:
                a,b=w[j-1],w[j]
                fuerte=lambda c:c in "aeoáéó"
                if (fuerte(a) and fuerte(b)) or b in "íú" or a in "íú": break
                j+=1
            nuc.append((i,j)); i=j
        else: i+=1
    ac=[k for k,(a,b) in enumerate(nuc) if any(c in "áéíóú" for c in w[a:b])]
    if ac: st=ac[0]
    elif len(nuc)<=1: st=0
    elif w[-1] in "aeiouns": st=len(nuc)-2
    else: st=len(nuc)-1
    return nuc,st
def n_w(w,s): return len(w)
def g2p(w):
    w=w.lower(); nuc,st=silabas_acento(w)
    out=[];i=0;n=len(w)
    marca=None
    if len(nuc)>1 or (w not in FUNC and nuc): 
        a=nuc[st][0]; 
        # inicio de la sílaba: retrocede sobre 1 consonante (o 2 si oclusiva+líquida)
        s=a
        if s>1 and w[s-1]=="u" and w[s-2] in "qg" and s<n_w(w,s): s-=2
        elif s>0 and w[s-1] not in VOW:
            s-=1
            if s>0 and w[s]=="u" and w[s-1] in "qg" and a+0>s: pass
            if s>0 and w[s-1] in "pbtdkcgf" and w[s] in "lr": s-=1
            elif s>0 and w[s-1]=="c" and w[s]=="h": s-=1
        marca=s
    prev_v=False
    def vocal(c): return c in VOW
    while i<n:
        if marca is not None and i==marca: out.append("ˈ"); marca=None
        c=w[i]; nx=w[i+1] if i+1<n else ""; pv=out and out[-1] in "aeiou"
        pvowel=i>0 and w[i-1] in VOW
        if c in "aáeéiíoóuú":
            if c in "iíuú" and False: pass
            b=unicodedata.normalize("NFD",c)[0]
            if c in "iu" and ((nx and nx in "aeoáéó" and not pvowel) or (pvowel and w[i-1] in "aeoáéó" and not (nx and nx in VOW))): b={"i":"j","u":"w"}[c]
            out.append(b)
            if c=="u" and i>0 and w[i-1] in "qg" and nx in "eéií": out.pop()  # u muda
        elif c=="c":
            if nx=="h": out.append("ʧ"); i+=1
            elif nx in "eéií": out.append("θ")
            else: out.append("k")
        elif c=="q": out.append("k"); 
        elif c=="g":
            if nx in "eéií": out.append("x")
            else: out.append("ɣ" if pvowel else "ɡ")
        elif c=="j": out.append("x")
        elif c=="h": pass
        elif c=="l":
            if nx=="l": out.append("ʎ"); i+=1
            else: out.append("l")
        elif c=="y":
            out.append("i" if (n==1 or i==n-1) else "ʝ")
        elif c=="ñ": out.append("ɲ")
        elif c in "bv": out.append("β" if pvowel else "b")
        elif c=="d": out.append("ð" if pvowel else "d")
        elif c=="r":
            if nx=="r": out.append("r"); i+=1
            elif i==0 or w[i-1] in "nls": out.append("r")
            else: out.append("ɾ")
        elif c=="z": out.append("θ")
        elif c=="x": out.append("ks")
        elif c in "pftmnskw": out.append(c)
        else: out.append(c)
        i+=1
    return "".join(out)
def frase_a_ids(t):
    t=t.replace("¿","").replace("¡","")
    ps=[]
    for m in re.finditer(r"[A-Za-zÁÉÍÓÚáéíóúñÑüÜ]+|[,.:?!]",t):
        x=m.group()
        ps.append(x if x in ",.:?!" else g2p(x))
    s=""
    for k,x in enumerate(ps):
        s+= x if x in ",.:?!" else (" " if s else "")+x
    ids=[tok[c] for c in s if c in tok]
    return s,ids
def sint(ids,sid):
    st=V[sid][min(len(ids),509)][None,:]
    x=np.array([[0]+ids+[0]],dtype=np.int64)
    return S.run(None,{"tokens":x,"style":st,"speed":np.array([1.0],dtype=np.float32)})[0].reshape(-1)
if __name__=="__main__":
    for nombre,sid in [("kokoro-em_alex",29),("kokoro-em_santa",53),("kokoro-ef_dora",28)]:
        tr=[];t0=time.time()
        for t,p in SEG:
            s,ids=frase_a_ids(t); 
            if nombre.endswith("alex"): print(s)
            a=sint(ids,sid)
            idx=np.where(np.abs(a)>0.005)[0]; a=a[max(idx[0]-150,0):idx[-1]+300]
            tr.append(a)
        print(nombre,"s/frase",round((time.time()-t0)/len(SEG),2))
        ensamblar(tr,24000,"muestra-"+nombre.replace("_","-"))
