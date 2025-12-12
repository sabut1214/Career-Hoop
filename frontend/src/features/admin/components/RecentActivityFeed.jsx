import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { getRecentActivity } from "@/lib/api"
import { 
  UserPlus, 
  BookOpen, 
  Building2, 
  Zap, 
  FileText, 
  CheckCircle2,
  Clock
} from "lucide-react"
import { cn } from "@/shared/lib/utils"

const ACTIVITY_ICONS = {
  user_registration: UserPlus,
  career_created: BookOpen,
  college_created: Building2,
  training_created: Zap,
  academic_record_submitted: FileText,
  quiz_completed: CheckCircle2,
}

const ACTIVITY_COLORS = {
  user_registration: "text-blue-600 bg-blue-100",
  career_created: "text-green-600 bg-green-100",
  college_created: "text-purple-600 bg-purple-100",
  training_created: "text-yellow-600 bg-yellow-100",
  academic_record_submitted: "text-orange-600 bg-orange-100",
  quiz_completed: "text-indigo-600 bg-indigo-100",
}

export function RecentActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = async () => {
    try {
      const data = await getRecentActivity()
      setActivities(data || [])
    } catch (error) {
      console.error("Failed to fetch recent activity:", error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    const interval = setInterval(fetchActivities, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown"
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // seconds

    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const getActivityDescription = (activity) => {
    const userName = activity.userName || "Unknown user"
    const entityName = activity.entityName || "item"
    
    switch (activity.type) {
      case "user_registration":
        return `${userName} registered`
      case "career_created":
        return `Career "${entityName}" was created`
      case "college_created":
        return `College "${entityName}" was created`
      case "training_created":
        return `Training "${entityName}" was created`
      case "academic_record_submitted":
        return `${userName} submitted an academic record`
      case "quiz_completed":
        return `${userName} completed quiz: "${entityName}"`
      default:
        return `${activity.action || "Action"} on ${entityName}`
    }
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.type] || Clock
              const colorClass = ACTIVITY_COLORS[activity.type] || "text-gray-600 bg-gray-100"
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

