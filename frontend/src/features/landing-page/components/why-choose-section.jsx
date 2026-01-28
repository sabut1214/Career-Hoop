import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import { CheckCircle2, TrendingUp, Award, Shield } from "lucide-react"

const benefits = [
  {
    icon: CheckCircle2,
    title: "Clarity & Direction",
    description: "No more confusion about what to pursue. Get clear, actionable career guidance.",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description: "Our AI analyzes your profile to provide accurate, personalized recommendations.",
  },
  {
    icon: Award,
    title: "Proven Results",
    description: "Join thousands of students who found their dream careers through areerHoop.",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    description: "Built with student success in mind, backed by career experts and educators.",
  },
]

const testimonials = [
  {
    name: "Sarah M.",
    role: "Engineering Student",
    quote: "areerHoop helped me discover my passion for data science. I never knew it was the perfect fit!",
    avatar: "/young-female-student-avatar-smiling.jpg",
  },
  {
    name: "James K.",
    role: "High School Senior",
    quote: "The mentorship feature connected me with professionals who guided me through college applications.",
    avatar: "/young-male-student-avatar-friendly.jpg",
  },
  {
    name: "Priya R.",
    role: "College Freshman",
    quote: "I went from completely lost to having a clear 5-year career plan. Absolutely life-changing!",
    avatar: "/young-female-indian-student-avatar-happy.jpg",
  },
]

export function WhyChooseSection() {
  return (
    <SectionContainer>
      <div className="mb-16 text-center">
        <Badge variant="default" className="mb-4">
          Why areerHoop
        </Badge>
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">
            Why Students <span className="text-primary">Choose Us</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/90">
            We're committed to helping every student find their path with confidence
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-foreground/80">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Confidence Meter */}
        <div className="mb-16 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/20 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Student Confidence Meter</h3>
              <p className="text-foreground/90">
                Our students report a significant boost in career confidence after using areerHoop for just 30 days.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-foreground">Career Clarity</span>
                  <span className="font-medium text-primary">94%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 w-[94%] rounded-full bg-primary transition-all duration-1000" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-foreground">Decision Confidence</span>
                  <span className="font-medium text-secondary-foreground">89%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 w-[89%] rounded-full bg-secondary transition-all duration-1000" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-foreground">Goal Achievement</span>
                  <span className="font-medium text-primary">91%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 w-[91%] rounded-full bg-primary transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50 bg-card transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <CardContent className="p-6">
                <p className="mb-6 text-foreground/80 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-foreground/70">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </SectionContainer>
  )
}

