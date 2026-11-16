// BT.minigames.painter: untimed 16x16 pixel art studio, opened from the town screen.
// 12-color palette (index 0 = white canvas), pencil, fill bucket, eraser, undo, clear, name + save to BT.state.paintings
// (256-char palette-index string, chars 0-9 a-b), gallery with load/delete, max 12 paintings. No pay; logs painting_saved.
BT.minigames = BT.minigames || {};
(function () {
  'use strict';
  var N = 16, MAX = 12, UNDO_MAX = 60;
  // Same order as town.js PALETTE so billboards show the colors she picked.
  var PALETTE = ['#ffffff', '#1e2430', '#ff6b6b', '#ffb347', '#ffcf3f', '#5fcf5a', '#3ddc97', '#6ec6ff', '#3b6fd6', '#8b6cff', '#8b5a2b', '#8d99a6'];
  var NAMES = ['White', 'Ink', 'Coral', 'Orange', 'Gold', 'Grass', 'Mint', 'Sky', 'Blue', 'Violet', 'Dirt', 'Stone'];
  var el = BT.el;

  function blank() { var a = new Array(N * N); for (var i = 0; i < a.length; i++) a[i] = 0; return a; }
  function encode(px) { var s = ''; for (var i = 0; i < N * N; i++) s += (px[i] || 0).toString(36); return s; }
  function decode(str) {
    var a = blank();
    str = String(str || '');
    for (var i = 0; i < N * N && i < str.length; i++) { var k = parseInt(str.charAt(i), 36); a[i] = isNaN(k) ? 0 : k % PALETTE.length; }
    return a;
  }
  // 4-connected flood fill in place; returns the number of cells changed.
  function fill(px, start, color) {
    var from = px[start];
    if (from === color) return 0;
    var stack = [start], n = 0;
    while (stack.length) {
      var i = stack.pop();
      if (px[i] !== from) continue;
      px[i] = color; n++;
      var x = i % N;
      if (x > 0) stack.push(i - 1);
      if (x < N - 1) stack.push(i + 1);
      if (i >= N) stack.push(i - N);
      if (i < N * (N - 1)) stack.push(i + N);
    }
    return n;
  }
  function thumbSVG(pixels, size) {
    var px = decode(pixels), out = '<svg viewBox="0 0 16 16" width="' + size + '" height="' + size + '" shape-rendering="crispEdges" aria-hidden="true">';
    for (var i = 0; i < N * N; i++) out += '<rect x="' + (i % N) + '" y="' + Math.floor(i / N) + '" width="1" height="1" fill="' + PALETTE[px[i]] + '"/>';
    return out + '</svg>';
  }
  function sfx(k) { if (BT.sfx && BT.sfx[k]) BT.sfx[k](); }

  var CSS =
    '.painter{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;font-family:var(--font)}' +
    '.painter-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.painter-head h2{margin:0;font-size:1.4rem}' +
    '.painter-name{flex:1;min-width:140px;max-width:300px;min-height:48px}' +
    '.painter-body{flex:1;min-height:0;display:flex;gap:10px;align-items:stretch}' +
    '.painter-canvas-host{flex:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center}' +
    '.painter-canvas{display:block;touch-action:none;border:4px solid var(--ink);border-radius:8px;box-shadow:var(--shadow);background:#fff;cursor:crosshair}' +
    '.painter-side{flex:none;display:flex;flex-direction:column;gap:8px;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:2px}' +
    '.painter-palette{display:grid;grid-template-columns:repeat(2,52px);gap:8px}' +
    '.painter-swatch{width:52px;height:52px;border-radius:12px;border:4px solid rgba(0,0,0,.18);box-shadow:0 4px 0 var(--edge);cursor:pointer;padding:0;-webkit-appearance:none;appearance:none}' +
    '.painter-swatch:active{transform:translateY(4px);box-shadow:none}' +
    '.painter-swatch.on{border-color:var(--ink);outline:3px solid var(--gold);transform:scale(1.08)}' +
    '.painter-tools{display:grid;grid-template-columns:repeat(2,52px);gap:8px}' +
    '.painter-tool{width:52px;height:52px;min-height:52px;min-width:52px;padding:0;margin:0;font-size:1.5rem;border-radius:12px}' +
    '.painter-tool.on{background:var(--gold);outline:3px solid var(--ink)}' +
    '.painter-foot{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.painter-foot .btn{margin-bottom:0}' +
    '.painter-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}' +
    '.painter-card{background:#fff;border:3px solid var(--ink);border-radius:14px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px}' +
    '.painter-card svg{width:100%;height:auto;max-width:128px;border:2px solid #ccc;background:#fff}' +
    '.painter-card .t{font-weight:700;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.painter-card .btn{min-height:44px;padding:4px 10px;font-size:.95rem;margin-bottom:0}' +
    '@media (orientation:portrait){.painter-body{flex-direction:column}.painter-side{flex-direction:column;align-items:center;overflow-x:auto;overflow-y:hidden}' +
    '.painter-palette{grid-template-columns:repeat(12,52px)}.painter-tools{grid-template-columns:repeat(5,52px)}}';

  function start(container, ctx) {
    ctx = ctx || {};
    container.innerHTML = '';
    if (!document.getElementById('painter-css')) {
      var st = document.createElement('style'); st.id = 'painter-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    var px = blank(), undo = [], color = 1, tool = 'pencil', drawing = false, strokeChanged = false;
    var canvas = el('canvas', { class: 'painter-canvas', 'aria-label': 'Pixel canvas' });
    var g = canvas.getContext('2d');
    var nameInput = el('input', { type: 'text', class: 'painter-name', maxlength: '24', placeholder: 'Name your painting', 'aria-label': 'Painting name' });
    var swatches = [], toolBtns = {};
    var doneResolve;
    var p = new Promise(function (r) { doneResolve = r; });

    // ---------- drawing ----------
    var cell = 24;
    function size() {
      if (!canvas.isConnected) { window.removeEventListener('resize', size); return; } // overlay removed without Done
      var host = canvas.parentNode, w = host.clientWidth, h = host.clientHeight;
      var s = Math.max(N * 12, Math.floor(Math.min(w, h) - 8));
      cell = Math.floor(s / N); s = cell * N;
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = s + 'px'; canvas.style.height = s + 'px';
      canvas.width = s * dpr; canvas.height = s * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      for (var i = 0; i < N * N; i++) {
        g.fillStyle = PALETTE[px[i]];
        g.fillRect((i % N) * cell, Math.floor(i / N) * cell, cell, cell);
      }
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1;
      for (var k = 0; k <= N; k++) {
        g.beginPath(); g.moveTo(k * cell + 0.5, 0); g.lineTo(k * cell + 0.5, N * cell); g.stroke();
        g.beginPath(); g.moveTo(0, k * cell + 0.5); g.lineTo(N * cell, k * cell + 0.5); g.stroke();
      }
    }
    function cellAt(e) {
      var r = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N);
      if (x < 0 || y < 0 || x >= N || y >= N) return -1;
      return y * N + x;
    }
    function pushUndo() { undo.push(px.slice()); if (undo.length > UNDO_MAX) undo.shift(); setEnabled(); }
    var last = -1;
    function dot(i, c) { if (i >= 0 && px[i] !== c) { px[i] = c; strokeChanged = true; } }
    function apply(i) {
      if (i < 0) { last = -1; return; }
      var c = tool === 'eraser' ? 0 : color;
      if (tool === 'fill') { if (fill(px, i, c)) strokeChanged = true; return; }
      if (last >= 0 && last !== i) { // fast drags skip cells: walk the line from the last cell
        var x0 = last % N, y0 = Math.floor(last / N), x1 = i % N, y1 = Math.floor(i / N), steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (var k = 1; k <= steps; k++) dot(Math.round(y0 + (y1 - y0) * k / steps) * N + Math.round(x0 + (x1 - x0) * k / steps), c);
      } else dot(i, c);
      last = i;
    }
    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      drawing = true; strokeChanged = false; last = -1;
      undo.push(px.slice()); if (undo.length > UNDO_MAX) undo.shift();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* old Safari */ }
      apply(cellAt(e)); draw();
      if (tool === 'fill') sfx('build'); else sfx('click');
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || tool === 'fill') return;
      apply(cellAt(e)); draw();
    });
    function end() {
      if (!drawing) return;
      drawing = false;
      if (!strokeChanged) undo.pop(); // nothing changed: no undo step
      setEnabled();
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);

    // ---------- side: palette + tools ----------
    function setColor(i) {
      color = i;
      swatches.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      if (tool === 'eraser') setTool('pencil');
    }
    function setTool(t) {
      tool = t;
      Object.keys(toolBtns).forEach(function (k) { toolBtns[k].classList.toggle('on', k === t); });
    }
    var palette = el('div', { class: 'painter-palette', role: 'group', 'aria-label': 'Colors' });
    PALETTE.forEach(function (c, i) {
      var b = el('button', { type: 'button', class: 'painter-swatch', style: { background: c }, 'aria-label': NAMES[i], title: NAMES[i],
        onpointerdown: function () { setColor(i); sfx('click'); } });
      swatches.push(b); palette.appendChild(b);
    });
    function toolBtn(id, icon, label, cls, fn) {
      var b = el('button', { type: 'button', class: 'btn painter-tool ' + (cls || ''), text: icon, 'aria-label': label, title: label,
        onclick: function () { fn(); } });
      toolBtns[id] = b;
      return b;
    }
    var tools = el('div', { class: 'painter-tools', role: 'group', 'aria-label': 'Tools' }, [
      toolBtn('pencil', '✏️', 'Pencil', '', function () { setTool('pencil'); sfx('click'); }),
      toolBtn('fill', '🪣', 'Fill bucket', '', function () { setTool('fill'); sfx('click'); }),
      toolBtn('eraser', '🧽', 'Eraser', '', function () { setTool('eraser'); sfx('click'); }),
      toolBtn('undo', '↩️', 'Undo', 'sky', function () { if (undo.length) { px = undo.pop(); draw(); setEnabled(); sfx('click'); } }),
      toolBtn('clear', '🗑️', 'Clear', 'coral', function () { if (px.some(function (v) { return v; })) { pushUndo(); px = blank(); draw(); sfx('bad'); } })
    ]);
    delete toolBtns.undo; delete toolBtns.clear; // not modes
    var undoBtn = tools.children[3];
    function setEnabled() { undoBtn.disabled = !undo.length; }
    setEnabled();

    // ---------- save / gallery ----------
    function save() {
      var list = BT.state.paintings = BT.state.paintings || [];
      if (!px.some(function (v) { return v; })) { BT.toast('Paint something first', 'info'); sfx('bad'); return false; }
      var n = 1; // default name: first "Painting N" not in use, so a new one never overwrites a survivor after a delete
      while (list.some(function (q) { return q.title === 'Painting ' + n; })) n++;
      var title = nameInput.value.trim().slice(0, 24) || ('Painting ' + n);
      var code = encode(px), existing = -1;
      list.forEach(function (q, i) { if (q.title === title) existing = i; });
      if (existing >= 0) list[existing].pixels = code; // same name: overwrite, so edits do not fill the gallery
      else if (list.length >= MAX) { BT.toast('Gallery full (12). Delete one first.', 'bad'); sfx('bad'); return false; }
      else list.push({ title: title, pixels: code });
      BT.save();
      BT.log.event('painting_saved', { title: title, replaced: existing >= 0 });
      nameInput.value = title;
      BT.toast('Saved "' + title + '" to your gallery', 'good'); sfx('good');
      return true;
    }
    function gallery() {
      var list = BT.state.paintings || [];
      var modal = el('div', { class: 'modal' });
      var grid = el('div', { class: 'painter-gallery' });
      function close() { modal.remove(); }
      function row(q, i) {
        var del = el('button', { type: 'button', class: 'btn btn-sm coral', text: 'Delete' });
        del.addEventListener('click', function () {
          if (del.dataset.armed) { list.splice(i, 1); BT.save(); BT.log.event('painting_deleted', { title: q.title }); sfx('bad'); close(); gallery(); }
          else { del.dataset.armed = '1'; del.textContent = 'Really?'; setTimeout(function () { delete del.dataset.armed; del.textContent = 'Delete'; }, 2500); }
        });
        return el('div', { class: 'painter-card' }, [
          el('div', { html: thumbSVG(q.pixels, 128) }),
          el('div', { class: 't', text: q.title }),
          el('div', { class: 'row', style: { gap: '6px', justifyContent: 'center' } }, [
            el('button', { type: 'button', class: 'btn btn-sm mint', text: 'Open', onclick: function () {
              pushUndo(); px = decode(q.pixels); nameInput.value = q.title; draw(); close(); sfx('click');
            } }),
            del
          ])
        ]);
      }
      list.forEach(function (q, i) { grid.appendChild(row(q, i)); });
      modal.appendChild(el('div', { class: 'modal-box' }, [
        el('div', { class: 'screen-head' }, [
          el('h2', { text: 'Gallery (' + list.length + '/' + MAX + ')' }),
          el('button', { type: 'button', class: 'btn btn-sm stone', text: 'Close', onclick: close })
        ]),
        list.length ? grid : el('p', { class: 'muted center', text: 'No paintings yet. Paint one and tap Save.' })
      ]));
      modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
      container.appendChild(modal);
      return modal;
    }
    function done() {
      sfx('click');
      window.removeEventListener('resize', size);
      doneResolve({ score: 0, pay: 0 });
      if (BT.screen.current !== 'town') BT.screen.show('town');
    }

    // ---------- layout ----------
    var root = el('div', { class: 'painter' }, [
      el('div', { class: 'painter-head' }, [
        el('h2', { text: '🎨 Paint Studio' }),
        nameInput,
        el('span', { class: 'spacer' }),
        el('button', { type: 'button', class: 'btn btn-sm violet', text: 'Gallery', onclick: gallery }),
        el('button', { type: 'button', class: 'btn btn-sm mint', text: 'Save', onclick: save }),
        el('button', { type: 'button', class: 'btn btn-sm gold', text: 'Done', onclick: done })
      ]),
      el('div', { class: 'painter-body' }, [
        el('div', { class: 'painter-canvas-host' }, canvas),
        el('div', { class: 'painter-side' }, [palette, tools])
      ])
    ]);
    container.appendChild(root);
    setColor(1); setTool('pencil');
    size();
    window.addEventListener('resize', size);
    // Hooks for tests and for the town (billboards read BT.state.paintings directly).
    api.current = { get: function () { return px.slice(); }, set: function (a) { px = decode(encode(a)); draw(); }, tool: setTool, color: setColor,
      save: save, undo: function () { undoBtn.click(); }, gallery: gallery, done: done, canvas: canvas, undoDepth: function () { return undo.length; } };
    return p;
  }

  var api = BT.minigames.painter = {
    palette: PALETTE, names: NAMES, max: MAX, start: start, encode: encode, decode: decode, fill: fill, blank: blank, thumbSVG: thumbSVG, current: null
  };
  BT.registerMinigame('painter', { title: 'Paint Studio', icon: '🎨', blurb: 'Pixel art for your town billboards. No clock, no pay, just paint.', start: start });

  BT.registerChecks('painter', [
    { name: '12 colors, matches the town palette', fn: function () {
      return PALETTE.length === 12 && (!BT.town || !BT.town.palette || BT.town.palette.join() === PALETTE.join());
    } },
    { name: 'encode/decode round-trips 256 chars', fn: function () {
      var a = blank(); for (var i = 0; i < 256; i++) a[i] = i % 12;
      var s = encode(a);
      return s.length === 256 && /^[0-9ab]+$/.test(s) && decode(s).join() === a.join() && decode('zz!').length === 256;
    } },
    { name: 'flood fill stops at a wall and skips no-ops', fn: function () {
      var a = blank(); for (var x = 0; x < 16; x++) a[8 * 16 + x] = 1; // row 8 is a wall
      var n = fill(a, 0, 2);
      return n === 128 && a[7 * 16 + 15] === 2 && a[9 * 16] === 0 && fill(a, 0, 2) === 0;
    } },
    { name: 'start renders, paints, undoes, saves (max 12) and resolves on Done', fn: function () {
      var keep = JSON.stringify(BT.state.paintings), keepEv = BT.state.events.length, keepCur = api.current;
      var host = el('div', { style: { position: 'fixed', left: '-2000px', top: '0', width: '600px', height: '500px', display: 'flex' } });
      document.body.appendChild(host);
      var resolved = false;
      var ok = false;
      try {
        BT.state.paintings = [];
        var p = start(host, { fromTown: true }); p.then(function () { resolved = true; });
        var c = api.current;
        if (!host.querySelector('.painter-canvas') || host.querySelectorAll('.painter-swatch').length !== 12) throw new Error('no canvas or palette');
        var r = c.canvas.getBoundingClientRect();
        if (r.width < 16 * 12) throw new Error('canvas too small: ' + r.width);
        function pev(type, cx, cy) { c.canvas.dispatchEvent(new PointerEvent(type, { clientX: cx, clientY: cy, bubbles: true, pointerId: 1, isPrimary: true })); }
        var cw = r.width / 16;
        pev('pointerdown', r.left + cw * 0.5, r.top + cw * 0.5); pev('pointermove', r.left + cw * 1.5, r.top + cw * 0.5); pev('pointerup', r.left + cw * 1.5, r.top + cw * 0.5);
        var a = c.get();
        if (a[0] !== 1 || a[1] !== 1 || c.undoDepth() !== 1) throw new Error('pencil drag did not paint: ' + a[0] + a[1] + ' undo ' + c.undoDepth());
        c.tool('fill'); c.color(4);
        pev('pointerdown', r.left + cw * 8, r.top + cw * 8); pev('pointerup', r.left + cw * 8, r.top + cw * 8);
        a = c.get();
        if (a[255] !== 4 || a[0] !== 1) throw new Error('fill failed');
        c.undo(); a = c.get();
        if (a[255] !== 0 || a[0] !== 1) throw new Error('undo failed');
        var before = BT.state.events.length;
        host.querySelector('.painter-name').value = 'Test art';
        if (!c.save() || BT.state.paintings.length !== 1 || BT.state.paintings[0].pixels.length !== 256) throw new Error('save failed');
        if (BT.state.events[BT.state.events.length - 1].type !== 'painting_saved') throw new Error('painting_saved not logged');
        if (!c.save() || BT.state.paintings.length !== 1) throw new Error('same name should overwrite');
        BT.state.paintings.push({ title: 'Painting 2', pixels: encode(blank()) });
        host.querySelector('.painter-name').value = '';
        if (!c.save() || BT.state.paintings.length !== 3 || BT.state.paintings[2].title !== 'Painting 1') throw new Error('default name should skip taken numbers');
        BT.state.paintings.splice(1, 2);
        for (var i = 0; i < 11; i++) BT.state.paintings.push({ title: 'p' + i, pixels: encode(blank()) });
        host.querySelector('.painter-name').value = 'one too many';
        if (c.save() || BT.state.paintings.length !== 12) throw new Error('max 12 not enforced');
        c.gallery();
        if (host.querySelectorAll('.painter-card').length !== 12) throw new Error('gallery count');
        host.querySelector('.modal').remove();
        var cur = BT.screen.current;
        BT.screen.show('town');
        c.done();
        if (cur) BT.screen.show(cur);
        ok = true;
      } finally {
        host.remove();
        api.current = keepCur;
        BT.state.paintings = JSON.parse(keep);
        BT.state.events.length = Math.min(BT.state.events.length, keepEv);
        BT.save();
      }
      return ok;
    } }
  ]);
})();
