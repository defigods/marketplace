import React, { useState, useEffect } from 'react';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import HexButton from '../../components/HexButton/HexButton';
import ValueCounter from '../../components/ValueCounter/ValueCounter';

// import OpenSellOrder from '../../components/OpenSellOrder/OpenSellOrder';
// import BuyOfferOrder from '../../components/BuyOfferOrder/BuyOfferOrder';
// import BuyLandOverlay from '../../components/BuyLandOverlay/BuyLandOverlay';

import { getLands } from '../../lib/api';
import PropTypes from 'prop-types';
import LandCard from '../../components/LandCard/LandCard';
import { useTranslation } from 'react-i18next'


// import config from '../../lib/config';

// import { ca } from 'date-fns/esm/locale';

const Lands = (props) => {
	const { t, i18n } = useTranslation();
	const { enableMultipleLandSelection, disableMultipleLandSelection } = props.mapProvider.actions;
	const { multipleLandSelectionList, gasLandCost } = props.mapProvider.state;
	const [listLands, setListLands] = useState('');
	const [gasProjection, setGasProjection] = useState(0);
	const [listLandsObj, setListLandsObj] = useState([]);
	const { getUSDValueInOvr } = props.web3Provider.actions;

	// First load
	useEffect(() => {
		enableMultipleLandSelection();
		return () => {
			disableMultipleLandSelection();
		};
	}, []);

	// On Change of list
	useEffect(() => {
		if (multipleLandSelectionList.length > 0) {
			getLands(multipleLandSelectionList.join(','))
				.then((response) => {
					setListLandsObj(response.data.lands);
					setListLands(
						response.data.lands.map((obj) => (
							<LandCard
								key={obj.hexId}
								url="/"
								value={obj.value < 100 ? getUSDValueInOvr(10) : obj.value}
								background_image={`url(${obj.mapTileUrl}`}
								name={{ sentence: obj.sentenceId, hex: obj.hexId }}
								location={obj.address.full}
								date_end={null}
								is_minimal={true}
							></LandCard>
						)),
					);
				})
				.catch((error) => {
					// console.log(error);
				});
		}
	}, [multipleLandSelectionList]);

	useEffect(() => {
		setGasProjection(gasLandCost)
	}, [gasLandCost]);

	function renderTotalEstimate() {
		let total = 0;
		listLandsObj.map((land) =>{
			console.log('land',land)
			let value = land.value < 100 ? parseFloat(getUSDValueInOvr(10)) : parseFloat(land.value)
			total = total + value
		});
		return <ValueCounter value={total} currency="ovr"></ValueCounter>
	}


	function renderLand() {
		let custom_return;
		if (multipleLandSelectionList.length > 0) {
			custom_return = (
				<div className="Lands">
					<div className="o-container">
						<div className="Land__heading__1">
							<h2>{t('Lands.selected.lands')}</h2>
							<div className="Land__location">{t('Lands.click.to.remove')}</div>
						</div>
						<div className="Land__heading__2">
							<div className="o-fourth">&nbsp;</div>
							<div className="o-fourth">
								<h3 className="o-small-title">{t('Lands.selected.label')}</h3>
								<div>{multipleLandSelectionList.length}/15</div>
							</div>
							<div className="o-fourth">&nbsp;</div>
							<div className="o-fourth">
								
							</div>
						</div>
					</div>
					<div className="o-container o-land-list__cont">
						<div className="o-land-list">{listLands}</div>
					</div>
					<div className="o-container o-land-list__total__title">
						<h2>{t('Lands.selected.checkout.title')}</h2>
					</div>
					<div className="o-container o-land-list__total">
						<div className="o-row"><span>Bidding Expense:</span> {renderTotalEstimate()}</div> <br/>
						<div className="o-row"><span>Estimated Gas Expense:</span> <ValueCounter value={gasProjection} currency="ovr"></ValueCounter> x {multipleLandSelectionList.length} = <ValueCounter value={gasProjection*multipleLandSelectionList.length} currency="ovr"></ValueCounter></div>
					</div>
				</div>
			);
		} else {
			custom_return = (
				<div className="Land">
					<div className="o-container">
						<div className="c-dialog --centered --not-found">
							<div className="c-dialog-main-title">
								<h2>{t('Lands.selected.lands')}</h2>
							</div>
							<div className="c-dialog-sub-title">
								{t('Lands.focus.land')}
							</div>
						</div>
					</div>
				</div>
			);
		}
		return custom_return;
	}

	return renderLand();
};

Lands.propTypes = {
	match: PropTypes.object,
	reloadLandStatefromApi: PropTypes.func,
	userProvider: PropTypes.object,
	mapProvider: PropTypes.object,
	web3Provider: PropTypes.object,
	land: PropTypes.object,
	className: PropTypes.string,
	url: PropTypes.string,
};

export default withWeb3Context(withUserContext(withMapContext(Lands)));
