/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

/**
* filename: App.js
* Main component to render lottoPicker.online Webpage
*
* Author:[Aron Roberts](github.com/robotros)
* Last Update: 12/12/2019
*/
import React from 'react';
import {Route} from 'react-router-dom';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCopyright} from '@fortawesome/free-solid-svg-icons';
import {faDice} from '@fortawesome/free-solid-svg-icons';
import {faChartBar} from '@fortawesome/free-solid-svg-icons';
import {faHistory} from '@fortawesome/free-solid-svg-icons';
import Head from './components/Head';
import Foot from './components/Foot';
import Home from './components/Home';
import MegaMillions from './components/MegaMillions';
import Logo from './img/lottery-tickets.png';
import './css/app.css';

// font awesome icon library
library.add(faCopyright, faDice, faChartBar, faHistory);

/**
* React Component to Render the Lucky Lotto site
* @author [Aron Roberts](https://github.com/robotros)
*/
class LottoApp extends React.Component {
  state = {
    company: 'Robotros Technologies',
    site: 'Lucky Lotto',
    Nav: [
      {
        'path': '/',
        'label': 'PowerBall',
        'component': Home,
      },
      {
        'path': '/MegaMillions',
        'label': 'MegaMillions',
        'component': MegaMillions,
      },
    ],
    social: [
      {'url': 'https://www.facebook.com/robotrostech'},
      {'url': 'https://www.linkedin.com/company/robotros-technologies'},
    ],
  }

  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <main className='app'>
        <Head
          site={this.state.site}
          logo={Logo}
          Nav={this.state.Nav}
        />
        <div className='center'>
          {this.state.Nav.map((page) =>
            <Route
              key={page.label}
              exact path={page.path}
              component={page.component}
            />
          )}
        </div>
        <Foot
          social={this.state.social}
          company = {this.state.company}
        />
      </main>
    );
  }
}

export default LottoApp;
