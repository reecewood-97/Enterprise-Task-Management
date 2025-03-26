import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import store from './redux/store';

// Components
import Router from './routes';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import Notifications from './components/common/Notifications';

/**
 * Enterprise Task Management System App Component
 */
function App() {
  // Create theme based on user preferences (could be extended to support dark mode)
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
      },
      typography: {
        fontFamily: [
          'Roboto',
          'Arial',
          'sans-serif',
        ].join(','),
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
    });
  }, []);

  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <ErrorBoundary>
            <ScrollToTop />
            <Notifications />
            <Router />
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;
