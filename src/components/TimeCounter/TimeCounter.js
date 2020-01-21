import React, { Component } from 'react';
import Moment from 'react-moment';
// https://github.com/moment/moment/issues/537 updateLocale

class TimeCounter extends Component {

    render() {
        return <div className="TimeCounter">
            {/* <span>{this.props.time}</span>{this.props.signature} */}
            <Moment local fromNow>{this.props.date_end}</Moment>
        </div>;
    }
}

export default TimeCounter