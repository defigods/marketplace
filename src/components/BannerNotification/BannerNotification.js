import React, { useContext, useEffect, useState } from 'react';

import { getToken, removeToken, saveToken } from '../../lib/auth';
import { Trans, useTranslation } from 'react-i18next'

import { UserContext } from '../../context/UserContext';
import Cancel from '@material-ui/icons/Cancel';
/**
 * BannerNotification component
 */

const BannerNotification = () => {
	const { t, i18n } = useTranslation();
	const { state } = useContext(UserContext);
	const { isLoggedIn: userAuthenticated } = state;
	const [ showBanner, setShowBanner ] = useState(false)
	

	useEffect(() => {
		if (userAuthenticated) {
			let cookie = getToken('dismissBanner')
			if ( !cookie ){
				setShowBanner(true)
			}
		}
	}, [userAuthenticated]);

	const dismissBanner = (e) => {
		e.preventDefault();
		saveToken('dismissBanner', true)
		setShowBanner(false)
	}

	return (
		<>
			{showBanner && (
				<div className="BannerNotification">
					<div className="o-container">
						<div className="--standard">
							{/* <div className="BannerNotification__title">{t('BannerNotification.welcome')}{' '}🥳</div> */}
							<div className="BannerNotification__content">
								{t('Cashback.banner.desc')}
								<span onClick={(e) => dismissBanner(e)}>
									<Cancel className="Cancel" />
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BannerNotification;
