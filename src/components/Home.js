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
  }

  /**
  * JavaDoc Here
  * @param {int} count
  * @param {int} draw
  */
  setSingleDraw(count, draw) {
    if (draw < this.state.count) {
      this.setState(
          {single_draw: this.state.single_draw+(1/count)},
          () => {
            this.setSingleDraw(count--, draw++);
          }
      );
    }
  }

  /**
  * Lotto Algorithm
  */
  setMatrix() {
    let base = this.state.single_draw*this.state.winning_number.length;
    console.log(base);
  }

  /**
  * Make SocrataAPI call to get streamer Lotto numbers
  */
  async getWinners() {
    await SocrataAPI.getWinners()
        .then( (data) => {
          this.setState({winning_number: data}, ()=>{
            console.log(this.state.winning_number);
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
      <div className='container'>
        <h1>Hello World</h1>
      </div>
    );
  }
}

export default Home;
