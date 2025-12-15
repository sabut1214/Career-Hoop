import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { getColleges, analyzeGradeSheet, updateUserProfile, getUserProfile, getCollegeRecommendations } from "@/shared/lib/api"
import {
  UploadCloud,
  Loader2,
  FileText,
  Sparkles,
  GraduationCap,
  MapPin,
  Star,
  RefreshCw,
  User,
  School,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react"
import Pagination from "@/shared/components/common/pagination"
import { useAuth } from "@/shared/context/AuthContext"
import { getUserStorageKey } from "@/shared/utils/utils"
import { toast } from "react-toastify"

const parsePrograms = (programs) => {
  if (!programs) return []
  if (Array.isArray(programs)) {
    return programs
      .map((program) => {
        if (typeof program === "string") return program
        if (typeof program === "object" && program !== null) return program.name || program.title || ""
        return ""
      })
      .filter(Boolean)
  }

  if (typeof programs === "string") {
    const trimmed = programs.trim()
    if (!trimmed.length) return []
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              if (typeof item === "string") return item
              if (typeof item === "object" && item !== null) return item.name || item.title || item.program || ""
              return ""
            })
            .filter(Boolean)
        }
      } catch (error) {
        // fall back to comma separated parsing below
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const transformCollege = (college) => ({
  id: college.id,
  name: college.name,
  location: college.location || "Location not specified",
  overview: college.overview || "",
  programs: parsePrograms(college.programs),
  type: college.type || "Unknown",
  detailUrl: college.detailUrl,
})

const GRADE_TO_SCORE = {
  "A+": 98,
  A: 94,
  "A-": 90,
  "B+": 87,
  B: 83,
  "B-": 80,
  "C+": 75,
  C: 70,
  "C-": 66,
  D: 60,
  E: 55,
  F: 45,
  O: 96,
}

const STREAM_KEYWORDS = {
  science: ["engineering", "technology", "medical", "science", "computer", "ai", "physics", "chemistry"],
  commerce: ["business", "management", "finance", "commerce", "economics", "accounting", "marketing"],
  arts: ["arts", "humanities", "design", "media", "communication", "literature", "creative"],
  general: [],
}

const STREAM_DESCRIPTIONS = {
  science: "STEM focus",
  commerce: "business programs",
  arts: "creative and liberal arts programs",
  general: "multi-disciplinary programs",
}

const normalizeSubjectPerformance = (subject) => {
  if (!subject || !subject.name) return null
  const marks = typeof subject.marks === "number" && !Number.isNaN(subject.marks) ? Math.min(Math.max(subject.marks, 0), 100) : null
  const grade = subject.grade?.trim()
  const gradeScore = grade ? GRADE_TO_SCORE[grade.toUpperCase()] ?? null : null
  const score = marks ?? gradeScore ?? 0
  const displayScore = marks != null ? `${marks}%` : (grade ?? "-")
  return { name: subject.name, marks, grade: grade || null, score, displayScore }
}

const detectStreamFromSubjects = (subjects) => {
  const lowerSubjects = subjects.map((subject) => subject.name.toLowerCase())
  const scienceHits = lowerSubjects.filter((name) =>
    ["physics", "chemistry", "biology", "mathematics", "math", "computer", "engineering"].some((keyword) => name.includes(keyword)),
  ).length
  const commerceHits = lowerSubjects.filter((name) =>
    ["commerce", "business", "account", "economics", "finance", "marketing"].some((keyword) => name.includes(keyword)),
  ).length
  const artsHits = lowerSubjects.filter((name) =>
    ["arts", "history", "political", "sociology", "psychology", "design", "language"].some((keyword) => name.includes(keyword)),
  ).length

  if (scienceHits >= Math.max(commerceHits, artsHits, 1)) return "science"
  if (commerceHits >= Math.max(scienceHits, artsHits, 1)) return "commerce"
  if (artsHits >= Math.max(scienceHits, commerceHits, 1)) return "arts"
  return "general"
}

const deriveAcademicProfile = (analysis) => {
  if (!analysis || !Array.isArray(analysis.subjects)) return null
  const normalizedSubjects = analysis.subjects
    .map(normalizeSubjectPerformance)
    .filter((subject) => subject && subject.score > 0)

  if (!normalizedSubjects.length) return null

  const sortedSubjects = [...normalizedSubjects].sort((a, b) => b.score - a.score)
  const averageScore = Math.round(sortedSubjects.reduce((sum, subject) => sum + subject.score, 0) / sortedSubjects.length)
  const stream = detectStreamFromSubjects(sortedSubjects)

  return {
    averageScore,
    stream,
    subjects: normalizedSubjects,
    topSubjects: sortedSubjects.slice(0, 3),
  }
}

const scoreCollegeForProfile = (college, profile) => {
  if (!profile) return 60
  let score = profile.averageScore ?? 65
  const text = `${college.name ?? ""} ${college.overview ?? ""} ${(college.programs ?? []).join(" ")}`.toLowerCase()
  const streamKeywords = STREAM_KEYWORDS[profile.stream] ?? []
  if (streamKeywords.some((keyword) => text.includes(keyword))) {
    score += 12
  }
  profile.topSubjects.forEach((subject) => {
    if (subject?.name && text.includes(subject.name.toLowerCase())) {
      score += 4
    }
  })
  return Math.min(Math.max(score, 50), 99)
}

const buildMatchHighlight = (college, profile) => {
  if (!profile || !profile.topSubjects?.length) return "Aligned with your overall academic profile."
  const subjectHighlights = profile.topSubjects
    .slice(0, 2)
    .map((subject) => `${subject.name}${subject.displayScore ? ` (${subject.displayScore})` : ""}`)
    .join(" & ")
  const streamDescription = STREAM_DESCRIPTIONS[profile.stream] ?? "top programs"
  return `Strength in ${subjectHighlights} pairs well with ${college.name}'s ${streamDescription}.`
}

export default function GradesPage() {
  const { user } = useAuth()
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [academicProfile, setAcademicProfile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const collegesPerPage = 4

  const getGradeColor = (grade) => {
    if (!grade) return "bg-gray-500"
    const normalized = grade.toUpperCase()
    if (["A+", "A", "O"].includes(normalized)) return "bg-green-500"
    if (["B+", "B"].includes(normalized)) return "bg-blue-500"
    if (["C+", "C"].includes(normalized)) return "bg-yellow-500"
    if (["D", "E", "F"].includes(normalized)) return "bg-red-500"
    return "bg-gray-500"
  }

  const getMarksTone = (marks) => {
    if (marks == null) return "text-foreground"
    if (marks >= 90) return "text-green-600 dark:text-green-400"
    if (marks >= 75) return "text-blue-600 dark:text-blue-400"
    if (marks >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getIndicatorWidth = (marks) => {
    if (marks == null || Number.isNaN(Number(marks))) return 40
    return Math.min(Math.max(Number(marks), 10), 100)
  }

  const getIndicatorTone = (marks) => {
    if (marks == null) return "bg-muted-foreground/50"
    if (marks >= 90) return "bg-green-500"
    if (marks >= 75) return "bg-blue-500"
    if (marks >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const saveGradesToProfile = async (analysisResult, profile) => {
    if (!user?.id || !analysisResult || !profile) return

    try {
      // Extract subject names from analysis
      const subjectNames = analysisResult.subjects?.map((subject) => subject.name).filter(Boolean) || []
      
      // Calculate average GPA from marks (convert percentage to GPA scale 0-4)
      const averageMarks = profile.averageScore
      const gpa = averageMarks ? (averageMarks / 100) * 4 : null

      // Update user profile with academic information
      await updateUserProfile(user.id, {
        schoolName: analysisResult.schoolName || null,
        stream: profile.stream || null,
        subjects: subjectNames.length > 0 ? subjectNames : null,
        gpa: gpa,
      })
    } catch (err) {
      console.error("Failed to save grades to profile:", err)
      // Don't show error toast for auto-save, just log it
    }
  }

  const reconstructAnalysisFromProfile = (userProfile) => {
    if (!userProfile || !userProfile.subjects || userProfile.subjects.length === 0) {
      return null
    }

    // Reconstruct analysis object from user profile
    const subjects = userProfile.subjects.map((subjectName) => {
      // Try to get marks from GPA if available
      const marks = userProfile.gpa ? Math.round((userProfile.gpa / 4) * 100) : null
      return {
        name: subjectName,
        marks: marks,
        grade: null, // We don't store grades in profile, only subjects
      }
    })

    return {
      studentName: userProfile.name || null,
      schoolName: userProfile.schoolName || null,
      examName: null, // Not stored in profile
      subjects: subjects,
    }
  }

  const loadSavedGrades = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile && (userProfile.subjects?.length > 0 || userProfile.schoolName)) {
        const reconstructedAnalysis = reconstructAnalysisFromProfile(userProfile)
        
        if (reconstructedAnalysis) {
          setAnalysis(reconstructedAnalysis)
          const profile = deriveAcademicProfile(reconstructedAnalysis)
          setAcademicProfile(profile)
          
          // Fetch recommendations based on saved profile
          const recs = await fetchRecommendedColleges(reconstructedAnalysis, profile)
          setRecommendations(recs)
          setCurrentPage(1) // Reset to first page when loading saved grades
        }
      }
    } catch (err) {
      console.error("Failed to load saved grades:", err)
      // Silently fail - user can still upload new grades
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadSavedGrades()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleFileUpload = async (file) => {
    if (!file) return
    if (!user?.id) {
      setError("Please log in to analyze your grades.")
      return
    }
    setError(null)
    setUploadedFileName(file.name)
    setIsAnalyzing(true)

    try {
      const result = await analyzeGradeSheet(file)

      setAnalysis(result)
      const profile = deriveAcademicProfile(result)
      setAcademicProfile(profile)
      
      // Save to localStorage for backward compatibility
      const storageKey = getUserStorageKey("aiGradesAnalysis", user.id)
      localStorage.setItem(storageKey, JSON.stringify(result))
      
      // Automatically save to user profile
      await saveGradesToProfile(result, profile)
      
      const recs = await fetchRecommendedColleges(result, profile)
      setRecommendations(recs)
      setCurrentPage(1) // Reset to first page when new analysis is done
      toast.success("Marksheet analyzed and saved successfully!")
    } catch (err) {
      const errorMsg = err.message || "Failed to analyze the marksheet. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
      setAnalysis(null)
      setAcademicProfile(null)
      setRecommendations([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fetchRecommendedColleges = async (analysisData, profileFromState) => {
    try {
      const profile = profileFromState ?? deriveAcademicProfile(analysisData)
      if (!profile) {
        return []
      }

      // Calculate average grade from subjects if available
      let grade12 = profile.averageScore || 70
      if (analysisData?.subjects && Array.isArray(analysisData.subjects) && analysisData.subjects.length > 0) {
        const marks = analysisData.subjects
          .map((s) => (typeof s === "object" && s !== null ? s.marks : null))
          .filter((m) => m != null && !isNaN(m))
        if (marks.length > 0) {
          grade12 = marks.reduce((sum, m) => sum + m, 0) / marks.length
        }
      }

      const stream = (profile.stream || "general").toLowerCase()
      const subjects = analysisData?.subjects
        ? Array.isArray(analysisData.subjects)
          ? analysisData.subjects.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean)
          : []
        : []

      // Call Python recommendation service via backend
      // Fetch more colleges (20) so we can paginate through the best recommendations
      const recommendations = await getCollegeRecommendations(
        {
          grade12: grade12,
          grade10: analysisData?.grade10 || null,
          stream: stream,
          subjects: subjects,
        },
        20  // Fetch top 20 colleges for pagination
      )

      if (recommendations && recommendations.length > 0) {
        // Transform API response to match UI format
        return recommendations.map((college) => {
          return {
            ...college,
            id: college.id || college.name,
            name: college.name,
            location: college.location || "Location not specified",
            overview: college.overview || "",
            programs: parsePrograms(college.programs),
            type: college.type || "Unknown",
            matchScore: college.matchScore || 0,
            highlight: college.highlight || "",
          }
        })
      }

      // Python service returned empty recommendations
      return []
    } catch (err) {
      console.error("Failed to fetch recommended colleges:", err)
      // If Python service is not available, return empty array
      return []
    }
  }


  const resetAnalysis = () => {
    setAnalysis(null)
    setUploadedFileName("")
    setRecommendations([])
    setAcademicProfile(null)
    setError(null)
    setCurrentPage(1) // Reset to first page
    if (user?.id) {
      const storageKey = getUserStorageKey("aiGradesAnalysis", user.id)
      localStorage.removeItem(storageKey)
    }
    // Also remove old generic key for backward compatibility
    localStorage.removeItem("aiGradesAnalysis")
  }

  // Calculate pagination
  const totalPages = Math.ceil(recommendations.length / collegesPerPage)
  const startIndex = (currentPage - 1) * collegesPerPage
  const endIndex = startIndex + collegesPerPage
  const paginatedRecommendations = recommendations.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    // Scroll to recommendations section
    window.scrollTo({ top: 700, behavior: "smooth" })
  }


  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Marksheet Analyzer</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Upload your marksheet and let our AI extract grades, understand your academic strengths, and recommend
              colleges that match your profile.
            </p>
          </motion.div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading saved grades...</p>
              </CardContent>
            </Card>
          ) : !analysis ? (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Upload Marksheet</CardTitle>
                <CardDescription>Supported formats: PNG, JPG up to 10MB</CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  htmlFor="marksheet-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-colors ${
                    isAnalyzing
                      ? "border-muted-foreground/30 bg-muted"
                      : "border-muted-foreground/40 hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <input
                    id="marksheet-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    disabled={isAnalyzing}
                  />

                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <div>
                        <h3 className="font-semibold">Analyzing your marksheet...</h3>
                        <p className="text-sm text-muted-foreground">
                          Extracting grades and preparing personalized insights
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <UploadCloud className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="font-semibold">Drop your marksheet here</h3>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop or click to browse files. Make sure the text is clear for best results.
                        </p>
                      </div>
                      {uploadedFileName && (
                        <p className="text-xs text-muted-foreground">Last uploaded: {uploadedFileName}</p>
                      )}
                      <Button type="button" onClick={() => document.getElementById("marksheet-upload")?.click()}>
                        Choose File
                      </Button>
                    </div>
                  )}
                </label>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">AI Analysis Report</CardTitle>
                        <CardDescription className="text-base mt-1">Complete academic performance analysis</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetAnalysis} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Upload New File
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative rounded-xl border-2 border-primary/20 p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Student Name</p>
                          <p className="text-xl font-bold break-words text-foreground">
                            {analysis.studentName || "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-xl border-2 border-primary/20 p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <School className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">School / College</p>
                          <p className="text-xl font-bold break-words text-foreground">
                            {analysis.schoolName || "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative rounded-xl border-2 border-primary/20 p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Examination</p>
                          <p className="text-xl font-bold break-words text-foreground">
                            {analysis.examName || "—"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {analysis.subjects && analysis.subjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Subject-wise Performance</h3>
                          <p className="text-sm text-muted-foreground">Detailed breakdown of your academic achievements</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-3">
                        {analysis.subjects.map((subject, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.04 }}
                            className="flex items-center gap-4 rounded-xl border bg-card/80 px-4 py-3 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{subject.name}</p>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                                Subject #{index + 1}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm font-semibold">
                              {subject.marks != null && (
                                <div className="text-right min-w-[60px]">
                                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Score</p>
                                  <p className={`text-base ${getMarksTone(subject.marks)}`}>{subject.marks}</p>
                                </div>
                              )}
                              {subject.grade && (
                                <div className="text-right min-w-[60px]">
                                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Grade</p>
                                  <Badge className={`text-white px-2 py-1 ${getGradeColor(subject.grade)}`}>
                                    {subject.grade}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${getIndicatorTone(subject.marks)}`}
                                style={{ width: `${getIndicatorWidth(subject.marks)}%` }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t-2 bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">
                              Total Subjects Analyzed:
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-base font-bold px-4 py-2">
                            {analysis.subjects.length}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(!analysis.subjects || analysis.subjects.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed"
                    >
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground">No subject details found in the marksheet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Please ensure your marksheet contains clear subject information.</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">AI Recommended Colleges</h2>
                </div>
                {totalPages > 1 && (
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, recommendations.length)} of {recommendations.length} colleges
                  </p>
                )}
              </div>
              <p className="text-muted-foreground">
                Based on your academic profile and strengths, here are some colleges you might want to explore.
              </p>
              {academicProfile && (
                <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary" className="gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {(academicProfile.stream
                        ? academicProfile.stream.charAt(0).toUpperCase() + academicProfile.stream.slice(1)
                        : "Academic")}{" "}
                      stream focus
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      Avg Score: {academicProfile.averageScore}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(academicProfile.topSubjects ?? []).map((subject) => (
                      <Badge key={subject.name} variant="secondary" className="bg-primary/10 text-primary">
                        {subject.name} {subject.displayScore ? `• ${subject.displayScore}` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedRecommendations.map((college) => (
                  <Card key={college.id} className="border-2 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{college.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{college.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {typeof college.matchScore === "number" && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <TrendingUp className="h-3 w-3" />
                              {Math.round(college.matchScore)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3 mt-2">
                        {college.overview || "A leading institution with strong academic programs."}
                      </CardDescription>
                      {college.highlight && (
                        <p className="text-sm text-primary font-medium mt-2">{college.highlight}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {college.programs && Array.isArray(college.programs) && college.programs.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Popular Programs</p>
                          <div className="flex flex-wrap gap-2">
                            {college.programs.slice(0, 4).map((program, idx) => (
                              <Badge key={`${college.id}-${idx}`} variant="secondary">
                                {program}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <Badge variant="outline" className="gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {college.type}
                        </Badge>
                        {college.detailUrl && (
                          <Button size="sm" onClick={() => window.open(college.detailUrl, "_blank")} className="gap-2">
                            View profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Pagination - Show when there are more than 4 colleges */}
              {recommendations.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  {recommendations.length > collegesPerPage ? (
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange} 
                    />
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Showing all {recommendations.length} recommended {recommendations.length === 1 ? 'college' : 'colleges'}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>
    </div>
  )
}
