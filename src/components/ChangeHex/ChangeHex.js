import React, { useState, useContext } from 'react'
import { withMapContext } from '../../context/MapContext'
import { useTranslation } from 'react-i18next'

const ChangeHex = (props) => {
  const { t, i18n } = useTranslation()

  const [hex, setHex] = useState('')

  const updateHex = (e) => {
    setHex(e.target.value)
  }

  const changeHex = (e) => {
    e.preventDefault()
    props.mapProvider.actions.changeHexId(hex)
  }

  return (
    <form onSubmit={changeHex}>
      <input type="text" name="hex" value={hex} onChange={updateHex} />
      <button>{t('Generic.submit.label')}</button>
    </form>
  )
}

export default withMapContext(ChangeHex)
