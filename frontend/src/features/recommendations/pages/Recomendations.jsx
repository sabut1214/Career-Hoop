import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Star,
  BookOpen,
  Target,
  Briefcase,
  Code,
  Stethoscope,
  Palette,
  Wrench,
  Beaker,
  Users,
  Sparkles,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import api from "@/shared/services/api"
import { useAuth } from "@/shared/context/AuthContext"
import { getUserStorageKey } from "@/shared/utils/utils"
import { saveCareer, unsaveCareer, getSavedCareers, getUserProfile } from "@/shared/lib/api"
import recommendationService from "@/features/recommendations/services/recommendationService"
import { toast } from "react-toastify"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { CareerCardSkeletonGrid } from "@/shared/components/common/CareerCardSkeleton"
import { getRecommendationError } from "@/shared/utils/userFriendlyErrors"

const categoryIconMap = {
  Technology: Code,
  "Data Science": BarChart3,
  Healthcare: Stethoscope,
  Medical: Stethoscope,
  Design: Palette,
  Engineering: Wrench,
  Science: Beaker,
  Business: Briefcase,
  Education: Users,
  Media: BookOpen,
  Marketing: BookOpen,
  Gaming: Code,
  "History & Research": BookOpen,
  "Social Science": Users,
  "Space & Aeronautics": Beaker,
  default: Target,
}

const categoryColorMap = {
  Technology: "bg-info",
  "Data Science": "bg-success",
  Healthcare: "bg-destructive",
  Medical: "bg-destructive",
  Design: "bg-secondary",
  Engineering: "bg-warning",
  Science: "bg-accent",
  Business: "bg-primary",
  Education: "bg-warning",
  Media: "bg-accent",
  Marketing: "bg-secondary",
  Gaming: "bg-accent",
  "History & Research": "bg-warning",
  "Social Science": "bg-info",
  "Space & Aeronautics": "bg-accent",
  default: "bg-muted",
}

const getConfidenceColor = (level) => {
  switch (level) {
    case "High":
    case "Very High":
      return "text-success-foreground bg-success/20"
    case "Medium":
      return "text-warning-foreground bg-warning/20"
    case "Low":
      return "text-destructive-foreground bg-destructive/20"
    default:
      return "text-muted-foreground bg-muted"
  }
}

const getConfidenceFromOutlook = (outlook) => {
  if (!outlook) return { confidence: 60, level: "Medium" }
  const lower = outlook.toLowerCase()
  if (lower.includes("very high")) return { confidence: 95, level: "High" }
  if (lower.includes("high")) return { confidence: 85, level: "High" }
  if (lower.includes("medium")) return { confidence: 65, level: "Medium" }
  if (lower.includes("low")) return { confidence: 45, level: "Low" }
  return { confidence: 60, level: "Medium" }
}

const transformCareerToRecommendation = (career, matchReason = "") => {
  const outlookData = getConfidenceFromOutlook(career.jobOutlook)
  return {
    id: career.id || career.careerName,
    title: career.careerName || career.name || career.title,
    description: career.description || "",
    confidence: outlookData.confidence,
    confidenceLevel: outlookData.level,
    matchReason: matchReason || `Strong match based on ${career.category || "your profile"}`,
    salary: career.averageSalaryUSD || career.salaryRange || "Not specified",
    growth: career.jobOutlook || "Medium",
    skills: career.skills || career.requiredSkills || [],
    opportunities: [career.category || "Various"].filter(Boolean),
    category: career.category || "default",
  }
}

