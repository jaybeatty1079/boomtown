// BT.session: the work day. start(job) -> six rounds (break offers after rounds 2 and 4, replay offers after 3 and 6)
// -> payday -> BT.bookstop.open(). Rounds come from BT.registry.rounds; a round that throws while building falls back to a quick sum so the day never dead-ends.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;
  var BREAKS = ['blockstack', 'minerush', 'delivery', 'coinrain'];
  var ROUNDS = 6;
  var STOP_MS = 25 * 60 * 1000;
  var S = null;           // the running session
  var stopTimer = null;

  // ---------- styles this module needs (style.css is not ours) ----------
  document.head.appendChild(el('style', { text: [
    '.round-body{position:relative}',
    '.bt-overlay{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(30,36,48,.45);border-radius:16px}',
    '.bt-overlay .card{width:min(100%,520px);text-align:center}',
    '.bt-flash.good .card{background:var(--mint)} .bt-flash.bad .card{background:var(--coral);color:#fff}',
    '.bt-flash .big{font-size:2.4rem;font-weight:700;margin:6px 0 12px}',
    '.bt-offer{flex:1;display:flex;align-items:center;justify-content:center}',
    '.bt-offer .card{width:min(100%,560px);text-align:center}',
    '.bt-icon{font-size:3.2rem;line-height:1}',
    '.bt-breakdown{display:grid;grid-template-columns:1fr auto;gap:6px 18px;font-size:1.15rem;margin:8px 0}',
    '.bt-breakdown .total{font-size:1.6rem;font-weight:700;border-top:3px solid rgba(0,0,0,.15);padding-top:8px;margin-top:4px}',
    '.bt-payday{flex:1;min-height:0;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:center;overflow:auto}',
    '.bt-payday .card{width:min(100%,520px)}',
    '.bt-avatar svg{display:block;margin:0 auto}',
    '.bt-notice{background:var(--gold);border-radius:14px;padding:10px 14px;font-weight:700;margin-top:8px}',
    '.bt-banner{position:fixed;left:50%;bottom:calc(16px + var(--safe-bottom));transform:translateX(-50%);z-index:28;background:var(--ink);color:var(--paper);font-weight:700;padding:14px 24px;border-radius:999px;box-shadow:0 4px 0 rgba(0,0,0,.35);cursor:pointer;max-width:92vw;text-align:center}'
  ].join('\n') }));

  // ---------- pure helpers (checked below) ----------
  function tierOf(life) { // raw thresholds; BT.tier() returns 4 in test mode and cannot show a crossing
    var t = 1;
    for (var i = 1; i < BT.TIERS.length; i++) if (life >= BT.TIERS[i]) t = i + 1;
    return t;
  }
  function jobEntry(id) { return BT.state.jobs[id] || { times: 0, level: 1, lastPlayed: null }; }
  function basePay(job, jobLevel) { return Math.round(job.pay * (1 + 0.25 * (jobLevel - 1))); }
  function hintCost(pay) { return Math.max(1, Math.round(pay * 0.1)); }
  // Break pay is capped at 15% of the day's round pay (SPEC), measured on the day's potential (ROUNDS x pay) and split
  // over the two breaks, so a break is never worth $0 after a bad round and the two together stay at 15%.
  function breakCap(dayPay) { return Math.round(0.15 * dayPay / 2); }
  function roundsLabel(right, graded, total) {
    return 'Rounds (' + right + ' of ' + graded + ' right' + (total > graded ? ', ' + (total - graded) + ' creative' : '') + ')';
  }

  // What a round earns. Right = pay (half if only after a retry), +20% with no hint; wrong or skipped = 0;
  // ungraded = pay on completion. Each hint costs 10% of pay, floored at $0.
  function payFor(res, pay) {
    if (res.skipped || res.correct === false) return { pay: 0, bonus: 0, hintCost: 0 };
    var p = res.correct === true && res.retry ? pay / 2 : pay;
    var cost = Math.min(Math.round(p), (res.hints || 0) * hintCost(pay));
    return { pay: Math.round(p) - cost, bonus: res.hints ? 0 : Math.round(p * 0.2), hintCost: cost };
  }

  function roundCounts() {
    var c = {};
    BT.SUBJECTS.forEach(function (s) { c[s] = 0; });
    BT.state.rounds.forEach(function (r) { if (c[r.subject] != null) c[r.subject]++; });
    return c;
  }
  function lastSessionSubjects() {
    var ss = BT.state.sessions, seen = {};
    if (!ss.length) return seen;
    var last = ss[ss.length - 1];
    BT.state.rounds.forEach(function (r) { if (r.date >= last.start && r.date <= last.end) seen[r.subject] = 1; });
    return seen;
  }
  // Two from the job's focus; the other four favor subjects missing from the previous session, then the fewest logged rounds,
  // ties at random. Six distinct subjects, shuffled (so writing and design appear at most once each).
  function pickSubjects(job) {
    var focus = (job.focus || []).filter(function (s, i, a) { return BT.SUBJECTS.indexOf(s) >= 0 && a.indexOf(s) === i; });
    var chosen = BT.shuffle(focus).slice(0, 2);
    var counts = roundCounts(), seen = lastSessionSubjects();
    var rest = BT.shuffle(BT.SUBJECTS.filter(function (s) { return chosen.indexOf(s) < 0; }));
    rest.sort(function (a, b) { return ((seen[a] ? 1 : 0) - (seen[b] ? 1 : 0)) || (counts[a] - counts[b]); });
    while (chosen.length < ROUNDS) chosen.push(rest.shift());
    return BT.shuffle(chosen);
  }
  function breakIndex() {
    var n = 0;
    BT.state.events.forEach(function (e) { if (e.type === 'break_played' || e.type === 'break_declined') n++; });
    return n % BREAKS.length;
  }
  function normalize(res) {
    res = res && typeof res === 'object' ? res : {};
    return {
      correct: res.correct === true ? true : res.correct === false ? false : null,
      ms: Math.max(0, Math.round(res.ms || 0)), hints: Math.max(0, res.hints | 0),
      retry: !!res.retry, answer: res.answer, skipped: !!res.skipped
    };
  }

  // ---------- fallback round (used only when a registered round throws while building) ----------
  function fallbackRound(subject) {
    return { subject: subject, title: subject, icon: '🧩', build: function (container, ctx) {
      var a = BT.rand(10, 30 + ctx.level * 20), b = BT.rand(5, 20 + ctx.level * 10), ans = a + b;
      var opts = BT.shuffle([ans, ans + 1, ans - 1, ans + 10].map(String));
      var t0 = performance.now(), hints = 0, missed = false, settled = false;
      return new Promise(function (resolve) {
        function finish(correct, label) {
          if (settled) return; settled = true;
          resolve({ correct: correct, ms: Math.round(performance.now() - t0), hints: hints, retry: correct && missed, answer: label });
        }
        var grid = el('div', { class: 'options' });
        var buttons = opts.map(function (o) {
          var btn = el('button', { class: 'option', type: 'button', text: o, onclick: function () { pick(o, btn); } });
          grid.appendChild(btn);
          return btn;
        });
        function pick(o, btn) {
          if (settled) return;
          if (o === String(ans)) { btn.classList.add('right'); finish(true, o); return; }
          btn.classList.add('wrong'); btn.disabled = true;
          if (missed) { finish(false, o); return; }
          missed = true;
          ctx.explain('Add the tens first, then the ones: ' + a + ' + ' + b + ' = ' + ans + '. One more try.');
        }
        container.appendChild(el('div', { class: 'question', text: a + ' + ' + b + ' = ?' }));
        container.appendChild(grid);
        container.appendChild(el('div', { class: 'btn-row' }, el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint', onclick: function () {
          hints++; ctx.onHint();
          BT.toast('First step: ' + a + ' + ' + (b - (b % 10)) + ' = ' + (a + b - (b % 10)), 'info');
        } })));
        BT.test.roundHooks = {
          currentAnswer: function () { return String(ans); },
          answer: function (label) { buttons.forEach(function (btn) { if (btn.textContent === String(label)) btn.click(); }); }
        };
      });
    } };
  }
  function fallbackBreak(id) {
    return { id: id, title: id, icon: '🎮', blurb: '', start: function (container) {
      return new Promise(function (resolve) {
        container.appendChild(el('div', { class: 'bt-offer' }, el('div', { class: 'card stack' }, [
          el('h2', { text: 'This break is taking a nap' }),
          el('button', { class: 'btn gold', type: 'button', text: 'Back to work', onclick: function () { resolve({ score: 0, pay: 0 }); } })
        ])));
      });
    } };
  }

  // ---------- panels ----------
  // "Here's why": a panel over the round; resolves when she taps OK (a tick later in test mode, so autoplay never waits on it).
  // final = no retry follows (the round ends after this), so the button must not promise one.
  function explainPanel(root, text, final) {
    return new Promise(function (resolve) {
      var done = false;
      var ok = el('button', { class: 'btn gold', type: 'button', text: final ? 'Got it' : 'OK, try again', onclick: function () { if (done) return; done = true; box.remove(); resolve(); } });
      var box = el('div', { class: 'bt-overlay bt-explain' }, el('div', { class: 'card stack' }, [
        el('h3', { text: "Here's why" }), el('p', { text: String(text || '') }), ok
      ]));
      root.appendChild(box);
      if (BT.TEST) BT.wait(0).then(function () { ok.click(); });
    });
  }
  function flash(res, earned, subject) {
    var root = BT.screen.el('round');
    var kind = res.correct === true ? 'good' : res.correct === false ? 'bad' : 'done';
    if (kind === 'good' && subject !== 'reading') BT.voice.say(BT.pick(['correct', 'nice', 'gotit', 'brilliant']), { interrupt: true });
    var title = kind === 'good' ? (res.retry ? 'Got it on the retry!' : 'Correct!') : kind === 'bad' ? 'Not this time' : res.skipped ? 'Skipped' : 'Nice work!';
    var next = el('button', { class: 'btn gold', type: 'button', text: 'Next' });
    var box = el('div', { class: 'bt-overlay bt-flash ' + kind }, el('div', { class: 'card' }, [
      el('h2', { text: title }), el('div', { class: 'big', text: earned > 0 ? '+' + BT.fmt(earned) : kind === 'bad' ? '$0' : '' }), next
    ]));
    root.appendChild(box);
    if (earned > 0) { BT.money.add(earned, 'round'); BT.coinFly(box); if (kind === 'good') BT.sfx.good(); }
    else if (kind === 'bad') BT.sfx.bad();
    return new Promise(function (resolve) {
      var done = false;
      function go() { if (done) return; done = true; box.remove(); resolve(); }
      next.addEventListener('click', go);
      BT.wait(2600).then(go);
    });
  }
  function offerCard(root, parts) { // a centered card on a screen; returns the card
    root.innerHTML = '';
    var card = el('div', { class: 'card stack' }, parts);
    root.appendChild(el('div', { class: 'bt-offer' }, card));
    return card;
  }

  // ---------- one round ----------
  function runRound(subject, index, voluntary) {
    var def = BT.registry.rounds[subject] || fallbackRound(subject);
    var level = Math.min(5, Math.max(BT.level.get(subject), S.jobLevel - 1));
    var pay = S.pay;
    var root = BT.screen.el('round');
    root.innerHTML = '';
    var container = el('div', { class: 'screen-body round-body' });
    root.appendChild(el('div', { class: 'screen-head' }, [
      el('div', { class: 'row' }, [
        el('span', { class: 'pill sky', text: (def.icon ? def.icon + ' ' : '') + def.title }),
        el('span', { class: 'pill gold', text: BT.fmt(pay) })
      ]),
      el('div', { class: 'row' }, [
        el('span', { class: 'pill ' + (voluntary ? 'violet' : 'mint'), text: voluntary ? 'Bonus round' : 'Round ' + (index + 1) + ' of ' + ROUNDS }),
        // reads the live .question only: for reading rounds that is the current question, never the passage
        el('button', { class: 'btn btn-sm violet readit', type: 'button', text: '🔊 Read it', 'aria-label': 'Read the question aloud', onclick: function () {
          var q = container.querySelector('.question');
          if (q) BT.voice.read(q.textContent);
        } })
      ])
    ]));
    root.appendChild(container);
    BT.screen.show('round', { subject: subject, job: S.job }); // music.js fades the music out when subject is 'reading'
    if (!voluntary) BT.voice.say('round_' + subject);
    BT.test.roundHooks = null;
    var hints = 0, explains = 0, t0 = performance.now(), settled = false;
    var quiet = subject === 'reading'; // no voice while she reads the passage
    return new Promise(function (resolve) {
      function finish(res) { if (settled) return; settled = true; resolve(res); }
      var ctx = {
        level: level, job: S.job, jobLevel: S.jobLevel, pay: pay,
        onHint: function () {
          hints++;
          BT.log.event('hint', { subject: subject, jobId: S.job.id, cost: hintCost(pay) });
          BT.toast('Hint used: ' + BT.fmt(hintCost(pay)) + ' off this round', 'info');
          if (!quiet) BT.voice.say('hint');
        },
        // rounds explain on both misses and end after the second, so the second panel (or {final:true}) says 'Got it'
        explain: function (text, opts) {
          explains++;
          if (!quiet) BT.voice.say('why', { interrupt: true });
          return explainPanel(container, text, !!(opts && opts.final) || explains > 1);
        },
        done: finish
      };
      var p;
      try { p = def.build(container, ctx); }
      catch (e) { console.error('round ' + subject + ' failed to build', e); container.innerHTML = ''; p = fallbackRound(subject).build(container, ctx); }
      Promise.resolve(p).then(function (r) { if (r) finish(r); }, function (e) { console.error('round ' + subject + ' rejected', e); finish({ correct: null, skipped: true }); });
    }).then(function (raw) {
      BT.test.roundHooks = null;
      var res = normalize(raw);
      res.hints = Math.max(res.hints, hints);
      if (!res.ms) res.ms = Math.round(performance.now() - t0);
      var earned = payFor(res, pay);
      S.roundPay += earned.pay; S.noHintBonus += earned.bonus; S.hintCost += earned.hintCost; S.roundCount++;
      if (typeof res.correct === 'boolean') S.graded++;
      if (res.correct === true) S.right++;
      BT.log.round({ subject: subject, jobId: S.job.id, jobLevel: S.jobLevel, level: level, correct: res.correct, ms: res.ms,
        hints: res.hints, voluntary: !!voluntary, retry: res.retry, answer: res.answer });
      return flash(res, earned.pay + earned.bonus, subject).then(function () { return subject; });
    });
  }

  // ---------- break offer ----------
  function offerBreak() {
    var id = BREAKS[breakIndex()];
    var def = BT.registry.minigames[id] || fallbackBreak(id);
    var root = BT.screen.el('break');
    var cap = breakCap(ROUNDS * S.pay);
    BT.screen.show('break', { id: id });
    BT.voice.say('break');
    return new Promise(function (resolve) {
      offerCard(root, [
        el('h2', { text: 'Break time!' }),
        el('div', { class: 'bt-icon', text: def.icon || '🎮' }),
        el('h3', { text: def.title }),
        el('p', { class: 'muted', text: def.blurb || '' }),
        el('p', { text: 'Earn up to ' + BT.fmt(cap) }),
        el('div', { class: 'btn-row' }, [
          el('button', { class: 'btn btn-big gold', type: 'button', text: 'Play (60 s)', onclick: function () {
            BT.sfx.click();
            root.innerHTML = '';
            var container = el('div', { class: 'screen-body round-body' });
            root.appendChild(container);
            var p;
            try { p = def.start(container, { cap: cap, job: S.job, jobLevel: S.jobLevel, level: BT.level.get('logic') }); }
            catch (e) { console.error('break ' + id + ' failed', e); p = Promise.resolve({ score: 0, pay: 0 }); }
            Promise.resolve(p).then(function (r) {
              r = r || {};
              var pay = Math.max(0, Math.min(cap, Math.round(r.pay || 0)));
              S.breakPay += pay; S.breaks++;
              if (pay > 0) { BT.money.add(pay, 'break'); BT.coinFly(); }
              BT.log.event('break_played', { id: id, score: r.score || 0, pay: pay });
              resolve();
            }, function (e) { console.error('break ' + id + ' rejected', e); BT.log.event('break_played', { id: id, score: 0, pay: 0 }); resolve(); });
          } }),
          el('button', { class: 'btn stone', type: 'button', text: 'Skip to work', onclick: function () {
            BT.sfx.click(); BT.log.event('break_declined', { id: id }); resolve();
          } })
        ])
      ]);
    });
  }

  // ---------- replay offer (every third round) ----------
  function offerReplay(subject, index) {
    var def = BT.registry.rounds[subject] || fallbackRound(subject);
    var bonus = S.pay + Math.round(S.pay * 0.2);
    BT.log.event('replay_offered', { subject: subject, jobId: S.job.id });
    var root = BT.screen.el('round');
    BT.voice.say('onemore');
    return new Promise(function (resolve) {
      offerCard(root, [
        el('div', { class: 'bt-icon', text: def.icon || '⭐' }),
        el('h2', { text: 'One more like this? +' + BT.fmt(bonus) }),
        el('p', { class: 'muted', text: 'An extra ' + def.title + ' round. Totally optional.' }),
        el('div', { class: 'btn-row' }, [
          el('button', { class: 'btn btn-big gold', type: 'button', text: 'One more!', onclick: function () {
            BT.sfx.click(); BT.log.event('replay_taken', { subject: subject, jobId: S.job.id });
            runRound(subject, index, true).then(resolve);
          } }),
          el('button', { class: 'btn stone', type: 'button', text: 'No thanks', onclick: function () {
            BT.sfx.click(); BT.log.event('replay_declined', { subject: subject, jobId: S.job.id }); resolve();
          } })
        ])
      ]);
    });
  }

  // ---------- payday ----------
  function payday() {
    var s = S, job = s.job, now = new Date().toISOString();
    var streakBonus = (BT.state.streak.days || 0) >= 3 ? Math.round(s.roundPay * 0.10) : 0;
    if (streakBonus > 0) BT.money.add(streakBonus, 'streak');
    var total = s.roundPay + s.noHintBonus + streakBonus + s.breakPay;
    var je = jobEntry(job.id), promoted = false;
    je.times++;
    if (je.times > 1 && je.level < 5) { je.level++; promoted = true; }
    je.lastPlayed = now;
    BT.state.jobs[job.id] = je;
    var tierNow = tierOf(BT.state.lifetime), tierSeen = BT.state.tierSeen || 1, newTier = tierNow > tierSeen ? tierNow : 0;
    BT.state.tierSeen = Math.max(tierSeen, tierNow);
    BT.state.sessions.push({ start: s.start, end: now, jobId: job.id, earned: total, rounds: s.roundCount, breaks: s.breaks });
    BT.log.event('session_end', { jobId: job.id, earned: total, rounds: s.roundCount, graded: s.graded, right: s.right, breaks: s.breaks, promoted: promoted, tier: tierNow });
    s.ended = now; s.total = total;

    var root = BT.screen.el('payday');
    root.innerHTML = '';
    function row(label, n, cls) { return [el('div', { class: cls || '', text: label }), el('div', { class: cls || '', text: (n < 0 ? '−' : '') + BT.fmt(Math.abs(n)) })]; }
    var rows = [].concat(
      row(roundsLabel(s.right, s.graded, s.roundCount), s.roundPay + s.hintCost), // gross; the Hints row takes the cost off so the rows add up
      row('No-hint bonus', s.noHintBonus),
      streakBonus ? row('Day streak bonus (' + BT.state.streak.days + ' days)', streakBonus) : [],
      row('Break pay', s.breakPay),
      s.hintCost ? row('Hints', -s.hintCost) : [],
      row('Total', total, 'total')
    );
    var avatar = BT.character && BT.character.svg && BT.state.character ? BT.character.svg(140) : BT.avatarFallback(140);
    var card = el('div', { class: 'card stack center' }, [
      el('div', { class: 'bt-avatar', html: avatar }),
      el('h1', { text: 'Payday!' }),
      el('p', { class: 'muted', text: job.title + ' · ' + job.city + ', ' + job.state }),
      el('div', { class: 'bt-breakdown', style: { textAlign: 'left' } }, rows),
      promoted ? el('div', { class: 'bt-notice', text: '🎉 Promoted! ' + job.title + ' is now level ' + je.level + '. Harder rounds, bigger pay.' }) : null,
      newTier ? el('div', { class: 'bt-notice', text: '🔓 New jobs unlocked! You reached tier ' + newTier + ' with ' + BT.fmt(BT.state.lifetime) + ' earned.' }) : null,
      el('button', { class: 'btn btn-big coral', type: 'button', text: 'Book Stop', onclick: function () {
        BT.sfx.click();
        if (BT.bookstop && typeof BT.bookstop.open === 'function') BT.bookstop.open({ afterPayday: true });
        else BT.screen.show('bookstop');
      } })
    ]);
    root.appendChild(el('div', { class: 'bt-payday' }, card));
    BT.screen.show('payday', { total: total });
    BT.confetti(); BT.sfx.fanfare(); BT.coinFly(card);
    BT.voice.say('payday');
    BT.wait(1200).then(function () { // the notices, after the fanfare: at most one playing and two waiting
      if (streakBonus > 0) BT.voice.say('streak');
      if (promoted) BT.voice.say('promoted');
      if (newTier) BT.voice.say('unlocked');
    });
    BT.save();
  }

  // ---------- the 25-minute soft banner ----------
  function showStoppingBanner() {
    hideBanner();
    var b = el('div', { class: 'bt-banner', id: 'bt-banner', text: 'Good stopping point! (tap to hide)', onclick: hideBanner });
    document.body.appendChild(b);
    BT.voice.say('stopping');
    return b;
  }
  function hideBanner() { var b = document.getElementById('bt-banner'); if (b) b.remove(); }

  // ---------- the day ----------
  function start(job) {
    if (typeof job === 'string') job = (BT.jobs.data || []).filter(function (j) { return j.id === job; })[0];
    if (!job || !job.id) { BT.toast('No job picked', 'bad'); return Promise.resolve(null); }
    var je = jobEntry(job.id);
    S = {
      job: job, jobLevel: je.level || 1, pay: basePay(job, je.level || 1), start: new Date().toISOString(),
      subjects: pickSubjects(job), roundPay: 0, noHintBonus: 0, hintCost: 0, breakPay: 0, roundCount: 0, graded: 0, right: 0, breaks: 0
    };
    BT.session.current = S;
    BT.log.event('session_start', { jobId: job.id, jobLevel: S.jobLevel, subjects: S.subjects.slice() });
    if (!stopTimer) stopTimer = setTimeout(showStoppingBanner, STOP_MS); // once per sitting, so chained jobs cannot push it back

    var chain = Promise.resolve();
    S.subjects.forEach(function (subject, i) {
      chain = chain.then(function () { return runRound(subject, i, false); });
      if (i === 1 || i === 3) chain = chain.then(offerBreak);
      if ((i + 1) % 3 === 0) chain = chain.then(function () { return offerReplay(subject, i); });
    });
    S.done = chain.then(function () { payday(); return S; }, function (e) { console.error('session failed', e); BT.toast('Something broke; heading home', 'bad'); BT.screen.show('home'); return S; });
    return S.done;
  }

  BT.session = {
    start: start,
    get current() { return S; },
    set current(v) { S = v; },
    pickSubjects: pickSubjects, payFor: payFor, basePay: basePay, hintCost: hintCost, breakCap: breakCap, roundsLabel: roundsLabel, tierOf: tierOf,
    fallbackRound: fallbackRound, showStoppingBanner: showStoppingBanner, hideBanner: hideBanner,
    STOP_MS: STOP_MS, BREAKS: BREAKS,
    testJob: { id: 'test-bakery', title: 'Bakery Helper', city: 'Austin', state: 'TX', tier: 1, pay: 20, kind: 'bakery', focus: ['money', 'science'], color: '#ffb347', icon: '🥐' }
  };

  // Test hooks delegate to the active round (rounds set BT.test.roundHooks = {currentAnswer, answer}).
  // A round that assigns BT.test.currentAnswer / BT.test.answer directly is accepted too: the setter stores it as an
  // override until it is assigned null, so the delegators stay in place for the next round either way.
  BT.test.roundHooks = null;
  var over = { currentAnswer: null, answer: null };
  function liveHook(name) { return over[name] || (BT.test.roundHooks && BT.test.roundHooks[name]) || null; }
  var CA = function () { var f = liveHook('currentAnswer'); return f ? f() : undefined; };
  var AN = function (label) {
    var f = liveHook('answer');
    if (!f) return false;
    var r = f(label === undefined ? CA() : label);
    return r === undefined ? true : r;
  };
  [['currentAnswer', CA], ['answer', AN]].forEach(function (pair) {
    Object.defineProperty(BT.test, pair[0], { configurable: true, enumerable: true,
      get: function () { return pair[1]; },
      set: function (v) { if (v !== pair[1]) over[pair[0]] = typeof v === 'function' ? v : null; } });
  });

  BT.registerChecks('session', [
    { name: 'pickSubjects: six distinct, two from focus, writing and design at most once', fn: function () {
      for (var k = 0; k < 20; k++) {
        var job = { id: 'x', focus: ['money', 'science', 'words'] };
        var six = pickSubjects(job), seen = {};
        if (six.length !== 6) return false;
        six.forEach(function (s) { seen[s] = (seen[s] || 0) + 1; });
        if (Object.keys(seen).length !== 6) return false;
        if (six.filter(function (s) { return job.focus.indexOf(s) >= 0; }).length < 2) return false;
      }
      return true;
    } },
    { name: 'pickSubjects covers subjects missing from the previous session', fn: function () {
      var keepS = BT.state.sessions, keepR = BT.state.rounds;
      BT.state.sessions = [{ start: '2020-01-01T00:00:00Z', end: '2020-01-01T01:00:00Z' }];
      BT.state.rounds = ['money', 'reading', 'words', 'science', 'geography', 'logic'].map(function (s) { return { date: '2020-01-01T00:30:00Z', subject: s }; });
      var six = pickSubjects({ id: 'x', focus: ['money', 'science'] });
      BT.state.sessions = keepS; BT.state.rounds = keepR;
      return six.indexOf('writing') >= 0 && six.indexOf('design') >= 0;
    } },
    { name: 'pay math: base, promotion, no-hint bonus, retry half, hints, wrong, ungraded', fn: function () {
      var a = basePay({ pay: 20 }, 1) === 20 && basePay({ pay: 20 }, 3) === 30;
      var b = payFor({ correct: true, hints: 0 }, 20).pay === 20 && payFor({ correct: true, hints: 0 }, 20).bonus === 4;
      var c = payFor({ correct: true, hints: 1 }, 20).pay === 18 && payFor({ correct: true, hints: 1 }, 20).bonus === 0;
      var d = payFor({ correct: true, hints: 0, retry: true }, 20).pay === 10;
      var e = payFor({ correct: false, hints: 0 }, 20).pay === 0 && payFor({ correct: null, skipped: true }, 20).pay === 0;
      var f = payFor({ correct: null, hints: 0 }, 20).pay === 20 && payFor({ correct: true, hints: 50 }, 20).pay === 0;
      return a && b && c && d && e && f;
    } },
    { name: 'breakCap: half of 15% of the day\'s potential round pay per break, never $0 at tier 1', fn: function () {
      return breakCap(6 * 20) === 9 && breakCap(6 * 18) === 8 && breakCap(6 * 160) === 72 && breakCap(6 * 20) * 2 === Math.round(0.15 * 120);
    } },
    { name: 'roundsLabel counts right against graded rounds and names the creative ones', fn: function () {
      return roundsLabel(4, 4, 6) === 'Rounds (4 of 4 right, 2 creative)' && roundsLabel(3, 5, 5) === 'Rounds (3 of 5 right)';
    } },
    { name: 'tier notice: tierSeen in state is what the payday compares against', fn: function () {
      var keep = BT.state.tierSeen; BT.state.tierSeen = undefined;
      var a = (BT.state.tierSeen || 1) === 1 && tierOf(1015) === 2; // a Book Stop crossing to $1,015 is announced at the next payday
      BT.state.tierSeen = keep; return a;
    } },
    { name: 'tierOf thresholds', fn: function () {
      return tierOf(0) === 1 && tierOf(999) === 1 && tierOf(1000) === 2 && tierOf(4000) === 3 && tierOf(12000) === 4 && tierOf(99999) === 4;
    } },
    { name: 'fallback round renders options, a Hint, test hooks, and resolves on the right tap', fn: function () {
      var box = el('div'), hinted = 0, out = null;
      var p = fallbackRound('logic').build(box, { level: 1, onHint: function () { hinted++; }, explain: function () { return Promise.resolve(); } });
      p.then(function (r) { out = r; });
      var ok = box.querySelectorAll('.option').length === 4 && !!box.querySelector('.btn') && typeof BT.test.currentAnswer() === 'string';
      box.querySelector('.btn').click();
      BT.test.answer();
      BT.test.roundHooks = null;
      return ok && hinted === 1 && box.querySelector('.option.right') !== null;
    } },
    { name: 'explain panel shows the text and resolves on OK', fn: function () {
      var box = el('div'), done = false;
      explainPanel(box, 'because').then(function () { done = true; });
      var shown = !!box.querySelector('.bt-explain') && box.textContent.indexOf('because') >= 0;
      var label = box.querySelector('.btn').textContent;
      box.querySelector('.btn').click();
      var fin = el('div'); explainPanel(fin, 'last', true);
      var finalLabel = fin.querySelector('.btn').textContent; fin.querySelector('.btn').click();
      return shown && !box.querySelector('.bt-explain') && label === 'OK, try again' && finalLabel === 'Got it';
    } },
    { name: 'test hooks: roundHooks delegation, direct assignment override, null clears it', fn: function () {
      BT.test.roundHooks = { currentAnswer: function () { return 'A'; }, answer: function (l) { return l === 'A'; } };
      var a = BT.test.currentAnswer() === 'A' && BT.test.answer() === true;
      BT.test.currentAnswer = function () { return 'B'; };
      var b = BT.test.currentAnswer() === 'B';
      BT.test.currentAnswer = BT.test.currentAnswer || null; // the money/words idiom must not recurse
      var c = BT.test.currentAnswer() === 'B';
      BT.test.currentAnswer = null; BT.test.roundHooks = null;
      var d = BT.test.currentAnswer() === undefined && BT.test.answer() === false;
      return a && b && c && d;
    } },
    { name: 'stopping banner shows and hides', fn: function () {
      showStoppingBanner();
      var a = !!document.getElementById('bt-banner');
      hideBanner();
      return a && !document.getElementById('bt-banner');
    } }
  ]);
})();
