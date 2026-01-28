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
import { getCareers, getCareer, deleteCareer, createCareer, updateCareer } from "@/shared/lib/api"
import { Trash2, Plus, Pencil, Loader2, BookOpen } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"

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
  const [formErrors, setFormErrors] = useState({})
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
      toast.error(getUserFriendlyError(error, "Unable to load careers. Please refresh the page."))
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
      toast.error(getUserFriendlyError(error, "Could not delete career. It may be in use elsewhere."))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCareerToDelete(null)
    }
  }

  const validateCareerForm = () => {
    const errors = {}
    
    // Validate name - must be meaningful (at least 2 characters, contain letters)
    const nameTrimmed = formData.name?.trim() || ""
    if (!nameTrimmed) {
      errors.name = "Career name is required"
    } else if (nameTrimmed.length < 2) {
      errors.name = "Career name must be at least 2 characters"
    } else if (nameTrimmed.length > 200) {
      errors.name = "Career name must be less than 200 characters"
    } else if (!/[a-zA-Z]/.test(nameTrimmed)) {
      errors.name = "Career name must contain at least one letter"
    } else if (/^[^a-zA-Z0-9]+$/.test(nameTrimmed)) {
      errors.name = "Career name cannot be only special characters"
    }
    
    // Validate description if provided
    if (formData.description && formData.description.trim()) {
      const descTrimmed = formData.description.trim()
      if (descTrimmed.length < 10) {
        errors.description = "Description must be at least 10 characters"
      } else if (descTrimmed.length > 2000) {
        errors.description = "Description must be less than 2000 characters"
      }
    }
    
    // Validate outlook if provided
    if (formData.outlook && formData.outlook.trim()) {
      const outlookTrimmed = formData.outlook.trim()
      if (outlookTrimmed.length < 10) {
        errors.outlook = "Career outlook must be at least 10 characters"
      } else if (outlookTrimmed.length > 2000) {
        errors.outlook = "Career outlook must be less than 2000 characters"
      }
    }
    
    // Validate salary range if provided
    if (formData.salaryRange && formData.salaryRange.trim()) {
      const salaryTrimmed = formData.salaryRange.trim()
      if (salaryTrimmed.length > 100) {
        errors.salaryRange = "Salary range must be less than 100 characters"
      } else if (!/^[\d\s,\-$.€£¥₹NPR]+$/.test(salaryTrimmed)) {
        errors.salaryRange = "Salary range contains invalid characters"
      }
    }
    
    // Validate required skills if provided
    if (formData.requiredSkills && formData.requiredSkills.trim()) {
      const skillsTrimmed = formData.requiredSkills.trim()
      const skillsArray = skillsTrimmed.split(",").map(s => s.trim()).filter(s => s)
      if (skillsArray.length === 0) {
        errors.requiredSkills = "Please enter at least one skill"
      } else if (skillsArray.length > 20) {
        errors.requiredSkills = "Maximum 20 skills allowed"
      } else {
        // Validate each skill
        for (const skill of skillsArray) {
          if (skill.length < 2) {
            errors.requiredSkills = "Each skill must be at least 2 characters"
            break
          } else if (skill.length > 50) {
            errors.requiredSkills = "Each skill must be less than 50 characters"
            break
          } else if (!/^[a-zA-Z0-9\s\-_&]+$/.test(skill)) {
            errors.requiredSkills = "Skills can only contain letters, numbers, spaces, hyphens, underscores, and ampersands"
            break
          }
        }
      }
    }
    
    return errors
  }

  const handleAddCareer = async (e) => {
    e.preventDefault()
    
    const errors = validateCareerForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }
    
    setIsSubmitting(true)
    try {
      const careerData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        outlook: formData.outlook?.trim() || null,
        salaryRange: formData.salaryRange?.trim() || null,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s) : null,
      }
      await createCareer(careerData)
      toast.success("Career created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      setFormErrors({})
      fetchCareers()
    } catch (error) {
      console.error("Failed to create career:", error)
      toast.error(getUserFriendlyError(error, "Could not create career. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = async (career) => {
    try {
      // Fetch full career data by ID to ensure all fields are populated
      const fullCareer = await getCareer(career.id)
      setEditingCareer(fullCareer)
      setFormData({
        name: fullCareer.name || fullCareer.title || "",
        description: fullCareer.description || "",
        outlook: fullCareer.outlook || "",
        salaryRange: fullCareer.salaryRange || fullCareer.salary_range || "",
        requiredSkills: Array.isArray(fullCareer.requiredSkills) ? fullCareer.requiredSkills.join(", ") : (fullCareer.requiredSkills || ""),
      })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch career details:", error)
      toast.error(getUserFriendlyError(error, "Could not load career details. Please try again."))
      // Fallback to using the career from the list
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
  }

  const handleEditCareer = async (e) => {
    e.preventDefault()
    if (!editingCareer) return
    
    const errors = validateCareerForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }
    
    setIsSubmitting(true)
    try {
      const careerData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        outlook: formData.outlook?.trim() || null,
        salaryRange: formData.salaryRange?.trim() || null,
        requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s) : null,
      }
      await updateCareer(editingCareer.id, careerData)
      toast.success("Career updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      setFormErrors({})
      fetchCareers()
    } catch (error) {
      console.error("Failed to update career:", error)
      toast.error(getUserFriendlyError(error, "Could not update career. Please check your input and try again."))
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
    setFormErrors({})
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
                          <td colSpan={4} className="p-0">
                            <EmptyState
                              icon={BookOpen}
                              title="No Careers Found"
                              description={searchTerm ? `No careers match "${searchTerm}". Try adjusting your search.` : "Get started by adding your first career."}
                              action={searchTerm ? {
                                label: "Clear Search",
                                onClick: () => setSearchTerm(""),
                                variant: "secondary"
                              } : {
                                label: "Add Career",
                                onClick: () => setIsAddDialogOpen(true),
                                variant: "default"
                              }}
                            />
                          </td>
                        </tr>
                      ) : (
                        paginatedCareers.map((career) => {
                          const isRowDeleting = deletingId === career.id
                          return (
                            <tr
                              key={career.id}
                              className={`border-b transition-colors ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50 cursor-pointer"}`}
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
                                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Edit ${career.name || career.title || "career"}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(career)}
                                  className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Delete ${career.name || career.title || "career"}`}
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" })
                      }}
                      className={formErrors.name ? "border-destructive" : ""}
                      required
                      placeholder="Enter career name"
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (formErrors.description) setFormErrors({ ...formErrors, description: "" })
                      }}
                      className={formErrors.description ? "border-destructive" : ""}
                      placeholder="Enter career description (10-2000 characters)"
                      rows={4}
                    />
                    {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outlook">Career Outlook</Label>
                    <Textarea
                      id="outlook"
                      value={formData.outlook}
                      onChange={(e) => {
                        setFormData({ ...formData, outlook: e.target.value })
                        if (formErrors.outlook) setFormErrors({ ...formErrors, outlook: "" })
                      }}
                      className={formErrors.outlook ? "border-destructive" : ""}
                      placeholder="Enter career outlook and future prospects (10-2000 characters)"
                      rows={3}
                    />
                    {formErrors.outlook && <p className="text-sm text-destructive">{formErrors.outlook}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryRange">Salary Range</Label>
                    <Input
                      id="salaryRange"
                      value={formData.salaryRange}
                      onChange={(e) => {
                        setFormData({ ...formData, salaryRange: e.target.value })
                        if (formErrors.salaryRange) setFormErrors({ ...formErrors, salaryRange: "" })
                      }}
                      className={formErrors.salaryRange ? "border-destructive" : ""}
                      placeholder="e.g., $50,000 - $100,000 or NPR 50,000 - NPR 100,000"
                    />
                    {formErrors.salaryRange && <p className="text-sm text-destructive">{formErrors.salaryRange}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requiredSkills">Required Skills</Label>
                    <Input
                      id="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={(e) => {
                        setFormData({ ...formData, requiredSkills: e.target.value })
                        if (formErrors.requiredSkills) setFormErrors({ ...formErrors, requiredSkills: "" })
                      }}
                      className={formErrors.requiredSkills ? "border-destructive" : ""}
                      placeholder="Comma-separated (e.g., Python, JavaScript, Communication)"
                    />
                    {formErrors.requiredSkills && <p className="text-sm text-destructive">{formErrors.requiredSkills}</p>}
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" })
                      }}
                      className={formErrors.name ? "border-destructive" : ""}
                      required
                      placeholder="Enter career name"
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (formErrors.description) setFormErrors({ ...formErrors, description: "" })
                      }}
                      className={formErrors.description ? "border-destructive" : ""}
                      placeholder="Enter career description (10-2000 characters)"
                      rows={4}
                    />
                    {formErrors.description && <p className="text-sm text-destructive">{formErrors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-outlook">Career Outlook</Label>
                    <Textarea
                      id="edit-outlook"
                      value={formData.outlook}
                      onChange={(e) => {
                        setFormData({ ...formData, outlook: e.target.value })
                        if (formErrors.outlook) setFormErrors({ ...formErrors, outlook: "" })
                      }}
                      className={formErrors.outlook ? "border-destructive" : ""}
                      placeholder="Enter career outlook and future prospects (10-2000 characters)"
                      rows={3}
                    />
                    {formErrors.outlook && <p className="text-sm text-destructive">{formErrors.outlook}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryRange">Salary Range</Label>
                    <Input
                      id="edit-salaryRange"
                      value={formData.salaryRange}
                      onChange={(e) => {
                        setFormData({ ...formData, salaryRange: e.target.value })
                        if (formErrors.salaryRange) setFormErrors({ ...formErrors, salaryRange: "" })
                      }}
                      className={formErrors.salaryRange ? "border-destructive" : ""}
                      placeholder="e.g., $50,000 - $100,000 or NPR 50,000 - NPR 100,000"
                    />
                    {formErrors.salaryRange && <p className="text-sm text-destructive">{formErrors.salaryRange}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-requiredSkills">Required Skills</Label>
                    <Input
                      id="edit-requiredSkills"
                      value={formData.requiredSkills}
                      onChange={(e) => {
                        setFormData({ ...formData, requiredSkills: e.target.value })
                        if (formErrors.requiredSkills) setFormErrors({ ...formErrors, requiredSkills: "" })
                      }}
                      className={formErrors.requiredSkills ? "border-destructive" : ""}
                      placeholder="Comma-separated (e.g., Python, JavaScript, Communication)"
                    />
                    {formErrors.requiredSkills && <p className="text-sm text-destructive">{formErrors.requiredSkills}</p>}
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
