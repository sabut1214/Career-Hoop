import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getColleges, saveCollege, unsaveCollege, checkCollegeSaved, getSavedColleges } from "@/lib/api"
import Pagination from "@/components/common/pagination"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

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

const CollegeCard = ({ college, index, savedCollegeIds, onSaveChange }) => {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  
  // Check if college is saved based on the savedCollegeIds set
  // Convert to string for consistent comparison
  const collegeIdString = String(college.id)
  const isSaved = savedCollegeIds.has(collegeIdString)

  const handleStarClick = async (e) => {
    e.stopPropagation()
    if (!user?.id || !college.id || isSaving) return

    setIsSaving(true)
    try {
      if (isSaved) {
        await unsaveCollege(user.id, college.id)
        // Update the saved colleges list
        if (onSaveChange) {
          onSaveChange(college.id, false)
        }
        toast.success("College removed from saved")
      } else {
        await saveCollege(user.id, college.id)
        // Update the saved colleges list
        if (onSaveChange) {
          onSaveChange(college.id, true)
        }
        toast.success("College saved successfully")
      }
    } catch (error) {
      toast.error(error.message || "Failed to update saved college")
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
                  disabled={isSaving}
                  className="transition-colors disabled:opacity-50"
                  title={isSaved ? "Remove from saved" : "Save college"}
                >
                  <Star
                    className={`h-5 w-5 transition-colors cursor-pointer ${
                      isSaved
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground group-hover:text-accent"
                    }`}
                  />
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

        <div className="flex space-x-2 mt-auto">
          <Button className="flex-1" onClick={() => college.detailUrl && window.open(college.detailUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {college.detailUrl ? "View Details" : "Visit Website"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent"
            onClick={handleStarClick}
            disabled={isSaving}
          >
            {isSaved ? "Saved" : "Save College"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}

export default function CollegesPage() {
  const [allColleges, setAllColleges] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 })
  const [savedCollegeIds, setSavedCollegeIds] = useState(new Set())
  const [savedCollegesFullData, setSavedCollegesFullData] = useState([]) // Store full saved college objects
  const { user } = useAuth()

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
          // Fetch all colleges to get full data for saved ones
          const response = await getColleges({ size: 10000 })
          const allColleges = (response.data || []).map(transformCollege)
          const savedCollegesData = allColleges.filter(college => 
            ids.has(String(college.id))
          )
          setSavedCollegesFullData(savedCollegesData)
        } catch (err) {
          console.error("Failed to fetch saved colleges full data:", err)
          setSavedCollegesFullData([])
        }
      } else {
        setSavedCollegesFullData([])
      }
    } catch (error) {
      console.error("Failed to fetch saved colleges:", error)
      setSavedCollegeIds(new Set())
      setSavedCollegesFullData([])
    }
  }

  // Fetch saved college IDs when user is available
  useEffect(() => {
    fetchSavedColleges()
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
  }, [searchTerm, filterType])

  // Fetch all colleges when search is active, otherwise use pagination
  useEffect(() => {
    const fetchAllColleges = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all colleges (use a large size to get all)
        const response = await getColleges({ size: 10000 })
        const transformed = (response.data || []).map(transformCollege)
        const normalized = dedupeColleges(transformed)
        const completeColleges = normalized.filter(hasCompleteData)
        // Sort by name A-Z
        completeColleges.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        setAllColleges(completeColleges)
      } catch (err) {
        console.error("Failed to fetch all colleges:", err)
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
        // Fetch a larger batch to account for filtering out incomplete data
        const fetchSize = pageSize * 3 // Fetch 3x to ensure we get enough complete colleges
        const response = await getColleges({ page: pageNumber - 1, size: fetchSize })
        const transformed = (response.data || []).map(transformCollege)
        const normalized = dedupeColleges(transformed)
        // Filter to only show colleges with complete data
        const completeColleges = normalized.filter(hasCompleteData).slice(0, pageSize)
        setColleges(completeColleges)
        
        // Update pagination metadata
        const originalTotal = response.meta?.totalElements || normalized.length
        setPageMeta(
          response.meta ? {
            ...response.meta,
            totalElements: originalTotal,
            totalPages: Math.ceil(originalTotal / pageSize),
          } : {
            totalPages: 1,
            totalElements: completeColleges.length,
            page: pageNumber - 1,
            size: pageSize,
          }
        )
      } catch (err) {
        console.error("Failed to fetch colleges:", err)
        setColleges([])
        setPageMeta({ totalPages: 1, totalElements: 0 })
        setError("Unable to load colleges right now. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (searchTerm.trim()) {
      // When searching, fetch all colleges
      fetchAllColleges()
    } else {
      // When not searching, use pagination
      fetchCollegesPaginated(currentPage)
    }
  }, [searchTerm, currentPage])

  const handlePageChange = (page) => {
    if (page < 1) return
    if (pageMeta.totalPages && page > pageMeta.totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Filter colleges - use allColleges when searching, colleges when paginating
  const filteredColleges = (searchTerm.trim() ? allColleges : colleges)
    .filter((college) => {
      const matchesSearch = searchTerm.trim()
        ? (college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (college.programs && college.programs.some((program) => program.toLowerCase().includes(searchTerm.toLowerCase()))))
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
  if (searchTerm.trim()) {
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
  const displayMeta = searchTerm.trim()
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
            className="flex flex-col md:flex-row gap-4"
          >
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

          {error && (
            <Card>
              <CardContent className="text-center text-destructive py-4">{error}</CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

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
          {!loading && paginatedColleges.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No colleges found matching your criteria.</p>
              </CardContent>
            </Card>
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
