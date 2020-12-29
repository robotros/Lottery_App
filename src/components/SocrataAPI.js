
// Unique Token obtained at https://data.lacity.org/profile/robotros/
// api documentation available at https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr

const api = 'https://data.ny.gov/resource/';
const powerball = 'd6yy-54nr.json';
const megamillion = '5xaw-6ayf.json';

// Unique Token obtained at https://data.lacity.org/profile/robotros/
// api documentation available at https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr

let token = '6R2aVyEytig0yKcvBpsD8nXoe';
let autho = '$$app_token='+token;

export const getWinners = () =>
  fetch(`${api}${powerball}?${autho}&$where=draw_date>%272015-10-06T00:00:00%27`)
      .then((res) => res.json());

export const getMegaWinners = () =>
  fetch(`${api}${megamillion}?$where=draw_date>%272017-10-31T00:00:00%27`)
      .then((res) => res.json());

export const checkWinner = (numbers) =>
  fetch(`${api}${powerball}?${autho}&winning_numbers=${numbers}`)
      .then((res) => res.json());
