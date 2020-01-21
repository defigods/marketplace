import '../../../.storybook/config.js';

import React from 'react';
import { action } from '@storybook/addon-actions';
import AuctionCard from './AuctionCard';

export default {
  title: 'AuctionCard',
  component: AuctionCard,
};

export const BestBid = () => <AuctionCard onClick={action('clicked')} 
                            url="/"
                            value="300"
                            background_image="url(assets/img/auction-map.png)"
                            name={{ sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"}}
                            location="Venice, Italy"
                            bid_status={{className: "--best", sentence:"BEST BID"}}
                            date_end="2020-01-17T15:44-0000"
                            ></AuctionCard>;

export const OutBid = () => <AuctionCard onClick={action('clicked')} 
                            url="/"
                            value="450000"
                            background_image="url(assets/img/auction-map.png)"
                            name={{ sentence:"country.connect.overflow", hex: "8cbcc350c0ab5ff"}}
                            location="Melbourne, Australia"
                            bid_status={{className: "--out", sentence:"OUTBIDDED"}}
                            date_end="2020-01-19T15:44-0000"
                            ></AuctionCard>;
