import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DesignPage from './pages/design/DesignPage';
import CodePage from './pages/code/CodePage';
import DocPage from './pages/DocsPage';
import AccountPage from './pages/AccountPage'; // Import AccountPage
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { ProjectProvider } from './contexts/ProjectContext';
import { DocsProvider } from './contexts/DocsContext';
import { CodeFileProvider } from './contexts/CodeFileContext';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <Router>
        <AuthProvider>
          <ProjectProvider>
            <CodeFileProvider>
              <DocsProvider>
                <Routes>
                  <Route path='/' element={<LandingPage />} />
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='/register' element={<RegisterPage />} />
                  <Route
                    path='/design'
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <DesignPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/code'
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <CodePage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/doc'
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <DocPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path='/account'
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <AccountPage />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </DocsProvider>
            </CodeFileProvider>
          </ProjectProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App;
