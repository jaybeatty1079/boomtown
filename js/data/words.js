// BT.data.words: the word bank for BT.rounds.words. 200 items, levels 1-5.
// Item: {id, level, kind, q, options:[4 strings, correct first], answer, why}
// kinds: context | synonym | antonym | spelling | affix | analogy (L3+) | root (L4+)
// The round shuffles options; `answer` is the correct option's text.
BT.data = BT.data || {};
(function () {
  'use strict';
  var items = [];
  function add(level, kind, q, correct, wrongs, why) {
    items.push({ id: 'w' + level + '-' + (items.length + 1), level: level, kind: kind, q: q,
      options: [correct].concat(wrongs), answer: correct, why: why });
  }
  // sentence has the target word between asterisks; the round renders it bold
  function ctx(l, sentence, word, correct, wrongs, why) {
    add(l, 'context', sentence + ' What does "' + word + '" mean here?', correct, wrongs, why);
  }
  function syn(l, word, correct, wrongs, why) {
    add(l, 'synonym', 'Which word means almost the same as "' + word + '"?', correct, wrongs,
      why || '"' + word + '" and "' + correct + '" mean about the same thing.');
  }
  function ant(l, word, correct, wrongs, why) {
    add(l, 'antonym', 'Which word means the opposite of "' + word + '"?', correct, wrongs,
      why || '"' + correct + '" is the opposite of "' + word + '".');
  }
  function spell(l, correct, wrongs, tip) {
    add(l, 'spelling', 'Which word is spelled correctly?', correct, wrongs,
      'The correct spelling is "' + correct + '".' + (tip ? ' ' + tip : ''));
  }
  function affix(l, word, part, correct, wrongs, why) {
    add(l, 'affix', 'In the word "' + word + '", what does "' + part + '" mean?', correct, wrongs, why);
  }
  function root(l, origin, rt, examples, correct, wrongs, why) {
    add(l, 'root', 'The ' + origin + ' root "' + rt + '" (as in ' + examples + ') means:', correct, wrongs, why);
  }
  function ana(l, a, b, c, correct, wrongs, why) {
    add(l, 'analogy', a + ' is to ' + b + ' as ' + c + ' is to:', correct, wrongs, why);
  }

  // ---------- LEVEL 1: solid 4th grade ----------
  ctx(1, 'The tired puppy was *drowsy* after a long walk.', 'drowsy', 'sleepy', ['hungry', 'angry', 'loud'], 'Drowsy means sleepy. The puppy was tired after the walk.');
  ctx(1, 'The baker kept the shop *tidy*, with every pan in its place.', 'tidy', 'neat', ['dirty', 'busy', 'cold'], 'Tidy means neat. Every pan in its place is a clue.');
  ctx(1, 'The vet gave the kitten a *gentle* pat.', 'gentle', 'soft and careful', ['quick', 'rough', 'loud'], 'Gentle means soft and careful, the way you touch a small animal.');
  ctx(1, 'The ranch hand ate an *enormous* breakfast after feeding the cows.', 'enormous', 'very large', ['tiny', 'cold', 'late'], 'Enormous means very large. Hard work makes you hungry.');
  ctx(1, 'Rain made the trail *slippery*, so we walked slowly.', 'slippery', 'easy to slide on', ['dry', 'steep', 'long'], 'Slippery means easy to slide on. That is why they walked slowly.');
  ctx(1, 'The librarian spoke in a *hushed* voice.', 'hushed', 'quiet', ['angry', 'silly', 'fast'], 'Hushed means quiet, like a whisper in a library.');
  ctx(1, 'The toy store was *crowded* on sale day.', 'crowded', 'full of people', ['empty', 'closed', 'dark'], 'Crowded means full of people. A sale brings in a crowd.');
  syn(1, 'happy', 'glad', ['sad', 'tired', 'slow']);
  syn(1, 'big', 'huge', ['small', 'thin', 'quick']);
  syn(1, 'fast', 'quick', ['slow', 'heavy', 'sleepy']);
  syn(1, 'begin', 'start', ['stop', 'finish', 'wait']);
  syn(1, 'brave', 'fearless', ['scared', 'shy', 'silly']);
  syn(1, 'shout', 'yell', ['whisper', 'listen', 'hum']);
  syn(1, 'tiny', 'little', ['giant', 'wide', 'tall']);
  ant(1, 'hot', 'cold', ['warm', 'wet', 'bright']);
  ant(1, 'empty', 'full', ['open', 'small', 'clean']);
  ant(1, 'quiet', 'noisy', ['calm', 'soft', 'still']);
  ant(1, 'ancient', 'modern', ['old', 'broken', 'tiny'], 'Ancient means very old; modern means new or of today.');
  ant(1, 'cheap', 'expensive', ['free', 'low', 'small']);
  ant(1, 'give', 'take', ['share', 'hand', 'lend']);
  ant(1, 'rough', 'smooth', ['hard', 'bumpy', 'sharp']);
  spell(1, 'friend', ['freind', 'frend', 'frind'], 'Remember: a friend is there to the end.');
  spell(1, 'because', ['becuase', 'becase', 'beacuse'], 'Big Elephants Can Always Understand Small Elephants.');
  spell(1, 'beautiful', ['beautifull', 'butiful', 'beutiful'], 'Beautiful starts with "beau" and ends with one l.');
  spell(1, 'different', ['diffrent', 'diferent', 'differant'], 'Two f’s, and the ending is -ent.');
  spell(1, 'favorite', ['favrite', 'favorit', 'faverite'], 'Favor + ite.');
  spell(1, 'Wednesday', ['Wensday', 'Wendsday', 'Wednesdey'], 'Think "Wed-nes-day" to hear the silent d.');
  spell(1, 'enough', ['enuf', 'enogh', 'enouf'], 'The "f" sound at the end is spelled -gh.');
  affix(1, 'unhappy', 'un-', 'not', ['again', 'very', 'before'], 'The prefix un- means not, so unhappy means not happy.');
  affix(1, 'rewrite', 're-', 'again', ['not', 'under', 'after'], 'The prefix re- means again, so rewrite means write again.');
  affix(1, 'hopeful', '-ful', 'full of', ['without', 'one who', 'able to'], 'The suffix -ful means full of, so hopeful means full of hope.');
  affix(1, 'careless', '-less', 'without', ['full of', 'more', 'again'], 'The suffix -less means without, so careless means without care.');
  affix(1, 'teacher', '-er', 'a person who', ['the most', 'again', 'without'], 'The suffix -er can mean a person who does something: a teacher teaches.');
  affix(1, 'preheat', 'pre-', 'before', ['after', 'not', 'again'], 'The prefix pre- means before, so you preheat the oven before baking.');

  // ---------- LEVEL 2: strong 4th / early 5th ----------
  ctx(2, 'The pilot stayed *calm* even when the plane bounced in the wind.', 'calm', 'steady and relaxed', ['scared', 'sleepy', 'loud'], 'Calm means steady and relaxed, even when things get bumpy.');
  ctx(2, 'Tickets were *scarce*, so we got to the stadium early.', 'scarce', 'hard to find', ['cheap', 'colorful', 'heavy'], 'Scarce means there are not many. Getting there early helps you grab one.');
  ctx(2, 'The chef *garnished* the plate with a sprig of parsley.', 'garnished', 'decorated', ['washed', 'dropped', 'cooked'], 'To garnish is to decorate food, often with a bit of green.');
  ctx(2, 'After the storm, the river was *murky* and brown.', 'murky', 'cloudy and hard to see through', ['clear', 'cold', 'shallow'], 'Murky water is cloudy; brown is the clue.');
  ctx(2, 'The reporter asked *precise* questions and wrote down every answer.', 'precise', 'exact', ['silly', 'long', 'loud'], 'Precise means exact, with nothing fuzzy about it.');
  ctx(2, 'The zoo keeper was *cautious* near the lion’s gate.', 'cautious', 'careful', ['sleepy', 'cheerful', 'late'], 'Cautious means careful. You would be careful near a lion too.');
  ctx(2, 'The museum’s oldest *artifact* is a clay pot from 2,000 years ago.', 'artifact', 'an object made by people long ago', ['a painting', 'a machine', 'an animal'], 'An artifact is an object people made in the past, like an old clay pot.');
  ctx(2, 'The bank teller counted the bills *swiftly*.', 'swiftly', 'quickly', ['slowly', 'loudly', 'sadly'], 'Swift means fast, so swiftly means quickly.');
  syn(2, 'ancient', 'very old', ['new', 'broken', 'tiny']);
  syn(2, 'assist', 'help', ['stop', 'bother', 'ignore']);
  syn(2, 'furious', 'very angry', ['pleased', 'tired', 'curious']);
  syn(2, 'fragile', 'easily broken', ['strong', 'heavy', 'soft']);
  syn(2, 'vanish', 'disappear', ['appear', 'shout', 'grow']);
  syn(2, 'enormous', 'gigantic', ['tiny', 'narrow', 'quiet']);
  syn(2, 'demand', 'insist', ['ask politely', 'refuse', 'whisper']);
  ant(2, 'generous', 'selfish', ['kind', 'rich', 'busy']);
  ant(2, 'arrive', 'depart', ['stay', 'enter', 'land']);
  ant(2, 'shallow', 'deep', ['wet', 'wide', 'cold']);
  ant(2, 'victory', 'defeat', ['game', 'prize', 'battle']);
  ant(2, 'include', 'exclude', ['add', 'count', 'join']);
  ant(2, 'rare', 'common', ['special', 'odd', 'expensive']);
  ant(2, 'humble', 'proud', ['shy', 'poor', 'quiet']);
  spell(2, 'receive', ['recieve', 'receve', 'reciev'], 'I before e, except after c.');
  spell(2, 'separate', ['seperate', 'seprate', 'separete'], 'There is "a rat" in separate.');
  spell(2, 'necessary', ['neccessary', 'necesary', 'nessesary'], 'One collar, two sleeves: one c, two s’s.');
  spell(2, 'library', ['libary', 'liberry', 'librery'], 'Say all three parts: li-brar-y.');
  spell(2, 'believe', ['beleive', 'belive', 'beleave'], 'Never believe a lie: the word "lie" is inside it.');
  spell(2, 'tomorrow', ['tommorow', 'tomorow', 'tommorrow'], 'One m, two r’s.');
  spell(2, 'surprise', ['suprise', 'surprize', 'serprise'], 'Two r’s: sur-prise.');
  affix(2, 'disagree', 'dis-', 'not or the opposite of', ['again', 'before', 'very'], 'The prefix dis- means not, so disagree means not agree.');
  affix(2, 'misspell', 'mis-', 'wrongly', ['again', 'not', 'after'], 'The prefix mis- means wrongly, so misspell means spell wrongly.');
  affix(2, 'colorless', '-less', 'without', ['full of', 'more', 'again'], 'The suffix -less means without, so colorless means without color.');
  affix(2, 'slowly', '-ly', 'in a certain way', ['a person who', 'again', 'before'], 'The suffix -ly tells how something is done: slowly means in a slow way.');
  affix(2, 'bicycle', 'bi-', 'two', ['three', 'one', 'many'], 'The prefix bi- means two. A bicycle has two wheels.');
  affix(2, 'kindness', '-ness', 'a state of being', ['a person who', 'again', 'before'], 'The suffix -ness turns kind into a thing: the state of being kind.');
  affix(2, 'readable', '-able', 'can be', ['not', 'again', 'one who'], 'The suffix -able means can be, so readable means can be read.');

  // ---------- LEVEL 3: 5th / 6th grade, analogies begin ----------
  ctx(3, 'The startup founder gave a *persuasive* pitch, and three investors said yes.', 'persuasive', 'convincing', ['boring', 'short', 'angry'], 'Persuasive means convincing. Three yeses show the pitch worked.');
  ctx(3, 'The architect’s plan was *ambitious*: a tower taller than any in the city.', 'ambitious', 'aiming very high', ['simple', 'cheap', 'old'], 'Ambitious means aiming high, like the tallest tower in town.');
  ctx(3, 'The marine biologist kept *meticulous* notes on every dolphin she saw.', 'meticulous', 'very careful and exact', ['messy', 'short', 'quick'], 'Meticulous means extremely careful about details.');
  ctx(3, 'The judge’s clerk stayed *impartial* and treated both sides the same.', 'impartial', 'fair and not taking sides', ['angry', 'late', 'nervous'], 'Impartial means not favoring either side.');
  ctx(3, 'The weather station sent an *urgent* warning before the hurricane.', 'urgent', 'needing action right away', ['calm', 'funny', 'late'], 'Urgent means it cannot wait. A hurricane warning has to go out fast.');
  ctx(3, 'The game studio *collaborated* with an artist to draw the levels.', 'collaborated', 'worked together', ['argued', 'competed', 'paid'], 'Collaborate means work together (co- means with, labor means work).');
  ctx(3, 'The mayor’s speech was so *tedious* that people checked their watches.', 'tedious', 'long and boring', ['exciting', 'short', 'loud'], 'Tedious means boring and dragging on. Watch-checking is the clue.');
  ctx(3, 'The ranger said the trail was *hazardous* after the rockslide.', 'hazardous', 'dangerous', ['beautiful', 'closed', 'short'], 'A hazard is a danger, so hazardous means dangerous.');
  syn(3, 'reluctant', 'unwilling', ['eager', 'happy', 'quick']);
  syn(3, 'abundant', 'plentiful', ['scarce', 'tiny', 'empty']);
  syn(3, 'diligent', 'hardworking', ['lazy', 'clever', 'late']);
  syn(3, 'conceal', 'hide', ['reveal', 'carry', 'break']);
  syn(3, 'essential', 'necessary', ['extra', 'small', 'simple']);
  syn(3, 'hostile', 'unfriendly', ['welcoming', 'quiet', 'busy']);
  ant(3, 'expand', 'shrink', ['grow', 'stretch', 'open']);
  ant(3, 'temporary', 'permanent', ['brief', 'quick', 'recent']);
  ant(3, 'optimistic', 'pessimistic', ['hopeful', 'cheerful', 'sure'], 'An optimist expects the best; a pessimist expects the worst.');
  ant(3, 'flexible', 'rigid', ['bendy', 'soft', 'loose']);
  ant(3, 'scarce', 'plentiful', ['rare', 'few', 'small']);
  ant(3, 'accurate', 'mistaken', ['exact', 'careful', 'true']);
  spell(3, 'definitely', ['definately', 'definitly', 'definetly'], 'There is "finite" inside definitely.');
  spell(3, 'restaurant', ['restaraunt', 'resturant', 'restarant'], 'Rest-au-rant.');
  spell(3, 'government', ['goverment', 'govermant', 'governmant'], 'Govern + ment: keep the n.');
  spell(3, 'occasion', ['ocassion', 'occassion', 'ocasion'], 'Two c’s, one s.');
  spell(3, 'experience', ['experiance', 'expierence', 'experence'], 'Ends in -ence.');
  spell(3, 'environment', ['enviroment', 'envirnment', 'enviornment'], 'There is "iron" in environment.');
  spell(3, 'calendar', ['calender', 'calandar', 'calandur'], 'Ends in -ar, like the "ar" in year.');
  affix(3, 'international', 'inter-', 'between', ['inside', 'against', 'after'], 'Inter- means between, so international means between nations.');
  affix(3, 'submarine', 'sub-', 'under', ['over', 'before', 'again'], 'Sub- means under; marine means sea. A submarine goes under the sea.');
  affix(3, 'artist', '-ist', 'a person who does something', ['without', 'full of', 'the most'], 'The suffix -ist names a person: an artist makes art.');
  affix(3, 'nonfiction', 'non-', 'not', ['very', 'again', 'before'], 'Non- means not, so nonfiction is writing that is not made up.');
  affix(3, 'transport', 'trans-', 'across', ['under', 'back', 'one'], 'Trans- means across; port means carry. Transport is carrying across.');
  ana(3, 'Puppy', 'dog', 'kitten', 'cat', ['mouse', 'bird', 'cow'], 'A puppy is a young dog, and a kitten is a young cat.');
  ana(3, 'Baker', 'bread', 'carpenter', 'furniture', ['flour', 'hammer', 'paint'], 'A baker makes bread; a carpenter makes furniture. Both are maker-to-product.');
  ana(3, 'Hot', 'cold', 'fast', 'slow', ['quick', 'warm', 'speedy'], 'Hot and cold are opposites, so the answer must be the opposite of fast.');
  ana(3, 'Pilot', 'airplane', 'captain', 'ship', ['wing', 'sky', 'runway'], 'A pilot steers an airplane; a captain steers a ship.');
  ana(3, 'Pen', 'write', 'scissors', 'cut', ['paper', 'sharp', 'glue'], 'A pen is used to write; scissors are used to cut. Tool-to-job.');
  ana(3, 'Dollar', 'money', 'inch', 'length', ['ruler', 'foot', 'coin'], 'A dollar is a unit of money; an inch is a unit of length.');
  ana(3, 'Author', 'book', 'composer', 'music', ['piano', 'stage', 'singer'], 'An author creates books; a composer creates music.');
  ana(3, 'Austin', 'Texas', 'Denver', 'Colorado', ['Montana', 'Utah', 'Dallas'], 'Austin is the capital of Texas; Denver is the capital of Colorado.');

  // ---------- LEVEL 4: 6th / 7th grade, roots begin ----------
  ctx(4, 'The stock trader was *prudent*: she never risked more than she could afford to lose.', 'prudent', 'careful and wise', ['reckless', 'wealthy', 'fast'], 'Prudent means careful and sensible, especially with money.');
  ctx(4, 'The conductor demanded *precision* from every musician in the orchestra.', 'precision', 'exactness', ['volume', 'speed', 'silence'], 'Precision is exactness: every note exactly right.');
  ctx(4, 'The space center *postponed* the launch when storm clouds rolled in.', 'postponed', 'put off until later', ['canceled', 'sped up', 'watched'], 'Postpone means delay to a later time (post- means after).');
  ctx(4, 'The doctor’s *diagnosis* was a sprained ankle, not a break.', 'diagnosis', 'finding out what is wrong', ['a cure', 'a bill', 'a bandage'], 'A diagnosis is the doctor’s finding of what the problem is.');
  ctx(4, 'The movie studio built an *elaborate* set with a whole fake street.', 'elaborate', 'detailed and complex', ['cheap', 'tiny', 'plain'], 'Elaborate means full of detail. A whole fake street is elaborate.');
  ctx(4, 'The founder’s idea was *innovative*: nobody had sold lemonade by drone before.', 'innovative', 'new and original', ['old', 'costly', 'silly'], 'Innovative means new and inventive (nov means new).');
  ctx(4, 'Many Americans *migrated* west in 1849 hoping to find gold.', 'migrated', 'moved from one place to another', ['stayed home', 'dug', 'sold goods'], 'To migrate is to move to a new place to live.');
  ctx(4, 'The judge found the witness *credible*, so her story was believed.', 'credible', 'believable', ['funny', 'loud', 'late'], 'Credible means believable (cred means believe).');
  syn(4, 'benevolent', 'kind', ['cruel', 'rich', 'quiet'], 'Benevolent means kind and wishing good for others (bene means good).');
  syn(4, 'candid', 'honest', ['shy', 'secret', 'rude']);
  syn(4, 'lucrative', 'profitable', ['costly', 'boring', 'risky'], 'Lucrative means it makes a lot of money.');
  syn(4, 'obsolete', 'out of date', ['brand new', 'broken', 'rare']);
  syn(4, 'tranquil', 'peaceful', ['stormy', 'noisy', 'fast']);
  syn(4, 'verify', 'confirm', ['doubt', 'guess', 'erase'], 'To verify is to check that something is true (ver means true).');
  ant(4, 'frugal', 'wasteful', ['thrifty', 'careful', 'poor'], 'Frugal means careful not to waste money; wasteful is the opposite.');
  ant(4, 'transparent', 'opaque', ['clear', 'glassy', 'thin'], 'Transparent lets light through; opaque blocks it.');
  ant(4, 'ascend', 'descend', ['climb', 'rise', 'soar']);
  ant(4, 'abundant', 'sparse', ['plentiful', 'rich', 'full']);
  ant(4, 'cautious', 'reckless', ['careful', 'slow', 'wise']);
  ant(4, 'novice', 'expert', ['beginner', 'student', 'rookie'], 'A novice is a beginner; an expert has mastered the skill.');
  spell(4, 'accommodate', ['acommodate', 'accomodate', 'acomodate'], 'Two c’s and two m’s: it has room for everyone.');
  spell(4, 'embarrass', ['embarass', 'embaras', 'emberrass'], 'Two r’s and two s’s.');
  spell(4, 'conscience', ['concience', 'consience', 'conscence'], 'Con + science.');
  spell(4, 'privilege', ['priviledge', 'privelege', 'privilige'], 'No d: privi-lege.');
  spell(4, 'rhythm', ['rythm', 'rhythym', 'rhytm'], 'Rhythm Helps Your Two Hips Move.');
  spell(4, 'maintenance', ['maintainance', 'maintenence', 'maintanance'], 'Main-ten-ance: the "tain" from maintain drops its i.');
  affix(4, 'autograph', 'auto-', 'self', ['many', 'write', 'far'], 'Auto- means self; graph means write. An autograph is your own name written by you.');
  affix(4, 'microscope', 'micro-', 'small', ['large', 'sound', 'see'], 'Micro- means small; scope means look. A microscope looks at small things.');
  affix(4, 'antifreeze', 'anti-', 'against', ['before', 'with', 'again'], 'Anti- means against, so antifreeze works against freezing.');
  affix(4, 'biologist', '-logist', 'a person who studies', ['a place', 'without', 'again'], 'The suffix -logist names a person who studies: a biologist studies life.');
  affix(4, 'semicircle', 'semi-', 'half', ['whole', 'double', 'around'], 'Semi- means half, so a semicircle is half a circle.');
  root(4, 'Latin', 'aud', 'audio, audience', 'hear', ['see', 'speak', 'walk'], 'Aud means hear: an audience is the people who hear a show.');
  root(4, 'Greek', 'geo', 'geography, geology', 'earth', ['water', 'star', 'fire'], 'Geo means earth: geography describes the earth, geology studies its rocks.');
  root(4, 'Latin', 'port', 'transport, portable', 'carry', ['close', 'open', 'build'], 'Port means carry: something portable can be carried.');
  root(4, 'Greek', 'tele', 'telephone, telescope', 'far', ['near', 'sound', 'light'], 'Tele means far: a telescope lets you see far away.');
  root(4, 'Latin', 'dict', 'dictionary, predict', 'say or speak', ['write', 'think', 'read'], 'Dict means say: to predict is to say what will happen before it does.');
  root(4, 'Greek', 'bio', 'biology, biography', 'life', ['book', 'earth', 'time'], 'Bio means life: a biography is the story of someone’s life.');
  root(4, 'Latin', 'spect', 'inspect, spectator', 'look', ['hear', 'touch', 'run'], 'Spect means look: a spectator looks on at a game.');
  root(4, 'Greek', 'phon', 'telephone, symphony', 'sound', ['light', 'far', 'write'], 'Phon means sound: a symphony is many sounds together.');
  ana(4, 'Thermometer', 'temperature', 'scale', 'weight', ['height', 'time', 'speed'], 'A thermometer measures temperature; a scale measures weight.');
  ana(4, 'Sculptor', 'statue', 'architect', 'building', ['brush', 'marble', 'city'], 'A sculptor designs statues; an architect designs buildings.');
  ana(4, 'Generous', 'stingy', 'brave', 'cowardly', ['bold', 'kind', 'strong'], 'Generous and stingy are opposites, so you need the opposite of brave.');
  ana(4, 'Minute', 'hour', 'inch', 'foot', ['mile', 'second', 'ruler'], 'Sixty minutes make an hour; twelve inches make a foot. Small unit to the next bigger one.');
  ana(4, 'Drought', 'rain', 'famine', 'food', ['water', 'desert', 'farm'], 'A drought is a lack of rain; a famine is a lack of food.');

  // ---------- LEVEL 5: a sharp 7th grader ----------
  ctx(5, 'The CEO’s *candor* surprised the reporters: she admitted the mistake right away.', 'candor', 'honesty', ['anger', 'silence', 'pride'], 'Candor is frank honesty. Admitting a mistake is the clue.');
  ctx(5, 'Investors grew *wary* after the company missed its goals twice.', 'wary', 'cautious and suspicious', ['excited', 'sleepy', 'generous'], 'Wary means watchful and a little suspicious. Two misses would make anyone careful.');
  ctx(5, 'The ranger’s *tenacity* paid off: after six weeks she found the lost wolf pup.', 'tenacity', 'stubborn persistence', ['fear', 'luck', 'kindness'], 'Tenacity is refusing to give up. Six weeks of searching is the clue.');
  ctx(5, 'The orchestra played the finale with such *fervor* that the audience leapt up.', 'fervor', 'intense feeling', ['quietness', 'slowness', 'sadness'], 'Fervor is strong, passionate feeling.');
  ctx(5, 'The clerk’s *concise* summary fit the whole case on one page.', 'concise', 'short and clear', ['long', 'confusing', 'loud'], 'Concise means saying a lot in few words. One page is the clue.');
  ctx(5, 'The scientist remained *skeptical* until the experiment was repeated.', 'skeptical', 'doubtful and wanting proof', ['certain', 'cheerful', 'bored'], 'Skeptical means not convinced yet. Repeating the experiment gives proof.');
  ctx(5, 'A *surplus* of apples sent the price down at the farm market.', 'surplus', 'more than is needed', ['a shortage', 'a basket', 'a truck'], 'A surplus is extra supply. When there is too much of something, its price drops.');
  ctx(5, 'The architect *scrutinized* every line of the blueprint for mistakes.', 'scrutinized', 'examined closely', ['ignored', 'copied', 'signed'], 'To scrutinize is to inspect very carefully.');
  syn(5, 'ambiguous', 'unclear', ['obvious', 'brave', 'tiny'], 'Ambiguous means it could be understood more than one way.');
  syn(5, 'meticulous', 'extremely careful', ['careless', 'fast', 'loud']);
  syn(5, 'resilient', 'able to bounce back', ['fragile', 'angry', 'slow'], 'Resilient means recovering quickly from trouble.');
  syn(5, 'indispensable', 'essential', ['useless', 'optional', 'costly'], 'Indispensable means you cannot do without it.');
  syn(5, 'eloquent', 'well-spoken', ['silent', 'clumsy', 'rude']);
  syn(5, 'ephemeral', 'short-lived', ['eternal', 'heavy', 'bright'], 'Ephemeral things last only a short time, like a soap bubble.');
  ant(5, 'benevolent', 'malicious', ['kind', 'generous', 'gentle'], 'Benevolent means wishing good; malicious means wishing harm.');
  ant(5, 'verbose', 'concise', ['wordy', 'loud', 'polite'], 'Verbose means using too many words; concise means using few.');
  ant(5, 'meager', 'abundant', ['small', 'thin', 'poor'], 'Meager means too little; abundant means plenty.');
  ant(5, 'candid', 'deceptive', ['frank', 'honest', 'open'], 'Candid means honest and open; deceptive means misleading.');
  ant(5, 'prosperity', 'poverty', ['wealth', 'success', 'growth']);
  ant(5, 'amateur', 'professional', ['beginner', 'hobbyist', 'fan'], 'An amateur does it for fun; a professional does it as a paid job.');
  spell(5, 'conscientious', ['concientious', 'conscientous', 'consciencious'], 'Conscience + tious.');
  spell(5, 'liaison', ['liason', 'liasion', 'leaison'], 'Three vowels in a row: l-i-a-i-son.');
  spell(5, 'entrepreneur', ['entrepeneur', 'enterpreneur', 'entreprenuer'], 'Entre-pre-neur: three r’s, one in each part.');
  spell(5, 'questionnaire', ['questionaire', 'questionnair', 'questoinnaire'], 'Two n’s, and it ends in -aire.');
  spell(5, 'bureaucracy', ['beaurocracy', 'bureacracy', 'burocracy'], 'Bureau + cracy.');
  spell(5, 'millennium', ['millenium', 'milennium', 'milenium'], 'Two l’s and two n’s: mille (thousand) + annus (year).');
  affix(5, 'benefactor', 'bene-', 'good or well', ['bad', 'two', 'before'], 'Bene- means good; a benefactor does good by giving help or money.');
  affix(5, 'malfunction', 'mal-', 'bad or wrong', ['good', 'again', 'many'], 'Mal- means bad; a malfunction is something working wrongly.');
  affix(5, 'circumnavigate', 'circum-', 'around', ['through', 'under', 'against'], 'Circum- means around; to circumnavigate is to sail around something.');
  affix(5, 'retrospect', 'retro-', 'backward', ['forward', 'above', 'inside'], 'Retro- means backward; in retrospect means looking back.');
  affix(5, 'hypothermia', 'hypo-', 'under or below', ['over', 'heat', 'against'], 'Hypo- means below; hypothermia is a body temperature below normal.');
  root(5, 'Latin', 'cred', 'credit, incredible', 'believe', ['buy', 'carry', 'hear'], 'Cred means believe: incredible means hard to believe, and credit means a lender believes you will pay.');
  root(5, 'Greek', 'chron', 'chronology, synchronize', 'time', ['place', 'sound', 'earth'], 'Chron means time: a chronology lists events in time order.');
  root(5, 'Latin', 'ject', 'reject, projectile', 'throw', ['pull', 'hold', 'see'], 'Ject means throw: a projectile is thrown, and to reject is to throw back.');
  root(5, 'Greek', 'path', 'sympathy, pathetic', 'feeling or suffering', ['road', 'speech', 'light'], 'Path means feeling: sympathy is feeling with someone.');
  root(5, 'Latin', 'rupt', 'erupt, interrupt', 'break', ['build', 'speak', 'run'], 'Rupt means break: to interrupt is to break into a conversation.');
  root(5, 'Greek', 'dem', 'democracy, epidemic', 'people', ['ruler', 'city', 'sickness'], 'Dem means people: democracy is rule by the people.');
  root(5, 'Latin', 'scrib / script', 'describe, manuscript', 'write', ['read', 'speak', 'carry'], 'Scrib and script mean write: a manuscript is written by hand.');
  root(5, 'Greek', 'hydr', 'hydrant, dehydrate', 'water', ['air', 'fire', 'earth'], 'Hydr means water: to dehydrate is to lose water.');
  root(5, 'Latin', 'vid / vis', 'video, visible', 'see', ['hear', 'move', 'know'], 'Vid and vis mean see: visible means able to be seen.');
  ana(5, 'Frugal', 'spendthrift', 'cautious', 'reckless', ['careful', 'timid', 'slow'], 'Frugal and spendthrift are opposites, so you need the opposite of cautious.');
  ana(5, 'Symphony', 'composer', 'novel', 'author', ['reader', 'library', 'chapter'], 'A composer writes a symphony; an author writes a novel.');
  ana(5, 'Scalpel', 'surgeon', 'chisel', 'sculptor', ['doctor', 'stone', 'hammer'], 'A scalpel is the surgeon’s tool; a chisel is the sculptor’s tool.');
  ana(5, 'Deficit', 'surplus', 'debt', 'savings', ['loan', 'bank', 'bill'], 'A deficit is the opposite of a surplus; debt is the opposite of savings.');
  ana(5, 'Famished', 'hungry', 'ecstatic', 'happy', ['sad', 'tired', 'calm'], 'Famished is extremely hungry; ecstatic is extremely happy. Strong word to mild word.');
  ana(5, 'Drizzle', 'downpour', 'breeze', 'gale', ['wind', 'cloud', 'calm'], 'A drizzle is light rain and a downpour is heavy; a breeze is light wind and a gale is strong.');

  BT.data.words = items;
})();
