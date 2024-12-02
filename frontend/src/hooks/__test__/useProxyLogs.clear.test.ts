import { renderHook, act } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { useProxyLogs } from '../useProxyLogs';
import { setupTest, getMockProxyService } from './useProxyLogs.setup';

describe('useProxyLogs - Clear', () => {
  const mockProxyService = getMockProxyService();
  let testSetup = setupTest();

  beforeEach(() => {
    jest.clearAllMocks();
    testSetup = setupTest();
    // Default to proxy tab
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('should clear logs successfully', async () => {
    mockProxyService.clearLogs.mockResolvedValue({});

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.clearLogs();
    });

    expect(mockProxyService.clearLogs).toHaveBeenCalled();
    expect(result.current.logs).toEqual([]);
    expect(testSetup.mockSetSelectedLog).toHaveBeenCalledWith(null);
    expect(testSetup.mockSetSuccess).toHaveBeenCalledWith('Logs cleared successfully');
  });

  it('should handle clear errors', async () => {
    const error = new Error('Failed to clear logs');
    mockProxyService.clearLogs.mockRejectedValue(error);

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.clearLogs();
    });

    expect(testSetup.mockSetError).toHaveBeenCalledWith('Failed to clear logs');
  });

  it('should handle loading state during clear', async () => {
    mockProxyService.clearLogs.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({}), 100);
    }));

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    expect(result.current.isLoading).toBe(false);

    const clearPromise = act(async () => {
      await result.current.clearLogs();
    });

    expect(result.current.isLoading).toBe(true);

    await clearPromise;

    expect(result.current.isLoading).toBe(false);
  });
});
