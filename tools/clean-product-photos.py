# Cleans the product photos crawled from the old site: flood-fills or level-corrects the backdrop to
# white, trims, pads to 4:3 and writes 1000w + 480w WebP. Needs Pillow (python3 -m venv .venv && .venv/bin/pip install pillow)
# and the crawl folders (crawl/products, crawl/assets, orig) in the current directory. One-off tool, kept for reproducibility.
import json, re, glob, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat = json.load(open(f'{root}/content/catalog.json'))
out = f'{root}/src/assets/img/products'
# Map legacy product name -> first cloudinary id in the crawled page.
pages = {}
for f in glob.glob('crawl/products/*.html'):
    name = os.path.basename(f)[len('products_'):-5].replace('_', ' ')
    ids = re.findall(r'res\.cloudinary\.com/hmowmkbc9/image/upload/[^"]*?/([a-z0-9]{20})\.jpg', open(f, encoding='utf8', errors='ignore').read())
    if ids: pages[name] = ids[0]
def norm(s): return re.sub(r'\s+', ' ', s.replace('&quot;', '"')).strip().lower()
pages = {norm(k): v for k, v in pages.items()}

def clean(im, thresh=48, ellipse=False):
    if ellipse:
        W,H = im.size; im = im.crop((int(W*0.15), int(H*0.16), int(W*0.85), int(H*0.84)))
    im = im.convert('RGB')
    w, h = im.size
    # Flood-fill the background from the border into pure white.
    # Seed a flood fill from a ring 1 px and 4 px inside the border (JPEG frames often have a 1-2 px white edge).
    seeds = []
    for inset in (0, 2, 4):
        for x in range(inset, w-inset, 8): seeds += [(x, inset), (x, h-1-inset)]
        for y in range(inset, h-inset, 8): seeds += [(inset, y), (w-1-inset, y)]
    px0 = im.load()
    if thresh is None:
        # Levels: divide by the median border colour so the backdrop becomes white without flood fill.
        import statistics
        ring = [px0[s] for s in seeds]
        med = tuple(int(max(120, statistics.median(c[i] for c in ring))) for i in range(3))
        for y in range(h):
            for x in range(w):
                r,g,b = px0[x,y]
                px0[x,y] = (min(255, r*255//med[0]), min(255, g*255//med[1]), min(255, b*255//med[2]))
        seeds = []
    for s in seeds:
        r,g,b = px0[s]
        if r>250 and g>250 and b>250: continue
        ImageDraw.floodfill(im, s, (255,255,255), thresh=thresh)
    # Near-white to white (JPEG halo).
    px = im.load()
    for y in range(h):
        for x in range(w):
            r,g,b = px[x,y]
            if r>236 and g>236 and b>236: px[x,y]=(255,255,255)
    # Trim.
    bg = Image.new('RGB', im.size, (255,255,255))
    from PIL import ImageChops
    diff = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v>18 else 0)
    bbox = diff.getbbox()
    if bbox: im = im.crop(bbox)
    # Pad to 4:3 with 7% margin.
    w, h = im.size
    m = int(max(w, h) * 0.07)
    cw, ch = w + 2*m, h + 2*m
    if cw/ch > 4/3: ch = int(cw*3/4)
    else: cw = int(ch*4/3)
    canvas = Image.new('RGB', (cw, ch), (255,255,255))
    canvas.paste(im, ((cw-w)//2, (ch-h)//2))
    return canvas

done = 0
for p in cat['products']:
    if not p['image']: continue
    key = norm(p['legacyName'] or '')
    cid = pages.get(key)
    if not cid:
        print('NO SOURCE', p['slug'], repr(key)); continue
    src = f'orig/{cid}.jpg' if os.path.exists(f'orig/{cid}.jpg') else f'crawl/assets/{cid}.jpg'
    raw = Image.open(src).convert('RGB')
    W,H = raw.size
    crop = {'stryker-6-perfurador-e-serra': (0,0,int(W*0.53),H), 'carregador-de-bateria-inteligente': (0,int(H*0.2),W,H), 'stryker-5-carregador-de-bateria': (0,int(H*0.18),W,H), 'stryker-5-perfurador-e-serra': (0,0,int(W*0.66),H), 'stryker-5-perfurador': (0,0,int(W*0.45),H)}.get(p['slug'])
    if crop: raw = raw.crop(crop)
    thr = {'stryker-5-perfurador-e-serra': None, 'stryker-6-perfurador': None, 'stryker-6-perfurador-e-serra': 30, 'stryker-5-perfurador': None, 'stryker-5-serra': None, 'stryker-6-serra': None, 'carregador-de-bateria-inteligente': None, 'stryker-5-carregador-de-bateria': None}.get(p['slug'], 48)
    ell = p['slug'] in ('stryker-5-serra','stryker-6-serra','carregador-de-bateria-inteligente','stryker-5-carregador-de-bateria')
    im = clean(raw, thresh=thr, ellipse=ell)
    for width, suffix in ((1000, ''), (480, '-480')):
        r = im.resize((width, int(width*3/4)), Image.LANCZOS)
        if width > im.width: r = r.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
        r.save(f'{out}/{p["image"]}{suffix}.webp', 'WEBP', quality=86, method=6)
    done += 1
print('processed', done)
