import '../../../.storybook/config.js';

import React from 'react';
import Icon from './Icon';

export default {
	title: 'Icon',
	component: Icon,
};

export const Text = () => <Icon alt="Transaction History" src="./assets/icons/logo.svg"></Icon>;
