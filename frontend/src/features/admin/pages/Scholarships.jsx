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
import { getScholarships, deleteScholarship, createScholarship, updateScholarship } from "@/shared/lib/api"
import { Trash2, Plus, Pencil } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scholarshipToDelete, setScholarshipToDelete] = useState(null)
  const [editingScholarship, setEditingScholarship] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    deadline: "",
    eligibility: "",
    provider: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchScholarships()
  }, [])

  const fetchScholarships = async () => {
    try {
      const response = await getScholarships()
      const scholarshipsData = Array.isArray(response) ? response : (response.data || [])
      setScholarships(scholarshipsData)
    } catch (error) {
      console.error("Failed to fetch scholarships:", error)
      toast.error("Failed to fetch scholarships. Please try again.")
      setScholarships([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (scholarship) => {
    setScholarshipToDelete(scholarship)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!scholarshipToDelete) return
    try {
      await deleteScholarship(scholarshipToDelete.id)
      setScholarships(scholarships.filter((s) => s.id !== scholarshipToDelete.id))
      toast.success("Scholarship deleted successfully.")
    } catch (error) {
      console.error("Failed to delete scholarship:", error)
      toast.error("Failed to delete scholarship. Please try again.")
    } finally {
      setDeleteDialogOpen(false)
      setScholarshipToDelete(null)
    }
  }

  const handleAddScholarship = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const scholarshipData = {
        title: formData.title,
        description: formData.description || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        deadline: formData.deadline || null,
        eligibility: formData.eligibility || null,
        provider: formData.provider || null,
      }
      await createScholarship(scholarshipData)
      toast.success("Scholarship created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      fetchScholarships()
    } catch (error) {
      console.error("Failed to create scholarship:", error)
      toast.error(error.message || "Failed to create scholarship. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (scholarship) => {
    setEditingScholarship(scholarship)
    setFormData({
      title: scholarship.title || scholarship.name || "",
      description: scholarship.description || "",
      amount: scholarship.amount?.toString() || "",
      deadline: scholarship.deadline || "",
      eligibility: scholarship.eligibility || "",
      provider: scholarship.provider || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditScholarship = async (e) => {
    e.preventDefault()
    if (!editingScholarship) return
    setIsSubmitting(true)
    try {
      const scholarshipData = {
        title: formData.title,
        description: formData.description || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        deadline: formData.deadline || null,
        eligibility: formData.eligibility || null,
        provider: formData.provider || null,
      }
      await updateScholarship(editingScholarship.id, scholarshipData)
      toast.success("Scholarship updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchScholarships()
    } catch (error) {
      console.error("Failed to update scholarship:", error)
      toast.error(error.message || "Failed to update scholarship. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      deadline: "",
      eligibility: "",
      provider: "",
    })
    setEditingScholarship(null)
  }

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return "N/A"
    return `$${amount.toLocaleString()}`
  }

  const filteredScholarships = scholarships.filter((scholarship) =>
    (scholarship.title || scholarship.name)?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Scholarships</h1>
                <p className="text-muted-foreground mt-1">Manage scholarship opportunities</p>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Scholarship
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Scholarships</CardTitle>
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
                <CardTitle>All Scholarships ({filteredScholarships.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredScholarships.length === 0 ? (
                  <p className="text-muted-foreground">No scholarships found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Title</th>
                          <th className="text-left py-3 px-4 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold">Deadline</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredScholarships.map((scholarship) => (
                          <tr key={scholarship.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{scholarship.title || scholarship.name || "N/A"}</td>
                            <td className="py-3 px-4">{formatAmount(scholarship.amount)}</td>
                            <td className="py-3 px-4">{scholarship.deadline || "N/A"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(scholarship)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(scholarship)}
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

            {/* Add Scholarship Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Scholarship</DialogTitle>
                  <DialogDescription>
                    Create a new scholarship opportunity. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddScholarship} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter scholarship title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter scholarship description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g., 5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="e.g., University Foundation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eligibility">Eligibility</Label>
                      <Input
                        id="eligibility"
                        value={formData.eligibility}
                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                        placeholder="e.g., GPA 3.5+, need-based"
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
                      {isSubmitting ? "Creating..." : "Create Scholarship"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Scholarship Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Scholarship</DialogTitle>
                  <DialogDescription>
                    Update scholarship information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditScholarship} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Enter scholarship title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter scholarship description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount">Amount ($)</Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g., 5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-deadline">Deadline</Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-provider">Provider</Label>
                      <Input
                        id="edit-provider"
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        placeholder="e.g., University Foundation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-eligibility">Eligibility</Label>
                      <Input
                        id="edit-eligibility"
                        value={formData.eligibility}
                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                        placeholder="e.g., GPA 3.5+, need-based"
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
                  <AlertDialogTitle>Delete Scholarship</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{scholarshipToDelete?.title || scholarshipToDelete?.name}</strong>?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
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
