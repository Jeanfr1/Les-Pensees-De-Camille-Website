"""Crops (viewer UI removed), web exports, logo variants, hero layer exports."""
import cv2, numpy as np, json
from PIL import Image
from pathlib import Path
O=Path('images/originals'); S=Path('site/assets/images'); B=Path('site/assets/brand'); Hh=S/'hero'
def save(im,name,widths,q=80):
    for w in widths:
        if w>im.width: w=im.width
        r=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
        r.save(S/f'{name}-{w}.webp',quality=q,method=6)
        print(name,r.size)
crops={
 'bouquet':('bouquet.png',(95,112,1225,998),[1130,720]),
 'vitrine':('vitrine-fleurs.png',(86,102,1226,986),[1140,720]),
 'rencontre':('rencontre.png',(0,34,1284,1692),[1284,760]),
 'boutique':('boutique.png',(0,34,1288,1692),[1288,760]),
 'composition':('rencontre.png',(60,880,720,1560),[660]),
 'plantes':('boutique.png',(0,690,1288,1692),[1288,760]),
 'tiges':('vitrine-fleurs.png',(240,330,1010,860),[770]),
 'enseigne':('boutique.png',(140,34,1240,290),[1100]),
}
for n,(f,box,ws) in crops.items():
    save(Image.open(O/f).convert('RGB').crop(box),n,ws)
# --- hero layers: fill holes of the base softly, export webp
base=cv2.imread('images/campaign/layers/base.png',cv2.IMREAD_UNCHANGED)
src=cv2.imread('images/campaign/hero-fleurs-transparente.png',cv2.IMREAD_UNCHANGED)
rgb=base[:,:,:3]; al=base[:,:,3]  # gaps stay clean: each flower blooms into its own space
Image.fromarray(cv2.cvtColor(np.dstack([rgb,al]),cv2.COLOR_BGRA2RGBA)).save(Hh/'base.webp',quality=80,method=6)
for n in ['gerbera','rose','lisi','lisi2']:
    Image.open(f'images/campaign/layers/{n}.png').save(Hh/f'{n}.webp',quality=88,method=6)
full=Image.open('images/campaign/hero-fleurs-transparente.png')
full.save(Hh/'bouquet.webp',quality=80,method=6)
# petals: keep only pink pixels
for i,(x0,y0,x1,y1) in enumerate([(60,105,245,300),(280,460,365,615),(75,290,165,410)]):
    p=np.array(full.crop((x0,y0,x1,y1))).astype(int)
    m=((p[:,:,0]-p[:,:,1])>22)&(p[:,:,3]>30)
    m=cv2.morphologyEx(m.astype(np.uint8),cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(m); k=1+np.argmax(st[1:,4]); m=(lab==k).astype(np.float32)
    m=cv2.GaussianBlur(m,(0,0),1.2)
    p[:,:,3]=(p[:,:,3]*m); ys,xs=np.where(p[:,:,3]>8)
    Image.fromarray(p.astype(np.uint8)).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)).save(Hh/f'petal{i+1}.webp',quality=88)
# --- logo: trimmed dark + light variants, emblem icon
lg=Image.open('brand/logo-restaurado-transparente.png').convert('RGBA'); lg=lg.crop(lg.getbbox())
a=np.array(lg); dark=(a[:,:,:3].max(axis=2)<90)
li=a.copy(); li[dark,0:3]=(243,239,228)
for nm,arr in (('logo',a),('logo-clair',li)):
    im=Image.fromarray(arr); im=im.resize((640,round(im.height*640/im.width)),Image.LANCZOS); im.save(B/f'{nm}.webp',quality=92,method=6); print(nm,im.size)
em=Image.fromarray(a).crop((0,0,int(lg.width*.36),int(lg.height*.78)))
ea=np.array(em); ea[(ea[:,:,:3].max(axis=2)<90),3]=0; em=Image.fromarray(ea); em=em.crop(em.getbbox())
sq=Image.new('RGBA',(max(em.size),)*2,(0,0,0,0)); sq.alpha_composite(em,((sq.width-em.width)//2,(sq.height-em.height)//2))
sq.resize((256,256),Image.LANCZOS).save(B/'embleme.png'); 
ic=Image.new('RGBA',(256,256),(27,29,27,255)); ic.alpha_composite(sq.resize((200,200),Image.LANCZOS),(28,28)); ic.resize((180,180)).save(B/'icon.png')
