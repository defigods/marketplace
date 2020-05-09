import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { NavigateNext, NavigateBefore } from '@material-ui/icons';
import { grey } from '@material-ui/core/colors';

import { MapContext } from '../../context/MapContext';

const MapNavigationBox = () => {
	const { state, actions } = useContext(MapContext);
	const { landData } = state;
	console.log(state, actions);
	console.log({ landData, state });
	return (
		<div className="map-navigation-box">
			<Link to="/">
				<NavigateBefore fontSize="large" style={{ color: grey[800] }} />
			</Link>
			<div className="map-navigation-box--current">
				<div className="map-navigation-box--current--name">
					{(landData.name && landData.name.sentence) || 'land.sentence.id'}
				</div>
				<div className="map-navigation-box--current--location">{landData.location || '~ Unknown ~'}</div>
			</div>

			<Link to="/">
				<NavigateNext fontSize="large" style={{ color: grey[800] }} />
			</Link>
		</div>
	);
};

export default MapNavigationBox;
