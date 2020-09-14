import React from 'react';
import LandName from '../LandName/LandName';
import TimeCounter from '../TimeCounter/TimeCounter';
import ValueCounter from '../ValueCounter/ValueCounter';
import { Link } from 'react-router-dom';
import { Textfit } from 'react-textfit';

const LandCard = (props) => {
	let card;
	console.log('props land card', props)
	if (props.is_minimal) {
		card = (
			<div className="LandCard --minimal">
				<div className="LandCard__cont">
					<div className="LandCard__body">
						<div className="LandName">
							<div className="LandName__name">
								<Textfit mode="single" max={17}>
									{props.name.sentence}
								</Textfit>
							</div>
						</div>
						<div className="LandCard__body__footer">
							<ValueCounter value={props.value}></ValueCounter>
						</div>
					</div>
				</div>
			</div>
		);
	} else {
		card = (
			<Link to={`/map/land/${props.name.hex}`} className="LandCard">
				<div className="LandCard__header" style={{ backgroundImage: props.background_image }}></div>
				<div className="LandCard__cont">
					<div className="LandCard__body">
						<LandName name={props.name} location={props.location}></LandName>
						<div className="LandCard__body__footer">
							<TimeCounter time={20} signature="mins" date_end={props.date_end}></TimeCounter>
						</div>
					</div>
				</div>
			</Link>
		);
	}

	return card;
};

export default LandCard;
