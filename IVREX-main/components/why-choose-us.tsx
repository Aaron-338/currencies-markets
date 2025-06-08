"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Lock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"

export default function WhyChooseUs() {
  // Add swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchDown = e.touches[0].clientX
    setTouchStart(touchDown)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) {
      return
    }

    const currentTouch = e.touches[0].clientX
    const diff = touchStart - currentTouch

    // Swipe threshold
    if (diff > 5) {
      goToNextSlide()
      setTouchStart(null)
    }

    if (diff < -5) {
      goToPrevSlide()
      setTouchStart(null)
    }
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "High-Accuracy Signals",
      description:
        "Our professional trading signals consistently deliver up to 85% accuracy across various market conditions.",
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "Secure Transactions",
      description:
        "Bank-grade security protocols and segregated client accounts ensure your funds and data remain protected.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Expert Mentors",
      description:
        "Learn from professional traders with years of experience in institutional and retail trading environments.",
    },
  ]

  // Images for the slideshow
  const slideshowImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.jpg-2kSDBKvtQmKpoAsXAR9IrOtVMShop5.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2.jpg-zWzmsUM80ndTzSdw5UHsMiXo1OxeV1.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-Bcrlx4oRgiTu2CbEJ3VOMB2W8Zs1nv.jpeg",
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slideshowImages.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [slideshowImages.length])

  // Navigation functions
  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slideshowImages.length - 1 : prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slideshowImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="bg-muted py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Ivrex</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine cutting-edge technology with human expertise to provide you with the best trading experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-background border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-card rounded-lg overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Our Commitment to Excellence</h3>
              <p className="text-muted-foreground mb-6">
                At Ivrex, we're committed to providing traders with the tools, knowledge, and support they need to
                succeed in the financial markets.
              </p>
              <ul className="space-y-3">
                {[
                  "Continuous improvement of our trading algorithms",
                  "Rigorous vetting of all trading mentors",
                  "Transparent fee structure with no hidden costs",
                  "24/7 customer support for all clients",
                  "Regular educational webinars and resources",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary mr-2 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[300px] sm:h-[400px] md:h-auto">
              {/* Slideshow */}
              <div
                className="relative w-full h-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              >
                {slideshowImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      currentSlide === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Ivrex training session ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}

                {/* Navigation arrows */}
                <button
                  onClick={goToPrevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={goToNextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 sm:p-3 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* Slide indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {slideshowImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full ${
                        currentSlide === index ? "bg-primary" : "bg-white/50"
                      } transition-colors touch-manipulation`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
