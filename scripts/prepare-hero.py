"""Split the campaign bouquet into registered layers (base greens + each flower)."""
import cv2, numpy as np, json, sys
from pathlib import Path
SRC='images/campaign/hero-fleurs-transparente.png'
OUT=Path('images/campaign/layers'); OUT.mkdir(parents=True,exist_ok=True)
im=cv2.imread(SRC,cv2.IMREAD_UNCHANGED); H,W=im.shape[:2]
a=im[:,:,3]; rgb=im[:,:,:3].copy()
ivory=np.array([228,239,243],np.uint8)  # BGR of #F3EFE4
comp=(rgb*(a[...,None]/255.)+ivory*(1-a[...,None]/255.)).astype(np.uint8)
FLOWERS={ # name:(cx,cy,r)
 'gerbera':(745,520,240),'rose':(530,770,170),'lisi':(968,800,152),'lisi2':(1022,372,100)}
base_a=a.copy(); meta={'w':W,'h':H,'layers':{}}
yy,xx=np.mgrid[0:H,0:W]
for n,(cx,cy,r) in FLOWERS.items():
    d=np.hypot(xx-cx,yy-cy)
    m=np.full((H,W),cv2.GC_BGD,np.uint8)
    m[d<r*1.08]=cv2.GC_PR_BGD; m[d<r*.92]=cv2.GC_PR_FGD; m[d<r*.45]=cv2.GC_FGD
    m[a<20]=cv2.GC_BGD
    bg=np.zeros((1,65)); fg=np.zeros((1,65))
    cv2.grabCut(comp,m,None,bg,fg,6,cv2.GC_INIT_WITH_MASK)
    fm=((m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD)).astype(np.uint8)
    # keep the component holding the centre, close holes
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9))
    fm=cv2.morphologyEx(fm,cv2.MORPH_OPEN,k); fm=cv2.morphologyEx(fm,cv2.MORPH_CLOSE,k)
    nlab,lab=cv2.connectedComponents(fm); fm=(lab==lab[cy,cx]).astype(np.uint8)
    cnt,_=cv2.findContours(fm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    fm=np.zeros_like(fm); cv2.drawContours(fm,cnt,-1,1,-1)
    soft=cv2.GaussianBlur(fm.astype(np.float32),(0,0),1.6)
    la=(a*soft).astype(np.uint8)
    ys,xs=np.where(la>8); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    layer=np.dstack([rgb,la])[y0:y1,x0:x1]
    cv2.imwrite(str(OUT/f'{n}.png'),layer)
    wide=cv2.GaussianBlur(cv2.dilate(fm,np.ones((9,9),np.uint8)).astype(np.float32),(0,0),2.2)
    base_a=(base_a*(1-wide)).astype(np.uint8)
    meta['layers'][n]={'x':int(x0),'y':int(y0),'w':int(x1-x0),'h':int(y1-y0),'cx':cx,'cy':cy}
cv2.imwrite(str(OUT/'base.png'),np.dstack([rgb,base_a]))
# loose petals (sprites)
for i,(x0,y0,x1,y1) in enumerate([(60,105,245,300),(280,460,365,615),(75,290,165,410)]):
    cv2.imwrite(str(OUT/f'petal{i+1}.png'),im[y0:y1,x0:x1])
json.dump(meta,open('site/assets/images/hero/layers.json','w'),indent=1)
print(json.dumps(meta))
