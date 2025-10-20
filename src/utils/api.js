// src/utils/api.js
import axios from 'axios';

// Use environment variable or fallback to local backend
const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Normalize: remove trailing slashes, then append '/api'
const API_BASE = raw.replace(/\/+$/, '') + '/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Request interceptor (for adding auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    // Example: attach token if stored in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => {
    // Axios automatically parses JSON responses
    return response.data;
  },
  (error) => {
    let message = 'Network error';
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      message = data.message || `Request failed with status ${status}`;
    } else if (error.request) {
      message = 'No response received from server';
    } else {
      message = error.message;
    }

    // Throw a clean error object
    const err = new Error(message);
    err.status = error.response?.status;
    err.payload = error.response?.data;
    throw err;
  }
);

export default api;

// Example usage elsewhere:
// import api from '@/utils/api';
// const customers = await api.get('/customers');
// const newOrder = await api.post('/orders', { item: 'Shoes', quantity: 2 });
