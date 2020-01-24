import React from 'react';
import './style.scss';
import { withMapContext } from '../../context/MapContext'

const Discover = (props) => {

  return (
      <div className="Discover">
        <div className="o-container">
          Discover
        </div>
      </div>
  );
}

export default withMapContext(Discover);
