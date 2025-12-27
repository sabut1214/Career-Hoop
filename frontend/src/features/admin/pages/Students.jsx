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
import { getStudents, deleteStudent, createStudent, updateStudent } from "@/shared/lib/api"
import { Trash2, Plus, Pencil, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade: "",
    careerFields: "",
    activities: "",
    workEnvironments: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await getStudents()
      const studentsData = Array.isArray(response) ? response : (response.data || [])
      setStudents(studentsData)
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast.error("Failed to fetch students. Please try again.")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!studentToDelete || isDeleting) return
    setIsDeleting(true)
    try {
      await deleteStudent(studentToDelete.id)
      await fetchStudents()
      toast.success("Student deleted successfully.")
    } catch (error) {
      console.error("Failed to delete student:", error)
      toast.error("Failed to delete student. Please try again.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        grade: formData.grade || null,
        careerFields: formData.careerFields ? formData.careerFields.split(",").map(s => s.trim()).filter(s => s) : [],
        activities: formData.activities ? formData.activities.split(",").map(s => s.trim()).filter(s => s) : [],
        workEnvironments: formData.workEnvironments ? formData.workEnvironments.split(",").map(s => s.trim()).filter(s => s) : [],
      }
      await createStudent(studentData)
      toast.success("Student created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      fetchStudents()
    } catch (error) {
      console.error("Failed to create student:", error)
      toast.error(error.message || "Failed to create student. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name || "",
      email: student.email || "",
      grade: student.grade || "",
      careerFields: Array.isArray(student.careerFields) ? student.careerFields.join(", ") : "",
      activities: Array.isArray(student.activities) ? student.activities.join(", ") : "",
      workEnvironments: Array.isArray(student.workEnvironments) ? student.workEnvironments.join(", ") : "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditStudent = async (e) => {
    e.preventDefault()
    if (!editingStudent) return
    setIsSubmitting(true)
    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        grade: formData.grade || null,
        careerFields: formData.careerFields ? formData.careerFields.split(",").map(s => s.trim()).filter(s => s) : [],
        activities: formData.activities ? formData.activities.split(",").map(s => s.trim()).filter(s => s) : [],
        workEnvironments: formData.workEnvironments ? formData.workEnvironments.split(",").map(s => s.trim()).filter(s => s) : [],
      }
      await updateStudent(editingStudent.id, studentData)
      toast.success("Student updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchStudents()
    } catch (error) {
      console.error("Failed to update student:", error)
      toast.error(error.message || "Failed to update student. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      grade: "",
      careerFields: "",
      activities: "",
      workEnvironments: "",
    })
    setEditingStudent(null)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)
  const deletingId = isDeleting ? studentToDelete?.id : null

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
                <h1 className="text-3xl font-bold">Students</h1>
                <p className="text-muted-foreground mt-1">Manage student accounts</p>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Students</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Students ({filteredStudents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {!loading && filteredStudents.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                  </p>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-busy={loading}>
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Grade</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <TableRowSkeleton key={`student-skeleton-${index}`} columns={4} />
                        ))
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student) => {
                          const isRowDeleting = deletingId === student.id
                          return (
                            <tr
                              key={student.id}
                              className={`border-b transition-opacity ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50"}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4">{student.name || "N/A"}</td>
                              <td className="py-3 px-4">{student.email || "N/A"}</td>
                              <td className="py-3 px-4">{student.grade || "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(student)}
                                  className="text-muted-foreground hover:text-foreground"
                                  disabled={isDeleting}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(student)}
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

            {/* Add Student Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Create a new student account. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter student name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Enter student email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="e.g., 10th, 12th, Freshman"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="careerFields">Career Fields</Label>
                    <Input
                      id="careerFields"
                      value={formData.careerFields}
                      onChange={(e) => setFormData({ ...formData, careerFields: e.target.value })}
                      placeholder="Comma-separated (e.g., Engineering, Medicine)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activities">Activities</Label>
                    <Input
                      id="activities"
                      value={formData.activities}
                      onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                      placeholder="Comma-separated (e.g., Sports, Music, Debate)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workEnvironments">Work Environments</Label>
                    <Input
                      id="workEnvironments"
                      value={formData.workEnvironments}
                      onChange={(e) => setFormData({ ...formData, workEnvironments: e.target.value })}
                      placeholder="Comma-separated (e.g., Office, Remote, Field)"
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
                      {isSubmitting ? "Creating..." : "Create Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                  <DialogDescription>
                    Update student account information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditStudent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name *</Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter student name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="Enter student email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-grade">Grade</Label>
                    <Input
                      id="edit-grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="e.g., 10th, 12th, Freshman"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-careerFields">Career Fields</Label>
                    <Input
                      id="edit-careerFields"
                      value={formData.careerFields}
                      onChange={(e) => setFormData({ ...formData, careerFields: e.target.value })}
                      placeholder="Comma-separated (e.g., Engineering, Medicine)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-activities">Activities</Label>
                    <Input
                      id="edit-activities"
                      value={formData.activities}
                      onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                      placeholder="Comma-separated (e.g., Sports, Music, Debate)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-workEnvironments">Work Environments</Label>
                    <Input
                      id="edit-workEnvironments"
                      value={formData.workEnvironments}
                      onChange={(e) => setFormData({ ...formData, workEnvironments: e.target.value })}
                      placeholder="Comma-separated (e.g., Office, Remote, Field)"
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
                  <AlertDialogTitle>Delete Student</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{studentToDelete?.name}</strong> ({studentToDelete?.email})?
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
