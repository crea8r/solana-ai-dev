import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import AppContent from './AppContent';
import { initGA, logPageView } from './utils/analytics';

const GA_MEASUREMENT_ID = 'G-L5P6STB24E';

// RouteTracker Component: Tracks and stores the current route in localStorage
const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Store the current route in localStorage for redirecting after refresh
    localStorage.setItem('currentRoute', location.pathname);
  }, [location]);

  return null;
};

// RouteHandler Component: Restores the last saved route and initializes analytics
const RouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Restore the last saved route after refresh
    const savedRoute = localStorage.getItem('currentRoute') || '/';
    if (location.pathname !== savedRoute) {
      navigate(savedRoute, { replace: true });
    }

    // Initialize Google Analytics
    initGA(GA_MEASUREMENT_ID);
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Log the current page view
    logPageView();
  }, [location]);

  return null;
};

// AppContentWrapper Component: Handles authentication state and renders the app content
const AppContentWrapper: React.FC = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>; // Loading indicator until user state is resolved
  }

  return (
    <>
      {/* Track the current route */}
      <RouteTracker />
      {/* Restore route and log analytics */}
      <RouteHandler />
      {/* Render main app content */}
      <AppContent />
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <AppContentWrapper />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
