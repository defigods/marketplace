import React, { Component } from 'react';
import HexButton from '../HexButton/HexButton';
import TextCounter from '../TextCounter/TextCounter';
import ArrowLink from '../ArrowLink/ArrowLink';
import Icon from '../Icon/Icon';

class CtaCard extends Component {
  render() {
    return <div className="CtaCard">
              <div className="o-line--in">
                <div className="c-two-third">
                  <TextCounter value={this.props.counter.value} label={this.props.counter.label} />
                  <div className="o-line CtaCard__text_line">{this.props.children}</div>
                </div>
                <div className="c-one-third">
                  <Icon src={this.props.icon.url} isSvg={this.props.icon.isSvg}></Icon>
                </div>
              </div>
              <div className="o-line CtaCard__button_line">
                <HexButton url={this.props.button.url} text={this.props.button.text}></HexButton>
                <ArrowLink text={this.props.arrow_link.text} url={this.props.arrow_link.url}></ArrowLink>
              </div>
            </div>;
  }
}

export default CtaCard