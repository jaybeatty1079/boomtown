// BT.bookstop: the Book Stop (timer, title, pages number pad, one line, $25 -> state.books) and the Bookshelf.
// open({afterPayday:true}) shows the form and ends on the town screen; open() from home shows the Bookshelf.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;
  var PAY = 25, MIN_WORDS = 6, TIMER_S = 10 * 60, MAX_PAGES = 9999;
  var timer = { left: TIMER_S, id: null };

  document.head.appendChild(el('style', { text: [
    '.bs-wrap{flex:1;min-height:0;display:flex;gap:14px;flex-wrap:wrap;align-content:flex-start;overflow:auto}',
    '.bs-wrap>.card{flex:1 1 320px;min-width:0}',
    '.bs-timer{font-size:2.6rem;font-weight:700;text-align:center;letter-spacing:2px}',
    '.bs-shelf{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));overflow:auto;flex:1;min-height:0;padding-bottom:6px}',
    '.bs-book{display:flex;flex-direction:column;gap:6px}',
    '.bs-book .spine{height:10px;border-radius:6px}',
    '.bs-start{background:var(--gold);border-radius:999px;padding:2px 10px;font-size:.85rem;font-weight:700;display:inline-block}',
    '.bs-tag{border-radius:999px;padding:2px 10px;font-size:.85rem;font-weight:700;display:inline-block;color:#fff}',
    '.bs-tag.mystery{background:var(--violet)} .bs-tag.money{background:#2a9d5c} .bs-tag.adventure{background:var(--coral)} .bs-tag.classic{background:var(--dirt)}',
    '.bs-count{font-weight:700;text-align:right}',
    '.bs-wrap .numpad{width:100%}',
    // landscape iPad: 12 keys in 3 rows of 4 with shorter keys, so the whole form fits without scrolling
    '@media (max-height:900px){.bs-wrap .numpad{grid-template-columns:repeat(4,1fr);max-width:420px}.bs-wrap .numpad .btn{min-height:56px}.bs-timer{font-size:2.2rem}}'
  ].join('\n') }));

  function wordCount(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
  function lastTitle() { var b = BT.state.books; return b.length ? b[b.length - 1].title : ''; }
  function mmss(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function go(id) { if (BT.main && BT.main.go) BT.main.go(id); else BT.screen.show(id); }
  function stopTimer() { if (timer.id) { clearInterval(timer.id); timer.id = null; } }

  // Validates, saves to state.books, pays $25, logs 'book'. Returns the entry or a string naming what is missing.
  function submit(data) {
    var title = String(data.title || '').trim().slice(0, 80);
    var pages = Math.max(0, Math.min(MAX_PAGES, parseInt(data.pages, 10) || 0));
    var line = String(data.line || '').trim();
    if (!title) return 'Type the book title';
    if (wordCount(line) < MIN_WORDS) return 'Tell me one line, at least ' + MIN_WORDS + ' words';
    var entry = { date: new Date().toISOString(), title: title, pages: pages, line: line };
    BT.state.books.push(entry);
    BT.money.add(PAY, 'book');
    BT.log.event('book', { title: title, pages: pages, words: wordCount(line) });
    BT.save();
    return entry;
  }

  function openForm(opts) {
    opts = opts || {};
    var next = opts.next || (opts.afterPayday ? 'town' : 'home');
    var root = BT.screen.el('bookstop');
    root.innerHTML = '';
    stopTimer();
    timer.left = TIMER_S;

    // timer
    var clock = el('div', { class: 'bs-timer', text: mmss(timer.left) });
    var startBtn = el('button', { class: 'btn mint', type: 'button', text: 'Start timer', onclick: function () {
      BT.sfx.click();
      if (timer.id) { stopTimer(); startBtn.textContent = 'Resume'; return; }
      startBtn.textContent = 'Pause';
      timer.id = setInterval(function () {
        timer.left = Math.max(0, timer.left - 1);
        clock.textContent = mmss(timer.left);
        if (timer.left === 0) { stopTimer(); startBtn.textContent = 'Done!'; startBtn.disabled = true; BT.sfx.fanfare(); BT.toast('Time! Now tell me one thing.', 'good'); }
      }, 1000);
    } });
    var skipBtn = el('button', { class: 'btn stone', type: 'button', text: 'Skip timer', onclick: function () {
      BT.sfx.click(); stopTimer(); timer.left = 0; clock.textContent = mmss(0); startBtn.textContent = 'Skipped'; startBtn.disabled = true;
    } });

    // fields
    var title = el('input', { type: 'text', class: 'input', maxlength: '80', placeholder: 'Book title', autocomplete: 'off', 'aria-label': 'Book title',
      value: opts.title || lastTitle() });
    var pagesVal = '';
    var pagesDisplay = el('div', { class: 'numpad-display', text: '0' });
    function setPages(v) { pagesVal = v.replace(/^0+(?=\d)/, '').slice(0, 4); pagesDisplay.textContent = pagesVal || '0'; }
    var pad = el('div', { class: 'numpad' });
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'C'].forEach(function (k) {
      pad.appendChild(el('button', { class: 'btn ' + (k === 'C' ? 'coral' : k === '⌫' ? 'stone' : 'sky'), type: 'button', text: k, 'aria-label': k === '⌫' ? 'Delete' : k === 'C' ? 'Clear' : k,
        onclick: function () {
          BT.sfx.click();
          if (k === 'C') setPages(''); else if (k === '⌫') setPages(pagesVal.slice(0, -1)); else setPages(pagesVal + k);
        } }));
    });
    var line = el('textarea', { class: 'input', placeholder: 'One line about what you read (at least ' + MIN_WORDS + ' words)', 'aria-label': 'One line about the book', rows: 3 });
    var count = el('div', { class: 'bs-count muted', text: '0 / ' + MIN_WORDS + ' words' });
    var done = el('button', { class: 'btn btn-big gold', type: 'button', text: 'Done · +' + BT.fmt(PAY), disabled: '' });
    function refresh() {
      var n = wordCount(line.value);
      count.textContent = Math.min(n, 99) + ' / ' + MIN_WORDS + ' words';
      if (n >= MIN_WORDS && title.value.trim()) done.removeAttribute('disabled'); else done.setAttribute('disabled', '');
    }
    title.addEventListener('input', refresh);
    line.addEventListener('input', refresh);
    done.addEventListener('click', function () {
      var r = submit({ title: title.value, pages: pagesVal, line: line.value });
      if (typeof r === 'string') { BT.toast(r, 'bad'); return; }
      stopTimer();
      BT.sfx.good(); BT.coinFly(done); BT.voice.say('booksaved');
      BT.toast('Book saved! +' + BT.fmt(PAY), 'good');
      BT.wait(700).then(function () { go(next); });
    });

    root.appendChild(el('div', { class: 'screen-head' }, [
      el('h2', { text: 'Book Stop' }),
      el('div', { class: 'row' }, [
        el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Bookshelf', onclick: function () { BT.sfx.click(); stopTimer(); openShelf({ back: 'form', next: next }); } }),
        // after payday there is no Back; this is the way out for a kid who has not read today (pays nothing, logs nothing in state.books)
        opts.afterPayday ? el('button', { class: 'btn btn-sm ghost', type: 'button', text: 'No reading today', onclick: function () {
          BT.sfx.click(); stopTimer(); BT.log.event('book_skipped'); go('town');
        } }) : el('button', { class: 'btn btn-sm stone', type: 'button', text: 'Back', onclick: function () { BT.sfx.click(); stopTimer(); go(next); } })
      ])
    ]));
    root.appendChild(el('div', { class: 'bs-wrap' }, [
      el('div', { class: 'card stack' }, [
        el('p', { class: 'muted', text: 'Read for 10 minutes, then tell me one thing.' }),
        clock,
        el('div', { class: 'btn-row' }, [startBtn, skipBtn]),
        el('label', { class: 'field', text: 'Book title' }), title,
        el('label', { class: 'field', text: 'Pages read' }), pagesDisplay, pad
      ]),
      el('div', { class: 'card stack' }, [
        el('label', { class: 'field', text: 'One line about it' }), line, count,
        done
      ])
    ]));
    refresh();
    BT.screen.show('bookstop', { form: true });
    BT.voice.say('bookstop');
    BT.bookstop.form ={ title: title, line: line, setPages: setPages, done: done, refresh: refresh };
  }

  function openShelf(opts) {
    opts = opts || {};
    var root = BT.screen.el('bookstop');
    root.innerHTML = '';
    var next = opts.next || 'home';
    var books = BT.data.books.slice().sort(function (a, b) { return (b.start ? 1 : 0) - (a.start ? 1 : 0); });
    var colors = { mystery: '#8b6cff', money: '#2a9d5c', adventure: '#ff6b6b', classic: '#8b5a2b' };
    root.appendChild(el('div', { class: 'screen-head' }, [
      el('h2', { text: 'Bookshelf' }),
      el('div', { class: 'row' }, [
        el('button', { class: 'btn btn-sm coral', type: 'button', text: 'Log a book', onclick: function () { BT.sfx.click(); openForm({ next: next }); } }),
        el('button', { class: 'btn btn-sm stone', type: 'button', text: 'Back', onclick: function () {
          BT.sfx.click();
          if (opts.back === 'form') openForm({ next: next, afterPayday: next === 'town' }); else go('home');
        } })
      ])
    ]));
    root.appendChild(el('div', { class: 'bs-shelf' }, books.map(function (b) {
      return el('div', { class: 'card bs-book' }, [
        el('div', { class: 'spine', style: { background: colors[b.tag] || '#8d99a6' } }),
        el('div', { class: 'row' }, [
          b.start ? el('span', { class: 'bs-start', text: 'Start here' }) : null,
          el('span', { class: 'bs-tag ' + b.tag, text: b.tag })
        ]),
        el('h3', { text: b.title }),
        el('div', { class: 'muted', text: 'by ' + b.author }),
        el('p', { text: b.line }),
        el('div', { class: 'spacer' }),
        el('button', { class: 'btn btn-sm gold', type: 'button', text: 'Read this one', onclick: function () {
          BT.sfx.click(); BT.log.event('book_picked', { title: b.title, tag: b.tag });
          openForm({ next: next, afterPayday: next === 'town', title: b.title });
        } })
      ]);
    })));
    BT.screen.show('bookstop', { shelf: true });
  }

  BT.bookstop = {
    open: function (opts) { opts = opts || {}; if (opts.afterPayday || opts.form) openForm(opts); else openShelf(opts); },
    openForm: openForm, openShelf: openShelf, submit: submit, wordCount: wordCount,
    PAY: PAY, MIN_WORDS: MIN_WORDS, TIMER_S: TIMER_S, timer: timer
  };

  BT.registerChecks('bookstop', [
    { name: 'word count and mm:ss', fn: function () {
      return wordCount('  one two  three ') === 3 && wordCount('') === 0 && mmss(600) === '10:00' && mmss(65) === '1:05';
    } },
    { name: 'submit rejects a missing title or a short line, saves and pays $25 otherwise', fn: function () {
      var keepB = BT.state.books.slice(), m = BT.state.money, l = BT.state.lifetime, ev = BT.state.events.length;
      var a = typeof submit({ title: '', pages: 5, line: 'one two three four five six' }) === 'string';
      var b = typeof submit({ title: 'X', pages: 5, line: 'too short' }) === 'string';
      var r = submit({ title: 'The Lemonade War', pages: '12', line: 'Evan and Jessie start a lemonade war.' });
      var c = typeof r === 'object' && r.pages === 12 && BT.state.books[BT.state.books.length - 1] === r && BT.state.money === m + PAY;
      var d = BT.state.events.slice(ev).some(function (e) { return e.type === 'book'; });
      BT.state.books = keepB; BT.state.money = m; BT.state.lifetime = l; BT.state.events.length = ev; BT.save(); BT.hud();
      return a && b && c && d;
    } },
    { name: 'form renders timer, title, number pad, line and a disabled Done; shelf lists 18 books', fn: function () {
      var before = BT.screen.current;
      openForm({ next: 'home' });
      var root = BT.screen.el('bookstop');
      var a = !!root.querySelector('.bs-timer') && root.querySelectorAll('.numpad .btn').length === 12 && root.querySelector('textarea') && root.querySelector('.btn-big').disabled;
      BT.bookstop.form.setPages('0042');
      var b = root.querySelector('.numpad-display').textContent === '42';
      BT.bookstop.form.title.value = 'A Book'; BT.bookstop.form.line.value = 'a b c d e f'; BT.bookstop.form.refresh();
      var c = !root.querySelector('.btn-big').disabled;
      openShelf({});
      var d = root.querySelectorAll('.bs-book').length === 18 && root.querySelectorAll('.bs-start').length === 3;
      stopTimer();
      if (before) BT.screen.show(before);
      return a && b && c && d;
    } },
    { name: 'after payday the form has a No reading today exit that pays nothing and logs book_skipped', fn: function () {
      var before = BT.screen.current, m = BT.state.money, nb = BT.state.books.length, ev = BT.state.events.length;
      openForm({ afterPayday: true });
      var root = BT.screen.el('bookstop');
      var btns = Array.prototype.slice.call(root.querySelectorAll('.screen-head .btn'));
      var skip = btns.filter(function (b) { return b.textContent === 'No reading today'; })[0];
      var a = !!skip && !btns.some(function (b) { return b.textContent === 'Back'; });
      if (skip) skip.click();
      var b = BT.state.money === m && BT.state.books.length === nb && BT.state.events.slice(ev).some(function (e) { return e.type === 'book_skipped'; });
      BT.state.events.length = ev; BT.save();
      if (before) BT.screen.show(before);
      return a && b;
    } }
  ]);
})();
