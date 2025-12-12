import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Loader2, Activity, TrendingUp, TrendingDown, Sparkles, Target, Clock, BookOpen, ArrowRight } from "lucide-react"
import { getUserQuizStats, getUserQuizHistory, getRecommendedTrainings, getAIFeedback } from "@/shared/lib/api"

export default function QuizAnalytics() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState("user")
  const [data, setData] = useState({ trainingStats: [], weakAreas: [] })
  const [history, setHistory] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [aiFeedback, setAiFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const userId = JSON.parse(localStorage.getItem("user") || "{}")?.id

        if (!userId) {
          setError("Please log in to view your analytics")
          return
        }

        const [statsData, historyData, recommendationsData, feedbackData] = await Promise.all([
          getUserQuizStats(userId).catch(() => ({ trainingStats: [], weakAreas: [] })),
          getUserQuizHistory(userId).catch(() => []),
          getRecommendedTrainings(userId).catch(() => []),
          getAIFeedback(userId).catch(() => null),
        ])

        setData(statsData)
        setHistory(historyData)
        setRecommendations(recommendationsData)
        setAiFeedback(feedbackData)
      } catch (err) {
        setError(err.message || "Unable to load quiz analytics.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredHistory = history.filter((item) => {
    if (timeRange === "all") return true
    const itemDate = new Date(item.completedAt)
    const now = new Date()
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    return (now - itemDate) / (1000 * 60 * 60 * 24) <= daysAgo
  })

  const calculateTrend = () => {
    if (filteredHistory.length < 2) return null
    const recent = filteredHistory.slice(0, 3).map((h) => h.percentage)
    const older = filteredHistory.slice(3, 6).map((h) => h.percentage)
    if (older.length === 0) return null
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    return recentAvg - olderAvg
  }

  const trend = calculateTrend()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:ml-64 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Quiz Analytics</h1>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* AI Feedback Card */}
            {aiFeedback && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>AI-Powered Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{aiFeedback.overallAssessment}</p>
                  {aiFeedback.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Strengths:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {aiFeedback.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiFeedback.improvementAreas.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Areas for Improvement:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {aiFeedback.improvementAreas.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiFeedback.recommendedActions.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {aiFeedback.recommendedActions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-sm font-semibold">{aiFeedback.motivationalMessage}</p>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>Next Target: {aiFeedback.nextScoreTarget}%</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Trends */}
            {filteredHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Trends</span>
                    {trend !== null && (
                      <Badge variant={trend > 0 ? "default" : trend < 0 ? "destructive" : "outline"} className="ml-2">
                        {trend > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{trend.toFixed(1)}%
                          </>
                        ) : trend < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {trend.toFixed(1)}%
                          </>
                        ) : (
                          "No change"
                        )}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredHistory.slice(0, 10).map((item) => (
                      <div key={item.sessionId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{item.trainingTitle}</p>
                          <p className="text-xs text-muted-foreground flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.completedAt).toLocaleString()}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {item.score}/{item.totalQuestions} ({item.percentage.toFixed(1)}%)
                          </p>
                          <Badge
                            variant={item.percentage >= 80 ? "default" : item.percentage >= 60 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {item.percentage >= 80 ? "Excellent" : item.percentage >= 60 ? "Good" : "Needs Work"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Training Performance */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Training Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.trainingStats.length === 0 && (
                  <p className="text-sm text-muted-foreground">No quiz attempts recorded yet.</p>
                )}
                {data.trainingStats.map((stat) => (
                  <div key={stat.trainingId} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{stat.trainingTitle}</p>
                      <Badge variant="outline">{stat.attemptCount} attempts</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Avg. Score: </span>
                        <span className="font-semibold">{stat.averageScore.toFixed(1)}/{stat.averageTotalQuestions.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Percentage: </span>
                        <span className="font-semibold">
                          {stat.averageTotalQuestions > 0
                            ? ((stat.averageScore / stat.averageTotalQuestions) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last Attempt: {stat.lastAttemptAt ? new Date(stat.lastAttemptAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommended Trainings */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Recommended Trainings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((rec) => (
                    <div key={rec.trainingId} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{rec.title}</p>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rec.recommendationReason}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {rec.confidenceScore}% match
                        </Badge>
                      </div>
                      {rec.skills && rec.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rec.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/trainings`)}
                        className="w-full"
                      >
                        Explore Training <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Weak Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Top Weak Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.weakAreas.length === 0 && (
                  <p className="text-sm text-muted-foreground">No weak areas identified yet.</p>
                )}
                {data.weakAreas.slice(0, 10).map((area, index) => (
                  <div key={`${area.trainingId}-${index}`} className="rounded-md border p-3">
                    <p className="font-medium">{area.questionText}</p>
                    <p className="text-xs text-muted-foreground">
                      {area.trainingTitle} • Incorrect {area.incorrectCount} times
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
