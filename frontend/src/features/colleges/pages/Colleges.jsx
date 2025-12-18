import { useEffect, useState, memo } from "react"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import {
  Building2,
  MapPin,
  Users,
  Star,
  Search,
  Filter,
  GraduationCap,
  DollarSign,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { getColleges, saveCollege, unsaveCollege, checkCollegeSaved, getSavedColleges, getCollegeRecommendations } from "@/shared/lib/api"
import Pagination from "@/shared/components/common/pagination"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"
import { collegeService } from "../services/collegeService"
import { useNavigate } from "react-router-dom"
import { logger } from "@/shared/lib/utils/logger"
import { CollegeCardListSkeleton } from "@/shared/components/common/LoadingSkeleton"
import { extractErrorMessage, isAuthError } from "@/shared/utils/errorMessages"
import { EmptySearchState, EmptyErrorState } from "@/shared/components/common/EmptyState"
import { getUserStorageKey } from "@/shared/utils/utils"

const PUBLIC_KEYWORDS = ["campus", "public", "government", "constituent", "state", "community"]
const PRIVATE_KEYWORDS = ["college", "academy", "institute", "school", "private"]

const parsePrograms = (programs) => {
  if (!programs) return []
  
  // If it's already an array
  if (Array.isArray(programs)) {
    return programs.map((program, index) => {
      if (typeof program === "string") return program
      if (typeof program === "object" && program !== null) {
        return program.name || program.title || program.program || ""
      }
      return ""
    }).filter(Boolean)
  }

  // If it's a string, try to parse as JSON
  if (typeof programs === "string") {
    // Check if it's a JSON string
    const trimmed = programs.trim()
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(programs)
        if (Array.isArray(parsed)) {
          return parsed.map((item, index) => {
            if (typeof item === "string") return item
            if (typeof item === "object" && item !== null) {
              return item.name || item.title || item.program || ""
            }
            return ""
          }).filter(Boolean)
        }
      } catch (error) {
        // If JSON parsing fails, try comma-separated
        return programs.split(",").map((item) => item.trim()).filter(Boolean)
      }
    } else {
      // Not JSON, treat as comma-separated
      return programs.split(",").map((item) => item.trim()).filter(Boolean)
    }
  }

  return []
}

const inferCollegeType = (college) => {
  const rawType = (college.type || "").toString().trim().toLowerCase()
  if (rawType.includes("public")) return "public"
  if (rawType.includes("private")) return "private"

  const name = (college.name || "").toLowerCase()
  const overview = (college.overview || "").toLowerCase()
  const description = (college.description || "").toLowerCase()
  const combinedText = `${name} ${overview} ${description}`

  if (PUBLIC_KEYWORDS.some((keyword) => combinedText.includes(keyword))) {
    return "public"
  }

  if (PRIVATE_KEYWORDS.some((keyword) => combinedText.includes(keyword))) {
    return "private"
  }

  return "unknown"
}

const formatCollegeType = (type) => {
  if (type === "public") return "Public"
  if (type === "private") return "Private"
  return "Unknown"
}

const transformCollege = (college) => {
  // Ensure overview is properly mapped to description
  const description = college.overview || college.description || ""
  
  // Parse programs
  const programs = parsePrograms(college.programs)
  const inferredType = inferCollegeType(college)
  
  return {
    ...college,
    programs,
    description: description.trim(),
    // Keep overview for backward compatibility
    overview: college.overview || "",
    type: inferredType,
    displayType: formatCollegeType(inferredType),
  }
}

const hasCompleteData = (college) => {
  // Check if college has essential data
  const hasDescription = (college.description && college.description.trim().length > 0) || 
                         (college.overview && college.overview.trim().length > 0)
  const hasPrograms = college.programs && Array.isArray(college.programs) && college.programs.length > 0
  const hasName = college.name && college.name.trim().length > 0
  
  // Only show colleges with description and programs
  return hasName && hasDescription && hasPrograms
}

