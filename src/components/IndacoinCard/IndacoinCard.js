import React from 'react';

const IndacoinCard = () => {
	return (
		<form action="https://indacoin.com/gw/payment_form" method="GET">
			<input type="hidden" name="partner" value="YourPartnerName" />
			<input type="hidden" name="cur_from" value="USD" />
			<input type="hidden" name="cur_to" value="OVR" />
			<input type="number" name="amount" value="1000" />
			<input type="text" name="address" value="3P3QsMVK89JBNqZQv5zMAKG8FK3kJM4rjt" />
			<input type="hidden" name="user_id" value="1" />
			<input type="submit" value="Submit" />
		</form>
	)
};
export default IndacoinCard;
