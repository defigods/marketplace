import React, { useContext, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { NavigateNext, NavigateBefore } from '@material-ui/icons';
import { grey } from '@material-ui/core/colors';

import { MapContext } from '../../context/MapContext';
import { UserContext } from '../../context/UserContext';

class CircularList {
	constructor(array, index) {
		this.data = array || [];
		this.index = index || 0;
	}

	getCurrent() {
		return this.data[((this.index % this.data.length) + this.data.length) % this.data.length];
	}

	getNext() {
		const nextIndex = (((this.index + 1) % this.data.length) + this.data.length) % this.data.length;
		return this.data[nextIndex];
	}
	getPrevious() {
		const prevIndex = (((this.index - 1) % this.data.length) + this.data.length) % this.data.length;
		return this.data[prevIndex];
	}
	moveToNext() {
		const nextIndex = (((this.index + 1) % this.data.length) + this.data.length) % this.data.length;
		this.index = nextIndex;
	}
	moveToPrevious() {
		const prevIndex = (((this.index - 1) % this.data.length) + this.data.length) % this.data.length;
		this.index = prevIndex;
	}
}

const MapNavigationBox = () => {
	const { state } = useContext(MapContext);
	console.log('MapContext state', state);
	const { auctionList } = state;

	const items = new CircularList(
		auctionList.map((item) => item.land),
		0,
	);

	const [current, setCurrent] = useState(items.getCurrent());
	const [previous, setPrevious] = useState(items.getPrevious());
	const [next, setNext] = useState(items.getNext());
	const [index, setIndex] = useState(0);

	useEffect(() => {
		items.index = index;
		setCurrent(items.getCurrent());
		setPrevious(items.getPrevious());
		setNext(items.getNext());
	});

	const currentCity = current && current.address.city ? `${current.address.city}, ` : '';

	return (
		auctionList.length > 0 && (
			<div className="map-navigation-box">
				{previous && (
					<Link
						to={`/map/land/${previous.uuid}`}
						onClick={() => {
							setIndex(index - 1);
						}}
					>
						<NavigateBefore fontSize="large" style={{ color: grey[800] }} />
					</Link>
				)}
				{current && (
					<div className="map-navigation-box--current">
						<div className="map-navigation-box--current--name">{current.sentenceId}</div>
						<div className="map-navigation-box--current--location">
							{currentCity}
							{current.address.country}
						</div>
					</div>
				)}
				{next && (
					<Link
						to={`/map/land/${next.uuid}`}
						onClick={() => {
							setIndex(index + 1);
						}}
					>
						<NavigateNext fontSize="large" style={{ color: grey[800] }} />
					</Link>
				)}
			</div>
		)
	);
};

export default MapNavigationBox;
