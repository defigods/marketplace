import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const HexButton = ({ className, onClick, url, text, target }) => {
	if (target) {
		return (
			<a href={url} target={target} className={`HexButton ${className}`} onClick={onClick}>
				{text}
			</a>
		);
	} else {
		return (
			<Link to={url} target={target} className={`HexButton ${className}`} onClick={onClick}>
				{text}
			</Link>
		);
	}
};
HexButton.propTypes = {
	className: PropTypes.string,
	target: PropTypes.string,
	onClick: PropTypes.func,
	url: PropTypes.string,
	text: PropTypes.string,
};
export default HexButton;
