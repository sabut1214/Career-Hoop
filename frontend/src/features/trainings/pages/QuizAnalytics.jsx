import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Loader2, Activity, TrendingUp, TrendingDown, Sparkles, Target, Clock, BookOpen, ArrowRight, Lock } from "lucide-react"
import { getUserQuizStats, getUserQuizHistory, getRecommendedTrainings, getAIFeedback } from "@/shared/lib/api"
import { useSubscription } from "@/shared/hooks/useSubscription"
import { ProPaywallModal } from "@/features/payment/components/ProPaywallModal"

export default function QuizAnalytics() {
  const navigate = useNavigate()
  const { isPro } = useSubscription()
  const [viewMode, setViewMode] = useState("user")
  const [data, setData] = useState({ trainingStats: [], weakAreas: [] })
  const [history, setHistory] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [aiFeedback, setAiFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("all")
  const [paywallModalOpen, setPaywallModalOpen] = useState(false)

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

  // For free users, limit to 2 free quizzes, rest are locked
  const FREE_LIMIT = 2
  let visibleHistory = filteredHistory
  let lockedHistory = []
  
  if (!isPro && filteredHistory.length > FREE_LIMIT) {
    visibleHistory = filteredHistory.slice(0, FREE_LIMIT)
    lockedHistory = filteredHistory.slice(FREE_LIMIT)
  }

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
    <div className="max-w-7xl mx-auto space-y-6">
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
                    {visibleHistory.map((item) => (
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
                    {/* Show locked quizzes for free users */}
                    {!isPro && lockedHistory.length > 0 && (
                      <>
                        {lockedHistory.slice(0, 3).map((item) => (
                          <div key={`locked-${item.sessionId}`} className="flex items-center justify-between p-3 rounded-lg border relative overflow-hidden">
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center cursor-pointer"
                                 onClick={() => setPaywallModalOpen(true)}>
                              <div className="text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                  <Lock className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-semibold text-foreground mb-1">Upgrade to Unlock</h3>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    See full quiz details
                                  </p>
                                  <Button onClick={() => setPaywallModalOpen(true)} size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                                    Upgrade to Pro
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 opacity-50 pointer-events-none">
                              <p className="font-medium">{item.trainingTitle}</p>
                              <p className="text-xs text-muted-foreground flex items-center space-x-2">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(item.completedAt).toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="text-right opacity-50 pointer-events-none">
                              <p className="font-semibold">
                                {item.score}/{item.totalQuestions} ({item.percentage.toFixed(1)}%)
                              </p>
                              <Badge
                                variant={item.percentage >= 80 ? "default" : item.percentage >= 60 ? "secondary" : "destructive"}
                                className="text-xs mt-1"
                              >
                                {item.percentage >= 80 ? "Excellent" : item.percentage >= 60 ? "Good" : "Needs Work"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {!isPro && lockedHistory.length > 0 && (
              <Card className="border-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Unlock All Quiz History</h3>
                  <p className="text-muted-foreground">
                    You're viewing {visibleHistory.length} free quiz{visibleHistory.length !== 1 ? 'es' : ''}. Upgrade to Pro to see all {filteredHistory.length} quiz results.
                  </p>
                  <Button onClick={() => setPaywallModalOpen(true)} size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    Upgrade to Pro
                  </Button>
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
                      {area.trainingTitle} - Incorrect {area.incorrectCount} times
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
        </div>
      )}

      {/* Paywall Modal */}
      <ProPaywallModal open={paywallModalOpen} onOpenChange={setPaywallModalOpen} />
    </div>
  )
}
