import { renderHook, act } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { useProxyLogs } from '../useProxyLogs';
import { setupTest, sampleLogs, getMockProxyService } from './useProxyLogs.setup';

describe('useProxyLogs - Fetch', () => {
  const mockProxyService = getMockProxyService();
  let testSetup = setupTest();

  beforeEach(() => {
    jest.clearAllMocks();
    testSetup = setupTest();
    // Default to proxy tab
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should fetch logs successfully', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(mockProxyService.getLogs).toHaveBeenCalled();
    expect(result.current.logs).toEqual(sampleLogs);
    expect(result.current.isLoading).toBe(false);
    expect(testSetup.mockSetError).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Network error');
    mockProxyService.getLogs.mockRejectedValue(error);

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(testSetup.mockSetError).toHaveBeenCalledWith('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch logs when not on proxy tab', async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/other' });
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.fetchLogs();
    });

    expect(mockProxyService.getLogs).not.toHaveBeenCalled();
  });

  it('should handle loading state correctly', async () => {
    mockProxyService.getLogs.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ data: sampleLogs }), 100);
    }));

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    expect(result.current.isLoading).toBe(false);

    const fetchPromise = act(async () => {
      await result.current.fetchLogs();
    });

    expect(result.current.isLoading).toBe(true);

    await fetchPromise;

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle throttling of fetch requests', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Call fetchLogs multiple times in quick succession
    await act(async () => {
      await result.current.fetchLogs();
      await result.current.fetchLogs();
      await result.current.fetchLogs();
    });

    // Only first call should go through due to throttling
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);
  });

  it('should abort in-flight request when component unmounts', async () => {
    mockProxyService.getLogs.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ data: sampleLogs }), 100);
    }));

    const { result, unmount } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    const fetchPromise = result.current.fetchLogs();
    unmount();

    await fetchPromise;

    expect(result.current.logs).toEqual([]);
  });
});
