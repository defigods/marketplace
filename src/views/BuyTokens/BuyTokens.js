import React, { useState, useEffect } from 'react';
import './style.scss';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';

/**
 * Buy tokens component
 */
const BuyTokens = (context) => {
	const { perEth, perUsd, setupComplete } = context.web3Provider.state;
	const { getPrices, buy, buyWithCard } = context.web3Provider.actions;
	const [tokensToBuy, setTokensToBuy] = useState(0);
	// Fiat variables
	const [showCardForm, setShowCardForm] = useState(false);
	const [cardNumber, setCardNumber] = useState(0);
	const [cardExpiryMonth, setCardExpiryMonth] = useState(0);
	const [cardExpiryYear, setCardExpiryYear] = useState(0);
	const [cvv, setCvv] = useState(0);
	const [zip, setZip] = useState(0);

	useEffect(() => {
		if (setupComplete) getPrices();
	}, [setupComplete]);

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
					1 ETH gives you: <b>{perEth} OVR</b>
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
					setTokensToBuy(window.web3.toWei(e.target.value));
				}}
			/>
			<button className="HexButton --blue" onClick={() => buy(tokensToBuy, 'eth')}>
				Buy with ETH
			</button>
			<button
				className="HexButton --blue"
				onClick={() => {
					setShowCardForm(!showCardForm);
				}}
			>
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

			<div className={showCardForm ? 'CardForm full-size' : 'hidden'}>
				<h2 className="card-title">Card details</h2>
				<input
					type="number"
					placeholder="Card number..."
					className="card-number"
					onChange={(e) => {
						setCardNumber(e.target.value);
					}}
				/>
				<input
					type="number"
					placeholder="Month"
					className="expiration-month"
					onChange={(e) => {
						setCardExpiryMonth(e.target.value);
					}}
				/>
				<input
					type="number"
					placeholder="Year"
					className="expiration-year"
					onChange={(e) => {
						setCardExpiryYear(e.target.value);
					}}
				/>
				<input
					type="number"
					placeholder="Cvv"
					className="cvv"
					onChange={(e) => {
						setCvv(e.target.value);
					}}
				/>
				<input
					type="number"
					placeholder="Postal code zip..."
					className="zip"
					onChange={(e) => {
						setZip(e.target.value);
					}}
				/>
				<button
					className="HexButton --blue pay-with-card-button"
					onClick={() => buyWithCard(tokensToBuy, cardNumber, cardExpiryMonth, cardExpiryYear, cvv, zip)}
				>
					Buy {tokensToBuy == 0 ? '' : window.web3.fromWei(tokensToBuy)} Tokens Paying{' '}
					{tokensToBuy == 0 ? '' : '$' + window.web3.fromWei(tokensToBuy / perUsd)} USD
				</button>
			</div>
		</div>
	);
};

export default withUserContext(withWeb3Context(BuyTokens));
