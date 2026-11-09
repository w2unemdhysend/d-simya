"""Synthetic phone photos of an A4 sheet with known corners, for scan_e2e.py.

Each photo: A4 page with text, a table and a blue stamp, warped by perspective onto a
textured background, with uneven lighting, a soft hand shadow, noise and slight blur.
Writes <name>.jpg and <name>.json (corner ground truth, TL TR BR BL, in photo pixels).
"""
import json, sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

F = '/usr/share/fonts/truetype/dejavu/'

def page(w=1240, h=1754, seed=1):
    rnd = random.Random(seed)
    im = Image.new('RGB', (w, h), (250, 249, 245))
    d = ImageDraw.Draw(im)
    big = ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', 54)
    mid = ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', 30)
    txt = ImageFont.truetype(F + 'DejaVuSerif.ttf', 24)
    small = ImageFont.truetype(F + 'DejaVuSans.ttf', 18)
    d.text((110, 110), 'Mietvertrag / Договір оренди', font=big, fill=(20, 20, 24))
    d.text((110, 200), 'Wohnung, 2. OG links · Xanten', font=mid, fill=(40, 40, 46))
    words = ('Der Vermieter vermietet dem Mieter zu Wohnzwecken die Wohnung im Hause '
             'bestehend aus zwei Zimmern Küche Bad Flur Keller sowie einem Stellplatz '
             'Die Miete beträgt monatlich zuzüglich Betriebskosten Vorauszahlung').split()
    y = 290
    for para in range(4):
        for line in range(6):
            x = 110
            while True:
                wd = rnd.choice(words)
                tw = d.textlength(wd + ' ', font=txt)
                if x + tw > w - 110: break
                d.text((x, y), wd, font=txt, fill=(28, 28, 32))
                x += tw
            y += 38
        y += 26
    # table
    tx, ty, cw, rh = 110, y + 10, (w - 220) // 3, 52
    for r in range(5):
        for c in range(3):
            d.rectangle([tx + c * cw, ty + r * rh, tx + (c + 1) * cw, ty + (r + 1) * rh], outline=(30, 30, 30), width=2)
            d.text((tx + c * cw + 14, ty + r * rh + 14), ['Posten', 'Betrag', 'Fällig'][c] if r == 0 else f'{rnd.randint(10, 999)},00 €', font=small, fill=(25, 25, 25))
    # stamp + signature
    sx, sy = w - 420, h - 360
    d.ellipse([sx, sy, sx + 240, sy + 240], outline=(40, 70, 170), width=7)
    d.ellipse([sx + 22, sy + 22, sx + 218, sy + 218], outline=(40, 70, 170), width=3)
    d.text((sx + 52, sy + 100), 'GEPRÜFT', font=mid, fill=(40, 70, 170))
    pts = [(140 + i * 9, h - 220 + 30 * math.sin(i / 3.0) + rnd.uniform(-4, 4)) for i in range(40)]
    d.line(pts, fill=(20, 30, 90), width=4)
    d.text((140, h - 160), 'Unterschrift Mieter', font=small, fill=(60, 60, 60))
    return im

def coeffs(src, dst):
    # PIL wants the map from output (photo) coords back to input (page) coords
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()

def background(W, H, kind, seed):
    rng = np.random.default_rng(seed)
    if kind == 'wood':
        y = np.linspace(0, 1, H)[:, None]; x = np.linspace(0, 1, W)[None, :]
        grain = np.sin((x * 40 + np.sin(y * 6) * 2.0) * math.pi) * 0.5 + 0.5
        base = np.stack([88 + 30 * grain, 58 + 20 * grain, 38 + 12 * grain], -1)
    elif kind == 'grey':
        base = np.ones((H, W, 3)) * np.array([150, 148, 142])
    else:  # dark fabric
        base = np.ones((H, W, 3)) * np.array([46, 50, 58])
    base += rng.normal(0, 6, (H, W, 1))
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))

