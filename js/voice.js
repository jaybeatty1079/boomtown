// BT.voice: short spoken lines (voice/<key>.m4a, text in voice/lines.json; see voice/README.md) and read-aloud via speechSynthesis.
// A missing clip is skipped silently and never retried this session. One clip at a time, at most 2 waiting. Ducks BT.music.
// Honors settings.sound and settings.voice for say(); read() needs only settings.sound. In test mode (BT.test.fast) nothing plays:
// say() and read() push their key or text onto BT.test.spoken.
(function () {
  'use strict';
  var BT = window.BT;
  // every key the hooks in the other modules pass to say(); checked against lines.json below
  var USED = ['welcome', 'home', 'clockin', 'round_money', 'round_reading', 'round_words', 'round_science', 'round_geography',
    'round_logic', 'round_writing', 'round_design', 'correct', 'nice', 'gotit', 'brilliant', 'why', 'hint', 'break', 'onemore',
    'payday', 'promoted', 'unlocked', 'streak', 'stopping', 'bookstop', 'booksaved', 'town', 'nicebuild', 'sold', 'newhome',
    'vacation', 'notenough', 'countdown', 'timesup', 'collect'];
  var clips = {}, missing = {}, queue = [], playing = null, unlocked = false, pending = null, lines = null;
  var have = null; // keys with a clip on disk (voice/clips.json, written by split.py): no request for the others, so no 404 noise
  BT.test.spoken = BT.test.spoken || [];

  function soundOn() { var s = BT.state && BT.state.settings; return !!s && s.sound !== false; }
  function on() { return soundOn() && BT.state.settings.voice !== false; }
  function duck(b) { if (BT.music && BT.music.duck) BT.music.duck(b); }

  function start(key) {
    var a = clips[key];
    if (!a) { a = clips[key] = new Audio('voice/' + key + '.m4a'); a.preload = 'auto'; }
    var tok = { key: key };
    playing = tok;
    function done() { if (playing !== tok) return; playing = null; next(); }
    a.onerror = function () { missing[key] = true; delete clips[key]; done(); }; // 404 or bad file: skip for good
    a.onended = done;
    try { a.currentTime = 0; } catch (e) { /* not loaded yet: starts from 0 anyway */ }
    duck(true);
    var p = a.play();
    if (p && p.catch) p.catch(done); // not allowed / not supported: move on quietly
  }
  function next() {
    var k = queue.shift();
    if (k) start(k); else duck(false);
  }
  function say(key, opts) {
    opts = opts || {};
    if (BT.test && BT.test.fast) { BT.test.spoken.push(key); return; }
    if (!on() || missing[key] || (have && !have[key])) return;
    if (!unlocked || !have) { pending = key; return; } // iPad: the first gesture plays it; also waits for clips.json
    if (opts.interrupt) stop();
    if (playing) { if (queue.length < 2) queue.push(key); return; }
    start(key);
  }
  function stop() {
    queue = [];
    if (playing) { var a = clips[playing.key]; playing = null; if (a) { try { a.pause(); } catch (e) { /* ignore */ } } }
    duck(false);
  }
  function flush() { if (unlocked && have && pending) { var k = pending; pending = null; say(k); } }
  document.addEventListener('pointerdown', function () { if (!unlocked) { unlocked = true; flush(); } }, { passive: true });
  fetch('voice/clips.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (list) {
    have = {};
    (Array.isArray(list) ? list : []).forEach(function (k) { have[k] = true; });
    flush();
  });

  var synthVoice = null;
  function pickVoice() {
    if (synthVoice || !window.speechSynthesis) return synthVoice;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^en[-_]US/i.test(v.lang); });
    synthVoice = vs.filter(function (v) { return /samantha/i.test(v.name); })[0] || vs[0] || null;
    return synthVoice;
  }
  function read(text) {
    text = String(text || '').trim();
    if (!text) return;
    if (BT.test && BT.test.fast) { BT.test.spoken.push(text); return; }
    if (!window.speechSynthesis || !soundOn()) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.95; u.pitch = 1.05;
      var v = pickVoice(); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* no voices: stay quiet */ }
  }

  BT.voice = {
    say: say, read: read, stop: stop,
    enabled: function () { return !BT.state || !BT.state.settings || BT.state.settings.voice !== false; },
    setEnabled: function (b) { BT.state.settings.voice = !!b; BT.save(); if (!b) stop(); },
    used: USED,
    get queue() { return queue; },
    get have() { return have; },
    get lines() { return lines; }
  };

  // lines.json is fetched once for the check below (a failed fetch leaves lines null; the check then reports it)
  fetch('voice/lines.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { lines = j; }).catch(function () {});

  BT.registerChecks('voice', [
    { name: 'every key the hooks use exists in voice/lines.json', fn: function () {
      BT.test.assert(lines, 'voice/lines.json not loaded (yet)');
      var gone = USED.filter(function (k) { return typeof lines[k] !== 'string'; });
      BT.test.assert(!gone.length, 'missing: ' + gone.join(', '));
      return true;
    } },
    { name: 'say() and read() in test mode record to BT.test.spoken and play nothing', fn: function () {
      var keep = BT.test.fast, n = BT.test.spoken.length, had = Object.keys(clips).length;
      BT.test.fast = true;
      try { say('x-check'); read('read check'); } finally { BT.test.fast = keep; }
      var ok = BT.test.spoken.length === n + 2 && BT.test.spoken[n] === 'x-check' && BT.test.spoken[n + 1] === 'read check' && Object.keys(clips).length === had;
      BT.test.spoken.length = n;
      return ok;
    } }
  ]);
})();
