# Boomtown USA

A learning game for a 4th grader on an iPad. She makes a character, picks a home state on a block map of the USA and takes a job somewhere in the country each day (a bakery in Austin, a vet clinic in Denver). A work day is six or seven short rounds the game chooses (reading, words, writing, money, logic, geography, science, design), optional break games, then payday. Money buys town tiles, a bigger home, wheels, outfits and vacations; returning to a job earns a promotion with harder rounds and better pay. Every day ends at the Book Stop: log a real book and write one line about it. Behind a parent code sits a report on how she is doing by subject.

Vanilla HTML/CSS/JS, no build step. All art is drawn in code; sound effects are synthesized, with three CC0 music loops and optional voice clips on top. `SPEC.md` is the full contract.

## Run it locally

    cd boomtown && python3 -m http.server 8781

Open http://localhost:8781/ (add `?test=1` for the test panel). On the iPad: open the hosted copy in Safari and Add to Home Screen. It also runs from GitHub Pages as static files.

## Test it

With the server running:

    node test/autoplay.mjs                              # 820x1180 portrait
    node test/autoplay.mjs --size 1180x820              # landscape
    node test/autoplay.mjs --size 820x1180 --shots test/shots   # also refresh screenshots

It plays a full day headless in WebKit (character, job, every round, one replay, one break, Book Stop, three town tiles, a purchase, the parent report) and fails on console errors, bad state or any failed check. See `test/README.md`.

In the browser: open `?test=1`, tap `test`, then `Run checks`, or run `BT.test.run()` in the console (an empty list means all checks passed). Syntax check: `for f in $(find js -name '*.js'); do node --check $f; done`.

## Add content

Every data file registers its own checks, so run `BT.test.run()` after any edit.

**One job** — `js/data/jobs.js`, add a `J(...)` line in the right tier:

    J('boise-bakery', 'Bread Baker', 'Boise', 'ID', 1, 21, 'bakery', ['money', 'science'], '#ffb347', '🍞',
      'Two true sentences, second person, about the city and the day.',
      ['Task one', 'Task two', 'Task three']),

Fields: id, title, city, state abbreviation, tier 1-4, pay, kind, focus subjects (from reading, words, writing, money, logic, geography, science, design), color, icon, intro, tasks. The checks require exactly 28 jobs split 8/8/7/5 by tier (`js/jobs.js`), so swap a job out or update those counts in the same edit.

**One reading passage** — `js/data/passages.js`, add an object to `BT.data.passages`:

    { id: 'l2-honey', level: 2, title: 'Where Honey Comes From', kinds: ['farm'],
      text: ['Sentence one.', 'Sentence two.', '...'],
      qs: [ { type: 'main', q: 'What is this passage mostly about?',
              options: ['A', 'B', 'C', 'D'], correct: 0,
              why: 'Why A is right.', hint: 1 } ] },

`level` 1-5, `kinds` are job kinds it fits, `correct` is the index of the right option, `hint` is the index of the sentence that holds the answer. Original writing, checked facts.

**One science item** — `js/data/science.js`, add an `I(...)` line under its topic:

    I('space-18', 2, 'space', 'Which planet is closest to the Sun?',
      ['Mercury', 'Venus', 'Earth', 'Mars'],
      'Mercury orbits closest to the Sun, about 36 million miles away on average.');

Arguments: id (unique, gets a `sci-` prefix), level 1-5, topic (one of the labels in `js/rounds/science.js`), question, four options with the correct one first (the round shuffles them), why, optional figure name.

## Music and voice

- Music (`js/music.js`, `BT.music`): three looping CC0 tracks in `music/`, credits in `music/CREDITS.md`. `calm` (forest-8bit) on home, character, jobs, town, shop, Book Stop and settings; `work` (mountain-stage) on rounds, faded out for reading rounds; `break` (action-1) on break games; silence on payday and the report. Starts on the first tap (iPad rule), ramps between tracks, ducks under voice lines, pauses when the app is hidden.
- Voice lines (`js/voice.js`, `BT.voice`): `voice/lines.json` has the 40 lines, the clips are `voice/<key>.m4a`, and `voice/clips.json` lists which exist (only those are ever requested), so the game is fine without them. The 🔊 **Read it** button on every round reads the question with the iPad's speech voice.
- Settings → Sound: **Sound effects**, **Music**, **Voice lines** switches (`settings.sound / music / voice`).
- Regenerate the clips: ElevenLabs voice **Jessica**, stability 50, similarity 75; paste the lines from `voice/lines.json` in order separated by `<break time="1.3s" />`, download the mp3, then `python3 voice/split.py <mp3>`. Details in `voice/README.md`.

## Save, parent code and report

- Save: `localStorage` key `boomtown_v1`. Settings shows a save code (base64 JSON) to copy to another device and paste to import.
- Parent report: long-press the **Parent** button in the top bar for 1.5 seconds. The first time it asks you to set a 4-digit code (stored in the save as `settings.parentCode`); after that it asks for the code. A forgotten code can be cleared in Settings once the save code is shown (hold the clear button).
- The report covers sessions and minutes, per-subject accuracy, speed, level and trend, gifted / needs-support / curious signals, the reading log, writing samples, design choices and town and shop activity. **Copy report** gives plain text and **Copy JSON** the raw data, both ready to paste into a chat.

## Privacy

The game stores everything on the device (browser localStorage). Nothing is uploaded and there are no accounts.
