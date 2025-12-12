import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Switch } from "@/shared/components/ui/switch"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Shield, Save } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/shared/context/AuthContext"
import { updateUserProfile } from "@/shared/lib/api"

/**
 * PrivacySettings component allows users to control visibility of their profile information.
 * 
 * Features:
 * - Toggle visibility of GPA
 * - Toggle visibility of saved colleges
 * - Toggle visibility of saved careers
 * - Only shows save button when changes are detected
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userProfile - Current user profile data
 * @param {Function} props.onUpdate - Callback function to refresh profile data after update
 * @returns {JSX.Element} The privacy settings component
 */
export function PrivacySettings({ userProfile, onUpdate }) {
  const { user } = useAuth()
  const [showGpa, setShowGpa] = useState(true)
  const [showSavedColleges, setShowSavedColleges] = useState(true)
  const [showSavedCareers, setShowSavedCareers] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setShowGpa(userProfile.showGpa !== false)
      setShowSavedColleges(userProfile.showSavedColleges !== false)
      setShowSavedCareers(userProfile.showSavedCareers !== false)
    }
  }, [userProfile])

  useEffect(() => {
    if (userProfile) {
      const changed =
        showGpa !== (userProfile.showGpa !== false) ||
        showSavedColleges !== (userProfile.showSavedColleges !== false) ||
        showSavedCareers !== (userProfile.showSavedCareers !== false)
      setHasChanges(changed)
    }
  }, [showGpa, showSavedColleges, showSavedCareers, userProfile])

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      await updateUserProfile(user.id, {
        showGpa,
        showSavedColleges,
        showSavedCareers,
      })
      toast.success("Privacy settings updated successfully")
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      toast.error(error.message || "Failed to update privacy settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>Control what information is visible to others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-gpa" className="text-base">Show GPA</Label>
              <p className="text-sm text-muted-foreground">Display your GPA on your profile</p>
            </div>
            <Switch
              id="show-gpa"
              checked={showGpa}
              onCheckedChange={setShowGpa}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-saved-colleges" className="text-base">Show Saved Colleges</Label>
              <p className="text-sm text-muted-foreground">Display your saved colleges on your profile</p>
            </div>
            <Switch
              id="show-saved-colleges"
              checked={showSavedColleges}
              onCheckedChange={setShowSavedColleges}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-saved-careers" className="text-base">Show Saved Careers</Label>
              <p className="text-sm text-muted-foreground">Display your saved careers on your profile</p>
            </div>
            <Switch
              id="show-saved-careers"
              checked={showSavedCareers}
              onCheckedChange={setShowSavedCareers}
              disabled={isSaving}
            />
          </div>
        </div>

        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}


