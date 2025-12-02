import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getActiveScholarships } from "@/lib/api"
import { Award, ExternalLink, Loader } from "lucide-react"

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true)
        const response = await getActiveScholarships()
        setScholarships(response.data || [])
      } catch (err) {
        setError(err.message)
        console.error("Failed to fetch scholarships:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchScholarships()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold text-balance">Scholarships</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Explore available scholarships and funding opportunities for your education.
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive">Error loading scholarships: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Scholarships List */}
          {!loading && !error && (
            <div className="space-y-4">
              {scholarships.map((scholarship, index) => (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{scholarship.name || scholarship.title}</CardTitle>
                          <CardDescription>{scholarship.provider || scholarship.organization}</CardDescription>
                        </div>
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Amount</p>
                          <p className="text-lg font-bold text-primary">${scholarship.amount?.toLocaleString() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Deadline</p>
                          <p className="text-lg font-bold">
                            {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                      {scholarship.eligibility && scholarship.eligibility.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {scholarship.eligibility.map((criteria) => (
                            <Badge key={criteria} variant="outline">
                              {criteria}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && scholarships.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No scholarships available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
