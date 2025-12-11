import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMentors, deleteMentor } from "@/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "react-toastify"

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const response = await getMentors()
      setMentors(response.data || [])
    } catch (error) {
      console.error("Failed to fetch mentors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this mentor?")) {
      try {
        await deleteMentor(id)
        setMentors(mentors.filter((m) => m.id !== id))
      } catch (error) {
        console.error("Failed to delete mentor:", error)
      }
    }
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
              <Button className="gap-2">
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
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(mentor.id)}
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

