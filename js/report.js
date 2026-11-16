// BT.report: the parent report. Opened by the Parent long-press (wired in main.js, which calls BT.report.open()).
// A 4-digit code gates it: first time sets the code (settings.parentCode), afterwards it must be entered.
// Everything is computed from BT.state (rounds, events, sessions, books, town, shop). See SPEC.md "Parent report".
BT.report = BT.report || {};
(function () {
  'use strict';
  var el = BT.el, esc = BT.esc, fmt = BT.fmt;
  var TAGS = ['bold', 'calm', 'classic', 'wild'];
  var BREAK_SEC = 60; // every timed break game is 60 s

  // ---------- helpers ----------
  function day(iso) { // local calendar day (like BT.today), not the UTC day the ISO string carries
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pct(n, d) { return d ? Math.round(100 * n / d) : 0; }
  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function mins(ms) { return Math.round(ms / 60000); }
  function acc(rs) { var g = rs.filter(function (r) { return typeof r.correct === 'boolean'; }); return g.length ? g.filter(function (r) { return r.correct; }).length / g.length : null; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---------- compute ----------
  BT.report.compute = function (st) {
    st = st || BT.state;
    var rounds = st.rounds || [], events = st.events || [], sessions = st.sessions || [], books = st.books || [];
    var graded = rounds.filter(function (r) { return typeof r.correct === 'boolean'; });
    var allMedian = median(graded.map(function (r) { return r.ms || 0; }));

    var days = {};
    rounds.forEach(function (r) { days[day(r.date)] = 1; });
    sessions.forEach(function (s) { days[day(s.start)] = 1; });
    books.forEach(function (b) { days[day(b.date)] = 1; });
    var totalMs = 0;
    sessions.forEach(function (s) { var d = new Date(s.end) - new Date(s.start); if (d > 0) totalMs += d; });
    var learnMs = 0;
    rounds.forEach(function (r) { learnMs += r.ms || 0; });
    var breaksPlayed = events.filter(function (e) { return e.type === 'break_played'; }).length;
    var breaksDeclined = events.filter(function (e) { return e.type === 'break_declined'; }).length;

    var overview = {
      sessions: sessions.length, minutes: mins(totalMs), days: Object.keys(days).length,
      streak: (st.streak && st.streak.days) || 0, lifetime: st.lifetime || 0, money: st.money || 0,
      learnMinutes: mins(learnMs), breakMinutes: mins(breaksPlayed * BREAK_SEC * 1000),
      breaksPlayed: breaksPlayed, breaksDeclined: breaksDeclined, roundsTotal: rounds.length
    };

    var subjects = BT.SUBJECTS.map(function (s) {
      var rs = rounds.filter(function (r) { return r.subject === s; });
      var g = rs.filter(function (r) { return typeof r.correct === 'boolean'; });
      var right = g.filter(function (r) { return r.correct; }).length;
      var last10 = g.slice(-10), prev10 = g.slice(-20, -10);
      var a1 = acc(last10), a0 = acc(prev10), trend = '→';
      if (a1 != null && a0 != null && prev10.length >= 3) trend = a1 - a0 > 0.1 ? '↑' : a0 - a1 > 0.1 ? '↓' : '→';
      var hints = rs.reduce(function (n, r) { return n + (r.hints || 0); }, 0);
      var withHint = rs.filter(function (r) { return r.hints > 0; }).length;
      var med = median(g.map(function (r) { return r.ms || 0; }));
      return {
        subject: s, rounds: rs.length, graded: g.length, right: right,
        accuracy: g.length ? pct(right, g.length) : null,
        recentAccuracy: last10.length ? pct(last10.filter(function (r) { return r.correct; }).length, last10.length) : null,
        avgSec: g.length ? Math.round(g.reduce(function (n, r) { return n + (r.ms || 0); }, 0) / g.length / 1000) : null,
        medianMs: med,
        level: (st.levels && st.levels[s]) || 1, trend: trend,
        hintsPerRound: rs.length ? Math.round(10 * hints / rs.length) / 10 : 0,
        hintRate: rs.length ? pct(withHint, rs.length) : 0,
        retries: rs.filter(function (r) { return r.retry; }).length,
        voluntary: rs.filter(function (r) { return r.voluntary; }).length,
        offered: events.filter(function (e) { return e.type === 'replay_offered' && e.data && e.data.subject === s; }).length,
        taken: events.filter(function (e) { return e.type === 'replay_taken' && e.data && e.data.subject === s; }).length
      };
    });

    var signals = { gifted: [], support: [], curious: [] };
    subjects.forEach(function (x) {
      var name = cap(x.subject);
      if (x.voluntary >= 1) signals.curious.push(name + ' (she chose ' + x.voluntary + ' extra round' + (x.voluntary === 1 ? '' : 's') + ')');
      if (x.accuracy >= 85 && x.level >= 3 && x.medianMs < allMedian) {
        signals.gifted.push(name + ': ' + x.accuracy + '% right at level ' + x.level + ', and faster than her usual pace.');
      } else if (x.voluntary >= 2) {
        signals.gifted.push(name + ': she came back for ' + x.voluntary + ' extra rounds on her own.');
      }
      if (x.recentAccuracy != null && x.recentAccuracy < 60) {
        signals.support.push(name + ': only ' + x.recentAccuracy + '% right over her last ' + Math.min(10, x.graded) + ' rounds.');
      } else if (x.hintRate > 50) {
        signals.support.push(name + ': she used a hint in ' + x.hintRate + '% of rounds.');
      }
    });

    // shortcut: the prompt text is not logged by session.js, so the job (title and city) stands in for it; upgrade when log.round carries prompt
    var jobName = function (id) {
      var j = (BT.jobs && BT.jobs.data || []).filter(function (x) { return x.id === id; })[0];
      return j ? j.title + ', ' + j.city : (id || '');
    };
    var writing = rounds.filter(function (r) { return r.subject === 'writing' && r.answer; }).map(function (r) {
      return { date: day(r.date), job: jobName(r.jobId), level: r.level, text: String(r.answer) };
    });
    var design = {};
    TAGS.forEach(function (t) { design[t] = 0; });
    rounds.filter(function (r) { return r.subject === 'design' && r.answer; }).forEach(function (r) {
      var m = String(r.answer).toLowerCase().match(/\b(bold|calm|classic|wild)\b/);
      if (m) design[m[1]]++;
    });

    var tiles = {}, placed = 0, grid = (st.town && st.town.grid) || [];
    grid.forEach(function (row) { (row || []).forEach(function (t) { if (t && t !== 'home') { placed++; tiles[t] = (tiles[t] || 0) + 1; } }); });
    var town = {
      name: (st.town && st.town.name) || '', tiles: placed, kinds: tiles,
      placements: events.filter(function (e) { return e.type === 'town_place'; }).length,
      paintings: (st.paintings || []).length
    };
    var shop = {
      home: st.home || 'parents', vehicles: (st.vehicles || []).slice(), outfits: (st.outfits || []).slice(),
      vacations: (st.vacations || []).map(function (v) { return v.id; }),
      buys: events.filter(function (e) { return e.type === 'shop_buy'; }).length,
      spent: events.filter(function (e) { return e.type === 'money_spend' && e.data; }).reduce(function (n, e) { return n + (e.data.n || 0); }, 0)
    };

    return {
      generated: new Date().toISOString(), name: (st.character && st.character.name) || '',
      overview: overview, subjects: subjects, signals: signals,
      books: books.map(function (b) { return { date: day(b.date), title: b.title, pages: b.pages, line: b.line }; }),
      writing: writing, design: design, town: town, shop: shop
    };
  };

  // ---------- plain text ----------
  BT.report.text = function (d) {
    d = d || BT.report.compute();
    var o = d.overview, L = [];
    L.push('BOOMTOWN USA report' + (d.name ? ' for ' + d.name : '') + ' (' + day(d.generated) + ')');
    L.push('');
    L.push('OVERVIEW');
    L.push('Sessions: ' + o.sessions + ' | Total minutes: ' + o.minutes + ' | Days played: ' + o.days + ' | Current streak: ' + o.streak + ' day' + (o.streak === 1 ? '' : 's'));
    L.push('Lifetime earnings: ' + fmt(o.lifetime) + ' | Money now: ' + fmt(o.money));
    L.push('Learning time: ' + o.learnMinutes + ' min (' + o.roundsTotal + ' rounds) | Break time: ' + o.breakMinutes + ' min (' + o.breaksPlayed + ' played, ' + o.breaksDeclined + ' skipped)');
    L.push('');
    L.push('SUBJECTS (rounds | accuracy | avg sec | level trend | hints/round | retries | replays taken/offered)');
    d.subjects.forEach(function (x) {
      L.push(cap(x.subject) + ': ' + x.rounds + ' | ' + (x.accuracy == null ? 'n/a' : x.accuracy + '%') + ' | ' + (x.avgSec == null ? 'n/a' : x.avgSec + 's') +
        ' | L' + x.level + ' ' + x.trend + ' | ' + x.hintsPerRound + ' | ' + x.retries + ' | ' + x.taken + '/' + x.offered);
    });
    L.push('');
    L.push('SIGNALS');
    L.push('Gifted signals:' + (d.signals.gifted.length ? '' : ' none yet.'));
    d.signals.gifted.forEach(function (s) { L.push('  - ' + s); });
    L.push('Needs support:' + (d.signals.support.length ? '' : ' nothing flagged.'));
    d.signals.support.forEach(function (s) { L.push('  - ' + s); });
    L.push('Curious about: ' + (d.signals.curious.length ? d.signals.curious.join('; ') : 'no voluntary replays yet.'));
    L.push('');
    L.push('READING LOG (' + d.books.length + ')');
    d.books.forEach(function (b) { L.push(b.date + ' | ' + b.title + ' | ' + (b.pages || 0) + ' pages | ' + b.line); });
    if (!d.books.length) L.push('No books logged yet.');
    L.push('');
    L.push('WRITING SAMPLES (' + d.writing.length + ')');
    d.writing.forEach(function (w) { L.push(w.date + ' | job: ' + w.job + ' | level ' + w.level); L.push('  ' + w.text); });
    if (!d.writing.length) L.push('No writing yet.');
    L.push('');
    L.push('DESIGN CHOICES: ' + TAGS.map(function (t) { return t + ' ' + d.design[t]; }).join(', '));
    L.push('');
    L.push('TOWN: ' + (d.town.name || '(unnamed)') + ' | ' + d.town.tiles + ' tiles placed | ' + d.town.placements + ' placements all time | ' + d.town.paintings + ' paintings');
    var kinds = Object.keys(d.town.kinds).sort();
    if (kinds.length) L.push('  ' + kinds.map(function (k) { return k + ' x' + d.town.kinds[k]; }).join(', '));
    L.push('SHOP: home ' + d.shop.home + ' | wheels: ' + (d.shop.vehicles.join(', ') || 'none') + ' | outfits: ' + (d.shop.outfits.join(', ') || 'none') +
      ' | vacations: ' + (d.shop.vacations.join(', ') || 'none') + ' | ' + d.shop.buys + ' purchases | ' + fmt(d.shop.spent) + ' spent in all');
    return L.join('\n');
  };
  BT.report.json = function (st) { return JSON.stringify(BT.report.compute(st), null, 2); };

  // ---------- clipboard ----------
  function copyText(text, ta) {
    if (ta) { ta.value = text; ta.focus(); ta.select(); }
    var done = function () { BT.toast('Copied', 'good'); };
    var fallback = function () {
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) done(); else BT.toast('Select the text and copy it by hand', 'info');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  // ---------- code pad ----------
  function codePad(title, hint, onEnter) {
    var digits = '';
    var dots = el('div', { class: 'numpad-display', style: { textAlign: 'center', letterSpacing: '12px' }, text: '----' });
    var msg = el('p', { class: 'muted center', text: hint || '' });
    function refresh() { dots.textContent = (digits + '----').slice(0, 4).replace(/\d/g, '•'); }
    function tap(k) {
      BT.sfx.click();
      if (k === 'back') digits = digits.slice(0, -1);
      else if (k === 'clear') digits = '';
      else if (digits.length < 4) digits += k;
      refresh();
      if (digits.length === 4) { var d = digits; digits = ''; var go = function () { refresh(); onEnter(d, msg); }; if (BT.TEST) go(); else setTimeout(go, 120); }
    }
    var pad = el('div', { class: 'numpad' });
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].forEach(function (k) {
      pad.appendChild(el('button', { class: 'btn ' + (k === 'clear' ? 'coral' : k === 'back' ? 'stone' : 'sky'), type: 'button',
        text: k === 'back' ? '⌫' : k === 'clear' ? 'Clear' : k, data: { key: k }, style: k === 'clear' ? { fontSize: '1rem' } : null, onclick: function () { tap(k); } }));
    });
    var box = el('div', { class: 'card stack report-gate', style: { maxWidth: '420px', margin: '0 auto', width: '100%' } }, [
      el('h2', { class: 'center', text: title }), msg, dots, pad,
      el('button', { class: 'btn ghost', type: 'button', text: 'Back to the game', onclick: function () { BT.screen.show('home'); } })
    ]);
    return box;
  }

  function gate(root) {
    var code = BT.state.settings.parentCode;
    root.innerHTML = '';
    if (!code) {
      var first = null;
      root.appendChild(codePad('Set a parent code', 'Choose 4 digits. You will need them every time.', function (d, msg) {
        if (!first) { first = d; msg.textContent = 'Type it once more to confirm.'; return; }
        if (d !== first) { first = null; msg.textContent = 'They did not match. Start again.'; BT.sfx.bad(); return; }
        BT.state.settings.parentCode = d; BT.save(); BT.sfx.good();
        BT.toast('Parent code saved', 'good');
        render(root);
      }));
    } else {
      root.appendChild(codePad('Parent code', 'Enter the 4-digit code.', function (d, msg) {
        if (d === code) { BT.sfx.good(); render(root); }
        else { msg.textContent = 'Wrong code. Forgot it? Clear it from Settings.'; BT.sfx.bad(); }
      }));
    }
  }

  // ---------- report screen ----------
  function table(d) {
    var head = ['Subject', 'Rounds', 'Accuracy', 'Avg sec', 'Level', 'Hints/rd', 'Retries', 'Replays'];
    var t = el('table', { class: 'report-table' }, [
      el('thead', null, el('tr', null, head.map(function (h) { return el('th', { text: h }); })))
    ]);
    var body = el('tbody');
    d.subjects.forEach(function (x) {
      body.appendChild(el('tr', null, [
        el('td', { text: cap(x.subject) }), el('td', { text: x.rounds }),
        el('td', { text: x.accuracy == null ? '–' : x.accuracy + '%' }), el('td', { text: x.avgSec == null ? '–' : x.avgSec }),
        el('td', { text: 'L' + x.level + ' ' + x.trend }), el('td', { text: x.hintsPerRound }),
        el('td', { text: x.retries }), el('td', { text: x.taken + ' / ' + x.offered })
      ]));
    });
    t.appendChild(body);
    return t;
  }
  function section(title, children) { return el('section', { class: 'report-sec' }, [el('h3', { text: title })].concat(children)); }
  function list(items, empty) {
    return items.length ? el('ul', null, items.map(function (s) { return el('li', { text: s }); })) : el('p', { class: 'muted', text: empty });
  }

  function render(root) {
    var d = BT.report.compute(), o = d.overview, text = BT.report.text(d);
    root.innerHTML = '';
    var ta = el('textarea', { class: 'report-ta', 'aria-label': 'Report text', readonly: 'readonly' });
    ta.value = text;
    var pills = [
      ['Sessions', o.sessions], ['Minutes', o.minutes], ['Days', o.days], ['Streak', o.streak + 'd'],
      ['Lifetime', fmt(o.lifetime)], ['Learning', o.learnMinutes + ' min'], ['Breaks', o.breakMinutes + ' min']
    ].map(function (p) { return el('span', { class: 'pill sky', html: '<b>' + esc(p[1]) + '</b>&nbsp;' + esc(p[0]) }); });
    var head = el('div', { class: 'screen-head' }, [
      el('h2', { text: 'Parent report' + (d.name ? ': ' + d.name : '') }),
      el('div', { class: 'btn-row' }, [
        el('button', { class: 'btn btn-sm gold', type: 'button', id: 'report-copy', text: 'Copy report', onclick: function () { copyText(text, ta); } }),
        el('button', { class: 'btn btn-sm violet', type: 'button', id: 'report-copy-json', text: 'Copy JSON', onclick: function () { copyText(BT.report.json(), ta); } }),
        el('button', { class: 'btn btn-sm stone', type: 'button', id: 'report-close', text: 'Close', onclick: function () { BT.sfx.click(); BT.screen.show('home'); } })
      ])
    ]);
    var kinds = Object.keys(d.town.kinds).sort();
    var panel = el('div', { class: 'panel report-body' }, [
      section('Overview', [el('div', { class: 'hud', style: { justifyContent: 'flex-start' } }, pills),
        el('p', { class: 'muted', text: o.roundsTotal + ' rounds in all; ' + o.breaksPlayed + ' breaks played, ' + o.breaksDeclined + ' skipped.' })]),
      section('By subject', [table(d), el('p', { class: 'muted', text: 'Trend arrow: last 10 rounds against the 10 before. Replays: taken / offered.' })]),
      section('Signals', [
        el('h4', { text: 'Gifted signals' }), list(d.signals.gifted, 'None yet. These appear at 85%+ accuracy at level 3 or higher with quick answers, or 2+ voluntary replays.'),
        el('h4', { text: 'Needs support' }), list(d.signals.support, 'Nothing flagged. This appears under 60% over the last 10 rounds or a hint in more than half of rounds.'),
        el('h4', { text: 'Curious about' }), list(d.signals.curious, 'No voluntary replays yet.')
      ]),
      section('Reading log', [list(d.books.map(function (b) { return b.date + ' · ' + b.title + ' · ' + (b.pages || 0) + ' pages: "' + b.line + '"'; }), 'No books logged yet.')]),
      section('Writing samples', d.writing.length ? d.writing.map(function (w) {
        return el('div', { class: 'card', style: { padding: '10px 14px' } }, [el('div', { class: 'muted', text: w.date + ' · job: ' + w.job + ' · level ' + w.level }), el('div', { text: w.text })]);
      }) : [el('p', { class: 'muted', text: 'No writing yet.' })]),
      section('Design choices', [el('div', { class: 'hud', style: { justifyContent: 'flex-start' } }, TAGS.map(function (t) { return el('span', { class: 'pill gold', text: cap(t) + ' ' + d.design[t] }); }))]),
      section('Town and shop', [
        el('p', { text: 'Town ' + (d.town.name || '(unnamed)') + ': ' + d.town.tiles + ' tiles placed, ' + d.town.placements + ' placements all time, ' + d.town.paintings + ' paintings.' +
          (kinds.length ? ' ' + kinds.map(function (k) { return k + ' x' + d.town.kinds[k]; }).join(', ') + '.' : '') }),
        el('p', { text: 'Home: ' + d.shop.home + '. Wheels: ' + (d.shop.vehicles.join(', ') || 'none') + '. Outfits: ' + (d.shop.outfits.join(', ') || 'none') +
          '. Vacations: ' + (d.shop.vacations.join(', ') || 'none') + '. ' + d.shop.buys + ' purchases, ' + fmt(d.shop.spent) + ' spent in all.' })
      ]),
      section('Plain text (for pasting)', [ta])
    ]);
    root.appendChild(head); root.appendChild(panel);
  }

  var css = '.report-table{width:100%;border-collapse:collapse;font-size:.95rem}.report-table th,.report-table td{padding:6px 8px;text-align:left;border-bottom:2px solid rgba(0,0,0,.1)}' +
    '.report-table th{font-size:.8rem;text-transform:uppercase;opacity:.7}.report-sec{margin-bottom:18px}.report-sec h3{margin:0 0 8px}.report-sec h4{margin:10px 0 4px}' +
    '.report-sec ul{margin:0;padding-left:20px}.report-ta{min-height:160px;font-family:ui-monospace,Menlo,monospace;font-size:.85rem;font-weight:400}.report-gate{margin-top:20px}';
  document.head.appendChild(el('style', { text: css }));

  BT.report.open = function () {
    var root = BT.screen.show('report');
    if (root) gate(root);
  };
  // Leaving the screen wipes it: the next open asks for the code again.
  document.addEventListener('bt:screen', function (e) { if (e.detail.id !== 'report') { var r = BT.screen.el('report'); if (r) r.innerHTML = ''; } });

  // ---------- checks ----------
  function synthetic() {
    var st = BT.defaults();
    st.character = { name: 'Test' };
    st.lifetime = 500; st.money = 300; st.levels.money = 3; st.streak.days = 2;
    var mk = function (subject, correct, ms, extra) { return Object.assign({ date: '2026-11-15T20:00:00.000Z', subject: subject, jobId: 'austin-bakery', jobLevel: 1, level: 1, correct: correct, ms: ms, hints: 0, voluntary: false, retry: false }, extra || {}); };
    for (var i = 0; i < 10; i++) st.rounds.push(mk('money', i !== 0, 2000 + i * 400, { level: 3 }));  // 9/10 right, 2.0-5.6 s, mean 3.8 s
    for (var j = 0; j < 4; j++) st.rounds.push(mk('science', j === 0, 20000, { hints: 1 }));       // 1/4 right, slow, hinted
    st.rounds.push(mk('logic', true, 9000, { voluntary: true })); st.rounds.push(mk('logic', true, 9000, { voluntary: true }));
    st.rounds.push(mk('writing', null, 30000, { answer: 'Sweet Rise Bakery because the bread rises at dawn.' }));
    st.rounds.push(mk('design', null, 5000, { answer: 'Neon sign (bold)' }));
    st.rounds.push(mk('design', null, 5000, { answer: 'Chalkboard (classic)' }));
    st.sessions.push({ start: '2026-11-15T20:00:00.000Z', end: '2026-11-15T20:30:00.000Z', jobId: 'austin-bakery', earned: 120, rounds: 6, breaks: 1 });
    st.sessions.push({ start: '2026-11-16T20:00:00.000Z', end: '2026-11-16T20:15:00.000Z', jobId: 'austin-bakery', earned: 100, rounds: 6, breaks: 0 });
    st.events.push({ t: '', type: 'break_played', data: { id: 'coinrain', score: 10, pay: 5 } });
    st.events.push({ t: '', type: 'break_declined', data: { id: 'minerush' } });
    st.events.push({ t: '', type: 'replay_offered', data: { subject: 'logic' } }); st.events.push({ t: '', type: 'replay_taken', data: { subject: 'logic' } });
    st.events.push({ t: '', type: 'replay_offered', data: { subject: 'logic' } }); st.events.push({ t: '', type: 'replay_taken', data: { subject: 'logic' } });
    st.events.push({ t: '', type: 'town_place', data: { id: 'tree', r: 1, c: 1, price: 15 } });
    st.events.push({ t: '', type: 'shop_buy', data: { kind: 'wheels', id: 'bike', price: 150 } });
    st.events.push({ t: '', type: 'money_spend', data: { n: 165, reason: 'x' } });
    st.town.grid[1][1] = 'tree'; st.town.grid[2][2] = 'home'; st.town.name = 'Testville';
    st.vehicles.push('bike');
    st.books.push({ date: '2026-11-15T20:40:00.000Z', title: 'The Lemonade War', pages: 12, line: 'Evan and Jessie fight over lemonade money.' });
    return st;
  }
  BT.registerChecks('report', [
    { name: 'report dates use the local calendar day', fn: function () {
      var now = new Date(), st = BT.defaults();
      st.rounds = [{ date: now.toISOString(), correct: true, ms: 1000 }];
      var d = BT.report.compute(st);
      return d.overview.days === 1 && BT.report.text(d).indexOf(BT.today()) >= 0 && day(new Date(2026, 10, 15, 19, 30).toISOString()) === '2026-11-15';
    } },
    { name: 'empty state computes and renders text with every subject', fn: function () {
      var d = BT.report.compute(BT.defaults()), t = BT.report.text(d);
      return d.overview.sessions === 0 && d.subjects.length === 8 && d.signals.gifted.length === 0 && d.signals.support.length === 0 &&
        BT.SUBJECTS.every(function (s) { return t.indexOf(cap(s)) >= 0; }) && t.indexOf('No books logged yet') >= 0;
    } },
    { name: 'synthetic overview numbers', fn: function () {
      var o = BT.report.compute(synthetic()).overview;
      return o.sessions === 2 && o.minutes === 45 && o.days === 2 && o.streak === 2 && o.lifetime === 500 && o.breaksPlayed === 1 && o.breaksDeclined === 1 &&
        o.breakMinutes === 1 && o.roundsTotal === 19;
    } },
    { name: 'synthetic per-subject table', fn: function () {
      var d = BT.report.compute(synthetic()), by = {};
      d.subjects.forEach(function (x) { by[x.subject] = x; });
      return by.money.rounds === 10 && by.money.accuracy === 90 && by.money.avgSec === 4 && by.money.level === 3 && by.money.trend === '→' &&
        by.science.accuracy === 25 && by.science.hintsPerRound === 1 && by.science.hintRate === 100 &&
        by.logic.voluntary === 2 && by.logic.taken === 2 && by.logic.offered === 2 && by.reading.accuracy === null;
    } },
    { name: 'synthetic signals', fn: function () {
      var s = BT.report.compute(synthetic()).signals;
      return s.gifted.length === 2 && /^Money/.test(s.gifted[0]) && /^Logic/.test(s.gifted[1]) &&
        s.support.length === 1 && /^Science/.test(s.support[0]) && s.curious.length === 1 && /^Logic/.test(s.curious[0]);
    } },
    { name: 'synthetic logs, design, town and shop', fn: function () {
      var d = BT.report.compute(synthetic());
      return d.books.length === 1 && d.books[0].title === 'The Lemonade War' && d.writing.length === 1 && /Sweet Rise/.test(d.writing[0].text) &&
        d.design.bold === 1 && d.design.classic === 1 && d.design.calm === 0 && d.town.tiles === 1 && d.town.kinds.tree === 1 && d.town.name === 'Testville' &&
        d.shop.vehicles[0] === 'bike' && d.shop.buys === 1 && d.shop.spent === 165 && JSON.parse(BT.report.json(synthetic())).overview.sessions === 2;
    } },
    { name: 'needs support has no minimum round count (spec)', fn: function () {
      var st = BT.defaults();
      st.rounds.push({ date: '2026-11-15', subject: 'logic', correct: false, ms: 1000 }, { date: '2026-11-15', subject: 'logic', correct: false, ms: 1000 });
      var s = BT.report.compute(st).signals.support;
      return s.length === 1 && /^Logic: only 0% right over her last 2 rounds/.test(s[0]);
    } },
    { name: 'trend arrows from last 10 vs previous 10', fn: function () {
      var st = BT.defaults();
      for (var i = 0; i < 20; i++) st.rounds.push({ date: '2026-11-15', subject: 'words', correct: i >= 10, ms: 1000 });
      var up = BT.report.compute(st).subjects.filter(function (x) { return x.subject === 'words'; })[0].trend;
      st.rounds.forEach(function (r, i) { r.correct = i < 10; });
      var down = BT.report.compute(st).subjects.filter(function (x) { return x.subject === 'words'; })[0].trend;
      return up === '↑' && down === '↓';
    } },
    { name: 'code gate: first open sets a code, then asks for it; wrong code stays closed', fn: function () {
      var keep = BT.state.settings.parentCode, before = BT.screen.current;
      BT.state.settings.parentCode = null;
      var root = BT.report.open();
      root = BT.screen.el('report');
      function type(code) { code.split('').forEach(function (k) { root.querySelector('[data-key="' + k + '"]').click(); }); }
      var a = !!root.querySelector('.report-gate') && !root.querySelector('.report-table');
      type('1234'); type('1234');
      var b = BT.state.settings.parentCode === '1234' && !!root.querySelector('.report-table');
      BT.screen.show('home'); BT.report.open();
      var c = !!root.querySelector('.report-gate');
      type('9999');
      var d = !root.querySelector('.report-table');
      type('1234');
      var e = !!root.querySelector('.report-table') && root.querySelector('.report-ta').value.indexOf('BOOMTOWN USA report') === 0;
      BT.state.settings.parentCode = keep; BT.save();
      BT.screen.show(before || 'home');
      return a && b && c && d && e;
    } }
  ]);
})();
