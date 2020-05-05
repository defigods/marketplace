import '../../../.storybook/config.js';

import React from 'react';
import Breadcrumbs from './Breadcrumbs';

export default {
	title: 'Breadcrumbs',
	component: Breadcrumbs,
};
const prevLinks = [
	{ href: '/', label: 'My Portfolio' },
	{ href: '/', label: 'My OVRLands' },
];
export const breadcrumbs = () => <Breadcrumbs currentPageLabel="delivery.subject.hunger" previousLinks={prevLinks} />;
export const empty = () => <Breadcrumbs />;
