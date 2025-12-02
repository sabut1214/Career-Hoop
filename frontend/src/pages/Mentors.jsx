import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getAvailableMentors } from "@/lib/api"
import { Users, MessageSquare, Loader } from "lucide-react"

export default function MentorsPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const response = await getAvailableMentors()
        setMentors(response.data || [])
      } catch (err) {
        setError(err.message)
        console.error("Failed to fetch mentors:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
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
            <h1 className="text-4xl font-bold text-balance">Find a Mentor</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Connect with experienced mentors who can guide your career journey.
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
                <p className="text-destructive">Error loading mentors: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Mentors Grid */}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{mentor.name}</CardTitle>
                        <CardDescription>{mentor.expertise}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{mentor.bio || mentor.description}</p>
                      {mentor.specializations && mentor.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {mentor.specializations.map((spec) => (
                            <Badge key={spec} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && mentors.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No mentors available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
