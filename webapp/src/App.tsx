// App.tsx
import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './AppContent';
import { initGA, logPageView } from './utils/analytics';

const GA_MEASUREMENT_ID = 'G-L5P6STB24E';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem('currentRoute', location.pathname);
  }, [location]);

  return null;
};

const RouteHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedRoute = localStorage.getItem('currentRoute') || '/';
    navigate(savedRoute);
    initGA(GA_MEASUREMENT_ID);
    logPageView();
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <RouteTracker />
          <RouteHandler />
          <AppContent />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
