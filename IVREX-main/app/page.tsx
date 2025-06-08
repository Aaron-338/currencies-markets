import Hero from "@/components/hero"
import FeaturesSection from "@/components/features-section"
import WhyChooseUs from "@/components/why-choose-us"
import MarketNews from "@/components/market-news"
import CallToAction from "@/components/call-to-action"
import FAQSection from "@/components/faq-section"
import MiniMarketWatch from "@/components/mini-market-watch"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FeaturesSection />
          </div>
          <div className="space-y-8">
            <MiniMarketWatch />
          </div>
        </div>
      </div>
      <WhyChooseUs />
      <MarketNews />
      <FAQSection />
      <CallToAction />
    </div>
  )
}
