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
import { getColleges } from "@/lib/api"
import Pagination from "@/components/common/pagination"

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

const CollegeCard = ({ college, index }) => (
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
              <Star className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors cursor-pointer" />
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{college.rating || "4.5"}</span>
              </div>
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
              <span className="text-xs font-medium">{college.acceptanceRate || "N/A"}</span>
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
          <Button variant="outline" className="flex-1 bg-transparent">
            Save College
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export default function CollegesPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 })

  useEffect(() => {
    const fetchColleges = async (pageNumber) => {
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
        // Since we're filtering client-side, we approximate the total
        const originalTotal = response.meta?.totalElements || normalized.length
        setPageMeta(
          response.meta ? {
            ...response.meta,
            totalElements: originalTotal, // Keep original total for pagination
            // Adjust totalPages calculation to account for filtering
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

    fetchColleges(currentPage)
  }, [currentPage])

  const handlePageChange = (page) => {
    if (page < 1) return
    if (pageMeta.totalPages && page > pageMeta.totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filteredColleges = colleges
    .filter((college) => {
      const matchesSearch =
        college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (college.programs && college.programs.some((program) => program.toLowerCase().includes(searchTerm.toLowerCase())))

      const matchesType = filterType === "all" || (college.type && college.type.toLowerCase() === filterType)

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "tuition":
          const aTuition = parseInt(a.tuition?.replace(/[^0-9]/g, "") || "0")
          const bTuition = parseInt(b.tuition?.replace(/[^0-9]/g, "") || "0")
          return aTuition - bTuition
        case "acceptance":
          const aAcceptance = parseInt(a.acceptanceRate?.replace(/[^0-9]/g, "") || "100")
          const bAcceptance = parseInt(b.acceptanceRate?.replace(/[^0-9]/g, "") || "100")
          return aAcceptance - bAcceptance
        default:
          return 0
      }
    })

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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="tuition">Tuition (Low to High)</SelectItem>
                <SelectItem value="acceptance">Acceptance Rate</SelectItem>
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
              Showing {filteredColleges.length} of {pageMeta.totalElements || colleges.length} colleges
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
              {filteredColleges.map((college, index) => (
                <CollegeCard key={college.id} college={college} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredColleges.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No colleges found matching your criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Load More */}
          {!loading && (pageMeta.totalPages || 1) > 1 && (
            <Pagination currentPage={currentPage} totalPages={pageMeta.totalPages || 1} onPageChange={handlePageChange} />
          )}
        </div>
      </main>
    </div>
  )
}
