"use client"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
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
    color: "bg-secondary/10",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Heart,
    title: "Interest Selection",
    description: "Tell us what excites you and we'll find matching careers",
    color: "bg-accent/20",
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
    color: "bg-secondary/10",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Search,
    title: "Career Explorer",
    description: "Browse and discover hundreds of career possibilities",
    color: "bg-accent/20",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Zap,
    title: "Skill Training",
    description: "Build skills that matter for your dream career",
    color: "bg-secondary/10",
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
    <section className="bg-muted/50">
      <SectionContainer>
        <div className="mb-16 text-center">
          <Badge variant="default" className="mb-4">
            Features
          </Badge>
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl text-balance">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/90">
            Powerful tools designed to guide you through every step of your career discovery journey
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group cursor-pointer border-border/50 bg-card transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform duration-200 ease-out group-hover:scale-105`}>
                    <feature.icon className={`h-7 w-7 shrink-0 ${feature.iconColor}`} />
                  </div>
                  {feature.comingSoon && (
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/80">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
