import { useEffect, useState, useRef, useCallback } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Building2, Zap, RefreshCw } from "lucide-react"
import { getStudents, getCareers, getColleges, getTrainings } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"
import { cn } from "@/lib/utils"

const POLL_INTERVAL = 30000 // 30 seconds

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    careers: 0,
    colleges: 0,
    trainings: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)

  const fetchStats = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [studentsRes, careersRes, collegesRes, trainingsRes] = await Promise.all([
        getStudents(),
        getCareers(),
        getColleges(),
        getTrainings(),
      ])

      // Helper function to safely get array length
      const getCount = (response) => {
        if (!response) return 0
        // Handle direct array response
        if (Array.isArray(response)) return response.length
        // Handle { data: [...] } response
        if (Array.isArray(response.data)) return response.data.length
        // Handle { data: { content: [...] } } or other nested structures
        if (response.data?.content && Array.isArray(response.data.content)) {
          return response.data.content.length
        }
        // Handle empty or unexpected structure
        return 0
      }

      const studentsCount = getCount(studentsRes)
      const careersCount = getCount(careersRes)
      const collegesCount = getCount(collegesRes)
      const trainingsCount = getCount(trainingsRes)

      // Log for debugging
      console.log("Admin Dashboard Stats:", {
        students: studentsCount,
        careers: careersCount,
        colleges: collegesCount,
        trainings: trainingsCount,
        raw: { studentsRes, careersRes, collegesRes, trainingsRes }
      })

      setStats({
        students: studentsCount,
        careers: careersCount,
        colleges: collegesCount,
        trainings: trainingsCount,
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      // Set all to 0 on error to show something
      setStats({
        students: 0,
        careers: 0,
        colleges: 0,
        trainings: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Set up polling
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      intervalRef.current = setInterval(() => {
        fetchStats(false)
      }, POLL_INTERVAL)
    }

    // Handle page visibility - pause polling when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else {
        // Tab is visible, resume polling
        fetchStats(false) // Fetch immediately when tab becomes visible
        startPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    startPolling()

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [fetchStats])

  const handleManualRefresh = () => {
    fetchStats(true)
  }

  const formatLastUpdated = (date) => {
    if (!date) return "Never"
    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // seconds

    if (diff < 10) return "Just now"
    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    return date.toLocaleTimeString()
  }

  const statCards = [
    { label: "Students", value: stats.students, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Careers", value: stats.careers, icon: BookOpen, color: "bg-green-100 text-green-600" },
    { label: "Colleges", value: stats.colleges, icon: Building2, color: "bg-purple-100 text-purple-600" },
    { label: "Trainings", value: stats.trainings, icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage all platform resources</p>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {formatLastUpdated(lastUpdated)}
                  </p>
                )}
              </div>
              <Button
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{loading ? "-" : stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total {stat.label.toLowerCase()}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
