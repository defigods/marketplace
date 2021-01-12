import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HexButton from '../../components/HexButton/HexButton';
import { Web3Context } from '../../context/Web3Context';
import { UserContext } from '../../context/UserContext';

import config from '../../lib/config';

const Cashback = () => {
	const { t, i18n } = useTranslation();

	const userContext = useContext(UserContext);
	const web3Context = useContext(Web3Context);
	const { isLoggedIn: userAuthenticated } = userContext.state;

	const [isClaimed, setClaimed] = useState(true);
	const [claimInfo, setClaimInfo] = useState(null);

	const { MerkleDistributorSigner, MerkleDistributorViewer, address } = web3Context.state;

	useEffect(() => {
		const checkIsClaimed = async (index) => {
			if (MerkleDistributorViewer) {
				const isClaimed = await MerkleDistributorViewer.isClaimed(index);
				setClaimed(isClaimed);
			}
		};

		if (!address) {
			setClaimInfo(null);
		} else {
			const userClaimIndex = Object.keys(config.apis.merkleInfo.claims).findIndex(
				(el) => el.toLocaleLowerCase() === address.toLocaleLowerCase(),
			);

			if (userClaimIndex >= 0) {
				const claimInfo = config.apis.merkleInfo.claims[Object.keys(config.apis.merkleInfo.claims)[userClaimIndex]];
				setClaimInfo(claimInfo);
				checkIsClaimed(claimInfo.index);
			}
		}
	}, [address, MerkleDistributorViewer]);

	const claimToken = async () => {
		if (!claimInfo || isClaimed) {
			console.log('No Claims for this User or Already Claimed');
			return;
		}

		try {
			await MerkleDistributorSigner.claim(claimInfo.index, address, claimInfo.amount, claimInfo.proof);
		} catch (error) {
			console.log(error);
		}
	};

	const LoginRequired = () => {
		const { t } = useTranslation();
		return (
			<div className="profile">
				<div className="o-container">
					<div className="c-dialog --centered">
						<div className="c-dialog-main-title">
							{t('Generic.login.required.title')}
							<span role="img" aria-label="Cool dude">
								😎
							</span>
						</div>
						<div className="c-dialog-sub-title">{t('Generic.login.required.desc')}</div>
					</div>
				</div>
			</div>
		);
	};

	return !userAuthenticated ? (
		<LoginRequired t={t} />
	) : (
		<div className="Stacking">
			<div className="o-container">
				<div className="o-section">
					<div className="o-first">
						<div className="o-card">
							<div className="o-row">
								<h3 className="p-card-title">Cashback</h3>
							</div>
							<div className="o-row">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
								dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
								ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
								fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
								deserunt mollit anim id est laborum.
							</div>
						</div>
					</div>
					<div className="o-second">
						<div className="o-card ">
							<div className="o-row o-flow-root">
								<h3 className="c-section-title">Claim OVR From Cashback</h3>
							</div>
							<div className="o-row">
								<HexButton
									url="#"
									text="Claim OVR From Cashback"
									className={'--orange --large --kyc-button --only-butt'}
									onClick={claimToken}
								></HexButton>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cashback;
