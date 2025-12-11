import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/dashboard/sidebar"
import Pagination from "@/components/common/pagination"
import api from "@/services/api"
import { saveCareer, unsaveCareer, checkCareerSaved, getSavedCareers } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"
import {
  Briefcase,
  ArrowRight,
  Loader,
  Search,
  Star,
  DollarSign,
  TrendingUp,
  Target,
  Code,
  Stethoscope,
  Palette,
  Wrench,
  Beaker,
  Users,
  BookOpen,
  BarChart3,
} from "lucide-react"

const categoryIconMap = {
  Technology: Code,
  "Data Science": BarChart3,
  Healthcare: Stethoscope,
  Design: Palette,
  Engineering: Wrench,
  Science: Beaker,
  Business: Briefcase,
  Education: Users,
  Media: BookOpen,
  "History & Research": BookOpen,
  "Social Science": Users,
  "Space & Aeronautics": Beaker,
  default: Target,
}

const categoryColorMap = {
  Technology: "bg-blue-500",
  "Data Science": "bg-green-500",
  Healthcare: "bg-red-500",
  Design: "bg-purple-500",
  Engineering: "bg-orange-500",
  Science: "bg-teal-500",
  Business: "bg-indigo-500",
  Education: "bg-yellow-500",
  Media: "bg-pink-500",
  "History & Research": "bg-amber-500",
  "Social Science": "bg-cyan-500",
  "Space & Aeronautics": "bg-violet-500",
  default: "bg-gray-500",
}

const getJobOutlookColor = (outlook) => {
  if (!outlook) return "text-gray-600 bg-gray-100"
  const lower = outlook.toLowerCase()
  if (lower.includes("very high") || lower.includes("high")) return "text-green-600 bg-green-100"
  if (lower.includes("medium")) return "text-yellow-600 bg-yellow-100"
  if (lower.includes("low")) return "text-red-600 bg-red-100"
  return "text-gray-600 bg-gray-100"
}

