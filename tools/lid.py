"""The official question catalogue of the tests «Leben in Deutschland» and «Einbürgerungstest» → a1/lid/de.js.

  python3 tools/lid.py /path/to/gesamtfragenkatalog-lebenindeutschland.pdf

The PDF: https://www.bamf.de → Integration → Einbürgerung → «Gesamtfragenkatalog» (Bundesamt für Migration und
Flüchtlinge). Needs pdftotext (poppler-utils). The German text is kept as published; the right answers and the
Ukrainian translation are ours, in a1/lid/uk1.js … uk3.js (a new edition: check that they still match, the tests do).
Questions with pictures: the coat-of-arms, flag, ballot and map pictures are in a1/lid/img; the photographs of the
catalogue (credited to Deutscher Bundestag and Bundesregierung) are not copied — where one matters, the question
says what it shows.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKS = ('', '□')
# the areas of the catalogue (the BAMF curriculum «Leben in Deutschland»), with the questions on Jewish life apart
JEWISH = {59, 66, 96, 111, 118, 149, 182, 184, 206, 288}
def topic(n):
    if n in JEWISH: return 'juden'
    if 136 <= n <= 150: return 'recht'
    if 151 <= n <= 220: return 'geschichte'
    if 221 <= n <= 240: return 'europa'
    if 241 <= n: return 'leben'
    return 'staat'
IMAGES = {21: 'lid-21.webp', 209: 'lid-21.webp', 130: 'lid-130.webp', 176: 'lid-176.webp', 226: 'lid-226.webp', 'nrw1': 'lid-nrw1.webp', 'nrw8': 'lid-nrw8.webp'}

def lines(pdf):
    return subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, check=True).stdout.decode('utf-8').replace('\f', '\n').split('\n')

def section(L, start, end):
    s = next(i for i, l in enumerate(L) if re.search(start, l))
    e = next((i for i in range(s + 1, len(L)) if re.search(end, L[i])), len(L))
    return L[s:e]

def blocks(L):
    out, cur = [], None
    for l in L:
        m = re.match(r'^Aufgabe (\d+)\s*$', l.strip())
        if m:
            if cur: out.append(cur)
            cur = {'n': int(m.group(1)), 'lines': []}
        elif cur is not None: cur['lines'].append(l)
    if cur: out.append(cur)
    return out

def parse(b):
    q, opts, photo, in_opts = [], [], False, False
    for l in b['lines']:
        s = l.strip()
        if not s or re.match(r'^Seite \d+ von \d+$', s) or re.match(r'^Teil II$', s) or s.startswith('Fragen für das Bundesland'): continue
        if s.startswith('©'): photo = True; continue
        if re.match(r'^(Bild \d+\s*)+$', s):
            if s.count('Bild') == 1: opts.append(s); in_opts = True
            continue
        mk = next((m for m in MARKS if m in l), None)
        if mk: opts.append(l.split(mk, 1)[1].strip()); in_opts = True
        elif in_opts and l.startswith(' ' * 10) and opts: opts[-1] += ' ' + s
        else: q.append(s)
    text = re.sub(r'^\d+\.\s+', '', re.sub(r'\s+', ' ', ' '.join(q)).strip())
    text = re.sub(r'\s*In Anlehnung an Bundeswahlordnung \(BWO\), Anlage 26$', '', text)
    opts = [re.sub(r'\s+Teil II$', '', re.sub(r'\s+', ' ', o).strip()) for o in opts]
    return text, opts, photo

def main(pdf):
    L = lines(pdf)
    out = []
    for b in blocks(section(L, r'^\s*Teil I\s*$', r'^\s*Teil II\s*$')):
        q, o, photo = parse(b)
        out.append({'id': b['n'], 'q': q, 'o': o, 't': topic(b['n']), **({'img': IMAGES[b['n']]} if b['n'] in IMAGES else {}), **({'photo': 1} if photo else {})})
    for b in blocks(section(L, r'Fragen für das Bundesland Nordrhein-Westfalen', r'Fragen für das Bundesland (Rheinland|Saarland)')):
        q, o, photo = parse(b)
        k = f'nrw{b["n"]}'
        out.append({'id': k, 'q': q, 'o': o, 't': 'nrw', **({'img': IMAGES[k]} if k in IMAGES else {})})
    bad = [x['id'] for x in out if len(x['o']) != 4 or not x['q']]
    if len(out) != 310 or bad: sys.exit(f'{len(out)} questions, broken: {bad}')
    stand = next((m.group(1) for l in L[:10] for m in [re.search(r'Stand: (\d\d\.\d\d\.\d{4})', l)] if m), '')
    with open(os.path.join(ROOT, 'a1', 'lid', 'de.js'), 'w', encoding='utf-8') as f:
        f.write('// Made by tools/lid.py from the official catalogue of the Bundesamt für Migration und Flüchtlinge (BAMF):\n')
        f.write(f'// «Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“», Stand {stand}. The 300 general\n')
        f.write('// questions and the 10 of Nordrhein-Westfalen, the text as published. Do not edit by hand.\n')
        f.write(f'export const STAND = {json.dumps(stand)};\n')
        f.write('export const DE = [\n' + ''.join('  ' + json.dumps(x, ensure_ascii=False) + ',\n' for x in out) + '];\n')
    print(len(out), 'questions, Stand', stand)

if __name__ == '__main__':
    main(sys.argv[1])
