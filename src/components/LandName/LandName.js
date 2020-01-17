import React, { Component } from 'react';
import TextCounter from '../TextCounter/TextCounter';

class LandName extends Component {
    render() {
        return <div className="LandName">
            {this.props.value && (
                <TextCounter value={this.props.value} label="OVR"></TextCounter>
            )}
            <div className="LandName__name"> <span>{this.props.name.sentence}</span> </div>
            <div className="LandName__location"> {this.props.location} </div>
        </div>;
    }
}

export default LandName