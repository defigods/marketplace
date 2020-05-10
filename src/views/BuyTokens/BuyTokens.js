import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './style.scss';
import { warningNotification } from '../../lib/notifications';
import { promisifyAll } from 'bluebird';
import tokenBuyABI from './BuyTokensABI';
import erc20ABI from './ERC20ABI';

// TODO change this for the final addresses
const tokenBuyAddress = '0x33cB0Ff65DBc2a1F17C0c384C6435A771660Bf85';
const daiAddress = '0x903c80Cb9723D0249CfBA48b863F328Fb589Cbf2';
const tetherAddress = '0xa4c776E0f082e5E0589620F8A0cEF7b2b3bD8f6E';
const usdcAddress = '0x0f83ee6BfAb643b4A1a0024f3413e56801a2Fb84';

const promisify = (inner) =>
	new Promise((resolve, reject) =>
		inner((err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		}),
	);

/**
 * Buy tokens component
 */
const BuyTokens = () => {
	const [tokenBuy, setTokenBuy] = useState(null);
	const [dai, setDai] = useState(null);
	const [tether, setTether] = useState(null);
	const [usdc, setUsdc] = useState(null);
	const [perEth, setPerEth] = useState(0);
	const [perUsd, setPerUsd] = useState(0);
	const [tokensToBuy, setTokensToBuy] = useState(0);

	useEffect(() => {
		setupWeb3();
	}, []);

	useEffect(() => {
		if (tokenBuy) getPrices();
	}, [tokenBuy]);

	// Note: the web3 version is always 0.20.7 because of metamask
	const setupWeb3 = async () => {
		const ethereum = window.ethereum;
		if (typeof ethereum !== 'undefined') {
			try {
				await ethereum.enable();
			} catch (e) {
				warningNotification('Metamask permission error', 'You must accept the connection request to continue');
			}
			window.web3 = new Web3(ethereum);
		} else if (typeof window.web3 !== 'undefined') {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			warningNotification('Metamask not detected', 'You must login to metamask to use this application');
		}
		window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
		setupContracts();
	};

	const setupContracts = () => {
		const _dai = window.web3.eth.contract(erc20ABI).at(daiAddress);
		setDai(promisifyAll(_dai));
		const _tether = window.web3.eth.contract(erc20ABI).at(tetherAddress);
		setTether(promisifyAll(_tether));
		const _usdc = window.web3.eth.contract(erc20ABI).at(usdcAddress);
		setUsdc(promisifyAll(_usdc));
		const contract = window.web3.eth.contract(tokenBuyABI).at(tokenBuyAddress);
		setTokenBuy(promisifyAll(contract));
	};

	const waitTx = (txHash) => {
		return new Promise((resolve, reject) => {
			let blockCounter = 2;
			// Wait for tx to be finished
			let filter = window.web3.eth.filter('latest').watch(async (err, blockHash) => {
				if (err) {
					filter.stopWatching();
					filter = null;
					return reject(err);
				}
				// Get info about latest Ethereum block
				const block = await promisify((cb) => window.web3.eth.getBlock(blockHash, cb));
				--blockCounter;
				// Found tx hash?
				if (block.transactions.indexOf(txHash) > -1) {
					// Tx is finished
					filter.stopWatching();
					filter = null;
					return resolve();
					// Tx hash not found yet?
				}
			});
		});
	};

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
					await tokenBuy.buyTokensWithEthAsync({ value });
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
			}
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

export default BuyTokens;
