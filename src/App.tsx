import { useState, useCallback } from 'react'
import TradingChart from './components/TradingChart'
import CryptoList from './components/CryptoList'
import OrderBook from './components/OrderBook'
import TradePanel from './components/TradePanel'
import Header from './components/Header'

export interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null)
  
  const handleSelectCrypto = useCallback((crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-dark-bg text-gray-200">
      <Header selectedCrypto={selectedCrypto} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto">
          <CryptoList 
            onSelectCrypto={handleSelectCrypto}
            selectedCrypto={selectedCrypto}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <TradingChart selectedCrypto={selectedCrypto} />
          </div>
        </div>

        <div className="w-80 flex flex-col bg-dark-surface border-l border-dark-border">
          <div className="flex-1 overflow-y-auto">
            <OrderBook selectedCrypto={selectedCrypto} />
          </div>
          <div className="border-t border-dark-border">
            <TradePanel selectedCrypto={selectedCrypto} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
