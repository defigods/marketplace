import '../../../.storybook/config.js';

import React from 'react';
import TextField from './TextField';

export default {
	title: 'TextField',
	component: TextField,
};

export const Textfield = () => <TextField label="Your input text field" />;
