import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import geojson2h3 from 'geojson2h3';
import config from '../../lib/config';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapContext, withMapContext } from '../../context/MapContext';
import * as h3 from 'h3-js';
import Breadcrumbs from '../Breadcrumbs/MapBreadcrumbs';

class Map extends Component {
	constructor(props) {
		super(props);

		this.hexagons = this.hexagons.bind(this);
		this.initMap = this.initMap.bind(this);
		this.waitMapStyle = this.waitMapStyle.bind(this);
	}

	renderHexes(hexagons) {
		const geojson = geojson2h3.h3SetToFeatureCollection(Object.keys(hexagons), (hex) => ({ value: hexagons[hex] }));
		const sourceId = 'h3-hexes';
		const layerId = `${sourceId}-layer`;
		let source = this.map.getSource(sourceId);

		if (!source) {
			this.map.addSource(sourceId, {
				type: 'geojson',
				data: geojson,
			});
			this.map.addLayer({
				id: layerId,
				source: sourceId,
				type: 'fill',
				interactive: false,
				paint: {
					'fill-outline-color': 'rgba(255,255,255,1)',
				},
			});
			source = this.map.getSource(sourceId);
		}

		// Update the geojson data
		source.setData(geojson);

		// Update the layer paint properties, using the current config values
		this.map.setPaintProperty(layerId, 'fill-opacity', config.map.fillOpacity);

		this.map.setPaintProperty(layerId, 'fill-color', {
			property: 'value',
			stops: [
				[0, config.map.colorScale[0]],
				[0.5, config.map.colorScale[0]],
				[1, config.map.colorScale[0]],
			],
		});
	}

	hexagons() {
		var center = this.map.getCenter();

		const centerHex = h3.geoToH3(center['lat'], center['lng'], 12);
		const kRing = h3.kRing(centerHex, 20);

		var data = Object.assign({}, kRing);

		var newData = Object.keys(data).reduce(function (obj, key) {
			obj[data[key]] = Math.random();
			return obj;
		}, {});

		return newData;
	}

	//
	// Mapbox init
	//

