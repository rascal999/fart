import { renderHook, act } from '@testing-library/react';
import { useProxyLogs } from '../useProxyLogs';
import { getMockProxyService, getMockUseLocation } from './useProxyLogs.mocks';
import { sampleLogs, setupTest } from './useProxyLogs.testData';

describe('useProxyLogs - Polling', () => {
  const mockProxyService = getMockProxyService();
  const mockUseLocation = getMockUseLocation();
  let testSetup = setupTest();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    testSetup = setupTest();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should start polling on mount when on proxy tab', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should have made another fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(2);
  });

  it('should stop polling when leaving proxy tab', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { rerender } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Change route
    mockUseLocation.mockReturnValue({ pathname: '/other' });
    rerender();

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should not have made any more fetches
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);
  });

  it('should resume polling when returning to proxy tab', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { rerender } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Leave proxy tab
    mockUseLocation.mockReturnValue({ pathname: '/other' });
    rerender();

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Return to proxy tab
    mockUseLocation.mockReturnValue({ pathname: '/' });
    rerender();

    // Should make a new fetch when returning
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(2);

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should continue polling
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(3);
  });

  it('should stop polling on unmount', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { unmount } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Unmount component
    unmount();

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should not have made any more fetches
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);
  });

  it('should handle polling start/stop methods', async () => {
    mockProxyService.getLogs.mockResolvedValue({ data: sampleLogs });

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Stop polling
    act(() => {
      result.current.stopPolling();
    });

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should not have made any more fetches
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(1);

    // Start polling again
    act(() => {
      result.current.startPolling();
    });

    // Should make a new fetch when starting
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(2);

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should continue polling
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(3);
  });

  it('should handle polling errors gracefully', async () => {
    const error = new Error('Network error');
    mockProxyService.getLogs.mockRejectedValue(error);

    renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    // Initial fetch (will fail)
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(testSetup.mockSetError).toHaveBeenCalledWith('Network error');

    // Fast-forward time
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Should continue polling despite error
    expect(mockProxyService.getLogs).toHaveBeenCalledTimes(2);
  });
});
