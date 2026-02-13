import { Cryptocurrency } from '../App'

interface HeaderProps {
  selectedCrypto: Cryptocurrency | null
}

export default function Header({ selectedCrypto }: HeaderProps) {
  return (
    <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Crypto Trading Platform</h1>
          {selectedCrypto && (
            <div className="flex items-center space-x-3 ml-8">
              <img 
                src={selectedCrypto.image} 
                alt={selectedCrypto.name}
                className="w-8 h-8"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-white">
                    {selectedCrypto.symbol.toUpperCase()}/USD
                  </span>
                  <span className={`text-lg font-bold ${
                    selectedCrypto.price_change_percentage_24h >= 0 
                      ? 'text-accent-green' 
                      : 'text-accent-red'
                  }`}>
                    ${selectedCrypto.current_price.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  24h: <span className={
                    selectedCrypto.price_change_percentage_24h >= 0 
                      ? 'text-accent-green' 
                      : 'text-accent-red'
                  }>
                    {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Live Market Data</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </header>
  )
}
