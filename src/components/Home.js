import React from 'react';
import * as SocrataAPI from './SocrataAPI';


/**
* React Component to Render WMPQ.org home page
* @author [Aron Roberts](https://github.com/robotros)
*/
class Home extends React.Component {
  state = {
    winning_number: [],
    white_bal: 69,
    power_ball: 26,
    first_draw: 0.0149254,
    second_draw: 0.0150376,
    third_draw: 0.0151515,
    fourth_draw: 0.0152672,
    fifth_draw: 0.0153846,
    pb_draw: 0.0384615,
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
    this.getWinners();
  }

  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <div className='Home container'>
        <h1>Hello World</h1>
      </div>
    );
  }
}

export default Home;
