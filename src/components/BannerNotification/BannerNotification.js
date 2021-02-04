import React, { useContext, useEffect, useState } from 'react';

import { getToken, saveToken } from 'lib/auth';
import { useTranslation } from 'react-i18next';

import { UserContext } from 'context/UserContext';

import { getAuctionsTotals } from 'lib/api';

/**
 * BannerNotification component
 */

const BannerNotification = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;
	const [showBanner, setShowBanner] = useState(false);
	const [total, setTotal] = useState(0);

	const setUpTotals = () => {
		console.log('total');
		getAuctionsTotals()
			.then((response) => {
				setTotal(response.data.auctions.total);
				setShowBanner(true);
				console.log('RESPONSE', response);
			})
			.catch((error) => {
				// console.log(error);
				console.log('ERROR', error);
			});
	};

	useEffect(() => {
		if (userAuthenticated) {
			let cookie = getToken('dismissBanner');
			// if ( !cookie ){ // Check cookie
			// 	setUpTotals();
			// }
			setUpTotals();
		}
	}, [userAuthenticated]);

	const dismissBanner = (e) => {
		e.preventDefault();
		saveToken('dismissBanner', true);
		setShowBanner(false);
	};

	return (
		<>
			{showBanner && (
				<div className="BannerNotification">
					<div className="--standard">
						{/* <div className="BannerNotification__title">{t('BannerNotification.welcome')}{' '}🥳</div> */}
						<div className="BannerNotification__content">
							{t('Cashback.banner.desc', { total: total })}
							{/* <span onClick={(e) => dismissBanner(e)}>
								<Cancel className="Cancel" />
							</span> */}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BannerNotification;
