import { useState, useCallback, useEffect } from 'react'
import CanvasChart from './components/CanvasChart'
import CryptoList from './components/CryptoList'
import Portfolio from './components/Portfolio'
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

export interface Position {
  id: string
  cryptoId: string
  symbol: string
  name: string
  amount: number
  buyPrice: number
  currentPrice: number
  timestamp: number
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  cryptoId: string
  symbol: string
  amount: number
  price: number
  total: number
  timestamp: number
}

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null)
  const [balance, setBalance] = useState<number>(10000) // Starting balance: $10,000
  const [positions, setPositions] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  const handleSelectCrypto = useCallback((crypto: Cryptocurrency) => {
    setSelectedCrypto(crypto)
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBalance = localStorage.getItem('tradingBalance')
    const savedPositions = localStorage.getItem('tradingPositions')
    const savedTransactions = localStorage.getItem('tradingTransactions')
    
    if (savedBalance) setBalance(parseFloat(savedBalance))
    if (savedPositions) setPositions(JSON.parse(savedPositions))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tradingBalance', balance.toString())
    localStorage.setItem('tradingPositions', JSON.stringify(positions))
    localStorage.setItem('tradingTransactions', JSON.stringify(transactions))
  }, [balance, positions, transactions])

  // Update current prices in positions
  useEffect(() => {
    if (selectedCrypto && positions.length > 0) {
      setPositions(prevPositions => 
        prevPositions.map(pos => 
          pos.cryptoId === selectedCrypto.id 
            ? { ...pos, currentPrice: selectedCrypto.current_price }
            : pos
        )
      )
    }
  }, [selectedCrypto, positions.length])

  const handleBuy = useCallback((amount: number, price: number) => {
    if (!selectedCrypto) return

    const total = amount * price
    
    if (total > balance) {
      alert('Insufficient balance!')
      return
    }

    // Deduct from balance
    setBalance(prev => prev - total)

    // Add or update position
    setPositions(prev => {
      const existingPos = prev.find(p => p.cryptoId === selectedCrypto.id)
      
      if (existingPos) {
        // Update existing position (average price)
        const newAmount = existingPos.amount + amount
        const newAvgPrice = ((existingPos.buyPrice * existingPos.amount) + (price * amount)) / newAmount
        
        return prev.map(p => 
          p.cryptoId === selectedCrypto.id
            ? { ...p, amount: newAmount, buyPrice: newAvgPrice }
            : p
        )
      } else {
        // Create new position
        return [...prev, {
          id: Date.now().toString(),
          cryptoId: selectedCrypto.id,
          symbol: selectedCrypto.symbol,
          name: selectedCrypto.name,
          amount,
          buyPrice: price,
          currentPrice: price,
          timestamp: Date.now()
        }]
      }
    })

    // Add transaction
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'buy',
      cryptoId: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      amount,
      price,
      total,
      timestamp: Date.now()
    }, ...prev])

    alert(`Successfully bought ${amount.toFixed(8)} ${selectedCrypto.symbol.toUpperCase()}`)
  }, [selectedCrypto, balance])

  const handleSell = useCallback((amount: number, price: number) => {
    if (!selectedCrypto) return

    const position = positions.find(p => p.cryptoId === selectedCrypto.id)
    
    if (!position || position.amount < amount) {
      alert('Insufficient holdings!')
      return
    }

    const total = amount * price

    // Add to balance
    setBalance(prev => prev + total)

    // Update or remove position
    setPositions(prev => {
      const updated = prev.map(p => {
        if (p.cryptoId === selectedCrypto.id) {
          const newAmount = p.amount - amount
          return newAmount > 0.00000001 
            ? { ...p, amount: newAmount }
            : null
        }
        return p
      }).filter(Boolean) as Position[]
      
      return updated
    })

    // Add transaction
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'sell',
      cryptoId: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      amount,
      price,
      total,
      timestamp: Date.now()
    }, ...prev])

    alert(`Successfully sold ${amount.toFixed(8)} ${selectedCrypto.symbol.toUpperCase()}`)
  }, [selectedCrypto, positions])

  return (
    <div className="h-screen flex flex-col bg-dark-bg text-gray-200">
      <Header selectedCrypto={selectedCrypto} balance={balance} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Crypto List */}
        <div className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto">
          <CryptoList 
            onSelectCrypto={handleSelectCrypto}
            selectedCrypto={selectedCrypto}
          />
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CanvasChart selectedCrypto={selectedCrypto} />
          </div>
        </div>

        {/* Right Sidebar - Portfolio & Trading */}
        <div className="w-80 flex flex-col bg-dark-surface border-l border-dark-border">
          <div className="flex-1 overflow-y-auto">
            <Portfolio 
              positions={positions}
              transactions={transactions}
              balance={balance}
            />
          </div>
          <div className="border-t border-dark-border">
            <TradePanel 
              selectedCrypto={selectedCrypto}
              balance={balance}
              position={positions.find(p => p.cryptoId === selectedCrypto?.id)}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
