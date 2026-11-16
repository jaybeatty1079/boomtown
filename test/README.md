# Boomtown tests

One command plays a full day headless (WebKit, 820x1180) and fails on any glue problem:

    node test/autoplay.mjs

Needs the dev server (`python3 -m http.server 8781 --directory /Users/jaybeatty/Claude/boomtown`) and playwright-cli
(its bundled playwright-core is picked up from ~/.local/lib/playwright-cli; `npm i playwright-core` works too).

Options: `--size 1180x820` (viewport), `--shots test/shots` (a PNG of each main screen), `--url http://localhost:8781/?test=1`.

What it does: creates a character, clocks in at a tier-4 job, answers every round through `BT.test.currentAnswer()` /
`BT.test.answer()`, takes one replay and plays one break, does the Book Stop, places three town tiles, buys the bike,
opens the parent report with code 1234, then asserts: no console errors, money up, 6 or 7 rounds logged, the report text
names all eight subjects, the top bar matches state, and `BT.test.run()` returns no failures.

In-game checks alone: open `http://localhost:8781/?test=1`, tap `test`, then `Run checks` (or `BT.test.run()` in the console).