const CareerCard = ({ career, index, savedCareerIds, onSaveChange }) => {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const category = career.category || "default"
  const Icon = categoryIconMap[category] || categoryIconMap.default
  const color = categoryColorMap[category] || categoryColorMap.default

  // Check if career is saved based on the savedCareerIds set
  // Try multiple ID formats to match (UUID, name, etc.)
  const careerIdString = String(career.id || career.careerId || "")
  const careerNameString = String(career.careerName || career.name || career.title || "")
  const isSaved = savedCareerIds.has(careerIdString) || (careerNameString && savedCareerIds.has(careerNameString))

  const handleStarClick = async (e) => {
    e.stopPropagation()
    const careerId = career.id || career.careerId
    const careerName = career.careerName || career.name || career.title
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
          null,
          null,
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
                  {career.careerName || career.name || career.title}
                </CardTitle>
                {career.category && (
                  <Badge variant="outline" className="mt-1">
                    {career.category}
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={handleStarClick}
              disabled={isSaving}
              className="transition-colors disabled:opacity-50"
              title={isSaved ? "Remove from saved" : "Save career"}
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

          {career.jobOutlook && (
            <div className="flex items-center space-x-2">
              <Badge className={`${getJobOutlookColor(career.jobOutlook)} border-0`}>
                {career.jobOutlook} Outlook
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">
            {career.description}
          </CardDescription>

          <div className="space-y-4">
            {(career.averageSalaryUSD || career.salaryRange) && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Salary Range</span>
                </div>
                <span className="text-sm font-semibold">
                  {career.averageSalaryUSD || career.salaryRange}
                </span>
              </div>
            )}

            {career.requiredEducation && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Education</span>
                </div>
                <span className="text-sm font-semibold text-right max-w-[60%]">
                  {career.requiredEducation}
                </span>
              </div>
            )}
          </div>

          {(career.skills || career.requiredSkills) && (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {(career.skills || career.requiredSkills || []).slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {((career.skills || career.requiredSkills || []).length > 5) && (
                    <Badge variant="outline" className="text-xs">
                      +{(career.skills || career.requiredSkills || []).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

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

export default function CareersPage() {
  const { user } = useAuth()
  const [allCareers, setAllCareers] = useState([])
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12
  const [savedCareerIds, setSavedCareerIds] = useState(new Set())
  const [savedCareersFullData, setSavedCareersFullData] = useState([])

  // Function to fetch saved career IDs and full data
  const fetchSavedCareers = async () => {
    if (!user?.id) {
      setSavedCareerIds(new Set())
      setSavedCareersFullData([])
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
      
      // Fetch full career data for all saved careers
      if (savedCareers.length > 0) {
        try {
          // Fetch all careers to get full data for saved ones
          const response = await api.get("/api/careers")
          const allCareersData = response.data || []
          const savedCareersData = allCareersData.filter(career => {
            const careerId = String(career.id || "")
            const careerName = String(career.careerName || career.name || career.title || "")
            return ids.has(careerId) || (careerName && ids.has(careerName))
          })
          
          // Also add saved careers that might not be in the API response (e.g., created by name)
          savedCareers.forEach(sc => {
            const existing = savedCareersData.find(c => 
              String(c.id) === String(sc.careerId) || 
              (c.careerName || c.name || c.title) === (sc.careerName || sc.careerTitle)
            )
            if (!existing && (sc.careerName || sc.careerTitle)) {
              // Create a minimal career object from saved career data
              savedCareersData.push({
                id: sc.careerId,
                careerId: sc.careerId,
                careerName: sc.careerName || sc.careerTitle,
                name: sc.careerName || sc.careerTitle,
                title: sc.careerName || sc.careerTitle,
                description: "Career saved by user",
                category: "default"
              })
            }
          })
          setSavedCareersFullData(savedCareersData)
        } catch (err) {
          console.error("Failed to fetch saved careers full data:", err)
          setSavedCareersFullData([])
        }
      } else {
        setSavedCareersFullData([])
      }
    } catch (error) {
      console.error("Failed to fetch saved careers:", error)
      setSavedCareerIds(new Set())
      setSavedCareersFullData([])
    }
  }

  // Fetch saved career IDs when user is available
  useEffect(() => {
    fetchSavedCareers()
  }, [user?.id])

  // Callback to update saved career IDs when a career is saved/unsaved
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

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/careers")
        const careersData = response.data || []
        setAllCareers(careersData)
        setCareers(careersData)
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch careers")
        console.error("Failed to fetch careers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCareers()
  }, [])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Filter careers based on search term
  const filteredCareers = allCareers.filter((career) => {
    if (searchTerm.trim()) {
      const name = (career.careerName || career.name || career.title || "").toLowerCase()
      const description = (career.description || "").toLowerCase()
      const category = (career.category || "").toLowerCase()
      const search = searchTerm.toLowerCase()
      return name.includes(search) || description.includes(search) || category.includes(search)
    }
    return true
  })

  // Filter saved careers
  const filteredSavedCareers = savedCareersFullData.filter((career) => {
    if (searchTerm.trim()) {
      const name = (career.careerName || career.name || career.title || "").toLowerCase()
      const description = (career.description || "").toLowerCase()
      const category = (career.category || "").toLowerCase()
      const search = searchTerm.toLowerCase()
      return name.includes(search) || description.includes(search) || category.includes(search)
    }
    return true
  }).sort((a, b) => {
    const nameA = (a.careerName || a.name || a.title || "").toLowerCase()
    const nameB = (b.careerName || b.name || b.title || "").toLowerCase()
    return nameA.localeCompare(nameB)
  })

  // Remove saved careers from regular careers to avoid duplicates
  const regularCareers = filteredCareers.filter(career => {
    const careerId = String(career.id || "")
    const careerName = String(career.careerName || career.name || career.title || "")
    return !savedCareerIds.has(careerId) && !(careerName && savedCareerIds.has(careerName))
  }).sort((a, b) => {
    const nameA = (a.careerName || a.name || a.title || "").toLowerCase()
    const nameB = (b.careerName || b.name || b.title || "").toLowerCase()
    return nameA.localeCompare(nameB)
  })

  // Combine: saved careers first, then regular careers
  const combinedCareers = [...filteredSavedCareers, ...regularCareers]

  // Calculate start and end indices for display
  let startIndex, endIndex
  
  // Paginate combined results
  let paginatedCareers
  if (searchTerm.trim()) {
    // When searching, paginate the combined list normally
    startIndex = (currentPage - 1) * pageSize
    endIndex = startIndex + pageSize
    paginatedCareers = combinedCareers.slice(startIndex, endIndex)
  } else {
    // When not searching, show saved careers on page 1, then regular careers
    if (currentPage === 1) {
      // Page 1: Show saved careers first, then fill with regular careers
      const remainingSlots = Math.max(0, pageSize - filteredSavedCareers.length)
      const regularCareersFromPage = regularCareers.slice(0, remainingSlots)
      paginatedCareers = [...filteredSavedCareers, ...regularCareersFromPage]
      startIndex = 0
      endIndex = paginatedCareers.length
    } else {
      // Other pages: Show regular careers from API (excluding saved ones since they're on page 1)
      const savedCareersCount = filteredSavedCareers.length
      const slotsUsedBySavedOnPage1 = Math.min(savedCareersCount, pageSize)
      const regularCareersStartOnPage1 = Math.max(0, pageSize - savedCareersCount)
      
      // For page 2+, calculate which regular careers to show
      startIndex = regularCareersStartOnPage1 + (currentPage - 2) * pageSize
      endIndex = startIndex + pageSize
      paginatedCareers = regularCareers.slice(startIndex, endIndex)
    }
  }

  // Calculate pagination
  const totalPages = searchTerm.trim()
    ? Math.ceil(combinedCareers.length / pageSize)
    : (() => {
        const savedCount = filteredSavedCareers.length
        const regularCount = regularCareers.length
        const slotsUsedBySavedOnPage1 = Math.min(savedCount, pageSize)
        const regularCareersStartOnPage1 = Math.max(0, pageSize - savedCount)
        const regularCareersAfterPage1 = regularCount - regularCareersStartOnPage1
        const additionalPagesForRegular = Math.ceil(regularCareersAfterPage1 / pageSize)
        return 1 + additionalPagesForRegular
      })()

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
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
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Explore Careers</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Discover diverse career paths and find the one that matches your interests and skills.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search careers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Stats Overview */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Total Careers", value: allCareers.length, icon: Briefcase, color: "text-primary" },
                {
                  label: searchTerm ? "Search Results" : "Available",
                  value: careers.length,
                  icon: Target,
                  color: "text-blue-600",
                },
                {
                  label: "Categories",
                  value: new Set(allCareers.map((c) => c.category).filter(Boolean)).size,
                  icon: BarChart3,
                  color: "text-purple-600",
                },
                { label: "Saved", value: "0", icon: Star, color: "text-accent" },
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
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading careers: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Careers Count Info */}
          {!loading && !error && combinedCareers.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, combinedCareers.length)} of {combinedCareers.length} career
                {combinedCareers.length !== 1 ? "s" : ""}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            </div>
          )}

          {/* Careers Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCareers.map((career, index) => (
                  <CareerCard 
                    key={career.id || career.careerName || index} 
                    career={career} 
                    index={index}
                    savedCareerIds={savedCareerIds}
                    onSaveChange={handleSaveChange}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && careers.length === 0 && (
            <Card className="border border-dashed bg-muted/30">
              <CardContent className="pt-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? `No careers found matching "${searchTerm}".` : "No careers available at the moment."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  )
}
