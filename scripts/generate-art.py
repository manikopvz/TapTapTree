from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random, json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'images'
random.seed(18018)

COLORS = {
    'gold': (255, 194, 66, 255), 'deep': (15, 30, 28, 255),
    'green': (72, 153, 61, 255), 'lime': (139, 213, 76, 255),
    'red': (222, 56, 52, 255), 'purple': (138, 79, 224, 255),
    'blue': (62, 158, 239, 255), 'wood': (107, 66, 35, 255)
}

def ensure(path):
    path.parent.mkdir(parents=True, exist_ok=True)

def save(im, rel, quality=88):
    p = OUT / rel
    ensure(p)
    im.save(p, 'WEBP', quality=quality, method=4)

def gradient(size, top, bottom, alpha=255):
    w,h=size; im=Image.new('RGBA', size); d=ImageDraw.Draw(im)
    for y in range(h):
        t=y/max(1,h-1)
        c=tuple(int(top[i]*(1-t)+bottom[i]*t) for i in range(3))+(alpha,)
        d.line((0,y,w,y), fill=c)
    return im

def ellipse_glow(im, box, color, blur=24, alpha=140):
    layer=Image.new('RGBA', im.size,(0,0,0,0)); d=ImageDraw.Draw(layer)
    c=tuple(color[:3])+(alpha,); d.ellipse(box, fill=c)
    layer=layer.filter(ImageFilter.GaussianBlur(blur)); im.alpha_composite(layer)

def cloud(d, x,y,s=1, color=(255,255,255,220)):
    for ox,oy,r in [(-38,4,30),(0,-8,40),(38,2,31),(12,14,36),(-16,18,34)]:
        d.ellipse((x+(ox-r)*s,y+(oy-r)*s,x+(ox+r)*s,y+(oy+r)*s),fill=color)

def mountains_layer():
    im=Image.new('RGBA',(1200,675),(0,0,0,0)); d=ImageDraw.Draw(im)
    for row,(base,col,alpha) in enumerate([(440,(103,130,157),130),(505,(69,113,117),175),(560,(46,91,79),220)]):
        pts=[(0,675),(0,base)]
        x=-80
        while x<1280:
            w=random.randint(150,260); peak=base-random.randint(100+row*20,210+row*35)
            pts += [(x+w*.35,base-random.randint(20,55)),(x+w*.55,peak),(x+w*.75,base-random.randint(30,80)),(x+w,base)]
            x+=w
        pts += [(1200,675)]
        d.polygon(pts, fill=col+(alpha,))
        if row<2:
            for i in range(5):
                cx=100+i*240+random.randint(-40,40); py=base-random.randint(115,195)
                d.polygon([(cx-34,py+36),(cx,py),(cx+30,py+38),(cx+7,py+28),(cx-4,py+38)], fill=(235,245,246,110))
    return im.filter(ImageFilter.GaussianBlur(1.2))

