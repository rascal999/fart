import axios from 'axios';

// Get API host from environment, window location, or default
const API_HOST = process.env.REACT_APP_API_HOST || window.location.hostname;
// Get API port from environment or default
const API_PORT = process.env.REACT_APP_API_PORT || '8001';

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

console.log('API Configuration:', {
  host: API_HOST,
  port: API_PORT,
  baseUrl: API_BASE_URL,
  windowLocation: window.location.toString()
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout
  timeout: 5000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });

    // Enhance error message with more details
    if (error.response?.data?.detail) {
      error.message = `API Error: ${error.response.data.detail}`;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your connection.';
    } else if (!error.response) {
      error.message = 'Unable to connect to API. Please check if the server is running.';
    }

    return Promise.reject(error);
  }
);

// Create an axios instance specifically for repeater requests
export const repeaterClient = axios.create({
  timeout: 30000, // 30 second timeout
});

// Add request/response interceptors to repeater client for debugging
repeaterClient.interceptors.request.use(
  (config) => {
    console.log('Repeater Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Repeater Request Error:', error);
    return Promise.reject(error);
  }
);

repeaterClient.interceptors.response.use(
  (response) => {
    console.log('Repeater Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Repeater Response Error:', error);
    return Promise.reject(error);
  }
);

export default api;
