import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const HexButton = ({ className, onClick, url, text }) => {
	return (
		<Link to={url} className={`HexButton ${className}`} onClick={onClick}>
			{text}
		</Link>
	);
};
HexButton.propTypes = {
	className: PropTypes.string,
	onClick: PropTypes.func,
	url: PropTypes.string,
	text: PropTypes.string,
};
export default HexButton;
