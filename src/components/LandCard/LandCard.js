import React from 'react'
import LandName from '../LandName/LandName'
import TimeCounter from '../TimeCounter/TimeCounter'
import ValueCounter from '../ValueCounter/ValueCounter'
import { Link } from 'react-router-dom'
import { Textfit } from 'react-textfit'
import Blockies from 'react-blockies'

const LandCard = (props) => {
  console.debug('LandCard.props', props)
  let card
  if (props.is_minimal) {
    card = (
      <div className="LandCard --minimal">
        <div className="LandCard__cont">
          <div className="LandCard__body">
            <div className="LandName">
              <div className="LandName__name">
                <Textfit mode="single" max={14}>
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
    )
  } else {
    card = (
      <Link to={`/map/land/${props.name.hex}`} className="LandCard">
        <div
          className="LandCard__header"
          style={{ backgroundImage: props.background_image }}
        >
          <div className="LandCard__art_holder">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
              <g data-name="Livello 2">
                <path
                  fill="#fff"
                  stroke="#fff"
                  strokeMiterlimit="10"
                  d="M100.5.5a100 100 0 10100 100 100 100 0 00-100-100zM150 127.8a11.5 11.5 0 01-2.16 6.77h-.09a11.32 11.32 0 01-4.86 3.89l-32.76 14-5.16 2.2a11.5 11.5 0 01-9.06 0l-7.41-3.17L58 138.42a11.59 11.59 0 01-4.87-3.89 11.8 11.8 0 01-2.13-6.77V73a11.6 11.6 0 017.11-10.67l1.27-.55 36.7-15.36a11.43 11.43 0 014.44-.89 11.86 11.86 0 014.49.89l23.15 9.69L143 62.28a11.42 11.42 0 014.91 3.9A11.29 11.29 0 01150 73z"
                  data-name="Livello 1"
                ></path>
              </g>
            </svg>
            <Blockies
              seed={props.name.hex}
              size={15}
              scale={4}
              color="#D160A0"
              bgColor="#3B4797"
              spotColor="#54C3EA"
            />
          </div>
        </div>
        <div className="LandCard__cont">
          <div className="LandCard__body">
            <LandName name={props.name} location={props.location}></LandName>
            <div className="LandCard__body__footer">
              <TimeCounter
                time={20}
                signature="mins"
                date_end={props.date_end}
              ></TimeCounter>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return card
}

export default LandCard
