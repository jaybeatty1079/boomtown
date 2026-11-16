// Boomtown autoplay: plays a full day headless in WebKit and asserts the glue holds.
// Run:  node test/autoplay.mjs [--size 820x1180] [--shots test/shots] [--url http://localhost:8781/?test=1]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const candidates = ['playwright', 'playwright-core',
    path.join(process.env.HOME || '', '.local/lib/playwright-cli/node_modules/playwright-core')];
  for (const c of candidates) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('playwright not found; install playwright-cli or npm i playwright-core');
}

const args = process.argv.slice(2);
function arg(name, def) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; }
const [W, H] = arg('--size', '820x1180').split('x').map(Number);
const SHOTS = arg('--shots', '');
const PAGE = arg('--url', 'http://localhost:8781/?test=1');
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const { webkit } = loadPlaywright();
const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', m => { if (m.type() === 'error' && !/fonts\.g(oogleapis|static)/.test(m.text())) errors.push(m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('requestfailed', r => { if (!/fonts\.g/.test(r.url())) errors.push('request failed: ' + r.url()); });

const ev = (fn, a) => page.evaluate(fn, a);
const screen = () => ev(() => BT.screen.current);
const sleep = ms => page.waitForTimeout(ms);
let shotN = 0;
async function shot(name) { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${String(++shotN).padStart(2, '0')}-${name}-${W}x${H}.png`) }); }
async function waitScreen(id, ms = 8000) { await page.waitForFunction(x => BT.screen.current === x, id, { timeout: ms }); }
async function clickText(sel, text) { await page.locator(sel).filter({ hasText: text }).first().click(); }
function assert(c, msg) { if (!c) throw new Error('ASSERT ' + msg); }

await page.goto(PAGE);
await page.waitForFunction(() => window.BT && BT.screen.current);

// 1. character
assert(await screen() === 'character', 'first run opens the creator');
await page.fill('#cc-name', 'Tester');
await page.locator('.cc-options button').nth(2).click();              // a skin chip
await page.locator('.cc-map [data-abbr="TX"], .cc-map .state-TX').first().click({ force: true }).catch(() => ev(() => BT.character.set('homeState', 'TX')));
await shot('character');
await page.click('#cc-save');
await waitScreen('home');
assert(await ev(() => BT.state.character.name) === 'Tester', 'character saved');
await shot('home');

// 2. jobs: a tier-4 job so one day buys a shop item
await page.click('#btn-work');
await waitScreen('jobs');
await shot('jobs');
const jobId = await ev(() => BT.jobs.data.filter(j => j.tier === 4)[0].id);
await page.click(`.job-chip[data-job="${jobId}"]`);
await clickText('.modal button', 'Clock in');
await waitScreen('round');

// 3. the day
const money0 = await ev(() => BT.state.money);
let replays = 0, breaksPlayed = 0, roundShot = false, breakShot = false;
const deadline = Date.now() + 120000;
while (await screen() !== 'payday') {
  assert(Date.now() < deadline, 'day did not finish in 120 s (screen ' + await screen() + ')');
  const s = await screen();
  if (s === 'round') {
    if (await page.$('#screen-round .bt-offer')) {
      if (replays === 0) { replays++; await clickText('#screen-round .bt-offer button', 'One more!'); }
      else await clickText('#screen-round .bt-offer button', 'No thanks');
      await sleep(30); continue;
    }
    if (await page.$('#screen-round .bt-flash')) { await clickText('#screen-round .bt-flash button', 'Next').catch(() => {}); await sleep(30); continue; }
    const ans = await ev(() => BT.test.currentAnswer());
    if (ans === undefined) { await sleep(40); continue; }
    if (!roundShot) { roundShot = true; await shot('round'); }
    await ev(() => BT.test.answer());
    await sleep(30); continue;
  }
  if (s === 'break') {
    if (await page.$('#screen-break .bt-offer')) {
      if (breaksPlayed === 0) { breaksPlayed++; await clickText('#screen-break button', 'Play'); await sleep(600); if (!breakShot) { breakShot = true; await shot('break'); } }
      else await clickText('#screen-break button', 'Skip');
    }
    await sleep(100); continue;
  }
  await sleep(50);
}
await shot('payday');
const rounds = await ev(() => BT.state.rounds.length);
assert(rounds === 6 || rounds === 7, 'rounds logged: ' + rounds);
assert(await ev(() => BT.state.money) > money0, 'money went up');
assert(await ev(() => BT.state.sessions.length) === 1, 'one session logged');
assert(await ev(() => BT.state.events.some(e => e.type === 'break_played')), 'break played logged');

// 4. book stop
await clickText('#screen-payday button', 'Book Stop');
await waitScreen('bookstop');
await page.fill('#screen-bookstop input[aria-label="Book title"]', 'The Lemonade War');
await clickText('#screen-bookstop .numpad button', /^1$/); await clickText('#screen-bookstop .numpad button', /^2$/);
await page.fill('#screen-bookstop textarea', 'Evan and Jessie fight over who sells more lemonade.');
await shot('bookstop');
await page.click('#screen-bookstop .btn-big');
await waitScreen('town');
assert(await ev(() => BT.state.books.length) === 1, 'book saved');

// 5. town: three trees
await ev(() => BT.town.select('tree'));
const empties = await ev(() => { const g = BT.state.town.grid, out = []; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) if (!g[r][c]) out.push([r, c]); return out.slice(0, 3); });
for (const [r, c] of empties) { await ev(() => BT.town.select('tree')); await page.click(`.town-hit[data-r="${r}"][data-c="${c}"]`, { force: true }); await sleep(30); }
assert(await ev(() => BT.state.town.grid.flat().filter(x => x === 'tree').length) === 3, 'three trees placed');
await shot('town');

// 6. shop: a bike
await clickText('#screen-town button', 'Shop');
await waitScreen('shop');
await page.click('#screen-shop [data-tab="wheels"]');
await page.click('#screen-shop [data-buy="bike"]');
await sleep(50);
assert(await ev(() => BT.state.vehicles.includes('bike')), 'bike bought');
await shot('shop');

// 7. parent report with a code
await clickText('#screen-shop button', 'Back');
await page.locator('#btn-parent').hover();
await page.mouse.down(); await sleep(500); await page.mouse.up();
await waitScreen('report');
await page.waitForSelector('#screen-report .report-gate');
for (const pass of [0, 1]) for (const k of '1234') await page.click(`#screen-report [data-key="${k}"]`);
await page.waitForSelector('#screen-report .report-ta');
const text = await ev(() => document.querySelector('#screen-report .report-ta').value);
for (const s of ['Money', 'Reading', 'Words', 'Science', 'Geography', 'Logic', 'Writing', 'Design']) assert(text.includes(s), 'report names ' + s);
assert(text.includes('The Lemonade War'), 'report has the book');
await shot('report');

// 8. in-page checks, top bar
const fails = await ev(() => BT.test.run());
const total = await ev(() => BT.test.checks.length);
const hud = await ev(() => document.getElementById('topbar-money').textContent === BT.fmt(BT.state.money));
assert(hud, 'top bar money matches state');
const ver = await ev(() => [document.querySelector('.ver').textContent.trim(), BT.version]);
const verTxt = (await (await fetch(new URL('version.txt', PAGE))).text()).trim();
assert(ver[0] === verTxt && ver[1] === verTxt, `footer "${ver[0]}" must match version.txt "${verTxt}"`);
await browser.close();

const problems = [...errors.map(e => 'console: ' + e), ...fails.map(f => 'check: ' + f.name + ': ' + f.error)];
console.log(`autoplay ${W}x${H}: ${rounds} rounds, ${replays} replay, ${breaksPlayed} break, money ${money0} -> ${await Promise.resolve(text.match(/\$[\d,]+/)?.[0] || '?')}, ` +
  `${total - fails.length}/${total} checks, ${errors.length} console errors, ver "${ver[0]}"` + (SHOTS ? `, ${shotN} shots in ${SHOTS}` : ''));
if (problems.length) { problems.forEach(p => console.log('  ' + p)); process.exit(1); }
