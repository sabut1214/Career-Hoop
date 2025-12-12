import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { getSystemHealth } from "@/lib/api"
import { CheckCircle2, AlertTriangle, XCircle, Database, Activity, Users, Clock } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export function SystemHealth() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    try {
      const data = await getSystemHealth()
      setHealth(data)
    } catch (error) {
      console.error("Failed to fetch system health:", error)
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "HEALTHY":
        return CheckCircle2
      case "WARNING":
        return AlertTriangle
      case "CRITICAL":
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 bg-green-100"
      case "WARNING":
        return "text-yellow-600 bg-yellow-100"
      case "CRITICAL":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to fetch system health</p>
        </CardContent>
      </Card>
    )
  }

  const StatusIcon = getStatusIcon(health.overallStatus)
  const statusColor = getStatusColor(health.overallStatus)

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", statusColor)}>
            <StatusIcon className="h-5 w-5" />
          </div>
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            <Badge variant={health.overallStatus === "HEALTHY" ? "default" : "destructive"}>
              {health.overallStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", getStatusColor(health.databaseStatus))}>
                <Database className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="text-sm font-medium">{health.databaseStatus}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">API Response</p>
                <p className="text-sm font-medium">
                  {health.apiResponseTimeMs > 0 ? `${health.apiResponseTimeMs}ms` : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Users (24h)</p>
                <p className="text-sm font-medium">{health.activeUsers24h}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Error Rate</p>
                <p className="text-sm font-medium">
                  {health.errorRate > 0 ? `${health.errorRate.toFixed(2)}%` : "0%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ children, variant = "default", className }) {
  const variantClasses = {
    default: "bg-green-100 text-green-800",
    destructive: "bg-red-100 text-red-800",
  }
  
  return (
    <span className={cn("px-2 py-1 rounded-md text-xs font-medium", variantClasses[variant], className)}>
      {children}
    </span>
  )
}

