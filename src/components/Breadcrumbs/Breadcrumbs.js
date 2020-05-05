import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';

import { Breadcrumbs as MaterialBreadcrumbs, Link } from '@material-ui/core';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const Breadcrumbs = ({ previousLinks, currentPageLabel, className }) => {
	const currentDatetimeStamp = moment().format('HH:mm, dddd, MMM D, YYYY');

	return (
		<div className={`breadcrumbs ${className}`}>
			<MaterialBreadcrumbs
				className={'breadcrumbs--items'}
				separator={<NavigateNextIcon fontSize="small" />}
				aria-label="breadcrumb"
			>
				{previousLinks.map((a, index) => (
					<Link className="breadcrumbs--prevlink" key={`prev_link_${index}`} color="inherit" href={a.href}>
						{a.label}
					</Link>
				))}
				<span className="breadcrumbs--currentlabel">{currentPageLabel}</span>
			</MaterialBreadcrumbs>
			<span className="breadcrumbs--datetime">{currentDatetimeStamp}</span>
		</div>
	);
};

Breadcrumbs.propTypes = {
	previousLinks: PropTypes.arrayOf(PropTypes.shape({ href: PropTypes.string, label: PropTypes.string })),
	currentPageLabel: PropTypes.string,
	className: PropTypes.string,
};
Breadcrumbs.defaultProps = {
	previousLinks: [],
	currentPageLabel: 'undefined',
	className: '',
};
export default Breadcrumbs;
