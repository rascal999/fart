// Mock axios
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  defaults: {
    headers: { common: {} }
  }
}));

// Mock API client
export const mockApiClient = {
  post: jest.fn((url: string, data?: any) => Promise.resolve({ data })),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

// Mock logging service
export const mockLoggingService = {
  info: jest.fn(),
  error: jest.fn()
};

// Mock session service
export const mockSessionService = {
  exportSession: jest.fn(),
  importSession: jest.fn().mockImplementation(async (data) => {
    return { data };
  })
};

// Mock all services
jest.mock('../../services/apiClient', () => ({
  __esModule: true,
  default: mockApiClient,
  API_BASE_URL: 'http://localhost:8001/api'
}));

jest.mock('../../services/loggingService', () => ({
  __esModule: true,
  default: mockLoggingService
}));

jest.mock('../../services/sessionService', () => ({
  __esModule: true,
  default: mockSessionService
}));

// Mock console methods to prevent noise in tests
const originalConsoleError = console.error;
console.error = jest.fn();

afterAll(() => {
  console.error = originalConsoleError;
});
