// BT.minigames.delivery: three-lane runner. Tap left/right half or swipe to change lanes; collect packages,
// dodge puddles (slow) and cones (stumble); speed ramps. Also defines BT.minigames.timedCanvas, the shared
// 60 s canvas harness (DPR, HUD, 3-2-1, timer, end card, pay) that coinrain.js reuses (index.html loads this first).
BT.minigames = BT.minigames || {};
(function () {
  'use strict';
  var BT = window.BT, el = BT.el;
  var INK = '#1e2430', PAPER = '#fff8e7', GOLD = '#ffcf3f', GRASS = '#5fcf5a', CORAL = '#ff6b6b', SKY = '#6ec6ff';
  function sfx(name) { try { if (BT.sfx && BT.sfx[name]) BT.sfx[name](); } catch (e) { /* audio not unlocked yet */ } }
  function font(px) { return '700 ' + px + 'px Fredoka, "Avenir Next", system-ui, sans-serif'; }
  function payFor(score, cap) { return Math.max(0, Math.min(Math.round(cap || 0), Math.round(score || 0))); }

  // ---------- shared harness ----------
  // game = {duration?, update(dt, api), draw(g, api), onDown(x, y, api), onMove(x, y, api), onUp(x, y, api), auto(api)}
  // api = {w, h, score, timeLeft, running, addScore(n), flash(color), canvas}
  BT.minigames.timedCanvas = function (container, ctx, game) {
    ctx = ctx || {};
    var speed = BT.TEST ? 10 : 1;             // test mode: timer and countdown run at 10x
    var duration = game.duration || 60;
    container.innerHTML = '';
    container.style.position = 'relative';
    var wrap = el('div', { style: { flex: '1', minHeight: '0', position: 'relative' } });
    var canvas = el('canvas', { style: { display: 'block', width: '100%', height: '100%', touchAction: 'none', borderRadius: '16px' } });
    wrap.appendChild(canvas); container.appendChild(wrap);
    var g = canvas.getContext('2d');
    var api = { w: 600, h: 800, score: 0, timeLeft: duration, running: false, canvas: canvas, flashCol: null, flashA: 0,
      addScore: function (n) { api.score = Math.max(0, api.score + n); },
      flash: function (c) { api.flashCol = c; api.flashA = 0.5; } };
    function resize() {
      var r = wrap.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      api.w = r.width > 50 ? r.width : 600; api.h = r.height > 50 ? r.height : 800; // shortcut: detached or zero-size host gets a stand-in size, fine for checks
      canvas.width = Math.round(api.w * dpr); canvas.height = Math.round(api.h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(wrap); else window.addEventListener('resize', resize);

    var done = false, resolveP, raf = 0, last = 0, countdown = 3.999, finished = false;
    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function onDown(e) { if (!api.running) return; e.preventDefault(); var p = pos(e); if (game.onDown) game.onDown(p.x, p.y, api); }
    function onMove(e) { if (!api.running) return; var p = pos(e); if (game.onMove) game.onMove(p.x, p.y, api); }
    function onUp(e) { if (!api.running) return; var p = pos(e); if (game.onUp) game.onUp(p.x, p.y, api); }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    function hud() {
      var s = Math.min(api.w / 420, 1.6), pad = 14 * s;
      g.save();
      g.fillStyle = 'rgba(30,36,48,.78)';
      g.fillRect(0, 0, api.w, 62 * s);
      g.fillStyle = api.timeLeft <= 10 && api.running ? CORAL : PAPER;
      g.font = font(34 * s); g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillText('⏱ ' + Math.ceil(api.timeLeft), pad, 31 * s);
      g.fillStyle = GOLD; g.textAlign = 'right';
      g.fillText('Score ' + api.score, api.w - pad, 31 * s);
      g.restore();
    }
    function frame(now) {
      if (done) return;
      if (!canvas.isConnected && !BT.TEST) { finish(); return; }
      var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (countdown > 0) {
        countdown -= dt * speed;
        if (countdown <= 0) { api.running = true; sfx('good'); }
      } else if (api.running) {
        api.timeLeft = Math.max(0, api.timeLeft - dt * speed);
        game.update(dt, api);
        if (api.timeLeft <= 0) { api.running = false; finished = true; }
      }
      g.clearRect(0, 0, api.w, api.h);
      game.draw(g, api);
      if (api.flashA > 0) { g.fillStyle = api.flashCol; g.globalAlpha = api.flashA; g.fillRect(0, 0, api.w, api.h); g.globalAlpha = 1; api.flashA -= dt * 2; }
      hud();
      if (countdown > 0) {
        var n = Math.ceil(countdown), label = n > 3 ? 'Ready?' : String(n);
        g.fillStyle = 'rgba(30,36,48,.45)'; g.fillRect(0, 0, api.w, api.h);
        g.fillStyle = GOLD; g.font = font(Math.min(api.w, api.h) * 0.3); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(label, api.w / 2, api.h / 2);
      }
      if (finished) { endCard(); return; }
      raf = requestAnimationFrame(frame);
    }
    function endCard() {
      var pay = payFor(api.score, ctx.cap);
      var btn = el('button', { class: 'btn btn-big gold', type: 'button', text: 'Collect ' + BT.fmt(pay), onclick: function () { sfx('coin'); finish(); } });
      var card = el('div', { class: 'card center bt-mini-end', style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', minWidth: '260px', maxWidth: '90%' } }, [
        el('h2', { text: "Time's up!" }),
        el('p', { style: { fontSize: '1.6rem', fontWeight: '700' }, text: 'Score: ' + api.score }),
        el('p', { style: { fontSize: '1.3rem' }, text: 'Pay: ' + BT.fmt(pay) + (pay >= (ctx.cap || 0) && pay > 0 ? ' (max!)' : '') }),
        btn
      ]);
      wrap.appendChild(card);
      sfx('fanfare');
      if (BT.TEST) setTimeout(finish, 400); // test mode: no waiting on the card
    }
    function finish() {
      if (done) return;
      done = true; api.running = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp);
      if (BT.test.minigameAuto === auto) BT.test.minigameAuto = null;
      resolveP({ score: api.score, pay: payFor(api.score, ctx.cap) });
    }
    // Test hook: plays a few moves through real pointer events on the canvas.
    function auto() { if (!game.auto) return false; if (countdown > 0) { countdown = 0; api.running = true; } game.auto(api); return true; }
    if (BT.TEST && container.isConnected) BT.test.minigameAuto = auto; // a detached host (checks) must not steal the hook
    api.tap = function (type, x, y) { // synthetic pointer event at canvas coords (used by auto)
      var r = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent(type, { clientX: r.left + x, clientY: r.top + y, pointerId: 1, bubbles: true, cancelable: true }));
    };
    return new Promise(function (res) { resolveP = res; raf = requestAnimationFrame(frame); });
  };
  BT.minigames.payFor = payFor;

  // ---------- the runner's picture: the character avatar, drawn to the canvas through an SVG data URL ----------
  function avatarImage(size) {
    var img = new Image(), c = BT.state && BT.state.character;
    if (c && BT.character && BT.character.svg) {
      try { img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BT.character.svg(size)); } catch (e) { /* fallback runner */ }
    }
    return img;
  }

  // ---------- delivery ----------
  var D = BT.minigames.delivery = BT.minigames.delivery || {};
  D.laneFrom = function (lane, dir) { return Math.max(0, Math.min(2, lane + dir)); };
  D.start = function (container, ctx) {
    var lane = 1, x = 0, dist = 0, speed = 260, base = 260, slow = 0, stun = 0, items = [], spawnIn = 0.4, bob = 0, downX = null, downT = 0;
    var img = avatarImage(120);
    function roadGeom(api) {
      var rw = Math.min(api.w * 0.82, 560), rx = (api.w - rw) / 2, lw = rw / 3;
      return { rw: rw, rx: rx, lw: lw, lx: function (l) { return rx + lw * (l + 0.5); }, ry: api.h - 150, size: Math.max(64, Math.min(104, lw * 0.72)) };
    }
    function move(dir, api) {
      var n = D.laneFrom(lane, dir);
      if (n !== lane) { lane = n; sfx('click'); }
    }
    var game = {
      update: function (dt, api) {
        var rg = roadGeom(api);
        if (!x) x = rg.lx(lane);
        x += (rg.lx(lane) - x) * Math.min(1, dt * 14);
        if (stun > 0) stun -= dt; if (slow > 0) slow -= dt;
        base = 260 + (60 - api.timeLeft) * 5;                       // speed ramps over the minute
        speed = base * (slow > 0 ? 0.5 : 1) * (stun > 0 ? 0.3 : 1);
        dist += speed * dt; bob += dt * 12;
        spawnIn -= dt * (speed / 260);
        if (spawnIn <= 0) {
          var r = BT.rng();
          items.push({ lane: BT.rand(0, 2), y: -60, kind: r < 0.55 ? 'box' : r < 0.8 ? 'puddle' : 'cone' });
          spawnIn = 0.7 + BT.rng() * 0.5;
        }
        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i]; it.y += speed * dt;
          if (!it.hit && it.lane === lane && Math.abs(it.y - rg.ry) < rg.size * 0.45) {
            it.hit = true;
            if (it.kind === 'box') { api.addScore(1); sfx('coin'); api.flash(GOLD); it.dead = true; }
            else if (it.kind === 'puddle') { slow = 1.2; sfx('bad'); api.flash(SKY); }
            else { stun = 0.8; sfx('bad'); api.flash(CORAL); }
          }
          if (it.dead || it.y > api.h + 80) items.splice(i, 1);
        }
      },
      draw: function (g, api) {
        var rg = roadGeom(api), w = api.w, h = api.h;
        g.fillStyle = GRASS; g.fillRect(0, 0, w, h);
        g.fillStyle = '#4db848'; for (var gy = (dist * 0.6) % 48 - 48; gy < h; gy += 48) { g.fillRect(0, gy, rg.rx, 24); g.fillRect(rg.rx + rg.rw, gy, rg.rx, 24); }
        g.fillStyle = '#c9c0a8'; g.fillRect(rg.rx - 18, 0, 18, h); g.fillRect(rg.rx + rg.rw, 0, 18, h);
        g.fillStyle = '#6b7482'; g.fillRect(rg.rx, 0, rg.rw, h);
        g.fillStyle = PAPER;
        for (var l = 1; l < 3; l++) for (var dy = (dist % 80) - 80; dy < h; dy += 80) g.fillRect(rg.rx + rg.lw * l - 3, dy, 6, 40);
        items.forEach(function (it) {
          var ix = rg.lx(it.lane), s = rg.size * 0.6;
          if (it.kind === 'box') {
            g.fillStyle = '#b5742f'; g.fillRect(ix - s / 2, it.y - s / 2, s, s);
            g.fillStyle = '#8b5a2b'; g.fillRect(ix - s / 2, it.y + s / 2 - s * 0.2, s, s * 0.2);
            g.fillStyle = '#f2e2c4'; g.fillRect(ix - s * 0.08, it.y - s / 2, s * 0.16, s); g.fillRect(ix - s / 2, it.y - s * 0.08, s, s * 0.16);
          } else if (it.kind === 'puddle') {
            g.fillStyle = '#3b9ddd'; g.beginPath(); g.ellipse(ix, it.y, s * 0.75, s * 0.4, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(ix - s * 0.2, it.y - s * 0.1, s * 0.25, s * 0.1, 0, 0, Math.PI * 2); g.fill();
          } else {
            g.fillStyle = '#ff8c1a'; g.beginPath(); g.moveTo(ix, it.y - s * 0.55); g.lineTo(ix + s * 0.4, it.y + s * 0.4); g.lineTo(ix - s * 0.4, it.y + s * 0.4); g.closePath(); g.fill();
            g.fillStyle = PAPER; g.fillRect(ix - s * 0.2, it.y - s * 0.05, s * 0.4, s * 0.14);
            g.fillStyle = INK; g.fillRect(ix - s * 0.5, it.y + s * 0.4, s, s * 0.12);
          }
        });
        var rx = x || rg.lx(lane), ry = rg.ry + Math.sin(bob) * 3, sz = rg.size;
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(rx, rg.ry + sz / 2, sz * 0.35, 8, 0, 0, Math.PI * 2); g.fill();
        if (stun > 0 && Math.floor(stun * 12) % 2) g.globalAlpha = 0.5;
        if (img.complete && img.naturalWidth) g.drawImage(img, rx - sz / 2, ry - sz / 2, sz, sz);
        else { // fallback runner: blocky figure in the palette
          g.fillStyle = '#f1c27d'; g.fillRect(rx - sz * 0.22, ry - sz * 0.48, sz * 0.44, sz * 0.36);
          g.fillStyle = '#5a3b1e'; g.fillRect(rx - sz * 0.22, ry - sz * 0.5, sz * 0.44, sz * 0.1);
          g.fillStyle = '#8b6cff'; g.fillRect(rx - sz * 0.26, ry - sz * 0.1, sz * 0.52, sz * 0.34);
          g.fillStyle = '#3b5b8f'; g.fillRect(rx - sz * 0.2, ry + sz * 0.24, sz * 0.16, sz * 0.24); g.fillRect(rx + sz * 0.04, ry + sz * 0.24, sz * 0.16, sz * 0.24);
        }
        g.globalAlpha = 1;
        if (!api.running && api.timeLeft === 60) { g.fillStyle = PAPER; g.font = font(Math.min(28, w / 16)); g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('Tap or swipe left / right · grab 📦 · dodge puddles and cones', w / 2, h - 40); }
      },
      onDown: function (px, py) { downX = px; downT = performance.now(); },
      onUp: function (px, py, api) {
        if (downX == null) return;
        var dx = px - downX; downX = null;
        if (Math.abs(dx) >= 30) move(dx > 0 ? 1 : -1, api);
        else move(px < api.w / 2 ? -1 : 1, api);
      },
      auto: function (api) { // a few moves: tap toward the lowest package's lane, three times
        for (var k = 0; k < 3; k++) {
          var target = null;
          items.forEach(function (it) { if (it.kind === 'box' && !it.hit && (!target || it.y > target.y)) target = it; });
          var want = target ? target.lane : BT.rand(0, 2), dir = want > lane ? 1 : want < lane ? -1 : (lane === 0 ? 1 : -1);
          var tx = dir > 0 ? api.w * 0.75 : api.w * 0.25;
          api.tap('pointerdown', tx, api.h / 2); api.tap('pointerup', tx, api.h / 2);
          game.update(0.05, api);
        }
      }
    };
    return BT.minigames.timedCanvas(container, ctx, game);
  };
  BT.registerMinigame('delivery', { title: 'Package Run', icon: '📦', blurb: 'Run the route! Tap or swipe to switch lanes, grab packages, dodge puddles and cones.', start: D.start });

  BT.registerChecks('delivery', [
    { name: 'registered with start()', fn: function () { return typeof BT.registry.minigames.delivery.start === 'function'; } },
    { name: 'lane clamps to 0..2', fn: function () { return D.laneFrom(0, -1) === 0 && D.laneFrom(2, 1) === 2 && D.laneFrom(1, 1) === 2 && D.laneFrom(1, -1) === 0; } },
    { name: 'pay = min(cap, score), never negative', fn: function () { return payFor(40, 25) === 25 && payFor(10, 25) === 10 && payFor(-3, 25) === 0 && payFor(5, 0) === 0; } },
    { name: 'start renders a canvas and returns a promise', fn: function () {
      var host = el('div');
      var p = D.start(host, { cap: 10 });
      return !!host.querySelector('canvas') && typeof p.then === 'function';
    } }
  ]);
})();
