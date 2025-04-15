import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FundingRate {
  symbol: string;
  fundingRate: string;
  intervalEndTimestamp: number;
}

export default function FundingRates() {
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFundingRates = async () => {
      try {
        setLoading(true);
        
        // Fetch all funding rates without specifying a symbol
        const response = await axios.get('/api/funding-rates');
        
        // Group by symbol and keep only the latest entry for each symbol
        const latestRatesBySymbol = new Map();
        response.data.forEach((rate: FundingRate) => {
          const existingRate = latestRatesBySymbol.get(rate.symbol);
          if (!existingRate || rate.intervalEndTimestamp > existingRate.intervalEndTimestamp) {
            latestRatesBySymbol.set(rate.symbol, rate);
          }
        });
        
        // Convert map to array and sort by funding rate (highest to lowest)
        const uniqueRates = Array.from(latestRatesBySymbol.values());
        const sortedRates = uniqueRates.sort(
          (a, b) => parseFloat(b.fundingRate) - parseFloat(a.fundingRate)
        );
        
        setFundingRates(sortedRates);
        setError(null);
      } catch (err) {
        setError('Failed to fetch funding rates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="wallet-info">
        <h2>Top 10 Funding Rates (🔼 to 🔽)</h2>
        <div className="loading-indicator">
          <p>Loading funding rates...</p>
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="wallet-info">
        <h2>Top 10 Funding Rates (🔼 to 🔽)</h2>
        <div className="error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="funding-rates">
      <h2>Top 10 Funding Rates (🔼 to 🔽)</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Rate (%)</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {fundingRates.slice(0, 10).map((item) => (
            <tr key={item.symbol}>
              <td>{item.symbol}</td>
              <td className={parseFloat(item.fundingRate) > 0 ? 'positive' : 'negative'}>
                {(parseFloat(item.fundingRate) * 100).toFixed(4)}%
              </td>
              <td>{new Date(item.intervalEndTimestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 