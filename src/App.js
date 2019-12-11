/**
* filename: App.js
* Main component to render lottoPicker.online Webpage
*
* Author:[Aron Roberts](github.com/robotros)
* Last Update: 12/11/2019
*/
import React from 'react';
import {Route} from 'react-router-dom';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCopyright} from '@fortawesome/free-solid-svg-icons';
import Head from './components/Head';
import Foot from './components/Foot';
import Home from './components/Home';
import Logo from './img/lottery-tickets.png';
import './css/app.css';

// font awesome icon library
library.add(faCopyright);

/**
* React Component to Render WMPQ.org Website
* @author [Aron Roberts](https://github.com/robotros)
*/
class LottoApp extends React.Component {
  state = {
    company: 'Robotros Technologies',
    site: 'Lucky Lotto Picker',
    Nav: [
      {
        'path': '/',
        'label': 'PowerBall',
        'component': Home,
      },
    ],
    social: [
      {'url': 'https://www.facebook.com/robotrostech'},
      {'url': 'https://www.youtube.com/channel/UCgXsCoR3OWw7IE6UL_NWJYQ'},
      {'url': 'https://www.linkedin.com/company/robotros-technologies'},
      // {'url': 'emailto:robotros@wmpq.org'},
    ],
    credentials:
    {
      username: '',
      password: '',
    },
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
          credentials = {this.state.credentials}
          login={this.loginInfor}
          logout={this.logout}
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
