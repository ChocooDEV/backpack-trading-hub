import { NextResponse } from 'next/server';
import { getBpxClient } from '../../utils/api-client';

export async function GET() {
  try {
    // Get the Backpack Exchange API client
    const apiClient = getBpxClient();

    // Get open positions
    const positions = await apiClient.futures.getOpenPositions();
    
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
} 