def background_assets():
    sky=gradient((1200,675),(104,190,239),(214,240,211)); d=ImageDraw.Draw(sky)
    ellipse_glow(sky,(770,-80,1050,200),(255,231,134),28,150)
    cloud(d,180,130,1.15); cloud(d,880,125,.9,(255,255,255,190)); cloud(d,510,75,.7,(255,255,255,160))
    save(sky,'backgrounds/sky.webp',86)
    save(mountains_layer(),'backgrounds/mountains.webp',86)

    islands=Image.new('RGBA',(1200,675),(0,0,0,0)); d=ImageDraw.Draw(islands)
    for x,y,s in [(160,315,.75),(890,280,.95),(630,220,.55)]:
        pts=[(x-90*s,y),(x+90*s,y),(x+48*s,y+45*s),(x+10*s,y+105*s),(x-25*s,y+65*s),(x-65*s,y+34*s)]
        d.polygon(pts,fill=(69,74,71,210)); d.ellipse((x-96*s,y-24*s,x+96*s,y+22*s),fill=(87,151,71,235))
        for _ in range(7):
            tx=x+random.randint(int(-65*s),int(65*s)); ty=y-random.randint(int(16*s),int(52*s))
            d.line((tx,ty,tx,ty+18*s),fill=(67,51,32,230),width=max(1,int(3*s))); d.ellipse((tx-12*s,ty-9*s,tx+12*s,ty+9*s),fill=(75,142,64,220))
    save(islands,'backgrounds/islands.webp',88)

    lake=Image.new('RGBA',(1200,675),(0,0,0,0))
    water=gradient((1200,285),(51,155,192),(31,103,134),210); lake.alpha_composite(water,(0,390)); d=ImageDraw.Draw(lake)
    for i in range(35):
        y=410+i*7; x=(i*91)%1150; d.arc((x,y,x+80,y+16),180,355,fill=(190,239,240,90),width=2)
    for x in [240,930]:
        d.rounded_rectangle((x,320,x+34,475),radius=14,fill=(205,244,246,135)); ellipse_glow(lake,(x-22,440,x+58,512),(178,238,246),12,100)
    save(lake,'backgrounds/lake.webp',86)

    forest=Image.new('RGBA',(1200,675),(0,0,0,0)); d=ImageDraw.Draw(forest)
    for i in range(46):
        x=i*29-40; base=580+random.randint(-25,28); h=random.randint(75,170)
        d.rectangle((x-4,base-h*.45,x+4,base),fill=(61,49,31,190))
        c=random.choice([(45,106,57,210),(53,126,62,220),(70,143,65,210)])
        d.ellipse((x-34,base-h,x+34,base-h*.42),fill=c)
    save(forest,'backgrounds/forest.webp',88)

    fg=Image.new('RGBA',(1200,675),(0,0,0,0)); d=ImageDraw.Draw(fg)
    d.polygon([(0,535),(1200,525),(1200,675),(0,675)],fill=(45,94,43,255))
    for i in range(220):
        x=random.randrange(1200); y=random.randrange(540,674); h=random.randrange(8,34)
        d.line((x,y,x+random.randrange(-8,9),y-h),fill=random.choice([(75,142,52,235),(112,174,65,230),(56,122,48,240)]),width=2)
    for i in range(28):
        x=random.randrange(1200); y=random.randrange(560,650); c=random.choice([(255,186,66,240),(244,120,151,235),(231,226,101,235)])
        d.ellipse((x-3,y-3,x+3,y+3),fill=c)
    for x in range(80,1150,180): d.rounded_rectangle((x,520,x+18,625),radius=5,fill=(95,58,32,230))
    d.rounded_rectangle((45,552,1150,570),radius=6,fill=(110,70,38,230))
    save(fg,'backgrounds/foreground.webp',88)

