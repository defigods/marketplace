import React, { Component } from 'react';

class TextCounter extends Component {
	render() {
		return (
			<div className="TextCounter">
				<div className="TextCounter__text"> {this.props.value} </div>
				<div className="TextCounter__label"> {this.props.label} </div>
			</div>
		);
	}
}

export default TextCounter;
