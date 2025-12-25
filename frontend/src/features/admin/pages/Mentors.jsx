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
import { getMentors, deleteMentor, createMentor, updateMentor } from "@/shared/lib/api"
import { Trash2, Plus, Pencil } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mentorToDelete, setMentorToDelete] = useState(null)
  const [editingMentor, setEditingMentor] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    expertise: "",
    bio: "",
    yearsOfExperience: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const response = await getMentors()
      const mentorsData = Array.isArray(response) ? response : (response.data || [])
      setMentors(mentorsData)
    } catch (error) {
      console.error("Failed to fetch mentors:", error)
      toast.error("Failed to fetch mentors. Please try again.")
      setMentors([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (mentor) => {
    setMentorToDelete(mentor)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!mentorToDelete) return
    try {
      await deleteMentor(mentorToDelete.id)
      setMentors(mentors.filter((m) => m.id !== mentorToDelete.id))
      toast.success("Mentor deleted successfully.")
    } catch (error) {
      console.error("Failed to delete mentor:", error)
      toast.error("Failed to delete mentor. Please try again.")
    } finally {
      setDeleteDialogOpen(false)
      setMentorToDelete(null)
    }
  }

  const handleAddMentor = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const mentorData = {
        name: formData.name,
        email: formData.email,
        expertise: formData.expertise || null,
        bio: formData.bio || null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
      }
      await createMentor(mentorData)
      toast.success("Mentor created successfully.")
      setIsAddDialogOpen(false)
      resetForm()
      fetchMentors()
    } catch (error) {
      console.error("Failed to create mentor:", error)
      toast.error(error.message || "Failed to create mentor. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (mentor) => {
    setEditingMentor(mentor)
    setFormData({
      name: mentor.name || "",
      email: mentor.email || "",
      expertise: mentor.expertise || "",
      bio: mentor.bio || "",
      yearsOfExperience: mentor.yearsOfExperience?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditMentor = async (e) => {
    e.preventDefault()
    if (!editingMentor) return
    setIsSubmitting(true)
    try {
      const mentorData = {
        name: formData.name,
        email: formData.email,
        expertise: formData.expertise || null,
        bio: formData.bio || null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
      }
      await updateMentor(editingMentor.id, mentorData)
      toast.success("Mentor updated successfully.")
      setIsEditDialogOpen(false)
      resetForm()
      fetchMentors()
    } catch (error) {
      console.error("Failed to update mentor:", error)
      toast.error(error.message || "Failed to update mentor. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      expertise: "",
      bio: "",
      yearsOfExperience: "",
    })
    setEditingMentor(null)
  }

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64 admin-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Mentors</h1>
                <p className="text-muted-foreground mt-1">Manage mentor profiles</p>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Mentor
              </Button>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Search Mentors</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by name or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Mentors ({filteredMentors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredMentors.length === 0 ? (
                  <p className="text-muted-foreground">No mentors found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold">Name</th>
                          <th className="text-left py-3 px-4 font-semibold">Expertise</th>
                          <th className="text-left py-3 px-4 font-semibold">Email</th>
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMentors.map((mentor) => (
                          <tr key={mentor.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{mentor.name || "N/A"}</td>
                            <td className="py-3 px-4">{mentor.expertise || "N/A"}</td>
                            <td className="py-3 px-4">{mentor.email || "N/A"}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(mentor)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(mentor)}
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

            {/* Add Mentor Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Mentor</DialogTitle>
                  <DialogDescription>
                    Create a new mentor profile. Fill in the required information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMentor} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter mentor name"
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
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Expertise</Label>
                      <Input
                        id="expertise"
                        value={formData.expertise}
                        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                        placeholder="e.g., Software Development"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        placeholder="e.g., 10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Enter mentor bio"
                      rows={4}
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
                      {isSubmitting ? "Creating..." : "Create Mentor"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Mentor Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Mentor</DialogTitle>
                  <DialogDescription>
                    Update mentor profile information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditMentor} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter mentor name"
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
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-expertise">Expertise</Label>
                      <Input
                        id="edit-expertise"
                        value={formData.expertise}
                        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                        placeholder="e.g., Software Development"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="edit-yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                        placeholder="e.g., 10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bio">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Enter mentor bio"
                      rows={4}
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
                  <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{mentorToDelete?.name}</strong>?
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
