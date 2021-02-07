import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'

const CustomColorCheckbox = withStyles({
  root: {
    color: grey[600],
    '&$checked': {
      color: grey[600],
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />)
const CheckBox = ({ checked, label, text, name }) => {
  return (
    <div className="checkbox">
      <FormControlLabel
        className="checkbox-input"
        control={<CustomColorCheckbox name={name} />}
        checked={checked}
        label={label}
      />
      {text && <div className="checkbox-smalltext">{text}</div>}
    </div>
  )
}
CheckBox.propTypes = {
  checked: PropTypes.bool,
  label: PropTypes.string,
  text: PropTypes.string,
  name: PropTypes.string,
}
export default CheckBox
