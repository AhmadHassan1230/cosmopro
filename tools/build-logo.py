# Rebuilds the original Cosmo Pro logo as SVG from assets/brand/cosmopro-logo-original.png.
# Needs Pillow + numpy and potrace (brew install potrace). Run: python3 tools/build-logo.py
import json, os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'assets/brand/cosmopro-logo-original.png')
OUT = os.path.join(ROOT, 'assets/brand')
COL = {'orange': (250, 166, 26), 'blue': (0, 90, 171), 'purple': (129, 41, 144)}
HEX = {'orange': '#FAA61A', 'blue': '#005AAB', 'purple': '#812990'}
S, PAD = 3, 4

src = Image.open(SRC).convert('RGBA')
alpha = np.array(src)[..., 3]
rows = np.where(alpha.max(axis=1) > 40)[0]
bands, start, prev = [], rows[0], rows[0]
for r in rows[1:]:
    if r - prev > 8: bands.append((start, prev)); start = r
    prev = r
bands.append((start, prev))
def bbox(y0, y1):
    xs = np.where(alpha[y0:y1 + 1].max(axis=0) > 40)[0]; return int(xs.min()), int(y0), int(xs.max()), int(y1)
parts = dict(zip(['mark', 'word', 'pvt'], [bbox(*b) for b in bands[:3]]))

tmp = tempfile.mkdtemp()
traced = {}
for name, (x0, y0, x1, y1) in parts.items():
    crop = src.crop((x0 - PAD, y0 - PAD, x1 + PAD + 1, y1 + PAD + 1))
    big = np.array(crop.resize((crop.width * S, crop.height * S), Image.LANCZOS)).astype(float)
    keys = ['orange', 'blue', 'purple', 'white'] if name == 'mark' else ['blue', 'purple']
    cols = np.array([COL.get(k, (255, 255, 255)) for k in keys], float)
    lab = ((big[..., None, :3] - cols[None, None]) ** 2).sum(-1).argmin(-1)
    layers = {}
    for i, k in enumerate(keys):
        if k == 'white': continue
        m = (lab == i) & (big[..., 3] > 127)
        pbm, svg = os.path.join(tmp, f'{name}_{k}.pbm'), os.path.join(tmp, f'{name}_{k}.svg')
        Image.fromarray(np.where(m, 0, 255).astype('uint8')).convert('1').save(pbm)
        subprocess.run(['potrace', '-s', '--flat', '-a', '1.1', '-O', '0.5', '-t', '6', pbm, '-o', svg], check=True)
        layers[k] = re.sub(r'\s+', ' ', ' '.join(re.findall(r'<path d="([^"]+)"', open(svg).read())))
    traced[name] = {'h': big.shape[0], 'layers': layers, 'box': (x0, y0, x1, y1)}

def part(name, x, y, k=1.0, white=False):
    p = traced[name]
    fill = lambda c: '#FFFFFF' if (white and name != 'mark') else HEX[c]
    inner = ''.join(f'<path fill="{fill(c)}" d="{d}"/>' for c, d in p['layers'].items())
    return f'<g transform="translate({x:.1f},{y:.1f}) scale({k / S:.5f})"><g transform="translate(0,{p["h"]}) scale(0.1,-0.1)">{inner}</g></g>'
def size(name, k=1.0):
    x0, y0, x1, y1 = traced[name]['box']; return (x1 - x0 + 1 + 2 * PAD) * k, (y1 - y0 + 1 + 2 * PAD) * k
def mark(x, y, k=1.0):
    w, h = size('mark', k)
    return f'<rect x="{x + 16 * k:.1f}" y="{y + 16 * k:.1f}" width="{w - 32 * k:.1f}" height="{h - 32 * k:.1f}" fill="#fff"/>' + part('mark', x, y, k)
svg = lambda w, h, body: f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}">{body}</svg>'

mw, mh = size('mark')
# vertical (original arrangement)
(mx0, _, _, _), (wx0, wy0, _, _), (px0, py0, _, _) = traced['mark']['box'], traced['word']['box'], traced['pvt']['box']
W, H = 1191 + 2 * PAD, traced['pvt']['box'][3] + 2 * PAD
for white in (False, True):
    body = mark(mx0, 0) + part('word', wx0, wy0, white=white) + part('pvt', px0, py0, white=white)
    open(os.path.join(OUT, f'logo-v{"-white" if white else ""}.svg'), 'w').write(svg(W, H, body))
# horizontal: mark left, wordmark + (PVT) LTD stacked right
kw = 0.34 * mh / size('word')[1]
ww, wh = size('word', kw); kp = kw * 0.86; pw, ph = size('pvt', kp)
gap, vgap = 0.15 * mh, 0.09 * mh
ty = (mh - (wh + vgap + ph)) / 2; tx = mw + gap
for white in (False, True):
    body = mark(0, 0) + part('word', tx, ty, kw, white) + part('pvt', tx + 0.012 * mh, ty + wh + vgap, kp, white)
    open(os.path.join(OUT, f'logo-h{"-white" if white else ""}.svg'), 'w').write(svg(tx + max(ww, pw), mh, body))
open(os.path.join(OUT, 'mark-colour.svg'), 'w').write(svg(mw, mh, mark(0, 0)))
for f in sorted(os.listdir(OUT)):
    if f.endswith('.svg'): print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, 'KB')
