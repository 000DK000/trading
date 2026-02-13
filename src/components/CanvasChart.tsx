import { useEffect, useRef, useState } from 'react'
import { Cryptocurrency } from '../App'
import { fetchHistoricalData } from '../services/coinGeckoApi'

interface ChartData {
  time: number
  price: number
}

interface CanvasChartProps {
  selectedCrypto: Cryptocurrency | null
}

type Timeframe = '24h' | '7d' | '30d' | '90d'

const CanvasChart = ({ selectedCrypto }: CanvasChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('24h')
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; time: number } | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Fetch chart data
  useEffect(() => {
    if (!selectedCrypto) return

    const loadChartData = async () => {
      try {
        const days = timeframe === '24h' ? '1' : timeframe === '7d' ? '7' : timeframe === '30d' ? '30' : '90'
        const data = await fetchHistoricalData(selectedCrypto.id, days)
        setChartData(data.map(([time, price]: [number, number]) => ({ time, price })))
      } catch (error) {
        console.error('Failed to load chart data:', error)
      }
    }

    loadChartData()
    const interval = setInterval(loadChartData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [selectedCrypto, timeframe])

  // Handle canvas resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || chartData.length === 0 || dimensions.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = '#0a0e1a'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Calculate chart area (leave space for labels)
    const padding = { top: 30, right: 80, bottom: 40, left: 60 }
    const chartWidth = dimensions.width - padding.left - padding.right
    const chartHeight = dimensions.height - padding.top - padding.bottom

    // Find min and max prices
    const prices = chartData.map(d => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice

    // Draw grid lines
    ctx.strokeStyle = '#1e2430'
    ctx.lineWidth = 1
    
    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(dimensions.width - padding.right, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 10, y + 4)
    }

    // Vertical grid lines (6 lines)
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, dimensions.height - padding.bottom)
      ctx.stroke()

      // Time labels
      if (i < chartData.length) {
        const dataIndex = Math.floor((chartData.length - 1) * (i / 6))
        const time = new Date(chartData[dataIndex].time)
        const label = timeframe === '24h' 
          ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        
        ctx.fillStyle = '#6b7280'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(label, x, dimensions.height - padding.bottom + 20)
      }
    }

    // Map data points to canvas coordinates
    const points = chartData.map((d, i) => ({
      x: padding.left + (chartWidth / (chartData.length - 1)) * i,
      y: padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight,
      price: d.price,
      time: d.time
    }))

    // Draw gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, dimensions.height - padding.bottom)
    const isPositive = chartData[chartData.length - 1].price >= chartData[0].price
    
    if (isPositive) {
      gradient.addColorStop(0, 'rgba(38, 166, 154, 0.3)')
      gradient.addColorStop(1, 'rgba(38, 166, 154, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 83, 80, 0.3)')
      gradient.addColorStop(1, 'rgba(239, 83, 80, 0)')
    }

    ctx.beginPath()
    ctx.moveTo(points[0].x, dimensions.height - padding.bottom)
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.lineTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.lineTo(points[points.length - 1].x, dimensions.height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    
    points.forEach((point, i) => {
      if (i === 0) return
      ctx.lineTo(point.x, point.y)
    })

    ctx.strokeStyle = isPositive ? '#26a69a' : '#ef5350'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw hovered point
    if (hoveredPoint) {
      // Vertical line
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(hoveredPoint.x, padding.top)
      ctx.lineTo(hoveredPoint.x, dimensions.height - padding.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      // Circle at point
      ctx.beginPath()
      ctx.arc(hoveredPoint.x, hoveredPoint.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = isPositive ? '#26a69a' : '#ef5350'
      ctx.fill()
      ctx.strokeStyle = '#0a0e1a'
      ctx.lineWidth = 2
      ctx.stroke()

      // Price tooltip
      const tooltipText = `$${hoveredPoint.price.toFixed(2)}`
      const tooltipWidth = ctx.measureText(tooltipText).width + 16
      const tooltipX = Math.min(hoveredPoint.x, dimensions.width - padding.right - tooltipWidth)
      const tooltipY = hoveredPoint.y - 35

      ctx.fillStyle = '#1e2430'
      ctx.fillRect(tooltipX, tooltipY, tooltipWidth, 24)
      ctx.strokeStyle = isPositive ? '#26a69a' : '#ef5350'
      ctx.lineWidth = 1
      ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, 24)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(tooltipText, tooltipX + tooltipWidth / 2, tooltipY + 16)
    }
  }, [chartData, dimensions, hoveredPoint, timeframe])

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || chartData.length === 0) return

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left

    const padding = { top: 30, right: 80, bottom: 40, left: 60 }
    const chartWidth = dimensions.width - padding.left - padding.right

    // Find nearest point
    const dataIndex = Math.round(((mouseX - padding.left) / chartWidth) * (chartData.length - 1))
    
    if (dataIndex >= 0 && dataIndex < chartData.length) {
      const d = chartData[dataIndex]
      const prices = chartData.map(d => d.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const priceRange = maxPrice - minPrice
      const chartHeight = dimensions.height - padding.top - padding.bottom

      const x = padding.left + (chartWidth / (chartData.length - 1)) * dataIndex
      const y = padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight

      setHoveredPoint({ x, y, price: d.price, time: d.time })
    }
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Timeframe selector */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {selectedCrypto ? selectedCrypto.name : 'Select a cryptocurrency'}
          </h2>
          {selectedCrypto && (
            <span className={`text-sm ${
              selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green' : 'text-red'
            }`}>
              {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
              {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {(['24h', '7d', '30d', '90d'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf
                  ? 'bg-accent text-white'
                  : 'bg-dark-surface text-gray-400 hover:bg-dark-border'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas chart */}
      <div ref={containerRef} className="flex-1 relative">
        {selectedCrypto ? (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full cursor-crosshair"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a cryptocurrency to view chart
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasChart
