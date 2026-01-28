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
import { getColleges, getCollege, deleteCollege, createCollege, updateCollege } from "@/shared/lib/api"
import { Trash2, Plus, Pencil, Loader2, Building2 } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
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
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchColleges()
  }, [])

  const fetchColleges = async () => {
    setLoading(true)
    try {
      const response = await getColleges()
      const collegesData = Array.isArray(response) ? response : (response.data || [])
      setColleges(collegesData)
    } catch (error) {
      console.error("Failed to fetch colleges:", error)
      toast.error(getUserFriendlyError(error, "Unable to load colleges. Please refresh the page."))
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
      await fetchColleges()
      toast.success("College deleted successfully.")
    } catch (error) {
      console.error("Failed to delete college:", error)
      toast.error(getUserFriendlyError(error, "Could not delete college. It may be in use elsewhere."))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCollegeToDelete(null)
    }
  }

  const validateCollegeForm = () => {
    const errors = {}
    
    // Validate name - must be meaningful (at least 2 characters, contain letters)
    const nameTrimmed = formData.name?.trim() || ""
    if (!nameTrimmed) {
      errors.name = "College name is required"
    } else if (nameTrimmed.length < 2) {
      errors.name = "College name must be at least 2 characters"
    } else if (nameTrimmed.length > 200) {
      errors.name = "College name must be less than 200 characters"
    } else if (!/[a-zA-Z]/.test(nameTrimmed)) {
      errors.name = "College name must contain at least one letter"
    } else if (/^[^a-zA-Z0-9]+$/.test(nameTrimmed)) {
      errors.name = "College name cannot be only special characters"
    }
    
    // Validate location if provided
    if (formData.location && formData.location.trim()) {
      const locationTrimmed = formData.location.trim()
      if (locationTrimmed.length < 2) {
        errors.location = "Location must be at least 2 characters"
      } else if (locationTrimmed.length > 200) {
        errors.location = "Location must be less than 200 characters"
      } else if (!/[a-zA-Z]/.test(locationTrimmed)) {
        errors.location = "Location must contain at least one letter"
      }
    }
    
    // Validate affiliation if provided
    if (formData.affiliation && formData.affiliation.trim()) {
      const affiliationTrimmed = formData.affiliation.trim()
      if (affiliationTrimmed.length < 2) {
        errors.affiliation = "Affiliation must be at least 2 characters"
      } else if (affiliationTrimmed.length > 200) {
        errors.affiliation = "Affiliation must be less than 200 characters"
      } else if (!/[a-zA-Z]/.test(affiliationTrimmed)) {
        errors.affiliation = "Affiliation must contain at least one letter"
      }
    }
    
    // Validate type if provided
    if (formData.type && formData.type.trim()) {
      const typeTrimmed = formData.type.trim()
      if (typeTrimmed.length < 2) {
        errors.type = "Type must be at least 2 characters"
      } else if (typeTrimmed.length > 100) {
        errors.type = "Type must be less than 100 characters"
      } else if (!/[a-zA-Z]/.test(typeTrimmed)) {
        errors.type = "Type must contain at least one letter"
      }
    }
    
    // Validate established year if provided
    if (formData.establishedYear) {
      const yearStr = formData.establishedYear.toString().trim()
      if (yearStr) {
        const year = parseInt(yearStr)
        const currentYear = new Date().getFullYear()
        if (isNaN(year) || year < 1000 || year > currentYear) {
          errors.establishedYear = "Please enter a valid year (1000 to " + currentYear + "). Future years are not allowed."
        }
      }
    }
    
    // Validate overview if provided
    if (formData.overview && formData.overview.trim()) {
      const overviewTrimmed = formData.overview.trim()
      if (overviewTrimmed.length < 10) {
        errors.overview = "Overview must be at least 10 characters"
      } else if (overviewTrimmed.length > 5000) {
        errors.overview = "Overview must be less than 5000 characters"
      }
    }
    
    return errors
  }

  const handleAddCollege = async (e) => {
    e.preventDefault()
    
    const errors = validateCollegeForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }
    
    setIsSubmitting(true)
    try {
      const collegeData = {
        name: formData.name.trim(),
        location: formData.location?.trim() || null,
        affiliation: formData.affiliation?.trim() || null,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : null,
        overview: formData.overview?.trim() || null,
        type: formData.type?.trim() || null,
      }
      await createCollege(collegeData)
      toast.success("College created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      setFormErrors({})
      fetchColleges()
    } catch (error) {
      console.error("Failed to create college:", error)
      toast.error(getUserFriendlyError(error, "Could not create college. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = async (college) => {
    try {
      // Fetch full college data by ID to ensure all fields are populated
      const fullCollege = await getCollege(college.id)
      setEditingCollege(fullCollege)
      setFormData({
        name: fullCollege.name || "",
        location: fullCollege.location || "",
        affiliation: fullCollege.affiliation || "",
        establishedYear: fullCollege.establishedYear?.toString() || "",
        overview: fullCollege.overview || "",
        type: fullCollege.type || "",
      })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch college details:", error)
      toast.error(getUserFriendlyError(error, "Could not load college details. Please try again."))
      // Fallback to using the college from the list
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
  }

  const handleEditCollege = async (e) => {
    e.preventDefault()
    if (!editingCollege) return
    
    const errors = validateCollegeForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      // Show first error in toast
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }
    
    setIsSubmitting(true)
    try {
      const collegeData = {
        name: formData.name.trim(),
        location: formData.location?.trim() || null,
        affiliation: formData.affiliation?.trim() || null,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : null,
        overview: formData.overview?.trim() || null,
        type: formData.type?.trim() || null,
      }
      await updateCollege(editingCollege.id, collegeData)
      toast.success("College updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      setFormErrors({})
      fetchColleges()
    } catch (error) {
      console.error("Failed to update college:", error)
      toast.error(getUserFriendlyError(error, "Could not update college. Please check your input and try again."))
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
    setFormErrors({})
    setEditingCollege(null)
  }

  const filteredColleges = colleges.filter((college) => college.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filteredColleges.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedColleges = filteredColleges.slice(startIndex, endIndex)
  const deletingId = isDeleting ? collegeToDelete?.id : null

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
                {!loading && filteredColleges.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredColleges.length)} of {filteredColleges.length}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-busy={loading}>
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Location</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRowSkeleton key={`college-skeleton-${index}`} columns={4} />
                        ))
                      ) : filteredColleges.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <EmptyState
                              icon={Building2}
                              title="No Colleges Found"
                              description={searchTerm ? `No colleges match "${searchTerm}". Try adjusting your search.` : "Get started by adding your first college."}
                              action={searchTerm ? {
                                label: "Clear Search",
                                onClick: () => setSearchTerm(""),
                                variant: "secondary"
                              } : {
                                label: "Add College",
                                onClick: () => setIsAddDialogOpen(true),
                                variant: "default"
                              }}
                            />
                          </td>
                        </tr>
                      ) : (
                        paginatedColleges.map((college) => {
                          const isRowDeleting = deletingId === college.id
                          return (
                            <tr
                              key={college.id}
                              className={`border-b transition-colors ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50 cursor-pointer"}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4 font-medium">{college.name || "N/A"}</td>
                              <td className="py-3 px-4">{college.location || "N/A"}</td>
                              <td className="py-3 px-4">{college.type || "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(college)}
                                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Edit ${college.name || "college"}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(college)}
                                  className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Delete ${college.name || "college"}`}
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" })
                      }}
                      className={formErrors.name ? "border-destructive" : ""}
                      required
                      placeholder="Enter college name"
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value })
                          if (formErrors.location) setFormErrors({ ...formErrors, location: "" })
                        }}
                        className={formErrors.location ? "border-destructive" : ""}
                        placeholder="Enter location"
                      />
                      {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <Input
                        id="affiliation"
                        value={formData.affiliation}
                        onChange={(e) => {
                          setFormData({ ...formData, affiliation: e.target.value })
                          if (formErrors.affiliation) setFormErrors({ ...formErrors, affiliation: "" })
                        }}
                        className={formErrors.affiliation ? "border-destructive" : ""}
                        placeholder="Enter affiliation"
                      />
                      {formErrors.affiliation && <p className="text-sm text-destructive">{formErrors.affiliation}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="establishedYear">Established Year</Label>
                      <Input
                        id="establishedYear"
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => {
                          setFormData({ ...formData, establishedYear: e.target.value })
                          if (formErrors.establishedYear) setFormErrors({ ...formErrors, establishedYear: "" })
                        }}
                        className={formErrors.establishedYear ? "border-destructive" : ""}
                        placeholder="e.g., 1950"
                      />
                      {formErrors.establishedYear && <p className="text-sm text-destructive">{formErrors.establishedYear}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Input
                        id="type"
                        value={formData.type}
                        onChange={(e) => {
                          setFormData({ ...formData, type: e.target.value })
                          if (formErrors.type) setFormErrors({ ...formErrors, type: "" })
                        }}
                        className={formErrors.type ? "border-destructive" : ""}
                        placeholder="e.g., Public, Private"
                      />
                      {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overview">Overview</Label>
                    <Textarea
                      id="overview"
                      value={formData.overview}
                      onChange={(e) => {
                        setFormData({ ...formData, overview: e.target.value })
                        if (formErrors.overview) setFormErrors({ ...formErrors, overview: "" })
                      }}
                      className={formErrors.overview ? "border-destructive" : ""}
                      placeholder="Enter college overview (10-5000 characters)"
                      rows={4}
                    />
                    {formErrors.overview && <p className="text-sm text-destructive">{formErrors.overview}</p>}
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
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name) setFormErrors({ ...formErrors, name: "" })
                      }}
                      className={formErrors.name ? "border-destructive" : ""}
                      required
                      placeholder="Enter college name"
                    />
                    {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value })
                          if (formErrors.location) setFormErrors({ ...formErrors, location: "" })
                        }}
                        className={formErrors.location ? "border-destructive" : ""}
                        placeholder="Enter location"
                      />
                      {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-affiliation">Affiliation</Label>
                      <Input
                        id="edit-affiliation"
                        value={formData.affiliation}
                        onChange={(e) => {
                          setFormData({ ...formData, affiliation: e.target.value })
                          if (formErrors.affiliation) setFormErrors({ ...formErrors, affiliation: "" })
                        }}
                        className={formErrors.affiliation ? "border-destructive" : ""}
                        placeholder="Enter affiliation"
                      />
                      {formErrors.affiliation && <p className="text-sm text-destructive">{formErrors.affiliation}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-establishedYear">Established Year</Label>
                      <Input
                        id="edit-establishedYear"
                        type="number"
                        value={formData.establishedYear}
                        onChange={(e) => {
                          setFormData({ ...formData, establishedYear: e.target.value })
                          if (formErrors.establishedYear) setFormErrors({ ...formErrors, establishedYear: "" })
                        }}
                        className={formErrors.establishedYear ? "border-destructive" : ""}
                        placeholder="e.g., 1950"
                      />
                      {formErrors.establishedYear && <p className="text-sm text-destructive">{formErrors.establishedYear}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Type</Label>
                      <Input
                        id="edit-type"
                        value={formData.type}
                        onChange={(e) => {
                          setFormData({ ...formData, type: e.target.value })
                          if (formErrors.type) setFormErrors({ ...formErrors, type: "" })
                        }}
                        className={formErrors.type ? "border-destructive" : ""}
                        placeholder="e.g., Public, Private"
                      />
                      {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-overview">Overview</Label>
                    <Textarea
                      id="edit-overview"
                      value={formData.overview}
                      onChange={(e) => {
                        setFormData({ ...formData, overview: e.target.value })
                        if (formErrors.overview) setFormErrors({ ...formErrors, overview: "" })
                      }}
                      className={formErrors.overview ? "border-destructive" : ""}
                      placeholder="Enter college overview (10-5000 characters)"
                      rows={4}
                    />
                    {formErrors.overview && <p className="text-sm text-destructive">{formErrors.overview}</p>}
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
  )
}
