import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { TicketProvider } from './contexts/TicketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import MyTasks from './pages/MyTasks';
import Members from './pages/Members';
import Archived from './pages/Archived';
import Settings from './pages/Settings';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F63049',
      light: '#ff5a6f',
      dark: '#d02752',
    },
    secondary: {
      main: '#D02752',
      light: '#e84a6a',
      dark: '#8a244b',
    },
    background: {
      default: '#111F35',
      paper: '#1a2942',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0aec0',
    },
    error: {
      main: '#F63049',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inconsolata", "Inter", "Roboto", "Helvetica", "Arial", monospace',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <ProjectProvider>
            <TicketProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workspace"
                  element={
                    <ProtectedRoute>
                      <Workspace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tasks"
                  element={
                    <ProtectedRoute>
                      <MyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <Members />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/archived"
                  element={
                    <ProtectedRoute>
                      <Archived />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </TicketProvider>
          </ProjectProvider>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
