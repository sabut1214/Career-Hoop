import { motion } from "framer-motion"
import { BookOpen, Target, BarChart3, Building2, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

const features = [
  {
    icon: BookOpen,
    title: "Enter Your Grades",
    description: "Upload your marksheet and let our AI analyze your academic strengths",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Target,
    title: "Select Your Interests",
    description: "Tell us what excites you and we'll match you with perfect careers",
    color: "text-accent-foreground",
    bgColor: "bg-accent/20",
  },
  {
    icon: BarChart3,
    title: "Get Recommendations",
    description: "Receive personalized career suggestions based on your profile",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Building2,
    title: "Explore Colleges",
    description: "Find universities and programs that match your career goals",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
]

export function QuickTourStep({ onNext, onPrev }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 px-6 py-8"
    >
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">
          How areerHoop Works
        </h2>
        <p className="text-muted-foreground">
          Here's what you can do to discover your perfect career path
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-primary/20 transition-[border-color] duration-200 ease-out">
                <CardHeader>
                  <div className={`w-12 h-12 shrink-0 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 shrink-0 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

