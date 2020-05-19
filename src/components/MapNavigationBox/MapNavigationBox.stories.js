import '../../../.storybook/config.js';

import React from 'react';
import MapNavigationBox from './MapNavigationBox';
import { MapContext } from '../../context/MapContext';
import { auctionListData } from './storybook.fakedata';

const state = {
	onSingleView: false,
	hex_id: '8c81326dda43dff',
	isAuction: false,
	isUserRelated: false,
	activeBidOverlay: false,
	activeMintOverlay: false,
	activeSellOverlay: false,
	activeBuyOfferOverlay: false,
	auctionList: auctionListData,
	landData: {},
};

export default {
	title: 'MapNavigationBox',
	// decorators: [(storyFn) => <MapContext.Provider value={{ state }}>{storyFn()}</MapContext.Provider>],
	component: MapNavigationBox,
};

export const MapnavigationBox = () => (
	<MapContext.Provider value={{ state }}>
		<MapNavigationBox />
	</MapContext.Provider>
);

export const oneItem = () => (
	<MapContext.Provider value={{ state: { ...state, auctionList: [auctionListData[0]] } }}>
		<MapNavigationBox />
	</MapContext.Provider>
);
