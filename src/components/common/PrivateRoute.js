import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ adminOnly = false, conductorOnly = false }) => {
  const { isAuthenticated, isAdmin, isConductor, loading } = useAuth();

  if (loading) {
    return <Loader fullPage text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if not an admin but route requires admin role
    return <Navigate to="/" replace />;
  }
  
  if (conductorOnly && !isConductor && !isAdmin) {
    // Redirect to home if not a conductor or admin but route requires conductor role
    // Note: Admin can access conductor routes
    return <Navigate to="/" replace />;
  }

  // Render the child routes
  return <Outlet />;
};

export default PrivateRoute;