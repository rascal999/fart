import '@testing-library/jest-dom';
import React from 'react';

// Mock React hooks
const mockUseCallback = (callback: Function) => callback;
const mockUseState = (initialValue: any) => [initialValue, jest.fn()];

// Mock React with proper hook implementations
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: mockUseCallback,
  useState: mockUseState
}));

// Mock react-dom/client
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// Mock react-dom
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

// Mock @mui/material components
jest.mock('@mui/material', () => {
  const React = jest.requireActual('react');
  return {
    ...jest.requireActual('@mui/material'),
    createTheme: () => ({
      palette: {
        mode: 'dark',
        background: { default: '#1e1e1e', paper: '#2d2d2d' },
        primary: { main: '#90caf9' }
      },
      typography: {
        fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {}
        }
      }
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    CssBaseline: () => null,
    Container: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Box: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    AppBar: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Typography: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Tabs: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    Tab: () => null
  };
});

// Mock window.URL
window.URL.createObjectURL = jest.fn(() => 'mock-url');
window.URL.revokeObjectURL = jest.fn();

// Mock TextEncoder and TextDecoder if they're not available
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encode(str: string) {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      return arr;
    }
  } as any;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class {
    decode(arr: Uint8Array) {
      return Array.from(arr)
        .map(byte => String.fromCharCode(byte))
        .join('');
    }
  } as any;
}

// Mock document.body functions
const mockAppendChild = jest.fn((element) => element);
const mockRemoveChild = jest.fn();

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
  document.body.innerHTML = '';

  // Mock body methods
  jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
  jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

  // Suppress console errors during tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore original methods
  jest.restoreAllMocks();
});
