import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import logoImg from "@/assets/images/Logo.png"

export function WelcomeStep({ onNext, onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center text-center space-y-6 px-6 py-8"
    >
      <div className="flex items-center justify-center mb-4">
        <img src={logoImg} alt="CareerHoop Logo" className="h-16 w-16 object-contain" />
      </div>
      
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Welcome to CareerHoop!
        </div>
        
        <h2 className="text-3xl font-bold text-foreground">
          Let's Get You Started
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We'll guide you through setting up your profile and discovering your perfect career path. This will only take a few minutes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-8">
        <Button
          onClick={onNext}
          size="lg"
          className="flex-1 gap-2"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          Skip for Now
        </Button>
      </div>
    </motion.div>
  )
}

