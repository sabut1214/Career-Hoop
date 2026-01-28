import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-soft)] via-[var(--primary-soft)]/80 to-[var(--primary-soft)]/60 px-4 py-16 md:py-24 lg:py-32">
      {/* Decorative elements - very subtle */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 text-center lg:text-left">
            <Badge variant="accent" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Your Career Journey Starts Here
            </Badge>

            <h1 className="font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Find Your Future,{" "}
              <span className="text-primary">
                Build Your Career
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-foreground/90 lg:mx-0">
              areerHoop helps students discover their perfect career path through personalized guidance, skill
              assessments, and college recommendations. Your dream future is just a few clicks away.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary-hover transition-[background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                asChild
              >
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full px-8 transition-[background-color,border-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                asChild
              >
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4 lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-foreground/80">Students Guided</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-foreground/80">Career Paths</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-foreground/80">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-square max-w-md">
              <img
                src="/diverse-students-exploring-careers-on-laptop--illu.jpg"
                alt="Students exploring career paths on laptops"
                className="relative z-10 h-full w-full rounded-xl object-cover shadow-xl brightness-110 contrast-125 saturate-110"
              />

              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 z-20 rounded-xl bg-card p-3 shadow-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <Sparkles className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Career Match</p>
                    <p className="text-xs text-muted-foreground">95% Compatible</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 z-20 rounded-xl bg-card p-3 shadow-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                    <span className="text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Goals Achieved</p>
                    <p className="text-xs text-muted-foreground">12 this month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
