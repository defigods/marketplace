import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { NewMapContext } from 'context/NewMapContext'

const ChangeHex = (props) => {
  const { t, i18n } = useTranslation()
  const { mapState, setMapState, actions } = useContext(NewMapContext)
  const { changeHexId } = actions

  const [hex, setHex] = useState('')

  const updateHex = (e) => {
    setHex(e.target.value)
  }

  const changeHex = (e) => {
    e.preventDefault()
    changeHexId(hex)
  }

  return (
    <form onSubmit={changeHex}>
      <input type="text" name="hex" value={hex} onChange={updateHex} />
      <button>{t('Generic.submit.label')}</button>
    </form>
  )
}

export default ChangeHex
