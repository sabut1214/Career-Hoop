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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { getColleges, deleteCollege, createCollege, updateCollege } from "@/shared/lib/api"
import { Trash2, Plus, Pencil } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [collegeToDelete, setCollegeToDelete] = useState(null)
  const [editingCollege, setEditingCollege] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    affiliation: "",
    establishedYear: "",
    overview: "",
    type: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    try {
      const response = await getColleges()
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

  const handleDeleteClick = (college) => {
    setCollegeToDelete(college)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!collegeToDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteCollege(collegeToDelete.id)
      setColleges(colleges.filter((c) => c.id !== collegeToDelete.id))
      toast.success("College deleted successfully.")
    } catch (error) {
      console.error("Failed to delete college:", error)
      toast.error("Failed to delete college. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCollegeToDelete(null)
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
      resetForm()
      fetchColleges()
    } catch (error) {
      console.error("Failed to create college:", error)
      toast.error(error.message || "Failed to create college. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (college) => {
    setEditingCollege(college)
    setFormData({
      name: college.name || "",
      location: college.location || "",
      affiliation: college.affiliation || "",
      establishedYear: college.establishedYear?.toString() || "",
      overview: college.overview || "",
      type: college.type || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditCollege = async (e) => {
    e.preventDefault()
    if (!editingCollege) return
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
      await updateCollege(editingCollege.id, collegeData)
      toast.success("College updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchColleges()
    } catch (error) {
      console.error("Failed to update college:", error)
      toast.error(error.message || "Failed to update college. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      affiliation: "",
      establishedYear: "",
      overview: "",
      type: "",
    })
    setEditingCollege(null)
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
                          <th className="text-left py-3 px-4 font-semibold">Type</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredColleges.map((college) => (
                          <tr key={college.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{college.name || "N/A"}</td>
                            <td className="py-3 px-4">{college.location || "N/A"}</td>
                            <td className="py-3 px-4">{college.type || "N/A"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(college)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(college)}
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

            {/* Add College Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
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

            {/* Edit College Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit College</DialogTitle>
                  <DialogDescription>
                    Update college information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditCollege} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">College Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter college name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-affiliation">Affiliation</Label>
                      <Input
                        id="edit-affiliation"
                        value={formData.affiliation}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                        placeholder="Enter affiliation"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-establishedYear">Established Year</Label>
                      <Input
                        id="edit-establishedYear"
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                        placeholder="e.g., 1950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type</Label>
                      <Input
                        id="edit-type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Public, Private"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-overview">Overview</Label>
                    <Textarea
                      id="edit-overview"
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
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete College</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{collegeToDelete?.name}</strong>?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
