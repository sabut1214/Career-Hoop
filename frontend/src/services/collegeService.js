import api from "./api"

export const collegeService = {
  // Get all colleges
  getAll: () => api.get("/api/colleges"),

  // Get college by ID
  getById: (id) => api.get(`/api/colleges/${id}`),

  // Create college (admin)
  create: (collegeData) => api.post("/api/colleges", collegeData),

  // Update college (admin)
  update: (id, collegeData) => api.put(`/api/colleges/${id}`, collegeData),

  // Delete college (admin)
  delete: (id) => api.delete(`/api/colleges/${id}`),
}

export default collegeService
