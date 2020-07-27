import React, { useEffect, useState } from 'react';
import { withUserContext } from '../../context/UserContext';
import { dangerNotification, successNotification } from '../../lib/notifications';
import * as moment from 'moment';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HexButton from '../../components/HexButton/HexButton';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

// const INDACOIN_BUY_URL = 'http://localhost:8888/indacoin';
const INDACOIN_BUY_URL = 'http://staging-credit-card.ovr.ai/indacoin';

/**
 * Indacoin response component
 */
const IndacoinResponse = (context) => {
	const [respStatus, setRespStatus] = useState(0);
	const [errorTraceback, setErrorTraceback] = useState(0);
	const [transactionId, setTransactionid] = useState(window.location.search.split('transaction_id=')[1]);

	let history = useHistory();

	useEffect(() => {
		getIndacoinPayment();
	}, []);

	function handleMarketplace() {
		history.push('map/discover');
	}

	const getIndacoinPayment = async () => {
		try {
			const req = await fetch(INDACOIN_BUY_URL, {
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
				successNotification(
					'Tokens sent successfully',
					"Your tokens have been transfered successfully you'll see your updated balance in a few minutes",
				);
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

	function respContent() {
		if (respStatus == 0) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>Transferring OVR Tokens</h2>
						<div className="Signup__section">
							<CircularProgress />
						</div>
						<div className="Signup__section">
							Please don't leave this page. <br></br>
						</div>
					</div>
				</div>
			);
		} else if (respStatus == 1) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>Congratulations</h2>
						<div className="Signup__section">
							<CheckCircleIcon className="CheckCircleIcon" />
						</div>
						<div className="Signup__section">
							You've succesfully bought some OVR.<br></br>
							Now you can go to the marketplace and partecipate.
						</div>
						<div className="Signup__section --small">
							{/* Account info are stored privately off the blockchain. <Link to="#">Read more</Link>. */}
						</div>
						<div className="Signup__section">
							<HexButton url="#" text="Go to Marketplace" className="--purple" onClick={handleMarketplace}></HexButton>
						</div>
					</div>
				</div>
			);
		} else if (respStatus == 2) {
			return (
				<div>
					<div className="o-centered-box">
						<h2>Something went wrong</h2>
						<div className="Signup__section">
							<CancelIcon className="CancelIcon" />
						</div>
						<div className="Signup__section">
							Please contact the assistance at <br></br>
							<Link to="mailto:help@ovr.ai">help@ovr.ai</Link>.
						</div>
						<br></br>
						<br></br>
						<div className="Signup__section">Error: {errorTraceback}</div>
						{transactionId != undefined && (
							<div className="Signup__section --small">Transaction ID: {transactionId}</div>
						)}
						<div className="Signup__section">
							<HexButton
								url="#"
								text="Contact Assistance"
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
					<h2 className="p-header-title">Buy OVR tokens</h2>
					<span className="p-header-datetime">{moment().format('HH:mm, dddd, MMM D, YYYY')}</span>
				</div>
				{respContent()}
			</div>
		</div>
	);
};

export default withUserContext(IndacoinResponse);
