import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCareers, deleteCareer } from "@/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "react-toastify"

export default function AdminCareersPage() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    try {
      const response = await getCareers()
      // Handle different response structures
      const careersData = Array.isArray(response) ? response : (response.data || [])
      setCareers(careersData)
    } catch (error) {
      console.error("Failed to fetch careers:", error)
      toast.error("Failed to fetch careers. Please try again.")
      setCareers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this career?")) {
      try {
        await deleteCareer(id)
        setCareers(careers.filter((c) => c.id !== id))
        toast.success("Career deleted successfully.")
      } catch (error) {
        console.error("Failed to delete career:", error)
        toast.error("Failed to delete career. Please try again.")
      }
    }
  }

  const filteredCareers = careers.filter((career) => career.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Careers</h1>
                <p className="text-muted-foreground mt-1">Manage career paths</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Career
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Careers</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Careers ({filteredCareers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredCareers.length === 0 ? (
                  <p className="text-muted-foreground">No careers found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Title</th>
                          <th className="text-left py-3 px-4 font-semibold">Description</th>
                          <th className="text-left py-3 px-4 font-semibold">Salary Range</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCareers.map((career) => (
                          <tr key={career.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{career.title || "N/A"}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {career.description?.substring(0, 50) || "N/A"}...
                            </td>
                            <td className="py-3 px-4">{career.salary_range || "N/A"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(career.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

