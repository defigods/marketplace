import React, { useEffect, useState } from 'react';

import { getToken, removeToken } from '../../lib/auth';
import { Trans, useTranslation } from 'react-i18next'


/**
 * BannerNotification component
 */

const BannerNotification = () => {
	const { t, i18n } = useTranslation()
	const [firstAfterSignup, setFirstAfterSignup] = useState(getToken('firstAfterSignup'));

	useEffect(() => {
		if (firstAfterSignup) {
			removeToken('firstAfterSignup');
			setFirstAfterSignup(false);
		}
	}, []);

	return (
		<>
			{firstAfterSignup && (
				<div className="BannerNotification">
					<div className="o-container">
						<div className="--positive">
							<div className="BannerNotification__title">{t('BannerNotification.welcome')}{' '}🥳</div>
							<div className="BannerNotification__content">
								{t('BannerNotification.intro')}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BannerNotification;
