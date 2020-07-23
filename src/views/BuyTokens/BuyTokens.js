import React, { useState, useEffect } from 'react';
import './style.scss';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import { warningNotification } from '../../lib/notifications';

const partnerName = 'ovr';
const userId = 'EXAMPLE'; // TODO CHANGE THIS

/**
 * Buy tokens component
 */
const BuyTokens = (context) => {
	const { perEth, perUsd, setupComplete } = context.web3Provider.state;
	const { getPrices, buy } = context.web3Provider.actions;
	const [tokensToBuy, setTokensToBuy] = useState(0);

	useEffect(() => {
		if (setupComplete) getPrices();
	}, [setupComplete]);

	const buyWithIndacoin = () => {
		if (tokensToBuy <= 0)
			return warningNotification("Amount can't be empty", 'You must specify an amount of OVR tokens to buy');

		const url = `https://indacoin.com/gw/payment_form?partner=${partnerName}&cur_from=USD&cur_to=INTT&amount=${window.web3.fromWei(
			tokensToBuy,
		)}&address=${window.web3.eth.accounts[0]}&user_id=${userId}`;
		window.location = url;
	};

	return (
		<div className="BuyTokens__container">
			<h1 className="full-size">Buy OVR tokens</h1>
			<p className="BuyTokens__description full-size">
				You can pay with ETH, Tether, USDC and DAI.
				<br />
				The current prices are:
			</p>
			<ul className="full-size">
				<li>
					1 ETH gives you: <b>{perEth / perUsd} OVR</b>
				</li>
				<li>
					1 Tether gives you: <b>{perUsd} OVR</b>
				</li>
				<li>
					1 USDC gives you: <b>{perUsd} OVR</b>
				</li>
				<li>
					1 DAI gives you: <b>{perUsd} OVR</b>
				</li>
			</ul>
			<input
				type="number"
				placeholder="Tokens to buy..."
				className="BuyTokens__input full-size"
				onChange={(e) => {
					// Convert tokens to wei
					setTokensToBuy(String(e.target.value));
				}}
			/>
			<button className="HexButton --blue" onClick={() => buy(tokensToBuy, 'eth')}>
				Buy with ETH
			</button>
			<button className="HexButton --blue" onClick={buyWithIndacoin}>
				Buy with Dollars
			</button>
			<button className="HexButton --blue" onClick={() => buy(tokensToBuy, 'usdt')}>
				Buy with Tether
			</button>
			<button className="HexButton --blue" onClick={() => buy(tokensToBuy, 'usdc')}>
				Buy with USDC
			</button>
			<button className="HexButton --blue" onClick={() => buy(tokensToBuy, 'dai')}>
				Buy with DAI
			</button>
			<p className="full-size">
				Note: when paying with stablecoins you will receive 2 metamask notifications, simply approve them both to
				complete the payment.
			</p>
		</div>
	);
};

export default withUserContext(withWeb3Context(BuyTokens));
