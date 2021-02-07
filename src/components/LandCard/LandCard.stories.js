import '../../../.storybook/config.js'

import React from 'react'
import { action } from '@storybook/addon-actions'
import LandCard from './LandCard'

export default {
  title: 'LandCard',
  component: LandCard,
}

export const Standard = () => (
  <LandCard
    onClick={action('clicked')}
    url="/"
    value="300"
    background_image="url(assets/img/auction-map.png)"
    name={{ sentence: 'director.connect.overflow', hex: '8cbcc350c0ab5ff' }}
    location="Venice, Italy"
    icon={{ url: './assets/icons/icon_deal.png', isSvg: false }}
  ></LandCard>
)
