import { act } from '@testing-library/react';
import { renderHook } from '../../test-utils';
import { useProxySession } from '../useProxySession';
import { validSessionData, mockSessionService } from './useProxySession.setup';

describe('useProxySession - Import', () => {
  const mockSetError = jest.fn();
  const mockSetSuccess = jest.fn();
  const mockFetchLogs = jest.fn().mockResolvedValue(undefined);
  const mockInput = {
    type: '',
    accept: '',
    click: jest.fn(),
    onchange: null,
    style: {},
    files: [],
    value: '',
    disabled: false,
    readOnly: false,
    required: false,
    form: null,
    name: '',
    defaultValue: '',
    size: 20,
    minLength: -1,
    maxLength: -1,
    selectionStart: null,
    selectionEnd: null,
    selectionDirection: null,
    validity: {} as ValidityState,
    validationMessage: '',
    willValidate: true,
    checkValidity: jest.fn().mockReturnValue(true),
    reportValidity: jest.fn().mockReturnValue(true),
    select: jest.fn(),
    setCustomValidity: jest.fn(),
    setRangeText: jest.fn(),
    setSelectionRange: jest.fn(),
    stepDown: jest.fn(),
    stepUp: jest.fn()
  } as unknown as HTMLInputElement;

  let mockCreateElement: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Create a div element for non-input elements
    const div = document.createElement('div');
    
    // Mock createElement
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'input') {
        return mockInput;
      }
      return div;
    });

    // Reset mock responses and set default success response
    mockSessionService.importSession.mockReset();
    mockSessionService.importSession.mockResolvedValue({ data: validSessionData });
  });

  afterEach(() => {
    mockCreateElement.mockRestore();
    jest.useRealTimers();
  });

  const waitForPromises = async () => {
    await act(async () => {
      await Promise.resolve();
      jest.runAllTimers();
      await Promise.resolve();
    });
  };

  const createMockEvent = (files: File[]) => ({
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    returnValue: true,
    timeStamp: Date.now(),
    type: 'change',
    target: { files },
    preventDefault: () => {},
    stopPropagation: () => {},
    stopImmediatePropagation: () => {},
    composedPath: () => [],
    initEvent: () => {}
  } as unknown as Event);

  const simulateFileSelection = async (file: File) => {
    await act(async () => {
      const mockEvent = createMockEvent([file]);
      mockInput.onchange!(mockEvent);
      await waitForPromises();
    });
  };

  it('should import valid session data successfully', async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    const mockFile = new File([JSON.stringify(validSessionData)], 'session.json', { type: 'application/json' });
    await simulateFileSelection(mockFile);

    expect(mockSessionService.importSession).toHaveBeenCalledWith(validSessionData);
    expect(mockFetchLogs).toHaveBeenCalled();
    expect(mockSetSuccess).toHaveBeenCalledWith('Session imported successfully');
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON data', async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    const mockFile = new File(['invalid json'], 'session.json', { type: 'application/json' });
    await simulateFileSelection(mockFile);

    expect(mockSetError).toHaveBeenCalledWith('Failed to import session: Invalid JSON format');
    expect(mockSetSuccess).not.toHaveBeenCalled();
  });

  it('should handle invalid session data structure', async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    const invalidData = { ...validSessionData, logs: undefined };
    const mockFile = new File([JSON.stringify(invalidData)], 'session.json', { type: 'application/json' });
    await simulateFileSelection(mockFile);

    expect(mockSetError).toHaveBeenCalledWith('Failed to import session: Invalid session data structure');
    expect(mockSetSuccess).not.toHaveBeenCalled();
  });

  it('should handle import service errors', async () => {
    // Set up the mock to reject with an error
    mockSessionService.importSession.mockImplementationOnce(() => Promise.reject(new Error('Import failed')));
    
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    const mockFile = new File([JSON.stringify(validSessionData)], 'session.json', { type: 'application/json' });
    await simulateFileSelection(mockFile);

    expect(mockSetError).toHaveBeenCalledWith('Failed to import session: Import failed');
    expect(mockSetSuccess).not.toHaveBeenCalled();
  });

  it('should handle file input setup correctly', async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    expect(mockInput.type).toBe('file');
    expect(mockInput.accept).toBe('.json');
    expect(mockInput.click).toHaveBeenCalled();
  });

  it('should handle no file selected', async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    
    await act(async () => {
      await result.current.importSession();
      await waitForPromises();
    });

    await act(async () => {
      const mockEvent = createMockEvent([]);
      mockInput.onchange!(mockEvent);
      await waitForPromises();
    });

    expect(mockSessionService.importSession).not.toHaveBeenCalled();
    expect(mockSetSuccess).not.toHaveBeenCalled();
    expect(mockSetError).not.toHaveBeenCalled();
  });
});
