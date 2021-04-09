/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import ActionCable from 'actioncable'

import { isLogged, getToken, saveToken } from 'lib/auth'
import { userProfile, getUserBalanceAndAllowance } from 'lib/api'
import { networkError, dangerNotification } from 'lib/notifications'

export const NewUserContext = React.createContext()

export const NewUserContextProvider = ({ children }) => {
  const { t } = useTranslation()
  const [userState, setUserState] = useState({
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
  })

  useEffect(() => {
    if (isLogged()) {
      // Check
      userProfile()
        .then((response) => {
          if (response.data.result === true) {
            setUserState((s) => ({
              ...s,
              hasLoaded: true,
              user: response.data.user,
            }))
            liveSocket()
          } else {
            dangerNotification(
              t('Danger.session.expired.title'),
              t('Danger.session.expired.desc')
            )
            this.logoutUser()
          }
        })
        .catch(() => {
          // Notify user if network error
          networkError()
        })

      loginUser(getToken('userToken'), getToken('userUuid'))
    }
  }, [])

  const setUser = (user) => {
    setUserState((s) => ({ ...s, user: user }))
  }

  const setUserBalance = (bal) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        balance: bal,
      },
    }))
  }

  const setUserEmail = (email) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        email: email,
      },
    }))
  }

  const setUserFirstName = (firstName) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        firstName: firstName,
      },
    }))
  }

  const setUserLastName = (lastName) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        lastName: lastName,
      },
    }))
  }

  // it works differently
  const setUserCountry = (country) => {
    userProfile().then((response) => {
      if (response.data.result === true) {
        setUserState((s) => ({ ...s, user: { ...s.user, country } }))
      }
    })
  }

  const setIsConfirmedEmail = (bool) => {
    userProfile().then((response) => {
      if (response.data.result === true) {
        setUserState((s) => ({
          ...s,
          user: { ...s.user, isConfirmedEmail: bool },
        }))
      }
    })
  }

  const setIsProfileCompleted = (bool) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        isProfileCompleted: bool,
      },
    }))
  }

  const setUserActivity = (activities) => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        activities: camelCaseKeys(activities),
      },
    }))
  }

  const loginUser = (token, user) => {
    setUserState((s) => ({ ...s, isLoggedIn: true, token: token, user: user }))
    // Cookie management
    saveToken('userToken', token)
    saveToken('userUuid', user)
    liveSocket()
  }

  const logoutUser = () => {
    setUserState((s) => ({
      ...s,
      isLoggedIn: false,
      token: null,
      user: { ...s.user, uuid: null },
    }))

    // Cookie management
    removeToken('userToken')
    removeToken('userUuid')
  }

  const refreshBalanceAndAllowance = () => {
    getUserBalanceAndAllowance()
      .then((response) => {
        if (response.data.result === true) {
          console.debug('refreshBalanceAndAllowance.response', response)
          setUserState((s) => ({
            ...s,
            user: {
              ...s.user,
              balance: response.data.balance,
              allowance: response.data.allowance,
              balanceProjection: response.data.balanceProjection,
              pendingOnBalance: response.data.pendingOnBalance,
            },
          }))
        }
      })
      .catch((err) => {
        // Notify user if network error
        console.log('refreshBalanceAndAllowance.error', err)
        networkError()
      })
  }

  // Centralized Notifications
  const toggleShowNotificationCenter = () => {
    setUserState((s) => ({
      ...s,
      showNotificationCenter: !s.showNotificationCenter,
    }))
  }

  const closeNotificationCenter = () => {
    setUserState((s) => ({ ...s, showNotificationCenter: false }))
  }

  const setNotificationAsReaded = (notification_uuid) => {
    let notifications_content = userState.user.notifications.content
    let unreaded_count = userState.user.notifications.unreadedCount

    notifications_content.readNotification(notification_uuid)
    unreaded_count = unreaded_count - 1

    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        notifications: {
          ...s.user.notifications,
          unreadedCount: unreaded_count,
          content: notifications_content,
        },
      },
    }))
  }

  const setAllNotificationsAsReaded = () => {
    let notifications_content = userState.user.notifications.content
    notifications_content.readAllNotifications()
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        notifications: {
          ...s.user.notifications,
          unreadedCount: 0,
          content: notifications_content,
        },
      },
    }))
  }

  const acceptIbcoTermsAndConditions = () => {
    setUserState((s) => ({
      ...s,
      user: {
        ...s.user,
        ibcoAcceptedTerms: true,
      },
    }))
  }

  const liveSocket = () => {
    if (
      userState.isLoggedIn &&
      !userState.subscribedToLiveSockets &&
      checkToken('userToken')
    ) {
      setUserState((s) => ({ ...s, subscribedToLiveSockets: true }))
      if (window.userSocket) window.userSocket.unsubscribe()
      var cable = ActionCable.createConsumer(config.apis.socket)
      window.userSocket = cable.subscriptions.create(
        { channel: 'UsersChannel', user_uuid: this.state.user.uuid },
        {
          received: (data) => {
            if (data['only_kyc'] && data['only_kyc'] == true) {
              const { kyc_review_answer } = data
              // Update KYC Status
              setUserState((s) => ({
                ...s,
                hasLoaded: true,
                user: {
                  ...s.user,
                  kycReviewAnswer: kyc_review_answer,
                },
              }))
            } else {
              const { notification } = data
              const { unreaded_count } = data
              // Update state on new notification
              setUserState((s) => ({
                hasLoaded: true,
                user: {
                  ...s.user,
                  notifications: {
                    ...s.user.notifications,
                    unreadedCount: unreaded_count,
                    content: [
                      camelCaseKeys(notification),
                      ...s.user.notifications.content,
                    ],
                  },
                },
              }))
            }
          },
        }
      )
    } else {
      if (window.userSocket) window.userSocket.unsubscribe()
    }
  }

  const actions = {
    loginUser,
    logoutUser,
    setUserState,
    setUserActivity,
    setUserEmail,
    setUserFirstName,
    setUserLastName,
    setUserCountry,
    setIsConfirmedEmail,
    setIsProfileCompleted,
    toggleShowNotificationCenter,
    closeNotificationCenter,
    refreshBalanceAndAllowance,
    acceptIbcoTermsAndConditions,
    setUserBalance,
    notification: {
      setAsReaded: setNotificationAsReaded,
      setAllAsReaded: setAllNotificationsAsReaded,
    },
  }

  return (
    <NewUserContext.Provider value={[userState, setUserState, actions]}>
      {children}
    </NewUserContext.Provider>
  )
}

NewUserContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
