import '../../../.storybook/config.js'

import React from 'react'
import HexButton from './HexButton'

export default {
  title: 'HexButton',
  component: HexButton,
}

export const Button = () => (
  <HexButton text="Buy OVR" url="#" onClick={console.log('click')}></HexButton>
)

export const ButtonOutline = () => (
  <HexButton
    className="--outline"
    text="Buy OVR"
    url="#"
    onClick={console.log('click')}
  ></HexButton>
)
export const ButtonHollow = () => (
  <HexButton
    className="--hollow"
    text="Buy OVR"
    url="#"
    onClick={console.log('click')}
  ></HexButton>
)
export const ButtonRegular = () => (
  <HexButton
    className="--regular"
    text="Buy OVR"
    url="#"
    onClick={console.log('click')}
  ></HexButton>
)
