import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Target, BookOpen, ArrowRight, Users, Award, TrendingUp } from "lucide-react"
import logoImg from "@/assets/images/Logo.png"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <img src={logoImg} alt="CareerHoop Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-bold text-foreground">
            areer<span className="text-primary">Hoop</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost">About</Button>
          <Button variant="ghost">Contact</Button>
          <Link to="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-balance">
            Find Your <span className="text-primary">Future</span>,<br />
            Build Your <span className="text-secondary">Career</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover your ideal career path with personalized guidance, college recommendations, and skill development
            programs tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Hero Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <div className="w-full max-w-4xl h-96 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl flex items-center justify-center border border-border">
            <img
              src="/students-exploring-career-paths.jpg"
              alt="Students exploring career paths"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-4xl font-bold text-balance">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our comprehensive platform guides you through every step of your career discovery journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Career Guidance",
              description:
                "Get personalized career recommendations based on your interests, skills, and academic performance.",
              color: "text-primary",
            },
            {
              icon: BookOpen,
              title: "College Suggestions",
              description:
                "Discover the best colleges and universities that align with your career goals and academic profile.",
              color: "text-secondary",
            },
            {
              icon: TrendingUp,
              title: "Skills Training",
              description:
                "Access curated training programs and courses to develop the skills needed for your dream career.",
              color: "text-accent",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
                <CardHeader className="text-center">
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,000+", label: "Students Guided", icon: Users },
              { number: "500+", label: "Career Paths", icon: Target },
              { number: "95%", label: "Success Rate", icon: Award },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="space-y-4"
              >
                <stat.icon className="h-8 w-8 mx-auto text-primary" />
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl font-bold text-balance">Ready to Discover Your Future?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join thousands of students who have found their perfect career path with CareerHoop.
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-primary">CareerHoop</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact Us
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 CareerHoop. All rights reserved. Empowering students to find their future.
          </div>
        </div>
      </footer>
    </div>
  )
}