def tree_sprite(stage):
    palettes={
      'young':((63,139,62),(111,184,73),(110,69,38)),
      'apple':((49,128,52),(121,190,62),(103,63,35)),
      'mature':((51,117,48),(148,176,63),(98,58,33)),
      'ancient':((198,111,143),(238,164,183),(120,78,56)),
      'mystic':((45,161,207),(87,211,238),(115,86,67)),
      'cosmic':((98,57,181),(192,77,223),(80,55,87)),
      'reality':((145,61,191),(245,91,209),(98,58,91)),
    }
    dark,light,trunk=palettes[stage]; im=Image.new('RGBA',(460,560),(0,0,0,0)); d=ImageDraw.Draw(im)
    if stage in ('mystic','cosmic','reality'): ellipse_glow(im,(60,30,400,430),light,38,75)
    d.ellipse((70,488,390,550),fill=(46,76,44,180)); d.ellipse((95,495,365,535),fill=(97,138,65,210))
    d.polygon([(192,500),(218,265),(248,260),(285,500)],fill=trunk+(255,))
    d.polygon([(218,325),(145,230),(158,215),(237,300)],fill=trunk+(250,)); d.polygon([(250,330),(330,230),(344,244),(268,354)],fill=trunk+(250,))
    d.line((226,490,242,286),fill=(174,111,59,160),width=10)
    for ex in [115,160,205,300,345]: d.polygon([(220,470),(ex,525),(ex+35,530),(245,486)],fill=trunk+(235,))
    seed={'young':1,'apple':2,'mature':3,'ancient':4,'mystic':5,'cosmic':6,'reality':7}[stage]; rng=random.Random(seed)
    centers=[(230,160,90),(150,205,76),(310,205,78),(210,235,82),(275,135,65)]
    if stage=='young': centers=[(225,205,72),(165,235,55),(285,235,58)]
    if stage in ('mature','ancient','mystic','cosmic','reality'): centers += [(115,270,54),(350,265,54)]
    for cx,cy,r in centers:
        for _ in range(34):
            rr=rng.randint(16,34); x=cx+rng.randint(-r,r); y=cy+rng.randint(-int(r*.65),int(r*.65))
            col=dark if rng.random()<.5 else light
            d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=col+(rng.randint(205,250),))
    fruit_n={'young':4,'apple':16,'mature':22,'ancient':12,'mystic':14,'cosmic':15,'reality':17}[stage]
    fruit_color={'ancient':(255,191,215),'mystic':(93,213,255),'cosmic':(219,97,255),'reality':(255,132,220)}.get(stage,(226,54,48))
    for _ in range(fruit_n):
        x=rng.randint(115,345); y=rng.randint(110,305); rad=rng.randint(7,11)
        d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=fruit_color+(255,)); d.ellipse((x-rad//2,y-rad+2,x+1,y-2),fill=(255,222,185,120))
    if stage in ('ancient','mystic','cosmic','reality'):
        for _ in range(28):
            x=rng.randint(70,400); y=rng.randint(60,440); r=rng.randint(1,4)
            d.ellipse((x-r,y-r,x+r,y+r),fill=(255,244,178,rng.randint(120,240)))
    return im.filter(ImageFilter.GaussianBlur(.25))

def tree_assets():
    for stage in ['young','apple','mature','ancient','mystic','cosmic','reality']:
        save(tree_sprite(stage),f'trees/{stage}.webp',90)

def apple_img(golden=False):
    im=Image.new('RGBA',(128,128),(0,0,0,0)); d=ImageDraw.Draw(im)
    base=(255,180,32,255) if golden else (222,54,48,255); shadow=(210,115,20,255) if golden else (164,35,37,255)
    ellipse_glow(im,(9,12,119,124),(255,205,65) if golden else (255,90,75),12,70)
    d.ellipse((25,32,70,102),fill=base); d.ellipse((57,30,104,103),fill=base); d.ellipse((47,39,92,110),fill=base)
    d.arc((30,45,100,110),20,155,fill=shadow,width=4); d.line((64,37,69,15),fill=(72,49,25,255),width=7)
    d.ellipse((67,13,91,31),fill=(76,157,57,255)); d.ellipse((38,48,54,66),fill=(255,240,220,125))
    return im

def item_assets():
    save(apple_img(False),'items/apple.webp',92); save(apple_img(True),'items/golden_apple.webp',92)
    basket=Image.new('RGBA',(220,160),(0,0,0,0));d=ImageDraw.Draw(basket);d.rounded_rectangle((30,70,190,145),radius=22,fill=(127,79,36,255),outline=(217,157,69,255),width=5)
    for x in range(45,190,28): d.line((x,75,x-8,140),fill=(81,49,28,220),width=5)
    for x in range(55,180,33): basket.alpha_composite(apple_img(False).resize((52,52)),(x,36+(x%2)*10))
    d.arc((45,28,180,130),195,345,fill=(210,154,74,255),width=10); save(basket,'items/basket.webp',90)

def environment_assets():
    grass=Image.new('RGBA',(300,140),(0,0,0,0));d=ImageDraw.Draw(grass)
    for i in range(70):
        x=8+(i*41)%285; h=25+(i*17)%80
        d.polygon([(x,130),(x+6,130),(x+((i*7)%27)-13,130-h)],fill=random.choice([(64,137,48,255),(91,166,55,255),(131,189,67,255)]))
    save(grass,'environment/grass.webp',88)
    rock=Image.new('RGBA',(220,150),(0,0,0,0));d=ImageDraw.Draw(rock);d.ellipse((22,115,195,143),fill=(25,36,29,80)); d.polygon([(30,118),(55,55),(97,28),(151,43),(194,100),(172,124),(62,129)],fill=(93,106,91,255)); d.polygon([(55,55),(97,28),(132,50),(96,86),(43,91)],fill=(137,150,127,255))
    for x,y in [(67,59),(82,52),(143,65)]: d.ellipse((x-11,y-6,x+11,y+6),fill=(75,129,50,210))
    save(rock,'environment/rock.webp',90)
    sign=Image.new('RGBA',(440,130),(0,0,0,0));d=ImageDraw.Draw(sign);d.rounded_rectangle((15,12,425,104),radius=22,fill=(80,46,24,250),outline=(230,168,77,255),width=6);d.rounded_rectangle((28,25,412,91),radius=15,fill=(119,70,34,245),outline=(54,30,17,255),width=3);d.rectangle((65,100,84,130),fill=(61,37,21,255));d.rectangle((356,100,375,130),fill=(61,37,21,255));save(sign,'environment/stage_sign.webp',92)

def icon_tile(symbol, accent, round_badge=False):
    size=96; im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    if round_badge:
        d.ellipse((5,5,91,91),fill=(20,35,31,250),outline=COLORS['gold'],width=4); d.ellipse((12,12,84,84),outline=accent,width=3)
    else:
        d.rounded_rectangle((5,5,91,91),radius=16,fill=(22,29,31,250),outline=(194,139,65,255),width=4)
    cx=cy=48
    if symbol=='finger':
        d.rounded_rectangle((43,24,58,66),radius=7,fill=(245,199,155,255)); d.polygon([(43,52),(29,47),(25,55),(43,72),(65,72),(70,55),(62,49),(56,60)],fill=(245,199,155,255))
    elif symbol=='bolt': d.polygon([(56,14),(30,49),(46,49),(37,82),(69,39),(53,39)],fill=accent)
    elif symbol=='crit':
        for a in range(0,360,45):
            x1=cx+10*math.cos(math.radians(a));y1=cy+10*math.sin(math.radians(a));x2=cx+32*math.cos(math.radians(a));y2=cy+32*math.sin(math.radians(a));d.line((x1,y1,x2,y2),fill=accent,width=5)
        d.ellipse((39,39,57,57),fill=(255,245,200,255))
    elif symbol=='swirl':
        for r in [12,20,28]: d.arc((cx-r,cy-r,cx+r,cy+r),190,520,fill=accent,width=5)
    elif symbol=='rain':
        d.ellipse((25,25,62,48),fill=(236,241,246,255));d.ellipse((42,20,72,48),fill=(236,241,246,255));d.rectangle((26,38,73,50),fill=(236,241,246,255))
        for x in [31,48,65]: d.line((x,58,x-5,77),fill=accent,width=5)
    elif symbol=='gold': im.alpha_composite(apple_img(True).resize((66,66)),(15,15))
    elif symbol=='fire': d.polygon([(48,14),(34,39),(39,50),(27,62),(39,83),(63,82),(73,61),(59,40),(58,58),(49,50)],fill=accent)
    elif symbol=='leaf': d.ellipse((24,27,72,70),fill=accent); d.line((32,69,67,31),fill=(230,245,200,255),width=4)
    elif symbol=='branch': d.line((27,70,68,28),fill=(125,80,39,255),width=8); d.line((48,50,70,55),fill=(125,80,39,255),width=6); d.ellipse((63,49,80,65),fill=accent)
    elif symbol=='tree':
        d.rectangle((43,48,54,77),fill=(114,72,38,255)); d.ellipse((20,20,77,60),fill=accent); d.ellipse((31,14,67,51),fill=(117,197,76,255))
    elif symbol=='fruit': im.alpha_composite(apple_img(False).resize((60,60)),(18,18))
    elif symbol=='star':
        pts=[]
        for i in range(10):
            a=-math.pi/2+i*math.pi/5;r=31 if i%2==0 else 13;pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
        d.polygon(pts,fill=accent)
    elif symbol=='crystal': d.polygon([(48,14),(72,37),(62,74),(48,84),(32,73),(24,37)],fill=accent,outline=(225,240,255,255))
    elif symbol=='crown': d.polygon([(22,67),(20,32),(38,48),(48,22),(59,48),(77,32),(73,68)],fill=accent); d.rectangle((23,66,73,76),fill=(255,213,74,255))
    elif symbol=='sun':
        d.ellipse((31,31,65,65),fill=accent)
        for a in range(0,360,45): d.line((48+22*math.cos(math.radians(a)),48+22*math.sin(math.radians(a)),48+35*math.cos(math.radians(a)),48+35*math.sin(math.radians(a))),fill=accent,width=4)
    return im

def icon_assets():
    ups={'tap':('finger',(255,195,105,255)),'faster':('bolt',(255,201,54,255)),'critical':('crit',(229,87,237,255)),'echo':('swirl',(53,199,245,255)),'rain':('rain',(66,173,255,255)),'gold':('gold',(255,195,47,255)),'frenzy':('fire',(255,92,54,255))}
    for k,(s,c) in ups.items(): save(icon_tile(s,c),f'icons/upgrades/{k}.webp',92)
    skillset={'roots':('tree',(92,184,71,255)),'trunk':('branch',(229,169,73,255)),'branch':('branch',(112,197,77,255)),'leaves':('leaf',(97,202,82,255)),'lucky':('star',(243,205,58,255)),'fruit':('fruit',(228,70,57,255)),'growth':('tree',(116,206,79,255)),'abundance':('gold',(255,190,49,255)),'rain':('rain',(79,180,255,255))}
    for k,(s,c) in skillset.items(): save(icon_tile(s,c,True),f'icons/skills/{k}.webp',92)
    ach={'first_apple':('fruit',(232,73,56,255)),'crown':('crown',(255,190,52,255)),'sun':('sun',(255,194,54,255)),'star':('star',(111,195,94,255)),'tree_master':('tree',(89,186,72,255)),'crystal':('crystal',(76,168,244,255)),'purple_star':('star',(184,91,230,255)),'diamond':('crystal',(109,194,255,255)),'mystery':('star',(130,130,140,255))}
    for k,(s,c) in ach.items(): save(icon_tile(s,c,True),f'icons/achievements/{k}.webp',92)

def fx_assets():
    leaf=Image.new('RGBA',(96,96),(0,0,0,0));d=ImageDraw.Draw(leaf);d.ellipse((19,28,78,67),fill=(94,177,61,255));d.line((25,68,72,31),fill=(224,239,170,220),width=3);save(leaf,'fx/leaf.webp',90)
    for name,col in [('glow',(255,191,57)),('magic_glow',(171,83,244))]:
        im=Image.new('RGBA',(192,192),(0,0,0,0));p=im.load()
        for y in range(192):
            for x in range(192):
                q=math.hypot(x-96,y-96)/96;a=int(max(0,1-q)**2*220);p[x,y]=col+(a,)
        save(im,f'fx/{name}.webp',90)
    spark=Image.new('RGBA',(128,128),(0,0,0,0));d=ImageDraw.Draw(spark);ellipse_glow(spark,(28,28,100,100),(255,205,74),18,130);d.polygon([(64,5),(72,53),(122,64),(73,73),(64,123),(55,74),(6,64),(55,55)],fill=(255,230,135,245));save(spark,'fx/spark.webp',92)
    for name,col in [('gold_swirl',(255,190,61,255)),('blue_swirl',(69,181,255,255))]:
        im=Image.new('RGBA',(180,180),(0,0,0,0));d=ImageDraw.Draw(im)
        for r in [25,42,60,75]: d.arc((90-r,90-r,90+r,90+r),190,500,fill=col,width=6)
        save(im,f'fx/{name}.webp',90)

def ui_assets():
    p=Image.new('RGBA',(600,160),(0,0,0,0));d=ImageDraw.Draw(p);d.rounded_rectangle((10,15,590,145),radius=32,fill=(77,44,23,248),outline=(222,162,75,255),width=7);d.rounded_rectangle((27,31,573,129),radius=23,fill=(119,69,34,245),outline=(47,28,17,255),width=4)
    for x in range(60,570,70): d.arc((x,47,x+62,113),170,360,fill=(160,100,48,110),width=2)
    save(p,'ui/title_panel.webp',92)
    p=Image.new('RGBA',(640,820),(0,0,0,0));d=ImageDraw.Draw(p);d.rounded_rectangle((12,12,628,808),radius=38,fill=(17,25,24,239),outline=(176,126,60,255),width=6);d.rounded_rectangle((25,25,615,795),radius=30,outline=(255,208,105,80),width=2);save(p,'ui/large_panel.webp',92)
    for name,fill,outline in [('button_gold',(142,83,30,245),(255,188,63,255)),('button_selected',(37,91,128,245),(74,191,255,255))]:
        b=Image.new('RGBA',(300,92),(0,0,0,0));d=ImageDraw.Draw(b);d.rounded_rectangle((5,5,295,87),radius=24,fill=fill,outline=outline,width=5);d.rounded_rectangle((15,14,285,76),radius=18,outline=(255,255,255,65),width=2);save(b,f'ui/{name}.webp',92)
    bar=Image.new('RGBA',(440,58),(0,0,0,0));d=ImageDraw.Draw(bar);d.rounded_rectangle((3,6,437,52),radius=20,fill=(19,29,29,245),outline=(197,142,65,255),width=3);d.rounded_rectangle((10,13,430,45),radius=15,fill=(231,132,31,255));save(bar,'ui/progress_orange.webp',92)
    slot=Image.new('RGBA',(220,150),(0,0,0,0));d=ImageDraw.Draw(slot);d.rounded_rectangle((6,6,214,144),radius=20,fill=(19,28,27,248),outline=(211,151,65,255),width=4);save(slot,'ui/slot.webp',92)

def main():
    for d in ['backgrounds','trees','items','environment','fx','icons/upgrades','icons/skills','icons/achievements','ui']:
        (OUT/d).mkdir(parents=True,exist_ok=True)
    background_assets(); tree_assets(); item_assets(); environment_assets(); icon_assets(); fx_assets(); ui_assets()
    manifest={
      'version':2,'format':'webp','svgAllowed':False,
      'required':{
        'backgrounds':['sky','mountains','islands','lake','forest','foreground'],
        'trees':['young','apple','mature','ancient','mystic','cosmic','reality'],
        'items':['apple','golden_apple','basket'],
        'environment':['grass','rock','stage_sign'],
        'fx':['leaf','spark','gold_swirl','blue_swirl','glow','magic_glow'],
        'upgradeIcons':['tap','faster','critical','echo','rain','gold','frenzy'],
        'skillIcons':['roots','trunk','branch','leaves','lucky','fruit','growth','abundance','rain'],
        'achievementBadges':['first_apple','crown','sun','star','tree_master','crystal','purple_star','diamond','mystery'],
        'ui':['title_panel','large_panel','button_gold','button_selected','progress_orange','slot']
      },
      'policy':'All gameplay-visible art is committed raster WebP. Runtime Graphics is permitted only for invisible hit areas.'
    }
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('Generated',len(list(OUT.rglob('*.webp'))),'WebP assets')

if __name__=='__main__': main()
