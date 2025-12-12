import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10 px-4 py-20 md:py-32">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-5 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Your Career Journey Starts Here
            </div>

            <h1 className="font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Find Your Future,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Build Your Career
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
              CareerHoop helps students discover their perfect career path through personalized guidance, skill
              assessments, and expert mentorship. Your dream future is just a few clicks away.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-primary/20 hover:bg-primary/5 bg-transparent"
                asChild
              >
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-4 lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Students Guided</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Career Paths</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-5 duration-700 delay-200">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20" />
              <img
                src="/diverse-students-exploring-careers-on-laptop--illu.jpg"
                alt="Students exploring career paths on laptops"
                className="relative z-10 h-full w-full rounded-3xl object-cover"
              />

              {/* Floating cards */}
              <div className="absolute -left-4 top-1/4 z-20 rounded-xl bg-card p-3 shadow-lg animate-in fade-in zoom-in duration-500 delay-500">
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

              <div className="absolute -right-4 bottom-1/4 z-20 rounded-xl bg-card p-3 shadow-lg animate-in fade-in zoom-in duration-500 delay-700">
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

