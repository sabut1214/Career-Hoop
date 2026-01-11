import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-soft)] via-[var(--primary-soft)]/70 to-[var(--primary-soft)]/50">
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <SectionContainer className="relative text-center text-foreground">
        <Badge variant="outline" className="mb-6 border-primary/30 hover:bg-primary/10">
          <Sparkles className="h-4 w-4" />
          Ready to Begin?
        </Badge>

        <h2 className="mb-6 font-sans text-3xl font-bold md:text-5xl text-balance text-foreground">Start Your Career Journey Today</h2>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/90">
          Join thousands of students who have already discovered their perfect career path. Your future is waiting — take the first step now.
        </p>

        <Button
          size="lg"
          className="gap-2 rounded-full px-10 py-6 text-lg font-semibold shadow-xl transition-[background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          asChild
        >
          <Link to="/signup">
            Start Your Journey
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">Free to get started • No credit card required</p>
      </SectionContainer>
    </section>
  )
}

