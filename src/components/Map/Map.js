import React, { useState, useEffect, useCallback } from 'react'

import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import geojson2h3 from 'geojson2h3'
import * as h3 from 'h3-js'
import config from '../../lib/config'
import { MapContext, withMapContext } from '../../context/MapContext'
import { indexInterestingLands, getCachedOpenLandsGeojson } from '../../lib/api'
import Breadcrumbs from '../Breadcrumbs/MapBreadcrumbs'
import MapNavigationBox from '../MapNavigationBox/MapNavigationBox'
import BannerNotification from '../BannerNotification/BannerNotification'
import BannerCounter from '../BannerCounter/BannerCounter'

import _, { isElement } from 'lodash'

// @ts-check

let map

const Map = (props) => {
  const [lastSelectedLand, setLastSelectedLand] = useState(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const { changeMultipleLandSelectionList } = props.mapProvider.actions
  const {
    onSingleView,
    onMultipleLandSelection,
    multipleLandSelectionList,
    auctionList,
    hex_id,
  } = props.mapProvider.state

  //
  // Effects and Setups
  //
  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw'
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
    waitMapStyle()
    // geocoder setup
    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: false,
    })
    map.addControl(geocoder)

    // geocoder init
    map.on('load', () => {
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
      map.addLayer({
        id: 'mapbox-mapbox-satellite',
        source: {
          type: 'raster',
          url: 'mapbox://mapbox.satellite',
          tileSize: 256,
        },
        type: 'raster',
      })
      map.setLayoutProperty('mapbox-mapbox-satellite', 'visibility', 'none')

      var switchy = document.getElementById('js-map-view')
      if (switchy) {
        switchy.addEventListener('click', () => {
          if (switchy.className === 'on') {
            switchy.setAttribute('class', 'off')
            map.setLayoutProperty(
              'mapbox-mapbox-satellite',
              'visibility',
              'none'
            )
            switchy.innerHTML = 'Satellite'
          } else {
            switchy.setAttribute('class', 'on')
            map.setLayoutProperty(
              'mapbox-mapbox-satellite',
              'visibility',
              'visible'
            )
            switchy.innerHTML = 'Streets'
          }
        })
      }
    })
  }, [])

  useEffect(() => {
    let onClickMap
    if (map) {
      onClickMap = (e) => {
        // At click go to Land
        const clicked_hex_id = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12)
        if (!onMultipleLandSelection) {
          focusMap(clicked_hex_id)
          props.history.push(`/map/land/${clicked_hex_id}`)
          const landSelectedEvent = new CustomEvent('land-selected', {
            detail: {
              clicked_hex_id,
            },
          })
          document.dispatchEvent(landSelectedEvent)
        } else {
          // At click add in list if on Multiple Land Selection Mode
          focusMap(clicked_hex_id)
          if (lastSelectedLand == clicked_hex_id) {
            let list = multipleLandSelectionList
            if (list.includes(clicked_hex_id)) {
              // Remove Land
              _.remove(list, function (el) {
                return el === clicked_hex_id
              })
              changeMultipleLandSelectionList(list)
            } else {
              // Add Land
              list.push(clicked_hex_id)
              changeMultipleLandSelectionList(list)
            }
          }
          setLastSelectedLand(clicked_hex_id)
        }
      }
      map.on('click', onClickMap)
    }

    return () => {
      if (map) {
        map.off('click', onClickMap)
      }
    }
  }, [onMultipleLandSelection, lastSelectedLand, map])

  useEffect(() => {
    if (isMapReady == true) {
      plotHighZoomPOI()
      if (onMultipleLandSelection == true) {
        map.doubleClickZoom.disable()
      } else {
        map.doubleClickZoom.enable()
      }
    }
  }, [
    isMapReady,
    onSingleView,
    onMultipleLandSelection,
    multipleLandSelectionList,
  ])

  useEffect(() => {
    if (isMapReady == true) {
      if (auctionList.length > 0) {
        // plotAuctions();
      }
      // Fetch and render clustered Owned Lands
      renderOwnedLandsCluster()
      // Fetch and render clustered Open Auctions
      // Temporary disabled
      //renderOpenAuctionLandsCluster();
    }
  }, [isMapReady])

  //
  // Map init
  //
  function waitMapStyle() {
    if (!map.isStyleLoaded()) {
      setTimeout(waitMapStyle, 200)
    } else {
      setIsMapReady(true)
    }
  }

  function renderHighZoomHexes(hexagons) {
    const geojson = geojson2h3.h3SetToFeatureCollection(
      Object.keys(hexagons),
      (hex) => ({
        value: hexagons[hex],
      })
    )
    const sourceId = 'h3-hexes'
    const layerId = `${sourceId}-layer`
    let source = map.getSource(sourceId)

    if (!source) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      })
      map.addLayer({
        id: layerId,
        source: sourceId,
        type: 'fill',
        interactive: false,
        paint: {
          'fill-outline-color': 'rgba(255,255,255,1)',
        },
      })
      source = map.getSource(sourceId)
    }

    // Update the geojson data
    source.setData(geojson)

    // Update the layer paint properties, using the current config values
    map.setPaintProperty(layerId, 'fill-opacity', config.map.fillOpacity)

    map.setPaintProperty(layerId, 'fill-color', {
      property: 'value',
      stops: [
        [0, config.map.colorScale[0]],
        [0.5, config.map.colorScale[0]],
        [1, config.map.colorScale[0]],
      ],
    })
  }

  function renderHighZoomInterestingHexes(hexagons) {
    // Filter rendering Hexagons to see if there is some interesting
    indexInterestingLands(Object.keys(hexagons)[0]).then((response) => {
      if (response.data.result === true) {
        let lands = response.data.lands
        renderHighZoomMintedLands(lands.minted)
        //renderClosingAuctions(lands.auctionClosing);
        renderHighZoomOngoingAuctions(
          lands.auctionStarted.concat(lands.auctionClosing)
        )
      }
    })
  }

  function renderHighZoomMintedLands(hexagons) {
    // Prepare format
    var data = Object.assign({}, hexagons)
    var newData = Object.keys(data).reduce(function (obj, key) {
      obj[data[key]] = Math.random()
      return obj
    }, {})

    // Plot hexes
    const geojson = geojson2h3.h3SetToFeatureCollection(
      Object.keys(newData),
      (hex) => ({
        value: hexagons[hex],
      })
    )
    const sourceId = 'h3-interesting-hexes'
    const layerId = `${sourceId}-interesting-layer`
    let source = map.getSource(sourceId)

    if (!source) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      })
      map.addLayer({
        id: layerId,
        source: sourceId,
        type: 'fill',
        interactive: false,
        paint: {
          'fill-outline-color': '#ec663c',
          'fill-color': 'rgba(249,180,38,0.4)',
          'fill-opacity': 1,
        },
      })
      source = map.getSource(sourceId)
    }

    // Update the geojson data
    source.setData(geojson)
    // Add markers
    geojson.features.forEach(function (marker) {
      // create a DOM element for the marker
      var el = document.createElement('div')
      el.className = 'sold-marker'
      el.style.backgroundImage =
        'url(https://ovr-assets.oss-accelerate.aliyuncs.com/images/sold-label-bg.png)'
      el.style.width = '50px'
      el.style.height = '29px'

      map.on('zoom', () => {
        if (map.getZoom() < 17) {
          var paras = document.getElementsByClassName('sold-marker')

          while (paras[0]) {
            paras[0].parentNode.removeChild(paras[0])
          }
        }
      })

      // add marker to map
      // console.log('marker.geometry.id',marker.id)
      let coordi = h3.h3ToGeo(marker.id)

      new mapboxgl.Marker(el, {
        anchor: 'center',
      })
        .setLngLat([coordi[1], coordi[0]])
        .addTo(map)
    })
  }

  function renderOwnedLandsCluster() {
    map.addSource('owned_cluster', {
      type: 'geojson',
      data: 'https://mws.ovr.ai/api/v1/lands/geojson/cached/owned',
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
      id: 'owned_clusters',
      type: 'circle',
      source: 'owned_cluster',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#514283',
          100,
          '#514283',
          750,
          '#331F56',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    })
    map.addLayer({
      id: 'owned-cluster-count',
      type: 'symbol',
      source: 'owned_cluster',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    map.addLayer({
      id: 'owned-unclustered-point',
      type: 'circle',
      source: 'owned_cluster',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da', // Yellow: rgba(249,180,38,1)
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    })

    // inspect a cluster on click
    map.on('click', 'owned_clusters', function (e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ['owned_clusters'],
      })
      var clusterId = features[0].properties.cluster_id
      map
        .getSource('owned_cluster')
        .getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err) return
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          })
        })
    })

    map.on('mouseenter', 'owned_clusters', function () {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'owned_clusters', function () {
      map.getCanvas().style.cursor = ''
    })
  }

  function renderOpenAuctionLandsCluster() {
    getCachedOpenLandsGeojson().then((response) => {
      let auctions = response.data
      auctions.forEach((auction) => {
        let el = document.createElement('div')
        el.className = `Map__ping_container --open`
        el.insertAdjacentHTML(
          'beforeend',
          '<div class="c-ping-layer c-ping-layer-1"></div>'
        )
        let marker = new mapboxgl.Marker(el)
          .setLngLat([auction[0], auction[1]])
          .addTo(map)
      })
    })

    // map.addSource("open_cluster", {
    // 	type: "geojson",
    // 	data: "https://mws.ovr.ai/api/v1/lands/geojson/cached/open",
    // 	cluster: true,
    // 	clusterMaxZoom: 14, // Max zoom to cluster points on
    // 	clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    // });

    // map.addLayer({
    // 	id: 'open_clusters',
    // 	type: 'circle',
    // 	source: 'open_cluster',
    // 	filter: ['has', 'point_count'],
    // 	paint: {
    // 		"circle-color": ["step", ["get", "point_count"], "rgba(136, 81, 180, 0.8)", 100, "rgba(136, 81, 180, 0.8)", 750, "rgba(136, 81, 180, 0.8)", ],
    // 		"circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40, ]
    // 	}
    // });

    // map.addLayer({
    // 	id: 'open-cluster-count',
    // 	type: 'symbol',
    // 	source: 'open_cluster',
    // 	filter: ['has', 'point_count'],
    // 	layout: {
    // 		'text-field': '{point_count_abbreviated}',
    // 		'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    // 		'text-size': 12
    // 	},
    // 	paint: {
    // 		"text-color": "#ffffff"
    // 	}
    // });

    // map.addLayer({
    // 	id: 'open-unclustered-point',
    // 	type: 'circle',
    // 	source: 'open_cluster',
    // 	filter: ['!', ['has', 'point_count']],
    // 	paint: {
    // 		'circle-color': '#8851b4',
    // 		'circle-radius': 4,
    // 		'circle-stroke-width': 1,
    // 		'circle-stroke-color': '#fff'
    // 	}
    // });
  }

  function renderHighZoomOngoingAuctions(hexagons) {
    // Prepare format
    var data = Object.assign({}, hexagons)
    var newData = Object.keys(data).reduce(function (obj, key) {
      obj[data[key]] = Math.random()
      return obj
    }, {})

    // Plot hexes
    const geojson = geojson2h3.h3SetToFeatureCollection(
      Object.keys(newData),
      (hex) => ({
        value: hexagons[hex],
      })
    )
    const sourceId = 'h3-ongoing-auctions-hexes'
    const layerId = `${sourceId}-ongoing-auctions-layer`
    let source = map.getSource(sourceId)

    if (!source) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      })
      map.addLayer({
        id: layerId,
        source: sourceId,
        type: 'fill',
        interactive: false,
        paint: {
          'fill-outline-color': '#fff',
          'fill-color': 'rgba(136, 81, 180, 0.5)',
          'fill-opacity': 1,
        },
      })
      source = map.getSource(sourceId)
    }

    // Update the geojson data
    source.setData(geojson)
    // Add markers
    geojson.features.forEach(function (marker) {
      // create a DOM element for the marker
      var el = document.createElement('div')
      el.className = 'sold-marker'
      el.style.backgroundImage =
        'url(https://ovr-assets.oss-accelerate.aliyuncs.com/images/auction-label.png)'
      el.style.width = '45px'
      el.style.height = '45px'

      map.on('zoom', () => {
        if (map.getZoom() < 17) {
          var paras = document.getElementsByClassName('auction-marker')

          while (paras[0]) {
            paras[0].parentNode.removeChild(paras[0])
          }
        }
      })

      // add marker to map
      let coordi = h3.h3ToGeo(marker.id)
      new mapboxgl.Marker(el, {
        anchor: 'center',
      })
        .setLngLat([coordi[1], coordi[0]])
        .addTo(map)
    })
  }

  function hexagons() {
    var center = map.getCenter()
    const centerHex = h3.geoToH3(center['lat'], center['lng'], 12)
    const kRing = h3.kRing(centerHex, 20)
    var data = Object.assign({}, kRing)
    var newData = Object.keys(data).reduce(function (obj, key) {
      obj[data[key]] = Math.random()
      return obj
    }, {})
    return newData
  }

  //
  // Focus on single point
  // Used when accessing directly to a single land view or when clicked on a land
  //
  function focusMap(hex_id) {
    // Hex to geo
    let hexCenterCoordinates = h3.h3ToGeo(hex_id)
    // Move map focus
    map.flyTo({
      center: [hexCenterCoordinates[1], hexCenterCoordinates[0]],
      zoom: 18,
      speed: 1.8,
    })
    // Plot graphic point into map
    let singleHexGeojson = geojson2h3.h3ToFeature(hex_id)

    const selected_sourceId = 'h3-hexes_selected'
    const selected_layerId = `${selected_sourceId}-layer`
    let selected_source = map.getSource(selected_sourceId)
    if (!selected_source) {
      map.addSource(selected_sourceId, {
        type: 'geojson',
        data: singleHexGeojson,
      })
      map.addLayer({
        id: selected_layerId,
        source: selected_sourceId,
        type: 'fill',
        interactive: false,
        paint: {
          'fill-outline-color': '#4A90E2',
          'fill-color': 'rgba(74,144,226,0.20)',
          'fill-opacity': 1,
        },
      })
      selected_source = map.getSource(selected_sourceId)
    }
    // Update the h3Geo data
    selected_source.setData(singleHexGeojson)
    map.setLayoutProperty(selected_layerId, 'visibility', 'visible')

    // Plot pin
    // if (isAuction) {
    // Add pin
    // TODO
    // let el = document.createElement('div');
    // el.className = `Map__ping_container --open`;
    // el.insertAdjacentHTML('beforeend', '<div class="c-ping-layer c-ping-layer-1"></div>');
    // new mapboxgl.Marker(el)
    //     .setLngLat([hexCenterCoordinates[1], hexCenterCoordinates[0]])
    //     .addTo(map);
    // }
  }

  //
  // Plot auctions from MapContext data
  //

  function plotHighZoomPOI() {
    // Zoom out map // General Map View
    if (onSingleView === false && onMultipleLandSelection === false) {
      map.flyTo({
        center: [config.map.lng, config.map.lat],
        zoom: config.map.zoom,
        speed: 1.8,
      })
    }
    // View single point
    if (onSingleView === true) {
      focusMap(hex_id)
    }
    // View multiple selected Land
    if (
      onMultipleLandSelection === true &&
      multipleLandSelectionList.length > 0
    ) {
      let featureOfSelectedLands = geojson2h3.h3SetToFeatureCollection(
        multipleLandSelectionList
      )
      const selected_sourceId = 'h3-hexes_multi_selected'
      const selected_layerId = `${selected_sourceId}-layer`
      let selected_source = map.getSource(selected_sourceId)
      if (!selected_source) {
        map.addSource(selected_sourceId, {
          type: 'geojson',
          data: featureOfSelectedLands,
        })
        map.addLayer({
          id: selected_layerId,
          source: selected_sourceId,
          type: 'fill',
          interactive: false,
          paint: {
            'fill-outline-color': '#ec663c',
            'fill-color': 'rgba(249,180,38,0.5)',
            'fill-opacity': 1,
          },
        })
        selected_source = map.getSource(selected_sourceId)
      }
      selected_source.setData(featureOfSelectedLands)
      map.setLayoutProperty(selected_layerId, 'visibility', 'visible')
    }

    // Render High Zoom grids and Clusters
    // Show hex grid on high zoom
    const zoomThreshold = 17
    const delayedQuery = _.debounce((q) => {
      if (map.getZoom() > zoomThreshold) {
        let hexs = hexagons()
        // Render general hexes
        renderHighZoomHexes(hexs)
        // Render owned Lands
        // renderHighZoomInterestingHexes(hexs) TODO: Reactivate clustering
      } else {
        renderHighZoomHexes([])
      }
    }, 1500)
    map.on('moveend', () => {
      delayedQuery()
    })
  }

  function plotAuctions() {
    map.flyTo({
      center: [config.map.lng, config.map.lat],
      zoom: config.map.zoom,
      speed: 1.8,
    })
    // Delete all displayed markers
    var paras = document.getElementsByClassName('Map__ping_container')
    while (paras[0]) {
      paras[0].parentNode.removeChild(paras[0])
    }

    let markers = []
    // Add all markers on map
    for (const auction of auctionList) {
      let statusClassName = 0
      switch (auction.land.userPerspective) {
        case 3:
          statusClassName = '--outbidded'
          break
        case 2:
          statusClassName = '--bestbid'
          break
        default:
          statusClassName = '--open'
      }

      // Add pin
      let el = document.createElement('div')
      el.className = `Map__ping_container ${statusClassName}`
      el.insertAdjacentHTML(
        'beforeend',
        '<div class="c-ping-layer c-ping-layer-1"></div>'
      )

      if (
        auction.land.address &&
        !isNaN(auction.land.address.geocenterString[1]) &&
        !isNaN(auction.land.address.geocenterString[0])
      ) {
        // let popupContent = `<div>Land name:<b> ${auction.land.sentenceId}</b><br>
        // Current Value: <b>${auction.land.value} OVR</b><br>
        // <div onClick=`+window.historyPush(`/map/land/${auction.land.hexId}`)+`>Go to</div>
        // </div>`;
        // var popup = new mapboxgl.Popup({offset: 25})
        // .setHTML(popupContent);
        // let marker = 	new mapboxgl.Marker(el)
        // 	.setLngLat([auction.land.address.geocenterString[1], auction.land.address.geocenterString[0]])
        // 	.setPopup(popup)
        // 	.addTo(map);
        // markers.push(marker)

        // Todo Markers ^^^
        let marker = new mapboxgl.Marker(el)
          .setLngLat([
            auction.land.address.geocenterString[1],
            auction.land.address.geocenterString[0],
          ])
          .addTo(map)
      }
    }

    // Popups of Markers
    for (const marker of markers) {
      let markerDiv = marker.getElement()
      markerDiv.addEventListener('mouseenter', () => {
        marker.togglePopup()
      })
    }
  }

  return (
    <>
      {/* <BannerNotification></BannerNotification> */}
      <BannerCounter></BannerCounter>
      <Breadcrumbs />
      <div id="Map" className="Map">
        <div id="js-map-view">Satellite</div>
        {/* <MapNavigationBox /> */}
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
