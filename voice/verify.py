#!/usr/bin/env python3
"""Check every voice clip says its line: Gemini transcribes the clips in batches, the script compares against lines.json.
Usage: python3 -I verify.py   (prints OK or MISMATCH per key; exit 1 if any mismatch)"""
import base64, json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
KEY = open(os.path.expanduser('~/.config/gemini/key')).read().strip()
MODELS = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest', 'gemini-3.8-flash']
lines = json.load(open(os.path.join(HERE, 'lines.json')))
keys = json.load(open(os.path.join(HERE, 'clips.json')))
norm = lambda s: re.sub(r'[^a-z0-9 ]', '', s.lower().replace("'", '')).split()

def ask(parts):
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseMimeType': 'application/json', 'temperature': 0}}
    last = None
    for model in MODELS:
        req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                                     data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': KEY})
        try:
            out = json.load(urllib.request.urlopen(req, timeout=180))
            return json.loads(out['candidates'][0]['content']['parts'][0]['text'])
        except Exception as e:
            last = f'{model}: {e}'
    sys.exit('Gemini failed: ' + str(last))

bad = 0
B = 8
for i in range(0, len(keys), B):
    batch = keys[i:i + B]
    parts = [{'text': f'Transcribe each of these {len(batch)} short clips exactly, word for word. Return JSON: an object mapping the clip number (as a string) to its transcript.'}]
    for n, k in enumerate(batch, 1):
        parts.append({'text': f'Clip {n}:'})
        parts.append({'inline_data': {'mime_type': 'audio/mp4', 'data': base64.b64encode(open(os.path.join(HERE, k + '.m4a'), 'rb').read()).decode()}})
    got = ask(parts)
    for n, k in enumerate(batch, 1):
        heard = str(got.get(str(n), ''))
        want, have = norm(lines[k]), norm(heard)
        # tolerate small ASR slips: at least 70% of the expected words present and no more than 2 extra words
        hit = sum(1 for w in want if w in have)
        ok = hit >= max(1, round(0.7 * len(want))) and len(have) - len(want) <= 2
        bad += 0 if ok else 1
        print(f'{"OK      " if ok else "MISMATCH"} {k:16} want: {lines[k]!r:60} heard: {heard!r}')
print(f'{len(keys) - bad} of {len(keys)} clips match')
sys.exit(1 if bad else 0)
