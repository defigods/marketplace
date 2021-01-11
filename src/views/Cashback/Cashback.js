import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';
import TermsAndConditionsOverlay from '../../components/TermsAndConditionsOverlay/TermsAndConditionsOverlay';
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';
import { getToken, removeToken, saveToken } from '../../lib/auth';

import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

import { warningNotification, successNotification } from '../../lib/notifications';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers, BigNumber, utils } from 'ethers';
import bn from 'bignumber.js';

import config from '../../lib/config';
import { isPositiveFloat } from '../../lib/config';
import { useHistory, Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';

import { getCurrentLocale } from '../../i18n';

import Tooltip from '@material-ui/core/Tooltip';
import Help from '@material-ui/icons/Help';

const mantissa = new bn(1e18);

const Cashback = () => {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('stacking');

	const userContext = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const LoginRequired = () => {
		const { t, i18n } = useTranslation();
		return (
			<div className="profile">
				<div className="o-container">
					<div className="c-dialog --centered">
						<div className="c-dialog-main-title">
							{t('Generic.login.required.title')}
							<span role="img" aria-label="Cool dude">
								😎
							</span>
						</div>
						<div className="c-dialog-sub-title">{t('Generic.login.required.desc')}</div>
					</div>
				</div>
			</div>
		);
	};

	if (!userAuthenticated) {
		return <LoginRequired t={t} />;
	} else {
		return (
			<div className="Stacking">
				<div className="o-container">
					<div className="o-section">
						<div className="o-first">
							<div className="o-card">
								<div className="o-row">
									<h3 className="p-card-title">Cashback</h3>
								</div>
								<div className="o-row">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
									dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
									aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
									dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
									officia deserunt mollit anim id est laborum.
								</div>
							</div>
						</div>
						<div className="o-second">
							<div className="o-card "></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default Cashback;
