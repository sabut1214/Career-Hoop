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
import { getCareers, deleteCareer, createCareer } from "@/shared/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminCareersPage() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    outlook: "",
    salaryRange: "",
    requiredSkills: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleAddCareer = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const careerData = {
        name: formData.name,
        description: formData.description || null,
        outlook: formData.outlook || null,
        salaryRange: formData.salaryRange || null,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s) : null,
      }
      await createCareer(careerData)
      toast.success("Career created successfully.")
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        outlook: "",
        salaryRange: "",
        requiredSkills: "",
      })
      fetchCareers()
    } catch (error) {
      console.error("Failed to create career:", error)
      toast.error(error.message || "Failed to create career. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCareers = careers.filter((career) => 
    (career.name || career.title)?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
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
                            <td className="py-3 px-4 font-medium">{career.name || career.title || "N/A"}</td>
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Career</DialogTitle>
                  <DialogDescription>
                    Create a new career path. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCareer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Career Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter career name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter career description"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outlook">Career Outlook</Label>
                    <Textarea
                      id="outlook"
                      value={formData.outlook}
                      onChange={(e) => setFormData({ ...formData, outlook: e.target.value })}
                      placeholder="Enter career outlook and future prospects"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryRange">Salary Range</Label>
                    <Input
                      id="salaryRange"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="e.g., $50,000 - $100,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills</Label>
                    <Input
                      id="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                      placeholder="Comma-separated (e.g., Python, JavaScript, Communication)"
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
                      {isSubmitting ? "Creating..." : "Create Career"}
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

