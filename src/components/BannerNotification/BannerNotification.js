import React, { useContext, useEffect, useState } from 'react';

import { getToken, removeToken, saveToken } from '../../lib/auth';
import { Trans, useTranslation } from 'react-i18next'

import { UserContext } from '../../context/UserContext';
import Cancel from '@material-ui/icons/Cancel';

import { getAuctionsTotals } from '../../lib/api';

/**
 * BannerNotification component
 */

const BannerNotification = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;
	const [ showBanner, setShowBanner ] = useState(false)
	const [ total, setTotal] = useState(0)
	

	useEffect(() => {
		if (userAuthenticated) {
			let cookie = getToken('dismissBanner')
			console.log('window.location.pathname.',window.location.pathname)
			if ( !cookie ){
				setUpTotals();
			}
		}
	}, [userAuthenticated]);

	const dismissBanner = (e) => {
		e.preventDefault();
		saveToken('dismissBanner', true)
		setShowBanner(false)
	}

	const setUpTotals = () => {
		console.log('total')
		getAuctionsTotals()
		.then((response) => {
			setTotal(response.data.auctions.total);
			setShowBanner(true);
			console.log('RESPONSE',response)
		})
		.catch((error) => {
			// console.log(error);
			console.log('ERROR',error)
		});
	}

	return (
		<>
			{showBanner && (
				<div className="BannerNotification">
					<div className="--standard">
						{/* <div className="BannerNotification__title">{t('BannerNotification.welcome')}{' '}🥳</div> */}
						<div className="BannerNotification__content">
							{t('Cashback.banner.desc', {total:total})}
							<span onClick={(e) => dismissBanner(e)}>
								<Cancel className="Cancel" />
							</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BannerNotification;
