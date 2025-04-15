'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

type MarketData = {
  symbol: string;
  price: number;
  change24h: number;
};

export default function MarketOverview() {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MarketData | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'change24h', direction: 'desc' });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/api/markets');
        setMarkets(response.data);
        setError(null);
      } catch (err) {
        setError('Error loading market data');
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const requestSort = (key: keyof MarketData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return markets;
    
    return [...markets].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIndicator = (key: keyof MarketData) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return (
      <div className="wallet-info">
        <h2>Market Overview</h2>
        <div className="loading-indicator">
          <p>Loading market overview...</p>
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="wallet-info">
        <h2>Market Overview</h2>
        <div className="error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="market-overview wallet-info">
      <h2>Market Overview</h2>
      {markets.length === 0 ? (
        <p>No market data available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('symbol')} style={{ cursor: 'pointer' }}>
                Symbol{getSortIndicator('symbol')}
              </th>
              <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                Price{getSortIndicator('price')}
              </th>
              <th onClick={() => requestSort('change24h')} style={{ cursor: 'pointer' }}>
                24h Change{getSortIndicator('change24h')}
              </th>
            </tr>
          </thead>
          <tbody>
            {getSortedData().map((market) => (
              <tr key={market.symbol}>
                <td><strong>{market.symbol}</strong></td>
                <td>${market.price ? market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                <td className={market.change24h >= 0 ? "positive" : "negative"}>
                  <strong>{market.change24h >= 0 ? "+" : ""}{market.change24h?.toFixed(2) || '0.00'}%</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 