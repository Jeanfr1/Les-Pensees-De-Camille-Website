#!/usr/bin/env python3
"""Static kit QA and typographic contract checks. Does not simulate a browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from PIL import Image
from fontTools.ttLib import TTFont
import hashlib, json, re, subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(label, condition, detail=''):
    checks.append({'check':label,'pass':bool(condition),'detail':detail})
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.tags=[];self.ids=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);self.tags.append((tag,attrs))
        if 'id' in attrs:self.ids.append(attrs['id'])

for filename in ['site/index.html','GUIA-VISUAL.html']:
    p=ROOT/filename;page=Page();page.feed(p.read_text())
    check(f'{filename}: no duplicate IDs',len(page.ids)==len(set(page.ids)))
    for tag,attrs in page.tags:
        for name in ['src','href']:
            value=attrs.get(name,'');u=urlsplit(value)
            if not value or u.scheme or value.startswith('//'):continue
            if value.startswith('#'):
                check(f'{filename}: anchor {value}',value[1:] in page.ids)
            else:
                dest=(p.parent/unquote(u.path)).resolve()
                check(f'{filename}: {value}',dest.is_file() and dest.stat().st_size>0)
        if tag=='img':check(f'{filename}: img alt {attrs.get("src")}', 'alt' in attrs)
        if tag=='a' and attrs.get('target')=='_blank':check(f'{filename}: external rel {attrs.get("href")}', 'noopener' in attrs.get('rel',''))

css=(ROOT/'site/styles.css').read_text();js=(ROOT/'site/app.js').read_text();html=(ROOT/'site/index.html').read_text()
for url in re.findall(r'url\([\'\"]?([^\)\'\"]+)',css):
    check(f'CSS asset {url}',(ROOT/'site'/url).is_file())
check('CSS braces balanced',css.count('{')==css.count('}'))
check('French page language','<html lang="fr">' in html)
check('Exactly five main chapters',len(re.findall(r'<section\b',html))==5)
check('Approved heading and five chapter IDs',all(x in html for x in ['LES MOTS','EN FLEURS','id="creations"','id="occasions"','id="boutique"','id="contact"']))
check('Main figure uses explicit width', '--hero-subject:650px' in css and '.hero-flowers{width:100%;height:auto;' in css)
check('No viewport-height pinning',not re.search(r'(?:min-height|height)\s*:\s*100(?:d|s|l)?vh',css))
check('No board PNG used in site','Modelo1-Les-Mots' not in html+css+js)
check('Native scroll is not intercepted',not re.search(r'addEventListener\([\'\"](?:wheel|touchmove)',js))
check('Reduced motion and manual pause', 'prefers-reduced-motion:reduce' in css and 'motion-paused' in css and 'motion-toggle' in js)
check('No video, iframe or form',not re.search(r'<(?:video|iframe|form)\b',html))
check('No remote CSS/scripts',not re.search(r'<(?:script|link)[^>]+(?:src|href)="https?://',html))
check('Correct phone', 'tel:+33251753861' in html and '02 51 75 38 61' in html)
check('Correct address', '7 avenue de la Monneraye' in html and '44410 Herbignac' in html)
check('Social links match supplied business', 'instagram.com/les_pensees_de_camille/' in html and 'facebook.com/lespenseesdecamille' in html)
check('Dialogs restore focus', 'lastTrigger?.focus()' in js and "dialog.addEventListener('close'" in js)
check('Gallery has contact fallback', all('href="#contact"' in a for a in re.findall(r'<a [^>]*data-gallery=[^>]+>',html)))
check('No fake order confirmation',not re.search(r'commande confirmée|message envoyé|paiement réussi',html+js,re.I))

image_records=[]
for p in sorted(ROOT.rglob('*')):
    if p.suffix.lower() not in ['.png','.jpg','.webp']:continue
    try:
        im=Image.open(p);im.load();check(f'Image decodes: {p.relative_to(ROOT)}',im.width>0 and im.height>0)
        record={'file':str(p.relative_to(ROOT)),'width':im.width,'height':im.height,'mode':im.mode,'bytes':p.stat().st_size}
        if p.name in ['logo-restaurado-transparente.png','hero-fleurs-transparente.png','logo.png','hero-fleurs.webp']:
            alpha=im.getchannel('A') if 'A' in im.getbands() else None
            check(f'True alpha: {p.relative_to(ROOT)}',alpha is not None and alpha.getextrema()==(0,255))
            if alpha is not None:
                histogram=alpha.histogram();record['fully_transparent_fraction']=round(histogram[0]/(im.width*im.height),4)
        image_records.append(record)
    except Exception as exc:check(f'Image decodes: {p.relative_to(ROOT)}',False,str(exc))
for key in ['bouquet','vitrine-fleurs','boutique','rencontre']:
    src=Image.open(ROOT/'images/originals'/f'{key}.png').convert('RGB')
    prod=Image.open(ROOT/'site/assets/images'/f'{key}.webp').convert('RGB')
    check(f'Exact lossless photograph pixels: {key}',src.size==prod.size and src.tobytes()==prod.tobytes())
for p in ROOT.rglob('*.json'):
    try:json.loads(p.read_text());check(f'JSON parses: {p.relative_to(ROOT)}',True)
    except Exception as exc:check(f'JSON parses: {p.relative_to(ROOT)}',False,str(exc))
for p in (ROOT/'site/assets/fonts').glob('*.woff'):
    try:font=TTFont(p);check(f'Font decodes: {p.name}',font.flavor=='woff')
    except Exception as exc:check(f'Font decodes: {p.name}',False,str(exc))
for p in (ROOT/'fonts').glob('*OFL.txt'):check(f'OFL included: {p.name}','SIL OPEN FONT LICENSE' in p.read_text())

font=TTFont(ROOT/'fonts/InstrumentSerif-Regular.ttf');cmap=font.getBestCmap();units=font['head'].unitsPerEm
check('French accent glyphs available',all(ord(c) in cmap for c in 'éèêàçÉœ’'))
advance=sum(font['hmtx'].metrics[cmap[ord(c)]][0] for c in 'EN FLEURS.')/units
measurements=[]
for width in [375,768,1024,1440,1920]:
    title=66 if width<=600 else 82 if width<=860 else 92
    flower=400 if width<=600 else 560 if width<=860 else 650
    gutter=24 if width<=600 else 32 if width<=1000 else 44
    frame=min(width,1024);text_box=width-2*gutter if width<=600 else 425 if width<=860 else 480
    # Width of actual font advances before negative tracking: conservative bound.
    title_width=round(advance*title,2)
    row={'viewport':width,'design_canvas_width':frame,'desktop_scale':1 if width>=1024 else None,'hero_title_px':title,'hero_floral_width_px':flower,'hero_floral_natural_ratio':1122/1402,'title_advance_upper_bound_px':title_width,'text_box_px':text_box,'method':'static breakpoint contract + real font advance metrics; not browser layout measurement'}
    measurements.append(row);check(f'Title width fits its contract at {width}px',title_width<=text_box)
check('Desktop scale cap in stylesheet', '@media(min-width:1024px){:root{--hero-title:92px;--hero-subject:650px;' in css)
check('Desktop dimensions remain equal',len({(x['hero_title_px'],x['hero_floral_width_px']) for x in measurements if x['viewport']>=1024})==1)
for filename in [f'roteiros/{x}' for x in ['01-DIRECAO-DE-ARTE.md','02-HERO-E-ANIMACAO.md','03-SECOES-E-TRANSICOES.md','04-CONTEUDO-E-CONTATOS.md','05-ASSETS-E-MARCA.md','06-REVISAO-E-ENTREGA.md']]:check(f'Kit includes {filename}',(ROOT/filename).is_file())
try:
    result=subprocess.run(['node','--check',str(ROOT/'site/app.js')],capture_output=True,text=True)
    check('JavaScript syntax',result.returncode==0,result.stderr.strip())
except FileNotFoundError:check('JavaScript syntax',False,'Node not available in this verification environment')

(ROOT/'docs/scale-measurements.json').write_text(json.dumps(measurements,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/image-validation.json').write_text(json.dumps(image_records,ensure_ascii=False,indent=2)+'\n')
report={'static_pass':all(x['pass'] for x in checks),'checks':len(checks),'passed':sum(x['pass'] for x in checks),'failed':[x for x in checks if not x['pass']],'browser_qa':'UNVERIFIED','preview_error':'sites-preview: preview relay unavailable: No such file or directory (os error 2)','interaction_qa':'UNVERIFIED in browser; implemented code and syntax inspected','breakpoint_qa':'static contract + font metrics only; no screenshots','checks_detail':checks}
(ROOT/'docs/QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
md=f'''# Validação — Les Mots en Fleurs

**Checagens estáticas: {report['passed']}/{report['checks']} aprovadas.**

**QA visual e de interação em navegador: NÃO VERIFICADO.** A prévia gerenciada falhou com `preview relay unavailable: No such file or directory`. A configuração de diretório foi corrigida antes da tentativa final; o erro restante é de infraestrutura. Nenhum servidor ou navegador alternativo foi usado para contornar o ambiente.

## Executado

Referências locais e âncoras; sintaxe JavaScript; arquivos JSON; cinco capítulos e seleção; arquivos de fontes/licenças; glyphs franceses; decodificação de cada imagem; canal alpha real do logo e do hero; igualdade exata dos pixels RGB das quatro fotos reais nas cópias WebP lossless; restrições de escala e métricas tipográficas em 375, 768, 1024, 1440 e 1920 px.

Em 1024/1440/1920, título de 92 px e flor de 650 px. Essas são verificações dos parâmetros de implementação e avanços da fonte, não medições de layout em navegador.

## Inspeção visual de assets

Prancha aprovada, fotos de referência, logo atual da fachada e do Instagram, arranjo transparente e restauração raster da marca foram inspecionados. O logo histórico do site público foi separado e não é usado. Fotografias reais não foram regeneradas. Isso não substitui a revisão visual da página montada.

## Pendente em navegador

Enquadramento em cada breakpoint, sobreposição das camadas, estabilidade no carregamento, contraste sobre fotos, menus, aperçus, details expandido, foco, Escape, links externos em aplicativos reais, pausa, preferência reduzida e eventual transbordamento horizontal. Não houve chamadas telefônicas, e-mails, mensagens, pedidos ou publicação.

## Integridade da entrega

O empacotamento é verificado separadamente no relatório externo de release: CRC de todas as entradas do ZIP e SHA-256 dos arquivos contra o manifesto. O hash do próprio ZIP fica no relatório externo para evitar referência circular.
'''
(ROOT/'docs/QA.md').write_text(md)
print(json.dumps({k:report[k] for k in ['static_pass','checks','passed','failed','browser_qa']},ensure_ascii=False))
sys.exit(0 if report['static_pass'] else 1)
