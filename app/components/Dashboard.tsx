import React from 'react';
import WalletInfo from './WalletInfo';
import FundingRates from './FundingRates';
import MarketOverview from './MarketOverview';
import OpenPositions from './OpenPositions';
import DeltaNeutralStrategy from './DeltaNeutralStrategy';

export default function Dashboard() {
  return (
    <div className="dashboard w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
      <div className="dashboard-grid grid grid-cols-1 gap-4 sm:gap-6">
        <WalletInfo />
        <FundingRates />
        <MarketOverview />
        <div className="col-span-1 md:col-span-2">
          <DeltaNeutralStrategy />
          <OpenPositions />
        </div>
      </div>
    </div>
  );
}