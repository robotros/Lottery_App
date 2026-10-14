import React from 'react';
import Game from './Game';

// White balls have been 1-70 since the 2017-10-31 matrix change.
// Mega Ball dropped from 1-25 to 1-24 after 2025-04-04: that is the last
// draw with Mega Ball 25, and every later draw through 2026-10-09 is 1-24.
const megaMillions = {
  id: 'megamillions',
  title: 'Mega Millions Pick Generator',
  dataset: '5xaw-6ayf.json',
  since: '2017-10-31T00:00:00',
  whiteMax: 70,
  specialMax: 24,
  specialLabel: 'Mega Ball',
  specialField: 'mega_ball',
};

/**
 * Mega Millions route.
 * @return {React.Element}
 */
function MegaMillions() {
  return <Game config={megaMillions} />;
}

export default MegaMillions;
