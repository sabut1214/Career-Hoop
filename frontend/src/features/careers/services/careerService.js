import api from "@/shared/services/api"

export const careerService = {
  // Get all careers
  getAll: () => api.get("/api/careers"),

  // Get career by ID
  getById: (id) => api.get(`/api/careers/${id}`),

  // Create career (admin)
  create: (careerData) => api.post("/api/careers", careerData),

  // Update career (admin)
  update: (id, careerData) => api.put(`/api/careers/${id}`, careerData),

  // Delete career (admin)
  delete: (id) => api.delete(`/api/careers/${id}`),
}

export default careerService
