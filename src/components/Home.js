import React from 'react';
import * as SocrataAPI from './SocrataAPI';


/**
* React Component to Render WMPQ.org home page
* @author [Aron Roberts](https://github.com/robotros)
*/
class Home extends React.Component {
  state = {
    winning_number: [],
  }

  /**
  * Make SocrataAPI call to get streamer Lotto numbers
  */
  async getWinners() {
    await SocrataAPI.getWinners()
        .then( (data) => {
          console.log(data);
          this.setState({winning_number: data.data});
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
        <p>'Hello World'</p>
      </div>
          );
  }
}

export default Home;