const dedupeColleges = (colleges) => {
  const seen = new Set()
  return colleges.filter((college) => {
    const key =
      (college.id && String(college.id).toLowerCase()) ||
      (college.detailUrl && college.detailUrl.toLowerCase()) ||
      (college.name && college.name.toLowerCase())

    if (!key) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const CollegeCard = memo(({ college, index, savedCollegeIds, onSaveChange }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Check if college is saved based on the savedCollegeIds set
  // Convert to string for consistent comparison
  const collegeIdString = String(college?.id || '')
  const isSaved = savedCollegeIds.has(collegeIdString)
  
  // Log user and college data for debugging
  useEffect(() => {
    if (!user?.id) {
      logger.warn('CollegeCard: User not available', { user })
    }
    if (!college?.id) {
      logger.warn('CollegeCard: College ID not available', { college })
    }
  }, [user, college])

  const handleStarClick = async (e) => {
    e.stopPropagation()
    
    // Detailed logging to debug the issue
    const hasUserId = !!user?.id
    const hasCollegeId = !!college.id
    const isCurrentlySaving = isSaving
    
    logger.log('Save college check:', {
      hasUserId,
      userId: user?.id,
      user: user,
      hasCollegeId,
      collegeId: college.id,
      college: college,
      isSaving: isCurrentlySaving
    })
    
    if (!hasUserId || !hasCollegeId || isCurrentlySaving) {
      logger.warn('Cannot save college - missing requirements:', {
        missingUserId: !hasUserId,
        missingCollegeId: !hasCollegeId,
        isSaving: isCurrentlySaving,
        userId: user?.id,
        collegeId: college.id
      })
      return
    }

    logger.log('Starting save/unsave operation:', { userId: user.id, collegeId: college.id, isSaved })
    setIsSaving(true)
    try {
      if (isSaved) {
        logger.log('Unsave college:', college.id)
        await unsaveCollege(user.id, college.id)
        // Update the saved colleges list
        if (onSaveChange) {
          onSaveChange(college.id, false)
        }
        toast.success("College removed from saved")
      } else {
        logger.log('Save college:', college.id)
        const result = await saveCollege(user.id, college.id)
        logger.log('Save college result:', result)
        // Update the saved colleges list
        if (onSaveChange) {
          onSaveChange(college.id, true)
        }
        // Show success animation
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
        toast.success("College saved successfully")
      }
    } catch (error) {
      logger.error("Error saving/unsaving college:", error)
      const errorMessage = extractErrorMessage(error)
      logger.error("Error message:", errorMessage)
      
      // Check if it's an authentication error
      if (isAuthError(error)) {
        toast.error("Your session has expired. Please log in again.", {
          autoClose: 3000,
          onClose: () => {
            // Only redirect after showing the toast
            if (!window.location.pathname.includes('/login')) {
              localStorage.removeItem("user")
              import('@/shared/lib/navigation').then(({ navigate }) => {
                navigate('/login')
              })
            }
          }
        })
      } else {
        toast.error(errorMessage)
      }
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
      <Card className="h-full min-h-[460px] flex flex-col border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardHeader className="space-y-4 pb-0">
          <div className="flex items-start space-x-4">
            <img
              src={college.logo || "/placeholder.svg"}
              alt={`${college.name} logo`}
              className="w-16 h-16 rounded-lg object-cover border border-border"
              loading="lazy"
              decoding="async"
              width={64}
              height={64}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{college.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{college.location || "Location not available"}</span>
                  </div>
                  {college.affiliation && (
                    <div className="flex items-center space-x-2 mt-1">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{college.affiliation}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleStarClick}
                  disabled={isSaving || !user?.id || !college?.id}
                  className="transition-colors disabled:opacity-50 relative"
                  aria-label={
                    !user?.id 
                      ? "Please log in to save colleges" 
                      : !college?.id 
                        ? "College data incomplete" 
                        : isSaved 
                          ? "Remove from saved" 
                          : "Save college"
                  }
                  aria-pressed={isSaved}
                  title={
                    !user?.id 
                      ? "Please log in to save colleges" 
                      : !college?.id 
                        ? "College data incomplete" 
                        : isSaved 
                          ? "Remove from saved" 
                          : "Save college"
                  }
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <motion.div
                      animate={showSuccess ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
                      transition={{ duration: 0.6 }}
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          !user?.id || !college?.id
                            ? "text-muted-foreground cursor-not-allowed"
                            : isSaved
                              ? "text-yellow-500 fill-yellow-500 cursor-pointer"
                              : "text-muted-foreground group-hover:text-accent cursor-pointer"
                        }`}
                      />
                    </motion.div>
                  )}
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
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="secondary" className="text-xs">
                {college.displayType || "Unknown"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-6 pt-6">
        <CardDescription className="text-base leading-relaxed line-clamp-4">
          {college.description || college.overview || "No description available"}
        </CardDescription>

        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs">Students</span>
              </div>
              <span className="text-xs font-medium">{college.students || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xs">Tuition</span>
              </div>
              <span className="text-xs font-medium">{college.tuition || "N/A"}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-1">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                <span className="text-xs">Acceptance</span>
              </div>
              <span className="text-xs font-medium">{college.acceptanceRate || college.acceptance || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-xs">Founded</span>
              </div>
              <span className="text-xs font-medium">{college.establishedYear || college.established || "N/A"}</span>
            </div>
          </div>
        </div>

        {college.programs && Array.isArray(college.programs) && college.programs.length > 0 && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Popular Programs</h4>
              <div className="flex flex-wrap gap-1">
                {college.programs.slice(0, 4).map((program, idx) => (
                  <Badge key={`${college.id || idx}-${program}`} variant="secondary" className="text-xs">
                    {typeof program === "string" ? program : program.name || program.title || program}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-2 mt-auto">
          <Button 
            variant="outline" 
            className="w-full bg-transparent"
            onClick={handleStarClick}
            disabled={isSaving || !user?.id || !college?.id}
            title={!user?.id ? "Please log in to save colleges" : !college?.id ? "College data incomplete" : ""}
          >
            {!user?.id ? "Login to Save" : isSaved ? "Saved" : "Save"}
          </Button>
          <Button className="w-full" onClick={() => college.detailUrl && window.open(college.detailUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {college.detailUrl ? "View Details" : "Visit Website"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if college data or saved status changes
  const prevCollegeId = String(prevProps.college?.id || '')
  const nextCollegeId = String(nextProps.college?.id || '')
  const prevIsSaved = prevProps.savedCollegeIds?.has(prevCollegeId)
  const nextIsSaved = nextProps.savedCollegeIds?.has(nextCollegeId)
  
  // Re-render if college ID changed
  if (prevCollegeId !== nextCollegeId) {
    return false
  }
  
  // Re-render if saved status changed
  if (prevIsSaved !== nextIsSaved) {
    return false
  }
  
  // Re-render if index changed (for animation)
  if (prevProps.index !== nextProps.index) {
    return false
  }
  
  // Don't re-render if nothing relevant changed
  return true
})

CollegeCard.displayName = 'CollegeCard'

export default function CollegesPage() {
  const [allColleges, setAllColleges] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 })
  const [savedCollegeIds, setSavedCollegeIds] = useState(new Set())
  const [savedCollegesFullData, setSavedCollegesFullData] = useState([]) // Store full saved college objects
  const [filters, setFilters] = useState({
    location: null,
    affiliation: null,
    minYear: null,
    maxYear: null,
    program: null,
    type: null,
    sortBy: "name",
    sortOrder: "asc"
  })
  const { user } = useAuth()

  // AI college recommendations (grades + interests)
  const [aiColleges, setAiColleges] = useState([])
  const [loadingAiColleges, setLoadingAiColleges] = useState(false)
  const [aiCollegesError, setAiCollegesError] = useState(null)

  // Function to fetch saved college IDs and full data
  const fetchSavedColleges = async () => {
    if (!user?.id) {
      setSavedCollegeIds(new Set())
      setSavedCollegesFullData([])
      return
    }

    try {
      const savedColleges = await getSavedColleges(user.id)
      // Convert IDs to strings for consistent comparison
      const ids = new Set(savedColleges.map(sc => String(sc.collegeId || sc.id)))
      setSavedCollegeIds(ids)
      
      // Fetch full college data for all saved colleges
      if (savedColleges.length > 0) {
        try {
          // Fetch only the saved colleges by ID using the backend batch endpoint
          const uniqueIds = Array.from(ids)
          const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
          const apiBase = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`
          const response = await fetch(`${apiBase}/colleges/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(uniqueIds),
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch saved colleges full data (${response.status})`)
          }

          const data = await response.json()
          const fullColleges = (Array.isArray(data) ? data : []).map(transformCollege)
          setSavedCollegesFullData(fullColleges)
        } catch (err) {
          logger.error("Failed to fetch saved colleges full data:", err)
          setSavedCollegesFullData([])
        }
      } else {
        setSavedCollegesFullData([])
      }
    } catch (error) {
        logger.error("Failed to fetch saved colleges:", error)
        const errorMessage = extractErrorMessage(error)
        toast.error(errorMessage)
      setSavedCollegeIds(new Set())
      setSavedCollegesFullData([])
    }
  }

  // Fetch saved college IDs when user is available
  useEffect(() => {
    fetchSavedColleges()
  }, [user?.id])

  // Fetch AI-powered college recommendations based on grades + interests
  useEffect(() => {
    const fetchAiColleges = async () => {
      if (!user?.id) {
        setAiColleges([])
        setAiCollegesError(null)
        return
      }

      try {
        setLoadingAiColleges(true)
        setAiCollegesError(null)

        const gradesKey = getUserStorageKey("aiGradesAnalysis", user.id)
        const interestsKey = getUserStorageKey("userInterests", user.id)
        const storedGrades = localStorage.getItem(gradesKey)
        const storedInterests = localStorage.getItem(interestsKey)

        if (!storedGrades || !storedInterests) {
          setAiColleges([])
          return
        }

        let grades
        let interests
        try {
          grades = JSON.parse(storedGrades)
          interests = JSON.parse(storedInterests)
        } catch (parseError) {
          logger.error("Failed to parse stored grades/interests for AI colleges:", parseError)
          setAiColleges([])
          return
        }

        const grade10 = grades.grade_10_percentage ?? null
        const grade12 = grades.grade_12_percentage ?? null
        const stream = (grades.stream || "general").toLowerCase()
        const subjects = Array.isArray(grades.subjects) ? grades.subjects : []

        const careerFields = interests.careerFields || []
        const activities = interests.activities || []
        const workEnvironments = interests.workEnvironments || []

        if (!grade12 || !stream || subjects.length === 0) {
          setAiColleges([])
          return
        }

        const request = {
          grade10,
          grade12,
          stream,
          subjects,
          careerFields,
          activities,
          workEnvironments,
        }

        const response = await getCollegeRecommendations(request, 4)
        const recommendations = Array.isArray(response) ? response : response?.data || []

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          setAiColleges([])
          return
        }

        const transformed = recommendations.map(transformCollege).filter(hasCompleteData)
        setAiColleges(transformed)
      } catch (error) {
        logger.error("Failed to fetch AI college recommendations:", error)
        const message = extractErrorMessage(error)
        setAiCollegesError(message)
      } finally {
        setLoadingAiColleges(false)
      }
    }

    fetchAiColleges()
  }, [user?.id])

  // Callback to update saved college IDs when a college is saved/unsaved
  const handleSaveChange = async (collegeId, isSaved) => {
    // Optimistically update the UI immediately
    setSavedCollegeIds(prev => {
      const newSet = new Set(prev)
      const idString = String(collegeId)
      if (isSaved) {
        newSet.add(idString)
      } else {
        newSet.delete(idString)
      }
      return newSet
    })
    
    // Refetch to ensure consistency with backend after a short delay
    setTimeout(() => {
      fetchSavedColleges()
    }, 300)
  }

  // Reset to page 1 when search term or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterType, filters])

  // Fetch all colleges when search is active, otherwise use pagination
  useEffect(() => {
    const fetchAllColleges = async () => {
      setLoading(true)
      setError(null)
      try {
        // Build filter params
        const filterParams = {
          size: 10000,
          ...filters
        }
        // Remove null/undefined values
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key] === null || filterParams[key] === undefined || filterParams[key] === "") {
            delete filterParams[key]
          }
        })
        
        const response = await collegeService.getAll(filterParams)
        const data = response.data?.data || response.data?.content || response.data || []
        const transformed = (Array.isArray(data) ? data : []).map(transformCollege)
        const normalized = dedupeColleges(transformed)
        const completeColleges = normalized.filter(hasCompleteData)
        // Sort by name A-Z if not already sorted
        if (!filters.sortBy || filters.sortBy === "name") {
          completeColleges.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        }
        setAllColleges(completeColleges)
      } catch (err) {
        logger.error("Failed to fetch all colleges:", err)
        const errorMessage = extractErrorMessage(err)
        toast.error(errorMessage)
        setAllColleges([])
        setError("Unable to load colleges right now. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    const fetchCollegesPaginated = async (pageNumber) => {
      setLoading(true)
      setError(null)
      try {
        // Build filter params
        const filterParams = {
          page: pageNumber - 1,
          size: pageSize * 3, // Fetch 3x to ensure we get enough complete colleges
          ...filters
        }
        // Remove null/undefined values
        Object.keys(filterParams).forEach(key => {
          if (filterParams[key] === null || filterParams[key] === undefined || filterParams[key] === "") {
            delete filterParams[key]
          }
        })
        
        const response = await collegeService.getAll(filterParams)
        const responseData = response.data || {}
        const data = responseData.data || responseData.content || []
        const transformed = (Array.isArray(data) ? data : []).map(transformCollege)
        const normalized = dedupeColleges(transformed)
        // Filter to only show colleges with complete data
        const completeColleges = normalized.filter(hasCompleteData).slice(0, pageSize)
        setColleges(completeColleges)
        
        // Update pagination metadata
        const meta = responseData.meta || {}
        const originalTotal = meta.totalElements || normalized.length
        setPageMeta({
          ...meta,
          totalElements: originalTotal,
          totalPages: Math.ceil(originalTotal / pageSize),
          page: pageNumber - 1,
          size: pageSize,
        })
      } catch (err) {
        logger.error("Failed to fetch colleges:", err)
        const errorMessage = extractErrorMessage(err)
        toast.error(errorMessage)
        setColleges([])
        setPageMeta({ totalPages: 1, totalElements: 0 })
        setError("Unable to load colleges right now. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (debouncedSearchTerm.trim()) {
      // When searching, fetch all colleges
      fetchAllColleges()
    } else {
      // When not searching, use pagination
      fetchCollegesPaginated(currentPage)
    }
  }, [debouncedSearchTerm, currentPage, filters])

  const handlePageChange = (page) => {
    if (page < 1) return
    if (pageMeta.totalPages && page > pageMeta.totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Filter colleges - use allColleges when searching, colleges when paginating
  const filteredColleges = (debouncedSearchTerm.trim() ? allColleges : colleges)
    .filter((college) => {
      const matchesSearch = debouncedSearchTerm.trim()
        ? (college.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
           college.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
           (college.programs && college.programs.some((program) => program.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))))
        : true

      const matchesType = filterType === "all" || (college.type && college.type.toLowerCase() === filterType)

      return matchesSearch && matchesType
    })

  // Filter saved colleges
  const filteredSavedColleges = savedCollegesFullData.filter((college) => {
    const matchesSearch = searchTerm.trim()
      ? (college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (college.programs && college.programs.some((program) => program.toLowerCase().includes(searchTerm.toLowerCase()))))
      : true

    const matchesType = filterType === "all" || (college.type && college.type.toLowerCase() === filterType)

    return matchesSearch && matchesType
  }).sort((a, b) => (a.name || "").localeCompare(b.name || ""))

  // Remove saved colleges from regular colleges to avoid duplicates
  const regularColleges = filteredColleges.filter(college => 
    !savedCollegeIds.has(String(college.id))
  ).sort((a, b) => (a.name || "").localeCompare(b.name || ""))

  // Combine: saved colleges first, then regular colleges
  const combinedColleges = [...filteredSavedColleges, ...regularColleges]

  // Paginate combined results
  let paginatedColleges
  if (debouncedSearchTerm.trim()) {
    // When searching, paginate the combined list normally
    paginatedColleges = combinedColleges.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  } else {
    // When not searching (using pagination), show saved colleges on page 1, then regular colleges from API
    if (currentPage === 1) {
      // Page 1: Show saved colleges first, then fill with regular colleges from the current page
      const remainingSlots = Math.max(0, pageSize - filteredSavedColleges.length)
      // Filter out saved colleges from the current page's colleges
      const regularCollegesFromPage = regularColleges.slice(0, remainingSlots)
      paginatedColleges = [...filteredSavedColleges, ...regularCollegesFromPage]
    } else {
      // Other pages: Show regular colleges from API (excluding saved ones since they're on page 1)
      // Just show the colleges from the current page, but filter out any that are saved
      paginatedColleges = regularColleges
    }
  }

  // Update pagination metadata
  const displayMeta = debouncedSearchTerm.trim()
    ? {
        totalPages: Math.ceil(combinedColleges.length / pageSize),
        totalElements: combinedColleges.length,
        page: currentPage - 1,
        size: pageSize,
      }
    : {
        // When paginating, use the original pageMeta from API
        ...pageMeta,
        // Total elements includes saved colleges
        totalElements: pageMeta.totalElements + filteredSavedColleges.length,
        // Total pages might need adjustment if saved colleges take up a full page
        totalPages: Math.max(pageMeta.totalPages, Math.ceil((pageMeta.totalElements + filteredSavedColleges.length) / pageSize)),
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
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Recommended Colleges</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover colleges and universities that align with your career goals and academic profile
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search colleges, programs, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <p className="text-muted-foreground">
              Showing {paginatedColleges.length} of {displayMeta.totalElements || filteredColleges.length} colleges
              {searchTerm.trim() && ` (${filteredColleges.length} found)`}
            </p>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Personalized for you
            </Badge>
          </motion.div>

          {/* AI Recommended Colleges (Grades + Interests) */}
          {(loadingAiColleges || aiColleges.length > 0 || aiCollegesError) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Recommended Colleges
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ranked using your grades and interests from the assessment.
                  </p>
                </div>
                {user?.id ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Grades + Interests
                  </Badge>
                ) : null}
              </div>

              {aiCollegesError && (
                <EmptyErrorState
                  error={aiCollegesError}
                  onRetry={() => {
                    setAiCollegesError(null)
                  }}
                />
              )}

              {loadingAiColleges && !aiCollegesError && <CollegeCardListSkeleton count={4} />}

              {!loadingAiColleges && !aiCollegesError && aiColleges.length === 0 && user?.id && (
                <EmptyState
                  icon={GraduationCap}
                  title="Complete your assessment to unlock AI college matches"
                  description="Upload your marksheet and choose your interests so our AI can match you with the best-fit colleges."
                  action={{
                    label: "Go to Assessment",
                    onClick: () => window.location.assign("/assessment"),
                    variant: "default",
                  }}
                />
              )}

              {!loadingAiColleges && !aiCollegesError && aiColleges.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aiColleges.map((college, index) => (
                    <CollegeCard
                      key={`ai-${college.id || index}`}
                      college={college}
                      index={index}
                      savedCollegeIds={savedCollegeIds}
                      onSaveChange={handleSaveChange}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <EmptyErrorState
              error={error}
              onRetry={() => {
                setError(null)
                setCurrentPage(1)
                // Trigger refetch by updating a dependency
                setSearchTerm(searchTerm)
              }}
            />
          )}

          {/* Loading State */}
          {loading && <CollegeCardListSkeleton count={6} />}

          {/* Colleges Grid */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedColleges.map((college, index) => (
                <CollegeCard 
                  key={college.id || index} 
                  college={college} 
                  index={index}
                  savedCollegeIds={savedCollegeIds}
                  onSaveChange={handleSaveChange}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && paginatedColleges.length === 0 && !error && (
            <EmptySearchState
              searchTerm={debouncedSearchTerm}
              onClearSearch={() => {
                setSearchTerm("")
                setFilterType("all")
                setCurrentPage(1)
              }}
            />
          )}

          {/* Pagination */}
          {!loading && (displayMeta.totalPages || 1) > 1 && (
            <Pagination currentPage={currentPage} totalPages={displayMeta.totalPages || 1} onPageChange={handlePageChange} />
          )}
        </div>
      </main>
    </div>
  )
}
