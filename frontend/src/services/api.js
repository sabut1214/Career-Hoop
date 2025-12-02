import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health check endpoint
export const healthCheck = () => {
  return api.get('/health');
};

// Careers endpoints
export const getCareers = () => {
  return api.get('/api/careers');
};

export const getCareerById = (id) => {
  return api.get(`/api/careers/${id}`);
};

// Colleges endpoints
export const getColleges = (params = {}) => {
  return api.get('/api/colleges', { params });
};

export const getCollegeById = (id) => {
  return api.get(`/api/colleges/${id}`);
};

// Students endpoints
export const getStudents = () => {
  return api.get('/api/students');
};

export const getStudentById = (id) => {
  return api.get(`/api/students/${id}`);
};

export const createStudent = (studentData) => {
  return api.post('/api/students', studentData);
};

// Mentors endpoints
export const getMentors = () => {
  return api.get('/api/mentors');
};

export const getAvailableMentors = () => {
  return api.get('/api/mentors/available');
};

export const getMentorById = (id) => {
  return api.get(`/api/mentors/${id}`);
};

export const createMentor = (mentorData) => {
  return api.post('/api/mentors', mentorData);
};

// Scholarships endpoints
export const getScholarships = () => {
  return api.get('/api/scholarships');
};

export const getActiveScholarships = () => {
  return api.get('/api/scholarships/active');
};

export const getScholarshipById = (id) => {
  return api.get(`/api/scholarships/${id}`);
};

export const createScholarship = (scholarshipData) => {
  return api.post('/api/scholarships', scholarshipData);
};

// Trainings endpoints
export const getTrainings = () => {
  return api.get('/api/trainings');
};

export const getTrainingById = (id) => {
  return api.get(`/api/trainings/${id}`);
};

export const createTraining = (trainingData) => {
  return api.post('/api/trainings', trainingData);
};

// Academic Records endpoints
export const getAcademicRecords = () => {
  return api.get('/api/academic-records');
};

export const getAcademicRecordById = (id) => {
  return api.get(`/api/academic-records/${id}`);
};

export const getAcademicRecordsByStudent = (studentId) => {
  return api.get(`/api/academic-records/student/${studentId}`);
};

export const createAcademicRecord = (recordData) => {
  return api.post('/api/academic-records', recordData);
};

export default api;
