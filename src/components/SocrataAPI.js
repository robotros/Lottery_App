// Draw history from NY Open Data.
// Powerball: https://data.ny.gov/Government-Finance/Lottery-Powerball-Winning-Numbers-Beginning-2010/d6yy-54nr
// Mega Millions: https://data.ny.gov/Government-Finance/Lottery-Mega-Millions-Winning-Numbers-Beginning-2002/5xaw-6ayf

const api = 'https://data.ny.gov/resource/';
const pageSize = 1000;
const maxRows = 20000;
const datasetPattern = /^[a-z0-9-]+\.json$/;
const paddedBall = /^\d{2}$/;
const fiveBalls = /^\d{2}(?: \d{2}){4}$/;
const sixBalls = /^\d{2}(?: \d{2}){5}$/;

/**
 * Percent-encode a query string. Keys and values are encoded separately.
 * @param {Object} params
 * @return {string}
 */
function queryString(params) {
  return Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
}

/**
 * @param {string} dataset resource file name
 * @param {Object} params query parameters
 * @return {string} url
 */
function buildUrl(dataset, params) {
  if (!datasetPattern.test(dataset)) {
    throw new Error('Unexpected draw dataset.');
  }
  return api + dataset + '?' + queryString(params);
}

/**
 * Fetch JSON and require an array body.
 * @param {string} url
 * @return {Promise<Array>}
 */
async function fetchRows(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error('Could not reach the draw service.');
  }
  if (!response.ok) {
    throw new Error('Draw request failed (' + response.status + ').');
  }
  let body;
  try {
    body = await response.json();
  } catch (err) {
    throw new Error('Draw service returned an unreadable response.');
  }
  if (!Array.isArray(body)) {
    const message = body && body.message ?
      body.message :
      'Unexpected response from the draw service.';
    throw new Error(message);
  }
  return body;
}

/**
 * Load every draw after config.since, newest first.
 * Pages with $limit/$offset because a single response is capped.
 * @param {Object} config game configuration
 * @return {Promise<Array>}
 */
export async function getDraws(config) {
  const where = 'draw_date > \'' + config.since + '\'';
  const rows = [];
  let offset = 0;

  while (offset <= maxRows) {
    const page = await fetchRows(buildUrl(config.dataset, {
      '$where': where,
      '$order': 'draw_date DESC',
      '$limit': String(pageSize),
      '$offset': String(offset),
    }));
    if (offset > 0 && page.length > 0 && rows.length > 0 &&
        page[0].draw_date === rows[0].draw_date) {
      throw new Error('Could not page through draw history.');
    }
    page.forEach(function(row) {
      rows.push(row);
    });
    if (page.length < pageSize) {
      return rows;
    }
    offset += page.length;
  }

  throw new Error('Draw history was larger than expected.');
}

/**
 * Look up a line on this game's own dataset.
 * Only a zero-padded numeric draw is sent, and the value is percent-encoded.
 * Powerball stores six numbers in winning_numbers.
 * Mega Millions stores five white balls there and the Mega Ball separately.
 * @param {Object} config game configuration
 * @param {{picks: string[], pb: string}} line
 * @return {Promise<Array>}
 */
export async function checkWinner(config, line) {
  if (!line || !Array.isArray(line.picks) || line.picks.length !== 5 ||
      !line.picks.every(function(ball) {
        return paddedBall.test(ball);
      }) || !paddedBall.test(line.pb)) {
    throw new Error('Draw numbers were not a valid line.');
  }

  const params = {};
  if (config.specialField) {
    if (!/^[a-z_]+$/.test(config.specialField)) {
      throw new Error('Draw numbers were not a valid line.');
    }
    const winningNumbers = line.picks.join(' ');
    if (!fiveBalls.test(winningNumbers)) {
      throw new Error('Draw numbers were not a valid line.');
    }
    params.winning_numbers = winningNumbers;
    params[config.specialField] = line.pb;
  } else {
    const winningNumbers = line.picks.concat([line.pb]).join(' ');
    if (!sixBalls.test(winningNumbers)) {
      throw new Error('Draw numbers were not a valid line.');
    }
    params.winning_numbers = winningNumbers;
  }

  Object.keys(params).forEach(function(key) {
    params[key] = String(params[key]);
  });
  return fetchRows(buildUrl(config.dataset, params));
}
