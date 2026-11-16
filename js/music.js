// BT.music: three looping CC0 tracks (music/CREDITS.md) driven by bt:screen. One HTMLAudioElement per track, made lazily,
// never played before the first pointerdown (iPad), 350 ms volume ramps, 40% duck while a voice clip plays, paused while hidden.
// Honors settings.sound and settings.music. In test mode (BT.test.fast) it tracks `current` but touches no audio element.
(function () {
  'use strict';
  var BT = window.BT;
  var TRACKS = {
    calm: { src: 'music/forest-8bit.m4a', vol: 0.30 },
    work: { src: 'music/mountain-stage.m4a', vol: 0.25 },
    'break': { src: 'music/action-1.m4a', vol: 0.35 }
  };
  // every screen id in index.html; null = silence (payday and report keep the fanfare sfx alone)
  var MAP = { home: 'calm', character: 'calm', jobs: 'calm', town: 'calm', shop: 'calm', bookstop: 'calm', settings: 'calm',
    round: 'work', 'break': 'break', payday: null, report: null };
  var els = {}, want = null, current = null, unlocked = false, ducked = false;

  function on() { var s = BT.state && BT.state.settings; return !!s && s.sound !== false && s.music !== false; }
  function audio(name) {
    if (!els[name]) {
      var a = new Audio(TRACKS[name].src); a.loop = true; a.preload = 'auto'; a.volume = 0; els[name] = a;
      // iPadOS ignores HTMLMediaElement.volume (always 1), so fades and ducking go through a WebAudio gain instead
      var ctx = BT.sfx && BT.sfx.ctx;
      if (ctx && ctx.createMediaElementSource) {
        try { var g = ctx.createGain(); g.gain.value = 0; ctx.createMediaElementSource(a).connect(g); g.connect(ctx.destination); a._gain = g; a.volume = 1; }
        catch (e) { /* no graph: fall back to a.volume */ }
      }
    }
    return els[name];
  }
  function level(a, v) { // get (v undefined) or set a track's level, through the gain node when it has one
    if (a._gain) { if (v !== undefined) a._gain.gain.value = v; return a._gain.gain.value; }
    if (v !== undefined) { try { a.volume = v; } catch (e) { /* iOS may refuse */ } }
    return a.volume;
  }
  function target(name) { return TRACKS[name].vol * (ducked ? 0.4 : 1); }
  function ramp(a, to, then) { // 350 ms linear level ramp; a new ramp on the same element cancels the old one
    clearInterval(a._ramp);
    var from = level(a), t0 = performance.now();
    a._ramp = setInterval(function () {
      var k = Math.min(1, (performance.now() - t0) / 350);
      level(a, from + (to - from) * k);
      if (k >= 1) { clearInterval(a._ramp); a._ramp = null; if (then) then(); }
    }, 40);
  }
  // Make what is playing match `want`, the settings and visibility.
  function apply() {
    var name = on() && !document.hidden ? want : null;
    current = name;
    if (!unlocked || (BT.test && BT.test.fast)) return;
    Object.keys(els).forEach(function (k) {
      var a = els[k];
      if (k !== name && !a.paused) ramp(a, 0, function () { a.pause(); });
    });
    if (name) {
      var a = audio(name);
      if (a.paused) { level(a, 0); var p = a.play(); if (p && p.catch) p.catch(function () { /* not allowed yet: next gesture */ }); }
      ramp(a, target(name));
    }
  }
  function play(name) { want = name && TRACKS[name] ? name : null; apply(); }

  // Chain onto the same first gesture sfx.js uses: unlock, preload all three, start whatever the screen wants.
  document.addEventListener('pointerdown', function () {
    if (unlocked) { apply(); return; } // a later tap also restarts music after an iOS interruption
    unlocked = true;
    if (!(BT.test && BT.test.fast)) Object.keys(TRACKS).forEach(function (k) { audio(k).load(); });
    apply();
  }, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) Object.keys(els).forEach(function (k) { clearInterval(els[k]._ramp); els[k].pause(); });
    else apply();
  });
  document.addEventListener('bt:screen', function (e) {
    var id = e.detail.id, track = MAP[id];
    if (id === 'round' && e.detail.opts && e.detail.opts.subject === 'reading') track = null; // she is reading
    play(track);
  });

  BT.music = {
    play: play,
    stop: function () { play(null); },
    duck: function (on) { ducked = !!on; if (current && els[current]) ramp(els[current], target(current)); },
    enabled: function () { return !BT.state || !BT.state.settings || BT.state.settings.music !== false; },
    setEnabled: function (b) { BT.state.settings.music = !!b; BT.save(); apply(); },
    refresh: apply, // settings.js calls this when sound effects are switched
    tracks: TRACKS, map: MAP,
    get current() { return current; }
  };

  BT.registerChecks('music', [
    { name: 'track map covers every screen id in index.html', fn: function () {
      var ids = Array.prototype.map.call(document.querySelectorAll('section.screen'), function (s) { return s.id.replace(/^screen-/, ''); });
      BT.test.assert(ids.length === BT.SCREENS.length, 'screens in html: ' + ids.length);
      return ids.every(function (id) { return Object.prototype.hasOwnProperty.call(MAP, id); }) &&
        Object.keys(MAP).every(function (id) { return MAP[id] === null || !!TRACKS[MAP[id]]; });
    } },
    { name: 'screen changes pick the track; reading round and payday are silent; sound off silences all', fn: function () {
      var before = BT.screen.current, keepM = BT.state.settings.music, keepS = BT.state.settings.sound;
      BT.state.settings.music = true; BT.state.settings.sound = true;
      BT.screen.show('round', { subject: 'money' }); var a = current === 'work';
      BT.screen.show('round', { subject: 'reading' }); var b = current === null;
      BT.screen.show('break'); var c = current === 'break';
      BT.screen.show('payday'); var d = current === null;
      BT.screen.show('home'); var e = current === 'calm';
      BT.state.settings.sound = false; apply(); var f = current === null;
      BT.state.settings.sound = true; BT.state.settings.music = false; apply(); var g = current === null;
      BT.state.settings.music = keepM; BT.state.settings.sound = keepS;
      if (before) BT.screen.show(before); else play(null);
      return a && b && c && d && e && f && g;
    } }
  ]);
})();
