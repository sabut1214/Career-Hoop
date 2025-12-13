"use client"

import { Card, CardContent } from "@/shared/components/ui/card"
import { LayoutDashboard, FileText, Heart, Compass, GraduationCap, Search, Users, Zap, User } from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Your personalized hub for tracking progress and insights",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: FileText,
    title: "Enter Grades",
    description: "Input your academic performance for smarter recommendations",
    color: "bg-secondary/20",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Heart,
    title: "Interest Selection",
    description: "Tell us what excites you and we'll find matching careers",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Compass,
    title: "Career Recommendations",
    description: "AI-powered suggestions tailored to your unique profile",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: GraduationCap,
    title: "College Suggestions",
    description: "Find the best colleges for your chosen career path",
    color: "bg-secondary/20",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Search,
    title: "Career Explorer",
    description: "Browse and discover hundreds of career possibilities",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Users,
    title: "Mentorship",
    description: "Connect with industry professionals for guidance",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Zap,
    title: "Skill Training",
    description: "Build skills that matter for your dream career",
    color: "bg-secondary/20",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: User,
    title: "Student Profile",
    description: "Track your journey and showcase your achievements",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-muted/50 px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Features
          </div>
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/90">
            Powerful tools designed to guide you through every step of your career discovery journey
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group cursor-pointer border-border/50 bg-card transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/80">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

