import React, { Component } from 'react'
import { Link } from 'react-router-dom'

const ArrowLink = ({
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
      <div className="ArrowLink">
        <a target={target} className="ArrowLink__text" href={url}>
          {text} <span>→</span>
        </a>
      </div>
    )
  } else {
    return (
      <Link
        to={url}
        ref={hexRef}
        target={target}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        className={`ArrowLink ${className}`}
        onClick={onClick}
        autoFocus
      >
        <a className="ArrowLink__text" href={url}>
          {text} <span>→</span>
        </a>
      </Link>
    )
  }
}
export default ArrowLink
