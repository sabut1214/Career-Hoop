import api from "@/shared/services/api"

export const recommendationService = {
  getByGrades: (payload) => api.post("/api/recommendations/grades", payload),
  getByInterests: (payload) => api.post("/api/recommendations/interests", payload),
  getPreview: (type = "grades", payload = null, limit = 5) => {
    const queryParams = `?type=${type}&limit=${limit}`
    if (payload) {
      return api.post(`/api/recommendations/preview${queryParams}`, payload)
    }
    return api.post(`/api/recommendations/preview${queryParams}`, {})
  },
}

export default recommendationService

