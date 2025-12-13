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
  const navigate = useNavigate()

  const fetchPendingCounts = async () => {
    try {
      const data = await getPendingCounts()
      setPendingCounts(data)
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

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Items
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
    <Card className={cn("border-2", hasPending && "border-orange-300")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasPending ? (
            <AlertCircle className="h-5 w-5 text-orange-600" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
          Pending Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Pending</span>
            <Badge variant={hasPending ? "destructive" : "secondary"} className="text-lg px-3 py-1">
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
                  <span>New Users (24h)</span>
                  <Badge variant="outline">{pendingCounts.recentUsers}</Badge>
                </div>
              )}
              {pendingCounts.recentCareers > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/careers")}
                >
                  <span>New Careers (24h)</span>
                  <Badge variant="outline">{pendingCounts.recentCareers}</Badge>
                </div>
              )}
              {pendingCounts.recentColleges > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/colleges")}
                >
                  <span>New Colleges (24h)</span>
                  <Badge variant="outline">{pendingCounts.recentColleges}</Badge>
                </div>
              )}
              {pendingCounts.recentTrainings > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/trainings")}
                >
                  <span>New Trainings (24h)</span>
                  <Badge variant="outline">{pendingCounts.recentTrainings}</Badge>
                </div>
              )}
              {pendingCounts.recentAcademicRecords > 0 && (
                <div 
                  className="flex items-center justify-between text-sm cursor-pointer hover:text-primary"
                  onClick={() => navigate("/admin/academic-records")}
                >
                  <span>New Academic Records (24h)</span>
                  <Badge variant="outline">{pendingCounts.recentAcademicRecords}</Badge>
                </div>
              )}
            </div>
          )}
          
          {!hasPending && (
            <p className="text-sm text-muted-foreground">No pending items in the last 24 hours</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

