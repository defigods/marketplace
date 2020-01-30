import '../../../.storybook/config.js';

import React from 'react';
import HexButton from './HexButton';

export default {
    title: 'HexButton',
    component: HexButton,
};

export const Text = () => <HexButton text="Buy OVR" url="#" onClick={console.log('click')} ></HexButton>;
