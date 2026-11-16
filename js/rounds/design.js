// BT.rounds.design: Design Studio. One prompt kind (sign, colors, layout, menu, uniform), four options drawn as
// SVG cards, no right answer (correct:null). answer = "Label (tag)" with tag bold|calm|classic|wild.
// The chosen color is saved to BT.state.jobs[jobId].accent (the job card's accent next time).
// Test hooks: BT.test.roundHooks = {subject:'design', currentAnswer(), answer(label)}.
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var M = BT.rounds.design = BT.rounds.design || {};
  M.TAGS = ['bold', 'calm', 'classic', 'wild'];

  // ---------- svg helpers (viewBox 200x120) ----------
  function svg(inner) { return '<svg viewBox="0 0 200 120" width="100%" height="110" aria-hidden="true">' + inner + '</svg>'; }
  function rect(x, y, w, h, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" ' + (extra || '') + '/>'; }
  function txt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="700" fill="' + fill + '" font-family="Fredoka, system-ui, sans-serif" ' + (extra || '') + ' text-anchor="middle">' + BT.esc(s) + '</text>';
  }
  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function signName(job) { return clip((job.city || 'Main Street') + ' ' + (job.title || 'Shop').replace(/ (Helper|Clerk|Guide|Hand|Teller)$/, ''), 22).toUpperCase(); }
  function menuLines(job) {
    var items = (job.tasks && job.tasks.length >= 3) ? job.tasks.slice(0, 3) : ['Specials', 'Snacks', 'Drinks'];
    return items.map(function (t, i) { return { name: clip(t, 13), price: '$' + (i + 2) }; });
  }
  function menuText(job, color, y0, gap, size, extra) {
    return menuLines(job).map(function (l, i) {
      return txt(24, y0 + i * gap, l.name, size, color, 'text-anchor="start" ' + (extra || '')) + txt(176, y0 + i * gap, l.price, size, color, 'text-anchor="end" ' + (extra || ''));
    }).join('');
  }
  // top-down store: walls, door at the bottom; `inner` holds counters and shelves
  function room(floor, inner) {
    return rect(10, 6, 180, 108, floor, 'rx="8" stroke="#1e2430" stroke-width="4"') + rect(85, 106, 30, 10, '#ffcf3f', 'rx="2"') + inner;
  }
  function shelf(x, y, w, h, c) { return rect(x, y, w, h, c, 'rx="3" stroke="#1e2430" stroke-width="2"'); }
  // blocky torso: head, shirt, arms; `extras` draws hats, aprons, ties
  function person(skin, shirt, extras) {
    return rect(80, 8, 40, 36, skin, 'rx="6"') + rect(90, 22, 6, 6, '#1e2430') + rect(104, 22, 6, 6, '#1e2430') +
      rect(60, 48, 80, 66, shirt, 'rx="8"') + rect(44, 50, 16, 48, skin, 'rx="5"') + rect(140, 50, 16, 48, skin, 'rx="5"') + (extras || '');
  }
  function swatches(cols) {
    return cols.map(function (c, i) { return rect(14 + i * 40, 10, 32, 32, c, 'rx="6" stroke="#1e2430" stroke-width="3"'); }).join('') +
      rect(140, 60, 46, 54, cols[1], 'rx="4"') + rect(136, 52, 54, 14, cols[0], 'rx="3"') + rect(156, 86, 14, 28, cols[2]) +
      rect(146, 72, 10, 10, '#fff8e7') + rect(174, 72, 10, 10, '#fff8e7') +
      rect(14, 60, 110, 54, cols[0], 'rx="6"') + rect(14, 60, 110, 18, cols[2], 'rx="6"') +
      txt(69, 102, 'Our colors', 14, '#1e2430');
  }

  function O(label, tag, color, draw) { return { label: label, tag: tag, color: color, svg: draw }; }
  M.kinds = {
    sign: { title: 'Pick a sign for the front of the shop', options: [
      O('Neon Night', 'bold', '#ff4fa3', function (j) {
        return svg(rect(6, 14, 188, 92, '#1e2430', 'rx="12" stroke="#40e0ff" stroke-width="4"') +
          txt(100, 56, signName(j), 15, 'none', 'stroke="#ff4fa3" stroke-width="6" opacity=".45"') + txt(100, 56, signName(j), 15, '#ffe6f4') +
          txt(100, 86, 'OPEN LATE', 13, '#40e0ff'));
      }),
      O('Wooden Board', 'calm', '#8b5a2b', function (j) {
        return svg('<line x1="40" y1="0" x2="48" y2="20" stroke="#d9b36a" stroke-width="3"/><line x1="160" y1="0" x2="152" y2="20" stroke="#d9b36a" stroke-width="3"/>' +
          rect(10, 20, 180, 84, '#8b5a2b', 'rx="8"') + rect(10, 40, 180, 3, '#6f4520') + rect(10, 70, 180, 3, '#6f4520') +
          txt(100, 60, signName(j), 15, '#fff8e7') + txt(100, 90, 'since today', 12, '#f1d9a8'));
      }),
      O('Gold & Navy', 'classic', '#1f3a93', function (j) {
        return svg(rect(8, 12, 184, 96, '#1f3a93', 'rx="6" stroke="#c9a227" stroke-width="5"') + rect(18, 22, 164, 76, 'none', 'rx="3" stroke="#c9a227" stroke-width="2"') +
          txt(100, 58, signName(j), 15, '#ffd966', 'font-family="Georgia, serif"') + txt(100, 84, '★  EST. 2026  ★', 12, '#c9a227'));
      }),
      O('Rainbow Pop', 'wild', '#ff8c00', function (j) {
        var cols = ['#ff4136', '#ff8c00', '#ffcf3f', '#3ddc97', '#6ec6ff', '#8b6cff'];
        return svg(cols.map(function (c, i) { return rect(6, 10 + i * 17, 188, 17, c); }).join('') + rect(6, 10, 188, 102, 'none', 'rx="10" stroke="#1e2430" stroke-width="5"') +
          txt(100, 70, signName(j), 17, '#fff', 'stroke="#1e2430" stroke-width="5" paint-order="stroke"'));
      })] },
    colors: { title: 'Pick a color scheme for the whole place', options: [
      O('Fire & Smoke', 'bold', '#ff4136', function () { return svg(swatches(['#ff4136', '#1e2430', '#ffcf3f'])); }),
      O('Sea Glass', 'calm', '#5b8c85', function () { return svg(swatches(['#9ad9d0', '#e9f5f2', '#5b8c85'])); }),
      O('Cream & Navy', 'classic', '#1f3a93', function () { return svg(swatches(['#1f3a93', '#fff8e7', '#c9a227'])); }),
      O('Candy Mix', 'wild', '#ff6bd6', function () { return svg(swatches(['#ff6bd6', '#3ddc97', '#8b6cff'])); })] },
    layout: { title: 'Pick a floor plan for the store (door at the bottom)', options: [
      O('Big Island', 'bold', '#ff6b6b', function () {
        return svg(room('#fff1e6', '<circle cx="100" cy="58" r="26" fill="#ff6b6b" stroke="#1e2430" stroke-width="3"/>' + txt(100, 62, 'COUNTER', 9, '#fff') +
          shelf(16, 14, 60, 12, '#ffcf3f') + shelf(124, 14, 60, 12, '#ffcf3f') + shelf(16, 60, 12, 40, '#ffcf3f') + shelf(172, 60, 12, 40, '#ffcf3f')));
      }),
      O('Open & Airy', 'calm', '#3ddc97', function () {
        return svg(room('#eafaf1', shelf(30, 14, 140, 16, '#3ddc97') + txt(100, 26, 'COUNTER', 9, '#1e2430') +
          '<circle cx="60" cy="72" r="12" fill="#b9f0d6" stroke="#1e2430" stroke-width="2"/><circle cx="140" cy="72" r="12" fill="#b9f0d6" stroke="#1e2430" stroke-width="2"/>' +
          rect(90, 50, 20, 40, '#d7f5e6', 'rx="3"') + txt(100, 74, '~', 12, '#3ddc97')));
      }),
      O('Neat Rows', 'classic', '#8d99a6', function () {
        return svg(room('#f3f4f6', shelf(20, 20, 110, 12, '#8d99a6') + shelf(20, 46, 110, 12, '#8d99a6') + shelf(20, 72, 110, 12, '#8d99a6') +
          shelf(150, 20, 30, 70, '#c9a227') + txt(165, 58, 'PAY', 9, '#1e2430')));
      }),
      O('Twisty Maze', 'wild', '#8b6cff', function () {
        return svg(room('#f1ecff', shelf(16, 20, 120, 10, '#8b6cff') + shelf(64, 44, 120, 10, '#8b6cff') + shelf(16, 68, 120, 10, '#8b6cff') +
          shelf(150, 90, 34, 14, '#ffcf3f') + txt(167, 101, 'PAY', 9, '#1e2430') + txt(32, 100, 'start →', 9, '#1e2430')));
      })] },
    menu: { title: 'Pick a menu board for the counter', options: [
      O('Big Bold Board', 'bold', '#ffcf3f', function (j) {
        return svg(rect(6, 6, 188, 108, '#ffcf3f', 'rx="8" stroke="#1e2430" stroke-width="5"') + rect(6, 6, 188, 24, '#1e2430') + txt(100, 24, 'TODAY', 14, '#ffcf3f') +
          menuText(j, '#1e2430', 54, 24, 13));
      }),
      O('Soft Card', 'calm', '#f7c6d0', function (j) {
        return svg(rect(14, 10, 172, 100, '#fff6f7', 'rx="14" stroke="#f7c6d0" stroke-width="4"') + '<line x1="40" y1="34" x2="160" y2="34" stroke="#f7c6d0" stroke-width="2"/>' +
          txt(100, 28, 'menu', 12, '#b76e79', 'font-style="italic"') + menuText(j, '#5a4a4f', 56, 22, 11));
      }),
      O('Chalkboard', 'classic', '#2f5d50', function (j) {
        return svg(rect(4, 4, 192, 112, '#8b5a2b', 'rx="6"') + rect(12, 12, 176, 96, '#2f5d50', 'rx="3"') + txt(100, 32, '~ Specials ~', 13, '#fff8e7') +
          menuText(j, '#fff8e7', 56, 22, 11, 'opacity=".9"'));
      }),
      O('Zigzag Zing', 'wild', '#ff8c00', function (j) {
        var zig = '<polygon points="6,6 194,6 194,24 174,14 154,24 134,14 114,24 94,14 74,24 54,14 34,24 14,14 6,24" fill="#8b6cff"/>';
        return svg(rect(6, 6, 188, 108, '#ff8c00', 'rx="8" stroke="#1e2430" stroke-width="4"') + zig + txt(100, 44, 'EAT!', 15, '#1e2430') +
          menuText(j, '#4b2a8c', 68, 21, 12));
      })] },
    uniform: { title: 'Pick a uniform for the crew', options: [
      O('Bright Tee & Cap', 'bold', '#ff4136', function () {
        return svg(person('#f1c27d', '#ff4136', rect(76, 2, 48, 12, '#1e2430', 'rx="4"') + rect(118, 8, 20, 6, '#1e2430', 'rx="2"') + txt(100, 84, 'CREW', 14, '#fff')));
      }),
      O('Soft Apron', 'calm', '#3ddc97', function () {
        return svg(person('#c68642', '#e9f5f2', rect(72, 60, 56, 54, '#3ddc97', 'rx="6"') + rect(96, 48, 8, 14, '#3ddc97') + rect(84, 88, 32, 16, '#b9f0d6', 'rx="3"')));
      }),
      O('Vest & Tie', 'classic', '#1f3a93', function () {
        return svg(person('#8d5524', '#ffffff', rect(60, 48, 30, 66, '#1f3a93', 'rx="6"') + rect(110, 48, 30, 66, '#1f3a93', 'rx="6"') +
          '<polygon points="100,50 106,62 100,96 94,62" fill="#c9a227"/>'));
      }),
      O('Pattern Party', 'wild', '#8b6cff', function () {
        var dots = '';
        for (var y = 56; y < 110; y += 14) for (var x = 68; x < 136; x += 14) dots += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#ffcf3f"/>';
        return svg(person('#f1c27d', '#8b6cff', dots + '<polygon points="100,0 106,10 118,12 109,20 111,32 100,26 89,32 91,20 82,12 94,10" fill="#ffcf3f" stroke="#1e2430" stroke-width="2"/>'));
      })] }
  };

  var seen = {}; // kinds shown since page load
  M.pickKind = function () {
    var keys = Object.keys(M.kinds), fresh = keys.filter(function (k) { return !seen[k]; });
    var k = BT.pick(fresh.length ? fresh : keys);
    seen[k] = true;
    return k;
  };
  M.saveAccent = function (jobId, color) {
    if (!jobId) return;
    var e = BT.state.jobs[jobId] || (BT.state.jobs[jobId] = { times: 0, level: 1, lastPlayed: null });
    e.accent = color;
    BT.save();
  };

  M.build = function (container, ctx) {
    ctx = ctx || {};
    return new Promise(function (resolve) {
      var job = ctx.job || {}, kindId = M.pickKind(), kind = M.kinds[kindId];
      var start = performance.now(), hints = 0, settled = false, chosen = null;
      container.innerHTML = '';

      var hintBtn = BT.el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint' });
      var pickBtn = BT.el('button', { class: 'btn gold', type: 'button', text: 'Pick this one', disabled: 'disabled' });
      var grid = BT.el('div', { class: 'options' });
      var cards = kind.options.map(function (opt) {
        var card = BT.el('button', { class: 'option design-card', type: 'button', data: { label: opt.label, tag: opt.tag },
          style: { padding: '8px 10px 10px', display: 'grid', gap: '6px', justifyItems: 'stretch' } }, [
          BT.el('div', { html: opt.svg(job) }),
          BT.el('div', { text: opt.label }),
          BT.el('div', { class: 'tag muted', text: opt.tag, style: { fontSize: '.85rem', display: 'none' } })
        ]);
        card.addEventListener('click', function () { select(opt, card); });
        grid.appendChild(card);
        return card;
      });
      container.appendChild(BT.el('div', { class: 'stack' }, [
        BT.el('div', { class: 'screen-head' }, [BT.el('span', { class: 'pill sky', text: 'Designer · ' + (job.title || 'the shop') }), hintBtn]),
        BT.el('div', { class: 'question', text: kind.title }),
        grid,
        BT.el('div', { class: 'btn-row' }, pickBtn)
      ]));

      function select(opt, card) {
        if (settled) return;
        chosen = opt;
        cards.forEach(function (c) { c.classList.remove('right'); c.style.outline = ''; });
        card.classList.add('right');
        card.style.outline = '4px solid ' + opt.color;
        pickBtn.disabled = false;
        pickBtn.textContent = 'Pick ' + opt.label;
        if (BT.sfx && BT.sfx.click) BT.sfx.click();
      }
      function confirm() {
        if (settled || !chosen) return false;
        settled = true;
        cards.forEach(function (c) { c.disabled = true; });
        pickBtn.disabled = true; hintBtn.disabled = true;
        M.saveAccent(job.id, chosen.color);
        if (BT.sfx && BT.sfx.good) BT.sfx.good();
        if (BT.test.roundHooks && BT.test.roundHooks.subject === 'design') BT.test.roundHooks = null;
        resolve({ correct: null, ms: Math.round(performance.now() - start), hints: hints, retry: false,
          answer: chosen.label + ' (' + chosen.tag + ')', skipped: false });
        return true;
      }
      pickBtn.addEventListener('click', confirm);
      hintBtn.addEventListener('click', function () {
        if (settled) return;
        hints++;
        if (typeof ctx.onHint === 'function') ctx.onHint();
        cards.forEach(function (c) { c.querySelector('.tag').style.display = ''; });
        BT.toast('No wrong answers here. Which one fits a ' + (job.title || 'shop').toLowerCase() + ' in ' + (job.city || 'your town') + '?', 'info');
        hintBtn.disabled = true;
      });

      BT.test.roundHooks = { subject: 'design', currentAnswer: function () { return kind.options[0].label; }, answer: function (label) {
        var want = label == null ? kind.options[0].label : String(label).replace(/ \((bold|calm|classic|wild)\)$/, '');
        var i = kind.options.map(function (o) { return o.label; }).indexOf(want);
        if (i < 0) return false;
        select(kind.options[i], cards[i]);
        return confirm();
      } };
      M.current = { kind: kindId, options: kind.options, settled: function () { return settled; }, hint: function () { hintBtn.click(); } };
    });
  };

  BT.registerRound('design', { title: 'Design Studio', icon: '🎨', build: M.build });

  BT.registerChecks('design', [
    { name: 'five kinds, four options each with distinct labels, all four tags, a color and an svg', fn: function () {
      var ids = ['sign', 'colors', 'layout', 'menu', 'uniform'];
      ids.forEach(function (k) {
        var kind = M.kinds[k];
        BT.test.assert(kind && kind.title && kind.options.length === 4, 'kind ' + k);
        var labels = {}, tags = {};
        kind.options.forEach(function (o) {
          labels[o.label] = 1; tags[o.tag] = 1;
          BT.test.assert(M.TAGS.indexOf(o.tag) >= 0, 'bad tag ' + o.tag);
          BT.test.assert(/^#[0-9a-f]{6}$/i.test(o.color), 'bad color ' + o.color);
          var s = o.svg({ title: 'Bakery Helper', city: 'Austin', tasks: ['Weigh flour', 'Price the cupcakes', 'Open the shop'] });
          BT.test.assert(s.indexOf('<svg') === 0 && s.indexOf('<script') < 0, 'svg for ' + o.label);
        });
        BT.test.assert(Object.keys(labels).length === 4 && Object.keys(tags).length === 4, 'labels/tags in ' + k);
      });
      return Object.keys(M.kinds).length === 5;
    } },
    { name: 'svg text is escaped', fn: function () {
      return M.kinds.sign.options[0].svg({ city: '<b>', title: 'x' }).indexOf('<b>') < 0;
    } },
    { name: 'live round: 4 cards, pick gated by a selection, hint reveals tags, answer() saves the accent and resolves correct:null', fn: function () {
      var keep = BT.state.jobs['design-check-job'], hints = 0, result = null;
      delete BT.state.jobs['design-check-job'];
      var box = BT.el('div');
      document.body.appendChild(box);
      M.build(box, { level: 1, job: { id: 'design-check-job', title: 'Bakery Helper', city: 'Austin', tasks: ['a', 'b', 'c'] }, onHint: function () { hints++; } })
        .then(function (r) { result = r; });
      var cards = box.querySelectorAll('.option'), pick = Array.prototype.filter.call(box.querySelectorAll('.btn'), function (b) { return /^Pick/.test(b.textContent); })[0];
      BT.test.assert(cards.length === 4 && cards[0].querySelector('svg') && pick && pick.disabled, 'render');
      BT.test.assert(BT.test.roundHooks && BT.test.roundHooks.subject === 'design', 'hooks');
      M.current.hint();
      BT.test.assert(hints === 1 && cards[0].querySelector('.tag').style.display === '', 'hint shows tags');
      BT.test.assert(BT.test.roundHooks.answer('Not an option') === false && !M.current.settled(), 'unknown label');
      var want = M.current.options[1];
      BT.test.assert(BT.test.roundHooks.answer(want.label + ' (' + want.tag + ')') === true && M.current.settled(), 'confirm');
      BT.test.assert(BT.state.jobs['design-check-job'].accent === want.color && BT.state.jobs['design-check-job'].level === 1, 'accent saved');
      if (keep) BT.state.jobs['design-check-job'] = keep; else delete BT.state.jobs['design-check-job'];
      BT.save();
      box.remove();
      return result === null && BT.test.roundHooks === null;
    } }
  ]);
})();
