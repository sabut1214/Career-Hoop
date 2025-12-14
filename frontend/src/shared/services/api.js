import axios from 'axios';
import { refreshAccessToken } from '@/shared/lib/api';

// Get API base URL from environment or default to localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function to refresh token and retry the request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const refreshTokenAndRetry = async (originalRequest) => {
  if (isRefreshing) {
    // If already refreshing, queue this request
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(() => {
      // Retry the original request with cookies (automatically included)
      return api(originalRequest);
    }).catch(err => {
      return Promise.reject(err);
    });
  }

  isRefreshing = true;

  try {
    console.log('Attempting to refresh token due to 403 error...');
    const refreshResult = await refreshAccessToken();
    
    if (!refreshResult) {
      // Backend unavailable or refresh returned null
      console.warn('Token refresh returned null - backend may be unavailable');
      isRefreshing = false;
      processQueue(new Error('Token refresh failed - backend unavailable'), null);
      // Don't redirect if backend is just unavailable
      return Promise.reject(new Error('Backend unavailable'));
    }
    
    console.log('Token refresh successful, retrying original request...');
    isRefreshing = false;
    processQueue(null);
    
    // Retry the original request with fresh cookies
    // Ensure credentials are included
    originalRequest.withCredentials = true;
    return api(originalRequest);
  } catch (error) {
    console.error('Token refresh failed:', error);
    isRefreshing = false;
    processQueue(error, null);
    
    // Refresh failed - redirect to login
    localStorage.removeItem("user");
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for large responses
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for cookie-based authentication
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Add request interceptor for JWT token and logging
api.interceptors.request.use(
  (config) => {
    // Try to add JWT token from localStorage if available (for backward compatibility)
    // But prefer cookie-based auth (withCredentials: true is set above)
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure credentials are included for cookie-based auth
    config.withCredentials = true;
    
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
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    // Handle authentication/authorization errors
    if (status === 401) {
      console.error('API Error: Unauthorized - Token may be expired or invalid');
      // Clear invalid token
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.error('API Error: Forbidden - Token may be missing or invalid');
      // With cookie-based auth, tokens are in httpOnly cookies
      // Check if we have user data (which means we should be authenticated)
      const user = localStorage.getItem("user");
      if (!user) {
        console.error('No user found - redirecting to login');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        // User exists but got 403 - might be token expired, try refresh
        // Check if this is already a retry (to prevent infinite loops)
        const isRetry = error.config._retry || false;
        if (isRetry) {
          console.error('Retry also failed with 403 - redirecting to login');
          localStorage.removeItem("user");
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
        
        console.warn('User authenticated but got 403 - attempting token refresh');
        // Mark as retry to prevent infinite loops
        error.config._retry = true;
        // Try to refresh the token
        return refreshTokenAndRetry(error.config);
      }
    }
    
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
