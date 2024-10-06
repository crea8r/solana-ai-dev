import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DesignPage from '../pages/DesignPage';
import CodePage from '../pages/CodePage';
import DocPage from '../pages/DocPage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
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
        path='/doc'
        element={
          <ProtectedRoute>
            <DocPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
