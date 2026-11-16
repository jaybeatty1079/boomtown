// BT.minigames.blockstack: a block slides across the top, tap to drop it on the tower, overhang falls off, height = score.
// Also holds BT.minigames.frame, the shared canvas runner (countdown, timer, HUD, pointer, end card) that minerush.js reuses:
// this file loads before minerush.js in index.html.
(function () {
  'use strict';
  var BT = window.BT;
  var MG = BT.minigames = BT.minigames || {};

  // ---------- block textures, drawn in code ----------
  var PAL = {
    grass: ['#8b5a2b', '#9a6633', '#7a4e24', '#8f5e2e'], dirt: ['#8b5a2b', '#9a6633', '#7a4e24', '#8f5e2e'],
    stone: ['#8d99a6', '#7f8a97', '#9aa5b1', '#747f8b'], planks: ['#c98a4b', '#b97a3f', '#d19555', '#a86f38'],
    brick: ['#b4473b', '#a33e33', '#c25045', '#8d3a30'], gold: ['#ffcf3f', '#e6b82f', '#ffe067', '#d4a520'],
    diamond: ['#7df3ff', '#5ad8e8', '#b6f9ff', '#3fc0d6'], obsidian: ['#2a1f3d', '#1e2430', '#3a2c55', '#15111f'],
    coal: ['#8d99a6', '#7f8a97', '#2b2f36', '#1e2430', '#8d99a6', '#44494f'],
    iron: ['#8d99a6', '#7f8a97', '#d9b38c', '#c69c6d', '#8d99a6', '#e4c3a3'],
    goldore: ['#8d99a6', '#7f8a97', '#ffcf3f', '#e6b82f', '#8d99a6', '#ffe067'],
    diamondore: ['#8d99a6', '#7f8a97', '#7df3ff', '#5ad8e8', '#8d99a6', '#b6f9ff']
  };
  var GRASS = ['#5fcf5a', '#54bf50', '#6ad965', '#4bb447'];
  function hash(x, y, s) {
    var h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  // 8 pixel rows of palette shades picked by a hash, a light top row, a dark bottom row, a thin outline.
  MG.drawBlock = function (g, x, y, w, h, kind, seed) {
    var pal = PAL[kind] || PAL.stone, p = h / 8, cols = Math.ceil(w / p);
    for (var j = 0; j < 8; j++) {
      for (var i = 0; i < cols; i++) {
        var r = hash(i, j, seed || 1), set = kind === 'grass' && j < 2 ? GRASS : pal;
        g.fillStyle = set[Math.floor(r * set.length)];
        g.fillRect(x + i * p, y + j * p, Math.min(p, w - i * p) + 0.5, p + 0.5);
      }
    }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, w, p);
    g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x, y + h - p, w, p);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
  };
  // Offscreen cached copy of a block so the frame loop only drawImages.
  MG.blockImage = function (w, h, kind, seed) {
    var dpr = window.devicePixelRatio || 1, c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    var g = c.getContext('2d'); g.scale(dpr, dpr);
    MG.drawBlock(g, 0, 0, w, h, kind, seed);
    return c;
  };

  // ---------- shared frame ----------
  // game: {seconds, label, init(W,H), update(dt), draw(g,W,H), down(x,y), move(x,y), up(x,y), auto(), payFor(score, ctx)}
  // Returns Promise<{score, pay}>. In test mode the timer runs 10x and the end card closes itself.
  MG.frame = function (container, ctx, game) {
    ctx = ctx || {};
    return new Promise(function (resolve) {
      var fast = !!(BT.test && BT.test.fast);
      container.innerHTML = '';
      container.style.position = 'relative';
      var canvas = BT.el('canvas', { class: 'mg-canvas', style: { display: 'block', borderRadius: '16px', touchAction: 'none' } });
      container.appendChild(canvas);
      var g = canvas.getContext('2d'), dpr = window.devicePixelRatio || 1, W = 0, H = 0;
      var state = { score: 0, left: game.seconds || 60, phase: 'count', count: 3, countT: 0, go: 0, flashes: [] };
      function size() {
        var r = container.getBoundingClientRect();
        W = Math.max(300, Math.round(r.width)); H = Math.max(300, Math.round(r.height));
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (game.resize) game.resize(W, H);
      }
      size();
      game.init(W, H, state);
      window.addEventListener('resize', size);
      BT.voice.say('countdown');

      function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function onDown(e) {
        e.preventDefault();
        if (state.phase !== 'play') return;
        var p = pos(e); if (game.down) game.down(p.x, p.y);
      }
      function onMove(e) { if (state.phase === 'play' && game.move) { var p = pos(e); game.move(p.x, p.y); } }
      function onUp(e) { if (state.phase === 'play' && game.up) { var p = pos(e); game.up(p.x, p.y); } }
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);

      state.flash = function (text, x, y, color) { state.flashes.push({ text: text, x: x, y: y, color: color || '#fff', t: 0 }); };

      function drawHUD() {
        var h = 54, pad = 10;
        g.fillStyle = 'rgba(30,36,48,.85)';
        if (g.roundRect) { g.beginPath(); g.roundRect(pad, pad, W - pad * 2, h, 14); g.fill(); } else g.fillRect(pad, pad, W - pad * 2, h); // Safari < 16
        g.font = '700 30px ' + fontStack(); g.textBaseline = 'middle';
        var secs = Math.max(0, Math.ceil(state.left));
        g.fillStyle = secs <= 10 && state.phase === 'play' ? '#ff6b6b' : '#fff8e7';
        g.textAlign = 'left'; g.fillText('⏱ ' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), pad + 18, pad + h / 2);
        g.fillStyle = '#ffcf3f'; g.textAlign = 'right';
        g.fillText(state.score + ' ' + (game.label || 'pts'), W - pad - 18, pad + h / 2);
      }
      function drawFlashes(dt) {
        for (var i = state.flashes.length - 1; i >= 0; i--) {
          var f = state.flashes[i]; f.t += dt;
          if (f.t > 0.9) { state.flashes.splice(i, 1); continue; }
          g.globalAlpha = 1 - f.t / 0.9;
          g.font = '700 ' + Math.round(26 + f.t * 14) + 'px ' + fontStack(); g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.5)'; g.strokeText(f.text, f.x, f.y - f.t * 50);
          g.fillStyle = f.color; g.fillText(f.text, f.x, f.y - f.t * 50);
          g.globalAlpha = 1;
        }
      }
      function drawBig(text) {
        g.font = '700 ' + Math.round(Math.min(W, H) * 0.3) + 'px ' + fontStack(); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 12; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(text, W / 2, H / 2);
        g.fillStyle = '#ffcf3f'; g.fillText(text, W / 2, H / 2);
      }

      var raf = 0, last = 0, finished = false;
      function loop(now) {
        if (finished) return;
        var dt = Math.min(0.05, last ? (now - last) / 1000 : 0); last = now;
        if (state.phase === 'count') {
          state.countT += dt;
          if (state.countT >= (fast ? 0.1 : 1)) { state.countT = 0; state.count--; if (state.count <= 0) { state.phase = 'play'; state.go = 0.6; } }
        } else if (state.phase === 'play') {
          state.left -= dt * (fast ? 10 : 1);
          state.go -= dt;
          game.update(dt, state);
          if (state.left <= 0) { state.left = 0; state.phase = 'end'; }
        }
        game.draw(g, W, H, state);
        drawFlashes(dt);
        drawHUD();
        if (state.phase === 'count') drawBig(String(state.count));
        else if (state.phase === 'play' && state.go > 0) drawBig('GO!');
        if (state.phase === 'end') { end(); return; }
        raf = requestAnimationFrame(loop);
      }
      function end() {
        var raw = Math.max(0, Math.round(game.payFor(state.score, ctx)));
        var pay = ctx.cap == null ? raw : Math.min(ctx.cap, raw);
        BT.sfx.fanfare();
        BT.voice.say('timesup', { interrupt: true }); BT.voice.say('collect'); // the end card shows right here
        var card = BT.el('div', { class: 'card mg-end', style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
          textAlign: 'center', minWidth: '260px', padding: '22px 26px', zIndex: 2 } }, [
          BT.el('h2', { text: "Time's up!" }),
          BT.el('div', { class: 'mg-score', style: { fontSize: '2.4rem', fontWeight: '700' }, text: state.score + ' ' + (game.label || 'pts') }),
          BT.el('p', { style: { fontSize: '1.3rem', margin: '6px 0 14px' }, text: 'Pay: ' + BT.fmt(pay) + (pay >= (ctx.cap || 0) && pay > 0 ? ' (max!)' : '') }),
          BT.el('button', { class: 'btn btn-big gold', type: 'button', text: 'Collect ' + BT.fmt(pay), onclick: function () { if (BT.sfx && BT.sfx.coin) BT.sfx.coin(); finish(); } })
        ]);
        container.appendChild(card);
        if (fast) setTimeout(finish, 400);
        function finish() {
          if (finished) return; finished = true;
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', size);
          if (BT.test) { BT.test.minigameAuto = null; BT.test.minigame = null; }
          resolve({ score: state.score, pay: pay });
        }
      }
      if (BT.test) {
        // Test hooks: play a few moves (skipping the countdown), peek at state, or end the game now.
        BT.test.minigameAuto = function (n) {
          if (state.phase === 'count') { state.phase = 'play'; state.count = 0; }
          for (var i = 0; i < (n || 3); i++) game.auto(state);
          return state.score;
        };
        BT.test.minigame = { state: state, game: game, finish: function () { state.left = 0; } };
      }
      raf = requestAnimationFrame(loop);
    });
  };
  function fontStack() { return "'Fredoka', 'Avenir Next', 'Segoe UI', system-ui, sans-serif"; }

  // ---------- blockstack ----------
  var KINDS = ['planks', 'stone', 'brick', 'gold', 'diamond', 'obsidian', 'dirt'];
  // Pure: where the dropped block lands on the top block. miss when the overlap is under 6px; perfect snaps within 6px.
  function chop(cur, top) {
    var nx = Math.max(cur.x, top.x), nr = Math.min(cur.x + cur.w, top.x + top.w), ov = nr - nx;
    if (ov < 6) return { miss: true };
    if (Math.abs(cur.x - top.x) <= 6) return { miss: false, perfect: true, x: top.x, w: top.w };
    return { miss: false, perfect: false, x: nx, w: ov, fall: cur.x < top.x ? { x: cur.x, w: top.x - cur.x } : { x: nr, w: cur.x + cur.w - nr } };
  }
  var BS = MG.blockstack = {
    chop: chop,
    // A full 60 s of good play (25 blocks) earns the whole cap; every block below that still counts.
    payFor: function (score, ctx) { var cap = ctx && ctx.cap != null ? ctx.cap : 30; return Math.round(cap * Math.min(1, Math.max(0, score || 0) / 25)); },
    start: function (container, ctx) {
      var W, H, S, bh, baseW, groundY, tower, cur, cam, camTarget, fallers, misses, seedN = 1;
      function newCur() {
        var top = tower[tower.length - 1];
        cur = { x: BT.rng() < 0.5 ? 0 : W - top.w, w: top.w, kind: BT.pick(KINDS), seed: seedN++, dir: 1,
          speed: W * 0.45 + tower.length * 14 };
        cur.dir = cur.x === 0 ? 1 : -1;
      }
      function sliderY() { return Math.max(74, groundY - tower.length * bh + cam - bh * 1.8); }
      function img(b) {
        if (!b.img || b.imgW !== b.w) { b.img = MG.blockImage(b.w, bh, b.kind, b.seed); b.imgW = b.w; }
        return b.img;
      }
      var game = {
        seconds: 60, label: 'blocks',
        init: function (w, h, state) {
          W = w; H = h; S = state;
          bh = Math.max(34, Math.min(64, Math.round(H / 14)));
          baseW = Math.round(W * 0.55); groundY = H - 36;
          tower = [{ x: Math.round((W - baseW) / 2), w: baseW, kind: 'grass', seed: 0 }];
          cam = 0; camTarget = 0; fallers = []; misses = 0;
          newCur();
        },
        resize: function (w, h) { W = w; H = h; groundY = H - 36; },
        update: function (dt, state) {
          cur.x += cur.dir * cur.speed * dt;
          if (cur.x <= 0) { cur.x = 0; cur.dir = 1; }
          if (cur.x + cur.w >= W) { cur.x = W - cur.w; cur.dir = -1; }
          var topY = groundY - tower.length * bh;
          camTarget = Math.max(0, H * 0.5 - topY);
          cam += (camTarget - cam) * Math.min(1, dt * 6);
          for (var i = fallers.length - 1; i >= 0; i--) {
            var f = fallers[i]; f.vy += 1500 * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
            if (f.y > H + bh * 2) fallers.splice(i, 1);
          }
        },
        down: function () { game.drop(); },
        drop: function () {
          var top = tower[tower.length - 1], r = chop(cur, top), sy = sliderY();
          if (r.miss) {
            misses++;
            fallers.push({ x: cur.x, w: cur.w, kind: cur.kind, seed: cur.seed, y: sy, vy: 0, rot: 0, vr: (cur.dir || 1) * 2 });
            BT.sfx.bad(); S.flash('Missed!', cur.x + cur.w / 2, sy - 10, '#ff6b6b');
            newCur(); return;
          }
          if (r.fall) fallers.push({ x: r.fall.x, w: r.fall.w, kind: cur.kind, seed: cur.seed, y: sy, vy: 0, rot: 0, vr: r.fall.x < r.x ? -3 : 3 });
          tower.push({ x: r.x, w: r.w, kind: cur.kind, seed: cur.seed });
          S.score = tower.length - 1;
          if (r.perfect) { BT.sfx.good(); S.flash('PERFECT!', r.x + r.w / 2, sy - 10, '#ffcf3f'); }
          else BT.sfx.build();
          newCur();
        },
        auto: function () { cur.x = tower[tower.length - 1].x; game.drop(); },
        draw: function (g, w, h, state) {
          W = w; H = h;
          var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#3f9fe8'); sky.addColorStop(1, '#a9dcff');
          g.fillStyle = sky; g.fillRect(0, 0, W, H);
          // clouds drift with the camera so the climb reads
          g.fillStyle = 'rgba(255,255,255,.75)';
          for (var c = 0; c < 4; c++) {
            var cy = ((c * 173 + cam * 0.4) % (H + 80)) - 40, cx = (c * 211 + 60) % W;
            g.fillRect(cx, cy, 70, 18); g.fillRect(cx + 14, cy - 14, 42, 14);
          }
          var gy = groundY + cam;
          if (gy < H) { g.fillStyle = '#8b5a2b'; g.fillRect(0, gy, W, H - gy); g.fillStyle = '#5fcf5a'; g.fillRect(0, gy, W, 10); }
          for (var i = 0; i < tower.length; i++) {
            var b = tower[i], y = groundY - (i + 1) * bh + cam;
            if (y > H || y + bh < 0) continue;
            g.drawImage(img(b), b.x, y, b.w, bh);
          }
          fallers.forEach(function (f) {
            g.save(); g.translate(f.x + f.w / 2, f.y + bh / 2); g.rotate(f.rot);
            g.drawImage(img(f), -f.w / 2, -bh / 2, f.w, bh); g.restore();
          });
          if (state.phase !== 'end') {
            var sy = sliderY();
            g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(cur.x, groundY - tower.length * bh + cam - 4, cur.w, 4);
            g.drawImage(img(cur), cur.x, sy, cur.w, bh);
          }
          if (state.phase === 'play' && tower.length === 1 && state.go <= 0) {
            g.font = '700 22px ' + fontStack(); g.textAlign = 'center'; g.fillStyle = '#fff8e7';
            g.fillText('Tap to drop the block!', W / 2, H - 60);
          }
        },
        payFor: BS.payFor
      };
      return MG.frame(container, ctx, game);
    }
  };
  BT.registerMinigame('blockstack', { title: 'Block Stack', icon: '🧱', blurb: 'Tap to drop each block on the tower. Line them up!',
    start: BS.start });

  BT.registerChecks('blockstack', [
    { name: 'registered with start()', fn: function () { return typeof BT.registry.minigames.blockstack.start === 'function'; } },
    { name: 'chop: overlap, miss, perfect', fn: function () {
      var top = { x: 100, w: 200 };
      var a = chop({ x: 150, w: 200 }, top), b = chop({ x: 400, w: 200 }, top), c = chop({ x: 103, w: 200 }, top), d = chop({ x: 20, w: 200 }, top);
      return a.x === 150 && a.w === 150 && a.fall.x === 300 && a.fall.w === 50 && b.miss === true && c.perfect === true && c.w === 200
        && d.x === 100 && d.w === 120 && d.fall.x === 20 && d.fall.w === 80;
    } },
    { name: 'pay = cap * blocks/25, capped', fn: function () {
      return BS.payFor(0, { cap: 9 }) === 0 && BS.payFor(5, { cap: 9 }) === 2 && BS.payFor(14, { cap: 9 }) === 5
        && BS.payFor(25, { cap: 9 }) === 9 && BS.payFor(50, { cap: 9 }) === 9 && BS.payFor(-2, { cap: 9 }) === 0 && BS.payFor(25, {}) === 30;
    } },
    { name: 'every texture draws without throwing', fn: function () {
      Object.keys(PAL).concat(['grass']).forEach(function (k) { MG.blockImage(80, 40, k, 7); });
      return true;
    } }
  ]);
})();
