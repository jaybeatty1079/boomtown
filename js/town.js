// BT.town: the 10x10 blocky isometric town builder. All art is inline SVG drawn here.
// Grid cells hold a catalog id or null; 'home' is auto-placed and follows BT.state.home.
BT.town = BT.town || {};
(function () {
  'use strict';
  var BT = window.BT, el = BT.el, esc = BT.esc;
  var N = 10, HW = 32, HH = 20;               // half tile width/height in SVG units (steeper than 2:1 so a tile is >=44px tall on an iPad)
  var OX = HW * N, OY = 150;                  // origin so the diamond fits the viewBox
  var VW = HW * N * 2, VH = OY + HH * N * 2 + 16;
  var HOME_VALUE = { parents: 0, apartment: 800, townhouse: 2500, house: 6000, lakehouse: 15000, mansion: 40000 };
  var PALETTE = ['#ffffff', '#1e2430', '#ff6b6b', '#ffb347', '#ffcf3f', '#5fcf5a', '#3ddc97', '#6ec6ff', '#3b6fd6', '#8b6cff', '#8b5a2b', '#8d99a6'];

  // id, name, price, pop (houses 3, big buildings 10), draw key
  var CATALOG = [
    ['grass', 'Grass', 0, 0], ['road', 'Road', 20, 0], ['flowers', 'Flowers', 10, 0], ['tree', 'Tree', 15, 0],
    ['bush', 'Bush', 12, 0], ['fence', 'Fence', 8, 0], ['pond', 'Pond', 60, 0], ['house', 'Small house', 120, 3],
    ['cottage', 'Cottage', 180, 3], ['shop', 'Shop', 250, 10], ['cafe', 'Café', 300, 10], ['bakery', 'Bakery', 320, 10],
    ['fountain', 'Fountain', 400, 0], ['playground', 'Playground', 450, 0], ['school', 'School', 600, 10],
    ['library', 'Library', 650, 10], ['hospital', 'Hospital', 900, 10], ['firestation', 'Fire station', 800, 10],
    ['stadium', 'Stadium', 2000, 10], ['ferris', 'Ferris wheel', 2500, 10], ['skyscraper', 'Skyscraper', 3500, 10],
    ['castle', 'Castle', 6000, 10], ['billboard', 'Billboard', 150, 0]
  ].map(function (a) { return { id: a[0], name: a[1], price: a[2], pop: a[3] }; });
  var ICON_H = { skyscraper: 140, castle: 90, hospital: 80, ferris: 90, billboard: 72, school: 70, cafe: 60, bakery: 64, firestation: 72 };
  var BY_ID = {};
  CATALOG.forEach(function (c) { BY_ID[c.id] = c; });
  BY_ID.home = { id: 'home', name: 'Home', price: 0, pop: 3 };

  var sel = null, moving = null, shell = null, svgHost = null, catBar = null, nameEl = null, popEl = null, valEl = null;

  // ---------- color + iso helpers ----------
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(v * k))); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function center(r, c) { return { x: OX + (c - r) * HW, y: OY + (c + r) * HH }; }
  function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function poly(points, fill, extra) { return '<polygon points="' + pts(points) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  // A block: footprint scale s (0..1 of the tile), height h, sitting at ground offset z, color col.
  function box(x, y, s, h, col, z) {
    y -= z || 0;
    var w = HW * s, d = HH * s, t = y - h;
    return poly([[x, t - d], [x + w, t], [x, t + d], [x - w, t]], shade(col, 1.18)) +
      poly([[x - w, t], [x, t + d], [x, y + d], [x - w, y]], col) +
      poly([[x, t + d], [x + w, t], [x + w, y], [x, y + d]], shade(col, 0.72));
  }
  function diamond(x, y, s, fill, extra) {
    var w = HW * s, d = HH * s;
    return poly([[x, y - d], [x + w, y], [x, y + d], [x - w, y]], fill, extra);
  }
  // Windows on the left and right faces of a box: rows x cols
  function windows(x, y, s, h, rows, cols, col) {
    var out = '', w = HW * s, d = HH * s, top = y - h;
    for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) {
      var fy = top + 8 + i * ((h - 10) / rows), k = (j + 0.5) / cols;
      // left face: x from x-w to x, y slopes down by d
      var lx = x - w + k * w, ly = fy + k * d;
      out += poly([[lx - 3, ly - 3], [lx + 3, ly], [lx + 3, ly + 6], [lx - 3, ly + 3]], col || '#dff3ff');
      var rx = x + (1 - k) * w, ry = fy + k * d;
      out += poly([[rx - 3, ry], [rx + 3, ry - 3], [rx + 3, ry + 3], [rx - 3, ry + 6]], col || '#b8e2ff');
    }
    return out;
  }
  function roof(x, y, s, h, col, peak) {
    var w = HW * s, d = HH * s, t = y - h, apex = t - (peak || 14);
    return poly([[x - w, t], [x, t + d], [x, apex]], col) + poly([[x, t + d], [x + w, t], [x, apex]], shade(col, 0.72)) +
      poly([[x - w, t], [x, t - d], [x, apex]], shade(col, 1.15)) + poly([[x, t - d], [x + w, t], [x, apex]], shade(col, 0.9));
  }

  // ---------- item art ----------
  function paintingPixels(idx) {
    var list = BT.state.paintings || [];
    if (!list.length) return null;
    return list[idx % list.length];
  }
  function billboardArt(x, y, paintingIdx) {
    // board on the right face plane: 16x16 pixels sheared along the iso axis
    var out = box(x - 14, y, 0.08, 36, '#8b5a2b') + box(x + 14, y, 0.08, 36, '#8b5a2b', -7);
    var bx = x - 20, by = y - 56, pw = 2.5, ph = 2.5, slope = HH / HW, skew = (Math.atan(slope) * 180 / Math.PI).toFixed(2);
    var pal = (BT.minigames.painter && BT.minigames.painter.palette) || PALETTE;
    out += poly([[bx - 2, by - 2], [bx + 42, by - 2 + 44 * slope], [bx + 42, by + 42 + 44 * slope], [bx - 2, by + 42]], '#1e2430');
    var p = paintingPixels(paintingIdx);
    for (var i = 0; i < 16; i++) for (var j = 0; j < 16; j++) {
      var col = '#fff8e7';
      if (p && p.pixels) { var ch = p.pixels.charAt(i * 16 + j); var k = parseInt(ch, 36); col = pal[isNaN(k) ? 0 : k % pal.length]; }
      else if ((i + j) % 5 === 0) col = '#ffcf3f'; // empty board: a dotted pattern until a painting is saved
      var px = bx + j * pw, py = by + i * ph + j * pw * slope;
      out += '<rect x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="' + (pw + 0.3) + '" height="' + (ph + 0.3) + '" fill="' + col + '" transform="skewY(' + skew + ') translate(0,' + (-px * slope).toFixed(2) + ')"/>';
    }
    return out;
  }
  var ART = {
    grass: function (x, y) { return diamond(x, y, 0.92, '#7fe07a') + diamond(x - 8, y - 3, 0.12, '#9af08f') + diamond(x + 9, y + 4, 0.1, '#9af08f'); },
    road: function (x, y) { return diamond(x, y, 1, '#5b6470') + poly([[x - HW * 0.6, y + HH * 0.6 - 2], [x + HW * 0.6, y - HH * 0.6 - 2], [x + HW * 0.6, y - HH * 0.6 + 2], [x - HW * 0.6, y + HH * 0.6 + 2]], '#f3e27a'); },
    flowers: function (x, y) {
      var out = '', cols = ['#ff6b6b', '#ffcf3f', '#8b6cff', '#ff9ad5', '#fff'], o = [[-14, 0], [0, -7], [12, 2], [-4, 6], [6, -2]];
      o.forEach(function (d, i) { out += '<rect x="' + (x + d[0] - 1) + '" y="' + (y + d[1] - 8) + '" width="2" height="8" fill="#2f9a3a"/><circle cx="' + (x + d[0]) + '" cy="' + (y + d[1] - 9) + '" r="3.5" fill="' + cols[i] + '"/>'; });
      return out;
    },
    tree: function (x, y) { return box(x, y, 0.16, 14, '#8b5a2b') + box(x, y, 0.5, 20, '#3aa94a', 14) + box(x, y, 0.3, 12, '#4fc45f', 34); },
    bush: function (x, y) { return box(x - 6, y + 2, 0.32, 9, '#3aa94a') + box(x + 7, y - 2, 0.36, 11, '#46b956'); },
    fence: function (x, y) {
      var out = '';
      for (var i = 0; i <= 3; i++) { var k = i / 3; out += box(x - HW + k * HW, y - k * HH, 0.06, 12, '#e8d9b5'); out += box(x + k * HW, y - HH + k * HH, 0.06, 12, '#e8d9b5'); }
      out += poly([[x - HW, y - 9], [x, y - HH - 9], [x, y - HH - 6], [x - HW, y - 6]], '#d8c59b') + poly([[x, y - HH - 9], [x + HW, y - 9], [x + HW, y - 6], [x, y - HH - 6]], '#c5b088');
      return out;
    },
    pond: function (x, y) { return diamond(x, y, 0.85, '#3b6fd6') + diamond(x, y, 0.72, '#5ea0ff') + '<ellipse cx="' + (x - 6) + '" cy="' + (y - 3) + '" rx="8" ry="3" fill="#cfe8ff" opacity=".8"/>'; },
    house: function (x, y) { return box(x, y, 0.66, 20, '#f2b56b') + windows(x, y, 0.66, 20, 1, 2) + roof(x, y, 0.72, 20, '#ff6b6b', 14); },
    cottage: function (x, y) { return box(x, y, 0.72, 22, '#c9e5ff') + windows(x, y, 0.72, 22, 1, 2) + roof(x, y, 0.78, 22, '#8b5a2b', 16) + box(x + 12, y - 4, 0.08, 46, '#8d99a6'); },
    shop: function (x, y) { return box(x, y, 0.84, 26, '#ffcf3f') + windows(x, y, 0.84, 26, 1, 3) + box(x, y, 0.84, 5, '#ff6b6b', 26) + box(x, y, 0.5, 6, '#1e2430', 31); },
    cafe: function (x, y) { return box(x, y, 0.82, 26, '#f7f0df') + windows(x, y, 0.82, 26, 1, 3, '#a7d8c8') + box(x, y, 0.82, 5, '#3ddc97', 26) + box(x - 18, y + 12, 0.06, 18, '#8d99a6') + diamond(x - 18, y - 6, 0.3, '#ff6b6b'); },
    bakery: function (x, y) { return box(x, y, 0.82, 26, '#ffd9b0') + windows(x, y, 0.82, 26, 1, 3) + box(x, y, 0.82, 5, '#8b6cff', 26) + box(x, y, 0.3, 10, '#ffffff', 31) + box(x, y, 0.18, 6, '#ff9ad5', 41); },
    fountain: function (x, y) { return box(x, y, 0.8, 6, '#8d99a6') + diamond(x, y - 6, 0.68, '#5ea0ff') + box(x, y, 0.16, 16, '#aeb8c4', 6) + diamond(x, y - 22, 0.36, '#9ccfff') + box(x, y, 0.06, 10, '#cfe8ff', 22); },
    playground: function (x, y) { return diamond(x, y, 0.95, '#f3d9a4') + box(x - 14, y, 0.1, 22, '#ff6b6b') + box(x + 14, y, 0.1, 22, '#ff6b6b') + poly([[x - 14, y - 22], [x + 14, y - 22], [x + 14, y - 18], [x - 14, y - 18]], '#ffcf3f') + box(x + 2, y + 6, 0.18, 12, '#8b6cff') + poly([[x + 2, y - 6], [x + 20, y + 4], [x + 20, y + 8], [x + 2, y - 2]], '#3ddc97'); },
    school: function (x, y) { return box(x, y, 0.92, 28, '#d9603a') + windows(x, y, 0.92, 28, 2, 3) + box(x, y, 0.3, 10, '#fff8e7', 28) + box(x + 8, y - 4, 0.05, 44, '#8d99a6') + poly([[x + 8, y - 52], [x + 18, y - 49], [x + 8, y - 46]], '#ff6b6b'); },
    library: function (x, y) {
      var out = box(x, y, 0.9, 28, '#e6dcc3') + windows(x, y, 0.9, 28, 1, 3, '#8b6cff');
      for (var i = 0; i < 4; i++) { var k = (i + 0.5) / 4; out += box(x - HW * 0.9 + k * HW * 0.9, y + k * HH * 0.9 - 2, 0.05, 26, '#fff8e7'); }
      return out + box(x, y, 0.9, 6, '#b8a98a', 28) + box(x, y, 0.5, 10, '#1e2430', 34);
    },
    hospital: function (x, y) {
      return box(x, y, 0.9, 42, '#f4f7fb') + windows(x, y, 0.9, 42, 3, 3) + box(x, y, 0.4, 6, '#ff6b6b', 42) +
        '<rect x="' + (x - 11) + '" y="' + (y - 60) + '" width="22" height="7" fill="#ff6b6b"/><rect x="' + (x - 3.5) + '" y="' + (y - 67) + '" width="7" height="21" fill="#ff6b6b"/>';
    },
    firestation: function (x, y) { return box(x, y, 0.9, 30, '#d8322b') + windows(x, y, 0.9, 30, 1, 3) + poly([[x - 26, y - 4], [x - 4, y + 7], [x - 4, y + 15], [x - 26, y + 4]], '#ffcf3f') + box(x + 14, y - 12, 0.14, 48, '#8d99a6') + box(x + 14, y - 12, 0.14, 4, '#ff6b6b', 48); },
    stadium: function (x, y) { return '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="' + (HW * 0.98) + '" ry="' + (HH * 0.98) + '" fill="#8d99a6"/><ellipse cx="' + x + '" cy="' + (y - 10) + '" rx="' + (HW * 0.98) + '" ry="' + (HH * 0.98) + '" fill="#b7c1cc"/><ellipse cx="' + x + '" cy="' + (y - 10) + '" rx="' + (HW * 0.62) + '" ry="' + (HH * 0.62) + '" fill="#5fcf5a"/><rect x="' + (x - 6) + '" y="' + (y - 13) + '" width="12" height="6" fill="#fff" opacity=".7"/>' + box(x - 22, y - 8, 0.05, 30, '#5b6470') + box(x + 22, y - 8, 0.05, 30, '#5b6470'); },
    ferris: function (x, y) {
      var cx = x, cy = y - 44, R = 30, out = box(x - 10, y + 4, 0.08, 44, '#5b6470') + box(x + 10, y - 4, 0.08, 44, '#5b6470') + '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#8b6cff" stroke-width="4"/>';
      var cols = ['#ff6b6b', '#ffcf3f', '#3ddc97', '#6ec6ff', '#ff9ad5', '#ffb347', '#8b6cff', '#5fcf5a'];
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R; out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="#8b6cff" stroke-width="2"/><rect x="' + (px - 5).toFixed(1) + '" y="' + (py - 3).toFixed(1) + '" width="10" height="9" rx="2" fill="' + cols[i] + '"/>'; }
      return out;
    },
    skyscraper: function (x, y) { return box(x, y, 0.62, 108, '#6f8fb0') + windows(x, y, 0.62, 108, 7, 2, '#ffe9a6') + box(x, y, 0.3, 8, '#8d99a6', 108) + box(x, y, 0.05, 18, '#ff6b6b', 116); },
    castle: function (x, y) {
      var out = box(x, y, 0.8, 34, '#9aa6b2') + box(x - 20, y + 10, 0.26, 50, '#8d99a6') + box(x + 20, y - 10, 0.26, 50, '#8d99a6') + box(x, y, 0.22, 56, '#aeb8c4');
      out += roof(x - 20, y + 10, 0.28, 50, '#8b6cff', 14) + roof(x + 20, y - 10, 0.28, 50, '#8b6cff', 14) + roof(x, y, 0.24, 56, '#ff6b6b', 16);
      out += poly([[x - 6, y - 36 + 8], [x + 6, y - 36 + 8], [x + 6, y - 20 + 8], [x - 6, y - 20 + 8]], '#5a3b1e');
      return out;
    },
    billboard: billboardArt
  };
  var HOME_ART = {
    parents: function (x, y) { return box(x, y, 0.7, 20, '#f6c88f') + windows(x, y, 0.7, 20, 1, 2) + roof(x, y, 0.76, 20, '#c0392b', 14); },
    apartment: function (x, y) { return box(x, y, 0.78, 40, '#d9a066') + windows(x, y, 0.78, 40, 3, 2) + box(x, y, 0.78, 4, '#8b5a2b', 40); },
    townhouse: function (x, y) { return box(x - 9, y + 5, 0.4, 34, '#c86b5a') + box(x + 9, y - 5, 0.4, 34, '#6b8fc8') + windows(x - 9, y + 5, 0.4, 34, 2, 1) + windows(x + 9, y - 5, 0.4, 34, 2, 1) + roof(x - 9, y + 5, 0.42, 34, '#5b6470', 8) + roof(x + 9, y - 5, 0.42, 34, '#5b6470', 8); },
    house: function (x, y) { return box(x, y, 0.8, 26, '#fff1c9') + windows(x, y, 0.8, 26, 1, 3) + roof(x, y, 0.86, 26, '#3b6fd6', 18) + box(x + 18, y + 8, 0.2, 14, '#e6dcc3'); },
    lakehouse: function (x, y) { return diamond(x + 12, y + 6, 0.5, '#5ea0ff') + box(x - 8, y - 4, 0.6, 24, '#a86f3e') + windows(x - 8, y - 4, 0.6, 24, 1, 2) + roof(x - 8, y - 4, 0.66, 24, '#3a7d44', 16) + poly([[x + 4, y + 2], [x + 26, y + 13], [x + 26, y + 17], [x + 4, y + 6]], '#8b5a2b'); },
    mansion: function (x, y) { return box(x, y, 0.96, 36, '#fdf6e3') + windows(x, y, 0.96, 36, 2, 4, '#c9b6ff') + roof(x, y, 0.98, 36, '#8b6cff', 16) + box(x - 16, y + 14, 0.06, 36, '#fff') + box(x + 16, y - 14, 0.06, 36, '#fff') + box(x, y, 0.2, 10, '#ffcf3f', 52); }
  };

  // ---------- grid access ----------
  function grid() { return BT.state.town.grid; }
  function inBounds(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }
  function findHome() {
    var g = grid();
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (g[r][c] === 'home') return { r: r, c: c };
    return null;
  }
  function ensureHome() {
    if (findHome()) return findHome();
    var g = grid(), spots = [[4, 4], [4, 5], [5, 4], [5, 5]];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) spots.push([r, c]);
    for (var i = 0; i < spots.length; i++) if (!g[spots[i][0]][spots[i][1]]) { g[spots[i][0]][spots[i][1]] = 'home'; BT.save(); return { r: spots[i][0], c: spots[i][1] }; }
    return null;
  }
  function counts() {
    var g = grid(), pop = 0, val = HOME_VALUE[BT.state.home] || 0;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var it = g[r][c] && BY_ID[g[r][c]];
      if (it) { pop += it.pop; val += it.price; }
    }
    return { population: pop, value: val };
  }
  function townName() { return BT.state.town.name || ((BT.state.character && BT.state.character.name) ? BT.state.character.name + 'ville' : 'Boomtown'); }

  // ---------- actions (also the test API) ----------
  function place(id, r, c, fromEl) {
    var it = BY_ID[id];
    if (!it || id === 'home' || !inBounds(r, c) || grid()[r][c]) return false;
    if (!BT.money.spend(it.price, 'town:' + id)) { BT.toast('Not enough money for a ' + it.name.toLowerCase(), 'bad'); BT.sfx.bad(); return false; }
    grid()[r][c] = id;
    BT.log.event('town_place', { id: id, r: r, c: c, price: it.price });
    BT.save();
    if (it.price) BT.coinFly(fromEl);
    BT.sfx.build();
    return true;
  }
  function pickup(r, c) {
    if (!inBounds(r, c)) return false;
    var id = grid()[r][c], it = id && BY_ID[id];
    if (!it || id === 'home') return false;
    var refund = Math.floor(it.price / 2);
    grid()[r][c] = null;
    if (refund) BT.money.add(refund, 'town_pickup:' + id);
    BT.log.event('town_pickup', { id: id, r: r, c: c, refund: refund });
    BT.save();
    BT.sfx.coin();
    return true;
  }
  function move(r1, c1, r2, c2) {
    if (!inBounds(r1, c1) || !inBounds(r2, c2)) return false;
    var g = grid();
    if (!g[r1][c1] || g[r2][c2]) return false;
    g[r2][c2] = g[r1][c1]; g[r1][c1] = null;
    BT.log.event('town_move', { id: g[r2][c2], from: [r1, c1], to: [r2, c2] });
    BT.save();
    BT.sfx.build();
    return true;
  }

  // ---------- rendering ----------
  function avatarSvg(size) {
    try { if (BT.character && typeof BT.character.svg === 'function' && BT.state.character) return BT.character.svg(size); } catch (e) { /* fall through */ }
    return BT.avatarFallback(size);
  }
  function mapSvg() {
    var g = grid(), out = '', billboards = 0;
    out += '<svg class="town-map" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" aria-label="Your town">';
    // ground: one flat block per tile, back to front
    for (var sum = 0; sum <= 2 * (N - 1); sum++) for (var r = 0; r < N; r++) {
      var c = sum - r;
      if (!inBounds(r, c)) continue;
      var p = center(r, c), isSel = moving && moving.r === r && moving.c === c;
      out += box(p.x, p.y + 10, 1, 10, isSel ? '#ffcf3f' : ((r + c) % 2 ? '#5fcf5a' : '#64d45f'));
    }
    for (sum = 0; sum <= 2 * (N - 1); sum++) for (r = 0; r < N; r++) {
      c = sum - r;
      if (!inBounds(r, c)) continue;
      p = center(r, c);
      var id = g[r][c];
      // each tile's art lives in its own hit group, so a tap on a tall building's body hits that tile, not the ground behind it
      out += '<g class="town-hit" data-r="' + r + '" data-c="' + c + '">' + diamond(p.x, p.y, 1, 'transparent', ' class="town-ground"');
      if (id === 'home') {
        out += (HOME_ART[BT.state.home] || HOME_ART.parents)(p.x, p.y);
        out += '<g class="town-avatar" transform="translate(' + (p.x + HW * 0.45 - 18) + ',' + (p.y + HH * 0.3 - 36) + ')">' + avatarSvg(36) + '</g>';
      } else if (id === 'billboard') out += billboardArt(p.x, p.y, billboards++);
      else if (id && ART[id]) out += ART[id](p.x, p.y);
      out += '</g>';
    }
    return out + '</svg>';
  }
  function itemIcon(id) {
    var art = id === 'home' ? (HOME_ART[BT.state.home] || HOME_ART.parents) : ART[id];
    var k = Math.min(1, 70 / (ICON_H[id] || 56)); // shrink the tall ones so they fit the shelf card
    return '<svg viewBox="' + (OX - 34) + ' ' + (OY - 82) + ' 68 104" aria-hidden="true"><g transform="translate(' + OX + ',' + OY + ') scale(' + k + ') translate(' + -OX + ',' + -OY + ')">' + box(OX, OY + 8, 1, 8, '#5fcf5a') + art(OX, OY) + '</g></svg>';
  }
  function renderCatalog() {
    var sl = catBar.scrollLeft, st = catBar.scrollTop;
    catBar.innerHTML = '';
    CATALOG.forEach(function (it) {
      var b = el('button', { class: 'town-item btn' + (sel === it.id ? ' selected' : '') + (it.price > BT.money.get() ? ' poor' : ''), type: 'button', data: { id: it.id },
        html: itemIcon(it.id) + '<span class="town-item-name">' + esc(it.name) + '</span><span class="town-item-price">' + (it.price ? BT.fmt(it.price) : 'Free') + '</span>' });
      b.addEventListener('click', function () {
        BT.sfx.click();
        var wasMoving = moving;
        moving = null;
        sel = sel === it.id ? null : it.id;
        renderCatalog();
        if (sel) BT.toast('Tap a tile to build a ' + it.name.toLowerCase(), 'info');
        if (wasMoving) svgHost.innerHTML = mapSvg();
      });
      catBar.appendChild(b);
    });
    catBar.scrollLeft = sl; catBar.scrollTop = st;
  }
  function render() {
    if (!shell) buildShell();
    ensureHome();
    svgHost.innerHTML = mapSvg();
    var k = counts();
    popEl.textContent = 'Pop. ' + k.population;
    valEl.textContent = 'Value ' + BT.fmt(k.value);
    nameEl.textContent = townName();
    renderCatalog();
  }
  function tileEl(r, c) { return svgHost.querySelector('.town-hit[data-r="' + r + '"][data-c="' + c + '"]'); }
  function onTile(r, c) {
    var g = grid(), id = g[r][c];
    if (moving) {
      if (moving.r === r && moving.c === c) { moving = null; render(); return; }
      if (id) { BT.toast('That spot is taken', 'bad'); return; }
      move(moving.r, moving.c, r, c); moving = null; render(); return;
    }
    if (sel) {
      if (id) { BT.toast(id === 'home' ? "That's your home!" : 'Pick that up first', 'info'); return; }
      if (place(sel, r, c, tileEl(r, c))) render();
      return;
    }
    if (!id) { BT.toast('Pick something from the shelf to build', 'info'); return; }
    if (id === 'home') { BT.toast("That's your home. Upgrade it in the Shop!", 'info'); return; }
    tileMenu(r, c, id);
  }
  function tileMenu(r, c, id) {
    var it = BY_ID[id], refund = Math.floor(it.price / 2);
    var m = el('div', { class: 'modal' });
    var box_ = el('div', { class: 'modal-box center' }, [
      el('div', { class: 'town-menu-icon', html: itemIcon(id) }),
      el('h3', { text: it.name }),
      el('div', { class: 'btn-row' }, [
        el('button', { class: 'btn gold', type: 'button', text: 'Pick up (+' + BT.fmt(refund) + ')', onclick: function () { m.remove(); pickup(r, c); BT.coinFly(tileEl(r, c)); render(); } }),
        el('button', { class: 'btn sky', type: 'button', text: 'Move', onclick: function () { m.remove(); moving = { r: r, c: c }; sel = null; render(); BT.toast('Tap where it should go', 'info'); } }),
        el('button', { class: 'btn stone', type: 'button', text: 'Cancel', onclick: function () { m.remove(); } })
      ])
    ]);
    m.appendChild(box_);
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    BT.screen.el('town').appendChild(m);
  }
  function editName() {
    var inp = el('input', { type: 'text', maxlength: '18', value: townName(), class: 'town-name-input', 'aria-label': 'Town name' });
    nameEl.replaceWith(inp);
    inp.focus(); inp.select();
    function done() {
      var v = inp.value.trim().slice(0, 18);
      if (v) { BT.state.town.name = v; BT.save(); }
      inp.replaceWith(nameEl);
      nameEl.textContent = townName();
    }
    inp.addEventListener('blur', done);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') inp.blur(); });
  }
  function openPainter() {
    var painter = BT.minigames.painter;
    if (!painter || typeof painter.start !== 'function') { BT.toast('The paint studio opens soon', 'info'); return; }
    var ov = el('div', { class: 'town-overlay' });
    BT.screen.el('town').appendChild(ov);
    var p;
    try { p = painter.start(ov, { fromTown: true, cap: 0, level: 1, pay: 0 }); } catch (e) { console.error(e); p = null; }
    Promise.resolve(p).catch(function () { }).then(function () { ov.remove(); render(); });
  }
  function buildShell() {
    var screen = BT.screen.el('town');
    screen.innerHTML = '';
    var style = document.createElement('style');
    style.textContent =
      '#screen-town .town-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}' +
      '#screen-town .town-name{background:transparent;border:0;font:inherit;font-weight:700;font-size:1.5rem;color:var(--paper);text-shadow:0 3px 0 rgba(0,0,0,.3);min-height:44px;padding:0 6px;cursor:pointer;max-width:50vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '#screen-town .town-name::after{content:" \\270E";font-size:1rem;opacity:.7}' +
      '#screen-town .town-name-input{max-width:260px;min-height:44px}' +
      '#screen-town .town-map-host{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}' +
      '#screen-town .town-map{width:100%;height:100%;max-height:100%;display:block;touch-action:manipulation}' +
      '#screen-town .town-hit{cursor:pointer}#screen-town .town-hit:active .town-ground{fill:rgba(255,255,255,.35)}' +
      '#screen-town .town-shelf{flex:none;display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:6px 2px 10px;-webkit-overflow-scrolling:touch;scrollbar-width:none}' +
      '#screen-town .town-shelf::-webkit-scrollbar{display:none}' +
      '#screen-town .town-item{flex:none;width:92px;min-height:118px;padding:4px 4px 6px;margin:0 0 6px;flex-direction:column;gap:0;font-size:.8rem;line-height:1.1;border:3px solid transparent}' +
      '#screen-town .town-item svg{width:56px;height:62px;display:block}' +
      '#screen-town .town-item.selected{border-color:var(--ink);background:var(--gold);transform:translateY(-4px);box-shadow:0 10px 0 var(--edge)}' +
      '#screen-town .town-item.poor{opacity:.55}' +
      '#screen-town .town-item-name{font-weight:700;text-align:center}#screen-town .town-item-price{opacity:.75;font-weight:600}' +
      '#screen-town .town-menu-icon svg{width:120px;height:140px}' +
      '#screen-town .town-overlay{position:absolute;inset:0;z-index:15;background:var(--paper);display:flex;flex-direction:column;padding:12px}' +
      '@media (orientation:landscape){#screen-town .town-body{flex-direction:row}#screen-town .town-shelf{flex-direction:column;overflow-x:hidden;overflow-y:auto;width:110px;padding:2px 6px}}';
    screen.appendChild(style);
    nameEl = el('button', { class: 'town-name', type: 'button', text: townName(), onclick: editName, 'aria-label': 'Town name, tap to edit' });
    popEl = el('span', { class: 'pill sky', text: 'Pop. 0' });
    valEl = el('span', { class: 'pill gold', text: 'Value $0' });
    var head = el('div', { class: 'town-head' }, [
      nameEl, popEl, valEl, el('span', { class: 'spacer' }),
      el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Paint', onclick: function () { BT.sfx.click(); openPainter(); } }),
      el('button', { class: 'btn btn-sm mint', type: 'button', text: 'Shop', onclick: function () { BT.sfx.click(); if (BT.shop && typeof BT.shop.open === 'function') BT.shop.open(); else BT.screen.show('shop'); } }),
      el('button', { class: 'btn btn-sm stone', type: 'button', text: 'Home', onclick: function () { BT.sfx.click(); BT.screen.show('home'); } })
    ]);
    svgHost = el('div', { class: 'town-map-host' });
    svgHost.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.town-hit') : null;
      if (t) onTile(+t.dataset.r, +t.dataset.c);
    });
    catBar = el('div', { class: 'town-shelf', role: 'list' });
    var body = el('div', { class: 'screen-body town-body' }, [svgHost, catBar]);
    screen.appendChild(head); screen.appendChild(body);
    shell = screen;
  }

  document.addEventListener('bt:screen', function (e) { if (e.detail.id === 'town') { moving = null; render(); } });

  Object.assign(BT.town, {
    catalog: CATALOG, byId: BY_ID, palette: PALETTE,
    open: function () { BT.screen.show('town'); },
    render: render, place: place, pickup: pickup, move: move, counts: counts, ensureHome: ensureHome, findHome: findHome,
    select: function (id) { sel = BY_ID[id] && id !== 'home' ? id : null; if (shell) renderCatalog(); return sel; },
    selected: function () { return sel; },
    tap: onTile, mapSvg: mapSvg
  });

  // ---------- checks ----------
  function scratch(fn) { // run fn on a copy of the live money/grid, restore after
    var keep = JSON.stringify({ g: BT.state.town.grid, m: BT.state.money, l: BT.state.lifetime, e: BT.state.events.length });
    try { return fn(); } finally {
      var k = JSON.parse(keep);
      BT.state.town.grid = k.g; BT.state.money = k.m; BT.state.lifetime = k.l; BT.state.events.length = Math.min(BT.state.events.length, k.e); BT.save(); BT.hud();
    }
  }
  BT.registerChecks('town', [
    { name: 'catalog has the 23 spec items with spec prices', fn: function () {
      var want = { grass: 0, road: 20, flowers: 10, tree: 15, bush: 12, fence: 8, pond: 60, house: 120, cottage: 180, shop: 250, cafe: 300, bakery: 320, fountain: 400, playground: 450, school: 600, library: 650, hospital: 900, firestation: 800, stadium: 2000, ferris: 2500, skyscraper: 3500, castle: 6000, billboard: 150 };
      return CATALOG.length === 23 && CATALOG.every(function (c) { return want[c.id] === c.price && typeof ART[c.id] === 'function'; });
    } },
    { name: 'ensureHome places exactly one home', fn: function () {
      return scratch(function () {
        BT.state.town.grid = BT.defaults().town.grid; ensureHome(); ensureHome();
        var n = 0; grid().forEach(function (row) { row.forEach(function (x) { if (x === 'home') n++; }); });
        return n === 1 && !!findHome();
      });
    } },
    { name: 'place spends and logs town_place; pickup refunds half; move works', fn: function () {
      return scratch(function () {
        BT.state.town.grid = BT.defaults().town.grid; BT.state.money = 1000;
        var ok = place('cottage', 0, 0) && BT.state.money === 820;
        var ev = BT.state.events[BT.state.events.length - 1];
        ok = ok && ev.type === 'town_place' && ev.data.id === 'cottage' && grid()[0][0] === 'cottage';
        ok = ok && place('cottage', 0, 0) === false && place('home', 1, 1) === false && place('castle', 2, 2) === false;
        ok = ok && move(0, 0, 3, 3) && grid()[3][3] === 'cottage' && grid()[0][0] === null;
        ok = ok && pickup(3, 3) && BT.state.money === 910 && grid()[3][3] === null && pickup(3, 3) === false;
        return ok;
      });
    } },
    { name: 'population = houses x3 + big buildings x10, value sums prices', fn: function () {
      return scratch(function () {
        BT.state.town.grid = BT.defaults().town.grid; BT.state.money = 5000; BT.state.home = 'parents';
        ensureHome(); place('cottage', 0, 0); place('school', 0, 1); place('tree', 0, 2);
        var k = counts();
        return k.population === 16 && k.value === 795;
      });
    } },
    { name: 'map renders 100 hit tiles, the home, and a billboard with pixels', fn: function () {
      return scratch(function () {
        BT.state.town.grid = BT.defaults().town.grid; BT.state.money = 5000; ensureHome(); place('billboard', 0, 0);
        var s = mapSvg();
        return (s.match(/town-hit/g) || []).length === 100 && s.indexOf('town-avatar') > 0 && (s.match(/skewY/g) || []).length === 256;
      });
    } },
    { name: 'tapping a tall building body hits its own tile, not the one behind', fn: function () {
      var before = BT.screen.current, ok = true;
      BT.screen.show('town');
      scratch(function () {
        BT.state.town.grid = BT.defaults().town.grid; BT.state.money = 9000; ensureHome(); place('skyscraper', 5, 5); render();
        var svg = svgHost.querySelector('.town-map'), p = center(5, 5), m = svg.getScreenCTM();
        [30, 60, 90].forEach(function (up) {
          var pt = svg.createSVGPoint(); pt.x = p.x; pt.y = p.y - up; pt = pt.matrixTransform(m);
          var hit = document.elementFromPoint(pt.x, pt.y), t = hit && hit.closest && hit.closest('.town-hit');
          ok = ok && !!t && +t.dataset.r === 5 && +t.dataset.c === 5;
        });
      });
      render();
      if (before) BT.screen.show(before);
      return ok;
    } },
    { name: 'town screen renders a shelf of 23 items', fn: function () {
      var before = BT.screen.current;
      BT.screen.show('town');
      var ok = BT.screen.el('town').querySelectorAll('.town-item').length === 23 && !!BT.screen.el('town').querySelector('.town-map');
      var hit = BT.screen.el('town').querySelector('.town-hit'); // tiles are tap targets: 44px tall at iPad sizes (820x1180 either way)
      if (hit && innerWidth >= 800 && innerHeight >= 800) ok = ok && hit.getBoundingClientRect().height >= 44;
      if (before) BT.screen.show(before);
      return ok;
    } }
  ]);
})();
