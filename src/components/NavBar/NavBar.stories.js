import '../../../.storybook/config.js';

import React from 'react';
import NavBar from './NavBar';

export default {
	title: 'NavBar',
	component: NavBar,
};

export const Text = () => <NavBar></NavBar>;
