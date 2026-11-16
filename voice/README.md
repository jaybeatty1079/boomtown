# Boomtown voice lines

`lines.json` holds the 40 lines (key → text) the game can say through `BT.voice.say(key)`. The clips live next to it as
`<key>.m4a`, and `clips.json` lists the keys that have a clip (`split.py` writes it; it is `[]` until then). The game only
requests clips in that list, so nothing 404s and it plays fine with no clips at all.

## Regenerate the clips (ElevenLabs)

Voice: **Jessica** (not Hope or Jessica, which other games in this house already use). Settings: stability 50, similarity 75.

1. Open ElevenLabs Text to Speech, pick Jessica, set stability 50 and similarity 75.
2. Paste the lines from `lines.json` in order, one per paragraph, separated by `<break time="1.3s" />`. One-liner to build the text:

       python3 -c "import json; print(' <break time=\"1.3s\" /> '.join(json.load(open('voice/lines.json')).values()))" | pbcopy

3. Generate once and download the mp3 (the whole script is about 40 lines; one generation fits the starter plan).
4. Split it into clips:

       python3 voice/split.py ~/Downloads/boomtown-voice.mp3

   It finds the pauses with ffmpeg (`~/bin/ffmpeg`), cuts at their midpoints, trims the edges, writes one 64 kbps AAC `.m4a` per key
   plus `clips.json`, and stops with a clear error if the number of pieces does not match `lines.json` (then adjust the min-silence
   or threshold arguments). Hand-made clips: add their keys to `clips.json` yourself.

5. Reload the game: `BT.voice.say('payday')` in the console should talk.

## In the game

- Settings → Sound has three switches: **Sound effects** (everything), **Music** and **Voice lines**. Read-aloud (the 🔊 **Read it**
  button on every round, `BT.voice.read(text)`) uses the iPad's own speech voice (Samantha when present) and follows only Sound effects.
- Music ducks to 40% while a clip plays. No voice lines during a reading passage.
- `js/voice.js` keeps the list of keys the hooks use (`BT.voice.used`); `BT.test.run()` fails if one is missing from `lines.json`.
- In `?test=1` nothing plays; keys and read texts land in `BT.test.spoken`.
