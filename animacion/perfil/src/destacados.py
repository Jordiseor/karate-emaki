# Portadas de destacados 1080×1920 (PIL): disco central de 800 px, icono grueso en tinta + detalle rojo.
import sys; sys.path.insert(0,'/home/claude/karate-emaki/animacion/perfil/src')
from comun import *
W,H=1080,1920; CX,CY=540,960; R=400; K=2     # K = supermuestreo local
DISCO=(234,226,212); W_=30                   # color del disco, grosor de trazo
def lienzo(): 
    im=Image.new('RGBA',(W*K,H*K),PAPEL+(255,)); return im
def d_(im): return ImageDraw.Draw(im)
def P(*pts): return [(x*K,y*K) for x,y in pts]
def linea(d,pts,col=TINTA,w=W_):
    d.line(P(*pts),fill=col,width=w*K,joint='curve')
    for x,y in (pts[0],pts[-1]): d.ellipse([(x-w/2)*K,(y-w/2)*K,(x+w/2)*K,(y+w/2)*K],fill=col)
def circ(d,x,y,r,fill=None,out=None,w=W_):
    d.ellipse([(x-r)*K,(y-r)*K,(x+r)*K,(y+r)*K],fill=fill,outline=out,width=w*K if out else 0)
def rr(d,box,r,fill=None,out=None,w=W_):
    x0,y0,x1,y1=box; d.rounded_rectangle([x0*K,y0*K,x1*K,y1*K],radius=r*K,fill=fill,outline=out,width=w*K if out else 0)
def base():
    im=lienzo(); d=d_(im); circ(d,CX,CY,R,fill=DISCO); return im,d
def fin(im,nombre,hacer_mask=None):
    out=im.resize((W,H),Image.LANCZOS)
    # el contenido del icono no sale del disco: se enmascara fuera del disco salvo el fondo papel
    out.convert('RGB').save(f'/home/claude/karate-emaki/animacion/perfil/destacado-{nombre}.png')

def historia():
    im,d=base()
    # tejado de dōjō: cumbrera, faldones curvos con aleros levantados, remate rojo
    cx,cy=CX,CY-60
    techo=[(cx-300,cy+55),(cx-255,cy+40),(cx-170,cy-10),(cx-80,cy-70),(cx-30,cy-95),(cx+30,cy-95),(cx+80,cy-70),(cx+170,cy-10),(cx+255,cy+40),(cx+300,cy+55)]
    # aleros: curva suave que sube en los extremos
    import math
    pts=[]
    for i in range(41):
        f=i/40; x=cx-300+600*f; u=abs(f-0.5)*2
        y=cy-95+ (200*u**1.6) - 40*max(0,u-0.75)*4*0 
        pts.append((x,y))
    sup=[(x,y) for x,y in pts]
    inf=[(x,y+78-0.0*abs(x-cx)) for x,y in pts]
    # alero levantado en las puntas
    sup=[(x,y-(70*max(0,(abs(x-cx)-190)/110)**2)) for x,y in sup]
    inf=[(x,y-(70*max(0,(abs(x-cx)-190)/110)**2)) for x,y in inf]
    d.polygon(P(*(sup+inf[::-1])),fill=TINTA)
    # cumbrera redondeada
    rr(d,(cx-95,cy-130,cx+95,cy-80),22,fill=TINTA)
    # remate rojo (shachihoko simplificado: bola roja sobre la cumbrera)
    circ(d,cx,cy-170,34,fill=ROJO)
    # paredes: dos postes, viga y puerta
    y1=cy+175; y2=cy+320
    linea(d,[(cx-190,y1),(cx-190,y2)]); linea(d,[(cx+190,y1),(cx+190,y2)])
    linea(d,[(cx-205,y1+5),(cx+205,y1+5)])
    rr(d,(cx-95,y1+45,cx+95,y2+8),8,fill=ROJO)   # puerta/cartel rojo
    linea(d,[(cx,y1+45),(cx,y2+8)],col=DISCO,w=14)
    fin(im,'historia')

