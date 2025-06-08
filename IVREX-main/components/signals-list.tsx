import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, Clock, Info } from "lucide-react"

export default function SignalsList() {
  return (
    <Tabs defaultValue="active">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="active">Active Signals</TabsTrigger>
          <TabsTrigger value="history">Signal History</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm">
          <Info className="mr-2 h-4 w-4" />
          Signal Settings
        </Button>
      </div>

      <TabsContent value="active">
        <div className="space-y-4">
          {[
            {
              symbol: "EUR/USD",
              type: "BUY",
              entry: "1.0890",
              current: "1.0905",
              stopLoss: "1.0860",
              takeProfit: "1.0950",
              timeframe: "4H",
              time: "2h ago",
              profit: "+0.14%",
              status: "In Profit",
            },
            {
              symbol: "BTC/USD",
              type: "SELL",
              entry: "67,500.00",
              current: "67,320.50",
              stopLoss: "68,200.00",
              takeProfit: "66,000.00",
              timeframe: "1D",
              time: "5h ago",
              profit: "+0.27%",
              status: "In Profit",
            },
            {
              symbol: "XAU/USD",
              type: "BUY",
              entry: "2,340.00",
              current: "2,335.80",
              stopLoss: "2,320.00",
              takeProfit: "2,380.00",
              timeframe: "1D",
              time: "8h ago",
              profit: "-0.18%",
              status: "In Loss",
            },
            {
              symbol: "USD/JPY",
              type: "SELL",
              entry: "151.50",
              current: "151.65",
              stopLoss: "152.00",
              takeProfit: "150.50",
              timeframe: "4H",
              time: "12h ago",
              profit: "-0.10%",
              status: "In Loss",
            },
          ].map((signal, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CardTitle>{signal.symbol}</CardTitle>
                    <Badge variant={signal.type === "BUY" ? "default" : "destructive"}>{signal.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{signal.time}</span>
                  </div>
                </div>
                <CardDescription>Timeframe: {signal.timeframe}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Entry Price</p>
                    <p className="font-medium">{signal.entry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="font-medium">{signal.current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stop Loss</p>
                    <p className="font-medium">{signal.stopLoss}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Take Profit</p>
                    <p className="font-medium">{signal.takeProfit}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={signal.status === "In Profit" ? "outline" : "secondary"}
                      className={
                        signal.status === "In Profit" ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"
                      }
                    >
                      {signal.status}
                    </Badge>
                    <span
                      className={`text-sm flex items-center ${signal.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                    >
                      {signal.profit.startsWith("+") ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {signal.profit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Chart
                    </Button>
                    <Button size="sm">Close Position</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
            <CardDescription>Your past trading signals and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Symbol</th>
                    <th className="text-left font-medium p-2">Type</th>
                    <th className="text-left font-medium p-2">Entry</th>
                    <th className="text-left font-medium p-2">Exit</th>
                    <th className="text-left font-medium p-2">Profit/Loss</th>
                    <th className="text-left font-medium p-2">Date</th>
                    <th className="text-left font-medium p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      symbol: "GBP/USD",
                      type: "BUY",
                      entry: "1.2640",
                      exit: "1.2695",
                      profit: "+0.43%",
                      date: "May 15, 2025",
                      status: "Win",
                    },
                    {
                      symbol: "ETH/USD",
                      type: "SELL",
                      entry: "3,520.00",
                      exit: "3,480.50",
                      profit: "+1.12%",
                      date: "May 14, 2025",
                      status: "Win",
                    },
                    {
                      symbol: "USD/CAD",
                      type: "BUY",
                      entry: "1.3650",
                      exit: "1.3620",
                      profit: "-0.22%",
                      date: "May 13, 2025",
                      status: "Loss",
                    },
                    {
                      symbol: "NAS100",
                      type: "SELL",
                      entry: "18,450.00",
                      exit: "18,520.00",
                      profit: "-0.38%",
                      date: "May 12, 2025",
                      status: "Loss",
                    },
                    {
                      symbol: "XAU/USD",
                      type: "BUY",
                      entry: "2,320.00",
                      exit: "2,345.00",
                      profit: "+1.08%",
                      date: "May 11, 2025",
                      status: "Win",
                    },
                    {
                      symbol: "EUR/JPY",
                      type: "SELL",
                      entry: "164.50",
                      exit: "163.80",
                      profit: "+0.43%",
                      date: "May 10, 2025",
                      status: "Win",
                    },
                    {
                      symbol: "TSLA",
                      type: "BUY",
                      entry: "182.40",
                      exit: "187.65",
                      profit: "+2.88%",
                      date: "May 9, 2025",
                      status: "Win",
                    },
                  ].map((signal, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{signal.symbol}</td>
                      <td className="p-2">
                        <Badge variant={signal.type === "BUY" ? "default" : "destructive"} className="text-xs">
                          {signal.type}
                        </Badge>
                      </td>
                      <td className="p-2">{signal.entry}</td>
                      <td className="p-2">{signal.exit}</td>
                      <td className={`p-2 ${signal.profit.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {signal.profit}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">{signal.date}</td>
                      <td className="p-2">
                        <Badge
                          variant="outline"
                          className={signal.status === "Win" ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"}
                        >
                          {signal.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
