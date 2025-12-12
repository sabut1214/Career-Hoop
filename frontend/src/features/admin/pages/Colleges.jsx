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
import { getColleges, deleteCollege, createCollege } from "@/shared/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    affiliation: "",
    establishedYear: "",
    overview: "",
    type: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleAddCollege = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const collegeData = {
        name: formData.name,
        location: formData.location || null,
        affiliation: formData.affiliation || null,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : null,
        overview: formData.overview || null,
        type: formData.type || null,
      }
      await createCollege(collegeData)
      toast.success("College created successfully.")
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        location: "",
        affiliation: "",
        establishedYear: "",
        overview: "",
        type: "",
      })
      fetchColleges()
    } catch (error) {
      console.error("Failed to create college:", error)
      toast.error(error.message || "Failed to create college. Please try again.")
    } finally {
      setIsSubmitting(false)
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
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New College</DialogTitle>
                  <DialogDescription>
                    Create a new college entry. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCollege} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">College Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter college name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <Input
                        id="affiliation"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                        placeholder="Enter affiliation"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="establishedYear">Established Year</Label>
                      <Input
                        id="establishedYear"
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                        placeholder="e.g., 1950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Public, Private"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overview">Overview</Label>
                    <Textarea
                      id="overview"
                      value={formData.overview}
                      onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                      placeholder="Enter college overview"
                      rows={4}
                    />
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
                      {isSubmitting ? "Creating..." : "Create College"}
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

