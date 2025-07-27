'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts';
import DerivAPI from '@deriv/deriv-api';
import { getDerivSymbol } from '@/lib/deriv';

interface RealTimeChartProps {
  symbol: string
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const api = useRef<any>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ensure this effect runs only once on mount.
    // The cleanup function will handle disconnection and removal.
    if (!chartContainerRef.current) return;
    if (api.current) return; // Already initialized

    setLoading(true)
    setError(null)
    
    // Use a ref to hold the WebSocket instance
    api.current = new DerivAPI({ app_id: 1089 })
    const currentApi = api.current

    const chartElement = chartContainerRef.current
    chart.current = createChart(chartElement, {
      width: chartElement.clientWidth,
      height: 500,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })
    series.current = chart.current.addCandlestickSeries()

    const derivSymbol = getDerivSymbol(symbol)

    const fetchData = async () => {
      try {
        const candleStream = await currentApi.candles({
          symbol: derivSymbol,
          granularity: 60, // 1 minute
        });

        const history = await candleStream.history({ count: 500 });

        if (history && series.current) {
          const formattedData: any[] = history.map((c: any) => ({
            time: c.epoch as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));
          series.current.setData(formattedData);
        }

        // Subscribe to updates
        candleStream.onUpdate().subscribe((candle: any) => {
          if (candle && series.current) {
            series.current.update({
              time: candle.epoch as any,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            });
          }
        });

      } catch (e: any) {
        console.error("Failed to load chart data:", e)
        setError(`Failed to load chart data for ${symbol}: ${e.message}. The symbol may not be supported.`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const handleResize = () => {
      if (chart.current && chartElement) {
        chart.current.resize(chartElement.clientWidth, 500)
      }
    }
    window.addEventListener("resize", handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize)
      if (currentApi) {
        currentApi.basic.disconnect()
        api.current = null
      }
      if (chart.current) {
        chart.current.remove()
        chart.current = null;
      }
    }
  }, [symbol]) // Rerun effect if symbol changes

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 z-10">
          <div className="text-center">
            <p className="text-lg font-semibold">Loading Chart...</p>
            <p className="text-sm text-gray-500">Connecting to market data for {symbol}</p>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  )
}

export default RealTimeChart 