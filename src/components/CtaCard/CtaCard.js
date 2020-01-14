import React, { Component } from 'react';
import './CtaCard.scss'; 

class CtaCard extends Component {
  render() {
    return <div className="c-cta-card">{this.props.children}</div>;
  }
}

export default CtaCard