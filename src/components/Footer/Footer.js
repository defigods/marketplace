import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Icon from '../Icon/Icon';
import logo_footer from '../../assets/icons/logo_ovr_white.svg'

class Footer extends Component {

    render() {
        return <div className="Footer">
            <div className="o-fourth">
                <div className="Footer__container">
                    <Link to="/" className="Logo__footer_link"><Icon src={logo_footer} className='Footer__logo' isSvg={true}></Icon></Link>
                    <div className="Footer__copyright">Over Holding Srl © 2020</div>
                </div>
            </div>
            <div className="o-fourth">
                <div className="Footer__container --large">
                    Over Holding Srl <br></br>
                    Viale Tricesimo n. 200<br></br>
                    33100 Udine - Italy<br></br>
                    Vat no. IT02945890305
                </div>
            </div>
            <div className="o-fourth">
                <div className="Footer__container">
                    <div className="Footer__title">Legal</div>
                    <Link to="/" className="Footer_link">Terms of Service</Link>
                    <Link to="/" className="Footer_link">Privacy</Link>
                </div>
            </div>
            <div className="o-fourth">
                <div className="Footer__container">
                    <div className="Footer__title">Community</div>
                    <Link to="/" className="Footer_link">Telegram</Link>
                    <Link to="/" className="Footer_link">Medium</Link>
                    <Link to="/" className="Footer_link">Facebook</Link>
                </div>
            </div>
        </div>;
    }
}

export default Footer