// BT.rounds.logic: the logic round. Procedural number patterns and algebra (answers computed),
// SVG shape/color sequences, plus bank items from BT.data.logic (odd one out, if-then, grid logic).
// Hint = the rule's first clue. Registers with BT.registerRound.
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var recent = [];      // bank ids shown lately
  var lastKind = null;  // never the same kind twice in a row

  // ---------- shapes drawn in code ----------
  var COLORS = { red: '#ff6b6b', blue: '#6ec6ff', green: '#3ddc97', yellow: '#ffcf3f', purple: '#8b6cff', orange: '#ff9f43' };
  var SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'arrow'];
  function poly(n, r, rot) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (rot || 0) + i * 2 * Math.PI / n;
      pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }
  function starPts(r) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push((50 + rr * Math.cos(a)).toFixed(1) + ',' + (50 + rr * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }
  // shapeSVG('circle', 'red', {size: 1|0.6, rot: degrees, px: 72}) -> inline SVG string on a 100x100 viewBox
  function shapeSVG(shape, color, o) {
    o = o || {};
    var fill = COLORS[color] || color || '#8d99a6', r = 38 * (o.size || 1), s = 'stroke="#1e2430" stroke-width="5" stroke-linejoin="round"';
    var body;
    if (shape === 'circle') body = '<circle cx="50" cy="50" r="' + r + '" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'square') body = '<rect x="' + (50 - r) + '" y="' + (50 - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" rx="6" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'triangle') body = '<polygon points="' + poly(3, r * 1.1) + '" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'diamond') body = '<polygon points="' + poly(4, r * 1.05) + '" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'star') body = '<polygon points="' + starPts(r * 1.1) + '" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'hexagon') body = '<polygon points="' + poly(6, r, Math.PI / 6) + '" fill="' + fill + '" ' + s + '/>';
    else if (shape === 'arrow') body = '<polygon points="50,' + (50 - r) + ' ' + (50 + r * 0.9) + ',' + (50 + r * 0.2) + ' ' + (50 + r * 0.35) + ',' + (50 + r * 0.2) +
      ' ' + (50 + r * 0.35) + ',' + (50 + r) + ' ' + (50 - r * 0.35) + ',' + (50 + r) + ' ' + (50 - r * 0.35) + ',' + (50 + r * 0.2) + ' ' + (50 - r * 0.9) + ',' + (50 + r * 0.2) + '" fill="' + fill + '" ' + s + '/>';
    else body = '<text x="50" y="66" font-size="52" font-weight="700" text-anchor="middle" fill="#8d99a6">?</text>';
    var px = o.px || 72;
    return '<svg viewBox="0 0 100 100" width="' + px + '" height="' + px + '" aria-hidden="true" style="display:block;margin:0 auto">' +
      (o.rot ? '<g transform="rotate(' + o.rot + ' 50 50)">' + body + '</g>' : body) + '</svg>';
  }
  var DIRS = ['up', 'right', 'down', 'left'];
  // "big red circle" | "green arrow pointing left" -> {shape, color, size, rot}; null when not a shape label
  function parseLabel(label) {
    var w = String(label).toLowerCase().split(/\s+/), out = { size: 1, rot: 0 };
    w.forEach(function (x) {
      if (COLORS[x]) out.color = x;
      else if (SHAPES.indexOf(x) >= 0) out.shape = x;
      else if (x === 'small') out.size = 0.6;
      else if (DIRS.indexOf(x) >= 0) out.rot = DIRS.indexOf(x) * 90;
    });
    return out.shape && out.color ? out : null;
  }
  function labelSVG(label, px) {
    var p = parseLabel(label);
    return p ? shapeSVG(p.shape, p.color, { size: p.size, rot: p.rot, px: px }) : shapeSVG('?', '', { px: px });
  }
  function gridSVG(cells) {
    var h = '<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true" style="display:block;max-width:240px;margin:0 auto">';
    cells.forEach(function (c, i) {
      var x = (i % 3) * 100, y = Math.floor(i / 3) * 100;
      h += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="94" height="94" rx="12" fill="' + (c === '?' ? '#fff3b0' : '#fff8e7') + '" stroke="#1e2430" stroke-width="3"/>';
      h += '<svg x="' + (x + 10) + '" y="' + (y + 10) + '" width="80" height="80" viewBox="0 0 100 100">' + labelSVG(c, 100).replace(/<svg[^>]*>|<\/svg>/g, '') + '</svg>';
    });
    return h + '</svg>';
  }
  function seqSVG(labels) {
    var n = labels.length + 1, w = 100 * n;
    var h = '<svg viewBox="0 0 ' + w + ' 110" width="100%" height="100%" aria-hidden="true" style="display:block;max-height:160px">';
    for (var i = 0; i < n; i++) {
      var last = i === labels.length;
      h += '<rect x="' + (i * 100 + 4) + '" y="4" width="92" height="102" rx="12" fill="' + (last ? '#fff3b0' : '#fff8e7') + '" stroke="#1e2430" stroke-width="3"/>';
      h += '<svg x="' + (i * 100 + 10) + '" y="10" width="80" height="90" viewBox="0 0 100 100">' + labelSVG(last ? '?' : labels[i], 100).replace(/<svg[^>]*>|<\/svg>/g, '') + '</svg>';
    }
    return h + '</svg>';
  }

  // ---------- distractors ----------
  function distract(ans, cands) {
    var out = [ans], i = 0;
    cands.forEach(function (c) { if (out.length < 4 && isFinite(c) && c !== ans && out.indexOf(c) < 0 && c >= 0 && c === Math.round(c)) out.push(c); });
    while (out.length < 4) { i++; var c = ans + (i % 2 ? i : -i); if (c >= 0 && out.indexOf(c) < 0) out.push(c); }
    return out.map(String);
  }

  // ---------- number patterns: {q, options, answer, why, hint, kind:'numpat'} ----------
  function numpat(level) {
    var start, d, d2, k, terms = [], rule, hint, i;
    var type = BT.pick(level <= 1 ? ['add', 'add', 'sub'] : level === 2 ? ['add', 'sub', 'mul', 'alt'] : level === 3 ? ['mul', 'alt', 'square', 'tri']
      : level === 4 ? ['fib', 'grow', 'muladd', 'square'] : ['fib', 'grow', 'muladd', 'sq2']);
    if (type === 'add') { start = BT.rand(1, 20); d = BT.rand(2, 5 + level * 3); for (i = 0; i < 6; i++) terms.push(start + d * i);
      rule = 'Each number goes up by ' + d + '.'; hint = 'From ' + terms[0] + ' to ' + terms[1] + ' it goes up by ' + d + '.'; }
    else if (type === 'sub') { d = BT.rand(2, 4 + level * 3); start = BT.rand(d * 6, d * 6 + 40); for (i = 0; i < 6; i++) terms.push(start - d * i);
      rule = 'Each number goes down by ' + d + '.'; hint = 'From ' + terms[0] + ' to ' + terms[1] + ' it goes down by ' + d + '.'; }
    else if (type === 'mul') { k = BT.pick(level >= 4 ? [2, 3, 4] : [2, 3]); start = BT.rand(1, k === 2 ? 6 : 3); for (i = 0; i < 6; i++) terms.push(start * Math.pow(k, i));
      rule = 'Each number is ' + k + ' times the one before.'; hint = 'From ' + terms[0] + ' to ' + terms[1] + ': multiply, do not add.'; }
    else if (type === 'alt') { start = BT.rand(1, 15); d = BT.rand(1, 5); d2 = BT.rand(d + 1, d + 6); terms.push(start);
      for (i = 1; i < 6; i++) terms.push(terms[i - 1] + (i % 2 ? d : d2));
      rule = 'The steps take turns: +' + d + ', then +' + d2 + ', then +' + d + ' again.'; hint = 'The first step is +' + d + '. Check whether the second step is the same.'; }
    else if (type === 'square') { start = BT.rand(1, 3); for (i = 0; i < 6; i++) terms.push((start + i) * (start + i));
      rule = 'These are square numbers: ' + start + '×' + start + ', ' + (start + 1) + '×' + (start + 1) + ', and so on.'; hint = terms[0] + ' is ' + start + '×' + start + '. Try the next number times itself.'; }
    else if (type === 'tri') { start = BT.rand(1, 6); terms.push(start); for (i = 1; i < 6; i++) terms.push(terms[i - 1] + start + i);
      rule = 'Each step is one bigger than the step before: +' + (start + 1) + ', +' + (start + 2) + ', +' + (start + 3) + '...'; hint = 'The first step is +' + (start + 1) + '. The next step grows by 1.'; }
    else if (type === 'fib') { terms.push(BT.rand(1, 5)); terms.push(BT.rand(terms[0], terms[0] + 5)); for (i = 2; i < 6; i++) terms.push(terms[i - 1] + terms[i - 2]);
      rule = 'Each number is the sum of the two before it.'; hint = terms[0] + ' + ' + terms[1] + ' = ' + terms[2] + '. Try adding neighbors.'; }
    else if (type === 'grow') { start = BT.rand(1, 10); d = BT.rand(1, 4); d2 = BT.rand(2, 4); terms.push(start);
      for (i = 1; i < 6; i++) terms.push(terms[i - 1] + d + d2 * (i - 1));
      rule = 'The steps grow by ' + d2 + ' each time: +' + d + ', +' + (d + d2) + ', +' + (d + 2 * d2) + '...'; hint = 'The first step is +' + d + '. Is the second step bigger?'; }
    else if (type === 'muladd') { k = 2; d = BT.pick([-1, 1, 3]); start = BT.rand(2, 6); terms.push(start); for (i = 1; i < 6; i++) terms.push(terms[i - 1] * k + d);
      rule = 'Double the number, then ' + (d < 0 ? 'take away ' + (-d) : 'add ' + d) + '.'; hint = 'Start by doubling ' + terms[0] + ': that gives ' + 2 * terms[0] + '. How far is that from ' + terms[1] + '?'; }
    else { start = BT.rand(1, 3); d = BT.rand(1, 9); for (i = 0; i < 6; i++) terms.push((start + i) * (start + i) + d);
      rule = 'Square numbers plus ' + d + ': ' + start + '×' + start + '+' + d + ', ' + (start + 1) + '×' + (start + 1) + '+' + d + '...'; hint = 'The steps between numbers grow by 2 each time.'; }
    var shown = terms.slice(0, 5), ans = terms[5], prev = terms[4], last = prev - terms[3], pl = terms[3] - terms[2];
    var options = BT.shuffle(distract(ans, [prev + last, prev + pl, ans + 1, ans - 1, prev * 2, ans + last, prev + last + 1]));
    return { kind: 'numpat', q: 'What comes next?  ' + shown.join(', ') + ', ?', options: options, answer: String(ans),
      why: rule + ' So after ' + prev + ' comes ' + ans + '.', hint: hint, terms: terms };
  }

  // ---------- algebra: □ equations with a verify(x) for the checks ----------
  function algebra(level) {
    var a, b, c, x, q, why, hint, verify;
    var forms = level <= 2 ? ['plus', 'minus', 'plus2'] : level === 3 ? ['times', 'div', 'from'] : level === 4 ? ['twoplus', 'timesminus', 'div'] : ['threeminus', 'bracket', 'divplus'];
    var f = BT.pick(forms);
    if (f === 'plus') { x = BT.rand(2, 30); a = BT.rand(2, 30); b = x + a; q = '□ + ' + a + ' = ' + b; why = 'Take ' + a + ' away from ' + b + ': ' + b + ' − ' + a + ' = ' + x + '.'; hint = 'Undo the + ' + a + ': take ' + a + ' away from both sides.'; verify = function (v) { return v + a === b; }; }
    else if (f === 'plus2') { x = BT.rand(2, 30); a = BT.rand(2, 30); b = x + a; q = a + ' + □ = ' + b; why = b + ' − ' + a + ' = ' + x + '.'; hint = 'How far is it from ' + a + ' up to ' + b + '?'; verify = function (v) { return a + v === b; }; }
    else if (f === 'minus') { x = BT.rand(10, 40); a = BT.rand(2, 9); b = x - a; q = '□ − ' + a + ' = ' + b; why = 'Add the ' + a + ' back: ' + b + ' + ' + a + ' = ' + x + '.'; hint = 'Undo the − ' + a + ': add ' + a + ' to ' + b + '.'; verify = function (v) { return v - a === b; }; }
    else if (f === 'times') { a = BT.rand(2, 9); x = BT.rand(2, 12); b = a * x; q = a + ' × □ = ' + b; why = b + ' ÷ ' + a + ' = ' + x + '.'; hint = 'Undo the × ' + a + ': divide ' + b + ' by ' + a + '.'; verify = function (v) { return a * v === b; }; }
    else if (f === 'div') { a = BT.rand(2, 9); b = BT.rand(2, 12); x = a * b; q = '□ ÷ ' + a + ' = ' + b; why = b + ' × ' + a + ' = ' + x + '.'; hint = 'Undo the ÷ ' + a + ': multiply ' + b + ' by ' + a + '.'; verify = function (v) { return v / a === b; }; }
    else if (f === 'from') { x = BT.rand(5, 40); b = BT.rand(5, 40); a = x + b; q = a + ' − □ = ' + b; why = a + ' − ' + b + ' = ' + x + '.'; hint = 'What do you take from ' + a + ' to land on ' + b + '?'; verify = function (v) { return a - v === b; }; }
    else if (f === 'twoplus') { x = BT.rand(2, 20); a = BT.rand(1, 15); b = 2 * x + a; q = '2 × □ + ' + a + ' = ' + b; why = 'First undo the + ' + a + ': ' + b + ' − ' + a + ' = ' + 2 * x + '. Then halve it: ' + x + '.'; hint = 'Undo the + ' + a + ' first: ' + b + ' − ' + a + '.'; verify = function (v) { return 2 * v + a === b; }; }
    else if (f === 'timesminus') { a = BT.rand(3, 6); x = BT.rand(2, 12); c = BT.rand(1, 9); b = a * x - c; q = a + ' × □ − ' + c + ' = ' + b; why = 'Add ' + c + ' back: ' + (b + c) + '. Then ' + (b + c) + ' ÷ ' + a + ' = ' + x + '.'; hint = 'Undo the − ' + c + ' first: ' + b + ' + ' + c + '.'; verify = function (v) { return a * v - c === b; }; }
    else if (f === 'threeminus') { x = BT.rand(3, 20); a = BT.rand(1, 20); b = 3 * x - a; q = '3 × □ − ' + a + ' = ' + b; why = 'Add ' + a + ' back: ' + (b + a) + '. Then divide by 3: ' + x + '.'; hint = 'Undo the − ' + a + ' first: ' + b + ' + ' + a + '.'; verify = function (v) { return 3 * v - a === b; }; }
    else if (f === 'bracket') { a = BT.rand(1, 9); c = BT.rand(2, 5); x = BT.rand(2, 15); b = (x + a) * c; q = '(□ + ' + a + ') × ' + c + ' = ' + b; why = 'Undo the × ' + c + ': ' + b + ' ÷ ' + c + ' = ' + (x + a) + '. Then take away ' + a + ': ' + x + '.'; hint = 'The last thing done was × ' + c + '. Undo that first.'; verify = function (v) { return (v + a) * c === b; }; }
    else { a = BT.rand(2, 5); x = a * BT.rand(2, 10); c = BT.rand(1, 10); b = x / a + c; q = '□ ÷ ' + a + ' + ' + c + ' = ' + b; why = 'Take away ' + c + ': ' + (b - c) + '. Then multiply by ' + a + ': ' + x + '.'; hint = 'Undo the + ' + c + ' first: ' + b + ' − ' + c + '.'; verify = function (v) { return v / a + c === b; }; }
    var options = BT.shuffle(distract(x, [x + a, x - a, Math.abs(b - a), x + 1, x - 1, x * 2, b, x + 2]));
    return { kind: 'algebra', q: 'What number goes in the box?  ' + q, options: options, answer: String(x), why: why + ' Check: it makes the sides equal.', hint: hint, verify: verify };
  }

  // ---------- shape sequences ----------
  function shapeSeq(level) {
    var shapes = BT.shuffle(['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']), colors = BT.shuffle(Object.keys(COLORS));
    var n = 7, labels = [], rule, hint, i, ps, pc;
    function lab(sh, co, size, dir) { return (size === 'small' ? 'small ' : '') + co + ' ' + sh + (dir ? ' pointing ' + dir : ''); }
    if (level <= 2) {
      var period = level === 1 ? BT.pick([2, 3]) : BT.pick([3, 4]);
      var units = [];
      for (i = 0; i < period; i++) units.push(lab(shapes[i], colors[i]));
      for (i = 0; i <= n; i++) labels.push(units[i % period]);
      rule = 'The same ' + period + ' pictures repeat: ' + units.join(', ') + '.'; hint = 'The pattern starts over after ' + units[period - 1] + '.';
    } else if (level === 3) {
      ps = 2; pc = 3;
      for (i = 0; i <= n; i++) labels.push(lab(shapes[i % ps], colors[i % pc]));
      rule = 'The shapes take turns (' + shapes[0] + ', ' + shapes[1] + ') while the colors cycle through three (' + colors.slice(0, 3).join(', ') + ').';
      hint = 'Look at the shapes alone first: ' + shapes[0] + ', ' + shapes[1] + ', ' + shapes[0] + '...';
    } else if (level === 4) {
      ps = 3; pc = 2;
      for (i = 0; i <= n; i++) labels.push(lab(shapes[i % ps], colors[i % pc], i % 2 ? 'small' : 'big'));
      rule = 'Three shapes cycle (' + shapes.slice(0, 3).join(', ') + '), and every other picture is small and ' + colors[1] + '.';
      hint = 'Look at the shapes alone first: ' + shapes[0] + ', ' + shapes[1] + ', ' + shapes[2] + ', then back to ' + shapes[0] + '.';
    } else {
      var step = BT.pick([1, 3]); pc = 3;
      for (i = 0; i <= n; i++) labels.push(lab('arrow', colors[i % pc], null, DIRS[(i * step) % 4]));
      rule = 'The arrow turns a quarter ' + (step === 1 ? 'clockwise' : 'counter-clockwise') + ' each time, and the colors cycle through three (' + colors.slice(0, 3).join(', ') + ').';
      hint = 'Watch only where the arrow points: ' + DIRS[0] + ', ' + DIRS[step % 4] + ', ' + DIRS[(2 * step) % 4] + '...';
    }
    var shown = labels.slice(0, n), ans = labels[n], p = parseLabel(ans);
    var cands = [];
    shapes.concat(['arrow']).forEach(function (sh) { if (sh !== p.shape && (level < 5 ? sh !== 'arrow' : sh === 'arrow')) cands.push(lab(sh, p.color, p.size < 1 ? 'small' : null, level >= 5 ? DIRS[p.rot / 90] : null)); });
    Object.keys(COLORS).forEach(function (co) { if (co !== p.color) cands.push(lab(p.shape, co, p.size < 1 ? 'small' : null, level >= 5 ? DIRS[p.rot / 90] : null)); });
    if (level === 4) cands.push(lab(p.shape, p.color, p.size < 1 ? null : 'small'));
    if (level >= 5) DIRS.forEach(function (d) { if (d !== DIRS[p.rot / 90]) cands.push(lab('arrow', p.color, null, d)); });
    cands = BT.shuffle(cands).filter(function (c) { return c !== ans; });
    // prefer distractors that appear in the sequence (plausible), then anything
    var inSeq = cands.filter(function (c) { return shown.indexOf(c) >= 0; }), rest = cands.filter(function (c) { return shown.indexOf(c) < 0; });
    var options = [ans].concat(inSeq.slice(0, 2), rest).slice(0, 4);
    return { kind: 'shape', q: 'Which picture comes next?', svg: seqSVG(shown), options: BT.shuffle(options), answer: ans, visual: true,
      why: rule + ' So next comes a ' + ans + '.', hint: hint };
  }

  // ---------- bank ----------
  function bankItem(level, type) {
    var all = (BT.data && BT.data.logic || []).filter(function (it) { return !type || it.type === type; });
    if (!all.length) return null;
    var fresh = all.filter(function (it) { return recent.indexOf(it.id) < 0; });
    if (!fresh.length) { recent = []; fresh = all; }
    var pool = fresh.filter(function (it) { return it.level === level; });
    if (!pool.length) pool = fresh.filter(function (it) { return Math.abs(it.level - level) <= 1; });
    if (!pool.length) pool = fresh;
    var it = BT.pick(pool);
    recent.push(it.id); if (recent.length > 40) recent.shift();
    return { kind: it.type, id: it.id, q: it.q, svg: it.grid ? gridSVG(it.grid) : null, options: BT.shuffle(it.options), answer: it.answer, why: it.why, hint: it.hint, visual: !!it.grid };
  }

  // generate(level, kind?) -> question. kinds: numpat | algebra | shape | odd | ifthen | grid
  function generate(level, kind) {
    level = Math.min(5, Math.max(1, level || 1));
    if (!kind) {
      var kinds = ['numpat', 'shape', 'odd', 'ifthen'];
      if (level >= 2) kinds.push('algebra', 'numpat');
      if (level >= 3) kinds.push('grid');
      kinds = kinds.filter(function (k) { return k !== lastKind; });
      kind = BT.pick(kinds);
    }
    lastKind = kind;
    var q = kind === 'numpat' ? numpat(level) : kind === 'algebra' ? algebra(level) : kind === 'shape' ? shapeSeq(level) : bankItem(level, kind);
    return q || numpat(level);
  }

  // ---------- the round ----------
  function build(container, ctx) {
    ctx = ctx || {};
    var item = generate(ctx.level || 1);
    var started = performance.now(), hints = 0, missed = false, settled = false;
    var explain = typeof ctx.explain === 'function' ? ctx.explain : function () { return Promise.resolve(); };
    var el = BT.el;
    container.innerHTML = '';
    container.appendChild(el('div', { class: 'question', text: item.q }));
    if (item.svg) container.appendChild(el('div', { class: 'logic-fig', html: item.svg, style: { maxWidth: '640px', margin: '0 auto', width: '100%' } }));
    var grid = el('div', { class: 'options' });
    container.appendChild(grid);
    var hintLine = el('p', { class: 'muted center', style: { minHeight: '1.4em', margin: '0' } });
    var hintBtn = el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint' });
    container.appendChild(el('div', { class: 'btn-row' }, hintBtn));
    container.appendChild(hintLine);

    return new Promise(function (resolve) {
      var buttons = item.options.map(function (label) {
        var btn = el('button', { class: 'option', type: 'button', data: { label: label } });
        if (item.visual) { btn.innerHTML = labelSVG(label, 64); btn.appendChild(el('div', { text: label, style: { fontSize: '.95rem', marginTop: '4px' } })); }
        else btn.textContent = label;
        btn.addEventListener('click', function () { onTap(btn, label); });
        grid.appendChild(btn);
        return btn;
      });
      function finish(result) {
        if (settled) return;
        settled = true;
        buttons.forEach(function (b) { b.disabled = true; });
        hintBtn.disabled = true;
        if (BT.test.roundHooks === hooks) BT.test.roundHooks = null;
        if (typeof ctx.done === 'function') ctx.done(result);
        resolve(result);
      }
      function onTap(btn, label) {
        if (settled || btn.disabled) return;
        var ms = Math.round(performance.now() - started);
        if (label === item.answer) {
          btn.classList.add('right');
          if (BT.sfx && BT.sfx.good) BT.sfx.good();
          finish({ correct: true, ms: ms, hints: hints, retry: missed, answer: label, skipped: false });
          return;
        }
        btn.classList.add('wrong'); btn.disabled = true;
        if (BT.sfx && BT.sfx.bad) BT.sfx.bad();
        if (!missed) {
          missed = true;
          explain(item.why + ' One more try.');
          return;
        }
        buttons.forEach(function (b) { if (b.dataset.label === item.answer) b.classList.add('right'); });
        explain(item.why).then(function () {
          finish({ correct: false, ms: ms, hints: hints, retry: false, answer: label, skipped: false });
        });
      }
      hintBtn.addEventListener('click', function () {
        if (settled || hintBtn.disabled) return;
        hints++;
        hintBtn.disabled = true;
        if (typeof ctx.onHint === 'function') ctx.onHint();
        hintLine.textContent = 'Clue: ' + item.hint;
      });
      var hooks = {
        subject: 'logic',
        currentAnswer: function () { return item.answer; },
        answer: function (label) {
          var b = buttons.filter(function (x) { return x.dataset.label === String(label) && !x.disabled; })[0];
          if (b) b.click();
          return !!b;
        }
      };
      BT.test.roundHooks = hooks;
    });
  }

  BT.rounds.logic = { title: 'Logic', icon: '🧩', build: build, generate: generate, numpat: numpat, algebra: algebra, shapeSeq: shapeSeq,
    shapeSVG: shapeSVG, gridSVG: gridSVG, parseLabel: parseLabel, COLORS: COLORS, SHAPES: SHAPES };
  BT.registerRound('logic', BT.rounds.logic);

  // ---------- checks ----------
  function A(c, m) { if (!c) throw new Error(m); }
  function fakeCtx(level, counters) {
    return { level: level, onHint: function () { counters.hints++; }, explain: function () { counters.explains++; return Promise.resolve(); } };
  }
  BT.registerChecks('logic', [
    { name: 'bank has 60+ well-formed items with unique ids', fn: function () {
      var bank = BT.data.logic, ids = {};
      A(bank.length >= 60, 'only ' + bank.length + ' items');
      bank.forEach(function (it) {
        A(it.id && !ids[it.id], 'dup/missing id ' + it.id); ids[it.id] = 1;
        A(it.level >= 1 && it.level <= 5, it.id + ' level');
        A(['odd', 'ifthen', 'grid'].indexOf(it.type) >= 0, it.id + ' type');
        A(typeof it.q === 'string' && it.q.length > 10, it.id + ' q');
        A(Array.isArray(it.options) && it.options.length === 4, it.id + ' options');
        var uniq = {}; it.options.forEach(function (o) { uniq[o] = 1; }); A(Object.keys(uniq).length === 4, it.id + ' duplicate options');
        A(it.options.indexOf(it.answer) >= 0, it.id + ' answer not in options');
        A(typeof it.why === 'string' && it.why.length > 10, it.id + ' why');
        A(typeof it.hint === 'string' && it.hint.length > 5, it.id + ' hint');
        if (it.type === 'grid') A(it.level >= 3, it.id + ' grid below L3');
        if (it.grid) {
          A(it.grid.length === 9 && it.grid.filter(function (c) { return c === '?'; }).length === 1, it.id + ' grid cells');
          it.grid.forEach(function (c) { A(c === '?' || parseLabel(c), it.id + ' bad cell ' + c); });
          it.options.forEach(function (o) { A(parseLabel(o), it.id + ' bad option ' + o); });
        }
      });
      A(bank.filter(function (it) { return it.type === 'odd'; }).length >= 15 && bank.filter(function (it) { return it.type === 'ifthen'; }).length >= 15 &&
        bank.filter(function (it) { return it.type === 'grid'; }).length >= 10, 'type mix');
      return true;
    } },
    { name: 'number patterns: 4 unique options, answer is the computed next term', fn: function () {
      for (var lv = 1; lv <= 5; lv++) for (var i = 0; i < 40; i++) {
        var q = numpat(lv), u = {};
        q.options.forEach(function (o) { u[o] = 1; });
        A(q.options.length === 4 && Object.keys(u).length === 4, 'options ' + q.q);
        A(q.options.indexOf(q.answer) >= 0 && String(q.terms[5]) === q.answer, 'answer ' + q.q);
        A(q.terms.every(function (t) { return isFinite(t) && t === Math.round(t); }), 'terms ' + q.q);
        A(q.hint && q.why, 'hint/why ' + q.q);
      }
      return true;
    } },
    { name: 'algebra: the answer satisfies the equation and no distractor does', fn: function () {
      for (var lv = 2; lv <= 5; lv++) for (var i = 0; i < 40; i++) {
        var q = algebra(lv);
        A(q.options.length === 4 && q.verify(Number(q.answer)), 'answer fails ' + q.q);
        q.options.forEach(function (o) { if (o !== q.answer) A(!q.verify(Number(o)), 'distractor also works ' + q.q + ' ' + o); });
      }
      return true;
    } },
    { name: 'shape sequences: svg drawn, 4 unique drawable options, answer follows the rule', fn: function () {
      for (var lv = 1; lv <= 5; lv++) for (var i = 0; i < 30; i++) {
        var q = shapeSeq(lv), u = {};
        A(q.svg.indexOf('<svg') === 0, 'svg');
        q.options.forEach(function (o) { u[o] = 1; A(parseLabel(o), 'bad label ' + o); });
        A(q.options.length === 4 && Object.keys(u).length === 4, 'options ' + q.options.join('|'));
        A(q.options.indexOf(q.answer) >= 0, 'answer');
      }
      var s = shapeSVG('star', 'red', { px: 40 });
      A(s.indexOf('<svg') === 0 && s.indexOf(COLORS.red) > 0 && s.indexOf('<polygon') > 0, 'shapeSVG');
      A(gridSVG(['red circle', 'blue square', 'green triangle', 'blue square', 'green triangle', 'red circle', 'green triangle', 'red circle', '?']).indexOf('<svg') === 0, 'gridSVG');
      return true;
    } },
    { name: 'generate picks every kind by level and never repeats a kind back to back', fn: function () {
      var seen = {}, prev = null;
      for (var i = 0; i < 120; i++) { var q = generate(5); seen[q.kind] = 1; A(q.kind !== prev, 'repeat kind ' + q.kind); prev = q.kind; }
      ['numpat', 'algebra', 'shape', 'odd', 'ifthen', 'grid'].forEach(function (k) { A(seen[k], 'never saw ' + k); });
      for (i = 0; i < 40; i++) { var k = generate(1).kind; A(k !== 'algebra' && k !== 'grid', 'L1 got ' + k); }
      return true;
    } },
    { name: 'build renders 4 options and a Hint; hint shows the clue once; right answer resolves', fn: function () {
      var box = document.createElement('div'), c = { hints: 0, explains: 0 }, result = null;
      var ctx = fakeCtx(2, c); ctx.done = function (r) { result = r; };
      build(box, ctx);
      A(box.querySelectorAll('.option').length === 4, 'options');
      var hint = Array.prototype.filter.call(box.querySelectorAll('.btn'), function (b) { return b.textContent === 'Hint'; })[0];
      A(hint, 'no hint button');
      hint.click(); hint.click();
      A(c.hints === 1 && box.textContent.indexOf('Clue:') >= 0, 'hint not shown once');
      A(typeof BT.test.currentAnswer() === 'string', 'currentAnswer');
      A(BT.test.answer() === true, 'answer hook');
      A(result && result.correct === true && result.hints === 1 && result.retry === false, 'bad result ' + JSON.stringify(result));
      A(BT.test.roundHooks === null, 'hooks not cleared');
      return true;
    } },
    { name: 'miss then right counts as a retry; two misses mark the answer and explain twice', fn: function () {
      var box = document.createElement('div'), c = { hints: 0, explains: 0 }, result = null;
      var ctx = fakeCtx(3, c); ctx.done = function (r) { result = r; };
      build(box, ctx);
      var ans = BT.test.currentAnswer();
      var wrong = Array.prototype.filter.call(box.querySelectorAll('.option'), function (b) { return b.dataset.label !== ans; });
      wrong[0].click();
      A(result === null && c.explains === 1 && wrong[0].classList.contains('wrong') && wrong[0].disabled, 'first miss');
      BT.test.answer(ans);
      A(result && result.correct === true && result.retry === true, 'retry ' + JSON.stringify(result));
      var box2 = document.createElement('div'), c2 = { hints: 0, explains: 0 };
      build(box2, fakeCtx(4, c2));
      var ans2 = BT.test.currentAnswer();
      var all2 = Array.prototype.slice.call(box2.querySelectorAll('.option'));
      var wrong2 = all2.filter(function (b) { return b.dataset.label !== ans2; }), right2 = all2.filter(function (b) { return b.dataset.label === ans2; })[0];
      wrong2[0].click(); wrong2[1].click();
      A(c2.explains === 2 && right2.classList.contains('right'), 'double miss');
      BT.test.roundHooks = null;
      return true;
    } }
  ]);
})();
