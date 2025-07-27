"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"

const TradingViewChart = dynamic(() => import("@/components/trading-view-chart"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
})

function ChartPage() {
  const searchParams = useSearchParams()
  const symbol = searchParams.get("symbol")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        {symbol ? `Real-Time Chart: ${symbol}` : "Real-Time Chart"}
      </h1>
      <p className="text-muted-foreground mb-6">
        Live candlestick chart powered by TradingView.
      </p>

      {symbol ? (
        <TradingViewChart symbol={symbol} />
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Please select a symbol to view the chart.</p>
        </div>
      )}
    </div>
  )
}

export default function RealTimeMarketWatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChartPage />
    </Suspense>
  )
}
