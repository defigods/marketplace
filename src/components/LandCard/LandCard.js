
import React from 'react';
import LandName from '../LandName/LandName';
import Icon from '../Icon/Icon';
import TimeCounter from '../TimeCounter/TimeCounter';
import ovr_land from '../../assets/icons/ovr_land.svg'
import { Link } from "react-router-dom";

const LandCard = props => {

  return <Link to={`/map/land/${props.name.hex}`} className="LandCard">
          <div className="LandCard__cont">
            <Icon src={ovr_land} isSvg={true}></Icon>
            <div className="LandCard__body">
              <LandName name={props.name} location={props.location}></LandName>
              <div className="LandCard__body__footer">
                <TimeCounter time={20} signature="mins" date_end={props.date_end}></TimeCounter>
              </div>
            </div>
          </div>
          </Link>;
  }


export default LandCard