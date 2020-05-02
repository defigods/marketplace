import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const HexButton = ({ className, onClick, url, text }) => {
	return (
		<Link to={url} className={`HexButton ${className}`} onClick={onClick}>
			<div className="HexButton__cont">
				<div className="HexButton__svg">
					<svg xmlns="http://www.w3.org/2000/svg" width="100" height="35" viewBox="0 0 102 37">
						<defs>
							<path
								id="a"
								d="M8.395 0c-.76 0-1.481.281-2.072.774A4.019 4.019 0 005.29 2.126c-.06.125-.113.255-.162.388L3.5 7.006l-.264.73-2.962 8.181A4.666 4.666 0 000 17.5c0 .538.092 1.077.275 1.583l4.691 12.955.162.448c.04.112.086.221.134.328l.054.113c.02.039.039.078.06.116.161.307.356.584.577.827.116.128.24.247.37.356.591.493 1.312.774 2.072.774h83.129c.757 0 1.473-.279 2.064-.767a4.042 4.042 0 001.194-1.725l3.97-10.78.965-2.623A4.655 4.655 0 00100 17.5a4.727 4.727 0 00-.283-1.605l-.14-.377-.532-1.448-4.263-11.578A4.04 4.04 0 0093.588.767 3.228 3.228 0 0091.524 0H8.395z"
							></path>
							<linearGradient id="b" x1="109.444%" x2="0%" y1="100%" y2="0%">
								<stop className="first-stop" offset="0%" stopColor="#EB663B"></stop>
								<stop className="last-stop" offset="100%" stopColor="#F9B326"></stop>
							</linearGradient>
						</defs>
						<g
							fill="none"
							fillRule="evenodd"
							stroke="none"
							strokeWidth="1"
							transform="translate(-40 -107) translate(40 107)"
						>
							<mask id="c" fill="#fff">
								<use xlinkHref="#a"></use>
							</mask>
							<path
								fill={`url(${window.location}#b)`}
								d="M8.395 0c-.76 0-1.481.281-2.072.774A4.019 4.019 0 005.29 2.126c-.06.125-.113.255-.162.388L3.5 7.006l-.264.73-2.962 8.181A4.666 4.666 0 000 17.5c0 .538.092 1.077.275 1.583l4.691 12.955.162.448c.04.112.086.221.134.328l.054.113c.02.039.039.078.06.116.161.307.356.584.577.827.116.128.24.247.37.356.591.493 1.312.774 2.072.774h83.129c.757 0 1.473-.279 2.064-.767a4.042 4.042 0 001.194-1.725l3.97-10.78.965-2.623A4.655 4.655 0 00100 17.5a4.727 4.727 0 00-.283-1.605l-.14-.377-.532-1.448-4.263-11.578A4.04 4.04 0 0093.588.767 3.228 3.228 0 0091.524 0H8.395z"
								mask={`url(${window.location}#c)`}
							></path>
							<text fontSize="0.6rem" x="50%" y="50%" fill="#fff" dominantBaseline="middle" textAnchor="middle">
								{text}
							</text>
						</g>
					</svg>
				</div>
				{/* <div className="HexButton__text"> {text} </div> */}
			</div>
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
