import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
* React Component to Render Header for WMPQ Gaming
* @author [Aron Roberts](https://github.com/robotros)
*/
class SuggestedPlay extends Component {
  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    return (
      <div>
        <p className='font-weight-bold'>{this.props.sp.picks.join(', ')}, <span className='text-danger'>{this.props.sp.pb}</span></p>
      </div>
    );
  }
}

SuggestedPlay.propTypes = {
  sp: PropTypes.object.isRequired,
};

export default SuggestedPlay;
