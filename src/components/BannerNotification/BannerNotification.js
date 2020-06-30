import React, { useEffect, useState } from 'react';

import { getToken, removeToken } from '../../lib/auth';

/**
 * BannerNotification component
 */

const BannerNotification = () => {
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
							<div className="BannerNotification__title">Welome to OVR 🥳</div>
							<div className="BannerNotification__content">
								You can now own your land, customized it, top up your OVR wallet
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BannerNotification;
