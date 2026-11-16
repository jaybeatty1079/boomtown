// BT.data.books: the Bookshelf suggestions. tag: mystery | money | adventure | classic. start: one of the three "Start here" picks.
BT.data = BT.data || {};
BT.data.books = [
  { title: 'The Secret of the Old Clock', author: 'Carolyn Keene', tag: 'mystery', start: true,
    line: 'The first Nancy Drew. A missing will, a clever girl detective, and a clock with a secret.' },
  { title: 'The Lemonade War', author: 'Jacqueline Davies', tag: 'money', start: true,
    line: 'A brother and sister race to earn the most money from lemonade before school starts. Real business math inside.' },
  { title: 'The Westing Game', author: 'Ellen Raskin', tag: 'mystery', start: true,
    line: 'Sixteen heirs, one strange will, and a puzzle with a fortune at the end. Tricky and fair.' },
  { title: 'Nancy Drew and the Clue Crew', author: 'Carolyn Keene', tag: 'mystery',
    line: 'Nancy at eight years old solving neighborhood cases. Shorter and easier than the classic series.' },
  { title: 'From the Mixed-Up Files of Mrs. Basil E. Frankweiler', author: 'E. L. Konigsburg', tag: 'classic',
    line: 'Two kids run away to live inside a museum and hunt the secret of a statue.' },
  { title: 'The Mysterious Benedict Society', author: 'Trenton Lee Stewart', tag: 'adventure',
    line: 'Four gifted kids pass strange tests and go undercover at a school full of riddles. Long, worth it.' },
  { title: "Escape from Mr. Lemoncello's Library", author: 'Chris Grabenstein', tag: 'adventure',
    line: 'Locked in the coolest library ever built and racing through puzzles to get out first.' },
  { title: 'Greenglass House', author: 'Kate Milford', tag: 'mystery',
    line: 'A snowed-in inn, odd guests, and a boy who maps the house to solve it. Slow start, big payoff.' },
  { title: 'Book Scavenger', author: 'Jennifer Chambliss Bertman', tag: 'adventure',
    line: 'A game that hides books all over San Francisco, and a cipher that leads somewhere real.' },
  { title: 'Harriet the Spy', author: 'Louise Fitzhugh', tag: 'classic',
    line: 'Harriet writes down everything she sees about everyone. Then the notebook gets found.' },
  { title: 'Encyclopedia Brown, Boy Detective', author: 'Donald J. Sobol', tag: 'mystery',
    line: 'Ten tiny cases per book. You get the clues and try to beat him to the answer.' },
  { title: 'The Boxcar Children', author: 'Gertrude Chandler Warner', tag: 'classic',
    line: 'Four orphans make a home in an old boxcar and figure out how to live on their own.' },
  { title: 'Winterhouse', author: 'Ben Guterson', tag: 'mystery',
    line: 'A puzzle-loving girl spends winter break at a grand hotel full of word games and secrets.' },
  { title: 'The Parker Inheritance', author: 'Varian Johnson', tag: 'mystery',
    line: 'A letter promising a fortune to whoever solves a decades-old puzzle about a small town. Has some real history in it.' },
  { title: 'Whatever Happened to Penny Candy?', author: 'Richard Maybury', tag: 'money',
    line: 'Letters from an uncle explaining money, inflation and why prices change. Nonfiction, same spirit as Tuttle Twins.' },
  { title: 'How to Turn $100 into $1,000,000', author: 'James McKenna and Jeannine Glista', tag: 'money',
    line: 'A kid-sized guide to earning, saving, investing and starting a business. Worksheets you can actually use.' },
  { title: 'Trixie Belden: The Secret of the Mansion', author: 'Julie Campbell', tag: 'mystery',
    line: 'A tomboy detective from the 1940s. Like Nancy Drew with more mud and a horse.' },
  { title: 'The Vanderbeekers of 141st Street', author: 'Karina Yan Glaser', tag: 'classic',
    line: 'Five siblings have eleven days to convince a grumpy landlord to let them stay. Warm and funny.' }
];

BT.registerChecks('data.books', [
  { name: '18 suggestions with title, author, line and a valid tag', fn: function () {
    var tags = ['mystery', 'money', 'adventure', 'classic'];
    return BT.data.books.length === 18 && BT.data.books.every(function (b) {
      return b.title && b.author && b.line && tags.indexOf(b.tag) >= 0;
    });
  } },
  { name: 'exactly three Start here picks, the spec three', fn: function () {
    var s = BT.data.books.filter(function (b) { return b.start; }).map(function (b) { return b.title; });
    return s.length === 3 && ['The Secret of the Old Clock', 'The Lemonade War', 'The Westing Game'].every(function (t) { return s.indexOf(t) >= 0; });
  } },
  { name: 'no duplicate titles', fn: function () {
    var seen = {};
    return BT.data.books.every(function (b) { if (seen[b.title]) return false; seen[b.title] = 1; return true; });
  } }
]);
