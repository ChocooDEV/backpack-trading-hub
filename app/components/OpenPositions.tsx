'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatPercentage } from '@/app/utils/formatters';

interface PositionImfFunction {
  base: string;
  factor: string;
  type: string;
}

interface FuturePositionWithMargin {
  breakEvenPrice: string;
  entryPrice: string;
  estLiquidationPrice: string;
  imf: string;
  imfFunction: PositionImfFunction;
  markPrice: string;
  mmf: string;
  mmfFunction: PositionImfFunction;
  netCost: string;
  netQuantity: string;
  netExposureQuantity: string;
  netExposureNotional: string;
  pnlRealized: string;
  pnlUnrealized: string;
  cumulativeFundingPayment: string;
  subaccountId: number | null;
  symbol: string;
  userId: number;
  positionId: string;
  cumulativeInterest: string;
}

export default function OpenPositions() {
  const [positions, setPositions] = useState<FuturePositionWithMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FuturePositionWithMargin | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'pnlUnrealized', direction: 'desc' });
  
  const router = useRouter();

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/positions');
        
        if (!response.ok) {
          throw new Error(`Error fetching positions: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Extract the positions array from the response
        const positionsArray = responseData.data || [];
        setPositions(positionsArray);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch positions:', err);
        setError('Failed to load positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
    
    const intervalId = setInterval(fetchPositions, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const requestSort = (key: keyof FuturePositionWithMargin) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key || !Array.isArray(positions)) return positions;
    
    return [...positions].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      // Handle numeric string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' 
            ? aNum - bNum 
            : bNum - aNum;
        }
      }
      
      // Default string comparison
      if (aValue !== null && bValue !== null && aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue !== null && bValue !== null && aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIndicator = (key: keyof FuturePositionWithMargin) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const handlePositionClick = (symbol: string) => {
    router.push(`/trade/${symbol}`);
  };

  // Calculate total PnL
  const totalPnl = Array.isArray(positions) 
    ? positions.reduce((sum, position) => {
        return sum + parseFloat(position.pnlUnrealized);
      }, 0)
    : 0;

  if (loading) {
    return (
      <div className="wallet-info">
        <h2>Open Positions</h2>
        <div className="loading-indicator">
          <p>Loading positions...</p>
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="wallet-info">
        <h2>Open Positions</h2>
        <div className="error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="open-positions wallet-info">
      <h2>Open Positions</h2>
      {positions.length === 0 ? (
        <p>No open positions.</p>
      ) : (
        <>
          <div className="positions-summary">
            <div className="summary-item">
              <span>Total Positions:</span>
              <span>{positions.length}</span>
            </div>
            <div className="summary-item">
              <span>Total Unrealized PnL:</span>
              <span className={totalPnl > 0 ? 'positive' : totalPnl < 0 ? 'negative' : ''}>
                {formatCurrency(totalPnl)}
              </span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('symbol')} style={{ cursor: 'pointer' }}>
                  Symbol{getSortIndicator('symbol')}
                </th>
                <th onClick={() => requestSort('netQuantity')} style={{ cursor: 'pointer' }}>
                  Size{getSortIndicator('netQuantity')}
                </th>
                <th onClick={() => requestSort('entryPrice')} style={{ cursor: 'pointer' }}>
                  Entry{getSortIndicator('entryPrice')}
                </th>
                <th onClick={() => requestSort('markPrice')} style={{ cursor: 'pointer' }}>
                  Mark{getSortIndicator('markPrice')}
                </th>
                <th onClick={() => requestSort('pnlUnrealized')} style={{ cursor: 'pointer' }}>
                  PnL{getSortIndicator('pnlUnrealized')}
                </th>
                <th onClick={() => requestSort('estLiquidationPrice')} style={{ cursor: 'pointer' }}>
                  Liq. Price{getSortIndicator('estLiquidationPrice')}
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(getSortedData()) ? getSortedData().map((position) => {
                const isLong = parseFloat(position.netQuantity) > 0;
                const pnlUnrealized = parseFloat(position.pnlUnrealized);
                const pnlClass = pnlUnrealized > 0 ? 'positive' : pnlUnrealized < 0 ? 'negative' : '';
                
                // Calculate ROI
                const entryValue = parseFloat(position.entryPrice) * Math.abs(parseFloat(position.netQuantity));
                const roi = entryValue > 0 ? (pnlUnrealized / entryValue) * 100 : 0;
                
                return (
                  <tr 
                    key={position.positionId} 
                    onClick={() => handlePositionClick(position.symbol)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{position.symbol}</td>
                    <td className={isLong ? 'positive' : 'negative'}>
                      {isLong ? '+' : ''}{position.netQuantity}
                    </td>
                    <td>{formatCurrency(position.entryPrice)}</td>
                    <td>{formatCurrency(position.markPrice)}</td>
                    <td className={pnlClass}>
                      {formatCurrency(position.pnlUnrealized)}
                      <span className="roi">({formatPercentage(roi)})</span>
                    </td>
                    <td>{formatCurrency(position.estLiquidationPrice)}</td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
} 