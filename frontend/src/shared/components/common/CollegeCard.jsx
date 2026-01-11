import { memo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"
import { ExternalLink, GraduationCap, Loader2, MapPin, Star, Users, DollarSign, Clock } from "lucide-react"

const clampPercent = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null
  return Math.max(0, Math.min(100, Math.round(value)))
}

const PUBLIC_KEYWORDS = ["campus", "public", "government", "constituent", "state", "community"]
const PRIVATE_KEYWORDS = ["college", "academy", "institute", "school", "private"]

const inferCollegeType = (college) => {
  const rawType = (college?.type || "").toString().trim().toLowerCase()
  if (rawType.includes("public")) return "public"
  if (rawType.includes("private")) return "private"

  const name = (college?.name || "").toLowerCase()
  const overview = (college?.overview || "").toLowerCase()
  const description = (college?.description || "").toLowerCase()
  const combinedText = `${name} ${overview} ${description}`

  if (PUBLIC_KEYWORDS.some((keyword) => combinedText.includes(keyword))) return "public"
  if (PRIVATE_KEYWORDS.some((keyword) => combinedText.includes(keyword))) return "private"
  return "unknown"
}

const formatCollegeType = (type) => {
  if (type === "public") return "Public"
  if (type === "private") return "Private"
  return "Unknown"
}

const parsePrograms = (programs) => {
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
        return parsePrograms(parsed)
      } catch {
        return programs.split(",").map((item) => item.trim()).filter(Boolean)
      }
    }
    return programs.split(",").map((item) => item.trim()).filter(Boolean)
  }

  return []
}

export const CollegeCard = memo(
  ({ college, index, isSaved, onToggleSaved, matchScore }) => {
    const { user } = useAuth()
    const prefersReducedMotion = useReducedMotion()
    const hasDetailUrl = Boolean(college.detailUrl)
    const [isSaving, setIsSaving] = useState(false)
    const matchPercent = clampPercent(matchScore)
    const resolvedType = college.displayType || formatCollegeType(inferCollegeType(college))
    const programList = parsePrograms(college.programs)

    const handleSaveClick = async (e) => {
      e.stopPropagation()
      if (!college?.id) return
      if (!user?.id) {
        toast.error("Please log in to save colleges")
        return
      }
      if (!onToggleSaved || isSaving) return

      setIsSaving(true)
      try {
        await onToggleSaved(college.id)
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
        <Card className="h-full min-h-[460px] flex flex-col border-2 hover:border-primary/20 hover:shadow-lg transition-[box-shadow,border-color] duration-200 ease-out">
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
                  e.target.style.display = "none"
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-[color] duration-200 ease-out">{college.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {college.location || "Location not available"}
                      </span>
                    </div>
                    {college.affiliation && (
                      <div className="flex items-center space-x-2 mt-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{college.affiliation}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={!user?.id || !college?.id || isSaving}
                    className="transition-[color] duration-200 ease-out disabled:opacity-50"
                    title={!user?.id ? "Log in to save colleges" : isSaved ? "Remove from saved" : "Save college"}
                    aria-label={!user?.id ? "Log in to save colleges" : isSaved ? "Remove from saved" : "Save college"}
                    aria-pressed={isSaved}
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Star
                        className={`h-5 w-5 shrink-0 transition-[color,fill] duration-200 ease-out ${
                          !user?.id || !college?.id
                            ? "text-muted-foreground cursor-not-allowed"
                            : isSaved
                              ? "text-warning fill-warning cursor-pointer" /* Brand YellowGreen for saved state */
                              : "text-muted-foreground group-hover:text-accent cursor-pointer"
                        }`}
                      />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {resolvedType}
                  </Badge>
                  {matchPercent != null && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary" title="Match percentage">
                      {matchPercent}% match
                    </Badge>
                  )}
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
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs">Students</span>
                  </div>
                  <span className="text-xs font-medium">{college.students || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    <span className="text-xs">Tuition</span>
                  </div>
                  <span className="text-xs font-medium">{college.tuition || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    <span className="text-xs">Acceptance</span>
                  </div>
                  <span className="text-xs font-medium">{college.acceptanceRate || college.acceptance || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="text-xs">Founded</span>
                  </div>
                  <span className="text-xs font-medium">{college.establishedYear || college.established || "N/A"}</span>
                </div>
              </div>
            </div>

            {programList.length > 0 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Popular Programs</h4>
                  <div className="flex flex-wrap gap-1">
                    {programList.slice(0, 4).map((program, idx) => (
                      <Badge key={`${college.id || idx}-${program}`} variant="secondary" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 mt-auto">
              <Button
                className="w-full"
                onClick={() => hasDetailUrl && window.open(college.detailUrl, "_blank", "noopener,noreferrer")}
                disabled={!hasDetailUrl}
                title={!hasDetailUrl ? "Website not available" : ""}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {hasDetailUrl ? "View Details" : "Website Unavailable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  },
  (prevProps, nextProps) => {
    const prevCollegeId = String(prevProps.college?.id || "")
    const nextCollegeId = String(nextProps.college?.id || "")
    const prevIsSaved = !!prevProps.isSaved
    const nextIsSaved = !!nextProps.isSaved
    const prevMatch = clampPercent(prevProps.matchScore)
    const nextMatch = clampPercent(nextProps.matchScore)

    if (prevCollegeId !== nextCollegeId) return false
    if (prevIsSaved !== nextIsSaved) return false
    if (prevProps.index !== nextProps.index) return false
    if (prevMatch !== nextMatch) return false
    return true
  }
)

CollegeCard.displayName = "CollegeCard"

export default CollegeCard
