import React, { Suspense } from 'react'
import './App.scss'
import './i18n'
import 'react-notifications-component/dist/theme.css'

// import Home from './views/Home/Home';
import Discover from './views/Discover/Discover'
import Overview from './views/Overview/Overview'
import Land from './views/Land/Land'
import Lands from './views/Lands/Lands'
import Profile from './views/Profile/Profile'
import NotificationView from './views/NotificationView/NotificationView'
import Login from './views/Login/Login'
import LoginHelper from './views/LoginHelper/LoginHelper'
import Signup from './views/Signup/Signup'
import BuyTokens from './views/BuyTokens/BuyTokens'
import IndacoinResponse from './views/IndacoinResponse/IndacoinResponse'
import PublicSale from './views/PublicSale/PublicSale'
import ConfirmEmail from './views/ConfirmEmail/ConfirmEmail'
import Staking from './views/Staking/Staking'
import StakingVestingOvrg from './views/Vesting/Vesting'

import NavBar from './components/NavBar/NavBar'
import Map from './components/Map/Map'
import Footer from './components/Footer/Footer'

import ReactNotification from 'react-notifications-component'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { UserProvider, UserContext } from './context/UserContext'
import { Web3Provider, Web3Context } from './context/Web3Context'

import ReactGA from 'react-ga'
import { createBrowserHistory } from 'history'

import CircularProgress from '@material-ui/core/CircularProgress'

//TODO
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { Translation } from 'react-i18next'

const supportedLangs = ['en', 'zh']
const fallbackLang = 'en'

function App() {
  i18next.use(LanguageDetector).init({
    // order and from where user language should be detected
    order: [
      'querystring',
      'cookie',
      'localStorage',
      'sessionStorage',
      'navigator',
      'htmlTag',
      'path',
      'subdomain',
    ],

    // keys or params to lookup language from
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',
    lookupSessionStorage: 'i18nextLng',
    lookupFromPathIndex: 0,
    lookupFromSubdomainIndex: 0,
    lng: navigator.language || navigator.userLanguage,

    // cache user language on
    caches: ['localStorage', 'cookie'],
    excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)
  })

  if (!supportedLangs.includes(i18next.language)) {
    localStorage.removeItem('i18nextLng')
    i18next.changeLanguage(fallbackLang)
  }

  const history = createBrowserHistory()

  // Initialize google analytics page view tracking
  history.listen((location) => {
    ReactGA.initialize('UA-128415861-1')
    ReactGA.set({ page: location.pathname }) // Update the user's current page
    ReactGA.pageview(location.pathname) // Record a pageview for the given page
  })
  function historyPush(route) {
    history.push(route)
  }
  window.historyPush = historyPush

  const Preloading = () => {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="#2d245b" />
      </div>
    )
  }

  return (
    <Suspense fallback={<Preloading />}>
      <Translation>
        {(t, { i18n }) => (
          <UserProvider t={t} i18n={i18n}>
            <Web3Provider t={t} i18n={i18n}>
              <UserContext.Consumer>
                {(userValue) => {
                  return (
                    <Web3Context.Consumer>
                      {(web3Value) => {
                        return (
                          <Router history={history}>
                            <div className="App">
                              <ReactNotification />
                              <NavBar />
                              <div className="o-container">
                                <Route path="/map/" component={Map} />
                              </div>
                              <Switch>
                                <Route exact path="/">
                                  <Redirect to="/map/discover" />
                                </Route>
                                <Route
                                  path="/map/discover/:ref"
                                  component={Discover}
                                />
                                <Route
                                  path="/map/discover"
                                  component={Discover}
                                />
                                <Route
                                  path="/map/overview"
                                  component={Overview}
                                />
                                <Route path="/map/lands" component={Lands} />
                                <Route path="/map/land/:id" component={Land} />
                                <Route path="/profile" component={Profile} />
                                <Route
                                  path="/notifications-center"
                                  component={NotificationView}
                                />
                                <Route path="/login" component={Login} />
                                <Route
                                  path="/login-helper"
                                  component={LoginHelper}
                                />
                                <Route
                                  path="/public-sale"
                                  component={PublicSale}
                                />
                                <Route path="/staking" component={Staking} />
                                <Route
                                  path="/confirm-email"
                                  component={ConfirmEmail}
                                />
                                <Route
                                  path="/staking-vesting-ovrg"
                                  component={StakingVestingOvrg}
                                />
                              </Switch>
                              <Footer />
                            </div>
                          </Router>
                        )
                      }}
                    </Web3Context.Consumer>
                  )
                }}
              </UserContext.Consumer>
            </Web3Provider>
          </UserProvider>
        )}
      </Translation>
    </Suspense>
  )
}

export default App
