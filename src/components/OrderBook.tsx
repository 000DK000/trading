import { useState, useEffect } from 'react'
import { Cryptocurrency } from '../App'

interface OrderBookProps {
  selectedCrypto: Cryptocurrency | null
}

interface Order {
  price: number
  amount: number
  total: number
}

export default function OrderBook({ selectedCrypto }: OrderBookProps) {
  const [bids, setBids] = useState<Order[]>([])
  const [asks, setAsks] = useState<Order[]>([])

  useEffect(() => {
    if (!selectedCrypto) return

    const generateOrders = () => {
      const basePrice = selectedCrypto.current_price
      const newBids: Order[] = []
      const newAsks: Order[] = []

      for (let i = 0; i < 15; i++) {
        const bidPrice = basePrice * (1 - (i + 1) * 0.001)
        const askPrice = basePrice * (1 + (i + 1) * 0.001)
        const bidAmount = Math.random() * 5 + 0.1
        const askAmount = Math.random() * 5 + 0.1

        newBids.push({
          price: bidPrice,
          amount: bidAmount,
          total: bidPrice * bidAmount,
        })

        newAsks.push({
          price: askPrice,
          amount: askAmount,
          total: askPrice * askAmount,
        })
      }

      setBids(newBids)
      setAsks(newAsks.reverse())
    }

    generateOrders()
    const interval = setInterval(generateOrders, 3000)

    return () => clearInterval(interval)
  }, [selectedCrypto])

  if (!selectedCrypto) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-400">Select a cryptocurrency</div>
      </div>
    )
  }

  const maxTotal = Math.max(
    ...bids.map(b => b.total),
    ...asks.map(a => a.total)
  )

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Order Book</h2>
      
      <div className="text-xs text-gray-400 mb-2 flex justify-between px-2">
        <span>Price (USD)</span>
        <span>Amount ({selectedCrypto.symbol.toUpperCase()})</span>
        <span>Total</span>
      </div>

      <div className="space-y-0.5 mb-4">
        {asks.map((ask, index) => (
          <div key={`ask-${index}`} className="relative">
            <div 
              className="absolute inset-0 bg-accent-red/10"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="relative flex justify-between px-2 py-1 text-xs">
              <span className="text-accent-red font-medium">
                {ask.price.toFixed(2)}
              </span>
              <span className="text-gray-300">
                {ask.amount.toFixed(4)}
              </span>
              <span className="text-gray-400">
                {ask.total.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-dark-surface-light py-3 px-2 rounded-lg mb-4 text-center">
        <div className="text-2xl font-bold text-white">
          ${selectedCrypto.current_price.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400 mt-1">Spread: 0.05%</div>
      </div>

      <div className="space-y-0.5">
        {bids.map((bid, index) => (
          <div key={`bid-${index}`} className="relative">
            <div 
              className="absolute inset-0 bg-accent-green/10"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="relative flex justify-between px-2 py-1 text-xs">
              <span className="text-accent-green font-medium">
                {bid.price.toFixed(2)}
              </span>
              <span className="text-gray-300">
                {bid.amount.toFixed(4)}
              </span>
              <span className="text-gray-400">
                {bid.total.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
