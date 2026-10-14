/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

import React, {Component} from 'react';
import NavLinks from './NavLinks';
import PropTypes from 'prop-types';

/**
* React Component to Render Header
* @author [Aron Roberts](https://github.com/robotros)
*/
class Head extends Component {
  state = {
    navOpen: false,
  };

  /**
   * Open or close the small-screen navigation.
   */
  toggleNav = () => {
    this.setState(function(prev) {
      return {navOpen: !prev.navOpen};
    });
  };

  /**
   * Close the menu after a link is chosen.
   */
  closeNav = () => {
    this.setState({navOpen: false});
  };

  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    const menuClass = 'collapse navbar-collapse' +
      (this.state.navOpen ? ' show' : '');
    const togglerClass = 'navbar-toggler' +
      (this.state.navOpen ? '' : ' collapsed');

    return (
      <header>
        <nav className='navbar navbar-expand-lg navbar-dark bg-dark fixed-top'>
          <div className='container'>
            <div className='navbar-brand'>
              <img src={this.props.logo}
                alt='Logo'
                className='logo'>
              </img>
              <strong className='title'> {this.props.site}</strong>
            </div>
            <button className={togglerClass}
              type='button'
              aria-controls='navbarResponsive'
              aria-expanded={this.state.navOpen}
              aria-label='Toggle navigation'
              onClick={this.toggleNav}>
              <span className='navbar-toggler-icon'></span>
            </button>
            <div className={menuClass} id='navbarResponsive'>
              <ul className='navbar-nav ms-auto' onClick={this.closeNav}>
                {this.props.Nav.map((L) =>
                  <NavLinks
                    key={L.path}
                    L={L}
                  />)}
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
  logo: PropTypes.string.isRequired,
  site: PropTypes.string.isRequired,
};

export default Head;