const CareerCard = ({ career, index, savedCareerIds, onSaveChange }) => {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const category = career.category || "default"
  const Icon = categoryIconMap[category] || categoryIconMap.default
  const color = categoryColorMap[category] || categoryColorMap.default

  // Check if career is saved based on the savedCareerIds set
  // Try multiple ID formats to match (UUID, name, etc.)
  const careerIdString = String(career.id || career.careerId || "")
  const careerNameString = String(career.title || career.careerName || career.name || "")
  const isSaved = savedCareerIds.has(careerIdString) || (careerNameString && savedCareerIds.has(careerNameString))

  const handleStarClick = async (e) => {
    e.stopPropagation()
    const careerId = career.id || career.careerId
    const careerName = career.title || career.careerName || career.name
    if (!user?.id || (!careerId && !careerName) || isSaving) return

    setIsSaving(true)
    try {
      if (isSaved) {
        // Try to get the actual saved career ID from savedCareerIds
        let idToUnsave = careerId || careerName
        if (savedCareerIds) {
          // Find the actual saved career ID (UUID) if available
          const savedCareerIdStr = Array.from(savedCareerIds).find(id => {
            const idStr = String(id)
            const careerIdStr = String(careerId || "")
            const careerNameStr = String(careerName || "").toLowerCase()
            return idStr === careerIdStr || 
                   (careerNameStr && idStr.toLowerCase() === careerNameStr) ||
                   (careerNameStr && idStr.toLowerCase().includes(careerNameStr))
          })
          if (savedCareerIdStr) {
            idToUnsave = savedCareerIdStr
          }
        }
        
        await unsaveCareer(user.id, idToUnsave)
        // Update the saved careers list - remove both ID and name
        if (onSaveChange) {
          onSaveChange(careerId || careerName, false)
          if (careerId) {
            onSaveChange(String(careerId), false)
          }
          if (careerName) {
            onSaveChange(careerName, false)
          }
        }
        toast.success("Career removed from saved")
      } else {
        const result = await saveCareer(
          user.id,
          careerId || careerName,
          career.confidence || null,
          career.matchReason || null,
          careerName
        )
        // Update the saved careers list with the actual careerId from response
        if (onSaveChange && result) {
          // Use the careerId from the response (UUID) and also add the name
          const actualCareerId = result.careerId || careerId
          if (actualCareerId) {
            onSaveChange(String(actualCareerId), true)
          }
          if (result.careerName || careerName) {
            onSaveChange(result.careerName || careerName, true)
          }
        }
        // Show success animation
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
        toast.success("Career saved successfully")
      }
    } catch (error) {
      console.error("Error saving/unsaving career:", error)
      const errorMessage = error.message || "Failed to update saved career"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="h-full border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {career.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getConfidenceColor(career.confidenceLevel)} border-0`}>
                    {career.confidenceLevel} Match
                  </Badge>
                  <span className="text-sm text-muted-foreground">{career.confidence}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleStarClick}
              disabled={isSaving}
              className="transition-colors disabled:opacity-50 relative"
              title={isSaved ? "Remove from saved" : "Save career"}
            >
              <motion.div
                animate={showSuccess ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
                transition={{ duration: 0.6 }}
              >
                <Star
                  className={`h-5 w-5 transition-colors cursor-pointer ${
                    isSaved
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground group-hover:text-accent"
                  }`}
                />
              </motion.div>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 fill-green-500" />
                </motion.div>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Match Confidence</span>
              <span className="font-medium">{career.confidence}%</span>
            </div>
            <Progress value={career.confidence} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{career.description}</CardDescription>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Salary Range</span>
              </div>
              <span className="text-sm font-semibold">{career.salary}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Job Outlook</span>
              </div>
              <span className="text-sm font-semibold text-success">{career.growth}</span>
            </div>
          </div>

          {career.skills && career.skills.length > 0 && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {career.skills.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {career.skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{career.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium mb-1">Why this matches you:</p>
            <p className="text-sm text-muted-foreground">{career.matchReason}</p>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1">Learn More</Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent"
              onClick={handleStarClick}
              disabled={isSaving}
            >
              {isSaved ? "Saved" : "Save Career"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("grades")
  const [allCareers, setAllCareers] = useState([])
  const [gradeRecs, setGradeRecs] = useState([])
  const [interestRecs, setInterestRecs] = useState([])
  const [gradeError, setGradeError] = useState(null)
  const [interestError, setInterestError] = useState(null)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingInterests, setLoadingInterests] = useState(false)
  const [analysisSummary, setAnalysisSummary] = useState(null)
  const [interestSummary, setInterestSummary] = useState(null)
  const [savedCareerIds, setSavedCareerIds] = useState(new Set())

  // Fetch all careers on mount
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoadingCareers(true)
        const response = await api.get("/api/careers")
        setAllCareers(response.data || [])
      } catch (error) {
        console.error("Failed to fetch careers:", error)
        setGradeError("Unable to load career data.")
        setInterestError("Unable to load career data.")
      } finally {
        setLoadingCareers(false)
      }
    }

    fetchCareers()
  }, [])

  // Function to fetch saved career IDs
  const fetchSavedCareers = async () => {
    if (!user?.id) {
      setSavedCareerIds(new Set())
      return
    }

    try {
      const savedCareers = await getSavedCareers(user.id)
      // Convert IDs to strings for consistent comparison
      // Add both careerId (UUID) and careerName for matching
      const ids = new Set()
      savedCareers.forEach(sc => {
        if (sc.careerId) ids.add(String(sc.careerId))
        if (sc.careerName) ids.add(sc.careerName)
        if (sc.careerTitle) ids.add(sc.careerTitle)
        if (sc.id) ids.add(String(sc.id))
      })
      setSavedCareerIds(ids)
    } catch (error) {
      console.error("Failed to fetch saved careers:", error)
      setSavedCareerIds(new Set())
    }
  }

  // Fetch saved careers on mount
  useEffect(() => {
    fetchSavedCareers()
  }, [user?.id])

  // Handle save/unsave changes
  const handleSaveChange = async (careerId, isSaved) => {
    // Optimistically update the UI immediately
    setSavedCareerIds(prev => {
      const newSet = new Set(prev)
      const idString = String(careerId)
      if (isSaved) {
        newSet.add(idString)
      } else {
        newSet.delete(idString)
      }
      return newSet
    })
    
    // Refetch to ensure consistency with backend after a short delay
    setTimeout(() => {
      fetchSavedCareers()
    }, 500)
  }

  // Load user data and fetch recommendations
  useEffect(() => {
    if (!user?.id || loadingCareers || allCareers.length === 0) {
      return
    }

    // Try to load grades from user profile first
    const loadGradesFromProfile = async () => {
      try {
        const userProfile = await getUserProfile(user.id)
        if (userProfile && (userProfile.subjects?.length > 0 || userProfile.schoolName)) {
          // Reconstruct analysis from user profile
          const subjects = (userProfile.subjects || []).map((subjectName) => {
            const marks = userProfile.gpa ? Math.round((userProfile.gpa / 4) * 100) : null
            return {
              name: subjectName,
              marks: marks,
              grade: null,
            }
          })

          const analysis = {
            studentName: userProfile.name || null,
            schoolName: userProfile.schoolName || null,
            examName: null,
            stream: userProfile.stream || "general",
            subjects: subjects,
            grade12: userProfile.gpa ? (userProfile.gpa / 4) * 100 : 70,
          }

          setAnalysisSummary(analysis)
          fetchGradeRecommendations(analysis)
          return true
        }
      } catch (error) {
        console.error("Failed to load grades from profile:", error)
      }
      return false
    }

    // Try localStorage as fallback
    const loadFromLocalStorage = () => {
      const analysisKey = getUserStorageKey("aiGradesAnalysis", user.id)
      const storedAnalysis = localStorage.getItem(analysisKey)
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis)
          setAnalysisSummary(parsed)
          fetchGradeRecommendations(parsed)
          return true
        } catch (error) {
          console.error("Failed to parse stored analysis:", error)
          localStorage.removeItem(analysisKey)
        }
      }
      return false
    }

    // Try profile first, then localStorage
    loadGradesFromProfile().then((loaded) => {
      if (!loaded) {
        loadFromLocalStorage()
      }
    })

    const interestsKey = getUserStorageKey("userInterests", user.id)
    const storedInterests = localStorage.getItem(interestsKey)
    if (storedInterests) {
      try {
        const parsed = JSON.parse(storedInterests)
        setInterestSummary(parsed)
        fetchInterestRecommendations(parsed)
      } catch (error) {
        console.error("Failed to parse stored interests:", error)
        localStorage.removeItem(interestsKey)
      }
    }
  }, [user?.id, loadingCareers, allCareers])

  // Helper function to check if a career is saved
  const isCareerSaved = (career) => {
    const careerId = String(career.id || career.careerId || "")
    const careerName = String(career.title || career.careerName || career.name || "")
    return savedCareerIds.has(careerId) || (careerName && savedCareerIds.has(careerName))
  }

  // Sort recommendations: saved ones first
  const sortRecommendations = (recommendations) => {
    const saved = recommendations.filter(rec => isCareerSaved(rec))
    const notSaved = recommendations.filter(rec => !isCareerSaved(rec))
    return [...saved, ...notSaved]
  }

  // Get sorted recommendations
  const sortedGradeRecs = useMemo(() => sortRecommendations(gradeRecs), [gradeRecs, savedCareerIds])
  const sortedInterestRecs = useMemo(() => sortRecommendations(interestRecs), [interestRecs, savedCareerIds])

  const stats = useMemo(() => {
    const allRecs = [...gradeRecs, ...interestRecs]
    const total = allRecs.length
    const high = allRecs.filter((rec) => rec.confidenceLevel === "High").length
    const medium = allRecs.filter((rec) => rec.confidenceLevel === "Medium").length
    const saved = savedCareerIds.size
    return { total, high, medium, saved }
  }, [gradeRecs, interestRecs, savedCareerIds])

  const fetchGradeRecommendations = async (analysis) => {
    setLoadingGrades(true)
    setGradeError(null)
    try {
      // Calculate average grade from subjects if available
      let grade12 = analysis.grade12
      if (!grade12 && analysis.subjects && Array.isArray(analysis.subjects) && analysis.subjects.length > 0) {
        const marks = analysis.subjects
          .map((s) => (typeof s === "object" && s !== null ? s.marks : null))
          .filter((m) => m != null && !isNaN(m))
        if (marks.length > 0) {
          grade12 = marks.reduce((sum, m) => sum + m, 0) / marks.length
        }
      }
      grade12 = grade12 ?? 70

      const stream = (analysis.stream || "general").toLowerCase()
      const subjects =
        Array.isArray(analysis.subjects)
          ? analysis.subjects.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean)
          : []

      // Only use Python recommendation API - no fallback
      const response = await recommendationService.getByGrades({
        grade12: grade12,
        grade10: analysis.grade10 || null,
        stream: stream,
        subjects: subjects,
      })

      if (response?.data?.recommendations && response.data.recommendations.length > 0) {
        // Transform API response to match UI format
        const recommendations = response.data.recommendations.map((rec) => {
          // Find matching career from allCareers if possible
          const matchingCareer = allCareers.find(
            (c) => c.title === rec.title || c.careerName === rec.title || c.name === rec.title
          )

          return {
            id: rec.id || matchingCareer?.id || `rec-${Date.now()}-${Math.random()}`,
            careerId: matchingCareer?.id || null,
            careerName: rec.title,
            title: rec.title,
            description: rec.description || matchingCareer?.description || "",
            category: rec.category || matchingCareer?.category || "General",
            confidence: rec.confidence || 75,
            confidenceLevel: rec.confidenceLevel || "Medium",
            matchReason: rec.matchReason || "",
            salaryRange: rec.salaryRange || matchingCareer?.salaryRange || "Not specified",
            jobGrowth: rec.jobGrowth || matchingCareer?.jobGrowth || "Not specified",
            skills: rec.skills || matchingCareer?.requiredSkills || matchingCareer?.skills || [],
            opportunities: rec.opportunities || matchingCareer?.opportunities || [],
            requiredSkills: rec.skills || matchingCareer?.requiredSkills || [],
          }
        })

        setGradeRecs(recommendations)
      } else {
        // Python service returned empty recommendations
        setGradeRecs([])
        setGradeError(getRecommendationError("Service temporarily unavailable"))
      }
    } catch (error) {
      console.error("Failed to fetch grade recommendations:", error)
      setGradeError(getRecommendationError(error))
    } finally {
      setLoadingGrades(false)
    }
  }

  const fetchInterestRecommendations = async (interests) => {
    setLoadingInterests(true)
    setInterestError(null)
    try {
      const careerFields = interests.careerFields || []
      const activities = interests.activities || []
      const workEnvironments = interests.workEnvironments || []

      // Only use Python recommendation API - no fallback
      const response = await recommendationService.getByInterests({
        careerFields: careerFields,
        activities: activities,
        workEnvironments: workEnvironments,
      })

      if (response?.data?.recommendations && response.data.recommendations.length > 0) {
        // Transform API response to match UI format
        const recommendations = response.data.recommendations.map((rec) => {
          const matchingCareer = allCareers.find(
            (c) => c.title === rec.title || c.careerName === rec.title || c.name === rec.title
          )

          return {
            id: rec.id || matchingCareer?.id || `rec-${Date.now()}-${Math.random()}`,
            careerId: matchingCareer?.id || null,
            careerName: rec.title,
            title: rec.title,
            description: rec.description || matchingCareer?.description || "",
            category: rec.category || matchingCareer?.category || "General",
            confidence: rec.confidence || 75,
            confidenceLevel: rec.confidenceLevel || "Medium",
            matchReason: rec.matchReason || "",
            salaryRange: rec.salaryRange || matchingCareer?.salaryRange || "Not specified",
            jobGrowth: rec.jobGrowth || matchingCareer?.jobGrowth || "Not specified",
            skills: rec.skills || matchingCareer?.requiredSkills || matchingCareer?.skills || [],
            opportunities: rec.opportunities || matchingCareer?.opportunities || [],
            requiredSkills: rec.skills || matchingCareer?.requiredSkills || [],
          }
        })

        setInterestRecs(recommendations)
      } else {
        // Python service returned empty recommendations
        setInterestRecs([])
        setInterestError(getRecommendationError("Service temporarily unavailable"))
      }
    } catch (error) {
      console.error("Failed to fetch interest recommendations:", error)
      setInterestError(getRecommendationError(error))
    } finally {
      setLoadingInterests(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold">Career Recommendations</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover career paths tailored to your academic performance and personal interests
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Matches", value: stats.total, icon: Target, color: "text-primary" },
              { label: "High Confidence", value: stats.high, icon: TrendingUp, color: "text-success" },
              { label: "Medium Confidence", value: stats.medium, icon: Clock, color: "text-warning" },
              { label: "Saved Careers", value: stats.saved, icon: Star, color: "text-accent" },
            ].map((stat) => (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Recommendations Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="grades" className="flex items-center space-x-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  <span>Based on Grades</span>
                </TabsTrigger>
                <TabsTrigger value="interests" className="flex items-center space-x-2 text-base">
                  <Target className="h-4 w-4" />
                  <span>Based on Interests</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Grade-Based Recommendations</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {gradeRecs.length} matches found
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    These careers align with your academic strengths and performance in core subjects.
                  </p>
                  {!analysisSummary && (
                    <EmptyState
                      icon={Upload}
                      title="No Grade Data Yet"
                      description="Upload your marksheet to unlock AI-powered career recommendations based on your academic performance."
                      action={{
                        label: "Start Assessment",
                        onClick: () => navigate("/assessment"),
                        variant: "default"
                      }}
                    />
                  )}
                </div>

                {loadingCareers || loadingGrades ? (
                  <CareerCardSkeletonGrid count={6} />
                ) : gradeError ? (
                  <EmptyState
                    icon={AlertCircle}
                    title="Unable to Load Recommendations"
                    description={gradeError}
                    action={{
                      label: "Try Again",
                      onClick: () => window.location.reload(),
                      variant: "secondary"
                    }}
                  />
                ) : gradeRecs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedGradeRecs.map((career, index) => (
                      <CareerCard 
                        key={career.id} 
                        career={career} 
                        index={index}
                        savedCareerIds={savedCareerIds}
                        onSaveChange={handleSaveChange}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="No Recommendations Yet"
                    description="Complete your assessment by uploading your marksheet to get personalized career recommendations."
                    action={{
                      label: "Upload Marksheet",
                      onClick: () => navigate("/assessment"),
                      variant: "default"
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="interests" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Interest-Based Recommendations</h2>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                      {interestRecs.length} matches found
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    These careers match your selected interests, activities, and preferred work environments.
                  </p>
                  {interestSummary ? (
                    <div className="flex flex-wrap gap-2">
                      {(interestSummary.careerFields || []).map((field) => (
                        <Badge key={field} variant="outline">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="No Interests Selected"
                      description="Complete the interests section in your assessment to get personalized career recommendations based on what excites you."
                      action={{
                        label: "Select Interests",
                        onClick: () => navigate("/assessment"),
                        variant: "default"
                      }}
                    />
                  )}
                </div>

                {loadingCareers || loadingInterests ? (
                  <CareerCardSkeletonGrid count={6} />
                ) : interestError ? (
                  <EmptyState
                    icon={AlertCircle}
                    title="Unable to Load Recommendations"
                    description={interestError}
                    action={{
                      label: "Try Again",
                      onClick: () => window.location.reload(),
                      variant: "secondary"
                    }}
                  />
                ) : interestRecs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedInterestRecs.map((career, index) => (
                      <CareerCard 
                        key={career.id} 
                        career={career} 
                        index={index}
                        savedCareerIds={savedCareerIds}
                        onSaveChange={handleSaveChange}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Target}
                    title="No Recommendations Yet"
                    description="Share your interests in the assessment to get personalized career recommendations that match your passions."
                    action={{
                      label: "Select Interests",
                      onClick: () => navigate("/assessment"),
                      variant: "default"
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Action Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
              <CardContent className="p-8 text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Explore Further?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Discover colleges that offer programs for your recommended careers and find skill training
                  opportunities to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="px-8" onClick={() => navigate("/colleges")}>
                    <MapPin className="mr-2 h-5 w-5" />
                    Explore Colleges
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 bg-transparent"
                    onClick={() => navigate("/trainings")}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Find Training Programs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}


