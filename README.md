# Crypto Trading Platform

A modern cryptocurrency trading platform with live charts and real-time market data powered by CoinGecko API.

## Features

- 🌑 **Dark Theme**: Professional black trading interface
- 📈 **Live Charts**: TradingView-style line charts with real-time updates
- 💱 **Multiple Cryptocurrencies**: Track top 20 cryptocurrencies by market cap
- 📊 **Order Book**: Real-time order book visualization
- 💰 **Trading Panel**: Buy/Sell interface with amount calculations
- 🔄 **Auto-Refresh**: Market data updates every 30 seconds, charts every minute
- 📱 **Responsive Design**: Clean and intuitive user interface

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Charts**: Lightweight Charts (TradingView library)
- **API**: CoinGecko API (free tier)
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-trading-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── Header.tsx           # Top navigation bar
│   ├── CryptoList.tsx       # Cryptocurrency list sidebar
│   ├── TradingChart.tsx     # Main chart component
│   ├── OrderBook.tsx        # Order book display
│   └── TradePanel.tsx       # Buy/Sell trading panel
├── services/
│   └── coinGeckoApi.ts      # CoinGecko API integration
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles
```

## Features Overview

### Live Charts
- Multiple timeframes (24H, 7D, 30D, 90D)
- Smooth line charts with crosshair
- Auto-updating price data
- Professional TradingView-inspired design

### Market Data
- Real-time prices for top 20 cryptocurrencies
- 24-hour price change percentages
- Market cap and trading volume
- Auto-refresh every 30 seconds

### Order Book
- Live bid/ask prices
- Visual depth representation
- Real-time spread calculation
- Color-coded buy/sell orders

### Trading Interface
- Buy/Sell toggle
- Amount and total calculators
- Quick percentage buttons (25%, 50%, 75%, 100%)
- Demo mode (no real trades executed)

## API Usage

This platform uses the CoinGecko API (free tier) which has the following limits:
- 10-30 calls/minute
- No API key required
- Public data only

## Notes

⚠️ **This is a demo platform for educational purposes only. No real trades are executed.**

## License

MIT License - feel free to use this project for learning and development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
