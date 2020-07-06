import React, { useEffect } from 'react';
import './style.scss';
import { withUserContext } from '../../context/UserContext';
import { dangerNotification, successNotification } from '../../lib/notifications';

// const INDACOIN_BUY_URL = 'http://localhost:8888/indacoin';
const INDACOIN_BUY_URL = 'http://staging-credit-card.ovr.ai/indacoin';

/**
 * Indacoin response component
 */
const IndacoinResponse = (context) => {
	useEffect(() => {
		getIndacoinPayment();
	}, []);

	const getIndacoinPayment = async () => {
		const transactionId = window.location.search.split('transaction_id=')[1];

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
			} else {
				dangerNotification('Tokens not sent', res.msg);
			}
		} catch (e) {
			console.log('error', e);
		}
	};

	return (
		<div className="BuyTokens__container">
			<h1 className="full-size">Indacoin OVR tokens</h1>
			<p>Processing your token transfer...</p>
		</div>
	);
};

export default withUserContext(IndacoinResponse);
