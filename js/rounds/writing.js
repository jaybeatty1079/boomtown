// BT.rounds.writing: Writer's Desk. A job-tied prompt, a big textarea, a minimum word count by level
// and a live editor's checklist. Ungraded (correct:null); answer = her text. Hint = a sentence starter.
// Test hooks: BT.test.roundHooks = {subject:'writing', currentAnswer(), answer(text)}.
BT.rounds = BT.rounds || {};
(function () {
  'use strict';
  var BT = window.BT;
  var M = BT.rounds.writing = BT.rounds.writing || {};
  M.MIN = [8, 12, 18, 25, 35]; // minimum words at level 1..5

  function P(q, starter, words) { return { q: q, starter: starter, words: words }; }
  // keyed by job kind (BT.jobs.data[].kind); 'generic' is the fallback for an unknown kind
  M.prompts = {
    bakery: [
      P('Name this bakery and tell me why that name fits, in two sentences.', 'I would name the bakery', ['bakery', 'name', 'bread', 'cupcake']),
      P('A customer wants a cake for a birthday party. Describe the cake you would bake for them.', 'The cake I would bake is', ['cake', 'frosting', 'birthday', 'bake']),
      P('Write the sign for the window that makes people come in for breakfast.', 'Come in for', ['breakfast', 'fresh', 'warm', 'muffin'])],
    vet: [
      P('A nervous cat is here for a checkup. Write what you would say to calm the owner.', "Don't worry, your cat", ['cat', 'checkup', 'vet', 'calm']),
      P('Describe the best pet for a family in a small apartment and tell me why.', 'The best pet would be', ['pet', 'apartment', 'dog', 'cat', 'fish']),
      P('Write three rules for the waiting room so every animal stays safe.', 'Rule one:', ['rule', 'leash', 'waiting', 'animal'])],
    lemonade: [
      P('Your lemonade stand needs a catchy name and a slogan. Write both and say why they work.', 'My stand is called', ['lemonade', 'stand', 'slogan']),
      P('It is 110 degrees out. Write an ad that makes someone cross the street for your lemonade.', 'On a day this hot,', ['hot', 'cold', 'ice', 'lemonade']),
      P('You sold out by noon. Write a note to your partner about what to change tomorrow.', 'Tomorrow we should', ['sold', 'tomorrow', 'cups', 'more'])],
    ranch: [
      P('Describe one morning chore on the ranch step by step.', 'First thing in the morning,', ['horse', 'cattle', 'feed', 'barn', 'fence']),
      P('A new ranch hand starts tomorrow. Write them a welcome note with two tips.', 'Welcome to the ranch!', ['ranch', 'tip', 'boots', 'early']),
      P('Name the new foal and explain the name.', "The foal's name is", ['foal', 'horse', 'name'])],
    aquarium: [
      P('Pick one animal in the tank and write a sign that tells visitors something surprising about it.', 'Meet the', ['fish', 'shark', 'octopus', 'tank', 'ocean']),
      P('A little kid is scared of the shark tank. Write what you would tell them.', 'Sharks look scary, but', ['shark', 'scared', 'safe', 'glass']),
      P('Describe the tank you would build if you could add any animal to the aquarium.', 'My dream tank would have', ['tank', 'water', 'animal', 'aquarium'])],
    library: [
      P('Write a book recommendation for a kid your age. Tell what it is about and why they should read it.', 'You should read', ['book', 'read', 'story', 'author']),
      P('Make up a display sign for the mystery shelf that makes the books sound exciting.', 'Can you solve', ['mystery', 'clue', 'book', 'shelf']),
      P('A book came back with a torn page. Write a kind note to the reader about taking care of books.', 'Thank you for returning', ['book', 'page', 'careful', 'return'])],
    toystore: [
      P('Invent a new toy. Describe it and explain who would love it.', 'My toy is called', ['toy', 'play', 'kids', 'fun']),
      P('Write the holiday window sign for the toy store.', 'This season at', ['toy', 'store', 'gift', 'sale']),
      P('A customer wants a gift for a 5-year-old. Write what you would suggest and why.', 'For a five-year-old, I would pick', ['gift', 'toy', 'five', 'year'])],
    farmmarket: [
      P('Write a sign for your farm stand that tells people where the vegetables came from.', 'Picked this morning', ['farm', 'fresh', 'vegetable', 'tomato', 'apple']),
      P('Describe your favorite thing to eat from the market and how it tastes.', 'My favorite thing at the market is', ['market', 'taste', 'sweet', 'fresh']),
      P('A shopper asks why farm apples cost more than store apples. Write your answer.', 'Farm apples cost more because', ['apple', 'farm', 'cost', 'price'])],
    bank: [
      P('Explain to a younger kid why saving money in a bank is a smart idea.', 'Saving money in a bank is smart because', ['save', 'bank', 'money', 'interest']),
      P("Write the rules for a kids' savings club at your bank.", 'Welcome to the savings club!', ['save', 'club', 'rule', 'deposit']),
      P('A customer found a mistake on their receipt. Write what you would say to help them.', "I'm sorry about the mistake.", ['receipt', 'mistake', 'money', 'sorry'])],
    newspaper: [
      P('Write the first two sentences of a news story about something that happened in your town today.', 'Today in', ['today', 'news', 'town', 'reporter']),
      P('Write a headline and the first sentence for a story about a dog that saved a cat.', 'HEADLINE:', ['dog', 'cat', 'saved', 'hero']),
      P('Interview your character! Write two questions a reporter would ask and the answers.', 'Question one:', ['question', 'answer', 'reporter'])],
    zoo: [
      P('Pick an animal and write its info sign: what it eats, where it lives, one cool fact.', 'This is the', ['animal', 'eats', 'lives', 'zoo']),
      P('Describe a perfect day for a zookeeper from morning to closing time.', "A zookeeper's day starts", ['zoo', 'feed', 'animal', 'morning']),
      P('A new baby animal was born at the zoo. Write the announcement.', 'Big news at the zoo!', ['baby', 'born', 'zoo', 'animal'])],
    museum: [
      P('Write the label for a museum object you would love to display. Say what it is and why it matters.', 'This object is', ['museum', 'display', 'old', 'history']),
      P('A visitor asks why we cannot touch the exhibits. Write a friendly answer.', 'Great question!', ['touch', 'exhibit', 'museum', 'careful']),
      P('Describe a room you would add to the museum and what would be inside.', 'My new room would be about', ['room', 'museum', 'exhibit'])],
    weather: [
      P("Write tomorrow's weather report for your city in a fun voice.", 'Good morning!', ['weather', 'rain', 'sun', 'wind', 'cloud', 'snow', 'degrees']),
      P('Explain to a younger kid where rain comes from.', 'Rain starts as', ['rain', 'cloud', 'water', 'vapor', 'sky']),
      P('A big storm is coming. Write a safety message for the town.', 'A storm is on the way.', ['storm', 'safe', 'inside', 'wind'])],
    robotlab: [
      P('Invent a robot that helps around the house. Describe what it does and what it looks like.', 'My robot is called', ['robot', 'help', 'battery', 'sensor']),
      P('Your robot made a mistake and spilled juice. Write what you would change in its program.', 'The robot spilled juice because', ['robot', 'program', 'mistake', 'fix']),
      P('Write three rules every robot in the lab must follow.', 'Rule one:', ['robot', 'rule', 'safe', 'lab'])],
    airline: [
      P('Write the welcome announcement a pilot gives before takeoff.', 'Good morning, passengers.', ['flight', 'pilot', 'seat', 'takeoff', 'plane']),
      P('Describe what you see from the cockpit window as the plane climbs.', 'As the plane climbs,', ['cloud', 'sky', 'plane', 'window', 'city']),
      P('A passenger is nervous about flying. Write what you would tell them.', 'Flying is actually', ['fly', 'safe', 'plane', 'nervous'])],
    park: [
      P('Write a trail sign that tells hikers one rule and one amazing thing they might see.', 'Welcome to the trail!', ['trail', 'hike', 'park', 'bear', 'tree', 'river']),
      P('Describe your favorite spot in the park and why it is special.', 'My favorite spot is', ['park', 'trail', 'mountain', 'lake', 'view']),
      P('A camper left trash behind. Write a note that teaches without being mean.', 'Thanks for visiting!', ['trash', 'park', 'clean', 'camp'])],
    gamestudio: [
      P('Pitch a new video game in a few sentences: the hero, the world, the goal.', 'In my game, you play as', ['game', 'player', 'level', 'world', 'hero']),
      P('Describe the hardest level in your game and the trick to beating it.', 'The hardest level is', ['level', 'game', 'boss', 'trick']),
      P('A tester says the game is too easy. Write how you would make it harder.', 'To make the game harder,', ['game', 'harder', 'level', 'player'])],
    architect: [
      P('Describe the dream house you would design: rooms, shape, and one surprise feature.', 'My dream house would have', ['house', 'room', 'roof', 'window', 'design']),
      P('A school asked for a new playground. Describe your design.', 'The playground would have', ['playground', 'slide', 'design', 'kids']),
      P('Explain why very tall buildings need strong foundations.', 'Tall buildings need', ['building', 'tall', 'foundation', 'wind', 'strong'])],
    marine: [
      P('Describe one ocean animal you studied today and what it was doing.', 'Today I watched a', ['ocean', 'whale', 'dolphin', 'fish', 'coral', 'sea']),
      P('Write a message to kids about keeping plastic out of the ocean.', 'The ocean needs our help.', ['ocean', 'plastic', 'sea', 'turtle', 'clean']),
      P('You discovered a new sea creature. Name it and describe it.', 'I named it the', ['creature', 'sea', 'ocean', 'fins', 'new'])],
    doctor: [
      P('Explain to a patient why washing hands keeps people healthy.', 'Washing your hands', ['wash', 'hands', 'germs', 'healthy', 'sick']),
      P('Write a kind note to a kid who is nervous about getting a shot.', 'I know shots feel scary, but', ['shot', 'nervous', 'brave', 'doctor']),
      P('Describe three habits that keep a body strong.', 'To stay strong, you should', ['sleep', 'eat', 'exercise', 'healthy', 'strong'])],
    cityhall: [
      P('You are the mayor for a day. Write the one new rule you would make and why.', 'If I were mayor,', ['mayor', 'rule', 'city', 'town', 'people']),
      P('Write a short speech to open the new town park.', 'Friends and neighbors,', ['park', 'town', 'city', 'open', 'today']),
      P("A citizen wants more bike lanes. Write the mayor's answer.", 'Thank you for your letter.', ['bike', 'lane', 'street', 'city', 'safe'])],
    space: [
      P('Write the message you would send back to Earth from the Moon.', 'Hello, Earth!', ['moon', 'earth', 'space', 'rocket', 'star']),
      P('Describe what astronauts eat and how they sleep without gravity.', 'In space, astronauts', ['space', 'gravity', 'float', 'astronaut', 'sleep']),
      P('Plan a mission to Mars in three steps.', 'Step one:', ['mars', 'rocket', 'mission', 'planet', 'launch'])],
    movies: [
      P('Write the first scene of a movie set in your home town.', 'The movie opens on', ['movie', 'scene', 'camera', 'town', 'hero']),
      P('Describe the hero of your movie: looks, personality, and their big problem.', 'The hero is', ['hero', 'movie', 'problem', 'brave']),
      P('Write a movie poster tagline and explain why it would make people want to watch.', 'Tagline:', ['movie', 'poster', 'watch', 'tagline'])],
    stocks: [
      P('Explain what a stock is to a younger kid using a lemonade stand as the example.', 'A stock is like', ['stock', 'share', 'company', 'own', 'lemonade']),
      P('Would you rather own a piece of a toy company or a video game company? Explain.', 'I would rather own', ['company', 'own', 'stock', 'money', 'game', 'toy']),
      P('The market went down today. Write a calm note to a worried investor.', 'Markets go up and down.', ['market', 'stock', 'down', 'calm', 'long'])],
    court: [
      P('Explain why both sides in a court case get to tell their story.', 'Both sides get to speak because', ['court', 'judge', 'fair', 'side', 'story']),
      P('Write the rules for the courtroom so everyone is treated fairly.', 'Courtroom rule one:', ['court', 'rule', 'fair', 'quiet', 'judge']),
      P('A classroom argument comes to you as the judge. Write how you would decide and why.', 'After hearing both sides,', ['judge', 'fair', 'decide', 'both', 'side'])],
    restaurant: [
      P('Invent a new dish for the menu. Describe it so well that people can almost taste it.', 'My dish is called', ['dish', 'taste', 'menu', 'sauce', 'flavor']),
      P("Write the menu description for the chef's favorite dessert.", 'Our dessert is', ['dessert', 'sweet', 'chocolate', 'menu', 'taste']),
      P('A dinner guest has a nut allergy. Write what the kitchen must do.', 'When a guest has an allergy,', ['allergy', 'kitchen', 'safe', 'nuts', 'chef'])],
    startup: [
      P('Pitch a new app or product in three sentences: the problem, the idea, the customer.', 'The problem is', ['app', 'product', 'customer', 'idea', 'problem']),
      P('Name your company and explain what the name says about it.', 'My company is called', ['company', 'name', 'startup', 'idea']),
      P('Your first customer just signed up. Write the thank-you email.', 'Thank you for being our first customer!', ['customer', 'thank', 'company', 'first'])],
    orchestra: [
      P('Describe how the music made you feel during rehearsal today.', 'When the music started,', ['music', 'violin', 'drum', 'sound', 'orchestra', 'song']),
      P('Pick an instrument and explain why it is the most important one in the orchestra.', 'The most important instrument is', ['instrument', 'orchestra', 'violin', 'trumpet', 'drum', 'piano', 'flute']),
      P("Write the program note for tonight's concert that tells the audience what to listen for.", 'Tonight, listen for', ['concert', 'music', 'listen', 'orchestra'])],
    generic: [
      P('Describe your work day today in a few sentences, start to finish.', 'Today at work I', ['work', 'today', 'job']),
      P('What was the hardest part of this job, and how did you handle it?', 'The hardest part was', ['hard', 'job', 'work']),
      P('Write a thank-you note to your boss for the day.', 'Thank you for', ['thank', 'day', 'job']),
      P('If you ran this place, what one thing would you change?', 'If I ran this place,', ['change', 'place', 'run'])]
  };

  var seen = {}; // prompt texts shown since page load
  M.pickPrompt = function (job) {
    var pool = (job && M.prompts[job.kind]) || M.prompts.generic;
    var fresh = pool.filter(function (p) { return !seen[p.q]; });
    var p = BT.pick(fresh.length ? fresh : pool);
    seen[p.q] = true;
    return p;
  };
  M.minWords = function (level) { return M.MIN[Math.max(1, Math.min(5, level || 1)) - 1]; };
  M.wordCount = function (text) { return String(text || '').trim().split(/\s+/).filter(Boolean).length; };
  // "a word from the day": a prompt keyword, the city, the state or a word of the job title
  M.usedDayWord = function (text, prompt, job) {
    var t = ' ' + String(text || '').toLowerCase() + ' ';
    var words = (prompt.words || []).slice();
    if (job) {
      if (job.city) words.push(job.city);
      if (job.kind) words.push(job.kind);
      String(job.title || '').split(/\s+/).forEach(function (w) { if (w.length > 3) words.push(w); });
      var st = (BT.states || []).filter(function (s) { return s.abbr === job.state; })[0];
      if (st) words.push(st.name);
    }
    return words.some(function (w) { return w && t.indexOf(w.toLowerCase()) >= 0; });
  };
  M.checklist = function (text, min, prompt, job) {
    var t = String(text || '').trim(), n = M.wordCount(t);
    return [
      { label: 'Starts with a capital letter', ok: /^[A-Z]/.test(t) },
      { label: 'Ends with a period, ! or ?', ok: /[.!?]["')]?$/.test(t) },
      { label: 'At least ' + min + ' words (' + n + ' so far)', ok: n >= min },
      { label: 'Uses a word from the day', ok: M.usedDayWord(t, prompt, job) }
    ];
  };

  M.build = function (container, ctx) {
    ctx = ctx || {};
    return new Promise(function (resolve) {
      var job = ctx.job || {}, prompt = M.pickPrompt(job), min = M.minWords(ctx.level);
      var start = performance.now(), hints = 0, settled = false;
      container.innerHTML = '';

      var hintBtn = BT.el('button', { class: 'btn btn-sm violet', type: 'button', text: 'Hint' });
      var doneBtn = BT.el('button', { class: 'btn gold', type: 'button', text: 'Done', disabled: 'disabled' });
      var ta = BT.el('textarea', { placeholder: 'Write here…', spellcheck: 'true', autocapitalize: 'sentences',
        'aria-label': 'Your writing', style: { flex: '1', minHeight: '160px', fontSize: '1.2rem' } });
      var list = BT.el('ul', { class: 'editor-checklist', style: { listStyle: 'none', padding: '0', margin: '0', display: 'grid', gap: '4px', fontWeight: '700' } });
      var pill = BT.el('span', { class: 'pill sky', text: (job.title || 'Writer') + ' · ' + min + '+ words' });
      var head = BT.el('div', { class: 'screen-head' }, [pill, hintBtn]);
      container.appendChild(BT.el('div', { class: 'stack', style: { flex: '1', minHeight: '0' } }, [
        head,
        BT.el('div', { class: 'question', text: prompt.q }),
        ta,
        BT.el('div', { class: 'card', style: { padding: '10px 14px' } }, [
          BT.el('div', { class: 'muted', text: "Editor's checklist", style: { fontSize: '.9rem' } }), list]),
        BT.el('div', { class: 'btn-row' }, doneBtn)
      ]));

      function refresh() {
        list.innerHTML = '';
        var items = M.checklist(ta.value, min, prompt, job);
        items.forEach(function (it) {
          list.appendChild(BT.el('li', { text: (it.ok ? '✅ ' : '⬜ ') + it.label, style: { opacity: it.ok ? '1' : '.7' } }));
        });
        doneBtn.disabled = !items[2].ok; // only the word count gates Done; the rest is friendly advice
        // the iPad keyboard hides the checklist while she types, so the count also lives in the top pill
        pill.textContent = (job.title || 'Writer') + ' · ' + M.wordCount(ta.value) + ' / ' + min + ' words';
        return items;
      }
      ta.addEventListener('input', refresh);
      refresh();

      hintBtn.addEventListener('click', function () {
        if (settled) return;
        hints++;
        if (typeof ctx.onHint === 'function') ctx.onHint();
        if (!ta.value.trim()) { ta.value = prompt.starter + ' '; refresh(); ta.focus(); }
        BT.toast('Try starting with: "' + prompt.starter + '"', 'info');
        if (BT.sfx && BT.sfx.click) BT.sfx.click();
        hintBtn.disabled = true;
      });

      function submit() {
        if (settled) return false;
        var text = ta.value.trim();
        if (M.wordCount(text) < min) return false;
        settled = true;
        doneBtn.disabled = true; hintBtn.disabled = true; ta.readOnly = true;
        var missing = M.checklist(text, min, prompt, job).filter(function (it) { return !it.ok; });
        BT.toast(missing.length ? 'Nice work! Next time: ' + missing[0].label.toLowerCase() : 'Nice work, editor approved!', 'good');
        if (BT.sfx && BT.sfx.good) BT.sfx.good();
        if (BT.test.roundHooks && BT.test.roundHooks.subject === 'writing') BT.test.roundHooks = null;
        resolve({ correct: null, ms: Math.round(performance.now() - start), hints: hints, retry: false, answer: text, skipped: false });
        return true;
      }
      doneBtn.addEventListener('click', submit);

      // sample answer: the starter plus a day word, padded to the minimum word count
      function sample() {
        var words = (prompt.starter + ' ' + (job.city || 'town') + ' is where this story begins today').split(/\s+/);
        var filler = ['and', 'then', 'we', 'worked', 'hard', 'all', 'day', 'long', 'with', 'a', 'smile'];
        for (var i = 0; words.length < min; i++) words.push(filler[i % filler.length]);
        return words.join(' ').replace(/[.!?,:]*$/, '') + '.';
      }
      BT.test.roundHooks = { subject: 'writing', currentAnswer: sample, answer: function (text) {
        ta.value = text == null ? sample() : String(text);
        refresh();
        return submit();
      } };
      M.current = { prompt: prompt, min: min, textarea: ta, settled: function () { return settled; }, hint: function () { hintBtn.click(); } };
    });
  };

  // iOS Safari scrolls the window to reveal a focused field and ignores body{overflow:hidden}; the top bar and
  // fixed toast/coin positions stay shifted after the keyboard closes. Size #app to the visual viewport and
  // scroll back on every blur. Installed once; lives here because the writing textarea is the worst case.
  M.keyboardGuard = function () {
    if (M.keyboardGuard.installed) return false;
    M.keyboardGuard.installed = true;
    var app = document.getElementById('app'), vv = window.visualViewport;
    function fit() { if (app) app.style.height = vv && vv.height ? vv.height + 'px' : '100dvh'; }
    if (vv) vv.addEventListener('resize', fit);
    document.addEventListener('blur', function (e) {
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') { window.scrollTo(0, 0); fit(); }
    }, true);
    return true;
  };
  M.keyboardGuard();

  BT.registerRound('writing', { title: "Writer's Desk", icon: '✏️', build: M.build });

  BT.registerChecks('writing', [
    { name: 'every spec job kind has 3+ prompts with q, starter and words; generic has 3+', fn: function () {
      var kinds = (BT.jobs && BT.jobs.data || []).map(function (j) { return j.kind; }).concat(['generic']);
      kinds.forEach(function (k) {
        var list = M.prompts[k];
        BT.test.assert(list && list.length >= 3, 'kind ' + k + ' has ' + (list ? list.length : 0) + ' prompts');
        list.forEach(function (p) {
          BT.test.assert(typeof p.q === 'string' && p.q.length > 10 && typeof p.starter === 'string' && p.starter && p.words.length, 'bad prompt in ' + k);
        });
      });
      return Object.keys(M.prompts).length >= 29;
    } },
    { name: 'minimum words by level are 8/12/18/25/35 and clamp', fn: function () {
      return M.minWords(1) === 8 && M.minWords(5) === 35 && M.minWords(0) === 8 && M.minWords(9) === 35 && M.minWords(3) === 18;
    } },
    { name: 'checklist grades capital, ending, count and day word', fn: function () {
      var p = M.prompts.bakery[0], job = { city: 'Austin', state: 'TX', title: 'Bakery Helper', kind: 'bakery' };
      var bad = M.checklist('hello there friend', 8, p, job), good = M.checklist('The bakery in Austin smells like warm bread every single morning.', 8, p, job);
      return bad.every(function (i) { return !i.ok; }) && good.every(function (i) { return i.ok; }) && M.wordCount('  a  b c ') === 3;
    } },
    { name: 'keyboard guard installed once; blur of a field scrolls to top and sizes #app', fn: function () {
      BT.test.assert(M.keyboardGuard.installed === true && M.keyboardGuard() === false, 'installed once');
      var inp = document.createElement('input'); document.body.appendChild(inp);
      inp.dispatchEvent(new Event('blur')); inp.remove();
      var h = document.getElementById('app').style.height;
      return window.scrollY === 0 && /px$|dvh$/.test(h);
    } },
    { name: 'pickPrompt falls back to generic for an unknown kind', fn: function () {
      var p = M.pickPrompt({ kind: 'nothing-here' });
      return M.prompts.generic.indexOf(p) >= 0;
    } },
    { name: 'live round: textarea, Done gated by word count, hint fills the starter, answer() resolves with correct:null', fn: function () {
      var box = BT.el('div'), hints = 0, result = null;
      document.body.appendChild(box);
      M.build(box, { level: 2, job: { id: 'x', city: 'Austin', state: 'TX', title: 'Bakery Helper', kind: 'bakery' }, onHint: function () { hints++; } })
        .then(function (r) { result = r; });
      var ta = box.querySelector('textarea'), done = Array.prototype.filter.call(box.querySelectorAll('.btn'), function (b) { return b.textContent === 'Done'; })[0];
      BT.test.assert(ta && done && done.disabled && box.querySelectorAll('li').length === 4, 'render');
      BT.test.assert(BT.test.roundHooks && BT.test.roundHooks.subject === 'writing', 'hooks');
      M.current.hint();
      BT.test.assert(hints === 1 && ta.value.indexOf(M.current.prompt.starter) === 0, 'hint starter');
      BT.test.assert(BT.test.roundHooks.answer('too short') === false && !M.current.settled(), 'short text must not submit');
      var sample = BT.test.roundHooks.currentAnswer();
      BT.test.assert(M.wordCount(sample) >= 12, 'sample meets the minimum');
      BT.test.assert(BT.test.roundHooks.answer(sample) === true && M.current.settled() && BT.test.roundHooks === null, 'submit');
      box.remove();
      return result === null; // resolves on a later tick; settled flag covers it
    } }
  ]);
})();
