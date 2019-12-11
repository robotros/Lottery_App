/* eslint no-console: ['error', { allow: ['warn', 'error'] }] */
/* eslint no-invalid-this: 'warn' */
/* eslint max-len: 'warn' */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
* React Component to Render Form
* @author [Aron Roberts](https://github.com/robotros)
*/
class Form extends Component {
  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <div className=''>
        {this.props.credentials.username !== '' ?
          <button className='nav-link btn-secondary btn'
            onClick={this.props.logout}>Logout
          </button>:
          <button type='button' className='btn btn-primary mb-1'
            data-toggle='modal' data-target='#ILogin'>Login
          </button>
        }
        <div className='modal fade' id='ILogin'
          tabIndex='-1' role='dialog'
          aria-labelledby='ILogin' aria-hidden='true'>
          <div className='modal-dialog' role='form'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title' id='ILogin'>Login</h5>
                <button type='button' className='close'
                  data-dismiss='modal' aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>
              <div className='modal-body'>
                <form onSubmit={this.props.login}>
                  <div className='form-group'>
                    <label htmlFor='username'>Username</label>
                    <input type='text' className='form-control'
                      name='username' id='username' autoComplete='username'
                      placeholder={this.props.credentials.username !== '' ?
                        this.props.credentials.username : 'User'}
                      required>
                    </input>
                    <label htmlFor='password'>Password</label>
                    <input type='password' className='form-control'
                      name='password' id='password'
                      autoComplete='current-password'
                      placeholder='Password' required>
                    </input>
                  </div>
                  <div className='modal-footer'>
                    <button type='button' id='closeLogin'
                      className='btn btn-secondary mb-2' data-dismiss='modal'>
                        Close
                    </button>
                    <button type='submit' className='btn btn-primary mb-2'>
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Form.propTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  credentials: PropTypes.object,
};

export default Form;
