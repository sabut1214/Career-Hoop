import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowLeft, BarChart3, XCircle } from "lucide-react"

const QUIZ_RESULT_KEY = "lastQuizResult"

export default function QuizResult() {
  const { quizSessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  const resolvedResult = useMemo(() => {
    if (location.state?.totalScore !== undefined) return location.state
    const stored = sessionStorage.getItem(QUIZ_RESULT_KEY)
    return stored ? JSON.parse(stored) : null
  }, [location.state])

  useEffect(() => {
    if (!resolvedResult) {
      navigate("/trainings")
      return
    }
    setResult(resolvedResult)
  }, [resolvedResult, navigate])

  if (!result) {
    return null
  }

  const accuracy = result.correctCount && result.incorrectCount !== undefined
    ? Math.round((result.correctCount / (result.correctCount + result.incorrectCount)) * 100)
    : 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-2">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center space-x-2 text-3xl">
                <CheckCircle2 className="h-7 w-7 text-primary" />
                <span>Quiz Completed</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">Session ID: {quizSessionId}</p>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-3xl font-bold">{result.totalScore}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600">{result.correctCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-primary">{isNaN(accuracy) ? "0%" : `${accuracy}%`}</p>
              </div>
            </CardContent>
          </Card>

          {result.questionResults && result.questionResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Question Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.questionResults.map((questionResult, index) => {
                  const getOptionLabel = (optionKey) => {
                    if (optionKey === "A") return questionResult.optionA || ""
                    if (optionKey === "B") return questionResult.optionB || ""
                    if (optionKey === "C") return questionResult.optionC || ""
                    if (optionKey === "D") return questionResult.optionD || ""
                    return ""
                  }

                  return (
                    <div
                      key={questionResult.questionId || index}
                      className={`rounded-lg border-2 p-4 ${
                        questionResult.isCorrect ? "border-green-500 bg-green-50/50" : "border-red-500 bg-red-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          {questionResult.isCorrect ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold mb-4">{questionResult.questionText}</p>
                      <div className="space-y-2">
                        {["A", "B", "C", "D"].map((optionKey) => {
                          const optionLabel = getOptionLabel(optionKey)
                          if (!optionLabel) return null

                          const isSelected = questionResult.selectedOption === optionKey
                          const isCorrect = questionResult.correctOption === optionKey

                          let className = "w-full text-left p-3 border rounded-lg transition-colors"
                          if (isCorrect) {
                            className += " border-green-600 bg-green-100 font-semibold"
                          } else if (isSelected && !isCorrect) {
                            className += " border-red-600 bg-red-100 font-semibold"
                          } else {
                            className += " border-muted bg-muted/30"
                          }

                          return (
                            <div key={optionKey} className={className}>
                              <span className="font-semibold mr-2">{optionKey}.</span>
                              {optionLabel}
                              {isCorrect && (
                                <span className="ml-2 text-green-700 font-semibold">✓ Correct Answer</span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="ml-2 text-red-700 font-semibold">✗ Your Answer</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Weak Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.weakAreas && result.weakAreas.length > 0 ? (
                result.weakAreas.slice(0, 5).map((area, index) => (
                  <div key={`${area}-${index}`} className="flex items-start space-x-2 rounded-md border p-3">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{area}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Great work! No weak areas detected for this session.</p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/trainings")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Trainings
            </Button>
            <Button onClick={() => navigate(`/quiz/start/${result.trainingId || ""}`)}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

