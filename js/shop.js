// BT.shop: Home ladder, Wheels, Outfits, Vacations. SVG cards drawn in code, owned marks, buying via BT.money.spend,
// vacation postcards with the avatar and a true fact, an album. API: BT.shop.open(tab), BT.shop.buy(kind, id), BT.shop.album(),
// BT.shop.owns(kind, id), data in BT.shop.homes / wheels / outfits / vacations (character.js can read BT.shop.outfits).
(function () {
  'use strict';
  var BT = window.BT, el = BT.el;
  BT.shop = BT.shop || {};
  var shop = BT.shop;

  // ---------- tiny SVG helpers (120x80 cards) ----------
  function svg(inner, bg) {
    return '<svg viewBox="0 0 120 80" width="100%" aria-hidden="true"><rect width="120" height="80" rx="10" fill="' + (bg || '#6ec6ff') + '"/>' + inner + '</svg>';
  }
  function r(x, y, w, h, f, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (rx ? ' rx="' + rx + '"' : '') + '/>'; }
  function c(x, y, rad, f) { return '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + f + '"/>'; }
  function p(pts, f) { return '<polygon points="' + pts + '" fill="' + f + '"/>'; }
  var ground = r(0, 62, 120, 18, '#5fcf5a');
  function windows(x, y, cols, rows, s, gap, f) {
    var out = '';
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) out += r(x + i * (s + gap), y + j * (s + gap), s, s, f || '#fff8e7');
    return out;
  }

  // ---------- Home ladder ----------
  shop.homes = [
    { id: 'parents', title: 'Parents’ house', price: 0, blurb: 'Home sweet home. Free, with dinner included.',
      draw: function () { return svg(ground + r(30, 36, 60, 28, '#c98a4b') + p('24,38 60,14 96,38', '#ff6b6b') + r(54, 48, 12, 16, '#8b5a2b') + windows(36, 42, 1, 1, 10, 0) + windows(74, 42, 1, 1, 10, 0)); } },
    { id: 'apartment', title: 'Apartment', price: 800, blurb: 'Fourth floor, city view, your own key.',
      draw: function () { return svg(ground + r(34, 10, 52, 54, '#8d99a6') + windows(40, 16, 3, 3, 10, 5, '#ffcf3f') + r(54, 50, 12, 14, '#1e2430'), '#4fb3ef'); } },
    { id: 'townhouse', title: 'Townhouse', price: 2500, blurb: 'Two floors, a stoop and a red door.',
      draw: function () { return svg(ground + r(20, 20, 36, 44, '#b3b9c2') + r(56, 20, 44, 44, '#d9a066') + r(20, 14, 80, 8, '#1e2430') + windows(26, 28, 2, 2, 9, 6) + windows(62, 28, 3, 2, 9, 5) + r(72, 48, 12, 16, '#ff6b6b')); } },
    { id: 'house', title: 'House with a yard', price: 6000, blurb: 'A lawn to mow and a tree to climb.',
      draw: function () { return svg(ground + r(14, 34, 64, 30, '#fff8e7') + p('10,36 46,10 82,36', '#8b6cff') + r(40, 46, 12, 18, '#8b5a2b') + windows(20, 42, 1, 1, 11, 0, '#6ec6ff') + windows(60, 42, 1, 1, 11, 0, '#6ec6ff') + r(98, 40, 6, 24, '#8b5a2b') + c(101, 36, 14, '#3a9d3a') + r(86, 56, 30, 4, '#c98a4b')); } },
    { id: 'lakehouse', title: 'Lake house', price: 15000, blurb: 'A dock, a canoe and loons at night.',
      draw: function () { return svg(r(0, 50, 120, 30, '#2f8fd6') + r(0, 44, 120, 8, '#5fcf5a') + r(20, 18, 56, 28, '#8b5a2b') + p('14,20 48,0 82,20', '#5a3b1e') + windows(28, 26, 2, 1, 12, 8, '#ffcf3f') + r(74, 48, 40, 5, '#c98a4b') + r(80, 52, 3, 10, '#c98a4b') + r(104, 52, 3, 10, '#c98a4b') + p('88,66 112,66 106,72 94,72', '#ff6b6b') + c(100, 12, 9, '#ffcf3f'), '#9fd6ff'); } },
    { id: 'mansion', title: 'Mansion', price: 40000, blurb: 'Twelve rooms, a fountain and a very long driveway.',
      draw: function () { return svg(ground + r(6, 30, 108, 34, '#fff8e7') + r(40, 14, 40, 50, '#fff8e7') + p('36,16 60,2 84,16', '#8d99a6') + r(6, 26, 108, 5, '#8d99a6') + windows(12, 38, 2, 2, 8, 6, '#6ec6ff') + windows(86, 38, 2, 2, 8, 6, '#6ec6ff') + windows(48, 22, 2, 2, 9, 6, '#6ec6ff') + r(54, 46, 12, 18, '#8b5a2b') + c(60, 70, 7, '#4fb3ef') + c(60, 70, 3, '#fff'), '#ffd6a5'); } }
  ];

  // ---------- Wheels ----------
  var wheel = function (x, y) { return c(x, y, 7, '#1e2430') + c(x, y, 3, '#8d99a6'); };
  shop.wheels = [
    { id: 'bike', title: 'Bike', price: 150, draw: function () { return svg(ground + c(36, 56, 12, 'none') + '<circle cx="36" cy="56" r="12" fill="none" stroke="#1e2430" stroke-width="4"/><circle cx="84" cy="56" r="12" fill="none" stroke="#1e2430" stroke-width="4"/>' + '<polyline points="36,56 56,34 84,56 60,56 56,34" fill="none" stroke="#ff6b6b" stroke-width="4"/>' + r(50, 28, 14, 4, '#1e2430') + r(74, 30, 12, 4, '#1e2430')); } },
    { id: 'scooter', title: 'Scooter', price: 400, draw: function () { return svg(ground + r(30, 52, 50, 8, '#8b6cff', 3) + r(78, 20, 5, 36, '#1e2430') + r(68, 20, 24, 4, '#1e2430') + wheel(32, 60) + wheel(84, 60)); } },
    { id: 'usedcar', title: 'Used car', price: 1200, draw: function () { return svg(ground + r(14, 40, 92, 20, '#c98a4b', 4) + r(32, 26, 54, 18, '#c98a4b', 6) + r(38, 30, 18, 12, '#6ec6ff') + r(62, 30, 18, 12, '#6ec6ff') + wheel(34, 60) + wheel(86, 60) + r(50, 22, 12, 4, '#8d99a6')); } },
    { id: 'pickup', title: 'Pickup truck', price: 2000, draw: function () { return svg(ground + r(10, 40, 100, 20, '#ff6b6b', 3) + r(62, 22, 40, 20, '#ff6b6b', 5) + r(68, 26, 28, 12, '#6ec6ff') + r(12, 36, 48, 6, '#b23a3a') + wheel(32, 60) + wheel(90, 60)); } },
    { id: 'sportscar', title: 'Sports car', price: 5000, draw: function () { return svg(ground + p('8,58 20,42 50,36 80,36 108,46 112,58', '#ffcf3f') + p('36,42 50,32 76,32 86,42', '#1e2430') + wheel(32, 60) + wheel(90, 60) + r(100, 48, 10, 4, '#ff6b6b')); } },
    { id: 'rv', title: 'RV', price: 9000, draw: function () { return svg(ground + r(8, 18, 104, 42, '#fff8e7', 6) + r(8, 36, 104, 6, '#3ddc97') + windows(18, 24, 4, 1, 14, 6, '#6ec6ff') + r(90, 44, 14, 14, '#8b5a2b') + wheel(30, 60) + wheel(92, 60)); } },
    { id: 'speedboat', title: 'Speedboat', price: 20000, draw: function () { return svg(r(0, 50, 120, 30, '#2f8fd6') + p('10,50 110,50 96,66 24,66', '#fff8e7') + r(40, 36, 36, 14, '#ff6b6b', 4) + r(46, 38, 24, 8, '#6ec6ff') + '<path d="M0 56 Q20 50 40 56 T80 56 T120 56" stroke="#fff" stroke-width="3" fill="none"/>', '#9fd6ff'); } },
    { id: 'helicopter', title: 'Helicopter', price: 60000, draw: function () { return svg(ground + r(20, 30, 80, 3, '#1e2430') + r(58, 32, 4, 8, '#1e2430') + '<ellipse cx="54" cy="48" rx="24" ry="14" fill="#8b6cff"/>' + r(74, 42, 36, 6, '#8b6cff') + r(104, 34, 4, 16, '#1e2430') + r(40, 42, 22, 10, '#6ec6ff', 4) + r(40, 62, 30, 3, '#1e2430') + r(46, 58, 3, 6, '#1e2430') + r(62, 58, 3, 6, '#1e2430'), '#cfe9ff'); } }
  ];

  // ---------- Outfits (a shirt + pants on a card; colors double as the avatar palette for character.js) ----------
  function shirt(top, bottom, extra) {
    return svg(r(40, 14, 40, 34, top, 4) + r(28, 16, 14, 18, top, 3) + r(78, 16, 14, 18, top, 3) + r(44, 48, 14, 26, bottom) + r(62, 48, 14, 26, bottom) + (extra || ''), '#fff8e7');
  }
  shop.outfits = [
    { id: 'rainbow', title: 'Rainbow tee', price: 50, top: '#ff6b6b', bottom: '#4a4a8a', draw: function () { return shirt('#ff6b6b', '#4a4a8a', r(48, 22, 24, 4, '#ffcf3f') + r(48, 28, 24, 4, '#5fcf5a') + r(48, 34, 24, 4, '#6ec6ff')); } },
    { id: 'baker', title: 'Baker’s apron', price: 80, top: '#fff8e7', bottom: '#8d99a6', draw: function () { return shirt('#fff8e7', '#8d99a6', r(50, 22, 20, 24, '#ffb347', 2)); } },
    { id: 'scrubs', title: 'Vet scrubs', price: 120, top: '#3ddc97', bottom: '#3ddc97', draw: function () { return shirt('#3ddc97', '#2bb27a', r(66, 20, 8, 8, '#fff') + r(69, 18, 2, 12, '#ff6b6b') + r(64, 23, 12, 2, '#ff6b6b')); } },
    { id: 'hoodie', title: 'Gamer hoodie', price: 150, top: '#8b6cff', bottom: '#1e2430', draw: function () { return shirt('#8b6cff', '#1e2430', r(54, 14, 12, 8, '#6a4fd8', 4) + r(50, 36, 20, 8, '#6a4fd8', 2)); } },
    { id: 'ranger', title: 'Ranger uniform', price: 200, top: '#8b7a4a', bottom: '#5a4a2a', draw: function () { return shirt('#8b7a4a', '#5a4a2a', r(46, 20, 10, 8, '#6b5a2a') + c(72, 24, 4, '#ffcf3f')); } },
    { id: 'pilot', title: 'Pilot jacket', price: 260, top: '#1e2430', bottom: '#1e2430', draw: function () { return shirt('#1e2430', '#2a3345', r(40, 14, 40, 6, '#ffcf3f') + r(44, 24, 4, 20, '#ffcf3f') + r(72, 24, 4, 20, '#ffcf3f')); } },
    { id: 'labcoat', title: 'Lab coat', price: 320, top: '#ffffff', bottom: '#6ec6ff', draw: function () { return shirt('#ffffff', '#6ec6ff', r(58, 14, 4, 34, '#dddddd') + r(66, 22, 8, 10, '#6ec6ff')); } },
    { id: 'chef', title: 'Chef whites', price: 380, top: '#ffffff', bottom: '#1e2430', draw: function () { return shirt('#ffffff', '#1e2430', c(52, 24, 2, '#1e2430') + c(52, 32, 2, '#1e2430') + c(68, 24, 2, '#1e2430') + c(68, 32, 2, '#1e2430') + r(44, 4, 32, 10, '#fff', 5)); } },
    { id: 'astro', title: 'Astronaut suit', price: 480, top: '#f2f2f2', bottom: '#f2f2f2', draw: function () { return shirt('#f2f2f2', '#e0e0e0', r(46, 20, 28, 12, '#6ec6ff', 3) + r(42, 36, 36, 6, '#ff6b6b')); } },
    { id: 'tux', title: 'Conductor’s tuxedo', price: 600, top: '#1e2430', bottom: '#1e2430', draw: function () { return shirt('#1e2430', '#1e2430', p('54,14 60,30 66,14', '#fff') + p('54,16 66,16 60,20', '#ff6b6b') + r(44, 14, 6, 34, '#0e1218') + r(70, 14, 6, 34, '#0e1218')); } }
  ];

  // ---------- Vacations: scene + one true fact ----------
  var sun = c(100, 16, 9, '#ffcf3f');
  shop.vacations = [
    { id: 'beach', title: 'Beach day', place: 'the beach', price: 300, fact: 'Most beach sand is tiny grains of quartz and crushed seashells, ground down by waves over thousands of years.',
      draw: function () { return svg(sun + r(0, 40, 120, 14, '#2f8fd6') + r(0, 52, 120, 28, '#f6e0a8') + r(80, 44, 3, 26, '#ff6b6b') + p('68,48 96,48 82,40', '#ff6b6b') + p('70,48 94,48 82,56', '#fff'), '#9fd6ff'); } },
    { id: 'canyon', title: 'Grand Canyon', place: 'the Grand Canyon', price: 900, fact: 'The Grand Canyon is 277 miles long, up to 18 miles wide and more than a mile deep.',
      draw: function () { return svg(sun + p('0,40 30,28 50,44 80,30 120,42 120,80 0,80', '#c0603a') + p('0,56 24,48 48,60 76,50 120,58 120,80 0,80', '#8b3a2a') + r(0, 70, 120, 10, '#5a2a1e') + '<path d="M0 74 Q60 70 120 74" stroke="#2f8fd6" stroke-width="3" fill="none"/>', '#ffd6a5'); } },
    { id: 'nyc', title: 'New York City', place: 'New York City', price: 1500, fact: 'The Statue of Liberty was a gift from France, unveiled in New York Harbor in 1886.',
      draw: function () { return svg(r(0, 64, 120, 16, '#2f8fd6') + r(8, 30, 14, 34, '#8d99a6') + r(26, 18, 16, 46, '#5a6270') + r(46, 36, 12, 28, '#8d99a6') + r(62, 10, 14, 54, '#5a6270') + r(80, 28, 16, 36, '#8d99a6') + windows(28, 22, 2, 5, 4, 3, '#ffcf3f') + windows(64, 14, 2, 7, 4, 3, '#ffcf3f') + r(104, 40, 6, 24, '#3ddc97') + c(107, 36, 5, '#3ddc97') + r(110, 24, 2, 14, '#3ddc97'), '#1e2440'); } },
    { id: 'yellowstone', title: 'Yellowstone', place: 'Yellowstone', price: 2200, fact: 'Yellowstone became the world’s first national park in 1872, and Old Faithful erupts about every 90 minutes.',
      draw: function () { return svg(sun + p('0,44 30,20 60,44', '#5a6270') + p('50,46 90,16 120,46', '#8d99a6') + r(0, 44, 120, 36, '#3a9d3a') + r(56, 36, 8, 30, '#cfe9ff', 4) + '<ellipse cx="60" cy="30" rx="12" ry="8" fill="#fff"/>' + '<ellipse cx="60" cy="68" rx="18" ry="5" fill="#6ec6ff"/>', '#9fd6ff'); } },
    { id: 'hawaii', title: 'Hawaii', place: 'Hawaii', price: 4000, fact: 'Hawaii is the only state made entirely of islands, and its volcano Mauna Kea is taller than Everest when measured from the sea floor.',
      draw: function () { return svg(sun + p('30,60 70,12 110,60', '#5a3b1e') + p('62,12 70,8 78,12 74,20 66,20', '#ff6b6b') + r(0, 56, 120, 24, '#2f8fd6') + r(0, 52, 60, 10, '#f6e0a8') + r(18, 30, 3, 24, '#8b5a2b') + p('6,30 20,20 34,30 20,34', '#3a9d3a'), '#9fd6ff'); } },
    { id: 'alaska', title: 'Alaska cruise', place: 'Alaska', price: 6000, fact: 'Alaska has more coastline than all the other 49 states put together.',
      draw: function () { return svg(p('0,44 24,14 48,44', '#dfe9f3') + p('40,44 72,8 104,44', '#f4f8fb') + p('90,44 108,24 120,44', '#dfe9f3') + r(0, 44, 120, 36, '#2a6fb0') + p('20,60 100,60 90,72 30,72', '#fff8e7') + r(44, 50, 32, 10, '#ff6b6b', 2) + r(56, 42, 6, 8, '#1e2430'), '#b9dcff'); } },
    { id: 'paris', title: 'Paris', place: 'Paris', price: 8000, fact: 'The Eiffel Tower was finished in 1889 and was the tallest structure in the world for 41 years.',
      draw: function () { return svg(r(0, 66, 120, 14, '#8d99a6') + p('60,8 46,66 54,66 60,30 66,66 74,66', '#4a4a4a') + r(44, 40, 32, 4, '#4a4a4a') + r(50, 26, 20, 3, '#4a4a4a') + c(18, 20, 7, '#fff') + c(26, 16, 9, '#fff') + c(34, 22, 6, '#fff') + r(88, 50, 24, 16, '#fff8e7') + r(88, 46, 24, 4, '#6ec6ff') + windows(92, 54, 2, 1, 6, 8, '#6ec6ff'), '#ffd6c2'); } },
    { id: 'tokyo', title: 'Tokyo', place: 'Tokyo', price: 12000, fact: 'Tokyo is the largest metropolitan area on Earth, home to about 37 million people.',
      draw: function () { return svg(r(0, 64, 120, 16, '#5a6270') + r(8, 34, 18, 30, '#8d99a6') + r(30, 24, 20, 40, '#b3b9c2') + r(70, 30, 16, 34, '#8d99a6') + r(90, 20, 20, 44, '#b3b9c2') + p('54,64 60,8 66,64', '#ff6b6b') + r(56, 40, 8, 4, '#fff') + r(54, 50, 12, 4, '#fff') + c(30, 14, 10, '#ff6b6b') + windows(92, 26, 2, 4, 5, 4, '#ffcf3f'), '#2b3550'); } },
    { id: 'spacecamp', title: 'Space camp', place: 'Space Camp', price: 20000, fact: 'Space Camp is in Huntsville, Alabama, and astronauts on the space station see about 16 sunrises every day.',
      draw: function () { return svg(c(14, 12, 1.5, '#fff') + c(40, 8, 1.5, '#fff') + c(90, 14, 1.5, '#fff') + c(108, 40, 1.5, '#fff') + c(100, 60, 14, '#dfe9f3') + c(96, 56, 3, '#b3b9c2') + c(104, 64, 2, '#b3b9c2') + r(50, 20, 20, 40, '#f4f8fb', 8) + p('50,30 40,60 50,60', '#ff6b6b') + p('70,30 80,60 70,60', '#ff6b6b') + c(60, 34, 5, '#6ec6ff') + p('54,60 66,60 60,76', '#ffcf3f'), '#0e1a3a'); } }
  ];
  var KINDS = { homes: shop.homes, wheels: shop.wheels, outfits: shop.outfits, vacations: shop.vacations };
  var TABS = [['homes', 'Home'], ['wheels', 'Wheels'], ['outfits', 'Outfits'], ['vacations', 'Vacations']];
  var tab = 'homes';

  shop.item = function (kind, id) { return (KINDS[kind] || []).find(function (x) { return x.id === id; }) || null; };
  shop.homeIndex = function () { var i = shop.homes.findIndex(function (h) { return h.id === BT.state.home; }); return i < 0 ? 0 : i; };
  shop.owns = function (kind, id) {
    var s = BT.state;
    if (kind === 'homes') return shop.homes.findIndex(function (h) { return h.id === id; }) <= shop.homeIndex();
    if (kind === 'wheels') return s.vehicles.indexOf(id) >= 0;
    if (kind === 'outfits') return s.outfits.indexOf(id) >= 0;
    if (kind === 'vacations') return s.vacations.some(function (v) { return v.id === id; });
    return false;
  };
  // Buys one item. Homes climb the ladder one step at a time. Returns true when money changed hands.
  shop.buy = function (kind, id, fromEl) {
    var item = shop.item(kind, id);
    if (!item) return false;
    if (shop.owns(kind, id)) { BT.toast('You already have that', 'info'); return false; }
    if (kind === 'homes' && shop.homes.indexOf(item) !== shop.homeIndex() + 1) { BT.toast('Move up one home at a time', 'info'); return false; }
    if (!BT.money.spend(item.price, 'shop:' + kind + ':' + id)) {
      BT.toast('Not enough money yet. You need ' + BT.fmt(item.price - BT.money.get()) + ' more.', 'bad');
      BT.sfx.bad(); BT.voice.say('notenough');
      return false;
    }
    var s = BT.state;
    if (kind === 'homes') s.home = id;
    else if (kind === 'wheels') s.vehicles.push(id);
    else if (kind === 'outfits') s.outfits.push(id);
    else if (kind === 'vacations') s.vacations.push({ id: id, date: new Date().toISOString() });
    BT.log.event('shop_buy', { kind: kind, id: id, price: item.price });
    if (kind === 'vacations') BT.log.event('vacation', { id: id, price: item.price });
    BT.save();
    BT.sfx.coin();
    if (fromEl) BT.coinFly(fromEl);
    BT.voice.say(kind === 'vacations' ? 'vacation' : kind === 'homes' ? 'newhome' : 'sold');
    if (kind === 'vacations') shop.postcard(item);
    else { BT.sfx.good(); BT.toast(item.title + ' is yours!', 'good'); }
    if (BT.screen.current === 'shop') shop.render();
    return true;
  };

  var style = document.createElement('style');
  style.textContent =
    '.shop-tabs .btn{margin-bottom:0}.shop-tabs .btn.on{background:var(--gold)}' +
    '.shop-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));padding:4px 2px 12px}' +
    '.shop-card{display:flex;flex-direction:column;gap:6px;padding:12px}.shop-card svg{display:block;border-radius:10px;border:3px solid rgba(0,0,0,.12)}' +
    '.shop-card h3{margin:0;font-size:1.1rem}.shop-card .blurb{font-size:.9rem;opacity:.75;min-height:1.2em}' +
    '.shop-card.owned{outline:4px solid var(--mint)}.shop-card .btn{margin:0;width:100%}' +
    '.owned-mark{display:inline-flex;align-items:center;justify-content:center;min-height:52px;font-weight:700;color:#1f8f5f;font-size:1.1rem}' +
    '.postcard{position:relative;background:#fff8e7;border:4px solid #fff;box-shadow:0 10px 0 var(--edge);border-radius:12px;padding:12px;transform:rotate(-2deg);animation:pc-in .6s cubic-bezier(.2,.8,.3,1.2)}' +
    '@keyframes pc-in{from{transform:translateY(60vh) rotate(18deg) scale(.6);opacity:0}to{transform:rotate(-2deg) scale(1);opacity:1}}' +
    '.postcard .scene{position:relative}.postcard .scene svg{border-radius:8px;display:block}' +
    '.postcard .who{position:absolute;left:10px;bottom:0;animation:pc-wave 1.4s ease-in-out infinite alternate;transform-origin:bottom center}' +
    '@keyframes pc-wave{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}' +
    '.postcard .stamp{position:absolute;right:14px;top:14px;width:46px;height:54px;background:#fff;border:3px dashed #c99a1a;display:grid;place-items:center;font-size:1.5rem;transform:rotate(8deg)}' +
    '.postcard .greet{font-size:1.5rem;font-weight:700;color:#ff6b6b;text-shadow:2px 2px 0 #fff;margin:8px 0 0}' +
    '.album-row{display:flex;gap:12px;align-items:center;padding:8px;border-bottom:2px solid rgba(0,0,0,.08)}.album-row svg{width:120px;flex:none;border-radius:8px}' +
    '@media (prefers-reduced-motion:reduce){.postcard,.postcard .who{animation:none}}';
  document.head.appendChild(style);

  function modal(children, cls) {
    var box = el('div', { class: 'modal-box ' + (cls || '') }, children);
    // pointerdown, not click: Safari synthesizes a click after a touch, which would land on this backdrop and close the box the tap just opened
    var m = el('div', { class: 'modal', onpointerdown: function (e) { if (e.target === m) m.remove(); } }, box);
    document.body.appendChild(m);
    return m;
  }
  function avatar(size) { return BT.character && typeof BT.character.svg === 'function' && BT.state.character ? BT.character.svg(size) : BT.avatarFallback(size); }

  // The postcard animation after buying a vacation: scene, waving avatar, stamp, greeting, the fact, add to album.
  shop.postcard = function (item) {
    if (typeof item === 'string') item = shop.item('vacations', item);
    if (!item) return null;
    BT.sfx.fanfare(); BT.confetti();
    var m = modal([
      el('div', { class: 'postcard' }, [
        el('div', { class: 'scene' }, [
          el('div', { html: item.draw() }),
          el('div', { class: 'who', html: avatar(90) }),
          el('div', { class: 'stamp', text: '✈️' })
        ]),
        el('div', { class: 'greet center', text: 'Greetings from ' + item.place + '!' }),
        el('p', { text: item.fact, style: { margin: '6px 0 0', lineHeight: '1.4' } })
      ]),
      el('div', { class: 'btn-row', style: { marginTop: '16px' } }, [
        el('button', { class: 'btn gold', type: 'button', text: 'Add to album', onclick: function () { BT.sfx.click(); m.remove(); } }),
        el('button', { class: 'btn ghost', type: 'button', text: 'See the album', onclick: function () { BT.sfx.click(); m.remove(); shop.album(); } })
      ])
    ], 'postcard-box');
    return m;
  };

  shop.album = function () {
    var trips = BT.state.vacations.slice().reverse();
    var m = modal([
      el('h2', { class: 'center', text: 'Postcard album' }),
      trips.length ? el('div', { class: 'scroll', style: { maxHeight: '60dvh' } }, trips.map(function (v) {
        var item = shop.item('vacations', v.id);
        if (!item) return null;
        return el('div', { class: 'album-row' }, [
          el('div', { html: item.draw() }),
          el('div', null, [el('strong', { text: item.title }), el('div', { class: 'muted', text: new Date(v.date).toLocaleDateString() }), el('div', { text: item.fact, style: { fontSize: '.9rem' } })])
        ]);
      })) : el('p', { class: 'center muted', text: 'No trips yet. Buy a vacation and your first postcard lands here.' }),
      el('div', { class: 'btn-row' }, el('button', { class: 'btn gold', type: 'button', text: 'Close', onclick: function () { BT.sfx.click(); m.remove(); } }))
    ]);
    return m;
  };

  function card(kind, item) {
    var owned = shop.owns(kind, item.id);
    var action;
    if (owned) action = el('div', { class: 'owned-mark', text: kind === 'vacations' ? '✓ Visited' : kind === 'homes' && item.id === BT.state.home ? '✓ Living here' : '✓ Owned' });
    else {
      var later = kind === 'homes' && shop.homes.indexOf(item) !== shop.homeIndex() + 1;
      var can = BT.money.get() >= item.price;
      action = el('button', { class: 'btn ' + (later ? 'stone' : can ? 'gold' : 'stone'), type: 'button', disabled: later ? 'disabled' : null,
        text: later ? 'Next: ' + BT.fmt(item.price) : 'Buy ' + BT.fmt(item.price), data: { buy: item.id },
        onclick: function (e) { shop.buy(kind, item.id, e.currentTarget); } });
    }
    return el('div', { class: 'card shop-card' + (owned ? ' owned' : ''), data: { item: item.id } }, [
      el('div', { html: item.draw() }),
      el('h3', { text: item.title }),
      el('div', { class: 'blurb', text: item.blurb || item.fact || '' }),
      action
    ]);
  }

  shop.render = function () {
    var root = BT.screen.el('shop');
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'screen-head' }, [
      el('button', { class: 'btn btn-sm stone', type: 'button', text: '← Back', onclick: function () { BT.sfx.click(); BT.screen.show(from); } }),
      el('h2', { text: 'Shop' }),
      el('button', { class: 'btn btn-sm violet', type: 'button', text: '📖 Album', onclick: function () { BT.sfx.click(); shop.album(); } })
    ]));
    root.appendChild(el('div', { class: 'btn-row shop-tabs', style: { marginBottom: '10px' } }, TABS.map(function (t) {
      return el('button', { class: 'btn btn-sm' + (t[0] === tab ? ' on' : ''), type: 'button', text: t[1], data: { tab: t[0] }, onclick: function () { BT.sfx.click(); tab = t[0]; shop.render(); } });
    })));
    var grid = el('div', { class: 'shop-grid' }, KINDS[tab].map(function (it) { return card(tab, it); }));
    root.appendChild(el('div', { class: 'scroll', style: { flex: '1' } }, grid));
  };

  shop.open = function (which) { if (which && KINDS[which]) tab = which; BT.screen.show('shop'); };
  var from = 'home'; // Back returns to the screen the shop was opened from (town in free time, home from the menu)
  document.addEventListener('bt:screen', function (e) {
    if (e.detail.id === 'shop') shop.render();
    else if (e.detail.id === 'home' || e.detail.id === 'town') from = e.detail.id;
  });

  // ---------- checks ----------
  function snapshot() { return JSON.stringify({ money: BT.state.money, lifetime: BT.state.lifetime, home: BT.state.home, vehicles: BT.state.vehicles, outfits: BT.state.outfits, vacations: BT.state.vacations, events: BT.state.events.length }); }
  function restore(snap) { var s = JSON.parse(snap); BT.state.money = s.money; BT.state.lifetime = s.lifetime; BT.state.home = s.home; BT.state.vehicles = s.vehicles; BT.state.outfits = s.outfits; BT.state.vacations = s.vacations; BT.state.events.length = s.events; BT.save(); BT.hud(); }
  BT.registerChecks('shop', [
    { name: 'catalog sizes and prices match the spec', fn: function () {
      var hp = shop.homes.map(function (h) { return h.price; }).join(','), wp = shop.wheels.map(function (w) { return w.price; }).join(',');
      var vp = shop.vacations.map(function (v) { return v.price; }).join(',');
      return hp === '0,800,2500,6000,15000,40000' && wp === '150,400,1200,2000,5000,9000,20000,60000' &&
        vp === '300,900,1500,2200,4000,6000,8000,12000,20000' && shop.outfits.length === 10 &&
        shop.outfits.every(function (o) { return o.price >= 50 && o.price <= 600; });
    } },
    { name: 'every item draws an SVG, ids unique, vacations carry a fact', fn: function () {
      var ids = {};
      return Object.keys(KINDS).every(function (k) {
        return KINDS[k].every(function (it) {
          if (ids[k + it.id]) return false; ids[k + it.id] = 1;
          return typeof it.id === 'string' && typeof it.title === 'string' && typeof it.price === 'number' && /^<svg/.test(it.draw()) &&
            (k !== 'vacations' || (typeof it.fact === 'string' && it.fact.length > 20 && typeof it.place === 'string'));
        });
      });
    } },
    { name: 'buy fails without money and owns nothing', fn: function () {
      var snap = snapshot();
      BT.state.money = 10; BT.state.vehicles = [];
      var ok = shop.buy('wheels', 'bike') === false && BT.state.vehicles.indexOf('bike') < 0 && BT.state.money === 10;
      restore(snap); return ok;
    } },
    { name: 'buy spends, marks owned, logs shop_buy; homes climb one step', fn: function () {
      var snap = snapshot();
      BT.state.money = 5000; BT.state.home = 'parents'; BT.state.vehicles = []; BT.state.outfits = []; BT.state.vacations = [];
      var a = shop.buy('wheels', 'bike') === true && BT.state.money === 4850 && shop.owns('wheels', 'bike') && shop.buy('wheels', 'bike') === false;
      var b = shop.buy('homes', 'townhouse') === false && shop.buy('homes', 'apartment') === true && BT.state.home === 'apartment' && shop.owns('homes', 'parents');
      var c = shop.buy('outfits', 'rainbow') === true && BT.state.outfits.indexOf('rainbow') >= 0;
      var ev = BT.state.events.filter(function (e) { return e.type === 'shop_buy'; });
      var d = ev.length >= 3 && ev[ev.length - 1].data.id === 'rainbow';
      restore(snap); return a && b && c && d;
    } },
    { name: 'vacation logs, shows the postcard with the fact and the album lists it', fn: function () {
      var snap = snapshot();
      BT.state.money = 1000; BT.state.vacations = [];
      var ok = shop.buy('vacations', 'beach') === true;
      var pc = document.querySelector('.postcard');
      ok = ok && pc && pc.textContent.indexOf('quartz') >= 0 && pc.querySelector('.who svg') && BT.state.events.some(function (e) { return e.type === 'vacation' && e.data.id === 'beach'; });
      document.querySelectorAll('.modal').forEach(function (m) { m.remove(); });
      var al = shop.album();
      ok = ok && al.textContent.indexOf('Beach day') >= 0;
      al.remove();
      restore(snap); return !!ok;
    } },
    { name: 'shop screen renders tabs and a card per item', fn: function () {
      var before = BT.screen.current, keepTab = tab;
      shop.open('vacations');
      var root = BT.screen.el('shop');
      var ok = root.querySelectorAll('.shop-tabs .btn').length === 4 && root.querySelectorAll('.shop-card').length === 9;
      tab = keepTab;
      if (before) BT.screen.show(before);
      return ok;
    } }
  ]);
})();
