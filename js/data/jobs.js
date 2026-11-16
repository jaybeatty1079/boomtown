// BT.jobs.data: the 28 jobs. Tiers 8/8/7/5, 25 states, all four Census regions, every subject in focus of 5+ jobs.
// Pay is per correct round at promotion level 1 (tier 1 $18-25, tier 2 $35-50, tier 3 $70-95, tier 4 $140-180).
// City facts are real; see each intro.
(function () {
  'use strict';
  var BT = window.BT;
  BT.jobs = BT.jobs || {};
  function J(id, title, city, state, tier, pay, kind, focus, color, icon, intro, tasks) {
    return { id: id, title: title, city: city, state: state, tier: tier, pay: pay, kind: kind, focus: focus, color: color, icon: icon, intro: intro, tasks: tasks };
  }
  BT.jobs.data = [
    // ---------- tier 1 ----------
    J('austin-bakery', 'Bakery Helper', 'Austin', 'TX', 1, 20, 'bakery', ['money', 'science'], '#ffb347', '🥐',
      'Austin is the capital of Texas and calls itself the Live Music Capital of the World, so a band is already warming up down the street. You weigh the flour, price the cupcakes and open the shop before the breakfast rush.',
      ['Weigh flour', 'Price the cupcakes', 'Open the shop']),
    J('denver-vet', 'Pet Vet Helper', 'Denver', 'CO', 1, 22, 'vet', ['science', 'reading'], '#8b6cff', '🐶',
      'Denver sits exactly one mile above the sea, 5,280 feet up, which is why visitors get out of breath on the stairs. At the clinic you weigh puppies, read the charts and help the vet check a very nervous cat.',
      ['Weigh the puppies', 'Read the pet charts', 'Calm a nervous cat']),
    J('phoenix-lemonade', 'Lemonade Stand Owner', 'Phoenix', 'AZ', 1, 18, 'lemonade', ['money', 'logic'], '#fff176', '🍋',
      'Phoenix is the hottest big city in the country, with more than 100 days a year over 100 degrees, so everyone wants a cold drink. You set the price, count the change and figure out how many lemons the day will take.',
      ['Set the price', 'Count the change', 'Plan the lemons']),
    J('cheyenne-ranch', 'Ranch Hand', 'Cheyenne', 'WY', 1, 21, 'ranch', ['science', 'words'], '#c98a4b', '🐎',
      'Cheyenne is the capital of Wyoming and every July it hosts Cheyenne Frontier Days, the biggest outdoor rodeo in the world. You feed the horses, learn the ranch words and check the fences before the cattle move.',
      ['Feed the horses', 'Learn the ranch words', 'Check the fences']),
    J('monterey-aquarium', 'Aquarium Guide', 'Monterey', 'CA', 1, 23, 'aquarium', ['science', 'geography'], '#4fc3f7', '🐙',
      'The Monterey Bay Aquarium sits on Cannery Row, right on the Pacific, and its sea otters are the stars of the show. You lead a tour past the giant kelp tank and point out where each animal comes from on the map.',
      ['Lead a kelp forest tour', 'Feed the sea otters', 'Point out the Pacific']),
    J('boston-library', 'Library Helper', 'Boston', 'MA', 1, 19, 'library', ['reading', 'words'], '#ff8a65', '📚',
      'The Boston Public Library, founded in 1848, was the first large free public library in the United States. You shelve the returns, help kids find a mystery and read the new picture books before anyone else.',
      ['Shelve the returns', 'Find a mystery for a kid', 'Read the new books']),
    J('minneapolis-toys', 'Toy Store Clerk', 'Minneapolis', 'MN', 1, 22, 'toystore', ['money', 'design'], '#ff6b6b', '🧸',
      'Minneapolis winters get so cold that downtown buildings are linked by glass skyways, so shoppers never have to step outside. You price the new toys, ring up the sales and design the front window display.',
      ['Price the new toys', 'Ring up sales', 'Design the window']),
    J('madison-market', 'Farm Market Seller', 'Madison', 'WI', 1, 20, 'farmmarket', ['money', 'science', 'words'], '#5fcf5a', '🥕',
      'Every Saturday the Dane County Farmers Market wraps all the way around the Wisconsin State Capitol, the largest market in the country where farmers sell only what they grew. You stack the apples, explain how cheese is made and make change fast.',
      ['Stack the apples', 'Explain the cheese', 'Make change fast']),

    // ---------- tier 2 ----------
    J('charlotte-bank', 'Bank Teller', 'Charlotte', 'NC', 2, 40, 'bank', ['money', 'logic'], '#3ddc97', '🏦',
      'Charlotte is the second-biggest banking city in the United States, after only New York. You count deposits to the penny, spot the pattern in the ledger and help a kid open a first savings account.',
      ['Count the deposits', 'Balance the ledger', 'Open a savings account']),
    J('stlouis-reporter', 'Newspaper Reporter', 'St. Louis', 'MO', 2, 38, 'newspaper', ['writing', 'reading'], '#8d99a6', '📰',
      'The Gateway Arch in St. Louis is 630 feet tall, the tallest monument in the United States, and today it is your front-page story. You interview the park ranger, check your facts and write the headline before the deadline.',
      ['Interview the ranger', 'Check the facts', 'Write the headline']),
    J('omaha-zoo', 'Zoo Keeper', 'Omaha', 'NE', 2, 42, 'zoo', ['science', 'words'], '#ffcf3f', '🦒',
      'Omaha has the Henry Doorly Zoo, home to the biggest indoor desert in the world under one giant glass dome. You measure out the giraffe feed, learn the animal names and check on the baby penguins.',
      ['Measure the giraffe feed', 'Learn the animal names', 'Check the penguins']),
    J('chicago-museum', 'Museum Guide', 'Chicago', 'IL', 2, 36, 'museum', ['reading', 'science'], '#b388ff', '🦖',
      'The Field Museum in Chicago keeps Sue, one of the largest and most complete T. rex skeletons ever found. You read the exhibit cards, answer the dinosaur questions and lead a class through the ancient Egypt hall.',
      ['Study the exhibit cards', 'Answer dino questions', 'Lead the Egypt tour']),
    J('norman-weather', 'Weather Station Forecaster', 'Norman', 'OK', 2, 44, 'weather', ['science', 'geography', 'logic'], '#6ec6ff', '🌪️',
      'Norman, Oklahoma is home to the National Weather Center, where scientists watch for tornadoes across the Great Plains. You read the radar, track the storm on the map and decide which towns get the warning.',
      ['Read the radar', 'Track the storm', 'Send the warning']),
    J('pittsburgh-robots', 'Robot Lab Assistant', 'Pittsburgh', 'PA', 2, 48, 'robotlab', ['logic', 'science'], '#90a4ae', '🤖',
      'Pittsburgh has 446 bridges and the Robotics Institute at Carnegie Mellon, the first university robotics department in the country. You test the sensors, debug the code and race the rover across the lab floor.',
      ['Test the sensors', 'Debug the code', 'Race the rover']),
    J('atlanta-pilot', 'Airline Pilot', 'Atlanta', 'GA', 2, 50, 'airline', ['geography', 'logic'], '#42a5f5', '✈️',
      'Atlanta has the busiest airport in the world, with more than 100 million passengers a year. You plan the route across the states, check the fuel math and land the plane before the afternoon storms roll in.',
      ['Plan the route', 'Check the fuel', 'Land on time']),
    J('moab-ranger', 'National Park Ranger', 'Moab', 'UT', 2, 45, 'park', ['science', 'geography'], '#ff7043', '🏞️',
      'Arches National Park near Moab holds more than 2,000 natural stone arches, carved by wind and water out of red sandstone. You lead the sunrise hike, explain how the arches formed and help a lost hiker find the trail on the map.',
      ['Lead the sunrise hike', 'Explain the arches', 'Find the lost trail']),

    // ---------- tier 3 ----------
    J('seattle-games', 'Game Studio Designer', 'Seattle', 'WA', 3, 80, 'gamestudio', ['design', 'logic'], '#8b6cff', '🎮',
      'Seattle is home to Pike Place Market, the Space Needle and some of the biggest video game studios in the world. You sketch a new level, fix the puzzle that nobody can solve and pick the colors for the title screen.',
      ['Sketch a level', 'Fix the broken puzzle', 'Pick the title colors']),
    J('miami-architect', 'Architect', 'Miami', 'FL', 3, 75, 'architect', ['design', 'money', 'logic'], '#f06292', '📐',
      'Miami Beach has the largest collection of Art Deco buildings anywhere, painted in pastel pinks and blues. You draw the new building, work out the budget and make sure the floor plan actually fits the lot.',
      ['Draw the building', 'Work out the budget', 'Fit the floor plan']),
    J('charleston-marine', 'Marine Biologist', 'Charleston', 'SC', 3, 85, 'marine', ['science', 'geography'], '#26c6da', '🐢',
      'The South Carolina Aquarium in Charleston runs a sea turtle hospital that nurses injured turtles back to the ocean. You measure the patients, log their recovery and map where each turtle will swim once released.',
      ['Measure the turtles', 'Log the recovery', 'Map the release']),
    J('baltimore-doctor', 'Doctor', 'Baltimore', 'MD', 3, 90, 'doctor', ['science', 'words'], '#ef5350', '🩺',
      'Baltimore is home to Johns Hopkins Hospital, which opened in 1889 and trained many of the first modern doctors. You read the X-rays, learn the medical words and explain to a kid why bones heal.',
      ['Read the X-rays', 'Learn the medical words', 'Explain how bones heal']),
    J('nashville-mayor', 'Mayor’s Office Aide', 'Nashville', 'TN', 3, 78, 'cityhall', ['writing', 'money', 'reading'], '#ffa726', '🏛️',
      'Nashville is the capital of Tennessee and Music City, where the Grand Ole Opry has been on the radio since 1925. You write the mayor’s speech, read the letters from citizens and balance the budget for a new park.',
      ['Write the speech', 'Read the citizen letters', 'Budget the new park']),
    J('houston-space', 'Space Center Engineer', 'Houston', 'TX', 3, 92, 'space', ['science', 'logic'], '#5c6bc0', '🚀',
      'Houston is home to NASA’s Johnson Space Center and Mission Control, and “Houston” was the first word of the astronauts’ message home from the Moon. You check the launch math, test the suit systems and talk the crew through a problem in orbit.',
      ['Check the launch math', 'Test the space suit', 'Talk to the crew']),
    J('la-movies', 'Movie Studio Director', 'Los Angeles', 'CA', 3, 82, 'movies', ['design', 'writing'], '#ffd54f', '🎬',
      'The Hollywood sign went up in 1923 as an ad for houses and became the symbol of the movie business. You write the scene, choose the costumes and set and call action on the big stage.',
      ['Write the scene', 'Choose the costumes', 'Call action']),

    // ---------- tier 4 ----------
    J('nyc-stocks', 'Stock Exchange Trader', 'New York City', 'NY', 4, 170, 'stocks', ['money', 'logic'], '#3ddc97', '📈',
      'The New York Stock Exchange on Wall Street traces back to 1792, when 24 brokers signed an agreement under a buttonwood tree. You compare the deals, read the price charts and ring the closing bell.',
      ['Compare the deals', 'Read the charts', 'Ring the closing bell']),
    J('topeka-court', 'Judge’s Clerk', 'Topeka', 'KS', 4, 150, 'court', ['reading', 'writing', 'logic'], '#8d99a6', '⚖️',
      'Topeka is the capital of Kansas and where the Brown v. Board of Education case began, the Supreme Court decision that ended segregated schools. You read the case files, follow the chain of evidence and write the judge’s summary.',
      ['Read the case files', 'Follow the evidence', 'Write the summary']),
    J('neworleans-chef', 'Chef at a Famous Restaurant', 'New Orleans', 'LA', 4, 160, 'restaurant', ['money', 'science', 'design'], '#ff6b6b', '👨‍🍳',
      'New Orleans is famous for gumbo, jazz and the beignets at Café du Monde, which has been frying them in the French Quarter since 1862. You price the menu, test why the roux turns brown and plate every dish like art.',
      ['Price the menu', 'Perfect the roux', 'Plate like an artist']),
    J('sf-startup', 'Startup Founder', 'San Francisco', 'CA', 4, 175, 'startup', ['money', 'design', 'writing'], '#ffcf3f', '💡',
      'San Francisco has the Golden Gate Bridge, cable cars that climb the hills and more new tech companies than almost anywhere. You pitch your idea to investors, design the app and write the plan for the first year.',
      ['Pitch the investors', 'Design the app', 'Write the plan']),
    J('cleveland-orchestra', 'Orchestra Conductor', 'Cleveland', 'OH', 4, 145, 'orchestra', ['words', 'logic'], '#8b6cff', '🎻',
      'The Cleveland Orchestra is one of the five great American orchestras and has played at Severance Hall since 1931. You learn the Italian music words, count the tricky rhythms and lead 100 musicians through the finale.',
      ['Learn the music words', 'Count the rhythms', 'Lead the finale'])
  ];
})();
