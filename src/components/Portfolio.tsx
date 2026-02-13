import { useState } from 'react'
import { Position, Transaction } from '../App'

interface PortfolioProps {
  positions: Position[]
  transactions: Transaction[]
  balance: number
}

const Portfolio = ({ positions, transactions, balance }: PortfolioProps) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'transactions'>('positions')

  // Calculate total portfolio value
  const totalPositionValue = positions.reduce((sum, pos) => sum + (pos.amount * pos.currentPrice), 0)
  const totalValue = balance + totalPositionValue
  
  // Calculate total P&L
  const totalPnL = positions.reduce((sum, pos) => {
    const invested = pos.amount * pos.buyPrice
    const current = pos.amount * pos.currentPrice
    return sum + (current - invested)
  }, 0)

  const totalPnLPercent = positions.reduce((sum, pos) => {
    const invested = pos.amount * pos.buyPrice
    if (invested === 0) return sum
    const current = pos.amount * pos.currentPrice
    return sum + ((current - invested) / invested) * 100
  }, 0) / (positions.length || 1)

  return (
    <div className="flex flex-col h-full">
      {/* Portfolio Summary */}
      <div className="p-4 border-b border-dark-border bg-dark-bg">
        <h3 className="text-sm text-gray-400 mb-2">Total Portfolio Value</h3>
        <div className="text-2xl font-bold mb-1">${totalValue.toFixed(2)}</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Cash: ${balance.toFixed(2)}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Holdings: ${totalPositionValue.toFixed(2)}</span>
        </div>
        {positions.length > 0 && (
          <div className={`mt-2 text-sm font-semibold ${totalPnL >= 0 ? 'text-green' : 'text-red'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-border">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'positions'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Positions ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'positions' ? (
          <div>
            {positions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No positions yet. Buy some crypto to get started!
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {positions.map((position) => {
                  const invested = position.amount * position.buyPrice
                  const current = position.amount * position.currentPrice
                  const pnl = current - invested
                  const pnlPercent = (pnl / invested) * 100

                  return (
                    <div key={position.id} className="p-4 hover:bg-dark-bg transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-white">
                            {position.symbol.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">{position.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            ${current.toFixed(2)}
                          </div>
                          <div className={`text-xs ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="text-gray-300">{position.amount.toFixed(8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Buy Price:</span>
                          <span className="text-gray-300">${position.buyPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Price:</span>
                          <span className="text-gray-300">${position.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P&L:</span>
                          <span className={pnl >= 0 ? 'text-green' : 'text-red'}>
                            {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No transactions yet
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-dark-bg transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            tx.type === 'buy' 
                              ? 'bg-green/20 text-green' 
                              : 'bg-red/20 text-red'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                          <span className="font-semibold text-white">
                            {tx.symbol.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          tx.type === 'buy' ? 'text-red' : 'text-green'
                        }`}>
                          {tx.type === 'buy' ? '-' : '+'}${tx.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="text-gray-300">{tx.amount.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="text-gray-300">${tx.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
