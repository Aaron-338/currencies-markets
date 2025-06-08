import RealTimeMarketWatch from "@/components/real-time-market-watch"

export default function RealTimeMarketWatchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real-Time Market Watch</h1>
      <p className="text-muted-foreground mb-8">
        Monitor live market data across forex, cryptocurrencies, indices, commodities, and stocks with professional
        TradingView charts.
      </p>

      <RealTimeMarketWatch />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About This Feature</h2>
          <p className="text-muted-foreground mb-4">
            The Real-Time Market Watch provides professional TradingView charts for various financial instruments. Click
            on any asset in the list to view its chart.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>View professional TradingView charts for any trading pair</li>
            <li>Change timeframes from 1-minute to weekly</li>
            <li>Access technical indicators like Moving Averages and RSI</li>
            <li>Filter assets by category or search for specific symbols</li>
            <li>Sort data by clicking on column headers</li>
          </ul>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Using TradingView Charts</h2>
          <p className="text-muted-foreground mb-4">
            Our platform integrates professional TradingView charts to provide you with advanced technical analysis
            capabilities:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Use the chart toolbar to add indicators and drawing tools</li>
            <li>Click and drag on the chart to move through time periods</li>
            <li>Use the mouse wheel to zoom in and out</li>
            <li>Right-click on the chart for additional options</li>
            <li>Click the fullscreen button to expand the chart view</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
