import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { submitQuiz } from "@/shared/lib/api"
import { toast } from "react-toastify"
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

const QUIZ_STATE_KEY = "currentQuiz"
const QUIZ_RESULT_KEY = "lastQuizResult"

export default function QuizPage() {
  const { quizSessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const initialState = useMemo(() => {
    if (location.state?.questions) return location.state
    const fromStorage = sessionStorage.getItem(QUIZ_STATE_KEY)
    return fromStorage ? JSON.parse(fromStorage) : null
  }, [location.state])

  const [questions, setQuestions] = useState(initialState?.questions || [])
  const [trainingId] = useState(initialState?.trainingId || null)
  const [answers, setAnswers] = useState(() => {
    if (!initialState?.questions) return {}
    return initialState.questions.reduce((acc, question) => {
      acc[question.id] = ""
      return acc
    }, {})
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initialState || !initialState.questions?.length) {
      const redirectTrainingId = location.state?.trainingId || trainingId || initialState?.trainingId
      if (redirectTrainingId) {
        navigate(`/quiz/start/${redirectTrainingId}`, { replace: true })
      } else {
        navigate("/trainings", { replace: true })
      }
    }
  }, [initialState, questions.length, navigate, trainingId, location.state])

  useEffect(() => {
    if (initialState?.questions && !questions.length) {
      setQuestions(initialState.questions)
      setAnswers(
        initialState.questions.reduce((acc, question) => {
          acc[question.id] = ""
          return acc
        }, {}),
      )
    }
  }, [initialState, questions.length])

  const currentQuestion = questions[currentIndex]
  const progressValue = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  const goPrevious = () => setCurrentIndex((index) => Math.max(index - 1, 0))
  const goNext = () => setCurrentIndex((index) => Math.min(index + 1, questions.length - 1))

  const handleSubmit = async () => {
    setError("")

    const formattedAnswers = questions
      .map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id],
      }))
      .filter((item) => item.selectedOption)

    if (!formattedAnswers.length) {
      setError("Please answer at least one question before submitting.")
      return
    }

    try {
      setSubmitting(true)
      const response = await submitQuiz(quizSessionId, formattedAnswers)
      sessionStorage.removeItem(QUIZ_STATE_KEY)
      sessionStorage.setItem(
        QUIZ_RESULT_KEY,
        JSON.stringify({ ...response, trainingId, questionCount: questions.length }),
      )
      toast.success("Quiz submitted successfully!")
      navigate(`/quiz/result/${quizSessionId}`, { replace: true, state: { ...response, trainingId } })
    } catch (err) {
      const errorMsg = err.message || "Failed to submit quiz. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
      console.error("Quiz submit failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Question {currentIndex + 1} of {questions.length}</CardTitle>
              <Progress value={progressValue} className="h-2" />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                <span>Session ID: {quizSessionId?.slice(0, 8)}...</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-semibold">{currentQuestion.questionText}</p>
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((optionKey) => {
                  const optionField = `option${optionKey}`
                  const optionLabel = currentQuestion[optionField]
                  if (!optionLabel) return null
                  const isSelected = answers[currentQuestion.id] === optionKey
                  return (
                    <button
                      key={optionKey}
                      className={`w-full text-left p-3 border rounded-lg transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-primary"
                      }`}
                      onClick={() => handleSelect(currentQuestion.id, optionKey)}
                    >
                      <span className="font-semibold mr-2">{optionKey}.</span>
                      {optionLabel}
                    </button>
                  )
                })}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={goPrevious} disabled={currentIndex === 0 || submitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                  <Button variant="outline" onClick={goNext} disabled={submitting} className="flex-1">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

