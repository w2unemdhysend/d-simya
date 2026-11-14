"""The coach's voice of «Тренування»: one MP3 per exercise name and per phrase (sport/coach.js PHRASES), in Ukrainian,
a woman's and a man's voice, made once here and served as plain files from sport/audio/.

  python3 tools/coach.py /path/to/voices [--check] [--redo]

  /path/to/voices  the folder with uk_UA-tetiana-high.onnx (woman) and uk_UA-oleksa-high.onnx (man), with their .json
  --check   listen to every clip with Whisper (pip install faster-whisper; model "small") and make it again, up to
            5 times, until Whisper hears the words as written (letters only); prints the clips that never matched
  --redo    make every clip again, not only new or changed ones

Voices: Piper (MIT) "tetiana" and "oleksa", high quality, from https://huggingface.co/rhasspy/piper-voices
(trained on the open Ukrainian TTS datasets; see the voices' MODEL_CARD). Needs: pip install piper-tts; ffmpeg with
libmp3lame; node. Writes sport/audio/<f|m>-<hash>.mp3 (hash of the voice and of what is said, so a changed text or
stress gets a new file and phones never keep an old one) and sport/audio/index.js (key → file). Files nothing uses
are removed.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, wave
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'sport', 'audio')
VOICES = {'f': 'uk_UA-tetiana-high.onnx', 'm': 'uk_UA-oleksa-high.onnx'}

def texts():
    js = ("const { PHRASES } = await import('./sport/coach.js'); const { MOVES } = await import('./sport/moves.js');"
          "const o = { ...PHRASES }; for (const m of MOVES) o[m.id] = m.uk; console.log(JSON.stringify(o));")
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))

# Words whose stress the voice's rules (espeak-ng) put on the wrong syllable, as the sounds to say instead
# (the same symbols as espeak's own; only the stress mark moved)
FIX = {
    'приготуйся': 'prɪhot̪ˈujsja', 'почали': 'potʃalˈɪ', 'секунд': 'sɛkˈund', 'молодець': 'molodˈɛts', 'один': 'odˈɪn',
    'присідання': 'prɪsiːdˈanɲa', 'стільця': 'st̪iːʎtsjˈa', 'назад': 'nazˈad', 'сторону': 'st̪ˈoronu', 'носки': 'noskˈɪ',
    'ягідний': 'jˈahiːdnɪj', 'ноги': 'nohˈɪ', 'віджимання': 'βiːdʒɪmˈanɲa', 'стіни': 'st̪iːnˈɪ', 'колін': 'koʎˈiːn',
    'супермен': 'supɛrmˈɛn', 'скелелаз': 'skɛlɛlˈaz', 'грудей': 'hrudˈɛj', 'стегна': 'st̪ɛhnˈa', 'стрибки': 'st̪rɪpkˈɪ',
    'зірочка': 'zˈiːrotʃka',
}

def spoken(text):
    # quotes would be read out as words («відкриті лапки»); a name without a full stop gets one, so it ends calmly
    t = re.sub(r'[«»"„“]', '', text).strip()
    if not re.search(r'[.?!]$', t): t += '.'
    # the punctuation after such a word goes inside the brackets: outside, the voice reads it out («кома», «знак оклику»)
    for w, ph in FIX.items(): t = re.sub(r'(?<![\w])' + w + r'(?![\w])([.,!?]?)', lambda m: '[[ ' + ph + m.group(1) + ' ]]', t, flags=re.IGNORECASE)
    return t

def name(v, text):
    return v + '-' + hashlib.sha1((VOICES[v] + '|' + spoken(text)).encode('utf-8')).hexdigest()[:10] + '.mp3'

def letters(t):
    return re.sub(r'[^а-щьюяєіїґ]', '', t.lower())

def distance(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, y in enumerate(b, 1): prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (x != y))
    return d[-1]

class Listener:
    def __init__(self):
        from faster_whisper import WhisperModel
        self.m = WhisperModel('small', device='cpu', compute_type='int8')
    def miss(self, path, text):
        import numpy as np
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
        quiet = np.zeros(8000, np.float32)
        audio = np.concatenate([quiet, np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, quiet])
        segs, _ = self.m.transcribe(audio, language='uk', beam_size=5, condition_on_previous_text=False)
        heard = ' '.join(s.text.strip() for s in segs)
        # numbers come back as digits
        heard_l = letters(heard.replace('10', 'десять').replace('3', 'три').replace('2', 'два').replace('1', 'один'))
        return distance(letters(text), heard_l), heard

def make(voice, cfg, text, dst):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        with wave.open(tmp.name, 'wb') as w: voice.synthesize_wav(spoken(text), w, syn_config=cfg)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp.name, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.08',
                        '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '40k', '-map_metadata', '-1', '-id3v2_version', '0', dst], check=True)

def main(folder, check=False, redo=False):
    os.makedirs(OUT, exist_ok=True)
    todo, made = texts(), {v: {} for v in VOICES}
    ear = Listener() if check else None
    unclear = []
    for v, model in VOICES.items():
        voice = PiperVoice.load(os.path.join(folder, model))
        known = set(voice.config.phoneme_id_map)
        for w, ph in FIX.items():
            bad = [c for c in ph if c not in known]
            if bad: sys.exit(f'{w}: the voice has no sound for {bad}')
        cfg = SynthesisConfig(length_scale=1.0, noise_scale=0.5)
        for key, text in todo.items():
            f = name(v, text); made[v][key] = f
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
                if miss <= 1: break
            print('made', f, f'take {take + 1}, off by {best[0]}:', text, '|', best[1])
            if best[0] > 1: unclear.append((v, text, best[1]))
    used = {f for m in made.values() for f in m.values()}
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in used: os.remove(os.path.join(OUT, f)); print('removed', f)
    with open(os.path.join(OUT, 'index.js'), 'w') as o:
        o.write('// Made by tools/coach.py: what the coach says → its MP3 in this folder, f: a woman\'s voice (Piper "tetiana"),\n')
        o.write('// m: a man\'s (Piper "oleksa"). Do not edit by hand.\n')
        o.write('export const CLIPS = ' + json.dumps(made, ensure_ascii=False, indent=1) + ';\n')
    print(len(todo), 'clips per voice,', sum(os.path.getsize(os.path.join(OUT, f)) for f in used) // 1024, 'KB')
    for v, text, heard in unclear: print('never heard as written:', v, text, '|', heard)

if __name__ == '__main__':
    main(sys.argv[1], check='--check' in sys.argv, redo='--redo' in sys.argv)
