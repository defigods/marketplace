import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import { BannerCounterContextProvider } from 'context/BannerCounterContext'
import { NewMapContextProvider } from 'context/NewMapContext'
import { NewUserContextProvider } from 'context/NewUserContext'

import CircularProgress from '@material-ui/core/CircularProgress'

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

ReactDOM.render(
  <Suspense fallback={<Preloading />}>
    <NewUserContextProvider>
      <NewMapContextProvider>
        <BannerCounterContextProvider>
          <App />
        </BannerCounterContextProvider>
      </NewMapContextProvider>
    </NewUserContextProvider>
  </Suspense>,

  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
