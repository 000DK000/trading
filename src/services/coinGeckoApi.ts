import axios from 'axios'

const BASE_URL = 'https://api.coingecko.com/api/v3'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

export interface CoinGeckoMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: null
  last_updated: string
}

export async function fetchTopCryptos(): Promise<CoinGeckoMarket[]> {
  try {
    const response = await api.get<CoinGeckoMarket[]>('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching top cryptocurrencies:', error)
    throw error
  }
}

export async function fetchHistoricalData(
  coinId: string,
  days: string
): Promise<[number, number][]> {
  try {
    const response = await api.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
        interval: days === '1' ? 'hourly' : 'daily',
      },
    })
    return response.data.prices
  } catch (error) {
    console.error('Error fetching historical data:', error)
    throw error
  }
}

export async function fetchCoinDetails(coinId: string) {
  try {
    const response = await api.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching coin details:', error)
    throw error
  }
}