def make(name, W, H, corners, kind='wood', seed=3, shadow=True, rotate_page=False):
    pg = page(seed=seed)
    if rotate_page: pg = pg.rotate(90, expand=True)
    pw, ph = pg.size
    src = [(0, 0), (pw, 0), (pw, ph), (0, ph)]
    bg = background(W, H, kind, seed)
    warped = pg.transform((W, H), Image.PERSPECTIVE, coeffs(src, corners), Image.BICUBIC)
    mask = Image.new('L', (pw, ph), 255).transform((W, H), Image.PERSPECTIVE, coeffs(src, corners), Image.BICUBIC)
    img = Image.composite(warped, bg, mask)
    a = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    light = 0.78 + 0.30 * (1 - ((xx / W - 0.25) ** 2 + (yy / H - 0.2) ** 2) ** 0.5)   # lamp top-left
    a *= light[..., None]
    if shadow:   # soft shadow of the phone/hand across the lower right
        dist = (xx / W * 0.8 + yy / H) - 1.15
        sh = 1 - 0.38 * np.clip(1 / (1 + np.exp(-dist * 14)), 0, 1)
        a *= sh[..., None]
    a *= np.array([1.04, 1.0, 0.90])   # warm indoor light
    a += np.random.default_rng(seed).normal(0, 4.5, a.shape)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.3))
    img.save(f'{OUT}/{name}.jpg', quality=90)
    return {'W': W, 'H': H, 'corners': corners}

def camera(W, H, tilt_x, tilt_y, roll, fill=0.78, shift=(0, 0), portrait=True):
    """Project an A4 sheet (210x297 mm, or 297x210 lying sideways) through a pinhole phone camera.
    f = 26 mm-equivalent lens on the long side; returns TL TR BR BL corners in photo pixels."""
    f = max(W, H) * 26 / 36
    pw, ph = (210, 297) if portrait else (297, 210)
    pts = np.array([[-pw / 2, -ph / 2, 0], [pw / 2, -ph / 2, 0], [pw / 2, ph / 2, 0], [-pw / 2, ph / 2, 0]], float)
    ax, ay, az = map(math.radians, (tilt_x, tilt_y, roll))
    Rx = np.array([[1, 0, 0], [0, math.cos(ax), -math.sin(ax)], [0, math.sin(ax), math.cos(ax)]])
    Ry = np.array([[math.cos(ay), 0, math.sin(ay)], [0, 1, 0], [-math.sin(ay), 0, math.cos(ay)]])
    Rz = np.array([[math.cos(az), -math.sin(az), 0], [math.sin(az), math.cos(az), 0], [0, 0, 1]])
    P = pts @ (Rx @ Ry @ Rz).T
    def proj(dist):
        Z = P[:, 2] + dist
        return np.stack([f * (P[:, 0] + shift[0]) / Z + W / 2, f * (P[:, 1] + shift[1]) / Z + H / 2], 1)
    lo, hi = 50, 5000
    for _ in range(60):   # distance so the sheet spans `fill` of the frame
        mid = (lo + hi) / 2; c = proj(mid)
        span = max((c[:, 0].max() - c[:, 0].min()) / W, (c[:, 1].max() - c[:, 1].min()) / H)
        lo, hi = (mid, hi) if span > fill else (lo, mid)
    return [tuple(map(float, p)) for p in proj(hi)], ph / pw

def shot(name, W, H, kind, seed, tilt_x, tilt_y, roll, portrait=True, rotate_page=False, shadow=True, fill=0.78, shift=(0, 0)):
    corners, ratio = camera(W, H, tilt_x, tilt_y, roll, fill, shift, portrait)
    d = make(name, W, H, corners, kind, seed, shadow=shadow, rotate_page=rotate_page)
    d['ratio'] = ratio
    return d

def generate(out):
    """Writes p1..p4.jpg into out and returns {name: {W, H, corners, ratio}}."""
    global OUT
    OUT = out
    return {
        # typical: phone tilted ~25 degrees towards the far edge, slightly sideways
        'p1': shot('p1', 3000, 4000, 'wood', 3, 25, -6, 2),
        # sheet turned in the hand, stronger tilt, dark cloth
        'p2': shot('p2', 3000, 4000, 'dark', 5, 32, 10, -14, fill=0.8),
        # landscape photo, A4 lying sideways
        'p3': shot('p3', 4000, 3000, 'wood', 7, -18, 14, 3, portrait=False, rotate_page=True),
        # low contrast, almost face-on, off-centre
        'p4': shot('p4', 3000, 4000, 'grey', 9, 8, 4, 1, shadow=False, shift=(15, -10)),
    }

if __name__ == '__main__':
    print(json.dumps(generate(sys.argv[1]), indent=1))
