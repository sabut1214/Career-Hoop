import api from "./api"

export const mentorService = {
  // Get all mentors
  getAll: () => api.get("/api/mentors"),

  // Get available mentors
  getAvailable: () => api.get("/api/mentors/available"),

  // Get mentor by ID
  getById: (id) => api.get(`/api/mentors/${id}`),

  // Create mentor
  create: (mentorData) => api.post("/api/mentors", mentorData),

  // Update mentor
  update: (id, mentorData) => api.put(`/api/mentors/${id}`, mentorData),

  // Delete mentor (admin)
  delete: (id) => api.delete(`/api/mentors/${id}`),
}

export default mentorService
