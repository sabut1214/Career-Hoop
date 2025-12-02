import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Building2, Users2, Gift, Zap } from "lucide-react"
import { getStudents, getCareers, getColleges, getMentors, getScholarships, getTrainings } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    careers: 0,
    colleges: 0,
    mentors: 0,
    scholarships: 0,
    trainings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, careersRes, collegesRes, mentorsRes, scholarshipsRes, trainingsRes] = await Promise.all([
          getStudents(),
          getCareers(),
          getColleges(),
          getMentors(),
          getScholarships(),
          getTrainings(),
        ])

        setStats({
          students: studentsRes.data?.length || 0,
          careers: careersRes.data?.length || 0,
          colleges: collegesRes.data?.length || 0,
          mentors: mentorsRes.data?.length || 0,
          scholarships: scholarshipsRes.data?.length || 0,
          trainings: trainingsRes.data?.length || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: "Students", value: stats.students, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Careers", value: stats.careers, icon: BookOpen, color: "bg-green-100 text-green-600" },
    { label: "Colleges", value: stats.colleges, icon: Building2, color: "bg-purple-100 text-purple-600" },
    { label: "Mentors", value: stats.mentors, icon: Users2, color: "bg-orange-100 text-orange-600" },
    { label: "Scholarships", value: stats.scholarships, icon: Gift, color: "bg-pink-100 text-pink-600" },
    { label: "Trainings", value: stats.trainings, icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage all platform resources</p>
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
