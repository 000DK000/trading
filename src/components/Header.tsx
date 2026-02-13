import { Cryptocurrency } from '../App'

interface HeaderProps {
  selectedCrypto: Cryptocurrency | null
  balance: number
}

const Header = ({ selectedCrypto, balance }: HeaderProps) => {
  return (
    <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white">Crypto Trading Platform</h1>
          
          {selectedCrypto && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={selectedCrypto.image} 
                  alt={selectedCrypto.name}
                  className="w-6 h-6"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {selectedCrypto.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedCrypto.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-dark-border" />
              
              <div>
                <div className="text-sm text-gray-400">Price</div>
                <div className="text-lg font-semibold text-white">
                  ${selectedCrypto.current_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">24h Change</div>
                <div className={`text-lg font-semibold ${
                  selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green' : 'text-red'
                }`}>
                  {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Available Balance</div>
            <div className="text-lg font-semibold text-white">
              ${balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" title="Live" />
        </div>
      </div>
    </header>
  )
}

export default Header
