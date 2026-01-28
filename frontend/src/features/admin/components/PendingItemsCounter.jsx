import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { getPendingCounts } from "@/shared/lib/api"
import { AlertCircle, Clock } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useNavigate } from "react-router-dom"

export function PendingItemsCounter() {
  const [pendingCounts, setPendingCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const navigate = useNavigate()

  const fetchPendingCounts = async () => {
    try {
      const data = await getPendingCounts()
      setPendingCounts(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch pending counts:", error)
      setPendingCounts(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingCounts()
    const interval = setInterval(fetchPendingCounts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (date) => {
    if (!date) return "Never"
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // seconds

    if (diff < 10) return "Just now"
    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!pendingCounts) {
    return null
  }

  const totalPending = pendingCounts.totalPending || 0
  const hasPending = totalPending > 0

  return (
    <Card className={cn("border-2 transition-[border-color] duration-200 ease-out", hasPending && "border-warning/50")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {hasPending ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
            ) : (
              <Clock className="h-5 w-5 shrink-0" />
            )}
            Recent Items
          </CardTitle>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {formatTimeAgo(lastUpdated)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Items created in the last 24 hours</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total New Items</span>
            <Badge variant={hasPending ? "default" : "secondary"} className="text-lg px-3 py-1">
              {totalPending}
            </Badge>
          </div>
          
          {hasPending && (
            <div className="space-y-2 pt-2 border-t">
              {pendingCounts.recentUsers > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/students")}
                >
                  <span>New Users</span>
                  <Badge variant="outline">{pendingCounts.recentUsers}</Badge>
                </div>
              )}
              {pendingCounts.recentCareers > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/careers")}
                >
                  <span>New Careers</span>
                  <Badge variant="outline">{pendingCounts.recentCareers}</Badge>
                </div>
              )}
              {pendingCounts.recentColleges > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/colleges")}
                >
                  <span>New Colleges</span>
                  <Badge variant="outline">{pendingCounts.recentColleges}</Badge>
                </div>
              )}
              {pendingCounts.recentTrainings > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/trainings")}
                >
                  <span>New Trainings</span>
                  <Badge variant="outline">{pendingCounts.recentTrainings}</Badge>
                </div>
              )}
              {pendingCounts.recentAcademicRecords > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/academic-records")}
                >
                  <span>New Academic Records</span>
                  <Badge variant="outline">{pendingCounts.recentAcademicRecords}</Badge>
                </div>
              )}
            </div>
          )}
          
          {!hasPending && (
            <p className="text-sm text-muted-foreground">No new items in the last 24 hours</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

