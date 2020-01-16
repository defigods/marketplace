import React, { Component } from 'react';
import { Link } from "react-router-dom";

class ArrowLink extends Component {
    render() {
        return <div className="ArrowLink">
            <Link className="ArrowLink__text" to={this.props.url}>{this.props.text} <span>→</span></Link>
        </div>;
    }
}

export default ArrowLink