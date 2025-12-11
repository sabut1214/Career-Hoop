import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link2, Linkedin, Github, Globe, Save } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"
import { updateUserProfile } from "@/lib/api"

/**
 * SocialLinksForm component allows users to add and update their professional social links.
 * 
 * Features:
 * - LinkedIn URL with platform-specific validation
 * - GitHub URL with platform-specific validation
 * - Portfolio/Website URL with general URL validation
 * - Real-time URL validation with error messages
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userProfile - Current user profile data
 * @param {Function} props.onUpdate - Callback function to refresh profile data after update
 * @returns {JSX.Element} The social links form component
 */
export function SocialLinksForm({ userProfile, onUpdate }) {
  const { user } = useAuth()
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (userProfile) {
      setLinkedinUrl(userProfile.linkedinUrl || "")
      setGithubUrl(userProfile.githubUrl || "")
      setPortfolioUrl(userProfile.portfolioUrl || "")
    }
  }, [userProfile])

  const normalizeUrl = (url) => {
    if (!url || url.trim() === "") return null
    
    let trimmed = url.trim()
    
    // Normalize URL - add https:// if no protocol is specified
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      trimmed = "https://" + trimmed
    }
    
    return trimmed
  }

  const validateUrl = (url, platform) => {
    if (!url || url.trim() === "") return null

    const normalized = normalizeUrl(url)

    // Basic URL validation
    try {
      const urlObj = new URL(normalized)
      
      // Platform-specific validation
      if (platform === "LinkedIn") {
        if (!urlObj.hostname.includes("linkedin.com")) {
          return "LinkedIn URL must contain 'linkedin.com'"
        }
      }
      if (platform === "GitHub") {
        if (!urlObj.hostname.includes("github.com")) {
          return "GitHub URL must contain 'github.com'"
        }
      }
      
      return null
    } catch {
      return `Invalid ${platform} URL format`
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setErrors({})

    // Validate URLs
    const linkedinError = validateUrl(linkedinUrl, "LinkedIn")
    const githubError = validateUrl(githubUrl, "GitHub")
    const portfolioError = validateUrl(portfolioUrl, "Portfolio")

    if (linkedinError || githubError || portfolioError) {
      setErrors({
        linkedinUrl: linkedinError,
        githubUrl: githubError,
        portfolioUrl: portfolioError,
      })
      return
    }

    setIsSaving(true)
    try {
      // Normalize URLs before saving
      const normalizedLinkedin = normalizeUrl(linkedinUrl)
      const normalizedGithub = normalizeUrl(githubUrl)
      const normalizedPortfolio = normalizeUrl(portfolioUrl)
      
      await updateUserProfile(user.id, {
        linkedinUrl: normalizedLinkedin || null,
        githubUrl: normalizedGithub || null,
        portfolioUrl: normalizedPortfolio || null,
      })
      toast.success("Social links updated successfully")
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      toast.error(error.message || "Failed to update social links")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Social Links
        </CardTitle>
        <CardDescription>Add your professional and portfolio links</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin-url" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn URL
          </Label>
          <Input
            id="linkedin-url"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => {
              setLinkedinUrl(e.target.value)
              if (errors.linkedinUrl) {
                setErrors({ ...errors, linkedinUrl: null })
              }
            }}
            disabled={isSaving}
            className={errors.linkedinUrl ? "border-destructive" : ""}
          />
          {errors.linkedinUrl && (
            <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-url" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub URL
          </Label>
          <Input
            id="github-url"
            type="url"
            placeholder="https://github.com/yourusername"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value)
              if (errors.githubUrl) {
                setErrors({ ...errors, githubUrl: null })
              }
            }}
            disabled={isSaving}
            className={errors.githubUrl ? "border-destructive" : ""}
          />
          {errors.githubUrl && (
            <p className="text-sm text-destructive">{errors.githubUrl}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio-url" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Portfolio/Website URL
          </Label>
          <Input
            id="portfolio-url"
            type="url"
            placeholder="https://yourportfolio.com"
            value={portfolioUrl}
            onChange={(e) => {
              setPortfolioUrl(e.target.value)
              if (errors.portfolioUrl) {
                setErrors({ ...errors, portfolioUrl: null })
              }
            }}
            disabled={isSaving}
            className={errors.portfolioUrl ? "border-destructive" : ""}
          />
          {errors.portfolioUrl && (
            <p className="text-sm text-destructive">{errors.portfolioUrl}</p>
          )}
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}


