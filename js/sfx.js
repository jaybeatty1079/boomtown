// BT.sfx: synthesized WebAudio sounds. No audio files. Unlocked on the first pointerdown; silent when settings.sound is off.
(function () {
  'use strict';
  var BT = window.BT;
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;

  function unlock() {
    if (!AC) return;
    if (!ctx) ctx = new AC();
    // iOS parks the context as 'interrupted'/'suspended' after lock, app switch, Siri or a call and never resumes it alone
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(function () {});
  }
  // Persistent (not once): every tap is a chance to resume after an iOS interruption
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && ctx) unlock(); });

  function on() {
    if (!ctx || !BT.state || !BT.state.settings || BT.state.settings.sound === false) return false;
    if (ctx.state !== 'running') { unlock(); return false; } // resume now; the next sound plays
    return true;
  }

  // One note: freq in Hz, type osc wave, at = seconds from now, dur seconds, gain 0..1, slide = end freq
  function tone(freq, type, at, dur, gain, slide) {
    var t0 = ctx.currentTime + (at || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function play(fn) { return function () { if (on()) { try { fn(); } catch (e) { /* audio hiccup: ignore */ } } }; }

  BT.sfx = {
    unlock: unlock,
    get ctx() { return ctx; }, // music.js hangs its gain nodes on the same context
    good: play(function () { tone(523, 'square', 0, 0.12, 0.15); tone(784, 'square', 0.1, 0.18, 0.15); }),
    bad: play(function () { tone(220, 'sawtooth', 0, 0.25, 0.12, 110); }),
    coin: play(function () { tone(1320, 'square', 0, 0.07, 0.12); tone(1760, 'square', 0.07, 0.16, 0.12); }),
    click: play(function () { tone(900, 'square', 0, 0.04, 0.08); }),
    build: play(function () { tone(140, 'square', 0, 0.12, 0.2, 60); tone(90, 'triangle', 0.05, 0.15, 0.2); }),
    fanfare: play(function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 'square', i * 0.12, 0.2, 0.14); });
      tone(1047, 'triangle', 0.5, 0.5, 0.14);
    })
  };

  BT.registerChecks('sfx', [
    { name: 'all six sounds exist and never throw before unlock', fn: function () {
      ['good', 'bad', 'coin', 'click', 'build', 'fanfare'].forEach(function (k) { BT.sfx[k](); });
      return true;
    } },
    { name: 'unlock is repeatable: two taps and two direct calls never throw', fn: function () {
      BT.sfx.unlock(); BT.sfx.unlock();
      document.dispatchEvent(new Event('pointerdown')); document.dispatchEvent(new Event('pointerdown'));
      document.dispatchEvent(new Event('visibilitychange'));
      BT.sfx.click();
      return true;
    } }
  ]);
})();
