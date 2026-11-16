#!/usr/bin/env python3
"""Cut one ElevenLabs recording of all the lines into one .m4a per line.

Usage: python3 -I align.py <input.mp3> [extra_tail_utterances=0]
How: ffmpeg finds every short silence; a dynamic program picks the 39 silences that best match each line's expected
length (speech time is close to proportional to characters, plus a fixed cost per line), so a pause inside a line
("Not quite. | Here's why.") is not mistaken for the gap between two lines. Then verify.py transcribes every clip and
compares it with lines.json; run it after this.
Writes <key>.m4a files and clips.json next to this script.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.path.expanduser('~/bin/ffmpeg')
src = sys.argv[1]
lines = json.load(open(os.path.join(HERE, 'lines.json')))
keys = list(lines.keys())
n = len(keys)

log = subprocess.run([FFMPEG, '-hide_banner', '-i', src, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
sil = [(float(s), float(e)) for s, e in zip(re.findall(r'silence_start: ([\d.]+)', log), re.findall(r'silence_end: ([\d.]+)', log))]
h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', log).groups()
dur = int(h) * 3600 + int(m) * 60 + float(s)
mids = [(a + b) / 2 for a, b in sil if a > 0.15 and b < dur - 0.15]

# expected duration per line: fixed cost per line + per-character rate, scaled so the total matches the recording
chars = [len(re.sub(r'[^A-Za-z0-9 ]', '', lines[k])) for k in keys]
FIXED = 0.55  # breath plus the gap after a line
raw = [FIXED + 0.055 * c for c in chars]
scale = dur / sum(raw)
exp = [r * scale for r in raw]
print(f'{len(mids)} candidate cuts, {dur:.1f} s, scale {scale:.2f}')

# DP over candidate cut points: cost = sum of squared relative error of each segment against its expected length
import math
cands = [0.0] + mids + [dur]
INF = float('inf')
best = {(0, 0): (0.0, None)}  # (line index done, candidate index) -> (cost, previous candidate index)
for i in range(1, n + 1):
    for j in range(1, len(cands)):
        if i == n and j != len(cands) - 1: continue
        if i < n and j == len(cands) - 1: continue
        bc, bp = INF, None
        for p in range(0, j):
            prev = best.get((i - 1, p))
            if prev is None: continue
            seg = cands[j] - cands[p]
            if seg < 0.45: continue
            c = prev[0] + ((seg - exp[i - 1]) / exp[i - 1]) ** 2
            if c < bc: bc, bp = c, p
        if bp is not None: best[(i, j)] = (bc, bp)
end = (n, len(cands) - 1)
if end not in best: sys.exit('no alignment found')
path, cur = [], end
while cur[1] is not None and cur[0] > 0:
    path.append(cands[cur[1]]); cur = (cur[0] - 1, best[cur][1])
bounds = [0.0] + sorted(path)

TRIM = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,'
        'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse')
print(f'{"key":16} {"start":>7} {"end":>7} {"sec":>5} {"exp":>5}')
for (a, b), key, e in zip(zip(bounds, bounds[1:]), keys, exp):
    wav = os.path.join(HERE, key + '.wav'); out = os.path.join(HERE, key + '.m4a')
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-ss', f'{max(0, a - 0.04):.3f}', '-to', f'{min(dur, b + 0.04):.3f}',
                    '-af', TRIM, '-ar', '44100', '-ac', '1', wav], check=True)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', wav, out], check=True)
    os.remove(wav)
    print(f'{key:16} {a:7.2f} {b:7.2f} {b - a:5.2f} {e:5.2f}')
json.dump(keys, open(os.path.join(HERE, 'clips.json'), 'w'))
print(f'wrote {n} clips and clips.json; now run verify.py')
