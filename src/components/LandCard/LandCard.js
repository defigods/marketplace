import React from 'react';
import LandName from '../LandName/LandName';
import TimeCounter from '../TimeCounter/TimeCounter';
import { Link } from 'react-router-dom';

const LandCard = (props) => {
	return (
		<Link to={`/map/land/${props.name.hex}`} className="LandCard">
			<div className="LandCard__header" style={{ backgroundImage: props.background_image }}>

			</div>
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
};

export default LandCard;
