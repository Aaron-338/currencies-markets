"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import TradingViewChart from "./trading-view-chart"

// Types for market data
type MarketAsset = {
  symbol: string
  name: string
  price: number
  previousPrice: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: string
  marketCap?: string
  category: "forex" | "crypto" | "indices" | "commodities" | "stocks"
}

export default function RealTimeMarketWatch() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("symbol")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [marketData, setMarketData] = useState<MarketAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  // Initial market data
  const initialMarketData: MarketAsset[] = [
    {
      symbol: "EUR/USD",
      name: "Euro / US Dollar",
      price: 1.0892,
      previousPrice: 1.0884,
      change: 0.0008,
      changePercent: 0.07,
      high: 1.0901,
      low: 1.0878,
      volume: "98.2K",
      category: "forex",
    },
    {
      symbol: "GBP/USD",
      name: "British Pound / US Dollar",
      price: 1.2654,
      previousPrice: 1.2666,
      change: -0.0012,
      changePercent: -0.09,
      high: 1.2672,
      low: 1.2642,
      volume: "76.5K",
      category: "forex",
    },
    {
      symbol: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      price: 151.42,
      previousPrice: 151.17,
      change: 0.25,
      changePercent: 0.17,
      high: 151.68,
      low: 151.12,
      volume: "82.3K",
      category: "forex",
    },
    {
      symbol: "BTC/USD",
      name: "Bitcoin / US Dollar",
      price: 67245.8,
      previousPrice: 66000.5,
      change: 1245.3,
      changePercent: 1.89,
      high: 67890.0,
      low: 65780.5,
      volume: "12.5K",
      marketCap: "$1.32T",
      category: "crypto",
    },
    {
      symbol: "ETH/USD",
      name: "Ethereum / US Dollar",
      price: 3478.25,
      previousPrice: 3390.8,
      change: 87.45,
      changePercent: 2.58,
      high: 3512.4,
      low: 3385.7,
      volume: "8.7K",
      marketCap: "$418.2B",
      category: "crypto",
    },
    {
      symbol: "XAU/USD",
      name: "Gold / US Dollar",
      price: 2345.6,
      previousPrice: 2358.4,
      change: -12.8,
      changePercent: -0.54,
      high: 2358.4,
      low: 2342.1,
      volume: "154.2K",
      category: "commodities",
    },
    {
      symbol: "US30",
      name: "Dow Jones Industrial Average",
      price: 39875.25,
      previousPrice: 39750.12,
      change: 125.13,
      changePercent: 0.31,
      high: 39920.45,
      low: 39710.8,
      volume: "2.1M",
      category: "indices",
    },
    {
      symbol: "NAS100",
      name: "Nasdaq 100",
      price: 18245.67,
      previousPrice: 18350.22,
      change: -104.55,
      changePercent: -0.57,
      high: 18350.22,
      low: 18200.15,
      volume: "1.8M",
      category: "indices",
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 187.45,
      previousPrice: 179.84,
      change: 7.61,
      changePercent: 4.23,
      high: 188.12,
      low: 179.84,
      volume: "5.2M",
      marketCap: "$2.94T",
      category: "stocks",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 178.32,
      previousPrice: 189.12,
      change: -10.8,
      changePercent: -5.71,
      high: 189.12,
      low: 177.45,
      volume: "4.8M",
      marketCap: "$567.2B",
      category: "stocks",
    },
    {
      symbol: "XRP/USD",
      name: "Ripple / US Dollar",
      price: 0.5423,
      previousPrice: 0.5258,
      change: 0.0165,
      changePercent: 3.14,
      high: 0.5475,
      low: 0.5258,
      volume: "42.3M",
      marketCap: "$29.8B",
      category: "crypto",
    },
    {
      symbol: "UK100",
      name: "FTSE 100",
      price: 8142.8,
      previousPrice: 8125.2,
      change: 17.6,
      changePercent: 0.22,
      high: 8155.4,
      low: 8120.6,
      volume: "950K",
      category: "indices",
    },
  ]

  // Initialize market data
  useEffect(() => {
    setMarketData(initialMarketData)
    setIsLoading(false)
    // Set default selected symbol
    setSelectedSymbol("EUR/USD")
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prevData) => {
        return prevData.map((asset) => {
          // Random price change within a reasonable range
          const priceChange = asset.price * (Math.random() * 0.01 - 0.005)
          const newPrice = Number.parseFloat((asset.price + priceChange).toFixed(asset.price < 10 ? 4 : 2))

          // Calculate new high and low
          const newHigh = newPrice > asset.high ? newPrice : asset.high
          const newLow = newPrice < asset.low ? newPrice : asset.low

          // Calculate change and change percent
          const change = Number.parseFloat((newPrice - asset.previousPrice).toFixed(asset.price < 10 ? 4 : 2))
          const changePercent = Number.parseFloat(((change / asset.previousPrice) * 100).toFixed(2))

          return {
            ...asset,
            price: newPrice,
            previousPrice: asset.price,
            change,
            changePercent,
            high: newHigh,
            low: newLow,
          }
        })
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Filter and sort data
  const filteredData = marketData.filter((asset) => {
    // Filter by category
    if (selectedCategory !== "all" && asset.category !== selectedCategory) {
      return false
    }

    // Filter by search query
    if (
      searchQuery &&
      !asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0

    if (sortBy === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol)
    } else if (sortBy === "price") {
      comparison = a.price - b.price
    } else if (sortBy === "change") {
      comparison = a.change - b.change
    } else if (sortBy === "changePercent") {
      comparison = a.changePercent - b.changePercent
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Handle sort click
  const handleSortClick = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null

    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    )
  }

  // Format price change with + or - sign
  const formatChange = (change: number) => {
    return change >= 0 ? `+${change.toFixed(change < 10 ? 4 : 2)}` : change.toFixed(change < 10 ? 4 : 2)
  }

  // Format price change percent with + or - sign
  const formatChangePercent = (changePercent: number) => {
    return changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart section */}
      <div className="lg:col-span-2">{selectedSymbol && <TradingViewChart symbol={selectedSymbol} />}</div>

      {/* Market data section */}
      <div>
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-4">
              <CardTitle className="text-xl">Market Watch</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Markets</SelectItem>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="indices">Indices</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                    <SelectItem value="stocks">Stocks</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setIsLoading(true)} className="h-10 w-10">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-[600px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b">
                    <th className="text-left font-medium p-2 cursor-pointer" onClick={() => handleSortClick("symbol")}>
                      <span className="flex items-center">Symbol {renderSortIndicator("symbol")}</span>
                    </th>
                    <th className="text-right font-medium p-2 cursor-pointer" onClick={() => handleSortClick("price")}>
                      <span className="flex items-center justify-end">Price {renderSortIndicator("price")}</span>
                    </th>
                    <th
                      className="text-right font-medium p-2 cursor-pointer"
                      onClick={() => handleSortClick("changePercent")}
                    >
                      <span className="flex items-center justify-end">
                        Chg % {renderSortIndicator("changePercent")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading market data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        No market data found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((asset, index) => (
                      <tr
                        key={index}
                        className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                          selectedSymbol === asset.symbol ? "bg-muted/50" : ""
                        }`}
                        onClick={() => setSelectedSymbol(asset.symbol)}
                      >
                        <td className="p-2 font-medium">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 text-xs">
                              {asset.category.toUpperCase()}
                            </Badge>
                            {asset.symbol}
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono">
                          {asset.price < 10 ? asset.price.toFixed(4) : asset.price.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-right font-mono ${
                            asset.changePercent >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <div className="flex items-center justify-end">
                            {asset.changePercent >= 0 ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {formatChangePercent(asset.changePercent)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
