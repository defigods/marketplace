import { debounce, $1, each, $, listenForms } from './util'
// import BackgroundVideo from 'background-video'
import SmoothParallax from 'smooth-parallax'
import Flickity from 'flickity'
import { TweenLite, ScrollToPlugin, TweenMax } from 'gsap'
import Countdown from 'countdown-js'
import SmoothScroll from 'smooth-scroll'
import reqwest from 'reqwest'
import serialize from 'form-serialize'
import mapboxgl from 'mapbox-gl'
import geojson2h3 from 'geojson2h3'
import GeoJSON from 'geojson'
import L from 'leaflet'
const h3 = require('h3-js')
import inView from 'in-view'
import PinchZoom from 'pinch-zoom-js'

const body = $1('body')
var is_safari =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
  screen.width > 1000

const fetchSVG = async function (url, el) {
  // Dog bless fetch() and await, though be advised you'll need
  // to transpile this down to ES5 for older browsers.
  let response = await fetch(url)
  let data = await response.text()

  // This response should be an XML document we can parse.
  const parser = new DOMParser()
  const parsed = parser.parseFromString(data, 'image/svg+xml')

  // The file might not actually begin with "<svg>", and
  // for that matter there could be none, or many.
  let svg = parsed.getElementsByTagName('svg')
  if (svg.length) {
    // But we only want the first.
    svg = svg[0]

    // Copy over the attributes first.
    const attr = svg.attributes
    const attrLen = attr.length
    for (let i = 0; i < attrLen; ++i) {
      if (attr[i].specified) {
        // Merge classes.
        if ('class' === attr[i].name) {
          const classes = attr[i].value.replace(/\s+/g, ' ').trim().split(' ')
          const classesLen = classes.length
          for (let j = 0; j < classesLen; ++j) {
            el.classList.add(classes[j])
          }
        }
        // Add/replace anything else.
        else {
          el.setAttribute(attr[i].name, attr[i].value)
        }
      }
    }

    // Now transfer over the children. Note: IE does not
    // assign an innerHTML property to SVGs, so we need to
    // go node by node.
    while (svg.childNodes.length) {
      el.appendChild(svg.childNodes[0])
    }
    // console.log('fetch done');
    setTimeout(() => {
      // console.log('ehe')
      Application.svgInit()
    }, 2000)
  }
}

// Caricare lista parole
let final_list = []
var opt = new XMLHttpRequest()
opt.addEventListener('load', reqListener)
opt.open(
  'GET',
  'https://www.ovr.ai/wp-content/themes/Website-WP/download/prova.json'
) // Magari caricare da locale
opt.send()
function reqListener() {
  final_list = JSON.parse(this.responseText)
}

function add(x, y, base) {
  var z = []
  var n = Math.max(x.length, y.length)
  191
  var carry = 0
  var i = 0
  while (i < n || carry) {
    var xi = i < x.length ? x[i] : 0
    var yi = i < y.length ? y[i] : 0
    var zi = carry + xi + yi
    z.push(zi % base)
    carry = Math.floor(zi / base)
    i++
  }
  return z
}

// Returns a*x, where x is an array of decimal digits and a is an ordinary
// JavaScript number. base is the number base of the array x.
function multiplyByNumber(num, x, base) {
  if (num < 0) return null
  if (num == 0) return []

  var result = []
  var power = x
  while (true) {
    if (num & 1) {
      result = add(result, power, base)
    }
    num = num >> 1
    if (num === 0) break
    power = add(power, power, base)
  }

  return result
}

function parseToDigitsArray(str, base) {
  var digits = str.split('')
  var ary = []
  for (var i = digits.length - 1; i >= 0; i--) {
    var n = parseInt(digits[i], base)
    if (isNaN(n)) return null
    ary.push(n)
  }
  return ary
}

function convertBase(str, fromBase, toBase) {
  var digits = parseToDigitsArray(str, fromBase)
  if (digits === null) return null

  var outArray = []
  var power = [1]
  for (var i = 0; i < digits.length; i++) {
    if (digits[i]) {
      outArray = add(
        outArray,
        multiplyByNumber(digits[i], power, toBase),
        toBase
      )
    }
    power = multiplyByNumber(fromBase, power, toBase)
  }

  var out = ''
  for (var i = outArray.length - 1; i >= 0; i--) {
    out += outArray[i].toString(toBase)
  }
  return out
}

let combinations_vocab = {
  0: '000',
  1: '001',
  2: '010',
  3: '011',
  4: '100',
  5: '101',
  6: '110',
  7: '111',
  8: '002',
  9: '012',
  10: '020',
  11: '021',
  12: '022',
  13: '102',
  14: '112',
  15: '120',
  16: '121',
  17: '122',
  18: '200',
  19: '201',
  20: '202',
  21: '210',
  22: '211',
  23: '212',
  24: '220',
  25: '221',
  26: '222',
}

const from_triplet_to_h3 = (triplet) => {
  let h3_invariant_head = '10001100'
  let h3_invariant_tail = '111111111'

  let triplet_adj = []
  let str_value = ''

  for (let i = 0; i < triplet.length; i++) {
    for (let j = 0; j < final_list.length; j++) {
      if (final_list[j] === triplet[i]) {
        str_value = j.toString()
      }
    }
    let length_string = str_value.length

    if (length_string < 5) {
      for (let n = 0; n < 5 - length_string; n++) {
        str_value = '0' + str_value
      }
    }

    triplet_adj.push(str_value)
  }

  let first_trinary_code =
    triplet_adj[0].substring(0, 1) +
    triplet_adj[1].substring(0, 1) +
    triplet_adj[2].substring(0, 1)
  let first_integer_value = 0

  for (let key in combinations_vocab) {
    if (combinations_vocab[key] === first_trinary_code) {
      first_integer_value = key
    }
  }

  let full_integer =
    first_integer_value.toString() +
    triplet_adj[0].substring(1) +
    triplet_adj[1].substring(1) +
    triplet_adj[2].substring(1)
  let binary_full_integer = convertBase(full_integer, 10, 2)
  let binary_full_integer_length = binary_full_integer.length

  for (let i = 0; i < 43 - binary_full_integer_length; i++) {
    binary_full_integer = '0' + binary_full_integer
  }

  let whole_binary = h3_invariant_head + binary_full_integer + h3_invariant_tail
  let h3_index = convertBase(whole_binary, 2, 16)
  return h3_index
}

