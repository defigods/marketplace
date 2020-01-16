import '../../../.storybook/config.js';

import React from 'react';
import ArrowLink from './ArrowLink';

export default {
    title: 'ArrowLink',
    component: ArrowLink,
};

export const Text = () => <ArrowLink text="Transaction History" url="#"></ArrowLink>;
