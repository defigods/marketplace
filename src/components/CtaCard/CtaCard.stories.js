import '../../../.storybook/config.js';

import React from 'react';
import { action } from '@storybook/addon-actions';
import CtaCard from './CtaCard';

export default {
  title: 'CtaCard',
  component: CtaCard,
};

export const Text = () => <CtaCard onClick={action('clicked')} 
                            value="300" 
                            label="OVR" 
                            button_text="Buy OVR" 
                            button_url="/" 
                            arrow_link_text="Transaction History" 
                            arrow_link_url="">My Account Balance</CtaCard>;

// export const Emoji = () => (
//   <CtaCard onClick={action('clicked')}>
//     <span role="img" aria-label="so cool">
//       😀 😎 👍 💯
//     </span>
//   </CtaCard>
// );
