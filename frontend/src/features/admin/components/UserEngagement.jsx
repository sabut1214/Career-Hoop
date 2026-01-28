import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { getEngagement } from "@/shared/lib/api"
import { Users, TrendingUp, BarChart3 } from "lucide-react"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/shared/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export function UserEngagement() {
  const [engagement, setEngagement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchEngagement = async () => {
    try {
      const data = await getEngagement()
      setEngagement(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch engagement:", error)
      setEngagement(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEngagement()
    const interval = setInterval(fetchEngagement, 30000) // Refresh every 30 seconds for more real-time updates
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!engagement) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to fetch engagement metrics</p>
        </CardContent>
      </Card>
    )
  }

  const activeUsersData = [
    { period: "24h", users: engagement.activeUsers24h },
    { period: "7d", users: engagement.activeUsers7d },
    { period: "30d", users: engagement.activeUsers30d },
  ]

  const topFeaturesData = engagement.topFeatures 
    ? Object.entries(engagement.topFeatures)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : []

  const chartConfig = {
    users: {
      label: "Active Users",
      color: "var(--chart-1)",
    },
    count: {
      label: "Count",
      color: "var(--chart-2)",
    },
  }

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

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Engagement
            </CardTitle>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (24h)</p>
                <p className="text-2xl font-bold">{engagement.activeUsers24h}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (7d)</p>
                <p className="text-2xl font-bold">{engagement.activeUsers7d}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (30d)</p>
                <p className="text-2xl font-bold">{engagement.activeUsers30d}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Retention Rate</span>
              <span className="text-2xl font-bold">{engagement.retentionRate.toFixed(1)}%</span>
            </div>

            {engagement.averageSessionDurationMinutes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Session Duration</span>
                <span className="text-lg font-medium">{engagement.averageSessionDurationMinutes} min</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Users Over Time</CardTitle>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeUsersData.length === 0 || activeUsersData.every(d => d.users === 0) ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No active user data</p>
                <p className="text-xs text-muted-foreground">User activity data will appear here once available</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <BarChart data={activeUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }} 
                  label={{ value: "Time Period", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 12 } }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  label={{ value: "Active Users", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fontSize: 12 } }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Features</CardTitle>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {topFeaturesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No feature usage data</p>
                <p className="text-xs text-muted-foreground">Feature usage statistics will appear here once available</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <BarChart data={topFeaturesData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12 }} 
                    label={{ value: "Usage Count", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 12 } }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11 }} 
                    width={160}
                    tickMargin={10}
                    label={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

