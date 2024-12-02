import { renderHook, act } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { useProxyLogs } from '../useProxyLogs';
import { setupTest, sampleLogs, getMockProxyService } from './useProxyLogs.setup';

describe('useProxyLogs - Delete', () => {
  const mockProxyService = getMockProxyService();
  let testSetup = setupTest();

  beforeEach(() => {
    jest.clearAllMocks();
    testSetup = setupTest();
    // Default to proxy tab
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('should delete log successfully', async () => {
    mockProxyService.deleteLog.mockResolvedValue({});
    const logToDelete = sampleLogs[0];

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      logToDelete
    ));

    // Set initial logs
    act(() => {
      (result.current as any).setLogs(sampleLogs);
    });

    await act(async () => {
      await result.current.deleteLog(logToDelete);
    });

    expect(mockProxyService.deleteLog).toHaveBeenCalledWith(logToDelete.id);
    expect(testSetup.mockSetSelectedLog).toHaveBeenCalledWith(null);
    expect(testSetup.mockSetSuccess).toHaveBeenCalledWith('Log deleted successfully');
  });

  it('should handle delete errors', async () => {
    const error = new Error('Failed to delete log');
    mockProxyService.deleteLog.mockRejectedValue(error);

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    await act(async () => {
      await result.current.deleteLog(sampleLogs[0]);
    });

    expect(testSetup.mockSetError).toHaveBeenCalledWith('Failed to delete log');
  });

  it('should handle loading state during delete', async () => {
    mockProxyService.deleteLog.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({}), 100);
    }));

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      testSetup.mockSelectedLog
    ));

    expect(result.current.isLoading).toBe(false);

    const deletePromise = act(async () => {
      await result.current.deleteLog(sampleLogs[0]);
    });

    expect(result.current.isLoading).toBe(true);

    await deletePromise;

    expect(result.current.isLoading).toBe(false);
  });

  it('should update selected log when deleting currently selected log', async () => {
    mockProxyService.deleteLog.mockResolvedValue({});
    const selectedLog = sampleLogs[0];

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      selectedLog
    ));

    await act(async () => {
      await result.current.deleteLog(selectedLog);
    });

    expect(testSetup.mockSetSelectedLog).toHaveBeenCalledWith(null);
  });

  it('should not update selected log when deleting different log', async () => {
    mockProxyService.deleteLog.mockResolvedValue({});
    const selectedLog = { ...sampleLogs[0], id: 2 };

    const { result } = renderHook(() => useProxyLogs(
      testSetup.mockSetError,
      testSetup.mockSetSuccess,
      testSetup.mockSetSelectedLog,
      selectedLog
    ));

    await act(async () => {
      await result.current.deleteLog(sampleLogs[0]);
    });

    expect(testSetup.mockSetSelectedLog).not.toHaveBeenCalled();
  });
});
