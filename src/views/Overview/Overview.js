import React, { useState, useEffect, useContext } from 'react';
import './style.scss';
import { MapContext } from '../../context/MapContext';
import { UserContext } from '../../context/UserContext';

import AuctionCard from '../../components/AuctionCard/AuctionCard';
import LandCard from '../../components/LandCard/LandCard';

import { indexMyOpenAuctions, indexMyLands } from '../../lib/api';
import { networkError } from '../../lib/notifications';
import Pagination from '@material-ui/lab/Pagination';
import {Trans, useTranslation } from 'react-i18next'

const Overview = () => {
	const { t, i18n } = useTranslation();
	const [listAuctions, setListAuctions] = useState('');
	const [numberOfAuctionPages, setNumberOfAuctionPages] = useState(0);
	const [currentAuctionPage, setCurrentAuctionPage] = useState(1);

	const [listLands, setListLands] = useState('');
	const [numberOfLandPages, setNumberOfLandPages] = useState(0);
	const [currentLandPage, setCurrentLandPage] = useState(1);
	const [userAuthenticated, setUserAuthenticated] = useState(true);

	const { actions: mapActions } = useContext(MapContext);
	const { state: userState } = useContext(UserContext);

	function loadAuctionsByPage(page) {
		// Call API function
		indexMyOpenAuctions(null, page)
			.then((response) => {
				console.log(response);
				if (response.data.result === true) {
					// Load Auctions in MapContext
					mapActions.changeAuctionList(response.data.auctions);

					if (response.data.auctions.length > 0) {
						// Load user data in context store
						setListAuctions(
							response.data.auctions.map((obj) => (
								<AuctionCard
									key={obj.land.hexId}
									value={obj.land.auction.currentWorth}
									background_image={`url(${obj.land.mapTileUrl}`}
									name={{ sentence: obj.land.sentenceId, hex: obj.land.hexId }}
									location={obj.land.address.full}
									market_status={obj.land.marketStatus}
									user_perspective={obj.land.userPerspective}
									date_end={obj.land.auction.closeAt}
								/>
							)),
						);
						setNumberOfAuctionPages(response.data.numberOfPages);
					} else {
						setListAuctions(
							<div className="c-dialog --centered">
								<div className="c-dialog-main-title">
									<Trans i18nKey="Overview.no.auctions.open">
										There is currently no <div className="c-status-badge">OPEN</div> auction
									</Trans>{' '}⚡️
								</div>
								<div className="c-dialog-sub-title">
									{t('Overview.browse.ovr.lands')}
								</div>
							</div>,
						);
					}
				} else {
					setUserAuthenticated(false);
				}
			})
			.catch((error) => {
				// Notify user if network error
				console.error(error);
				console.log("NetworkErrorCode: 1232555")
				networkError();
			});
	}

	function loadLandsByPage(page) {
		// Call API function
		indexMyLands(null, page)
			.then((response) => {
				if (response.data.result === true) {
					// Load Lands in MapContext
					if (response.data.lands.length > 0) {
						// Load user data in context store
						setListLands(
							response.data.lands.map((obj) => (
								<LandCard
									key={obj.hexId}
									url="/"
									value={obj.currentWorth}
									background_image={`url(${obj.mapTileUrl}`}
									name={{ sentence: obj.sentenceId, hex: obj.hexId }}
									location={obj.address.full}
									icon={{ url: './assets/icons/icon_deal.png', isSvg: false }}
									date_end={obj.auction.closeAt}
								></LandCard>
							)),
						);
						setNumberOfLandPages(response.data.numberOfPages);
					} else {
						setListLands(
							<div className="c-dialog --centered">
								<div className="c-dialog-main-title">{t('Overview.no.lands')}</div>
								<div className="c-dialog-sub-title">{t('Overview.browse.lands')}</div>
							</div>,
						);
					}
				}
			})
			.catch((error) => {
				// Notify user if network error
				console.error(error);
				console.log("NetworkErrorCode: 1232232")
				networkError();
			});
	}

	function handleAuctionPageClick(event, number) {
		loadAuctionsByPage(number);
		setCurrentAuctionPage(number);
	}

	function handleLandPageClick(event, number) {
		loadLandsByPage(number);
		setCurrentLandPage(number);
	}

	function loadWeb3Transactions() {
		if (userState.ico) {
			// let trans = window.web3.eth.getBlock('pending').transactions;
			// console.log(trans);

			// window.addEventListener('load', async () => {
			// 	let trans = await window.web3.eth.getBlock('pending', function (err, transactionHash) {
			// 		if (!err) {
			// 			console.log(transactionHash);
			// 		}
			// 	});
			// });
			// BEST
			// console.log('window.ethereum.networkVersion', window.ethereum.networkVersion)
			// let userAddress = window.web3.eth.defaultAccount;
			// console.log(userAddress);
			// window.web3.eth.getTransactionCount(userAddress, (err, txCount) => {
			// 	console.log('txCount', txCount);
			// 	let n = txCount;
			// 	window.web3.eth.getBlockNumber((err, currentBlock) => {
			// 		console.log('error', err);
			// 		console.log('currentBlock', currentBlock);
			// 		window.web3.eth.getBalance(userAddress, currentBlock, (err, balance) => {
			// 			console.log('balance', balance);
			// 			let bal = userState.ovrsOwned;
			// 			console.log('bal', bal);
			// 			console.log('bal', bal > 0);
			// 			for (var i = currentBlock; i >= currentBlock - 5 && (n > 0 || bal > 0); --i) {
			// 				window.web3.eth.getBlock(i, true, (err, block) => {
			// 					// console.log('block', block)
			// 					if (block && block.transactions) {
			// 						block.transactions.forEach(function (e) {
			// 							// console.log('userAddress ->', userAddress);
			// 							// console.log('e.from ->', e.from);
			// 							if (userAddress == e.from) {
			// 								console.log('transaction from', e);
			// 								if (e.from != e.to) bal = bal.plus(e.value);
			// 								console.log(i, e.from, e.to, e.value.toString(10));
			// 								--n;
			// 							}
			// 							if (userAddress == e.to) {
			// 								console.log('transaction to', e);
			// 								if (e.from != e.to) bal = bal.minus(e.value);
			// 								console.log(i, e.from, e.to, e.value.toString(10));
			// 							}
			// 						});
			// 					}
			// 				});
			// 			}
			// 		});
			// 	});
			// });

			// console.log('window.web3.eth', window.web3.eth)

			// console.log('currentBlock',currentBlock)
			// var n = txCount
			// var bal = window.web3.eth.getBalance(userAddress, currentBlock);
			// for (var i = currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {
			// 	try {
			// 		var block = window.web3.eth.getBlock(i, true);
			// 		if (block && block.transactions) {
			// 			block.transactions.forEach(function (e) {
			// 				if (userAddress == e.from) {
			// 					if (e.from != e.to) bal = bal.plus(e.value);
			// 					console.log(i, e.from, e.to, e.value.toString(10));
			// 					--n;
			// 				}
			// 				if (userAddress == e.to) {
			// 					if (e.from != e.to) bal = bal.minus(e.value);
			// 					console.log(i, e.from, e.to, e.value.toString(10));
			// 				}
			// 			});
			// 		}
			// 	} catch (e) {
			// 		console.error('Error in block ' + i, e);
			// 	}
			// }
		}
		// getTransactionsByAccount(eth.accounts[0])
		// window.web3.eth.getPendingTransactions().then(console.log);
	}

	useEffect(() => {
		mapActions.disableSingleView();
		loadAuctionsByPage();
		loadLandsByPage();
		loadWeb3Transactions();
	}, [userState.ico, userState.ovrsOwned]);

	let customReturn;

	if (userAuthenticated) {
		customReturn = (
			<div className="Overview">
				<div className="o-container">
					<h2 className="o-section-title">{t('Overview.auctions.label')}</h2>
				</div>
				<div className="o-container">
					<div className="o-auction-list">{listAuctions}</div>
					<div className="o-pagination">
						{numberOfAuctionPages > 1 && (
							<Pagination count={numberOfAuctionPages} page={currentAuctionPage} onChange={handleAuctionPageClick} />
						)}
					</div>
				</div>
				<div className="o-container">
					<h2 className="o-section-title">{t('Overview.my.ovrlands')}</h2>
				</div>
				<div className="o-container">
					<div className="o-land-list">{listLands}</div>
					<div className="o-pagination">
						{numberOfLandPages > 1 && (
							<Pagination count={numberOfLandPages} page={currentLandPage} onChange={handleLandPageClick} />
						)}
					</div>
				</div>
			</div>
		);
	} else {
		customReturn = (
			<div className="Overview">
				<div className="o-container">
					<div className="c-dialog --centered">
						<div className="c-dialog-main-title">
							{t('Overview.login.required')}
							<span role="img" aria-label="Cool dude">
								😎
							</span>
						</div>
						<div className="c-dialog-sub-title">{t('Overview.login.to.browse')}</div>
					</div>
				</div>
			</div>
		);
	}

	return customReturn;
};

export default Overview;
