/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import * as R from 'ramda'
import * as moment from 'moment'

import { userActivities, getUserNotifications } from 'lib/api'
import { UserContext } from 'context/UserContext'
import { Web3Context } from 'context/Web3Context'
import ActivityTile from 'components/ActivityTile/ActivityTile'
import NotificationTile from 'components/NotificationTile/NotificationTile'
import { useTranslation } from 'react-i18next'

import Pagination from '@material-ui/lab/Pagination'
import CircularProgress from '@material-ui/core/CircularProgress'

const ActivityContentLoginRequired = () => {
  const { t, i18n } = useTranslation()
  return (
    <div className="profile">
      <div className="o-container">
        <div className="c-dialog --centered">
          <div className="c-dialog-main-title">
            {t('Activity.login.required')}
            <span role="img" aria-label="Cool dude">
              😎
            </span>
          </div>
          <div className="c-dialog-sub-title">{t('Activity.login.now')}</div>
        </div>
      </div>
    </div>
  )
}

const NotificationsLayout = () => {
  const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY')
  const { t, i18n } = useTranslation()
  return (
    <div className="activity">
      <div className="o-container">
        <div className="p-header">
          <h2 className="p-header-title">
            {t('NotificationCenter.view.title')}
          </h2>
          <span className="p-header-datetime">{currentDatetimeStamp}</span>
        </div>
        <div className="sub-title">{t('NotificationCenter.view.subtitle')}</div>
      </div>
      <NotificationsContent />
      {/* <ActivityContent t={t}></ActivityContent> */}
    </div>
  )
}

const ActivityContent = () => {
  const { state: userState } = useContext(UserContext)
  const { actions: userActions } = useContext(UserContext)
  const [activityList, setActivityList] = useState(false)

  const web3Context = useContext(Web3Context)
  const { user } = userState
  const { t, i18n } = useTranslation()

  // Update activities when componenet is loaded
  useEffect(() => {
    userActivities().then((response) => {
      userActions.setUserActivity(response.data.user)
    })
  }, [])

  // Update activities when receive a notification

  useEffect(() => {
    if (userState.user.activities && userState.user.activities.content) {
      let activities = []
      activities = userState.user.activities.content.map((obj) => (
        <ActivityTile
          key={obj.uuid}
          data={obj}
          context={{
            userState: user,
            web3Context: web3Context,
          }}
        />
      ))
      if (activities.length === 0 || activities === undefined) {
        activities = (
          <div className="profile">
            <div className="o-container">
              <div className="c-dialog --centered">
                <div className="c-dialog-sub-title">
                  {t('Activity.no.activity')}
                  <span role="img" aria-label="Cool dude">
                    🤙
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      }
      // return activities;
      setActivityList(activities)
    }
  }, [userState.user.activities])

  return (
    <div className="activity-content">
      <div className="o-container">{activityList}</div>
    </div>
  )
}

const NotificationsContent = () => {
  const { t, i18n } = useTranslation()

  //   Notifications states
  const [notificationsList, setNotificationsList] = useState(null)
  const [notificationsPage, setNotificationsPage] = useState(1)
  const [notificationsTotalPages, setNotificationsTotalPages] = useState(null)

  useEffect(() => {
    getUserNotifications(notificationsPage).then((response) => {
      const notificationData = R.pathOr(
        [],
        ['data', 'user', 'content'],
        response
      )

      const total = R.pathOr(0, ['data', 'user', 'numberOfPages'], response)
      setNotificationsList(notificationData)
      setNotificationsTotalPages(total)
    })
  }, [notificationsPage])

  if (R.isNil(notificationsList)) {
    return (
      <div className="container-loader">
        <CircularProgress />
      </div>
    )
  }

  if (R.isEmpty(notificationsList)) {
    return (
      <div className="o-container no-data-to-display">
        <div className="o-land-list">
          <div className="c-dialog --centered">
            <div className="c-dialog-main-title">
              There is currently no notifications to display
            </div>
            <div className="c-dialog-sub-title">
              Browse the available OVRLands: mint a land and own it now.
            </div>
          </div>
        </div>
        <div className="o-pagination"></div>
      </div>
    )
  }

  const handlePaginationChange = (event, value) => {
    setNotificationsPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="o-container notifications-container">
        {R.map((single) => <NotificationTile data={single} />)(
          notificationsList
        )}

        <div className="o-pagination">
          <Pagination
            count={notificationsTotalPages}
            page={notificationsPage}
            onChange={handlePaginationChange}
          />
        </div>
      </div>
    </>
  )
}

const NotificationView = () => {
  const { state } = useContext(UserContext)
  const { isLoggedIn: userAuthenticated } = state

  if (!userAuthenticated) {
    return <ActivityContentLoginRequired />
  }
  return <NotificationsLayout state={state} />
}

export default NotificationView
