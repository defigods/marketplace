import React from 'react';
import PropTypes from 'prop-types';
// import { grey } from '@material-ui/core/colors';

import { makeStyles } from '@material-ui/core/styles';
import { Breadcrumbs as MaterialBreadcrumbs, Link } from '@material-ui/core';
//import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > * + *': {
			marginTop: theme.spacing(2),
		},
	},
}));

const Breadcrumbs = ({ previousLinks, currentPageLabel, className }) => {
	const classes = useStyles();

	return (
		<div className={`breadcrumbs ${classes.root}`}>
			<MaterialBreadcrumbs
				className={className}
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
		</div>
	);
};

Breadcrumbs.propTypes = {
	previousLinks: PropTypes.arrayOf(PropTypes.shape({ href: PropTypes.string, label: PropTypes.string })),
	currentPageLabel: PropTypes.string,
	className: PropTypes.string,
};

export default Breadcrumbs;
