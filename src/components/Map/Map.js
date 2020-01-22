
import React, { Component, useState, useContext, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapContext } from '../../context/MapContext';
const h3 = require("h3-js");


class Map extends Component {
  static contextType = MapContext
  
  componentDidMount() {

    const config = this.context.config
    const state = this.context.state
    //
    // Mapbox init
    //

    mapboxgl.accessToken = 'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw';
    this.map = new mapboxgl.Map({
      container: 'Map',
      center: [
        config.lng,
        config.lat,
      ],
      zoom: config.zoom,
      style: 'mapbox://styles/mapbox/light-v9',
    })

    // geocoder setup 
    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: false
    });
    this.map.addControl(geocoder);

    // geocoder init
    this.map.on('load', () => {
      geocoder.on('result', (ev) => {
        this.map.flyTo({
          center:[ev.result.geometry.coordinates[0], ev.result.geometry.coordinates[1]], 
          zoom:18
        });
      });

      this.map.addLayer({
        id: 'mapbox-mapbox-satellite',
        source: {"type": "raster",  "url": "mapbox://mapbox.satellite", "tileSize": 256},
        type: "raster"
      });
      this.map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');

      var switchy = document.getElementById('js-map-view');
      switchy.addEventListener("click", function(){
          if (switchy.className === 'on') {
              switchy.setAttribute('class', 'off');
              this.map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');
              switchy.innerHTML = 'Satellite';
          } else {
              switchy.setAttribute('class', 'on');
              this.map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'visible');
              switchy.innerHTML = 'Streets';
          }
      });
    })

    //
    // View single point
    //
    if( state.onSingleView === true){
      let hexCenterCoordinates = h3.h3ToGeo(state.hex_id);
      this.map.flyTo({
        center: [hexCenterCoordinates[1], hexCenterCoordinates[0]], 
        zoom:18
      });
    }
  }

  componentDidUpdate() {
    const state = this.context.state
    let hexCenterCoordinates = h3.h3ToGeo(state.hex_id);
    this.map.flyTo({
      center: [hexCenterCoordinates[1], hexCenterCoordinates[0]], 
      zoom:18
    });
  }


  render() {
    return <div id="Map" className="Map">
              <div id='js-map-view'>Satellite</div>
            </div>;
  }
}

export default Map