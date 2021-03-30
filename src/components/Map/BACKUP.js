import React, { useState, useEffect, createRef } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import geojson2h3 from 'geojson2h3'
import * as h3 from 'h3-js'
import config from '../../lib/config'
import { withMapContext } from '../../context/MapContext'
import { indexInterestingLands, request } from '../../lib/api'
import Breadcrumbs from '../Breadcrumbs/MapBreadcrumbs'
import BannerCounter from '../BannerCounter/BannerCounter'
import _ from 'lodash'

mapboxgl.accessToken = 'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw'
let map
let map_markers = []
let map_lands_clusters = []

const Map = (props) => {
	const [mapSatellite, setMapSatellite] = useState(false)
	const [mapReady, setMapReady] = useState(false)

  // Effects
	////////////////////////////////////////////////////////////

  useEffect(() => {
		// inizializzo mappa
    map = new mapboxgl.Map({
      container: 'Map',
      center: [config.map.lng, config.map.lat],
      zoom: config.map.zoom,
      style: 'mapbox://styles/mapbox/light-v9',
      renderWorldCopies: false,
      tileLayer: {
        continuousWorld: false,
        noWrap: true,
      },
    })

		// aggiorno stato di caricamento mappa sulla base del loading dello stile
    waitMapStyle()

    // inizializzo geocoder per identificazione utente
    const geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, marker: false })
    map.addControl(geocoder)

    map.on('load', () => {
			// aggiungo layer per visualizzazione satellite
			map.addLayer({
				id: 'mapbox-mapbox-satellite',
				source: { type: 'raster', url: 'mapbox://mapbox.satellite', tileSize: 256 },
				type: 'raster',
			})
			map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none')

			// posiziono la mappa sulla posizione dell'utente
      geocoder.on('result', (ev) => {
        map.flyTo({
          center: [
            ev.result.geometry.coordinates[0],
            ev.result.geometry.coordinates[1],
          ],
          zoom: 18,
          speed: 1.8,
        })
      })

			// attivo ascoltatori per render dati
			map.on('moveend', () => renderMapData())
			renderMapData()
    })
  }, [])

	// Effect che gestisce il cambio di tipologia della mappa da satellite a normale
	useEffect(() => {
		if (!map || !mapReady) return

		if (mapSatellite) {
			map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'visible')
		} else {
			map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none')
		}
	}, [mapSatellite])

	// Functions
	////////////////////////////////////////////////////////////

	/**
	 * @function waitMapStyle
	 */
	 function waitMapStyle() {
    if (!map.isStyleLoaded()) {
      setTimeout(waitMapStyle, 200)
    } else {
      setMapReady(true)
    }
  }

	/**
	 * @function renderMapData
	 */
	function renderMapData() {
		const zoom = map.getZoom()
		const bounds = map.getBounds()

		console.log(zoom, bounds)

		if (zoom > 10) {
			renderMapLands()
		} else {
			renderMapLandsCounters()
		}
	}


	/**
	 * @function renderMapLands
	 * Carica i dati delle lands in mappa rispetto alla posizione in cui ci si trova.
	 */
	function renderMapLands() {
		const { lng, lat } = map.getCenter()
		console.log('CHIMATA LANDS')

		request({ url: '/map/owned-lands', method: 'GET' }, { lat, lng }).then((response) => {
			const lands = response.data.lands
			console.log(lands)

			map_markers.map((m) => m.remove()); map_markers = []
			lands.forEach((land) => {
				const el = document.createElement('div')
				el.innerHTML = land.hexId
				console.log(land)
				map_markers.push(
					new mapboxgl.Marker(el)
					.setLngLat(land.lngLat)
					.addTo(map)
				)
			})
		})
	}

	/**
	 * @function renderMapLandsCounters
	 * Carica i dati delle lands clusterizzati in gruppo in mappa rispetto alla posizione in cui ci si trova.
	 */
	function renderMapLandsCounters() {
		console.log('CHIMATA CLUSTER')

		// funzione che ripulisce i cluster in arrivo dalle api
		const clean = (clustersApi) => {
			return clustersApi.map((cluster) => ({
				counter: parseInt(cluster.counter),
				lngLat: [parseFloat(cluster.lngLat[0]), parseFloat(cluster.lngLat[1])]
			}))
		}

		// funzione che raggruppa i cluster in base al livello di zoom
		const group = (clusters) => {
			const zoom = map.getZoom()
			if (zoom > 6) return clusters

			const zoomInt = Math.round(zoom)
			const groupsSize = [[30, 15], [30, 15], [20, 10], [10, 5], [5, 5], [3, 3], [2, 2]]
			const groupSize = groupsSize[zoomInt] || [2, 2]

			const groupCreate = (limits, size) => {const g = [];for (let i = limits[0]; i <= limits[1] - size; i = i + size) {g.push([i, i + size])};return g}
			const groupsLng = groupCreate([-180, +180], groupSize[0])
			const groupsLat = groupCreate([-90, +90], groupSize[1])
			const groups = {}
			clusters.forEach((cluster) => {
				const lng = cluster.lngLat[0]
				const groupLng = groupsLng.filter((g, i) => lng >= g[0] && lng < (i < groupsLng.length - 1 ? g[1] : g[1] + 1))[0]
				const lat = cluster.lngLat[1]
				const groupLat = groupsLat.filter((g, i) => lat >= g[0] && lat < (i < groupsLat.length - 1 ? g[1] : g[1] + 1))[0]
				const groupKey = groupLng[0] + '|' + groupLat[0]
				if (!groups[groupKey]) { groups[groupKey] = { counter: 0, lngLat: [groupLng[0] + groupSize[0] / 2, groupLat[0] + groupSize[1] / 2] } }
				groups[groupKey].counter = groups[groupKey].counter + cluster.counter
			})

			return Object.values(groups)
		}

		// funzione che esegue i render a partire dati dati
		const render = (clusters) => {
			map_markers.map((m) => m.remove()); map_markers = []
			group(clusters).forEach((cluster) => {
				const el = document.createElement('div')
				el.innerHTML = cluster.counter
				el.classList.add('map-land-cluster')
	
				map_markers.push(
					new mapboxgl.Marker(el)
					.setLngLat(cluster.lngLat)
					.addTo(map)
				)
			})
		}

		if (map_lands_clusters.length) {
			render(map_lands_clusters)
		} else {
			const { lng, lat } = map.getCenter()
			const zoom = map.getZoom()
			request({ url: '/map/owned-lands-counters', method: 'GET' }, { lat, lng, zoom }).then((response) => {
				map_lands_clusters = clean(response.data.counters)
				render(map_lands_clusters)
			})
		}
	}

  return (
    <>
      <BannerCounter />
      <Breadcrumbs />
      <div id="Map" className="Map">
        <div className={mapSatellite ? 'map-type-button on' : 'map-type-button off'} onClick={() => setMapSatellite(!mapSatellite)}>{mapSatellite ? 'Streets' : 'Satellite'}</div>
      </div>
    </>
  )
}

Map.propTypes = {
  location: PropTypes.object,
  mapProvider: PropTypes.object,
  props: PropTypes.object,
}

export default withMapContext(Map)








function renderMapData() {
	const mapBounds = map.getBounds()
	const mapZoom = map.getZoom()
	const bounds = [
		mapBounds.getWest(),
		mapBounds.getSouth(),
		mapBounds.getEast(),
		mapBounds.getNorth()
	]
	const zoom = Math.round(
		mapZoom
	)

	console.log()
	// [westLng, southLat, eastLng, northLat]

	axios.post('http://localhost', { zoom, bounds }).then((response) => {
		console.log(response)
	})
}