import React, { Component } from 'react';
import Icon from '../Icon/Icon';

class ValueCounter extends Component {
    render() {
        return <div className="ValueCounter">
            <div className="ValueCounter__icon">
                <Icon alt="Transaction History" src="./assets/icons/ovr_token.svg" isSvg={true}></Icon>
            </div>
            <div className="ValueCounter__value"> {this.props.value}</div>
        </div>;
    }
}

export default ValueCounter