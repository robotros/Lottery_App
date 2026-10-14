/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

import React from 'react';
import PropTypes from 'prop-types';
import * as math from 'mathjs';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as SocrataAPI from './SocrataAPI';
import SuggestedPlay from './SuggestedPlay';
import Table from './Table';

const randomLineCount = 5;
const maxRandomAttempts = 40;

/**
 * @param {number} max inclusive upper bound, starting at 1
 * @return {number[]}
 */
function range(max) {
  const values = [];
  for (let n = 1; n <= max; n++) {
    values.push(n);
  }
  return values;
}

/**
 * @param {number|string} value
 * @return {string}
 */
function pad2(value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const text = String(value);
  return text.length < 2 ? '0' + text : text;
}

/**
 * @param {string} value ISO draw timestamp
 * @return {string}
 */
function formatDrawDate(value) {
  if (typeof value !== 'string') {
    return '';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return value;
  }
  const date = new Date(
      Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * @param {number} value
 * @return {string}
 */
function withCommas(value) {
  return String(value).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

/**
 * @param {number} count ball pool size
 * @return {number}
 */
function singleDrawChance(count) {
  let chance = 0;
  let draw = 0;
  let remaining = count;
  while (draw < 5) {
    chance = chance + (1 / (remaining - 1));
    remaining--;
    draw++;
  }
  return chance;
}

/**
 * @param {number} count
 * @param {number} base
 * @param {number} deviation
 * @return {number}
 */
function drawWeight(count, base, deviation) {
  const diff = base - count;
  if (Math.abs(diff) === 0) {
    return 0;
  }
  if (Math.abs(diff) < deviation) {
    return Math.abs(diff) / diff;
  }
  if (diff < 0) {
    return diff + deviation - 1;
  }
  return diff - deviation + 1;
}

/**
 * @param {Object} draw
 * @param {Object} config
 * @return {{whites: number[], special: number}|null}
 */
function parseDraw(draw, config) {
  if (!draw || typeof draw.winning_numbers !== 'string') {
    return null;
  }
  const parts = draw.winning_numbers.trim().split(/\s+/).map(Number);
  if (parts.length < 5 || parts.slice(0, 5).some(function(n) {
    return !isFinite(n);
  })) {
    return null;
  }
  const special = config.specialField ?
    Number(draw[config.specialField]) :
    parts[5];
  if (!isFinite(special)) {
    return null;
  }
  return {whites: parts.slice(0, 5), special: special};
}

/**
 * @param {Object} draw
 * @param {Object} config
 * @return {string}
 */
function recentNumbers(draw, config) {
  if (config.specialField) {
    return draw.winning_numbers + ' ' + pad2(draw[config.specialField]);
  }
  return draw.winning_numbers;
}

/**
 * Frequency tables and the least-drawn line. Never throws; returns an error
 * string when the response cannot be summarized.
 * @param {Array} draws newest first
 * @param {Object} config
 * @return {Object}
 */
function buildModel(draws, config) {
  const empty = {
    error: 'No draws were returned.',
    summary: [],
    whiteWeights: [],
    specialWeights: [],
    history: [],
    top: null,
  };
  if (!Array.isArray(draws) || draws.length === 0) {
    return empty;
  }
  const latest = draws[0];
  if (!latest || typeof latest.draw_date !== 'string' ||
      typeof latest.winning_numbers !== 'string') {
    return Object.assign({}, empty, {
      error: 'Draw history was missing the latest result.',
    });
  }

  const whiteCounts = {};
  const specialCounts = {};
  range(config.whiteMax).forEach(function(n) {
    whiteCounts[n] = 0;
  });
  range(config.specialMax).forEach(function(n) {
    specialCounts[n] = 0;
  });

  draws.forEach(function(draw) {
    const parsed = parseDraw(draw, config);
    if (!parsed) {
      return;
    }
    parsed.whites.forEach(function(n) {
      if (n >= 1 && n <= config.whiteMax) {
        whiteCounts[n] += 1;
      }
    });
    if (parsed.special >= 1 && parsed.special <= config.specialMax) {
      specialCounts[parsed.special] += 1;
    }
  });

  const whiteValues = range(config.whiteMax).map(function(n) {
    return whiteCounts[n];
  });
  const specialValues = range(config.specialMax).map(function(n) {
    return specialCounts[n];
  });
  const whiteDeviation = Number(math.round(math.std(whiteValues))) || 0;
  const specialDeviation = Number(math.round(math.std(specialValues))) || 0;
  const whiteBase = Math.round(
      singleDrawChance(config.whiteMax) * draws.length);
  const specialBase = Math.round((1 / config.specialMax) * draws.length);

  const leastWhites = range(config.whiteMax)
      .map(function(n) {
        return [n, whiteCounts[n]];
      })
      .sort(function(a, b) {
        return a[1] - b[1] || a[0] - b[0];
      })
      .slice(0, 5)
      .map(function(item) {
        return item[0];
      })
      .sort(function(a, b) {
        return a - b;
      })
      .map(pad2);
  const leastSpecial = range(config.specialMax)
      .map(function(n) {
        return [n, specialCounts[n]];
      })
      .sort(function(a, b) {
        return a[1] - b[1] || a[0] - b[0];
      })[0];

  const rollOptions = withCommas(
      math.combinations(config.whiteMax, 5) * config.specialMax
  );
  const recentDate = formatDrawDate(latest.draw_date);

  const history = draws.map(function(draw) {
    const row = {
      'Date': formatDrawDate(draw.draw_date),
      'Winning numbers': draw.winning_numbers || '',
    };
    if (config.specialField) {
      row[config.specialLabel] = pad2(draw[config.specialField]);
    } else {
      row['Multiplier'] = draw.multiplier || '';
      row['Double Play'] = draw.double_play_winning_numbers || '';
    }
    return row;
  });

  const summary = [
    {Description: 'Draws to date', Value: draws.length},
    {
      Description: 'Matrix',
      Value: '5/' + config.whiteMax + ' + 1/' + config.specialMax,
    },
    {Description: 'Roll options', Value: rollOptions},
    {Description: 'Recent draw date', Value: recentDate},
    {Description: 'Recent win numbers', Value: recentNumbers(latest, config)},
    {Description: 'White base', Value: whiteBase},
    {Description: 'White deviation', Value: whiteDeviation},
    {Description: config.specialLabel + ' base', Value: specialBase},
    {Description: config.specialLabel + ' deviation', Value: specialDeviation},
  ];

  const whiteWeights = range(config.whiteMax).map(function(n) {
    return {
      Number: n,
      Count: whiteCounts[n],
      Weight: drawWeight(whiteCounts[n], whiteBase, whiteDeviation),
    };
  });
  const specialWeights = range(config.specialMax).map(function(n) {
    return {
      Number: n,
      Count: specialCounts[n],
      Weight: drawWeight(specialCounts[n], specialBase, specialDeviation),
    };
  });

  return {
    error: '',
    summary: summary,
    whiteWeights: whiteWeights,
    specialWeights: specialWeights,
    history: history,
    top: {
      picks: leastWhites,
      pb: pad2(leastSpecial[0]),
    },
  };
}

/**
 * Uniform line from the current official matrix.
 * @param {Object} config
 * @return {{picks: string[], pb: string}}
 */
function drawRandomLine(config) {
  const picks = math.pickRandom(range(config.whiteMax), 5)
      .map(function(n) {
        return Number(n);
      })
      .sort(function(a, b) {
        return a - b;
      })
      .map(pad2);
  const special = pad2(math.pickRandom(range(config.specialMax)));
  return {picks: picks, pb: special};
}

/**
 * @param {{picks: string[], pb: string}} line
 * @return {string}
 */
function lineKey(line) {
  return line.picks.join(' ') + ' ' + line.pb;
}

/**
 * Shared Powerball and Mega Millions picker.
 */
class Game extends React.Component {
  state = {
    status: 'loading',
    error: '',
    pickError: '',
    summary: [],
    whiteWeights: [],
    specialWeights: [],
    history: [],
    top: null,
    topHidden: false,
    randomPicks: [],
    showData: false,
    showHistory: false,
    picking: false,
  };

  mounted = false;
  pickRequest = 0;

  /**
   * @param {Object} config
   * @param {number} count
   * @return {Promise<Array>}
   */
  collectLines = async (config, count) => {
    const lines = [];
    const seen = {};
    let attempts = 0;
    while (lines.length < count && attempts < maxRandomAttempts) {
      attempts += 1;
      const line = drawRandomLine(config);
      const key = lineKey(line);
      if (seen[key]) {
        continue;
      }
      seen[key] = true;
      const hits = await SocrataAPI.checkWinner(config, line);
      if (!Array.isArray(hits)) {
        throw new Error('Could not check past winning numbers.');
      }
      if (hits.length > 0) {
        continue;
      }
      lines.push(line);
    }
    if (lines.length < count) {
      throw new Error('Could not build a full set of new lines.');
    }
    return lines;
  };

  /**
   * Replace random lines without mutating the previous state array.
   */
  loadRandom = async () => {
    const config = this.props.config;
    const request = this.pickRequest + 1;
    this.pickRequest = request;
    this.setState({picking: true, pickError: ''});
    try {
      const lines = await this.collectLines(config, randomLineCount);
      if (!this.mounted || request !== this.pickRequest) {
        return;
      }
      this.setState({
        randomPicks: lines,
        picking: false,
        pickError: '',
      });
    } catch (err) {
      if (!this.mounted || request !== this.pickRequest) {
        return;
      }
      this.setState({
        picking: false,
        pickError: err.message || 'Could not build new lines.',
      });
    }
  };

  /**
   * Load history, then the least-drawn line and random lines.
   */
  loadDraws = async () => {
    const config = this.props.config;
    this.setState({status: 'loading', error: '', pickError: ''});
    try {
      const draws = await SocrataAPI.getDraws(config);
      const model = buildModel(draws, config);
      if (model.error) {
        if (this.mounted) {
          this.setState({status: 'error', error: model.error});
        }
        return;
      }
      let topHidden = false;
      if (model.top) {
        const topHits = await SocrataAPI.checkWinner(config, model.top);
        topHidden = Array.isArray(topHits) && topHits.length > 0;
      }
      const lines = await this.collectLines(config, randomLineCount);
      if (!this.mounted) {
        return;
      }
      this.setState({
        status: 'ready',
        error: '',
        summary: model.summary,
        whiteWeights: model.whiteWeights,
        specialWeights: model.specialWeights,
        history: model.history,
        top: topHidden ? null : model.top,
        topHidden: topHidden,
        randomPicks: lines,
        picking: false,
        pickError: '',
      });
    } catch (err) {
      if (!this.mounted) {
        return;
      }
      this.setState({
        status: 'error',
        error: err.message || 'Could not load draws.',
        summary: [],
        history: [],
        top: null,
        randomPicks: [],
      });
    }
  };

  /**
   * Start the load once the page is on screen.
   */
  componentDidMount() {
    this.mounted = true;
    this.loadDraws();
  }

  /**
   * Ignore responses that arrive after navigation.
   */
  componentWillUnmount() {
    this.mounted = false;
  }

  /** @return {void} */
  toggleData = () => {
    this.setState(function(prev) {
      return {showData: !prev.showData};
    });
  };

  /** @return {void} */
  toggleHistory = () => {
    this.setState(function(prev) {
      return {showHistory: !prev.showHistory};
    });
  };

  /**
   * @return {React.Component}
   */
  render() {
    const config = this.props.config;
    if (this.state.status === 'loading') {
      return (
        <div className='Home container'>
          <h1>{config.title}</h1>
          <p role='status'>Loading draws…</p>
        </div>
      );
    }
    if (this.state.status === 'error') {
      return (
        <div className='Home container'>
          <h1>{config.title}</h1>
          <div className='alert alert-danger' role='alert'>
            {this.state.error}
          </div>
        </div>
      );
    }

    const matrixNote = 'Random picks are 5 numbers from 1–' + config.whiteMax +
      ' and one ' + config.specialLabel + ' from 1–' + config.specialMax +
      '. Lines that have already won are left out.';

    return (
      <div className='Home container'>
        <h1>{config.title}</h1>
        <hr></hr>
        <h2>Picks</h2>
        <h3>Least-drawn combination</h3>
        <p>The five white balls and {config.specialLabel} that appear least
          often in this draw history.
        </p>
        {this.state.topHidden ?
          <p>That least-drawn combination has already been drawn.</p> :
          <SuggestedPlay sp={this.state.top} />
        }
        <h3>Random picks</h3>
        <p>{matrixNote}</p>
        {this.state.pickError ?
          <div className='alert alert-danger' role='alert'>
            {this.state.pickError}
          </div> : null
        }
        {this.state.randomPicks.map(function(line) {
          return (
            <SuggestedPlay
              key={lineKey(line)}
              sp={line}
            />
          );
        })}
        <br></br>
        <div className='row'>
          <div className='col-sm-4'>
            <button type='button'
              onClick={this.loadRandom}
              disabled={this.state.picking}
              className='btn btn-primary mb-1'>
              <FontAwesomeIcon icon='dice' /> New Picks
            </button>
          </div>
        </div>
        <hr></hr>
        <div className='row'>
          <div className='col-sm-3'>
            <button type='button'
              onClick={this.toggleData}
              className='btn btn-primary mb-1'>
              <FontAwesomeIcon icon='chart-bar' /> Display Data
            </button>
          </div>
          <div className='col-sm-3'>
            <button type='button'
              onClick={this.toggleHistory}
              className='btn btn-primary mb-1'>
              <FontAwesomeIcon icon='history' /> Display History
            </button>
          </div>
        </div>
        {this.state.showData ?
          <div>
            <hr></hr>
            <h2>Data</h2>
            <Table data={this.state.summary} />
            <div className='row'>
              <div className='col-sm-6'>
                <h2>Draw counts</h2>
                <Table data={this.state.whiteWeights} />
              </div>
              <div className='col-sm-6'>
                <h2>{config.specialLabel} counts</h2>
                <Table data={this.state.specialWeights} />
              </div>
            </div>
          </div> : null
        }
        {this.state.showHistory ?
          <div>
            <hr></hr>
            <h2>Historical draws</h2>
            <Table data={this.state.history} />
          </div> : null
        }
      </div>
    );
  }
}

Game.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string.isRequired,
    dataset: PropTypes.string.isRequired,
    since: PropTypes.string.isRequired,
    whiteMax: PropTypes.number.isRequired,
    specialMax: PropTypes.number.isRequired,
    specialLabel: PropTypes.string.isRequired,
    specialField: PropTypes.string,
  }).isRequired,
};

export default Game;
