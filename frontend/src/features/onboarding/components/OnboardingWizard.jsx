import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/ui/dialog"
import { Progress } from "@/shared/components/ui/progress"
import { WelcomeStep } from "./WelcomeStep"
import { QuickTourStep } from "./QuickTourStep"
import { GetStartedStep } from "./GetStartedStep"
import { useOnboarding } from "../hooks/useOnboarding"

const TOTAL_STEPS = 3

export function OnboardingWizard() {
  const { completeOnboarding, skipOnboarding } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(1)
  const [isOpen, setIsOpen] = useState(true)

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    skipOnboarding()
    setIsOpen(false)
  }

  const handleComplete = () => {
    completeOnboarding()
    setIsOpen(false)
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">
          CareerHoop Onboarding
        </DialogTitle>
        <DialogDescription className="sr-only">
          Onboarding wizard to help you get started with CareerHoop
        </DialogDescription>
        <div className="relative">
          {/* Progress Bar */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <WelcomeStep
                  key="welcome"
                  onNext={handleNext}
                  onSkip={handleSkip}
                />
              )}
              {currentStep === 2 && (
                <QuickTourStep
                  key="tour"
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onSkip={handleSkip}
                />
              )}
              {currentStep === 3 && (
                <GetStartedStep
                  key="get-started"
                  onPrev={handlePrev}
                  onComplete={handleComplete}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

