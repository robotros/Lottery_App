/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

import React, {Component} from 'react';
import NavLinks from './NavLinks';
import Login from './Login';
import PropTypes from 'prop-types';

/**
* React Component to Render Header
* @author [Aron Roberts](https://github.com/robotros)
*/
class Head extends Component {
  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <header>
        <nav className='navbar navbar-expand-lg navbar-dark bg-dark fixed-top'>
          <div className='container'>
            <div className='navbar-brand'>
              <img src={this.props.logo}
                alt='Logo'
                className='logo'>
              </img>
              <strong className='title'> {this.props.site}</strong> <br></br>
              {this.props.credentials.username !== '' ?
                ' Welcome, '+this.props.credentials.username :''}
            </div>
            <button className='navbar-toggler'
              type='button'
              data-toggle='collapse'
              data-target='#navbarResponsive'
              aria-controls='navbarResponsive'
              aria-expanded='false'
              aria-label='Toggle navigation'>
              <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='navbarResponsive'>
              <ul className='navbar-nav ml-auto'>
                {this.props.Nav.map((L) =>
                  <NavLinks
                    key={L.path}
                    L={L}
                  />)}

                <li className='nav-item'>
                  <Login
                    credentials= {this.props.credentials}
                    login = {this.props.login}
                    logout = {this.props.logout}
                  />
                </li>
              </ul>

            </div>
          </div>
        </nav>
      </header>
    );
  }
}

Head.propTypes = {
  Nav: PropTypes.array.isRequired,
  credentials: PropTypes.object.isRequired,
  login: PropTypes.func,
  logout: PropTypes.func,
  logo: PropTypes.string.isRequired,
  site: PropTypes.string.isRequired,
};

export default Head;
