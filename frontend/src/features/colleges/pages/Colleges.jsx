import { useEffect, useState } from "react"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { motion } from "framer-motion"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import {
  Building2,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
} from "lucide-react"
import { getCollegeRecommendations, getSavedColleges, saveCollege, unsaveCollege } from "@/shared/lib/api"
import Pagination from "@/shared/components/common/pagination"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"
import { collegeService } from "../services/collegeService"
import { logger } from "@/shared/lib/utils/logger"
import { CollegeCardListSkeleton } from "@/shared/components/common/LoadingSkeleton"
import { extractErrorMessage } from "@/shared/utils/errorMessages"
import { EmptySearchState, EmptyErrorState } from "@/shared/components/common/EmptyState"
import { getUserStorageKey } from "@/shared/utils/utils"
import CollegeCard from "@/shared/components/common/CollegeCard"

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
  const [savedCollegeIds, setSavedCollegeIds] = useState(() => new Set())
  const [savedCollegesFullData, setSavedCollegesFullData] = useState([])
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

  const refreshSavedColleges = async (signal) => {
    if (!user?.id) {
      setSavedCollegeIds(new Set())
      setSavedCollegesFullData([])
      return
    }

    try {
      const saved = await getSavedColleges(user.id).catch(() => [])
      const ids = new Set(saved.map((item) => String(item.collegeId || item.id)))
      setSavedCollegeIds(ids)

      const uniqueIds = Array.from(ids)
      if (uniqueIds.length === 0) {
        setSavedCollegesFullData([])
        return
      }

      const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
      const apiBase = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`
      const response = await fetch(`${apiBase}/colleges/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(uniqueIds),
        signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch saved colleges (${response.status})`)
      }

      const data = await response.json()
      const fullColleges = (Array.isArray(data) ? data : []).map(transformCollege)
      setSavedCollegesFullData(fullColleges)
    } catch (error) {
      if (error?.name === "AbortError") return
      logger.error("Failed to refresh saved colleges:", error)
      setSavedCollegeIds(new Set())
      setSavedCollegesFullData([])
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    refreshSavedColleges(controller.signal)
    return () => controller.abort()
  }, [user?.id])

  const handleToggleSaved = async (collegeId) => {
    if (!user?.id || !collegeId) return
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
        setCurrentPage(1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }

      await refreshSavedColleges()
    } catch (error) {
      logger.error("Failed to toggle saved college:", error)
      const message = extractErrorMessage(error)
      toast.error(message)
      // revert optimistic update
      setSavedCollegeIds((prev) => {
        const next = new Set(prev)
        if (wasSaved) next.add(idString)
        else next.delete(idString)
        return next
      })
    }
  }

  // AI college recommendations (grades + interests)
  const [aiColleges, setAiColleges] = useState([])
  const [loadingAiColleges, setLoadingAiColleges] = useState(false)
  const [aiCollegesError, setAiCollegesError] = useState(null)

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

  const filteredSavedColleges = savedCollegesFullData
    .filter((college) => {
      const matchesSearch = debouncedSearchTerm.trim()
        ? (college.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
           college.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
           (college.programs && college.programs.some((program) => program.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))))
        : true

      const matchesType = filterType === "all" || (college.type && college.type.toLowerCase() === filterType)

      return matchesSearch && matchesType
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

  const regularColleges = filteredColleges
    .filter((college) => !savedCollegeIds.has(String(college.id)))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))

  const combinedColleges = [...filteredSavedColleges, ...regularColleges]

  let paginatedColleges
  if (debouncedSearchTerm.trim()) {
    paginatedColleges = combinedColleges.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  } else if (currentPage === 1) {
    const remainingSlots = Math.max(0, pageSize - filteredSavedColleges.length)
    paginatedColleges = [...filteredSavedColleges, ...regularColleges.slice(0, remainingSlots)]
  } else {
    paginatedColleges = regularColleges
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
        ...pageMeta,
      }

  return (
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
            <h1 className="text-4xl font-bold">Explore Colleges</h1>
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
                      isSaved={savedCollegeIds.has(String(college.id))}
                      onToggleSaved={handleToggleSaved}
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
                  isSaved={savedCollegeIds.has(String(college.id))}
                  onToggleSaved={handleToggleSaved}
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
            <Pagination
              currentPage={currentPage}
              totalPages={displayMeta.totalPages || 1}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          )}
    </div>
  )
}
