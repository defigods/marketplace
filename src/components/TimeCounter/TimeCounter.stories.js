import '../../../.storybook/config.js';

import React from 'react';
import TimeCounter from './TimeCounter';

export default {
    title: 'TimeCounter',
    component: TimeCounter,
};

export const Text = () => <TimeCounter time="15" signature="mins"></TimeCounter>;