const form_h3_to_words = (h3_address) => {
  let binary = convertBase(h3_address, 16, 2)

  let binary_clean = binary.substr(8, 43)

  let integer = parseInt(binary_clean, 2)
  console.log(integer)
  let str_integer = integer.toString()
  console.log(str_integer)
  let integer_length = str_integer.length
  console.log(integer_length)

  if (integer_length < 13) {
    for (let i = 0; i < 13 - integer_length; i++) {
      str_integer = '0' + str_integer
    }
  }

  let integer_first_value = str_integer[0]
  console.log(integer_first_value)
  console.log(str_integer)
  console.log('qui')
  console.log(str_integer.substring(1, 5))
  console.log(combinations_vocab[parseInt(integer_first_value)].substring(0, 1))

  let first_word_idx = parseInt(
    combinations_vocab[parseInt(integer_first_value)].substring(0, 1) +
      str_integer.substring(1, 5)
  )
  console.log(str_integer.substring(1, 5))
  let first_word = final_list[first_word_idx]

  let second_word_idx = parseInt(
    combinations_vocab[parseInt(integer_first_value)][1] +
      str_integer.substring(5, 9)
  )
  let second_word = final_list[second_word_idx]
  console.log(str_integer.substring(5, 9))
  let third_word_idx = parseInt(
    combinations_vocab[parseInt(integer_first_value)][2] +
      str_integer.substring(9)
  )
  let third_word = final_list[third_word_idx]
  console.log(str_integer.substring(9))
  return [first_word, second_word, third_word]
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.className = 'js'
  Application.init()
})

window.addEventListener(
  'resize',
  debounce(() => {
    Application.mapInit()
  }, 250)
)

window.addEventListener('load', () => {
  const svgs = document.querySelectorAll('svg[data-url]')
  const svgsLen = svgs.length
  // Loop and process.
  for (let i = 0; i < svgsLen; ++i) {
    // Grab the URL and delete the attribute; we no longer
    // need it.
    let url = svgs[i].getAttribute('data-url')
    svgs[i].removeAttribute('data-url')

    // We'll let another function handle the actual fetching
    // so we can use the async modifier.
    fetchSVG(url, svgs[i])
  }
})

