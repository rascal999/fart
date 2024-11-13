import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Tabs, Tab, AppBar, Typography, Container, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import ProxyTab from './components/ProxyTab';
import SettingsTab from './components/SettingsTab';
import RepeaterTab from './components/RepeaterTab';
import LogTab from './components/LogTab';
import { useRepeaterState } from './hooks/useRepeaterState';
import { useRepeaterActions } from './hooks/useRepeaterActions';
import { useRepeaterEffects } from './hooks/useRepeaterEffects';

// Import Prism CSS and setup
import './utils/prism';
import 'prismjs/themes/prism-tomorrow.css';

// Create dark theme
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
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          '& pre': {
            margin: 0,
            backgroundColor: 'transparent !important',
          },
          '& code': {
            backgroundColor: 'transparent !important',
            textShadow: 'none !important',
          }
        }
      }
    }
  }
});

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize repeater state at the top level
  const repeaterState = useRepeaterState();
  const repeaterActions = useRepeaterActions(
    repeaterState.getActiveTab,
    repeaterState.updateTabs,
    repeaterState.updateActiveTab,
    repeaterState.setError,
    repeaterState.setSuccess,
    repeaterState.setIsLoading,
    repeaterState.setMenuAnchor,
    repeaterState.setImportDialogOpen,
    repeaterState.setImportData
  );

  // Initialize repeater effects
  useRepeaterEffects(
    repeaterState.state,
    repeaterState.updateState,
    repeaterActions.createNewTab,
    repeaterState.setError
  );

  // Use effect to handle tab value updates based on location
  useEffect(() => {
    const tabValue = location.pathname;
    const tabElement = document.querySelector(`[value="${tabValue}"]`);
    if (tabElement) {
      tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Typography variant="h6" component="div" sx={{ mr: 4 }}>
              FART Proxy
            </Typography>
            <Tabs 
              value={location.pathname}
              onChange={(_, newValue) => navigate(newValue)}
              sx={{ flex: 1 }}
            >
              <Tab label="Proxy" value="/" />
              <Tab label="Repeater" value="/repeater" />
              <Tab label="Settings" value="/settings" />
              <Tab label="Log" value="/log" />
            </Tabs>
          </Box>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1, bgcolor: 'background.default' }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProxyTab 
                repeaterState={repeaterState} 
                repeaterActions={repeaterActions} 
              />
            } 
          />
          <Route 
            path="/repeater" 
            element={
              <RepeaterTab 
                repeaterState={repeaterState} 
                repeaterActions={repeaterActions}
              />
            } 
          />
          <Route path="/settings" element={<SettingsTab />} />
          <Route path="/log" element={<LogTab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
