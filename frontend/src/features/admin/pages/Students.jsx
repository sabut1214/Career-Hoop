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
import { getStudents, deleteStudent, createStudent } from "@/shared/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    careerFields: "",
    activities: "",
    workEnvironments: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await getStudents()
      // Handle different response structures
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

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id)
        setStudents(students.filter((s) => s.id !== id))
        toast.success("Student deleted successfully.")
      } catch (error) {
        console.error("Failed to delete student:", error)
        toast.error("Failed to delete student. Please try again.")
      }
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        careerFields: formData.careerFields ? formData.careerFields.split(",").map(s => s.trim()).filter(s => s) : [],
        activities: formData.activities ? formData.activities.split(",").map(s => s.trim()).filter(s => s) : [],
        workEnvironments: formData.workEnvironments ? formData.workEnvironments.split(",").map(s => s.trim()).filter(s => s) : [],
      }
      await createStudent(studentData)
      toast.success("Student created successfully.")
      setIsAddDialogOpen(false)
      setFormData({
        name: "",
        email: "",
        careerFields: "",
        activities: "",
        workEnvironments: "",
      })
      fetchStudents()
    } catch (error) {
      console.error("Failed to create student:", error)
      toast.error(error.message || "Failed to create student. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
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
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-muted-foreground">No students found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 font-semibold">Grade</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">{student.name || "N/A"}</td>
                            <td className="py-3 px-4">{student.email || "N/A"}</td>
                            <td className="py-3 px-4">{student.grade || "N/A"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(student.id)}
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

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Create a new student account. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

