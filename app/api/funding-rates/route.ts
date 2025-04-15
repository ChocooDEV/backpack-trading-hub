import { NextResponse } from 'next/server';
import { getBpxClient } from '../../utils/api-client';

export async function GET(request: Request) {
  try {
        
    // Get the Backpack Exchange API client
    const client = getBpxClient();
    
    // Get all markets first to know which symbols to query
    const marketsResponse = await client.markets.getMarkets();
    
    if (marketsResponse.error && marketsResponse.error.code) {
      throw new Error(`API Error: ${marketsResponse.error.code} - ${marketsResponse.error.message}`);
    }
    
    // Filter for perpetual futures markets only (they have funding rates)
    const perpMarkets = marketsResponse.data.filter(market => 
      market.marketType === 'PERP' || market.marketType === 'IPERP'
    );
    
    // Fetch funding rates for all perpetual markets
    const fundingRatesPromises = perpMarkets.map(market => 
      client.markets.getFundingIntervalRates({ symbol: market.symbol })
    );
    
    const fundingRatesResponses = await Promise.all(fundingRatesPromises);
    
    // Combine all funding rates into a single array
    let allFundingRates: any[] = [];
    for (const response of fundingRatesResponses) {
      if (response.error && response.error.code) {
        console.warn(`Warning fetching funding rates: ${response.error.code} - ${response.error.message}`);
        continue;
      }
      if (response.data && Array.isArray(response.data)) {
        allFundingRates = [...allFundingRates, ...response.data];
      }
    }
    
    return NextResponse.json(allFundingRates);
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch funding rates' },
      { status: 500 }
    );
  }
} 