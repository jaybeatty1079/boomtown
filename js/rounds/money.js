// BT.rounds.money: procedural money problems, levels 1-5, themed to ctx.job.kind. Multiple choice or a drawn number pad.
// Every answer is computed. Hint = the first step. Test hooks on BT.test.roundHooks {currentAnswer, answer}.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;

  // ---------- themes: [item name, min price, max price] (whole dollars; some generators add .50) ----------
  var THEMES = {
    bakery: ['cupcake', 2, 5, 'cookie', 1, 3, 'loaf of bread', 4, 8, 'pie', 10, 18],
    vet: ['bag of dog food', 20, 40, 'cat toy', 3, 8, 'leash', 10, 18, 'checkup', 30, 60],
    lemonade: ['cup of lemonade', 1, 3, 'cookie', 1, 2, 'pitcher', 6, 10, 'bag of lemons', 4, 8],
    ranch: ['bale of hay', 8, 15, 'bag of feed', 15, 30, 'saddle blanket', 25, 45, 'horseshoe', 5, 10],
    aquarium: ['ticket', 12, 25, 'plush shark', 10, 20, 'can of fish food', 4, 9, 'poster', 6, 12],
    library: ['bookmark', 1, 3, 'used book', 2, 6, 'tote bag', 8, 15, 'library mug', 6, 12],
    toystore: ['puzzle', 8, 15, 'action figure', 10, 20, 'board game', 15, 35, 'yo-yo', 3, 6],
    farm: ['basket of apples', 5, 9, 'jar of honey', 7, 12, 'pumpkin', 4, 10, 'carton of eggs', 3, 6],
    bank: ['savings box', 10, 20, 'coin roll', 5, 10, 'money jar', 8, 15, 'calculator', 12, 25],
    zoo: ['zoo ticket', 15, 30, 'plush lion', 12, 22, 'animal map', 2, 5, 'bag of popcorn', 4, 7],
    museum: ['museum ticket', 10, 25, 'dinosaur model', 15, 30, 'postcard', 1, 3, 'fossil kit', 12, 24],
    space: ['model rocket', 20, 45, 'pack of astronaut ice cream', 4, 8, 'star map', 10, 18, 'mission patch', 5, 9],
    game: ['game download', 10, 30, 'skin pack', 5, 12, 'controller', 40, 70, 'sticker sheet', 2, 5],
    restaurant: ['pasta plate', 12, 20, 'bowl of soup', 6, 10, 'dessert', 7, 12, 'glass of lemonade', 3, 5],
    shop: ['notebook', 3, 6, 'water bottle', 8, 15, 'cap', 10, 20, 'snack', 2, 4]
  };
  var KIND_ALIAS = { pet: 'vet', clinic: 'vet', toy: 'toystore', toys: 'toystore', market: 'farm', farmmarket: 'farm',
    cafe: 'bakery', chef: 'restaurant', kitchen: 'restaurant', studio: 'game', gamestudio: 'game', planetarium: 'space',
    rocket: 'space', nasa: 'space', teller: 'bank', stock: 'bank', stocks: 'bank', exchange: 'bank', startup: 'shop', ranger: 'farm',
    park: 'farm', marine: 'aquarium', movies: 'game', robotlab: 'space', newspaper: 'library', weather: 'space' };

  function theme(kind) {
    kind = String(kind || '').toLowerCase().replace(/[^a-z]/g, '');
    var key = THEMES[kind] ? kind : KIND_ALIAS[kind];
    if (!key) Object.keys(THEMES).forEach(function (k) { if (!key && kind.indexOf(k) >= 0) key = k; });
    var t = THEMES[key || 'shop'], items = [];
    for (var i = 0; i < t.length; i += 3) items.push({ name: t[i], min: t[i + 1], max: t[i + 2] });
    return items;
  }
  function item(items, used) { // an item not yet used in this problem
    var pool = items.filter(function (it) { return used.indexOf(it) < 0; });
    var it = BT.pick(pool.length ? pool : items);
    used.push(it);
    return it;
  }
  function price(it, halves) { // whole dollars, or .50 steps when halves
    var p = BT.rand(it.min, it.max);
    return halves && BT.rng() < 0.5 ? p + 0.5 : p;
  }
  function plural(n, name) { // "3 bags of feed", "2 loaves of bread", "4 puzzles"
    if (n === 1) return '1 ' + name;
    var parts = name.split(' of '), a = parts[0], last = a.slice(-1);
    parts[0] = last === 'y' ? a.slice(0, -1) + 'ies' : last === 'f' ? a.slice(0, -1) + 'ves' : last === 's' || last === 'x' || last === 'h' ? a + 'es' : a + 's';
    return n + ' ' + parts.join(' of ');
  }
  function bill(total) { // the smallest round bill (or pair of bills) a customer would hand over
    var b = [5, 10, 20, 50, 100, 200, 500].filter(function (x) { return x > total; })[0];
    return b || Math.ceil((total + 1) / 100) * 100;
  }
  function fm(n) { // "$3.50", "$12", "-$4"
    var r = Math.round(n * 100) / 100;
    if (Number.isInteger(r)) return BT.fmt(r);
    return (r < 0 ? '-$' : '$') + Math.abs(r).toFixed(2);
  }
  function cents(n) { return Math.round(n * 100) / 100; }

  // Four unique money options around the answer; the labels are formatted strings.
  function mcMoney(answer, step) {
    step = step || Math.max(1, Math.round(answer / 8));
    var set = [answer], tries = 0;
    while (set.length < 4 && tries++ < 30) {
      var k = BT.rand(1, 3) * (BT.rng() < 0.5 ? -1 : 1), c = cents(answer + k * step);
      if (c > 0 && set.indexOf(c) < 0) set.push(c);
    }
    for (k = 1; set.length < 4; k++) { c = cents(answer + k * step); if (set.indexOf(c) < 0) set.push(c); } // deterministic, never a duplicate
    return BT.shuffle(set.map(fm));
  }
  function mc(q, answer, why, hint, step) {
    return { q: q, mode: 'mc', options: mcMoney(answer, step), answer: fm(answer), value: answer, why: why, hint: hint };
  }
  function pad(q, answer, why, hint) {
    return { q: q, mode: 'pad', answer: fm(answer), value: cents(answer), why: why, hint: hint };
  }

  // ---------- generators by level ----------
  var GEN = {
    1: [
      function total(items) { // sum of 2 or 3 items
        var used = [], n = BT.rand(2, 3), parts = [], sum = 0;
        for (var i = 0; i < n; i++) { var it = item(items, used), p = price(it, true); parts.push({ it: it, p: p }); sum = cents(sum + p); }
        var list = parts.map(function (x) { return 'a ' + x.it.name + ' for ' + fm(x.p); });
        var q = 'A customer buys ' + list.slice(0, -1).join(', ') + ' and ' + list.slice(-1)[0] + '. What is the total?';
        return pad(q, sum, 'Add every price: ' + parts.map(function (x) { return fm(x.p); }).join(' + ') + ' = ' + fm(sum) + '.',
          'First add ' + fm(parts[0].p) + ' + ' + fm(parts[1].p) + '.');
      },
      function change(items) {
        var it = item(items, []), p = price(it, true), paid = bill(p), ch = cents(paid - p);
        return mc('A ' + it.name + ' costs ' + fm(p) + '. The customer pays with ' + fm(paid) + '. How much change do you give back?', ch,
          'Change is what you paid minus the price: ' + fm(paid) + ' − ' + fm(p) + ' = ' + fm(ch) + '.',
          'Start at ' + fm(p) + ' and count up to ' + fm(paid) + '.', 1);
      }
    ],
    2: [
      function multiply(items) {
        var it = item(items, []), p = price(it, false), n = BT.rand(3, 9), t = p * n;
        return pad('One ' + it.name + ' costs ' + fm(p) + '. A customer buys ' + n + '. What is the total?', t,
          n + ' × ' + fm(p) + ' = ' + fm(t) + '.', 'Multiply: ' + n + ' × ' + fm(p) + '.');
      },
      function unitPrice(items) {
        var it = item(items, []), u = BT.rand(it.min, it.max), n = BT.rand(3, 8), t = u * n;
        return mc('A pack of ' + plural(n, it.name) + ' costs ' + fm(t) + '. What does one ' + it.name + ' cost?', u,
          'Divide the pack price by how many: ' + fm(t) + ' ÷ ' + n + ' = ' + fm(u) + '.', 'Divide ' + fm(t) + ' by ' + n + '.', 1);
      },
      function changeFromMany(items) {
        var it = item(items, []), p = price(it, false), n = BT.rand(2, 4), t = p * n, paid = bill(t), ch = paid - t;
        return pad('A customer buys ' + plural(n, it.name) + ' at ' + fm(p) + ' each and pays with ' + fm(paid) + '. How much change?', ch,
          'First the total: ' + n + ' × ' + fm(p) + ' = ' + fm(t) + '. Then the change: ' + fm(paid) + ' − ' + fm(t) + ' = ' + fm(ch) + '.',
          'First find the total: ' + n + ' × ' + fm(p) + '.');
      }
    ],
    3: [
      function percentOff(items) {
        var it = item(items, []), pct = BT.pick([10, 20, 25, 50]), p = BT.rand(2, 9) * (pct === 25 ? 4 : pct === 20 ? 5 : pct === 10 ? 10 : 2);
        var off = p * pct / 100, np = p - off;
        return mc('A ' + it.name + ' is ' + fm(p) + '. Today it is ' + pct + '% off. What is the sale price?', np,
          pct + '% of ' + fm(p) + ' is ' + fm(off) + '. ' + fm(p) + ' − ' + fm(off) + ' = ' + fm(np) + '.',
          'First find ' + pct + '% of ' + fm(p) + (pct === 50 ? ' (half).' : pct === 25 ? ' (a quarter).' : pct === 10 ? ' (move the decimal).' : ' (a fifth).'));
      },
      function tax(items) {
        var it = item(items, []), p = BT.rand(2, 12) * 10, rate = BT.pick([5, 6, 8, 10]), t = p * rate / 100, tot = p + t;
        return pad('A ' + it.name + ' costs ' + fm(p) + ' plus ' + rate + '% sales tax. What is the total?', tot,
          'Tax is ' + rate + '% of ' + fm(p) + ' = ' + fm(t) + '. Add it on: ' + fm(p) + ' + ' + fm(t) + ' = ' + fm(tot) + '.',
          'First find ' + rate + '% of ' + fm(p) + '.');
      },
      function tip() {
        var bill = BT.rand(2, 9) * 10, pct = BT.pick([10, 15, 20]), tip = bill * pct / 100;
        return mc('The bill is ' + fm(bill) + '. You leave a ' + pct + '% tip. How much is the tip?', tip,
          pct + '% of ' + fm(bill) + ': ' + (pct === 15 ? '10% is ' + fm(bill / 10) + ', half of that is ' + fm(bill / 20) + ', together ' : '') + fm(tip) + '.',
          '10% of ' + fm(bill) + ' is ' + fm(bill / 10) + '. Build from there.', Math.max(1, Math.round(bill / 20)));
      },
      function budget(items) {
        var used = [], a = item(items, used), b = item(items, used), pa = price(a, true), pb = price(b, true);
        var budget = Math.ceil((pa + pb) / 10) * 10 + BT.pick([0, 10, 20]), left = cents(budget - pa - pb);
        return pad('You have ' + fm(budget) + ' to spend. You buy a ' + a.name + ' for ' + fm(pa) + ' and a ' + b.name + ' for ' + fm(pb) + '. How much is left?', left,
          'Spent: ' + fm(pa) + ' + ' + fm(pb) + ' = ' + fm(cents(pa + pb)) + '. Left: ' + fm(budget) + ' − ' + fm(cents(pa + pb)) + ' = ' + fm(left) + '.',
          'First add what you spent: ' + fm(pa) + ' + ' + fm(pb) + '.');
      }
    ],
    4: [
      function profit(items) {
        var it = item(items, []), p = BT.rand(it.min, it.max), n = BT.rand(10, 40), sales = p * n, costs = BT.rand(Math.floor(sales / 4), Math.floor(sales / 2)), pr = sales - costs;
        return pad('You sell ' + plural(n, it.name) + ' at ' + fm(p) + ' each. Supplies cost ' + fm(costs) + '. What is the profit?', pr,
          'Sales: ' + n + ' × ' + fm(p) + ' = ' + fm(sales) + '. Profit = sales − costs = ' + fm(sales) + ' − ' + fm(costs) + ' = ' + fm(pr) + '.',
          'First find the sales: ' + n + ' × ' + fm(p) + '.');
      },
      function interest() {
        var P = BT.rand(1, 10) * 100, r = BT.pick([2, 3, 4, 5, 10]), y = BT.rand(1, 3), I = P * r / 100 * y;
        return mc('You put ' + fm(P) + ' in a savings account that pays ' + r + '% simple interest a year. How much interest after ' + y + ' year' + (y > 1 ? 's' : '') + '?', I,
          'One year: ' + r + '% of ' + fm(P) + ' = ' + fm(P * r / 100) + '. Times ' + y + ' year' + (y > 1 ? 's' : '') + ' = ' + fm(I) + '.',
          'First find ' + r + '% of ' + fm(P) + ' for one year.', Math.max(1, P * r / 100 / 2));
      },
      function fraction(items) {
        var it = item(items, []), fr = BT.pick([[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [2, 5], [3, 5]]), unit = BT.rand(3, 12), total = unit * fr[1], ans = unit * fr[0];
        return mc('A ' + it.name + ' costs ' + fm(total) + '. It is on sale for ' + fr[0] + '/' + fr[1] + ' of that. What is the sale price?', ans,
          fm(total) + ' ÷ ' + fr[1] + ' = ' + fm(unit) + ', and ' + fr[0] + ' × ' + fm(unit) + ' = ' + fm(ans) + '.',
          'First divide ' + fm(total) + ' by ' + fr[1] + '.', unit);
      }
    ],
    5: [
      function breakEven(items) {
        var it = item(items, []), make = BT.rand(1, 4), sell = make + BT.rand(2, 5), n = BT.rand(20, 80), rent = (sell - make) * n;
        return { q: 'Your stand costs ' + fm(rent) + ' to rent for the day. Each ' + it.name + ' sells for ' + fm(sell) + ' and costs ' + fm(make) + ' to make. How many must you sell to break even?',
          mode: 'pad', answer: String(n), value: n, unit: plural(n, it.name).replace(/^\d+ /, ''),
          why: 'Each sale earns ' + fm(sell) + ' − ' + fm(make) + ' = ' + fm(sell - make) + '. ' + fm(rent) + ' ÷ ' + fm(sell - make) + ' = ' + n + ' sales to cover the rent.',
          hint: 'First find what you keep per sale: ' + fm(sell) + ' − ' + fm(make) + '.' };
      },
      function twoStep(items) {
        var it = item(items, []), buy = BT.rand(1, 6), sell = buy + BT.rand(1, 4), n = BT.rand(8, 30), pr = (sell - buy) * n;
        return pad('You buy ' + plural(n, it.name) + ' at ' + fm(buy) + ' each and sell them all at ' + fm(sell) + ' each. What is your profit?', pr,
          'Spent: ' + n + ' × ' + fm(buy) + ' = ' + fm(buy * n) + '. Earned: ' + n + ' × ' + fm(sell) + ' = ' + fm(sell * n) + '. Profit: ' + fm(sell * n) + ' − ' + fm(buy * n) + ' = ' + fm(pr) + '.',
          'First find what you spent: ' + n + ' × ' + fm(buy) + '.');
      },
      function compareDeals(items) {
        var it = item(items, []), nA = BT.rand(2, 6), nB = nA + BT.rand(1, 5), uA = BT.rand(2, 9), uB;
        do { uB = uA + BT.pick([-2, -1, 1, 2]); } while (uB < 1);
        var pA = nA * uA, pB = nB * uB, best = uA < uB ? 'Deal A' : 'Deal B';
        return { q: 'Deal A: ' + plural(nA, it.name) + ' for ' + fm(pA) + '. Deal B: ' + plural(nB, it.name) + ' for ' + fm(pB) + '. Which is cheaper per ' + it.name + '?',
          mode: 'mc', options: ['Deal A', 'Deal B', 'They cost the same', 'Cannot tell'], answer: best, value: best,
          why: 'Deal A: ' + fm(pA) + ' ÷ ' + nA + ' = ' + fm(uA) + ' each. Deal B: ' + fm(pB) + ' ÷ ' + nB + ' = ' + fm(uB) + ' each. ' + best + ' is cheaper per ' + it.name + '.',
          hint: 'Find the price of ONE in each deal: divide the price by how many.' };
      },
      function percentThenTax(items) {
        var it = item(items, []), p = BT.rand(4, 12) * 10, pct = BT.pick([10, 20, 50]), sale = p - p * pct / 100, rate = 10, tot = sale * 1.1;
        return mc('A ' + it.name + ' is ' + fm(p) + ', marked ' + pct + '% off, then ' + rate + '% tax is added. What do you pay?', tot,
          'Sale price: ' + fm(p) + ' − ' + fm(p * pct / 100) + ' = ' + fm(sale) + '. Tax: 10% of ' + fm(sale) + ' = ' + fm(sale / 10) + '. Total ' + fm(tot) + '.',
          'First take ' + pct + '% off ' + fm(p) + '.', Math.max(1, Math.round(sale / 10)));
      }
    ]
  };

  function generate(level, kind) {
    level = Math.min(5, Math.max(1, Math.round(level || 1)));
    var items = theme(kind);
    var g = BT.pick(GEN[level]);
    var it = g(items);
    it.level = level;
    return it;
  }

  // ---------- the round UI ----------
  function numpad(onSubmit, prefix) {
    var val = '';
    var disp = el('div', { class: 'numpad-display', text: prefix });
    function set(v) { val = v; disp.textContent = prefix + (val || ''); }
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
    var grid = el('div', { class: 'numpad' }, keys.map(function (k) {
      return el('button', { class: 'btn ' + (k === '⌫' ? 'coral' : ''), type: 'button', text: k, 'aria-label': k === '⌫' ? 'Delete' : k, onclick: function () {
        BT.sfx.click();
        if (k === '⌫') set(val.slice(0, -1));
        else if (k === '.') { if (val.indexOf('.') < 0) set((val || '0') + '.'); }
        else if (val.length < 7 && !(val.indexOf('.') >= 0 && val.split('.')[1].length >= 2)) set(val === '0' ? k : val + k);
      } });
    }));
    var go = el('button', { class: 'btn gold', type: 'button', text: 'Go', style: { gridColumn: '1 / -1' }, onclick: function () { if (val !== '' && val !== '.') onSubmit(val); } });
    grid.appendChild(go);
    var wrap = el('div', { style: { maxWidth: '360px', margin: '0 auto', width: '100%' } }, [disp, grid]);
    wrap.setValue = set;
    wrap.disable = function () { grid.querySelectorAll('button').forEach(function (b) { b.disabled = true; }); };
    wrap.enable = function () { grid.querySelectorAll('button').forEach(function (b) { b.disabled = false; }); set(''); };
    return wrap;
  }

  function build(container, ctx) {
    return new Promise(function (resolve) {
      var q = generate(ctx.level, ctx.job && ctx.job.kind);
      var t0 = performance.now(), hints = 0, misses = 0, settled = false;
      container.innerHTML = '';

      function finish(correct) {
        if (settled) return; settled = true;
        BT.test.roundHooks = null;
        var res = { correct: correct, ms: Math.round(performance.now() - t0), hints: hints, retry: correct && misses > 0, answer: q.answer, skipped: false };
        resolve(res);
      }

      var hintBox = el('div', { class: 'card muted', style: { display: 'none', textAlign: 'center' } });
      var hintBtn = el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint', onclick: function () {
        if (settled) return;
        hints++; hintBtn.disabled = true;
        if (ctx.onHint) ctx.onHint();
        hintBox.textContent = 'Hint: ' + q.hint; hintBox.style.display = '';
      } });
      // session.js already shows the subject pill; the round adds only the question, the hint right under it, and the pad/options.
      var qEl = el('div', { class: 'question', text: q.q });
      var body = el('div', {});
      [el('div', { class: 'btn-row' }, hintBtn), qEl, hintBox, body].forEach(function (n) { container.appendChild(n); });

      function wrong(label, retryFn) {
        misses++;
        BT.sfx.bad();
        var p = ctx.explain ? ctx.explain(q.why) : Promise.resolve();
        Promise.resolve(p).then(function () {
          if (misses >= 2) { finish(false); return; }
          BT.toast('Try once more', 'info');
          retryFn();
        });
      }

      if (q.mode === 'mc') {
        var btns = q.options.map(function (label) {
          var b = el('button', { class: 'option', type: 'button', text: label });
          b.addEventListener('click', function () { choose(label, b); });
          return b;
        });
        body.appendChild(el('div', { class: 'options' }, btns));
        var choose = function (label, b) {
          if (settled || b.disabled) return;
          btns.forEach(function (x) { x.disabled = true; });
          if (label === q.answer) { b.classList.add('right'); BT.sfx.good(); finish(true); }
          else {
            b.classList.add('wrong');
            wrong(label, function () { btns.forEach(function (x) { if (!x.classList.contains('wrong')) x.disabled = false; }); });
          }
        };
        BT.test.roundHooks = { subject: 'money', currentAnswer: function () { return q.answer; }, answer: function (label) {
          var b = btns.filter(function (x) { return x.textContent === label; })[0];
          if (b) choose(label, b);
        } };
      } else {
        var padEl = numpad(function (v) { submit(v); }, q.unit ? '' : '$'); // a count (break-even) is not dollars
        if (q.unit) body.appendChild(el('div', { class: 'center muted', text: 'Answer in ' + q.unit }));
        body.appendChild(padEl);
        var submit = function (v) {
          if (settled) return;
          padEl.disable();
          var n = parseFloat(v);
          if (Math.abs(n - q.value) < 0.005) { padEl.firstChild.style.color = 'var(--mint)'; BT.sfx.good(); finish(true); }
          else { padEl.firstChild.style.color = 'var(--coral)'; wrong(v, function () { padEl.enable(); padEl.firstChild.style.color = ''; }); }
        };
        BT.test.roundHooks = { subject: 'money', currentAnswer: function () { return String(q.value); }, answer: function (label) {
          padEl.setValue(String(label).replace(/[^0-9.]/g, '')); submit(String(label).replace(/[^0-9.]/g, ''));
        } };
      }
    });
  }

  BT.rounds.money = { generate: generate, build: build, themes: THEMES, fm: fm };
  BT.registerRound('money', { title: 'Money', icon: '💰', build: build });
  // Convenience: BT.test.currentAnswer() / BT.test.answer() delegate to whichever round is live.
  BT.test.currentAnswer = BT.test.currentAnswer || function () { return BT.test.roundHooks ? BT.test.roundHooks.currentAnswer() : undefined; };
  BT.test.answer = BT.test.answer || function (label) { if (BT.test.roundHooks) BT.test.roundHooks.answer(label); };

  BT.registerChecks('money', [
    { name: 'every level generates valid items for every theme', fn: function () {
      var kinds = Object.keys(THEMES).concat(['unknown-kind', '']);
      for (var L = 1; L <= 5; L++) kinds.forEach(function (k) {
        for (var i = 0; i < 12; i++) {
          var it = generate(L, k);
          if (!it.q || !it.why || !it.hint || !it.answer) throw new Error('L' + L + ' ' + k + ' missing field');
          if (it.mode === 'mc') {
            if (it.options.length !== 4) throw new Error('L' + L + ' options ' + it.options.length);
            if (new Set(it.options).size !== 4) throw new Error('L' + L + ' dup options ' + it.options.join('|'));
            if (it.options.indexOf(it.answer) < 0) throw new Error('L' + L + ' answer not in options');
          } else if (it.mode !== 'pad' || !isFinite(it.value) || it.value < 0) throw new Error('L' + L + ' bad pad value');
        }
      });
      return true;
    } },
    { name: 'fm formats cents and whole dollars', fn: function () { return fm(3.5) === '$3.50' && fm(12) === '$12' && fm(1234) === '$1,234' && fm(0.25) === '$0.25'; } },
    { name: 'plural and bill helpers', fn: function () {
      return plural(2, 'loaf of bread') === '2 loaves of bread' && plural(3, 'bag of feed') === '3 bags of feed' && plural(1, 'pie') === '1 pie' && plural(4, 'box') === '4 boxes' &&
        bill(4.5) === 5 && bill(20) === 50 && bill(240) === 500 && bill(600) === 700;
    } },
    { name: 'theme resolves aliases and falls back', fn: function () {
      var themed = (BT.jobs && BT.jobs.data || []).filter(function (j) { return theme(j.kind)[0].name !== 'notebook'; }).length;
      return theme('pet')[0].name === 'bag of dog food' && theme('bakery')[0].name === 'cupcake' && theme('xyz')[0].name === 'notebook' && (!BT.jobs || !BT.jobs.data || themed >= 20);
    } },
    { name: 'build renders question, options or pad, and a Hint button', fn: function () {
      var box = document.createElement('div'); document.body.appendChild(box);
      var hinted = 0;
      build(box, { level: 2, job: { kind: 'bakery' }, jobLevel: 1, pay: 20, onHint: function () { hinted++; }, explain: function () { return Promise.resolve(); } });
      var ok = !!box.querySelector('.question') && (box.querySelectorAll('.option').length === 4 || !!box.querySelector('.numpad')) && !!BT.test.roundHooks && BT.test.roundHooks.subject === 'money';
      var hintBtn = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return b.textContent === 'Hint'; })[0];
      hintBtn.click();
      var hintBox = box.querySelector('.card.muted');
      ok = ok && hinted === 1 && hintBtn.disabled && hintBox.style.display === '' && hintBox.previousSibling === box.querySelector('.question');
      ok = ok && !box.querySelector('h2') && !box.querySelector('.screen-head'); // the session header owns the subject title
      BT.test.roundHooks = null; box.remove();
      return ok;
    } }
  ]);
})();
