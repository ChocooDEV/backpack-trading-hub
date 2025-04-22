import { BpxApiClient } from 'bpx-api-client';

// Initialize the client with environment variables
export const getBpxClient = () => {
  const apiKey = process.env.BPX_API_KEY;
  const apiSecret = process.env.BPX_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('API key and secret must be provided in environment variables');
  }
  
  return new BpxApiClient({
    apiKey,
    apiSecret,
    debug: process.env.NODE_ENV === 'development'
  });
}; 