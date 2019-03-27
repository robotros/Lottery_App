import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';

/**
* React Component to Render NavLinks for WMPQ Gaming
* @author [Aron Roberts](https://github.com/robotros)
*/
class NavLinks extends Component {
  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <li className='nav-item'>
        <NavLink to={this.props.L.path}
          className='nav-link'
          activeClassName='active'>{this.props.L.label}
        </NavLink>
      </li>
    );
  }
}

NavLinks.propTypes = {
  L: PropTypes.object.isRequired,
};

export default NavLinks;
