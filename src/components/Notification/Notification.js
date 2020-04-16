import React, { Component } from 'react';
// import { Link } from "react-router-dom";
import TimeCounter from '../TimeCounter/TimeCounter';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import Fade from '@material-ui/core/Fade';

const Notification = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <div key={props.id} className={`Notification ${props.data.status === 0 ? '--new' : ''}`}>
      <div className="Notification__body">
        <div className="Notification__content">
          {props.data.content}
        </div>
        <div className="Notification__time">      
          <TimeCounter date_end={props.data.createdAt}></TimeCounter>
        </div>
      </div>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
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
        <MenuItem onClick={handleClose}>Hide</MenuItem>
      </Menu>
    </div>
  );
  
}

export default Notification;
