import '../../../.storybook/config.js'

import React from 'react'
import HexImage from './HexImage'

export default {
  title: 'HexImage',
  component: HexImage,
}

export const Image = () => (
  <HexImage
    style={{ width: '6rem', height: '6rem' }}
    src="https://cdn.pixabay.com/photo/2020/04/13/11/49/forest-5038025_960_720.jpg"
  ></HexImage>
)
export const ImageNoSrc = () => (
  <HexImage style={{ width: '6rem', height: '6rem' }} src=""></HexImage>
)
