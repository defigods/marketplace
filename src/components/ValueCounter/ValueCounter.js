import React from 'react'
import * as R from 'ramda'
import PropTypes from 'prop-types'

import CircularProgress from '@material-ui/core/CircularProgress'

function format(num) {
  return ('' + num).replace(
    /(\d)(?=(?:\d{3})+(?:\.|$))|(\.\d\d?)\d*$/g,
    function (m, s1, s2) {
      return s2 || s1 + ','
    }
  )
}

const CurrencyDaiLogo = () => (
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
)

const CurrencyOVRLogo = () => (
  <svg
    width="18px"
    height="20px"
    data-name="Livello 1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1024 1024"
  >
    <defs>
      <linearGradient
        id="a"
        data-name="Sfumatura senza nome 92"
        x1="36.971"
        y1="145.626"
        x2="878.232"
        y2="792.362"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".001" stopColor="#f9b215" />
        <stop offset="1" stopColor="#de5f60" />
      </linearGradient>
      <linearGradient
        id="b"
        x1="36.839"
        y1="145.798"
        x2="878.101"
        y2="792.533"
        xlinkHref="#a"
      />
      <linearGradient
        id="c"
        x1="36.398"
        y1="146.372"
        x2="877.659"
        y2="793.107"
        xlinkHref="#a"
      />
    </defs>
    <path
      d="M512 1024a123.246 123.246 0 01-48.546-9.905L124.388 869.7a123.924 123.924 0 01-75.359-114V265.928a123.92 123.92 0 0176.036-114.284L464.13 9.62a123.906 123.906 0 0195.74.001l339.067 142.023a123.917 123.917 0 0176.034 114.284V755.7a123.92 123.92 0 01-75.359 114L560.55 1014.094a123.256 123.256 0 01-48.55 9.906zm0-983.506a82.972 82.972 0 00-32.225 6.477L140.709 188.994a83.424 83.424 0 00-51.185 76.934V755.7a83.427 83.427 0 0050.73 76.742l339.065 144.395a83.422 83.422 0 0065.364 0l339.063-144.395a83.425 83.425 0 0050.73-76.743V265.928a82.919 82.919 0 00-15.757-48.784v-.001a83.345 83.345 0 00-35.426-28.148L544.225 46.97A82.968 82.968 0 00512 40.494z"
      fill="url(#a)"
    />
    <path
      d="M512 910.95a91.983 91.983 0 01-37.941-8.162L226.586 791.59a96.761 96.761 0 01-40.294-34.03 102.566 102.566 0 01-17.668-57.884V322.498a102.53 102.53 0 0117.82-58.11 96.682 96.682 0 0140.67-34.038l247.472-109.373a92.26 92.26 0 0174.828 0L796.887 230.35a96.695 96.695 0 0140.667 34.038v-.001a102.523 102.523 0 0117.822 58.111v377.178a102.561 102.561 0 01-17.668 57.884 96.755 96.755 0 01-40.295 34.03L549.941 902.788A91.99 91.99 0 01512 910.95zm0-757.405a51.747 51.747 0 00-21.045 4.47L243.483 267.388a56.227 56.227 0 00-23.603 19.845 62.2 62.2 0 00-10.761 35.265v377.178a62.225 62.225 0 0010.67 35.13 56.292 56.292 0 0023.395 19.847L490.656 865.85a51.779 51.779 0 0042.689 0l247.471-111.198a56.292 56.292 0 0023.396-19.847 62.221 62.221 0 0010.67-35.13V322.498a62.192 62.192 0 00-10.762-35.264v-.001a56.233 56.233 0 00-23.603-19.845L533.045 158.015a51.752 51.752 0 00-21.045-4.47z"
      fill="url(#b)"
    />
    <path
      d="M512 740.97a228.972 228.972 0 11161.907-67.064A227.47 227.47 0 01512 740.971zm0-417.447c-103.926 0-188.477 84.55-188.477 188.477S408.073 700.477 512 700.477 700.477 615.927 700.477 512 615.927 323.523 512 323.523z"
      fill="url(#c)"
    />
  </svg>
)

const ValueCounter = ({
  currency = 'ovr',
  value = 0,
  text = '',
  color = 'orange',
}) => {
  let show_value = value
  if (parseFloat(value) > 1000) {
    show_value = format(value)
  }

  return (
    <div className={`ValueCounter --${color} `}>
      <div className="ValueCounter__icon">
        <div className="Icon">
          {currency == 'ovr' ? <CurrencyOVRLogo /> : <CurrencyDaiLogo />}
        </div>
      </div>
      <div className="ValueCounter__value">
        {show_value !== null ? (
          <>
            {show_value} {!R.isEmpty(text) ? <span>{text}</span> : null}
          </>
        ) : (
          <CircularProgress size={20} style={{ top: 10, marginLeft: 10 }} />
        )}
      </div>
    </div>
  )
}

ValueCounter.propTypes = {
  currency: PropTypes.string,
  value: PropTypes.number,
  color: PropTypes.string,
  text: PropTypes.string,
}

export default ValueCounter
