import { Target, Users, Lightbulb } from "lucide-react"

export function AboutSection() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto aspect-[4/3] max-w-lg">
              <img
                src="/student-receiving-career-guidance-mentorship--illu.jpg"
                alt="Student receiving career guidance"
                className="relative z-10 h-full w-full rounded-3xl object-cover shadow-2xl brightness-110 contrast-125 saturate-110"
              />
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary border border-primary/20 transition-all duration-200 hover:bg-primary/15 active:scale-[0.98]">
              About CareerHoop
            </div>

            <h2 className="font-sans text-3xl font-bold leading-tight text-foreground md:text-4xl text-balance">
              Empowering Students to <span className="text-primary">Make Confident</span> Career Choices
            </h2>

            <p className="text-lg leading-relaxed text-foreground/90">
              CareerHoop is your personal career companion designed specifically for students. We combine smart
              technology with expert guidance to help you discover career paths that match your interests, skills, and
              aspirations.
            </p>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm border border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Personalized</h3>
                <p className="text-sm text-foreground/80">Tailored to you</p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm border border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/30">
                  <Users className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Guided</h3>
                <p className="text-sm text-foreground/80">Expert mentors</p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm border border-border/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <Lightbulb className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Simple</h3>
                <p className="text-sm text-foreground/80">Easy to use</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

