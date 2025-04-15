import { NextResponse } from 'next/server';
import { getBpxClient } from '../../utils/api-client';

export async function GET() {
  try {

    // Get the Backpack Exchange API client
    const client = getBpxClient();
    
    // Get regular balances
    const balancesResponse = await client.capital.getBalances();
    
    if (balancesResponse.error && balancesResponse.error.code) {
      throw new Error(`API Error: ${balancesResponse.error.code} - ${balancesResponse.error.message}`);
    }
    
    // Get lending positions
    const lendingResponse = await client.borrowLend.getBorrowLendPositions();
    
    if (lendingResponse.error && lendingResponse.error.code) {
      throw new Error(`API Error: ${lendingResponse.error.code} - ${lendingResponse.error.message}`);
    }
    
    // Combine the data
    const combinedData = { ...balancesResponse.data };
    
    // Add lending amounts to the balances
    if (lendingResponse.data && Array.isArray(lendingResponse.data)) {
      lendingResponse.data.forEach(position => {        
        // Check if this is a lending position
        const asset = position.symbol.split('-')[0]; 
        const amount = position.netQuantity;
        
        if (combinedData[asset]) {
          // If the asset already exists in balances, add a 'lent' field
          (combinedData[asset] as any).lent = amount;
        } else {
          // If the asset doesn't exist in balances, create a new entry
          combinedData[asset] = {
            available: '0',
            locked: '0',
            staked: '0',
            lent: amount
          } as any;
        }
      });
    }
    
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
} 