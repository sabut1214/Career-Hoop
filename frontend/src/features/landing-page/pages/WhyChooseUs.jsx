import { Link } from "react-router-dom"
import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { CheckCircle2, TrendingUp, Award, Shield, Users, Zap, Heart, ArrowRight, Star } from "lucide-react"

const benefits = [
  {
    icon: CheckCircle2,
    title: "Clarity & Direction",
    description:
      "No more confusion about what to pursue. Our AI provides clear, actionable career guidance tailored to your unique profile.",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Insights",
    description:
      "We analyze millions of data points including job market trends, salary data, and growth projections to give you accurate recommendations.",
  },
  {
    icon: Award,
    title: "Proven Track Record",
    description:
      "With over 50,000 students guided and a 94% satisfaction rate, our platform has a proven track record of student success.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is secure with us. We never sell your information and use bank-level encryption to protect your privacy.",
  },
  {
    icon: Users,
    title: "Expert Mentorship",
    description:
      "Connect with 2,000+ verified professionals across industries who volunteer their time to guide the next generation.",
  },
  {
    icon: Zap,
    title: "Always Improving",
    description:
      "Our AI learns and improves constantly. We update our career database weekly to reflect the latest industry trends.",
  },
]

const stats = [
  { value: "50K+", label: "Students Guided" },
  { value: "94%", label: "Satisfaction Rate" },
  { value: "2000+", label: "Expert Mentors" },
  { value: "500+", label: "Career Paths" },
]

const testimonials = [
  {
    name: "Sarah M.",
    role: "Engineering Student, MIT",
    quote:
      "CareerHoop helped me discover my passion for data science when I was torn between multiple paths. The AI recommendations were spot-on, and my mentor helped me land an amazing internship!",
    avatar: "/young-female-student-portrait-smiling.jpg",
    rating: 5,
  },
  {
    name: "James K.",
    role: "High School Senior",
    quote:
      "I was completely lost about what to study in college. CareerHoop's assessment showed me careers I never considered but perfectly match my interests. Now I'm excited about my future!",
    avatar: "/young-male-student-portrait-friendly.jpg",
    rating: 5,
  },
  {
    name: "Priya R.",
    role: "College Freshman, UC Berkeley",
    quote:
      "The mentorship feature is incredible. I connected with a product manager at Google who gave me invaluable advice about breaking into tech. This platform is a game-changer.",
    avatar: "/young-indian-female-student-portrait-happy.jpg",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Community College Student",
    quote:
      "Coming from a low-income background, I never had access to career counseling. CareerHoop gave me the same quality guidance my wealthier peers get from expensive consultants.",
    avatar: "/young-black-male-student-portrait-confident.jpg",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Graduate Student, Stanford",
    quote:
      "I used CareerHoop to pivot from medicine to health tech. The skill gap analysis and course recommendations helped me make a smooth transition. Highly recommend!",
    avatar: "/young-asian-female-graduate-student-portrait.jpg",
    rating: 5,
  },
  {
    name: "David O.",
    role: "High School Junior",
    quote:
      "My school counselor is overloaded with students. CareerHoop gives me personalized attention 24/7. It's like having a career coach in my pocket.",
    avatar: "/teenage-male-student-portrait.jpg",
    rating: 5,
  },
]

const comparisons = [
  {
    feature: "Personalized AI Recommendations",
    careerhoop: true,
    traditional: false,
  },
  {
    feature: "Access to Industry Mentors",
    careerhoop: true,
    traditional: false,
  },
  {
    feature: "Real-Time Job Market Data",
    careerhoop: true,
    traditional: false,
  },
  {
    feature: "24/7 Availability",
    careerhoop: true,
    traditional: false,
  },
  {
    feature: "Skill Gap Analysis",
    careerhoop: true,
    traditional: false,
  },
  {
    feature: "College Matching",
    careerhoop: true,
    traditional: true,
  },
  {
    feature: "Free for Students",
    careerhoop: true,
    traditional: false,
  },
]

export default function WhyChooseUs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary border border-primary/20 transition-all duration-200 hover:bg-primary/15 active:scale-[0.98]">
            Why Choose Us
          </div>
          <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-foreground md:text-5xl text-balance">
            The Smarter Way to Plan <span className="text-primary">Your Career</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            See why over 50,000 students trust CareerHoop to guide their career decisions and why we're the #1 rated
            career guidance platform for students.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary to-secondary px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-4xl font-bold text-white md:text-5xl">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">What Makes Us Different</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We combine cutting-edge AI with human expertise to deliver unmatched career guidance
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">
              CareerHoop vs Traditional Counseling
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              See how our modern approach compares to traditional career guidance
            </p>
          </div>
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 bg-muted/50 p-4 font-semibold text-foreground">
                <div>Feature</div>
                <div className="text-center text-primary">CareerHoop</div>
                <div className="text-center">Traditional</div>
              </div>
              {comparisons.map((item, index) => (
                <div
                  key={item.feature}
                  className={`grid grid-cols-3 p-4 ${index !== comparisons.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="text-foreground">{item.feature}</div>
                  <div className="text-center">
                    {item.careerhoop ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="text-center">
                    {item.traditional ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-muted-foreground" />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">
              Loved by Students Everywhere
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Real stories from students whose lives were changed by CareerHoop
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <Heart className="mx-auto mb-6 h-12 w-12 text-white" />
          <h2 className="mb-4 font-sans text-3xl font-bold text-white md:text-4xl">Join the CareerHoop Family</h2>
          <p className="mb-8 text-lg text-white/80">
            Start your journey to career clarity today. It's completely free for students.
          </p>
          <Button size="lg" className="rounded-full bg-white px-8 text-primary hover:bg-white/90" asChild>
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
