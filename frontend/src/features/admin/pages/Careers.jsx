import { useEffect, useState } from "react"
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
import { getCareers, deleteCareer, createCareer, updateCareer } from "@/shared/lib/api"
import { Trash2, Plus, Pencil, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"

export default function AdminCareersPage() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [careerToDelete, setCareerToDelete] = useState(null)
  const [editingCareer, setEditingCareer] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    outlook: "",
    salaryRange: "",
    requiredSkills: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    setLoading(true)
    try {
      const response = await getCareers()
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

  const handleDeleteClick = (career) => {
    setCareerToDelete(career)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!careerToDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteCareer(careerToDelete.id)
      await fetchCareers()
      toast.success("Career deleted successfully.")
    } catch (error) {
      console.error("Failed to delete career:", error)
      toast.error("Failed to delete career. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCareerToDelete(null)
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
      resetForm()
      fetchCareers()
    } catch (error) {
      console.error("Failed to create career:", error)
      toast.error(error.message || "Failed to create career. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (career) => {
    setEditingCareer(career)
    setFormData({
      name: career.name || career.title || "",
      description: career.description || "",
      outlook: career.outlook || "",
      salaryRange: career.salaryRange || career.salary_range || "",
      requiredSkills: Array.isArray(career.requiredSkills) ? career.requiredSkills.join(", ") : (career.requiredSkills || ""),
    })
    setIsEditDialogOpen(true)
  }

  const handleEditCareer = async (e) => {
    e.preventDefault()
    if (!editingCareer) return
    setIsSubmitting(true)
    try {
      const careerData = {
        name: formData.name,
        description: formData.description || null,
        outlook: formData.outlook || null,
        salaryRange: formData.salaryRange || null,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s) : null,
      }
      await updateCareer(editingCareer.id, careerData)
      toast.success("Career updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchCareers()
    } catch (error) {
      console.error("Failed to update career:", error)
      toast.error(error.message || "Failed to update career. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      outlook: "",
      salaryRange: "",
      requiredSkills: "",
    })
    setEditingCareer(null)
  }

  const filteredCareers = careers.filter((career) =>
    (career.name || career.title)?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filteredCareers.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCareers = filteredCareers.slice(startIndex, endIndex)
  const deletingId = isDeleting ? careerToDelete?.id : null

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  return (
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
                {!loading && filteredCareers.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredCareers.length)} of {filteredCareers.length}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-busy={loading}>
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Salary Range</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRowSkeleton key={`career-skeleton-${index}`} columns={4} />
                        ))
                      ) : filteredCareers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            No careers found
                          </td>
                        </tr>
                      ) : (
                        paginatedCareers.map((career) => {
                          const isRowDeleting = deletingId === career.id
                          return (
                            <tr
                              key={career.id}
                              className={`border-b transition-opacity ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50"}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4 font-medium">{career.name || career.title || "N/A"}</td>
                              <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                                {career.description?.substring(0, 50) || "N/A"}{career.description?.length > 50 ? "..." : ""}
                              </td>
                              <td className="py-3 px-4">{career.salaryRange || career.salary_range || "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(career)}
                                  className="text-muted-foreground hover:text-foreground"
                                  disabled={isDeleting}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(career)}
                                  className="text-destructive hover:text-destructive"
                                  disabled={isDeleting}
                                >
                                  {isRowDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {!loading && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={loading}
                  />
                )}
              </CardContent>
            </Card>

            {/* Add Career Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
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

            {/* Edit Career Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Career</DialogTitle>
                  <DialogDescription>
                    Update career information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditCareer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Career Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter career name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter career description"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-outlook">Career Outlook</Label>
                    <Textarea
                      id="edit-outlook"
                      value={formData.outlook}
                      onChange={(e) => setFormData({ ...formData, outlook: e.target.value })}
                      placeholder="Enter career outlook and future prospects"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryRange">Salary Range</Label>
                    <Input
                      id="edit-salaryRange"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="e.g., $50,000 - $100,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-requiredSkills">Required Skills</Label>
                    <Input
                      id="edit-requiredSkills"
                      value={formData.requiredSkills}
                      onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                      placeholder="Comma-separated (e.g., Python, JavaScript, Communication)"
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
                  <AlertDialogTitle>Delete Career</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{careerToDelete?.name || careerToDelete?.title}</strong>?
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
  )
}
