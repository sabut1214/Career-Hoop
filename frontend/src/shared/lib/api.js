// Normalize API_BASE_URL to always end with /api
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true" // Default to false - use real backend

const resolveUserId = (explicitUserId) => {
  if (explicitUserId) return explicitUserId
  try {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      return parsed?.id || parsed?.userId || null
    }
  } catch (error) {
    // Silently fail - userId resolution is optional
  }
  return null
}

// Mock data for testing
const mockUsers = {
  "student@example.com": {
    id: "1",
    email: "student@example.com",
    name: "John Student",
    role: "student",
  },
  "admin@example.com": {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  },
}

// Mock data for stats
const mockStats = {
  students: [
    { id: "1", name: "John Student", email: "student@example.com" },
    { id: "2", name: "Jane Doe", email: "jane@example.com" },
  ],
  careers: [
    { id: "1", title: "Software Engineer", description: "Build software solutions" },
    { id: "2", title: "Data Scientist", description: "Analyze data and build models" },
  ],
  colleges: [
    { id: "1", name: "MIT", location: "Cambridge, MA" },
    { id: "2", name: "Stanford", location: "Palo Alto, CA" },
  ],
  mentors: [
    { id: "1", name: "John Mentor", expertise: "Software Development" },
    { id: "2", name: "Jane Expert", expertise: "Data Science" },
  ],
  scholarships: [
    { id: "1", title: "Merit Scholarship", amount: 5000 },
    { id: "2", title: "Need-Based Aid", amount: 3000 },
  ],
  trainings: [
    { id: "1", title: "Python Basics", duration: "4 weeks" },
    { id: "2", title: "Web Development", duration: "8 weeks" },
  ],
}

// Health Check with very short timeout to fail fast
export const checkHealth = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1000) // 1 second timeout - fail fast
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    // Silently return false if backend is unavailable
    // Note: Browser will still log ERR_CONNECTION_REFUSED - this is expected behavior
    return false
  }
}

// Check if backend is available (cached result)
// If backend is unavailable, cache for 5 minutes to avoid repeated checks
// If backend is available, cache for 30 seconds
// Initialize as unavailable (false) with current timestamp to prevent initial network calls
let backendAvailableCache = { value: false, timestamp: Date.now() }
const BACKEND_CHECK_CACHE_DURATION_AVAILABLE = 30000 // 30 seconds when available
const BACKEND_CHECK_CACHE_DURATION_UNAVAILABLE = 300000 // 5 minutes when unavailable

const isBackendAvailable = async () => {
  const now = Date.now()
  const cacheAge = now - backendAvailableCache.timestamp
  
  // Use cached result if still valid - check cache FIRST to avoid network calls
  if (backendAvailableCache.value !== null) {
    const cacheDuration = backendAvailableCache.value 
      ? BACKEND_CHECK_CACHE_DURATION_AVAILABLE 
      : BACKEND_CHECK_CACHE_DURATION_UNAVAILABLE
    
    if (cacheAge < cacheDuration) {
      return backendAvailableCache.value
    }
  }
  
  // Only check backend health if cache is expired
  // This minimizes network calls and console errors
  try {
    const isAvailable = await checkHealth()
    backendAvailableCache = { value: isAvailable, timestamp: now }
    return isAvailable
  } catch (error) {
    // If health check fails, mark as unavailable and cache for 5 minutes
    backendAvailableCache = { value: false, timestamp: now }
    return false
  }
}

// Students
export const getStudents = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.students }
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch students: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return { data }
  } catch (error) {
    throw error
  }
}

export const getStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`)
  if (!response.ok) throw new Error("Failed to fetch student")
  return response.json()
}

export const createStudent = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create student")
  }
  return response.json()
}

export const updateStudent = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update student")
  return response.json()
}

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete student")
  return response.json()
}

// Careers
export const getCareers = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.careers }
  
  const headers = buildAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/careers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch careers: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  return { data }
}

export const getCareer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/careers/${id}`)
  if (!response.ok) throw new Error("Failed to fetch career")
  return response.json()
}

export const createCareer = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/careers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create career")
  }
  return response.json()
}

export const updateCareer = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/careers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update career")
  return response.json()
}

export const deleteCareer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/careers/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete career")
  return response.json()
}

