import api from "./api"

export const scholarshipService = {
  // Get all scholarships
  getAll: () => api.get("/api/scholarships"),

  // Get active scholarships
  getActive: () => api.get("/api/scholarships/active"),

  // Get scholarship by ID
  getById: (id) => api.get(`/api/scholarships/${id}`),

  // Create scholarship (admin)
  create: (scholarshipData) => api.post("/api/scholarships", scholarshipData),

  // Update scholarship (admin)
  update: (id, scholarshipData) => api.put(`/api/scholarships/${id}`, scholarshipData),

  // Delete scholarship (admin)
  delete: (id) => api.delete(`/api/scholarships/${id}`),
}

export default scholarshipService
