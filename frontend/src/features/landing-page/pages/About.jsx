import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Target, Users, Lightbulb, Heart, Award, BookOpen } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Student-First Approach",
    description: "Every feature we build starts with one question: How does this help students succeed?",
  },
  {
    icon: Target,
    title: "Personalization",
    description: "We believe no two students are alike. Our AI adapts to your unique profile and aspirations.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Learning is better together. We connect students with mentors and peers who inspire growth.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We partner with industry leaders and top educators to deliver the best guidance possible.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    description: "Careers evolve, and so do we. We constantly update our platform with the latest insights.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge technology to make career discovery intuitive and exciting.",
  },
]

const team = [
  {
    name: "Dr. Maya Chen",
    role: "Founder & CEO",
    bio: "Former education researcher at Stanford with 15+ years in career counseling.",
    avatar: "/professional-ceo-portrait.png",
  },
  {
    name: "James Wilson",
    role: "CTO",
    bio: "AI/ML expert who previously built recommendation systems at leading tech companies.",
    avatar: "/professional-cto-portrait.png",
  },
  {
    name: "Marcus Johnson",
    role: "Head of Content",
    bio: "Former career counselor with a passion for making career education accessible.",
    avatar: "/professional-black-man-portrait.png",
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            About Us
          </div>
          <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-foreground md:text-5xl text-balance">
            Empowering the Next Generation of <span className="text-primary">Career Leaders</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            CareerHoop was founded with a simple mission: to ensure every student has access to personalized career
            guidance that was once only available to the privileged few.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 font-sans text-3xl font-bold text-foreground md:text-4xl">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  CareerHoop started in 2021 when our founder, Dr. Maya Chen, noticed a troubling pattern: students from
                  underserved communities were making career decisions with little to no guidance, often leading to
                  unfulfilling paths or missed opportunities.
                </p>
                <p>
                  Having spent 15 years as a career counselor, she knew that personalized guidance could be
                  transformative. But traditional counseling couldn't scale. That's when the idea for CareerHoop was
                  born.
                </p>
                <p>
                  Today, we've helped over 50,000 students discover careers that align with their passions, skills, and
                  goals. Our AI-powered platform creates a unique experience that
                  guides students from confusion to clarity.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/20 to-secondary/20" />
              <img
                src="/diverse-students-collaborating-on-career-planning.jpg"
                alt="Students collaborating"
                className="relative z-10 rounded-3xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl bg-primary/10 p-8 md:p-12">
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize career guidance by providing every student with AI-powered, personalized recommendations
                and access to mentors who can help them navigate their professional journey.
              </p>
            </div>
            <div className="rounded-3xl bg-secondary/20 p-8 md:p-12">
              <h3 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where no student feels lost about their future. Where every young person has the tools,
                knowledge, and support to pursue a career that brings them fulfillment and success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">Our Values</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              These core principles guide everything we do at CareerHoop
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">Meet Our Team</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">Passionate experts dedicated to student success</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                  className="mx-auto mb-4 h-40 w-40 rounded-full object-cover"
                />
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="mb-2 text-sm text-primary">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
