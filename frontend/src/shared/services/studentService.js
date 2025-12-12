import api from "@/shared/services/api"

export const studentService = {
  // Get all students
  getAll: () => api.get("/api/students"),

  // Get student by ID
  getById: (id) => api.get(`/api/students/${id}`),

  // Create new student
  create: (studentData) => api.post("/api/students", studentData),

  // Update student
  update: (id, studentData) => api.put(`/api/students/${id}`, studentData),

  // Delete student
  delete: (id) => api.delete(`/api/students/${id}`),

  // Get student by email
  getByEmail: (email) => api.get(`/api/students/email/${email}`),
}

export default studentService
