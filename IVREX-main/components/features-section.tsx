import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Brain, Copy, DollarSign, Lightbulb, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
      title: "Synthetic Trading Signals",
      description: "Professional trading signals with up to 85% accuracy for synthetic indices markets.",
      details: [
        "Index Name – e.g., VIX75, Boom 1000",
        "Trade Direction – Buy (long) or Sell (short)",
        "Entry Price",
        "Stop Loss (SL) – to limit potential losses",
        "Take Profit (TP) – target profit level",
        "Time Frame – e.g., M15 (15-minute chart), H1, etc.",
      ],
      pricing: "M300 Weekly / M1000 Monthly",
      info: "Synthetic indices are computer-generated markets that operate 24/7, are not affected by real-world news, and are based on cryptographically secure random number generators.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Mentorship Programs",
      description: "Structured guidance designed to help you improve your trading skills with experienced traders.",
      details: [
        "Group Mentorship (10 individuals) - M1000",
        "Online Mentorship (via Zoom/Google Meet) - M2000",
        "Physical Classes (at our offices) - M3000",
        "One-on-One Coaching (Private) - M5000",
      ],
      pricing: "From M1000",
      info: "Our mentorship is about shaping traders into leaders, rebuilding identity and offering real life support from a community that moves with structure.",
    },
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Forex Signals",
      description: "Trade recommendations for buying or selling currency pairs in the foreign exchange market.",
      details: [
        "Real-time signals",
        "Trade management updates",
        "Daily recap",
        "SL & TP and entry prices",
        "Clearly defined risk-reward ratios",
      ],
      pricing: "M250 Weekly",
      info: "Receive high quality trade signals with guided trade management to maximize your forex trading potential.",
    },
    {
      icon: <Copy className="h-10 w-10 text-primary" />,
      title: "Copy Trading",
      description: "Automatically replicate trades from our experienced traders with proven track records.",
      details: [
        "Fully managed trading master account",
        "Performance reports",
        "Risk-controlled strategies",
        "Withdraw once in 30 days",
      ],
      pricing: "M1000 Monthly",
      info: "Why fund your own incompetence, when you can leverage someone's experience?",
    },
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      title: "Pool Accounts",
      description: "A secure collective trading account that generates returns from large-scale IVREX operations.",
      details: ["Trade Transparency", "Institutional-grade strategies", "Real-time reporting", "Sustainable ROI"],
      pricing: "Contact for pricing",
      info: "Let your money join the fight – and return with more. Ideal for passive income seekers, busy professionals, and small capital investors.",
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Deriv Payment Agent",
      description: "Fast and secure deposit and withdrawal services for Deriv platform users.",
      details: [
        "Instant deposits & withdrawals",
        "Low processing fees",
        "Support included",
        "Licensed and approved Deriv agent",
      ],
      pricing: "Competitive fees",
      info: "We help local traders deposit and withdraw their funds using local payment methods, EcoCash and Mpesa with no stress.",
    },
  ]

  return (
    <section id="features" className="container py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Comprehensive trading solutions designed to help you succeed in today's complex financial markets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">{feature.info}</p>
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">What's Included:</h4>
                <ul className="space-y-2 text-sm">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-0">
              <div className="w-full pb-4">
                <div className="text-sm font-medium">Pricing:</div>
                <div className="text-primary font-bold">{feature.pricing}</div>
              </div>
              <Button className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
