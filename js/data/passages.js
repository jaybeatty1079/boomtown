// BT.data.passages: original nonfiction passages for the reading round.
// Shape: {id, level 1..5, title, kinds:[job kinds this fits], text:[sentences], qs:[{type, q, options[4], correct(index), why, hint(sentence index)}]}
// Levels: 1 = solid 4th grade, 3 = 5th/6th, 5 = a sharp 7th grader. All facts checked; all writing original.
BT.data = BT.data || {};
BT.data.passages = [
  // ---------------- LEVEL 1 ----------------
  { id: 'l1-bread', level: 1, title: 'How Bread Rises', kinds: ['bakery', 'chef'],
    text: [
      'Walk into a bakery in Austin, Texas, early in the morning and you will smell bread before you see it.',
      'That smell starts with yeast.',
      'Yeast is a living thing, a tiny fungus so small that thousands could fit on the head of a pin.',
      'When a baker mixes yeast into warm dough, the yeast begins to eat the sugar in the flour.',
      'As it eats, it gives off a gas called carbon dioxide.',
      'The gas makes thousands of little bubbles inside the dough, and the bubbles make the dough puff up.',
      'Bakers call this rising.',
      'A good loaf may rise for an hour or more before it goes into the oven.',
      'The heat of the oven kills the yeast and turns the stretchy dough firm, but the bubbles stay behind as the holes you see in a slice of bread.',
      'So every soft, airy slice is really a record of a tiny creature\'s breakfast.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['How yeast makes bread rise', 'Why Austin has many bakeries', 'How to buy a good loaf of bread', 'The history of ovens'],
        correct: 0, why: 'Almost every sentence explains what yeast does inside the dough.', hint: 3 },
      { type: 'detail', q: 'What gas does yeast give off?',
        options: ['Oxygen', 'Carbon dioxide', 'Steam', 'Helium'],
        correct: 1, why: 'The passage says the yeast gives off a gas called carbon dioxide.', hint: 4 },
      { type: 'inference', q: 'What happens to the yeast in the oven?',
        options: ['It keeps eating sugar', 'It is killed by the heat', 'It turns into flour', 'It escapes as steam'],
        correct: 1, why: 'The oven\'s heat kills the yeast, but the holes it made stay behind in the bread.', hint: 8 }
    ] },

  { id: 'l1-vet', level: 1, title: 'A Checkup at the Vet', kinds: ['vet'],
    text: [
      'A vet clinic in Denver, Colorado, is a busy place by nine in the morning.',
      'Dogs wait with their owners, cats peek out of carriers, and sometimes a rabbit or a parrot comes through the door.',
      'A veterinarian is a doctor for animals.',
      'Animals cannot say where it hurts, so the vet has to look, listen, and feel.',
      'First the vet puts the animal on a scale, because weight tells a lot about health.',
      'Then the vet uses a stethoscope to listen to the heart and lungs.',
      'A small dog\'s heart often beats faster than a grown person\'s heart does.',
      'The vet checks the ears for dirt, the teeth for tartar, and the skin for fleas.',
      'Many pets also get a shot called a vaccine, which teaches the body to fight off a disease before it ever arrives.',
      'The visit ends the way most good visits do: with a treat.',
      'Denver sits about one mile above sea level, so the vet might remind new owners that pets, like people, can get tired faster in the thin mountain air.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['A vet checks an animal in many ways to find out how healthy it is', 'Dogs are the most common pets in Denver', 'Cats do not like going to the vet', 'Denver is one mile above sea level'],
        correct: 0, why: 'The passage walks through each thing the vet looks at, listens to, and feels to judge the animal\'s health.', hint: 3 },
      { type: 'detail', q: 'What does the vet use to listen to the heart?',
        options: ['A scale', 'A thermometer', 'A stethoscope', 'A flashlight'],
        correct: 2, why: 'The vet uses a stethoscope to listen to the heart and lungs.', hint: 5 },
      { type: 'vocab', q: 'In this passage, a vaccine is best described as a shot that',
        options: ['makes a pet sleepy for the checkup', 'teaches the body to fight a disease', 'helps a pet gain weight', 'cleans a pet\'s teeth'],
        correct: 1, why: 'The passage says a vaccine teaches the body to fight off a disease before it arrives.', hint: 8 }
    ] },

  { id: 'l1-lemonade', level: 1, title: 'Lemonade Stand Math', kinds: ['lemonade', 'bakery', 'toystore'],
    text: [
      'A lemonade stand is a tiny business, and every business has to answer one question: did I make money?',
      'Suppose you spend four dollars on lemons, one dollar on sugar, and one dollar on paper cups.',
      'Those are your costs, and together they add up to six dollars.',
      'Now suppose you sell twenty cups at one dollar each.',
      'The twenty dollars you collect is called your revenue.',
      'Revenue is not the same as profit.',
      'To find profit, you subtract your costs from your revenue.',
      'Twenty dollars minus six dollars leaves fourteen dollars of profit.',
      'If a thunderstorm rolls in and you only sell five cups, your revenue is five dollars and your costs are still six, so you lose a dollar.',
      'Smart stand owners think about this before they open.',
      'They pick a hot day, a busy sidewalk, and a price that people will gladly pay.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['How a lemonade stand can tell if it made a profit', 'Why lemons are expensive', 'How to make lemonade taste better', 'Why thunderstorms happen in summer'],
        correct: 0, why: 'The passage explains costs, revenue, and profit using a lemonade stand as the example.', hint: 6 },
      { type: 'detail', q: 'In the example, how much profit did the stand make on the sunny day?',
        options: ['$6', '$14', '$20', '$26'],
        correct: 1, why: 'Twenty dollars of revenue minus six dollars of costs leaves fourteen dollars.', hint: 7 },
      { type: 'inference', q: 'Why would a thunderstorm cause the stand to lose money?',
        options: ['Rain makes lemons cost more', 'Fewer people stop to buy a cup, but the costs stay the same', 'Sugar dissolves in rain', 'The cups blow away'],
        correct: 1, why: 'With only five cups sold, revenue drops to five dollars while the six dollars of costs do not change.', hint: 8 }
    ] },

  { id: 'l1-pike', level: 1, title: 'The Market That Throws Fish', kinds: ['market', 'guide', 'farm'],
    text: [
      'Pike Place Market in Seattle, Washington, opened in 1907.',
      'Back then, farmers drove wagons into the city and sold vegetables straight from the back.',
      'The market was built so that shoppers could buy from the farmers themselves, with no one in the middle raising the price.',
      'More than one hundred years later, it is still open every day, which makes it one of the oldest farmers markets in the United States.',
      'Today the market is famous for its fish sellers.',
      'When a customer picks a salmon, a worker behind the counter shouts the order and tosses the whole fish through the air to a partner, who catches it in a sheet of paper.',
      'Crowds gather just to watch.',
      'The market also has flower stalls, bakeries, cheese makers, and a bronze pig named Rachel that people rub for luck.',
      'A guide at the market needs to know the history, the stalls, and the best place to stand when a fish comes flying.'
    ],
    qs: [
      { type: 'main', q: 'Which sentence best tells what the passage is about?',
        options: ['Pike Place Market is an old Seattle market known for its farmers and its flying fish', 'Salmon is the most popular fish in Seattle', 'Farmers no longer sell at Pike Place Market', 'Seattle has many bronze statues'],
        correct: 0, why: 'The passage covers the market\'s history with farmers and its famous fish throwing.', hint: 3 },
      { type: 'detail', q: 'In what year did the market open?',
        options: ['1807', '1907', '1957', '2007'],
        correct: 1, why: 'The first sentence says the market opened in 1907.', hint: 0 },
      { type: 'inference', q: 'Why was the market built so shoppers could buy from farmers directly?',
        options: ['So prices would stay lower with no middleman', 'So farmers could learn to cook', 'Because the city had no roads', 'So fish could be thrown'],
        correct: 0, why: 'The passage says there would be no one in the middle raising the price.', hint: 2 }
    ] },

  { id: 'l1-ranger', level: 1, title: 'Rules of the Ranger', kinds: ['ranger', 'park'],
    text: [
      'Yellowstone became the first national park in the world in 1872.',
      'Most of the park lies in Wyoming, with small parts reaching into Montana and Idaho.',
      'Rangers who work there protect two things at once: the visitors and the park.',
      'Yellowstone sits on top of an old volcano, and hot water from underground bursts out as geysers.',
      'The most famous one, Old Faithful, erupts roughly every hour or two and can shoot water more than one hundred feet into the air.',
      'Rangers remind visitors to stay on the boardwalks, because the ground near a geyser can be thin and the water is hot enough to burn.',
      'They also teach a rule called Leave No Trace.',
      'It means you pack out your trash, you do not carve your name on trees, and you never feed the animals.',
      'A bear that learns to find food near people stops acting like a wild bear, and that is dangerous for the bear and for the people.',
      'Keeping the park wild is the whole job.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea?',
        options: ['Rangers protect both visitors and the park itself', 'Old Faithful is the biggest geyser on Earth', 'Yellowstone is only in Wyoming', 'Bears are the most common animal in the park'],
        correct: 0, why: 'The passage says rangers protect two things at once, the visitors and the park, and gives examples of each.', hint: 2 },
      { type: 'detail', q: 'In what year did Yellowstone become a national park?',
        options: ['1776', '1872', '1912', '1972'],
        correct: 1, why: 'The first sentence gives the year 1872.', hint: 0 },
      { type: 'inference', q: 'Why is it bad for a bear to find food near people?',
        options: ['Bears do not like human food', 'The bear stops acting wild, which puts bears and people in danger', 'Bears get too heavy to climb', 'The food is too salty'],
        correct: 1, why: 'The passage says such a bear stops acting like a wild bear, which is dangerous for everyone.', hint: 8 }
    ] },

  { id: 'l1-bank', level: 1, title: 'Where Money Sleeps', kinds: ['bank'],
    text: [
      'A bank teller is the person behind the counter who takes your deposit and hands you your cash.',
      'But where does the money go after the teller takes it?',
      'It does not sit in a box with your name on it.',
      'A bank keeps some cash in its vault and lends most of the rest to other people, who use it to buy homes, start shops, or go to college.',
      'Those borrowers pay the bank extra money called interest.',
      'The bank shares a little of that interest with you for letting it use your money.',
      'That is why a savings account grows slowly all by itself.',
      'Your money is also protected.',
      'In the United States, a government agency called the FDIC promises to pay you back, up to 250,000 dollars, if the bank ever fails.',
      'So a bank is not a piggy bank.',
      'It is more like a busy swap shop where money is always moving, and the teller is the front door.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['How a bank uses and protects the money people deposit', 'How to become a bank teller', 'Why piggy banks are better than banks', 'How to buy a home'],
        correct: 0, why: 'The passage follows a deposit: the bank lends it out, pays interest, and the FDIC protects it.', hint: 3 },
      { type: 'detail', q: 'Up to how much money does the FDIC protect?',
        options: ['$2,500', '$25,000', '$250,000', '$2,500,000'],
        correct: 2, why: 'The passage says the FDIC pays you back up to 250,000 dollars if the bank fails.', hint: 8 },
      { type: 'vocab', q: 'In this passage, interest is',
        options: ['extra money a borrower pays for using money', 'a type of bank vault', 'a kind of coin', 'the name of the teller'],
        correct: 0, why: 'Borrowers pay the bank extra money called interest, and the bank shares some with savers.', hint: 4 }
    ] },

  // ---------------- LEVEL 2 ----------------
  { id: 'l2-milehigh', level: 2, title: 'One Mile Up', kinds: ['vet', 'bakery', 'weather'],
    text: [
      'Denver, Colorado, is called the Mile High City for a simple reason: the city sits about 5,280 feet above sea level, and 5,280 feet is exactly one mile.',
      'On the steps of the Colorado State Capitol, one step is marked to show the spot that is one mile high.',
      'Living that high changes everyday science.',
      'The air is thinner, which means there are fewer air molecules in every breath.',
      'Visitors who arrive from the coast often feel out of breath for the first day or two.',
      'Thin air also changes cooking.',
      'Water boils when its vapor pushes back against the air above it, and with less air pressing down, water in Denver boils at about 203 degrees Fahrenheit instead of 212.',
      'Pasta takes longer to cook, and cakes rise too fast and can collapse unless the baker uses less baking powder.',
      'Even a bag of chips bought at sea level puffs up like a pillow by the time it reaches Denver.',
      'A vet, a baker, or a weather scientist working in Denver has to keep altitude in mind all day long.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Denver\'s high altitude changes breathing, cooking, and more', 'Denver has the tallest capitol building', 'Chips taste better in the mountains', 'Water never boils in Denver'],
        correct: 0, why: 'The passage lists several ways life changes a mile above sea level: breathing, boiling, baking, even bags of chips.', hint: 2 },
      { type: 'detail', q: 'At about what temperature does water boil in Denver?',
        options: ['180°F', '203°F', '212°F', '250°F'],
        correct: 1, why: 'The passage says water in Denver boils at about 203 degrees instead of 212.', hint: 6 },
      { type: 'inference', q: 'Why does a sealed bag of chips puff up in Denver?',
        options: ['The chips grow', 'There is less air pressing on the outside of the bag, so the air inside pushes it out', 'The sun is stronger', 'The bag gets wet'],
        correct: 1, why: 'The passage says there is less air pressing down in Denver, so the sealed air inside the bag can push outward.', hint: 6 }
    ] },

  { id: 'l2-barometer', level: 2, title: 'What the Barometer Knows', kinds: ['weather', 'pilot'],
    text: [
      'A weather station is a small building crowded with instruments, each one measuring a different piece of the sky.',
      'The thermometer measures temperature.',
      'The anemometer, with its spinning cups, measures wind speed.',
      'The rain gauge catches rain so it can be measured in inches.',
      'The most surprising tool is the barometer, which measures air pressure, the weight of all the air stacked above us.',
      'Air pressure matters because it changes before the weather does.',
      'When the barometer falls, air is rising and cooling, and rising air tends to form clouds and storms.',
      'When the barometer climbs, the air is sinking and the sky usually clears.',
      'Sailors watched barometers for centuries before anyone had a satellite.',
      'Water itself is on a journey the whole time.',
      'The sun warms oceans and lakes, water evaporates into vapor, the vapor rises and condenses into clouds, and the clouds drop rain or snow back to the ground.',
      'Scientists call this the water cycle, and nothing in a weather station makes sense without it.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Weather stations use instruments, especially the barometer, to understand changing weather', 'Rain gauges are the most important tool', 'Satellites replaced all weather tools', 'Sailors invented the thermometer'],
        correct: 0, why: 'The passage tours the station\'s instruments and spends the most time on what the barometer tells us.', hint: 0 },
      { type: 'detail', q: 'What does an anemometer measure?',
        options: ['Temperature', 'Rainfall', 'Wind speed', 'Air pressure'],
        correct: 2, why: 'The anemometer, with its spinning cups, measures wind speed.', hint: 2 },
      { type: 'inference', q: 'A falling barometer most likely means',
        options: ['clear skies are coming', 'a storm may be on the way', 'the wind has stopped', 'the temperature will drop to freezing'],
        correct: 1, why: 'When the barometer falls, rising air tends to form clouds and storms.', hint: 6 }
    ] },

  { id: 'l2-octopus', level: 2, title: 'Eight Arms, Three Hearts', kinds: ['aquarium', 'marine'],
    text: [
      'Guides at a big aquarium get more questions about the octopus than about any shark.',
      'It is easy to see why.',
      'An octopus has eight arms, no bones at all, and three hearts.',
      'Two of the hearts pump blood to the gills, where it picks up oxygen, and the third pumps that blood to the rest of the body.',
      'Its blood is not red but blue, because it uses a copper-based molecule instead of the iron-based one that makes human blood red.',
      'With no skeleton, an octopus can squeeze its whole body through any gap wider than its hard beak.',
      'Aquarium workers have to tape down the lids of tanks, because an octopus can lift them and wander off.',
      'Its skin is covered in tiny color sacs that open and close in a fraction of a second, so it can match a rock, a patch of sand, or a bed of coral.',
      'Scientists have watched octopuses open jars, solve mazes, and remember people.',
      'Most live only one to two years, which makes all that cleverness even more surprising.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['The octopus is an unusual animal with a strange body and a sharp mind', 'Sharks are more popular than octopuses', 'Octopuses live a long time', 'Aquarium lids are hard to open'],
        correct: 0, why: 'The passage describes the octopus\'s odd body, then its cleverness.', hint: 2 },
      { type: 'detail', q: 'Why is octopus blood blue?',
        options: ['It is very cold', 'It uses a copper-based molecule instead of an iron-based one', 'It carries no oxygen', 'It is mixed with seawater'],
        correct: 1, why: 'The passage says the blood uses a copper-based molecule rather than the iron-based one in human blood.', hint: 4 },
      { type: 'inference', q: 'Why do aquarium workers tape down tank lids?',
        options: ['To keep the water warm', 'Because an octopus can lift the lid and escape', 'To stop visitors from feeding the fish', 'To block the light'],
        correct: 1, why: 'An octopus can lift a lid and wander off, so the lids are taped down.', hint: 6 }
    ] },

  { id: 'l2-toyprice', level: 2, title: 'The Price Tag at the Toy Store', kinds: ['toystore', 'market'],
    text: [
      'The owner of a toy store does not make the toys.',
      'She buys them from a company at a low price, called the wholesale price, and sells them to customers at a higher price, called the retail price.',
      'The gap between the two is the markup.',
      'If a puzzle costs the store eight dollars and sells for twelve, the markup is four dollars.',
      'That four dollars is not all profit.',
      'It has to pay for the rent on the building, the electric bill, the wages of the people behind the counter, and the bags the toys go home in.',
      'Only what is left after all of those bills is profit.',
      'A store with a tiny markup needs to sell a mountain of toys to stay open.',
      'Owners also think about the calendar.',
      'Most toy stores sell more in November and December than in any other months of the year, so they order extra stock in the fall.',
      'In January, the toys that did not sell go on sale, because shelf space for new toys is worth more than holding out for full price.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['How a toy store sets prices and pays its bills', 'Why puzzles cost eight dollars', 'Why January is a bad month', 'How toys are made'],
        correct: 0, why: 'The passage explains wholesale and retail prices, markup, bills, and sale timing.', hint: 1 },
      { type: 'detail', q: 'In the example, what is the markup on the puzzle?',
        options: ['$4', '$8', '$12', '$20'],
        correct: 0, why: 'The puzzle costs eight dollars and sells for twelve, so the markup is four dollars.', hint: 3 },
      { type: 'vocab', q: 'In this passage, the wholesale price is',
        options: ['the price the store pays the company for a toy', 'the price on the shelf', 'the price after a sale', 'the cost of the rent'],
        correct: 0, why: 'The store buys toys from a company at a low price called the wholesale price.', hint: 1 }
    ] },

  { id: 'l2-dewey', level: 2, title: 'The Library\'s Number Code', kinds: ['library'],
    text: [
      'Every book in a public library has a place, and a library helper has to know how to find it.',
      'Most libraries in the United States sort nonfiction with the Dewey Decimal System.',
      'A librarian named Melvil Dewey created it in 1876, when he was only twenty-four years old.',
      'The system splits all knowledge into ten big groups, numbered 000 through 900.',
      'The 500s are science, so a book about volcanoes lives there.',
      'The 600s are technology and health, which covers cooking and pets.',
      'The 700s hold art, music, and sports, and the 900s hold history and geography.',
      'Each big group splits again and again, so the number on a book\'s spine gets more exact with every digit.',
      'A book numbered 599 is about mammals; 599.7 narrows it to a smaller group of mammals.',
      'Fiction is simpler.',
      'Novels are shelved by the author\'s last name, so a mystery by a writer named Keene sits under K.',
      'Once you learn the code, you can walk into almost any library in the country and find the shelf you want without asking.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['The Dewey Decimal System gives every nonfiction book a numbered place', 'Melvil Dewey wrote many novels', 'Fiction books have no order', 'Libraries only hold science books'],
        correct: 0, why: 'The passage explains how the Dewey system numbers nonfiction so any book can be found.', hint: 1 },
      { type: 'detail', q: 'In which group would a book about volcanoes be found?',
        options: ['The 500s', 'The 600s', 'The 700s', 'The 900s'],
        correct: 0, why: 'The 500s are science, and the passage uses volcanoes as the example.', hint: 4 },
      { type: 'inference', q: 'Where would a novel by an author named Davies be shelved?',
        options: ['In the 900s', 'Under D with the fiction', 'In the 500s', 'Next to the volcano books'],
        correct: 1, why: 'Novels are shelved by the author\'s last name, so Davies goes under D.', hint: 10 }
    ] },

  { id: 'l2-ranch', level: 2, title: 'Big Sky Ranch', kinds: ['ranch', 'farm'],
    text: [
      'Montana is called Big Sky Country, and on a cattle ranch there the sky really does seem to go on forever.',
      'Cattle outnumber people in Montana, and a ranch hand spends most of the day with them.',
      'The work changes with the seasons.',
      'Spring means calving, when new calves are born and need checking.',
      'Summer means moving the herd to fresh grass and fixing miles of fence.',
      'Fall is when the cattle are rounded up and sold.',
      'Winter means hauling hay through the snow, because grass will not grow under ice.',
      'Cattle can live on grass because of a special stomach with four compartments.',
      'The first one, called the rumen, is full of microbes that break down tough plant fibers that a human stomach could never digest.',
      'A cow swallows grass, brings it back up as a soft lump called cud, and chews it again.',
      'Ranchers mark their cattle with a brand, a unique symbol registered with the state, so a cow that wanders onto a neighbor\'s land can be returned.',
      'It is old-fashioned work, done today with trucks, four-wheelers, and the same patience it always took.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['A ranch hand\'s work follows the seasons and depends on knowing cattle', 'Montana has the biggest sky in the world', 'Cows only eat hay', 'Brands are no longer used'],
        correct: 0, why: 'The passage goes season by season through ranch work and explains how cattle eat and are marked.', hint: 2 },
      { type: 'detail', q: 'What is the first compartment of a cow\'s stomach called?',
        options: ['The cud', 'The rumen', 'The brand', 'The herd'],
        correct: 1, why: 'The passage names the first compartment the rumen.', hint: 8 },
      { type: 'vocab', q: 'In this passage, cud is',
        options: ['a type of grass', 'a soft lump of food a cow chews again', 'a wandering cow', 'a kind of fence'],
        correct: 1, why: 'A cow brings grass back up as a soft lump called cud and chews it again.', hint: 9 }
    ] },

  { id: 'l2-boat', level: 2, title: 'Why a Boat Floats', kinds: ['boat', 'marine'],
    text: [
      'Maine is the state tucked into the top right corner of the country, and its rocky coast is lined with boat yards.',
      'Workers there build and repair lobster boats, sailboats, and ferries.',
      'Every one of them depends on a rule discovered more than two thousand years ago by a Greek thinker named Archimedes.',
      'When an object sits in water, it pushes some water out of the way.',
      'The water pushes back with a force equal to the weight of the water that was moved.',
      'If that pushed-aside water weighs more than the object, the object floats.',
      'That is why a steel boat can float even though a steel bolt sinks.',
      'The boat\'s hull is shaped like a giant cup, so it moves aside a huge amount of water while weighing far less than that water.',
      'Boat builders check this with a number called displacement.',
      'Load a boat with too many lobster traps and it sits lower, moving aside more water, until the day it moves aside more than it can and the sea comes over the side.',
      'Good builders leave plenty of room for mistakes, and good captains do not test the limit.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Boats float because the water they push aside pushes back with equal force', 'Maine builds the most boats in America', 'Steel always sinks', 'Lobster traps are heavy'],
        correct: 0, why: 'The passage explains Archimedes\' rule and uses it to show why a steel hull floats.', hint: 4 },
      { type: 'detail', q: 'Who discovered the rule the passage describes?',
        options: ['Isaac Newton', 'Archimedes', 'Benjamin Franklin', 'A Maine boat builder'],
        correct: 1, why: 'The passage credits a Greek thinker named Archimedes.', hint: 2 },
      { type: 'inference', q: 'What happens if a boat is loaded with too much weight?',
        options: ['It floats higher', 'It sits lower until water can come over the side', 'It speeds up', 'The hull turns into a cup'],
        correct: 1, why: 'An overloaded boat sits lower and lower until the sea comes over the side.', hint: 9 }
    ] },

  // ---------------- LEVEL 3 ----------------
  { id: 'l3-reporter', level: 3, title: 'Before the Story Prints', kinds: ['newspaper', 'reporter'],
    text: [
      'A newspaper reporter\'s job is not to have opinions; it is to find out what happened and prove it.',
      'Reporters start with five questions that editors call the five Ws: who, what, when, where, and why.',
      'A story that leaves out any of them feels unfinished.',
      'The harder rule is about sources.',
      'A good newsroom wants at least two independent sources for any fact that could be disputed.',
      'If a city official says a bridge will close Monday, the reporter calls the transportation department to confirm it rather than trusting a single voice.',
      'Facts that cannot be confirmed get cut or get a clear label saying who claimed them.',
      'This habit goes back a long way.',
      'The Boston News-Letter, which began in 1704, was the first newspaper in the American colonies to keep publishing week after week.',
      'In 1791, the First Amendment to the Constitution protected freedom of the press, meaning the government cannot shut a newspaper down for what it prints.',
      'That freedom comes with a duty.',
      'A reporter who gets a fact wrong must print a correction, in the paper, where everyone can see it.',
      'Readers forgive mistakes faster than they forgive hiding them.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Reporters must confirm facts carefully because press freedom comes with responsibility', 'Newspapers began in 1704', 'Editors ask too many questions', 'Bridges often close on Mondays'],
        correct: 0, why: 'The passage is about proving facts with sources and owning up to mistakes, the duty that comes with a free press.', hint: 0 },
      { type: 'detail', q: 'How many independent sources does a good newsroom want for a disputed fact?',
        options: ['One', 'At least two', 'Five', 'Ten'],
        correct: 1, why: 'The passage says a good newsroom wants at least two independent sources.', hint: 4 },
      { type: 'vocab', q: 'In this passage, a correction is',
        options: ['a printed notice that fixes a mistake', 'a new headline', 'a type of source', 'a government rule'],
        correct: 0, why: 'A reporter who gets a fact wrong prints a correction where everyone can see it.', hint: 11 }
    ] },

  { id: 'l3-compound', level: 3, title: 'Money That Grows Itself', kinds: ['bank', 'stock', 'startup'],
    text: [
      'There is a kind of math that bankers love and most people never learn: compound interest.',
      'Interest is money a bank pays you for keeping your savings there.',
      'Simple interest pays the same amount each year.',
      'Compound interest pays you interest on your interest.',
      'Say you put 100 dollars in an account that pays 5 percent a year.',
      'After one year you have 105 dollars.',
      'In the second year, you earn 5 percent of 105, not 100, so you end with 110 dollars and 25 cents.',
      'The extra quarter looks tiny.',
      'It is not.',
      'Each year the pile grows a little faster than the year before, like a snowball rolling downhill.',
      'Bankers use a shortcut called the Rule of 72 to guess how long doubling takes.',
      'Divide 72 by the interest rate, and you get roughly the number of years.',
      'At 6 percent, money doubles in about 12 years; at 9 percent, in about 8.',
      'The catch is that compounding works against you, too.',
      'Borrow money on a credit card and the unpaid interest gets added to what you owe, so next month\'s interest is bigger.',
      'The same snowball, rolling the wrong way.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Compound interest makes savings grow faster over time, and debt too', 'Banks do not pay interest', 'Credit cards are always bad', 'The Rule of 72 is a trick for finding squares'],
        correct: 0, why: 'The passage explains interest on interest, shows it with numbers, and warns it works the same way on debt.', hint: 3 },
      { type: 'detail', q: 'Using the Rule of 72, about how many years does money take to double at 6 percent?',
        options: ['6 years', '8 years', '12 years', '72 years'],
        correct: 2, why: '72 divided by 6 is 12, and the passage says money at 6 percent doubles in about 12 years.', hint: 12 },
      { type: 'inference', q: 'Why does the passage say compounding can work against you?',
        options: ['Banks sometimes lose money', 'Unpaid interest on a debt is added to the debt, so the debt grows faster', 'Snowballs melt', 'Interest rates always rise'],
        correct: 1, why: 'On a credit card, unpaid interest is added to what you owe, so the next interest charge is bigger.', hint: 14 }
    ] },

  { id: 'l3-elephant', level: 3, title: 'Why Elephants Flap', kinds: ['zoo', 'vet'],
    text: [
      'A zoo keeper who cares for elephants learns to read their ears.',
      'An elephant has no sweat glands to speak of, so it cannot cool down the way a person does on a hot afternoon.',
      'Instead, it flaps.',
      'Each ear is a thin sheet of skin laced with blood vessels.',
      'Blood flows through the ears, the moving air carries heat away, and the cooler blood travels back into the body.',
      'On a hot day the flapping speeds up; on a cool morning the ears hang still.',
      'This also explains a difference between the two kinds of elephants.',
      'African elephants live in hotter, more open country and have enormous ears, while Asian elephants, which live in shadier forests, have smaller ones.',
      'Keeping an elephant fed is the other half of the job.',
      'An adult can eat around 300 pounds of hay, grass, fruit, and branches in a single day and drink a bathtub\'s worth of water.',
      'Keepers hide food around the enclosure so the elephants have to search for it, the way they would in the wild.',
      'A bored elephant is an unhappy elephant, and an unhappy elephant weighs more than a car.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Elephants use their ears to cool down, and keepers work to keep them fed and busy', 'African elephants are friendlier than Asian elephants', 'Elephants sweat heavily', 'Zoo keepers mostly clean cages'],
        correct: 0, why: 'The first half explains ear flapping; the second half explains feeding and keeping the elephants busy.', hint: 4 },
      { type: 'detail', q: 'About how much can an adult elephant eat in one day?',
        options: ['30 pounds', '100 pounds', '300 pounds', '3,000 pounds'],
        correct: 2, why: 'The passage says an adult can eat around 300 pounds in a single day.', hint: 9 },
      { type: 'inference', q: 'Why do African elephants have bigger ears than Asian elephants?',
        options: ['They hear better in the forest', 'They live in hotter, more open country and need to shed more heat', 'They are younger', 'Their keepers stretch them'],
        correct: 1, why: 'Bigger ears shed more heat, and African elephants live in hotter, more open country.', hint: 7 }
    ] },

  { id: 'l3-launch', level: 3, title: 'Why Rockets Launch From Florida', kinds: ['space', 'pilot'],
    text: [
      'Kennedy Space Center sits on Merritt Island, on the Atlantic coast of Florida.',
      'Rockets have launched from this stretch of coast since the 1950s, and the location was no accident.',
      'Earth spins toward the east, and the ground near the equator moves fastest, at roughly 1,000 miles per hour.',
      'Florida is closer to the equator than most of the country, so a rocket launched there starts with a bigger free push from the planet\'s spin.',
      'Launching toward the east adds that push to the rocket\'s own speed.',
      'The ocean matters just as much.',
      'A rocket that fails in its first minutes drops its pieces over empty water instead of a town.',
      'The most famous launch here was Apollo 11, which lifted off from Pad 39A on July 16, 1969.',
      'Four days later, two of its astronauts walked on the Moon.',
      'Today, workers at the center prepare rockets, check thousands of parts, and count down for private companies as well as NASA.',
      'Every countdown ends the same way: a hold of breath, a wall of flame, and a sound that visitors three miles away can feel in their chests.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Florida\'s location gives rockets a boost and keeps launches safe', 'Apollo 11 was the only launch from Florida', 'Rockets cannot launch from anywhere else', 'Florida has the best weather'],
        correct: 0, why: 'The passage explains the two reasons for the site: the push from Earth\'s spin and the safety of the ocean.', hint: 3 },
      { type: 'detail', q: 'From which pad did Apollo 11 launch?',
        options: ['Pad 1', 'Pad 11', 'Pad 39A', 'Pad 1969'],
        correct: 2, why: 'The passage says Apollo 11 lifted off from Pad 39A.', hint: 7 },
      { type: 'inference', q: 'Why is launching over the ocean safer?',
        options: ['Water cools the rocket', 'If a rocket fails, its pieces fall on empty water instead of a town', 'Fish are not harmed', 'The ocean reflects the sound'],
        correct: 1, why: 'A rocket that fails early drops its pieces over empty water rather than over people.', hint: 6 }
    ] },

  { id: 'l3-tides', level: 3, title: 'The Pull of the Moon', kinds: ['marine', 'aquarium', 'boat'],
    text: [
      'A marine biologist working along the coast plans the day around the tide table.',
      'Twice a day the sea rises, and twice a day it falls, uncovering the rocky pools where sea stars, anemones, and crabs can be studied up close.',
      'The cause is the Moon.',
      'Its gravity tugs on Earth\'s oceans, pulling the water into a bulge on the side facing the Moon.',
      'A second bulge forms on the far side of the planet, because there Earth itself is pulled toward the Moon more than the water is.',
      'As Earth turns through both bulges each day, most coasts see two high tides and two low tides.',
      'The Sun pulls too, though less, because it is so far away.',
      'When the Sun and Moon line up at a new moon or a full moon, their pulls combine, and the tides swing highest and lowest.',
      'These are called spring tides, though they have nothing to do with the season.',
      'The biggest tides on Earth happen in the Bay of Fundy in Canada, where the water can rise and fall more than 50 feet.',
      'A biologist who misreads the table may find the study site under thirty feet of cold Atlantic water.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Tides are caused mainly by the Moon\'s gravity and follow a daily pattern', 'The Sun has no effect on tides', 'Sea stars live only in Canada', 'Marine biologists work at night'],
        correct: 0, why: 'The passage explains how the Moon\'s pull creates two bulges and two high tides a day.', hint: 3 },
      { type: 'detail', q: 'Where are the biggest tides on Earth?',
        options: ['The Gulf of Mexico', 'The Bay of Fundy', 'Puget Sound', 'The Great Lakes'],
        correct: 1, why: 'The passage names the Bay of Fundy in Canada, with a range of more than 50 feet.', hint: 9 },
      { type: 'vocab', q: 'In this passage, spring tides are',
        options: ['tides that happen only in springtime', 'the highest and lowest tides, when the Sun and Moon line up', 'tides that bounce', 'the first tide of the morning'],
        correct: 1, why: 'Spring tides happen when the Sun and Moon line up; the passage says they have nothing to do with the season.', hint: 7 }
    ] },

  { id: 'l3-strawberry', level: 3, title: 'Strawberries in June', kinds: ['market', 'farm', 'lemonade'],
    text: [
      'At a farm market, prices are not printed in a book.',
      'They move, and the reason they move is one of the oldest ideas in economics: supply and demand.',
      'Supply is how much of something sellers have.',
      'Demand is how much of it buyers want.',
      'When supply is high and demand is low, prices fall, because sellers would rather sell cheap than watch fruit rot.',
      'When supply is low and demand is high, prices climb, because buyers compete for what little there is.',
      'Strawberries show this every year.',
      'In early June, when every farm\'s berries ripen at once, tables overflow and a quart might sell for three dollars.',
      'After a late frost kills half the crop, the same quart can cost six.',
      'Nothing about the strawberry changed.',
      'What changed was how many there were and how many people wanted them.',
      'Smart shoppers use this.',
      'They buy what is in season and plentiful, freeze or can the extra, and skip the one lonely basket of out-of-season peaches with the shocking price.',
      'Smart farmers use it too, planting a mix of crops so that a bad week for one is not a bad week for all.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Prices at a market rise and fall with supply and demand', 'Strawberries are the best fruit', 'Frost is good for farmers', 'Shoppers should only buy peaches'],
        correct: 0, why: 'The passage defines supply and demand and shows them moving strawberry prices.', hint: 1 },
      { type: 'detail', q: 'In the example, what happens to the price of a quart of strawberries after a late frost?',
        options: ['It drops to $1', 'It stays at $3', 'It rises to $6', 'Strawberries become free'],
        correct: 2, why: 'After the frost kills half the crop, the same quart can cost six dollars.', hint: 8 },
      { type: 'inference', q: 'Why does planting a mix of crops help a farmer?',
        options: ['Mixed crops taste better', 'A bad week for one crop does not ruin the whole farm', 'It uses less water', 'Buyers prefer variety'],
        correct: 1, why: 'With a mix of crops, a bad week for one is not a bad week for all.', hint: 13 }
    ] },

  // ---------------- LEVEL 4 ----------------
  { id: 'l4-load', level: 4, title: 'What Holds a Skyscraper Up', kinds: ['architect', 'mayor'],
    text: [
      'An architect draws what a building will look like, but every line has to answer an engineer\'s question: what carries the weight?',
      'The weight a building must support is called its load.',
      'Dead load is the building itself, the steel, the concrete, the glass.',
      'Live load is everything that moves in and out: people, furniture, snow on the roof.',
      'In a small house, thick walls carry the load straight down to the foundation.',
      'A skyscraper cannot work that way; walls thick enough to hold up eighty floors would leave no room inside.',
      'Instead, a skeleton of steel columns and beams carries the load, and the walls simply hang on the frame like a curtain.',
      'The Empire State Building in New York City proved what the method could do.',
      'Its steel frame rose at a pace of more than four floors a week, and the whole 102-story tower was finished in about 410 days, opening in 1931.',
      'Architects once shared their plans as blueprints, white lines on deep blue paper made by a chemical printing process.',
      'The paper is gone, replaced by computer files, but the name stuck, and so did the first question.',
      'Before anyone asks whether a building is beautiful, someone has to prove it will stand.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['A building\'s design must first solve how its weight is carried', 'The Empire State Building is the tallest building', 'Blueprints are still printed on blue paper', 'Houses are stronger than skyscrapers'],
        correct: 0, why: 'From the first sentence to the last, the passage is about who carries the load before anything else is decided.', hint: 11 },
      { type: 'detail', q: 'About how long did it take to build the Empire State Building?',
        options: ['41 days', '410 days', '4 years', '10 years'],
        correct: 1, why: 'The passage says the tower was finished in about 410 days.', hint: 8 },
      { type: 'vocab', q: 'In this passage, live load means',
        options: ['the weight of the steel frame', 'the weight of things that move in and out, like people and snow', 'electricity in the walls', 'the foundation'],
        correct: 1, why: 'Live load is defined as everything that moves in and out: people, furniture, snow on the roof.', hint: 3 }
    ] },

  { id: 'l4-nyse', level: 4, title: 'The Bell on Wall Street', kinds: ['stock', 'bank', 'startup'],
    text: [
      'At 9:30 each weekday morning, a bell rings inside a building at 11 Wall Street in New York City, and the New York Stock Exchange opens for trading.',
      'At 4:00 in the afternoon it rings again, and trading stops.',
      'Between those bells, millions of shares change hands.',
      'A share is a small slice of ownership in a company.',
      'If a company is divided into one million shares and you own one of them, you own one-millionth of the business.',
      'People buy shares hoping the company will grow, which tends to make each slice worth more, and some companies also pay owners a share of profits called a dividend.',
      'Prices rise and fall all day as buyers and sellers argue, in effect, about what a company is worth.',
      'The exchange traces its start to 1792, when 24 brokers signed an agreement under a buttonwood tree on Wall Street, promising to trade only with one another and to charge a set fee.',
      'For most of its history, traders shouted orders across a crowded floor.',
      'Today nearly all trades happen on computers in a fraction of a second, but the floor, and the bell, remain.',
      'The person who rings it is often a guest, a company founder, or an athlete, and it is considered an honor.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['The stock exchange is where shares, pieces of company ownership, are bought and sold', 'Bells are rung to wake traders up', 'Wall Street has one buttonwood tree', 'Computers invented stock trading'],
        correct: 0, why: 'The passage explains what a share is and how the exchange trades them, past and present.', hint: 3 },
      { type: 'detail', q: 'In what year did 24 brokers sign the agreement that started the exchange?',
        options: ['1692', '1792', '1892', '1929'],
        correct: 1, why: 'The passage dates the buttonwood agreement to 1792.', hint: 7 },
      { type: 'vocab', q: 'In this passage, a dividend is',
        options: ['a share of a company\'s profits paid to its owners', 'the bell that opens trading', 'a type of tree', 'a broker\'s fee'],
        correct: 0, why: 'Some companies pay owners a share of profits called a dividend.', hint: 5 }
    ] },

  { id: 'l4-feedback', level: 4, title: 'The Robot That Checks Itself', kinds: ['robot', 'game'],
    text: [
      'The hardest part of building a robot is not making it move; it is making it notice.',
      'Engineers in a robot lab spend most of their time on sensors and on a loop of logic called feedback.',
      'A feedback loop has three steps: measure, compare, adjust.',
      'A home thermostat is the simplest example.',
      'It measures the room temperature, compares it with the setting, and switches the heat on or off.',
      'A robot vacuum uses the same idea with a bumper switch; when it bumps a wall, the sensor fires, and the program turns the robot away.',
      'Fancier robots see with ultrasonic sensors.',
      'The sensor sends out a click of sound too high for people to hear and times the echo.',
      'Sound travels through room-temperature air at about 343 meters per second, so if the echo takes two thousandths of a second, the wall is about 34 centimeters away, since the sound went there and back.',
      'The robot repeats this dozens of times each second and steers by the numbers.',
      'What makes a robot seem smart is how fast and how often it closes the loop.',
      'A robot that measures once and then acts blindly is just a wind-up toy with better batteries.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Robots act intelligently by using sensors in a repeating feedback loop', 'Thermostats are robots', 'Robot vacuums are the most advanced robots', 'Sound cannot travel through air'],
        correct: 0, why: 'The passage explains the measure-compare-adjust loop and says closing it fast is what makes a robot seem smart.', hint: 10 },
      { type: 'detail', q: 'What are the three steps of a feedback loop?',
        options: ['Start, stop, reset', 'Measure, compare, adjust', 'See, hear, touch', 'Click, echo, turn'],
        correct: 1, why: 'The passage lists the steps as measure, compare, adjust.', hint: 2 },
      { type: 'inference', q: 'If an ultrasonic echo took four thousandths of a second instead of two, the wall would be about',
        options: ['17 centimeters away', '34 centimeters away', '68 centimeters away', '343 meters away'],
        correct: 2, why: 'Twice the echo time means the sound traveled twice as far, so the wall is about 68 centimeters away.', hint: 8 }
    ] },

  { id: 'l4-court', level: 4, title: 'Nine Chairs', kinds: ['court', 'mayor'],
    text: [
      'A clerk at the Supreme Court of the United States spends the day with documents, but the rules behind those documents are what make the job matter.',
      'The Court has nine justices, a number set by Congress in 1869 and unchanged since.',
      'Each justice is appointed by the president, approved by the Senate, and serves for life, which is meant to free them from worrying about the next election.',
      'The Court\'s term begins on the first Monday in October.',
      'Thousands of cases are sent up each year, and the justices agree to hear only a small fraction, usually fewer than one hundred.',
      'They pick cases where lower courts disagree or where a big question about the Constitution needs an answer.',
      'The Court\'s greatest power is called judicial review: the ability to strike down a law that conflicts with the Constitution.',
      'That power is not written in the Constitution itself.',
      'The Court claimed it in 1803, in a case called Marbury v. Madison, and the other branches of government accepted it.',
      'Clerks read the arguments, trace older decisions, and draft notes for the justices.',
      'Nothing a clerk writes becomes law, but a careful clerk helps make sure that what does become law rests on reasons that can be checked.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['The Supreme Court\'s rules and powers shape how it decides which laws stand', 'Clerks make the laws', 'The Court hears every case sent to it', 'Justices are elected every four years'],
        correct: 0, why: 'The passage explains how the Court is set up, which cases it takes, and its power of judicial review.', hint: 6 },
      { type: 'detail', q: 'When does the Court\'s term begin?',
        options: ['The first Monday in January', 'The first Monday in October', 'July 4', 'The day after an election'],
        correct: 1, why: 'The passage says the term begins on the first Monday in October.', hint: 3 },
      { type: 'inference', q: 'Why do justices serve for life?',
        options: ['So they can earn more money', 'So they do not have to worry about winning the next election', 'Because no one else wants the job', 'Because the Constitution lists their names'],
        correct: 1, why: 'Life terms are meant to free justices from worrying about the next election.', hint: 2 }
    ] },

  { id: 'l4-frames', level: 4, title: 'Twenty-Four Pictures a Second', kinds: ['movie', 'game'],
    text: [
      'A movie is a trick played on the eye.',
      'Nothing on the screen actually moves.',
      'A film is a long row of still pictures, called frames, shown one after another so quickly that the brain blends them into motion.',
      'Standard films run at 24 frames per second, a speed the industry settled on in the 1920s, and most movies still use it today.',
      'Sound arrived in that same decade.',
      'The Jazz Singer, released in 1927, was the first feature film with scenes of talking and singing matched to the picture, and within a few years silent films were history.',
      'Making the sound convincing is a job of its own.',
      'Footsteps, a creaking door, and the rustle of a coat are usually recorded later by artists in a studio who watch the picture and perform each noise in time with it.',
      'They are called Foley artists, after Jack Foley, who pioneered the technique at Universal Studios.',
      'A Foley artist might crunch a bag of cornstarch to make the sound of walking on snow.',
      'A studio tour in Hollywood shows all of it: the cameras, the sets, and a room full of shoes and gravel where the sound of the world is faked, one step at a time.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Movies create motion and sound through clever tricks like frames and Foley work', 'The Jazz Singer was the best movie ever made', 'Cornstarch is used to make fake snow', 'Cameras are the most important part of a studio'],
        correct: 0, why: 'The passage opens by calling a movie a trick and then explains the tricks behind motion and sound.', hint: 0 },
      { type: 'detail', q: 'At how many frames per second do standard films run?',
        options: ['12', '24', '60', '100'],
        correct: 1, why: 'Standard films run at 24 frames per second.', hint: 3 },
      { type: 'inference', q: 'Why would a Foley artist crunch a bag of cornstarch?',
        options: ['To make fake snow for the set', 'Because it sounds like walking on snow', 'To feed the actors', 'To clean the microphones'],
        correct: 1, why: 'Foley artists perform sounds, and crunching cornstarch sounds like footsteps on snow.', hint: 9 }
    ] },

  { id: 'l4-vitals', level: 4, title: 'Four Numbers a Doctor Reads First', kinds: ['doctor', 'vet'],
    text: [
      'Before a doctor asks a single question, a nurse has usually written down four numbers.',
      'They are called vital signs, and they are a quick picture of how the body is running.',
      'The first is temperature.',
      'A healthy body stays close to 98.6 degrees Fahrenheit, or 37 degrees Celsius, and a rise of a degree or two is a sign that the body is fighting something.',
      'The second is pulse, the number of heartbeats in a minute.',
      'A resting adult\'s heart usually beats between 60 and 100 times a minute, moving about five liters of blood each minute, which is roughly all the blood in the body.',
      'The third is breathing rate, counted quietly while the patient thinks the nurse is doing something else, because people breathe differently when they know they are being watched.',
      'The fourth is blood pressure, written as two numbers such as 120 over 80.',
      'The top number is the pressure in the arteries when the heart squeezes; the bottom is the pressure when it rests between beats.',
      'None of these numbers names a disease.',
      'What they do is tell the doctor where to look, and whether to hurry.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Vital signs give doctors a quick picture of how the body is working', 'Fevers are dangerous', 'Nurses are sneaky', 'Blood pressure is the only important number'],
        correct: 0, why: 'The passage names the four vital signs and says together they tell the doctor where to look.', hint: 1 },
      { type: 'detail', q: 'About how much blood does a resting heart move each minute?',
        options: ['One cup', 'One liter', 'Five liters', 'Fifty liters'],
        correct: 2, why: 'The passage says the heart moves about five liters of blood each minute.', hint: 5 },
      { type: 'inference', q: 'Why does a nurse count breathing without telling the patient?',
        options: ['It is a secret test', 'People breathe differently when they know they are being watched', 'Breathing is hard to hear', 'The doctor wants a surprise'],
        correct: 1, why: 'The passage says people breathe differently when they know they are being watched.', hint: 6 }
    ] },

  // ---------------- LEVEL 5 ----------------
  { id: 'l5-breakeven', level: 5, title: 'The Break-Even Line', kinds: ['startup', 'toystore', 'stock'],
    text: [
      'Every founder of a new company eventually draws the same chart.',
      'On the left sit the costs that arrive whether or not anything sells: rent, insurance, software, the salary of the one person who keeps the lights on.',
      'These are fixed costs.',
      'Then there are costs that rise with every unit sold, such as materials, packaging, and shipping.',
      'These are variable costs.',
      'Imagine a small company that sells phone cases for 10 dollars each.',
      'Its fixed costs are 1,200 dollars a month, and each case costs 4 dollars to make and ship.',
      'Every sale therefore contributes 6 dollars toward the fixed costs.',
      'Divide 1,200 by 6 and you get 200: the company must sell 200 cases a month before it earns a single dollar of profit.',
      'That number is the break-even point.',
      'Sell 199 and the month is a loss; sell 201 and it is a gain.',
      'Founders use the chart to test ideas before spending money.',
      'Raising the price to 12 dollars drops the break-even point to 150 cases.',
      'Cutting the shipping cost by a dollar drops it to about 171.',
      'Investors often ask for this number before anything else, because a company that cannot name its break-even point does not yet know whether it has a business or a hobby.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['The break-even point tells a founder how many sales cover the fixed costs', 'Phone cases are a good business', 'Investors do not care about costs', 'Variable costs never change'],
        correct: 0, why: 'The passage defines fixed and variable costs and shows how they give the break-even point.', hint: 9 },
      { type: 'detail', q: 'In the example, how many cases must the company sell each month to break even at a $10 price?',
        options: ['120', '150', '200', '1,200'],
        correct: 2, why: '1,200 dollars of fixed costs divided by 6 dollars per sale is 200 cases.', hint: 8 },
      { type: 'inference', q: 'Why does raising the price to $12 lower the break-even point?',
        options: ['Fixed costs go down', 'Each sale contributes more toward the fixed costs, so fewer sales are needed', 'Shipping becomes free', 'Customers buy more'],
        correct: 1, why: 'At 12 dollars each sale contributes 8 dollars, and 1,200 divided by 8 is 150.', hint: 12 }
    ] },

  { id: 'l5-tuning', level: 5, title: 'Tuning to 440', kinds: ['orchestra', 'movie'],
    text: [
      'Before a concert, an orchestra of ninety musicians falls silent and listens to one note from the oboe.',
      'That note is A, played at a frequency of 440 vibrations per second, written as 440 hertz, and every other instrument tunes to it.',
      'The conductor depends on that shared pitch the way a builder depends on a level.',
      'Pitch is frequency.',
      'Sound is a wave of pressure moving through air, and the faster the wave vibrates, the higher the note we hear.',
      'Double the frequency, to 880 hertz, and you hear the same note A, one octave higher.',
      'Halve a string\'s length while keeping its tension the same, and its frequency doubles.',
      'That is why a cellist\'s fingers climb toward the bridge to play higher notes: the vibrating part of the string gets shorter.',
      'Because sound needs a medium to travel through, there is no sound in the vacuum of space, no matter how loud the rocket in the movie.',
      'The oboe gets the tuning job because its bright, steady tone cuts through the hall and cannot easily be adjusted on the spot, so the others adjust to it.',
      'When the tuning is right, a chord played by ninety people sounds like one enormous instrument.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Pitch is frequency, and an orchestra shares one frequency so it can play as one', 'Oboes are the loudest instruments', 'Cellos are hard to play', 'Space is silent because it is cold'],
        correct: 0, why: 'The passage explains pitch as frequency and why the whole orchestra tunes to a single note.', hint: 3 },
      { type: 'detail', q: 'At what frequency is the tuning note A played?',
        options: ['220 hertz', '440 hertz', '880 hertz', '1,000 hertz'],
        correct: 1, why: 'The tuning note is A at 440 hertz.', hint: 1 },
      { type: 'inference', q: 'If a string\'s vibrating length is cut in half, the note',
        options: ['drops one octave', 'stays the same', 'rises one octave', 'becomes silent'],
        correct: 2, why: 'Halving the length doubles the frequency, and doubling the frequency raises the note one octave.', hint: 6 }
    ] },

  { id: 'l5-citybudget', level: 5, title: 'Where a City\'s Money Comes From', kinds: ['mayor', 'court', 'architect'],
    text: [
      'A mayor does not print money, yet a city spends millions every year on streets, parks, police, and the library.',
      'Where does it come from?',
      'Most of it comes from taxes.',
      'Property tax is a yearly charge on the value of homes, shops, and land, and it is usually a city\'s largest and steadiest source.',
      'Sales tax adds a few cents to every dollar spent in stores, so it rises when the economy is strong and drops when people cut back.',
      'Fees are the third source: parking meters, building permits, water bills, and the fine on an overdue library book.',
      'State and federal governments also send grants for specific projects, such as a new bridge.',
      'Every year the mayor\'s office proposes a budget, a plan matching all that money against all that spending, and the city council votes on it.',
      'In most cities the budget must balance: the city cannot plan to spend more than it expects to collect.',
      'The budget has two halves.',
      'The operating budget pays for things that are used up this year, like salaries and fuel.',
      'The capital budget pays for things that last decades, like a fire station, which cities often pay for by borrowing and repaying over many years.',
      'Reading a city\'s budget is the fastest way to learn what it actually values.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['A city pays for its services mostly through taxes and fees, planned in a yearly budget', 'Mayors print money', 'Parking meters pay for everything', 'Cities never borrow money'],
        correct: 0, why: 'The passage lists where city money comes from and how the budget plans its use.', hint: 2 },
      { type: 'detail', q: 'Which source is usually a city\'s largest and steadiest?',
        options: ['Sales tax', 'Property tax', 'Parking fees', 'Federal grants'],
        correct: 1, why: 'The passage calls property tax a city\'s largest and steadiest source.', hint: 3 },
      { type: 'vocab', q: 'In this passage, the capital budget pays for',
        options: ['things used up this year, like fuel', 'things that last decades, like a fire station', 'the mayor\'s salary', 'the state capital'],
        correct: 1, why: 'The capital budget pays for long-lasting things such as a fire station.', hint: 11 }
    ] },

  { id: 'l5-maillard', level: 5, title: 'Why Brown Tastes Better', kinds: ['chef', 'bakery'],
    text: [
      'Ask a chef at a famous restaurant what separates a good steak from a great one, and the answer is usually a word from chemistry: Maillard.',
      'The Maillard reaction happens when the proteins and sugars on the surface of food meet high heat, roughly 285 degrees Fahrenheit and above.',
      'The molecules rearrange into hundreds of new compounds, and those compounds are the brown crust on a steak, the golden skin of a roast chicken, and the toasted edge of bread.',
      'A pan that is too cool never gets there.',
      'A wet surface never gets there either, because water boils at 212 degrees and keeps the surface below the reaction temperature until it evaporates, which is why chefs pat meat dry before it hits the pan.',
      'The reaction is named for Louis-Camille Maillard, a French scientist who described it in 1912 while studying something else entirely.',
      'It is often confused with caramelization, which is sugar alone breaking down under heat, with no protein involved.',
      'One famous kitchen belief does not survive the chemistry.',
      'Searing meat does not seal in its juices; a seared steak loses about as much moisture as an unseared one.',
      'What searing adds is flavor, which, for most people, is a fair trade.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['The Maillard reaction creates the browning and flavor chefs prize', 'Steak should always be cooked wet', 'Caramelization and Maillard are the same thing', 'Searing seals in juices'],
        correct: 0, why: 'The passage explains the reaction behind browning, what it needs, and what it does and does not do.', hint: 1 },
      { type: 'detail', q: 'Who is the reaction named after?',
        options: ['A French chef', 'Louis-Camille Maillard, a French scientist', 'A restaurant in Paris', 'An American butcher'],
        correct: 1, why: 'The passage names Louis-Camille Maillard, a French scientist who described it in 1912.', hint: 5 },
      { type: 'inference', q: 'Why do chefs pat meat dry before cooking it?',
        options: ['To make it lighter', 'So the surface can get hot enough to brown instead of staying at the boiling point of water', 'To remove salt', 'To keep the pan clean'],
        correct: 1, why: 'Water keeps the surface at 212 degrees, below the browning temperature, until it evaporates.', hint: 4 }
    ] },

  { id: 'l5-flight', level: 5, title: 'Four Forces at 35,000 Feet', kinds: ['pilot', 'space'],
    text: [
      'An airline pilot cruising at 35,000 feet is balancing four forces, and the whole flight is a negotiation among them.',
      'Weight pulls the plane toward Earth.',
      'Lift pushes it up.',
      'Thrust from the engines drives it forward, and drag, the resistance of the air, holds it back.',
      'Lift comes from the wings.',
      'A wing is shaped and tilted so that it deflects air downward as it slices through, and by Newton\'s third law the air pushes the wing upward in return.',
      'The air flowing over the curved top of the wing also moves faster and presses less, so the higher pressure below the wing adds to the push.',
      'Both effects are part of the same story, and both grow stronger as the plane speeds up.',
      'Jets climb to around 35,000 feet because the air up there is far thinner.',
      'Thin air means less drag, so the engines burn less fuel to hold the same speed, even though they must work harder to find enough oxygen.',
      'It is a long way from Kitty Hawk, North Carolina, where Orville Wright made the first controlled powered flight on December 17, 1903.',
      'That flight lasted 12 seconds and covered 120 feet, less than the wingspan of a large modern jet, which crosses the country on the same four forces.'
    ],
    qs: [
      { type: 'main', q: 'What is the main idea of the passage?',
        options: ['Flight is a balance of four forces, with lift coming from the wings', 'Pilots mostly watch the fuel gauge', 'Thin air makes planes fall', 'The Wright brothers invented the jet engine'],
        correct: 0, why: 'The passage names the four forces and spends most of its time on how wings make lift.', hint: 0 },
      { type: 'detail', q: 'How long did the first powered flight at Kitty Hawk last?',
        options: ['12 seconds', '2 minutes', '12 minutes', '1 hour'],
        correct: 0, why: 'The passage says the flight lasted 12 seconds and covered 120 feet.', hint: 11 },
      { type: 'inference', q: 'Why do jets burn less fuel at 35,000 feet?',
        options: ['The engines turn off', 'Thin air creates less drag', 'Gravity is weaker', 'The wings are bigger up there'],
        correct: 1, why: 'Thin air means less drag, so the engines need less fuel to hold the same speed.', hint: 9 }
    ] },

  { id: 'l5-gameloop', level: 5, title: 'Sixty Times a Second', kinds: ['game', 'robot', 'startup'],
    text: [
      'A video game is a loop that never rests.',
      'Programmers at a game studio call it the game loop, and it has three beats: read the input, update the world, draw the frame.',
      'Read the input means checking which buttons are pressed or where a finger touched the screen.',
      'Update the world means moving every character, checking every collision, and applying gravity to everything that falls.',
      'Draw the frame means painting the whole picture again.',
      'Then it starts over.',
      'A smooth game runs this loop sixty times a second, which gives each pass about sixteen milliseconds, less time than a blink.',
      'If the update takes too long, frames are skipped and the game stutters, so programmers spend weeks shaving milliseconds off code.',
      'The loop is only half the job.',
      'The other half is playtesting, watching real people play and writing down where they get confused, bored, or stuck.',
      'Minecraft began as one programmer\'s side project in 2009; Markus Persson released early versions, listened to players, and kept changing the game for two years before calling it finished in 2011.',
      'In 2014, Microsoft bought the company that made it for 2.5 billion dollars.',
      'A game studio sells fun, but it builds that fun out of loops, lists, and patient notes.'
    ],
    qs: [
      { type: 'main', q: 'What is this passage mostly about?',
        options: ['Games are built from a fast repeating loop and careful playtesting', 'Minecraft is the best game ever made', 'Programmers hate milliseconds', 'Microsoft invented video games'],
        correct: 0, why: 'The passage explains the game loop, then says playtesting is the other half of the job.', hint: 1 },
      { type: 'detail', q: 'About how much time does each pass of the loop get at sixty frames a second?',
        options: ['16 milliseconds', '60 milliseconds', '1 second', '16 seconds'],
        correct: 0, why: 'Sixty passes a second gives each pass about sixteen milliseconds.', hint: 6 },
      { type: 'vocab', q: 'In this passage, playtesting means',
        options: ['playing games instead of working', 'watching real people play to find where they get stuck or bored', 'testing the batteries', 'drawing the frame'],
        correct: 1, why: 'Playtesting is watching real people play and noting where they get confused, bored, or stuck.', hint: 9 }
    ] }
];

