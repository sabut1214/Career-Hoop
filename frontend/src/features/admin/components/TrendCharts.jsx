import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { getTrends } from "@/shared/lib/api"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/shared/components/ui/chart"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { BarChart3 } from "lucide-react"

export function TrendCharts() {
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const data = await getTrends(days)
      setTrendData(data || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch trends:", error)
      setTrendData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
    const interval = setInterval(fetchTrends, 30000) // Refresh every 30 seconds for real-time updates
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  const chartConfig = {
    userRegistrations: {
      label: "User Registrations",
      color: "var(--chart-1)",
    },
    careerCreations: {
      label: "Career Creations",
      color: "var(--chart-2)",
    },
    collegeCreations: {
      label: "College Creations",
      color: "var(--chart-3)",
    },
    trainingCreations: {
      label: "Training Creations",
      color: "var(--chart-4)",
    },
    quizCompletions: {
      label: "Quiz Completions",
      color: "var(--chart-5)",
    },
  }

  const chartData = trendData.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    "User Registrations": item.userRegistrations || 0,
    "Career Creations": item.careerCreations || 0,
    "College Creations": item.collegeCreations || 0,
    "Training Creations": item.trainingCreations || 0,
    "Quiz Completions": item.quizCompletions || 0,
  }))

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Card className="border-2 w-full overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Activity Trends</CardTitle>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {formatTimeAgo(lastUpdated)}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={days === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(7)}
                className="text-xs"
              >
                7 Days
              </Button>
              <Button
                variant={days === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(30)}
                className="text-xs"
              >
                30 Days
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(90)}
                className="text-xs"
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-x-auto">
          <div className="w-full min-w-0">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] min-h-[250px] text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No data in selected range</p>
                <p className="text-xs text-muted-foreground">Try selecting a different time period</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[300px] min-h-[250px] w-full min-w-[400px]">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                      label={{ value: "Date", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 12 } }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      width={50}
                      label={{ value: "Count", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fontSize: 12 } }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="User Registrations" 
                      stackId="1"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Career Creations" 
                      stackId="1"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="College Creations" 
                      stackId="1"
                      stroke="var(--chart-3)"
                      fill="var(--chart-3)"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Training Creations" 
                      stackId="1"
                      stroke="var(--chart-4)"
                      fill="var(--chart-4)"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Quiz Completions" 
                      stackId="1"
                      stroke="var(--chart-5)"
                      fill="var(--chart-5)"
                      fillOpacity={0.6}
                    />
                    <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: "20px" }} />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 w-full overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>User Registrations</CardTitle>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-x-auto">
          <div className="w-full min-w-0">
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] min-h-[200px] text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">No data in selected range</p>
                <p className="text-xs text-muted-foreground">Try selecting a different time period</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <ChartContainer config={chartConfig} className="h-[250px] min-h-[200px] w-full min-w-[400px]">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                      label={{ value: "Date", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 12 } }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      width={50}
                      label={{ value: "Registrations", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fontSize: 12 } }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone" 
                      dataKey="User Registrations" 
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

