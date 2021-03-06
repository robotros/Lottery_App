/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

import React from 'react';
import * as SocrataAPI from './SocrataAPI';
import * as math from 'mathjs';
import SuggestedPlay from './SuggestedPlay';
import Table from './Table';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

/**
* React Component to Render Lotto Picker home page
* @author [Aron Roberts](https://github.com/robotros)
*/
class MegaMillions extends React.Component {
  state = {
    winning_number: [], // historical data
    pick_base: 0, // calculated base for normal number
    pb_base: 0, // calculated base for poweball
    white_ball: 70, // maximum normal ball number
    count: 5, // number of normal picks
    mega_ball: 25, // maximum megaball number
    single_draw: 0, // odds of number for single draw
    draw_counts: {}, // draw counts for normal balls
    mega_counts: {}, // draw counts for mega balls
    suggested_play: [0, 0, 0, 0, 0],
    suggested_mega: 0,
    white_choice: [],
    mega_choice: [],
    random_choices: [],
    top_choice: {'picks': [0, 0, 0, 0, 0], 'pb': 0},
    data: [], // dataset for logic
    pwrStdDev: 0, // standard deviation for megaball set
    whtStdDev: 0, // standard deviation for normal balls
    showData: false,
    showHistory: false,
  }

  /**
  * Calculate standard deviation for counts
  */
  standardDeviation = () => {
    let whiteStdDev = math.round(
        math.std(Object.values(this.state.draw_counts)));
    let megaStdDev = math.round(
        math.std(Object.values(this.state.mega_counts)));
    this.setState({pwrStdDev: megaStdDev, whtStdDev: whiteStdDev});
  }

  /**
  * toggleData
  */
  toggleData = () =>{
    let status = this.state.showData ? false : true;
    this.setState({showData: status});
  }

  /**
  * toggleHistory
  */
  toggleHistory = () =>{
    let status = this.state.showHistory ? false : true;
    this.setState({showHistory: status});
  }


  /**
  * generate suggested pick
  */
  suggestTop() {
    // Create items array
    let items = Object.keys(this.state.draw_counts).map((key) => {
      return [key, this.state.draw_counts[key]];
    } );

    // Sort the array based on the second element
    items.sort((first, second) => {
      return first[1] - second[1];
    });

    let pbItems = Object.keys(this.state.mega_counts).map((key) => {
      return [key, this.state.mega_counts[key]];
    } );

    // Sort the array based on the second element
    pbItems.sort((first, second) => {
      return first[1]-second[1];
    });

    let tp = {'picks': items.slice(0, 5).map((i) => {
      return i[0] < 10 ? '0'+i[0]: i[0];
    } ).sort(), 'pb': pbItems.slice(0, 1).map((i) => {
      return i[0];
    } )};

    let test = tp.picks.concat(tp.pb).join(' ');
    SocrataAPI.checkWinner(test)
        .then((data) =>{
          data.length < 1 ?
            this.setState({top_choice: tp}) :
            console.warn('No Top Picks');
        });
  }

  /**
  * Make SocrataAPI call to check Lotto numbers
  * @param {array} m
  * @param {int} p
  */
  checkWin(m, p) {
    let test = m.concat(p).join(' ');
    SocrataAPI.checkWinner(test)
        .then((data) =>{
          data.length < 1 ?
            this.setState({suggested_play: m, suggested_mega: p}) :
            this.suggestRandom();
          if (this.state.random_choices.length < 5) {
            let choices = this.state.random_choices;
            choices.push({'picks': m, 'pb': p});
            this.setState({random_choices: choices}, () => {
              this.suggestRandom();
            });
          }
        });
  }

  /**
  * Reset Random Rolls
  */
  newRandom =async () => {
    await this.setState({random_choices: []});
    this.suggestRandom();
  }

  /**
  * Roll random selection
  */
  suggestRandom = () => {
    let pb = math.pickRandom(this.state.mega_choice);
    let picks = math.pickRandom(this.state.white_choice, 5)
        .sort(function(a, b) {
          return a-b;
        });
    this.checkWin(picks, pb);
  }

  /**
  * Roll random selection
  */
  filterWinners() {
    let m = [];
    let i = 1;

    while (i < this.state.white_ball+1) {
      if (this.state.draw_counts[i] <
        this.state.pick_base-this.state.whtStdDev) {
        m.push(i);
      }
      i++;
    }

    let pb = [];
    let n = 1;

    while (n < this.state.mega_ball+1) {
      if (this.state.mega_counts[n] <
        this.state.pb_base-this.state.pwrStdDev) {
        pb.push(n);
      }
      n++;
    }

    this.setState({white_choice: m, mega_choice: pb});
  }

  /**
  * get number of occurances
  */
  generateCounts() {
    // create array for picks and megaball
    let main = [];
    let mega = [];

    this.state.winning_number.forEach((winner)=>{
      let draw = winner.winning_numbers.split(' ').map(Number);
      let white = draw.slice(0, 5);
      let pb = Number(winner.mega_ball);
      main = main.concat(white);
      mega = mega.concat(pb);
    });

    // generate counts for picks and megaball numbers
    let megaCount = mega.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {});

