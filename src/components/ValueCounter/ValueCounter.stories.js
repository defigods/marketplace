import '../../../.storybook/config.js';

import React from 'react';
import ValueCounter from './ValueCounter';

export default {
	title: 'ValueCounter',
	component: ValueCounter,
};

export const Text = () => <ValueCounter value="150"></ValueCounter>;
