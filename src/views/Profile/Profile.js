/* eslint-disable react/no-unescaped-entities */
import React, { useContext, useEffect, useState } from 'react'
import * as moment from 'moment'

import TextField from '@material-ui/core/TextField'
import { UserContext } from 'context/UserContext'
// import HexImage from 'components/HexImage/HexImage';
import HexButton from 'components/HexButton/HexButton'
import config, { isEmpty } from 'lib/config'
// import {isiOS, isImToken} from 'lib/config';
// import CheckBox from 'components/CheckBox/CheckBox';
// import EmailConfirmation from 'components/EmailConfirmation/EmailConfirmation';
// import IdensicComp from 'components/IdensicComp/IdensicComp';
import {
  getSumsubData,
  setSumsubVerificationToStarted,
  setDbUserEmail,
  updateDbUserProfile,
  getSumsubExternalLink,
  requestConfirmUserEmail,
} from 'lib/api'
import { successNotification, warningNotification } from 'lib/notifications'

import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import Blockies from 'react-blockies'

import ValueCounter from 'components/ValueCounter/ValueCounter'
import { Web3Context } from 'context/Web3Context'

import snsWebSdk from '@sumsub/websdk'
import { useTranslation, Translation } from 'react-i18next'

import Tooltip from '@material-ui/core/Tooltip'
import Help from '@material-ui/icons/Help'

import CircularProgress from '@material-ui/core/CircularProgress'
import i18n from 'i18next'
import { getCurrentLocale } from 'i18n'

import ReactGA from 'react-ga'
let isMobile = window.innerWidth < 860

const ProfileContentLoginRequired = () => {
  const { t, i18n } = useTranslation()
  return (
    <div className="profile">
      <div className="o-container">
        <div className="c-dialog --centered">
          <div className="c-dialog-main-title">
            {t('Profile.login.required')}
            <span role="img" aria-label="Cool dude">
              😎
            </span>
          </div>
          <div className="c-dialog-sub-title">{t('Profile.check.profile')}</div>
        </div>
      </div>
    </div>
  )
}

