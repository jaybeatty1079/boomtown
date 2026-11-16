# BOOMTOWN USA — build spec

A learning game for one 10-year-old (4th grade, straight A's, under-challenged, likes money, geography, Roblox and Minecraft). She plays on an iPad in Safari, saved to the home screen. Nothing uploaded, no accounts. The game is also a measuring instrument: it chooses what she practices, records how she does, and gives her dad a report.

Her name is never hard-coded; the player names her character.

## The pitch (what she sees)

You make a character and pick a home town on a blocky map of the USA. Every afternoon your character takes a **job** somewhere in the country (a bakery in Austin, a vet clinic in Denver, a boat yard in Maine). A job is one work day: six short **rounds** (the game picks them, never the player), two optional **break games** between rounds, then **payday**. Money buys blocks and buildings for your own **town** (the Minecraft hook), clothes, vehicles, a bigger home, and vacations. Better jobs unlock as you earn. Go back to a job you like and get **promoted**: harder rounds, bigger pay. Every day ends with a **Book Stop**: read a real book, write one line about it.

## Non-negotiables

- Vanilla HTML/CSS/JS, no build step, no frameworks, no npm. Plain `<script>` tags, every module attaches to the global `BT` object. Must run from `python3 -m http.server` and from GitHub Pages.
- **All art is drawn in code** (CSS, inline SVG, canvas). No image files, no audio files. Sound effects are synthesized with WebAudio (`BT.sfx`). One Google Font (Fredoka) with a system fallback.
- iPad Safari first: pointer events (never `touchstart`), 44px minimum tap targets, `100dvh` not `100vh`, `touch-action: manipulation` on the body, `user-select: none` on game surfaces, `-webkit-tap-highlight-color: transparent`, audio unlocked on the first `pointerdown`. Landscape and portrait both work at 820×1180 and 1180×820. Nothing scrolls except lists and text panels.
- Head tags (copy exactly): `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, `<meta name="apple-mobile-web-app-title" content="Boomtown">`, plus an inline SVG favicon via data URI.
- Save on the device only: `localStorage` key `boomtown_v1`. Export/import save code (base64 JSON) in Settings so a save can move between devices.
- Hosted copies check `version.txt` and reload once when stale (same trick as Word Hunter: fetch `version.txt?t=…` with `cache:'no-store'`, compare with the version string in the footer, `location.replace(path+'?v='+ver)` once).
- The game chooses rounds. There is no menu of subjects anywhere the player can see. Interest is measured by what she does voluntarily (replay offers, extra exploration, break games), not by a menu.
- Difficulty adapts per subject and never walls her: hard enough to miss sometimes.
- When she is stuck: a **Hint** button (small pay cost, logged), and after a miss a short **"Here's why"** explanation plus one retry. Never a dead end.
- Kid-safe: no external links out of the game, no chat, no ads, no accounts, nothing phones home.
- Test hooks: everything on `window.BT`; `?test=1` in the URL puts the game in test mode (no animation delays, deterministic RNG seed 42, every tier unlocked, `BT.test.*` helpers). Each module that is non-trivial adds asserts to `BT.test.checks` (an array of `{name, fn}`) and `BT.test.run()` runs them all and returns failures.

## Look and feel

Bright, chunky, blocky. Think Minecraft blocks with Roblox colors. Big rounded buttons with a 4px darker bottom edge (pressable look), bold Fredoka headings, confetti on payday, coins that fly to the money counter. Palette tokens live in `css/style.css` as CSS variables:

```
--sky:#6ec6ff  --grass:#5fcf5a  --dirt:#8b5a2b  --stone:#8d99a6  --gold:#ffcf3f
--ink:#1e2430  --paper:#fff8e7  --coral:#ff6b6b  --violet:#8b6cff  --mint:#3ddc97
```

Every screen is a `<section class="screen" id="screen-…">`; exactly one has class `active`. A persistent top bar shows: character avatar (small), name, money (`$1,234`), day streak, and a small **Parent** button (long-press 1.5 s opens the report; a short tap does nothing but wiggle).

## File layout and ownership

Every file below exists from the start (the foundation agent creates empty-but-valid stubs for ones it does not fully build). `index.html` includes **every** script tag in this order from day one, so later builders never touch `index.html`:

```
boomtown/
  index.html            shell: head tags, top bar, all <section class="screen">, all <script> tags
  version.txt           build label, e.g. "v1 · Nov 16"
  css/style.css         tokens, layout, buttons, screens, shared components
  js/core.js            BT namespace: state, save/load, screens, toast, RNG, money, log, levels, registries, test harness
  js/sfx.js             BT.sfx: synthesized sounds
  js/data/states.js     BT.states: 50 states (data only, see format)
  js/usmap.js           BT.usmap: block map renderer and pin API
  js/character.js       BT.character: creator screen + avatar SVG renderer
  js/data/jobs.js       BT.jobs.data: the job list
  js/jobs.js            BT.jobs: job board (map with pins), job intro, tiers, promotions
  js/session.js         BT.session: the work-day flow (rounds → breaks → payday → book stop)
  js/rounds/money.js    BT.rounds.money
  js/rounds/reading.js  BT.rounds.reading   (+ js/data/passages.js)
  js/rounds/words.js    BT.rounds.words     (+ js/data/words.js)
  js/rounds/science.js  BT.rounds.science   (+ js/data/science.js)
  js/rounds/geography.js BT.rounds.geography (uses BT.states)
  js/rounds/logic.js    BT.rounds.logic     (+ js/data/logic.js)
  js/rounds/writing.js  BT.rounds.writing
  js/rounds/design.js   BT.rounds.design
  js/town.js            BT.town: the town builder
  js/shop.js            BT.shop: homes, vehicles, outfits, vacations
  js/minigames/blockstack.js   BT.minigames.blockstack
  js/minigames/minerush.js     BT.minigames.minerush
  js/minigames/delivery.js     BT.minigames.delivery
  js/minigames/coinrain.js     BT.minigames.coinrain
  js/minigames/painter.js      BT.minigames.painter (free pixel art, untimed)
  js/bookstop.js        BT.bookstop (+ js/data/books.js)
  js/report.js          BT.report: the parent report
  js/settings.js        BT.settings: save code, reset, sound toggle, version
  js/main.js            boot: load → first run? character creator : home
  test/autoplay.mjs     playwright-cli script that plays a full day headless
```

Builders own only their files. Shared behavior goes through `BT` APIs, never by reaching into another module's DOM.

## The `BT` core API (js/core.js) — the contract every module uses

```js
BT.state                      // the save object (shape below); mutate then BT.save()
BT.save(); BT.load(); BT.reset(); BT.exportCode() -> string; BT.importCode(str) -> bool
BT.rng()                      // Math.random, or a seeded PRNG when ?test=1
BT.pick(arr); BT.shuffle(arr); BT.rand(min,max)   // ints inclusive
BT.fmt(n)                     // "$1,234"
BT.money.add(n, reason); BT.money.spend(n, reason) -> bool; BT.money.get()
BT.screen.show(id, opts)      // 'home' | 'character' | 'jobs' | 'round' | 'break' | 'payday' | 'bookstop' | 'town' | 'shop' | 'report' | 'settings'
BT.screen.el(id) -> HTMLElement   // the section
BT.toast(text, kind)          // kind: 'good' | 'bad' | 'info'
BT.confetti(); BT.coinFly(fromEl)
BT.sfx.good(); BT.sfx.bad(); BT.sfx.coin(); BT.sfx.click(); BT.sfx.build(); BT.sfx.fanfare()
BT.level.get(subject) -> 1..5
BT.level.record(subject, correct)   // adapts: 3 right in a row at a level → up; 2 wrong in a row → down
BT.log.round(entry)           // entry: {subject, jobId, jobLevel, level, correct, ms, hints, voluntary, retry, answer?}
BT.log.event(type, data)      // 'session_start','session_end','break_played','break_declined','replay_offered','replay_taken','town_place','shop_buy','vacation','book','hint', ...
BT.registerRound(subject, {title, icon, build(container, ctx) -> Promise<RoundResult>})
BT.registerMinigame(id, {title, icon, blurb, start(container, ctx) -> Promise<{score, pay}>})
BT.registerChecks(name, [{name, fn}])   // test asserts
BT.test = {checks: [], run(), seed, fast}  // fast=true when ?test=1: skip waits
BT.wait(ms)                   // resolves immediately in test mode
BT.el(tag, attrs, children)   // tiny DOM helper
BT.esc(str)                   // HTML escape
```

### RoundResult

```js
{ correct: true|false|null,   // null for ungraded rounds (writing, design)
  ms: number,                 // time from first render to answer
  hints: number,
  retry: boolean,             // answered right only after a miss
  answer: string|undefined,   // her typed text or chosen option label (writing, design)
  skipped: boolean }
```

### ctx passed to rounds and minigames

```js
{ level: 1..5,                // from BT.level.get(subject)
  job: {id, title, city, state, kind, ...},   // the current job (data row)
  jobLevel: 1..5,             // promotion level at this job
  pay: number,                // what a correct answer earns before bonuses
  onHint(),                   // call when she presses Hint (core deducts and logs)
  explain(text),              // show the "Here's why" panel; resolves after she taps OK
  done(result) }              // alternative to resolving the promise
```

A round renders into `container` (emptied for it), must be fully usable by touch, must show a **Hint** button (round decides what a hint is) and must resolve exactly once.

### Save shape (`BT.state`)

```js
{ v: 1,
  created: iso, lastPlayed: iso, streak: {days, lastDay},
  character: {name, skin, hair, hairColor, eyes, outfit, accessory, homeState},
  money: number, lifetime: number,
  levels: {money:1, reading:1, words:1, science:1, geography:1, logic:1, writing:1, design:1},
  streaks: {money:{right:0,wrong:0}, ...},
  jobs: {[jobId]: {times: n, level: 1..5, lastPlayed: iso}},
  home: 'parents'|'apartment'|'townhouse'|'house'|'lakehouse'|'mansion',
  vehicles: [ids], outfits: [ids], vacations: [{id, date}],
  town: {grid: [[tileId|null]*10]*10, name: string},
  paintings: [{title, pixels: string}],     // 16x16, pixels as a 256-char palette-index string
  books: [{date, title, pages, line}],
  rounds: [ {date, subject, jobId, jobLevel, level, correct, ms, hints, voluntary, retry, answer} ],
  events: [ {t: iso, type, data} ],
  sessions: [ {start, end, jobId, earned, rounds: n, breaks: n} ],
  settings: {sound: true, parentCode: null} }
```

Keep `rounds` and `events` as flat arrays; the report computes from them. Cap `events` at 5,000 (drop oldest).

## The work day (js/session.js)

1. **Job board** (`BT.jobs`): the block map with pins for open jobs. Locked tiers show grey pins with the unlock amount. Tap a pin → job intro card (title, city, state, what you do, pay for the day, promotion level, "Clock in").
2. **Six rounds.** The game picks the six subjects:
   - Each job has `focus: [subjects]` (2 or 3). Two rounds come from the focus list.
   - The other four are chosen so that over the last two sessions every one of the 8 subjects appears at least once; among ties, prefer the subject with the fewest logged rounds, then random.
   - Writing and design appear at most once per day each; the six are shuffled and no subject repeats.
3. **Breaks.** After round 2 and after round 4 the game offers one break game (rotating through the four timed ones; the painter is only offered from the town screen). The offer screen has **Play (60 s)** and **Skip to work**. Both choices are logged (`break_played` / `break_declined`). Break pay is capped at 15% of the day's round pay so learning stays the main earner.
4. **After each graded round**: a results flash; if correct, coins fly to the counter. Every third round shows a **"One more like this? +$bonus"** offer (logged as `replay_offered`; taking it logs `replay_taken` and the extra round is logged with `voluntary:true`).
5. **Payday**: breakdown (rounds, no-hint bonus, streak bonus, break pay), total, confetti, promotion notice if this job's level rose, tier unlock notice if lifetime crossed a threshold.
6. **Book Stop** (`BT.bookstop`), then **free time**: the town screen with Shop and Paint buttons. A soft banner "Good stopping point!" appears 25 minutes after `session_start`; nothing is forced.

Pay: base pay per correct round = job `pay` (tier 1: $18–25, tier 2: $35–50, tier 3: $70–95, tier 4: $140–180) × (1 + 0.25×(jobLevel−1)). No-hint bonus +20% on that round. Day-streak bonus +10% on the day for a streak ≥ 3 days. A wrong answer after retry pays half. Ungraded rounds pay full on completion (writing needs the minimum word count).

**Promotion**: finishing a job again raises its `level` by 1 (max 5). Round `ctx.level` for that job = max(subject level, jobLevel−1) capped at 5, so a job she revisits gets harder even if the subject level lags.

**Tiers** by `lifetime`: tier 1 from $0, tier 2 at $1,000, tier 3 at $4,000, tier 4 at $12,000.

## Jobs (js/data/jobs.js) — 28 jobs

Format:
```js
BT.jobs.data = [{ id:'austin-bakery', title:'Bakery Helper', city:'Austin', state:'TX', tier:1, pay:20,
  kind:'bakery', focus:['money','science'], color:'#ffb347',
  intro:'Two sentences, second person, what the day is like.',
  tasks:['Weigh flour','Price the cupcakes','Open the shop'],  // flavor shown on the intro card
  icon:'🥐' }, ...]
```
Spread the 28 jobs across all four regions and at least 20 different states; 8 in tier 1, 8 in tier 2, 7 in tier 3, 5 in tier 4. Each subject appears in `focus` of at least five jobs. Ideas: bakery, pet vet, lemonade stand owner, ranch hand, aquarium guide, library helper, toy store, farm market, bank teller, newspaper reporter, zoo keeper, museum guide, weather station, robot lab, airline pilot, national park ranger, game studio, architect, marine biologist, doctor, mayor's office, space center, movie studio, stock exchange, judge's clerk, chef at a famous restaurant, startup founder, orchestra conductor. Pay rises with tier. Intro text and tasks must be accurate about the real city (e.g. Denver is a mile high, Seattle has Pike Place Market).

## States (js/data/states.js) — data only

The USA as a **block map**: each state is one square in a 12×8 grid (the common "tile grid map" layout; Alaska bottom-left, Hawaii below it; keep neighbors roughly right: WA at col 1 row 2, ME at col 11 row 0, FL at col 9 row 7, TX at col 4 row 7, CA at col 1 row 5).

```js
BT.states = [{ abbr:'TX', name:'Texas', capital:'Austin', region:'South', col:4, row:7,
  nickname:'Lone Star State', landmark:'The Alamo', bigCity:'Houston', fact:'One true sentence.',
  neighbors:['NM','OK','AR','LA'] }, ...]   // all 50, regions: Northeast | Midwest | South | West
```
Every capital, nickname, landmark, big city, region and neighbor list must be correct. Facts must be true and checkable.

## Block map renderer (js/usmap.js)

`BT.usmap.render(container, {onTap(abbr), pins:[{abbr, label, color, locked}], highlight:[abbr], labels:true})`. Draws the tile grid as an SVG: a rounded square per state with its abbreviation, a block-shadow look (lighter top face). Pins are little flags on the tile. Must look good at 700px wide and scale down to 360px (abbreviations stay legible). Also `BT.usmap.flash(abbr, kind)` for right/wrong feedback in geography rounds.

## Character (js/character.js)

Creator screen on first run (and from Settings): name (text input, max 14 chars, required), skin tone (6), hair style (6) and color (6), eyes (4), outfit (6 at start; shop adds more), accessory (none + 5), home state (tap the block map). `BT.character.svg(size)` returns an inline SVG string of the avatar built from these parts, used in the top bar, the payday screen, in the town (standing in front of her home) and on vacation postcards. Blocky, friendly, Roblox-ish proportions.

## Rounds — content rules

General: multiple choice has 4 options with plausible distractors; one correct. Where a round generates numbers it **computes** the answer (never hand-typed). Every item carries a one- or two-sentence `why` used by `ctx.explain`. Levels: 1 = solid 4th grade, 3 = 5th/6th, 5 = a sharp 7th grader. Every round shows the question big, options as tall buttons, and a Hint button.

- **money** (procedural generators per level, themed to `ctx.job.kind`): L1 totals and change, L2 multiplication and unit price, L3 percent off / tax / tip and budgets, L4 profit = sales − costs, simple interest, fractions of money, L5 break-even, two-step problems, compare two deals. Input mode for some: a number pad the round draws (no native keyboard). Hint = show the first step.
- **reading** (`js/data/passages.js`): at least 6 original nonfiction passages per level (30+), 90–220 words, tied to jobs/cities/money/science, each with 3 questions (main idea, detail, inference or vocabulary-in-context), 4 options each, with `why`. Original writing only. Round shows the passage in a scrollable panel, then the 3 questions one at a time; the round's `correct` is true when at least 2 of 3 are right (log each sub-question as its own `BT.log.round` with `subject:'reading'` too? No: one round log; put sub-results in `answer` as "2/3"). Hint = highlight the sentence that holds the answer.
- **words** (`js/data/words.js`): 150+ items across levels: meaning in context, synonym/antonym, which spelling is correct, prefix/suffix meaning, analogy (L3+), Greek/Latin roots (L4+), with `why`. Spellings must be real and correct.
- **science** (`js/data/science.js`): 120+ items, grade 4–7: life, earth, physical, weather, space, the human body, simple machines, states of matter, food science (bakery), animal care (vet), ecosystems (ranger), with `why`. Facts must be correct.
- **geography** (uses `BT.states`, procedural): tap-the-state on the block map ("Tap Colorado"), capital of X, which state is this capital in, which state is farther west/north, which states border X, which region, nickname, landmark, time zone (L4+), "which is bigger" (L5, needs an `area` rank field added to states if used). Hint = flash the region.
- **logic** (`js/data/logic.js` + generators): number patterns (procedural, computed), shape/color pattern sequences drawn in SVG, odd one out, "if-then" riddles, grid logic (L3+), simple algebra "□ + 7 = 15" (L2+), with `why`. 60+ bank items plus generators.
- **writing**: prompt tied to the job ("Name this bakery and tell me why in two sentences."), a big textarea, minimum word count by level (8/12/18/25/35). Not graded (`correct:null`); an **editor's checklist** gives friendly feedback (starts with a capital, ends with a period, reached the word count, used a word from the day). Saves the text in `answer`. Hint = show a sentence starter.
- **design**: pick one of four options (shop sign style, color scheme, store layout, a menu, a uniform) drawn as SVG cards; no right answer (`correct:null`), `answer` = the option label plus a tag (`bold|calm|classic|wild`). The chosen color becomes the job card's accent next time.

## Break games (js/minigames/*) — 60 seconds each unless noted

All canvas, pointer events, `devicePixelRatio` aware, fit the container, big HUD (time, score), a 3-2-1 start, an end card with score and pay (`pay = min(cap, score-based)` where ctx gives `cap`). Each resolves `{score, pay}`.

- **blockstack**: a block slides left-right across the top; tap to drop it on the tower; overhang gets chopped off; the tower scrolls down as it grows; height = score. Minecraft block textures drawn in code.
- **minerush**: a 6×8 grid of ore blocks (stone, coal, iron, gold, diamond); tap to mine (1–3 taps by hardness); mining 3 of the same ore in a row within 2 s gives a combo; diamonds are rare and worth most.
- **delivery**: three lanes, the character runs forward; tap or swipe left/right to change lanes; collect packages, dodge puddles and cones; speed ramps.
- **coinrain**: drag a basket along the bottom; catch coins (and the rare gold bar), avoid anvils (lose 3 coins).
- **painter** (untimed, from the town screen): a 16×16 pixel canvas, 12-color palette, fill bucket, undo, clear, save as a named painting; saved paintings show as billboards in the town. No pay; logs `painting_saved`.

## Town (js/town.js)

A 10×10 grid drawn as blocky isometric-looking tiles in SVG or canvas (simple: top face + two side faces per block). Catalog with prices: grass (free), road $20, flowers $10, tree $15, bush $12, fence $8, pond $60, small house $120, cottage $180, shop $250, café $300, bakery $320, fountain $400, playground $450, school $600, library $650, hospital $900, fire station $800, stadium $2,000, ferris wheel $2,500, skyscraper $3,500, castle $6,000, billboard $150 (shows a saved painting), her home (free, auto-placed, upgrades with the shop's home ladder). Tap a catalog item then tap a tile to place (money leaves with a coin fly); tap a placed tile to pick up (50% refund) or move. Town name editable. Counters: population (houses × 3 + big buildings × 10), town value. The character stands in front of her home. Pure fun; log `town_place` with the item id.

## Shop (js/shop.js)

Tabs: **Home** (ladder: parents' house free → apartment $800 → townhouse $2,500 → house with a yard $6,000 → lake house $15,000 → mansion $40,000; each drawn as an SVG card), **Wheels** (bike $150, scooter $400, used car $1,200, pickup $2,000, sports car $5,000, RV $9,000, speedboat $20,000, helicopter $60,000), **Outfits** (10 at $50–$600; bought outfits appear in the character creator), **Vacations** (beach day $300, Grand Canyon $900, New York City $1,500, Yellowstone $2,200, Hawaii $4,000, Alaska cruise $6,000, Paris $8,000, Tokyo $12,000, space camp $20,000; buying one plays a postcard animation with the avatar, a true one-line fact about the place, and adds the postcard to an album). Everything owned is marked. Log `shop_buy` and `vacation`.

## Book Stop (js/bookstop.js, js/data/books.js)

After payday: "Book Stop — read for 10 minutes, then tell me one thing." A simple timer she can start (or skip the timer), fields: book title (remembers the last one), pages read (number pad), one line about it (textarea, min 6 words). Pays $25. Saves to `state.books`. A **Bookshelf** button shows suggestions: she likes the Tuttle Twins, has not explored authors for her age, and would probably love Nancy Drew-type mysteries. Suggestion list (title, author, one honest line, a tag `mystery|money|adventure|classic`): Nancy Drew (Carolyn Keene; start with The Secret of the Old Clock), Nancy Drew and the Clue Crew, The Lemonade War (Jacqueline Davies), The Westing Game (Ellen Raskin), From the Mixed-Up Files of Mrs. Basil E. Frankweiler (E. L. Konigsburg), The Mysterious Benedict Society (Trenton Lee Stewart), Escape from Mr. Lemoncello's Library (Chris Grabenstein), Greenglass House (Kate Milford), Book Scavenger (Jennifer Chambliss Bertman), Harriet the Spy (Louise Fitzhugh), Encyclopedia Brown (Donald J. Sobol), The Boxcar Children (Gertrude Chandler Warner), Winterhouse (Ben Guterson), The Parker Inheritance (Varian Johnson), Whatever Happened to Penny Candy? (Richard Maybury), How to Turn $100 into $1,000,000 (James McKenna and Jeannine Glista), Trixie Belden (Julie Campbell), The Vanderbeekers of 141st Street (Karina Yan Glaser). Mark three as "Start here": The Secret of the Old Clock, The Lemonade War, The Westing Game.

## Parent report (js/report.js)

Opened by a 1.5 s long-press on **Parent** (first time: set a 4-digit code; afterwards ask for it; the code is stored in `settings.parentCode`; a forgotten code can be cleared from Settings with the save code visible). Shows, computed from `state.rounds`, `state.events`, `state.sessions`, `state.books`:

- Overview: sessions, total minutes, days played, current streak, lifetime earnings, learning time vs break time.
- Per subject table: rounds, accuracy, average seconds, level reached (and trend over the last 10 rounds vs the 10 before: ↑ → ↓), hints per round, retries, voluntary replays taken / offered.
- **Signals**: "Gifted signals" = subjects with accuracy ≥ 85% at level ≥ 3 and faster-than-median time, or voluntary replays ≥ 2; "Needs support" = subjects with accuracy < 60% over the last 10 rounds or hint rate > 50%; "Curious about" = subjects she replays voluntarily. Plain sentences, not just numbers.
- Reading log (date, title, pages, her line), writing samples (date, prompt, text), design choices (counts by tag), town and shop activity summary.
- Export: a **Copy report** button (plain text in a textarea, `select()` + `navigator.clipboard` with a fallback) and **Copy JSON**. Jay pastes either into a chat with Claude.
- Nothing in the report is visible to the child without the code.

## Settings (js/settings.js)

Sound on/off, save code (show / copy / paste to import, with a confirm), edit character, reset progress (type RESET to confirm), version label (`.ver` footer used by the version check).

## Boot (js/main.js)

Load → unlock audio on first pointerdown → if no character: creator → else home. Home screen: big **Go to work** button, the avatar in front of her home, money, streak, buttons for Town, Shop, Bookshelf, Settings; a small "Day N" label. `?test=1` adds a `BT.test` panel toggle.

## Testing (test/autoplay.mjs and the asserts)

`test/autoplay.mjs` uses `playwright-cli`'s library (or plain `playwright` if present on the machine; check `playwright-cli --help`) to open `http://localhost:8781/?test=1` in headless WebKit at 820×1180, create a character, play a full work day answering via `BT.test` helpers (every round exposes `BT.test.currentAnswer()` returning the correct option label or value, and `BT.test.answer(label)`), play one break, do the book stop, place three town tiles, buy one item, open the report with the code, and assert: no console errors, money went up, `state.rounds.length === 6` (or 7 with a replay), the report text contains each subject name. Then run `BT.test.run()` and fail on any failed check. Print a one-line summary.

Each data file registers checks: every item has the required fields, exactly one correct option, `why` present, no duplicate ids; states: 50 entries, every neighbor pair symmetric, every `(col,row)` unique; jobs: 28, tiers 8/8/7/5, every focus subject is one of the eight.

## Dev server

The desktop app's `.claude/launch.json` gets a `boomtown` entry: `python3 -m http.server 8781` run inside this folder.

## Out of scope for v1 (do not build)

Multiplayer, accounts, cloud sync, voice, external images or audio, real-money links, allowance links, a native app, other languages.
