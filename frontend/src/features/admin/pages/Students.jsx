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
import { getStudents, getStudent, deleteStudent, createStudent, updateStudent, getUsers } from "@/shared/lib/api"
import { Trash2, Pencil, Loader2, Users } from "lucide-react"
import { toast } from "react-toastify"
import { TableRowSkeleton } from "@/shared/components/common/LoadingSkeleton"
import Pagination from "@/shared/components/common/pagination"
import { EmptyState } from "@/shared/components/common/EmptyState"
import { getUserFriendlyError } from "@/shared/utils/userFriendlyErrors"
import { Checkbox as UICheckbox } from "@/shared/components/ui/checkbox"

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
  const [selectedStudents, setSelectedStudents] = useState(new Set())
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // Fetch Users instead of Students since registration creates Users
      const response = await getUsers()
      const usersData = Array.isArray(response) ? response : (response.data || [])
      // Sort by createdAt DESC to ensure newest appear first (backend should already sort, but this is a safety measure)
      const sortedUsers = [...usersData].sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      setStudents(sortedUsers)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error(getUserFriendlyError(error, "Unable to load users. Please refresh the page."))
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
      toast.error(getUserFriendlyError(error, "Could not delete student. It may be in use elsewhere."))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
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
      toast.error(getUserFriendlyError(error, "Could not create student. Please check your input and try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = async (student) => {
    try {
      // Fetch full student data by ID to ensure all fields are populated
      const fullStudent = await getStudent(student.id)
      setEditingStudent(fullStudent)
      setFormData({
        name: fullStudent.name || "",
        email: fullStudent.email || "",
        grade: fullStudent.grade || "",
        careerFields: Array.isArray(fullStudent.careerFields) ? fullStudent.careerFields.join(", ") : (fullStudent.careerFields || ""),
        activities: Array.isArray(fullStudent.activities) ? fullStudent.activities.join(", ") : (fullStudent.activities || ""),
        workEnvironments: Array.isArray(fullStudent.workEnvironments) ? fullStudent.workEnvironments.join(", ") : (fullStudent.workEnvironments || ""),
      })
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error("Failed to fetch student details:", error)
      toast.error(getUserFriendlyError(error, "Could not load student details. Please try again."))
      // Fallback to using the student from the list
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
  }

  const handleEditStudent = async (e) => {
    e.preventDefault()
    if (!editingStudent) return
    if (!validateForm()) {
      return
    }
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
      toast.error(getUserFriendlyError(error, "Could not update student. Please check your input and try again."))
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
    setFormErrors({})
  }

  const validateForm = () => {
    const errors = {}
    
    // Validate name - must be meaningful (at least 2 characters, contain letters)
    const nameTrimmed = formData.name?.trim() || ""
    if (!nameTrimmed) {
      errors.name = "Name is required"
    } else if (nameTrimmed.length < 2) {
      errors.name = "Name must be at least 2 characters"
    } else if (!/[a-zA-Z]/.test(nameTrimmed)) {
      errors.name = "Name must contain at least one letter"
    } else if (/^[^a-zA-Z0-9]+$/.test(nameTrimmed)) {
      errors.name = "Name cannot be only special characters"
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateField = (fieldName, value) => {
    const errors = { ...formErrors }
    if (fieldName === "name") {
      if (!value.trim()) {
        errors.name = "Name is required"
      } else {
        delete errors.name
      }
    } else if (fieldName === "email") {
      if (!value.trim()) {
        errors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = "Please enter a valid email address"
      } else {
        delete errors.email
      }
    }
    setFormErrors(errors)
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

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(paginatedStudents.map(s => s.id))
      setSelectedStudents(new Set([...selectedStudents, ...allIds]))
    } else {
      const pageIds = new Set(paginatedStudents.map(s => s.id))
      setSelectedStudents(new Set([...selectedStudents].filter(id => !pageIds.has(id))))
    }
  }

  const handleSelectStudent = (studentId, checked) => {
    const newSelected = new Set(selectedStudents)
    if (checked) {
      newSelected.add(studentId)
    } else {
      newSelected.delete(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const isAllSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudents.has(s.id))
  const isSomeSelected = paginatedStudents.some(s => selectedStudents.has(s.id))

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0 || isDeleting) return
    setIsDeleting(true)
    try {
      const deletePromises = Array.from(selectedStudents).map(id => deleteStudent(id))
      await Promise.all(deletePromises)
      await fetchStudents()
      toast.success(`${selectedStudents.size} student(s) deleted successfully.`)
      setSelectedStudents(new Set())
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete students:", error)
      toast.error(getUserFriendlyError(error, "Could not delete some students. Please try again."))
    } finally {
      setIsDeleting(false)
    }
  }

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
                <div className="flex items-center justify-between">
                  <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                  {selectedStudents.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedStudents.size} selected
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
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
                        <th className="text-left py-3 px-4 font-semibold w-12">
                          <UICheckbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </th>
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
                          <td colSpan={5} className="p-0">
                            <EmptyState
                              icon={Users}
                              title="No Students Found"
                              description={searchTerm ? `No students match "${searchTerm}". Try adjusting your search.` : "Get started by adding your first student."}
                              action={searchTerm ? {
                                label: "Clear Search",
                                onClick: () => setSearchTerm(""),
                                variant: "secondary"
                              } : undefined}
                            />
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student) => {
                          const isRowDeleting = deletingId === student.id
                          const isSelected = selectedStudents.has(student.id)
                          return (
                            <tr
                              key={student.id}
                              className={`border-b transition-colors ${isRowDeleting ? "opacity-60" : "hover:bg-muted/50 cursor-pointer"} ${isSelected ? "bg-muted/30" : ""}`}
                              aria-busy={isRowDeleting}
                            >
                              <td className="py-3 px-4">
                                <UICheckbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleSelectStudent(student.id, checked)}
                                  aria-label={`Select ${student.name || "student"}`}
                                />
                              </td>
                              <td className="py-3 px-4">{student.name || "N/A"}</td>
                              <td className="py-3 px-4">{student.email || "N/A"}</td>
                              <td className="py-3 px-4">{student.grade || "N/A"}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(student)}
                                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Edit ${student.name || "student"}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(student)}
                                  className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                                  disabled={isDeleting}
                                  aria-label={`Delete ${student.name || "student"}`}
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
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      isLoading={loading}
                    />
                  </div>
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
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          validateField("name", e.target.value)
                        }}
                        required
                        placeholder="Enter student name"
                        className={formErrors.name ? "border-destructive" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-destructive">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          validateField("email", e.target.value)
                        }}
                        required
                        placeholder="Enter student email"
                        className={formErrors.email ? "border-destructive" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">{formErrors.email}</p>
                      )}
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
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          validateField("name", e.target.value)
                        }}
                        required
                        placeholder="Enter student name"
                        className={formErrors.name ? "border-destructive" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-destructive">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          validateField("email", e.target.value)
                        }}
                        required
                        placeholder="Enter student email"
                        className={formErrors.email ? "border-destructive" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive">{formErrors.email}</p>
                      )}
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
                  </AlertDialogDescription>
                  <div className="text-muted-foreground text-sm mt-2">
                    This will permanently delete the student account and all associated data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Academic records</li>
                      <li>Assessment results</li>
                      <li>Quiz history</li>
                    </ul>
                    <p className="mt-2">
                      <strong>This action cannot be undone.</strong>
                    </p>
                  </div>
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

            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Students</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{selectedStudents.size}</strong> student(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
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