// Colleges
export const getColleges = async (options = {}) => {
  if (USE_MOCK_DATA) {
    return {
      data: mockStats.colleges,
      meta: {
        page: 0,
        size: mockStats.colleges.length,
        totalElements: mockStats.colleges.length,
        totalPages: 1,
      },
    }
  }

  const { page, size } = options
  const params = new URLSearchParams()
  if (page !== undefined) {
    params.append("page", page)
    params.append("size", size ?? 10)
  } else if (size !== undefined) {
    params.append("size", size)
  }

  const queryString = params.toString() ? `?${params.toString()}` : ""
  const response = await fetchWithAuth(`${API_BASE_URL}/colleges${queryString}`)

  if (response.status === 401 || response.status === 403) {
    throw new Error("Authorization required to view colleges. Please log in and try again.")
  }

  if (!response.ok) throw new Error("Failed to fetch colleges")
  const data = await response.json()

  if (Array.isArray(data)) {
    return {
      data,
      meta: {
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: 1,
      },
    }
  }

  const { content = [], ...meta } = data
  return { data: content, meta }
}

export const getCollege = async (id) => {
  const response = await fetch(`${API_BASE_URL}/colleges/${id}`)
  if (!response.ok) throw new Error("Failed to fetch college")
  return response.json()
}

export const createCollege = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/colleges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create college")
  }
  return response.json()
}

export const updateCollege = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update college")
  return response.json()
}

export const deleteCollege = async (id) => {
  const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete college")
  return response.json()
}

// Mentors
export const getMentors = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.mentors }
  const response = await fetch(`${API_BASE_URL}/mentors`)
  if (!response.ok) throw new Error("Failed to fetch mentors")
  const data = await response.json()
  return { data }
}

export const getAvailableMentors = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.mentors }
  const response = await fetch(`${API_BASE_URL}/mentors/available`)
  if (!response.ok) throw new Error("Failed to fetch available mentors")
  const data = await response.json()
  return { data }
}

export const getMentor = async (id) => {
  const response = await fetch(`${API_BASE_URL}/mentors/${id}`)
  if (!response.ok) throw new Error("Failed to fetch mentor")
  return response.json()
}

export const createMentor = async (data) => {
  const response = await fetch(`${API_BASE_URL}/mentors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create mentor")
  return response.json()
}

export const updateMentor = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/mentors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update mentor")
  return response.json()
}

export const deleteMentor = async (id) => {
  const response = await fetch(`${API_BASE_URL}/mentors/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete mentor")
  return response.json()
}

// Scholarships
export const getScholarships = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.scholarships }
  const response = await fetch(`${API_BASE_URL}/scholarships`)
  if (!response.ok) throw new Error("Failed to fetch scholarships")
  const data = await response.json()
  return { data }
}

export const getActiveScholarships = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.scholarships }
  const response = await fetch(`${API_BASE_URL}/scholarships/active`)
  if (!response.ok) throw new Error("Failed to fetch active scholarships")
  const data = await response.json()
  return { data }
}

export const getScholarship = async (id) => {
  const response = await fetch(`${API_BASE_URL}/scholarships/${id}`)
  if (!response.ok) throw new Error("Failed to fetch scholarship")
  return response.json()
}

export const createScholarship = async (data) => {
  const response = await fetch(`${API_BASE_URL}/scholarships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create scholarship")
  return response.json()
}

export const updateScholarship = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update scholarship")
  return response.json()
}

export const deleteScholarship = async (id) => {
  const response = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete scholarship")
  return response.json()
}

// Trainings
export const getTrainings = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.trainings }
  const headers = buildAuthHeaders()
  const response = await fetch(`${API_BASE_URL}/trainings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch trainings: ${response.status} ${errorText}`)
  }
  const data = await response.json()
  return { data }
}

export const getAvailableTrainings = async () => {
  if (USE_MOCK_DATA) return { data: mockStats.trainings }
  const response = await fetch(`${API_BASE_URL}/trainings/available`)
  if (!response.ok) throw new Error("Failed to fetch available trainings")
  const data = await response.json()
  return { data }
}

export const getTraining = async (id) => {
  const response = await fetch(`${API_BASE_URL}/trainings/${id}`)
  if (!response.ok) throw new Error("Failed to fetch training")
  return response.json()
}

export const createTraining = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create training")
  }
  return response.json()
}

export const updateTraining = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/trainings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update training")
  return response.json()
}

export const deleteTraining = async (id) => {
  const response = await fetch(`${API_BASE_URL}/trainings/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete training")
  return response.json()
}

export const startQuiz = async (trainingId, userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!trainingId || !resolvedUserId) {
    throw new Error("trainingId and an authenticated user are required to start a quiz")
  }

  if (USE_MOCK_DATA) {
    return {
      quizSessionId: `mock-session-${Date.now()}`,
      questions: [],
    }
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/quiz/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trainingId, userId: resolvedUserId }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Failed to start quiz")
  }

  return response.json()
}

