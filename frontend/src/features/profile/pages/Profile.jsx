import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  Star,
  BookOpen,
  Building2,
  Target,
  Award,
  TrendingUp,
  Code,
  Palette,
  BarChart3,
  Upload,
  X,
  Camera,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/shared/context/AuthContext"
import { toast } from "react-toastify"
import { getUserProfile, updateUserProfile, getSavedCareers, getSavedColleges } from "@/shared/lib/api"
import { ChangePasswordForm } from "../components/ChangePasswordForm"
import { PrivacySettings } from "../components/PrivacySettings"
import { AcademicDetailsForm } from "../components/AcademicDetailsForm"
import { SocialLinksForm } from "../components/SocialLinksForm"
import { ThemeSelector } from "../components/ThemeSelector"
import { DataExport } from "../components/DataExport"

const initialProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  dateOfBirth: "2005-03-15",
  school: "Lincoln High School",
  graduationYear: "2024",
  gpa: "3.8",
  avatar: "/placeholder.svg?height=100&width=100",
}

// Icon mapping for careers
const getCareerIcon = (careerName) => {
  const name = careerName?.toLowerCase() || ""
  if (name.includes("engineer") || name.includes("developer") || name.includes("programmer")) return Code
  if (name.includes("design") || name.includes("ui") || name.includes("ux")) return Palette
  if (name.includes("data") || name.includes("analyst") || name.includes("scientist")) return BarChart3
  return Star
}

const getCareerColor = (index) => {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"]
  return colors[index % colors.length]
}

