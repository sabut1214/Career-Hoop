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
import { getTrainings, deleteTraining, createTraining, updateTraining } from "@/shared/lib/api"
import { Trash2, Plus, Pencil, Loader2, Zap } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"

export default function AdminTrainingsPage() {
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [trainingToDelete, setTrainingToDelete] = useState(null)
  const [editingTraining, setEditingTraining] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "",
    duration: "",
    level: "",
    skills: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTrainings()
  }, [])

  const fetchTrainings = async () => {
    setLoading(true)
    try {
      const response = await getTrainings()
      const trainingsData = Array.isArray(response) ? response : (response.data || [])
      setTrainings(trainingsData)
    } catch (error) {
      console.error("Failed to fetch trainings:", error)
      toast.error(getUserFriendlyError(error, "Unable to load trainings. Please refresh the page."))
      setTrainings([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (training) => {
    setTrainingToDelete(training)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!trainingToDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteTraining(trainingToDelete.id)
      await fetchTrainings()
      toast.success("Training deleted successfully.")
    } catch (error) {
      console.error("Failed to delete training:", error)
      toast.error(getUserFriendlyError(error, "Could not delete training. It may be in use elsewhere."))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTrainingToDelete(null)
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
      resetForm()
      fetchTrainings()
    } catch (error) {
      console.error("Failed to create training:", error)
      toast.error(getUserFriendlyError(error, "Could not create training. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (training) => {
    setEditingTraining(training)
    setFormData({
      title: training.title || "",
      description: training.description || "",
      provider: training.provider || "",
      duration: training.duration || "",
      level: training.level || "",
      skills: Array.isArray(training.skills) ? training.skills.join(", ") : (training.skills || ""),
    })
    setIsEditDialogOpen(true)
  }

  const handleEditTraining = async (e) => {
    e.preventDefault()
    if (!editingTraining) return
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
      await updateTraining(editingTraining.id, trainingData)
      toast.success("Training updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchTrainings()
    } catch (error) {
      console.error("Failed to update training:", error)
      toast.error(getUserFriendlyError(error, "Could not update training. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      provider: "",
      duration: "",
      level: "",
      skills: "",
    })
    setEditingTraining(null)
  }

  const filteredTrainings = trainings.filter((training) =>
    training.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(filteredTrainings.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTrainings = filteredTrainings.slice(startIndex, endIndex)
  const deletingId = isDeleting ? trainingToDelete?.id : null

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
                {!loading && filteredTrainings.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTrainings.length)} of {filteredTrainings.length}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-busy={loading}>
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Title</th>
                        <th className="text-left py-3 px-4 font-semibold">Duration</th>
                        <th className="text-left py-3 px-4 font-semibold">Level</th>
                        <th className="text-left py-3 px-4 font-semibold">Provider</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRowSkeleton key={`training-skeleton-${index}`} columns={5} />
                        ))
                      ) : filteredTrainings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <EmptyState
                              icon={Zap}
                              title="No Trainings Found"
                              description={searchTerm ? `No trainings match "${searchTerm}". Try adjusting your search.` : "Get started by adding your first training."}
                              action={searchTerm ? {
                                label: "Clear Search",
                                onClick: () => setSearchTerm(""),
                                variant: "secondary"
                              } : {
                                label: "Add Training",
                                onClick: () => setIsAddDialogOpen(true),
                                variant: "default"
                              }}
                            />
                          </td>
                        </tr>
                      ) : (
                        paginatedTrainings.map((training) => {
                          const isRowDeleting = deletingId === training.id
                          return (
                            <tr
                              key={training.id}
                              className={`border-b transition-colors ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50 cursor-pointer"}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4 font-medium">{training.title || "N/A"}</td>
                              <td className="py-3 px-4">{training.duration || "N/A"}</td>
                              <td className="py-3 px-4">{training.level || "N/A"}</td>
                              <td className="py-3 px-4">{training.provider || "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(training)}
                                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Edit ${training.title || "training"}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(training)}
                                  className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Delete ${training.title || "training"}`}
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

            {/* Add Training Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
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

            {/* Edit Training Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Training</DialogTitle>
                  <DialogDescription>
                    Update training program information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditTraining} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Training Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter training title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter training description"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-provider">Provider</Label>
                      <Input
                        id="edit-provider"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="Enter provider name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duration</Label>
                      <Input
                        id="edit-duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 4 weeks, 8 hours"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-level">Level</Label>
                      <Input
                        id="edit-level"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="e.g., Beginner, Intermediate, Advanced"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-skills">Skills</Label>
                      <Input
                        id="edit-skills"
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
                  <AlertDialogTitle>Delete Training</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{trainingToDelete?.title}</strong>?
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