export const submitQuiz = async (quizSessionId, answers, userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!quizSessionId || !resolvedUserId) {
    throw new Error("quizSessionId and an authenticated user are required to submit a quiz")
  }

  if (USE_MOCK_DATA) {
    return {
      quizSessionId,
      totalScore: answers?.length || 0,
      correctCount: answers?.length || 0,
      incorrectCount: 0,
      weakAreas: [],
    }
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizSessionId, userId: resolvedUserId, answers }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Failed to submit quiz")
  }

  return response.json()
}

export const getQuizStats = async () => {
  if (USE_MOCK_DATA) {
    return {
      trainingStats: [
        { trainingId: "1", trainingTitle: "Web Dev Basics", attemptCount: 4, averageScore: 7, averageTotalQuestions: 10, lastAttemptAt: new Date().toISOString() },
      ],
      weakAreas: [
        { trainingId: "1", trainingTitle: "Web Dev Basics", questionText: "Which HTML tag defines the main heading on a page?", incorrectCount: 2 },
      ],
    }
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/quiz/stats`)
  if (!response.ok) throw new Error("Failed to fetch quiz analytics")
  return response.json()
}

export const getUserQuizStats = async (userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error("An authenticated user is required to fetch quiz stats")
  }

  if (USE_MOCK_DATA) {
    return {
      trainingStats: [
        { trainingId: "1", trainingTitle: "Web Dev Basics", attemptCount: 2, averageScore: 8, averageTotalQuestions: 10, lastAttemptAt: new Date().toISOString() },
      ],
      weakAreas: [
        { trainingId: "1", trainingTitle: "Web Dev Basics", questionText: "Which CSS property changes the text color?", incorrectCount: 1 },
      ],
    }
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/quiz/stats/user/${resolvedUserId}`)
  if (!response.ok) throw new Error("Failed to fetch user quiz analytics")
  return response.json()
}

export const getUserQuizHistory = async (userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error("An authenticated user is required to fetch quiz history")
  }

  if (USE_MOCK_DATA) {
    return [
      { sessionId: "1", trainingId: "1", trainingTitle: "Web Dev Basics", score: 8, totalQuestions: 10, completedAt: new Date().toISOString(), percentage: 80 },
      { sessionId: "2", trainingId: "1", trainingTitle: "Web Dev Basics", score: 7, totalQuestions: 10, completedAt: new Date(Date.now() - 86400000).toISOString(), percentage: 70 },
    ]
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/quiz/history/user/${resolvedUserId}`)
  if (!response.ok) throw new Error("Failed to fetch quiz history")
  return response.json()
}

export const getRecommendedTrainings = async (userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error("An authenticated user is required to get recommendations")
  }

  if (USE_MOCK_DATA) {
    return [
      {
        trainingId: "2",
        title: "Data Analysis Foundations",
        description: "Build confidence with spreadsheets, SQL, and Python",
        provider: "Insight Labs",
        level: "Intermediate",
        skills: ["Excel", "SQL", "Python"],
        confidenceScore: 85,
        recommendationReason: "Based on your quiz performance, this training addresses areas where you need improvement.",
        suggestedSkills: ["Excel", "SQL", "Python"],
      },
    ]
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations/trainings/user/${resolvedUserId}`)
  if (!response.ok) throw new Error("Failed to fetch recommended trainings")
  return response.json()
}

