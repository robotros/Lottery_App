
const api = 'https://data.ny.gov/resource/d6yy-54nr.json';

// Unique Token obtained at https://data.lacity.org/profile/robotros/
let token = '6R2aVyEytig0yKcvBpsD8nXoe';
let autho = '$$app_token='+token;

export const getWinners = () =>
  fetch(`${api}?${autho}`)
      .then((res) => res.json());

export const checkWinner = (numbers) =>
  fetch(`${api}?${autho}&winning_numbers=${numbers}`)
      .then((res) => res.json());
