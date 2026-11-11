"""Spoken German for the phrasebook (Розмовник): one MP3 per phrase, made once here, served as plain files.

Android's WebView (Telegram on Android) has no speech synthesis, so the phone's own voice cannot be used there.

  python3 tools/tts.py /path/to/de_DE-thorsten-high.onnx [--check] [--redo]

  --check   listen to every clip with Whisper (pip install faster-whisper; model "medium") and make it again, up to
            5 times, until Whisper hears the phrase letter for letter (spaces and capitals aside; see SPELLING); the
            voice varies a little each time, and now and then a word comes out unclear. Prints the clips that never matched.
  --redo    make every clip again, not only new or changed phrases

Voice: Piper (MIT) with "thorsten" high (dataset CC0, https://github.com/thorstenMueller/Thorsten-Voice),
from https://huggingface.co/rhasspy/piper-voices. Needs: pip install piper-tts; ffmpeg with libmp3lame; node.
Writes rozmovnyk/audio/<hash>.mp3 (name = first 10 hex of sha1 of the German text, so a changed phrase gets a new
file and phones never keep an old one) and rozmovnyk/audio.js (text → file). Files no phrase uses are removed.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, wave
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'rozmovnyk', 'audio')

def phrases():
    js = "import('./rozmovnyk/phrases.js').then(m => console.log(JSON.stringify(m.SITUATIONS.flatMap(s => s.list.map(p => p[0])))))"
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))

# Words the voice's pronunciation rules (espeak-ng) get wrong, as the sounds to say instead (same symbols as espeak):
# stress on the wrong syllable, a short vowel that is long, "Bon" said like "Bohn", "Hals|schmerzen" split wrongly,
# the "d" of "Pfand" lost before "fl" (heard as "Pfannflaschen").
FIX = {
    'allergisch': 'alˈɛɾɡɪʃ', 'Kassenbon': 'kˈasənbˌɔŋ', 'abgeholt': 'ˈapɡəhˌoːlt', 'Halsschmerzen': 'hˈalsʃmˌɛɾtsən',
    'Telefonnummer': 'tˌeːləfˈoːnnˌʊmɜ', 'Haltestelle': 'hˈaltəʃtˌɛlə', 'rezeptfrei': 'reːtsˈɛptfrˌaɪ', 'zuzahlen': 'tsˈuːtsˌɑːlən',
    'Pfandflaschen': 'pfˈantʰflˌaʃən', 'Nachbarin': 'nˈaxbɑːrˌɪn', 'Unterlagen': 'ˈʊntɜlˌɑːɡən', 'etwas': 'ˈɛtvas',
}

# Words that come out clearer when written another way (checked with Whisper: three takes out of three right)
RESPELL = {'Versichertenkarte': 'Versicherten-Karte'}
# Whisper cannot write some words it hears right ("Kassenbon" said [bɔŋ] comes back as "Kassenbogen"; "gern" as "gerne"):
# letters it may miss in a phrase with such a word
SPELLING = {'Kassenbon': 3, 'gern': 1, 'Herrn': 1}

def spoken(text):
    # "…" marks a word to fill in: a short pause; "a / b" are two forms: say both
    t = re.sub(r'\s*…\s*', ', ', text)
    t = re.sub(r'\s*/\s*', ', ', t)
    t = re.sub(r',\s*([,.?!])', r'\1', t).strip(' ,')
    for w, r in RESPELL.items(): t = re.sub(r'\b' + w + r'\b', r, t)
    for w, ph in FIX.items(): t = re.sub(r'\b' + w + r'\b', '[[ ' + ph + ' ]]', t)
    return t

def name(text):
    # from what is said, not only the text: a better pronunciation is a new file, and no phone keeps the old one
    return hashlib.sha1(spoken(text).encode('utf-8')).hexdigest()[:10] + '.mp3'

def letters(t):
    return re.sub(r'[^a-zäöüß]', '', t.lower().replace('…', ''))

def distance(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, y in enumerate(b, 1): prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (x != y))
    return d[-1]

class Listener:
    # How far what Whisper hears is from the phrase, in letters (spaces and spelling of compounds do not count)
    def __init__(self):
        from faster_whisper import WhisperModel
        self.m = WhisperModel('medium', device='cpu', compute_type='int8')
    def miss(self, path, text):
        import numpy as np
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
        segs, _ = self.m.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, language='de', beam_size=5)
        heard = ' '.join(s.text.strip() for s in segs)
        return distance(letters(re.sub(r'\s*/\s*', ' ', text)), letters(heard)), heard

def slack(text):
    return sum(n for w, n in SPELLING.items() if re.search(r'\b' + w + r'\b', text))

def make(voice, cfg, text, dst):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        with wave.open(tmp.name, 'wb') as w: voice.synthesize_wav(spoken(text), w, syn_config=cfg)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp.name, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.12',
                        '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '40k', '-map_metadata', '-1', '-id3v2_version', '0', dst], check=True)

def main(model, check=False, redo=False):
    voice = PiperVoice.load(model)
    known = set(voice.config.phoneme_id_map)
    for w, ph in FIX.items():
        bad = [c for c in ph if c not in known]
        if bad: sys.exit(f'{w}: the voice has no sound for {bad}')
    cfg = SynthesisConfig(length_scale=1.12, noise_scale=0.5)   # a little slower than normal speech, for learners; steadier
    ear = Listener() if check else None
    unclear = []
    os.makedirs(OUT, exist_ok=True)
    todo, made = phrases(), {}
    for text in todo:
        f = name(text); made[text] = f
        dst = os.path.join(OUT, f)
        if os.path.exists(dst) and not redo: continue
        if not ear: make(voice, cfg, text, dst); print('made', f, text); continue
        best = None
        for take in range(5):
            tmp = dst + '.take.mp3'
            make(voice, cfg, text, tmp)
            miss, heard = ear.miss(tmp, text)
            if best is None or miss < best[0]: os.replace(tmp, dst); best = (miss, heard)
            else: os.remove(tmp)
            if miss <= slack(text): break
        print('made', f, f'take {take + 1}, off by {best[0]}:', text, '|', best[1])
        if best[0] > slack(text): unclear.append((text, best[1]))
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in made.values(): os.remove(os.path.join(OUT, f)); print('removed', f)
    with open(os.path.join(ROOT, 'rozmovnyk', 'audio.js'), 'w') as o:
        o.write('// Made by tools/tts.py: German phrase → its MP3 in rozmovnyk/audio/ (Piper, voice "thorsten", CC0). Do not edit by hand.\n')
        o.write('export const AUDIO = ' + json.dumps(made, ensure_ascii=False, indent=0).replace('\n', '\n  ').replace('\n  }', '\n}') + ';\n')
    print(len(made), 'phrases,', sum(os.path.getsize(os.path.join(OUT, f)) for f in set(made.values())) // 1024, 'KB')
    for text, heard in unclear: print('never heard as written:', text, '|', heard)

if __name__ == '__main__':
    main(sys.argv[1], check='--check' in sys.argv, redo='--redo' in sys.argv)
