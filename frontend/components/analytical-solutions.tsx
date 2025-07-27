"use client"

import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import TradingViewChart from "@/components/trading-view-chart"
import { LineChart, ChevronsUpDown } from "lucide-react"

export default function AnalyticalSolutions() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Analytical Solutions</CardTitle>
                <CardDescription>Market Watch with Real-Time Chart</CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-1 rounded-md hover:bg-muted">
                <ChevronsUpDown className="h-5 w-5" />
                <span className="sr-only">Toggle</span>
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent className="flex-1">
          <CardContent className="h-full">
            <TradingViewChart symbol="EUR/USD" />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
} 