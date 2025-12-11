import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Star,
  Search,
  Filter,
  GraduationCap,
  ExternalLink,
  Trash2,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getSavedColleges, unsaveCollege } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"

const parsePrograms = (programs) => {
  if (!programs) return []
  
  if (Array.isArray(programs)) {
    return programs.map((program) => {
      if (typeof program === "string") return program
      if (typeof program === "object" && program !== null) {
        return program.name || program.title || program.program || ""
      }
      return ""
    }).filter(Boolean)
  }

  if (typeof programs === "string") {
    const trimmed = programs.trim()
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(programs)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === "string") return item
            if (typeof item === "object" && item !== null) {
              return item.name || item.title || item.program || ""
            }
            return ""
          }).filter(Boolean)
        }
      } catch (error) {
        return programs.split(",").map((item) => item.trim()).filter(Boolean)
      }
    } else {
      return programs.split(",").map((item) => item.trim()).filter(Boolean)
    }
  }

  return []
}

const transformCollege = (savedCollege) => {
  const college = savedCollege.college || savedCollege
  const programs = parsePrograms(college.programs)
  
  return {
    ...college,
    savedId: savedCollege.id,
    savedAt: savedCollege.savedAt,
    programs,
    description: college.overview || college.description || "",
  }
}

const CollegeCard = ({ college, onUnsave, isSelected, onSelect }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="h-full min-h-[460px] flex flex-col border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardHeader className="space-y-4 pb-0">
          <div className="flex items-start space-x-4">
            <div className="flex items-center space-x-2 mt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
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
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-6 pt-6">
          <CardDescription className="text-base leading-relaxed line-clamp-4">
            {college.description || "No description available"}
          </CardDescription>

          {college.programs && Array.isArray(college.programs) && college.programs.length > 0 && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Programs</h4>
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
            <Button 
              className="flex-1" 
              onClick={() => college.detailUrl && window.open(college.detailUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent"
              onClick={() => onUnsave(college)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function SavedCollegesPage() {
  const [savedColleges, setSavedColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("savedAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedColleges, setSelectedColleges] = useState(new Set())
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.id) {
      navigate("/login")
      return
    }

    const fetchSavedColleges = async () => {
      setLoading(true)
      setError(null)
      try {
        const saved = await getSavedColleges(user.id)
        const transformed = saved.map(transformCollege)
        setSavedColleges(transformed)
      } catch (err) {
        console.error("Failed to fetch saved colleges:", err)
        setError("Unable to load saved colleges. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSavedColleges()
  }, [user?.id, navigate])

  const handleUnsave = async (college) => {
    if (!user?.id) return

    try {
      await unsaveCollege(user.id, college.id)
      setSavedColleges(prev => prev.filter(c => c.id !== college.id))
      setSelectedColleges(prev => {
        const newSet = new Set(prev)
        newSet.delete(college.id)
        return newSet
      })
      toast.success("College removed from saved")
    } catch (error) {
      toast.error(error.message || "Failed to remove college")
    }
  }

  const handleBulkUnsave = async () => {
    if (!user?.id || selectedColleges.size === 0) return

    try {
      const promises = Array.from(selectedColleges).map(collegeId => {
        const college = savedColleges.find(c => c.id === collegeId)
        return college ? unsaveCollege(user.id, college.id) : Promise.resolve()
      })
      
      await Promise.all(promises)
      setSavedColleges(prev => prev.filter(c => !selectedColleges.has(c.id)))
      setSelectedColleges(new Set())
      toast.success(`${selectedColleges.size} college(s) removed`)
    } catch (error) {
      toast.error("Failed to remove some colleges")
    }
  }

  const handleSelectAll = () => {
    if (selectedColleges.size === filteredColleges.length) {
      setSelectedColleges(new Set())
    } else {
      setSelectedColleges(new Set(filteredColleges.map(c => c.id)))
    }
  }

  const handleSelectCollege = (collegeId) => {
    setSelectedColleges(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collegeId)) {
        newSet.delete(collegeId)
      } else {
        newSet.add(collegeId)
      }
      return newSet
    })
  }

  const filteredColleges = useMemo(() => {
    let filtered = savedColleges.filter((college) => {
      const matchesSearch = searchTerm.trim()
        ? (college.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           college.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (college.programs && college.programs.some((program) => 
             program.toLowerCase().includes(searchTerm.toLowerCase())
           )))
        : true
      return matchesSearch
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "")
          break
        case "location":
          comparison = (a.location || "").localeCompare(b.location || "")
          break
        case "savedAt":
          comparison = new Date(a.savedAt || 0) - new Date(b.savedAt || 0)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [savedColleges, searchTerm, sortBy, sortOrder])

  if (!user) {
    return null
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
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              <h1 className="text-4xl font-bold">Saved Colleges</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Manage your saved colleges and compare your options
            </p>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savedAt">Date Saved</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>

          {/* Bulk Actions */}
          {selectedColleges.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-primary/10 rounded-lg"
            >
              <span className="text-sm font-medium">
                {selectedColleges.size} college(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSelectAll}>
                  {selectedColleges.size === filteredColleges.length ? "Deselect All" : "Select All"}
                </Button>
                <Button variant="destructive" onClick={handleBulkUnsave}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Selected
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <p className="text-muted-foreground">
              {filteredColleges.length} saved college{filteredColleges.length !== 1 ? "s" : ""}
            </p>
            {filteredColleges.length > 0 && (
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedColleges.size === filteredColleges.length ? "Deselect All" : "Select All"}
              </Button>
            )}
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

          {/* Colleges Grid/List */}
          {!loading && filteredColleges.length > 0 && (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6" 
              : "space-y-4"
            }>
              {filteredColleges.map((college, index) => (
                <CollegeCard 
                  key={college.id || college.savedId || index} 
                  college={college} 
                  index={index}
                  onUnsave={handleUnsave}
                  isSelected={selectedColleges.has(college.id)}
                  onSelect={() => handleSelectCollege(college.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredColleges.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {savedColleges.length === 0 ? "No saved colleges yet" : "No colleges match your search"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {savedColleges.length === 0 
                    ? "Start exploring colleges and save your favorites to compare them later."
                    : "Try adjusting your search or filters to find what you're looking for."
                  }
                </p>
                {savedColleges.length === 0 && (
                  <Button onClick={() => navigate("/colleges")}>
                    Explore Colleges
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

