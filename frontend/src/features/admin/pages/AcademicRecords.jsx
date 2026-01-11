import { useEffect, useState } from "react"
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
import { Trash2, Plus, Pencil, Loader2, FileText } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"

export default function AcademicRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    studentId: "",
    subject: "",
    marks: "",
    gpa: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const response = await getAcademicRecords()
      const recordsData = Array.isArray(response) ? response : (response.data || [])
      setRecords(recordsData)
    } catch (error) {
      console.error("Failed to fetch academic records:", error)
      toast.error(getUserFriendlyError(error, "Unable to load academic records. Please refresh the page."))
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
      await fetchRecords()
      toast.success("Academic record deleted successfully.")
    } catch (error) {
      console.error("Failed to delete record:", error)
      toast.error(getUserFriendlyError(error, "Could not delete academic record. It may be in use elsewhere."))
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
      if (!formData.studentId.trim()) {
        toast.error("Student ID is required.")
        setIsSubmitting(false)
        return
      }
      const recordData = {
        student: formData.studentId ? { id: formData.studentId.trim() } : null,
        subject: formData.subject,
        marks: formData.marks ? parseInt(formData.marks, 10) : null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      }
      await createAcademicRecord(recordData)
      toast.success("Academic record created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      console.error("Failed to create academic record:", error)
      toast.error(getUserFriendlyError(error, "Could not create academic record. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (record) => {
    setEditingRecord(record)
    setFormData({
      studentId: record.student?.id || record.studentId || "",
      subject: record.subject || "",
      marks: record.marks?.toString() || "",
      gpa: record.gpa?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditRecord = async (e) => {
    e.preventDefault()
    if (!editingRecord) return
    setIsSubmitting(true)
    try {
      const recordData = {
        subject: formData.subject,
        marks: formData.marks ? parseInt(formData.marks, 10) : null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      }
      await updateAcademicRecord(editingRecord.id, recordData)
      toast.success("Academic record updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      console.error("Failed to update academic record:", error)
      toast.error(getUserFriendlyError(error, "Could not update academic record. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      subject: "",
      marks: "",
      gpa: "",
    })
    setEditingRecord(null)
  }

  const filteredRecords = records.filter((record) => {
    const search = searchTerm.toLowerCase()
    const studentName = record.student?.name?.toLowerCase() || ""
    const studentEmail = record.student?.email?.toLowerCase() || ""
    const studentId = record.student?.id?.toLowerCase?.() || record.studentId?.toLowerCase?.() || ""
    const subject = record.subject?.toLowerCase() || ""
    return subject.includes(search) || studentName.includes(search) || studentEmail.includes(search) || studentId.includes(search)
  })
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)
  const deletingId = isDeleting ? recordToDelete?.id : null

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
                <h1 className="text-3xl font-bold">Assessments</h1>
                <p className="text-muted-foreground mt-1">Manage student assessment records</p>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Assessment
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by subject or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Assessments ({filteredRecords.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {!loading && filteredRecords.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-busy={loading}>
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Student</th>
                        <th className="text-left py-3 px-4 font-semibold">Subject</th>
                        <th className="text-left py-3 px-4 font-semibold">Marks</th>
                        <th className="text-left py-3 px-4 font-semibold">GPA</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRowSkeleton key={`record-skeleton-${index}`} columns={5} />
                        ))
                      ) : filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <EmptyState
                              icon={FileText}
                              title="No Academic Records Found"
                              description={searchTerm ? `No records match "${searchTerm}". Try adjusting your search.` : "Get started by adding your first academic record."}
                              action={searchTerm ? {
                                label: "Clear Search",
                                onClick: () => setSearchTerm(""),
                                variant: "secondary"
                              } : {
                                label: "Add Record",
                                onClick: () => setIsAddDialogOpen(true),
                                variant: "default"
                              }}
                            />
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record) => {
                          const isRowDeleting = deletingId === record.id
                          return (
                            <tr
                              key={record.id}
                              className={`border-b transition-colors ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50 cursor-pointer"}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4 font-medium">
                                {record.student?.name || record.student?.email || record.student?.id || "N/A"}
                              </td>
                              <td className="py-3 px-4">{record.subject || "N/A"}</td>
                              <td className="py-3 px-4">{record.marks ?? "N/A"}</td>
                              <td className="py-3 px-4">{record.gpa ?? "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(record)}
                                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Edit record for ${record.student?.name || record.student?.email || "student"}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(record)}
                                  className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Delete record for ${record.student?.name || record.student?.email || "student"}`}
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

            {/* Add Assessment Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Assessment</DialogTitle>
                  <DialogDescription>
                    Create a new assessment record. Fill in the required information below.
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
                      <Label htmlFor="marks">Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        placeholder="e.g., 85"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA</Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        placeholder="e.g., 3.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter student UUID"
                        required
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

            {/* Edit Assessment Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Assessment</DialogTitle>
                  <DialogDescription>
                    Update assessment information.
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
                      <Label htmlFor="edit-marks">Marks</Label>
                      <Input
                        id="edit-marks"
                        type="number"
                        value={formData.marks}
                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        placeholder="e.g., 85"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-gpa">GPA</Label>
                      <Input
                        id="edit-gpa"
                        type="number"
                        step="0.01"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        placeholder="e.g., 3.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-studentId">Student ID</Label>
                      <Input
                        id="edit-studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter student UUID"
                        disabled
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
                  <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the assessment for <strong>{recordToDelete?.subject}</strong>?
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
