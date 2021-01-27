import React, { useContext, useEffect, useState } from 'react';

import { getToken, removeToken, saveToken } from '../../lib/auth';
import { Trans, useTranslation } from 'react-i18next'

import { UserContext } from '../../context/UserContext';
import ValueCounter from '../../components/ValueCounter/ValueCounter';
import ArrowLink from '../../components/ArrowLink/ArrowLink';
import { useHistory, Link } from 'react-router-dom';

import Cancel from '@material-ui/icons/Cancel';

import { getCounters, getAuctionsTotals } from '../../lib/api';

/**
 * BannerCounter component
 */

const BannerCounter = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	let history = useHistory();

	const { isLoggedIn: userAuthenticated } = state;
	const [ closedAuctionCount, setClosedAuctionCount] = useState(0);
	const [ openAuctionCount, setOpenAuctionCount] = useState(0);
	const [ highestBidHexId, setHighestBidHexId] = useState(0);
	const [ highestBidWorth, setHighestBidWorth] = useState(0);
	const [ cashbackAuctionCount, setCashbackAuctionCount] = useState(0)
	

	useEffect(() => {
		setUpTotals()
	}, []);

	const setUpTotals = () => {
		getAuctionsTotals()
		.then((response) => {
			setCashbackAuctionCount(response.data.auctions.total);
		})

		getCounters()
		.then((response) => {
			setClosedAuctionCount(response.data.closedAuctionSize);
			setOpenAuctionCount(response.data.openAuctionSize); 
			setHighestBidHexId(response.data.highestBid.hexId) 
			setHighestBidWorth(parseFloat(response.data.highestBid.worth)); 
			console.log('RESPONSE',response.data)
		})
		.catch((error) => {
			// console.log(error);
			console.log('ERROR',error)
		});
	}

	return (
		<>
			<div className="BannerCounter">
				<div className="--standard">
					<div className="o-row --banner-header">
						<div className="o-one-label">
							<div className="o-label">
								{t('BannerCounter.closed.auctions')}
							</div>
							<div className="o-value">
								{closedAuctionCount}
							</div>
							{/* <div className="o-link">
								<ArrowLink text="Visit a random closed auction" url={""}></ArrowLink>
							</div> */}
							<div className="o-cashback-copy">
								{t('Cashback.banner.desc', {total:cashbackAuctionCount})}
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								{t('BannerCounter.highest.bid')}
							</div>
							<div className="o-value">
								{highestBidWorth} OVR
							</div>
							<div className="o-link">
								<ArrowLink text={t('BannerCounter.visit.ovrland')} onClick={() => {history.push('/map/land/'+highestBidHexId)}}></ArrowLink>
							</div>
						</div>
						<div className="o-one-label">
							<div className="o-label">
								{t('BannerCounter.open.auctions')}
							</div>
							<div className="o-value --big">
								{openAuctionCount}
							</div>
							{/* <div className="o-link">
								<ArrowLink text="Visit a random open auction" url={""}></ArrowLink>
							</div> */}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default BannerCounter;
