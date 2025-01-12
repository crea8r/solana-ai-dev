import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DesignPage from '../pages/design/DesignPage';
import CodePage from '../pages/code/CodePage';
import DocPage from '../pages/DocsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { ChakraProvider } from '@chakra-ui/react';
import AccountPage from '../pages/AccountPage';
import UIPage from '../pages/ui/UIPage';
import LearnPage from '../pages/learn/LearnPage';
import Roadmap from '../pages/landing/Roadmap';
import LandingPage1 from '../pages/landing/LandingPage1';

const AppRoutes: React.FC = () => {
  return (
    <ChakraProvider>
      <Routes>
        <Route path='/' element={<LandingPage1 />} />
        <Route path='/landing' element={<LandingPage />} />
        <Route path='/roadmap' element={<Roadmap />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route
          path='/design'
          element={
            <ProtectedRoute>
              <DesignPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/code'
          element={
            <ProtectedRoute>
              <CodePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/ui'
          element={
            <ProtectedRoute>
              <UIPage />
            </ProtectedRoute>
          }
        />
        {/* 
        --- add back in later ---
        <Route
          path='/doc'
          element={
            <ProtectedRoute>
              <DocPage />
            </ProtectedRoute>
          }
        />
        */}
        <Route
          path='/learn'
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/account'
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ChakraProvider>
  );
};

export default AppRoutes;
