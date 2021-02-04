/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { withUserContext } from 'context/UserContext';
import * as moment from 'moment';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HexButton from 'components/HexButton/HexButton';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import config from 'lib/config';
import { Trans, useTranslation } from 'react-i18next';

/**
 * Indacoin response component
 */
const IndacoinResponse = () => {
	const { t, i18n } = useTranslation();

	const [respStatus, setRespStatus] = useState(0);
	const [errorTraceback, setErrorTraceback] = useState(0);
	const [transactionId] = useState(window.location.search.split('transaction_id=')[1]);

	let history = useHistory();

	const getIndacoinPayment = async () => {
		try {
			const req = await fetch(config.apis.indacoinHelperApi, {
				method: 'post',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					transactionId,
				}),
			});
			const res = await req.json();
			if (res.ok) {
				setRespStatus(1);
			} else {
				setRespStatus(2);
				setErrorTraceback(res.msg);
			}
		} catch (e) {
			setRespStatus(2);
			setErrorTraceback(e);
		}
	};

	useEffect(() => {
		getIndacoinPayment();
	}, []);

	function handleMarketplace() {
		history.push('map/discover');
	}

	function respContent() {
		if (respStatus == 0) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>{t('IndacoinResponse.trans.token')}</h2>
						<div className="Signup__section">
							<CircularProgress />
						</div>
						<div className="Signup__section">
							{t('IndacoinResponse.no.leave')} <br></br>
						</div>
					</div>
				</div>
			);
		} else if (respStatus == 1) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>{t('Generic.congrats.label')}</h2>
						<div className="Signup__section">
							<CheckCircleIcon className="CheckCircleIcon" />
						</div>
						<div className="Signup__section">
							<Trans i18nKey="IndacoinResponse.success.bought">
								You've succesfully bought some OVR.<br></br>
								Now you can go to the marketplace and partecipate.
							</Trans>
						</div>
						<div className="Signup__section --small">
							{/* Account info are stored privately off the blockchain. <Link to="#">Read more</Link>. */}
						</div>
						<div className="Signup__section">
							<HexButton
								url="#"
								text={t('IndacoinResponse.to.mrktplace')}
								className="--purple"
								onClick={handleMarketplace}
							></HexButton>
						</div>
					</div>
				</div>
			);
		} else if (respStatus == 2) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>{t('IndacoinResponse.something.wrong')}</h2>
						<div className="Signup__section">
							<CancelIcon className="CancelIcon" />
						</div>
						<div className="Signup__section">
							{t('IndacoinResponse.contact.assistance')} <br></br>
							<Link to="mailto:help@ovr.ai">help@ovr.ai</Link>.
						</div>
						<br></br>
						<br></br>
						<div className="Signup__section">
							{t('IndacoinResponse.error.label')}: {errorTraceback}
						</div>
						{transactionId != undefined && (
							<div className="Signup__section --small">
								{t('IndacoinResponse.transaction.id')}: {transactionId}
							</div>
						)}
						<div className="Signup__section">
							<HexButton
								url="#"
								text={t('IndacoinResponse.assistance.label')}
								className="--purple"
								onClick={() => {
									window.location = 'mailto:help@ovr.ai';
								}}
							></HexButton>
						</div>
					</div>
				</div>
			);
		}
	}

	return (
		<div className="activity v-buy-tokens">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">{t('IndacoinResponse.buy.tokens')}</h2>
					<span className="p-header-datetime">{moment().format('HH:mm, dddd, MMM D, YYYY')}</span>
				</div>
				{respContent()}
			</div>
		</div>
	);
};

export default withUserContext(IndacoinResponse);
