import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { startQuiz } from "@/shared/lib/api"

export default function QuizStart() {
  const { trainingId } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const beginQuiz = async () => {
    if (!trainingId) return
    setError("")
    setLoading(true)
    try {
      const response = await startQuiz(trainingId)
      const payload = {
        quizSessionId: response.quizSessionId,
        trainingId,
        questions: response.questions || [],
      }
      sessionStorage.setItem("currentQuiz", JSON.stringify(payload))
      navigate(`/quiz/session/${response.quizSessionId}`, { replace: true, state: payload })
    } catch (err) {
      setError(err.message || "Unable to start quiz. Please try again.")
      console.error("Quiz start failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    beginQuiz()
  }, [trainingId])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:ml-64 flex items-center justify-center">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Preparing Your Quiz</span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              We are pulling a personalized set of questions for this training.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex flex-col items-center space-y-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Curating questions...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={beginQuiz} disabled={loading}>
              {loading ? "Starting..." : "Try Again"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/trainings")} disabled={loading}>
              Back to Trainings
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

