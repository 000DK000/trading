import { useState, useEffect } from 'react'
import { Cryptocurrency } from '../App'
import { fetchTopCryptos } from '../services/coinGeckoApi'

interface CryptoListProps {
  onSelectCrypto: (crypto: Cryptocurrency) => void
  selectedCrypto: Cryptocurrency | null
}

export default function CryptoList({ onSelectCrypto, selectedCrypto }: CryptoListProps) {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCryptos = async () => {
      try {
        const data = await fetchTopCryptos()
        setCryptos(data)
        if (data.length > 0 && !selectedCrypto) {
          onSelectCrypto(data[0])
        }
      } catch (error) {
        console.error('Failed to load cryptocurrencies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCryptos()
    const interval = setInterval(loadCryptos, 10000) // Update every 10 seconds for more live feel

    return () => clearInterval(interval)
  }, [onSelectCrypto, selectedCrypto])

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="px-2 py-3 border-b border-dark-border">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Markets
        </h2>
      </div>
      <div className="mt-2 space-y-1">
        {cryptos.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => onSelectCrypto(crypto)}
            className={`w-full px-3 py-3 rounded-lg text-left transition-all ${
              selectedCrypto?.id === crypto.id
                ? 'bg-dark-surface-light border border-dark-border'
                : 'hover:bg-dark-surface-light/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <img 
                  src={crypto.image} 
                  alt={crypto.name}
                  className="w-6 h-6"
                />
                <span className="font-semibold text-white">
                  {crypto.symbol.toUpperCase()}
                </span>
              </div>
              <span className={`text-sm font-medium ${
                crypto.price_change_percentage_24h >= 0 
                  ? 'text-accent-green' 
                  : 'text-accent-red'
              }`}>
                {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{crypto.name}</span>
              <span className="text-white font-medium">
                ${crypto.current_price.toLocaleString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
