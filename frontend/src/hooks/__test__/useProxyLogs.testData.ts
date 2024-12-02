import { ProxyLog } from '../../services/types';

// Sample logs for testing
export const sampleLogs: ProxyLog[] = [
  {
    id: 1,
    timestamp: '2024-03-20T10:00:00Z',
    method: 'GET',
    url: 'http://example.com',
    status: 200,
    request_headers: {},
    response_headers: {}
  },
  {
    id: 2,
    timestamp: '2024-03-20T10:01:00Z',
    method: 'POST',
    url: 'http://example.com/api',
    status: 201,
    request_headers: {},
    response_headers: {}
  }
];

// Test setup utility
export const setupTest = () => {
  const mockSetError = jest.fn();
  const mockSetSuccess = jest.fn();
  const mockSetSelectedLog = jest.fn();
  const mockSelectedLog = null;

  return {
    mockSetError,
    mockSetSuccess,
    mockSetSelectedLog,
    mockSelectedLog
  };
};
