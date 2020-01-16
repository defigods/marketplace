import React, { Component } from 'react';
import HexButton from '../HexButton/HexButton';
import TextCounter from '../TextCounter/TextCounter';
import ArrowLink from '../ArrowLink/ArrowLink';

class CtaCard extends Component {
  render() {
    return <div className="CtaCard">
              <div className="c-line">
                <TextCounter value={this.props.value} label={this.props.label} />
                <div className="c-line CtaCard__text_line">{this.props.children}</div>
              </div>
              <div className="c-line CtaCard__button_line">
                <HexButton url={this.props.button_url} text={this.props.button_text}></HexButton>
                <ArrowLink text={this.props.arrow_link_text} url={this.props.arrow_link_url}></ArrowLink>
              </div>
            </div>;
  }
}

export default CtaCard