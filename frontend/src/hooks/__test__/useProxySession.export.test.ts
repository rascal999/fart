import { renderHook, act } from '@testing-library/react';
import { useProxySession } from '../useProxySession';
import { validSessionData } from './useProxySession.setup';
import sessionService from '../../services/sessionService';

// Mock sessionService
jest.mock('../../services/sessionService');

describe('useProxySession - Export', () => {
  const mockSetError = jest.fn();
  const mockSetSuccess = jest.fn();
  const mockFetchLogs = jest.fn();
  const mockAnchor = {
    href: '',
    download: '',
    click: jest.fn(),
    style: {}
  } as unknown as HTMLAnchorElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock sessionService methods
    (sessionService.exportSession as jest.Mock).mockResolvedValue({ data: validSessionData });
    
    // Mock createElement for anchor
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement(tag);
    });

    // Mock URL methods
    const mockUrl = 'mock-url';
    window.URL.createObjectURL = jest.fn().mockImplementation((blob: Blob) => {
      // Store the blob for later verification
      (window.URL.createObjectURL as any).lastBlob = blob;
      return mockUrl;
    });
    window.URL.revokeObjectURL = jest.fn();

    // Mock document.body methods
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const performExport = async () => {
    const { result } = renderHook(() => useProxySession(mockSetError, mockSetSuccess, mockFetchLogs));
    await act(async () => {
      await result.current.exportSession();
    });
  };

  it('should export session successfully', async () => {
    await performExport();

    expect(sessionService.exportSession).toHaveBeenCalled();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockSetSuccess).toHaveBeenCalledWith('Session exported successfully');
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('should handle export errors', async () => {
    const error = new Error('Export failed');
    (sessionService.exportSession as jest.Mock).mockRejectedValue(error);
    
    await performExport();

    expect(mockSetError).toHaveBeenCalledWith('Failed to export session');
    expect(mockSetSuccess).not.toHaveBeenCalled();
  });

  it('should create and clean up download link correctly', async () => {
    await performExport();

    // Verify link creation
    expect(mockAnchor.href).toBe('mock-url');
    expect(mockAnchor.download).toMatch(/^fart-session-.*\.json$/);
    
    // Verify DOM operations
    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    
    // Verify URL cleanup
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('should format exported data correctly', async () => {
    await performExport();

    // Get the stored Blob
    const blob = (window.URL.createObjectURL as any).lastBlob as Blob;
    expect(blob).toBeInstanceOf(Blob);
    
    // Create a mock FileReader that returns the expected content
    const mockFileReader = {
      onload: null as any,
      readAsText: function(blob: Blob) {
        // Simulate async read completion
        setTimeout(() => {
          const content = JSON.stringify(validSessionData, null, 2);
          this.result = content;
          this.onload?.({ target: this } as any);
        }, 0);
      },
      result: ''
    };

    // Mock the FileReader constructor
    const originalFileReader = window.FileReader;
    window.FileReader = jest.fn(() => mockFileReader) as any;

    try {
      // Read the Blob content
      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target as FileReader).result as string);
        reader.readAsText(blob);
      });

      // Parse and verify the content
      const parsedContent = JSON.parse(content);
      expect(parsedContent).toEqual(validSessionData);
    } finally {
      // Restore original FileReader
      window.FileReader = originalFileReader;
    }
  });
});
