'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FundingRate {
  symbol: string;
  fundingRate: string;
  indexPrice: string;
  markPrice: string;
  nextFundingTimestamp: number;
}

interface TradingPair {
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
}

const DeltaNeutralStrategy: React.FC = () => {
  const router = useRouter();
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [amount, setAmount] = useState<string>('1000');
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedEarnings, setEstimatedEarnings] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch trading pairs and funding rates on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch markets (trading pairs) using our API route that uses bpx-client
        const marketsResponse = await axios.get('/api/markets');
        const allMarkets = marketsResponse.data;
        
        // Get all spot market symbols for quick lookup
        const spotMarkets = allMarkets.filter((market: any) => 
          !market.symbol.includes('_PERP')
        );
                
        const spotMarketSymbols = new Set(
          spotMarkets.map((market: any) => market.symbol)
        );
        
        // Get all perpetual markets
        const allPerpMarkets = allMarkets.filter((market: any) => 
          market.symbol.includes('_PERP')
        );
                
        // Filter for perpetual markets that have corresponding spot markets
        const perpMarkets = allPerpMarkets
          .filter((perpMarket: any) => {
            // Create the corresponding spot symbol
            const spotSymbol = perpMarket.symbol.replace('_PERP', '');
            // Check if the spot market exists
            const exists = spotMarketSymbols.has(spotSymbol);
            return exists;
          })
          .map((market: any) => ({
            symbol: market.symbol,
            baseSymbol: market.baseSymbol || market.baseAsset,
            quoteSymbol: market.quoteSymbol || market.quoteAsset
          }));
                
        // Fetch funding rates
        const fundingRatesResponse = await axios.get('/api/funding-rates');
        const fundingRatesData = fundingRatesResponse.data;
        setFundingRates(fundingRatesData);
        
        // Sort trading pairs by funding rate (highest to lowest)
        const sortedPairs = [...perpMarkets].sort((a, b) => {
          const rateA = fundingRatesData.find((rate: FundingRate) => rate.symbol === a.symbol)?.fundingRate || '0';
          const rateB = fundingRatesData.find((rate: FundingRate) => rate.symbol === b.symbol)?.fundingRate || '0';
          return parseFloat(rateB) - parseFloat(rateA);
        });
        
        setTradingPairs(sortedPairs);
        
        // Set default selected pair to the one with highest funding rate
        if (sortedPairs.length > 0) {
          setSelectedPair(sortedPairs[0].symbol);
        } else {
          setError('No valid trading pairs found with both perpetual and spot markets');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load trading pairs and funding rates');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate estimated earnings when selected pair or amount changes
  useEffect(() => {
    if (selectedPair && amount) {
      const selectedFundingRate = fundingRates.find(rate => rate.symbol === selectedPair);
      
      if (selectedFundingRate) {
        const fundingRateDecimal = parseFloat(selectedFundingRate.fundingRate);
        
        // Calculate daily earnings (funding rate is typically per 8 hours, so multiply by 3 for daily)
        const dailyRate = fundingRateDecimal * 3;
        
        // Calculate annual earnings (daily rate * 365)
        const annualRate = dailyRate * 365;
        
        // Calculate estimated earnings based on amount
        const earnings = parseFloat(amount) * annualRate;
        
        setEstimatedEarnings(earnings.toFixed(2));
      }
    }
  }, [selectedPair, amount, fundingRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPair || !amount) {
      setError('Please select a trading pair and enter an amount');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Execute the delta-neutral strategy
      const response = await axios.post('/api/delta-neutral', {
        tradingPair: selectedPair,
        amount: amount
      });
      
      // Update estimated earnings with the actual value from the API
      if (response.data.details && response.data.details.estimatedAnnualYield) {
        const annualYield = parseFloat(response.data.details.estimatedAnnualYield);
        const earnings = (parseFloat(amount) * annualYield / 100).toFixed(2);
        setEstimatedEarnings(earnings);
      }
      
      alert(response.data.message || 'Delta-neutral strategy has been set up successfully!');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error setting up delta-neutral strategy:', err);
      setError(
        (err as any).response?.data?.error || 
        'Failed to set up delta-neutral strategy. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  // Get current funding rate for selected pair
  const getCurrentFundingRate = () => {
    const selectedFundingRate = fundingRates.find(rate => rate.symbol === selectedPair);
    return selectedFundingRate ? selectedFundingRate.fundingRate : '0';
  };

  // Format funding rate as percentage
  const formatFundingRate = (rate: string) => {
    const rateNum = parseFloat(rate) * 100;
    return `${rateNum.toFixed(4)}%`;
  };

  if (loading) {
    return (
      <div className="wallet-info">
        <h2>Delta-Neutral Strategy</h2>
        <div className="loading-indicator">
          <p>Loading strategy options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <h2>Delta-Neutral Strategy</h2>
      
      {error && (
        <div className="error mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Trading Pair
          </label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
            disabled={isSubmitting}
          >
            {tradingPairs.map((pair) => {
              const rate = fundingRates.find(rate => rate.symbol === pair.symbol)?.fundingRate || '0';
              const rateValue = parseFloat(rate);
              const formattedRate = formatFundingRate(rate);
              return (
                <option key={pair.symbol} value={pair.symbol}>
                  {pair.symbol}  [ {formattedRate} ]
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Investment Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
            placeholder="Enter amount in USDC"
            min="10"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="positions-summary mb-6">
          <div className="summary-item">
            <span>Trading Pair</span>
            <span>{selectedPair}</span>
          </div>
          
          <div className="summary-item">
            <span>Current Funding Rate</span>
            <span className={`font-bold ${parseFloat(getCurrentFundingRate()) >= 0 ? "positive" : "negative"}`}>
              {formatFundingRate(getCurrentFundingRate())}
            </span>
          </div>
          
          <div className="summary-item">
            <span>Investment Amount</span>
            <span>${amount} USDC</span>
          </div>
          
          <div className="summary-item">
            <span>Estimated Annual Earnings</span>
            <span className={`font-bold ${parseFloat(estimatedEarnings) >= 0 ? "positive" : "negative"}`}>
              ${estimatedEarnings} USDC
            </span>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 mb-6">
          <p>* Delta-neutral strategy involves opening both spot and perpetual positions to neutralize price exposure while earning funding rates.</p>
          <p>* Estimated earnings are based on current funding rates and may vary over time.</p>
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary-color text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Setting Up Strategy...' : 'Set Up Delta-Neutral Strategy'}
        </button>
      </form>
    </div>
  );
};

export default DeltaNeutralStrategy; 