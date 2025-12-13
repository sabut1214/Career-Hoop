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

export function TrendCharts() {
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const data = await getTrends(days)
      setTrendData(data || [])
    } catch (error) {
      console.error("Failed to fetch trends:", error)
      setTrendData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
    const interval = setInterval(fetchTrends, 60000) // Refresh every minute
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartConfig = {
    userRegistrations: {
      label: "User Registrations",
      color: "hsl(var(--chart-1))",
    },
    careerCreations: {
      label: "Career Creations",
      color: "hsl(var(--chart-2))",
    },
    collegeCreations: {
      label: "College Creations",
      color: "hsl(var(--chart-3))",
    },
    trainingCreations: {
      label: "Training Creations",
      color: "hsl(var(--chart-4))",
    },
    quizCompletions: {
      label: "Quiz Completions",
      color: "hsl(var(--chart-5))",
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
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Trends</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={days === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(7)}
              >
                7 Days
              </Button>
              <Button
                variant={days === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(30)}
              >
                30 Days
              </Button>
              <Button
                variant={days === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(90)}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="User Registrations" 
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Career Creations" 
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="College Creations" 
                stackId="1"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Training Creations" 
                stackId="1"
                stroke="hsl(var(--chart-4))"
                fill="hsl(var(--chart-4))"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Quiz Completions" 
                stackId="1"
                stroke="hsl(var(--chart-5))"
                fill="hsl(var(--chart-5))"
                fillOpacity={0.6}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>User Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="User Registrations" 
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

