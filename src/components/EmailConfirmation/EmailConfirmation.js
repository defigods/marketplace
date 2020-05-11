import React from 'react';
// import PropTypes from 'prop-types';
import CheckBox from '../../components/CheckBox/CheckBox';
import TextField from '../../components/TextField/TextField';

const EmailConfirmation = () => {
	return (
		<div className="emailconfirmation o-half">
			<CheckBox label="Active email notification" />
			<TextField id="email" label="Your email" />
			<div className="emailconfirmation-smalltext">
				We will keep this information for ourselves, as it will not be written on the blockchain. By inserting your
				email address you accept our Terms and Conditions
			</div>
		</div>
	);
};

export default EmailConfirmation;
