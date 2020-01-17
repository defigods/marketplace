import React, { Component } from 'react';

class TimeCounter extends Component {
    render() {
        return <div className="TimeCounter">
            <span>{this.props.time}</span>{this.props.signature}
        </div>;
    }
}

export default TimeCounter