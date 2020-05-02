import '../../../.storybook/config.js';

import React from 'react';
import LandName from './LandName';

export default {
	title: 'LandName',
	component: LandName,
};

export const WithoutValue = () => (
	<LandName
		name={{ sentence: 'director.connect.overflow', hex: '8cbcc350c0ab5ff' }}
		location="Venice, Italy"
	></LandName>
);
export const WithValue = () => (
	<LandName
		name={{ sentence: 'director.connect.overflow', hex: '8cbcc350c0ab5ff' }}
		location="Venice, Italy"
		value="120"
	></LandName>
);
