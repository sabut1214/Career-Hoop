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
  Edit,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/context/AuthContext"
import { studentService } from "@/services/studentService"
import { getUserStorageKey } from "@/utils/utils"
import { toast } from "react-toastify"

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
  const [isEditing, setIsEditing] = useState(false)
  const [hasCompletedInterests, setHasCompletedInterests] = useState(false)

  const progress = (currentStep / steps.length) * 100

  useEffect(() => {
    const loadExistingInterests = async () => {
      if (!user?.email) return

      try {
        const response = await studentService.getByEmail(user.email)
        const student = response.data

        if (student) {
          // Check if user has already completed interests
          const hasInterests = 
            (student.careerFields && student.careerFields.length > 0) ||
            (student.activities && student.activities.length > 0) ||
            (student.workEnvironments && student.workEnvironments.length > 0)
          
          if (hasInterests) {
            setHasCompletedInterests(true)
            // Limit to 2 career fields if more than 2 are stored
            const careerFields = (student.careerFields || []).slice(0, 2)
            // Limit to 3 activities if more than 3 are stored
            const activities = (student.activities || []).slice(0, 3)
            // Limit to 1 work environment if more than 1 is stored
            const workEnvironments = (student.workEnvironments || []).slice(0, 1)
            setSelectedFields(careerFields)
            setSelectedActivities(activities)
            setSelectedEnvironments(workEnvironments)
            persistInterests(careerFields, activities, workEnvironments, user?.id)
          }
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
    // Validate step 1: require at least 1 career field
    if (currentStep === 1 && selectedFields.length === 0) {
      setError("Please select at least one career field before proceeding.")
      return
    }
    
    // Validate step 2: require exactly 3 activities
    if (currentStep === 2 && selectedActivities.length !== 3) {
      setError("Please select exactly 3 activities before proceeding.")
      return
    }
    
    // Validate step 3: require exactly 1 work environment
    if (currentStep === 3 && selectedEnvironments.length !== 1) {
      setError("Please select exactly 1 work environment before proceeding.")
      return
    }
    
    if (currentStep < steps.length) {
      setError("")
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleField = (fieldId) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldId)) {
        // If already selected, remove it
        return prev.filter((id) => id !== fieldId)
      } else {
        // If not selected, only add if we have less than 2 selected
        if (prev.length < 2) {
          return [...prev, fieldId]
        }
        // If already have 2 selected, don't add more
        return prev
      }
    })
  }

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activity)) {
        // If already selected, remove it
        return prev.filter((a) => a !== activity)
      } else {
        // If not selected, only add if we have less than 3 selected
        if (prev.length < 3) {
          return [...prev, activity]
        }
        // If already have 3 selected, don't add more
        return prev
      }
    })
  }

  const toggleEnvironment = (environment) => {
    setSelectedEnvironments((prev) => {
      if (prev.includes(environment)) {
        // If already selected, deselect it (allow deselecting)
        return prev.filter((e) => e !== environment)
      } else {
        // If not selected, replace the current selection (only 1 allowed)
        return [environment]
      }
    })
  }

  const handleComplete = async () => {
    setError("")

    if (!user?.email) {
      setError("You need to be logged in to save your interests.")
      return
    }

    if (selectedFields.length === 0) {
      setError("Please select at least one career field before completing.")
      return
    }

    if (selectedActivities.length !== 3) {
      setError("Please select exactly 3 activities before completing.")
      return
    }

    if (selectedEnvironments.length !== 1) {
      setError("Please select exactly 1 work environment before completing.")
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

      toast.success("Your interests have been saved successfully.")
      persistInterests(selectedFields, selectedActivities, selectedEnvironments, user?.id)
      
      // Mark as completed and exit edit mode
      setHasCompletedInterests(true)
      setIsEditing(false)
      setCurrentStep(1)
    } catch (err) {
      console.error("Failed to save interests:", err)
      const errorMsg = "Failed to save your interests. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setCurrentStep(1)
    setError("")
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setCurrentStep(1)
    setError("")
    // Reload original interests
    const loadExistingInterests = async () => {
      if (!user?.email) return
      try {
        const response = await studentService.getByEmail(user.email)
        const student = response.data
        if (student) {
          const careerFields = (student.careerFields || []).slice(0, 2)
          const activities = (student.activities || []).slice(0, 3)
          const workEnvironments = (student.workEnvironments || []).slice(0, 1)
          setSelectedFields(careerFields)
          setSelectedActivities(activities)
          setSelectedEnvironments(workEnvironments)
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to load interests:", err)
        }
      }
    }
    loadExistingInterests()
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
            <p className="text-muted-foreground">Select 2 career fields that interest you the most</p>
            {selectedFields.length >= 2 && (
              <Alert className="mb-4">
                <AlertDescription>You can select a maximum of 2 career fields. Deselect one to choose another.</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careerFields.map((field) => {
                const isSelected = selectedFields.includes(field.id)
                const isDisabled = !isSelected && selectedFields.length >= 2
                return (
                  <motion.div
                    key={field.id}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    onClick={() => !isDisabled && toggleField(field.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md cursor-pointer"
                        : isDisabled
                          ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className={`w-12 h-12 rounded-lg ${field.color} flex items-center justify-center`}>
                        <field.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-medium">{field.name}</h3>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFields.length} of 2 field{selectedFields.length !== 1 ? "s" : ""}
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
            <p className="text-muted-foreground">Choose exactly 3 activities and skills you enjoy or want to develop</p>
            {selectedActivities.length >= 3 && (
              <Alert className="mb-4">
                <AlertDescription>You can select a maximum of 3 activities. Deselect one to choose another.</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activities.map((activity) => {
                const isSelected = selectedActivities.includes(activity)
                const isDisabled = !isSelected && selectedActivities.length >= 3
                return (
                  <motion.div
                    key={activity}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    onClick={() => !isDisabled && toggleActivity(activity)}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                      isSelected
                        ? "border-secondary bg-secondary/5 text-secondary cursor-pointer"
                        : isDisabled
                          ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-secondary/50 hover:bg-muted/50 cursor-pointer"
                    }`}
                  >
                    <span className="text-sm font-medium">{activity}</span>
                  </motion.div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedActivities.length} of 3 activit{selectedActivities.length !== 1 ? "ies" : "y"}
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
            <p className="text-muted-foreground">Select your preferred work environment (choose 1)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workEnvironments.map((environment) => {
                const isSelected = selectedEnvironments.includes(environment)
                return (
                  <motion.div
                    key={environment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleEnvironment(environment)}
                    className={`cursor-pointer p-4 rounded-lg border-2 text-center transition-all duration-300 ${
                      isSelected
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border hover:border-accent/50 hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-medium">{environment}</span>
                  </motion.div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedEnvironments.length} of 1 environment
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

  // Show summary view if interests are completed and not editing
  if (hasCompletedInterests && !isEditing) {
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-secondary" />
                  <h1 className="text-4xl font-bold">Your Interests</h1>
                </div>
                <Button onClick={handleEdit} variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Interests
                </Button>
              </div>
              <p className="text-xl text-muted-foreground">
                Your selected interests are saved. Click "Edit Interests" to make changes.
              </p>
            </motion.div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Your Selected Interests</CardTitle>
                  <CardDescription>Review your career preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Career Fields:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFields.map((fieldId) => {
                        const field = careerFields.find((f) => f.id === fieldId)
                        return (
                          <Badge key={fieldId} variant="secondary" className="bg-primary/10 text-primary text-base px-3 py-1">
                            {field?.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Activities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivities.map((activity) => (
                        <Badge key={activity} variant="secondary" className="bg-secondary/10 text-secondary text-base px-3 py-1">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Work Environment:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnvironments.map((environment) => (
                        <Badge key={environment} variant="secondary" className="bg-accent/10 text-accent text-base px-3 py-1">
                          {environment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    )
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-secondary" />
                <h1 className="text-4xl font-bold">{isEditing ? "Edit Your Interests" : "Select Your Interests"}</h1>
              </div>
              {isEditing && (
                <Button onClick={handleCancelEdit} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              {isEditing 
                ? "Update your interests to refine your career recommendations"
                : "Help us understand what excites you to find the perfect career match"}
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
              {currentStep === steps.length ? (isSaving ? "Saving..." : isEditing ? "Save Changes" : "Complete") : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

