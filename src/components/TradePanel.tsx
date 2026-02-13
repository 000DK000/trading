import { useState } from 'react'
import { Cryptocurrency } from '../App'

interface TradePanelProps {
  selectedCrypto: Cryptocurrency | null
}

type TradeType = 'buy' | 'sell'

export default function TradePanel({ selectedCrypto }: TradePanelProps) {
  const [tradeType, setTradeType] = useState<TradeType>('buy')
  const [amount, setAmount] = useState('')
  const [total, setTotal] = useState('')

  if (!selectedCrypto) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-400">Select a cryptocurrency</div>
      </div>
    )
  }

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      setTotal((parseFloat(value) * selectedCrypto.current_price).toFixed(2))
    } else {
      setTotal('')
    }
  }

  const handleTotalChange = (value: string) => {
    setTotal(value)
    if (value && !isNaN(parseFloat(value))) {
      setAmount((parseFloat(value) / selectedCrypto.current_price).toFixed(8))
    } else {
      setAmount('')
    }
  }

  const handleTrade = () => {
    alert(`${tradeType.toUpperCase()} Order Placed!\n\nAmount: ${amount} ${selectedCrypto.symbol.toUpperCase()}\nTotal: $${total}\n\nThis is a demo platform. No real trades are executed.`)
    setAmount('')
    setTotal('')
  }

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            tradeType === 'buy'
              ? 'bg-accent-green text-white'
              : 'bg-dark-surface-light text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            tradeType === 'sell'
              ? 'bg-accent-red text-white'
              : 'bg-dark-surface-light text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Price
          </label>
          <div className="bg-dark-surface-light rounded-lg px-3 py-2 text-white">
            ${selectedCrypto.current_price.toLocaleString()}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Amount ({selectedCrypto.symbol.toUpperCase()})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full bg-dark-surface-light rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Total (USD)
          </label>
          <input
            type="number"
            value={total}
            onChange={(e) => handleTotalChange(e.target.value)}
            placeholder="0.00"
            className="w-full bg-dark-surface-light rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-green"
          />
        </div>

        <div className="flex space-x-2">
          {[25, 50, 75, 100].map((percentage) => (
            <button
              key={percentage}
              onClick={() => handleAmountChange((1000 / selectedCrypto.current_price * (percentage / 100)).toFixed(8))}
              className="flex-1 py-1 text-xs bg-dark-surface-light text-gray-400 hover:text-white rounded transition-colors"
            >
              {percentage}%
            </button>
          ))}
        </div>

        <button
          onClick={handleTrade}
          disabled={!amount || !total}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            tradeType === 'buy'
              ? 'bg-accent-green hover:bg-accent-green/90'
              : 'bg-accent-red hover:bg-accent-red/90'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto.symbol.toUpperCase()}
        </button>

        <div className="text-xs text-gray-500 text-center mt-2">
          Demo Mode - No real trades are executed
        </div>
      </div>
    </div>
  )
}
