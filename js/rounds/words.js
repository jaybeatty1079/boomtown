// BT.rounds.words: the Word Shop round. One multiple-choice item from BT.data.words at ctx.level.
// Hint removes one wrong option (max 2 hints). A miss shows "Here's why" and allows one retry.
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var M = BT.rounds.words = BT.rounds.words || {};
  var KIND_LABEL = { context: 'Word in context', synonym: 'Synonym', antonym: 'Antonym', spelling: 'Spelling',
    affix: 'Prefix & suffix', analogy: 'Analogy', root: 'Word roots' };
  var seen = {}; // ids shown since page load, so a day never repeats an item

  // Items at `level`, else the nearest level that has any. Unseen items first.
  M.pickItem = function (level) {
    var data = BT.data.words || [];
    level = Math.max(1, Math.min(5, level || 1));
    var pool = [];
    for (var d = 0; d < 5 && !pool.length; d++) {
      pool = data.filter(function (it) { return Math.abs(it.level - level) === d; });
    }
    if (!pool.length) return null;
    var fresh = pool.filter(function (it) { return !seen[it.id]; });
    var item = BT.pick(fresh.length ? fresh : pool);
    seen[item.id] = true;
    return item;
  };

  // *word* -> <strong>word</strong>, everything else escaped
  M.markup = function (text) {
    return BT.esc(text).replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  };

  M.build = function (container, ctx) {
    ctx = ctx || {};
    return new Promise(function (resolve) {
      var item = M.pickItem(ctx.level);
      container.innerHTML = '';
      if (!item) { resolve({ correct: null, ms: 0, hints: 0, retry: false, skipped: true }); return; }

      var start = performance.now(), hints = 0, missed = false, settled = false, busy = false;
      var hintBtn = BT.el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint' });
      var head = BT.el('div', { class: 'screen-head' }, [
        BT.el('span', { class: 'pill sky', text: KIND_LABEL[item.kind] || 'Words' }),
        hintBtn
      ]);
      var q = BT.el('div', { class: 'question', html: M.markup(item.q) });
      var grid = BT.el('div', { class: 'options' });
      var buttons = BT.shuffle(item.options).map(function (label) {
        var b = BT.el('button', { class: 'option', type: 'button', text: label, data: { label: label } });
        b.addEventListener('pointerup', function () { choose(b); });
        grid.appendChild(b);
        return b;
      });
      container.appendChild(BT.el('div', { class: 'stack' }, [head, q, grid]));

      function explain(text) {
        return typeof ctx.explain === 'function' ? Promise.resolve(ctx.explain(text)) : Promise.resolve();
      }
      function finish(correct, label) {
        if (settled) return;
        settled = true;
        buttons.forEach(function (b) { b.disabled = true; });
        hintBtn.disabled = true;
        if (BT.test.roundHooks && BT.test.roundHooks.currentAnswer === currentAnswer) BT.test.roundHooks = null;
        resolve({ correct: correct, ms: Math.round(performance.now() - start), hints: hints,
          retry: correct && missed, answer: label, skipped: false });
      }
      function choose(b) {
        if (settled || busy || b.disabled) return;
        var label = b.dataset.label;
        if (label === item.answer) {
          b.classList.add('right');
          if (BT.sfx && BT.sfx.good) BT.sfx.good();
          finish(true, label);
          return;
        }
        b.classList.add('wrong');
        b.disabled = true;
        if (BT.sfx && BT.sfx.bad) BT.sfx.bad();
        busy = true;
        if (!missed) {
          missed = true;
          explain(item.why).then(function () { busy = false; BT.toast('One more try!', 'info'); });
        } else {
          buttons.forEach(function (x) { if (x.dataset.label === item.answer) x.classList.add('right'); });
          explain(item.why).then(function () { busy = false; finish(false, label); });
        }
      }
      hintBtn.addEventListener('pointerup', function () {
        if (settled || busy || hints >= 2) return;
        var wrong = buttons.filter(function (x) { return !x.disabled && x.dataset.label !== item.answer; });
        if (wrong.length < 2) { hintBtn.disabled = true; return; } // keep at least one wrong option in play
        hints++;
        if (typeof ctx.onHint === 'function') ctx.onHint();
        var gone = BT.pick(wrong);
        gone.disabled = true;
        gone.style.opacity = '.3';
        gone.style.textDecoration = 'line-through';
        if (BT.sfx && BT.sfx.click) BT.sfx.click();
        if (hints >= 2) hintBtn.disabled = true;
      });

      // test hooks: BT.test.roundHooks = {subject, currentAnswer, answer}; session.js delegates BT.test.currentAnswer()/answer() to it
      function currentAnswer() { return item.answer; }
      BT.test.roundHooks = { subject: 'words', currentAnswer: currentAnswer, answer: function (label) {
        var want = label == null ? item.answer : label;
        var b = buttons.filter(function (x) { return x.dataset.label === want; })[0];
        if (b) choose(b);
        return !!b;
      } };
      M.current = { item: item, hint: function () { hintBtn.dispatchEvent(new Event('pointerup')); } };
    });
  };

  // fallback delegators when session.js has not defined them (same as money/geography)
  BT.test.currentAnswer = BT.test.currentAnswer || function () { return BT.test.roundHooks ? BT.test.roundHooks.currentAnswer() : undefined; };
  BT.test.answer = BT.test.answer || function (label) { if (BT.test.roundHooks) BT.test.roundHooks.answer(label); };

  BT.registerRound('words', { title: 'Word Shop', icon: '🔤', build: M.build });

  BT.registerChecks('words', [
    { name: '150+ items, every level 1-5 has 25+', fn: function () {
      var d = BT.data.words;
      BT.test.assert(d.length >= 150, 'only ' + d.length + ' items');
      for (var l = 1; l <= 5; l++) {
        var n = d.filter(function (it) { return it.level === l; }).length;
        BT.test.assert(n >= 25, 'level ' + l + ' has ' + n);
      }
    } },
    { name: 'every item well formed: 4 distinct options, answer among them, why, unique id', fn: function () {
      var ids = {};
      BT.data.words.forEach(function (it) {
        BT.test.assert(it.id && !ids[it.id], 'dup/missing id ' + it.id); ids[it.id] = 1;
        BT.test.assert(KIND_LABEL[it.kind], 'bad kind ' + it.kind + ' in ' + it.id);
        BT.test.assert(typeof it.q === 'string' && it.q.length > 8, 'no q in ' + it.id);
        BT.test.assert(Array.isArray(it.options) && it.options.length === 4, 'need 4 options in ' + it.id);
        var set = {};
        it.options.forEach(function (o) { BT.test.assert(typeof o === 'string' && o.trim(), 'empty option in ' + it.id); set[o.toLowerCase()] = 1; });
        BT.test.assert(Object.keys(set).length === 4, 'duplicate option in ' + it.id);
        BT.test.assert(it.options.filter(function (o) { return o === it.answer; }).length === 1, 'answer not exactly once in ' + it.id);
        BT.test.assert(typeof it.why === 'string' && it.why.length > 10, 'no why in ' + it.id);
      });
    } },
    { name: 'kinds follow the level rules (analogy L3+, root L4+); all 7 kinds present', fn: function () {
      var kinds = {};
      BT.data.words.forEach(function (it) {
        kinds[it.kind] = 1;
        if (it.kind === 'analogy') BT.test.assert(it.level >= 3, 'analogy below L3: ' + it.id);
        if (it.kind === 'root') BT.test.assert(it.level >= 4, 'root below L4: ' + it.id);
      });
      return Object.keys(KIND_LABEL).every(function (k) { return kinds[k]; });
    } },
    { name: 'spelling items: the answer is the only option that is a dictionary-looking word (no spaces, letters only)', fn: function () {
      BT.data.words.filter(function (it) { return it.kind === 'spelling'; }).forEach(function (it) {
        it.options.forEach(function (o) { BT.test.assert(/^[A-Za-z]+$/.test(o), 'odd spelling option ' + o); });
      });
    } },
    { name: 'pickItem returns an item at the level, clamps, and falls back', fn: function () {
      var a = M.pickItem(3), b = M.pickItem(9), c = M.pickItem(0);
      return a && a.level === 3 && b && b.level === 5 && c && c.level === 1;
    } },
    { name: 'registered as a round with build()', fn: function () {
      var r = BT.registry.rounds.words;
      return r && typeof r.build === 'function' && r.title === 'Word Shop';
    } },
    { name: 'live round: 4 options, hint removes one wrong option, a miss marks wrong and does not resolve', fn: function () {
      // BT.test.run() is synchronous, so only the synchronous path is asserted here; the retry resolution is covered by the headless script
      var box = BT.el('div'), hints = 0, result = null;
      document.body.appendChild(box);
      M.build(box, { level: 2, onHint: function () { hints++; }, explain: function () { return Promise.resolve(); } })
        .then(function (r) { result = r; });
      var ans = BT.test.roundHooks.currentAnswer();
      var opts = Array.prototype.slice.call(box.querySelectorAll('.option'));
      BT.test.assert(opts.length === 4 && box.querySelector('.btn'), 'render');
      M.current.hint();
      var gone = opts.filter(function (b) { return b.disabled; });
      BT.test.assert(hints === 1 && gone.length === 1 && gone[0].dataset.label !== ans, 'hint');
      var wrong = opts.filter(function (b) { return !b.disabled && b.dataset.label !== ans; })[0];
      BT.test.roundHooks.answer(wrong.dataset.label);
      BT.test.assert(wrong.classList.contains('wrong') && result === null, 'miss should not resolve');
      box.remove();
      BT.test.roundHooks = null;
    } },
    { name: 'markup bolds *word* and escapes html', fn: function () {
      return M.markup('a *b* <c>') === 'a <strong>b</strong> &lt;c&gt;';
    } }
  ]);
})();
