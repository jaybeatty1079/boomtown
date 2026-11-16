// BT.jobs: the job board (block map with pins + job list), job intro card, tiers, promotions, pay.
// API: BT.jobs.open(), BT.jobs.tierFor(lifetime), BT.jobs.promote(jobId), BT.jobs.payFor(job, jobLevel), BT.jobs.byId(id).
(function () {
  'use strict';
  var BT = window.BT, el = BT.el;
  BT.jobs = BT.jobs || {};
  var jobs = BT.jobs;

  // pure: which tier a lifetime total unlocks (1..4). The board uses BT.tier(), which also honors ?test=1.
  jobs.tierFor = function (lifetime) {
    var t = 1;
    for (var i = 1; i < BT.TIERS.length; i++) if (lifetime >= BT.TIERS[i]) t = i + 1;
    return t;
  };
  jobs.payFor = function (job, jobLevel) { return Math.round(job.pay * (1 + 0.25 * ((jobLevel || 1) - 1))); };
  jobs.byId = function (id) { return jobs.data.find(function (j) { return j.id === id; }) || null; };
  jobs.levelOf = function (id) { var e = BT.state.jobs[id]; return e ? e.level : 1; };
  // Called when a work day at this job ends. First finish records level 1; each finish after that promotes (max 5).
  jobs.promote = function (jobId) {
    var e = BT.state.jobs[jobId];
    var promoted = false;
    if (!e) e = BT.state.jobs[jobId] = { times: 0, level: 1, lastPlayed: null };
    else if (e.level < 5) { e.level++; promoted = true; }
    e.times++;
    e.lastPlayed = new Date().toISOString();
    if (promoted) BT.log.event('promotion', { jobId: jobId, level: e.level });
    BT.save();
    return { level: e.level, promoted: promoted, times: e.times };
  };

  var style = document.createElement('style');
  style.textContent =
    '.jobs-map{width:min(100%,700px);margin:0 auto;flex:none}' +
    '.jobs-list{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));padding:4px 2px 12px}' +
    '.jobs-tier{grid-column:1/-1;font-weight:700;margin:6px 0 -2px;display:flex;gap:8px;align-items:center}' +
    '.job-chip{-webkit-appearance:none;appearance:none;border:3px solid rgba(0,0,0,.15);border-radius:16px;min-height:64px;padding:8px 12px;display:flex;gap:10px;align-items:center;text-align:left;background:var(--paper);color:var(--ink);font-weight:700;box-shadow:0 4px 0 var(--edge);cursor:pointer;font-size:1rem}' +
    '.job-chip:active{transform:translateY(4px);box-shadow:0 0 0 var(--edge)}' +
    '.job-chip .ico{font-size:1.8rem;width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:12px}' +
    '.job-chip small{display:block;font-weight:600;opacity:.75;font-size:.85rem}' +
    '.job-chip.locked{background:#d9dde3;color:#5a6270;filter:saturate(.2)}' +
    '.job-intro .ico{font-size:3.4rem;line-height:1;text-align:center;width:88px;height:88px;display:grid;place-items:center;border-radius:20px;margin:0 auto 8px}' +
    '.job-intro ul{margin:6px 0 0;padding-left:22px;line-height:1.5}' +
    '.job-intro .stars{letter-spacing:2px;color:#c99a1a;font-size:1.3rem}';
  document.head.appendChild(style);

  function modal(children) {
    var box = el('div', { class: 'modal-box job-intro' }, children);
    // pointerdown, not click: Safari synthesizes a click after a touch, which would land on this backdrop and close the card the tap just opened
    var m = el('div', { class: 'modal', onpointerdown: function (e) { if (e.target === m) m.remove(); } }, box);
    document.body.appendChild(m);
    return m;
  }
  function stateName(abbr) {
    var s = (BT.states || []).find(function (x) { return x.abbr === abbr; });
    return s ? s.name : abbr;
  }
  function accent(job) { var e = BT.state.jobs[job.id]; return (e && e.accent) || job.color; }
  function unlockedTier() { return BT.tier(BT.state.lifetime); }

  // The intro card: title, city, state, what you do, pay for the day, promotion level, Clock in.
  jobs.intro = function (job) {
    if (typeof job === 'string') job = jobs.byId(job);
    if (!job) return null;
    var lvl = jobs.levelOf(job.id), pay = jobs.payFor(job, lvl);
    var m = modal([
      el('div', { class: 'ico', text: job.icon, style: { background: accent(job) } }),
      el('h2', { class: 'center', text: job.title, style: { margin: '0 0 2px' } }),
      el('div', { class: 'center muted', text: job.city + ', ' + stateName(job.state) }),
      el('p', { text: job.intro, style: { lineHeight: '1.45' } }),
      el('div', null, [el('strong', { text: 'Today you will:' }), el('ul', null, job.tasks.map(function (t) { return el('li', { text: t }); }))]),
      el('div', { class: 'hud', style: { marginTop: '10px' } }, [
        el('span', { class: 'pill gold', text: BT.fmt(pay) + ' a round, about ' + BT.fmt(pay * 6) + ' a day' }),
        el('span', { class: 'pill violet', html: 'Level ' + lvl + ' <span class="stars">' + '★'.repeat(lvl) + '☆'.repeat(5 - lvl) + '</span>' })
      ]),
      el('div', { class: 'btn-row', style: { marginTop: '14px' } }, [
        el('button', { class: 'btn btn-big gold', type: 'button', text: 'Clock in', onclick: function () {
          BT.sfx.click(); m.remove();
          BT.log.event('job_pick', { jobId: job.id, level: lvl });
          if (BT.session && typeof BT.session.start === 'function') BT.session.start(job);
          else BT.toast('The work day opens soon', 'info');
        } }),
        el('button', { class: 'btn ghost', type: 'button', text: 'Not today', onclick: function () { BT.sfx.click(); m.remove(); } })
      ])
    ]);
    return m;
  };

  function chooser(list) {
    var m = modal([
      el('h2', { class: 'center', text: 'Which job?' }),
      el('div', { class: 'stack' }, list.map(function (j) { return chip(j, false, function () { m.remove(); jobs.intro(j); }); }))
    ]);
  }
  function chip(job, locked, onTap) {
    var lvl = jobs.levelOf(job.id);
    var sub = locked ? 'Unlocks at ' + BT.fmt(BT.TIERS[job.tier - 1])
      : job.city + ', ' + job.state + ' · ' + BT.fmt(jobs.payFor(job, lvl)) + ' a round' + (lvl > 1 ? ' · Lv ' + lvl : '');
    return el('button', { class: 'job-chip' + (locked ? ' locked' : ''), type: 'button', data: { job: job.id }, onclick: function () {
      BT.sfx.click();
      if (locked) { BT.toast('Earn ' + BT.fmt(BT.TIERS[job.tier - 1]) + ' in all to unlock this job', 'info'); return; }
      onTap(job);
    } }, [
      el('span', { class: 'ico', text: locked ? '🔒' : job.icon, style: { background: locked ? '#b9c0c9' : accent(job) } }),
      el('span', null, [job.title, el('small', { text: sub })])
    ]);
  }

  jobs.render = function () {
    var root = BT.screen.el('jobs');
    if (!root) return;
    var tier = unlockedTier();
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'screen-head' }, [
      el('button', { class: 'btn btn-sm stone', type: 'button', text: '← Home', onclick: function () { BT.sfx.click(); BT.screen.show('home'); } }),
      el('h2', { text: 'Job Board' }),
      el('span', { class: 'pill sky', text: tier >= 4 ? 'All jobs open' : 'Tier ' + tier + ' · next at ' + BT.fmt(BT.TIERS[tier]) })
    ]));
    var body = el('div', { class: 'scroll', style: { flex: '1' } });
    root.appendChild(body);

    if (BT.usmap && typeof BT.usmap.render === 'function') {
      var map = el('div', { class: 'jobs-map' });
      body.appendChild(map);
      try {
        BT.usmap.render(map, {
          labels: true,
          pins: jobs.data.map(function (j) { var lk = j.tier > tier; return { abbr: j.state, label: lk ? '🔒' : j.icon, color: accent(j), locked: lk }; }),
          highlight: BT.state.character && BT.state.character.homeState ? [BT.state.character.homeState] : [],
          onTap: function (abbr) {
            var open = jobs.data.filter(function (j) { return j.state === abbr && j.tier <= tier; });
            var locked = jobs.data.filter(function (j) { return j.state === abbr && j.tier > tier; });
            if (open.length === 1) jobs.intro(open[0]);
            else if (open.length > 1) chooser(open);
            else if (locked.length) BT.toast('Earn ' + BT.fmt(BT.TIERS[locked[0].tier - 1]) + ' in all to unlock ' + locked[0].title, 'info');
            else BT.toast('No jobs in ' + stateName(abbr) + ' yet', 'info');
          }
        });
      } catch (e) { console.warn('usmap.render failed', e); map.remove(); }
    }
    var list = el('div', { class: 'jobs-list' });
    [1, 2, 3, 4].forEach(function (t) {
      var locked = t > tier;
      list.appendChild(el('div', { class: 'jobs-tier' }, [
        el('span', { text: 'Tier ' + t }),
        el('span', { class: 'muted', text: locked ? '🔒 unlocks at ' + BT.fmt(BT.TIERS[t - 1]) : (t === 1 ? 'open to everyone' : 'unlocked') })
      ]));
      jobs.data.filter(function (j) { return j.tier === t; }).forEach(function (j) { list.appendChild(chip(j, locked, jobs.intro)); });
    });
    body.appendChild(list);
  };

  jobs.open = function () { BT.screen.show('jobs'); };
  document.addEventListener('bt:screen', function (e) { if (e.detail.id === 'jobs') jobs.render(); });

  var RANGES = { 1: [18, 25], 2: [35, 50], 3: [70, 95], 4: [140, 180] };
  BT.registerChecks('jobs', [
    { name: '28 jobs, tiers 8/8/7/5', fn: function () {
      var c = { 1: 0, 2: 0, 3: 0, 4: 0 };
      jobs.data.forEach(function (j) { c[j.tier]++; });
      return jobs.data.length === 28 && c[1] === 8 && c[2] === 8 && c[3] === 7 && c[4] === 5;
    } },
    { name: 'every job has the required fields and unique id', fn: function () {
      var ids = {};
      return jobs.data.every(function (j) {
        if (ids[j.id]) return false; ids[j.id] = 1;
        return ['id', 'title', 'city', 'state', 'kind', 'color', 'intro', 'icon'].every(function (k) { return typeof j[k] === 'string' && j[k]; }) &&
          typeof j.tier === 'number' && typeof j.pay === 'number' && Array.isArray(j.tasks) && j.tasks.length === 3 &&
          Array.isArray(j.focus) && j.focus.length >= 2 && j.focus.length <= 3 && /^#[0-9a-f]{6}$/i.test(j.color);
      });
    } },
    { name: 'every focus subject is one of the eight, each subject in 5+ jobs', fn: function () {
      var n = {};
      var ok = jobs.data.every(function (j) { return j.focus.every(function (s) { n[s] = (n[s] || 0) + 1; return BT.SUBJECTS.indexOf(s) >= 0; }); });
      return ok && BT.SUBJECTS.every(function (s) { return n[s] >= 5; });
    } },
    { name: 'pay in tier range', fn: function () {
      return jobs.data.every(function (j) { return j.pay >= RANGES[j.tier][0] && j.pay <= RANGES[j.tier][1]; });
    } },
    { name: 'states are real, 20+ distinct, all four regions', fn: function () {
      var seen = {}, regions = {};
      var ok = jobs.data.every(function (j) {
        var s = (BT.states || []).find(function (x) { return x.abbr === j.state; });
        if (!s) return false; seen[j.state] = 1; regions[s.region] = 1; return true;
      });
      return ok && Object.keys(seen).length >= 20 && Object.keys(regions).length === 4;
    } },
    { name: 'tierFor thresholds and payFor math', fn: function () {
      return jobs.tierFor(0) === 1 && jobs.tierFor(999) === 1 && jobs.tierFor(1000) === 2 && jobs.tierFor(4000) === 3 && jobs.tierFor(12000) === 4 &&
        jobs.payFor({ pay: 20 }, 1) === 20 && jobs.payFor({ pay: 20 }, 3) === 30 && jobs.payFor({ pay: 20 }, 5) === 40;
    } },
    { name: 'promote: first finish level 1, then +1 each, max 5', fn: function () {
      var keep = BT.state.jobs['austin-bakery'];
      delete BT.state.jobs['austin-bakery'];
      var a = jobs.promote('austin-bakery'), b = jobs.promote('austin-bakery');
      for (var i = 0; i < 6; i++) jobs.promote('austin-bakery');
      var c = BT.state.jobs['austin-bakery'];
      if (keep) BT.state.jobs['austin-bakery'] = keep; else delete BT.state.jobs['austin-bakery'];
      BT.save();
      return a.level === 1 && !a.promoted && b.level === 2 && b.promoted && c.level === 5 && c.times === 8;
    } },
    { name: 'board renders a chip per job and the intro card opens', fn: function () {
      var before = BT.screen.current;
      jobs.open();
      var chips = BT.screen.el('jobs').querySelectorAll('.job-chip').length === 28;
      var m = jobs.intro('denver-vet');
      var ok = chips && m && m.textContent.indexOf('Pet Vet Helper') >= 0 && m.textContent.indexOf('Clock in') >= 0;
      m.remove();
      if (before) BT.screen.show(before);
      return ok;
    } }
  ]);
})();
