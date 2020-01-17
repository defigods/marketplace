import React, { Component } from 'react';
import { ReactSVG } from 'react-svg'

class Icon extends Component {

    render() {
        const isSVG = this.props.isSvg;
        let icon;

        if (isSVG === true ) {
            icon = <ReactSVG className="Icon" alt={this.props.alt} src={this.props.src} />
        } else {
            icon = <img className="Icon" alt={this.props.alt} src={this.props.src}></img>
        }

        return <div className="Icon">
            {icon}
        </div>;
    }
}

export default Icon
