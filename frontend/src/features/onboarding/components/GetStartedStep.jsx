import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useNavigate } from "react-router-dom"

const nextSteps = [
  {
    title: "Complete Assessment",
    description: "Enter your grades and interests to get personalized recommendations",
    href: "/assessment",
    primary: true,
  },
  {
    title: "Explore Careers",
    description: "Browse career options and learn about different paths",
    href: "/careers",
    primary: false,
  },
  {
    title: "View Dashboard",
    description: "See your progress and quick actions",
    href: "/dashboard",
    primary: false,
  },
]

export function GetStartedStep({ onPrev, onComplete }) {
  const navigate = useNavigate()

  const handleAction = (href) => {
    onComplete()
    navigate(href)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-6 py-8"
    >
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          You're All Set!
        </h2>
        <p className="text-muted-foreground">
          Ready to start your career discovery journey? Choose what you'd like to do first.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {nextSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`h-full border-2 cursor-pointer transition-all hover:shadow-lg ${
                step.primary 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/20"
              }`}
              onClick={() => handleAction(step.href)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {step.description}
                </CardDescription>
                <Button
                  variant={step.primary ? "default" : "outline"}
                  size="sm"
                  className="w-full gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(step.href)
                  }}
                >
                  {step.primary ? "Start Now" : "Explore"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => {
            onComplete()
            navigate("/dashboard")
          }}
          variant="ghost"
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>

      <div className="flex justify-center mt-4">
        <Button
          onClick={onPrev}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </motion.div>
  )
}

