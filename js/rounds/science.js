// BT.rounds.science: the science round. Multiple choice from BT.data.science with a small
// inline SVG figure where it helps. Hint removes one wrong option. Registers with BT.registerRound.
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var recent = []; // ids shown this session, so questions do not repeat soon

  // ---------- figures: tiny SVGs keyed by item.fig ----------
  var W = '<svg viewBox="0 0 200 110" width="100%" height="100%" aria-hidden="true" style="display:block">';
  var E = '</svg>';
  var FIG = {
    plant: W + '<rect x="0" y="80" width="200" height="30" fill="#8b5a2b"/>' +
      '<path d="M100 80 V30" stroke="#2e8b3a" stroke-width="6" fill="none"/>' +
      '<path d="M100 60 C70 60 60 40 62 36 C80 36 98 48 100 60Z" fill="#5fcf5a"/>' +
      '<path d="M100 48 C130 48 140 28 138 24 C120 24 102 36 100 48Z" fill="#5fcf5a"/>' +
      '<circle cx="100" cy="24" r="12" fill="#ffcf3f"/><circle cx="100" cy="24" r="5" fill="#ff6b6b"/>' +
      '<path d="M100 80 l-20 20 M100 80 l18 22 M100 80 v24" stroke="#f0d9a8" stroke-width="3" fill="none"/>' +
      '<circle cx="30" cy="20" r="12" fill="#ffcf3f"/>' + E,
    cell: W + '<ellipse cx="100" cy="55" rx="90" ry="48" fill="#d7f5c8" stroke="#2e8b3a" stroke-width="5"/>' +
      '<circle cx="100" cy="55" r="20" fill="#8b6cff"/><circle cx="100" cy="55" r="7" fill="#5a3bd6"/>' +
      '<ellipse cx="45" cy="45" rx="14" ry="8" fill="#ff6b6b"/><ellipse cx="150" cy="70" rx="14" ry="8" fill="#ff6b6b"/>' +
      '<ellipse cx="60" cy="75" rx="12" ry="7" fill="#5fcf5a"/><ellipse cx="140" cy="38" rx="12" ry="7" fill="#5fcf5a"/>' + E,
    layers: W + '<circle cx="100" cy="55" r="52" fill="#8b5a2b"/><circle cx="100" cy="55" r="44" fill="#ff8c42"/>' +
      '<circle cx="100" cy="55" r="28" fill="#ffcf3f"/><circle cx="100" cy="55" r="14" fill="#fff3b0"/>' +
      '<path d="M100 3 A52 52 0 0 1 152 55 L100 55Z" fill="#6ec6ff" opacity=".35"/>' + E,
    magnet: W + '<path d="M40 20 h40 v40 a20 20 0 0 0 40 0 v-40 h40 v40 a60 60 0 0 1 -120 0z" fill="#ff6b6b" stroke="#1e2430" stroke-width="4"/>' +
      '<rect x="40" y="20" width="40" height="22" fill="#6ec6ff" stroke="#1e2430" stroke-width="4"/>' +
      '<rect x="120" y="20" width="40" height="22" fill="#ff6b6b" stroke="#1e2430" stroke-width="4"/>' +
      '<text x="60" y="38" font-size="16" font-weight="700" text-anchor="middle" fill="#1e2430">N</text>' +
      '<text x="140" y="38" font-size="16" font-weight="700" text-anchor="middle" fill="#1e2430">S</text>' + E,
    circuit: W + '<rect x="30" y="20" width="140" height="70" rx="6" fill="none" stroke="#1e2430" stroke-width="5"/>' +
      '<rect x="85" y="10" width="30" height="20" fill="#5fcf5a" stroke="#1e2430" stroke-width="3"/>' +
      '<rect x="20" y="42" width="20" height="26" fill="#ffcf3f" stroke="#1e2430" stroke-width="3"/>' +
      '<circle cx="170" cy="55" r="16" fill="#fff3b0" stroke="#1e2430" stroke-width="3"/>' +
      '<path d="M163 55 l7 -7 7 7" stroke="#ff8c42" stroke-width="3" fill="none"/>' + E,
    thermo: W + '<rect x="88" y="8" width="24" height="70" rx="12" fill="#fff8e7" stroke="#1e2430" stroke-width="4"/>' +
      '<circle cx="100" cy="88" r="16" fill="#ff6b6b" stroke="#1e2430" stroke-width="4"/>' +
      '<rect x="95" y="40" width="10" height="42" fill="#ff6b6b"/>' +
      '<path d="M116 20 h10 M116 34 h10 M116 48 h10 M116 62 h10" stroke="#1e2430" stroke-width="3"/>' + E,
    watercycle: W + '<rect x="0" y="80" width="200" height="30" fill="#3aa0e8"/><circle cx="25" cy="22" r="14" fill="#ffcf3f"/>' +
      '<path d="M40 78 q0 -30 20 -40" stroke="#6ec6ff" stroke-width="4" fill="none" stroke-dasharray="6 5"/>' +
      '<ellipse cx="110" cy="30" rx="34" ry="14" fill="#fff"/><circle cx="90" cy="26" r="14" fill="#fff"/><circle cx="125" cy="22" r="16" fill="#fff"/>' +
      '<path d="M150 48 v22 M165 44 v22 M135 52 v22" stroke="#3aa0e8" stroke-width="4" stroke-linecap="round"/>' + E,
    solar: W + '<circle cx="22" cy="55" r="20" fill="#ffcf3f"/>' +
      '<circle cx="58" cy="55" r="4" fill="#8d99a6"/><circle cx="74" cy="55" r="6" fill="#ffb347"/><circle cx="92" cy="55" r="6" fill="#3aa0e8"/>' +
      '<circle cx="109" cy="55" r="5" fill="#ff6b6b"/><circle cx="134" cy="55" r="13" fill="#e0a86b"/><circle cx="163" cy="55" r="10" fill="#f0d9a8"/>' +
      '<ellipse cx="163" cy="55" rx="18" ry="4" fill="none" stroke="#c9b48a" stroke-width="2"/>' +
      '<circle cx="183" cy="55" r="6" fill="#8fd3ff"/><circle cx="195" cy="55" r="6" fill="#3f5fd6"/>' + E,
    moon: W + '<rect width="200" height="110" fill="#1e2430" rx="10"/>' +
      '<circle cx="35" cy="55" r="18" fill="#444c5c"/><path d="M35 37 a18 18 0 0 1 0 36z" fill="#fff3b0"/>' +
      '<circle cx="80" cy="55" r="18" fill="#fff3b0"/><circle cx="125" cy="55" r="18" fill="#444c5c"/>' +
      '<path d="M125 37 a18 18 0 0 0 0 36z" fill="#fff3b0"/><circle cx="170" cy="55" r="18" fill="#444c5c"/>' +
      '<path d="M170 37 a18 18 0 0 0 0 36 a9 18 0 0 1 0 -36z" fill="#fff3b0"/>' + E,
    heart: W + '<path d="M100 95 C40 60 40 20 70 18 C85 17 95 28 100 36 C105 28 115 17 130 18 C160 20 160 60 100 95Z" fill="#ff6b6b" stroke="#b23a3a" stroke-width="4"/>' +
      '<path d="M90 50 h10 l6 -16 8 32 6 -16 h12" stroke="#fff8e7" stroke-width="4" fill="none" stroke-linejoin="round"/>' + E,
    ramp: W + '<rect x="0" y="92" width="200" height="18" fill="#5fcf5a"/>' +
      '<polygon points="20,92 180,92 180,30" fill="#8b5a2b" stroke="#1e2430" stroke-width="3"/>' +
      '<rect x="80" y="44" width="26" height="26" fill="#ffcf3f" stroke="#1e2430" stroke-width="3" transform="rotate(-21 93 57)"/>' +
      '<path d="M40 70 l30 -12" stroke="#ff6b6b" stroke-width="4" marker-end="url(#a)"/>' + E,
    lever: W + '<rect x="0" y="92" width="200" height="18" fill="#5fcf5a"/>' +
      '<polygon points="118,92 142,92 130,66" fill="#8d99a6" stroke="#1e2430" stroke-width="3"/>' +
      '<rect x="20" y="52" width="160" height="10" fill="#c98a4b" stroke="#1e2430" stroke-width="3" transform="rotate(-10 130 66)"/>' +
      '<rect x="150" y="32" width="26" height="24" fill="#8d99a6" stroke="#1e2430" stroke-width="3" transform="rotate(-10 130 66)"/>' +
      '<path d="M40 30 v22" stroke="#ff6b6b" stroke-width="5"/><path d="M32 42 l8 12 8 -12" stroke="#ff6b6b" stroke-width="5" fill="none"/>' + E,
    pulley: W + '<rect x="90" y="6" width="20" height="10" fill="#8d99a6"/><circle cx="100" cy="30" r="16" fill="#ffcf3f" stroke="#1e2430" stroke-width="4"/>' +
      '<path d="M84 30 V95 M116 30 V70" stroke="#1e2430" stroke-width="3"/><rect x="104" y="70" width="24" height="24" fill="#8b5a2b" stroke="#1e2430" stroke-width="3"/>' +
      '<path d="M84 95 l-6 -10 M84 95 l6 -10" stroke="#ff6b6b" stroke-width="4" fill="none"/>' + E,
    states: W + '<rect x="12" y="20" width="50" height="70" rx="6" fill="#fff8e7" stroke="#1e2430" stroke-width="3"/>' +
      '<rect x="75" y="20" width="50" height="70" rx="6" fill="#fff8e7" stroke="#1e2430" stroke-width="3"/>' +
      '<rect x="138" y="20" width="50" height="70" rx="6" fill="#fff8e7" stroke="#1e2430" stroke-width="3"/>' +
      '<g fill="#3aa0e8">' + (function () {
        var s = '';
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) s += '<circle cx="' + (22 + c * 10) + '" cy="' + (36 + r * 14) + '" r="4"/>';
        var liq = [[82, 80], [93, 76], [104, 82], [115, 78], [86, 66], [98, 64], [110, 68], [92, 54], [106, 52]];
        liq.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>'; });
        var gas = [[146, 30], [178, 42], [160, 60], [150, 80], [180, 76], [168, 32]];
        gas.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>'; });
        return s;
      })() + '</g>' +
      '<text x="37" y="104" font-size="11" text-anchor="middle" fill="#1e2430" font-weight="700">solid</text>' +
      '<text x="100" y="104" font-size="11" text-anchor="middle" fill="#1e2430" font-weight="700">liquid</text>' +
      '<text x="163" y="104" font-size="11" text-anchor="middle" fill="#1e2430" font-weight="700">gas</text>' + E,
    bread: W + '<path d="M30 90 V55 a35 35 0 0 1 35 -35 h70 a35 35 0 0 1 35 35 V90z" fill="#e0a86b" stroke="#8b5a2b" stroke-width="4"/>' +
      '<path d="M60 28 q10 12 20 0 M100 24 q10 12 20 0 M140 28 q10 12 20 0" stroke="#8b5a2b" stroke-width="3" fill="none"/>' +
      '<circle cx="70" cy="62" r="4" fill="#fff8e7"/><circle cx="110" cy="70" r="5" fill="#fff8e7"/><circle cx="145" cy="58" r="4" fill="#fff8e7"/>' + E,
    chain: W + '<rect x="0" y="88" width="200" height="22" fill="#5fcf5a"/>' +
      '<path d="M20 88 v-18 M28 88 v-24 M36 88 v-16" stroke="#2e8b3a" stroke-width="4"/>' +
      '<path d="M50 70 h20" stroke="#1e2430" stroke-width="3" marker-end="url(#a)"/>' +
      '<ellipse cx="100" cy="72" rx="20" ry="14" fill="#c9b48a"/><circle cx="118" cy="62" r="9" fill="#c9b48a"/><rect x="118" y="44" width="5" height="16" rx="2" fill="#c9b48a"/>' +
      '<path d="M130 70 h20" stroke="#1e2430" stroke-width="3"/>' +
      '<ellipse cx="172" cy="70" rx="22" ry="14" fill="#ff8c42"/><circle cx="190" cy="58" r="10" fill="#ff8c42"/><polygon points="184,50 188,40 192,50" fill="#ff8c42"/>' +
      '<polygon points="196,50 200,40 200,50" fill="#ff8c42"/><circle cx="22" cy="20" r="12" fill="#ffcf3f"/>' + E
  };
  // shortcut: a shared arrow marker is not defined, so marker-end on ramp/chain is ignored by the browser (harmless); add <defs> if arrows are wanted

  var TOPIC_LABEL = { life: 'Life', earth: 'Earth', physical: 'Physical', weather: 'Weather', space: 'Space', body: 'Human body',
    machines: 'Simple machines', matter: 'Matter', food: 'Food science', animals: 'Animal care', ecosystems: 'Ecosystems' };

  function pool() { return BT.data && BT.data.science || []; }

  // Pick an item at the level, widening to neighbouring levels if that level runs dry. Avoids recent ids.
  function pickItem(level) {
    var all = pool();
    for (var spread = 0; spread <= 4; spread++) {
      var cands = all.filter(function (it) { return Math.abs(it.lvl - level) <= spread && recent.indexOf(it.id) < 0; });
      if (cands.length) return BT.pick(cands);
    }
    recent.length = 0;
    return BT.pick(all);
  }

  function build(container, ctx) {
    ctx = ctx || {};
    var item = pickItem(ctx.level || 1);
    recent.push(item.id);
    if (recent.length > 40) recent.shift();
    var correct = item.opts[item.a];
    var order = BT.shuffle(item.opts);
    var started = performance.now();
    var hints = 0, missed = false, settled = false;
    var explain = typeof ctx.explain === 'function' ? ctx.explain : function (text) {
      why.textContent = text; why.style.display = 'block';
      return Promise.resolve();
    };

    return new Promise(function (resolve) {
      function finish(result) {
        if (settled) return;
        settled = true;
        buttons.forEach(function (b) { b.disabled = true; });
        if (BT.test.roundHooks === hooks) BT.test.roundHooks = null;
        if (typeof ctx.done === 'function') ctx.done(result);
        resolve(result);
      }
      function currentAnswer() { return correct; }
      function answer(label) {
        var b = buttons.filter(function (x) { return x.textContent === label && !x.disabled; })[0];
        if (b) b.dispatchEvent(new Event('click'));
        return !!b;
      }
      // Shared convention: rounds publish hooks here; session.js's BT.test.currentAnswer()/answer() delegate to them.
      var hooks = { subject: 'science', currentAnswer: currentAnswer, answer: answer };
      BT.test.roundHooks = hooks;

      function onTap(btn, label) {
        if (settled || btn.disabled) return;
        var ms = Math.round(performance.now() - started);
        if (label === correct) {
          btn.classList.add('right');
          if (BT.sfx && BT.sfx.good) BT.sfx.good();
          finish({ correct: true, ms: ms, hints: hints, retry: missed, answer: label, skipped: false });
          return;
        }
        btn.classList.add('wrong'); btn.disabled = true;
        if (BT.sfx && BT.sfx.bad) BT.sfx.bad();
        if (!missed) {
          missed = true;
          hintBtn.disabled = true;
          explain(item.why + ' Try once more.').then(function () { hintBtn.disabled = remainingWrong() < 2; });
          return;
        }
        buttons.forEach(function (b) { if (b.textContent === correct) b.classList.add('right'); b.disabled = true; });
        explain(item.why).then(function () {
          finish({ correct: false, ms: ms, hints: hints, retry: false, answer: label, skipped: false });
        });
      }
      function remainingWrong() {
        return buttons.filter(function (b) { return !b.disabled && b.textContent !== correct; }).length;
      }
      function onHint() {
        if (settled) return;
        var wrong = buttons.filter(function (b) { return !b.disabled && b.textContent !== correct; });
        if (wrong.length < 2) return; // always leave her a real choice
        hints++;
        if (typeof ctx.onHint === 'function') ctx.onHint();
        var gone = BT.pick(wrong);
        gone.disabled = true; gone.style.opacity = '.3'; gone.style.textDecoration = 'line-through';
        if (BT.sfx && BT.sfx.click) BT.sfx.click();
        if (remainingWrong() < 2) hintBtn.disabled = true;
        BT.toast('One wrong answer crossed out', 'info');
      }

      var hintBtn = BT.el('button', { class: 'btn btn-sm gold', type: 'button', text: 'Hint', onclick: onHint });
      var buttons = order.map(function (label) {
        var b = BT.el('button', { class: 'option', type: 'button', text: label });
        b.addEventListener('click', function () { onTap(b, label); });
        return b;
      });
      var why = BT.el('div', { class: 'panel', style: { display: 'none', fontSize: '1.1rem', lineHeight: '1.4' } });
      var fig = item.fig && FIG[item.fig]
        ? BT.el('div', { class: 'sci-fig', html: FIG[item.fig], style: { height: '130px', maxWidth: '260px', margin: '0 auto', flex: '0 0 auto' } })
        : null;

      container.innerHTML = '';
      container.appendChild(BT.el('div', { class: 'stack screen-body sci-round' }, [
        BT.el('div', { class: 'row', style: { justifyContent: 'space-between' } }, [
          BT.el('span', { class: 'pill sky', text: '🔬 Science · ' + (TOPIC_LABEL[item.topic] || item.topic) }),
          hintBtn
        ]),
        fig,
        BT.el('div', { class: 'question', text: item.q }),
        BT.el('div', { class: 'options' }, buttons),
        why
      ]));
    });
  }

  BT.rounds.science = { title: 'Science', icon: '🔬', build: build, pickItem: pickItem, figures: FIG };
  BT.registerRound('science', BT.rounds.science);

  // ---------- checks ----------
  function fakeCtx(hintCount) {
    return { level: 2, onHint: function () { hintCount.n++; }, explain: function () { return Promise.resolve(); } };
  }
  BT.registerChecks('science', [
    { name: 'bank has 120+ well-formed items with unique ids', fn: function () {
      var all = pool(), ids = {};
      if (all.length < 120) throw new Error('only ' + all.length + ' items');
      all.forEach(function (it) {
        if (!it.id || ids[it.id]) throw new Error('bad or duplicate id ' + it.id);
        ids[it.id] = 1;
        if (!(it.lvl >= 1 && it.lvl <= 5)) throw new Error(it.id + ' level');
        if (!TOPIC_LABEL[it.topic]) throw new Error(it.id + ' topic ' + it.topic);
        if (typeof it.q !== 'string' || it.q.length < 8) throw new Error(it.id + ' question');
        if (!Array.isArray(it.opts) || it.opts.length !== 4) throw new Error(it.id + ' needs 4 options');
        var seen = {};
        it.opts.forEach(function (o) { if (typeof o !== 'string' || !o || seen[o]) throw new Error(it.id + ' duplicate/empty option'); seen[o] = 1; });
        if (!(it.a >= 0 && it.a < 4)) throw new Error(it.id + ' answer index');
        if (typeof it.why !== 'string' || it.why.length < 20) throw new Error(it.id + ' why');
        if (it.fig && !FIG[it.fig]) throw new Error(it.id + ' unknown fig ' + it.fig);
      });
      return true;
    } },
    { name: 'every level has 12+ items and every topic 8+', fn: function () {
      var byL = {}, byT = {};
      pool().forEach(function (it) { byL[it.lvl] = (byL[it.lvl] || 0) + 1; byT[it.topic] = (byT[it.topic] || 0) + 1; });
      for (var l = 1; l <= 5; l++) if ((byL[l] || 0) < 12) throw new Error('level ' + l + ' has ' + (byL[l] || 0));
      Object.keys(TOPIC_LABEL).forEach(function (t) { if ((byT[t] || 0) < 8) throw new Error('topic ' + t + ' has ' + (byT[t] || 0)); });
      return true;
    } },
    { name: 'pickItem honours level and avoids repeats', fn: function () {
      var keep = recent.slice(); recent.length = 0;
      var seen = {}, ok = true;
      for (var i = 0; i < 20; i++) { var it = pickItem(3); if (seen[it.id]) ok = false; seen[it.id] = 1; recent.push(it.id); if (Math.abs(it.lvl - 3) > 1) ok = false; }
      recent.length = 0; keep.forEach(function (id) { recent.push(id); });
      return ok;
    } },
    { name: 'build renders 4 options, hint crosses out a wrong one, right answer resolves', fn: function () {
      var box = document.createElement('div'), hc = { n: 0 }, result = null;
      var ctx = fakeCtx(hc); ctx.done = function (r) { result = r; };
      build(box, ctx);
      var opts = box.querySelectorAll('.option');
      if (opts.length !== 4) throw new Error('options ' + opts.length);
      var right = BT.test.roundHooks.currentAnswer();
      var labels = Array.prototype.map.call(opts, function (b) { return b.textContent; });
      if (labels.indexOf(right) < 0) throw new Error('currentAnswer not on screen');
      var hint = box.querySelector('.btn');
      hint.dispatchEvent(new Event('click'));
      var live = Array.prototype.filter.call(opts, function (b) { return !b.disabled; });
      if (live.length !== 3 || hc.n !== 1) throw new Error('hint did not remove one wrong option');
      if (live.map(function (b) { return b.textContent; }).indexOf(right) < 0) throw new Error('hint removed the right answer');
      if (!BT.test.roundHooks.answer(right)) throw new Error('answer() found no button');
      if (!result || result.correct !== true || result.hints !== 1 || result.retry !== false) throw new Error('bad result ' + JSON.stringify(result));
      if (BT.test.roundHooks !== null) throw new Error('hooks not cleared after resolve');
      return true;
    } },
    { name: 'wrong then right counts as retry; hint never strands the correct answer', fn: function () {
      var box = document.createElement('div'), hc = { n: 0 }, result = null;
      var ctx = fakeCtx(hc); ctx.done = function (r) { result = r; };
      build(box, ctx);
      var right = BT.test.roundHooks.currentAnswer();
      var wrong = Array.prototype.filter.call(box.querySelectorAll('.option'), function (b) { return b.textContent !== right; });
      wrong[0].dispatchEvent(new Event('click'));
      if (result) throw new Error('resolved on first miss');
      if (!wrong[0].classList.contains('wrong')) throw new Error('miss not marked');
      BT.test.roundHooks.answer(right);
      if (!result || result.correct !== true || result.retry !== true) throw new Error('retry not recorded: ' + JSON.stringify(result));
      return true;
    } }
  ]);
})();
