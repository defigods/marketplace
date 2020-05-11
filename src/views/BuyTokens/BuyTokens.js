import React, { useState, useEffect } from 'react';
import './style.scss';
import { warningNotification } from '../../lib/notifications';
import { tokenBuyAddress } from '../../lib/contracts';
import { withUserContext } from '../../context/UserContext';

/**
 * Buy tokens component
 */
const BuyTokens = context => {
	const { tokenBuy, dai, tether, usdc } = context.userProvider.state;
	const { waitTx } = context.userProvider.actions;
	const [perEth, setPerEth] = useState(0);
	const [perUsd, setPerUsd] = useState(0);
	const [tokensToBuy, setTokensToBuy] = useState(0);
	
	useEffect(() => {
		getPrices();
	}, []);

	/**
	 * Sets the number of tokens you get per ether and the number of tokens for stablecoins
	 */
	const getPrices = async () => {
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
		if (tokensToBuy <= 0) return warningNotification('Setup error', 'You must input more than 0 OVR tokens to buy');

		try {
			switch (type) {
				case 'eth':
					const value = tokensToBuy / perEth;
					const tx = await tokenBuy.buyTokensWithEthAsync({ value });
					await waitTx(tx);
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
			context.userProvider.actions.getOvrsOwned()
		} catch (e) {
			console.log('Error', e);
			warningNotification(
				'Error buying tokens',
				'There was an error processing your transaction refresh this page and try again',
			);
		}
	};

	const buyWithToken = async (token, type) => {
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
					tx = await tokenBuy.buyTokensWithDaiAsync(tokensToBuy);
					break;
				case 'usdt':
					tx = await tokenBuy.buyTokensWithUsdtAsync(tokensToBuy);
					break;
				case 'usdc':
					tx = await tokenBuy.buyTokensWithUsdcAsync(tokensToBuy);
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
			<h1>Buy OVR tokens</h1>
			<p className="BuyTokens__description">
				You can pay with ETH, Tether, USDC and DAI.
				<br />
				The current prices are:
			</p>
			<ul>
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
				className="BuyTokens__input"
				onChange={(e) => {
					// Convert tokens to wei
					setTokensToBuy(window.web3.toWei(e.target.value));
				}}
			></input>
			<button className="HexButton --blue" onClick={() => buy('eth')}>
				Buy with ETH
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
			<p>
				Note: when paying with stablecoins you will receive 2 metamask notifications, simply approve them both to
				complete the payment.
			</p>
		</div>
	);
};

export default withUserContext(BuyTokens);
