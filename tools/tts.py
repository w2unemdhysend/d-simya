"""Spoken German for the app: one MP3 per phrase, word, sentence and number (the phrasebook and the games),
made once here and served as plain files from audio/. What to say comes from tools/speech.mjs.

Android's WebView (Telegram on Android) has no speech synthesis, so the phone's own voice cannot be used there.

  python3 tools/tts.py /path/to/de_DE-thorsten-high.onnx [--check] [--redo]

  --check   listen to every clip with Whisper (pip install faster-whisper; model "medium") and make it again, up to
            5 times, until Whisper hears the phrase letter for letter (spaces and capitals aside; see SPELLING); the
            voice varies a little each time, and now and then a word comes out unclear. Prints the clips that never matched.
  --redo    make every clip again, not only new or changed phrases

Voice: Piper (MIT) with "thorsten" high (dataset CC0, https://github.com/thorstenMueller/Thorsten-Voice),
from https://huggingface.co/rhasspy/piper-voices. Needs: pip install piper-tts; ffmpeg with libmp3lame; node.
Writes audio/<hash>.mp3 (name = first 10 hex of sha1 of what is said, so a changed text or pronunciation gets a new
file and phones never keep an old one) and audio/index.js (text → file). Files nothing uses are removed.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, wave
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio')

def entries():
    return json.loads(subprocess.check_output(['node', os.path.join(ROOT, 'tools', 'speech.mjs')], cwd=ROOT))

# Words the voice's pronunciation rules (espeak-ng) get wrong, as the sounds to say instead (same symbols as espeak):
# stress on the wrong syllable, a short vowel that is long, "Bon" said like "Bohn", "Hals|schmerzen" split wrongly,
# the "d" of "Pfand" lost before "fl" (heard as "Pfannflaschen").
FIX = {
    'allergisch': 'alˈɛɾɡɪʃ', 'Kassenbon': 'kˈasənbˌɔŋ', 'abgeholt': 'ˈapɡəhˌoːlt', 'Halsschmerzen': 'hˈalsʃmˌɛɾtsən',
    'Telefonnummer': 'tˌeːləfˈoːnnˌʊmɜ', 'Haltestelle': 'hˈaltəʃtˌɛlə', 'rezeptfrei': 'reːtsˈɛptfrˌaɪ', 'zuzahlen': 'tsˈuːtsˌɑːlən',
    'Pfandflaschen': 'pfˈantʰflˌaʃən', 'Nachbarin': 'nˈaxbɑːrˌɪn', 'Unterlagen': 'ˈʊntɜlˌɑːɡən', 'etwas': 'ˈɛtvas',
    # the A1 dictionary: stress (Toilette, Tablette, kaputt, Studentin…), long vowels (Blume, Tafel, Spanien), loanwords
    # (Chefin with "sch", Ingenieur and Orange with "zh", T-Shirt, Cousin), "st" as "scht" in
    # Werkstatt and Innenstadt, "ch" in Sprechstunde
    'Toilette': 'toalˈɛtə', 'Tablette': 'tablˈɛtə', 'Karotte': 'karˈɔtə', 'Marmelade': 'maɾməlˈɑːdə', 'Rabatt': 'rabˈat',
    'kaputt': 'kapˈʊt', 'Werkstatt': 'vˈɛɾkʃtat', 'Innenstadt': 'ˈɪnənʃtat', 'Stadtplan': 'ʃtˈatplɑːn', 'Sprechstunde': 'ʃprˈɛçʃtʊndə',
    'Enkelin': 'ˈɛŋkəlɪn', 'Studentin': 'ʃtuːdˈɛntɪn', 'Friseurin': 'friːzˈøːrɪn', 'Programmiererin': 'proːɡramˈiːrərɪn',
    'Chefin': 'ʃˈɛfɪn', 'Ingenieur': 'ɪnʒeːnjˈøːɾ', 'Ingenieurin': 'ɪnʒeːnjˈøːrɪn', 'Orange': 'oːrˈɑ̃ːʒə', 'Cousin': 'kuːzˈɛ̃ː',
    'T-Shirt': 'tˈiːʃœɾt', 'Handynummer': 'hˈɛndinˌʊmɜ',
    'Blume': 'blˈuːmə', 'Bluse': 'blˈuːzə', 'Tafel': 'tˈɑːfəl', 'Datum': 'dˈɑːtʊm', 'Spanien': 'ʃpˈɑːnɪʲən', 'Spanisch': 'ʃpˈɑːnɪʃ',
    'Arabisch': 'arˈɑːbɪʃ', 'Badewanne': 'bˈɑːdəvˌanə', 'Spaziergang': 'ʃpatsˈiːɾɡaŋ', 'Wurst': 'vˈʊɾst', 'Appetit': 'apeːtˈiːt',
    'Erdbeere': 'ˈeːɾtbeːrə', 'Unterkunft': 'ˈʊntɜkʊnft', 'Quadratmeter': 'kvadrˈɑːtmˌeːtɜ', 'Radiergummi': 'radˈiːɾɡʊmiː',
    'Wiedersehen': 'vˈiːdɜzˌeːən', 'heiraten': 'hˈaɪrɑːtən', 'zusagen': 'tsˈuːzɑːɡən', 'Speisekarte': 'ʃpˈaɪzəkˌaɾtə',
    'Joghurt': 'jˈoːɡʊɾt', 'Einladung': 'ˈaɪnlˌɑːdʊŋ', 'Straßenbahn': 'ʃtrˈɑːsənbˌɑːn', 'geradeaus': 'ɡərɑːdəʔˈaʊs',
    'Pflegekraft': 'pflˈeːɡəkrˌaft', 'Bäckerei': 'bɛkərˈaɪ', 'Metzgerei': 'mɛtsɡərˈaɪ', 'Kopfschmerzen': 'kˈɔpfʃmˌɛɾtsən',
    'Bauchschmerzen': 'bˈaʊxʃmˌɛɾtsən', 'Rathaus': 'rˈɑːthˌaʊs', 'Kakao': 'kakˈaʊ', 'Mineralwasser': 'mineːrˈɑːlvasɜ',
    'Wochenende': 'vˈɔxənʔˌɛndə', 'Mittagessen': 'mˈɪtɑːkʔˌɛsən', 'Bleistift': 'blˈaɪʃtɪft', 'Arzt': 'ˈɑːɾtst', 'Ärztin': 'ˈɛːɾtstɪn',
    'Kurs': 'kˈʊɾs', 'Hotel': 'hoːtˈɛl', 'Unterricht': 'ˈʊntɜrɪçt', 'Nachbar': 'nˈaxbɑːɾ', 'Ehemann': 'ˈeːəmˌan', 'Ehefrau': 'ˈeːəfrˌaʊ',
    'Nationalität': 'natsjoːnaliːtˈɛːt', 'Hochzeit': 'hˈɔxtsaɪt', 'verheiratet': 'fɛɾhˈaɪrɑːtət', 'Schlafzimmer': 'ʃlˈɑːftsˌɪmɜ',
    'Erdgeschoss': 'ˈeːɾtɡəʃˌɔs', 'Fußball': 'fˈuːsbal', 'Fitnessstudio': 'fˈɪtnɛsʃtˌuːdioː', 'damals': 'dˈɑːmɑːls', 'Müsli': 'mˈyːsliː',
    'Hals': 'hˈals', 'Wartezimmer': 'vˈaɾtətsˌɪmɜ', 'Notfall': 'nˈoːtfal', 'Februar': 'fˈeːbruːˌɑːɾ', 'August': 'aʊɡˈʊst',
    'Jahreszeit': 'jˈɑːrəstsˌaɪt', 'kennenlernen': 'kˈɛnənlˌɛɾnən', 'Weihnachten': 'vˈaɪnaxtən', 'Weihnachtsmarkt': 'vˈaɪnaxtsmˌaɾkt',
    'Silvester': 'zɪlvˈɛstɜ', 'Pullover': 'pʊlˈoːvɜ', 'orange': 'oːrˈɑ̃ːʒə',
    # A2: letters said one by one (ICE), Ukrainian names (Kyjiw, Pampuschky with the stress of «пампу́шки»), "be-" and
    # "-e-" as a weak e (Meldebestätigung, Stickerei, Reisezentrum), long vowels (Notdienst, Gutschein, Pfannkuchen),
    # short ones (dünsten), the stress of Zuzahlung, Zutat, Integrationskurs, Regionalbahn, Lutschtablette
    'ICE': 'iːtseːˈeː', 'Kyjiw': 'kˈɪjɪf', 'Pampuschky': 'pampˈʊʃkiː',
    'Stickerei': 'ʃtɪkərˈaɪ', 'Stickereien': 'ʃtɪkərˈaɪən', 'Umkleidekabine': 'ˈʊmklaɪdəkabˌiːnə', 'Umkleidekabinen': 'ˈʊmklaɪdəkabˌiːnən',
    'Gutschein': 'ɡˈuːtʃaɪn', 'Gutscheine': 'ɡˈuːtʃaɪnə', 'Kassenbons': 'kˈasənbˌɔŋs',
    'Zuzahlung': 'tsˈuːtsˌɑːlʊŋ', 'Zuzahlungen': 'tsˈuːtsˌɑːlʊŋən', 'Notdienst': 'nˈoːtdiːnst', 'Notdienste': 'nˈoːtdiːnstə',
    'Reisezentrum': 'rˈaɪzətsˌɛntrʊm', 'Reisezentren': 'rˈaɪzətsˌɛntrən', 'Regionalbahn': 'reːɡjoːnˈɑːlbɑːn',
    'Regionalbahnen': 'reːɡjoːnˈɑːlbɑːnən', 'Regionalzüge': 'reːɡjoːnˈɑːltsyːɡə', 'Pfannkuchen': 'pfˈankuːxən',
    'bewusstlos': 'bəvˈʊstloːs', 'Integrationskurs': 'ɪntəɡratsjˈoːnskʊɾs', 'Integrationskurse': 'ɪntəɡratsjˈoːnskʊɾzə',
    'Einstufungstest': 'ˈaɪnʃtuːfʊŋstˌɛst', 'Einstufungstests': 'ˈaɪnʃtuːfʊŋstˌɛsts',
    'Meldebestätigung': 'mˈɛldəbəʃtˌɛːtɪɡʊŋ', 'Meldebestätigungen': 'mˈɛldəbəʃtˌɛːtɪɡʊŋən',
    'Wohnungsgeberbestätigung': 'vˈoːnʊŋsɡeːbɜbəʃtˌɛːtɪɡʊŋ', 'Wohnungsgeberbestätigungen': 'vˈoːnʊŋsɡeːbɜbəʃtˌɛːtɪɡʊŋən',
    'Anrufbeantworter': 'ˈanruːfbəʔˌantvɔɾtɜ', 'dünsten': 'dˈʏnstən', 'dünstet': 'dˈʏnstət', 'gedünstet': 'ɡədˈʏnstət',
    'Zutat': 'tsˈuːtɑːt', 'Zutaten': 'tsˈuːtɑːtən', 'Lutschtablette': 'lˈʊtʃtablˌɛtə', 'Lutschtabletten': 'lˈʊtʃtablˌɛtən',
    'Nasenspray': 'nˈɑːzənʃprˌeː', 'Nasensprays': 'nˈɑːzənʃprˌeːs',
}

# Words that come out clearer when written another way (checked with Whisper: three takes out of three right).
# "acht Cent" run together is heard as "achtzehn"; a breath between the two words keeps it 0,08 €.
# "USA" is said letter by letter.
RESPELL = {'Versichertenkarte': 'Versicherten-Karte', 'acht Cent': 'acht, Cent', 'USA': 'U-S-A'}
# Whisper cannot write some words it hears right ("Kassenbon" said [bɔŋ] comes back as "Kassenbogen"; "gern" as "gerne"):
# letters it may miss in a phrase with such a word
SPELLING = {'Kassenbon': 3, 'gern': 1, 'Herrn': 1}

def spoken(text):
    # "…" marks a word to fill in: a short pause; "a / b" are two forms: say both
    t = re.sub(r'\s*…\s*', ', ', text)
    t = re.sub(r'\s*/\s*', ', ', t)
    t = re.sub(r',\s*([,.?!])', r'\1', t).strip(' ,')
    for w, r in RESPELL.items(): t = re.sub(r'\b' + w + r'\b', r, t)
    # a text without a full stop is said like the end of a sentence, too: without one the voice swallows a final
    # unstressed syllable ("die Lampe" came out as "die Lamp", "der Trockner" as "der Trockne")
    if not re.search(r'[.?!]$', t): t += '.'
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
    def miss(self, path, text, check=None):
        import numpy as np
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
        # half a second of quiet around the clip: on a clip that starts with its first sound Whisper tends to miss a short
        # first word ("der", "die") or to invent text for a single word
        quiet = np.zeros(8000, np.float32)
        audio = np.concatenate([quiet, np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, quiet])
        segs, _ = self.m.transcribe(audio, language='de', beam_size=5, condition_on_previous_text=False)
        heard = ' '.join(s.text.strip() for s in segs)
        miss = distance(letters(re.sub(r'\s*/\s*', ' ', text)), letters(heard))
        # numbers: Whisper often writes digits ("23,90 €", "14:30 Uhr"); those count when they are the right ones
        if check and miss and re.sub(r'\D', '', heard) in check.get('digits', []) and all(w in letters(heard) for w in check.get('words', [])):
            miss = 0
        return miss, heard

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
    todo, made = entries(), {}
    for entry in todo:
        text = entry['text']
        f = name(text); made[text] = f
        dst = os.path.join(OUT, f)
        if os.path.exists(dst) and not redo: continue
        if not ear: make(voice, cfg, text, dst); print('made', f, text); continue
        best = None
        for take in range(5):
            tmp = dst + '.take.mp3'
            make(voice, cfg, text, tmp)
            miss, heard = ear.miss(tmp, text, entry.get('check'))
            if best is None or miss < best[0]: os.replace(tmp, dst); best = (miss, heard)
            else: os.remove(tmp)
            if miss <= slack(text): break
        print('made', f, f'take {take + 1}, off by {best[0]}:', text, '|', best[1])
        if best[0] > slack(text): unclear.append((text, best[1]))
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in made.values(): os.remove(os.path.join(OUT, f)); print('removed', f)
    with open(os.path.join(OUT, 'index.js'), 'w') as o:
        o.write('// Made by tools/tts.py: German text → its MP3 in this folder (Piper, voice "thorsten", CC0). Do not edit by hand.\n')
        o.write('export const AUDIO = ' + json.dumps(made, ensure_ascii=False, indent=0).replace('\n', '\n  ').replace('\n  }', '\n}') + ';\n')
    print(len(made), 'phrases,', sum(os.path.getsize(os.path.join(OUT, f)) for f in set(made.values())) // 1024, 'KB')
    for text, heard in unclear: print('never heard as written:', text, '|', heard)

if __name__ == '__main__':
    main(sys.argv[1], check='--check' in sys.argv, redo='--redo' in sys.argv)
