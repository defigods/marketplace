import React from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'

export class Discover extends React.Component {

  render(){
    return (
        <div className="Discover">
          <div className="o-container">
            Discover
          </div>
        </div>
    );
  }
}

export default withMapContext(Discover);
