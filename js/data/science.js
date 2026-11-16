// BT.data.science: the science question bank (grade 4-7). Used by js/rounds/science.js.
// Item: {id, lvl 1..5, topic, q, opts[4], a (index of the correct option), why, fig?}
// Authored with the correct option FIRST (a:0); the round shuffles the options on screen.
// fig names a small inline SVG drawn in js/rounds/science.js (optional).
BT.data = BT.data || {};
(function () {
  'use strict';
  var items = [];
  function I(id, lvl, topic, q, opts, why, fig) {
    var it = { id: 'sci-' + id, lvl: lvl, topic: topic, q: q, opts: opts, a: 0, why: why };
    if (fig) it.fig = fig;
    items.push(it);
  }

  // ---------- life ----------
  I('life-01', 1, 'life', 'Which part of a plant makes food using sunlight?',
    ['Leaves', 'Roots', 'Stem', 'Flower'],
    'Leaves hold chlorophyll, the green pigment that captures sunlight. That is where photosynthesis makes the plant\'s sugar.', 'plant');
  I('life-02', 1, 'life', 'What do plants take in from the air to make their food?',
    ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'],
    'Photosynthesis combines carbon dioxide from the air with water, using light energy, to make sugar. Oxygen is what plants give off.');
  I('life-03', 1, 'life', 'Which of these animals is a mammal?',
    ['Dolphin', 'Shark', 'Frog', 'Penguin'],
    'Dolphins breathe air, are born live and drink their mother\'s milk. Sharks are fish, frogs are amphibians and penguins are birds.');
  I('life-04', 2, 'life', 'What is the main job of a plant\'s roots?',
    ['Take in water and minerals and hold the plant in place', 'Make seeds', 'Capture sunlight', 'Attract bees'],
    'Roots soak up water and minerals from the soil and anchor the plant. Leaves catch light; flowers make seeds and attract bees.', 'plant');
  I('life-05', 2, 'life', 'An animal that eats only plants is called a...',
    ['herbivore', 'carnivore', 'omnivore', 'decomposer'],
    'Herbi- means plant. Carnivores eat meat, omnivores eat both, and decomposers break down dead things.');
  I('life-06', 2, 'life', 'Which animal is cold-blooded?',
    ['Lizard', 'Dog', 'Eagle', 'Whale'],
    'Reptiles like lizards take their body temperature from their surroundings, which is why they bask in the sun. Mammals and birds make their own heat.');
  I('life-07', 3, 'life', 'What is the basic unit of all living things?',
    ['The cell', 'The atom', 'The organ', 'The bone'],
    'Every living thing is made of one or more cells. Atoms make up everything, living or not; organs are made of many cells.');
  I('life-08', 3, 'life', 'Which part of a cell holds the DNA, the cell\'s instructions?',
    ['Nucleus', 'Cell wall', 'Cytoplasm', 'Cell membrane'],
    'The nucleus is the control center and stores the DNA. The membrane is the outer skin, the cytoplasm is the jelly inside, and the wall is a plant cell\'s stiff outer layer.', 'cell');
  I('life-09', 3, 'life', 'What is the correct order of a butterfly\'s life cycle?',
    ['Egg → caterpillar → chrysalis → butterfly', 'Egg → butterfly → caterpillar → chrysalis', 'Caterpillar → egg → butterfly → chrysalis', 'Chrysalis → egg → caterpillar → butterfly'],
    'A butterfly hatches from an egg as a caterpillar (larva), wraps itself in a chrysalis (pupa), and comes out as an adult.');
  I('life-10', 4, 'life', 'In which part of a plant cell does photosynthesis happen?',
    ['Chloroplast', 'Mitochondrion', 'Nucleus', 'Ribosome'],
    'Chloroplasts hold the chlorophyll that captures light. Mitochondria release energy from sugar, the nucleus holds DNA, and ribosomes build proteins.', 'cell');
  I('life-11', 4, 'life', 'Which structure do plant cells have that animal cells do not?',
    ['A cell wall', 'A nucleus', 'A cell membrane', 'Cytoplasm'],
    'Plant cells have a stiff cell wall outside the membrane that helps the plant stand up. Both kinds of cells have a nucleus, membrane and cytoplasm.', 'cell');
  I('life-12', 4, 'life', 'What do mitochondria do for a cell?',
    ['Release energy from food', 'Store the DNA', 'Make the cell green', 'Control what enters the cell'],
    'Mitochondria are the cell\'s power plants: they break down sugar to release energy the cell can use.');
  I('life-13', 5, 'life', 'Which of these is an inherited trait?',
    ['Eye color', 'Speaking Spanish', 'A scar on your knee', 'Knowing how to ride a bike'],
    'Inherited traits are passed down through genes from parents. Languages, scars and skills are acquired during life.');
  I('life-14', 5, 'life', 'Why do children look like their parents but not exactly like them?',
    ['They get half their genes from each parent, mixed in a new way', 'They copy what their parents do', 'They eat the same food', 'Genes change every year'],
    'Each parent passes on half of their genes. The combination is new, so a child shares traits with both parents without matching either one.');
  I('life-15', 5, 'life', 'A bat\'s wing and a human arm have the same set of bones. What does that suggest?',
    ['They share a common ancestor', 'Bats can learn to grab things', 'Humans used to fly', 'Bones are placed at random'],
    'Matching bone patterns in different animals are evidence that they descended from the same ancestor long ago, and the limbs changed for different jobs.');
  I('life-16', 2, 'life', 'What do we call animals with a backbone?',
    ['Vertebrates', 'Invertebrates', 'Insects', 'Amphibians'],
    'Vertebrates have a spine: fish, amphibians, reptiles, birds and mammals. Insects, worms and jellyfish are invertebrates.');
  I('life-17', 1, 'life', 'What do seeds need to start growing (germinate)?',
    ['Water and warmth', 'Sunlight only', 'Wind', 'Salt'],
    'A seed soaks up water and, if it is warm enough, the baby plant inside starts to grow. Most seeds do not need light until the shoot reaches the surface.');

  // ---------- earth ----------
  I('earth-01', 1, 'earth', 'Which layer of Earth do we live on?',
    ['The crust', 'The core', 'The mantle', 'The atmosphere'],
    'The crust is the thin rocky outer layer. Below it is the hot mantle, then the outer and inner core. The atmosphere is the air above us.', 'layers');
  I('earth-02', 1, 'earth', 'What causes day and night?',
    ['Earth spinning on its axis', 'Earth orbiting the Sun', 'The Moon blocking the Sun', 'Clouds covering the sky'],
    'Earth turns all the way around once every 24 hours. The side facing the Sun has day; the side facing away has night.');
  I('earth-03', 2, 'earth', 'Rock that forms when melted rock (magma or lava) cools is called...',
    ['igneous', 'sedimentary', 'metamorphic', 'fossil'],
    'Igneous means "from fire." Sedimentary rock forms from layers of pressed sediment, and metamorphic rock is changed by heat and pressure.');
  I('earth-04', 2, 'earth', 'Which kind of rock most often holds fossils?',
    ['Sedimentary', 'Igneous', 'Metamorphic', 'Volcanic glass'],
    'Sedimentary rock forms from layers of mud and sand that bury plants and animals. Melted or squeezed rock destroys fossils.');
  I('earth-05', 2, 'earth', 'Water, wind and ice breaking rock into smaller pieces is called...',
    ['weathering', 'erosion', 'deposition', 'melting'],
    'Weathering breaks rock apart. Erosion is the carrying away of the pieces, and deposition is dropping them somewhere new.');
  I('earth-06', 3, 'earth', 'Where do most earthquakes happen?',
    ['Along the edges of tectonic plates', 'In the middle of continents', 'Only under the oceans', 'Near the equator'],
    'Earth\'s crust is broken into plates that slowly move. Where they grind past, push into or pull away from each other, the rock snaps and the ground shakes.');
  I('earth-07', 3, 'earth', 'Which layer of Earth is the hottest?',
    ['The inner core', 'The crust', 'The upper mantle', 'The ocean floor'],
    'The inner core is a ball of solid iron and nickel about as hot as the surface of the Sun. Heat drops as you move out toward the crust.', 'layers');
  I('earth-08', 3, 'earth', 'Soil is made mostly of...',
    ['broken-down rock mixed with decayed plants and animals', 'pure sand', 'clay only', 'volcanic ash'],
    'Weathered rock gives soil its minerals, and rotted leaves, roots and creatures add the dark humus that feeds plants.');
  I('earth-09', 4, 'earth', 'A river slows down where it meets the sea and drops the sand and mud it carried. That is called...',
    ['deposition', 'weathering', 'condensation', 'subduction'],
    'Deposition is the laying down of sediment. Over time it builds deltas, like the one at the mouth of the Mississippi.');
  I('earth-10', 4, 'earth', 'Why does the Northern Hemisphere have winter while the Southern Hemisphere has summer?',
    ['Earth\'s axis is tilted', 'Earth is farther from the Sun in winter', 'The Moon blocks sunlight', 'The Sun gets cooler'],
    'Earth is tilted about 23.5 degrees. The half tilted toward the Sun gets more direct light and longer days; the other half gets less.');
  I('earth-11', 5, 'earth', 'Which fossil fuel formed from ancient plants buried in swamps?',
    ['Coal', 'Granite', 'Uranium', 'Salt'],
    'Coal is the squeezed, heated remains of plants that grew in swamps hundreds of millions of years ago. Granite is igneous rock and uranium is a metal.');
  I('earth-12', 5, 'earth', 'How did the Hawaiian Islands form?',
    ['From a hot spot of rising magma under the moving Pacific plate', 'From two continents colliding', 'From one giant earthquake', 'From coral piling up'],
    'A plume of hot rock rises under the Pacific plate. As the plate slides over it, volcano after volcano builds up from the sea floor, making a chain of islands.');
  I('earth-13', 1, 'earth', 'What is a volcano?',
    ['An opening where melted rock, ash and gas come out of Earth', 'A very tall hill of ice', 'A deep hole dug by people', 'A kind of thunderstorm'],
    'Magma from inside Earth pushes up through a crack and erupts as lava, ash and gas. The cooled lava builds the mountain shape.');
  I('earth-14', 4, 'earth', 'The Grand Canyon was carved mostly by...',
    ['the Colorado River cutting down through rock for millions of years', 'an earthquake splitting the ground', 'glaciers', 'wind alone'],
    'Flowing water carries sand and gravel that scrape the rock. Over about six million years the Colorado River cut a canyon more than a mile deep.');

  // ---------- physical ----------
  I('phys-01', 1, 'physical', 'Which of these makes its own light?',
    ['The Sun', 'The Moon', 'A mirror', 'A window'],
    'The Sun is a star that shines on its own. The Moon, a mirror and a window only reflect or let through light from somewhere else.');
  I('phys-02', 1, 'physical', 'A magnet pulls hardest on which material?',
    ['Iron', 'Wood', 'Plastic', 'Aluminum'],
    'Magnets attract iron (and steel, which is mostly iron), nickel and cobalt. Wood, plastic and aluminum are not magnetic.', 'magnet');
  I('phys-03', 1, 'physical', 'Sound is made by...',
    ['vibrations', 'light', 'heat', 'magnets'],
    'Anything that makes sound is shaking back and forth. The vibrations push the air in waves that reach your ears.');
  I('phys-04', 2, 'physical', 'What is a force?',
    ['A push or a pull', 'Only how fast something goes', 'How heavy something is', 'A kind of heat'],
    'Forces push or pull on objects and can start, stop, speed up, slow down or turn them.');
  I('phys-05', 2, 'physical', 'Which material lets electricity flow through it easily?',
    ['Copper', 'Rubber', 'Glass', 'Wood'],
    'Metals like copper are conductors, which is why wires are made of them. Rubber, glass and dry wood are insulators that block the flow.', 'circuit');
  I('phys-06', 2, 'physical', 'Friction...',
    ['slows moving things down and makes heat', 'makes things lighter', 'only happens in water', 'pulls things toward the ground'],
    'When two surfaces rub, friction resists the motion and turns some of the movement into heat. Rub your hands together to feel it.');
  I('phys-07', 3, 'physical', 'Gravity pulls...',
    ['every object toward every other object, strongest near big masses', 'only on metal', 'only on things that are already falling', 'sideways'],
    'Everything with mass pulls on everything else. Earth is so massive that its pull is what we feel as weight.');
  I('phys-08', 3, 'physical', 'A bulb lights up in a circuit because...',
    ['electricity flows in a closed loop from the battery, through the bulb and back', 'the wire gets hot', 'the switch is open', 'the bulb stores power'],
    'Current needs a complete path. Open the switch and the loop is broken, so the current stops and the bulb goes dark.', 'circuit');
  I('phys-09', 3, 'physical', 'Which of these is a chemical change?',
    ['Baking a cake', 'Melting ice', 'Tearing paper', 'Dissolving sugar in water'],
    'Baking makes new substances you cannot turn back into batter. Melting, tearing and dissolving change the form but not the material.');
  I('phys-10', 4, 'physical', 'A prism splits white light into a rainbow. Which color bends the most?',
    ['Violet', 'Red', 'Green', 'Yellow'],
    'Shorter wavelengths bend more when light passes through glass. Violet bends the most and red the least, which spreads the colors apart.');
  I('phys-11', 4, 'physical', 'A delivery van drives 150 miles in 3 hours. What is its average speed?',
    ['50 miles per hour', '45 miles per hour', '153 miles per hour', '450 miles per hour'],
    'Speed = distance ÷ time. 150 miles ÷ 3 hours = 50 miles per hour.');
  I('phys-12', 4, 'physical', 'Why does a straw look bent where it enters a glass of water?',
    ['Light bends (refracts) when it passes between water and air', 'The straw softens in water', 'Water magnifies everything', 'The glass is curved'],
    'Light travels at a different speed in water than in air, so its path bends at the surface. Your eye traces the bent light to the wrong spot.');
  I('phys-13', 4, 'physical', 'A moving object keeps moving in a straight line until a force acts on it. That tendency is called...',
    ['inertia', 'gravity', 'magnetism', 'buoyancy'],
    'Inertia is Newton\'s first law: objects keep doing what they are doing unless a force changes it. That is why you lurch forward when a car brakes.');
  I('phys-14', 4, 'physical', 'Which has the most kinetic (motion) energy?',
    ['A truck moving at 30 mph', 'A bicycle moving at 30 mph', 'A parked truck', 'A parked bicycle'],
    'Kinetic energy grows with mass and with speed. At the same speed the heavier truck has far more; parked things have none.');
  I('phys-15', 5, 'physical', 'A metal spoon in hot soup gets hot at the handle. Heat moved by...',
    ['conduction', 'convection', 'radiation', 'reflection'],
    'Conduction is heat passing from particle to particle through a solid. Metals conduct well, which is why the handle warms up.');
  I('phys-16', 5, 'physical', 'Warm air rising and cool air sinking moves heat by...',
    ['convection', 'conduction', 'radiation', 'friction'],
    'Convection is heat carried by a moving fluid (liquid or gas). It drives ocean currents, weather and the bubbling in a pot.');
  I('phys-17', 5, 'physical', 'A 10 kg box and a 1 kg box are dropped together with no air to slow them. Which lands first?',
    ['They land at the same time', 'The 10 kg box', 'The 1 kg box', 'It depends on their color'],
    'Gravity speeds up every object at the same rate, about 9.8 m/s each second, no matter its mass. Only air resistance makes light things fall slower.');
  I('phys-18', 5, 'physical', 'Density = mass ÷ volume. A block has a mass of 200 grams and a volume of 100 cm³. What is its density?',
    ['2 g/cm³', '0.5 g/cm³', '20,000 g/cm³', '100 g/cm³'],
    '200 g ÷ 100 cm³ = 2 g/cm³. That is twice the density of water, so the block would sink.');
  I('phys-19', 5, 'physical', 'Why does ice float on water?',
    ['Ice is less dense than liquid water', 'Ice always weighs less than water', 'Cold things rise', 'Water pushes up on everything equally'],
    'When water freezes, its molecules lock into a pattern with extra space, so ice takes up more room for the same mass. Lower density means it floats.');
  I('phys-20', 2, 'physical', 'Which of these is a form of energy?',
    ['Heat', 'A rock', 'A ruler', 'Air'],
    'Heat, light, sound, motion and electricity are forms of energy. Rocks, rulers and air are matter, though they can carry energy.');
  I('phys-21', 3, 'physical', 'Two magnets push apart when you bring them together. Which ends are facing?',
    ['Two like poles (north to north or south to south)', 'A north and a south pole', 'The middles', 'It does not matter'],
    'Opposite poles attract and like poles repel. Flip one magnet over and the same two magnets will snap together.', 'magnet');

  // ---------- weather ----------
  I('wx-01', 1, 'weather', 'Which tool measures temperature?',
    ['A thermometer', 'A barometer', 'An anemometer', 'A ruler'],
    'A thermometer measures how hot or cold it is. A barometer measures air pressure and an anemometer measures wind speed.', 'thermo');
  I('wx-02', 1, 'weather', 'Clouds are made of...',
    ['tiny water droplets or ice crystals', 'smoke', 'cotton', 'pure oxygen'],
    'Water vapor in rising air cools and condenses on specks of dust into billions of tiny droplets or ice crystals. That is a cloud.');
  I('wx-03', 2, 'weather', 'Water from a lake turning into water vapor is called...',
    ['evaporation', 'condensation', 'precipitation', 'freezing'],
    'The Sun warms the lake and liquid water escapes as invisible vapor. That is the first step of the water cycle.', 'watercycle');
  I('wx-04', 2, 'weather', 'Rain, snow, sleet and hail are all forms of...',
    ['precipitation', 'evaporation', 'condensation', 'humidity'],
    'Precipitation is any water that falls from clouds. Which kind falls depends on the temperature of the air it falls through.', 'watercycle');
  I('wx-05', 2, 'weather', 'An anemometer measures...',
    ['wind speed', 'rainfall', 'air pressure', 'humidity'],
    'An anemometer\'s cups spin in the wind; the faster they turn, the stronger the wind. A rain gauge measures rainfall.');
  I('wx-06', 3, 'weather', 'How does dew form on grass overnight?',
    ['Water vapor in the air condenses on the cool grass', 'It rains lightly', 'The grass sweats', 'Water evaporates from the soil'],
    'At night the ground cools. Air touching the cold grass cools too and can no longer hold all its vapor, so droplets form.');
  I('wx-07', 3, 'weather', 'Which cloud type brings thunderstorms?',
    ['Cumulonimbus', 'Cirrus', 'Stratus', 'Fog'],
    'Cumulonimbus clouds are tall towers of rising air that can reach 10 miles high. Cirrus are thin and wispy; stratus are flat gray layers.');
  I('wx-08', 3, 'weather', 'What causes wind?',
    ['Differences in air pressure', 'Trees swaying', 'The Moon\'s pull', 'Clouds moving'],
    'Air flows from areas of high pressure to areas of low pressure. The bigger the difference, the stronger the wind.');
  I('wx-09', 4, 'weather', 'A barometer reading that drops quickly usually means...',
    ['a storm is on the way', 'clear skies ahead', 'it will get colder but stay dry', 'fog is forming'],
    'Storms are areas of low pressure. When pressure falls fast, a low is approaching, and with it clouds, wind and rain.');
  I('wx-10', 4, 'weather', 'Why is it colder at the top of a tall mountain than at the bottom?',
    ['Air is thinner up high and air cools as it rises and expands', 'It is farther from Earth\'s hot core', 'The snow makes it cold', 'Clouds block the sun'],
    'Air pressure drops with height. Rising air spreads out and cools about 3.5°F for every 1,000 feet, which is why Denver\'s mountains hold snow.');
  I('wx-11', 4, 'weather', 'Where do hurricanes get their energy?',
    ['Warm ocean water', 'Cold mountain air', 'Earthquakes', 'The Moon'],
    'Hurricanes form over oceans warmer than about 80°F. Evaporating water rises and condenses, releasing heat that powers the storm. Over land they weaken.');
  I('wx-12', 5, 'weather', 'Which sentence describes climate rather than weather?',
    ['Phoenix is hot and dry most of the year', 'It is 72°F right now', 'Rain is expected tomorrow', 'A storm hit on Tuesday'],
    'Weather is what happens today or this week. Climate is the average pattern over many years in a place.');
  I('wx-13', 5, 'weather', 'In the Northern Hemisphere, hurricanes spin...',
    ['counterclockwise', 'clockwise', 'in straight lines', 'in no set direction'],
    'Earth\'s rotation bends moving air (the Coriolis effect). North of the equator storms turn counterclockwise; south of it, clockwise.');
  I('wx-14', 1, 'weather', 'What is the water cycle step where vapor cools and forms clouds?',
    ['Condensation', 'Evaporation', 'Precipitation', 'Collection'],
    'Rising vapor cools and condenses into droplets, making clouds. When the droplets grow heavy they fall as precipitation.', 'watercycle');
  I('wx-15', 5, 'weather', 'Why does Seattle get so much rain while Spokane, east of the Cascade mountains, is much drier?',
    ['Moist air from the ocean rises over the mountains and drops its rain on the west side', 'Spokane is closer to the equator', 'Seattle is below sea level', 'The mountains make clouds disappear'],
    'This is the rain-shadow effect. Air forced up a mountain cools and rains out; the air coming down the far side is dry.');

  // ---------- space ----------
  I('space-01', 1, 'space', 'What is at the center of our solar system?',
    ['The Sun', 'Earth', 'The Moon', 'Jupiter'],
    'Every planet, including Earth, orbits the Sun. The Moon orbits Earth.', 'solar');
  I('space-02', 1, 'space', 'Why does the Moon shine at night?',
    ['It reflects light from the Sun', 'It burns like a fire', 'It is made of glowing ice', 'It has lights inside'],
    'The Moon makes no light of its own. We see the part of it that the Sun is lighting up.');
  I('space-03', 2, 'space', 'Which planet is closest to the Sun?',
    ['Mercury', 'Venus', 'Earth', 'Mars'],
    'The order from the Sun is Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.', 'solar');
  I('space-04', 2, 'space', 'How long does Earth take to go once around the Sun?',
    ['About 365 days', '24 hours', 'About 30 days', '7 days'],
    'One trip around the Sun is one year, about 365¼ days. One spin on its axis is one day; the Moon takes about a month to orbit Earth.');
  I('space-05', 2, 'space', 'Which is the largest planet in our solar system?',
    ['Jupiter', 'Saturn', 'Earth', 'Neptune'],
    'Jupiter is so big that more than 1,300 Earths could fit inside it. Saturn is second largest.', 'solar');
  I('space-06', 3, 'space', 'Which planet is called the Red Planet?',
    ['Mars', 'Venus', 'Jupiter', 'Mercury'],
    'Mars looks red because its soil is full of rusted iron. Rovers like Perseverance are exploring it now.');
  I('space-07', 3, 'space', 'What causes the Moon\'s phases?',
    ['We see different amounts of the Moon\'s sunlit half as it orbits Earth', 'Earth\'s shadow covers part of the Moon', 'Clouds hide part of the Moon', 'The Moon changes shape'],
    'Half the Moon is always lit by the Sun. As it circles Earth over about 29.5 days we see that lit half from different angles, from a thin crescent to full.', 'moon');
  I('space-08', 3, 'space', 'A solar eclipse happens when...',
    ['the Moon passes between the Sun and Earth', 'Earth passes between the Sun and the Moon', 'the Sun turns off for a moment', 'Mars blocks the Sun'],
    'The Moon\'s shadow falls on Earth and blocks the Sun for a few minutes. When Earth\'s shadow falls on the Moon instead, that is a lunar eclipse.');
  I('space-09', 4, 'space', 'The Sun is a...',
    ['star', 'planet', 'comet', 'moon'],
    'The Sun is a medium-sized star, a huge ball of hot gas making energy by fusing hydrogen into helium. It only looks bigger than other stars because it is close.');
  I('space-10', 4, 'space', 'Why do the stars seem to move across the sky during the night?',
    ['Earth is rotating', 'The stars orbit Earth', 'The stars drift in the wind', 'The Moon pushes them'],
    'The stars stay put; Earth turns under them. That is the same reason the Sun seems to rise and set.');
  I('space-11', 4, 'space', 'What keeps the planets in orbit around the Sun?',
    ['The Sun\'s gravity', 'Magnetism', 'Solar wind', 'Air pressure'],
    'The Sun\'s enormous mass pulls on the planets. They move fast enough sideways that they keep falling around the Sun instead of into it.');
  I('space-12', 5, 'space', 'About how long does sunlight take to reach Earth?',
    ['About 8 minutes', 'About 8 seconds', 'About 8 hours', 'About 8 days'],
    'Light travels about 186,000 miles per second and the Sun is about 93 million miles away. 93,000,000 ÷ 186,000 ≈ 500 seconds, about 8 minutes.');
  I('space-13', 5, 'space', 'A light-year is a unit of...',
    ['distance', 'time', 'brightness', 'speed'],
    'A light-year is how far light travels in one year, about 6 trillion miles. Astronomers use it because space is too big for miles.');
  I('space-14', 5, 'space', 'Why do astronauts float inside the space station?',
    ['They are falling around Earth together with the station', 'There is no gravity in space', 'There is no air', 'The station has magnets'],
    'Gravity up there is still about 90% as strong as on the ground. The station is falling toward Earth but moving so fast sideways that it keeps missing. Falling together feels like floating.');
  I('space-15', 2, 'space', 'How many planets are in our solar system?',
    ['8', '9', '7', '12'],
    'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Pluto was reclassified as a dwarf planet in 2006.', 'solar');
  I('space-16', 1, 'space', 'What is the Moon?',
    ['A rocky ball that orbits Earth', 'A star', 'A planet that orbits the Sun', 'A cloud of gas'],
    'The Moon is Earth\'s natural satellite, about a quarter of Earth\'s width, and takes about a month to orbit us.');
  I('space-17', 4, 'space', 'Which planet has the famous rings you can see with a small telescope?',
    ['Saturn', 'Mars', 'Venus', 'Mercury'],
    'Saturn\'s rings are made of billions of chunks of ice and rock. Jupiter, Uranus and Neptune have faint rings too, but Saturn\'s are the showstoppers.', 'solar');

  // ---------- human body ----------
  I('body-01', 1, 'body', 'Which organ pumps blood around the body?',
    ['The heart', 'The lungs', 'The stomach', 'The brain'],
    'The heart is a muscle that squeezes about 100,000 times a day, pushing blood through the vessels to every part of you.', 'heart');
  I('body-02', 1, 'body', 'What does the skeleton do?',
    ['Supports and protects the body', 'Digests food', 'Pumps blood', 'Makes you breathe'],
    'Bones hold you up, give muscles something to pull on, and protect soft organs: the skull guards the brain and the ribs guard the heart and lungs.');
  I('body-03', 2, 'body', 'Which organ takes oxygen from the air you breathe?',
    ['The lungs', 'The heart', 'The liver', 'The kidneys'],
    'Air fills millions of tiny sacs in the lungs. Oxygen passes into the blood there, and carbon dioxide passes out to be breathed away.');
  I('body-04', 2, 'body', 'How many bones does an adult human have?',
    ['206', '100', '500', '52'],
    'Adults have 206 bones. Babies are born with about 270 soft bones, and many of them fuse together as you grow.');
  I('body-05', 2, 'body', 'Where does digestion begin?',
    ['In the mouth', 'In the stomach', 'In the small intestine', 'In the liver'],
    'Chewing breaks food into pieces and saliva starts to break down starches before you even swallow.');
  I('body-06', 3, 'body', 'Which part of the blood carries oxygen?',
    ['Red blood cells', 'White blood cells', 'Plasma', 'Platelets'],
    'Red blood cells are packed with hemoglobin, which grabs oxygen in the lungs and releases it to the body. White cells fight germs; platelets help clotting.');
  I('body-07', 3, 'body', 'Which organ controls the rest of the body and does your thinking?',
    ['The brain', 'The heart', 'The spine', 'The liver'],
    'The brain sends and receives signals through the nerves. The spinal cord is the main cable connecting it to the body.');
  I('body-08', 3, 'body', 'How do muscles move your bones?',
    ['By pulling (contracting)', 'By pushing', 'By stretching only', 'By vibrating'],
    'Muscles can only pull. They work in pairs: one pulls to bend a joint and its partner pulls to straighten it.');
  I('body-09', 4, 'body', 'Which organs filter waste out of the blood to make urine?',
    ['The kidneys', 'The liver', 'The lungs', 'The pancreas'],
    'Your two kidneys clean all your blood many times a day, pulling out extra water and waste and sending it to the bladder.');
  I('body-10', 4, 'body', 'Where are most nutrients from food absorbed into the blood?',
    ['The small intestine', 'The stomach', 'The large intestine', 'The esophagus'],
    'The small intestine is about 20 feet long and lined with tiny finger-like villi that soak nutrients into the blood.');
  I('body-11', 4, 'body', 'What do white blood cells do?',
    ['Fight infection', 'Carry oxygen', 'Clot wounds', 'Carry sugar'],
    'White blood cells are the immune system\'s soldiers. They find and destroy bacteria and viruses.');
  I('body-12', 5, 'body', 'Why does your heart beat faster when you run?',
    ['Working muscles need more oxygen and fuel delivered quickly', 'The heart gets nervous', 'Blood gets thinner', 'The lungs stop working'],
    'Muscles burn fuel faster when they work, so they need more oxygen. The heart pumps faster and you breathe faster to deliver it.', 'heart');
  I('body-13', 5, 'body', 'What is the largest organ of the human body?',
    ['The skin', 'The liver', 'The brain', 'The lungs'],
    'Skin covers about 20 square feet on an adult. It keeps germs out, holds water in, and senses touch and temperature.');
  I('body-14', 5, 'body', 'Why are your muscles sore the day after hard exercise?',
    ['Tiny tears in the muscle fibers are repairing, and they grow back stronger', 'Your bones bent', 'Your blood got cold', 'Your skin stretched'],
    'Hard work causes microscopic damage to muscle fibers. As the body repairs them it adds a little more muscle, which is how training works.');
  I('body-15', 1, 'body', 'Which sense organ lets you see?',
    ['The eyes', 'The ears', 'The nose', 'The tongue'],
    'Light enters the eye and lands on the retina at the back, which sends signals along the optic nerve to the brain.');
  I('body-16', 3, 'body', 'Why do you need to eat protein?',
    ['To build and repair muscles and other tissues', 'Only for quick energy', 'To make bones hollow', 'To keep you cold'],
    'Protein from foods like eggs, beans and meat is broken into amino acids, the building blocks the body uses to make muscle, skin, hair and more.');

  // ---------- simple machines ----------
  I('mach-01', 1, 'machines', 'A ramp used to roll a heavy barrel up into a truck is a...',
    ['inclined plane', 'pulley', 'lever', 'screw'],
    'An inclined plane is a sloped surface. It lets you lift a load with less force by moving it a longer distance.', 'ramp');
  I('mach-02', 1, 'machines', 'A seesaw is an example of which simple machine?',
    ['A lever', 'A wheel and axle', 'A pulley', 'A wedge'],
    'A lever is a bar that turns on a fixed point called the fulcrum. On a seesaw the fulcrum is the middle post.', 'lever');
  I('mach-03', 2, 'machines', 'Which simple machine raises a flag to the top of a pole?',
    ['A pulley', 'A wedge', 'A screw', 'An inclined plane'],
    'A pulley is a wheel with a rope over it. Pulling down on one side lifts the load on the other, changing the direction of your force.', 'pulley');
  I('mach-04', 2, 'machines', 'An axe blade is which simple machine?',
    ['A wedge', 'A lever', 'A pulley', 'A screw'],
    'A wedge is two inclined planes back to back. Driving it in pushes material apart, which is how an axe splits wood.');
  I('mach-05', 2, 'machines', 'A doorknob is an example of a...',
    ['wheel and axle', 'wedge', 'inclined plane', 'pulley'],
    'The knob is the wheel and the rod it turns is the axle. Turning the big wheel a little turns the small axle with more force.');
  I('mach-06', 3, 'machines', 'How do simple machines help us?',
    ['They let us use less force by applying it over a longer distance', 'They create energy', 'They make work disappear', 'They add weight to the load'],
    'A machine trades force for distance. You push with less force but over a longer path; the total work stays the same.', 'ramp');
  I('mach-07', 3, 'machines', 'The fixed point a lever turns on is called the...',
    ['fulcrum', 'load', 'effort', 'axle'],
    'The fulcrum is the pivot. The load is what you lift and the effort is where you push.', 'lever');
  I('mach-08', 4, 'machines', 'On a lever, moving the fulcrum closer to the load...',
    ['makes the load easier to lift', 'makes the load harder to lift', 'changes nothing', 'makes the lever heavier'],
    'A longer arm on your side and a shorter arm on the load\'s side multiplies your force. You push farther, but with less effort.', 'lever');
  I('mach-09', 4, 'machines', 'A screw is really a...',
    ['inclined plane wrapped around a post', 'tiny wedge', 'bent lever', 'small pulley'],
    'Unwrap the threads of a screw and you get a long gentle ramp. Each turn moves it in a little, with a lot of force.');
  I('mach-10', 5, 'machines', 'You make a ramp longer and less steep. Pushing a crate up it now takes...',
    ['less force but a longer push', 'more force', 'the same force', 'no work at all'],
    'The crate ends up at the same height, so the work is the same. Spreading it over more distance means less force at each step.', 'ramp');
  I('mach-11', 5, 'machines', 'With a two-pulley system you pull the rope 4 feet and the load rises 2 feet. What did you gain?',
    ['You lift with about half the force', 'You lift twice as fast', 'You do half the work', 'Nothing changes'],
    'Pulling twice the distance means each pull needs about half the force. Machines trade distance for force; they never cut the total work.', 'pulley');
  I('mach-12', 3, 'machines', 'Which of these is a wheel and axle?',
    ['A bicycle wheel', 'A knife', 'A ramp', 'A crowbar'],
    'A wheel turning on a rod is a wheel and axle. A knife is a wedge, a ramp is an inclined plane and a crowbar is a lever.');

  // ---------- states of matter ----------
  I('matter-01', 1, 'matter', 'When ice melts into water it changes from...',
    ['solid to liquid', 'liquid to gas', 'gas to liquid', 'solid to gas'],
    'Ice is solid water. Heat makes its particles move faster until they slide past each other, and it becomes a liquid.', 'states');
  I('matter-02', 1, 'matter', 'Which of these is a gas?',
    ['Steam', 'Ice', 'Juice', 'A rock'],
    'Steam is water in its gas form. Ice is a solid, juice is a liquid, and a rock is a solid.', 'states');
  I('matter-03', 2, 'matter', 'At what temperature does water freeze?',
    ['32°F (0°C)', '100°F', '0°F', '212°F'],
    'Water freezes at 32°F, which is 0°C. It boils at 212°F (100°C) at sea level.');
  I('matter-04', 2, 'matter', 'Which state of matter keeps its own shape and volume?',
    ['Solid', 'Liquid', 'Gas', 'Vapor'],
    'A solid\'s particles are locked in place. Liquids take the shape of their container, and gases spread out to fill any space.', 'states');
  I('matter-05', 3, 'matter', 'At sea level, water boils at...',
    ['212°F (100°C)', '100°F', '32°F', '180°F'],
    'Water boils at 212°F at sea level. Up high, where air pressure is lower, it boils at a lower temperature, so Denver bakers adjust recipes.');
  I('matter-06', 3, 'matter', 'Particles in a gas...',
    ['move fast and are spread far apart', 'are locked in place', 'barely move at all', 'are packed closest together'],
    'Gas particles zip around freely and bounce off the walls of their container, which is what makes gas pressure.', 'states');
  I('matter-07', 3, 'matter', 'Water drops forming on the outside of a cold soda can are an example of...',
    ['condensation', 'evaporation', 'melting', 'sublimation'],
    'Water vapor in the air touches the cold can, loses heat, and turns back into liquid drops.');
  I('matter-08', 4, 'matter', 'Dry ice turns straight from a solid into a gas. That change is called...',
    ['sublimation', 'melting', 'freezing', 'condensation'],
    'Sublimation skips the liquid stage. Dry ice is frozen carbon dioxide; the fog you see is water vapor in the air chilled by the escaping gas.');
  I('matter-09', 4, 'matter', 'You warm a sealed balloon full of air. The balloon...',
    ['expands, because the particles move faster and push harder', 'shrinks', 'stays the same size', 'fills with liquid'],
    'Heat makes gas particles move faster and hit the balloon\'s walls harder and more often, so the balloon stretches.');
  I('matter-10', 5, 'matter', 'What happens to the mass of water when it freezes into ice?',
    ['It stays the same', 'It increases', 'It decreases', 'It doubles'],
    'Freezing rearranges the same water molecules; none are added or lost. The ice takes up more room, but it weighs exactly what the water did.');
  I('matter-11', 5, 'matter', 'Why do road crews spread salt on icy roads?',
    ['Salt lowers the freezing point of water, so ice melts below 32°F', 'Salt is warm', 'Salt is heavy and crushes ice', 'Salt makes the road rough'],
    'Dissolved salt gets in the way of water molecules trying to lock into ice crystals. Salty water stays liquid down to about 15°F.');
  I('matter-12', 2, 'matter', 'Which change can be undone by cooling?',
    ['Melting butter', 'Burning paper', 'Baking a cookie', 'Frying an egg'],
    'Melting is a physical change: cool the butter and it turns solid again. Burning, baking and frying make new substances that cannot change back.');
  I('matter-13', 4, 'matter', 'Why does a puddle disappear on a warm day even though it never boiled?',
    ['The fastest water particles at the surface escape as vapor', 'The water sinks into the sky', 'The air drinks it', 'It turns into ice first'],
    'Evaporation happens at any temperature. Particles at the surface with enough energy break free one by one; warmth and wind speed it up.');

  // ---------- food science (bakery) ----------
  I('food-01', 1, 'food', 'What makes bread dough rise?',
    ['Yeast making carbon dioxide gas', 'Salt', 'Sugar melting', 'Cold air'],
    'Yeast eats the sugars in the dough and breathes out carbon dioxide. The gas bubbles get trapped and puff the dough up.', 'bread');
  I('food-02', 1, 'food', 'Which ingredient makes cookies sweet?',
    ['Sugar', 'Flour', 'Salt', 'Baking soda'],
    'Sugar gives the sweetness and also helps cookies brown and spread. Flour gives structure and baking soda helps them rise.');
  I('food-03', 2, 'food', 'Yeast is a...',
    ['living fungus', 'mineral', 'plant', 'metal'],
    'Yeast is a tiny single-celled fungus, a relative of mushrooms. It is alive, which is why warm water wakes it up and very hot water kills it.');
  I('food-04', 2, 'food', 'Why does bread crust turn golden brown in the oven?',
    ['Sugars and proteins on the surface react with heat (browning)', 'The oven burns it black and it fades', 'Flour is naturally brown', 'The yeast turns brown'],
    'Heat makes sugars caramelize and sugars and proteins react together (the Maillard reaction). Both make the brown color and the toasty flavor.', 'bread');
  I('food-05', 3, 'food', 'Mixing baking soda with an acid like buttermilk makes...',
    ['carbon dioxide bubbles', 'salt crystals', 'only water', 'oil'],
    'Baking soda is a base. When it meets an acid it fizzes, releasing carbon dioxide gas that makes pancakes and quick breads fluffy.');
  I('food-06', 3, 'food', 'Why does a raw egg turn solid when it is cooked?',
    ['Heat changes the shape of its proteins so they tangle together', 'Water is added to it', 'It freezes', 'Its sugar hardens'],
    'Egg proteins are curled up in the raw egg. Heat unwinds them and they link into a mesh, turning the runny egg firm.');
  I('food-07', 4, 'food', 'Why do bakers knead bread dough?',
    ['To build stretchy gluten strands that trap the gas bubbles', 'To cool the dough', 'To add water', 'To kill the yeast'],
    'Kneading lines up the wheat proteins into gluten, a stretchy net. Without it the gas would escape and the bread would be flat and dense.', 'bread');
  I('food-08', 4, 'food', 'Melting butter in a pan is which kind of change?',
    ['A physical change', 'A chemical change', 'A nuclear change', 'A living change'],
    'The butter is still butter, just liquid. Cool it and it hardens again. A chemical change, like burning, would make something new.');
  I('food-09', 5, 'food', 'A cake recipe from sea level rises too fast and then collapses in Denver. Why?',
    ['Lower air pressure lets the gas bubbles expand more before the batter sets', 'The air is colder', 'Flour weighs less there', 'Ovens are hotter in Denver'],
    'Denver sits a mile high, where air pressure is lower. Bubbles grow bigger and faster, and the thin walls between them can burst before the cake firms up. Bakers use less leavening and a hotter oven.');
  I('food-10', 5, 'food', 'Why do we keep milk in the refrigerator?',
    ['Cold slows the growth of the bacteria that spoil it', 'Cold adds vitamins', 'Milk needs to freeze a little', 'It makes the milk sweeter'],
    'Bacteria multiply quickly at room temperature and turn milk sour. Below 40°F they grow much more slowly, so the milk stays fresh for days.');
  I('food-11', 2, 'food', 'Why do bakers add salt to bread dough?',
    ['For flavor and to slow the yeast so the dough rises evenly', 'To make the dough rise faster', 'To turn the bread white', 'To make it sweet'],
    'Salt brings out flavor and tightens the gluten. It also keeps the yeast from working too fast, so the bread has a better texture.');
  I('food-12', 3, 'food', 'What happens when you whip egg whites?',
    ['Air bubbles get trapped and the proteins stretch around them into a foam', 'They turn into yolks', 'They freeze', 'The sugar melts'],
    'Beating unfolds the proteins, and they wrap around tiny air bubbles. That foam is what makes meringue and angel food cake so light.');
  I('food-13', 4, 'food', 'Why does cut apple turn brown?',
    ['Oxygen in the air reacts with chemicals in the apple', 'It dries out', 'Sugar leaks out', 'It gets cold'],
    'Cutting breaks cells open and lets oxygen reach an enzyme inside, which makes brown pigments. Lemon juice slows the reaction, which is why bakers brush it on.');

  // ---------- animal care (vet) ----------
  I('vet-01', 1, 'animals', 'A healthy dog\'s normal body temperature is...',
    ['a bit warmer than a human\'s, about 101–102°F', 'the same as room air', 'colder than ice', 'about 212°F'],
    'Dogs and cats run warmer than people: about 101 to 102.5°F is normal. A vet checks it with a thermometer at every visit.', 'thermo');
  I('vet-02', 1, 'animals', 'Which statement about a cat is true?',
    ['It is a mammal with fur that drank its mother\'s milk as a kitten', 'It is a reptile', 'It hatches from an egg', 'It is cold-blooded'],
    'Cats are mammals: warm-blooded, furry, born live and fed milk.');
  I('vet-03', 2, 'animals', 'Why do vets give pets vaccines?',
    ['To train the immune system to fight a disease before it strikes', 'To make them sleepy', 'To clean their teeth', 'To make their fur shiny'],
    'A vaccine shows the body a harmless piece of a germ so it learns to make defenders. If the real germ shows up later the body is ready.');
  I('vet-04', 2, 'animals', 'How do dogs mostly cool themselves on a hot day?',
    ['By panting', 'By sweating all over', 'By shivering', 'By shedding fur'],
    'Dogs sweat only a little through their paws. Panting moves air over the wet tongue and mouth, and the evaporation carries heat away.');
  I('vet-05', 3, 'animals', 'Which food is poisonous to dogs?',
    ['Chocolate', 'Carrots', 'Plain cooked rice', 'Pumpkin'],
    'Chocolate contains theobromine, which dogs cannot break down well. It can cause vomiting, a racing heart and worse. Carrots, rice and pumpkin are safe treats.');
  I('vet-06', 3, 'animals', 'Why does a pet need fresh water every day?',
    ['Water carries nutrients, flushes out waste and helps control body temperature', 'Water makes fur grow', 'Pets get all their water from food', 'Water is a kind of food'],
    'Like us, animals are mostly water. Their bodies use it for every job and lose it through breathing, urine and panting, so it must be replaced.');
  I('vet-07', 4, 'animals', 'A vet listens to a pet\'s heartbeat with a...',
    ['stethoscope', 'thermometer', 'microscope', 'barometer'],
    'A stethoscope carries the sound of the heart and lungs to the vet\'s ears. A fast or uneven beat is a clue that something is wrong.', 'heart');
  I('vet-08', 4, 'animals', 'A rabbit\'s teeth never stop growing. What does it need?',
    ['Lots of hay to chew, which wears the teeth down', 'Only soft food', 'Sugary treats', 'Very little food'],
    'Chewing tough hay all day grinds the teeth at the same pace they grow. Without it the teeth overgrow and the rabbit cannot eat.');
  I('vet-09', 5, 'animals', 'Why can a cat not live on dog food?',
    ['Cats need nutrients like taurine and more protein that dog food does not have enough of', 'Dog food is too crunchy', 'Cats do not eat meat', 'Dog food is too spicy'],
    'Cats are strict meat-eaters. Their bodies cannot make taurine, an amino acid, so it must come from their food; a lack of it damages the heart and eyes.');
  I('vet-10', 5, 'animals', 'Why are fleas and ticks harmful to pets?',
    ['They feed on the animal\'s blood and can spread disease', 'They eat the fur', 'They make loud noises', 'They scare the pet'],
    'Fleas and ticks are parasites. A heavy load of fleas can make a small animal anemic, and ticks can pass on illnesses like Lyme disease.');
  I('vet-11', 2, 'animals', 'What is a bird\'s body covered with?',
    ['Feathers', 'Fur', 'Scales', 'Bare skin'],
    'Feathers keep birds warm, shape their wings for flight and shed water. Mammals have fur and reptiles and fish have scales.');
  I('vet-12', 3, 'animals', 'Why does a vet check a dog\'s gums?',
    ['Pink gums mean good blood flow; pale or blue gums are a warning sign', 'To count the teeth', 'To see what it ate', 'To check its age'],
    'Gum color shows how well oxygen-rich blood is reaching the tissues. Pale gums can mean blood loss or shock, so vets look there first.');
  I('vet-13', 4, 'animals', 'Hamsters and mice are mostly active at night. The word for that is...',
    ['nocturnal', 'migratory', 'hibernating', 'carnivorous'],
    'Nocturnal animals sleep by day and come out at night, which is why a hamster rattles its wheel while you are trying to sleep.');

  // ---------- ecosystems (ranger) ----------
  I('eco-01', 1, 'ecosystems', 'In the food chain grass → rabbit → fox, which is the producer?',
    ['The grass', 'The rabbit', 'The fox', 'The soil'],
    'Producers make their own food from sunlight. Animals that eat them are consumers: the rabbit eats the grass and the fox eats the rabbit.', 'chain');
  I('eco-02', 1, 'ecosystems', 'The place where an animal finds its food, water and shelter is its...',
    ['habitat', 'den', 'zoo', 'migration'],
    'A habitat is an animal\'s natural home, with everything it needs to live. A den is just the sleeping spot inside it.');
  I('eco-03', 2, 'ecosystems', 'Mushrooms and bacteria that break down dead plants and animals are...',
    ['decomposers', 'producers', 'predators', 'prey'],
    'Decomposers recycle dead material into nutrients that go back into the soil for plants to use. Without them forests would be buried in dead leaves.');
  I('eco-04', 2, 'ecosystems', 'Which is a predator and its prey?',
    ['An owl and a mouse', 'A deer and grass', 'A bee and a flower', 'A tree and a squirrel'],
    'A predator hunts and eats another animal. The owl hunts the mouse. A deer grazing is a herbivore eating a plant, not hunting prey.', 'chain');
  I('eco-05', 3, 'ecosystems', 'If all the wolves vanished from a park, the deer population would most likely...',
    ['grow, and then overeat the plants', 'shrink', 'stay exactly the same', 'disappear too'],
    'Wolves keep deer numbers in check. When Yellowstone lost its wolves, deer and elk multiplied and stripped young trees along the rivers.', 'chain');
  I('eco-06', 3, 'ecosystems', 'Where does almost all the energy in an ecosystem come from?',
    ['The Sun', 'The soil', 'The water', 'The predators'],
    'Plants capture sunlight and store it as food. Every animal, even a top predator, is living on energy that first came from the Sun.', 'chain');
  I('eco-07', 4, 'ecosystems', 'Why do park rangers tell campers never to feed bears?',
    ['Bears learn to approach people for food and become dangerous', 'Bears cannot digest human food', 'Bears are never hungry', 'Feeding costs the park money'],
    'A fed bear loses its fear of people and starts raiding camps and cars. Those bears often have to be moved or put down. Rangers say "a fed bear is a dead bear."');
  I('eco-08', 4, 'ecosystems', 'Which is a non-living (abiotic) part of a forest ecosystem?',
    ['Sunlight', 'A deer', 'Moss', 'Earthworms'],
    'Abiotic parts are the non-living ones: sunlight, water, rock, soil and air. Deer, moss and worms are biotic, the living parts.');
  I('eco-09', 5, 'ecosystems', 'A species that lives in only one place on Earth, like many Hawaiian birds, is called...',
    ['endemic', 'invasive', 'extinct', 'migratory'],
    'Endemic species evolved in one isolated place and are found nowhere else. That makes them easy to lose when their habitat changes.');
  I('eco-10', 5, 'ecosystems', 'Why can a forest fire sometimes be good for a forest?',
    ['It clears dead material, and some pine cones only open their seeds in heat', 'Fire makes it rain', 'Trees grow faster when hot', 'Animals enjoy the warmth'],
    'Lodgepole and some other pines have cones sealed with resin that melt open in a fire. The burned ground, cleared of brush, gives the seedlings light.');
  I('eco-11', 5, 'ecosystems', 'Why do invasive species often damage an ecosystem?',
    ['They have no natural predators there and crowd out native species', 'They are always poisonous', 'They are always larger', 'They eat rocks'],
    'A plant or animal moved to a new place leaves its enemies behind. With nothing to eat it, it spreads fast and takes food and space from the natives.');
  I('eco-12', 2, 'ecosystems', 'Why do many birds fly south in the fall?',
    ['To find food and warmer weather for the winter', 'To escape predators only', 'Because the wind pushes them', 'To lay eggs in the snow'],
    'Migration follows the food. Insects and open water vanish in a northern winter, so birds fly to places where they can still eat.');
  I('eco-13', 3, 'ecosystems', 'What do we call all the living things in an area plus the non-living things they depend on?',
    ['An ecosystem', 'A food chain', 'A habitat', 'A population'],
    'An ecosystem is the whole community, from soil and sunlight to plants, animals and decomposers, and how they interact.');
  I('eco-14', 4, 'ecosystems', 'Why do coral reefs die when the ocean gets too warm?',
    ['The corals lose the tiny algae that live inside them and feed them', 'The water gets too salty', 'Fish eat them', 'They melt'],
    'Corals get most of their food and color from algae living in their tissue. Heat stress makes the corals expel the algae, which turns them white (bleaching) and starves them.');

  BT.data.science = items;
})();
