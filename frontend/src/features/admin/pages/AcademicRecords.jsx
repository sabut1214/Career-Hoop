import { useEffect, useState } from "react"
import { AdminSidebar } from "@/features/admin/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { getAcademicRecords, deleteAcademicRecord } from "@/shared/lib/api"
import { Trash2, Plus } from "lucide-react"
import { ProtectedRoute } from "@/shared/components/protected-route"
import { toast } from "react-toastify"

export default function AcademicRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await getAcademicRecords()
      // Handle different response structures
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

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteAcademicRecord(id)
        setRecords(records.filter((r) => r.id !== id))
        toast.success("Academic record deleted successfully.")
      } catch (error) {
        console.error("Failed to delete record:", error)
        toast.error("Failed to delete academic record. Please try again.")
      }
    }
  }

  const filteredRecords = records.filter((record) => record.subject?.toLowerCase().includes(searchTerm.toLowerCase()))

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
              <Button className="gap-2">
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
                  placeholder="Search by subject..."
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
                          <th className="text-right py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{record.subject || "N/A"}</td>
                            <td className="py-3 px-4">{record.grade || "N/A"}</td>
                            <td className="py-3 px-4">{record.semester || "N/A"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
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

