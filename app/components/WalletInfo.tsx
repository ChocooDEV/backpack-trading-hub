import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Balance {
  asset: string;
  available: string;
  locked: string;
  staked?: string;
  lent?: string;
  total: string;
}

export default function WalletInfo() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Balance;
    direction: 'ascending' | 'descending';
  }>({
    key: 'total',
    direction: 'descending',
  });

  // Sort function for the table
  const sortedBalances = React.useMemo(() => {
    const sortableBalances = [...balances];
    if (sortConfig.key) {
      sortableBalances.sort((a, b) => {
        const aValue = parseFloat(a[sortConfig.key] as string) || 0;
        const bValue = parseFloat(b[sortConfig.key] as string) || 0;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBalances;
  }, [balances, sortConfig]);

  // Request sort handler
  const requestSort = (key: keyof Balance) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'ascending' ? 'descending' : 'ascending',
        };
      }
      return { key, direction: 'descending' };
    });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: keyof Balance) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        setLoading(true);
        
        // Use the Next.js API route which uses bpx-api-client internally
        const response = await axios.get('/api/wallet');
        
        // Convert the response object to an array of balances
        const balancesArray = Object.entries(response.data).map(([asset, values]: [string, any]) => ({
          asset,
          ...values,
          total: (
            parseFloat(values.available) + 
            parseFloat(values.locked) + 
            parseFloat(values.staked || '0') +
            parseFloat(values.lent || '0')
          ).toString()
        }));
        
        setBalances(balancesArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching wallet info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet information');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletInfo();
    const interval = setInterval(fetchWalletInfo, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="wallet-info">
        <h2>Wallet Balances</h2>
        <div className="loading-indicator">
          <p>Loading wallet info...</p>
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="wallet-info">
        <h2>Wallet Balances</h2>
        <div className="error">
          {error}
        </div>
      </div>
    );
  }
  return (
    <div className="wallet-info">
      <h2>Wallet Balances</h2>
      {balances.length === 0 ? (
        <p>No assets found in your wallet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('asset')} className="sortable-header">
                Asset{getSortDirectionIndicator('asset')}
              </th>
              <th onClick={() => requestSort('available')} className="sortable-header">
                Available{getSortDirectionIndicator('available')}
              </th>
              <th onClick={() => requestSort('locked')} className="sortable-header">
                Locked{getSortDirectionIndicator('locked')}
              </th>
              <th onClick={() => requestSort('lent')} className="sortable-header">
                Lent{getSortDirectionIndicator('lent')}
              </th>
              <th onClick={() => requestSort('total')} className="sortable-header">
                Total{getSortDirectionIndicator('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBalances.map((balance) => (
              <tr key={balance.asset}>
                <td><strong>{balance.asset}</strong></td>
                <td>{parseFloat(balance.available).toFixed(8)}</td>
                <td>{parseFloat(balance.locked).toFixed(8)}</td>
                <td>{balance.lent ? parseFloat(balance.lent).toFixed(8) : '0.00000000'}</td>
                <td><strong>{parseFloat(balance.total).toFixed(8)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        .sortable-header {
          cursor: pointer;
          user-select: none;
        }
        .sortable-header:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
} 