"use client"

import { useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Bell,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  PieChart,
  Settings,
  Signal,
  Users,
  Wallet,
} from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import PortfolioSummary from "@/components/portfolio-summary"
import SignalsList from "@/components/signals-list"
import CopyTradingDashboard from "@/components/copy-trading-dashboard"
import DerivPaymentPortal from "@/components/deriv-payment-portal"
import PoolAccountManagement from "@/components/pool-account-management"
import BulkPaymentProcessing from "@/components/bulk-payment-processing"
import ApiIntegration from "@/components/api-integration"

export default function DashboardPage() {
  const [accountType, setAccountType] = useState<"personal" | "business">("personal")

  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider>
        <div className="flex h-full">
          <DashboardSidebar accountType={accountType} />
          <div className="flex-1 overflow-auto">
            <DashboardHeader accountType={accountType} onSwitchAccount={setAccountType} />

            <div className="container p-4 md:p-6">
              {accountType === "personal" ? <PersonalDashboard /> : <BusinessDashboard />}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

function DashboardSidebar({ accountType }: { accountType: "personal" | "business" }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="bg-primary/10 p-1 rounded">
            <Signal className="h-6 w-6 text-primary" />
          </div>
          <div className="font-semibold text-xl">Ivrex</div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="/dashboard">
                    <Home />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {accountType === "personal" ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/signals">
                        <Signal />
                        <span>Trading Signals</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/copy-trading">
                        <Users />
                        <span>Copy Trading</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/payments">
                        <Wallet />
                        <span>Deriv Payments</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/pool-accounts">
                        <PieChart />
                        <span>Pool Accounts</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/bulk-payments">
                        <CreditCard />
                        <span>Bulk Payments</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/dashboard/api">
                        <LineChart />
                        <span>API Integration</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/billing">
                    <DollarSign />
                    <span>Billing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function PersonalDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personal Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Deposit
          </Button>
        </div>
      </div>

      <PortfolioSummary />

      <Tabs defaultValue="signals">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
          <TabsTrigger value="payments">Deriv Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="mt-6">
          <SignalsList />
        </TabsContent>

        <TabsContent value="copy-trading" className="mt-6">
          <CopyTradingDashboard />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <DerivPaymentPortal />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BusinessDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Business Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pool Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,248,590.45</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+124 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$84,325.12</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pool-accounts">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pool-accounts">Pool Accounts</TabsTrigger>
          <TabsTrigger value="bulk-payments">Bulk Payments</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="pool-accounts" className="mt-6">
          <PoolAccountManagement />
        </TabsContent>

        <TabsContent value="bulk-payments" className="mt-6">
          <BulkPaymentProcessing />
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <ApiIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
