import React from 'react'
import * as R from 'ramda'
import { Link } from 'react-router-dom'

import OvrLogo from 'assets/img/ovr.png'

const Footer = () => {
  const socials = [
    { name: 'Telegram', url: 'https://t.me/OVRtheReality' },
    { name: 'Discord', url: 'https://discord.gg/g6VpgwjDSC' },
    { name: 'Medium', url: 'https://medium.com/ovrthereality/' },
    { name: 'Facebook', url: 'https://www.facebook.com/OVRtheReality' },
    { name: 'Instagram', url: 'https://www.instagram.com/ovrplatform/' },
    { name: 'Twitter', url: 'https://twitter.com/OVRtheReality' },
  ]

  return (
    <div className="ovr-footer">
      <div className="o-container">
        <div className="o-fourth">
          <Link to="/" className="Logo__footer_link">
            <div className="footer-logo">
              <img src={OvrLogo} />
            </div>
          </Link>
        </div>
        <div className="o-fourth">
          <span className="ovr-footer-title">OVRGLOBAL OÜ</span>
          <p>
            Registry Code: 14721068<br></br>
            Harju maakond, Tallinn, Kesklinna linnaosa, Roseni tn 12-85, 10111
          </p>
        </div>

        <div className="o-fourth legal">
          <span className="ovr-footer-title">Legal</span>
          <a
            href={'https://www.ovr.ai/privacy-policy/'}
            rel="noopener noreferrer"
            target={'_blank'}
            className="ovr-footer-link"
          >
            Privacy policy
          </a>
          <p>
            OVR is regulated by the Estonian Financial Intelligence Unit and has
            a valid virtual currency services license FVT000345
          </p>
        </div>

        <div className="o-fourth">
          <span className="ovr-footer-title">Community</span>
          <ul>
            {R.map((single) => (
              <li key={single.name}>
                <a
                  href={single.url}
                  rel="noopener noreferrer"
                  target={'_blank'}
                >
                  {single.name}
                </a>
              </li>
            ))(socials)}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Footer
