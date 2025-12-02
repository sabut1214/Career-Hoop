import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/context/AuthContext"
import { getUserProfile, updateUserProfile } from "@/lib/api"

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

const savedCareers = [
  {
    id: 1,
    title: "Software Engineer",
    confidence: 92,
    icon: Code,
    color: "bg-blue-500",
    savedDate: "2024-01-15",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    confidence: 85,
    icon: Palette,
    color: "bg-purple-500",
    savedDate: "2024-01-12",
  },
  {
    id: 3,
    title: "Data Scientist",
    confidence: 88,
    icon: BarChart3,
    color: "bg-green-500",
    savedDate: "2024-01-10",
  },
]

const savedColleges = [
  {
    id: 1,
    name: "Stanford University",
    location: "Stanford, CA",
    logo: "/stanford-university-logo.png",
    rating: 4.8,
    savedDate: "2024-01-14",
  },
  {
    id: 2,
    name: "MIT",
    location: "Cambridge, MA",
    logo: "/mit-logo-generic.png",
    rating: 4.9,
    savedDate: "2024-01-11",
  },
  {
    id: 3,
    name: "UC Berkeley",
    location: "Berkeley, CA",
    logo: "/uc-berkeley-logo.png",
    rating: 4.7,
    savedDate: "2024-01-09",
  },
]

const achievements = [
  { title: "Profile Complete", description: "Completed your profile setup", date: "2024-01-08", icon: User },
  { title: "Grades Entered", description: "Added academic performance data", date: "2024-01-10", icon: BookOpen },
  { title: "Interests Selected", description: "Chose your career interests", date: "2024-01-12", icon: Target },
  {
    title: "First Career Saved",
    description: "Saved your first career recommendation",
    date: "2024-01-15",
    icon: Star,
  },
]

const formatDateForInput = (value) => {
  if (!value) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().split("T")[0]
}

const formatDisplayDate = (value) => {
  if (!value) return "—"
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

  useEffect(() => {
    if (!user?.id) return
    let active = true
    setIsLoading(true)
    setErrorMessage("")
    getUserProfile(user.id)
      .then((data) => {
        if (!active) return
        const normalized = mapResponseToProfile(data, initialProfile)
        setProfileInfo(normalized)
        setEditedInfo(normalized)
        setProfileCompletion(data.profileCompletionPercent ?? 0)
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

    const payload = {
      name: editedInfo.name,
      phoneNumber: editedInfo.phone,
      location: editedInfo.location,
      schoolName: editedInfo.school,
      dateOfBirth: editedInfo.dateOfBirth || null,
      gpa: editedInfo.gpa ? parseFloat(editedInfo.gpa) : null,
    }

    if (payload.gpa != null && Number.isNaN(payload.gpa)) {
      setErrorMessage("Please provide a valid GPA value.")
      setIsSaving(false)
      return
    }

    try {
      const updated = await updateUserProfile(user.id, payload)
      const normalized = mapResponseToProfile(updated, profileInfo)
      setProfileInfo(normalized)
      setEditedInfo(normalized)
      setProfileCompletion(updated.profileCompletionPercent ?? profileCompletion)
      updateUser(updated)
      setStatusMessage("Profile updated successfully.")
      setIsEditing(false)
    } catch (error) {
      setErrorMessage(error.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedInfo(profileInfo)
    setIsEditing(false)
    setStatusMessage("")
    setErrorMessage("")
  }

  const displayName = profileInfo.name || user?.name || user?.fullName || "Student"
  const displayEmail = profileInfo.email || user?.email || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold">My Profile</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Manage your personal information and track your career journey progress
            </p>
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
                    <Avatar className="h-20 w-20 mx-auto sm:mx-0">
                      <AvatarImage src={profileInfo.avatar || "/placeholder.svg"} alt={displayName} />
                      <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                        {displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left space-y-2">
                      <h2 className="text-3xl font-bold">{displayName}</h2>
                      <p className="text-muted-foreground">
                        {profileInfo.school || "Add your school"} • Class of {profileInfo.graduationYear || "—"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                          GPA: {profileInfo.gpa || "—"}
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
                          { icon: Mail, label: "Email", value: displayEmail || "—" },
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
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  {career.confidence}% Match
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Star className="h-4 w-4 text-accent fill-current" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedColleges.map((college, index) => (
                        <motion.div
                          key={college.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="border hover:border-primary/20 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={college.logo || "/placeholder.svg"}
                                  alt={`${college.name} logo`}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold">{college.name}</h3>
                                  <p className="text-sm text-muted-foreground">{college.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">{college.rating}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Saved {new Date(college.savedDate).toLocaleDateString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
