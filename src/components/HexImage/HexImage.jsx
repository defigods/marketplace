import React from 'react'
import PropTypes from 'prop-types'

const HexImage = ({ className, src, style }) => (
  <svg
    className={className}
    height="102"
    width="102"
    viewBox="0 0 102 102"
    style={style}
  >
    <defs>
      <linearGradient id="linear-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a354b1" />
        <stop offset="100%" stopColor="#2fd7ff" />
      </linearGradient>
      <linearGradient id="linear-fill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a354b122" />
        <stop offset="100%" stopColor="#2fd7ff22" />
      </linearGradient>
      <pattern
        id="background-image"
        patternUnits="userSpaceOnUse"
        width="100"
        height="100"
      >
        <image
          xlinkHref={src}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMinYMin slice"
        />
      </pattern>
    </defs>
    <polyline
      points="51,1 101,26 101,76 51,101 1,76 1,26 51,1"
      style={{
        fill: src ? 'url(#background-image)' : 'url(#linear-fill)',
        stroke: 'url(#linear-stroke)',
        strokeWidth: '1',
      }}
    />
  </svg>
)

HexImage.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  src: PropTypes.string,
}

export default HexImage
