import api from "./api"

export const academicRecordService = {
  // Get all academic records
  getAll: () => api.get("/api/academic-records"),

  // Get academic record by ID
  getById: (id) => api.get(`/api/academic-records/${id}`),

  // Create academic record
  create: (recordData) => api.post("/api/academic-records", recordData),

  // Update academic record
  update: (id, recordData) => api.put(`/api/academic-records/${id}`, recordData),

  // Delete academic record
  delete: (id) => api.delete(`/api/academic-records/${id}`),
}

export default academicRecordService
