/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
import React from 'react';
import * as SocrataAPI from './SocrataAPI';
import * as math from 'mathjs';
import SuggestedPlay from './SuggestedPlay';


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
  }


  /**
  * Javadoc here
  */
  suggestTop() {
    // Create items array
    let items = Object.keys(this.state.draw_counts).map((key) => {
      return [key, this.state.draw_counts[key]];
    } );

    // Sort the array based on the second element
    items.sort((first, second) => {
      return second[1] - first[1];
    });

    let pbItems = Object.keys(this.state.power_counts).map((key) => {
      return [key, this.state.power_counts[key]];
    } );

    // Sort the array based on the second element
    pbItems.sort((first, second) => {
      return second[1] - first[1];
    });

    let tp = {'picks': items.slice(0, 5).map((i) => {
      return i[0];
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
  * Make SocrataAPI call to check streamer Lotto numbers
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
          } else {
            this.suggestTop();
          }
        });
  }

  /**
  * Roll random selection
  */
  suggestRandom() {
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
      if (this.state.draw_counts[i] < this.state.pick_base) {
        m.push(i);
      }
      i++;
    }

    let pb = [];
    let n = 1;

    while (n < this.state.power_ball+1) {
      if (this.state.power_counts[n] < this.state.pb_base) {
        pb.push(n);
      }
      n++;
    }

    this.setState({white_choice: m, power_choice: pb}, () => {
      this.suggestRandom();
    });
  }

  /**
  * JDoc here
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

    this.setState({draw_counts: pickCount, power_counts: powerCount}, () => {
      this.filterWinners();
    });
  }

  /**
  * Roll random selection
  */
  setBase() {
    let base = Math.round(
        this.state.single_draw*this.state.winning_number.length);
    let powerBase = Math.round((1/this.state.power_ball)*this.state.winning_number.length);
    this.setState({pick_base: base, pb_base: powerBase}, () => {
      this.generateCounts();
    });
  }

  /**
  * JavaDoc Here
  * @param {int} count
  * @param {int} draw
  */
  setSingleDraw(count, draw) {
    let chance = 0;
    while (draw < 5) {
      chance = chance + (1/count);
      count--;
      draw++;
    }

    this.setState({single_draw: chance});
  }

  /**
  * Make SocrataAPI call to get streamer Lotto numbers
  */
  async getWinners() {
    await SocrataAPI.getWinners()
        .then( (data) => {
          this.setState({winning_number: data}, ()=>{
            this.setBase();
          });
        });
  }

  /**
  * Run methods once component has mounted
  */
  componentDidMount() {
    this.setSingleDraw(this.state.white_ball, 0);
    this.getWinners();
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
        </div>
        <hr></hr>
        <h2>Data</h2>
        <ul>
          <li>draws to date: {this.state.winning_number.length}</li>
          <li>Available Random Options: {((math.combinations(
              this.state.white_choice.length,
              this.state.white_choice.length < 5 ?
                this.state.white_choice.length : 5)*this.state.power_choice.length)+ '')
              .replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</li>
        </ul>
      </div>
    );
  }
}

export default Home;
