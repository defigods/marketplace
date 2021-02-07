import '../../../.storybook/config.js'

import React from 'react'
import { action } from '@storybook/addon-actions'
import CtaCard from './CtaCard'

export default {
  title: 'CtaCard',
  component: CtaCard,
}

export const Text = () => (
  <CtaCard
    onClick={action('clicked')}
    counter={{ value: '300', label: 'OVR' }}
    icon={{ url: './assets/icons/icon_deal.png', isSvg: false }}
    button={{ text: 'Buy OVR', url: '/' }}
    arrow_link={{ text: 'Transaction History', url: '/' }}
  >
    My Account Balance
  </CtaCard>
)
