import React from 'react';
import { useTranslation } from 'react-i18next'
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import HexButton from '../../components/HexButton/HexButton';

import TextField from '@material-ui/core/TextField';


function PublicSale() {
	const { t, i18n } = useTranslation();
	const [tab, setTab] = React.useState('buy');
	const [transactionValue, setTransactionValue] = React.useState(0);

	const handleTabChange = (newValue) => {
			setTab(newValue);
	};

	const handleTransactionValueChange = (transactionValue) => {
			setTransactionValue(transactionValue);
	};

	const handleBuyOvr = () => {

	}
	
	return (
		<div className="PublicSale">
			<div className="o-container">
				<div className="o-section">
					<div className="s-f-curve">
						<div className="o-card">
							<div className="o-row">
								<div className="o-fourth">
									<div className="o-label">
										Buy Price
									</div>
									<div className="o-value">
										<ValueCounter value={"0.066"} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-fourth">
									<div className="o-label">
										Reserve
									</div>
									<div className="o-value">
										<ValueCounter value={"420,420,420"} currency="dai"></ValueCounter>
									</div>
								</div>
								<div className="o-fourth">
									<div className="o-label">
										Curve Issuance
									</div>
									<div className="o-value">
										<ValueCounter value={"1,000,000"}></ValueCounter>
									</div>
								</div>
								<div className="o-fourth">
									<div className="o-label">
										Total Supply
									</div>
									<div className="o-value">
										<ValueCounter value={"10,000,000"}></ValueCounter>
									</div>
								</div>
							</div>
							<div className="o-row">
								<div className="chart-js">
									TODO: Chart
								</div> 
							</div>
						</div>
					</div>
					<div className="s-f-panel">
						<div className="o-card">
							<div className="o-row">
								<div className="c-transaction-selector_cont">
									<div
										className={`c-transaction-selector ${tab == 'buy' ? '--selected' : ''}`}
										onClick={() => handleTabChange('buy')}
									>
										Buy
									</div>
									<div
										className={`c-transaction-selector ${tab == 'sell' ? '--selected' : ''}`}
										onClick={() => {handleTabChange('sell')}}
									>
										Sell
									</div>
								</div>
							</div>
							<div className="o-row o-row__your_wallet">
								<h3 class="p-section-title">Your Wallet</h3>
								<ValueCounter value={"5000.00"} currency="dai"></ValueCounter>
								<ValueCounter value={"0.00"}></ValueCounter>
							</div>
							<div className="o-line"></div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 class="o-info-title">Price</h3></div>
								<div className="o-half">0.00</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 class="o-info-title">Receive Amount</h3></div>
								<div className="o-half">0.00</div>
							</div>
							<div className="o-row o-info-row">
								<div className="o-half"><h3 class="o-info-title">Slippage</h3></div>
								<div className="o-half">0.00</div>
							</div>
							<div className="o-line"></div>
							<div className="o-row o-field-row">
								<div className="">
									<div className="Overlay__bid_title o-info-title">Buy OVR</div>
									<div>
										<TextField
											type="number"
											onChange={(e) => {
												const transactionValue = e.target.value;
												handleTransactionValueChange(transactionValue);
											}}
										/>
										<HexButton
											url="#"
											text={'Buy Now'}
											className={`--orange `}
											// ${bidValid ? '' : '--disabled'}
											onClick={() => handleBuyOvr(transactionValue)}
										></HexButton>
									</div>
								</div>
							</div>
						</div>
					</div>	
				</div>
			</div>
		</div>
	);
}

export default PublicSale;
