import React, { createContext, useState, useEffect } from 'react';
import authService from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConductor, setIsConductor] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      try {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
          setIsAdmin(user?.role === 'admin');
          setIsConductor(user?.role === 'conductor');
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
          setIsConductor(false);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        authService.logout();
        setCurrentUser(null);
        setIsAdmin(false);
        setIsConductor(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setCurrentUser(response.user);
      setIsAdmin(response.user?.role === 'admin');
      setIsConductor(response.user?.role === 'conductor');
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setCurrentUser(response.user);
      setIsAdmin(response.user?.role === 'admin');
      setIsConductor(response.user?.role === 'conductor');
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    setIsConductor(false);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAdmin,
    isConductor,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};