const ProfileLayout = () => {
  const { t, i18n } = useTranslation()
  const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY')
  const userContext = useContext(UserContext)
  const web3Context = useContext(Web3Context)
  let user = userContext.state.user
  const [balance, setBalance] = React.useState(user.balance)
  const [allowance, setAllowance] = React.useState(user.allowance)
  const [address, setAddress] = React.useState(user.publicAddress)
  const { refreshBalanceAndAllowance } = userContext.actions
  const { authorizeOvrExpense } = web3Context.actions
  const {
    MerkleDistributorSigner,
    MerkleDistributorViewer,
    address: userAddress,
  } = web3Context.state

  const [sumsubShowPanel, setSumsubShowPanel] = useState(false)
  const [userEmailValid, setUserEmailValid] = useState(false)
  const [userFullNameValid, setUserFullNameValid] = useState(false)
  const [userEmailInputError, setUserEmailInputError] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  // const [userFirstName, setUserFirstName] = useState('');
  // const [userLastName, setUserLastName] = useState('');
  const [userCountry, setUserCountry] = useState('')
  const [isConfirmedEmail, setIsConfirmedEmail] = useState(false)
  const [isProfileCompleted, setIsProfileCompleted] = useState('')

  const [urlKyc, setUrlKyc] = useState('#')
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  const [isNamesLoading, setIsNamesLoading] = useState(false)
  const [isIMWallet, setIsIMWallet] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const [isClaimed, setClaimed] = useState(true)
  const [claimInfo, setClaimInfo] = useState(null)

  const launchWebSdk = (
    apiUrl,
    flowName,
    accessToken,
    applicantEmail,
    applicantPhone,
    publicAddress,
    t
  ) => {
    let sumsubLang = 'en'
    if (getCurrentLocale().includes('zh')) {
      sumsubLang = 'zh'
    }
    if (publicAddress) {
      let snsWebSdkInstance = snsWebSdk
        .Builder(apiUrl, flowName)
        .withAccessToken(accessToken, (newAccessTokenCallback) => {
          // Access token expired
          // get a new one and pass it to the callback to re-initiate the WebSDK
          let newAccessToken = '...' // get a new token from your backend
          newAccessTokenCallback(newAccessToken)
        })
        .withConf({
          lang: sumsubLang,
          email: applicantEmail,
          phone: applicantPhone,
          metadata: [{ key: 'walletAddress', value: publicAddress }],
          onMessage: (type, payload) => {
            console.log('WebSDK onMessage', type, payload)
          },
          customCss: 'url',
          onError: (error) => {
            console.error('WebSDK onError', error)
          },
        })
        .build()
      snsWebSdkInstance.launch('#sumsub-websdk-container')
    } else {
      warningNotification(
        t('Warning.metamask.not.detected.title'),
        t('Warning.metamask.not.detected.desc')
      )
    }
  }

  React.useEffect(() => {
    if (user != undefined && user.balance != undefined) {
      setBalance(user.balance.toFixed(2))
    }
  }, [user.balance])

  React.useEffect(() => {
    if (
      user != undefined &&
      user.allowance != undefined &&
      user.allowance != false
    ) {
      console.log('user.allowance', user.allowance)
      setAllowance(user.allowance.toFixed(2))
    }
  }, [user.allowance])

  React.useEffect(() => {
    setAddress(user.publicAddress)
    setUserCountry(user.country)
    setIsConfirmedEmail(user.isConfirmedEmail)
    setUserEmail(user.email)
    setIsProfileCompleted(user.isProfileCompleted)
    console.log('user.isConfirmedEmail in profile', user.isConfirmedEmail)
    console.log('reacteffect in profile', user.email)
    console.log('reacteffect in profile - isConfirmedEmail', isConfirmedEmail)
  }, [
    user.publicAddress,
    user.firstName,
    user.email,
    user.lastName,
    user.country,
    user.isConfirmedEmail,
    user.isProfileCompleted,
  ])

  React.useEffect(() => {
    setIsConfirmedEmail(user.isConfirmedEmail)
    console.log('user.isConfirmedEmail', user)
  }, [user.isConfirmedEmail])

  // Sumsub and ImWallet
  React.useEffect(() => {
    // IMWallet workaround
    if (isMobile == true) {
      if (window.ethereum) {
        setIsIMWallet(true)
        if (user.uuid != undefined) {
          let sumsubLang = 'en'
          if (getCurrentLocale().includes('zh')) {
            sumsubLang = 'zh'
          }
          getSumsubExternalLink(sumsubLang)
            .then((response) => {
              if (response.data.result === true) {
                setUrlKyc(response.data.url)
              }
            })
            .catch(() => {})
        }
      }
    }
    // Sumsub reload of webview
    if (sumsubShowPanel == true && user.uuid != undefined) {
      getSumsubData()
        .then((response) => {
          if (response.data.result === true) {
            launchWebSdk(
              config.apis.sumsubApi,
              'basic-kyc',
              response.data.content.token,
              user.email,
              null,
              user.publicAddress,
              t
            )
          }
        })
        .catch((error) => {})
      if (user.kycReviewAnswer == -1) {
        setSumsubVerificationToStarted()
          .then(() => {})
          .catch(() => {})
      }
    }
  }, [user, sumsubShowPanel, localStorage.getItem('i18nextLng')])

  // Cashback
  React.useEffect(() => {
    const checkIsClaimed = async (index) => {
      if (MerkleDistributorViewer) {
        const isClaimed = await MerkleDistributorViewer.isClaimed(index)
        setClaimed(isClaimed)
      }
    }

    console.log('userAddress', userAddress)

    if (!userAddress) {
      setClaimInfo(null)
    } else {
      const userClaimIndex = Object.keys(
        config.apis.merkleInfo.claims
      ).findIndex(
        (el) => el.toLocaleLowerCase() === userAddress.toLocaleLowerCase()
      )

      console.log('userClaimIndex', userClaimIndex)

      if (userClaimIndex >= 0) {
        const claimInfo =
          config.apis.merkleInfo.claims[
            Object.keys(config.apis.merkleInfo.claims)[userClaimIndex]
          ]
        setClaimInfo(claimInfo)
        checkIsClaimed(claimInfo.index)
      }
    }
  }, [userAddress, MerkleDistributorViewer])

  const toggleKycVerificationFrame = (e) => {
    e.preventDefault()
    if (user.email) {
      setSumsubShowPanel(!sumsubShowPanel)
      ReactGA.set({ page: window.location.pathname + '/kyc-started' })
      ReactGA.pageview(window.location.pathname + '/kyc-started')
    } else {
      warningNotification(
        t('Warning.email.not.detected.title'),
        t('Warning.email.not.detected.desc')
      )
    }
  }

  const toggleImWalletKycVerificationFrame = (e) => {
    if (user.email) {
    } else {
      e.preventDefault()
      warningNotification(
        t('Warning.email.not.detected.title'),
        t('Warning.email.not.detected.desc')
      )
    }
  }

  const requestConfirmEmail = async () => {
    requestConfirmUserEmail().then((response) => {
      successNotification(
        t('Generic.congrats.label'),
        t('Email.resend.verification.tile')
      )
    })
  }

  const updateUserEmail = (e) => {
    if (userEmail === '') {
      setUserEmailValid(false)
    } else {
      setUserEmailValid(true)
    }
    setUserEmail(e.target.value)
  }

  // const updateUserFirstName = (e) => {
  // 	if (isEmpty(userFirstName) || isEmpty(userLastName) || isEmpty(userCountry) || (userFirstName === user.firstName && userLastName === user.lastName)) {
  // 		setUserFullNameValid(false);
  // 	} else {
  // 		setUserFullNameValid(true);
  // 	}
  // 	setUserFirstName(e.target.value);
  // };

  // const updateUserLastName = (e) => {
  // 	if (isEmpty(userFirstName) || isEmpty(userLastName) || isEmpty(userCountry) || (userFirstName === user.firstName && userLastName === user.lastName)) {
  // 		setUserFullNameValid(false);
  // 	} else {
  // 		setUserFullNameValid(true);
  // 	}
  // 	setUserLastName(e.target.value);
  // };

  const updateUserCountry = (e) => {
    setUserCountry(e.target.value)
    if (isEmpty(e.target.value)) {
      setUserFullNameValid(false)
    } else {
      setUserFullNameValid(true)
    }
  }

  const handleAddProfileInfos = (e) => {
    setIsNamesLoading(true)
    updateDbUserProfile(userCountry)
      .then((response) => {
        if (response.data.result === true) {
          setIsNamesLoading(false)
          userContext.actions.setUserCountry(userCountry)
          // userContext.actions.setIsProfileCompleted(true);
          successNotification(
            t('Generic.congrats.label'),
            t('Signup.profile.saved.title')
          )
        }
      })
      .catch((error) => {})
  }

  const handleAddEmail = (e) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
      setIsSignupLoading(true)
      setUserEmailInputError(false)
      setDbUserEmail(userEmail)
        .then((response) => {
          if (response.data.result === true) {
            userContext.actions.setUserEmail(userEmail)
            successNotification(
              t('Generic.congrats.label'),
              t('Signup.email.saved.title')
            )
            ReactGA.set({ page: window.location.pathname + '/email-saved' })
            ReactGA.pageview(window.location.pathname + '/email-saved')
            window.gtag_report_email_inserted_conversion()
          } else {
            let error_message = response.data.errors[0].message
            setIsSignupLoading(false)
            setUserEmailValid(false)
            setUserEmailInputError(error_message)
          }
        })
        .catch((error) => {})
    } else {
      setUserEmailInputError(t('Signup.email.not.valid'))
      setUserEmailValid(false)
    }
  }

  const handleClaimCashback = async (e) => {
    if (!claimInfo || isClaimed) {
      warningNotification(
        t('Profile.cashback.error.title'),
        t('Profile.cashback.error.desc')
      )
      return
    }

    try {
      await MerkleDistributorSigner.claim(
        claimInfo.index,
        userAddress,
        claimInfo.amount,
        claimInfo.proof
      )
      successNotification(
        t('Success.action.title'),
        t('Success.request.process.desc')
      )
    } catch (error) {
      console.log(error)
    }
  }

  const renderBadge = (status, t) => {
    let badge = <div>&nbsp;</div>
    switch (status) {
      case -1:
        badge = (
          <div className="c-status-badge  --open">
            {t('Profile.not.started')}
          </div>
        )
        break
      case -10:
        badge = (
          <div className="c-status-badge  --open">{t('Profile.started')}</div>
        )
        break
      case 1:
        badge = (
          <div className="c-status-badge  --open">{t('Profile.completed')}</div>
        )
        break
      case 0:
        badge = (
          <div className="c-status-badge  --open">{t('Profile.failed')}</div>
        )
        break
      default:
        badge = <div>&nbsp;</div>
    }
    return badge
  }

  return (
    <div className="profile">
      <div className="o-container">
        <div className="p-header">
          <h2 className="p-header-title">{t('Profile.my.profile')}</h2>
          <span className="p-header-datetime">{currentDatetimeStamp}</span>
        </div>
        <div className="p-body">
          <div className="o-fourth">
            {/* <HexImage className="profile-image" /> */}
            <Blockies
              seed={user.publicAddress || 'loading'}
              size={12}
              scale={13}
              color="#7521c8"
              bgColor="#EC663C"
              spotColor="#F9B426"
            />
          </div>
          <div className="profile-content">
            <div key="wallet" className="p-section">
              <h3 className="p-section-title">{t('Profile.wallet.info')}</h3>
              <div className="p-section-content">
                <h4 className="p-content-title">{t('Profile.wallet.addr')}</h4>
                <div className="p-wallet-address">{address}</div>
                <div className="p-balance">
                  <div className="p-small-title">{t('Profile.balance')}</div>
                  <div className="p-balance-value">
                    <ValueCounter value={balance} />
                    <div>
                      <HexButton
                        url="/public-sale"
                        className={'--orange '}
                        text={t('Profile.buy.ovr')}
                      ></HexButton>
                      {/* history.push('/profile');
											// TODO: KYC -  */}
                    </div>
                  </div>
                </div>
                <div className="p-balance">
                  <div className="p-small-title">
                    {t('Auctions.allowance')}
                    <Tooltip
                      title={
                        <React.Fragment>
                          {t('Aucitons.allowance.tooltip')}
                        </React.Fragment>
                      }
                      aria-label="info"
                      placement="bottom"
                    >
                      <Help className="Help" />
                    </Tooltip>
                  </div>
                  <div className="p-balance-value">
                    <ValueCounter value={allowance} />
                    <div>
                      <HexButton
                        url="#"
                        onClick={async (e) => {
                          e.preventDefault()
                          await authorizeOvrExpense('10000000')
                          setTimeout(() => {
                            refreshBalanceAndAllowance()
                          }, 20000)
                        }}
                        className={'--orange '}
                        text={t('Auctions.allowance.increment')}
                      ></HexButton>
                      {/* history.push('/profile');
											// TODO: KYC -  */}
                    </div>
                  </div>
                </div>
              </div>
              <div key="KYC" className="p-section --m-t">
                <h3 className="p-section-title">
                  {t('Profile.identify.verification')}
                </h3>
                <h4 className="p-content-title">Email Verification</h4>
                <div className="p-tiny-message">
                  <div className="p-tiny-message">
                    {user.kycReviewAnswer == 1 ? (
                      ''
                    ) : (
                      <>
                        {t('Profile.whitelisted.no.ok')}
                        <br></br>
                        <br></br>
                      </>
                    )}
                    {t('Profile.ovr.profile.desc')}
                    <br></br>
                  </div>

                  <br></br>
                  <br></br>
                </div>
                <div className="p-section-content">
                  {user.email ? (
                    <div className="p-balance-value">
                      <TextField
                        id="quantity"
                        label="Email address"
                        type="email"
                        className="Signup__email_textfield"
                        value={user.email}
                        disabled
                      />
                      {!isConfirmedEmail ? (
                        <HexButton
                          url="#"
                          className="--blue --small"
                          text={t('Email.resend.verification')}
                          onClick={requestConfirmEmail}
                        ></HexButton>
                      ) : (
                        <div className="c-status-badge  --open --email-badge">
                          {t('Profille.email.verified')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-balance-value p-profile-form">
                      <TextField
                        id="quantity"
                        label="Email address"
                        type="email"
                        className="Signup__email_textfield"
                        error={userEmailInputError !== false ? true : false}
                        helperText={
                          userEmailInputError !== false
                            ? userEmailInputError
                            : ''
                        }
                        value={userEmail}
                        onFocus={updateUserEmail}
                        onChange={updateUserEmail}
                        onKeyUp={updateUserEmail}
                      />
                      <div>
                        {!isSignupLoading && (
                          <HexButton
                            url="#"
                            className={`--blue ${
                              userEmailValid ? '' : '--disabled'
                            }`}
                            text={t('Email.add')}
                            onClick={handleAddEmail}
                          ></HexButton>
                        )}
                        {isSignupLoading && <CircularProgress />}
                      </div>
                    </div>
                  )}
                </div>
                <br></br>
                <br></br>
                <div className="p-section-content p-profile-form">
                  <div className="p-balance-value">
                    {/* <TextField
										id="quantity"
										label={t("Profile.info.firstname")}
										type="text"
										className="Signup__firstname_textfield"
										value={userFirstName}
										onFocus={updateUserFirstName}
										onChange={updateUserFirstName}
										onKeyUp={updateUserFirstName}
									/>
									<TextField
										id="quantity"
										label={t("Profile.info.lastname")}
										type="text"
										className="Signup__lastname_textfield"
										value={userLastName}
										onFocus={updateUserLastName}
										onChange={updateUserLastName}
										onKeyUp={updateUserLastName}
									/> */}
                    <div className="Signup__nationality_holder">
                      <InputLabel id="user-country-label">
                        {t('Profile.info.country')}
                      </InputLabel>
                      <Select
                        labelId="user-country-label"
                        id="demo-simple-select"
                        value={userCountry}
                        onChange={updateUserCountry}
                      >
                        <MenuItem value="AF">Afghanistan</MenuItem>
                        <MenuItem value="AX">Åland Islands</MenuItem>
                        <MenuItem value="AL">Albania</MenuItem>
                        <MenuItem value="DZ">Algeria</MenuItem>
                        <MenuItem value="AS">American Samoa</MenuItem>
                        <MenuItem value="AD">AndorrA</MenuItem>
                        <MenuItem value="AO">Angola</MenuItem>
                        <MenuItem value="AI">Anguilla</MenuItem>
                        <MenuItem value="AQ">Antarctica</MenuItem>
                        <MenuItem value="AG">Antigua and Barbuda</MenuItem>
                        <MenuItem value="AR">Argentina</MenuItem>
                        <MenuItem value="AM">Armenia</MenuItem>
                        <MenuItem value="AW">Aruba</MenuItem>
                        <MenuItem value="AU">Australia</MenuItem>
                        <MenuItem value="AT">Austria</MenuItem>
                        <MenuItem value="AZ">Azerbaijan</MenuItem>
                        <MenuItem value="BS">Bahamas</MenuItem>
                        <MenuItem value="BH">Bahrain</MenuItem>
                        <MenuItem value="BD">Bangladesh</MenuItem>
                        <MenuItem value="BB">Barbados</MenuItem>
                        <MenuItem value="BY">Belarus</MenuItem>
                        <MenuItem value="BE">Belgium</MenuItem>
                        <MenuItem value="BZ">Belize</MenuItem>
                        <MenuItem value="BJ">Benin</MenuItem>
                        <MenuItem value="BM">Bermuda</MenuItem>
                        <MenuItem value="BT">Bhutan</MenuItem>
                        <MenuItem value="BO">Bolivia</MenuItem>
                        <MenuItem value="BA">Bosnia and Herzegovina</MenuItem>
                        <MenuItem value="BW">Botswana</MenuItem>
                        <MenuItem value="BV">Bouvet Island</MenuItem>
                        <MenuItem value="BR">Brazil</MenuItem>
                        <MenuItem value="IO">
                          British Indian Ocean Territory
                        </MenuItem>
                        <MenuItem value="BN">Brunei Darussalam</MenuItem>
                        <MenuItem value="BG">Bulgaria</MenuItem>
                        <MenuItem value="BF">Burkina Faso</MenuItem>
                        <MenuItem value="BI">Burundi</MenuItem>
                        <MenuItem value="KH">Cambodia</MenuItem>
                        <MenuItem value="CM">Cameroon</MenuItem>
                        <MenuItem value="CA">Canada</MenuItem>
                        <MenuItem value="CV">Cape Verde</MenuItem>
                        <MenuItem value="KY">Cayman Islands</MenuItem>
                        <MenuItem value="CF">Central African Republic</MenuItem>
                        <MenuItem value="TD">Chad</MenuItem>
                        <MenuItem value="CL">Chile</MenuItem>
                        <MenuItem value="CN">China</MenuItem>
                        <MenuItem value="CX">Christmas Island</MenuItem>
                        <MenuItem value="CC">Cocos (Keeling) Islands</MenuItem>
                        <MenuItem value="CO">Colombia</MenuItem>
                        <MenuItem value="KM">Comoros</MenuItem>
                        <MenuItem value="CG">Congo</MenuItem>
                        <MenuItem value="CD">
                          Congo, The Democratic Republic of the
                        </MenuItem>
                        <MenuItem value="CK">Cook Islands</MenuItem>
                        <MenuItem value="CR">Costa Rica</MenuItem>
                        <MenuItem value="CI">Cote D'Ivoire</MenuItem>
                        <MenuItem value="HR">Croatia</MenuItem>
                        <MenuItem value="CU">Cuba</MenuItem>
                        <MenuItem value="CY">Cyprus</MenuItem>
                        <MenuItem value="CZ">Czech Republic</MenuItem>
                        <MenuItem value="DK">Denmark</MenuItem>
                        <MenuItem value="DJ">Djibouti</MenuItem>
                        <MenuItem value="DM">Dominica</MenuItem>
                        <MenuItem value="DO">Dominican Republic</MenuItem>
                        <MenuItem value="EC">Ecuador</MenuItem>
                        <MenuItem value="EG">Egypt</MenuItem>
                        <MenuItem value="SV">El Salvador</MenuItem>
                        <MenuItem value="GQ">Equatorial Guinea</MenuItem>
                        <MenuItem value="ER">Eritrea</MenuItem>
                        <MenuItem value="EE">Estonia</MenuItem>
                        <MenuItem value="ET">Ethiopia</MenuItem>
                        <MenuItem value="FK">
                          Falkland Islands (Malvinas)
                        </MenuItem>
                        <MenuItem value="FO">Faroe Islands</MenuItem>
                        <MenuItem value="FJ">Fiji</MenuItem>
                        <MenuItem value="FI">Finland</MenuItem>
                        <MenuItem value="FR">France</MenuItem>
                        <MenuItem value="GF">French Guiana</MenuItem>
                        <MenuItem value="PF">French Polynesia</MenuItem>
                        <MenuItem value="TF">
                          French Southern Territories
                        </MenuItem>
                        <MenuItem value="GA">Gabon</MenuItem>
                        <MenuItem value="GM">Gambia</MenuItem>
                        <MenuItem value="GE">Georgia</MenuItem>
                        <MenuItem value="DE">Germany</MenuItem>
                        <MenuItem value="GH">Ghana</MenuItem>
                        <MenuItem value="GI">Gibraltar</MenuItem>
                        <MenuItem value="GR">Greece</MenuItem>
                        <MenuItem value="GL">Greenland</MenuItem>
                        <MenuItem value="GD">Grenada</MenuItem>
                        <MenuItem value="GP">Guadeloupe</MenuItem>
                        <MenuItem value="GU">Guam</MenuItem>
                        <MenuItem value="GT">Guatemala</MenuItem>
                        <MenuItem value="GG">Guernsey</MenuItem>
                        <MenuItem value="GN">Guinea</MenuItem>
                        <MenuItem value="GW">Guinea-Bissau</MenuItem>
                        <MenuItem value="GY">Guyana</MenuItem>
                        <MenuItem value="HT">Haiti</MenuItem>
                        <MenuItem value="HM">
                          Heard Island and Mcdonald Islands
                        </MenuItem>
                        <MenuItem value="VA">
                          Holy See (Vatican City State)
                        </MenuItem>
                        <MenuItem value="HN">Honduras</MenuItem>
                        <MenuItem value="HK">Hong Kong</MenuItem>
                        <MenuItem value="HU">Hungary</MenuItem>
                        <MenuItem value="IS">Iceland</MenuItem>
                        <MenuItem value="IN">India</MenuItem>
                        <MenuItem value="ID">Indonesia</MenuItem>
                        <MenuItem value="IR">
                          Iran, Islamic Republic Of
                        </MenuItem>
                        <MenuItem value="IQ">Iraq</MenuItem>
                        <MenuItem value="IE">Ireland</MenuItem>
                        <MenuItem value="IM">Isle of Man</MenuItem>
                        <MenuItem value="IL">Israel</MenuItem>
                        <MenuItem value="IT">Italy</MenuItem>
                        <MenuItem value="JM">Jamaica</MenuItem>
                        <MenuItem value="JP">Japan</MenuItem>
                        <MenuItem value="JE">Jersey</MenuItem>
                        <MenuItem value="JO">Jordan</MenuItem>
                        <MenuItem value="KZ">Kazakhstan</MenuItem>
                        <MenuItem value="KE">Kenya</MenuItem>
                        <MenuItem value="KI">Kiribati</MenuItem>
                        <MenuItem value="KP">
                          Korea, Democratic People'S Republic of
                        </MenuItem>
                        <MenuItem value="KR">Korea, Republic of</MenuItem>
                        <MenuItem value="KW">Kuwait</MenuItem>
                        <MenuItem value="KG">Kyrgyzstan</MenuItem>
                        <MenuItem value="LA">
                          Lao People'S Democratic Republic
                        </MenuItem>
                        <MenuItem value="LV">Latvia</MenuItem>
                        <MenuItem value="LB">Lebanon</MenuItem>
                        <MenuItem value="LS">Lesotho</MenuItem>
                        <MenuItem value="LR">Liberia</MenuItem>
                        <MenuItem value="LY">Libyan Arab Jamahiriya</MenuItem>
                        <MenuItem value="LI">Liechtenstein</MenuItem>
                        <MenuItem value="LT">Lithuania</MenuItem>
                        <MenuItem value="LU">Luxembourg</MenuItem>
                        <MenuItem value="MO">Macao</MenuItem>
                        <MenuItem value="MK">
                          Macedonia, The Former Yugoslav Republic of
                        </MenuItem>
                        <MenuItem value="MG">Madagascar</MenuItem>
                        <MenuItem value="MW">Malawi</MenuItem>
                        <MenuItem value="MY">Malaysia</MenuItem>
                        <MenuItem value="MV">Maldives</MenuItem>
                        <MenuItem value="ML">Mali</MenuItem>
                        <MenuItem value="MT">Malta</MenuItem>
                        <MenuItem value="MH">Marshall Islands</MenuItem>
                        <MenuItem value="MQ">Martinique</MenuItem>
                        <MenuItem value="MR">Mauritania</MenuItem>
                        <MenuItem value="MU">Mauritius</MenuItem>
                        <MenuItem value="YT">Mayotte</MenuItem>
                        <MenuItem value="MX">Mexico</MenuItem>
                        <MenuItem value="FM">
                          Micronesia, Federated States of
                        </MenuItem>
                        <MenuItem value="MD">Moldova, Republic of</MenuItem>
                        <MenuItem value="MC">Monaco</MenuItem>
                        <MenuItem value="MN">Mongolia</MenuItem>
                        <MenuItem value="MS">Montserrat</MenuItem>
                        <MenuItem value="MA">Morocco</MenuItem>
                        <MenuItem value="MZ">Mozambique</MenuItem>
                        <MenuItem value="MM">Myanmar</MenuItem>
                        <MenuItem value="NA">Namibia</MenuItem>
                        <MenuItem value="NR">Nauru</MenuItem>
                        <MenuItem value="NP">Nepal</MenuItem>
                        <MenuItem value="NL">Netherlands</MenuItem>
                        <MenuItem value="AN">Netherlands Antilles</MenuItem>
                        <MenuItem value="NC">New Caledonia</MenuItem>
                        <MenuItem value="NZ">New Zealand</MenuItem>
                        <MenuItem value="NI">Nicaragua</MenuItem>
                        <MenuItem value="NE">Niger</MenuItem>
                        <MenuItem value="NG">Nigeria</MenuItem>
                        <MenuItem value="NU">Niue</MenuItem>
                        <MenuItem value="NF">Norfolk Island</MenuItem>
                        <MenuItem value="MP">Northern Mariana Islands</MenuItem>
                        <MenuItem value="NO">Norway</MenuItem>
                        <MenuItem value="OM">Oman</MenuItem>
                        <MenuItem value="PK">Pakistan</MenuItem>
                        <MenuItem value="PW">Palau</MenuItem>
                        <MenuItem value="PS">
                          Palestinian Territory, Occupied
                        </MenuItem>
                        <MenuItem value="PA">Panama</MenuItem>
                        <MenuItem value="PG">Papua New Guinea</MenuItem>
                        <MenuItem value="PY">Paraguay</MenuItem>
                        <MenuItem value="PE">Peru</MenuItem>
                        <MenuItem value="PH">Philippines</MenuItem>
                        <MenuItem value="PN">Pitcairn</MenuItem>
                        <MenuItem value="PL">Poland</MenuItem>
                        <MenuItem value="PT">Portugal</MenuItem>
                        <MenuItem value="PR">Puerto Rico</MenuItem>
                        <MenuItem value="QA">Qatar</MenuItem>
                        <MenuItem value="RE">Reunion</MenuItem>
                        <MenuItem value="RO">Romania</MenuItem>
                        <MenuItem value="RU">Russian Federation</MenuItem>
                        <MenuItem value="RW">RWANDA</MenuItem>
                        <MenuItem value="SH">Saint Helena</MenuItem>
                        <MenuItem value="KN">Saint Kitts and Nevis</MenuItem>
                        <MenuItem value="LC">Saint Lucia</MenuItem>
                        <MenuItem value="PM">
                          Saint Pierre and Miquelon
                        </MenuItem>
                        <MenuItem value="VC">
                          Saint Vincent and the Grenadines
                        </MenuItem>
                        <MenuItem value="WS">Samoa</MenuItem>
                        <MenuItem value="SM">San Marino</MenuItem>
                        <MenuItem value="ST">Sao Tome and Principe</MenuItem>
                        <MenuItem value="SA">Saudi Arabia</MenuItem>
                        <MenuItem value="SN">Senegal</MenuItem>
                        <MenuItem value="CS">Serbia and Montenegro</MenuItem>
                        <MenuItem value="SC">Seychelles</MenuItem>
                        <MenuItem value="SL">Sierra Leone</MenuItem>
                        <MenuItem value="SG">Singapore</MenuItem>
                        <MenuItem value="SK">Slovakia</MenuItem>
                        <MenuItem value="SI">Slovenia</MenuItem>
                        <MenuItem value="SB">Solomon Islands</MenuItem>
                        <MenuItem value="SO">Somalia</MenuItem>
                        <MenuItem value="ZA">South Africa</MenuItem>
                        <MenuItem value="GS">
                          South Georgia and the South Sandwich Islands
                        </MenuItem>
                        <MenuItem value="ES">Spain</MenuItem>
                        <MenuItem value="LK">Sri Lanka</MenuItem>
                        <MenuItem value="SD">Sudan</MenuItem>
                        <MenuItem value="SR">Suriname</MenuItem>
                        <MenuItem value="SJ">Svalbard and Jan Mayen</MenuItem>
                        <MenuItem value="SZ">Swaziland</MenuItem>
                        <MenuItem value="SE">Sweden</MenuItem>
                        <MenuItem value="CH">Switzerland</MenuItem>
                        <MenuItem value="SY">Syrian Arab Republic</MenuItem>
                        <MenuItem value="TW">
                          Taiwan, Province of China
                        </MenuItem>
                        <MenuItem value="TJ">Tajikistan</MenuItem>
                        <MenuItem value="TZ">
                          Tanzania, United Republic of
                        </MenuItem>
                        <MenuItem value="TH">Thailand</MenuItem>
                        <MenuItem value="TL">Timor-Leste</MenuItem>
                        <MenuItem value="TG">Togo</MenuItem>
                        <MenuItem value="TK">Tokelau</MenuItem>
                        <MenuItem value="TO">Tonga</MenuItem>
                        <MenuItem value="TT">Trinidad and Tobago</MenuItem>
                        <MenuItem value="TN">Tunisia</MenuItem>
                        <MenuItem value="TR">Turkey</MenuItem>
                        <MenuItem value="TM">Turkmenistan</MenuItem>
                        <MenuItem value="TC">Turks and Caicos Islands</MenuItem>
                        <MenuItem value="TV">Tuvalu</MenuItem>
                        <MenuItem value="UG">Uganda</MenuItem>
                        <MenuItem value="UA">Ukraine</MenuItem>
                        <MenuItem value="AE">United Arab Emirates</MenuItem>
                        <MenuItem value="GB">United Kingdom</MenuItem>
                        <MenuItem value="US">United States</MenuItem>
                        <MenuItem value="UM">
                          United States Minor Outlying Islands
                        </MenuItem>
                        <MenuItem value="UY">Uruguay</MenuItem>
                        <MenuItem value="UZ">Uzbekistan</MenuItem>
                        <MenuItem value="VU">Vanuatu</MenuItem>
                        <MenuItem value="VE">Venezuela</MenuItem>
                        <MenuItem value="VN">Viet Nam</MenuItem>
                        <MenuItem value="VG">Virgin Islands, British</MenuItem>
                        <MenuItem value="VI">Virgin Islands, U.S.</MenuItem>
                        <MenuItem value="WF">Wallis and Futuna</MenuItem>
                        <MenuItem value="EH">Western Sahara</MenuItem>
                        <MenuItem value="YE">Yemen</MenuItem>
                        <MenuItem value="ZM">Zambia</MenuItem>
                        <MenuItem value="ZW">Zimbabwe</MenuItem>
                      </Select>
                    </div>

                    <div>
                      {!isNamesLoading && (
                        <HexButton
                          url="#"
                          className={`--blue ${
                            userFullNameValid ? '' : '--disabled'
                          }`}
                          text={t('Email.add')}
                          onClick={handleAddProfileInfos}
                        ></HexButton>
                      )}
                      {isNamesLoading && <CircularProgress />}
                    </div>
                  </div>
                </div>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <div className="p-section-content">
                  <h4 className="p-content-title">
                    {t('Profile.status.label')}
                  </h4>
                  {isIMWallet ? (
                    <>
                      <div className="p-tiny-message">
                        {t('Profile.ios.sumsub')}
                      </div>
                      <br></br>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className="p-balance-value">
                    {renderBadge(user.kycReviewAnswer, t)}
                    <div>
                      {!isIMWallet ? (
                        <HexButton
                          url="#"
                          className="--blue"
                          text={
                            user.kycReviewAnswer == -1
                              ? t('Profile.start.verification')
                              : t('Profile.check.verification')
                          }
                          onClick={toggleKycVerificationFrame}
                        ></HexButton>
                      ) : (
                        <HexButton
                          target={'_blank'}
                          url={urlKyc}
                          className="--blue"
                          text={t('Generic.external.link')}
                          onClick={toggleImWalletKycVerificationFrame}
                        ></HexButton>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-tiny-message">
                  {user.kycClientComment != null &&
                    user.kycReviewAnswer != 1 &&
                    user.kycClientComment}
                </div>
                <div id="sumsub-websdk-container"></div>
              </div>
              <div key="Cashback" className="p-section --m-t">
                <h3 className="p-section-title">
                  {t('Profile.cashback.title')}
                </h3>

                <div className="p-tiny-message">
                  <div className="p-tiny-message">
                    {t('Profile.cashback.description')}
                  </div>
                  <br></br>
                  <br></br>
                </div>
                <div className="p-section-content">
                  <HexButton
                    url="#"
                    className={'--orange'}
                    text={t('Profile.cashback.button')}
                    onClick={handleClaimCashback}
                  ></HexButton>
                </div>
              </div>
              {/* <div key="Invite" className="p-section --m-t">
                <h3 className="p-section-title">{t('Profile.invite.title')}</h3>

                <div className="p-tiny-message">
                  <div className="p-tiny-message">
                    {t('Profile.invite.description')}
                  </div>
                  <br></br>
                  <br></br>
                </div>
                <div className="p-section-content">
                  <HexButton
                    url="#"
                    className={'--orange'}
                    text={t('Profile.invite.button')}
                    onClick={handleClaimCashback}
                  ></HexButton>
                </div>
              </div> */}
              <div className="p-tiny-message">
                {/* Every account will need to verify it's identity in order to buy OVR. <br></br>
								Start your verification now. */}
              </div>
              {/* <div key="redeem-land" className="p-section --m-t">
								<h3 className="p-section-title">Redeem lands</h3>
								<div className="p-section-content">
									<h4 className="p-content-title">Waiting to be redeemed</h4>
									<div className="p-balance-value">
										0
										<div>
											<HexButton
												url=""
												className="Funds__buy HexButton --blue redeem-button"
												text="Redeem lands"
												onClick={web3Context.redeemLands}
											></HexButton>
										</div>
									</div>
								</div>
							</div> */}
              {/*
								<div key="notifications" className="p-section">
									<h3 className="p-section-title">NOTIFICATIONS</h3>
									<div className="p-section-content">
										<h4 className="p-content-title">General</h4>
										<div>
											<div className="o-half">
												<CheckBox label="Hottest Auctions" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
											<div className="o-half">
												<CheckBox label="Area of interest" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
										</div>
										<div>
											<div className="o-half">
												<h4 className="p-content-title">My OVRLands</h4>
												<CheckBox label="New sell request" text="Authorize the Marketplace to operate OVR on my behalf" />
												<CheckBox label="OVRLand sold" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
											<div className="o-half">
												<h4 className="p-content-title">My auctions</h4>
												<CheckBox label="Over bidded" text="Authorize the Marketplace to operate OVR on my behalf" />
												<CheckBox label="Auction won" text="Authorize the Marketplace to operate OVR on my behalf" />
											</div>
										</div>
									</div>

									<div className="p-email-subscription">
										<EmailConfirmation />
									</div>
								</div>
							*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Profile = () => {
  const { t, i18n } = useTranslation()
  const { state } = useContext(UserContext)
  const { isLoggedIn: userAuthenticated } = state

  // Google Analytics
  useEffect(() => {
    let authenticated = ''
    if (userAuthenticated) {
      authenticated = '/authenticated'
    }
    ReactGA.set({ page: window.location.pathname + authenticated })
    ReactGA.pageview(window.location.pathname + authenticated)
  }, [userAuthenticated])

  if (!userAuthenticated) {
    return <ProfileContentLoginRequired t={t} />
  }

  return <ProfileLayout state={state} />
}

export default Profile