	initMap() {
		const state = this.context.state;

		mapboxgl.accessToken =
			'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw';
		this.map = new mapboxgl.Map({
			container: 'Map',
			center: [config.map.lng, config.map.lat],
			zoom: config.map.zoom,
			style: 'mapbox://styles/mapbox/light-v9',
		});

		// geocoder setup
		var geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			marker: false,
		});
		this.map.addControl(geocoder);

		// geocoder init
		this.map.on('load', () => {
			geocoder.on('result', (ev) => {
				this.map.flyTo({
					center: [ev.result.geometry.coordinates[0], ev.result.geometry.coordinates[1]],
					zoom: 18,
					speed: 1.8,
				});
			});

			this.map.addLayer({
				id: 'mapbox-mapbox-satellite',
				source: { type: 'raster', url: 'mapbox://mapbox.satellite', tileSize: 256 },
				type: 'raster',
			});
			this.map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none');

			var switchy = document.getElementById('js-map-view');
			if (switchy) {
				switchy.addEventListener('click', () => {
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
			}

			// View single point
			if (state.onSingleView === true) {
				this.focusMap(state.hex_id, state.isAuction);
			}
		});

		// Show grid on high zoom
		const zoomThreshold = 17;
		let that = this;
		this.map.on('moveend', function () {
			if (that.map.getZoom() > zoomThreshold) {
				that.renderHexes(that.hexagons());
			}
		});

		// Click hexagon
		this.map.on('click', function (e) {
			// change focus of map
			const hex_id = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12);
			that.focusMap(hex_id, state.isAuction);
			that.props.history.push(`/map/land/${hex_id}`);
			const landSelectedEvent = new CustomEvent('land-selected', {
				detail: {
					hex_id,
				},
			});
			document.dispatchEvent(landSelectedEvent);
		});
	}

	//
	// Focus on single point
	// Used when accessing directly to a single land view or when clicked on a land
	//
	focusMap(hex_id, isAuction) {
		// Hex to geo
		let hexCenterCoordinates = h3.h3ToGeo(hex_id);
		// Move map focus
		this.map.flyTo({
			center: [hexCenterCoordinates[1], hexCenterCoordinates[0]],
			zoom: 18,
			speed: 1.8,
		});
		// Plot graphic point into map
		let singleHexGeojson = geojson2h3.h3ToFeature(hex_id);

		const selected_sourceId = 'h3-hexes_selected';
		const selected_layerId = `${selected_sourceId}-layer`;
		let selected_source = this.map.getSource(selected_sourceId);
		if (!selected_source) {
			this.map.addSource(selected_sourceId, {
				type: 'geojson',
				data: singleHexGeojson,
			});
			this.map.addLayer({
				id: selected_layerId,
				source: selected_sourceId,
				type: 'fill',
				interactive: false,
				paint: {
					'fill-outline-color': '#4A90E2',
					'fill-color': 'rgba(74,144,226,0.20)',
					'fill-opacity': 1,
				},
			});
			selected_source = this.map.getSource(selected_sourceId);
		}

		// Update the h3Geo data
		selected_source.setData(singleHexGeojson);
		this.map.setLayoutProperty(selected_layerId, 'visibility', 'visible');

		// Plot pin
		if (isAuction) {
			// Add pin
			// TODO
			// let el = document.createElement('div');
			// el.className = `Map__ping_container --open`;
			// el.insertAdjacentHTML('beforeend', '<div class="c-ping-layer c-ping-layer-1"></div>');
			// new mapboxgl.Marker(el)
			//     .setLngLat([hexCenterCoordinates[1], hexCenterCoordinates[0]])
			//     .addTo(this.map);
		}
	}

	//
	// Plot auctions from MapContext data
	//

	plotAuctions() {
		// Delete all displayed markers
		var paras = document.getElementsByClassName('Map__ping_container');
		while (paras[0]) {
			paras[0].parentNode.removeChild(paras[0]);
		}

		// Add all markers on map
		for (const auction of this.context.state.auctionList) {
			let statusClassName = 0;
			switch (auction.status) {
				case 0:
					statusClassName = '--open';
					break;
				case 1:
					statusClassName = '--outbidded';
					break;
				default:
					statusClassName = '--open';
			}

			// Add pin
			let el = document.createElement('div');
			el.className = `Map__ping_container ${statusClassName}`;
			el.insertAdjacentHTML('beforeend', '<div class="c-ping-layer c-ping-layer-1"></div>');
			new mapboxgl.Marker(el)
				.setLngLat([auction.land.address.geocenter[1], auction.land.address.geocenter[0]])
				.addTo(this.map);
		}
	}

	//
	// Used for safely load the map
	//

	waitMapStyle() {
		if (!this.map.isStyleLoaded()) {
			setTimeout(this.waitMapStyle, 200);
		} else {
			this.focusMap(this.context.state.hex_id, this.context.state.isAuction);
		}
	}

	componentDidMount() {
		this.initMap();
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		if (this.context.state.onSingleView !== nextContext.state.onSingleView) {
			return true;
		}
		// if (this.context.state.auctionList.map((a) => a.uuid) === nextContext.state.auctionList.map((a) => a.uuid)) {
		// 	return false;
		// }
		return false;
	}

	componentDidUpdate() {
		const state = this.context.state;
		if (state.onSingleView === true) {
			this.waitMapStyle();
		} else {
			this.plotAuctions();
			this.map.flyTo({
				center: [config.map.lng, config.map.lat],
				zoom: config.map.zoom,
				speed: 1.8,
			});
		}
	}

	render() {
		return (
			<>
				<Breadcrumbs />
				<div id="Map" className="Map">
					<div id="js-map-view">Satellite</div>
				</div>
			</>
		);
	}
}

Map.contextType = MapContext;

Map.propTypes = {
	location: PropTypes.object,
	mapProvider: PropTypes.object,
};

export default withMapContext(Map);
