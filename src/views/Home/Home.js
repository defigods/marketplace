import React from 'react';
import './style.scss';
import { useTranslation } from 'react-i18next'


function Home() {
	const { t, i18n } = useTranslation();

	return (
		<div className="Home">
			<div className="o-container">{t('Home.home.label')}</div>
		</div>
	);
}

export default Home;
