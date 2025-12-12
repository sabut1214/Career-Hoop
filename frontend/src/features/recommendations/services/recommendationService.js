import api from "@/shared/services/api"

export const recommendationService = {
  getByGrades: (payload) => api.post("/api/recommendations/grades", payload),
  getByInterests: (payload) => api.post("/api/recommendations/interests", payload),
}

export default recommendationService

