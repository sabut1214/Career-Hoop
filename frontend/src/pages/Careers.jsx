import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getCareers } from "@/lib/api"
import { Briefcase, ArrowRight, Loader } from "lucide-react"

export default function CareersPage() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true)
        const response = await getCareers()
        setCareers(response.data || [])
      } catch (err) {
        setError(err.message)
        console.error("Failed to fetch careers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCareers()
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
            <h1 className="text-4xl font-bold text-balance">Explore Careers</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Discover diverse career paths and find the one that matches your interests and skills.
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
                <p className="text-destructive">Error loading careers: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Careers Grid */}
          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careers.map((career, index) => (
                <motion.div
                  key={career.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{career.title || career.name}</CardTitle>
                          <CardDescription>{career.field || career.category}</CardDescription>
                        </div>
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{career.description}</p>
                      <div className="space-y-2">
                        {career.averageSalary && (
                          <p className="text-sm font-medium">Average Salary: {career.averageSalary}</p>
                        )}
                        {career.growthRate && (
                          <p className="text-sm font-medium">Growth Rate: {career.growthRate}</p>
                        )}
                      </div>
                      <Button className="w-full">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && careers.length === 0 && (
            <Card>
              <CardContent className="pt-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No careers available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
