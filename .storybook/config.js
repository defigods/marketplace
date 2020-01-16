import '../src/App.scss';
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";

import { addDecorator } from '@storybook/react';

addDecorator(story => <Router>{story()}</Router>);
