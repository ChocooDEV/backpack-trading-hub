import { NextResponse } from 'next/server';
import { getBpxClient } from '../../utils/api-client';

export async function GET() {
  try {

    // Get the Backpack Exchange API client
    const client = getBpxClient();
    
    // Get both markets and tickers data
    const [marketsResponse, tickersResponse] = await Promise.all([
      client.markets.getMarkets(),
      client.markets.getTickers()
    ]);
    
    // Check for errors in either response
    if (marketsResponse.error && marketsResponse.error.code) {
      throw new Error(`Markets API Error: ${marketsResponse.error.code} - ${marketsResponse.error.message}`);
    }
    
    if (tickersResponse.error && tickersResponse.error.code) {
      throw new Error(`Tickers API Error: ${tickersResponse.error.code} - ${tickersResponse.error.message}`);
    }
    
    // Combine the data from both endpoints
    const markets = marketsResponse.data;
    const tickers = tickersResponse.data;
    
    // Create a map of tickers by symbol for easy lookup
    const tickerMap = tickers.reduce<Record<string, any>>((map, ticker) => {
      map[ticker.symbol] = ticker;
      return map;
    }, {});
    
    // Combine market and ticker data
    const combinedData = markets.map(market => {
      const ticker = tickerMap[market.symbol] || {};
      return {
        symbol: market.symbol,
        price: parseFloat(ticker.lastPrice) || 0,
        change24h: parseFloat(ticker.priceChangePercent) || 0,
        baseAsset: market.baseSymbol,
        quoteAsset: market.quoteSymbol,
        status: market.orderBookState
      };
    });
    
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 