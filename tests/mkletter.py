"""A made-up German letter as a scanned A4 page (200 dpi JPEG), for the translation tests.

  python3 tests/mkletter.py out.jpg

All names, addresses and numbers are invented. NUMBERS lists the numbers a translation must keep.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
NUMBERS = ['03.11.2026', '32-4711/26', '248,40', '24.11.2026', '12345']
LETTER = [
    ('small', 'Stadtverwaltung Musterstadt · Rathausplatz 1 · 12345 Musterstadt'),
    ('lines', ['Frau', 'Olena Beispiel', 'Beispielstraße 12', '12345 Musterstadt']),
    ('right', ['Musterstadt, 03.11.2026', 'Aktenzeichen: 32-4711/26']),
    ('bold', 'Bescheid über Abfallgebühren 2026'),
    ('para', 'Sehr geehrte Frau Beispiel,'),
    ('para', 'für das Grundstück Beispielstraße 12 werden die Abfallgebühren für das Jahr 2026 auf '
             '248,40 € festgesetzt. Die Gebühr umfasst die Restmülltonne, die Papiertonne und die Abholung '
             'der Gelben Säcke.'),
    ('para', 'Bitte überweisen Sie den Betrag bis zum 24.11.2026 unter Angabe des Aktenzeichens auf das '
             'Konto der Stadtkasse.'),
    ('para', 'Gegen diesen Bescheid können Sie innerhalb eines Monats nach Bekanntgabe Widerspruch einlegen.'),
    ('lines', ['Mit freundlichen Grüßen', 'Im Auftrag', 'M. Schmidt']),
]

def render(path, w=1654, h=2339):
    img = Image.new('RGB', (w, h), (252, 252, 250))
    d = ImageDraw.Draw(img)
    body, small = ImageFont.truetype(FONT, 34), ImageFont.truetype(FONT, 26)
    bold = ImageFont.truetype(FONT.replace('Sans.ttf', 'Sans-Bold.ttf'), 38)
    x0, x1, y, lh = 190, w - 190, 210, 52
    for kind, val in LETTER:
        if kind == 'small':
            d.text((x0, y), val, font=small, fill=(70, 70, 70)); y += 110
        elif kind == 'lines':
            for s in val: d.text((x0, y), s, font=body, fill=(20, 20, 20)); y += lh
            y += 40
        elif kind == 'right':
            for s in val: d.text((x1 - d.textlength(s, font=body), y), s, font=body, fill=(20, 20, 20)); y += lh
            y += 50
        elif kind == 'bold':
            d.text((x0, y), val, font=bold, fill=(10, 10, 10)); y += 90
        else:
            line = ''
            for word in val.split():
                test = (line + ' ' + word).strip()
                if d.textlength(test, font=body) > x1 - x0:
                    d.text((x0, y), line, font=body, fill=(20, 20, 20)); y += lh; line = word
                else: line = test
            d.text((x0, y), line, font=body, fill=(20, 20, 20)); y += lh + 30
    img.save(path, 'JPEG', quality=88)

if __name__ == '__main__':
    render(sys.argv[1] if len(sys.argv) > 1 else 'letter.jpg')
