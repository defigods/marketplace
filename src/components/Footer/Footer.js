import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import OvrLogo from 'assets/img/ovr.png'

class Footer extends Component {
  render() {
    return (
      <div className="Footer">
        <div className="o-fourth">
          <div className="Footer__container">
            <Link to="/" className="Logo__footer_link">
              <div className="Footer__logo Icon">
                <img src={OvrLogo} />
              </div>
            </Link>
            <div className="Footer__copyright">Over Holding Srl © 2020</div>
          </div>
        </div>
        <div className="o-fourth">
          <div className="Footer__container --large">
            OVRGLOBAL OÜ<br></br>
            Registry Code: 14721068<br></br>
            Harju maakond, Tallinn, Kesklinna linnaosa, Roseni tn 12-85, 10111
            Estonia
          </div>
        </div>
        <div className="o-fourth">
          <div className="Footer__container">
            <div className="Footer__title">Legal</div>
            <a
              href={'https://www.ovr.ai/privacy-policy/'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Privacy policy
            </a>
          </div>
        </div>
        <div className="o-fourth">
          <div className="Footer__container">
            <div className="Footer__title">Community</div>
            <a
              href={'https://t.me/OVRtheReality'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Telegram
            </a>
            <a
              href={'https://discord.gg/g6VpgwjDSC'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Discord
            </a>
            <a
              href={'https://medium.com/ovrthereality/'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Medium
            </a>
            <a
              href={'https://www.facebook.com/OVRtheReality'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Facebook
            </a>
            <a
              href={'https://www.instagram.com/ovrplatform/'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Instagram
            </a>
            <a
              href={'https://twitter.com/OVRtheReality'}
              rel="noopener noreferrer"
              target={'_blank'}
              className="Footer__link"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default Footer
