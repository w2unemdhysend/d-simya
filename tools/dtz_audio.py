"""The DTZ listening test of «Німецька» (a1/dtz/hoeren.js) as recordings: one MP3 per text, a man's and a woman's
German voice, the lines of a conversation one after another with a short pause.

  python3 tools/dtz_audio.py /path/to/voices

  /path/to/voices  the folder with de_DE-thorsten-high.onnx (m) and de_DE-kerstin-low.onnx (f), with their .json
                   (Piper voices, datasets CC0: https://huggingface.co/rhasspy/piper-voices)

Needs: pip install piper-tts; ffmpeg; node. Writes a1/dtz/audio/<id>-<hash>.mp3 (the hash of what is said, so a
changed text gets a new file) and a1/dtz/audio/index.js (id → file). Files nothing uses are removed.
"""
import hashlib, json, os, subprocess, sys, tempfile, wave
from piper import PiperVoice, SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'a1', 'dtz', 'audio')
VOICES = {'m': 'de_DE-thorsten-high.onnx', 'f': 'de_DE-kerstin-low.onnx'}

def clips():
    js = ("const { HOEREN } = await import('./a1/dtz/hoeren.js'); const out = {};"
          "for (const h of HOEREN) { if (h.lines) out[h.id] = h.lines; (h.people || []).forEach((p, i) => { out[h.id + '-' + (i + 1)] = p.lines; }); }"
          "console.log(JSON.stringify(out));")
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))

def main(folder):
    os.makedirs(OUT, exist_ok=True)
    voices = {k: PiperVoice.load(os.path.join(folder, v)) for k, v in VOICES.items()}
    cfg = SynthesisConfig(length_scale=1.05, noise_scale=0.55)
    made = {}
    for cid, lines in clips().items():
        h = hashlib.sha1(json.dumps([VOICES, lines], ensure_ascii=False).encode('utf-8')).hexdigest()[:10]
        name = f'{cid}-{h}.mp3'; made[cid] = name
        dst = os.path.join(OUT, name)
        if os.path.exists(dst): continue
        with tempfile.TemporaryDirectory() as tmp:
            parts = []
            for i, (who, text) in enumerate(lines):
                p = os.path.join(tmp, f'{i}.wav')
                with wave.open(p, 'wb') as w: voices[who].synthesize_wav(text, w, syn_config=cfg)
                # the same rate for all, and a pause after each line (a conversation breathes)
                q = os.path.join(tmp, f'{i}.r.wav')
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-af', 'apad=pad_dur=0.45', '-ar', '22050', '-ac', '1', q], check=True)
                parts.append(q)
            lst = os.path.join(tmp, 'list.txt')
            with open(lst, 'w') as f: f.write(''.join(f"file '{x}'\n" for x in parts))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'libmp3lame', '-b:a', '48k', '-map_metadata', '-1', '-id3v2_version', '0', dst], check=True)
        print('made', name)
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and f not in made.values(): os.remove(os.path.join(OUT, f)); print('removed', f)
    with open(os.path.join(OUT, 'index.js'), 'w') as o:
        o.write('// Made by tools/dtz_audio.py: the DTZ listening texts → their MP3 in this folder (Piper, voices «thorsten» and «kerstin», CC0). Do not edit by hand.\n')
        o.write('export const CLIPS = ' + json.dumps(made, indent=1) + ';\n')
    print(len(made), 'clips,', sum(os.path.getsize(os.path.join(OUT, f)) for f in made.values()) // 1024, 'KB')

if __name__ == '__main__':
    main(sys.argv[1])
