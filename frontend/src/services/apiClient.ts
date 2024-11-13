import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    // Return the full response to preserve response.data structure
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
);

// Create an axios instance specifically for repeater requests
export const repeaterClient = axios.create({
  timeout: 30000, // 30 second timeout
});

export default api;
