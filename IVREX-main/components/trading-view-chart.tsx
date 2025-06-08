"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2 } from "lucide-react"

interface TradingViewChartProps {
  symbol: string
  fullscreen?: boolean
  onClose?: () => void
}

export default function TradingViewChart({ symbol, fullscreen = false, onClose }: TradingViewChartProps) {
  const [timeframe, setTimeframe] = useState("1h")
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(fullscreen)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load TradingView widget script
  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.async = true
      script.onload = () => setScriptLoaded(true)
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [scriptLoaded])

  // Initialize TradingView widget
  useEffect(() => {
    if (scriptLoaded && containerRef.current) {
      // Clear previous widget if any
      containerRef.current.innerHTML = ""

      // Format symbol for TradingView
      const formattedSymbol = formatSymbolForTradingView(symbol)

      // Create new widget
      // @ts-ignore - TradingView widget is loaded via script
      new window.TradingView.widget({
        width: "100%",
        height: isFullscreen ? "calc(100% - 40px)" : "400",
        symbol: formattedSymbol,
        interval: convertTimeframe(timeframe),
        timezone: "Etc/UTC",
        theme: "light",
        style: "1", // Candlestick
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerRef.current.id,
        hide_side_toolbar: false,
        studies: ["MASimple@tv-basicstudies", "RSI@tv-basicstudies"],
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: ["study_templates"],
      })
    }
  }, [symbol, timeframe, isFullscreen, scriptLoaded])

  // Format symbol for TradingView
  const formatSymbolForTradingView = (symbol: string): string => {
    // Convert common symbols to TradingView format
    if (symbol.includes("/")) {
      const [base, quote] = symbol.split("/")

      // Handle forex pairs
      if (base.length === 3 && quote.length === 3) {
        return `FX:${base}${quote}`
      }

      // Handle crypto pairs
      if (quote === "USD") {
        return `CRYPTO:${base}USD`
      }
    }

    // Handle indices
    if (symbol === "US30") return "DJ:DJI"
    if (symbol === "NAS100") return "NASDAQ:NDX"
    if (symbol === "UK100") return "FOREXCOM:UK100"

    // Handle commodities
    if (symbol === "XAU/USD") return "OANDA:XAUUSD"

    // Handle stocks
    if (["AAPL", "TSLA"].includes(symbol)) {
      return `NASDAQ:${symbol}`
    }

    // Default fallback
    return `OANDA:${symbol.replace("/", "")}`
  }

  // Convert our timeframe format to TradingView format
  const convertTimeframe = (tf: string): string => {
    switch (tf) {
      case "1m":
        return "1"
      case "5m":
        return "5"
      case "15m":
        return "15"
      case "30m":
        return "30"
      case "1h":
        return "60"
      case "4h":
        return "240"
      case "1d":
        return "D"
      case "1w":
        return "W"
      default:
        return "60" // Default to 1h
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Card className={`overflow-hidden ${isFullscreen ? "fixed inset-4 z-50" : "h-full"}`}>
      <div className="bg-muted p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">{symbol}</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="30m">30m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="1w">1W</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {onClose ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-0">
        <div
          id={`tradingview_${symbol.replace("/", "_")}`}
          ref={containerRef}
          className="w-full bg-card"
          style={{ height: isFullscreen ? "calc(100% - 40px)" : "400px" }}
        />
      </CardContent>
    </Card>
  )
}
