import React from 'react'

class IdensicComp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      idensicPath: props.baseUrl + '/idensic/static/sumsub-kyc.js',
    }
  }

  attachKycJs(idensicPath) {
    if (window.idensic) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.onload = (loadEvent) => {
        if (window.idensic) {
          resolve()
        } else {
          reject(new Error('Idensic loaded but not executed'))
        }
      }
      script.onerror = (errorEvent) => {
        reject(new Error('Idensic not loaded'))
      }
      script.src = idensicPath
      document.head.appendChild(script)
    })
  }

  initIdensic() {
    // Set current values
    let config = {
      clientId: 'ovr_ai', // fixed for project
      externalUserId: this.props.externalUserId, // the one in mydatabase
      accessToken: this.props.accessToken, // the one returned from back end
    }

    window.idensic.init('#idensic-block', config, (messageType, payload) => {
      console.log('[IDENSIC]', messageType, payload)
    })
  }

  componentDidMount() {
    this.attachKycJs(this.state.idensicPath)
      .then(() => {
        this.initIdensic()
      })
      .catch((error) => console.error(error))
  }

  render() {
    return (
      <div>
        <div id="idensic-block"></div>
      </div>
    )
  }
}

export default IdensicComp
