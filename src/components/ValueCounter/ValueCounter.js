import React, { Component } from 'react'
import PropTypes from 'prop-types'

function format(num) {
  return ('' + num).replace(
    /(\d)(?=(?:\d{3})+(?:\.|$))|(\.\d\d?)\d*$/g,
    function (m, s1, s2) {
      return s2 || s1 + ','
    }
  )
}

const ValueCounter = ({
  currency = 'ovr',
  value = 0,
  color = 'orange',
  text = '',
}) => {
  let show_value = value
  if (parseFloat(value) > 1000) {
    show_value = format(value)
  }
  return (
    <div className={`ValueCounter --${color}`}>
      <div className="ValueCounter__icon">
        <div className="Icon">
          {currency == 'ovr' || currency == undefined ? (
            <svg
              width="18px"
              height="20px"
              viewBox="0 0 18 20"
              imageRendering="optimizeQuality"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              xmlns="http://www.w3.org/2000/svg"
              x="0"
              y="0"
            >
              <defs>
                <linearGradient
                  x1="109.444%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                  id="prefix__a"
                >
                  <stop stopColor="#EB663B" offset="0%" />
                  <stop stopColor="#F9B326" offset="100%" />
                </linearGradient>
              </defs>
              <g
                transform="translate(-1)"
                stroke={`url(${
                  window.location.protocol +
                  '//' +
                  window.location.host +
                  window.location.pathname
                }#prefix__a)`}
                fill="none"
                fillRule="evenodd"
              >
                <path d="M18.5 5.246v9.462a2.01 2.01 0 01-1.21 1.842l-5.624 2.41-.886.38a1.984 1.984 0 01-1.56 0l-1.274-.546L2.71 16.55a2.01 2.01 0 01-1.21-1.842V5.246A2.01 2.01 0 012.721 3.4l.218-.091L9.23.656a1.973 1.973 0 011.538 0l3.974 1.674L17.279 3.4A2.01 2.01 0 0118.5 5.246z" />
                <path d="M15.958 5.47a1.472 1.472 0 00-.62-.518l-1.86-.817-2.914-1.28a1.4 1.4 0 00-1.128 0L4.822 4.881l-.16.07a1.472 1.472 0 00-.62.517 1.582 1.582 0 00-.275.896V13.6c0 .327.099.638.273.892.153.224.363.405.614.517l3.84 1.716.934.417a1.4 1.4 0 001.144 0l.65-.29 4.124-1.843c.251-.112.461-.293.614-.517.174-.254.273-.565.273-.892V6.365c0-.329-.1-.64-.275-.896z" />
                <path d="M6.033 10c0-2.16 1.776-3.912 3.967-3.912 2.19 0 3.967 1.752 3.967 3.912S12.19 13.912 10 13.912c-2.19 0-3.967-1.752-3.967-3.912z" />
              </g>
            </svg>
          ) : (
            <></>
          )}
          {currency == 'dai' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              className="Dai__icon__svg"
              imageRendering="optimizeQuality"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              viewBox="0 0 18 18"
            >
              <path
                fill="#f5ac37"
                d="M9 0a9 9 0 019 9c0 4.973-4.027 9-9 9-4.969 0-9-4.031-9-9s4.031-9 9-9zm0 0"
              ></path>
              <path
                fill="#fefefd"
                d="M9.332 9.637h3.418c.074 0 .11 0 .113-.098a6.69 6.69 0 000-1.047c0-.066-.031-.094-.105-.094H5.949c-.082 0-.105.028-.105.106v1.004c0 .129 0 .129.136.129zm3.148-2.41a.091.091 0 000-.079 1.75 1.75 0 00-.203-.351 2.84 2.84 0 00-.414-.524 1.321 1.321 0 00-.258-.253 4.073 4.073 0 00-1.687-.856 4.174 4.174 0 00-.957-.102H5.937c-.082 0-.093.036-.093.106v2c0 .082 0 .105.105.105h6.492s.055-.011.067-.046zm0 3.578a1.738 1.738 0 00-.285 0H5.957c-.086 0-.113 0-.113.113v1.953c0 .09 0 .113.113.113h2.879c.137.008.277 0 .41-.03a4.134 4.134 0 001.223-.27c.14-.047.281-.114.41-.192h.039a3.668 3.668 0 001.57-1.578s.04-.086-.008-.11zm-7.765 3.191v-3.113c0-.07 0-.082-.09-.082H3.402c-.066 0-.093 0-.093-.09V9.64h1.304c.07 0 .102 0 .102-.094V8.488c0-.066 0-.086-.09-.086H3.402c-.066 0-.093 0-.093-.09v-.988c0-.062 0-.078.09-.078h1.206c.086 0 .11 0 .11-.105V4.105c0-.09 0-.109.113-.109h4.219c.305.012.61.043.91.102a5.426 5.426 0 011.758.652c.363.21.695.469.992.762.223.234.422.484.602.75.175.27.324.558.437.86.016.077.09.132.168.12h1.008c.129 0 .129 0 .137.121v.922c0 .09-.036.113-.125.113h-.778c-.078 0-.101 0-.093.102.03.344.03.688 0 1.031 0 .094 0 .106.105.106h.89c.04.05 0 .101 0 .152.005.066.005.133 0 .195v.684c0 .094-.03.121-.113.121h-1.062a.144.144 0 00-.164.11 4.513 4.513 0 01-1.184 1.718 6.04 6.04 0 01-.601.485c-.223.128-.442.265-.672.37a6.112 6.112 0 01-1.328.423A6.754 6.754 0 018.617 14H4.711v-.004zm0 0"
              ></path>
            </svg>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="ValueCounter__value">
        {' '}
        {show_value} {text !== '' ? <span>{text}</span> : <></>}
      </div>
    </div>
  )
}
ValueCounter.propTypes = {
  currency: PropTypes.string,
  value: PropTypes.number,
}
export default ValueCounter

// {currency=="dai" ?? <linearGradient x1="109.444%" y1="100%" x2="0%" y2="0%" id="prefix__a">
// 	<stop stopColor="#EB663B" offset="0%" />
// 	<stop stopColor="#F9B326" offset="100%" />
// </linearGradient>}

// <svg width="18px" height="20px" viewBox="0 0 18 20" imageRendering="optimizeQuality"
// shapeRendering="geometricPrecision"
// textRendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg" x="0" y="0">
// 	<defs>
// 		<linearGradient x1="109.444%" y1="100%" x2="0%" y2="0%" id="prefix__a">
// 			<stop stopColor="#EB663B" offset="0%" />
// 			<stop stopColor="#F9B326" offset="100%" />
// 		</linearGradient>
// 	</defs>
// 	<g transform="translate(-1)" stroke={`url(${window.location.protocol+'//'+window.location.host+window.location.pathname}#prefix__a)`} fill="none" fillRule="evenodd">
// 		<path d="M18.5 5.246v9.462a2.01 2.01 0 01-1.21 1.842l-5.624 2.41-.886.38a1.984 1.984 0 01-1.56 0l-1.274-.546L2.71 16.55a2.01 2.01 0 01-1.21-1.842V5.246A2.01 2.01 0 012.721 3.4l.218-.091L9.23.656a1.973 1.973 0 011.538 0l3.974 1.674L17.279 3.4A2.01 2.01 0 0118.5 5.246z" />
// 		<path d="M15.958 5.47a1.472 1.472 0 00-.62-.518l-1.86-.817-2.914-1.28a1.4 1.4 0 00-1.128 0L4.822 4.881l-.16.07a1.472 1.472 0 00-.62.517 1.582 1.582 0 00-.275.896V13.6c0 .327.099.638.273.892.153.224.363.405.614.517l3.84 1.716.934.417a1.4 1.4 0 001.144 0l.65-.29 4.124-1.843c.251-.112.461-.293.614-.517.174-.254.273-.565.273-.892V6.365c0-.329-.1-.64-.275-.896z" />
// 		<path d="M6.033 10c0-2.16 1.776-3.912 3.967-3.912 2.19 0 3.967 1.752 3.967 3.912S12.19 13.912 10 13.912c-2.19 0-3.967-1.752-3.967-3.912z" />
// 	</g>
// </svg> : <></>}
// {( currency == "dai") ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" className="Dai__icon__svg">
// 		<defs>
// 				<linearGradient
// 						id="a"
// 						x1=".042%"
// 						x2="100.086%"
// 						y1="50.025%"
// 						y2="50.025%"
// 				>
// 						<stop offset="0%" stopColor="#F5AC37"></stop>
// 						<stop offset="23.36%" stopColor="#F0A038"></stop>
// 						<stop offset="64.98%" stopColor="#E2823B"></stop>
// 						<stop offset="100%" stopColor="#D5633E"></stop>
// 				</linearGradient>
// 		</defs>
// 		<path
// 				fill={`url(${window.location.protocol+'//'+window.location.host+window.location.pathname}#a)`}
// 				d="M14.465 8.63c.11 0 .161 0 .17-.147.042-.53.042-1.066 0-1.597 0-.101-.05-.148-.161-.148H4.084c-.129 0-.16.042-.16.162v1.528c0 .198 0 .198.207.198h10.334v.005zm-.411-3.678a.179.179 0 000-.12c-.088-.189-.19-.369-.31-.54a4.247 4.247 0 00-.636-.798 2.107 2.107 0 00-.397-.388A6.179 6.179 0 0010.135 1.8a6.47 6.47 0 00-1.458-.152h-4.61c-.13 0-.149.05-.149.161v3.046c0 .13 0 .162.162.162h9.91s.087-.019.1-.07h-.036v.005zm0 5.465a2.32 2.32 0 00-.439 0H4.094c-.13 0-.17 0-.17.17v2.982c0 .139 0 .171.17.171h4.394c.212.014.42 0 .627-.042a6.648 6.648 0 001.865-.41c.217-.074.43-.176.628-.291h.06a5.59 5.59 0 002.395-2.41c-.005-.009.055-.138-.01-.17zM2.197 15.282v-4.745c0-.11 0-.13-.139-.13H.194c-.102 0-.148 0-.148-.138V8.64H2.04c.11 0 .152 0 .152-.148V6.877c0-.102 0-.13-.138-.13H.189c-.101 0-.147 0-.147-.138V5.1c0-.092 0-.12.138-.12h1.846c.13 0 .162 0 .162-.162V.19c0-.138 0-.17.17-.17h6.439c.466.018.932.069 1.39.152a8.353 8.353 0 012.685.997c.55.323 1.057.715 1.51 1.167.341.351.646.734.918 1.14.272.411.494.854.67 1.316.022.12.138.203.258.18h1.537c.198 0 .198 0 .207.189v1.408c0 .138-.05.17-.189.17h-1.186c-.12 0-.152 0-.148.153a8.91 8.91 0 010 1.569c0 .148 0 .162.162.162h1.357c.06.078 0 .152 0 .23.009.102.009.199 0 .3V10.2c0 .148-.042.19-.171.19h-1.625a.214.214 0 00-.249.16 6.855 6.855 0 01-1.805 2.627c-.29.263-.6.508-.918.738-.342.199-.678.402-1.03.568-.65.29-1.328.508-2.025.642-.665.12-1.334.17-2.008.161H2.192l.005-.004z"
// 		></path>
// </svg>
