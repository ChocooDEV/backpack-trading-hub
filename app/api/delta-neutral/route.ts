import { NextRequest, NextResponse } from 'next/server';
import { getBpxClient } from '@/app/utils/api-client';
import { OrderType, Side, MarketType, FundingIntervalRates } from 'bpx-api-client';

export async function POST(request: NextRequest) {
  try {
    const { tradingPair, amount } = await request.json();

    // Validate inputs
    if (!tradingPair || !amount) {
      return NextResponse.json(
        { error: 'Trading pair and amount are required' },
        { status: 400 }
      );
    }

    // Get the Backpack Exchange API client
    const bpxClient = getBpxClient();
    
    // Calculate position sizes (50% for spot, 50% for perp)
    const positionSize = parseFloat(amount) / 2;
    
    // Get market information to determine the correct perpetual symbol
    const marketsResponse = await bpxClient.markets.getMarkets();
    
    if (!marketsResponse.data || marketsResponse.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch markets data from Backpack Exchange' },
        { status: 503 }
      );
    }
    
    const markets = marketsResponse.data;
    
    // Since we're directly passing the perpetual symbol from the frontend (e.g., "SOL_USDC_PERP")
    // We need to extract the base and quote symbols to construct the spot symbol
    const perpSymbol = tradingPair;
    const spotSymbol = perpSymbol.replace('_PERP', '');
    
    // Verify both markets exist
    const perpMarket = markets.find(m => m.symbol === perpSymbol);
    const spotMarket = markets.find(m => m.symbol === spotSymbol);

    if (!perpMarket) {
      return NextResponse.json(
        { error: `Perpetual market ${perpSymbol} not found` },
        { status: 400 }
      );
    }

    if (!spotMarket) {
      return NextResponse.json(
        { error: `Corresponding spot market ${spotSymbol} not found` },
        { status: 400 }
      );
    }
    
    // Get funding rate for the perpetual market to calculate estimated yield
    const fundingRateResponse = await bpxClient.markets.getFundingIntervalRates({ symbol: perpSymbol });
    
    // Calculate estimated annual yield based on funding rate
    let estimatedAnnualYield = 0;
    let currentFundingRate = "0";
    
    if (fundingRateResponse.data && fundingRateResponse.data.length > 0) {
      // Sort to get the latest funding rate
      const latestRate = fundingRateResponse.data.sort(
        (a: FundingIntervalRates, b: FundingIntervalRates) => 
          Number(b.intervalEndTimestamp) - Number(a.intervalEndTimestamp)
      )[0];
      
      const fundingRate = parseFloat(latestRate.fundingRate);
      currentFundingRate = latestRate.fundingRate;
      
      // Annualize the funding rate (assuming 3 funding periods per day)
      estimatedAnnualYield = fundingRate * 3 * 365 * 100;
    }
    
    // Execute spot buy order
    const spotOrder = await bpxClient.order.executeOrder({
      symbol: spotSymbol,
      side: Side.Bid,
      orderType: OrderType.Market,
      quoteQuantity: positionSize.toString(),
    });
    
    // Execute perpetual short order
    const perpOrder = await bpxClient.order.executeOrder({
      symbol: perpSymbol,
      side: Side.Ask,
      orderType: OrderType.Market,
      quoteQuantity: positionSize.toString(),
      reduceOnly: false,
    });
    
    return NextResponse.json({
      success: true,
      message: `Delta-neutral strategy for ${tradingPair} with $${amount} has been set up!`,
      details: {
        tradingPair,
        amount,
        spotPosition: {
          orderId: spotOrder.data.id,
          executedQuantity: spotOrder.data.executedQuantity,
          executedQuoteQuantity: spotOrder.data.executedQuoteQuantity,
          status: spotOrder.data.status
        },
        perpPosition: {
          orderId: perpOrder.data.id,
          executedQuantity: perpOrder.data.executedQuantity,
          executedQuoteQuantity: perpOrder.data.executedQuoteQuantity,
          status: perpOrder.data.status
        },
        estimatedAnnualYield: estimatedAnnualYield.toFixed(2),
        currentFundingRate: currentFundingRate,
      }
    });
  } catch (error) {
    console.error('Error setting up delta-neutral strategy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set up delta-neutral strategy', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 