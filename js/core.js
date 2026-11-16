// BT core: state, save/load, screens, toast, RNG, money, log, levels, registries, test harness.
// Every other module attaches to window.BT. This file loads first. See SPEC.md "The BT core API".
window.BT = window.BT || {};
(function () {
  'use strict';
  var BT = window.BT;
  var KEY = 'boomtown_v1';
  var params = new URLSearchParams(location.search);
  var TEST = params.get('test') === '1';

  BT.TEST = TEST;
  BT.SUBJECTS = ['money', 'reading', 'words', 'science', 'geography', 'logic', 'writing', 'design'];
  BT.SCREENS = ['home', 'character', 'jobs', 'round', 'break', 'payday', 'bookstop', 'town', 'shop', 'report', 'settings'];
  BT.TIERS = [0, 1000, 4000, 12000]; // lifetime $ needed for tier 1..4

  // ---------- RNG (seeded mulberry32 when ?test=1) ----------
  var seed = 42;
  function seeded() {
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  BT.rng = TEST ? seeded : Math.random;
  BT.rand = function (min, max) { return Math.floor(BT.rng() * (max - min + 1)) + min; };
  BT.pick = function (arr) { return arr[Math.floor(BT.rng() * arr.length)]; };
  BT.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(BT.rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  // ---------- small helpers ----------
  BT.fmt = function (n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); };
  BT.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  // BT.el('button', {class:'btn', text:'Go', onclick: fn, style:{color:'red'}, data:{id:1}}, [children])
  BT.el = function (tag, attrs, children) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k === 'data' && typeof v === 'object') Object.keys(v).forEach(function (d) { e.dataset[d] = v[d]; });
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return e;
  };
  BT.wait = function (ms) { return new Promise(function (r) { setTimeout(r, TEST ? 0 : ms); }); };
  BT.today = function () { // local calendar day, YYYY-MM-DD
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  // ---------- state ----------
  function subjectMap(make) {
    var o = {};
    BT.SUBJECTS.forEach(function (s) { o[s] = make(); });
    return o;
  }
  function defaults() {
    var now = new Date().toISOString();
    var grid = [];
    for (var r = 0; r < 10; r++) { grid.push([null, null, null, null, null, null, null, null, null, null]); }
    return {
      v: 1,
      created: now, lastPlayed: now, streak: { days: 0, lastDay: null },
      character: null,
      money: 0, lifetime: 0,
      levels: subjectMap(function () { return 1; }),
      streaks: subjectMap(function () { return { right: 0, wrong: 0 }; }),
      jobs: {},
      home: 'parents',
      vehicles: [], outfits: [], vacations: [],
      town: { grid: grid, name: '' },
      paintings: [],
      books: [],
      rounds: [],
      events: [],
      sessions: [],
      settings: { sound: true, music: true, voice: true, parentCode: null }
    };
  }
  BT.defaults = defaults;
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  // Fill missing keys from defaults, recurse into plain objects, keep unknown saved keys (migration-safe).
  function withDefaults(def, saved) {
    if (!isObj(saved)) return def;
    var out = Object.assign({}, saved);
    Object.keys(def).forEach(function (k) {
      if (saved[k] === undefined || saved[k] === null && def[k] !== null) out[k] = def[k];
      else if (isObj(def[k]) && isObj(saved[k])) out[k] = withDefaults(def[k], saved[k]);
    });
    return out;
  }
  BT.state = defaults();
  BT.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(BT.state)); } catch (e) { /* private mode or full: play on */ }
    return BT.state;
  };
  BT.load = function () {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    var saved = null;
    if (raw) { try { saved = JSON.parse(raw); } catch (e) { saved = null; } }
    BT.state = withDefaults(defaults(), saved);
    if (TEST && params.get('fresh') === '1') BT.state = defaults();
    return BT.state;
  };
  BT.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    BT.state = defaults();
    BT.save();
    BT.hud();
    return BT.state;
  };
  BT.exportCode = function () {
    return btoa(unescape(encodeURIComponent(JSON.stringify(BT.state))));
  };
  BT.importCode = function (str) {
    try {
      var obj = JSON.parse(decodeURIComponent(escape(atob(String(str).trim()))));
      if (!isObj(obj) || obj.v !== 1 || typeof obj.money !== 'number') return false;
      BT.state = withDefaults(defaults(), obj);
      BT.save();
      BT.hud();
      return true;
    } catch (e) { return false; }
  };
  // Day streak: call once per boot. Consecutive calendar days count; a gap resets to 1.
  BT.touchDay = function () {
    var st = BT.state.streak, today = BT.today();
    if (st.lastDay === today) return st.days;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yday = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    st.days = st.lastDay === yday ? st.days + 1 : 1;
    st.lastDay = today;
    BT.state.lastPlayed = new Date().toISOString();
    BT.save();
    return st.days;
  };
  BT.tier = function (lifetime) {
    if (TEST) return 4; // test mode: every tier unlocked
    var life = lifetime == null ? BT.state.lifetime : lifetime, t = 1;
    for (var i = 1; i < BT.TIERS.length; i++) if (life >= BT.TIERS[i]) t = i + 1;
    return t;
  };

  // ---------- money ----------
  BT.money = {
    get: function () { return BT.state.money; },
    add: function (n, reason) {
      n = Math.round(n);
      BT.state.money += n;
      if (n > 0) BT.state.lifetime += n;
      BT.log.event('money_add', { n: n, reason: reason || '' });
      BT.hud();
      return BT.state.money;
    },
    spend: function (n, reason) {
      n = Math.round(n);
      if (n > BT.state.money) return false;
      BT.state.money -= n;
      BT.log.event('money_spend', { n: n, reason: reason || '' });
      BT.hud();
      return true;
    }
  };

  // ---------- adaptive levels ----------
  BT.level = {
    get: function (subject) { return BT.state.levels[subject] || 1; },
    // 3 right in a row at a level -> up (max 5); 2 wrong in a row -> down (min 1). Counters reset on a move.
    record: function (subject, correct) {
      if (!BT.state.streaks[subject]) BT.state.streaks[subject] = { right: 0, wrong: 0 };
      if (!BT.state.levels[subject]) BT.state.levels[subject] = 1;
      var st = BT.state.streaks[subject];
      if (correct) {
        st.right++; st.wrong = 0;
        if (st.right >= 3) { if (BT.state.levels[subject] < 5) BT.state.levels[subject]++; st.right = 0; }
      } else {
        st.wrong++; st.right = 0;
        if (st.wrong >= 2) { if (BT.state.levels[subject] > 1) BT.state.levels[subject]--; st.wrong = 0; }
      }
      BT.save();
      return BT.state.levels[subject];
    }
  };

  // ---------- log ----------
  BT.log = {
    // entry: {subject, jobId, jobLevel, level, correct, ms, hints, voluntary, retry, answer?}
    // NOTE: log.round also calls BT.level.record when correct is true/false. Do not call both.
    round: function (entry) {
      var e = Object.assign({ date: new Date().toISOString(), hints: 0, voluntary: false, retry: false }, entry);
      BT.state.rounds.push(e);
      // A retry answers a revealed/explained question: it never moves the level up, and it is not a second miss either.
      if (typeof e.correct === 'boolean') {
        if (e.retry) { if (BT.state.streaks[e.subject]) BT.state.streaks[e.subject].right = 0; }
        else BT.level.record(e.subject, e.correct);
      }
      BT.save();
      return e;
    },
    event: function (type, data) {
      var ev = BT.state.events;
      ev.push({ t: new Date().toISOString(), type: type, data: data === undefined ? null : data });
      if (ev.length > 5000) ev.splice(0, ev.length - 5000);
      BT.save();
    }
  };

  // ---------- screens ----------
  // Modules render on show by listening: document.addEventListener('bt:screen', e => { if (e.detail.id==='shop') ... })
  BT.screen = {
    current: null,
    el: function (id) { return document.getElementById('screen-' + id); },
    show: function (id, opts) {
      var target = BT.screen.el(id);
      if (!target) { console.warn('BT.screen.show: no screen', id); return null; }
      document.querySelectorAll('.screen.active').forEach(function (s) { s.classList.remove('active'); });
      target.classList.add('active');
      BT.screen.current = id;
      document.body.dataset.screen = id;
      document.dispatchEvent(new CustomEvent('bt:screen', { detail: { id: id, opts: opts || {} } }));
      return target;
    }
  };

  // ---------- toast ----------
  BT.toast = function (text, kind) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var t = BT.el('div', { class: 'toast ' + (kind || 'info'), text: text });
    host.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, TEST ? 60 : 2200);
    setTimeout(function () { t.remove(); }, TEST ? 120 : 2600);
    return t;
  };

  // ---------- confetti + coin fly ----------
  BT.confetti = function () {
    var c = document.getElementById('fx');
    if (!c) return;
    var ctx = c.getContext('2d'), dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    var colors = ['#ffcf3f', '#ff6b6b', '#8b6cff', '#3ddc97', '#6ec6ff', '#5fcf5a'];
    var bits = [];
    for (var i = 0; i < 140; i++) {
      bits.push({ x: Math.random() * c.width, y: -Math.random() * c.height * 0.4, vx: (Math.random() - 0.5) * 4 * dpr,
        vy: (2 + Math.random() * 4) * dpr, s: (6 + Math.random() * 8) * dpr, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        col: colors[i % colors.length] });
    }
    var start = performance.now(), life = TEST ? 150 : 2600;
    function frame(now) {
      var k = (now - start) / life;
      ctx.clearRect(0, 0, c.width, c.height);
      if (k >= 1) return;
      ctx.globalAlpha = k > 0.8 ? (1 - k) * 5 : 1;
      bits.forEach(function (b) {
        b.x += b.vx; b.y += b.vy; b.vy += 0.05 * dpr; b.r += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.col;
        ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6); ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
  BT.coinFly = function (fromEl) {
    var to = document.getElementById('topbar-money');
    if (!to) return;
    var tr = to.getBoundingClientRect();
    var fr = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect()
      : { left: innerWidth / 2 - 20, top: innerHeight / 2 - 20, width: 40, height: 40 };
    var sx = fr.left + fr.width / 2, sy = fr.top + fr.height / 2, tx = tr.left + tr.width / 2, ty = tr.top + tr.height / 2;
    var n = 8, dur = TEST ? 40 : 700;
    for (var i = 0; i < n; i++) {
      var coin = BT.el('div', { class: 'coin', text: '$' });
      document.body.appendChild(coin);
      var ox = (Math.random() - 0.5) * 60, oy = (Math.random() - 0.5) * 60;
      var anim = coin.animate([
        { transform: 'translate(' + (sx - 14) + 'px,' + (sy - 14) + 'px) scale(1)', opacity: 1 },
        { transform: 'translate(' + (sx - 14 + ox) + 'px,' + (sy - 14 + oy) + 'px) scale(1.2)', opacity: 1, offset: 0.3 },
        { transform: 'translate(' + (tx - 14) + 'px,' + (ty - 14) + 'px) scale(0.5)', opacity: 0.9 }
      ], { duration: dur, delay: i * (TEST ? 0 : 60), easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'both' });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(coin);
    }
    setTimeout(function () {
      to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump');
      if (BT.sfx && BT.sfx.coin) BT.sfx.coin();
    }, dur);
  };

  // ---------- top bar ----------
  BT.avatarFallback = function (size) {
    size = size || 40;
    return '<svg viewBox="0 0 40 40" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<rect x="10" y="4" width="20" height="18" rx="3" fill="#f1c27d"/><rect x="10" y="2" width="20" height="6" rx="2" fill="#5a3b1e"/>' +
      '<rect x="15" y="11" width="3" height="3" fill="#1e2430"/><rect x="22" y="11" width="3" height="3" fill="#1e2430"/>' +
      '<rect x="8" y="23" width="24" height="15" rx="3" fill="#8b6cff"/></svg>';
  };
  BT.hud = function () {
    var s = BT.state, c = s.character;
    var money = document.getElementById('topbar-money');
    var name = document.getElementById('topbar-name');
    var streak = document.getElementById('topbar-streak');
    var av = document.getElementById('topbar-avatar');
    if (money) money.textContent = BT.fmt(s.money);
    if (name) name.textContent = c && c.name ? c.name : 'Boomtown';
    if (streak) streak.textContent = (s.streak.days || 0) + ' day' + (s.streak.days === 1 ? '' : 's');
    if (av) av.innerHTML = c && BT.character && BT.character.svg ? BT.character.svg(40) : BT.avatarFallback(40);
    document.dispatchEvent(new CustomEvent('bt:hud'));
  };

  // ---------- registries ----------
  BT.rounds = BT.rounds || {};        // module namespaces (BT.rounds.money = the money round module)
  BT.minigames = BT.minigames || {};
  BT.registry = { rounds: {}, minigames: {} }; // what registerRound / registerMinigame fill
  BT.registerRound = function (subject, def) {
    if (!def || typeof def.build !== 'function') throw new Error('registerRound(' + subject + '): build(container, ctx) required');
    BT.registry.rounds[subject] = Object.assign({ subject: subject, title: subject, icon: '' }, def);
  };
  BT.registerMinigame = function (id, def) {
    if (!def || typeof def.start !== 'function') throw new Error('registerMinigame(' + id + '): start(container, ctx) required');
    BT.registry.minigames[id] = Object.assign({ id: id, title: id, icon: '', blurb: '' }, def);
  };

  // ---------- test harness ----------
  BT.test = {
    checks: [],
    seed: 42,
    fast: TEST,
    // Runs every check synchronously. A check fails when it throws or returns false. Returns the failures.
    run: function () {
      var failures = [];
      BT.test.checks.forEach(function (c) {
        try {
          var r = c.fn();
          if (r === false) failures.push({ name: c.name, error: 'returned false' });
        } catch (e) { failures.push({ name: c.name, error: e && e.message || String(e) }); }
      });
      BT.test.lastRun = { total: BT.test.checks.length, failures: failures };
      return failures;
    },
    assert: function (cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }
  };
  BT.registerChecks = function (name, list) {
    (list || []).forEach(function (c) { BT.test.checks.push({ name: name + ': ' + c.name, fn: c.fn }); });
  };

  BT.registerChecks('core', [
    { name: 'defaults have every subject level and streak', fn: function () {
      var d = defaults();
      return BT.SUBJECTS.every(function (s) { return d.levels[s] === 1 && d.streaks[s].right === 0; }) && d.town.grid.length === 10;
    } },
    { name: 'withDefaults fills missing keys and keeps saved ones', fn: function () {
      var m = withDefaults(defaults(), { v: 1, money: 50, levels: { money: 3 }, extra: 'keep' });
      return m.money === 50 && m.levels.money === 3 && m.levels.reading === 1 && m.extra === 'keep' && m.settings.sound === true;
    } },
    { name: 'export/import round-trips', fn: function () {
      var keep = JSON.stringify(BT.state);
      var code = BT.exportCode();
      var ok = BT.importCode(code) && BT.importCode('not a code') === false;
      BT.state = JSON.parse(keep); BT.save();
      return ok;
    } },
    { name: 'level logic: 3 right up, 2 wrong down, clamped 1..5', fn: function () {
      var keepL = BT.state.levels.logic, keepS = JSON.stringify(BT.state.streaks.logic);
      BT.state.levels.logic = 1; BT.state.streaks.logic = { right: 0, wrong: 0 };
      BT.level.record('logic', true); BT.level.record('logic', true);
      var a = BT.level.get('logic') === 1;
      BT.level.record('logic', true);
      var b = BT.level.get('logic') === 2;
      BT.level.record('logic', false); BT.level.record('logic', false);
      var c = BT.level.get('logic') === 1;
      BT.level.record('logic', false); BT.level.record('logic', false);
      var d = BT.level.get('logic') === 1;
      BT.state.levels.logic = 5; BT.state.streaks.logic = { right: 2, wrong: 0 };
      BT.level.record('logic', true);
      var e = BT.level.get('logic') === 5;
      BT.state.levels.logic = keepL; BT.state.streaks.logic = JSON.parse(keepS); BT.save();
      return a && b && c && d && e;
    } },
    { name: 'log.round: a retry never raises the level', fn: function () {
      var keepL = BT.state.levels.logic, keepS = JSON.stringify(BT.state.streaks.logic), keepR = BT.state.rounds.length;
      BT.state.levels.logic = 1; BT.state.streaks.logic = { right: 0, wrong: 0 };
      for (var i = 0; i < 3; i++) BT.log.round({ subject: 'logic', correct: true, retry: true });
      var a = BT.level.get('logic') === 1;
      BT.log.round({ subject: 'logic', correct: true }); BT.log.round({ subject: 'logic', correct: true });
      BT.log.round({ subject: 'logic', correct: true, retry: true }); BT.log.round({ subject: 'logic', correct: true });
      var b = BT.level.get('logic') === 1 && BT.state.streaks.logic.right === 1;
      BT.state.rounds.length = keepR; BT.state.levels.logic = keepL; BT.state.streaks.logic = JSON.parse(keepS); BT.save();
      return a && b;
    } },
    { name: 'money add/spend and fmt', fn: function () {
      var m = BT.state.money, l = BT.state.lifetime;
      BT.money.add(1234, 'check');
      var a = BT.state.money === m + 1234 && BT.state.lifetime === l + 1234;
      var b = BT.money.spend(m + 1234 + 1, 'check') === false && BT.money.spend(1234, 'check') === true;
      BT.state.money = m; BT.state.lifetime = l; BT.save();
      return a && b && BT.fmt(1234) === '$1,234' && BT.fmt(0) === '$0';
    } },
    { name: 'rng helpers stay in range', fn: function () {
      for (var i = 0; i < 200; i++) { var r = BT.rand(3, 7); if (r < 3 || r > 7) return false; }
      return BT.shuffle([1, 2, 3]).length === 3 && [1, 2, 3].indexOf(BT.pick([1, 2, 3])) >= 0;
    } },
    { name: 'events capped at 5000', fn: function () {
      var keep = BT.state.events;
      BT.state.events = [];
      for (var i = 0; i < 5005; i++) BT.state.events.push({ t: '', type: 'x', data: null });
      BT.log.event('cap', null);
      var ok = BT.state.events.length === 5000 && BT.state.events[4999].type === 'cap';
      BT.state.events = keep; BT.save();
      return ok;
    } },
    { name: 'every spec screen exists and show() switches exactly one', fn: function () {
      if (!BT.SCREENS.every(function (id) { return !!BT.screen.el(id); })) return false;
      var before = BT.screen.current;
      BT.screen.show('town');
      var ok = document.querySelectorAll('.screen.active').length === 1 && BT.screen.el('town').classList.contains('active');
      if (before) BT.screen.show(before);
      return ok;
    } },
    { name: 'esc and el', fn: function () {
      var e = BT.el('div', { class: 'x', data: { k: 'v' } }, ['a', BT.el('b', { text: '<' })]);
      return BT.esc('<a href="x">&') === '&lt;a href=&quot;x&quot;&gt;&amp;' && e.dataset.k === 'v' && e.children.length === 1 && e.textContent === 'a<';
    } }
  ]);

  // ---------- version check (hosted copies reload once when stale) ----------
  BT.version = (function () {
    var v = document.querySelector('.ver');
    return v ? v.textContent.trim() : '';
  })();
  (function versionCheck() {
    var h = location.hostname;
    if (!/^https?:$/.test(location.protocol) || h === 'localhost' || h === '127.0.0.1' || params.has('v')) return;
    var base = location.pathname.replace(/[^/]*$/, '');
    fetch(base + 'version.txt?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
      t = t.trim();
      if (t && BT.version && t !== BT.version) location.replace(location.pathname + '?v=' + encodeURIComponent(t));
    }).catch(function () { /* offline: play on */ });
  })();
})();
