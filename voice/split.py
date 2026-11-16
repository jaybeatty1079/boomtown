#!/usr/bin/env python3
"""Split one ElevenLabs mp3 (all lines read with pauses between them) into one .m4a per line.

Usage: python3 split.py <input.mp3> [min_silence_s=0.55] [threshold_dB=-35]
Reads lines.json (order = clip order), finds silences with ffmpeg, cuts at silence midpoints,
trims 60 ms of padding, converts each piece to AAC .m4a next to this script, and writes clips.json (the keys that exist).
Prints the count and stops with a clear error if the number of pieces does not match lines.json.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.path.expanduser('~/bin/ffmpeg')
src = sys.argv[1]
min_sil = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55
thresh = sys.argv[3] if len(sys.argv) > 3 else '-35'
keys = list(json.load(open(os.path.join(HERE, 'lines.json'))).keys())

log = subprocess.run([FFMPEG, '-hide_banner', '-i', src, '-af', f'silencedetect=noise={thresh}dB:d={min_sil}', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
starts = [float(m) for m in re.findall(r'silence_start: ([\d.]+)', log)]
ends = [float(m) for m in re.findall(r'silence_end: ([\d.]+)', log)]
dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', log).groups()[2]) + 60 * int(re.search(r'Duration: (\d+):(\d+)', log).group(2))
# cut points: midpoint of each silence that is strictly inside the file
cuts = [(s + e) / 2 for s, e in zip(starts, ends) if s > 0.2 and e < dur - 0.2]
bounds = [0.0] + cuts + [dur]
pieces = list(zip(bounds[:-1], bounds[1:]))
if len(pieces) != len(keys):
    sys.exit(f'found {len(pieces)} pieces but lines.json has {len(keys)} lines; adjust min_silence or threshold '
             f'(silences at: {[round(c, 2) for c in cuts]})')
for (a, b), key in zip(pieces, keys):
    wav = os.path.join(HERE, key + '.wav'); out = os.path.join(HERE, key + '.m4a')
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-ss', f'{max(0, a - 0.06):.3f}', '-to', f'{min(dur, b + 0.06):.3f}',
                    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse',
                    '-ar', '44100', '-ac', '1', wav], check=True)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '64000', wav, out], check=True)
    os.remove(wav)
json.dump(keys, open(os.path.join(HERE, 'clips.json'), 'w'))  # the game only requests clips listed here (no 404s)
print(f'wrote {len(pieces)} clips and clips.json to {HERE}')