const Application = (() => {
  let startParallax = () => {
    if (!is_safari) {
      SmoothParallax.init()
    } else {
      document.body.classList.add('is_safari')
    }
  }

  const reInit = () => {}

  const initCarousels = () => {
    if ($('.js-tab-slider').length > 0) {
      var carousel = new Flickity('.js-tab-slider', {
        cellAlign: 'left',
        contain: true,
        pageDots: false,
        freeScroll: false,
        prevNextButtons: false,
        imagesLoaded: true,
        adaptiveHeight: true,
        hash: true,
        pauseAutoPlayOnHover: false,
        draggable: false,
      })

      const featuresButton = $('.js-feature-tab-button')
      each(featuresButton, (i, featureButton) => {
        featureButton.addEventListener('click', function () {
          const id = this.dataset.id
          carousel.select(parseInt(id, 10))
          each(featuresButton, function (l, fB) {
            fB.classList.remove('js-button--active')
          })
          this.classList.add('js-button--active')
        })
      })

      var elem = document.querySelector('.c-stories-dots__container')

      if (elem != null) {
        var flktyTimeline = new Flickity(elem, {
          cellAlign: 'center',
          cellSelector: '.c-services-dot__container',
          prevNextButtons: false,
          adaptiveHeight: true,
          pageDots: false,
          contain: true,
        })

        each(
          elem.getElementsByClassName('c-services-dot__container'),
          (i, dot_container) => {
            dot_container.addEventListener('click', function () {
              // console.log(this.dataset.index - 1);
              flktyTimeline.select(this.dataset.index)
            })
          }
        )
      }
    }
  }

  function mailchimpCallback(data) {
    // console.log(data)
  }

  const menuManager = () => {
    window.removeEventListener('scroll', menuManagerOnScroll, false)
    window.addEventListener('scroll', menuManagerOnScroll, false)
    function menuManagerOnScroll() {
      if ($1('.c-hero')) {
        const hero = $1('.c-hero')
        const pageWrap = $1('#page-wrap')
        const heroHeight = hero.offsetHeight

        var scrollTop = window.pageYOffset || document.documentElement.scrollTop
        // console.log(scrollTop);
        // console.log(heroHeight);
        // console.log(footerOffset);

        // pageWrap menu
        if (scrollTop > heroHeight - 500) {
          pageWrap.classList.add('is-scrolling')
        } else {
          pageWrap.classList.remove('is-scrolling')
        }
      }
    }
  }

  const countDownManager = () => {
    // setup end datetime for timer
    var end = new Date('1/1/2019')

    var timer = Countdown.timer(
      end,
      function (timeLeft) {
        document.getElementById('c-countdown_container').innerHTML =
          'Presale will start in ' +
          timeLeft.days +
          ' days ' +
          timeLeft.hours +
          ' hours ' +
          timeLeft.minutes +
          ' min ' +
          timeLeft.seconds +
          ' sec '
      },
      function () {
        // console.log("Countdown Finished!")
      }
    )
  }

  const onMobileHamburgerClick = () => {
    const pageWrap = $1('#hamburger-menu')
    const menuVoices = $('.c-mobile-nav__container-main a')

    pageWrap.addEventListener('click', function () {
      if (body.classList.contains('is_mobile_menu_open')) {
        body.classList.remove('is_mobile_menu_open')
      } else {
        body.classList.add('is_mobile_menu_open')
      }
    })

    each(menuVoices, (i, menuVoice) => {
      menuVoice.addEventListener('click', function () {
        body.classList.remove('is_mobile_menu_open')
      })
    })
  }

  const preloaderFadeOut = () => {
    body.classList.add('c-loader--logo-holder-animated')
    setTimeout(function () {
      body.classList.remove('c-loader--logo-holder-animated')
      setTimeout(function () {
        body.classList.add('c-loader--preloader-white-gone')
      }, 1600)
    }, 1850)
  }

  const switchFooterColor = () => {
    if (document.getElementById('countdown')) {
      window.onscroll = function (ev) {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          document
            .getElementById('countdown')
            .classList.add('c-fixed-countdown--inverted')
        } else {
          document
            .getElementById('countdown')
            .classList.remove('c-fixed-countdown--inverted')
        }
      }
    }
  }

  const scrollToLink = () => {
    var scroll = new SmoothScroll('a[href*="#"]', {
      speed: 500,
      offset: 100,
    })
  }

  const config = {
    lat: 46.0922495,
    lng: 13.2312417,
    zoom: 0,
    fillOpacity: 0.4,
    colorScale: ['#5F39BE', '#ffffff', '#1a0731', '#EC663C', '#0081DD'],
  }

  function renderHexes(map, hexagons) {
    const geojson = geojson2h3.h3SetToFeatureCollection(
      Object.keys(hexagons),
      (hex) => ({ value: hexagons[hex] })
    )
    const sourceId = 'h3-hexes'
    const layerId = `${sourceId}-layer`
    let source = map.getSource(sourceId)
    console.log('map_geojs', geojson)
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
          'fill-outline-color': 'rgba(255,255,255,1.9)',
        },
      })
      source = map.getSource(sourceId)
    }

    // Update the geojson data
    source.setData(geojson)

    // Update the layer paint properties, using the current config values
    map.setPaintProperty(layerId, 'fill-color', {
      property: 'value',
      stops: [
        [0, config.colorScale[0]],
        [0.5, config.colorScale[0]],
        [1, config.colorScale[0]],
      ],
    })

    map.setPaintProperty(layerId, 'fill-opacity', config.fillOpacity)
  }

  const mapInit = () => {
    if (document.getElementById('c-hex-map-mask')) {
      let mapMaskHeight =
        document.getElementById('c-hex-map-mask').clientHeight - 2
      document.getElementById('c-hex-map').style.height = mapMaskHeight + 'px'

      const hexagons = () => {
        var center = map.getCenter()
        //console.log (center)
        const centerHex = h3.geoToH3(center['lat'], center['lng'], 12)
        const kRing = h3.kRing(centerHex, 40)

        var data = Object.assign({}, kRing)
        var newData = Object.keys(data).reduce(function (obj, key) {
          obj[data[key]] = Math.random()
          return obj
        }, {})
        return newData
      }

      mapboxgl.accessToken =
        'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw'
      const map = new mapboxgl.Map({
        container: 'c-hex-map',
        center: [config.lng, config.lat],
        zoom: config.zoom,
        style: 'mapbox://styles/mapbox/light-v9',
      })

      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
      })

      map.addControl(geocoder)

      map.on('load', () => {
        // renderHexes(map, hexagons())
        geocoder.on('result', function (ev) {
          map.flyTo({
            center: [
              ev.result.geometry.coordinates[0],
              ev.result.geometry.coordinates[1],
            ],
            zoom: 18,
          })

          const h3Geo = h3.geoToH3(
            ev.result.geometry.coordinates[0],
            ev.result.geometry.coordinates[1],
            12
          )
          // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
          document.getElementById('c-hex-map-info').innerHTML =
            'OVRLandID = ' + h3Geo
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

        var switchy = document.getElementById('remover')
        switchy.addEventListener('click', function () {
          switchy = document.getElementById('remover')
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
      })

      const zoomThreshold = 16

      map.on('moveend', function () {
        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())
        } else {
        }
      })

      let fullScreenChange

      if ('onfullscreenchange' in window.document) {
        fullScreenChange = 'fullscreenchange'
      } else if ('onmozfullscreenchange' in window.document) {
        fullScreenChange = 'mozfullscreenchange'
      } else if ('onwebkitfullscreenchange' in window.document) {
        fullScreenChange = 'webkitfullscreenchange'
      } else if ('onmsfullscreenchange' in window.document) {
        fullScreenChange = 'MSFullscreenChange'
      }

      function onFullscreenChange() {
        body.classList.toggle('fullscreen-map')
      }

      window.document.addEventListener(fullScreenChange, onFullscreenChange)

      map.on('zoom', function () {
        const sourceId = 'h3-hexes'
        const layerId = `${sourceId}-layer`

        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'visible')
          }
        } else {
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'none')
          }
        }
      })

      // Add geolocate control to the map.
      var geoLocate = new mapboxgl.GeolocateControl()
      map.addControl(geoLocate)
      geoLocate.on('geolocate', function (e) {
        map.flyTo({
          center: [e.coords.longitude, e.coords.latitude],
          zoom: 18,
        })
      })

      map.addControl(new mapboxgl.FullscreenControl())

      document
        .getElementById('c-hex-map-jump-to')
        .addEventListener('click', function () {
          // Fly to a random location by offsetting the point -74.50, 40
          // by up to 5 degrees.
          map.flyTo({
            zoom: 18,
            center: [-73.98760251687273, 40.73158848778172],
          })
        })

      map.on('mousemove', function (e) {
        const h3Geo = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12)
        // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
        document.getElementById('c-hex-map-info').innerHTML =
          'OVRLandID = ' +
          form_h3_to_words(h3Geo)[0] +
          '.' +
          form_h3_to_words(h3Geo)[1] +
          '.' +
          form_h3_to_words(h3Geo)[2]

        // console.log(h3.h3ToGeoBoundary(h3Geo));
      })
    }
  }

  const mapFullInit = () => {
    if (document.getElementById('c-hex-full-map')) {
      const hexagons = () => {
        var center = map.getCenter()
        //console.log (center)
        const centerHex = h3.geoToH3(center['lat'], center['lng'], 12)
        const kRing = h3.kRing(centerHex, 40)

        var data = Object.assign({}, kRing)
        var newData = Object.keys(data).reduce(function (obj, key) {
          obj[data[key]] = Math.random()
          return obj
        }, {})
        return newData
      }

      mapboxgl.accessToken =
        'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw'
      const map = new mapboxgl.Map({
        container: 'c-hex-full-map',
        center: [config.lng, config.lat],
        zoom: config.zoom,
        style: 'mapbox://styles/mapbox/light-v9',
      })

      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
      })

      map.addControl(geocoder)

      map.on('load', () => {
        // renderHexes(map, hexagons())
        geocoder.on('result', function (ev) {
          map.flyTo({
            center: [
              ev.result.geometry.coordinates[0],
              ev.result.geometry.coordinates[1],
            ],
            zoom: 18,
          })

          const h3Geo = h3.geoToH3(
            ev.result.geometry.coordinates[0],
            ev.result.geometry.coordinates[1],
            12
          )
          // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
          document.getElementById('c-hex-full-map-info').innerHTML =
            'OVRLandID = ' + h3Geo
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

        var switchy = document.getElementById('remover')
        switchy.addEventListener('click', function () {
          switchy = document.getElementById('remover')
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
      })

      const zoomThreshold = 16

      map.on('moveend', function () {
        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())
        } else {
        }
      })

      let fullScreenChange

      if ('onfullscreenchange' in window.document) {
        fullScreenChange = 'fullscreenchange'
      } else if ('onmozfullscreenchange' in window.document) {
        fullScreenChange = 'mozfullscreenchange'
      } else if ('onwebkitfullscreenchange' in window.document) {
        fullScreenChange = 'webkitfullscreenchange'
      } else if ('onmsfullscreenchange' in window.document) {
        fullScreenChange = 'MSFullscreenChange'
      }

      function onFullscreenChange() {
        body.classList.toggle('fullscreen-map')
      }

      window.document.addEventListener(fullScreenChange, onFullscreenChange)

      map.on('zoom', function () {
        const sourceId = 'h3-hexes'
        const layerId = `${sourceId}-layer`

        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'visible')
          }
        } else {
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'none')
          }
        }
      })

      // Add geolocate control to the map.
      var geoLocate = new mapboxgl.GeolocateControl()
      map.addControl(geoLocate)
      geoLocate.on('geolocate', function (e) {
        map.flyTo({
          center: [e.coords.longitude, e.coords.latitude],
          zoom: 18,
        })
      })

      map.addControl(new mapboxgl.FullscreenControl())

      document
        .getElementById('c-hex-full-map-jump-to')
        .addEventListener('click', function () {
          // Fly to a random location by offsetting the point -74.50, 40
          // by up to 5 degrees.
          map.flyTo({
            zoom: 18,
            center: [-73.98760251687273, 40.73158848778172],
          })
        })

      map.on('mousemove', function (e) {
        const h3Geo = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12)
        // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
        document.getElementById('c-hex-full-map-info').innerHTML =
          'OVRLandID = ' +
          form_h3_to_words(h3Geo)[0] +
          '.' +
          form_h3_to_words(h3Geo)[1] +
          '.' +
          form_h3_to_words(h3Geo)[2]

        // console.log(h3.h3ToGeoBoundary(h3Geo));
      })

      map.on('click', function (e) {
        const h3Geo = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12)

        console.log(
          'OVRLandID = ' +
            form_h3_to_words(h3Geo)[0] +
            '.' +
            form_h3_to_words(h3Geo)[1] +
            '.' +
            form_h3_to_words(h3Geo)[2]
        )
        var data = Object.assign({}, [h3Geo])
        console.log(data)
        var newData = Object.keys(data).reduce(function (obj, key) {
          obj[data[key]] = Math.random()
          return obj
        }, {})
        console.log(newData)

        var geojson = geojson2h3.h3SetToFeatureCollection(
          Object.keys(newData),
          (hex) => ({ value: newData[hex] })
        )

        const selected_sourceId = 'h3-hexes_selectedovered'
        const selected_layerId = `${selected_sourceId}-layer`
        let selected_source = map.getSource(selected_sourceId)
        $1('#c-fhi-coordi-cont').innerHTML = geojson['features'][0]['geometry'][
          'coordinates'
        ][0].join(' <br>')
        $1('#c-fhi-name').innerHTML =
          form_h3_to_words(h3Geo)[0] +
          '.' +
          form_h3_to_words(h3Geo)[1] +
          '.' +
          form_h3_to_words(h3Geo)[2]
        if (!selected_source) {
          map.addSource(selected_sourceId, {
            type: 'geojson',
            data: geojson,
          })
          map.addLayer({
            id: selected_layerId,
            source: selected_sourceId,
            type: 'fill',
            interactive: false,
            paint: {
              'fill-outline-color': 'rgba(47,215,255,1)',
              'fill-color': '#2fd7ff',
              'fill-opacity': 1,
            },
          })
          selected_source = map.getSource(selected_sourceId)
        }

        // Update the h3Geo data
        selected_source.setData(geojson)

        map.setLayoutProperty(selected_layerId, 'visibility', 'visible')
        document.body.classList.add('js-full-hex-show')

        var offset = $1('#c-full-hex-info-container').offsetTop

        window.scroll({
          top: offset,
          left: 0,
          behavior: 'smooth',
        })
      })
    }
  }

  const bountyMapInit = () => {
    if (document.getElementById('c-bounty-hex-map')) {
      var data = {
        name: 'order_by',
        value: 'total_discovered_land',
      }

      reqwest({
        url: 'https://pws.ovr.ai/charts',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          console.log(resp['users'])

          each(resp['users'], function (index, user) {
            var html_node = '<tr>'
            html_node +=
              '<td>' + user['first_name'] + ' ' + user['last_name'] + '</td>'
            html_node += '<td>' + user['total_discovered_land'] + '</td>'
            html_node += '<td>' + user['total_token'] + '</td>'
            html_node += '</tr>'
            document
              .getElementById('c-bounty--chart_table')
              .insertAdjacentHTML('beforeend', html_node)
          })

          document
            .getElementById('c-bounty-map__total-lands')
            .insertAdjacentHTML(
              'beforeend',
              resp['stats']['bountylands']['discovered']
            )
          document
            .getElementById('c-bounty-map__bounty-tokens')
            .insertAdjacentHTML(
              'beforeend',
              resp['stats']['bountylands']['total_token']
            )

          // c-bounty-map__total-users c-bounty-map__total-registered-users
        },
      })

      const hexagons = () => {
        var center = map.getCenter()
        //console.log (center)
        const centerHex = h3.geoToH3(center['lat'], center['lng'], 12)
        const kRing = h3.kRing(centerHex, 40)

        console.log('kRing', kRing)
        var data = Object.assign({}, kRing)
        // console.log('data', data)

        var newData = Object.keys(data).reduce(function (obj, key) {
          obj[data[key]] = Math.random()
          return obj
        }, {})
        // console.log('newData', newData)
        return newData
      }

      mapboxgl.accessToken =
        'pk.eyJ1IjoibWFudG9uZWxsaSIsImEiOiJjam9hNmljdHkwY2Y0M3JuejJrenhmMWE1In0.dC9b8oqj24iiSfm-qbNqmw'
      const map = new mapboxgl.Map({
        container: 'c-bounty-hex-map',
        center: [config.lng, config.lat],
        zoom: config.zoom,
        style: 'mapbox://styles/mapbox/light-v9',
      })

      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
      })

      map.addControl(geocoder)

      map.on('load', () => {
        reqwest({
          url: 'https://pws.ovr.ai/geojson_bounty_multipoints',
          method: 'GET',
          contentType: 'application/json',
          crossOrigin: true,
          withCredential: true,
          dataType: 'json',
          success: function (resp) {
            map.addSource('bountycluster', {
              type: 'geojson',
              // Point to GeoJSON data. This example visualizes all M1.0+ bountycluster
              // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
              data: resp,
              cluster: true,
              clusterMaxZoom: 14, // Max zoom to cluster points on
              clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
            })

            map.addLayer({
              id: 'clusters',
              type: 'circle',
              source: 'bountycluster',
              filter: ['has', 'point_count'],
              paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#006494',
                  100,
                  '#44355D',
                  750,
                  '#1a0731',
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40,
                ],
              },
            })

            map.addLayer({
              id: 'cluster-count',
              type: 'symbol',
              source: 'bountycluster',
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
              id: 'unclustered-point',
              type: 'circle',
              source: 'bountycluster',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
              },
            })

            // inspect a cluster on click
            map.on('click', 'clusters', function (e) {
              var features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters'],
              })
              var clusterId = features[0].properties.cluster_id
              map
                .getSource('bountycluster')
                .getClusterExpansionZoom(clusterId, function (err, zoom) {
                  if (err) return

                  map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom,
                  })
                })
            })

            map.on('mouseenter', 'clusters', function () {
              map.getCanvas().style.cursor = 'pointer'
            })
            map.on('mouseleave', 'clusters', function () {
              map.getCanvas().style.cursor = ''
            })
          },
        })

        geocoder.on('result', function (ev) {
          map.flyTo({
            center: [
              ev.result.geometry.coordinates[0],
              ev.result.geometry.coordinates[1],
            ],
            zoom: 18,
          })

          const h3Geo = h3.geoToH3(
            ev.result.geometry.coordinates[0],
            ev.result.geometry.coordinates[1],
            12
          )
          // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
          document.getElementById('c-hex-map-info').innerHTML =
            'OVRLandID = ' + h3Geo
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
        if (document.getElementById('remover') == 0) {
          var switchy = document.getElementById('remover')
          switchy.addEventListener('click', function () {
            switchy = document.getElementById('remover')
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

      const zoomThreshold = 16

      map.on('moveend', function () {
        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())

          reqwest({
            url: 'https://pws.ovr.ai/geojson_bounty_neighbours',
            method: 'POST',
            type: 'json',
            contentType: 'application/json',
            crossOrigin: true,
            withCredential: true,
            data: JSON.stringify({ hex_list: hexagons() }),
            dataType: 'json',
            success: function (resp) {
              // console.log("undiscovered", resp['undiscovered']);
              // console.log("discovered", resp['discovered']);

              const disc_sourceId = 'h3-hexes_discovered'
              const disc_layerId = `${disc_sourceId}-layer`
              let disc_source = map.getSource(disc_sourceId)

              if (!disc_source) {
                map.addSource(disc_sourceId, {
                  type: 'geojson',
                  data: resp['discovered'],
                })
                map.addLayer({
                  id: disc_layerId,
                  source: disc_sourceId,
                  type: 'fill',
                  interactive: false,
                  paint: {
                    'fill-outline-color': 'rgba(255,255,255,0)',
                    'fill-color': '#ffd700',
                    'fill-opacity': 0.8,
                  },
                })
                disc_source = map.getSource(disc_sourceId)
              }

              // Update the resp['discovered'] data
              disc_source.setData(resp['discovered'])

              map.setLayoutProperty(disc_layerId, 'visibility', 'visible')

              // UNDISCOVERED
              const undisc_sourceId = 'h3-hexes_undiscovered'
              const undisc_layerId = `${undisc_sourceId}-layer`
              let undisc_source = map.getSource(undisc_sourceId)

              if (!undisc_source) {
                map.addSource(undisc_sourceId, {
                  type: 'geojson',
                  data: resp['undiscovered'],
                })
                map.addLayer({
                  id: undisc_layerId,
                  source: undisc_sourceId,
                  type: 'fill',
                  interactive: false,
                  paint: {
                    'fill-color': 'rgba(255,215,0,0.2)',
                    'fill-opacity': 0.5,
                    'fill-outline-color': 'rgba(255,215,0,1)',
                  },
                })
                undisc_source = map.getSource(undisc_sourceId)
              }

              // Update the resp['discovered'] data
              undisc_source.setData(resp['undiscovered'])

              map.setLayoutProperty(undisc_layerId, 'visibility', 'visible')

              // TOOLTIP and filter discovered
              let disc_highlited = map.getSource('discovered-highlighted')

              if (!disc_highlited) {
                map.addLayer({
                  id: 'discovered-highlighted',
                  type: 'fill',
                  source: disc_sourceId,
                  paint: {
                    'fill-outline-color': 'rgba(0,158,250,1)',
                    'fill-color': 'rgba(0,158,250,1)',
                    'fill-opacity': 1,
                  },
                  filter: ['in', 'user_id', ''],
                }) // Place polygon under these labels.
              }

              var overlay = document.getElementById('map-overlay')
              var popup = new mapboxgl.Popup({
                closeButton: false,
              })

              map.on('mousemove', disc_layerId, function (e) {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer'

                // Single out the first found feature.
                var feature = e.features[0]

                // Query the counties layer visible in the map. Use the filter
                // param to only collect results that share the same county name.
                var relatedFeatures = map.querySourceFeatures(disc_sourceId, {
                  source: disc_layerId,
                  filter: ['in', 'user_id', feature.properties.user_id],
                })
                // Render found features in an overlay.
                overlay.innerHTML = ''
                var population = document.createElement('div')

                // Total the population of all features
                // var populationSum = relatedFeatures.reduce(function(memo, feature) {
                //     return memo + feature.properties.population;
                // }, 0);

                // console.log(relatedFeatures)

                population.innerHTML =
                  '<strong>ID</strong>: ' +
                  feature.properties.hex_id +
                  '<br><strong>Discovered</strong>: ' +
                  feature.properties.date +
                  "<br><strong  style='color:#009efa;' >User</strong>: <span>" +
                  feature.properties.user_id +
                  '</span>' +
                  '<br><strong>Prize index</strong>: ' +
                  feature.properties.prize_index +
                  '<br><strong>Prize Size</strong>: ' +
                  feature.properties.prize_value

                overlay.appendChild(population)
                overlay.style.display = 'block'

                // Add features that share the same county name to the highlighted layer.
                map.setFilter('discovered-highlighted', [
                  'in',
                  'user_id',
                  feature.properties.user_id,
                ])

                // Display a popup with the name of the county
                popup
                  .setLngLat(e.lngLat)
                  .setText('ID: ' + feature.properties.hex_id) //feature.properties.COUNTY
                  .addTo(map)
              })

              map.on('mouseleave', disc_layerId, function () {
                map.getCanvas().style.cursor = ''
                popup.remove()
                map.setFilter('discovered-highlighted', ['in', 'user_id', ''])
                overlay.style.display = 'none'
              })

              // Tooltip Undiscovered
              map.on('mousemove', undisc_layerId, function (e) {
                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer'

                // Single out the first found feature.
                var feature = e.features[0]
                // Display a popup with the name of the county
                popup
                  .setLngLat(e.lngLat)
                  .setText('ID: ' + feature.properties.hex_id) //feature.properties.COUNTY
                  .addTo(map)
              })

              map.on('mouseleave', undisc_layerId, function () {
                map.getCanvas().style.cursor = ''
                popup.remove()
                overlay.style.display = 'none'
              })
            },
          })
        } else {
        }
      })

      let fullScreenChange

      if ('onfullscreenchange' in window.document) {
        fullScreenChange = 'fullscreenchange'
      } else if ('onmozfullscreenchange' in window.document) {
        fullScreenChange = 'mozfullscreenchange'
      } else if ('onwebkitfullscreenchange' in window.document) {
        fullScreenChange = 'webkitfullscreenchange'
      } else if ('onmsfullscreenchange' in window.document) {
        fullScreenChange = 'MSFullscreenChange'
      }

      function onFullscreenChange() {
        body.classList.toggle('fullscreen-map')
      }

      window.document.addEventListener(fullScreenChange, onFullscreenChange)

      map.on('zoom', function () {
        const sourceId = 'h3-hexes'
        const layerId = `${sourceId}-layer`

        if (map.getZoom() > zoomThreshold) {
          renderHexes(map, hexagons())
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'visible')
          }
        } else {
          if (map.getLayer('h3-hexes-layer')) {
            map.setLayoutProperty(layerId, 'visibility', 'none')
          }
        }
      })

      // Add geolocate control to the map.
      var geoLocate = new mapboxgl.GeolocateControl()
      map.addControl(geoLocate)
      geoLocate.on('geolocate', function (e) {
        map.flyTo({
          center: [e.coords.longitude, e.coords.latitude],
          zoom: 18,
        })
      })

      map.addControl(new mapboxgl.FullscreenControl())

      if (document.getElementById('c-hex-map-jump-to')) {
        document
          .getElementById('c-hex-map-jump-to')
          .addEventListener('click', function () {
            // Fly to a random location by offsetting the point -74.50, 40
            // by up to 5 degrees.
            map.flyTo({
              zoom: 18,
              center: [-73.98760251687273, 40.73158848778172],
            })
          })

        map.on('mousemove', function (e) {
          const h3Geo = h3.geoToH3(e.lngLat['lat'], e.lngLat['lng'], 12)
          // document.getElementById('c-hex-map-info').innerHTML = h3Geo + ' = ' +  JSON.stringify(e.lngLat)
          document.getElementById('c-hex-map-info').innerHTML =
            'OVRLandID = ' +
            form_h3_to_words(h3Geo)[0] +
            '.' +
            form_h3_to_words(h3Geo)[1] +
            '.' +
            form_h3_to_words(h3Geo)[2]
          console.log(h3Geo)

          // console.log(h3.h3ToGeoBoundary(h3Geo));
        })
      }
    }
  }

  function sum(obj) {
    var sum = 0
    for (var el in obj) {
      if (obj.hasOwnProperty(el)) {
        if (obj[el] != undefined) {
          sum += parseFloat(obj[el])
        }
      }
    }
    return sum
  }

  const statsPageInit = () => {
    if (document.getElementById('c-user-stats')) {
      var data = {
        name: 'order_by',
        value: 'total_discovered_land',
      }
      reqwest({
        url: 'https://pws.ovr.ai/charts',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          document
            .getElementById('c-bounty-map__total-lands')
            .insertAdjacentHTML(
              'beforeend',
              resp['stats']['bountylands']['discovered']
            )
          document
            .getElementById('c-bounty-map__bounty-tokens')
            .insertAdjacentHTML(
              'beforeend',
              resp['stats']['bountylands']['total_token']
            )
          document
            .getElementById('c-bounty-map__total-registered-users')
            .insertAdjacentHTML(
              'beforeend',
              resp['stats']['users']['registered']
            )
          document
            .getElementById('c-bounty-map__total-facebook-users')
            .insertAdjacentHTML('beforeend', resp['stats']['users']['facebook'])
          document
            .getElementById('c-bounty-map__total-wechat-users')
            .insertAdjacentHTML('beforeend', resp['stats']['users']['wechat'])
          document
            .getElementById('c-bounty-map__total-email-users')
            .insertAdjacentHTML('beforeend', resp['stats']['users']['email'])
          document
            .getElementById('c-bounty-map__amazix-users')
            .insertAdjacentHTML('beforeend', resp['stats']['users']['referral'])
          // #
        },
      })

      var data = {
        api_key:
          '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
      }
      var chart
      reqwest({
        url: 'https://pws.ovr.ai/advanced_stats',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          var dates = resp.map((a) => a.date)
          var session_counts = resp.map((a) => a.active_users)
          document
            .getElementById('js-total-session')
            .insertAdjacentHTML('beforeend', sum(session_counts))

          var registration_counts = resp.map((a) => a.registered_users)
          document
            .getElementById('js-total-registration')
            .insertAdjacentHTML('beforeend', sum(registration_counts))

          var referral_counts = resp.map((a) => a.referral_users)
          var session_email = resp.map((a) => a.active_email)
          var session_facebook = resp.map((a) => a.active_facebook)
          var session_wechat = resp.map((a) => a.active_wechat)

          //js-user-date

          var ctx = document.getElementById('c-user-stats').getContext('2d')
          chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
              labels: dates,
              datasets: [
                {
                  label: 'Registrations',
                  backgroundColor: 'rgba(229,74,9,0.7)',
                  borderColor: 'rgba(229,74,9)',
                  data: registration_counts,
                  type: 'line',
                },
                {
                  label: 'Facebook sessions',
                  backgroundColor: 'rgba(59, 89, 152,0.7)',
                  borderColor: 'rgba(59, 89, 152)',
                  data: session_facebook,
                  type: 'line',
                },
                {
                  label: 'WeChat sessions',
                  backgroundColor: 'rgba(9, 184, 62 ,0.7)',
                  borderColor: 'rgba(9, 184, 62)',
                  data: session_wechat,
                  type: 'line',
                },
                {
                  label: 'Email sessions',
                  backgroundColor: 'rgba(199, 0, 142,0.7)',
                  borderColor: 'rgba(199, 0, 142)',
                  data: session_email,
                  type: 'line',
                },
                {
                  label: 'Total sessions',
                  backgroundColor: 'rgba(29,3,51,0.7)',
                  borderColor: 'rgba(29,3,51)',
                  data: session_counts,
                  type: 'line',
                },
                // {
                //   label: 'Discovered Bounty',
                //   backgroundColor: 'rgba(234, 155, 77,0.7)',
                //   borderColor: 'rgba(234, 155, 77)',
                //   data: discovered_bounties,
                // }
              ],
            },

            // Configuration options go here
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          })

          const datePickers = $('.js-user-date')
          each(datePickers, (i, datePicker) => {
            datePicker.addEventListener('change', function () {
              console.log($1('#js_start_date').value)
              console.log($1('#js_end_date').value)

              var data = {
                api_key:
                  '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
                start_date: $1('#js_start_date').value,
                end_date: $1('#js_end_date').value,
              }
              chart.data.labels.pop()
              chart.data.datasets.forEach((dataset) => {
                dataset.data.pop()
              })
              chart.update()
              reqwest({
                url: 'https://pws.ovr.ai/advanced_stats',
                method: 'POST',
                type: 'json',
                contentType: 'application/json',
                crossOrigin: true,
                withCredential: true,
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (resp) {
                  chart.destroy()

                  var dates = resp.map((a) => a.date)
                  var session_counts = resp.map((a) => a.active_users)
                  document.getElementById('js-total-session').innerHTML = sum(
                    session_counts
                  )

                  var registration_counts = resp.map((a) => a.registered_users)
                  document.getElementById(
                    'js-total-registration'
                  ).innerHTML = sum(registration_counts)

                  var referral_counts = resp.map((a) => a.referral_users)
                  var session_email = resp.map((a) => a.active_email)
                  var session_facebook = resp.map((a) => a.active_facebook)
                  var session_wechat = resp.map((a) => a.active_wechat)

                  //js-user-date

                  var ctx = document
                    .getElementById('c-user-stats')
                    .getContext('2d')
                  chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: 'bar',

                    // The data for our dataset
                    data: {
                      labels: dates,
                      datasets: [
                        {
                          label: 'Registrations',
                          backgroundColor: 'rgba(229,74,9,0.7)',
                          borderColor: 'rgba(229,74,9)',
                          data: registration_counts,
                          type: 'line',
                        },
                        {
                          label: 'Facebook sessions',
                          backgroundColor: 'rgba(59, 89, 152,0.7)',
                          borderColor: 'rgba(59, 89, 152)',
                          data: session_facebook,
                          type: 'line',
                        },
                        {
                          label: 'WeChat sessions',
                          backgroundColor: 'rgba(9, 184, 62 ,0.7)',
                          borderColor: 'rgba(9, 184, 62)',
                          data: session_wechat,
                          type: 'line',
                        },
                        {
                          label: 'Email sessions',
                          backgroundColor: 'rgba(199, 0, 142,0.7)',
                          borderColor: 'rgba(199, 0, 142)',
                          data: session_email,
                          type: 'line',
                        },
                        {
                          label: 'Total sessions',
                          backgroundColor: 'rgba(29,3,51,0.7)',
                          borderColor: 'rgba(29,3,51)',
                          data: session_counts,
                          type: 'line',
                        },
                        // {
                        //   label: 'Discovered Bounty',
                        //   backgroundColor: 'rgba(234, 155, 77,0.7)',
                        //   borderColor: 'rgba(234, 155, 77)',
                        //   data: discovered_bounties,
                        // }
                      ],
                    },

                    // Configuration options go here
                    options: {
                      responsive: true,
                      maintainAspectRatio: false,
                    },
                  })
                },
              })

              // // re-render the chart
              // myChart.update();
            })
          })
        },
      })

      var data = {
        api_key:
          '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
        page: 1,
      }
      reqwest({
        url: 'https://pws.ovr.ai/user_table',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          each(resp['users'], function (index, user) {
            var html_node = '<tr>'
            html_node += '<td>' + user['email'] + '</td>'
            html_node += '<td>' + user['name'] + '</td>'
            html_node += '<td>' + user['total_discovered_land'] + '</td>'
            html_node += '<td>' + user['total_token'] + '</td>'
            html_node += '<td>' + user['timestamp_create']['$date'] + '</td>'
            html_node += '</tr>'
            document
              .getElementById('c-bounty--user_table')
              .insertAdjacentHTML('beforeend', html_node)
          })
          document
            .getElementById('c-bounty--user_total')
            .insertAdjacentHTML('beforeend', resp['total'])
          document
            .getElementById('c-bounty--user_page_total')
            .insertAdjacentHTML('beforeend', resp['number_pages'])
          document
            .getElementById('c-bounty--user_current-page')
            .insertAdjacentHTML('beforeend', resp['current_page'])
        },
      })

      document
        .getElementById('c--bounty--user_prev')
        .addEventListener('click', function (event) {
          event.preventDefault()
          var current_page = document.getElementById(
            'c-bounty--user_current-page'
          ).innerText
          if (current_page > 1) {
            document.getElementById('c-bounty--user_table').innerHTML = ''
            document.getElementById('c-bounty--user_current-page').innerHTML =
              ''
            current_page--
            var data = {
              api_key:
                '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
              page: current_page,
            }
            reqwest({
              url: 'https://pws.ovr.ai/user_table',
              method: 'POST',
              type: 'json',
              contentType: 'application/json',
              crossOrigin: true,
              withCredential: true,
              data: JSON.stringify(data),
              dataType: 'json',
              success: function (resp) {
                each(resp['users'], function (index, user) {
                  var html_node = '<tr>'
                  html_node += '<td>' + user['email'] + '</td>'
                  html_node += '<td>' + user['name'] + '</td>'
                  html_node += '<td>' + user['total_discovered_land'] + '</td>'
                  html_node += '<td>' + user['total_token'] + '</td>'
                  html_node +=
                    '<td>' + user['timestamp_create']['$date'] + '</td>'
                  html_node += '</tr>'
                  document
                    .getElementById('c-bounty--user_table')
                    .insertAdjacentHTML('beforeend', html_node)
                })
                document
                  .getElementById('c-bounty--user_current-page')
                  .insertAdjacentHTML('beforeend', resp['current_page'])
              },
            })
          }
        })
      document
        .getElementById('c--bounty--user_next')
        .addEventListener('click', function (event) {
          event.preventDefault()
          var current_page = document.getElementById(
            'c-bounty--user_current-page'
          ).innerText
          var number_pages = parseInt(
            document.getElementById('c-bounty--user_page_total').innerText
          )
          if (current_page < number_pages) {
            document.getElementById('c-bounty--user_table').innerHTML = ''
            document.getElementById('c-bounty--user_current-page').innerHTML =
              ''
            current_page++
            var data = {
              api_key:
                '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
              page: current_page,
            }
            reqwest({
              url: 'https://pws.ovr.ai/user_table',
              method: 'POST',
              type: 'json',
              contentType: 'application/json',
              crossOrigin: true,
              withCredential: true,
              data: JSON.stringify(data),
              dataType: 'json',
              success: function (resp) {
                each(resp['users'], function (index, user) {
                  var html_node = '<tr>'
                  html_node += '<td>' + user['email'] + '</td>'
                  html_node += '<td>' + user['name'] + '</td>'
                  html_node += '<td>' + user['total_discovered_land'] + '</td>'
                  html_node += '<td>' + user['total_token'] + '</td>'
                  html_node +=
                    '<td>' + user['timestamp_create']['$date'] + '</td>'
                  html_node += '</tr>'
                  document
                    .getElementById('c-bounty--user_table')
                    .insertAdjacentHTML('beforeend', html_node)
                })
                document
                  .getElementById('c-bounty--user_current-page')
                  .insertAdjacentHTML('beforeend', resp['current_page'])
              },
            })
          }
        })

      reqwest({
        url: 'https://pws.ovr.ai/user_referral_table',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          each(resp['users'], function (index, user) {
            var html_node = '<tr>'
            html_node += '<td>' + user['email'] + '</td>'
            html_node += '<td>' + user['full_name'] + '</td>'
            html_node += '<td>' + user['referral_email'] + '</td>'
            html_node += '<td>' + user['timestamp']['$date'] + '</td>'
            html_node += '</tr>'
            document
              .getElementById('c-bounty--user_referral_table')
              .insertAdjacentHTML('beforeend', html_node)
          })
          document
            .getElementById('c-bounty--user_ref_total')
            .insertAdjacentHTML('beforeend', resp['total'])
          document
            .getElementById('c-bounty--user_ref_page_total')
            .insertAdjacentHTML('beforeend', resp['number_pages'])
          document
            .getElementById('c-bounty--user_ref_current-page')
            .insertAdjacentHTML('beforeend', resp['current_page'])
        },
      })

      document
        .getElementById('c--bounty--user_ref_prev')
        .addEventListener('click', function (event) {
          event.preventDefault()
          var current_page = document.getElementById(
            'c-bounty--user_ref_current-page'
          ).innerText
          if (current_page > 1) {
            document.getElementById('c-bounty--user_referral_table').innerHTML =
              ''
            document.getElementById(
              'c-bounty--user_ref_current-page'
            ).innerHTML = ''
            current_page--
            var data = {
              api_key:
                '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
              page: current_page,
            }
            reqwest({
              url: 'https://pws.ovr.ai/user_referral_table',
              method: 'POST',
              type: 'json',
              contentType: 'application/json',
              crossOrigin: true,
              withCredential: true,
              data: JSON.stringify(data),
              dataType: 'json',
              success: function (resp) {
                each(resp['users'], function (index, user) {
                  var html_node = '<tr>'
                  html_node += '<td>' + user['email'] + '</td>'
                  html_node += '<td>' + user['full_name'] + '</td>'
                  html_node += '<td>' + user['referral_email'] + '</td>'
                  html_node += '<td>' + user['timestamp']['$date'] + '</td>'
                  html_node += '</tr>'
                  document
                    .getElementById('c-bounty--user_referral_table')
                    .insertAdjacentHTML('beforeend', html_node)
                })
                document
                  .getElementById('c-bounty--user_ref_current-page')
                  .insertAdjacentHTML('beforeend', resp['current_page'])
              },
            })
          }
        })
      document
        .getElementById('c--bounty--user_ref_next')
        .addEventListener('click', function (event) {
          event.preventDefault()
          var current_page = document.getElementById(
            'c-bounty--user_ref_current-page'
          ).innerText
          var number_pages = parseInt(
            document.getElementById('c-bounty--user_ref_page_total').innerText
          )
          if (current_page < number_pages) {
            document.getElementById('c-bounty--user_referral_table').innerHTML =
              ''
            document.getElementById(
              'c-bounty--user_ref_current-page'
            ).innerHTML = ''
            current_page++
            var data = {
              api_key:
                '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
              page: current_page,
            }
            reqwest({
              url: 'https://pws.ovr.ai/user_referral_table',
              method: 'POST',
              type: 'json',
              contentType: 'application/json',
              crossOrigin: true,
              withCredential: true,
              data: JSON.stringify(data),
              dataType: 'json',
              success: function (resp) {
                each(resp['users'], function (index, user) {
                  var html_node = '<tr>'
                  html_node += '<td>' + user['email'] + '</td>'
                  html_node += '<td>' + user['full_name'] + '</td>'
                  html_node += '<td>' + user['referral_email'] + '</td>'
                  html_node += '<td>' + user['timestamp']['$date'] + '</td>'
                  html_node += '</tr>'
                  document
                    .getElementById('c-bounty--user_referral_table')
                    .insertAdjacentHTML('beforeend', html_node)
                })
                document
                  .getElementById('c-bounty--user_ref_current-page')
                  .insertAdjacentHTML('beforeend', resp['current_page'])
              },
            })
          }
        })
    }
  }

  const bountyPageInit = () => {
    if (document.getElementById('c-bounty-chart')) {
      var data = {
        api_key:
          '189bbbb00c5f1fb7fba9ad9285f193d1be46c0595051f6bb8c40b4e913461591',
      }
      reqwest({
        url: 'https://pws.ovr.ai/advanced_stats',
        method: 'POST',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true,
        withCredential: true,
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (resp) {
          console.log(resp)
          var discovered_bounties = resp.map((a) => a.discovered_bounties)
          var dates = resp.map((a) => a.date)

          //js-user-date

          var ctx = document.getElementById('c-bounty-chart').getContext('2d')
          var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',

            // The data for our dataset
            data: {
              labels: dates,
              datasets: [
                {
                  label: 'Bounty Discovers',
                  backgroundColor: 'rgba(234, 155, 77,0.7)',
                  borderColor: 'rgba(234, 155, 77)',
                  data: discovered_bounties,
                },
                // {
                //   label: 'Discovered Bounty',
                //   backgroundColor: 'rgba(234, 155, 77,0.7)',
                //   borderColor: 'rgba(234, 155, 77)',
                //   data: discovered_bounties,
                // }
              ],
            },

            // Configuration options go here
            options: {
              responsive: true,
              maintainAspectRatio: false,
            },
          })
        },
      })
    }
  }
  const fadeInScndS = () => {
    TweenMax.set('#base', { opacity: 0 }) // mondo
    TweenMax.set('.scn-8 path', { opacity: 0 }) // hex mondo
    TweenMax.set('.exa', { scale: 0, transformOrigin: 'center' }) // 3 esagoni minori
    TweenMax.set('.omino', { scale: 0, transformOrigin: 'center' }) // 3 esagoni con uomini
    TweenMax.set('#mama', { scale: 0, transformOrigin: 'center' }) // 3 esagoni con uomini
    TweenMax.set('.boxes', {
      scale: 0,
      y: '-50px',
      transformOrigin: 'center bottom',
    }) // 3 cubi
    TweenMax.set('.schermivirtual', {
      opacity: 0,
      y: '-50px',
      transformOrigin: 'center',
    }) // 3 vrexp

    var scndSVGTL = new TimelineMax({ repeat: -1 })
    scndSVGTL.timeScale(9)
    scndSVGTL.addPause(400).play()

    inView('#intro').once('enter', function () {
      var tl = new TimelineMax({ repeat: -1 })
      tl.to('#base', 1.8, { opacity: 1 })
      tl.staggerTo('.scn-8 path', 0.4, { opacity: 1 }, 0.03, '-=0.8')
      tl.staggerTo('.exa', 0.3, { scale: 1 }, 0.2, '-=0.8')
      tl.staggerTo('.omino', 0.4, { scale: 1 }, 0.2)
      tl.staggerTo('.boxes', 0.4, { scale: 1, y: '0px' }, 0.2)
      tl.staggerTo('.schermivirtual', 0.4, { opacity: 1, y: '0px' }, 0.2)
      tl.staggerTo('#mama', 0.4, { scale: 1 }, 0.2, '-=1.5').add(scndSVGTL, 0)
    })
  }

  const fadeInTimelineS = () => {
    TweenMax.set(
      [
        '#LINEA_1 path',
        '#LINEA_2 path',
        '#LINEA_3 path',
        '#LINEA_4 path',
        '#LINEA_5 path',
        '#LINEA_6 path',
        '#LINEA_7 path',
        '#LINEA_8',
        '#LINEA_9 path',
        '#LINEA_10 path',
        '#LINEA_11 path',
      ],
      { opacity: 0 }
    ) // hex mondo

    var timelineSCGTL = new TimelineMax({ repeat: -1 })
    timelineSCGTL.timeScale(9)
    timelineSCGTL.addPause(400).play()

    inView('#timeline-svg').once('enter', function () {
      var tl = new TimelineMax({ delay: 1, repeat: -1 })
      tl.staggerTo(
        [
          '#LINEA_1 path',
          '#LINEA_2 path',
          '#LINEA_3 path',
          '#LINEA_4 path',
          '#LINEA_5 path',
          '#LINEA_6 path',
          '#LINEA_7 path',
          '#LINEA_8',
          '#LINEA_9 path',
          '#LINEA_10 path',
          '#LINEA_11 path',
        ],
        0.4,
        { opacity: 1 },
        0.05
      ).add(timelineSCGTL, 0)
    })
  }

  const languageManager = () => {
    // let languageMenuVoice = document.getElementById('c-submenu-host')
    // languageMenuVoice.on('mouseenter', 'clusters', function () {
    //   languageMenuVoice.classList.add('show')
    // });

    var button = document.querySelector('#c-submenu-host')
    button &&
      (button.onmouseenter = function () {
        button.classList.add('show')
      })

    var button2 = document.querySelector('#submenu')
    button2 &&
      (button2.onmouseleave = function () {
        button.classList.remove('show')
      })

    // map.on('mouseleave', 'clusters', function () {
    //     map.getCanvas().style.cursor = '';
    // });
  }

  const pinchZoom = () => {
    if (screen.width < 769 && document.querySelector('#ecosystem')) {
      let options = {
        tapZoomFactor: 2,
        draggableUnzoomed: false,
      }
      let el = document.querySelector('#ecosystem')
      let pz = new PinchZoom(el, options)
    }
  }

  const init = () => {
    scrollToLink()
    startParallax()
    initCarousels()
    menuManager()
    countDownManager()
    listenForms()
    onMobileHamburgerClick()
    preloaderFadeOut()
    mapInit()
    mapFullInit()
    bountyMapInit()
    statsPageInit()
    switchFooterColor()
    pinchZoom()
    bountyPageInit()
    languageManager()
  }

  const svgInit = () => {
    fadeInScndS()
    // fadeInTimelineS();
  }

  return {
    init,
    mapInit: mapInit,
    svgInit,
  }
})()

export default Application