    let pickCount = main.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {});

    this.setState({draw_counts: pickCount, mega_counts: megaCount});
  }

  /**
  * set baseline for counts
  */
  setBase() {
    let base = Math.round(
        this.state.single_draw*this.state.winning_number.length);
    let megaBase =
      Math.round((1/this.state.mega_ball)*this.state.winning_number.length);
    this.setState({pick_base: base, pb_base: megaBase});
  }

  /**
  * Calculate chance a number will appear in given
  * number of draws
  * @param {int} count
  * @param {int} draw
  */
  setSingleDraw(count, draw) {
    let chance = 0;
    while (draw < 5) {
      chance = chance + (1/(count-1));
      count--;
      draw++;
    }

    this.setState({single_draw: chance});
  }

  /**
  * Make SocrataAPI call to get winning Lotto numbers
  */
  async getWinners() {
    await SocrataAPI.getMegaWinners()
        .then( (data) => {
          this.setState({winning_number: data});
        });
     console.warn(this.state.winning_number);
  }

  /**
  * Run build data for component
  */
  buildData = () =>{
    let dataSet = [];
    let rollOptions =(math.combinations(this.state.white_choice.length,
                      this.state.white_choice.length < this.state.count ?
                        this.state.white_choice.length :
                        5) *
      this.state.mega_choice.length).toString()
        .replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    let totalDraws = this.state.winning_number.length;
    let lastDate = this.state.winning_number[totalDraws-1].draw_date
        .split('T')[0];
    let lastWin = this.state.winning_number[totalDraws-1].winning_numbers+
      ' '+this.state.winning_number[totalDraws-1].mega_ball;

    dataSet.push({Description: 'Draws to Date',
      Value: totalDraws});

    dataSet.push({Description: 'Roll Options',
      Value: rollOptions});

    dataSet.push({Description: 'Recent Draw Date',
      Value: lastDate});

    dataSet.push({Description: 'Recent Win Numbers',
      Value: lastWin});

    dataSet.push({Description: 'White Base',
      Value: this.state.pick_base});

    dataSet.push({Description: 'STD Deviation',
      Value: this.state.whtStdDev});

    dataSet.push({Description: 'Mega Base',
      Value: this.state.pb_base});

    dataSet.push({Description: 'STD Deviation',
      Value: this.state.pwrStdDev});


    this.setState({data: dataSet});

    let drawCountWeights =[];

    Object.entries(this.state.draw_counts).forEach((draw)=> {
      let diff = this.state.pick_base - draw[1];
      let drawWeight = math.abs(diff)===0 ? 0 :
        math.abs(diff) < this.state.whtStdDev ? math.abs(diff)/diff :
        diff <0 ? diff +this.state.whtStdDev-1 :
        diff-this.state.whtStdDev+1;

      drawCountWeights.push({Number: draw[0],
        Count: draw[1],
        Weight: drawWeight});
    });

    this.setState({drawWeights: drawCountWeights});


    let megaCountWeights =[];

    Object.entries(this.state.mega_counts).forEach((draw)=> {
      let diff = this.state.pb_base - draw[1];
      let drawWeight = math.abs(diff)===0 ? 0 :
        math.abs(diff) < this.state.pwrStdDev ? math.abs(diff)/diff :
        diff <0 ? diff +this.state.pwrStdDev-1 :
        diff-this.state.pwrStdDev+1;

      megaCountWeights.push({Number: draw[0],
        Count: draw[1],
        Weight: drawWeight});
    });

    this.setState({megaWeights: megaCountWeights});
  }


  /**
  * Run Main Logic for component
  */
  main = async () => {
    await this.setSingleDraw(this.state.white_ball, 0);
    await this.getWinners();
    await this.setBase();
    await this.generateCounts();
    await this.standardDeviation();
    await this.filterWinners();
    this.buildData();
    this.suggestRandom();
    this.suggestTop();
  };

  /**
  * Run methods once component has mounted
  */
  componentDidMount() {
    this.main();
  }

  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <div className = 'Home container'>
        <h1>MegaMillions Pick Generator</h1>
        <hr></hr>
        <h2> Picks </h2>
        <div>
          <h3>Top Pick</h3>
          <SuggestedPlay
            sp={this.state.top_choice}
          />
          <h3>Random Picks</h3>
          {this.state.random_choices.length > 1 ?
            this.state.random_choices.map((rc, index) =>
              <SuggestedPlay
                key = {index}
                sp = {rc}
              />
            )
            : <p></p>
          }
          <br></br>
          <div className='row'>
            <div className='col-sm-2'>
              <button type='button'
                onClick={this.newRandom}
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='dice' /> New Picks
              </button>
            </div>
            <div className='col-sm-2'>
              <a 
                href='https://robourl.link/MegaMillions'
                target='_blank'
                rel='noreferrer noopener'
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='shopping-cart' /> Buy
              </a>
            </div>
          </div>
          <hr></hr>
          <div className='row'>
            <div className='col-sm-2'>
              <button type='button'
                onClick={this.toggleData}
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='chart-bar' /> Display Data
              </button>
            </div>
            <div className='col-sm-2'>
              <button type='button'
                onClick={this.toggleHistory}
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='history' /> Display History
              </button>
            </div>
          </div>
        </div>
        {this.state.showData ? <div>
          <hr></hr>
          <div className='row'>
            <div className='col-sm-12'>
              <h2>Data</h2> <br></br>
              <Table
                data={this.state.data}
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-sm-6'>
              <h2>Draw Counts</h2>
              <Table
                data={this.state.drawWeights}
              />
            </div>
            <div className='col-sm-6'>
              <h2>Mega Counts</h2>
              <Table
                data={this.state.megaWeights}
              />
            </div>
          </div>
        </div>
        : <br></br>}
        {this.state.showHistory ? <div>
          <hr></hr>
          <h2>Historical Draws</h2>
          <Table
            data={this.state.winning_number}
          />
        </div> : <br></br>}
      </div>
    );
  }
}

export default MegaMillions;