export const getAIFeedback = async (userId) => {
  const resolvedUserId = resolveUserId(userId)
  if (!resolvedUserId) {
    throw new Error("An authenticated user is required to get AI feedback")
  }

  if (USE_MOCK_DATA) {
    return {
      overallAssessment: "Great job! You're performing well with a score of 80.0%. With 2 attempts, you're building strong knowledge.",
      strengths: ["Showing consistent improvement over time", "Completed quizzes in 1 different training areas"],
      improvementAreas: ["Focus on Web Dev Basics (1 areas need attention)"],
      recommendedActions: ["Take more quizzes to build a comprehensive learning profile", "Review and retake quizzes for Web Dev Basics to strengthen weak areas"],
      motivationalMessage: "💪 Great progress! You're building strong knowledge. Keep up the momentum!",
      nextScoreTarget: 85,
    }
  }

  const response = await fetchWithAuth(`${API_BASE_URL}/feedback/ai/user/${resolvedUserId}`)
  if (!response.ok) throw new Error("Failed to fetch AI feedback")
  return response.json()
}

// College Recommendations
export const getCollegeRecommendations = async (request, limit = 4) => {
  if (USE_MOCK_DATA) {
    return []
  }

  const queryString = limit ? `?limit=${limit}` : ""
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations/colleges${queryString}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Authorization required to get college recommendations. Please log in and try again.")
    }
    throw new Error("Failed to fetch college recommendations")
  }

  return response.json()
}

// Academic Records
export const getAcademicRecords = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/academic-records`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch academic records: ${response.status} ${errorText}`)
    }
    const data = await response.json()
    return { data }
  } catch (error) {
    throw error
  }
}

export const getAcademicRecord = async (id) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-records/${id}`)
  if (!response.ok) throw new Error("Failed to fetch academic record")
  return response.json()
}

export const getStudentAcademicRecords = async (studentId) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-records/student/${studentId}`)
  if (!response.ok) throw new Error("Failed to fetch student academic records")
  return response.json()
}

export const createAcademicRecord = async (data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create academic record")
  return response.json()
}

export const updateAcademicRecord = async (id, data) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update academic record")
  return response.json()
}

export const deleteAcademicRecord = async (id) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-records/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete academic record")
  return response.json()
}

// Programs
export const getPrograms = async () => {
  const response = await fetch(`${API_BASE_URL}/programs`)
  if (!response.ok) throw new Error("Failed to fetch programs")
  const data = await response.json()
  return { data }
}

export const getProgram = async (id) => {
  const response = await fetch(`${API_BASE_URL}/programs/${id}`)
  if (!response.ok) throw new Error("Failed to fetch program")
  return response.json()
}

export const getProgramsByUniversity = async (university) => {
  const response = await fetch(`${API_BASE_URL}/programs/university/${encodeURIComponent(university)}`)
  if (!response.ok) throw new Error("Failed to fetch programs by university")
  const data = await response.json()
  return { data }
}

export const createProgram = async (data) => {
  const response = await fetch(`${API_BASE_URL}/programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create program")
  return response.json()
}

export const updateProgram = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update program")
  return response.json()
}

export const deleteProgram = async (id) => {
  const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete program")
  return response.json()
}

// Universities
export const getUniversities = async () => {
  const response = await fetch(`${API_BASE_URL}/universities`)
  if (!response.ok) throw new Error("Failed to fetch universities")
  const data = await response.json()
  return { data }
}

export const getUniversity = async (id) => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}`)
  if (!response.ok) throw new Error("Failed to fetch university")
  return response.json()
}

export const getUniversitiesByCountry = async (country) => {
  const response = await fetch(`${API_BASE_URL}/universities/country/${encodeURIComponent(country)}`)
  if (!response.ok) throw new Error("Failed to fetch universities by country")
  const data = await response.json()
  return { data }
}

export const createUniversity = async (data) => {
  const response = await fetch(`${API_BASE_URL}/universities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create university")
  return response.json()
}

export const updateUniversity = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update university")
  return response.json()
}

export const deleteUniversity = async (id) => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete university")
  return response.json()
}

// Syllabus
export const getSyllabus = async () => {
  const response = await fetch(`${API_BASE_URL}/syllabus`)
  if (!response.ok) throw new Error("Failed to fetch syllabus")
  const data = await response.json()
  return { data }
}

export const getSyllabusById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/syllabus/${id}`)
  if (!response.ok) throw new Error("Failed to fetch syllabus")
  return response.json()
}

export const getSyllabusByProgramCode = async (programCode) => {
  const response = await fetch(`${API_BASE_URL}/syllabus/program-code/${encodeURIComponent(programCode)}`)
  if (!response.ok) throw new Error("Failed to fetch syllabus by program code")
  return response.json()
}

