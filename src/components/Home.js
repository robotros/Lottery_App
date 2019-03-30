import React from 'react';
import * as SocrataAPI from './SocrataAPI';


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
        this.setState({suggested_power: this.state.power_choice[Math.floor(Math.random()*this.state.power_choice.length)]})      });
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
        this.setState({suggested_play: random.sort()});
      });
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
        <p>draws to date:{this.state.winning_number.length}</p>
        <h2>{this.state.suggested_play.join(',')} {this.state.suggested_power}</h2>

      </div>
    );
  }
}

export default Home;
