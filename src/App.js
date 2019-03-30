/**
* filename: App.js
* Main component to render WMPQ Gaming Webpage
*
* Author:[Aron Roberts](github.com/robotros)
* Last Update: 02/04/2019
*/
import React from 'react';
import {Route} from 'react-router-dom';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCopyright} from '@fortawesome/free-solid-svg-icons';
// import ReactDOMServer from 'react-dom/server';
import Head from './components/Head';
import Foot from './components/Foot';
import Home from './components/Home';
import './css/app.css';
// import Contact from './components/Contact';


// font awesome icon library
library.add(faCopyright);

/**
* React Component to Render WMPQ.org Website
* @author [Aron Roberts](https://github.com/robotros)
*/
class LottoApp extends React.Component {
  state = {
    Nav: [
      {
        'path': '/',
        'label': 'Home',
        'component': Home,
      },
    ],
    social: [
      {'url': 'https://www.facebook.com/wmpqgaming'},
      {'url': 'https://www.youtube.com/channel/UCgXsCoR3OWw7IE6UL_NWJYQ'},
      {'url': 'https://www.twitch.tv/robotros'},
      {'url': 'https://discord.gg/SDpxpVh'},
      // {'url': 'emailto:robotros@wmpq.org'},
    ],
  }

  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <main className='app'>
        <Head Nav={this.state.Nav}/>
        <div className='center'>
          {this.state.Nav.map((page) =>
            <Route
              key={page.label}
              exact path={page.path}
              component={page.component}
            />
          )}
        </div>
        <Foot social={this.state.social}/>
      </main>
    );
  }
}

export default LottoApp;
