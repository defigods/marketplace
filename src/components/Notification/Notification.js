import React from 'react';
import TimeCounter from '../TimeCounter/TimeCounter';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Fade from '@material-ui/core/Fade';
import { useHistory } from 'react-router-dom';

import { readNotification, hideNotification } from '../../lib/api';

const Notification = (props) => {
	let history = useHistory();

	const [anchorEl, setAnchorEl] = React.useState(null);
	const [readed, setReaded] = React.useState(props.data.status !== 0);
	const [hidden, setHidden] = React.useState(false);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleGoTo = () => {
		setAnchorEl(null);
		history.push('/map/land/' + props.data.landUuid);
		props.actions.toggleNotificationCenter();
	};

	const formatTextContent = (content) => {
		return content.replace(props.data.landSentence, "<span>" + props.data.landSentence +"</span>");
	}

	const handleHide = () => {
		setAnchorEl(null);
		setHidden(true);
		hideNotification(props.data.uuid).then((response) => {
			// TODO: check if result is true
		});
	};

	const setAsReaded = () => {
		setReaded(true);
		readNotification(props.data.uuid).then((response) => {
			props.actions.setAsReaded(props.data.uuid);
		});
	};

	const returnContent = () => {
		console.log(hidden);
		let content;
		if (!hidden) {
			content = (
				<div key={props.data.uuid} className={`Notification ${!readed ? '--new' : ''}`} onClick={setAsReaded}>
					<div className="Notification__body">
						<div className="Notification__content" dangerouslySetInnerHTML={{ __html: formatTextContent(props.data.content) }}></div>
						<div className="Notification__time">
							<TimeCounter date_end={props.data.createdAt}></TimeCounter>
						</div>
					</div>
					<IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick}>
						<MoreIcon />
					</IconButton>
					<Menu
						id="fade-menu"
						anchorEl={anchorEl}
						keepMounted
						open={open}
						onClose={handleClose}
						TransitionComponent={Fade}
					>
						<MenuItem onClick={handleGoTo}>Go to OVRLand</MenuItem>
						<MenuItem onClick={handleHide}>Hide</MenuItem>
					</Menu>
				</div>
			);
		} else {
			content = <></>;
		}
		return content;
	};
	return <>{returnContent()}</>;
};

export default Notification;