export const createSyllabus = async (data) => {
  const response = await fetch(`${API_BASE_URL}/syllabus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create syllabus")
  return response.json()
}

export const updateSyllabus = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/syllabus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update syllabus")
  return response.json()
}

export const deleteSyllabus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/syllabus/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to delete syllabus")
  return response.json()
}

// Data Import
export const importColleges = async () => {
  const response = await fetch(`${API_BASE_URL}/data-import/colleges`, {
    method: "POST",
  })
  if (!response.ok) throw new Error("Failed to import colleges")
  return response.json()
}

export const importPrograms = async () => {
  const response = await fetch(`${API_BASE_URL}/data-import/programs`, {
    method: "POST",
  })
  if (!response.ok) throw new Error("Failed to import programs")
  return response.json()
}

export const importUniversities = async () => {
  const response = await fetch(`${API_BASE_URL}/data-import/universities`, {
    method: "POST",
  })
  if (!response.ok) throw new Error("Failed to import universities")
  return response.json()
}

export const importSyllabus = async () => {
  const response = await fetch(`${API_BASE_URL}/data-import/syllabus`, {
    method: "POST",
  })
  if (!response.ok) throw new Error("Failed to import syllabus")
  return response.json()
}

export const importAllData = async () => {
  const response = await fetch(`${API_BASE_URL}/data-import/all`, {
    method: "POST",
  })
  if (!response.ok) throw new Error("Failed to import all data")
  return response.json()
}

export const analyzeGradeSheet = async (file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/grades/ocr`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Grade analysis failed with status ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error(error.message || "Failed to analyze grade sheet")
  }
}

export const login = async (email, password) => {
  try {
    if (USE_MOCK_DATA) {
      const user = mockUsers[email]
      if (user && password) {
        return {
          token: "mock-token-" + Date.now(),
          user: user,
        }
      }
      throw new Error("Invalid credentials")
    }

    console.log('Sending login request to:', `${API_BASE_URL}/login`)
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for cookie-based auth
      body: JSON.stringify({ email, password }),
    })

    console.log('Login response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `Login failed with status ${response.status}`
      console.error('Login failed:', errorMessage, errorData)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Login successful, response data:', data)
    
    // Check if cookies were set (httpOnly cookies won't show in document.cookie)
    // But we can check response headers
    const setCookieHeader = response.headers.get('Set-Cookie')
    console.log('Set-Cookie header from login:', setCookieHeader ? 'present' : 'missing')
    
    // Tokens are now stored in httpOnly cookies, not localStorage
    // Wait a brief moment to ensure cookies are set before returning
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return data
  } catch (error) {
    console.error('Login error:', error)
    throw new Error(error.message || "Failed to connect to server. Make sure the backend is running.")
  }
}

export const register = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for cookie-based auth
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `Registration failed with status ${response.status}`
      throw new Error(errorMessage)
    }

    const responseData = await response.json()
    // Tokens are now stored in httpOnly cookies, not localStorage
    return responseData
  } catch (error) {
    throw error
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      let errorMessage = `Password reset request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData || errorMessage
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const text = await response.text()
          errorMessage = text || errorMessage
        } catch (e2) {
          // Keep default error message
        }
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    throw new Error(error.message || "Failed to request password reset. Please try again.")
  }
}

export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `OTP verification failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(error.message || "Failed to verify OTP. Please try again.")
  }
}

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Password reset failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(error.message || "Failed to reset password. Please try again.")
  }
}

