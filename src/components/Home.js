import React from 'react';
import * as SocrataAPI from './SocrataAPI';
import * as math from 'mathjs';


/**
* React Component to Render Lotto Picker home page
* @author [Aron Roberts](https://github.com/robotros)
*/
class Home extends React.Component {
  state = {
    winning_number: [],
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
  * Lotto Algorithm
  */
  setMatrix() {
    let base = Math.round(
        this.state.single_draw*this.state.winning_number.length);

    let powerBase = Math.round((1/this.state.power_ball)*this.state.winning_number.length);

    let main = [];
    let power = [];

    this.state.winning_number.forEach((winner)=>{
      let draw = winner.winning_numbers.split(' ').map(Number);
      let white = draw.slice(0, 5);
      let pb = draw.slice(5, 6);
      main = main.concat(white);
      power = power.concat(pb);
    });

    this.setState({power_counts: power.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {})}, ()=>{
      let x = [];
      let i = 1;

      while (i < this.state.power_ball+1) {
        if (this.state.power_counts[i] < powerBase) {
          x.push(i);
        }
        i++;
      }
      this.setState({power_choice: x}, () => {
        this.setState({suggested_power: this.state.power_choice[
            Math.floor(Math.random()*this.state.power_choice.length)]});
      });
    });

    this.setState({draw_counts: main.sort().reduce((prev, next) => {
      prev[next] = (prev[next] + 1) || 1;
      return prev;
    }, {})}, () => {
      let x = [];
      let i = 1;

      while (i < this.state.white_ball+1) {
        if (this.state.draw_counts[i] < base) {
          x.push(i);
        }
        i++;
      }
      this.setState({white_choice: x}, () => {
        let random = this.state.white_choice.sort(() => .5 - Math.random()).slice(0, 5);
        this.setState({suggested_play: random.sort(function(a, b) { return a-b })}, () => {
        	console.log(this.checkWin(this.state.suggested_play, this.state.suggested_power));
        });
      });
    });
  }

  /**
  * Make SocrataAPI call to get streamer Lotto numbers
  */
  async checkWin(m,p) {
  	let test = m.concat(p).join(' ');
  	console.log(test);
    await SocrataAPI.checkWinner(test)
        .then( (data) => {
      		return data;
        });
  }

  /**
  * Make SocrataAPI call to get streamer Lotto numbers
  */
  async getWinners() {
    await SocrataAPI.getWinners()
        .then( (data) => {
          this.setState({winning_number: data}, ()=>{
            this.setMatrix();
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
      <div className='Home container'>
        <h1>PoweBall Pick Generator</h1>
        <h2> Picks </h2>
        <p>{this.state.suggested_play.join(',')} PowerBall : {this.state.suggested_power}</p>
        <h2>Data</h2>
        <ul>
          <li>draws to date: {this.state.winning_number.length}</li>
          <li>Available Random Options: {((math.combinations(this.state.white_choice.length, this.state.white_choice.length < 5 ? this.state.white_choice.length : 5)*this.state.power_choice.length)+ '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')}</li>
        </ul>
      </div>
    );
  }
}

export default Home;
