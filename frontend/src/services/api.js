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

// Universities endpoints
export const getUniversities = () => {
  return api.get('/api/universities');
};

export default api;
