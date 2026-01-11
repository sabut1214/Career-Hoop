import { Link } from "react-router-dom"
import { Navbar } from "@/shared/components/layout/navbar"
import { Footer } from "@/shared/components/layout/footer"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { SectionContainer } from "@/shared/components/layout/section-container"
import {
  LayoutDashboard,
  FileText,
  Heart,
  Compass,
  GraduationCap,
  Search,
  Users,
  Zap,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Your personalized command center that displays your progress, upcoming tasks, and AI-powered insights all in one place.",
    benefits: [
      "Track your career exploration progress",
      "See personalized recommendations",
      "Monitor skill development",
      "Access quick actions",
    ],
    color: "bg-primary/10",
    iconColor: "text-primary",
    image: "/features/smart-dashboard.jpg",
  },
  {
    icon: FileText,
    title: "Grade Analysis",
    description: "Input your academic performance and let our AI analyze which career paths align with your strengths.",
    benefits: [
      "Identify your strongest subjects",
      "Get career suggestions based on grades",
      "Understand skill gaps",
      "Receive improvement tips",
    ],
    color: "bg-secondary/10",
    iconColor: "text-secondary-foreground",
    image: "/features/grade-analysis.jpg",
  },
  {
    icon: Heart,
    title: "Interest Mapping",
    description:
      "Our interactive assessment discovers your true passions and matches them with fulfilling career options.",
    benefits: [
      "Take engaging interest quizzes",
      "Discover hidden passions",
      "Match interests to careers",
      "Explore related fields",
    ],
    color: "bg-accent/20",
    iconColor: "text-accent-foreground",
    image: "/features/interest-mapping.jpg",
  },
  {
    icon: Compass,
    title: "AI Career Matching",
    description:
      "Advanced algorithms analyze your complete profile to suggest careers where you'll thrive and find meaning.",
    benefits: [
      "Personalized career rankings",
      "Salary and growth projections",
      "Day-in-the-life insights",
      "Required qualifications",
    ],
    color: "bg-primary/10",
    iconColor: "text-primary",
    image: "/features/ai-career-matching.jpg",
  },
  {
    icon: GraduationCap,
    title: "College Finder",
    description:
      "Get recommendations for colleges and programs that will best prepare you for your chosen career path.",
    benefits: [
      "Filter by location & budget",
      "Compare program rankings",
      "See admission requirements",
      "Explore scholarship options",
    ],
    color: "bg-secondary/10",
    iconColor: "text-secondary-foreground",
    image: "/features/college-finder.jpg",
  },
  {
    icon: Search,
    title: "Career Explorer",
    description: "Browse our comprehensive database of 500+ careers with detailed information about each profession.",
    benefits: [
      "Explore by industry",
      "Read career profiles",
      "Watch professional interviews",
      "Compare multiple careers",
    ],
    color: "bg-accent/20",
    iconColor: "text-accent-foreground",
    image: "/features/career-explorer.jpg",
  },
  {
    icon: Zap,
    title: "Skill Builder",
    description:
      "Access curated courses and resources to develop the skills employers are looking for in your target career.",
    benefits: ["Personalized learning paths", "Track skill progress", "Earn certificates", "Practice with projects"],
    color: "bg-secondary/10",
    iconColor: "text-secondary-foreground",
    image: "/features/skill-builder.jpg",
  },
  {
    icon: User,
    title: "Portfolio Builder",
    description: "Create a professional profile that showcases your achievements, skills, and career journey.",
    benefits: ["Highlight achievements", "Share with mentors", "Track your growth", "Export for applications"],
    color: "bg-accent/20",
    iconColor: "text-accent-foreground",
    image: "/features/portfolio-builder.jpg",
  },
]

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="default" className="mb-4">
            Features
          </Badge>
          <h1 className="mb-6 font-sans text-4xl font-bold leading-tight text-foreground md:text-5xl text-balance">
            Powerful Tools for Your <span className="text-primary">Career Journey</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Everything you need to discover, plan, and pursue your dream career. Our comprehensive suite of tools guides
            you every step of the way.
          </p>
        </div>
      </SectionContainer>

      {/* Features Grid */}
      <section className="bg-muted/50">
        <SectionContainer>
          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{feature.title}</h2>
                  <p className="mb-6 text-muted-foreground">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Card className={`border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <CardContent className="p-0">
                    <img
                      src={feature.image || "/placeholder.svg"}
                      alt={`${feature.title} interface screenshot`}
                      className="h-[300px] w-full object-cover md:h-[400px]"
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      {/* CTA */}
      <SectionContainer>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 font-sans text-3xl font-bold text-foreground md:text-4xl">
            Ready to Explore All Features?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of students who are already using CareerHoop to shape their future.
          </p>
          <Button size="lg" className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary-hover transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" asChild>
            <Link to="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </SectionContainer>

      <Footer />
    </div>
  )
}