// Token refresh function - now uses cookies
// forceRefresh: if true, bypass availability cache check (useful when we know backend is responding, e.g., 403 errors)
export const refreshAccessToken = async (forceRefresh = false) => {
  // If forceRefresh is true, skip availability check and try refresh directly
  // This is useful when we get 403 errors, which means backend IS available
  if (!forceRefresh) {
    // CRITICAL FIRST CHECK: If backend is marked as unavailable, return null immediately
    // This must be the FIRST thing we check to prevent ANY network calls
    if (backendAvailableCache.value === false) {
      return null
    }
    
    // Check cached value - if backend is marked as unavailable, skip immediately
    const now = Date.now()
    const cacheAge = now - backendAvailableCache.timestamp
    const cacheDuration = backendAvailableCache.value 
      ? BACKEND_CHECK_CACHE_DURATION_AVAILABLE 
      : BACKEND_CHECK_CACHE_DURATION_UNAVAILABLE
    
    // Only check backend availability if we think it might be available AND cache is expired
    let backendAvailable = false
    if (backendAvailableCache.value === true && cacheAge < cacheDuration) {
      // Backend was available and cache is still valid
      backendAvailable = true
    } else if (cacheAge >= cacheDuration) {
      // Cache expired - check backend (this might cause one error, but only once every 5 minutes)
      backendAvailable = await isBackendAvailable()
    } else {
      // Use cached value
      backendAvailable = backendAvailableCache.value || false
    }
    
    // If backend is not available, return null immediately without making any API calls
    if (!backendAvailable) {
      return null
    }
  } else {
    // Force refresh - mark backend as available since we got a response (even if 403)
    backendAvailableCache = { value: true, timestamp: Date.now() }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies for cookie-based auth
      body: JSON.stringify({}), // Refresh token is in cookie
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `Token refresh failed (${response.status})`
      console.error('Token refresh failed:', errorMessage, errorData)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    // Tokens are stored in httpOnly cookies by backend
    // Update user data if provided
    if (data.user) {
      const userData = {
        id: data.user.id || data.user.userId,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      }
      localStorage.setItem("user", JSON.stringify(userData))
      return { user: userData }
    }

    return data
  } catch (error) {
    // Handle connection errors gracefully (backend not running)
    if (error.name === "AbortError" || 
        error.message.includes("Failed to fetch") || 
        error.message.includes("ERR_CONNECTION_REFUSED") ||
        error.message.includes("NetworkError")) {
      // Backend is not available - don't clear user data, just return null
      // This allows the app to work in offline mode with stored user data
      // Update cache to mark backend as unavailable
      backendAvailableCache = { value: false, timestamp: Date.now() }
      return null
    }
    // For other errors (auth failures like expired refresh token), log but don't clear user data immediately
    // The calling code will handle redirecting to login if needed
    console.error('Token refresh error:', error.message)
    // Don't clear user data here - let the calling code decide
    // If refresh token is expired, user will need to log in again anyway
    return null
  }
}

// Logout function - calls backend to revoke tokens
export const logout = async () => {
  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include", // Include cookies
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    // Silently fail - logout should always succeed from frontend perspective
  }
  // Clear user data
  localStorage.removeItem("user")
}

// CSRF is disabled on backend, so no CSRF token handling needed

const buildAuthHeaders = async () => {
  const headers = {}
  // Tokens are now in httpOnly cookies, not in localStorage
  // Cookies are sent automatically with credentials: 'include'

  try {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      if (parsed?.id) {
        headers["X-User-Id"] = parsed.id
      }
      if (parsed?.role) {
        headers["X-User-Role"] = parsed.role
      }
    }
  } catch (error) {
    // Silently fail - user headers are optional
  }

  // CSRF is disabled on backend for authenticated endpoints
  // No need to add CSRF token

  return headers
}

