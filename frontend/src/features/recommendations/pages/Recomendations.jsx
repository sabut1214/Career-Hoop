import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Building2,
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
  Loader2,
  Folder,
} from "lucide-react"
import api from "@/shared/services/api"
import { useAuth } from "@/shared/context/AuthContext"
import { useSubscription } from "@/shared/hooks/useSubscription"
import { getUserStorageKey } from "@/shared/utils/utils"
import { getCollegeRecommendations, getSavedColleges, saveCollege, unsaveCollege, saveCareer, unsaveCareer, getSavedCareers, getUserProfile } from "@/shared/lib/api"
import recommendationService from "@/features/recommendations/services/recommendationService"
import { studentService } from "@/shared/services/studentService"
import { toast } from "react-toastify"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { CareerCardSkeletonGrid } from "@/shared/components/common/CareerCardSkeleton"
import CollegeCard from "@/shared/components/common/CollegeCard"
import { getRecommendationError } from "@/shared/utils/userFriendlyErrors"
import { ProPaywallModal } from "@/features/payment/components/ProPaywallModal"
import { Lock } from "lucide-react"

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
  Technology: "bg-primary",
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
  "Social Science": "bg-primary",
  "Space & Aeronautics": "bg-accent",
  default: "bg-muted-foreground",
}

