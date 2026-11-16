// BT.character: creator screen (#screen-character) + avatar SVG renderer.
// API: BT.character.open()  BT.character.svg(size, char?) -> SVG string  BT.character.save() -> bool
//      BT.character.set(part, value)  BT.character.draft()  BT.character.OUTFITS (catalog; entries with a price are shop outfits)
// Save shape: state.character = {name, skin, hair, hairColor, eyes, outfit, accessory, homeState}
//   skin/hair/hairColor/eyes/accessory are indexes into the lists below; outfit is a catalog id (a number is read as an index).
// Shop: BT.state.outfits holds bought outfit ids; the creator shows base outfits plus those. Unknown ids still draw (generic tee).
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el, esc = BT.esc;

  var SKINS = ['#f6d7b0', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a1e'];
  var HAIRS = ['short', 'long', 'ponytail', 'buns', 'spiky', 'curly'];
  var HAIR_COLORS = ['#2b1b0e', '#5a3b1e', '#b5651d', '#f2c14e', '#d94a4a', '#8b6cff'];
  var EYES = ['round', 'happy', 'wide', 'wink'];
  var ACCESSORIES = ['none', 'glasses', 'cap', 'crown', 'headphones', 'bow'];
  var OUTFITS = [ // the 6 free outfits; bought ones come from BT.shop.outfits (id, title, top, bottom, price)
    { id: 'tee', name: 'Tee + jeans', style: 'tee', c1: '#6ec6ff', c2: '#ffcf3f', pants: '#3b5b8f' },
    { id: 'sweater', name: 'Cozy sweater', style: 'hoodie', c1: '#8b6cff', c2: '#5a44c7', pants: '#2b3140' },
    { id: 'dress', name: 'Sun dress', style: 'dress', c1: '#ff6b6b', c2: '#ffcf3f' },
    { id: 'overalls', name: 'Overalls', style: 'overalls', c1: '#5b8ad6', c2: '#3ddc97' },
    { id: 'jersey', name: 'Team jersey', style: 'jersey', c1: '#5fcf5a', c2: '#fff8e7', pants: '#1e2430' },
    { id: 'suit', name: 'Boss suit', style: 'suit', c1: '#1e2430', c2: '#ff6b6b', pants: '#1e2430' }
  ];
  // how a shop outfit id is drawn on the avatar (anything else: a tee in the shop's colors)
  var SHOP_STYLE = { hoodie: 'hoodie', labcoat: 'coat', chef: 'coat', astro: 'coat', tux: 'suit', pilot: 'suit', baker: 'overalls', rainbow: 'jersey' };
  var DEFAULT = { name: '', skin: 1, hair: 0, hairColor: 1, eyes: 0, outfit: 'tee', accessory: 0, homeState: 'TX' };

  function outfitOf(v) {
    if (typeof v === 'number') return OUTFITS[v] || OUTFITS[0];
    var i;
    for (i = 0; i < OUTFITS.length; i++) if (OUTFITS[i].id === v) return OUTFITS[i];
    var shop = (BT.shop && BT.shop.outfits) || [];
    for (i = 0; i < shop.length; i++) if (shop[i].id === v) {
      var so = shop[i], st = SHOP_STYLE[v] || 'tee';
      return { id: v, name: so.title || v, style: st, c1: so.top || '#6ec6ff', c2: st === 'overalls' ? so.top : (so.bottom || '#ffcf3f'), pants: so.bottom || '#3b4a6b', stripes: v === 'rainbow', price: so.price };
    }
    // shortcut: an id neither list knows still draws as a tee in a hashed color, so an old save never breaks
    var h = 0; String(v).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) & 0xffff; });
    return { id: v, name: String(v), style: 'tee', c1: 'hsl(' + (h % 360) + ' 70% 60%)', c2: '#ffcf3f', pants: '#3b4a6b' };
  }
  function idx(list, i) { i = +i; return list[i >= 0 && i < list.length ? i : 0]; }
  function R(x, y, w, h, fill, rx, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 4 : rx) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function P(points, fill, extra) { return '<polygon points="' + points + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  var INK = '#1e2430';

  // The avatar: 120x120 viewBox, head 60 wide (Roblox-ish), torso, arms, legs, all rounded rects.
  function svg(size, c) {
    size = size || 40;
    c = Object.assign({}, DEFAULT, c || BT.state.character || {});
    var skin = idx(SKINS, c.skin), hairC = idx(HAIR_COLORS, c.hairColor), hair = idx(HAIRS, c.hair), eyes = idx(EYES, c.eyes);
    var acc = idx(ACCESSORIES, c.accessory), o = outfitOf(c.outfit), pants = o.pants || '#3b4a6b';
    var s = [];
    // behind-body layers
    if (o.style === 'cape') s.push(R(26, 64, 68, 46, o.c2, 8));
    if (o.style === 'hoodie') s.push(R(30, 56, 60, 16, o.c2, 8));
    if (hair === 'long') s.push(R(26, 14, 68, 58, hairC, 10));
    if (hair === 'ponytail') s.push(R(84, 22, 14, 44, hairC, 6) + '<circle cx="91" cy="68" r="8" fill="' + hairC + '"/>');
    // legs + shoes
    var legsTop = o.style === 'dress' ? 100 : 96;
    s.push(R(40, legsTop, 17, 116 - legsTop, o.style === 'overalls' ? o.c1 : (o.style === 'dress' ? skin : pants), 3));
    s.push(R(63, legsTop, 17, 116 - legsTop, o.style === 'overalls' ? o.c1 : (o.style === 'dress' ? skin : pants), 3));
    s.push(R(38, 110, 21, 9, INK, 4) + R(61, 110, 21, 9, INK, 4));
    // arms (skin) with sleeves
    s.push(R(22, 66, 13, 30, skin, 5) + R(85, 66, 13, 30, skin, 5));
    var sleeveH = o.style === 'tee' || o.style === 'jersey' || o.style === 'dress' ? 12 : 26;
    var sleeveC = o.style === 'overalls' ? o.c2 : o.c1;
    s.push(R(22, 64, 13, sleeveH, sleeveC, 5) + R(85, 64, 13, sleeveH, sleeveC, 5));
    if (o.stripes) s.push(R(22, 70, 13, 4, o.c2, 1) + R(85, 70, 13, 4, o.c2, 1));
    // torso
    var torsoC = o.style === 'overalls' ? o.c2 : o.c1;
    s.push(R(35, 62, 50, 38, torsoC, 7));
    switch (o.style) {
      case 'tee': s.push(R(52, 74, 16, 12, o.c2, 3)); break;
      case 'hoodie': s.push(R(44, 84, 32, 12, o.c2, 4) + R(56, 64, 3, 16, o.c2, 1) + R(61, 64, 3, 16, o.c2, 1)); break;
      case 'dress': s.push(P('35,86 85,86 92,108 28,108', o.c1) + R(35, 82, 50, 6, o.c2, 2)); break;
      case 'overalls': s.push(R(37, 76, 46, 24, o.c1, 5) + R(41, 62, 7, 16, o.c1, 2) + R(72, 62, 7, 16, o.c1, 2) + R(52, 82, 16, 10, o.c2, 2, ' opacity=".6"')); break;
      case 'jersey':
        if (o.stripes) s.push(R(35, 70, 50, 5, o.c2, 1) + R(35, 80, 50, 5, o.c2, 1) + R(35, 90, 50, 5, o.c2, 1));
        else s.push('<text x="60" y="90" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="22" fill="' + o.c2 + '">10</text>');
        break;
      case 'suit': s.push(P('35,62 60,62 48,84', '#fff') + P('85,62 60,62 72,84', '#fff') + P('56,64 64,64 62,86 60,90 58,86', o.c2)); break;
      case 'coat': s.push(R(59, 62, 2, 38, o.c2, 1) + '<circle cx="60" cy="74" r="2.6" fill="' + o.c2 + '"/><circle cx="60" cy="86" r="2.6" fill="' + o.c2 + '"/>' + P('35,62 50,62 44,74', '#fff') + P('85,62 70,62 76,74', '#fff')); break;
      case 'cape': s.push(P('60,70 66,80 77,81 69,88 71,99 60,93 49,99 51,88 43,81 54,80', o.c2)); break;
    }
    // head
    s.push(R(30, 10, 60, 54, skin, 10));
    // hair on top
    if (hair === 'short') s.push(R(28, 6, 64, 20, hairC, 9));
    if (hair === 'long' || hair === 'ponytail') s.push(R(28, 6, 64, 22, hairC, 9));
    if (hair === 'buns') s.push(R(28, 6, 64, 18, hairC, 9) + '<circle cx="30" cy="14" r="10" fill="' + hairC + '"/><circle cx="90" cy="14" r="10" fill="' + hairC + '"/>');
    if (hair === 'spiky') s.push(R(28, 10, 64, 14, hairC, 6) + P('30,12 38,-2 46,12 54,-4 62,12 70,-2 78,12 86,-1 92,12', hairC));
    if (hair === 'curly') { s.push(R(28, 8, 64, 16, hairC, 9)); for (var cx = 30; cx <= 90; cx += 12) s.push('<circle cx="' + cx + '" cy="8" r="8" fill="' + hairC + '"/>'); }
    // face
    s.push(R(38, 46, 8, 5, '#ff6b6b', 2, ' opacity=".35"') + R(74, 46, 8, 5, '#ff6b6b', 2, ' opacity=".35"'));
    s.push('<path d="M50 50 q10 9 20 0" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
    function eye(x, kind) {
      if (kind === 'happy') return '<path d="M' + (x - 5) + ' 38 q5 -8 10 0" stroke="' + INK + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      if (kind === 'line') return R(x - 5, 36, 10, 3, INK, 1.5);
      var big = kind === 'wide';
      return R(x - (big ? 6 : 4), big ? 29 : 31, big ? 12 : 8, big ? 13 : 10, INK, 3) + R(x - (big ? 3 : 2), big ? 31 : 33, 3, 3, '#fff', 1);
    }
    s.push(eye(47, eyes === 'wink' ? 'round' : eyes) + eye(73, eyes === 'wink' ? 'line' : eyes));
    // accessory
    if (acc === 'glasses') s.push('<g fill="none" stroke="' + INK + '" stroke-width="3"><rect x="37" y="28" width="20" height="16" rx="4"/><rect x="63" y="28" width="20" height="16" rx="4"/><path d="M57 35 h6"/></g>');
    if (acc === 'cap') s.push(R(28, 2, 64, 18, '#ff6b6b', 9) + R(22, 16, 44, 7, '#d94a4a', 3) + R(55, 2, 10, 18, '#fff8e7', 3, ' opacity=".5"'));
    if (acc === 'crown') s.push(P('36,10 36,-4 48,6 60,-8 72,6 84,-4 84,10', '#ffcf3f', ' stroke="#c99a1a" stroke-width="2"') + '<circle cx="60" cy="2" r="3" fill="#ff6b6b"/>');
    if (acc === 'headphones') s.push('<path d="M30 30 q30 -34 60 0" stroke="' + INK + '" stroke-width="5" fill="none"/>' + R(22, 26, 12, 20, '#8b6cff', 4, ' stroke="' + INK + '" stroke-width="3"') + R(86, 26, 12, 20, '#8b6cff', 4, ' stroke="' + INK + '" stroke-width="3"'));
    if (acc === 'bow') s.push(P('86,2 100,-6 100,14', '#ff6b6b') + P('86,2 72,-6 72,14', '#ff6b6b') + '<circle cx="86" cy="3" r="4" fill="#ffcf3f"/>');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -10 128 132" width="' + size + '" height="' + size + '" aria-hidden="true" class="avatar">' + s.join('') + '</svg>';
  }

  // ---------- creator screen ----------
  (function css() {
    var s = document.createElement('style');
    s.textContent = [
      '.cc{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}',
      '.cc-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:12px}',
      '.cc-preview{flex:none;display:flex;align-items:center;gap:14px;background:var(--paper);border-radius:20px;padding:10px 14px;border:3px solid rgba(0,0,0,.12);box-shadow:var(--shadow)}',
      '.cc-preview .avatar{width:120px;height:120px;flex:none;filter:drop-shadow(0 4px 0 rgba(0,0,0,.2))}',
      '.cc-preview .cc-name{flex:1;min-width:0}',
      '.cc-options{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--paper);border-radius:20px;padding:12px 14px;border:3px solid rgba(0,0,0,.12)}',
      '.cc-part{margin-bottom:12px} .cc-part h3{margin:0 0 6px;font-size:1.05rem}',
      '.cc-chips{display:flex;flex-wrap:wrap;gap:8px}',
      '.cc-chip{-webkit-appearance:none;appearance:none;border:4px solid transparent;background:#fff;border-radius:16px;min-width:56px;min-height:56px;padding:2px;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 0 var(--edge);transition:transform .06s}',
      '.cc-chip:active{transform:translateY(4px);box-shadow:none}',
      '.cc-chip.on{border-color:var(--ink);background:var(--gold)}',
      '.cc-chip .swatch{width:36px;height:36px;border-radius:10px;border:2px solid rgba(0,0,0,.2)}',
      '.cc-chip svg{width:56px;height:56px;display:block}',
      '.cc-chip.text{padding:0 12px;font-weight:700}',
      '.cc-map{max-width:620px;margin:0 auto}',
      '.cc-home{font-weight:700;margin:0 0 6px}',
      '@media (orientation:landscape) and (min-width:700px){.cc-body{flex-direction:row}.cc-preview{flex-direction:column;width:230px;justify-content:flex-start;padding-top:18px}.cc-preview .avatar{width:170px;height:170px}.cc-preview .cc-name{width:100%}.cc-options{flex:1}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  var draft = null, ui = null;

  function available() {
    var list = OUTFITS.slice();
    (BT.state.outfits || []).forEach(function (id) { if (!list.some(function (o) { return o.id === id; })) list.push(outfitOf(id)); });
    return list;
  }

  function set(part, value) {
    if (!draft) draft = Object.assign({}, DEFAULT, BT.state.character || {});
    draft[part] = value;
    if (ui) refresh(part);
    return draft;
  }

  function refresh(part) {
    ui.preview.innerHTML = svg(170, draft);
    if (part === 'homeState') {
      BT.usmap.highlight([draft.homeState], ui.map);
      var st = BT.stateByAbbr ? BT.stateByAbbr(draft.homeState) : null;
      ui.home.textContent = 'Home: ' + (st ? st.name : draft.homeState);
    } else if (part && ui.rows[part]) {
      ui.rows[part].querySelectorAll('.cc-chip').forEach(function (ch) { ch.classList.toggle('on', ch.dataset.v === String(draft[part])); });
    }
  }

  function chipRow(part, label, items, make) {
    var row = el('div', { class: 'cc-part' }, [el('h3', { text: label })]);
    var chips = el('div', { class: 'cc-chips', role: 'radiogroup', 'aria-label': label });
    items.forEach(function (it, i) {
      var v = make.value ? make.value(it, i) : i;
      var chip = el('button', { class: 'cc-chip' + (String(draft[part]) === String(v) ? ' on' : ''), type: 'button', data: { v: String(v) }, 'aria-label': make.label(it, i),
        onclick: function () { BT.sfx.click(); set(part, v); } });
      chip.innerHTML = make.html(it, i);
      chips.appendChild(chip);
    });
    row.appendChild(chips);
    ui.rows[part] = row;
    return row;
  }
  function miniFor(part, v) { var d = Object.assign({}, draft); d[part] = v; return svg(56, d); }

  function render() {
    var root = BT.screen.el('character');
    if (!root) return;
    var existing = !!(BT.state.character && BT.state.character.name);
    draft = Object.assign({}, DEFAULT, BT.state.character || {});
    root.innerHTML = '';
    ui = { rows: {} };

    var name = el('input', { type: 'text', class: 'input', maxlength: '14', placeholder: 'Your name here', autocomplete: 'off', autocapitalize: 'words',
      'aria-label': 'Character name', value: draft.name || '', id: 'cc-name' });
    name.addEventListener('input', function () { draft.name = name.value.slice(0, 14); });
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { name.blur(); save(); } });
    ui.name = name;
    ui.preview = el('div', { class: 'cc-avatar', html: svg(170, draft) });
    ui.home = el('p', { class: 'cc-home' });

    var mapBox = ui.map = el('div', { class: 'cc-map' });
    BT.usmap.render(mapBox, { highlight: [draft.homeState], labels: true, onTap: function (abbr) { set('homeState', abbr); } });

    var options = el('div', { class: 'cc-options' }, [
      chipRow('skin', 'Skin', SKINS, { label: function (c, i) { return 'Skin tone ' + (i + 1); }, html: function (c) { return '<span class="swatch" style="background:' + c + '"></span>'; } }),
      chipRow('hair', 'Hair', HAIRS, { label: function (h) { return 'Hair: ' + h; }, html: function (h, i) { return miniFor('hair', i); } }),
      chipRow('hairColor', 'Hair color', HAIR_COLORS, { label: function (c, i) { return 'Hair color ' + (i + 1); }, html: function (c) { return '<span class="swatch" style="background:' + c + '"></span>'; } }),
      chipRow('eyes', 'Eyes', EYES, { label: function (e) { return 'Eyes: ' + e; }, html: function (e, i) { return miniFor('eyes', i); } }),
      chipRow('outfit', 'Outfit', available(), { value: function (o) { return o.id; }, label: function (o) { return 'Outfit: ' + o.name; }, html: function (o) { return miniFor('outfit', o.id); } }),
      chipRow('accessory', 'Accessory', ACCESSORIES, { label: function (a) { return 'Accessory: ' + a; }, html: function (a, i) { return a === 'none' ? '<span class="swatch" style="background:#eee;display:grid;place-items:center;font-weight:700">—</span>' : miniFor('accessory', i); } }),
      el('div', { class: 'cc-part' }, [el('h3', { text: 'Home state (tap the map)' }), ui.home, mapBox])
    ]);

    var saveBtn = el('button', { class: 'btn gold', type: 'button', text: existing ? 'Save' : 'Start!', id: 'cc-save', onclick: save });
    var head = el('div', { class: 'screen-head' }, [
      el('h2', { text: existing ? 'Edit your character' : 'Make your character' }),
      el('div', { class: 'row' }, [
        existing ? el('button', { class: 'btn btn-sm stone', type: 'button', text: 'Back', onclick: function () { BT.sfx.click(); BT.screen.show('home'); } }) : null,
        saveBtn
      ])
    ]);
    root.appendChild(el('div', { class: 'cc' }, [
      head,
      el('div', { class: 'cc-body' }, [
        el('div', { class: 'cc-preview' }, [ui.preview, el('div', { class: 'cc-name' }, [el('label', { class: 'field', for: 'cc-name', text: 'Name' }), name])]),
        options
      ])
    ]));
    refresh('homeState');
  }

  function save() {
    if (!draft) return false;
    var nm = String(ui && ui.name ? ui.name.value : draft.name || '').trim().slice(0, 14);
    if (!nm) {
      BT.toast('Type a name first', 'bad'); BT.sfx.bad();
      if (ui && ui.name) { ui.name.focus(); ui.name.style.borderColor = 'var(--coral)'; }
      return false;
    }
    draft.name = nm;
    var first = !BT.state.character;
    BT.state.character = Object.assign({}, DEFAULT, draft);
    BT.save(); BT.hud();
    BT.log.event(first ? 'character_created' : 'character_edited', { homeState: draft.homeState, outfit: draft.outfit });
    BT.sfx.good();
    BT.toast(first ? 'Welcome to Boomtown, ' + nm + '!' : 'Saved!', 'good');
    if (first) BT.confetti();
    BT.screen.show('home');
    return true;
  }

  BT.character = {
    svg: svg, open: function () { BT.screen.show('character'); }, render: render, save: save, set: set,
    draft: function () { return draft; },
    SKINS: SKINS, HAIRS: HAIRS, HAIR_COLORS: HAIR_COLORS, EYES: EYES, ACCESSORIES: ACCESSORIES, OUTFITS: OUTFITS, DEFAULT: DEFAULT
  };
  document.addEventListener('bt:screen', function (e) { if (e.detail.id === 'character') render(); });

  BT.registerChecks('character', [
    { name: 'svg builds for every part combination without throwing', fn: function () {
      var n = 0;
      var all = OUTFITS.concat((BT.shop && BT.shop.outfits) || []);
      HAIRS.forEach(function (h, hi) { EYES.forEach(function (e, ei) { all.forEach(function (o) { ACCESSORIES.forEach(function (a, ai) {
        var out = svg(40, { skin: hi % 6, hair: hi, hairColor: ei, eyes: ei, outfit: o.id, accessory: ai });
        if (out.indexOf('<svg') !== 0 || out.indexOf('</svg>') < 0 || out.indexOf('undefined') >= 0 || out.indexOf('NaN') >= 0) throw new Error('bad svg for ' + h + '/' + e + '/' + o.id + '/' + a);
        n++;
      }); }); }); });
      return n === HAIRS.length * EYES.length * all.length * ACCESSORIES.length && svg(40, null).indexOf('width="40"') > 0 &&
        svg(40, { outfit: 3 }).length > 100 && svg(40, { outfit: 'mystery-shop-id' }).indexOf('hsl(') > 0;
    } },
    { name: 'catalog: 6 free outfits with unique ids, every shop outfit resolves to a drawable style', fn: function () {
      var ids = {}; OUTFITS.forEach(function (o) { ids[o.id] = 1; });
      var shop = (BT.shop && BT.shop.outfits) || [];
      return OUTFITS.length === 6 && Object.keys(ids).length === 6 && OUTFITS.every(function (o) { return !o.price; }) &&
        shop.every(function (so) { var o = outfitOf(so.id); return o.style && o.c1 && !ids[so.id]; }) &&
        SKINS.length === 6 && HAIRS.length === 6 && HAIR_COLORS.length === 6 && EYES.length === 4 && ACCESSORIES.length === 6;
    } },
    { name: 'creator renders every part row, the map, and bought outfits', fn: function () {
      var keepC = BT.state.character, keepO = BT.state.outfits, before = BT.screen.current;
      BT.state.outfits = ['astro'];
      render();
      var root = BT.screen.el('character');
      var rows = root.querySelectorAll('.cc-part').length === 7;
      var skins = ui.rows.skin.querySelectorAll('.cc-chip').length === 6;
      var outfits = ui.rows.outfit.querySelectorAll('.cc-chip').length === 7 && !!ui.rows.outfit.querySelector('[data-v="astro"]') && !ui.rows.outfit.querySelector('[data-v="tux"]');
      var map = root.querySelectorAll('.usmap-tile').length === 50 && !!root.querySelector('#cc-name');
      BT.state.outfits = keepO; BT.state.character = keepC;
      if (before) BT.screen.show(before);
      return rows && skins && outfits && map;
    } },
    { name: 'tapping chips and the map updates the draft and preview; name is required to save', fn: function () {
      var keep = JSON.stringify(BT.state.character), before = BT.screen.current;
      BT.state.character = null;
      render();
      ui.rows.hair.querySelectorAll('.cc-chip')[4].click();
      ui.rows.outfit.querySelector('[data-v="suit"]').click();
      var fl = BT.screen.el('character').querySelector('.usmap-tile[data-abbr="FL"] .face');
      var mk = function (t, x) { return window.PointerEvent ? new PointerEvent(t, { bubbles: true, clientX: x, clientY: 5, pointerId: 1 }) : new MouseEvent(t, { bubbles: true, clientX: x, clientY: 5 }); };
      fl.dispatchEvent(mk('pointerdown', 5)); fl.dispatchEvent(mk('pointerup', 5));
      var a = draft.hair === 4 && draft.outfit === 'suit' && draft.homeState === 'FL' && ui.home.textContent.indexOf('Florida') >= 0 &&
        ui.rows.hair.querySelectorAll('.cc-chip')[4].classList.contains('on') && ui.preview.innerHTML.indexOf('<svg') === 0;
      ui.name.value = '   ';
      var b = save() === false && BT.state.character === null;
      ui.name.value = 'Penny Blocksworth XL';
      var c = save() === true && BT.state.character.name === 'Penny Blockswo' && BT.state.character.homeState === 'FL' && BT.screen.current === 'home' &&
        document.getElementById('topbar-avatar').innerHTML.indexOf('<svg') === 0 && document.getElementById('topbar-name').textContent === 'Penny Blockswo';
      BT.state.character = JSON.parse(keep); BT.save(); BT.hud();
      if (before) BT.screen.show(before);
      return a && b && c;
    } }
  ]);
})();
