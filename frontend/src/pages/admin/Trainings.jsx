import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTrainings, deleteTraining } from "@/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "react-toastify"

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTrainings()
  }, [])

  const fetchTrainings = async () => {
    try {
      const response = await getTrainings()
      // Handle different response structures
      const trainingsData = Array.isArray(response) ? response : (response.data || [])
      setTrainings(trainingsData)
    } catch (error) {
      console.error("Failed to fetch trainings:", error)
      toast.error("Failed to fetch trainings. Please try again.")
      setTrainings([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this training?")) {
      try {
        await deleteTraining(id)
        setTrainings(trainings.filter((t) => t.id !== id))
        toast.success("Training deleted successfully.")
      } catch (error) {
        console.error("Failed to delete training:", error)
        toast.error("Failed to delete training. Please try again.")
      }
    }
  }

  const filteredTrainings = trainings.filter((training) =>
    training.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Trainings</h1>
                <p className="text-muted-foreground mt-1">Manage training programs</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Training
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Trainings</CardTitle>
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
                <CardTitle>All Trainings ({filteredTrainings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredTrainings.length === 0 ? (
                  <p className="text-muted-foreground">No trainings found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Title</th>
                          <th className="text-left py-3 px-4 font-semibold">Duration</th>
                          <th className="text-left py-3 px-4 font-semibold">Provider</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrainings.map((training) => (
                          <tr key={training.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{training.title || "N/A"}</td>
                            <td className="py-3 px-4">{training.duration || "N/A"}</td>
                            <td className="py-3 px-4">{training.provider || "N/A"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(training.id)}
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

