import React, { Component } from 'react';
import Icon from '../Icon/Icon';
import ovr_token from '../../assets/icons/ovr_token.svg'

class ValueCounter extends Component {
    render() {
        return <div className="ValueCounter">
            <div className="ValueCounter__icon">
                <Icon alt="Transaction History" src={ovr_token} isSvg={true}></Icon>
            </div>
            <div className="ValueCounter__value"> {this.props.value}</div>
        </div>;
    }
}

export default ValueCounter