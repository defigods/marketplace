import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const HexButton = ({
  className,
  onClick,
  url,
  text,
  target,
  ariaControls,
  ariaHaspopup,
  hexRef,
}) => {
  if (target) {
    return (
      <a
        href={url}
        target={target}
        className={`HexButton ${className}`}
        onClick={onClick}
      >
        {text}
      </a>
    )
  } else {
    return (
      <Link
        to={url}
        ref={hexRef}
        target={target}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        className={`HexButton ${className}`}
        onClick={onClick}
        autoFocus
      >
        {text}
      </Link>
    )
  }
}
HexButton.propTypes = {
  hexRef: PropTypes.object,
  ariaControls: PropTypes.string,
  ariaHaspopup: PropTypes.string,
  className: PropTypes.string,
  target: PropTypes.string,
  onClick: PropTypes.func,
  url: PropTypes.string,
  text: PropTypes.string,
}
export default HexButton
