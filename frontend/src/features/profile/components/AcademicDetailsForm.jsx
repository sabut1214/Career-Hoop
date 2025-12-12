import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { GraduationCap, Save, X } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/shared/context/AuthContext"
import { updateUserProfile } from "@/shared/lib/api"

const GRADE_LEVELS = [
  "9",
  "10",
  "11",
  "12",
  "Undergraduate",
  "Graduate",
  "Other"
]

const STREAMS = [
  "Science",
  "Commerce",
  "Arts",
  "General",
  "Other"
]

const COMMON_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Nepali",
  "Social Studies",
  "Economics",
  "Accountancy",
  "Business Studies",
  "Computer Science",
  "Information Technology",
  "Psychology",
  "Sociology",
  "History",
  "Geography",
  "Political Science",
  "Literature",
  "Fine Arts",
  "Music"
]

/**
 * AcademicDetailsForm component allows users to update their academic information.
 * 
 * Features:
 * - Grade level selection (9-12, Undergraduate, Graduate, Other)
 * - Stream selection (Science, Commerce, Arts, General, Other)
 * - Subject management with common subjects and custom subject support
 * - Subjects stored as JSON array in backend
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userProfile - Current user profile data
 * @param {Function} props.onUpdate - Callback function to refresh profile data after update
 * @returns {JSX.Element} The academic details form component
 */
export function AcademicDetailsForm({ userProfile, onUpdate }) {
  const { user } = useAuth()
  const [gradeLevel, setGradeLevel] = useState("")
  const [stream, setStream] = useState("")
  const [subjects, setSubjects] = useState([])
  const [customSubject, setCustomSubject] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setGradeLevel(userProfile.gradeLevel || "")
      setStream(userProfile.stream || "")
      // Ensure subjects is always an array
      const subjectsArray = Array.isArray(userProfile.subjects) 
        ? userProfile.subjects 
        : (userProfile.subjects ? [userProfile.subjects] : [])
      setSubjects(subjectsArray)
    }
  }, [userProfile])

  const handleAddSubject = (subject) => {
    if (subject && !subjects.includes(subject)) {
      setSubjects([...subjects, subject])
    }
  }

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !subjects.includes(customSubject.trim())) {
      setSubjects([...subjects, customSubject.trim()])
      setCustomSubject("")
    }
  }

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter((s) => s !== subjectToRemove))
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      await updateUserProfile(user.id, {
        gradeLevel: gradeLevel || null,
        stream: stream || null,
        subjects: subjects.length > 0 ? subjects : null,
      })
      toast.success("Academic details updated successfully")
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      toast.error(error.message || "Failed to update academic details")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Academic Details
        </CardTitle>
        <CardDescription>Update your academic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade-level">Grade Level</Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={isSaving}>
              <SelectTrigger id="grade-level">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream">Stream</Label>
            <Select value={stream} onValueChange={setStream} disabled={isSaving}>
              <SelectTrigger id="stream">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                {STREAMS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subjects</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                {subject}
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subject)}
                  className="ml-1 hover:text-destructive"
                  disabled={isSaving}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add custom subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomSubject()
                  }
                }}
                disabled={isSaving}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomSubject}
                disabled={isSaving || !customSubject.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTS.filter((s) => !subjects.includes(s)).map((subject) => (
                <Button
                  key={subject}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSubject(subject)}
                  disabled={isSaving}
                >
                  + {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}


