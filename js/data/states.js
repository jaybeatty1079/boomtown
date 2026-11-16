// BT.states: all 50 states, data only. Tile-grid positions (12 cols x 8 rows): AK bottom-left (0,6), HI below it (0,7),
// WA (1,2), ME (11,0), FL (9,7), TX (4,7), CA (1,5). Neighbors are land borders (Four Corners point borders AZ-CO and UT-NM included).
// Regions follow the U.S. Census Bureau. bigCity = largest city by population (2020 census).
(function () {
  'use strict';
  var BT = window.BT;
  function S(abbr, name, capital, region, col, row, nickname, landmark, bigCity, fact, neighbors) {
    return { abbr: abbr, name: name, capital: capital, region: region, col: col, row: row, nickname: nickname,
      landmark: landmark, bigCity: bigCity, fact: fact, neighbors: neighbors };
  }
  var NE = 'Northeast', MW = 'Midwest', SO = 'South', WE = 'West';

  BT.states = [
    S('AL', 'Alabama', 'Montgomery', SO, 7, 6, 'Yellowhammer State', 'U.S. Space & Rocket Center', 'Huntsville',
      'The Saturn V rockets that carried astronauts to the Moon were developed in Huntsville, Alabama.', ['MS', 'TN', 'GA', 'FL']),
    S('AK', 'Alaska', 'Juneau', WE, 0, 6, 'The Last Frontier', 'Denali', 'Anchorage',
      'Alaska is the largest state by area, more than twice the size of Texas.', []),
    S('AZ', 'Arizona', 'Phoenix', WE, 2, 5, 'Grand Canyon State', 'Grand Canyon', 'Phoenix',
      'The Grand Canyon is about a mile deep and 277 miles long.', ['CA', 'NV', 'UT', 'CO', 'NM']),
    S('AR', 'Arkansas', 'Little Rock', SO, 5, 5, 'The Natural State', 'Hot Springs National Park', 'Little Rock',
      'At Crater of Diamonds State Park in Arkansas, visitors can dig for real diamonds and keep what they find.', ['MO', 'TN', 'MS', 'LA', 'TX', 'OK']),
    S('CA', 'California', 'Sacramento', WE, 1, 5, 'Golden State', 'Golden Gate Bridge', 'Los Angeles',
      'California has more people than any other state.', ['OR', 'NV', 'AZ']),
    S('CO', 'Colorado', 'Denver', WE, 3, 4, 'Centennial State', 'Rocky Mountain National Park', 'Denver',
      'Denver is called the Mile High City because it sits about 5,280 feet above sea level.', ['WY', 'NE', 'KS', 'OK', 'NM', 'AZ', 'UT']),
    S('CT', 'Connecticut', 'Hartford', NE, 11, 3, 'Constitution State', 'Mystic Seaport', 'Bridgeport',
      'The first telephone book was published in New Haven, Connecticut, in 1878.', ['NY', 'MA', 'RI']),
    S('DE', 'Delaware', 'Dover', SO, 10, 4, 'The First State', 'Rehoboth Beach Boardwalk', 'Wilmington',
      'Delaware was the first state to ratify the U.S. Constitution, on December 7, 1787.', ['MD', 'PA', 'NJ']),
    S('FL', 'Florida', 'Tallahassee', SO, 9, 7, 'Sunshine State', 'Kennedy Space Center', 'Jacksonville',
      'The Everglades in Florida is a slow-moving river of grass about 50 miles wide.', ['AL', 'GA']),
    S('GA', 'Georgia', 'Atlanta', SO, 8, 6, 'Peach State', 'Stone Mountain', 'Atlanta',
      'Atlanta’s airport is usually the busiest airport in the world by number of passengers.', ['FL', 'AL', 'TN', 'NC', 'SC']),
    S('HI', 'Hawaii', 'Honolulu', WE, 0, 7, 'Aloha State', 'Pearl Harbor', 'Honolulu',
      'Hawaii is the only state made entirely of islands.', []),
    S('ID', 'Idaho', 'Boise', WE, 2, 2, 'Gem State', 'Shoshone Falls', 'Boise',
      'Idaho grows about a third of all the potatoes in the United States.', ['WA', 'OR', 'NV', 'UT', 'WY', 'MT']),
    S('IL', 'Illinois', 'Springfield', MW, 6, 3, 'Prairie State', 'Willis Tower', 'Chicago',
      'Chicago’s Willis Tower was the tallest building in the world from 1973 to 1998.', ['WI', 'IA', 'MO', 'KY', 'IN']),
    S('IN', 'Indiana', 'Indianapolis', MW, 7, 3, 'Hoosier State', 'Indianapolis Motor Speedway', 'Indianapolis',
      'The Indianapolis 500 car race has been held almost every year since 1911.', ['MI', 'OH', 'KY', 'IL']),
    S('IA', 'Iowa', 'Des Moines', MW, 5, 3, 'Hawkeye State', 'Field of Dreams', 'Des Moines',
      'Iowa grows more corn than any other state.', ['MN', 'WI', 'IL', 'MO', 'NE', 'SD']),
    S('KS', 'Kansas', 'Topeka', MW, 4, 5, 'Sunflower State', 'Monument Rocks', 'Wichita',
      'Kansas grows more wheat than any other state in most years.', ['NE', 'MO', 'OK', 'CO']),
    S('KY', 'Kentucky', 'Frankfort', SO, 6, 4, 'Bluegrass State', 'Mammoth Cave', 'Louisville',
      'Mammoth Cave in Kentucky is the longest known cave system in the world, with more than 400 miles mapped.', ['IN', 'OH', 'WV', 'VA', 'TN', 'MO', 'IL']),
    S('LA', 'Louisiana', 'Baton Rouge', SO, 5, 6, 'Pelican State', 'French Quarter', 'New Orleans',
      'Louisiana calls its counties parishes.', ['TX', 'AR', 'MS']),
    S('ME', 'Maine', 'Augusta', NE, 11, 0, 'Pine Tree State', 'Acadia National Park', 'Portland',
      'Maine is the only state that borders exactly one other state, New Hampshire.', ['NH']),
    S('MD', 'Maryland', 'Annapolis', SO, 9, 4, 'Old Line State', 'Fort McHenry', 'Baltimore',
      'The Star-Spangled Banner was written after the battle at Fort McHenry in Baltimore in 1814.', ['VA', 'WV', 'PA', 'DE']),
    S('MA', 'Massachusetts', 'Boston', NE, 10, 2, 'Bay State', 'Freedom Trail', 'Boston',
      'Basketball was invented in Springfield, Massachusetts, in 1891.', ['RI', 'CT', 'NY', 'NH', 'VT']),
    S('MI', 'Michigan', 'Lansing', MW, 8, 2, 'Great Lakes State', 'Mackinac Bridge', 'Detroit',
      'Michigan touches four of the five Great Lakes.', ['OH', 'IN', 'WI']),
    S('MN', 'Minnesota', 'Saint Paul', MW, 5, 2, 'North Star State', 'Mall of America', 'Minneapolis',
      'The Mississippi River begins in Minnesota at Lake Itasca.', ['ND', 'SD', 'IA', 'WI']),
    S('MS', 'Mississippi', 'Jackson', SO, 6, 6, 'Magnolia State', 'Vicksburg National Military Park', 'Jackson',
      'The teddy bear got its name after President Theodore Roosevelt’s 1902 hunting trip in Mississippi.', ['LA', 'AR', 'TN', 'AL']),
    S('MO', 'Missouri', 'Jefferson City', MW, 5, 4, 'Show-Me State', 'Gateway Arch', 'Kansas City',
      'The Gateway Arch in St. Louis is 630 feet tall, the tallest arch in the world.', ['IA', 'IL', 'KY', 'TN', 'AR', 'OK', 'KS', 'NE']),
    S('MT', 'Montana', 'Helena', WE, 3, 2, 'Treasure State', 'Glacier National Park', 'Billings',
      'Montana has more cows than people.', ['ND', 'SD', 'WY', 'ID']),
    S('NE', 'Nebraska', 'Lincoln', MW, 4, 4, 'Cornhusker State', 'Chimney Rock', 'Omaha',
      'Nebraska is the only state with a one-house legislature.', ['SD', 'IA', 'MO', 'KS', 'CO', 'WY']),
    S('NV', 'Nevada', 'Carson City', WE, 2, 3, 'Silver State', 'Hoover Dam', 'Las Vegas',
      'Nevada is the driest state in the country; most of it is desert.', ['OR', 'ID', 'UT', 'AZ', 'CA']),
    S('NH', 'New Hampshire', 'Concord', NE, 11, 1, 'Granite State', 'Mount Washington', 'Manchester',
      'Mount Washington in New Hampshire recorded a wind gust of 231 miles per hour in 1934.', ['ME', 'MA', 'VT']),
    S('NJ', 'New Jersey', 'Trenton', NE, 10, 3, 'Garden State', 'Atlantic City Boardwalk', 'Newark',
      'New Jersey has more people per square mile than any other state.', ['NY', 'PA', 'DE']),
    S('NM', 'New Mexico', 'Santa Fe', WE, 3, 5, 'Land of Enchantment', 'Carlsbad Caverns', 'Albuquerque',
      'Santa Fe is the highest state capital, about 7,000 feet above sea level.', ['AZ', 'UT', 'CO', 'OK', 'TX']),
    S('NY', 'New York', 'Albany', NE, 9, 2, 'Empire State', 'Statue of Liberty', 'New York City',
      'New York City is the largest city in the United States.', ['VT', 'MA', 'CT', 'NJ', 'PA']),
    S('NC', 'North Carolina', 'Raleigh', SO, 7, 5, 'Tar Heel State', 'Wright Brothers National Memorial', 'Charlotte',
      'The Wright brothers made the first airplane flight at Kitty Hawk, North Carolina, in 1903.', ['VA', 'TN', 'GA', 'SC']),
    S('ND', 'North Dakota', 'Bismarck', MW, 4, 2, 'Peace Garden State', 'Theodore Roosevelt National Park', 'Fargo',
      'Theodore Roosevelt ranched in North Dakota before he became president.', ['MN', 'SD', 'MT']),
    S('OH', 'Ohio', 'Columbus', MW, 8, 3, 'Buckeye State', 'Rock and Roll Hall of Fame', 'Columbus',
      'Seven U.S. presidents were born in Ohio, more than any state except Virginia.', ['PA', 'WV', 'KY', 'IN', 'MI']),
    S('OK', 'Oklahoma', 'Oklahoma City', SO, 4, 6, 'Sooner State', 'National Cowboy & Western Heritage Museum', 'Oklahoma City',
      'The parking meter was invented in Oklahoma City in 1935.', ['KS', 'MO', 'AR', 'TX', 'NM', 'CO']),
    S('OR', 'Oregon', 'Salem', WE, 1, 3, 'Beaver State', 'Crater Lake', 'Portland',
      'Crater Lake in Oregon is the deepest lake in the United States, almost 2,000 feet deep.', ['WA', 'ID', 'NV', 'CA']),
    S('PA', 'Pennsylvania', 'Harrisburg', NE, 9, 3, 'Keystone State', 'Liberty Bell', 'Philadelphia',
      'The Declaration of Independence was signed in Philadelphia in 1776.', ['NY', 'NJ', 'DE', 'MD', 'WV', 'OH']),
    S('RI', 'Rhode Island', 'Providence', NE, 11, 2, 'Ocean State', 'The Breakers', 'Providence',
      'Rhode Island is the smallest state by area.', ['CT', 'MA']),
    S('SC', 'South Carolina', 'Columbia', SO, 8, 5, 'Palmetto State', 'Fort Sumter', 'Charleston',
      'The first shots of the Civil War were fired at Fort Sumter in Charleston Harbor in 1861.', ['NC', 'GA']),
    S('SD', 'South Dakota', 'Pierre', MW, 4, 3, 'Mount Rushmore State', 'Mount Rushmore', 'Sioux Falls',
      'Each president’s face on Mount Rushmore is about 60 feet tall.', ['ND', 'MN', 'IA', 'NE', 'WY', 'MT']),
    S('TN', 'Tennessee', 'Nashville', SO, 6, 5, 'Volunteer State', 'Great Smoky Mountains', 'Nashville',
      'Great Smoky Mountains is the most visited national park in the United States.', ['KY', 'VA', 'NC', 'GA', 'AL', 'MS', 'AR', 'MO']),
    S('TX', 'Texas', 'Austin', SO, 4, 7, 'Lone Star State', 'The Alamo', 'Houston',
      'Texas is the second-largest state by both area and population.', ['NM', 'OK', 'AR', 'LA']),
    S('UT', 'Utah', 'Salt Lake City', WE, 2, 4, 'Beehive State', 'Arches National Park', 'Salt Lake City',
      'Utah has five national parks, nicknamed the Mighty Five.', ['ID', 'WY', 'CO', 'NM', 'AZ', 'NV']),
    S('VT', 'Vermont', 'Montpelier', NE, 10, 1, 'Green Mountain State', 'Lake Champlain', 'Burlington',
      'Vermont makes more maple syrup than any other state.', ['NY', 'NH', 'MA']),
    S('VA', 'Virginia', 'Richmond', SO, 8, 4, 'Old Dominion', 'Mount Vernon', 'Virginia Beach',
      'Eight U.S. presidents were born in Virginia, more than any other state.', ['MD', 'WV', 'KY', 'TN', 'NC']),
    S('WA', 'Washington', 'Olympia', WE, 1, 2, 'Evergreen State', 'Space Needle', 'Seattle',
      'Washington grows more apples than any other state.', ['ID', 'OR']),
    S('WV', 'West Virginia', 'Charleston', SO, 7, 4, 'Mountain State', 'New River Gorge Bridge', 'Charleston',
      'West Virginia became a state in 1863, during the Civil War, after splitting from Virginia.', ['OH', 'PA', 'MD', 'VA', 'KY']),
    S('WI', 'Wisconsin', 'Madison', MW, 6, 2, 'Badger State', 'Wisconsin Dells', 'Milwaukee',
      'Wisconsin makes more cheese than any other state.', ['MI', 'MN', 'IA', 'IL']),
    S('WY', 'Wyoming', 'Cheyenne', WE, 3, 3, 'Equality State', 'Yellowstone National Park', 'Cheyenne',
      'Wyoming has the fewest people of any state.', ['MT', 'SD', 'NE', 'CO', 'UT', 'ID'])
  ];

  BT.stateByAbbr = function (abbr) {
    for (var i = 0; i < BT.states.length; i++) if (BT.states[i].abbr === abbr) return BT.states[i];
    return null;
  };

  BT.registerChecks('states', [
    { name: '50 states, unique abbrs, every field filled', fn: function () {
      var seen = {}, fields = ['abbr', 'name', 'capital', 'region', 'nickname', 'landmark', 'bigCity', 'fact'];
      if (BT.states.length !== 50) throw new Error('count ' + BT.states.length);
      BT.states.forEach(function (s) {
        if (seen[s.abbr]) throw new Error('dup ' + s.abbr); seen[s.abbr] = 1;
        fields.forEach(function (f) { if (!s[f] || typeof s[f] !== 'string') throw new Error(s.abbr + ' missing ' + f); });
        if (!Array.isArray(s.neighbors)) throw new Error(s.abbr + ' neighbors');
      });
      return true;
    } },
    { name: 'regions valid with census counts 9/12/16/13', fn: function () {
      var c = {};
      BT.states.forEach(function (s) { c[s.region] = (c[s.region] || 0) + 1; });
      return c.Northeast === 9 && c.Midwest === 12 && c.South === 16 && c.West === 13 && Object.keys(c).length === 4;
    } },
    { name: 'grid positions unique and inside 12x8', fn: function () {
      var seen = {};
      BT.states.forEach(function (s) {
        if (!(s.col >= 0 && s.col <= 11 && s.row >= 0 && s.row <= 7)) throw new Error(s.abbr + ' off grid');
        var k = s.col + ',' + s.row;
        if (seen[k]) throw new Error(s.abbr + ' overlaps ' + seen[k]); seen[k] = s.abbr;
      });
      return true;
    } },
    { name: 'spec anchors: WA 1,2  ME 11,0  FL 9,7  TX 4,7  CA 1,5  AK/HI bottom-left', fn: function () {
      function at(a, c, r) { var s = BT.stateByAbbr(a); return s.col === c && s.row === r; }
      return at('WA', 1, 2) && at('ME', 11, 0) && at('FL', 9, 7) && at('TX', 4, 7) && at('CA', 1, 5) && at('AK', 0, 6) && at('HI', 0, 7);
    } },
    { name: 'neighbors symmetric, real, no self, no dups; only AK and HI have none', fn: function () {
      BT.states.forEach(function (s) {
        var seen = {};
        if (s.neighbors.length === 0 && s.abbr !== 'AK' && s.abbr !== 'HI') throw new Error(s.abbr + ' has no neighbors');
        s.neighbors.forEach(function (n) {
          if (n === s.abbr) throw new Error(s.abbr + ' self');
          if (seen[n]) throw new Error(s.abbr + ' dup ' + n); seen[n] = 1;
          var o = BT.stateByAbbr(n);
          if (!o) throw new Error(s.abbr + ' unknown ' + n);
          if (o.neighbors.indexOf(s.abbr) < 0) throw new Error(s.abbr + '->' + n + ' not symmetric');
        });
      });
      return true;
    } }
  ]);
})();