// Enhanced fetch with automatic token refresh - cookie-based
export const fetchWithAuth = async (url, options = {}) => {
  const headers = await buildAuthHeaders()
  
  // Ensure credentials are included for cookie-based auth
  options.credentials = options.credentials || "include"
  options.headers = { ...options.headers, ...headers }
  
  console.log(`[fetchWithAuth] Making ${options.method || 'GET'} request to: ${url}`, {
    hasUserHeaders: !!headers['X-User-Id'],
    credentials: options.credentials,
    method: options.method || 'GET'
  })

  let response = await fetch(url, options)
  
  console.log(`[fetchWithAuth] Response status: ${response.status} for ${url}`, {
    hasUserId: !!headers['X-User-Id']
  })

  // If 401 or 403, try to refresh token and retry once
  // 403 can occur when token is expired but Spring Security returns 403 instead of 401
  // BUT: Don't try to refresh if this is a login/register/refresh endpoint (would cause infinite loop)
  const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/refresh')
  
  if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
    // Check if we have user data (which means we should be authenticated)
    const user = localStorage.getItem("user")
    if (!user) {
      // No user data, can't refresh - return the error
      console.warn('No user data found, cannot refresh token')
      return response
    }

    // Check if this is already a retry (to prevent infinite loops)
    if (options._retry) {
      // Already retried, return the error
      console.warn('Already retried, returning error response')
      return response
    }

    try {
      console.log(`Token may be expired (${response.status}), attempting refresh...`)
      // Force refresh since we got a response (403 means backend is available)
      const refreshResult = await refreshAccessToken(true)
      
      if (!refreshResult) {
        // Refresh failed - check the original error to see if it's an auth issue
        console.warn('Token refresh returned null or failed')
        
        // Read the error response to determine if it's an auth error
        let isAuthError = false
        try {
          const errorText = await response.clone().text()
          const errorData = JSON.parse(errorText)
          const errorMessage = (errorData.message || errorData.error || '').toLowerCase()
          isAuthError = errorMessage.includes('missing user context') || 
                       errorMessage.includes('expired') || 
                       errorMessage.includes('invalid') ||
                       errorMessage.includes('session') ||
                       errorMessage.includes('authentication')
        } catch (e) {
          // Can't parse error, assume it might be auth-related if refresh failed
          console.warn('Could not parse error response, assuming auth issue')
          isAuthError = true
        }
        
        // Only clear user data and redirect if it's clearly an auth error
        if (isAuthError) {
          console.warn('Auth error confirmed, will redirect to login')
          // Don't clear/redirect here - let the error propagate and handle in UI
          // The calling code can decide whether to redirect
        }
        
        // Return the original error response
        return response
      }

      // Update user data if provided
      if (refreshResult && typeof refreshResult === 'object' && refreshResult.user) {
        localStorage.setItem("user", JSON.stringify(refreshResult.user))
      }
      
      // Mark as retry to prevent infinite loops
      options._retry = true
      
      // Retry request with fresh cookies (automatically included)
      const newHeaders = await buildAuthHeaders()
      options.headers = { ...options.headers, ...newHeaders }
      response = await fetch(url, options)
      
      console.log(`Retry after refresh returned status: ${response.status}`)
      
      // If retry still fails with 403, log but don't automatically redirect
      // Let the calling code handle the error appropriately
      if (response.status === 403 && options._retry) {
        console.error('Retry after refresh still returned 403 - authentication may have failed')
        // Don't redirect here - let the error be handled by the calling code
        // This prevents automatic redirects that might interrupt user workflow
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Refresh failed, return original response
      return response
    }
  }

  return response
}

export const getUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID is required to fetch profile")

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to fetch user profile")
  }

  return response.json()
}

export const updateUserProfile = async (userId, data) => {
  if (!userId) throw new Error("User ID is required to update profile")

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to update user profile")
  }

  return response.json()
}

export const getSavedCareers = async (userId) => {
  if (!userId) throw new Error("User ID is required to fetch saved careers")

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers`, {
    method: "GET",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to fetch saved careers")
  }

  return response.json()
}

export const getSavedColleges = async (userId) => {
  if (!userId) throw new Error("User ID is required to fetch saved colleges")

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-colleges`, {
    method: "GET",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    // If unauthorized/forbidden, treat as "no saved colleges" instead of hard error
    if (response.status === 401 || response.status === 403) {
      return []
    }
    throw new Error(errorData.message || "Failed to fetch saved colleges")
  }

  return response.json()
}

