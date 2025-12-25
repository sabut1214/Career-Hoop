import { useEffect, useState } from "react"
import { AdminSidebar } from "@/features/admin/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
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
import { getAcademicRecords, deleteAcademicRecord, createAcademicRecord, updateAcademicRecord } from "@/shared/lib/api"
import { Trash2, Plus, Pencil } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AcademicRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    studentId: "",
    subject: "",
    grade: "",
    semester: "",
    credits: "",
    year: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await getAcademicRecords()
      const recordsData = Array.isArray(response) ? response : (response.data || [])
      setRecords(recordsData)
    } catch (error) {
      console.error("Failed to fetch academic records:", error)
      toast.error("Failed to fetch academic records. Please try again.")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (record) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recordToDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteAcademicRecord(recordToDelete.id)
      setRecords(records.filter((r) => r.id !== recordToDelete.id))
      toast.success("Academic record deleted successfully.")
    } catch (error) {
      console.error("Failed to delete record:", error)
      toast.error("Failed to delete academic record. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
    }
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const recordData = {
        studentId: formData.studentId ? parseInt(formData.studentId) : null,
        subject: formData.subject,
        grade: formData.grade || null,
        semester: formData.semester || null,
        credits: formData.credits ? parseInt(formData.credits) : null,
        year: formData.year ? parseInt(formData.year) : null,
      }
      await createAcademicRecord(recordData)
      toast.success("Academic record created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      console.error("Failed to create academic record:", error)
      toast.error(error.message || "Failed to create academic record. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setFormData({
      studentId: record.studentId?.toString() || "",
      subject: record.subject || "",
      grade: record.grade || "",
      semester: record.semester || "",
      credits: record.credits?.toString() || "",
      year: record.year?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditRecord = async (e) => {
    e.preventDefault()
    if (!editingRecord) return
    setIsSubmitting(true)
    try {
      const recordData = {
        studentId: formData.studentId ? parseInt(formData.studentId) : null,
        subject: formData.subject,
        grade: formData.grade || null,
        semester: formData.semester || null,
        credits: formData.credits ? parseInt(formData.credits) : null,
        year: formData.year ? parseInt(formData.year) : null,
      }
      await updateAcademicRecord(editingRecord.id, recordData)
      toast.success("Academic record updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      console.error("Failed to update academic record:", error)
      toast.error(error.message || "Failed to update academic record. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      subject: "",
      grade: "",
      semester: "",
      credits: "",
      year: "",
    })
    setEditingRecord(null)
  }

  const filteredRecords = records.filter((record) =>
    record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.semester?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Academic Records</h1>
                <p className="text-muted-foreground mt-1">Manage student academic records</p>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by subject or semester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Records ({filteredRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredRecords.length === 0 ? (
                  <p className="text-muted-foreground">No records found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Subject</th>
                          <th className="text-left py-3 px-4 font-semibold">Grade</th>
                          <th className="text-left py-3 px-4 font-semibold">Semester</th>
                          <th className="text-left py-3 px-4 font-semibold">Year</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{record.subject || "N/A"}</td>
                            <td className="py-3 px-4">{record.grade || "N/A"}</td>
                            <td className="py-3 px-4">{record.semester || "N/A"}</td>
                            <td className="py-3 px-4">{record.year || "N/A"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(record)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(record)}
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

            {/* Add Record Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Academic Record</DialogTitle>
                  <DialogDescription>
                    Create a new academic record. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="e.g., A, B+, 85%"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        placeholder="e.g., Fall 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 2024"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Input
                        id="credits"
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        type="number"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter student ID"
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
                      {isSubmitting ? "Creating..." : "Create Record"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Record Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Academic Record</DialogTitle>
                  <DialogDescription>
                    Update academic record information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditRecord} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-subject">Subject *</Label>
                      <Input
                        id="edit-subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-grade">Grade</Label>
                      <Input
                        id="edit-grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="e.g., A, B+, 85%"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-semester">Semester</Label>
                      <Input
                        id="edit-semester"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        placeholder="e.g., Fall 2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-year">Year</Label>
                      <Input
                        id="edit-year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="e.g., 2024"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-credits">Credits</Label>
                      <Input
                        id="edit-credits"
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-studentId">Student ID</Label>
                      <Input
                        id="edit-studentId"
                        type="number"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter student ID"
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
                  <AlertDialogTitle>Delete Academic Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the record for <strong>{recordToDelete?.subject}</strong>?
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
