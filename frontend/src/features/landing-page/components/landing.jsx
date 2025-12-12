import { Navbar } from "@/shared/components/layout/navbar"
import { HeroSection } from "./hero-section"
import { AboutSection } from "./about-section"
import { FeaturesSection } from "./features-section"
import { WhyChooseSection } from "./why-choose-section"
import { CTASection } from "./cta-section"
import { Footer } from "@/shared/components/layout/footer"

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

