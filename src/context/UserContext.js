import React, { createContext, Component } from 'react'
import {
  removeToken,
  saveToken,
  isLogged,
  getToken,
  removeUser,
  getUser,
} from '../lib/auth'
import {
  successNotification,
  networkError,
  dangerNotification,
  warningNotification,
} from '../lib/notifications'
import {
  userProfile,
  getUserNonce,
  signUpPublicAddress,
  signIn,
  getUserBalanceAndAllowance,
} from '../lib/api'
import config, { camelCaseKeys } from '../lib/config'
import { useTranslation } from 'react-i18next'

let ActionCable = require('actioncable')

export const UserContext = createContext()

export class UserProvider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasLoaded: false,
      isLoggedIn: false,
      subscribedToLiveSockets: false,
      showNotificationCenter: false,
      token: null,
      user: {
        uuid: null,
        allowance: 0,
        balance: 0,
        email: null,
        firstName: null,
        lastName: null,
        country: null,
        balanceProjection: 0,
        pendingOnBalance: 0,
        kycReviewAnswer: -1,
        isConfirmedEmail: false,
        isProfileCompleted: false,
        ibcoAcceptedTerms: false,
      },
    }
  }

  componentDidMount() {
    if (isLogged()) {
      // Check
      userProfile()
        .then((response) => {
          if (response.data.result === true) {
            this.setState({ hasLoaded: true, user: response.data.user })
            this.liveSocket()
          } else {
            dangerNotification(
              this.props.t('Danger.session.expired.title'),
              this.props.t('Danger.session.expired.desc')
            )
            this.logoutUser()
          }
        })
        .catch(() => {
          // Notify user if network error
          console.log('isLogged')
          networkError()
        })

      this.loginUser(getToken('userToken'), getToken('userUuid'))
    }
  }

  setUserState = (user) => {
    this.setState({ user: user })
  }

  setUserBalance = (balance) => {
    this.setState({
      user: {
        ...this.state.user,
        balance: balance,
      },
    })
  }

  setUserEmail = (email) => {
    this.setState({
      user: {
        ...this.state.user,
        email: email,
      },
    })
  }

  setUserFirstName = (firstName) => {
    this.setState({
      user: {
        ...this.state.user,
        firstName: firstName,
      },
    })
  }

  setUserLastName = (lastName) => {
    this.setState({
      user: {
        ...this.state.user,
        lastName: lastName,
      },
    })
  }

  setUserCountry = (country) => {
    // this.setState({ user: {
    // 	...this.state.user,
    // 	country: country
    // } });
    userProfile().then((response) => {
      if (response.data.result === true) {
        this.setState({ user: response.data.user })
      }
    })
  }

  setIsConfirmedEmail = (boole) => {
    // console.log('setIsConfirmedEmail in UserContext: ', boole)
    // this.setState({ user: {
    // 	...this.state.user,
    // 	isConfirmedEmail: boole
    // } });
    // console.log('setIsConfirmedEmail in UserContext - State: ', this.state.user.isConfirmedEmail)
    // console.log('USER in UserContext - State: ', this.state.user)
    // Check
    userProfile().then((response) => {
      if (response.data.result === true) {
        this.setState({ user: response.data.user })
      }
    })
  }

  setIsProfileCompleted = (isProfileCompleted) => {
    this.setState({
      user: {
        ...this.state.user,
        isProfileCompleted: isProfileCompleted,
      },
    })
  }

  setUserActivity = (activities) => {
    this.setState({
      user: {
        ...this.state.user,
        activities: camelCaseKeys(activities),
      },
    })
  }

  loginUser = (token, user) => {
    this.setState({ isLoggedIn: true, token: token, user: user })
    // Cookie management
    saveToken('userToken', token)
    saveToken('userUuid', user)
    this.liveSocket()
  }

  logoutUser = () => {
    this.setState({ isLoggedIn: false, token: null, user: { uuid: null } })
    // Cookie management
    removeToken('userToken')
    removeToken('userUuid')
  }

  refreshBalanceAndAllowance = () => {
    console.log('refreshBalanceAndAllowance')
    getUserBalanceAndAllowance()
      .then((response) => {
        if (response.data.result === true) {
          console.log('refreshBalanceAndAllowance', response.data)
          this.setState({
            user: {
              ...this.state.user,
              balance: response.data.balance,
              allowance: response.data.allowance,
              balanceProjection: response.data.balanceProjection,
              pendingOnBalance: response.data.pendingOnBalance,
            },
          })
        }
      })
      .catch((err) => {
        // Notify user if network error
        console.log('NetworkErrorCode: 1')
        networkError()
      })
  }

  // Centralized Notifications

  toggleShowNotificationCenter = () => {
    this.setState({
      showNotificationCenter: !this.state.showNotificationCenter,
    })
  }

  acceptIbcoTermsAndConditions = () => {
    this.setState({
      user: {
        ...this.state.user,
        ibcoAcceptedTerms: true,
      },
    })
  }

  closeNotificationCenter = () => {
    this.setState({ showNotificationCenter: false })
  }

  setNotificationAsReaded = (notification_uuid) => {
    let notifications_content = this.state.user.notifications.content
    let unreaded_count = this.state.user.notifications.unreadedCount

    notifications_content.readNotification(notification_uuid)
    unreaded_count = unreaded_count - 1

    this.setState({
      user: {
        ...this.state.user,
        notifications: {
          ...this.state.user.notifications,
          unreadedCount: unreaded_count,
          content: notifications_content,
        },
      },
    })
  }

  setAllNotificationsAsReaded = () => {
    let notifications_content = this.state.user.notifications.content
    notifications_content.readAllNotifications()
    this.setState({
      user: {
        ...this.state.user,
        notifications: {
          ...this.state.user.notifications,
          unreadedCount: 0,
          content: notifications_content,
        },
      },
    })
  }

  // Sockets

  liveSocket = () => {
    if (this.state.isLoggedIn && !this.state.subscribedToLiveSockets) {
      this.setState({ subscribedToLiveSockets: true })
      var cable = ActionCable.createConsumer(config.apis.socket)

      cable.subscriptions.create(
        { channel: 'UsersChannel', user_uuid: this.state.user.uuid },
        {
          received: (data) => {
            if (data['only_kyc'] && data['only_kyc'] == true) {
              const { kyc_review_answer } = data
              // Update KYC Status
              this.setState({
                hasLoaded: true,
                user: {
                  ...this.state.user,
                  kycReviewAnswer: kyc_review_answer,
                },
              })
            } else {
              const { notification } = data
              const { unreaded_count } = data
              // Update state on new notification
              this.setState({
                hasLoaded: true,
                user: {
                  ...this.state.user,
                  notifications: {
                    ...this.state.user.notifications,
                    unreadedCount: unreaded_count,
                    content: [
                      camelCaseKeys(notification),
                      ...this.state.user.notifications.content,
                    ],
                  },
                },
              })
            }
          },
        }
      )
    }
  }

  // Type is a number where
  // 0 -> eth
  // 1 -> Dai
  // 2 -> Usdt
  // 3 -> Usdc
  // 4 -> OVR
  participate = async (type, bid, landId) => {
    let tx
    const { t, i18n } = useTranslation()

    try {
      await this.getPrices()
    } catch (e) {
      return warningNotification(
        this.props.t('Warning.get.prices.title'),
        this.props.t('Warning.get.prices.desc') + ` ${e.message}`
      )
    }
    try {
      // For ether we send the value instead of the bid
      if (type === 0) {
        const value = bid / this.state.perEth
        // console.log('value', value, 'bid', bid, 'per eth', this.state.perEth, 'ico participate', this.state.icoParticipate.address)
        tx = await this.state.icoParticipate.participateAsync(
          type,
          bid,
          landId,
          {
            value: value,
            gasPrice: window.web3.toWei(300, 'gwei'),
          }
        )
      }
      return tx
    } catch (e) {
      return warningNotification(
        this.props.t('Warning.buy.error.title'),
        this.props.t('Warning.buy.error.desc') + ` ${e.message}`
      )
    }
  }

  render() {
    return (
      <UserContext.Provider
        value={{
          state: this.state,
          actions: {
            loginUser: this.loginUser,
            logoutUser: this.logoutUser,
            setUserState: this.setUserState,
            setUserActivity: this.setUserActivity,
            setUserEmail: this.setUserEmail,
            setUserFirstName: this.setUserFirstName,
            setUserLastName: this.setUserLastName,
            setUserCountry: this.setUserCountry,
            setIsConfirmedEmail: this.setIsConfirmedEmail,
            setIsProfileCompleted: this.setIsProfileCompleted,
            toggleShowNotificationCenter: this.toggleShowNotificationCenter,
            closeNotificationCenter: this.closeNotificationCenter,
            refreshBalanceAndAllowance: this.refreshBalanceAndAllowance,
            acceptIbcoTermsAndConditions: this.acceptIbcoTermsAndConditions,
            setUserBalance: this.setUserBalance,
            notification: {
              setAsReaded: this.setNotificationAsReaded,
              setAllAsReaded: this.setAllNotificationsAsReaded,
            },
          },
        }}
      >
        {this.props.children}
      </UserContext.Provider>
    )
  }
}

export function withUserContext(Component) {
  class ComponentWithContext extends React.Component {
    render() {
      return (
        <UserContext.Consumer>
          {(value) => <Component {...this.props} userProvider={{ ...value }} />}
        </UserContext.Consumer>
      )
    }
  }

  return ComponentWithContext
}
