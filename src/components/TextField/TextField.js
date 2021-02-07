import React from 'react'
import PropTypes from 'prop-types'

import MaterialTextField from '@material-ui/core/TextField'

const TextField = ({ id, label }) => {
  return (
    <MaterialTextField className="textfield" fullWidth id={id} label={label} />
  )
}
TextField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
}
export default TextField
