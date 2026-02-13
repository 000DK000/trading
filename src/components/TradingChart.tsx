import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { Cryptocurrency } from '../App'
import { fetchHistoricalData } from '../services/coinGeckoApi'

interface TradingChartProps {
  selectedCrypto: Cryptocurrency | null
}

export default function TradingChart({ selectedCrypto }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [timeframe, setTimeframe] = useState<'1' | '7' | '30' | '90'>('7')

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e2231' },
        horzLines: { color: '#1e2231' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      crosshair: {
        mode: 1,
      },
    })

    const series = chart.addLineSeries({
      color: '#26a69a',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#26a69a',
      crosshairMarkerBackgroundColor: '#26a69a',
      lastValueVisible: true,
      priceLineVisible: true,
    })

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!selectedCrypto || !seriesRef.current) return

    const loadChartData = async () => {
      try {
        const data = await fetchHistoricalData(selectedCrypto.id, timeframe)
        
        const formattedData = data.map(([timestamp, price]) => ({
          time: Math.floor(timestamp / 1000) as Time,
          value: price,
        }))

        seriesRef.current?.setData(formattedData)

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      } catch (error) {
        console.error('Failed to load chart data:', error)
      }
    }

    loadChartData()
    const interval = setInterval(loadChartData, 60000)

    return () => clearInterval(interval)
  }, [selectedCrypto, timeframe])

  if (!selectedCrypto) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-surface">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-gray-400 text-lg">Select a cryptocurrency to view the chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-dark-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-400">Timeframe:</span>
          <div className="flex space-x-1">
            {(['1', '7', '30', '90'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-accent-green text-white'
                    : 'bg-dark-surface-light text-gray-400 hover:text-white'
                }`}
              >
                {tf === '1' ? '24H' : `${tf}D`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Live Chart
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  )
}
