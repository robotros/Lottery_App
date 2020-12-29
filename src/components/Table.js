/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint no-invalid-this: "warn" */
/* eslint max-len: "warn" */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
* React Component to Render Form
* @author [Aron Roberts](https://github.com/robotros)
*/
class Table extends Component {
  /**
  * Render Component into html
  * @return {Component} html
  */
  render() {
    let headers = this.props.data.length >0 ?
      Object.keys(this.props.data[0]) :
      [];

    return (
      <div>
        <table className ='table table-bordered'>
          <thead className= 'thead-dark'>
            <tr>
              {headers.map((H, index)=>
                <th scope='col' key={index}>{H}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {this.props.data.map((L, index) =>
              <tr key={index}>
                {Object.keys(L).map((key, index) =>
                  <td key={key}>{(L[key] instanceof Date) ? 
                    L[key].toDateString() : L[key]}</td>)}
              </tr>)
            }
          </tbody>
        </table>
      </div>
    );
  }
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Table;
