import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Stethoscope,
  Code,
  Palette,
  Wrench,
  Users,
  Briefcase,
  Camera,
  Beaker,
  CheckCircle,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/context/AuthContext"
import { studentService } from "@/services/studentService"
import { getUserStorageKey } from "@/utils/utils"

const persistInterests = (fields, activities, environments, userId) => {
  const data = {
    careerFields: fields,
    activities,
    workEnvironments: environments,
  }
  if (userId) {
    const storageKey = getUserStorageKey("userInterests", userId)
    localStorage.setItem(storageKey, JSON.stringify(data))
  }
  // Also keep old generic key for backward compatibility during migration
  localStorage.setItem("userInterests", JSON.stringify(data))
}

const steps = [
  { id: 1, title: "Career Fields", description: "Select career fields that interest you" },
  { id: 2, title: "Activities", description: "Choose activities you enjoy" },
  { id: 3, title: "Work Environment", description: "Pick your preferred work settings" },
  { id: 4, title: "Review", description: "Review your selected interests" },
]

const careerFields = [
  { id: "medicine", name: "Medicine & Healthcare", icon: Stethoscope, color: "bg-red-500" },
  { id: "technology", name: "Technology & IT", icon: Code, color: "bg-blue-500" },
  { id: "arts", name: "Arts & Design", icon: Palette, color: "bg-purple-500" },
  { id: "engineering", name: "Engineering", icon: Wrench, color: "bg-orange-500" },
  { id: "business", name: "Business & Finance", icon: Briefcase, color: "bg-green-500" },
  { id: "science", name: "Science & Research", icon: Beaker, color: "bg-teal-500" },
  { id: "education", name: "Education", icon: Users, color: "bg-indigo-500" },
  { id: "media", name: "Media & Communications", icon: Camera, color: "bg-pink-500" },
]

const activities = [
  "Problem Solving",
  "Creative Writing",
  "Public Speaking",
  "Data Analysis",
  "Team Leadership",
  "Research",
  "Design & Art",
  "Programming",
  "Teaching",
  "Music & Performance",
  "Sports & Fitness",
  "Travel & Exploration",
]

const workEnvironments = [
  "Office Environment",
  "Remote Work",
  "Laboratory",
  "Hospital/Clinic",
  "Outdoor Work",
  "Creative Studio",
  "Classroom",
  "Field Work",
  "Home Office",
  "Co-working Space",
]

export default function InterestsPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFields, setSelectedFields] = useState([])
  const [selectedActivities, setSelectedActivities] = useState([])
  const [selectedEnvironments, setSelectedEnvironments] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const progress = (currentStep / steps.length) * 100

  useEffect(() => {
    const loadExistingInterests = async () => {
      if (!user?.email) return

      try {
        const response = await studentService.getByEmail(user.email)
        const student = response.data

        if (student) {
          setSelectedFields(student.careerFields || [])
          setSelectedActivities(student.activities || [])
          setSelectedEnvironments(student.workEnvironments || [])
          persistInterests(student.careerFields || [], student.activities || [], student.workEnvironments || [], user?.id)
        }
      } catch (err) {
        // If student not found (404), ignore; otherwise log error
        if (err.response?.status !== 404) {
          console.error("Failed to load interests:", err)
        }
      }
    }

    loadExistingInterests()
  }, [user])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleField = (fieldId) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    )
  }

  const toggleEnvironment = (environment) => {
    setSelectedEnvironments((prev) =>
      prev.includes(environment) ? prev.filter((e) => e !== environment) : [...prev, environment],
    )
  }

  const handleComplete = async () => {
    setError("")
    setSuccessMessage("")

    if (!user?.email) {
      setError("You need to be logged in to save your interests.")
      return
    }

    if (
      selectedFields.length === 0 &&
      selectedActivities.length === 0 &&
      selectedEnvironments.length === 0
    ) {
      setError("Please select at least one interest before completing.")
      return
    }

    setIsSaving(true)

    try {
      let existingStudent = null

      try {
        const response = await studentService.getByEmail(user.email)
        existingStudent = response.data
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err
        }
      }

      const payload = {
        name: user.name || user.fullName || "Student",
        email: user.email,
        careerFields: selectedFields,
        activities: selectedActivities,
        workEnvironments: selectedEnvironments,
      }

      if (existingStudent?.id) {
        await studentService.update(existingStudent.id, payload)
      } else {
        await studentService.create(payload)
      }

      setSuccessMessage("Your interests have been saved successfully.")
      persistInterests(selectedFields, selectedActivities, selectedEnvironments, user?.id)
    } catch (err) {
      console.error("Failed to save interests:", err)
      setError("Failed to save your interests. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="text-muted-foreground">Select 3-5 career fields that interest you the most</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerFields.map((field) => (
                <motion.div
                  key={field.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleField(field.id)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedFields.includes(field.id)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <div className={`w-12 h-12 rounded-lg ${field.color} flex items-center justify-center`}>
                      <field.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-medium">{field.name}</h3>
                    {selectedFields.includes(field.id) && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="text-muted-foreground">Choose activities and skills you enjoy or want to develop</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activities.map((activity) => (
                <motion.div
                  key={activity}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleActivity(activity)}
                  className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                    selectedActivities.includes(activity)
                      ? "border-secondary bg-secondary/5 text-secondary"
                      : "border-border hover:border-secondary/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm font-medium">{activity}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedActivities.length} activit{selectedActivities.length !== 1 ? "ies" : "y"}
            </p>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="text-muted-foreground">Select your preferred work environments</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workEnvironments.map((environment) => (
                <motion.div
                  key={environment}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleEnvironment(environment)}
                  className={`cursor-pointer p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                    selectedEnvironments.includes(environment)
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border hover:border-accent/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="font-medium">{environment}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedEnvironments.length} environment{selectedEnvironments.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold">Review Your Interests</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Career Fields:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFields.map((fieldId) => {
                    const field = careerFields.find((f) => f.id === fieldId)
                    return (
                      <Badge key={fieldId} variant="secondary" className="bg-primary/10 text-primary">
                        {field?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Activities:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedActivities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="bg-secondary/10 text-secondary">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Work Environments:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEnvironments.map((environment) => (
                    <Badge key={environment} variant="secondary" className="bg-accent/10 text-accent">
                      {environment}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-secondary" />
              <h1 className="text-4xl font-bold">Select Your Interests</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Help us understand what excites you to find the perfect career match
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    step.id <= currentStep ? "text-secondary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.id < currentStep
                        ? "bg-secondary border-secondary text-secondary-foreground"
                        : step.id === currentStep
                          ? "border-secondary text-secondary"
                          : "border-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="mb-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Card className="border-2">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent>{renderStepContent()}</CardContent>
            </Card>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-between"
          >
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isSaving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={currentStep === steps.length ? handleComplete : handleNext}
              disabled={isSaving}
            >
              {currentStep === steps.length ? (isSaving ? "Saving..." : "Complete") : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