export const saveCareer = async (userId, careerId, confidenceScore, matchReason, careerName) => {
  if (!userId) throw new Error("User ID is required to save career")
  
  // Check if careerId is a valid UUID
  const isUUID = careerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(careerId)
  
  let url, body
  if (isUUID) {
    // Use UUID endpoint
    url = `${API_BASE_URL}/users/${userId}/saved-careers`
    body = {
      careerId,
      confidenceScore: confidenceScore || null,
      matchReason: matchReason || null,
    }
    console.log(`Attempting to save career by UUID ${careerId} for user ${userId}`)
  } else if (careerName) {
    // Use name-based endpoint
    url = `${API_BASE_URL}/users/${userId}/saved-careers/by-name`
    body = {
      careerName,
      confidenceScore: confidenceScore || null,
      matchReason: matchReason || null,
    }
    console.log(`Attempting to save career by name ${careerName} for user ${userId}`)
  } else {
    throw new Error("Career ID or name is required")
  }

  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  console.log(`Save career response status: ${response.status}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || errorData.error || `Failed to save career (${response.status})`
    console.error('Save career error:', errorMessage, errorData)
    throw new Error(errorMessage)
  }

  const result = await response.json()
  console.log('Career saved successfully:', result)
  return result
}

export const unsaveCareer = async (userId, careerId) => {
  if (!userId) throw new Error("User ID is required to unsave career")
  if (!careerId) throw new Error("Career ID is required")

  // Check if careerId is a valid UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(careerId))
  
  if (isUUID) {
    // Try to unsave by careerId (UUID) first
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers/by-career/${careerId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        return true
      }
      // If that fails, try to find by saved career ID
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        // Career not found by careerId, try to find by saved career ID
        const savedCareers = await getSavedCareers(userId)
        const savedCareer = savedCareers.find(sc => 
          String(sc.careerId) === String(careerId)
        )
        if (savedCareer && savedCareer.id) {
          const deleteResponse = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers/${savedCareer.id}`, {
            method: "DELETE",
          })
          if (!deleteResponse.ok) {
            throw new Error(errorData.message || "Failed to unsave career")
          }
          return true
        }
      }
      throw new Error(errorData.message || "Failed to unsave career")
    } catch (error) {
      // If UUID-based unsave fails, fall through to name-based lookup
    }
  }

  // If not a UUID or UUID-based unsave failed, find by name
  try {
    const savedCareers = await getSavedCareers(userId)
    const careerIdStr = String(careerId).toLowerCase().trim()
    
    // Try to find saved career by matching name or title (case-insensitive)
    const savedCareer = savedCareers.find(sc => {
      const title = (sc.careerTitle || "").toLowerCase().trim()
      const name = (sc.careerName || "").toLowerCase().trim()
      return title === careerIdStr || name === careerIdStr || 
             title.includes(careerIdStr) || name.includes(careerIdStr)
    })
    
    if (savedCareer && savedCareer.id) {
      // Use the saved career's ID to unsave
      const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers/${savedCareer.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to unsave career")
      }
      return true
    }
    
    // If not found by name, try to find by careerId if it's a UUID
    if (isUUID) {
      const savedCareerByCareerId = savedCareers.find(sc => 
        String(sc.careerId) === String(careerId)
      )
      if (savedCareerByCareerId && savedCareerByCareerId.id) {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers/${savedCareerByCareerId.id}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to unsave career")
        }
        return true
      }
    }
    
    throw new Error("Career not found in saved items")
  } catch (error) {
    if (error.message === "Career not found in saved items") {
      throw error
    }
    throw new Error(error.message || "Failed to unsave career")
  }
}

export const saveCollege = async (userId, collegeId) => {
  if (!userId) throw new Error("User ID is required to save college")
  if (!collegeId) throw new Error("College ID is required")

  console.log(`Attempting to save college ${collegeId} for user ${userId}`)
  
  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-colleges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ collegeId }),
  })

  console.log(`Save college response status: ${response.status}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    let errorMessage = errorData.message || errorData.error || `Failed to save college (${response.status})`

    // Avoid showing "session expired" messages on generic 403s in local dev
    if (response.status === 403 && !errorMessage) {
      errorMessage = "Failed to save college (403)."
    }
    
    console.error('Save college error:', errorMessage, errorData)
    throw new Error(errorMessage)
  }

  const result = await response.json()
  console.log('College saved successfully:', result)
  return result
}

export const unsaveCollege = async (userId, collegeId) => {
  if (!userId) throw new Error("User ID is required to unsave college")
  if (!collegeId) throw new Error("College ID is required")

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-colleges/by-college/${collegeId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to unsave college")
  }

  return true
}

export const checkCareerSaved = async (userId, careerId) => {
  if (!userId || !careerId) return false

  // Only check if careerId is a valid UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(careerId)
  if (!isUUID) return false // Can't check non-UUID careers

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-careers/check/${careerId}`, {
      method: "GET",
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.saved === true
  } catch (error) {
    return false
  }
}

export const checkCollegeSaved = async (userId, collegeId) => {
  if (!userId || !collegeId) return false

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-colleges/check/${collegeId}`, {
      method: "GET",
    })

    if (!response.ok) return false

    const data = await response.json()
    return data.saved === true
  } catch (error) {
    return false
  }
}

// Admin Dashboard APIs
export const getAdminDashboardStats = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch admin dashboard stats: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getRecentActivity = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/recent-activity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch recent activity: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getGrowthMetrics = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/growth-metrics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch growth metrics: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getTrends = async (days = 30) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/trends?days=${days}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch trends: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getSystemHealth = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/system-health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch system health: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getEngagement = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/engagement`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch engagement metrics: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

export const getPendingCounts = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/pending-counts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch pending counts: ${response.status} ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}
