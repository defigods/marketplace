import React, { useState, useEffect } from 'react';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import { warningNotification } from '../../lib/notifications';
import * as moment from 'moment';
import { Link } from 'react-router-dom';

import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

import HexButton from '../../components/HexButton/HexButton';

const partnerName = 'ovr';

/**
 * Buy tokens component
 */
const BuyTokens = (context) => {
	const { perEth, perUsd, setupComplete } = context.web3Provider.state;
	const { getPrices, buy } = context.web3Provider.actions;
	const { user } = context.userProvider.state;
	const [tokensToBuy, setTokensToBuy] = useState(100);
	const [usdToSpend, setUsdToSpend] = useState(10);
	const [activeCurrency, setActiveCurrency] = useState(0);

	useEffect(() => {
		if (setupComplete) getPrices();
	}, [setupComplete]);

	const buyWithIndacoin = () => {
		if (tokensToBuy <= 0)
			return warningNotification("Amount can't be empty", 'You must specify an amount of OVR tokens to buy');
		const url = `https://indacoin.com/gw/payment_form?partner=${partnerName}&cur_from=USD&cur_to=INTT&amount=${usdToSpend}&address=${window.web3.eth.accounts[0]}&user_id=${user.uuid}`;
		window.location = url;
	};

	const selectCurrency = (currencyIndex) => {
		if (currencyIndex == 1) {
			setUsdToSpend(1);
			setTokensToBuy(perEth);
		} else {
			setUsdToSpend(10);
			setTokensToBuy(100);
		}
		setActiveCurrency(currencyIndex);
	};

	function getCurrencyContent() {
		switch (activeCurrency) {
			case 0:
				return (
					<div className="c-active-currency__cont">
						<div>
							<TextField
								id="outlined-start-adornment"
								className="c-currency-input"
								label="Buy"
								type="number"
								value={usdToSpend}
								InputProps={{
									startAdornment: <InputAdornment position="start">USD</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend(e.target.value);
									setTokensToBuy((e.target.value * perUsd * 100).toFixed(0));
								}}
								variant="outlined"
							/>
							<div className="c-active-currency__swap">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.87 44.24">
									<g data-name="Livello 2">
										<g fill="#c3c4c3" data-name="Livello 1">
											<path d="M0 6.17l7.94 6.17v-1.22c0-.55-.06-1 .5-1h20c.55 0 1.5.45 1.5 1v14h6v-22H8.44c-.56 0-.5-.45-.5-1V0zM27.44 35.12h-20c-.56 0-.5-.45-.5-1v-14h-6v22h26.5c.55 0 1.5.45 1.5 1v1.12l7.93-6.17-7.93-6.16v2.21c0 .55-.94 1-1.5 1z"></path>
										</g>
									</g>
								</svg>
							</div>
							<TextField
								label="Get"
								id="outlined-start-adornment"
								className="c-currency-input"
								value={tokensToBuy}
								type="number"
								InputProps={{
									startAdornment: <InputAdornment position="start">OVR</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend((e.target.value / perUsd / 100).toFixed(2));
									setTokensToBuy(e.target.value);
								}}
								variant="outlined"
							/>
						</div>
						<div className="c-active-currency__rate"> Exchange rate: 1 USD = {perUsd} OVR</div>
						<div className="c-active-currency__buttons">
							<HexButton url="#" text="Buy OVR" className="--orange" onClick={buyWithIndacoin}></HexButton>
							<HexButton
								url="#"
								text="Cancel"
								className="--orange-light"
								onClick={() => {
									setUsdToSpend(0);
									setTokensToBuy(0);
								}}
							></HexButton>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="c-active-currency__cont">
						<div>
							<TextField
								id="outlined-start-adornment"
								className="c-currency-input"
								label="Buy"
								type="number"
								value={usdToSpend}
								InputProps={{
									startAdornment: <InputAdornment position="start">ETH</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend(e.target.value);
									setTokensToBuy((e.target.value * perEth).toFixed(0));
								}}
								variant="outlined"
							/>
							<div className="c-active-currency__swap">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.87 44.24">
									<g data-name="Livello 2">
										<g fill="#c3c4c3" data-name="Livello 1">
											<path d="M0 6.17l7.94 6.17v-1.22c0-.55-.06-1 .5-1h20c.55 0 1.5.45 1.5 1v14h6v-22H8.44c-.56 0-.5-.45-.5-1V0zM27.44 35.12h-20c-.56 0-.5-.45-.5-1v-14h-6v22h26.5c.55 0 1.5.45 1.5 1v1.12l7.93-6.17-7.93-6.16v2.21c0 .55-.94 1-1.5 1z"></path>
										</g>
									</g>
								</svg>
							</div>
							<TextField
								label="Get"
								id="outlined-start-adornment"
								className="c-currency-input"
								value={tokensToBuy}
								type="number"
								InputProps={{
									startAdornment: <InputAdornment position="start">OVR</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend((e.target.value / perEth).toFixed(2));
									setTokensToBuy(e.target.value);
								}}
								variant="outlined"
							/>
						</div>
						<div className="c-active-currency__rate"> Exchange rate: 1 ETH = {perEth} OVR</div>
						<div className="c-active-currency__buttons">
							<HexButton
								url="#"
								text="Buy OVR"
								className="--orange"
								onClick={() => buy(tokensToBuy, 'eth')}
							></HexButton>
							<HexButton
								url="#"
								text="Cancel"
								className="--orange-light"
								onClick={() => {
									setUsdToSpend(0);
									setTokensToBuy(0);
								}}
							></HexButton>
						</div>
					</div>
				);
			case 2:
				return (
					<div className="c-active-currency__cont">
						<div>
							<TextField
								id="outlined-start-adornment"
								className="c-currency-input"
								label="Buy"
								type="number"
								value={usdToSpend}
								InputProps={{
									startAdornment: <InputAdornment position="start">DAI</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend(e.target.value);
									setTokensToBuy((e.target.value * perUsd * 100).toFixed(0));
								}}
								variant="outlined"
							/>
							<div className="c-active-currency__swap">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.87 44.24">
									<g data-name="Livello 2">
										<g fill="#c3c4c3" data-name="Livello 1">
											<path d="M0 6.17l7.94 6.17v-1.22c0-.55-.06-1 .5-1h20c.55 0 1.5.45 1.5 1v14h6v-22H8.44c-.56 0-.5-.45-.5-1V0zM27.44 35.12h-20c-.56 0-.5-.45-.5-1v-14h-6v22h26.5c.55 0 1.5.45 1.5 1v1.12l7.93-6.17-7.93-6.16v2.21c0 .55-.94 1-1.5 1z"></path>
										</g>
									</g>
								</svg>
							</div>
							<TextField
								label="Get"
								id="outlined-start-adornment"
								className="c-currency-input"
								value={tokensToBuy}
								type="number"
								InputProps={{
									startAdornment: <InputAdornment position="start">OVR</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend((e.target.value / perUsd / 100).toFixed(2));
									setTokensToBuy(e.target.value);
								}}
								variant="outlined"
							/>
						</div>
						<div className="c-active-currency__rate"> Exchange rate: 1 DAI = {perUsd} OVR</div>
						<div className="c-active-currency__buttons">
							<HexButton
								url="#"
								text="Buy OVR"
								className="--orange"
								onClick={() => buy(tokensToBuy, 'dai')}
							></HexButton>
							<HexButton
								url="#"
								text="Cancel"
								className="--orange-light"
								onClick={() => {
									setUsdToSpend(0);
									setTokensToBuy(0);
								}}
							></HexButton>
						</div>
					</div>
				);
			case 3:
				return (
					<div className="c-active-currency__cont">
						<div>
							<TextField
								id="outlined-start-adornment"
								className="c-currency-input"
								label="Buy"
								type="number"
								value={usdToSpend}
								InputProps={{
									startAdornment: <InputAdornment position="start">USDT</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend(e.target.value);
									setTokensToBuy((e.target.value * perUsd * 100).toFixed(0));
								}}
								variant="outlined"
							/>
							<div className="c-active-currency__swap">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.87 44.24">
									<g data-name="Livello 2">
										<g fill="#c3c4c3" data-name="Livello 1">
											<path d="M0 6.17l7.94 6.17v-1.22c0-.55-.06-1 .5-1h20c.55 0 1.5.45 1.5 1v14h6v-22H8.44c-.56 0-.5-.45-.5-1V0zM27.44 35.12h-20c-.56 0-.5-.45-.5-1v-14h-6v22h26.5c.55 0 1.5.45 1.5 1v1.12l7.93-6.17-7.93-6.16v2.21c0 .55-.94 1-1.5 1z"></path>
										</g>
									</g>
								</svg>
							</div>
							<TextField
								label="Get"
								id="outlined-start-adornment"
								className="c-currency-input"
								value={tokensToBuy}
								type="number"
								InputProps={{
									startAdornment: <InputAdornment position="start">OVR</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend((e.target.value / perUsd / 100).toFixed(2));
									setTokensToBuy(e.target.value);
								}}
								variant="outlined"
							/>
						</div>
						<div className="c-active-currency__rate"> Exchange rate: 1 USDT = {perUsd} OVR</div>
						<div className="c-active-currency__buttons">
							<HexButton
								url="#"
								text="Buy OVR"
								className="--orange"
								onClick={() => buy(tokensToBuy, 'usdt')}
							></HexButton>
							<HexButton
								url="#"
								text="Cancel"
								className="--orange-light"
								onClick={() => {
									setUsdToSpend(0);
									setTokensToBuy(0);
								}}
							></HexButton>
						</div>
					</div>
				);
			case 4:
				return (
					<div className="c-active-currency__cont">
						<div>
							<TextField
								id="outlined-start-adornment"
								className="c-currency-input"
								label="Buy"
								type="number"
								value={usdToSpend}
								InputProps={{
									startAdornment: <InputAdornment position="start">USDC</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend(e.target.value);
									setTokensToBuy((e.target.value * perUsd * 100).toFixed(0));
								}}
								variant="outlined"
							/>
							<div className="c-active-currency__swap">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.87 44.24">
									<g data-name="Livello 2">
										<g fill="#c3c4c3" data-name="Livello 1">
											<path d="M0 6.17l7.94 6.17v-1.22c0-.55-.06-1 .5-1h20c.55 0 1.5.45 1.5 1v14h6v-22H8.44c-.56 0-.5-.45-.5-1V0zM27.44 35.12h-20c-.56 0-.5-.45-.5-1v-14h-6v22h26.5c.55 0 1.5.45 1.5 1v1.12l7.93-6.17-7.93-6.16v2.21c0 .55-.94 1-1.5 1z"></path>
										</g>
									</g>
								</svg>
							</div>
							<TextField
								label="Get"
								id="outlined-start-adornment"
								className="c-currency-input"
								value={tokensToBuy}
								type="number"
								InputProps={{
									startAdornment: <InputAdornment position="start">OVR</InputAdornment>,
								}}
								onChange={(e) => {
									setUsdToSpend((e.target.value / perUsd / 100).toFixed(2));
									setTokensToBuy(e.target.value);
								}}
								variant="outlined"
							/>
						</div>
						<div className="c-active-currency__rate"> Exchange rate: 1 USDC = {perUsd} OVR</div>
						<div className="c-active-currency__buttons">
							<HexButton
								url="#"
								text="Buy OVR"
								className="--orange"
								onClick={() => buy(tokensToBuy, 'usdc')}
							></HexButton>
							<HexButton
								url="#"
								text="Cancel"
								className="--orange-light"
								onClick={() => {
									setUsdToSpend(0);
									setTokensToBuy(0);
								}}
							></HexButton>
						</div>
					</div>
				);
			default:
				return 'na';
		}
	}

	return (
		<div className="activity v-buy-tokens">
			<div className="o-container">
				<div className="p-header">
					<h2 className="p-header-title">Buy OVR tokens</h2>
					<span className="p-header-datetime">{moment().format('HH:mm, dddd, MMM D, YYYY')}</span>
				</div>
				<div className="sub-title--black">
					<p>
						While you can partecipate in the OVR auctions directly with other tokens, but using directly the OVR Token
						will give you the best experience. <Link to="#">Read more</Link>.
						<br />
					</p>
				</div>
				{/* <ul>
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
				</ul> */}
				<div className="sub-title--black">
					<h3>Purchase with:</h3>
				</div>
				<div className="c-currency-selector_cont">
					<div
						className={`c-currency-selector ${activeCurrency == 0 ? '--selected' : ' '}`}
						onClick={() => selectCurrency(0)}
					>
						Credit Card
					</div>
					<div
						className={`c-currency-selector ${activeCurrency == 1 ? '--selected' : ' '}`}
						onClick={() => selectCurrency(1)}
					>
						ETH
					</div>
					<div
						className={`c-currency-selector ${activeCurrency == 2 ? '--selected' : ' '}`}
						onClick={() => selectCurrency(2)}
					>
						DAI
					</div>
					<div
						className={`c-currency-selector ${activeCurrency == 3 ? '--selected' : ' '}`}
						onClick={() => selectCurrency(3)}
					>
						USDT
					</div>
					<div
						className={`c-currency-selector ${activeCurrency == 4 ? '--selected' : ' '}`}
						onClick={() => selectCurrency(4)}
					>
						USDC
					</div>
				</div>
			</div>
			<div className="o-container">{getCurrencyContent()}</div>
		</div>
	);
};

export default withUserContext(withWeb3Context(BuyTokens));
