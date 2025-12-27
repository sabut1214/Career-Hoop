import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Building2, X, Plus, Trash2, Share2, Download } from "lucide-react"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"
import { useNavigate, useSearchParams } from "react-router-dom"
import ComparisonTable from "../components/ComparisonTable"
import { collegeComparisonService } from "../services/collegeComparisonService"
import { collegeService } from "../services/collegeService"

export default function CollegeComparisonPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comparisonId, setComparisonId] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!user?.id) {
      navigate("/login")
      return
    }

    const loadComparison = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check if we have college IDs in URL params
        const collegeIdsParam = searchParams.get("collegeIds")
        if (collegeIdsParam) {
          const collegeIds = collegeIdsParam.split(",").filter(Boolean)
          if (collegeIds.length > 0) {
            // Fetch colleges by IDs using batch endpoint
            try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/colleges/batch`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify(collegeIds),
              })
              
              if (response.ok) {
                const selectedColleges = await response.json()
                if (selectedColleges.length > 0) {
                  setColleges(selectedColleges)
                  // Optionally create a comparison session
                  try {
                    const comparison = await collegeComparisonService.createComparison(collegeIds)
                    setComparisonId(comparison.id)
                  } catch (err) {
                    console.warn("Failed to create comparison session:", err)
                  }
                } else {
                  setError("No colleges found with the provided IDs")
                }
              } else {
                setError("Failed to fetch colleges")
              }
            } catch (err) {
              console.error("Error fetching colleges:", err)
              setError("Failed to load colleges")
            }
          }
        } else {
          // Check if we have a comparison ID
          const compId = searchParams.get("comparisonId")
          if (compId) {
            const comparison = await collegeComparisonService.getComparison(compId)
            setColleges(comparison.colleges || [])
            setComparisonId(comparison.id)
          } else {
            setError("No colleges to compare. Please select colleges from the colleges page.")
          }
        }
      } catch (err) {
        console.error("Failed to load comparison:", err)
        setError(err.message || "Failed to load comparison")
      } finally {
        setLoading(false)
      }
    }

    loadComparison()
  }, [user?.id, navigate, searchParams])

  const handleRemoveCollege = (collegeId) => {
    setColleges(prev => prev.filter(c => c.id !== collegeId))
  }

  const handleAddColleges = () => {
    navigate("/colleges")
  }

  const handleShare = () => {
    if (comparisonId) {
      const url = `${window.location.origin}/college-comparison?comparisonId=${comparisonId}`
      navigator.clipboard.writeText(url)
      toast.success("Comparison link copied to clipboard!")
    } else {
      const collegeIds = colleges.map(c => c.id).join(",")
      const url = `${window.location.origin}/college-comparison?collegeIds=${collegeIds}`
      navigator.clipboard.writeText(url)
      toast.success("Comparison link copied to clipboard!")
    }
  }

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Name", "Location", "Affiliation", "Established Year", "Type", "Tuition", "Programs"]
    const rows = colleges.map(college => [
      college.name || "",
      college.location || "",
      college.affiliation || "",
      college.establishedYear || "",
      college.type || "",
      college.tuition || "",
      (college.programs ? (Array.isArray(college.programs) ? college.programs.map(p => typeof p === "string" ? p : p.name || "").join("; ") : college.programs) : "")
    ])
    
    const csv = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `college-comparison-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Comparison exported successfully!")
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">College Comparison</h1>
              </div>
              <div className="flex gap-2">
                {colleges.length > 0 && (
                  <>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </>
                )}
                <Button onClick={handleAddColleges}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Colleges
                </Button>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">
              Compare up to 5 colleges side-by-side
            </p>
          </motion.div>

          {/* Selected Colleges */}
          {colleges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              {colleges.map((college) => (
                <Badge key={college.id} variant="secondary" className="text-sm p-2">
                  {college.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => handleRemoveCollege(college.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </motion.div>
          )}

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

          {/* Comparison Table */}
          {!loading && colleges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ComparisonTable colleges={colleges} />
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && colleges.length === 0 && !error && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No colleges selected</h3>
                <p className="text-muted-foreground mb-4">
                  Add colleges to compare them side-by-side. You can compare up to 5 colleges at once.
                </p>
                <Button onClick={handleAddColleges}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Colleges to Compare
                </Button>
              </CardContent>
            </Card>
          )}
    </div>
  )
}

