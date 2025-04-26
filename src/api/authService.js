import axiosInstance from './axiosConfig';
import jwtDecode from 'jwt-decode';

const API_PATH = '/auth';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with response data
   */
  register: async (userData) => {
    const response = await axiosInstance.post(`${API_PATH}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - Promise with response data
   */
  login: async (credentials) => {
    const response = await axiosInstance.post(`${API_PATH}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout user - Remove token from storage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        authService.logout();
        return false;
      }
      return true;
    } catch (error) {
      authService.logout();
      return false;
    }
  },

  /**
   * Get user role
   * @returns {string|null} - User role or null
   */
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },
  /**
   * Check if user has conductor role
   * @returns {boolean} - True if user is conductor
   */
  isConductor: () => {
    const role = authService.getUserRole();
    return role === 'conductor';
  },
  /**
   * Check if user has admin role
   * @returns {boolean} - True if user is admin
   */
  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'admin';
  }
};

export default authService;