// BT.rounds.reading: the reading round. Passage in a scrollable panel, 3 questions one at a time,
// correct when 2 of 3 are right on the first try, answer logged as "n/3". Hint highlights the sentence
// that holds the answer. Data: BT.data.passages (js/data/passages.js).
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var R = BT.rounds.reading = BT.rounds.reading || {};
  // ids shown lately, kept in the save (unknown keys survive BT.load) so a passage does not come back for days
  function recentIds() { return BT.state.seenPassages = Array.isArray(BT.state.seenPassages) ? BT.state.seenPassages : []; }

  var css = document.createElement('style');
  css.textContent =
    '.reading{display:flex;flex-direction:column;gap:12px;flex:1;min-height:0;height:100%}' +
    '.rd-passage{position:relative;flex:1 1 45%;font-size:1.15rem;line-height:1.55;user-select:none;-webkit-user-select:none}' +
    '.rd-passage h3{margin-bottom:.3em}.rd-text{margin:0}' +
    '.rd-s{border-radius:6px;padding:1px 2px;transition:background .25s}' +
    '.rd-s.hl{background:var(--gold);box-shadow:0 0 0 3px var(--gold)}' +
    '.rd-side{display:flex;flex-direction:column;gap:10px;flex:1 1 55%;min-height:0}' +
    '.rd-prog{text-align:center;font-weight:700}.rd-q{font-size:1.3rem;padding:4px}' +
    '.rd-opts .option{font-size:1.1rem;min-height:64px}' +
    '@media (orientation:landscape){.reading{flex-direction:row}.rd-passage,.rd-side{flex:1 1 50%;max-height:100%}}';
  document.head.appendChild(css);

  // Passage tags (js/data/passages.js) that fit a job kind whose name differs from the tag.
  var KIND_TAGS = { farmmarket: ['market', 'farm'], museum: ['guide'], robotlab: ['robot'], airline: ['pilot'],
    gamestudio: ['game'], cityhall: ['mayor'], movies: ['movie'], stocks: ['stock'], restaurant: ['chef'] };
  function tagsFor(kind) { return [kind].concat(KIND_TAGS[kind] || []); }
  R.fits = function (p, kind) {
    var tags = tagsFor(kind);
    return (p.kinds || []).some(function (t) { return tags.indexOf(t) >= 0; });
  };

  // Pick a passage at this level, avoiding recent ones, preferring one that fits the job kind.
  R.pick = function (level, kind) {
    level = Math.max(1, Math.min(5, level | 0 || 1));
    var all = BT.data.passages;
    var pool = all.filter(function (p) { return p.level === level; });
    if (!pool.length) pool = all.slice();
    var recent = recentIds();
    var fresh = pool.filter(function (p) { return recent.indexOf(p.id) < 0; });
    if (!fresh.length) { // every passage at this level was shown lately: take the ones shown longest ago
      var oldest = Math.min.apply(null, pool.map(function (p) { return recent.indexOf(p.id); }));
      fresh = pool.filter(function (p) { return recent.indexOf(p.id) === oldest; });
    }
    pool = fresh;
    var themed = kind ? pool.filter(function (p) { return R.fits(p, kind); }) : [];
    var p = BT.pick(themed.length ? themed : pool);
    var at = recent.indexOf(p.id);
    if (at >= 0) recent.splice(at, 1); // move to the newest end, so the oldest entry is always a different id
    recent.push(p.id);
    if (recent.length > 20) recent.shift();
    BT.save();
    return p;
  };

  R.build = function (container, ctx) {
    ctx = ctx || {};
    return new Promise(function (resolve) {
      var passage = R.pick(ctx.level, ctx.job && ctx.job.kind);
      var qs = passage.qs.map(function (q) {
        return Object.assign({}, q, { order: BT.shuffle([0, 1, 2, 3]) });
      });
      var qi = 0, right = 0, fixed = 0, misses = 0, hints = 0, attempt = 0, busy = false, settled = false;
      var t0 = performance.now();

      container.innerHTML = '';
      var sents = passage.text.map(function (s, i) { return BT.el('span', { class: 'rd-s', data: { i: i }, text: s + ' ' }); });
      var panel = BT.el('div', { class: 'panel rd-passage' }, [BT.el('h3', { text: passage.title }), BT.el('p', { class: 'rd-text' }, sents)]);
      var prog = BT.el('div', { class: 'rd-prog muted' });
      var qEl = BT.el('div', { class: 'question rd-q' });
      var opts = BT.el('div', { class: 'options rd-opts' });
      var hintBtn = BT.el('button', { class: 'btn btn-sm sky', type: 'button', text: 'Hint', onpointerup: onHint });
      var side = BT.el('div', { class: 'rd-side' }, [prog, qEl, opts, BT.el('div', { class: 'btn-row' }, [hintBtn])]);
      container.appendChild(BT.el('div', { class: 'reading' }, [panel, side]));

      function clearHl() { sents.forEach(function (s) { s.classList.remove('hl'); }); }
      function highlight(i) {
        clearHl();
        var s = sents[i];
        if (!s) return;
        s.classList.add('hl');
        panel.scrollTop = Math.max(0, s.offsetTop - panel.clientHeight / 2);
      }
      function disableOpts() { opts.querySelectorAll('.option').forEach(function (b) { b.disabled = true; }); }
      function explain(text) {
        return Promise.resolve(ctx.explain ? ctx.explain(text) : BT.toast(text, 'info'));
      }
      function onHint() {
        if (busy || settled || hintBtn.disabled) return;
        hints++;
        hintBtn.disabled = true;
        if (ctx.onHint) ctx.onHint();
        highlight(qs[qi].hint);
        BT.toast('The glowing sentence holds the answer', 'info');
      }
      function render() {
        var q = qs[qi];
        attempt = 0; busy = false;
        hintBtn.disabled = false;
        clearHl();
        prog.textContent = 'Question ' + (qi + 1) + ' of 3';
        qEl.textContent = q.q;
        opts.innerHTML = '';
        q.order.forEach(function (oi) {
          var b = BT.el('button', { class: 'option', type: 'button', text: q.options[oi], data: { i: oi } });
          b.addEventListener('pointerup', function () { answer(oi, b); });
          opts.appendChild(b);
        });
      }
      function next() {
        qi++;
        if (qi < qs.length) render(); else finish();
      }
      function finish() {
        if (settled) return;
        settled = true;
        BT.test.currentAnswer = null; BT.test.answer = null; // session.js keeps the delegators; a stale hook must not outlive the round
        // right = first-try answers, fixed = answered right on the one retry; a retry-only pass is retry:true (half pay)
        var correct = right + fixed >= 2;
        resolve({ correct: correct, ms: Math.round(performance.now() - t0), hints: hints, retry: correct && right < 2,
          answer: (right + fixed) + '/3' + (fixed ? ' (' + fixed + ' on retry)' : ''), skipped: false });
      }
      function answer(oi, btn) {
        if (busy || settled || btn.disabled) return false;
        var q = qs[qi];
        if (oi === q.correct) {
          btn.classList.add('right');
          disableOpts();
          if (attempt === 0) right++; else fixed++;
          if (BT.sfx && BT.sfx.good) BT.sfx.good();
          busy = true;
          BT.wait(650).then(next);
          return true;
        }
        btn.classList.add('wrong');
        btn.disabled = true;
        if (BT.sfx && BT.sfx.bad) BT.sfx.bad();
        if (attempt === 0) { // first miss: here's why, then one retry
          attempt = 1; misses++; busy = true;
          highlight(q.hint);
          explain(q.why).then(function () { busy = false; });
        } else { // second miss: show the answer and move on
          disableOpts();
          var c = opts.querySelector('.option[data-i="' + q.correct + '"]');
          if (c) c.classList.add('right');
          busy = true;
          BT.wait(900).then(next);
        }
        return true;
      }

      R.current = { passage: passage, qs: qs };
      BT.test.currentAnswer = function () { return settled ? undefined : qs[qi].options[qs[qi].correct]; };
      BT.test.answer = function (label) {
        var b = Array.prototype.find.call(opts.querySelectorAll('.option'), function (x) { return x.textContent === label; });
        return !!b && answer(+b.dataset.i, b); // false when the tap was ignored (busy, settled or disabled)
      };
      render();
    });
  };

  BT.registerRound('reading', { title: 'Reading', icon: '📖', build: R.build });

  BT.registerChecks('reading', [
    { name: 'registered with a build function', fn: function () {
      return !!(BT.registry.rounds.reading && typeof BT.registry.rounds.reading.build === 'function');
    } },
    { name: 'pick returns a passage of the asked level and avoids repeats', fn: function () {
      var ok = [1, 2, 3, 4, 5].every(function (l) { return R.pick(l).level === l; });
      var keep = BT.state.seenPassages;
      BT.state.seenPassages = [];
      var n = BT.data.passages.filter(function (p) { return p.level === 1; }).length, ids = [];
      for (var i = 0; i < n * 2; i++) ids.push(R.pick(1, 'bakery').id);
      var noRepeat = ids.every(function (id, i) { return i === 0 || id !== ids[i - 1]; });
      var allSeen = new Set(ids.slice(0, n)).size === n; // the first lap shows every level-1 passage once
      BT.state.seenPassages = keep; BT.save();
      return ok && noRepeat && allSeen && R.pick(9).level === 5 && R.pick(0).level === 1;
    } },
    { name: 'every job kind has at least one themed passage', fn: function () {
      var kinds = {}; BT.jobs.data.forEach(function (j) { kinds[j.kind] = 1; });
      return Object.keys(kinds).every(function (k) { return BT.data.passages.some(function (p) { return R.fits(p, k); }); });
    } },
    { name: 'build renders the passage, 4 options and a Hint; test hooks answer; 2 of 3 is the bar', fn: function () {
      var box = document.createElement('div');
      var hinted = 0, explained = 0;
      R.build(box, { level: 2, job: { kind: 'vet' }, onHint: function () { hinted++; }, explain: function () { explained++; return Promise.resolve(); } });
      var spans = box.querySelectorAll('.rd-s').length === R.current.passage.text.length;
      var four = box.querySelectorAll('.option').length === 4;
      var hintBtn = Array.prototype.find.call(box.querySelectorAll('button'), function (b) { return b.textContent === 'Hint'; });
      var label = BT.test.currentAnswer();
      var inOpts = Array.prototype.some.call(box.querySelectorAll('.option'), function (b) { return b.textContent === label; });
      var wrongBtn = Array.prototype.find.call(box.querySelectorAll('.option'), function (b) { return b.textContent !== label; });
      var miss = BT.test.answer(wrongBtn.textContent) && wrongBtn.classList.contains('wrong') && box.querySelector('.rd-s.hl') && explained === 1;
      // retry is allowed once the explanation resolves; before that, taps are ignored and answer() says so
      var ignored = BT.test.answer(label) === false && !box.querySelector('.option.right');
      BT.test.answer = null; BT.test.currentAnswer = null;
      return spans && four && !!hintBtn && inOpts && !!miss && ignored;
    } }
  ]);
})();
