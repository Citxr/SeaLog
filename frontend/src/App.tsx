import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ShipsList from './components/operator/ShipsList';
import RoutesList from './components/operator/RoutesList';
import ReportsList from './components/operator/Reports';
import CaptainRoutes from './components/captain/RoutesList';
import FishingSpots from './components/captain/FishingSpots';
import CaptainReports from './components/captain/Reports';
import OperatorDashboard from './components/operator/OperatorDashboard';
import CaptainDashboard from './components/captain/CaptainDashboard';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  console.log('PrivateRoute check:', { isAuthenticated, userRole, requiredRole });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log('Wrong role, redirecting to login');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};



function App() {
  const { isAuthenticated, userRole } = useAuth();
  
  console.log('App render:', { isAuthenticated, userRole });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={userRole === 'operator' ? '/app/operator' : '/app/captain'} />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={userRole === 'operator' ? '/app/operator' : '/app/captain'} />} />
          <Route path="/app" element={<Layout />}>
            <Route path="operator">
              <Route index element={
                <PrivateRoute requiredRole="operator">
                  <OperatorDashboard />
                </PrivateRoute>
              } />
              <Route path="ships" element={
                <PrivateRoute requiredRole="operator">
                  <ShipsList />
                </PrivateRoute>
              } />
              <Route path="routes" element={
                <PrivateRoute requiredRole="operator">
                  <RoutesList />
                </PrivateRoute>
              } />
              <Route path="reports" element={
                <PrivateRoute requiredRole="operator">
                  <ReportsList />
                </PrivateRoute>
              } />
            </Route>
            <Route path="captain">
              <Route index element={
                <PrivateRoute requiredRole="captain">
                  <CaptainDashboard />
                </PrivateRoute>
              } />
              <Route path="routes" element={
                <PrivateRoute requiredRole="captain">
                  <CaptainRoutes />
                </PrivateRoute>
              } />
              <Route path="spots" element={
                <PrivateRoute requiredRole="captain">
                  <FishingSpots />
                </PrivateRoute>
              } />
              <Route path="reports" element={
                <PrivateRoute requiredRole="captain">
                  <CaptainReports />
                </PrivateRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
