# Backpack Hub

Backpack Hub is a dashboard application for Backpack Exchange trading, built with Next.js. It provides a comprehensive interface for monitoring your Backpack Exchange account, including wallet balances, funding rates, market overview, open positions, and a delta-neutral trading strategy implementation.

<p align="center">
  <img src="https://github.com/user-attachments/assets/ff7235a7-39e3-4afa-8f50-5c305f574181" width="400"/>
</p>


[Join Backpack Exchange](https://backpack.exchange/signup?referral=chocoo)

## Features

- **Wallet Information**: View all your balances including available, locked, and lent assets
- **Funding Rates**: Monitor the top funding rates across all perpetual markets
- **Open Positions**: View and manage your current trading positions with PnL tracking
- **Delta-Neutral Strategy**: Implement a delta-neutral trading strategy to earn funding rates while minimizing directional risk

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: TypeScript
- **API Client**: bpx-api-client for Backpack Exchange API integration
- **HTTP Client**: Axios

## Getting Ready

First, set up your environment variables:

1. Create a `.env.local` file in the root directory
2. Add your Backpack Exchange API credentials: [Backpack API Keys Manager](https://backpack.exchange/portfolio/settings/api-keys)
```
BPX_API_KEY=your_api_key
BPX_API_SECRET=your_api_secret
```

Then, run the development server:
```
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.


## API Routes

The application includes several API routes that interact with the Backpack Exchange API:

- `/api/wallet` - Fetches wallet balances
- `/api/funding-rates` - Gets current funding rates for all perpetual markets
- `/api/markets` - Retrieves market data including prices and 24h changes
- `/api/positions` - Gets open positions with PnL information
- `/api/delta-neutral` - Implements the delta-neutral strategy


## Delta-Neutral Strategy

The delta-neutral strategy component allows you to:

1. Select a trading pair with positive funding rates
2. Enter an investment amount
3. Automatically open balanced spot and perpetual positions
4. Earn funding rates while minimizing directional price exposure

## Disclaimer

**USE AT YOUR OWN RISK**: The author(s) of this application do not accept any responsibility or liability for any financial losses that may occur while using this application, including but not limited to:

- Losses resulting from the delta-neutral strategy implementation
- Errors or bugs in the code
- Market volatility or unexpected exchange behavior
- API failures or connectivity issues

Trading cryptocurrencies involves significant risk. Users are solely responsible for:
- Verifying the correctness of all trading logic
- Understanding the risks involved in algorithmic trading
- Monitoring their positions and account balances
- Ensuring they have sufficient knowledge before using any trading features

By using this application, you acknowledge that you are using it at your own risk and that the author(s) cannot be held responsible for any financial losses.


## Security Considerations

- This application requires API keys with trading permissions
- Never share your API keys or commit them to version control
- Consider using read-only API keys if you only need to view data without trading


## Learn More

- [Backpack Exchange API Documentation](https://docs.backpack.exchange) - learn about the Backpack Exchange API
- [Backpack API Client](https://github.com/0xprobe/bpx-api-client) - learn about the Backpack API Client


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## License

This project is licensed under the MIT License.
