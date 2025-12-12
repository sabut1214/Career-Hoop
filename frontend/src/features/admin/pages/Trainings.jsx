import { useEffect, useState } from "react"
import { AdminSidebar } from "@/features/admin/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { getTrainings, deleteTraining, createTraining } from "@/shared/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "",
    duration: "",
    level: "",
    skills: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleAddTraining = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const trainingData = {
        title: formData.title,
        description: formData.description || null,
        provider: formData.provider || null,
        duration: formData.duration || null,
        level: formData.level || null,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(s => s) : null,
      }
      await createTraining(trainingData)
      toast.success("Training created successfully.")
      setIsAddDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        provider: "",
        duration: "",
        level: "",
        skills: "",
      })
      fetchTrainings()
    } catch (error) {
      console.error("Failed to create training:", error)
      toast.error(error.message || "Failed to create training. Please try again.")
    } finally {
      setIsSubmitting(false)
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
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Training</DialogTitle>
                  <DialogDescription>
                    Create a new training program. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTraining} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Training Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter training title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter training description"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="Enter provider name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 4 weeks, 8 hours"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Input
                        id="level"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="e.g., Beginner, Intermediate, Advanced"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="Comma-separated (e.g., Python, JavaScript)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Training"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

