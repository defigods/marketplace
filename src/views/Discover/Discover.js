import React from 'react';
import './style.scss';
import Map from '../../components/Map/Map';
import ChangeHex from '../../components/ChangeHex/ChangeHex';

function Discover() {

  return (
      <div className="Discover">
        <div className="o-container">
          <Map></Map>
          <ChangeHex/>
        </div>
      </div>
  );
}

export default Discover;
