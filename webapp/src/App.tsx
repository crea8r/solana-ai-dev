// App.tsx
import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './AppContent';
import { initGA, logPageView } from './utils/analytics';

const GA_MEASUREMENT_ID = 'G-L5P6STB24E';

const App: React.FC = () => {
  useEffect(() => {
    initGA(GA_MEASUREMENT_ID);
    logPageView();
  }, []);

  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
