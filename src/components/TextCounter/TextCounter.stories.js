import '../../../.storybook/config.js';

import React from 'react';
import TextCounter from './TextCounter';

export default {
    title: 'TextCounter',
    component: TextCounter,
};

export const Text = () => <TextCounter value="150" label="OVR"></TextCounter>;