const getConfidenceColor = (level) => {
  switch (level) {
    case "High":
    case "Very High":
      return "bg-[#ddf1dd] text-[#005f00]" // green-100 bg, green-700 text
    case "Medium":
      return "bg-warning/20 text-warning-foreground"
    case "Low":
      return "bg-red-100 text-red-700" // red-100 bg, red-700 text for better visibility
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

const parseCollegePrograms = (programs) => {
  if (!programs) return []

  if (Array.isArray(programs)) {
    return programs
      .map((program) => {
        if (typeof program === "string") return program
        if (typeof program === "object" && program !== null) {
          return program.name || program.title || program.program || ""
        }
        return ""
      })
      .filter(Boolean)
  }

  if (typeof programs === "string") {
    const trimmed = programs.trim()
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(programs)
        return parseCollegePrograms(parsed)
      } catch {
        return programs
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }
    }

    return programs
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
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

// Preview Card Component for Free Users
const PreviewCard = ({ preview, index, onUnlock }) => {
  const prefersReducedMotion = useReducedMotion()
  const category = preview.category || "default"
  const IconComponent = categoryIconMap[category] || categoryIconMap.default
  const color = categoryColorMap[category] || categoryColorMap.default

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <Card className="h-full border-2 hover:border-primary/20 transition-all duration-200 overflow-hidden">
        {/* Blurred Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 cursor-pointer"
             onClick={onUnlock}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upgrade to Unlock</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See full recommendation details and unlock all features
              </p>
              <Button onClick={onUnlock} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content (blurred) */}
        <CardHeader className="space-y-4 opacity-50 pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
              </div>
              <div>
                <CardTitle className="text-xl">••••••••</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getConfidenceColor(preview.matchLevel)} border-0`}>
                    {preview.matchLevel || "Match"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{preview.matchScore || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Match Confidence</span>
              <span className="font-medium">{preview.matchScore || 0}%</span>
            </div>
            <Progress value={preview.matchScore || 0} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 opacity-50 pointer-events-none">
          <div className="space-y-4">
            {preview.category && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Category</span>
                <span className="text-sm font-semibold">{preview.category}</span>
              </div>
            )}
            {preview.tuitionRange && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Tuition Range</span>
                <span className="text-sm font-semibold">{preview.tuitionRange}</span>
              </div>
            )}
          </div>

          {preview.genericMatchReasons && preview.genericMatchReasons.length > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium mb-1">Why this matches you:</p>
              <p className="text-sm text-muted-foreground">{preview.genericMatchReasons[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const CareerCard = ({ career, index, savedCareerIds, onSaveChange }) => {
  const { user } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const category = career.category || "default"
  const IconComponent = categoryIconMap[category] || categoryIconMap.default
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
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
      className="group"
    >
      <>
        <Card className="h-full border-2 hover:border-primary/20 hover:shadow-lg transition-[box-shadow,border-color] duration-200 ease-out">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  {IconComponent && <IconComponent className="h-6 w-6 text-white" />}
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
                className="transition-colors disabled:opacity-50 relative z-10 p-1 rounded-md hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                title={isSaved ? "Remove from saved" : "Save career"}
                aria-label={isSaved ? "Remove from saved" : "Save career"}
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />
                ) : (
                  <motion.div
                    animate={showSuccess ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <Star
                      className={`h-5 w-5 shrink-0 transition-[color,fill] duration-200 ease-out cursor-pointer ${
                        isSaved
                          ? "text-warning fill-warning"
                          : "text-muted-foreground group-hover:text-primary"
                      }`}
                    />
                  </motion.div>
                )}
                {showSuccess && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 z-20"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-success fill-success" />
                  </motion.div>
                )}
              </button>
            </div>

          <div className="space-y-2" title="Match confidence shows how well this career fits your profile based on your grades, interests, and activities. Higher scores = better fit for you.">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1 cursor-help">
                Match Confidence
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="font-medium">{career.confidence}%</span>
            </div>
            <Progress value={career.confidence} className="h-2" />
          </div>
        </CardHeader>

          <CardContent className="space-y-6">
            {career.description && career.description !== "Career saved from recommendations" && (
              <CardDescription className="text-base leading-relaxed">{career.description}</CardDescription>
            )}

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
              <Button className="flex-1" onClick={() => setDetailsOpen(true)}>
                View Details
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleStarClick}
                disabled={isSaving}
                loading={isSaving}
              >
                {isSaved ? "Saved" : "Save Career"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{career.title}</DialogTitle>
              <DialogDescription>{career.category || "Career details"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {career.description && career.description !== "Career saved from recommendations" 
                  ? career.description 
                  : "No description available."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {career.salary && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Salary Range</p>
                    <p className="text-sm font-semibold">{career.salary}</p>
                  </div>
                )}
                {career.growth && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Job Outlook</p>
                    <p className="text-sm font-semibold">{career.growth}</p>
                  </div>
                )}
              </div>
              {career.skills && career.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill, idx) => (
                      <Badge key={`${skill}-${idx}`} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const { isPro, loading: subscriptionLoading } = useSubscription()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
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
  const [savedCareersCount, setSavedCareersCount] = useState(0)
  const [savedCollegeIds, setSavedCollegeIds] = useState(new Set())
  const [collegeRecs, setCollegeRecs] = useState([])
  const [loadingColleges, setLoadingColleges] = useState(false)
  const [collegeError, setCollegeError] = useState(null)
  const [paywallModalOpen, setPaywallModalOpen] = useState(false)
  const [previewRecs, setPreviewRecs] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  const uuidRegex = useMemo(() => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, [])

  const normalizedCollegeRecs = useMemo(() => {
    return (Array.isArray(collegeRecs) ? collegeRecs : []).map((college) => {
      const id = college?.id || college?.collegeId || null
      const matchScore =
        typeof college?.matchScore === "number"
          ? Math.round(college.matchScore)
          : typeof college?.score === "number"
            ? Math.round(college.score)
            : null

      const overviewText = (college?.overview || "").trim()
      const descriptionText = (college?.description || "").trim()
      const description = (overviewText || descriptionText).trim()

      const rawPrograms =
        college?.programs ??
        college?.collegePrograms ??
        college?.popularPrograms ??
        college?.courses ??
        college?.degrees ??
        null

      return {
        ...college,
        id,
        name: college?.collegeName || college?.name || "College",
        location: college?.collegeLocation || college?.location || "Location not available",
        logo: college?.logo || college?.collegeLogo || null,
        affiliation: college?.affiliation || college?.collegeAffiliation || null,
        type: college?.type || null,
        description,
        overview: overviewText,
        detailUrl:
          college?.detailUrl ||
          college?.detail_url ||
          college?.collegeDetailUrl ||
          college?.college_detail_url ||
          college?.website ||
          null,
        establishedYear: college?.establishedYear ?? college?.established_year ?? college?.founded ?? null,
        students: college?.students ?? null,
        tuition: college?.tuition ?? null,
        acceptanceRate: college?.acceptanceRate ?? college?.acceptance_rate ?? null,
        programs: parseCollegePrograms(rawPrograms),
        matchScore,
      }
    })
  }, [collegeRecs])

  useEffect(() => {
    const idsToFetch = Array.from(
      new Set(
        normalizedCollegeRecs
          .filter((college) => {
            const id = college?.id ? String(college.id).trim() : ""
            if (!id || !uuidRegex.test(id)) return false

            const hasText = (value) => typeof value === "string" && value.trim().length > 0
            const missingCore =
              !(hasText(college.overview) || hasText(college.description)) ||
              !hasText(college.detailUrl)

            const programsValue = college.programs
            const missingPrograms =
              programsValue == null ||
              (typeof programsValue === "string" && ["", "[]", "null"].includes(programsValue.trim().toLowerCase())) ||
              (Array.isArray(programsValue) && programsValue.length === 0)

            return missingCore || missingPrograms
          })
          .map((college) => String(college.id))
      )
    )

    if (idsToFetch.length === 0) return

    let cancelled = false
    const hydrate = async () => {
      try {
        const response = await api.post("/api/colleges/batch", idsToFetch)
        const fullColleges = Array.isArray(response?.data) ? response.data : []
        const byId = new Map(fullColleges.map((c) => [String(c.id), c]))

        if (cancelled) return
        setCollegeRecs((prev) =>
          (Array.isArray(prev) ? prev : []).map((rec) => {
            const recId = rec?.id || rec?.collegeId
            const idString = recId ? String(recId) : ""
            const full = idString ? byId.get(idString) : null
            if (!full) return rec
            const recMatchScore =
              typeof rec?.matchScore === "number"
                ? rec.matchScore
                : typeof rec?.score === "number"
                  ? rec.score
                  : null
            return { ...full, matchScore: recMatchScore }
          })
        )
      } catch (error) {
        const status = error?.response?.status
        if (status !== 401 && status !== 403) return

        try {
          const results = await Promise.allSettled(
            idsToFetch.map((id) => api.get(`/api/colleges/${id}`))
          )
          const fullColleges = results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value?.data)
            .filter(Boolean)
          const byId = new Map(fullColleges.map((c) => [String(c.id), c]))

          if (cancelled) return
          setCollegeRecs((prev) =>
            (Array.isArray(prev) ? prev : []).map((rec) => {
              const recId = rec?.id || rec?.collegeId
              const idString = recId ? String(recId) : ""
              const full = idString ? byId.get(idString) : null
              if (!full) return rec
              const recMatchScore =
                typeof rec?.matchScore === "number"
                  ? rec.matchScore
                  : typeof rec?.score === "number"
                    ? rec.score
                    : null
              return { ...full, matchScore: recMatchScore }
            })
          )
        } catch {
          // Fall back to minimal fields from recommendations.
        }
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [normalizedCollegeRecs, uuidRegex])

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
      setSavedCareersCount(savedCareers.length)
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
      setSavedCareersCount(0)
    }
  }

  // Fetch saved careers on mount
  useEffect(() => {
    fetchSavedCareers()
  }, [user?.id])

  const fetchSavedColleges = async () => {
    if (!user?.id) {
      setSavedCollegeIds(new Set())
      return
    }

    try {
      const savedColleges = await getSavedColleges(user.id).catch(() => [])
      setSavedCollegeIds(new Set(savedColleges.map((item) => String(item.collegeId || item.id))))
    } catch (error) {
      console.error("Failed to fetch saved colleges:", error)
      setSavedCollegeIds(new Set())
    }
  }

  useEffect(() => {
    fetchSavedColleges()
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
    if (!user?.id || loadingCareers || allCareers.length === 0 || subscriptionLoading) {
      return
    }

    // Try to load grades from localStorage (actual uploaded marksheet)
    // Only generate grade-based recommendations if marksheet was actually uploaded
    const loadFromLocalStorage = () => {
      // Check for marksheet history (preferred method)
      const historyKey = getUserStorageKey("aiGradesAnalyses", user.id)
      const currentIdKey = getUserStorageKey("aiGradesCurrentId", user.id)
      const storedHistory = localStorage.getItem(historyKey)
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory)
          const list = Array.isArray(parsed) ? parsed : []
          const currentId = localStorage.getItem(currentIdKey) || ""
          const selected = (currentId && list.find((m) => m?.id === currentId)) || list[0]
          if (selected?.analysis) {
            setAnalysisSummary(selected.analysis)
            fetchGradeRecommendations(selected.analysis)
            return true
          }
        } catch (error) {
          console.error("Failed to parse stored history:", error)
        }
      }
      
      // Fallback to legacy single analysis storage
      const analysisKey = getUserStorageKey("aiGradesAnalysis", user.id)
      const storedAnalysis = localStorage.getItem(analysisKey)
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis)
          // Only use if it has actual grade data (not just profile fields like schoolName)
          if (parsed && (parsed.subjects?.length > 0 || parsed.grade12)) {
            setAnalysisSummary(parsed)
            fetchGradeRecommendations(parsed)
            return true
          }
        } catch (error) {
          console.error("Failed to parse stored analysis:", error)
          localStorage.removeItem(analysisKey)
        }
      }
      return false
    }

    // Only load from localStorage (actual uploaded marksheet)
    // Don't use profile data to generate recommendations - profile data without marksheet upload
    // shouldn't generate grade-based recommendations (avoids using default/placeholder values)
    loadFromLocalStorage()

    // Load interests - try backend first, then localStorage
    const loadInterests = async () => {
      if (!user?.email) return

      // Try to load from backend (Student entity)
      try {
        const response = await studentService.getByEmail(user.email)
        const student = response.data
        if (student) {
          const hasInterests = 
            (student.careerFields && student.careerFields.length > 0) ||
            (student.activities && student.activities.length > 0) ||
            (student.workEnvironments && student.workEnvironments.length > 0)
          
          if (hasInterests) {
            const interests = {
              careerFields: student.careerFields || [],
              activities: student.activities || [],
              workEnvironments: student.workEnvironments || [],
            }
            setInterestSummary(interests)
            fetchInterestRecommendations(interests)
            // Also save to localStorage for quick access
            const interestsKey = getUserStorageKey("userInterests", user.id)
            localStorage.setItem(interestsKey, JSON.stringify(interests))
            return
          }
        }
      } catch (err) {
        // If student not found (404), ignore; otherwise log error
        if (err.response?.status !== 404) {
          console.error("Failed to load interests from backend:", err)
        }
      }

      // Fallback to localStorage
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
    }

    loadInterests()
  }, [user?.id, user?.email, loadingCareers, allCareers, isPro, subscriptionLoading])

  // Helper function to check if a career is saved
  const isCareerSaved = (career) => {
    const careerId = String(career.id || career.careerId || "")
    const careerName = String(career.title || career.careerName || career.name || "")
    return savedCareerIds.has(careerId) || (careerName && savedCareerIds.has(careerName))
  }

  // Helper function to check if career has sufficient details
  const hasCareerDetails = (career) => {
    const description = career.description || ""
    const hasDescription = description.trim() && description !== "Career saved from recommendations"
    const hasSalary = !!(career.salary || career.salaryRange || career.averageSalaryUSD)
    const hasEducation = !!career.requiredEducation
    const hasSkills = !!(career.skills && career.skills.length > 0) || !!(career.requiredSkills && career.requiredSkills.length > 0)
    const hasJobOutlook = !!(career.growth || career.jobOutlook)
    const hasMatchReason = !!(career.matchReason && career.matchReason.trim())
    
    // Career must have at least one of these details
    return hasDescription || hasSalary || hasEducation || hasSkills || hasJobOutlook || hasMatchReason
  }

  // Sort recommendations: saved ones first, and filter out careers without details
  const sortRecommendations = (recommendations) => {
    // First filter out careers without details
    const withDetails = recommendations.filter(rec => hasCareerDetails(rec))
    // Then sort: saved ones first
    const saved = withDetails.filter(rec => isCareerSaved(rec))
    const notSaved = withDetails.filter(rec => !isCareerSaved(rec))
    return [...saved, ...notSaved]
  }

  // Get sorted recommendations
  const sortedGradeRecs = useMemo(() => sortRecommendations(gradeRecs), [gradeRecs, savedCareerIds])
  const sortedInterestRecs = useMemo(() => sortRecommendations(interestRecs), [interestRecs, savedCareerIds])

  const stats = useMemo(() => {
    // Use filtered recommendations (with details only) for stats
    // For free users, include preview recommendations in stats
    const allRecs = isPro 
      ? [...sortedGradeRecs, ...sortedInterestRecs]
      : [...previewRecs, ...sortedGradeRecs, ...sortedInterestRecs]
    const total = allRecs.length
    
    // Calculate confidence level from confidence score if not set
    const recsWithLevels = allRecs.map(rec => {
      let level = rec.confidenceLevel || rec.matchLevel
      // If no level but has confidence score, calculate it
      if (!level && rec.confidence) {
        if (rec.confidence >= 85) {
          level = "High"
        } else if (rec.confidence >= 70) {
          level = "Medium"
        } else {
          level = "Low"
        }
      }
      return { ...rec, confidenceLevel: level || "Medium" }
    })
    
    const high = recsWithLevels.filter((rec) => {
      const level = (rec.confidenceLevel || "").toString().toLowerCase()
      return level === "high" || level === "strong match" || rec.confidence >= 85
    }).length
    
    const medium = recsWithLevels.filter((rec) => {
      const level = (rec.confidenceLevel || "").toString().toLowerCase()
      return level === "medium" || level === "good match" || level === "moderate match" || 
             (rec.confidence >= 70 && rec.confidence < 85)
    }).length
    
    const saved = savedCareersCount
    
    // Count unique categories
    const uniqueCategories = new Set()
    recsWithLevels.forEach(rec => {
      if (rec.category && rec.category !== "default" && rec.category !== "General") {
        uniqueCategories.add(rec.category)
      }
    })
    const categories = uniqueCategories.size
    
    return { total, high, medium, saved, categories }
  }, [sortedGradeRecs, sortedInterestRecs, savedCareersCount, previewRecs, isPro])

  const fetchGradeRecommendations = async (analysis) => {
    setLoadingGrades(true)
    setGradeError(null)
    try {
      if (!analysis) {
        console.warn("fetchGradeRecommendations: No analysis data provided")
        setGradeError("No grade data available. Please upload your marksheet.")
        setLoadingGrades(false)
        return
      }

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

      const requestData = {
        grade12: grade12,
        grade10: analysis.grade10 || null,
        stream: stream,
        subjects: subjects,
      }

      console.log("fetchGradeRecommendations: Request data:", requestData, "Original analysis:", analysis, "isPro:", isPro)

      // For Free users, fetch full recommendations but only show first 1-2, rest will be preview
      // For Pro users, fetch full recommendations
      const response = await recommendationService.getByGrades(requestData)

      if (response?.data?.recommendations && response.data.recommendations.length > 0) {
        // Transform API response to match UI format
        const allRecommendations = response.data.recommendations.map((rec) => {
          // Find matching career from allCareers if possible
          const matchingCareer = allCareers.find(
            (c) => c.title === rec.title || c.careerName === rec.title || c.name === rec.title
          )

          // Calculate confidence level from confidence score if not provided
          const confidence = rec.confidence || 75
          let confidenceLevel = rec.confidenceLevel
          if (!confidenceLevel && confidence) {
            if (confidence >= 85) {
              confidenceLevel = "High"
            } else if (confidence >= 70) {
              confidenceLevel = "Medium"
            } else {
              confidenceLevel = "Low"
            }
          } else if (!confidenceLevel) {
            confidenceLevel = "Medium"
          }

          // Get salary from various sources
          const salaryValue = rec.salaryRange || matchingCareer?.salaryRange || matchingCareer?.averageSalaryUSD || "Not specified"
          // Get job outlook/growth from various sources
          const growthValue = rec.jobGrowth || rec.jobOutlook || matchingCareer?.jobOutlook || matchingCareer?.outlook || "Medium"

          return {
            id: rec.id || matchingCareer?.id || `rec-${Date.now()}-${Math.random()}`,
            careerId: matchingCareer?.id || null,
            careerName: rec.title,
            title: rec.title,
            description: rec.description || matchingCareer?.description || "",
            category: rec.category || matchingCareer?.category || "General",
            confidence: confidence,
            confidenceLevel: confidenceLevel,
            matchReason: rec.matchReason || "",
            salary: salaryValue,
            salaryRange: salaryValue,
            growth: growthValue,
            jobGrowth: growthValue,
            jobOutlook: growthValue,
            skills: rec.skills || matchingCareer?.requiredSkills || matchingCareer?.skills || [],
            opportunities: rec.opportunities || matchingCareer?.opportunities || [],
            requiredSkills: rec.skills || matchingCareer?.requiredSkills || [],
          }
        })

        // For free users, they already get limited to 2 from backend
        // Fetch preview for additional locked cards
        if (!isPro) {
          setGradeRecs(allRecommendations)
          // Fetch preview recommendations to show as locked cards
          await fetchPreviewRecommendations("grades", requestData)
        } else {
          // Pro users get all recommendations
          setGradeRecs(allRecommendations)
        }
      } else {
        // Python service returned empty recommendations
        setGradeRecs([])
        setGradeError(getRecommendationError("Service temporarily unavailable"))
      }
    } catch (error) {
      console.error("Failed to fetch grade recommendations:", error)
      // Check if it's a PRO_REQUIRED error (shouldn't happen for Pro users, but handle gracefully)
      if (error?.response?.status === 403 && error?.response?.data?.code === "PRO_REQUIRED") {
        handleOpenPaywall("recommendations_unlock")
        setGradeError("Upgrade to Pro to unlock full recommendations.")
        // If somehow a Pro user got this error, try preview as fallback
        if (!isPro && analysis) {
          // Calculate request data for preview
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
          const subjects = Array.isArray(analysis.subjects)
            ? analysis.subjects.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean)
            : []
          const previewRequest = {
            grade12: grade12,
            grade10: analysis.grade10 || null,
            stream: stream,
            subjects: subjects,
          }
          await fetchPreviewRecommendations("grades", previewRequest)
        }
      } else {
        setGradeError(getRecommendationError(error))
      }
    } finally {
      setLoadingGrades(false)
    }
  }

  const fetchInterestRecommendations = async (interests) => {
    setLoadingInterests(true)
    setInterestError(null)
    try {
      if (!interests) {
        console.warn("fetchInterestRecommendations: No interests data provided")
        setInterestError("No interests data available. Please complete your interests.")
        setLoadingInterests(false)
        return
      }

      const careerFields = interests.careerFields || []
      const activities = interests.activities || []
      const workEnvironments = interests.workEnvironments || []

      const requestData = {
        careerFields: careerFields,
        activities: activities,
        workEnvironments: workEnvironments,
      }

      console.log("fetchInterestRecommendations: Request data:", requestData, "Original interests:", interests, "isPro:", isPro)

      // For Free users, fetch full recommendations but only show first 1-2, rest will be preview
      // For Pro users, fetch full recommendations
      const response = await recommendationService.getByInterests(requestData)

      if (response?.data?.recommendations && response.data.recommendations.length > 0) {
        // Transform API response to match UI format
        const allRecommendations = response.data.recommendations.map((rec) => {
          const matchingCareer = allCareers.find(
            (c) => c.title === rec.title || c.careerName === rec.title || c.name === rec.title
          )

          // Calculate confidence level from confidence score if not provided
          const confidence = rec.confidence || 75
          let confidenceLevel = rec.confidenceLevel
          if (!confidenceLevel && confidence) {
            if (confidence >= 85) {
              confidenceLevel = "High"
            } else if (confidence >= 70) {
              confidenceLevel = "Medium"
            } else {
              confidenceLevel = "Low"
            }
          } else if (!confidenceLevel) {
            confidenceLevel = "Medium"
          }

          // Get salary from various sources
          const salaryValue = rec.salaryRange || matchingCareer?.salaryRange || matchingCareer?.averageSalaryUSD || "Not specified"
          // Get job outlook/growth from various sources
          const growthValue = rec.jobGrowth || rec.jobOutlook || matchingCareer?.jobOutlook || matchingCareer?.outlook || "Medium"

          return {
            id: rec.id || matchingCareer?.id || `rec-${Date.now()}-${Math.random()}`,
            careerId: matchingCareer?.id || null,
            careerName: rec.title,
            title: rec.title,
            description: rec.description || matchingCareer?.description || "",
            category: rec.category || matchingCareer?.category || "General",
            confidence: confidence,
            confidenceLevel: confidenceLevel,
            matchReason: rec.matchReason || "",
            salary: salaryValue,
            salaryRange: salaryValue,
            growth: growthValue,
            jobGrowth: growthValue,
            jobOutlook: growthValue,
            skills: rec.skills || matchingCareer?.requiredSkills || matchingCareer?.skills || [],
            opportunities: rec.opportunities || matchingCareer?.opportunities || [],
            requiredSkills: rec.skills || matchingCareer?.requiredSkills || [],
          }
        })

        // For free users, they already get limited to 2 from backend
        // Fetch preview for additional locked cards
        if (!isPro) {
          setInterestRecs(allRecommendations)
          // Fetch preview recommendations to show as locked cards
          await fetchPreviewRecommendations("interests", requestData)
        } else {
          // Pro users get all recommendations
          setInterestRecs(allRecommendations)
        }
      } else {
        // Python service returned empty recommendations
        setInterestRecs([])
        setInterestError(getRecommendationError("Service temporarily unavailable"))
      }
    } catch (error) {
      console.error("Failed to fetch interest recommendations:", error)
      // Check if it's a PRO_REQUIRED error (shouldn't happen for Pro users, but handle gracefully)
      if (error?.response?.status === 403 && error?.response?.data?.code === "PRO_REQUIRED") {
        handleOpenPaywall("recommendations_unlock")
        setInterestError("Upgrade to Pro to unlock full recommendations.")
        // If somehow a Pro user got this error, try preview as fallback
        if (!isPro && interests) {
          const previewRequest = {
            careerFields: interests.careerFields || [],
            activities: interests.activities || [],
            workEnvironments: interests.workEnvironments || [],
          }
          await fetchPreviewRecommendations("interests", previewRequest)
        }
      } else {
        setInterestError(getRecommendationError(error))
      }
    } finally {
      setLoadingInterests(false)
    }
  }

  const fetchCollegeRecommendations = async (analysis, interests) => {
    if (!user?.id) return
    if (!analysis || !interests) {
      console.log("fetchCollegeRecommendations: Missing analysis or interests", { analysis, interests })
      return
    }

    // If not Pro, don't call full API
    if (!isPro) {
      return
    }

    setLoadingColleges(true)
    setCollegeError(null)
    try {
      // Calculate grade12 from subjects if not directly available
      let grade12 = analysis.grade12 ?? null
      if (!grade12 && analysis.subjects && Array.isArray(analysis.subjects) && analysis.subjects.length > 0) {
        const marks = analysis.subjects
          .map((s) => (typeof s === "object" && s !== null ? s.marks : null))
          .filter((m) => m != null && !isNaN(m))
        if (marks.length > 0) {
          grade12 = marks.reduce((sum, m) => sum + m, 0) / marks.length
        }
      }
      grade12 = grade12 ?? 70 // Default to 70 if still not available

      const grade10 = analysis.grade10 ?? null
      const stream = (analysis.stream || "general").toLowerCase()
      const subjects = Array.isArray(analysis.subjects)
        ? analysis.subjects
            .map((s) => (typeof s === "string" ? s : s?.name || ""))
            .filter(Boolean)
        : []

      const request = {
        grade10,
        grade12,
        stream,
        subjects,
        careerFields: interests.careerFields || [],
        activities: interests.activities || [],
        workEnvironments: interests.workEnvironments || [],
      }

      console.log("fetchCollegeRecommendations: Request data:", request)

      if (!request.grade12 || !request.stream || request.subjects.length === 0) {
        console.warn("fetchCollegeRecommendations: Missing required data", {
          grade12: request.grade12,
          stream: request.stream,
          subjectsLength: request.subjects.length,
        })
        setCollegeRecs([])
        setCollegeError(null)
        return
      }

      console.log("fetchCollegeRecommendations: Calling API with request:", request)
      const response = await getCollegeRecommendations(request, 10) // Request at least 10 colleges
      console.log("fetchCollegeRecommendations: API response:", response, "Type:", typeof response, "Is Array:", Array.isArray(response))
      
      const colleges = Array.isArray(response) ? response : response?.data || []
      console.log("fetchCollegeRecommendations: Processed colleges:", colleges, "Count:", colleges.length)
      setCollegeRecs(colleges)
    } catch (error) {
      console.error("Failed to fetch college recommendations:", error)
      // Check if it's a PRO_REQUIRED error
      if (error?.response?.status === 403 && error?.response?.data?.code === "PRO_REQUIRED") {
        handleOpenPaywall("recommendations_unlock")
        setCollegeError("Upgrade to Pro to unlock full recommendations.")
      } else {
        setCollegeRecs([])
        setCollegeError(getRecommendationError(error))
      }
    } finally {
      setLoadingColleges(false)
    }
  }

  // Fetch college recommendations whenever analysis or interests change
  useEffect(() => {
    if (!user?.id) return
    if (!analysisSummary || !interestSummary) return
    
    // Fetch college recommendations with latest data
    // This will trigger whenever analysisSummary or interestSummary changes
    fetchCollegeRecommendations(analysisSummary, interestSummary)
  }, [user?.id, analysisSummary, interestSummary])
  
  // Reload interests from backend when window gains focus (user returns to tab/page)
  useEffect(() => {
    if (!user?.id || !user?.email) return
    
    const handleFocus = async () => {
      // Reload interests from backend when window gains focus
      try {
        const response = await studentService.getByEmail(user.email)
        const student = response.data
        if (student) {
          const hasInterests = 
            (student.careerFields && student.careerFields.length > 0) ||
            (student.activities && student.activities.length > 0) ||
            (student.workEnvironments && student.workEnvironments.length > 0)
          
          if (hasInterests) {
            const interests = {
              careerFields: student.careerFields || [],
              activities: student.activities || [],
              workEnvironments: student.workEnvironments || [],
            }
            
            // Check if interests actually changed
            const currentInterests = interestSummary
            const interestsChanged = 
              !currentInterests ||
              JSON.stringify(currentInterests.careerFields || []) !== JSON.stringify(interests.careerFields) ||
              JSON.stringify(currentInterests.activities || []) !== JSON.stringify(interests.activities) ||
              JSON.stringify(currentInterests.workEnvironments || []) !== JSON.stringify(interests.workEnvironments)
            
            if (interestsChanged) {
              setInterestSummary(interests)
              fetchInterestRecommendations(interests)
              // Update localStorage
              const interestsKey = getUserStorageKey("userInterests", user.id)
              localStorage.setItem(interestsKey, JSON.stringify(interests))
              
              // Refresh college recommendations with new interests
              if (analysisSummary) {
                fetchCollegeRecommendations(analysisSummary, interests)
              }
            }
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to reload interests on focus:", err)
        }
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id, user?.email, analysisSummary, interestSummary])

  const toggleCollegeSaved = async (collegeId) => {
    if (!user?.id) {
      navigate("/login")
      return
    }
    if (!collegeId) return
    const idString = String(collegeId)
    const wasSaved = savedCollegeIds.has(idString)

    setSavedCollegeIds((prev) => {
      const next = new Set(prev)
      if (wasSaved) next.delete(idString)
      else next.add(idString)
      return next
    })

    try {
      if (wasSaved) {
        await unsaveCollege(user.id, collegeId)
        toast.success("College removed from saved")
      } else {
        await saveCollege(user.id, collegeId)
        toast.success("College saved")
      }
    } catch (error) {
      const message = getRecommendationError(error)
      toast.error(message)
      setSavedCollegeIds((prev) => {
        const next = new Set(prev)
        if (wasSaved) next.add(idString)
        else next.delete(idString)
        return next
      })
    } finally {
      fetchSavedColleges()
    }
  }

  // Paywall handler
  const handleOpenPaywall = (reason = "recommendations_unlock") => {
    const currentPath = window.location.pathname + (window.location.search || "")
    if (currentPath !== "/checkout/pro" && currentPath !== "/billing") {
      const existingRedirect = sessionStorage.getItem("postUpgradeRedirect")
      if (!existingRedirect || existingRedirect === "/checkout/pro" || existingRedirect === "/billing") {
        sessionStorage.setItem("postUpgradeRedirect", currentPath)
      }
    }
    setPaywallModalOpen(true)
  }

  // Fetch preview recommendations for Free users
  const fetchPreviewRecommendations = async (type = "grades", requestData = null) => {
    if (isPro) return // Don't fetch preview for Pro users
    
    setLoadingPreview(true)
    // Clear previous preview data when fetching new preview
    setPreviewRecs([])
    try {
      const response = await recommendationService.getPreview(type, requestData, 5)
      setPreviewRecs(response?.data || [])
    } catch (error) {
      console.error("Failed to fetch preview recommendations:", error)
      // Don't show error for preview - it's optional
      setPreviewRecs([])
    } finally {
      setLoadingPreview(false)
    }
  }

  // Show loading if subscription status is still loading
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-accent" />
                <h1 className="text-4xl font-bold">
                  {isPro ? "Career Recommendations" : "Preview Recommendations"}
                </h1>
              </div>
              {!isPro && (
                <Button onClick={handleOpenPaywall} className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              {isPro 
                ? "Discover career paths tailored to your academic performance and personal interests"
                : "Preview your personalized recommendations. Upgrade to Pro to unlock full details and access all features."}
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            {[
              { label: "Total Matches", value: stats.total, icon: Target, color: "text-primary" },
              { label: "High Confidence", value: stats.high, icon: TrendingUp, color: "text-success" },
              { label: "Medium Confidence", value: stats.medium, icon: Clock, color: "text-warning" },
              { label: "Categories", value: stats.categories, icon: Folder, color: "text-info" },
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
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="grades" className="flex items-center space-x-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  <span>Based on Grades</span>
                </TabsTrigger>
                <TabsTrigger value="interests" className="flex items-center space-x-2 text-base">
                  <Target className="h-4 w-4" />
                  <span>Based on Interests</span>
                </TabsTrigger>
                <TabsTrigger value="colleges" className="flex items-center space-x-2 text-base">
                  <Building2 className="h-4 w-4" />
                  <span>Colleges</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Grade-Based Recommendations</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {sortedGradeRecs.length} matches found
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

                {loadingCareers || loadingGrades || loadingPreview ? (
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
                ) : !isPro ? (
                  <>
                    {(sortedGradeRecs.length > 0 || previewRecs.length > 0) ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Show 1-2 full recommendations for free users */}
                        {sortedGradeRecs.map((career, index) => (
                          <CareerCard
                            key={career.id || `career-${index}`}
                            career={career}
                            index={index}
                            savedCareerIds={savedCareerIds}
                            onSaveChange={handleSaveChange}
                          />
                        ))}
                        {/* Show rest as locked preview cards */}
                        {previewRecs.map((preview, index) => (
                          <PreviewCard
                            key={preview.previewId || `preview-${index}`}
                            preview={preview}
                            index={sortedGradeRecs.length + index}
                            onUnlock={handleOpenPaywall}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                        <CardContent className="p-8 text-center space-y-4">
                          <Lock className="h-12 w-12 text-primary mx-auto" />
                          <h3 className="text-2xl font-bold">Preview Recommendations</h3>
                          <p className="text-muted-foreground">
                            Complete your assessment to see preview recommendations. Upgrade to Pro to unlock full details.
                          </p>
                          <Button onClick={handleOpenPaywall} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                            Upgrade to Pro
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    {(sortedGradeRecs.length > 0 || previewRecs.length > 0) && (
                      <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                        <CardContent className="p-6 text-center space-y-4">
                          <h3 className="text-xl font-bold">Unlock Full Recommendations</h3>
                          <p className="text-muted-foreground">
                            You're viewing {sortedGradeRecs.length} free recommendation{sortedGradeRecs.length !== 1 ? 's' : ''}. Upgrade to Pro to see all recommendations and unlock full details.
                          </p>
                          <Button onClick={handleOpenPaywall} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                            Upgrade to Pro
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : isPro && sortedGradeRecs.length > 0 ? (
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
                      {sortedInterestRecs.length} matches found
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

                {loadingCareers || loadingInterests || loadingPreview ? (
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
                ) : !isPro ? (
                  <>
                    {(sortedInterestRecs.length > 0 || previewRecs.length > 0) ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Show 1-2 full recommendations for free users */}
                        {sortedInterestRecs.map((career, index) => (
                          <CareerCard
                            key={career.id || `career-${index}`}
                            career={career}
                            index={index}
                            savedCareerIds={savedCareerIds}
                            onSaveChange={handleSaveChange}
                          />
                        ))}
                        {/* Show rest as locked preview cards */}
                        {previewRecs.map((preview, index) => (
                          <PreviewCard
                            key={preview.previewId || `preview-${index}`}
                            preview={preview}
                            index={sortedInterestRecs.length + index}
                            onUnlock={handleOpenPaywall}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                        <CardContent className="p-8 text-center space-y-4">
                          <Lock className="h-12 w-12 text-primary mx-auto" />
                          <h3 className="text-2xl font-bold">Preview Recommendations</h3>
                          <p className="text-muted-foreground">
                            Complete your assessment to see preview recommendations. Upgrade to Pro to unlock full details.
                          </p>
                          <Button onClick={handleOpenPaywall} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                            Upgrade to Pro
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    {(sortedInterestRecs.length > 0 || previewRecs.length > 0) && (
                      <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                        <CardContent className="p-6 text-center space-y-4">
                          <h3 className="text-xl font-bold">Unlock Full Recommendations</h3>
                          <p className="text-muted-foreground">
                            You're viewing {sortedInterestRecs.length} free recommendation{sortedInterestRecs.length !== 1 ? 's' : ''}. Upgrade to Pro to see all recommendations and unlock full details.
                          </p>
                          <Button onClick={handleOpenPaywall} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                            Upgrade to Pro
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : isPro && sortedInterestRecs.length > 0 ? (
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

              <TabsContent value="colleges" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Recommended Colleges</h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {collegeRecs.length} matches found
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    These colleges are recommended from your grades + interests.
                  </p>
                  {(!analysisSummary || !interestSummary) && (
                    <EmptyState
                      icon={Sparkles}
                      title="Complete your assessment"
                      description="Upload your marksheet and select your interests to get college recommendations."
                      action={{
                        label: "Go to Assessment",
                        onClick: () => navigate("/assessment"),
                        variant: "default",
                      }}
                    />
                  )}
                </div>

                {!isPro ? (
                  <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                    <CardContent className="p-8 text-center space-y-4">
                      <Lock className="h-12 w-12 text-primary mx-auto" />
                      <h3 className="text-2xl font-bold">College Recommendations</h3>
                      <p className="text-muted-foreground">
                        Upgrade to Pro to unlock personalized college recommendations based on your grades and interests.
                      </p>
                      <Button onClick={handleOpenPaywall} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                        Upgrade to Pro
                      </Button>
                    </CardContent>
                  </Card>
                ) : loadingColleges ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading colleges...
                  </div>
                ) : collegeError ? (
                  <EmptyState
                    icon={AlertCircle}
                    title="Unable to Load Colleges"
                    description={collegeError}
                    action={{
                      label: "Try Again",
                      onClick: () => fetchCollegeRecommendations(analysisSummary, interestSummary),
                      variant: "secondary",
                    }}
                  />
                ) : normalizedCollegeRecs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {normalizedCollegeRecs.map((college, index) => {
                      const idString = college?.id ? String(college.id) : ""
                      return (
                        <CollegeCard
                          key={college?.id ? `rec-college-${college.id}` : `rec-college-${index}`}
                          college={college}
                          index={index}
                          isSaved={idString ? savedCollegeIds.has(idString) : false}
                          onToggleSaved={toggleCollegeSaved}
                          matchScore={college.matchScore}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="No Colleges Yet"
                    description="Complete your assessment to generate college recommendations."
                    action={{
                      label: "Go to Assessment",
                      onClick: () => navigate("/assessment"),
                      variant: "default",
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Action Section */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6, delay: 0.4 }}
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

          {/* Paywall Modal */}
          <ProPaywallModal open={paywallModalOpen} onOpenChange={setPaywallModalOpen} />
    </div>
  )
}
