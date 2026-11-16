// Boot: load -> unlock audio on first pointerdown (sfx.js) -> no character ? creator : home. Home screen wiring, Parent long-press, test panel.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;

  function go(id) {
    BT.sfx.click();
    var mod = BT[id];
    if (mod && typeof mod.open === 'function') mod.open(); else BT.screen.show(id);
  }

  function localDay(iso) { // local calendar day of an ISO stamp, same shape as BT.today()
    var d = new Date(iso);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function dayNumber() {
    var days = {}, today = BT.today();
    BT.state.sessions.forEach(function (s) { if (s.start) days[localDay(s.start)] = 1; });
    days[today] = 1;
    return Object.keys(days).length;
  }

  function renderHome() {
    var s = BT.state;
    var money = document.getElementById('home-money'), streak = document.getElementById('home-streak'), day = document.getElementById('home-day');
    var av = document.getElementById('home-avatar');
    if (money) money.textContent = BT.fmt(s.money);
    if (streak) streak.textContent = (s.streak.days || 0) + ' day streak';
    if (day) day.textContent = 'Day ' + dayNumber();
    if (av) av.innerHTML = s.character && BT.character && BT.character.svg ? BT.character.svg(120) : BT.avatarFallback(120);
  }

  function showCharacter() { BT.character.open(); }

  function wireParentButton() {
    var btn = document.getElementById('btn-parent');
    if (!btn) return;
    var timer = null, fired = false, HOLD = BT.TEST ? 150 : 1500;
    function cancel() {
      btn.classList.remove('holding');
      if (timer) { clearTimeout(timer); timer = null; }
      if (!fired) { btn.classList.remove('wiggle'); void btn.offsetWidth; btn.classList.add('wiggle'); }
    }
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (timer) return; // second finger must not orphan the first hold timer
      fired = false; btn.classList.add('holding');
      timer = setTimeout(function () {
        fired = true; timer = null; btn.classList.remove('holding');
        BT.report.open();
      }, HOLD);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { btn.addEventListener(t, cancel); });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function wireHome() {
    document.getElementById('btn-work').addEventListener('click', function () {
      BT.sfx.click();
      BT.jobs.open();
    });
    document.querySelectorAll('.home-nav [data-go]').forEach(function (b) {
      b.addEventListener('click', function () { go(b.dataset.go); });
    });
    var homeSaid = false; // 'home' once per launch, the first time home shows with a character
    document.addEventListener('bt:screen', function (e) {
      if (e.detail.id !== 'home') return;
      renderHome();
      if (!homeSaid && BT.state.character) { homeSaid = true; BT.voice.say('home'); }
    });
    document.addEventListener('bt:hud', function () { if (BT.screen.current === 'home') renderHome(); });
  }

  function testPanel() {
    var panel = el('div', { id: 'test-panel', class: 'card', style: { display: 'none' } });
    var out = el('pre');
    panel.appendChild(el('div', { class: 'btn-row', style: { justifyContent: 'flex-start' } }, [
      el('button', { class: 'btn btn-sm mint', type: 'button', text: 'Run checks', onclick: function () {
        var f = BT.test.run();
        out.textContent = (BT.test.checks.length - f.length) + '/' + BT.test.checks.length + ' checks pass' +
          (f.length ? '\n' + f.map(function (x) { return 'FAIL ' + x.name + ': ' + x.error; }).join('\n') : '');
      } }),
      el('button', { class: 'btn btn-sm gold', type: 'button', text: '+$500', onclick: function () { BT.money.add(500, 'test'); BT.coinFly(); } }),
      el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Confetti', onclick: function () { BT.confetti(); BT.sfx.fanfare(); } }),
      el('button', { class: 'btn btn-sm coral', type: 'button', text: 'Reset', onclick: function () { BT.reset(); location.reload(); } })
    ]));
    panel.appendChild(el('div', { class: 'row', style: { marginTop: '8px' } }, BT.SCREENS.map(function (id) {
      return el('button', { class: 'btn btn-sm stone', type: 'button', text: id, onclick: function () { go(id); } });
    })));
    panel.appendChild(out);
    document.body.appendChild(panel);
    document.body.appendChild(el('button', { id: 'test-toggle', class: 'btn btn-sm ink', type: 'button', text: 'test', onclick: function () {
      panel.style.display = panel.style.display === 'none' ? '' : 'none';
    } }));
  }

  // Day streak must follow play, not just launch: an iPad home-screen app stays open across midnight, and import/reset replace the state.
  function wrapTouchDay(obj, key, after) {
    var orig = obj[key];
    obj[key] = function () {
      if (!after) BT.touchDay();
      var r = orig.apply(this, arguments);
      if (after) BT.touchDay();
      return r;
    };
  }
  wrapTouchDay(BT.session, 'start', false);
  wrapTouchDay(BT, 'importCode', true);
  wrapTouchDay(BT, 'reset', true);

  function boot() {
    BT.load();
    BT.hud(); // no touchDay here: the streak moves with play (session start), not with launch
    wireHome();
    wireParentButton();
    if (BT.TEST) testPanel();
    if (BT.state.character && BT.state.character.name) BT.screen.show('home');
    else { showCharacter(); BT.voice.say('welcome'); }
  }

  BT.main = { boot: boot, renderHome: renderHome, showCharacter: showCharacter, go: go, dayNumber: dayNumber, localDay: localDay };

  BT.registerChecks('main', [
    { name: 'exactly one active screen after boot and top bar shows money', fn: function () {
      return document.querySelectorAll('.screen.active').length === 1 &&
        document.getElementById('topbar-money').textContent === BT.fmt(BT.state.money);
    } },
    { name: 'reset and import touch the day so the streak counts today', fn: function () {
      var keep = BT.exportCode(), today = BT.today();
      try {
        BT.reset();
        var a = BT.state.streak.lastDay === today && BT.state.streak.days === 1;
        BT.state.streak = { days: 4, lastDay: '2020-01-01' };
        var ok = BT.importCode(BT.exportCode());
        var b = ok && BT.state.streak.lastDay === today && BT.state.streak.days === 1;
        return a && b;
      } finally { BT.importCode(keep); }
    } },
    { name: 'an evening session counts on its local day, not the next UTC day', fn: function () {
      var keep = BT.state.sessions, n = new Date(), before = dayNumber();
      try {
        BT.state.sessions = keep.concat([{ start: new Date(n.getFullYear(), n.getMonth(), n.getDate(), 20, 0).toISOString() }]);
        return dayNumber() === before && localDay(BT.state.sessions[BT.state.sessions.length - 1].start) === BT.today();
      } finally { BT.state.sessions = keep; }
    } },
    { name: 'home renders day label and stats', fn: function () {
      renderHome();
      return /^Day \d+$/.test(document.getElementById('home-day').textContent) && document.getElementById('home-money').textContent === BT.fmt(BT.state.money);
    } }
  ]);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
