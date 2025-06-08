"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock news data with proper images
const mockNewsData = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cut in September",
    excerpt:
      "Federal Reserve officials have indicated they may begin cutting interest rates in September, citing improving inflation data and concerns about economic growth.",
    date: "2 hours ago",
    category: "Economy",
    image: "https://images.unsplash.com/photo-1611324586758-17b1b52b0e4c?q=80&w=1000&auto=format&fit=crop",
    source: "Financial Times",
  },
  {
    id: 2,
    title: "Bitcoin Breaks $67K Resistance Level",
    excerpt:
      "Bitcoin has surged past the $67,000 resistance level, reaching its highest point in the last three weeks amid increased institutional buying and positive market sentiment.",
    date: "4 hours ago",
    category: "Crypto",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop",
    source: "CoinDesk",
  },
  {
    id: 3,
    title: "Oil Prices Surge as Middle East Tensions Escalate",
    excerpt:
      "Crude oil prices have jumped 3% as geopolitical tensions in the Middle East raise concerns about potential supply disruptions. Analysts predict continued volatility.",
    date: "6 hours ago",
    category: "Commodities",
    image: "https://images.unsplash.com/photo-1582182300890-32b4a43e3c4d?q=80&w=1000&auto=format&fit=crop",
    source: "Bloomberg",
  },
  {
    id: 4,
    title: "European Markets Rally on Strong Corporate Earnings",
    excerpt:
      "European stock markets closed higher today as several major companies reported better-than-expected quarterly earnings, boosting investor confidence in the region's economic outlook.",
    date: "8 hours ago",
    category: "Stocks",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1000&auto=format&fit=crop",
    source: "Reuters",
  },
  {
    id: 5,
    title: "Japanese Yen Weakens Further Against Dollar",
    excerpt:
      "The Japanese yen continued its downward trend against the US dollar, reaching a new 34-year low as the Bank of Japan maintains its dovish monetary policy stance.",
    date: "10 hours ago",
    category: "Forex",
    image: "https://images.unsplash.com/photo-1601457200391-5b8ed5378d2b?q=80&w=1000&auto=format&fit=crop",
    source: "Nikkei",
  },
  {
    id: 6,
    title: "Tech Giants Face New Regulatory Challenges in EU",
    excerpt:
      "Major technology companies are preparing for new compliance requirements as the EU's Digital Markets Act comes into full effect, potentially impacting their business models and market strategies.",
    date: "12 hours ago",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
    source: "The Verge",
  },
]

export default function MarketNews() {
  const [news, setNews] = useState(mockNewsData.slice(0, 3))
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate real-time news updates
  const refreshNews = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Shuffle the news array to simulate new content
      const shuffled = [...mockNewsData].sort(() => 0.5 - Math.random())
      setNews(shuffled.slice(0, 3))
      setLastUpdated(new Date())
      setIsLoading(false)
    }, 1000)
  }

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNews()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-muted py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest Market News</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest developments in the financial markets.
              <span className="text-xs ml-2">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={refreshNews} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            <Button variant="outline">
              View All News
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <Badge className="bg-primary text-primary-foreground">{item.category}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.source}</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {item.date}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                <Button variant="link" className="px-0">
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <EconomicCalendar />
        </div>
      </div>
    </section>
  )
}

function EconomicCalendar() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Get today's date in a readable format
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Economic events for today and upcoming days
  const economicEvents = [
    {
      time: "08:30 EST",
      date: today,
      event: "US Nonfarm Payrolls",
      country: "US",
      impact: "high",
      forecast: "175K",
      previous: "165K",
      actual: "182K",
      status: "released",
    },
    {
      time: "10:00 EST",
      date: today,
      event: "EU CPI y/y",
      country: "EU",
      impact: "medium",
      forecast: "2.4%",
      previous: "2.6%",
      actual: "2.3%",
      status: "released",
    },
    {
      time: "12:30 EST",
      date: today,
      event: "CAD Employment Change",
      country: "CA",
      impact: "medium",
      forecast: "21.2K",
      previous: "17.5K",
      actual: null,
      status: "upcoming",
    },
    {
      time: "14:00 EST",
      date: today,
      event: "US ISM Services PMI",
      country: "US",
      impact: "medium",
      forecast: "52.1",
      previous: "51.4",
      actual: null,
      status: "upcoming",
    },
    {
      time: "18:00 EST",
      date: today,
      event: "FOMC Member Speech",
      country: "US",
      impact: "low",
      forecast: "-",
      previous: "-",
      actual: null,
      status: "upcoming",
    },
    {
      time: "19:50 EST",
      date: today,
      event: "JP GDP q/q",
      country: "JP",
      impact: "high",
      forecast: "0.3%",
      previous: "0.1%",
      actual: null,
      status: "upcoming",
    },
    {
      time: "02:00 EST",
      date: "Tomorrow",
      event: "CNY CPI y/y",
      country: "CN",
      impact: "medium",
      forecast: "0.4%",
      previous: "0.1%",
      actual: null,
      status: "upcoming",
    },
    {
      time: "04:30 EST",
      date: "Tomorrow",
      event: "UK Manufacturing Production m/m",
      country: "UK",
      impact: "medium",
      forecast: "0.2%",
      previous: "-0.1%",
      actual: null,
      status: "upcoming",
    },
  ]

  const refreshCalendar = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsLoading(false)
    }, 1000)
  }

  // Get flag emoji for country code
  const getCountryFlag = (countryCode: string) => {
    const flagEmojis: Record<string, string> = {
      US: "🇺🇸",
      EU: "🇪🇺",
      UK: "🇬🇧",
      CA: "🇨🇦",
      JP: "🇯🇵",
      CN: "🇨🇳",
      AU: "🇦🇺",
    }

    return flagEmojis[countryCode] || "🌐"
  }

  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle>Economic Calendar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upcoming economic events and releases
            <span className="text-xs ml-2">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshCalendar} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-2">Time</th>
                <th className="text-left font-medium p-2">Country</th>
                <th className="text-left font-medium p-2">Event</th>
                <th className="text-left font-medium p-2">Impact</th>
                <th className="text-left font-medium p-2">Forecast</th>
                <th className="text-left font-medium p-2">Previous</th>
                <th className="text-left font-medium p-2">Actual</th>
              </tr>
            </thead>
            <tbody>
              {economicEvents.map((event, index) => (
                <tr key={index} className={`border-b ${event.date !== today ? "bg-muted/30" : ""}`}>
                  <td className="p-2 whitespace-nowrap">
                    {event.date !== today && (
                      <span className="text-xs font-medium text-muted-foreground block">{event.date}</span>
                    )}
                    {event.time}
                  </td>
                  <td className="p-2">
                    <span className="flex items-center gap-1">
                      <span className="text-lg" aria-hidden="true">
                        {getCountryFlag(event.country)}
                      </span>
                      <span className="sr-only">{event.country}</span>
                    </span>
                  </td>
                  <td className="p-2 font-medium">{event.event}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        event.impact === "high"
                          ? "bg-red-100 text-red-800"
                          : event.impact === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
                    </span>
                  </td>
                  <td className="p-2">{event.forecast}</td>
                  <td className="p-2">{event.previous}</td>
                  <td className="p-2">
                    {event.status === "released" ? (
                      <span
                        className={`font-medium ${
                          event.actual &&
                          event.forecast &&
                          Number.parseFloat(event.actual.replace(/[^0-9.-]+/g, "")) >
                            Number.parseFloat(event.forecast.replace(/[^0-9.-]+/g, ""))
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {event.actual}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Button variant="link" className="px-0">
            View Full Calendar
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
