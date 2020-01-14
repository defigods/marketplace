import '../../../.storybook/config.js';

import React from 'react';
import { action } from '@storybook/addon-actions';
import CtaCard from './CtaCard';

export default {
  title: 'CtaCard',
  component: CtaCard,
};

export const Text = () => <CtaCard onClick={action('clicked')}>Hello CtaCard</CtaCard>;

export const Emoji = () => (
  <CtaCard onClick={action('clicked')}>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </CtaCard>
);
