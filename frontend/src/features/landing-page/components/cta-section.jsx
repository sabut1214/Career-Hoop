import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="container relative mx-auto max-w-4xl text-center text-white">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Ready to Begin?
        </div>

        <h2 className="mb-6 font-sans text-3xl font-bold md:text-5xl text-balance">Start Your Career Journey Today</h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90">
          Join thousands of students who have already discovered their perfect career path. Your future is waiting — take the first step now.
        </p>

        <Button
          size="lg"
          className="gap-2 rounded-full bg-white px-10 py-6 text-lg font-semibold text-primary hover:bg-white/90 shadow-xl"
          asChild
        >
          <Link to="/signup">
            Start Your Journey
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>

        <p className="mt-6 text-sm text-white/70">Free to get started • No credit card required</p>
      </div>
    </section>
  )
}

