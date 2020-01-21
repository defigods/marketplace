import '../../../.storybook/config.js';

import React from 'react';
import { action } from '@storybook/addon-actions';
import Map from './Map';

export default {
  title: 'Map',
  component: Map,
};

export const Standard = () => <Map></Map>;
