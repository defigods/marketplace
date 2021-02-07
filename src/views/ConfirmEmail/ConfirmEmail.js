import React, { useEffect, useContext, useState } from 'react'
import { withUserContext } from 'context/UserContext'
import { UserContext } from 'context/UserContext'

import * as moment from 'moment'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelIcon from '@material-ui/icons/Cancel'
import HexButton from 'components/HexButton/HexButton'
import { useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import config from 'lib/config'
import { Trans, useTranslation } from 'react-i18next'
import { confirmUserEmail, requestConfirmUserEmail } from 'lib/api'

/**
 * Confirm Email component
 */
const ConfirmEmail = () => {
  const { t, i18n } = useTranslation()

  const [respStatus, setRespStatus] = useState(0)
  const [errorCopy, setErrorCopy] = useState('')
  const [errorTraceback, setErrorTraceback] = useState(0)
  const [token] = useState(window.location.search.split('token=')[1])

  const userContext = useContext(UserContext)

  let history = useHistory()

  const checkTokenAndConfirmEmail = async () => {
    confirmUserEmail(token).then((response) => {
      if (response.data.result === false) {
        setRespStatus(2)
        setErrorCopy(response.data.errors[0].message)
      } else {
        setRespStatus(1)
        userContext.actions.setIsConfirmedEmail(true)
      }
    })
  }

  useEffect(() => {
    checkTokenAndConfirmEmail()
  }, [])

  function handleProfile() {
    history.push('profile')
  }

  function respContent() {
    if (respStatus == 0) {
      return (
        <div>
          <div className="o-centered-box">
            <div className="Signup__section">
              <CircularProgress />
            </div>
            <div className="Signup__section">
              <br></br>
            </div>
          </div>
        </div>
      )
    } else if (respStatus == 1) {
      return (
        <div>
          <div className="o-centered-box">
            <h2>{t('Generic.congrats.label')}</h2>
            <div className="Signup__section">
              <CheckCircleIcon className="CheckCircleIcon" />
            </div>
            <div className="Signup__section">{t('ConfirmEmail.success')}</div>
            <div className="Signup__section --small">
              {/* Account info are stored privately off the blockchain. <Link to="#">Read more</Link>. */}
            </div>
            <div className="Signup__section">
              <HexButton
                url="#"
                text={t('ConfirmEmail.back')}
                className="--purple"
                onClick={handleProfile}
              ></HexButton>
            </div>
          </div>
        </div>
      )
    } else if (respStatus == 2) {
      return (
        <div>
          <div className="o-centered-box">
            <h2>{t('ConfirmEmail.try.again')}</h2>
            <div className="Signup__section">
              <CancelIcon className="CancelIcon" />
            </div>
            <br></br>
            <div className="Signup__section">{errorCopy}</div>
            <div className="Signup__section">
              <HexButton
                url="#"
                text={t('ConfirmEmail.back')}
                className="--purple"
                onClick={handleProfile}
              ></HexButton>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="activity v-buy-tokens">
      <div className="o-container">
        <div className="p-header">
          <h2 className="p-header-title">{t('ConfirmEmail.title')}</h2>
          <span className="p-header-datetime">
            {moment().format('HH:mm, dddd, MMM D, YYYY')}
          </span>
        </div>
        {respContent()}
      </div>
    </div>
  )
}

export default withUserContext(ConfirmEmail)
