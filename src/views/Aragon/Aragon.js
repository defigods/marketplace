import React, { useState, useEffect, useContext } from 'react';

import { MapContext } from '../../context/MapContext';
import { Connect, useApps, createAppHook, useOrganization, usePermissions, connectFinance } from '@aragon/connect-react';

import Pagination from '@material-ui/lab/Pagination';
import { useTranslation } from 'react-i18next'

const Aragon = () => {
	const { t, i18n } = useTranslation();

	const { actions } = useContext(MapContext);

	useEffect(() => {
	}, []);
  
  function App() {
		const [org, orgStatus] = useOrganization();
    const useFinance = createAppHook(connectFinance);

		const [apps, appsStatus] = useApps();
    const [permissions, permissionsStatus] = usePermissions();
    
		const loading =
      orgStatus.loading || appsStatus.loading || permissionsStatus.loading;
		const error = orgStatus.error || appsStatus.error || permissionsStatus.error;

		if (loading) {
			return <p>{t('Aragon.loading.label')}</p>;
		}

		if (error) {
			return <p>{t('Aragon.error.msg')}{' '} {error.message}</p>;
		}

    
		return (
			<>
				<h1>{org.name}</h1>

				<h2>{t('Aragon.apps.label')}</h2>
				<ul>
					{apps.map((app, i) => (
						<li key={i}>{app.name}</li>
					))}
				</ul>
				<h2>{t('Aragon.transactions.label')}</h2>
				<ul>
					{permissions.map((permission, i) => (
						<li key={i}>{String(permission)}</li>
					))}
				</ul>
			</>
		);
  }
  
	return (
		<div className="Overview">
			<div className="o-container">
				<h2 className="o-section-title">{t('Aragon.apps.label')}</h2>
			</div>
			<div className="o-container">
				<Connect location="ovrtest0.aragonid.eth" connector="thegraph" options={{ network: 4 }}>
					<App />
				</Connect>
			</div>
		</div>
	);
};

export default Aragon;
