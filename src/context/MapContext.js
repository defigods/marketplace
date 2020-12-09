import React, { createContext, Component } from 'react';
import * as h3 from 'h3-js';
import _ from 'lodash';

export const MapContext = createContext();

export class MapProvider extends Component {
	constructor(props) {
		super(props);

		this.state = {
			onSingleView: false,
			hex_id: '8c81326dda43dff',
			integer_id: 632776805293768200,
			isAuction: false,
			isUserRelated: false,
			activeBidOverlay: false,
			activeMintOverlay: false,
			activeSellOverlay: false,
			activeBuyOfferOverlay: false,
			activeBuyOverlay: false,
			onMultipleLandSelection: false,
			multipleLandSelectionList: [],
			auctionList: [],
			landData: {},
		};

		this.changeHexId = this.changeHexId.bind(this);
		this.disableSingleView = this.disableSingleView.bind(this);
		this.enableMultipleLandSelection = this.enableMultipleLandSelection.bind(this);
		this.disableMultipleLandSelection = this.disableMultipleLandSelection.bind(this);
		this.changeMultipleLandSelectionList = this.changeMultipleLandSelectionList.bind(this);
		this.resetMultipleLandSelectionList = this.resetMultipleLandSelectionList.bind(this);
		this.changeAuctionList = this.changeAuctionList.bind(this);
		this.changeActiveBidOverlay = this.changeActiveBidOverlay.bind(this);
		this.changeActiveMintOverlay = this.changeActiveMintOverlay.bind(this);
		this.changeActiveSellOverlay = this.changeActiveSellOverlay.bind(this);
		this.changeActiveBuyOfferOverlay = this.changeActiveBuyOfferOverlay.bind(this);
		this.changeLandData = this.changeLandData.bind(this);
		this.changeActiveBuyOverlay = this.changeActiveBuyOverlay.bind(this);
	}

	changeHexId(hex_id) {
		// TODO change it as it could accept 3words names
		if (h3.h3IsValid(hex_id)) {
			this.setState({ onSingleView: true, hex_id: hex_id, integer_id: parseInt(hex_id, 16), isAuction: true });
		}
	}
	enableMultipleLandSelection() {
		this.setState({ onMultipleLandSelection: true });
	}
	disableMultipleLandSelection() {
		this.setState({ onMultipleLandSelection: false });
	}
	disableSingleView() {
		this.setState({ onSingleView: false });
	}
	changeLandData(landData) {
		this.setState({ landData });
	}
	changeAuctionList(list) {
		this.setState({ auctionList: list });
	}
	changeMultipleLandSelectionList(list) {
		this.setState({ multipleLandSelectionList: 	_.uniq(list) });
	}
	resetMultipleLandSelectionList(list) {
		this.setState({ multipleLandSelectionList: [] });
	}
	changeActiveBidOverlay(activeVal) {
		this.setState({ activeBidOverlay: activeVal });
	}
	changeActiveMintOverlay(activeVal) {
		this.setState({ activeMintOverlay: activeVal });
	}
	changeActiveSellOverlay(activeVal) {
		this.setState({ activeSellOverlay: activeVal });
	}
	changeActiveBuyOfferOverlay(activeVal) {
		this.setState({ activeBuyOfferOverlay: activeVal });
	}
	changeActiveBuyOverlay(activeVal) {
		this.setState({ activeBuyOverlay: activeVal });
	}

	render() {
		return (
			<MapContext.Provider
				value={{
					state: this.state,
					actions: {
						changeHexId: this.changeHexId,
						changeActiveBidOverlay: this.changeActiveBidOverlay,
						changeActiveMintOverlay: this.changeActiveMintOverlay,
						changeAuctionList: this.changeAuctionList,
						disableSingleView: this.disableSingleView,
						changeActiveSellOverlay: this.changeActiveSellOverlay,
						changeActiveBuyOfferOverlay: this.changeActiveBuyOfferOverlay,
						changeLandData: this.changeLandData,
						changeActiveBuyOverlay: this.changeActiveBuyOverlay,
						enableMultipleLandSelection: this.enableMultipleLandSelection,
						disableMultipleLandSelection: this.disableMultipleLandSelection,
						changeMultipleLandSelectionList: this.changeMultipleLandSelectionList,
						resetMultipleLandSelectionList: this.resetMultipleLandSelectionList,
					},
					overviewList: this.overviewList,
				}}
			>
				{this.props.children}
			</MapContext.Provider>
		);
	}
}

export function withMapContext(Component) {
	class ComponentWithContext extends React.Component {
		render() {
			return (
				<MapContext.Consumer>{(value) => <Component {...this.props} mapProvider={{ ...value }} />}</MapContext.Consumer>
			);
		}
	}

	return ComponentWithContext;
}
