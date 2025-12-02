import api from "./api"

export const trainingService = {
  // Get all trainings
  getAll: () => api.get("/api/trainings"),

  // Get training by ID
  getById: (id) => api.get(`/api/trainings/${id}`),

  // Create training (admin)
  create: (trainingData) => api.post("/api/trainings", trainingData),

  // Update training (admin)
  update: (id, trainingData) => api.put(`/api/trainings/${id}`, trainingData),

  // Delete training (admin)
  delete: (id) => api.delete(`/api/trainings/${id}`),
}

export default trainingService
