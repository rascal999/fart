import React, { ReactElement } from 'react';
import { render, renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#2d2d2d'
    },
    primary: {
      main: '#90caf9'
    }
  }
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

function customRenderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
): RenderHookResult<Result, Props> {
  return renderHook(render, {
    wrapper: AllTheProviders,
    ...options
  });
}

// Re-export everything
export * from '@testing-library/react';

// Override render methods
export { customRender as render, customRenderHook as renderHook };
