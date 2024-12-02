import { screen } from '@testing-library/react';
import { render } from './test-utils';
import App from './App';

// Mock components to prevent unnecessary rendering
jest.mock('./components/ProxyTab', () => () => null);
jest.mock('./components/SettingsTab', () => () => null);
jest.mock('./components/RepeaterTab', () => () => null);
jest.mock('./components/LogTab', () => () => null);

// Mock repeater hooks
jest.mock('./hooks/useRepeaterState', () => ({
  useRepeaterState: () => ({
    state: {},
    updateState: jest.fn(),
    getActiveTab: jest.fn(),
    updateTabs: jest.fn(),
    updateActiveTab: jest.fn(),
    setError: jest.fn(),
    setSuccess: jest.fn(),
    setIsLoading: jest.fn(),
    setMenuAnchor: jest.fn(),
    setImportDialogOpen: jest.fn(),
    setImportData: jest.fn()
  })
}));

jest.mock('./hooks/useRepeaterActions', () => ({
  useRepeaterActions: () => ({
    createNewTab: jest.fn(),
    updateRequest: jest.fn(),
    sendRequest: jest.fn(),
    deleteTab: jest.fn(),
    importRequest: jest.fn()
  })
}));

jest.mock('./hooks/useRepeaterEffects', () => ({
  useRepeaterEffects: jest.fn()
}));

// Mock react-router-dom hooks that aren't handled by test-utils
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn()
}));

describe('App', () => {
  it('renders FART Proxy header', () => {
    render(<App />);
    const headerElement = screen.getByText(/FART Proxy/i);
    expect(headerElement).toBeInTheDocument();
  });
});
