# Utilidades comunes del kit de perfil (PIL). Paleta de marca.
import math
from PIL import Image, ImageDraw, ImageFilter
PAPEL=(244,239,230); TINTA=(26,26,26); ROJO=(200,16,46)
SS=3
def enso(size, cx, cy, R, grosor, hueco=(-60,-20), tinta=ROJO, ancho_fin=0.45):
    """Ensō: anillo de pincel que engorda y se afina, con hueco. Devuelve RGBA del tamaño `size`."""
    W,H=size; im=Image.new('L',(W*SS,H*SS),0); d=ImageDraw.Draw(im)
    a0=math.radians(hueco[1]); a1=math.radians(hueco[0])+2*math.pi
    N=400; ext=[]; inn=[]
    for i in range(N+1):
        f=i/N; a=a0+(a1-a0)*f
        g=grosor*(1-(1-ancho_fin)*f**2.2)*(0.55+0.45*min(1,f*8))
        r=R+ (f*grosor*0.12)
        ext.append(((cx+(r+g/2)*math.cos(a))*SS,(cy-(r+g/2)*math.sin(a))*SS))
        inn.append(((cx+(r-g/2)*math.cos(a))*SS,(cy-(r-g/2)*math.sin(a))*SS))
    d.polygon(ext+inn[::-1],fill=255)
    m=im.resize((W,H),Image.LANCZOS)
    out=Image.new('RGBA',(W,H),tinta+(0,)); out.putalpha(m); return out
def disco(size,cx,cy,R,col,alfa=255):
    W,H=size; im=Image.new('L',(W*SS,H*SS),0); ImageDraw.Draw(im).ellipse([(cx-R)*SS,(cy-R)*SS,(cx+R)*SS,(cy+R)*SS],fill=alfa)
    out=Image.new('RGBA',(W,H),col+(0,)); out.putalpha(im.resize((W,H),Image.LANCZOS)); return out
def recorte_circulo(img,diam=None):
    img=img.convert('RGBA'); w,h=img.size; diam=diam or min(w,h)
    m=Image.new('L',(diam*SS,diam*SS),0); ImageDraw.Draw(m).ellipse([0,0,diam*SS-1,diam*SS-1],fill=255); m=m.resize((diam,diam),Image.LANCZOS)
    img=img.resize((diam,diam),Image.LANCZOS) if (w,h)!=(diam,diam) else img
    out=Image.new('RGBA',(diam,diam),(0,0,0,0)); out.paste(img,(0,0),m); return out