BT.registerChecks('passages', [
  { name: 'at least 30 passages, 6+ per level 1..5', fn: function () {
    var P = BT.data.passages, counts = {};
    P.forEach(function (p) { counts[p.level] = (counts[p.level] || 0) + 1; });
    return P.length >= 30 && [1, 2, 3, 4, 5].every(function (l) { return counts[l] >= 6; });
  } },
  { name: 'unique ids', fn: function () {
    var ids = BT.data.passages.map(function (p) { return p.id; });
    return new Set(ids).size === ids.length;
  } },
  { name: 'every passage 90-220 words with title and sentences', fn: function () {
    return BT.data.passages.every(function (p) {
      var n = p.text.join(' ').split(/\s+/).filter(Boolean).length;
      if (!(n >= 90 && n <= 220)) throw new Error(p.id + ' has ' + n + ' words');
      return typeof p.title === 'string' && p.title.length > 0 && Array.isArray(p.text) && p.text.length > 2 && p.level >= 1 && p.level <= 5;
    });
  } },
  { name: 'every passage has 3 questions, 4 unique options, one correct, a why and a valid hint', fn: function () {
    return BT.data.passages.every(function (p) {
      if (p.qs.length !== 3) throw new Error(p.id + ' has ' + p.qs.length + ' questions');
      return p.qs.every(function (q, i) {
        var ok = typeof q.q === 'string' && q.q.length > 0 && Array.isArray(q.options) && q.options.length === 4 &&
          new Set(q.options).size === 4 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4 &&
          typeof q.why === 'string' && q.why.length > 0 && Number.isInteger(q.hint) && q.hint >= 0 && q.hint < p.text.length;
        if (!ok) throw new Error(p.id + ' question ' + (i + 1) + ' is malformed');
        return true;
      });
    });
  } },
  { name: 'each passage asks a main idea, a detail, and an inference or vocabulary question', fn: function () {
    return BT.data.passages.every(function (p) {
      var t = p.qs.map(function (q) { return q.type; });
      return t.indexOf('main') >= 0 && t.indexOf('detail') >= 0 && (t.indexOf('inference') >= 0 || t.indexOf('vocab') >= 0);
    });
  } }
]);
