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
    console.warn("[v0] Unable to resolve stored userId:", error)
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

// Health Check
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch (error) {
    console.error("[v0] Health check failed:", error)
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
    console.error("getStudents error:", error)
    throw error
  }
}

export const getStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`)
  if (!response.ok) throw new Error("Failed to fetch student")
  return response.json()
}

export const createStudent = async (data) => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create student")
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
  const response = await fetch(`${API_BASE_URL}/careers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create career")
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
  const response = await fetch(`${API_BASE_URL}/colleges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create college")
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
  const response = await fetch(`${API_BASE_URL}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create training")
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

  const response = await fetch(`${API_BASE_URL}/quiz/start`, {
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

  const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
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

  const response = await fetch(`${API_BASE_URL}/quiz/stats`)
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

  const response = await fetch(`${API_BASE_URL}/quiz/stats/user/${resolvedUserId}`)
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

  const response = await fetch(`${API_BASE_URL}/quiz/history/user/${resolvedUserId}`)
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

  const response = await fetch(`${API_BASE_URL}/recommendations/trainings/user/${resolvedUserId}`)
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

  const response = await fetch(`${API_BASE_URL}/feedback/ai/user/${resolvedUserId}`)
  if (!response.ok) throw new Error("Failed to fetch AI feedback")
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
    console.error("getAcademicRecords error:", error)
    throw error
  }
}

export const getAcademicRecord = async (id) => {
  const response = await fetch(`${API_BASE_URL}/academic-records/${id}`)
  if (!response.ok) throw new Error("Failed to fetch academic record")
  return response.json()
}

export const getStudentAcademicRecords = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/academic-records/student/${studentId}`)
  if (!response.ok) throw new Error("Failed to fetch student academic records")
  return response.json()
}

export const createAcademicRecord = async (data) => {
  const response = await fetch(`${API_BASE_URL}/academic-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create academic record")
  return response.json()
}

export const updateAcademicRecord = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/academic-records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update academic record")
  return response.json()
}

export const deleteAcademicRecord = async (id) => {
  const response = await fetch(`${API_BASE_URL}/academic-records/${id}`, {
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
    console.error("[v0] Grade sheet analysis error:", error)
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

    console.log("[v0] Attempting login to:", `${API_BASE_URL}/login`)
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Login failed with status ${response.status}`)
    }

    const data = await response.json()
    
    // Store refresh token if provided
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }
    
    return data
  } catch (error) {
    console.error("[v0] Login error:", error)
    throw new Error(error.message || "Failed to connect to server. Make sure the backend is running.")
  }
}

export const register = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Registration failed")

    const responseData = await response.json()

    // Store refresh token if provided
    if (responseData.refreshToken) {
      localStorage.setItem("refreshToken", responseData.refreshToken)
    }

    return responseData
  } catch (error) {
    console.error("[v0] Register error:", error)
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
    console.error("[v0] Forgot password error:", error)
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
    console.error("[v0] Verify OTP error:", error)
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
    console.error("[v0] Reset password error:", error)
    throw new Error(error.message || "Failed to reset password. Please try again.")
  }
}

// Token refresh function
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Token refresh failed")
    }

    const data = await response.json()
    
    // Update stored tokens
    if (data.token) {
      localStorage.setItem("authToken", data.token)
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }

    return data.token
  } catch (error) {
    console.error("[v0] Token refresh error:", error)
    // Clear tokens on refresh failure
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    throw error
  }
}

// Check if token is expired (client-side check)
const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".")
    if (parts.length !== 3) return true

    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch (error) {
    return true
  }
}

const buildAuthHeaders = () => {
  const headers = {}
  const token = localStorage.getItem("authToken")
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

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
    console.warn("[v0] Unable to include user headers:", error)
  }

  return headers
}

// Enhanced fetch with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
  const headers = buildAuthHeaders()
  const token = localStorage.getItem("authToken")

  // Check if token is expired before making request
  if (token && isTokenExpired(token)) {
    try {
      await refreshAccessToken()
      // Rebuild headers with new token
      const newHeaders = buildAuthHeaders()
      options.headers = { ...options.headers, ...newHeaders }
    } catch (error) {
      // Refresh failed, redirect to login will be handled by caller
      throw new Error("Token expired and refresh failed")
    }
  } else {
    options.headers = { ...options.headers, ...headers }
  }

  let response = await fetch(url, options)

  // If 401, try to refresh token and retry once
  if (response.status === 401 && token) {
    try {
      await refreshAccessToken()
      // Retry with new token
      const newHeaders = buildAuthHeaders()
      options.headers = { ...options.headers, ...newHeaders }
      response = await fetch(url, options)
    } catch (error) {
      // Refresh failed, return original 401 response
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
  } else if (careerName) {
    // Use name-based endpoint
    url = `${API_BASE_URL}/users/${userId}/saved-careers/by-name`
    body = {
      careerName,
      confidenceScore: confidenceScore || null,
      matchReason: matchReason || null,
    }
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || errorData.error || "Failed to save career"
    console.error("Save career error:", errorMessage, { url, body, status: response.status })
    throw new Error(errorMessage)
  }

  return response.json()
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
      console.warn("Failed to unsave by UUID, trying name-based lookup:", error)
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

  const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}/saved-colleges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ collegeId }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "Failed to save college")
  }

  return response.json()
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
    console.error("Error checking if career is saved:", error)
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
    console.error("Error checking if college is saved:", error)
    return false
  }
}

export const logout = async () => {
  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Logout failed:", error)
  } finally {
    // Clear all tokens on logout
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  }
}
