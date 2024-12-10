import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import AppContent from './AppContent';
import { initGA, logPageView } from './utils/analytics';

const GA_MEASUREMENT_ID = 'G-L5P6STB24E';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('currentRoute', location.pathname);
  }, [location]);

  return null;
};

const RouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedRoute = sessionStorage.getItem('currentRoute') || '/';
    if (location.pathname !== savedRoute) {
      navigate(savedRoute, { replace: true });
    }

    initGA(GA_MEASUREMENT_ID);
  }, [navigate, location.pathname]);

  useEffect(() => {
    logPageView();
  }, [location]);

  return null;
};

const AppContentWrapper: React.FC = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <RouteTracker />
      <RouteHandler />
      <AppContent />
    </>
  );
};

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
