// BT.rounds.geography: procedural questions from BT.states. Tap-the-state on BT.usmap, capitals, regions, nicknames,
// landmarks, borders, farther west/north, time zones (L4+), which is bigger (L5). Hint = flash the region.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;

  // States that sit wholly in one time zone (split states left out so every answer is clean).
  var TZ = {
    Eastern: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'OH'],
    Central: ['WI', 'IL', 'MN', 'IA', 'MO', 'AR', 'LA', 'MS', 'AL', 'OK'],
    Mountain: ['MT', 'WY', 'CO', 'NM', 'UT', 'AZ'],
    Pacific: ['WA', 'CA', 'NV'],
    Alaska: ['AK'], Hawaii: ['HI']
  };
  var ZONES = Object.keys(TZ);
  // Total area, largest first (U.S. Census). "Which is bigger" only compares states at least 8 places apart.
  var AREA = ['AK', 'TX', 'CA', 'MT', 'NM', 'AZ', 'NV', 'CO', 'OR', 'WY', 'MI', 'MN', 'UT', 'ID', 'KS', 'NE', 'SD', 'WA', 'ND', 'OK',
    'MO', 'FL', 'WI', 'GA', 'IL', 'IA', 'NY', 'NC', 'AR', 'AL', 'LA', 'MS', 'PA', 'OH', 'VA', 'TN', 'KY', 'IN', 'ME', 'SC',
    'WV', 'MD', 'HI', 'MA', 'VT', 'NH', 'NJ', 'CT', 'DE', 'RI'];

  // Landmarks in states.js that also lie in (or share a famous name with) another state; never offer that state as a distractor.
  var CO_STATE = { TN: ['NC'], NV: ['AZ'], VT: ['NY'], WY: ['MT', 'ID'], NE: ['NC'] };

  // Geographic center of each state [lat, lon], rounded to a tenth of a degree (used for farther west/north questions).
  var CENTER = { AL: [32.8, -86.8], AK: [64.0, -152.0], AZ: [34.3, -111.7], AR: [34.9, -92.4], CA: [37.2, -119.5], CO: [39.0, -105.5],
    CT: [41.6, -72.7], DE: [39.0, -75.5], FL: [28.6, -82.4], GA: [32.7, -83.4], HI: [20.8, -156.3], ID: [44.4, -114.6], IL: [40.0, -89.2],
    IN: [39.9, -86.3], IA: [42.1, -93.5], KS: [38.5, -98.4], KY: [37.5, -85.3], LA: [31.1, -91.9], ME: [45.4, -69.2], MD: [39.0, -76.8],
    MA: [42.3, -71.8], MI: [44.3, -85.4], MN: [46.3, -94.3], MS: [32.7, -89.7], MO: [38.5, -92.5], MT: [47.0, -109.6], NE: [41.5, -99.8],
    NV: [39.3, -116.6], NH: [43.7, -71.6], NJ: [40.2, -74.4], NM: [34.4, -106.1], NY: [42.9, -75.5], NC: [35.5, -79.4], ND: [47.5, -100.5],
    OH: [40.4, -82.8], OK: [35.6, -97.5], OR: [43.9, -120.6], PA: [40.9, -77.8], RI: [41.7, -71.5], SC: [33.9, -80.9], SD: [44.4, -100.2],
    TN: [35.9, -86.3], TX: [31.5, -99.3], UT: [39.3, -111.7], VT: [44.1, -72.7], VA: [37.5, -78.8], WA: [47.4, -120.5], WV: [38.6, -80.6],
    WI: [44.6, -89.9], WY: [43.0, -107.5] };

  function S() { return BT.states || []; }
  function byAbbr(a) { return S().filter(function (s) { return s.abbr === a; })[0]; }
  function others(st, n, filter) { // n distinct states other than st, passing filter
    return BT.shuffle(S().filter(function (s) { return s !== st && (!filter || filter(s)); })).slice(0, n);
  }
  function optionsOf(answer, pool, key) { // 4 unique labels: the answer plus 3 from the pool
    var set = [answer];
    BT.shuffle(pool).forEach(function (s) { var v = key(s); if (set.length < 4 && set.indexOf(v) < 0) set.push(v); });
    return BT.shuffle(set);
  }
  function mc(q, answer, pool, key, why, hint, about) {
    return { q: q, mode: 'mc', options: optionsOf(answer, pool, key), answer: answer, why: why, hint: hint, about: about };
  }
  function regionHint(st) { return st.name + ' is in the ' + st.region + '.'; }
  function whereIs(st) {
    var nb = st.neighbors.map(function (a) { var s = byAbbr(a); return s ? s.name : a; });
    return st.name + ' is in the ' + st.region + (nb.length ? ', next to ' + nb.slice(0, 3).join(', ') + '.' : '. It has no land neighbors.');
  }

  var KINDS = {
    tap: { level: 1, gen: function () {
      var st = BT.pick(S());
      return { q: 'Tap ' + st.name, mode: 'tap', answer: st.abbr, label: st.name, why: whereIs(st), hint: regionHint(st), about: st };
    } },
    capital: { level: 1, gen: function () {
      var st = BT.pick(S());
      return mc('What is the capital of ' + st.name + '?', st.capital, others(st, 10), function (s) { return s.capital; },
        'The capital of ' + st.name + ' is ' + st.capital + '. Its biggest city is ' + st.bigCity + '.', regionHint(st), st);
    } },
    region: { level: 1, gen: function () {
      var st = BT.pick(S());
      return mc('Which region is ' + st.name + ' in?', st.region, S(), function (s) { return s.region; },
        whereIs(st), 'Picture where ' + st.name + ' sits on the map.', st);
    } },
    capitalOf: { level: 2, gen: function () {
      var st = BT.pick(S());
      return mc(st.capital + ' is the capital of which state?', st.name, others(st, 10), function (s) { return s.name; },
        st.capital + ' is the capital of ' + st.name + '.', regionHint(st), st);
    } },
    nickname: { level: 2, gen: function () {
      var st = BT.pick(S());
      return mc('Which state is nicknamed the ' + st.nickname.replace(/^The /, '') + '?', st.name, others(st, 10), function (s) { return s.name; },
        st.name + ' is the ' + st.nickname + '. ' + st.fact, regionHint(st), st);
    } },
    landmark: { level: 3, gen: function () {
      var st = BT.pick(S());
      var co = CO_STATE[st.abbr] || [];
      return mc('In which state would you visit ' + st.landmark + '?', st.name, others(st, 10, function (s) { return co.indexOf(s.abbr) < 0; }), function (s) { return s.name; },
        st.landmark + ' is in ' + st.name + '. ' + st.fact, regionHint(st), st);
    } },
    borders: { level: 3, gen: function () {
      var st = BT.pick(S().filter(function (s) { return s.neighbors.length >= 2; }));
      var nb = byAbbr(BT.pick(st.neighbors));
      var far = others(st, 20, function (s) { return st.neighbors.indexOf(s.abbr) < 0 && s.abbr !== nb.abbr; });
      return mc('Which state shares a border with ' + st.name + '?', nb.name, far, function (s) { return s.name; },
        whereIs(st), regionHint(st), st);
    } },
    farthest: { level: 3, gen: function () {
      var dir = BT.pick(['west', 'north', 'east', 'south']), axis = dir === 'west' || dir === 'east' ? 1 : 0;
      // real centers, not tile positions: the tile grid puts Florida east of the Carolinas and Maine north of Montana
      var pool = S().filter(function (s) { return CENTER[s.abbr] && s.abbr !== 'AK' && s.abbr !== 'HI'; }), picked = [];
      BT.shuffle(pool).forEach(function (s) {
        var ok = picked.every(function (p) { return Math.abs(CENTER[p.abbr][axis] - CENTER[s.abbr][axis]) >= 1.5; });
        if (picked.length < 4 && ok) picked.push(s);
      });
      var best = picked.reduce(function (a, b) {
        var va = CENTER[a.abbr][axis], vb = CENTER[b.abbr][axis];
        return (dir === 'west' || dir === 'south') ? (vb < va ? b : a) : (vb > va ? b : a);
      });
      return { q: 'Which of these states is farthest ' + dir + '?', mode: 'mc', options: BT.shuffle(picked.map(function (s) { return s.name; })), answer: best.name,
        why: 'On the map ' + best.name + ' sits farthest ' + dir + ' of the four. ' + whereIs(best), hint: 'Picture the four on the map and look ' + dir + '.', about: best };
    } },
    notBorder: { level: 4, gen: function () {
      var st = BT.pick(S().filter(function (s) { return s.neighbors.length >= 3; }));
      var nbs = BT.shuffle(st.neighbors).slice(0, 3).map(byAbbr);
      var odd = others(st, 1, function (s) { return st.neighbors.indexOf(s.abbr) < 0; })[0];
      return { q: 'Which state does NOT border ' + st.name + '?', mode: 'mc', options: BT.shuffle(nbs.concat([odd]).map(function (s) { return s.name; })), answer: odd.name,
        why: st.name + ' borders ' + nbs.map(function (s) { return s.name; }).join(', ') + '. ' + odd.name + ' is in the ' + odd.region + ', not touching it.', hint: regionHint(st), about: st };
    } },
    timezone: { level: 4, gen: function () {
      var zone = BT.pick(ZONES.slice(0, 4)), st = byAbbr(BT.pick(TZ[zone]));
      return { q: 'Which time zone is ' + st.name + ' in?', mode: 'mc', options: BT.shuffle(ZONES.slice(0, 4)), answer: zone,
        why: st.name + ' is in the ' + zone + ' time zone. Zones run Eastern, Central, Mountain, Pacific as you go west.', hint: regionHint(st) + ' Zones go Eastern → Central → Mountain → Pacific heading west.', about: st };
    } },
    bigger: { level: 5, gen: function () {
      var i = BT.rand(0, AREA.length - 25), idx = [i, i + 8, i + 16, i + 24];
      var picked = idx.map(function (k) { return byAbbr(AREA[k]); }), big = picked[0];
      return { q: 'Which of these states is the biggest in area?', mode: 'mc', options: BT.shuffle(picked.map(function (s) { return s.name; })), answer: big.name,
        why: big.name + ' is number ' + (i + 1) + ' in size of the 50 states. ' + picked.slice(1).map(function (s, n) { return s.name + ' is number ' + (idx[n + 1] + 1); }).join(', ') + '.',
        hint: 'Think about how much of the map each one covers.', about: big };
    } }
  };

  function generate(level) {
    level = Math.min(5, Math.max(1, Math.round(level || 1)));
    var kinds = Object.keys(KINDS).filter(function (k) { return KINDS[k].level <= level; });
    // tap-the-state stays frequent at every level
    var k = BT.rng() < 0.3 ? 'tap' : BT.pick(kinds);
    var it = KINDS[k].gen();
    it.kind = k; it.level = level;
    return it;
  }

  function renderMap(container, opts) { BT.usmap.render(container, opts); }
  function flash(abbr, kind) { BT.usmap.flash(abbr, kind); }

  function build(container, ctx) {
    return new Promise(function (resolve) {
      var q = generate(ctx.level);
      var t0 = performance.now(), hints = 0, misses = 0, settled = false;
      container.innerHTML = '';

      function finish(correct) {
        if (settled) return; settled = true;
        BT.test.roundHooks = null;
        resolve({ correct: correct, ms: Math.round(performance.now() - t0), hints: hints, retry: correct && misses > 0, answer: q.label || q.answer, skipped: false });
      }
      function flashRegion(st) {
        var abbrs = S().filter(function (s) { return s.region === st.region; }).map(function (s) { return s.abbr; });
        if (BT.usmap && typeof BT.usmap.highlight === 'function') {
          BT.usmap.highlight(abbrs);
          setTimeout(function () { BT.usmap.highlight([]); }, BT.TEST ? 30 : 1800);
        } else abbrs.forEach(function (a) { flash(a, 'hint'); });
      }
      var hintBox = el('div', { class: 'card muted', style: { display: 'none', textAlign: 'center' } });
      var hintBtn = el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint', onclick: function () {
        if (settled) return;
        hints++; hintBtn.disabled = true;
        if (ctx.onHint) ctx.onHint();
        hintBox.textContent = 'Hint: ' + q.hint; hintBox.style.display = '';
        if (q.mode === 'tap' && q.about) flashRegion(q.about);
      } });
      // no h2: the session pill above already says Geography. Hint stays top right until session.js owns it for every round.
      var head = el('div', { class: 'screen-head', style: { justifyContent: 'flex-end' } }, [hintBtn]);
      var qEl = el('div', { class: 'question', text: q.q });
      var body = el('div', { class: 'screen-body', style: { alignItems: 'center' } });
      container.appendChild(el('div', { class: 'screen-body' }, [head, qEl, body, hintBox]));

      function wrong(retryFn) {
        misses++;
        if (q.mode !== 'tap') BT.sfx.bad();
        Promise.resolve(ctx.explain ? ctx.explain(q.why) : null).then(function () {
          if (misses >= 2) { if (q.mode === 'tap') flash(q.answer, 'good'); finish(false); return; }
          BT.toast('Try once more', 'info');
          retryFn();
        });
      }

      if (q.mode === 'tap') {
        var locked = false;
        var mapBox = el('div', { style: { width: '100%', maxWidth: '720px', flex: '1', minHeight: '0' } });
        body.appendChild(mapBox);
        var tap = function (abbr) {
          if (settled || locked) return;
          locked = true;
          // BT.usmap.flash plays the good/bad sound itself
          if (abbr === q.answer) { flash(abbr, 'good'); finish(true); }
          else { flash(abbr, 'bad'); wrong(function () { locked = false; }); }
        };
        renderMap(mapBox, { onTap: tap, labels: true, pins: [], highlight: [] }); // labels at every level: the tile grid is not the real shape of the country, so an unlabeled grid is a guess, not geography
        BT.test.roundHooks = { subject: 'geography', currentAnswer: function () { return q.answer; }, answer: tap };
      } else {
        var btns = q.options.map(function (label) {
          var b = el('button', { class: 'option', type: 'button', text: label });
          b.addEventListener('click', function () { choose(label, b); }); // a completed tap, so a brushed or scrolling finger is not scored
          return b;
        });
        body.appendChild(el('div', { class: 'options', style: { width: '100%' } }, btns));
        var choose = function (label, b) {
          if (settled || b.disabled) return;
          btns.forEach(function (x) { x.disabled = true; });
          if (label === q.answer) { b.classList.add('right'); BT.sfx.good(); finish(true); }
          else { b.classList.add('wrong'); wrong(function () { btns.forEach(function (x) { if (!x.classList.contains('wrong')) x.disabled = false; }); }); }
        };
        BT.test.roundHooks = { subject: 'geography', currentAnswer: function () { return q.answer; }, answer: function (label) {
          var b = btns.filter(function (x) { return x.textContent === label; })[0];
          if (b) choose(label, b);
        } };
      }
    });
  }

  BT.rounds.geography = { generate: generate, build: build, kinds: Object.keys(KINDS), timezones: TZ, areaRank: AREA, centers: CENTER };
  BT.registerRound('geography', { title: 'Geography', icon: '🗺️', build: build });
  BT.test.currentAnswer = BT.test.currentAnswer || function () { return BT.test.roundHooks ? BT.test.roundHooks.currentAnswer() : undefined; };
  BT.test.answer = BT.test.answer || function (label) { if (BT.test.roundHooks) BT.test.roundHooks.answer(label); };

  BT.registerChecks('geography', [
    { name: 'every kind generates a valid item', fn: function () {
      Object.keys(KINDS).forEach(function (k) {
        for (var i = 0; i < 25; i++) {
          var it = KINDS[k].gen();
          if (!it.q || !it.why || !it.hint || !it.answer) throw new Error(k + ' missing field');
          if (it.mode === 'mc') {
            if (it.options.length !== 4) throw new Error(k + ' options ' + it.options.length);
            if (new Set(it.options).size !== 4) throw new Error(k + ' dup options ' + it.options.join('|'));
            if (it.options.indexOf(it.answer) < 0) throw new Error(k + ' answer not in options');
          } else if (it.mode !== 'tap' || !byAbbr(it.answer)) throw new Error(k + ' bad tap answer');
        }
      });
      return true;
    } },
    { name: 'landmark never offers a co-state as a distractor; options answer on click, not pointerdown', fn: function () {
      for (var i = 0; i < 300; i++) {
        var it = KINDS.landmark.gen(), co = CO_STATE[it.about.abbr] || [];
        it.options.forEach(function (n) { var s = S().filter(function (x) { return x.name === n; })[0]; if (co.indexOf(s.abbr) >= 0) throw new Error(it.about.landmark + ' offered ' + n); });
      }
      var box = document.createElement('div'); document.body.appendChild(box);
      var b;
      for (var k = 0; k < 20 && !b; k++) { box.innerHTML = ''; build(box, { level: 2, onHint: function () {}, explain: function () { return Promise.resolve(); } }); b = box.querySelector('.option'); }
      if (!b) { box.remove(); throw new Error('no mc item in 20 builds'); }
      b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      var untouched = !b.disabled;
      b.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      var committed = b.disabled;
      box.remove(); BT.test.roundHooks = null;
      if (!untouched || !committed) throw new Error('pointerdown committed=' + !untouched + ' click committed=' + committed);
      return true;
    } },
    { name: 'levels gate the kinds (no time zone before 4, no bigger before 5)', fn: function () {
      for (var i = 0; i < 60; i++) {
        var a = generate(1).kind, b = generate(3).kind;
        if (['landmark', 'borders', 'farthest', 'notBorder', 'timezone', 'bigger'].indexOf(a) >= 0) throw new Error('L1 got ' + a);
        if (['timezone', 'bigger'].indexOf(b) >= 0) throw new Error('L3 got ' + b);
      }
      return true;
    } },
    { name: 'time zone and area tables name real states, no state in two zones', fn: function () {
      var seen = {};
      ZONES.forEach(function (z) { TZ[z].forEach(function (a) { if (!byAbbr(a) || seen[a]) throw new Error('tz ' + a); seen[a] = 1; }); });
      if (AREA.length !== 50 || new Set(AREA).size !== 50) throw new Error('area list');
      AREA.forEach(function (a) { if (!byAbbr(a)) throw new Error('area ' + a); });
      S().forEach(function (s) { if (!CENTER[s.abbr] || CENTER[s.abbr].length !== 2) throw new Error('center ' + s.abbr); });
      return true;
    } },
    { name: 'farthest picks four states well apart and the answer is the real extreme', fn: function () {
      for (var i = 0; i < 40; i++) {
        var it = KINDS.farthest.gen(), dir = it.q.match(/farthest (\w+)/)[1], axis = dir === 'west' || dir === 'east' ? 1 : 0;
        var vals = it.options.map(function (n) { return CENTER[S().filter(function (s) { return s.name === n; })[0].abbr][axis]; });
        var ans = CENTER[it.about.abbr][axis], ext = (dir === 'west' || dir === 'south') ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
        if (ans !== ext) throw new Error(dir + ' ' + it.answer);
        vals.sort(function (a, b) { return a - b; });
        for (var k = 1; k < 4; k++) if (vals[k] - vals[k - 1] < 1.5) throw new Error('too close ' + it.options.join('|'));
      }
      return true;
    } },
    { name: 'build renders, exposes hooks, and the hook answer settles it', fn: function () {
      var box = document.createElement('div'); document.body.appendChild(box);
      build(box, { level: 1, job: {}, jobLevel: 1, pay: 20, onHint: function () {}, explain: function () { return Promise.resolve(); } });
      var ok = !!box.querySelector('.question') && !!BT.test.roundHooks && BT.test.roundHooks.subject === 'geography';
      ok = ok && (!!box.querySelector('svg') || box.querySelectorAll('.option').length === 4);
      var hooks = BT.test.roundHooks;
      hooks.answer(hooks.currentAnswer());
      ok = ok && BT.test.roundHooks === null;
      box.remove();
      return ok;
    } }
  ]);
})();
