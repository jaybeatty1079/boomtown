// BT.minigames.minerush: a 6x8 grid of ore blocks; tap to mine (1-3 taps by hardness); 3 of the same ore in a row within 2 s is a combo.
// Uses BT.minigames.frame and BT.minigames.blockImage from blockstack.js (loads first).
(function () {
  'use strict';
  var BT = window.BT;
  var MG = BT.minigames = BT.minigames || {};
  var COLS = 6, ROWS = 8;
  var ORES = [
    { id: 'stone', tex: 'stone', hp: 1, val: 1, weight: 44, name: 'Stone' },
    { id: 'coal', tex: 'coal', hp: 1, val: 2, weight: 25, name: 'Coal' },
    { id: 'iron', tex: 'iron', hp: 2, val: 4, weight: 17, name: 'Iron' },
    { id: 'gold', tex: 'goldore', hp: 2, val: 8, weight: 10, name: 'Gold' },
    { id: 'diamond', tex: 'diamondore', hp: 3, val: 20, weight: 4, name: 'Diamond' }
  ];
  var TOTAL_W = ORES.reduce(function (a, o) { return a + o.weight; }, 0);
  function randOre() {
    var r = BT.rng() * TOTAL_W;
    for (var i = 0; i < ORES.length; i++) { r -= ORES[i].weight; if (r < 0) return ORES[i]; }
    return ORES[0];
  }
  function newBlock() { var o = randOre(); return { ore: o, hp: o.hp, spawn: 0, seed: Math.floor(BT.rng() * 1e6) }; }
  function newGrid() {
    var grid = [];
    for (var r = 0; r < ROWS; r++) { var row = []; for (var c = 0; c < COLS; c++) row.push(newBlock()); grid.push(row); }
    return grid;
  }
  // Pure: given the mine history [{ore, t}] (newest last), true when the last three share an ore and span <= 2000 ms.
  function isCombo(recent) {
    var n = recent.length;
    if (n < 3) return false;
    var a = recent[n - 3], b = recent[n - 2], c = recent[n - 1];
    return a.ore === b.ore && b.ore === c.ore && c.t - a.t <= 2000;
  }

  var MR = MG.minerush = {
    ORES: ORES, newGrid: newGrid, isCombo: isCombo,
    payFor: function (score, ctx) { return Math.min(ctx && ctx.cap != null ? ctx.cap : 30, Math.round(score / 3)); },
    start: function (container, ctx) {
      var W, H, S, s, gx, gy, grid, recent, cache, parts, now;
      function layout() {
        s = Math.floor(Math.min((W - 24) / COLS, (H - 84) / ROWS));
        gx = Math.round((W - COLS * s) / 2); gy = 74 + Math.round((H - 84 - ROWS * s) / 2);
        cache = {};
      }
      function img(ore) { return cache[ore.id] || (cache[ore.id] = MG.blockImage(s, s, ore.tex, 3)); }
      function mine(r, c) {
        var b = grid[r][c];
        if (b.spawn < 1) return; // still popping in
        b.hp--;
        var cx = gx + c * s + s / 2, cy = gy + r * s + s / 2;
        for (var i = 0; i < 6; i++) parts.push({ x: cx, y: cy, vx: (BT.rng() - 0.5) * 300, vy: -BT.rng() * 250, t: 0, col: i % 2 ? '#8d99a6' : '#fff8e7' });
        if (b.hp > 0) { BT.sfx.click(); return; }
        var ore = b.ore, gain = ore.val;
        recent.push({ ore: ore.id, t: now });
        if (recent.length > 3) recent.shift();
        if (isCombo(recent)) {
          gain += ore.val * 2; recent = [];
          S.flash('COMBO x3!', W / 2, gy - 6, '#3ddc97'); BT.sfx.good();
        } else if (ore.id === 'diamond') { S.flash('DIAMOND!', cx, cy, '#7df3ff'); BT.sfx.good(); }
        else BT.sfx.build();
        S.score += gain;
        S.flash('+' + gain, cx, cy - 10, ore.id === 'stone' ? '#fff8e7' : '#ffcf3f');
        grid[r][c] = newBlock();
      }
      var game = {
        seconds: 60, label: 'ore',
        init: function (w, h, state) {
          W = w; H = h; S = state; layout();
          grid = newGrid(); recent = []; parts = []; now = 0;
          grid.forEach(function (row) { row.forEach(function (b) { b.spawn = 1; }); });
        },
        resize: function (w, h) { W = w; H = h; layout(); },
        update: function (dt) {
          now += dt * 1000;
          grid.forEach(function (row) { row.forEach(function (b) { if (b.spawn < 1) b.spawn = Math.min(1, b.spawn + dt * 5); }); });
          for (var i = parts.length - 1; i >= 0; i--) {
            var p = parts[i]; p.t += dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.t > 0.6) parts.splice(i, 1);
          }
        },
        down: function (x, y) {
          var c = Math.floor((x - gx) / s), r = Math.floor((y - gy) / s);
          if (c >= 0 && c < COLS && r >= 0 && r < ROWS) mine(r, c);
        },
        auto: function () {
          var r = BT.rand(0, ROWS - 1), c = BT.rand(0, COLS - 1), b = grid[r][c];
          b.spawn = 1;
          for (var i = b.hp; i > 0; i--) mine(r, c);
        },
        draw: function (g, w, h) {
          W = w; H = h;
          g.fillStyle = '#2a1f3d'; g.fillRect(0, 0, W, H);
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(gx - 6, gy - 6, COLS * s + 12, ROWS * s + 12);
          for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
              var b = grid[r][c], x = gx + c * s, y = gy + r * s, k = b.spawn, d = (1 - k) * s / 2;
              g.drawImage(img(b.ore), x + d, y + d, s - d * 2, s - d * 2);
              if (b.hp < b.ore.hp) {
                // cracks grow with damage taken
                var n = (b.ore.hp - b.hp) * 3, cx = x + s / 2, cy = y + s / 2;
                g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 2; g.beginPath();
                for (var i = 0; i < n; i++) {
                  var a = i / n * Math.PI * 2 + b.seed % 7;
                  g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s * 0.42, cy + Math.sin(a) * s * 0.42);
                }
                g.stroke();
              }
            }
          }
          parts.forEach(function (p) { g.globalAlpha = 1 - p.t / 0.6; g.fillStyle = p.col; g.fillRect(p.x - 4, p.y - 4, 8, 8); });
          g.globalAlpha = 1;
        },
        payFor: MR.payFor
      };
      return MG.frame(container, ctx, game);
    }
  };
  BT.registerMinigame('minerush', { title: 'Mine Rush', icon: '⛏️', blurb: 'Tap the ore to mine it. Diamonds are worth the most, 3 of a kind is a combo!',
    start: MR.start });

  BT.registerChecks('minerush', [
    { name: 'registered with start()', fn: function () { return typeof BT.registry.minigames.minerush.start === 'function'; } },
    { name: 'grid is 8x6 of valid ores with full hp', fn: function () {
      var g = newGrid();
      return g.length === ROWS && g.every(function (row) {
        return row.length === COLS && row.every(function (b) { return ORES.indexOf(b.ore) >= 0 && b.hp === b.ore.hp; });
      });
    } },
    { name: 'combo: 3 same within 2 s only', fn: function () {
      return isCombo([{ ore: 'coal', t: 0 }, { ore: 'coal', t: 900 }, { ore: 'coal', t: 2000 }]) === true
        && isCombo([{ ore: 'coal', t: 0 }, { ore: 'coal', t: 900 }, { ore: 'coal', t: 2001 }]) === false
        && isCombo([{ ore: 'coal', t: 0 }, { ore: 'iron', t: 100 }, { ore: 'coal', t: 200 }]) === false
        && isCombo([{ ore: 'coal', t: 0 }, { ore: 'coal', t: 100 }]) === false;
    } },
    { name: 'pay = min(cap, score/3)', fn: function () {
      return MR.payFor(0, { cap: 9 }) === 0 && MR.payFor(12, { cap: 9 }) === 4 && MR.payFor(900, { cap: 9 }) === 9;
    } }
  ]);
})();