def tecnica():
    im,d=base()
    x0,x1,y0,y1=CX-150,CX+150,CY-95,CY+185
    # muñeca
    rr(d,(x0+30,y1-60,x1-30,y1+135),30,fill=DISCO,out=TINTA)
    # cuerpo del puño
    rr(d,(x0,y0,x1,y1),70,fill=DISCO,out=TINTA)
    # cuatro dedos (falanges) en la parte superior
    ancho=(x1-x0)/4
    for i in range(1,4): linea(d,[(x0+ancho*i,y0+6),(x0+ancho*i,y0+105)],w=22)
    # pulgar cruzado
    rr(d,(x0+20,y0+150,x1-20,y0+235),42,fill=DISCO,out=TINTA)
    # golpe: líneas de impacto rojas
    import math
    for a in (-60,-30,0,30,60):
        r0,r1=235,300
        ax=math.radians(a-90)
        linea(d,[(CX+(CY-CY)+r0*math.cos(ax)*1.0,(y0+60)+r0*math.sin(ax)*0.9+(-10)),(CX+r1*math.cos(ax),(y0+60)+r1*math.sin(ax)*0.9-10)],col=ROJO,w=26)
    fin(im,'tecnica')

def ciencia():
    im,d=base()
    gy=CY+230
    # suelo / base de apoyo
    linea(d,[(CX-230,gy),(CX+230,gy)],w=34)
    linea(d,[(CX-230,gy-30),(CX-230,gy+30)],w=24); linea(d,[(CX+230,gy-30),(CX+230,gy+30)],w=24)
    # vertical discontinua desde el CdM hasta el suelo
    cy=CY-170
    y=cy+50
    while y<gy-40:
        linea(d,[(CX,y),(CX,min(y+36,gy-30))],col=ROJO,w=16); y+=64
    # marca de caída en la base
    circ(d,CX,gy,22,fill=ROJO)
    # arco de ángulo en tinta (ladeo)
    d.arc([(CX-230)*K,(cy-230)*K,(CX+230)*K,(cy+230)*K],start=118,end=152,fill=TINTA,width=W_*K)
    d.arc([(CX-230)*K,(cy-230)*K,(CX+230)*K,(cy+230)*K],start=28,end=62,fill=TINTA,width=W_*K)
    # CdM: punto rojo con aro de papel
    circ(d,CX,cy,78,fill=DISCO); circ(d,CX,cy,60,fill=ROJO)
    circ(d,CX,cy,98,out=TINTA,w=W_)
    fin(im,'ciencia')

def humor():
    im,d=base()
    head=Image.open('/tmp/claude-0/-home-claude-karate-emaki/f8b39867-34a4-5614-adfc-17c99d0504c9/scratchpad/head.png')
    h=head.crop((150,420,950,1300)); s=0.78; h=h.resize((int(h.width*s*K/1),int(h.height*s*K/1)),Image.LANCZOS)
    px=CX*K-h.width//2; py=int((CY-345)*K)
    cap=Image.new('RGBA',im.size,(0,0,0,0)); cap.paste(h,(px,py))
    # recorte al disco
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).ellipse([(CX-R)*K,(CY-R)*K,(CX+R)*K,(CY+R)*K],fill=255)
    a=cap.getchannel('A'); from PIL import ImageChops
    cap.putalpha(ImageChops.multiply(a,m)); im.alpha_composite(cap)
    d=d_(im)
    # marcas de risa rojas a los lados (dos trazos cortos por lado)
    for sg in (-1,1):
        for k_ in (-1,1):
            linea(d,[(CX+sg*300,CY-250+k_*38),(CX+sg*248,CY-250+k_*20)],col=ROJO,w=22)
    fin(im,'humor')

def interactivos():
    im,d=base()
    import math
    bx=CX-30; Y=960+60
    # tres dedos doblados + nudillos (puño abajo)
    rr(d,(bx-150,Y+10,bx+150,Y+290),75,fill=DISCO,out=TINTA)
    for i in (1,2):
        linea(d,[(bx-150+300/3*i,Y+30),(bx-150+300/3*i,Y+95)],w=20)
    # pulgar a un lado
    rr(d,(bx+105,Y+60,bx+215,Y+190),50,fill=DISCO,out=TINTA)
    # índice extendido hacia arriba
    rr(d,(bx-150,Y-210,bx-40,Y+100),55,fill=DISCO,out=TINTA)
    # tapa unión
    d.rectangle([(bx-120)*K,(Y+6)*K,(bx-70)*K,(Y+104)*K],fill=DISCO)
    # toque: ondas rojas sobre la punta
    tx,ty=bx-95,Y-230
    circ(d,tx,ty-50,18,fill=ROJO)
    for r,(a0,a1) in ((80,(205,335)),(125,(215,325))):
        d.arc([(tx-r)*K,(ty-50-r)*K,(tx+r)*K,(ty-50+r)*K],start=a0,end=a1,fill=ROJO,width=24*K)
    fin(im,'interactivos')

if __name__=='__main__':
    for f in (historia,tecnica,ciencia,humor,interactivos): f()
