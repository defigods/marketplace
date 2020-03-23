import React, { Component } from 'react';
class ValueCounter extends Component {
    render() {
        return <div className="ValueCounter">
            <div className="ValueCounter__icon">
              <div className="Icon" >
                <svg width={18} height={20} viewBox="0 0 18 20" xmlns="http://www.w3.org/2000/svg" x="0" y="0" >
                  <defs>
                    <linearGradient x1="109.444%" y1="100%" x2="0%" y2="0%" id="prefix__a">
                      <stop stopColor="#EB663B" offset="0%" />
                      <stop stopColor="#F9B326" offset="100%" />
                    </linearGradient>
                  </defs>
                  <g
                    transform="translate(-1)"
                    stroke="url(#prefix__a)"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <path d="M18.5 5.246v9.462a2.01 2.01 0 01-1.21 1.842l-5.624 2.41-.886.38a1.984 1.984 0 01-1.56 0l-1.274-.546L2.71 16.55a2.01 2.01 0 01-1.21-1.842V5.246A2.01 2.01 0 012.721 3.4l.218-.091L9.23.656a1.973 1.973 0 011.538 0l3.974 1.674L17.279 3.4A2.01 2.01 0 0118.5 5.246z" />
                    <path d="M15.958 5.47a1.472 1.472 0 00-.62-.518l-1.86-.817-2.914-1.28a1.4 1.4 0 00-1.128 0L4.822 4.881l-.16.07a1.472 1.472 0 00-.62.517 1.582 1.582 0 00-.275.896V13.6c0 .327.099.638.273.892.153.224.363.405.614.517l3.84 1.716.934.417a1.4 1.4 0 001.144 0l.65-.29 4.124-1.843c.251-.112.461-.293.614-.517.174-.254.273-.565.273-.892V6.365c0-.329-.1-.64-.275-.896z" />
                    <path d="M6.033 10c0-2.16 1.776-3.912 3.967-3.912 2.19 0 3.967 1.752 3.967 3.912S12.19 13.912 10 13.912c-2.19 0-3.967-1.752-3.967-3.912z" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="ValueCounter__value"> {this.props.value}</div>
        </div>;
    }
}

export default ValueCounter