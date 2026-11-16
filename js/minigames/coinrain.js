// BT.minigames.coinrain: drag a basket along the bottom; catch coins (+1) and the rare gold bar (+5), avoid anvils (-3).
// Uses BT.minigames.timedCanvas from delivery.js (loaded before this file) for the canvas, HUD, timer, end card and pay.
BT.minigames = BT.minigames || {};
(function () {
  'use strict';
  var BT = window.BT;
  var INK = '#1e2430', PAPER = '#fff8e7', GOLD = '#ffcf3f', GRASS = '#5fcf5a', CORAL = '#ff6b6b';
  function sfx(name) { try { if (BT.sfx && BT.sfx[name]) BT.sfx[name](); } catch (e) { /* audio not unlocked yet */ } }
  var VALUE = { coin: 1, bar: 5, anvil: -3 };
  var C = BT.minigames.coinrain = BT.minigames.coinrain || {};
  C.scoreAfter = function (kind, score) { return Math.max(0, score + (VALUE[kind] || 0)); };

  C.start = function (container, ctx) {
    var bx = null, items = [], spawnIn = 0.3, dragging = false, wobble = 0, clouds = [];
    for (var i = 0; i < 5; i++) clouds.push({ x: BT.rng(), y: 0.12 + BT.rng() * 0.3, s: 0.6 + BT.rng() * 0.8 });
    function geom(api) { var bw = Math.max(96, Math.min(150, api.w * 0.2)); var bh = bw * 0.55; return { bw: bw, bh: bh, by: api.h - 32 - bh }; }
    function setX(px, api) { var gm = geom(api); bx = Math.max(gm.bw / 2, Math.min(api.w - gm.bw / 2, px)); }
    var game = {
      update: function (dt, api) {
        var gm = geom(api);
        if (bx == null) bx = api.w / 2;
        if (wobble > 0) wobble -= dt;
        var ramp = 1 + (60 - api.timeLeft) / 40;                        // falls get faster over the minute
        spawnIn -= dt * ramp;
        if (spawnIn <= 0) {
          var r = BT.rng(), kind = r < 0.72 ? 'coin' : r < 0.8 ? 'bar' : 'anvil';
          items.push({ kind: kind, x: 30 + BT.rng() * (api.w - 60), y: -40, vy: (180 + BT.rng() * 90) * ramp, spin: BT.rng() * 6 });
          spawnIn = 0.45 + BT.rng() * 0.35;
        }
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i]; it.y += it.vy * dt; it.spin += dt * 4;
          var half = it.kind === 'anvil' ? 26 : 18;
          if (it.y + half >= gm.by && it.y - half <= gm.by + gm.bh && Math.abs(it.x - bx) < gm.bw / 2 + half * 0.4) {
            api.score = C.scoreAfter(it.kind, api.score);
            if (it.kind === 'anvil') { sfx('bad'); api.flash(CORAL); wobble = 0.6; }
            else { sfx('coin'); api.flash(GOLD); }
            items.splice(i, 1);
          } else if (it.y > api.h + 60) items.splice(i, 1);
        }
      },
      draw: function (g, api) {
        var w = api.w, h = api.h, gm = geom(api);
        var sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#4fb3f5'); sky.addColorStop(1, '#bfe6ff');
        g.fillStyle = sky; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(255,255,255,.85)';
        clouds.forEach(function (c) { var cx = c.x * w, cy = c.y * h, s = c.s * 40; g.fillRect(cx - s, cy, s * 2, s * 0.6); g.fillRect(cx - s * 0.5, cy - s * 0.4, s, s * 0.5); });
        g.fillStyle = GRASS; g.fillRect(0, h - 28, w, 28); g.fillStyle = '#8b5a2b'; g.fillRect(0, h - 10, w, 10);
        items.forEach(function (it) {
          g.save(); g.translate(it.x, it.y);
          if (it.kind === 'coin') {
            var sq = Math.abs(Math.cos(it.spin));
            g.fillStyle = '#d9a500'; g.beginPath(); g.ellipse(0, 0, 18 * Math.max(0.25, sq), 18, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = GOLD; g.beginPath(); g.ellipse(-2, -2, 15 * Math.max(0.2, sq), 15, 0, 0, Math.PI * 2); g.fill();
            if (sq > 0.5) { g.fillStyle = '#b07d00'; g.font = '700 20px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 1); }
          } else if (it.kind === 'bar') {
            g.rotate(Math.sin(it.spin) * 0.3);
            g.fillStyle = '#b07d00'; g.fillRect(-26, -11, 52, 24);
            g.fillStyle = GOLD; g.fillRect(-26, -13, 52, 20);
            g.fillStyle = '#fff3b0'; g.fillRect(-20, -10, 18, 5);
          } else {
            g.fillStyle = '#2b3140'; g.fillRect(-14, 4, 28, 18); g.fillRect(-26, -22, 52, 20);
            g.fillStyle = '#444d5e'; g.fillRect(-26, -22, 52, 6);
            g.fillStyle = '#1a1f2a'; g.fillRect(-22, 22, 44, 6);
          }
          g.restore();
        });
        var x = bx == null ? w / 2 : bx, tilt = wobble > 0 ? Math.sin(wobble * 30) * 0.15 : 0;
        g.save(); g.translate(x, gm.by); g.rotate(tilt);
        g.fillStyle = '#a66a2e'; g.beginPath(); g.moveTo(-gm.bw / 2, 0); g.lineTo(gm.bw / 2, 0); g.lineTo(gm.bw * 0.4, gm.bh); g.lineTo(-gm.bw * 0.4, gm.bh); g.closePath(); g.fill();
        g.fillStyle = '#7a4a1c'; g.fillRect(-gm.bw / 2, -6, gm.bw, 12);
        g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 3;
        for (var k = 1; k < 4; k++) { g.beginPath(); g.moveTo(-gm.bw / 2 + 6, gm.bh * k / 4); g.lineTo(gm.bw / 2 - 6, gm.bh * k / 4); g.stroke(); }
        g.restore();
        if (!api.running && api.timeLeft === 60) { g.fillStyle = INK; g.font = '700 ' + Math.min(28, w / 16) + 'px Fredoka, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('Drag the basket · catch coins and gold bars · dodge anvils', w / 2, gm.by - 36); }
      },
      onDown: function (px, py, api) { dragging = true; setX(px, api); },
      onMove: function (px, py, api) { if (dragging) setX(px, api); },
      onUp: function () { dragging = false; },
      auto: function (api) { // a few moves: drag under the lowest non-anvil item, three times
        for (var k = 0; k < 3; k++) {
          var target = null;
          items.forEach(function (it) { if (it.kind !== 'anvil' && (!target || it.y > target.y)) target = it; });
          var tx = target ? target.x : 40 + BT.rng() * (api.w - 80);
          api.tap('pointerdown', api.w / 2, api.h - 60); api.tap('pointermove', tx, api.h - 60); api.tap('pointerup', tx, api.h - 60);
          game.update(0.05, api);
        }
      }
    };
    return BT.minigames.timedCanvas(container, ctx, game);
  };
  BT.registerMinigame('coinrain', { title: 'Coin Rain', icon: '🪙', blurb: 'Drag the basket to catch falling coins and gold bars. Anvils cost you 3 coins!', start: C.start });

  BT.registerChecks('coinrain', [
    { name: 'registered with start()', fn: function () { return typeof BT.registry.minigames.coinrain.start === 'function'; } },
    { name: 'coin +1, bar +5, anvil -3 floored at 0', fn: function () { return C.scoreAfter('coin', 0) === 1 && C.scoreAfter('bar', 1) === 6 && C.scoreAfter('anvil', 2) === 0 && C.scoreAfter('anvil', 7) === 4; } },
    { name: 'start renders a canvas and returns a promise', fn: function () {
      var host = BT.el('div');
      var p = C.start(host, { cap: 10 });
      return !!host.querySelector('canvas') && typeof p.then === 'function';
    } }
  ]);
})();
