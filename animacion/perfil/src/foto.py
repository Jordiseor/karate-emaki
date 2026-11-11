# Compone la foto de perfil: fondo papel + ensō rojo + figura 3D (recortada con alfa desde fig.png)
import sys; sys.path.insert(0,'/home/claude/karate-emaki/animacion/perfil/src')
from comun import *
def compon(fig, variante='a', fondo=None, y0=20):
    S=1080
    base=Image.new('RGBA',(S,S),PAPEL+(255,))
    if fondo: base=fondo.convert('RGBA').crop((0,y0,1080,y0+S)).filter(ImageFilter.GaussianBlur(14))
    if variante=='a':   # disco rojo sólido, con aro de papel fino
        base.alpha_composite(disco((S,S),540,540,450,ROJO))
    else:               # ensō rojo grueso sobre velo papel (sobre el fondo si lo hay)
        base.alpha_composite(disco((S,S),540,540,450,PAPEL,215))
        base.alpha_composite(enso((S,S),540,540,395,110,hueco=(-70,-25)))
    f=fig.crop((0,y0,1080,y0+S)); base.alpha_composite(f)
    return base
if __name__=='__main__':
    S_='/tmp/claude-0/-home-claude-karate-emaki/f8b39867-34a4-5614-adfc-17c99d0504c9/scratchpad/'
    fig=Image.open(S_+'fig.png')
    for v in 'ab':
        im=compon(fig,v,Image.open(S_+'dojo.png') if v=='b' else None); im.save(S_+f'p-{v}.png'); recorte_circulo(im,110).save(S_+f'p-{v}-110.png')
