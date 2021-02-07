import '../../../.storybook/config.js'

import React from 'react'
import CheckBox from './CheckBox'

export default {
  title: 'CheckBox',
  component: CheckBox,
}

export const Checkbox = () => (
  <CheckBox
    label="ERC721 using OVR"
    name="ERC721"
    text="Authorize the Marketplace to operate OVR on my behalf"
  />
)
