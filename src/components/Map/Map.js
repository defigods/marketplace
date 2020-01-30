
import React, { Component, useState, useContext, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import geojson2h3 from 'geojson2h3';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapContext, withMapContext } from '../../context/MapContext';
const h3 = require("h3-js");


class Map extends Component {
  static contextType = MapContext

  initMap(){
    //
    // Mapbox init
    //
    const state = this.context.state
    const config = {
        lat: 46.0922495,
        lng: 13.2312417,
        zoom: 0,
        fillOpacity: 0.4,
        colorScale: ['#5F39BE', '#ffffff','#1a0731', '#EC663C', '#0081DD'],
    }

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
          zoom:18,
          speed: 1.8
        });
      });

      this.map.addLayer({
        id: 'mapbox-mapbox-satellite',
        source: {"type": "raster",  "url": "mapbox://mapbox.satellite", "tileSize": 256},
        type: "raster"
      });
      this.map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');

      var switchy = document.getElementById('js-map-view');
      switchy.addEventListener("click", () => {
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

      //
      // View single point
      //
      if( state.onSingleView === true){
        this.focusMapAndPlotHex(state.hex_id, state.isAuction)
      }
    })
  }

  focusMapAndPlotHex(hex_id, isAuction){
    // Hex to geo
    let hexCenterCoordinates = h3.h3ToGeo(hex_id);
    // Move map focus
    this.map.flyTo({
      center: [hexCenterCoordinates[1], hexCenterCoordinates[0]], 
      zoom:18,
      speed: 1.8
    });
    // Plot graphic point into map
    let singleHexGeojson = geojson2h3.h3ToFeature(hex_id)

    const selected_sourceId = 'h3-hexes_selected'
    const selected_layerId = `${selected_sourceId}-layer`
    let selected_source = this.map.getSource(selected_sourceId)
    if (!selected_source) {
      this.map.addSource(selected_sourceId, {
        type: 'geojson',
        data: singleHexGeojson,
      })
      this.map.addLayer({
        id: selected_layerId,
        source: selected_sourceId,
        type: 'fill',
        interactive: false,
        paint: {
          'fill-outline-color': '#4A90E2',
          'fill-color': 'rgba(74,144,226,0.20)',
          'fill-opacity': 1
        },
      })
      selected_source = this.map.getSource(selected_sourceId)
    }

    // Update the h3Geo data
    selected_source.setData(singleHexGeojson)

    this.map.setLayoutProperty(selected_layerId, 'visibility', 'visible');

    if (isAuction === true){
      let el = document.createElement('div');
      el.className = 'Map__ping_container --bestbid';
      el.insertAdjacentHTML('beforeend', '<div class="c-ping-layer c-ping-layer-1"> </div><div class="c-ping-layer c-ping-layer-2"> </div><div class="c-ping-layer c-ping-layer-3"> </div><div class="c-ping-layer c-ping-layer-4"> </div>');

      new mapboxgl.Marker(el)
          .setLngLat([hexCenterCoordinates[1], hexCenterCoordinates[0]])
          .addTo(this.map);
    }

  }

  waitMapStyle = () => {
    if (!this.map.isStyleLoaded()) {
      setTimeout(this.waitMapStyle, 200);
    } else {
      this.focusMapAndPlotHex(this.context.state.hex_id, this.context.state.isAuction)
    }
  };

  componentDidMount() {
    this.initMap();
  }

  componentDidUpdate() {
    const state = this.context.state
    if( state.onSingleView == true){
      this.waitMapStyle();
    }
  }


  render() {
    return <div id="Map" className="Map">
              <div id='js-map-view'>Satellite</div>
            </div>;
  }
}

export default withMapContext(Map)