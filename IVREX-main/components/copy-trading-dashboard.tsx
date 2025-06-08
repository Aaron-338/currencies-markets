import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Copy, Star, TrendingUp, Users } from "lucide-react"

export default function CopyTradingDashboard() {
  return (
    <Tabs defaultValue="traders">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
          <TabsTrigger value="copied">Traders You Copy</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Find Traders
        </Button>
      </div>

      <TabsContent value="traders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Alex Morgan",
              username: "alexm_trader",
              avatar: "/placeholder.svg?height=100&width=100",
              profit: "+32.5%",
              followers: 1245,
              winRate: 78,
              trades: 342,
              specialties: ["Forex", "Indices"],
              risk: "Medium",
            },
            {
              name: "Sarah Chen",
              username: "sarahc_fx",
              avatar: "/placeholder.svg?height=100&width=100",
              profit: "+28.7%",
              followers: 987,
              winRate: 82,
              trades: 256,
              specialties: ["Crypto", "Commodities"],
              risk: "Low",
            },
            {
              name: "Michael Rodriguez",
              username: "miker_trading",
              avatar: "/placeholder.svg?height=100&width=100",
              profit: "+45.2%",
              followers: 2134,
              winRate: 71,
              trades: 512,
              specialties: ["Stocks", "Options"],
              risk: "High",
            },
            {
              name: "Emma Patel",
              username: "emma_trades",
              avatar: "/placeholder.svg?height=100&width=100",
              profit: "+21.8%",
              followers: 765,
              winRate: 75,
              trades: 189,
              specialties: ["Forex", "Crypto"],
              risk: "Medium",
            },
          ].map((trader, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                      <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{trader.name}</CardTitle>
                      <CardDescription>@{trader.username}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center text-green-500 font-medium">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {trader.profit}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="font-medium">{trader.followers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="font-medium">{trader.winRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="font-medium">{trader.trades}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Risk Level</span>
                    <span className="font-medium">{trader.risk}</span>
                  </div>
                  <Progress value={trader.risk === "Low" ? 33 : trader.risk === "Medium" ? 66 : 100} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {trader.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Trader
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="copied">
        <Card>
          <CardHeader>
            <CardTitle>Traders You Copy</CardTitle>
            <CardDescription>Manage your copy trading relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  name: "Alex Morgan",
                  username: "alexm_trader",
                  avatar: "/placeholder.svg?height=100&width=100",
                  profit: "+12.8%",
                  allocation: "$5,000",
                  openTrades: 3,
                  status: "Active",
                  lastTrade: "2h ago",
                },
                {
                  name: "Michael Rodriguez",
                  username: "miker_trading",
                  avatar: "/placeholder.svg?height=100&width=100",
                  profit: "+8.5%",
                  allocation: "$3,500",
                  openTrades: 1,
                  status: "Active",
                  lastTrade: "5h ago",
                },
              ].map((trader, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                      <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{trader.name}</p>
                      <p className="text-sm text-muted-foreground">@{trader.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                    <div>
                      <p className="text-xs text-muted-foreground">Profit/Loss</p>
                      <p className="font-medium text-green-500">{trader.profit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Allocation</p>
                      <p className="font-medium">{trader.allocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Open Trades</p>
                      <p className="font-medium">{trader.openTrades}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Trade</p>
                      <p className="font-medium">{trader.lastTrade}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1 md:flex-none">
                      Stop Copying
                    </Button>
                  </div>
                </div>
              ))}

              <div className="text-center pt-4">
                <p className="text-muted-foreground mb-4">Looking for more traders to copy?</p>
                <Button>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Browse Top Traders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
