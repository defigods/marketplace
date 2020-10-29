import React from 'react';
// import PropTypes from 'prop-types';
import CheckBox from '../../components/CheckBox/CheckBox';
import TextField from '../../components/TextField/TextField';
import { useTranslation } from 'react-i18next'

const EmailConfirmation = () => {

	const { t, i18n } = useTranslation()
	return (
		<div className="emailconfirmation o-half">
			<CheckBox label="Active email notification" />
			<TextField id="email" label="Your email" />
			<div className="emailconfirmation-smalltext">
				{t('EmailConfirmation.email.confirm')}
			</div>
		</div>
	);
};

export default EmailConfirmation;
