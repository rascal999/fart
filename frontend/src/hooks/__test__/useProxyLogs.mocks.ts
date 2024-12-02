// Mock proxy service
export const getMockProxyService = () => ({
  getLogs: jest.fn(),
  clearLogs: jest.fn(),
  deleteLog: jest.fn()
});

// Mock useLocation
export const getMockUseLocation = () => jest.fn(() => ({ pathname: '/' }));

// Mock all services
jest.mock('../../services/proxyService', () => ({
  __esModule: true,
  default: getMockProxyService()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: getMockUseLocation()
}));
