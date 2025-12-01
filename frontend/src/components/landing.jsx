import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { FeaturesSection } from "@/components/features-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <WhyChooseSection />
      <CTASection />
      <Footer />
    </main>
  )
}

