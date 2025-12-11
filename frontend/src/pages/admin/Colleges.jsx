import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getColleges, deleteCollege } from "@/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "react-toastify"

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    try {
      const response = await getColleges()
      // Handle different response structures (direct array or { data: [...] })
      const collegesData = Array.isArray(response) ? response : (response.data || [])
      setColleges(collegesData)
    } catch (error) {
      console.error("Failed to fetch colleges:", error)
      toast.error("Failed to fetch colleges. Please try again.")
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this college?")) {
      try {
        await deleteCollege(id)
        setColleges(colleges.filter((c) => c.id !== id))
        toast.success("College deleted successfully.")
      } catch (error) {
        console.error("Failed to delete college:", error)
        toast.error("Failed to delete college. Please try again.")
      }
    }
  }

  const filteredColleges = colleges.filter((college) => college.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Colleges</h1>
                <p className="text-muted-foreground mt-1">Manage college information</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add College
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Colleges ({filteredColleges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredColleges.length === 0 ? (
                  <p className="text-muted-foreground">No colleges found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Location</th>
                          <th className="text-left py-3 px-4 font-semibold">Ranking</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredColleges.map((college) => (
                          <tr key={college.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{college.name || "N/A"}</td>
                            <td className="py-3 px-4">{college.location || "N/A"}</td>
                            <td className="py-3 px-4">{college.ranking || "N/A"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(college.id)}
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