const formatDateForInput = (value) => {
  if (!value) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

const formatDisplayDate = (value) => {
  if (!value) return "N/A"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
}

const mapResponseToProfile = (data, fallback = initialProfile) => ({
  ...fallback,
  name: data?.name ?? fallback.name ?? "",
  email: data?.email ?? fallback.email ?? "",
  phone: data?.phoneNumber ?? "",
  location: data?.location ?? "",
  dateOfBirth: data?.dateOfBirth ? formatDateForInput(data.dateOfBirth) : "",
  avatar: data?.profilePicture || fallback.avatar,
  school: data?.schoolName ?? "",
  gpa: data?.gpa != null ? String(data.gpa) : "",
})

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileInfo, setProfileInfo] = useState(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInfo, setEditedInfo] = useState(initialProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [profileCompletion, setProfileCompletion] = useState(user?.profileCompletionPercent ?? 0)
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [pictureRemoved, setPictureRemoved] = useState(false)
  const [savedCareers, setSavedCareers] = useState([])
  const [savedColleges, setSavedColleges] = useState([])

  const [achievements, setAchievements] = useState([])
  const [loadingSavedItems, setLoadingSavedItems] = useState(false)

  // Debug effect to track profile picture state
  useEffect(() => {
    console.log("Profile picture state changed:", {
      profilePicture: profilePicture ? `${profilePicture.substring(0, 50)}...` : null,
      profilePicturePreview: profilePicturePreview ? `${profilePicturePreview.substring(0, 50)}...` : null,
      profileInfoAvatar: profileInfo.avatar ? `${profileInfo.avatar.substring(0, 50)}...` : null
    })
  }, [profilePicture, profilePicturePreview, profileInfo.avatar])

  const fetchProfileData = async () => {
    if (!user?.id) return
    setIsLoading(true)
    setErrorMessage("")
    try {
      const data = await getUserProfile(user.id)
      const normalized = mapResponseToProfile(data, initialProfile)
      setProfileInfo({ ...normalized, ...data }) // Include all fields from response
      setEditedInfo(normalized)
      setProfileCompletion(data.profileCompletionPercent ?? 0)
      // Set profile picture if available
      if (data.profilePicture) {
        setProfilePicturePreview(data.profilePicture)
        setProfilePicture(data.profilePicture) // Preserve existing picture
      } else if (normalized.avatar && normalized.avatar !== "/placeholder.svg?height=100&width=100") {
        setProfilePicturePreview(normalized.avatar)
        setProfilePicture(normalized.avatar) // Preserve existing picture
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    let active = true
    setIsLoading(true)
    setErrorMessage("")
    getUserProfile(user.id)
      .then((data) => {
        if (!active) return
        const normalized = mapResponseToProfile(data, initialProfile)
        setProfileInfo({ ...normalized, ...data }) // Include all fields from response
        setEditedInfo(normalized)
        setProfileCompletion(data.profileCompletionPercent ?? 0)
        // Set profile picture if available
        if (data.profilePicture) {
          setProfilePicturePreview(data.profilePicture)
          setProfilePicture(data.profilePicture) // Preserve existing picture
        } else if (normalized.avatar && normalized.avatar !== "/placeholder.svg?height=100&width=100") {
          setProfilePicturePreview(normalized.avatar)
          setProfilePicture(normalized.avatar) // Preserve existing picture
        } else {
          setProfilePicturePreview(null)
          setProfilePicture(null)
        }
        setStatusMessage("")
      })
      .catch((error) => {
        if (!active) return
        setErrorMessage(error.message || "Failed to load profile details.")
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [user?.id])

  // Fetch saved careers and colleges
  useEffect(() => {
    if (!user?.id) return
    let active = true
    setLoadingSavedItems(true)

    const fetchSavedItems = async () => {
      try {
        const [careersData, collegesData] = await Promise.all([
          getSavedCareers(user.id).catch(() => []),
          getSavedColleges(user.id).catch(() => []),
        ])

        if (!active) return

        // Transform saved careers data
        const transformedCareers = careersData.map((career, index) => ({
          id: career.id,
          title: career.careerTitle || career.careerName,
          confidence: career.confidenceScore ? Math.round(career.confidenceScore) : null,
          icon: getCareerIcon(career.careerTitle || career.careerName),
          color: getCareerColor(index),
          savedDate: career.savedAt ? new Date(career.savedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }))

        // Transform saved colleges data
        const transformedColleges = collegesData.map((college) => {
          const website = college.collegeWebsite || college.collegeDetailUrl || college.website || college.detailUrl || null
          return {
            id: college.id,
            name: college.collegeName,
            location: college.collegeLocation || college.location || "Location not available",
            website,
            logo: "/placeholder.svg",
            savedDate: college.savedAt ? new Date(college.savedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          }
        })

        setSavedCareers(transformedCareers)
        setSavedColleges(transformedColleges)

        // Calculate achievements based on user activity
        const calculatedAchievements = []
        
        // Profile completion achievement
        if (profileCompletion >= 100) {
          calculatedAchievements.push({
            title: "Profile Complete",
            description: "Completed your profile setup",
            date: profileInfo.createdAt || new Date().toISOString().split('T')[0],
            icon: User,
          })
        }

        // Grades entered achievement
        if (profileInfo.gpa) {
          calculatedAchievements.push({
            title: "Grades Entered",
            description: "Added academic performance data",
            date: new Date().toISOString().split('T')[0],
            icon: BookOpen,
          })
        }

        // First career saved achievement
        if (transformedCareers.length > 0) {
          calculatedAchievements.push({
            title: "First Career Saved",
            description: "Saved your first career recommendation",
            date: transformedCareers[0].savedDate,
            icon: Star,
          })
        }

        // First college saved achievement
        if (transformedColleges.length > 0) {
          calculatedAchievements.push({
            title: "First College Saved",
            description: "Saved your first college",
            date: transformedColleges[0].savedDate,
            icon: Building2,
          })
        }

        // Multiple careers saved achievement
        if (transformedCareers.length >= 3) {
          calculatedAchievements.push({
            title: "Career Explorer",
            description: `Saved ${transformedCareers.length} career recommendations`,
            date: transformedCareers[transformedCareers.length - 1].savedDate,
            icon: Target,
          })
        }

        setAchievements(calculatedAchievements)
      } catch (error) {
        if (!active) return
        console.error("Failed to fetch saved items:", error)
        // Don't show error to user, just use empty arrays
        setSavedCareers([])
        setSavedColleges([])
        setAchievements([])
      } finally {
        if (!active) return
        setLoadingSavedItems(false)
      }
    }

    fetchSavedItems()

    return () => {
      active = false
    }
  }, [user?.id, profileCompletion, profileInfo.gpa, profileInfo.createdAt])

  const handlePictureUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB.")
      return
    }

    // Clear any previous errors and removal flag
    setErrorMessage("")
    setPictureRemoved(false)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      if (base64String && typeof base64String === 'string') {
        console.log("Image loaded successfully, length:", base64String.length)
        setProfilePicture(base64String)
        setProfilePicturePreview(base64String)
        setStatusMessage("Image selected. Click Save to update your profile.")
      } else {
        setErrorMessage("Failed to load image. Please try again.")
      }
    }
    reader.onerror = () => {
      setErrorMessage("Error reading image file. Please try again.")
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePicture = () => {
    // Clear the picture and mark as removed
    setProfilePicture(null)
    setProfilePicturePreview(null)
    setPictureRemoved(true)
    setErrorMessage("") // Clear any previous errors
    setStatusMessage("Profile picture removed. Click Save to confirm.")
    
    // Reset file input so user can select the same file again if needed
    const fileInput = document.getElementById("profile-picture-upload")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleSave = async () => {
    if (!user?.id) return
    setIsSaving(true)
    setErrorMessage("")
    setStatusMessage("")

    if (!editedInfo.name || !editedInfo.name.trim()) {
      setErrorMessage("Full name cannot be blank.")
      setIsSaving(false)
      return
    }

    // Determine what profilePicture value to send
    // Always send a string value (never null) so backend processes it
    let pictureToSend = ""
    if (profilePicture !== null && profilePicture !== undefined && profilePicture !== "") {
      // profilePicture state is set with a base64 string (new upload)
      pictureToSend = profilePicture
    } else if (pictureRemoved) {
      // User explicitly removed the picture - send empty string to delete
      pictureToSend = ""
    } else if (profilePicturePreview && profilePicturePreview.trim()) {
      // No explicit change, keep existing picture
      pictureToSend = profilePicturePreview
    } else {
      // No picture exists and user hasn't explicitly removed it
      // Check if there was an existing picture that should be kept
      if (profileInfo.avatar && profileInfo.avatar !== "/placeholder.svg?height=100&width=100") {
        pictureToSend = profileInfo.avatar
      } else {
        pictureToSend = ""
      }
    }

    const payload = {
      name: editedInfo.name,
      phoneNumber: editedInfo.phone,
      location: editedInfo.location,
      schoolName: editedInfo.school,
      dateOfBirth: editedInfo.dateOfBirth || null,
      gpa: editedInfo.gpa ? parseFloat(editedInfo.gpa) : null,
      profilePicture: pictureToSend, // Always include profilePicture
    }
    
    // Debug logging
    console.log("Profile save - State check:", {
      profilePicture: profilePicture ? `${typeof profilePicture} (${profilePicture.substring(0, 30)}...)` : profilePicture,
      profilePicturePreview: profilePicturePreview ? `${profilePicturePreview.substring(0, 30)}...` : profilePicturePreview,
      pictureToSend: pictureToSend ? `${typeof pictureToSend} (${pictureToSend.substring(0, 30)}...)` : pictureToSend,
    })

    if (payload.gpa != null && Number.isNaN(payload.gpa)) {
      setErrorMessage("Please provide a valid GPA value.")
      setIsSaving(false)
      return
    }

    try {
      // Log the actual payload being sent (truncate base64 for readability)
      const payloadForLog = {
        ...payload,
        profilePicture: payload.profilePicture 
          ? (payload.profilePicture.length > 100 
              ? `${payload.profilePicture.substring(0, 100)}... (length: ${payload.profilePicture.length})` 
              : payload.profilePicture)
          : "null or empty"
      }
      console.log("Saving profile with payload:", payloadForLog)
      console.log("Profile picture type:", typeof payload.profilePicture)
      console.log("Profile picture is empty string:", payload.profilePicture === "")
      console.log("Profile picture is null:", payload.profilePicture === null)
      
      const updated = await updateUserProfile(user.id, payload)
      console.log("Profile update response:", updated)
      console.log("Profile picture in response:", updated.profilePicture ? `Present (length: ${updated.profilePicture.length})` : "Missing")
      console.log("Profile picture response value:", updated.profilePicture ? updated.profilePicture.substring(0, 100) : "null")
      
      const normalized = mapResponseToProfile(updated, profileInfo)
      console.log("Normalized profile avatar:", normalized.avatar)
      
      // Update profile picture preview FIRST - always update based on response
      if (updated.profilePicture && updated.profilePicture.trim()) {
        console.log("Setting profile picture preview from response - length:", updated.profilePicture.length)
        console.log("First 100 chars:", updated.profilePicture.substring(0, 100))
        setProfilePicturePreview(updated.profilePicture)
        setProfilePicture(updated.profilePicture) // Keep it in state
        // Ensure normalized has the updated avatar
        normalized.avatar = updated.profilePicture
      } else {
        console.log("Clearing profile picture preview - no picture in response")
        setProfilePicturePreview(null)
        setProfilePicture(null) // Clear state
        normalized.avatar = "/placeholder.svg?height=100&width=100"
      }
      
      // Reset removal flag after successful save
      setPictureRemoved(false)
      
      setProfileInfo(normalized)
      setEditedInfo(normalized)
      setProfileCompletion(updated.profileCompletionPercent ?? profileCompletion)
      
      // Update user context with profile picture so it shows in sidebar
      const updatedUserData = { 
        ...user, 
        ...updated, 
        profilePicture: updated.profilePicture || null, 
        avatar: updated.profilePicture || null 
      }
      updateUser(updatedUserData)
      console.log("Updated user context - profilePicture:", updatedUserData.profilePicture ? "Present" : "Missing")
      console.log("Current profilePicturePreview state:", profilePicturePreview ? "Set" : "Not set")
      
      // Show appropriate success message based on what changed
      const hadPictureBefore = profileInfo.avatar && profileInfo.avatar !== "/placeholder.svg?height=100&width=100"
      const hasPictureAfter = updated.profilePicture && updated.profilePicture.trim()
      
      if (hadPictureBefore && !hasPictureAfter) {
        toast.success("Profile picture removed successfully.")
      } else if (!hadPictureBefore && hasPictureAfter) {
        toast.success("Profile picture added successfully.")
      } else if (hadPictureBefore && hasPictureAfter && profileInfo.avatar !== updated.profilePicture) {
        toast.success("Profile picture updated successfully.")
      } else {
        toast.success("Profile updated successfully.")
      }
      setIsEditing(false)
      
      // Force a re-render check after state updates
      setTimeout(() => {
        console.log("After save - profilePicturePreview:", profilePicturePreview ? "Still set" : "Cleared")
        console.log("After save - profileInfo.avatar:", normalized.avatar)
      }, 100)
    } catch (error) {
      const errorMsg = error.message || "Failed to update profile. Please try again."
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedInfo(profileInfo)
    setProfilePicture(null)
    setPictureRemoved(false) // Reset removal flag on cancel
    if (profileInfo.avatar && profileInfo.avatar !== "/placeholder.svg?height=100&width=100") {
      setProfilePicturePreview(profileInfo.avatar)
    } else {
      setProfilePicturePreview(null)
    }
    setIsEditing(false)
    setStatusMessage("")
    setErrorMessage("")
    
    // Reset file input
    const fileInput = document.getElementById("profile-picture-upload")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const displayName = profileInfo.name || user?.name || user?.fullName || "Student"
  const displayEmail = profileInfo.email || user?.email || ""

  return (
    <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div>
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-accent" />
                <h1 className="text-4xl font-bold">My Profile</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Manage your personal information and track your career journey progress
              </p>
            </div>
          </motion.div>

          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-2">
              <CardHeader>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
                    <div className="relative mx-auto sm:mx-0">
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={(() => {
                            // Priority: preview > profileInfo.avatar > placeholder
                            let imageSrc = profilePicturePreview || profileInfo.avatar || "/placeholder.svg"
                            // Filter out placeholder strings
                            if (imageSrc === "/placeholder.svg?height=100&width=100") {
                              imageSrc = "/placeholder.svg"
                            }
                            console.log("Avatar rendering - preview:", profilePicturePreview ? "exists" : "null", "avatar:", profileInfo.avatar ? "exists" : "null", "final src:", imageSrc.substring(0, 50))
                            return imageSrc
                          })()}
                          alt={displayName}
                          onError={(e) => {
                            console.error("Avatar image failed to load")
                            e.target.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log("Avatar image loaded successfully")
                          }}
                        />
                        <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                          {displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute bottom-0 right-0 flex gap-1">
                          <label
                            htmlFor="profile-picture-upload"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                            title="Upload photo"
                          >
                            <Camera className="h-4 w-4" />
                            <input
                              id="profile-picture-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePictureUpload}
                              disabled={isSaving}
                            />
                          </label>
                          {(profilePicturePreview || (profileInfo.avatar && profileInfo.avatar !== "/placeholder.svg?height=100&width=100")) && (
                            <button
                              onClick={handleRemovePicture}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-colors hover:bg-destructive/90"
                              title="Remove photo"
                              type="button"
                              disabled={isSaving}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left space-y-2">
                      <h2 className="text-3xl font-bold">{displayName}</h2>
                      <p className="text-muted-foreground">
                        {profileInfo.school || "Add your school"} | Class of {profileInfo.graduationYear || "N/A"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                          GPA: {profileInfo.gpa || "N/A"}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          <Award className="h-3 w-3 mr-1" />
                          4 Achievements
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          Profile {profileCompletion ?? 0}% complete
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => {
                      if (isEditing) {
                        handleCancel()
                      } else {
                        setEditedInfo(profileInfo)
                        // Preserve current profile picture when entering edit mode
                        if (profilePicturePreview && profilePicturePreview.trim()) {
                          setProfilePicture(profilePicturePreview)
                        } else if (profileInfo.avatar && profileInfo.avatar !== "/placeholder.svg?height=100&width=100") {
                          // If no preview but avatar exists, use avatar
                          setProfilePicture(profileInfo.avatar)
                        } else {
                          // No existing picture
                          setProfilePicture(null)
                        }
                        setPictureRemoved(false) // Reset removal flag when entering edit mode
                        setIsEditing(true)
                        setStatusMessage("")
                        setErrorMessage("")
                      }
                    }}
                    className="bg-transparent w-full sm:w-auto"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="info" className="flex items-center justify-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Info</span>
                </TabsTrigger>
                <TabsTrigger value="careers" className="flex items-center justify-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  <span>Careers</span>
                </TabsTrigger>
                <TabsTrigger value="colleges" className="flex items-center justify-center gap-2 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>Colleges</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center justify-center gap-2 text-sm">
                  <Award className="h-4 w-4" />
                  <span>Achievements</span>
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="info">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      {isEditing ? "Update your personal details" : "Your personal details and contact information"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {statusMessage && (
                      <Alert>
                        <AlertDescription>{statusMessage}</AlertDescription>
                      </Alert>
                    )}
                    {errorMessage && (
                      <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading profile...</p>
                    ) : isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editedInfo.name || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={editedInfo.email || ""} disabled readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={editedInfo.phone || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editedInfo.location || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, location: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school">School</Label>
                          <Input
                            id="school"
                            value={editedInfo.school || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, school: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={editedInfo.dateOfBirth || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, dateOfBirth: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={editedInfo.gpa || ""}
                            onChange={(e) => setEditedInfo({ ...editedInfo, gpa: e.target.value })}
                            disabled={isSaving}
                          />
                        </div>
                        <div className="col-span-full flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                          <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={handleCancel} className="bg-transparent" disabled={isSaving}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { icon: Mail, label: "Email", value: displayEmail || "N/A" },
                          { icon: Phone, label: "Phone", value: profileInfo.phone || "Add your phone number" },
                          { icon: MapPin, label: "Location", value: profileInfo.location || "Add your location" },
                          {
                            icon: Calendar,
                            label: "Date of Birth",
                            value: formatDisplayDate(profileInfo.dateOfBirth),
                          },
                          { icon: BookOpen, label: "School", value: profileInfo.school || "Add your school" },
                          { icon: TrendingUp, label: "GPA", value: profileInfo.gpa || "Add your GPA" },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg"
                          >
                            <item.icon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">{item.label}</p>
                              <p className="font-medium">{item.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Careers Tab */}
              <TabsContent value="careers">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Saved Careers ({savedCareers.length})</CardTitle>
                    <CardDescription>Career paths you've bookmarked for further exploration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSavedItems ? (
                      <p className="text-sm text-muted-foreground">Loading saved careers...</p>
                    ) : savedCareers.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No saved careers yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Start exploring careers and save your favorites!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedCareers.map((career, index) => (
                        <motion.div
                          key={career.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="border hover:border-primary/20 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg ${career.color} flex items-center justify-center`}
                                >
                                  <career.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{career.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Saved on {new Date(career.savedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                {career.confidence && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    {career.confidence}% Match
                                  </Badge>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Star className="h-4 w-4 text-accent fill-current" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Colleges Tab */}
              <TabsContent value="colleges">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Saved Colleges ({savedColleges.length})</CardTitle>
                    <CardDescription>Universities and colleges you're interested in applying to</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSavedItems ? (
                      <p className="text-sm text-muted-foreground">Loading saved colleges...</p>
                    ) : savedColleges.length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No saved colleges yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Explore colleges and save your favorites!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedColleges.map((college, index) => (
                          <motion.div
                            key={college.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <Card
                              className="border hover:border-primary/20 hover:shadow-md transition-all duration-300 h-full flex flex-col cursor-pointer"
                              onClick={() => {
                                const website = college.website
                                if (!website) return
                                let url = website.trim()
                                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                                  url = `https://${url}`
                                }
                                window.open(url, "_blank", "noopener,noreferrer")
                              }}
                            >
                              <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                                <div className="flex items-center space-x-3 flex-shrink-0">
                                  <img
                                    src={college.logo || "/placeholder.svg"}
                                    alt={`${college.name} logo`}
                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = "none"
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{college.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{college.location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-2">
                                  <p className="text-xs text-muted-foreground">
                                    Saved {new Date(college.savedDate).toLocaleDateString()}
                                  </p>
                                  {college.website && <span className="text-xs text-primary">Visit Website</span>}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Achievements ({achievements.length})</CardTitle>
                    <CardDescription>Milestones you've reached on your career discovery journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingSavedItems ? (
                      <p className="text-sm text-muted-foreground">Loading achievements...</p>
                    ) : achievements.length === 0 ? (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No achievements yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Complete your profile and start exploring to unlock achievements!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <achievement.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </motion.div>
    </div>
  )
}
