import React from 'react';
import Game from './Game';

// Current Powerball matrix, in use since the 2015-10-07 drawing.
// 2025+ winning numbers in this dataset stay within 1-69 and 1-26.
const powerball = {
  id: 'powerball',
  title: 'Powerball Pick Generator',
  dataset: 'd6yy-54nr.json',
  since: '2015-10-06T00:00:00',
  whiteMax: 69,
  specialMax: 26,
  specialLabel: 'Powerball',
  specialField: null,
};

/**
 * Powerball route.
 * @return {React.Element}
 */
function Home() {
  return <Game config={powerball} />;
}

export default Home;
