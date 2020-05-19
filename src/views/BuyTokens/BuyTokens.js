import React, { useState, useEffect } from 'react';
import './style.scss';
import { successNotification, warningNotification, dangerNotification } from '../../lib/notifications';
import { tokenBuyAddress } from '../../lib/contracts';
import { withUserContext } from '../../context/UserContext';

// TODO Change this to the final address
const FIAT_BUY_URL = 'http://staging-credit-card.ovr.ai/buy';

/**
 * Buy tokens component
 */
const BuyTokens = (context) => {
	const { tokenBuy, dai, tether, usdc, setupComplete } = context.userProvider.state;
	const { waitTx } = context.userProvider.actions;
	const [perEth, setPerEth] = useState(0);
	const [perUsd, setPerUsd] = useState(0);
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

	const requireSetup = () => {
		if (!setupComplete) {
			warningNotification('Metamask not detected', 'You must login to metamask to use this application');
			return false;
		}
		return true;
	};

	/**
	 * Sets the number of tokens you get per ether and the number of tokens for stablecoins
	 */
	const getPrices = async () => {
		if (!requireSetup()) return;
		const receivedPerEth = Number(await tokenBuy.tokensPerEthAsync());
		const receivedPerUsd = Number(await tokenBuy.tokensPerUsdAsync());
		setPerEth(receivedPerEth);
		setPerUsd(receivedPerUsd);
	};

	/**
	 * To buy OVR ERC20 tokens from the TokenBuy contract.
	 * When buying with stablecoins, you must first approve them which is done here automatically that's why you can expect to receive 2 transaction notifications from metamask
	 * @param {String} type The type of payment chosen
	 */
	const buy = async (type) => {
		if (!requireSetup()) return;
		if (tokensToBuy <= 0) return warningNotification('Setup error', 'You must input more than 0 OVR tokens to buy');
		try {
			switch (type) {
				case 'eth':
					const value = tokensToBuy / perEth;
					const tx = await tokenBuy.buyTokensWithEthAsync({
						value,
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					await waitTx(tx);
					break;
				case 'fiat':
					await buyWithCard();
					break;
				case 'usdt':
					await buyWithToken(tether, 'usdt');
					break;
				case 'usdc':
					await buyWithToken(usdc, 'usdc');
					break;
				case 'dai':
					await buyWithToken(dai, 'dai');
					break;
				default:
					warningNotification('Error', 'The currency selected is not correct');
					break;
			}
			context.userProvider.actions.getOvrsOwned();
		} catch (e) {
			console.log('Error', e);
			warningNotification(
				'Error buying tokens',
				'There was an error processing your transaction refresh this page and try again',
			);
		}
	};

	const buyWithCard = async () => {
		// tokensToBuy
		let response;
		const dataToSend = {
			amount: window.web3.fromWei(tokensToBuy / perUsd),
			addressReceiver: window.web3.eth.defaultAccount,
			card: {
				cardNum: cardNumber,
				cardExpiry: {
					month: cardExpiryMonth,
					year: cardExpiryYear,
				},
				cvv,
			},
			billingDetails: { zip },
		};
		try {
			const request = await fetch(FIAT_BUY_URL, {
				method: 'post',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify(dataToSend),
			});
			response = await request.json();
		} catch (e) {
			return dangerNotification(
				'Error processing the payment',
				'There was an error making the credit card purchase refresh the page and try again later',
			);
		}

		if (!response) {
			return dangerNotification('Error', 'No response received from the payment server');
		} else if (!response.ok) {
			return dangerNotification('Error buying', response.msg);
		}

		successNotification('Purchase successful', 'The purchase was completed successfully. It may take between 1 and 3 minutes to see your new tokens.');
	};

	const buyWithToken = async (token, type) => {
		if (!requireSetup()) return;
		let currentBalance = await token.balanceOfAsync(window.web3.eth.defaultAccount);
		let currentAllowance = await token.allowanceAsync(window.web3.eth.defaultAccount, tokenBuyAddress);
		// Allow all the tokens
		if (currentBalance.greaterThan(currentAllowance)) {
			try {
				const response = await token.approveAsync(tokenBuyAddress, currentBalance);
				await waitTx(response);
			} catch (e) {}
		}
		// Check if the user has enough balance to buy those tokens
		if (currentBalance.lessThan(tokensToBuy)) {
			return warningNotification(
				'Not enough tokens',
				`You don't have enough to buy ${window.web3.fromWei(tokensToBuy)} OVR tokens`,
			);
		}
		try {
			let tx;
			switch (type) {
				case 'dai':
					tx = await tokenBuy.buyTokensWithDaiAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				case 'usdt':
					tx = await tokenBuy.buyTokensWithUsdtAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				case 'usdc':
					tx = await tokenBuy.buyTokensWithUsdcAsync(tokensToBuy, {
						gasPrice: window.web3.toWei(30, 'gwei'),
					});
					break;
				default:
					warningNotification('Error', 'The currency selected is not correct');
					break;
			}
			await waitTx(tx);
		} catch (e) {
			return warningNotification('Error buying', `There was an error buying your OVR tokens`);
		}
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
			<button className="HexButton --blue" onClick={() => buy('eth')}>
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
			<button className="HexButton --blue" onClick={() => buy('usdt')}>
				Buy with Tether
			</button>
			<button className="HexButton --blue" onClick={() => buy('usdc')}>
				Buy with USDC
			</button>
			<button className="HexButton --blue" onClick={() => buy('dai')}>
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
				<button className="HexButton --blue pay-with-card-button" onClick={() => buy('fiat')}>
					Buy {tokensToBuy == 0 ? '' : window.web3.fromWei(tokensToBuy)} Tokens Paying {tokensToBuy == 0 ? '' :  '$'+window.web3.fromWei(tokensToBuy / perUsd)} USD
				</button>
			</div>
		</div>
	);
};

export default withUserContext(BuyTokens);
