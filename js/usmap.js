// BT.usmap: the USA as a 12x8 block map (one rounded square per state, lighter top face, darker bottom edge).
// API: BT.usmap.render(container, {onTap(abbr), pins:[{abbr,label,color,locked,sub}], highlight:[abbr], labels:true})  (sub: small text, e.g. the unlock amount)
//      BT.usmap.flash(abbr, 'good'|'bad')   BT.usmap.highlight([abbr])   BT.usmap.tile(abbr) -> <g>
// Pure SVG, scales from 360px to 1100px wide; abbreviations stay legible (font 40 of a 100-unit tile).
(function () {
  'use strict';
  var BT = window.BT;
  var T = 100, GAP = 8, EDGE = 9, COLS = 12, ROWS = 8;
  var REGION = { Northeast: '#8b6cff', Midwest: '#6ec6ff', South: '#ff9f68', West: '#3ddc97' };
  var NS = 'http://www.w3.org/2000/svg';

  function shade(hex, k) { // k<0 darker, k>0 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(c) { return Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k)))); }
    return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  function node(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  (function css() {
    var s = document.createElement('style');
    s.textContent = [
      '.usmap{display:block;width:100%;height:auto;max-height:100%;touch-action:manipulation;overflow:visible}',
      '.usmap text{font-family:var(--font);font-weight:700;pointer-events:none}',
      '.usmap-tile{cursor:pointer}',
      '.usmap-tile .face{transition:fill .15s}',
      '.usmap-tile.hl .face{fill:var(--gold);stroke:var(--ink);stroke-width:5}',
      '.usmap-tile.pressed > :not(.side){transform:translateY(' + EDGE + 'px)} .usmap-tile.pressed .side{display:none}', // a CSS transform on the <g> itself would override its translate attribute
      '.usmap-tile.flash-good .face{animation:usmapGood .9s ease-out}',
      '.usmap-tile.flash-bad .face{animation:usmapBad .9s ease-out}',
      '@keyframes usmapGood{0%,70%{fill:var(--mint);stroke:#1f8f5f;stroke-width:6}100%{}}',
      '@keyframes usmapBad{0%,70%{fill:var(--coral);stroke:#b23a3a;stroke-width:6}100%{}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  // One pin per state: a small flag top-left, the abbreviation top-right, the job emoji big in the middle
  // (an unlocked job wins over a locked one), a count badge bottom-right when the state has several jobs,
  // and pin.sub (the unlock amount for a locked pin) in small print along the bottom. Locked pins are grey.
  // The job board passes no sub, so a locked pin finds its unlock amount from the cheapest job tier in its state.
  function unlockAmount(abbr) {
    var data = BT.jobs && BT.jobs.data, tiers = BT.TIERS;
    if (!data || !tiers) return '';
    var t = data.filter(function (j) { return j.state === abbr; }).reduce(function (m, j) { return Math.min(m, j.tier); }, Infinity);
    var amt = tiers[t - 1];
    return amt == null ? '' : (BT.fmt ? BT.fmt(amt) : '$' + amt);
  }

  function drawPins(g, W, H, pins, labels) {
    var pin = pins.filter(function (p) { return !p.locked; })[0] || pins[0];
    var col = pin.locked ? '#8d99a6' : (pin.color || '#ff6b6b');
    if (pin.locked && !pin.sub) pin = Object.assign({}, pin, { sub: unlockAmount(pin.abbr) });
    g.appendChild(node('rect', { x: 4, y: 3, width: 4, height: 18, rx: 2, fill: '#1e2430' }));
    g.appendChild(node('polygon', { points: [8, 3, 24, 9, 8, 15].join(' '), fill: col, stroke: '#1e2430', 'stroke-width': 2 }));
    if (labels === false) return;
    if (pin.label) {
      var big = pin.locked && pin.sub ? 30 : 40;
      g.appendChild(node('text', { class: 'pin-label', x: W / 2, y: pin.sub ? 56 : 66, 'text-anchor': 'middle', 'font-size': big, fill: pin.locked ? '#55606d' : '#1e2430', opacity: pin.locked ? 0.7 : 1 }, String(pin.label)));
    }
    if (pin.sub) g.appendChild(node('text', { class: 'pin-sub', x: W / 2, y: H - 6, 'text-anchor': 'middle', 'font-size': 17, fill: '#55606d' }, String(pin.sub)));
    if (pins.length > 1) {
      g.appendChild(node('circle', { class: 'pin-count', cx: W - 13, cy: H - 13, r: 12, fill: '#1e2430', stroke: '#fff', 'stroke-width': 2 }));
      g.appendChild(node('text', { x: W - 13, y: H - 7, 'text-anchor': 'middle', 'font-size': 18, fill: '#fff' }, String(pins.length)));
    }
  }

  function render(container, opts) {
    opts = opts || {};
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return null;
    container.innerHTML = '';
    var pinsBy = {};
    (opts.pins || []).forEach(function (p) { (pinsBy[p.abbr] = pinsBy[p.abbr] || []).push(p); });
    var hl = {};
    (opts.highlight || []).forEach(function (a) { hl[a] = 1; });

    var svg = node('svg', { class: 'usmap', viewBox: '0 0 ' + (COLS * T) + ' ' + (ROWS * T + EDGE), role: 'img', 'aria-label': 'Map of the United States' });
    var W = T - GAP, H = T - GAP - EDGE;
    BT.states.forEach(function (st) {
      var x = st.col * T + GAP / 2, y = st.row * T + GAP / 2, base = REGION[st.region] || '#8d99a6';
      var g = node('g', { class: 'usmap-tile' + (hl[st.abbr] ? ' hl' : ''), 'data-abbr': st.abbr, transform: 'translate(' + x + ' ' + y + ')' });
      g.appendChild(node('rect', { class: 'side', x: 0, y: EDGE, width: W, height: H, rx: 14, fill: shade(base, -0.4) }));
      g.appendChild(node('rect', { class: 'face', x: 0, y: 0, width: W, height: H, rx: 14, fill: shade(base, 0.12), stroke: shade(base, -0.25), 'stroke-width': 3 }));
      g.appendChild(node('rect', { x: 10, y: 6, width: W - 20, height: 10, rx: 5, fill: '#fff', opacity: 0.35 })); // lighter top face
      var pins = pinsBy[st.abbr] || [];
      if (opts.labels !== false) {
        var crowded = pins.length > 0; // with a pin: abbreviation small top-right, the pin's emoji takes the middle
        g.appendChild(node('text', crowded ? { x: W - 6, y: 26, 'text-anchor': 'end', 'font-size': 26, fill: '#1e2430' }
          : { x: W / 2, y: H / 2 + 14, 'text-anchor': 'middle', 'font-size': 40, fill: '#1e2430' }, st.abbr));
      }
      if (pins.length) drawPins(g, W, H, pins, opts.labels);
      g.appendChild(node('title', {}, st.name));
      svg.appendChild(g);
    });

    // tap = pointerdown + pointerup on the same tile without a drag (so a scrolling finger does not pick a state)
    var down = null;
    function tileOf(e) { var t = e.target && e.target.closest ? e.target.closest('.usmap-tile') : null; return t; }
    svg.addEventListener('pointerdown', function (e) {
      var t = tileOf(e); if (!t) return;
      down = { abbr: t.dataset.abbr, x: e.clientX, y: e.clientY, el: t };
      t.classList.add('pressed');
    });
    function up(e) {
      if (!down) return;
      down.el.classList.remove('pressed');
      var t = tileOf(e), moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 14;
      if (t && t.dataset.abbr === down.abbr && !moved && typeof opts.onTap === 'function') {
        if (BT.sfx && BT.sfx.click) BT.sfx.click();
        opts.onTap(down.abbr, BT.stateByAbbr ? BT.stateByAbbr(down.abbr) : null);
      }
      down = null;
    }
    svg.addEventListener('pointerup', up);
    function clear() { if (down) { down.el.classList.remove('pressed'); down = null; } }
    svg.addEventListener('pointercancel', clear);
    svg.addEventListener('pointerleave', clear); // a mouse released outside the map must not leave a tile pressed
    svg.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    container.appendChild(svg);
    BT.usmap.last = { container: container, svg: svg, opts: opts };
    return svg;
  }

  function tiles(abbr) { return document.querySelectorAll('.usmap-tile[data-abbr="' + abbr + '"]'); }

  function flash(abbr, kind) {
    var cls = kind === 'bad' || kind === false ? 'flash-bad' : 'flash-good';
    tiles(abbr).forEach(function (t) {
      t.classList.remove('flash-good', 'flash-bad'); void t.getBoundingClientRect();
      t.classList.add(cls);
      setTimeout(function () { t.classList.remove(cls); }, BT.TEST ? 30 : 950);
    });
    if (BT.sfx) (kind === 'bad' ? BT.sfx.bad : BT.sfx.good)();
  }

  // Replace the highlighted set on every rendered map (or only inside root) (used by the creator and geography hints).
  function highlight(list, root) {
    var set = {};
    (Array.isArray(list) ? list : [list]).forEach(function (a) { if (a) set[a] = 1; });
    (root || document).querySelectorAll('.usmap-tile').forEach(function (t) { t.classList.toggle('hl', !!set[t.dataset.abbr]); });
  }

  BT.usmap = { render: render, flash: flash, highlight: highlight, tile: function (abbr) { return tiles(abbr)[0] || null; }, REGION: REGION, COLS: COLS, ROWS: ROWS };

  function fire(el, type) {
    var ev = window.PointerEvent ? new PointerEvent(type, { bubbles: true, clientX: 10, clientY: 10, pointerId: 1 })
      : new MouseEvent(type, { bubbles: true, clientX: 10, clientY: 10 });
    el.dispatchEvent(ev);
  }
  BT.registerChecks('usmap', [
    { name: 'renders 50 tiles with abbreviations, pins and highlight', fn: function () {
      var box = BT.el('div');
      document.body.appendChild(box);
      var svg = render(box, { pins: [{ abbr: 'TX', label: '$20', color: '#f00' }, { abbr: 'TX', label: 'x', locked: true }, { abbr: 'CO', label: '🔒', sub: '$1,000', locked: true }], highlight: ['CA'] });
      var ok = svg.querySelectorAll('.usmap-tile').length === 50 &&
        svg.querySelector('.usmap-tile[data-abbr="ME"] text').textContent === 'ME' &&
        svg.querySelectorAll('.usmap-tile[data-abbr="TX"] polygon').length === 1 &&
        svg.querySelector('.usmap-tile[data-abbr="CO"]').textContent.indexOf('$1,000') >= 0 &&
        svg.querySelector('.usmap-tile[data-abbr="TX"] .pin-count + text').textContent === '2' && // one pin per state, count badge
        svg.querySelector('.usmap-tile[data-abbr="TX"] .pin-label').textContent === '$20' && // the unlocked job shows
        +svg.querySelector('.usmap-tile[data-abbr="TX"] .pin-label').getAttribute('font-size') >= 40 &&
        svg.querySelector('.usmap-tile[data-abbr="CA"]').classList.contains('hl');
      box.remove();
      return ok;
    } },
    { name: 'tap calls onTap with the abbr; a drag does not', fn: function () {
      var box = BT.el('div'), got = [];
      document.body.appendChild(box);
      render(box, { onTap: function (a) { got.push(a); } });
      var fl = box.querySelector('.usmap-tile[data-abbr="FL"] .face'); // not BT.usmap.tile: the creator's map may be on screen too
      fire(fl, 'pointerdown'); fire(fl, 'pointerup');
      fire(fl, 'pointerdown');
      fl.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 200, clientY: 10 }));
      box.remove();
      return got.length === 1 && got[0] === 'FL';
    } },
    { name: 'flash and highlight toggle classes', fn: function () {
      var box = BT.el('div');
      document.body.appendChild(box);
      render(box, {});
      flash('WA', 'good'); var a = BT.usmap.tile('WA').classList.contains('flash-good');
      flash('WA', 'bad'); var b = BT.usmap.tile('WA').classList.contains('flash-bad');
      highlight(['NY', 'NJ']); var c = BT.usmap.tile('NY').classList.contains('hl') && !BT.usmap.tile('WA').classList.contains('hl');
      box.remove();
      return a && b && c;
    } },
    { name: 'map stays inside 12x8 and every tile has a region color', fn: function () {
      return BT.states.every(function (s) { return s.col >= 0 && s.col < COLS && s.row >= 0 && s.row < ROWS && REGION[s.region]; });
    } }
  ]);
})();
