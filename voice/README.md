# Boomtown voice lines

`lines.json` holds the 40 lines (key → text) the game can say through `BT.voice.say(key)`. The clips live next to it as
`<key>.m4a`, and `clips.json` lists the keys that have a clip (`split.py` writes it; it is `[]` until then). The game only
requests clips in that list, so nothing 404s and it plays fine with no clips at all.

## Regenerate the clips (ElevenLabs)

Voice: **Jessica** (playful, bright, warm; not Hope, which Word Hunter already uses). Settings: stability 50, similarity 75.

1. Open ElevenLabs Text to Speech, pick Jessica, set stability 50 and similarity 75.
2. Paste the lines from `lines.json` in order, one per line. (Eleven v4 in the web app ignored `<break>` tags on 2026-11-16: the
   pauses between lines came out as short as the pauses inside a line, about 0.4 s, so do not count on tags for spacing.)
3. Generate once and download the mp3 (about 1,700 characters; the app made two takes and charged 900 credits).
4. Cut it into clips and check them:

       python3 -I voice/align.py ~/Downloads/<the ElevenLabs mp3>
       python3 -I voice/verify.py

   `align.py` finds every short silence with ffmpeg (`~/bin/ffmpeg`) and picks the 39 cuts that best fit each line's length, so a
   pause inside a line is not taken for the gap between lines; it writes one 64 kbps AAC `.m4a` per key plus `clips.json`.
   `verify.py` has Gemini (key in `~/.config/gemini/key`) transcribe every clip and compares it with `lines.json`; fix any
   MISMATCH by re-cutting that clip at the right silence (the first run on 2026-11-16 needed the last four re-cut by hand).
   `split.py` is the older silence-only splitter and only works when the gaps between lines are clearly longer than the ones inside.

5. Reload the game: `BT.voice.say('payday')` in the console should talk.

## In the game

- Settings → Sound has three switches: **Sound effects** (everything), **Music** and **Voice lines**. Read-aloud (the 🔊 **Read it**
  button on every round, `BT.voice.read(text)`) uses the iPad's own speech voice (Samantha when present) and follows only Sound effects.
- Music ducks to 40% while a clip plays. No voice lines during a reading passage.
- `js/voice.js` keeps the list of keys the hooks use (`BT.voice.used`); `BT.test.run()` fails if one is missing from `lines.json`.
- In `?test=1` nothing plays; keys and read texts land in `BT.test.spoken`.
