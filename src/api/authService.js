import axiosInstance from './axiosConfig';
import jwtDecode from 'jwt-decode';

const API_PATH = '/auth';

const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post(`${API_PATH}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post(`${API_PATH}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
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

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },
  isConductor: () => {
    const role = authService.getUserRole();
    return role === 'conductor';
  },
  isAdmin: () => {
    const role = authService.getUserRole();
    return role === 'admin';
  }
};

export default authService;