import '../../../.storybook/config.js';

import React from 'react';
import MapNavigationBox from './MapNavigationBox';
import { MapProvider } from '../../context/MapContext';

export default {
	title: 'MapNavigationBox',
	decorators: [(storyFn) => <MapProvider>{storyFn()}</MapProvider>],
	component: MapNavigationBox,
};

export const MapnavigationBox = () => <MapNavigationBox />;
