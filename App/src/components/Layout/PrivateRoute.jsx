// src/components/Layout/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Se încarcă...</div>; // Sau un Spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
// ...