import api from "./api"

export const collegeService = {
  // Get all colleges with optional filters
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.append("page", filters.page)
    if (filters.size !== undefined) params.append("size", filters.size)
    if (filters.location) params.append("location", filters.location)
    if (filters.affiliation) params.append("affiliation", filters.affiliation)
    if (filters.minYear) params.append("minYear", filters.minYear)
    if (filters.maxYear) params.append("maxYear", filters.maxYear)
    if (filters.program) params.append("program", filters.program)
    if (filters.type) params.append("type", filters.type)
    if (filters.sortBy) params.append("sortBy", filters.sortBy)
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
    
    const queryString = params.toString()
    return api.get(`/api/colleges${queryString ? `?${queryString}` : ""}`)
  },

  // Get filter options
  getFilterOptions: () => api.get("/api/colleges/filters/options"),

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
