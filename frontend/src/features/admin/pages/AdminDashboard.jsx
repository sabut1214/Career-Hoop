import { useEffect, useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Users, BookOpen, Building2, Zap, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { getStudents, getCareers, getColleges, getTrainings, getGrowthMetrics, getAdminDashboardStats } from "@/shared/lib/api"
import { logger } from "@/shared/lib/utils/logger"
import { cn } from "@/shared/lib/utils"
import { RecentActivityFeed } from "@/features/admin/components/RecentActivityFeed"
import { QuickActions } from "@/features/admin/components/QuickActions"
import { PendingItemsCounter } from "@/features/admin/components/PendingItemsCounter"
import { TrendCharts } from "@/features/admin/components/TrendCharts"
import { SystemHealth } from "@/features/admin/components/SystemHealth"
import { UserEngagement } from "@/features/admin/components/UserEngagement"
import { StatCardSkeleton } from "@/shared/components/common/LoadingSkeleton"

const POLL_INTERVAL = 30000 // 30 seconds

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    careers: 0,
    colleges: 0,
    trainings: 0,
  })
  const [growthMetrics, setGrowthMetrics] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchStats = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      logger.debug("Fetching admin dashboard stats...")
      setError(null) // Clear previous errors
      
      const [statsRes, growthRes] = await Promise.all([
        getAdminDashboardStats().catch((error) => {
          logger.error("Failed to fetch admin dashboard stats:", error)
          console.error("Admin dashboard stats error:", error)
          setError(`Failed to fetch stats: ${error.message}`)
          return null
        }),
        getGrowthMetrics().catch((error) => {
          logger.error("Failed to fetch growth metrics:", error)
          console.error("Growth metrics error:", error)
          // Don't set error for growth metrics as it's not critical
          return []
        }),
      ])

      // Helper function to safely get array length
      const getCount = (response) => {
        if (!response) return 0
        // Prefer explicit totals when provided
        if (typeof response.totalElements === "number") return response.totalElements
        if (typeof response.meta?.totalElements === "number") return response.meta.totalElements
        if (typeof response.data?.totalElements === "number") return response.data.totalElements
        if (typeof response.data?.meta?.totalElements === "number") return response.data.meta.totalElements
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

      let studentsCount = 0
      let careersCount = 0
      let collegesCount = 0
      let trainingsCount = 0

      if (statsRes) {
        // Use the stats API response directly - it uses count() which is accurate
        studentsCount = statsRes.students ?? 0
        careersCount = statsRes.careers ?? 0
        collegesCount = statsRes.colleges ?? 0
        trainingsCount = statsRes.trainings ?? 0
        console.log("Using admin dashboard stats API:", statsRes)
      } else {
        // Fallback: Use individual API calls with pagination to get accurate counts
        console.warn("Admin dashboard stats API failed, using fallback method")
        const [studentsRes, careersRes, collegesRes, trainingsRes] = await Promise.all([
          getStudents().catch(e => {
            console.error("Failed to fetch students:", e)
            return { data: [], meta: { totalElements: 0 } }
          }),
          getCareers().catch(e => {
            console.error("Failed to fetch careers:", e)
            return { data: [], meta: { totalElements: 0 } }
          }),
          getColleges({ page: 0, size: 1 }).catch(e => {
            console.error("Failed to fetch colleges:", e)
            return { data: [], meta: { totalElements: 0 } }
          }),
          getTrainings().catch(e => {
            console.error("Failed to fetch trainings:", e)
            return { data: [], meta: { totalElements: 0 } }
          }),
        ])
        
        // Use meta.totalElements which comes from the backend count, not array length
        studentsCount = studentsRes?.meta?.totalElements ?? 0
        careersCount = careersRes?.meta?.totalElements ?? 0
        collegesCount = collegesRes?.meta?.totalElements ?? 0
        trainingsCount = trainingsRes?.meta?.totalElements ?? 0
        
        console.log("Fallback counts from meta.totalElements:", {
          students: studentsCount,
          careers: careersCount,
          colleges: collegesCount,
          trainings: trainingsCount,
          collegesMeta: collegesRes?.meta
        })
      }

      logger.debug("Admin Dashboard Stats:", {
        students: studentsCount,
        careers: careersCount,
        colleges: collegesCount,
        trainings: trainingsCount,
        source: statsRes ? "admin_stats" : "entity_lists",
        statsRes,
        growthRes
      })

      console.log("Admin Dashboard Stats fetched:", {
        students: studentsCount,
        careers: careersCount,
        colleges: collegesCount,
        trainings: trainingsCount,
        timestamp: new Date().toISOString()
      })

      setStats({
        students: studentsCount,
        careers: careersCount,
        colleges: collegesCount,
        trainings: trainingsCount,
      })

      // Process growth metrics
      if (Array.isArray(growthRes)) {
        const metricsMap = {}
        growthRes.forEach(metric => {
          metricsMap[metric.entityType] = metric
        })
        setGrowthMetrics(metricsMap)
        console.log("Growth metrics processed:", metricsMap)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      logger.error("Admin dashboard fetch error:", error)
      // Don't reset to 0, keep previous values
      // This way users can see the last known good data
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
      console.log(`Starting polling with interval: ${POLL_INTERVAL}ms`)
      intervalRef.current = setInterval(() => {
        console.log("Polling: Fetching stats...", new Date().toISOString())
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

  const getGrowthIndicator = (entityType) => {
    const metric = growthMetrics[entityType]
    if (!metric) return null

    const growth = metric.growthPercentage
    const direction = metric.growthDirection

    if (direction === "STABLE" || Math.abs(growth) < 0.1) {
      return { icon: Minus, color: "text-muted-foreground", text: "0%" }
    }

    if (direction === "UP") {
      return { icon: TrendingUp, color: "text-success", text: `+${growth.toFixed(1)}%` }
    }

    return { icon: TrendingDown, color: "text-error", text: `${growth.toFixed(1)}%` }
  }

  const statCards = [
    { 
      label: "Students", 
      value: stats.students, 
      icon: Users, 
      color: "bg-primary/10 text-primary",
      entityType: "students"
    },
    { 
      label: "Careers", 
      value: stats.careers, 
      icon: BookOpen, 
      color: "bg-secondary/10 text-secondary",
      entityType: "careers"
    },
    { 
      label: "Colleges", 
      value: stats.colleges, 
      icon: Building2, 
      color: "bg-accent/10 text-accent",
      entityType: "colleges"
    },
    { 
      label: "Trainings", 
      value: stats.trainings, 
      icon: Zap, 
      color: "bg-warning/10 text-warning",
      entityType: "trainings"
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage all platform resources</p>
                <div className="space-y-1">
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {formatLastUpdated(lastUpdated)}
                    </p>
                  )}
                  {error && (
                    <p className="text-xs text-destructive">
                      ⚠️ {error}
                    </p>
                  )}
                  {!error && !loading && (
                    <p className="text-xs text-success">
                      ✓ Data synced
                    </p>
                  )}
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <StatCardSkeleton key={`stat-skeleton-${index}`} />
                ))
              ) : (
                statCards.map((stat) => {
                  const Icon = stat.icon
                  const growth = getGrowthIndicator(stat.entityType)
                  const GrowthIcon = growth?.icon

                  return (
                    <Card key={stat.label} className="border-2">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline justify-between">
                          <div className="text-3xl font-bold">{stat.value}</div>
                          {growth && GrowthIcon && (
                            <div className={cn("flex items-center gap-1 text-xs font-medium", growth.color)}>
                              <GrowthIcon className="h-3 w-3" />
                              <span>{growth.text}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Total {stat.label.toLowerCase()}</p>
                        {growth && (
                          <p className="text-xs text-muted-foreground mt-1">vs last week</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PendingItemsCounter />
              <QuickActions />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivityFeed />
              <SystemHealth />
            </div>

            <TrendCharts />

            <UserEngagement />
    </div>
  )
}
