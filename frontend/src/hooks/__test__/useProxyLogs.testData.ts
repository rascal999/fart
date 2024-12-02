import { ProxyLog } from '../../services/types';

// Sample logs for testing
export const sampleLogs: ProxyLog[] = [
  {
    id: 1,
    timestamp: '2024-03-20T10:00:00Z',
    method: 'GET',
    url: 'http://example.com',
    status: 200,
    content_length: 1024,
    request: {
      method: 'GET',
      url: 'http://example.com',
      headers: {},
      content: null
    },
    response: {
      status_code: 200,
      headers: {},
      content: null
    }
  },
  {
    id: 2,
    timestamp: '2024-03-20T10:01:00Z',
    method: 'POST',
    url: 'http://example.com/api',
    status: 201,
    content_length: 512,
    request: {
      method: 'POST',
      url: 'http://example.com/api',
      headers: {},
      content: null
    },
    response: {
      status_code: 201,
      headers: {},
      content: null
    }
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
