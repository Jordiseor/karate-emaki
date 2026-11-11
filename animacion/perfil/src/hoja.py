# Hoja de revisión: foto grande y a 110 px, + 5 portadas recortadas en círculo
import sys; sys.path.insert(0,'/home/claude/karate-emaki/animacion/perfil/src')
from comun import *
D='/home/claude/karate-emaki/animacion/perfil/'
n=['historia','tecnica','ciencia','humor','interactivos']
hoja=Image.new('RGB',(1800,1200),(255,255,255)); d=ImageDraw.Draw(hoja)
foto=Image.open(D+'foto-perfil.png'); fb=Image.open(D+'foto-perfil-b.png')
hoja.paste(recorte_circulo(foto,520),(40,40),recorte_circulo(foto,520))
hoja.paste(recorte_circulo(fb,520),(600,40),recorte_circulo(fb,520))
for i,x in enumerate((110,110,64)):
    c=recorte_circulo(foto,x); hoja.paste(c,(1200+i*140,60),c)
c=recorte_circulo(fb,110); hoja.paste(c,(1200,220),c)
for i,x in enumerate(n):
    im=Image.open(D+f'destacado-{x}.png'); im=im.crop((0,420,1080,1500)).resize((340,340)) # franja central
    c=recorte_circulo(im,340); hoja.paste(c,(40+i*350,700),c)
    s=recorte_circulo(Image.open(D+f'destacado-{x}.png').crop((140,560,940,1360)),110); hoja.paste(s,(40+i*350+115,1070),s)
hoja.save(D+'hoja.png')
