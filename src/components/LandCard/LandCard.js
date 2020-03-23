
import React from 'react';
import LandName from '../LandName/LandName';
import TimeCounter from '../TimeCounter/TimeCounter';
import { Link } from "react-router-dom";

const LandCard = props => {

  return <Link to={`/map/land/${props.name.hex}`} className="LandCard">
          <div className="LandCard__cont">
            <div className="Icon">
              <svg version="1.1" id="Livello_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 80 80"><g id="Symbols"><g id="icons_x2F_ovr_x5F_token_x5F_icon" transform="translate(-1)"><g id="Group-7" transform="translate(1.5 .5)"><path id="Stroke-1" className="ola0" d="M75.2 20.1v38.8c0 1.8-.6 3.4-1.5 4.8-.9 1.2-2 2.2-3.4 2.8l-23.1 9.9-3.6 1.6c-1 .4-2.1.7-3.2.7s-2.2-.2-3.2-.7L32 75.8l-21.5-9.2C9.1 66 7.9 65 7.1 63.8c-1-1.4-1.5-3-1.5-4.8V20.1c0-1.8.6-3.4 1.5-4.8.9-1.2 2-2.2 3.5-2.8l.9-.4L37.2 1.2c1-.4 2.1-.6 3.2-.6s2.1.2 3.2.6l16.3 6.9 10.4 4.4c1.4.6 2.6 1.6 3.5 2.8.8 1.3 1.4 3 1.4 4.8z" /><path id="Stroke-3" className="ola0" d="M64.8 21c-.6-.9-1.5-1.7-2.5-2.1l-7.6-3.4-11.9-5.3c-.7-.3-1.5-.5-2.3-.5-.8 0-1.6.2-2.3.5l-18.9 8.3-.7.3c-1 .5-1.9 1.2-2.5 2.1-.7 1-1.1 2.3-1.1 3.7v29.7c0 1.3.4 2.6 1.1 3.7.6.9 1.5 1.7 2.5 2.1l15.7 7 3.8 1.7c.7.3 1.5.5 2.3.5.8 0 1.6-.2 2.3-.5l2.7-1.2L62.3 60c1-.5 1.9-1.2 2.5-2.1.7-1 1.1-2.3 1.1-3.7V24.6c0-1.3-.4-2.6-1.1-3.6z" /><path id="Stroke-5" d="M24.1 39.5c0-8.9 7.3-16 16.3-16s16.3 7.2 16.3 16c0 8.9-7.3 16-16.3 16-9 .1-16.3-7.1-16.3-16z" fill="#d6cce2" /></g></g></g></svg>
            </div>
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