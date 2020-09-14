import React, { useState, useEffect } from 'react';
import { withMapContext } from '../../context/MapContext';
import { withUserContext } from '../../context/UserContext';
import { withWeb3Context } from '../../context/Web3Context';
import HexButton from '../../components/HexButton/HexButton';

// import OpenSellOrder from '../../components/OpenSellOrder/OpenSellOrder';
// import BuyOfferOrder from '../../components/BuyOfferOrder/BuyOfferOrder';
// import BuyLandOverlay from '../../components/BuyLandOverlay/BuyLandOverlay';

import { getLands } from '../../lib/api';
import PropTypes from 'prop-types';
import LandCard from '../../components/LandCard/LandCard';

// import config from '../../lib/config';

// import { ca } from 'date-fns/esm/locale';

const Lands = (props) => {
	const { enableMultipleLandSelection, disableMultipleLandSelection } = props.mapProvider.actions;
	const { multipleLandSelectionList } = props.mapProvider.state;
	const [listLands, setListLands] = useState('');

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
					setListLands(
						response.data.lands.map((obj) => (
							<LandCard
								key={obj.hexId}
								url="/"
								value={obj.value}
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
					console.log(error);
				});
		}
	}, [multipleLandSelectionList]);

	function renderLand() {
		let custom_return;
		if (multipleLandSelectionList.length > 0) {
			custom_return = (
				<div className="Lands">
					<div className="o-container">
						<div className="Land__heading__1">
							<h2>Selected Lands</h2>
							<div className="Land__location">Click again on a selected land to remove</div>
						</div>
						<div className="Land__heading__2">
							<div className="o-fourth">&nbsp;</div>
							<div className="o-fourth">
								<h3 className="o-small-title">Selected</h3>
								<div>{multipleLandSelectionList.length}/15</div>
							</div>
							<div className="o-fourth">&nbsp;</div>
							<div className="o-fourth">
								<HexButton url="/" text="Bid selection" className="--blue" onClick={(e) => console.log(e)}></HexButton>
							</div>
						</div>
					</div>
					<div className="o-container o-land-list__cont">
						<div className="o-land-list">{listLands}</div>
					</div>
				</div>
			);
		} else {
			custom_return = (
				<div className="Land">
					<div className="o-container">
						<div className="c-dialog --centered --not-found">
							<div className="c-dialog-main-title">
								<h2>Select lands</h2>
							</div>
							<div className="c-dialog-sub-title">
								Click anywhere on the map to focus on a land, click again to add in your bidding list
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
