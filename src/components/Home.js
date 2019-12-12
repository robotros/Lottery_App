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
class Home extends React.Component {
  state = {
    winning_number: [],
    pick_base: 0,
    pb_base: 0,
    white_ball: 69,
    count: 5,
    power_ball: 26,
    single_draw: 0,
    draw_counts: {},
    power_counts: {},
    suggested_play: [0, 0, 0, 0, 0],
    suggested_power: 0,
    white_choice: [],
    power_choice: [],
    random_choices: [],
    top_choice: {'picks': [0, 0, 0, 0, 0], 'pb': 0},
    data: [],
    pwrStdDev: 0,
    whtStdDev: 0,
    showData: false,
  }

  /**
  * Calculate standard deviation for counts
  */
  standardDeviation = () => {
    console.warn(this.state.draw_counts);
    let whiteStdDev = math.round(
        math.std(Object.values(this.state.draw_counts)));
    let powerStdDev = math.round(
        math.std(Object.values(this.state.power_counts)));
    this.setState({pwrStdDev: powerStdDev, whtStdDev: whiteStdDev});
  }

  /**
  * toggleData
  */
  toggleData = () =>{

    let status = this.state.showData ? false : true;
    this.setState({showData: status});
  }


  /**
  * generate suggested pick
  */
  suggestTop() {
    // console.warn(this.state.draw_counts);
    // console.warn(Math.round(
    //     this.state.single_draw*this.state.winning_number.length));
    // Create items array
    let items = Object.keys(this.state.draw_counts).map((key) => {
      return [key, this.state.draw_counts[key]];
    } );

    // Sort the array based on the second element
    items.sort((first, second) => {
      return first[1] - second[1];
    });

    let pbItems = Object.keys(this.state.power_counts).map((key) => {
      return [key, this.state.power_counts[key]];
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
            this.setState({suggested_play: m, suggested_power: p}) :
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
    let pb = math.pickRandom(this.state.power_choice);
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

    while (n < this.state.power_ball+1) {
      if (this.state.power_counts[n] <
        this.state.pb_base-this.state.pwrStdDev) {
        pb.push(n);
      }
      n++;
    }

    this.setState({white_choice: m, power_choice: pb});
  }

  /**
  * get number of occurances
  */
  generateCounts() {
    // create array for picks and powerball
    let main = [];
    let power = [];

    this.state.winning_number.forEach((winner)=>{
      let draw = winner.winning_numbers.split(' ').map(Number);
      let white = draw.slice(0, 5);
      let pb = draw.slice(5, 6);
      main = main.concat(white);
      power = power.concat(pb);
    });

    // generate counts for picks and powerball numbers
    let powerCount = power.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {});

    let pickCount = main.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {});

    this.setState({draw_counts: pickCount, power_counts: powerCount});
  }

  /**
  * set baseline for counts
  */
  setBase() {
    let base = Math.round(
        this.state.single_draw*this.state.winning_number.length);
    let powerBase =
      Math.round((1/this.state.power_ball)*this.state.winning_number.length);
    this.setState({pick_base: base, pb_base: powerBase});
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
    await SocrataAPI.getWinners()
        .then( (data) => {
          this.setState({winning_number: data});
        });
    // console.warn(this.state.winning_number);
  }

  /**
  * Run build data for component
  */
  buildData = async () =>{
    let dataSet = [];
    let rollOptions =(math.combinations(this.state.white_choice.length,
                      this.state.white_choice.length < 5 ?
                        this.state.white_choice.length :
                        5) *
      this.state.power_choice.length).toString()
        .replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    let totalDraws = this.state.winning_number.length;
    let lastDate = this.state.winning_number[totalDraws-1].draw_date
        .split('T')[0];
    let lastWin = this.state.winning_number[totalDraws-1].winning_numbers;

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

    dataSet.push({Description: 'Power Base',
      Value: this.state.pb_base});

    dataSet.push({Description: 'STD Deviation',
      Value: this.state.pwrStdDev});

    this.setState({data: dataSet});
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
        <h1>PowerBall Pick Generator</h1>
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
              <a href='https://www.buylottoonline.com/playlotto.php?lot_id=3&account=54d8aa45'
                target='_blank'
                rel='noreferrer noopener'
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='shopping-cart' /> Buy
              </a>
            </div>
            <div className='col-sm-2'>
              <button type='button'
                onClick={this.toggleData}
                className='btn btn-primary mb-1'>
                <FontAwesomeIcon icon='chart-bar' /> Display Data
              </button>
            </div>
          </div>
        </div>
        <hr></hr>
        {this.state.showData ? <div>
          <h2>Data</h2>
          <Table
            data={this.state.data}
          />
        </div>
        : <hr></hr>}
      </div>
    );
  }
}

export default Home;
