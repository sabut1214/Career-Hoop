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

  const fetchEngagement = async () => {
    try {
      const data = await getEngagement()
      setEngagement(data)
    } catch (error) {
      console.error("Failed to fetch engagement:", error)
      setEngagement(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEngagement()
    const interval = setInterval(fetchEngagement, 60000) // Refresh every minute
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

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (24h)</p>
                <p className="text-2xl font-bold">{engagement.activeUsers24h}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (7d)</p>
                <p className="text-2xl font-bold">{engagement.activeUsers7d}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
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

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Active Users Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {topFeaturesData.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={topFeaturesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

