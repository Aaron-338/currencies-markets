import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import ImageSlider from "@/components/image-slider"

export default function Hero() {
  const sliderImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/494796865_4077027679207492_2139884082268754683_n.jpg-RxRJD62kM0z4S7uOTrs8wOYXzy4B40.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/488547074_4046799845563609_9042682479595034631_n.jpg-v8yZC7opbCuWnk9boek0LePqt2wq0e.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/492481483_4066827136894213_1215856276737018445_n.jpg-IQshuJ02TAFxsDmKxCkMsiaaHupbxk.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/490748485_4053910591519201_1643659557008252662_n.jpg-Cds3jhFbD3nl6oj5YyB2W4rA9e4pfe.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/490140499_4053910601519200_6530184504061377972_n.jpg-OlvlDLvc58oDqD5Xnj1VnK31tCgXAS.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/495113818_4080727602170833_7806145941902507898_n.jpg-NNZqErINjtb7irF2ZBtpO7nrULNDt5.jpeg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/499761289_4096474287262831_8674539781680130277_n.jpg-UUwtHy6GqwaUbyym5pdkg8HX67yzVG.jpeg",
  ]

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 z-0" />

      <div className="container relative z-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Professional Trading <span className="text-primary">Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Professional trading signals, expert mentorship, and secure investment opportunities for traders of all
              levels.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth?tab=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Join Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Free Signals Trial
                </Button>
              </Link>
              <Link href="/support">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30"></div>
            <div className="relative h-full bg-card rounded-lg overflow-hidden shadow-xl">
              <ImageSlider images={sliderImages} autoPlayInterval={5000} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
