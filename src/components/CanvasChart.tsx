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
  const [livePrice, setLivePrice] = useState<number | null>(null)
  const animationFrameRef = useRef<number>()

  // Fetch chart data
  useEffect(() => {
    if (!selectedCrypto) return

    const loadChartData = async () => {
      try {
        const days = timeframe === '24h' ? '1' : timeframe === '7d' ? '7' : timeframe === '30d' ? '30' : '90'
        const data = await fetchHistoricalData(selectedCrypto.id, days)
        const formattedData = data.map(([time, price]: [number, number]) => ({ time, price }))
        setChartData(formattedData)
        
        // Initialize live price with the latest historical price
        if (formattedData.length > 0) {
          setLivePrice(formattedData[formattedData.length - 1].price)
        }
      } catch (error) {
        console.error('Failed to load chart data:', error)
      }
    }

    loadChartData()
    const interval = setInterval(loadChartData, 60000) // Refresh historical data every minute

    return () => clearInterval(interval)
  }, [selectedCrypto, timeframe])

  // Live price updates (simulated for real-time effect)
  useEffect(() => {
    if (!selectedCrypto || chartData.length === 0) return

    const updateLivePrice = () => {
      // Use the current_price from selectedCrypto for live updates
      setLivePrice(selectedCrypto.current_price)
      
      // Add new data point to the chart if enough time has passed
      setChartData(prev => {
        if (prev.length === 0) return prev
        
        const now = Date.now()
        const lastPoint = prev[prev.length - 1]
        const timeDiff = now - lastPoint.time
        
        // Add a new point every 5 seconds for live feel (adjust as needed)
        if (timeDiff > 5000) {
          const newPoint = { time: now, price: selectedCrypto.current_price }
          const maxPoints = timeframe === '24h' ? 288 : timeframe === '7d' ? 168 : 360
          const updatedData = [...prev, newPoint]
          
          // Keep only the latest points based on timeframe
          return updatedData.slice(-maxPoints)
        }
        
        return prev
      })
    }

    updateLivePrice()
    const liveInterval = setInterval(updateLivePrice, 3000) // Update every 3 seconds

    return () => clearInterval(liveInterval)
  }, [selectedCrypto, chartData.length, timeframe])

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

    // Draw live price line (horizontal line at current price)
    if (livePrice !== null && livePrice !== undefined) {
      const livePriceY = padding.top + chartHeight - ((livePrice - minPrice) / priceRange) * chartHeight
      
      // Dashed line
      ctx.strokeStyle = isPositive ? '#26a69a' : '#ef5350'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(padding.left, livePriceY)
      ctx.lineTo(dimensions.width - padding.right, livePriceY)
      ctx.stroke()
      ctx.setLineDash([])

      // Price label on the right
      const livePriceText = `${livePrice.toFixed(2)}`
      const textWidth = ctx.measureText(livePriceText).width
      const labelPadding = 6
      const labelX = dimensions.width - padding.right + 5
      const labelY = livePriceY

      // Background for price label
      ctx.fillStyle = isPositive ? '#26a69a' : '#ef5350'
      ctx.fillRect(labelX, labelY - 10, textWidth + labelPadding * 2, 20)

      // Price text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(livePriceText, labelX + labelPadding, labelY + 4)

      // Pulse dot at the end of the line
      const lastPoint = points[points.length - 1]
      const pulseRadius = 4 + Math.sin(Date.now() / 200) * 2 // Animated pulse
      
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, pulseRadius, 0, Math.PI * 2)
      ctx.fillStyle = isPositive ? '#26a69a' : '#ef5350'
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }

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

    // Request animation frame for continuous animation (pulse effect)
    animationFrameRef.current = requestAnimationFrame(() => {
      // This will trigger a re-render for smooth animations
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [chartData, dimensions, hoveredPoint, timeframe, livePrice])

  // Continuous animation loop for pulse effect
  useEffect(() => {
    if (!canvasRef.current || !livePrice || chartData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = Date.now()
    let animationId: number

    const animate = () => {
      const now = Date.now()
      const deltaTime = now - lastTime

      // Only redraw if enough time has passed (60 FPS)
      if (deltaTime > 16) {
        lastTime = now
        
        // Redraw just the animated parts (pulse dot)
        const padding = { top: 30, right: 80, bottom: 40, left: 60 }
        const chartWidth = dimensions.width - padding.left - padding.right
        const chartHeight = dimensions.height - padding.top - padding.bottom
        
        if (chartData.length > 0) {
          const prices = chartData.map(d => d.price)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const priceRange = maxPrice - minPrice
          
          const points = chartData.map((d, i) => ({
            x: padding.left + (chartWidth / (chartData.length - 1)) * i,
            y: padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight,
          }))
          
          const lastPoint = points[points.length - 1]
          const isPositive = chartData[chartData.length - 1].price >= chartData[0].price
          
          // Clear only the area around the pulse dot
          ctx.clearRect(lastPoint.x - 15, lastPoint.y - 15, 30, 30)
          
          // Redraw background in that area
          ctx.fillStyle = '#0a0e1a'
          ctx.fillRect(lastPoint.x - 15, lastPoint.y - 15, 30, 30)
          
          // Draw pulse dot
          const pulseRadius = 4 + Math.sin(now / 200) * 2
          
          ctx.beginPath()
          ctx.arc(lastPoint.x, lastPoint.y, pulseRadius, 0, Math.PI * 2)
          ctx.fillStyle = isPositive ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
          ctx.fill()
          
          ctx.beginPath()
          ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = isPositive ? '#26a69a' : '#ef5350'
          ctx.fill()
          
          ctx.beginPath()
          ctx.arc(lastPoint.x, lastPoint.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [livePrice, chartData, dimensions])

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
      {/* Header with live price */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedCrypto ? selectedCrypto.name : 'Select a cryptocurrency'}
            </h2>
            {selectedCrypto && livePrice !== null && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-white">
                  ${livePrice.toFixed(2)}
                </span>
                <span className={`text-sm px-2 py-1 rounded ${
                  selectedCrypto.price_change_percentage_24h >= 0 
                    ? 'bg-green/20 text-green' 
                    : 'bg-red/20 text-red'
                }`}>
                  {selectedCrypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {selectedCrypto.price_change_percentage_24h.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-500">24h</span>
              </div>
            )}
          </div>
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
