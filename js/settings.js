// BT.settings: sound on/off, save code (show / copy / import), edit character, reset progress, version label.
(function () {
  'use strict';
  var BT = window.BT;
  var el = BT.el;

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false);
  }

  function render() {
    var root = BT.screen.el('settings');
    if (!root) return;
    root.innerHTML = '';
    var s = BT.state.settings;

    // click, not pointerdown: a finger that starts a scroll on the switch must not flip it
    function makeSwitch(label, key, after) {
      var sw = el('div', { class: 'switch' + (s[key] !== false ? ' on' : ''), role: 'switch', 'aria-checked': String(s[key] !== false),
        onclick: function () {
          s[key] = s[key] === false; BT.save();
          sw.classList.toggle('on', s[key]); sw.setAttribute('aria-checked', String(s[key]));
          if (s[key]) BT.sfx.click();
          after(s[key]);
        } }, [el('span', { class: 'track' }), el('span', { text: label })]);
      return sw;
    }
    var soundSwitch = makeSwitch('Sound effects', 'sound', function (on) { BT.music.refresh(); if (!on) BT.voice.stop(); });
    var musicSwitch = makeSwitch('Music', 'music', function (on) { BT.music.setEnabled(on); });
    var voiceSwitch = makeSwitch('Voice lines', 'voice', function (on) { BT.voice.setEnabled(on); });

    // save code
    var codeBox = el('textarea', { class: 'input', readonly: '', rows: 3, 'aria-label': 'Save code', style: { display: 'none', fontSize: '12px', minHeight: '70px' } });
    // Clearing needs the same 1.5 s hold as the Parent button, so three quick taps cannot open the report to the child.
    var holdTimer = null, HOLD = BT.TEST ? 150 : 1500;
    function cancelHold() {
      clearCode.style.opacity = '';
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; BT.toast('Hold the button for 2 seconds to clear', 'info'); }
    }
    var clearCode = el('button', { class: 'btn btn-sm coral', type: 'button', text: 'Hold to clear parent code', style: { display: 'none' },
      onpointerdown: function (e) {
        e.preventDefault();
        if (holdTimer) return; // a second finger must not start a second timer the pointerup cannot cancel
        clearCode.style.opacity = '.6';
        holdTimer = setTimeout(function () {
          holdTimer = null; clearCode.style.opacity = '';
          s.parentCode = null; BT.save(); BT.toast('Parent code cleared', 'good'); clearCode.style.display = 'none';
        }, HOLD);
      },
      onpointerup: cancelHold, onpointercancel: cancelHold, onpointerleave: cancelHold,
      oncontextmenu: function (e) { e.preventDefault(); } });
    var showBtn = el('button', { class: 'btn btn-sm sky', type: 'button', text: 'Show save code', onclick: function () {
      codeBox.value = BT.exportCode(); codeBox.style.display = 'block';
      if (s.parentCode) clearCode.style.display = ''; // a forgotten code can be cleared only with the save code visible
    } });
    var copyBtn = el('button', { class: 'btn btn-sm mint', type: 'button', text: 'Copy save code', onclick: function () {
      var code = BT.exportCode(); codeBox.value = code; codeBox.style.display = 'block';
      copyText(code).then(function (ok) {
        if (!ok) { codeBox.focus(); codeBox.select(); }
        BT.toast(ok ? 'Copied! Paste it on the other device.' : 'Select the code and copy it', ok ? 'good' : 'info');
      });
    } });
    var pasteBox = el('textarea', { class: 'input', rows: 2, placeholder: 'Paste a save code here', 'aria-label': 'Paste save code', style: { fontSize: '12px', minHeight: '60px' } });
    var importBtn = el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Import save code', onclick: function () {
      var code = pasteBox.value.trim();
      if (!code) { BT.toast('Paste a save code first', 'bad'); return; }
      if (!confirm('Replace the save on this device with the pasted one?')) return;
      if (BT.importCode(code)) { BT.toast('Save loaded!', 'good'); BT.sfx.good(); render(); }
      else { BT.toast('That code did not work', 'bad'); BT.sfx.bad(); }
    } });

    // reset
    var resetInput = el('input', { type: 'text', class: 'input', placeholder: 'Type RESET to confirm', autocapitalize: 'characters', autocomplete: 'off', 'aria-label': 'Type RESET' });
    var resetBtn = el('button', { class: 'btn btn-sm coral', type: 'button', text: 'Reset progress', onclick: function () {
      if (resetInput.value.trim() !== 'RESET') { BT.toast('Type RESET in the box first', 'bad'); resetInput.focus(); return; }
      BT.reset(); BT.toast('Fresh start!', 'info');
      if (BT.character && BT.character.open) BT.character.open(); else BT.screen.show('character');
    } });

    var editChar = el('button', { class: 'btn btn-sm gold', type: 'button', text: 'Edit character', onclick: function () {
      if (BT.character && BT.character.open) BT.character.open(); else BT.screen.show('character');
    } });

    root.appendChild(el('div', { class: 'screen-head' }, [
      el('h2', { text: 'Settings' }),
      el('button', { class: 'btn btn-sm stone', type: 'button', text: 'Back', onclick: function () { BT.sfx.click(); BT.screen.show('home'); } })
    ]));
    root.appendChild(el('div', { class: 'panel stack' }, [
      el('div', { class: 'card stack' }, [el('h3', { text: 'Sound' }), soundSwitch, musicSwitch, voiceSwitch]),
      el('div', { class: 'card' }, [el('h3', { text: 'Character' }), editChar]),
      el('div', { class: 'card' }, [
        el('h3', { text: 'Save code' }),
        el('p', { class: 'muted', text: 'Move your game to another iPad: copy the code here, paste it there.' }),
        el('div', { class: 'btn-row', style: { justifyContent: 'flex-start' } }, [showBtn, copyBtn, clearCode]),
        codeBox,
        el('div', { style: { marginTop: '10px' } }, [pasteBox, importBtn])
      ]),
      el('div', { class: 'card' }, [el('h3', { text: 'Reset progress' }), el('p', { class: 'muted', text: 'Erases everything on this device. Copy the save code first if you might want it back.' }), resetInput, resetBtn]),
      el('p', { class: 'muted center', text: 'Boomtown USA ' + BT.version })
    ]));
  }

  BT.settings = {
    render: render,
    open: function () { BT.screen.show('settings'); }
  };
  document.addEventListener('bt:screen', function (e) { if (e.detail.id === 'settings') render(); });

  BT.registerChecks('settings', [
    { name: 'renders sound switch, save code, reset and version', fn: function () {
      render();
      var root = BT.screen.el('settings');
      return !!root.querySelector('.switch') && root.textContent.indexOf('Save code') >= 0 &&
        !!root.querySelector('input[placeholder*="RESET"]') && root.textContent.indexOf(BT.version) >= 0;
    } },
    { name: 'sound switch ignores a pan (pointerdown + pointercancel) and toggles on click', fn: function () {
      render();
      var sw = BT.screen.el('settings').querySelector('.switch'), was = BT.state.settings.sound;
      sw.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); sw.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
      var a = BT.state.settings.sound === was;
      sw.click(); var b = BT.state.settings.sound === !was;
      sw.click(); return a && b && BT.state.settings.sound === was;
    } },
    { name: 'music and voice switches toggle their settings and the modules', fn: function () {
      render();
      var sws = BT.screen.el('settings').querySelectorAll('.switch'), m = BT.state.settings.music, v = BT.state.settings.voice;
      if (sws.length !== 3) return false;
      sws[1].click(); var a = BT.state.settings.music === !m && BT.music.enabled() === !m;
      sws[2].click(); var b = BT.state.settings.voice === !v && BT.voice.enabled() === !v;
      sws[1].click(); sws[2].click();
      return a && b && BT.state.settings.music === m && BT.state.settings.voice === v;
    } },
    { name: 'clear parent code needs a hold: tap does not clear', fn: function () {
      var keep = BT.state.settings.parentCode; BT.state.settings.parentCode = '1234'; render();
      var root = BT.screen.el('settings'), btn = null;
      root.querySelectorAll('button').forEach(function (b) { if (b.textContent.indexOf('clear parent code') >= 0) btn = b; });
      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); btn.click();
      var ok = BT.state.settings.parentCode === '1234';
      BT.state.settings.parentCode = keep; BT.save(); return ok;
    } },
    { name: 'clear parent code: a second finger does not start a second hold timer', fn: function () {
      var keep = BT.state.settings.parentCode; BT.state.settings.parentCode = '1234'; render();
      var root = BT.screen.el('settings'), btn = null;
      root.querySelectorAll('button').forEach(function (b) { if (b.textContent.indexOf('clear parent code') >= 0) btn = b; });
      // BT.test.run is synchronous, so count the timers started instead of waiting for an orphan to fire
      var realSet = window.setTimeout, started = 0;
      window.setTimeout = function () { started++; return realSet.apply(window, arguments); };
      try {
        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2 }));
      } finally { window.setTimeout = realSet; }
      btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
      btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2 }));
      var ok = started === 1 && BT.state.settings.parentCode === '1234';
      BT.state.settings.parentCode = keep; BT.save(); return ok;
    } }
  ]);
})();
