import { useState, useEffect } from 'react'
import { Cryptocurrency, Position } from '../App'

interface TradePanelProps {
  selectedCrypto: Cryptocurrency | null
  balance: number
  position?: Position
  onBuy: (amount: number, price: number) => void
  onSell: (amount: number, price: number) => void
}

const TradePanel = ({ selectedCrypto, balance, position, onBuy, onSell }: TradePanelProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState<string>('')
  const [total, setTotal] = useState<string>('')

  useEffect(() => {
    // Reset form when crypto changes
    setAmount('')
    setTotal('')
  }, [selectedCrypto])

  const currentPrice = selectedCrypto?.current_price || 0

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      if (value && currentPrice) {
        setTotal((parseFloat(value) * currentPrice).toFixed(2))
      } else {
        setTotal('')
      }
    }
  }

  const handleTotalChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTotal(value)
      if (value && currentPrice) {
        setAmount((parseFloat(value) / currentPrice).toFixed(8))
      } else {
        setAmount('')
      }
    }
  }

  const handlePercentage = (percent: number) => {
    if (!selectedCrypto) return

    if (tradeType === 'buy') {
      const totalAmount = balance * (percent / 100)
      setTotal(totalAmount.toFixed(2))
      setAmount((totalAmount / currentPrice).toFixed(8))
    } else {
      if (!position) return
      const amountToSell = position.amount * (percent / 100)
      setAmount(amountToSell.toFixed(8))
      setTotal((amountToSell * currentPrice).toFixed(2))
    }
  }

  const handleTrade = () => {
    if (!selectedCrypto || !amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const amountNum = parseFloat(amount)
    
    if (tradeType === 'buy') {
      onBuy(amountNum, currentPrice)
    } else {
      onSell(amountNum, currentPrice)
    }

    // Reset form
    setAmount('')
    setTotal('')
  }

  const maxAvailable = tradeType === 'buy' 
    ? balance 
    : (position?.amount || 0) * currentPrice

  const canTrade = selectedCrypto && amount && parseFloat(amount) > 0 && 
    (tradeType === 'buy' ? parseFloat(total) <= balance : position && parseFloat(amount) <= position.amount)

  return (
    <div className="p-4">
      {/* Trade Type Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 rounded font-medium transition-colors ${
            tradeType === 'buy'
              ? 'bg-green text-white'
              : 'bg-dark-bg text-gray-400 hover:text-gray-300'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 rounded font-medium transition-colors ${
            tradeType === 'sell'
              ? 'bg-red text-white'
              : 'bg-dark-bg text-gray-400 hover:text-gray-300'
          }`}
        >
          Sell
        </button>
      </div>

      {!selectedCrypto ? (
        <div className="text-center text-gray-500 text-sm py-8">
          Select a cryptocurrency to trade
        </div>
      ) : (
        <>
          {/* Current Price */}
          <div className="mb-4 p-3 bg-dark-bg rounded">
            <div className="text-xs text-gray-400 mb-1">Current Price</div>
            <div className="text-lg font-semibold">${currentPrice.toFixed(2)}</div>
          </div>

          {/* Amount Input */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              Amount ({selectedCrypto.symbol.toUpperCase()})
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00000000"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent"
            />
            {tradeType === 'sell' && position && (
              <div className="text-xs text-gray-500 mt-1">
                Available: {position.amount.toFixed(8)} {selectedCrypto.symbol.toUpperCase()}
              </div>
            )}
          </div>

          {/* Total Input */}
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">
              Total (USD)
            </label>
            <input
              type="text"
              value={total}
              onChange={(e) => handleTotalChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent"
            />
            <div className="text-xs text-gray-500 mt-1">
              Available: ${maxAvailable.toFixed(2)}
            </div>
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentage(percent)}
                className="py-1.5 bg-dark-bg hover:bg-dark-border text-gray-400 text-xs rounded transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>

          {/* Trade Button */}
          <button
            onClick={handleTrade}
            disabled={!canTrade}
            className={`w-full py-3 rounded font-semibold transition-colors ${
              canTrade
                ? tradeType === 'buy'
                  ? 'bg-green hover:bg-green/90 text-white'
                  : 'bg-red hover:bg-red/90 text-white'
                : 'bg-dark-border text-gray-600 cursor-not-allowed'
            }`}
          >
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto.symbol.toUpperCase()}
          </button>

          {/* Position Info */}
          {tradeType === 'sell' && !position && (
            <div className="mt-3 text-xs text-center text-gray-500">
              You don't own any {selectedCrypto.symbol.toUpperCase()}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TradePanel
